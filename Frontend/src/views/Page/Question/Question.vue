<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'ASSESSMENTS MGMT'"
    :subPage="'ASSESSMENTS'"
    :titlePage="'Questions Bank'"
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
        :apiParams="{}"
        :editItem="editItem"
        :openForm="openForm"
      >
        <template #type="{ item }">
          <span
            v-if="item.type == '1'"
            class="badge bg-info text-white m-1"
            style="
              padding: 8px 20px;
              border-radius: 30px;
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
              background-color: #d9d9d9 !important;
              color: #000000 !important;
            "
          >
            Fill-in Blank
          </span>
        </template>
        <template #hasFileAttachment="{ item }">
          <span
            v-if="item.fileAttachment == true"
            style="color: green; font-weight: bold"
          >
            ✔
          </span>
          <i v-else class="fas fa-times text-danger"></i>
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
          <i v-else class="fas fa-times text-danger"></i>
        </template>

        <template #question.hasAnswers="{ item }">
          <span
            v-if="item.answers && item.answers.length"
            style="color: #255f0b; font-weight: bold"
          >
            ✔
          </span>
          <i v-else class="fas fa-times text-danger"></i>
        </template>
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>
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
        <!-- Question Field (Full Width) -->
        <template #question="{ item }">
          <div class="col-md-12 mb-3">
            <label for="question" class="form-label">
              Question <span class="text-danger">*</span>
            </label>
            <ckeditor
              :editor="editor"
              class="form-control"
              id="question"
              rows="3"
              v-model="newItem.question"
              placeholder="Enter your question"
              :config="editorConfig"
            ></ckeditor>
          </div>
        </template>

        <!-- Row 1: Regulator and Framework -->
        <template #regulator_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="regulator" class="form-label">
              Regulator <span class="text-danger">*</span>
            </label>
            <LazySelectField
              name="regulator"
              v-model="newItem.regulator"
              :options="regulatorList"
              option-label="name"
              option-value="id"
              placeholder="Choose a regulator"
            />
          </div>
        </template>

        <template #framework_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="framework" class="form-label">
              Framework <span class="text-danger">*</span>
            </label>
            <LazySelectField
              name="framework"
              v-model="newItem.framework"
              :disabled="isFrameworkDisabled"
              :options="filteredFrameworks"
              option-label="title"
              option-value="id"
              placeholder="Choose a framework"
            />
          </div>
        </template>

        <!-- Row 2: Control and Question Type -->
        <template #control_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="control" class="form-label">
              Control <span class="text-danger">*</span>
            </label>
            <LazySelectField
              name="control"
              v-model="newItem.control"
              :disabled="isControlDisabled"
              :options="filteredControls"
              option-label="long_name"
              option-value="id"
              placeholder="Choose a control"
            />
          </div>
        </template>

        <template #type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="type" class="form-label">
              Question Type <span class="text-danger">*</span>
            </label>
            <LazySelectField
              name="type"
              v-model="newItem.type"
              :options="[
                { id: 1, name: 'Single-Choice' },
                { id: 2, name: 'Multiple-Choice' },
                { id: 3, name: 'Fill in the blank' },
              ]"
              option-label="name"
              option-value="id"
              placeholder="Select Type"
            />
          </div>
        </template>

        <!-- Answers Section -->
        <template #answers[]="{ item }">
          <div v-show="isTypeSelected" class="col-md-12">
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
                v-for="(answer, index) in newItem.answers"
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
                    v-model="newItem.answers[index].text"
                    placeholder="Enter answer"
                  />
                  <button
                    type="button"
                    :class="[
                      'btn-submit-risk',
                      newItem.answers[index].risk == null
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

        <template #fileAttachment="{ item }">
          <div class="col-md-12 mb-3">
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
                    v-model="newItem.fileAttachment"
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
      <div class="modal-body">
        <div class="row mb-3 justify-content-center">
          <div class="col-md-12">
            <label for="type">Subject</label>
            <input
              type="text"
              class="form-control mb-3"
              id="Subject"
              name="Subject"
              v-model="newItem.answers[optionIndex].risk.subject"
            />

            <div class="row">
              <div class="col-md-6">
                <label for="type">Current Likelihood</label>
                <LazySelectField
                  name="likelihood"
                  v-model="newItem.answers[optionIndex].risk.likelihood"
                  :options="[
                    { id: 'Remote', name: 'Remote' },
                    { id: 'Unlikely', name: 'Unlikely' },
                    { id: 'Credible', name: 'Credible' },
                    { id: 'Likely', name: 'Likely' },
                    { id: 'Almost Certain', name: 'Almost Certain' },
                  ]"
                  option-label="name"
                  option-value="id"
                  placeholder="Select a likelihood"
                  class="mb-3"
                />
              </div>

              <div class="col-md-6">
                <label for="type">Current Impact</label>
                <LazySelectField
                  name="impact"
                  v-model="newItem.answers[optionIndex].risk.impact"
                  :options="[
                    { id: 'Low', name: 'Low' },
                    { id: 'Minor', name: 'Minor' },
                    { id: 'Moderate', name: 'Moderate' },
                    { id: 'Major', name: 'Major' },
                    { id: 'Extreme/Catastrophic', name: 'Extreme/Catastrophic' },
                  ]"
                  option-label="name"
                  option-value="id"
                  placeholder="Select an impact"
                  class="mb-3"
                />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-12 mb-3">
                <label for="assets">Affected Assets</label>
                <LazySelectField
                  name="assets"
                  v-model="newItem.answers[optionIndex].risk.asset"
                  :options="assetList"
                  option-label="name"
                  option-value="id"
                  multiple
                  placeholder="Select assets"
                />
              </div>

                            <div class="col-md-12">
                <label for="owner">Owner</label>
                <UserSelect
                  name="owner"
                  v-model="newItem.answers[optionIndex].risk.owner"
                  :options="userList"
                  option-label="full_name"
                  option-value="id"
                  placeholder="Select an owner"
                >
                </UserSelect>
              </div>
            </div>

            <div class="col-md-12 mb-3">
              <label for="tags">Tags</label>
              <LazySelectField
                name="tags"
                v-model="newItem.tag"
                :options="tagList"
                option-label="name"
                option-value="id"
                multiple
                placeholder="Select tags"
              />
            </div>

            <div class="row">
              <div class="col-md-4">
                <label for="regulator">Regulator</label>
                <LazySelectField
                  name="risk_regulator"
                  v-model="newItem.answers[optionIndex].risk.regulator"
                  :options="regulatorList"
                  option-label="name"
                  option-value="id"
                  placeholder="Select a regulator"
                  :on-update="onRiskRegulatorChange"
                />
              </div>

              <div class="col-md-4">
                <label for="framework">Framework</label>
                <LazySelectField
                  name="risk_framework"
                  v-model="newItem.answers[optionIndex].risk.framework"
                  :disabled="isRiskFrameworkDisabled"
                  :options="riskFilteredFrameworks"
                  option-label="title"
                  option-value="id"
                  placeholder="Select a framework"
                  :on-update="onRiskFrameworkChange"
                />
              </div>

              <div class="col-md-4">
                <label for="control">Control</label>
                <LazySelectField
                  name="risk_control"
                  v-model="newItem.answers[optionIndex].risk.control"
                  :disabled="isRiskControlDisabled"
                  :options="riskFilteredControls"
                  option-label="long_name"
                  option-value="id"
                  placeholder="Select a control"
                />
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
import question from "@/API/Question/Question";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import regulatorApi from "@/API/Regulator/Regulator";
import userApi from "@/API/User/User";
import assetApi from "@/API/Asset/Asset";
import tagApi from "@/API/tag/tag";
import frameworkApi from "@/API/Frameworks/Frameworks";
import controlApi from "@/API/Control/Control";
import VueSelect from "vue-select";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import LazySelectField from "@/components/LazySelectField.vue";
import UserSelect from "@/components/UserSelect.vue";


