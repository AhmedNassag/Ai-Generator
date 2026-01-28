<template>
  <PurpleDotsLoader v-if="load" />

  <!-- Main Page component where the layout and page structure are set -->
  <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="this.$t('team.governance')"
    :mainSubPage="this.$t('team.team')" :titlePage="this.$t('team.team')" v-permission:show :showInsightsTab="true">
    <div v-permission:update v-permission:destroy></div>
    <!-- Statistics Slot - Displays in the "Inside" tab -->
    <template #statistics>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto">
        <!-- Loading State -->
        <div v-if="loadingStatistics" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{
              $t("team.loading_statistics")
            }}</span>
          </div>
          <p class="mt-3">{{ $t("team.loading_statistics") }}</p>
        </div>

        <!-- Statistics Content -->
        <div v-else>
          <!-- Metrics Cards -->
          <div class="row mb-4">
            <div class="col-md-4">
              <Count :data="{
                title: $t('team.total_teams'),
                count: statistics.totalTeams,
                icon: 'mdi-account-group',
              }" :color="{
                  background: '#E3F2FD',
                  avatar: '#1976D2',
                  text: '#0D47A1',
                }" :show-menu="false" :openSetting="() => { }" />
            </div>
            <div class="col-md-4">
              <Count :data="{
                title: $t('team.total_users'),
                count: statistics.totalUsers,
                icon: 'mdi-account',
              }" :color="{
                  background: '#E8F5E9',
                  avatar: '#388E3C',
                  text: '#1B5E20',
                }" :show-menu="false" :openSetting="() => { }" />
            </div>
            <div class="col-md-4">
              <Count :data="{
                title: $t('team.empty_teams'),
                count: statistics.emptyTeams,
                icon: 'mdi-alert',
              }" :color="{
                  background: '#FFF3E0',
                  avatar: '#F57C00',
                  text: '#E65100',
                }" :show-menu="false" :openSetting="() => { }" />
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="row">
            <!-- User Team Distribution (pie Chart) -->
            <div class="col-md-6 mb-4">
              <div class="chart-container chart-container-equal-height">
                <h6 class="chart-title">
                  {{ $t("team.user_team_distribution") }}
                </h6>
                <apexchart type="pie" height="300" :options="userDistributionOptions"
                  :series="userDistributionSeries" />
              </div>
            </div>

            <!-- Team Size Distribution (Bar Chart) -->
            <div class="col-md-6 mb-4">
              <div class="chart-container chart-container-equal-height">
                <h6 class="chart-title">
                  {{ $t("team.team_size_distribution") }}
                </h6>
                <apexchart type="bar" height="300" :options="teamSizeDistributionOptions"
                  :series="teamSizeDistributionSeries" />
              </div>
            </div>

            <!-- Top 10 Teams by Size (Horizontal Bar Chart) -->
            <div class="col-12 mb-4">
              <div class="chart-container">
                <h6 class="chart-title">{{ $t("team.top_teams_by_size") }}</h6>
                <apexchart type="bar" height="400" :options="topTeamsOptions" :series="topTeamsSeries" />
              </div>
            </div>

            <!-- Users by Department (Horizontal Bar Chart) -->
            <div class="col-12 mb-4">
              <div class="chart-container">
                <h6 class="chart-title">
                  {{ $t("team.users_by_department") }}
                </h6>
                <apexchart type="bar" height="400" :options="departmentOptions" :series="departmentSeries" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :filters="teamFilters">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> {{ item.name }} </template>

        <!-- Customizing the 'Users' column with avatars -->
        <template #users="{ item }">
          <span v-if="item.users && item.users.length > 0">
            <!-- Single user: display with avatar and name -->
            <div v-if="item.users.length === 1" class="user-info">
              <div class="user-avatar-clickable" @click.prevent="openUserDetailsModal(item.users[0])">
                {{
                  getUserInitials(
                    item.users[0].full_name || item.users[0].name || "U"
                  )
                }}
              </div>
              <span class="user-fullname">{{
                item.users[0].full_name || item.users[0].name
              }}</span>
            </div>

            <!-- Multiple users: use AvatarGroup -->
            <AvatarGroup v-else :users="item.users.map((u) => ({
              ...u,
              full_name: u.full_name || u.name,
            }))
              " :max-visible="2" :spacing="20" :clickable="true" empty-text="No users assigned"
              @user-click="openUserDetailsModal" />
          </span>

          <!-- Show message if no users -->
          <span v-else class="no-users-text">
            {{ $t("team.nousers") || "No users assigned" }}
          </span>
        </template>

        <template #createdat="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template #updatedat="{ item }">
          {{ formatDate(item.updated_at) }}
        </template>

        <!-- Customizing the 'Assign Users' column -->
        <template #addAction="{ item }">
          <v-list-item v-anyPermission="['assignUsers']" @click="assignUsers(item.id)" class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-account-multiple-plus</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("team.assignusers") }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <!-- Assign Users Popup -->
  <div v-if="showAssignPopup" class="modal fade show" style="display: block; background-color: rgba(0, 0, 0, 0.5)"
    tabindex="-1" @click.self="closeAssignPopup">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 800px">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t("team.assignusers") }}</h5>
          <button type="button" class="btn-close" @click="closeAssignPopup"></button>
        </div>
        <div class="modal-body">
          <Form :schema="assignFields" :newItem="assignData" :api="api" :closeForm="closeAssignPopup" :formData="true">
          </Form>
        </div>
      </div>
    </div>
  </div>

  <!-- Users Details Modal -->
  <transition name="modal-fade">
    <div v-if="showUsersModal" class="modal fade show" style="display: block; background-color: rgba(0, 0, 0, 0.5)"
      tabindex="-1" @click.self="closeUsersModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 800px">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t("team.teamusers") }}</h5>
            <button type="button" class="btn-close" @click="closeUsersModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedTeamUsers.length === 0" class="text-center text-muted py-4">
              {{ $t("team.nousers") }}
            </div>
            <div v-else class="table-responsive">
              <table class="table table-striped table-hover dir-rtl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ $t("team.name") }}</th>
                    <th>{{ $t("team.email") }}</th>
                    <th>{{ $t("team.job") }}</th>
                    <th>{{ $t("team.status") }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in selectedTeamUsers" :key="user.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ user.full_name || user.username || "N/A" }}</td>
                    <td>{{ user.email || "N/A" }}</td>
                    <td>{{ user.job?.name || "N/A" }}</td>
                    <td>
                      <span v-if="user.status" class="badge bg-success">Active</span>
                      <span v-else class="badge bg-secondary">Inactive</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- Widget Configuration Dialog -->
  <div v-if="dialog" class="modal fade show" style="display: block; background-color: rgba(0, 0, 0, 0.5)" tabindex="-1"
    @click.self="dialog = false">
    <div class="modal-dialog modal-dialog-centered modal-xl" style="max-width: 1400px">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Widget Configuration</h5>
          <button type="button" class="btn-close" @click="dialog = false"></button>
        </div>

        <div class="modal-body" style="max-height: 600px; overflow-y: auto">
          <div class="row">
            <!-- Main Content Area -->
            <div class="col-md-8">
              <!-- Basic Settings -->
              <div class="card mb-3">
                <div class="card-header">Basic Settings</div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Widget Title</label>
                        <input type="text" class="form-control" v-model="data.title" placeholder="Enter widget title" />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Chart Type</label>
                        <select class="form-select" v-model="data.type">
                          <option v-for="type in types" :key="type" :value="type">
                            {{ type }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Active Filters -->
              <div class="card mb-3" v-if="filterGroups.length > 0">
                <div class="card-header">Active Filters</div>
                <div class="card-body">
                  <div class="d-flex flex-wrap gap-2">
                    <span v-for="(group, idx) in filterGroups" :key="idx" class="badge bg-primary">
                      <i class="fas fa-filter"></i> Group {{ idx + 1 }} ({{
                        group.filter.length + group.filterIn.length
                      }})
                      <i class="fas fa-times ms-2" @click="removeFilterGroup(idx)" style="cursor: pointer"></i>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Preview -->
              <div class="card">
                <div class="card-header">Preview</div>
                <div class="card-body" style="min-height: 300px; background: #f5f5f5">
                  <Count v-if="data.type === 'count'" :data="data" :color="data.color" :openSetting="() => { }" />
                  <ChartWrapper v-else :data="data" :options="chartOptions" :openSetting="() => { }" ref="chart" />
                </div>
              </div>
            </div>

            <!-- Right Sidebar -->
            <div class="col-md-4" style="border-left: 1px solid #dee2e6; background: #f8f9fa">
              <!-- Tabs -->
              <ul class="nav nav-tabs mb-3" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link" :class="{ active: tab === 'data' }" @click="
                    tab = 'data';
                  applyFiltersIfNeeded();
                  ">
                    <i class="fas fa-database"></i> Data
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" :class="{ active: tab === 'filter' }" @click="tab = 'filter'">
                    <i class="fas fa-filter"></i> Filter
                  </button>
                </li>
              </ul>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Data Configuration Tab -->
                <div v-show="tab === 'data'" class="tab-pane fade" :class="{ 'show active': tab === 'data' }">
                  <div class="card mb-3">
                    <div class="card-header">Y-Axis Configuration</div>
                    <div class="card-body">
                      <div class="mb-3">
                        <label class="form-label">Module</label>
                        <select class="form-select" v-model="selectmodel.y.model" @change="getFillable">
                          <option value="">Select Module</option>
                          <option v-for="item in items" :key="item" :value="item">
                            {{ item }}
                          </option>
                        </select>
                      </div>

                      <div class="mb-3" v-if="data.type !== 'count'">
                        <label class="form-label">Field</label>
                        <select class="form-select" v-model="selectmodel.y.field">
                          <option value="">Select Field</option>
                          <option v-for="field in fields" :key="field" :value="field">
                            {{ field }}
                          </option>
                        </select>
                      </div>

                      <div class="mb-3">
                        <label class="form-label">Aggregate Type</label>
                        <select class="form-select" v-model="selectmodel.y.aggregateType" @change="getData">
                          <option v-for="type in aggregateType" :key="type" :value="type">
                            {{ type }}
                          </option>
                        </select>
                      </div>

                      <div class="form-check form-check-inline" v-if="data.type !== 'count'">
                        <input class="form-check-input" type="radio" v-model="queryType" value="sample" id="sample" />
                        <label class="form-check-label" for="sample">Sample</label>
                      </div>
                      <div class="form-check form-check-inline" v-if="data.type !== 'count'">
                        <input class="form-check-input" type="radio" v-model="queryType" value="group" id="group" />
                        <label class="form-check-label" for="group">Group</label>
                      </div>
                    </div>
                  </div>

                  <!-- X-Axis Configuration -->
                  <div class="card mb-3" v-if="data.type !== 'count'">
                    <div class="card-header">X-Axis Configuration</div>
                    <div class="card-body">
                      <div v-if="queryType === 'sample'">
                        <div class="mb-3">
                          <label class="form-label">Field</label>
                          <select class="form-select" v-model="selectmodel.x.field">
                            <option value="">Select Field</option>
                            <option v-for="field in fields" :key="field" :value="field">
                              {{ field }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div v-else>
                        <div class="mb-3">
                          <label class="form-label">Module</label>
                          <select class="form-select" v-model="selectmodel.x.model" @change="getFillableX">
                            <option value="">Select Module</option>
                            <option v-for="item in items" :key="item" :value="item">
                              {{ item }}
                            </option>
                          </select>
                        </div>
                        <div class="mb-3">
                          <label class="form-label">Field</label>
                          <select class="form-select" v-model="selectmodel.x.field" @change="getDataX">
                            <option value="">Select Field</option>
                            <option v-for="field in fieldsX" :key="field" :value="field">
                              {{ field }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Count Widget Customization -->
                  <div v-if="data.type === 'count'">
                    <div class="card mb-3">
                      <div class="card-header">Appearance</div>
                      <div class="card-body">
                        <ColorSelector @colorSelected="handleColorChange" />
                        <MDIIconSelector @icon-selected="handleIconSelected" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Filter Tab -->
                <div v-show="tab === 'filter'" class="tab-pane fade" :class="{ 'show active': tab === 'filter' }">
                  <FilterVue :fields="groupFields" :or-filter="filterData" @filter-data="updateFilterData"
                    :entityName="entityName" :key="'filter-' + dialogRenderKey" />

                  <!-- Apply Filters Button -->
                  <div class="card mt-3" v-if="
                    filterData.length > 0 &&
                    filterData[0] &&
                    filterData[0].length > 0
                  ">
                    <div class="card-body">
                      <button class="btn btn-primary w-100" @click="closeFilter">
                        <i class="fas fa-filter-circle-xmark"></i> Apply Filters
                        & View Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="dialog = false">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="closeDialog">
            <i class="fas fa-save"></i> Save Widget
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- View user details modal -->
  <ViewUserDetails :viewUserModal="viewUserModal" :userData="userData" @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event" />

  <!-- Statistics Modal -->
  <div v-if="isStatisticsModalOpen" class="modal fade show" style="display: block; background-color: rgba(0, 0, 0, 0.5)"
    tabindex="-1" @click.self="closeStatistics">
    <div class="modal-dialog modal-dialog-centered modal-xl" style="max-width: 1400px">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fas fa-chart-bar me-2"></i>
            {{ $t("team.team_statistics") }}
          </h5>
          <button type="button" class="btn-close" @click="closeStatistics"></button>
        </div>

        <div class="modal-body" style="max-height: 75vh; overflow-y: auto">
          <!-- Loading State -->
          <div v-if="loadingStatistics" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">{{
                $t("team.loading_statistics")
              }}</span>
            </div>
            <p class="mt-3">{{ $t("team.loading_statistics") }}</p>
          </div>

          <!-- Statistics Content -->
          <div v-else>
            <!-- Metrics Cards -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="metric-card bg-primary-subtle">
                  <div class="metric-icon">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="metric-content">
                    <h3 class="metric-value">{{ statistics.totalTeams }}</h3>
                    <p class="metric-label">{{ $t("team.total_teams") }}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="metric-card bg-success-subtle">
                  <div class="metric-icon">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="metric-content">
                    <h3 class="metric-value">{{ statistics.totalUsers }}</h3>
                    <p class="metric-label">{{ $t("team.total_users") }}</p>
                  </div>
                </div>
              </div>
              <!-- <div class="col-md-3">
                <div class="metric-card bg-info-subtle">
                  <div class="metric-icon">
                    <i class="fas fa-users-cog"></i>
                  </div>
                  <div class="metric-content">
                    <h3 class="metric-value">{{ statistics.avgTeamSize }}</h3>
                    <p class="metric-label">{{ $t('team.avg_team_size') }}</p>
                  </div>
                </div>
              </div> -->
              <div class="col-md-4">
                <div class="metric-card bg-warning-subtle">
                  <div class="metric-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                  </div>
                  <div class="metric-content">
                    <h3 class="metric-value">{{ statistics.emptyTeams }}</h3>
                    <p class="metric-label">{{ $t("team.empty_teams") }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts Grid -->
            <div class="row">
              <!-- User Team Distribution (pie Chart) -->
              <div class="col-md-6 mb-4">
                <div class="chart-container chart-container-equal-height">
                  <h6 class="chart-title">
                    {{ $t("team.user_team_distribution") }}
                  </h6>
                  <apexchart type="pie" height="300" :options="userDistributionOptions"
                    :series="userDistributionSeries" />
                </div>
              </div>

              <!-- Team Size Distribution (Bar Chart) -->
              <div class="col-md-6 mb-4">
                <div class="chart-container chart-container-equal-height">
                  <h6 class="chart-title">
                    {{ $t("team.team_size_distribution") }}
                  </h6>
                  <apexchart type="bar" height="300" :options="teamSizeDistributionOptions"
                    :series="teamSizeDistributionSeries" />
                </div>
              </div>

              <!-- Top 10 Teams by Size (Horizontal Bar Chart) -->
              <div class="col-12 mb-4">
                <div class="chart-container">
                  <h6 class="chart-title">
                    {{ $t("team.top_teams_by_size") }}
                  </h6>
                  <apexchart type="bar" height="400" :options="topTeamsOptions" :series="topTeamsSeries" />
                </div>
              </div>

              <!-- Users by Department (Horizontal Bar Chart) -->
              <div class="col-12 mb-4">
                <div class="chart-container">
                  <h6 class="chart-title">
                    {{ $t("team.users_by_department") }}
                  </h6>
                  <apexchart type="bar" height="400" :options="departmentOptions" :series="departmentSeries" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" style="color: white !important" class="btn btn-secondary" @click="closeStatistics">
            {{ $t("team.close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import Swal from "sweetalert2";
import team from "@/API/Team/Team";
import user from "@/API/User/User";
import department from "@/API/Department/Department";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import ChartWrapper from "@/views/Page/Dashboard/ChartWrapper.vue";
import Count from "@/views/Page/Dashboard/Count.vue";
import FilterVue from "@/components/FilterDiv.vue";
import MDIIconSelector from "@/components/MDIIconSelector.vue";
import ColorSelector from "@/components/ColorSelector.vue";
import VueApexCharts from "vue3-apexcharts";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import AvatarGroup from "@/components/AvatarGroup.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    ChartWrapper,
    Count,
    FilterVue,
    MDIIconSelector,
    ColorSelector,
    apexchart: VueApexCharts,
    PurpleDotsLoader,
    ViewUserDetails,
    AvatarGroup,
  },

  setup() {
    // Initialize API and other required properties
    const api = new team();
    const usersList = new user();
    const departmentsList = new department();
    const apiParams = { with: ["users.job"] }; // Here i can use (with) to get only the data that i want
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const assignFields = []; // Initialize assign user fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      assignFields,
      usersList,
      departmentsList,
    };
  },

  data() {
    const labels = [];
    const sData = [];

    return {
      load: true,
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      filter: {
        user: "",
      },
      teamFilters: [
        {
          title: "User",
          key: "user_ids",
          type: "array",
          data: "User",
        },
      ],
      showAssignPopup: false, // To control assign popup visibility
      assignData: {}, // Data for assign form
      currentTeamId: null, // Current team ID for assignment
      users: [], // List of available users
      showUsersModal: false, // To control users modal visibility
      selectedTeamUsers: [], // Users of the selected team
      viewUserModal: false, // To control user details modal visibility
      userData: {}, // Data for the user details modal
      departments: {}, // Department lookup dictionary (id -> name)

      // Dashboard widget properties
      showDashboard: false, // To toggle between table and dashboard view
      labels,
      sData,
      filterData: [],
      groupFields: [],
      filterGroups: [],
      entityName: "",
      tab: "data",
      data: {
        title: "",
        labels: labels,
        data: sData,
        type: "count",
        icon: "mdi-account-group",
        w: 3,
        h: 2,
      },
      items: ["Team", "User", "Department"],
      fields: [],
      fieldsX: [],
      aggregateType: ["count", "sum", "avg", "max", "min"],
      types: ["count", "bar", "doughnut", "line"],
      dialog: false,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
      cards: [],
      dialogMode: "",
      queryType: "sample",
      selectmodel: {
        y: {
          model: "",
          field: "",
        },
        x: {
          model: "",
          field: "",
        },
      },
      grid: null,
      dialogRenderKey: 0,

      // Statistics modal properties
      isStatisticsModalOpen: false,
      loadingStatistics: false,
      statistics: {
        totalTeams: 0,
        totalUsers: 0,
        avgTeamSize: 0,
        emptyTeams: 0,
      },
      userDistributionSeries: [],
      userDistributionOptions: {
        chart: {
          type: "pie",
        },
        labels: [],
        colors: ["#255F0B", "#C4951B", "#A92525", "#999999"],
        legend: {
          position: "bottom",
        },
      },
      teamSizeDistributionSeries: [
        {
          name: this.$t?.("team.number_of_teams") || "Number of Teams",
          data: [],
        },
      ],
      teamSizeDistributionOptions: {
        chart: {
          type: "bar",
        },
        xaxis: {
          categories: [],
          title: {
            text: this.$t?.("team.team_size") || "Team Size (Members)",
          },
        },
        yaxis: {
          title: {
            text: this.$t?.("team.number_of_teams") || "Number of Teams",
          },
        },
        colors: ["#A92525"],
      },
      topTeamsSeries: [
        {
          name: this.$t?.("team.team_members") || "Team Members",
          data: [],
        },
      ],
      topTeamsOptions: {
        chart: {
          type: "bar",
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          categories: [],
          title: {
            text: this.$t?.("team.team_members") || "Team Members",
          },
        },
        colors: ["#C4951B"],
      },
      departmentSeries: [
        {
          name: this.$t?.("team.users") || "Users",
          data: [],
        },
      ],
      departmentOptions: {
        chart: {
          type: "bar",
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          categories: [],
          title: {
            text: this.$t?.("team.users") || "Users",
          },
        },
        colors: ["#255F0B"],
      },
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("team.name"), data: "name", defaultContent: "N/A" },
      {
        id: "createdat",
        title: this.$t("team.createdat"),
        data: "created_at",
        defaultContent: "N/A",
      },
      {
        id: "updatedat",
        title: this.$t("team.updatedat"),
        data: "updated_at",
        defaultContent: "N/A",
      },
      {
        id: "users",
        title: this.$t("team.users"),
        data: "users.count",
        defaultContent: "0",
        orderable: false,
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("team.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter the team name.",
        col: 12, // Column size in the form layout
      },
    ];

    // Define the assign user fields schema
    this.assignFields = [
      {
        name: "user_ids",
        label: this.$t("team.users"),
        type: "user-select", // Dropdown/select field
        options: [],
        multiple: true,
        optionLabel: "full_name",
        col: 12,
        rules: "required", // Validation: required selection
        description: "Select users to assign to the team",
      },
    ];
  },

  methods: {
    // Get user initials from full name
    getUserInitials(fullName) {
      if (!fullName) return "U";

      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      // Get first letter of first name and first letter of last name
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    },

    formatDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
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

    // Handle Assign Users button click - Open popup
    async assignUsers(teamId) {
      console.log("Assign Users button clicked for team:", teamId);
      this.currentTeamId = teamId;

      // Fetch team data with assigned users
      const teamData = await this.api.show(teamId, { with: ["users"] });
      console.log("Team data:", teamData);

      // Get the IDs of currently assigned users
      const assignedUserIds = teamData.users
        ? teamData.users.map((user) => user.id)
        : [];
      console.log("Currently assigned user IDs:", assignedUserIds);

      // Set assignData with team ID and currently assigned user IDs
      this.assignData = {
        id: teamId,
        user_ids: assignedUserIds,
      };

      // Fetch all users for the dropdown
      await this.fetchUsers();

      // Show the popup
      this.showAssignPopup = true;
    },

    // Fetch all users for the dropdown (including already assigned ones)
    async fetchUsers() {
      try {
        const response = await this.usersList.getAll({
          select: "id|full_name|team_ids",
        });
        console.log("Fetched users:", response);

        // Include all users in the options
        // This allows already assigned users to show as selected
        const userField = this.assignFields.find(
          (field) => field.name === "user_ids"
        );
        if (userField) {
          userField.options = response;
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        this.$notify({
          type: "error",
          text: this.$t("error_fetching_users"),
        });
      }
    },

    // Close the assign popup
    closeAssignPopup() {
      this.showAssignPopup = false;
      this.assignData = {};
      this.currentTeamId = null;

      // Refresh the table to show updated assignments
      if (this.$refs.table) {
        this.$refs.table.refreshTable();
      }
    },

    // View team users - Open users modal
    viewTeamUsers(team) {
      console.log("View team users clicked for team:", team);

      this.selectedTeamUsers = team.users || [];
      console.log(
        "View team mmmmmmmmmmmmmmmmmmmmmmmm:",
        this.selectedTeamUsers
      );
      this.showUsersModal = true;
    },

    // Close the users modal
    closeUsersModal() {
      this.showUsersModal = false;
      this.selectedTeamUsers = [];
    },

    // Open user details modal
    openUserDetailsModal(user) {
      if (!user) return;
      this.userData = { ...user };
      try {
        let userDepartment =
          this.departments[this.userData.department_id] ?? {};
        this.userData.department = userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    },

    // Fetch statistics data
    async fetchStatisticsData() {
      try {
        // Fetch all teams with users, all users, and all departments
        const [allTeams, allUsers, allDepartments] = await Promise.all([
          this.api.getAll({ with: ["users"] }),
          this.usersList.getAll({
            select: "id|full_name|department_id|team_ids",
          }),
          this.departmentsList.getAll({ select: "id|name" }),
        ]);

        // Build departments lookup dictionary (id -> name)
        this.departments = allDepartments.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});

        // Calculate basic metrics
        const totalTeams = allTeams.length;
        const totalUsers = allUsers.length;

        // Calculate users with teams and without teams
        const usersWithTeams = allUsers.filter(
          (user) => user.team_ids && user.team_ids.length > 0
        ).length;
        const usersWithoutTeams = totalUsers - usersWithTeams;

        // Calculate team sizes
        const teamSizes = allTeams.map((team) =>
          team.users ? team.users.length : 0
        );
        const avgTeamSize =
          teamSizes.length > 0
            ? (
              teamSizes.reduce((sum, size) => sum + size, 0) /
              teamSizes.length
            ).toFixed(1)
            : 0;

        const emptyTeams = teamSizes.filter((size) => size === 0).length;

        // Update statistics
        this.statistics = {
          totalTeams,
          totalUsers,
          avgTeamSize,
          emptyTeams,
        };

        // User Team Distribution (pie Chart)
        this.userDistributionSeries = [usersWithTeams, usersWithoutTeams];
        this.userDistributionOptions = {
          ...this.userDistributionOptions,
          labels: [
            this.$t("team.users_with_teams"),
            this.$t("team.users_without_teams"),
          ],
        };

        // Team Size Distribution (Bar Chart)
        const sizeRanges = {
          0: 0,
          "1-5": 0,
          "6-10": 0,
          "11-20": 0,
          "20+": 0,
        };

        teamSizes.forEach((size) => {
          if (size === 0) sizeRanges["0"]++;
          else if (size >= 1 && size <= 5) sizeRanges["1-5"]++;
          else if (size >= 6 && size <= 10) sizeRanges["6-10"]++;
          else if (size >= 11 && size <= 20) sizeRanges["11-20"]++;
          else sizeRanges["20+"]++;
        });

        this.teamSizeDistributionSeries = [
          {
            name: this.$t("team.number_of_teams"),
            data: Object.values(sizeRanges),
          },
        ];
        this.teamSizeDistributionOptions = {
          ...this.teamSizeDistributionOptions,
          xaxis: {
            categories: Object.keys(sizeRanges),
            title: {
              text: this.$t("team.team_size"),
            },
          },
        };

        // Top 10 Teams by Size (Horizontal Bar Chart)
        const teamsWithSizes = allTeams.map((team) => ({
          name: team.name,
          size: team.users ? team.users.length : 0,
        }));

        teamsWithSizes.sort((a, b) => b.size - a.size);
        const top10Teams = teamsWithSizes.slice(0, 10);

        this.topTeamsSeries = [
          {
            name: this.$t("team.team_members"),
            data: top10Teams.map((t) => t.size),
          },
        ];
        this.topTeamsOptions = {
          ...this.topTeamsOptions,
          xaxis: {
            categories: top10Teams.map((t) => t.name),
            title: {
              text: this.$t("team.team_members"),
            },
          },
        };

        // Users by Department (Horizontal Bar Chart)
        const departmentCounts = {};
        allUsers.forEach((user) => {
          if (user.department_id) {
            departmentCounts[user.department_id] =
              (departmentCounts[user.department_id] || 0) + 1;
          }
        });

        const departmentData = allDepartments
          .map((dept) => ({
            name: dept.name,
            count: departmentCounts[dept.id] || 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        this.departmentSeries = [
          {
            name: this.$t("team.users"),
            data: departmentData.map((d) => d.count),
          },
        ];
        this.departmentOptions = {
          ...this.departmentOptions,
          xaxis: {
            categories: departmentData.map((d) => d.name),
            title: {
              text: this.$t("team.users"),
            },
          },
        };
      } catch (error) {
        console.error("Error fetching statistics data:", error);
        throw error;
      }
    },

    // ==================== Dashboard/Widget Methods ====================

    // Initialize GridStack
    initGrid() {
      this.grid = GridStack.init(
        {
          float: true,
          cellHeight: "100px",
          margin: 8,
        },
        this.$refs.grid
      );

      // Listen for change events (resize and move)
      this.grid.on("change", (event, items) => {
        if (!items || items.length === 0) return;

        items.forEach((item) => {
          const index = parseInt(item.el.id);
          if (this.cards[index]) {
            this.cards[index].x = item.x;
            this.cards[index].y = item.y;
            this.cards[index].w = item.w;
            this.cards[index].h = item.h;
          }
        });
      });

      // Reload charts on resize
      this.grid.on("resizestop", (event, element) => {
        const index = parseInt(element.id);
        const chartRef = this.$refs["chart" + index];
        if (chartRef && chartRef[0]) {
          this.$nextTick(() => {
            // chartRef[0].reload();
          });
        }
      });
    },

    // Reload grid
    async reloadGrid() {
      if (this.grid) {
        this.grid.destroy(false);
        this.grid = null;
      }
      await this.$nextTick();
      this.initGrid();
    },

    // Sync grid positions before saving
    syncGridPositions() {
      if (!this.grid) return;

      this.grid.engine.nodes.forEach((node) => {
        const index = parseInt(node.el.id);
        if (this.cards[index]) {
          this.cards[index].x = node.x;
          this.cards[index].y = node.y;
          this.cards[index].w = node.w;
          this.cards[index].h = node.h;
        }
      });
    },

    // Save widgets to localStorage
    saveWidgets() {
      this.syncGridPositions();
      console.log("Saving widgets:", this.cards);
      localStorage.setItem("teamWidgets", JSON.stringify(this.cards));
      this.$notify({
        type: "success",
        text: "Widgets saved successfully!",
      });
    },

    // Load widgets from localStorage
    loadWidgets() {
      const saved = localStorage.getItem("teamWidgets");
      if (saved) {
        try {
          this.cards = JSON.parse(saved);
        } catch (error) {
          console.error("Error loading widgets:", error);
        }
      }
    },

    // Add new widget
    addWidgets() {
      this.resetDataState();
      this.dialog = true;
      this.dialogMode = "new";
      this.dialogRenderKey++;
    },

    // Open widget settings
    openSetting(data, chartId) {
      this.dialog = true;
      this.dialogMode = "edit";
      this.data = { ...data };
      this.data.index = chartId;

      // Load existing filters if they exist
      if (data.filterData && data.filterData.length > 0) {
        this.filterData = JSON.parse(JSON.stringify(data.filterData));
        this.filterGroups = data.filterGroups || [];
      } else {
        this.filterData = [[]];
        this.filterGroups = [];
      }

      this.dialogRenderKey++;
    },

    // Close dialog and save widget
    closeDialog() {
      if (this.dialogMode === "edit") {
        const chartRef = this.$refs["chart" + this.data.index];
        if (chartRef && chartRef[0]) {
          // chartRef[0].reload();
        }
        const index = this.data.index;
        if (index !== undefined && this.cards[index]) {
          this.cards[index] = {
            ...this.data,
            filterData: this.filterData,
            filterGroups: this.filterGroups,
          };
        }
      } else if (this.dialogMode === "new") {
        this.cards.push({
          ...this.data,
          filterData: this.filterData,
          filterGroups: this.filterGroups,
        });
      }

      this.reloadGrid();
      this.resetDataState();
      this.dialog = false;
    },

    // Reset data state
    resetDataState() {
      this.data = {
        title: "",
        labels: this.labels,
        data: this.sData,
        type: "count",
        icon: "mdi-account-group",
        w: 3,
        h: 2,
      };
      this.selectmodel = {
        y: { model: "", field: "" },
        x: { model: "", field: "" },
      };
      this.filterData = [[]];
      this.filterGroups = [];
      this.tab = "data";
      this.groupFields = [];
      this.entityName = "";
    },

    // Get fillable fields for Y-axis
    async getFillable() {
      this.fields = [];

      try {
        const model = await this.loadFile(this.selectmodel.y.model);
        const res = await model.fillable();
        this.fields = res;
        await this.loadFromFields(this.selectmodel.y.model);
      } catch (error) {
        console.error("Error loading fillable fields:", error);
      }
    },

    // Get fillable fields for X-axis
    async getFillableX() {
      this.fieldsX = [];

      try {
        const model = await this.loadFile(this.selectmodel.x.model);
        const res = await model.fillable();
        this.fieldsX = res;
      } catch (error) {
        console.error("Error loading X-axis fields:", error);
      }
    },

    // Get data for widget
    async getData() {
      this.data.queryType = "";
      console.log("getData called");

      if (!this.selectmodel.y.model) {
        console.log("No model selected, returning");
        return;
      }

      try {
        this.data.selectmodel = this.selectmodel;
        this.data.filterGroups = this.filterGroups;
        if (this.data.type === "count") {
          return;
        }
        if (this.queryType === "sample") {
          this.data.queryType = "sample";
        }
      } catch (error) {
        console.error("Error getting data:", error);
      }
    },

    // Get data for X-axis
    async getDataX() {
      if (!this.selectmodel.x.model || !this.data.labels?.length) return;
      this.data.selectmodel = this.selectmodel;
      this.data.filterGroups = this.filterGroups;
    },

    // Load API file dynamically
    async loadFile(fileName) {
      const { default: Module } = await import(
        `@/API/${fileName}/${fileName}.ts`
      );
      return new Module();
    },

    // Load form fields from module
    async loadFromFields(fileName) {
      try {
        this.entityName = fileName;
        const { default: Module } = await import(
          `@/views/Page/${fileName}/${fileName}.vue`
        );

        const mockContext = {
          $t: (key) => key,
          tableColumns: [],
          fromFields: [],
          required: { password: "required" },
        };

        if (Module.created) {
          Module.created.call(mockContext);
        }

        this.groupFields = mockContext.fromFields || [];
      } catch (error) {
        console.error("Error loading form fields:", error);
      }
    },

    // Handle icon selection
    handleIconSelected(iconName) {
      this.data.icon = iconName;
    },

    // Handle color change
    handleColorChange(color) {
      this.data.color = color;
    },

    // Update filter data
    updateFilterData(filterData) {
      console.log("updateFilterData called with:", filterData);
      this.filterData = filterData;

      if (
        filterData.length === 0 ||
        (filterData.length === 1 && filterData[0].length === 0)
      ) {
        console.log("Clearing filters");
        this.filterData = [];
        this.filterGroups = [];
        this.getData();
      }
    },

    // Remove filter group
    removeFilterGroup(index) {
      this.filterGroups.splice(index, 1);
      this.filterData.splice(index, 1);
      this.getData();
    },

    // Apply filters if needed
    applyFiltersIfNeeded() {
      console.log("applyFiltersIfNeeded called");

      if (
        this.filterData &&
        this.filterData.length > 0 &&
        this.filterData[0] &&
        this.filterData[0].length > 0
      ) {
        console.log("Applying filters...");
        const currentTab = this.tab;
        this.processFilters();
        this.tab = currentTab;
      } else {
        console.log("No filters to apply");
      }
    },

    // Process filters
    processFilters() {
      if (!this.filterData || this.filterData.length === 0) {
        this.filterGroups = [];
        this.getData();
        return;
      }

      let filterGroups = [];

      this.filterData.forEach((fil) => {
        if (!fil || fil.length === 0) return;

        let groupObj = {
          filter: [],
          filterIn: [],
        };

        fil.forEach((group) => {
          let value = group.value;
          let type = group.field.type;

          if (
            [
              "text",
              "textarea",
              "email",
              "options",
              "flexibleOptions",
              "client_list",
              "user_list",
            ].includes(group.field.type)
          ) {
            type = "string";
          }

          if (group.operator.value === "not_like") {
            groupObj.filter.push({
              field: group.field.name,
              value: "/" + value + "/i",
              type: "string",
              operator: "not regexp",
            });
          } else if (
            ["starts_with", "ends_with", "like"].includes(group.operator.value)
          ) {
            if (group.operator.value === "like") {
              value = "%" + group.value + "%";
            } else if (group.operator.value === "starts_with") {
              value = group.value + "%";
            } else {
              value = "%" + group.value;
            }

            groupObj.filter.push({
              field: group.field.name,
              value: value,
              type: "string",
              operator: "like",
            });
          } else if (group.operator.value === "in") {
            groupObj.filterIn.push({
              field: group.field.name,
              values: Array.isArray(value) ? value : [value],
              type: "string",
            });
          } else {
            groupObj.filter.push({
              field: group.field.name,
              value: value,
              type: type,
              operator: group.operator.value,
            });
          }
        });

        if (groupObj.filter.length > 0 || groupObj.filterIn.length > 0) {
          filterGroups.push(groupObj);
        }
      });

      this.filterGroups = filterGroups;
      this.$nextTick(() => {
        this.getData();
      });
    },

    // Close filter and apply
    closeFilter() {
      console.log("closeFilter called, filterData:", this.filterData);

      if (!this.filterData || this.filterData.length === 0) {
        this.filterGroups = [];
        this.getData();
        return;
      }

      this.processFilters();
      this.tab = "data";
    },
  },

  async mounted() {
    this.loadWidgets();
    this.$nextTick(() => {
      if (this.showDashboard && this.$refs.grid) {
        this.initGrid();
      }
    });
    await this.fetchStatisticsData();
    this.load = false;
  },

  watch: {
    tab(newTab) {
      if (newTab === "data" && this.filterData.length > 0) {
        this.$nextTick(() => {
          this.processFilters();
        });
      }
    },
    showDashboard(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initGrid();
        });
      }
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */

/* Modal transition styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-active .modal-dialog,
.modal-fade-leave-active .modal-dialog {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-dialog,
.modal-fade-leave-to .modal-dialog {
  transform: translateY(-20px);
  opacity: 0;
}

.modal-fade-enter-to .modal-dialog,
.modal-fade-leave-from .modal-dialog {
  transform: translateY(0);
  opacity: 1;
}

/* Modal styles */
.modal {
  z-index: 1050;
}

.modal-dialog {
  max-width: 600px;
}

.modal-content {
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 80%;
  margin: auto;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

/* Center table headers and cells */
.modal-body table th,
.modal-body table td {
  text-align: center;
  vertical-align: middle;
}

/* User avatars container */
.user-avatars-container {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: center;
  transition: transform 0.2s ease-in-out;
}

.user-avatars-container:hover {
  transform: scale(1.05);
}

/* Individual user avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.2s ease-in-out;
}

/* Generate different background colors for avatars */
.user-avatar:nth-child(1) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-avatar:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-avatar:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.user-avatar:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.user-avatar:nth-child(5) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Count badge for +N users */
.user-count-avatar {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
  color: #333 !important;
  font-size: 10px;
  font-weight: 700;
}

/* Empty state avatar */
.user-empty-avatar {
  background: #e0e0e0 !important;
  color: #999 !important;
}

/* Hover effect for individual avatars */
.user-avatars-container:hover .user-avatar {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item,
[dir="rtl"] .children-modal-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row {
  text-align: end;
}

/* Dashboard styles */
.dashboard-container {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.widget-controls {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grid-stack {
  min-height: 500px;
  background: transparent;
}

.grid-stack-item-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.widget {
  min-height: 100%;
  transition: box-shadow 0.2s ease;
}

.widget:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.chart-preview {
  transition: all 0.3s ease;
}

/* Statistics Modal Styles */
.metric-card {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.metric-label {
  font-size: 0.875rem;
  margin: 5px 0 0 0;
  opacity: 0.8;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container-equal-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

[dir="rtl"] .dir-rtl {
  direction: rtl !important;
}

/* User info styles for datatable */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar-clickable {
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-avatar-clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-users-text {
  color: #999;
  font-style: italic;
}

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
</style>
<style>
.custom-table th,
td {
  text-align: center !important;
}
</style>
