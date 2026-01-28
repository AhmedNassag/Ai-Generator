<template>
    <div class="audit-remediation-container">
        <h2 class="section-title" mb-4>{{ $t("auditremidationcomponent.audit_remediation") }}</h2>

        <div class="form-group">
            <label>{{ $t("auditremidationcomponent.remediation_needed") }}</label>
            <div class="radio-group">
                <label>
                    <input :disabled="isEndAuditControl()" type="radio" v-model="remediationNeeded" value="yes" />
                    {{ $t("auditremidationcomponent.yes") }}
                </label>
                <label>
                    <input :disabled="isEndAuditControl()" type="radio" v-model="remediationNeeded" value="no" />
                    {{ $t("auditremidationcomponent.no") }}
                </label>
            </div>
        </div>
        <!-- Audit Status -->
        <div class="form-group">
            <label for="audit-status">{{ $t("auditremidationcomponent.audit_status") }}</label>
            <select :disabled="isEndAuditControl()" id="audit-status" v-model="auditStatus" class="form-control">
                <option value="" disabled>{{ $t("auditremidationcomponent.select_status") }}</option>
                <option value="0">{{ $t("auditremidationcomponent.open") }}</option>
                <option value="1">{{ $t("auditremidationcomponent.closed") }}</option>
            </select>
        </div>

        <!-- Notes -->
        <div class="form-group">
            <label>{{ $t("auditremidationcomponent.summary") }}</label>
            <ckeditor :disabled="isEndAuditControl()" :editor="editor" v-model="notes" :config="editorConfig"
                class="fixed-width-editor" />
        </div>

        <!-- Assistants -->
        <div class="form-group">
            <label>{{ $t("auditremidationcomponent.assistants") }}</label>
            <v-combobox :disabled="isEndAuditControl()" v-if="responsibleType" v-model="selectedAssistants"
                :items="availableAssistants" item-title="name" item-value="id" multiple outlined chips deletable-chips
                :label="$t('auditremidationcomponent.select_type', { type: $t(responsibleType === 'users' ? 'auditremidationcomponent.users' : 'auditremidationcomponent.teams') })"
                prepend-inner-icon="mdi-account-group" return-object>
                <template v-slot:selection="{ item }">
                    <v-chip>
                        <v-icon left small>mdi-account</v-icon>
                        {{ item.raw.name }}
                    </v-chip>
                </template>
                <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.name"></v-list-item>
                </template>
            </v-combobox>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions" v-if=!isEndAuditControl()>
            <v-btn color="secondary" v-permission:update @click="submitForm">{{ $t("auditremidationcomponent.Submit")
                }}</v-btn>
            <v-btn color="info" class="ml-3" v-if="remediationNeeded === 'yes'" @click="OpenRemediationModal">{{
                $t("auditremidationcomponent.Remidation") }}</v-btn>
        </div>

        <v-dialog v-model="showRemediationModal" max-width="1200px" content-class="remediation-dialog">
            <v-card class="remediation-card">
                <v-toolbar color="primary" dark flat class="dialog-header">
                    <v-toolbar-title class="dialog-title">
                        <v-icon left>mdi-file-document</v-icon>
                        {{ $t("auditremidationcomponent.Remediation Required") }}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="showRemediationModal = false" class="close-btn">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-card-text class="dialog-content pt-4 scrollable-content">
                    <v-form ref="remediationFormRef" class="remediation-form">
                        <v-row dense>
                            <!-- Responsible User -->
                            <v-col cols="12" md="6" class="form-field">
                                <v-select :disabled="isEndAuditControl()" v-model="remediationForm.responsible_user"
                                    :items="allUsers" item-title="name" item-value="id"
                                    :label="$t('auditremidationcomponent.responsible_user')" outlined dense
                                    variant="outlined" class="custom-select"></v-select>
                            </v-col>

                            <!-- Due Date -->
                            <v-col cols="12" md="6" class="form-field">
                                <v-text-field v-model="remediationForm.due_date"
                                    :label="$t('auditremidationcomponent.due_date')" type="date" outlined dense disabled
                                    variant="outlined" class="disabled-field"></v-text-field>
                            </v-col>

                            <!-- Budgetary -->
                            <v-col cols="12" md="6" class="form-field">
                                <v-text-field v-model="remediationForm.budgetary"
                                    :label="$t('auditremidationcomponent.budgetary')" outlined dense disabled
                                    variant="outlined" class="disabled-field"></v-text-field>
                            </v-col>

                            <!-- Status -->
                            <v-col cols="12" md="6" class="form-field">
                                <v-select v-model="remediationForm.status"
                                    :items="[$t('auditremidationcomponent.status_approved'), $t('auditremidationcomponent.status_rejected')]"
                                    :label="$t('auditremidationcomponent.status')" outlined dense disabled
                                    variant="outlined" class="disabled-field"></v-select>
                            </v-col>

                            <!-- Comment -->
                            <v-col cols="12" class="form-field rich-text-field">
                                <label class="v-label text-subtitle-1 font-weight-medium">
                                    {{ $t("auditremidationcomponent.comment") }}
                                </label>
                                <ckeditor v-model="remediationForm.comments_remidation" :editor="editor"
                                    :config="editorConfig" class="fixed-width-editor mt-1 disabled-editor"
                                    :disabled="true" />
                                <div class="v-messages theme--light" style="min-height: 14px;"></div>
                            </v-col>

                            <!-- Corrective Action Plan -->
                            <v-col cols="12" class="form-field rich-text-field">
                                <label class="v-label text-subtitle-1 font-weight-medium">
                                    {{ $t("auditremidationcomponent.corrective_action_plan") }}
                                </label>
                                <ckeditor :disabled="isEndAuditControl()"
                                    v-model="remediationForm.corrective_action_plan" :editor="editor"
                                    :config="editorConfig" class="fixed-width-editor mt-1 actionable-editor" />
                                <div class="v-messages theme--light" style="min-height: 14px;"></div>
                            </v-col>

                            <input type="hidden" v-model="remediationForm.id" />
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions class="dialog-actions pa-4">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="showRemediationModal = false" class="cancel-btn">
                        {{ $t("auditremidationcomponent.Cancel") }}
                    </v-btn>
                    <v-btn v-if=!isEndAuditControl() color="primary" variant="flat" v-permission:update
                        @click="saveRemediation" class="save-btn">
                        {{ $t("auditremidationcomponent.Save Changes") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Remidation from "@/API/AuditRemidation/AuditRemidation";
import debounce from "lodash/debounce";
import frameworkcontroltestaudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import AuditPlan from "@/API/AuditPlan/AuditPlan";
import { filter } from "jszip";

export default {
    name: "AuditRemidation",
    components: {
        ckeditor: Ckeditor,
    },
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
        }
    },
    setup() {
        return {
            RemidationApi: new Remidation(),
            frameworkcontroltestauditApi: new frameworkcontroltestaudit(),
            AuditPlanApi: new AuditPlan(),
        };
    },
    mounted() {
        this.allUsers = (this.userData || []).map(user => ({
            id: user.id,
            name: user.full_name
        }));

    },
    data() {
        return {
            editor: ClassicEditor,
            editorConfig: {
                toolbar: {
                    items: [
                        'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
                        '|', 'indent', 'outdent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'
                    ],
                    shouldNotGroupWhenFull: true
                },
                licenseKey: "GPL",
                height: 120,
            },
            remediationNeeded: "",
            auditStatus: "",
            notes: "",
            selectedAssistants: [],
            responsibleType: null,
            availableAssistants: [],
            emitUpdatedDataDebounced: null,
            showRemediationModal: false,
            allUsers: [], // Fill this from your user data
            remediationForm: {
                responsible_user: null,
                budgetary: null,
                status: null,
                comments_remidation: null,
                corrective_action_plan: null,
                due_date: null,
                control_audit_id: null,
                id: null
            },
            lastSavedRemediationData: null,
        };
    },
    computed: {
        assistantIds() {
            return this.selectedAssistants.map(a => a.id);
        },
        // New computed property for complete remediation data
        completeRemediationData() {
            return this.getRemediationData();
        },


    },
    created() {
        this.emitUpdatedDataDebounced = debounce(this.emitUpdatedData, 200);
        // Initialize control_audit_id if available
        if (this.controlAuditData && this.controlAuditData.id) {
            this.remediationForm.control_audit_id = this.controlAuditData.id;
        }
    },
    watch: {
        controlAuditData: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    const newRemediation =
                        typeof newVal.is_remediation === 'boolean'
                            ? (newVal.is_remediation ? "yes" : "no")
                            : (newVal.is_remediation === 'true' || newVal.is_remediation === 'yes' ? "yes" : "no");

                    if (this.remediationNeeded !== newRemediation) {
                        this.remediationNeeded = newRemediation;
                    }

                    if (this.auditStatus !== (newVal.open_closed_status ?? "")) {
                        this.auditStatus = newVal.open_closed_status ?? "";
                    }

                    if (this.notes !== (newVal.notes ?? "")) {
                        this.notes = newVal.notes ?? "";
                    }

                    const newResponsibleType = newVal.audit?.responsible_type;
                    if (this.responsibleType !== newResponsibleType) {
                        this.responsibleType = newResponsibleType;
                    }

                    this.updateAvailableAssistants();

                    if (newVal.assistant_audit && newVal.assistant_audit.length > 0) {
                        this.selectedAssistants = this.getCurrentAssistants(newVal.assistant_audit);
                    } else {
                        this.selectedAssistants = [];
                    }

                    // Update remediationForm with control_audit_id
                    this.remediationForm.control_audit_id = newVal.id;

                    if (newVal.remediation) {
                        this.remediationForm = {
                            responsible_user: newVal.remediation.responsible_user,
                            budgetary: newVal.remediation.budgetary,
                            status: newVal.remediation.status,
                            comments_remidation: newVal.remediation.comments_remidation,
                            corrective_action_plan: newVal.remediation.corrective_action_plan,
                            due_date: newVal.remediation.due_date,
                            control_audit_id: newVal.id,
                            id: newVal.remediation.id // Store the ID for updates
                        };
                    }
                }
            }
        },
        auditStatus() {
            this.emitUpdatedDataDebounced();
        },
        notes() {
            this.emitUpdatedDataDebounced();
        },
        selectedAssistants: {
            handler() {
                this.emitUpdatedDataDebounced();
            },
            deep: true
        },
        responsibleType() {
            this.updateAvailableAssistants();
        }
    },
    methods: {
        isEndAuditControl() {
            if (this.controlAuditData?.end_audit_status == 1 || this.controlAuditData?.open_closed_status == 1) {
                return true;
            } else {
                return false
            }
        },
        // Get complete remediation data - accessible from parent component
        getRemediationData() {
            return {
                isRemediationNeeded: this.remediationNeeded === "yes",
                auditStatus: this.auditStatus,
                notes: this.notes,
                assistants: this.selectedAssistants.map(assistant => ({
                    assistant_id: assistant.id,
                    assistant_name: assistant.name,
                    assistant_type: this.responsibleType
                })),
                remediationDetails: { ...this.remediationForm },
                formattedData: {
                    control_audit_id: this.controlAuditData?.id,
                    is_remediation: this.remediationNeeded === "yes",
                    open_closed_status: this.auditStatus,
                    notes: this.notes,
                    assistant_audit: this.selectedAssistants.map(assistant => ({
                        assistant_id: assistant.id,
                        assistant_type: this.responsibleType
                    }))
                }
            };
        },

        // Method to export remediation data
        OpenRemediationModal() {
            this.showRemediationModal = true;

        },

        getCurrentAssistants(assistantAudit) {
            if (!this.responsibleType || !assistantAudit) return [];
            const source = this.responsibleType === 'users' ? this.userData : this.teamData;
            return assistantAudit
                .map(assistant => {
                    const id = typeof assistant === 'object' ? assistant.assistant_id : assistant;
                    if (!id) return null;

                    const found = source.find(item => item.id === id);
                    return found ? {
                        id: found.id,
                        name: this.responsibleType === 'users' ? found.full_name : found.name
                    } : null;
                })
                .filter(Boolean);
        },

        updateAvailableAssistants() {
            if (!this.responsibleType) {
                this.availableAssistants = [];
                return;
            }
            const allowedIds = this.controlAuditData.audit.responsible || [];
            console.log("allowedIds", allowedIds);
            if (this.responsibleType === 'users') {
                this.availableAssistants = this.userData
                    .filter(user => allowedIds.includes(user.id))
                    .map(user => ({
                        id: user.id,
                        name: user.full_name
                    }));
            } else if (this.responsibleType === 'team') {
                this.availableAssistants = this.teamData
                    .filter(team => allowedIds.includes(team.id))
                    .map(team => ({
                        id: team.id,
                        name: team.name
                    }));
            }
        },


        emitUpdatedData() {
            if (!this.controlAuditData) return;
            const updatedData = { ...this.controlAuditData };
            updatedData.is_remediation = this.remediationNeeded === "yes";
            updatedData.open_closed_status = this.auditStatus;
            updatedData.notes = this.notes;
            updatedData.assistant_audit = this.selectedAssistants.map(assistant => ({
                assistant_id: assistant.id,
                assistant_type: this.responsibleType
            }));

        },

        async submitForm() {
            const assistantAuditObject = {};
            this.selectedAssistants.forEach((assistant, index) => {
                assistantAuditObject[index] = assistant.id;
            });

            const updatedData = {
                id: this.controlAuditData.id,
                is_remediation: this.remediationNeeded,
                open_closed_status: this.auditStatus,
                notes: this.notes,
                assistant_audit: assistantAuditObject // Now {0: ID, 1: ID, ...}
            };
            console.log("Updated Data:", updatedData);

            await this.frameworkcontroltestauditApi.from(updatedData);

            const completeData = this.getRemediationData();
            this.lastSavedRemediationData = completeData;
            this.$emit('requirement-updated', {
                controlAuditId: updatedData.id,
                updatedControlAudit: updatedData
            });
        },

        async saveRemediation() {
            const response = await this.RemidationApi.from(this.remediationForm);
            this.showRemediationModal = false;
        },

        onEditorReady(editorInstance) {
            // Make the editor read-only if needed
            if (this.readOnly) {
                editorInstance.enableReadOnlyMode('remediation-mode');
            }
        },

        // Get the last saved remediation data - can be called from parent
        getLastSavedRemediationData() {
            return this.lastSavedRemediationData;
        }
    }
};
</script>

