<template>
  <div class="survey-container">
    <!-- Email Modal -->
    <div v-if="showEmailModal" class="email-modal">
      <div class="modal-content">
        <h4>{{ $t("surveyAnswer.pleaseenteryouremail") }}</h4>
        <input
          type="email"
          v-model="userEmail"
          placeholder="Enter your email"
          class="email-input"
        />
        <button @click="checkEmail" class="submit-button">
          {{ $t("surveyAnswer.submit") }}
        </button>
        <p v-if="emailError" class="error-message">{{ emailError }}</p>
      </div>
    </div>

    <!-- Survey Content -->
    <div v-else>
      <!-- Existing Survey Code -->
      <div class="survey-header">
        <h1>{{ surveyName }}</h1>
        <div class="survey-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${(completedQuestions / questions.length) * 100}%`,
              }"
            ></div>
          </div>
          <span class="progress-text"
            >{{ completedQuestions }}/{{ questions.length }}
            {{ $t("surveyAnswer.completed") }}</span
          >
        </div>
      </div>

      <!-- Display Questions -->
      <transition-group name="fade" tag="div" class="questions-list">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-card"
        >
          <span class="question-number">{{ index + 1 }}</span>
          <h3>{{ question.question }}</h3>

          <!-- Single Choice (Radio Buttons) -->
          <div v-if="question.type === 'single'" class="">
            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="option radio-option"
            >
              <div class="custom-radio">
                <input
                  type="radio"
                  :id="`question-${index}-option-${optionIndex}`"
                  :name="`question-${index}`"
                  :value="option"
                  v-model="answers[index].answer"
                />
                <label :for="`question-${index}-option-${optionIndex}`">
                  <span class="radio-circle"></span>
                  <span class="option-text">{{ option.text }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Multiple Choice (Checkboxes) -->
          <div v-if="question.type === 'multi'" class="">
            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="option checkbox-option"
            >
              <div class="custom-checkbox">
                <input
                  type="checkbox"
                  :id="`question-${index}-option-${optionIndex}`"
                  :name="`question-${index}`"
                  :value="option"
                  v-model="answers[index].answer"
                />
                <label :for="`question-${index}-option-${optionIndex}`">
                  <span class="checkbox-box"></span>
                  <span class="option-text">{{ option.text }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Text Input -->
          <div
            v-if="question.type === 'text'"
            class="options text-input-container"
          >
            <input
              type="text"
              v-model="answers[index].answer"
              placeholder="Your answer"
              class="text-input"
            />
            <div class="focus-border"></div>
          </div>
        </div>
      </transition-group>

      <!-- Submit and Draft Buttons -->
      <div class="buttons-section">
        <button
          @click="saveDraft"
          class="draft-button"
          :disabled="noAnswers || isDraft"
        >
          <span>{{ $t("surveyAnswer.savedraft") }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="draft-icon"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            ></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
        <button
          @click="submitSurvey"
          class="submit-button"
          :disabled="!isSubmitEnabled || isSubmitting"
        >
          <span>{{ $t("surveyAnswer.submit") }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="submit-icon"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import surveyresponse from "@/API/SurveyResponse/SurveyResponse";
import survey from "@/API/Survey/Survey";
import user from "@/API/User/User";
import questionApi from "@/API/SurveyQuestion/SurveyQuestion";
import MainPage from "@/components/MainPage.vue";
import { useRouter } from "vue-router";
import { notify } from "@kyvg/vue3-notification";

export default {
  components: {
    MainPage,
  },

  setup() {
    const api = new surveyresponse();
    const surveyApi = new survey();
    const userApi = new user();
    const question = new questionApi();
    const router = useRouter();
    const surveyId = router.currentRoute.value.params.id;

    return {
      api,
      surveyApi,
      userApi,
      question,
      surveyId,
    };
  },

  data() {
    return {
      surveyName: "", // Store survey name
      questions: [], // Array to store survey questions
      answers: [], // Array to store user answers
      showEmailModal: true, // Control the visibility of the email modal
      userEmail: "", // Store the user's email
      emailError: "", // Store any error messages related to the email
      surveyStatus: null, // To track if the user has submitted or has a draft
      isSubmitted: false, // Flag to track if survey has been submitted
      isSubmitting: false,
      isDraft: false,
      grc_user: false,
      requiredQuestionsConfig: null, // Store survey's required questions configuration
    };
  },

  computed: {
    completedQuestions() {
      return this.answers.filter((answer) => {
        if (Array.isArray(answer.answer)) {
          return answer.answer.length > 0;
        }
        return answer.answer !== "";
      }).length;
    },

    isSubmitEnabled() {
      // If no required questions config, default to all questions required
      if (!this.requiredQuestionsConfig) {
        return this.completedQuestions === this.questions.length;
      }

      // If type is "all_questions_required"
      if (this.requiredQuestionsConfig.type === "all_questions_required") {
        return this.completedQuestions === this.questions.length;
      }

      // If type is "percentage"
      if (this.requiredQuestionsConfig.type === "percentage") {
        const percentageRequired =
          this.requiredQuestionsConfig.percentage || 80;
        const completionPercentage =
          (this.completedQuestions / this.questions.length) * 100;
        return completionPercentage >= percentageRequired;
      }

      // Fallback to requiring all questions
      return this.completedQuestions === this.questions.length;
    },

    noAnswers() {
      return this.completedQuestions === 0;
    },
  },

  async mounted() {
    // Don't fetch the survey until the email is validated
  },

  methods: {
    async checkEmail() {
      if (!this.userEmail) {
        this.emailError = "Please enter a valid email address.";
        return;
      }

      // Regular expression to validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(this.userEmail)) {
        this.emailError = "Please enter a valid email address.";
        return;
      }

      // const SurveyResponse = await this.surveyApi.checkEmail(this.userEmail);
      const SurveyResponse = await this.userApi.getAll({filter: `email|${this.userEmail}|=`});

      if (SurveyResponse != "") {
        this.grc_user = true;
      } else {
        this.$notify({
          type: "error",
          text: "You are not a cyber mode user",
        });
        return;
      }

      try {
        // Check if user has already submitted this survey
        const submittedResponse = await this.api.checkStatus(
          this.$route.params.id,
          this.userEmail
        );
        console.log("submittedddddddd", submittedResponse);

        if (submittedResponse.status == "submitted") {
          this.emailError = this.$t(
            "surveyAnswer.you_have_already_submitted_this_survey"
          );
          return;
        }
        this.showEmailModal = false;
        await this.getSurvey();

        // Check if user has a draft
        if (submittedResponse.status === "draft") {
          this.surveyStatus = "draft";
          await this.loadDraft(submittedResponse.answers);
          this.$notify({
            type: "success",
            text: "Your draft has been loaded. You can continue where you left off.",
          });
        }

        // User is valid, proceed with checking for drafts
        // const response = await this.surveyApi.checkEmail(this.userEmail);
      const response = await this.userApi.getAll({filter: `email|${this.userEmail}|=`});

        if (response != "") {
          this.grc_user = true;
        }
      } catch (error) {
        console.error("Error checking email:", error);
        // this.emailError = "An error occurred. Please try again.";
      }
    },

    async getSurvey() {
      // Fetch survey details
      const surveyDetails = await this.surveyApi.show(this.$route.params.id);
      this.surveyName = surveyDetails.name;
      this.requiredQuestionsConfig = surveyDetails.required_questions;

      // Fetch survey questions
      const questions = await this.question.getAll({
        filterIn: `survey_id|${this.$route.params.id}`,
      });
      this.questions = questions;
      console.log("this questions", this.questions);

      // Initialize answers array
      this.answers = this.questions.map((question) => ({
        question_id: question.id,
        answer: question.type === "multi" ? [] : "",
      }));
    },

    async loadDraft(draftAnswers) {
      // Parse the answers if they're stored as JSON string
      const parsedAnswers =
        typeof draftAnswers === "string"
          ? JSON.parse(draftAnswers)
          : draftAnswers;

      // Map the draft answers to the current answers array
      this.answers = this.answers.map((answer) => {
        const draftAnswer = parsedAnswers.find(
          (draft) => draft.question_id === answer.question_id
        );

        if (draftAnswer) {
          return { ...answer, answer: draftAnswer.answer };
        }
        return answer;
      });
    },

    async saveDraft() {
      try {
        this.isDraft = true;
        // Prepare the response data
        let existingResponse = await this.api.getAll({
          filter: `survey_id|${this.$route.params.id}|=&&user_email|${this.userEmail}|=`,
        });
        let responseData = {};
        if (existingResponse.length != 0) {
          responseData = {
            id: existingResponse[0].id,
            survey_id: this.$route.params.id,
            user_email: this.userEmail,
            answers: this.answers.map((answer) => ({
              question_id: answer.question_id,
              answer: answer.answer,
            })),
            status: "draft",
            grc_user: this.grc_user,
          };
        } else {
          responseData = {
            survey_id: this.$route.params.id,
            user_email: this.userEmail,
            answers: this.answers.map((answer) => ({
              question_id: answer.question_id,
              answer: answer.answer,
            })),
            status: "draft",
            grc_user: this.grc_user,
          };
        }
        await this.api.from(responseData);

        this.$notify({
          type: "success",
          text: "Your progress has been saved as a draft.",
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Error saving draft:", error);
        this.showNotification(
          "Failed to save draft. Please try again.",
          "error"
        );
        this.isDraft = false;
      }
    },

    async submitSurvey() {
      try {
        this.isSubmitting = true; // Disable the button immediately
        // Additional validation based on required questions configuration
        if (!this.isSubmitEnabled) {
          let errorMessage = "Please answer the required number of questions.";

          if (this.requiredQuestionsConfig?.type === "percentage") {
            const percentageRequired =
              this.requiredQuestionsConfig.percentage || 80;
            errorMessage = `Please complete at least ${percentageRequired}% of the survey.`;
          }

          this.showNotification(errorMessage, "warning");
          this.isSubmitting = false;
          return;
        }

        // Check if user has already submitted this survey
        const submittedResponse = await this.api.checkStatus(
          this.$route.params.id,
          this.userEmail
        );

        if (submittedResponse) {
          // Prepare the response data
          const responseData = {
            id: submittedResponse.id,
            survey_id: this.$route.params.id,
            user_email: this.userEmail,
            answers: this.answers.map((answer) => ({
              question_id: answer.question_id,
              answer: answer.answer,
            })),
            status: "submitted",
            grc_user: this.grc_user,
          };
          await this.api.from(responseData);
        } else {
          // Prepare the response data
          const responseData = {
            survey_id: this.$route.params.id,
            user_email: this.userEmail,
            answers: this.answers.map((answer) => ({
              question_id: answer.question_id,
              answer: answer.answer,
            })),
            status: "submitted",
            grc_user: this.grc_user,
          };
          await this.api.from(responseData);
        }

        this.isSubmitted = true;

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Error submitting survey:", error);
        this.showNotification(
          "Failed to submit survey. Please try again.",
          "error"
        );
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.email-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.email-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: red;
  margin-top: 10px;
}

/* Existing styles */
.survey-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.survey-header {
  margin-bottom: 40px;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  color: #2d3748;
  font-weight: 700;
  font-size: 1.2rem;
}

.survey-progress {
  margin-top: 20px;
}

.progress-bar {
  height: 8px;
  background-color: #edf2f7;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #44225c, #44225c);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  text-align: right;
  font-size: 0.875rem;
  color: #718096;
}

.questions-list {
  position: relative;
}

.question-card {
  background-color: #fff;
  padding: 30px;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.question-card:hover {
  transform: translateY(-2px);
}

.question-number {
  position: absolute;
  top: -10px;
  left: -10px;
  background: linear-gradient(135deg, #44225c, #44225c);
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
}

.question-card h3 {
  margin-bottom: 20px;
  color: #2d3748;
  font-weight: 600;
  font-size: 1.125rem;
}

/* Radio buttons */
.custom-radio input[type="radio"] {
  display: none;
}

.custom-radio label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-circle {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: none; /* Remove the border */
  position: relative;
  margin-right: 12px;
  transition: all 0.2s ease;
  background-color: #e2e8f0; /* Add a background color to replace the border */
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
  background-color: #44225c;
  transition: transform 0.2s ease;
}

.custom-radio input[type="radio"]:checked + label .radio-circle {
  background-color: #44225c; /* Change background color when checked */
}

.custom-radio input[type="radio"]:checked + label .radio-circle::after {
  transform: translate(-50%, -50%) scale(1);
  background-color: white; /* Ensure the inner circle is visible */
}

/* Checkboxes */
.checkbox-box {
  width: 15px;
  height: 15px;
  border: none; /* Remove the border */
  border-radius: 4px;
  position: relative;
  margin-right: 12px;
  transition: all 0.2s ease;
  background-color: #e2e8f0; /* Add a background color to replace the border */
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
.custom-checkbox input[type="checkbox"] {
  display: none;
}

.custom-checkbox input[type="checkbox"]:checked + label .checkbox-box {
  background-color: #44225c;
  border-color: #44225c;
}

.custom-checkbox input[type="checkbox"]:checked + label .checkbox-box::after {
  transform: rotate(45deg) scale(1);
}

.option-text {
  color: #4a5568;
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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #2d3748;
  transition: all 0.3s;
  background-color: #f8fafc;
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  background-color: #fff;
}

.text-input::placeholder {
  color: #a0aec0;
}

/* Buttons Section */
.buttons-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.submit-button,
.draft-button {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button {
  background-color: #44225c;
  color: #fff;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.draft-button {
  background-color: #f8fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.submit-button:hover {
  background-color: #44225c;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.draft-button:hover {
  background-color: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled,
.draft-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
  color: #fff;
}

.draft-button:disabled {
  background-color: #e2e8f0;
  color: #a0aec0;
  border-color: #e2e8f0;
}

.submit-icon,
.draft-icon {
  transition: transform 0.3s ease;
}

.submit-button:hover .submit-icon,
.draft-button:hover .draft-icon {
  transform: translateX(4px);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .survey-container {
    padding: 20px;
    margin: 20px;
  }

  .question-card {
    padding: 20px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .buttons-section {
    flex-direction: column;
    gap: 12px;
  }

  .submit-button,
  .draft-button {
    width: 100%;
  }
}
</style>
