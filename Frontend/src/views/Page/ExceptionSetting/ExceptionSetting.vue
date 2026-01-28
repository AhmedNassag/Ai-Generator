<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('exceptionsetting.Configuration')"
    :mainSubPage="$t('exceptionsetting.Exception Setting')"
    :titlePage="$t('exceptionsetting.Exception Setting')"
    v-permission:show
  >

    <div v-permission:update v-permission:delete></div>

    <!-- Conditionally render DataTable if there is no data -->
    <template #datatable v-if="!hasData">
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
      >
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
        <!-- policy_acceptor_type -->
        <template #policy_acceptor_type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="policy_acceptor_type">{{ $t("exceptionsetting.Policy Acceptor Type") }}</label>
            <select
              class="form-select"
              id="policy_acceptor_type"
              aria-label="Default select example"
              v-model="newItem.policy_acceptor_type"
            >
              <option value="owner" selected>{{ $t("exceptionsetting.Owner") }}</option>
              <option value="user">{{ $t("exceptionsetting.User") }}</option>
            </select>
          </div>
        </template>

        <!-- policy_acceptor_id -->
        <template #policy_acceptor_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="policy_acceptor_id">{{ $t("exceptionsetting.Policy Acceptor") }}</label>
            <UserSelect
              v-model="newItem.policy_acceptor_id"
              :placeholder="$t('exceptionsetting.Select')"
              :disabled="isPolicyAcceptorIdDisabled"
            />
          </div>
        </template>

        <!-- risk_acceptor_type -->
        <template #risk_acceptor_type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="risk_acceptor_type">{{ $t("exceptionsetting.Risk Acceptor Type") }}</label>
            <select
              class="form-select"
              id="risk_acceptor_type"
              aria-label="Default select example"
              v-model="newItem.risk_acceptor_type"
            >
              <option value="owner" selected>{{ $t("exceptionsetting.Owner") }}</option>
              <option value="user">{{ $t("exceptionsetting.User") }}</option>
            </select>
          </div>
        </template>

        <!-- risk_acceptor_id -->
        <template #risk_acceptor_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="risk_acceptor_id">{{ $t("exceptionsetting.Risk Acceptor") }}</label>
            <UserSelect
              v-model="newItem.risk_acceptor_id"
              :placeholder="$t('exceptionsetting.Select')"
              :disabled="isRiskAcceptorIdDisabled"
            />
          </div>
        </template>

        <!-- control_acceptor_type -->
        <template #control_acceptor_type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="control_acceptor_type">{{ $t("exceptionsetting.control Acceptor Type") }}</label>
            <select
              class="form-select"
              id="control_acceptor_type"
              v-model="newItem.control_acceptor_type"
            >
              <option value="owner">{{ $t("exceptionsetting.Owner") }}</option>
              <option value="user">{{ $t("exceptionsetting.User") }}</option>
            </select>
          </div>
        </template>

        <!-- control_acceptor_id -->
        <template #control_acceptor_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="control_acceptor_id">{{ $t("exceptionsetting.Control Acceptor") }}</label>
            <UserSelect
              v-model="newItem.control_acceptor_id"
              :placeholder="$t('exceptionsetting.Select')"
              :disabled="isControlAcceptorIdDisabled"
            />
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import exceptionsetting from "@/API/ExceptionSetting/ExceptionSetting";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import user from "@/API/User/User";
import UserSelect from "@/components/UserSelect.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    UserSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new exceptionsetting();
    const apiParams = {
      filter: `type|exceptions|=`
    };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const userApi = new user();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
    };
  },

  async mounted() {
    // Fetch data
    this.fetchData();
  },

  data() {
    return {
      isFlipped: true, // To control form flip (show/hide form)
      newItem: { type: "exceptions" },
      isPolicyAcceptorIdDisabled: true, // Flag to disable the assignee select initially
      isRiskAcceptorIdDisabled: true, // Flag to disable the assignee select initially
      isControlAcceptorIdDisabled: true, // Flag to disable the assignee select initially
      hasData: false, // Flag to track if API returned data
      exceptionSettings: [], // Store API response data
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "policy_acceptor_type", title: this.$t("exceptionsetting.policy_acceptor_type"), data: "policy_acceptor_type", defaultContent: "N/A" },
      { id: "policyAcceptor", title: this.$t("exceptionsetting.policyAcceptor"), data: "_USERSERVICE._User.policy_acceptor_id.full_name", defaultContent: "N/A" },
      { id: "risk_acceptor_type", title: this.$t("exceptionsetting.risk_acceptor_type"), data: "risk_acceptor_type", defaultContent: "N/A" },
      { id: "riskAcceptor", title: this.$t("exceptionsetting.riskAcceptor"), data: "_USERSERVICE._User.risk_acceptor_id.full_name", defaultContent: "N/A" },
      { id: "control_acceptor_type", title: this.$t("exceptionsetting.control_acceptor_type"), data: "control_acceptor_type", defaultContent: "N/A" },
      { id: "controlAcceptor", title: this.$t("exceptionsetting.controlAcceptor"), data: "_USERSERVICE._User.control_acceptor_id.full_name", defaultContent: "N/A" },
    ];

    // Define the form fields schema by validation rules, types, and descriptions
    this.fromFields = [
      {
        type: "options", // Dropdown/select field
        name: "policy_acceptor_type",
        label: this.$t("exceptionsetting.policy Acceptor Type"),
        options: [
          { id: "owner", name: "Owner" },
          { id: "user", name: "User" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("exceptionsetting.Select Options for Policy Acceptor Type"),
      },
      {
        type: "user-select", // Dropdown/select field
        name: "policy_acceptor_id",
        label: this.$t("exceptionsetting.policy acceptor"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("exceptionsetting.Please select Policy Acceptor"),
        disabled: this.isPolicyAcceptorIdDisabled,
      },
      {
        type: "options", // Dropdown/select field
        name: "risk_acceptor_type",
        label: this.$t("exceptionsetting.risk Acceptor Type"),
        options: [
          { id: "owner", name: "Owner" },
          { id: "user", name: "User" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("exceptionsetting.Select Options for risk Acceptor Type"),
      },
      {
        type: "user-select", // Dropdown/select field
        name: "risk_acceptor_id",
        label: this.$t("exceptionsetting.risk acceptor"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("exceptionsetting.Please select risk Acceptor"),
        disabled: this.isRiskAcceptorIdDisabled,
      },
      {
        type: "options", // Dropdown/select field
        name: "control_acceptor_type",
        label: this.$t("exceptionsetting.control Acceptor Type"),
        options: [
          { id: "owner", name: "Owner" },
          { id: "user", name: "User" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("exceptionsetting.Select Options for control Acceptor Type"),
      },
      {
        type: "user-select", // Dropdown/select field
        name: "control_acceptor_id",
        label: this.$t("exceptionsetting.control acceptor"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("exceptionsetting.Please select control Acceptor"),
        disabled: this.isControlAcceptorIdDisabled,
      },
    ];
  },

  methods: {
    // fetchData
    async fetchData() {
      try {
        // Fetch data from the exceptionsetting API
        this.exceptionSettings = await this.api.getAll(this.apiParams);
        // Check if data is returned
        if (this.exceptionSettings && this.exceptionSettings.length > 0) {
          this.hasData = true; // Set flag to true if data exists
          this.editItem(this.exceptionSettings[0]); // Load the first record into the edit form
        } else {
          this.hasData = false; // Set flag to false if no data exists
          this.openForm(); // Open the form for adding a new record
        } 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.$router.push({ name: 'Exception' });
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
      // Update the disabled state of acceptor fields based on existing data
      this.$nextTick(() => {
        this.changePolicyAcceptor(data.policy_acceptor_type);
        this.changeRiskAcceptor(data.risk_acceptor_type);
        this.changeControlAcceptor(data.control_acceptor_type);
      });
    },

    // This method updates the assignees based on the selected assign_type
    changePolicyAcceptor(PolicyAcceptor) {
      const policyAcceptorIdField = this.fromFields.find(
        (field) => field.name === "policy_acceptor_id"
      );
      if (PolicyAcceptor == "owner") {
        this.newItem.policy_acceptor_id = null;
        this.isPolicyAcceptorIdDisabled = true;
        if (policyAcceptorIdField) policyAcceptorIdField.disabled = this.isPolicyAcceptorIdDisabled;
      } else if (PolicyAcceptor == "user") {
        this.isPolicyAcceptorIdDisabled = false;
        if (policyAcceptorIdField) policyAcceptorIdField.disabled = this.isPolicyAcceptorIdDisabled;
      } else {
        this.isPolicyAcceptorIdDisabled = true;
        if (policyAcceptorIdField) policyAcceptorIdField.disabled = this.isPolicyAcceptorIdDisabled;
      }
    },

    // This method updates the assignees based on the selected assign_type
    changeRiskAcceptor(RiskAcceptor) {
      const riskAcceptorIdField = this.fromFields.find(
        (field) => field.name === "risk_acceptor_id"
      );
      if (RiskAcceptor == "owner") {
        this.newItem.risk_acceptor_id = null;
        this.isRiskAcceptorIdDisabled = true;
        if (riskAcceptorIdField) riskAcceptorIdField.disabled = this.isRiskAcceptorIdDisabled;
      } else if (RiskAcceptor == "user") {
        this.isRiskAcceptorIdDisabled = false;
        if (riskAcceptorIdField) riskAcceptorIdField.disabled = this.isRiskAcceptorIdDisabled;
      } else {
        this.isRiskAcceptorIdDisabled = true;
        if (riskAcceptorIdField) riskAcceptorIdField.disabled = this.isRiskAcceptorIdDisabled;
      }
    },

    // This method updates the assignees based on the selected assign_type
    changeControlAcceptor(ControlAcceptor) {
      const controlAcceptorIdField = this.fromFields.find(
        (field) => field.name === "control_acceptor_id"
      );
      if (ControlAcceptor == "owner") {
        this.newItem.control_acceptor_id = null;
        this.isControlAcceptorIdDisabled = true;
        if (controlAcceptorIdField) controlAcceptorIdField.disabled = this.isControlAcceptorIdDisabled;
      } else if (ControlAcceptor == "user") {
        this.isControlAcceptorIdDisabled = false;
        if (controlAcceptorIdField) controlAcceptorIdField.disabled = this.isControlAcceptorIdDisabled;
      } else {
        this.isControlAcceptorIdDisabled = true;
        if (controlAcceptorIdField) controlAcceptorIdField.disabled = this.isControlAcceptorIdDisabled;
      }
    },
  },

  watch: {
    "newItem.policy_acceptor_type"(after) {
      this.changePolicyAcceptor(after);
    },
    "newItem.risk_acceptor_type"(after) {
      this.changeRiskAcceptor(after);
    },
    "newItem.control_acceptor_type"(after) {
      this.changeControlAcceptor(after);
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>