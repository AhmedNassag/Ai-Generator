<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'auditpolicycomplianceresult.auditpolicycomplianceresult'" :subPage="'auditpolicycomplianceresult.auditpolicycomplianceresult'" :titlePage="'auditpolicycomplianceresult.auditpolicycomplianceresult'">
    
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"   
        :api="api"  
        :apiParams="{}"   
        :editItem="editItem"  
        :openForm="openForm"   
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>
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
</template>

<script>
// Importing necessary components and API modules
import auditpolicycomplianceresult from "@/API/AuditPolicyComplianceResult/AuditPolicyComplianceResult";
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
    const api = new auditpolicycomplianceresult();
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
      { title:  this.$t("auditpolicycomplianceresult.email"), data: "email", defaultContent: "N/A" },
      { title: this.$t("auditpolicycomplianceresult.name"), data: "name", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("auditpolicycomplianceresultname"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your full name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("auditpolicycomplianceresultemail"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: "Please enter a valid email address.",
        col: 6,
      },
      {
        type: "options",  // Dropdown/select field
        name: "myOptions",
        label: this.$t("auditpolicycomplianceresult.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: "Select Options to customize for the client",
      },
      {
        name: "terms",
        label: this.$t("auditpolicycomplianceresult.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: "You must accept the terms and conditions.",
        col: 6,
      },
      {
        name: "description",
        label: this.$t("auditpolicycomplianceresult.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide a description of the project.",
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
