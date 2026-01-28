<template>
  <div
    class="agenda-view"
    :class="{
      'hide-last-table-button': !(
        committeeHeads && committeeHeads.includes(USER.id)
      ),
    }"
  >
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('committee.committee_management')"
      :subPage="$t('agenda.agendas')"
      :titlePage="$t('agenda.agendas')"
    >
      <template #datatable>
        <DataTable
          ref="table"
          id="agenda-example-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :editItem="editItem"
          :openForm="openForm"
          :hideActions="hideActions"
          :hideAddNewButton="!isCommitteeHead"
          :filters="filterData"
        >
          <template #created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template #created_by="{ item }">
            <a
              v-if="item.created_by"
              href="#"
              @click.prevent="openAssigneeDetailsModal(item.created_by)"
              class="badge badge-user text-decoration-none"
            >
              {{ users[item.created_by]?.full_name || $t('agenda.not_available') }}
            </a>
            <span v-else>{{ $t('agenda.not_available') }}</span>
          </template>

          <template #is_open="{ item }">
            <span
              v-if="item.is_open === 'true'"
              class="badge badge-green text-decoration-none"
              style="display: block; margin: auto"
              >{{ $t("common.open") }}</span
            >
            <span
              v-else
              class="badge badge-red text-decoration-none"
              style="display: block; margin: auto"
              >{{ $t("common.closed") }}</span
            >
          </template>

          <template #status="{ item }">
            <span
              v-if="item.status === 'draft'"
              class="badge badge-grey text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.draft") }}
            </span>
            <span
              v-if="item.status === 'in_review'"
              class="badge badge-yellow text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.in_review") }}
            </span>
            <span
              v-else-if="item.status === 'confirmed'"
              class="badge badge-green text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.confirmed") }}
            </span>
            <span
              v-else-if="item.status === 'rejected'"
              class="badge badge-red text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.rejected") }}
            </span>
            <span
              v-else-if="item.status === 'deferred'"
              class="badge badge-moove text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.deferred") }}
            </span>
          </template>

          <template #topics="{ item }">
            <a
              href="#"
              @click.prevent="relatedAgendaTopics(item.id)"
              class="badge badge-user text-decoration-none"
            >
              <span>
                {{ item.topics ? item.topics.length : 0 }}
                {{ $t("topic.topics") }}
              </span>
            </a>
          </template>

          <template #appointments="{ item }">
            {{
              formatSameDayRange(
                item?.meeting?.start_date,
                item?.meeting?.end_date
              ) || ""
            }}
          </template>

          <template #name="{ item }">
            <router-link
              :to="{ path: `/agenda-details/${item.id}` }"
              class="badge badge-purple text-decoration-none"
            >
              {{ item.name }}
            </router-link>
          </template>

          <template #addAction="{ item }">
            <a
              href="javascript:void(0)"
              @click.prevent="openFilesModal(item)"
              class="dropdown-item"
            >
              <i class="icofont icofont-file-document p-1"></i>
              {{ $t("agenda.files") }}
            </a>
          </template>
        </DataTable>
      </template>

      <template #form>
        <Form
          :schema="fromFields"
          :newItem="newItem"
          :api="api"
          :closeForm="closeForm"
          :formData="true"
        >
          <template #files="{ item }">
            <div class="col-md-12 mt-5" v-if="!newItem?.id">
              <v-file-input
                :label="$t('agenda.agenda_files')"
                id="uploadedFileInput"
                chips
                multiple
                clearable
                @change="handleFileChange"
                @click:clear="clearUploadedFile"
              />
            </div>
            <div v-else></div>
          </template>

          <template #committee_id="{ item }">
            <input type="hidden" v-model="newItem.committee_id" />
          </template>
        </Form>
      </template>
    </main-page>

    <ViewUserDetails
      :viewUserModal="viewUserModal"
      :userData="userData"
      @close="viewUserModal = false"
      @update:viewUserModal="viewUserModal = $event"
    />

    <FileActionsModal
      :visible="showFileModal"
      :files="selectedFiles"
      :loading="isFileActionLoading"
      :loadingFileId="loadingFileId"
      @close="showFileModal = false"
      @edit="handleFileEdit"
      @delete="handleFileDelete"
      @upload="handleFileUpload"
      @edit-start="loadingFileId = $event"
      @edit-cancel="loadingFileId = null"
      @delete-start="loadingFileId = $event"
    />
  </div>
</template>

