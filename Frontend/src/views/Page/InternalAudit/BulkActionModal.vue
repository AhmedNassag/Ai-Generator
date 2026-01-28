<template>
  <v-dialog v-model="isOpen" max-width="900px" persistent scrollable>
    <v-card class="bulk-modal-card">
      <v-card-title class="bulk-modal-header">
        <div class="bulk-header-content">
          <div>
            <span class="bulk-modal-title">Bulk Action</span>
            <p class="bulk-modal-subtitle">Update status for all audit records at once</p>
          </div>
        </div>
        <v-btn icon @click="close" class="bulk-close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="bulk-modal-body">
        <!-- Stats Card -->
        <v-card class="stats-card" elevation="0">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon total-icon">
                <v-icon color="#6E3894" size="24">mdi-format-list-bulleted</v-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">Total Records</span>
                <span class="stat-value">{{ totalCount }}</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon pending-icon">
                <v-icon color="#f59e0b" size="24">mdi-clock-outline</v-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">Pending</span>
                <span class="stat-value">{{ pendingCount }}</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon approved-icon">
                <v-icon color="#10b981" size="24">mdi-check-circle</v-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">Approved</span>
                <span class="stat-value">{{ approvedCount }}</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon rejected-icon">
                <v-icon color="#ef4444" size="24">mdi-close-circle</v-icon>
              </div>
              <div class="stat-content">
                <span class="stat-label">Rejected</span>
                <span class="stat-value">{{ rejectedCount }}</span>
              </div>
            </div>
          </div>
        </v-card>

        <!-- Action Selection -->
        <v-card class="action-selection-card" elevation="0">
          <div class="action-selection-header">
            <v-icon color="#6E3894" size="20">mdi-hand-pointing-right</v-icon>
            <span class="action-selection-title">Choose Bulk Action (applies to all records)</span>
          </div>
          <v-divider></v-divider>
          <div class="action-buttons-grid">
            <v-btn
              :variant="localBulkAction === 'approve' ? 'flat' : 'outlined'"
              :color="localBulkAction === 'approve' ? '#10b981' : '#cbd5e1'"
              size="large"
              class="action-select-btn"
              @click="selectAction('approve')">
              <v-icon start size="24">mdi-check-all</v-icon>
              <div class="btn-content">
                <span class="btn-title">Approve All</span>
                <span class="btn-subtitle">{{ totalCount }} total records</span>
              </div>
            </v-btn>

            <v-btn
              :variant="localBulkAction === 'reject' ? 'flat' : 'outlined'"
              :color="localBulkAction === 'reject' ? '#ef4444' : '#cbd5e1'"
              size="large"
              class="action-select-btn"
              @click="selectAction('reject')">
              <v-icon start size="24">mdi-close-box-multiple</v-icon>
              <div class="btn-content">
                <span class="btn-title">Reject All</span>
                <span class="btn-subtitle">{{ totalCount }} total records</span>
              </div>
            </v-btn>
          </div>
        </v-card>

        <!-- Comment/Reason Field (shown for reject) -->
        <v-card v-if="localBulkAction === 'reject'" class="comment-card" elevation="0">
          <div class="comment-header">
            <v-icon color="#ef4444" size="20">mdi-message-text</v-icon>
            <span class="comment-title">Rejection Reason (Required)</span>
          </div>
          <v-divider></v-divider>
          <div class="comment-body">
            <v-textarea
              v-model="localBulkComment"
              placeholder="Provide a detailed reason for bulk rejection (minimum 10 characters)..."
              variant="outlined"
              rows="4"
              counter
              maxlength="500"
              :rules="[
                v => !!v || 'Reason is required for rejection',
                v => (v && v.length >= 10) || 'Reason must be at least 10 characters'
              ]"
              color="#ef4444"></v-textarea>
          </div>
        </v-card>

        <!-- Warning Alert -->
        <v-alert
          v-if="localBulkAction"
          :type="localBulkAction === 'approve' ? 'success' : 'error'"
          variant="tonal"
          density="compact"
          class="warning-alert">
          <template v-slot:prepend>
            <v-icon>{{ localBulkAction === 'approve' ? 'mdi-information' : 'mdi-alert' }}</v-icon>
          </template>
          This will {{ localBulkAction }} ALL {{ totalCount }} audit record(s) regardless of current status. This action cannot be undone.
        </v-alert>
      </v-card-text>

      <v-card-actions class="bulk-modal-actions">
        <v-btn variant="outlined" color="#64748b" @click="close" class="cancel-bulk-btn">
          <v-icon start>mdi-arrow-left</v-icon>
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :color="localBulkAction === 'approve' ? '#10b981' : '#ef4444'"
          variant="flat"
          @click="confirm"
          :loading="processing"
          :disabled="!localBulkAction || (localBulkAction === 'reject' && (!localBulkComment || localBulkComment.length < 10))"
          class="confirm-bulk-btn">
          <v-icon start>{{ localBulkAction === 'approve' ? 'mdi-check-all' : 'mdi-close-box-multiple' }}</v-icon>
          Confirm {{ localBulkAction === 'approve' ? 'Approval' : 'Rejection' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'BulkActionModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    totalCount: {
      type: Number,
      default: 0
    },
    pendingCount: {
      type: Number,
      default: 0
    },
    approvedCount: {
      type: Number,
      default: 0
    },
    rejectedCount: {
      type: Number,
      default: 0
    },
    processing: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'confirm'],

  data() {
    return {
      localBulkAction: null,
      localBulkComment: ''
    };
  },

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

  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },

  methods: {
    selectAction(action) {
      this.localBulkAction = action;
      this.localBulkComment = '';
    },

    confirm() {
      this.$emit('confirm', {
        action: this.localBulkAction,
        comment: this.localBulkComment
      });
    },

    close() {
      this.isOpen = false;
      this.resetForm();
    },

    resetForm() {
      this.localBulkAction = null;
      this.localBulkComment = '';
    }
  }
};
</script>

