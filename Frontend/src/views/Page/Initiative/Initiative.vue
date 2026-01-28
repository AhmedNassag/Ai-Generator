<template>
  <div id="initiative-view" class="container-fluid">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('initiative.initiative')"
      :subPage="$t('initiative.initiative')"
      :titlePage="$t('initiative.initiative')"
      v-permission:show
    >

      <div v-permission:update v-permission:delete></div>

      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <DataTable
          ref="table"
          id="initiative-example-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :editItem="editItem"
          :openForm="openForm"
        >
          <template #initiative.name="{ item }">
            <router-link :to="{ path: `/initiative-details/${item.id}` }" style="cursor: pointer; color: #232388;">
            {{ item.name }}
            </router-link>
          </template>
          <template #initiative.duration="{ item }">
            <!-- {{ item.startDate }} <v-icon icon="mdi-arrow-right"></v-icon> {{ item.endDate }} -->
            {{ calculateDuration(item.startDate, item.endDate) }}
          </template>
          <template #initiative.owner="{ item }">
            <v-btn
              size="small"
              color="info"
              @click="openOwnerDetailsModal(item)"
              :disabled="ownerDetailsLoading"
            >
              <v-icon icon="mdi-eye" class="me-1"></v-icon>
            </v-btn>
          </template>
          <template #initiative.status="{ item }">
            <div v-html="getInitiativeStatus(item)" v-permission:show></div>
          </template>
          <template #initiative.riskLevel="{ item }">
            <div v-html="getRiskLevel(item)" v-permission:show></div>
          </template>
            <template #initiative.programNumbers="{ item }">
            <router-link
              :to="{
                path: `/initiative-details/${item.id}`,
                query: { tabName: 'programs' },
              }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.programs?.length || 0 }}
            </router-link>
          </template>
            <template #initiative.projectNumbers="{ item }">
            <router-link
              :to="{
                path: `/initiative-details/${item.id}`,
                query: { tabName: 'projects' },
              }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.projects?.length || 0 }}
            </router-link>
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
        >
          <template #ownerType="item">
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <label for="ownerType" class="form-label">
                  {{ $t("initiative.ownerType") }}
                </label>
                <VueSelect
                  label="ownerType"
                  :rules="[required]"
                  :options="ownerType"
                  v-model="newItem.ownerType"
                  placeholder="Select owner type"
                  :reduce="(item) => item.id"
                  @update:modelValue="selectOwnerType"
                />
                <small class="form-text text-muted">
                  {{ $t("initiative.Select") }}
                </small>
              </div>
            </div>
          </template>

          <!-- Dynamic owner selector based on ownerType -->
          <template #owner_id="item">
            <div class="col-sm-12 col-md-6 mb-4">
              <div v-if="newItem?.ownerType == 'user'" class="form-group">
                <label for="owner_id" class="form-label">{{ $t("initiative.owner_id") }}</label>
                <VueSelect
                  label="full_name"
                  :options="users || []"
                  v-model="newItem.owner_user_ids"
                  placeholder="Select users"
                  :reduce="(item) => item?.id"
                  multiple
                  @update:modelValue="handleOwnerUsersChange"
                />
                <small class="form-text text-muted">
                  {{ $t("initiative.Select") }}
                </small>
              </div>
              <div v-if="newItem?.ownerType == 'team'" class="form-group">
                <label for="owner_id" class="form-label">{{$t("initiative.owner_id")}}</label>
                <VueSelect
                  label="name"
                  :options="teams || []"
                  v-model="newItem.owner_team_ids"
                  placeholder="Select team"
                  :reduce="(item) => item?.id"
                  multiple
                  @update:modelValue="handleOwnerTeamsChange"
                />
                <small class="form-text text-muted">
                  {{ $t("initiative.Select") }}
                </small>
              </div>
            </div>
          </template>
        </Form>
      </template>
    </main-page>

    <!-- Start Owner Details Modal -->
    <v-dialog v-model="ownerDetailsModal.show" max-width="600">
      <v-card>
        <v-card-title>{{ $t("initiative.Owner Details") }}</v-card-title>
        <v-card-text>
          <!-- Show loading spinner if owner is in progress -->
          <div v-if="ownerDetailsLoading" class="text-center py-4">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
            <div class="mt-2">{{ $t("initiative.Processing Owner Details") }}...</div>
          </div>

          <v-list v-else>
            <v-list-item
              @click="!ownerDetailsLoading"
              :class="bg - blue - lighten - 5"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-arrow-right" class="me-2"></v-icon>
              </template>
              <!-- <v-list-item-title>
              <v-chip size="small" color="error" class="me-2">{{ currentOwner.name }}</v-chip>
              {{ currentOwner.to_step_name }}
            </v-list-item-title> -->
              <v-list-item-title>
                <v-chip size="small" color="error" class="me-2"
                  >currentOwner.name</v-chip
                >
                {{ $t("initiative.currentOwner") }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="ownerDetailsModal.show = false"
            >{{ $t("initiative.Close") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- End Owner Details Modal -->
  </div>
</template>

<script>
// Importing necessary components and API modules
import initiative from "@/API/Initiative/Initiative";
import objective from "@/API/Objective/Objective";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    VueSelect,
  },
   props: {
    objective_id: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    // Initialize API and other required properties
    const api = new initiative();
      const relations = [
      // "objectives",
      "programs",
      "projects",
    ];
    const apiParams = { with: relations };

    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const objectiveApi = new objective();
    const userApi = new User();
    const teamApi = new Team();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      objectiveApi,
      userApi,
      teamApi,
    };
  },

  async mounted() {
    // Fetch objectives
    this.objectives = await this.objectiveApi.getAll({ select: "id|name" });
    const objectiveIdsField = this.fromFields.find(
      (field) => field.name === "objective_ids"
    );
    objectiveIdsField.options = this.objectives.map((objective) => ({
      id: objective.id,
      name: objective.name,
    }));

    // Fetch initiatives
    this.initiativesData = await this.api.getAll({ select: "id|name" });
    const initiativeIdsField = this.fromFields.find(
      (field) => field.name === "initiative_ids"
    );
    initiativeIdsField.options = this.initiativesData.map((initiative) => ({
      id: initiative.id,
      name: initiative.name,
    }));

    // Fetch owner
    this.users = await this.userApi.getAll({ select: "id|full_name" });
    this.teams = await this.teamApi.getAll({ select: "id|name" });

    // Fetch stakeholder
    this.stakeholders = this.users;
    const stakeholderIdsField = this.fromFields.find(
      (field) => field.name === "stakeholder_ids"
    );
    stakeholderIdsField.options = this.stakeholders.map((stakeholder) => ({
      id: stakeholder.id,
      name: stakeholder.full_name,
    }));
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: { status: "Draft" }, // Data object to store the currently selected item for editing or new item
      objectives: [],
      initiativesData: [],
      ownerType: [
        { id: "user", ownerType: "User" },
        { id: "team", ownerType: "Team" },
      ],
      users: [],
      teams: [],
      stakeholders: [],
      ownerDetailsModal: {
        show: false,
        currentItem: null,
      },
      currentOwner: [],
      ownerDetailsLoading: false,
      ownerModal: {
        show: false,
      },
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id: "initiative.name",
        title: this.$t("initiative.name"),
        data: "name",
        defaultContent: "N/A",
      },
      { 
        id: "initiative.owner",
        title: this.$t("initiative.owner"),
        data: "",
        defaultContent: "N/A"
      },
      {
        id: "initiative.duration",
        title: this.$t("initiative.duration"),
        data: "",
        defaultContent: "N/A",
      },
      { 
        id: "initiative.status",
        title: this.$t("initiative.status"),
        data: "",
        defaultContent: "N/A"
      },
      {
        id: "initiative.riskLevel",
        title: this.$t("initiative.riskLevel"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "initiative.programNumbers",
        title: this.$t("initiative.programNumbers"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "initiative.projectNumbers",
        title: this.$t("initiative.projectNumbers"),
        data: "",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        section: this.$t("initiative.Main Details"),
        name: "name",
        label: this.$t("initiative.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("initiative.Please enter name"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("initiative.Main Details"),
        type: "options", // Dropdown/select field
        name: "objective_ids",
        label: this.$t("initiative.objectives"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "", // Validation: required selection
        description: this.$t("initiative.Select"),
        multiple: true,
      },
      {
        section: this.$t("initiative.Main Details"),
        name: "startDate",
        label: this.$t("initiative.startDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("initiative.Please enter start date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("initiative.Main Details"),
        name: "endDate",
        label: this.$t("initiative.endDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("initiative.Please enter end date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("initiative.Main Details"),
        type: "options", // Dropdown/select field
        name: "initiative_ids",
        label: this.$t("initiative.dependencies"),
        options: this.initiativesData,
        optionLabel: "name",
        col: 6,
        rules: "", // Validation: required selection
        description: this.$t("initiative.Select"),
        multiple: true,
      },
      {
        section: this.$t("initiative.Main Details"),
        type: "options", // Dropdown/select field
        name: "riskLevel",
        label: this.$t("initiative.risk level"),
        options: [
          {
            id: "Low",
            name: "Low",
          },
          {
            id: "Medium",
            name: "Medium",
          },
          {
            id: "High",
            name: "High",
          },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("initiative.Select"),
      },
            {
        section: this.$t("initiative.Main Details"),
        type: "options", // Dropdown/select field
        name: "stakeholder_ids",
        label: this.$t("initiative.stakeholders"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "", // Validation: required selection
        description: this.$t("initiative.Select"),
        multiple: true,
      },
      {
        section: this.$t("initiative.Main Details"),
        type: "options", // Dropdown/select field
        name: "ownerType",
        label: this.$t("initiative.owner"),
        options: [
          {
            id: "User",
            name: "User",
          },
          {
            id: "Team",
            name: "Team",
          },
        ],
        optionLabel: "name",
        col: 6,
        rules: "", // Validation: required selection
        description: this.$t("initiative.Select"),
      },
      {
        section: this.$t("initiative.Main Details"),
        name: "owner_id",
        col: 6,
      },
      {
        section: this.$t("initiative.Main Details"),
        name: "expectedOutcome",
        label: this.$t("initiative.expectedOutcome"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("initiative.Please enter expected outcome"),
        col: 12,
      },
      {
        section: this.$t("initiative.Main Details"),
        name: "mitigationPlan",
        label: this.$t("initiative.mitigationPlan"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("initiative.Please enter mitigation plan"),
        col: 12,
      },
      {
        section: this.$t("initiative.Main Details"),
        name: "description",
        label: this.$t("initiative.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("initiative.Please enter description"),
        col: 12,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      if(this.$route.name === "ObjectiveDetails") this.newItem.objective_ids = [this.$route.params.id];
      this.isFlipped = true; // Show the form
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

    handleOwnerUsersChange(value) {
      if (!this.newItem) return;
      if (Array.isArray(value)) {
        this.newItem.owner_user_ids = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (value === null || value === undefined) {
        this.newItem.owner_user_ids = [];
      } else {
        this.newItem.owner_user_ids = [value];
      }
    },

    handleOwnerTeamsChange(value) {
      if (!this.newItem) return;
      if (Array.isArray(value)) {
        this.newItem.owner_team_ids = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (value === null || value === undefined) {
        this.newItem.owner_team_ids = [];
      } else {
        this.newItem.owner_team_ids = [value];
      }
    },

    selectOwnerType(value) {
      if (!this.newItem) return;
      this.newItem.owner_user_ids = null;
      this.newItem.owner_team_ids = null;
    },

    getInitiativeStatus(item) {
      const status = item.status;
      let label = "";
      let badgeClass = "";
      let iconClass = "";
      if (status == "Draft") {
        label = "Draft";
        badgeClass = "bg-primary";
        // iconClass = "fas fa-check";
      } else if (status == "Under Review") {
        label = "Under Review";
        badgeClass = "bg-primary";
        // iconClass = "fas fa-close";
      } else if (status == "Approved") {
        label = "Approved";
        badgeClass = "bg-success";
        // iconClass = "fas fa-check";
      } else if (status == "In Progress") {
        label = "In Progress";
        badgeClass = "bg-warning";
        // iconClass = "fas fa-clock";
      } else if (status == "On Hold") {
        label = "On Hold";
        badgeClass = "bg-info";
        // iconClass = "fas fa-clock";
      } else if (status == "Completed") {
        label = "Completed";
        badgeClass = "bg-success";
        // iconClass = "fas fa-thumbs-up";
      } else if (status == "Cancelled") {
        label = "Cancelled";
        badgeClass = "bg-danger";
        // iconClass = "fas fa-close";
      }
      return `<span class="text-center badge ${badgeClass}" style="display: inline-flex; align-items: center; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
          <i class="${iconClass} me-1"></i>${label}
        </span>`;
    },

    getRiskLevel(item) {
      const riskLevel = item.riskLevel;
      let label = "";
      let badgeClass = "";
      let iconClass = "";
      if (riskLevel == "Low") {
        label = "Low";
        badgeClass = "bg-primary";
        // iconClass = "fas fa-long-arrow-down";
      } else if (riskLevel == "Medium") {
        label = "Medium";
        badgeClass = "bg-warning";
        // iconClass = "fas fa-arrows-h";
      } else if (status == "High") {
        label = "High";
        badgeClass = "bg-danger";
        // iconClass = "fas fa-long-arrow-up";
      } else {
        label = "N/A";
        badgeClass = "bg-light";
        // iconClass = "fas fa-arrows-alt";
      }
      return `<span class="text-center badge ${badgeClass}" style="display: inline-flex; align-items: center; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
          <i class="${iconClass} me-1"></i>${label}
        </span>`;
    },

    openOwnerDetailsModal(item) {
      this.ownerDetailsModal.currentItem = item;
      // this.currentOwner = this.getOwnerDetails(item);
      this.ownerDetailsLoadingLoading = false;
      this.ownerDetailsModal.show = true;
    },

    openOwnerModal() {
      this.ownerModal.show = true;
    },

    calculateDuration(start, end) {
      if (!start || !end) return "N/A";
      const startDate = new Date(start);
      const endDate = new Date(end);
      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();
      // Adjust months and years if the end day is less than the start day
      if (days < 0) {
        months -= 1;
        days += new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          0
        ).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years > 0) {
        return years === 1 ? "1 year" : `${years} years`;
      } else if (months > 0) {
        return months === 1 ? "1 month" : `${months} months`;
      } else {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
      }
    },
  },

  watch: {
    "newItem.owner_user_ids": {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          const cleaned = newVal.filter(
            (item) => item !== null && item !== undefined
          );
          if (cleaned.length !== newVal.length) {
            this.$nextTick(() => {
              if (this.newItem) {
                this.newItem.owner_user_ids = cleaned;
              }
            });
          }
        }
      },
      deep: true,
    },

    "newItem.owner_team_ids": {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          const cleaned = newVal.filter(
            (item) => item !== null && item !== undefined
          );
          if (cleaned.length !== newVal.length) {
            this.$nextTick(() => {
              if (this.newItem) {
                this.newItem.owner_team_ids = cleaned;
              }
            });
          }
        }
      },
      deep: true,
    },
    //     objective_id: {
    //   handler(newVal) {
    //     console.log('objective_id changed:', newVal);
    //   this.apiParams.filterIn = "objective_ids|" + newVal;

    //     // Refresh the table when prop changes
    //     if (this.$refs.table) {
    //       this.$refs.table.refreshTable();
    //     }
    //   },
    //   immediate: true,
    // },
  },
};
</script>

<style>
#initiative-view .page-title {
  display: none;
}
#initiative-view .flipper {
  min-height: 1000px !important;
}
</style>
