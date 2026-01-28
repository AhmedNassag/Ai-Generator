<template>
  <div class="statistics-wrapper">
    <!-- Progress Cards Section -->
    <div class="chart-container statistics-container">
      <!-- Section Header -->
      <div class="section-header">
        <h2 class="section-title d-flex rtl">Compliance Audit Progress</h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading Audit statistics...</p>
      </div>

      <!-- Statistics Grid -->
      <div v-else class="frameworks-grid">
        <div v-for="framework in frameworkStatusData" :key="framework.framework_id" class="framework-card">
          <!-- Card Header -->
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="framework-title">Compliance Audit: {{ framework.framework_title }}</h3>

            <!-- Dropdown Menu -->
            <div class="dropdown">
              <button class="menu-btn dropdown-toggle" type="button" id="frameworkMenuBtn" data-bs-toggle="dropdown"
                aria-expanded="false">
                <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
                  <circle cx="2" cy="2" r="2" fill="#9CA3AF" />
                  <circle cx="2" cy="8" r="2" fill="#9CA3AF" />
                  <circle cx="2" cy="14" r="2" fill="#9CA3AF" />
                </svg>
              </button>

              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="frameworkMenuBtn">
                <li>
                  <!-- Audit Summary -->
                  <router-link class="dropdown-item"
                    :to="{ name: 'AuditSummary', params: { frameworkId: framework.framework_id } }">
                    Audit Summary
                  </router-link>
                </li>
                <li>
                  <!-- Audit Detail Graph -->
                  <router-link class="dropdown-item"
                    :to="{ name: 'AuditDetailGraphReport', params: { frameworkId: framework.framework_id } }">
                    Audit Detail Graph
                  </router-link>
                </li>
              </ul>

            </div>
          </div>


          <!-- Card Body -->
          <div class="card-body">
            <!-- Current Progress -->
            <div class="progress-item">
              <div class="circle-container">
                <svg class="progress-ring" width="70" height="70" viewBox="0 0 70 70">
                  <circle class="progress-ring-bg" cx="35" cy="35" r="32" fill="none" stroke="#E5E7EB"
                    stroke-width="3" />
                  <circle class="progress-ring-fill" cx="35" cy="35" r="32" fill="none"
                    :stroke="getProgressValue(framework.audit_data.current_progress) > 0 ? '#3B82F6' : '#E5E7EB'"
                    stroke-width="3"
                    :stroke-dasharray="`${(getProgressValue(framework.audit_data.current_progress) / 100) * 201} 201`"
                    stroke-linecap="round" transform="rotate(-90 35 35)"
                    style="transition: stroke-dasharray 0.6s ease;" />
                </svg>
                <div class="circle-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div class="progress-details">
                <div class="label">
                  <span>Current</span>
                  <svg v-if="isCurrentHigher(framework.audit_data)" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="#10B981" stroke-width="2.5" class="arrow-up">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  <svg v-else-if="isCurrentLower(framework.audit_data)" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="#EF4444" stroke-width="2.5" class="arrow-down">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280"
                    stroke-width="2.5">
                    <path d="M5 12h14" />
                  </svg>
                </div>
                <div class="value" :class="getValueClass(framework.audit_data.current_progress)">
                  {{ formatProgress(framework.audit_data.current_progress) }}
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="vertical-divider"></div>

            <!-- Previous Progress -->
            <div class="progress-item">
              <div class="circle-container">
                <svg class="progress-ring" width="70" height="70" viewBox="0 0 70 70">
                  <circle class="progress-ring-bg" cx="35" cy="35" r="32" fill="none" stroke="#E5E7EB"
                    stroke-width="3" />
                  <circle class="progress-ring-fill" cx="35" cy="35" r="32" fill="none"
                    :stroke="getProgressValue(framework.audit_data.previous_progress) > 0 ? '#10B981' : '#E5E7EB'"
                    stroke-width="3"
                    :stroke-dasharray="`${(getProgressValue(framework.audit_data.previous_progress) / 100) * 201} 201`"
                    stroke-linecap="round" transform="rotate(-90 35 35)"
                    style="transition: stroke-dasharray 0.6s ease;" />
                </svg>
                <div class="circle-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div class="progress-details">
                <div class="label">
                  <span>Previous</span>
                  <svg v-if="isPreviousHigher(framework.audit_data)" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="#10B981" stroke-width="2.5" class="arrow-up">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  <svg v-else-if="isPreviousLower(framework.audit_data)" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="#EF4444" stroke-width="2.5" class="arrow-down">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280"
                    stroke-width="2.5">
                    <path d="M5 12h14" />
                  </svg>
                </div>
                <div class="value" :class="getValueClass(framework.audit_data.previous_progress)">
                  {{ formatProgress(framework.audit_data.previous_progress) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="chart-container">
      <!-- Section Header -->
      <div class="section-header">
        <h2 class="section-title d-flex rtl">Framework Status Overview</h2>

      </div>

      <!-- Loading State -->
      <div v-if="loadingChart" class="loading-state">
        <div class="spinner"></div>
        <p>Loading Audit statistics...</p>
      </div>

      <!-- No Data State -->
      <div v-else-if="!hasAnyData" class="no-data-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <h3>No Audit Data Available</h3>
        <p>There are no frameworks with audit data to display.</p>
      </div>

      <!-- Chart -->
      <div v-else>
        <div id="frameworkStatusChart" style="width: 100%; height: 500px;"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Highcharts from 'highcharts';

// Configure Highcharts language settings
Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    thousandsSep: ',',
    loading: 'Loading...',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    numericSymbols: ['k', 'M', 'G', 'T', 'P', 'E']
  }
});

