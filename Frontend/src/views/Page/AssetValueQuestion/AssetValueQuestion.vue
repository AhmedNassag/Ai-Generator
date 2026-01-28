<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'assetvaluequestion.assetvaluequestion'"
    :subPage="'assetvaluequestion.assetvaluequestion'" :titlePage="'assetvaluequestion.assetvaluequestion'">

    <!-- Slot for rendering the DataTable -->
    <template #datatable>

      <!-- Custom Tabs Component -->
      <TabsComponent :tabs="tabsData" v-model="activeTab" @tab-change="handleTabChange" />

      <!-- Tab Content -->
      <div class="tab-content pt-1">

        <!-- Confidentiality Tab Content -->
        <div v-show="activeTab === 'confidentiality'" class="mt-2" id="confidentialitySection" role="tabpanel"
          aria-labelledby="confidentialitySection-tab">
          <form @submit.prevent>
            <div id="confidentiality-rows">
              <div v-for="(confidentiality, index) in confidentialityQuestions" :key="index"
                class="row align-items-center confidentiality">
                <!-- Text Input -->
                <div class="col-md-7 col-12">
                  <div class="mb-1">
                    <input type="text" class="form-control" v-model="confidentiality.question" required>
                  </div>
                </div>
                <!-- Yes / No Options -->
                <div class="col-md-3 col-12 d-flex gap-3 mb-2 mb-md-0">
                  <div class="d-flex align-items-center flex-fill">
                    <label class="me-2 fw-bold text-nowrap">Yes</label>
                    <select v-model="confidentiality.answers.yes" class="form-select form-select-sm flex-fill" style="min-width: 80px;">
                      <option value="0">0</option>
                      <option value="1">1</option>
                    </select>
                  </div>
                  <div class="d-flex align-items-center flex-fill">
                    <label class="me-2 fw-bold text-nowrap">No</label>
                    <select v-model="confidentiality.answers.no" class="form-select form-select-sm flex-fill" style="min-width: 80px;">
                      <option value="0">0</option>
                      <option value="1">1</option>
                    </select>
                  </div>
                </div>
                <!-- Buttons -->
                <div class="col-xl-2 col-12">
                  <!-- Show Save button only for new questions -->
                  <button v-if="confidentiality.isNew" type="button" class="btn btn-save w-100"
                    @click="saveConfidentiality(index)">
                    Save
                  </button>
                  <!-- Show Update button only for existing questions -->
                  <button v-else type="button" class="btn btn-update w-100" @click="saveConfidentiality(index)">
                    Update
                  </button>
                </div>
              </div>
            </div>
            <div class="col-xl-12 mt-2">
              <button type="button" class="btn btn-add btn-full-mobile" @click="addNewConfidentiality">Add +</button>
            </div>
          </form>
        </div>

        <!-- Integrity Tab Content -->
        <div v-show="activeTab === 'integrity'" class="mt-2" id="integritySection" role="tabpanel"
          aria-labelledby="integritySection-tab">
          <form @submit.prevent>
            <div id="integrity-rows">
              <div v-for="(integrity, index) in integrityQuestions" :key="index"
                class="row align-items-center integrity">
                <!-- Text Input -->
                <div class="col-md-7 col-12">
                  <div class="mb-1">
                    <input type="text" class="form-control" v-model="integrity.question" required>
                  </div>
                </div>
                <!-- Yes / No Options -->
                <div class="col-md-3 col-12 d-flex gap-3 mb-2 mb-md-0">
                  <div class="d-flex align-items-center flex-fill">
                    <label class="me-2 fw-bold text-nowrap">Yes</label>
                    <select v-model="integrity.answers.yes" class="form-select form-select-sm flex-fill" style="min-width: 80px;">
                      <option value="0">0</option>
                      <option value="1">1</option>
                    </select>
                  </div>
                  <div class="d-flex align-items-center flex-fill">
                    <label class="me-2 fw-bold text-nowrap">No</label>
                    <select v-model="integrity.answers.no" class="form-select form-select-sm flex-fill" style="min-width: 80px;">
                      <option value="0">0</option>
                      <option value="1">1</option>
                    </select>
                  </div>
                </div>
                <!-- Buttons -->
                <div class="col-xl-2 col-12">
                  <!-- Show Save button only for new questions -->
                  <button v-if="integrity.isNew" type="button" class="btn btn-save w-100" @click="saveIntegrity(index)">
                    Save
                  </button>
                  <!-- Show Update button only for existing questions -->
                  <button v-else type="button" class="btn btn-update w-100" @click="saveIntegrity(index)">
                    Update
                  </button>
                </div>
              </div>
            </div>
            <div class="col-xl-12 mt-2">
              <button type="button" class="btn btn-add btn-full-mobile" @click="addNewIntegrity">Add +</button>
            </div>
          </form>
        </div>

        <!-- Availability Tab Content -->
        <div v-show="activeTab === 'availability'" class="mt-2" id="availabilitySection" role="tabpanel"
          aria-labelledby="availabilitySection-tab">
          <form @submit.prevent>

            <div class="d-flex flex-column flex-md-row justify-content-between mb-3 gap-2">
              <h4 class="col-md-6 col-12 m-0">Questions</h4>
              <h4 class="col-md-6 col-12 ms-md-3 m-0">Answers to all questions</h4>
            </div>

            <div id="availability-rows">
              <div v-for="(availability, index) in availabilityQuestions" :key="index"
                class="row align-items-center availability mb-3">

                <div class="col-md-6 col-12 mb-3 mb-md-0">
                  <!-- Questions -->
                  <div class="d-flex align-items-start gap-2 mb-2" v-for="(question, qIndex) in availability.question"
                    :key="qIndex">
                    <div class="flex-grow-1">
                      <input type="text" class="form-control form-control-sm" v-model="availability.question[qIndex]"
                        required>
                    </div>

                    <!-- Buttons -->
                    <div class="btn-container-mobile">
                      <!-- Show Save button only for new questions -->
                      <button v-if="availability.isNew" type="button" class="btn btn-success btn-sm"
                        @click.prevent="saveAvailability(index)">
                        Save
                      </button>
                      <!-- Show Update button only for existing questions -->
                      <button v-else type="button" class="btn btn-update btn-sm"
                        @click.prevent="saveAvailability(index)">
                        Update
                      </button>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 col-12">
                  <!-- Answers -->
                  <div class="d-flex align-items-start gap-2 mb-2 flex-wrap flex-sm-nowrap"
                    v-for="(answer, aIndex) in availability.answers" :key="aIndex">
                    <div class="flex-grow-1 w-100 w-sm-auto">
                      <input type="text" class="form-control form-control-sm"
                        v-model="availability.answers[aIndex].answer" required>
                    </div>

                    <!-- Yes / No Options -->
                    <div class="d-flex gap-2">
                      <div>
                        <select class="form-select form-select-sm" v-model="availability.answers[aIndex].value"
                          style="min-width: 80px;">
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>
                    </div>

                    <!-- Buttons -->
                    <div class="btn-container-mobile">
                      <!-- Show Save button only for new questions -->
                      <button v-if="availability.isNew" type="button" class="btn btn-success btn-sm"
                        @click.prevent="saveAvailability(index)">
                        Save
                      </button>
                      <!-- Show Update button only for existing questions -->
                      <button v-else type="button" class="btn btn-update btn-sm"
                        @click.prevent="saveAvailability(index)">
                        Update
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="col-12 mt-2">
              <div class="row g-3">
                <div class="col-md-6 col-12">
                  <button type="button" class="btn btn-add w-100" @click="addNewAvailabilityQuestions">Add Question
                    +</button>
                </div>
                <div class="col-md-6 col-12">
                  <button type="button" class="btn btn-add w-100" @click="addNewAvailabilityAnswers">Add Answer
                    +</button>
                </div>
              </div>
            </div>

          </form>
        </div>

      </div>

    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>

  </main-page>
