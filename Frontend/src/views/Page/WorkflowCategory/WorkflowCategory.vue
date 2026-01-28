<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'CONFIGURATIONS'"
    :subPage="'workflowcategory.workflowcategory'"
    :titlePage="'workflowcategory.workflowcategory'"
  >
    <template #datatable>
      <div class="workflow-category-container">
        <!-- Header Section -->
        <div class="workflow-header">
          <h1 class="workflow-title">{{ $t("workflowcategory.workflow_categories") }}</h1>
          <button @click="openModal" class="btn-add-category">
            <span class="plus-icon">+</span>
            {{ $t("workflowcategory.add_category") }}
          </button>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="loader-container">
          <div class="loader-spinner"></div>
          <p class="loader-text">{{ $t("workflowcategory.loading_categories") }}</p>
        </div>

        <div v-else class="category-grid">
          <div
            v-for="(item, index) in workflowCategories"
            :key="index"
            class="category-card"
          >
            <!-- Card Header with Icon and Title -->
            <div class="card-header">
              <div class="icon-container">
                <i class="fa-solid fa-sitemap"></i>
              </div>
              <div class="title-section">
                <h3 class="card-title">{{ item.name }}</h3>
                <p class="card-code">{{ item.code }}</p>
              </div>
            </div>

            <!-- Divider Line -->
            <div class="card-divider"></div>

            <!-- Details Button and Action Icons -->
            <div class="card-footer">
              <router-link :to="`/workflow-category/${item.id}`" class="btn-details">
                <i class="fa-solid fa-circle-info"></i>
                {{ $t("workflowcategory.details") }}
              </router-link>

              <div class="action-buttons">
                <button @click="openEditModal(item)" class="btn-icon btn-edit">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button @click="deleteItem(item.id)" class="btn-icon btn-delete">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </main-page>

  <!-- Modal Dialog - Redesigned with Vuetify -->
  <v-dialog v-model="isModalOpen" persistent max-width="800px">
    <v-card class="kpi-modal-card" style="background: #f5f5f5">
      <!-- Header -->
      <v-card-title class="modal-header">
        <span class="modal-title">
          {{ isEditing ? $t("workflowcategory.edit_workflow_category") : $t("workflowcategory.add_workflow_category") }}
        </span>
        <div class="cursor" @click="closeModal">
          <svg
            width="12"
            height="13"
            viewBox="0 0 12 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 1.5L1 11.5M11 11.5L1 1.5"
              stroke="#404040"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </v-card-title>

      <v-card-text class="modal-content">
        <v-form ref="form" v-model="valid" lazy-validation>
          <fieldset :disabled="modalDisabled" class="fieldset-wrapper">
            <div class="card p-4 mb-0">
              <!-- Name and Model Type Row -->
              <v-row>
                <v-col cols="12" sm="6">
                  <label class="field-label">
                    {{ $t("workflowcategory.name") }} <span class="required-star">*</span>
                  </label>
                  <v-text-field
                    v-model="formData.name"
                    variant="outlined"
                    density="compact"
                    :placeholder="$t('workflowcategory.enter_category_name')"
                    :rules="[(v) => !!v || $t('workflowcategory.name_required')]"
                    class="custom-text-field"
                    hide-details="auto"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <label class="field-label">
                    {{ $t("workflowcategory.model_type") }} <span class="required-star">*</span>
                  </label>
                  <v-select
                    v-model="formData.model_type"
                    :items="modelOptions"
                    item-title="name"
                    item-value="name"
                    variant="outlined"
                    density="compact"
                    :placeholder="$t('workflowcategory.select_model_type')"
                    :rules="[(v) => !!v || $t('workflowcategory.model_type_required')]"
                    class="custom-text-field"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <!-- Workflow Steps Section -->
              <div class="workflow-steps-section">
                <div class="steps-header">
                  <h6 class="section-label">{{ $t("workflowcategory.workflow_steps") }}</h6>
                  <button
                    v-if="!modalDisabled"
                    type="button"
                    @click="addItem"
                    class="btn-add-step"
                  >
                    + {{ $t("workflowcategory.add_step") }}
                  </button>
                </div>

                <!-- Steps List -->
                <div class="steps-list">
                  <div
                    v-for="(step, index) in formData.steps"
                    :key="`step-${index}`"
                    class="step-item"
                    :class="{ dragging: draggedIndex === index }"
                    draggable="true"
                    @dragstart="dragStart($event, index)"
                    @dragover.prevent="dragOver($event, index)"
                    @drop="drop($event, index)"
                    @dragend="dragEnd"
                  >
                    <div class="drag-handle">
                      <span class="dot"></span>
                      <span class="dot"></span>
                      <span class="dot"></span>
                      <span class="dot"></span>
                      <span class="dot"></span>
                      <span class="dot"></span>
                    </div>

                    <v-text-field
                      v-model="step.name"
                      variant="outlined"
                      density="compact"
                      :placeholder="$t('workflowcategory.step_name')"
                      :rules="[(v) => !!v || $t('workflowcategory.step_name_required')]"
                      class="step-input"
                      hide-details="auto"
                    />

                    <button
                      type="button"
                      @click="removeItem(index)"
                      class="btn-delete-step"
                      :disabled="formData.steps.length <= 1"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        </v-form>
      </v-card-text>

      <!-- Footer Actions -->
      <v-card-actions class="modal-actions">
        <button class="cancel-btn" @click="closeModal" type="button">
          {{ $t("workflowcategory.cancel") }}
        </button>
        <button
          v-if="!modalDisabled"
          class="save-btn"
          @click="submitForm"
          type="button"
          :disabled="submitting || !valid"
        >
          <v-progress-circular
            v-if="submitting"
            indeterminate
            size="16"
            width="2"
            class="mr-1"
          />
          <span v-else>{{ $t("workflowcategory.save") }}</span>
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import workflowcategory from "@/API/WorkflowCategory/WorkflowCategory";
import MainPage from "@/components/MainPage.vue";
import Permission from "@/API/Permission/Permission";

