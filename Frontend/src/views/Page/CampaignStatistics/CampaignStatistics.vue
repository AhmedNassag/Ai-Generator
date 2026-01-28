<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'campaignstatistics.campaignstatistics'" :subPage="'campaignstatistics.campaignstatistics'" :titlePage="'campaignstatistics.campaignstatistics'">
    
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
        :hideActions="hideActions"
        :hideActionsColumn="true"
        :hideAllActionsColumnn="true"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #campaignName="{ item }">  {{ item?.campaign?.name }} </template>
        <template #templete_name="{ item }">  {{ item?.templete?.name }} </template>
        <template #user_name="{ item }">  {{ getUserName(item.user_id) }} </template>
        <template #received_at="{ item }">  {{ formatDateTime(item.received_at) }} </template>
        <template #opened_at="{ item }">  {{ formatDateTime(item.opend_at) }} </template>
        <template #downloaded_at="{ item }">  {{ formatDateTime(item.downloadFile_at) }} </template>
        <template #click_link_at="{ item }">  {{ formatDateTime(item.clickLink_at) }} </template>
        <template #submit_form_at="{ item }">  {{ formatDateTime(item.submitForm_at) }} </template>
        <template #rate="{ item }">  {{ calculateRate(item) }}% </template>
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
import campaignstatistics from "@/API/CampaignStatistics/CampaignStatistics";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new campaignstatistics();
    const UserApi = new User();
    const apiParams = { with: ["campaign", "templete"] };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      UserApi
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
      this.users = await this.UserApi.getAll({ select: "id|full_name|type|email|phone|username|department_id" });
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      users: [],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title:'campaignName', data: "campaign.name", defaultContent: "N/A" },
      { title: 'templete_name', data: "templete.name", defaultContent: "N/A" },
      { title: 'user_name', data: "user.full_name", defaultContent: "N/A" },
      { 
        title: 'received_at', 
        data: "received_at", 
        defaultContent: "N/A",
        render: (data) => this.formatDateTime(data)
      },
      { 
        title: 'opened_at', 
        data: "opened_at", 
        defaultContent: "N/A",
        render: (data) => this.formatDateTime(data)
      },
      { 
        title: 'downloaded_at', 
        data: "downloaded_at", 
        defaultContent: "N/A",
        render: (data) => this.formatDateTime(data)
      },
      { 
        title: 'click_link_at', 
        data: "click_link_at", 
        defaultContent: "N/A",
        render: (data) => this.formatDateTime(data)
      },
      { 
        title: 'submit_form_at', 
        data: "submit_form_at", 
        defaultContent: "N/A",
        render: (data) => this.formatDateTime(data)
      },
      { title: 'rate', data: "rate", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name:  'name',
        label: this.$t("campaignstatisticsname"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your full name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("campaignstatisticsemail"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: "Please enter a valid email address.",
        col: 6,
      },
      {
        type: "options",  // Dropdown/select field
        name: "myOptions",
        label: this.$t("campaignstatistics.my_options"),
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
        label: this.$t("campaignstatistics.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: "You must accept the terms and conditions.",
        col: 6,
      },
      {
        name: "description",
        label: this.$t("campaignstatistics.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide a description of the project.",
        col: 12,
      },
    ];
  },

  methods: {
    getUserName(userId) {
      const user = this.users.find(user => user.id === userId);
      return user ? user.full_name : '';
    },
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
    // Calculate engagement rate for a row
    calculateRate(item) {
      if (!item.received_at) {
        return 0.0;
      }
      const actions = [
        item.opend_at,
        item.clickLink_at,
        item.downloadFile_at,
        item.submitForm_at
      ];
      const completedActions = actions.filter(Boolean).length;
      return ((completedActions / 4) * 100).toFixed(2);
    },
    formatDateTime(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        
        // Extract components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