<script>
import agenda from "@/API/Agenda/Agenda";
import Committee from "@/API/Committee/Committee";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import Department from "@/API/Department/Department";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import Topic from "@/API/Topic/Topic";
import FileActionsModal from "@/components/commen/FileActionsModal.vue";
import Auth from "@/API/Auth";
import { filter } from "jszip";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ViewUserDetails,
    FileActionsModal,
  },

  setup() {
    const USER = Auth.USER;
    const api = new agenda();
    const apiParams = { with: ["topics", "meeting"] };
    const tableColumns = [];
    const fromFields = [];
    const userApi = new User();
    const departmentApi = new Department();
    const topicApi = new Topic();
    const committeeApi = new Committee();

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      departmentApi,
      topicApi,
      committeeApi,
      USER,
    };
  },

  async mounted() {
    await this.fetchUsers();
    await this.fetchCommitteeHeads();
    await this.fetchDepartments();
    await this.fetchTopics();
  },

  data() {
    return {
      filterData: [
        {
          title: this.$t("agenda.open_to_members"),
          key: "is_open",
          type: "string",
          data: [
            { id: "true", name: this.$t("common.open") },
            { id: "false", name: this.$t("common.closed") },
          ],
          filterType: "filter",
        },
        {
          title: this.$t("common.status"),
          key: "status",
          type: "string",
          data: [
            { id: "draft", name: this.$t("common.draft") },
            { id: "in_review", name: this.$t("common.in_review") },
            { id: "confirmed", name: this.$t("common.confirmed") },
            { id: "rejected", name: this.$t("common.rejected") },
            { id: "deferred", name: this.$t("common.deferred") },
          ],
          filterType: "filter",
        },
      ],
      isFlipped: false,
      isReadonly: false,
      newItem: {
        committee_id: null,
      },
      nowDate: new Date().toISOString().split("T")[0],
      users: [],
      usersForComponants: [],
      userData: [],
      departments: [],
      allDepartments: [],
      allTopics: [],
      agendaData: {},
      selectedAgendaTopics: {},
      filters: {
        is_open: "",
        status: "",
      },
      viewUserModal: false,
      viewTopicsModal: false,
      isOpen: false,
      selectedFiles: [],
      isFileActionLoading: false,
      showFileModal: false,
      selectedAgenda: {},
      committeeHeads: [],
      agendaStatus: [],
      viewStatusModal: false,
      statusLoading: false,
      statusOptions: [
        { name: this.$t("common.draft"), id: "draft" },
        { name: this.$t("common.in_review"), id: "in_review" },
        { name: this.$t("common.confirmed"), id: "confirmed" },
        { name: this.$t("common.rejected"), id: "rejected" },
      ],
    };
  },

  created() {
    this.apiParams.filter = `committee_id|${this.$route.params.id}`;

    this.tableColumns = [
      {
        id: "name",
        title: this.$t("common.name"),
        data: "name",
        defaultContent: this.$t("agenda.not_available"),
      },
      {
        id: "created_at",
        title: this.$t("common.created_at"),
        data: "created_at",
        defaultContent: this.$t("agenda.not_available"),
      },
      {
        id: "created_by",
        title: this.$t("common.created_by"),
        data: "created_by",
        defaultContent: this.$t("agenda.not_available"),
      },
      {
        id: "is_open",
        title: this.$t("agenda.is_open"),
        data: "is_open",
        defaultContent: this.$t("agenda.not_available"),
      },
      {
        id: "status",
        title: this.$t("common.status"),
        data: "status",
        defaultContent: this.$t("agenda.not_available"),
      },
      {
        id: "appointments",
        title: this.$t("agenda.appointments"),
        data: null,
        defaultContent: this.$t("agenda.not_available"),
      },
      {
        id: "topics",
        title: this.$t("topic.topics"),
        data: null,
        defaultContent: this.$t("agenda.not_available"),
      },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("common.name"),
        type: "text",
        rules: "required",
        col: 12,
      },
      {
        name: "description",
        label: this.$t("common.description"),
        type: "textarea",
        rules: "",
        col: 12,
      },
      {
        name: "files",
      },
      {
        name: "committee_id",
      },
      {
        name: "is_open",
        label: this.$t("agenda.open_to_all_members"),
        type: "checkbox",
        rules: "",
        col: 12,
      },
    ];
  },

  computed: {
    hideActions() {
      return (row) => {
        const canEdit =
          this.committeeHeads && this.committeeHeads.includes(this.USER.id);
        const canDelete =
          this.committeeHeads && this.committeeHeads.includes(this.USER.id);

        return {
          edit: !canEdit,
          delete: !canDelete,
        };
      };
    },
    isCommitteeHead() {
      return this.committeeHeads.includes(Auth.USER.id);
    },
  },

  methods: {
    formatSameDayRange(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      const isSameDay =
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

      if (!isSameDay) {
        return "";
      }

      const day = String(startDate.getDate()).padStart(2, "0");
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const year = startDate.getFullYear();
      const dateStr = `${day}/${month}/${year}`;

      const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? this.$t("agenda.pm") : this.$t("agenda.am");
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
      };

      const startTime = formatTime(startDate);
      const endTime = formatTime(endDate);

      return `${dateStr} ${this.$t("agenda.from")} ${startTime} ${this.$t("agenda.to")} ${endTime}`;
    },

    openForm() {
      this.isFlipped = true;
      this.newItem.committee_id = this.$route.params.id;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
    },

    handleFileChange(event) {
      const files = event.target.files;
      if (files) {
        this.newItem.files = files;
      }
    },

    clearUploadedFile() {
      this.newItem.files = [];
    },

    formatDate(date) {
      if (!date) return this.$t("agenda.not_available");

      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      const hours = d.getHours() % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = d.getHours() >= 12 ? this.$t("agenda.pm") : this.$t("agenda.am");

      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    },

    async fetchUsers() {
      try {
        const usersResponse = await this.userApi.getAll({
          select: "id|full_name|type|department_id|phone|username|email",
        });
        this.usersForComponants = usersResponse;
        this.users = usersResponse.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});
      } catch (error) {
        console.error(this.$t("agenda.failed_to_load_users"), error);
      }
    },

    async openAssigneeDetailsModal(selectedAssigneeId) {
      this.userData = { ...this.users[selectedAssigneeId] };
      try {
        this.userDepartment =
          this.departments[this.userData.department_id] ?? this.$t("agenda.not_available");
        this.userData.department = this.userDepartment || this.$t("agenda.not_available");
        this.viewUserModal = true;
      } catch (error) {
        console.error(this.$t("agenda.failed_to_fetch_department"), error);
      }
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name|ola_leader",
        });

        this.departments = deptResponse.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});

        this.allDepartments = deptResponse;
      } catch (error) {
        console.error(this.$t("agenda.failed_to_load_departments"), error);
      }
    },

    async fetchTopics() {
      try {
        const topicsResponse = await this.topicApi.getAll({
          filter: `topic_id|-null|=`,
          with: ["subTopics:id,name,topic_id"],
          select: "id|name|committee_id|topic_id",
        });

        this.allTopics = topicsResponse;
        console.log(this.$t("agenda.topics_response_label"), topicsResponse);
      } catch (error) {
        console.error(this.$t("agenda.failed_to_load_topics"), error);
      }
    },

    openFilesModal(item) {
      this.selectedAgenda = { ...item };

      this.selectedFiles =
        !this.selectedAgenda.files ||
        (this.selectedAgenda.files.length === 1 &&
          this.getFileNameFromPath(this.selectedAgenda.files[0]) == "files")
          ? []
          : this.selectedAgenda.files || [];

      this.showFileModal = true;
    },

    async handleFileUpload(file) {
      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedAgenda };
        delete updatedData.status;
        const updatedFiles = [...this.selectedFiles, file];

        this.selectedFiles = updatedFiles;
        updatedData.files = updatedFiles;

        const response = await this.api.update(updatedData);

        if (response.status == "success") {
          this.selectedAgenda = response.data;
          this.selectedFiles = this.selectedAgenda.files || [];
          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("agenda.file_upload_success"));
        } else {
          throw new Error(
            response.message || this.$t("agenda.file_upload_failed")
          );
        }
      } catch (error) {
        console.error(this.$t("agenda.file_upload_error"), error);
        this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
        this.api.poup(null, this.$t("agenda.file_upload_try_again"));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    async handleFileEdit(file) {
      const oldFileName = this.getFileName(file.oldFile);
      const newFile = file.newFile;

      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedAgenda };
        delete updatedData.status;
        const updatedFiles = this.selectedFiles.filter(
          (f) => f !== file.oldFile
        );
        updatedFiles.push(newFile);

        this.selectedFiles = updatedFiles;
        updatedData.files = updatedFiles;
        console.log(this.$t("agenda.updated_data_label"), updatedData);

        const response = await this.api.update(updatedData);
        console.log(this.$t("agenda.response_label"), response);

        if (response.status == "success") {
          this.selectedAgenda = response.data;
          this.selectedFiles = this.selectedAgenda.files || [];
          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("agenda.file_updated"));
        } else {
          throw new Error(
            response.message || this.$t("agenda.file_update_failed")
          );
        }

        console.log(this.$t("agenda.file_updated_label"), oldFileName, "->", newFile.name);
        console.log(this.$t("agenda.selected_agenda_label"), this.selectedAgenda);
      } catch (error) {
        console.error(this.$t("agenda.file_update_error"), error);
        this.selectedFiles = [
          ...this.selectedFiles.filter((f) => f !== newFile),
          file.oldFile,
        ];
        this.api.poup(response, this.$t("agenda.file_update_try_again"));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    getFileNameFromPath(url) {
      return url.split("/").pop();
    },

    async handleFileDelete(fileData) {
      const fileToDelete = fileData.file;
      const fileName = this.getFileName(fileToDelete);
      let response = null;

      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedAgenda };
        delete updatedData.status;
        const updatedFiles = this.selectedFiles.filter(
          (f) => f !== fileToDelete
        );

        const finalFiles = updatedFiles.map((file) => {
          if (typeof file === "string") return this.getFileNameFromPath(file);
          return file;
        });

        updatedData.files =
          finalFiles.length === 1 && finalFiles[0] == null ? [] : finalFiles;

        this.selectedFiles = updatedData.files;

        response = await this.api.update(updatedData);

        if (response.status === "success") {
          this.selectedAgenda = response.data;
          this.selectedFiles =
            !this.selectedAgenda.files ||
            (this.selectedAgenda.files.length === 1 &&
              this.getFileNameFromPath(this.selectedAgenda.files[0]) == "files")
              ? []
              : this.selectedAgenda.files || [];

          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("agenda.file_deleted"));
        } else {
          throw new Error(
            response.message || this.$t("agenda.file_delete_failed")
          );
        }

        console.log(this.$t("agenda.file_deleted_label"), fileName);
        console.log(this.$t("agenda.selected_agenda_label"), this.selectedAgenda);
      } catch (error) {
        console.error(this.$t("agenda.file_delete_error"), error);
        this.selectedFiles = [...this.selectedFiles, fileToDelete];
        this.api.poup(null, this.$t("agenda.file_delete_try_again"));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    getFileName(file) {
      if (!file) return "";
      if (file.name) return file.name;
      if (file.filePath) return file.filePath.split("/").pop();
      if (typeof file === "string") return file.split("/").pop();
      return this.$t("agenda.unknown");
    },

    relatedAgendaTopics(agendaId) {
      this.$router.push(`/agenda-details/${agendaId}`);
      localStorage.removeItem(`activeTab_agenda_${agendaId}`);
      localStorage.setItem(`activeTab_agenda_${agendaId}`, "TopicTab");
    },

    async fetchCommitteeHeads() {
      try {
        const committeeResponse = await this.committeeApi.getAll({
          select: "id|name|chairperson_id|vice_chair_id|secretary_id",
          filter: `id|${this.$route.params.id}|=`,
        });

        if (committeeResponse && committeeResponse.length > 0) {
          const committee = committeeResponse[0];
          this.committeeHeads = [
            committee.chairperson_id,
            committee.vice_chair_id,
            committee.secretary_id,
          ].filter((id) => !!id);
        }

        console.log(this.$t("agenda.committee_heads_label"), this.committeeHeads);
      } catch (error) {
        console.error(
          this.$t("agenda.failed_to_load_committee_members"),
          error
        );
      }
    },

    openChangeStatusModal(selectedRow) {
      this.agendaStatus = { ...selectedRow };
      console.log(this.$t("agenda.agenda_status_label"), this.agendaStatus);
      this.viewStatusModal = true;
    },

    async changeStatus(agendaData) {
      this.statusLoading = true;
      try {
        const response = await this.api.update(agendaData);
        if (response.status == "success") {
          this.$refs.table.refreshTable();
          this.viewStatusModal = false;
          this.api.poup(response, this.$t("agenda.status_changed"));
        }
      } catch (error) {
        console.error(this.$t("agenda.status_update_error"), error);
      } finally {
        this.statusLoading = false;
      }
    },
  },

  watch: {
    filters: {
      deep: true,
      handler(newFilter) {
        const filtersObject = [];
        filtersObject.push(`committee_id|${this.$route.params.id}|=`);

        if (newFilter.is_open) {
          filtersObject.push(`is_open|${newFilter.is_open}-string|=`);
        }
        if (newFilter.status) {
          filtersObject.push(`status|${newFilter.status}|=`);
        }

        this.apiParams.filter = filtersObject.join("&&");
        this.$refs.table.refreshTable();
      },
    },
  },
};
</script>

<style scoped>
.badge-purple {
  background: #d0b5e3;
  color: #43235c;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-user {
  background-color: #d0b5e3;
  color: #43235c;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-green {
  background-color: #b6caae;
  color: #255f0b;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-red {
  background-color: #e2b6b6;
  color: #a92525;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-grey {
  background-color: #d9d9d9;
  color: #404040;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-yellow {
  background-color: #ebdcb3;
  color: #c4951b;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-moove {
  background-color: #e3f2fd;
  color: #0d47a1;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

[class*="text-success"],
[class*="text-warning"],
[class*="text-danger"],
[class*="text-primary"] {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  display: inline-block;
}

.text-primary {
  background-color: rgba(0, 123, 255, 0.1);
}

.hide-last-table-button ::v-deep(.dt-buttons button:last-child) {
  display: none !important;
}
</style>