<style scoped>
/* Enhanced Audit Remediation Form Styles */
.audit-remediation-container {
    padding: 30px;
    background-color: #f8fafc;
    border-radius: 16px;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 24px;
    position: relative;
    padding-bottom: 12px;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #3498db, #4CAF50);
    border-radius: 2px;
}



/* Form Groups with Enhanced Styling */
.form-group {
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
    transition: var(--transition);
}

/* .form-group:hover {
    transform: translateY(-2px);
} */

/* Labels with Modern Styling */
label {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.7);
    letter-spacing: 0.3px;
    position: relative;
    padding-left: 4px;
}

/* Radio Button Group */
.radio-group {
    display: flex;
    gap: 24px;
    padding: 6px 0;
}

.radio-group label {
    display: flex;
    align-items: center;
    margin-right: 0;
    font-weight: normal;
    cursor: pointer;
    position: relative;
    padding: 8px 12px;
    border-radius: var(--border-radius);
    /* background-color: rgba(0, 0, 0, 0.02); */
    transition: all 0.2s ease-in-out;
    color: rgba(0, 0, 0, 0.7);
    border-radius: 15px !important;
}

.radio-group label:hover {
    background-color: rgba(25, 118, 210, 0.08);
}

.radio-group label:has(input[type="radio"]:checked) {
    background-color: rgba(25, 118, 210, 0.12);
    color: var(--primary-color);
    font-weight: 600;
    border-left: 3px solid var(--primary-color);
    padding-left: 9px;
    border-radius: 15px !important;
}

