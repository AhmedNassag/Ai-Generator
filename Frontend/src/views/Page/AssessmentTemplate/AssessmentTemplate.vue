<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'assessmenttemplate.assessmenttemplate'"
    :subPage="'assessmenttemplate.assessmenttemplate'"
    :titlePage="'assessmenttemplate.assessmenttemplate'"
  >
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
        <!-- <template #addAction="{ item }">
          <a
            v-permission:addQuestions
            href="javascript:void(0)"
            class="dropdown-item"
            @click="addQuestions(item.id)"
            title="Add Questions"
            ><i class="icofont icofont-plus"></i> {{ $t("assessmenttemplate.questions") }}</a
          >
        </template> -->

        <template #created_at="{ item }">
          <span>
            {{ formatCreatedDate(item.created_at) }}
          </span>
        </template>

        <template #name="{ item }">
          <span class="badge bg-info text-white m-1">
            <a
              href="javascript:void(0)"
              class="template-name-link"
              @click="addQuestions(item.id)"
            >
              {{ item.name }}
            </a>
          </span>
        </template>

        <template #questionsCount="{ item }">
          <span v-if="item.question_ids && item.question_ids.length">
            {{ item?.question_ids?.length }}
          </span>
          <span v-else class="text-muted" style="font-size: 14px">
            No Questions</span
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
      ></Form>
    </template>
  </main-page>

  <!-- Questions Modal -->
  <div
    v-if="isQuestionsModalOpen"
    class="modal-overlay"
    @click.self="closeQuestionsModal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          Questions for "{{ selectedTemplate?.name }}"
        </h5>
        <button
          @click="closeQuestionsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <DataTable
          v-if="selectedTemplate"
          ref="questionsTable"
          id="questions-modal-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="questionsTableColumns"
          :api="questionApi"
          :apiParams="{
            filter: `assessment_template_ids|${selectedTemplate.id}|=`,
          }"
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
        </DataTable>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-cancel"
          type="button"
          @click="closeQuestionsModal"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import AssessmentTemplate from "@/API/AssessmentTemplate/AssessmentTemplate";
import Question from "@/API/Question/Question";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new AssessmentTemplate();
    const questionApi = new Question();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      questionApi,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  async mounted() {},
  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      isQuestionsModalOpen: false,
      selectedTemplate: null,
      questionsTableColumns: [],
      templateQuestionsColumns: [],
      isAddQuestionsModalOpen: false,
      availableQuestions: [],
      selectedQuestionIds: [],
    };
  },

  created() {
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("assessmenttemplate.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("assessmenttemplate.created_at"),
        data: "created_at",
        defaultContent: "N/A",
      },
      {
        id: "questionsCount",
        title: "Questions",
        data: "questions_count",
        defaultContent: "0",
        sortable: true,
      },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("assessmenttemplate.name"),
        type: "text",
        rules: "required",
        description: "Please enter the template name.",
        col: 12,
      },
    ];

    // Initialize questions table columns
    this.questionsTableColumns = [
      {
        id: "question",
        title: "Question",
        data: "question",
      },
      {
        id: "type",
        title: "Type",
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "hasFileAttachment",
        title: "File Attachment",
        data: "fileAttachment",
        defaultContent: "N/A",
      },
      {
        id: "hasRisk",
        title: "Has Risk",
        data: "answers",
        defaultContent: "N/A",
      },
    ];

    // Initialize template questions columns (for form)
    this.templateQuestionsColumns = [
      {
        id: "question",
        title: "Question",
        data: "question",
      },
      {
        id: "type",
        title: "Type",
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "hasFileAttachment",
        title: "File Attachment",
        data: "fileAttachment",
        defaultContent: "N/A",
      },
      {
        id: "hasRisk",
        title: "Has Risk",
        data: "answers",
        defaultContent: "N/A",
      },
    ];
  },

  methods: {
    formatCreatedDate(date) {
      if (!date) return "N/A";
      return new Date(date)
        .toLocaleString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(",", "");
    },
    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
    },

    async addQuestions(templateId) {
      console.log("Add questions button clicked for");
      console.log(templateId);
      const response = await this.api.show(templateId);
      console.log("responseeeeeeeeeeeeeeee", response);
      this.$router.push({ name: "AddQuestions", params: { id: templateId } });
    },

    openQuestionsModal(template) {
      this.selectedTemplate = template;
      this.isQuestionsModalOpen = true;
    },

    closeQuestionsModal() {
      this.isQuestionsModalOpen = false;
      this.selectedTemplate = null;
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */

/* Template name link styling */
.template-name-link {
  color: #6e3894;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-name-link:hover {
  color: #5c2d7a;
  text-decoration: underline;
}

/* Questions count link styling */
.questions-count-link {
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.questions-count-link:hover .badge {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.questions-count-link .badge {
  transition: all 0.2s ease;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 20px;
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
  max-width: 90%;
  width: 1200px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: fadeIn 0.3s ease;
}

.bg-info {
  background-color: #d0b5e3 !important;
  color: #6e3894 !important;
  font-weight: 700 !important;
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
  overflow: auto;
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
</style>

<style>
.vs__selected {
  background: #44225c !important;
  color: #fff !important;
}

.vs__deselect {
  margin-left: 10px !important;
  fill: #fff !important;
}

.custom-table th,
td {
  text-align: center !important;
}

.custom-table {
  margin-bottom: 10px !important;
}
.d-flex {
  margin-bottom: 10px !important;
}

.form-check-input {
  display: none !important;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .action-list-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row{
text-align: end;
}
</style>
