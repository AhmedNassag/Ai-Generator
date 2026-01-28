<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="version-modal-overlay">
      <div class="version-modal-container" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
        <!-- Modal Header -->
        <div class="version-modal-header">
          <div class="version-header-content">
            <h2 id="preview-modal-title">
              <i class="fas fa-file-alt version-me-2"></i>
              Document Preview
            </h2>
            <div class="version-meta">
              <span class="version-meta-item">
                <i class="fas fa-tag version-me-1"></i>
                {{ document.name || 'Untitled Document' }}
              </span>
              <span class="version-meta-item">
                <i class="fas fa-layer-group version-me-1"></i>
                {{ document.category?.name || 'N/A' }}
              </span>
              <span class="version-meta-item">
                <i class="fas fa-code-branch version-me-1"></i>
                v{{ getActiveVersion().versionNumber || 1 }}
              </span>
            </div>
          </div>
          <button class="version-modal-close" @click="closeModal" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Tab Navigation -->
        <ul class="nav nav-tabs version-nav-tabs" id="previewTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active version-nav-link" id="general-tab" data-bs-toggle="tab"
              data-bs-target="#general" type="button" role="tab" aria-controls="general" aria-selected="true">
              <i class="fas fa-info-circle version-me-2"></i>General Details
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link version-nav-link" id="versions-tab" data-bs-toggle="tab"
              data-bs-target="#versions" type="button" role="tab" aria-controls="versions" aria-selected="false">
              <i class="fas fa-code-branch version-me-2"></i>Version History
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link version-nav-link" id="content-tab" data-bs-toggle="tab"
              data-bs-target="#content" type="button" role="tab" aria-controls="content" aria-selected="false">
              <i class="fas fa-file-lines version-me-2"></i>Active Content
            </button>
          </li>
        </ul>

        <!-- Modal Body -->
        <div class="version-modal-body">
          <div class="tab-content version-tab-content" id="previewTabContent">
            <!-- General Details Tab -->
            <div class="tab-pane fade show active version-tab-pane" id="general" role="tabpanel"
              aria-labelledby="general-tab">
              <section class="version-content-section">
                <h3 class="version-section-title">
                  <i class="fas fa-info-circle version-me-2"></i>
                  General Document Information
                </h3>
                <div class="version-details-grid">
                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-primary">
                      <i class="fas fa-tag"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Document Name</span>
                      <span class="version-detail-value">{{ document.name || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-info">
                      <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Category</span>
                      <span class="version-detail-value">{{ document.category?.name || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-success">
                      <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Status</span>
                      <span class="version-detail-value">{{ document.status || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-warning">
                      <i class="far fa-calendar-check"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Published Date</span>
                      <span class="version-detail-value">{{ formatDate(document.published_date) }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-create">
                      <i class="far fa-calendar-plus"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Created At</span>
                      <span class="version-detail-value">{{ formatDateTime(document.created_at) }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-update">
                      <i class="far fa-calendar-alt"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Updated At</span>
                      <span class="version-detail-value">{{ formatDateTime(document.updated_at) }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-owner">
                      <i class="fas fa-user-shield"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Owner</span>
                      <span class="version-detail-value">{{ getUserName(document.owner_id) || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card">
                    <div class="version-detail-icon version-detail-icon-reviewer">
                      <i class="fas fa-user-check"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Reviewer</span>
                      <span class="version-detail-value">{{ getUserName(document.reviewer_id) || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card version-detail-card-full">
                    <div class="version-detail-icon version-detail-icon-stakeholders">
                      <i class="fas fa-users"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Stakeholders</span>
                      <span class="version-detail-value">{{ getStakeholderNames() }}</span>
                    </div>
                  </div>

                  <div class="version-detail-card version-detail-card-full">
                    <div class="version-detail-icon version-detail-icon-teams">
                      <i class="fas fa-users-cog"></i>
                    </div>
                    <div class="version-detail-text">
                      <span class="version-detail-label">Teams</span>
                      <span class="version-detail-value">{{ getTeamNames() }}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Version History Tab -->
            <div class="tab-pane fade version-tab-pane" id="versions" role="tabpanel" aria-labelledby="versions-tab">
              <section class="version-content-section">
                <h3 class="version-section-title">
                  <i class="fas fa-code-branch version-me-2"></i>
                  Version History
                  <span class="badge bg-primary version-ms-2">{{ getVersions().length }}</span>
                </h3>

                <div v-if="getVersions().length > 0" class="version-timeline-container">
                  <div v-for="(version, index) in getVersions()" 
                       :key="version.id || index" 
                       class="version-timeline-item"
                       :class="{ 'version-active-item': version.active === 1 }">
                    
                    <div class="version-timeline-badge">
                      <div class="version-badge-circle" :class="{ 'badge-active-circle': version.active === 1 }">
                        <i v-if="version.active === 1" class="fas fa-star"></i>
                        <span v-else>{{ version.versionNumber || index + 1 }}</span>
                      </div>
                    </div>

                    <div class="version-timeline-content">
                      <div class="version-timeline-header">
                        <div class="version-timeline-title">
                          <span class="version-title-text">Version {{ version.versionNumber || index + 1 }}</span>
                          <span v-if="version.active === 1" class="version-active-badge">
                            <i class="fas fa-check-circle version-me-1"></i>
                            Active
                          </span>
                        </div>
                      </div>

                      <div class="version-info-grid">
                        <div class="version-info-item">
                          <i class="fas fa-user-check text-primary"></i>
                          <div class="version-info-text">
                            <span class="version-info-label">Action By</span>
                            <span class="version-info-value">{{ getUserName(version.action_by) || getUserName(version.uploaded_by) || 'N/A' }}</span>
                          </div>
                        </div>

                        <div class="version-info-item">
                          <i class="far fa-calendar-plus text-success"></i>
                          <div class="version-info-text">
                            <span class="version-info-label">Created At</span>
                            <span class="version-info-value">{{ formatDateTime(version.created_at) }}</span>
                          </div>
                        </div>

                        <div class="version-info-item">
                          <i class="far fa-calendar-alt text-warning"></i>
                          <div class="version-info-text">
                            <span class="version-info-label">Updated At</span>
                            <span class="version-info-value">{{ formatDateTime(version.updated_at) }}</span>
                          </div>
                        </div>

                        <div class="version-info-item">
                          <i class="fas fa-info-circle text-info"></i>
                          <div class="version-info-text">
                            <span class="version-info-label">Status</span>
                            <span class="version-info-value">{{ version.status || 'N/A' }}</span>
                          </div>
                        </div>

                        <div v-if="version.published_date" class="version-info-item">
                          <i class="far fa-calendar-check text-success"></i>
                          <div class="version-info-text">
                            <span class="version-info-label">Published Date</span>
                            <span class="version-info-value">{{ formatDate(version.published_date) }}</span>
                          </div>
                        </div>

                        <div v-if="version.filename" class="version-info-item">
                          <i class="fas fa-paperclip text-secondary"></i>
                          <div class="version-info-text">
                            <span class="version-info-label">Attachment</span>
                            <span class="version-info-value version-truncate">{{ version.filename }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-muted version-my-3 version-text-center">
                  <i class="fas fa-code-branch version-me-2"></i>
                  No version history available
                </div>
              </section>
            </div>

            <!-- Active Content Tab -->
            <div class="tab-pane fade version-tab-pane" id="content" role="tabpanel" aria-labelledby="content-tab">
              <section class="version-content-section">
                <h3 class="version-section-title">
                  <i class="fas fa-file-lines version-me-2"></i>
                  Active Version Content
                  <span class="badge bg-success version-ms-2">
                    <i class="fas fa-star version-me-1"></i>
                    v{{ getActiveVersion().versionNumber || 1 }}
                  </span>
                </h3>
                <div class="version-content-box" v-html="getActiveVersion().content || 'No content available'"></div>
              </section>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="version-modal-footer">
          <div class="version-footer-actions">
            <button class="btn btn-outline-secondary" @click="closeModal">
              <i class="fas fa-times version-me-2"></i>Close
            </button>
          </div>
          <div class="version-document-info">
            <span>Last updated: {{ formatDateTime(document.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'DocumentPdfPreviewModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    document: {
      type: Object,
      required: true,
      default: () => ({})
    },
    dropdownOptions: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    
    getActiveVersion() {
      if (!this.document.versionnotes || this.document.versionnotes.length === 0) {
        return {
          content: this.document.content,
          notes: this.document.notes,
          clauses: this.document.clauses,
          versionNumber: 1,
          published_date: this.document.published_date,
          updated_at: this.document.updated_at,
          created_at: this.document.created_at,
          status: this.document.status
        };
      }
      const activeVersion = this.document.versionnotes.find(v => v.active === 1);
      return activeVersion || this.document.versionnotes[this.document.versionnotes.length - 1];
    },

    getVersions() {
      if (!this.document.versionnotes || this.document.versionnotes.length === 0) {
        return [];
      }
      return [...this.document.versionnotes].sort((a, b) => {
        return (b.versionNumber || 0) - (a.versionNumber || 0);
      });
    },

    getUserName(userId) {
      if (!userId || !this.dropdownOptions?.users) return null;
      const user = this.dropdownOptions.users.find(u => u.id === userId);
      return user ? user.full_name : null;
    },

    getStakeholderNames() {
      if (!this.document.stakeholder_ids || !Array.isArray(this.document.stakeholder_ids) || this.document.stakeholder_ids.length === 0) {
        return 'N/A';
      }
      const names = this.document.stakeholder_ids
        .map(id => this.getUserName(id))
        .filter(name => name !== null);
      return names.length > 0 ? names.join(', ') : 'N/A';
    },

    getTeamNames() {
      if (!this.document.team_ids || !Array.isArray(this.document.team_ids) || this.document.team_ids.length === 0) {
        return 'N/A';
      }
      if (!this.dropdownOptions?.teams) return 'N/A';
      
      const names = this.document.team_ids
        .map(id => {
          const team = this.dropdownOptions.teams.find(t => t.id === id);
          return team ? team.name : null;
        })
        .filter(name => name !== null);
      return names.length > 0 ? names.join(', ') : 'N/A';
    },

    hasValidClauses(clauses) {
      return clauses && Array.isArray(clauses) && clauses.some(c => c && c.trim() !== '');
    },

    getValidClausesCount(clauses) {
      if (!clauses || !Array.isArray(clauses)) return 0;
      return clauses.filter(c => c && c.trim() !== '').length;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } catch (error) {
        return 'N/A';
      }
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'N/A';
      }
    },

    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', this.handleKeydown);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleKeydown);
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }
};
</script>

<style scoped>
/* Full-screen modal styling */
.version-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1050;
  overflow-y: auto;
  padding: 2rem;
}

.version-modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header Styles */
.version-modal-header {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-header-content {
  flex: 1;
}

.version-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #212529;
}

.version-meta {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
  flex-wrap: wrap;
}

.version-meta-item {
  display: flex;
  align-items: center;
}

.version-modal-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  margin-left: 1rem;
}

.version-modal-close:hover {
  color: #212529;
}

/* Tab Navigation */
.version-nav-tabs {
  background: #fff;
  border-bottom: 2px solid #dee2e6;
  padding: 0 2rem;
  margin: 0;
  display: flex;
  gap: 0.5rem;
}

.version-nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #6c757d;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.version-nav-link:hover {
  color: #0d6efd;
  background: #f8f9fa;
}

.version-nav-link.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: transparent;
}

/* Body Styles */
.version-modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
  background: #f8f9fa;
}

.version-tab-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
}

.version-content-section {
  margin-bottom: 2.5rem;
}

.version-section-title {
  font-size: 1.25rem;
  color: #0d6efd;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

/* General Details Grid */
.version-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.version-detail-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  transition: all 0.3s;
}

.version-detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.version-detail-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.version-detail-icon-primary {
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.version-detail-icon-success {
  background: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.version-detail-icon-warning {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.version-detail-icon-info {
  background: rgba(13, 202, 240, 0.1);
  color: #0dcaf0;
}

.version-detail-icon-create {
  background: rgba(111, 66, 193, 0.1);
  color: #6f42c1;
}

.version-detail-icon-update {
  background: rgba(214, 51, 132, 0.1);
  color: #d63384;
}

.version-detail-icon-owner {
  background: rgba(102, 16, 242, 0.1);
  color: #6610f2;
}

.version-detail-icon-reviewer {
  background: rgba(253, 126, 20, 0.1);
  color: #fd7e14;
}

.version-detail-icon-stakeholders {
  background: rgba(32, 201, 151, 0.1);
  color: #20c997;
}

.version-detail-icon-teams {
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.version-detail-card-full {
  grid-column: 1 / -1;
}

.version-detail-card-full .version-detail-value {
  white-space: normal;
  overflow: visible;
  text-overflow: initial;
}

.version-detail-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.version-detail-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.version-detail-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Version Timeline */
.version-timeline-container {
  position: relative;
  padding-left: 30px;
}

.version-timeline-container::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.version-timeline-item {
  position: relative;
  padding-bottom: 30px;
  display: flex;
  gap: 20px;
}

.version-timeline-item.version-active-item {
  background: rgba(25, 135, 84, 0.05);
  padding: 15px;
  border-radius: 8px;
  margin-left: -15px;
  padding-left: 30px;
}

.version-timeline-badge {
  position: absolute;
  left: -30px;
  width: 30px;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.version-badge-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #6c757d;
}

.version-badge-circle.badge-active-circle {
  border-color: #198754;
  color: #198754;
  background: rgba(25, 135, 84, 0.1);
  font-size: 1.1rem;
}

.version-timeline-content {
  flex: 1;
  padding-top: 5px;
}

.version-timeline-header {
  margin-bottom: 15px;
}

.version-timeline-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.version-title-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
}

.version-active-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #198754;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Version Info Grid */
.version-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.version-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.version-info-item i {
  font-size: 0.9rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.version-info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.version-info-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.version-info-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-truncate {
  max-width: 180px;
}

/* Content Boxes */
.version-content-box,
.version-notes-box {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1.5rem;
  line-height: 1.6;
  min-height: 150px;
  max-height: 500px;
  overflow-y: auto;
}

.version-content-box:deep(h1),
.version-content-box:deep(h2),
.version-content-box:deep(h3),
.version-notes-box:deep(h1),
.version-notes-box:deep(h2),
.version-notes-box:deep(h3) {
  color: #212529;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 700;
}

.version-content-box:deep(p),
.version-notes-box:deep(p) {
  margin-bottom: 1em;
}

.version-content-box:deep(strong),
.version-notes-box:deep(strong) {
  font-weight: 700;
  color: #212529;
}

/* Clauses */
.version-clauses-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.version-clause-item {
  background: white;
  border: 1px solid #dee2e6;
  border-left: 4px solid #0d6efd;
  border-radius: 6px;
  padding: 1.25rem;
  transition: all 0.3s;
}

.version-clause-item:hover {
  border-left-color: #0a58ca;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.version-clause-title {
  font-size: 1rem;
  color: #0d6efd;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.version-clause-content {
  line-height: 1.6;
  color: #495057;
}

/* Footer Styles */
.version-modal-footer {
  background: #f8f9fa;
  padding: 1.25rem 2rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-footer-actions {
  display: flex;
  gap: 1rem;
}

.version-document-info {
  font-size: 0.85rem;
  color: #6c757d;
}

/* Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Utility Classes */
.version-me-1 {
  margin-right: 0.25rem;
}

.version-me-2 {
  margin-right: 0.5rem;
}

.version-ms-2 {
  margin-left: 0.5rem;
}

.version-my-3 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.version-text-center {
  text-align: center;
}

/* Bootstrap Button Styles */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid transparent;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
  background: transparent;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
}

.bg-primary {
  background-color: #0d6efd !important;
  color: white;
}

.bg-success {
  background-color: #198754 !important;
  color: white;
}

/* Text Colors */
.text-primary {
  color: #0d6efd !important;
}

.text-success {
  color: #198754 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #0dcaf0 !important;
}

.text-secondary {
  color: #6c757d !important;
}

.text-muted {
  color: #6c757d !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .version-modal-overlay {
    padding: 1rem;
  }

  .version-modal-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .version-modal-body {
    padding: 1rem;
  }

  .version-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .version-nav-tabs {
    padding: 0 1rem;
    overflow-x: auto;
  }

  .version-nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .version-details-grid {
    grid-template-columns: 1fr;
  }

  .version-info-grid {
    grid-template-columns: 1fr;
  }

  .version-timeline-container {
    padding-left: 20px;
  }

  .version-timeline-badge {
    left: -20px;
  }

  .version-badge-circle {
    width: 30px;
    height: 30px;
    font-size: 0.75rem;
  }

  .version-modal-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .version-footer-actions {
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>