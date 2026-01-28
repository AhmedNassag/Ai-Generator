<template>
  <form @submit.prevent="submitForm">
    <div name="slide-down">
      <div v-if="isOpen" class="modal-overlay">
        <div class="add-course-modal">
          <div class="modal-header">
            <h5 class="modal-title">New Courses</h5>
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
            <!-- Name Field -->
            <div class="form-group">
              <label for="name" class="form-label">
                {{ $t("course.name") }}<span class="required">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="localFormData.name"
                :placeholder="$t('course.entercoursename')"
              />
            </div>

            <!-- Description Field -->
            <div class="form-group">
              <label for="description" class="form-label">
                {{ $t("course.description") }}<span class="required">*</span>
              </label>
              <ckeditor
                :editor="editor"
                v-model="localFormData.description"
                :config="editorConfig"
              ></ckeditor>
            </div>

            <!-- Attachments/Upload Field -->
            <div class="form-group">
              <label for="photo" class="form-label">
                {{ $t("course.attachments") }}<span class="required">*</span>
              </label>
              <div class="upload-area" @click="triggerFileUpload" @drop="handleFileDrop" @dragover.prevent>
                <div class="upload-content">
                  <i class="fa fa-cloud-upload upload-icon"></i>
                  <p class="upload-text">{{ selectedFileName || 'Upload File' }}</p>
                </div>
                <input
                  type="file"
                  class="file-input-hidden"
                  id="photo"
                  accept=".jpg, image/jpeg"
                  @change="handleFileSelect"
                />
              </div>
              <div v-if="selectedFileName" class="file-preview">
                <i class="fa fa-file-image"></i>
                <span class="file-name">{{ selectedFileName }}</span>
                <button type="button" class="btn-remove-file" @click="removeFile">
                  <i class="fa fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Course Classification -->
            <div>
              <label class="form-label">
                <i class="fa-solid fa-layer-group"></i>
                {{ $t("course.courseclassification") }} <span class="required">*</span>
              </label>
              <div class="checkbox-row">
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="mandatory"
                    v-model="localFormData.courseType.mandatory"
                    @change="handleCourseTypeChange"
                  />
                  <label class="form-check-label" for="mandatory">
                    {{ $t("course.mandatory") }}
                  </label>
                </div>

                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="campaign"
                    v-model="localFormData.courseType.campaign"
                  />
                  <label class="form-check-label" for="campaign">
                    {{ $t("course.campaign") }}
                  </label>
                </div>

                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="optional"
                    v-model="localFormData.courseType.optional"
                  />
                  <label class="form-check-label" for="optional">
                    {{ $t("course.optional") }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Departments Dropdown -->
            <div v-if="localFormData.courseType.mandatory" class="form-group">
              <div v-if="localFormData.courseType.mandatory" class="form-group col-md-12">
                <label for="departments" class="form-label">
                  {{ $t("course.departments") }}
                </label>
                <LazySelectField
                  name="department_ids"
                  v-model="localFormData.department_ids"
                  :placeholder="$t('course.selectdepartments')"
                  options="Department"
                  option-label="name"
                  option-value="id"
                  :multiple="true"
                />
              </div>

              <!-- Teams Dropdown -->
              <div v-if="localFormData.courseType.mandatory" class="form-group">
                <label for="teams" class="form-label">
                  {{ $t("course.teams") }}
                </label>
                <TeamSelect
                  v-model="localFormData.team_ids"
                  :multiple="true"
                  :placeholder="$t('course.selectteams')"
                />
              </div>
            </div>

            <!-- Users Dropdown -->
            <div v-if="localFormData.courseType.mandatory" class="form-group">
              <label for="users" class="form-label">
                {{ $t("course.users") }}
              </label>
              <UserSelect
                v-model="localFormData.user_ids"
                :multiple="true"
                :placeholder="$t('course.selectusers')"
              />
            </div>

            <!-- Days To Complete -->
            <div v-if="localFormData.courseType.mandatory" class="form-group">
              <label for="days_to_complete" class="form-label">
                {{ $t("course.daystocomplete") }}
              </label>
              <input
                type="number"
                class="form-control"
                id="days_to_complete"
                v-model="localFormData.days_to_complete"
                :min="1"
                placeholder="Days Complete"
              />
            </div>

            <!-- Disable Menu Toggle -->
            <div v-if="localFormData.courseType.mandatory" class="form-group">
              <div class="disable-menu-box">
                <div class="toggle-container">
                  <label for="disable_menu" class="toggle-label">
                    {{ $t("course.disablemenu") }}
                  </label>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      v-model="localFormData.disable_menu"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <p class="toggle-description">
                  {{ $t("course.This_option_restricts_access_to_the_system_menu_until_the_user_successfully_completes_the_course_") }}
                </p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" type="button" @click="$emit('close')">
              {{ $t("course.cancel") }}
            </button>
            <button class="btn btn-save" type="submit">
              {{ $t("course.save") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import LazySelectField from "@/components/LazySelectField.vue";
import UserSelect from "@/components/UserSelect.vue";
import TeamSelect from "@/components/TeamSelect.vue";

export default {
  name: 'CourseFormModal',
  components: {
    ckeditor: Ckeditor,
    LazySelectField,
    UserSelect,
    TeamSelect
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    formData: {
      type: Object,
      required: true
    },
  },
  emits: ['close', 'submit'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      editor: ClassicEditor,
      editorConfig: { licenseKey: "GPL", height: 300 },
      selectedFileName: ''
    };
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
      },
      deep: true
    }
  },
  methods: {
    handleCourseTypeChange() {
      if (!this.localFormData.courseType?.mandatory) {
        this.localFormData.department_ids = [];
        this.localFormData.team_ids = [];
        this.localFormData.user_ids = [];
        this.localFormData.days_to_complete = null;
        this.localFormData.disable_menu = false;
      }
    },
    triggerFileUpload() {
      const fileInput = document.getElementById('photo');
      fileInput.click();
    },
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFileName = file.name;
        console.log('File selected:', file.name);
      }
    },
    removeFile() {
      this.selectedFileName = '';
      const fileInput = document.getElementById('photo');
      if (fileInput) {
        fileInput.value = '';
      }
    },
    handleFileDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const fileInput = document.getElementById('photo');
        fileInput.files = files;
        this.handleFileSelect({ target: { files } });
      }
    },
    submitForm() {
      this.$emit('submit', this.localFormData);
    }
  }
};
</script>

