<template>
  <!-- Error Messages -->
  <template v-if="errors && errors.length"> </template>

  <!-- Form Component -->
  <Form @submit="submit" @invalid-submit="scrollToTop">
    <div v-anyPermission="['update', 'insert']" class="row row-sm">
      <!-- Loop through grouped sections -->
      <template v-for="(sectionFields, sectionName) in groupedFields" :key="sectionName">
        <!-- Section Wrapped in a Card -->
        <div class="col-12 mb-3">
          <div class="card border">
            <!-- Section Header (only show if section name exists) -->
            <div
              class="card-header bg-section-header text-white border-bottom shadow-sm"
              v-if="sectionName"
            >
              <h5 class="mb-0">{{ sectionName }}</h5>
            </div>
            <div class="card-body">
              <div class="row rtl">
                <!-- Loop through fields in the section -->
                <template v-for="field in sectionFields" :key="field.name">
                  <slot :name="field.name" :item="field">
                    <div
                      :class="
                        field.type === 'textarea' ? 'col-lg-12' : `col-lg-${field.col}`
                      "
                      v-if="!field.hidden"
                    >
                      <div class="form-group" v-if="field.type !== 'checkbox'">
                        <!-- Field Label -->
                        <label :for="field.name">
                          {{ field.label }}
                          <span
                            v-if="field.rules && field.rules.includes('required')"
                            class="font-danger"
                            >*</span
                          >
                        </label>

                        <!-- Options Select (with checkbox style) -->
                        <div
                          v-if="field.type === 'options' || field.type === 'multiselect'"
                        >
                          <!-- Universal Select Field (supports both static and lazy loading) -->
                          <LazySelectField
                            :key="`select-${field.name}`"
                            :options="field.options"
                            :apiPathPattern="field.apiPathPattern || 'flat'"
                            :FolderName="field.FolderName || ''"
                            :BaseModule="field.BaseModule || ''"
                            :api-params="field.apiParams || {}"
                            :per-page="field.perPage || 10"
                            :disabled="show || field.disabled"
                            :option-label="field.optionLabel || 'name'"
                            :option-value="field.optionValue"
                            v-model="newItem[field.name]"
                            :multiple="field.multiple"
                            :placeholder="field.placeholder || $t('common.please_select')"
                            :on-update="field.functions"
                            :filterable="true"
                            :clearable="true"
                            :selectable="
                              (option) => isOptionSelectable(option, field.name)
                            "
                            :name="field.name"
                            :rules="field.rules"
                          />
                        </div>

                        <!-- User Select Components -->
                        <div v-else-if="field.type === 'user-select'">
                          <UserSelect
                            v-model="newItem[field.name]"
                            :multiple="field.multiple"
                            :disabled="show || field.disabled"
                            :placeholder="
                              field.placeholder ||
                              (field.type === 'user-select-multiple'
                                ? 'Select users...'
                                : 'Select user...')
                            "
                          />

                          <!-- hidden field for validation -->
                          <Field
                            :name="field.name"
                            :rules="field.rules"
                            v-model="newItem[field.name]"
                            class="v-field--hidden"
                          />
                        </div>

                        <div v-else-if="field.type === 'team-select'">
                          <TeamSelect
                            v-model="newItem[field.name]"
                            :multiple="field.multiple"
                            :team-select="true"
                            :disabled="show || field.disabled"
                            :placeholder="
                              field.placeholder ||
                              (field.type === 'team-select-multiple'
                                ? 'Select teams...'
                                : 'Select team...')
                            "
                          />

                          <!-- hidden field for validation -->
                          <Field
                            :name="field.name"
                            :rules="field.rules"
                            v-model="newItem[field.name]"
                            class="v-field--hidden"
                          />
                        </div>

                        <div v-else-if="field.type === 'radio'" class="form-group">
                          <h6 class="radio-main-label">
                            {{ field.label }}
                            <span
                              v-if="field.rules && field.rules.includes('required')"
                              class="font-danger"
                              >*</span
                            >
                          </h6>

                          <div class="radio-options-grid">
                            <div
                              v-for="option in field.options"
                              :key="option.value"
                              class="radio-option-card"
                              :class="{
                                'radio-option-card--selected':
                                  newItem[field.name] === option.value,
                              }"
                            >
                              <input
                                type="radio"
                                :id="`${field.name}-${option.value}`"
                                :name="field.name"
                                :value="option.value"
                                v-model="newItem[field.name]"
                                class="radio-input"
                                :rules="field.rules"
                              />
                              <label
                                :for="`${field.name}-${option.value}`"
                                class="radio-label"
                              >
                                <div class="radio-content">
                                  <div class="radio-icon" v-if="option.icon">
                                    <i :class="option.icon"></i>
                                  </div>
                                  <div class="radio-text">
                                    <div class="radio-title">{{ option.label }}</div>
                                    <div
                                      v-if="option.description"
                                      class="radio-description"
                                    >
                                      {{ option.description }}
                                    </div>
                                  </div>
                                  <div class="radio-checkmark">
                                    <div class="checkmark-circle"></div>
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>

                          <!-- Radio Field Description -->
                          <div class="form-text d-block w-100">
                            {{ field.description }}
                          </div>

                          <!-- Error Message for Radio -->
                          <span class="text-danger">
                            <ErrorMessage :name="field.name" />
                          </span>
                        </div>
                        <!-- File Input Fields -->
                        <div
                          v-else-if="
                            field.type === 'file' &&
                            $route.name !== 'Regulator' &&
                            $route.name == 'phishing-template'
                          "
                          class="file-input-container"
                        >
                          <input
                            type="file"
                            :ref="'fileInput_' + field.name"
                            :name="field.name"
                            @change="(e) => previewImage(e, field.name)"
                            class="v-file-input--hidden"
                          />

                          <!-- Image Preview -->
                          <div
                            v-if="previewMap[field.name] || getImageUrl(field.name)"
                            class="imagePreviewWrapper"
                            :class="`imagePreviewWrapper--${field.name}`"
                            @click="selectImage(field.name)"
                          ></div>
                          <div
                            v-else
                            class="no-image-preview"
                            @click="selectImage(field.name)"
                          >
                            <span>Click to select image</span>
                          </div>

                          <!-- File Input Button -->
                          <button
                            type="button"
                            class="btn btn-outline-primary mt-2"
                            @click="selectImage(field.name)"
                          >
                            {{
                              previewMap[field.name] || getImageUrl(field.name)
                                ? "Change Image"
                                : "Select Image"
                            }}
                          </button>
                        </div>

                        <!-- Field Input (for types other than textarea and file) -->
                        <Field
                          v-else-if="field.type !== 'textarea'"
                          :id="field.name"
                          :name="field.name"
                          :type="field.type"
                          class="form-control"
                          v-model="newItem[field.name]"
                          :rules="field.rules"
                          :placeholder="field.placeholder"
                          :disabled="field.disabled"
                        />

                        <!-- CKEditor for Textarea Fields -->
                        <ckeditor
                          :editor="editor"
                          responseType="document"
                          v-else-if="field.type === 'textarea'"
                          v-model="newItem[field.name]"
                          :config="editorConfig"
                        ></ckeditor>

                        <!-- Field Description -->
                        <div class="form-text d-block w-100">
                          {{ field.description }}
                        </div>

                        <!-- Error Message for Field -->
                        <span class="text-danger">
                          <ErrorMessage :name="field.name" />
                        </span>
                      </div>

                      <!-- Checkbox Fields -->
                      <div
                        v-else-if="field.type === 'checkbox' && !field.hidden"
                        class="form-group"
                      >
                        <h6>{{ field.label }}</h6>
                        <div class="form-check form-switch form-check-inline">
                          <input
                            type="checkbox"
                            :id="field.name"
                            :name="field.name"
                            v-model="newItem[field.name]"
                            :rules="field.rules"
                            class="form-check-input check-size ms-1"
                            role="switch"
                          />
                        </div>
                        <!-- Checkbox Field Description -->
                        <div class="form-text d-block w-100">
                          {{ field.description }}
                        </div>

                        <!-- Error Message for Checkbox -->
                        <span class="text-danger">
                          <ErrorMessage :name="field.name" />
                        </span>
                      </div>
                    </div>
                  </slot>
                </template>
              </div>
            </div>
            <!-- Radio Button Fields (alternative layout) -->
          </div>
        </div>
      </template>
    </div>

    <!-- Submit and Cancel Buttons -->

    <div
      class="row d-flex justify-content-end"
      v-anyPermission="['update', 'insert']"
      v-if="!noSubmit && !show"
    >
      <div class="d-flex justify-content-end align-items-center">
        <div>
          <button class="btn-cancel" @click.prevent="closeForm">
            {{ $t("common.cancel") }}
          </button>
        </div>
        <div class="m-rtl-md">
          <button class="btn-save " id="submitFormBtn" type="submit">
            {{ $t("common.save") }}
          </button>
        </div>
      </div>
    </div>
  </Form>
