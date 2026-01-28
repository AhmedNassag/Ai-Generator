<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('user.Configuration')"
    :mainSubPage="$t('user.UserManagement')" :subPage="$t('user.User')" :titlePage="$t('user.UserManagement')">
    <div v-permission:show v-permission:update v-permission:delete></div>
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" v-permission:show id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>

        <template #status="{ item }">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" v-model="item.status"
              @change="activeDeactive(item)" v-permission:activeDeactive>
            <!-- <label class="form-check-label">{{ isActive(item.status) ? $t('user.Active') : $t('user.Deactive')
            }}</label> -->
          </div>
        </template>

        <template #is_locked="{ item }">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" disabled
              v-model="item.is_locked">
            <!-- <label class="form-check-label">{{ isLocked(item.is_locked) ? $t('user.Locked') : $t('user.Unlocked')
            }}</label> -->
          </div>
        </template>

        <template #Department="{ item }">
          {{ item.department?.name }}
        </template>

        <template #Job="{ item }">
          {{ item.job?.name }}
        </template>

        <template #Manager="{ item }">
          {{ item.manager?.full_name }}
        </template>

        <template #Teams="{ item }">
          <div v-if="item.teams && item.teams.length">
            <!-- <li v-for="team in item.teams" :key="team._id">
              <i class="fas fa-list"></i> {{ team.name }}
            </li> -->
            <span v-for="team in item.teams" :key="team._id" class="badge bg-primary me-2">
              {{ team.name }}
            </span>
          </div>
          <span v-else>{{ $t('user.NoTeamsAssigned') }}</span>
        </template>

      </DataTable>

    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">

        <!-- <template #department_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="assigneeInput">Department</label>
            <VSelect :options="departmentData" v-model="selectedDepartment" :multiple="false"
              placeholder="Select multiple options" @change="handleMultiSelectChange" />
          </div>
        </template>

<template #job_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="assigneeInput">Job</label>
            <VSelect :options="jobData" v-model="selectedJob" :multiple="false"
              placeholder="Select multiple options" @change="handleMultiSelectChange" />
          </div>
        </template> -->

        <template #department_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="department_id">{{ $t("user.department") }}</label>
            <!-- <v-select v-model="newItem.department_id" :options="departmentData" :reduce="option => option.id"
              @update:modelValue="getJobs" :placeholder="$t('user.SelectDepartment')" label="name"></v-select> -->

                 <LazySelectField
                    name="department_id"
                    v-model="newItem.department_id"
                    :placeholder="$t('user.SelectDepartment')"
                    options="Department"
                    :on-update="getJobs"
                    option-label="name"
                    option-value="id"
                    clearable
                  />
          </div>
        </template>

        <template #job_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="job_id">{{ $t("user.job") }}</label>
            <v-select 
              id="job_id" 
              v-model="newItem.job_id" 
              :options="jobData" 
              :reduce="option => option.id"
              :placeholder="$t('user.SelectJob')" 
              label="name"
              @update:modelValue="handleJobSelectionForUser"
            >
              <!-- Customize the dropdown options to show manager status -->
              <template #option="option">
                <div 
                  :class="{'disabled-option': isJobDisabled(option)}" 
                  style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px;"
                >
                  <span :style="{ opacity: isJobDisabled(option) ? 0.5 : 1 }">{{ option.name }}</span>
                  <div style="display: flex; gap: 4px; align-items: center;">
                    <span 
                      v-if="option.is_manager" 
                      class="badge bg-success"
                      style="font-size: 10px; padding: 2px 8px;"
                    >
                      Manager
                    </span>
                    <span 
                      v-if="isJobDisabled(option)" 
                      class="badge bg-secondary"
                      style="font-size: 10px; padding: 2px 8px;"
                    >
                      Assigned
                    </span>
                  </div>
                </div>
              </template>
              
              <!-- Customize the selected item display -->
              <template #selected-option="option">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span>{{ option.name }}</span>
                  <span 
                    v-if="option.is_manager" 
                    class="badge bg-success"
                    style="font-size: 9px; padding: 1px 6px;"
                  >
                    M
                  </span>
                </div>
              </template>
            </v-select>
          </div>
        </template>

        <template #team_ids="{ item }">
          <div class="col-md-6 mb-3">
            <label for="team_ids">{{ $t("user.teams") }}</label>
            <!-- <v-select id="team_ids" v-model="newItem.team_ids" :options="TeamData" :reduce="option => option.id"
              :placeholder="$t('user.SelectTeam')" label="name" multiple></v-select> -->

               <TeamSelect :multiple="true" :placeholder="$t('user.SelectTeam')"  name="team_ids" v-model="newItem.team_ids" />
          </div>
        </template>

      </Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import user from "@/API/User/User";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Department from "@/API/Department/Department";
