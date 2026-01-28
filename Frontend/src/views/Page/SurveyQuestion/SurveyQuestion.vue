<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    v-if="!isLoading"
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'AWARENESS'"
    :mainSubPage="'AWARENESS SURVEY'"
    :subPage="'View Questions'"
    :titlePage="'Related Questions'"
    v-permission:show
  >
    <div v-permission:update v-permission:delete></div>
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> {{ item.question }} </template>
        <template #type="{ item }">
          <span
            class="badge text-bg-success text-light"
            v-if="item.type == 'single'"
          >
            {{ $t("viewQuestions.singleselect") }}
          </span>
          <span
            class="badge text-bg-success text-light"
            v-else-if="item.type == 'multi'"
          >
            {{ $t("viewQuestions.multiselect") }}
          </span>
        </template>

        <template #addAction="{ item }">
          <v-list-item
            v-anyPermission="['openDetailsModal']"
            @click="openDetailsModal(item)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("viewQuestions.overview") }}
            </v-list-item-title>
          </v-list-item>
        </template>
        <template #edit="{ item }">
          <v-list-item
            v-anyPermission="['update']"
            v-if="isSurveyApproved == false"
            @click="editQuestion(item)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-pencil-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("viewQuestions.edit") }}
            </v-list-item-title>
          </v-list-item>
        </template>

        <template #delete="{ item }">
          <v-list-item
            v-anyPermission="['delete']"
            v-if="isSurveyApproved == false"
            @click="removeQuestion(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-delete-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("viewQuestions.delete") }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      >
        <template #question="{ item }">
          <div class="mb-3">
            <label for="question-text" class="form-label">
              <h6>{{ $t("viewQuestions.questiontext") }}</h6>
            </label>
            <textarea
              v-model="newItem.question"
              class="form-control"
              id="question-text"
              rows="3"
              placeholder="Enter your question here"
            ></textarea>
          </div>
        </template>

        <template #type="{ item }">
          <div class="mb-3">
            <label for="question-type" class="form-label">
              <h6>{{ $t("viewQuestions.type") }}</h6>
            </label>
            <select
              v-model="newItem.type"
              class="form-control"
              id="question-type"
            >
              <option value="single">
                {{ $t("viewQuestions.singleselect") }}
              </option>
              <option value="multi">
                {{ $t("viewQuestions.multiselect") }}
              </option>
            </select>
          </div>
        </template>

        <template #answers[]="{ item }">
          <div class="mb-3">
            <label class="form-label">
              <h6>{{ $t("viewQuestions.options") }}</h6>
            </label>
            <div
              v-for="(option, optionIndex) in newItem.options"
              :key="optionIndex"
              class="option-row d-flex align-items-center mb-2"
            >
              <div class="option-id me-2">
                {{ String.fromCharCode(65 + optionIndex) }}
              </div>
              <input
                v-model="option.text"
                type="text"
                class="form-control"
                placeholder="Option text"
              />
              <button
                @click="removeOption(optionIndex)"
                class="ms-2"
                :disabled="newItem.options.length <= 2"
              >
                <i class="icofont icofont-trash text-danger"></i>
              </button>
            </div>
            <button
              style="text-align: center"
              @click="addOption"
              class="btn btn-sm btn-outline-primary mt-2"
              type="button"
            >
              <i class="fa-solid fa-plus"></i>
              {{ $t("viewQuestions.addoption") }}
            </button>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Details Modal -->
  <div
    v-if="isDetailsModalOpen"
    class="modal-overlay"
    @click.self="closeDetailsModal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("viewQuestions.questionoverview") }}</h5>
        <button
          @click="closeDetailsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <label style="font-weight: 900" for="taskTitle" class="form-label"
              >{{ $t("viewQuestions.question") }} :
            </label>
            <p>{{ this.questionData.question }}</p>
          </div>

          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("viewQuestions.questiontype") }}:</label
            >
            <p>
              <span
                class="badge rounded-pill"
                :class="{
                  'badge text-bg-success text-light': questionData.type === 'single',
                  'badge text-bg-success text-light': questionData.type === 'multi',
                }"
              >
                {{
                  questionData.type === "single"
                    ? $t("viewQuestions.singleselect")
                    : $t("viewQuestions.multiselect")
                }}
              </span>
            </p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("viewQuestions.createdat") }}:</label
            >
            <p>{{ formatDate(questionData.created_at) }}</p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("viewQuestions.lastupdated") }}:</label
            >
            <p>{{ formatDate(questionData.updated_at) }}</p>
          </div>
          <div class="col-md-12 mt-3">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("viewQuestions.options") }}:</label
            >
            <ul class="list-group" style="margin-left: 20px">
              <li
                v-for="(option, index) in questionData.options"
                :key="index"
                class="d-flex align-items-center"
              >
                <span class="badge text-bg-primary me-2 mb-2">
                  {{ String.fromCharCode(65 + index) }}
                </span>
                {{ option.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import Question from "@/API/SurveyQuestion/SurveyQuestion";
import Survey from "@/API/Survey/Survey";
import SurveyResponse from "@/API/SurveyResponse/SurveyResponse";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { notify } from "@kyvg/vue3-notification";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    const api = new Question();
    const apiSurvey = new Survey();
    const survey_id = useRouter().currentRoute.value.params.id;
    const apiSurveyResponse = new SurveyResponse();
    const apiParams = { filter: "survey_id|" + survey_id + "|=" };
    const tableColumns = [];
    const fromFields = [];
    const questionsList = new Question();

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      questionsList,
      survey_id,
      apiSurvey,
      apiSurveyResponse,
    };
  },

  data() {
    return {
      isLoading: true,
      isFlipped: false,
      isReadonly: false,
      isSurveyApproved: false,
      isDetailsModalOpen: false,
      questionData: [],
      mostCommonAnswers: {},
      mostCommonAnswer: null,
      newItem: {
        id: null,
        question: "",
        type: "single",
        options: [{ text: "" }, { text: "" }],
      },
    };
  },

  watch: {
    "$route.params.id": {
      handler(newId) {
        this.fetchSurveyStatus();
      },
      immediate: true,
    },
  },

  created() {
    this.surveyId = this.$route.params.id;
    console.log("Survey ID:", this.surveyId);

    this.tableColumns = [
      {
        title: this.$t("viewQuestions.question"),
        data: "question",
        defaultContent: "N/A",
      },
      {
        id: "type",
        title: this.$t("viewQuestions.type"),
        data: "type",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "question",
        label: this.$t("viewQuestions.question"),
        type: "textarea", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("viewQuestions.please_enter_your_question."),
        col: 12,
      },

      {
        type: "options", // Dropdown/select field
        name: "type",
        label: this.$t("viewQuestions.questiontype"),
        options: [
          { id: 1, name: "Single-Choice" },
          { id: 2, name: "Multiple-Choice" },
        ],
        optionLabel: "name",
        col: 12,
        rules: "required", // Validation: required selection
        description: this.$t("viewQuestions.please_select_question_type."),
      },

      {
        name: "answers[]",
        label: this.$t("A"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("viewQuestions.please_enter_answer."),
        col: 12, // Column size in the form layout
      },
    ];
    this.fetchSurveyStatus();
    this.fetchMostCommonAnswers();
  },

  methods: {
    async fetchMostCommonAnswers() {
      try {
        // Fetch all survey responses for this survey
        const responses = await this.apiSurveyResponse.getAll({
          filter: `survey_id|${this.survey_id}|=`,
        });

        // Group responses by question
        const answersByQuestion = {};
        responses.forEach((response) => {
          response.answers.forEach((answer) => {
            const questionId = answer.question_id;
            if (!answersByQuestion[questionId]) {
              answersByQuestion[questionId] = [];
            }
            answersByQuestion[questionId].push(answer.answer.text);
          });
        });

        const mostCommonAnswers = {};
        Object.keys(answersByQuestion).forEach((questionId) => {
          const answers = answersByQuestion[questionId];
          const answerCounts = answers.reduce((acc, answer) => {
            acc[answer] = (acc[answer] || 0) + 1;
            return acc;
          }, {});

          const mostCommonAnswer = Object.keys(answerCounts).reduce((a, b) =>
            answerCounts[a] > answerCounts[b] ? a : b
          );
          mostCommonAnswers[questionId] = mostCommonAnswer;
          // this.mostCommonAnswer = mostCommonAnswer;

          mostCommonAnswers[questionId] = {
            answer: mostCommonAnswer,
            count: answerCounts[mostCommonAnswer],
          };
        });

        this.mostCommonAnswers = mostCommonAnswers;
        console.log("mostCommonAnswer", this.mostCommonAnswers);
      } catch (error) {
        console.error("Error fetching most common answers:", error);
      }
    },

    async beforeRenderTable(data) {
      return data.map((row) => {
        const mostCommonAnswer = this.mostCommonAnswers[row.id];
        return {
          ...row,
          mostCommonAnswer: mostCommonAnswer
            ? `${mostCommonAnswer.answer} (${mostCommonAnswer.count} responses)`
            : "No responses",
        };
      });
    },
    formatDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    openDetailsModal(selectedRow) {
      this.selectedAction = ""; // Reset selection
      console.log("Selected row:", selectedRow);
      this.isDetailsModalOpen = true;
      console.log(this.isDetailsModalOpen);
      this.questionData = selectedRow;
    },

    async closeDetailsModal() {
      this.isDetailsModalOpen = false;
    },

    async fetchSurveyStatus() {
      try {
        const response = await this.apiSurvey.show(this.survey_id);
        if (response.status == "Approved") {
          this.isSurveyApproved = true;
        }
        console.log("Survey status:", this.isSurveyApproved);
      } catch (error) {
        console.error("Error fetching survey status:", error);
        this.isSurveyApproved = false;
      }
      this.isLoading = false;
    },

    openForm() {
      this.newItem.survey_id = this.$route.params.id;
      if (this.isSurveyApproved) {
        this.isFlipped = false;
        notify({
          type: "error",
          text: "Survey is Approved and cannot add more questions",
        });
      } else {
        this.isFlipped = true;
      }
    },
    editItem(data) {
      this.newItem = data; // Deep copy to avoid reference issues
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {
        question: "",
        type: "single",
        options: [{ text: "" }, { text: "" }],
      }; // Clear the current item data
    },

    // Set the item data for editing
    editQuestion(selectedRow) {
      this.newItem = { ...selectedRow }; // Copy the selected row data
      this.isFlipped = true; // Open the form
    },

    // Unassign a user from the survey
    async removeQuestion(questionId) {
      const response = await this.api.delete(questionId);
      this.$refs.table.refreshTable(); // Refresh the table after unassigning
      console.log("Question deleted successfully", response); // Optional: Show a success message
    },
    addOption() {
      this.newItem.options.push({ text: "" }); // Add a new option
    },
    removeOption(optionIndex) {
      if (this.newItem.options.length > 2) {
        this.newItem.options.splice(optionIndex, 1); // Remove the option
      }
    },
  },

  beforeUnmount() {
    // Clean up styles when component is destroyed
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
    }
    this.closeForm();
  },
};
</script>

