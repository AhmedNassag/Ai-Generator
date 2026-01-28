<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')" :subPage="$t('physicalcourse.requests')"
    :titlePage="$t('physicalcourse.Details')">

    <!-- Slot for rendering the survey details -->
    <template #datatable>
      <div v-if="isLoading" class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p class="mt-2">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="SurveyData" class="survey-container">
        <!-- Survey Header -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <div class="row align-items-center">
              <div class="col">
                <h4 class="mb-0">
                  <i class="fas fa-poll me-2"></i>
                  {{ SurveyData.name }}
                </h4>
              </div>
              <div class="col-auto">
                <span class="badge" :class="getStatusBadgeClass(SurveyData.status)">
                  {{ SurveyData.status }}
                </span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="mt-3" v-if="SurveyData.description" v-html="SurveyData.description"></div>
          </div>
        </div>

        <!-- Survey Form or Results -->
        <div class="row">
          <div class="col-lg-12">
            <!-- Survey Questions Form -->
            <div class="card" v-if="!hasCompletedSurvey">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="fas fa-question-circle me-2"></i>
                  {{ $t('survey.answer_questions') }}
                </h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="submitSurvey" ref="surveyForm">
                  <div v-for="(question, index) in SurveyData.questions" :key="question.id"
                    class="question-container mb-4 p-3 border rounded">

                    <h6 class="question-title mb-3">
                      {{ index + 1 }}. {{ question.question }}
                      <span v-if="isQuestionRequired(question)" class="text-danger">*</span>
                    </h6>

                    <!-- Single Choice (Radio Buttons) -->
                    <div v-if="question.type === 'single'" class="">
                      <div v-for="(option, optionIndex) in question.options" :key="optionIndex"
                        class="option radio-option">
                        <div class="custom-radio">
                          <input type="radio" :id="`question-${index}-option-${optionIndex}`"
                            :name="`question-${index}`" :value="option"
                            v-model="answers[index].answer" />
                          <label :for="`question-${index}-option-${optionIndex}`">
                            <span class="radio-circle"></span>
                            <span class="option-text">{{ option.text }}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- Multiple Choice (Checkboxes) -->
                    <div v-if="question.type === 'multi'" class="">
                      <div v-for="(option, optionIndex) in question.options" :key="optionIndex"
                        class="option checkbox-option">
                        <div class="custom-checkbox">
                          <input type="checkbox" :id="`question-${index}-option-${optionIndex}`"
                            :name="`question-${index}`" :value="option"
                            v-model="answers[index].answer" />
                          <label :for="`question-${index}-option-${optionIndex}`">
                            <span class="checkbox-box"></span>
                            <span class="option-text">{{ option.text }}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- Text Input -->
                    <div v-if="question.type === 'text'" class="options text-input-container">
                      <input type="text" v-model="answers[index].answer" placeholder="Your answer"
                        class="text-input" />
                      <div class="focus-border"></div>
                    </div>

                  </div>

                  <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                      <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-2"></i>
                      <i v-else class="fas fa-paper-plane me-2"></i>
                      {{ isSubmitting ? $t('common.submitting') : $t('survey.submit_survey') }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Survey Already Completed Message -->
            <div class="card" v-else-if="hasCompletedSurvey">
              <div class="card-body text-center py-5">
                <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                <h5 class="text-success">{{ $t('survey.already_completed') }}</h5>
                <p class="text-muted">{{ $t('survey.thank_you_message') }}</p>
              </div>
            </div>

            <!-- Survey Not Available -->
            <div class="card" v-else>
              <div class="card-body text-center py-5">
                <i class="fas fa-lock text-warning fa-3x mb-3"></i>
                <h5 class="text-warning">{{ $t('survey.not_available') }}</h5>
                <p class="text-muted">{{ $t('survey.not_available_message') }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import PhysicalCourseRequests from "@/API/PhysicalCourseRequest/PhysicalCourseRequest";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import vSelect from "vue-select";
import PhysicalCourse from "@/API/PhysicalCourse/PhysicalCourse";
import Auth from "@/API/Auth";
import Survey from "@/API/Survey/Survey";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    vSelect,
  },

  setup() {
    const api = new PhysicalCourseRequests();
    const courseApi = new PhysicalCourse();
    const surveyApi = new Survey();

    return {
      api,
      courseApi,
      surveyApi
    };
  },

  async mounted() {
    await this.loadSurveyData();
  },

  computed: {
    hasCompletedSurvey() {
      if (!this.SurveyData.survey_responses) return false;
      return this.SurveyData.survey_responses.some(response =>
        response.user_id === Auth.USER.id && response.status === 'submitted'
      );
    },
  },

  data() {
    return {
      isFlipped: false,
      courseId: null,
      isLoading: false,
      SurveyData: null,
      attendances: {},
      survey: null,
      answers: [], 
      isSubmitting: false,
    };
  },

  created() {
  },

  methods: {
    async loadSurveyData() {
      try {
        this.isLoading = true;
        const response = await this.surveyApi.show(this.$route.params.surveyId, {
          with: ['questions', 'surveyResponses']
        });

        this.SurveyData = response;

        this.answers = response.questions.map((question) => ({
          question_id: question.id,
          answer: question.type === "multi" ? [] : "",
        }));

        await this.loadExistingResponses();

      } catch (error) {
        console.error('Error loading survey data:', error);
        this.api.poup({ status: false, message: error.message }, this.$t('common.error_loading_data'));
      } finally {
        this.isLoading = false;
      }
    },

    async loadExistingResponses() {
      if (!this.SurveyData.survey_responses) return;

      // Find user's existing response (draft or submitted)
      const existingResponse = this.SurveyData.survey_responses.find(response =>
        response.user_id === Auth.USER.id && response.respondent_id === this.$route.query.id
      );

      if (existingResponse && existingResponse.answers) {
        // Parse the answers if they're stored as JSON string
        const parsedAnswers = typeof existingResponse.answers === "string" 
          ? JSON.parse(existingResponse.answers) 
          : existingResponse.answers;

        // Map the existing answers to the current answers array
        this.answers = this.answers.map((answer) => {
          const existingAnswer = parsedAnswers.find(
            (existing) => existing.question_id === answer.question_id
          );

          if (existingAnswer) {
            return { ...answer, answer: existingAnswer.answer };
          }
          return answer;
        });
      }
    },

    async submitSurvey() {
      try {
        this.isSubmitting = true;

        // Validate required questions
        if (!this.validateSurvey()) {
          this.api.poup({ status: false, message: 'Validation failed' }, this.$t('survey.please_answer_required_questions'));
          return;
        }

        // Format answers for API submission
        const formattedAnswers = this.answers.map((answer) => ({
          question_id: answer.question_id,
          answer: answer.answer,
        }));

        const surveyResponse = {
          answers: formattedAnswers,
        };

        // Submit to API
        const response = await this.courseApi.submitSurveyResponse(
          this.SurveyData.id, 
          this.$route.query.type, 
          this.$route.query.id, 
          surveyResponse
        );
        
        if (response.success == 'true') {
          this.api.poup(response, this.$t('survey.submitted_successfully'));
        }
        
        // Reload survey data to reflect the new response
        await this.loadSurveyData();

      } catch (error) {
        console.error('Error submitting survey:', error);
        this.api.poup({ status: false, message: error.message }, this.$t('survey.submission_error'));
      } finally {
        this.isSubmitting = false;
      }
    },

    validateSurvey() {
      // Check if survey has required questions configuration
      if (!this.SurveyData.required_questions || this.SurveyData.required_questions.type !== 'all_questions_required') {
        return true; // If not all questions required, assume valid
      }

      // Count completed questions
      const completedQuestions = this.answers.filter((answer) => {
        if (Array.isArray(answer.answer)) {
          return answer.answer.length > 0;
        }
        return answer.answer !== "";
      }).length;

      // All questions are required
      return completedQuestions === this.SurveyData.questions.length;
    },

    isQuestionRequired(question) {
      return this.SurveyData.required_questions && this.SurveyData.required_questions.type === 'all_questions_required';
    },

    getStatusBadgeClass(status) {
      const classes = {
        'Approved': 'bg-success',
        'Pending': 'bg-warning',
        'Rejected': 'bg-danger',
        'Draft': 'bg-secondary'
      };
      return classes[status] || 'bg-secondary';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },

  // Watch for route changes
  watch: {
    '$route.params.surveyId': {
      handler(newSurveyId) {
        if (newSurveyId) {
          this.loadSurveyData();
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.survey-container {
  max-width: 100%;
}

.question-container {
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.question-container:hover {
  background-color: #e9ecef;
}

.question-title {
  color: #495057;
  font-weight: 600;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.badge {
  font-size: 0.75em;
}

/* Custom Radio Buttons */
.custom-radio input[type="radio"] {
  display: none;
}

.custom-radio label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 8px;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ddd;
  position: relative;
  margin-right: 12px;
  transition: all 0.2s ease;
}

.radio-circle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #007bff;
  transition: transform 0.2s ease;
}

.custom-radio input[type="radio"]:checked + label .radio-circle {
  border-color: #007bff;
}

.custom-radio input[type="radio"]:checked + label .radio-circle::after {
  transform: translate(-50%, -50%) scale(1);
}

/* Custom Checkboxes */
.custom-checkbox input[type="checkbox"] {
  display: none;
}

.custom-checkbox label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 8px;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  margin-right: 12px;
  transition: all 0.2s ease;
}

.checkbox-box::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 6px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transition: transform 0.2s ease;
}

.custom-checkbox input[type="checkbox"]:checked + label .checkbox-box {
  background-color: #007bff;
  border-color: #007bff;
}

.custom-checkbox input[type="checkbox"]:checked + label .checkbox-box::after {
  transform: rotate(45deg) scale(1);
}

.option-text {
  color: #495057;
  font-size: 1rem;
}

/* Text Input */
.text-input-container {
  position: relative;
  margin-top: 8px;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  color: #495057;
  transition: all 0.3s;
  background-color: #fff;
}

.text-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.text-input::placeholder {
  color: #6c757d;
}

@media (max-width: 768px) {
  .survey-container {
    padding: 0 0.5rem;
  }
}
</style>