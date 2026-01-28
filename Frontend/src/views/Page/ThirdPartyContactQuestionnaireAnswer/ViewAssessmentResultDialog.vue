<template>
    <v-dialog :model-value="modelValue" max-width="1000px" persistent
        @update:model-value="$emit('update:modelValue', $event)">
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4"
                style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartycontactquestionnaireanswer.assessment_result') }}</span>
                <v-btn icon @click="handleClose" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-0" style="background: white;">
                <v-stepper v-model="step" elevation="0" style="background: #F0F0F0;">
                    <!-- Stepper Header -->
                    <v-stepper-header
                        style="background: white; box-shadow: none; padding: 8px 16px; border-bottom: 1px solid #e5e7eb;">
                        <v-stepper-item :value="1"
                            :title="$t('thirdpartycontactquestionnaireanswer.questionnaire_answer')"
                            :complete="step > 1" />
                        <v-divider style="margin: 0 8px;"></v-divider>
                        <v-stepper-item :value="2" :title="$t('thirdpartycontactquestionnaireanswer.risk_assessment')"
                            :complete="step > 2" />
                        <v-divider style="margin: 0 8px;"></v-divider>
                        <v-stepper-item :value="3" :title="$t('thirdpartycontactquestionnaireanswer.remediation_note')"
                            :complete="step > 3" />
                    </v-stepper-header>

                    <v-stepper-window style="margin: 0;">
                        <!-- Step 1: Questionnaire Answer -->
                        <v-stepper-window-item :value="1">
                            <div style="padding: 16px; max-height: 500px; overflow-y: auto;">
                                <div v-for="(result, index) in assessmentData.contact_questionnaire_answer_results"
                                    :key="index"
                                    style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px;">
                                        <div>
                                            <label
                                                style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                {{ $t('thirdpartycontactquestionnaireanswer.question') }} {{ index + 1
                                                }}:
                                            </label>
                                            <div style="font-size: 13px; color: #111827; line-height: 1.5;"
                                                v-html="result.question.question"></div>
                                        </div>
                                        <div>
                                            <label
                                                style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                {{ $t('thirdpartycontactquestionnaireanswer.answer') }}:
                                            </label>
                                            <div  :class="{
                                                'accepted-badge': getAnswerText(result) === 'Yes',
                                                'refused-badge': getAnswerText(result) === 'No'
                                            }">
                                                {{ getAnswerText(result) }}
                                            </div>
                                        </div>
                                        <div>
                                            <label
                                                style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                                {{ $t('thirdpartycontactquestionnaireanswer.comment') }}:
                                            </label>
                                            <div style="font-size: 13px; color: #111827;">
                                                {{ result.comment ?? 'N/A' }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="pa-4" style="background: #f3f4f6; display: flex; justify-content: flex-end;">
                                <v-btn variant="flat" rounded="pill" size="small" @click="step = 2"
                                    style="text-transform: none; font-size: 13px; background: #6E3894; color: white;">
                                    {{ $t('thirdpartycontactquestionnaireanswer.next') }}
                                    <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
                                </v-btn>
                            </div>
                        </v-stepper-window-item>

                        <!-- Step 2: Risk Assessment -->
                        <v-stepper-window-item :value="2">
                            <div style="padding: 16px; max-height: 500px; overflow-y: auto; background-color: white;">
                                <v-expansion-panels v-model="expandedPanels" multiple>
                                    <!-- Analysis Panel -->
                                    <v-expansion-panel style="border-radius: 8px; margin-bottom: 12px;">
                                        <v-expansion-panel-title
                                            style="background: #F0F0F0;"  class="header-bold16">
                                            Analysis
                                        </v-expansion-panel-title>
                                        <v-expansion-panel-text style="background: white;">
                                            <div style="padding: 12px;">
                                                <v-table density="compact">
                                                    <thead>
                                                        <tr style="background-color: rgba(110, 56, 148, 1) !important;">
                                                            <th style="color: white; font-size: 12px;">{{
                                                                $t('thirdpartycontactquestionnaireanswer.type') }}</th>
                                                            <th style="color: white; font-size: 12px;">{{
                                                                $t('thirdpartycontactquestionnaireanswer.total_number')
                                                                }}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{{ $t('thirdpartycontactquestionnaireanswer.all_risks')
                                                                }}</td>
                                                            <td>{{ allRisks.length || 0 }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{{
                                                                $t('thirdpartycontactquestionnaireanswer.added_risks')
                                                                }}</td>
                                                            <td>{{ addedRisks.length || 0 }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{{
                                                                $t('thirdpartycontactquestionnaireanswer.pending_risks')
                                                                }}</td>
                                                            <td>{{ pendingRisks.length || 0 }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{{
                                                                $t('thirdpartycontactquestionnaireanswer.rejected_risks')
                                                                }}</td>
                                                            <td>{{ rejectedRisks.length || 0 }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>{{
                                                                $t('thirdpartycontactquestionnaireanswer.risk_factor')
                                                                }}</td>
                                                            <td>{{ riskFactor || 0 }} / 25</td>
                                                        </tr>
                                                    </tbody>
                                                </v-table>
                                            </div>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>

                                    <!-- Potential Risks Panel -->
                                    <v-expansion-panel style="border-radius: 8px;">
                                        <v-expansion-panel-title
                                            style="background: #F0F0F0;"  class="header-bold16">
                                            Potential Risks
                                        </v-expansion-panel-title>
                                        <v-expansion-panel-text style="background: white;">
                                            <div style="padding: 12px; overflow-x: auto;">
                                                <v-table density="compact">
                                                    <thead>
                                                        <tr style="background-color: rgba(110, 56, 148, 1) !important;">
                                                            <th style="color: white; font-size: 12px;">{{
                                                                $t('thirdpartycontactquestionnaireanswer.answer') }}
                                                            </th>
                                                            <th style="color: white; font-size: 12px;">{{
                                                                $t('thirdpartycontactquestionnaireanswer.risk_subject')
                                                                }}</th>
                                                            <th style="color: white; font-size: 12px;">{{
                                                                $t('thirdpartycontactquestionnaireanswer.likelihood') }}
                                                            </th>
                                                            <th style="color: white; font-size: 12px;">{{
                                                                $t('thirdpartycontactquestionnaireanswer.impact') }}
                                                            </th>
                                                            <th style="color: white; font-size: 12px;">{{
                                                                $t('thirdpartycontactquestionnaireanswer.created_at') }}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="risk in formattedRisks" :key="risk.id">
                                                            <td>{{ risk.answer_text || 'N/A' }}</td>
                                                            <td>{{ risk.risk_subject || 'N/A' }}</td>
                                                            <td>{{ risk.likelihood_id || 'N/A' }}</td>
                                                            <td>{{ risk.impact_id || 'N/A' }}</td>
                                                            <td>{{ formatDate(risk.created_at) }}</td>
                                                        </tr>
                                                    </tbody>
                                                </v-table>
                                            </div>
                                        </v-expansion-panel-text>
                                    </v-expansion-panel>
                                </v-expansion-panels>

                                <!-- Action Buttons -->
                                <div v-if="canTakeAction"
                                    style="display: flex; justify-content: center; gap: 10px; margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <v-btn v-permission:approveRequestAssessment
                                        v-if="assessmentData.approved_status != 'yes'" variant="flat" rounded="pill"
                                        size="small" @click="updateStatus('yes')"
                                        style="text-transform: none; font-size: 13px; background: #10B981; color: white;">
                                        <v-icon size="16" class="mr-1">mdi-check</v-icon>
                                        {{ $t('thirdpartycontactquestionnaireanswer.approve') }}
                                    </v-btn>
                                    <v-btn v-permission:refuseRequestAssessment
                                        v-if="assessmentData.approved_status != 'no'" variant="flat" rounded="pill"
                                        size="small" @click="updateStatus('no')"
                                        style="text-transform: none; font-size: 13px; background: #DC2626; color: white;">
                                        <v-icon size="16" class="mr-1">mdi-close</v-icon>
                                        {{ $t('thirdpartycontactquestionnaireanswer.reject') }}
                                    </v-btn>
                                    <v-btn variant="flat" rounded="pill" size="small" @click="step = 3"
                                        style="text-transform: none; font-size: 13px; background: #6E3894; color: white;">
                                        <v-icon size="16" class="mr-1">mdi-refresh</v-icon>
                                        {{ $t('thirdpartycontactquestionnaireanswer.remediation') }}
                                    </v-btn>
                                </div>
                            </div>
                            <div class="pa-4" style="background: #f3f4f6; display: flex; justify-content: flex-end;">
                                <v-btn variant="outlined" rounded="pill" size="small" @click="step = 1"
                                    style="text-transform: none; font-size: 13px; border-color: #d1d5db; color: #374151;">
                                    <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
                                    {{ $t('thirdpartycontactquestionnaireanswer.previous') }}
                                </v-btn>
                            </div>
                        </v-stepper-window-item>

                        <!-- Step 3: Remediation Note -->
                        <v-stepper-window-item :value="3">
                            <div style="padding: 16px; background: white; margin: 16px; border-radius: 8px;">
                                <label
                                    style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 8px;">
                                    {{ $t('thirdpartycontactquestionnaireanswer.remediation_note') }}
                                </label>
                                <ckeditor v-model="remediationNote" :editor="editor" :config="editorConfig"></ckeditor>
                            </div>
                            <div class="pa-4"
                                style="background: #f3f4f6; display: flex; justify-content: flex-end; gap: 8px;">
                                <v-btn variant="outlined" rounded="pill" size="small" @click="step = 2"
                                    style="text-transform: none; font-size: 13px; border-color: #d1d5db; color: #374151;">
                                    <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
                                    {{ $t('thirdpartycontactquestionnaireanswer.previous') }}
                                </v-btn>
                                <v-btn v-permission:sendRemediation v-if="canTakeAction" variant="flat" rounded="pill"
                                    size="small" @click="updateStatus('remediation')"
                                    style="text-transform: none; font-size: 13px; background: #6E3894; color: white;">
                                    {{ $t('thirdpartycontactquestionnaireanswer.save_and_send') }}
                                </v-btn>
                            </div>
                        </v-stepper-window-item>
                    </v-stepper-window>
                </v-stepper>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default {
    name: "ViewAssessmentResultDialog",
    components: { ckeditor: Ckeditor },
    props: {
        modelValue: { type: Boolean, default: false },
        assessmentData: { type: Object, default: () => ({}) },
        canTakeAction: { type: Boolean, default: false },
    },
    emits: ["update:modelValue", "close", "status-updated"],
    data() {
        return {
            step: 1,
            expandedPanels: [0, 1],
            remediationNote: "",
            editor: ClassicEditor,
            editorConfig: { licenseKey: "GPL", height: 500 },
        };
    },
    computed: {
        allRisks() { return this.assessmentData?.questionnaire?.risks || []; },
        addedRisks() { return this.allRisks.filter((risk) => risk.status === "added"); },
        pendingRisks() { return this.allRisks.filter((risk) => risk.status === "pending"); },
        rejectedRisks() { return this.allRisks.filter((risk) => risk.status === "rejected"); },
        riskScores() { return this.assessmentData?.questionnaire?.risks?.map((risk) => risk.risk_score) || []; },
        riskFactor() { return this.riskScores.length ? Math.max(...this.riskScores) : 0; },
        formattedRisks() {
            return this.allRisks.map((risk) => {
                const matchingQuestion = this.assessmentData.questionnaire?.questions?.find((question) =>
                    question.answers?.some((answer) => answer.id === risk.answer_id)
                );
                const answerText = matchingQuestion ? matchingQuestion.answers.find((answer) => answer.id === risk.answer_id)?.text : "N/A";
                return { ...risk, answer_text: answerText };
            });
        },
    },
    methods: {
        handleClose() {
            this.remediationNote = "";
            this.step = 1;
            this.expandedPanels = [0, 1];
            this.$emit("close");
        },
        formatDate(date) {
            if (!date) return "N/A";
            return new Intl.DateTimeFormat("en-GB", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: true,
            }).format(new Date(date));
        },
        getAnswerText(result) {
            return result.question.answers?.find((answer) => answer.id === result.answer_id)?.text || "N/A";
        },
        updateStatus(status) {
            this.$emit("status-updated", {
                id: this.assessmentData.id,
                status: status,
                note: this.remediationNote,
            });
        },
    },
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

:deep(.v-expansion-panel-title) {
    min-height: 48px !important;
    padding: 12px 16px !important;
}

:deep(.v-expansion-panel-text__wrapper) {
    padding: 0 !important;
}

.refused-badge {
    display: inline-block;
    background-color: #EED3D3;
    color: #A92525;
    border-radius: 15px;
    padding: 3px 10px;
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
}

.accepted-badge {
    display: inline-block;
    background-color: #D3DFCE;
    color: #255F0B;
    border-radius: 15px;
    padding: 3px 10px;
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
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

</style>