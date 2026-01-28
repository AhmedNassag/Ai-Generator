<template>
  <!-- Main Page component -->
  <main-page 
    ref="page" 
    :mainPage="'internalaudit.internalauditResult'" 
    :subPage="'internalaudit.internalauditResult'"
    :titlePage="'internalaudit.internalauditResult'">

    <!-- DataTable Slot -->
    <template #datatable>
      <!-- DataTable - Only show when data is loaded -->
      <DataTable 
        v-if="!isLoadingData"
        ref="table" 
        id="example-table" 
        :tableClass="'table table-striped table-bordered custom-audit-table'"
        :columns="tableColumns" 
        :api="api" 
        :apiParams="apiParams" 
        :editItem="editItem" 
        :openForm="openBulkActionModal"
        :hideActions="hideActions" 
        add-new-button-title="Bulk Action" 
        add-new-button-icon="mdi-flag-checkered">

        <!-- Audit Name Column -->
        <template #audit_name="{ item }">
          <span class="audit-name-badge">
            {{ item.internal_audit?.name || 'N/A' }}
          </span>
        </template>

        <!-- Control Column -->
        <template #control_id="{ item }">
          <span class="control-badge">
            {{ getControlName(item.control_id) }}
          </span>
        </template>

        <!-- Document Column - Clickable -->
        <template #document_id="{ item }">
          <span 
            v-if="hasDocument(item.document_id)" 
            class="document-badge clickable-doc"
            @click="openDocumentModal(item)">
            <v-icon size="16" class="doc-icon">mdi-file-document</v-icon>
            {{ getDocumentName(item.document_id) }}
            <v-icon size="16" class="view-icon">mdi-eye</v-icon>
          </span>
          <span v-else class="document-badge not-clickable">
            <v-icon size="16" class="doc-icon-disabled">mdi-file-remove</v-icon>
            {{ getDocumentName(item.document_id) }}
          </span>
        </template>

        <!-- Status Column -->
        <template #status="{ item }">
          <span :class="['status-badge', getStatusClass(item.status)]">
            <v-icon size="14" class="status-icon">{{ getStatusIcon(item.status) }}</v-icon>
            {{ getStatusText(item.status) }}
          </span>
        </template>

        <!-- Action By Column -->
        <template #action_by="{ item }">
          <span class="action-by-badge">
            <v-icon size="14" class="action-icon">mdi-account</v-icon>
            {{ getActionByName(item.action_by) }}
          </span>
        </template>

        <!-- Action Buttons -->
        <template #addAction="{ item }">
          <a 
            href="javascript:void(0)" 
            @click.prevent="handleInstantApprove(item)" 
            class="dropdown-item approve-action"
            :class="{ 'action-loading': approvingId === item.id }">
            <i class="mdi mdi-check-circle p-1"></i>
            <span v-if="approvingId === item.id">Approving...</span>
            <span v-else>{{ $t("internalaudit.approve") || "Approve" }}</span>
          </a>

          <a 
            href="javascript:void(0)" 
            @click.prevent="handleReject(item)" 
            class="dropdown-item reject-action">
            <i class="mdi mdi-close-circle p-1"></i>
            {{ $t("internalaudit.reject") || "Reject" }}
          </a>
        </template>

      </DataTable>
    </template>

  </main-page>

  <!-- Bulk Action Modal Component -->
  <BulkActionModal
    v-model="showBulkModal"
    :totalCount="totalCount"
    :pendingCount="pendingCount"
    :approvedCount="approvedCount"
    :rejectedCount="rejectedCount"
    :processing="isBulkProcessing"
    @confirm="confirmBulkAction"
  />

  <!-- Reject Modal Component -->
  <RejectModal
    v-model="showRejectModal"
    :auditName="selectedRejectItem?.internal_audit?.name || 'N/A'"
    :controlName="getControlName(selectedRejectItem?.control_id)"
    :processing="isRejecting"
    @confirm="confirmReject"
  />

  <!-- Document Modal Component -->
  <DocumentModal
    v-model="showDocumentModal"
    :document="selectedDocument"
    :users="users"
    :teams="teams"
  />
</template>

