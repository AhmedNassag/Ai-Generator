<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content training-module-modal">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("course.addnewtrainingmodule") }}</h5>
        <button
          @click="$emit('close')"
          class="btn-close"
          aria-label="Close"
          type="button"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitTrainingModule">
          <!-- Course Information Section -->
          <div class="section-box">
            <!-- <h6 class="section-title">{{ $t("course.courseinformation") }}</h6> -->

            <div class="form-row">
              <div class="form-group col-half">
                <label for="trainingName">
                  {{ $t("course.name") }}<span class="required">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="trainingName"
                  v-model="localTrainingFormData.name"
                  required
                />
              </div>

              <div class="form-group col-half">
                <label for="passing_score">
                  {{ $t("course.passingscore") }} %<span class="required">*</span>
                </label>
                <input
                  type="number"
                  placeholder="1 - 100"
                  min="1"
                  max="100"
                  class="form-control"
                  id="passing_score"
                  v-model="localTrainingFormData.passing_score"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label for="moduleOrder">
                  {{ $t("course.moduleorder") }}<span class="required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  class="form-control"
                  id="moduleOrder"
                  v-model="localTrainingFormData.order"
                  required
                />
              </div>

              <div class="form-group col-half">
                <label for="count_of_entering_exam">
                  {{ $t("course.coursecountofenteringexam") }}<span class="required">*</span>
                </label>
                <input
                  type="number"
                  placeholder="1 - 99"
                  min="1"
                  max="99"
                  class="form-control"
                  id="count_of_entering_exam"
                  v-model="localTrainingFormData.count_of_entering_exam"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="surveys">{{ $t("course.coursesurveys") }}</label>
              <vue-select
                class="form-select"
                id="surveys"
                v-model="localTrainingFormData.survey_id"
                :options="surveytList || []"
                label="name"
                :reduce="(item) => item.id"
                :placeholder="$t('course.selectcoursesurveys')"
              ></vue-select>
            </div>

            <div class="form-group">
              <label for="trainingImage">{{ $t("course.coverimage") }}</label>
              <div class="upload-area-dashed" @click="triggerFileUpload">
                <i class="fa fa-file-upload upload-icon"></i>
                <p class="upload-text">{{ coverImageFileName || $t("course.uploadfile") }}</p>
              </div>
              <input
                type="file"
                class="file-input-hidden"
                id="trainingImage"
                accept=".jpg, image/jpeg"
                ref="fileInput"
                @change="handleCoverImageSelect"
              />
              <div v-if="coverImageFileName || localTrainingFormData.fullCoverImagePath" class="file-preview-training">
                <img
                  v-if="coverImagePreview || localTrainingFormData.fullCoverImagePath"
                  :src="coverImagePreview || localTrainingFormData.fullCoverImagePath"
                  class="img-thumbnail"
                  alt="Course Cover"
                />
                <div class="file-info">
                  <i class="fa fa-file-image"></i>
                  <span class="file-name">{{ coverImageFileName || 'Current cover image' }}</span>
                  <button type="button" class="btn-remove-file" @click="removeCoverImage">
                    <i class="fa fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Training Questions & Statements Section -->
          <div class="section-box">
            <div class="section-header">
              <h6 class="section-title d-flex rtl">{{ $t("course.trainingquestionsstatements") }}</h6>
              <div class="section-actions">
                <button
                  type="button"
                  class="btn-add-item btn-question"
                  @click="addQuestion"
                >
                  <i class="fa fa-plus"></i>
                  {{ $t("course.questions") }}
                </button>
                <button
                  type="button"
                  class="btn-add-item btn-statement"
                  @click="addStatement"
                >
                  <i class="fa fa-plus"></i>
                  {{ $t("course.statement") }}
                </button>
              </div>
            </div>

            <!-- Unified Items List (Questions and Statements in order) -->
            <div
              v-for="(item, index) in items"
              :key="'item-' + index"
              :id="'item-' + index"
              class="item-card"
            >
              <!-- Statement Card -->
              <template v-if="item.type === 'statement'">
                <div class="item-card-header">
                  <h6 class="item-card-title">{{ $t("course.statement") }} {{ getItemNumber(index, 'statement') }}</h6>
                  <button
                    type="button"
                    class="btn-remove-item"
                    @click="removeItem(index)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>

                <div class="item-card-body">
                  <div class="form-row">
                    <div class="form-group col-half">
                      <label>{{ $t("course.statement") }} (EN)<span class="required">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="item.data.statement_en"
                        :placeholder="$t('course.enter_statement_in_english')"
                      />
                    </div>
                    <div class="form-group col-half">
                      <label>{{ $t("course.statement") }} (AR)<span class="required">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="item.data.statement_ar"
                        :placeholder="$t('course.enter_statement_in_arabic')"
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group col-half">
                      <label>{{ $t("course.content") }} (EN)</label>
                      <ckeditor
                        :editor="editor"
                        v-model="item.data.content_en"
                        :config="editorConfig"
                      ></ckeditor>
                    </div>
                    <div class="form-group col-half">
                      <label>{{ $t("course.content") }} (AR)</label>
                      <ckeditor
                        :editor="editor"
                        v-model="item.data.content_ar"
                        :config="editorConfig"
                      ></ckeditor>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>{{ $t("course.additionalcontent") }}<span class="required">*</span></label>
                    <select
                      class="form-control"
                      v-model="item.data.additional_content_type"
                    >
                      <option value="" disabled>{{ $t("course.selecttypeofcontent") }}</option>
                      <option value="Embedded Image">{{ $t("course.embeddedimage") }}</option>
                      <option value="Embedded Video">{{ $t("course.embeddedvideo") }}</option>
                      <option value="Embedded PDF">{{ $t("course.embeddedpdf") }}</option>
                    </select>
                  </div>

                  <div v-if="item.data.additional_content_type" class="form-row">
                    <div class="form-group col-half">
                      <label>{{ getContentTypeLabel(item.data.additional_content_type) }} (EN)</label>
                      <div class="upload-area-dashed small" @click="triggerStatementFileUpload('en', index)">
                        <i class="fa fa-file-upload upload-icon-small"></i>
                        <p class="upload-text-small">{{ $t("course.uploadfile") }}</p>
                      </div>
                      <input
                        type="file"
                        class="file-input-hidden"
                        :id="'fileEnglish' + index"
                        :accept="getAcceptType(item.data.additional_content_type)"
                        :ref="'fileEnglish' + index"
                        @change="handleStatementFileSelect('en', index, $event)"
                      />
                      <div v-if="item.data.file_en" class="file-preview-text">
                        {{ getFilename(item.data.file_en) }}
                      </div>
                    </div>
                    <div class="form-group col-half">
                      <label>{{ getContentTypeLabel(item.data.additional_content_type) }} (AR)</label>
                      <div class="upload-area-dashed small" @click="triggerStatementFileUpload('ar', index)">
                        <i class="fa fa-file-upload upload-icon-small"></i>
                        <p class="upload-text-small">{{ $t("course.uploadfile") }}</p>
                      </div>
                      <input
                        type="file"
                        class="file-input-hidden"
                        :id="'fileArabic' + index"
                        :accept="getAcceptType(item.data.additional_content_type)"
                        :ref="'fileArabic' + index"
                        @change="handleStatementFileSelect('ar', index, $event)"
                      />
                      <div v-if="item.data.file_ar" class="file-preview-text">
                        {{ getFilename(item.data.file_ar) }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Question Card -->
              <template v-else-if="item.type === 'question'">
                <div class="item-card-header">
                  <h6 class="item-card-title">{{ $t("course.question") }} {{ getItemNumber(index, 'question') }}</h6>
                  <button
                    type="button"
                    class="btn-remove-item"
                    @click="removeItem(index)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>

                <div class="item-card-body">
                  <div class="form-row">
                    <div class="form-group col-half">
                      <label>{{ $t("course.question") }} (EN)<span class="required">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="item.data.english"
                        :placeholder="$t('course.enter_question_in_english')"
                      />
                    </div>
                    <div class="form-group col-half">
                      <label>{{ $t("course.question") }} (AR)<span class="required">*</span></label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="item.data.arabic"
                        :placeholder="$t('course.enter_question_in_arabic')"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>{{ $t("course.questiontype") }}</label>
                    <select
                      class="form-control"
                      v-model="item.data.questionType"
                      @change="handleQuestionTypeChange(index)"
                    >
                      <option value="multi_choice">{{ $t("course.singlechoice") }}</option>
                      <option value="true_or_false">{{ $t("course.trueorfalse") }}</option>
                    </select>
                  </div>

                  <!-- True/False Section -->
                  <div v-if="item.data.questionType === 'true_or_false'" class="form-group">
                    <label>{{ $t("course.correctanswer") }}</label>
                    <select class="form-control" v-model="item.data.correctAnswer">
                      <option value="true">{{ $t("course.true") }}</option>
                      <option value="false">{{ $t("course.false") }}</option>
                    </select>
                  </div>

                  <!-- Multi-Choice Section -->
                  <div v-if="item.data.questionType === 'multi_choice'" class="options-section">
                    <div class="options-header">
                      <label>{{ $t("course.options") }}</label>
                      <button
                        v-if="item.data.options.length < 4"
                        type="button"
                        class="btn-add-option"
                        @click="addOption(index)"
                      >
                        <i class="fa fa-plus"></i>
                      </button>
                    </div>

                    <div
                      v-for="(option, optionIndex) in item.data.options"
                      :key="optionIndex"
                      class="option-row"
                    >
                      <input
                        type="text"
                        class="form-control option-input"
                        :placeholder="'Option ' + (optionIndex + 1) + ' (EN)'"
                        v-model="option.english"
                      />
                      <input
                        type="text"
                        class="form-control option-input"
                        :placeholder="'Option ' + (optionIndex + 1) + ' (AR)'"
                        v-model="option.arabic"
                      />
                      <input
                        type="radio"
                        :name="'correct_answer_' + index"
                        v-model="item.data.correctOption"
                        :value="optionIndex"
                        class="option-radio"
                      />
                      <button
                        v-if="item.data.options.length > 2"
                        type="button"
                        class="btn-remove-option"
                        @click="removeOption(index, optionIndex)"
                      >
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Description Fields -->
                  <div class="form-row">
                    <div class="form-group col-half">
                      <label>{{ $t("course.description") }} (EN)</label>
                      <ckeditor
                        :editor="editor"
                        v-model="item.data.descriptionEn"
                        :config="editorConfig"
                      ></ckeditor>
                    </div>
                    <div class="form-group col-half">
                      <label>{{ $t("course.description") }} (AR)</label>
                      <ckeditor
                        :editor="editor"
                        v-model="item.data.descriptionAr"
                        :config="editorConfig"
                      ></ckeditor>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Buttons -->
      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" @click="$emit('close')">
          {{ $t("course.cancel") }}
        </button>
        <button class="btn btn-save" type="button" @click="submitTrainingModule">
          {{ $t("course.save") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import VueSelect from "vue-select";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default {
  name: 'TrainingModuleModal',
  components: {
    "vue-select": VueSelect,
    ckeditor: Ckeditor
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    trainingFormData: {
      type: Object,
      required: true
    },
    questions: {
      type: Array,
      default: () => []
    },
    statements: {
      type: Array,
      default: () => []
    },
    surveytList: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      localTrainingFormData: { ...this.trainingFormData },
      localQuestions: [...this.questions],
      localStatements: [...this.statements],
      items: [], // Combined list of questions and statements in order
      editor: ClassicEditor,
      editorConfig: { licenseKey: "GPL", height: 300 },
      coverImageFileName: '',
      coverImagePreview: null
    };
  },
  mounted() {
    // Initialize items array from existing questions and statements
    this.initializeItems();
  },
  watch: {
    trainingFormData: {
      handler(newVal) {
        this.localTrainingFormData = { ...newVal };
      },
      deep: true
    },
    questions: {
      handler(newVal) {
        this.localQuestions = [...newVal];
        this.initializeItems();
      },
      deep: true
    },
    statements: {
      handler(newVal) {
        this.localStatements = [...newVal];
        this.initializeItems();
      },
      deep: true
    }
  },
  methods: {
    initializeItems() {
      // Convert existing questions and statements to items format
      const questionItems = this.localQuestions.map((q, index) => ({
        type: 'question',
        data: q,
        originalIndex: index
      }));
      const statementItems = this.localStatements.map((s, index) => ({
        type: 'statement',
        data: s,
        originalIndex: index
      }));
      // For initial load, show statements first then questions (backward compatible)
      this.items = [...statementItems, ...questionItems];
    },
    getItemNumber(index, type) {
      // Count how many items of this type appear before this index
      let count = 1;
      for (let i = 0; i < index; i++) {
        if (this.items[i].type === type) {
          count++;
        }
      }
      return count;
    },
    getFilename(url) {
      if (!url) return "";
      return url.split("/").pop();
    },
    getContentTypeLabel(type) {
      if (type === 'Embedded Image') return this.$t("course.embeddedimage");
      if (type === 'Embedded Video') return this.$t("course.embeddedvideo");
      if (type === 'Embedded PDF') return this.$t("course.embeddedpdf");
      return '';
    },
    getAcceptType(type) {
      if (type === 'Embedded Image') return 'image/*';
      if (type === 'Embedded Video') return 'video/*';
      if (type === 'Embedded PDF') return 'application/pdf';
      return '*';
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    triggerStatementFileUpload(lang, itemIndex) {
      const inputId = lang === 'en' ? `fileEnglish${itemIndex}` : `fileArabic${itemIndex}`;
      document.getElementById(inputId).click();
    },
    handleCoverImageSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.coverImageFileName = file.name;
        // Create preview URL for the image
        const reader = new FileReader();
        reader.onload = (e) => {
          this.coverImagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    removeCoverImage() {
      this.coverImageFileName = '';
      this.coverImagePreview = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
      this.localTrainingFormData.fullCoverImagePath = null;
    },
    handleStatementFileSelect(lang, index, event) {
      const file = event.target.files[0];
      if (file) {
        // Update the item data with the file name for display
        const item = this.items[index];
        if (item && item.type === 'statement') {
          if (lang === 'en') {
            item.data.file_en = file.name;
          } else {
            item.data.file_ar = file.name;
          }
        }
      }
    },
    removeItem(index) {
      const itemType = this.items[index]?.type;
      this.items.splice(index, 1);
      this.$notify({
        type: "success",
        text: itemType === 'question' ? "Question removed successfully" : "Statement removed successfully",
      });
    },
    addQuestion() {
      const newQuestion = {
        english: "",
        arabic: "",
        questionType: "multi_choice",
        options: [
          { english: "", arabic: "" },
          { english: "", arabic: "" },
        ],
        correctOption: null,
        correctAnswer: null,
        descriptionEn: "",
        descriptionAr: "",
      };
      this.items.push({
        type: 'question',
        data: newQuestion
      });
      this.$nextTick(() => {
        const newItemIndex = this.items.length - 1;
        const element = document.getElementById(`item-${newItemIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    },
    addStatement() {
      const newStatement = {
        statement_en: "",
        statement_ar: "",
        content_en: "",
        content_ar: "",
        additional_content_type: "",
      };
      this.items.push({
        type: 'statement',
        data: newStatement
      });
      this.$nextTick(() => {
        const newItemIndex = this.items.length - 1;
        const element = document.getElementById(`item-${newItemIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    },
    handleQuestionTypeChange(itemIndex) {
      const item = this.items[itemIndex];
      if (item.type === 'question') {
        const question = item.data;
        if (question.questionType === "true_or_false") {
          question.options = [];
          question.correctOption = null;
          question.correctAnswer = null;
        } else {
          question.options = [
            { english: "", arabic: "" },
            { english: "", arabic: "" },
          ];
          question.correctAnswer = null;
          question.correctOption = null;
        }
      }
    },
    addOption(itemIndex) {
      const item = this.items[itemIndex];
      if (item.type === 'question' && item.data.options.length < 4) {
        item.data.options.push({ english: "", arabic: "" });
      }
    },
    removeOption(itemIndex, optionIndex) {
      const item = this.items[itemIndex];
      if (item.type === 'question') {
        const question = item.data;
        if (question.options.length > 2) {
          question.options.splice(optionIndex, 1);
          if (question.correctOption === optionIndex) {
            question.correctOption = null;
          } else if (question.correctOption > optionIndex) {
            question.correctOption--;
          }
        }
      }
    },
    submitTrainingModule() {
      // Separate items back into questions and statements arrays
      const questions = this.items
        .filter(item => item.type === 'question')
        .map(item => item.data);
      const statements = this.items
        .filter(item => item.type === 'statement')
        .map(item => item.data);

      this.$emit('submit', {
        trainingFormData: this.localTrainingFormData,
        questions: questions,
        statements: statements
      });
    }
  }
};
</script>

<style scoped>
@import "vue-select/dist/vue-select.css";
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
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.training-module-modal {
  max-width: 1200px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-close {
  font-size: 20px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #000;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Section Box */
.section-box {
  /* background: #f8f9fa; */
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.btn-add-item {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
}

.btn-question {
  background-color: #6e3894;
}

.btn-question:hover {
  background-color: #5a2d7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.3);
}

.btn-statement {
  background-color: #6e3894;
}

.btn-statement:hover {
  background-color: #5a2d7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.3);
}

/* Item Card (Question/Statement) */
.item-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin-bottom: 16px;
  overflow: hidden;
}

.item-card-header {
  background: #f8f9fa;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.item-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.btn-remove-item {
  background: none;
  border: none;
  color: #A92525;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-remove-item:hover {
  background: #fff5f5;
}

.item-card-body {
  padding: 16px;
}

/* Form Styles */
.form-group {
  margin-bottom: 16px;
}

label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  display: block;
}

.required {
  color: #A92525;
  margin-left: 2px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #6E3894;
  box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.1);
}

/* CKEditor Styling */
:deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 400px;
}

:deep(.ck-editor) {
  width: 100%;
  max-width: 100%;
}

:deep(.ck-content) {
  max-width: 100%;
  overflow-x: hidden;
  word-wrap: break-word;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.col-half {
  flex: 1;
  min-width: 0; /* Allow flex items to shrink below their content size */
  margin-bottom: 0 !important;
}

/* Upload Area */
.upload-area-dashed {
  border: 2px dashed #6E3894;
  border-radius: 8px;
  padding: 5px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.upload-area-dashed:hover {
  border-color: #6E3894;
  background: #f8f5ff;
}

.upload-area-dashed.small {
  padding: 30px 15px;
}

.upload-icon {
  font-size: 28px;
  color: #999;
  margin-bottom: 8px;
}

.upload-icon-small {
  font-size: 20px;
  color: #999;
}

.upload-text {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.upload-text-small {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #666;
}

.file-input-hidden {
  display: none;
}

.file-preview-text {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  padding: 6px 10px;
  background: #f8f9fa;
  border-radius: 6px;
  word-break: break-all;
}

.file-preview-training {
  margin-top: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.file-preview-training .img-thumbnail {
  max-width: 200px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-info i {
  color: #6E3894;
  font-size: 18px;
}

.file-info .file-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.btn-remove-file {
  background: none;
  border: none;
  color: #A92525;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-remove-file:hover {
  background-color: #ffe5e5;
}

/* Options Section */
.options-section {
  margin-bottom: 16px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.btn-add-option {
  background: none;
  border: 1px solid #6e3894;
  color: #6e3894;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-add-option:hover {
  background: #6e3894;
  color: white;
}

.option-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.option-input {
  flex: 1;
  margin-bottom: 0 !important;
}

.option-radio {
  width: 20px;
  height: 20px;
  accent-color: #6e3894;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-remove-option {
  background: none;
  border: 1px solid #A92525;
  color: #A92525;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove-option:hover {
  background: #A92525;
  color: white;
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: white;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-radius: 0 0 12px 12px;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  /* padding: 10px 24px; */
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: white;
  color: #6e3894;
  border: 1px solid #6e3894;
}

.btn-cancel:hover {
  background: #f8f5ff;
}

.btn-save {
  background: #6e3894;
  color: white;
}

.btn-save:hover {
  background: #5a2d7a;
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.3);
}
</style>

<style>
.vs__open-indicator {
  display: none !important;
}
</style>
