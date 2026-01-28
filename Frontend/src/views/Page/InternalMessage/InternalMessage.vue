<template>
  <div v-permission:show v-permission:insert v-permission:edit v-permission:delete></div>
  <PurpleDotsLoader v-if="load" />

  <!-- Main Page component where the layout and page structure are set -->
  <main-page v-else ref="page" :isFlipped="isFlipped" 
    :mainPage="$t('governance.governance')"
    :mainSubPage="$t('internal_message.internal_message')" 
    :subPage="$t('internal_message.internal_message')" 
    :titlePage="$t('internal_message.internal_message')">


    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :hideActions="hideActions" :columns="tableColumns" :api="api" :apiParams="{}" :openForm="openForm">

        <template #alert_id="{ item }">
          <span class="title_span">{{ item?.alert_id }}</span>
        </template>

        <template #created_at="{ item }">
          {{ formatDateTimeShort(item.created_at) }}
        </template>

        <template #created_by="{ item }">
          <div class="user-info">
            <div class="user-avatar"
              @click.prevent="openUserDetailsModal(usersForComponants.find(u => u.id === item.created_by))">
              {{ getUserInitials(getUserNameById(item.created_by)) }}</div>
            <span class="user-fullname">{{ getUserNameById(item.created_by) }}</span>
          </div>
        </template>

        <template #priority="{ item }">
          <span v-if="item.priority === 'critical'" class="priority critical">{{ $t("common.critical") }}</span>
          <span v-else class="priority normal">{{ $t("common.normal") }}</span>
        </template>

        <template #channel="{ item }">
          <span v-if="item.channel == 'notification'" class="channel notification">
            {{ $t("notification.notification") }}
          </span>
          <span v-else-if="item.channel == 'email'" class="channel email">
            {{ $t("common.email") }}</span>
          <span v-else class="channel both">{{ $t("internal_message.both") }}</span>
        </template>

        <template #send_to_type="{ item }">
          <span v-if="item.user_ids && item.user_ids.length > 0" class="send_type users">{{
            $t("internal_message.users")
            }}</span>
          <span v-else-if="item.teams_ids && item.teams_ids.length > 0" class="send_type teams">{{
            $t("internal_message.teams") }}</span>
          <span v-else-if="item.job_ids && item.job_ids.length > 0" class="send_type jobs">{{
            $t("internal_message.jobs") }}</span>
          <span v-else-if="item.department_ids && item.department_ids.length > 0" class="send_type departments">{{
            $t("internal_message.departments") }}</span>
          <span v-else class="send_type all_system">{{ $t("internal_message.all_system") }}</span>
        </template>

        <template #send_to="{ item }">
          <span v-if="item.user_ids && item.user_ids.length > 0">
            <!-- Single user: display like created_by -->
            <div v-if="item.user_ids.length === 1" class="user-info">
              <div class="user-avatar"
                @click.prevent="openUserDetailsModal(usersForComponants.find(u => u.id === item.user_ids[0]))">
                {{ getUserInitials(getUserNameById(item.user_ids[0])) }}
              </div>
              <span class="user-fullname">{{ getUserNameById(item.user_ids[0]) }}</span>
            </div>

            <!-- Multiple users: use AvatarGroup -->
            <AvatarGroup v-else :users="item.user_ids.map(id => users[id]).filter(Boolean)" :max-visible="2"
              :spacing="20" :clickable="true" empty-text="N/A" @user-click="openUserDetailsModal" />
          </span>

          <span v-else-if="item.department_ids && item.department_ids.length > 0">
            <template v-for="(id, idx) in item.department_ids" :key="id">
              <a class="title_span">
                {{ departments[id] || "N/A" }}
              </a>
              <span v-if="idx < item.department_ids.length - 1">, </span>
            </template>
          </span>

          <span v-else-if="item.teams_ids && item.teams_ids.length > 0">
            <template v-for="(id, idx) in item.teams_ids" :key="id">
              <a class="title_span">
                {{ teams[id] || "N/A" }}
              </a>
              <span v-if="idx < item.teams_ids.length - 1">, </span>
            </template>
          </span>

          <span v-else-if="item.job_ids && item.job_ids.length > 0">
            <template v-for="(id, idx) in item.job_ids" :key="id">
              <a class="title_span">
                {{ jobs[id] || "N/A" }}
              </a>
              <span v-if="idx < item.job_ids.length - 1">, </span>
            </template>
          </span>

          <span v-else>
            <a class="title_span">
              {{ $t("internal_message.all_users_at_system") }}
            </a>
          </span>
        </template>

      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
        <template #assign_type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="assignTypeInput">
              {{ $t("internal_message.reciever_type") }}
              <span class="font-danger">*</span>
            </label>
            <v-select id="assignTypeInput" v-model="newItem.assign_type" :options="assignTypeOptions"
              :placeholder="$t('internal_message.select_reciever_type')" :reduce="(option) => option.value"
              label="label" clearable></v-select>
          </div>
        </template>

        <template #assignees="{ item }">
          <div class="col-md-6 mb-3" v-if="newItem.assign_type">

            <label for="assigneeInput" v-if="!isAssigneeHidden">
              {{ $t("internal_message.reciever") }}
              <span class="font-danger">*</span>
            </label>

            <UserSelect v-if="newItem.assign_type == 'users'" id="assigneeInput" v-model="newItem.assignees" multiple
              :placeholder="assigneesPlaceholder" :disabled="isAssigneeDisabled" :hidden="isAssigneeHidden"
              :selectable="(option) => isOptionSelectable(option, 'assignees')" />

            <TeamSelect v-else-if="newItem.assign_type == 'teams'" id="assigneeInput" v-model="newItem.assignees"
              multiple :placeholder="assigneesPlaceholder" :disabled="isAssigneeDisabled" :hidden="isAssigneeHidden"
              :selectable="(option) => isOptionSelectable(option, 'assignees')" />

            <LazySelectField v-else-if="newItem.assign_type === 'departments'" name="assigneeInput" options="Department"
              option-label="name" option-value="id" clearable id="assigneeInput" v-model="newItem.assignees"
              :options="assigneesOptions" multiple :placeholder="assigneesPlaceholder" :label="assigneesLabel"
              :disabled="isAssigneeDisabled" :hidden="isAssigneeHidden"
              :selectable="(option) => isOptionSelectable(option, 'assignees')" />

            <LazySelectField v-else-if="newItem.assign_type === 'jobs'" name="assigneeInput" options="Job"
              option-label="name" option-value="id" clearable id="assigneeInput" v-model="newItem.assignees"
              :options="assigneesOptions" multiple :placeholder="assigneesPlaceholder" :label="assigneesLabel"
              :disabled="isAssigneeDisabled" :hidden="isAssigneeHidden"
              :selectable="(option) => isOptionSelectable(option, 'assignees')" />

          </div>

          <div v-else></div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- View user details modal -->
  <ViewUserDetails :viewUserModal="viewUserModal" :userData="userData" @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event" />

