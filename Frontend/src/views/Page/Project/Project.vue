<template>
  <div id="project-view" class="container-fluid">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('project.project')"
      :subPage="$t('project.project')"
      :titlePage="$t('project.project')"
      v-permission:show
    >

    <div v-permission:update v-permission:delete></div>
    
    <!-- Slot for rendering the DataTable -->
    <template #datatable>        
        
        <div class="projects-container">
          <div class="col-md-12">
            <!-- start show loading spinner while data is loading -->
            <div v-if="loading" class="loading-container">
              <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
              </div>
              <p class="loading-text">{{ $t("project.Loading") }}...</p>
            </div>
            <!-- start show loading spinner while data is loading -->
          </div>
          <!-- Add New Project Card (Special Card) -->
          <div class="col-md-9 mb-9"></div>
          <div class="col-md-3 mb-3">
            <v-btn
              v-if="!loading"
              @click="openForm"
              class="add-btn"
              color="primary"
              prepend-icon="mdi-plus"
            >
              {{ $t("project.Add New") }}
            </v-btn>
          </div>
          
          <!-- Project Cards -->
          <div class="col-md-4 mb-4" v-for="item in projects" :key="item.id">
            <!-- <router-link :to="{ path: `/project-details/${item.id}` }" style="cursor: pointer; color: #232388;"> -->
              <div class="card project-card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title mb-0 text-truncate">
                      <router-link :to="{ path: `/project-details/${item.id}` }" style="cursor: pointer; color: #232388;">
                        {{ item.name }}
                      </router-link>
                    </h5>
                    <div class="action-buttons">
                      <div class="dropdown table-actions">
                        <a class=" dropdown-toggle"  id="actionsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                          <i class="fa fa-ellipsis-v"></i>
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="actionsDropdown">
                          <li>
                            <a href="javascript:void(0)" class="edit_button dropdown-item">
                              <router-link :to="{ path: `/project-details/${item.id}` }">
                                <i class="icofont icofont-eye"></i>
                                {{ $t("project.Show") }}
                              </router-link>
                            </a>
                            <a href="javascript:void(0)" class="edit_button dropdown-item"
                              @click.stop="editItem(item)"
                              v-permission:update
                            >
                              <i class="icofont icofont-fountain-pen"></i>
                              {{ $t("project.Edit") }}
                            </a>
                          </li>
                          <li>
                            <a href="javascript:void(0)" class="delete_button dropdown-item"
                              @click.stop="deleteItem(item)"
                              v-permission:destroy
                            >
                              <i class="icofont icofont-trash  text-danger"></i>
                              {{ $t("project.Delete") }}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Progress Section -->
                  <div class="progress-section mb-3">
                    <div class="d-flex justify-content-between mb-1">
                      <span class="progress-label">{{ $t("project.Percentage") }}</span>
                      <span class="progress-percentage">{{ item.percentage || 0 }}%</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div 
                        class="progress-bar" 
                        role="progressbar" 
                        :style="{ 
                          width: (item.percentage || 0) + '%',
                          'background-color': getProgressColor(item.percentage || 0)
                        }" 
                        :aria-valuenow="item.percentage || 0" 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                  
                  <!-- Meta Information -->
                  <div class="project-meta">
                    <div class="meta-item">
                      <v-icon icon="mdi-calendar" size="16" class="me-1"></v-icon>
                      <small>{{calculateDuration(item.startDate, item.endDate) }}</small>
                    </div>
                    
                    <div class="meta-item">
                      <v-icon icon="mdi-account" size="20" class="me-1" @click="openOwnerDetailsModal(item)" :disabled="ownerDetailsLoading"></v-icon></div>
                    
                    <div class="meta-item status-badge">
                      <v-chip 
                        :color="getStatusColor(item.status)" 
                        size="small"
                        class="text-white"
                      >
                        {{ item.status }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
            <!-- </router-link> -->
          </div>
        </div>
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
          <template #parentType="item">
            <div class="col-sm-12 col-md-6" style="display:none">
              <div class="form-group">
                <label for="parentType" class="form-label">{{ $t("project.parentType") }}</label>
                <VueSelect 
                  label="parentType" 
                  :rules="[required]" 
                  :options="parentType" 
                  v-model="newItem.parentType"
                  placeholder="Select owner type" 
                  :reduce="(item) => item.id" 
                  @update:modelValue="selectParentType"
                />
                <small class="form-text text-muted">{{ $t("project.Select") }}</small>
              </div>
            </div>
          </template>

          <template #initiative_id="{ item }">
            <div class="col-md-6 mb-3" style="display:none">
              <label for="initiative_id">{{ $t("project.initiative") }}</label>
              <select class="form-select" id="initiative_id" v-model="newItem.initiative_id">
                <option disabled selected value>Select</option>
                <option v-for="initiative in initiatives" :key="initiative.id" :value="initiative.id">{{ initiative.name }}</option>
              </select>
            </div>
          </template>

          <template #program_id="{ item }">
            <div class="col-md-6 mb-3" style="display:none">
              <label for="program_id">{{ $t("project.program") }}</label>
              <select class="form-select" id="program_id" v-model="newItem.program_id" :requiredf="!isProgramHidden">
                <option disabled selected value>{{ $t("project.Select") }}</option>
                <option v-for="program in programs" :key="program.id" :value="program.id">{{ program.name }}</option>
              </select>
            </div>
          </template>

          <template #ownerType="item">
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <label for="ownerType" class="form-label">
                  {{ $t("project.ownerType") }}
                  <span class="font-danger">*</span>
                </label>
                <VueSelect 
                  label="ownerType" 
                  :options="ownerType"
                  v-model="newItem.ownerType"
                  placeholder="Select owner type" 
                  :reduce="(item) => item.id" 
                  @update:modelValue="selectOwnerType" 
                />
                <small class="form-text text-muted">{{ $t("project.Select") }}</small>
              </div>
            </div>
          </template>

          <!-- Dynamic owner selector based on ownerType -->
          <template #owner_id="item">
            <div class="col-sm-12 col-md-6 mb-4">
              <div v-if="newItem?.ownerType == 'user'" class="form-group">
                <label for="owner_id" class="form-label">
                  {{ $t("project.owner_id") }}
                  <span class="font-danger">*</span>
                </label>
                <VueSelect 
                  label="full_name" 
                  :options="users || []"
                  v-model="newItem.owner_user_ids"
                  placeholder="Select users" 
                  :reduce="(item) => item?.id" 
                  multiple
                  @update:modelValue="handleOwnerUsersChange" 
                />
                <small class="form-text text-muted">{{ $t("project.Select") }}</small>
              </div>
              <div v-if="newItem?.ownerType == 'team'" class="form-group">
                <label for="owner_id" class="form-label">
                  {{ $t("project.owner_id") }}
                  <span class="font-danger">*</span>
                </label>
                <VueSelect 
                  label="name" 
                  :options="teams || []" 
                  v-model="newItem.owner_team_ids"
                  placeholder="Select team" 
                  :reduce="(item) => item?.id"
                  multiple
                  @update:modelValue="handleOwnerTeamsChange"
                />
                <small class="form-text text-muted">{{ $t("project.Select") }}</small>
              </div>
            </div>
          </template>
          
        </Form>
      </template>
    </main-page>


    <!-- Start Owner Details Modal -->
    <v-dialog v-model="ownerDetailsModal.show" max-width="600">
      <v-card>
        <v-card-title>{{ $t("project.Owner Details") }}</v-card-title>
        <v-card-text>
          <!-- Show loading spinner if owner is in progress -->
          <div v-if="ownerDetailsLoading" class="text-center py-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <div class="mt-2">{{ $t("project.Processing") }}...</div>
          </div>

          <v-list v-else>
            <v-list-item
              @click="!ownerDetailsLoading" :class="bg-blue-lighten-5"
              v-if="ownerDetailsModal.currentItem.owner_user_ids && ownerDetailsModal.currentItem.owner_user_ids.length > 0"
              v-for="userOwner in ownerDetailsModal.currentItem.owner_user_ids" :key="userOwner.id"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-arrow-right"></v-icon>
              </template>
              <v-list-item-title>
                <v-chip size="small" color="info" class="m-1"> {{ getNameOfUser(userOwner) }} </v-chip>
                <v-chip size="small" color="danger" class="m-1"> {{ getEmailOfUser(userOwner) }} </v-chip>
                <v-chip size="small" color="success" class="m-1"> {{ getPhoneOfUser(userOwner) }} </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              @click="!ownerDetailsLoading" :class="bg-blue-lighten-5"
              v-if="ownerDetailsModal.currentItem.owner_team_ids && ownerDetailsModal.currentItem.owner_team_ids.length > 0"
              v-for="teamOwner in ownerDetailsModal.currentItem.owner_team_ids" :key="teamOwner.id"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-arrow-right"></v-icon>
              </template>
              <v-list-item-title>
                <v-chip size="small" color="primary">{{ getNameOfTeam(teamOwner) }}</v-chip>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="ownerDetailsModal.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- End Owner Details Modal -->



    <!-- Start Real Budget Modal -->
    <v-dialog v-model="realBudgetModal.show" max-width="600">
      <v-card>
        <v-card-title>{{ $t("project.Project Real Budget") }}</v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <v-text-field label="Real Budget" v-model="form.realBudget" type="number" required></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="realBudgetModal.show = false">{{ $t("project.Cancel") }}</v-btn>
          <v-btn color="primary" :disabled="!form.realBudget" @click="setRealBudget">{{ $t("project.Save") }}</v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
    <!-- End Owner Details Modal -->
  </div>
</template>

<script>
// Importing necessary components and API modules
import project from "@/API/Project/Project";
import strategicPlan from "@/API/StrategicPlan/StrategicPlan";
import program from "@/API/Program/Program";
import initiative from "@/API/Initiative/Initiative";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Swal from "sweetalert2";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  // props: {
  //   projects: {
  //     type: Array,
  //     default: () => [], // Better practice: use factory function for default arrays/objects
  //   },
  // },
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    VueSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new project();
    const relations = [/*"program", "initiative", "milestones"*/];
    const apiParams = { with: relations };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    const strategicPlanApi = new strategicPlan();
    const programApi = new program();
    const initiativeApi = new initiative();
    const userApi = new User();
    const teamApi = new Team();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      strategicPlanApi,
      programApi,
      initiativeApi,
      userApi,
      teamApi,
    };
  },
 
  async mounted() {
    await this.fetchProjects();

    // Fetch initiatives
    this.initiatives = await this.initiativeApi.getAll({ select: "id|name" });
    const initiativeIdsField = this.fromFields.find((field) => field.name === "initiative_id");
    initiativeIdsField.options = this.initiatives.map((initiative) => ({
      id: initiative.id,
      name: initiative.name,
    }));

    // Fetch programs
    this.programs = await this.programApi.getAll({ select: "id|name" });
    const programIdsField = this.fromFields.find((field) => field.name === "program_id");
    programIdsField.options = this.programs.map((program) => ({
      id: program.id,
      name: program.name,
    }));

    // Fetch owner
    this.users = await this.userApi.getAll({ select: "id|full_name|email|phone" });
    this.teams = await this.teamApi.getAll({ select: "id|name" });

    // Fetch stakeholder
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
      loading: true,
      newItem: {status:'Draft'}, // Data object to store the currently selected item for editing or new item
      initiatives: [],
      programs: [],
      users:[],
      teams:[],
      stakeholders:[],
      ownerType: [
        { id: "user", ownerType: "User" },
        { id: "team", ownerType: "Team" },
      ],
      parentType: [
        { id: "initiative", parentType: "Initiative" },
        { id: "program", parentType: "Program" },
      ],
      isInitiativeHidden: true,
      isProgramHidden: true,
      ownerDetailsModal: {
        show: false,
        currentItem: null
      },
      currentOwner: [],
      ownerDetailsLoading: false,
      ownerModal: {
        show: false,
      },
      realBudgetModal: {
        show: false,
        currentItem: null
      },
      form: {
        realBudget: '',
      },
      projects: [],
    };
  },

  created() {
    /** start apiParams **/
    // if (this.$route.name === "StrategicPlanDetails") {
    //   this.apiParams = {
    //     filterIn : `id|${this.projects.map(p => p.id).join(',')}`
    //   };
    // }
    // else if (this.$route.name === "ObjectiveDetails") {
    //   this.apiParams.filter = `objective_ids|${this.$route.params.id}|=`;
    // }
    // else 
    if (this.$route.name === "InitiativeDetails") {
      this.apiParams.filter = `initiative_id|${this.$route.params.id}|=`;
    }
    else if (this.$route.name === "ProgramDetails") {
      this.apiParams.filter = `program_id|${this.$route.params.id}|=`;
    }
    /** end apiParams **/


    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "project.name", title: this.$t("project.name"), data: "name", defaultContent: "N/A" },
      { id: "project.code", title: this.$t("project.code"), data: "code", defaultContent: "N/A" },
      { id: "project.parent", title: this.$t("project.parent"), data: "", defaultContent: "N/A" },
      { id: "project.startDate", title: this.$t("project.startDate"), data: "startDate", defaultContent: "N/A" },
      { id: "project.endDate", title: this.$t("project.endDate"), data: "endDate", defaultContent: "N/A" },
      { id: "project.duration", title: this.$t("project.duration"), data: "", defaultContent: "N/A" },
      { id: "project.progress", title: this.$t("project.progress"), data: "", defaultContent: "N/A" },
      { id: "project.owner", title: this.$t("project.owner"), data: "", defaultContent: "N/A" },
      { id: "project.status", title: this.$t("project.status"), data: "", defaultContent: "N/A" },
      { id: "project.expectedBudget", title: this.$t("project.expectedBudget"), data: "", defaultContent: "N/A" },
      { id: "project.realBudget", title: this.$t("project.realBudget"), data: "", defaultContent: "N/A" },
      { id: "project.milestonesNumbers", title: this.$t("project.milestonesNumbers"), data: "", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        section: this.$t("project.Main Details"),
        name: "name",
        label: this.$t("project.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("project.Please enter name"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("project.Main Details"),
        name: "code",
        label: this.$t("project.code"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("project.Please enter code"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("project.Main Details"),
        name: "expectedBudget",
        label: this.$t("project.expectedBudget"),
        type: "number", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: this.$t("project.Please enter expected budget"),
        col: 6,
      },
      {
        section: this.$t("project.Main Details"),
        name: "startDate",
        label: this.$t("project.startDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("project.Please enter start date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("project.Main Details"),
        name: "endDate",
        label: this.$t("project.endDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("project.Please enter end date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("project.Main Details"),
        type: "options",  // Dropdown/select field
        name: "stakeholder_ids",
        label: this.$t("project.stakeholders"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("project.Select"),
        multiple: true,
      },
      {
        section: this.$t("project.Main Details"),
        type: "options",  // Dropdown/select field
        name: "parentType",
        label: this.$t("project.parent"),
        options: [
          {
            id: "Initiative",
            name: "Initiative", 
          },
          {
            id: "Program",
            name: "Program",  
          }
        ],
        optionLabel: "name",
        col: 6,
        rules: "",  // Validation: required selection
        description: this.$t("project.Select"),
      },
      {
        section: this.$t("project.Main Details"),
        type: "options",  // Dropdown/select field
        name: "initiative_id",
        label: this.$t("project.initiative"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",  // Validation: required selection
        description: this.$t("project.Select"),
      },
      {
        section: this.$t("project.Main Details"),
        type: "options",  // Dropdown/select field
        name: "program_id",
        label: this.$t("project.program"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",  // Validation: required selection
        description: this.$t("project.Select"),
      },
      {
        section: this.$t("project.Main Details"),
        type: "options",  // Dropdown/select field
        name: "ownerType",
        label: this.$t("project.owner"),
        options: [
          {
            id: "User",
            name: "User", 
          },
          {
            id: "Team",
            name: "Team",  
          }
        ],
        optionLabel: "name",
        col: 6,
        rules: "",  // Validation: required selection
        description: this.$t("project.Select"),
      },
      {
        section: this.$t("project.Main Details"),
        name: "owner_id",
        col: 6,
      },
      {
        section: this.$t("project.Main Details"),
        name: "description",
        label: this.$t("project.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("project.Provide a description"),
        col: 12,
      },
    ];
  },

  methods: {
    /*** start new card design ***/
    async fetchProjects() {
      try {
        this.loading = true;
        const response = await this.api.getAll(this.apiParams);
        this.projects = response || [];
      } catch (error) {
        this.projects = [];
      } finally {
        this.loading = false;
      }
    },

    getProgressColor(percentage) {
      if (percentage >= 80) return '#4CAF50'; // Green
      if (percentage >= 50) return '#FFC107'; // Amber
      if (percentage >= 30) return '#FF9800'; // Orange
      return '#F44336'; // Red
    },

    getStatusColor(status) {
      switch (status) {
        case 'Draft': return 'grey';
        case 'Under Review': return 'blue';
        case 'Approved': return 'indigo';
        case 'In Progress': return 'orange';
        case 'On Hold': return 'deep-orange';
        case 'Completed': return 'green';
        case 'Cancelled': return 'red';
        default: return 'gray';
      }
    },
    /*** end new card design ***/

    // Open the form for adding or editing an item
    openForm() {
      switch (this.$route.name) {
        case "InitiativeDetails":
          this.newItem.parentType = "initiative";
          this.newItem.initiative_id = this.$route.params.id; 
          this.selectParentType(this.newItem.parentType);
          break;
        case "ProgramDetails":
          this.newItem.parentType = 'program';
          this.newItem.program_id = this.$route.params.id;
          this.selectParentType(this.newItem.parentType);
          break;
        default:
          break;
      }

      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    async closeForm() {
      this.isFlipped = false;  // Hide the form
      // this.$refs.table.refreshTable();  // Refresh the table data
      // window.location.reload();
      await this.fetchProjects();
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      if (data.owner_user_ids && data.owner_user_ids.length > 0) {
        this.newItem.ownerType = "user";
        this.newItem.owner_id = data.owner_user_ids;
      } else if (data.owner_team_ids && data.owner_team_ids.length > 0) {
        this.newItem.ownerType = "team";
        this.newItem.owner_id = data.owner_team_ids;
      }

      if (data.initiative_id != null) {
        this.newItem.parentType = "initiative";
        this.newItem.initiative_id = data.initiative_id; 
        this.selectParentType(this.newItem.parentType);
      } else if (data.program_id != null) {
        this.newItem.parentType = "program";
        this.newItem.program_id = data.program_id;
        this.selectParentType(this.newItem.parentType);
      }

      this.isFlipped = true; // Show the form for editing
    },

    // Delete a single item from the table
    async deleteItem(data) {
      await this.api.delete(0, [data.id].map(String));
      this.closeForm();
    },

    // Method to simulate loading completion
    completeLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },

    handleOwnerUsersChange(value) {
      if (!this.newItem) return;
      if (Array.isArray(value)) {
        this.newItem.owner_user_ids = value.filter(item => item !== null && item !== undefined);
      } else if (value === null || value === undefined) {
        this.newItem.owner_user_ids = [];
      } else {
        this.newItem.owner_user_ids = [value];
      }
    },

    handleOwnerTeamsChange(value) {
      if (!this.newItem) return;
      if (Array.isArray(value)) {
        this.newItem.owner_team_ids = value.filter(item => item !== null && item !== undefined);
      } else if (value === null || value === undefined) {
        this.newItem.owner_team_ids = [];
      } else {
        this.newItem.owner_team_ids = [value];
      }
    },

    selectOwnerType(value) {
      if (!this.newItem) return;
      this.newItem.owner_user_ids = null;
      this.newItem.owner_team_ids = null;
    },

    selectParentType(value) {
      if (!value) return;
      else if (value === 'initiative') {
        this.newItem.program_id = null;
        this.isProgramHidden = true;
        this.isInitiativeHidden = false;
      } else {
        this.newItem.initiative_id = null;
        this.isProgramHidden = false; 
        this.isInitiativeHidden = true;
      }
    },

    getProjectStatus(item) {
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

    getRiskLevel(item) {
      const riskLevel = item.riskLevel;
      let label = "";
      let badgeClass = "";
      let iconClass = "";
      if (riskLevel == 'Low') {
        label = "Low";
        badgeClass = "bg-primary";
        // iconClass = "fas fa-long-arrow-down";
      }
      else if (riskLevel == 'Medium') {
        label = "Medium";
        badgeClass = "bg-warning";
        // iconClass = "fas fa-arrows-h";
      }
      else if (status == 'High') {
        label = "High";
        badgeClass = "bg-danger";
        // iconClass = "fas fa-long-arrow-up";
      }
      else {
        label = "N/A";
        badgeClass = "bg-light";
        // iconClass = "fas fa-arrows-alt";
      }
      return `<span class="text-center badge ${badgeClass}" style="display: inline-flex; align-items: center; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
          <i class="${iconClass} me-1"></i>${label}
        </span>`;
    },

    openOwnerDetailsModal(item) {
      this.ownerDetailsModal.currentItem = item;
      this.ownerDetailsLoadingLoading = false;
      this.ownerDetailsModal.show = true;
    },

    openOwnerModal() {
      this.ownerModal.show = true;
    },

    getNameOfUser(userId) {
      if (!userId) return '';
      if (!this.users || !Array.isArray(this.users)) return 'Unknown User';
      const user = this.users.find(u => u.id === userId);
      return user?.full_name || 'Unknown User';
    },

    getEmailOfUser(userId) {
      if (!userId) return '';
      if (!this.users || !Array.isArray(this.users)) return 'Unknown User';
      const user = this.users.find(u => u.id === userId);
      return user?.email || 'Unknown User';
    },

    getPhoneOfUser(userId) {
      if (!userId) return '';
      if (!this.users || !Array.isArray(this.users)) return 'Unknown User';
      const user = this.users.find(u => u.id === userId);
      return user?.phone || 'Unknown User';
    },

    getNameOfTeam(teamId) {
      if (!teamId) return 'Anonymous Team';
      if (!this.teams || !Array.isArray(this.teams)) return 'Unknown Team';
      const team = this.teams.find(t => t.id === teamId);
      return team?.name || 'Unknown Team';
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
        title: this.$t("project.Are you sure?"),
        text: this.$t("project.You are about to change real budget for this project!"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: this.$t("project.Yes, set it!"),
        cancelButtonText: this.$t("project.No, cancel!"),
      });
      if (result.isConfirmed) {
        const data = {
          realBudget: this.form.realBudget,
        };
        const response = await this.api.setRealBudget(itemId, data)
        .then((response) => {
            this.$refs.table.refreshTable(); // Refresh the table
            Swal.fire("Success", this.$t("project.Project Real Budget Set Successfully"), "success"); // Success message
            // this.api.poup(response, "Project Real Budget Set Successfully");
        })
        .catch((error) => {
            Swal.fire("Error", this.$t("project.There was an error set real budget of the Project"), "error"); // Error message
            // this.api.poup({ status: false, message: "An error occurred while changing the status." }, "Error");
        });;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // If user cancels, show a message
        Swal.fire("Cancelled", this.$t("project.The operation was cancelled"), "info");
        // this.api.poup({ status: false, message: "An error occurred while changing the status." }, "Error");
      }
      this.form = {
        realBudget: '',
      },
      this.realBudgetModal.currentItem = null
    },
  },

  watch: {
    'newItem.owner_user_ids': {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          const cleaned = newVal.filter(item => item !== null && item !== undefined);
          if (cleaned.length !== newVal.length) {
            this.$nextTick(() => {
              if (this.newItem) {
                this.newItem.owner_user_ids = cleaned;
              }
            });
          }
        }
      },
      deep: true
    },

    'newItem.owner_team_ids': {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          const cleaned = newVal.filter(item => item !== null && item !== undefined);
          if (cleaned.length !== newVal.length) {
            this.$nextTick(() => {
              if (this.newItem) {
                this.newItem.owner_team_ids = cleaned;
              }
            });
          }
        }
      },
      deep: true
    },
  },
};
</script>

<style>
/* Global styles - no scoped attribute */
#project-view .page-title {
  display: none;
}

#project-view .flipper {
  min-height: 1000px !important;
}
</style>

