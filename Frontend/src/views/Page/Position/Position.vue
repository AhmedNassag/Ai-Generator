<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    v-permission:show
    :mainPage="'governance.governance'"
    :mainSubPage="'hierarchy.hierarchy'"
    :subPage="'position.position'"
    :titlePage="'position.Position'"
  >
    <!-- Slot for rendering the DataTable -->
    <div v-permission:edit v-permission:delete></div>
    <template #datatable v-permission:show>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :filters="filter"
      >
        <!-- Customizing the display of the 'Name' column in the table -->

        <template #position.jobs="{ item }">
          <span v-for="row in item.jobs" :key="row.id"> {{ row?.name }}, </span>
        </template>
        <template #position.description="{ item }">
          {{ stripHtml(truncateText(item.description)) }}</template
        >
        <template #Emergency="{ item }">
          <span
            class="status-badge"
            :class="
              item.emergency_requests == 'true' || true
                ? 'badge-danger'
                : 'badge-secondary'
            "
          >
            {{
              item.emergency_requests == "true" || true
                ? $t("position.critical")
                : $t("position.normal")
            }}
          </span>
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
</template>

<script>
// Importing necessary components and API modules
import position from "@/API/Position/Position";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Job from "@/API/Job/Job";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new position();
    const apiParams = { with: ["jobs"] };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const jobsApi = new Job();
    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      jobsApi,
    };
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      jobs: [],
      filters: {
        job_id: "",
      },
      filter: [
        {
          title: "Job",
          key: "jobs@id",
          type: "int",
          data: "Job",
          filterType: "filterWhereRelation[]",
        },
      ],
    };
  },

  created() {
    this.loadJobs();

    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("position.name"), data: "name", defaultContent: "N/A" },
      { title: this.$t("position.code"), data: "code", defaultContent: "N/A" },
      {
        title: this.$t("position.description"),
        data: "description",
        defaultContent: "N/A",
      },
      { title: this.$t("position.jobs"), data: null, defaultContent: "N/A" },
      {
        id: "Emergency",
        title: this.$t("position.emergency"),
        data: null,
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("position.name"),
        type: "text", // Text input field for email
        rules: "required", // Validation rule: required and valid email format
        description: this.$t("position.name"),
        col: 6,
      },
      {
        name: "code",
        label: this.$t("position.code"),
        type: "text", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: "Please enter a valid code.",
        col: 6,
      },
      {
        name: "emergency_requests",
        label: this.$t("position.emergency"),
        type: "checkbox",
        rules: "",
        description: this.$t("position.emergency"),
        col: 6,
        default: false,
        inputClass: "form-check-input",
        labelClass: "form-check-label",
        wrapperClass: "form-check form-switch",
        options: {
          label: "Enable Critical Priority",
        },
      },
      {
        name: "description",
        label: this.$t("position.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: "Provide a description of the project.",
        col: 12,
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

    async loadJobs() {
      try {
        const response = await this.jobsApi.getAll({ select: "id|name" });

        this.jobs = response.reduce((map, job) => {
          map[job.id] = job.name;
          return map;
        }, {});

        console.log("this.jobs");
        console.log(this.jobs);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      }
    },
    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    truncateText(text) {
      if (!text) {
        return ""; // Return an empty string if the text is null or undefined
      }

      // If text length is 50 or more, truncate and add "..."
      if (text.length >= 50) {
        return text.substring(0, 50) + "...";
      }

      // If text length is less than 50, return it as is
      return text;
    },
  },

  watch: {
    // Watch for changes in the filter object
    filters: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        // Construct the filter string for apiParams
        const filtersObject = [];

        if (newFilter.job_id) {
          this.apiParams.filterWhereRelation = [
            `jobs@id|${newFilter.job_id}|=`,
          ];
        } else {
          this.apiParams.filterWhereRelation = [];
        }

        // Update apiParams with the new filter
        this.apiParams.filter = filtersObject.join("&&");
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.badge-danger {
  background-color: #e2b6b6 !important;
  color: #a92525;
  padding: 0 8px;
  border-radius: 10px;
  height: 20px;
  font-size: 12px;
}

.badge-secondary {
  background-color: #b6caae !important;
  color: #255f0b;
  padding: 0 8px;
  border-radius: 10px;
  height: 20px;
}
</style>
