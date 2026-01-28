<template>
    <v-dialog v-model="localShow" max-width="550px" persistent>
        <v-card class="status-modal">
            <v-card-title class="modal-header">
                <span class="modal-title">{{ $t('risk.set_risk_status_to') }}</span>
                <v-btn icon @click="close" class="close-btn">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="modal-body">
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <label class="field-label">{{ $t('risk.status') }}</label>
                            <select id="statusFilterModal" class="form-control custom-select" v-model="selectedStatus">
                                <option value="">{{ $t('risk.select_an_option') }}</option>
                                <option v-for="opt in statusOptions" :key="opt.value ?? opt.id ?? opt"
                                    :value="opt.value ?? opt.id ?? opt">
                                    {{ opt.text ?? opt.name ?? opt }}
                                </option>
                            </select>
                        </v-col>

                        <v-col cols="12" v-if="selectedStatus === closedStatusValue">
                            <v-textarea 
                                v-model="closeOutInformation" 
                                :label="$t('risk.close_out_information')"
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
                    class="save-btn">
                    <v-icon left size="20">mdi-content-save</v-icon>
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
    name: 'ChangeStatusModal',
    props: {
        show: { type: Boolean, default: false },
        statusOptions: { type: Array, default: () => [] },
        initialStatus: { type: [String, Number], default: '' },
        initialCloseOutInformation: { type: String, default: '' },
        closedStatusValue: { type: [String, Number], default: 'Closed Risk' },
    },
    emits: ['update:show', 'confirm'],
    data() {
        return {
            selectedStatus: '',
            closeOutInformation: '',
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
                this.selectedStatus = this.initialStatus ?? '';
                this.closeOutInformation = this.initialStatus === this.closedStatusValue ? this.initialCloseOutInformation ?? '' : '';
            }
        },
        initialStatus(newVal) { this.selectedStatus = newVal ?? ''; },
        initialCloseOutInformation(newVal) {
            if (this.initialStatus === this.closedStatusValue) this.closeOutInformation = newVal ?? '';
        },
        selectedStatus(newVal) {
            if (newVal !== this.closedStatusValue) this.closeOutInformation = '';
        }
    },
    methods: {
        close() {
            this.$emit('update:show', false);
        },
        onConfirm() {
            const isClosed = this.selectedStatus === this.closedStatusValue;
            const payload = {
                status: this.selectedStatus,
                closeOutInformation: isClosed ? this.closeOutInformation : null,
                reason_close: isClosed ? undefined : null,
            };
            this.$emit('confirm', payload);
            this.$emit('update:show', false);
        }
    }
};
</script>

<style scoped>
.status-modal {
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

.custom-select {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px !important;
    background-color: #ffffff;
    color: #2c3e50;
    transition: all 0.3s ease;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236E3894' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    cursor: pointer;
}

.custom-select:focus {
    outline: none;
    border-color: #6E3894;
    box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.custom-select option {
    padding: 0.5rem;
    background-color: white;
    color: #2c3e50;
}

.custom-textarea {
    margin-top: 0.5rem;
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

.save-btn:hover {
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

.cancel-btn:hover {
    background-color: rgba(211, 47, 47, 0.04) !important;
}

/* Vuetify Textarea Customization */
:deep(.custom-textarea .v-field) {
    border-radius: 8px;
}

:deep(.custom-textarea .v-field--focused) {
    border-color: #6E3894;
    box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
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
</style>