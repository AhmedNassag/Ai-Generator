<template>
  <!-- Main Page component where the layout and page structure are set -->
  <div id="milestone-view" class="container-fluid">
 
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('milestone.milestone')"
    :subPage="$t('milestone.milestone')"
    :titlePage="$t('milestone.milestone')"
    v-permission:show
  >

    <div v-permission:update v-permission:delete></div>
    
      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <DataTable
          ref="table"
          id="milestone-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"   
          :api="api"  
          :apiParams="apiParams"   
          :editItem="editItem"  
          :openForm="openForm"   
        >
          
          <template #milestone.name="{ item }">
            <router-link :to="{ path: `/milestone-details/${item.id}` }" style="cursor: pointer; color: #232388;">
              {{ item.name }}
            </router-link>
          </template>
          <!-- <template #milestone.parent="{ item }">
              <span v-if="item?.project"
                :class="'badge text-white bg-primary'"
              >
                  {{ item?.project?.name }}
              </span>
          </template> -->
          <template #milestone.status="{ item }">
            <div>
              <span class="text-center badge" :class="item.status === item.step_publish ? 'bg-success' : 'bg-warning'" style="display: inline-flex; align-items: center; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
                {{ getNameOfStatus(item) || 'Unknown' }}
              </span>
            </div>
          </template>
          <template #milestone.duration="{ item }">
            <!-- {{ item.startDate }} <v-icon icon="mdi-arrow-right"></v-icon> {{ item.endDate }} -->
            {{calculateDuration(item.startDate, item.endDate) }}
          </template>
          <template #milestone.startDate="{ item }">
            {{ item.startDate }}
          </template>
          <template #milestone.endDate="{ item }">
            {{ item.endDate }}
          </template>
          <template #milestone.expectedBudget="{ item }">{{ item.expectedBudget }}</template>
          <template #milestone.realBudget="{ item }">
            {{ item.realBudget }}
            <v-btn size="small" color="info" @click="openRealBudgetModal(item)">
              <v-icon icon="mdi-pencil" class="me-1"></v-icon>
            </v-btn>
          </template>
          <template #milestone.progress="{ item }">
            <div class="progress" style="width: 100%; height: 15px; margin-top: 9px;">
              <div class="progress-bar" role="progressbar" :style="{ width: item.percentage + '%' }" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <h4>{{ item.percentage }}%</h4>
          </template>
          <template #milestone.deliverablesNumbers="{ item }">
            <router-link :to="{ path: `/milestone-details/${item.id}`, query: { tab: 'deliverables' } }" style="cursor: pointer; color: #232388;">
              {{ getDeliverablesCount(item) }}
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
      >
        <!-- Step Field -->
        <template #step_publish>
          <div class="col-md-6 mb-3">
            <label for="step_publish">
              {{ $t("servicecategory.Publish Step") }}
              <span class="font-danger">*</span>
            </label>
            <select class="form-select" id="step_publish" v-model="newItem.step_publish" required>
              <option disabled value="">Select</option>
              <option v-for="step in workflowSteps" :key="step.code" :value="step.code">
                {{ step.name }}
              </option>
            </select>
          </div>
        </template>
      </Form>
    </template>
  </main-page>


  <!-- Start Real Budget Modal -->
  <v-dialog v-model="realBudgetModal.show" max-width="600">
    <v-card>
      <v-card-title>{{ $t('milestone.Real Budget') }}</v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-text-field label="Real Budget" v-model="form.realBudget" type="number" required></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="realBudgetModal.show = false">{{ $t('milestone.Cancel') }}</v-btn>
        <v-btn color="primary" :disabled="!form.realBudget" @click="setRealBudget">{{ $t('milestone.Save') }}</v-btn>
      </v-card-actions>
      </v-card>
  </v-dialog>
  <!-- End Owner Details Modal -->

  </div>
</template>

