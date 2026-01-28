<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'auditplan.auditplan'" :subPage="'auditplan.auditplan'"
    :titlePage="'auditplan.auditplan'">
  </main-page>

  <div class="container">
    <!-- Form Card -->
    <div class="custom-card shadow-sm rounded-3">
      <div class="card-body p-1">
        <h3 class="card-title mb-3">
          {{ $t("auditSummary.Audit_Summary") }}
        </h3>
        <form id="audit-summary-form">
          <div class="mb-3">
            <label for="audit" class="form-label">
              {{ $t("auditSummary.Select_Audit") }}:
            </label>
            <select v-model="selectedAudit" required id="audit" class="form-select" @change="onAuditChange">
              <option value="">{{ $t("auditSummary.Choose_Audit") }}</option>
              <option v-for="audit in audits" :key="audit.id" :value="audit.id">
                {{ audit.audit_name }}
              </option>
            </select>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading audit data...</p>
      </div>
    </div>
    
    <!-- Report Header (shown when audit is selected) -->
    <div v-if="!loading && dataControlWithDomain.length > 0" class="report-header-card shadow-sm rounded-3">
      <h1 class="text-center mb-2" style="font-size: 1.5rem;"><span class="badge rounded-pill badge-glow bg-primary"
          style="font-size: 1.5rem; padding: 0.5rem 1.5rem; line-height: unset;background-color:#2c3e50 !important;">framework control compliance status
          Report</span></h1>
      <p class="text-center">{{ getCurrentDateTime() }}</p>
    </div>

    <!-- Domain Tables -->
    <div v-if="dataControlWithDomain.length > 0" class="domains-container">
      <div v-for="(domainData, domainIndex) in dataControlWithDomain" :key="domainIndex" class="domain-section">
        <!-- Domain Header -->
        <div class="domain-header">
          <span class="domain-number">{{ domainIndex + 1 }}</span>
          <span class="domain-name">{{ domainData.domain.name }}</span>
        </div>

        <!-- Subdomains -->
        <div v-for="(subdomainData, subdomainIndex) in domainData.subdomains" :key="subdomainIndex"
          class="subdomain-section">
          <!-- Subdomain Header -->
          <div class="subdomain-header">
            <span class="subdomain-number">{{ domainIndex + 1 }}.{{ subdomainIndex + 1 }}</span>
            <span class="subdomain-name">{{ subdomainData.subdomain.name }}</span>
          </div>

          <!-- Controls Table -->
          <div class="table-responsive">
            <table class="controls-table">
              <thead>
                <tr>
                  <th class="text-start">رقم الضابط الأساسي</th>
                  <th class="text-start">رقم الضابط الفرعي</th>
                  <th class="text-center">الضابط الأساسي</th>
                  <th class="text-end">الضابط الفرعى</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(control, controlIndex) in subdomainData.controls" :key="control.id">
                  <!-- Parent Control Row -->
                  <tr class="parent-control-row">
                    <td class="text-start control-id">{{ control.short_name || control.control_name }}</td>
                    <td class="text-start">-</td>
                    <td class="text-center">
                      <span :class="getStatusClass(control.control_status)" class="status-badge">
                        {{ getStatusText(control.control_status) }}
                      </span>
                    </td>
                    <td class="text-end">-</td>
                  </tr>

                  <!-- Child Control Rows -->
                  <tr v-for="(child, childIndex) in control.children" :key="child.id" class="child-control-row">
                    <td class="text-start">-</td>
                    <td class="text-start control-id">{{ child.control_name }}</td>
                    <td class="text-center">-</td>
                    <td class="text-end">
                      <span :class="getStatusClass(child.control_status)" class="status-badge">
                        {{ getStatusText(child.control_status) }}
                      </span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && dataControlWithDomain.length === 0" class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p>No data available. Please select an audit to view the report.</p>
    </div>
  </div>
</template>

<script>
import auditplan from "@/API/AuditPlan/AuditPlan";
import control from "@/API/Control/Control";
import frameworkControlTestAudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import MainPage from "@/components/MainPage.vue";
import { useRoute } from "vue-router";

