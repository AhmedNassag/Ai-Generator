<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'Configuration'"
    :mainSubPage="'Risk '"
    :subPage="'threatCatalog'"
    :titlePage="'threatCatalog.threatCatalog'"
    v-permission:show
  >
    <div v-permission:update v-permission:delete></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div class="col-md-3 col-lg-3 mb-3">
        <label for="group" class="fs-6">{{ $t("threatcatalog.filter_by_group") }}</label>
        <select id="group" class="form-control" v-model="filter.group">
          <option value="" :required="!this.filter.group">{{ $t("threatcatalog.all_group") }}</option>
          <option
            v-for="group in threatGroups"
            :key="group.id"
            :value="group.id"
          >
            {{ group.name }}
          </option>
        </select>
      </div>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        v-permission:show
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #threatcatalog.event="{ item }">
          {{ extractText(item.event) }}
        </template>
        <template #threatcatalog.description="{ item }">
          {{ extractText(item.description) }}</template
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
      ></Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import threatcatalog from "@/API/ThreatCatalog/ThreatCatalog";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import threatgroup from "@/API/threatGroup/threatGroup";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      filter: { group: "" }, // Filter object
      threatGroups: [], // Array to store threat groups fetched from the API
      threatGroupApi: new threatgroup(), // Initialize the threatGroup API
      api: new threatcatalog(), // Initialize the threatcatalog API
      apiParams: { filter: "" }, // API parameters
      tableColumns: [], // Initialize table column definitions
      fromFields: [], // Initialize form fields
    };
  },

  async mounted() {
    // Fetch threat groups from the API
    this.threatGroups = await this.fetchThreatGroups();

    // Update the options in the form field dynamically
    const threatGroupField = this.fromFields.find(
      (field) => field.name === "threat_group"
    );
    if (threatGroupField) {
      threatGroupField.options = this.threatGroups.map((group) => ({
        id: group.id,
        name: group.name,
      }));
    }
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        title: this.$t("threatcatalog.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        title: this.$t("threatcatalog.event"),
        data: "event",
        defaultContent: "N/A",
      },
      {
        title: this.$t("threatcatalog.description"),
        data: "description",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("threatcatalog.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter threat catalog name.",
        col: 6, // Column size in the form layout
      },
      {
        type: "options", // Dropdown/select field
        name: "threat_group",
        label: this.$t("threatcatalog.threat group"),
        placeholder: "Select Option of groups",
        options: [], // Initially empty, will be populated dynamically
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: "Select Option of groups",
      },
      {
        name: "order",
        label: this.$t("threatcatalog.order"),
        type: "number", // Multi-line text field
        rules: "required|number", // Validation rule: required field
        description: "Please enter a threat catalog order.",
        col: 12,
      },
      {
        name: "event",
        label: this.$t("threatcatalog.event"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: "Please enter a threat catalog event.",
        col: 12,
      },
      {
        name: "description",
        label: this.$t("threatcatalog.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: "Please enter a threat catalog description.",
        col: 12,
      },
    ];
  },

  methods: {
    // Fetch threat groups from the API
    async fetchThreatGroups() {
      try {
        const response = await this.threatGroupApi.getAll();
        return response; // Assuming the API returns an array of groups
      } catch (error) {
        console.error("Error fetching threat groups:", error);
        return [];
      }
    },
    extractText(html) {
      const div = document.createElement("div");

      div.innerHTML = html;
      return div.textContent || div.innerText || "";
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
  },
  watch: {
    // Watch for changes in the filter object
    filter: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        // Construct the filter string for apiParams
        const filters = [];
        if (newFilter.group) {
          filters.push(`threat_group|${newFilter.group}|=`);
        }
        // Update apiParams with the new filter
        this.apiParams.filter = filters.join(",");
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
