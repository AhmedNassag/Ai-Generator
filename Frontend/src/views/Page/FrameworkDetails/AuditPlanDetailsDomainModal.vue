<template>
  <div v-if="isOpen" class="fullscreen-overlay">
    <div class="fullscreen-container">
      <!-- Header -->
      <div class="content-header">
        <h5 class="modal-title">Domain Analytics</h5>
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times fs-4"></i>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="content-body">
        <div class="loading-container">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          <p class="loading-text">Loading domain details...</p>
          <p class="loading-subtext">
            Please wait while we gather your information
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="content-body">
        <div
          v-if="auditPlan && auditPlan.statistics"
          class="statistics-container"
        >
          <!-- Status Statistics Section -->
          <div class="section glass-card">
            <div class="section-header">
              <div class="section-title-container rtl">
                <div>
                  <h3 class="section-title">Implementation Status</h3>
                  <p class="section-subtitle">
                    Control implementation progress breakdown
                  </p>
                </div>
              </div>
            </div>

            <div class="stats-grid">
              <!-- Not Implemented -->
              <div class="stat-card danger">
                <div class="stat-content">
                  <div class="stat-header rtl">
                    <div class="stat-icon">
                      <i class="fas fa-exclamation-triangle"></i>
                      <div class="stat-label">Not Implemented</div>
                    </div>
                    <div class="stat-numbers">
                      <div class="stat-value">
                        {{ getStatusCount("not_implemented") }}
                      </div>
                      <div class="stat-percentage">
                        {{ getStatusPercentage("not_implemented") }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Implemented -->
              <div class="stat-card success">
                <div class="stat-content">
                  <div class="stat-header rtl">
                    <div class="stat-icon">
                      <i class="fas fa-check"></i>
                      <div class="stat-label">Implemented</div>
                    </div>
                    <div class="stat-numbers">
                      <div class="stat-value">
                        {{ getStatusCount("implemented") }}
                      </div>
                      <div class="stat-percentage">
                        {{ getStatusPercentage("implemented") }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Partially Implemented -->
              <div class="stat-card warning">
                <div class="stat-content">
                  <div class="stat-header rtl">
                    <div class="stat-icon">
                      <i class="fas fa-clock"></i>
                      <div class="stat-label">Partially Implemented</div>
                    </div>
                    <div class="stat-numbers">
                      <div class="stat-value">
                        {{ getStatusCount("partially_implemented") }}
                      </div>
                      <div class="stat-percentage">
                        {{ getStatusPercentage("partially_implemented") }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Not Applicable -->
              <div class="stat-card secondary">
                <div class="stat-content">
                  <div class="stat-header rtl">
                    <div class="stat-icon">
                      <i class="fas fa-minus-circle"></i>
                      <div class="stat-label">Not Applicable</div>
                    </div>
                    <div class="stat-numbers">
                      <div class="stat-value">
                        {{ getStatusCount("not_applicable") }}
                      </div>
                      <div class="stat-percentage">
                        {{ getStatusPercentage("not_applicable") }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Overview Statistics Section -->
          <div class="section glass-card">
            <div class="section-header">
              <div class="section-title-container rtl">
                <div>
                  <h3 class="section-title">Domain Overview</h3>
                  <p class="section-subtitle">
                    Summary of controls, requirements and evidence
                  </p>
                </div>
              </div>
            </div>

            <div class="overview-grid">
              <!-- Total Controls -->
              <div class="overview-card primary-card">
                <div class="overview-icon-wrapper">
                  <i class="fas fa-shield-alt fs-4"></i>
                </div>
                <div class="overview-content">
                  <div class="overview-value">
                    {{ auditPlan.statistics.totalControls }}
                  </div>
                  <div class="overview-label">Total Controls</div>
                </div>
              </div>

              <!-- Total Requirements -->
              <div class="overview-card info-card">
                <div class="overview-icon-wrapper">
                  <i class="fas fa-list-check fs-4"></i>
                </div>
                <div class="overview-content">
                  <div class="overview-value">
                    {{ auditPlan.statistics.totalRequirements }}
                  </div>
                  <div class="overview-label">Total Requirements</div>
                </div>
              </div>

              <!-- Total Evidence -->
              <div class="overview-card success-card">
                <div class="overview-icon-wrapper">
                  <i class="fas fa-file-alt fs-4"></i>
                </div>
                <div class="overview-content">
                  <div class="overview-value">
                    {{ auditPlan.statistics.totalEvidences }}
                  </div>
                  <div class="overview-label">Total Evidence</div>
                </div>
              </div>

              <!-- Controls with Requirements -->
              <div class="overview-card warning-card">
                <div class="overview-icon-wrapper">
                  <i class="fas fa-check-circle fs-4"></i>
                </div>
                <div class="overview-content">
                  <div class="overview-value">
                    {{ auditPlan.statistics.controlsWithRequirements }}
                  </div>
                  <div class="overview-label">With Requirements</div>
                  <div class="overview-sublabel">
                    {{ auditPlan.statistics.controlsWithoutRequirements }}
                    without
                  </div>
                </div>
              </div>

              <!-- Controls with Evidence -->
              <div class="overview-card gray-card">
                <div class="overview-icon-wrapper">
                  <i class="fas fa-folder-open fs-4"></i>
                </div>
                <div class="overview-content">
                  <div class="overview-value">
                    {{ auditPlan.statistics.controlsWithEvidence }}
                  </div>
                  <div class="overview-label">With Evidence</div>
                  <div class="overview-sublabel">
                    {{ auditPlan.statistics.controlsWithoutEvidence }} without
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Controls Datatable Section -->
          <div class="section glass-card">
            <div class="section-header">
              <div class="section-title-container rtl">
                <div>
                  <h3 class="section-title">Control Details</h3>
                  <p class="section-subtitle">
                    Detailed view of individual controls
                  </p>
                </div>
              </div>
            </div>

            <!-- Filters -->
            <div class="filters-container">
              <div class="filter-group">
                <label class="filter-label">Control Name</label>
                <select v-model="filters.controlName" class="filter-select">
                  <option value="">All Controls</option>
                  <option
                    v-for="control in uniqueControlNames"
                    :key="control"
                    :value="control"
                  >
                    {{ control }}
                  </option>
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Sub-Domain</label>
                <select v-model="filters.domain" class="filter-select">
                  <option value="">All Sub-Domains</option>
                  <option
                    v-for="domain in uniqueDomains"
                    :key="domain"
                    :value="domain"
                  >
                    {{ domain }}
                  </option>
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">Status</label>
                <select v-model="filters.status" class="filter-select">
                  <option value="">All Status</option>
                  <option value="Implemented">Implemented</option>
                  <option value="Not Implemented">Not Implemented</option>
                  <option value="Partially Implemented">
                    Partially Implemented
                  </option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="Not Set">Not Set</option>
                </select>
              </div>

              <button @click="clearFilters" class="clear-btn">
                <i class="fas fa-redo"></i> Reset Filters
              </button>
            </div>

            <!-- Datatable -->
            <div class="data-table-container">
              <div class="table-header">
                <div class="col-control">Control Name</div>
                <div class="col-domain">Sub-Domain</div>
                <div class="col-status">Status</div>
                <div class="col-number">Requirements</div>
                <div class="col-number">Evidence</div>
              </div>

              <!-- No Data -->
              <div v-if="paginatedData.length === 0" class="no-data">
                <div class="no-data-icon">
                  <i class="fas fa-inbox"></i>
                </div>
                <h3>No Data Available</h3>
                <p>Try adjusting your filters to see more results</p>
              </div>

              <!-- Data Rows -->
              <div v-else class="table-body">
                <div
                  v-for="record in paginatedData"
                  :key="record.id"
                  class="table-row"
                  :class="getRowClass(record.status)"
                >
                  <div class="col-control">
                    <i class="fas fa-shield-alt row-icon"></i>
                    <span class="control-name">{{ record.name }}</span>
                  </div>
                  <div class="col-domain">
                    <span class="">{{ record.domain_name }}</span>
                  </div>
                  <div class="col-status">
                    <span class="status-badge">
                      <i :class="getStatusIcon(record.status)"></i>
                      {{ record.status }}
                    </span>
                  </div>
                  <div class="col-number">
                    <div class="number-display">
                      <span class="number-value">{{
                        record.total_requirements
                      }}</span>
                    </div>
                  </div>
                  <div class="col-number">
                    <div class="number-display">
                      <span class="number-value">{{
                        record.total_evidence
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="pagination-container" v-if="filteredData.length > 0">
                <div class="pagination-info">
                  Showing {{ (currentPage - 1) * itemsPerPage + 1 }} -
                  {{
                    Math.min(currentPage * itemsPerPage, filteredData.length)
                  }}
                  of {{ filteredData.length }} controls
                </div>

                <div class="pagination-controls">
                  <button
                    @click="previousPage"
                    :disabled="currentPage === 1"
                    class="page-btn nav-btn"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>

                  <button
                    v-for="page in displayedPages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="['page-btn', { active: page === currentPage }]"
                  >
                    {{ page }}
                  </button>

                  <button
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    class="page-btn nav-btn"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>

                <div class="per-page-selector">
                  <label>Show:</label>
                  <select v-model.number="itemsPerPage" class="per-page-select">
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuditPlanDetailsForDomainModal",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
      default: false,
    },
    auditPlan: {
      type: Object,
      default: null,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      filters: {
        controlName: "",
        domain: "",
        status: "",
      },
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    datatableRecords() {
      return this.auditPlan?.datatableRecords || [];
    },
    uniqueControlNames() {
      const names = this.datatableRecords.map((record) => record.name);
      return [...new Set(names)].sort();
    },
    uniqueDomains() {
      const domains = this.datatableRecords.map((record) => record.domain_name);
      return [...new Set(domains)].filter((d) => d !== "N/A").sort();
    },
    filteredData() {
      let data = this.datatableRecords;

      if (this.filters.controlName) {
        data = data.filter(
          (record) => record.name === this.filters.controlName
        );
      }

      if (this.filters.domain) {
        data = data.filter(
          (record) => record.domain_name === this.filters.domain
        );
      }

      if (this.filters.status) {
        data = data.filter((record) => record.status === this.filters.status);
      }

      return data;
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredData.slice(start, end);
    },
    displayedPages() {
      const pages = [];
      const maxDisplayed = 5;
      let startPage = Math.max(
        1,
        this.currentPage - Math.floor(maxDisplayed / 2)
      );
      let endPage = Math.min(this.totalPages, startPage + maxDisplayed - 1);

      if (endPage - startPage < maxDisplayed - 1) {
        startPage = Math.max(1, endPage - maxDisplayed + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        this.currentPage = 1;
      },
    },
    itemsPerPage() {
      this.currentPage = 1;
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    clearFilters() {
      this.filters = {
        controlName: "",
        domain: "",
        status: "",
      };
    },
    getStatusCount(statusKey) {
      return this.auditPlan?.statistics?.status?.counts?.[statusKey] || 0;
    },
    getStatusPercentage(statusKey) {
      const percentage =
        this.auditPlan?.statistics?.status?.percentages?.[statusKey] || 0;
      return typeof percentage === "number"
        ? percentage.toFixed(2)
        : percentage;
    },
    getStatusIcon(status) {
      const iconMap = {
        Implemented: "fas fa-check",
        "Not Implemented": "fas fa-exclamation-triangle",
        "Partially Implemented": "fas fa-clock",
        "Not Applicable": "fas fa-minus-circle",
        "Not Set": "fas fa-question",
      };
      return iconMap[status] || "fas fa-question";
    },
    getStatusClass(status) {
      const classMap = {
        Implemented: "status-success",
        "Not Implemented": "status-danger",
        "Partially Implemented": "status-warning",
        "Not Applicable": "status-secondary",
        "Not Set": "status-info",
      };
      return classMap[status] || "status-info";
    },
    getRowClass(status) {
      const classMap = {
        Implemented: "row-success",
        "Not Implemented": "row-danger",
        "Partially Implemented": "row-warning",
        "Not Applicable": "row-secondary",
        "Not Set": "row-info",
      };
      return classMap[status] || "";
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
  },
};
</script>

<style scoped>
/* Modern Color Palette */
:root {
  --primary: #4361ee;
  --secondary: #6c757d;
  --success: #2ecc71;
  --danger: #e74c3c;
  --warning: #f39c12;
  --info: #3498db;
  --purple: #9b59b6;
  --dark: #2c3e50;
  --light: #ecf0f1;
  --white: #ffffff;
  --gray-100: #f2f2f2;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-400: #ced4da;
  --gray-500: #adb5bd;
  --gray-600: #6c757d;
  --gray-700: #495057;
  --gray-800: #343a40;
  --gray-900: #212529;
}

/* Base Styles */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #f2f2f2;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.fullscreen-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.4s ease-out;
  background: #f2f2f2;
}

/* Header */
.content-header {
  padding: 12px 45px 12px 30px;
  background: #f2f2f2;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  min-height: 60px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}
.close-button {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  border: 1px solid var(--gray-200);
}

/* Body */
.content-body {
  padding: 0;
  overflow-y: auto;
  flex: 1;
  background: #f2f2f2;
  height: calc(100vh - 60px);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  gap: 20px;
}

.spinner-container {
  position: relative;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(67, 97, 238, 0.2);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 6px 20px rgba(67, 97, 238, 0.2);
}

.loading-text {
  color: var(--gray-700);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.loading-subtext {
  color: var(--gray-500);
  font-size: 13px;
  margin: 0;
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--purple));
  border-radius: 12px 12px 0 0;
}

/* Statistics Container */
.statistics-container {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0px 20px;
}

/* Section Header */
.section-header {
  margin-bottom: 10px;
}

.section-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.overview-icon {
  background: linear-gradient(135deg, var(--purple), #8e44ad);
  color: white;
}

.status-icon {
  background: linear-gradient(135deg, var(--primary), #5a67d8);
  color: white;
}

.controls-icon {
  background: linear-gradient(135deg, var(--success), #27ae60);
  color: white;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 13px;
  color: #8C8C8C;
  margin: 0;
}

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.overview-card {
  padding: 8px 15px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #F5F5F5;
}

.overview-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.primary-card {
  background: #d0b5e380;
  border-color: #f5f5f5;
}

.info-card {
  background: #b6caae80;
  border-color: #f5f5f5;
}

.success-card {
  background: #eed3d380;
  border-color: #f5f5f5;
}

.warning-card {
  background: #f3ead180;
  border-color: #f5f5f5;
}

.purple-card {
  background: #d0b5e380;
  border-color: #f5f5f5;
}
.gray-card {
  background: #dddddd;
  border-color: #f5f5f5;
}

.overview-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
}

.overview-value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
  color: var(--gray-800);
}

.overview-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.overview-sublabel {
  font-size: 11px;
  color: var(--gray-500);
  margin-top: 2px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

/* Stat Cards */
.stat-card {
  padding: 10px 20px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.success {
  background: #eed3d380;
  border-color: #f5f5f5;
}

.stat-card.danger {
  background: #d0b5e380;
  border-color: #f5f5f5;
}

.stat-card.warning {
  background: #f3ead180;
  border-color: #f5f5f5;
}

.stat-card.secondary {
  background: #b6caae80;
  border-color: #f5f5f5;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  font-size: 26px;
}

.stat-card.success .stat-icon {
  color: var(--success);
}
.stat-card.danger .stat-icon {
  color: var(--danger);
}
.stat-card.warning .stat-icon {
  color: var(--warning);
}
.stat-card.secondary .stat-icon {
  color: var(--secondary);
}

.stat-numbers {
  text-align: right;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-percentage {
  font-size: 16px;
  font-weight: 700;
  opacity: 0.8;
}

.stat-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-700);
  letter-spacing: 0.5px;
}

.stat-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
}

.stat-card.success .stat-bar-fill {
  background: linear-gradient(90deg, var(--success), #27ae60);
}
.stat-card.danger .stat-bar-fill {
  background: linear-gradient(90deg, var(--danger), #c0392b);
}
.stat-card.warning .stat-bar-fill {
  background: linear-gradient(90deg, var(--warning), #e67e22);
}
.stat-card.secondary .stat-bar-fill {
  background: linear-gradient(90deg, var(--secondary), #5a6268);
}

/* Filters */
.filters-container {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 160px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 10px 14px;
  border: 2px solid #D9D9D9;
  border-radius: 10px;
  background: var(--white);
  font-size: 13px;
  color: var(--gray-800);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.filter-select:hover {
  border-color: #c0c0c0;
}

.filter-select:focus {
  outline: none;
  border-color: #807f7f;
}

.clear-btn {
  padding: 10px 16px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  background: var(--white);
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  white-space: nowrap;
}

/* Data Table */
.data-table-container {
  background: var(--white);
  border-radius: 10px;
  border: 1px solid var(--gray-200);
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr;
  gap: 14px;
  padding: 16px 20px;
  background:#F5F5F5 !important;
  border-bottom: 2px solid var(--gray-200);
  font-size: 14px;
  font-weight: bold;
  color: var(--gray-600);
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

.col-control,
.col-domain,
.col-status,
.col-number {
  display: flex;
  align-items: center;
  font-weight: 700;
}

.col-number {
  justify-content: center;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-100);
  font-size: 13px;
  color: var(--gray-800);
  transition: all 0.3s;
  position: relative;
}

.table-row:hover {
  background: var(--gray-50);
  transform: translateX(3px);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.table-row:last-child {
  border-bottom: none;
}

/* Row status colors */
.table-row.row-success {
  border-left: 3px solid var(--success);
}

.table-row.row-danger {
  border-left: 3px solid var(--danger);
}

.table-row.row-warning {
  border-left: 3px solid var(--warning);
}

.table-row.row-secondary {
  border-left: 3px solid var(--secondary);
}

.table-row.row-info {
  border-left: 3px solid var(--info);
}

.row-icon {
  color: var(--primary);
  font-size: 14px;
  margin-right: 10px;
}

.control-name {
  font-weight: 600;
  color: var(--gray-800);
}

.domain-badge {
  padding: 5px 10px;
  background: linear-gradient(135deg, var(--info), #2980b9);
  color: white;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.status-success {
  background: linear-gradient(135deg, var(--success), #27ae60);
  color: white;
}

.status-danger {
  background: linear-gradient(135deg, var(--danger), #c0392b);
  color: white;
}

.status-warning {
  background: linear-gradient(135deg, var(--warning), #e67e22);
  color: white;
}

.status-secondary {
  background: linear-gradient(135deg, var(--secondary), #5a6268);
  color: white;
}

.status-info {
  background: linear-gradient(135deg, var(--info), #2980b9);
  color: white;
}

.number-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.number-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-800);
  padding: 5px 10px;
  background: var(--gray-100);
  border-radius: 6px;
  min-width: 36px;
  text-align: center;
}

/* No Data */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 14px;
  color: var(--gray-400);
}

.no-data-icon {
  font-size: 50px;
  margin-bottom: 14px;
  opacity: 0.5;
}

.no-data h3 {
  color: var(--gray-500);
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.no-data p {
  color: var(--gray-400);
  margin: 0;
  font-size: 13px;
}

/* Pagination */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  flex-wrap: wrap;
  gap: 14px;
}

.pagination-info {
  font-size: 13px;
  color: var(--gray-600);
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  background: var(--white);
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(67, 97, 238, 0.2);
}

.page-btn.active {
  background: #6E3894;
  border-color: var(--primary);
  color: var(--white);
  font-weight: 700;
  box-shadow: 0 3px 12px rgba(67, 97, 238, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.nav-btn {
  font-size: 11px;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--gray-600);
  font-weight: 500;
}

.per-page-select {
  padding: 6px 10px;
  border: 2px solid var(--gray-200);
  border-radius: 6px;
  background: var(--white);
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.per-page-select:hover {
  border-color: var(--primary);
}

.per-page-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .fullscreen-container {
    width: 98vw;
    height: 98vh;
  }

  .statistics-container {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .overview-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

@media (max-width: 768px) {
  .content-header,
  .content-body {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .filters-container {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .data-table-container {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 700px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 14px;
  }

  .pagination-info,
  .pagination-controls {
    justify-content: center;
  }

  .per-page-selector {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .modal-title {
    font-size: 16px;
  }

  .section {
    padding: 20px;
  }

  .stat-value,
  .overview-value {
    font-size: 22px;
  }

  .glass-card {
    padding: 16px;
  }

  .overview-card {
    flex-direction: column;
    text-align: center;
  }
}

/* Scrollbar Styling */
.content-body::-webkit-scrollbar {
  width: 6px;
}

.content-body::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 3px;
}

.content-body::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary), #5a67d8);
  border-radius: 3px;
}

.content-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8, #4c51bf);
}
</style>
