<template>
  <v-dialog v-model="internalVisible" max-width="500" persistent>
    <v-card class="upload-file-modal elevation-8">
      <!-- Header -->
      <v-card-title class="modal-header pa-4">
        <div class="d-flex justify-space-between align-center w-100">
          <h3 class="modal-title">Upload File</h3>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="$emit('close')"
            class="close-icon-btn"
          >
            <i class="fas fa-times"></i>
          </v-btn>
        </div>
      </v-card-title>

      <!-- Content Area -->
      <v-card-text class="pa-6">
        <!-- Upload Area -->
        <div class="upload-dropzone" @click="triggerFileUpload">
          <div class="upload-content">
            <div class="upload-icon-wrapper mb-3">
              <i class="fas fa-file-upload upload-icon"></i>
            </div>
            <p class="upload-text">Upload File</p>
          </div>
        </div>

        <!-- File List -->
        <div v-if="files && files.length > 0" class="file-list mt-4">
          <div
            v-for="(file, index) in files"
            :key="file.id || file.name"
            class="file-item"
          >
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center flex-grow-1">
                <i class="fas fa-paperclip file-clip-icon mr-2"></i>

                <!-- Edit Mode -->
                <template v-if="editingFile === file">
                  <input
                    type="file"
                    @change="handleFileInput"
                    class="edit-file-input"
                    :disabled="loading && loadingFileId === getFileId(file)"
                  />
                </template>

                <!-- Normal Mode -->
                <template v-else>
                  <span class="file-name-text">{{
                    getFileName(file, index)
                  }}</span>
                </template>
              </div>

              <!-- Loading Spinner -->
              <div
                v-if="loading && loadingFileId === getFileId(file)"
                class="loading-spinner"
              >
                <i class="fas fa-spinner fa-spin"></i>
              </div>

              <!-- Action Buttons -->
              <div v-else class="action-buttons">
                <!-- Normal Mode Actions -->
                <template v-if="editingFile !== file">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click="handleView(file)"
                    class="action-btn-small"
                    v-if="canEdit"
                  >
                    <i class="far fa-eye"></i>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click="handleEditClick(file)"
                    class="action-btn-small"
                    v-if="canEdit"
                  >
                    <i class="far fa-edit"></i>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click="showDeleteDialog(file)"
                    class="action-btn-small delete-action"
                    v-if="canDelete"
                  >
                    <i class="far fa-trash-alt"></i>
                  </v-btn>
                </template>

                <!-- Edit Mode Actions -->
                <template v-else>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click="handleEditConfirm"
                    :disabled="!editedFile"
                    class="action-btn-small confirm-action"
                  >
                    <i class="fas fa-check"></i>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    @click="handleEditCancel"
                    class="action-btn-small cancel-action"
                  >
                    <i class="fas fa-times"></i>
                  </v-btn>
                </template>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="modal-footer pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          class="cancel-btn"
          variant="flat"
          size="large"
          @click="$emit('close')"
          :disabled="loading"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card class="delete-confirmation-card">
        <v-card-title class="delete-header pa-4">
          <h3 class="delete-title">{{ $t("common.confirm_delete") }}</h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="delete-message">
            {{ $t("common.delete_confirmation_message") }}
          </p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="deleteDialog = false"
            class="cancel-delete-btn"
          >
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn
            variant="flat"
            @click="confirmDelete"
            class="confirm-delete-btn"
          >
            {{ $t("common.delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
export default {
  name: "FileActionsModal",
  props: {
    visible: { type: Boolean, default: false },
    files: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    loadingFileId: { type: [String, Number], default: null },
    canUpload: { type: Boolean, default: true },
    canEdit: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: true },
  },
  data() {
    return {
      internalVisible: this.visible,
      editingFile: null,
      editedFile: null,
      deleteDialog: false,
      fileToDelete: null,
    };
  },
  watch: {
    visible(val) {
      this.internalVisible = val;
    },
    internalVisible(val) {
      if (!val) this.$emit("close");
    },
  },
  methods: {
    getFileName(file, index) {
      if (!file) return "";

      // Try to extract the real extension
      let extension = "";
      if (file.name && file.name.includes(".")) {
        extension = file.name.split(".").pop();
      } else if (file.filePath && file.filePath.includes(".")) {
        extension = file.filePath.split(".").pop();
      } else if (typeof file === "string" && file.includes(".")) {
        extension = file.split(".").pop();
      }

      // Default to "fileX.ext"
      return `file${index + 1}${extension ? "." + extension : ""}`;
    },

    getFileId(file) {
      return file.id || file.name || file.filePath || JSON.stringify(file);
    },

    handleView(file) {
      const url = file.url || file.filePath || file.path || file;
      if (url) window.open(url, "_blank");
    },

    handleEditClick(file) {
      this.editingFile = file;
      this.editedFile = null;
      this.$emit("edit-start", this.getFileId(file));
    },

    handleFileInput(e) {
      this.editedFile = e.target.files[0];
    },

    handleEditConfirm() {
      if (this.editedFile && this.editingFile) {
        this.$emit("edit", {
          oldFile: this.editingFile,
          newFile: this.editedFile,
          fileId: this.getFileId(this.editingFile),
        });
      }
    },

    handleEditCancel() {
      this.editingFile = null;
      this.editedFile = null;
      this.$emit("edit-cancel");
    },

    showDeleteDialog(file) {
      this.fileToDelete = file;
      this.deleteDialog = true;
      this.$emit("delete-start", this.getFileId(file));
    },

    confirmDelete() {
      if (this.fileToDelete) {
        this.$emit("delete", {
          file: this.fileToDelete,
          fileId: this.getFileId(this.fileToDelete),
        });
      }
      this.deleteDialog = false;
      this.fileToDelete = null;
    },

    triggerFileUpload() {
      if (!this.canUpload) return;
      const input = document.createElement("input");
      input.type = "file";
      input.onchange = (e) => this.handleUpload(e);
      input.click();
    },

    handleUpload(e) {
      if (e.target.files.length > 0) {
        this.$emit("upload", e.target.files[0]);
        e.target.value = "";
      }
    },
  },
};
</script>

<style scoped>
/* Modal Card */
.upload-file-modal {
  border-radius: 12px !important;
  overflow: hidden;
  background: #ffffff;
}

/* Header */
.modal-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px !important;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-icon-btn {
  color: #6b7280 !important;
  width: 32px !important;
  height: 32px !important;
}

.close-icon-btn:hover {
  background: rgba(107, 114, 128, 0.1) !important;
}

/* Upload Dropzone */
.upload-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-dropzone:hover {
  border-color: #9ca3af;
  background: #f3f4f6;
}

.upload-content {
  pointer-events: none;
}

.upload-icon-wrapper {
  width: 56px;
  height: 10px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.upload-icon {
  font-size: 22px;
  color: #9ca3af;
}

.upload-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* File List */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  padding: 4px 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f3f4f6;
}

.file-clip-icon {
  font-size: 16px;
  color: #8b5cf6;
  flex-shrink: 0;
}

.file-name-text {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-file-input {
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  flex-grow: 1;
  max-width: 200px;
}

.edit-file-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.action-btn-small {
  color: #6b7280 !important;
  width: 32px !important;
  height: 32px !important;
}

.action-btn-small:hover {
  background: rgba(107, 114, 128, 0.1) !important;
}

.delete-action {
  color: #ef4444 !important;
}

.delete-action:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.confirm-action {
  color: #22c55e !important;
}

.confirm-action:hover {
  background: rgba(34, 197, 94, 0.1) !important;
}

.cancel-action {
  color: #6b7280 !important;
}

.cancel-action:hover {
  background: rgba(107, 114, 128, 0.1) !important;
}

.loading-spinner {
  color: #8b5cf6;
  font-size: 16px;
  padding: 0 8px;
}

/* Footer */
.modal-footer {
  padding: 0 24px 24px 24px !important;
}

.save-btn {
  background: #8b5cf6 !important;
  color: white !important;
  border-radius: 8px !important;
  font-weight: 600;
  padding: 0 32px !important;
  height: 42px !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #7c3aed !important;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
}

.save-btn:disabled {
  background: #d1d5db !important;
  color: #9ca3af !important;
  cursor: not-allowed;
}

/* Delete Dialog */
.delete-confirmation-card {
  border-radius: 12px !important;
}

.delete-header {
  border-bottom: 1px solid #e5e7eb;
}

.delete-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.delete-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.cancel-delete-btn {
  color: #6b7280 !important;
  text-transform: none !important;
}

.confirm-delete-btn {
  background: #ef4444 !important;
  color: white !important;
  border-radius: 8px !important;
  text-transform: none !important;
}

.confirm-delete-btn:hover {
  background: #dc2626 !important;
}

/* Responsive */
@media (max-width: 600px) {
  .modal-header {
    padding: 12px 16px !important;
  }

  .modal-title {
    font-size: 16px;
  }

  .upload-dropzone {
    padding: 32px 16px;
  }

  .modal-footer {
    padding: 0 16px 16px 16px !important;
  }

  .save-btn {
    width: 100%;
  }

  .file-name-text {
    max-width: 150px;
  }

  .edit-file-input {
    max-width: 120px;
  }
}
</style>
