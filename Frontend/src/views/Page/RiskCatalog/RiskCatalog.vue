<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'Configuration '"
    :mainSubPage="'Risk'"
    :subPage="'Risk Catalog'"
    :titlePage="'Risk Catalog'"
    v-permission:show
  >
  <div v-permission:update v-permission:destroy></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <!-- Filter Section -->
      <div class="mb-3">
        <div class="row">
          <!-- Type Filter -->
          <!-- <div class="col-md-3 col-lg-3 mb-3">
            <label for="type">Group</label>
            <select id="type" class="form-control" v-model="filter.group">
              <option value="">All</option>
              <option id="1" value="1">Group One</option>
              <option id="2" value="2">Group Two</option>
            </select>
          </div> -->

          <!-- Period Filter -->
          <!-- <div class="col-md-3 col-lg-3 mb-3">
            <label for="period">Function</label>
            <select id="period" class="form-control" v-model="filter.function">
              <option value="">All</option>
              <option id="1" value="1">Function One</option>
              <option id="2" value="2">Function Two</option>
            </select>
          </div>-->
        </div>
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
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <!-- <template #description="{ item }">
          {{ stripHtmlTags(item.description) }}
        </template> -->
        <template #function="{ item }">
          {{ item.risk_function?.name }}
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
      >
        <template #group_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="group_id">{{ $t("riskcatalog.riskgroup") }}</label>
            <LazySelectField
              name="group_id"
              v-model="newItem.group_id"
              :placeholder="$t('common.please_select')"
              options="RiskGroup"
              option-label="name"
              option-value="id"
              :disabled="isReadonly"
              :rules="'required'"
            />
          </div>
        </template>

        <template #function_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="function_id">{{ $t("riskcatalog.riskfunction") }}</label>
            <LazySelectField
              name="function_id"
              v-model="newItem.function_id"
              :placeholder="$t('common.please_select')"
              options="RiskFunction"
              option-label="name"
              option-value="id"
              :disabled="isReadonly"
              :rules="'required'"
            />
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import riskcatalog from "@/API/RiskCatalog/RiskCatalog";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    LazySelectField, // Lazy loading select field component
  },

  setup() {
    // Initialize API and other required properties
    const api = new riskcatalog();
    const apiParams = { with: ["riskFunction:id,name"] };
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
    // Lazy loading is now handled by LazySelectField components
    // No need to fetch data manually
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      filter: {
        function_id: "",
        group_id: "",
      },
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        title: this.$t("riskcatalog.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id:'function',
        title: this.$t("riskcatalog.function"),
        data: "riskFunction.name",
        defaultContent: "N/A",
      },
      {
        id:'description',
        title: this.$t("riskcatalog.description"),
        data: "description",
        defaultContent: "N/A",
      },
      {
        id:'event',
        title: this.$t("riskcatalog.event"),
        data: "event",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("riskcatalog.name"),
        type: "text",
        rules: "required",
        description: "Please enter the catalog name.",
        col: 6, // Column size in the form layout
      },
      {
        type: "options",
        name: "group_id",
        label: this.$t("riskcatalog.riskgroup"),
        options: "RiskGroup", // Lazy loading mode - API module name
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select the risk group.",
      },
      {
        type: "options", // Dropdown/select field
        name: "function_id",
        label: this.$t("riskcatalog.riskfunction"),
        options: "RiskFunction", // Lazy loading mode - API module name
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select the risk function.",
      },
      {
        name: "order",
        label: this.$t("riskcatalog.order"),
        type: "number",
        rules: "required",
        description: "Please enter the order value.",
        col: 6,
      },
      {
        name: "event",
        label: this.$t("riskcatalog.event"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide a description of the project.",
        col: 12,
      },
      {
        name: "description",
        label: this.$t("riskcatalog.description"),
        type: "textarea",
        rules: "required",
        description: "Provide a description of the project.",
        col: 12,
      },
    ];
  },

  methods: {
    stripHtmlTags(html) {
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

        if (newFilter.function) {
          filters.push(`function_id|${newFilter.function}|=`);
        }
        if (newFilter.group) {
          filters.push(`group_id|${newFilter.group}|=`);
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
