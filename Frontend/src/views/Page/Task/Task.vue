<template>
  <div v-permission:show v-permission:insert v-permission:edit v-permission:delete></div>

  <PurpleDotsLoader v-if="load" />

  <!-- Main Page component where the layout and page structure are set -->
  <main-page v-else ref="page" :isFlipped="isFlipped" 
    :mainPage="$t('governance.governance')"
    :mainSubPage="$t('task.task_mngt')" 
    :subPage="$t('task.tasks')" :titlePage="$t('task.tasks')"
    :showInsightsTab="true" :loading="load" v-permission:show>
    <!-- Slot for rendering the DataTable -->
    <!-- Statistics Slot -->
    <template #statistics>
      <div class="statistics-content">
        <!-- Metrics Cards Row -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="metric-card bg-primary-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ taskStatisticsData.totalTasks || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("task.total_tasks") || "Total Tasks" }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-warning-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-hourglass-half"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ taskStatisticsData.inProgressTasks || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("task.in_progress_tasks") || "In Progress" }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-success-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ taskStatisticsData.completedTasks || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("task.completed_tasks") || "Completed" }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-danger-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ taskStatisticsData.overdueTasks || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("task.overdue_tasks") || "Overdue" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="row">
          <!-- Task Status Distribution -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("task.status_distribution") || "Task Status Distribution"
                }}
              </h6>
              <highcharts :options="statusDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Tasks by Assignee -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{ $t("task.assignee_distribution") || "Tasks by Assignee" }}
              </h6>
              <highcharts :options="assigneeDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Task Completion Timeline -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("task.completion_timeline") || "Task Completion Timeline"
                }}
              </h6>
              <highcharts :options="completionTimelineChart"></highcharts>
            </div>
          </div>

          <!-- Tasks Due This Month -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("task.due_date_distribution") || "Tasks Due by Date" }}
              </h6>
              <highcharts :options="dueDateDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Task Completion Rate -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("task.completion_rate") || "Completion Rate" }}
              </h6>
              <highcharts :options="completionRateChart"></highcharts>
            </div>
          </div>

          <!-- Tasks by Completed User -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("task.completed_by_distribution") ||
                  "Tasks Completed by User"
                }}
              </h6>
              <highcharts :options="completedByDistributionChart"></highcharts>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #datatable>
      <!-- here we add custom buttons ex: filters -->

      <!-- Tabs section  -->
      <tabs-component v-model="activeTab" :tabs="tabs" @update:modelValue="changeTab" />

      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'" v-permission:show
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions" :filters="taskFilters">
        <!-- Customizing the display of the column in the table -->
        <template #assign_type="{ item }">
          <span v-if="item.assign_type === 'user'" class="priority low">{{
            $t("task.users")
            }}</span>
          <span v-else-if="item.assign_type === 'team'" class="priority urgent">{{ $t("task.teams") }}</span>
        </template>

        <template #priority="{ item }">
          <span :class="['priority', item?.priority]">
            {{ getPriorityValue(item?.priority) }}
          </span>
        </template>

        <template #start_date="{ item }">
          {{ formatDateShort(item?.start_date) }}
        </template>

        <template #due_date="{ item }">
          <span :class="{ 'text-danger': new Date() >= new Date(item.due_date) }">
            {{ formatDateShort(item?.due_date) }}
          </span>
        </template>

        <template #category="{ item }">
          <span class="title_span">
            {{ getCategoryNameById(item?.category_id) }}
          </span>
        </template>

        <template #created_by="{ item }">
          <div class="user-info">
            <div class="user-avatar" @click.prevent="
              openUserDetailsModal(
                users.find((user) => user.id === item.created_by)
              )
              ">
              {{ getUserInitials(getUserNameById(item.created_by)) }}
            </div>
            <span class="user-fullname">{{
              getUserNameById(item.created_by)
              }}</span>
          </div>
        </template>

        <template #task.title="{ item }">
          {{ truncateText(item.title) }}
        </template>

        <template #task.start_date="{ item }">
          {{ formatDateShort(item.start_date) }}
        </template>
        <template #task.due_date="{ item }">
          {{ formatDateShort(item.due_date) }}
        </template>

        <template #status="{ item }">
          <span :class="['status', getStatusClass(item)]" @click.prevent="openChangeStatusModal(item)">
            {{ getStatusLabel(item) }}
          </span>
        </template>

        <template #assignee="{ item }">
          <div v-if="item.assign_type == 'user'" class="user-info">
            <div class="user-avatar" @click.prevent="
              openUserDetailsModal(
                users.find((user) => user.id === item.assignee_id)
              )
              ">
              {{ getUserInitials(getUserNameById(item.assignee_id)) }}
            </div>
            <span class="user-fullname">{{
              getUserNameById(item.assignee_id)
              }}</span>
          </div>

          <span v-if="item.assign_type == 'team'" class="title_span">
            {{
              teams.find((team) => team.id === item.assignee_id)?.name || "N/A"
            }}
          </span>
        </template>

        <template #addAction="{ item }">
          <v-list-item v-anyPermission="['view']" @click="openModal(item)" class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("common.view") }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="formFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
        <template #assign_type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="assignTypeInput">{{ $t("task.assign_type") }}</label>
            <v-select id="assignTypeInput" v-model="newItem.assign_type" :options="assignTypeOptions"
              :placeholder="$t('task.select_assign_type')" :reduce="(option) => option.value"
              :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'" label="label" clearable></v-select>
          </div>
        </template>

        <template #assignee_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="assigneeInput">{{ $t("task.assignee") }}</label>

            <TeamSelect v-if="newItem.assign_type === 'team'" name="assignee_id" v-model="newItem.assignee_id" />

            <UserSelect v-else-if="newItem.assign_type == 'user'" id="assigneeInput" v-model="newItem.assignee_id" />

            <v-select v-else id="assigneeInput" v-model="newItem.assignee_id" :options="[]"
              :reduce="(option) => option.id" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
              :placeholder="$t('task.select_assignee')" disabled />
          </div>
        </template>

      </Form>
    </template>
  </main-page>

  <!-- View task modal -->
  <ViewTask :viewModal="viewModal" :taskData="taskData" @close="viewModal = false" :users="users" :teams="teams"
    :formateDate="formatDateShort" :getCategoryNameById="getCategoryNameById" :stripHtml="htmlToTextRegex"
    @update:viewModal="viewModal = $event" />

  <!-- View user details modal -->
  <ViewUserDetails :viewUserModal="viewUserModal" :userData="userData" @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event" />

  <!-- View team details modal -->
  <ViewTeamDetails :viewTeamModal="viewTeamModal" :teamData="teamData" @close="viewTeamModal = false"
    @update:viewTeamModal="viewTeamModal = $event" />

  <!-- change task status modal -->
  <Modal v-model="viewStatusModal" :title="$t('task.change_owner_status')" size="medium" :hasSubmit="true"
    :loading="statusLoading" :submitText="$t('common.save')" :cancelText="$t('common.close')"
    @submit="changeStatus(taskStatus?.id, taskStatus?.status)" @close="viewStatusModal = false">
    <div class="mb-5">
      <v-select class="mb-5" label="name" :options="statusOptions" v-model="taskStatus.status"
        :reduce="(option) => option.id" :clearable="false" />
    </div>
  </Modal>