</template>

<script>
// Importing necessary components and API modules
import assetvaluequestion from "@/API/AssetValueQuestion/AssetValueQuestion";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import TabsComponent from "@/components/TabsComponent.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    TabsComponent, // Custom tabs component
  },

  setup() {
    // Initialize API and other required properties
    const api = new assetvaluequestion();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields
    };
  },

  async mounted() {

    // Fetch roles
    //this.roles = await this.roleApi.getAll({ select: "id|name" });

    // Update options dynamically in the form field
    //const myOptionsField = this.fromFields.find((field) => field.name === "myOptions");
    //myOptionsField.options = this.roles.map((role) => ({
    //id: role.id,
    //name: role.name,
    //}));

  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      confidentialityQuestions: [],
      integrityQuestions: [],
      availabilityQuestions: [],
      activeTab: 'confidentiality', // Active tab state
      tabsData: [
        { id: 'confidentiality', label: 'Confidentiality' },
        { id: 'integrity', label: 'Integrity' },
        { id: 'availability', label: 'Availability' }
      ]
    };
  },

  created() {
    this.loadAssetQuestions();
  },

  methods: {
    handleTabChange(tabId) {
      this.activeTab = tabId;
    },

    addNewConfidentiality() {
      this.confidentialityQuestions.push({
        question_category: 1,
        answer_type: 1,
        question: "",
        answers: {
          yes: "1", // Default value for Yes
          no: "1",  // Default value for No
        },
        isNew: true, // Mark as new question
      });
    },

    async saveConfidentiality(index) {
      const question = this.confidentialityQuestions[index];

      const { isNew, ...questionData } = question;

      await this.saveQuestion(questionData);

      // Mark as not new after saving/updating
      question.isNew = false;
    },

    addNewIntegrity() {
      this.integrityQuestions.push({
        question_category: 2,
        answer_type: 1,
        question: "",
        answers: {
          yes: "1", // Default value for Yes
          no: "1",  // Default value for No
        },
        isNew: true, // Mark as new question
      });
    },

    async saveIntegrity(index) {
      const question = this.integrityQuestions[index];

      const { isNew, ...questionData } = question;

      await this.saveQuestion(questionData);

      // Mark as not new after saving/updating
      question.isNew = false;
    },

    addNewAvailabilityQuestions() {
      // Loop through availabilityQuestions and add a new empty question to each without touching answers
      this.availabilityQuestions.forEach((availability) => {
        availability.question.push(''); // Add a new question entry
      });
    },

    addNewAvailabilityAnswers() {
      // Loop through availabilityQuestions and add a new empty answer to each without touching questions
      this.availabilityQuestions.forEach((availability) => {
        availability.answers.push({ answer: '', value: '' }); // Add a new answer entry
      });
    },

    async saveAvailability(index) {
      const question = this.availabilityQuestions[index];

      const { isNew, ...questionData } = question;

      await this.saveQuestion(questionData);

      // Mark as not new after saving/updating
      question.isNew = false;
    },

    async saveQuestion(questionData) {
      await this.api.saveQuestion(questionData);
    },

    async loadAssetQuestions() {
      try {
        const response = await this.api.getAll();

        // Reset the arrays to avoid duplicate entries
        this.confidentialityQuestions = [];
        this.integrityQuestions = [];
        this.availabilityQuestions = [];

        // Loop through the response and categorize questions
        response.forEach(question => {
          if (question.question_category === 1) {
            // Mark existing questions as not new
            question.isNew = false;
            this.confidentialityQuestions.push(question);
          } else if (question.question_category === 2) {
            question.isNew = false;
            this.integrityQuestions.push(question);
          }
          else if (question.question_category === 3) {
            question.isNew = false;
            this.availabilityQuestions.push(question);
          }
        });

        console.log("availabilityQuestions");
        console.log(this.availabilityQuestions);

      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    }
  },
};
</script>