import Job from "@/API/Job/Job";
import Team from "@/API/Team/Team";
import axios from "axios";
import vSelect from "vue-select";
import Auth from "@/API/Auth";
import { notify } from "@kyvg/vue3-notification";
import TeamSelect from "@/components/TeamSelect.vue";
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    vSelect,
    TeamSelect,
    LazySelectField,
  },

  setup() {
    // alert(await Auth.loggedIn());
    // Initialize API and other required properties
    const api = new user();
    const departmentApi = new Department();
    const jobApi = new Job();
    const teamApi = new Team();
    const authUser = Auth.USER;

    // const apiParams = { with: ["department", "role", "job", "manager", "teams"] };
    const apiParams = {
      with: ["department", "role", "job", "manager", "teams"],
      search: ""
      // select: 'id|email|full_name|phone|type|status|is_locked',
    };
    // const apiParams = { "with[]": ["department", "role","job", "manager", "team"] };

    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,

      departmentApi,
      jobApi,
      teamApi,
      authUser,
    };
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      departmentData: [],
      teamData: [],
      jobData: [],
      userData: [],

      required: { "password": "required" },
      selectedDepartment: null,
      selectedJob: null,
    };
  },

  created() {
    // this.apiParams = { "with[]": ["department", "role", "job", "manager", "team"] };
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("user.email"), data: "email", defaultContent: "N/A" },
      { title: this.$t("user.full_name"), data: "full_name", defaultContent: "N/A" },
      { title: this.$t("user.phone"), data: "phone", defaultContent: "N/A" },
      { title: this.$t("user.type"), data: "type", defaultContent: "N/A" },
      {
        id: "status",
        title: this.$t("user.status"),
        data: "status",
        defaultContent: "N/A",
      },

      {
        id: "is_locked",
        title: this.$t("user.is_locked"),
        data: "is_locked",
        defaultContent: "N/A",
      },

      { id: "Department", title: this.$t("user.Department"), data: "department.name", defaultContent: "N/A" },
      { id: "Job", title: this.$t("user.Job"), data: "job.name", defaultContent: "N/A" },
      { id: "Teams", title: this.$t("user.Teams"), data: "team.name", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "full_name",
        label: this.$t("user.fullName"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("user.EnterFullName"),
        col: 6, // Column size in the form layout
      },

      {
        name: "username",
        label: this.$t("user.userName"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("user.EnterUsername"),
        col: 6, // Column size in the form layout
      },

      {
        name: "email",
        label: this.$t("user.useremail"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: this.$t("user.EnterValidEmail"),
        col: 6,
      },

      {
        name: "phone",
        label: this.$t("user.phone"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("user.EnterPhone"),
        col: 6, // Column size in the form layout
      },

      {
        name: "password",
        label: this.$t("user.password"),
        type: "password", // Text input field
        rules: this.required["password"], // Validation rule: required field
        description: this.$t("user.EnterPassword"),
        col: 6, // Column size in the form layout
      },

      // {
      //   name: "manager_id",
      //   type: "options",  // Dropdown/select field
      //   label: this.$t("user.manager"),
      //   options: [],
      //   optionLabel: "name",
      //   col: 6,
      //   rules: "required",  // Validation: required selection
      //   description: this.$t("user.SelectManager"),
      // },

      {
        type: "options",  // Dropdown/select field
        name: "department_id",
        label: this.$t("user.department"),
        options: "Department",
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("user.SelectDepartmentDescription"),
        // functions: this.handleDepartmentChange, // without ()
      },

      {
        type: "options",  // Dropdown/select field
        name: "team_ids",
        label: this.$t("user.teams"),
        options: "Team",
        optionLabel: "name",
        col: 6,
        multiple: true,
        rules: "required",  // Validation: required selection
        description: this.$t("user.SelectTeamDescription"),
      },

      {
        type: "options",  // Dropdown/select field
        name: "job_id",
        label: this.$t("user.job"),
        options: "Job",
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("user.SelectJobDescription"),
      },
      {
        type: "checkbox",
        name: "super",
        label: this.$t("user.super"),
        rules: "required",  // Validation: required selection
        description: this.$t("user.SelectSuperUser"),
      },
    ];
  },

  methods: {

    isLocked(value) {
      return value === true || value === "true";
    },

    isActive(value) {
      return value === true || value === "true";
    },

    async loadUserData() {
      try {
        const response = await this.api.getAll({ select: 'id|full_name|job_id' });
        this.userData = response.map(user => ({ id: user.id, name: user.full_name }));
        this.fromFields.find(field => field.name === "manager_id").options = this.userData;
      } catch (error) {
        console.error(this.$t("user.FailedLoadUserData"), error);
      }
    },

    async getJobs(id) {
      this.newItem.job_id = null;
      this.jobData = [];
      const data = await this.departmentApi.getAll(
        {
          filter: "id|" + id + "|= ",
          with: ['jobs'] // Get jobs without users relation
        }
      );
      
      // Get jobs and enrich them with user assignment info from already loaded users
      const jobs = data[0]?.jobs || [];
      
      // For each job, check if it's assigned based on existing user data
      this.jobData = jobs.map(job => {
        // Find users assigned to this job in this department
        const assignedUsers = this.users ? this.users.filter(user => {
          // Check if user's job_id matches this job
          // AND user's department_id matches the selected department
          // AND the job's department_ids includes the user's department
          return user.job_id === job.id && 
                 user.department_id === id &&
                 (job.department_ids && job.department_ids.includes(id));
        }) : [];
        
        // Add users array to job object
        return {
          ...job,
          users: assignedUsers
        };
      });
    },

    // Check if a job is disabled (manager job already assigned to another user)
    isJobDisabled(job) {
      if (!job.is_manager) return false; // Non-manager jobs are never disabled
      
      // If the job has users and this is not an edit of that user, disable it
      if (job.users && job.users.length > 0) {
        // If we're editing a user, check if they already have this job
        if (this.newItem.id) {
          const currentUserHasThisJob = job.users.some(user => user.id === this.newItem.id);
          return !currentUserHasThisJob; // Disable if another user has it
        }
        return true; // Disable for new users if job is taken
      }
      return false;
    },

    // Handle job selection for user
    handleJobSelectionForUser(selectedJobId) {
      if (!selectedJobId) {
        this.newItem.job_id = null;
        return;
      }

      const selectedJob = this.jobData.find(job => job.id === selectedJobId);
      
      if (selectedJob && this.isJobDisabled(selectedJob)) {
        // Revert the selection
        this.newItem.job_id = null;
        
        // Show notification
        notify({
          title: this.$t('common.warning') || 'Warning',
          text: "This manager job is already assigned to another user. Please select a different job.",
          type: 'error',
          duration: 5000
        });
      } else {
        this.newItem.job_id = selectedJobId;
      }
    },

    async loadDepartmentData() {
      try {
        const response = await this.departmentApi.getAll({ select: 'id|name|job_ids' });
        this.departmentData = response.map(department => ({ id: department.id, name: department.name , job_ids: department.job_ids }));
        this.fromFields.find(field => field.name === "department_id").options = response;
      } catch (error) {
        console.error(this.$t("user.FailedLoadUserData"), error);
      }
    },

    async loadJobData(departmentId = null) {
      try {
        let response;
        if (departmentId) {
          response = await this.jobApi.getAll({
            filter: `department_ids|${departmentId}|=`,
            select: 'id|name'
          });
        } else {
          response = [];
          // response = await this.jobApi.getAll({ select: 'id|name' });
        }

        this.jobData = response.map(job => ({ id: job.id, name: job.name }));
        this.fromFields.find(field => field.name === "job_id").options = response;
      } catch (error) {
        console.error(this.$t("user.FailedLoadUserData"), error);
      }
    },

    async loadTeamData() {
      try {
        const response = await this.teamApi.getAll({ select: 'id|name' });
        this.teamData = response.map(team => ({ id: team.id, name: team.name }));
        this.fromFields.find(field => field.name === "team_ids").options = response;
      } catch (error) {
        console.error(this.$t("user.FailedLoadUserData"), error);
      }
    },

    async loadSelectsData() {
      try {
        const usersResponse = await this.api.getAll({
          select: "id|full_name|job_id|department_id",
        });
        this.users = usersResponse;

        const departmentsResponse = await this.departmentApi.getAll({
          select: "id|name",
        });
        this.departmentData = departmentsResponse;

        const jobsResponse = await this.jobApi.getAll({
          select: "id|name|is_manager|department_ids",
        });
        this.jobData = jobsResponse;

        // const teamsResponse = await this.teamApi.getAll({
        //   select: "id|name",
        // });
        // this.TeamData = teamsResponse;

      } catch (error) {
        console.error(this.$t("user.FailedLoadData"), error);
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.fromFields.find(field => field.name === "username").disabled = false;
      this.fromFields.find(field => field.name === "email").disabled = false;
      this.fromFields.find(field => field.name === "password").rules = "required";
      this.jobData = [];
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
   async closeForm() {
      if (this.newItem.id === this.authUser.id) {
        Auth.logOut();
      } else {
        this.isFlipped = false;  // Hide the form
        this.$refs.table.refreshTable();  // Refresh the table data
        this.newItem = {};  // Clear the current item data
        await this.loadSelectsData();
      }
    },

    // Set the item data for editing
    editItem(data) {
      this.fromFields.find(field => field.name === "username").disabled = true;
      this.fromFields.find(field => field.name === "email").disabled = true;
      this.fromFields.find(field => field.name === "password").rules = "";
      this.newItem = data;  // Set the current item to edit

      this.newItem.team_ids = Array.isArray(this.newItem.team_ids)
        ? this.newItem.team_ids.filter(id => id !== null)
        : [];
      this.isFlipped = true; // Show the form for editing

    this.jobData = this.jobData.filter(job => job?.department_ids?.includes(this.newItem.department_id));
    
    },

    // get all jobs for the selected department 
    

    // toggleActiveStatus(item) {
    //   console.log(`User ${item.full_name} is now ${item.status ? 'active' : 'inactive'}`);
    //   axios.get(`user/activeDeactive/${item.id}`)
    //     .then(response => {
    //       this.api.poup(response, this.$t("user.ActiveDeactive"));
    //     })
    //     .catch(error => {
    //       this.api.poup({ status: false, message: this.$t("user.ErrorChangingStatus") }, this.$t("user.Error"));
    //     });
    // },

    activeDeactive(item) {
      this.api.activeDeactive(item.id)
        .then(response => {
          this.api.poup(response, this.$t("user.ActiveDeactive"));
        })
        .catch(error => {
          this.api.poup({ status: false, message: error.message }, this.$t("user.Error"));
        });
    }

  },

  mounted() {
    this.loadSelectsData();
  }
};
</script>
<style>
@import "vue-select/dist/vue-select.css";

/* Disabled job option styling */
.disabled-option {
  cursor: not-allowed !important;
  opacity: 0.6;
  background-color: #f5f5f5;
}

.disabled-option:hover {
  background-color: #f5f5f5 !important;
}

/* Badge styling */
.badge.bg-success {
  background-color: #28a745 !important;
  color: white;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
  color: white;
}
</style>