.radio-group input[type="radio"] {
    margin-right: 8px;
    position: relative;
    width: 20px;
    height: 20px;
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 2px solid rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    outline: none;
    transition: all 0.2s ease-in-out;
    border-radius: 15px !important;
    /* background-color: #d6d2d2; */
    flex-shrink: 0;
}

.radio-group input[type="radio"]:hover:not(:disabled) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.radio-group input[type="radio"]:checked {
    border-color: var(--primary-color);
    background: #cb9a9a;
    box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.15);
}

.radio-group input[type="radio"]::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #818182;
    transition: transform 0.2s ease-in-out;
}

.radio-group input[type="radio"]:checked::after {
    transform: translate(-50%, -50%) scale(1);
}

/* Select Control */
.form-control {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: var(--border-radius);
    font-size: 1rem;
    background-color: #fff;
    transition: var(--transition);
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%231976d2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px;
}

.form-control:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15);
    outline: none;
}

.form-control option {
    padding: 12px;
}

/* Action Buttons */
.form-actions {
    display: flex;
    margin: 32px 0 20px;
}

/* CKEditor Custom Styling */
:deep(.ck-editor__editable) {
    min-height: 200px !important;
    border-radius: 0 0 var(--border-radius) var(--border-radius) !important;
    box-shadow: none !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
    padding: 16px !important;
    transition: var(--transition) !important;
}

