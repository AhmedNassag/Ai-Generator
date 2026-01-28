<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content edit-course-modal">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("course.editcourse") }}</h5>
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
        <form @submit.prevent="submitCourse">
          <!-- Name Field -->
          <div class="form-group">
            <label for="courseName">
              {{ $t("course.name") }}<span class="required">*</span>
            </label>
            <input
              type="text"
              class="form-control"
              id="courseName"
              v-model="localCourseData.name"
              :placeholder="$t('course.entercoursename')"
              required
            />
          </div>

          <!-- Description Field -->
          <div class="form-group">
            <label for="courseDescription">
              {{ $t("course.description") }}<span class="required">*</span>
            </label>
            <ckeditor
              :editor="editor"
              v-model="localCourseData.description"
              :config="editorConfig"
            ></ckeditor>
          </div>

          <!-- Attachments/Upload Field -->
          <div class="form-group">
            <label for="courseCoverEdit">
              {{ $t("course.attachments") }}<span class="required">*</span>
            </label>

            <!-- Upload Area -->
            <div class="upload-area-bordered" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent>
              <div class="upload-content-centered">
                <i class="fa fa-file-upload upload-icon-large"></i>
                <p class="upload-text-large">{{ $t("course.uploadfile") }}</p>
              </div>
            </div>

            <input
              type="file"
              class="file-input-hidden"
              id="courseCoverEdit"
              accept=".jpg, image/jpeg"
              @change="handleFileSelect"
              ref="fileInput"
            />

            <!-- File Preview Section -->
            <div v-if="localCourseData.photo || localCourseData.fullCourseImagePath" class="file-preview-section">
              <button class="btn-upload-file" type="button">
                <i class="fa fa-folder-open"></i>
                {{ $t("course.uploadfile") }}
              </button>
              <div class="file-actions">
                <button class="btn-icon-action view" type="button" @click="viewFile" title="View">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="btn-icon-action edit" type="button" @click="triggerFileUpload" title="Edit">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn-icon-action delete" type="button" @click="removeFile" title="Delete">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Course Classification -->
          <div class="form-group">
            <label class="form-label">
              {{ $t("course.courseclassification") }} <span class="required">*</span>
            </label>
            <div class="checkbox-row-inline">
              <div class="checkbox-item-box" :class="{ 'active': localCourseData.courseType.mandatory }">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="mandatoryEdit"
                  v-model="localCourseData.courseType.mandatory"
                  @change="handleCourseTypeChange"
                />
                <label class="form-check-label" for="mandatoryEdit">
                  {{ $t("course.mandatory") }}
                </label>
              </div>

              <div class="checkbox-item-box" :class="{ 'active': localCourseData.courseType.campaign }">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="campaignEdit"
                  v-model="localCourseData.courseType.campaign"
                />
                <label class="form-check-label" for="campaignEdit">
                  {{ $t("course.campaign") }}
                </label>
              </div>

              <div class="checkbox-item-box" :class="{ 'active': localCourseData.courseType.optional }">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="optionalEdit"
                  v-model="localCourseData.courseType.optional"
                />
                <label class="form-check-label" for="optionalEdit">
                  {{ $t("course.optional") }}
                </label>
              </div>
            </div>
          </div>

          <!-- Conditional Fields for Mandatory Course -->
          <div v-if="localCourseData.courseType.mandatory" class="conditional-section">
            <div class="form-row">
              <!-- Departments -->
              <div class="form-group col-half">
                <label for="departmentsEdit">{{ $t("course.departments") }}</label>
                <vue-select
                  multiple
                  class="form-select"
                  id="departmentsEdit"
                  v-model="localCourseData.department_ids"
                  :options="departmentList"
                  label="name"
                  :reduce="(item) => item.id"
                  :placeholder="$t('course.selectdepartments')"
                ></vue-select>
              </div>

              <!-- Teams -->
              <div class="form-group col-half">
                <label for="teamsEdit">{{ $t("course.teams") }}</label>
                <vue-select
                  multiple
                  class="form-select"
                  id="teamsEdit"
                  v-model="localCourseData.team_ids"
                  :options="teamList"
                  label="name"
                  :reduce="(item) => item.id"
                  :placeholder="$t('course.selectteams')"
                ></vue-select>
              </div>
            </div>

            <div class="form-row">
              <!-- Users -->
              <div class="form-group col-md-12">
                <label for="usersEdit">{{ $t("course.users") }}</label>
                <vue-select
                  multiple
                  class="form-select"
                  id="usersEdit"
                  v-model="localCourseData.user_ids"
                  :options="userList"
                  label="full_name"
                  :reduce="(item) => item.id"
                  :placeholder="$t('course.selectusers')"
                ></vue-select>
              </div>
            </div>
                          <!-- Days to Complete -->
              <div class="form-group">
                <label for="daysToCompleteEdit">{{ $t("course.daystocomplete") }}</label>
                <input
                  type="number"
                  class="form-control"
                  id="daysToCompleteEdit"
                  v-model="localCourseData.days_to_complete"
                  :min="1"
                  :placeholder="$t('course.daystocomplete')"
                />
              </div>

            <!-- Disable Menu Toggle -->
            <div class="form-group">
              <div class="disable-menu-box">
                <div class="toggle-container">
                  <div class="toggle-label-section">
                    <label for="disable_menu_edit" class="toggle-label">
                      {{ $t("course.disablemenu") }}
                    </label>
                    <p class="toggle-description">
                      {{ $t("course.This_option_restricts_access_to_the_system_menu_until_the_user_successfully_completes_the_course_") }}
                    </p>
                  </div>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      v-model="localCourseData.disable_menu"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer Buttons -->
      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" @click="$emit('close')">
          {{ $t("course.cancel") }}
        </button>
        <button class="btn btn-save" type="button" @click="submitCourse">
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
  name: 'CourseEditModal',
  components: {
    "vue-select": VueSelect,
    ckeditor: Ckeditor
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    courseData: {
      type: Object,
      required: true
    },
    departmentList: {
      type: Array,
      default: () => []
    },
    teamList: {
      type: Array,
      default: () => []
    },
    userList: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      localCourseData: { ...this.courseData },
      editor: ClassicEditor,
      editorConfig: { licenseKey: "GPL", height: 300 }
    };
  },
  watch: {
    courseData: {
      handler(newVal) {
        this.localCourseData = { ...newVal };
      },
      deep: true
    }
  },
  methods: {
    handleCourseTypeChange() {
      if (this.localCourseData.courseType.optional === true)
        this.localCourseData.user_ids = [];

      if (!this.localCourseData.courseType.mandatory) {
        this.localCourseData.department_ids = [];
        this.localCourseData.team_ids = [];
        this.localCourseData.user_ids = [];
        this.localCourseData.days_to_complete = null;
        this.localCourseData.disable_menu = false;
      } else {
        this.localCourseData.department_ids = this.localCourseData.department_ids
          ? this.localCourseData.department_ids.filter((id) => id !== null)
          : [];
        this.localCourseData.team_ids = this.localCourseData.team_ids
          ? this.localCourseData.team_ids.filter((id) => id !== null)
          : [];
        this.localCourseData.user_ids = this.localCourseData.user_ids
          ? this.localCourseData.user_ids.filter((id) => id !== null)
          : [];
      }
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        console.log('File selected:', file.name);
      }
    },
    handleFileDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.$refs.fileInput.files = files;
        this.handleFileSelect({ target: { files } });
      }
    },
    viewFile() {
      if (this.localCourseData.fullCourseImagePath) {
        window.open(this.localCourseData.fullCourseImagePath, '_blank');
      }
    },
    removeFile() {
      this.$refs.fileInput.value = '';
      this.localCourseData.photo = null;
    },
    submitCourse() {
      this.$emit('submit', this.localCourseData);
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
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.edit-course-modal {
  max-width: 900px;
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

.form-group {
  margin-bottom: 20px;
}

.form-label,
label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.required {
  color: #A92525;
  margin-left: 2px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
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

/* Upload Area */
.upload-area-bordered {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 5px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.upload-area-bordered:hover {
  border-color: #6E3894;
  background: #f8f5ff;
}

.upload-content-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon-large {
  font-size: 36px;
  color: #999;
}

.upload-text-large {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.file-input-hidden {
  display: none;
}

/* File Preview Section */
.file-preview-section {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-upload-file {
  background-color: white;
  color: #6e3894;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-upload-file:hover {
  background-color: #f8f5ff;
  border-color: #6e3894;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.btn-icon-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: white;
}

.btn-icon-action.view {
  border-color: #6e3894;
  color: #6e3894;
}

.btn-icon-action.view:hover {
  background-color: #6e3894;
  color: white;
}

.btn-icon-action.edit {
  border-color: #C4951B;
  color: #C4951B;
}

.btn-icon-action.edit:hover {
  background-color: #C4951B;
  color: white;
}

.btn-icon-action.delete {
  border-color: #A92525;
  color: #A92525;
}

.btn-icon-action.delete:hover {
  background-color: #A92525;
  color: white;
}

/* Checkbox Row */
.checkbox-row-inline {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-left: 80px;
}

.checkbox-item-box {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  /* border: 2px solid #ddd; */
  /* border-radius: 8px; */
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

/* .checkbox-item-box:hover {
  border-color: #6e3894;
  background-color: #f8f5ff;
} */

/* .checkbox-item-box.active {
  border-color: #6e3894;
  background-color: #6e3894;
} */

/* .checkbox-item-box.active label {
  color: white;
} */

.checkbox-item-box input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: white;
  margin: 0;
  cursor: pointer;
}

.checkbox-item-box label {
  margin: 0;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  flex: 1;
}

/* Form Row */
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 15px;
}

.col-half {
  flex: 1;
  margin-bottom: 0 !important;
}

/* Conditional Section */
.conditional-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

/* Disable Menu Box */
.disable-menu-box {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.toggle-label-section {
  flex: 1;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
}

.toggle-description {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #6E3894;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
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
  padding: 10px 24px;
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
