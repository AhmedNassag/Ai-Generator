<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('risk.riskmgmt')"
    :mainSubPage="$t('risk.risk')"
    :subPage="$t('risk.register')"
    :titlePage="$t('risk.riskmgmt')"
    :showInsightsTab="false"
    v-permission:show
  >
    <div v-permission:destroy></div>

    <template #statistics>
      <div class="card modern-card">
        <div class="card-body pt-2 pb-2 pl-3 pr-3">
          <div class="statistic-container">
            <div class="row g-3">
              <!-- Overview Card -->
              <div class="col-12 col-sm-6 col-lg-2">
                <div class="stat-card-modern stat-card-purple" :class="{ 'stat-loading': statsLoading }">
                  <template v-if="statsLoading">
                    <div class="stat-loading-content">
                      <div class="shimmer-circle-modern"></div>
                      <div class="shimmer-text-group">
                        <div class="shimmer-line shimmer-lg"></div>
                        <div class="shimmer-line shimmer-sm"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">Overview</h6>
                      <div class="stat-icon-circle stat-icon-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">{{ riskStatus.overview }}</h2>
                      <span class="stat-percentage">100%</span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- New Card -->
              <div class="col-12 col-sm-6 col-lg-2">
                <div class="stat-card-modern stat-card-blue" :class="{ 'stat-loading': statsLoading }">
                  <template v-if="statsLoading">
                    <div class="stat-loading-content">
                      <div class="shimmer-circle-modern"></div>
                      <div class="shimmer-text-group">
                        <div class="shimmer-line shimmer-lg"></div>
                        <div class="shimmer-line shimmer-sm"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">New</h6>
                      <div class="stat-icon-circle stat-icon-blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 5v14M5 12h14"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">{{ riskStatus.new }}</h2>
                      <span class="stat-percentage">{{ percentage(riskStatus.new) }}%</span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Reopened Card -->
              <div class="col-12 col-sm-6 col-lg-2">
                <div class="stat-card-modern stat-card-orange" :class="{ 'stat-loading': statsLoading }">
                  <template v-if="statsLoading">
                    <div class="stat-loading-content">
                      <div class="shimmer-circle-modern"></div>
                      <div class="shimmer-text-group">
                        <div class="shimmer-line shimmer-lg"></div>
                        <div class="shimmer-line shimmer-sm"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">Reopened</h6>
                      <div class="stat-icon-circle stat-icon-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path
                            d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4">
                          </path>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">{{ riskStatus.reopened }}</h2>
                      <span class="stat-percentage">{{ percentage(riskStatus.reopened) }}%</span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Mitigation Planned Card -->
              <div class="col-12 col-sm-6 col-lg-2">
                <div class="stat-card-modern stat-card-yellow" :class="{ 'stat-loading': statsLoading }">
                  <template v-if="statsLoading">
                    <div class="stat-loading-content">
                      <div class="shimmer-circle-modern"></div>
                      <div class="shimmer-text-group">
                        <div class="shimmer-line shimmer-lg"></div>
                        <div class="shimmer-line shimmer-sm"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">Mitigated</h6>
                      <div class="stat-icon-circle stat-icon-yellow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          <path d="m9 12 2 2 4-4"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">{{ riskStatus.mitigated }}</h2>
                      <span class="stat-percentage">{{ percentage(riskStatus.mitigated) }}%</span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Mgmt Reviewed Card -->
              <div class="col-12 col-sm-6 col-lg-2">
                <div class="stat-card-modern stat-card-indigo" :class="{ 'stat-loading': statsLoading }">
                  <template v-if="statsLoading">
                    <div class="stat-loading-content">
                      <div class="shimmer-circle-modern"></div>
                      <div class="shimmer-text-group">
                        <div class="shimmer-line shimmer-lg"></div>
                        <div class="shimmer-line shimmer-sm"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">Reviewed</h6>
                      <div class="stat-icon-circle stat-icon-indigo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">{{ riskStatus.reviewed }}</h2>
                      <span class="stat-percentage">{{ percentage(riskStatus.reviewed) }}%</span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Closed Card -->
              <div class="col-12 col-sm-6 col-lg-2">
                <div class="stat-card-modern stat-card-green" :class="{ 'stat-loading': statsLoading }">
                  <template v-if="statsLoading">
                    <div class="stat-loading-content">
                      <div class="shimmer-circle-modern"></div>
                      <div class="shimmer-text-group">
                        <div class="shimmer-line shimmer-lg"></div>
                        <div class="shimmer-line shimmer-sm"></div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="stat-card-header rtl">
                      <h6 class="stat-title">Closed</h6>
                      <div class="stat-icon-circle stat-icon-green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="stat-value-wrapper rtl">
                      <h2 class="stat-value">{{ riskStatus.closed }}</h2>
                      <span class="stat-percentage">{{ percentage(riskStatus.closed) }}%</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- Charts Grid -->
      <div class="row mt-4">
        <!-- Risk Status Distribution -->
        <div class="col-md-6 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{ $t("risk.status_distribution") || "Risk Status Distribution" }}
            </h6>
            <highcharts :options="statusDistributionChart"></highcharts>
          </div>
        </div>

        <!-- Risk Severity Distribution -->
        <div class="col-md-6 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{
                $t("risk.severity_distribution") || "Risk Severity Distribution"
              }}
            </h6>
            <highcharts :options="severityDistributionChart"></highcharts>
          </div>
        </div>

        <!-- Risk Category Distribution -->
        <div class="col-md-6 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{
                $t("risk.category_distribution") || "Risk Category Distribution"
              }}
            </h6>
            <highcharts :options="categoryDistributionChart"></highcharts>
          </div>
        </div>

        <!-- Risk Location Distribution -->
        <div class="col-md-6 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{
                $t("risk.location_distribution") || "Risk Location Distribution"
              }}
            </h6>
            <highcharts :options="locationDistributionChart"></highcharts>
          </div>
        </div>

        <!-- Likelihood Distribution -->
        <div class="col-md-12 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{ $t("risk.likelihood_distribution") || "Likelihood Distribution" }}
            </h6>
            <highcharts :options="impactLikelihoodChart"></highcharts>
          </div>
        </div>

        <!-- Likelihood Impact Matrix -->
        <div class="col-md-12 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{ $t("risk.likelihood_impact_matrix") || "Likelihood Impact" }}
            </h6>
            <highcharts :options="likelihoodImpactMatrixChart"></highcharts>
          </div>
        </div>

        <!-- Risk Team Distribution -->
        <div class="col-md-12 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{ $t("risk.team_distribution") || "Risk Team Distribution" }}
            </h6>
            <highcharts :options="teamDistributionChart"></highcharts>
          </div>
        </div>

        <!-- Risk Owner Distribution -->
        <div class="col-md-12 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{ $t("risk.owner_distribution") || "Risk Owner Distribution" }}
            </h6>
            <highcharts :options="ownerDistributionChart"></highcharts>
          </div>
        </div>

        <!-- Risk Submission Timeline -->
        <div class="col-md-12 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{ $t("risk.submission_timeline") || "Risk Submission Timeline" }}
            </h6>
            <highcharts :options="submissionTimelineChart"></highcharts>
          </div>
        </div>

        <!-- Risk Completion Rate -->
        <div class="col-md-12 mb-4">
          <div class="chart-container chart-container-equal-height">
            <h6 class="chart-title">
              {{ $t("risk.completion_rate") || "Risk Completion Rate" }}
            </h6>
            <highcharts :options="riskCompletionChart"></highcharts>
          </div>
        </div>


        <!-- Monthly Trends Table -->
        <div class="card modern-card mt-3">
          <div class="card-body pt-3 pb-3 pl-3 pr-3">
            <h6 class="chart-title mb-3">{{ $t("risk.monthly_trends") || "Monthly Trends" }}</h6>
            <div class="table-responsive">
              <table class="table table-hover trends-table">
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="month in monthlyTrendsData.months" :key="month">
                      {{ month }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="row-label">{{ $t("risk.opened_risks") || "Opened Risks" }}</td>
                    <td v-for="(value, index) in monthlyTrendsData.openedRisks" :key="'opened-' + index">
                      {{ value }}
                    </td>
                  </tr>
                  <tr>
                    <td class="row-label">{{ $t("risk.closed_risks") || "Closed Risks" }}</td>
                    <td v-for="(value, index) in monthlyTrendsData.closedRisks" :key="'closed-' + index">
                      {{ value }}
                    </td>
                  </tr>
                  <tr>
                    <td class="row-label">{{ $t("risk.risk_trend") || "Risk Trend" }}</td>
                    <td v-for="(value, index) in monthlyTrendsData.riskTrend" :key="'trend-' + index">
                      <span v-if="value > 0" class="trend-positive">+{{ value }}</span>
                      <span v-else-if="value < 0" class="trend-negative">{{ value }}</span>
                      <span v-else class="trend-neutral">{{ value }}</span>
                    </td>
                  </tr>
                  <tr class="cumulative-row">
                    <td class="row-label">{{ $t("risk.current_open_risks") || "Current Open Risks" }}</td>
                    <td v-for="(value, index) in monthlyTrendsData.currentOpenRisks" :key="'current-' + index">
                      {{ value }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions" :filters="filterData">
        <template #Name="{ item }"> My - {{ item.name }} </template>
        <template #delete="{ item }">
          <a v-permission:destroy href="javascript:void(0)" @click="deleteItem(item)"
            class="delete_button dropdown-item">
            <i class="icofont icofont-trash text-danger"></i>
            {{ $t("common.delete") }}
          </a>
        </template>
        <template #subject="{ item }">
          <span class="subject-text">
            {{ truncateText(item.subject) }}
          </span>
        </template>
        <template #status="{ item }">
          <span class="status-badge" :class="getStatusBadgeClass(item.status)">
            {{ getStatusBadgeText(item.status) }}
          </span>
        </template>
        <template #category="{ item }"> {{ item?.category?.name }} </template>
        <template #inherent_risk_current="{ item }">
          <div class="risk-wrapper">
            <template v-if="loadingRiskLevels">
              <div class="spinner-border text-secondary risk-spinner" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </template>

            <template v-else>
              <span class="risk-color-box" :style="{
                backgroundColor: riskCalculator.calculateInherentRiskTable(
                  item.current_impact,
                  item.current_likelihood
                )?.level?.color,
              }"></span>

              <span class="risk-badge">
                {{
                  riskCalculator.calculateInherentRiskTable(
                    item.current_impact,
                    item.current_likelihood
                  ).risk
                }}
              </span>
            </template>
          </div>
        </template>

        <template #view="{ item }">
          <router-link :to="{ name: 'RiskManagement', params: { id: item.id } }" class="dropdown-item">
            <i class="icofont icofont-eye"></i> {{ $t("common.view") }}
          </router-link>
        </template>
      </DataTable>
    </template>

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
        <template #regulator_id="{ item }">
          <div class="col-12 col-md-6 mb-3">
            <label>{{ $t("risk.control_regulation") }}</label>
            <LazySelectField name="regulator_id" v-model="newItem.regulator_id"
              :placeholder="$t('risk.select_regulator')" options="Regulator" option-label="name" option-value="id"
              clearable :onUpdate="onRegulatorChange" />
          </div>
        </template>

        <template #control_id="{ item }">
          <div class="col-12 col-md-6 mb-3">
            <label>{{ $t("risk.control") }}</label>
            <v-select v-model="newItem.control_id" :options="controlOptions" multiple label="short_name"
              :reduce="(control) => control.id" :placeholder="newItem.regulator_id
                ? loadingControls
                  ? $t('risk.loading_controls')
                  : $t('risk.select_control')
                : $t('risk.select_regulator_first')
                " :disabled="!newItem.regulator_id || controlOptions.length === 0" :loading="loadingControls">
            </v-select>
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
import { useRouter } from "vue-router";

// API Imports
import { RiskCalculator } from "@/API/Risk/RiskCalculator";
import risk from "@/API/Risk/Risk";
import Auth from "@/API/Auth";
import Control from "@/API/Control/Control";
import Highcharts from "highcharts";
import "highcharts/highcharts-more";
import "highcharts/modules/solid-gauge";
import "highcharts/modules/heatmap";
import { Chart } from "highcharts-vue";

// Configure Highcharts global options
Highcharts.setOptions({
  lang: {
    decimalPoint: ".",
    thousandsSep: ",",
    numericSymbols: ["k", "M", "G", "T", "P", "E"],
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
// Component Imports
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import UserSelect from "@/components/UserSelect.vue";
import LazySelectField from "@/components/LazySelectField.vue";
import TeamSelect from "@/components/TeamSelect.vue";
import Regulator from "@/API/Regulator/Regulator";


export default {
  name: "Risk",

  components: {
    MainPage,
    Form,
    DataTable,
    "v-select": VueSelect,
    highcharts: Chart,
    LazySelectField,
    UserSelect,
    TeamSelect,
  },

  setup() {
    const riskCalculator = new RiskCalculator();
    const api = new risk();
    const control = new Control();
    const regulator = new Regulator();
    const router = useRouter();

    const buildFilterIn = (user) => {
      const parts = [];
      if (user && user.id) {
        const teamIds = Array.isArray(user.team_ids)
          ? user.team_ids.join(",")
          : user.team_ids;
        if (teamIds) parts.push(`team_ids|${teamIds}|=`);
        if (user.id) parts.push(`stakeholder_ids|${user.id}|=`);
        if (user.id) parts.push(`owner_id|${user.id}|=`);
        if (user.id) parts.push(`created_by|${user.id}|=`);
      }
      return parts.length > 0 ? parts.join("||") : undefined;
    };

    const apiParams = {
      with: ["category:id,name"],
      sort: "created_at|desc",
      filterOr: buildFilterIn(Auth.USER),
      select:
        "id|subject|risk_number|description|category_id|questionnaire|status|responsible_party|current_impact|current_likelihood|created_at",
    };

    const tableColumns = [];
    const fromFields = [];

    const filterData = [
      {
        title: "status",
        key: "status",
        type: "string",
        data: [
          { id: "New", name: "New" },
          { id: "Reopened", name: "Reopened" },
          { id: "Reject", name: "Reject" },
          { id: "Closed Risk", name: "Closed Risk" },
          { id: "Mgmt Reviewed", name: "Mgmt Reviewed" },
        ],
        filterType: "filter",
      },
    ];

    return {
      riskCalculator,
      api,
      control,
      router,
      apiParams,
      tableColumns,
      fromFields,
      filterData,
      regulator
    };
  },

  data() {
    return {
      loadingRiskLevels: true,
      statsLoading: false,
      loading: false,
      loadingControls: false,

      riskStatus: {
        overview: 0,
        new: 0,
        reopened: 0,
        mitigated: 0,
        reviewed: 0,
        closed: 0,
        rejected: 0,
      },

      // Chart data
      statusDistributionChart: {},
      severityDistributionChart: {},
      categoryDistributionChart: {},
      locationDistributionChart: {},
      impactLikelihoodChart: {},
      likelihoodImpactMatrixChart: {},
      teamDistributionChart: {},
      ownerDistributionChart: {},
      submissionTimelineChart: {},
      impactScopeChart: {},
      technologyDistributionChart: {},
      riskCompletionChart: {},

      // Statistics data
      riskStatisticsData: {
        totalRisks: 0,
        openRisks: 0,
        closedRisks: 0,
        mitigatedRisks: 0,
      },

      // Monthly trends data
      monthlyTrendsData: {
        months: [],
        openedRisks: [],
        closedRisks: [],
        riskTrend: [],
        currentOpenRisks: [],
      },

      filter: {
        status: "",
        subject: "",
        submission_date: "",
      },

      isFlipped: false,
      isReadonly: false,
      newItem: {},

      user: Auth.USER,
      controlOptions: [],
    };
  },

  async created() {
    this.tableColumns = [
      {
        id: "subject",
        title: this.$t("risk.subject"),
        data: "subject",
        defaultContent: "N/A",
      },
      {
        id: "risk_number",
        title: this.$t("risk.risk_number"),
        data: "risk_number",
        defaultContent: "N/A",
      },
      {
        title: this.$t("risk.description"),
        data: "description",
        defaultContent: "N/A",
      },
      {
        id: "category",
        title: this.$t("risk.category"),
        data: null,
        defaultContent: "N/A",
      },
      {
        title: this.$t("risk.questionnaire"),
        data: "questionnaire",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("risk.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        title: this.$t("risk.responsible_party"),
        data: "responsible_party",
        defaultContent: "N/A",
      },
      {
        id: "inherent_risk_current",
        title: this.$t("risk.inherent_risk_current"),
        data: null,
        defaultContent: "N/A",
      },
      {
        title: this.$t("risk.submission_date"),
        data: "created_at",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        section: "Add Risk",
        name: "subject",
        label: this.$t("risk.subject"),
        type: "text",
        rules: "required",
        col: 6,
      },
      {
        section: "Add Risk",
        type: "options",
        name: "category_id",
        label: this.$t("risk.category"),
        options: "RiskCategory",
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select One"),
      },
      {
        section: "Add Risk",
        type: "options",
        name: "risk_mapping_ids",
        label: this.$t("risk.mapping"),
        options: "RiskCatalog",
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select risks"),
        multiple: true,
      },
      {
        section: "Add Risk",
        type: "options",
        name: "threat_mapping_ids",
        label: this.$t("risk.threat_mapping"),
        options: "ThreatCatalog",
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select threats"),
        multiple: true,
      },
      {
        section: "Add Risk",
        type: "options",
        name: "location_ids",
        label: this.$t("risk.site_location"),
        options: "Location",
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select locations"),
        multiple: true,
      },
      {
        section: "Add Risk",
        type: "user-select",
        name: "owner_id",
        label: this.$t("risk.owner"),
        options: [],
        optionLabel: "full_name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select owner"),
      },
      {
        section: "Add Risk",
        name: "stakeholder_ids",
        type: "user-select",
        label: this.$t("risk.additional_stakeholders"),
        options: [],
        optionLabel: "full_name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select stakeholders"),
        multiple: true,
      },
      {
        section: "Add Risk",
        type: "options",
        name: "tag_ids",
        label: this.$t("risk.tags"),
        options: "tag",
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select tags"),
        multiple: true,
      },
      {
        section: "Add Risk",
        name: "team_ids",
        type: "team-select",
        label: this.$t("risk.teams"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select teams"),
        multiple: true,
      },
      {
        section: "Add Risk",
        name: "reference_id",
        label: this.$t("risk.external_reference_id"),
        type: "text",
        rules: "",
        col: 6,
      },
      {
        section: "Add Risk",
        type: "options",
        name: "vuln_catalogs",
        label: this.$t("risk.Vulnerability_Catalogs"),
        options: "VulnerabilityCatalogue",
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select vulnerability catalogs"),
        multiple: true,
      },
      {
        section: "Add Risk",
        name: "risk_scenario",
        label: this.$t("risk.risk_scenario"),
        type: "text",
        rules: "",
        col: 6,
      },
      {
        section: "Add Risk",
        type: "options",
        name: "asset_ids",
        label: this.$t("risk.affected_assets"),
        options: "Asset",
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select assets"),
        multiple: true,
      },
      {
        section: "Add Risk",
        name: "existing_control",
        label: this.$t("risk.existing_control"),
        type: "text",
        rules: "",
        col: 6,
      },
      {
        section: "Add Risk",
        type: "options",
        name: "regulator_id",
        label: this.$t("risk.control_regulation"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select regulator"),
      },
      {
        section: "Add Risk",
        type: "options",
        name: "control_id",
        label: this.$t("risk.control"),
        options: [],
        optionLabel: "short_name",
        col: 6,
        rules: "",
        placeholder: this.$t("risk.Select control"),
      },
    ];

    this.loadingRiskLevels = true;
    await this.riskCalculator.initialize();
    this.loadingRiskLevels = false;
  },

  async mounted() {
    // Load risk levels
    this.loadingRiskLevels = true;
    await this.riskCalculator.initialize();
    this.loadingRiskLevels = false;

    // Fetch insights from backend
    await this.fetchInsights();

    // Refresh table
    this.$refs?.table?.refreshTable();
  },

  async activated() {
    this.loadingRiskLevels = true;
    await this.riskCalculator.initialize();
    this.loadingRiskLevels = false;

    await this.fetchInsights();
  },

  computed: {
    hideActions() {
      return (row) => {
        const canEdit = false;
        return {
          edit: !canEdit,
        };
      };
    },
  },

  watch: {
    filter: {
      deep: true,
      handler(newFilter) {
        const filters = [];

        if (newFilter.status)
          filters.push(`status|${newFilter.status}|=`);

        if (newFilter.subject)
          filters.push(`subject|%${newFilter.subject}%|like`);

        if (newFilter.inherit_risk)
          filters.push(`current_inherent|${newFilter.inherit_risk}|=`);

        if (newFilter.submission_date) {
          const isFullDate = /^\d{4}-\d{2}-\d{2}$/.test(
            newFilter.submission_date
          );

          filters.push(
            isFullDate
              ? `created_at|${newFilter.submission_date}|date`
              : `created_at|%${newFilter.submission_date}%|like`
          );
        }

        this.apiParams.filter =
          filters.length > 0 ? filters.join("&&") : undefined;

        this.apiParams.sort =
          this.apiParams.sort || "created_at|asc";

        this.$refs?.table?.refreshTable();
      }
    },

    "newItem.regulator_id"(regulatorId) {
      const controlField = this.fromFields.find(
        field => field.name === "control_id"
      );

      if (!controlField) return;

      if (!regulatorId) {
        // reset control when regulator cleared
        this.newItem.control_id = null;
        controlField.apiParams = {};
        return;
      }

      controlField.apiParams = {
        filterWhereRelation: [
          `frameworks.control@id|${regulatorId}|=`
        ]
      };
    }
  },


  methods: {

    async fetchInsights() {
      try {
        this.statsLoading = true;

        // Fetch pre-processed insights from backend
        const response = await this.api.getInsights({
          start_date: this.getStartDate(),
          end_date: this.getEndDate(),
          user_id: Auth.USER.id,
          team_ids: Auth.USER.team_ids
        });

        if (response.success) {
          const insights = response.data;

          // Set risk status
          this.riskStatus = insights.risk_status;

          // Set monthly trends
          this.monthlyTrendsData = insights.monthly_trends;

          // Build charts with pre-processed data
          this.buildChartsFromData(insights.charts);
        }

        this.statsLoading = false;
      } catch (error) {
        console.error('Error fetching insights:', error);
        this.statsLoading = false;
      }
    },

    getStartDate() {
      // Return start date for insights (e.g., 12 months ago)
      const date = new Date();
      date.setMonth(date.getMonth() - 12);
      return date.toISOString().split('T')[0];
    },

    getEndDate() {
      // Return end date for insights (today)
      return new Date().toISOString().split('T')[0];
    },

    buildChartsFromData(chartData) {
      // Build charts using pre-processed data from backend

      // 1. Status Distribution
      this.statusDistributionChart = this.buildPieChart(
        chartData.status_distribution,
        'Risk Status Distribution'
      );

      // 2. Category Distribution
      this.categoryDistributionChart = this.buildColumnChart(
        chartData.category_distribution.categories,
        chartData.category_distribution.data,
        'Risk Category Distribution'
      );

      // 3. Location Distribution
      this.locationDistributionChart = this.buildColumnChart(
        chartData.location_distribution.categories,
        chartData.location_distribution.data,
        'Risk Location Distribution'
      );

      // 4. Team Distribution
      this.teamDistributionChart = this.buildColumnChart(
        chartData.team_distribution.categories,
        chartData.team_distribution.data,
        'Risk Team Distribution'
      );

      // 5. Owner Distribution
      this.ownerDistributionChart = this.buildColumnChart(
        chartData.owner_distribution.categories,
        chartData.owner_distribution.data,
        'Risk Owner Distribution'
      );

      // 6. Impact Likelihood
      this.impactLikelihoodChart = this.buildAreasplineChart(
        chartData.impact_likelihood.labels,
        chartData.impact_likelihood.data,
        'Likelihood Distribution'
      );

      // 7. Likelihood Impact Matrix
      this.likelihoodImpactMatrixChart = this.buildHeatmapChart(
        chartData.likelihood_impact_matrix,
        'Likelihood Impact Matrix'
      );

      // 8. Submission Timeline
      this.submissionTimelineChart = this.buildColumnChart(
        chartData.submission_timeline.categories,
        chartData.submission_timeline.data,
        'Risk Submission Timeline'
      );

      // 9. Completion Rate
      this.riskCompletionChart = this.buildAreasplineChart(
        chartData.completion_rate.labels,
        chartData.completion_rate.data,
        'Risk Completion Rate'
      );
    },

    buildPieChart(data, title) {
      return {
        chart: { type: 'pie', height: 250 },
        title: { text: '' },
        plotOptions: {
          pie: {
            innerSize: '0%',
            depth: 45,
            dataLabels: { enabled: true }
          }
        },
        series: [{ name: 'Risks', colorByPoint: true, data }]
      };
    },

    buildColumnChart(categories, data, title) {
      return {
        chart: { type: 'column' },
        title: { text: '' },
        xAxis: { categories, crosshair: true },
        yAxis: { min: 0, title: { text: 'Number of Risks' } },
        plotOptions: {
          column: { dataLabels: { enabled: true } }
        },
        series: [{ name: 'Risks', data }]
      };
    },

    buildAreasplineChart(categories, data, title) {
      return {
        chart: { type: 'areaspline', height: 350 },
        title: { text: '' },
        xAxis: { categories },
        yAxis: { min: 0, title: { text: 'Number of Risks' } },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            marker: { enabled: true }
          }
        },
        series: [{ name: title, data }]
      };
    },

    buildHeatmapChart(data, title) {
      return {
        chart: { type: 'heatmap', height: 350 },
        title: { text: '' },
        xAxis: {
          categories: ['0', '1', '2', '3', '4', '5'],
          title: { text: 'Likelihood' }
        },
        yAxis: {
          categories: ['0', '1', '2', '3', '4', '5'],
          title: { text: 'Impact' }
        },
        colorAxis: {
          min: 0,
          stops: [
            [0, '#255F0B'],
            [0.3, '#B6CAAE80'],
            [0.5, '#C4951B'],
            [0.7, '#A37C16'],
            [0.85, '#541212'],
            [1, '#A92525']
          ]
        },
        series: [{
          name: 'Risk Count',
          borderWidth: 1,
          data
        }]
      };
    },
    async onRegulatorChange(event) {
      const regulatorId = event?.target?.value || this.newItem.regulator_id;

      console.log("Regulator changed to:", regulatorId);

      this.controlOptions = [];
      this.newItem.control_id = [];

      if (!regulatorId || regulatorId === "") {
        console.log("No regulator selected, clearing controls");
        return;
      }

      this.loadingControls = true;

      try {
        const regulatorObject = await this.regulator.show(regulatorId, {
          with: ["frameworks.control"],
        });

        console.log(`Regulator ${regulatorId} data:`, regulatorObject);

        const allControls = [];

        if (regulatorObject?.frameworks?.length > 0) {
          for (const framework of regulatorObject.frameworks) {
            if (framework?.control) {
              const controls = Array.isArray(framework.control)
                ? framework.control
                : [framework.control];

              controls.forEach((control) => {
                if (!allControls.some((c) => c.id === control.id)) {
                  allControls.push(control);
                }
              });
            }
          }
        }

        this.controlOptions = allControls.map((control) => {
          let displayName = "Unnamed Control";

          if (control.short_name) {
            displayName = control.short_name;
          } else if (control.control_number) {
            displayName = control.control_number;
          } else if (control.name) {
            displayName = control.name;
          } else if (control.title) {
            displayName = control.title;
          } else {
            displayName = `Control ${control.id}`;
          }

          return {
            id: control.id,
            short_name: displayName,
            control_number: control.control_number || "",
            description: control.description || "",
            _original: control,
          };
        });

        console.log("Processed control options:", this.controlOptions);
      } catch (error) {
        console.error("Error loading regulator controls:", error);
      } finally {
        this.loadingControls = false;
      }
    },

    getRiskStatistics(risks) {
      // Initialize all counters to 0
      this.riskStatus = {
        overview: 0,
        new: 0,
        reopened: 0,
        mitigated: 0,
        reviewed: 0,
        closed: 0,
        rejected: 0,
      };

      if (!Array.isArray(risks)) {
        console.warn("Risks data is not an array or is undefined");
        return;
      }

      console.log("📊 Calculating risk statistics...", risks);
      console.log("Total risks received:", risks.length);
      console.log("Current user (Auth.USER):", Auth.USER);

      const filteredRisks = risks.filter((risk) => {
        if (!risk) return false;

        const currentUserId = Auth.USER.id;
        const currentUserTeamIds = Array.isArray(Auth.USER?.team_ids)
          ? Auth.USER.team_ids
          : [];

        const isStakeholder =
          Array.isArray(risk.stakeholder_ids) &&
          risk.stakeholder_ids.includes(currentUserId);

        const isTeamMember =
          Array.isArray(risk.team_ids) &&
          risk.team_ids.some((teamId) => currentUserTeamIds.includes(teamId));

        const isCreatedByUser = risk.created_by === currentUserId;
        const isOwner = risk.owner_id === currentUserId;

        const hasAccess =
          isStakeholder || isTeamMember || isCreatedByUser || isOwner;

        if (hasAccess) {
          console.log("✅ Risk matched:", {
            id: risk.id,
            status: risk.status,
            isStakeholder,
            isTeamMember,
            isCreatedByUser,
            isOwner,
          });
        }

        return hasAccess;
      });

      console.log("Filtered risks count:", filteredRisks.length);

      for (const risk of filteredRisks) {
        console.log(`Processing risk: ${risk.id}, Status: "${risk.status}"`);

        // Match exact status values from your list
        switch (risk.status) {
          case "New":
            this.riskStatus.new++;
            console.log("-> Counted as NEW");
            break;
          case "Reopened":
            this.riskStatus.reopened++;
            console.log("-> Counted as REOPENED");
            break;
          case "Mitigation Planned":
            this.riskStatus.mitigated++;
            console.log("-> Counted as MITIGATION PLANNED");
            break;
          case "Mgmt Reviewed":
            this.riskStatus.reviewed++;
            console.log("-> Counted as MGMT REVIEWED");
            break;
          case "Closed Risk":
            this.riskStatus.closed++;
            console.log("-> Counted as CLOSED RISK");
            break;
          case "Reject":
            this.riskStatus.rejected++;
            console.log("-> Counted as REJECT");
            break;
          default:
            console.log("-> ⚠️ Unknown status:", risk.status);
            break;
        }
      }

      // Calculate overview as sum of all statuses
      this.riskStatus.overview =
        this.riskStatus.new +
        this.riskStatus.reopened +
        this.riskStatus.mitigated +
        this.riskStatus.reviewed +
        this.riskStatus.closed +
        this.riskStatus.rejected;

      console.log("📊 Final Risk Statistics:", this.riskStatus);
      console.log("✅ Overview (Sum of all):", this.riskStatus.overview);

      this.statsLoading = false;
    },

    truncateText(text) {
      if (!text) return "";
      return text.length >= 20 ? text.substring(0, 20) + "..." : text;
    },

    percentage(value) {
      // Ensure value is a number and overview is greater than 0
      const numValue = Number(value) || 0;
      const numOverview = Number(this.riskStatus.overview) || 0;

      if (numOverview === 0) {
        return "0.0";
      }

      return ((numValue / numOverview) * 100).toFixed(1);
    },

    openForm() {
      this.newItem = {
        created_by_id: Auth.USER.id,
        regulator_id: "",
        control_id: [],
      };
      this.controlOptions = [];
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
      this.controlOptions = [];
    },

    async editItem(data) {
      this.newItem = { ...data };
      this.isFlipped = true;
    },

    async deleteItem(item) {
      try {
        await this.api.delete(0, { id: item.id });
        // Only fetch necessary fields for statistics
        const risks = await this.api.getAll({
          select: "id|status|stakeholder_ids|team_ids|created_by|owner_id",
        });
        this.getRiskStatistics(risks);
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    },

    getStatusBadgeClass(status) {
      const statusMap = {
        New: "status-new",
        Reopened: "status-reopened",
        Reject: "status-reject",
        "Closed Risk": "status-closed",
        "Mgmt Reviewed": "status-mgmt-reviewed",
      };
      return statusMap[status] || "status-default";
    },

    getStatusBadgeText(status) {
      const statusTextMap = {
        New: this.$t("risk.new"),
        Reopened: this.$t("risk.reopened"),
        Reject: this.$t("risk.reject"),
        "Closed Risk": this.$t("risk.closed"),
        "Mgmt Reviewed": this.$t("risk.mgmt_reviewed"),
      };
      return statusTextMap[status] || status;
    },

    calculateMonthlyTrends(risks) {
      // Generate last 13 months (current month + 12 previous months)
      const months = [];
      const monthlyData = {};
      const now = new Date();

      for (let i = 12; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }).replace(' ', ' ').toUpperCase();

        months.push(monthLabel);
        monthlyData[monthKey] = {
          opened: 0,
          closed: 0,
          trend: 0,
          currentOpen: 0
        };
      }

      // Filter risks for current user
      const currentUserId = Auth.USER.id;
      const currentUserTeamIds = Array.isArray(Auth.USER?.team_ids)
        ? Auth.USER.team_ids
        : [];

      const filteredRisks = risks.filter((risk) => {
        if (!risk) return false;
        const isStakeholder =
          Array.isArray(risk.stakeholder_ids) &&
          risk.stakeholder_ids.includes(currentUserId);
        const isTeamMember =
          Array.isArray(risk.team_ids) &&
          risk.team_ids.some((teamId) => currentUserTeamIds.includes(teamId));
        const isCreatedByUser = risk.created_by === currentUserId;
        const isOwner = risk.owner_id === currentUserId;
        return isStakeholder || isTeamMember || isCreatedByUser || isOwner;
      });

      // Count opened risks by month
      filteredRisks.forEach((risk) => {
        if (risk.created_at) {
          const date = new Date(risk.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (monthlyData[monthKey]) {
            monthlyData[monthKey].opened++;
          }
        }
      });

      // Count closed risks by month (using updated_at when status changed to Closed)
      filteredRisks.forEach((risk) => {
        if (risk.status === 'Closed Risk' && risk.updated_at) {
          const date = new Date(risk.updated_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (monthlyData[monthKey]) {
            monthlyData[monthKey].closed++;
          }
        }
      });

      // Calculate trends and cumulative open risks
      let cumulativeOpen = 0;
      const openedRisks = [];
      const closedRisks = [];
      const riskTrend = [];
      const currentOpenRisks = [];

      Object.keys(monthlyData).forEach((monthKey) => {
        const data = monthlyData[monthKey];
        data.trend = data.opened - data.closed;
        cumulativeOpen += data.trend;
        data.currentOpen = cumulativeOpen;

        openedRisks.push(data.opened);
        closedRisks.push(data.closed);
        riskTrend.push(data.trend);
        currentOpenRisks.push(data.currentOpen);
      });

      this.monthlyTrendsData = {
        months,
        openedRisks,
        closedRisks,
        riskTrend,
        currentOpenRisks
      };
    },

    async fetchStatisticsAndBuildCharts(risks) {
      try {
        if (!Array.isArray(risks)) {
          console.warn("Risks data is not an array");
          return;
        }

        // Calculate monthly trends
        this.calculateMonthlyTrends(risks);

        // Filter risks for current user
        const currentUserId = Auth.USER.id;
        const currentUserTeamIds = Array.isArray(Auth.USER?.team_ids)
          ? Auth.USER.team_ids
          : [];

        const filteredRisks = risks.filter((risk) => {
          if (!risk) return false;
          const isStakeholder =
            Array.isArray(risk.stakeholder_ids) &&
            risk.stakeholder_ids.includes(currentUserId);
          const isTeamMember =
            Array.isArray(risk.team_ids) &&
            risk.team_ids.some((teamId) => currentUserTeamIds.includes(teamId));
          const isCreatedByUser = risk.created_by === currentUserId;
          const isOwner = risk.owner_id === currentUserId;
          return isStakeholder || isTeamMember || isCreatedByUser || isOwner;
        });

        // Fetch additional lookup data for charts
        const [locations, teams, technologies] = await Promise.all([
          this.location.getAll({ select: "id|name" }).catch(() => []),
          this.team.getAll({ select: "id|name" }).catch(() => []),
          this.technology.getAll({ select: "id|name" }).catch(() => []),
        ]);

        // Create lookup maps
        const locationMap = {};
        const teamMap = {};
        const technologyMap = {};

        locations.forEach((loc) => {
          locationMap[loc.id] = loc.name;
        });

        teams.forEach((team) => {
          teamMap[team.id] = team.name;
        });

        technologies.forEach((tech) => {
          technologyMap[tech.id] = tech.name;
        });

        // Initialize counters
        let totalRisks = 0;
        let openRisks = 0;
        let closedRisks = 0;
        let mitigatedRisks = 0;

        const statusCounts = {};
        const severityCounts = {};
        const categoryCounts = {};
        const locationCounts = {};
        const teamCounts = {};
        const ownerCounts = {};
        const technologyCounts = {};
        const submissionByMonth = {};
        const impactScopeCounts = {};
        const likelihoodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const heatmapMatrix = {};

        // Initialize heatmap matrix (6x6 for 0-5 scale)
        for (let i = 0; i <= 5; i++) {
          for (let j = 0; j <= 5; j++) {
            heatmapMatrix[`${j}-${i}`] = 0;
          }
        }

        // Process each risk
        filteredRisks.forEach((risk) => {
          totalRisks++;

          // Count by status
          if (risk.status === "Closed Risk") {
            closedRisks++;
          } else if (
            risk.mitigation_status === "Plan a Mitigation" ||
            risk.status === "Mgmt Reviewed"
          ) {
            mitigatedRisks++;
          } else {
            openRisks++;
          }

          // Status distribution
          const displayStatus = risk.status || "Unknown";
          statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1;

          // Calculate risk severity
          const riskCalc = this.riskCalculator.calculateInherentRiskTable(
            risk.current_impact,
            risk.current_likelihood
          );
          const severityLevel = riskCalc?.level?.name || "Unknown";
          severityCounts[severityLevel] =
            (severityCounts[severityLevel] || 0) + 1;

          // Category distribution
          if (risk.category?.name) {
            categoryCounts[risk.category.name] =
              (categoryCounts[risk.category.name] || 0) + 1;
          }

          // Location distribution using location_ids array and locationMap
          if (risk.location_ids && Array.isArray(risk.location_ids)) {
            risk.location_ids.forEach((locId) => {
              const locName = locationMap[locId] || `Location ${locId}`;
              locationCounts[locName] = (locationCounts[locName] || 0) + 1;
            });
          }

          // Team distribution using team_ids array and teamMap
          if (risk.team_ids && Array.isArray(risk.team_ids)) {
            risk.team_ids.forEach((teamId) => {
              const teamName = teamMap[teamId] || `Team ${teamId}`;
              teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
            });
          }

          // Owner distribution using userOptions
          if (risk.owner_id) {
            const ownerName =
              this.userOptions.find((u) => u.id === risk.owner_id)?.full_name ||
              `User ${risk.owner_id}`;
            ownerCounts[ownerName] = (ownerCounts[ownerName] || 0) + 1;
          }

          // Technology distribution using technology_ids array and technologyMap
          if (risk.technology_ids && Array.isArray(risk.technology_ids)) {
            risk.technology_ids.forEach((techId) => {
              const techName = technologyMap[techId] || `Tech ${techId}`;
              technologyCounts[techName] =
                (technologyCounts[techName] || 0) + 1;
            });
          }

          // Submission timeline
          if (risk.created_at) {
            const date = new Date(risk.created_at);
            const monthYear = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
            submissionByMonth[monthYear] =
              (submissionByMonth[monthYear] || 0) + 1;
          }

          // Impact scope
          if (risk.impact_scope) {
            const scopeName =
              typeof risk.impact_scope === "object"
                ? risk.impact_scope.name
                : risk.impact_scope;
            impactScopeCounts[scopeName] =
              (impactScopeCounts[scopeName] || 0) + 1;
          }

          // Likelihood distribution for areaspline chart
          if (risk.current_likelihood) {
            const likelihood = Number(risk.current_likelihood);
            if (likelihood >= 1 && likelihood <= 5) {
              likelihoodCounts[likelihood] = (likelihoodCounts[likelihood] || 0) + 1;
            }
          }

          // Heatmap data (Likelihood vs Impact)
          if (risk.current_likelihood && risk.current_impact) {
            const likelihood = Number(risk.current_likelihood) || 0;
            const impact = Number(risk.current_impact) || 0;
            const key = `${likelihood}-${impact}`;
            heatmapMatrix[key] = (heatmapMatrix[key] || 0) + 1;
          }
        });

        // Update risk statistics data
        this.riskStatisticsData = {
          totalRisks,
          openRisks,
          closedRisks,
          mitigatedRisks,
        };

        // Convert heatmap matrix to Highcharts format
        const heatmapData = [];
        for (let likelihood = 0; likelihood <= 5; likelihood++) {
          for (let impact = 0; impact <= 5; impact++) {
            const key = `${likelihood}-${impact}`;
            const value = heatmapMatrix[key] || 0;
            heatmapData.push([likelihood, impact, value]);
          }
        }

        // Build all charts
        this.buildRiskCharts({
          statusCounts,
          severityCounts,
          categoryCounts,
          locationCounts,
          teamCounts,
          ownerCounts,
          technologyCounts,
          impactScopeCounts,
          timelineCounts: submissionByMonth,
          likelihoodCounts,
          heatmapData,
        });
      } catch (error) {
        console.error("Error fetching risk statistics:", error);
      }
    },

    buildRiskCharts(data) {
      const colorPalette = {
        crimson: "#A92525",
        crimsonLight: "#541212",
        crimsonBg: "#EED3D380",
        golden: "#C4951B",
        goldenLight: "#A37C16",
        goldenBg: "#F3EAD180",
        forest: "#255F0B",
        forestLight: "#122F05",
        forestBg: "#B6CAAE80",
        steel: "#999999",
        steelLight: "#404040",
        steelBg: "#D9D9D9",
      };

      // Chart color arrays for multi-series
      const chartColors = [colorPalette.crimson, colorPalette.golden, colorPalette.forest, colorPalette.steel];

      // 1. Status Distribution Chart (3D Donut)
      this.statusDistributionChart = {
        chart: {
          type: "pie",
          height: 250,
        },
        title: { text: "" },
        colors: chartColors,
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
            },
          },
        },
        series: [
          {
            name: "Risks",
            colorByPoint: true,
            data: Object.entries(data.statusCounts).map(([name, y]) => ({
              name,
              y,
            })),
          },
        ],
      };

      // 2. Severity Distribution Chart (3D Donut)
      this.severityDistributionChart = {
        chart: {
          type: "pie",
          height: 250,
        },
        title: { text: "" },
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
            },
          },
        },
        series: [
          {
            name: "Severity",
            colorByPoint: true,
            data: [
              {
                name: "Low",
                y: data.severityCounts.Low,
                color: colorPalette.forest,
              },
              {
                name: "Medium",
                y: data.severityCounts.Medium,
                color: colorPalette.golden,
              },
              {
                name: "High",
                y: data.severityCounts.High,
                color: colorPalette.steel,
              },
              {
                name: "Critical",
                y: data.severityCounts.Critical,
                color: colorPalette.crimson,
              },
            ],
          },
        ],
      };

      // 3. Category Distribution Chart (Column)
      this.categoryDistributionChart = {
        chart: { type: "column" },
        title: { text: "" },
        colors: [colorPalette.crimson],
        xAxis: {
          categories: Object.keys(data.categoryCounts),
          crosshair: true,
        },
        yAxis: { min: 0, title: { text: "Number of Risks" } },
        plotOptions: {
          column: {
            colorByPoint: false,
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Risks",
            data: Object.values(data.categoryCounts),
            color: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, colorPalette.crimson],
                [1, colorPalette.crimsonLight],
              ],
            },
          },
        ],
      };

      // 4. Location Distribution Chart (Column)
      this.locationDistributionChart = {
        chart: { type: "column" },
        title: { text: "" },
        colors: [colorPalette.golden],
        xAxis: {
          categories: Object.keys(data.locationCounts),
          crosshair: true,
        },
        yAxis: { min: 0, title: { text: "Number of Risks" } },
        plotOptions: {
          column: {
            colorByPoint: false,
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Risks",
            data: Object.values(data.locationCounts),
            color: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, colorPalette.golden],
                [1, colorPalette.goldenLight],
              ],
            },
          },
        ],
      };

      // 5. Impact vs Likelihood Chart (Areaspline)
      this.impactLikelihoodChart = {
        chart: {
          type: "areaspline",
          height: 350,
        },
        title: { text: null },
        colors: [colorPalette.forest],
        xAxis: {
          categories: ["Very Low", "Low", "Medium", "High", "Very High"],
          title: {
            text: this.$t("risk.likelihood") || "Likelihood",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: { style: { fontSize: "12px" } },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("risk.number_of_risks") || "Number of Risks",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " risks",
          style: { fontSize: "14px" },
          shared: true,
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            marker: {
              enabled: true,
              radius: 5,
              symbol: "circle",
            },
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "13px" },
        },
        series: [
          {
            name: this.$t("risk.likelihood_distribution") || "Likelihood Distribution",
            data: [
              data.likelihoodCounts[1] || 0,
              data.likelihoodCounts[2] || 0,
              data.likelihoodCounts[3] || 0,
              data.likelihoodCounts[4] || 0,
              data.likelihoodCounts[5] || 0,
            ],
            color: colorPalette.forest,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, colorPalette.forestBg],
                [1, colorPalette.forestLight + "40"],
              ],
            },
          },
        ],
      };

      // 5b. Likelihood Impact Matrix (Heatmap)
      this.likelihoodImpactMatrixChart = {
        chart: {
          type: "heatmap",
          height: 350,
          marginTop: 40,
          marginBottom: 80,
        },
        title: { text: null },
        xAxis: {
          categories: ["0", "1", "2", "3", "4", "5"],
          title: {
            text: this.$t("risk.likelihood") || "Likelihood",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: { style: { fontSize: "12px" } },
          min: 0,
          max: 5,
        },
        yAxis: {
          categories: ["0", "1", "2", "3", "4", "5"],
          title: {
            text: this.$t("risk.impact") || "Impact",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: { style: { fontSize: "12px" } },
          min: 0,
          max: 5,
          reversed: false,
        },
        colorAxis: {
          min: 0,
          stops: [
            [0, colorPalette.forest],      // Green (Low risk)
            [0.3, colorPalette.forestBg],  // Light green
            [0.5, colorPalette.golden],    // Golden (Medium risk)
            [0.7, colorPalette.goldenLight], // Darker golden
            [0.85, colorPalette.crimsonLight], // Dark crimson
            [1, colorPalette.crimson],     // Crimson (High risk)
          ],
        },
        legend: {
          align: "right",
          layout: "vertical",
          margin: 0,
          verticalAlign: "top",
          y: 25,
          symbolHeight: 280,
        },
        tooltip: {
          formatter: function () {
            const likelihood = this.point.x;
            const impact = this.point.y;
            const count = this.point.value || 0;
            return `<b>Likelihood:</b> ${likelihood}<br/><b>Impact:</b> ${impact}<br/><b>Risks:</b> ${count}`;
          },
        },
        plotOptions: {
          heatmap: {
            dataLabels: {
              enabled: true,
              color: "#000000",
              style: { fontSize: "11px", fontWeight: "bold", textOutline: "none" },
            },
          },
        },
        series: [
          {
            name: this.$t("risk.risk_count") || "Risk Count",
            borderWidth: 1,
            data: data.heatmapData || [],
            dataLabels: {
              enabled: true,
              color: "#000000",
            },
          },
        ],
      };

      // 6. Team Distribution Chart (Bar)
      this.teamDistributionChart = {
        chart: { type: "column" },
        title: { text: "" },
        colors: [colorPalette.steel],
        xAxis: {
          categories: Object.keys(data.teamCounts),
          title: { text: null },
        },
        yAxis: { min: 0, title: { text: "Number of Risks" } },
        plotOptions: {
          bar: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Risks",
            data: Object.values(data.teamCounts),
            color: {
              linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
              stops: [
                [0, colorPalette.steel],
                [1, colorPalette.steelLight],
              ],
            },
          },
        ],
      };

      // 7. Owner Distribution Chart (Bar)
      this.ownerDistributionChart = {
        chart: { type: "column" },
        title: { text: "" },
        colors: [colorPalette.forest],
        xAxis: {
          categories: Object.keys(data.ownerCounts),
          title: { text: null },
        },
        yAxis: { min: 0, title: { text: "Number of Risks" } },
        plotOptions: {
          bar: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Risks",
            data: Object.values(data.ownerCounts),
            color: {
              linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
              stops: [
                [0, colorPalette.forest],
                [1, colorPalette.forestLight],
              ],
            },
          },
        ],
      };

      // 8. Submission Timeline Chart (Column)
      const sortedTimeline = Object.entries(data.timelineCounts).sort();
      this.submissionTimelineChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        colors: [colorPalette.crimson],
        xAxis: {
          categories: sortedTimeline.map(([month]) => month),
          title: {
            text: this.$t("risk.month") || "Month",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: { style: { fontSize: "12px" } },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("risk.number_of_risks") || "Number of Risks",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " risks",
          style: { fontSize: "14px" },
          shared: true,
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "13px" },
        },
        series: [
          {
            name: this.$t("risk.risks_submitted") || "Risks Submitted",
            data: sortedTimeline.map(([, count]) => Number(count) || 0),
            color: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, colorPalette.crimson],
                [1, colorPalette.crimsonLight],
              ],
            },
          },
        ],
      };

      // 9. Impact Scope Distribution Chart (3D Donut)
      this.impactScopeChart = {
        chart: {
          type: "pie",
          height: 250,
        },
        title: { text: "" },
        colors: chartColors,
        plotOptions: {
          pie: {
            innerSize: "0%",
            depth: 45,
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
            },
          },
        },
        series: [
          {
            name: "Impact Scope",
            colorByPoint: true,
            data: Object.entries(data.impactScopeCounts).map(([name, y]) => ({
              name,
              y,
            })),
          },
        ],
      };

      // 10. Technology Distribution Chart (Column)
      this.technologyDistributionChart = {
        chart: { type: "column" },
        title: { text: "" },
        colors: [colorPalette.golden],
        xAxis: {
          categories: Object.keys(data.technologyCounts),
          crosshair: true,
        },
        yAxis: { min: 0, title: { text: "Number of Risks" } },
        plotOptions: {
          column: {
            colorByPoint: false,
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Risks",
            data: Object.values(data.technologyCounts),
            color: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, colorPalette.golden],
                [1, colorPalette.goldenLight],
              ],
            },
          },
        ],
      };

      // 11. Risk Completion Rate Chart (Areaspline)
      this.riskCompletionChart = {
        chart: {
          type: "areaspline",
          height: 350,
        },
        title: { text: null },
        colors: [colorPalette.steel],
        xAxis: {
          categories: [
            this.$t("risk.new") || "New",
            this.$t("risk.reopened") || "Reopened",
            this.$t("risk.mitigated") || "Mitigated",
            this.$t("risk.reviewed") || "Reviewed",
            this.$t("risk.closed") || "Closed",
          ],
          title: {
            text: this.$t("risk.status") || "Status",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          labels: { style: { fontSize: "12px" } },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("risk.number_of_risks") || "Number of Risks",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " risks",
          style: { fontSize: "14px" },
          shared: true,
        },
        plotOptions: {
          areaspline: {
            fillOpacity: 0.5,
            marker: {
              enabled: true,
              radius: 5,
              symbol: "circle",
            },
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
          itemStyle: { fontSize: "13px" },
        },
        series: [
          {
            name: this.$t("risk.risk_progress") || "Risk Progress",
            data: [
              this.riskStatus.new,
              this.riskStatus.reopened,
              this.riskStatus.mitigated,
              this.riskStatus.reviewed,
              this.riskStatus.closed,
            ],
            color: colorPalette.steel,
            fillColor: {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, colorPalette.steelBg],
                [1, colorPalette.steelLight + "40"],
              ],
            },
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
:deep(.edit_button) {
  display: none !important;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1;
}

.status-new {
  background-color: #e3f2fd;
  color: #1976d2;
  border-color: #bbdefb;
}

.status-reopened {
  background-color: #fff3e0;
  color: #f57c00;
  border-color: #ffe0b2;
}

.status-reject {
  background-color: #ffebee;
  color: #d32f2f;
  border-color: #ffcdd2;
}

.status-closed {
  background-color: #e8f5e8;
  color: #2e7d32;
  border-color: #c8e6c9;
}

.status-mgmt-reviewed {
  background-color: #f3e5f5;
  color: #7b1fa2;
  border-color: #e1bee7;
}

.status-default {
  background-color: #f5f5f5;
  color: #616161;
  border-color: #e0e0e0;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.modern-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: #f0f0f0;
  transition: all 0.3s ease;
  margin-top: 12px;
  padding: 8px;
}

.card .card-body {
  background: white !important;
  border-radius: 15px;
}

.statistic-container {
  background: #f0f0f0;
  border-radius: 16px;
  padding: 15px;
  margin: 10px 0px;
  border: 1px solid #e9ecef;
}

.modern-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card-modern {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f5;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.stat-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-purple {
  background-color: #e9d5ff;
  color: #7c3aed;
}

.stat-icon-blue {
  background-color: #dbeafe;
  color: #2563eb;
}

.stat-icon-orange {
  background-color: #ffedd5;
  color: #ea580c;
}

.stat-icon-indigo {
  background-color: #e0e7ff;
  color: #6366f1;
}

.stat-icon-green {
  background-color: #d1fae5;
  color: #059669;
}

.stat-icon-red {
  background-color: #fee2e2;
  color: #dc2626;
}

.stat-icon-yellow {
  background-color: #fef3c7;
  color: #d97706;
}

.stat-value-wrapper {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  line-height: 1;
}

.stat-percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  background-color: #f9fafb;
  padding: 4px 10px;
  border-radius: 12px;
}

.stat-card-purple .stat-value {
  color: #6e3894;
}

.stat-card-blue .stat-value {
  color: #2563eb;
}

.stat-card-orange .stat-value {
  color: #ea580c;
}

.stat-card-indigo .stat-value {
  color: #6366f1;
}

.stat-card-green .stat-value {
  color: #255f0b;
}

.stat-card-red .stat-value {
  color: #a92525;
}

.stat-card-yellow .stat-value {
  color: #c4951b;
}

.stat-loading {
  pointer-events: none;
}

.stat-loading-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 70px;
}

.shimmer-circle-modern {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f5 25%, #e0e0e8 50%, #f0f0f5 75%);
  background-size: 200% 100%;
  animation: shimmerFlow 1.8s infinite;
}

.shimmer-text-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shimmer-line {
  height: 12px;
  border-radius: 5px;
  background: linear-gradient(90deg, #f0f0f5 25%, #e0e0e8 50%, #f0f0f5 75%);
  background-size: 200% 100%;
  animation: shimmerFlow 1.8s infinite;
}

.shimmer-lg {
  width: 65%;
  height: 18px;
}

.shimmer-sm {
  width: 45%;
  height: 10px;
  animation-delay: 0.15s;
}

@keyframes shimmerFlow {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.subject-text {
  display: inline-flex;
  background: #d0b5e3;
  color: #6e3894;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  max-width: 300px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.risk-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.risk-spinner {
  width: 1.5rem;
  height: 1.5rem;
}

.risk-color-box {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.risk-badge {
  display: inline-flex;
  background: #f5f3ff;
  color: #4a2a78;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .stat-card-modern {
    padding: 16px;
    min-height: 100px;
  }

  .stat-icon-circle {
    width: 36px;
    height: 36px;
  }

  .stat-icon-circle svg {
    width: 18px;
    height: 18px;
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-title {
    font-size: 0.8rem;
  }

  .status-badge {
    padding: 4px 8px;
    font-size: 0.7rem;
  }
}

@media (max-width: 576px) {
  .stat-card-modern {
    padding: 14px;
    min-height: 95px;
  }

  .stat-icon-circle {
    width: 32px;
    height: 32px;
  }

  .stat-icon-circle svg {
    width: 16px;
    height: 16px;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .stat-title {
    font-size: 0.75rem;
  }

  .stat-percentage {
    font-size: 0.75rem;
    padding: 3px 8px;
  }
}

/* Chart Styles */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.chart-container-equal-height {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 1rem;
  font-weight: 500;
  color: black;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  /* border-bottom: 3px solid #d0b5e3; */
  text-align: left;
}

/* Chart Responsive Design */
@media (max-width: 1200px) {
  .chart-container {
    padding: 1.25rem;
  }

  .chart-container-equal-height {
    min-height: 350px;
  }

  .chart-title {
    font-size: 1rem;
    margin-bottom: 1.25rem;
  }
}

@media (max-width: 768px) {
  .chart-container {
    padding: 1rem;
  }

  .chart-container-equal-height {
    min-height: 300px;
  }

  .chart-title {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    padding-bottom: 0.4rem;
    border-bottom-width: 2px;
  }
}

@media (max-width: 576px) {
  .chart-container {
    padding: 0.875rem;
  }

  .chart-container-equal-height {
    min-height: 280px;
  }

  .chart-title {
    font-size: 0.9rem;
    margin-bottom: 0.875rem;
  }
}

/* Monthly Trends Table Styles */
.trends-table {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.trends-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding: 12px 8px;
  text-align: center;
  white-space: nowrap;
  font-size: 0.85rem;
}

.trends-table thead th:first-child {
  text-align: left;
  padding-left: 15px;
}

.trends-table tbody td {
  padding: 12px 8px;
  text-align: center;
  vertical-align: middle;
  border-top: 1px solid #dee2e6;
}

.trends-table tbody td.row-label {
  font-weight: 600;
  color: #495057;
  text-align: left;
  padding-left: 15px;
  background-color: #f8f9fa;
}

.trends-table tbody tr:hover td:not(.row-label) {
  background-color: #f1f3f5;
}

.trends-table .cumulative-row td {
  background-color: #e9ecef;
  font-weight: 600;
}

.trends-table .cumulative-row:hover td {
  background-color: #dee2e6 !important;
}

.trend-positive {
  color: #d32f2f;
  font-weight: 600;
}

.trend-negative {
  color: #2e7d32;
  font-weight: 600;
}

.trend-neutral {
  color: #616161;
  font-weight: 500;
}

@media (max-width: 768px) {
  .trends-table {
    font-size: 0.8rem;
  }

  .trends-table thead th,
  .trends-table tbody td {
    padding: 8px 4px;
    font-size: 0.75rem;
  }

  .trends-table thead th:first-child,
  .trends-table tbody td.row-label {
    padding-left: 10px;
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
</style>