</template>

<script>
import { Form, Field, ErrorMessage, defineRule, configure } from "vee-validate";
import { required, email, min, numeric } from "@vee-validate/rules";
import FilePreview from "./FilePreview.vue";
import UserSelect from "./UserSelect.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import LazySelectField from "@/components/LazySelectField.vue";
import TeamSelect from "./TeamSelect.vue";

// rules
defineRule("required", required);
defineRule("email", email);
defineRule("min", min);
defineRule("number", numeric);

defineRule("date", (value) => {
  if (!value) return true;
  const date = new Date(value);
  return !isNaN(date.getTime()) ? true : "Please enter a valid date.";
});

defineRule("time", (value) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(value) ? true : "Please enter a valid time (HH:mm).";
});

defineRule("url", (value) => {
  if (!value) return true;
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(value) ? true : "Please enter a valid URL.";
});

configure({
  generateMessage: (ctx) => {
    const messages = {
      required: `${ctx.field} is required.`,
      email: "Please enter a valid email address.",
      min: `${ctx.field} must be at least ${ctx.rule.params[0]} characters.`,
      number: `${ctx.field} must be a valid number.`,
      date: "Please enter a valid date.",
      time: "Please enter a valid time (HH:mm).",
    };
    return messages[ctx.rule.name] || "Invalid field";
  },
});

