<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page 
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('campaignsetting.campaignsetting')"
    :mainSubPage="$t('campaignsetting.campaignsetting')"
    :titlePage="$t('campaignsetting.campaignsetting')"
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
        <!--type-->
        <template #type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="type">{{ $t("campaignsetting.Type") }}</label>
            <input class="form-control" id="type" v-model="newItem.type" :disabled="isTypeDisabled" value="campaign">
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import campaignsetting from "@/API/CampaignSetting/CampaignSetting";
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
    const api = new campaignsetting();
    const apiParams = {
      filter: `type|campaign|=`
    };
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
    // Fetch data from the campaignSetting API
    this.fetchData();
  },
      
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: { type:'campaign' }, // Data object to store the currently selected item for editing or new item
      hasData: false, // Flag to track if API returned data
      campaignSettings: [], // Store API response data
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "securityAwarenessRate", title: this.$t("campaignsetting.securityAwarenessRate"), data: "securityAwarenessRate", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "securityAwarenessRate",
        label: this.$t("campaignsetting.securityAwarenessRate"),
        type: "number", // Input field type
        rules: "required", // Validation rule: required field
        description: this.$t("campaignsetting.Please Enter Security Awareness Rate"),
        col: 6, // Column size in the form layout
      },
    ];
  },

  methods: {
    // Fetch data from the campaignSetting API
    async fetchData() {
      try {
        // Fetch data from the campaignSetting API
        this.campaignSettings = await this.api.getAll(this.apiParams);
        // Check if data is returned
        if (this.campaignSettings.length > 0) {
          this.hasData = true; // Set flag to true if data exists
          this.editItem(this.campaignSettings[0]); // Load the first record into the edit form
        } else {
          this.hasData = false; // Set flag to false if no data exists
          this.openForm(); // Open the form for adding a new record
        } 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.fetchData();
      this.isFlipped = true;  // Show the form
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
