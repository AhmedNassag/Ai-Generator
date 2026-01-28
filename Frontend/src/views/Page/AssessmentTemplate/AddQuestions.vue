<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'assessmenttemplate.assessmenttemplate'"
    :subPage="'assessmenttemplate.question'"
    :titlePage="'assessmenttemplate.question'"
    v-permission:show
  >
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <span
        class="badge badge-primary mb-3"
        @click="goBack"
        style="
        font-size: 13px !important;
        font-weight: 500 !important;
        color: #ffffff !important;
          cursor: pointer;
          padding: 10px;
          border-radius: 7px;
          background-color: #6e3894 !important;
        "
      >
        <i class="fa-solid fa-arrow-left"></i>
        {{ this.templateName }}</span
      >

      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :hideActions="hideActions"
      >
        <template #type="{ item }">
          <span
            v-if="item.type == '1'"
            class="badge bg-info text-white m-1"
            style="
              padding: 8px 20px;
              border-radius: 30px;
              font-size: 13px !important;
              background-color: #d9d9d9 !important;
              color: #000000 !important;
            "
          >
            Single Choice
          </span>
          <span
            v-if="item.type == '2'"
            class="badge bg-info text-white m-1"
            style="
              padding: 8px 20px;
              border-radius: 30px;
              font-size: 13px !important;
              background-color: #d9d9d9 !important;
              color: #000000 !important;
            "
          >
            Multiple Choice
          </span>
          <span
            v-if="item.type == '3'"
            class="badge bg-info text-white m-1"
            style="
              padding: 8px 20px;
              border-radius: 30px;
              font-size: 13px !important;
              background-color: #d9d9d9 !important;
              color: #000000 !important;
            "
          >
            Fill-in Blank
          </span>
        </template>
        <template #hasFileAttachment="{ item }">
          <span
            v-if="item.fileAttachment == 'true'"
            style="color: green; font-weight: bold;"
          >
            ✔
          </span>
          <span v-else style="color: #a92525; font-weight: bold"> ✖ </span>
        </template>
        <template #hasRisk="{ item }">
          <span
            v-if="
              item.answers &&
              item.answers.some(
                (answer) => answer.risk != null && answer.risk.subject != null
              )
            "
            style="color: green; font-weight: bold"
          >
            ✔
          </span>
          <span v-else style="color: #a92525; font-weight: bold"> ✖ </span>
        </template>

        <template #question.hasAnswers="{ item }">
          <span
            v-if="item.answers && item.answers.length"
            style="color: #255f0b; font-weight: bold"
          >
            ✔
          </span>
          <span v-else style="color: #a92525; font-weight: bold"> ✖ </span>
        </template>

        <template #addAction="{ item }">
                    <v-list-item
            v-anyPermission="['removeQuestionFromTemplate']"
            @click="confirmUnassign(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-link-off</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("Unlink") }}
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
        :api="apiAssessmentTemplate"
        :closeForm="closeForm"
        :formData="true"
        :customSubmit="handleCustomSubmit"
      >
        <!-- Custom template for question source selector -->
        <template #question_source="{ item }">
          <div class="col-md-12 mb-3">
            <label for="question_source" class="form-label">
              Select Question Source <span class="text-danger">*</span>
            </label>
            <select
              id="question_source"
              class="form-control"
              v-model="questionSource"
              @change="onQuestionSourceChange"
            >
              <option value="" disabled selected>Choose an option</option>
              <option value="bank">Choose From Question Bank</option>
              <option value="new">Create New Question</option>
            </select>
          </div>
        </template>

        <!-- Question Bank Multi-Select -->
        <template #question_ids="{ item }">
          <div v-if="questionSource === 'bank'" class="col-md-12 mb-3">
            <label for="question_ids" class="form-label">
              Choose From Question Bank <span class="text-danger">*</span>
            </label>
            <vue-select
              id="question_ids"
              v-model="newItem.question_ids"
              :options="availableQuestions"
              label="question"
              :reduce="(item) => item.id"
              multiple
              placeholder="Select questions"
            >
            </vue-select>
          </div>
        </template>

        <!-- Question Field -->
        <template #question="{ item }">
          <div v-if="questionSource === 'new'" class="col-md-12 mb-3">
            <label for="question" class="form-label">
              Question <span class="text-danger">*</span>
            </label>
            <ckeditor
              :editor="editor"
              class="form-control"
              id="question"
              v-model="newQuestion.question"
              placeholder="Enter your question"
              :config="editorConfig"
            ></ckeditor>
          </div>
        </template>

        <!-- Regulator -->
        <template #regulator_id="{ item }">
          <div v-if="questionSource === 'new'" class="col-md-6 mb-3">
            <label for="regulator" class="form-label">
              Regulator <span class="text-danger">*</span>
            </label>
            <vue-select
              id="regulator"
              v-model="newQuestion.regulator"
              :options="regulatorList"
              label="name"
              :reduce="(item) => item.id"
              placeholder="Choose a regulator"
            >
            </vue-select>
          </div>
        </template>

        <!-- Framework -->
        <template #framework_id="{ item }">
          <div v-if="questionSource === 'new'" class="col-md-6 mb-3">
            <label for="framework" class="form-label">
              Framework <span class="text-danger">*</span>
            </label>
            <vue-select
              id="framework"
              v-model="newQuestion.framework"
              :disabled="isFrameworkDisabled"
              :options="filteredFrameworks"
              label="title"
              :reduce="(item) => item.id"
              placeholder="Choose a framework"
            >
            </vue-select>
          </div>
        </template>

        <!-- Control -->
        <template #control_id="{ item }">
          <div v-if="questionSource === 'new'" class="col-md-6 mb-3">
            <label for="control" class="form-label">
              Control <span class="text-danger">*</span>
            </label>
            <vue-select
              id="control"
              v-model="newQuestion.control"
              :disabled="isControlDisabled"
              :options="filteredControls"
              label="long_name"
              :reduce="(item) => item.id"
              placeholder="Choose a control"
            >
            </vue-select>
          </div>
        </template>

        <!-- Question Type -->
        <template #type="{ item }">
          <div v-if="questionSource === 'new'" class="col-md-6 mb-3">
            <label for="type" class="form-label">
              Question Type <span class="text-danger">*</span>
            </label>
            <vue-select
              id="type"
              v-model="newQuestion.type"
              :options="[
                { id: 1, name: 'Single-Choice' },
                { id: 2, name: 'Multiple-Choice' },
                { id: 3, name: 'Fill in the blank' },
              ]"
              label="name"
              :reduce="(item) => item.id"
              placeholder="Select Type"
            >
            </vue-select>
          </div>
        </template>

        <!-- Answers Section -->
        <template #answers[]="{ item }">
          <div v-if="questionSource === 'new' && isTypeSelected" class="col-md-12">
            <div class="answers-section">
              <div class="answers-header">
                <h5 class="answers-title">Answers</h5>
                <button
                  v-if="!maximum"
                  type="button"
                  class="btn-add-answer"
                  @click="addAnswer"
                >
                  + Add Answer
                </button>
              </div>

              <div
                v-for="(answer, index) in newQuestion.answers"
                :key="index"
                class="answer-item"
              >
                <div class="answer-header">
                  <label :for="'answer-' + index" class="answer-label">
                    Answer {{ String.fromCharCode(65 + index) }}
                  </label>
                  <button
                    v-if="index >= 2"
                    type="button"
                    class="btn-remove-answer"
                    @click="deleteAnswer(index)"
                  >
                    ✕
                  </button>
                </div>

                <div class="answer-input-group">
                  <input
                    type="text"
                    class="form-control"
                    :id="'answer-' + index"
                    v-model="newQuestion.answers[index].text"
                    placeholder="Enter answer"
                  />
                  <button
                    type="button"
                    :class="[
                      'btn-submit-risk',
                      newQuestion.answers[index].risk == null
                        ? 'btn-outline'
                        : 'btn-filled',
                    ]"
                    @click="openModal(item, index)"
                  >
                    Submit Risk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- File Attachment -->
        <template #fileAttachment="{ item }">
          <div v-if="questionSource === 'new'" class="col-md-12 mb-3">
            <div class="file-attachment-section">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <label class="form-check-label mb-1" for="fileAttachment">
                    <strong>Allow File Attachment</strong>
                  </label>
                  <p class="file-attachment-description mb-0">
                    Enable This Option To Allow Users To Attach Files When
                    Submitting Their Forms Or Requests.
                  </p>
                </div>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="fileAttachment"
                    v-model="newQuestion.fileAttachment"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Submit Risk Modal -->
  <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content" style="overflow: auto">
      <div class="modal-header">
        <h5 class="modal-title">Submit Risk</h5>
        <button
          @click="closeModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body" v-if="newQuestion.answers[optionIndex] && newQuestion.answers[optionIndex].risk">
        <div class="row mb-3 justify-content-center">
          <div class="col-md-12">
            <label for="type">Subject</label>
            <input
              type="text"
              class="form-control mb-3"
              id="Subject"
              name="Subject"
              v-model="newQuestion.answers[optionIndex].risk.subject"
            />

            <div class="row">
              <div class="col-md-6">
                <label for="type">Current Likelihood</label>
                <select
                  id="likelihood"
                  class="form-control mb-3"
                  v-model="newQuestion.answers[optionIndex].risk.likelihood"
                >
                  <option value="" disabled selected>
                    Select a likelihood
                  </option>
                  <option id="1" value="Remote">Remote</option>
                  <option id="2" value="Unlikely">Unlikely</option>
                  <option id="3" value="Credible">Credible</option>
                  <option id="4" value="Likely">Likely</option>
                  <option id="5" value="Almost Certain">Almost Certain</option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="type">Current Impact</label>
                <select
                  id="impact"
                  class="form-control mb-3"
                  v-model="newQuestion.answers[optionIndex].risk.impact"
                >
                  <option value="" disabled selected>Select an impact</option>
                  <option id="1" value="Low">Low</option>
                  <option id="2" value="Minor">Minor</option>
                  <option id="3" value="Moderate">Moderate</option>
                  <option id="4" value="Major">Major</option>
                  <option id="5" value="Extreme/Catastrophic">
                    Extreme/Catastrophic
                  </option>
                </select>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="owner">Owner</label>
                <select
                  class="form-control"
                  id="owner"
                  name="owner"
                  aria-label="Default select example"
                  v-model="newQuestion.answers[optionIndex].risk.owner"
                >
                  <option
                    v-for="user in userList"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.full_name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label for="assets">Affected Assets</label>
                <vue-select
                  multiple
                  id="assets"
                  name="assets"
                  aria-label="Default select example"
                  v-model="newQuestion.answers[optionIndex].risk.asset"
                  :options="assetList"
                  label="name"
                  :reduce="(item) => item.id"
                >
                </vue-select>
              </div>
            </div>

            <div class="col-md-12 mb-3">
              <label for="tags">Tags</label>
              <vue-select
                multiple
                id="tags"
                name="tags"
                aria-label="Default select example"
                v-model="newQuestion.tag"
                :options="tagList"
                label="name"
                :reduce="(item) => item.id"
              >
              </vue-select>
            </div>

            <div class="row">
              <div class="col-md-4">
                <label for="regulator">Regulator</label>
                <select
                  class="form-select"
                  id="regulator"
                  aria-label="Default select example"
                  v-model="newQuestion.answers[optionIndex].risk.regulator"
                  @change="onRiskRegulatorChange"
                >
                  <option
                    v-for="regulator in regulatorList"
                    :key="regulator.id"
                    :value="regulator.id"
                  >
                    {{ regulator.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label for="framework">Framework</label>
                <select
                  class="form-select"
                  id="framework"
                  aria-label="Default select example"
                  v-model="newQuestion.answers[optionIndex].risk.framework"
                  :disabled="isRiskFrameworkDisabled"
                  @change="onRiskFrameworkChange"
                >
                  <option
                    v-for="framework in riskFilteredFrameworks"
                    :key="framework.id"
                    :value="framework.id"
                  >
                    {{ framework.title }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label for="control">Control</label>
                <select
                  class="form-select"
                  id="control"
                  aria-label="Default select example"
                  v-model="newQuestion.answers[optionIndex].risk.control"
                  :disabled="isRiskControlDisabled"
                >
                  <option
                    v-for="control in riskFilteredControls"
                    :key="control.id"
                    :value="control.id"
                  >
                    {{ control.long_name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" type="button" @click="closeModal">
            Cancel
          </button>
          <button class="btn btn-save" type="submit" @click="closeModal">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import question from "@/API/Question/Question";
import assessmentTemplate from "@/API/AssessmentTemplate/AssessmentTemplate";
import regulatorApi from "@/API/Regulator/Regulator";
import userApi from "@/API/User/User";
import assetApi from "@/API/Asset/Asset";
import tagApi from "@/API/tag/tag";
import frameworkApi from "@/API/Frameworks/Frameworks";
import controlApi from "@/API/Control/Control";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    "vue-select": VueSelect,
    ckeditor: Ckeditor,
  },

  setup() {
    const api = new question();
    const apiAssessmentTemplate = new assessmentTemplate();
    const regulator = new regulatorApi();
    const user = new userApi();
    const asset = new assetApi();
    const tag = new tagApi();
    const framework = new frameworkApi();
    const control = new controlApi();
    const template_id = useRouter().currentRoute.value.params.id; // useRouter() is a Composition API function provided by Vue Router to access the router instance.
    console.log("Template IDdddddd:", template_id);
    const apiParams = {
      filter: "assessment_template_ids|" + template_id + "|=",
    };
    const tableColumns = [];
    const fromFields = [];
    const questionList = new question();

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      questionList,
      template_id,
      apiAssessmentTemplate,
      regulator,
      framework,
      control,
      user,
      asset,
      tag,
    };
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
    isTypeSelected() {
      return this.newQuestion.type === 1 || this.newQuestion.type === 2;
    },
    isFillInBlank() {
      return this.newQuestion.type === 3;
    },
  },

  async mounted() {
    await this.fetchTemplateName();
    await this.fetchQuestions();
    await this.fetchRegulators();
    await this.fetchFrameworks();
    await this.fetchControls();
    await this.fetchUsers();
    await this.fetchAssets();
    await this.fetchTags();
    // this.updateStyles();
  },

  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      maximum: false,
      optionIndex: 0,
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: { id: this.template_id }, // Data object to store the currently selected item for editing or new item
      questionSource: "",
      newQuestion: {
        question: "",
        type: null,
        user: null,
        regulator: null,
        framework: null,
        control: null,
        answers: [
          {
            text: "",
            risk: null,
          },
        ],
        fileAttachment: false,
      },
      filteredFrameworks: [],
      riskFilteredFrameworks: [],
      isFrameworkDisabled: true,
      isControlDisabled: true,
      isRiskFrameworkDisabled: true,
      isRiskControlDisabled: true,
      filteredControls: [],
      riskFilteredControls: [],
      userList: [],
      assetList: [],
      tagList: [],
      regulatorList: [],
      frameworkList: [],
      controlList: [],
      isModalOpen: false,
      availableQuestions: [],
      users: [],
      styleElement: false,
      templateName: "",
    };
  },

  watch: {
    // "$route.params.id": {
    //   handler(newId) {
    //     this.updateStyles();
    //   },
    //   immediate: true,
    // },
    "newQuestion.regulator": function () {
      this.isFrameworkDisabled = !this.newQuestion.regulator;
      this.newQuestion.framework = null;
      this.newQuestion.control = null;
      this.isControlDisabled = true;
      this.filteredFrameworks = this.frameworkList.filter(
        (framework) =>
          framework.regulator_id &&
          framework.regulator_id === this.newQuestion.regulator
      );
    },
    "newQuestion.framework": function () {
      this.isControlDisabled = !this.newQuestion.framework;
      this.newQuestion.control = null;
      this.filteredControls = this.controlList.filter(
        (control) => control.framework_id === this.newQuestion.framework
      );
    },
    "newQuestion.type": function (newType) {
      if (newType === 1 || newType === 2) {
        if (this.newQuestion?.answers[0].text == "") {
          this.newQuestion.answers = [
            { text: "", risk: null },
            { text: "", risk: null },
          ];
        }
      } else if (newType === 3) {
        if (!this.newQuestion.answers || this.newQuestion.answers == []) {
          this.newQuestion.answers = [{ text: "", risk: null }];
        }
      }
    },
  },

  created() {
    this.templateId = this.$route.params.id;
    console.log("Template ID:", this.templateId);

    this.tableColumns = [
      {
        id: "question",
        title: this.$t("question.question"),
        data: "question",
      },
      {
        id: "type",
        title: this.$t("question.type"),
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "hasFileAttachment",
        title: this.$t("question.hasFileAttachment"),
        data: "fileAttachment",
        defaultContent: "N/A",
      },
      {
        id: "hasRisk",
        title: this.$t("question.hasRisk"),
        data: "answers",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "question_source",
        label: "Select Question Source",
        type: "select",
        rules: "required",
        description: "Choose how to add questions",
        col: 12,
        hidden: false,
      },
      {
        name: "question_ids",
        label: this.$t("Questions"),
        type: "options", // Dropdown/select field
        options: [],
        multiple: true,
        optionLabel: "question",
        col: 12,
        rules: "", // Validation: required selection
        description: "Select questions to assign to the template",
        hidden: true,
      },
      {
        name: "question",
        label: this.$t("Question"),
        type: "textarea",
        rules: "",
        description: "Please enter your question.",
        col: 12,
        hidden: true,
      },
      {
        name: "regulator_id",
        label: this.$t("Regulator"),
        type: "options",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: "Select a regulator",
        hidden: true,
      },
      {
        name: "framework_id",
        label: this.$t("Framework"),
        type: "options",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: "",
        hidden: true,
      },
      {
        name: "control_id",
        label: this.$t("Control"),
        type: "options",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: "",
        hidden: true,
      },
      {
        type: "options",
        name: "type",
        label: this.$t("Question Type"),
        options: [
          { id: 1, name: "Single-Choice" },
          { id: 2, name: "Multiple-Choice" },
          { id: 3, name: "Fill in the blank" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "",
        description: "Please select question type.",
        hidden: true,
      },
      {
        type: "hidden",
        name: "answers[]",
        label: this.$t(""),
        rules: "",
        col: 12,
      },
      {
        name: "fileAttachment",
        label: this.$t("File Attachment"),
        type: "checkbox",
        rules: "",
        col: 12,
        description: "Allow file attachments for this question",
        hidden: true,
      },
    ];
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    async fetchTemplateName() {
      const response = await this.apiAssessmentTemplate.show(this.template_id);
      this.templateName = response.name;
    },

    onQuestionSourceChange() {
      // Hide all fields first
      this.fromFields.forEach((field) => {
        if (field.name !== "question_source") {
          field.hidden = true;
        }
      });

      // Reset newQuestion when switching source
      if (this.questionSource === "new") {
        this.newQuestion = {
          question: "",
          type: null,
          user: null,
          regulator: null,
          framework: null,
          control: null,
          answers: [
            {
              text: "",
              risk: null,
            },
          ],
          fileAttachment: false,
        };

        // Show fields for creating new question
        const fieldsToShow = ["question", "regulator_id", "framework_id", "control_id", "type", "answers[]", "fileAttachment"];
        this.fromFields.forEach((field) => {
          if (fieldsToShow.includes(field.name)) {
            field.hidden = false;
          }
        });
      } else if (this.questionSource === "bank") {
        this.newItem.question_ids = [];

        // Show field for selecting from question bank
        const questionIdsField = this.fromFields.find((field) => field.name === "question_ids");
        if (questionIdsField) {
          questionIdsField.hidden = false;
        }
      }
    },

    deleteAnswer(index) {
      if (index >= 2) {
        this.newQuestion.answers.splice(index, 1);
        this.maximum = false;
      } else {
        console.warn("The first two answer fields cannot be deleted.");
      }
    },

    addAnswer() {
      if (this.newQuestion.answers.length < 4) {
        this.maximum = false;
        this.newQuestion.answers.push({
          text: "",
          risk: null,
        });
      } else {
        console.warn("Maximum of 4 answer fields allowed.");
      }

      if (this.newQuestion.answers.length == 4) {
        this.maximum = true;
      }
    },

    openModal(selectedRow, index) {
      this.optionIndex = index;
      if (this.newQuestion.answers[index].risk == null) {
        this.newQuestion.answers[index].risk = {
          optionIndex: this.optionIndex,
          subject: "",
          likelihood: "",
          impact: "",
          owner: "",
          asset: "",
          tags: "",
          regulator: null,
          framework: null,
          control: null,
        };
      }

      this.isRiskFrameworkDisabled =
        !this.newQuestion.answers[this.optionIndex].risk.regulator;
      this.isRiskControlDisabled =
        !this.newQuestion.answers[this.optionIndex].risk.framework;

      this.riskFilteredFrameworks = this.frameworkList.filter(
        (framework) =>
          framework.regulator_id &&
          framework.regulator_id ===
            this.newQuestion.answers[this.optionIndex].risk.regulator
      );

      this.riskFilteredControls = this.controlList.filter(
        (control) =>
          control.framework_id ===
          this.newQuestion.answers[this.optionIndex].risk.framework
      );

      this.fetchUsers();
      this.isModalOpen = true;
    },

    async closeModal() {
      this.isModalOpen = false;
    },

    onRiskRegulatorChange() {
      this.isRiskFrameworkDisabled =
        !this.newQuestion.answers[this.optionIndex].risk.regulator;
      this.newQuestion.answers[this.optionIndex].risk.framework = null;
      this.newQuestion.answers[this.optionIndex].risk.control = null;
      this.isRiskControlDisabled = true;
      this.riskFilteredFrameworks = this.frameworkList.filter(
        (framework) =>
          framework.regulator_id &&
          framework.regulator_id ===
            this.newQuestion.answers[this.optionIndex].risk.regulator
      );
    },

    onRiskFrameworkChange() {
      this.isRiskControlDisabled =
        !this.newQuestion.answers[this.optionIndex].risk.framework;
      this.newQuestion.answers[this.optionIndex].risk.control = null;
      this.riskFilteredControls = this.controlList.filter(
        (control) =>
          control.framework_id ===
          this.newQuestion.answers[this.optionIndex].risk.framework
      );
    },

    async fetchRegulators() {
      this.regulatorList = await this.regulator.getAll({ select: "id|name" });
      this.fromFields.find((field) => field.name === "regulator_id").options =
        this.regulatorList;
    },

    async fetchFrameworks() {
      const response = await this.framework.getAll({
        select: "id|title|regulator_id",
      });
      this.frameworkList = response;
    },

    async fetchControls() {
      const response = await this.control.getAll({
        select: "id|long_name|framework_id",
      });
      this.controlList = response;
    },

    async fetchUsers() {
      this.userList = await this.user.getAll({ select: "id|full_name" });
    },

    async fetchAssets() {
      this.assetList = await this.asset.getAll({ select: "id|name" });
    },

    async fetchTags() {
      this.tagList = await this.tag.getAll({ select: "id|name" });
    },

    // updateStyles() {
    //   // Remove existing style element if it exists
    //   if (this.styleElement) {
    //     document.head.removeChild(this.styleElement);
    //     this.styleElement = null;
    //   }

    //   const hasTemplateId =
    //     this.$route.params.id && this.$route.path.includes("add-questions/");

    //   if (hasTemplateId) {
    //     const styles = `
    //       .icofont-trash {
    //         display: none;
    //       }
    //       .icofont-fountain-pen {
    //         display: none;
    //       }
    //         .delete{
    //         pointer-events: none !important;
    //         }
    //     `;

    //     this.styleElement = document.createElement("style");
    //     this.styleElement.textContent = styles;
    //     document.head.appendChild(this.styleElement);
    //   }
    // },

    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true; // Show the form
      this.questionSource = "";
      this.newItem = { id: this.template_id };
      this.newQuestion = {
        question: "",
        type: null,
        user: null,
        regulator: null,
        framework: null,
        control: null,
        answers: [
          {
            text: "",
            risk: null,
          },
        ],
        fileAttachment: false,
      };
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = { id: this.template_id };
      this.questionSource = "";
      this.newQuestion = {
        question: "",
        type: null,
        user: null,
        regulator: null,
        framework: null,
        control: null,
        answers: [
          {
            text: "",
            risk: null,
          },
        ],
        fileAttachment: false,
      };
      window.location.reload(); // Reload the page
    },

    // Custom submit handler
    async handleCustomSubmit(formData, values) {
      try {
        if (this.questionSource === "new") {
          // Create new question first
          console.log("Creating new question...");

          // Prepare question data
          const questionData = {
            question: this.newQuestion.question,
            type: this.newQuestion.type,
            user: this.newQuestion.user,
            regulator_id: this.newQuestion.regulator,
            framework_id: this.newQuestion.framework,
            control_id: this.newQuestion.control,
            fileAttachment: this.newQuestion.fileAttachment,
            answers: this.newQuestion.answers.map((answer) => ({
              text: answer.text,
              risk: answer.risk
                ? {
                    subject: answer.risk.subject,
                    likelihood: answer.risk.likelihood,
                    impact: answer.risk.impact,
                    owner: answer.risk.owner,
                    asset: answer.risk.asset,
                    tags: answer.risk.tags,
                    regulator: answer.risk.regulator,
                    framework: answer.risk.framework,
                    control: answer.risk.control,
                  }
                : null,
            })),
          };

          console.log("Question data:", questionData);

          // Create question using question API
          const questionResponse = await this.api.from(questionData, true, true);
          console.log("Question created:", questionResponse);

          if (questionResponse.data.errors) {
            // Swal.fire({
            //   icon: "error",
            //   title: "Error",
            //   text: "Failed to create question: " + JSON.stringify(questionResponse.data.errors),
            // });
            return;
          }

          // Get the created question ID
          const createdQuestionId = questionResponse.data.data.id;
          console.log("Created question ID:", createdQuestionId);

          // Now update the template with the new question ID
          const templateData = {
            id: this.template_id,
            question_ids: [createdQuestionId],
          };

          console.log("Updating template with question ID:", templateData);

          const templateResponse = await this.apiAssessmentTemplate.from(
            templateData,
            true,
            true
          );
          console.log("Template updated:", templateResponse);

          if (templateResponse.data.errors) {
            // Swal.fire({
            //   icon: "error",
            //   title: "Error",
            //   text: "Question created but failed to link to template: " + JSON.stringify(templateResponse.data.errors),
            // });
            return;
          }

          // Swal.fire({
          //   icon: "success",
          //   title: "Success",
          //   text: "Question created and linked to template successfully!",
          // });

          this.closeForm();
        } else if (this.questionSource === "bank") {
          // Just update the template with selected question IDs
          console.log("Linking questions from bank...");

          const templateData = {
            id: this.template_id,
            question_ids: this.newItem.question_ids,
          };

          console.log("Updating template:", templateData);

          const templateResponse = await this.apiAssessmentTemplate.from(
            templateData,
            true,
            true
          );
          console.log("Template updated:", templateResponse);

          if (templateResponse.data.errors) {
            // Swal.fire({
            //   icon: "error",
            //   title: "Error",
            //   text: "Failed to link questions: " + JSON.stringify(templateResponse.data.errors),
            // });
            return;
          }

          // Swal.fire({
          //   icon: "success",
          //   title: "Success",
          //   text: "Questions linked to template successfully!",
          // });

          this.closeForm();
        }
      } catch (error) {
        console.error("Submit error:", error);
        // Swal.fire({
        //   icon: "error",
        //   title: "Error",
        //   text: "An error occurred: " + error.message,
        // });
      }
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    async fetchQuestions() {
      const response = await this.questionList.getAll({
        select: "id|question|assessment_template_ids",
      });
      console.log("Fetched questions:", response); // Check the API response

      const templateId = this.$route.params.id;
      console.log(this.templateId); // Check the templateId

      // Helper function to strip HTML tags
      const stripHtmlTags = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
      };

      // Filter questions that do not have the current `template_id` in their `assessment_template_ids` array
      const filteredQuestions = response.filter((question) => {
        return (
          !question.assessment_template_ids ||
          !question.assessment_template_ids.includes(this.templateId)
        );
      });

      // Create a map of question IDs to cleaned question text
      this.questions = response.reduce((map, question) => {
        map[question.id] = stripHtmlTags(question.question);
        return map;
      }, {});

      // Store available questions with cleaned text
      this.availableQuestions = filteredQuestions.map((question) => ({
        ...question,
        question: stripHtmlTags(question.question),
      }));

      // Update dropdown options with filtered questions, using cleaned text
      this.fromFields.find((field) => field.name === "question_ids").options =
        this.availableQuestions;
    },

    async confirmUnassign(id) {
      await Swal.fire({
        title: "Are you sure you want to unlink this question ?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: "Yes, delete it!",
      });
      this.unassign(id);
    },

    async unassign(questionId) {
      const response = await this.api.removeQuestionFromTemplate(
        questionId,
        this.template_id
      );
      this.$refs.table.refreshTable();
      console.log("Question removed successfully", response);

      if (response.status === "success") {
        this.$notify({
          type: "success",
          text: "Question removed successfully",
        });
        window.location.reload(); // Reload the page
      }
    },
  },

  beforeUnmount() {
    // Clean up styles when component is destroyed
    if (this.styleElement) {
      document.head.removeChild(this.styleElement);
    }
  },
};
</script>

<style scoped>
/* Scoped styles for the component */

/* Template Name Header */
.template-name-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #6e3894 0%, #8b4fb8 100%);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.2);
}

