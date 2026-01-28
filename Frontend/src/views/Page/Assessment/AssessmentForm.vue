<template>
  <div class="google-form-container full-width-form">
    <!-- Form Header -->
    <div class="form-header enhanced-header">
      <h1>{{ $t('assessment.assessment') }}</h1>
      <p class="form-description">Please complete all required fields marked with an asterisk (*)</p>
    </div>
    <div v-if="questionList && questionList.length" class="questions-section enhanced-questions">
      <form @submit.prevent="submitAnswers">
        <div v-for="(question, idx) in questionList" :key="question.id" class="question-item enhanced-question-item">
          <label :for="'question-' + question.id" class="question-label">
            <span v-html="question.question"></span>
            <span v-if="fromFields.find(f => f.name === 'required_questions')?.rules === 'required'" class="required-asterisk">*</span>
          </label>
          <!-- Type 1: Text input -->
          <input
            v-if="question.type === 3"
            :id="'question-' + question.id"
            v-model="newItem.answers[question.id]"
            type="text"
            class="form-control enhanced-input wide-input"
            :placeholder="$t('assessment.enter_answer')"
          />
          <!-- Type 2: Multiselect (checkboxes) -->
          <div v-else-if="question.type === 2" class="multi-select-group choices-grid">
            <div v-for="answer in question.answers" :key="answer.id" class="choice-card" :class="{ 'selected': Array.isArray(newItem.answers[question.id]) && newItem.answers[question.id].includes(answer.id) }" @click="toggleCheckbox(question.id, answer.id)">
              <input
                class="form-check-input enhanced-checkbox visually-hidden"
                type="checkbox"
                :id="'answer-' + question.id + '-' + answer.id"
                :value="answer.id"
                :checked="Array.isArray(newItem.answers[question.id]) && newItem.answers[question.id].includes(answer.id)"
                @change="toggleCheckbox(question.id, answer.id)"
              />
              <label class="choice-label" :for="'answer-' + question.id + '-' + answer.id">
                <span class="choice-custom">
                  <span class="checkmark" v-if="Array.isArray(newItem.answers[question.id]) && newItem.answers[question.id].includes(answer.id)">&#10003;</span>
                </span>
                <span class="choice-text">{{ answer.text }}</span>
              </label>
            </div>
          </div>
          <!-- Type 3: Radio buttons -->
          <div v-else-if="question.type === 1" class="radio-group choices-grid">
            <div v-for="answer in question.answers" :key="answer.id" class="choice-card" :class="{ 'selected': newItem.answers[question.id] === answer.id }" @click="selectRadio(question.id, answer.id)">
              <input
                class="form-check-input enhanced-radio visually-hidden"
                type="radio"
                :id="'answer-' + question.id + '-' + answer.id"
                :value="answer.id"
                :checked="newItem.answers[question.id] === answer.id"
                @change="selectRadio(question.id, answer.id)"
              />
              <label class="choice-label" :for="'answer-' + question.id + '-' + answer.id">
                <span class="choice-custom">
                  <span class="radio-dot" v-if="newItem.answers[question.id] === answer.id"></span>
                </span>
                <span class="choice-text">{{ answer.text }}</span>
              </label>
            </div>
          </div>
          <!-- Fallback: text input if type is unknown -->
          <input
            v-else
            :id="'question-' + question.id"
            v-model="newItem.answers[question.id]"
            type="text"
            class="form-control enhanced-input wide-input"
            :placeholder="$t('assessment.enter_answer')"
          />
        </div>
        <div class="submit-btn-row">
          <button type="button" class="btn btn-secondary me-2" @click="saveDraft">
            <i class="fas fa-save"></i> {{ $t('assessment.save_draft') || 'Save Draft' }}
          </button>
          <button type="submit" class="submit-btn">
            <i class="fas fa-check"></i> {{ $t('assessment.submit') || 'Submit' }}
          </button>
        </div>
      </form>
    </div>
  </div>

</template>

