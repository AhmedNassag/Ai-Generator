<template>
  <div class="dashboard-container">
    <!-- MainPage component for breadcrumb functionality only -->
    <main-page ref="page" :isFlipped="false" :mainPage="$t('framework.Configuration')"
      :mainSubPage="$t('framework.Regulators')" :subPage="framework
        ? $t('framework.framework') + ' / ' + framework.title
        : $t('framework.Framework')
        " :titlePage="$t('framework.Regulators_Framework')">
    </main-page>

    <div class="dashboard-content">
      <div class="container-fluid">
        <!-- Status Cards Container -->
        <div class="dashboard-section glass-card">
          <div class="section-header">
            <div class="header-content">
              <div class="header-icon status-icon">
                <i class="fas fa-chart-pie"></i>
              </div>
              <div class="header-text">
                <h2 class="section-title">Implementation Status Overview</h2>
                <p class="section-subtitle">Control implementation status distribution across the framework</p>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <!-- Not Implemented -->
            <div class="stat-card danger">
              <div class="stat-content">
                <div class="stat-header rtl">
                  <div class="stat-icon">
                    <i :class="getStatusIcon('Not Implemented')"></i>
                  </div>
                  <div class="stat-numbers">
                    <div class="stat-value">{{ getStatusCount('Not Implemented') }}</div>
                    <div class="stat-percentage">{{ getStatusPercentage('Not Implemented') }}%</div>
                  </div>
                </div>
                <div class="stat-label">Not Implemented</div>
                <div class="stat-bar">
                  <div class="stat-bar-fill" :style="{ width: getStatusPercentage('Not Implemented') + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Implemented -->
            <div class="stat-card success">
              <div class="stat-content">
                <div class="stat-header rtl">
                  <div class="stat-icon">
                    <i :class="getStatusIcon('Implemented')"></i>
                  </div>
                  <div class="stat-numbers">
                    <div class="stat-value">{{ getStatusCount('Implemented') }}</div>
                    <div class="stat-percentage">{{ getStatusPercentage('Implemented') }}%</div>
                  </div>
                </div>
                <div class="stat-label">Implemented</div>
                <div class="stat-bar">
                  <div class="stat-bar-fill" :style="{ width: getStatusPercentage('Implemented') + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Partially Implemented -->
            <div class="stat-card warning">
              <div class="stat-content">
                <div class="stat-header rtl">
                  <div class="stat-icon">
                    <i :class="getStatusIcon('Partially Implemented')"></i>
                  </div>
                  <div class="stat-numbers">
                    <div class="stat-value">{{ getStatusCount('Partially Implemented') }}</div>
                    <div class="stat-percentage">{{ getStatusPercentage('Partially Implemented') }}%</div>
                  </div>
                </div>
                <div class="stat-label">Partially Implemented</div>
                <div class="stat-bar">
                  <div class="stat-bar-fill" :style="{ width: getStatusPercentage('Partially Implemented') + '%' }">
                  </div>
                </div>
              </div>
            </div>

            <!-- Not Applicable -->
            <div class="stat-card secondary">
              <div class="stat-content">
                <div class="stat-header rtl">
                  <div class="stat-icon">
                    <i :class="getStatusIcon('Not Applicable')"></i>
                  </div>
                  <div class="stat-numbers">
                    <div class="stat-value">{{ getStatusCount('Not Applicable') }}</div>
                    <div class="stat-percentage">{{ getStatusPercentage('Not Applicable') }}%</div>
                  </div>
                </div>
                <div class="stat-label">Not Applicable</div>
                <div class="stat-bar">
                  <div class="stat-bar-fill" :style="{ width: getStatusPercentage('Not Applicable') + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Requirements & Evidence Container -->
        <div class="dashboard-section glass-card">
          <div class="section-header">
            <div class="header-content">
              <div class="header-icon overview-icon">
                <i class="fas fa-clipboard-check"></i>
              </div>
              <div class="header-text">
                <h2 class="section-title">Requirements & Evidence Overview</h2>
                <p class="section-subtitle">Comprehensive tracking of control requirements and supporting evidence</p>
              </div>
            </div>
          </div>

          <!-- Main Metrics Grid -->
          <div class="overview-grid">
            <!-- Total Controls Card -->
            <div class="overview-card primary-card">
              <div class="overview-icon-wrapper">
                <i class="fas fa-shield-alt fs-4"></i>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ requirementWithEvidence.totalFilteredControls || 0 }}</div>
                <div class="overview-label">Total Controls</div>
              </div>
            </div>

            <!-- Controls with Requirements -->
            <div class="overview-card info-card">
              <div class="overview-icon-wrapper">
                <i class="fas fa-file-alt fs-4"></i>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ requirementWithEvidence.controlsWithRequirements || 0 }}</div>
                <div class="overview-label">With Requirements</div>
                <div class="overview-sublabel">{{ requirementWithEvidence.controlsWithoutRequirements || 0 }} without
                </div>
              </div>
            </div>

            <!-- Total Requirements -->
            <div class="overview-card success-card">
              <div class="overview-icon-wrapper">
                <i class="fas fa-list-check fs-4"></i>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ requirementWithEvidence.totalRequirements || 0 }}</div>
                <div class="overview-label">Total Requirements</div>
              </div>
            </div>

            <!-- Controls with Evidence -->
            <div class="overview-card warning-card">
              <div class="overview-icon-wrapper">
                <i class="fas fa-check-circle fs-4"></i>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ requirementWithEvidence.controlsWithEvidence || 0 }}</div>
                <div class="overview-label">With Evidence</div>
                <div class="overview-sublabel">{{ requirementWithEvidence.controlsWithoutEvidence || 0 }} without</div>
              </div>
            </div>

            <!-- Total Evidences -->
            <div class="overview-card purple-card">
              <div class="overview-icon-wrapper">
                <i class="fas fa-folder-open fs-4"></i>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ requirementWithEvidence.totalEvidences || 0 }}</div>
                <div class="overview-label">Total Evidence</div>
              </div>
            </div>

            <!-- Compliance Score Card -->
            <div class="overview-card gray-card">
              <div class="overview-icon-wrapper">
                <i class="fas fa-chart-line fs-4"></i>
              </div>
              <div class="overview-content">
                <div class="overview-value">{{ getOverallComplianceScore() }}%</div>
                <div class="overview-label">Compliance Score</div>
              </div>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="summary-row">
            <div class="summary-card glass-mini">
              <div class="summary-header">
                <div class="summary-icon">
                  <i class="fas fa-clipboard-list"></i>
                </div>
                <h3>Requirements Coverage</h3>
              </div>
              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">Coverage Rate</span>
                  <span class="stat-value text-success">{{ getRequirementPercentage() }}%</span>
                </div>
                <div class="summary-stat">
                  <span class="stat-label">Avg. per Control</span>
                  <span class="stat-value">{{ getAvgRequirementsPerControl() }}</span>
                </div>
              </div>
            </div>

            <div class="summary-card glass-mini">
              <div class="summary-header">
                <div class="summary-icon icon-purple">
                  <i class="fas fa-folder-tree"></i>
                </div>
                <h3>Evidence Collection</h3>
              </div>
              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">Collection Rate</span>
                  <span class="stat-value text-success">{{ getEvidencePercentage() }}%</span>
                </div>
                <div class="summary-stat">
                  <span class="stat-label">Avg. per Control</span>
                  <span class="stat-value">{{ getAvgEvidencePerControl() }}</span>
                </div>
              </div>
            </div>

            <div class="summary-card glass-mini">
              <div class="summary-header">
                <div class="summary-icon icon-warning">
                  <i class="fas fa-tasks"></i>
                </div>
                <h3>Action Items</h3>
              </div>
              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">Missing Requirements</span>
                  <span class="stat-value text-danger">{{ requirementWithEvidence.controlsWithoutRequirements || 0
                  }}</span>
                </div>
                <div class="summary-stat">
                  <span class="stat-label">Missing Evidence</span>
                  <span class="stat-value text-danger">{{ requirementWithEvidence.controlsWithoutEvidence || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gap Analysis Chart Container -->
        <div class="dashboard-section glass-card">
          <div class="section-header">
            <div class="header-content">
              <div class="header-icon icon-radar">
                <i class="fas fa-bullseye"></i>
              </div>
              <div class="header-text">
                <h2 class="section-title">Control Maturity Gap Analysis</h2>
                <p class="section-subtitle">Current vs Desired control maturity levels across domains</p>
              </div>
            </div>
          </div>

          <div class="chart-container">
            <div class="chart-card">
              <canvas id="gapAnalysisRadar" ref="radarChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Gap Analysis Table with Tabs -->
        <div class="dashboard-section glass-card">
          <div class="section-header">
            <div class="header-content">
              <div class="header-icon icon-gap">
                <i class="fas fa-balance-scale"></i>
              </div>
              <div class="header-text">
                <h2 class="section-title">Gap Analysis Details</h2>
                <p class="section-subtitle">Detailed control maturity gap analysis by category</p>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="gap-tabs">
            <button class="gap-tab" :class="{ active: activeGapTab === 'BelowMaturity' }"
              @click="activeGapTab = 'BelowMaturity'">
              <i class="fas fa-arrow-down"></i>
              Below Maturity
              <span class="tab-count">{{ gapAnalysisData.BelowMaturity?.length || 0 }}</span>
            </button>
            <button class="gap-tab" :class="{ active: activeGapTab === 'AtMaturity' }"
              @click="activeGapTab = 'AtMaturity'">
              <i class="fas fa-equals"></i>
              At Maturity
              <span class="tab-count">{{ gapAnalysisData.AtMaturity?.length || 0 }}</span>
            </button>
            <button class="gap-tab" :class="{ active: activeGapTab === 'AboveMaturity' }"
              @click="activeGapTab = 'AboveMaturity'">
              <i class="fas fa-arrow-up"></i>
              Above Maturity
              <span class="tab-count">{{ gapAnalysisData.AboveMaturity?.length || 0 }}</span>
            </button>
          </div>

          <!-- Gap Analysis Table -->
          <div class="datatable-container">
            <!-- Search Bar -->
            <div class="search-container">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input type="text" v-model="gapSearchQuery" class="search-input"
                  placeholder="Search by control number, name, phase, or family..." />
                <button v-if="gapSearchQuery" @click="gapSearchQuery = ''" class="clear-search">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="search-results-info" v-if="gapSearchQuery">
                Found {{ filteredGapData.length }} result(s)
              </div>
            </div>

            <div class="table-responsive">
              <table class="gap-table">
                <thead>
                  <tr>
                    <th class="sortable" @click="sortGapTable('control_number')">
                      Control Number
                      <i class="fas fa-sort" :class="getGapSortIcon('control_number')"></i>
                    </th>
                    <th class="sortable" @click="sortGapTable('short_name')">
                      Control Short Name
                      <i class="fas fa-sort" :class="getGapSortIcon('short_name')"></i>
                    </th>
                    <th class="sortable" @click="sortGapTable('control_phase')">
                      Control Phase
                      <i class="fas fa-sort" :class="getGapSortIcon('control_phase')"></i>
                    </th>
                    <th class="sortable" @click="sortGapTable('family')">
                      Control Family
                      <i class="fas fa-sort" :class="getGapSortIcon('family')"></i>
                    </th>
                    <th class="sortable" @click="sortGapTable('current_maturity')">
                      Current Control Maturity
                      <i class="fas fa-sort" :class="getGapSortIcon('current_maturity')"></i>
                    </th>
                    <th class="sortable" @click="sortGapTable('desired_maturity')">
                      Desired Control Maturity
                      <i class="fas fa-sort" :class="getGapSortIcon('desired_maturity')"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="paginatedGapData.length > 0">
                    <tr v-for="(item, index) in paginatedGapData" :key="index" :class="getGapRowClass()">
                      <td class="control-number-cell">
                        <div class="control-number">
                          <i class="fas fa-hashtag"></i>
                          {{ item.control_number || 'N/A' }}
                        </div>
                      </td>
                      <td class="short-name-cell">
                        <div class="short-name">
                          {{ item.short_name || 'N/A' }}
                        </div>
                      </td>
                      <td class="phase-cell">
                        <div class="phase-badge">
                          {{ item.control_phase || 'N/A' }}
                        </div>
                      </td>
                      <td class="family-cell">
                        <div class="family-name" :title="item.family">
                          {{ truncateText(item.family || item.family_short || 'N/A', 50) }}
                        </div>
                      </td>
                      <td class="maturity-cell">
                        <div class="badge badge-info current" :class="getMaturityClass(item.current_maturity)">
                          {{ formatMaturity(item.current_maturity) }}
                        </div>
                      </td>
                      <td class="maturity-cell">
                        <div class="badge badge-info desired" :class="getMaturityClass(item.desired_maturity)">
                          {{ formatMaturity(item.desired_maturity) }}
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="6" class="no-data">
                      <div class="no-data-content">
                        <i class="fas fa-inbox"></i>
                        <h4>No Data Available</h4>
                        <p>No controls found for {{ activeGapTab }} category.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination for Gap Table -->
            <div class="pagination-container" v-if="filteredGapData.length > 0">
              <div class="pagination-info">
                Showing {{ gapStartIndex + 1 }} to {{ gapEndIndex }} of {{ filteredGapData.length }} entries
                <span v-if="gapSearchQuery" class="filter-indicator">(filtered from {{ currentGapData.length }}
                  total)</span>
              </div>
              <div class="pagination-controls">
                <button class="page-btn nav-btn" @click="previousGapPage" :disabled="currentGapPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <div class="page-numbers">
                  <span class="page-info">Page {{ currentGapPage }} of {{ totalGapPages }}</span>
                </div>
                <button class="page-btn nav-btn" @click="nextGapPage" :disabled="currentGapPage === totalGapPages">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Domain Chart -->
        <DomainChart :domainData="domainChart" />

        <!-- Controls & Requirements Datatable Section -->
        <div class="dashboard-section glass-card">
          <div class="section-header">
            <div class="header-content">
              <div class="header-icon">
                <i class="fas fa-table"></i>
              </div>
              <div class="header-text">
                <h2 class="section-title">Controls & Requirements Details</h2>
                <p class="section-subtitle">Comprehensive view of all controls, requirements, and evidence tracking</p>
              </div>
            </div>
          </div>

          <!-- Datatable -->
          <div class="datatable-container">
            <!-- Search Bar -->
            <div class="search-container">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input type="text" v-model="searchQuery" class="search-input"
                  placeholder="Search by control, requirement, responsible, or department..." />
                <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="search-results-info" v-if="searchQuery">
                Found {{ filteredTableData.length }} result(s)
              </div>
            </div>

            <div class="table-responsive">
              <table class="controls-table">
                <thead>
                  <tr>
                    <th class="sortable" @click="sortTable('department')">
                      Department
                      <i class="fas fa-sort" :class="getSortIcon('department')"></i>
                    </th>
                    <th class="sortable" @click="sortTable('control')">
                      Control
                      <i class="fas fa-sort" :class="getSortIcon('control')"></i>
                    </th>
                    <th class="sortable" @click="sortTable('requirement')">
                      Requirement Name
                      <i class="fas fa-sort" :class="getSortIcon('requirement')"></i>
                    </th>
                    <th class="sortable" @click="sortTable('responsible')">
                      Responsible
                      <i class="fas fa-sort" :class="getSortIcon('responsible')"></i>
                    </th>
                    <th class="sortable" @click="sortTable('due_date')">
                      Due Date
                      <i class="fas fa-sort" :class="getSortIcon('due_date')"></i>
                    </th>
                    <th class="sortable" @click="sortTable('evidence_created')">
                      Evidence Created
                      <i class="fas fa-sort" :class="getSortIcon('evidence_created')"></i>
                    </th>
                    <th class="sortable" @click="sortTable('evidence_updated')">
                      Evidence Updated
                      <i class="fas fa-sort" :class="getSortIcon('evidence_updated')"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="tableData.length > 0">
                    <tr v-for="(item, index) in paginatedData" :key="index" :class="getRowClass(item)">
                      <!-- Department -->
                      <td class="department-cell">
                        <div class="department-info">
                          <div v-if="item.requirements && item.requirements.length > 0">
                            <div v-for="(req, reqIndex) in item.requirements" :key="reqIndex" class="requirement-item">
                              <div class="department-name"
                                v-if="req.responsible_type === 'user' || req.responsible_type === 'department_manager'">
                                {{ getDepartmentName(req.responsible_type, req.responsible_id) || 'N/A' }}
                              </div>
                            </div>
                          </div>
                          <div v-else class="no-department">
                            <span class="text-muted">N/A</span>
                          </div>
                        </div>
                      </td>

                      <!-- Control -->
                      <td class="control-cell">
                        <div class="control-info">
                          <div class="control-short">
                            <i class="fas fa-shield-alt row-icon"></i>
                            {{ item.control_short }}
                          </div>
                          <div class="control-desc" :title="item.control_description">
                            {{ truncateText(item.control_description, 60) }}
                          </div>
                        </div>
                      </td>

                      <!-- Requirement Name -->
                      <td class="requirement-cell">
                        <div v-if="item.requirements && item.requirements.length > 0">
                          <div v-for="(req, reqIndex) in item.requirements" :key="reqIndex" class="requirement-item">
                            <div class="req-name">{{ req.name || 'Unnamed Requirement' }}</div>
                            <div class="req-desc" :title="req.description">
                              {{ truncateText(req.description, 40) }}
                            </div>
                          </div>
                        </div>
                        <div v-else class="no-requirements">
                          <span class="badge badge-info">No Requirements</span>
                        </div>
                      </td>

                      <!-- Responsible -->
                      <td class="responsible-cell">
                        <div v-if="item.requirements && item.requirements.length > 0">
                          <div v-for="(req, reqIndex) in item.requirements" :key="reqIndex" class="responsible-item">
                            <div class="responsible-type">
                              <i class="fas fa-user"
                                v-if="req.responsible_type === 'user' || req.responsible_type === 'department_manager'"></i>
                              <i class="fas fa-users" v-else></i>
                              {{ formatResponsibleType(req.responsible_type) }}
                            </div>
                            <div class="responsible-id">
                              {{ getResponsibleName(req.responsible_type, req.responsible_id) }}
                            </div>
                          </div>
                        </div>
                        <div v-else class="no-responsible">
                          <span class="text-muted">N/A</span>
                        </div>
                      </td>

                      <!-- Due Date -->
                      <td class="due-date-cell">
                        <div v-if="item.requirements && item.requirements.length > 0">
                          <div v-for="(req, reqIndex) in item.requirements" :key="reqIndex" class="due-date-item">
                            <div class="due-date" :class="getDueDateClass(req.due_date)">
                              <i class="fas fa-calendar"></i>
                              {{ formatDate(req.due_date) }}
                            </div>
                            <div class="expire-days" v-if="req.expire_days">
                              Expires in {{ req.expire_days }} days
                            </div>
                          </div>
                        </div>
                        <div v-else class="no-due-date">
                          <span class="text-muted">N/A</span>
                        </div>
                      </td>

                      <!-- Evidence Created At -->
                      <td class="evidence-created-cell">
                        <div v-if="item.requirements && item.requirements.length > 0">
                          <div v-for="(req, reqIndex) in item.requirements" :key="reqIndex" class="evidence-dates">
                            <div v-if="req.evidences && req.evidences.length > 0">
                              <div v-for="(evidence, evIndex) in req.evidences" :key="evIndex"
                                class="evidence-date-item">
                                <div class="date-badge">
                                  <i class="fas fa-plus-circle text-success"></i>
                                  {{ formatDate(evidence.created_at) }}
                                </div>
                              </div>
                            </div>
                            <div v-else class="no-evidence">
                              <span class="badge badge-info">No Evidence</span>
                            </div>
                          </div>
                        </div>
                        <div v-else class="no-evidence">
                          <span class="badge badge-info">No Evidence</span>
                        </div>
                      </td>

                      <!-- Evidence Updated At -->
                      <td class="evidence-updated-cell">
                        <div v-if="item.requirements && item.requirements.length > 0">
                          <div v-for="(req, reqIndex) in item.requirements" :key="reqIndex" class="evidence-dates">
                            <div v-if="req.evidences && req.evidences.length > 0">
                              <div v-for="(evidence, evIndex) in req.evidences" :key="evIndex"
                                class="evidence-date-item">
                                <div class="date-badge">
                                  <i class="fas fa-sync-alt text-info"></i>
                                  {{ formatDate(evidence.updated_at) }}
                                </div>
                              </div>
                            </div>
                            <div v-else class="no-evidence">
                              <span class="badge badge-info">No Evidence</span>
                            </div>
                          </div>
                        </div>
                        <div v-else class="no-evidence">
                          <span class="badge badge-info">No Evidence</span>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="9" class="no-data">
                      <div class="no-data-content">
                        <i class="fas fa-inbox"></i>
                        <h4>No Data Available</h4>
                        <p>No controls and requirements data found for the selected framework.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="pagination-container" v-if="filteredTableData.length > 0">
              <div class="pagination-info">
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredTableData.length }} entries
                <span v-if="searchQuery" class="filter-indicator">(filtered from {{ processedTableData.length }}
                  total)</span>
              </div>
              <div class="pagination-controls">
                <button class="page-btn nav-btn" @click="previousPage" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <div class="page-numbers">
                  <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
                </div>
                <button class="page-btn nav-btn" @click="nextPage" :disabled="currentPage === totalPages">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Highcharts from 'highcharts';
