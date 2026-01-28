<template>
  <v-dialog v-model="dialogVisible" max-width="900px" persistent>
    <v-card class="analysis-modal">
      <v-card-title class="modal-header">
        <span class="modal-title">{{ $t('risk.edit_risk_analysis') }}</span>
        <v-btn icon @click="handleClose" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-body">
        <v-container>
          <v-form ref="analysisForm" @submit.prevent="handleUpdate">
            <v-row>


              <!-- Technology Field -->
              <v-col cols="12" md="6">
                <v-select v-model="localFormData.technology_ids" :items="dropdownOptions.technologyOptions"
                  :label="$t('risk.technology')" item-title="name" item-value="id" multiple chips closable-chips
                  variant="outlined" density="comfortable">
                </v-select>
              </v-col>

              <!-- Impact Scope Field -->
              <v-col cols="12" md="6">
                <v-select v-model="localFormData.impact_scope_id" :items="dropdownOptions.impactScopeOptions"
                  :label="$t('risk.impact_scope')" item-title="name" item-value="id" variant="outlined"
                  density="comfortable">
                </v-select>
              </v-col>

              <!-- Responsible Party Field -->
              <v-col cols="12">
                <v-textarea v-model="localFormData.responsible_party" :label="$t('risk.responsible_party')"
                  :placeholder="$t('risk.enter_responsible_party')" rows="3" variant="outlined" density="comfortable">
                </v-textarea>
              </v-col>
              <!-- Description Field -->
              <v-col cols="12">
                <label class="field-label">{{ $t('risk.description') }}</label>
                <ckeditor 
                  :editor="editor" 
                  v-model="localFormData.description" 
                  :config="editorConfig" 
                  class="ckeditor-wrapper">
                </ckeditor>
              </v-col>
              <!-- KRIs Field -->
              <v-col cols="12">
                <label class="field-label">{{ $t('risk.kris') }}</label>
                <ckeditor :editor="editor" v-model="localFormData.kris" :config="editorConfig" class="ckeditor-wrapper">
                </ckeditor>
              </v-col>

              <!-- Supporting Documentation Field -->
              <v-col cols="12">
                <v-file-input v-model="localFormData.supporting_document" :label="$t('risk.supporting_documentation')"
                  :placeholder="$t('risk.upload_files')" variant="outlined" density="comfortable" show-size
                  prepend-icon="mdi-paperclip" clearable />
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions class="modal-actions">
        <v-spacer></v-spacer>
        <v-btn color="error" :disabled="loading" @click="handleClose" variant="outlined" class="cancel-btn">
          {{ $t('risk.cancel') }}
        </v-btn>
        <v-btn color="primary" :loading="loading" :disabled="loading" @click="handleUpdate" class="save-btn">
          {{ $t('risk.save_details') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default {
  name: 'EditRiskAnalysisModal',
  components: {
    ckeditor: Ckeditor
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      required: true
    },
    dropdownOptions: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show', 'update', 'close'],
  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      localFormData: {
        id: null,
        description: '',
        technology_ids: [],
        impact_scope_id: '',
        responsible_party: '',
        kris: '',
        supporting_document: null
      }
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('update:show', value);
      }
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.resetLocalFormData();
      }
    },
    formData: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.resetLocalFormData();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    resetLocalFormData() {
      this.localFormData = {
        id: this.formData?.id || null,
        description: this.formData?.description || '',
        technology_ids: this.formData?.technology_ids ? [...this.formData.technology_ids] : [],
        impact_scope_id: this.formData?.impact_scope_id || '',
        responsible_party: this.formData?.responsible_party || '',
        kris: this.formData?.kris || '',
        supporting_document: null
      };
    },
    handleFileUpload(file) {
      this.localFormData.supporting_document = file || null;
    },
    handleUpdate() {
      if (!this.localFormData.id) {
        console.error('Missing ID in localFormData');
        return;
      }

      // Create a plain object with all data including description
      const updateData = {
        id: this.localFormData.id,
        description: this.localFormData.description,
        technology_ids: this.localFormData.technology_ids,
        impact_scope_id: this.localFormData.impact_scope_id,
        responsible_party: this.localFormData.responsible_party,
        kris: this.localFormData.kris,
        supporting_document: this.localFormData.supporting_document
      };

      // Emit the update event with the data
      this.$emit('update', updateData);
    },
    handleClose() {
      this.$emit('close');
      this.$emit('update:show', false);
    }
  }
};
</script>

<style scoped>
.v-overlay {
  backdrop-filter: blur(8px);
}

.analysis-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.v-dialog .v-card .v-card-title .v-btn {
  color: black !important;
  background: white !important;
  border-radius: 8px !important;
}

.modal-header {
  background: #F0F0F0;
  color: white !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-weight: 700 !important;
  font-size: 1.25rem !important;
  color: black;
}

.close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem !important;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #6E3894;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #5a2d75;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.ckeditor-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.ckeditor-wrapper:focus-within {
  border-color: #6E3894;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
}

.modal-actions {
  padding: 1rem 1.5rem !important;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.save-btn {
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

.cancel-btn {
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: rgba(211, 47, 47, 0.04) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-body {
    padding: 1rem !important;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .save-btn,
  .cancel-btn {
    width: 100%;
  }
}

/* Vue Select Customization */
:deep(.v-select .v-field) {
  border-radius: 8px;
}

:deep(.v-select .v-field--focused) {
  border-color: #6E3894;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
}

:deep(.v-chip) {
  background-color: #6E3894 !important;
  color: white !important;
}

:deep(.v-textarea .v-field) {
  border-radius: 8px;
}

:deep(.v-file-input .v-field) {
  border-radius: 8px;
}

/* CKEditor Custom Styling */
:deep(.ck-editor__editable) {
  min-height: 200px;
}

:deep(.ck-editor__editable:focus) {
  border-color: #6E3894 !important;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1) !important;
}
</style>