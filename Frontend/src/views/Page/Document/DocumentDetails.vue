<template>
  <PurpleDotsLoader v-if="pageLoading" />
  <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="'Document.Document'" :subPage="'document.document'"
    :titlePage="'document.document'">
    <template #datatable>
      <div class="document-container">
        <div class="container-fluid">
          <!-- Header -->
          <DocumentHeader :document="document" />

          <!-- Tabs Navigation -->
          <v-tabs v-model="activeTab" class="mb-4">
            <v-tab v-if="canSeeDetail" value="Details">
              {{ $t("documentdetails.details") }}
            </v-tab>
            <v-tab v-if="canSeePropCommentsAndLogs" @click="openTabProperties(document)" value="Properties">
              {{ $t("documentdetails.properties") }}
            </v-tab>
            <v-tab value="Versions">{{ $t("documentdetails.versions") }}</v-tab>
            <v-tab v-if="canSeePropCommentsAndLogs" @click="handleStatusTabClick" value="Status">
              {{ $t("documentdetails.status") }}
            </v-tab>
          </v-tabs>

          <!-- Tabs Content -->
          <v-tabs-window v-model="activeTab">
            <!-- Details Tab -->
            <v-tabs-window-item value="Details" v-if="canSeeDetail">
              <DetailsTab 
                :document="document" 
                :userList="userList"
                :teamList="teamList" 
                @open-preview="openPdfPreview" />
            </v-tabs-window-item>

            <!-- Properties Tab -->
            <v-tabs-window-item value="Properties" v-if="canSeePropCommentsAndLogs">
              <PropertiesTab ref="propertiesForm" :document="document" :newItem="newItem" :userList="userList"
                :teamList="teamList" :frameworkList="frameworkList" :controlList="controlList"
                :fieldsFromTargetStep="fieldsFromTargetStep" :canEdit="canEditDocumentProperties"
                :isSubmitting="isSubmitting" @update="updateDocument" @add-clause="addDocumentClause"
                @remove-clause="removeDocumentClause" @framework-changed="handleFrameworkChange" />
            </v-tabs-window-item>

            <!-- Versions Tab -->
            <v-tabs-window-item value="Versions">
              <VersionsTab :document="document" :visibleVersions="visibleVersions" :canAddVersion="canAddVersion"
                :canUpdateVersion="canUpdateVersion" :canMakeActiveVersion="canMakeActiveVersion"
                :categories="categories" :userList="userList" :teamList="teamList" :workflowSteps="workflowSteps"
                :transitionLoading="transitionLoading" @add-version="openAddVersionModal"
                @edit-version="openEditVersionModal" @view-version="openVersionDetails"
                @toggle-status="toggleVersionStatus" @transition="openTransitionModal" />
            </v-tabs-window-item>

            <!-- Status Tab -->
            <v-tabs-window-item value="Status" v-if="canSeePropCommentsAndLogs">
              <StatusTab :document="document" :activeStatusTab="activeStatusTab" :logs="filteredLogs"
                :comments="comments" :canAddComment="canAddComment" :logsLoading="logsLoading" :userList="userList"
                :teamList="teamList" :workflowSteps="workflowSteps" :newComment="newComment" :loading="loading"
                :currentPage="currentPage" :logsPerPage="logsPerPage" :totalPages="totalPages"
                @update-status-tab="activeStatusTab = $event" @update-new-comment="newComment = $event"
                @update-current-page="currentPage = $event" @fetch-comments="fetchComments"
                @publish-comment="publishComment" @publish-reply="publishReply" @start-reply="startReply"
                @cancel-reply="cancelReply" />
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </div>
    </template>
  </main-page>

  <!-- Modals -->
  <VersionDetailsModal :version="selectedVersion" :canAddComment="canAddComment" :isOpen="showVersionModal"
    :workflowSteps="workflowSteps" :comments="comments" :userList="userList" :teamList="teamList" :userId="USER_ID"
    :document="document" :documentId="document.id" :parentMethods="{
      getFilePath,
      getOwnerName,
      fetchComments,
      refreshVersion,
      extendValidity: extendVersionValidity
    }" @close="showVersionModal = false" />

  <!-- PDF Preview Modal -->
  <DocumentPdfPreviewModal
    :isOpen="isPdfPreviewOpen"
    :document="document"
    :dropdownOptions="{ users: userList, jobs: jobList }"
    @close="closePdfPreview" />

  <TransitionModal v-model:show="transitionModal.show" :transitions="currentTransitions" :loading="transitionLoading"
    @navigate="navigateTransition" />

  <VersionFormModal v-model:show="isModalOpenOfVersionDocument" :version="newVersion" :isEditing="isEditingVersion"
    :isSubmitting="isSubmitting" @submit="submitVersionForm" @add-clause="addVersionClause"
    @remove-clause="removeVersionClause" @file-upload="handleVersionFileUpload"
    @close="isModalOpenOfVersionDocument = false" />
