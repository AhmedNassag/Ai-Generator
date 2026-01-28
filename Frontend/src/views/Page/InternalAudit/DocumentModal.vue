<template>
  <v-dialog v-model="isOpen" max-width="900px" persistent scrollable>
    <v-card class="versions-modal-card">
      <!-- Header -->
      <v-card-title class="versions-modal-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="32" color="white">mdi-file-document-multiple</v-icon>
          </div>
          <div class="header-text">
            <h2 class="modal-title">{{ document?.name || 'Document' }}</h2>
            <p class="modal-subtitle">
              <v-icon size="16">mdi-calendar</v-icon>
              Created: {{ formatDate(document?.created_at) }}
            </p>
          </div>
        </div>
        <v-btn icon variant="text" @click="close" class="close-btn">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Body -->
      <v-card-text class="versions-modal-body">
        <v-container v-if="document && document.versionnotes" fluid class="pa-0">
          <!-- Versions Count Banner -->
          <div class="versions-banner">
            <div class="banner-info">
              <v-icon color="#6e3894" size="24">mdi-history</v-icon>
              <span class="banner-text">
                <strong>{{ document.versionnotes.length }}</strong> 
                {{ document.versionnotes.length === 1 ? 'Version' : 'Versions' }} Available
              </span>
            </div>
          </div>

          <!-- Versions Timeline -->
          <div class="versions-timeline">
            <div 
              v-for="(version, index) in document.versionnotes" 
              :key="version.id"
              class="version-card"
              :class="{ 'active-version': version.active }"
            >
              <!-- Version Header -->
              <div class="version-header">
                <div class="version-number-badge">
                  <v-icon size="20" color="white">mdi-numeric-{{ version.versionNumber }}-circle</v-icon>
                  <span>Version {{ version.versionNumber }}</span>
                  <v-chip 
                    v-if="version.active" 
                    size="x-small" 
                    color="#10b981"
                    class="ml-2"
                  >
                    Active
                  </v-chip>
                </div>
                <div class="version-meta">
                  <v-chip size="small" variant="tonal" color="#6e3894">
                    <v-icon start size="16">mdi-calendar-clock</v-icon>
                    {{ formatDate(version.created_at) }}
                  </v-chip>
                </div>
              </div>

              <!-- Version Details Grid -->
              <div class="version-details">
                <!-- Status -->
                <div class="detail-item">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-information</v-icon>
                    Status
                  </div>
                  <div class="detail-value">
                    <v-chip size="small" :color="getStatusColor(version.status)">
                      {{ version.status || 'N/A' }}
                    </v-chip>
                  </div>
                </div>

                <!-- Privacy -->
                <div class="detail-item">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-shield-lock</v-icon>
                    Privacy
                  </div>
                  <div class="detail-value">
                    <v-chip 
                      size="small" 
                      :color="version.privacy === 'public' ? '#3b82f6' : '#f59e0b'"
                    >
                      {{ version.privacy || 'N/A' }}
                    </v-chip>
                  </div>
                </div>

                <!-- Published Date -->
                <div class="detail-item" v-if="version.published_date">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-publish</v-icon>
                    Published
                  </div>
                  <div class="detail-value">
                    {{ formatDate(version.published_date) }}
                  </div>
                </div>

                <!-- Expiration Date -->
                <div class="detail-item" v-if="version.expiration_date">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-calendar-remove</v-icon>
                    Expires
                  </div>
                  <div class="detail-value">
                    <v-chip size="small" color="#ef4444">
                      {{ formatDate(version.expiration_date) }}
                    </v-chip>
                  </div>
                </div>

                <!-- Expiry Days -->
                <div class="detail-item" v-if="version.expiry_days">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-timer-sand</v-icon>
                    Expiry Days
                  </div>
                  <div class="detail-value">
                    <v-chip size="small" color="#f59e0b">
                      {{ version.expiry_days }} days
                    </v-chip>
                  </div>
                </div>

                <!-- Uploaded By -->
                <div class="detail-item" v-if="version.uploaded_by">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-account-upload</v-icon>
                    Uploaded By
                  </div>
                  <div class="detail-value">
                    <v-chip size="small" color="#8b5cf6">
                      {{ getUserName(version.uploaded_by) }}
                    </v-chip>
                  </div>
                </div>

                <!-- Action By -->
                <div class="detail-item" v-if="version.action_by">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-account-check</v-icon>
                    Action By
                  </div>
                  <div class="detail-value">
                    <v-chip size="small" color="#3b82f6">
                      {{ getUserName(version.action_by) }}
                    </v-chip>
                  </div>
                </div>

                <!-- Last Updated -->
                <div class="detail-item">
                  <div class="detail-label">
                    <v-icon size="18" color="#64748b">mdi-update</v-icon>
                    Last Updated
                  </div>
                  <div class="detail-value">
                    {{ formatDate(version.updated_at) }}
                  </div>
                </div>
              </div>

              <!-- Content Section -->
              <div class="version-content-section" v-if="version.content">
                <div class="content-header">
                  <v-icon color="#6e3894" size="20">mdi-text-box</v-icon>
                  <span>Content</span>
                </div>
                <div class="content-box" v-html="version.content"></div>
              </div>

              <!-- Notes Section -->
              <div class="version-content-section" v-if="version.notes">
                <div class="content-header">
                  <v-icon color="#f59e0b" size="20">mdi-note-text</v-icon>
                  <span>Notes</span>
                </div>
                <div class="content-box" v-html="version.notes"></div>
              </div>

              <!-- Clauses Section -->
              <div class="version-content-section" v-if="version.clauses && version.clauses.length > 0 && version.clauses[0]">
                <div class="content-header">
                  <v-icon color="#8b5cf6" size="20">mdi-format-list-numbered</v-icon>
                  <span>Clauses</span>
                </div>
                <div class="clauses-list">
                  <div 
                    v-for="(clause, idx) in version.clauses.filter(c => c)" 
                    :key="idx"
                    class="clause-item"
                  >
                    <v-chip size="x-small" color="#8b5cf6" class="clause-badge">
                      {{ idx + 1 }}
                    </v-chip>
                    <div class="clause-content" v-html="clause"></div>
                  </div>
                </div>
              </div>

              <!-- File Info -->
              <div class="version-file-info" v-if="version.filename || version.filepath">
                <v-icon color="#64748b" size="18">mdi-file</v-icon>
                <span class="file-name">{{ version.filename || 'File attached' }}</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="document.versionnotes.length === 0" class="empty-state">
            <v-icon size="64" color="#cbd5e1">mdi-file-document-remove</v-icon>
            <p class="empty-text">No versions available</p>
          </div>
        </v-container>

        <!-- Loading State -->
        <div v-else class="loading-state">
          <v-progress-circular indeterminate color="#6e3894" size="64"></v-progress-circular>
          <p class="loading-text">Loading versions...</p>
        </div>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="versions-modal-footer">
        <v-spacer></v-spacer>
        <v-btn 
          color="#6e3894" 
          variant="flat" 
          @click="close" 
          class="close-modal-btn"
          size="large"
        >
          <v-icon start>mdi-close</v-icon>
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DocumentVersionsModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    document: {
      type: Object,
      default: null
    },
    users: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:modelValue'],

  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },

  methods: {
    close() {
      this.isOpen = false;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      if (typeof dateString === 'object' && dateString.$date) {
        dateString = dateString.$date;
      }

      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getUserName(userId) {
      if (!userId) return 'N/A';
      const userIdStr = typeof userId === 'object' && userId.$oid ? userId.$oid : userId;
      const user = this.users.find(u =>
        u.id === userIdStr ||
        u._id === userIdStr ||
        (u._id && u._id.$oid === userIdStr)
      );
      return user?.full_name || userIdStr;
    },

    getStatusColor(status) {
      const colors = {
        'step 1': '#3b82f6',
        'step 2': '#f59e0b',
        'step 3': '#10b981',
        'step 4': '#8b5cf6',
        'completed': '#10b981',
        'pending': '#f59e0b',
        'draft': '#64748b'
      };
      return colors[status?.toLowerCase()] || '#64748b';
    }
  }
};
</script>