export default {
  props: {
    newItem: { type: Object, required: true },
    closeForm: Function,
    schema: { type: Array, required: true },
    formData: { type: Boolean, default: false },
    api: Object,
    noSubmit: { type: Boolean, default: false },
    baseImageUrl: { type: String, default: "" },
    customSubmit: { type: Function, default: null },
    onSubmitComplete: { type: Function, default: null },
  },

  components: {
    Form,
    Field,
    ErrorMessage,
    LazySelectField,
    ckeditor: Ckeditor,
    FilePreview,
    UserSelect,
    TeamSelect,
  },

  computed: {
    // Group fields by their section name
    groupedFields() {
      return this.fields.reduce((groups, field) => {
        const section = field.section || ""; // Default to empty string if no section is specified
        if (!groups[section]) {
          groups[section] = [];
        }
        groups[section].push(field);
        return groups;
      }, {});
    },
  },

  data() {
    return {
      file: {},
      errors: [],
      previewMap: {},
      editor: ClassicEditor,
      editorConfig: { licenseKey: "GPL", height: 500 },
      fields: [],
      show: false,
      id: Number,
    };
  },

  mounted() {
    this.fields = this.schema;
    this.initializeImagePreviews();
    // this.updateImageBackgrounds();
  },

  watch: {
    previewMap: {
      handler() {
        this.$nextTick(() => {
          // this.updateImageBackgrounds();
        });
      },
      deep: true,
    },
    // Watch for changes in schema prop to update fields reactively
    schema: {
      handler(newSchema) {
        this.fields = newSchema;
      },
      deep: true,
    },
  },

  methods: {
    selectSingleOption(option, fieldName) {
      this.newItem[fieldName] =
        this.newItem[fieldName] === option?.id ? null : option?.id;
    },

    isOptionSelectable(option, fieldName) {
      if (!option?.id) return true;
      const currentValue = this.newItem[fieldName];
      if (Array.isArray(currentValue)) {
        if (currentValue.includes(option.id)) return false;
      }
      for (const key in this.newItem) {
        if (key === fieldName) continue;
        const value = this.newItem[key];
        if (Array.isArray(value) && value.includes(option.id)) return false;
        if (value === option.id) return false;
      }
      return true;
    },

    initializeImagePreviews() {
      if (!this.newItem) return;
      const fileFields = this.fields.filter((f) => f.type === "file");
      fileFields.forEach((field) => {
        const fieldName = field.name;
        if (this.newItem[fieldName] && typeof this.newItem[fieldName] === "string") {
        }
      });
    },

    getImageUrl(fieldName) {
      if (!this.newItem[fieldName]) return null;
      if (this.newItem.fullFilePath) return this.newItem.fullFilePath;
      if (this.newItem[fieldName] instanceof File) return null;
      if (typeof this.newItem[fieldName] === "string") {
        if (
          this.newItem[fieldName].startsWith("http") ||
          this.newItem[fieldName].startsWith("blob:")
        ) {
          return this.newItem[fieldName];
        }
        return `${this.baseImageUrl}${this.newItem[fieldName]}`;
      }
      return null;
    },

    selectImage(fieldName) {
      this.$refs[`fileInput_${fieldName}`][0].click();
    },

    previewImage(event, fieldName) {
      const _file = event.target.files[0];
      if (!_file) return;
      this.newItem[fieldName] = _file;
      this.previewMap[fieldName] = URL.createObjectURL(_file);
    },

    // Get form data method
    getFormData() {
      return { ...this.newItem };
    },

    // Scroll to top of the form
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    // Submit form after validation
    async submit(values) {
      console.log("Form submit method called");
      console.log("Validated Data:", values);
      console.log("Form Data:", this.newItem);
      console.log("API object:", this.api);

      const submitButton = document.getElementById("submitFormBtn");
      if (submitButton) {
        submitButton.setAttribute("disabled", true); // Disable button
      }

      try {
        // If customSubmit is provided, use it instead of the default submit logic
        if (this.customSubmit) {
          console.log("Using custom submit handler...");
          await this.customSubmit(this.newItem, values);
          if (submitButton) {
            submitButton.removeAttribute("disabled");
          }
          return;
        }

        console.log("Calling api.from...");
        const ret = await this.api.from(this.newItem, true, this.formData);
        console.log("API response:", ret);

        if (ret.data.errors) {
          if (submitButton) {
            submitButton.removeAttribute("disabled"); // Re-enable button on error
          }
          this.errors = ret.data.errors;
           if (this.onSubmitComplete) {
              this.onSubmitComplete(false, ret.data);
            }
          this.scrollToTop();
        } else {
           if (this.onSubmitComplete) {
              this.onSubmitComplete(true, ret.data);
            }
          this.closeForm(); // Close form on success
          if (submitButton) {
            submitButton.removeAttribute("disabled"); // Re-enable on any failure
          }
        }
      } catch (error) {
        if (submitButton) {
          submitButton.removeAttribute("disabled"); // Re-enable on any failure
        }
        console.error("API call failed:", error);
        this.scrollToTop();
      }
    },
  },
};
</script>