<script>
import internalAuditResult from "@/API/InternalAuditResult/InternalAuditResult";
import control from "@/API/Control/Control";
import document from "@/API/Document/Document";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import BulkActionModal from "./BulkActionModal.vue";
import RejectModal from "./RejectModal.vue";
import DocumentModal from "./DocumentModal.vue";
import Auth from "@/API/Auth";
import { useRoute } from "vue-router";
import { notify } from "@kyvg/vue3-notification";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    BulkActionModal,
    RejectModal,
    DocumentModal
  },

  setup() {
    const route = useRoute();
    const api = new internalAuditResult();
    const apiControl = new control();
    const apiDocument = new document();
    const apiUser = new user();
    const apiTeam = new team();

    const apiParams = {
      filter: `audit_id|${route.params.id}|=`,
      with: ['internalAudit']
    };

    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      apiControl,
      apiDocument,
      apiUser,
      apiTeam
    };
  },

  data() {
    return {
      user: Auth.USER,
      showModal: false,
      isReadonly: false,
      newItem: {},
      users: [],
      controls: [],
      documents: [],
      audits: [],
      isLoadingData: true,
      loadingSteps: {
        users: false,
        teams: false,
        controls: false,
        documents: false,
        results: false
      },
      showDocumentModal: false,
      selectedDocument: null,
      approvingId: null,
      showRejectModal: false,
      selectedRejectItem: null,
      isRejecting: false,
      teams: [],
      // Bulk action properties
      showBulkModal: false,
      isBulkProcessing: false,
      allAuditResults: []
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
    pendingCount() {
      return this.allAuditResults.filter(item => item.status === 'pending').length;
    },
    approvedCount() {
      return this.allAuditResults.filter(item => item.status === 'approved').length;
    },
    rejectedCount() {
      return this.allAuditResults.filter(item => item.status === 'rejected').length;
    },
    totalCount() {
      return this.allAuditResults.length;
    }
  },

  async created() {
    this.tableColumns = [
      { id: "audit_name", title: this.$t("internalaudit.auditName"), data: "internal_audit_id", defaultContent: "N/A" },
      { id: "control_id", title: this.$t("internalaudit.control"), data: "control_id", defaultContent: "N/A" },
      { id: "document_id", title: this.$t("internalaudit.document"), data: "document_id", defaultContent: "N/A" },
      { id: "status", title: this.$t("internalaudit.status"), data: "status", defaultContent: "N/A" },
      { id: "comment", title: this.$t("internalaudit.reject-reason"), data: "comment", defaultContent: "N/A" },
      { id: "action_by", title: this.$t("internalaudit.actionBy"), data: "action_by", defaultContent: "N/A" },
    ];

    this.fromFields = [];
    
    // Single load call
    await this.loadAllData();
  },

  methods: {
    // OPTIMIZED: Single method to load all data with progress tracking
    async loadAllData() {
      this.isLoadingData = true;

      try {
        // Load users
        try {
          this.users = await this.apiUser.getAll({ select: 'id|full_name' });
          this.loadingSteps.users = true;
        } catch (error) {
          console.error("Error loading users:", error);
          this.users = [];
        }

        // Load teams
        try {
          this.teams = await this.apiTeam.getAll({ select: 'id|name' });
          this.loadingSteps.teams = true;
        } catch (error) {
          console.error("Error loading teams:", error);
          this.teams = [];
        }

        // Load controls
        try {
          this.controls = await this.apiControl.getAll({ select: 'id|short_name|name' });
          this.loadingSteps.controls = true;
        } catch (error) {
          console.error("Error loading controls:", error);
          this.controls = [];
        }

        // Load documents - this might be slow if there are many documents
        try {
          this.documents = await this.apiDocument.getAll();
          this.loadingSteps.documents = true;
        } catch (error) {
          console.error("Error loading documents:", error);
          this.documents = [];
        }

        // Load audit results
        try {
          this.allAuditResults = await this.api.getAll(this.apiParams);
          this.loadingSteps.results = true;
        } catch (error) {
          console.error("Error loading audit results:", error);
          this.allAuditResults = [];
        }

      } catch (error) {
        console.error("Critical error loading data:", error);
        this.$toast?.error?.('Error loading data. Please refresh the page.');
      } finally {
        this.isLoadingData = false;
      }
    },

    // Refresh audit results only (for after actions)
    async refreshAuditResults() {
      try {
        this.allAuditResults = await this.api.getAll(this.apiParams);
      } catch (error) {
        console.error("Error refreshing audit results:", error);
      }
    },

    // Bulk Action Methods
    openBulkActionModal() {
      this.showBulkModal = true;
      this.refreshAuditResults(); // Only refresh results, not all data
    },

    async confirmBulkAction(data) {
      const { action, comment } = data;

      if (!action) {
        this.$toast?.error?.('Please select an action');
        return;
      }

      if (action === 'reject' && (!comment || comment.length < 10)) {
        this.$toast?.error?.('Please provide a detailed reason (minimum 10 characters)');
        return;
      }

      if (this.totalCount === 0) {
        this.$toast?.error?.('No items to process');
        return;
      }

      this.isBulkProcessing = true;

      try {
        const allItems = this.allAuditResults;
        const status = action === 'approve' ? 'approved' : 'rejected';
        const commentText = action === 'approve' ? '-' : (comment || '');

        // Create array of payloads for bulk update
        const bulkPayload = allItems.map(item => ({
          id: item.id || item._id,
          status: status,
          action_by: this.user.id,
          comment: commentText,
        }));

        const response = await this.api.bulckUpdateDataOfAudit(bulkPayload);

        if (response && response.status === "success") {
          notify({
            title: this.$t("Audit Result"),
            text: "Data Updated successfully.",
            type: "success",
          });
          
          this.showBulkModal = false;
          
          // Refresh the table
          if (this.$refs.table && this.$refs.table.refreshTable) {
            this.$refs.table.refreshTable();
          }
          await this.refreshAuditResults();
        }
      } catch (error) {
        console.error('Error processing bulk action:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to process bulk action. Please try again.';
        this.$toast?.error?.(errorMessage);
      } finally {
        this.isBulkProcessing = false;
      }
    },

    getControlName(controlId) {
      if (!controlId) return 'N/A';
      const control = this.controls.find(c => c.id === controlId || c._id === controlId);
      return control?.short_name || control?.name || 'N/A';
    },

    getDocumentName(documentId) {
      if (!documentId) return 'Document Not Assigned';
      const doc = this.documents.find(d => d.id === documentId || d._id === documentId || (d._id && d._id.$oid === documentId));
      return doc?.name || 'Document Not Found';
    },

    hasDocument(documentId) {
      if (!documentId) return false;
      const doc = this.documents.find(d => d.id === documentId || d._id === documentId || (d._id && d._id.$oid === documentId));
      return !!doc;
    },

    getActionByName(userId) {
      if (!userId) return 'N/A';
      const user = this.users.find(u => u.id === userId || u._id === userId);
      return user?.full_name || 'N/A';
    },

    getStatusText(status) {
      const statusMap = {
        'pending': this.$t('internalaudit.pending') || 'Pending',
        'approved': this.$t('internalaudit.approved') || 'Approved',
        'rejected': this.$t('internalaudit.rejected') || 'Rejected'
      };
      return statusMap[status] || status || 'N/A';
    },

    getStatusClass(status) {
      const classMap = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected'
      };
      return classMap[status] || 'status-default';
    },

    getStatusIcon(status) {
      const iconMap = {
        'pending': 'mdi-clock-outline',
        'approved': 'mdi-check-circle',
        'rejected': 'mdi-close-circle'
      };
      return iconMap[status] || 'mdi-help-circle';
    },

    // Instant Approve Handler
    async handleInstantApprove(item) {
      this.approvingId = item.id;

      try {
        const payload = {
          id: item.id,
          status: 'approved',
          action_by: this.user.id,
          comment: '',
          action_date: new Date().toISOString()
        };

        await this.api.from(payload);

        this.$toast?.success?.('Audit approved successfully!');
        this.$refs.table.refreshTable();
        await this.refreshAuditResults();

      } catch (error) {
        console.error('Error approving audit:', error);
        this.$toast?.error?.('Failed to approve audit. Please try again.');
      } finally {
        this.approvingId = null;
      }
    },

    // Open Reject Modal
    handleReject(item) {
      this.selectedRejectItem = item;
      this.showRejectModal = true;
    },

    // Confirm Rejection
    async confirmReject(reason) {
      if (!reason || reason.length < 10) {
        this.$toast?.error?.('Please provide a detailed reason (minimum 10 characters)');
        return;
      }

      this.isRejecting = true;

      try {
        const payload = {
          id: this.selectedRejectItem.id,
          status: 'rejected',
          action_by: this.user.id,
          comment: reason,
          action_date: new Date().toISOString()
        };

        await this.api.from(payload);

        this.$toast?.success?.('Audit rejected successfully');
        this.showRejectModal = false;
        this.$refs.table.refreshTable();
        await this.refreshAuditResults();

      } catch (error) {
        console.error('Error rejecting audit:', error);
        this.$toast?.error?.('Failed to reject audit. Please try again.');
      } finally {
        this.isRejecting = false;
      }
    },

    // Open Document Modal
// Open Document Modal
async openDocumentModal(item) {
  this.showDocumentModal = true;
  this.selectedDocument = null;

  try {
    const doc = this.documents.find(d => d.id === item.document_id || d._id === item.document_id);

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    if (doc) {
      // Filter versions where created_at <= item.created_at
      const itemCreatedAt = new Date(item.created_at);
      
      const filteredVersions = doc.versionnotes?.filter(version => {
        const versionCreatedAt = new Date(version.created_at);
        return versionCreatedAt <= itemCreatedAt;
      }) || [];

      // Sort versions by created_at descending (newest first)
      filteredVersions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Create a new document object WITHOUT the excluded versions
      const { versionnotes, ...docWithoutVersions } = doc;
      
      this.selectedDocument = {
        ...docWithoutVersions,
        versionnotes: filteredVersions
      };

      console.log('Item created_at:', item.created_at);
      console.log('Total versions:', doc.versionnotes?.length || 0);
      console.log('Included versions:', filteredVersions.length);
      console.log('Excluded versions:', (doc.versionnotes?.length || 0) - filteredVersions.length);
      
    } else {
      this.selectedDocument = {
        name: 'Document not found',
        description: 'The requested document could not be loaded.'
      };
    }
    // Return the selected document
    return this.selectedDocument;
    
  } catch (error) {
    console.error('Error loading document:', error);
    this.$toast?.error?.('Error loading document details');
    
    this.selectedDocument = {
      name: 'Error',
      description: 'An error occurred while loading the document.'
    };
    
    return this.selectedDocument;
  }
},

    openForm() {
      this.resetForm();
      this.showModal = true;
    },

    closeForm() {
      this.showModal = false;
      this.$refs.table.refreshTable();
      this.resetForm();
    },

    resetForm() {
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.showModal = true;
    },
  },
};
</script>