:deep(.ck-editor__editable:focus) {
    border-color: var(--primary-color) !important;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.15) !important;
}

:deep(.ck-toolbar) {
    border-radius: var(--border-radius) var(--border-radius) 0 0 !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
    background: #f8f9fa !important;
}

:deep(.ck-button),
:deep(.ck-dropdown__button) {
    border-radius: 4px !important;
}

:deep(.ck-button:hover),
:deep(.ck-dropdown__button:hover) {
    background: rgba(25, 118, 210, 0.1) !important;
}

:deep(.ck-button.ck-on) {
    background: rgba(25, 118, 210, 0.15) !important;
    color: var(--primary-dark) !important;
}

/* Dialog Enhancements */
:deep(.v-dialog) {
    border-radius: 12px !important;
    overflow: hidden !important;
}

:deep(.v-card) {
    overflow: hidden !important;
}

:deep(.v-card-title) {
    font-size: 1.5rem !important;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%) !important;
    color: white !important;
    padding: 20px 24px !important;
    position: relative !important;
}

:deep(.v-card-title::after) {
    content: '' !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 6px !important;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
}

:deep(.v-card-text) {
    padding: 24px !important;
}

:deep(.v-card-actions) {
    padding: 16px 24px !important;
    background-color: rgba(0, 0, 0, 0.02) !important;
}

