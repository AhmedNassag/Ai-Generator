<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('log.log')"
    :subPage="$t('log.log')"
    :titlePage="$t('log.log')"
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
        :hideAddNewButton="true"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #addAction="{ item }">
          <a @click.prevent="openModal(item)" href="#" class="dropdown-item">
            <i class="icofont icofont-eye p-1"></i> view
          </a>
        </template>

        <template #logDate="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #actionBy="{ item }">
          <div>
            {{ getUserName(item.user_id).full_name }}
          </div>
        </template>
        <template #username="{ item }">
          <div>
            {{ getUserName(item.user_id).username }}
          </div>
        </template>
        <template #edit="{ item }">
          <div></div>
        </template>

        <template #delete="{ item }">
          <div></div>
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
      ></Form>
    </template>
  </main-page>

  <!-- View log modal -->
  <ViewLog
    :viewModal="viewModal"
    :logData="logData"
    :users="users"
    @close="viewModal = false"
    @update:viewModal="viewModal = $event"
  />
</template>

<script>
// Importing necessary components and API modules
import log from "@/API/Log/Log";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import ViewLog from "./components/ViewLog.vue";
import User from "@/API/User/User";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    ViewLog,
  },

  setup() {
    // Initialize API and other required properties
    const api = new log();
    const userApi = new User();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

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
    this.users = await this.userApi.getAll({ select: "id|full_name|username" });
  },
  data() {
    return {
      viewModal: false,
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      logData: [],
      users: [],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("log.action"), data: "action", defaultContent: "N/A" },
      { title: this.$t("log.class"), data: "class", defaultContent: "N/A" },
      {
        title: this.$t("log.operating_system"),
        data: "operating_system",
        defaultContent: "N/A",
      },
      {
        title: this.$t("log.action_date"),
        data: "created_at",
        defaultContent: "N/A",
        id: "logDate",
      },
      {
        id: "username",
        title: this.$t("log.username"),
        data: "username",
        defaultContent: "N/A",
      },
      {
        title: this.$t("log.action_by"),
        data: "",
        defaultContent: "N/A",
        id: "actionBy",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [];
  },

  methods: {
    getUserName(userId) {
      // Find the user by ID from the users array
      const user = this.users.find((user) => user.id === userId);
      return user || "N/A"; // Return user's full name or 'Unknown User' if not found
    },
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

    formatDate(date) {
      if (!date) return "N/A";

      const options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Use 24-hour format
      };

      return new Intl.DateTimeFormat("en-GB", options).format(new Date(date));
    },

    openModal(selectedRow) {
      this.logData = { ...selectedRow };
      console.log("this.logData", this.logData);
      this.viewModal = true;
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
::v-deep(.editAction),
::v-deep(.dt-buttons button:last-child) {
  display: none !important;
}
</style>