export default {
  setup() {
    const permissionApi = new Permission();
    return {
      permissionApi,
    };
  },
  components: {
    MainPage,
  },
  data() {
    return {
      isModalOpen: false,
      isEditing: false,
      modalDisabled: false,
      workflowCategories: [],
      formData: {
        id: null,
        name: "",
        model_type: "",
        steps: [{ name: "" }],
      },
      loading: false,
      submitting: false,
      draggedIndex: null,
      itemToDelete: null,
      valid: true,
      modelOptions: [],
    };
  },

  created() {
    this.api = new workflowcategory();
    this.apiParams = { filter: "email|superadmin@encyclopedia.com" };
  },

  async mounted() {
    this.fetchData();
    this.modelOptions = await this.permissionApi.getAll({ select: "id|name" });
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const params = {
          with: ["workflows"],
          select: "id|name|code|steps|model_type",
        };
        const response = await this.api.getAll(params);
        this.workflowCategories = response;
      } catch (error) {
        console.error("Error fetching workflow categories:", error);
      } finally {
        this.loading = false;
      }
    },

    openModal() {
      this.isEditing = false;
      this.resetForm();
      this.modalDisabled = false;
      this.isModalOpen = true;
    },

    openEditModal(item) {
      this.isEditing = true;
      this.formData = {
        id: item.id,
        name: item.name,
        model_type: item.model_type,
        steps: item.steps.map((step) => ({ name: step.name })),
      };
      this.modalDisabled = Array.isArray(item.workflows) && item.workflows.length > 0;
      this.isModalOpen = true;
    },

    closeModal() {
      this.isModalOpen = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        id: null,
        name: "",
        model_type: "",
        steps: [{ name: "" }],
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    addItem() {
      this.formData.steps.push({ name: "" });
    },

    removeItem(index) {
      if (this.formData.steps.length > 1) {
        this.formData.steps.splice(index, 1);
      }
    },

    async submitForm() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      this.submitting = true;
      try {
        const response = await this.api.from(this.formData);
        if (Array.isArray(response) && response[1]?.status === "success") {
          this.closeModal();
          await this.fetchData();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        this.submitting = false;
      }
    },

    async deleteItem(id) {
      if (!confirm("Are you sure you want to delete this category?")) return;

      this.itemToDelete = id;
      try {
        await this.api.delete(this.itemToDelete);
        await this.fetchData();
      } catch (error) {
        console.error("Error deleting workflow category:", error);
      }
    },

    dragStart(event, index) {
      this.draggedIndex = index;
      event.dataTransfer.effectAllowed = "move";
    },

    dragOver(event, index) {
      if (this.draggedIndex !== null && this.draggedIndex !== index) {
        const draggedItem = this.formData.steps[this.draggedIndex];
        this.formData.steps.splice(this.draggedIndex, 1);
        this.formData.steps.splice(index, 0, draggedItem);
        this.draggedIndex = index;
      }
    },

    drop(event) {
      event.preventDefault();
    },

    dragEnd() {
      this.draggedIndex = null;
    },
  },
};
</script>

<style scoped>
/* ============================================ */
/* PAGE CONTAINER STYLES */
/* ============================================ */
.workflow-category-container {
  padding: 24px;
  background: #fff;
  min-height: 100vh;
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}
[dir="rtl"] .workflow-header{
  flex-direction: row-reverse;
}
.workflow-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.btn-add-category {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6e3894;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3);
}

.btn-add-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(110, 56, 148, 0.4);
  background: #5a2d78;
}