<style scoped>


/* Start Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 40vh;
  gap: 20px;
}

.loading-spinner {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #3b82f6 transparent transparent transparent;
}

.spinner-ring:nth-child(1) { animation-delay: -0.45s; }
.spinner-ring:nth-child(2) { animation-delay: -0.3s; }
.spinner-ring:nth-child(3) { animation-delay: -0.15s; }

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}
/** End Loading **/

/* Scoped styles for component-specific elements */
.projects-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0.5rem;
}

.col-md-4 {
  padding: 0.5rem;
}

.card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.project-card {
  background: white;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.add-new-card {
  background: rgba(25, 118, 210, 0.08);
  border: 1px dashed #1976D2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.add-new-card:hover {
  background: rgba(25, 118, 210, 0.15);
  transform: scale(1.02);
}

.card-title {
  font-weight: 600;
  color: #2c3e50;
  max-width: 70%;
}

.action-buttons {
  opacity: 0.25;
  transition: opacity 0.2s;
}

.project-card:hover .action-buttons {
  opacity: 1;
}

.progress-section {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.progress-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.progress-percentage {
  font-weight: 600;
  color: #2c3e50;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
}

.status-badge {
  margin-left: auto;
}

.add-btn {
  background-color: #44225c !important;
  border-color: #44225c !important;
  color: white !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .col-md-4 {
    width: 100%;
  }
  
  .action-buttons {
    opacity: 1;
  }
}
</style>
