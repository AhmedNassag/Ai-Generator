<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('changerequest.Governance')"
    :mainSubPage="this.$t('changerequest.changerequest')"
    :subPage="this.$t('changerequest.changerequest')"
    v-permission:show
  >
    <template #filter>
      <v-row>
        <v-col cols="6">
          <label for="type">{{ $t("changerequest.status") }}</label>
          <v-select
            id="type"
            label="text"
            :options="statusOptions"
            v-model="statusFilter"
            :reduce="(item) => item.value"
            clearable
            default-value="All"
            placeholder="All"
          >
          </v-select>
        </v-col>

        <v-col cols="6">
          <label for="type">{{ $t("changerequest.createdBy") }}</label>
          <v-select
            id="type"
            label="text"
            :options="createdByOptions"
            v-model="createdByFilter"
            :reduce="(item) => item.value"
            clearable
            default-value="All"
            placeholder="All"
          >
          </v-select>
        </v-col>
      </v-row>
      <hr />
    </template>

    <!-- Slot for rendering the DataTable -->
    <div v-permission:update v-permission:delete></div>
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :hideActions="hideActions"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>

        <template #file="{ item }">
          <v-btn
            v-if="item.file"
            @click="downloadFile(item)"
            color="primary"
            variant="outlined"
            size="small"
            density="compact"
          >
            <v-icon start size="18">mdi-download</v-icon>
            {{ $t("changerequest.download") }}
          </v-btn>
          <span v-else>{{ $t("changerequest.noFile") }}</span>
        </template>

        <template #createdBy="{ item }">
          <span class="badge bg-primary me-2">
            {{ getCreatorName(item.created_by) }}
          </span>
        </template>

        <template #status="{ item }">
          <v-chip :color="getStatusColor(item.status)" class="text-white" dark>
            {{ item.status }}
          </v-chip>
        </template>

        <template #created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template #description="{ item }">
          <div v-html="item.description"></div>
        </template>

        <template #addAction="{ item }">
          <li v-if="canMakeDecision(item)">
            <a
              @click="openModal(item)"
              class="dropdown-item text-secondary"
              href="javascript:void(0)"
            >
              <i class="icofont icofont-law-document me-2"></i>
              {{ $t("changerequest.makeDecision") }}
            </a>
          </li>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      ></Form>
    </template>
  </main-page>

  <!-- Descision request dialog -->
  <v-dialog v-model="viewModal" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h6">{{ $t("changerequest.makeDecision") }}</h1>
        <v-btn icon @click="viewModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <label>{{ $t("changerequest.decision") }}</label>
        <v-radio-group v-model="decision" row>
          <v-radio label="Approve" value="Approved"></v-radio>
          <v-radio label="Reject" value="Rejected"></v-radio>
        </v-radio-group>

        <label v-if="decision === 'Rejected'">{{
          $t("changerequest.reasonForRejection")
        }}</label>
        <v-textarea
          v-if="decision === 'Rejected'"
          v-model="rejectReason"
          rows="3"
          outlined
          class="mt-3"
        ></v-textarea>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="viewModal = false">{{
          $t("changerequest.close")
        }}</v-btn>
        <v-btn
          color="primary"
          :disabled="decision === 'Rejected' && !rejectReason"
          @click="submitDescision"
        >
          {{ $t("changerequest.submit") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// Importing necessary components and API modules
import changerequest from "@/API/ChangeRequest/ChangeRequest";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Auth from "@/API/Auth";
import SystemSetting from "@/API/SystemSetting/SystemSetting";
import Department from "@/API/Department/Department";
import axios from "axios";
import User from "@/API/User/User";
import VueSelect from "vue-select";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    "v-select": VueSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new changerequest();
    const systemSetting = new SystemSetting();
    const department = new Department();
    const userapi = new User();
    // const apiParams = { with: "creator.department" };
    const apiParams = {
      with: [],
      search: "",
    };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      systemSetting,
      department,
      userapi,
    };
  },

  async mounted() {
    const systemSettingDepartmentId = await this.systemSetting.getAll({
      filter: `type|change_requests_responsible_department_id|=`,
    });
    this.systemSettingDepartmentId = systemSettingDepartmentId[0]?.data;

    const departmentManagers = await this.fetchDepartmentManagers(
      this.systemSettingDepartmentId
    );
    this.currentUserIsInResponsibleDepartment = departmentManagers.includes(
      Auth.USER.id
    );

    const DepartmentId = await this.department.show(
      this.systemSettingDepartmentId
    );
    this.DepartmentManagerId = DepartmentId?.manager_id ?? null;

    const departmentsResponse = await this.department.getAll({
      select: "id|name",
    });
    this.departments = departmentsResponse;

    this.loadStatusOptions();

    const usersResponse = await this.userapi.getAll({
      select: "id|full_name",
    });
    this.users = usersResponse;
    this.createdByOptions = usersResponse.map((user) => ({
      value: user.id,
      text: user.full_name,
    }));

    this.allDepartmentsManagersIds = await this.fetchAllDepartmentManagersIds();
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item

      systemSettingDepartmentId: "",
      DepartmentManagerId: "",
      viewModal: false,
      changeRequestData: null,
      rejectReason: "",
      decision: "",
      departments: [],

      statusFilter: "",
      statusOptions: [],

      createdByOptions: [],
      createdByFilter: null,

      departmentManagers: [],
      allDepartmentsManagersIds: [],
      currentUserIsInResponsibleDepartment: false,
      users:[],
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const currentUserId = Auth.USER.id;
        let editableStatus = null;

        if (row.start_review_cycle === "Department-Manager-Review") {
          editableStatus = "Department-Manager-In-Review";
        } else if (row.start_review_cycle === "Responsible-Department-Review") {
          editableStatus = "Responsible-Department-In-Review";
        }

        const cannotEditOrDelete = !(
          currentUserId === row.created_by && row.status === editableStatus
        );

        return {
          edit: cannotEditOrDelete,
          delete: cannotEditOrDelete,
        };
      };
    },
  },
  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        title: this.$t("changerequest.title"),
        data: "title",
        defaultContent: "N/A",
      },
      {
        id: "description",
        title: this.$t("changerequest.description"),
        data: "description",
        defaultContent: "N/A",
      },
      {
        id: "createdBy",
        title: this.$t("changerequest.createdBy"),
        data: "createdBy",
        defaultContent: "N/A",
      },
      {
        id: "file",
        title: this.$t("changerequest.file"),
        data: "file",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("changerequest.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        title: this.$t("changerequest.reason"),
        data: "reason",
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("changerequest.created_at"),
        data: "created_at",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "title",
        label: this.$t("changerequest.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your title.",
        col: 6, // Column size in the form layout
      },
      {
        name: "description",
        label: this.$t("changerequest.description"),
        type: "textarea", // Text input field for email
        rules: "required", // Validation rule: required and valid email format
        description: "Please enter a valid email address.",
        col: 6,
      },

      {
        name: "file",
        label: this.$t("changerequest.file"),
        type: "file",
        rules: "",
        description: "Please select changerequest file.",
        col: 6,
      },
    ];
  },

  methods: {
    getCreatorName(creatorId) {
      const creator = this.users.find((user) => user.id === creatorId);
      return creator ? creator.full_name : "N/A";
    },
    formatDate(date) {
      if (!date) return "N/A";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date));
    },

    async downloadFile(item) {
      try {
        const response = await axios.get(`changeRequest/${item.id}/download`, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "file.png");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Download failed:", error);
      }
    },

    openModal(selectedRow) {
      this.changeRequestData = { ...selectedRow };
      this.viewModal = true;
      console.log("this.changeRequestData", this.changeRequestData);
    },

    // Open the form for adding or editing an item
    openForm() {
      if (!this.currentUserIsInResponsibleDepartment) {
        this.isFlipped = true;
      } else {
        this.isFlipped = false;
        this.api.poup(
          {
            status: false,
            message:
              "You Don't Have Ability To Create ChangeRequest You Are a Change request Responsible Department",
          },
          "Error"
        );
      }
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    canMakeDecision(item) {
      try {
        const currentUserId = Auth.USER.id;
        if (
          this.currentUserIsInResponsibleDepartment &&
          item.review_cycle === "Responsible-Department-Review" &&
          ![
            "Responsible-Department-Accepted",
            "Responsible-Department-Rejected",
          ].includes(item.status)
        ) {
          return true;
        }

        if (
          this.allDepartmentsManagersIds.includes(currentUserId) &&
          item.review_cycle === "Department-Manager-Review" &&
          item.status !== "Department-Manager-Rejected"
        ) {
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error fetching department managers:", error);
        return false;
      }
    },

    async fetchDepartmentManagers(changeRequestsResponsibleDepartmentId) {
      try {
        const response = await axios.get(
          `/departments/${changeRequestsResponsibleDepartmentId}/managers`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching department managers:", error);
        return [];
      }
    },

    async fetchAllDepartmentManagersIds() {
      try {
        const response = await axios.get("/departments/managers");
        return response.data;
      } catch (error) {
        console.error("Error fetching all department managers:", error);
        return [];
      }
    },

    submitDescision() {
      axios
        .post(`/makeDecision`, {
          id: this.changeRequestData.id,
          decision: this.decision,
          reason: this.rejectReason,
        })
        .then((response) => {
          this.viewModal = false;
          this.$refs.table.refreshTable();
          this.rejectReason = "";
          this.api.poup(response, "Successfuly !");
        })
        .catch((error) => {
          console.log(error);
          this.api.poup(
            { status: false, message: error.response?.data?.message },
            "Error"
          );
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getStatusColor(status) {
      const statusColors = {
        "Responsible-Department-In-Review": "blue-darken-2",
        "Responsible-Department-Rejected": "red-darken-2",
        "Responsible-Department-Approved": "green-darken-2",
        "Department-Manager-In-Review": "indigo-darken-2",
        "Department-Manager-Rejected": "deep-orange-darken-2",
        "Department-Manager-Approved": "teal-darken-2",
      };

      return statusColors[status] || "grey-darken-2";
    },

    loadStatusOptions() {
      this.statusOptions = [
        {
          value: "Responsible-Department-In-Review",
          text: "Responsible-Department-In-Review",
        },
        {
          value: "Responsible-Department-Accepted",
          text: "Responsible-Department-Accepted",
        },
        {
          value: "Responsible-Department-Rejected",
          text: "Responsible-Department-Rejected",
        },
        {
          value: "Department-Manager-In-Review",
          text: "Department-Manager-In-Review",
        },
        {
          value: "Department-Manager-Rejected",
          text: "Department-Manager-Rejected",
        },
        {
          value: "Department-Manager-Approved",
          text: "Department-Manager-Approved",
        },
      ];
    },
  },

  watch: {
    statusFilter: {
      deep: true,
      async handler(newFilter) {
        const filters = [];
        if (newFilter && newFilter !== null) {
          filters.push(`status|${newFilter}|=`);
        }
        this.apiParams.filter = filters.length ? filters.join("&&") : null;
        this.$refs.table.refreshTable();
      },
    },

    createdByFilter: {
      deep: true,
      async handler(newFilter) {
        const filters = [];
        if (newFilter && newFilter !== null) {
          filters.push(`created_by|${newFilter}|=`);
        }
        this.apiParams.filter = filters.length ? filters.join("&&") : null;
        this.$refs.table.refreshTable();
      },
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
