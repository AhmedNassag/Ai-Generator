<template>
    <transition name="modal-backdrop" appear>
        <div class="modal-backdrop" v-if="isVisibleEvidenceModal" @click.self="closeModal">
            <transition name="modal-scale" appear>
                <div class="modal-container">
                    <v-card class="evidence-modal" :elevation="0">
                        <!-- Animated Background Pattern -->
                        <div class="bg-pattern">
                            <div class="pattern-grid"></div>
                            <div class="pattern-glow"></div>
                        </div>

                        <!-- Modal Header with Glassmorphism -->
                        <div class="modal-header">
                            <div class="header-glass">
                                <div class="header-content">
                                    <div class="header-icon-container">
                                        <div class="icon-ring"></div>
                                        <v-icon class="header-icon">mdi-shield-check</v-icon>
                                    </div>
                                    <div class="header-text">
                                        <h2 class="header-title">{{ $t('complianceresultaudit.Evidence Vault') }}</h2>
                                        <p class="header-subtitle">{{ $t('complianceresultaudit.Secure compliance documentation management') }}</p>
                                    </div>
                                </div>
                                <v-btn icon @click="closeModal" class="close-btn" size="large">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </div>
                        </div>

                        <div class="modal-body">
                            <!-- Form Section with Enhanced Design -->
                            <div class="form-section">
                                <div class="section-card">
                                    <div class="card-header">
                                        <div class="status-indicator"></div>
                                        <h3 class="section-title d-flex rtl">
                                            {{ isEditing ? 'Update Evidence' : 'Submit New Evidence' }}
                                        </h3>
                                        <p class="section-subtitle">
                                            {{ isEditing ? 'Modify existing evidence details' : 'Add new compliance documentation' }}
                                        </p>
                                    </div>

                                    <v-form ref="evidenceForm" @submit.prevent="submitEvidence" class="enhanced-form">
                                        <div class="form-fields">
                                            <div class="field-group">
                                                <label class="field-label">Requirement Name</label>
                                                <v-text-field v-model="evidence.name" :rules="nameRules"
                                                    variant="solo-filled" bg-color="rgba(255,255,255,0.05)"
                                                    class="enhanced-field" clearable :focused="true"
                                                    :readonly="isAuditer || !isNotEndAudit">
                                                    <template v-slot:prepend-inner>
                                                        <v-icon color="primary">mdi-file-document</v-icon>
                                                    </template>
                                                </v-text-field>
                                            </div>

                                            <div class="field-group">
                                                <label class="field-label">Description</label>
                                                <v-textarea v-model="evidence.description" :rules="descriptionRules"
                                                    variant="solo-filled" bg-color="rgba(255,255,255,0.05)" rows="4"
                                                    class="enhanced-field" auto-grow clearable :readonly="isAuditer || !isNotEndAudit">
                                                    <template v-slot:prepend-inner>
                                                        <v-icon color="primary">mdi-text-long</v-icon>
                                                    </template>
                                                </v-textarea>
                                            </div>

                                            <div class="field-group">
                                                <label class="field-label">Evidence Files</label>
                                                <div class="file-upload-area">
                                                    <v-file-input v-model="fileData" multiple
                                                        :rules="isEditing ? [] : fileRules" variant="solo-filled"
                                                        bg-color="rgba(255,255,255,0.05)"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                                                        show-size class="enhanced-field file-field"
                                                        :readonly="isAuditer || !isNotEndAudit">
                                                        <template v-slot:prepend-inner>
                                                            <v-icon color="primary">mdi-cloud-upload</v-icon>
                                                        </template>
                                                    </v-file-input>
                                                    <div class="file-hint">
                                                        {{ isEditing ? 'Upload new files to replace existing ones' :
                                                        'Drag files here or click to browse' }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </v-form>
                                </div>
                            </div>

                            <!-- Evidence Table Section -->
                            <div class="table-section">
                                <div class="section-card">
                                    <div class="card-header">
                                        <div class="status-indicator active"></div>
                                        <div class="header-content-row">
                                            <div>
                                                <h3 class="">{{ $t('complianceresultaudit.Evidence Repository') }}</h3>
                                                <p class="section-subtitle">Manage your submitted evidence</p>
                                            </div>
                                            <v-btn color="primary" variant="tonal" @click="fetchEvidence"
                                                :loading="isLoading" class="refresh-btn">
                                                <v-icon>mdi-refresh</v-icon>
                                                {{ $t('complianceresultaudit.Refresh') }}
                                            </v-btn>
                                        </div>
                                    </div>

                                    <div class="table-container">
                                        <v-data-table :headers="tableHeaders" :items="evidenceList" :loading="isLoading"
                                            :items-per-page="5" class="advanced-table" hover>
                                            <template v-slot:loading>
                                                <div class="loading-state">
                                                    <div class="loading-spinner"></div>
                                                    <p>{{ $t('complianceresultaudit.Loading evidence...') }}</p>
                                                </div>
                                            </template>

                                            <template v-slot:item.updated_at="{ item }">
                                                <div class="date-badge">
                                                    <v-icon size="14">mdi-calendar-clock</v-icon>
                                                    {{ formatDate(item.updated_at) }}
                                                </div>
                                            </template>

                                            <template v-slot:item.actions="{ item }">
                                                <div class="action-buttons">
                                                    <v-btn v-if="item.evidence_file" :href="item.file_url"
                                                        target="_blank" icon size="small" color="success"
                                                        variant="tonal" class="action-btn download-btn">
                                                        <v-icon size="16">mdi-download</v-icon>
                                                        <v-tooltip activator="parent"
                                                            location="top">Download</v-tooltip>
                                                    </v-btn>

                                                    <v-btn v-if="!isAuditer && isNotEndAudit" @click="editEvidence(item)" icon size="small" color="primary"
                                                        variant="tonal" class="action-btn edit-btn">
                                                        <v-icon size="16">mdi-pencil</v-icon>
                                                        <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                                                    </v-btn>

                                                    <v-btn v-if="!isAuditer && isNotEndAudit" @click="confirmDelete(item.evidence_id)" icon size="small"
                                                        color="error" variant="tonal" class="action-btn delete-btn">
                                                        <v-icon size="16">mdi-delete</v-icon>
                                                        <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                                                    </v-btn>
                                                </div>
                                            </template>

                                            <template v-slot:no-data>
                                                <div class="empty-state">
                                                    <div class="empty-icon">
                                                        <v-icon size="80">mdi-file-document-plus</v-icon>
                                                    </div>
                                                    <h4 class="empty-title">{{ $t('complianceresultaudit.No Evidence Submitted') }}</h4>
                                                    <p class="empty-subtitle">
                                                        {{ $t('complianceresultaudit.Start by uploading your first compliance document') }}</p>
                                                    <v-btn v-if="!isAuditer && isNotEndAudit" color="primary" variant="flat" class="empty-action">
                                                        <v-icon left>mdi-plus</v-icon>
                                                        {{ $t('complianceresultaudit.Add Evidence') }}
                                                    </v-btn>
                                                </div>
                                            </template>
                                        </v-data-table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Enhanced Modal Actions -->
                        <div v-if="!isAuditer && isNotEndAudit" class="modal-actions">
                            <div class="actions-container">
                                <v-btn color="grey-darken-1" variant="outlined" @click="closeModal"
                                    :disabled="isSubmitting" size="large" class="cancel-btn">
                                    <v-icon left>mdi-arrow-left</v-icon>
                                    {{ $t('complianceresultaudit.Cancel') }}
                                </v-btn>
                                <v-btn color="primary" variant="flat" @click="submitEvidence" :loading="isSubmitting"
                                    :disabled="isSubmitting" class="submit-btn" size="large">
                                    <template v-slot:loader>
                                        <div class="btn-loader">
                                            <div class="loader-spinner"></div>
                                            {{ isEditing ? 'Updating...' : 'Submitting...' }}
                                        </div>
                                    </template>
                                    <v-icon left>{{ isEditing ? 'mdi-check' : 'mdi-upload' }}</v-icon>
                                    {{ isEditing ? 'Update Evidence' : 'Submit Evidence' }}
                                </v-btn>
                            </div>
                        </div>
                    </v-card>
                </div>
            </transition>
        </div>
    </transition>

    <!-- Advanced Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500" persistent>
        <v-card class="delete-modal">
            <div class="delete-header">
                <div class="warning-icon">
                    <v-icon size="40" color="error">mdi-alert-octagon</v-icon>
                </div>
                <h3 class="delete-title">{{ $t('complianceresultaudit.Confirm Deletion') }}</h3>
                <p class="delete-subtitle">{{ $t('complianceresultaudit.This action is irreversible') }}</p>
            </div>
            <div class="delete-content">
                <p>{{ $t('complianceresultaudit.Are you sure you want to permanently delete this evidence? All associated data will be lost.') }}</p>
            </div>
            <div class="delete-actions">
                <v-btn color="grey" variant="outlined" @click="deleteDialog = false" :disabled="isDeleting"
                    class="delete-cancel">
                    {{ $t('complianceresultaudit.Keep Evidence') }}
                </v-btn>
                <v-btn color="error" variant="flat" @click="deleteEvidence" :loading="isDeleting"
                    class="delete-confirm">
                    <v-icon left>mdi-delete-forever</v-icon>
                    {{ $t('complianceresultaudit.Delete Permanently') }}
                </v-btn>
            </div>
        </v-card>
    </v-dialog>
</template>

<script>
import AuditPolicyComplianceResult from "@/API/AuditPolicyComplianceResult/AuditPolicyComplianceResult";
import { notify } from "@kyvg/vue3-notification";
import axios from "axios";

export default {
    setup() {

    },

    name: "EvidenceModal",
    props: {
        auditData: {
            type: Array,
            required: true
        },
        isVisibleEvidenceModal: {
            type: Boolean,
            required: true
        },
        policyId: {
            type: [String, Number],
            required: true
        },
        auditId: {
            type: [String, Number],
            required: false
        },
        userId: {
            type: [String, Number],
            required: false
        },
        id: {
            type: [String, Number],
            required: false
        },
    },
    computed: {
        isAuditer() {
            return this.auditData && (this.userId === this.auditData.auditer_id);
        },
        isNotEndAudit() {
             return this.auditData && (this.auditData.enable_audit === 1);
        },
    },
    data() {
        return {
            auditPolicyComplianceResultApi: new AuditPolicyComplianceResult(),
            isSubmitting: false,
            isUploading: false,
            isLoading: false,
            isDeleting: false,
            isEditing: false,
            deleteDialog: false,
            evidenceToDelete: null,
            evidenceList: [],
            evidence: {
                name: '',
                description: '',
                file: []
            },
            nameRules: [
                v => !!v || 'Name is required',
                v => (v && v.length <= 100) || 'Name must be less than 100 characters'
            ],
            descriptionRules: [
                v => !!v || 'Description is required',
                v => (v && v.length <= 500) || 'Description must be less than 500 characters'
            ],
            fileRules: [
                v => !!v || 'File is required',
                // v => !v || v.size < 10000000 || 'File size should be less than 10 MB'
            ],
            tableHeaders: [
                { title: 'Name', key: 'name', width: '25%' },
                { title: 'Description', key: 'description', width: '40%' },
                { title: 'Updated At', key: 'updated_at', width: '25%' },
                { title: 'Actions', key: 'actions', align: 'center', sortable: false, width: '10%' }
            ],
            fileData: [],
        };
    },
    methods: {
        closeModal() {
            this.$emit('close');
            this.resetForm();
        },

        async submitEvidence() {
            const { valid } = await this.$refs.evidenceForm.validate();

            if (!valid) {
                return;
            }

            this.isSubmitting = true;
            this.isUploading = true;

            try {
                const payload = {
                    name: this.evidence.name,
                    description: this.evidence.description,
                    policyId: this.policyId,
                    audit_id: this.auditId,
                    user_id: this.userId,
                };

                if (this.fileData && this.fileData.length > 0) {
                    payload.file = this.fileData[0];
                }

                if (this.evidence.evidence_id) {
                    payload.evidence_id = this.evidence.evidence_id;
                }

                const response = await this.auditPolicyComplianceResultApi.upsertEvidence(payload);

                if (response.data.status === "success") {
                    notify({
                        type: 'success',
                        title: 'Success',
                        text: this.isEditing ? 'Evidence updated successfully' : 'Evidence submitted successfully'
                    });

                    // Refresh the evidence list in the modal
                    await this.fetchEvidence();

                    // Reset the form
                    this.resetForm();

                    // Emit refresh to parent component to update the main table
                    this.$emit('refresh-data');
                }
            } catch (error) {
                console.error('Error processing evidence:', error);
                let errorMessage = 'An error occurred while processing your request';

                if (error.response && error.response.status === 422) {
                    if (error.response.data.errors) {
                        errorMessage = Object.values(error.response.data.errors).flat().join('\n');
                    }
                    else if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                }
                else if (error.message) {
                    errorMessage = error.message;
                }

                notify({
                    type: 'error',
                    title: 'Error',
                    text: errorMessage
                });
            } finally {
                this.isSubmitting = false;
                this.isUploading = false;
            }
        },

        async fetchEvidence() {
            this.isLoading = true;
            this.evidenceList = [];
            try {
                // Build filter conditionally
                let filter = `policy_id|${this.policyId}|=&&audit_id|${this.auditId}|=`;

                // Only add id filter if id exists
                if (this.id) {
                    filter += `&&id|${this.id}|=`;
                }

                const response = await this.auditPolicyComplianceResultApi.getAll({
                    filter,
                });

                console.log("API Response:", response);

                if (response && response.length > 0) {
                    const policyData = response[0];

                    if (policyData.evidence && policyData.evidence.length > 0) {
                        this.evidenceList = policyData.evidence.map(item => ({
                            id: item.evidence_id,
                            name: item.name,
                            description: item.description,
                            evidence_id: item.evidence_id,
                            updated_at: item.updated_at,
                            evidence_file: item.evidence_file,
                            file_url: this.getEvidenceFileUrl(item.evidence_file)
                        }));

                        console.log("Processed evidence list:", this.evidenceList);
                    }
                }
            } catch (error) {
                console.error('Error fetching evidence:', error);
            } finally {
                this.isLoading = false;
            }
        },

        

        getEvidenceFileUrl(filename) {
            if (!filename) return '';
            const baseURL = axios.defaults.baseURL.replace('/api', '');
            return `${baseURL}storage/uploads/audit_policy_compliance_results/file/${filename}`;
        },

        confirmDelete(id) {
            this.evidenceToDelete = id;
            this.deleteDialog = true;
        },

        async deleteEvidence() {
            this.isDeleting = true;

            try {
                const payload = {
                    policyId: this.policyId,
                    audit_id: this.auditId,
                    user_id: this.userId,
                    evidence_id: this.evidenceToDelete
                };

                const response = await this.auditPolicyComplianceResultApi.deleteEvidence(payload);

                if (response.data.status === "success") {
                    await this.fetchEvidence();
                    notify({
                        type: 'success',
                        title: 'Success',
                        text: 'Evidence deleted successfully'
                    });
                } else {
                    throw new Error(response.data.message || 'Failed to delete evidence');
                }
            } catch (error) {
                console.error('Error deleting evidence:', error);
                notify({
                    type: 'error',
                    title: 'Error',
                    text: 'Failed to delete evidence. Please try again.'
                });
            } finally {
                this.isDeleting = false;
                this.deleteDialog = false;
                this.evidenceToDelete = null;
            }
        },

        editEvidence(item) {
            this.isEditing = true;
            this.evidence = {
                evidence_id: item.evidence_id,
                name: item.name,
                description: item.description,
                file: null // Clear the file input (or you could show the existing file name)
            };

            // Scroll to the form for better UX
            this.$nextTick(() => {
                const formElement = this.$refs.evidenceForm.$el;
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        resetForm() {
            this.isEditing = false;
            this.evidence = {
                name: '',
                description: '',
                file: null
            };
            this.fileData = []; // Clear the file input
            this.$refs.evidenceForm?.resetValidation();
        }
    },
    watch: {
        isVisibleEvidenceModal(newVal) {
            if (newVal) {
                this.fetchEvidence();
                this.resetForm();
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
    z-index: 1000;
    overflow-y: auto;
    padding: 2rem;
}

.modal-container {
    width: 100%;
    max-width: 1200px;
    margin: auto;
    position: relative;
}

.evidence-modal {
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Modal Header Styles */
/* Modal Header Layout */
.modal-header {
    position: relative;
    z-index: 1;
    padding: 1.5rem;
    background: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-glass {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    /* Changed from center to flex-start for better alignment */
    width: 100%;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-grow: 1;
    /* Allows content to take available space */
}

/* Close Button Positioning */
.close-btn {
    margin-left: auto;
    /* Pushes button to the far right */
    align-self: center;
    /* Vertically centers the button */
    color: #64748b;
    transition: all 0.2s ease;
}

.close-btn:hover {
    color: #1e293b;
    transform: rotate(90deg);
}

/* Header Text Alignment */
.header-text {
    text-align: left;
    /* Explicit left alignment */
}

.header-title {
    text-align: left;
    margin-right: auto;
    /* Ensures title stays left */
}

.header-subtitle {
    text-align: left;
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
    display: grid;
    gap: 1.5rem;
    background: white;
}

.section-card {
    background: white;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}

@media (min-width: 992px) {
    .modal-body {
        grid-template-columns: 1fr 1fr;
    }
}

.card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #f8f9fa;
}

.header-content-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6c757d;
}

.status-indicator.active {
    background: #28a745;
}

.section-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: #2c3e50;
}

.section-subtitle {
    font-size: 0.8125rem;
    color: #6c757d;
    margin: 0;
}

.refresh-btn {
    color: #2c3e50;
    border-color: #dee2e6;
}

/* Form Styles */
.enhanced-form {
    padding: 1.25rem;
}

.form-fields {
    display: grid;
    gap: 1.25rem;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #495057;
}

.enhanced-field {
    border-radius: 4px !important;
}

.enhanced-field :deep(.v-field__outline) {
    color: #dee2e6 !important;
}

.enhanced-field :deep(.v-field__input) {
    color: #2c3e50 !important;
}

.file-upload-area {
    position: relative;
}

.file-hint {
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
    text-align: center;
    padding: 0.5rem;
    border-radius: 4px;
    background: #f8f9fa;
}

/* Table Styles */
.table-container {
    padding: 0 1.25rem 1.25rem;
}

.advanced-table :deep(.v-table) {
    background: white;
}

.advanced-table :deep(th) {
    background: #f8f9fa !important;
    color: #2c3e50 !important;
    font-weight: 500;
}

.advanced-table :deep(td) {
    background: white !important;
    border-bottom: 1px solid #e9ecef !important;
    color: #495057 !important;
}

.advanced-table :deep(.v-table__wrapper) {
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e9ecef;
}

.date-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    background: #f8f9fa;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: #495057;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    color: #6c757d;
    transition: all 0.2s ease;
}

.action-btn:hover {
    transform: translateY(-1px);
}

/* Empty State Styles */
.empty-state {
    padding: 2rem;
    text-align: center;
}

.empty-icon {
    color: #e9ecef;
    margin-bottom: 1rem;
}

.empty-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.empty-subtitle {
    color: #6c757d;
    margin-bottom: 1.5rem;
}

/* Loading State Styles */
.loading-state {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f8f9fa;
    border-top-color: #2c3e50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Modal Actions Styles */
.modal-actions {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.actions-container {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.cancel-btn {
    color: #6c757d;
    border-color: #dee2e6;
}

.submit-btn {
    background-color: #2c3e50;
    color: white;
}

/* Delete Modal Styles */
.delete-modal {
    background: white;
    color: #2c3e50;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e9ecef;
}

.delete-header {
    padding: 1.5rem;
    text-align: center;
    border-bottom: 1px solid #e9ecef;
}

.warning-icon {
    margin-bottom: 1rem;
    color: #dc3545;
}

.delete-title {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: #dc3545;
}

.delete-subtitle {
    color: #6c757d;
    font-size: 0.875rem;
    margin: 0;
}

.delete-content {
    padding: 1.5rem;
    text-align: center;
    color: #495057;
}

.delete-actions {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.delete-confirm {
    background-color: #dc3545;
    color: white;
}

/* Transition Animations */
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
    opacity: 0;
    transform: scale(0.98);
}
</style>