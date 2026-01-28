<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('thirdpartyprofile.risk_mgmt')"
    :mainSubPage="$t('thirdpartyprofile.third_party')"
    :subPage="$t('thirdpartyprofile.profiles')"

 :titlePage="$t('thirdpartyprofile.profiles')"   :showInsightsTab="true"
    v-permission:show
  >
    <div v-permission:edit v-permission:delete></div>
    <template #statistics>
      <div class="statistics-content">
        <!-- Metrics Cards Row -->
        <div class="row mb-4">
          <div class="col-md-3 col-sm-6 col-12 mb-3">
            <div class="metric-card bg-primary-subtle">
              <div class="metric-icon">
                <i class="fas fa-building"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ thirdPartyStatisticsData.totalProfiles || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("thirdpartyprofile.total_profiles") || "Total Profiles" }}
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6 col-12 mb-3">
            <div class="metric-card bg-success-subtle">
              <div class="metric-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ thirdPartyStatisticsData.totalBumRequests || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("thirdpartyprofile.total_bum_requests") || "Total BUM Requests" }}
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6 col-12 mb-3">
            <div class="metric-card bg-warning-subtle">
              <div class="metric-icon">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ thirdPartyStatisticsData.totalAssessments || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("thirdpartyprofile.total_assessments") || "Total Assessments" }}
                </p>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-sm-6 col-12 mb-3">
            <div class="metric-card bg-info-subtle">
              <div class="metric-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ thirdPartyStatisticsData.evaluationThirdParty || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("thirdpartyprofile.evaluation_third_party") || "Evaluation Third-Party" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="row">
          <!-- Classification Distribution Chart -->
          <div class="col-md-6 col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("thirdpartyprofile.classification_distribution") || "Classification Distribution" }}
              </h6>
              <highcharts :options="classificationDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Request Status Distribution Chart -->
          <div class="col-md-6 col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("thirdpartyprofile.request_status_distribution") || "BUM Request Status" }}
              </h6>
              <highcharts :options="requestStatusChart"></highcharts>
            </div>
          </div>

          <!-- Assessment Status Distribution Chart -->
          <div class="col-md-6 col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("thirdpartyprofile.assessment_status_distribution") || "Assessment Status" }}
              </h6>
              <highcharts :options="assessmentStatusChart"></highcharts>
            </div>
          </div>

          <!-- Evaluation Distribution Chart -->
          <div class="col-md-6 col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("thirdpartyprofile.evaluation_distribution") || "Evaluation Distribution" }}
              </h6>
              <highcharts :options="evaluationDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Profiles Creation Timeline Chart -->
          <div class="col-md-12 col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("thirdpartyprofile.profiles_creation_timeline") || "Profiles Creation Timeline" }}
              </h6>
              <highcharts :options="profilesCreationTimelineChart"></highcharts>
            </div>
          </div>

          <!-- Requests Creation Timeline Chart -->
          <div class="col-md-12 col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("thirdpartyprofile.requests_creation_timeline") || "BUM Requests Timeline" }}
              </h6>
              <highcharts :options="requestsCreationTimelineChart"></highcharts>
            </div>
          </div>

          <!-- Department Distribution Chart -->
          <div class="col-md-12 col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("thirdpartyprofile.department_distribution") || "BUM Requests by Department" }}
              </h6>
              <highcharts :options="departmentDistributionChart"></highcharts>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #datatable>
      <DataTable
        ref="table"
        v-permission:show
        v-permission:insert
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
      >
        <template #Name="{ item }">
          <a
            href="javascript:void(0)"
            @click="openViewModal(item)"
            :title="$t('requirement.view_requirement')"
            class="text-badge"
          >
            {{ item.third_party_name }}
          </a>
        </template>

        <template #classification="{ item }">{{
          item.classification?.name
        }}</template>

        <template #created_at="{ item }">{{
          formatDate(item.created_at)
        }}</template>

        <template #addAction="{ item }">
          <v-list-item
            v-permission:viewProfile
            class="action-list-item"
            @click="openViewModal(item)"
          >
            <template v-slot:prepend>
              <v-icon size="18">mdi-eye-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("thirdpartyrequest.view") }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

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

  <!-- Create Modal -->
  <CreateProfileModal
    :show="showCreateModal"
    :classifications="classifications"
    :api="api"
    @close="showCreateModal = false"
    @success="handleCreateSuccess"
    @error="handleError"
  />

  <!-- Edit Modal -->
  <EditProfileModal
    :show="showEditModal"
    :profileId="selectedProfileId"
    :classifications="classifications"
    :api="api"
    @close="showEditModal = false"
    @success="handleEditSuccess"
    @error="handleError"
  />

  <!-- View Modal -->
  <ViewProfileModal
    :show="showViewModal"
    :profileData="viewProfileData"
    @close="showViewModal = false"
  />