import { Chart, registerables } from 'chart.js';
import Frameworks from "@/API/FrameworkDetails/FrameworkDetails";
import auditPlan from "@/API/AuditPlan/AuditPlan";
import control from "@/API/Control/Control";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import { Chart as HighchartsVue } from 'highcharts-vue';
import { useRoute } from 'vue-router';
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import department from "@/API/Department/Department";
import DomainChart from "./DomainChart.vue";

// Register Chart.js components
Chart.register(...registerables);

// Configure Highcharts globally
Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    thousandsSep: ','
  }
});

export default {
  components: {
    MainPage,
    Form,
    DomainChart,
    highcharts: HighchartsVue
  },

  setup() {
    const api = new Frameworks();
    const apiAudit = new auditPlan();
    const apiControl = new control();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];
    const fromFields = [];
    const route = useRoute();
    const userApi = new user();
    const teamApi = new team();
    const departmentApi = new department();

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      apiAudit,
      apiControl,
      route,
      userApi,
      teamApi,
      departmentApi,
    };
  },

  async mounted() {
    await this.fetcTeamAndUsers();
    await this.fetchTotalStatus();
    await this.fetchTotalDataGraphsForFrameOwner();
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      totalStatus: [],
      requirementWithEvidence: {},
      datatableResponse: null,
      tableData: [],
      currentPage: 1,
      itemsPerPage: 10,
      sortField: 'control',
      sortDirection: 'asc',
      loading: false,
      framework: null,
      domainIdToNameMap: {},
      users: [],
      teams: [],
      departments: [],
      gapAnalysis: null,
      radarChartInstance: null,
      statusCounts: {
        'Implemented': 0,
        'Partially Implemented': 0,
        'Not Implemented': 0,
        'Not Applicable': 0
      },
      domainChart: {},
      chartOptions: {
        chart: {
          type: 'column',
          height: 450,
          backgroundColor: 'transparent',
          style: {
            fontFamily: "'Inter', sans-serif"
          }
        },
        title: {
          text: null
        },
        xAxis: {
          categories: [],
          title: {
            text: 'Domains',
            style: {
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280'
            }
          },
          labels: {
            style: {
              fontSize: '13px',
              color: '#374151'
            }
          }
        },
        yAxis: {
          min: -0.2,
          title: {
            text: 'Percentage (%)',
            style: {
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280'
            }
          },
          labels: {
            style: {
              fontSize: '12px',
              color: '#6b7280'
            }
          },
          gridLineColor: '#e5e7eb'
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
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              format: '{y}%',
              style: {
                fontSize: '11px',
                fontWeight: '600',
                textOutline: 'none'
              },
              formatter: function () {
                return this.y > 0 ? this.y + '%' : '';
              }
            },
            borderRadius: 4,
            groupPadding: 0.15,
            pointPadding: 0.05
          }
        },
        tooltip: {
          shared: false,
          useHTML: true,
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderRadius: 8,
          padding: 12,
          style: {
            fontSize: '13px'
          },
          formatter: function () {
            return `
              <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937;">${this.key}</div>
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background-color: ${this.color}; margin-right: 8px;"></span>
                <span style="color: #6b7280;">${this.series.name}:</span>
                <span style="font-weight: 600; margin-left: 4px; color: #1f2937;">${this.y}%</span>
              </div>
            `;
          }
        },
        series: [],
        credits: {
          enabled: false
        }
      },
      // Gap Analysis Table Data
      gapAnalysisData: {
        BelowMaturity: [],
        AtMaturity: [],
        AboveMaturity: []
      },
      activeGapTab: 'AtMaturity',
      currentGapPage: 1,
      itemsPerGapPage: 10,
      gapSortField: 'control_number',
      gapSortDirection: 'asc',
      gapSearchQuery: '',
      searchQuery: '',
      domainChart: {},
    };
  },

  computed: {
    totalControls() {
      return this.totalStatus.length;
    },

    domainMapping() {
      if (!this.datatableResponse || !this.datatableResponse.domains) {
        return {};
      }

      const domains = this.datatableResponse.domains;
      const domainMap = {};

      Object.keys(domains).forEach(domainName => {
        domainMap[domainName] = domainName;
      });

      return domainMap;
    },

    processedTableData() {
      if (!this.datatableResponse || !this.datatableResponse.requirementAndEvidences) {
        return [];
      }

      const controls = this.datatableResponse.requirementAndEvidences.controlsWithRelations || [];

      return controls.map(control => {
        return {
          id: control.id,
          control_short: control.short_name || 'N/A',
          control_number: control.control_number || 'N/A',
          control_description: control.description || '',
          control_status: control.control_status || 'Not Set',
          requirements: control.requirements || [],
          created_at: control.created_at,
          updated_at: control.updated_at,
          control_owner: control.control_owner,
          domain_id: control.domain_id,
          family: control.family,
          framework_id: control.framework_id
        };
      });
    },

    filteredTableData() {
      if (!this.searchQuery) {
        return this.processedTableData;
      }

      const query = this.searchQuery.toLowerCase().trim();
      return this.processedTableData.filter(item => {
        // Search in control fields
        const controlMatch =
          (item.control_short && item.control_short.toLowerCase().includes(query)) ||
          (item.control_number && item.control_number.toLowerCase().includes(query)) ||
          (item.control_description && item.control_description.toLowerCase().includes(query));

        // Search in requirements
        const requirementMatch = item.requirements && item.requirements.some(req =>
          (req.name && req.name.toLowerCase().includes(query)) ||
          (req.description && req.description.toLowerCase().includes(query))
        );

        // Search in responsible
        const responsibleMatch = item.requirements && item.requirements.some(req => {
          const responsibleName = this.getResponsibleName(req.responsible_type, req.responsible_id);
          return responsibleName && responsibleName.toLowerCase().includes(query);
        });

        // Search in department
        const departmentMatch = item.requirements && item.requirements.some(req => {
          const deptName = this.getDepartmentName(req.responsible_type, req.responsible_id);
          return deptName && deptName.toLowerCase().includes(query);
        });

        return controlMatch || requirementMatch || responsibleMatch || departmentMatch;
      });
    },

    sortedData() {
      if (!this.sortField) return this.filteredTableData;

      return [...this.filteredTableData].sort((a, b) => {
        let aValue = this.getNestedValue(a, this.sortField);
        let bValue = this.getNestedValue(b, this.sortField);

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue ? bValue.toLowerCase() : '';
        }

        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    },

    totalPages() {
      return Math.ceil(this.sortedData.length / this.itemsPerPage) || 1;
    },

    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedData.slice(start, end);
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },

    endIndex() {
      return Math.min(this.startIndex + this.itemsPerPage, this.sortedData.length);
    },

    // Gap Analysis Computed Properties
    currentGapData() {
      return this.gapAnalysisData[this.activeGapTab] || [];
    },

    filteredGapData() {
      if (!this.gapSearchQuery) {
        return this.currentGapData;
      }

      const query = this.gapSearchQuery.toLowerCase().trim();
      return this.currentGapData.filter(item => {
        return (
          (item.control_number && item.control_number.toLowerCase().includes(query)) ||
          (item.short_name && item.short_name.toLowerCase().includes(query)) ||
          (item.control_phase && item.control_phase.toLowerCase().includes(query)) ||
          (item.family && item.family.toLowerCase().includes(query)) ||
          (item.family_short && item.family_short.toLowerCase().includes(query))
        );
      });
    },

    sortedGapData() {
      if (!this.gapSortField) return this.filteredGapData;

      return [...this.filteredGapData].sort((a, b) => {
        let aValue = a[this.gapSortField];
        let bValue = b[this.gapSortField];

        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue ? bValue.toLowerCase() : '';
        }

        if (aValue < bValue) return this.gapSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.gapSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    },

    totalGapPages() {
      return Math.ceil(this.sortedGapData.length / this.itemsPerGapPage) || 1;
    },

    paginatedGapData() {
      const start = (this.currentGapPage - 1) * this.itemsPerGapPage;
      const end = start + this.itemsPerGapPage;
      return this.sortedGapData.slice(start, end);
    },

    gapStartIndex() {
      return (this.currentGapPage - 1) * this.itemsPerGapPage;
    },

    gapEndIndex() {
      return Math.min(this.gapStartIndex + this.itemsPerGapPage, this.sortedGapData.length);
    }
  },

  watch: {
    datatableResponse: {
      handler(newVal) {
        if (newVal) {
          this.processTableData();
        }
      },
      immediate: true,
      deep: true
    },
    activeGapTab() {
      // Reset pagination and search when tab changes
      this.currentGapPage = 1;
      this.gapSearchQuery = '';
    },
    searchQuery() {
      // Reset pagination when search query changes
      this.currentPage = 1;
    },
    gapSearchQuery() {
      // Reset pagination when gap search query changes
      this.currentGapPage = 1;
    }
  },

  beforeUnmount() {
    // Destroy radar chart instance on component unmount
    if (this.radarChartInstance) {
      this.radarChartInstance.destroy();
    }
  },

  methods: {
    // Gap Analysis Table Methods
    sortGapTable(field) {
      if (this.gapSortField === field) {
        this.gapSortDirection = this.gapSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.gapSortField = field;
        this.gapSortDirection = 'asc';
      }
    },

    getGapSortIcon(field) {
      if (this.gapSortField !== field) return '';
      return this.gapSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    },

    nextGapPage() {
      if (this.currentGapPage < this.totalGapPages) {
        this.currentGapPage++;
      }
    },

    previousGapPage() {
      if (this.currentGapPage > 1) {
        this.currentGapPage--;
      }
    },

    getGapRowClass() {
      const classes = ['gap-row'];
      if (this.activeGapTab === 'BelowMaturity') {
        classes.push('below-maturity');
      } else if (this.activeGapTab === 'AtMaturity') {
        classes.push('at-maturity');
      } else if (this.activeGapTab === 'AboveMaturity') {
        classes.push('above-maturity');
      }
      return classes.join(' ');
    },

    formatMaturity(value) {
      if (value === null || value === undefined) {
        return 'Not Set';
      }
      return value;
    },

    getMaturityClass(value) {
      if (value === null || value === undefined) {
        return 'maturity-not-set';
      }
      const numValue = parseFloat(value);
      if (numValue >= 4) return 'maturity-high';
      if (numValue >= 2) return 'maturity-medium';
      return 'maturity-low';
    },

    drawGapAnalysisChart(labels, dataset1, dataset2) {
      // Destroy existing chart if it exists
      if (this.radarChartInstance) {
        this.radarChartInstance.destroy();
      }

      const canvas = this.$refs.radarChart;
      if (!canvas) {
        console.error('Radar chart canvas not found');
        return;
      }

      const ctx = canvas.getContext('2d');

      // Store original labels for tooltip
      const originalLabels = [...labels];

      // Shorten labels by extracting English part only
      const shortenedLabels = labels.map(label => {
        const englishMatch = label.match(/[A-Z][a-zA-Z\s\(\)]+/);
        if (englishMatch) {
          let english = englishMatch[0].trim();
          if (english.length > 35) {
            english = english.substring(0, 32) + '...';
          }
          return english;
        }
        return label.length > 35 ? label.substring(0, 32) + '...' : label;
      });

      this.radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: shortenedLabels,
          datasets: [
            {
              label: 'Current Control Maturity',
              data: dataset1,
              backgroundColor: 'rgba(155, 135, 185, 0.4)',
              borderColor: 'rgba(155, 135, 185, 0.8)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(155, 135, 185, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(155, 135, 185, 1)',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true
            },
            {
              label: 'Desired Control Maturity',
              data: dataset2,
              backgroundColor: 'rgba(46, 204, 113, 0.2)',
              borderColor: 'rgba(46, 204, 113, 0.8)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(46, 204, 113, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(46, 204, 113, 1)',
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.2,
          layout: {
            padding: {
              top: 40,
              bottom: 40,
              left: 40,
              right: 40
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                font: {
                  size: 12,
                  family: "'Inter', sans-serif",
                  weight: '500'
                },
                color: '#374151',
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              titleColor: '#1f2937',
              bodyColor: '#6b7280',
              borderColor: '#e5e7eb',
              borderWidth: 2,
              padding: 16,
              displayColors: true,
              boxPadding: 6,
              usePointStyle: true,
              titleFont: {
                size: 14,
                family: "'Inter', sans-serif",
                weight: '700'
              },
              bodyFont: {
                size: 13,
                family: "'cairo', sans-serif",
                weight: '500'
              },
              bodySpacing: 8,
              callbacks: {
                title: function (context) {
                  if (context && context[0]) {
                    const index = context[0].dataIndex;
                    return originalLabels[index] || context[0].label;
                  }
                  return '';
                },
                label: function (context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.r || 0;
                  return label + ': ' + value.toFixed(2);
                },
              }
            }
          },
          scales: {
            r: {
              beginAtZero: false,
              min: -5,
              max: 5,
              ticks: {
                stepSize: 1,
                callback: function (value) {
                  return value;
                },
                font: {
                  size: 10,
                  family: "'Inter', sans-serif"
                },
                color: '#9ca3af',
                backdropColor: 'transparent',
                showLabelBackdrop: false,
                z: 1
              },
              grid: {
                color: '#e5e7eb',
                circular: true,
                lineWidth: 1
              },
              pointLabels: {
                font: {
                  size: 9,
                  family: "'Inter', sans-serif",
                  weight: '500'
                },
                color: '#6b7280',
                padding: 25,
                centerPointLabels: false
              },
              angleLines: {
                color: '#e5e7eb',
                lineWidth: 1
              },
              backgroundColor: '#ffffff'
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          }
        }
      });
    },

    getDepartmentName(type, id) {
      if (!id) return "N/A";

      if (type === "user" || type === "department_manager") {
        const user = this.users.find(
          (u) => String(u.id).trim() === String(id).trim()
        );

        if (user && user.department_id) {
          const department = this.departments.find(
            (d) => String(d.id).trim() === String(user.department_id).trim()
          );
          return department ? department.name : "Unknown Department";
        }

        return "No Department";
      }

      return "N/A";
    },

    processTableData() {
      this.tableData = this.processedTableData;
    },

    sortTable(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },

    getSortIcon(field) {
      if (this.sortField !== field) return '';
      return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    },

    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : '';
      }, obj);
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    truncateText(text, length) {
      if (!text) return '';
      const cleanText = String(text).replace(/<[^>]*>/g, '');
      return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    },

    getDueDateClass(dueDate) {
      if (!dueDate) return '';

      try {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays <= 7) return 'urgent';
        if (diffDays <= 30) return 'upcoming';
        return 'normal';
      } catch (error) {
        return '';
      }
    },

    getStatusClass(status) {
      const statusMap = {
        'Implemented': 'success',
        'Not Implemented': 'danger',
        'Partially Implemented': 'warning',
        'Not Applicable': 'secondary',
        'Not Set': 'secondary'
      };
      return statusMap[status] || 'secondary';
    },

    getRowClass(item) {
      return {
        'row-implemented': item.control_status === 'Implemented',
        'row-not-implemented': item.control_status === 'Not Implemented',
        'row-partial': item.control_status === 'Partially Implemented',
        'row-not-applicable': item.control_status === 'Not Applicable'
      };
    },

    async fetchTotalStatus() {
      try {
        const frameworkId = this.$route.params.id || this.route.params.id;
        let filter = `framework_id|${frameworkId}|=&&parent_id|null-null|=`;
        const response = await this.apiControl.getAll({
          filter: filter,
          select: "id|short_name|control_status",
        });

        this.totalStatus = response || [];
        this.calculateStatusCounts();
      } catch (error) {
        console.error('Error fetching total status:', error);
        this.totalStatus = [];
      }
    },

    async fetchTotalDataGraphsForFrameOwner() {
      try {
        const frameworkId = this.$route.params.id || this.route.params.id;
        const response = await this.api.fetchTotalDataGraphsForFrameOwner(frameworkId);

        if (response && response.data && response.data.data) {
          this.domainChart = response.data.data.domains || {};
          this.requirementWithEvidence = response.data.data.requirementAndEvidences || {};
          this.gapAnalysis = response.data.data.gapAnalysis?.chartData || null;

          // Set Gap Analysis Data
          if (response.data.data.gapAnalysis) {
            this.gapAnalysisData = {
              BelowMaturity: response.data.data.gapAnalysis.BelowMaturity || [],
              AtMaturity: response.data.data.gapAnalysis.AtMaturity || [],
              AboveMaturity: response.data.data.gapAnalysis.AboveMaturity || []
            };
          }

          const dataTableResponse = response.data.data.requirementAndEvidences?.dataTableResponse || [];

          this.datatableResponse = {
            domains: response.data.data.domains || {},
            requirementAndEvidences: {
              ...this.requirementWithEvidence,
              controlsWithRelations: dataTableResponse
            }
          };

          this.buildDomainMapping(dataTableResponse);
          this.prepareChartData();

          // Draw Gap Analysis Radar Chart
          if (this.gapAnalysis && this.gapAnalysis.labels) {
            this.$nextTick(() => {
              this.drawGapAnalysisChart(
                this.gapAnalysis.labels,
                this.gapAnalysis.dataset1,
                this.gapAnalysis.dataset2
              );
            });
          }
        }
      } catch (error) {
        console.error('Error fetching domain chart data:', error);
        this.domainChart = {};
        this.requirementWithEvidence = {};
        this.datatableResponse = null;
        this.gapAnalysis = null;
        this.gapAnalysisData = {
          BelowMaturity: [],
          AtMaturity: [],
          AboveMaturity: []
        };
      }
    },

    async fetcTeamAndUsers() {
      this.users = await this.userApi.getAll({ select: "id|full_name|department_id" });
      this.teams = await this.teamApi.getAll({ select: "id|name" });
      this.departments = await this.departmentApi.getAll({
        select: "id|name",
      });
    },

    buildDomainMapping(controls) {
      if (!controls || controls.length === 0) return;

      const domains = this.domainChart;
      const domainNames = Object.keys(domains);

      controls.forEach(control => {
        if (control.domain_id && !this.domainIdToNameMap[control.domain_id]) {
          for (let domainName of domainNames) {
            const domainData = domains[domainName];
            if (Array.isArray(domainData) && domainData.length > 0) {
              this.domainIdToNameMap[control.domain_id] = domainName;
              break;
            }
          }
        }
      });

      if (Object.keys(this.domainIdToNameMap).length === 0 && domainNames.length > 0) {
        this.domainIdToNameMap['default'] = domainNames[0];
      }
    },

    prepareChartData() {
      if (!this.domainChart || Object.keys(this.domainChart).length === 0) {
        return;
      }

      const labels = Object.keys(this.domainChart);
      const implementedCounts = [];
      const notImplementedCounts = [];
      const notApplicableCounts = [];
      const partiallyImplementedCounts = [];

      labels.forEach(label => {
        const statuses = this.domainChart[label];
        let implementedPercentage = 0;
        let notImplementedPercentage = 0;
        let notApplicablePercentage = 0;
        let partiallyImplementedPercentage = 0;

        if (Array.isArray(statuses)) {
          statuses.forEach(status => {
            const percentage = parseFloat(status.percentage) || 0;

            if (status.status_name === "Implemented") {
              implementedPercentage = percentage;
            } else if (status.status_name === "Not Implemented") {
              notImplementedPercentage = percentage;
            } else if (status.status_name === "Not Applicable") {
              notApplicablePercentage = percentage;
            } else if (status.status_name === "Partially Implemented") {
              partiallyImplementedPercentage = percentage;
            }
          });
        }

        implementedCounts.push(implementedPercentage);
        notImplementedCounts.push(notImplementedPercentage);
        notApplicableCounts.push(notApplicablePercentage);
        partiallyImplementedCounts.push(partiallyImplementedPercentage);
      });

      this.chartOptions.xAxis.categories = labels;
      this.chartOptions.series = [
        {
          name: 'Implemented',
          color: '#27ae60', // darker green
          data: implementedCounts
        },
        {
          name: 'Not Implemented',
          color: '#c0392b', // darker red
          data: notImplementedCounts
        },
        {
          name: 'Not Applicable',
          color: '#4b5563', // darker gray
          data: notApplicableCounts
        },
        {
          name: 'Partially Implemented',
          color: '#d68910', // darker orange
          data: partiallyImplementedCounts
        }
      ];


      if (this.$refs.domainChart) {
        this.$nextTick(() => {
          if (this.$refs.domainChart && this.$refs.domainChart.chart) {
            this.$refs.domainChart.chart.redraw();
          }
        });
      }
    },

    formatResponsibleType(type) {
      switch (type) {
        case "user":
          return "User";
        case "department_manager":
          return "Department Manager";
        case "team":
          return "Team";
        default:
          return "N/A";
      }
    },

    getResponsibleName(type, id) {
      if (!id) return "Not Assigned";
      if (type === "user" || type === "department_manager") {
        const user = this.users.find((u) => u.id === id);
        return user ? user.full_name : "Unknown User";
      } else {
        const team = this.teams.find((t) => t.id === id);
        return team ? team.name : "Unknown Team";
      }
    },

    calculateStatusCounts() {
      this.statusCounts = {
        'Implemented': 0,
        'Partially Implemented': 0,
        'Not Implemented': 0,
        'Not Applicable': 0
      };

      this.totalStatus.forEach(control => {
        const status = control.control_status;
        if (this.statusCounts.hasOwnProperty(status)) {
          this.statusCounts[status]++;
        }
      });
    },

    getStatusCount(status) {
      return this.statusCounts[status] || 0;
    },

    getStatusPercentage(status) {
      if (this.totalControls === 0) return '0.0';
      const count = this.getStatusCount(status);
      const percentage = (count / this.totalControls) * 100;
      return percentage.toFixed(1);
    },

    getStatusIcon(status) {
      const iconMap = {
        'Implemented': 'fas fa-check',
        'Not Implemented': 'fas fa-exclamation-triangle',
        'Partially Implemented': 'fas fa-clock',
        'Not Applicable': 'fas fa-minus-circle',
        'Not Set': 'fas fa-question-circle'
      };
      return iconMap[status] || 'fas fa-question-circle';
    },

    getRequirementPercentage() {
      const total = this.requirementWithEvidence.totalFilteredControls || 0;
      const withReq = this.requirementWithEvidence.controlsWithRequirements || 0;
      if (total === 0) return 0;
      return ((withReq / total) * 100).toFixed(1);
    },

    getEvidencePercentage() {
      const total = this.requirementWithEvidence.totalFilteredControls || 0;
      const withEvidence = this.requirementWithEvidence.controlsWithEvidence || 0;
      if (total === 0) return 0;
      return ((withEvidence / total) * 100).toFixed(1);
    },

    getOverallComplianceScore() {
      const reqPercent = parseFloat(this.getRequirementPercentage()) || 0;
      const evidencePercent = parseFloat(this.getEvidencePercentage()) || 0;
      return ((reqPercent + evidencePercent) / 2).toFixed(1);
    },

    getAvgRequirementsPerControl() {
      const controls = this.requirementWithEvidence.controlsWithRequirements || 0;
      const total = this.requirementWithEvidence.totalRequirements || 0;
      if (controls === 0) return '0.0';
      return (total / controls).toFixed(1);
    },

    getAvgEvidencePerControl() {
      const controls = this.requirementWithEvidence.controlsWithEvidence || 0;
      const total = this.requirementWithEvidence.totalEvidences || 0;
      if (controls === 0) return '0.0';
      return (total / controls).toFixed(1);
    },

    getScoreColor(score) {
      const numScore = parseFloat(score) || 0;
      if (numScore >= 80) return '#2ecc71';
      if (numScore >= 60) return '#3498db';
      if (numScore >= 40) return '#f39c12';
      return '#e74c3c';
    },

    getScoreGradient(score) {
      const numScore = parseFloat(score) || 0;
      if (numScore >= 80) return 'linear-gradient(90deg, #2ecc71, #27ae60)';
      if (numScore >= 60) return 'linear-gradient(90deg, #3498db, #2980b9)';
      if (numScore >= 40) return 'linear-gradient(90deg, #f39c12, #e67e22)';
      return 'linear-gradient(90deg, #e74c3c, #c0392b)';
    }
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

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
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}

