<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'auditplan.auditplan'" :subPage="'auditplan.auditplan'"
    :titlePage="'auditplan.auditplan'">
  </main-page>

  <div class="container">
    <div class="custom-card shadow-lg rounded-3">
      <div class="card-body fw-bold p-4">
        <h3 class="card-title mb-4">
          {{ $t("auditSummary.Audit_Summary") }}
        </h3>
        <form id="audit-summary-form" @submit.prevent="handleFormSubmit">
          <div class="mb-3">
            <label for="audit" class="form-label">
              {{ $t("auditSummary.Select_Audit") }}:
            </label>
            <select v-model="selectedAudit" required id="audit" class="form-select shadow-sm" @change="onAuditChange">
              <option value="">{{ $t("auditSummary.Choose_Audit") }}</option>
              <option v-for="audit in audits" :key="audit.id" :value="audit.id">
                {{ audit.audit_name }}
              </option>
            </select>
          </div>
        </form>
      </div>
    </div>

    <!-- Overall Summary Card -->
    <div class="summary-card overall-summary mt-4">
      <div class="summary-content">
        <div class="chart-section">
          <highcharts :options="overallPieChartOptions" ref="overallChart"></highcharts>
        </div>
        <div class="stats-section">
          <h4 class="stats-title">status</h4>
          <div class="stat-item">
            <span class="stat-value">{{ overallStats.not_applicable }}</span>
            <span class="stat-label">Not Applicable - غير قابل للتطبيق</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ overallStats.not_implemented }}</span>
            <span class="stat-label">Not Implemented - لم يتم التنفيذ</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ overallStats.partially_implemented }}</span>
            <span class="stat-label">Partially Implemented - تم التنفيذ جزئيًا</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ overallStats.implemented }}</span>
            <span class="stat-label">Implemented - تم التنفيذ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Domain Cards Loop -->
    <div v-for="domain in graphData" :key="domain.domain_id" class="summary-card domain-card mt-4">
      <div class="summary-content">
        <div class="chart-section">
          <highcharts :options="getDomainPieChartOptions(domain)" :ref="'domainChart' + domain.domain_id"></highcharts>
        </div>
        <div class="stats-section">
          <h4 class="stats-title">status</h4>
          <div class="stat-item">
            <span class="stat-value">{{ domain.not_applicable }}</span>
            <span class="stat-label">Not Applicable - غير قابل للتطبيق</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ domain.not_implemented }}</span>
            <span class="stat-label">Not Implemented - لم يتم التنفيذ</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ domain.partially_implemented }}</span>
            <span class="stat-label">Partially Implemented - تم التنفيذ جزئيًا</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ domain.implemented }}</span>
            <span class="stat-label">Implemented - تم التنفيذ</span>
          </div>
        </div>
      </div>
      <div class="domain-footer">
        <span class="domain-name">{{ domain.domain_name }}</span>
      </div>
    </div>

    <!-- Domain Status Distribution Chart -->
    <div class="dashboard-section glass-card mt-4">
      <div class="section-header">
        <div class="header-content">
          <div class="header-icon controls-icon">
            <i class="fas fa-sitemap"></i>
          </div>
          <div class="header-text">
            <h2 class="section-title d-flex rtl">Domain Status Distribution</h2>
            <p class="section-subtitle">Control implementation status across all domains</p>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-card">
          <highcharts :options="chartOptions" ref="chart"></highcharts>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import auditplan from "@/API/AuditPlan/AuditPlan";
import control from "@/API/Control/Control";
import frameworkControlTestAudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import MainPage from "@/components/MainPage.vue";
import { useRoute } from "vue-router";
import { Chart as HighchartsVue } from 'highcharts-vue';
import Highcharts from 'highcharts';

