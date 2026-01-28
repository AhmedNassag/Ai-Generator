<template>
  <v-dialog v-model="dialogVisible" max-width="550px" persistent>
    <v-card class="reset-modal">
      <v-card-title class="modal-header">
        <span class="modal-title">{{ $t('risk.reset_risk_mitigation') }}</span>
        <v-btn icon @click="handleClose" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-body">
        <v-container>
          <v-row>
            <v-col cols="12">
              <div class="confirmation-content">
                <div class="warning-icon-wrapper">
                  <v-icon size="72" color="warning" class="warning-icon">mdi-alert-circle</v-icon>
                </div>
                <h3 class="confirmation-title">{{ $t('risk.are_you_sure_reset_mitigation') }}</h3>
                <p class="confirmation-message">{{ $t('risk.reset_mitigation_warning') }}</p>
                <div class="warning-details">
                  <div class="warning-item">
                    <v-icon size="20" color="error">mdi-close-circle</v-icon>
                    <span>{{ $t('risk.all_mitigation_data_will_be_cleared') }}</span>
                  </div>
                  <div class="warning-item">
                    <v-icon size="20" color="error">mdi-close-circle</v-icon>
                    <span>{{ $t('risk.this_action_cannot_be_undone') }}</span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="modal-actions">
        <v-spacer></v-spacer>
        <v-btn 
          color="error" 
          @click="handleClose"
          variant="outlined"
          class="cancel-btn"
          :disabled="loading">
          {{ $t('risk.cancel') }}
        </v-btn>
        <v-btn 
          color="primary" 
          :loading="loading" 
          :disabled="loading" 
          @click="handleConfirm"
          class="confirm-btn">
          <v-icon left size="20">mdi-refresh</v-icon>
          {{ $t('risk.confirm_reset') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ResetMitigationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show', 'confirm', 'close'],
  computed: {
    dialogVisible: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('update:show', value);
      }
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleClose() {
      this.$emit('close');
      this.$emit('update:show', false);
    }
  }
};
</script>

<style scoped>
.v-overlay {
    backdrop-filter: blur(8px);
}
.reset-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.v-dialog .v-card .v-card-title .v-btn {
    color: black !important;
    background: white !important;
    border-radius: 8px !important;
}
.modal-header {
  background: #F0F0F0;
  color: white !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-weight: 700 !important;
  font-size: 1.25rem !important;
  color: black;
}

.close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: rotate(90deg);
}

.modal-body {
  padding: 2.5rem 2rem !important;
  background: linear-gradient(to bottom, #fff9f0 0%, #ffffff 100%);
}

.confirmation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

.warning-icon-wrapper {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 50%;
  padding: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
  }
}

.warning-icon {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.confirmation-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
}

.confirmation-message {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
}

.warning-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  margin-top: 0.5rem;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border-radius: 8px;
  border-left: 3px solid #d32f2f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.warning-item span {
  font-size: 0.9rem;
  color: #2c3e50;
  text-align: left;
  font-weight: 500;
}

.modal-actions {
  padding: 1rem 1.5rem !important;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.confirm-btn {
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
  transition: all 0.3s ease;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

.cancel-btn {
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  background-color: rgba(211, 47, 47, 0.04) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-body {
    padding: 1.5rem 1rem !important;
  }

  .confirmation-title {
    font-size: 1.25rem;
  }

  .confirmation-message {
    font-size: 0.9rem;
  }

  .warning-icon-wrapper {
    padding: 1rem;
  }

  .warning-icon {
    font-size: 56px !important;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .confirm-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>