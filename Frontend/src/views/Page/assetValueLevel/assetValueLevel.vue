<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('assetValueLevel.configuration')"
    :mainSubPage="$t('assetValueLevel.assets')"
    :subPage="$t('assetValueLevel.assetValueLevel')"
    :titlePage="$t('assetValueLevel.title')"
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
        :apiParams="{}"
        :editItem="editItem"
        :openForm="openForm"
        v-permission:show
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #assetvaluelevel.value="{ item }">{{ item.value }} </template>
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
import assetvaluelevel from "@/API/assetValueLevel/assetValueLevel";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new assetvaluelevel();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
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
      {
        title: this.$t("assetValueLevel.level"),
        data: "level",
        defaultContent: "N/A",
      },
      {
        title: this.$t("assetValueLevel.value"),
        data: "value",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "level",
        label: this.$t("assetValueLevel.level"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("assetValueLevel.please_enter_your_level"),
        col: 6, // Column size in the form layout
      },
      {
        name: "value",
        label: this.$t("assetValueLevel.value"),
        type: "number", // Text input field for email
        rules: "required", // Validation rule: required and valid email format
        description: this.$t("assetValueLevel.please_enter_your_value"),
        col: 6,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
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
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>