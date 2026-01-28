<template>
    <v-dialog :model-value="modelValue" max-width="720px" persistent @update:model-value="$emit('update:modelValue', $event)">
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartyquestionnaire.assessmentDetails') }}</span>
                <v-btn icon @click="handleClose" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-3" style="background: #FFFFFF;">
                <v-expansion-panels v-model="expandedPanels" multiple>
                    <!-- Assessment Information Section -->
                    <v-expansion-panel class="mb-3" style="border-radius: 8px;">
                        <v-expansion-panel-title class="header-bold16" style="background: #F0F0F0; font-weight: 600; font-size: 14px;">
                            {{ $t('thirdpartyquestionnaire.assessmentInformation') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text style="background: white;">
                            <div style="padding: 12px;">
                                <!-- Row 1 -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyquestionnaire.name') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ assessmentData.name }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyquestionnaire.instructions') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ assessmentData.instructions }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Row 2 -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyquestionnaire.thirdPartyName') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ assessmentData.request?.profile?.third_party_name }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyquestionnaire.assessmentName') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ assessmentData.assessment?.name }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <!-- Contacts Section -->
                    <v-expansion-panel class="mb-3" style="border-radius: 8px;">
                        <v-expansion-panel-title class="header-bold16"  style="background: #F0F0F0; font-weight: 600; font-size: 14px;">
                            {{ $t('thirdpartyquestionnaire.contacts') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text style="background: white;">
                            <div style="padding: 12px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyquestionnaire.name') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ assessmentData.contact?.name }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyquestionnaire.email') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ assessmentData.contact?.email }}
                                        </div>
                                    </div>
                                    <div>
                                        <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                            {{ $t('thirdpartyquestionnaire.phone') }}:
                                        </label>
                                        <div style="font-size: 13px; color: #111827; font-weight: 500;">
                                            {{ assessmentData.contact?.phone }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>

                    <!-- Questions Section -->
                    <v-expansion-panel style="border-radius: 8px;">
                        <v-expansion-panel-title class="header-bold16"  style="background: #F0F0F0; font-weight: 600; font-size: 14px;">
                            {{ $t('thirdpartyquestionnaire.questions') }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text style="background: white;">
                            <div style="padding: 12px;">
                                <div 
                                    v-for="(question, index) in assessmentData.assessment?.template?.questions" 
                                    :key="index" 
                                    style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;"
                                >
                                    <label style="display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px;">
                                        {{ $t('thirdpartyquestionnaire.question') }} {{ index + 1 }}:
                                    </label>
                                    <div style="font-size: 13px; color: #111827; line-height: 1.5;" v-html="question.question"></div>
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
                    @click="handleClose"
                    style="text-transform: none; font-size: 13px; border-color: #6E3894; color: #6E3894;"
                >
                    {{ $t('thirdpartyquestionnaire.close') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "ViewAssessmentDialog",

    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        assessmentData: {
            type: Object,
            default: () => ({}),
        },
    },

    emits: ["update:modelValue", "close"],

    data() {
        return {
            expandedPanels: [0, 1, 2],
        };
    },

    methods: {
        handleClose() {
            this.expandedPanels = [0, 1, 2];
            this.$emit("close");
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
  text-transform: none; 
}

.v-expansion-panel-text {
  border-left: 0px solid #cccccc !important;
}
[dir="rtl"] .v-card-title ,[dir="rtl"] .header-bold16{
    flex-direction: row-reverse;
}
[dir="rtl"] .v-expansion-panel-text {
    text-align: end;
}
</style>