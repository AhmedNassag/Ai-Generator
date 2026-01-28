<template>
  <!-- Loading Overlay for Export -->
  <div v-if="isExporting" class="loading-overlay">
    <div class="loading-content">
      <div class="spinner-container">
        <div class="spinner"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loading-text">
        <h3>Generating Excel Report</h3>
        <p>Please wait while we prepare your download...</p>
      </div>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <span class="progress-text">Processing...</span>
      </div>
    </div>
  </div>

  <!-- Main Page component -->
  <main-page ref="page" :mainPage="'internalaudit.internalaudit'" :subPage="'internalaudit.internalaudit'"
    :titlePage="'internalaudit.internalaudit'">

    <!-- DataTable Slot -->
    <template #datatable>


      <!-- DataTable - Only show when data is loaded -->
      <DataTable v-if="!loadingData" ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions">

        <!-- Name Column -->
        <template #name="{ item }">
          <router-link v-if="isAuditActive(item)" :to="{ name: 'InternalAuditDetails', params: { id: item.id } }"
            class="subject-text clickable">
            {{ item.name }}
          </router-link>
          <span v-else class="subject-text disabled">
            {{ item.name }}
          </span>
        </template>

        <!-- Regulator Column -->
        <template #regulator_id="{ item }">
          <span class="regulator-badge">
            {{ getRegulatorName(item.regulator_id) }}
          </span>
        </template>

        <!-- Framework Column -->
        <template #framework_id="{ item }">
          <span class="framework-badge">
            {{ getFrameworkName(item.regulator_id, item.framework_id) }}
          </span>
        </template>

        <!-- Controls Column -->
        <template #control_ids="{ item }">
          <div class="controls-container">
            <span v-for="controlId in item.control_ids" :key="controlId" class="control-badge"
              :title="getControlFullName(item.framework_id, controlId)">
              {{ getControlShortName(item.framework_id, controlId) }}
            </span>
            <span v-if="!item.control_ids || item.control_ids.length === 0" class="no-data">N/A</span>
          </div>
        </template>

        <!-- Reviewers Column -->
        <template #reviewer_ids="{ item }">
          <div class="reviewers-container">
            <span v-for="reviewerId in item.reviewer_ids" :key="reviewerId" class="reviewer-badge">
              {{ getReviewerName(reviewerId) }}
            </span>
            <span v-if="!item.reviewer_ids || item.reviewer_ids.length === 0" class="no-data">N/A</span>
          </div>
        </template>

        <template #addAction="{ item }">
          <slot name="export" :item="item">
            <v-list-item @click="exportData(item)" class="action-list-item" :disabled="isExporting">
              <template v-slot:prepend>
                <v-icon size="18" class="action-icon">mdi-download-outline</v-icon>
              </template>
              <v-list-item-title class="action-title">
                {{ $t("datatable.export") }}
              </v-list-item-title>
            </v-list-item>
          </slot>
        </template>
      </DataTable>
    </template>

  </main-page>

  <!-- Internal Audit Modal Component -->
  <InternalAuditModal v-model:showModal="showModal" :editData="editData"
    :regulatoreWithFrameControl="regulatoreWithFrameControl" :categoryWithDocument="categoryWithDocument" :users="users"
    @close="handleModalClose" @submit-success="handleSubmitSuccess" />
</template>

