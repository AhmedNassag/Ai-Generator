<template>
    <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('complianceresultaudit.auditpolicycompliance')"
        :subPage="$t('complianceresultaudit.auditpolicycompliance')"
        :titlePage="$t('complianceresultaudit.auditpolicycompliance')">
        <template #datatable>
            <!-- Enhanced Breadcrumb Header -->
            <div v-if="auditData" class="audit-breadcrumb-container">
                <nav class="audit-breadcrumb">
                    <!-- Audit Name with Status -->
                    <div class="breadcrumb-item audit-item">
                        <div class="item-icon-wrapper audit-bg">
                            <v-icon size="18" class="item-icon">mdi-clipboard-check</v-icon>
                        </div>
                        <div class="item-content">
                            <span class="breadcrumb-label">{{ $t('complianceresultaudit.audit') }}</span>
                            <span class="breadcrumb-value">{{ auditData.audit_name }}</span>
                        </div>
                        <div class="status-indicator">
                            <span class="status-dot" :class="{
                                'active-dot': auditData.enable_audit == 1,
                                'inactive-dot': auditData.enable_audit != 1
                            }"></span>
                            <span class="status-text" :class="{
                                'active-text': auditData.enable_audit == 1,
                                'inactive-text': auditData.enable_audit != 1
                            }">
                                {{ auditData.enable_audit == 1 ? $t('complianceresultaudit.active') :
                                    $t('complianceresultaudit.ended') }}
                            </span>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="breadcrumb-divider">
                        <v-icon size="14" class="divider-icon">mdi-chevron-right</v-icon>
                    </div>

                    <!-- Category -->
                    <div class="breadcrumb-item">
                        <div class="item-icon-wrapper category-bg">
                            <v-icon size="18" class="item-icon">mdi-folder-star</v-icon>
                        </div>
                        <div class="item-content">
                            <span class="breadcrumb-label">{{ $t('complianceresultaudit.category') }}</span>
                            <span class="breadcrumb-value">{{ document?.category?.name || $t('general.na')
                            }}</span>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="breadcrumb-divider">
                        <v-icon size="14" class="divider-icon">mdi-chevron-right</v-icon>
                    </div>

                    <!-- Document -->
                    <div class="breadcrumb-item">
                        <div class="item-icon-wrapper document-bg">
                            <v-icon size="18" class="item-icon">mdi-file-document</v-icon>
                        </div>
                        <div class="item-content">
                            <span class="breadcrumb-label">{{ $t('complianceresultaudit.document') }}</span>
                            <span class="breadcrumb-value">{{ document?.name || $t('general.na') }}</span>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="breadcrumb-divider">
                        <v-icon size="14" class="divider-icon">mdi-chevron-right</v-icon>
                    </div>

                    <!-- Start Date -->
                    <div class="breadcrumb-item">
                        <div class="item-icon-wrapper start-bg">
                            <v-icon size="18" class="item-icon">mdi-calendar-start</v-icon>
                        </div>
                        <div class="item-content">
                            <span class="breadcrumb-label">{{ $t('complianceresultaudit.started') }}</span>
                            <span class="breadcrumb-value">{{ formatDate(auditData.start_date) }}</span>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="breadcrumb-divider">
                        <v-icon size="14" class="divider-icon">mdi-chevron-right</v-icon>
                    </div>

                    <!-- Due Date -->
                    <div class="breadcrumb-item due-item">
                        <div class="item-icon-wrapper due-bg">
                            <v-icon size="18" class="item-icon">mdi-calendar-alert</v-icon>
                        </div>
                        <div class="item-content">
                            <span class="breadcrumb-label">{{ $t('complianceresultaudit.due_date') }}</span>
                            <span class="breadcrumb-value due-date">{{ formatDate(auditData.due_date) }}</span>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="breadcrumb-divider">
                        <v-icon size="14" class="divider-icon">mdi-chevron-right</v-icon>
                    </div>

                    <!-- Total status -->
                    <div class="breadcrumb-item">
                        <div class="item-icon-wrapper document-bg">
                            <v-icon size="18" class="item-icon">
                                {{ getStatusIcon(totalStatus) }}
                            </v-icon>
                        </div>
                        <div class="item-content">
                            <span class="breadcrumb-label">{{ $t('complianceresultaudit.total_status') }}</span>
                            <span class="breadcrumb-value">{{ totalStatus }}</span>
                        </div>
                    </div>
                </nav>
            </div>

            <!-- Action Buttons Section -->
            <div class="action-buttons-container">
                <!-- Approve All Button -->
                <v-tooltip v-if="isAuditer && isNotEndAudit" :text="$t('complianceresultaudit.approve_all')"
                    location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="success" variant="tonal" size="small" prepend-icon="mdi-check-all"
                            @click="approveAllPolicies()" class="action-btn">
                            {{ $t('complianceresultaudit.approve_all') }}
                        </v-btn>
                    </template>
                </v-tooltip>

                <!-- Calculate Total Button -->
                <v-tooltip v-if="isAuditer && isNotEndAudit" :text="$t('complianceresultaudit.calculate_total')"
                    location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="primary" variant="tonal" size="small" prepend-icon="mdi-calculator"
                            @click="calculateTotals()" class="action-btn">
                            {{ $t('complianceresultaudit.calculate_total') }}
                        </v-btn>
                    </template>
                </v-tooltip>

                <!-- Send Results Button -->
                <v-tooltip v-if="!isAuditer && isNotEndAudit" :text="$t('complianceresultaudit.send_results')"
                    location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="info" variant="tonal" size="small" prepend-icon="mdi-send"
                            @click="sendResults()" class="action-btn">
                            {{ $t('complianceresultaudit.send_results') }}
                        </v-btn>
                    </template>
                </v-tooltip>

                <!-- Export Data Button -->
                <v-tooltip v-if="!isAuditer" :text="$t('complianceresultaudit.export_data')" location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="warning" variant="tonal" size="small" prepend-icon="mdi-export"
                            @click="exportData" class="action-btn">
                            {{ $t('complianceresultaudit.export_data') }}
                        </v-btn>
                    </template>
                </v-tooltip>

                <!-- Import Data Button -->
                <v-tooltip v-if="!isAuditer && isNotEndAudit" :text="$t('complianceresultaudit.import_data')"
                    location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="secondary" variant="tonal" size="small" prepend-icon="mdi-import"
                            @click="importData" class="action-btn">
                            {{ $t('complianceresultaudit.import_data') }}
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>

            <!-- Policies Data Table -->
            <div v-if="auditData && auditData.policies" class="policies-table-container">
                <!-- Table Header -->
                <div class="table-header">
                    <div class="header-info">
                        <h2 class="table-title">
                            <v-icon size="24" class="title-icon" color="primary">mdi-shield-check</v-icon>
                            {{ $t('complianceresultaudit.title') }}
                        </h2>
                        <p class="table-subtitle">{{ totalPolicies }} {{ $t('complianceresultaudit.found') }}</p>
                    </div>

                    <!-- Search Bar -->
                    <div class="search-container">
                        <v-text-field v-model="searchQuery"
                            :placeholder="$t('complianceresultaudit.search_placeholder')"
                            prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details clearable
                            class="search-field"></v-text-field>
                    </div>
                </div>

                <!-- Data Table -->
                <v-data-table :headers="isAuditer ? tableHeaders.filter(h => h.key !== 'pending_status') : tableHeaders"
                    :items="paginatedPolicies" :search="searchQuery" :loading="loading" :items-per-page="itemsPerPage"
                    :page="currentPage" hide-default-footer class="policies-table" item-key="_id">
                    <!-- No Data Slot -->
                    <template v-slot:no-data>
                        <div class="no-data-container">
                            <v-icon size="64" color="grey-lighten-1">mdi-shield-off</v-icon>
                            <h3 class="no-data-title">{{ $t('complianceresultaudit.no_data_title') }}</h3>
                            <p class="no-data-text">{{ $t('complianceresultaudit.no_data_text') }}</p>
                        </div>
                    </template>

                    <!-- Loading Slot -->
                    <template v-slot:loading>
                        <div class="loading-table">
                            <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
                            <span class="loading-text">{{ $t('complianceresultaudit.loading') }}</span>
                        </div>
                    </template>
                    <!-- Policy Name Column -->
                    <template v-slot:item.name="{ item }">
                        <div class="policy-name-cell" style="cursor: pointer;">
                            <v-icon size="20" class="policy-icon" color="primary">mdi-shield-check</v-icon>
                            <span class="policy-name"
                                v-html="truncateTextWithModal(htmlToTextRegex(item?.name), 100, $t('complianceresultaudit.policy_name'))"
                                :title="htmlToText(item.name, 200)"></span>
                        </div>
                    </template>

                    <template v-slot:item.pending_status="{ item }">
                        <div class="status-cell">
                            <v-chip :color="getStatusColor(item.pending_status)"
                                :text-color="getStatusTextColor(item.pending_status)" size="small" class="status-chip">
                                <v-icon start size="14" :icon="getStatusIcon(item.pending_status)"></v-icon>
                                {{ item.pending_status }}
                            </v-chip>
                        </div>
                    </template>

                    <!-- Compliance Status Column -->
                    <template v-slot:item.status="{ item }">
                        <div class="status-cell">
                            <v-chip :color="getStatusColor(item.status)" :text-color="getStatusTextColor(item.status)"
                                size="small" class="status-chip">
                                <v-icon start size="14" :icon="getStatusIcon(item.status)"></v-icon>
                                {{ item.status }}
                            </v-chip>
                        </div>
                    </template>

                    <template v-slot:item.auditer_status="{ item }">
                        <div class="status-cell">
                            <v-chip :color="getStatusColor(item.auditer_status)"
                                :text-color="getStatusTextColor(item.auditer_status)" size="small" class="status-chip">
                                <v-icon start size="14" :icon="getStatusIcon(item.auditer_status)"></v-icon>
                                {{ item.auditer_status }}
                            </v-chip>
                        </div>
                    </template>

                    <!-- Last Updated Column -->
                    <template v-slot:item.last_updated="{ item }">
                        <div class="date-cell">
                            <span v-if="item.compliance_result">
                                {{ formatDate(item.compliance_result.updated_at) }}
                            </span>
                            <span v-else class="no-data-text">-</span>
                        </div>
                    </template>

                    <!-- Actions Column -->
                    <template v-slot:item.actions="{ item }">
                        <div class="actions-cell">
                            <!-- Circular dropdown trigger button -->
                            <v-menu location="bottom end" offset-y transition="scale-transition">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" icon size="small" variant="text" color="grey-darken-2"
                                        class="action-dropdown-btn">
                                        <v-icon size="24">mdi-dots-vertical</v-icon>
                                    </v-btn>
                                </template>

                                <!-- Dropdown menu items -->
                                <v-list class="action-dropdown-menu" density="compact" min-width="200">
                                    <!-- Evidence Section -->
                                    <v-list-item @click="openEvidenceModal(item)" class="action-item">
                                        <template v-slot:prepend>
                                            <v-icon color="teal" class="mr-2">mdi-file-upload-outline</v-icon>
                                        </template>
                                        <v-list-item-title class="text-body-2">
                                            {{ $t('complianceresultaudit.upload_evidence') }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="text-caption text-grey">
                                            {{ $t('complianceresultaudit.upload_evidence_subtitle') }}
                                        </v-list-item-subtitle>
                                    </v-list-item>

                                    <!-- Status Section -->
                                    <v-divider class="my-1"></v-divider>

                                    <v-list-item v-if="!isAuditer" @click="openStatusModal(item)" class="action-item">
                                        <template v-slot:prepend>
                                            <v-icon color="orange" class="mr-2">mdi-progress-check</v-icon>
                                        </template>
                                        <v-list-item-title class="text-body-2">
                                            {{ $t('complianceresultaudit.update_status') }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="text-caption text-grey">
                                            {{ $t('complianceresultaudit.update_status_subtitle') }}
                                        </v-list-item-subtitle>
                                    </v-list-item>

                                    <!-- Comments Section -->
                                    <v-divider class="my-1"></v-divider>

                                    <v-list-item @click="openComments(item)" class="action-item">
                                        <template v-slot:prepend>
                                            <v-icon color="blue" class="mr-2">mdi-message-text-outline</v-icon>
                                        </template>
                                        <v-list-item-title class="text-body-2">
                                            {{ $t('complianceresultaudit.add_comment') }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="text-caption text-grey">
                                            {{ $t('complianceresultaudit.add_comment_subtitle') }}
                                        </v-list-item-subtitle>
                                    </v-list-item>

                                    <!-- Approval Actions Section -->
                                    <v-divider class="my-1"></v-divider>

                                    <v-list-item v-if="isAuditer && isNotEndAudit"
                                        @click="takeActionOnClause(item, 'Approved')" class="action-item">
                                        <template v-slot:prepend>
                                            <v-icon color="success" class="mr-2">mdi-check-circle-outline</v-icon>
                                        </template>
                                        <v-list-item-title class="text-body-2">
                                            {{ $t('complianceresultaudit.approve') }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="text-caption text-grey">
                                            {{ $t('complianceresultaudit.approve_subtitle') }}
                                        </v-list-item-subtitle>
                                    </v-list-item>

                                    <v-list-item v-if="isAuditer && isNotEndAudit"
                                        @click="takeActionOnClause(item, 'Rejected')" class="action-item">
                                        <template v-slot:prepend>
                                            <v-icon color="error" class="mr-2">mdi-close-circle-outline</v-icon>
                                        </template>
                                        <v-list-item-title class="text-body-2">
                                            {{ $t('complianceresultaudit.reject') }}
                                        </v-list-item-title>
                                        <v-list-item-subtitle class="text-caption text-grey">
                                            {{ $t('complianceresultaudit.reject_subtitle') }}
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </template>
                </v-data-table>

                <!-- Custom Pagination -->
                <div class="pagination-container">
                    <div class="pagination-info">
                        <span class="pagination-text">
                            {{ $t('complianceresultaudit.showing', {
                                start: startItem,
                                end: endItem,
                                total: totalPolicies
                            }) }}
                        </span>
                    </div>

                    <div class="pagination-controls">
                        <v-btn :disabled="currentPage === 1" @click="previousPage" variant="outlined" size="small"
                            class="pagination-btn">
                            <v-icon size="18">mdi-chevron-left</v-icon>
                            {{ $t('complianceresultaudit.previous') }}
                        </v-btn>

                        <div class="page-numbers">
                            <v-btn v-for="page in visiblePages" :key="page"
                                :color="page === currentPage ? 'primary' : 'default'"
                                :variant="page === currentPage ? 'elevated' : 'text'" @click="goToPage(page)"
                                size="small" class="page-btn">
                                {{ page }}
                            </v-btn>
                        </div>

                        <v-btn :disabled="currentPage === totalPages" @click="nextPage" variant="outlined" size="small"
                            class="pagination-btn">
                            {{ $t('complianceresultaudit.next') }}
                            <v-icon size="18">mdi-chevron-right</v-icon>
                        </v-btn>
                    </div>

                    <!-- Items per page selector -->
                    <div class="items-per-page">
                        <span class="items-label">{{ $t('complianceresultaudit.items_per_page') }}:</span>
                        <v-select v-model="itemsPerPage" :items="itemsPerPageOptions" variant="outlined"
                            density="compact" hide-details class="items-select"></v-select>
                    </div>
                </div>
            </div>

            <!-- Enhanced Loading State -->
            <div v-else-if="loading" class="loading-container">
                <div class="loading-content">
                    <v-progress-circular indeterminate size="28" width="3" color="primary"
                        class="loading-spinner"></v-progress-circular>
                    <span class="loading-text">{{ $t('audit.loading') }}</span>
                </div>
            </div>

        </template>
        <!-- Status Update Modal -->

    </main-page>

    <v-dialog v-model="showStatusModal" max-width="700px" persistent>
        <v-card class="status-update-modal">
            <!-- Animated Background Pattern -->
            <div class="bg-pattern">
                <div class="pattern-grid"></div>
                <div class="pattern-glow"></div>
            </div>

            <!-- Modal Header with Glassmorphism -->
            <div class="modal-header">
                <div class="header-glass">
                    <div class="header-content">
                        <div class="header-icon-container">
                            <div class="icon-ring"></div>
                            <v-icon class="header-icon">mdi-file-upload</v-icon>
                        </div>
                        <div class="header-text">
                            <h2 class="header-title">
                                {{ pendingAction === 'Rejected' ?
                                    $t('complianceresultaudit.reject_title') :
                                    $t('complianceresultaudit.update_title') }}
                            </h2>
                            <p class="header-subtitle">
                                {{ pendingAction === 'Rejected' ?
                                    $t('complianceresultaudit.reject_subtitle') :
                                    $t('complianceresultaudit.update_subtitle') }}
                            </p>
                        </div>
                    </div>
                    <v-btn icon @click="showStatusModal = false" class="close-btn" size="large"
                        :disabled="loadingStatusUpdate">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </div>

            <v-card-text class="modal-content">
                <v-select :readonly="!isNotEndAudit" v-model="selectedStatus" :items="statusOptions"
                    :label="$t('complianceresultaudit.select_label')" item-title="text" item-value="value"
                    variant="solo-filled" bg-color="rgba(255,255,255,0.05)" class="enhanced-select mt-4"
                    :menu-props="{ contentClass: 'status-menu' }">
                    <template v-slot:prepend-inner>
                        <v-icon color="primary">mdi-format-list-checks</v-icon>
                    </template>
                </v-select>
            </v-card-text>

            <!-- Enhanced Modal Actions -->
            <v-card-actions v-if="isNotEndAudit" class="modal-actions">
                <div class="actions-container">
                    <v-btn color="grey-darken-1" variant="outlined" @click="showStatusModal = false"
                        :disabled="loadingStatusUpdate" size="large" class="cancel-btn">
                        <v-icon left>mdi-arrow-left</v-icon>
                        {{ $t('complianceresultaudit.cancel') }}
                    </v-btn>
                    <v-btn color="primary" variant="flat" @click="submitStatusUpdate" :loading="loadingStatusUpdate"
                        :disabled="loadingStatusUpdate" class="submit-btn" size="large">
                        <template v-slot:loader>
                            <div class="btn-loader">
                                <div class="loader-spinner"></div>
                                {{ $t('complianceresultaudit.updating') }}
                            </div>
                        </template>
                        <v-icon left>mdi-check</v-icon>
                        {{ $t('complianceresultaudit.update_status') }}
                    </v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <CommentsModal :isVisible="isVisible" @close="closeComments" :users="Userlist"
        commentableType="App\Models\AuditPolicyComplianceResult\AuditPolicyComplianceResult"
        :commentableId="selectedPolicyIdActive" :AuditId="auditId" :userId="userId" />

    <EvidenceModal :isVisibleEvidenceModal="isVisibleEvidenceModal" @close="closeEvidenceModal"
        :policyId="selectedPolicyForEvidence" :id="selectedIdResult" :auditId="auditId" :userId="userId"
        :auditData="auditData" @refresh-data="fetchAuditData" />

    <ImportAuditResult :isVisibleImportModal="isVisibleImportModal" @closeImportModal="closeImportModal"
        :userId="userId" :auditData="auditData" @refresh-data="fetchAuditData" />

</template>

<script>
import auditpolicycompliance from "@/API/AuditPolicyCompliance/AuditPolicyCompliance";
import AuditPolicyComplianceResult from "@/API/AuditPolicyComplianceResult/AuditPolicyComplianceResult";
import MainPage from "@/components/MainPage.vue";
import { notify } from "@kyvg/vue3-notification";
import Auth from "@/API/Auth";
import user from "@/API/User/User";
import EvidenceModal from "./EvidenceModal.vue";
import ImportAuditResult from "./ImportAuditResult.vue";
import CommentsModal from "@/components/Comment.vue";

import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Document from "@/API/Document/Document";
import DocumentCategory from "@/API/DocumentCategory/DocumentCategory";

import { formatDateTimeShort, truncateText, htmlToTextRegex, htmlToText, truncateTextWithModal } from "@/utils/helpers";

export default {
    components: {
        MainPage,
        CommentsModal: CommentsModal,
        EvidenceModal: EvidenceModal,
        ImportAuditResult: ImportAuditResult
    },

    setup() {
        const api = new auditpolicycompliance();
        const auditPolicyComplianceResultApi = new AuditPolicyComplianceResult();
        const userApi = new user();
        const documentApi = new Document();
        const documentCategoryApi = new DocumentCategory();
        // Table column definitions
        const tableColumns = [

        ];

        const fromFields = [];    // Initialize form fields

        // Return properties for setup to be used in the template
        return {
            api,
            auditPolicyComplianceResultApi,
            tableColumns,
            fromFields,
            userApi,
            Swal,
            XLSX,
            ExcelJS,
            documentApi,
            documentCategoryApi
        };
    },

    data() {
        return {
            isFlipped: false,
            auditData: null,
            loading: false,
            error: null,
            Userlist: [],
            selectedPolicyIdActive: '',
            isVisible: false,
            // Table and pagination data
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 10,
            totalPolicies: 0,
            totalPages: 0,
            itemsPerPageOptions: [5, 10, 25, 50],
            isVisibleEvidenceModal: false,
            isVisibleImportModal: false,
            selectedPolicyForEvidence: null,
            showStatusModal: false,
            selectedPolicy: null,
            selectedStatus: '',
            loadingStatusUpdate: false,
            userId: Auth.USER.id,
            pendingAction: null,
            formatDateTimeShort,
            htmlToText,
            truncateText,
            truncateTextWithModal,
            htmlToTextRegex,
            document
        };
    },

    computed: {
        auditId() {
            return this.$route.params.id;
        },
        audieeId() {
            return this.$route.params.audieeId;
        },
        isAuditer() {
            return this.auditData && (this.userId === this.auditData.auditer_id);
        },
        isNotEndAudit() {
            return this.auditData && (this.auditData.enable_audit === 1);
        },
        totalStatus() {
            if (!this.auditData || !this.auditData.total_status) {
                return 'N/A';
            }
            const totalStatus = this.auditData.total_status;
            if (!Array.isArray(totalStatus) || totalStatus.length === 0) {
                return 'N/A';
            }
            return totalStatus[0].status || 'N/A';
        },

        // Policies are now directly from backend (already paginated)
        policies() {
            if (!this.auditData || !this.auditData.policies_with_compliance) {
                return [];
            }

            // Backend already returns policies with all necessary data
            return this.auditData.policies_with_compliance.map(policy => ({
                id: policy.id,
                name: policy.name || 'N/A',
                compliance_result: policy.compliance_result || null,
                has_result: policy.has_result || false,
                pending_status: policy.pending_status || 'No Status',
                status: policy.status || 'No Status',
                auditer_status: policy.auditer_status || 'No Status',
                final_total_status: policy.final_total_status || 'No Total Status',
                has_total_status: policy.has_total_status || false,
            }));
        },

        // No need for filteredPolicies since backend handles filtering
        // If you need search, implement it on backend

        // Total policies from backend pagination
        totalPolicies() {
            return this.auditData?.pagination?.total || 0;
        },

        // Total pages from backend
        totalPages() {
            return this.auditData?.pagination?.last_page || 0;
        },

        // Policies for display (already paginated from backend)
        paginatedPolicies() {
            return this.policies;
        },

        // Start item from backend pagination
        startItem() {
            return this.auditData?.pagination?.from || 0;
        },

        // End item from backend pagination
        endItem() {
            return this.auditData?.pagination?.to || 0;
        },

        // Visible page numbers for pagination
        visiblePages() {
            const pages = [];
            const maxVisible = 5;
            const halfMaxVisible = Math.floor(maxVisible / 2);

            let startPage = Math.max(1, this.currentPage - halfMaxVisible);
            let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

            if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return pages;
        },

        tableHeaders() {
            const headers = [
                {
                    title: this.$t('complianceresultaudit.policy_name'),
                    key: 'name',
                    sortable: true,
                    width: this.isAuditer ? '45%' : '40%'
                }
            ];

            // Only add Pending Status column if not auditor
            if (!this.isAuditer) {
                headers.push({
                    title: this.$t('complianceresultaudit.pending_status'),
                    key: 'pending_status',
                    sortable: true,
                    width: '12%'
                });
            }

            // Add the rest of the columns
            headers.push(
                {
                    title: this.$t('complianceresultaudit.auditee_status'),
                    key: 'status',
                    sortable: true,
                    width: this.isAuditer ? '17%' : '12%'
                },
                {
                    title: this.$t('complianceresultaudit.auditer_status'),
                    key: 'auditer_status',
                    sortable: true,
                    width: this.isAuditer ? '17%' : '12%'
                },
                {
                    title: this.$t('complianceresultaudit.last_updated'),
                    key: 'last_updated',
                    sortable: true,
                    width: this.isAuditer ? '17%' : '12%'
                },
                {
                    title: this.$t('complianceresultaudit.actions'),
                    key: 'actions',
                    sortable: false,
                    width: this.isAuditer ? '17%' : '12%'
                }
            );

            return headers;
        },

        statusOptions() {
            if (this.pendingAction === 'Rejected') {
                return [
                    { text: this.$t('complianceresultaudit.Not Implemented'), value: 'Not Implemented' },
                    { text: this.$t('complianceresultaudit.Partially Implemented'), value: 'Partially Implemented' },
                    { text: this.$t('complianceresultaudit.Not Applicable'), value: 'Not Applicable' },
                    { text: this.$t('complianceresultaudit.Implemented'), value: 'Implemented' }
                ];
            }
            return [
                { text: this.$t('complianceresultaudit.Not Implemented'), value: 'Not Implemented' },
                { text: this.$t('complianceresultaudit.Partially Implemented'), value: 'Partially Implemented' },
                { text: this.$t('complianceresultaudit.Not Applicable'), value: 'Not Applicable' },
                { text: this.$t('complianceresultaudit.Implemented'), value: 'Implemented' }
            ];
        },

        documentCategory() {
            return this.document?.category;
        }
    },

    watch: {
        // Reset to first page when search query changes
        searchQuery() {
            this.currentPage = 1;
        },

        // Reset to first page when items per page changes
        itemsPerPage(newVal) {
            this.currentPage = 1;
            this.fetchAuditData(1);
        }
    },

    async created() {
        await this.fetchAuditData();
        await this.loadUserAndTeamLists();
        await this.fetchDocument();
    },

    methods: {

        async fetchAuditData(page = null) {
            this.loading = true;
            this.error = null;

            // Use provided page or current page
            const pageToFetch = page || this.currentPage;

            try {
                const response = await this.api.fetchAuditData(
                    this.auditId,
                    this.audieeId,
                    {
                        per_page: this.itemsPerPage,
                        page: pageToFetch
                    }
                );

                this.auditData = response;

                // Update pagination info
                if (response.pagination) {
                    this.totalPolicies = response.pagination.total;
                    this.totalPages = response.pagination.last_page;
                    this.currentPage = response.pagination.current_page;
                }

                console.log("Audit data:", this.auditData);
                // Fetch document data after audit data is loaded
                await this.fetchDocument();
            } catch (error) {
                this.error = error;
                notify({
                    type: 'error',
                    title: 'Error',
                    text: 'Failed to fetch audit data'
                });
            } finally {
                this.loading = false;
            }
        },
        async loadUserAndTeamLists() {
            try {
                const [usersResponse] = await Promise.all([
                    this.userApi.getAll({ select: "id|full_name" }),
                ]);
                this.Userlist = usersResponse || [];
            } catch (error) {
                console.error("Error loading user and team lists:", error);
            }
        },
        async fetchDocument() {
            try {
                if (this.auditData && this.auditData.document_id) {
                    this.document = await this.documentApi.show(this.auditData.document_id, {
                        with: ["category:name"],
                        select: "id|name|category_id",
                    });
                    console.log("document", this.document, this.auditData.document_id);
                }
            } catch (error) {
                console.error("Error fetching document:", error);
                this.document = null;
            }
        },
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        getStatusTextColor(status) {
            const lightStatuses = ['Select Status'];
            return lightStatuses.includes(status) ? 'grey-darken-2' : 'white';
        },
        previousPage() {
            if (this.currentPage > 1) {
                this.fetchAuditData(this.currentPage - 1);
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.fetchAuditData(this.currentPage + 1);
            }
        },

        goToPage(page) {
            this.fetchAuditData(page);
        },

        openStatusModal(policy) {
            this.selectedPolicy = policy;
            // Find the status from the policies_with_compliance array
            const fullPolicy = this.auditData.policies_with_compliance.find(
                p => p.id === policy.id
            );
            this.selectedStatus = fullPolicy?.pending_status || '';
            this.showStatusModal = true;
        },
        openComments(item) {
            this.isVisible = true;
            this.selectedPolicyIdActive = item.id
        },
        closeComments() {
            this.isVisible = false;
        },
        openEvidenceModal(item) {
            console.log("item", item.compliance_result);

            this.selectedPolicyForEvidence = item?.id ?? null;
            this.selectedIdResult = item?.compliance_result?.id ?? null;

            this.isVisibleEvidenceModal = true;
        },
        closeEvidenceModal() {
            this.isVisibleEvidenceModal = false;
            this.selectedPolicyForEvidence = null;
        },

        async submitStatusUpdate() {
            if (!this.selectedPolicy || !this.selectedStatus) return;

            this.loadingStatusUpdate = true;

            try {
                if (this.pendingAction === 'Rejected') {
                    // If this was a rejection with status selection
                    await this.updateAuditerStatus(this.selectedStatus);
                } else {
                    // Original status update logic for non-auditer
                    const fullPolicyData = this.auditData.policies_with_compliance.find(
                        policy => policy.id === this.selectedPolicy.id
                    );

                    const payload = {
                        audit_id: this.auditId,
                        policy_id: this.selectedPolicy.id,
                        pending_status: this.selectedStatus,
                        created_by: this.userId
                    };

                    if (fullPolicyData?.compliance_result?.id) {
                        payload.id = fullPolicyData.compliance_result.id;
                    }

                    const response = await this.auditPolicyComplianceResultApi.from(payload);

                    if (response[1].status === "success") {
                        await this.fetchAuditData();
                    }
                }

                // Close the modal
                this.showStatusModal = false;
                this.pendingAction = null; // Reset the pending action
            } catch (error) {
                console.error('Error updating compliance status:', error);

            } finally {
                this.loadingStatusUpdate = false;
            }
        },
        async takeActionOnClause(policy, action) {
            alert
            try {
                // Show confirmation dialog before doing anything else
                const result = await Swal.fire({
                    title: this.$t('complianceresultaudit.Are you sure?'),
                    text: this.$t('complianceresultaudit.This action cannot be undone', { action: action.toLowerCase() }),
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: this.$t('complianceresultaudit.Yes, {action} it!', { action: action }),
                    cancelButtonText: this.$t('complianceresultaudit.Cancel'),
                    reverseButtons: true,
                    allowOutsideClick: false
                });

                // If user cancels, return without taking action
                if (!result.isConfirmed) {
                    return;
                }

                this.selectedPolicy = policy;

                // For Approve action, proceed directly
                if (action === 'Approved') {
                    await this.updateAuditerStatus(action);
                    return;
                }

                // For Reject action, open the status modal
                if (action === 'Rejected') {
                    // Find the full policy data including compliance result
                    const fullPolicy = this.auditData.policies_with_compliance.find(
                        p => p.id === policy.id
                    );
                    this.selectedStatus = fullPolicy?.auditer_status || '';
                    this.pendingAction = action; // Store the pending action
                    this.showStatusModal = true;
                }
            } catch (error) {
                notify({
                    type: 'error',
                    title: this.$t('complianceresultaudit.Update Failed'),
                    text: error.response?.data?.errors?.[0] || this.$t('complianceresultaudit.An error occurred')
                });
            }
        },
        async updateAuditerStatus(status) {
            try {
                // Find the full policy data including compliance result
                const fullPolicyData = this.auditData.policies_with_compliance.find(
                    policy => policy.id === this.selectedPolicy.id
                );

                const payload = {
                    audit_id: this.auditId,
                    policy_id: this.selectedPolicy.id,
                    auditer_status: status,
                };

                if (fullPolicyData?.compliance_result?.id) {
                    payload.id = fullPolicyData.compliance_result.id;
                }

                const response = await this.auditPolicyComplianceResultApi.from(payload);

                if (response[1].status === "success") {
                    await this.fetchAuditData();
                }
                // Close the modal
                this.showStatusModal = false;
            } catch (error) {
                throw error; // Re-throw the error to be caught in the calling method
            }
        },
        getStatusColor(status) {
            const statusColors = {
                'Not Implemented': 'red',
                'Partially Implemented': 'orange',
                'Not Applicable': 'blue-grey',
                'Implemented': 'green',
            };
            return statusColors[status] || 'grey';
        },

        getStatusIcon(status) {
            const statusIcons = {
                'Not Implemented': 'mdi-close-circle',
                'Partially Implemented': 'mdi-progress-alert',
                'Not Applicable': 'mdi-minus-circle',
                'Implemented': 'mdi-check-circle',
            };
            return statusIcons[status] || 'mdi-help-circle';
        },

        async exportData() {
            try {
                // Show loading notification
                notify({
                    type: 'info',
                    title: this.$t('complianceresultaudit.Exporting'),
                    text: this.$t('complianceresultaudit.Preparing data for export...')
                });

                // Fetch ALL audit data without pagination
                const response = await this.api.fetchAuditData(
                    this.auditId,
                    this.audieeId,
                    {
                        per_page: -1, // Request all records (check if your backend supports -1 or use 999999)
                        page: 1
                    }
                );

                // Prepare the data for export using the fetched response
                const exportData = this.prepareExportData(response);

                // Create a new workbook
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(this.$t('complianceresultaudit.Audit Policies'));

                // Add headers
                worksheet.columns = [
                    { header: this.$t('complianceresultaudit.Audit Id'), key: 'audit_id', width: 10, hidden: true },
                    { header: this.$t('complianceresultaudit.Document Policy ID'), key: 'policy_id', width: 15, hidden: true },
                    { header: '#', key: 'counter', width: 5 },
                    { header: this.$t('complianceresultaudit.Policy Clause'), key: 'policy_clause', width: 30 },
                    { header: this.$t('complianceresultaudit.Document Name'), key: 'document_name', width: 20 },
                    { header: this.$t('complianceresultaudit.Status'), key: 'status', width: 20 }
                ];

                // Add data rows
                exportData.forEach((item, index) => {
                    worksheet.addRow({
                        audit_id: item.auditId,
                        policy_id: item.policy_id,
                        counter: index + 1,
                        policy_clause: item.policy_clause,
                        document_name: item.document_name,
                        status: item.status
                    });
                });

                // Add data validation for Status column (Column F)
                const statusOptions = [
                    this.$t('complianceresultaudit.Not Implemented'),
                    this.$t('complianceresultaudit.Implemented'),
                    this.$t('complianceresultaudit.Partially Implemented'),
                    this.$t('complianceresultaudit.Not Applicable')
                ];
                const statusList = `"${statusOptions.join(',')}"`;

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) {
                        const cell = row.getCell(6); // Column F
                        cell.dataValidation = {
                            type: 'list',
                            allowBlank: true,
                            formulae: [statusList],
                            showInputMessage: true,
                            prompt: this.$t('complianceresultaudit.Please select a status from the dropdown'),
                            showErrorMessage: true,
                            error: this.$t('complianceresultaudit.Invalid status selected'),
                            errorTitle: this.$t('complianceresultaudit.Invalid Input')
                        };
                    }
                });

                // Generate Excel file
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `${this.$t('complianceresultaudit.Audit_Policies')}_${this.auditId}.xlsx`);

                // Show success notification
                notify({
                    type: 'success',
                    title: this.$t('complianceresultaudit.Success'),
                    text: this.$t('complianceresultaudit.Data exported successfully')
                });

            } catch (error) {
                console.error('Error exporting data:', error);
                notify({
                    type: 'error',
                    title: this.$t('complianceresultaudit.Error'),
                    text: this.$t('complianceresultaudit.Failed to export audit data')
                });
            }
        },

        prepareExportData(auditData) {
            const exportData = [];
            // Check if policies_with_compliance exists
            if (auditData.policies_with_compliance && auditData.policies_with_compliance.length > 0) {
                auditData.policies_with_compliance.forEach(policy => {
                    let status = 'Not Implemented';

                    if (policy.compliance_result && policy.compliance_result.auditee_status) {
                        status = policy.compliance_result.auditee_status;
                    } else if (policy.status && policy.status !== 'No Status') {
                        status = policy.status;
                    }

                    exportData.push({
                        auditId: this.auditId,
                        policy_id: policy.id || '',
                        policy_clause: this.htmlToTextRegex(policy.name) || 'N/A',
                        document_name: this.document?.name || 'N/A',
                        status: status,
                    });
                });
            }
            // Fallback to regular policies if available
            else if (auditData.policies && auditData.policies.length > 0) {
                auditData.policies.forEach(policy => {
                    exportData.push({
                        auditId: this.auditId,
                        policy_id: policy.id || '',
                        policy_clause: this.htmlToTextRegex(policy.name) || 'N/A',
                        document_name: auditData.document?.name || 'N/A',
                        status: 'Not Implemented',
                        comment: ''
                    });
                });
            }
            // Fallback for no policies
            else {
                exportData.push({
                    auditId: this.auditId,
                    policy_id: '',
                    policy_clause: 'No policies found',
                    document_name: auditData.document?.name || 'N/A',
                    status: 'Not Implemented',
                    comment: ''
                });
            }

            return exportData;
        },

        async approveAllPolicies() {
            try {
                const payload = {
                    audit_id: this.auditId,
                    created_by: this.audieeId
                };
                const response = await this.auditPolicyComplianceResultApi.approveAllPolicies(payload);

                if (response.data.status === "success") {
                    notify({
                        type: 'success',
                        title: this.$t('complianceresultaudit.Success'),
                        text: this.$t('complianceresultaudit.All Polices Are Approved')
                    });
                    await this.fetchAuditData();
                }
            } catch (error) {
                notify({
                    type: 'error',
                    title: this.$t('complianceresultaudit.Error'),
                    text: this.$t('complianceresultaudit.Failed to Approved on All Polices. Please try again.')
                });
            }
        },

        async calculateTotals() {
            try {
                const payload = {
                    audit_id: this.auditId,
                    created_by: this.audieeId
                };
                const response = await this.auditPolicyComplianceResultApi.calcTotalStatus(payload);

                if (response.data.status === "success") {
                    notify({
                        type: 'success',
                        title: this.$t('complianceresultaudit.Success'),
                        text: this.$t('complianceresultaudit.Total status Calculated successfully')
                    });
                    await this.fetchAuditData();
                }
            } catch (error) {
                notify({
                    type: 'error',
                    title: this.$t('complianceresultaudit.Error'),
                    text: this.$t('complianceresultaudit.Failed to calc status. Please try again.')
                });
            }
        },

        async sendResults() {
            try {
                const payload = {
                    audit_id: this.auditId,
                    created_by: this.userId
                };
                const response = await this.auditPolicyComplianceResultApi.sendResults(payload);

                if (response.data.status === "success") {
                    notify({
                        type: 'success',
                        title: this.$t('complianceresultaudit.Success'),
                        text: this.$t('complianceresultaudit.All result Are Sended Succefully To Auditer')
                    });
                    await this.fetchAuditData();
                }
            } catch (error) {
                notify({
                    type: 'error',
                    title: this.$t('complianceresultaudit.Error'),
                    text: this.$t('complianceresultaudit.Failed to send Result for Auditer. Please try again.')
                });
            }
        },

        importData() {
            this.isVisibleImportModal = true;
        },
        closeImportModal() {
            this.isVisibleImportModal = false;
        },


    },
};
</script>

