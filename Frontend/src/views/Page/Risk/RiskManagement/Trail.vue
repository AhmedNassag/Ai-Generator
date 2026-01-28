<template>
  <div class="audit-trail-wrapper">
    <!-- Header -->
    <div class="audit-trail-header">
      <div class="header-content">
        <h2 class="audit-trail-title">Audit Trail</h2>
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" class="refresh-btn" @click="fetchLogs" :loading="loading">
          <v-icon size="18" class="me-1">mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- Data Table -->
    <div class="audit-trail-datatable">
      <v-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        class="elevation-0 audit-table"
        :items-per-page-options="[5, 10, 15, 20]"
        @update:page="currentPage = $event"
        @update:items-per-page="itemsPerPage = $event"
      >
        <!-- Loading -->
        <template v-slot:loading>
          <div class="table-loading">
            <v-progress-circular indeterminate color="#7C3AED" size="50"></v-progress-circular>
            <p class="loading-text">Loading audit trail...</p>
          </div>
        </template>

        <!-- Event Column -->
        <template v-slot:item.event="{ item }">
          <div class="event-cell">
            <div class="event-icon-wrapper" :style="{ backgroundColor: getEventColorLight(item.action) }">
              <v-icon :icon="getEventIcon(item.action)" size="18" :color="getEventColor(item.action)"></v-icon>
            </div>
            <div class="event-text">
              <span class="event-title">{{ getEventDescription(item) }}</span>
              <span class="event-subtitle">{{ item.service_name || 'System Action' }}</span>
            </div>
          </div>
        </template>

        <!-- User Column -->
        <template v-slot:item.user="{ item }">
          <div class="user-cell">
            <div class="user-avatar" :style="{ background: getUserColor(item.user_id) }">
              {{ getInitials(getUserFullName(item.user_id)) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ getUserFullName(item.user_id) }}</span>
              <span class="user-meta">{{ item.browser }} • {{ item.operating_system }}</span>
            </div>
          </div>
        </template>

        <!-- Date Column -->
        <template v-slot:item.date="{ item }">
          <div class="date-cell">
            <div class="date-content">
              <v-icon size="16" color="#9CA3AF" class="me-1">mdi-calendar-outline</v-icon>
              <span class="date-text">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="time-content">
              <v-icon size="16" color="#9CA3AF" class="me-1">mdi-clock-outline</v-icon>
              <span class="time-text">{{ formatTime(item.created_at) }}</span>
            </div>
          </div>
        </template>

        <!-- Type Column -->
        <template v-slot:item.type="{ item }">
          <div class="type-cell">
            <span class="type-badge" :class="getTypeBadgeClass(item.action)">
              <v-icon :icon="getTypeBadgeIcon(item.action)" size="14" class="me-1"></v-icon>
              {{ formatActionType(item.action) }}
            </span>
          </div>
        </template>

        <!-- IP Address Column -->
        <template v-slot:item.ip="{ item }">
          <div class="ip-cell">
            <v-icon size="16" color="#6B7280" class="me-1">mdi-map-marker-outline</v-icon>
            <span class="ip-text">{{ item.ip_address || 'N/A' }}</span>
          </div>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="actions-cell">
            <v-btn icon variant="text" size="small" class="action-btn" @click="viewDetails(item)">
              <v-icon size="18">mdi-eye-outline</v-icon>
              <v-tooltip activator="parent" location="top">View Details</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- No Data -->
        <template v-slot:no-data>
          <div class="no-data-container">
            <div class="no-data-icon">
              <v-icon size="64" color="#E5E7EB">mdi-file-document-outline</v-icon>
            </div>
            <h3 class="no-data-title">No Audit Logs Yet</h3>
            <p class="no-data-text">Audit trail entries will appear here when actions are performed on this risk</p>
            <v-btn variant="outlined" color="#7C3AED" class="mt-4" @click="fetchLogs">
              <v-icon size="18" class="me-1">mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </div>
        </template>

        <!-- Pagination -->
        <template v-slot:bottom>
          <div class="table-footer">
            <div class="footer-info">
              <span class="footer-text">
                Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to 
                {{ Math.min(currentPage * itemsPerPage, logs.length) }} of 
                {{ logs.length }} entries
              </span>
            </div>
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(logs.length / itemsPerPage)"
              :total-visible="5"
              class="custom-pagination"
            ></v-pagination>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="800px">
      <v-card class="details-card">
        <v-card-title class="details-header">
          <span class="details-title">Audit Log Details</span>
          <v-btn icon variant="text" @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="details-content">
          <div v-if="selectedLog" class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Action</span>
              <span class="detail-value">{{ getEventDescription(selectedLog) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">User</span>
              <span class="detail-value">{{ getUserFullName(selectedLog.user_id) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date & Time</span>
              <span class="detail-value">{{ formatDate(selectedLog.created_at) }} at {{ formatTime(selectedLog.created_at) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">IP Address</span>
              <span class="detail-value">{{ selectedLog.ip_address }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Browser</span>
              <span class="detail-value">{{ selectedLog.browser }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Operating System</span>
              <span class="detail-value">{{ selectedLog.operating_system }}</span>
            </div>
            <div class="detail-item full-width" v-if="formatChanges(selectedLog).length > 0">
              <span class="detail-label">Changes Made</span>
              <div class="changes-list">
                <div v-for="(change, index) in formatChanges(selectedLog)" :key="index" class="change-item">
                  <div class="change-header">
                    <v-icon size="16" color="#7C3AED">mdi-pencil</v-icon>
                    <span class="change-field">{{ change.field }}</span>
                  </div>
                  <div class="change-values">
                    <div class="change-value old-value">
                      <span class="value-label">Before:</span>
                      <span class="value-content">{{ change.oldValue }}</span>
                    </div>
                    <v-icon size="16" color="#9CA3AF">mdi-arrow-right</v-icon>
                    <div class="change-value new-value">
                      <span class="value-label">After:</span>
                      <span class="value-content">{{ change.newValue }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="detail-item full-width" v-else>
              <div class="no-changes">
                <v-icon size="48" color="#E5E7EB">mdi-information-outline</v-icon>
                <p class="no-changes-text">No specific changes recorded for this action</p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { notify } from '@kyvg/vue3-notification';
import LogAPI from '@/API/Log/Log';

export default {
  name: 'AuditTrailComponent',
  props: {
    rowData: {
      type: Object,
      required: true
    },
    dropdownOptions: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    userOptions() {
      return this.dropdownOptions.userOptions || [];
    }
  },
  data() {
    return {
      logApi: new LogAPI(),
      logs: [],
      loading: false,
      currentPage: 1,
      itemsPerPage: 5,
      detailsDialog: false,
      selectedLog: null,
      headers: [
        { title: 'Event', key: 'event', sortable: true, width: '30%' },
        { title: 'User', key: 'user', sortable: true, width: '25%' },
        { title: 'Date & Time', key: 'date', sortable: true, width: '20%' },
        { title: 'Type', key: 'type', sortable: true, width: '12%' },
        { title: 'IP Address', key: 'ip', sortable: false, width: '13%' },
        { title: '', key: 'actions', sortable: false, align: 'center' }
      ]
    };
  },
  mounted() {
    this.fetchLogs();
  },
  methods: {
    async fetchLogs() {
      try {
        this.loading = true;
        const logsResponse = await this.logApi.getAll({
          filter: `class|Risk|=&&data.id|${this.rowData.id}|=`,
          orderBy: "created_at|desc",
        });
        
        if (logsResponse && Array.isArray(logsResponse)) {
          this.logs = logsResponse;
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
        notify({
          title: 'Error',
          text: 'Failed to fetch audit logs',
          type: 'error'
        });
      } finally {
        this.loading = false;
      }
    },

    viewDetails(log) {
      this.selectedLog = log;
      this.detailsDialog = true;
    },

    formatChanges(log) {
      if (!log.data || !log.old_data) {
        return [];
      }

      const changes = [];
      
      // Comprehensive field labels mapping
      const fieldLabels = {
        // Step 1 - Risk Identification
        'risk_number': 'Risk Number',
        'subject': 'Risk Subject',
        'risk_mapping_ids': 'Risk Catalog',
        'threat_mapping_ids': 'Threats Catalog',
        'category_id': 'Risk Category',
        'location_ids': 'Locations',
        'stakeholder_ids': 'Stakeholders',
        'owner_id': 'Risk Owner',
        'tag_ids': 'Tags',
        'team_ids': 'Teams',
        'reference_id': 'Reference ID',
        
        // Step 2 - Risk Analysis
        'regulator_id': 'Regulator',
        'control_id': 'Controls',
        'asset_ids': 'Assets',
        'technology_ids': 'Technology',
        'impact_scope_id': 'Impact Scope',
        'current_impact': 'Current Impact',
        'current_likelihood': 'Current Likelihood',
        'risk_sorting_method': 'Risk Sorting Method',
        'responsible_party': 'Responsible Party',
        'kris': 'KRIS',
        'supporting_document': 'Supporting Document',
        'description': 'Description',
        'risk_scenario': 'Risk Scenario',
        'vuln_catalogs': 'Vulnerability Catalogs',
        'existing_control': 'Existing Control',
        'selected_levels': 'Selected Risk Levels',
        
        // Step 3 - Risk Treatment
        'mitigation_status': 'Mitigation Status',
        'accepting_justification': 'Accepting Justification',
        'mitigation_planing': 'Mitigation Planning',
        'mitigation_effort_id': 'Mitigation Effort',
        'mitigation_owner_id': 'Mitigation Owner',
        'mitigation_cost': 'Mitigation Cost',
        'mitigation_percent': 'Mitigation Percentage',
        'mitigation_team_ids': 'Mitigation Teams',
        'current_solution': 'Current Solution',
        'mitigation_control_ids': 'Mitigation Controls',
        'security_recommendations': 'Security Recommendations',
        'security_requirements': 'Security Requirements',
        'accept_mitigation': 'Accept Mitigation',
        'selected_treatment_decision': 'Treatment Decision',
        'counter_party': 'Counter Party',
        'coverage_percent': 'Coverage Percentage',
        'avoiding_action': 'Avoiding Action',
        'effective_date': 'Effective Date',
        'operational_impact': 'Operational Impact',
        
        // Step 4 - Risk Review
        'review_status': 'Review Status',
        'reviews': 'Review History',
        
        // Risk Status & Closure
        'status': 'Risk Status',
        'reason_close': 'Close Reason',
        'close_out_information': 'Close Out Information',
        'closed_by': 'Closed By',
        'closed_at': 'Closed At',
        'questionnaire_ids': 'Questionnaires',
        
        // Treatment Update
        'requires_treatment_update': 'Requires Treatment Update',
        'treatment_update_status': 'Treatment Update Status'
      };

      // Fields to exclude from display (technical/internal fields)
      const excludeFields = [
        'id', '_id', 'created_at', 'updated_at', 'created_by', 
        'full_supporting_document_file_path', 'token', 
        'service_name', 'ip_address', 'operating_system', 
        'browser', 'user_id', 'class', 'action', '$oid', '$date'
      ];

      // Compare old and new data
      for (const key in log.data) {
        if (excludeFields.includes(key)) continue;
        
        const oldValue = log.old_data[key];
        const newValue = log.data[key];
        
        // Check if values are different
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            field: fieldLabels[key] || this.formatFieldName(key),
            oldValue: this.formatValue(oldValue, key),
            newValue: this.formatValue(newValue, key)
          });
        }
      }

      return changes;
    },

    formatFieldName(field) {
      return field
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    },

    formatValue(value, fieldKey) {
      if (value === null || value === undefined) {
        return 'Not Set';
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        // Filter out non-null values
        const validValues = value.filter(v => v !== null && v !== undefined && v !== '[' && v !== ']');
        
        if (validValues.length === 0) return 'None';
        
        // For selected_levels, show count of levels
        if (fieldKey === 'selected_levels') {
          return `${validValues.length} level(s) selected`;
        }
        
        // For review arrays
        if (fieldKey === 'reviews') {
          return `${validValues.length} review(s)`;
        }
        
        // For other ID arrays
        return `${validValues.length} item(s)`;
      }
      
      // Handle boolean values
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      // Handle specific field types
      switch (fieldKey) {
        case 'mitigation_status':
          return this.formatMitigationStatus(value);
        case 'status':
          return this.formatRiskStatus(value);
        case 'selected_treatment_decision':
          return this.formatTreatmentDecision(value);
        case 'review_status':
          return this.formatReviewStatus(value);
        case 'accept_mitigation':
          return value === 'true' || value === true ? 'Yes' : 'No';
        case 'mitigation_cost':
        case 'mitigation_percent':
        case 'coverage_percent':
          return value ? `${value}` : 'Not Set';
        case 'effective_date':
          return value ? this.formatDate(value) : 'Not Set';
      }
      
      // Handle HTML content (strip tags for display)
      if (typeof value === 'string' && value.includes('<p>')) {
        const stripped = value.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 100 ? stripped.substring(0, 100) + '...' : stripped || 'Empty';
      }
      
      // Handle long text
      if (typeof value === 'string' && value.length > 100) {
        return value.substring(0, 100) + '...';
      }
      
      // Handle objects (MongoDB IDs, etc.)
      if (typeof value === 'object') {
        if (value.$oid) return 'ID: ' + value.$oid.substring(0, 8) + '...';
        if (value.$date) return this.formatDate(value.$date);
        return 'Complex data';
      }
      
      return value.toString();
    },

    formatMitigationStatus(status) {
      const statusMap = {
        'planMitigation': 'Plan Mitigation',
        'noMitigation': 'No Mitigation',
        'inProgress': 'In Progress',
        'completed': 'Completed'
      };
      return statusMap[status] || status;
    },

    formatRiskStatus(status) {
      const statusMap = {
        'New': 'New',
        'Open': 'Open',
        'In Progress': 'In Progress',
        'Closed Risk': 'Closed',
        'Mitigated': 'Mitigated',
        'Accepted': 'Accepted'
      };
      return statusMap[status] || status;
    },

    formatTreatmentDecision(decision) {
      const decisionMap = {
        'accepting': 'Accept Risk',
        'mitigating': 'Mitigate Risk',
        'avoiding': 'Avoid Risk',
        'transferring': 'Transfer Risk'
      };
      return decisionMap[decision] || decision;
    },

    formatReviewStatus(status) {
      const statusMap = {
        'noReview': 'No Review',
        'scheduled': 'Scheduled',
        'in_progress': 'In Progress',
        'completed': 'Completed'
      };
      return statusMap[status] || status;
    },

    getEventDescription(log) {
      const actionMap = {
        'insert': 'Risk Created',
        'updateRiskAnalysis': 'Risk Analysis Updated',
        'updateIdentification': 'Risk Identification Updated',
        'update': 'Risk Updated',
        'delete': 'Risk Deleted',
        'view': 'Risk Viewed'
      };
      return actionMap[log.action] || log.action || 'Action Performed';
    },

    formatActionType(action) {
      const typeMap = {
        'insert': 'Create',
        'updateRiskAnalysis': 'Update',
        'updateIdentification': 'Update',
        'update': 'Update',
        'delete': 'Delete',
        'view': 'View'
      };
      return typeMap[action] || 'Info';
    },

    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },

    getInitials(name) {
      if (!name) return 'NA';
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },

    getUserFullName(userId) {
      if (!userId || !this.userOptions.length) return 'Unknown User';
      const user = this.userOptions.find(u => u.id === userId);
      return user ? user.full_name : 'Unknown User';
    },

    getUserColor(userId) {
      const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
      ];
      const hash = userId ? userId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
      return colors[hash % colors.length];
    },

    getEventIcon(action) {
      const icons = {
        'insert': 'mdi-plus-circle',
        'updateRiskAnalysis': 'mdi-pencil',
        'updateIdentification': 'mdi-pencil',
        'update': 'mdi-pencil',
        'delete': 'mdi-delete',
        'view': 'mdi-eye'
      };
      return icons[action] || 'mdi-information';
    },

    getEventColor(action) {
      const colors = {
        'insert': '#10B981',
        'updateRiskAnalysis': '#F59E0B',
        'updateIdentification': '#F59E0B',
        'update': '#F59E0B',
        'delete': '#EF4444',
        'view': '#3B82F6'
      };
      return colors[action] || '#6B7280';
    },

    getEventColorLight(action) {
      const colors = {
        'insert': '#D1FAE5',
        'updateRiskAnalysis': '#FEF3C7',
        'updateIdentification': '#FEF3C7',
        'update': '#FEF3C7',
        'delete': '#FEE2E2',
        'view': '#DBEAFE'
      };
      return colors[action] || '#F3F4F6';
    },

    getTypeBadgeClass(action) {
      const typeMap = {
        'insert': 'create',
        'updateRiskAnalysis': 'update',
        'updateIdentification': 'update',
        'update': 'update',
        'delete': 'delete',
        'view': 'view'
      };
      const type = typeMap[action] || 'info';
      return `type-badge-${type}`;
    },

    getTypeBadgeIcon(action) {
      const icons = {
        'insert': 'mdi-plus',
        'updateRiskAnalysis': 'mdi-pencil',
        'updateIdentification': 'mdi-pencil',
        'update': 'mdi-pencil',
        'delete': 'mdi-delete',
        'view': 'mdi-eye'
      };
      return icons[action] || 'mdi-information';
    }
  }
};
</script>

<style scoped>
/* Wrapper */
.audit-trail-wrapper {
  background: linear-gradient(to bottom, #FFFFFF, #F9FAFB);
  border-radius: 12px;
  padding: 0;
  margin: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header */
.audit-trail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-bottom: 1px solid #E5E7EB;
  background: #F0F0F0;
  border-radius: 12px 12px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.audit-trail-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  text-transform: none;
  font-weight: 500;
  border-color: #E5E7EB;
  color: #6B7280;
}

.refresh-btn:hover {
  background-color: #F9FAFB;
  border-color: #7C3AED;
  color: #7C3AED;
}

/* DataTable */
.audit-trail-datatable {
  padding: 0;
}

.audit-table {
  background: transparent !important;
}

.audit-table :deep(.v-table__wrapper) {
  border-radius: 0 0 12px 12px;
}

.audit-table :deep(thead) {
  background-color: #F9FAFB;
}

.audit-table :deep(th) {
  font-weight: 600 !important;
  color: #374151 !important;
  font-size: 13px !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #E5E7EB !important;
  padding: 16px !important;
}

.audit-table :deep(tbody tr) {
  transition: all 0.2s ease;
}

.audit-table :deep(tbody tr:hover) {
  background-color: #F9FAFB !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.audit-table :deep(td) {
  padding: 16px !important;
  border-bottom: 1px solid #F3F4F6 !important;
}

/* Event Cell */
.event-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-title {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
}

.event-subtitle {
  font-size: 12px;
  color: #9CA3AF;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
}

.user-meta {
  font-size: 12px;
  color: #9CA3AF;
}

/* Date Cell */
.date-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-content,
.time-content {
  display: flex;
  align-items: center;
}

.date-text {
  font-weight: 500;
  color: #374151;
  font-size: 13px;
}

.time-text {
  font-size: 12px;
  color: #9CA3AF;
}

/* Type Badge */
.type-cell {
  display: flex;
  align-items: center;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-badge-create {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  color: #065F46;
}

.type-badge-update {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #92400E;
}

.type-badge-delete {
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  color: #991B1B;
}

.type-badge-view {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: #1E40AF;
}

.type-badge-info {
  background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
  color: #374151;
}

/* IP Cell */
.ip-cell {
  display: flex;
  align-items: center;
}

.ip-text {
  font-size: 13px;
  color: #6B7280;
  font-family: 'Courier New', monospace;
}

/* Actions Cell */
.actions-cell {
  display: flex;
  justify-content: center;
}

.action-btn {
  color: #6B7280;
}

.action-btn:hover {
  background-color: #F3F4F6;
  color: #7C3AED;
}

/* Loading */
.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

/* No Data */
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.no-data-icon {
  margin-bottom: 16px;
}

.no-data-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.no-data-text {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  max-width: 400px;
}

/* Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  background-color: #FFFFFF;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-text {
  font-size: 13px;
  color: #6B7280;
}

.custom-pagination :deep(.v-pagination__item) {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin: auto;
}

.custom-pagination :deep(.v-pagination__item--is-active) {
  background: #6E3894;
  color: white !important;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.custom-pagination :deep(.v-pagination__item:not(.v-pagination__item--is-active)) {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #4B5563;
}

.custom-pagination :deep(.v-pagination__item:hover:not(.v-pagination__item--is-active)) {
  background-color: #F9FAFB;
  border-color: #7C3AED;
  color: #7C3AED;
}

/* Details Dialog */
.details-card {
  border-radius: 12px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  border-bottom: 1px solid #E5E7EB;
  background: #F0F0F0;
}

.details-title {
  font-size: 18px;
  font-weight: 700;
  color: black;
}

.details-content {
  padding: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

/* Changes List */
.changes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-item {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s ease;
}

.change-item:hover {
  border-color: #7C3AED;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
}

.change-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.change-field {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.change-values {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #FFFFFF;
  border-radius: 8px;
}

.change-value {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.value-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9CA3AF;
}

.value-content {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  padding: 8px 12px;
  background: #F3F4F6;
  border-radius: 6px;
  word-break: break-word;
}

.old-value .value-content {
  background: #FEE2E2;
  color: #991B1B;
}

.new-value .value-content {
  background: #D1FAE5;
  color: #065F46;
}

/* No Changes */
.no-changes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.no-changes-text {
  font-size: 14px;
  color: #6B7280;
  margin: 12px 0 0 0;
}

/* Responsive */
@media (max-width: 768px) {
  .audit-trail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;
    gap: 16px;
  }

  .change-values {
    flex-direction: column;
    gap: 12px;
  }

  .change-values .v-icon {
    transform: rotate(90deg);
  }
}
</style>