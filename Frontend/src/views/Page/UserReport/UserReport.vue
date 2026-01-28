<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('userreport.userreport')" :subPage="$t('userreport.userreport')"
    :titlePage="$t('userreport.userreport')">

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="{}" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #name="{ item }">
          <router-link :to="{ name: 'UserReportDetails', params: { id: item.id } }">{{ item.name }}</router-link>

        </template>
        <template #baseModle="{ item }">
          {{ item.data.baseModle }}

        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form    :closeForm="closeForm" ></Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import userreport from "@/API/UserReport/UserReport";
import Form from "./Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Auth from '../../../API/Auth';

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new userreport();
    const apiParams = { filter: "user_id|" + Auth.USER.id };
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
      { title: this.$t("userreport.name"), data: "name", id: "name", defaultContent: "N/A" },
      { title: this.$t("userreport.base_model"), data: "data.baseModle", id: "baseModle", defaultContent: "N/A" },

    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("userreport.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("userreport.Please enter your full name"),
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("userreport.email"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: this.$t("userreport.Please enter a valid email address"),
        col: 6,
      },
      {
        type: "options",  // Dropdown/select field
        name: "myOptions",
        label: this.$t("userreport.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("userreport.Select Options to customize for the client"),
      },
      {
        name: "terms",
        label: this.$t("userreport.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: this.$t("userreport.You must accept the terms and conditions"),
        col: 6,
      },
      {
        name: "description",
        label: this.$t("userreport.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: this.$t("userreport.Provide a description of the project"),
        col: 12,
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
