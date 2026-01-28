<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('risk.risk_mngt')" :mainSubPage="$t('common.configration')"
    :titlePage="$t('risk.planning_strategy')" v-permission:show>

    <div v-permission:edit v-permission:delete></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'" v-permission:show
        :columns="tableColumns" :api="api" :apiParams="{}" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #created_At="{ item }"> {{ formatDate(item.created_at) }} </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import riskplanningstrategy from "@/API/RiskPlanningStrategy/RiskPlanningStrategy";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new riskplanningstrategy();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields
    };
  },

  async mounted() {

    // Fetch roles
    //this.roles = await this.roleApi.getAll({ select: "id|name" });

    // Update options dynamically in the form field
    //const myOptionsField = this.fromFields.find((field) => field.name === "myOptions");
    //myOptionsField.options = this.roles.map((role) => ({
    //id: role.id,
    //name: role.name,
    //}));

  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("common.name"), data: "name", defaultContent: "N/A" },
      { id: "created_At", title: this.$t("common.created_at"), data: "created_at", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("common.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        col: 12, // Column size in the form layout
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    formatDate(date) {
      if (!date) return "N/A";
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      // return new Intl.DateTimeFormat("ar-SA", options).format(new Date(date)); // hijri date
      return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
