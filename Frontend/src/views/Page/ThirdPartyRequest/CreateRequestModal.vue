<template>
    <v-dialog v-model="isOpen" max-width="720px" persistent>
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartyrequest.create_request') }}</span>
                <v-btn icon @click="closeModal" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-0" style="background: #f3f4f6;">
                <v-form @submit.prevent="saveRequest">
                    <v-stepper v-model="currentStep" elevation="0" style="background: #F0F0F0;">
                        <!-- Stepper Header -->
                        <v-stepper-header style="background: white; box-shadow: none; padding: 8px 16px; border-bottom: 1px solid #e5e7eb;">
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
                                            <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.requested_by') }}
                                            </label>
                                            <v-select 
                                                v-model="formData.requested_by" 
                                                :options="users"
                                                :reduce="option => option.id"
                                                  :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                                                label="full_name"
                                                disabled
                                                class="diasabled-selected"
                                            ></v-select>
                                        </v-col>
                                        <v-col cols="6">
                                            <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.department') }}
                                            </label>
                                            <v-select 
                                                v-model="formData.department_id"
                                                :options="departments"
                                                @update:modelValue="getJobs" 
                                                :reduce="option => option.id" 
                                                  :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                                                label="name"
                                                disabled
                                                class="diasabled-selected"
                                            ></v-select>
                                        </v-col>
                                    </v-row>

                                    <v-row dense class="mt-2">
                                        <v-col cols="12">
                                            <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.job_title') }}
                                            </label>
                                            <v-select 
                                                v-model="formData.job_id" 
                                                :options="jobs"
                                                :reduce="option => option.id" 
                                                  :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                                                label="name" 
                                                disabled
                                                class="diasabled-selected"
                                            ></v-select>
                                        </v-col>
                                    </v-row>

                                    <v-row dense class="mt-2">
                                        <v-col cols="6">
                                            <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.third_party_profile') }}
                                            </label>
                                            <!-- <v-select 
                                                v-model="formData.third_party_profile_id" 
                                                :options="thirdPartyProfiles"
                                                :reduce="option => option.id" 
                                                  :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                                                label="third_party_name" 
                                                placeholder="Select"
                                            ></v-select> -->

                                             <LazySelectField name="third_party_profile_id" options="ThirdPartyProfile"
                                                v-model="formData.third_party_profile_id"
                                                :placeholder="$t('thirdpartyrequest.select_third_party_profile')"
                                                option-label="third_party_name" option-value="id" />

                                        </v-col>
                                        <v-col cols="6">
                                            <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.third_party_service') }}
                                            </label>
                                            <!-- <v-select 
                                                v-model="formData.third_party_service_id" 
                                                :options="thirdPartyServices"
                                                :reduce="option => option.id" 
                                                  :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                                                label="name" 
                                                placeholder="Select"
                                                style="--vs-border-radius: 6px;"
                                            ></v-select> -->

                                            <LazySelectField name="third_party_service_id" options="ThirdPartyService"
                                                v-model="formData.third_party_service_id"
                                                :placeholder="$t('thirdpartyrequest.select_service')"
                                                option-label="name" option-value="id" />

                                            
                                        </v-col>
                                    </v-row>

                                    <v-row dense class="mt-2">
                                        <v-col cols="12">
                                            <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                                                {{ $t('thirdpartyrequest.business_info') }}
                                            </label>
                                            <v-textarea 
                                                v-model="formData.business_info" 
                                                variant="outlined"
                                                rows="3"
                                                hide-details
                                                style="font-size: 13px;"
                                            ></v-textarea>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-stepper-window-item>

                            <!-- Step 2 -->
                            <v-stepper-window-item :value="2">
                                <div style="padding: 16px; max-height: 420px; overflow-y: auto;">
                                    <div v-for="(evaluation, index) in evaluations" :key="evaluation.id" 
                                         style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                        <div style="margin-bottom: 12px;">
                                            <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px;">
                                                {{ $t('thirdpartyrequest.question') }} {{ index + 1 }}:
                                            </div>
                                            <div style="font-size: 13px; color: #6b7280;">
                                                {{ evaluation.name }}
                                            </div>
                                        </div>

                                        <div style="margin-bottom: 12px;">
                                            <label style="display: block; font-size: 11px; font-weight: 600; color: #111827; margin-bottom: 6px;">
                                                Comment(Optional)
                                            </label>
                                            <textarea 
                                                :id="`explanation_${index}`" 
                                                v-model="evaluation.explanation"
                                                rows="2"
                                                style="width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; font-family: inherit; resize: none;"
                                            ></textarea>
                                        </div>

                                        <div style="display: flex; justify-content: flex-end; gap: 8px;">
                                            <button 
                                                type="button"
                                                @click="evaluation.answer = 'no'"
                                                :style="{
                                                    padding: '6px 28px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    border: '1px solid #d1d5db',
                                                    background: evaluation.answer === 'no' ? '#f3f4f6' : 'white',
                                                    color: '#374151'
                                                }"
                                            >
                                                {{ $t('thirdpartyrequest.no') }}
                                            </button>
                                            <button 
                                                type="button"
                                                @click="evaluation.answer = 'yes'"
                                                :style="{
                                                    padding: '6px 28px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    border: evaluation.answer === 'yes' ? '1px solid #6E3894' : '1px solid #d1d5db',
                                                    background: evaluation.answer === 'yes' ? '#6E3894' : 'white',
                                                    color: evaluation.answer === 'yes' ? 'white' : '#374151'
                                                }"
                                            >
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
                        <v-btn 
                            v-if="currentStep === 2"
                            variant="outlined" 
                            rounded="pill"
                            size="small"
                            @click="currentStep--"
                            style="text-transform: none; font-size: 13px; padding: 0 20px; border-color: #d1d5db; color: #374151;"
                        >
                            <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
                            {{ $t('thirdpartyrequest.back') }}
                        </v-btn>

                        <v-btn 
                            v-if="currentStep < 2"
                            variant="flat" 
                            rounded="pill"
                            size="small"
                            @click="nextStep"
                            style="text-transform: none; font-size: 13px; padding: 0 20px; background: #6E3894; color: white;"
                        >
                            {{ $t('thirdpartyrequest.next') }}
                            <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
                        </v-btn>

                        <v-btn 
                            v-if="currentStep === 2"
                            type="submit" 
                            variant="flat" 
                            rounded="pill"
                            size="small"
                            style="text-transform: none; font-size: 13px; padding: 0 20px; background: #6E3894; color: white;"
                        >
                            {{ $t('thirdpartyrequest.submit') }}
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
    name: "CreateRequestModal",
    components: { vSelect, LazySelectField },
    props: {
        modelValue: { type: Boolean, default: false },
        users: { type: Array, required: true },
        departments: { type: Array, required: true },
        jobs: { type: Array, required: true },
        thirdPartyProfiles: { type: Array, required: true },
        thirdPartyServices: { type: Array, required: true },
        evaluations: { type: Array, required: true },
        api: { type: Object, required: true },
        initialData: Object
    },
    emits: ['update:modelValue', 'submit', 'getJobs'],
    watch: {
        initialData: {
            handler(newVal) {
                this.formData = { ...newVal };
            },
            deep: true
        }
    },
    data() {
        return {
            currentStep: 1,
            formData: {
                requested_by: Auth.USER.id,
                department_id: Auth.USER.department_id,
                job_id: Auth.USER.job_id,
                third_party_profile_id: null,
                third_party_service_id: null,
                business_info: null,
                evaluations: []
            },
            durationTypes: ['day', 'month', 'year'],
            currencyTypes: ['USD', 'EUR', 'SAR', 'GBP', 'EGP']
        };
    },
    computed: {
        isOpen: {
            get() { return this.modelValue; },
            set(value) { this.$emit('update:modelValue', value); }
        }
    },
    methods: {
        closeModal() {
            this.isOpen = false;
            this.currentStep = 1;
            this.resetForm();
        },
        resetForm() {
            this.formData = {
                requested_by: null,
                department_id: null,
                job_id: null,
                third_party_profile_id: null,
                third_party_service_id: null,
                business_info: null,
                evaluations: []
            };
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
        getJobs(id) {
            this.$emit('getJobs', id);
        },
        saveRequest() {
            this.formData.evaluations = this.evaluations.map((evaluation, index) => {
                const answer = evaluation.answer;
                const explanation = evaluation.explanation;
                return {
                    evaluation_id: evaluation.id,
                    name: evaluation.name,
                    answer: answer || null,
                    explanation: explanation || null
                };
            });
            this.$emit('submit', this.formData);
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

/* :deep(.vs__dropdown-toggle) {
    background: #e5e7eb;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 10px;
    min-height: 36px;
} */

/* :deep(.vs__selected) {
    font-size: 13px;
    color: #111827;
} */

.header-bold20 {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 100%;
  letter-spacing: 0%;
  text-transform: capitalize; /* Title Case */
  display: flex;
  align-items: center; /* Vertical alignment: middle */
  color: #000000; /* Optional, you can change as needed */
}

.diasabled-selected{
    background-color: #D9D9D9;
    color: #000000;
    border-radius: 10px;
}
[dir="rtl"] .v-card-title ,[dir="rtl"] .header-bold16 , [dir="rtl"].v-stepper-header , [dir="rtl"] .v-stepper-item{
    flex-direction: row-reverse;
}
[dir="rtl"] label ,[dir="rtl"] .v-input--density-default .v-field__input {
    text-align: end;
}

</style>