/* Base Styles */
.dashboard-container {
  background: #f2f2f2;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.dashboard-content {
  padding: 24px 0;
}

.container-fluid {
  /* max-width: 1400px;
  margin: 0 auto; */
  padding: 0 20px;
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 0 0 20px 0;
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--purple));
  border-radius: 12px 12px 0 0;
}

.glass-mini {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-mini::before {
  height: 2px;
}

/* Section Header */
.section-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), #5a67d8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 6px 18px rgba(67, 97, 238, 0.3);
}

.header-icon.status-icon {
  background: linear-gradient(135deg, var(--primary), #5a67d8);
}

.header-icon.overview-icon {
  background: linear-gradient(135deg, var(--purple), #8e44ad);
}

.header-icon.controls-icon {
  background: linear-gradient(135deg, var(--success), #27ae60);
}

.header-icon.icon-radar {
  background: linear-gradient(135deg, var(--info), #2980b9);
}

.header-icon.icon-gap {
  background: linear-gradient(135deg, var(--warning), #e67e22);
}

.header-text {
  flex: 1;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 13px;
  color: #8C8C8C;
  margin: 0;
  font-weight: 400;
}

/* Gap Analysis Tabs */
.gap-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--gray-200);
  padding-bottom: 0;
}

.gap-tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  margin-bottom: -2px;
}

.gap-tab i {
  font-size: 14px;
}

.gap-tab:hover {
  color: var(--primary);
  background: var(--gray-50);
}

.gap-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--gray-50);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--primary);
  color: red;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.gap-tab.active .tab-count {
  color: red;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.4);
}