<script>
// Importing necessary components and API modules
import { useRouter } from "vue-router";
import assessment from "@/API/Assessment/Assessment";
import assessmentResultsApi from "@/API/AssessmentsResults/AssessmentsResults";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Template from "@/API/AssessmentTemplate/AssessmentTemplate";
import userApi from "@/API/User/User";
import questionApi from "@/API/Question/Question";
import Auth from "@/API/Auth";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new assessment();
    const resultsApi = new assessmentResultsApi();
    const assessment_id = useRouter().currentRoute.value.params.id; // useRouter() is a Composition API function provided by Vue Router to access the router instance.
    const apiParams = {};
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const templateList = new Template();
    const question = new questionApi();

    // Return properties for setup to be used in the template
    return {
      api,
      resultsApi,
      assessment_id,
      apiParams,
      tableColumns,
      fromFields,
      templateList,
      question,
    };
  },

  async mounted() {
    // Get current user from Auth system
    try {
      // First try Auth.USER (populated after login)
      if (Auth.USER && Object.keys(Auth.USER).length > 0) {
        this.currentUserId = Auth.USER.id || Auth.USER._id;
        this.currentUserEmail = Auth.USER.email;
        console.log('Got user from Auth.USER:', Auth.USER);
      } 
      
      // Fallback: Try localStorage
      if (!this.currentUserId || !this.currentUserEmail) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.currentUserId = this.currentUserId || user.id || user._id;
        this.currentUserEmail = this.currentUserEmail || user.email;
        console.log('Got user from localStorage:', user);
      }
      
      // Last resort: Decode JWT token
      if (!this.currentUserId || !this.currentUserEmail) {
        const cookies = document.cookie.split(';');
        let token = null;
        
        // Try to get token from cookies
        for (const cookie of cookies) {
          if (cookie.trim().startsWith('api_token_part')) {
            const parts = [];
            let i = 0;
            while (true) {
              const part = document.cookie.split(';').find(c => c.trim().startsWith(`api_token_part${i}=`));
              if (!part) break;
              parts.push(part.split('=')[1]);
              i++;
            }
            token = parts.join('');
            break;
          }
        }
        
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.currentUserId = this.currentUserId || payload.sub;
            this.currentUserEmail = this.currentUserEmail || payload.email;
            console.log('Got user from JWT token:', payload);
          } catch (e) {
            console.error('Error decoding JWT:', e);
          }
        }
      }
      
      console.log('Final User ID:', this.currentUserId);
      console.log('Final User Email:', this.currentUserEmail);
      
      if (!this.currentUserId || !this.currentUserEmail) {
        console.error('User ID or Email not found. User must be logged in.');
        alert('Error: Unable to identify user. Please refresh the page or log in again.');
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }

    await this.fetchTemplates();
    await this.fetchQuestions();
    await this.loadExistingAnswers();
  },
  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {
        question: null,
        answers: {}, // Ensure answers is always defined
      },
      templates: [],
      templateId: "",
      assessmentData: null,
      users: [],
      userList: [],
      requiredQuestionsType: null,
      requiredPercentage: null,
      selectedQuestions: [],
      templateQuestions: [], // Will store questions from selected template
      questionList: [],
      currentUserId: null,
      currentUserEmail: null,
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        title: this.$t("assessment.email"),
        data: "email",
        defaultContent: "N/A",
      },
      {
        title: this.$t("assessment.name"),
        data: "name",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("Name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your full name.",
        col: 12, // Column size in the form layout
      },
      {
        name: "institutions",
        label: this.$t("Institutions"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide a description of the project.",
        col: 12,
      },
      {
        name: "template_id",
        label: this.$t("Template"),
        type: "options", // Dropdown/select field
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: "Select a template for the assessment.",
      },
      {
        type: "options", // Dropdown/select field
        name: "user_ids",
        label: this.$t("Users"),
        options: [],
        multiple: true,
        optionLabel: "full_name",
        col: 6,
        rules: "required", // Validation: required selection
        description: "Select users.",
      },
      {
        type: "hidden", // Dropdown/select field
        name: "question",
        label: this.$t(""),
        options: [],
        multiple: true,
        optionLabel: "question",
        col: 6,
        rules: "", // Validation: required selection
        description: "",
      },
      {
        name: "required_questions",
        label: this.$t("Question"),
        type: "radio", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your question.",
        col: 4,
      },
    ];
  },
  watch: {
    "newItem.template_id": function (newVal) {
      this.fetchQuestions(newVal);
    },
  },

  methods: {
    async fetchTemplates() {
      const assessment_id = this.$route.params.id;
      const response = await this.api.show(assessment_id);
      this.assessmentData = response;
      this.templateId = response.template_id;
    },

    async loadExistingAnswers() {
      // Load existing answers if user has already started this assessment
      if (!this.currentUserId || !this.assessment_id) return;
      
      try {
        const result = await this.resultsApi.getUserAssessmentResult(
          this.currentUserId, 
          this.assessment_id
        );
        
        if (result && result.data && result.data.answers) {
          // Convert array of answers back to object format
          const answersObj = {};
          result.data.answers.forEach(item => {
            answersObj[item.question_id] = item.answer;
          });
          this.newItem.answers = answersObj;
        }
      } catch (error) {
        console.log('No existing answers found or error loading:', error);
      }
    },

    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
    
    async fetchQuestions() {
      // Construct the filter parameter for API call
      const filterParam = `assessment_template_ids|${this.templateId}`;

      // Fetch questions based on the template ID
      this.questionList = await this.question.getAll({ filterIn: filterParam });

      // Update the form field options
      const questionField = this.fromFields.find(field => field.name === "question");
      questionField.options = this.questionList;
    },

    handleRequiredTypeChange() {
      // Reset other values when type changes
      if (this.requiredQuestionsType !== "percentage") {
        this.requiredPercentage = null;
      }
      if (this.requiredQuestionsType !== "specific") {
        this.selectedQuestions = [];
      }

      // Update the newItem object with the selection
      this.newItem.required_questions = {
        type: this.requiredQuestionsType,
        percentage: this.requiredPercentage,
        specificQuestions: this.selectedQuestions,
      };
    },

    validatePercentage() {
      if (this.requiredPercentage) {
        this.requiredPercentage = Math.min(
          100,
          Math.max(1, this.requiredPercentage)
        );
        this.handleRequiredTypeChange();
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },

    // Extend the editItem method to handle required questions data
    editItem(data) {
      this.newItem = data;
      if (data.required_questions) {
        this.requiredQuestionsType = data.required_questions.type;
        this.requiredPercentage = data.required_questions.percentage;
        this.selectedQuestions = data.required_questions.specificQuestions;
      }
      this.isFlipped = true;
    },

    async fetchUsers() {
      const response = await this.usersList.getAll({ select: "id|full_name" });
      console.log("Fetched users:", response); // Check the API response

      this.fromFields.find((field) => field.name === "user_ids").options =
        response;
    },
    toggleCheckbox(questionId, answerId) {
      // Vue 3 reactivity: use direct assignment
      if (!Array.isArray(this.newItem.answers[questionId])) {
        this.newItem.answers[questionId] = [];
      }
      const idx = this.newItem.answers[questionId].indexOf(answerId);
      if (idx > -1) {
        this.newItem.answers[questionId].splice(idx, 1);
      } else {
        this.newItem.answers[questionId].push(answerId);
      }
      // Force reactivity
      this.newItem.answers = { ...this.newItem.answers };
    },
    selectRadio(questionId, answerId) {
      // Vue 3 reactivity: use direct assignment
      this.newItem.answers[questionId] = answerId;
      this.newItem.answers = { ...this.newItem.answers };
    },
    async submitAnswers() {
      console.log('Submit button clicked');
      console.log('Current answers:', this.newItem.answers);
      console.log('User ID:', this.currentUserId);
      console.log('User Email:', this.currentUserEmail);
      
      // Validate user info
      if (!this.currentUserId) {
        alert('Error: User ID not found. Please log in again.');
        console.error('Missing user_id. Check localStorage or JWT token.');
        return;
      }
      
      if (!this.currentUserEmail) {
        alert('Error: User email not found. Please log in again.');
        console.error('Missing user_email. Check localStorage or JWT token.');
        return;
      }
      
      // Validate we have answers
      if (!this.newItem.answers || Object.keys(this.newItem.answers).length === 0) {
        alert('Please answer at least one question before submitting.');
        return;
      }

      // Prepare payload: array of { question_id, answer(s) }
      const answers = Object.entries(this.newItem.answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }));

      console.log('Formatted answers:', answers);

      const payload = {
        assessment_id: this.assessment_id,
        user_id: this.currentUserId,
        user_email: this.currentUserEmail,
        answers: answers,
        submit: true, // Mark as submitted (not just in-progress)
      };

      console.log('Payload:', payload);

      try {
        const response = await this.resultsApi.submitAnswers(payload);
        console.log('Submit response:', response);
        
        if (response && (response.status === 'success' || response.success)) {
          alert('Assessment submitted successfully!');
          // Navigate back or to results page
          window.location.href = '/assessments-results';
        } else {
          alert(response?.message || 'Submission completed');
        }
      } catch (e) {
        console.error('Submission error:', e);
        console.error('Error details:', e);
        alert('Failed to submit assessment. Check console for details.');
      }
    },

    async saveDraft() {
      console.log('Save draft clicked');
      
      if (!this.newItem.answers || Object.keys(this.newItem.answers).length === 0) {
        alert('Please answer at least one question before saving.');
        return;
      }

      // Save current answers as draft (in-progress)
      const answers = Object.entries(this.newItem.answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }));

      const payload = {
        assessment_id: this.assessment_id,
        user_id: this.currentUserId,
        user_email: this.currentUserEmail,
        answers: answers,
        submit: false, // Save as draft
      };

      try {
        const response = await this.resultsApi.submitAnswers(payload);
        console.log('Save draft response:', response);
        alert('Draft saved successfully!');
      } catch (e) {
        console.error('Save draft error:', e);
        alert('Failed to save draft. Error: ' + (e.message || 'Unknown error'));
      }
    },
  },
};
</script>