</template>

<script>
// Importing necessary components and API modules
import task from "@/API/Task/Task";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Category from "@/API/Category/Category";
import { defineRule } from "vee-validate";
import axios, { AxiosRequestConfig } from "axios";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import ViewTask from "./components/ViewTask.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue"; // Importing the view user details component
import Department from "@/API/Department/Department";
import Auth from "@/API/Auth";
import ViewTeamDetails from "@/views/Page/Team/components/ViewTeamDetails.vue"; // Importing the view team details component
import TabsComponent from "@/components/TabsComponent.vue";
import { formatDateShort, htmlToTextRegex } from "@/utils/helpers";
import AvatarGroup from "@/components/AvatarGroup.vue";
import Modal from "@/components/Modal.vue";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";
import Highcharts from "highcharts";
import { Chart } from "highcharts-vue";
import UserSelect from "@/components/UserSelect.vue";
import LazySelectField from "@/components/LazySelectField.vue";
import TeamSelect from "@/components/TeamSelect.vue";

// Configure Highcharts global settings
Highcharts.setOptions({
  lang: {
    decimalPoint: ".",
    thousandsSep: ",",
  },
  credits: {
    enabled: false,
  },
  chart: {
    style: {
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
  },
});

defineRule("after_or_equal_today", (value, [compareTo], ctx) => {
  const nowDate = new Date().toISOString().split("T")[0];

  if (!value) return true; // If either value is missing, no validation error

  if (value >= nowDate) {
    return true; // End date is greater than or equal to the start date
  }
  return `${ctx.field} must be after or equal to ${nowDate}.`;
});

defineRule("after_or_equal", (value, [compareTo], ctx) => {
  if (!value || !compareTo) return true; // If either value is missing, no validation error
  if (value >= ctx.form[compareTo]) {
    return true; // End date is greater than or equal to the start date
  }
  return `${ctx.field} must be after or equal to ${compareTo}.`;
});

export default {
  name: "Task",
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    vSelect,
    ViewTask,
    ViewUserDetails,
    ViewTeamDetails,
    TabsComponent,
    AvatarGroup,
    Modal,
    PurpleDotsLoader,
    highcharts: Chart, // Highcharts component for visualizations
    LazySelectField,
    UserSelect,
    TeamSelect,
  },

  setup() {
    const USER = Auth.USER;
    // Initialize API and other required properties
    const api = new task();
    // const apiParams = { with: ["category:id,name"] };
    const apiParams = {
      // with: ["category:id,name"],
      filter: `created_by|${USER.id}|=`,
    };
    const tableColumns = []; // Initialize table column definitions
    const formFields = []; // Initialize form fields
    const categoryApi = new Category();
    const userApi = new User();
    const teamApi = new Team();
    const departmentApi = new Department();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      formFields,
      categoryApi,
      userApi,
      teamApi,
      departmentApi,
      USER,
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const canEdit = row.status === "open" && row.created_by == this.USER.id;
        const canDelete =
          row.status === "open" && row.created_by == this.USER.id;

        return {
          edit: !canEdit,
          delete: !canDelete,
        };
      };
    },
  },

  data() {
    return {
      activeTab: "my_tasks", // Default active tab
      isFirstUpdate: false,
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: { assign_type: null, assignee_id: null }, // Data object to store the currently selected item for editing or new item
      categories: [],
      users: [],
      teams: [],
      assignTypeOptions: [
        { value: "user", label: this.$t("user.user") },
        { value: "team", label: this.$t("team.team") },
      ],
      assignees: [], // Array for assignee options
      isAssigneeDisabled: true, // Flag to disable the assignee select initially
      nowDate: new Date().toISOString().split("T")[0],
      // isModalOpen: false,
      taskData: [],
      userNames: [],
      teamNames: [],
      departments: [],
      userData: [],
      teamData: [],
      taskStatus: [],
      statusOptions: [
        { name: this.$t("common.open"), id: "open" },
        { name: this.$t("common.in_progress"), id: "in_progress" },
        { name: this.$t("common.closed"), id: "closed" },
      ],
      viewModal: false,
      viewUserModal: false,
      viewTeamModal: false,
      viewStatusModal: false,
      statusLoading: false, // Loader state for the Save button
      taskFilters: [
        {
          title: this.$t("task.status"),
          key: "status",
          type: "string",
          data: [
            { id: "open", name: this.$t("common.open") },
            { id: "in_progress", name: this.$t("common.in_progress") },
            { id: "closed", name: this.$t("common.closed") },
          ],
          filterType: "filter",
        },
        {
          title: this.$t("task.priority"),
          key: "priority",
          type: "string",
          data: [
            { id: "no_priority", name: this.$t("task.no_priority") },
            { id: "low", name: this.$t("task.low") },
            { id: "medium", name: this.$t("task.medium") },
            { id: "high", name: this.$t("task.high") },
            { id: "urgent", name: this.$t("task.urgent") },
          ],
          filterType: "filter",
        },
        {
          title: this.$t("task.category"),
          key: "category_id",
          type: "string",
          data: "Category",
          filterType: "filter",
        },
      ],
      tabs: [
        { id: "my_tasks", label: this.$t("task.my_tasks") },
        { id: "assigned_to_me", label: this.$t("task.assigned_to_me") },
        { id: "assigned_to_team", label: this.$t("task.assigned_to_team") },
      ],
      formatDateShort,
      htmlToTextRegex,
      load: true,
      // Statistics Data
      taskStatisticsData: {
        totalTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
      },
      // Chart configurations
      statusDistributionChart: {},
      assigneeDistributionChart: {},
      completionTimelineChart: {},
      dueDateDistributionChart: {},
      completionRateChart: {},
      completedByDistributionChart: {},
    };
  },

  created() {
    // If you're updating an existing item, make sure to set the assignees and enabled state
    if (this.newItem.assign_type) {
      this.changeAssigne(this.newItem.assign_type);
    }

    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("task.title"), data: "title", defaultContent: "N/A" },
      // { title: this.$t("Description"), data: "description", defaultContent: "N/A" },
      {
        id: "category",
        title: this.$t("task.category"),
        data: "category.name",
        defaultContent: "N/A",
      },
      {
        id: "assign_type",
        title: this.$t("task.assign_type"),
        data: "assign_type",
        defaultContent: "N/A",
      },
      {
        id: "assignee",
        title: this.$t("task.assignee"),
        data: "assignee_id",
        defaultContent: "N/A",
      },
      {
        id: "start_date",
        title: this.$t("task.start_date"),
        data: "start_date",
        defaultContent: "N/A",
      },
      {
        id: "due_date",
        title: this.$t("task.due_date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "priority",
        title: this.$t("task.priority"),
        data: "priority",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("task.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "created_by",
        title: this.$t("task.created_by"),
        data: "created_by",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.formFields = [
      {
        name: "title",
        label: this.$t("task.title"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        col: 4, // Column size in the form layout
        placeholder: this.$t("task.enter_task_title"),
      },
      {
        name: "category_id",
        label: this.$t("task.category"),
        type: "options", // Dropdown/select field
        options: "Category",
        optionLabel: "name",
        col: 4,
        rules: "required", // Validation: required selection
        placeholder: this.$t("task.select_category"),
      },
      {
        name: "priority",
        label: this.$t("task.priority"),
        type: "options", // Dropdown/select field
        options: [
          { id: "no_priority", name: "No priority" },
          { id: "low", name: "Low" },
          { id: "medium", name: "Medium" },
          { id: "high", name: "High" },
          { id: "urgent", name: "Urgent" },
        ],
        optionLabel: "name",
        col: 4,
        rules: "required", // Validation: required selection
        placeholder: this.$t("task.select_priority"),
      },
      {
        name: "assign_type",
        label: this.$t("task.assign_type"),
        type: "options", // Dropdown/select field
        options: [
          { id: "user", name: this.$t("common.user") },
          { id: "team", name: this.$t("common.team") },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
      },
      {
        name: "assignee_id",
        label: this.$t("task.assignee"),
        type: "options", // Dropdown/select field
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
      },
      {
        name: "start_date",
        label: this.$t("task.start_date"),
        type: "date", // Text input field
        rules: `required|date|after_or_equal_today:${this.nowDate}`, // Format the current date as YYYY-MM-DD
        col: 6, // Column size in the form layout
      },
      {
        name: "due_date",
        label: this.$t("task.due_date"),
        type: "date", // Text input field
        rules: "required|date|after_or_equal:start_date",
        col: 6, // Column size in the form layout
      },
      {
        name: "description",
        label: this.$t("task.description"),
        type: "textarea", // Text input field
        rules: "required", // Validation rule: required field
        col: 12, // Column size in the form layout
      },
    ];
  },

  async mounted() {
    await this.fetchUsers(); // Fetch users data
    await this.fetchTeams(); // Fetch teams data
    await this.fetchCategories(); // Fetch categories data
    await this.fetchDepartments();
    await this.fetchTaskStatisticsData(); // Fetch statistics data

    this.load = false;
  },

  methods: {
    // This method updates the assignees based on the selected assign_type
    changeAssigne(assignType) {
      if (!this.isFirstUpdate) {
        this.newItem.assignee_id = null;
      }

      this.isFirstUpdate = false;

      if (assignType == "user") {
        this.assignees = this.users; // If "User" is selected, use the users array
        this.isAssigneeDisabled = false; // Enable the assignee select
      } else if (assignType == "team") {
        this.assignees = this.teams; // If "Team" is selected, use the teams array
        this.isAssigneeDisabled = false; // Enable the assignee select
      } else {
        this.assignees = []; // If neither, clear the assignees array
        // Reset assignee when the assign_type changes
        this.newItem.assignee_id = null;
        this.isAssigneeDisabled = true; // Disable the assignee select
      }
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
      (this.isFirstUpdate = true), (this.newItem = data); // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    openModal(selectedRow) {
      this.taskData = { ...selectedRow };
      this.viewModal = true;
    },

    truncateText(text) {
      if (!text) {
        return ""; // Return an empty string if the text is null or undefined
      }

      // If text length is 10 or more, truncate and add "..."
      if (text.length >= 10) {
        return text.substring(0, 10) + "...";
      }

      // If text length is less than 10, return it as is
      return text;
    },

    async fetchUsers() {
      try {
        const usersResponse = await this.userApi.getAll({
          select: "id|full_name|type|email|phone|username|department_id",
        });
        this.users = usersResponse;

        this.userNames = usersResponse.reduce((map, user) => {
          map[user.id] = user.full_name;
          return map;
        }, {});

        console.log("this.userNames", this.userNames);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    },

    async fetchTeams() {
      try {
        const teamsResponse = await this.teamApi.getAll({
          with: [`users:full_name,team_ids`],
          select: "id|name",
        });
        this.teams = teamsResponse;

        this.teamNames = teamsResponse.reduce((map, team) => {
          map[team.id] = team.name;
          return map;
        }, {});

        console.log("this.teamNames", this.teamNames);
      } catch (error) {
        console.error("Failed to load teams:", error);
      }
    },

    async fetchCategories() {
      try {
        const categoriesResponse = await this.categoryApi.getAll({
          select: "id|name",
        });

        this.categories = categoriesResponse.reduce((map, category) => {
          map[category.id] = category.name;
          return map;
        }, {});
        console.log("categories from fetchCategories", this.categories);
        // this.formFields.find((field) => field.name === "category_id").options =
        //   categoriesResponse;
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name",
        });

        this.departments = deptResponse.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    },

    openUserDetailsModal(selectedUserData) {
      this.userData = { ...selectedUserData };
      try {
        let userDepartment =
          this.departments[this.userData.department_id] ?? {};
        this.userData.department = userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    },

    openTeamDetailsModal(selectedTeamData) {
      // Find the team in the teams array by id
      const team = this.teams.find((t) => t.id === selectedTeamData.id);
      this.teamData = team ? { ...team } : { ...selectedTeamData };
      try {
        this.viewTeamModal = true;
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      }
    },

    changeTab(tab) {
      this.activeTab = tab;
      this.fetchData();
    },

    fetchData() {
      // Initialize params
      this.apiParams = {
        // with: ["category:id,name"],
      };

      // Get the filter condition based on active tab
      const filterCondition = this.getFilterByTab(this.activeTab);

      // Add the tab-specific filter to apiParams
      // The DataTable will combine this with user-selected filters
      if (filterCondition) {
        this.apiParams.filter = filterCondition;
      }

      // Force table refresh
      this.$nextTick(() => {
        this.$refs.table?.refreshTable();
      });
    },

    getFilterByTab(tab) {
      switch (tab) {
        case "my_tasks":
          return `created_by|${this.USER.id}|=`;

        case "assigned_to_me":
          // return `assignee_id|${this.USER.id}|contains`;
          return `assignee_id|${this.USER.id}|=`;

        case "assigned_to_team":
          // return `assignee_id|${this.USER.id}|contains`;
          return `assignee_id|${this.USER.team_ids}|=`;

        default:
          return "";
      }
    },

    openChangeStatusModal(selectedRow) {
      this.taskStatus = { ...selectedRow };
      console.log("this.taskStatus", this.taskStatus);
      if (this.taskStatus.status != "closed") {
        this.viewStatusModal = true;
      }
    },

    getStatusClass(item) {
      return item.status || "unknown";
    },

    getStatusLabel(item) {
      const status = item.status;
      if (status === "open") {
        return this.$t("task.open");
      } else if (status === "in_progress") {
        return this.$t("task.in_progress");
      } else if (status === "closed") {
        return this.$t("task.closed");
      }
      return status;
    },

    getPriorityValue(priority) {
      if (!priority) return "";

      if (priority == "urgent") return this.$t("task.urgent");
      if (priority == "high") return this.$t("task.high");
      if (priority == "medium") return this.$t("task.medium");
      if (priority == "low") return this.$t("task.low");
      if (priority == "no_priority") return this.$t("task.no_priority");

      return "";
    },

    getCategoryNameById(categoryId) {
      return this.categories?.[categoryId] || null;
    },

    async changeStatus(taskId, status) {
      this.statusLoading = true;
      try {
        const response = await this.api.changeStatus(taskId, status);
        if (response.status == "success") {
          this.$refs.table.refreshTable(); // Refresh the table
          this.viewStatusModal = false;
          this.api.poup(response, "Status changed");
        } else {
          this.api.poup(response, `Status not changed`);
        }
      } catch (error) {
        console.error("Error updating task status:", error);
      } finally {
        this.statusLoading = false;
      }
    },

    getUserNameById(id) {
      if (!id || !this.users) return "";

      const user = this.users.find((user) => user.id === id);
      return user?.full_name || "";
    },

    getUserInitials(name) {
      if (!name) return "U";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    // Fetch and calculate task statistics
    async fetchTaskStatisticsData() {
      try {
        // Fetch all tasks with necessary relations
        const allTasks = await this.api.getAll({});

        console.log("Fetched tasks for statistics:", allTasks);

        if (!allTasks || allTasks.length === 0) {
          console.log("No tasks found");
          return;
        }

        // Calculate metrics
        let totalTasks = allTasks.length;
        let inProgressTasks = 0;
        let completedTasks = 0;
        let overdueTasks = 0;

        // Status distribution
        const statusCounts = {};
        // Assignee distribution
        const assigneeCounts = {};
        // Completion timeline (tasks completed per month)
        const completionByMonth = {};
        // Due date distribution (upcoming tasks)
        const dueDateCounts = {};
        // Completed by user
        const completedByUserCounts = {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        allTasks.forEach((task) => {
          const status = task.status || "unknown";

          // Count statuses
          statusCounts[status] = (statusCounts[status] || 0) + 1;

          if (status === "in_progress") {
            inProgressTasks++;
          } else if (status === "closed") {
            completedTasks++;

            // Track completion timeline - try multiple date fields
            const completionDate = task.completed_at || task.updated_at || task.created_at;
            if (completionDate) {
              console.log("Task completion date:", task.id, completionDate);
              const monthKey = new Date(completionDate)
                .toISOString()
                .substring(0, 7);
              completionByMonth[monthKey] =
                (completionByMonth[monthKey] || 0) + 1;
            } else {
              console.warn("Task has no completion date:", task);
            }

            // Track who completed the task
            if (task.completed_by) {
              const userName =
                this.getUserNameById(task.completed_by) || "Unknown";
              completedByUserCounts[userName] =
                (completedByUserCounts[userName] || 0) + 1;
            }
          }

          // Check for overdue tasks
          if (task.due_date && status !== "closed") {
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < today) {
              overdueTasks++;
            }

            // Track due dates (next 30 days)
            const daysDiff = Math.ceil(
              (dueDate - today) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff >= 0 && daysDiff <= 30) {
              const dateKey = task.due_date.split("T")[0];
              dueDateCounts[dateKey] = (dueDateCounts[dateKey] || 0) + 1;
            }
          }

          // Count assignees
          if (task.assignee_id) {
            let assigneeName = "Unknown";
            if (task.assign_type === "user") {
              assigneeName =
                this.getUserNameById(task.assignee_id) || "Unknown User";
            } else if (task.assign_type === "team") {
              const team = this.teams.find((t) => t.id === task.assignee_id);
              assigneeName = team?.name || "Unknown Team";
            }
            assigneeCounts[assigneeName] =
              (assigneeCounts[assigneeName] || 0) + 1;
          }
        });

        // Update statistics data
        this.taskStatisticsData = {
          totalTasks,
          inProgressTasks,
          completedTasks,
          overdueTasks,
        };

        // Build charts
        this.buildTaskCharts(
          statusCounts,
          assigneeCounts,
          completionByMonth,
          dueDateCounts,
          totalTasks,
          completedTasks,
          completedByUserCounts
        );
      } catch (error) {
        console.error("Error fetching task statistics:", error);
      }
    },

    // Build all task charts
    buildTaskCharts(
      statusCounts,
      assigneeCounts,
      completionByMonth,
      dueDateCounts,
      totalTasks,
      completedTasks,
      completedByUserCounts
    ) {
      // 1. Status Distribution Chart (Donut)
      this.statusDistributionChart = {
        chart: { type: "pie", height: 300 },
        title: { text: "" },
        plotOptions: {
          pie: {
            innerSize: "60%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
            },
          },
        },
        series: [
          {
            name: "Tasks",
            colorByPoint: true,
            data: Object.entries(statusCounts).map(([status, count]) => ({
              name:
                status.charAt(0).toUpperCase() +
                status.slice(1).replace("_", " "),
              y: count,
            })),
          },
        ],
      };

      // 2. Assignee Distribution Chart (Bar)
      const topAssignees = Object.entries(assigneeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.assigneeDistributionChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        xAxis: {
          categories: topAssignees.map(([name]) => name),
          title: { text: null },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Tasks" },
          allowDecimals: false,
        },
        plotOptions: {
          bar: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Tasks",
            data: topAssignees.map(([, count]) => count),
            color: "#6e3894",
          },
        ],
      };

      // 3. Completion Timeline Chart (Column)
      const sortedMonths = Object.keys(completionByMonth).sort();
      console.log("Completion by month data:", completionByMonth);
      console.log("Sorted months:", sortedMonths);

      this.completionTimelineChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        xAxis: {
          categories: sortedMonths.length > 0
            ? sortedMonths.map((month) => {
              const date = new Date(month + "-01");
              return date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });
            })
            : ["No Data"],
          title: { text: "Month" },
        },
        yAxis: {
          min: 0,
          title: { text: "Completed Tasks" },
          allowDecimals: false,
        },
        series: [
          {
            name: "Completed Tasks",
            data: sortedMonths.length > 0
              ? sortedMonths.map((month) => completionByMonth[month])
              : [0],
            color: "#28a745",
          },
        ],
      };

      // 4. Due Date Distribution Chart (Column)
      const sortedDueDates = Object.keys(dueDateCounts).sort();
      this.dueDateDistributionChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        xAxis: {
          categories: sortedDueDates.map((date) =>
            new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          ),
          title: { text: "Due Date" },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Tasks" },
          allowDecimals: false,
        },
        series: [
          {
            name: "Tasks Due",
            data: sortedDueDates.map((date) => dueDateCounts[date]),
            color: "#ffc107",
          },
        ],
      };

      // 5. Completion Rate Chart (Donut)
      const incompleteTasks = totalTasks - completedTasks;
      this.completionRateChart = {
        chart: { type: "pie", height: 300 },
        title: { text: "" },
        plotOptions: {
          pie: {
            innerSize: "60%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
            },
          },
        },
        series: [
          {
            name: "Tasks",
            colorByPoint: true,
            data: [
              { name: "Completed", y: completedTasks, color: "#28a745" },
              { name: "Incomplete", y: incompleteTasks, color: "#dc3545" },
            ],
          },
        ],
      };

      // 6. Completed By Distribution Chart (Bar)
      const topCompletedBy = Object.entries(completedByUserCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.completedByDistributionChart = {
        chart: { type: "bar", height: 300 },
        title: { text: "" },
        xAxis: {
          categories: topCompletedBy.map(([name]) => name),
          title: { text: null },
        },
        yAxis: {
          min: 0,
          title: { text: "Tasks Completed" },
          allowDecimals: false,
        },
        plotOptions: {
          bar: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Completed",
            data: topCompletedBy.map(([, count]) => count),
            color: "#28a745",
          },
        ],
      };
    },
  },
  watch: {
    "newItem.assign_type"(after, before) {
      this.changeAssigne(after);
    },
  },
};
</script>