export default {
  name: "AuditSummary",
  components: {
    MainPage,
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
      loading: false,
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

    implementedCount() {
      return this.countControlsByStatus('Implemented');
    },

    partiallyImplementedCount() {
      return this.countControlsByStatus('Partially Implemented');
    },

    notImplementedCount() {
      return this.countControlsByStatus('Not Implemented');
    },

    notApplicableCount() {
      return this.countControlsByStatus('Not Applicable');
    }
  },

  async mounted() {
    await this.fetchAuditDataDependsOnFrameId();
    await this.fetchControlWithDomainData();
  },

  methods: {
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
      this.loading = true;
      try {
        if (this.selectedAudit) {
          await this.fetchControlWithDomainAndSubdomainDataAudit();
        } else {
          await this.fetchControlWithDomainData();
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchControlWithDomainData() {
      try {
        this.loading = true;
        const frameworkId = this.route.params.frameworkId;
        const filter = `framework_id|${frameworkId}|=`;

        const response = await this.controlApi.getAll({
          with: ["domainRelation", "subDomainRelation"],
          filter: filter,
          select: "id|short_name|control_status|family|domain_id|parent_id",
        });
        console.log("wsdfwfwfwef:", response);

        this.dataControlWithDomain = this.transformGeneralControlData(response);
        console.log("General framework control data:", this.dataControlWithDomain);
      } catch (error) {
        console.error("Error fetching general control data:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchControlWithDomainAndSubdomainDataAudit() {
      try {
        this.loading = true;
        const frameworkId = this.route.params.frameworkId;
        const params = {
          audit_id: this.selectedAudit,
          framework_id: frameworkId
        };
        const response = await this.frameworkControlTestAuditApi.fetchControlWithDomainAndSubdomainDataAudit(params);
        console.log("qwfqwdqf:", response);

        this.dataControlWithDomain = this.transformGeneralControlData(response.data);
        console.log("General framework control data:", this.dataControlWithDomain);

      } catch (error) {
        console.error("Error fetching audit-specific control data:", error);
        this.dataControlWithDomain = [];
      } finally {
        this.loading = false;
      }
    },

    transformAuditResponseData(responseData) {
      if (!responseData || !Array.isArray(responseData)) {
        return [];
      }

      return responseData.map(domain => ({
        domain: {
          id: domain.domain?.id,
          name: domain.domain?.domain_name || 'N/A'
        },
        subdomains: (domain.subdomains || []).map(subdomain => ({
          subdomain: {
            id: subdomain.subdomain?.id,
            name: subdomain.subdomain?.sub_domain_name || 'N/A'
          },
          controls: (subdomain.controls || []).map(control => ({
            id: control.id,
            control_name: control.control_name || control.name || 'N/A',
            control_status: control.control_status || 'Not Implemented',
            domain_id: control.domain_id,
            family: control.family,
            parent_id: control.parent_id,
            domain_name: domain.domain?.domain_name || 'N/A',
            subdomain_name: subdomain.subdomain?.sub_domain_name || 'N/A',
            children: (control.children || []).map(child => ({
              id: child.id,
              control_name: child.control_name || child.name || 'N/A',
              control_status: child.control_status || 'Not Implemented',
              parent_id: child.parent_id,
              family: child.family
            }))
          }))
        }))
      }));
    },

    transformGeneralControlData(responseData) {
      if (!responseData || !Array.isArray(responseData)) {
        return [];
      }

      const parentControls = responseData.filter(control => !control.parent_id || control.parent_id === null);
      const allControls = responseData;

      const controlMap = new Map();
      allControls.forEach(control => {
        controlMap.set(control.id, control);
      });

      parentControls.forEach(parent => {
        if (parent.children && Array.isArray(parent.children)) {
          parent.childControls = parent.children.map(child => ({
            id: child.id,
            control_name: child.short_name || child.control_name || 'N/A',
            control_status: child.control_status || 'Not Implemented',
            parent_id: child.parent_id,
            family: child.family
          }));
        } else {
          parent.childControls = allControls
            .filter(control => control.parent_id === parent.id)
            .map(child => ({
              id: child.id,
              control_name: child.short_name || child.control_name || 'N/A',
              control_status: child.control_status || 'Not Implemented',
              parent_id: child.parent_id,
              family: child.family
            }));
        }
      });

      const domainMap = new Map();

      parentControls.forEach(control => {
        const domainId = control.domain_id;
        const domainName = control.domain_relation?.name || 'Unknown Domain';
        const subdomainId = control.family;
        const subdomainName = control.sub_domain_relation?.name || 'Unknown Subdomain';

        if (!domainMap.has(domainId)) {
          domainMap.set(domainId, {
            domain: {
              id: domainId,
              name: domainName,
              order: control.domain_relation?.order || 0
            },
            subdomainsMap: new Map()
          });
        }

        const domainData = domainMap.get(domainId);

        if (!domainData.subdomainsMap.has(subdomainId)) {
          domainData.subdomainsMap.set(subdomainId, {
            subdomain: {
              id: subdomainId,
              name: subdomainName,
              order: control.sub_domain_relation?.order || 0
            },
            controls: []
          });
        }

        domainData.subdomainsMap.get(subdomainId).controls.push({
          id: control.id,
          short_name: control.short_name || 'N/A',
          control_name: control.short_name || control.control_name || 'N/A',
          control_status: control.control_status || 'Not Implemented',
          domain_id: control.domain_id,
          family: control.family,
          parent_id: control.parent_id,
          children: control.childControls || []
        });
      });

      const result = Array.from(domainMap.values()).map(domainData => {
        const subdomains = Array.from(domainData.subdomainsMap.values())
          .sort((a, b) => (a.subdomain.order || 0) - (b.subdomain.order || 0));

        return {
          domain: domainData.domain,
          subdomains: subdomains
        };
      }).sort((a, b) => (a.domain.order || 0) - (b.domain.order || 0));

      console.log("Transformed general control data:", result);
      return result;
    },

    getStatusClass(status) {
      const statusMap = {
        'Implemented': 'status-implemented',
        'Not Implemented': 'status-not-implemented',
        'Partially Implemented': 'status-partially',
        'Not Applicable': 'status-not-applicable'
      };
      return statusMap[status] || 'status-not-implemented';
    },

    getStatusText(status) {
      return status || 'Not Implemented';
    },

    getCurrentDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    },

    countControlsByStatus(status) {
      let count = 0;
      this.dataControlWithDomain.forEach(domain => {
        domain.subdomains.forEach(subdomain => {
          subdomain.controls.forEach(control => {
            if (control.control_status === status) count++;
            control.children.forEach(child => {
              if (child.control_status === status) count++;
            });
          });
        });
      });
      return count;
    },
  },
};
</script>

<style scoped>
/* Base Container */
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
}

/* Form Card Styles */
.custom-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  margin-bottom: 10px;
  transition: box-shadow 0.2s;
}
.custom-card {
    overflow: hidden !important;
    padding: 13px 30px !important;
}
.custom-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 12px;
}

