<template>
  <div class="audit-container">
    <v-container fluid class="px-0">
      <v-card class="audit-card rounded-lg overflow-hidden">
        <!-- Header Section with Gradient Background -->
        <div class="audit-header pa-4">
          <div class="d-flex align-center">
            <div class="flex-grow-1">

              <h3 class="white--text font-weight-medium mb-0 text-truncate">
                <v-icon color="secondary">mdi-clipboard-text-outline</v-icon> {{ $t("auditinfocomponent.Audit Name") }}: {{ audit.audit_name ||
                  'Control Audit' }}
              </h3>
              <div class="audit-metadata d-flex align-center mt-1">
                <span class="caption white--text opacity-7">
                  <v-icon x-small color="white" class="mr-1">mdi-calendar-range</v-icon>
                  {{ $t("auditinfocomponent.Created") }}: {{ formatDate(audit.created_at) || 'Unknown' }}
                </span>
                <span class="caption white--text opacity-7 ml-3">
                  <v-icon x-small color="white" class="mr-1">mdi-update</v-icon>
                  {{ $t("auditinfocomponent.Updated") }}: {{ formatDate(audit.updated_at) || 'Unknown' }}
                </span>
              </div>
            </div>
          </div>
        </div>


        <template v-if="controlAuditData">
          <!-- Content Section with Shadow Separator -->
          <div class="audit-content">
            <v-row no-gutters>
              <v-col cols="12">
                <div class="data-section pa-4">
                  <h3 class="section-title mb-3">
                    <v-icon color="primary" small class="mr-2">mdi-information-outline</v-icon>
                    {{ $t("auditinfocomponent.control_information") }}
                  </h3>

                  <div class="section-content elevation-1 rounded-lg">
                    <div class="description-container pa-4">
                      <div class="label">{{ $t("auditinfocomponent.control_description") }}</div>
                      <div class="content" v-html="control.description || 'No description available'"></div>
                    </div>
                    <v-divider></v-divider>
                    <div class="data-grid pa-4">
                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.control_number") }}</div>
                        <div class="content">
                          <v-icon small class="mr-1">mdi-identifier</v-icon>
                          <h3>:{{ controlAuditData.name || 'N/A' }}</h3>
                        </div>
                      </div>
                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.control_status") }}</div>
                        <div class="content">
                          <v-icon small class="mr-1">mdi-progress-check</v-icon>
                          {{ controlAuditData.status || $t('auditinfocomponent.not_specified') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12">
                <v-divider class="mx-4"></v-divider>
              </v-col>

              <v-col cols="12" md="6">
                <div class="data-section pa-4">
                  <h3 class="section-title mb-3">
                    <v-icon color="primary" small class="mr-2">mdi-calendar-check</v-icon>
                    {{ $t("auditinfocomponent.audit_schedule") }}
                  </h3>

                  <div class="section-content elevation-1 rounded-lg">
                    <div class="data-grid">
                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.start_date") }}</div>
                        <div class="content">
                          <v-icon small class="mr-1">mdi-calendar-start</v-icon>
                          {{ formatDate(audit.start_date) || 'Not scheduled' }}
                        </div>
                      </div>

                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.due_date") }}</div>
                        <div class="content" :class="{ 'overdue-text': isDateOverdue(audit.due_date) }">
                          <v-icon small class="mr-1">mdi-calendar-clock</v-icon>
                          {{ formatDate(audit.due_date) || 'Not scheduled' }}
                          <v-tooltip bottom v-if="isDateOverdue(audit.due_date)">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon color="error" x-small class="ml-1" v-bind="attrs" v-on="on">
                                mdi-alert-circle
                              </v-icon>
                            </template>
                            <span>{{ $t("auditinfocomponent.This audit is overdue") }}</span>
                          </v-tooltip>
                        </div>
                      </div>

                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.Next Scheduled Audit") }}</div>
                        <div class="content">
                          <v-icon small class="mr-1">mdi-calendar-arrow-right</v-icon>
                          {{ formatDate(audit.next_initiate_date) || $t("auditinfocomponent.Not scheduled") }}
                        </div>
                      </div>

                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.Frequency") }}</div>
                        <div class="content">
                          <v-icon small class="mr-1">mdi-calendar-refresh</v-icon>
                          {{ audit.periodical_time !== null ? `${audit.periodical_time} days` : 'One-time' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="data-section pa-4">
                  <h3 class="section-title mb-3">
                    <v-icon color="primary" small class="mr-2">mdi-account-group</v-icon>
                    {{ $t("auditinfocomponent.Personnel") }}
                  </h3>

                  <div class="section-content elevation-1 rounded-lg">
                    <div class="data-grid">
                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.Auditor") }}</div>
                        <div class="content">
                          <v-icon small class="mr-1">mdi-account-tie</v-icon>
                          {{ getTesterName(audit.auditer_id) }}
                        </div>
                      </div>
                      <div class="data-item">
                        <div class="label">{{ $t("auditinfocomponent.Responsible Type") }}</div>
                        <div class="content">
                          <v-icon small class="mr-1">
                            {{ audit.responsible_type === 'teams' ? 'mdi-account-group' : 'mdi-account' }}
                          </v-icon>
                          {{ capitalizeFirst(audit.responsible_type) || 'Not specified' }}
                        </div>
                      </div>
                      <div class="data-item assistants-item">
                        <div class="label">{{ $t("auditinfocomponent.Responsible Team") }}</div>
                        <div class="content">
                          <div class="assistant-chips">
                            <template v-if="controlAuditData.assistant_audit">
                              <v-chip v-for="(personId, i) in controlAuditData.assistant_audit" :key="i" x-small
                                outlined class="mr-1 mb-1"
                                :color="getResponsibleType(personId) === 'team' ? 'indigo' : 'teal'">
                                <v-icon left x-small>
                                  {{ getResponsibleType(personId) === 'team' ? 'mdi-account-group' : 'mdi-account' }}
                                </v-icon>
                                {{ getResponsibleName(personId) }}
                              </v-chip>

                            </template>
                            <span v-else class="no-data-text">{{ $t("auditinfocomponent.No responsible team assigned")
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </template>

        <!-- Loading State -->
        <template v-else>
          <v-card-text class="py-12 text-center loading-container">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <h3 class="mt-6 text-body-1 font-weight-medium">{{ $t("auditinfocomponent.Loading audit information")}}</h3>
            <p class="text-caption text-secondary">{{ $t("auditinfocomponent.Please wait while we fetch the data")}}</p>
          </v-card-text>
        </template>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'AuditInfoComponent',
  props: {
    controlAuditData: {
      type: Object,
      required: true
    },
    userData: {
      type: Array,
      default: () => []
    },
    teamData: {
      type: Array,
      default: () => []
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    audit() {
      return this.controlAuditData?.audit || {};
    },
    control() {
      return this.controlAuditData?.control || {};
    },
    requirementsWithEvidence() {
      return this.controlAuditData?.requirements_with_evidence || [];
    },

  },
  methods: {

    getTesterName(testerId) {
      if (!testerId) return this.$t('auditinfocomponent.not_assigned');
      const user = this.userData.find(u => u.id === testerId);
      return user?.full_name || this.$t('auditinfocomponent.unknown_user');
    },


    getResponsibleName(id) {
      if (!id) return this.$t('auditinfocomponent.not_assigned');

      // First try user
      const user = this.userData.find(u => u.id === id);
      if (user) return user.full_name;

      // Then try team
      const team = this.teamData.find(t => t.id === id);
      if (team) return team.name;

      return this.$t('auditinfocomponent.unknown_entity', { id });
    },
    getResponsibleType(id) {
      if (!id) return this.$t('auditinfocomponent.unknown');
      if (this.userData.find(u => u.id === id)) return this.$t('auditinfocomponent.user');
      if (this.teamData.find(t => t.id === id)) return this.$t('auditinfocomponent.team');
      return this.$t('auditinfocomponent.unknown');
    },


    getEvidenceStatusColor(status) {
      if (!status) return 'grey';
      const statusMap = {
        'approved': 'success',
        'pending': 'warning',
        'rejected': 'error',
        'not_relevant': 'grey'
      };
      return statusMap[status.toLowerCase()] || 'grey';
    },

    getEvidenceStatusIcon(status) {
      if (!status) return 'mdi-help-circle-outline';
      const iconMap = {
        'approved': 'mdi-check-circle-outline',
        'pending': 'mdi-clock-outline',
        'rejected': 'mdi-close-circle-outline',
        'not_relevant': 'mdi-minus-circle-outline'
      };
      return iconMap[status.toLowerCase()] || 'mdi-help-circle-outline';
    },

    formatDate(dateString) {
      if (!dateString) return 'Not Scheduled';
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(date);
      } catch (error) {
        return dateString;
      }
    },

    formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'Unknown';
      try {
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (error) {
        return dateTimeString;
      }
    },

    isDateOverdue(dateString) {
      if (!dateString) return false;
      try {
        const dueDate = new Date(dateString);
        const today = new Date();
        return dueDate < today;
      } catch {
        return false;
      }
    },

    getStatusColor(status) {
      if (!status) return 'grey';
      const statusMap = {
        'completed': 'success',
        'done': 'success',
        'finished': 'success',
        'approved': 'success',
        'pending': 'warning',
        'in-progress': 'info',
        'ongoing': 'info',
        'active': 'info',
        'overdue': 'error',
        'failed': 'error',
        'rejected': 'error',
        'expired': 'error'
      };
      return statusMap[status.toLowerCase()] || 'grey';
    },

    getStatusIcon(status) {
      if (!status) return 'mdi-help-circle-outline';
      const iconMap = {
        'completed': 'mdi-check-circle-outline',
        'done': 'mdi-check-circle-outline',
        'finished': 'mdi-check-circle-outline',
        'approved': 'mdi-check-circle-outline',
        'pending': 'mdi-clock-outline',
        'in-progress': 'mdi-progress-clock',
        'ongoing': 'mdi-progress-clock',
        'active': 'mdi-progress-check',
        'overdue': 'mdi-alert-circle-outline',
        'failed': 'mdi-close-circle-outline',
        'rejected': 'mdi-close-circle-outline',
        'expired': 'mdi-calendar-remove'
      };
      return iconMap[status.toLowerCase()] || 'mdi-help-circle-outline';
    },

    capitalizeFirst(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    openFile(fileUrl) {
      // Implement file opening logic
      window.open(`/api/files/${fileUrl}`, '_blank');
    },

    exportAudit() {
      this.$emit('export');
    },

    editAudit() {
      this.$emit('edit');
    }
  }
};
</script>

<style scoped>
.audit-container {
  font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
}

.audit-card {
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: none;
}

.audit-header {
  background: linear-gradient(135deg, var(--v-primary-base) 0%, var(--v-primary-darken2) 100%);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.audit-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}

.audit-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.audit-metadata {
  opacity: 0.8;
}

.status-chip {
  font-size: 11px !important;
  font-weight: 500 !important;
}

.opacity-7 {
  opacity: 0.7;
}

.audit-content {
  background-color: var(--v-background-base, white);
}

.section-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--v-primary-darken1);
  display: flex;
  align-items: center;
}

.section-content {
  background-color: var(--v-surface-base, white);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.section-content:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.description-container {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 16px;
  padding: 16px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assistants-item {
  grid-column: span 1;
}

.label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.content {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.87);
}

.overdue-text {
  color: var(--v-error-base) !important;
}

.assistant-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.comments-container {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.comment-text {
  font-size: 0.9rem;
  white-space: pre-line;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.8);
}

.audit-actions {
  background-color: rgba(0, 0, 0, 0.02);
}

.loading-container {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-data-text {
  font-style: italic;
  color: rgba(0, 0, 0, 0.4);
  font-size: 0.85rem;
}

.requirement-details {
  background-color: rgba(0, 0, 0, 0.01);
  border-radius: 4px;
}

/* Responsive adjustments */
@media (min-width: 960px) {
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .assistants-item {
    grid-column: span 2;
  }
}

/* Custom scrollbar for expansion panels */
.v-expansion-panel-content ::-webkit-scrollbar {
  width: 6px;
}

.v-expansion-panel-content ::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.v-expansion-panel-content ::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.v-expansion-panel-content ::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>