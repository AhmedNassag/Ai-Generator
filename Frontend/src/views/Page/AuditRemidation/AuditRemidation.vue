<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'control.control'" :mainSubPage="'site.configration'"
    :titlePage="'controltype.controltype'" v-permission:show>

    <div v-permission:edit v-permission:delete></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'" v-permission:show
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm" :hideAddNewButton="true">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #auditRemidation.ControlAuditName="{ item }"> {{ item.control_audit?.name }} </template>
        <template #auditRemidation.ResponsibleUser="{ item }"> {{ findUserNameById(item.responsible_user) }} </template>
        <template #auditRemidation.CorrectiveActionPlan="{ item }"> {{ stripPTags(item.corrective_action_plan) }}</template>
        <template #auditRemidation.Created_at="{ item }"> {{ formatDate(item.created_at) }}</template>
        <template #auditRemidation.Due-Date="{ item }"> {{ formatDate(item.due_date) }}</template>
        <template #auditRemidation.comments="{ item }"> {{ stripPTags(item.comments_remidation) }}</template>


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
import auditRemidation from "@/API/AuditRemidation/AuditRemidation";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import user from "@/API/User/User";
import Auth from "@/API/Auth";
import { filter } from "jszip";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new auditRemidation();
    const authUser = Auth.USER;
    const apiParams = {
      with: ["controlAudit:name"],
      filter: `responsible_user|${authUser.id}`,
    };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    const userApi = new user();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      authUser,

    };
  },

  async mounted() {
    await this.fetchUsers();
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
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("auditRemidation.ResponsibleUser"), data: "", defaultContent: "N/A" },
      { title: this.$t("auditRemidation.ControlAuditName"), data: "", defaultContent: "N/A" },
      { title: this.$t("auditRemidation.CorrectiveActionPlan"), data: "corrective_action_plan", defaultContent: "N/A" },
      { title: this.$t("auditRemidation.budgetary"), data: "budgetary", defaultContent: "N/A" },
      { title: this.$t("auditRemidation.status"), data: "status", defaultContent: "N/A" },
      { title: this.$t("auditRemidation.Due-Date"), data: "due_date", defaultContent: "N/A" },
      { title: this.$t("auditRemidation.comments"), data: "comments_remidation", defaultContent: "N/A" },
      { title: this.$t("auditRemidation.Created_at"), data: "", defaultContent: "N/A" },
    ];

    this.fromFields = [
      {
        name: "due_date",
        label: this.$t("auditRemidation.Due Date"),
        type: "date",
        rules: "",
        col: 6
      },
      {
        name: "status",
        label: this.$t("auditRemidation.Status"),
        type: "options",
        optionLabel: "name",
        rules: "",
        description: "Please select a valid status.",
        col: 6,
        options: [
          { id: "Approved", name: this.$t("auditRemidation.Approved") },
          { id: "Rejected", name: this.$t("auditRemidation.Rejected") }
        ]
      },
      {
        name: "budgetary",
        label: this.$t("auditRemidation.Budgetary"),
        type: "text",
        rules: "",
        col: 12
      },
      {
        name: "corrective_action_plan",
        label: this.$t("auditRemidation.Corrective Action Plan"),
        type: "textarea",
        rules: "",
        col: 12
      },
      {
        name: "comments_remidation",
        label: this.$t("auditRemidation.Remediation Comments"),
        type: "textarea",
        rules: "",
        col: 12
      }
    ];

  },

  methods: {
    stripPTags(html) {
      if (!html) return "";
      return String(html).replace(/<\/?p>/g, "");
    },
    async fetchUsers() {
      try {
        // Example: const response = await yourUserService.getAll();
        const response = await this.userApi.getAll();
        this.userList = response.map((user) => ({
          id: user.id,
          name: user.full_name,
          departmentId: user.department_id,
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    findUserNameById(userId) {
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.name : "N/A";
    },
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },
    formatDate(createdAt) {
      const date = new Date(createdAt);

      // Get year, month and day
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');

      // Format it as YYYY-MM-DD
      return `${year}-${month}-${day}`;
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
