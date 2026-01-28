<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('questionsresponse.AWARENESS')"
    :mainSubPage="this.$t('questionsresponse.AWARENESS_SURVEY')"
    :subPage="this.$t('questionsresponse.View_Questions')"
    :titlePage="this.$t('questionsresponse.Related_Questions')"
    v-permission:show
  >
    <div v-permission:update v-permission:destroy></div>
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
        :hideAddNewButton="true"
        :hideActionsColumn="true"
        :action="false"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> {{ item.question }} </template>
        <template #mostcommonanswer="{ item }">
          {{
            this.mostCommonAnswers[item.id] &&
            this.mostCommonAnswers[item.id].count > 0
              ? `${this.mostCommonAnswers[item.id].answers.join(", ")} (${
                  this.mostCommonAnswers[item.id].count
                } responses )`
              : "Not answered"
          }}
        </template>
        <template #totalresponses="{ item }">
          <a
            @click="openResponseDetailsModal(item)"
            style="cursor: pointer"
            class="text-primary"
          >
            {{
              this.totalResponses[item.id]
                ? `${this.totalResponses[item.id]} responses`
                : "No responses"
            }}
          </a>
        </template>
        <template #type="{ item }">
          <span
            class="badge rounded-pill bg-success text-light"
            style="width: 100%"
            v-if="item.type == 'single'"
          >
            {{ $t("questionsresponse.singleselect") }}
          </span>
          <span
            class="badge rounded-pill bg-primary text-light"
            style="width: 100%"
            v-else-if="item.type == 'multi'"
          >
            {{ $t("questionsresponse.multiselect") }}
          </span>
        </template>

        <template #view="{ item }">
          <a
            href="javascript:void(0)"
            @click="openDetailsModal(item)"
            title="View Exception"
            class="dropdown-item"
          >
            <i class="fa-solid fa-eye"></i>
            {{ $t("questionsresponse.overview") }}
          </a>
        </template>
        <template #edit="{ item }">
          <a
            v-if="isSurveyApproved == false"
            href="javascript:void(0)"
            @click="editQuestion(item)"
            class="dropdown-item"
          >
            <i class="icofont icofont-fountain-pen"></i>
            {{ $t("questionsresponse.edit") }}
          </a>
        </template>

        <template #delete="{ item }">
          <a
            v-if="isSurveyApproved == false"
            href="javascript:void(0)"
            class="dropdown-item"
            @click="removeQuestion(item.id)"
            title="Remove Question"
            ><i class="icofont icofont-trash text-danger"></i>
            {{ $t("questionsresponse.delete") }}</a
          >
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
              <h6>{{ $t("questionsresponse.questiontext") }}</h6>
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
              <h6>Type</h6>
            </label>
            <select
              v-model="newItem.type"
              class="form-control"
              id="question-type"
            >
              <option value="single">
                {{ $t("questionsresponse.singleselect") }}
              </option>
              <option value="multi">
                {{ $t("questionsresponse.multiselect") }}
              </option>
            </select>
          </div>
        </template>

        <template #answers[]="{ item }">
          <div class="mb-3">
            <label class="form-label">
              <h6>{{ $t("questionsresponse.options") }}</h6>
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
              {{ $t("questionsresponse.addoption") }}
            </button>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Details Modal -->
  <div v-if="isDetailsModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("questionsresponse.overview") }}</h5>
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
              >{{ $t("questionsresponse.question") }} :
            </label>
            <p>{{ this.questionData.question }}</p>
          </div>

          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("questionsresponse.questiontype") }}:</label
            >
            <p>
              <span
                class="badge rounded-pill"
                :class="{
                  'bg-success': questionData.type === 'single',
                  'bg-primary': questionData.type === 'multi',
                }"
              >
                {{
                  questionData.type === "single"
                    ? $t("questionsresponse.singleselect")
                    : $t("questionsresponse.multiselect")
                }}
              </span>
            </p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("questionsresponse.createdat") }}:</label
            >
            <p>{{ formatDate(questionData.created_at) }}</p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("questionsresponse.lastupdated") }}:</label
            >
            <p>{{ formatDate(questionData.updated_at) }}</p>
          </div>
          <div class="col-md-12 mt-3">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("questionsresponse.options") }}:</label
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

  <!-- Total responses details -->
  <div
    v-if="isResponseDetailsModalOpen"
    class="modal-overlay"
    @click.self="closeResponseDetailsModal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("questionsresponse.overview") }}</h5>
        <button
          @click="closeResponseDetailsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("questionsresponse.question") }}:</label
            >
            <p>{{ this.questionData.question }}</p>
          </div>
          <div class="col-md-12">
            <label style="font-weight: 900" class="form-label">
              {{
                $t("questionsresponse.userswhoansweredthisquestion")
              }}
              :</label
            >
            <ul style="margin-left: 20px">
              <li
                v-for="(response, index) in responseEmails"
                :key="index"
                class="list-group-item d-flex align-items-center"
              >
                <h4 class="mb-3">{{ response.email }}</h4>
                <span
                  v-if="response.grc_user === 'false'"
                  class="badge rounded-pill bg-warning text-light ms-2 mb-3"
                >
                  {{ $t("questionsresponse.outsidecybermode") }}
                </span>
                <span
                  v-else
                  class="badge rounded-pill bg-success text-light ms-2 mb-3"
                >
                  {{ $t("questionsresponse.cybermodeuser") }}
                </span>
              </li>
              <li
                v-if="!responseEmails.length"
                class="list-group-item text-muted"
              >
                {{ $t("questionsresponse.nousershaveansweredthisquestion") }}
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
      isFlipped: false,
      isReadonly: false,
      isSurveyApproved: false,
      isDetailsModalOpen: false,
      isResponseDetailsModalOpen: false,
      questionData: [],
      mostCommonAnswers: {},
      mostCommonAnswer: null,
      totalResponses: {},
      responseEmails: [],
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
        title: this.$t("questionsresponse.question"),
        data: "question",
        defaultContent: "N/A",
      },
      {
        id: "type",
        title: this.$t("questionsresponse.type"),
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "mostcommonanswer",
        title: this.$t("questionsresponse.mostcommonanswer"),
        data: "mostCommonAnswer",
        defaultContent: "N/A",
      },
      {
        id: "totalresponses",
        title: this.$t("questionsresponse.totalresponses"),
        data: "mostCommonAnswer",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "question",
        label: this.$t("questionsresponse.question"),
        type: "textarea", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your question.",
        col: 12,
      },

      {
        type: "options", // Dropdown/select field
        name: "type",
        label: this.$t("questionsresponse.questiontype"),
        options: [
          { id: 1, name: "Single-Choice" },
          { id: 2, name: "Multiple-Choice" },
        ],
        optionLabel: "name",
        col: 12,
        rules: "required", // Validation: required selection
        description: "Please select question type.",
      },

      {
        name: "answers[]",
        label: this.$t("A"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter answer.",
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
          filter: `survey_id|${this.survey_id}|=&&status|submitted|=`,
        });

        // Group responses by question
        const answersByQuestion = {};
        const responseCounts = {}; // To store total responses per question

        responses.forEach((response) => {
          response.answers.forEach((answer) => {
            const questionId = answer.question_id;
            if (!answersByQuestion[questionId]) {
              answersByQuestion[questionId] = [];
            }

            // Handle both single text answers and arrays of answers for multi-select
            if (Array.isArray(answer.answer)) {
              // If it's an array, iterate over each item and push its text
              answer.answer.forEach((subAnswer) => {
                if (subAnswer && subAnswer.text) {
                  // Ensure subAnswer and text exist
                  answersByQuestion[questionId].push(subAnswer.text);
                }
              });
            } else if (answer.answer && answer.answer.text) {
              // If it's a single object with text, push its text
              answersByQuestion[questionId].push(answer.answer.text);
            }

            responseCounts[questionId] = (responseCounts[questionId] || 0) + 1; // Increment response count
          });
        });

        console.log("Fetching most common answers...");
        const mostCommonAnswers = {};
        Object.keys(answersByQuestion).forEach((questionId) => {
          const answers = answersByQuestion[questionId];
          const answerCounts = answers.reduce((acc, answerText) => {
            acc[answerText] = (acc[answerText] || 0) + 1;
            return acc;
          }, {});

          // Find the most common answer(s).
          // If there's a tie, this will just pick one,
          // but you could extend it to return all tied answers if needed.
          let maxCount = 0;
          Object.values(answerCounts).forEach((count) => {
            if (count > maxCount) {
              maxCount = count;
            }
          });
          const mostCommonAnswerTexts = Object.keys(answerCounts).filter(
            (answerText) => answerCounts[answerText] === maxCount
          );

          mostCommonAnswers[questionId] = {
            answers: mostCommonAnswerTexts,
            count: maxCount,
          };
        });

        this.mostCommonAnswers = mostCommonAnswers;
        this.totalResponses = responseCounts; // Store total responses
        console.log("mostCommonAnswers:", this.mostCommonAnswers);
        console.log("totalResponses:", this.totalResponses);
      } catch (error) {
        console.error("Error fetching most common answers:", error);
      }
    },

    async beforeRenderTable(data) {
      return data.map((row) => {
        const mostCommonAnswer = this.mostCommonAnswers[row.id];
        return {
          ...row,
          mostCommonAnswer:
            mostCommonAnswer && mostCommonAnswer.count > 0
              ? `${mostCommonAnswer.answers.join(", ")} (${
                  mostCommonAnswer.count
                } responses)`
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

    async openResponseDetailsModal(selectedRow) {
      this.selectedAction = "";
      console.log("Selected row:", selectedRow);
      this.questionData = selectedRow;
      try {
        // Fetch all survey responses for this survey
        const responses = await this.apiSurveyResponse.getAll({
          filter: `survey_id|${this.survey_id}|=&&status|submitted|=`,
        });

        // Filter responses to include only those with the selected question_id
        const responseData = responses
          .filter((response) =>
            response.answers.some(
              (answer) => answer.question_id === selectedRow.id
            )
          )
          .map((response) => ({
            email: response.user_email,
            grc_user: response.grc_user,
          }));

        this.responseEmails = responseData;
        this.isResponseDetailsModalOpen = true;
        console.log("Response emails with grc_user:", this.responseEmails);
      } catch (error) {
        console.error("Error fetching response emails:", error);
        notify({
          type: "error",
          text: "Failed to load user responses.",
        });
        this.responseEmails = [];
        this.isResponseDetailsModalOpen = true;
      }
    },

    async closeDetailsModal() {
      this.isDetailsModalOpen = false;
    },

    async closeResponseDetailsModal() {
      this.isResponseDetailsModalOpen = false;
      this.responseEmails = []; // Clear emails when closing modal
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

  /* Center all table data */
:deep(.table) td {
    text-align: center !important;
}

/* Center all table headers */
:deep(.table) th {
    text-align: center !important;
}

/* Center specific columns if needed */
:deep(.table) td.text-start,
:deep(.table) th.text-start {
    text-align: center !important;
}

.text-primary:hover {
  color: #0056b3;
}

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
/* Global style for DataTable */
.table-striped td,
.table-striped th {
    text-align: center !important;
    vertical-align: middle !important;
}

/* Center the action dropdown if it exists */
.table-actions {
    text-align: center !important;
}
</style>