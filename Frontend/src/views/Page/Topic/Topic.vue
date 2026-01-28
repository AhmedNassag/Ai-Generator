<template>
  <div class="topic-view">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('committee.committee_mngt')"
      :subPage="$t('topic.topics')"
      :titlePage="$t('topic.topics')"
    >
      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <!-- Filter Section -->
        <div class="mb-3">
          <div class="row">
            <!-- Type Filter -->
            <div class="col-md-6 col-lg-6 mb-3">
              <label for="type">{{ $t("common.type") }}</label>
              <select id="type" class="form-control" v-model="filter.type">
                <option v-if="currentRouteName !== 'committeeDetails'" value="">
                  {{ $t("common.all") }}
                </option>
                <option value="mainTopics">
                  {{ $t("topic.main_topics") }}
                </option>
                <option value="subTopics">{{ $t("topic.sub_topics") }}</option>
              </select>
            </div>

            <!-- Main Topic Filter -->
            <div
              class="col-md-6 col-lg-6 mb-3"
              v-if="currentRouteName !== 'committeeDetails'"
            >
              <label for="mainTopicFilter">{{ $t("topic.main_topics") }}</label>
              <select
                id="mainTopicFilter"
                class="form-control"
                v-model="filter.topic_id"
              >
                <option value="">{{ $t("common.all") }}</option>
                <option
                  v-for="topic in mainTopics"
                  :key="topic.id"
                  :value="topic.id"
                >
                  {{ topic.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <DataTable
          ref="table"
          id="topic-example-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :editItem="editItem"
          :openForm="openForm"
          :dataModifier="modifyTableData"
          :hideAddNewButton="!canMakeActionOnTopic"
          :hideActionsColumn="!canMakeActionOnTopic"
          :hideActions="hideActions"
          :filters="filterData"
        >
          <!-- Customizing the display of the 'Name' column in the table -->
          <template #created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template #main_topic="{ item }">
            {{ getTopicNameById(item) }}
          </template>

          <!-- Type Column with Colored Badges -->
          <template #type="{ item }">
            <span v-if="item.topic_id" class="badge badge-red">
              {{ $t("topic.sub_topic") }}
            </span>
            <span v-else class="badge badge-green">
              {{ $t("topic.main_topic") }}
            </span>
          </template>
          <template #created_by="{ item }">
            <a
              v-if="item.created_by"
              href="#"
              @click.prevent="openAssigneeDetailsModal(item.created_by)"
              class="badge badge-user text-decoration-none"
            >
              {{ getUserNameById(item.created_by) || "N/A" }}
            </a>
            <span v-else>N/A</span>
          </template>
          <template #owner="{ item }">
            <!-- <a
              v-if="item.owner_id"
              href="#"
              @click.prevent="openAssigneeDetailsModal(item.owner_id)"
              class="badge badge-user text-decoration-none"
            >
              {{ getUserNameById(item.owner_id) || "N/A" }}
            </a> -->
            <span v-if="item?.owner_id?.length > 0">
              <AvatarGroup
                :users="getMemberUsers(item.owner_id)"
                :maxVisible="3"
                :spacing="20"
              />
            </span>

            <span v-else class="badge badge-user text-decoration-none"
              >N/A</span
            >
          </template>
          <template #agenda="{ item }">
            <router-link
              :to="{ path: `/agenda-details/${item.agenda_id}` }"
              class="badge badge-user text-decoration-none"
              v-if="item.agenda_id && item?.agenda?.name"
            >
              {{ item?.agenda?.name }}
            </router-link>
            <div class="badge badge-user text-decoration-none" v-else>N/A</div>
          </template>

          <!-- <template #committee="{ item }">
            <router-link
              v-if="item.committee_id || item?.main_topic?.committee_id"
              :to="{ path: `/committee-details/${item.committee_id}` }"
              class="text-primary"
            >
              {{
                item.committee != null
                  ? item?.committee?.name
                  : item?.main_topic?.committee?.name
              }}
            </router-link>
            <div v-else>N/A</div>
          </template> -->

          <template #committee="{ item }">
            <router-link
              v-if="item.committee_id || item?.main_topic?.committee_id"
              :to="{
                path: `/committee-details/${
                  item.committee_id || item?.main_topic?.committee_id
                }`,
              }"
              class="badge badge-user text-decoration-none"
            >
              {{ item?.committee?.name || item?.main_topic?.committee?.name }}
            </router-link>
            <div v-else>N/A</div>
          </template>

          <template #addAction="{ item }">
            <div v-if="canMakeActionOnTopic">
              <a
                href="javascript:void(0)"
                @click.prevent="openFilesModal(item)"
                class="dropdown-item"
              >
                <i class="icofont icofont-file-document p-1"></i>
                {{ $t("topic.files") }}
              </a>
            </div>
            <div v-else></div>
          </template>
        </DataTable>
      </template>

      <!-- Slot for rendering the form -->
      <template #form>
        <TopicForm
          :newItem="newItem"
          :editItem="editItem"
          :closeForm="closeForm"
          :users="users"
          :committees="committees"
          :mainTopics="mainTopics"
        />
      </template>
    </main-page>

    <!-- View user details modal -->
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
      :canUpload="isCreator || isOwner || isStakeholder"
      :canEdit="isCreator || isOwner || isStakeholder"
      :canDelete="isCreator || isOwner || isStakeholder"
    />
  </div>
</template>

<script>
// Importing necessary components and API modules
import topic from "@/API/Topic/Topic";
import User from "@/API/User/User";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import Auth from "@/API/Auth";
import Committee from "@/API/Committee/Committee";
import Department from "@/API/Department/Department";
import TopicForm from "./TopicForm.vue";
import FileActionsModal from "@/components/commen/FileActionsModal.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue"; // Importing the view user details component
import Agenda from "@/API/Agenda/Agenda";
import AvatarGroup from "@/components/AvatarGroup.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    VueSelect,
    TopicForm,
    FileActionsModal,
    ViewUserDetails,
    AvatarGroup,
  },

  setup() {
    const USER = Auth.USER;
    // Initialize API and other required properties
    const api = new topic();
    const userApi = new User();
    const committeeApi = new Committee();
    const departmentApi = new Department();
    const agendaApi = new Agenda();
    const apiParams = {
      with: [
        "mainTopic",
        "committee:id,name",
        "mainTopic.committee",
        "subTopics",
        "agenda:id,name",
      ],
    };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      committeeApi,
      departmentApi,
      agendaApi,
      USER,
    };
  },

  watch: {
    // Watch for changes in newItem.topic_id to update conditional fields visibility
    "newItem.topic_id": {
      handler(newValue) {
        if (newValue && newValue != null) {
          this.isSubTopic = true;
          //  this.fromFields.find((field) => field.name === "stakeholder-ids")?.disabled = true;
        } else {
          this.isSubTopic = false;
        }
      },
      immediate: true,
    },
  },

  async mounted() {
    await this.fetchUsers();
    await this.fetchMainTopics();
    await this.fetchDepartments();
    await this.fetchCommittes();
  },
  data() {
    return {
      filterData: [
        {
          title: "Committee",
          key: "committee_id",
          type: "string",
          data: "Committee",
          id: "id",
          display: "name",
          filterType: "filter",
        },
        {
          title: "Agenda",
          key: "agenda_id",
          type: "string",
          data: "Agenda",
          id: "id",
          display: "name",
          filterType: "filter",
        },
      ],
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      mainTopics: [],
      users: [],
      committees: [],
      risks: [],
      controls: [],
      departments: [],
      usersForDetails: [],
      departmentsForDetails: [],
      isSubTopic: false,
      filter: {
        type: "",
        topic_id: "",
      },
      currentRouteName: this.$route.name,
      selectedFiles: [],
      isFileActionLoading: false,
      viewUserModal: false,
      showFileModal: false,
      selectedTopic: {},
      userData: [],
      isModalOpen: false,
      isOwner: false,
      isCreator: false,
      isStakeholder: false,
      // agendas: [],
      // agendasOfTopic: [],
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        // if (!Array.isArray(this.kpiData)) {
        return {
          edit: !this.canMakeActionOnTopic,
          delete: !this.canMakeActionOnTopic,
        };
      };
    },

    canMakeActionOnTopic() {
      if (this.$route.name !== "committeeDetails") {
        return false;
      }
      const committee = this.committees.find(
        (committee) => committee.id === this.$route.params.id
      );
      const committeeMembers = [
        committee?.chairperson_id,
        committee?.secretary_id,
        committee?.vice_chair_id,
        ...(committee?.member_ids || []),
      ];
      return committeeMembers.includes(Auth?.USER?.id);
    },
  },

  created() {
    if (this.$route.name == "committeeDetails") {
      // this.apiParams.filterOr = `mainTopic.committee_id|${this.$route.params.id}`;
      // this.apiParams.filterOr = `committee_id|${this.$route.params.id}||mainTopic.committee_id|${this.$route.params.id}`;
      // this.apiParams.filterWhereRelation = [
      //   `mainTopic@committee_id|${this.$route.params.id}|=`,
      // ];

      this.apiParams.filter = `committee_id|${this.$route.params.id}|=`;

      this.filter.type = "mainTopics";
      this.tableColumns = [
        {
          id: "name",
          title: this.$t("common.name"),
          data: "name",
          defaultContent: "N/A",
        },
        {
          id: "type",
          title: this.$t("common.type"),
          data: "",
          defaultContent: "N/A",
        },
        {
          id: "main_topic",
          title: this.$t("topic.main_topic"),
          data: "",
          defaultContent: "N/A",
        },
        {
          id: "created_at",
          title: this.$t("common.created_at"),
          data: "created_at",
          defaultContent: "N/A",
        },
        {
          id: "created_by",
          title: this.$t("common.created_by"),
          data: "created_by",
          defaultContent: "N/A",
        },
        {
          id: "owner",
          title: this.$t("topic.owner"),
          data: "owner_id",
          defaultContent: "N/A",
        },
        {
          id: "agenda",
          title: this.$t("topic.agenda"),
          data: "",
          defaultContent: "N/A",
        },
      ];
    } else {
      // Initialize the table columns and form fields when the component is created
      this.tableColumns = [
        {
          id: "name",
          title: this.$t("common.name"),
          data: "name",
          defaultContent: "N/A",
        },
        {
          id: "type",
          title: this.$t("common.type"),
          data: "",
          defaultContent: "N/A",
        },
        {
          id: "main_topic",
          title: this.$t("topic.main_topic"),
          data: "",
          defaultContent: "N/A",
        },
        {
          id: "committee",
          title: this.$t("committee.committee"),
          data: null,
          defaultContent: "N/A",
        },
        {
          id: "created_at",
          title: this.$t("common.created_at"),
          data: "created_at",
          defaultContent: "N/A",
        },
        {
          id: "created_by",
          title: this.$t("common.created_by"),
          data: "created_by",
          defaultContent: "N/A",
        },
        {
          id: "owner",
          title: this.$t("topic.owner"),
          data: "owner_id",
          defaultContent: "N/A",
        },
        {
          id: "agenda",
          title: this.$t("topic.agenda"),
          data: "",
          defaultContent: "N/A",
        },
      ];
    }

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("common.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("topic.enter_name_description"),
        col: 6, // Column size in the form layout
        placeholder: this.$t("topic.enter_name_placeholder"),
      },
      {
        type: "options", // Dropdown/select field
        name: "topic_id",
        label: this.$t("topic.main_topic"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("topic.select_owner_description"),
      },
      {
        name: "committee_id",
      },
      {
        name: "department_id",
      },
      {
        name: "owner_id",
        col: 6,
      },

      {
        name: "control_id",
      },
      {
        name: "risk_id",
      },
      {
        name: "stakeholder_ids",
      },
      {
        name: "topic_files",
      },
      {
        name: "description",
        label: this.$t("common.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        col: 12,
      },
    ];
  },

  methods: {
    getMemberUsers(memberIds) {
      if (!memberIds || !Array.isArray(memberIds)) return [];
      const owners = this.users.filter((user) => memberIds.includes(user.id));
      return owners || [];
    },
    getCommitteeNameById(id) {
      const committee = this.committees.find((c) => c.id === id);
      return committee ? committee.name : "N/A";
    },
    getTopicNameById(subTopic) {
      // const topic = this.mainTopics.find((t) => t.id === id);
      const topic = subTopic?.main_topic?.name;
      return subTopic?.main_topic?.name ?? "N/A";
    },
    getUserNameById(userId) {
      const user = this.users.find((u) => u.id === userId);
      const name = user?.full_name || "BBBB";
      return name;
    },
    formatDate(date) {
      if (!date) return "N/A";

      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      const hours = d.getHours() % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = d.getHours() >= 12 ? "PM" : "AM";

      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
      // return `${day}/${month}/${year}`;
    },
    calculateObjectivesCount(item) {
      const uniqueObjectives = new Set();

      item.objectives.forEach((objective) => {
        uniqueObjectives.add(objective.id); // or objective.name if no ID
      });

      return uniqueObjectives.size;
    },
    getFileName(filePath) {
      if (!filePath) return "";
      // If it's a URL, extract the filename
      if (filePath.includes("/")) {
        return filePath.split("/").pop();
      }
      // If it's just a filename
      return filePath;
    },
    // Handle topic files change event
    handleFileChange(event) {
      const files = event.target.files;
      if (files) {
        this.newItem.topic_files = files;
      }
    },
    onMainTopicChange(value) {
      if (value) {
        this.isSubTopic = true;
      } else {
        this.isSubTopic = false;
      }
    },
    // Open the form for adding or editing an item
    openForm() {
      this.newItem.created_by = Auth.USER?.id;

      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
      this.fetchMainTopics();
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = { ...data }; // Set the current item to edit
      delete this.newItem.created_by;
      this.isFlipped = true; // Show the form for editing
    },

    // Open the file modal for a topic
    openFilesModal(item) {
      this.selectedTopic = { ...item };
      this.isOwner = this.selectedTopic?.owner_id === this.USER.id;
      this.isCreator = this.selectedTopic?.created_by === this.USER.id;
      this.isStakeholder =
        this.selectedTopic?.stakeholder_ids?.includes(this.USER.id) || false;
      // Handle both [null] and [default URL] cases by converting to empty array
      this.selectedFiles =
        !this.selectedTopic.topic_files ||
        (this.selectedTopic.topic_files.length === 1 &&
          this.getFileNameFromPath(this.selectedTopic.topic_files[0]) ==
            "topic_files")
          ? []
          : this.selectedTopic.topic_files || [];

      this.showFileModal = true;
    },

    // Add this new method to handle file uploads:
    async handleFileUpload(file) {
      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedTopic };
        const updatedFiles = [...this.selectedFiles, file];

        // Update local state immediately for better UX
        this.selectedFiles = updatedFiles;
        updatedData.topic_files = updatedFiles;

        const response = await this.api.update(updatedData);

        if (response.status == "success") {
          this.selectedTopic = response.data;
          this.selectedFiles = this.selectedTopic.topic_files || [];
          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("topic.file_upload_success"));
        } else {
          throw new Error(
            response.message || this.$t("topic.file_upload_failed")
          );
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        // Revert local changes if API call fails
        this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
        this.api.poup(null, this.$t("topic.file_upload_error"));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    async handleFileEdit(file) {
      const oldFileName = this.getFileName(file.oldFile);
      const newFile = file.newFile;

      try {
        // Show loading state
        this.isFileActionLoading = true;

        // Create updated data
        const updatedData = { ...this.selectedTopic };
        const updatedFiles = this.selectedFiles.filter(
          (f) => f !== file.oldFile
        );
        updatedFiles.push(newFile);

        // Update local state
        this.selectedFiles = updatedFiles;
        updatedData.topic_files = updatedFiles;
        console.log("*-*-*-updatedData*-*-*:", updatedData);

        const response = await this.api.update(updatedData);

        if (response.status == "success") {
          this.selectedTopic = response.data;
          this.selectedFiles = this.selectedTopic.topic_files || [];
          this.$refs.table.refreshTable(); // Refresh the table data
          this.api.poup(response, this.$t("topic.file_update_success"));
        } else {
          throw new Error(
            response.message || this.$t("topic.file_update_failed")
          );
        }

        console.log("File updated:", oldFileName, "->", newFile.name);
        console.log("selectedTopic:", this.selectedTopic);
      } catch (error) {
        console.error("Error updating file:", error);
        // Revert local changes if API call fails
        this.selectedFiles = [
          ...this.selectedFiles.filter((f) => f !== newFile),
          file.oldFile,
        ];
        this.api.poup(response, this.$t("topic.file_update_error"));
      } finally {
        // Hide loading state
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

        const updatedData = { ...this.selectedTopic };
        const updatedFiles = this.selectedFiles.filter(
          (f) => f !== fileToDelete
        );

        const finalFiles = updatedFiles.map((file) => {
          if (typeof file === "string") return this.getFileNameFromPath(file);
          return file;
        });

        // Handle [null] case by converting to empty array
        updatedData.topic_files =
          finalFiles.length === 1 && finalFiles[0] == null ? [] : finalFiles;

        this.selectedFiles = updatedData.topic_files;

        response = await this.api.update(updatedData);

        if (response.status === "success") {
          this.selectedTopic = response.data;
          // Handle [null] case by converting to empty array
          this.selectedFiles =
            !this.selectedTopic.topic_files ||
            (this.selectedTopic.topic_files.length === 1 &&
              this.getFileNameFromPath(this.selectedTopic.topic_files[0]) ==
                "topic_files")
              ? []
              : this.selectedTopic.topic_files || [];

          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("topic.file_delete_success"));
        } else {
          throw new Error(
            response.message || this.$t("topic.file_delete_failed")
          );
        }

        console.log("File deleted:", fileName);
        console.log("selectedTopic:", this.selectedTopic);
      } catch (error) {
        console.error("Error deleting file:", error);
        this.selectedFiles = [...this.selectedFiles, fileToDelete];
        this.api.poup(null, this.$t("topic.file_delete_error"));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    getFileName(file) {
      if (!file) return "";
      if (file.name) return file.name;
      if (file.filePath) return file.filePath.split("/").pop();
      if (typeof file === "string") return file.split("/").pop();
      return this.$t("common.unknown");
    },

    async fetchMainTopics() {
      try {
        const mainTopicsResponse = await this.api.getAll({
          filter: `topic_id|null-null|=`,
          select: "id|name|committee_id",
        });

        this.mainTopics = mainTopicsResponse;
        console.log("this.mainTopics:", this.mainTopics);

        // Update options dynamically in the form field
        const mainTopicsField = this.fromFields.find(
          (field) => field.name === "topic_id"
        );

        mainTopicsField.options = this.mainTopics.map((mainTopic) => ({
          id: mainTopic.id,
          name: mainTopic.name,
        }));
      } catch (error) {
        console.error(this.$t("topic.load_main_topics_error"), error);
      }
    },

    async fetchUsers() {
      try {
        const usersResponse = await this.userApi.getAll({
          select: "id|full_name|type|department_id|phone|username|email",
        });
        // this.usersForComponants = usersResponse;
        this.users = usersResponse;
        this.usersForDetails = usersResponse.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});

        const ownerField = this.fromFields.find(
          (field) => field.name === "owner_id"
        );
        ownerField.options = this.users.map((user) => ({
          id: user.id,
          name: user.full_name,
        }));

        const stakeholderField = this.fromFields.find(
          (field) => field.name === "stakeholder_ids"
        );
        stakeholderField.options = this.users.map((user) => ({
          id: user.id,
          name: user.full_name,
        }));
      } catch (error) {
        console.error(this.$t("topic.load_users_error"), error);
      }
    },

    async fetchCommittes() {
      try {
        const committeesResponse = await this.committeeApi.getAll({
          select:
            "id|name|chairperson_id|vice_chair_id|secretary_id|member_ids",
        });
        this.committees = committeesResponse;
        const committeeField = this.fromFields.find(
          (field) => field.name === "committee_id"
        );
        committeeField.options = this.committees.map((committee) => ({
          id: committee.id,
          name: committee.name,
        }));
      } catch (error) {
        console.error(this.$t("topic.load_committees_error"), error);
      }
    },
    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name",
        });
        this.departments = deptResponse;

        const departmentField = this.fromFields.find(
          (field) => field.name === "department_id"
        );

        departmentField.options = this.departments.map((depart) => ({
          id: depart.id,
          name: depart.name,
        }));

        this.departmentsForDetails = deptResponse.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});

        this.allDepartments = deptResponse;
      } catch (error) {
        console.error(this.$t("topic.load_departments_error"), error);
      }
    },

    async openAssigneeDetailsModal(selectedAssigneeId) {
      this.userData = { ...this.usersForDetails[selectedAssigneeId] };
      try {
        this.userDepartment =
          this.departmentsForDetails[this.userData.department_id] ?? "N/A";
        this.userData.department = this.userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error(this.$t("topic.fetch_department_error"), error);
      }
    },

    modifyTableData(data) {
      if (this.$route.name == "committeeDetails") {
        console.log("-----modifyTableData----", data);
        const committeeId = this.$route.params.id;

        return data.filter((item) => {
          // Check if item has committee_id that matches
          if (item.committee_id === committeeId) return true;

          // Check if item has main_topic with committee_id that matches
          if (item.main_topic && item.main_topic.committee_id === committeeId)
            return true;

          // For main topic items themselves (like index 4 in your example)
          if (item.sub_topics && item.sub_topics.length > 0) {
            // This is a main topic - check its committee_id
            return item.committee_id === committeeId;
          }

          return false;
        });
      }
      return data;
    },
  },

  watch: {
    // Watch for changes in the filter object
    filter: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        // Construct the filter string for apiParams
        const filtersObject = [];
        this.apiParams.filterWhereRelation = []; // Reset any previous relation filters
        if (newFilter.type) {
          console.log("newFilter.type: ", newFilter.type);
          if (newFilter.type == "mainTopics") {
            if (this.$route.name == "committeeDetails")
              filtersObject.push(
                `committee_id|${this.$route.params.id}|=`
              ); // Exclude topics without committee_id
            else filtersObject.push(`topic_id|null-null|=`);
          }
          else if(newFilter.type == "subTopics") {
            // filtersObject.push(`committee_id|null-null|=`);
            if (this.$route.name == "committeeDetails")
              this.apiParams.filterWhereRelation = [
                `mainTopic@committee_id|${this.$route.params.id}|=`,
              ];
            else filtersObject.push(`topic_id|null-null|!=`);
          }
        }
        // if (newFilter.topic_id && this.currentRouteName !== "committeeDetails") {
        //   filtersObject.push(`topic_id|${newFilter.topic_id}|=`);
        // }

        // Update apiParams with the new filter
        this.apiParams.filter = filtersObject.join("&&");

        this.$refs?.table?.refreshTable(); // Refresh the table to apply the new filter
      },
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
[class*="text-success"],
[class*="text-warning"],
[class*="text-danger"],
[class*="text-primary"] {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  display: inline-block;
}

/* Scoped styles for the component */
.text-primary {
  background-color: rgba(0, 123, 255, 0.1);
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

/* Type Badges */
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
</style>
