<template>
    <v-dialog v-model="isOpen" max-width="600px" persistent>
        <v-card class="elevation-4" style="border-radius: 12px;">
            <!-- Header -->
            <v-card-title class="d-flex justify-space-between align-center pa-4" style="background: #F0F0F0; border-bottom: 1px solid #e5e7eb;">
                <span class="header-bold20">{{ $t('thirdpartyrequest.create_assessment') }}</span>
                <v-btn icon @click="closeModal" size="small" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="pa-4" style="background: white;">
                <v-form>
                    <!-- Assessment Name -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyrequest.assessment_name') }}
                        </label>
                        <v-text-field 
                            v-model="formData.name" 
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            required
                        ></v-text-field>
                    </div>

                    <!-- Instructions -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyrequest.instructions') }}
                        </label>
                        <v-textarea 
                            v-model="formData.instructions" 
                            variant="outlined"
                            rows="3"
                            hide-details
                        ></v-textarea>
                    </div>

                    <!-- Assessment -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyrequest.assessment') }}
                        </label>
                        <!-- <v-select 
                            id="Assessments" 
                            v-model="formData.assessment_id" 
                            :options="assessments"
                              :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                            :placeholder="$t('thirdpartyrequest.select_assessment')" 
                            :reduce="option => option.id"
                            label="name" 
                            clearable
                        ></v-select> -->

                        <LazySelectField name="assessment_id" options="Assessment"
                            v-model="formData.assessment_id"
                            :placeholder="$t('thirdpartyrequest.select_assessment')"
                            option-label="name" option-value="id" />

                    </div>

                    <!-- Contacts -->
                    <div class="mb-4">
                        <label style="display: block; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 6px;">
                            {{ $t('thirdpartyrequest.contacts') }}
                        </label>
                        <v-select 
                            id="Contacts" 
                            v-model="formData.contact_id" 
                            :options="contacts"
                              :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
                            :placeholder="$t('thirdpartyrequest.select_contact')" 
                            :reduce="option => option.id" 
                            label="name"
                            clearable
                        ></v-select>
                    </div>

                    <!-- Checkbox -->
                    <div>
                        <v-checkbox 
                            v-model="formData.all_questions_mandatory"
                            :label="$t('thirdpartyrequest.all_questions_mandatory')"
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
                    @click="closeModal"
                    style="text-transform: none; font-size: 13px; border-color: #d1d5db; color: #374151;"
                >
                    <v-icon size="16" class="mr-1">mdi-close-circle</v-icon>
                    {{ $t('thirdpartyrequest.close') }}
                </v-btn>

                <v-btn 
                    variant="flat"
                    rounded="pill"
                    size="small"
                    :disabled="!formData.name"
                    @click="submitAssessment"
                    style="text-transform: none; font-size: 13px; background: #6E3894; color: white;"
                >
                    <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
                    {{ $t('thirdpartyrequest.submit') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import LazySelectField from "@/components/LazySelectField.vue";
export default {
    name: "CreateAssessmentModal",
    components: { vSelect, LazySelectField },
    props: {
        modelValue: { type: Boolean, default: false },
        requestId: { type: [String, Number], default: null },
        assessments: { type: Array, required: true },
        contacts: { type: Array, required: true },
    },
    emits: ['update:modelValue','submit'],
    data() {
        return {
            formData: {
                name: "",
                instructions: "",
                request_id: null,
                assessment_id: null,
                contact_id: null,
                all_questions_mandatory: false,
            }
        };
    },
    computed: {
        isOpen: {
            get() { return this.modelValue; },
            set(value) { this.$emit('update:modelValue', value); }
        }
    },
    watch: {
        requestId: {
            handler(newVal) {
                if (newVal) {
                    this.formData.request_id = newVal;
                }
            },
            immediate: true
        }
    },
    methods: {
        closeModal() {
            this.isOpen = false;
            this.resetForm();
        },
        resetForm() {
            this.formData = {
                name: "",
                instructions: "",
                request_id: null,
                assessment_id: null,
                contact_id: null,
                all_questions_mandatory: false,
            };
        },
        async submitAssessment() {
            this.$emit('submit', this.formData);
        }
    }
};
</script>

<style scoped>
/* .header-bold20 {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 100%;
  text-transform: capitalize;
  color: #000000;
} */

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

.header-bold20 {
  color: #000000;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 20px;
  line-height: 100%;
  letter-spacing: 0;
  vertical-align: middle;
  text-transform: none; /* Title Case should be applied in text content */
}
[dir="rtl"] .v-card-title ,[dir="rtl"] .header-bold16 , [dir="rtl"].v-stepper-header ,
 [dir="rtl"] .v-stepper-item , [dir="rtl"] .v-selection-control{
    flex-direction: row-reverse;
}
[dir="rtl"] label ,[dir="rtl"] .v-textarea textarea {
    text-align: end;
}
</style>