<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('frameworkcontroltestaudit.frameworkcontroltestaudit')"
    :subPage="$t('frameworkcontroltestaudit.frameworkcontroltestaudit')"
    :titlePage="$t('frameworkcontroltestaudit.frameworkcontroltestaudit')">

    <!-- Slot for rendering the DataTable -->
    <template #datatable v-if="readyToLoad">
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :hideActions="hideActions"
        :openForm="openForm" add-new-button-title="End Audit" add-new-button-icon="mdi-flag-checkered">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>
        <template #audit_name="{ item }"> {{ item?.audit?.audit_name }} </template>
        <template #framework_name="{ item }"> {{ item?.framework_name }} </template>
        <template #control="{ item }"> {{ item?.control?.short_name }} </template>
        <template #start_date="{ item }"> {{ formatDate(item?.audit?.start_date) }} </template>
        <template #open_closed_status="{ item }">
          <span :class="{
            'badge bg-success': item.open_closed_status == 1,
            'badge bg-primary': item.open_closed_status == 0
          }">
            {{ item.open_closed_status == 1 ? 'Audit Closed' : 'Audit Open' }}
          </span>
        </template>
        <template #status="{ item }">
          <span :class="['status-badge', `status-${(item.status || 'undefined').replace(/\s+/g, '-')}`]">
            {{ item.status }}
          </span>
        </template>

        <template #addAction="{ item }">

          <div v-if="isClosedAndNotEnd(item)" style="cursor: pointer;" @click="reopenAudit(item)"
            class="dropdown-item text-muted">
            <i class="fa-solid fa-rotate-right"></i> Reopen
          </div>

          <div v-if="isPending(item.start_date)" class="dropdown-item text-muted">
            <i class="fa-solid fa-clock"></i> Pending
          </div>

          <router-link v-else :to="{ name: 'FrameworkControlTestAudit-Result', params: { id: item.id } }"
            class="dropdown-item" title="Audit Result">
            <i class="fa-solid fa-eye"></i> Show
          </router-link>
        </template>


      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>

  </main-page>

  <div v-if="CloseAuditModal" class="modal-overlay">
    <div class="modal-container">
      <!-- Premium Header -->
      <div class="modal-header">
        <div class="header-shine"></div>
        <div class="header-content">
          <div class="header-left">
            <div class="icon-badge">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="title-section">
              <h3 class="modal-title">
                {{ $t('auditEndModal.select_framework_title') }}
              </h3>
              <span class="modal-subtitle">
                {{ $t('auditEndModal.choose_framework_for_closure') }}
              </span>
            </div>
          </div>
          <button class="modal-close" @click="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-filter"></i>
            </div>
            <div class="section-title d-flex rtl">
              <h4>{{ $t('auditEndModal.available_frameworks') }}</h4>
              <span>{{ $t('auditEndModal.select_framework_to_proceed') }}</span>
            </div>
          </div>

          <div class="select-container">
            <div class="select-wrapper">
              <select v-model="selectedFrameworkId" class="styled-select" :class="{ 'has-value': selectedFrameworkId }">
                <option value="" disabled>
                  {{ $t('auditEndModal.choose_framework_placeholder') }}
                </option>
                <option v-for="framework in frameworks" :key="framework.id" :value="framework.id">
                  {{ framework.title }}
                </option>
              </select>
              <div class="select-icon">
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>

            <div class="hint-text">
              <i class="fas fa-info-circle"></i>
              {{ $t('auditEndModal.framework_selection_hint') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="btn btn-cancel" @click="closeModal()">
          <i class="fas fa-times"></i>
          {{ $t('auditEndModal.cancel_button') }}
        </button>
        <button class="btn btn-confirm" @click="submitForm()" :disabled="!selectedFrameworkId">
          <i class="fas fa-check"></i>
          {{ $t('auditEndModal.confirm_button') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import frameworkcontroltestaudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import frameworks from "@/API/Frameworks/Frameworks";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { useRoute } from "vue-router";
import Auth from "@/API/Auth";
import { notify } from "@kyvg/vue3-notification";
import axios from "axios";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties

    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields
    const frameworksApi = new frameworks();
    // Return properties for setup to be used in the template
    return {
      tableColumns,
      fromFields,
      frameworksApi
    };
  },
  watch: {
    "$route.params.type": {
      immediate: true,
      async handler(newType) {
        // First set readyToLoad to false to unmount the table
        this.readyToLoad = false;
        await this.loadDatatbale(newType);
        // Set readyToLoad to true to mount the table with new data
        this.readyToLoad = true;

      }
    }
  },
  computed: {
    hideActions() {
      return (row) => {
        const now = new Date();
        const startDate = new Date(row.start_date);
        return {
          edit: true,
          // edit: startDate < now,
          delete: true,
        };
      };
    },
  },
  async mounted() {
    this.loggedInUser = Auth.USER;

    this.frameworks = await this.frameworksApi.getAll({ select: "id|title" });
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      readyToLoad: false, // Flag to indicate if the DataTable is ready to load data
      userId: Auth.user,
      api: new frameworkcontroltestaudit(),
      apiParams: {},
      loggedInUser: [],
      frameworks: [],
      CloseAuditModal: false,
      selectedFrameworkId: null,
    };
  },

  created() {
    this.tableColumns = []
    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [

    ];
  },

  methods: {
    async loadDatatbale(Type) {
      // 1. Reset loading state and clear existing data
      this.readyToLoad = false;
      await this.$nextTick(); // Ensure DOM updates if necessary

      // 2. Define base columns (common for all asset types)
      this.tableColumns = [
        { id: "audit_name", title: this.$t("frameworkcontroltestaudit.AuditName"), data: "", defaultContent: "N/A" },
        { id: "framework_name", title: this.$t("frameworkcontroltestaudit.Famework"), data: "", defaultContent: "N/A" },
        { id: "control", title: this.$t("frameworkcontroltestaudit.control"), data: "", defaultContent: "N/A" },
        { title: this.$t("frameworkcontroltestaudit.ComplianceName"), data: "name", defaultContent: "N/A" },
        { id: "open_closed_status", title: this.$t("frameworkcontroltestaudit.AuditResult"), data: "", defaultContent: "N/A" },
        { title: this.$t("frameworkcontroltestaudit.AuditNumber"), data: "test_number", defaultContent: "N/A" },
        // { title: this.$t("frameworkcontroltestaudit.Tester"), data: "tester", defaultContent: "N/A" },
        { id: "start_date", title: this.$t("frameworkcontroltestaudit.IntiationDate"), data: "", defaultContent: "N/A" },
        { title: this.$t("frameworkcontroltestaudit.LastDate"), data: "last_date", defaultContent: "N/A" },
        { title: this.$t("frameworkcontroltestaudit.NextDate"), data: "next_date", defaultContent: "N/A" },
        { id: "status", title: this.$t("frameworkcontroltestaudit.AuditStatus"), data: "", defaultContent: "N/A" },
      ];

      const relations = ["control:short_name", "audit.framework", "audit"];
      let filterType = Type === "active-audit" ? 0 : 1;
      let parentType = 0;

      this.apiParams = {
        with: relations,
        filter: `end_audit_status|${filterType}-integer|=&&is_parent|${parentType}-integer|=`,
        sort: "created_at|asc",
        // filterOr: `assistant_audit|${this.loggedInUser.id}`,
        // filterWhereRelation: [`audit@auditer_id|${this.loggedInUser.id}|=`],
      };


      // 7. Finalize loading state
      this.readyToLoad = true;
      await this.$nextTick();
    },
    isPending(startDate) {
      if (!startDate) return true;
      const today = new Date().setHours(0, 0, 0, 0);
      const itemDate = new Date(startDate).setHours(0, 0, 0, 0);
      return itemDate > today; // If future date → pending
    },
    isClosedAndNotEnd(item) {
      return item.open_closed_status === 1 && item.end_audit_status === 0;
    },
    async reopenAudit(item) {
      try {
        const response = await this.api.from({
          id: item.id,
          open_closed_status: 0
        });
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error(error);
        this.$toast.error('Failed to reopen audit');
      }
    },
    // Open the form for adding or editing an item
    openForm() {
      this.CloseAuditModal = true;
      this.selectedFrameworkId = null;
    },
    async submitForm() {
      axios.defaults.baseURL = REGULATORSERVICE;

      if (!this.selectedFrameworkId) {
        notify({
          title: this.$t("frameworkcontroltestaudit.please_select_a_framework"),
          text: `Please select a framework`,
          type: "error",
        });
        return;
      }

      try {
        const response = await this.api.CloseAuditWorkNowInSpesificFrameId({
          framework_id: this.selectedFrameworkId,
        });
        console.log('Response:', response);

        if (response.data.status === "success") {
          notify({
            title: this.$t("frameworkcontroltestaudit.successfully"),
            text: "The operation was completed successfully!",
            type: "success",
          });
        }
        this.CloseAuditModal = false;
        this.$refs.table.refreshTable(); // Refresh the table if needed
      } catch (error) {
        console.error('Error submitting framework:', error);
        notify({
          title: this.$t("frameworkcontroltestaudit.error"),
          text: `Failed to submit framework selection`,
          type: "error",
        });
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Extracts "YYYY-MM-DD"
      } catch (e) {
        return dateString; // Fallback if parsing fails
      }
    },
    // Close the form after submitting or canceling
    closeForm() {

    },
    closeModal() {
      this.CloseAuditModal = false;
      this.selectedFrameworkId = null;
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },
  },
};
</script>

<style scoped>
.status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: white;
  display: inline-block;
  font-weight: 500;
}

