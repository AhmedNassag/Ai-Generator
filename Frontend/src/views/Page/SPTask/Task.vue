<template>
  <div id="task-view" class="container-fluid">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('task.task')"
      :subPage="$t('task.task')"
      :titlePage="$t('task.task')"
      v-permission:show
    >

      <div v-permission:update v-permission:delete></div>

      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <DataTable
          ref="table"
          id="task-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :editItem="editItem"
          :openForm="openForm"
        >
          <!-- Customizing the display of the 'Name' column in the table -->
          <template #task.name="{ item }">
            <router-link
              :to="{ path: `/task-details/${item.id}` }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.name }}
            </router-link>
          </template>
          <!-- <template #task.parent="{ item }">
              <span v-if="item?.deliverable"
                :class="'badge text-white bg-primary'"
              >
                <router-link :to="{ path: `/deliverable-details/${item?.deliverable?.id}` }" style="cursor: pointer; color: #232388;">
                  {{ item?.deliverable?.name }}
                </router-link>
              </span>
          </template> -->
          <template #task.status="{ item }">
            <div v-html="getTaskStatus(item)">

            </div>
          </template>
          <template #task.due_date="{}">
            
          </template>
          <template #task.completed_date="{}">

          </template>
          <template #task.completed_by="{ item }">
            {{getNameOfUser(item.completed_by)}}
          </template>
          <template #task.assignee="{ item }">
            {{getNameOfUser(item.assignee)}}
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
import task from "@/API/SPTask/Task";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
// import milestone from "@/API/Milestone/Milestone";
// import deliverable from "@/API/Deliverable/Deliverable";

export default {
  props: {
    tasksData: {
      type: Array,
      default: () => [], // Better practice: use factory function for default arrays/objects
    },
    users: {
      type: Array,
      default: () => []
    },
  },
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new task();
    const userApi = new User();
    const relations = ["deliverable"];
    const apiParams = { filter: "", with: relations };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    // const milestoneApi = new milestone();
    // const deliverableApi = new deliverable();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      // milestoneApi,
      // deliverableApi,
    };
  },

  async mounted() {
    // try {
    //   let deliverableFilter = {};
    //   // Apply filters based on route
    //   if (this.$route.name === "ProjectDetails") {
    //     // Get deliverables where milestone.project_id matches route param
    //     deliverableFilter = `milestone@project_id|${this.$route.params.id}-string|=`;
    //   } 
    //   else if (this.$route.name === "MilestoneDetails") {
    //     // First get the milestone to find its project_id
    //     const milestoneDetails = await this.milestoneApi.show(this.$route.params.id);
    //     if (milestoneDetails?.project_id) {
    //       deliverableFilter = `milestone@project_id|${milestoneDetails.project_id}-string|=`;
    //     }
    //   }
    //   else if (this.$route.name === "DeliverableDetails") {
    //     // Get the deliverable to find its milestone.project_id
    //     const deliverableDetails = await this.deliverableApi.show(this.$route.params.id, {with:['milestone']});
    //     if (deliverableDetails?.milestone?.project_id) {
    //       deliverableFilter = `milestone@project_id|${deliverableDetails.milestone.project_id}-string|=`;
    //     }
    //   }

    //   // Fetch deliverables with the appropriate filter
    //   this.deliverables = await this.deliverableApi.getAll({
    //     select: "id|name",
    //     filterWhereRelation: [deliverableFilter],
    //     with: "milestone" // Ensure we can filter by milestone.project_id
    //   });
    //   // Update the deliverable dropdown options
    //   const deliverableIdField = this.fromFields.find(field => field.name === "deliverable_id");
    //   if (deliverableIdField) {
    //     deliverableIdField.options = this.deliverables.map(deliverable => ({
    //       id: deliverable.id,
    //       name: deliverable.name
    //     }));
    //   }
    // } catch (error) {
    //   console.error("Error loading deliverables:", error);
    // }

    this.users = await this.userApi.getAll({ select: "id|full_name" });
    const assigneeUsers = this.fromFields.find((field) => field.name === "assignee");
    assigneeUsers.options = this.users.map((user) => ({
      id: user.id,
      name: user.full_name,
    }));
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
    /** start apiParams **/
    if (this.$route.name === "ProjectDetails" || this.$route.name === "MilestoneDetails" || this.$route.name === "DeliverableDetails") {
      if(this.tasksData) {
        this.apiParams.filterIn = `id|${this.tasksData.map(t => t.id).join(',')}`;
      }
    }
    /** end apiParams **/


    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "task.name", title: this.$t("task.name"), data: "name", defaultContent: "N/A" },
      { id: "task.code", title: this.$t("task.code"), data: "code", defaultContent: "N/A" },
      // { id: "task.parent", title: this.$t("task.parent"), data: "", defaultContent: "N/A" },
      { id: "task.status", title: this.$t("task.status"), data: "status", defaultContent: "N/A" },
      { id: "task.due_date", title: this.$t("task.due_date"), data: "due_date", defaultContent: "N/A" },
      { id: "task.completed_date", title: this.$t("task.completed_date"), data: "completed_date", defaultContent: "N/A" },
      { id: "task.completed_by", title: this.$t("task.completed_by"), data: "", defaultContent: "N/A" },
      { id: "task.assignee", title: this.$t("task.assignee"), data: "", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("task.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("task.Please enter name"),
        col: 6, // Column size in the form layout
      },
      {
        name: "code",
        label: this.$t("task.code"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("task.Please enter code"),
        col: 6, // Column size in the form layout
      },
      {
        name: "due_date",
        label: this.$t("taske.due_date"),
        type: "date", // Text input field for email
        rules: "required", // Validation rule: required and valid email format
        description: this.$t("task.Please enter due date"),
        col: 6,
      },
      {
        type: "options", // Dropdown/select field
        name: "myOptions",
        label: this.$t("task.general_task_id"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
          { id: 3, name: "Option 3" },
          { id: 4, name: "Option 4" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("task.Select"),
      },
      {
        type: "options", // Dropdown/select field
        name: "assignee",
        label: this.$t("task.assignee"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("task.Select"),
      },
      {
        type: "hidden", // Dropdown/select field
        name: "deliverable_id",
        label: "",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "", // Validation: required selection
        description: "",
      },
      {
        name: "description",
        label: this.$t("task.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("task.Provide a description of the task"),
        col: 12,
      },
    ];
  },

  methods: {
     getNameOfUser(userId) {
      if (!userId) return '';
      if (!this.users || !Array.isArray(this.users)) return '';
      const user = this.users.find(u => u.id === userId);
      return user?.full_name || '';
    },
    // Open the form for adding or editing an item
    async openForm() {
      switch (this.$route.name) {
        case "DeliverableDetails":
          this.newItem.deliverable_id = this.$route.params.id;
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

    getTaskStatus(item) {
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
  },

  watch: {
    users: {
      immediate: true,
      handler(newVal) {
        // console.log("Users updated:", newVal);
      }
    }, 
  }
};
</script>

<style>
/* Scoped styles for the component */
#task-view .page-title {
  display: none;
}
#task-view .flipper {
  min-height: 1000px !important;
}
</style>