<style scoped>
/* Data Loading Container */
.data-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 60px 20px;
}

.data-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 500px;
  text-align: center;
}

.loading-spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #6e3894;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.loading-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.loading-progress {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;
  width: 100%;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  transition: all 0.3s ease;
}

.progress-item.complete {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}

.progress-item .v-icon {
  color: inherit;
}

/* DataTable Custom Styling */
.custom-audit-table :deep(tbody tr) {
  transition: all 0.3s ease;
}

.custom-audit-table :deep(tbody tr:hover) {
  background: #f8fafc !important;
  transform: translateX(4px);
  box-shadow: -4px 0 0 #6E3894;
}

.custom-audit-table :deep(th) {
  background: linear-gradient(135deg, #6E3894 0%, #8b5cf6 100%) !important;
  color: white !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  padding: 1rem !important;
}

.custom-audit-table :deep(td) {
  padding: 1rem !important;
  vertical-align: middle !important;
}

/* Badge Styles - Enhanced */
.audit-name-badge,
.control-badge,
.document-badge,
.action-by-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  max-width: 300px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.audit-name-badge {
  background: #d0b5e3;
  color: #6e3894;
}

.control-badge {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  color: #9a3412;
  border-color: #fb923c;
  box-shadow: 0 2px 8px rgba(194, 65, 12, 0.2);
}

.control-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(194, 65, 12, 0.3);
}