<script>
import internalaudit from "@/API/InternalAudit/InternalAudit";
import internalAuditResult from "@/API/InternalAuditResult/InternalAuditResult";
import regulator from "@/API/Regulator/Regulator";
import documentCategory from "@/API/DocumentCategory/DocumentCategory";
import user from "@/API/User/User";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import InternalAuditModal from "./InternalAuditModal.vue";
import Auth from "@/API/Auth";
import * as ExcelJS from 'exceljs';

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    InternalAuditModal
  },

  setup() {
    const api = new internalaudit();
    const apiInternalAuditResult = new internalAuditResult();
    const apiRegulator = new regulator();
    const apiDocumentCategory = new documentCategory();
    const apiUser = new user();

    const buildFilterIn = (user) => {
      const parts = [];
      if (user && user.id) {
        if (user.id) parts.push(`reviewer_ids|${user.id}|=`);
      }
      return parts.length > 0 ? parts.join("||") : undefined;
    };

    const apiParams = {
      filterIn: buildFilterIn(Auth.USER),
    };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      apiRegulator,
      apiDocumentCategory,
      apiUser,
      apiInternalAuditResult
    };
  },

  data() {
    return {
      user: Auth.USER,
      showModal: false,
      editData: {},
      regulatoreWithFrameControl: [],
      categoryWithDocument: [],
      users: [],
      isExporting: false,
      loadingData: true, // Start with true
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const now = new Date();
        const startDate = new Date(row.start_date);
        return {
          edit: startDate < now,
          delete: true,
        };
      };
    }
  },

  async created() {
    this.tableColumns = [
      { id: "name", title: this.$t("internalaudit.name"), data: "name", defaultContent: "N/A" },
      { id: "description", title: this.$t("internalaudit.description"), data: "description", defaultContent: "N/A" },
      { id: "regulator_id", title: this.$t("internalaudit.regulator"), data: "regulator_id", defaultContent: "N/A" },
      { id: "framework_id", title: this.$t("internalaudit.framework"), data: "framework_id", defaultContent: "N/A" },
      { id: "control_ids", title: this.$t("internalaudit.control"), data: "control_ids", defaultContent: "N/A" },
      { id: "reviewer_ids", title: this.$t("internalaudit.reviewers"), data: "reviewer_ids", defaultContent: "N/A" },
      { id: "start_date", title: this.$t("internalaudit.start_date"), data: "start_date", defaultContent: "N/A" },
      { id: "due_date", title: this.$t("internalaudit.due_date"), data: "due_date", defaultContent: "N/A" },
      { id: "next_initiate_date", title: this.$t("internalaudit.next_initiate_date"), data: "next_initiate_date", defaultContent: "N/A" },
    ];

    try {
      await this.loadData();
    } catch (e) {
      console.error('Error loading initial data on created:', e);
    }
  },

  methods: {
    async loadData() {
      try {
        this.loadingData = true;

        this.users = await this.apiUser.getAll({
          select: 'id|full_name'
        });

        this.regulatoreWithFrameControl = await this.apiRegulator.getAll({
          with: ['frameworks.control']
        });

        const rawCategories = await this.apiDocumentCategory.getAll({
          with: ['documents:name,step_code,category_id,framework_id,control_id']
        });

        // Filter documents based on step_code matching category's step_publish
        this.categoryWithDocument = rawCategories.map(category => {
          if (!category.documents || !Array.isArray(category.documents)) {
            return category;
          }

          const filteredDocuments = category.documents.filter(document => {
            if (document && document.step_code && category.step_publish) {
              return document.step_code === category.step_publish;
            }
            return false;
          });

          return {
            ...category,
            documents: filteredDocuments
          };
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loadingData = false;
      }
    },

    async exportData(row) {
      // Enable loading overlay
      this.isExporting = true;

      try {
        // Fetch result data
        const resultData = await this.apiInternalAuditResult.getAll({
          filter: `audit_id|${row.id}|=`,
        });

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Audit Report');

        // Set column widths
        worksheet.columns = [
          { width: 20 },  // A - Control Name
          { width: 25 },  // B - Document Name
          { width: 15 },  // C - Planned Date
          { width: 15 },  // D - Review Date
          { width: 20 },  // E - Reviewer
          { width: 15 },  // F - Action
          { width: 30 },  // G - Review Notes
        ];

        let currentRow = 1;

        // ==================== DOCUMENT REVISION HISTORY HEADER ====================
        worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
        const titleCell = worksheet.getCell(`A${currentRow}`);
        titleCell.value = 'Document Revision History';
        titleCell.font = {
          size: 16,
          bold: true,
          color: { argb: 'FF1F4E78' },
          name: 'Calibri'
        };
        titleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDBE5F1' }
        };
        titleCell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          indent: 1
        };
        titleCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        worksheet.getRow(currentRow).height = 25;

        // Add logo cell
        worksheet.mergeCells(`E${currentRow}:G${currentRow}`);
        const logoCell = worksheet.getCell(`E${currentRow}`);
        logoCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFD966' }
        };
        logoCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        currentRow++;

        // ==================== REVISION HISTORY TABLE ====================
        const revisionHeaders = [
          { col: 'A', title: 'Reviewer' },
          { col: 'B', title: 'Date' },
          { col: 'C', title: 'Name', colSpan: 2 }
        ];

        revisionHeaders.forEach(header => {
          if (header.colSpan) {
            worksheet.mergeCells(`${header.col}${currentRow}:D${currentRow}`);
          }
          const cell = worksheet.getCell(`${header.col}${currentRow}`);
          cell.value = header.title;
          cell.font = {
            bold: true,
            size: 11,
            color: { argb: 'FFFFFFFF' },
            name: 'Calibri'
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F4E78' }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        worksheet.getRow(currentRow).height = 20;
        currentRow++;

        // Revision data row
        const allReviewers = row.reviewer_ids?.map(id => this.getReviewerName(id)).join(', ') || 'N/A';

        const reviewerCell = worksheet.getCell(`A${currentRow}`);
        reviewerCell.value = allReviewers;
        reviewerCell.font = {
          size: 10,
          name: 'Calibri'
        };
        reviewerCell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
          indent: 1
        };
        reviewerCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        const dateCell = worksheet.getCell(`B${currentRow}`);
        dateCell.value = row.start_date ? new Date(row.start_date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
        dateCell.font = {
          size: 10,
          name: 'Calibri'
        };
        dateCell.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
        dateCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
        const descCell = worksheet.getCell(`C${currentRow}`);
        descCell.value = row.name || 'Audit Report';
        descCell.font = {
          size: 10,
          name: 'Calibri'
        };
        descCell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
          indent: 1
        };
        descCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        worksheet.getRow(currentRow).height = 20;
        currentRow += 2;

        // ==================== AUDIT PURPOSE ====================
        const purposeCell = worksheet.getCell(`A${currentRow}`);
        purposeCell.value = 'Audit Purpose:';
        purposeCell.font = {
          bold: true,
          size: 11,
          name: 'Calibri'
        };
        currentRow++;

        const purposeText = worksheet.getCell(`A${currentRow}`);
        purposeText.value = 'This report provides a comprehensive overview of the control document audit results.';
        purposeText.font = {
          size: 10,
          name: 'Calibri'
        };
        currentRow++;

        const purposeText2 = worksheet.getCell(`A${currentRow}`);
        purposeText2.value = 'It includes details about each control, associated documents, review dates, and actions taken.';
        purposeText2.font = {
          size: 10,
          name: 'Calibri'
        };
        currentRow += 2;

        // ==================== REPORT GENERATION INFO ====================
        const reportGenCell = worksheet.getCell(`A${currentRow}`);
        reportGenCell.value = `Report Generated on: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`;
        reportGenCell.font = {
          italic: true,
          size: 10,
          name: 'Calibri'
        };
        currentRow++;

        const generatedByCell = worksheet.getCell(`A${currentRow}`);
        generatedByCell.value = `Generated By: ${this.user?.full_name || 'Admin'}`;
        generatedByCell.font = {
          size: 10,
          name: 'Calibri'
        };
        currentRow += 3;

        // ==================== MAIN DATA TABLE ====================
        const dataHeaders = [
          { col: 'A', title: 'Control Name' },
          { col: 'B', title: 'Document Name' },
          { col: 'C', title: 'Planned Date' },
          { col: 'D', title: 'Review Date' },
          { col: 'E', title: 'Reviewer' },
          { col: 'F', title: 'Action' },
          { col: 'G', title: 'Review Notes' }
        ];

        dataHeaders.forEach(header => {
          const cell = worksheet.getCell(`${header.col}${currentRow}`);
          cell.value = header.title;
          cell.font = {
            bold: true,
            size: 11,
            color: { argb: 'FFFFFFFF' },
            name: 'Calibri'
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F4E78' }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        worksheet.getRow(currentRow).height = 20;
        currentRow++;

        // Data Rows
        if (resultData && resultData.length > 0) {
          resultData.forEach((result) => {
            const controlShortName = this.getControlShortName(row.framework_id, result.control_id);
            const documentName = this.getDocumentName(result.document_id);

            const rowData = [
              controlShortName,
              documentName,
              row.start_date ? new Date(row.start_date).toLocaleDateString('en-GB') : '',
              result.action_date ? new Date(result.action_date).toLocaleDateString('en-GB') : '',
              this.getReviewerName(result.action_by),
              result.status || '',
              result.comment || ''
            ];

            rowData.forEach((value, index) => {
              const col = String.fromCharCode(65 + index);
              const cell = worksheet.getCell(`${col}${currentRow}`);
              cell.value = value;
              cell.font = {
                size: 10,
                name: 'Calibri'
              };
              cell.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
              };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };

              if (index === 5) {
                const status = value.toLowerCase();
                if (status === 'approved') {
                  cell.value = '✔ Approved';
                  cell.font = {
                    size: 10,
                    bold: true,
                    name: 'Calibri'
                  };
                } else if (status === 'rejected') {
                  cell.value = '✖ Rejected';
                  cell.font = {
                    size: 10,
                    bold: true,
                    color: { argb: 'FFFF0000' },
                    name: 'Calibri'
                  };
                } else if (status === 'pending') {
                  cell.value = '⏳ Pending';
                  cell.font = {
                    size: 10,
                    bold: true,
                    color: { argb: 'FFFF9900' },
                    name: 'Calibri'
                  };
                }
              }
            });

            worksheet.getRow(currentRow).height = 18;
            currentRow++;
          });
        }

        currentRow += 2;

        // ==================== SUMMARY SECTION ====================
        worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
        const summaryHeader = worksheet.getCell(`A${currentRow}`);
        summaryHeader.value = 'SUMMARY';
        summaryHeader.font = {
          size: 14,
          bold: true,
          color: { argb: 'FF1F4E78' },
          name: 'Calibri'
        };
        summaryHeader.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDBE5F1' }
        };
        summaryHeader.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
        summaryHeader.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        worksheet.getRow(currentRow).height = 22;
        currentRow++;

        // Calculate statistics
        const approvedCount = resultData.filter(r => r.status === 'approved').length;
        const rejectedCount = resultData.filter(r => r.status === 'rejected').length;
        const pendingCount = resultData.filter(r => r.status === 'pending').length;
        const totalCount = resultData.length;
        const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

        // Summary statistics
        const summaryData = [
          { label: 'Approved Documents:', value: approvedCount, bgColor: 'FFD9EAD3' },
          { label: 'Rejected Documents:', value: rejectedCount, bgColor: 'FFF4CCCC' },
          { label: 'Pending Documents:', value: pendingCount, bgColor: 'FFFFF2CC' },
          { label: 'Total Documents:', value: totalCount, bgColor: 'FFDAE3F3' }
        ];

        summaryData.forEach((item, index) => {
          const isLeft = index % 2 === 0;
          const labelCol = isLeft ? 'A' : 'D';
          const valueCol = isLeft ? 'B' : 'E';

          const labelCell = worksheet.getCell(`${labelCol}${currentRow}`);
          labelCell.value = item.label;
          labelCell.font = {
            bold: true,
            size: 10,
            name: 'Calibri'
          };
          labelCell.alignment = {
            vertical: 'middle',
            horizontal: 'left',
            indent: 1
          };
          labelCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };

          const valueCell = worksheet.getCell(`${valueCol}${currentRow}`);
          valueCell.value = item.value;
          valueCell.font = {
            bold: true,
            size: 11,
            name: 'Calibri'
          };
          valueCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: item.bgColor }
          };
          valueCell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
          valueCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };

          if (!isLeft || index === summaryData.length - 1) {
            currentRow++;
          }
        });

        currentRow++;

        // Approval Rate
        const approvalLabelCell = worksheet.getCell(`A${currentRow}`);
        approvalLabelCell.value = 'Approval Rate:';
        approvalLabelCell.font = {
          bold: true,
          size: 10,
          name: 'Calibri'
        };
        approvalLabelCell.alignment = {
          vertical: 'middle',
          horizontal: 'left',
          indent: 1
        };
        approvalLabelCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        const approvalValueCell = worksheet.getCell(`B${currentRow}`);
        approvalValueCell.value = `${approvalRate}%`;
        approvalValueCell.font = {
          bold: true,
          size: 11,
          name: 'Calibri'
        };
        approvalValueCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9EAD3' }
        };
        approvalValueCell.alignment = {
          vertical: 'middle',
          horizontal: 'center'
        };
        approvalValueCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        worksheet.getRow(currentRow).height = 20;

        // Generate and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `Audit_Report_${row.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.download = fileName;
        link.click();

        window.URL.revokeObjectURL(url);

        console.log('✅ Excel report exported successfully!');
      } catch (error) {
        console.error("❌ Error in exportData:", error);
        alert('Failed to export audit data. Please try again.');
      } finally {
        // Disable loading overlay
        this.isExporting = false;
      }
    },

    getDocumentName(documentId) {
      if (!documentId) return 'N/A';

      for (const category of this.categoryWithDocument) {
        if (category.documents) {
          const document = category.documents.find(
            d => d.id === documentId || d._id === documentId
          );
          if (document) return document.name || document.title || 'N/A';
        }
      }
      return 'N/A';
    },

    isAuditActive(item) {
      if (!item.start_date || !item.due_date) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(item.start_date);
      startDate.setHours(0, 0, 0, 0);

      const dueDate = new Date(item.due_date);
      dueDate.setHours(0, 0, 0, 0);

      return today >= startDate && today <= dueDate;
    },

    getReviewerName(reviewerId) {
      if (!reviewerId) return 'N/A';
      const reviewer = this.users.find(
        u => u.id === reviewerId || u._id === reviewerId
      );
      return reviewer?.full_name || 'N/A';
    },

    getRegulatorName(regulatorId) {
      if (!regulatorId) return 'N/A';
      const regulator = this.regulatoreWithFrameControl.find(
        r => r.id === regulatorId || r._id === regulatorId
      );
      return regulator?.name || 'N/A';
    },

    getFrameworkName(regulatorId, frameworkId) {
      if (!regulatorId || !frameworkId) return 'N/A';
      const regulator = this.regulatoreWithFrameControl.find(
        r => r.id === regulatorId || r._id === regulatorId
      );
      if (!regulator?.frameworks) return 'N/A';

      const framework = regulator.frameworks.find(
        f => f.id === frameworkId || f._id === frameworkId
      );
      return framework?.title || 'N/A';
    },

    getControlShortName(frameworkId, controlId) {
      if (!frameworkId || !controlId) return 'N/A';
      let framework = null;
      for (const regulator of this.regulatoreWithFrameControl) {
        if (regulator.frameworks) {
          framework = regulator.frameworks.find(
            f => f.id === frameworkId || f._id === frameworkId
          );
          if (framework) break;
        }
      }

      if (!framework?.control) return 'N/A';

      const control = framework.control.find(
        c => c.id === controlId || c._id === controlId
      );
      return control?.short_name || control?.name || 'N/A';
    },

    getControlFullName(frameworkId, controlId) {
      if (!frameworkId || !controlId) return 'N/A';
      let framework = null;
      for (const regulator of this.regulatoreWithFrameControl) {
        if (regulator.frameworks) {
          framework = regulator.frameworks.find(
            f => f.id === frameworkId || f._id === frameworkId
          );
          if (framework) break;
        }
      }

      if (!framework?.control) return 'N/A';

      const control = framework.control.find(
        c => c.id === controlId || c._id === controlId
      );
      return control?.name || 'N/A';
    },

    openForm() {
      this.editData = {};
      this.showModal = true;
    },

    editItem(data) {
      this.editData = data;
      this.showModal = true;
    },

    handleModalClose() {
      this.showModal = false;
      this.editData = {};
    },

    handleSubmitSuccess() {
      this.$refs.table.refreshTable();
    }
  }
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
  max-width: 400px;
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