<style scoped>
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

/* START Status */
.status {
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
  cursor: pointer;
}

.status.open {
  background: #b3c0eb;
  color: #2c1bc4;
}

.status.closed {
  background: #d6eed3;
  color: #2f9826;
  cursor: none;
}

.status.in_progress {
  background: #ebd3b3;
  color: #e28f0b;
}

.status.unknown {
  background: #e0e0e0;
  color: #616161;
}

/* END status */

/* START priority */
.priority {
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

.priority.low {
  background: #b6caae;
  color: #255f0b;
}

.priority.medium {
  background: #f3ead1;
  color: #c4951b;
}

.priority.high {
  background: #eed3d3;
  color: #a92525;
}

.priority.urgent {
  background: #8d1f1f;
  color: #ffffff;
}

.priority.no_priority {
  background: #e0e0e0;
  color: #616161;
}

/* END priority */

.action-list-item {
  padding: 4px 15px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  border-radius: 0 !important;
  margin: 5px !important;
}

.action-list-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
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
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
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

@media (max-width: 960px) {
  .v-dialog>.v-overlay__content {
    width: calc(80% - 48px);
  }
}

.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row {
  text-align: end;
}

/* Statistics Styles */
.statistics-content {
  padding: 20px;
}

/* Metric Cards */
.metric-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  min-height: 120px;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 2.5rem;
  margin-right: 20px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: #2c3e50;
}

.metric-label {
  font-size: 0.95rem;
  margin: 5px 0 0 0;
  color: #5a6c7d;
  font-weight: 500;
}

/* Chart Containers */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
  height: 100%;
}

.chart-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.chart-container-equal-height {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-container-equal-height .highcharts-container {
  flex: 1;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .metric-card {
    flex-direction: column;
    text-align: center;
    min-height: 140px;
  }

  .metric-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .metric-value {
    font-size: 1.75rem;
  }

  .chart-container {
    margin-bottom: 20px;
  }
}
</style>
