<template>
  <!-- Main Page layout -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'centerpolicy.centerpolicy'"
    :subPage="'centerpolicy.centerpolicy'" :titlePage="'centerpolicy.centerpolicy'">

    <!-- DataTable slot -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="{}" :editItem="editItem" :hideActions="hideActions">
        <template #document="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <v-chip small class="ma-1" color="primary">
              <!-- Add loading state -->
              <template v-if="isLoadingDocumentNames">
                <v-progress-circular indeterminate size="16" width="2" class="mr-2"></v-progress-circular>
                Loading...
              </template>
              <template v-else>
                {{ getDocumentName(item.document_ids) }}
              </template>
            </v-chip>
          </div>
        </template>
      </DataTable>
    </template>
  </main-page>

  <!-- Enhanced Vuetify Modal -->
  <v-dialog v-model="showModal" max-width="700px" persistent>
    <v-card class="elegant-modal">
      <!-- Premium Header -->
      <v-toolbar flat dark class="modal-header">
        <div class="header-shine"></div>
        <div class="header-content">
          <div class="header-left">
            <div class="icon-badge">
              <v-icon color="white">mdi-file-document-plus</v-icon>
            </div>
            <div class="title-section">
              <v-toolbar-title class="header-title">
                {{ isEditing ? $t('centerpolicy.Edit Policy') : $t('centerpolicy.Add Policy') }}
              </v-toolbar-title>
              <span class="header-subtitle">
                {{ isEditing ? $t('centerpolicy.Update policy information') : $t('centerpolicy.Create new policydocument') }}
              </span>
            </div>
          </div>
          <v-btn icon @click="closeModal" size="small" class="close-button">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </div>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Form Content -->
      <v-card-text class="modal-body">
        <v-form ref="form">
          <!-- Policy Name Section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <v-icon color="white" size="small">mdi-text-box</v-icon>
              </div>
              <div class="section-title d-flex rtl">
                <h3>{{ $t('centerpolicy.Policy Name') }}</h3>
                <span>{{ $t('centerpolicy.Enter descriptive policy name') }}</span>
              </div>
            </div>

            <v-text-field v-model="newItem.name" placeholder="Enter policy name" variant="outlined"
              density="comfortable" color="primary" required hide-details="auto"
              :rules="[v => !!v || $t('centerpolicy.Name is required')]">
              <template v-slot:prepend-inner>
                <v-icon color="primary" size="small">mdi-rename-box</v-icon>
              </template>
            </v-text-field>
          </div>

          <!-- Documents Section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon" style="background: linear-gradient(135deg, #d0b5e3 0%, #b89dd4 100%);">
                <v-icon color="white" size="small">mdi-file-document-multiple</v-icon>
              </div>
              <div class="section-title d-flex rtl">
                <h3>{{ $t('centerpolicy.Select Document') }}</h3>
                <span>{{ $t('centerpolicy.Choose associated documents') }}</span>
              </div>
            </div>

            <v-select v-model="newItem.document_ids" :items="documents" item-title="name" item-value="id"
              placeholder="Choose one or more documents" multiple variant="outlined" density="comfortable"
              color="primary" prepend-inner-icon="mdi-file-document-multiple-outline" hide-details="auto" chips
              closable-chips return-object>
              <template v-slot:chip="{ item }">
                <v-chip size="small" color="primary" variant="tonal" closable>
                  <v-icon start size="16">mdi-file-document</v-icon>
                  {{ item.title }}
                </v-chip>
              </template>
              <template v-slot:selection="{ item, index }">
                <v-chip v-if="index < 3" size="small" color="primary" variant="tonal" class="ma-1">
                  <v-icon start size="16">mdi-file-document</v-icon>
                  {{ item.title }}
                </v-chip>
                <span v-if="index === 3" class="text-grey-darken-1 text-caption ml-2">
                  (+{{ newItem.document_ids.length - 3 }} {{ $t('centerpolicy.others') }})
                </span>
              </template>
            </v-select>
          </div>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Enhanced Footer -->
      <v-card-actions class="modal-footer">
        <div class="footer-info">
          <v-icon size="small" color="primary">mdi-information-outline</v-icon>
          <span>{{ $t('centerpolicy.All fields are required') }}</span>
        </div>

        <v-spacer></v-spacer>

        <v-btn variant="outlined" color="grey-darken-1" @click="closeModal" class="cancel-btn" size="large">
          <v-icon start>mdi-cancel</v-icon>
          {{ $t('centerpolicy.Cancel') }}
        </v-btn>

        <v-btn color="primary" variant="elevated" :disabled="!newItem.name || newItem.document_ids.length === 0"
          @click="submitForm" class="save-btn" size="large">
          <v-icon start>mdi-content-save</v-icon>
          {{ isEditing ? $t('centerpolicy.Update') : $t('centerpolicy.Save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import centerpolicy from "@/API/CenterPolicy/CenterPolicy";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import DocumentCategory from "@/API/DocumentCategory/DocumentCategory";
import Document from "@/API/Document/Document";
import { notify } from "@kyvg/vue3-notification";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {
        name: '',
        document_ids: [],
      },
      categories: [],
      documents: [],
      showModal: false,
      isEditing: false,
      isLoadingDocumentNames: true,
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        return {
          edit: true,
          delete: true,
        };
      };
    },
  },

  created() {
    this.tableColumns = [
      { title: this.$t("centerpolicy.policy-name"), data: "name", defaultContent: "N/A", id: "name" },
      { id: "document", title: this.$t("centerpolicy.document"), data: "", defaultContent: "N/A" },
    ];
  },

  async mounted() {
    await this.loadDocuments();
  },

  methods: {
    async loadDocuments() {
      this.isLoadingDocumentNames = true; // Start loading
      try {
        let type = ["policy", "standard"];
        let typeCategory = type.join(",");

        this.categories = await this.DocumentCategoryApi.getAll({
          filterIn: `type|${typeCategory}`,
          select: "id"
        });

        const categoryIds = this.categories.map(category => category.id);
        if (categoryIds.length > 0) {
          this.documents = await this.DocumentApi.getAll({
            filterIn: `category_id|${categoryIds.join(',')}`,
            select: "id|name"
          });
        }
      } catch (error) {
        console.error("Error loading documents:", error);
        notify({
          title: this.$t("centerpolicy.error"),
          text: "Failed to load documents",
          type: "error",
        });
      } finally {
        this.isLoadingDocumentNames = false; // End loading
      }
    },
    getDocumentName(docs) {
      if (!docs || !Array.isArray(docs) || docs.length === 0) return 'No documents';

      const documentNames = docs.map(documentId => {
        const doc = this.documents.find(d => d.id === documentId);
        return doc ? doc.name : 'Unknown';
      });

      return documentNames.join(', ');
    },
    openForm() {
      this.isEditing = false;
      this.newItem = {
        name: '',
        document_ids: []
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.newItem = { name: '', document_ids: [] };
    },

    async submitForm() {
      if (!this.$refs.form.validate()) {
        return;
      }

      try {
        // Prepare the base payload
        const payload = {
          name: this.newItem.name,
          document_ids: this.newItem.document_ids.map(doc => doc.id)
        };

        console.log("payload", payload);

        let response;
        if (this.isEditing) {
          // For update, include the ID in the payload
          const updatePayload = {
            ...payload,
            id: this.newItem.id  // Merge the ID into the payload
          };
          response = await this.api.update(updatePayload);
        } else {
          response = await this.api.insert(payload);
        }

        console.log("response", response);

        if (response.status === "success") {
          notify({
            title: this.$t("centerpolicy.successfully"),
            text: "The operation was completed successfully!",
            type: "success",
          });
          this.closeModal();
          this.$refs.table.refreshTable();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        notify({
          title: this.$t("centerpolicy.error"),
          text: "An error occurred while processing your request",
          type: "error",
        });
      }
    },

    editItem(data) {
      this.isEditing = true;
      this.newItem = {
        id: data.id,
        name: data.name,
        document_ids: data.document_ids.map(id => {
          const doc = this.documents.find(d => d.id === id);
          return doc || id; // Return the document object if found, or just the ID
        })
      };
      this.showModal = true;
    }
  },

  setup() {
    const api = new centerpolicy();
    const DocumentCategoryApi = new DocumentCategory();
    const DocumentApi = new Document();
    return {
      api,
      DocumentCategoryApi,
      DocumentApi,
    };
  },
};
</script>

<style scoped>
/* Modal Container */
.elegant-modal {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Premium Header */
.modal-header {
  background: linear-gradient(135deg, #44225c 0%, #6b3689 50%, #44225c 100%);
  background-size: 200% 100%;
  padding: 1rem 1.5rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
  border-radius: 12px 12px 0 0;
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.header-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  animation: shine 3s infinite;
  pointer-events: none;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
}

.icon-badge {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.close-button {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.9);
  border-color: #dc2626;
  transform: rotate(90deg) scale(1.1);
}

/* Modal Body */
.modal-body {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f4f9 100%);
}

/* Form Sections */
.form-section {
  background: white;
  border-radius: 10px;
  padding: 1.125rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(68, 34, 92, 0.1);
  transform: translateY(-1px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.section-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.3);
}

.section-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.section-title h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-title span {
  font-size: 0.6875rem;
  color: #6b7280;
  font-weight: 400;
}

/* Field Styling */
:deep(.v-field) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(68, 34, 92, 0.1);
}

/* Chip Styling */
:deep(.v-chip) {
  font-weight: 500;
}

:deep(.v-chip .v-icon) {
  opacity: 0.8;
}

/* Modal Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
}

.cancel-btn {
  border-radius: 8px;
  padding: 0 1.5rem;
  font-weight: 600;
  border: 2px solid #d1d5db;
  color: #4b5563;
  transition: all 0.3s ease;
  text-transform: none;
}

.cancel-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.save-btn {
  border-radius: 8px;
  padding: 0 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.3);
  transition: all 0.3s ease;
  text-transform: none;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6b3689 0%, #8b5cf6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(68, 34, 92, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 600px) {
  .header-title {
    font-size: 1.125rem;
  }

  .header-subtitle {
    font-size: 0.6875rem;
  }

  .icon-badge {
    width: 36px;
    height: 36px;
  }

  .modal-body {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }

  .footer-info {
    display: none;
  }

  .modal-footer {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .cancel-btn,
  .save-btn {
    flex: 1;
  }
}

.v-toolbar {
  background-color: transparent !important;
}

.v-card-text {
  padding-bottom: 0;
}

.gap-1 {
  gap: 4px;
}

.v-toolbar {
  background-color: transparent !important;
}

.v-card-text {
  padding-bottom: 0;
}
</style>