.template-name-title {
  color: #ffffff;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

/* Form Labels */
.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.text-danger {
  color: #ef4444;
}

/* Answers Section */
.answers-section {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.answers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.answers-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-add-answer {
  background-color: #6e3894;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 4px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* Answer Item */
.answer-item {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
}

.answer-item:last-child {
  margin-bottom: 0;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.answer-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.btn-remove-answer {
  background-color: transparent;
  color: #000000;
  border: none;
  font-size: 15px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.answer-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.answer-input-group .form-control {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.btn-submit-risk {
  padding: 5px 15px;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  border: 1px solid;
}

.btn-submit-risk.btn-outline {
  background-color: white;
  color: #6e3894;
  border-color: #6e3894;
}

.btn-submit-risk.btn-outline:hover {
  background-color: #f5f3ff;
}

.btn-submit-risk.btn-filled {
  background-color: #6e3894;
  color: white;
  border-color: #6e3894;
}

.btn-submit-risk.btn-filled:hover {
  background-color: #6d28d9;
}

/* File Attachment Section */
.file-attachment-section {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
}

.form-check {
  margin-bottom: 8px;
  background-color: #f8f9fa;
}

.form-check-input {
  width: 3rem;
  height: 1.5rem;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check-label {
  font-size: 1rem;
  color: #212529;
}

.file-attachment-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Modal Overlay */
.modal-overlay {
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

/* Modal Content */
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 75%;
  height: 75%;
  position: relative;
  animation: fadeIn 0.3s ease;
  overflow: hidden !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #000;
}

.btn-close::before {
  content: "×";
  font-size: 30px;
}

/* Modal Body */
.modal-body {
  flex: 1;
  /* overflow: auto; */
  margin-bottom: 20px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-save {
  background-color: #6e3894;
  color: #ffffff;
  border: 1px solid #6e3894;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background-color: #5c2d7a;
  border-color: #5c2d7a;
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

.vs__selected {
  margin: 5px !important;
}

.ck-editor__editable {
  min-height: 200px !important;
}
.modal-header {
    justify-content: space-between;
}
.action-list-item{
  display: flex;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .action-list-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row{
text-align: end;
}
</style>
