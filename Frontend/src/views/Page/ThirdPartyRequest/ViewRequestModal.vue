<template>
    <v-dialog v-model="isOpen" max-width="720px" persistent>
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartyrequest.view_request') }}</span>
                <v-btn icon @click="closeModal" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-3" style="background: white;">
                <v-expansion-panels v-model="expandedPanels" multiple>
                    <!-- Request Information Section -->
                    <v-expansion-panel class="mb-3" style="border-radius: 8px;">
                        <v-expansion-panel-title class="header-bold16" style="background-color: #F0F0F0;">
                            {{ $t('thirdpartyrequest.request_info') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text style="background: white;">
                            <div style="padding: 12px;">
                                <!-- Row 1 -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyrequest.requested_by') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ getUserName(requestData.requested_by) }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyrequest.department') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ getDepartmentName(requestData.department_id) }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyrequest.job_title') }}::
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ getJobName(requestData.job_id) }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Row 2 -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyrequest.third_party_profile') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ requestData?.profile?.third_party_name }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyrequest.third_party_service') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ requestData?.service?.name }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyrequest.status') }}
                                        </label>
                                        <v-chip 
                                            v-if="requestData.status === 1" 
                                            size="small" 
                                            style="background: #FEF3C7; color: #92400E; font-size: 11px; height: 22px;"
                                        >
                                            {{ $t('thirdpartyrequest.pending') }}
                                        </v-chip>
                                        <v-chip 
                                            v-else-if="requestData.status === 2" 
                                            size="small"
                                            style="background: #DBEAFE; color: #1E40AF; font-size: 11px; height: 22px;"
                                        >
                                            {{ $t('thirdpartyrequest.in_assessment') }}
                                        </v-chip>
                                        <v-chip 
                                            v-else-if="requestData.status === 3" 
                                            size="small"
                                            style="background: #FEE2E2; color: #991B1B; font-size: 11px; height: 22px;"
                                        >
                                            {{ $t('thirdpartyrequest.refused') }}
                                        </v-chip>
                                    </div>
                                </div>

                                <!-- Row 3 -->
                                <div>
                                    <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                        {{ $t('thirdpartyrequest.business_info') }}:
                                    </label>
                                    <div style="font-size: 13px; color: #111827; line-height: 1.5;">
                                        {{ stripHtml(requestData.business_info) }}
                                        <span v-if="requestData.business_info && requestData.business_info.length > 100" 
                                              style="color: #6E3894; cursor: pointer; font-size: 11px; margin-left: 4px;">
                                            See More
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <!-- Evolution Section -->
                    <v-expansion-panel style="border-radius: 8px;">
                        <v-expansion-panel-title class="header-bold16" style="background-color: #F0F0F0;">
                            {{ $t('thirdpartyrequest.evaluation_checklist') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text style="background: white;">
                            <div style="padding: 12px;">
                                <div v-for="(evaluation, index) in requestData.evaluations" :key="evaluation.id" 
                                     style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
                                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; align-items: start;">
                                        <div>
                                            <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                {{ $t('thirdpartyrequest.question') }} {{ index + 1 }}:
                                            </label>
                                            <div style="font-size: 13px; color: #111827; line-height: 1.5;">
                                                {{ evaluation.name }}
                                            </div>
                                        </div>
                                        <div>
                                            <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                {{ $t('thirdpartyrequest.answer') }}:
                                            </label>
                                            <v-chip 
                                                :style="{
                                                    background: evaluation.answer === 'yes' ? '#D1FAE5' : '#FEE2E2',
                                                    color: evaluation.answer === 'yes' ? '#065F46' : '#991B1B',
                                                    fontSize: '11px',
                                                    height: '22px'
                                                }"
                                                size="small"
                                            >
                                                {{ evaluation.answer === 'yes' ? $t('thirdpartyrequest.yes') : $t('thirdpartyrequest.no') }}
                                            </v-chip>
                                        </div>
                                        <div>
                                            <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                {{ $t('thirdpartyrequest.explanation') }}:
                                            </label>
                                            <div style="font-size: 13px; color: #111827;">
                                                {{ evaluation.explanation || 'N/A' }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <div v-if="canTakeActionsButtons" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; padding-top: 16px;">
                                    <v-btn 
                                        v-if="requestData.status != 3 && requestData.status != 2"
                                        variant="outlined"
                                        rounded="pill"
                                        size="small"
                                        @click="handleRefuse"
                                        style="text-transform: none; font-size: 13px; border-color: #DC2626; color: #DC2626;"
                                    >
                                        {{ $t('thirdpartyrequest.refuse') }}
                                    </v-btn>
                                    <v-btn 
                                        v-if="requestData.status != 3"
                                        variant="flat"
                                        rounded="pill"
                                        size="small"
                                        @click="handleCreateAssessment"
                                        style="text-transform: none; font-size: 13px; background: #6E3894; color: white;"
                                    >
                                        {{ $t('thirdpartyrequest.create_assessment') }}
                                    </v-btn>
                                </div>
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>

            <!-- Footer -->
            <v-card-actions class="pa-4" style="background: #f3f4f6; justify-content: flex-end;">
                <v-btn 
                    variant="outlined"
                    rounded="pill"
                    size="small"
                    @click="closeModal"
                    style="text-transform: none; font-size: 13px; border-color: #6E3894; color: #6E3894;"
                >
                    {{ $t('thirdpartyrequest.close') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import "vue-select/dist/vue-select.css";

export default {
    name: 'ViewRequestModal',
    props: {
        modelValue: Boolean,
        requestData: Object,
        users: Array,
        departments: Array,
        jobs: Array,
        canTakeActionsButtons: { type: Boolean, default: true }
    },
    emits: ['update:modelValue', 'createAssessment', 'refuse'],
    data() {
        return {
            expandedPanels: [0, 1]
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
        },
        getUserName(user_id) {
            const user = this.users.find(user => user.id === user_id);
            return user ? user.full_name : "N/A";
        },
        getJobName(job_id) {
            const job = this.jobs.find(job => job.id === job_id);
            return job ? job.name : "N/A";
        },
        getDepartmentName(department_id) {
            const department = this.departments.find(department => department.id === department_id);
            return department ? department.name : "N/A";
        },
        stripHtml(html) {
            if (!html) return 'N/A';
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.textContent || div.innerText || '';
        },
        handleCreateAssessment() {
            this.$emit('createAssessment', this.requestData.id);
            this.closeModal();
        },
        handleRefuse() {
            this.$emit('refuse', this.requestData.id);
            this.closeModal();
        }
    }
};
</script>

<style scoped>
.header-bold20 {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 100%;
  text-transform: capitalize;
  color: #000000;
}

:deep(.v-expansion-panel-title) {
    min-height: 48px !important;
    padding: 12px 16px !important;
}

:deep(.v-expansion-panel-text__wrapper) {
    padding: 0 !important;
}

.header-bold16 {
  color: #000000;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 16px;
  line-height: 100%;
  letter-spacing: 0;
  text-transform: none; /* Keep as title case by writing text accordingly */
}

.v-expansion-panel-text {
  border-left: 0px solid #cccccc !important;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .v-card-title ,[dir="rtl"] .header-bold16{
    flex-direction: row-reverse;
}
[dir="rtl"] .v-expansion-panel-text {
    text-align: end;
}
</style>