/* Vuetify Form Components Enhancement */
:deep(.v-text-field) .v-input__slot,
:deep(.v-select) .v-input__slot,
:deep(.v-combobox) .v-input__slot {
    box-shadow: none !important;
    transition: var(--transition) !important;
}

:deep(.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) fieldset),
:deep(.v-select--outlined:not(.v-input--is-focused):not(.v-input--has-state) fieldset),
:deep(.v-combobox--outlined:not(.v-input--is-focused):not(.v-input--has-state) fieldset) {
    border-color: rgba(0, 0, 0, 0.12) !important;
}

:deep(.v-text-field--outlined.v-input--is-focused fieldset),
:deep(.v-select--outlined.v-input--is-focused fieldset),
:deep(.v-combobox--outlined.v-input--is-focused fieldset) {
    border-color: var(--primary-color) !important;
    border-width: 2px !important;
}

:deep(.v-text-field--outlined.v-input--has-state fieldset),
:deep(.v-select--outlined.v-input--has-state fieldset),
:deep(.v-combobox--outlined.v-input--has-state fieldset) {
    border-width: 2px !important;
}

:deep(.v-input__prepend-inner) {
    margin-right: 8px !important;
}

:deep(.v-label) {
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    letter-spacing: 0.3px !important;
}

:deep(.v-chip) {
    font-weight: 500 !important;
    letter-spacing: 0.3px !important;
}

/* Dense Form Layout for Remediation Dialog */
:deep(.v-row.dense) {
    margin-top: -12px !important;
    margin-bottom: -12px !important;
}

