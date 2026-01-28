<template>
  <PurpleDotsLoader v-if="load" />
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    v-else
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('job.governance')"
    :mainSubPage="this.$t('job.job')"
    :titlePage="this.$t('job.job')"
    v-permission:show
    :showInsightsTab="true"
  >
    <div v-permission:update v-permission:destroy></div>

    <!-- Statistics Slot - Displays in the "Inside" tab -->
    <template #statistics>
      <div class="statistics-content">
        <!-- Statistics Content -->
        <!-- Metrics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="metric-card bg-primary-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-briefcase"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value metric-value-crimson">
                  {{ statistics.totalJobs }}
                </h3>
                <p class="metric-label metric-label-crimson">
                  {{ $t("job.total_jobs") }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-success-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value metric-value-golden">
                  {{ statistics.totalUsersInJobs }}
                </h3>
                <p class="metric-label metric-label-golden">
                  {{ $t("job.total_users_in_jobs") }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-info-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value metric-value-forest">
                  {{ statistics.managerialJobs }}
                </h3>
                <p class="metric-label metric-label-forest">
                  {{ $t("job.managerial_jobs") }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-warning-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value metric-value-steel">
                  {{ statistics.emptyJobs }}
                </h3>
                <p class="metric-label metric-label-steel">
                  {{ $t("job.empty_jobs") }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="row">
          <!-- Job Distribution by Department (Donut Chart) -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">{{ $t("job.jobs_by_department") }}</h6>
              <apexchart
                v-if="jobsByDepartmentSeries.length > 0"
                type="pie"
                height="300"
                :options="jobsByDepartmentOptions"
                :series="jobsByDepartmentSeries"
              />
            </div>
          </div>

          <!-- Manager vs Non-Manager Jobs (Donut Chart) -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">{{ $t("job.manager_distribution") }}</h6>
              <apexchart
                v-if="managerDistributionSeries.length > 0"
                type="pie"
                height="300"
                :options="managerDistributionOptions"
                :series="managerDistributionSeries"
              />
            </div>
          </div>

          <!-- Top 10 Jobs by Users (Horizontal Bar Chart) -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">{{ $t("job.top_jobs_by_users") }}</h6>
              <apexchart
                v-if="topJobsSeries[0]?.data.length > 0"
                type="bar"
                height="400"
                :options="topJobsOptions"
                :series="topJobsSeries"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :filters="jobFilters"
        :Statistics="openStatistics"
        :hideStatisticsButton="true"
      >
        <template #name="{ item }">
          <a
            href="javascript:void(0)"
            class="job-name-link"
            @click="openDetailsModal(item)"
          >
            {{ item.name || "N/A" }}
          </a>
        </template>
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #description="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            {{ stripHtmlTags(item.description) }}
          </div>
        </template>

        <template #departments="{ item }">
          <div>
            <template v-if="item?.departments">
              <span
                v-if="item.departments.length > 0"
                @click="openDepartmentsModal(item.departments)"
                style="cursor: pointer"
              >
                <span class="bg-primary department-item">
                  {{ item.departments[0]?.name }}
                </span>
              </span>
            </template>
            <span v-else class="text-muted">No Departments</span>
          </div>
        </template>

        <template #position="{ item }">
          <div>
            <template v-if="item?.position">
              <span style="cursor: pointer">
                <span class="bg-primary department-item">
                  {{ item.position?.name }}
                </span>
              </span>
            </template>
            <span v-else class="text-muted">No Position</span>
          </div>
        </template>
        <!-- In your template section, update the #users slot -->
        <template #users="{ item }">
          <span v-if="item?.users && item.users.length > 0">
            <!-- Single user: display with avatar and name -->
            <div v-if="item.users.length === 1" class="user-info">
              <div
                class="user-avatar"
                @click.prevent="openUserDetailsModal(item.users[0])"
              >
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
            <AvatarGroup
              v-else
              :users="
                item.users.map((u) => ({
                  ...u,
                  full_name: u.full_name || u.name,
                }))
              "
              :max-visible="2"
              :spacing="20"
              :clickable="true"
              empty-text="No users"
              @user-click="openUserDetailsModal"
            />
          </span>

          <!-- Show message if no users -->
          <span v-else class="no-users-text">
            {{ $t("job.no_users") || "No users" }}
          </span>
        </template>
        <!-- <template #addAction="{ item }">
          <v-list-item @click="openDetailsModal(item)" class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("job.overview") }}
            </v-list-item-title>
          </v-list-item>
        </template> -->
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
        <template #is_manager>
          <div class="form-group">
            <h5>{{ $t("job.is_manager") }}</h5>
            <div class="form-check form-switch form-check-inline">
              <input
                type="checkbox"
                v-model="newItem.is_manager"
                @change="isManagerChanged"
                class="form-check-input check-size ms-1"
                role="switch"
              />
            </div>
            <!-- Checkbox Field Description
            <div class="form-text d-block w-100">
              {{ $t("job.is_manager_description") }}
            </div> -->
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Filter Modal -->
  <div
    v-if="isFilterModalOpen"
    class="modal-overlay"
    @click.self="closeFilterModal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ $t("filters") }}
        </h5>
        <button @click="closeFilterModal" class="btn-close" aria-label="Close">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 2L2 18M18 18L2 2"
              stroke="#404040"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-md-12 mb-3">
            <label for="position_id"> {{ $t("job.position") }}</label>
            <div class="select-wrapper">
              <select
                id="position_id"
                class="form-control"
                v-model="filter.position_id"
              >
                <option value="" disabled selected>
                  {{ $t("job.chooseaposition") }}
                </option>
                <option value="">{{ $t("job.all") }}</option>
                <option
                  v-for="position in positions"
                  :key="position.id"
                  :value="position.id"
                >
                  {{ position.name }}
                </option>
              </select>
              <i
                v-if="filter.position_id"
                class="fa-solid fa-times clear-icon"
                @click="clearPositionFilter"
                title="Clear selection"
              >
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Details Modal -->
  <div
    v-if="isDetailsModalOpen"
    class="modal-overlay"
    @click.self="closeDetailsModal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("job.overview") }}</h5>
        <button @click="closeDetailsModal" class="btn-close" aria-label="Close">
          <i class="fas fa-times fs-5"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="taskTitle" class="form-label"
              >{{ $t("job.name") }} :
            </label>
            <p class="text-bold">{{ this.jobData.name }}</p>
          </div>

          <div class="col-md-6">
            <label for="taskDescription" class="form-label"
              >{{ $t("job.description") }} :
            </label>
            <p class="text-bold message">
              {{ stripHtmlTags(this.jobData.description) }}
            </p>
          </div>

          <div class="col-md-6">
            <label for="taskDescription" class="form-label"
              >{{ $t("job.createdat") }} :
            </label>
            <p class="text-bold">{{ formatDate(this.jobData.created_at) }}</p>
          </div>
          <div class="col-md-6">
            <label for="taskDescription" class="form-label"
              >{{ $t("job.updatedat") }} :
            </label>
            <p class="text-bold">{{ formatDate(this.jobData.updated_at) }}</p>
          </div>
          <div class="col-md-6">
            <label for="taskDescription" class="form-label"
              >{{ $t("job.relatedposition") }} :
            </label>
            <p class="text-bold">{{ this.jobData?.position?.name || "N/A" }}</p>
          </div>

          <div class="col-md-6">
            <label for="taskDescription" class="form-label"
              >{{ $t("job.relateddepartments") }} :
            </label>

            <p class="text-bold">
              {{ getDepartmentNames(jobData.department_ids) || "N/A" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- View user details modal -->
  <ViewUserDetails
    :viewUserModal="viewUserModal"
    :userData="userData"
    @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event"
  />

  <!-- Departments Modal -->
  <div
    v-if="isDepartmentsModalOpen"
    class="modal-overlay"
    @click.self="closeDepartmentsModal"
  >
    <div class="departments-modal-container">
      <div class="departments-modal-header">
        <h5 class="departments-modal-title">Departments</h5>
        <button class="departments-close-btn" @click="closeDepartmentsModal">
          <i class="fas fa-times fs-5"></i>
        </button>
      </div>
      <div class="departments-modal-body">
        <div
          v-for="department in selectedDepartments"
          :key="department.id"
          class="bg-primary department-item"
        >
          <span class="department-name">{{ department?.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import job from "@/API/Job/Job";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Department from "@/API/Department/Department";
import Position from "@/API/Position/Position";
import User from "@/API/User/User";
import VueApexCharts from "vue3-apexcharts";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import AvatarGroup from "@/components/AvatarGroup.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    apexchart: VueApexCharts,
    PurpleDotsLoader,
    ViewUserDetails,
    AvatarGroup,
  },

  setup() {
    const api = new job();
    const userApi = new User();
    const apiParams = { with: ["departments", "users", "position"] };
    const tableColumns = [];
    const fromFields = [];
    const departmentList = new Department();
    const positionList = new Position();

    return {
      api,
      userApi,
      apiParams,
      tableColumns,
      fromFields,
      departmentList,
      positionList,
    };
  },

  async mounted() {
    await this.fetchPositions();

    try {
      this.usersData = await this.userApi.getAll({
        select: "id|full_name",
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }

    try {
      this.positions = await this.positionList.getAll({
        select: "id|name",
      });
    } catch (error) {
      console.error("Error fetching positions:", error);
    }

    // Fetch statistics data on mount
    await this.fetchStatisticsData();
    this.load = false;
  },

  data() {
    return {
      load: true,
      managerPosition: null,
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      departments: [],
      positions: [],
      departmentList: [],
      usersData: [],
      filter: {
        department: "",
        position: "",
      },

      jobFilters: [
        {
          title: "Department",
          key: "department_ids",
          type: "array",
          data: "Department",
        },
        {
          title: "Position",
          key: "position_id",
          type: "string",
          data: "Position",
        },
      ],

      selectedAction: null,
      selectedJobId: null,
      isDetailsModalOpen: false,
      isFilterModalOpen: false,
      isModalOpen: false,
      isDepartmentsModalOpen: false,
      selectedDepartments: [],
      viewUserModal: false,
      userData: {},
      departmentsLookup: {}, // Department lookup dictionary (id -> name)

      // Statistics properties
      loadingStatistics: true,
      statistics: {
        totalJobs: 0,
        totalUsersInJobs: 0,
        managerialJobs: 0,
        emptyJobs: 0,
      },

      // Jobs by Department (Donut Chart)
      jobsByDepartmentSeries: [],
      jobsByDepartmentOptions: {
        chart: {
          type: "pie",
        },
        labels: [],
        colors: ["#A92525", "#C4951B", "#255F0B", "#999999"],
        legend: {
          position: "bottom",
        },
      },

      // Manager Distribution (Donut Chart)
      managerDistributionSeries: [],
      managerDistributionOptions: {
        chart: {
          type: "pie",
        },
        labels: [],
        colors: ["#255F0B", "#C4951B"],
        legend: {
          position: "bottom",
        },
      },

      // Top Jobs by Users (Horizontal Bar)
      topJobsSeries: [
        {
          name: this.$t?.("job.users") || "Users",
          data: [],
        },
      ],
      topJobsOptions: {
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
            text: this.$t?.("job.users") || "Users",
          },
        },
        colors: ["#A92525"],
      },

      // Job Size Distribution (Bar Chart)
      jobSizeDistributionSeries: [
        {
          name: this.$t?.("job.number_of_jobs") || "Number of Jobs",
          data: [],
        },
      ],
      jobSizeDistributionOptions: {
        chart: {
          type: "bar",
        },
        xaxis: {
          categories: [],
          title: {
            text: this.$t?.("job.job_size") || "Job Size (Users)",
          },
        },
        yaxis: {
          title: {
            text: this.$t?.("job.number_of_jobs") || "Number of Jobs",
          },
        },
        colors: ["#C4951B"],
      },

      // Users by Position (Horizontal Bar)
      usersByPositionSeries: [
        {
          name: this.$t?.("job.users") || "Users",
          data: [],
        },
      ],
      usersByPositionOptions: {
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
            text: this.$t?.("job.users") || "Users",
          },
        },
        colors: ["#255F0B"],
      },
    };
  },

  created() {
    this.tableColumns = [
      {  id: "name", title: this.$t("job.name"), data: "name", defaultContent: "N/A" },
      { title: this.$t("job.code"), data: "code", defaultContent: "N/A" },
      {
        id: "departments",
        title: this.$t("job.departments"),
        data: "departments.name",
        defaultContent: "N/A",
      },
      {
        id: "users",
        title: this.$t("job.users"),
        data: "users.count",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("job.name"),
        type: "text",
        rules: "required",
        description: "Please enter the name.",
        col: 6,
      },
      {
        name: "code",
        label: this.$t("job.code"),
        type: "text",
        rules: "required",
        description: "Please enter a code.",
        col: 6,
      },
      {
        name: "description",
        label: this.$t("job.description"),
        type: "textarea",
        rules: "",
        description: "Provide a description of the job.",
        col: 12,
      },
      {
        name: "is_manager",
        label: this.$t("job.ismanager"),
        type: "checkbox",
        rules: "",
        description: "Check if this job is for a managerial position.",
        col: 6,
      },
    ];
  },

  methods: {
    isManagerChanged(value) {
      if (this.newItem.is_manager) {
        this.newItem.position_id = this.managerPosition?.id || null;
      } else {
        this.newItem.position_id = null;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    async fetchPositions() {
      const response = await this.positionList.getAll();
      this.managerPosition = response?.find((pos) => pos.code === "manager");
      if (!this.managerPosition) {
        const result = await this.positionList.insert({
          name: "Manager",
          code: "manager",
          description: "Manager Position",
        });
        if (result && result.status === "success")
          this.managerPosition = result.data;
      }
    },

    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
    },

    openDetailsModal(selectedRow) {
      this.selectedAction = "";
      this.selectedJobId = selectedRow.id;
      this.isDetailsModalOpen = true;
      this.jobData = selectedRow;
    },

    async closeDetailsModal() {
      this.isDetailsModalOpen = false;
    },

    openDepartmentsModal(departments) {
      this.isDepartmentsModalOpen = true;
      this.selectedDepartments = departments;
    },

    closeDepartmentsModal() {
      this.isDepartmentsModalOpen = false;
      this.selectedDepartments = [];
    },

    // Open user details modal
    openUserDetailsModal(user) {
      if (!user) return;
      this.userData = { ...user };
      try {
        let userDepartment =
          this.departmentsLookup[this.userData.department_id] ?? {};
        this.userData.department = userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    },

    // Get user initials from full name
    getUserInitials(fullName) {
      if (!fullName) return "U";
      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    },

    getDepartmentNames(departmentIds) {
      if (!departmentIds || !Array.isArray(departmentIds))
        return "No departments assigned";

      return departmentIds
        .map((id) => {
          const department = this.departments.find((dept) => dept.id === id);
          return department ? department.name : "";
        })
        .filter((name) => name)
        .join(", ");
    },

    async fetchStatisticsData() {
      try {
        // Fetch all jobs with users, departments, and positions
        const [allJobs, allUsers, allDepartments, allPositions] =
          await Promise.all([
            this.api.getAll({ with: ["users", "departments", "position"] }),
            this.userApi.getAll({ select: "id|full_name|job_id" }),
            this.departmentList.getAll({ select: "id|name" }),
            this.positionList.getAll({ select: "id|name" }),
          ]);

        // Build departments lookup dictionary (id -> name)
        this.departmentsLookup = allDepartments.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});

        // Calculate basic metrics
        const totalJobs = allJobs.length;
        const managerialJobs = allJobs.filter((job) => job.is_manager).length;
        const emptyJobs = allJobs.filter(
          (job) => !job.users || job.users.length === 0
        ).length;
        const totalUsersInJobs = allUsers.filter((user) => user.job_id).length;

        this.statistics = {
          totalJobs,
          totalUsersInJobs,
          managerialJobs,
          emptyJobs,
        };

        // Jobs by Department (Donut Chart)
        const departmentJobCounts = {};
        allJobs.forEach((job) => {
          if (job.departments && job.departments.length > 0) {
            job.departments.forEach((dept) => {
              departmentJobCounts[dept.id] =
                (departmentJobCounts[dept.id] || 0) + 1;
            });
          }
        });

        const departmentData = allDepartments
          .map((dept) => ({
            name: dept.name,
            count: departmentJobCounts[dept.id] || 0,
          }))
          .filter((d) => d.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        this.jobsByDepartmentSeries = departmentData.map((d) => d.count);
        this.jobsByDepartmentOptions = {
          ...this.jobsByDepartmentOptions,
          labels: departmentData.map((d) => d.name),
        };

        // Manager Distribution (Donut Chart)
        const nonManagerialJobs = totalJobs - managerialJobs;
        this.managerDistributionSeries = [managerialJobs, nonManagerialJobs];
        this.managerDistributionOptions = {
          ...this.managerDistributionOptions,
          labels: [this.$t("job.managerial"), this.$t("job.non_managerial")],
        };

        // Top 10 Jobs by Users (Horizontal Bar)
        const jobsWithUserCount = allJobs.map((job) => ({
          name: job.name,
          count: job.users ? job.users.length : 0,
        }));

        jobsWithUserCount.sort((a, b) => b.count - a.count);
        const top10Jobs = jobsWithUserCount.slice(0, 10);

        this.topJobsSeries = [
          {
            name: this.$t("job.users"),
            data: top10Jobs.map((j) => j.count),
          },
        ];
        this.topJobsOptions = {
          ...this.topJobsOptions,
          xaxis: {
            categories: top10Jobs.map((j) => j.name),
            title: {
              text: this.$t("job.users"),
            },
          },
        };

        // Job Size Distribution (Bar Chart)
        const sizeRanges = {
          0: 0,
          "1-5": 0,
          "6-10": 0,
          "11-20": 0,
          "20+": 0,
        };

        allJobs.forEach((job) => {
          const size = job.users ? job.users.length : 0;
          if (size === 0) sizeRanges["0"]++;
          else if (size >= 1 && size <= 5) sizeRanges["1-5"]++;
          else if (size >= 6 && size <= 10) sizeRanges["6-10"]++;
          else if (size >= 11 && size <= 20) sizeRanges["11-20"]++;
          else sizeRanges["20+"]++;
        });

        this.jobSizeDistributionSeries = [
          {
            name: this.$t("job.number_of_jobs"),
            data: Object.values(sizeRanges),
          },
        ];
        this.jobSizeDistributionOptions = {
          ...this.jobSizeDistributionOptions,
          xaxis: {
            categories: Object.keys(sizeRanges),
            title: {
              text: this.$t("job.job_size"),
            },
          },
        };

        // Users by Position (Horizontal Bar)
        const positionUserCounts = {};
        allJobs.forEach((job) => {
          if (job.position && job.users) {
            positionUserCounts[job.position.id] =
              (positionUserCounts[job.position.id] || 0) + job.users.length;
          }
        });

        const positionData = allPositions
          .map((pos) => ({
            name: pos.name,
            count: positionUserCounts[pos.id] || 0,
          }))
          .filter((p) => p.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        this.usersByPositionSeries = [
          {
            name: this.$t("job.users"),
            data: positionData.map((p) => p.count),
          },
        ];
        this.usersByPositionOptions = {
          ...this.usersByPositionOptions,
          xaxis: {
            categories: positionData.map((p) => p.name),
            title: {
              text: this.$t("job.users"),
            },
          },
        };
      } catch (error) {
        console.error("Error fetching statistics data:", error);
        throw error;
      }
    },
  },

  watch: {
    filter: {
      deep: true,
      handler(newFilter) {
        const filters = [];

        if (newFilter.department) {
          filters.push(`department_ids|${newFilter.department}|=`);
        }
        if (newFilter.user_ids) {
          filters.push(`user_ids|${newFilter.user_ids}|=`);
        }

        this.apiParams.filter = filters.join(",");
        this.$refs.table.refreshTable();
      },
    },
  },
};
</script>

<style scoped>
/* Add these styles to your existing CSS */

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #6e3894;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.user-avatar:hover {
  background-color: #5a2e7a;
  transform: scale(1.05);
}

.user-fullname {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-users-text {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

/* Make sure the avatar container in table cell is properly aligned */
:deep(.dtr-control) .user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* For RTL support */
[dir="rtl"] .user-info {
  flex-direction: row-reverse;
}
/* Basic styling for the modal overlay and content */
.form-label {
  font-weight: 400;
  font-size: 12px !important;
  line-height: 100%;
  letter-spacing: 0;
  opacity: 1;
  color: rgb(33, 37, 41, 0.75) !important;
}
.text-bold {
  font-weight: 600;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: 0;
  opacity: 1;
  color: rgb(33, 37, 41, 0.9) !important;
}
.message {
  color: #6e3894 !important;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: #f5f5f5;
  border-radius: 0.375rem;
  width: 100%;
  max-width: 750px;
  padding: 10px 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 5px;
  margin-right: 5px;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  font-size: 15px;
  border: none;
  color: #000 !important;
  background: none;
  cursor: pointer;
}

.modal-body {
  padding: 15px;
  border-radius: 15px;
  background-color: white;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.ck-editor__editable {
  min-height: 200px !important;
}

.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-wrapper .form-control {
  padding-right: 35px;
}

.clear-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  z-index: 10;
  transition: color 0.2s ease;
}

.clear-icon:hover {
  color: #dc3545;
}

@import "vue-multiselect/dist/vue-multiselect.min.css";

select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

/* Departments Modal Styling */
.departments-modal-container {
  background: white;
  border-radius: 16px;
  width: 200px;
  max-height: 400px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlideUp 0.3s ease-out;
}

.departments-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.departments-modal-title {
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.departments-close-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.departments-close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
  transform: rotate(90deg);
}

.departments-modal-body {
  padding: 16px 20px;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.department-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  margin-bottom: 5px;
  border-radius: 10px;
  background-color: #d0b5e3 !important;
  color: #6e3894 !important;
  font-size: 10px;
  font-weight: 500;
}

.department-name {
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
  font-size: 10px;
  font-weight: 500;
  color: #6e3894;
  text-transform: capitalize;
  text-align: center;
}

.departments-modal-body::-webkit-scrollbar {
  width: 6px;
}

.departments-modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.departments-modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.departments-modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Statistics Content Styles */
.statistics-content {
  padding: 20px;
}

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

/* Crimson Earth */
.metric-card-crimson {
  background-color: #eed3d380;
}

.metric-icon-crimson {
  font-size: 1.5rem;
  color: #a92525;
}

.metric-value-crimson {
  color: #541212;
}

.metric-label-crimson {
  color: #541212;
}

/* Golden Olive */
.metric-card-golden {
  background-color: #f3ead180;
}

.metric-icon-golden {
  font-size: 1.5rem;
  color: #c4951b;
}

.metric-value-golden {
  color: #a37c16;
}

.metric-label-golden {
  color: #a37c16;
}

/* Forest Deep */
.metric-card-forest {
  background-color: #b6caae80;
}

.metric-icon-forest {
  font-size: 1.5rem;
  color: #255f0b;
}

.metric-value-forest {
  color: #122f05;
}

.metric-label-forest {
  color: #122f05;
}

/* Steel Grey */
.metric-card-steel {
  background-color: #d9d9d9;
}

.metric-icon-steel {
  font-size: 1.5rem;
  color: #999999;
}

.metric-value-steel {
  color: #404040;
}

.metric-label-steel {
  color: #404040;
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

[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item,
[dir="rtl"] .departments-modal-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row {
  text-align: end;
}
.custom-table th,
td {
  text-align: center !important;
}
[dir="rtl"] .chart-title {
  text-align: end;
}
</style>
