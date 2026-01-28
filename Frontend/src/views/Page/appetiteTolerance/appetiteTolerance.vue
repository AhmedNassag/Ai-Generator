<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'appetitetolerance.appetitetolerance'"
    :subPage="'appetitetolerance.appetitetolerance'" :titlePage="'appetitetolerance.appetitetolerance'">

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>
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
import appetitetolerance from "@/API/appetiteTolerance/appetiteTolerance";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { notify } from "@kyvg/vue3-notification";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new appetitetolerance();
    const apiParams = { filter: "type|appetitetolerance" };
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
      { title: this.$t("appetitetolerance.tolerance"), data: "tolerance", defaultContent: "N/A" },
      { title: this.$t("appetitetolerance.appetite"), data: "appetite", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "tolerance",
        label: this.$t("appetitetolerancename.tolerance"),
        type: "number", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter tolerance.",
        col: 6, // Column size in the form layout
      },
      {
        name: "appetite",
        label: this.$t("appetitetolerancename.appetite"),
        type: "number", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter appetite.",
        col: 6, // Column size in the form layout
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      if (this.$refs?.table?.data?.length == 1) {
        notify({
          title: `Error`,
          text: "You can not add new appetite or tolerance it is already exist.",
          type: "error",
        });
        return;
      }
      this.isFlipped = true;  // Show the form
      this.newItem.type = "appetitetolerance";

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
