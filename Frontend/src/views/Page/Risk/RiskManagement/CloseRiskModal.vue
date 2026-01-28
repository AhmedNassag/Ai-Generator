<template>
    <v-dialog v-model="localShow" max-width="550px" persistent>
        <v-card class="close-risk-modal">
            <v-card-title class="modal-header">
                <span class="modal-title">{{ $t('risk.close_risk') }}</span>
                <v-btn icon @click="close" class="close-btn">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="modal-body">
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <label class="field-label">{{ $t('risk.reason_for_closing') }}</label>
                            <v-select 
                                v-model="selectedReason" 
                                :items="reasonOptions" 
                                item-title="name" 
                                item-value="id"
                                :placeholder="$t('risk.select_an_option')" 
                                variant="outlined"
                                density="comfortable"
                                class="custom-select">
                            </v-select>
                        </v-col>

                        <v-col cols="12">
                            <label class="field-label">{{ $t('risk.close_out_information') }}</label>
                            <v-textarea 
                                v-model="closeOutInformation" 
                                :placeholder="$t('risk.enter_close_out_information')"
                                rows="4"
                                variant="outlined"
                                density="comfortable"
                                class="custom-textarea" />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions class="modal-actions">
                <v-spacer />
                <v-btn 
                    color="primary" 
                    @click="onConfirm"
                    :disabled="!selectedReason"
                    class="save-btn">
                    <v-icon left size="20">mdi-lock-check</v-icon>
                    {{ $t('risk.save') }}
                </v-btn>
                <v-btn 
                    color="error" 
                    @click="close"
                    variant="outlined"
                    class="cancel-btn">
                    {{ $t('risk.cancel') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'CloseRiskModal',
    props: {
        show: { type: Boolean, default: false },
        reasonOptions: { type: Array, default: () => [] },
        initialReason: { type: [String, Number], default: null },
        initialCloseOutInformation: { type: String, default: '' },
    },
    emits: ['update:show', 'confirm'],
    data() {
        return {
            selectedReason: null,
            closeOutInformation: ''
        };
    },
    computed: {
        localShow: {
            get() { return this.show; },
            set(val) { this.$emit('update:show', val); }
        }
    },
    watch: {
        localShow(newVal) {
            if (newVal) {
                this.selectedReason = this.initialReason ?? null;
                this.closeOutInformation = this.initialCloseOutInformation ?? '';
            }
        },
        initialReason(newVal) {
            this.selectedReason = newVal ?? null;
        },
        initialCloseOutInformation(newVal) {
            this.closeOutInformation = newVal ?? '';
        }
    },
    methods: {
        close() {
            this.selectedReason = null;
            this.closeOutInformation = '';
            this.$emit('update:show', false);
        },
        onConfirm() {
            this.$emit('confirm', { 
                reasonId: this.selectedReason, 
                closeOutInformation: this.closeOutInformation 
            });
            this.$emit('update:show', false);
        }
    }
}
</script>

<style scoped>
.close-risk-modal {
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
    color: black !important;
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
    padding: 2rem !important;
    background: #ffffff;
}

.field-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.custom-select,
.custom-textarea {
    margin-top: 0.25rem;
}

.modal-actions {
    padding: 1rem 1.5rem !important;
    background-color: #f8f9fa;
    border-top: 1px solid #e0e0e0;
}

.save-btn {
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

.save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

.save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.cancel-btn {
    font-weight: 600 !important;
    text-transform: none !important;
    letter-spacing: 0.5px;
    padding: 0.5rem 2rem !important;
    border-radius: 8px !important;
    transition: all 0.3s ease;
}

.cancel-btn:hover {
    background-color: rgba(211, 47, 47, 0.04) !important;
}

/* Vuetify Component Customization */
:deep(.custom-select .v-field),
:deep(.custom-textarea .v-field) {
    border-radius: 8px;
}

:deep(.custom-select .v-field--focused),
:deep(.custom-textarea .v-field--focused) {
    border-color: #6E3894;
    box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
}

:deep(.v-select .v-field__input) {
    color: #2c3e50;
    font-weight: 500;
}

:deep(.v-textarea .v-field__input) {
    color: #2c3e50;
}

/* Responsive Design */
@media (max-width: 768px) {
    .modal-body {
        padding: 1.5rem 1rem !important;
    }

    .modal-actions {
        flex-direction: column-reverse;
        gap: 0.5rem;
    }

    .save-btn,
    .cancel-btn {
        width: 100%;
    }
}

/* Animation for dialog */
.v-overlay {
    backdrop-filter: blur(8px);
}

.v-dialog > .v-overlay__content {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Additional visual feedback */
.custom-select:hover :deep(.v-field) {
    border-color: #6E3894;
}

.custom-textarea:hover :deep(.v-field) {
    border-color: #6E3894;
}
</style>