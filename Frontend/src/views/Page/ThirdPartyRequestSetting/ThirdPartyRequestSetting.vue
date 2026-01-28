<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('thirdpartyrequestsetting.Configuration')"
    :mainSubPage="$t('thirdpartyrequestsetting.Third Party Request Setting')"
    :titlePage="$t('thirdpartyrequestsetting.Third Party Request Setting')"
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
        <template #type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="type">{{ $t("thirdpartyrequestsetting.Type") }}</label>
            <input class="form-control" id="type" v-model="newItem.type" :disabled="isTypeDisabled" value="thirdPartyRequests">
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
import thirdpartyrequestsetting from "@/API/ThirdPartyRequestSetting/ThirdPartyRequestSetting";
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
    const api = new thirdpartyrequestsetting();
    const apiParams = {
      filter: `type|thirdPartyRequests|=`,
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
    // Fetch data 
    this.fetchData();
  },

  data() {
    return {
      isFlipped: true, // To control form flip (show/hide form)
      newItem: { type:'thirdPartyRequests' }, // Data object to store the currently selected item for editing or new item
      isManagerDisabled: true,
      isUserDisabled: true,
      hasData: false, // Flag to track if API returned data
      thirdPartyRequestSettings: [], // Store API response data
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "receiver_type", title:  this.$t("thirdpartyrequestsetting.receiver_type"), data: "receiver_type", defaultContent: "N/A" },
      { id: "user", title: this.$t("thirdpartyrequestsetting.user"), data: "_USERSERVICE._User.user_id.full_name", defaultContent: "N/A" },
      { id: "position", title: this.$t("thirdpartyrequestsetting.position"), data: "_USERSERVICE._Position.position_id.name", defaultContent: "N/A" },
    ];

    // Define the form fields schema by validation rules, types, and descriptions
    this.fromFields = [
      {
        type: "options",  // Dropdown/select field
        name: "receiver_type",
        label: this.$t("thirdpartyrequestsetting.receiver Type"),
        options: [
          { id: "department_manager", name: "Department Manager" },
          { id: "user", name: "User" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("thirdpartyrequestsetting.Select Receiver Type"),
      },
      {
        type: "user-select",  // Dropdown/select field
        name: "user_id",
        label: this.$t("thirdpartyrequestsetting.user"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("thirdpartyrequestsetting.Please select User"),
        disabled: this.isUserDisabled,
      },
      {
        type: "options",  // Dropdown/select field
        name: "department_id",
        label: this.$t("thirdpartyrequestsetting.department"),
        options: "Department",
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("thirdpartyrequestsetting.Please select Department"),
        disabled: this.isManagerDisabled,
      },
      {
        type: "options",  // Dropdown/select field
        name: "position_id",
        label: this.$t("thirdpartyrequestsetting.position"),
        options: "Position",
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("thirdpartyrequestsetting.Please select Position"),
        disabled: this.isManagerDisabled,
      },
    ];
  },

  methods: {
    // Fetch data from the API
    async fetchData() {
      try {
        this.thirdPartyRequestSettings = await this.api.getAll(this.apiParams);
        if (this.thirdPartyRequestSettings && this.thirdPartyRequestSettings.length > 0) {
          this.hasData = true; // Set flag to true if data exists
          this.editItem(this.thirdPartyRequestSettings[0]); // Load the first record into the edit form
        } else {
          this.hasData = false; // Set flag to false if no data exists
          this.openForm(); // Open the form for adding a new record
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.fetchData();
      this.isFlipped = true;  // Hide the form
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
      // Update the form fields based on the selected receiver type
      this.$nextTick(() => {
        this.checkReceiverType(data.receiver_type);
      });
    },

    checkReceiverType(receiverType) {      
      const userField       = this.fromFields.find((field) => field.name === "user_id");
      const departmentField = this.fromFields.find((field) => field.name === "department_id");
      const positionField   = this.fromFields.find((field) => field.name === "position_id");
      if (receiverType == 'department_manager') {
        this.isManagerDisabled     = false;
        this.isUserDisabled        = true;
        this.newItem.user_id       = null;
      } else if (receiverType == 'user') {
        this.isManagerDisabled     = true;
        this.isUserDisabled        = false;
        this.newItem.department_id = null;
        this.newItem.position_id   = null;
      } else {
        this.isManagerDisabled     = true;
        this.isUserDisabled        = true;
        this.newItem.user_id       = null;
        this.newItem.department_id = null;
        this.newItem.position_id   = null;
      }
      if (userField) userField.disabled             = this.isUserDisabled;
      if (departmentField) departmentField.disabled = this.isManagerDisabled;
      if (positionField) positionField.disabled     = this.isManagerDisabled;
    }
  },

  watch: {
    "newItem.receiver_type"(after) {
      this.checkReceiverType(after);
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
