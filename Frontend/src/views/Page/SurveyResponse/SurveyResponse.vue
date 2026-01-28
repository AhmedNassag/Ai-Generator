<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('surveyresponse.AWARENESS')"
    :mainSubPage="this.$t('surveyresponse.AWARENESS_SURVEY')"
    :subPage="this.$t('surveyresponse.survey_response')"
    :titlePage="this.$t('surveyresponse.survey_response')"
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
        :action="false"
      >
        <template #email="{ item }">
          <a
            v-if="item.status == 'submitted'"
            @click="openResponseDetailsModal(item)"
            style="cursor: pointer"
            class="text-primary"
          >
            {{ item.user_email }}
          </a>
        </template>
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #date="{ item }">
          {{ formatDate(item.updated_at) }}
        </template>
        <template #total_questions="{ item }">
          <span class="badge text-bg-primary rounded-pill">
            {{ this.totalQuestions }}
          </span>
        </template>

        <template #questions="{ item }">
          <span
            v-if="Array.isArray(item.answers)"
            class="badge text-bg-success rounded-pill"
          >
            {{
              item.answers.filter((answer) => {
                // Condition to check if an answer is valid
                if (Array.isArray(answer.answer)) {
                  // It's an array, so check if it contains any non-null values
                  return answer.answer.some((val) => val !== null);
                } else {
                  // It's not an array (likely an object or null), so check if it's not null
                  return answer.answer !== null;
                }
              }).length
            }}
          </span>
          <span v-else class="badge text-bg-secondary rounded-pill">
            {{ $t("surveyresponse.userhasnotsubmittedyet") }}
          </span>
        </template>
        <template #user_type="{ item }">
          <span style="width: 60%" v-if="item.grc_user == 'true'">
            {{ $t("surveyresponse.cybermodeuser") }}
          </span>
          <span style="width: 60%" v-else-if="item.grc_user == 'false'">
            {{ $t("surveyresponse.outsidecybermode") }}
          </span>
        </template>

        <template #status="{ item }">
          <span style="width: 100%" v-if="item.status == 'submitted'">
            {{ $t("surveyresponse.completed") }}
          </span>
          <span style="width: 100%" v-else-if="item.status == 'draft'">
            {{ $t("surveyresponse.drafted") }}
          </span>
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
      ></Form>
    </template>
  </main-page>

  <div
    v-if="isResponseDetailsModalOpen"
    class="modal-overlay"
    @click.self="closeResponseDetailsModal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("surveyresponse.userresponseoverview") }}</h5>
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
              >{{ $t("surveyresponse.useremail") }} :</label
            >
            <p>{{ this.questionData.user_email }}</p>
          </div>
          <div class="col-md-12">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("surveyresponse.responses") }} :</label
            >
            <ul style="margin-left: 20px">
              <li
                v-for="(response, index) in userResponses"
                :key="index"
                class="list-group-item"
              >
                <strong>{{ $t("surveyresponse.question") }} :</strong><br />
                <span
                  style="font-size: 12px"
                  class="badge rounded-pill bg-primary text-light mb-1"
                  >{{ response.question }}</span
                ><br />
                <strong>Answer :</strong>
                <span class="mb-3">{{ response.answer }}</span>
              </li>
              <li
                v-if="!userResponses.length"
                class="list-group-item text-muted"
              >
                No responses found for this user.
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
import surveyresponse from "@/API/SurveyResponse/SurveyResponse";
import Survey from "@/API/Survey/Survey";
import Question from "@/API/SurveyQuestion/SurveyQuestion";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { useRouter } from "vue-router";
import { notify } from "@kyvg/vue3-notification";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new surveyresponse();
    const surveyApi = new Survey();
    const questionApi = new Question();
    const survey_id = useRouter().currentRoute.value.params.id;
    const apiParams = { filter: "survey_id|" + survey_id + "|=" };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      surveyApi,
      apiParams,
      questionApi,
      tableColumns,
      fromFields,
    };
  },

  async mounted() {
    await this.fetchData();
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      isResponseDetailsModalOpen: false,
      questionData: {}, // Store the selected row data
      userResponses: [], // Store questions and answers for the selected user
      newItem: {}, // Data object to store the currently selected item for editing or new item
      totalQuestions: null, // Store the total number of questions in the survey
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id: "email",
        title: this.$t("surveyresponse.user_email"),
        data: "user_email",
        defaultContent: "N/A",
      },
      {
        id: "date",
        title: this.$t("surveyresponse.response_date"),
        data: "updated_at",
        defaultContent: "N/A",
      },
      {
        id: "user_type",
        title: this.$t("surveyresponse.user_type"),
        data: "grc_user",
        defaultContent: "N/A",
      },
      {
        id: "total_questions",
        title: this.$t("surveyresponse.total_questions"),
        data: "grc_user",
        defaultContent: "N/A",
      },
      {
        id: "questions",
        title: this.$t("surveyresponse.answered_questions"),
        data: "grc_user",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("surveyresponse.status"),
        data: "status",
        defaultContent: "N/A",
      },
    ];
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
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

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    async fetchData() {
      const surveyId = this.$route.params.id;
      let questions = await this.questionApi.getAll({
        filterIn: `survey_id|${surveyId}`,
      });
      console.log('questionsssss', questions)
      this.totalQuestions = questions.length;
      this.$refs.table.refreshTable(); // Refresh the table data
    },

    async openResponseDetailsModal(selectedRow) {
      this.selectedAction = "";
      console.log("Selected row:", selectedRow);
      this.questionData = selectedRow;
      try {
        // Fetch the user's response for this survey
        const responses = await this.api.getAll({
          filter: `survey_id|${selectedRow.survey_id}|=&&status|submitted|=&&user_email|${selectedRow.user_email}|=`,
        });

        // Fetch all questions for the survey
        const questions = await this.questionApi.getAll({
          filterIn: `survey_id|${selectedRow.survey_id}`,
        });

        // Create a map of question_id to question text
        const questionMap = {};
        questions.forEach((question) => {
          questionMap[question.id] = question.question;
        });

        // Extract answers and map to questions
        const userResponses = [];
        if (responses.length > 0 && Array.isArray(responses[0].answers)) {
          responses[0].answers.forEach((answer) => {
            if (questionMap[answer.question_id]) {
              let displayAnswer = "";
              if (Array.isArray(answer.answer)) {
                // Multi-select: extract text or value from each object
                displayAnswer = answer.answer
                  .filter(val => val != null)
                  .map(val => (typeof val === "object" && val.text ? val.text : val))
                  .join(", ");
              } else if (answer.answer && typeof answer.answer === "object" && answer.answer.text) {
                // Single-select or text
                displayAnswer = answer.answer.text;
              } else if (answer.answer != null) {
                // Fallback for primitive values
                displayAnswer = answer.answer;
              }
              userResponses.push({
                question: questionMap[answer.question_id],
                answer: displayAnswer,
              });
            }
          });
        }

        this.userResponses = userResponses;
        this.isResponseDetailsModalOpen = true;
        console.log("User responses:", this.userResponses);
      } catch (error) {
        console.error("Error fetching user responses:", error);
        notify({
          type: "error",
          text: "Failed to load user responses.",
        });
        this.userResponses = [];
        this.isResponseDetailsModalOpen = true;
      }
    },
    async closeResponseDetailsModal() {
      this.isResponseDetailsModalOpen = false;
      this.userResponses = []; // Clear responses when closing modal
      this.questionData = {};
    },
  },
};
</script>

<style scoped>
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