/* Gap Analysis Table */
.gap-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.gap-table thead {
  background: #F5F5F5 !important;
  border-bottom: 2px solid var(--gray-200);
}

.gap-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  color: var(--gray-600);
  text-transform: capitalize;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.gap-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.gap-table th.sortable:hover {
  background: var(--gray-100);
}

.gap-table th i {
  margin-left: 6px;
  font-size: 10px;
  opacity: 0.6;
}

.gap-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-100);
  font-size: 13px;
  color: var(--gray-800);
}

.gap-table tbody tr {
  transition: all 0.3s;
  position: relative;
}

.gap-table tbody tr:hover {
  background: var(--gray-50);
  transform: translateX(3px);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.gap-table tbody tr:last-child td {
  border-bottom: none;
}

/* Gap Row Classes */
.gap-row.below-maturity {
  border-left: 4px solid var(--danger);
}

.gap-row.at-maturity {
  border-left: 4px solid var(--success);
}

.gap-row.above-maturity {
  border-left: 4px solid var(--info);
}

/* Gap Table Cell Styles */
.control-number-cell .control-number {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--gray-900);
}

.control-number-cell i {
  color: var(--primary);
  font-size: 12px;
}

.short-name-cell .short-name {
  font-weight: 600;
  color: var(--gray-900);
}