<style scoped>
.google-form-container.full-width-form {
  max-width: 90vw;
  width: 90vw;
  margin: 0;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  padding: 2.5rem 0 2rem 0;
}
@media (min-width: 900px) {
  .google-form-container.full-width-form {
    max-width: 100vw;
    padding-left: 10vw;
    padding-right: 10vw;
  }
}
.enhanced-header {
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  text-align: center;
}
.form-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d3a4a;
  margin-bottom: 0.5rem;
}
.form-description {
  color: #6c757d;
  font-size: 1.1rem;
}
.enhanced-questions {
  margin-top: 2rem;
}
.enhanced-question-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.2rem 1rem 1rem 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
  transition: box-shadow 0.2s;
  width: 100%;
}
.enhanced-question-item:hover {
  box-shadow: 0 4px 16px rgba(44,62,80,0.10);
}
.question-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #34495e;
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
}
.required-asterisk {
  color: #e74c3c;
  margin-left: 0.3rem;
  font-size: 1.2rem;
}
.enhanced-input.wide-input {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  margin-top: 0.2rem;
  background: #fff;
  transition: border 0.2s;
}
.enhanced-input.wide-input:focus {
  border: 1.5px solid #1976d2;
  outline: none;
}
.choices-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.2rem;
}
.choice-card {
  background: #fff;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  min-width: 120px;
  min-height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  position: relative;
  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
}
.choice-card:hover, .choice-card:focus-within {
  border: 1.5px solid #1976d2;
  box-shadow: 0 2px 8px rgba(44,62,80,0.10);
}
.choice-card.selected {
  border: 2px solid #1976d2;
  background: #e3f0fd;
}
.choice-label {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
}
.choice-custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f0f4fa;
  margin-right: 0.7rem;
  border: 1.5px solid #d1d5db;
  transition: border 0.2s, background 0.2s;
  position: relative;
}
.choice-card input:checked + .choice-label .choice-custom {
  border: 1.5px solid #1976d2;
  background: #e3f0fd;
}
.checkmark {
  color: #1976d2;
  font-size: 1.1rem;
  font-weight: bold;
}
.radio-dot {
  width: 12px;
  height: 12px;
  background: #1976d2;
  border-radius: 50%;
  display: inline-block;
}
.choice-text {
  font-size: 1rem;
  color: #2d3a4a;
  user-select: none;
}
.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}
.submit-btn-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}
.submit-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover {
  background: #1256a3;
}
</style>
