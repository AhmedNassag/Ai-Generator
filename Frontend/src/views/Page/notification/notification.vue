<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'notification.notification'"
    :subPage="'notification.notification'" :titlePage="'notification.notification'">

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="{}" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #notification.description="{ item }">
          {{ extractText(item.description) }}</template> </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import notification from "@/API/notification/notification";
import userApi from "@/API/User/User";
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
    const api = new notification();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi: new userApi(),
      users: [],
    };
  },

  async mounted() {
    // Fetch users and update the form fields dynamically
    await this.getUser();
    this.updateFormFieldsWithUsers();
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
      { title: this.$t("notification.type"), data: "type", defaultContent: "N/A" },
      { title: this.$t("notification.description"), data: "description", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        type: "options",  // Dropdown/select field
        name: "user_to",
        label: this.$t("notification.my_options"),
        options: [], // Initially empty, will be populated with users
        optionLabel: "name",
        col: 6,
        multiple: true,
        rules: "required",  // Validation: required selection
        description: "Select Options to customize for the client",
      },
      {
        type: "options",  // Dropdown/select field
        name: "types",
        label: this.$t("notification.my_options"),
        options: [
          { id: "mail", name: "Mail" },
          { id: "sms", name: "SMS" },
        ], // Initially empty, will be populated with users
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: "Select Options to customize for the client",
      },
      {
        name: "description",
        label: this.$t("notification.description"),
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
      this.getUser();
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

    // Fetch user data based on the email filter
    async getUser() {
      const response = await this.userApi.getAll({ select: "id|full_name" });
      this.users = response; // Store the fetched users
      console.log(this.users, "User data");
    },

    // Update the form fields with the fetched users
    updateFormFieldsWithUsers() {
      const userOptions = this.users.map(user => ({
        id: user.id,
        name: user.full_name,
      }));

      // Find the 'type' field and update its options
      const typeField = this.fromFields.find(field => field.name === "user_to");
      if (typeField) {
        typeField.options = userOptions;
      }
    },
    extractText(html) {
      const div = document.createElement("div");

      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>