<style scoped>
/* Main Breadcrumb */
.audit-breadcrumb {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    flex-wrap: wrap;
}

/* Breadcrumb Items */
.breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    position: relative;
}

.breadcrumb-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
}

/* Icon Wrappers */
.item-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    flex-shrink: 0;
}

.audit-bg {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.document-bg {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}

.category-bg {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.start-bg {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.25);
}

.due-bg {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);
}

.item-icon {
    color: white;
}

/* Item Content */
.item-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
}

.breadcrumb-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
}

.breadcrumb-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.2;
    word-break: break-word;
}

.due-date {
    color: #dc2626;
    font-weight: 700;
}

/* Status Indicator */
.status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    padding: 4px 8px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 12px;
}

.status-dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.status-text {
    font-size: 0.7rem;
    font-weight: 600;
    color: #059669;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Breadcrumb Dividers */
.breadcrumb-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #e2e8f0;
    border-radius: 50%;
    flex-shrink: 0;
}

.divider-icon {
    color: #64748b;
}

/* Policies Table Styles */
.policies-table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    margin-bottom: 24px;
}

/* Table Header */
.table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    border-bottom: 1px solid #e2e8f0;
    flex-wrap: wrap;
    gap: 16px;
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.table-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.title-icon {
    padding: 8px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
}