<style scoped>
.form-control {
  margin-top: 0.5rem;
}

.text-muted {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.question-form {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-id {
  font-weight: bold;
  min-width: 25px;
  text-align: center;
}

.btn-outline-primary {
  margin-top: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  /* Bootstrap modal z-index */
}

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  /* Rounded corners */
  width: 90%;
  max-width: 750px;
  /* Responsive max width */
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.text-bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
  font-size: 13px;
  border-radius: 30px !important;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
  /* Larger header font */
}

.btn-close {
  font-size: 15px;
  border: none;
  color: #000;
}

.modal-body {
  padding: 20px 0;
  max-height: 60vh; /* Limit the height of the modal body */
  overflow-y: auto; /* Enable vertical scrolling if content overflows */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  width: 100%; /* Ensure the modal body takes full width */
}

.modal-body p {
  white-space: normal; /* Ensure text wraps */
  word-wrap: break-word; /* Break long words if necessary */
  overflow-wrap: break-word; /* Modern alternative to word-wrap */
  max-width: 100%; /* Ensure the text doesn't overflow its container */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
<style>
.delete_button {
  display: none !important;
}
.edit_button {
  display: none !important;
}

.custom-table th,
td {
  text-align: center !important;
}

.action-list-item {
  padding: 4px 15px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  border-radius: 0 !important;
  margin: 5px !important;
}

.action-list-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
}
</style>