#audit-summary-form {
  padding: 0;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 6px;
}

.form-select {
  border-radius: 6px;
  transition: all 0.2s;
  border: 1px solid #cbd5e0;
  padding: 8px 12px;
  font-size: 13px;
  background-color: #ffffff;
}

.form-select:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  outline: none;
}

/* Report Header */
.report-header-card {
  background: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  text-align: center;
    border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s;
}

.report-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.report-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* Domain Section */
.domains-container {
  margin-top: 20px;
}

.domain-section {
  margin-bottom: 24px;
}

.domain-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 10px 16px;
  border-radius: 6px 6px 0 0;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.domain-number {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 13px;
}

.domain-name {
  flex: 1;
}

/* Subdomain Section */
.subdomain-section {
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.subdomain-header {
  background-color: #f7fafc;
  padding: 10px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.subdomain-number {
  background-color: #4299e1;
  color: white;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}

.subdomain-name {
  font-weight: 500;
  font-size: 13px;
  color: #2d3748;
  flex: 1;
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.controls-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background-color: white;
}

.controls-table thead {
  background-color: #edf2f7;
}

.controls-table th {
  padding: 10px 12px;
  font-weight: 600;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
  font-size: 12px;
}

.controls-table tbody tr {
  border: 1px solid #e2e8f0;
  transition: background-color 0.15s;
}

.controls-table tbody tr:hover {
  background-color: #f7fafc;
}

.controls-table td {
  padding: 10px 12px;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.parent-control-row {
  background-color: #ffffff;
}

.child-control-row {
  background-color: #fafafa;
}

.control-id {
  font-weight: 500;
  color: #2d3748;
  font-size: 12px;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 11px;
  text-align: center;
}

.status-implemented {
  background-color: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.status-not-implemented {
  background-color: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
}

.status-partially {
  background-color: #fef3cd;
  color: #744210;
  border: 1px solid #fbd38d;
}

.status-not-applicable {
  background-color: #e2e8f0;
  color: #2d3748;
  border: 1px solid #cbd5e0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  background-color: #f7fafc;
  border-radius: 8px;
  margin-top: 20px;
  border: 2px dashed #cbd5e0;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #a0aec0;
  margin: 0 auto 12px;
}

.empty-state p {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #4299e1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

.loading-spinner p {
  color: #718096;
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Styles */
@media (max-width: 992px) {
  .controls-table {
    font-size: 12px;
  }

  .controls-table th,
  .controls-table td {
    padding: 8px 10px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 12px;
  }

  .report-title {
    font-size: 16px;
  }

  .domain-header {
    font-size: 13px;
    padding: 8px 12px;
  }

  .subdomain-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .controls-table {
    font-size: 11px;
  }

  .controls-table th,
  .controls-table td {
    padding: 6px 8px;
  }

  .status-badge {
    font-size: 10px;
    padding: 3px 8px;
  }
}
</style>

<style>
.flip-container {
  display: none;
}
</style>