</template>

<script>
import thirdpartyprofile from "@/API/ThirdPartyProfile/ThirdPartyProfile";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import CreateProfileModal from "./CreateModal.vue";
import EditProfileModal from "./EditModal.vue";
import ViewProfileModal from "./ViewModal.vue";
import ThirdPartyClassification from "@/API/ThirdPartyClassification/ThirdPartyClassification";
import ThirdPartyRequest from "@/API/ThirdPartyRequest/ThirdPartyRequest";
import dayjs from "dayjs";
import User from "@/API/User/User";
import Department from "@/API/Department/Department";
import Highcharts from "highcharts";
import { Chart } from "highcharts-vue";

// Import additional Highcharts modules for 3D effects
import "highcharts/highcharts-more";
import "highcharts/modules/solid-gauge";

// Configure Highcharts globally
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

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    CreateProfileModal,
    EditProfileModal,
    ViewProfileModal,
    highcharts: Chart,
  },

  setup() {
    const api = new thirdpartyprofile();
    const thirdPartyClassificationApi = new ThirdPartyClassification();
    const thirdPartyRequestApi = new ThirdPartyRequest();
    const userApi = new User();
    const departmentApi = new Department();

    const apiParams = {
      with: [
        "normalContacts",
        "businessContacts",
        "technicalContacts",
        "cyberContacts",
        "entities",
        "subsidiaries",
        "classification",
      ],
    };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      thirdPartyClassificationApi,
      thirdPartyRequestApi,
      userApi,
      departmentApi,
    };
  },

  async mounted() {
    // this.classifications = await this.thirdPartyClassificationApi.getAll();
    await this.listData();
    await this.fetchThirdPartyStatisticsData();
  },
  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      classifications: [],

      showCreateModal: false,
      showEditModal: false,
      showViewModal: false,

      selectedProfileId: null,
      viewProfileData: {},

      showViewDetailsModal: false,
      viewProfileDetailsData: {},
      users: [],
      departments: [],

      // Statistics data
      thirdPartyStatisticsData: {
        totalProfiles: 0,
        totalBumRequests: 0,
        totalAssessments: 0,
        evaluationThirdParty: 0,
      },
      requestStatusChart: {},
      assessmentStatusChart: {},
      profilesCreationTimelineChart: {},
      requestsCreationTimelineChart: {},
      classificationDistributionChart: {},
      evaluationDistributionChart: {},
      departmentDistributionChart: {},
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id: "Name",
        title: this.$t("thirdpartyprofile.name"),
        data: "third_party_name",
        defaultContent: "N/A",
      },
      {
        title: this.$t("thirdpartyprofile.owner"),
        data: "owner",
        defaultContent: "N/A",
      },
      {
        id: "classification",
        title: this.$t("thirdpartyprofile.classification"),
        data: "classification.name",
        defaultContent: "N/A",
      },
      {
        title: this.$t("thirdpartyprofile.contract_term"),
        data: "contract_term",
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("thirdpartyprofile.created_at"),
        data: "created_at",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("thirdpartyprofile.thirdpartyprofilename"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("thirdpartyprofile.name_description"),
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("thirdpartyprofile.thirdpartyprofileemail"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: this.$t("thirdpartyprofile.email_description"),
        col: 6,
      },
      {
        type: "options", // Dropdown/select field
        name: "myOptions",
        label: this.$t("thirdpartyprofile.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("thirdpartyprofile.options_description"),
      },
      {
        name: "terms",
        label: this.$t("thirdpartyprofile.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: this.$t("thirdpartyprofile.terms_description"),
        col: 6,
      },
      {
        name: "description",
        label: this.$t("thirdpartyprofile.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: this.$t("thirdpartyprofile.description_description"),
        col: 12,
      },
    ];
  },

  methods: {
    async listData() {
      const usersResponse = await this.userApi.getAll({
        select: "id|full_name|department_id",
      });
      this.users = usersResponse;

      const departmentsResponse = await this.departmentApi.getAll({
        select: "id|name",
      });
      this.departments = departmentsResponse.reduce((map, department) => {
        map[department.id] = department.name;
        return map;
      }, {});
    },
    formatDate(date) {
      if (!date) return "N/A";
      return dayjs(date).format("DD-MM-YYYY HH:mm:ss");
    },

    async fetchThirdPartyStatisticsData() {
      try {
        // Fetch all third party profiles with relationships
        const allProfiles = await this.api.getAll({
          with: [
            "classification",
            "requests",
            "requests.assessment",
          ],
        });

        // Fetch all third party requests with relationships
        const allRequests = await this.thirdPartyRequestApi.getAll({
          with: ["assessment", "profile"],
        });

        console.log("Third Party Profiles data:", allProfiles);
        console.log("Third Party Requests data:", allRequests);

        // Initialize counters
        let totalProfiles = allProfiles?.length || 0;
        let totalBumRequests = allRequests?.length || 0;
        let totalAssessments = 0;
        let totalEvaluation = 0;
        let evaluationCount = 0;

        const classificationCounts = {};
        const requestStatusCounts = {};
        const assessmentStatusCounts = {};
        const evaluationScores = {};
        const profilesCreationByMonth = {};
        const requestsCreationByMonth = {};
        const departmentCounts = {};

        // Process profiles
        if (allProfiles && Array.isArray(allProfiles)) {
          allProfiles.forEach((profile) => {
            // Classification distribution
            const classification = profile.classification?.name || "Unclassified";
            classificationCounts[classification] =
              (classificationCounts[classification] || 0) + 1;

            // Profiles creation timeline
            if (profile.created_at) {
              const monthKey = new Date(profile.created_at)
                .toISOString()
                .substring(0, 7);
              profilesCreationByMonth[monthKey] = (profilesCreationByMonth[monthKey] || 0) + 1;
            }
          });
        }

        // Process requests for department distribution (based on department_id)
        const departmentStats = {};
        if (allRequests && Array.isArray(allRequests)) {
          allRequests.forEach((request) => {
            // Department distribution - use department_id directly from request
            const departmentName = request.department_id
              ? (this.departments[request.department_id] || "Unassigned")
              : "Unassigned";

            // Initialize department stats if not exists
            if (!departmentStats[departmentName]) {
              departmentStats[departmentName] = {
                totalRequests: 0,
                totalAssessments: 0,
                acceptedAssessments: 0,
                pendingAssessments: 0,
              };
            }

            // Count total requests
            departmentStats[departmentName].totalRequests++;
            departmentCounts[departmentName] = (departmentCounts[departmentName] || 0) + 1;

            // Count assessments
            if (request.assessment) {
              departmentStats[departmentName].totalAssessments++;

              // Count by assessment status
              const assessmentStatus = request.assessment.status?.toLowerCase() || "pending";
              if (assessmentStatus === "completed" || assessmentStatus === "accepted" || assessmentStatus === "approved") {
                departmentStats[departmentName].acceptedAssessments++;
              } else if (assessmentStatus === "pending" || assessmentStatus === "in_progress" || assessmentStatus === "not_started") {
                departmentStats[departmentName].pendingAssessments++;
              }
            }
          });
        }

        // Process requests
        if (allRequests && Array.isArray(allRequests)) {
          allRequests.forEach((request) => {
            // Request status distribution
            const status = request.status || "pending";
            requestStatusCounts[status] = (requestStatusCounts[status] || 0) + 1;

            // Requests creation timeline
            if (request.created_at) {
              const monthKey = new Date(request.created_at)
                .toISOString()
                .substring(0, 7);
              requestsCreationByMonth[monthKey] = (requestsCreationByMonth[monthKey] || 0) + 1;
            }

            // Count assessments (ThirdPartyQuestionnaire)
            if (request.assessment) {
              totalAssessments++;

              // Assessment status
              const assessmentStatus = request.assessment.status || "not_started";
              assessmentStatusCounts[assessmentStatus] = (assessmentStatusCounts[assessmentStatus] || 0) + 1;

              // Evaluation scores - check for evaluations field
              if (request.evaluations) {
                try {
                  // Parse evaluations if it's a JSON string
                  const evaluations = typeof request.evaluations === 'string'
                    ? JSON.parse(request.evaluations)
                    : request.evaluations;

                  // Calculate score from evaluations
                  if (evaluations && typeof evaluations === 'object') {
                    const scores = Object.values(evaluations).filter(v => typeof v === 'number');
                    if (scores.length > 0) {
                      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                      const scoreRange = this.getScoreRange(avgScore);
                      evaluationScores[scoreRange] = (evaluationScores[scoreRange] || 0) + 1;
                      totalEvaluation += avgScore;
                      evaluationCount++;
                    }
                  }
                } catch (e) {
                  console.warn("Error parsing evaluations:", e);
                }
              }

              // Also check for score field in assessment
              if (request.assessment.score || request.assessment.evaluation_score) {
                const score = request.assessment.score || request.assessment.evaluation_score;
                const numScore = parseFloat(score);
                if (!isNaN(numScore)) {
                  const scoreRange = this.getScoreRange(numScore);
                  evaluationScores[scoreRange] = (evaluationScores[scoreRange] || 0) + 1;
                  totalEvaluation += numScore;
                  evaluationCount++;
                }
              }
            }
          });
        }

        // Calculate average evaluation
        const avgEvaluation = evaluationCount > 0
          ? Math.round(totalEvaluation / evaluationCount)
          : 0;

        console.log("Statistics Summary:", {
          totalProfiles,
          totalBumRequests,
          totalAssessments,
          avgEvaluation,
          evaluationCount
        });

        // Update statistics data
        this.thirdPartyStatisticsData = {
          totalProfiles,
          totalBumRequests,
          totalAssessments,
          evaluationThirdParty: avgEvaluation,
        };

        // Build charts
        this.buildThirdPartyCharts({
          classificationCounts,
          requestStatusCounts,
          assessmentStatusCounts,
          evaluationScores,
          profilesCreationByMonth,
          requestsCreationByMonth,
          departmentCounts,
          departmentStats,
        });
      } catch (error) {
        console.error("Error fetching third party statistics:", error);
      }
    },

    getScoreRange(score) {
      const numScore = parseFloat(score);
      if (numScore >= 90) return "90-100 (Excellent)";
      if (numScore >= 80) return "80-89 (Very Good)";
      if (numScore >= 70) return "70-79 (Good)";
      if (numScore >= 60) return "60-69 (Satisfactory)";
      if (numScore >= 50) return "50-59 (Fair)";
      return "Below 50 (Poor)";
    },

    buildThirdPartyCharts(data) {
      // Define color scheme
      const colorScheme = {
        crimsonEarth: "#A92525",
        goldenOlive: "#C4951B",
        forestDeep: "#255F0B",
        steelGrey: "#999999",
      };

      const chartColors = [
        colorScheme.crimsonEarth,
        colorScheme.goldenOlive,
        colorScheme.forestDeep,
        colorScheme.steelGrey,
        "#6e3894",
        "#17a2b8",
        "#28a745",
        "#ffc107",
        "#dc3545",
        "#007bff",
      ];

      // 1. Classification Distribution Chart (3D Donut)
      this.classificationDistributionChart = {
        chart: {
          type: "pie",
          height: 250,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        colors: chartColors,
        title: {
          text: "",
        },
        tooltip: {
          pointFormat: "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
              connectorColor: "silver",
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "12px" },
        },
        series: [
          {
            name: "Profiles",
            colorByPoint: true,
            data: Object.entries(data.classificationCounts || {}).map(
              ([name, value]) => ({
                name,
                y: value,
              })
            ),
          },
        ],
      };

      // 2. Request Status Distribution Chart (3D Donut)
      this.requestStatusChart = {
        chart: {
          type: "pie",
          height: 250,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        colors: chartColors,
        title: {
          text: "",
        },
        tooltip: {
          pointFormat: "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
              connectorColor: "silver",
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "12px" },
        },
        series: [
          {
            name: "Requests",
            colorByPoint: true,
            data: Object.entries(data.requestStatusCounts || {}).map(
              ([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
                y: value,
              })
            ),
          },
        ],
      };

      // 3. Assessment Status Distribution Chart (3D Donut)
      this.assessmentStatusChart = {
        chart: {
          type: "pie",
          height: 250,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        colors: chartColors,
        title: {
          text: "",
        },
        tooltip: {
          pointFormat: "<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
              connectorColor: "silver",
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "12px" },
        },
        series: [
          {
            name: "Assessments",
            colorByPoint: true,
            data: Object.entries(data.assessmentStatusCounts || {}).map(
              ([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
                y: value,
              })
            ),
          },
        ],
      };

      // 4. Evaluation Distribution Chart (Column with 3D and Gradient)
      this.evaluationDistributionChart = {
        chart: {
          type: "column",
          height: 250,
          options3d: {
            enabled: true,
            alpha: 10,
            beta: 15,
            depth: 50,
          },
        },
        title: {
          text: "",
        },
        xAxis: {
          categories: Object.keys(data.evaluationScores || {}).length > 0
            ? Object.keys(data.evaluationScores)
            : ["No Data"],
          crosshair: true,
          labels: {
            rotation: -45,
            style: {
              fontSize: "12px",
              fontWeight: "bold",
            },
          },
          title: {
            text: "Score Range",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Number of Assessments",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
          allowDecimals: false,
        },
        tooltip: {
          valueSuffix: " assessments",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            depth: 25,
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "Assessments",
            data: Object.keys(data.evaluationScores || {}).length > 0
              ? Object.values(data.evaluationScores)
              : [0],
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, colorScheme.goldenOlive],
                [1, "#e6c84d"],
              ],
            },
          },
        ],
      };

      // 5. Profiles Creation Timeline Chart (Column with 3D and Gradient)
      const sortedProfileMonths = Object.keys(data.profilesCreationByMonth || {}).sort();
      this.profilesCreationTimelineChart = {
        chart: {
          type: "column",
          height: 250,
          options3d: {
            enabled: true,
            alpha: 10,
            beta: 15,
            depth: 50,
          },
        },
        title: {
          text: "",
        },
        xAxis: {
          categories:
            sortedProfileMonths.length > 0
              ? sortedProfileMonths.map((month) => {
                  const date = new Date(month + "-01");
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  });
                })
              : ["No Data"],
          title: {
            text: "Month",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
          labels: {
            style: { fontSize: "12px" },
          },
        },
        yAxis: {
          title: {
            text: "Number of Profiles Created",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
          min: 0,
          allowDecimals: false,
        },
        tooltip: {
          valueSuffix: " profiles",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            depth: 25,
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "Profiles Created",
            data:
              sortedProfileMonths.length > 0
                ? sortedProfileMonths.map((month) => data.profilesCreationByMonth[month])
                : [0],
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, colorScheme.forestDeep],
                [1, "#4a9d2a"],
              ],
            },
          },
        ],
      };

      // 6. Requests Creation Timeline Chart (Column with 3D and Gradient)
      const sortedRequestMonths = Object.keys(data.requestsCreationByMonth || {}).sort();
      this.requestsCreationTimelineChart = {
        chart: {
          type: "column",
          height: 250,
          options3d: {
            enabled: true,
            alpha: 10,
            beta: 15,
            depth: 50,
          },
        },
        title: {
          text: "",
        },
        xAxis: {
          categories:
            sortedRequestMonths.length > 0
              ? sortedRequestMonths.map((month) => {
                  const date = new Date(month + "-01");
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  });
                })
              : ["No Data"],
          title: {
            text: "Month",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
          labels: {
            style: { fontSize: "12px" },
          },
        },
        yAxis: {
          title: {
            text: "Number of BUM Requests Created",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
          min: 0,
          allowDecimals: false,
        },
        tooltip: {
          valueSuffix: " requests",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            depth: 25,
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: "BUM Requests Created",
            data:
              sortedRequestMonths.length > 0
                ? sortedRequestMonths.map((month) => data.requestsCreationByMonth[month])
                : [0],
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, colorScheme.crimsonEarth],
                [1, "#d65555"],
              ],
            },
          },
        ],
      };

      // 7. Department Distribution Chart (Grouped Column with Multiple Series)
      const topDepartments = Object.entries(data.departmentStats || {})
        .sort((a, b) => b[1].totalRequests - a[1].totalRequests)
        .slice(0, 10);

      const departmentNames = topDepartments.length > 0
        ? topDepartments.map(([name]) => name)
        : ["No Data"];

      const totalRequestsData = topDepartments.length > 0
        ? topDepartments.map(([, stats]) => stats.totalRequests)
        : [0];

      const totalAssessmentsData = topDepartments.length > 0
        ? topDepartments.map(([, stats]) => stats.totalAssessments)
        : [0];

      const acceptedAssessmentsData = topDepartments.length > 0
        ? topDepartments.map(([, stats]) => stats.acceptedAssessments)
        : [0];

      const pendingAssessmentsData = topDepartments.length > 0
        ? topDepartments.map(([, stats]) => stats.pendingAssessments)
        : [0];

      this.departmentDistributionChart = {
        chart: {
          type: "column",
          height: 350,
          options3d: {
            enabled: true,
            alpha: 10,
            beta: 15,
            depth: 50,
          },
        },
        title: {
          text: "",
        },
        xAxis: {
          categories: departmentNames,
          title: {
            text: "Department",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
          labels: {
            style: { fontSize: "11px", fontWeight: "bold" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: "Count",
            style: { fontSize: "13px", fontWeight: "bold" },
          },
          allowDecimals: false,
        },
        tooltip: {
          shared: true,
          style: { fontSize: "14px" },
          headerFormat: '<span style="font-size:13px;font-weight:bold">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
          useHTML: true,
        },
        plotOptions: {
          column: {
            depth: 25,
            dataLabels: {
              enabled: true,
              style: { fontSize: "11px", fontWeight: "bold" },
            },
            borderRadius: 3,
            groupPadding: 0.1,
            pointPadding: 0.05,
          },
        },
        legend: {
          enabled: true,
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "12px", fontWeight: "bold" },
        },
        series: [
          {
            name: "BUM Requests",
            data: totalRequestsData,
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, "#6e3894"],
                [1, "#a87cd2"],
              ],
            },
          },
          {
            name: "Total Assessments",
            data: totalAssessmentsData,
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, "#17a2b8"],
                [1, "#5bc0de"],
              ],
            },
          },
          {
            name: "Accepted Assessments",
            data: acceptedAssessmentsData,
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, "#28a745"],
                [1, "#6fd671"],
              ],
            },
          },
          {
            name: "Pending Assessments",
            data: pendingAssessmentsData,
            color: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, "#ffc107"],
                [1, "#ffda6a"],
              ],
            },
          },
        ],
      };

      console.log("Third Party charts built successfully");
    },

    async openViewDetailsModal(item) {
      try {
        const fullData = await this.api.show(item.id, {
          with: [
            "contacts",
            "entities",
            "subsidiaries",
            "classification",
            "requests.assessment.assessment",
            "requests.service",
            "contracts.assessments.assessment",
            "contracts.contractType",
            "risks",
          ],
        });

        this.viewProfileDetailsData = fullData;
        this.showViewDetailsModal = true;
      } catch (error) {
        console.error("Error loading profile:", error);
        this.api.poup(
          {
            status: false,
            message: "Error loading profile data",
          },
          "Error"
        );
      }
    },

    openForm() {
      this.showCreateModal = true;
    },

    editItem(data) {
      this.selectedProfileId = data.id;
      this.showEditModal = true;
    },

    openViewModal(item) {
      this.viewProfileData = { ...item };
      this.showViewModal = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    handleCreateSuccess(response) {
      this.showCreateModal = false;
      this.$refs.table.refreshTable();
      this.api.poup(response, this.$t("thirdpartyprofile.added_successfully"));
    },

    handleEditSuccess(response) {
      this.showEditModal = false;
      this.$refs.table.refreshTable();
      this.api.poup(
        response,
        this.$t("thirdpartyprofile.updated_successfully")
      );
    },

    handleError(error) {
      console.log("error handleError ");
      console.log(error);
      this.api.poup(
        { status: false, message: error.message || error.errors[0][0] },
        this.$t("thirdpartyprofile.Error")
      );
    },
  },
};
</script>