<style scoped>
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

.add-course-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.add-course-modal .modal-header {
  padding: 20px 24px;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.add-course-modal .modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.add-course-modal .btn-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.add-course-modal .btn-close:hover {
  background: #f0f0f0;
  color: #333;
}

.add-course-modal .modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
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
  padding: 7px 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #6E3894;
  box-shadow: 0 0 0 2px rgba(111, 66, 193, 0.1);
}

/* CKEditor Styling */
:deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 400px;
}

.upload-area {
  border: 2px dashed #6E3894;
  border-radius: 8px;
  padding: 5px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.upload-area:hover {
  background: #f8f5ff;
  border-color: #5a32a3;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 24px;
  color: #6E3894;
}

.upload-text {
  margin: 0;
  font-size: 14px;
  color: #6E3894;
  font-weight: 500;
}

.file-input-hidden {
  display: none;
}

.file-preview {
  margin-top: 12px;
  padding: 10px 14px;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-preview i {
  color: #6E3894;
  font-size: 18px;
}

.file-name {
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

.checkbox-row {
  display: flex;
  gap: 200px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #6E3894;
  margin: 0;
}

.checkbox-item label {
  margin: 0;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.disable-menu-box {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #D9D9D9;
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #6E3894;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-description {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  margin: 0;
}

.add-course-modal .modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: white;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.add-course-modal .btn {
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-cancel {
  background: white;
  color: #6E3894;
  border: 1px solid #6E3894;
}

.btn-cancel:hover {
  background: #f8f5ff;
}

.btn-save {
  background: #6E3894;
  color: white;
  border: 1px solid #6E3894;
}

.btn-save:hover {
  background: #5a32a3;
  border-color: #5a32a3;
}
</style>
