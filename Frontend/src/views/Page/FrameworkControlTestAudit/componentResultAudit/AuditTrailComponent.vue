<template>
  <div>
    <h3>{{ $t("audittrailcomponent.audit_trail") }}</h3>

    <!-- Loading state -->
    <v-skeleton-loader v-if="loading" type="table-tbody" class="mx-auto"></v-skeleton-loader>

    <!-- Audit logs table -->
    <v-table v-else>
      <thead>
        <tr>
          <th>{{ $t("audittrailcomponent.date") }}</th>
          <th>{{ $t("audittrailcomponent.action") }}</th>
          <th>{{ $t("audittrailcomponent.changed_by") }}</th>
          <th>{{ $t("audittrailcomponent.changes") }}</th>
          <th>{{ $t("audittrailcomponent.details") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, index) in paginatedLogs" :key="log.id">
          <td>{{ formatDate(log.created_at) }}</td>
          <td>
            <v-chip :color="getActionColor(log.action)" size="small">
              {{ formatAction(log.action) }}
            </v-chip>
          </td>
          <td>{{ getChangedBy(log.user_id) }}</td>
          <td>
            <div v-if="getChangeSummary(log).length > 0">
              <v-chip v-for="change in getChangeSummary(log).slice(0, 2)" :key="change.field" size="x-small"
                class="ma-1" :color="getChangeColor(change.type)">
                {{ change.summary }}
              </v-chip>
              <v-chip v-if="getChangeSummary(log).length > 2" size="x-small" class="ma-1" color="grey">
                +{{ getChangeSummary(log).length - 2 }} more
              </v-chip>
            </div>
            <span v-else class="text-grey">{{ $t("audittrailcomponent.no_changes_detected") }}</span>
          </td>
          <td>
            <v-btn size="small" variant="outlined" @click="showDetails(log)">
              {{ $t("audittrailcomponent.view_details") }}
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <div class="d-flex justify-center align-center mt-4">
      <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5"
        @update:model-value="loadPage"></v-pagination>

      <v-select v-model="pageSize" :items="pageSizeOptions" label="Items per page" variant="outlined" density="compact"
        class="ml-4" style="max-width: 150px" @update:model-value="onPageSizeChange"></v-select>
    </div>

    <div class="text-caption text-center mt-2">
      Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} entries
    </div>

    <!-- Details Dialog -->
    <v-dialog v-model="detailDialog" max-width="900">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ $t("audittrailcomponent.audit_log_details") }}</span>
          <v-btn icon @click="detailDialog = false">
            <v-icon>{{ $t("audittrailcomponent.mdiclose") }}</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row v-if="currentLogDetails">
            <v-col cols="12" md="6">
              <h4>{{ $t("audittrailcomponent.basic_information") }}</h4>
              <v-table density="compact">
                <tbody>
                  <tr>
                    <td><strong>{{ $t("audittrailcomponent.date") }}</strong></td>
                    <td>{{ formatDate(currentLogDetails.created_at) }}</td>
                  </tr>
                  <tr>
                    <td><strong>{{ $t("audittrailcomponent.action") }}</strong></td>
                    <td>{{ formatAction(currentLogDetails.action) }}</td>
                  </tr>
                  <tr>
                    <td><strong>{{ $t("audittrailcomponent.user") }}</strong></td>
                    <td>{{ getChangedBy(currentLogDetails.user_id) }}</td>
                  </tr>
                  <tr>
                    <td><strong>{{ $t("audittrailcomponent.ip_address") }}</strong></td>
                    <td>{{ currentLogDetails.ip_address || 'N/A' }}</td>
                  </tr>
                  <tr>
                    <td><strong>{{ $t("audittrailcomponent.browser") }}</strong></td>
                    <td>{{ currentLogDetails.browser || 'N/A' }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>

            <v-col cols="12" md="6">
              <h4>{{ $t("audittrailcomponent.changes_made") }}</h4>
              <div v-if="getDetailedChanges(currentLogDetails).length > 0">
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel v-for="change in getDetailedChanges(currentLogDetails)" :key="change.field">
                    <v-expansion-panel-title>
                      <v-chip :color="getChangeColor(change.type)" size="small" class="mr-2">
                        {{ change.type }}
                      </v-chip>
                      {{ change.field }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div v-if="change.type === 'updated'">
                        <div class="mb-2">
                          <strong>{{ $t("audittrailcomponent.from") }}</strong>
                          <code class="bg-red-lighten-4 pa-1 ml-2">{{ change.oldValue }}</code>
                        </div>
                        <div>
                          <strong>{{ $t("audittrailcomponent.to") }}</strong>
                          <code class="bg-green-lighten-4 pa-1 ml-2">{{ change.newValue }}</code>
                        </div>
                      </div>
                      <div v-else-if="change.type === 'added'">
                        <strong>{{ $t("audittrailcomponent.added") }}</strong>
                        <code class="bg-green-lighten-4 pa-1 ml-2">{{ change.value }}</code>
                      </div>
                      <div v-else-if="change.type === 'removed'">
                        <strong>{{ $t("audittrailcomponent.removed") }}</strong>
                        <code class="bg-red-lighten-4 pa-1 ml-2">{{ change.value }}</code>
                      </div>
                      <div v-else>
                        <code>{{ change.value }}</code>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
              <div v-else class="text-grey">
                {{ $t("audittrailcomponent.no_specific_changes_detected") }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'AuditTrailComponent',
  props: {
    controlAuditData: {
      type: Object,
      required: true
    },
    auditLogs: {
      type: Array,
      default: () => []
    },
    userData: {
      type: Array,
      default: () => []
    },
    teamData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      detailDialog: false,
      currentLogDetails: null,
      currentPage: 1,
      pageSize: 10,
      pageSizeOptions: [5, 10, 20, 50],
      paginatedLogs: [],
      totalItems: 0,
      // Cache for processed logs to avoid reprocessing
      processedLogsCache: new Map()
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.pageSize);
    },
    startIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    endIndex() {
      return Math.min(this.startIndex + this.pageSize, this.totalItems);
    }
  },
  watch: {
    auditLogs: {
      handler() {
        this.totalItems = this.auditLogs.length;
        this.loadPage();
      },
      immediate: true
    }
  },
  methods: {
    loadPage() {
      this.loading = true;

      // Simulate API delay for demonstration
      setTimeout(() => {
        const start = this.startIndex;
        const end = this.endIndex;
        this.paginatedLogs = this.auditLogs.slice(start, end);
        this.loading = false;
      }, 300);
    },

    onPageSizeChange() {
      this.currentPage = 1;
      this.loadPage();
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatAction(action) {
      const actionMap = {
        'show': 'View',
        'create': 'Create',
        'update': 'Update',
        'delete': 'Delete'
      };
      return actionMap[action] || action;
    },

    getActionColor(action) {
      const colorMap = {
        'show': 'info',
        'create': 'success',
        'update': 'warning',
        'delete': 'error'
      };
      return colorMap[action] || 'default';
    },

    getChangeColor(changeType) {
      const colorMap = {
        'updated': 'warning',
        'added': 'success',
        'removed': 'error'
      };
      return colorMap[changeType] || 'info';
    },

    getChangedBy(userId) {
      if (!userId) return 'System';
      const user = this.userData.find(u => u.id === userId);
      return user?.full_name || 'Unknown User';
    },

    getChangeSummary(log) {
      // Use cache to avoid reprocessing
      const cacheKey = log.id;
      if (this.processedLogsCache.has(cacheKey)) {
        return this.processedLogsCache.get(cacheKey);
      }

      const changes = this.extractSpecificChanges(log);
      this.processedLogsCache.set(cacheKey, changes);
      return changes;
    },

    getDetailedChanges(log) {
      return this.extractSpecificChanges(log, true);
    },

    extractSpecificChanges(log, detailed = false) {
      const changes = [];
      if (!log.data) return changes;

      // Find previous log for comparison
      const currentIndex = this.auditLogs.findIndex(l => l.id === log.id);
      const previousLog = currentIndex < this.auditLogs.length - 1
        ? this.auditLogs[currentIndex + 1]
        : null;

      // Handle different classes
      if (log.class === 'AuditRemidation') {
        this.compareRemediationFields(previousLog?.data || {}, log.data, changes, detailed);
      } else {
        // Default handling for FrameworkControlTestAudit
        if (previousLog && previousLog.data) {
          this.compareSpecificFields(previousLog.data, log.data, changes, detailed);
        } else {
          this.addCreationChanges(log.data, changes, detailed);
        }
      }

      return changes;
    },
    compareRemediationFields(oldData, newData, changes, detailed) {
      // Compare responsible_user
      if (oldData.responsible_user !== newData.responsible_user) {
        changes.push({
          field: 'Responsible User',
          type: 'updated',
          summary: detailed
            ? `Responsible: ${this.getUserNameById(oldData.responsible_user)} → ${this.getUserNameById(newData.responsible_user)}`
            : 'Responsible User Changed',
          oldValue: this.getUserNameById(oldData.responsible_user) || 'None',
          newValue: this.getUserNameById(newData.responsible_user)
        });
      }

      // Compare budgetary
      if (oldData.budgetary !== newData.budgetary) {
        changes.push({
          field: 'Budgetary',
          type: 'updated',
          summary: detailed
            ? `Budgetary: ${oldData.budgetary || 'None'} → ${newData.budgetary}`
            : 'Budgetary Changed',
          oldValue: oldData.budgetary || 'None',
          newValue: newData.budgetary
        });
      }

      // Compare status
      if (oldData.status !== newData.status) {
        changes.push({
          field: 'Remediation Status',
          type: 'updated',
          summary: detailed
            ? `Status: ${oldData.status || 'None'} → ${newData.status}`
            : 'Remediation Status Changed',
          oldValue: oldData.status || 'None',
          newValue: newData.status
        });
      }

      // Compare comments_remidation (with HTML cleaning)
      const cleanComments = (comments) => {
        if (!comments) return 'None';
        return comments.replace(/<[^>]*>/g, '').substring(0, 50);
      };

      if (cleanComments(oldData.comments_remidation) !== cleanComments(newData.comments_remidation)) {
        changes.push({
          field: 'Remediation Comments',
          type: 'updated',
          summary: detailed
            ? 'Remediation comments changed'
            : 'Comments Updated',
          oldValue: cleanComments(oldData.comments_remidation),
          newValue: cleanComments(newData.comments_remidation)
        });
      }

      // Compare corrective_action_plan (with HTML cleaning)
      const cleanPlan = (plan) => {
        if (!plan) return 'None';
        return plan.replace(/<[^>]*>/g, '').substring(0, 50);
      };

      if (cleanPlan(oldData.corrective_action_plan) !== cleanPlan(newData.corrective_action_plan)) {
        changes.push({
          field: 'Corrective Action Plan',
          type: 'updated',
          summary: detailed
            ? 'Corrective action plan changed'
            : 'Action Plan Updated',
          oldValue: cleanPlan(oldData.corrective_action_plan),
          newValue: cleanPlan(newData.corrective_action_plan)
        });
      }

      // Compare due_date
      if (oldData.due_date !== newData.due_date) {
        changes.push({
          field: 'Due Date',
          type: 'updated',
          summary: detailed
            ? `Due date: ${oldData.due_date || 'None'} → ${newData.due_date}`
            : 'Due Date Changed',
          oldValue: oldData.due_date || 'None',
          newValue: newData.due_date
        });
      }

      // If no changes detected but it's an update action, show generic message
      if (changes.length === 0 && newData.updated_at !== oldData.updated_at) {
        changes.push({
          field: 'Remediation',
          type: 'updated',
          summary: 'Remediation details updated',
          value: 'No specific field changes detected'
        });
      }
    },
    cleanHtml(html) {
      if (!html) return '';
      // Remove HTML tags and trim
      return html.replace(/<[^>]*>/g, '').trim();
    },
    compareSpecificFields(oldData, newData, changes, detailed) {
      // 1. Compare end_audit_status
      if (oldData.end_audit_status !== newData.end_audit_status) {
        changes.push({
          field: 'Audit Status',
          type: 'updated',
          summary: detailed
            ? `Audit Status: ${this.formatAuditStatus(oldData.end_audit_status)} → ${this.formatAuditStatus(newData.end_audit_status)}`
            : `Audit Status Changed`,
          oldValue: this.formatAuditStatus(oldData.end_audit_status),
          newValue: this.formatAuditStatus(newData.end_audit_status)
        });
      }

      // 2. Compare open_closed_status
      if (oldData.open_closed_status !== newData.open_closed_status) {
        changes.push({
          field: 'Open/Closed Status',
          type: 'updated',
          summary: detailed
            ? `Status: ${this.formatOpenClosedStatus(oldData.open_closed_status)} → ${this.formatOpenClosedStatus(newData.open_closed_status)}`
            : `Open/Closed Status Changed`,
          oldValue: this.formatOpenClosedStatus(oldData.open_closed_status),
          newValue: this.formatOpenClosedStatus(newData.open_closed_status)
        });
      }

      // 3. Compare main status
      if (oldData.status !== newData.status) {
        changes.push({
          field: 'Status',
          type: 'updated',
          summary: detailed
            ? `Status: ${oldData.status || 'None'} → ${newData.status}`
            : `Status Updated`,
          oldValue: oldData.status || 'None',
          newValue: newData.status
        });
      }
      if (oldData.is_remediation !== newData.is_remediation) {
        changes.push({
          field: 'Remediation Status',
          type: 'updated',
          summary: detailed
            ? `Remediation: ${oldData.is_remediation || 'No'} → ${newData.is_remediation}`
            : `Remediation Status Changed`,
          oldValue: oldData.is_remediation || 'No',
          newValue: newData.is_remediation
        });
      }

      // 3. Compare notes
      const cleanNotes = (notes) => {
        if (!notes) return 'No notes';
        // Remove HTML tags for comparison
        return notes.replace(/<[^>]*>/g, '').substring(0, 50);
      };

      if (cleanNotes(oldData.notes) !== cleanNotes(newData.notes)) {
        changes.push({
          field: 'Notes',
          type: 'updated',
          summary: detailed
            ? `Notes content changed`
            : `Notes Updated`,
          oldValue: cleanNotes(oldData.notes),
          newValue: cleanNotes(newData.notes)
        });
      }
      // 4. Compare requirements
      this.compareRequirements(oldData, newData, changes, detailed);
    },
    getUserNameById(userId) {
      if (!userId) return 'N/A';
      const user = this.userData.find(u => u.id === userId);
      return user ? user.full_name : userId;
    },
    compareRequirements(oldData, newData, changes, detailed) {
      const oldRequirements = oldData.requirement_with_evidence || [];
      const newRequirements = newData.requirement_with_evidence || [];
      const oldRequirementsData = oldData.requirements_with_evidence_data || [];
      const newRequirementsData = newData.requirements_with_evidence_data || [];

      // Compare requirement counts
      if (oldRequirements.length !== newRequirements.length) {
        const diff = newRequirements.length - oldRequirements.length;
        changes.push({
          field: 'Requirements Count',
          type: diff > 0 ? 'added' : 'removed',
          summary: detailed
            ? `${Math.abs(diff)} requirement(s) ${diff > 0 ? 'added' : 'removed'}`
            : `Requirements ${diff > 0 ? 'Added' : 'Removed'}`,
          value: `${Math.abs(diff)} requirement(s)`
        });
      }

      // Compare individual requirement statuses
      newRequirementsData.forEach((newReq, index) => {
        const oldReq = oldRequirementsData[index];

        if (!oldReq) {
          // New requirement added
          changes.push({
            field: `Requirement ${index + 1}`,
            type: 'added',
            summary: detailed
              ? `New requirement added with status: ${newReq.status}`
              : `Requirement Added`,
            value: `Status: ${newReq.status}`
          });
        } else if (oldReq.status !== newReq.status) {
          // Requirement status changed
          changes.push({
            field: `Requirement ${index + 1} Status`,
            type: 'updated',
            summary: detailed
              ? `Requirement status: ${oldReq.status} → ${newReq.status}`
              : `Requirement Status Changed`,
            oldValue: oldReq.status,
            newValue: newReq.status
          });
        }

        // Compare evidence
        this.compareEvidence(oldReq, newReq, changes, detailed, index + 1);
      });

      // Check for removed requirements
      if (oldRequirementsData.length > newRequirementsData.length) {
        for (let i = newRequirementsData.length; i < oldRequirementsData.length; i++) {
          changes.push({
            field: `Requirement ${i + 1}`,
            type: 'removed',
            summary: detailed
              ? `Requirement removed (was: ${oldRequirementsData[i].status})`
              : `Requirement Removed`,
            value: `Status was: ${oldRequirementsData[i].status}`
          });
        }
      }
    },

    compareEvidence(oldReq, newReq, changes, detailed, reqIndex) {
      if (!oldReq || !newReq) return;

      const oldEvidence = oldReq.evidence || [];
      const newEvidence = newReq.evidence || [];

      // Compare evidence counts
      if (oldEvidence.length !== newEvidence.length) {
        const diff = newEvidence.length - oldEvidence.length;
        changes.push({
          field: `Requirement ${reqIndex} Evidence`,
          type: diff > 0 ? 'added' : 'removed',
          summary: detailed
            ? `${Math.abs(diff)} evidence item(s) ${diff > 0 ? 'added' : 'removed'}`
            : `Evidence ${diff > 0 ? 'Added' : 'Removed'}`,
          value: `${Math.abs(diff)} evidence item(s)`
        });
      }

      // Check for new evidence
      newEvidence.forEach((evidence, evidenceIndex) => {
        const oldEvidenceItem = oldEvidence[evidenceIndex];
        if (!oldEvidenceItem) {
          changes.push({
            field: `Requirement ${reqIndex} Evidence ${evidenceIndex + 1}`,
            type: 'added',
            summary: detailed
              ? `New evidence added: ${evidence.name}`
              : `Evidence Added`,
            value: evidence.name
          });
        }
      });
    },

    addCreationChanges(data, changes, detailed) {
      // Initial creation
      changes.push({
        field: 'Record',
        type: 'added',
        summary: 'Record Created',
        value: 'New audit record created'
      });

      // Add initial status
      if (data.status) {
        changes.push({
          field: 'Initial Status',
          type: 'added',
          summary: detailed ? `Initial status set: ${data.status}` : 'Status Set',
          value: data.status
        });
      }

      // Add initial audit status
      if (typeof data.end_audit_status !== 'undefined') {
        changes.push({
          field: 'Initial Audit Status',
          type: 'added',
          summary: detailed
            ? `Audit status set: ${this.formatAuditStatus(data.end_audit_status)}`
            : 'Audit Status Set',
          value: this.formatAuditStatus(data.end_audit_status)
        });
      }

      // Add initial requirements
      if (data.requirements_with_evidence_data && data.requirements_with_evidence_data.length > 0) {
        changes.push({
          field: 'Initial Requirements',
          type: 'added',
          summary: detailed
            ? `${data.requirements_with_evidence_data.length} requirement(s) added`
            : 'Requirements Added',
          value: `${data.requirements_with_evidence_data.length} requirement(s)`
        });
      }
    },

    formatAuditStatus(status) {
      const statusMap = {
        0: 'Not Started',
        1: 'In Progress',
        2: 'Completed',
        3: 'On Hold'
      };
      return statusMap[status] || `Status ${status}`;
    },

    formatOpenClosedStatus(status) {
      const statusMap = {
        0: 'Open',
        1: 'Closed'
      };
      return statusMap[status] || `Status ${status}`;
    },

    formatValue(value) {
      if (value === null || value === undefined) return 'null';
      if (typeof value === 'boolean') return value.toString();
      if (typeof value === 'object') return JSON.stringify(value);
      if (typeof value === 'string' && value.length > 50) {
        return value.substring(0, 50) + '...';
      }
      return value.toString();
    },

    showDetails(log) {
      this.currentLogDetails = log;
      this.detailDialog = true;
    }
  }
};
</script>

<style scoped>
.v-table {
  border: 1px solid #e0e0e0;
}

.v-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

code {
  font-size: 0.875rem;
  border-radius: 4px;
  padding: 2px 4px;
}

.bg-red-lighten-4 {
  background-color: #ffebee;
}

.bg-green-lighten-4 {
  background-color: #e8f5e8;
}

.text-grey {
  color: #666;
}
</style>