export default {
  name: "AuditSummary",
  components: {
    MainPage,
    highcharts: HighchartsVue
  },

  setup() {
    const api = new auditplan();
    const controlApi = new control();
    const frameworkControlTestAuditApi = new frameworkControlTestAudit();
    const route = useRoute();
    return { api, route, controlApi, frameworkControlTestAuditApi };
  },

  data() {
    return {
      audits: [],
      selectedAudit: "",
      isFlipped: false,
      dataControlWithDomain: [],
      graphData: [],
      overallStats: {
        implemented: 0,
        not_implemented: 0,
        partially_implemented: 0,
        not_applicable: 0,
        total_controls: 0
      },
      chartOptions: {
        chart: {
          type: 'column',
          height: 450,
          backgroundColor: 'transparent'
        },
        title: {
          text: 'Domain Control Status Distribution',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
          }
        },
        xAxis: {
          categories: [],
          title: {
            text: 'Domains',
            style: {
              fontSize: '14px',
              fontWeight: 'bold'
            }
          },
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Number of Controls',
            style: {
              fontSize: '14px',
              fontWeight: 'bold'
            }
          }
        },
        legend: {
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal'
        },
        tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}'
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: false
            },
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        series: [],
        credits: { enabled: false },
        lang: {
          decimalPoint: '.',
          thousandsSep: ',',
          loading: 'Loading...',
          months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E']
        }
      },
      overallPieChartOptions: {}
    };
  },

  computed: {
    getSelectedAuditName() {
      const selected = this.audits.find(a => a.id === this.selectedAudit);
      return selected ? selected.audit_name : "";
    },

    getSelectedFrameworkId() {
      const selected = this.audits.find(a => a.id === this.selectedAudit);
      return selected ? selected.framework_id : "";
    },
  },

  watch: {
    graphData: {
      handler(newData) {
        this.prepareChartData(newData);
        this.calculateOverallStats(newData);
      },
      immediate: true,
      deep: true
    }
  },

  async mounted() {
    this.setHighchartsLanguage();
    await this.fetchAuditDataDependsOnFrameId();
    await this.fetchControlWithDomainData();
    // Don't fetch control data automatically - wait for audit selection
  },

  methods: {
    setHighchartsLanguage() {
      Highcharts.setOptions({
        lang: {
          decimalPoint: '.',
          thousandsSep: ',',
          loading: 'Loading...',
          months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E']
        }
      });
    },

    async fetchAuditDataDependsOnFrameId() {
      try {
        const frameworkId = this.route.params.frameworkId;
        console.log("Framework ID from route:", frameworkId);

        const response = await this.api.getAll({
          filter: `framework_id|${frameworkId}`,
          select: "id|audit_name|framework_id",
        });

        this.audits = Array.isArray(response)
          ? response
          : response.data || [];

        console.log("Fetched audits:", this.audits);
      } catch (error) {
        console.error("Error fetching audit data:", error);
      }
    },

    async onAuditChange() {
      console.log("Audit changed to:", this.selectedAudit);
      await this.fetchControlData();
    },

    async fetchControlData() {
      try {
        if (this.selectedAudit) {
          // If audit is selected, fetch audit-specific data
          await this.fetchControlWithDomainDataAudit();
        } else {
          // If no audit selected, fetch general framework data
          await this.fetchControlWithDomainData();
        }
      } catch (error) {
        console.error("Error fetching control data:", error);
        // Fallback to general data if audit-specific fetch fails
        await this.fetchControlWithDomainData();
      }
    },

    async fetchControlWithDomainDataAudit() {
      try {
        const frameworkId = this.route.params.frameworkId;
        const params = {
          audit_id: this.selectedAudit,
          framework_id: frameworkId
        };
        const response = await this.frameworkControlTestAuditApi.fetchFilteredDataParentAndMain(params);

        this.dataControlWithDomain = response.data
        console.log("Audit-specific control data:", this.dataControlWithDomain);
        this.processControlDataForGraph();
      } catch (error) {
        console.error("Error fetching audit-specific control data:", error);
        throw error; // Re-throw to handle in fetchControlData
      }
    },

    async fetchControlWithDomainData() {
      try {
        const frameworkId = this.route.params.frameworkId;
        const filter = `framework_id|${frameworkId}|=&&parent_id|null-null|=`;

        this.dataControlWithDomain = await this.controlApi.getAll({
          with: ["domainRelation"],
          filter: filter,
          select: "id|control_status|family|domain_id",
        });

        console.log("General framework control data:", this.dataControlWithDomain);
        this.processControlDataForGraph();
      } catch (error) {
        console.error("Error fetching general control data:", error);
        throw error;
      }
    },

    processControlDataForGraph() {
      if (!this.dataControlWithDomain || !Array.isArray(this.dataControlWithDomain)) {
        console.log("No data available for processing");
        this.graphData = [];
        return;
      }

      const domainStats = {};

      this.dataControlWithDomain.forEach(control => {
        const domainId = control.domain_id;
        const domainName = control.domain_relation?.name || 'Unknown Domain';
        let status = control.control_status || 'Not Implemented';
        status = status.toString().trim().toLowerCase();

        if (!domainStats[domainId]) {
          domainStats[domainId] = {
            domain_id: domainId,
            domain_name: domainName,
            total_controls: 0,
            implemented: 0,
            not_implemented: 0,
            partially_implemented: 0,
            not_applicable: 0
          };
        }

        domainStats[domainId].total_controls++;

        switch (status) {
          case 'implemented':
          case 'implementation completed':
          case 'complete':
            domainStats[domainId].implemented++;
            break;
          case 'not implemented':
          case 'notimplemented':
          case 'not_implemented':
          case 'not started':
          case '':
          case null:
          case undefined:
            domainStats[domainId].not_implemented++;
            break;
          case 'partially implemented':
          case 'partial_implemented':
          case 'partiallyimplemented':
          case 'partial':
          case 'in progress':
          case 'inprogress':
            domainStats[domainId].partially_implemented++;
            break;
          case 'not applicable':
          case 'not_applicable':
          case 'notapplicable':
          case 'na':
          case 'n/a':
            domainStats[domainId].not_applicable++;
            break;
          default:
            console.warn(`Unknown control status: "${control.control_status}" - defaulting to "Not Implemented"`);
            domainStats[domainId].not_implemented++;
            break;
        }
      });

      this.graphData = Object.values(domainStats);
      console.log("Processed graph data:", this.graphData);
    },

    calculateOverallStats(domainData) {
      this.overallStats = {
        implemented: 0,
        not_implemented: 0,
        partially_implemented: 0,
        not_applicable: 0,
        total_controls: 0
      };

      domainData.forEach(domain => {
        this.overallStats.implemented += domain.implemented;
        this.overallStats.not_implemented += domain.not_implemented;
        this.overallStats.partially_implemented += domain.partially_implemented;
        this.overallStats.not_applicable += domain.not_applicable;
        this.overallStats.total_controls += domain.total_controls;
      });

      this.overallPieChartOptions = this.createPieChartOptions(this.overallStats);
    },

    createPieChartOptions(stats) {
      const total = stats.implemented + stats.not_implemented + stats.partially_implemented + stats.not_applicable;

      return {
        chart: {
          type: 'pie',
          height: 300,
          backgroundColor: 'transparent'
        },
        title: {
          text: '100%',
          align: 'center',
          verticalAlign: 'middle',
          y: 10,
          style: {
            fontSize: '24px',
            fontWeight: 'bold'
          }
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)'
        },
        plotOptions: {
          pie: {
            innerSize: '70%',
            dataLabels: {
              enabled: false
            },
            showInLegend: true
          }
        },
        legend: {
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemStyle: {
            fontSize: '11px'
          }
        },
        series: [{
          name: 'Controls',
          data: [
            { name: 'Not Applicable', y: stats.not_applicable, color: '#9ca3af' },
            { name: 'Not Implemented', y: stats.not_implemented, color: '#ef9a9a' },
            { name: 'Partially Implemented', y: stats.partially_implemented, color: '#f9ca24' },
            { name: 'Implemented', y: stats.implemented, color: '#6dd5ed' }
          ]
        }],
        credits: { enabled: false }
      };
    },

    getDomainPieChartOptions(domain) {
      return this.createPieChartOptions(domain);
    },

    prepareChartData(domainData) {
      if (!domainData || domainData.length === 0) {
        console.log("No domain data available for chart");
        this.chartOptions.xAxis.categories = [];
        this.chartOptions.series = [];
        return;
      }

      const categories = domainData.map(domain => domain.domain_name);
      const implementedData = domainData.map(domain => domain.implemented);
      const notImplementedData = domainData.map(domain => domain.not_implemented);
      const partiallyImplementedData = domainData.map(domain => domain.partially_implemented);
      const notApplicableData = domainData.map(domain => domain.not_applicable);

      this.chartOptions.xAxis.categories = categories;
      this.chartOptions.series = [
        {
          name: 'Implemented',
          color: '#27ae60',
          data: implementedData
        },
        {
          name: 'Not Implemented',
          color: '#c0392b',
          data: notImplementedData
        },
        {
          name: 'Partially Implemented',
          color: '#d68910',
          data: partiallyImplementedData
        },
        {
          name: 'Not Applicable',
          color: '#4b5563',
          data: notApplicableData
        }
      ];
    },

    handleFormSubmit() {
      console.log("Form submitted with audit:", this.selectedAudit);
    }
  },
};
</script>
<style scoped>
/* Base Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* Form Card Styles */
#audit-summary-form {
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-select {
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid #d0d0d0;
  padding: 10px 12px;
  font-size: 14px;
  background-color: #fafafa;
}

