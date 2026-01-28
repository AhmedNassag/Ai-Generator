<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('assetenvironmentcategory.Configuration')"
    :mainSubPage="$t('assetenvironmentcategory.Asset Environment Category')"
    :titlePage="$t('assetenvironmentcategory.Asset Environment Category')"
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
import assetenvironmentcategory from "@/API/AssetEnvironmentCategory/AssetEnvironmentCategory";
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
    const api = new assetenvironmentcategory();
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
      { id: "name", title: this.$t("assetenvironmentcategory.name"), data: "name", defaultContent: "N/A" },
      { id: "created_at", title: this.$t("assetenvironmentcategory.created at"), data: "created_at", defaultContent: "N/A" },
    ];

    // Define the form fields schema by validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("assetenvironmentcategory.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("assetenvironmentcategory.Please enter name"),
        col: 6, // Column size in the form layout
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
