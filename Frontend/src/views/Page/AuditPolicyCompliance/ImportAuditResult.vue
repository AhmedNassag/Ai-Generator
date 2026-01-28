<template>
  <transition name="modal-backdrop" appear>
    <div class="modal-backdrop" v-if="isVisibleImportModal" @click.self="closeImportModal">
      <transition name="modal-scale" appear>
        <div class="modal-container">
          <v-card class="upload-modal" :elevation="0">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="header-content">
                <div class="header-text">
                  <h2 class="header-title">{{ $t('auditpolicycompliance.Upload Audit Results') }}</h2>
                  <p class="header-subtitle">{{ $t('auditpolicycompliance.Import audit compliance data from Excel/CSV')
                    }}</p>
                </div>
                <v-btn icon @click="closeImportModal" class="close-btn" size="large">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="modal-body">
              <!-- Form Section -->
              <div class="form-section">
                <div class="section-card">
                  <div class="card-header">
                    <div class="status-indicator"></div>
                    <h3 class="section-title d-flex rtl">
                      {{ isEditing ? 'Update Audit Data' : 'Import New Audit Data' }}
                    </h3>
                  </div>

                  <!-- File Upload Form -->
                  <div class="form-content">
                    <v-form @submit.prevent="handleSubmit" class="enhanced-form">
                      <div class="form-fields">
                        <div class="field-group">
                          <v-file-input v-model="file" accept=".xlsx,.xls,.csv" label="Select audit results file"
                            prepend-icon="mdi-file-excel" class="enhanced-field" :rules="fileRules" required show-size
                            outlined dense></v-file-input>
                          <p class="file-hint">
                            {{ $t('auditpolicycompliance.Supported formats: .xlsx, .xls, .csv (Max size: 5MB)') }}
                          </p>
                        </div>

                        <div class="field-group" v-if="uploadProgress > 0">
                          <v-progress-linear :value="uploadProgress" height="8" color="primary" striped
                            rounded></v-progress-linear>
                          <span class="progress-text">{{ uploadProgress }}% uploaded</span>
                        </div>
                      </div>

                      <div class="modal-actions">
                        <div class="actions-container">
                          <v-btn @click="closeImportModal" variant="outlined" class="cancel-btn">
                            {{ $t('auditpolicycompliance.Cancel') }}
                          </v-btn>
                          <v-btn type="submit" color="primary" class="submit-btn" :loading="isUploading"
                            :disabled="!file">
                            {{ isUploading ? 'Uploading...' : 'Upload File' }}
                          </v-btn>
                        </div>
                      </div>
                    </v-form>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import AuditPolicyComplianceResult from "@/API/AuditPolicyComplianceResult/AuditPolicyComplianceResult";
import { notify } from "@kyvg/vue3-notification";
import axios from "axios";

export default {
  name: "ImportAuditResult",
  props: {
    isVisibleImportModal: {
      type: Boolean,
      required: true
    },
    userId: {
      type: [String, Number],
      required: false
    }
  },
  data() {
    return {
      auditPolicyComplianceResultApi: new AuditPolicyComplianceResult(),
      file: null,
      isUploading: false,
      uploadProgress: 0,
      fileRules: [
        value => {
          if (!value) return 'File is required';
          if (value.size > 5 * 1024 * 1024) return 'File size should be less than 5MB!';
          const validExtensions = ['.xlsx', '.xls', '.csv'];
          const extension = value.name.substring(value.name.lastIndexOf('.')).toLowerCase();
          return validExtensions.includes(extension) || 'Invalid file format';
        }
      ]
    };
  },
  methods: {
    closeImportModal() {
      this.file = null;
      this.uploadProgress = 0;
      this.isUploading = false;
      this.$emit('closeImportModal');
    },

    async handleSubmit() {
      if (!this.file) return;

      this.isUploading = true;
      this.uploadProgress = 0;

      const formData = new FormData();
      formData.append('file', this.file);
      formData.append('userId', this.userId);

      try {
        const config = {
          onUploadProgress: progressEvent => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        };

        const response = await this.auditPolicyComplianceResultApi.importResultExcel(
          formData,
          config
        );
        if (response.data.status === "success") {
          notify({
            title: 'Success',
            text: 'Audit results uploaded successfully!',
            type: 'success'
          });
          this.closeImportModal();
          // Also emit a specific event to trigger data refresh
          this.$emit('refresh-data');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        notify({
          title: 'Upload Failed',
          text: error.response?.data?.message || 'An error occurred during upload',
          type: 'error'
        });
      } finally {
        this.isUploading = false;
      }
    }
  },
  watch: {
    isVisibleImportModal(newVal) {
      if (newVal) {
        // Reset form when modal opens
        this.file = null;
        this.uploadProgress = 0;
        this.isUploading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Base Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow-y: auto;
  padding: 2rem;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  margin: auto;
  position: relative;
}

.upload-modal {
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Modal Header Styles */
.modal-header {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-text {
  flex-grow: 1;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.close-btn {
  color: #6c757d;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #2c3e50;
  transform: rotate(90deg);
}

/* Modal Body Styles */
.modal-body {
  padding: 1.5rem;
  background: white;
}

.section-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8f9fa;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6c757d;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
}

/* Form Styles */
.form-content {
  padding: 1.25rem;
}

.enhanced-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.enhanced-field {
  border-radius: 4px !important;
}

.file-hint {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.progress-text {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  margin-top: 0.25rem;
}

/* Modal Actions */
.modal-actions {
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.actions-container {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.submit-btn {
  box-shadow: 0 2px 4px rgba(30, 41, 59, 0.1);
  transition: all 0.2s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(30, 41, 59, 0.15);
}

.cancel-btn {
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f8fafc;
}

/* Transitions */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>