</template>

<script>
// Importing necessary components and API modules
import InternalMessage from "@/API/InternalMessage/InternalMessage";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import Department from "@/API/Department/Department";
import Team from "@/API/Team/Team";
import Job from "@/API/Job/Job";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import { formatDateTimeShort, htmlToText, truncateText } from "@/utils/helpers";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import PurpleDotsLoader from '@/components/PurpleDotsLoader.vue';
import AvatarGroup from '@/components/AvatarGroup.vue';
import LazySelectField from "@/components/LazySelectField.vue";
import UserSelect from "@/components/UserSelect.vue";
import TeamSelect from "@/components/TeamSelect.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    vSelect,
    ViewUserDetails,
    AvatarGroup,
    PurpleDotsLoader,
    LazySelectField,
    UserSelect,
    TeamSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new InternalMessage();
    const apiParams = {};
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    const userApi = new User();
    const departmentApi = new Department();
    const teamApi = new Team();
    const jobApi = new Job();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      departmentApi,
      teamApi,
      jobApi,
    };
  },

  async mounted() {
    await this.fetchDepartments();
    await this.fetchUsers();
    await this.fetchTeams();
    await this.fetchJobs();

    this.load = false;
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {
        assign_type: null,
        assignees: [],
        department_ids: [],
        job_ids: [],
        user_ids: [],
        teams_ids: [],
        selected_users: [], // Array of objects: { id: string, email: string }
        all_system: "false",
      }, // Data object to store the currently selected item for editing or new item
      usersForComponants: [],
      users: [], // This will store all users with their full objects
      departments: [],
      allDepartments: [],
      teams: [],
      allTeams: [],
      jobs: [],
      userData: [],
      allJobs: [],
      assignTypeOptions: [
        { value: 'users', label: "Users" },
        { value: 'teams', label: "Teams" },
        { value: 'departments', label: "Departments" },
        { value: 'jobs', label: "Jobs" },
        { value: 'all_system', label: "All System" },
      ],
      assigneesOptions: [],
      formatDateTimeShort,
      htmlToText,
      truncateText,
      viewUserModal: false,
      load: true,
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const canEdit = false;
        const canDelete = false;

        return {
          edit: !canEdit,
          delete: !canDelete,
        };
      };
    },

    // Check if assignees select should be disabled
    isAssigneeDisabled() {
      return !this.newItem.assign_type || this.newItem.assign_type === 'all_system';
    },

    isAssigneeHidden() {
      return this.newItem.assign_type && this.newItem.assign_type === 'all_system';
    },

    // Determine the label field for assignees based on assign_type
    assigneesLabel() {
      switch (this.newItem.assign_type) {
        case 'users': return 'full_name';
        case 'teams': return 'name';
        case 'departments': return 'name';
        case 'jobs': return 'name';
        default: return 'name';
      }
    },

    // Set placeholder text based on assign_type
    assigneesPlaceholder() {
      if (!this.newItem.assign_type) {
        return this.$t('internal_message.select_reciever_type_first');
      }
      return this.$t('internal_message.select_reciever');
    }
  },

  watch: {
    // Watch for changes in assign_type and update assignees options accordingly
    'newItem.assign_type': {
      handler(newAssignType, oldAssignType) {
        // Reset assignees when type changes
        this.newItem.assignees = [];

        // Update all_system flag
        if (newAssignType === 'all_system') {
          this.newItem.all_system = "true";
          this.newItem.selected_users = this.getAllUsersWithEmail(); // Get all users with email when all_system is chosen
        } else {
          this.newItem.all_system = "false";
          this.newItem.selected_users = []; // Reset selected users
        }

        // If assign_type is cleared (set to null), reset all ID arrays
        if (newAssignType === null) {
          this.resetAllIdArrays();
        }

        // Load appropriate options based on selected type
        this.loadAssigneesOptions(newAssignType);
      },
      immediate: true
    },

    // Watch for changes in assignees and update the appropriate array
    'newItem.assignees': {
      handler(newAssignees) {
        // Update the appropriate array based on assign_type
        switch (this.newItem.assign_type) {
          case 'users':
            this.newItem.user_ids = newAssignees;
            this.newItem.selected_users = this.getUsersWithEmailByIds(newAssignees);
            break;
          case 'teams':
            this.newItem.teams_ids = newAssignees;
            this.newItem.selected_users = this.getUsersWithEmailByTeams(newAssignees);
            break;
          case 'departments':
            this.newItem.department_ids = newAssignees;
            this.newItem.selected_users = this.getUsersWithEmailByDepartments(newAssignees);
            break;
          case 'jobs':
            this.newItem.job_ids = newAssignees;
            this.newItem.selected_users = this.getUsersWithEmailByJobs(newAssignees);
            break;
        }

        console.log("Selected users with emails:", this.newItem.selected_users);
      },
      deep: true
    }
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "alert_id", title: this.$t("internal_message.alert_id"), data: "alert_id", defaultContent: "N/A" },
      { id: "title", title: this.$t("internal_message.title"), data: "title", defaultContent: "N/A" },
      { id: "priority", title: this.$t("internal_message.priority"), data: "priority", defaultContent: "N/A" },
      { id: "send_to_type", title: this.$t("internal_message.send_to_type"), data: null, defaultContent: "N/A" },
      { id: "send_to", title: this.$t("internal_message.send_to"), data: null, defaultContent: "N/A" },
      { id: "channel", title: this.$t("internal_message.channel"), data: "channel", defaultContent: "N/A" },
      { id: "created_by", title: this.$t("common.created_by"), data: "created_by", defaultContent: "N/A" },
      { id: "created_at", title: this.$t("common.created_at"), data: "created_at", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "title",
        label: this.$t("internal_message.title"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        col: 12, // Column size in the form layout
      },
      {
        name: "content",
        label: this.$t("internal_message.content"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        col: 12,
      },
      {
        type: "options",  // Dropdown/select field
        name: "priority",
        label: this.$t("internal_message.priority"),
        options: [
          { id: "normal", name: "Normal" },
          { id: "critical", name: "Critical" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
      },
      {
        type: "options",  // Dropdown/select field
        name: "channel",
        label: this.$t("internal_message.channel"),
        options: [
          { id: "notification", name: "Notification" },
          { id: "email", name: "Email" },
          { id: "both", name: "Both" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
      },
      {
        name: "assign_type",
      },
      {
        name: "assignees",
      },
    ];
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
      this.resetForm();  // Reset the form data
    },

    // Reset all form data including ID arrays
    resetForm() {
      this.newItem = {
        assign_type: null,
        assignees: [],
        department_ids: [],
        job_ids: [],
        user_ids: [],
        teams_ids: [],
        selected_users: [], // Array of objects: { id: string, email: string }
        all_system: "false",
      };
      this.assigneesOptions = [];
      this.resetAllIdArrays();
    },

    // Reset all ID arrays to empty arrays
    resetAllIdArrays() {
      this.newItem.department_ids = [];
      this.newItem.job_ids = [];
      this.newItem.user_ids = [];
      this.newItem.teams_ids = [];
      this.newItem.selected_users = [];
      console.log("All ID arrays have been reset");
    },

    // Load options for assignees based on assign_type
    loadAssigneesOptions(type) {
      switch (type) {
        case 'users':
          this.assigneesOptions = this.usersForComponants;
          break;
        case 'teams':
          this.assigneesOptions = this.allTeams;
          break;
        case 'departments':
          this.assigneesOptions = this.allDepartments;
          break;
        case 'jobs':
          this.assigneesOptions = this.allJobs;
          break;
        case 'all_system':
          this.assigneesOptions = [];
          break;
        default:
          this.assigneesOptions = [];
      }

      console.log(`Loaded ${this.assigneesOptions.length} options for type: ${type}`);
    },

    // Get all users with email (for all_system option)
    getAllUsersWithEmail() {
      return this.usersForComponants.map(user => ({
        id: user.id,
        email: user.email,
        name: user.full_name,
      }));
    },

    // Get users with email by their IDs
    getUsersWithEmailByIds(userIds) {
      return this.usersForComponants
        .filter(user => userIds.includes(user.id))
        .map(user => ({
          id: user.id,
          email: user.email,
          name: user.full_name,
        }));
    },

    // Get users with email by department IDs
    getUsersWithEmailByDepartments(departmentIds) {
      return this.usersForComponants
        .filter(user => departmentIds.includes(user.department_id))
        .map(user => ({
          id: user.id,
          email: user.email,
          name: user.full_name,
        }));
    },

    // Get users with email by job IDs
    getUsersWithEmailByJobs(jobIds) {
      return this.usersForComponants
        .filter(user => jobIds.includes(user.job_id))
        .map(user => ({
          id: user.id,
          email: user.email,
          name: user.full_name,
        }));
    },

    // Get users with email by team IDs
    getUsersWithEmailByTeams(teamIds) {
      return this.usersForComponants
        .filter(user => user.team_ids && user.team_ids.some(teamId => teamIds.includes(teamId)))
        .map(user => ({
          id: user.id,
          email: user.email,
          name: user.full_name,
        }));
    },

    async fetchUsers() {
      try {
        const usersResponse = await this.userApi.getAll({ select: "id|full_name|type|department_id|job_id|team_ids|phone|username|email" });
        this.usersForComponants = usersResponse;
        this.users = usersResponse.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});

        console.log("Fetched users:", this.usersForComponants);

      } catch (error) {
        console.error("Failed to load users:", error);
      }
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name"
        });

        this.departments = deptResponse.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});

        this.allDepartments = deptResponse;
        console.log("Fetched departments:", this.allDepartments.length);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    },

    async fetchTeams() {
      try {
        const teamsResponse = await this.teamApi.getAll({
          select: "id|name"
        });

        this.teams = teamsResponse.reduce((map, team) => {
          map[team.id] = team.name;
          return map;
        }, {});

        this.allTeams = teamsResponse;
        console.log("Fetched teams:", this.allTeams.length);
      } catch (error) {
        console.error("Failed to load Teams:", error);
      }
    },

    async fetchJobs() {
      try {
        const jobsResponse = await this.jobApi.getAll({
          select: "id|name"
        });

        this.jobs = jobsResponse.reduce((map, job) => {
          map[job.id] = job.name;
          return map;
        }, {});

        this.allJobs = jobsResponse;
        console.log("Fetched jobs:", this.allJobs.length);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      }
    },

    getUserNameById(userId) {
      if (!this.usersForComponants || !Array.isArray(this.usersForComponants)) return null;
      const user = this.usersForComponants.find(item => item.id === userId);
      return user ? user.full_name : null;
    },

    openUserDetailsModal(selectedUserData) {
      this.userData = { ...selectedUserData };
      try {
        let userDepartment = this.departments[this.userData.department_id] ?? {};
        this.userData.department = userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    },

    // Determine whether an option is selectable in assignees v-select
    isOptionSelectable(option, fieldName) {
      // Normalize option id
      const optId = option && (option.id || option.value || option);

      // Current value for this field
      const currentValue = this.newItem[fieldName];

      // If multiple-select and option already selected in this field, not selectable
      if (Array.isArray(currentValue) && currentValue.includes(optId)) {
        return false;
      }

      // Check if option is selected in any other fields of newItem
      for (const key in this.newItem) {
        if (key === fieldName) continue; // skip current field

        const value = this.newItem[key];

        if (Array.isArray(value) && value.includes(optId)) {
          return false;
        }

        if (!Array.isArray(value) && value === optId) {
          return false;
        }
      }

      // Otherwise selectable
      return true;
    },
    getUserInitials(name) {
      if (!name) return 'U';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.title_span {
  display: inline-flex;
  align-items: center;
  width: max-content;
  height: 20px;
  opacity: 1;
  border-radius: 10px;
  padding: 11px 9px;
  gap: 8px;
  background: #d0b5e3;
  font-size: 12px;
  color: #6e3894;
}

.priority,
.send_type,
.channel {
  display: inline-flex;
  align-items: center;
  width: max-content;
  height: 20px;
  opacity: 1;
  border-radius: 10px;
  padding: 8px 9px;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
}

.send_type.users,
.channel.notification,
.priority.normal {
  background: #b6caae;
  color: #255f0b;
}

.send_type.all_system,
.channel.both,
.priority.critical {
  background: #8d1f1f;
  color: #ffffff;
}

.send_type.jobs {
  background: #EBDCB3;
  color: #C4951B;
}

.send_type.teams {
  background: #D6EED3;
  color: #2F9826;
}

.send_type.departments,
.channel.email {
  background: #b3c0eb;
  color: #2c1bc4;
}


.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #D0B5E3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235C;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style>
#example-table thead th:last-child,
#example-table tbody td:last-child {
  display: none !important;
}
</style>