.document-badge {
  color: #991b1b;
  border-color: #f87171;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.document-badge.clickable-doc {
  cursor: pointer;
  border-color: #f1e5e5;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding-right: 36px !important;
}

.document-badge.clickable-doc:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5) !important;
  border-color: #f87171 !important;
}

.document-badge.not-clickable {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #475569;
  border-color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

.action-by-badge {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #064e3b;
  border-color: #6ee7b7;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(6, 95, 70, 0.2);
}

.action-by-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 95, 70, 0.3);
}

.doc-icon {
  opacity: 0.8;
}

.doc-icon-disabled {
  opacity: 0.5;
}

.action-icon {
  margin-right: 4px;
}

/* Status Badges - Enhanced */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.status-icon {
  margin-right: 2px;
}

.status-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #78350f;
  border-color: #fcd34d;
  box-shadow: 0 2px 8px rgba(146, 64, 14, 0.2);
}

.status-pending:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(146, 64, 14, 0.3);
}

.status-approved {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  color: #14532d;
  border-color: #4ade80;
  box-shadow: 0 2px 8px rgba(21, 83, 45, 0.2);
  animation: approvedGlow 2s ease-in-out infinite;
}

@keyframes approvedGlow {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(21, 83, 45, 0.2);
  }
  50% {
    box-shadow: 0 4px 16px rgba(21, 83, 45, 0.4);
  }
}

.status-approved:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(21, 83, 45, 0.4);
}

.status-rejected {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  color: #7f1d1d;
}

.status-default {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #334155;
  border-color: #94a3b8;
  box-shadow: 0 2px 8px rgba(71, 85, 105, 0.2);
}

.status-default:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(71, 85, 105, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .custom-audit-table :deep(tbody tr:hover) {
    transform: none;
  }
  
  .loading-progress {
    grid-template-columns: 1fr;
  }
}
</style>