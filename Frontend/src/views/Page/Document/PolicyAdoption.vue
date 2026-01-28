<template>
  <PurpleDotsLoader v-if="pageLoading" />
  <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="'Document.Document'" :subPage="'document.document'"
    :titlePage="'document.document'">
    <template #datatable>
      <div class="container-fluid">
        <!-- Modern Hero Section -->
        <div class="hero-section">
          <div class="hero-bg-pattern"></div>
          <div class="hero-content">
            <div class="breadcrumb-modern">
              <i class="fas fa-home" style="color: black;"></i>
              <span class="separator">/</span>
              <span style="color: black;">Categories</span>
              <span class="separator">/</span>
              <span class="current">{{ categories.name }}</span>
            </div>
            <h1 class="hero-title-modern">{{ categories.name }}</h1>
            <p class="hero-subtitle">Manage and explore your document collection</p>
            <div class="hero-badges">
              <div class="badge-item badge-primary">
                <i class="fas fa-layer-group"></i>
                <span>{{ categories.type }}</span>
              </div>
              <div class="badge-item badge-success">
                <i class="fas fa-file-alt"></i>
                <span>{{ filteredDocuments.length }} Documents</span>
              </div>
              <div class="badge-item badge-warning">
                <i class="far fa-calendar"></i>
                <span>{{ formatDateShort(categories.created_at) }}</span>
              </div>
              <button @click="exportToExcel" class="badge-item badge-export">
                <i class="fas fa-file-excel"></i>
                <span>Export Excel</span>
              </button>
              <button @click="exportToPDF" class="badge-item badge-export-pdf">
                <i class="fas fa-file-pdf"></i>
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
        <!-- Documents List View -->
        <div class="documents-list-container">
          <div v-for="doc in filteredDocuments" :key="doc.id" class="document-row">
            <!-- Main Row -->
            <div class="row-content" @click="toggleDocument(doc.id)">
              <div class="row-left">
                <div class="doc-number">{{ filteredDocuments.indexOf(doc) + 1 }}</div>
                <div class="doc-icon-mini">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="doc-info">
                  <h3 class="doc-name">{{ doc.name }}</h3>
                  <div class="doc-meta-tags">
                    <span class="meta-tag tag-primary">
                      <i class="fas fa-code-branch"></i>
                      v{{ getActiveVersion(doc).versionNumber || 1 }}
                    </span>
                    <span v-if="getActiveVersion(doc).action_by" class="meta-tag tag-success">
                      <i class="fas fa-user-check"></i>
                      {{ getUserName(getActiveVersion(doc).action_by) }}
                    </span>
                    <span class="meta-tag tag-warning">
                      <i class="far fa-clock"></i>
                      {{ formatDateShort(getActiveVersion(doc).updated_at) }}
                    </span>
                    <span v-if="getActiveVersion(doc).filename" class="meta-tag tag-attachment">
                      <i class="fas fa-paperclip"></i>
                      Attachment
                    </span>
                  </div>
                </div>
              </div>
              <div class="row-right">
                <div class="status-badge-row">
                  <span class="status-pulse"></span>
                  Active
                </div>
                <button class="toggle-btn" :class="{ expanded: expandedDocs[doc.id] }">
                  <i class="fas fa-chevron-down"></i>
                </button>
              </div>
            </div>
            <!-- Expanded Details Panel -->
            <transition name="slide-fade">
              <div v-if="expandedDocs[doc.id]" class="details-panel">
                <!-- Info Cards Row -->
                <div class="info-cards-row">
                  <div class="info-card info-card-success">
                    <i class="far fa-clock"></i>
                    <div class="info-card-content">
                      <span class="info-label">Modified</span>
                      <span class="info-value">{{ formatDateShort(getActiveVersion(doc).updated_at) }}</span>
                    </div>
                  </div>
                  <div class="info-card info-card-warning">
                    <i class="far fa-calendar-alt"></i>
                    <div class="info-card-content">
                      <span class="info-label">Published</span>
                      <span class="info-value">{{ formatDateShort(getActiveVersion(doc).published_at) }}</span>
                    </div>
                  </div>
                  <div v-if="getActiveVersion(doc).filename" class="info-card info-card-info">
                    <i class="fas fa-paperclip"></i>
                    <div class="info-card-content">
                      <span class="info-label">Attachment</span>
                      <span class="info-value truncate-text">{{ getActiveVersion(doc).filename }}</span>
                    </div>
                  </div>
                </div>
                <!-- Approval Information -->
                <div v-if="getActiveVersion(doc).action_by" class="approval-section">
                  <div class="approval-header">
                    <i class="fas fa-check-circle"></i>
                    <span>Approval Information</span>
                  </div>
                  <div class="approval-content">
                    <div class="approval-item">
                      <span class="approval-label">Approved By:</span>
                      <span class="approval-value">{{ getUserName(getActiveVersion(doc).action_by) }}</span>
                    </div>
                    <div class="approval-item" v-if="getUserJob(getActiveVersion(doc).action_by)">
                      <span class="approval-label">Position:</span>
                      <span class="approval-value">{{ getUserJob(getActiveVersion(doc).action_by) }}</span>
                    </div>
                  </div>
                </div>
                <!-- Modern Tabs -->
                <div class="modern-tabs">
                  <button class="tab-button" :class="{ active: activeTab[doc.id] === 'content' || !activeTab[doc.id] }"
                    @click.stop="setActiveTab(doc.id, 'content')">
                    <i class="fas fa-file-lines"></i>
                    <span>Content</span>
                  </button>
                  <button v-if="getFilteredVersions(doc).length > 1" class="tab-button"
                    :class="{ active: activeTab[doc.id] === 'versions' }"
                    @click.stop="setActiveTab(doc.id, 'versions')">
                    <i class="fas fa-code-branch"></i>
                    <span>Versions</span>
                    <span class="count-badge">{{ getFilteredVersions(doc).length }}</span>
                  </button>
                  <button class="tab-button" :class="{ active: activeTab[doc.id] === 'details' }"
                    @click.stop="setActiveTab(doc.id, 'details')">
                    <i class="fas fa-info-circle"></i>
                    <span>Details</span>
                  </button>
                  <div class="tab-indicator" :style="getTabIndicatorStyle(doc.id)"></div>
                </div>
                <!-- Tab Panels -->
                <div class="tab-panels">
                  <!-- Content Panel -->
                  <div v-if="activeTab[doc.id] === 'content' || !activeTab[doc.id]" class="tab-panel">
                    <div class="panel-header">
                      <h4><i class="fas fa-file-lines"></i> Document Content</h4>
                    </div>
                    <div class="content-viewer" v-html="getActiveVersion(doc).content"></div>
                  </div>
                  <!-- Versions Panel -->
                  <div v-if="activeTab[doc.id] === 'versions'" class="tab-panel">
                    <div class="versions-timeline">
                      <div v-for="(version, index) in getFilteredVersions(doc)" :key="version._id" class="version-item"
                        :class="{ current: version.active === 1 }">
                        <div class="version-marker">
                          <div class="marker-icon">
                            <i v-if="version.active === 1" class="fas fa-star"></i>
                            <span v-else>{{ version.versionNumber }}</span>
                          </div>
                          <div v-if="index !== getFilteredVersions(doc).length - 1" class="marker-line"></div>
                        </div>
                        <div class="version-details">
                          <div class="version-header">
                            <div class="version-info">
                              <span class="version-title">Version {{ version.versionNumber }}</span>
                              <span v-if="version.active === 1" class="current-badge">
                                <i class="fas fa-check-circle"></i>
                                Current
                              </span>
                            </div>
                            <span class="version-date">{{ formatDateShort(version.updated_at) }}</span>
                          </div>

                          <!-- Version Meta Information -->
                          <div class="version-meta-grid">
                            <div v-if="version.action_by" class="version-meta-item meta-approval">
                              <div class="meta-icon">
                                <i class="fas fa-user-check"></i>
                              </div>
                              <div class="meta-content">
                                <span class="meta-label">Approved By</span>
                                <span class="meta-value">{{ getUserName(version.action_by) }}</span>
                                <span v-if="getUserJob(version.action_by)" class="meta-sub">{{
                                  getUserJob(version.action_by) }}</span>
                              </div>
                            </div>

                            <div v-if="version.published_date" class="version-meta-item meta-published">
                              <div class="meta-icon">
                                <i class="far fa-calendar-check"></i>
                              </div>
                              <div class="meta-content">
                                <span class="meta-label">Published Date</span>
                                <span class="meta-value">{{ formatDateShort(version.published_date) }}</span>
                              </div>
                            </div>

                            <div v-if="version.filename" class="version-meta-item meta-file"
                              @click.stop="downloadFile(version)" style="cursor: pointer;">
                              <div class="meta-icon">
                                <i class="fas fa-paperclip"></i>
                              </div>
                              <div class="meta-content">
                                <span class="meta-label">Attachment</span>
                                <span class="meta-value">{{ version.filename }}</span>
                              </div>
                              <i class="fas fa-download download-icon"></i>
                            </div>
                          </div>
                          <div v-if="version.content" class="version-content" v-html="version.content"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Details Panel -->
                  <div v-if="activeTab[doc.id] === 'details'" class="tab-panel">
                    <div class="details-sections">
                      <div class="detail-section">
                        <h5><i class="fas fa-info-circle"></i> Basic Information</h5>
                        <div class="detail-list">
                          <div class="detail-item">
                            <span class="detail-key">Document Name</span>
                            <span class="detail-val">{{ doc.name }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-key">Current Version</span>
                            <span class="detail-val">v{{ getActiveVersion(doc).versionNumber || 1 }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-key">Status</span>
                            <span class="detail-val status-active">
                              <span class="status-icon"></span>
                              {{ doc.status }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="detail-section">
                        <h5><i class="far fa-calendar"></i> Timeline</h5>
                        <div class="detail-list">
                          <div class="detail-item">
                            <span class="detail-key">Last Modified</span>
                            <span class="detail-val">{{ formatDateShort(getActiveVersion(doc).updated_at) }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="detail-key">Published Date</span>
                            <span class="detail-val">{{ formatDateShort(getActiveVersion(doc).published_date) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="detail-section" v-if="getActiveVersion(doc).action_by">
                        <h5><i class="fas fa-user-check"></i> Approval Details</h5>
                        <div class="detail-list">
                          <div class="detail-item">
                            <span class="detail-key">Approved By</span>
                            <span class="detail-val">{{ getUserName(getActiveVersion(doc).action_by) }}</span>
                          </div>
                          <div class="detail-item" v-if="getUserJob(getActiveVersion(doc).action_by)">
                            <span class="detail-key">Position</span>
                            <span class="detail-val">{{ getUserJob(getActiveVersion(doc).action_by) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="detail-section" v-if="getActiveVersion(doc).filename">
                        <h5><i class="fas fa-paperclip"></i> Attachments</h5>
                        <div class="attachment-box" @click.stop="downloadFile(getActiveVersion(doc))">
                          <div class="attachment-preview">
                            <i class="far fa-file"></i>
                          </div>
                          <div class="attachment-details">
                            <span class="attachment-filename">{{ getActiveVersion(doc).filename }}</span>
                            <span class="attachment-type">Click to download</span>
                          </div>
                          <button class="attachment-download">
                            <i class="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <!-- Modern Empty State -->
        <div v-if="!filteredDocuments || filteredDocuments.length === 0" class="empty-modern">
          <div class="empty-icon-wrapper">
            <div class="empty-icon">
              <i class="fas fa-folder-open"></i>
            </div>
            <div class="empty-decoration deco-1"></div>
            <div class="empty-decoration deco-2"></div>
            <div class="empty-decoration deco-3"></div>
          </div>
          <h3>No Documents Found</h3>
          <p>There are no documents matching this category's step code. Start by creating your first document to get
            organized!</p>
          <button class="create-document-btn">
            <i class="fas fa-plus"></i>
            <span>Create Document</span>
          </button>
        </div>
      </div>
    </template>
  </main-page>
</template>

<script>
import documentcategory from "@/API/DocumentCategory/DocumentCategory";
import user from "@/API/User/User";
import job from "@/API/Job/Job";
import Auth from "@/API/Auth";
import MainPage from "@/components/MainPage.vue";
import PurpleDotsLoader from '@/components/PurpleDotsLoader.vue';
import axios from 'axios';
import * as XLSX from 'xlsx-js-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { notify } from "@kyvg/vue3-notification";

export default {
  name: "DocumentDetails",
  components: {
    MainPage,
    PurpleDotsLoader
  },
  setup() {
    const categoriesApi = new documentcategory();
    const userApi = new user();
    const jobApi = new job();
    const USER_ID = Auth.USER.id;
    const basePath = axios.defaults.baseURL;
    return {
      categoriesApi,
      userApi,
      jobApi,
      USER_ID,
      basePath
    };
  },
  data() {
    return {
      user: Auth.USER,
      pageLoading: false,
      activeStatusTab: "log",
      userList: [],
      jobList: [],
      teamList: [],
      categories: {},
      expandedDocs: {},
      expandedVersions: {},
      activeTab: {},
    };
  },
  computed: {
    filteredDocuments() {
      if (!this.categories.documents || !this.categories.step_publish) {
        return [];
      }
      return this.categories.documents.filter(doc => doc.step_code === this.categories.step_publish);
    }
  },
  async mounted() {
    await this.fetchUserList();
    await this.fetchJobList();
    await this.fetchCategoriesDetails();
  },
  methods: {
    async fetchUserList() {
      try {
        this.userList = await this.userApi.getAll({ select: "id|full_name|job_id" });
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    },
    async fetchJobList() {
      try {
        this.jobList = await this.jobApi.getAll({ select: "id|name" });
      } catch (error) {
        console.error("Error fetching job list:", error);
      }
    },
    async fetchCategoriesDetails() {
      try {
        this.pageLoading = true;
        const response = await this.categoriesApi.show(this.$route.params.id, {
          with: ["documents:category_id,name,content,versionnotes,step_code,status,published_date"],
        });
        this.categories = response;
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        this.pageLoading = false;
      }
    },
    getFilteredVersions(doc) {
      if (!doc.versionnotes || doc.versionnotes.length === 0) {
        return [];
      }
      if (!this.categories.step_publish) {
        return doc.versionnotes;
      }
      return doc.versionnotes.filter(version => version.step_code === this.categories.step_publish);
    },
    toggleDocument(docId) {
      this.expandedDocs = {
        ...this.expandedDocs,
        [docId]: !this.expandedDocs[docId]
      };
    },
    setActiveTab(docId, tab) {
      this.activeTab = {
        ...this.activeTab,
        [docId]: tab
      };
    },
    getTabIndicatorStyle(docId) {
      const currentTab = this.activeTab[docId] || 'content';
      const doc = this.filteredDocuments?.find(d => d.id === docId);
      const hasVersions = this.getFilteredVersions(doc).length > 1;
      let tabIndex = 0;
      if (currentTab === 'versions') tabIndex = 1;
      else if (currentTab === 'details') tabIndex = hasVersions ? 2 : 1;
      const totalTabs = hasVersions ? 3 : 2;
      const width = 100 / totalTabs;
      return {
        transform: `translateX(${tabIndex * 100}%)`,
        width: `calc(${width}% - 3px)`
      };
    },
    toggleVersionHistory(docId) {
      this.expandedVersions = {
        ...this.expandedVersions,
        [docId]: !this.expandedVersions[docId]
      };
    },
    getActiveVersion(doc) {
      const filteredVersions = this.getFilteredVersions(doc);
      if (!filteredVersions || filteredVersions.length === 0) {
        return { content: doc.content, versionNumber: 1 };
      }
      const activeVersion = filteredVersions.find(v => v.active === 1);
      return activeVersion || filteredVersions[filteredVersions.length - 1];
    },
    getUserName(userId) {
      if (!userId) return 'Unknown User';
      const user = this.userList.find(u => u.id === userId);
      return user ? user.full_name : 'Unknown User';
    },
    getUserJob(userId) {
      if (!userId) return '';
      const user = this.userList.find(u => u.id === userId);
      if (!user || !user.job_id) return '';
      const job = this.jobList.find(j => j.id === user.job_id);
      return job ? job.name : '';
    },
    formatDateShort(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    async downloadFile(version) {
      let fileUrl = version.filepath;
      const cleanBase = this.basePath.replace('/api', '').replace(/\/$/, '');
      fileUrl = `${cleanBase}/storage/${fileUrl}`.replace('//', '/');
      fileUrl = fileUrl.replace('http:/', 'http://');
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = version.filepath || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    copyContent(content) {
      if (!content) {
        if (this.$toast) {
          this.$toast.warning('No content to copy');
        }
        return;
      }
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      navigator.clipboard.writeText(plainText).then(() => {
        if (this.$toast) {
          this.$toast.success('Content copied to clipboard');
        }
      }).catch(err => {
        console.error('Failed to copy:', err);
        if (this.$toast) {
          this.$toast.error('Failed to copy content');
        }
      });
    },
    downloadContent(filename, content) {
      if (!content) {
        if (this.$toast) {
          this.$toast.warning('No content to download');
        }
        return;
      }
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'document'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      if (this.$toast) {
        this.$toast.success('Content downloaded successfully');
      }
    },
    stripHtml(html) {
      if (!html) return '';
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    },

    async exportToPDF() {
      try {
        if (this.$toast) {
          this.$toast.info('Generating PDF document report...');
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        let yPos = margin;

        // Colors
        const colors = {
          primary: [99, 102, 241],
          darkBlue: [31, 78, 120],
          purple: [123, 104, 187],
          gold: [201, 169, 72],
          success: [22, 163, 74],
          warning: [202, 138, 4],
          lightGray: [242, 242, 242],
          darkGray: [66, 66, 66],
          black: [0, 0, 0],
          white: [255, 255, 255]
        };

        // Header Section
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setTextColor(...colors.white);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Document Revision History', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const categoryText = `Category: ${this.categories.name || 'N/A'}`;
        const typeText = `Type: ${this.categories.type || 'N/A'}`;
        doc.text(categoryText, margin, 32, { maxWidth: contentWidth / 2 - 5 });
        doc.text(typeText, pageWidth - margin, 32, { align: 'right', maxWidth: contentWidth / 2 - 5 });

        doc.text(`Generated: ${this.formatDateShort(new Date())}`, margin, 38);
        doc.text(`By: ${Auth.USER.full_name || 'System'}`, pageWidth - margin, 38, { align: 'right' });

        yPos = 55;

        // Loop through documents
        this.filteredDocuments.forEach((docItem, docIndex) => {
          const versions = this.getFilteredVersions(docItem);
          const activeVersion = this.getActiveVersion(docItem);

          // Check if we need a new page
          if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = margin;
          }

          // Document Header
          doc.setFillColor(...colors.purple);
          doc.rect(margin, yPos, contentWidth, 12, 'F');

          doc.setTextColor(...colors.white);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          const docTitle = `#${String(docIndex + 1).padStart(2, '0')} ${docItem.name || `Document ${docIndex + 1}`}`;
          doc.text(docTitle, margin + 5, yPos + 8, { maxWidth: contentWidth - 10 });

          yPos += 15;

          // Document Info Box
          const infoBoxHeight = activeVersion.action_by ? 30 : 22;
          doc.setFillColor(255, 248, 231);
          doc.rect(margin, yPos, contentWidth, infoBoxHeight, 'F');
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, yPos, contentWidth, infoBoxHeight, 'S');

          doc.setTextColor(...colors.darkGray);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');

          const colWidth = contentWidth / 3;
          const col1X = margin + 3;
          const col2X = margin + colWidth;
          const col3X = margin + colWidth * 2;

          // Row 1
          doc.text(`STATUS: ${docItem.status || 'Active'}`, col1X, yPos + 6, { maxWidth: colWidth - 6 });
          doc.text(`VERSION: v${activeVersion.versionNumber || 1}`, col2X, yPos + 6, { maxWidth: colWidth - 6 });
          doc.text(`TOTAL: ${versions && versions.length > 0 ? versions.length : 1}`, col3X, yPos + 6, { maxWidth: colWidth - 6 });

          // Row 2
          doc.text(`PUBLISHED: ${this.formatDateShort(activeVersion.published_date)}`, col1X, yPos + 12, { maxWidth: colWidth - 6 });
          doc.text(`MODIFIED: ${this.formatDateShort(activeVersion.updated_at)}`, col2X, yPos + 12, { maxWidth: colWidth - 6 });
          doc.text(`FILE: ${activeVersion.filename ? 'Yes' : 'None'}`, col3X, yPos + 12, { maxWidth: colWidth - 6 });

          // Row 3 - Approval (if exists)
          if (activeVersion.action_by) {
            doc.setTextColor(...colors.success);
            const approverName = this.getUserName(activeVersion.action_by);
            const approverJob = this.getUserJob(activeVersion.action_by);
            const approvalText = `✓ APPROVED BY: ${approverName}`;
            const positionText = `POSITION: ${approverJob || 'N/A'}`;

            doc.text(approvalText, col1X, yPos + 18, { maxWidth: colWidth * 1.5 - 6 });
            doc.text(positionText, col2X + colWidth / 2, yPos + 18, { maxWidth: colWidth * 1.5 - 6 });
          }

          yPos += infoBoxHeight + 3;

          // Preview
          const preview = activeVersion.content ? this.stripHtml(activeVersion.content) : 'No content available';
          const previewHeight = 20;
          doc.setFillColor(255, 254, 245);
          doc.rect(margin, yPos, contentWidth, previewHeight, 'F');
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, yPos, contentWidth, previewHeight, 'S');

          doc.setTextColor(...colors.darkGray);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('PREVIEW:', margin + 3, yPos + 5);

          doc.setFont('helvetica', 'italic');
          const previewLines = doc.splitTextToSize(preview, contentWidth - 30);
          doc.text(previewLines.slice(0, 3), margin + 22, yPos + 5);

          yPos += previewHeight + 3;

          // Version Timeline
          if (versions && versions.length > 0) {
            // Check if we need a new page for versions
            if (yPos > pageHeight - 80) {
              doc.addPage();
              yPos = margin;
            }

            doc.setFillColor(...colors.gold);
            doc.rect(margin, yPos, contentWidth, 10, 'F');
            doc.setTextColor(...colors.white);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('VERSION TIMELINE', pageWidth / 2, yPos + 7, { align: 'center' });

            yPos += 12;

            // Version Table with proper column widths
            const tableData = versions.map(version => {
              const versionStatus = version.active === 1 ? 'Active' : 'Archive';
              const approver = version.action_by ? this.getUserName(version.action_by) : '-';
              const position = version.action_by ? this.getUserJob(version.action_by) || '-' : '-';
              const contents = version.content ? this.stripHtml(version.content) : '-';

              return [
                `v${version.versionNumber || 1}`,
                versionStatus,
                approver,
                position,
                this.formatDateShort(version.published_date),
                this.formatDateShort(version.updated_at),
                contents
              ];
            });

            autoTable(doc, {
              startY: yPos,
              head: [['VER', 'STATUS', 'APPROVED BY', 'POSITION', 'PUBLISHED', 'MODIFIED', 'Contents']],
              body: tableData,
              theme: 'grid',
              headStyles: {
                fillColor: [245, 245, 220],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 7,
                halign: 'center',
                cellPadding: 2,
                valign: 'middle'
              },
              bodyStyles: {
                fontSize: 6,
                cellPadding: 2,
                overflow: 'linebreak',
                cellWidth: 'wrap',
                minCellHeight: 10,
                valign: 'top'
              },
              columnStyles: {
                0: { cellWidth: 10, halign: 'center', valign: 'middle' },
                1: { cellWidth: 18, halign: 'center', valign: 'middle' },
                2: { cellWidth: 30, halign: 'left', valign: 'top' },
                3: { cellWidth: 30, halign: 'left', valign: 'top' },
                4: { cellWidth: 18, halign: 'center', fontSize: 6, valign: 'middle' },
                5: { cellWidth: 18, halign: 'center', fontSize: 6, valign: 'middle' },
                6: { cellWidth: 46, halign: 'left', valign: 'top' }
              },
              didParseCell: function (data) {
                // Highlight current version
                if (data.row.index >= 0 && data.column.index === 1) {
                  if (data.cell.text[0] === 'Active') {
                    data.cell.styles.fillColor = [226, 239, 218];
                    data.cell.styles.textColor = [22, 163, 74];
                    data.cell.styles.fontStyle = 'bold';
                  }
                }
              },
              margin: { left: margin, right: margin },
              tableWidth: 'auto',
              showHead: 'firstPage'
            });

            yPos = doc.lastAutoTable.finalY + 10;
          }

          yPos += 5;
        });

        // Footer on each page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(...colors.darkGray);
          doc.text(
            `Page ${i} of ${pageCount} | ${this.categories.name} | Generated ${this.formatDateShort(new Date())}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }

        const fileName = `${this.categories.name}_Report_${new Date().getTime()}.pdf`;
        doc.save(fileName);
        notify({
          type: "success",
          title: "Export Success",
          text: 'PDF document report exported successfully!',
        });
      } catch (error) {
        console.error('PDF Export error:', error);
        if (this.$toast) {
          this.$toast.error('Failed to export PDF: ' + error.message);
        } else {
          alert('Failed to export PDF: ' + error.message);
        }
      }
    },

    async exportToExcel() {
      const colors = {
        darkBlue: '1F4E78',
        tableHeader: '1F4E78',
        lightBlue: 'DDEBF7',
        lightGray: 'F2F2F2',
        lightGreen: 'E2EFDA',
        lightRed: 'FCE4D6',
        lightYellow: 'FFF2CC',
        borderGray: 'D9D9D9',
        white: 'FFFFFF',
        black: '000000',
        darkGray: '424242',
        green: '2E7D32'
      };

      try {
        if (this.$toast) {
          this.$toast.info('Generating document report...');
        }

        const wb = XLSX.utils.book_new();
        const data = [];
        const merges = [];
        const rowHeights = [];

        // Header Section with Logo/Title
        rowHeights.push({ hpx: 60 });
        data.push(['Document Revision History', '', '', '', '', '', '']);
        merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });

        rowHeights.push({ hpx: 10 });
        data.push(['', '', '', '', '', '', '']);

        // Category Info - Single merged row
        rowHeights.push({ hpx: 25 });
        data.push(['Category:', this.categories.name || 'N/A', '', '', 'Type:', this.categories.type || 'N/A', '']);

        rowHeights.push({ hpx: 10 });
        data.push(['', '', '', '', '', '', '']);

        // Report Info - Single merged row
        rowHeights.push({ hpx: 25 });
        data.push(['Report Generated on:', this.formatDateShort(new Date()), '', '', 'Generated By:', Auth.USER.full_name || 'System', '']);

        rowHeights.push({ hpx: 10 });
        data.push(['', '', '', '', '', '', '']);

        rowHeights.push({ hpx: 10 });
        data.push(['', '', '', '', '', '', '']);

        // Document Revision History Section Header
        rowHeights.push({ hpx: 30 });
        data.push(['Document Revision History', '', '', '', '', '', '']);
        merges.push({ s: { r: 7, c: 0 }, e: { r: 7, c: 6 } });

        // Document Revision History Table
        let currentRow = 8;

        this.filteredDocuments.forEach((doc, docIndex) => {
          const versions = this.getFilteredVersions(doc);
          const activeVersion = this.getActiveVersion(doc);

          // Document Header Row (with #)
          rowHeights.push({ hpx: 35 });
          data.push([`#${String(docIndex + 1).padStart(2, '0')}`, doc.name || `Document ${docIndex + 1}`, '', '', '', '', '']);
          merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 6 } });
          currentRow++;

          // Document Info Row
          rowHeights.push({ hpx: 25 });
          const statusLabel = doc.status || 'Active';
          const versionLabel = `v${activeVersion.versionNumber || 1}`;
          const totalVersions = versions && versions.length > 0 ? versions.length : 1;
          data.push([
            `STATUS: ${statusLabel}`,
            `VERSION: ${versionLabel}`,
            `TOTAL: ${totalVersions}`,
            '',
            '',
            '',
            ''
          ]);
          currentRow++;

          // Published and Modified Row
          rowHeights.push({ hpx: 25 });
          data.push([
            `PUBLISHED: ${this.formatDateShort(activeVersion.published_date)}`,
            `MODIFIED: ${this.formatDateShort(activeVersion.updated_at)}`,
            `FILE: ${activeVersion.filename ? 'Yes' : 'None'}`,
            '',
            '',
            '',
            ''
          ]);
          currentRow++;

          // Approved By Row
          if (activeVersion.action_by) {
            rowHeights.push({ hpx: 25 });
            const approverName = this.getUserName(activeVersion.action_by);
            const approverJob = this.getUserJob(activeVersion.action_by);
            data.push([
              `✓ APPROVED BY: ${approverName}`,
              `POSITION: ${approverJob || 'N/A'}`,
              '',
              '',
              '',
              '',
              ''
            ]);
            merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 6 } });
            currentRow++;
          }

          // Preview Row
          rowHeights.push({ hpx: 30 });
          const preview = activeVersion.content ? this.stripHtml(activeVersion.content) : 'No content available';
          data.push([
            'PREVIEW:',
            preview,
            '',
            '',
            '',
            '',
            ''
          ]);
          merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 6 } });
          currentRow++;

          // Version Timeline Header
          if (versions && versions.length > 0) {
            rowHeights.push({ hpx: 30 });
            data.push(['VERSION TIMELINE', '', '', '', '', '', '']);
            merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 6 } });
            currentRow++;

            // Version Table Header
            rowHeights.push({ hpx: 25 });
            data.push(['VER', 'STATUS', 'APPROVED BY', 'POSITION', 'PUBLISHED', 'MODIFIED', 'Contents']);
            currentRow++;

            // Version Rows
            versions.forEach((version) => {
              rowHeights.push({ hpx: 25 });
              const versionStatus = version.active === 1 ? 'Active' : 'Archive';
              const approver = version.action_by ? this.getUserName(version.action_by) : '-';
              const position = version.action_by ? this.getUserJob(version.action_by) || '-' : '-';
              const contents = version.content ? this.stripHtml(version.content) : '-';

              data.push([
                `v${version.versionNumber || 1}`,
                versionStatus,
                approver,
                position,
                this.formatDateShort(version.published_date),
                this.formatDateShort(version.updated_at),
                contents
              ]);
              currentRow++;
            });
          }

          // Spacing between documents
          rowHeights.push({ hpx: 15 });
          data.push(['', '', '', '', '', '', '']);
          currentRow++;
        });

        // Add spacing
        rowHeights.push({ hpx: 15 });
        data.push(['', '', '', '', '', '', '']);
        currentRow++;

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!merges'] = merges;
        ws['!rows'] = rowHeights;
        ws['!cols'] = [
          { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 40 },
          { wch: 15 }, { wch: 15 }, { wch: 25 }
        ];

        // Apply Styles

        // Main Title (Row 0)
        ws['A1'].s = {
          font: { name: 'Arial', sz: 20, bold: true, color: { rgb: colors.white } },
          fill: { fgColor: { rgb: colors.darkBlue } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'medium', color: { rgb: colors.darkBlue } },
            bottom: { style: 'medium', color: { rgb: colors.darkBlue } },
            left: { style: 'medium', color: { rgb: colors.darkBlue } },
            right: { style: 'medium', color: { rgb: colors.darkBlue } }
          }
        };

        // Category Info Row (Row 2)
        for (let c = 0; c < 7; c++) {
          const cell = XLSX.utils.encode_cell({ r: 2, c: c });
          if (ws[cell]) {
            const isLabel = c === 0 || c === 4;
            ws[cell].s = {
              font: { name: 'Arial', sz: 11, bold: isLabel, color: { rgb: colors.black } },
              fill: { fgColor: { rgb: colors.lightGray } },
              alignment: { horizontal: isLabel ? 'right' : 'left', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: colors.borderGray } },
                bottom: { style: 'thin', color: { rgb: colors.borderGray } },
                left: c === 0 ? { style: 'thin', color: { rgb: colors.borderGray } } : undefined,
                right: c === 6 ? { style: 'thin', color: { rgb: colors.borderGray } } : undefined
              }
            };
          }
        }

        // Report Info Row (Row 4)
        for (let c = 0; c < 7; c++) {
          const cell = XLSX.utils.encode_cell({ r: 4, c: c });
          if (ws[cell]) {
            const isLabel = c === 0 || c === 4;
            ws[cell].s = {
              font: { name: 'Arial', sz: 10, bold: isLabel, color: { rgb: colors.darkGray } },
              fill: { fgColor: { rgb: colors.white } },
              alignment: { horizontal: isLabel ? 'right' : 'left', vertical: 'center' },
              border: {
                bottom: { style: 'thin', color: { rgb: colors.borderGray } }
              }
            };
          }
        }

        // Document Revision History Section Header (Row 7)
        const revisionHeaderCell = XLSX.utils.encode_cell({ r: 7, c: 0 });
        if (ws[revisionHeaderCell]) {
          ws[revisionHeaderCell].s = {
            font: { name: 'Arial', sz: 14, bold: true, color: { rgb: colors.darkBlue } },
            fill: { fgColor: { rgb: colors.lightBlue } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'medium', color: { rgb: colors.darkBlue } },
              bottom: { style: 'medium', color: { rgb: colors.darkBlue } },
              left: { style: 'medium', color: { rgb: colors.darkBlue } },
              right: { style: 'medium', color: { rgb: colors.darkBlue } }
            }
          };
        }

        // Style all document sections dynamically
        let styleRow = 8;
        this.filteredDocuments.forEach((doc) => {
          const versions = this.getFilteredVersions(doc);
          const activeVersion = this.getActiveVersion(doc);

          // Document Header Row
          for (let c = 0; c < 7; c++) {
            const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
            if (ws[cell]) {
              ws[cell].s = {
                font: { name: 'Arial', sz: 12, bold: true, color: { rgb: colors.white } },
                fill: { fgColor: { rgb: '7B68BB' } },
                alignment: { horizontal: c === 0 ? 'center' : 'left', vertical: 'center' },
                border: {
                  top: { style: 'medium', color: { rgb: '7B68BB' } },
                  bottom: { style: 'medium', color: { rgb: '7B68BB' } },
                  left: { style: 'medium', color: { rgb: '7B68BB' } },
                  right: { style: 'medium', color: { rgb: '7B68BB' } }
                }
              };
            }
          }
          styleRow++;

          // STATUS/VERSION/TOTAL Row
          for (let c = 0; c < 7; c++) {
            const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
            if (ws[cell]) {
              ws[cell].s = {
                font: { name: 'Arial', sz: 9, bold: true, color: { rgb: 'C87D2F' } },
                fill: { fgColor: { rgb: 'FFF8E7' } },
                alignment: { horizontal: 'left', vertical: 'center' },
                border: {
                  top: { style: 'thin', color: { rgb: colors.borderGray } },
                  bottom: { style: 'thin', color: { rgb: colors.borderGray } },
                  left: { style: 'thin', color: { rgb: colors.borderGray } },
                  right: { style: 'thin', color: { rgb: colors.borderGray } }
                }
              };
            }
          }
          styleRow++;

          // PUBLISHED/MODIFIED/FILE Row
          for (let c = 0; c < 7; c++) {
            const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
            if (ws[cell]) {
              ws[cell].s = {
                font: { name: 'Arial', sz: 9, bold: true, color: { rgb: '666666' } },
                fill: { fgColor: { rgb: colors.white } },
                alignment: { horizontal: 'left', vertical: 'center' },
                border: {
                  top: { style: 'thin', color: { rgb: colors.borderGray } },
                  bottom: { style: 'thin', color: { rgb: colors.borderGray } },
                  left: { style: 'thin', color: { rgb: colors.borderGray } },
                  right: { style: 'thin', color: { rgb: colors.borderGray } }
                }
              };
            }
          }
          styleRow++;

          // APPROVED BY Row (if exists)
          if (activeVersion.action_by) {
            for (let c = 0; c < 7; c++) {
              const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
              if (ws[cell]) {
                ws[cell].s = {
                  font: { name: 'Arial', sz: 9, bold: true, color: { rgb: colors.green } },
                  fill: { fgColor: { rgb: colors.lightGreen } },
                  alignment: { horizontal: 'left', vertical: 'center' },
                  border: {
                    top: { style: 'thin', color: { rgb: colors.borderGray } },
                    bottom: { style: 'thin', color: { rgb: colors.borderGray } },
                    left: { style: 'thin', color: { rgb: colors.borderGray } },
                    right: { style: 'thin', color: { rgb: colors.borderGray } }
                  }
                };
              }
            }
            styleRow++;
          }

          // PREVIEW Row
          for (let c = 0; c < 7; c++) {
            const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
            if (ws[cell]) {
              ws[cell].s = {
                font: { name: 'Arial', sz: 9, bold: c === 0, italic: c !== 0, color: { rgb: '666666' } },
                fill: { fgColor: { rgb: 'FFFEF5' } },
                alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
                border: {
                  top: { style: 'thin', color: { rgb: colors.borderGray } },
                  bottom: { style: 'thin', color: { rgb: colors.borderGray } },
                  left: { style: 'thin', color: { rgb: colors.borderGray } },
                  right: { style: 'thin', color: { rgb: colors.borderGray } }
                }
              };
            }
          }
          styleRow++;

          // VERSION TIMELINE Header (if versions exist)
          if (versions && versions.length > 0) {
            for (let c = 0; c < 7; c++) {
              const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
              if (ws[cell]) {
                ws[cell].s = {
                  font: { name: 'Arial', sz: 11, bold: true, color: { rgb: colors.white } },
                  fill: { fgColor: { rgb: 'C9A948' } },
                  alignment: { horizontal: 'center', vertical: 'center' },
                  border: {
                    top: { style: 'medium', color: { rgb: 'C9A948' } },
                    bottom: { style: 'medium', color: { rgb: 'C9A948' } },
                    left: { style: 'medium', color: { rgb: 'C9A948' } },
                    right: { style: 'medium', color: { rgb: 'C9A948' } }
                  }
                };
              }
            }
            styleRow++;

            // Version Table Header
            for (let c = 0; c < 7; c++) {
              const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
              if (ws[cell]) {
                ws[cell].s = {
                  font: { name: 'Arial', sz: 10, bold: true, color: { rgb: colors.black } },
                  fill: { fgColor: { rgb: 'F5F5DC' } },
                  alignment: { horizontal: 'center', vertical: 'center' },
                  border: {
                    top: { style: 'thin', color: { rgb: colors.black } },
                    bottom: { style: 'thin', color: { rgb: colors.black } },
                    left: { style: 'thin', color: { rgb: colors.black } },
                    right: { style: 'thin', color: { rgb: colors.black } }
                  }
                };
              }
            }
            styleRow++;

            // Version Rows
            versions.forEach((version) => {
              const isCurrent = version.active === 1;
              const bgColor = isCurrent ? colors.lightGreen : colors.white;

              for (let c = 0; c < 7; c++) {
                const cell = XLSX.utils.encode_cell({ r: styleRow, c: c });
                if (ws[cell]) {
                  ws[cell].s = {
                    font: {
                      name: 'Arial',
                      sz: 9,
                      bold: c === 1 && isCurrent,
                      color: { rgb: isCurrent && c === 1 ? colors.green : colors.black }
                    },
                    fill: { fgColor: { rgb: bgColor } },
                    alignment: { horizontal: c === 0 ? 'center' : 'left', vertical: 'center', wrapText: c === 6 },
                    border: {
                      top: { style: 'thin', color: { rgb: colors.borderGray } },
                      bottom: { style: 'thin', color: { rgb: colors.borderGray } },
                      left: { style: 'thin', color: { rgb: colors.borderGray } },
                      right: { style: 'thin', color: { rgb: colors.borderGray } }
                    }
                  };
                }
              }
              styleRow++;
            });
          }

          // Spacing row
          styleRow++;
        });

        XLSX.utils.book_append_sheet(wb, ws, 'Document Report');

        const fileName = `${this.categories.name}_Report_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(wb, fileName);

        notify({
          type: "success",
          title: "Export Success",
          text: 'Document report exported successfully!',
        });

      } catch (error) {
        console.error('Export error:', error);
        if (this.$toast) {
          this.$toast.error('Failed to export: ' + error.message);
        } else {
          alert('Failed to export: ' + error.message);
        }
      }
    }
  },
};
</script>

<style scoped>
/* Color Scheme Variables */
:root {
  --primary-color: #6366f1;
  --background-color: #f8fafc;
  --danger-color: #dc2626;
  --success-color: #16a34a;
  --button-color: #6366f1;
  --warning-color: #ca8a04;
  --info-color: #0ea5e9;
  --on-primary: #e0e7ff;
  --black: #0f172a;
  --gray-2: #e2e8f0;
  --gray-3: #cbd5e1;
  --pink-2: #fce7f3;
}

.container-fluid {
  background: #f0f0f0;
  border-radius: 15px;
  width: 100%;
  padding: 0;
  margin: 0;
}

/* Modern Hero Section */
.hero-section {
  position: relative;
  padding: 40px 30px 50px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 50%, #7c3aed 100%);
  overflow: hidden;
  width: 100%;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 100%;
  margin: 0 auto;
}

.breadcrumb-modern {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
}

.breadcrumb-modern i {
  font-size: 0.7rem;
  color: white;
}

.breadcrumb-modern .separator {
  color: black;
}

.breadcrumb-modern .current {
  color: black;
  font-weight: 600;
}

.hero-title-modern {
  font-size: 2rem;
  font-weight: 700;
  color: black;
  margin: 0 0 10px 0;
  letter-spacing: -1px;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 0.95rem;
  color: black;
  margin: 0 0 20px 0;
  font-weight: 400;
}

.hero-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.badge-item:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.5);
}

.badge-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.badge-success {
  background: rgba(255, 255, 255, 0.2);
  color: black;
}

.badge-warning {
  background: rgba(255, 255, 255, 0.2);
  color: black;
}

.badge-export {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.badge-export:hover {
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.4);
  transform: translateY(-3px);
}

.badge-export-pdf {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.badge-export-pdf:hover {
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
  transform: translateY(-3px);
}

/* Approval Section */
.approval-section {
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%);
  border: 2px solid var(--success-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  width: 100%;
}

.approval-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--success-color);
  margin-bottom: 12px;
}

.approval-header i {
  font-size: 1.1rem;
}

.approval-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.approval-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.approval-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--success-color);
  letter-spacing: 0.5px;
}

.approval-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--black);
}

/* Documents List View */
.documents-list-container {
  padding: 30px;
  width: 100%;
  margin: -40px auto 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-row {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--gray-2);
  transition: all 0.3s ease;
  width: 100%;
}

.document-row:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.12);
}

/* Main Row Content */
.row-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  position: relative;
  background: white;
  width: 100%;
}

.row-content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--primary-color) 0%, #7c3aed 100%);
}

.row-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.doc-number {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%);
  color: black;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.doc-icon-mini {
  width: 40px;
  height: 40px;
  background: var(--background-color);
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.doc-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.doc-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--black);
  margin: 0;
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-meta-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid;
}

.tag-primary {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.tag-success {
  background: rgba(22, 163, 74, 0.15);
  color: var(--success-color);
  border-color: var(--success-color);
}

.tag-warning {
  background: rgba(202, 138, 4, 0.15);
  color: var(--warning-color);
  border-color: var(--warning-color);
}

.tag-attachment {
  background: rgba(99, 102, 241, 0.15);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.row-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(22, 163, 74, 0.1);
  border: 1px solid var(--success-color);
  border-radius: 14px;
  color: var(--success-color);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-pulse {
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  animation: pulse-status 2s infinite;
}

@keyframes pulse-status {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(22, 163, 74, 0);
  }
}

.toggle-btn {
  width: 36px;
  height: 36px;
  background: var(--background-color);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: var(--primary-color);
  color: white;
}

.toggle-btn i {
  transition: transform 0.3s ease;
}

.toggle-btn.expanded i {
  transform: rotate(180deg);
}

/* Details Panel */
.details-panel {
  background: #fafafa;
  border-radius: 0 0 12px 12px;
  padding: 24px;
  width: 100%;
}

/* Info Cards Row */
.info-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gray-2);
  width: 100%;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.3s ease;
  background: white;
}

.info-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-card i {
  font-size: 1.1rem;
}

.info-card-success {
  border-color: var(--success-color);
}

.info-card-success i {
  color: var(--success-color);
}

.info-card-warning {
  border-color: var(--warning-color);
}

.info-card-warning i {
  color: var(--warning-color);
}

.info-card-info {
  border-color: var(--info-color);
}

.info-card-info i {
  color: var(--info-color);
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.info-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  opacity: 0.8;
}

.info-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--black);
}

.truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Modern Tabs */
.modern-tabs {
  display: flex;
  gap: 3px;
  margin-bottom: 16px;
  background: white;
  padding: 4px;
  border-radius: 8px;
  position: relative;
  width: 100%;
}

.tab-button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--black);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  opacity: 0.6;
}

.tab-button:hover {
  color: var(--primary-color);
  opacity: 1;
}

.tab-button.active {
  color: var(--primary-color);
  opacity: 1;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background: var(--background-color);
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.count-badge {
  background: var(--primary-color);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
}

/* Tab Panels */
.tab-panels {
  min-height: 200px;
  width: 100%;
}

.tab-panel {
  animation: fadeIn 0.4s ease;
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Content Panel */
.panel-header {
  background: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
  border: 1px solid var(--gray-2);
  border-bottom: none;
  width: 100%;
}

.panel-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--black);
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-header i {
  color: var(--primary-color);
}

.content-viewer {
  padding: 16px;
  line-height: 1.6;
  color: #374151;
  font-size: 0.85rem;
  background: white;
  border: 1px solid var(--gray-2);
  border-radius: 0 0 8px 8px;
  border-top: none;
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
}

/* Versions Timeline */
.versions-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.version-item {
  display: flex;
  gap: 24px;
  width: 100%;
}

.version-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-icon {
  width: 48px;
  height: 48px;
  background: #a19d9d;
  border: 3px solid var(--gray-3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  z-index: 2;
  transition: all 0.3s ease;
}

.version-item.current .marker-icon {
  background: linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%);
  border-color: var(--primary-color);
  color: black;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  font-size: 1.1rem;
}

.marker-line {
  width: 3px;
  flex: 1;
  background: var(--gray-3);
  margin-top: 10px;
}

.version-item.current .marker-line {
  background: linear-gradient(to bottom, var(--primary-color), var(--gray-3));
}

.version-details {
  flex: 1;
  padding: 6px 0 24px 0;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--black);
}

.current-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, var(--success-color) 0%, #15803d 100%);
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
}

.version-date {
  font-size: 0.75rem;
  color: var(--black);
  font-weight: 600;
  opacity: 0.7;
}

/* Version Meta Grid */
.version-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.version-meta-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--gray-2);
  transition: all 0.2s ease;
  position: relative;
}

.version-meta-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.meta-approval {
  border-left: 3px solid var(--success-color);
}

.meta-published {
  border-left: 3px solid var(--warning-color);
}

.meta-file {
  border-left: 3px solid var(--info-color);
  cursor: pointer;
}

.meta-file:hover {
  border-color: var(--primary-color);
}

.meta-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.meta-approval .meta-icon {
  background: rgba(22, 163, 74, 0.1);
  color: var(--success-color);
}

.meta-published .meta-icon {
  background: rgba(202, 138, 4, 0.1);
  color: var(--warning-color);
}

.meta-file .meta-icon {
  background: rgba(14, 165, 233, 0.1);
  color: var(--info-color);
}

.meta-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.meta-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
  color: var(--black);
}

.meta-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--black);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-sub {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--success-color);
  font-style: italic;
}

.download-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--info-color);
  font-size: 0.9rem;
}

.version-content {
  background: white;
  border: 1px solid var(--gray-2);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--black);
  max-height: 200px;
  overflow-y: auto;
}

/* Details Sections */
.details-sections {
  display: grid;
  gap: 16px;
  width: 100%;
}

.detail-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--gray-2);
  width: 100%;
}

.detail-section h5 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--black);
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section h5 i {
  color: var(--primary-color);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--gray-2);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-key {
  font-size: 0.8rem;
  color: var(--black);
  font-weight: 600;
  opacity: 0.7;
}

.detail-val {
  font-size: 0.8rem;
  color: var(--black);
  font-weight: 700;
  text-align: right;
}

.status-active {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--success-color);
}

.status-icon {
  width: 8px;
  height: 8px;
  background: var(--success-color);
  border-radius: 50%;
  animation: pulse-status 2s infinite;
}

.attachment-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--gray-2);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.attachment-box:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.attachment-preview {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.attachment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.attachment-filename {
  font-size: 0.8rem;
  color: var(--black);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-type {
  font-size: 0.7rem;
  color: var(--black);
  font-weight: 600;
  opacity: 0.6;
}

.attachment-download {
  width: 32px;
  height: 32px;
  background: var(--background-color);
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.attachment-download:hover {
  background: var(--primary-color);
  color: white;
}

/* Modern Empty State */
.empty-modern {
  text-align: center;
  padding: 100px 40px;
  background: white;
  border-radius: 24px;
  margin: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--gray-2);
  width: calc(100% - 80px);
}

.empty-icon-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 36px;
}

.empty-icon {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
  box-shadow: 0 12px 48px rgba(99, 102, 241, 0.3);
  position: relative;
  z-index: 2;
}

.empty-decoration {
  position: absolute;
  background: var(--gray-2);
  border-radius: 4px;
}

.deco-1 {
  width: 70px;
  height: 4px;
  top: 40px;
  left: -80px;
  animation: float 3s infinite;
}

.deco-2 {
  width: 90px;
  height: 4px;
  top: 70px;
  left: -100px;
  animation: float 3s infinite 0.5s;
}

.deco-3 {
  width: 60px;
  height: 4px;
  bottom: 40px;
  right: -70px;
  animation: float 3s infinite 1s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }

  50% {
    transform: translateY(-10px);
    opacity: 0.7;
  }
}

.empty-modern h3 {
  font-size: 2rem;
  color: var(--black);
  margin: 0 0 14px 0;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.empty-modern p {
  color: var(--black);
  font-size: 1.05rem;
  margin: 0 0 36px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  opacity: 0.7;
}

.create-document-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 16px 36px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 28px rgba(99, 102, 241, 0.35);
  transition: all 0.3s ease;
}

.create-document-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.45);
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title-modern {
    font-size: 1.5rem;
  }

  .documents-list-container {
    padding: 20px;
  }

  .row-content {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .row-left {
    width: 100%;
    flex-wrap: wrap;
  }

  .row-right {
    width: 100%;
    justify-content: space-between;
  }

  .doc-name {
    white-space: normal;
  }

  .info-cards-row {
    grid-template-columns: 1fr;
  }

  .modern-tabs {
    overflow-x: auto;
  }

  .approval-content {
    grid-template-columns: 1fr;
  }

  .version-meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>