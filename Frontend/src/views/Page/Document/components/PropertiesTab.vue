<template>
  <v-form @submit.prevent="handleSubmit" ref="form" v-model="formValid" lazy-validation>
    <v-row>
      <input type="hidden" v-model="newItem.category_id" />

      <!-- Document Name -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('name')">
        <v-text-field v-model="newItem.name" label="Name" :rules="nameRules"
          :disabled="!canEdit || isFieldDisabled('name')" prepend-icon="mdi-file-document" required></v-text-field>
      </v-col>

      <!-- Expiration -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('expiry_days')">
        <v-text-field v-model="newItem.expiry_days" label="Expiration (days)" type="number" min="0"
          :rules="expirationRules" :disabled="!canEdit || isFieldDisabled('expiry_days')"
          prepend-icon="mdi-clock"></v-text-field>
      </v-col>

      <!-- Framework Selection (Multiple) -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('framework_id')">
        <v-select v-model="newItem.framework_id" :items="frameworkList" item-title="title" item-value="id"
          label="Framework" multiple chips :rules="frameworkRules"
          :disabled="!canEdit || isFieldDisabled('framework_id')" prepend-icon="mdi-file-tree"
          :menu-props="{ maxHeight: '400' }" @update:model-value="handleFrameworkChange">
          <template v-slot:prepend-item>
            <v-list-item>
              <v-list-item-title class="text-caption text-grey">
                Select one or more frameworks
              </v-list-item-title>
            </v-list-item>
            <v-divider class="mb-2"></v-divider>
          </template>
          <template v-slot:selection="{ item, index }">
            <v-chip v-if="index < 2" size="small">
              <span>{{ item.title }}</span>
            </v-chip>
            <span v-if="index === 2" class="text-grey text-caption align-self-center">
              (+{{ newItem.framework_id.length - 2 }} others)
            </span>
          </template>
        </v-select>
      </v-col>

      <!-- Control Selection (Multiple - Filtered) -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('control_id')">
        <v-select v-model="newItem.control_id" :items="filteredControlList" item-title="short_name" item-value="id"
          label="Control" multiple chips :rules="controlRules"
          :disabled="!canEdit || isFieldDisabled('control_id') || !hasFrameworkSelected" prepend-icon="mdi-shield-check"
          :menu-props="{ maxHeight: '400' }" :key="`control-select-${controlListKey}`"
          :hint="hasFrameworkSelected ? 'Select controls from chosen frameworks' : 'Please select a framework first'"
          persistent-hint>
          <template v-slot:prepend-item>
            <v-list-item v-if="!hasFrameworkSelected">
              <v-list-item-title class="text-caption text-warning">
                <v-icon icon="mdi-information" size="small" class="mr-2"></v-icon>
                Please select a framework first
              </v-list-item-title>
            </v-list-item>
            <v-list-item v-else>
              <v-list-item-title class="text-caption text-grey">
                {{ filteredControlList.length }} controls available
              </v-list-item-title>
            </v-list-item>
            <v-divider class="mb-2"></v-divider>
          </template>
          <template v-slot:selection="{ item, index }">
            <v-chip v-if="index < 2" size="small">
              <span>{{ item.title }}</span>
            </v-chip>
            <span v-if="index === 2" class="text-grey text-caption align-self-center">
              (+{{ newItem.control_id.length - 2 }} others)
            </span>
          </template>
          <template v-slot:no-data>
            <v-list-item>
              <v-list-item-title class="text-caption">
                {{ hasFrameworkSelected ? 'No controls available for selected frameworks' : 'Select a framework first'
                }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-select>
      </v-col>

      <!-- Owner Selection -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('owner_id')">
        <v-select v-model="newItem.owner_id" :items="userList" item-title="full_name" item-value="id" label="Owner"
          :rules="ownerRules" :disabled="!canEdit || isFieldDisabled('owner_id')" prepend-icon="mdi-account-shield"
          :menu-props="{ maxHeight: '400' }"></v-select>
      </v-col>

      <!-- Reviewer Selection -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('reviewer_id')">
        <v-select v-model="newItem.reviewer_id" :items="userList" item-title="full_name" item-value="id"
          label="Reviewer" :rules="reviewerRules" :disabled="!canEdit || isFieldDisabled('reviewer_id')"
          prepend-icon="mdi-account-shield" :menu-props="{ maxHeight: '400' }"></v-select>
      </v-col>

      <!-- Stakeholder Selection -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('stakeholder_ids')">
        <v-combobox v-model="newItem.stakeholder_ids" :items="userList" item-title="full_name" item-value="id"
          label="Stakeholders" multiple chips :rules="stakeholderRules"
          :disabled="!canEdit || isFieldDisabled('stakeholder_ids')" prepend-icon="mdi-account-group"></v-combobox>
      </v-col>

      <!-- Team Selection -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('team_ids')">
        <v-combobox v-model="newItem.team_ids" :items="teamList" item-title="name" item-value="id" label="Teams"
          multiple chips :rules="teamRules" :disabled="!canEdit || isFieldDisabled('team_ids')"
          prepend-icon="mdi-account-multiple"></v-combobox>
      </v-col>

      <!-- Privacy Checkbox -->
      <v-col cols="12" md="6" v-if="!isFieldHidden('privacy')">
        <div class="form-check form-switch mt-4">
          <input class="form-check-input" type="checkbox" id="privacyToggle" v-model="newItem.privacy"
            :disabled="!canEdit || isFieldDisabled('privacy')">
          <label class="form-check-label d-flex align-items-center" for="privacyToggle"
            :class="{ 'required': isFieldRequired('privacy') }">
            <i class="fas fa-lock me-2 text-primary"></i>
            {{ $t("documentdetails.publicprivate_document") }}
            <span class="text-error ml-2">{{ $t("documentdetails.uncheck_for_public_check_to_mark_private") }}</span>
          </label>
        </div>
      </v-col>

      <!-- File Upload Section -->
      <v-col cols="12" v-if="!isFieldHidden('file_url') || !isFieldHidden('file')">
        <v-card class="pa-4" variant="outlined">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-paperclip" class="mr-2 text-primary"></v-icon>
            {{ $t("documentdetails.document_attachment") }}
            <span v-if="isFieldRequired('file')" class="text-error ml-1">*</span>
          </v-card-title>

          <v-file-input v-if="!isFieldHidden('file')" v-model="newItem.file"
            :disabled="!canEdit || isFieldDisabled('file')" :rules="fileRules"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" prepend-icon="mdi-upload" label="Upload document"
            class="mt-4"></v-file-input>

          <div v-if="!isFieldHidden('file_url') && (newItem.file_url || newItem.filename)" class="mt-4">
            <v-card v-if="isImage(newItem.file_url)" class="text-center">
              <v-img :src="newItem.file_url" max-height="200" contain></v-img>
              <v-card-actions>
                <v-btn :href="newItem.file_url" target="_blank" :disabled="isFieldDisabled('file_url')"
                  icon="mdi-magnify-plus-outline" color="primary"></v-btn>
              </v-card-actions>
            </v-card>

            <v-card v-else class="d-flex align-center pa-4">
              <v-icon icon="mdi-file-document" size="48" class="mr-4 text-grey"></v-icon>
              <div>
                <div class="text-h6">{{ newItem.filename || 'Document' }}</div>
                <v-btn v-if="newItem.file_url" :href="newItem.file_url" target="_blank"
                  :disabled="isFieldDisabled('file_url')" icon="mdi-magnify-plus-outline" color="primary"
                  class="mt-2"></v-btn>
              </div>
            </v-card>
          </div>
        </v-card>
      </v-col>

      <!-- Content Section -->
      <v-col cols="12" v-if="!isFieldHidden('content')">
        <v-card class="pa-4 clauses-container" variant="outlined">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon icon="mdi-file-document" class="mr-2 text-primary"></v-icon>
              {{ $t("documentdetails.content") }}
              <span v-if="isFieldRequired('content')" class="text-error ml-1">*</span>
            </div>
            <v-tooltip text="Right-click on selected text to add to clauses" location="top">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" size="small" color="info" variant="outlined">
                  <v-icon icon="mdi-gesture-tap-button" size="small" class="mr-1"></v-icon>
                  Right-click to add clause
                </v-chip>
              </template>
            </v-tooltip>
          </v-card-title>

          <v-card-text>
            <ckeditor :editor="editor" v-model="newItem.content" :config="editorConfig"
              :disabled="isFieldDisabled('content')" class="editor-wrapper" ref="contentEditor" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Notes Section -->
      <v-col cols="12" v-if="!isFieldHidden('notes')">
        <v-card class="pa-4 clauses-container" variant="outlined">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon icon="mdi-note-text" class="mr-2 text-primary"></v-icon>
              {{ $t("documentdetails.notes") }}
              <span v-if="isFieldRequired('notes')" class="text-error ml-1">*</span>
            </div>
            <v-tooltip text="Right-click on selected text to add to clauses" location="top">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" size="small" color="info" variant="outlined">
                  <v-icon icon="mdi-gesture-tap-button" size="small" class="mr-1"></v-icon>
                  Right-click to add clause
                </v-chip>
              </template>
            </v-tooltip>
          </v-card-title>

          <v-card-text>
            <ckeditor :editor="editor" v-model="newItem.notes" :config="editorConfig"
              :disabled="isFieldDisabled('notes')" class="editor-wrapper" ref="notesEditor" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Clauses Section -->
      <v-col cols="12" v-if="!isFieldHidden('clauses')">
        <v-card class="pa-4" variant="outlined">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon icon="mdi-format-list-numbered" class="mr-2 text-primary"></v-icon>
              {{ $t("documentdetails.clauses") }}
              <span v-if="isFieldRequired('clauses')" class="text-error ml-1">*</span>
            </div>
          </v-card-title>

          <v-card-text>
            <template v-if="newItem.clauses && newItem.clauses.length > 0">
              <v-list>
                <v-list-item v-for="(clause, index) in newItem.clauses" :key="index" class="mb-4">
                  <template v-slot:prepend>
                    <v-badge color="primary" :content="index + 1" class="mr-4"></v-badge>
                  </template>

                  <ckeditor :editor="editor" v-model="newItem.clauses[index]" :config="editorConfig"
                    :disabled="isFieldDisabled('clauses')" class="editor-wrapper" ref="clauseEditor" />

                  <template v-slot:append>
                    <v-btn v-if="newItem.clauses.length > 1" @click="removeClause(index)" icon="mdi-delete"
                      color="error" variant="text" :disabled="isFieldDisabled('clauses')"></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </template>
            <template v-else>
              <v-alert type="info" variant="tonal" class="text-center">
                <v-icon icon="mdi-format-list-numbered" size="48" class="mb-4"></v-icon>
                <h3 class="text-h6 mb-2">No clauses added yet</h3>
                <p class="mb-4">Select text in Content or Notes and right-click to add clauses</p>
              </v-alert>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Save Button -->
      <v-col cols="12" class="text-right">
        <v-btn type="submit" color="primary" :loading="isSubmitting" :disabled="isSubmitting || !canEdit"
          prepend-icon="mdi-content-save" v-permission:update>
          Save Properties
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { notify } from "@kyvg/vue3-notification";
import Document from "@/API/Document/Document";

export default {
  name: "PropertiesTab",
  components: {
    ckeditor: Ckeditor,
  },
  props: {
    document: {
      type: Object,
      required: true,
    },
    newItem: {
      type: Object,
      required: true,
    },
    userList: {
      type: Array,
      default: () => [],
    },
    teamList: {
      type: Array,
      default: () => [],
    },
    frameworkList: {
      type: Array,
      default: () => [],
    },
    controlList: {
      type: Array,
      default: () => [],
    },
    fieldsFromTargetStep: {
      type: Array,
      default: () => [],
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update", "remove-clause", "framework-changed"],
  data() {
    return {
      formValid: false,
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 200,
      },
      controlListKey: 0,
      clauseContextMenuCleanup: null,
      documentApi: null,
    };
  },
  computed: {
    hasFrameworkSelected() {
      return this.newItem.framework_id && this.newItem.framework_id.length > 0;
    },
    filteredControlList() {
      return this.controlList || [];
    },
    nameRules() {
      return [
        v => !this.isFieldRequired('name') || !!v || 'Name is required'
      ];
    },
    expirationRules() {
      return [
        v => !this.isFieldRequired('expiry_days') || (v !== null && v !== undefined && v >= 0) || 'Expiration is required'
      ];
    },
    frameworkRules() {
      return [
        v => !this.isFieldRequired('framework_id') || (v && v.length > 0) || 'At least one framework is required'
      ];
    },
    controlRules() {
      return [
        v => !this.isFieldRequired('control_id') || (v && v.length > 0) || 'At least one control is required'
      ];
    },
    ownerRules() {
      return [
        v => !this.isFieldRequired('owner_id') || !!v || 'Owner is required'
      ];
    },
    reviewerRules() {
      return [
        v => !this.isFieldRequired('reviewer_id') || !!v || 'Reviewer is required'
      ];
    },
    stakeholderRules() {
      return [
        v => !this.isFieldRequired('stakeholder_ids') || (v && v.length > 0) || 'At least one stakeholder is required'
      ];
    },
    teamRules() {
      return [
        v => !this.isFieldRequired('team_ids') || (v && v.length > 0) || 'At least one team is required'
      ];
    },
    privacyRules() {
      return [
        v => !this.isFieldRequired('privacy') || v !== null || 'Privacy setting is required'
      ];
    },
    fileRules() {
      return [
        v => !this.isFieldRequired('file') || !!this.newItem.file || !!this.newItem.file_url || 'File is required'
      ];
    },
  },
  watch: {
    controlList: {
      handler() {
        this.controlListKey++;
      },
      deep: true
    }
  },
  created() {
    // Create Document API instance
    this.documentApi = new Document();
  },
  mounted() {
    // Initialize context menu for clauses
    this.$nextTick(() => {
      setTimeout(() => {
        this.initializeContextMenu();
      }, 1000);
    });
  },
  beforeUnmount() {
    // Cleanup context menu
    if (this.clauseContextMenuCleanup) {
      this.clauseContextMenuCleanup.cleanup();
    }
  },
  methods: {
    // ==================== CONTEXT MENU METHODS ====================

    /**
     * Initialize context menu using global API function
     */
    initializeContextMenu() {
      if (!this.documentApi) {
        console.error('documentApi is not initialized');
        return;
      }

      console.log('Initializing context menu...');

      // Clean up existing menu if any
      if (this.clauseContextMenuCleanup) {
        this.clauseContextMenuCleanup.cleanup();
      }

      // Initialize context menu with callback
      this.clauseContextMenuCleanup = this.documentApi.initializeClauseContextMenu(
        (selectedText) => this.handleAddClauseFromContextMenu(selectedText),
        (target) => this.isInEditableArea(target)
      );

      console.log('Context menu initialized successfully');
    },

    /**
     * Check if target is in editable area (Content or Notes editor)
     */
    isInEditableArea(target) {
      if (!target || !(target instanceof HTMLElement)) {
        return false;
      }

      const ckEditorElement = target.closest('.ck-editor__editable');
      if (!ckEditorElement) {
        return false;
      }

      const contentEditor = ckEditorElement.closest('.clauses-container');
      const isContentOrNotes = ckEditorElement.closest('[class*="content"]') ||
        ckEditorElement.closest('[class*="notes"]');

      const result = !!(contentEditor || isContentOrNotes);
      console.log('isInEditableArea:', result);
      return result;
    },

    /**
     * Handle adding clause from context menu
     * @param {String} selectedText - Selected text to add
     */
    handleAddClauseFromContextMenu(selectedText) {
      console.log('Adding clause from context menu:', selectedText);

      if (!this.documentApi) {
        console.error('documentApi is not available');
        return;
      }

      // Ensure clauses array exists
      if (!this.newItem.clauses) {
        this.newItem.clauses = [''];
      }

      // Use global API function to add text to clauses
      const result = this.documentApi.addTextToClausesArray(
        selectedText,
        this.newItem.clauses
      );

      // Update clauses
      this.newItem.clauses = result.clauses;

      console.log('Updated clauses:', this.newItem.clauses);

      // Show success notification
      notify({
        type: 'success',
        title: 'Success',
        text: 'Text added to clauses successfully!'
      });

      // Focus on the newly added/filled clause editor
      this.$nextTick(() => {
        if (this.$refs.clauseEditor) {
          this.documentApi.focusClauseEditor(
            this.$refs.clauseEditor,
            result.targetIndex
          );
        }
      });
    },

    // ==================== END CONTEXT MENU METHODS ====================

    handleSubmit() {
      this.$refs.form.validate().then(valid => {
        if (valid.valid) {
          this.$emit('update');
        }
      });
    },
    handleFrameworkChange(newFrameworkIds) {
      this.$emit('framework-changed', newFrameworkIds);
    },
    removeClause(index) {
      this.$emit('remove-clause', index);
    },
    isFieldHidden(fieldName) {
      if (!Array.isArray(this.fieldsFromTargetStep)) return false;
      const fieldConfig = this.fieldsFromTargetStep.find((f) => f.name === fieldName);
      return fieldConfig?.status === "hidden";
    },
    isFieldDisabled(fieldName) {
      if (!Array.isArray(this.fieldsFromTargetStep)) return false;
      const fieldConfig = this.fieldsFromTargetStep.find((f) => f.name === fieldName);
      return fieldConfig?.status === "disabled";
    },
    isFieldRequired(fieldName) {
      if (!Array.isArray(this.fieldsFromTargetStep)) return false;
      const fieldConfig = this.fieldsFromTargetStep.find((f) => f.name === fieldName);
      return fieldConfig?.status === "required";
    },
    isImage(path) {
      if (!path) return false;
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
      return imageExtensions.some((ext) => path.toLowerCase().endsWith(ext));
    },
  },
};
</script>

<style scoped>
.editor-wrapper {
  margin-top: 10px;
}

.required::after {
  content: " *";
  color: red;
}

.text-error {
  color: #d32f2f;
  font-size: 0.875rem;
}

.form-check-input {
  cursor: pointer;
}

.form-check-input:disabled {
  cursor: not-allowed;
}

/* Context Menu Styles */
:deep(.custom-context-menu) {
  animation: fadeInMenu 0.15s ease-out;
}

@keyframes fadeInMenu {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

:deep(.context-menu-item) {
  user-select: none;
}

:deep(.context-menu-item:active) {
  background-color: #e9ecef !important;
}

/* Highlight selected text in editors */
:deep(.ck-editor ::selection) {
  background-color: #b4d5fe;
}
</style>