export default {
  name: 'FrameworkStatistics',
  props: {
    frameworkStatusData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    frameworkAllStatusData: {
      type: Array,
      default: () => []
    },
    loadingChart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chart: null,
      chartRendered: false
    };
  },
  computed: {
    hasAnyData() {
      return this.frameworkAllStatusData && this.frameworkAllStatusData.length > 0;
    }
  },
  watch: {
    frameworkAllStatusData: {
      handler(newVal) {
        if (newVal && newVal.length > 0 && this.hasAnyData && !this.loadingChart) {
          this.$nextTick(() => {
            this.renderChart();
          });
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.hasAnyData && !this.loadingChart) {
      this.$nextTick(() => {
        this.renderChart();
      });
    }
  },
  beforeUnmount() {
    if (this.chart) {
      try {
        this.chart.destroy();
      } catch (error) {
        console.error('Error destroying chart:', error);
      }
      this.chart = null;
    }
  },
  methods: {
    // Progress card methods
    getProgressValue(progressString) {
      if (!progressString || progressString === 'No Audit') return 0;
      const value = parseFloat(progressString.replace('%', ''));
      return isNaN(value) ? 0 : value;
    },
    formatProgress(value) {
      if (!value || value === '0%' || value === '0.00%') {
        return 'No Audit';
      }
      return value;
    },
    getValueClass(value) {
      if (!value || value === '0%' || value === '0.00%') {
        return 'no-audit';
      }
      return 'has-value';
    },
    isCurrentHigher(auditData) {
      const current = this.getProgressValue(auditData.current_progress);
      const previous = this.getProgressValue(auditData.previous_progress);
      return current > previous && current > 0;
    },
    isCurrentLower(auditData) {
      const current = this.getProgressValue(auditData.current_progress);
      const previous = this.getProgressValue(auditData.previous_progress);
      return current < previous && current > 0;
    },
    isPreviousHigher(auditData) {
      const current = this.getProgressValue(auditData.current_progress);
      const previous = this.getProgressValue(auditData.previous_progress);
      return previous > current && previous > 0;
    },
    isPreviousLower(auditData) {
      const current = this.getProgressValue(auditData.current_progress);
      const previous = this.getProgressValue(auditData.previous_progress);
      return previous < current && previous > 0;
    },

    // Chart methods
    prepareChartData() {
      const labels = [];
      const implemented = [];
      const notImplemented = [];
      const notApplicable = [];
      const partialImplemented = [];
      const frameworksData = [];

      const parsePercentage = (value) => {
        if (!value) return 0;
        const strValue = String(value).replace('%', '').trim();
        const num = parseFloat(strValue);
        return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
      };

      this.frameworkAllStatusData.forEach((framework, index) => {
        try {
          // Use framework_title directly from the data
          const frameworkTitle = framework.framework_title || framework.title || `Framework ${index + 1}`;
          labels.push(frameworkTitle);

          const statusData = framework.status_data || {
            total_controls: 0,
            implemented: { count: 0, percentage: '0%' },
            not_implemented: { count: 0, percentage: '0%' },
            not_applicable: { count: 0, percentage: '0%' },
            partial_implemented: { count: 0, percentage: '0%' }
          };

          frameworksData.push({
            framework_title: frameworkTitle,
            total_controls: statusData.total_controls || 0,
            implemented: statusData.implemented || { count: 0, percentage: '0%' },
            not_implemented: statusData.not_implemented || { count: 0, percentage: '0%' },
            not_applicable: statusData.not_applicable || { count: 0, percentage: '0%' },
            partial_implemented: statusData.partial_implemented || { count: 0, percentage: '0%' }
          });

          implemented.push(parsePercentage(statusData.implemented?.percentage));
          notImplemented.push(parsePercentage(statusData.not_implemented?.percentage));
          notApplicable.push(parsePercentage(statusData.not_applicable?.percentage));
          partialImplemented.push(parsePercentage(statusData.partial_implemented?.percentage));
        } catch (error) {
          console.error('Error processing framework data:', error, framework);
          const fallbackTitle = framework.framework_title || framework.title || `Framework ${index + 1}`;
          labels.push(fallbackTitle);
          frameworksData.push({
            framework_title: fallbackTitle,
            total_controls: 0,
            implemented: { count: 0, percentage: '0%' },
            not_implemented: { count: 0, percentage: '0%' },
            not_applicable: { count: 0, percentage: '0%' },
            partial_implemented: { count: 0, percentage: '0%' }
          });
          implemented.push(0);
          notImplemented.push(0);
          notApplicable.push(0);
          partialImplemented.push(0);
        }
      });

      console.log('Prepared chart data:', { labels, frameworksData });

      return {
        labels,
        implemented,
        notImplemented,
        notApplicable,
        partialImplemented,
        frameworksData
      };
    },

    renderChart() {
      try {
        if (this.chart) {
          try {
            this.chart.destroy();
          } catch (e) {
            console.warn('Error destroying existing chart:', e);
          }
          this.chart = null;
        }

        const container = document.getElementById('frameworkStatusChart');
        if (!container) {
          console.warn('Chart container not found, will retry...');
          setTimeout(() => {
            if (document.getElementById('frameworkStatusChart') && !this.chartRendered) {
              this.renderChart();
            }
          }, 100);
          return;
        }

        if (!this.hasAnyData) {
          console.log('No framework data available for chart');
          return;
        }

        const chartData = this.prepareChartData();

        if (!chartData || !chartData.labels || chartData.labels.length === 0) {
          console.warn('Invalid chart data');
          return;
        }

        this.chart = Highcharts.chart('frameworkStatusChart', {
          chart: {
            type: 'column',
            backgroundColor: '#FFFFFF',
            style: {
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
          },
          lang: {
            decimalPoint: '.',
            thousandsSep: ',',
            numericSymbols: ['k', 'M', 'B', 'T']
          },
          title: {
            text: null, // Remove the chart title since we have a section header
            style: {
              fontSize: '18px',
              fontWeight: '600',
              color: '#1F2937'
            }
          },
          xAxis: {
            categories: chartData.labels,
            title: {
              text: 'Framework',
              style: {
                fontSize: '14px',
                fontWeight: '500',
                color: '#6B7280'
              },
              align: 'high',
              offset: 0,
              rotation: 0,
              y: 20,
              x: 0
            },
            labels: {
              style: {
                fontSize: '11px',
                color: '#6B7280',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              },
              rotation: 0,
              align: 'center',
              useHTML: true,
              formatter: function () {
                const maxLength = 18;
                const displayText = this.value.length > maxLength
                  ? this.value.substring(0, maxLength) + '...'
                  : this.value;

                return `<div style="width: 85px; text-align: center; overflow: hidden; text-overflow: ellipsis;">${displayText}</div>`;
              }
            }
          },
          yAxis: {
            min: 0,
            max: 100,
            title: {
              text: 'Percentage (%)',
              style: {
                fontSize: '14px',
                fontWeight: '500',
                color: '#6B7280'
              }
            },
            labels: {
              format: '{value}%',
              style: {
                fontSize: '12px',
                color: '#6B7280'
              }
            },
            gridLineColor: '#E5E7EB'
          },
          tooltip: {
            shared: false,
            backgroundColor: '#FFFFFF',
            borderColor: '#D1D5DB',
            borderWidth: 1,
            borderRadius: 10,
            shadow: {
              color: 'rgba(0, 0, 0, 0.15)',
              offsetX: 0,
              offsetY: 4,
              opacity: 0.8,
              width: 10
            },
            useHTML: true,
            padding: 0,
            style: {
              border: 'none'
            },
            formatter: function () {
              try {
                const pointIndex = this.point.index;
                const frameworkData = chartData.frameworksData[pointIndex];

                if (!frameworkData) {
                  console.error('Framework data not found for index:', pointIndex);
                  return '<div style="padding: 10px; color: #EF4444;">No data available</div>';
                }

                const statusKey = this.series.name.toLowerCase().replace(/ /g, '_');
                const statusInfo = frameworkData[statusKey];
                const count = statusInfo?.count || 0;
                const percentage = statusInfo?.percentage || '0%';
                const percentageNum = parseFloat(String(percentage).replace('%', '')) || 0;
                const frameworkName = frameworkData.framework_title || this.x || 'Unknown Framework';
                const totalControls = frameworkData.total_controls || 0;

                return `
                  <div style="
                    padding: 14px 16px;
                    min-width: 240px;
                    max-width: 300px;
                    background: #FFFFFF;
                  ">
                    <!-- Framework Name -->
                    <div style="
                      font-size: 13px;
                      font-weight: 700;
                      color: #111827;
                      margin-bottom: 10px;
                      line-height: 1.4;
                      word-wrap: break-word;
                    ">
                      ${frameworkName}
                    </div>
                    
                    <!-- Status Badge -->
                    <div style="
                      display: flex;
                      align-items: center;
                      margin-bottom: 12px;
                      padding: 6px 10px;
                      background: ${this.series.color}15;
                      border-radius: 6px;
                      border-left: 3px solid ${this.series.color};
                    ">
                      <span style="
                        font-size: 12px;
                        font-weight: 600;
                        color: ${this.series.color};
                      ">
                        ${this.series.name}
                      </span>
                    </div>
                    
                    <!-- Percentage Display -->
                    <div style="
                      display: flex;
                      align-items: baseline;
                      gap: 8px;
                      margin-bottom: 8px;
                    ">
                      <span style="
                        font-size: 28px;
                        font-weight: 700;
                        color: ${this.series.color};
                        line-height: 1;
                      ">
                        ${percentageNum.toFixed(1)}%
                      </span>
                    </div>
                    
                    <!-- Count Information -->
                    <div style="
                      font-size: 12px;
                      color: #6B7280;
                      padding-top: 8px;
                      border-top: 1px solid #E5E7EB;
                    ">
                      <span style="font-weight: 600; color: #111827;">${count}</span> 
                      of 
                      <span style="font-weight: 600; color: #111827;">${totalControls}</span> 
                      controls
                    </div>
                  </div>
                `;
              } catch (error) {
                console.error('Tooltip formatter error:', error);
                return '<div style="padding: 10px; color: #EF4444;">Error loading data</div>';
              }
            }
          },
          plotOptions: {
            column: {
              stacking: undefined,
              borderRadius: 4,
              borderWidth: 0,
              groupPadding: 0.15,
              pointPadding: 0.05,
              dataLabels: {
                enabled: false
              },
              states: {
                hover: {
                  brightness: 0.1,
                  borderColor: '#1F2937',
                  borderWidth: 2
                }
              }
            }
          },
          legend: {
            align: 'center',
            verticalAlign: 'bottom',
            layout: 'horizontal',
            itemStyle: {
              fontSize: '13px',
              fontWeight: '500',
              color: '#374151'
            }
          },
          credits: { enabled: false },
          series: [
            { name: 'Implemented', color: '#44225c', data: chartData.implemented },
            { name: 'Not Implemented', color: '#dc3545', data: chartData.notImplemented },
            { name: 'Not Applicable', color: '#9e9e9e', data: chartData.notApplicable },
            { name: 'Partial Implemented', color: '#ffc107', data: chartData.partialImplemented }
          ]
        });

        this.chartRendered = true;
        console.log('Chart rendered successfully with all frameworks');
      } catch (error) {
        console.error('Error rendering chart:', error);
        this.chartRendered = false;
      }
    }
  }
};
</script>

<style scoped>
.statistics-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.statistics-container {
  padding: 20px;
  background-color: #F3F4F6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Section Header Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}


.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
  color: #374151;
}

.action-btn svg {
  flex-shrink: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.frameworks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.framework-card {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.framework-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 18px;
  background: #FAFAFA;
  border-bottom: 1px solid #E5E7EB;
}

.framework-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-left: 12px;
}

.menu-btn:hover {
  background-color: #E5E7EB;
}

.card-body {
  display: flex;
  align-items: center;
  padding: 24px 18px;
  gap: 0;
  background: #FFFFFF;
}

.progress-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 8px;
}

.circle-container {
  position: relative;
  width: 70px;
  height: 70px;
  flex-shrink: 0;
}

.progress-ring {
  transform: rotate(0deg);
}

.circle-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 400;
  color: #6B7280;
}

.label svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.arrow-up {
  animation: bounce-up 1.5s ease-in-out infinite;
}

.arrow-down {
  animation: bounce-down 1.5s ease-in-out infinite;
}

@keyframes bounce-up {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

@keyframes bounce-down {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(3px);
  }
}

.value {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
}

.value.no-audit {
  color: #EF4444;
}

.value.has-value {
  color: #111827;
}

.vertical-divider {
  width: 1px;
  height: 70px;
  background-color: #E5E7EB;
  margin: 0 12px;
  flex-shrink: 0;
}

/* Chart Container Styles */
.chart-container {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-data-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: #6B7280;
}

.no-data-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.no-data-state p {
  font-size: 14px;
  color: #9CA3AF;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .frameworks-grid {
    grid-template-columns: 1fr;
  }

  .card-body {
    padding: 20px 14px;
  }

  .progress-item {
    padding: 0 4px;
  }

  .vertical-divider {
    margin: 0 8px;
  }
}

@media (max-width: 480px) {

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .card-body {
    flex-direction: column;
    gap: 20px;
  }

  .vertical-divider {
    display: none;
  }

  .progress-item {
    width: 100%;
    padding: 0;
  }

  .chart-container {
    padding: 16px;
  }
}
</style>