.table-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
}

.search-container {
    min-width: 300px;
}

.search-field {
    max-width: 300px;
}

/* Data Table Styles */
.policies-table {
    background: white;
}

.policies-table :deep(.v-data-table__wrapper) {
    border-radius: 0;
}

.policies-table :deep(.v-data-table-header) {
    background: #f8fafc;
}

.policies-table :deep(.v-data-table-header th) {
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
}

.policies-table :deep(.v-data-table__tbody tr) {
    transition: all 0.2s ease;
}

.policies-table :deep(.v-data-table__tbody tr:hover) {
    background: #f9fafb;
}

/* Table Cell Styles */
.policy-name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
}

.policy-icon {
    padding: 6px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 6px;
}

.policy-name {
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
}

.policy-id-cell {
    padding: 8px 0;
}

.policy-id-chip {
    font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman', 'sans-serif';
    font-size: 0.75rem;
}

.actions-cell {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
}

.action-btn {
    min-width: 36px;
    height: 36px;
}

/* No Data State */
.no-data-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    text-align: center;
    gap: 16px;
}

.no-data-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #6b7280;
    margin: 0;
}

.no-data-text {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
}

/* Loading Table State */
.loading-table {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
}

.loading-text {
    font-size: 0.875rem;
    color: #64748b;
}