</template>

<script>
import document from "@/API/Document/Document";
import documentcategory from "@/API/DocumentCategory/DocumentCategory";
import workflow from "@/API/WorkflowCategory/Workflow";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import Log from "@/API/Log/Log";
import Comment from "@/API/comment/comment";
import Auth from "@/API/Auth";
import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import Swal from "sweetalert2";

import MainPage from "@/components/MainPage.vue";
import DocumentHeader from "./components/DocumentHeader.vue";
import DetailsTab from "./components/DetailsTab.vue";
import PropertiesTab from "./components/PropertiesTab.vue";
import VersionsTab from "./components/VersionsTab.vue";
import StatusTab from "./components/StatusTab.vue";
import VersionDetailsModal from "./components/VersionDetailsModal.vue";
import DocumentPdfPreviewModal from "./components/DocumentPdfPreviewModal.vue";
import TransitionModal from "./components/TransitionModal.vue";
import VersionFormModal from "./components/VersionFormModal.vue";
import framework from "@/API/Frameworks/Frameworks";
import CenterPolicy from "@/API/CenterPolicy/CenterPolicy";
import PurpleDotsLoader from '@/components/PurpleDotsLoader.vue';

export default {
  name: "DocumentDetails",

  components: {
    MainPage,
    DocumentHeader,
    DetailsTab,
    PropertiesTab,
    VersionsTab,
    StatusTab,
    VersionDetailsModal,
    TransitionModal,
    VersionFormModal,
    PurpleDotsLoader,
    DocumentPdfPreviewModal
  },

  setup() {
    const api = new document();
    const categoriesApi = new documentcategory();
    const userApi = new user();
    const teamApi = new team();
    const logApi = new Log();
    const commentApi = new Comment();
    const workflowService = new workflow();
    const USER_ID = Auth.USER.id;
    const frameworkApi = new framework();
    const CenterPolicyApi = new CenterPolicy();

    return {
      api,
      categoriesApi,
      userApi,
      teamApi,
      logApi,
      commentApi,
      workflowService,
      USER_ID,
      frameworkApi,
      CenterPolicyApi

    };
  },

  data() {
    return {
      user: Auth.USER,
      document: {
        versionnotes: [],
        stakeholders: [],
        clauses: [],
        category: {},
        owner: {},
        active_version_id: null,
        activeVersionObject: null,
      },
      activeTab: 0,
      pageLoading: false,
      activeStatusTab: "log",

      // Lists
      userList: [],
      teamList: [],
      categories: [],
      workflowSteps: [],
      fieldsFromTargetStep: [],
      frameworkList: [],
      controlList: [],
      controlListKey: 0,

      // Form data
      newItem: {
        name: "",
        team_ids: [],
        stakeholder_ids: [],
        owner_id: "",
        reviewer_id: "",
        expiry_days: "",
        content: "",
        clauses: [""],
        file: null,
        notes: "",
        privacy: "",
        framework_id: [],
        control_id: [],
      },

      // Version data
      newVersion: {
        versionNumber: "",
        notes: "",
        content: "",
        clauses: [""],
        filename: "",
        filepath: "",
        file: null,
        document_id: "",
        privacy: "",
        expiry_days: "",
        category_id: "",
        owner_id: "",
        reviewer_id: "",
      },

      // Modals
      isModalOpenOfVersionDocument: false,
      showVersionModal: false,
      selectedVersion: null,
      isEditingVersion: false,

      // Transitions
      transitionModal: {
        show: false,
        currentItem: null,
      },
      currentTransitions: [],
      transitionLoading: false,

      // Comments
      comments: [],
      newComment: "",
      loading: false,
      replyingTo: null,
      replyText: "",
      expandedComments: new Set(),

      // Logs
      logs: [],
      logsLoading: false,
      logsPerPage: 3,
      currentPage: 1,

      // Permissions
      canAddVersion: false,

      // Submitting
      isSubmitting: false,
      isPdfPreviewOpen: false,
    };
  },

  computed: {
    filteredLogs() {
      return this.logs.filter(log => {
        const changes = this.getDocumentChanges(log);
        return changes && changes.length > 0;
      });
    },

    totalPages() {
      return Math.ceil(this.filteredLogs.length / this.logsPerPage) || 1;
    },

    canSeeDetail() {
      if (!this.document) return false;
      if (this.document.privacy === 'false') return true;
      return this.api.getUserPermissionChecker(this.document, this.workflowSteps);
    },

    canSeePropCommentsAndLogs() {
      if (!this.document) return false;
      return this.api.getUserPermissionChecker(this.document, this.workflowSteps);
    },

    visibleVersions() {
      if (!this.document || !this.document.versionnotes) return [];
      return this.document.versionnotes.filter((version) =>
        this.canViewVersion(this.document, version)
      );
    },
    canAddComment() {
      return this.canPerformAction("addCommentForVersionOrDocument");
    },
    canEditDocumentProperties() {
      return this.canPerformAction("update");
    },

    canUpdateVersion() {
      return this.canPerformAction("updateVersion");
    },
    canMakeActiveVersion() {
      return this.canPerformAction("activeVersionOrDeactivate");
    },

  },

  async mounted() {
    this.frameworkList = await this.frameworkApi.getAll({
      select: "id|title",
      with: ["control:id,short_name,framework_id"],
    });
    await this.initializeComponent();
  },

  methods: {
    async initializeComponent() {
      this.pageLoading = true;
      try {
        await this.fetchUserList();
        await this.fetchTeamList();
        await this.fetchDocumentDetails(this.$route.params.id);
        await this.fetchCategories();

        if (this.document.category?.workflow_id) {
          await this.fetchWorkflowData(this.document.category.workflow_id);
        }

        this.checkAddVersion();
        this.applyWorkflowStepFields();
      } finally {
        this.pageLoading = false;
      }
    },

    // Data fetching methods
    async fetchDocumentDetails(id) {
      try {
        const response = await this.api.show(id, { with: ["category"] });

        if (response?.versionnotes && Array.isArray(response.versionnotes)) {
          this.document = response;

          if (!this.document.active_version_id && response.versionnotes.length > 0) {
            const activeVersion = response.versionnotes.find((v) => v.active === 1);
            if (activeVersion) {
              this.document.active_version_id = activeVersion.versionNumber;
              this.document.activeVersionObject = activeVersion;
            }
          }
        } else {
          this.document = {
            ...response,
            versionnotes: [],
            active_version_id: null,
          };
        }
      } catch (error) {
        console.error("Error fetching document details:", error);
      }
    },

    async fetchUserList() {
      try {
        this.userList = await this.userApi.getAll({ select: "id|full_name" });
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    },

    async fetchTeamList() {
      try {
        this.teamList = await this.teamApi.getAll({ select: "id|name" });
      } catch (error) {
        console.error("Error fetching team list:", error);
      }
    },

    async fetchCategories() {
      try {
        const response = await this.categoriesApi.getAll({
          with: ["workflow.workflowCategory"],
          filter: `id|${this.document.category_id}|=`,
        });
        this.categories = response;
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    openPdfPreview() {
      this.isPdfPreviewOpen = true;
    },
    
    closePdfPreview() {
      this.isPdfPreviewOpen = false;
    },
    async fetchWorkflowData(id) {
      try {
        const response = await this.workflowService.getAll({
          filter: `id|${id}|=`,
        });

        if (response.length > 0) {
          this.workflowSteps = response[0].steps || [];
        }
      } catch (error) {
        console.error("Error fetching workflow details:", error);
      }
    },

    async fetchComments(id) {
      try {
        const rawComments = await this.commentApi.getAll({
          filter: `commentable_id|${id}|=`,
        });

        this.comments = await Promise.all(
          rawComments.map(async (comment) => {
            return {
              id: comment.id,
              text: comment.content,
              user: await this.findUserNameById(comment.user_id),
              date: comment.created_at,
              parent_id: comment.parent_id,
              avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            };
          })
        );

        this.comments.sort((a, b) => new Date(a.date) - new Date(b.date));
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    },

    async fetchDocumentLog(documentId) {
      try {
        this.logsLoading = true;
        this.activeStatusTab = "log";

        const response = await this.logApi.getAll({
          filter: `class|Document|=&&data.id|${this.document.id}|=`,
          orderBy: "created_at|asc",
        });

        this.logs = response.filter((log) =>
          ["create", "update"].includes(log.action)
        );
      } catch (error) {
        console.error("Error fetching document log:", error);
      } finally {
        this.logsLoading = false;
      }
    },

    // Tab handlers
    handleStatusTabClick() {
      this.activeStatusTab = "log";
      this.fetchDocumentLog(this.document.id);
    },

    openTabProperties(document) {
      this.newItem = {
        ...document,
        clauses: document.clauses?.length ? [...document.clauses] : [""],
        team_ids: document.team_ids?.map(
          (id) => this.teamList.find((team) => team.id === id) || { id }
        ),
        stakeholder_ids: document.stakeholder_ids?.map(
          (id) =>
            this.userList.find((user) => user.id === id) || {
              id,
              full_name: "",
            }
        ),
        framework_id: document.framework_id || [],
        control_id: document.control_id || [],
      };

      // Initialize control list based on existing frameworks
      if (document.framework_id?.length) {
        this.filterControlsByFrameworks(document.framework_id);
      }
    },

    // Framework and Control handling
    handleFrameworkChange(frameworkIds) {
      this.filterControlsByFrameworks(frameworkIds);
    },


    async filterControlsByFrameworks(frameworkIds) {
      try {
        const result = this.api.filterControlsByFrameworksBase(
          frameworkIds,
          this.frameworkList,
          this.newItem.control_id
        );

        this.controlList = result.filteredControls;
        this.newItem.control_id = result.validControlIds;
        this.controlListKey++;

        console.log("Filtered controls:", this.controlList);

      } catch (error) {
        console.error('Error in filterControlsByFrameworks:', error);
        this.controlList = [];
        this.newItem.control_id = [];
        this.controlListKey++;
      }
    },

    // Document update
    async updateDocument() {
      try {
        const payload = {
          id: this.$route.params.id,
          name: this.newItem.name,
          expiry_days: this.newItem.expiry_days,
          status: this.newItem.status,
          content: this.newItem.content,
          notes: this.newItem.notes,
          clauses: this.newItem.clauses,
          step_code: this.newItem.step_code,
          file: this.newItem.file,
          category_id: this.newItem.category_id,
          owner_id: this.newItem.owner_id,
          reviewer_id: this.newItem.reviewer_id,
          privacy: this.newItem.privacy,
          framework_id: this.newItem.framework_id,
          control_id: this.newItem.control_id,
        };

        if (this.newItem.team_ids?.length > 0) {
          payload.team_ids = this.newItem.team_ids.map(team =>
            typeof team === "object" ? team.id : team
          );
        }

        if (this.newItem.stakeholder_ids?.length > 0) {
          payload.stakeholder_ids = this.newItem.stakeholder_ids.map(user =>
            typeof user === "object" ? user.id : user
          );
        }

        Object.keys(payload).forEach(key => {
          if (payload[key] === null || payload[key] === undefined) {
            delete payload[key];
          }
        });

        const response = await this.api.update(payload);

        if (response) {
          notify({
            title: this.$t("documentdetails.success"),
            text: "Document updated successfully",
            type: "success",
          });

          await this.fetchDocumentDetails(this.$route.params.id);
          this.openTabProperties(response.data);
        }
      } catch (error) {
        notify({
          title: this.$t("documentdetails.error"),
          text: "An error occurred while updating the document",
          type: "error",
        });
        console.error("Error updating document:", error);
      }
    },

    // Clause management
    addDocumentClause() {
      if (!this.newItem.clauses) {
        this.newItem.clauses = [""];
      }

      let selectedContent = "";
      try {
        if (window.getSelection) {
          const selection = window.getSelection();
          selectedContent = selection ? selection.toString() : "";
        }
      } catch (error) {
        console.error("Error getting selection:", error);
      }

      const emptyIndex = this.newItem.clauses.findIndex(clause => {
        if (clause === null || clause === undefined) return true;
        return typeof clause === 'string' && clause.trim() === "";
      });

      if (selectedContent && emptyIndex !== -1) {
        this.newItem.clauses[emptyIndex] = selectedContent;
        this.$nextTick(() => this.focusEditor(emptyIndex));
        return;
      }

      this.newItem.clauses.push(selectedContent || "");
      this.$nextTick(() => this.focusEditor(this.newItem.clauses.length - 1));
    },

    removeDocumentClause(index) {
      if (this.newItem.clauses?.length > 1) {
        this.newItem.clauses.splice(index, 1);
      }
    },

    focusEditor(index) {
      try {
        if (window.CKEDITOR5?.instances) {
          const instances = Object.values(window.CKEDITOR5.instances);
          if (instances[index]) {
            instances[index].focus();
          }
        }
      } catch (error) {
        console.log("Could not auto-focus the editor", error);
      }
    },

    // Version management
    openAddVersionModal() {
      this.isModalOpenOfVersionDocument = true;
      this.canAddVersion = true;
    },

    openEditVersionModal(version) {
      this.newVersion = {
        ...version,
        clauses: version.clauses || [""],
      };
      this.isModalOpenOfVersionDocument = true;
      this.isEditingVersion = true;
    },

    closeVersionModalOfDocument() {
      this.isModalOpenOfVersionDocument = false;
      this.resetNewVersion();
    },

    resetNewVersion() {
      this.newVersion = {
        versionNumber: "",
        notes: "",
        content: "",
        clauses: [""],
        filename: "",
        filepath: "",
        file: null,
        document_id: "",
        privacy: "",
        expiry_days: "",
      };
      this.isEditingVersion = false;
    },

    handleVersionFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newVersion.file = file;
        this.newVersion.filename = file.name;
      }
    },

    async submitVersionForm() {
      this.isSubmitting = true;
      try {
        if (!this.newVersion.privacy) {
          notify({
            title: this.$t("documentdetails.validation_error"),
            text: "Please select a privacy option",
            type: "error",
          });
          this.isSubmitting = false;
          return;
        }

        axios.defaults.baseURL = BASEPATH;

        const formData = new FormData();
        this.newVersion.document_id = this.$route.params.id;
        formData.append("newVersion", JSON.stringify(this.newVersion));

        if (this.newVersion.file) {
          formData.append("file", this.newVersion.file);
        }

        const response = await this.api.createNewDocumentVersion(formData);

        if (response.data.status === "success") {
          notify({
            title: this.$t("documentdetails.success"),
            text: "Version added successfully",
            type: "success",
          });

          await this.fetchDocumentDetails(this.newVersion.document_id);
          this.checkAddVersion();
          this.closeVersionModalOfDocument();
        } else {
          notify({
            title: this.$t("documentdetails.error"),
            text: response.data.message || "An error occurred",
            type: "error",
          });
        }
      } catch (error) {
        notify({
          title: this.$t("documentdetails.error"),
          text: "An error occurred while submitting the form",
          type: "error",
        });
        console.error("Error submitting form:", error);
      } finally {
        this.isSubmitting = false;
      }
    },

    addVersionClause() {
      if (!this.newVersion.clauses) {
        this.newVersion.clauses = [""];
      }

      let selectedContent = "";
      try {
        if (window.getSelection) {
          selectedContent = window.getSelection().toString();
        }
      } catch (error) {
        console.error("Error getting selection:", error);
      }

      if (selectedContent) {
        const emptyIndex = this.newVersion.clauses.findIndex(
          (clause) => clause.trim() === ""
        );

        if (emptyIndex !== -1) {
          this.newVersion.clauses[emptyIndex] = selectedContent;
          return;
        }
      }

      this.newVersion.clauses.push(selectedContent || "");
    },

    removeVersionClause(index) {
      if (this.newVersion.clauses.length > 1) {
        this.newVersion.clauses.splice(index, 1);
      }
    },

    async toggleVersionStatus(version, event) {
      try {
        axios.defaults.baseURL = BASEPATH;

        const action = event.target.checked ? "activate" : "deactivate";
        const versionLabel = `Version ${version.versionNumber}`;
        const currentActiveVersion = this.document.versionnotes.find(
          (v) => v.active === 1
        );

        const message =
          action === "activate"
            ? `This will replace ${currentActiveVersion
              ? `Version ${currentActiveVersion.versionNumber}`
              : "the current active version"
            }.`
            : `This version will no longer be publicly available.`;

        const { isConfirmed } = await Swal.fire({
          title: action === "activate"
            ? this.$t("documentdetails.set_as_active_version")
            : this.$t("documentdetails.deactivate_version"),
          text: `You are about to ${action} ${versionLabel}. ${message}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText:
            action === "activate" ? "Make Active" : "Confirm Deactivate",
          cancelButtonText: "Cancel",
        });

        if (!isConfirmed) {
          event.target.checked = !event.target.checked;
          return;
        }

        const newActive = event.target.checked ? 1 : 0;
        const payload = {
          versionNumber: version.versionNumber,
          document_id: this.$route.params.id,
          active: newActive,
        };

        const response = await this.api.activeVersionOrDeactivate(payload);

        if (response.data.status === "success") {
          await Swal.fire({
            title: this.$t("documentdetails.success"),
            text: `${versionLabel} ${action === "activate" ? "is now active" : "was deactivated"}`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          await this.fetchDocumentDetails(this.$route.params.id);
          this.checkAddVersion();
        }
      } catch (error) {
        event.target.checked = !event.target.checked;
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.errors?.[0] ||
          "Failed to update version status";

        await Swal.fire({
          title: this.$t("documentdetails.error"),
          text: errorMessage,
          icon: "error",
        });
      }
    },

    openVersionDetails(version) {
      this.selectedVersion = version;
      this.showVersionModal = true;
    },

    async refreshVersion() {
      await this.fetchDocumentDetails(this.$route.params.id);
    },

    // Transitions
    openTransitionModal(item) {
      this.transitionModal.currentItem = item;
      this.currentTransitions = this.getTransitions(item);
      this.transitionLoading = false;
      this.transitionModal.show = true;
    },

    async navigateTransition(transition) {
      if (this.transitionLoading || !this.transitionModal.currentItem) {
        return;
      }

      this.transitionLoading = true;
      const currentItem = this.transitionModal.currentItem;

      try {
        axios.defaults.baseURL = BASEPATH;

        const targetStep = this.workflowSteps.find(
          (step) => step.name === transition.to_step_name
        );

        if (!targetStep) {
          throw new Error("Target workflow step not found");
        }

        const payload = {
          id: currentItem.id,
          documentId: this.document.id,
          step_code: targetStep.code,
          status: targetStep.name,
          versionNumber: currentItem.versionNumber,
          action_by: this.user?.id,
          date_done: new Date().toISOString() // current date and time
        };

        const response = await this.api.updateTransationnVersionDocument(payload);

        if (response.data.status === "success") {
          const versionIndex = this.document.versionnotes.findIndex(
            (v) => v.versionNumber === currentItem.versionNumber
          );

          const updatedVersions = [...this.document.versionnotes];
          updatedVersions.splice(versionIndex, 1, {
            ...updatedVersions[versionIndex],
            step_code: targetStep.code,
            status: targetStep.name,
          });

          this.document.versionnotes = updatedVersions;
          this.document.activeVersionObject = updatedVersions[versionIndex];

          // Fixed validation with versionnotes check - using version-specific clauses
          if (targetStep.code === this.document.category?.step_publish &&
            (this.document.category.type === 'standard' || this.document.category.type === 'policy')) {

            // Get the current version's clauses
            const currentVersion = updatedVersions[versionIndex];
            const versionClauses = currentVersion?.clauses || currentItem?.clauses;

            if (
              versionClauses &&
              Array.isArray(versionClauses) &&
              versionClauses.length > 0
            ) {
              for (const clause of versionClauses) {
                const data = {
                  name: clause,
                  document_ids: [this.document.id] // Use the main document ID
                };
                try {
                  await this.CenterPolicyApi.insert(data);
                } catch (err) {
                  console.error("Error inserting clause into Policy Center:", err);
                }
              }
            } else {
              console.warn("No clauses found in version — skipping Policy Center insert");
            }
          }

          this.$nextTick(() => {
            this.fetchDocumentDetails(this.$route.params.id);
            this.checkAddVersion();
          });

          this.transitionModal.show = false;

          notify({
            title: this.$t("documentdetails.success"),
            text: "Transition completed successfully",
            type: "success",
          });
        }
      } catch (error) {
        console.error("Transition failed", error);
      } finally {
        this.transitionLoading = false;
      }
    },

    getTransitions(item) {
      const currentStep = Object.values(this.workflowSteps).find(
        (step) => step.code === item.step_code
      );

      if (!currentStep) return [];
      return this.filteredSteps(currentStep, this.document);
    },

    filteredSteps(step, item) {
      if (!step || !step.transitions || !this.user?.job_id) {
        return [];
      }

      return step.transitions.filter((transition) => {
        if (!transition.permissions || Object.keys(transition.permissions).length === 0) {
          return false;
        }

        const permissions = transition.permissions;

        if (permissions.jobs && Array.isArray(permissions.jobs)) {
          const hasJobPermission = permissions.jobs.some((jobId) => jobId === this.user.job_id);
          if (hasJobPermission) return true;
        }

        if (permissions.customRoles && Array.isArray(permissions.customRoles)) {
          const hasCustomRolePermission = permissions.customRoles.some((role) => {
            switch (role) {
              case "owner":
                return item?.owner_id && this.user.id === item.owner_id;
              case "creator":
                return item?.created_by && this.user.id === item.created_by;
              case "reviewer":
                return item?.reviewer_id && this.user.id === item.reviewer_id;
              case "stakeholders":
                return item?.stakeholder_ids && Array.isArray(item.stakeholder_ids) && item.stakeholder_ids.includes(this.user.id);
              case "teams":
                return item?.team_ids && Array.isArray(item.team_ids) && this.user?.team_ids && Array.isArray(this.user.team_ids) && item.team_ids.some((teamId) => this.user.team_ids.includes(teamId));
              default:
                return false;
            }
          });
          if (hasCustomRolePermission) return true;
        }

        return false;
      });
    },

    // Comments
    async publishComment(event) {
      if (!this.newComment.trim()) return;
      try {
        this.loading = true;
        const response = await this.commentApi.from({
          content: this.newComment,
          commentable_id: event.id,
          commentable_type: event.model,
          user_id: this.USER_ID,
          parent_id: null,
        });

        if (response) {
          this.newComment = "";
          await this.fetchComments(event.id);
        }
      } catch (error) {
        console.error("Error posting comment:", error);
      } finally {
        this.loading = false;
      }
    },

    async publishReply(event) {
      // Extract the reply text from the event object
      const { parentId, id, model, text } = event;

      if (!text || !text.trim()) return;

      try {
        this.loading = true;

        const response = await this.commentApi.from({
          content: text,
          commentable_id: id,
          commentable_type: model,
          user_id: this.USER_ID,
          parent_id: parentId,
        });

        if (response) {
          await this.fetchComments(id);
        }
      } catch (error) {
        console.error("Error posting reply:", error);
      } finally {
        this.loading = false;
      }
    },


    startReply(commentId) {
      this.replyingTo = commentId;
      this.replyText = "";
      this.expandedComments.add(commentId);
    },

    cancelReply() {
      this.replyingTo = null;
      this.replyText = "";
    },

    findUserNameById(userId) {
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },

    // Common permission functions
    getPermissionChecker() {
      return this.api.getUserPermissionChecker(this.document, this.workflowSteps);
    },

    canPerformAction(action) {
      const { canPerformAction } = this.getPermissionChecker();
      return canPerformAction(action);
    },

    isCurrentStep() {
      return this.workflowSteps?.length > 0 &&
        this.workflowSteps[0].code === this.document.step_code;
    },

    checkAddVersion() {
      // Early return if document or versionnotes is invalid
      if (
        !this.document ||
        !this.document.versionnotes ||
        !Array.isArray(this.document.versionnotes)
      ) {
        this.canAddVersion = false;
        return;
      }

      // Early return if no categories
      if (!this.categories || this.categories.length === 0) {
        this.canAddVersion = false;
        return;
      }

      // Check if all versions are published
      const allVersionsPublished = this.document.versionnotes.every((v) => {
        if (!v) return false;
        return v.step_code === this.categories[0].step_publish;
      });

      // Check permission for creating new version
      const canCreateNewDocumentVersion = this.canPerformAction("createNewDocumentVersion");

      // Check if versions exist
      const versionsExist = this.document.versionnotes.length > 0;

      // Set final permission
      this.canAddVersion = versionsExist && canCreateNewDocumentVersion && allVersionsPublished;
    },

    canViewVersion(document, version) {
      if (!this.user || !document || !version) return false;

      // Use userPosation to check user's relationship with the document
      const hasDocumentAccess = this.api.userPosation(document, this.workflowSteps || []);

      // see the public versions
      if (version.active === 1 && version.privacy === "public") {
        return true;
      }

      // see the private versions if user has document access
      if (hasDocumentAccess) {
        return true;
      }

      return false;
    },

    // Workflow fields
    applyWorkflowStepFields() {
      try {
        if (!Array.isArray(this.workflowSteps)) {
          this.fieldsFromTargetStep = [];
          return;
        }

        if (!this.document || !this.document.step_code) {
          this.fieldsFromTargetStep = [];
          return;
        }

        const currentStep = this.workflowSteps.find(
          (step) => step.code === this.document.step_code
        );

        if (!currentStep) {
          this.fieldsFromTargetStep = [];
          return;
        }

        const fieldConfigurations = currentStep.fields || [];
        const transitionFields = currentStep.transitions?.[0]?.fields || [];

        this.fieldsFromTargetStep = [
          ...fieldConfigurations,
          ...transitionFields,
        ];
      } catch (error) {
        console.error("Error applying workflow step fields:", error);
        this.fieldsFromTargetStep = [];
      }
    },

    // Helper methods
    getFilePath(filepath) {
      if (!filepath) return "#";
      const cleanedPath = filepath.replace(/^\/+/, "").replace(/^api\/+/, "");
      const baseUrl = BASEPATH.replace(/\/+$/, "").replace(/\/api$/, "");
      const finalPath = cleanedPath.includes("storage/")
        ? cleanedPath
        : `storage/${cleanedPath}`;
      return `${baseUrl}/${finalPath}`;
    },

    getOwnerName(owner) {
      const ownerName = this.userList.find((user) => user.id == owner);
      if (ownerName) {
        return ownerName.full_name || ownerName.name || "N/A";
      }
      return "N/A";
    },

    getUserName(userId) {
      if (!userId) return "System";
      const user = this.userList.find((u) => u.id === userId);
      return user ? user.full_name : `User #${userId}`;
    },

    getTeamName(teamId) {
      if (!teamId) return "No Team";
      const team = this.teamList.find((t) => t.id === teamId);
      return team ? team.name : `Team #${teamId}`;
    },

    getStepName(stepCode) {
      const step = this.workflowSteps.find((s) => s.code === stepCode);
      return step ? step.name : `Step ${stepCode}`;
    },

    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getDocumentChanges(log) {
      const changes = [];
      const oldData = log.old_data || {};
      const newData = log.data || {};

      const allFields = new Set([
        ...Object.keys(oldData),
        ...Object.keys(newData),
      ]);

      const excludedFields = [
        "created_at",
        "updated_at",
        "deleted_at",
        "created_by",
        "category_id",
        "file_url",
        "notes",
        "content",
        "clauses",
        "id",
        "versionnotes",
      ];

      allFields.forEach((field) => {
        if (excludedFields.includes(field)) return;
        if (JSON.stringify(oldData[field]) === JSON.stringify(newData[field]))
          return;

        let fromValue = oldData[field] ?? "N/A";
        let toValue = newData[field] ?? "N/A";

        switch (field) {
          case "owner_id":
          case "reviewer_id":
            fromValue = this.getOwnerName(fromValue);
            toValue = this.getOwnerName(toValue);
            break;
          case "step_code":
            fromValue = this.getStepName(fromValue) || fromValue;
            toValue = this.getStepName(toValue) || toValue;
            break;
          case "privacy":
            fromValue = fromValue === true || fromValue === 'private' ? 'Private' : 'Public';
            toValue = toValue === true || toValue === 'private' ? 'Private' : 'Public';
            break;
        }

        changes.push({
          field: this.formatColumnName(field),
          from: fromValue,
          to: toValue,
        });
      });

      return changes.length ? changes : null;
    },

    formatColumnName(fieldName) {
      const nameMap = {
        owner_id: "Owner",
        reviewer_id: "Reviewer",
        team_ids: "Teams",
        stakeholder_ids: "Stakeholders",
        step_code: "Workflow Step",
        next_review_date: "Next Review Date",
        filepath: "File",
        file_url: "File URL",
      };

      return (
        nameMap[fieldName] ||
        fieldName
          .replace(/_/g, " ")
          .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase())
      );
    },
  },
};
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
  background: rgba(255, 255, 255, 0.9);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 70px;
  height: 70px;
  border: 5px solid rgba(0, 123, 255, 0.2);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

.loading-dots {
  display: inline-flex;
  margin-top: 1rem;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  margin: 0 4px;
  background-color: #007bff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>