.phase-cell .phase-badge {
  display: inline-block;
  padding: 6px 12px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.family-cell .family-name {
  color: var(--gray-700);
  font-size: 13px;
  line-height: 1.4;
}

.maturity-cell {
  text-align: center;
}

.maturity-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  min-width: 80px;
}

.maturity-badge.maturity-high {
  background: linear-gradient(135deg, var(--success), #27ae60);
  color: #000000;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}

.maturity-badge.maturity-medium {
  background: linear-gradient(135deg, var(--warning), #e67e22);
  color: #000000;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
}

.maturity-badge.maturity-low {
  background: linear-gradient(135deg, var(--danger), #c0392b);
  color: #000000;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.maturity-badge.maturity-not-set {
  background: rgb(255, 255, 255);
  color: #181819;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
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
  color: var(--gray-900);
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
  margin-bottom: 10px;
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
  color: var(--gray-800);
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

/* Summary Row */
.summary-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--purple));
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-200);
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary), #5a67d8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.summary-icon.icon-purple {
  background: linear-gradient(135deg, var(--purple), #8e44ad);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
}

.summary-icon.icon-warning {
  background: linear-gradient(135deg, var(--warning), #e67e22);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

.summary-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-stat .stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-600);
}

.summary-stat .stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
}

.text-success {
  color: var(--success) !important;
}

