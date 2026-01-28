<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('assetvaluation.Configuration')"
    :mainSubPage="$t('assetvaluation.Asset Valuation')"
    :titlePage="$t('assetvaluation.Asset Valuation')"
    v-permission:show
  >
  
    <div v-permission:update v-permission:delete></div>
    
    <!-- Slot for rendering the DataTable -->
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
      </Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import assetvaluation from "@/API/AssetValuation/AssetValuation";
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
    const api = new assetvaluation();
    const apiParams = {};
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
      { id: "name", title: this.$t("assetvaluation.name"), data: "name", defaultContent: "N/A" },
      { id: "min_value", title:  this.$t("assetvaluation.min_value"), data: "min_value", defaultContent: "N/A" },
      { id: "max_value", title:  this.$t("assetvaluation.max_value"), data: "max_value", defaultContent: "N/A" },
    ];

    // Define the form fields schema by validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("assetvaluation.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("assetvaluation.Please enter name"),
        col: 4, // Column size in the form layout
      },
      {
        name: "min_value",
        label: this.$t("assetvaluation.min_value"),
        type: "number", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("assetvaluation.Please enter min value"),
        col: 4, // Column size in the form layout
      },
      {
        name: "max_value",
        label: this.$t("assetvaluation.max_value"),
        type: "number", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("assetvaluation.Please enter max value"),
        col: 4, // Column size in the form layout
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
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