export default {
  components: {
    MainPage,
    Form,
    DataTable,
    "vue-select": VueSelect,
    ckeditor: Ckeditor,
    LazySelectField,
    UserSelect
  },

  setup() {
    const api = new question();
    const regulator = new regulatorApi();
    const user = new userApi();
    const asset = new assetApi();
    const tag = new tagApi();
    const framework = new frameworkApi();
    const control = new controlApi();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      regulator,
      framework,
      control,
      user,
      asset,
      tag,
    };
  },

  async mounted() {
    await this.fetchRegulators();
    await this.fetchFrameworks();
    await this.fetchControls();
    await this.fetchUsers();
    await this.fetchAssets();
    await this.fetchTags();
  },

  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      icon_path: null,
      maximum: false,
      optionIndex: 0,
      isFlipped: false,
      isReadonly: false,
      newItem: {
        type: null,
        user: null,
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
    };
  },

  created() {
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

    this.updateAssessmentVisibility(null);

    this.fromFields = [
      {
        name: "question",
        label: this.$t("Question"),
        type: "textarea",
        rules: "required",
        description: "Please enter your question.",
        col: 12,
      },
      {
        name: "regulator_id",
        label: this.$t("Regulator"),
        type: "options",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select a regulator",
      },
      {
        name: "framework_id",
        label: this.$t("Framework"),
        type: "options",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "",
      },
      {
        name: "control_id",
        label: this.$t("Control"),
        type: "options",
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "",
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
        rules: "required",
        description: "Please select question type.",
      },
      {
        name: "answers[]",
        label: this.$t("A"),
        type: "text",
        rules: "required",
        description: "Please enter answer.",
        col: 12,
      },
      {
        name: "fileAttachment",
        label: this.$t("File Attachment"),
        type: "checkbox",
        rules: "required",
        col: 12,
        description: "Allow file attachments for this question",
      },
    ];
  },

  methods: {
    deleteAnswer(index) {
      if (index >= 2) {
        this.newItem.answers.splice(index, 1);
        this.maximum = false;
      } else {
        console.warn("The first two answer fields cannot be deleted.");
      }
    },

    onRiskRegulatorChange() {
      this.isRiskFrameworkDisabled =
        !this.newItem.answers[this.optionIndex].risk.regulator;
      this.newItem.answers[this.optionIndex].risk.framework = null;
      this.newItem.answers[this.optionIndex].risk.control = null;
      this.isRiskControlDisabled = true;
      this.riskFilteredFrameworks = this.frameworkList.filter(
        (framework) =>
          framework.regulator_id &&
          framework.regulator_id ===
            this.newItem.answers[this.optionIndex].risk.regulator
      );
    },

    onRiskFrameworkChange() {
      this.isRiskControlDisabled =
        !this.newItem.answers[this.optionIndex].risk.framework;
      this.newItem.answers[this.optionIndex].risk.control = null;
      this.riskFilteredControls = this.controlList.filter(
        (control) =>
          control.framework_id ===
          this.newItem.answers[this.optionIndex].risk.framework
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

    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {
        type: null,
        user: null,
        answers: [
          {
            text: "",
            risk: null,
          },
        ],
        fileAttachment: false,
      };
    },

    editItem(data) {
      this.newItem = { ...data };

      this.isFrameworkDisabled = !this.newItem.regulator;
      this.filteredFrameworks = this.frameworkList.filter(
        (framework) =>
          framework.regulator_id &&
          framework.regulator_id === this.newItem.regulator
      );

      this.filteredControls = this.controlList.filter(
        (control) => control.framework_id === this.newItem.framework
      );

      if (!this.newItem.answers || !Array.isArray(this.newItem.answers)) {
        this.newItem.answers = [
          { text: "", risk: null, compliance: false, maturity: false },
        ];
      }

      this.newItem.answers = this.newItem.answers.map((answer) => {
        if (!answer.risk) {
          answer.risk = {
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
        return answer;
      });

      this.isFlipped = true;
    },

    openModal(selectedRow, index) {
      this.optionIndex = index;
      if (this.newItem.answers[index].risk == null) {
        this.newItem.answers[index].risk = {
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
        !this.newItem.answers[this.optionIndex].risk.regulator;
      this.isRiskControlDisabled =
        !this.newItem.answers[this.optionIndex].risk.framework;

      this.riskFilteredFrameworks = this.frameworkList.filter(
        (framework) =>
          framework.regulator_id &&
          framework.regulator_id ===
            this.newItem.answers[this.optionIndex].risk.regulator
      );

      this.riskFilteredControls = this.controlList.filter(
        (control) =>
          control.framework_id ===
          this.newItem.answers[this.optionIndex].risk.framework
      );

      this.fetchUsers();
      this.selectedAction = "";
      this.selectedExceptionId = selectedRow.id;
      this.isModalOpen = true;
    },

    async closeModal() {
      this.isModalOpen = false;
    },

    addAnswer() {
      if (this.newItem.answers.length < 4) {
        this.maximum = false;
        this.newItem.answers.push({
          text: "",
          risk: null,
          compliance: false,
          maturity: false,
        });
      } else {
        console.warn("Maximum of 4 answer fields allowed.");
      }

      if (this.newItem.answers.length == 4) {
        this.maximum = true;
      }
    },

    updateAssessmentVisibility(newControl) {
      const complianceField = this.fromFields.find(
        (field) => field.name === "compliance"
      );
      const maturityField = this.fromFields.find(
        (field) => field.name === "maturity"
      );

      if (complianceField) {
        complianceField.hidden = !newControl;
      }
      if (maturityField) {
        maturityField.hidden = !newControl;
      }

      if (!newControl) {
        this.newItem.compliance = false;
        this.newItem.maturity = false;
      }
    },
  },

  computed: {
    isTypeSelected() {
      return this.newItem.type === 1 || this.newItem.type === 2;
    },

    isFillInBlank() {
      return this.newItem.type === 3;
    },

    isFrameworkDisabled() {
      return !this.newItem.regulator;
    },
    isControlDisabled() {
      return !this.newItem.framework;
    },
  },

  watch: {
    "newItem.control": {
      handler: function (newControl) {
        this.updateAssessmentVisibility(newControl);
      },
    },
    "newItem.control_id": {
      handler: function (newControl) {
        this.updateAssessmentVisibility(newControl);
      },
    },

    "newItem.regulator": function (newValue) {
      this.isFrameworkDisabled = !this.newItem.regulator;
      this.newItem.framework = null;
      this.newItem.control = null;
      this.isControlDisabled = true;
      this.filteredFrameworks = this.frameworkList.filter(
        (framework) =>
          framework.regulator_id &&
          framework.regulator_id === this.newItem.regulator
      );
    },

    "newItem.framework": function (newValue) {
      this.isControlDisabled = !this.newItem.framework;
      this.newItem.control = null;
      this.filteredControls = this.controlList.filter(
        (control) => control.framework_id === this.newItem.framework
      );
    },

    "newItem.type": function (newType) {
      if (newType === 1 || newType === 2) {
        if (this.newItem?.answers[0].text == "") {
          this.newItem.answers = [
            { text: "", risk: null, compliance: false, maturity: false },
            { text: "", risk: null, compliance: false, maturity: false },
          ];
          this.fromFields.find((field) => field.name === "answers[]").rules =
            "required";
        }
      } else if (newType === 3) {
        if (!this.newItem.answers || this.newItem.answers == []) {
          this.newItem.answers = [
            { text: "", risk: null, compliance: false, maturity: false },
          ];
          this.fromFields.find((field) => field.name === "answers[]").rules =
            "";
        }
      }
    },
  },
};
</script>

<style scoped>
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

/* Custom Vue-Select Styling */
.form-select-custom {
  width: 100%;
}

.form-select-custom :deep(.vs__dropdown-toggle) {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  min-height: 42px;
  /* background-color: #ffffff; */
}

.form-select-custom :deep(.vs__selected) {
  margin: 0;
  padding: 0;
  color: #374151;
}

.form-select-custom :deep(.vs__search) {
  margin: 0;
  padding: 0;
}

.form-select-custom :deep(.vs__search::placeholder) {
  color: #9ca3af;
}

.form-select-custom :deep(.vs__actions) {
  padding: 0 8px;
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

.ck-editor__editable {
  min-height: 200px !important;
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

/* Modal Styling */
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

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 60%;
  height: 70%;
  position: relative;
  animation: fadeIn 0.3s ease;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
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

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0 0;
  margin-top: 20px;
  border-top: none;
}

.btn-cancel {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  /* padding: 10px 24px; */
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
  /* padding: 10px 24px; */
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background-color: #5c2d7a;
  border-color: #5c2d7a;
}

@import "vue-multiselect/dist/vue-multiselect.min.css";

.custom-table th,
td {
  text-align: center !important;
}

</style>