.text-danger {
  color: var(--danger) !important;
}

.text-info {
  color: var(--info) !important;
}

/* Radar Chart Canvas */
#gapAnalysisRadar {
  max-height: 600px;
  width: 100% !important;
  height: auto !important;
}

/* Chart Container */
.chart-container {
  margin-top: 16px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
}

.chart-card canvas {
  background: #ffffff;
  border-radius: 8px;
}

/* Datatable */
.datatable-container {
  margin-top: 16px;
}

.table-responsive {
  overflow: auto;
  border-radius: 10px;
  border: 1px solid var(--gray-200);
  background: white;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
}

.controls-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.controls-table thead {
  background: #F5F5F5 !important;
  border-bottom: 2px solid var(--gray-200);
}

.controls-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  color: var(--gray-600);
  text-transform: capitalize;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.controls-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.controls-table th.sortable:hover {
  background: var(--gray-100);
}

.controls-table th i {
  margin-left: 6px;
  font-size: 10px;
  opacity: 0.6;
}

.controls-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-100);
  font-size: 13px;
  color: var(--gray-800);
}

.controls-table tbody tr {
  transition: all 0.3s;
  position: relative;
}

.controls-table tbody tr:hover {
  background: var(--gray-50);
  transform: translateX(3px);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.controls-table tbody tr:last-child td {
  border-bottom: none;
}

/* Table Cell Styles */
.department-info,
.control-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.department-name,
.control-short {
  font-weight: 600;
  color: var(--gray-900);
}

.control-short {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-icon {
  color: var(--primary);
  font-size: 14px;
}

.control-number,
.control-desc {
  font-size: 12px;
  color: var(--gray-600);
}

.requirement-item,
.responsible-item,
.due-date-item,
.evidence-date-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-100);
}

