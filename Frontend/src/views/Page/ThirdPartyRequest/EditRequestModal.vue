<template>
    <v-dialog v-model="isOpen" max-width="720px" persistent>
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4"
                style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartyrequest.edit_request') }}</span>
                <v-btn icon @click="closeModal" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-0" style="background: #f3f4f6;">
                <v-form @submit.prevent="handleSubmit">
                    <v-stepper v-model="currentStep" elevation="0" style="background: #F0F0F0;">
                        <!-- Stepper Header -->
                        <v-stepper-header
                            style="background: white; box-shadow: none; padding: 8px 16px; border-bottom: 1px solid #e5e7eb;">
                            <v-stepper-item :value="1" :title="$t('thirdpartyrequest.request_info')" />
                            <v-divider style="margin: 0 8px;"></v-divider>
                            <v-stepper-item :value="2" :title="$t('thirdpartyrequest.evaluation_checklist')" />
                        </v-stepper-header>

                        <v-stepper-window style="margin: 0;">
                            <!-- Step 1 -->
                            <v-stepper-window-item :value="1">
                                <div style="padding: 15px; background: white; margin: 10px; border-radius: 6px;">
                                    <v-row dense>
                                        <v-col cols="6">
                                            <label
                                                style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.requested_by') }}
                                            </label>
                                            <v-select v-model="formData.requested_by" :options="users"
                                                :reduce="option => option.id" label="full_name" disabled
                                                class="diasabled-selected"></v-select>
                                        </v-col>
                                        <v-col cols="6">
                                            <label
                                                style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.department') }}
                                            </label>
                                            <v-select v-model="formData.department_id" :options="departments"
                                                :reduce="option => option.id" label="name" disabled
                                                class="diasabled-selected"></v-select>
                                        </v-col>
                                    </v-row>

                                    <v-row dense class="mt-2">
                                        <v-col cols="12">
                                            <label
                                                style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.job_title') }}
                                            </label>
                                            <v-select v-model="formData.job_id" :options="jobs"
                                                :reduce="option => option.id" label="name" disabled
                                                class="diasabled-selected"></v-select>
                                        </v-col>
                                    </v-row>

                                    <v-row dense class="mt-2">
                                        <v-col cols="6">
                                            <label
                                                style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.third_party_profile') }}
                                            </label>
                                            <!-- <v-select v-model="formData.third_party_profile_id"
                                                :options="thirdPartyProfiles" :reduce="option => option.id"
                                                label="third_party_name" placeholder="Select"></v-select> -->
                                            <LazySelectField name="third_party_profile_id" options="ThirdPartyProfile"
                                                v-model="formData.third_party_profile_id"
                                                :placeholder="$t('thirdpartyrequest.select_third_party_profile')"
                                                option-label="third_party_name" option-value="id" />
                                        </v-col>
                                        <v-col cols="6">
                                            <label
                                                style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.third_party_service') }}
                                            </label>
                                            <!-- <v-select v-model="formData.third_party_service_id"
                                                :options="thirdPartyServices" :reduce="option => option.id" label="name"
                                                placeholder="Select"></v-select> -->

                                            <LazySelectField name="third_party_service_id" options="ThirdPartyService"
                                                v-model="formData.third_party_service_id"
                                                :placeholder="$t('thirdpartyrequest.select_service')"
                                                option-label="name" option-value="id" />

                                        </v-col>
                                    </v-row>

                                    <v-row dense class="mt-2">
                                        <v-col cols="12">
                                            <label
                                                style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.business_info') }}
                                            </label>
                                            <v-textarea v-model="formData.business_info" variant="outlined" rows="3"
                                                hide-details style="font-size: 13px;"></v-textarea>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-stepper-window-item>

                            <!-- Step 2 -->
                            <v-stepper-window-item :value="2">
                                <div style="padding: 16px; max-height: 420px; overflow-y: auto;">
                                    <div v-for="(evaluation, index) in localEvaluations" :key="evaluation.id"
                                        style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                        <div style="margin-bottom: 12px;">
                                            <div
                                                style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px;">
                                                {{ $t('thirdpartyrequest.question') }} {{ index + 1 }}:
                                            </div>
                                            <div style="font-size: 13px; color: #6b7280;">
                                                {{ evaluation.name }}
                                            </div>
                                        </div>

                                        <div style="margin-bottom: 12px;">
                                            <label
                                                style="display: block; font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 6px;">
                                                Comment(Optional)
                                            </label>
                                            <textarea :id="`explanation_${index}`"
                                                v-model="localEvaluations[index].explanation" rows="2"
                                                style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: inherit; resize: none;"></textarea>
                                        </div>

                                        <div style="display: flex; justify-content: flex-end; gap: 8px;">
                                            <button type="button" @click="localEvaluations[index].answer = 'no'" :style="{
                                                padding: '6px 28px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                border: '1px solid #d1d5db',
                                                background: localEvaluations[index].answer === 'no' ? '#f3f4f6' : 'white',
                                                color: '#374151'
                                            }">
                                                {{ $t('thirdpartyrequest.no') }}
                                            </button>
                                            <button type="button" @click="localEvaluations[index].answer = 'yes'"
                                                :style="{
                                                    padding: '6px 28px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    border: localEvaluations[index].answer === 'yes' ? '1px solid #6E3894' : '1px solid #d1d5db',
                                                    background: localEvaluations[index].answer === 'yes' ? '#6E3894' : 'white',
                                                    color: localEvaluations[index].answer === 'yes' ? 'white' : '#374151'
                                                }">
                                                {{ $t('thirdpartyrequest.yes') }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </v-stepper-window-item>
                        </v-stepper-window>
                    </v-stepper>

                    <!-- Footer -->
                    <v-card-actions class="pa-4" style="background: #f3f4f6; justify-content: flex-end; gap: 8px;">
                        <v-btn v-if="currentStep === 2" variant="outlined" rounded="pill" size="small"
                            @click="currentStep--"
                            style="text-transform: none; font-size: 13px; padding: 0 20px; border-color: #d1d5db; color: #374151;">
                            <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
                            {{ $t('thirdpartyrequest.back') }}
                        </v-btn>

                        <v-btn v-if="currentStep < 2" variant="flat" rounded="pill" size="small" @click="nextStep"
                            style="text-transform: none; font-size: 13px; padding: 0 20px; background: #6E3894; color: white;">
                            {{ $t('thirdpartyrequest.next') }}
                            <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
                        </v-btn>

                        <v-btn v-if="currentStep === 2" type="submit" variant="flat" rounded="pill" size="small"
                            style="text-transform: none; font-size: 13px; padding: 0 20px; background: #6E3894; color: white;">
                            <v-icon size="16" class="mr-1">mdi-check</v-icon>
                            {{ $t('thirdpartyrequest.update') }}
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import Auth from "@/API/Auth";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import LazySelectField from "@/components/LazySelectField.vue";
export default {
    name: 'EditRequestModal',
    components: { vSelect, LazySelectField },
    props: {
        modelValue: Boolean,
        users: Array,
        departments: Array,
        jobs: Array,
        thirdPartyProfiles: Array,
        thirdPartyServices: Array,
        editData: Object,
        editEvaluations: Array,
        api: { type: Object, required: true },
    },
    emits: ['update:modelValue', 'submit'],
    data() {
        return {
            currentStep: 1,
            formData: {},
            localEvaluations: []
        };
    },
    computed: {
        isOpen: {
            get() { return this.modelValue; },
            set(value) { this.$emit('update:modelValue', value); }
        }
    },
    watch: {
        editData: {
            handler(newVal) {
                this.formData = { ...newVal };
            },
            deep: true,
            immediate: true
        },
        editEvaluations: {
            handler(newVal) {
                this.localEvaluations = JSON.parse(JSON.stringify(newVal));
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        closeModal() {
            this.currentStep = 1;
            this.isOpen = false;
        },
        validateStep1() {
            if (!this.formData.third_party_profile_id) {
                this.api.poup({ status: false, message: this.$t("thirdpartyrequest.third_party_profile_required") }, this.$t("thirdpartyrequest.error"));
                return false;
            }
            if (!this.formData.third_party_service_id) {
                this.api.poup({ status: false, message: this.$t("thirdpartyrequest.service_required") }, this.$t("thirdpartyrequest.error"));
                return false;
            }
            if (!this.formData.business_info) {
                this.api.poup({ status: false, message: this.$t("thirdpartyrequest.business_info_required") }, this.$t("thirdpartyrequest.error"));
                return false;
            }
            return true;
        },
        nextStep() {
            if (this.currentStep === 1 && !this.validateStep1()) return;
            this.currentStep++;
        },
        handleSubmit() {
            const updatedData = {
                id: this.formData.id,
                requested_by: this.formData.requested_by,
                department_id: this.formData.department_id,
                job_id: this.formData.job_id,
                third_party_profile_id: this.formData.third_party_profile_id,
                third_party_service_id: this.formData.third_party_service_id,
                business_info: this.formData.business_info,
                evaluations: this.localEvaluations.map((evaluation) => ({
                    evaluation_id: evaluation.evaluation_id,
                    name: evaluation.name,
                    answer: evaluation.answer || null,
                    explanation: evaluation.explanation || "",
                })),
            };
            this.$emit('submit', updatedData);
        }
    }
};
</script>

<style scoped>
:deep(.v-stepper-item__avatar) {
    width: 24px !important;
    height: 24px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
}

:deep(.v-stepper-item--selected .v-stepper-item__avatar) {
    background-color: #111827 !important;
}

:deep(.v-stepper-item:not(.v-stepper-item--selected) .v-stepper-item__avatar) {
    background-color: #9ca3af !important;
}

:deep(.v-stepper-item__title) {
    font-size: 12px !important;
    font-weight: 500 !important;
}

.header-bold20 {
    width: 152px;
    height: 24px;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: 0%;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    color: #000000;
}

.diasabled-selected {
    background-color: #D9D9D9;
    color: #000000;
    border-radius: 10px;
}
</style>