<style>
/* v-list-item min height */
.v-list-item--min-height {
  min-height: 36px;
}

/* v-field hidden */
.v-field--hidden {
  display: none;
}

/* v-file-input hidden */
.v-file-input--hidden {
  display: none;
}
.v-select--styled {
  width: 100% !important;
}

.v-select--styled .v-field {
  height: 38px !important;
  min-height: 38px !important;
  border: 1px solid #00000033 !important;
  border-radius: 10px !important;
  background-color: white !important;
  font-size: 16px !important;
}

.v-select--styled .v-field__input {
  min-height: 38px !important;
  padding: 8px 12px !important;
  font-size: 16px !important;
  color: #333 !important;
}

.v-select--styled .v-field__outline {
  display: none !important;
}

.v-select--styled .v-field:hover {
  border-color: #00000033 !important;
}

.v-select--styled .v-field--focused {
  border: 1px solid #00000033 !important;
  box-shadow: none !important;
}

.v-select--styled .v-field__append-inner {
  align-self: center !important;
  padding-top: 0 !important;
  margin-left: 8px !important;
}

.v-select--styled .v-field__append-inner .v-icon {
  color: #a16bc7 !important;
}

.v-select__menu--styled {
  max-height: 200px !important;
  border: 1px solid #00000033 !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* v-select selection text styling */
.v-select__selection-text {
  color: #333 !important;
  font-size: 16px !important;
  font-weight: normal !important;
}

.v-select__selection-more {
  color: #6c757d !important;
  font-size: 14px !important;
}

/* v-select placeholder styling */
.v-select--styled .v-field--placeholder {
  color: #6c757d !important;
}

/* v-select disabled state */
.v-select--styled .v-field--disabled {
  background-color: #f8f9fa !important;
  border-color: #00000033 !important;
  color: #6c757d !important;
}

/* v-checkbox styles */
.v-checkbox--styled:hover .v-selection-control__input,
.v-checkbox--styled:hover .v-input--selection-controls__input {
  border-color: var(--hover-purple) !important;
}
.v-checkbox--styled:hover .v-icon {
  color: var(--hover-purple) !important;
}
.v-checkbox--styled.v-input--disabled:hover .v-icon,
.v-checkbox--styled.v-input--disabled:hover .v-selection-control__input:before,
.v-checkbox--styled.v-input--disabled:hover .v-input--selection-controls__input:before {
  border-color: var(--main-purple) !important;
  color: var(--main-purple) !important;
}
.v-checkbox--styled .v-selection-control--focused .v-selection-control__input:before,
.v-checkbox--styled .v-selection-control__input:focus:before,
.v-checkbox--styled:focus-within .v-selection-control__input:before {
  border: 3px solid var(--focus-purple) !important;
  border-radius: 3px !important;
}
.v-checkbox--styled:focus-within .v-icon {
  border: 3px solid var(--hover-purple) !important;
  border-radius: 3px !important;
}

/* Checkbox Options Styling */
.checkbox-options-container {
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-option {
  margin-bottom: 8px;
}

.checkbox-option:last-child {
  margin-bottom: 0;
}

.form-check {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.form-check-input {
  margin-right: 8px;
  border: 1px solid #00000033;
}

.form-check-input:checked {
  background-color: #d3d3d3;
  border-color: #00000033;
}

.form-check-input:focus {
  border-color: #00000033;
  box-shadow: 0 0 0 0.2rem rgba(161, 107, 199, 0.25);
}

.form-check-label {
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.form-check-label.disabled {
  color: #6c757d;
  cursor: not-allowed;
}

.form-check-input:disabled + .form-check-label {
  color: #6c757d;
  cursor: not-allowed;
}

/* Image preview style */
.imagePreviewWrapper {
  width: 250px;
  height: 250px;
  display: block;
  cursor: pointer;
  margin: 0 auto 30px;
  background-size: cover;
  background-position: center center;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

/* No image preview placeholder */
.no-image-preview {
  width: 250px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 auto 30px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.no-image-preview span {
  color: #6c757d;
}

/* File input container */
.file-input-container {
  text-align: center;
}

.ck-editor__editable {
  min-height: 100px !important;
  max-height: 500px !important;
}

.btn-secondary:hover {
  color: #fff !important;
}
label {
  margin-bottom: 0.5rem;
  font-size: 0.9rem !important;
  color: #404040 !important;
}

/* Add scrolling when options exceed 6 */
.scrollable-dropdown .vs__dropdown-menu {
  max-height: 200px;
  overflow-y: auto;
}

.form-control:focus {
  border: 1px solid #00000033;
  border-radius: 10px;
  box-shadow: 0 0 0 !important;
}

.form-control {
  border: 1px solid #00000033;
  border-radius: 10px;
  padding: 5px 12px !important;
}

.btn-custom-warning {
  background-color: #f3ead1 !important;
  color: #0a0a0aff;
  border: 1px solid #c4951b;
}

.btncustom-warning:hover {
  background-color: #c4951b !important;
  color: #f3ead1 !important;
  border: 1px solid #f3ead1 !important;
}
.btncustom-purple {
  background-color: #43235c !important;
  color: #fff;
  border: 2px solid #d9d9d9;
}

.btncustom-purple:hover {
  background-color: #fff !important;
  color: #a16bc7 !important;
  border: 2px solid #d9d9d9 !important;
}

.vs__dropdown-toggle {
  border: 1px solid #00000033 !important;
  border-radius: 10px !important;
  padding: 0 !important;
}
.ck.ck-editor__top .ck-sticky-panel .ck-sticky-panel__content {
  border: 1px solid #00000033 !important;
  border-bottom: none !important;
}

.ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
  border: 1px solid #00000033 !important;
}

.ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) {
  border-color: #00000033 !important;
}
.btn-primary {
  margin-top: 0px !important;
  padding-block: 8px !important;
}
.btn-cancel {
  border: 1px solid #6e3894;
  border-radius: 10px;
  padding: 0 24px;
  font-size: 14px;
  color: #43235c;
  font-weight: 500;
  height: 25px;
  cursor: pointer;
}
.btn-save {
  background: #6e3894;
  border: 1px solid #6e3894;
  border-radius: 10px;
  padding: 0 24px;
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  height: 25px;
}

.card-header-dark {
  background-color: #343a40;
  color: #ffffff;
  border-bottom: 1px solid #212529;
}

.bg-section-header {
  color: #000000 !important;
}
.form-container {
  width: 100%;
  height: 100%;
  padding: 1.6rem;
  background: #f8f8f8;
  border-radius: 0;
  box-shadow: 0 0 0;
}
.vs__search,
.vs__search:focus {
  margin: 0px 0 0 !important;
  padding: 5px 12px !important;
}

/* Radio Button Awesome Styles */
.radio-group-container {
  margin-top: 8px;
}

.radio-main-label {
  font-size: 16px !important;
  color: black !important;
  margin-bottom: 12px !important;
  font-weight: 600;
}

.radio-options-grid {
  display: flex;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}

.radio-option-card {
  position: relative;
  /* border: 2px solid #e9ecef; */
  border-radius: 12px;
  padding: 0;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.radio-option-card--selected {
  border-color: #6e3894;
  /* background: linear-gradient(135deg, #f8f6ff 0%, #f0ebfa 100%); */
  /* box-shadow: 0 6px 20px rgba(110, 56, 148, 0.2); */
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-label {
  display: block;
  cursor: pointer;
  padding: 20px;
  margin: 0;
  width: 100%;
  height: 100%;
}

.radio-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.radio-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6e3894, #a16bc7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  transition: all 0.3s ease;
}

.radio-option-card--selected .radio-icon {
  background: linear-gradient(135deg, #43235c, #6e3894);
  transform: scale(1.05);
}

.radio-text {
  flex: 1;
  min-width: 0;
}

.radio-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.radio-option-card--selected .radio-title {
  color: #43235c;
}

.radio-description {
  font-size: 14px;
  color: #718096;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.radio-option-card--selected .radio-description {
  color: #6e3894;
}

.radio-checkmark {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.radio-option-card--selected .radio-checkmark {
  border-color: #6e3894;
  background: #6e3894;
}

.checkmark-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  transform: scale(0);
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.radio-option-card--selected .checkmark-circle {
  transform: scale(1);
}

/* Focus states for accessibility */
.radio-input:focus + .radio-label .radio-option-card {
  outline: 2px solid #a16bc7;
  outline-offset: 2px;
}

/* Animation for radio selection */
@keyframes radioSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.radio-option-card--selected {
  animation: radioSelect 0.4s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .radio-options-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .radio-content {
    gap: 12px;
  }

  .radio-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}

/* ===============================
   Radio Button Awesome Styles
   =============================== */

.col-md-12.mb-3 {
  position: relative;
}

.form-check {
  position: relative;
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-check + .form-check {
  margin-top: 12px;
}

/* الراديو نفسه */
.form-check-input {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 12px;
  /* position: relative; */
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-check-input:checked {
  border-color: #6e3894;
  background-color: #6e3894;
  box-shadow: 0 0 0 4px rgba(110, 56, 148, 0.1);
}

.form-check-input:checked::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* النص */
.form-check-label {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  transition: color 0.3s ease;
}

.form-check:hover .form-check-label {
  color: #43235c;
}

/* ===============================
   Percentage Input Styling
   =============================== */

.col-md-6.mt-2 {
  margin-left: 36px !important;
  margin-top: 10px !important;
}

.col-md-6.mt-2 .form-control {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 10px 12px;
  transition: all 0.3s ease;
  font-size: 15px;
}

.col-md-6.mt-2 .form-control:focus {
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
  outline: none;
}

.text-muted {
  font-size: 13px;
  color: #718096 !important;
  margin-top: 4px;
  display: block;
}

/* ===============================
   Animation and Selection Effect
   =============================== */

.form-check-input:checked + .form-check-label {
  color: #6e3894;
}

@keyframes radioSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}

.form-check-input:checked {
  animation: radioSelect 0.3s ease;
}

/* ===============================
   Responsive adjustments
   =============================== */

@media (max-width: 768px) {
  .form-check {
    flex-direction: row;
    align-items: center;
    padding: 12px 14px;
  }

  .form-check-input {
    width: 18px;
    height: 18px;
  }

  .form-check-label {
    font-size: 15px;
  }
}
.m-rtl-md{
margin-left:8px;
margin-right:0px;
}
[dir="rtl"] .m-rtl-md{
margin-left:8px;
margin-right:0px;
}
[dir="rtl"] .ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) ,
[dir="rtl"] .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable),
[dir="rtl"] .form-select {
    text-align: right;
}
[dir="rtl"] .form-control {
    text-align: end;
}
[dir=rtl] .form-check{
    display: flex;
    justify-content: end !important;
}
/* Add these styles to your <style> section */

/* RTL Support for vue-select */
[dir="rtl"] .vs__dropdown-toggle {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .vs__selected-options {
  flex-direction: row-reverse;
}

[dir="rtl"] .vs__search,
[dir="rtl"] .vs__search:focus {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .vs__selected {
  padding: 0 8px 0 2px;
  margin: 4px 0px 0px 4px;
}

[dir="rtl"] .vs__deselect {
  margin-left: 0;
  margin-right: 4px;
}

[dir="rtl"] .vs__actions {
  padding: 4px 12px 0 3px;
}

[dir="rtl"] .vs__dropdown-menu {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .vs__dropdown-option {
  text-align: right;
}

/* RTL Support for v-select if you're using Vuetify */
[dir="rtl"] .v-select--styled .v-field {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .v-select--styled .v-field__input {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .v-select--styled .v-field__append-inner {
  margin-left: 0;
  margin-right: 8px;
}

[dir="rtl"] .v-select__selection-text {
  text-align: right;
} 
/* ===============================
   CKEditor Responsive Styles with Dropdown
   =============================== */

/* Base CKEditor styles (existing) */
.ck-editor__editable {
  min-height: 100px !important;
  max-height: 500px !important;
}

/* Desktop and large screens - keep original size */
@media (min-width: 1200px) {
  .ck-editor__editable {
    min-height: 100px !important;
    max-height: 500px !important;
  }
  
  .ck.ck-editor__main > .ck-editor__editable {
    font-size: 16px;
  }
}

/* Tablets and medium screens */
@media (max-width: 1199px) and (min-width: 768px) {
  .ck-editor__editable {
    min-height: 150px !important;
    max-height: 400px !important;
  }
  
  .ck.ck-editor__main > .ck-editor__editable {
    font-size: 15px;
    padding: 12px !important;
  }
  
  /* Adjust toolbar for tablets */
  .ck.ck-editor__top .ck-sticky-panel .ck-toolbar {
    flex-wrap: wrap;
  }
  
  .ck.ck-toolbar .ck-toolbar__items {
    flex-wrap: wrap;
  }
}

/* Mobile devices - Compact toolbar with dropdown behavior */
@media (max-width: 767px) {
  .ck-editor__editable {
    min-height: 120px !important;
    max-height: 300px !important;
  }
  
  .ck.ck-editor__main > .ck-editor__editable {
    font-size: 14px;
    padding: 10px !important;
  }
  
  /* Make toolbar compact - show only essential tools */
  .ck.ck-editor__top .ck-sticky-panel .ck-toolbar {
    flex-wrap: nowrap !important;
    padding: 4px 8px !important;
    min-height: 40px !important;
    height: auto !important;
    overflow: visible !important;
  }
  
  .ck.ck-toolbar .ck-toolbar__items {
    flex-wrap: nowrap !important;
    gap: 2px;
  }
  
  /* Hide less important buttons by default on mobile */
  .ck.ck-toolbar .ck-button:nth-child(n+6) {
    display: none;
  }
  
  /* Show only essential buttons (first 5) */
  .ck.ck-toolbar .ck-button:nth-child(-n+5) {
    display: inline-flex !important;
    padding: 6px !important;
    min-width: auto !important;
  }
  
  /* Reduce button sizes */
  .ck.ck-toolbar .ck-button {
    padding: 6px !important;
    min-width: auto !important;
  }
  
  .ck.ck-toolbar .ck-button .ck-icon {
    font-size: 15px;
  }
  
  /* Hide toolbar separators on mobile */
  .ck.ck-toolbar .ck-toolbar__separator {
    display: none;
  }
  
  /* Style for dropdown items (when CKEditor dropdown opens) */
  .ck.ck-dropdown__panel {
    max-height: 200px !important;
    overflow-y: auto !important;
    width: 200px !important;
  }
  
  .ck.ck-list__item {
    min-height: 36px !important;
    padding: 6px 12px !important;
  }
  
  /* Make dropdowns appear properly on mobile */
  .ck.ck-toolbar .ck-dropdown {
    max-width: none !important;
  }
  
  .ck.ck-dropdown .ck-button {
    padding: 6px 8px !important;
  }
}

/* Small mobile devices */
@media (max-width: 480px) {
  .ck-editor__editable {
    min-height: 100px !important;
    max-height: 250px !important;
  }
  
  .ck.ck-editor__main > .ck-editor__editable {
    font-size: 13px;
    padding: 8px !important;
  }
  
  /* Even more compact toolbar */
  .ck.ck-toolbar .ck-button:nth-child(-n+5) {
    padding: 5px !important;
  }
  
  .ck.ck-toolbar .ck-button .ck-icon {
    font-size: 14px;
  }
  
  /* Smaller dropdown panels */
  .ck.ck-dropdown__panel {
    max-height: 180px !important;
    width: 180px !important;
  }
  
  /* Hide button labels to save space */
  .ck.ck-button__label {
    display: none;
  }
}

/* Ensure CKEditor container is responsive */
.ck.ck-editor {
  width: 100% !important;
  max-width: 100% !important;
}

.ck.ck-editor__main {
  width: 100% !important;
}

/* Handle long content in editor */
.ck.ck-editor__editable {
  overflow-y: auto;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-word;
}

/* Responsive images inside editor */
.ck-content img {
  max-width: 100% !important;
  height: auto !important;
}

/* Responsive tables inside editor */
.ck-content table {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: auto;
  display: block;
}

@media (max-width: 767px) {
  .ck-content table {
    font-size: 12px;
  }
}

/* Improve CKEditor dropdown behavior on mobile */
@media (max-width: 767px) {
  /* Ensure dropdowns don't overflow screen */
  .ck.ck-dropdown__panel {
    position: absolute !important;
    z-index: 9999 !important;
  }
  
  /* Make dropdown lists more touch-friendly */
  .ck.ck-list__item .ck-button {
    min-height: 40px !important;
    padding: 10px 12px !important;
  }
  
  /* Improve dropdown toggle buttons */
  .ck.ck-toolbar .ck-dropdown > .ck-button {
    padding: 6px 10px !important;
  }
  
  .ck.ck-dropdown > .ck-button .ck-dropdown__arrow {
    margin-left: 4px;
  }
}
</style>