.requirement-item:last-child,
.responsible-item:last-child,
.due-date-item:last-child,
.evidence-date-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.req-name,
.responsible-type {
  font-weight: 600;
  color: var(--gray-900);
  font-size: 13px;
}

.req-desc,
.responsible-id {
  font-size: 12px;
  color: var(--gray-600);
  margin-top: 2px;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.due-date i {
  font-size: 12px;
}

.due-date.overdue {
  color: var(--danger);
}

.due-date.urgent {
  color: var(--warning);
}

.due-date.upcoming {
  color: var(--info);
}

.due-date.normal {
  color: var(--gray-600);
}

.expire-days {
  font-size: 11px;
  color: var(--gray-500);
  margin-top: 4px;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-700);
}

.date-badge i {
  font-size: 11px;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
}

.badge-warning {
  background: linear-gradient(135deg, var(--warning), #e67e22);
  color: white;
}

.badge-info {
  background: rgb(255, 255, 255);
  color: #181819;
}

.no-requirements,
.no-responsible,
.no-due-date,
.no-evidence,
.no-department {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.text-muted {
  color: var(--gray-400);
}

/* No Data */
.no-data {
  text-align: center;
  padding: 60px 20px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.no-data-content i {
  font-size: 50px;
  color: var(--gray-300);
  opacity: 0.5;
}

.no-data-content h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-500);
  margin: 0;
}

.no-data-content p {
  font-size: 13px;
  color: var(--gray-400);
  margin: 0;
}

/* Row Status Colors */
.row-implemented {
  border-left: 3px solid var(--success);
}

.row-not-implemented {
  border-left: 3px solid var(--danger);
}

.row-partial {
  border-left: 3px solid var(--warning);
}

.row-not-applicable {
  border-left: 3px solid var(--secondary);
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
  gap: 8px;
  align-items: center;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  background: white;
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

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.nav-btn {
  font-size: 11px;
}

.page-numbers {
  padding: 0 12px;
}

.page-info {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
}

/* Responsive Design */
@media (max-width: 1199px) {

  .stats-grid,
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 991px) {

  .stats-grid,
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {

  .stats-grid,
  .overview-grid,
  .summary-row {
    grid-template-columns: 1fr;
  }

  .controls-table,
  .gap-table {
    min-width: 1200px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content {
    width: 100%;
  }

  .gap-tabs {
    flex-direction: column;
  }

  .gap-tab {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .container-fluid {
    padding: 0 12px;
  }

  .glass-card {
    padding: 16px;
  }

  .section-title {
    font-size: 18px;
  }

  .section-subtitle {
    font-size: 12px;
  }

  .header-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .stat-value,
  .overview-value {
    font-size: 22px;
  }
}

/* Hide flip container */
.flip-container {
  display: none !important;
}

.fa-solid,
.fas {
  color: black;
}

/* FontAwesome fs-4 helper */
.fs-4 {
  font-size: 20px !important;
}
</style>
<style>
/* Main container styling */
.flip-container {
  display: none !important;
}
</style>