<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('logsetting.logsetting')" :subPage="$t('logsetting.logsetting')"
    :titlePage="$t('logsetting.logsetting')" 
    v-permission:show>
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->

        <template #status="{ item }">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" :checked="item.status === 'active'"
              @click="toggleStatus(item)"
              :class="{ 'bg-success': item.status === 'active', 'bg-danger': item.status !== 'active' }"  v-permission:update/>
            <label class="form-check-label">{{ item.status }}</label>
          </div>
        </template>
        <template #action="{ item }">
          <span>
            {{ $t(`role.${item.action}`) }}
          </span>
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
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import logsetting from "@/API/LogSetting/LogSetting";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { useRoute } from "vue-router";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new logsetting();
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    const route = useRoute(); // Get the route object
    const model = route.params.model;
    const modelWithUppercase = model.charAt(0).toUpperCase() + model.slice(1);
    const apiParams = { filter: `class|${modelWithUppercase}` };

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
      {id:"action", title: this.$t("logsetting.action"), data: "action", defaultContent: "N/A" },
      { title: this.$t("logsetting.class"), data: "class", defaultContent: "N/A" },
      {id:"status", title: this.$t("logsetting.status"), data: "status", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [];
  },

  props: {
    model: {
      type: String,
      required: true, // Ensure it's passed dynamically
    },
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

    async toggleStatus(item) {
      const data = { ...item };
      const status = data.status == 'active' ? 'inactive' : 'active';
      data.status = status;
      let message = '';
      const response = await this.api.update(data);

      if (response.data.status === "active") {
        message = "Activated Successfuly !"
      } else {
        message = "Deactivated Successfuly !"
      }

      this.api.poup(response, message);
      this.$refs.table.refreshTable();
    }
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.form-check-input.bg-success {
  border-color: #198754;
}

.form-check-input.bg-danger {
  border-color: #dc3545;
}

::v-deep(.editAction),
::v-deep(.dt-buttons button:last-child) {
  display: none !important;
}

</style>