<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')"
    :subPage="$t('physicalcourse.survey')"
    :titlePage="$t('physicalcourse.surveyDetails')"
  >
    <div v-permission:show v-permission:update v-permission:delete></div>

    <!-- Survey Response Details Section -->
    <template #datatable>
      <div v-if="surveyResponseData" class="survey-response-container">
        <!-- Survey Information Card -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              {{ $t("survey.surveyInformation") }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <p>
                  <strong>{{ $t("survey.surveyName") }}:</strong>
                  {{ surveyResponseData.survey?.name }}
                </p>
                <p>
                  <strong>{{ $t("survey.status") }}:</strong>
                  <span
                    :class="getStatusClass(surveyResponseData.survey?.status)"
                  >
                    {{ surveyResponseData.survey?.status }}
                  </span>
                </p>
                <p>
                  <strong>{{ $t("survey.reviewFrequency") }}:</strong>
                  {{ surveyResponseData.survey?.review_frequency }}
                  {{ $t("survey.days") }}
                </p>
              </div>
              <div class="col-md-6">
                <p>
                  <strong>{{ $t("survey.createdAt") }}:</strong>
                  {{ formatDate(surveyResponseData.survey?.created_at) }}
                </p>
                <p>
                  <strong>{{ $t("survey.updatedAt") }}:</strong>
                  {{ formatDate(surveyResponseData.survey?.updated_at) }}
                </p>
                <div
                  v-if="surveyResponseData.survey?.description"
                  v-html="surveyResponseData.survey.description"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Information Card -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              {{ $t("survey.respondentInformation") }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <p>
                  <strong>{{ $t("user.fullName") }}:</strong>
                  {{ surveyResponseData.user?.full_name }}
                </p>
                <p>
                  <strong>{{ $t("user.email") }}:</strong>
                  {{ surveyResponseData.user?.email }}
                </p>
                <p>
                  <strong>{{ $t("user.username") }}:</strong>
                  {{ surveyResponseData.user?.username }}
                </p>
                <p>
                  <strong>{{ $t("user.phone") }}:</strong>
                  {{ surveyResponseData.user?.phone }}
                </p>
              </div>
              <div class="col-md-6">
                <p>
                  <strong>{{ $t("user.type") }}:</strong>
                  {{ surveyResponseData.user?.type }}
                </p>
                <p>
                  <strong>{{ $t("user.status") }}:</strong>
                  <span
                    :class="getUserStatusClass(surveyResponseData.user?.status)"
                  >
                    {{
                      surveyResponseData.user?.status === "true"
                        ? $t("user.active")
                        : $t("user.inactive")
                    }}
                  </span>
                </p>
                <p>
                  <strong>{{ $t("survey.responseDate") }}:</strong>
                  {{ formatDate(surveyResponseData.created_at) }}
                </p>
                <p>
                  <strong>{{ $t("survey.completionStatus") }}:</strong>
                  <span
                    :class="
                      getCompletionStatusClass(surveyResponseData.is_completed)
                    "
                  >
                    {{
                      surveyResponseData.is_completed
                        ? $t("survey.completed")
                        : $t("survey.incomplete")
                    }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions and Answers Card -->
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              {{ $t("survey.questionsAndAnswers") }}
            </h5>
          </div>
          <div class="card-body">
            <div
              v-if="
                surveyResponseData.survey?.questions &&
                surveyResponseData.survey.questions.length > 0
              "
            >
              <!-- Loop through each question -->
              <div
                v-for="(question, index) in surveyResponseData.survey.questions"
                :key="question.id"
                class="question-container mb-4"
              >
                <div class="question-card">
                  <div class="question-header">
                    <h6 class="question-number">
                      {{ $t("survey.question") }} {{ index + 1 }}
                    </h6>
                    <span
                      class="question-type badge"
                      :class="getQuestionTypeClass(question.type)"
                    >
                      {{ getQuestionTypeLabel(question.type) }}
                    </span>
                  </div>

                  <div class="question-text">
                    <p class="mb-3">
                      <strong>{{ question.question }}</strong>
                    </p>
                  </div>

                  <!-- Display Options for single/multiple choice questions -->
                  <div
                    v-if="question.options && question.options.length > 0"
                    class="question-options mb-3"
                  >
                    <h6 class="options-title">
                      {{ $t("survey.availableOptions") }}:
                    </h6>
                    <ul class="list-unstyled">
                      <li
                        v-for="(option, optionIndex) in question.options"
                        :key="optionIndex"
                        class="option-item"
                        :class="{
                          'selected-option': isOptionSelected(
                            question.id,
                            option.text
                          ),
                        }"
                      >
                        <i
                          :class="
                            isOptionSelected(question.id, option.text)
                              ? 'fas fa-check-circle text-success'
                              : 'far fa-circle text-muted'
                          "
                          class="me-2"
                        ></i>
                        {{ option.text }}
                      </li>
                    </ul>
                  </div>

                  <!-- Display User's Answer -->
                  <div class="user-answer">
                    <h6 class="answer-title">{{ $t("survey.userAnswer") }}:</h6>
                    <div class="answer-content">
                      <template v-if="getUserAnswer(question.id)">
                        <div class="answer-box">
                          <i class="fas fa-user-check text-primary me-2"></i>
                          <span class="answer-text">{{
                            getUserAnswer(question.id)
                          }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="no-answer">
                          <i class="fas fa-times-circle text-warning me-2"></i>
                          <span class="text-muted">{{
                            $t("survey.noAnswer")
                          }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Divider between questions (except for the last one) -->
                <hr
                  v-if="index < surveyResponseData.survey.questions.length - 1"
                  class="question-divider"
                />
              </div>
            </div>
            <div v-else class="no-questions">
              <div class="text-center text-muted py-4">
                <i class="fas fa-question-circle fa-3x mb-3"></i>
                <p>{{ $t("survey.noQuestions") }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">{{ $t("common.loading") }}</span>
        </div>
        <p class="mt-2 text-muted">{{ $t("survey.loadingResponse") }}</p>
      </div>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import physicalcourse from "@/API/PhysicalCourse/PhysicalCourse";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import CertifiateTemplete from "@/API/CertifiateTemplete/CertifiateTemplete";
import Survey from "@/API/Survey/Survey";
import SurveyResponse from "@/API/SurveyResponse/SurveyResponse";

export default {
  components: {
    MainPage,
    DataTable,
  },

  setup() {
    const api = new SurveyResponse();
    const physicalcourseApi = new physicalcourse();
    const userApi = new User();
    const certificateApi = new CertifiateTemplete();
    const surveyApi = new Survey();

    const apiParams = {};
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      physicalcourseApi,
      tableColumns,
      fromFields,
      userApi,
      certificateApi,
      surveyApi,
    };
  },

  async mounted() {
    await this.loadSurveyData();
  },

  computed: {
    hideActions() {
      return (row) => {
        return {
          edit: true,
          delete: true,
        };
      };
    },
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      usersData: [],
      certificatesData: [],
      surveyResponseData: null,
      usersList: [],
    };
  },

  created() {},

  methods: {
    getUserFullName(userId) {
      const user = this.users.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },
    getUserEmail(userId) {
      const user = this.users.find((user) => user.id === userId);
      return user ? user.email : "";
    },
    async loadSurveyData() {
      try {
        const usersResponse = await this.api.show(this.$route.params.surveyId, {
          with: ["survey.questions", "user"],
        });
        this.surveyResponseData = usersResponse;
        this.surveyResponseData.user = this.userApi.show(
          this.surveyResponseData.user_id
        );
        console.log("Survey Response Data:", this.surveyResponseData);
      } catch (error) {
        console.error(this.$t("user.FailedLoadData"), error);
      }
    },

    getUserAnswer(questionId) {
      if (!this.surveyResponseData?.answers) return null;

      const answer = this.surveyResponseData.answers.find(
        (ans) => ans.question_id === questionId
      );
      return answer?.answer?.text || null;
    },

    isOptionSelected(questionId, optionText) {
      const userAnswer = this.getUserAnswer(questionId);
      return userAnswer === optionText;
    },

    getQuestionTypeClass(type) {
      const typeClasses = {
        single: "badge-primary",
        multiple: "badge-success",
        text: "badge-info",
        textarea: "badge-warning",
      };
      return typeClasses[type] || "badge-secondary";
    },

    getQuestionTypeLabel(type) {
      const typeLabels = {
        single: this.$t("survey.singleChoice"),
        multiple: this.$t("survey.multipleChoice"),
        text: this.$t("survey.textInput"),
        textarea: this.$t("survey.textArea"),
      };
      return typeLabels[type] || type;
    },
    // Get CSS class for survey status
    getStatusClass(status) {
      return status === "Draft" ? "badge bg-warning" : "badge bg-success";
    },

    getUserStatusClass(status) {
      return status === "true" ? "badge bg-success" : "badge bg-danger";
    },

    getCompletionStatusClass(isCompleted) {
      return isCompleted ? "badge bg-success" : "badge bg-warning";
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString();
    },

    truncateUserAgent(userAgent) {
      if (!userAgent) return "-";
      return userAgent.length > 50
        ? userAgent.substring(0, 50) + "..."
        : userAgent;
    },

    getSurveyData(surveyresponse) {
      this.$router.push({
        name: "PhysicalCourseSurveyData",
        params: { surveyId: surveyresponse.id },
      });
    },
  },

  // Watch for route changes
  watch: {
    "$route.params.surveyId": {
      handler(newsurveyId) {
        if (newsurveyId) {
          this.loadSurveyData();
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.survey-response-container {
  max-width: 100%;
}

.card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
}

.card-title {
  color: #495057;
  font-weight: 600;
}

.question-container {
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  padding: 1.5rem;
  background-color: #fdfdfe;
}

.question-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-number {
  color: #495057;
  margin: 0;
  font-weight: 600;
}

.question-type {
  font-size: 0.75rem;
  margin-left: auto;
}

.question-text {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  border-left: 4px solid #007bff;
}

.option-item {
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.15s ease-in-out;
}

.option-item:hover {
  background-color: #f8f9fa;
}

.selected-option {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  font-weight: 600;
}

.options-title,
.answer-title {
  color: #495057;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.answer-box {
  background-color: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.answer-text {
  color: #004085;
  font-weight: 500;
}

.no-answer {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.question-divider {
  border-color: #dee2e6;
  margin: 2rem 0;
}

.no-questions {
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

code {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #e83e8c;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

@media (max-width: 768px) {
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .question-container {
    padding: 1rem;
  }
}
</style>