/* Not Implemented - red */
.status-Not-Implemented {
  background-color: #f56c6c;
}

/* Implemented - green */
.status-Implemented {
  background-color: #67c23a;
}

/* Partially Implemented - orange */
.status-Partially-Implemented {
  background-color: #e6a23c;
}

/* Not Applicable - gray */
.status-Not-Applicable {
  background-color: #909399;
}

/* Undefined or No Action */
.status-undefined,
.status-Unknown,
.status-No-Action {
  background-color: #606266;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(68, 34, 92, 0.5) 100%);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Modal Container */
.modal-container {
  width: 90%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Premium Header */
.modal-header {
  background: linear-gradient(135deg, #44225c 0%, #6b3689 50%, #44225c 100%);
  background-size: 200% 100%;
  padding: 1.25rem 1.75rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
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
  gap: 308px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.icon-badge {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.icon-badge i {
  color: white;
  font-size: 1.5rem;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modal-subtitle {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.modal-close {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.9);
  border-color: #dc2626;
  transform: rotate(90deg) scale(1.1);
}

.modal-close i {
  font-size: 1rem;
}

/* Modal Body */
.modal-body {
  padding: 1.75rem;
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f4f9 100%);
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.section-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(68, 34, 92, 0.3);
}

.section-icon i {
  color: white;
  font-size: 1.125rem;
}

.section-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.section-title h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.section-title span {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Select Container */
.select-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.styled-select {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  font-size: 0.9375rem;
  color: #1f2937;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.styled-select:focus {
  outline: none;
  border-color: #44225c;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(68, 34, 92, 0.1);
}

.styled-select.has-value {
  color: #44225c;
  font-weight: 600;
}

.styled-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f3f4f6;
}

.styled-select option {
  padding: 0.75rem;
  font-weight: 500;
  color: #1f2937;
}

.styled-select option:disabled {
  color: #9ca3af;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.styled-select:focus~.select-icon {
  color: #44225c;
  transform: translateY(-50%) rotate(180deg);
}

/* Hint Text */
.hint-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 0.8125rem;
  font-weight: 500;
}

.hint-text i {
  font-size: 1rem;
  color: #3b82f6;
}

/* Modal Footer */
.modal-footer {
  padding: 1.25rem 1.75rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-transform: none;
}

.btn i {
  font-size: 1rem;
}

.btn-cancel {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #4b5563;
  border: 2px solid #d1d5db;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-confirm {
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  color: white;
  border: 2px solid #44225c;
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.3);
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #6b3689 0%, #8b5cf6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(68, 34, 92, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .modal-subtitle {
    font-size: 0.75rem;
  }

  .icon-badge {
    width: 40px;
    height: 40px;
  }

  .icon-badge i {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .form-section {
    padding: 1.25rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