<style scoped>
/* Modal Card */
.versions-modal-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

/* Header */
.versions-modal-header {
  background: #f8f9fa;
  padding: 1.5rem 2rem !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e2e8f0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.header-icon {
  background: #6e3894;
  padding: 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  flex: 1;
}

.modal-title {
  color: #000000;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.modal-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.modal-subtitle .v-icon {
  color: #64748b !important;
}

.close-btn {
  background: rgba(110, 56, 148, 0.1) !important;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(110, 56, 148, 0.2) !important;
  transform: rotate(90deg);
}

.close-btn .v-icon {
  color: #6e3894 !important;
}

/* Body */
.versions-modal-body {
  padding: 0 !important;
  background: #f8fafc;
  max-height: 65vh;
}

/* Versions Banner */
.versions-banner {
  background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%);
  padding: 1.25rem 2rem;
  border-bottom: 2px solid #d8b4fe;
  position: sticky;
  top: 0;
  z-index: 10;
}

.banner-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.banner-text {
  color: #6e3894;
  font-size: 1rem;
  font-weight: 500;
}

.banner-info .v-icon {
  color: #6e3894 !important;
}

/* Versions Timeline */
.versions-timeline {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Version Card */
.version-card {
  background: white;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.version-card:hover {
  border-color: #6e3894;
  box-shadow: 0 10px 15px -3px rgba(110, 56, 148, 0.1), 0 4px 6px -2px rgba(110, 56, 148, 0.05);
  transform: translateY(-2px);
}

.version-card.active-version {
  border-color: #10b981;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.version-card.active-version::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #10b981;
  border-radius: 16px 0 0 16px;
}

/* Version Header */
.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.version-number-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6e3894 0%, #8b5cf6 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
}

.version-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Version Details Grid */
.version-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

/* Content Section */
.version-content-section {
  margin-top: 1.5rem;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.content-box {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  line-height: 1.7;
  color: #475569;
}

.content-box :deep(p) {
  margin-bottom: 0.75rem;
}

.content-box :deep(p:last-child) {
  margin-bottom: 0;
}

.content-box :deep(strong) {
  color: #1e293b;
  font-weight: 700;
}

/* Clauses */
.clauses-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.clause-item {
  display: flex;
  gap: 0.75rem;
  align-items: start;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
}

.clause-badge {
  flex-shrink: 0;
}

.clause-content {
  flex: 1;
  line-height: 1.6;
  color: #475569;
}

/* File Info */
.version-file-info {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  border: 2px solid #fde047;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-name {
  color: #92400e;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.loading-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #6e3894;
  margin: 0;
}

/* Footer */
.versions-modal-footer {
  padding: 1.25rem 2rem !important;
  background: white;
  border-top: 2px solid #e2e8f0;
}

.close-modal-btn {
  text-transform: none !important;
  font-weight: 700 !important;
  padding: 0.75rem 2.5rem !important;
  border-radius: 12px !important;
  letter-spacing: 0.025em;
  background-color: #6e3894 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .versions-modal-header {
    padding: 1.25rem !important;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .versions-timeline {
    padding: 1rem;
  }

  .version-card {
    padding: 1rem;
  }

  .version-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .version-details {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>