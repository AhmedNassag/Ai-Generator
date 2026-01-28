<template>
    <v-dialog :model-value="modelValue" max-width="600px" persistent @update:model-value="$emit('update:modelValue', $event)">
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartyquestionnaire.editAssessment') }}</span>
                <v-btn icon @click="handleClose" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-4" style="background: white;">
                <v-form>
                    <!-- Assessment Name -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyquestionnaire.assessmentName') }}
                        </label>
                        <v-text-field 
                            v-model="localData.name" 
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            required
                        ></v-text-field>
                    </div>

                    <!-- Instructions -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyquestionnaire.instructions') }}
                        </label>
                        <v-textarea 
                            v-model="localData.instructions" 
                            variant="outlined"
                            rows="3"
                            hide-details
                        ></v-textarea>
                    </div>

                    <!-- Assessment -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyquestionnaire.assessment') }}
                        </label>
                        <v-select 
                            id="Assessments" 
                            v-model="localData.assessment_id" 
                            :options="assessmentsOptions"
                            placeholder="Select assessment" 
                            :reduce="(option) => option.id" 
                            label="name" 
                            clearable
                        ></v-select>
                    </div>

                    <!-- Contacts -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyquestionnaire.contacts') }}
                        </label>
                        <v-select 
                            id="Contacts" 
                            v-model="localData.contact_id" 
                            :options="contactsOptions" 
                            placeholder="Select Contact"
                            :reduce="(option) => option.id" 
                            label="name" 
                            clearable
                        ></v-select>
                    </div>

                    <!-- Checkbox -->
                    <div>
                        <v-checkbox 
                            v-model="isMandatory"
                            label="All Questions Mandatory"
                            hide-details
                            density="compact"
                        ></v-checkbox>
                    </div>
                </v-form>
            </v-card-text>

            <!-- Footer -->
            <v-card-actions class="pa-4" style="background: #f3f4f6; justify-content: flex-end; gap: 8px;">
                <v-btn 
                    variant="outlined"
                    rounded="pill"
                    size="small"
                    @click="handleClose"
                    style="text-transform: none; font-size: 13px; border-color: #d1d5db; color: #374151;"
                >
                    <v-icon size="16" class="mr-1">mdi-close-circle</v-icon>
                    {{ $t('thirdpartyquestionnaire.close') }}
                </v-btn>

                <v-btn 
                    variant="flat"
                    rounded="pill"
                    size="small"
                    :disabled="!localData.name"
                    @click="handleUpdate"
                    style="text-transform: none; font-size: 13px; background: #6E3894; color: white;"
                >
                    <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
                    {{ $t('thirdpartyquestionnaire.update') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import vSelect from "vue-select";

export default {
    name: "EditAssessmentDialog",

    components: {
        vSelect,
    },

    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        assessmentData: {
            type: Object,
            default: () => ({}),
        },
        assessmentsOptions: {
            type: Array,
            default: () => [],
        },
        contactsOptions: {
            type: Array,
            default: () => [],
        },
    },

    emits: ["update:modelValue", "update", "close"],

    data() {
        return {
            localData: {},
        };
    },

    computed: {
        isMandatory: {
            get() {
                return this.localData.all_questions_mandatory === "true";
            },
            set(value) {
                this.localData.all_questions_mandatory = value ? "true" : "false";
            },
        },
    },

    watch: {
        assessmentData: {
            handler(newVal) {
                this.localData = JSON.parse(JSON.stringify(newVal));
            },
            deep: true,
            immediate: true,
        },
    },

    methods: {
        handleUpdate() {
            this.$emit("update", this.localData);
        },

        handleClose() {
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

:deep(.v-text-field .v-field) {
    border-radius: 6px;
}

:deep(.v-textarea .v-field) {
    border-radius: 6px;
}

:deep(.vs__dropdown-toggle) {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 6px 10px;
    min-height: 40px;
}

:deep(.vs__selected) {
    font-size: 13px;
    color: #111827;
}
</style>