<template>
  <div id="deliverable-view" class="container-fluid">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('deliverable.deliverable')"
      :subPage="$t('deliverable.deliverable')"
      :titlePage="$t('deliverable.deliverable')"
      v-permission:show
    >

      <div v-permission:update v-permission:delete></div>

      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <DataTable
          ref="table"
          id="deliverable-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :editItem="editItem"
          :openForm="openForm"
        >
          <template #deliverable.name="{ item }">
            <router-link :to="{ path: `/deliverable-details/${item.id}` }" style="cursor: pointer; color: #232388;">
              {{ item.name }}
            </router-link>
          </template>
          <!-- <template #deliverable.parent="{ item }">
              <span v-if="item?.milestone"
                :class="'badge text-white bg-primary'"
              >
                <router-link :to="{ path: `/milestone-details/${item?.milestone?.id}` }" style="cursor: pointer; color: #232388;">
                  {{ item?.milestone?.name }}
                </router-link>
              </span>
          </template> -->
          <template #deliverable.status="{ item }">
            <div v-html="getDeliverableStatus(item)">

            </div>
          </template>
          <template #deliverable.progress="{ item }">
            <div class="progress" style="width: 100%; height: 15px; margin-top: 9px;">
              <div class="progress-bar" role="progressbar" :style="{ width: item.percentage + '%' }" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <h4>{{ item.percentage }}%</h4>
          </template>
          <template #deliverable.tasksNumbers="{ item }">
            <router-link :to="{ path: `/deliverable-details/${item.id}`, query: { tab: 'tasks' } }" style="cursor: pointer; color: #232388;">
              {{ getTasksCount(item) }}
            </router-link>
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
  </div>
</template>

<script>
// Importing necessary components and API modules
import deliverable from "@/API/Deliverable/Deliverable";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
// import milestone from "@/API/Milestone/Milestone";

export default {
  props: {
    deliverablesData: {
      type: Array,
      default: () => [], // Better practice: use factory function for default arrays/objects
    },
  },
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new deliverable();
    const relations = ["milestone", "tasks"];
    const apiParams = { with: relations };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    // const milestoneApi = new milestone();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      // milestoneApi,
    };
  },

  async mounted() {
    // try {
    //   let milestoneFilter = {};
    //   // Apply filters based on route
    //   if (this.$route.name === "ProjectDetails") {
    //     milestoneFilter = `project_id|${this.$route.params.id}|=`;
    //   } else if (this.$route.name === "MilestoneDetails") {
    //     // First get the milestone details to find its project_id
    //     const milestoneDetails = await this.milestoneApi.show(this.$route.params.id);
    //     if (milestoneDetails && milestoneDetails.project_id) {
    //       milestoneFilter = `project_id|${milestoneDetails.project_id}|=`;
    //     }
    //   }

    //   // Fetch milestones with the appropriate filter
    //   this.milestones = await this.milestoneApi.getAll({
    //     select: "id|name",
    //     filter: milestoneFilter
    //   });

    //   // Update the milestone dropdown options
    //   const milestoneIdField = this.fromFields.find((field) => field.name === "milestone_id");
    //   if (milestoneIdField) {
    //     milestoneIdField.options = this.milestones.map((milestone) => ({
    //       id: milestone.id,
    //       name: milestone.name,
    //     }));
    //   }
    // } catch (error) {
    //   console.error("Error loading milestones:", error);
    // }
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      milestones: [],
    };
  },

  created() {
    /** start apiParams **/
    if (this.$route.name === "ProjectDetails" || this.$route.name === "MilestoneDetails") {
      if(this.deliverablesData) {
        this.apiParams.filterIn =`id|${this.deliverablesData.map(d => d.id).join(',')}`;
      }
    }
    /** end apiParams **/


    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "deliverable.name", title: this.$t("deliverable.name"), data: "name", defaultContent: "N/A" },
      { id: "deliverable.code", title: this.$t("deliverable.code"), data: "code", defaultContent: "N/A" },
      // { id: "deliverable.parent", title: this.$t("deliverable.parent"), data: "", defaultContent: "N/A" },
      { id: "deliverable.status", title: this.$t("deliverable.status"), data: "status", defaultContent: "N/A" },
      { id: "deliverable.expected_date", title: this.$t("deliverable.expected_date"), data: "expected_date", defaultContent: "N/A" },
      { id: "deliverable.completed_date", title: this.$t("deliverable.completed_date"), data: "completed_date", defaultContent: "N/A" },
      { id: "deliverable.progress", title: this.$t("deliverable.progress"), data: "", defaultContent: "N/A" },
      { id: "deliverable.tasksNumbers", title: this.$t("deliverable.tasksNumbers"), data: "", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        section: this.$t("deliverable.Main Details"),
        name: "name",
        label: this.$t("deliverable.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("deliverable.Please enter name"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("deliverable.Main Details"),
        name: "code",
        label: this.$t("deliverable.code"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("deliverable.Please enter code"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("deliverable.Main Details"),
        name: "expected_date",
        label: this.$t("deliverable.expected_date"), //
        type: "date",
        rules: "required", // Validation rule: required field
        description: this.$t("deliverable.Please enter expected date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("deliverable.Main Details"),
        type: "hidden",  // Dropdown/select field
        name: "milestone_id",
        label: "",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",  // Validation: required selection
        description: "",
      },
      {
        section: this.$t("deliverable.Main Details"),
        name: "description",
        label: this.$t("deliverable.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("deliverable.Provide a description"),
        col: 12,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    async openForm() {
      switch (this.$route.name) {
        case "MilestoneDetails":
          this.newItem.milestone_id = this.$route.params.id;
          break;
        default:
          break;
      }

      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      window.location.reload();
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    getDeliverableStatus(item) {
      const status = item.status;
      let label = "";
      let badgeClass = "";
      let iconClass = "";
      if (status == 'Draft') {
        label = "Draft";
        badgeClass = "bg-primary";
        // iconClass = "fas fa-check";
      }
      else if (status == 'Under Review') {
        label = "Under Review";
        badgeClass = "bg-primary";
        // iconClass = "fas fa-close";
      }
      else if (status == 'Approved') {
        label = "Approved";
        badgeClass = "bg-success";
        // iconClass = "fas fa-check";
      }
      else if (status == 'In Progress') {
        label = "In Progress";
        badgeClass = "bg-warning";
        // iconClass = "fas fa-clock";
      }
      else if (status == 'On Hold') {
        label = "On Hold";
        badgeClass = "bg-info";
        // iconClass = "fas fa-clock";
      }
      else if (status == 'Completed') {
        label = "Completed";
        badgeClass = "bg-success";
        // iconClass = "fas fa-thumbs-up";
      }
      else if (status == 'Cancelled') {
        label = "Cancelled";
        badgeClass = "bg-danger";
        // iconClass = "fas fa-close";
      }
      return `<span class="text-center badge ${badgeClass}" style="display: inline-flex; align-items: center; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
          <i class="${iconClass} me-1"></i>${label}
        </span>`;
    },

    getTasksCount(item) {
      return item.tasks.length || 0;
    },
  },
};
</script>

<style>
#deliverable-view .page-title {
  display: none;
}
#deliverable-view .flipper {
  min-height: 1000px !important;
}
</style>