<style scoped>
.text-badge {
  display: inline-block;
  background-color: #d0b5e3;
  color: #43235c;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.text-badge:hover {
  opacity: 0.9;
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

.action-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

/* Icon styling within menu items */
.action-list-item .action-icon {
  color: #6e3894 !important;
  margin-right: 12px !important;
}

/* Statistics Section Styles */
.statistics-content {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* Metric Cards */
.metric-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: white;
  height: 100%;
  min-height: 120px;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  color: #6e3894;
  flex-shrink: 0;
}

.metric-content {
  flex-grow: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
  line-height: 1.2;
}

.metric-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 5px 0 0 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Chart Containers */
.chart-container {
  background-color: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 310px;
}

.chart-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.chart-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .metric-card {
    margin-bottom: 15px;
    min-height: 100px;
  }

  .metric-icon {
    font-size: 2rem;
    margin-right: 12px;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .metric-label {
    font-size: 0.8rem;
  }

  .chart-container {
    padding: 12px;
    margin-bottom: 15px;
    min-height: 290px;
  }

  .chart-title {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }
}

@media (max-width: 576px) {
  .statistics-content {
    padding: 10px;
  }

  .metric-card {
    padding: 15px;
    min-height: 90px;
  }

  .metric-icon {
    font-size: 1.75rem;
    margin-right: 10px;
  }

  .metric-value {
    font-size: 1.25rem;
  }

  .metric-label {
    font-size: 0.75rem;
  }

  .chart-container {
    padding: 10px;
    min-height: 280px;
  }

  .chart-title {
    font-size: 0.8rem;
    margin-bottom: 8px;
    padding-bottom: 6px;
  }
}
</style>