:deep(.v-row.dense > .v-col) {
    padding-top: 6px !important;
    padding-bottom: 6px !important;
}

/* Disabled Fields Styling */
:deep(.v-text-field.v-input--is-disabled .v-input__slot),
:deep(.v-select.v-input--is-disabled .v-input__slot) {
    background-color: rgba(0, 0, 0, 0.03) !important;
    opacity: 0.9 !important;
}

:deep(.ck-editor__editable.ck-read-only) {
    background-color: rgba(0, 0, 0, 0.03) !important;
}

.remediation-dialog {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Card Styling */
.remediation-card {
    border-radius: 12px;
    overflow: hidden;
}

/* Header Styling */
.dialog-header {
    padding: 16px 24px;
    background: #f0f0f0 !important;
}

.dialog-title {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: black;
}

.close-btn {
    transition: all 0.3s ease;
    color: black;
}

.close-btn:hover {
    transform: rotate(90deg);
    background: rgba(255, 255, 255, 0.2);
}

/* Content Area */
.dialog-content {
    padding: 24px;
    background-color: #f8f9fa;
}

/* Form Fields */
.form-field {
    margin-bottom: 16px;
}

.custom-select :deep(.v-input__control) {
    background-color: #fff;
    border-radius: 8px;
}

.disabled-field :deep(.v-input__control) {
    background-color: #f5f5f5;
}

.disabled-field :deep(.v-input__slot) {
    cursor: not-allowed;
}

/* Rich Text Editor Fields */
.rich-text-field {
    margin-top: 8px;
}

.fixed-width-editor {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    transition: border 0.3s ease;
}

.fixed-width-editor:hover {
    border-color: #bdbdbd;
}

.actionable-editor :deep(.ck-editor__editable) {
    min-height: 150px;
    background-color: #fff;
    border-top: 1px solid #e0e0e0;
}

.disabled-editor :deep(.ck-editor__editable) {
    min-height: 150px;
    background-color: #f5f5f5;
    cursor: not-allowed;
}

/* Form Labels */
.v-label {
    color: rgba(0, 0, 0, 0.87);
    font-size: 0.875rem;
    margin-bottom: 4px;
    display: block;
}

/* Action Buttons */
.dialog-actions {
    border-top: 1px solid #e0e0e0;
    background-color: #f8f9fa;
}

.cancel-btn {
    padding: 0 24px;
    height: 40px;
    text-transform: none;
    letter-spacing: normal;
    font-weight: 500;
    color: #5f6368;
}

.save-btn {
    padding: 0 24px;
    height: 40px;
    text-transform: none;
    letter-spacing: normal;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.save-btn:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
}

.scrollable-content {
    max-height: 65vh;
    /* Adjust this height as needed */
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
    .dialog-content {
        padding: 16px;
    }

    .fixed-width-editor {
        min-height: 120px;
    }
}

@media (max-width: 600px) {
    .dialog-header {
        padding: 12px 16px;
    }

    .dialog-title {
        font-size: 1.1rem;
    }

    .dialog-actions {
        padding: 12px 16px;
    }

    .cancel-btn,
    .save-btn {
        padding: 0 16px;
        height: 36px;
        font-size: 0.875rem;
    }
}

/* Responsive Design */
@media (max-width: 960px) {
    .audit-remediation-container {
        padding: 16px;
    }

    .radio-group {
        flex-direction: column;
        gap: 12px;
    }

    :deep(.v-dialog) {
        width: 95% !important;
    }
}

@media (max-width: 600px) {
    .form-actions {
        flex-direction: column;
        gap: 12px;
    }

    .form-actions .v-btn {
        width: 100%;
    }

    .ml-3 {
        margin-left: 0 !important;
    }
}

/* Print Styles */
@media print {
    .audit-remediation-container {
        box-shadow: none;
        padding: 0;
    }

    .form-actions,
    .v-btn {
        display: none !important;
    }

    :deep(.ck-editor__top) {
        display: none !important;
    }

    :deep(.ck-editor__editable) {
        border: none !important;
        min-height: auto !important;
    }
}
</style>