/* Pagination Styles */
.pagination-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    flex-wrap: wrap;
    gap: 16px;
}

.pagination-info {
    display: flex;
    align-items: center;
}

.pagination-text {
    font-size: 0.875rem;
    color: #64748b;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.pagination-btn {
    min-width: 80px;
}

.page-numbers {
    display: flex;
    align-items: center;
    gap: 4px;
}

.page-btn {
    min-width: 36px;
    height: 36px;
}

.items-per-page {
    display: flex;
    align-items: center;
    gap: 8px;
}

.items-label {
    font-size: 0.875rem;
    color: #64748b;
    white-space: nowrap;
}

.items-select {
    min-width: 80px;
    max-width: 80px;
}

/* Loading State */
.loading-container {
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 24px;
}

.loading-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.loading-spinner {
    flex-shrink: 0;
}

/* Error State */
.error-container {
    padding: 20px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    margin-bottom: 24px;
}

.error-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.error-icon {
    flex-shrink: 0;
}

.error-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.status-update-modal {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Header Styles */
.modal-header {
    padding: 1.5rem;
    background: #f8f9fa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-glass {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.05);
}

.header-icon {
    font-size: 20px;
    color: #333;
}

.header-text {
    text-align: left;
}

.header-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: #333;
}

.header-subtitle {
    font-size: 0.875rem;
    margin: 0;
    color: #666;
}