<style scoped>
/* Scoped styles for the component */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  padding: 8px 35px;
  height: 30px;
  letter-spacing: normal;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #6E3894;
  border-radius: 10px;
  white-space: nowrap;
}

.btn-add {
  border: none;
  background: #6E3894;
  color: white;
}

.btn-save {
  border: none;
  background: #D6EED3;
  color: #2F9826;
}

.btn-update {
  border: none;
  background: #EBD3B3;
  color: #E28F0B;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .btn {
    padding: 8px 20px;
    font-size: 13px;
    height: auto;
    min-height: 30px;
  }

  .btn-full-mobile {
    width: 100%;
  }

  .gap-3 {
    gap: 0.5rem !important;
  }

  .form-select-sm {
    font-size: 0.875rem;
  }

  h4 {
    font-size: 1.1rem;
  }

  .btn-container-mobile {
    min-width: fit-content;
  }
}

@media (max-width: 576px) {
  .btn {
    padding: 6px 15px;
    font-size: 12px;
  }

  .form-control,
  .form-control-sm {
    font-size: 14px;
  }

  .form-select,
  .form-select-sm {
    font-size: 14px;
    padding: 0.25rem 0.5rem;
  }

  h4 {
    font-size: 1rem;
  }

  .mb-1 {
    margin-bottom: 0.5rem !important;
  }

  .row.confidentiality,
  .row.integrity,
  .row.availability {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }
}

@media (max-width: 400px) {
  .btn {
    padding: 6px 12px;
    font-size: 11px;
  }

  .d-flex.gap-3 {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .d-flex.align-items-center.flex-fill {
    width: 100%;
  }
}
</style>