/* Minimal Elegant Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 80px;
  border-radius: 20px;
  background: white;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid transparent;
  border-top: 3px solid #6e3894;
  border-right: 3px solid #6e3894;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 25px;
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
  line-height: 1.5;
}

/* DataTable Badge Styles */
.subject-text {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  max-width: 300px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
}

.subject-text.clickable {
  background: #d0b5e3;
  color: #6e3894;
  cursor: pointer;
}

.subject-text.clickable::before {
  content: '➜';
  margin-right: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #6e3894;
  animation: slide 1.5s ease-in-out infinite;
}

@keyframes slide {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}

.subject-text.clickable:active {
  transform: translateY(-1px) scale(0.98);
}

.subject-text.disabled {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: black;
  cursor: not-allowed;
  border: 2px solid #cbd5e1;
  box-shadow: none;
  position: relative;
}

.subject-text.disabled::before {
  content: '✖';
  margin-right: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #ef4444;
}

.description-text {
  color: #64748b;
  font-size: 13px;
  font-style: italic;
  display: inline-block;
  max-width: 300px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.regulator-badge {
  display: inline-flex;
  background: #ddd6fe;
  color: #7c3aed;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: none;
  border: none;
  transition: all 0.2s ease;
}

.regulator-badge:hover {
  background: #c4b5fd;
}

.framework-badge {
  display: inline-flex;
  background: #dcfce7;
  color: #16a34a;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: none;
  border: none;
  transition: all 0.2s ease;
}

.framework-badge:hover {
  background: #bbf7d0;
}

.controls-container,
.reviewers-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  max-width: 400px;
}

.control-badge {
  display: inline-flex;
  background: #fed7aa;
  color: #c2410c;
  padding: 5px 11px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: none;
  border: none;
  cursor: help;
  transition: all 0.2s ease;
}

.control-badge:hover {
  background: #fdba74;
}

.reviewer-badge {
  display: inline-flex;
  background: #e9d5ff;
  color: #7c3aed;
  padding: 5px 11px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: none;
  border: none;
  transition: all 0.2s ease;
}

.reviewer-badge:hover {
  background: #d8b4fe;
}

.no-data {
  color: #94a3b8;
  font-size: 12px;
  font-style: italic;
  padding: 4px 8px;
}
</style>