.plus-icon {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

/* Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #6e3894;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader-text {
  color: #718096;
  font-size: 14px;
}

/* ============================================ */
/* CATEGORY CARDS GRID */
/* ============================================ */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.category-card {
  background-color: #f5f5f5;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  background-color: #f5f5f5;
}

.icon-container {
  width: 56px;
  height: 56px;
  background: #e8e5f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-container i {
  color: #1f1f1f;
  font-size: 26px;
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  color: #1f1f1f;
  margin: 0;
  line-height: 1.4;
}

.card-code {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.card-divider {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background-color: #f5f5f5;
  border-top: none;
  padding: 0;
}

.btn-details {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #9b8dd4;
  color: #ffffff;
  border: none;
  border-radius: 28px;
  font-size: 12px;
  height: 25px;
  padding: 0 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn-details:hover {
  background: #8677c4;
  transform: translateY(-1px);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.btn-icon {
  width: 32px;
  height: 26px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2.5px solid;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
}

.btn-edit {
  border-color: #C4951B;
  color: #C4951B;
}

.btn-edit:hover {
  background: #fffbeb;
  transform: translateY(-2px);
}

.btn-delete {
  border-color: #A92525;
  color: #A92525;
}

.btn-delete:hover {
  background: #fef2f2;
  transform: translateY(-2px);
}

/* ============================================ */
/* MODAL CARD STYLES */
/* ============================================ */
.cursor {
  cursor: pointer;
}

.kpi-modal-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 15px 0 !important;
  background: #f5f5f5;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #000;
}

.modal-content {
  padding: 0 15px !important;
  background: #f5f5f5;
  max-height: 600px;
  overflow-y: auto;
}

/* ============================================ */
/* CARD CONTAINER */
/* ============================================ */
.card {
  background-color: #fff;
  border-radius: 10px;
}

.p-4 {
  padding: 16px;
}

.mb-0 {
  margin-bottom: 0;
}

/* ============================================ */
/* FORM FIELDS */
/* ============================================ */
.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #404040;
  margin-bottom: 8px;
  display: block;
}

.required-star {
  color: #dc2626;
  margin-left: 2px;
}

:deep(.custom-text-field .v-field) {
  border-radius: 8px !important;
  background-color: #ffffff;
}

:deep(.custom-text-field .v-field__input) {
  padding: 10px 14px;
  font-size: 14px;
  min-height: 40px !important;
}

/* ============================================ */
/* WORKFLOW STEPS SECTION */
/* ============================================ */
.workflow-steps-section {
  margin-top: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.btn-add-step {
  background: #6e3894;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 32px;
}

.btn-add-step:hover {
  background: #5b2d7a;
}

/* ============================================ */
/* STEPS LIST */
/* ============================================ */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F5F5F5;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: grab;
}

.step-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.step-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.drag-handle {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
  padding: 4px;
  cursor: grab;
  flex-shrink: 0;
}

.dot {
  width: 3px;
  height: 3px;
  background: #9ca3af;
  border-radius: 50%;
}

:deep(.step-input .v-field) {
  border-radius: 8px !important;
  background-color: #ffffff;
}

:deep(.step-input .v-field__input) {
  padding: 8px 12px;
  font-size: 14px;
  min-height: 36px !important;
}

.btn-delete-step {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #A92525;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-delete-step:hover:not(:disabled) {
  border-color: #A92525;
  background: #fef2f2;
}

.btn-delete-step:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ============================================ */
/* FOOTER ACTIONS */
/* ============================================ */
.modal-actions {
  padding: 12px 24px !important;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  background: #f5f5f5;
}

.cancel-btn {
  border: 1px solid #6e3894 !important;
  color: #43235c !important;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  padding: 0 24px !important;
  border-radius: 10px !important;
  cursor: pointer;
  background: transparent;
  height: 36px;
}

.cancel-btn:hover {
  background: #f3e8ff;
}

.save-btn {
  background: #6e3894 !important;
  color: #ffffff !important;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  padding: 0 24px !important;
  border-radius: 10px !important;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
}

.save-btn:hover:not(:disabled) {
  background: #5b2d7a !important;
}

.save-btn:disabled {
  background: #d1d5db !important;
  cursor: not-allowed;
}

/* ============================================ */
/* FIELDSET DISABLED STATE */
/* ============================================ */
.fieldset-wrapper {
  border: none;
  padding: 0;
  margin: 0;
}

fieldset:disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* ============================================ */
/* SCROLLBAR STYLING */
/* ============================================ */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* ============================================ */
/* RESPONSIVE */
/* ============================================ */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .workflow-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-add-category {
    width: 100%;
    justify-content: center;
  }

  .modal-header {
    padding: 12px 16px 0 !important;
  }

  .modal-content {
    padding: 0 12px !important;
  }

  .modal-actions {
    padding: 12px 16px !important;
  }

  .card-footer {
    flex-wrap: wrap;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
[dir="rtl"] .category-grid {
  direction: rtl;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row{
text-align: end;
}
</style>