.close-btn {
    color: #666;
    transition: all 0.2s ease;
}

.close-btn:hover {
    color: #333;
    transform: rotate(90deg);
}

/* Content Styles */
.modal-content {
    padding: 1.5rem;
}

.enhanced-select {
    border-radius: 6px;
}

.enhanced-select :deep(.v-field__outline) {
    color: rgba(0, 0, 0, 0.1) !important;
}

.enhanced-select :deep(.v-field__input) {
    color: #333 !important;
}

/* Actions Styles */
.modal-actions {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    background: #f8f9fa;
}

.actions-container {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    width: 100%;
}

.cancel-btn {
    border-color: rgba(0, 0, 0, 0.12);
    color: #333;
}

.submit-btn {
    background-color: #333;
    color: white;
}

/* Remove background patterns */
.bg-pattern,
.pattern-grid,
.pattern-glow {
    display: none;
}

/* Status Menu Dropdown */
.status-menu {
    border-radius: 6px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Loader Styles */
.btn-loader {
    display: flex;
    align-items: center;
    gap: 8px;
}

.loader-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.audit-breadcrumb-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.action-buttons-container {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px 0;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.action-btn {
    text-transform: none;
    letter-spacing: normal;
    font-weight: 500;
}

/* Status Dot Styling */
.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
}

.active-dot {
    background-color: #4CAF50;
    /* Green for Active */
}

.inactive-dot {
    background-color: #F44336;
    /* Red for Deactivated */
}

/* Status Text Styling */
.active-text {
    color: #4CAF50;
    /* Green text for Active */
}

.inactive-text {
    color: #F44336;
    /* Red text for Deactivated */
}

@media (max-width: 960px) {
    .action-buttons-container {
        justify-content: flex-start;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .breadcrumb-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .page-title {
        font-size: 1.25rem;
    }

    .audit-breadcrumb {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .breadcrumb-item {
        justify-content: space-between;
        padding: 8px 12px;
    }

    .breadcrumb-divider {
        display: none;
    }
}

@media (max-width: 480px) {
    .audit-breadcrumb-container {
        margin-bottom: 16px;
    }

    .page-title {
        font-size: 1.125rem;
    }

    .audit-breadcrumb {
        padding: 8px 12px;
        gap: 8px;
    }

    .breadcrumb-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .breadcrumb-label {
        font-size: 0.7rem;
    }

    .breadcrumb-value {
        font-size: 0.8rem;
    }
}
</style>