.form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.custom-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

/* Summary Card Base Styles */
.summary-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.summary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-content {
  display: flex;
  align-items: stretch;
  min-height: 280px;
}

/* Chart Section */
.chart-section {
  flex: 0 0 320px;
  padding: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-right: 1px solid #e5e7eb;
}

/* Stats Section */
.stats-section {
  flex: 1;
  padding: 30px 35px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1f2937;
  text-align: right;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.stat-item:hover {
  background-color: #f9fafb;
  margin: 0 -10px;
  padding: 14px 10px;
  border-radius: 6px;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  min-width: 60px;
  text-align: left;
  padding-right: 20px;
}

/* Domain Footer */
.domain-footer {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 16px 30px;
  border-top: 1px solid #d1d5db;
  text-align: center;
}

.domain-name {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.3px;
}

/* Overall Summary Specific Styles */
.overall-summary .chart-section {
  background: #cacaca;
  border-right-color: rgba(255, 255, 255, 0.2);
}

.overall-summary .domain-footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-top-color: rgba(255, 255, 255, 0.2);
}

.overall-summary .domain-name {
  color: #ffffff;
  font-size: 16px;
}

/* Domain Card Specific Styles */
.domain-card .chart-section {
  background: linear-gradient(135deg, #fef3e2 0%, #fef7ed 100%);
}

/* Dashboard Section (Chart) */
.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.section-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.controls-icon {
  background: rgb(231, 230, 230);
  color: black;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.header-text h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}

.header-text p {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 400;
}

.chart-container {
  margin-top: 20px;
}

.chart-card {
  background: transparent;
  border-radius: 10px;
  padding: 0;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .summary-content {
    flex-direction: column;
  }

  .chart-section {
    flex: 1;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    min-height: 280px;
  }

  .stats-section {
    padding: 25px 20px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-text h2 {
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 16px;
  }

  .stat-label {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .stats-section {
    padding: 20px 15px;
  }

  .stat-item {
    padding: 12px 0;
  }

  .domain-footer {
    padding: 14px 20px;
  }

  .domain-name {
    font-size: 14px;
  }
}
</style>

<style>
.flip-container {
  display: none;
}
</style>