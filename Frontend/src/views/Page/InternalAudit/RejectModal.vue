<template>
  <v-dialog v-model="isOpen" max-width="650px" persistent>
    <v-card class="reject-modal-card">
      <v-card-title class="reject-modal-header">
        <div class="reject-header-content">
          <div>
            <span class="reject-modal-title">Reject Audit</span>
            <p class="reject-modal-subtitle">Please provide a reason for rejection</p>
          </div>
        </div>
        <v-btn icon @click="close" class="reject-close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="reject-modal-body">
        <!-- Audit Info -->
        <v-alert type="error" variant="tonal" class="audit-info-alert">
          <div class="audit-info-grid">
            <div class="audit-info-item">
              <v-icon size="20" color="#ef4444">mdi-file-document</v-icon>
              <div class="audit-info-text">
                <span class="audit-info-label">Audit</span>
                <span class="audit-info-value">{{ auditName }}</span>
              </div>
            </div>
            <div class="audit-info-item">
              <v-icon size="20" color="#ef4444">mdi-shield-check</v-icon>
              <div class="audit-info-text">
                <span class="audit-info-label">Control</span>
                <span class="audit-info-value">{{ controlName }}</span>
              </div>
            </div>
          </div>
        </v-alert>

        <!-- Warning -->
        <v-alert type="warning" variant="tonal" density="compact" class="warning-alert">
          <template v-slot:prepend>
            <v-icon>mdi-alert</v-icon>
          </template>
          This action will permanently reject the audit
        </v-alert>

        <!-- Reason Input -->
        <v-textarea
          v-model="localReason"
          label="Rejection Reason *"
          placeholder="Enter detailed reason for rejection (minimum 10 characters)..."
          variant="outlined"
          rows="4"
          :rules="[
            v => !!v || 'Rejection reason is required',
            v => (v && v.length >= 10) || 'Reason must be at least 10 characters'
          ]"
          counter
          maxlength="500"
          prepend-inner-icon="mdi-message-text"
          color="#ef4444"
          class="reason-textarea"></v-textarea>
      </v-card-text>

      <v-card-actions class="reject-modal-actions">
        <v-btn variant="outlined" color="#64748b" @click="close" class="cancel-reject-btn">
          <v-icon start>mdi-arrow-left</v-icon>
          Cancel
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="#ef4444"
          variant="flat"
          @click="confirm"
          :loading="processing"
          :disabled="!localReason || localReason.length < 10"
          class="confirm-reject-btn">
          <v-icon start>mdi-close-thick</v-icon>
          Confirm Rejection
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RejectModal',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    auditName: {
      type: String,
      default: 'N/A'
    },
    controlName: {
      type: String,
      default: 'N/A'
    },
    processing: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'confirm'],

  data() {
    return {
      localReason: ''
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
        this.localReason = '';
      }
    }
  },

  methods: {
    confirm() {
      if (this.localReason && this.localReason.length >= 10) {
        this.$emit('confirm', this.localReason);
      }
    },

    close() {
      this.isOpen = false;
      this.localReason = '';
    }
  }
};
</script>

<style scoped>
/* Reject Modal */
.reject-modal-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.reject-modal-header {
  background: #F0F0F0;
  color: white !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reject-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.reject-modal-title {
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  color: black;
}

.reject-modal-subtitle {
  color: black;
  font-size: 0.8rem;
  margin: 0;
}

.reject-close-btn {
  background: rgba(255, 255, 255, 0.2) !important;
}

.reject-close-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.reject-modal-body {
  padding: 2rem !important;
  background: #f8fafc;
}

.audit-info-alert {
  margin-bottom: 1.5rem !important;
  border-radius: 12px !important;
}

.audit-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.audit-info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.audit-info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.audit-info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.audit-info-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}

.reason-textarea {
  margin-top: 1rem;
}

.warning-alert {
  margin-bottom: 1rem !important;
  border-radius: 12px !important;
}

.reject-modal-actions {
  padding: 1rem 1.5rem !important;
  background: white;
  border-top: 2px solid #e2e8f0;
}

.cancel-reject-btn,
.confirm-reject-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 0.5rem 2rem !important;
}

.confirm-reject-btn {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
}

.confirm-reject-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .audit-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>