<script>
// Importing necessary components and API modules
import milestone from "@/API/Milestone/Milestone";
import milestoneSetting from "@/API/MilestoneSetting/MilestoneSetting";
// import project from "@/API/Project/Project";
import workflow from "@/API/Workflow/Workflow";
// import User from "@/API/User/User";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Swal from "sweetalert2";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  props: {
    milestonesData: {
      type: Array,
      default: () => [],
    },
    users: {
      type: Array,
      default: () => []
    },
  },

  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    VueSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new milestone();
    const relations = ["project","deliverables"];
    const apiParams = { with: relations };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    // const projectApi = new project();
    const milestoneSettingApi = new milestoneSetting();
    const workflowApi = new workflow();
    // const userApi = new User();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      // projectApi,
      milestoneSettingApi,
      workflowApi,
      // userApi,
    };
  },
 
  async mounted() {
    // Fetch milestoneSettings
    this.milestoneSettings = await this.milestoneSettingApi.getAll({ filter: `type|milestone|=`, select: "id|workflowCategory_id" });

    // Fetch projects
    // this.projects = await this.projectApi.getAll({ select: "id|name" });
    // const projectIdField = this.fromFields.find((field) => field.name === "project_id");
    // projectIdField.options = this.projects.map((project) => ({
    //   id: project.id,
    //   name: project.name,
    // }));

    // Fetch workflows
    this.workflows = await this.workflowApi.getAll({ select: "id|name|steps|workflowCategory_id" });
    const workflowOptions = this.workflows.filter(workflow => 
      workflow.workflowCategory_id === this.milestoneSettings[0]?.workflowCategory_id
    );
    const workflowIdField = this.fromFields.find((field) => field.name === "workflow_id");
    workflowIdField.options = workflowOptions.map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
    }));

    // Fetch stakeholders
    // this.stakeholders = await this.userApi.getAll({ select: "id|full_name" });
    this.stakeholders = this.users;
    const stakeholderIdsField = this.fromFields.find((field) => field.name === "stakeholder_ids");
    stakeholderIdsField.options = this.stakeholders.map((stakeholder) => ({
      id: stakeholder.id,
      name: stakeholder.full_name,
    }));
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      // projects: [],
      milestoneSettings: [],
      workflows: [],
      workflowSteps: [],
      stakeholders:[],
      realBudgetModal: {
        show: false,
        currentItem: null
      },
      form: {
        realBudget: '',
      },
    };
  },

  created() {
    /** start apiParams **/
    if (this.$route.name === "ProjectDetails") {
      this.apiParams.filterIn = `id|${this.milestonesData.map(m => m.id).join(',')}`;
    }
    /** end apiParams **/

    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { 
        id: "milestone.name",
        title: this.$t("milestone.name"),
        data: "name",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.code",
        title: this.$t("milestone.code"),
        data: "code",
        defaultContent: "N/A"
      },
      // { id: "milestone.parent", title: this.$t("milestone.parent"), data: "", defaultContent: "N/A" },
      { 
        id: "milestone.status",
        title: this.$t("milestone.status"),
        data: "",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.startDate",
        title: this.$t("milestone.startDate"),
        data: "startDate",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.endDate",
        title: this.$t("milestone.endDate"),
        data: "endDate",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.duration",
        title: this.$t("milestone.duration"),
        data: "",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.expectedBudget",
        title: this.$t("milestone.expectedBudget"),
        data: "",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.realBudget",
        title: this.$t("milestone.realBudget"),
        data: "",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.progress",
        title: this.$t("milestone.progress"),
        data: "",
        defaultContent: "N/A"
      },
      { 
        id: "milestone.deliverablesNumbers",
        title: this.$t("milestone.deliverablesNumbers"),
        data: "",
        defaultContent: "N/A"
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        section: this.$t("milestone.Main Details"),
        name: "name",
        label: this.$t("milestone.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("milestone.Please enter name"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("milestone.Main Details"),
        name: "code",
        label: this.$t("milestone.code"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("milestone.Please enter code"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("milestone.Main Details"),
        name: "expectedBudget",
        label: this.$t("milestone.expectedBudget"),
        type: "number", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: this.$t("milestone.Please enter expected budget"),
        col: 6,
      },
      {
        section: this.$t("milestone.Main Details"),
        name: "startDate",
        label: this.$t("milestone.startDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("milestone.Please enter start date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("milestone.Main Details"),
        name: "endDate",
        label: this.$t("milestone.endDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("milestone.Please enter end date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("milestone.Main Details"),
        type: "options",  // Dropdown/select field
        name: "stakeholder_ids",
        label: this.$t("milestone.stakeholders"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("milestone.Select"),
        multiple: true,
      },
      {
        section: this.$t("milestone.Main Details"),
        type: "options",  // Dropdown/select field
        name: "workflow_id",
        label: this.$t("milestone.workflow"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("milestone.Select"),
      },
      {
        section: this.$t("milestone.Main Details"),
        type: "options",
        name: "step_publish",
        label: this.$t("milestone.step publish"),
        // options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("milestone.Select"),
        placeholder: this.$t("milestone.Select"),
      },
      {
        section: this.$t("milestone.Main Details"),
        type: "hidden",  // Dropdown/select field
        name: "project_id",
        label: "",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",  // Validation: required selection
        placeholder: "",
      },
      {
        section: this.$t("milestone.Main Details"),
        name: "description",
        label: this.$t("milestone.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("milestone.Provide a description"),
        col: 12,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      switch (this.$route.name) {
        case "ProjectDetails":
          this.newItem.project_id = this.$route.params.id;
          break;
        default:
          break;
      }
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      window.location.reload();
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      // this.newItem = data;  // Set the current item to edit
      // Get the filtered workflow options (same logic as in mounted)
      const workflowOptions = this.workflows.filter(workflow => 
        workflow.workflowCategory_id === this.milestoneSettings[0]?.workflowCategory_id
      );

      // Check if data.workflow_id exists in workflowOptions
      const isValidWorkflow = workflowOptions.some(workflow => workflow.id === data.workflow_id);

      // Set newItem with conditional workflow_id
      this.newItem = {
        ...data,
        workflow_id: isValidWorkflow ? data.workflow_id : null,
        step_publish: isValidWorkflow ? data.step_publish : null,
      };

      // Update workflowSteps if workflow_id is valid
      if (isValidWorkflow) {
        const selectedWorkflow = this.workflows.find(w => w.id === data.workflow_id);
        this.workflowSteps = selectedWorkflow?.steps || [];
      } else {
        this.workflowSteps = []; // Reset steps if workflow is invalid
      }
      this.isFlipped = true; // Show the form for editing
    },

    openRealBudgetModal(item) {
      if(item.realBudget && item.realBudget != null) {
        this.form.realBudget = item.realBudget;
      }
      this.realBudgetModal.currentItem = item;
      this.realBudgetModal.show = true;
    },

    calculateDuration(start, end) {
      if (!start || !end) return 'N/A';
      const startDate = new Date(start);
      const endDate = new Date(end);
      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();
      // Adjust months and years if the end day is less than the start day
      if (days < 0) {
        months -= 1;
        days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years > 0) {
        return years === 1 ? '1 year' : `${years} years`;
      } else if (months > 0) {
        return months === 1 ? '1 month' : `${months} months`;
      } else {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      }
    },

    async setRealBudget() {
      const itemId = this.realBudgetModal.currentItem.id;
      this.realBudgetModal.show = false;
      // Show confirmation dialog
      const result = await Swal.fire({
        title: this.$t("milestone.Are you sure?"),
        text: this.$t("milestone.You are about to change real budget for this milestone!"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: this.$t("milestone.Yes, set it!"),
        cancelButtonText: this.$t("milestone.No, cancel!"),
      });
      if (result.isConfirmed) {
        const data = {
          realBudget: this.form.realBudget,
        };
        const response = await this.api.setRealBudget(itemId, data)
        .then((response) => {
            this.$refs.table.refreshTable(); // Refresh the table
            Swal.fire("Success", this.$t("milestone.Milestone Real Budget Set Successfully"), "success"); // Success message
            // this.api.poup(response, "Milestone Real Budget Set Successfully");
        })
        .catch((error) => {
            console.error("There was an error:", error);
            Swal.fire("Error", this.$t("milestone.There was an error set real budget of the Milestone"), "error"); // Error message
            // this.api.poup({ status: false, message: "An error occurred while changing the status." }, "Error");
        });;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // If user cancels, show a message
        Swal.fire("Cancelled", this.$t("milestone.The operation was cancelled"), "info");
        // this.api.poup({ status: false, message: "An error occurred while changing the status." }, "Error");
      }
      this.form = {
        realBudget: '',
      },
      this.realBudgetModal.currentItem = null
    },

    getDeliverablesCount(item) {
      return item.deliverables.length || 0;
    },

    getNameOfStatus(milestone) {
      if (!milestone.status) return 'Unknown Status'; 
      const workflow = this.workflows.find(workflow => workflow.id == milestone.workflow_id);
      if (!workflow) return 'Unknown Status';
      const status = workflow.steps.find(step => step.code == milestone.status);
      return status?.name || 'Unknown Status';
    },
  },

  watch: {
    async "newItem.workflow_id"(workflowId) {
      // Find selected workflow and extract its steps
      const selectedWorkflow = this.workflows.find(workflow => workflow.id === workflowId);
      this.workflowSteps     = selectedWorkflow ? selectedWorkflow.steps : [];
      this.newItem.status    = selectedWorkflow ? selectedWorkflow.steps[0].code : null;
    },

    users: {
      immediate: true,
      handler(newVal) {
        console.log("Users updated:", newVal);
      }
    },
  }
};
</script>

<style>
/* Scoped styles for the component */
#milestone-view .page-title {
  display: none;
}
#milestone-view .flipper {
  min-height: 1000px !important;
}
</style>