<style scoped>
/* Bulk Action Modal */
.bulk-modal-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.bulk-modal-header {
  background: #F0F0F0;
  color: white !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.bulk-modal-title {
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  color: black;
}

.bulk-modal-subtitle {
  color: black;
  font-size: 0.8rem;
  margin: 0;
}

.bulk-close-btn {
  background: rgba(255, 255, 255, 0.2) !important;
}

.bulk-close-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: rotate(90deg);
}

.bulk-modal-body {
  padding: 2rem !important;
  background: #f8fafc;
}

/* Stats Card */
.stats-card {
  background: white !important;
  border-radius: 12px !important;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 2px solid #e2e8f0 !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.total-icon {
  background: #ede9fe;
}

.pending-icon {
  background: #fef3c7;
}

.approved-icon {
  background: #d1fae5;
}

.rejected-icon {
  background: #fee2e2;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

/* Action Selection Card */
.action-selection-card {
  background: white !important;
  border-radius: 12px !important;
  margin-bottom: 1.5rem;
  border: 2px solid #e2e8f0 !important;
  overflow: hidden;
}

.action-selection-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.action-selection-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1.5rem;
}

.action-select-btn {
  height: auto !important;
  min-height: 80px !important;
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  padding: 1.25rem !important;
  border-width: 2px !important;
  transition: all 0.3s ease !important;
}

.action-select-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-left: 0.5rem;
}

.btn-title {
  font-size: 1rem;
  font-weight: 700;
}

.btn-subtitle {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Comment Card */
.comment-card {
  background: white !important;
  border-radius: 12px !important;
  margin-bottom: 1.5rem;
  border: 2px solid #e2e8f0 !important;
  overflow: hidden;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.comment-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
}

.comment-body {
  padding: 1.5rem;
}

.warning-alert {
  margin-bottom: 0 !important;
  border-radius: 12px !important;
}

.bulk-modal-actions {
  padding: 1rem 1.5rem !important;
  background: white;
  border-top: 2px solid #e2e8f0;
}

.cancel-bulk-btn,
.confirm-bulk-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 0.5rem 2rem !important;
}

.confirm-bulk-btn {
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3) !important;
}

.confirm-bulk-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4) !important;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>