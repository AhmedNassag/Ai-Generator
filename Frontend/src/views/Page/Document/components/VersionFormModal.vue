<template>
  <v-dialog v-model="showLocal" max-width="1200px" persistent>
    <v-card class="version-modal">
      <v-form @submit.prevent="$emit('submit')">
        <!-- Header -->
        <v-card-title class="px-6 py-4 bg-primary text-white">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <v-icon class="mr-3" size="24">
                {{ isEditing ? 'mdi-file-edit' : 'mdi-file-plus' }}
              </v-icon>
              <div>
                <div class="text-h6 font-weight-medium">
                  {{ isEditing && version.versionNumber ? `Edit Version ${version.versionNumber}` : 'Add New Version' }}
                </div>
                <div class="text-caption opacity-80 mt-1">
                  {{ isEditing ? 'Update document version details' : 'Create a new document version' }}
                </div>
              </div>
            </div>
            <v-btn icon variant="text" color="white" @click="$emit('close')" class="ml-4">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <!-- Content -->
        <v-card-text class="pa-0">
          <div class="px-6 py-4" style="max-height: 70vh; overflow-y: auto">
            <v-container fluid class="pa-0">
              <v-row>
                <!-- File Upload Section -->
                <v-col cols="12">
                  <div class="mb-4">
                    <v-label class="text-h6 font-weight-medium text-grey-darken-2 mb-3 d-block">
                      <v-icon class="mr-2" color="primary">mdi-cloud-upload</v-icon>
                      Version File
                    </v-label>
                    <v-card variant="outlined" class="pa-4 file-upload-area">
                      <v-file-input 
                        label="Choose document file" 
                        prepend-icon="" 
                        prepend-inner-icon="mdi-paperclip"
                        @change="$emit('file-upload', $event)" 
                        :show-size="1000" 
                        clearable 
                        variant="outlined"
                        density="comfortable" 
                        hide-details="auto"
                      ></v-file-input>
                      <v-chip 
                        v-if="version.filename" 
                        class="mt-3" 
                        color="success" 
                        variant="tonal"
                        prepend-icon="mdi-file-check"
                      >
                        {{ version.filename }}
                      </v-chip>
                    </v-card>
                  </div>
                </v-col>

                <!-- Version Notes Section -->
                <v-col cols="12">
                  <div class="mb-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <v-label class="text-h6 font-weight-medium text-grey-darken-2 d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-note-text</v-icon>
                        Version Notes
                      </v-label>
                      <v-tooltip text="Right-click on selected text to add to clauses" location="top">
                        <template v-slot:activator="{ props }">
                          <v-chip v-bind="props" size="small" color="info" variant="outlined">
                            <v-icon icon="mdi-gesture-tap-button" size="small" class="mr-1"></v-icon>
                            Right-click to add clause
                          </v-chip>
                        </template>
                      </v-tooltip>
                    </div>
                    <v-card variant="outlined" class="pa-4">
                      <ckeditor 
                        :editor="editor" 
                        v-model="version.notes" 
                        :config="editorConfig"
                        class="editor-wrapper" 
                      />
                    </v-card>
                  </div>
                </v-col>

                <!-- Content Section -->
                <v-col cols="12">
                  <div class="mb-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <v-label class="text-h6 font-weight-medium text-grey-darken-2 d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-file-document</v-icon>
                        Content
                      </v-label>
                      <v-tooltip text="Right-click on selected text to add to clauses" location="top">
                        <template v-slot:activator="{ props }">
                          <v-chip v-bind="props" size="small" color="info" variant="outlined">
                            <v-icon icon="mdi-gesture-tap-button" size="small" class="mr-1"></v-icon>
                            Right-click to add clause
                          </v-chip>
                        </template>
                      </v-tooltip>
                    </div>
                    <v-card variant="outlined" class="pa-4">
                      <ckeditor 
                        :editor="editor" 
                        v-model="version.content" 
                        :config="editorConfig"
                        class="editor-wrapper" 
                      />
                    </v-card>
                  </div>
                </v-col>

                <!-- Clauses Section -->
                <v-col cols="12">
                  <div class="mb-4">
                    <v-label class="text-h6 font-weight-medium text-grey-darken-2 mb-3 d-block">
                      <v-icon class="mr-2" color="primary">mdi-format-list-numbered</v-icon>
                      Clauses
                    </v-label>
                    <v-card variant="outlined" class="pa-4">
                      <div v-for="(clause, index) in version.clauses" :key="index" class="clause-item mb-4">
                        <div class="d-flex align-start">
                          <div class="clause-number mr-3 mt-1">
                            <v-chip size="small" color="primary" variant="tonal">
                              {{ index + 1 }}
                            </v-chip>
                          </div>
                          <div class="flex-grow-1">
                            <ckeditor 
                              :editor="editor" 
                              v-model="version.clauses[index]" 
                              :config="editorConfig"
                              class="editor-wrapper"
                              ref="clauseEditor"
                            />
                          </div>
                          <v-btn 
                            v-if="version.clauses.length > 1" 
                            icon="mdi-delete" 
                            color="error" 
                            variant="text"
                            @click="$emit('remove-clause', index)" 
                            size="small" 
                            class="ml-2 mt-1"
                          ></v-btn>
                        </div>
                        <v-divider v-if="index < version.clauses.length - 1" class="my-4"></v-divider>
                      </div>
                      <v-btn 
                        color="primary" 
                        prepend-icon="mdi-plus" 
                        variant="outlined" 
                        @click="$emit('add-clause')"
                        class="mt-2" 
                        block
                      >
                        Add New Clause
                      </v-btn>
                    </v-card>
                  </div>
                </v-col>

                <!-- Expiry Days -->
                <v-col cols="12">
                  <div class="mb-4">
                    <v-label class="text-h6 font-weight-medium text-grey-darken-2 mb-3 d-block">
                      <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
                      Expiry Days
                    </v-label>
                    <v-card variant="outlined" class="pa-4">
                      <div class="d-flex align-center">
                        <v-text-field 
                          type="number" 
                          v-model="version.expiry_days" 
                          density="comfortable"
                          variant="outlined" 
                          hide-details
                        ></v-text-field>
                      </div>
                    </v-card>
                  </div>
                </v-col>

                <!-- Privacy Section -->
                <v-col cols="12">
                  <div class="mb-4">
                    <v-label class="text-h6 font-weight-medium text-grey-darken-2 mb-3 d-block">
                      <v-icon class="mr-2" color="primary">mdi-shield-check</v-icon>
                      Document Visibility
                    </v-label>

                    <v-card variant="outlined" class="pa-6 privacy-container">
                      <div class="privacy-selection-grid">
                        <!-- Public Access Option -->
                        <div 
                          class="privacy-option" 
                          :class="{ 'selected': version.privacy === 'public' }"
                          @click="version.privacy = 'public'"
                        >
                          <v-card 
                            class="privacy-card h-100" 
                            :class="{
                              'selected-card': version.privacy === 'public',
                              'unselected-card': version.privacy !== 'public'
                            }" 
                            :color="version.privacy === 'public' ? 'primary' : 'transparent'"
                            :variant="version.privacy === 'public' ? 'tonal' : 'outlined'" 
                            elevation="0"
                          >
                            <v-card-text class="pa-5 text-center">
                              <div class="privacy-icon-container mb-4">
                                <v-avatar 
                                  size="64" 
                                  :color="version.privacy === 'public' ? 'success' : 'grey-lighten-2'"
                                  class="privacy-icon-avatar"
                                >
                                  <v-icon size="32" :color="version.privacy === 'public' ? 'white' : 'grey-darken-1'">
                                    mdi-earth
                                  </v-icon>
                                </v-avatar>
                                <v-icon 
                                  v-if="version.privacy === 'public'" 
                                  class="selection-check" 
                                  color="success"
                                  size="24"
                                >
                                  mdi-check-circle
                                </v-icon>
                              </div>

                              <h3 
                                class="privacy-title mb-2"
                                :class="{ 'selected-title': version.privacy === 'public' }"
                              >
                                Public Access
                              </h3>

                              <p 
                                class="privacy-description mb-3"
                                :class="{ 'selected-description': version.privacy === 'public' }"
                              >
                                Available to all users within the organization
                              </p>

                              <v-chip 
                                :color="version.privacy === 'public' ? 'success' : 'grey'"
                                :variant="version.privacy === 'public' ? 'flat' : 'outlined'" 
                                size="small"
                                class="privacy-chip"
                              >
                                <v-icon start size="16">mdi-account-multiple</v-icon>
                                Everyone
                              </v-chip>
                            </v-card-text>
                          </v-card>
                        </div>

                        <!-- Private Access Option -->
                        <div 
                          class="privacy-option" 
                          :class="{ 'selected': version.privacy === 'private' }"
                          @click="version.privacy = 'private'"
                        >
                          <v-card 
                            class="privacy-card h-100" 
                            :class="{
                              'selected-card': version.privacy === 'private',
                              'unselected-card': version.privacy !== 'private'
                            }" 
                            :color="version.privacy === 'private' ? 'primary' : 'transparent'"
                            :variant="version.privacy === 'private' ? 'tonal' : 'outlined'" 
                            elevation="0"
                          >
                            <v-card-text class="pa-5 text-center">
                              <div class="privacy-icon-container mb-4">
                                <v-avatar 
                                  size="64"
                                  :color="version.privacy === 'private' ? 'warning' : 'grey-lighten-2'"
                                  class="privacy-icon-avatar"
                                >
                                  <v-icon size="32" :color="version.privacy === 'private' ? 'white' : 'grey-darken-1'">
                                    mdi-lock
                                  </v-icon>
                                </v-avatar>
                                <v-icon 
                                  v-if="version.privacy === 'private'" 
                                  class="selection-check" 
                                  color="success"
                                  size="24"
                                >
                                  mdi-check-circle
                                </v-icon>
                              </div>

                              <h3 
                                class="privacy-title mb-2"
                                :class="{ 'selected-title': version.privacy === 'private' }"
                              >
                                Private Access
                              </h3>

                              <p 
                                class="privacy-description mb-3"
                                :class="{ 'selected-description': version.privacy === 'private' }"
                              >
                                Restricted to authorized users only
                              </p>

                              <v-chip 
                                :color="version.privacy === 'private' ? 'warning' : 'grey'"
                                :variant="version.privacy === 'private' ? 'flat' : 'outlined'" 
                                size="small"
                                class="privacy-chip"
                              >
                                <v-icon start size="16">mdi-account-lock</v-icon>
                                Restricted
                              </v-chip>
                            </v-card-text>
                          </v-card>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="px-6 py-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey-darken-1" 
            variant="outlined" 
            @click="$emit('close')"
            class="mr-3"
          >
            <v-icon class="mr-2">mdi-cancel</v-icon>
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            type="submit" 
            :loading="isSubmitting" 
            :disabled="isSubmitting" 
            variant="elevated"
            size="large"
          >
            <v-icon class="mr-2">
              {{ isEditing ? 'mdi-content-save' : 'mdi-plus' }}
            </v-icon>
            {{ isEditing ? 'Update Version' : 'Create Version' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Document from "@/API/Document/Document";

export default {
  name: "VersionFormModal",
  components: {
    ckeditor: Ckeditor,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Object,
      required: true,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit", "close", "add-clause", "remove-clause", "file-upload"],
  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 400,
      },
      clauseContextMenuCleanup: null,
      documentApi: null,
    };
  },
  computed: {
    showLocal: {
      get() {
        return this.show;
      },
      set(value) {
        if (!value) {
          this.$emit('close');
        }
      }
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
      if (!this.version.clauses) {
        this.version.clauses = [''];
      }

      // Use global API function to add text to clauses
      const result = this.documentApi.addTextToClausesArray(
        selectedText,
        this.version.clauses
      );

      // Update clauses
      this.version.clauses = result.clauses;

      console.log('Updated clauses:', this.version.clauses);

      // Show success notification (assuming notify is globally available)
      if (typeof notify !== 'undefined') {
        notify({
          type: 'success',
          title: 'Success',
          text: 'Text added to clauses successfully!'
        });
      }

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
  },
  watch: {
    show: {
      handler(newVal) {
        if (!newVal) {
          // Modal is closing, ensure clean state
          this.$emit('close');
        }
      },
      immediate: true
    },
    isEditing: {
      handler(newVal) {
        if (!newVal && this.show) {
          // We're in add mode, ensure the version object is clean
          // This is a safety check in case parent component doesn't reset properly
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.privacy-selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.privacy-option {
  cursor: pointer;
  transition: transform 0.2s;
}

.privacy-option:hover {
  transform: translateY(-2px);
}

.privacy-card {
  transition: all 0.3s ease;
}

.privacy-icon-container {
  position: relative;
  display: inline-block;
}

.selection-check {
  position: absolute;
  top: -5px;
  right: -5px;
}

.editor-wrapper {
  min-height: 150px;
}

.version-modal .v-label {
  display: flex;
  align-items: center;
}
</style>