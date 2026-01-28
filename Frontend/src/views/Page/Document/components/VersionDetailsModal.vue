<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="version-modal-overlay"> <!-- No click handler here -->
      <div class="version-modal-container" role="dialog" aria-modal="true" aria-labelledby="version-modal-title">
        <!-- Modal Header -->
        <div class="version-modal-header">
          <div class="version-header-content">
            <h2 id="version-modal-title">
              <i class="fas fa-file-alt version-me-2"></i>
              Document Version: V.{{ version?.versionNumber }}
            </h2>
            <div class="version-meta">
              <span class="version-meta-item">
                <i class="fas fa-calendar-alt version-me-1"></i>
                {{ formatDate(version.created_at) }}
              </span>
              <!-- Uploader -->
              <span class="version-meta-item">
                <i class="fas fa-upload version-me-1 text-primary"></i>
                {{ parentMethods.getOwnerName(version.uploaded_by) || 'Unknown Author' }} <small>{{
                  $t("versiondetailsmodal.uploader") }}</small>
              </span>
              <span v-if="version.filename" class="version-meta-item">
                <i class="fas fa-paperclip version-me-1"></i>
                {{ version.filename }}
              </span>
            </div>
          </div>
          <button class="version-modal-close" @click="closeModal" aria-label="Close modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <!-- Tab Navigation -->
        <ul class="nav nav-tabs version-nav-tabs" id="versionTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active version-nav-link" id="content-tab" data-bs-toggle="tab"
              data-bs-target="#content" type="button" role="tab" aria-controls="content" aria-selected="true">
              <i class="fas fa-file-alt version-me-2"></i>{{ $t("versiondetailsmodal.content") }}
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link version-nav-link" id="statusVersion-tab" data-bs-toggle="tab"
              data-bs-target="#statusVersion" type="button" role="tab" aria-controls="statusVersion"
              aria-selected="false" @click="fetchDocumentVersionLogs(version.id.toString())">
              <i class="fas fa-tasks version-me-2"></i>{{ $t("versiondetailsmodal.status") }}
            </button>
          </li>
        </ul>

        <!-- Modal Body -->
        <div class="version-modal-body">
          <div v-if="version" class="tab-content version-tab-content" id="versionTabContent">
            <!-- Content Tab -->
            <div class="tab-pane fade show active version-tab-pane" id="content" role="tabpanel"
              aria-labelledby="content-tab">
              <section class="version-content-section">
                <h3 class="version-section-title">
                  <i class="fas fa-align-left version-me-2"></i>
                  {{ $t("versiondetailsmodal.document_content") }}
                </h3>
                <div class="version-content-box" v-html="version?.content || 'No content available'"></div>
              </section>

              <section v-if="version?.clauses?.length" class="version-content-section">
                <h3 class="version-section-title">
                  <i class="fas fa-list-ol version-me-2"></i>
                  {{ $t("versiondetailsmodal.document_clauses") }}
                  <span class="badge bg-primary version-ms-2">{{ version.clauses.length }}</span>
                </h3>
                <div class="version-clauses-container">
                  <div v-for="(clause, index) in version.clauses" :key="index" class="version-clause-item">
                    <h4 class="version-clause-title">Clause {{ index + 1 }}</h4>
                    <div class="version-clause-content" v-html="clause"></div>
                  </div>
                </div>
              </section>

              <section v-if="version?.notes" class="version-content-section">
                <h3 class="version-section-title">
                  <i class="fas fa-sticky-note version-me-2"></i>
                  {{ $t("versiondetailsmodal.version_notes") }}
                </h3>
                <div class="version-notes-box" v-html="version.notes"></div>
              </section>
            </div>

            <!-- Status Tab -->
            <div class="tab-pane fade version-tab-pane" id="statusVersion" role="tabpanel"
              aria-labelledby="statusVersion-tab">
              <div class="row version-row">
                <div class="col-md-8 version-col-md-8">
                  <h3 class="version-mb-4">{{ $t("versiondetailsmodal.document_status") }}</h3>

                  <!-- Status Tabs Navigation -->
                  <ul class="nav nav-tabs version-status-nav-tabs" id="statusTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button class="nav-link active version-status-nav-link" id="log-tab" data-bs-toggle="tab"
                        data-bs-target="#logVersion" type="button" role="tab" aria-controls="log" aria-selected="true">
                        <i class="fas fa-history version-me-2"></i>{{ $t("versiondetailsmodal.log") }}
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button class="nav-link version-status-nav-link" id="comments-tab" data-bs-toggle="tab"
                        data-bs-target="#commentsVersion" type="button" role="tab" aria-controls="comments"
                        aria-selected="false">
                        <i class="fas fa-comment version-me-2"></i>{{ $t("versiondetailsmodal.comments") }}
                      </button>
                    </li>
                  </ul>

                  <!-- Status Tabs Content -->
                  <div class="tab-content version-status-tab-content">
                    <!-- Log Tab -->
                    <div class="tab-pane fade show active version-status-tab-pane" id="logVersion" role="tabpanel"
                      aria-labelledby="log-tab">
                      <div class="version-status-container">
                        <div v-if="logsLoading" class="text-center py-4">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">{{ $t("versiondetailsmodal.loading") }}</span>
                          </div>
                        </div>
                        <div v-else>
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <label>{{ $t("versiondetailsmodal.show") }}
                                <select v-model="logsPerPage" class="form-select d-inline-block w-auto mx-1"
                                  style="width: auto; display: inline-block;">
                                  <option :value="3">3</option>
                                </select>
                                {{ $t("versiondetailsmodal.entries") }}
                              </label>
                            </div>
                          </div>
                          <table class="table table-bordered table-hover table-sm bg-white shadow-sm">
                            <thead>
                              <tr>
                                <th>{{ $t("versiondetailsmodal.user") }}</th>
                                <th>{{ $t("versiondetailsmodal.date") }}</th>
                                <th>{{ $t("versiondetailsmodal.action") }}</th>
                                <th>{{ $t("versiondetailsmodal.changes") }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(log, index) in paginatedLogs" :key="index">
                                <td class="text-nowrap">{{ getUserNameById(log.user_id) }}</td>
                                <td class="text-nowrap">{{ formatDate(log.created_at) }}</td>
                                <td>
                                  <span class="badge" :class="getActionBadgeClass(log.action)">
                                    {{ formatAction(log.action) }}
                                  </span>
                                </td>
                                <td>
                                  <div v-for="(change, cIndex) in getDocumentVersionChanges(log)" :key="cIndex"
                                    class="change-item small">
                                    <span class="badge bg-light text-dark me-1">{{ change.field }}</span>
                                    <span v-if="change.from" class="text-danger text-decoration-line-through me-1">
                                      {{ change.from }}
                                    </span>
                                    <span v-if="change.from && change.to" class="mx-1">→</span>
                                    <span v-if="change.to" class="text-success">
                                      {{ change.to }}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <p v-if="!filteredLogs.length" class="text-muted small">{{
                            $t("versiondetailsmodal.no_logs_found") }}</p>
                          <nav v-if="totalPages > 1">
                            <ul class="pagination pagination-sm justify-content-end">
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">{{
                                  $t("versiondetailsmodal.first") }}</button>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">{{
                                  $t("versiondetailsmodal.previous") }}</button>
                              </li>
                              <li class="page-item disabled">
                                <span class="page-link">Page {{ currentPage }} of {{ totalPages }}</span>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="currentPage++"
                                  :disabled="currentPage === totalPages">{{ $t("versiondetailsmodal.next") }}</button>
                              </li>
                              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="currentPage = totalPages"
                                  :disabled="currentPage === totalPages">{{ $t("versiondetailsmodal.last") }}</button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>

                    <!-- Comments Tab -->
                    <div class="tab-pane fade version-status-tab-pane" id="commentsVersion" role="tabpanel"
                      aria-labelledby="comments-tab">
                      <div class="row g-3 version-comments-row">
                        <div class="col-12 version-comments-col-12">
                          <div class="version-comments-list">
                            <div v-if="!comments.length" class="text-muted version-my-3 version-text-center">
                              <i class="fas fa-comment-slash version-me-2"></i>{{
                                $t("versiondetailsmodal.no_comments_yet") }}
                            </div>

                            <!-- Main comments loop -->
                            <div v-for="(comment, index) in mainComments" :key="index"
                              class="card version-comment-card mb-3 shadow-sm">
                              <div class="card-body version-comment-card-body pb-3">
                                <!-- Comment Header -->
                                <div class="d-flex justify-content-between">
                                  <div class="d-flex align-items-center">
                                    <img :src="comment.avatar" alt="User avatar"
                                      class="version-comment-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center version-me-2">
                                    <div>
                                      <h6 class="mb-0 fw-semibold">{{ comment.user }}</h6>
                                      <small class="text-muted">{{ formatCommentDate(comment.date) }}</small>
                                    </div>
                                  </div>
                                </div>

                                <!-- Comment Text -->
                                <div class="mt-2 version-ps-5">
                                  <p class="mb-1">{{ comment.text }}</p>

                                  <!-- Reply button -->
                                  <div class="d-flex align-items-center">
                                    <button v-if="canAddComment" @click="startReply(comment.id)" class="btn btn-sm text-primary version-ps-0"
                                      style="font-size: 0.85rem">
                                      <i class="fas fa-reply version-me-1"></i>{{ $t("versiondetailsmodal.reply") }}
                                    </button>

                                    <!-- Replies Toggle -->
                                    <div v-if="hasReplies(comment.id)" class="version-ms-3">
                                      <button @click="toggleReplies(comment.id)"
                                        class="btn btn-sm btn-link text-decoration-none version-ps-0"
                                        style="font-size: 0.85rem">
                                        <i :class="isExpanded(comment.id)
                                          ? 'fas fa-chevron-down'
                                          : 'fas fa-chevron-right'
                                          "></i>
                                        {{ getRepliesCount(comment.id) }}
                                        {{
                                          getRepliesCount(comment.id) === 1
                                            ? "reply"
                                            : "replies"
                                        }}
                                      </button>
                                    </div>
                                  </div>

                                  <!-- Reply input box -->
                                  <div v-if="replyingTo === comment.id" class="mt-3">
                                    <div class="mb-2">
                                      <textarea v-model="replyText" class="form-control" rows="2"
                                        placeholder="Type your reply..."></textarea>
                                    </div>
                                    <div class="d-flex justify-content-end gap-2">
                                      <button @click="publishReply(comment.id)" class="btn btn-primary btn-sm"
                                        :disabled="!replyText.trim()">
                                        {{ $t("versiondetailsmodal.reply") }}
                                      </button>
                                      <button @click="cancelReply" class="btn btn-outline-secondary btn-sm">
                                        {{ $t("versiondetailsmodal.cancel") }}
                                      </button>
                                    </div>
                                  </div>

                                  <div v-if="isExpanded(comment.id) && hasReplies(comment.id)"
                                    class="mt-3 version-reply-thread">
                                    <div v-for="(reply, replyIndex) in getReplies(comment.id)" :key="replyIndex"
                                      class="mb-3 version-reply">
                                      <div class="d-flex align-items-start">
                                        <img :src="comment.avatar" alt="User avatar"
                                          class="version-comment-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center version-me-2">
                                        <div class="flex-grow-1">
                                          <div class="d-flex justify-content-between">
                                            <h6 class="mb-0 fw-semibold">{{ reply.user }}</h6>
                                            <small class="text-muted">{{ formatCommentDate(reply.date) }}</small>
                                          </div>
                                          <p class="mb-1">{{ reply.text }}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="version-add-comment mt-4" v-if="canAddComment">
                            <div class="card shadow-sm">
                              <div class="card-body">
                                <h6 class="card-title text-muted">
                                  <i class="fas fa-plus-circle version-me-2"></i>{{
                                    $t("versiondetailsmodal.add_a_comment") }}
                                </h6>
                                <div class="version-comment-input mb-4">
                                  <div class="d-flex">
                                    <textarea class="form-control version-me-2" v-model="newComment"
                                      placeholder="Add a comment..." rows="2"></textarea>
                                    <button class="btn btn-primary" style="margin:auto" @click="publishComment()"
                                      :disabled="!newComment.trim()">
                                      <i class="fas fa-paper-plane"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4 version-col-md-4">
                  <div class="card version-controls-card border-0" style="box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
                    <div class="card-header bg-white border-0 py-3">
                      <div class="d-flex align-items-center">
                        <div
                          class="version-icon bg-light-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                          style="width: 36px; height: 36px;">
                          <i class="fas fa-layer-group text-primary" style="font-size: 14px;"></i>
                        </div>
                        <h5 class="mb-0 fw-semibold text-dark">{{ $t("versiondetailsmodal.version_controls") }}</h5>
                      </div>
                    </div>
                    <div class="card-body p-4 pt-0">
                      <!-- Wrap all form elements in a fieldset -->
                      <fieldset disabled>
                        <!-- Expirtiondate Days -->
                        <div class="mb-3">
                          <label class="form-label">{{ $t("versiondetailsmodal.expiration_date") }}</label>
                          <div class="d-flex align-items-center">
                            <input type="text" class="form-control" v-model="version.expiration_date">
                          </div>
                        </div>
                        <!-- Expiry Days -->
                        <div class="mb-3">
                          <label class="form-label">{{ $t("versiondetailsmodal.expiry_days") }}</label>
                          <div class="d-flex align-items-center">
                            <input type="number" class="form-control" v-model="version.expiry_days">
                          </div>
                        </div>
                        <!-- Privacy Selection -->
                        <div class="mb-4">
                          <label class="form-label text-uppercase small fw-bold text-muted mb-3">{{
                            $t("versiondetailsmodal.document_visibility") }}</label>
                          <div class="privacy-options bg-light rounded p-3">
                            <div class="d-flex align-items-center justify-content-between mb-3">
                              <div class="form-check form-switch m-0 d-flex align-items-center">
                                <input class="form-check-input me-2" type="radio" role="switch"
                                  v-model="version.privacy" value="public" id="privacyPublic">
                                <label class="form-check-label" for="privacyPublic">
                                  <span class="fw-medium" style="color:black">{{ $t("versiondetailsmodal.public_access")
                                  }}</span>
                                  <small class="text-muted d-block">{{ $t("versiondetailsmodal.all_users_can_view")
                                  }}</small>
                                </label>
                              </div>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                              <div class="form-check form-switch m-0 d-flex align-items-center">
                                <input class="form-check-input me-2" type="radio" role="switch"
                                  v-model="version.privacy" value="private" id="privacyPrivate">
                                <label class="form-check-label" for="privacyPrivate">
                                  <span class="fw-medium" style="color:black">{{
                                    $t("versiondetailsmodal.private_access") }}</span>
                                  <small class="text-muted d-block">{{ $t("versiondetailsmodal.restricted_visibility")
                                  }}</small>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="version-loading-state">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <!-- Modal Footer -->
        <div class="version-modal-footer">
          <div class="version-footer-actions">
            <button class="btn btn-outline-secondary" @click="closeModal">
              <i class="fas fa-times version-me-2"></i>Close
            </button>
            <a v-if="version.filepath" :href="parentMethods.getFilePath(version.filepath)"
              class="btn btn-sm btn-outline-primary me-1" target="_blank" title="Download">
              <i class="fas fa-download"></i>
            </a>
          </div>
          <div class="version-document-info">
            <span v-if="version?.created_at">
              Last updated: {{ formatDate(version.created_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Multiselect as VMultiselect } from 'vue-multiselect';
import axios from 'axios'; // Make sure to import axios
import Comment from "@/API/comment/comment"; // Import the Comment API
import Log from "@/API/Log/Log";
import Auth from "@/API/Auth"; // Import Auth if needed
import { notify } from "@kyvg/vue3-notification";
import { VSelect } from 'vuetify/components/VSelect'
import { filter } from 'jszip';

interface VersionType {
  id: number;
  versionNumber: string;
  created_at: string;
  uploaded_by: number;
  version_owner_id: number;
  content?: string;
  clauses?: string[];
  notes?: string;
  filename?: string;
  filepath?: string;
  expiry_days?: string;
  expiration_date?: string;
  status?: string;
  privacy?: string;
  stakeholder_ids?: number[];
  team_ids?: number[];
  step_code?: string;
  active?: number;
}
interface LogType {
  id: string;
  action: string;
  data: any;
  old_data: any;
  created_at: string;
  user_id: string;
  type?: string;
  logMessage?: string;
}

interface VersionChanges {
  field: string;
  from: string;
  to: string;
  timestamp: string;
}

interface DocumentType {
  id: number;
  owner_id: number;

}

interface ParentMethods {
  getFilePath: (path: string) => string;
  getOwnerName: (id: number) => string;
  fetchComments: (commentableId: number) => Promise<void>;
  refreshVersion: (documentId: number) => Promise<void>;
}


interface Stakeholder {
  id: string;
  full_name: string;
  fullImagePath?: string;
}
interface WorkflowStep {
  id: number;
  name: string;
  code: string;
  description?: string;
  completed_at?: string;
  status?: string;
}

interface CommentType {
  id: number;
  user: string;
  avatar: string;
  text: string;
  date: string;
  parent_id?: number;
}

interface User {
  id: number;
  full_name: string;
}

interface Team {
  id: number;
  name: string;
}
interface VersionNote {
  id: string;
  filename: string | null;
  filepath: string | null;
  notes: string;
  created_at: string;
  uploaded_by: string;
  content: string;
  clauses: string[];
  versionNumber: number;
  status: string;
  version_owner_id: string;
  step_code?: string;
  active: number;
  privacy?: string;
  stakeholder_ids?: string[];
  team_ids?: string[];
  expiry_days?: string;
  expiration_date?: string;
}

interface FilteredLog {
  logId: string;
  dataNotes: VersionNote[];
  oldDataNotes: VersionNote[];
}
export default defineComponent({
  name: 'VersionDetailsModal',
  components: {
    'v-select': VSelect,
  },
  setup() {
    const commentApi = new Comment();
    const USER_ID = Auth.USER.id;
    const logApi = new Log();

    return {
      commentApi,
      USER_ID,
      logApi
    };
  },
  props: {
    version: {
      type: Object as PropType<VersionType>,
      required: true
    },
    documentId: {
      type: Number,
      required: true
    },
    document: {
      type: Object as PropType<DocumentType>,
      required: true
    },
    isOpen: {
      type: Boolean,
      required: true
    },
    canAddComment: {
      type: Boolean,
      required: true
    },
    workflowSteps: {
      type: Array as PropType<WorkflowStep[]>,
      default: () => []
    },
    comments: {
      type: Array as PropType<CommentType[]>,
      default: () => []
    },
    userList: {
      type: Array as PropType<User[]>,
      required: true
    },
    teamList: {
      type: Array as PropType<Team[]>,
      required: true
    },
    userId: {
      type: Number,
      required: true
    },
    parentMethods: {
      type: Object as PropType<ParentMethods>,
      required: true
    },
  },
  emits: ['close', 'update-comments', 'version-updated'],
  data() {
    return {
      activeTab: 'content',
      newComment: '',
      replyText: '',
      replyingTo: null as number | null,
      expandedComments: new Set<number>(),
      isSubmitting: false,
      transitionLoading: false,
      commentLoading: false,
      logs: [] as LogType[],
      stepLogs: {} as Record<string, LogType[]>,
      activeStatusTab: 'log',
      logsLoading: false,
      visibleLogs: {} as Record<string, number>,
      logsPerPage: 3,
      currentPage: 1,
    };
  },
  computed: {
    mainComments(): CommentType[] {
      return this.comments.filter(comment => !comment.parent_id);
    },
    isVersionOwner(): boolean {
      return this.document.owner_id === this.userId;
    },
    filteredLogs(): LogType[] {
      // Only show logs that have changes, no search
      return this.logs.filter(log => this.getDocumentVersionChanges(log));
    },
    totalPages(): number {
      return Math.ceil(this.filteredLogs.length / this.logsPerPage) || 1;
    },
    paginatedLogs(): LogType[] {
      const start = (this.currentPage - 1) * this.logsPerPage;
      return this.filteredLogs.slice(start, start + this.logsPerPage);
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    formatDate(dateString: string): string {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    formatCommentDate(dateString: string): string {
      if (!dateString) return '';
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    },
    isStepActive(index: number): boolean {
      return this.workflowSteps[index]?.code === this.version.step_code;
    },
    isStepCompleted(index: number): boolean {
      return index < this.workflowSteps.findIndex(step => step.code === this.version.step_code);
    },
    getStepIcon(index: number): string {
      if (this.isStepCompleted(index)) return 'fas fa-check-circle text-success';
      if (this.isStepActive(index)) return 'fas fa-arrow-right text-primary';
      return 'fas fa-circle text-muted';
    },
    // Format step completion date
    getStepCompletionDate(index: number): string {
      const stepCode = this.workflowSteps[index].code;
      const stepLogs = this.getStepLogs(stepCode);

      if (stepLogs.length > 0) {
        // Find the last log where this step was active
        const completionLog = stepLogs.reverse().find(log =>
          log.data?.step_code === stepCode || log.old_data?.step_code === stepCode
        );

        if (completionLog) {
          return this.formatDate(completionLog.created_at);
        }
      }

      return 'N/A';
    },
    startReply(commentId: number) {
      this.replyingTo = commentId;
      this.expandedComments.add(commentId);
    },
    cancelReply() {
      this.replyingTo = null;
      this.replyText = '';
    },
    async fetchComments(versionId: number) {
      try {
        await this.parentMethods.fetchComments(versionId);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    },

    getUserNameById(userId: number): string {
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },

    async publishComment() {
      if (!this.newComment.trim()) return;

      try {
        this.commentLoading = true;
        const response = await this.commentApi.from({
          content: this.newComment,
          commentable_id: this.version.id,
          commentable_type: 'App\\Models\\Document\\Version',
          user_id: this.USER_ID,
          parent_id: null
        });

        if (response) {
          this.newComment = '';
          await this.fetchComments(this.version.id);
        }
      } catch (error) {
        console.error('Error posting comment:', error);
      } finally {
        this.commentLoading = false;
      }
    },

    async publishReply(parentId: number) {
      if (!this.replyText.trim()) return;

      try {
        this.commentLoading = true;
        const response = await this.commentApi.from({
          content: this.replyText,
          commentable_id: this.version.id,
          commentable_type: 'App\\Models\\Document\\Version',
          user_id: this.USER_ID,
          parent_id: parentId
        });

        if (response) {
          this.replyText = '';
          this.replyingTo = null;
          await this.fetchComments(this.version.id);
        }
      } catch (error) {
        console.error('Error posting reply:', error);
      } finally {
        this.commentLoading = false;
      }
    },
    hasReplies(commentId: number): boolean {
      return this.comments.some(comment => comment.parent_id === commentId);
    },
    getReplies(commentId: number): CommentType[] {
      return this.comments.filter(comment => comment.parent_id === commentId);
    },
    getRepliesCount(commentId: number): number {
      return this.getReplies(commentId).length;
    },
    toggleReplies(commentId: number) {
      if (this.expandedComments.has(commentId)) {
        this.expandedComments.delete(commentId);
      } else {
        this.expandedComments.add(commentId);
      }
    },
    isExpanded(commentId: number): boolean {
      return this.expandedComments.has(commentId);
    },
    async extendValidity() {
      // Default extension is 30 days
      const newDate = new Date(this.version.expiry_days || new Date());
      newDate.setDate(newDate.getDate() + 30);
      this.version.expiry_days = newDate.toISOString().split('T')[0];
    },
    async fetchDocumentVersionLogs(versionId: string): Promise<void> {
      try {
        this.logsLoading = true;

        let response = await this.logApi.getAll({
          filter: `class|Document|=&&data.id|${this.document.id}|=`,
          select: 'user_id|data.versionnotes|old_data.versionnotes|action|created_at|data.step_code|old_data.step_code',
        });

        // Filter out unwanted actions
        response = response.filter((log: LogType) =>
          !['create', 'update', 'show'].includes(log.action)
        );

        // Filter logs to include only relevant version changes and modify versionnotes
        this.logs = response.map((log: LogType) => {
          // Create a deep copy of the log to avoid modifying the original
          const filteredLog = JSON.parse(JSON.stringify(log));

          // Filter versionnotes in data
          if (filteredLog.data?.versionnotes) {
            filteredLog.data.versionnotes = filteredLog.data.versionnotes.filter(
              (note: any) => note.id === versionId
            );
          }

          // Filter versionnotes in old_data
          if (filteredLog.old_data?.versionnotes) {
            filteredLog.old_data.versionnotes = filteredLog.old_data.versionnotes.filter(
              (note: any) => note.id === versionId
            );
          }

          return filteredLog;
        }).filter((log: LogType) => {
          // Only keep logs that have matching versionnotes in either data or old_data
          const hasDataNotes = log.data?.versionnotes?.length > 0;
          const hasOldDataNotes = log.old_data?.versionnotes?.length > 0;
          return hasDataNotes || hasOldDataNotes;
        });

        // Sort logs by date
        this.logs.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        console.log("Fetched logs:", this.logs);
        this.groupLogsByStep();

      } catch (error) {
        console.error('Error fetching version logs:', error);
      } finally {
        this.logsLoading = false;
      }
    },
    groupLogsByStep() {
      // Initialize empty arrays for each step
      this.stepLogs = {};
      this.workflowSteps.forEach(step => {
        this.stepLogs[step.code] = [];
      });

      // Group logs by step code
      this.logs.forEach(log => {
        const stepCode = log.data?.step_code;
        if (stepCode && this.stepLogs[stepCode]) {
          this.stepLogs[stepCode].push({
            ...log,
            // logMessage: this.getLogMessage(log), // Renamed from 'message' to 'logMessage'
            type: log.action || 'info'
          });
        }
      });
    },
    getLogMessage(log: LogType): string {
      // Customize this based on your log structure
      if (log.action === 'status_change') {
        return `Changed status from ${log.data.from} to ${log.data.to}`;
      }
      if (log.action === 'transition') {
        return `Transitioned to ${log.data.to_step}`;
      }
      return log.action || 'Activity recorded';
    },
    getStepLogs(stepCode: string): LogType[] {
      return this.logs.filter(log => {
        // Check if the log has data.versionnotes
        if (log.data?.versionnotes) {
          if (Array.isArray(log.data.versionnotes)) {
            const found = (log.data.versionnotes as VersionNote[]).some((note: VersionNote) => {
              return note.step_code === stepCode;
            });
            if (found) return true;
          } else {
            if ((log.data.versionnotes as VersionNote).step_code === stepCode) {
              return true;
            }
          }
        } else {
          console.log('log.data.versionnotes does not exist');
        }

        // Check old_data.versionnotes
        if (log.old_data?.versionnotes) {

          if (Array.isArray(log.old_data.versionnotes)) {
            const found = (log.old_data.versionnotes as VersionNote[]).some((note: VersionNote) => {
              return note.step_code === stepCode;
            });
            if (found) return true;
          } else {
            if ((log.old_data.versionnotes as VersionNote).step_code === stepCode) {
              return true;
            }
          }
        } else {
          console.log('log.old_data.versionnotes does not exist');
        }
        return false;
      });
    },


    // Toggle visibility of logs for a step
    toggleLogs(stepCode: string) {
      if (!this.visibleLogs[stepCode] || this.visibleLogs[stepCode] === 2) {
        this.visibleLogs[stepCode] = this.getStepLogs(stepCode).length;
      } else {
        this.visibleLogs[stepCode] = 2;
      }
    },
    getStepName(stepCode: string): string {
      const step = this.workflowSteps.find(s => s.code === stepCode);
      return step ? step.name : `Step ${stepCode}`;
    },
    // Add this method to your methods section
    getVersionChanges(log: LogType): VersionChanges[] {
      const changes: VersionChanges[] = [];
      const oldVersion: VersionNote = log.old_data?.versionnotes?.[0] || {};
      const newVersion: VersionNote = log.data?.versionnotes?.[0] || {};
      const trackedColumns: Array<keyof VersionNote> = ['status', 'active', 'privacy', 'expiry_days'];
      trackedColumns.forEach((column) => {
        const oldValue = oldVersion[column];
        const newValue = newVersion[column];
        if (oldValue === undefined && newValue === undefined) return;
        if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;
        changes.push({
          field: this.formatColumnName(column),
          from: this.formatVersionChangeValue(column, oldValue),
          to: this.formatVersionChangeValue(column, newValue),
          timestamp: log.created_at
        });
      });
      return changes;
    },

    getDocumentVersionChanges(log: LogType): VersionChanges[] | null {
      const changes = this.getVersionChanges(log);
      return changes.length > 0 ? changes : null;
    },

    getActionBadgeClass(action: string): string {
      const map: Record<string, string> = {
        create: 'bg-success',
        update: 'bg-primary',
        status_change: 'bg-info',
        delete: 'bg-danger',
        default: 'bg-secondary'
      };
      return map[action] || map.default;
    },

    formatAction(action: string): string {
      const map: Record<string, string> = {
        create: 'Created',
        update: 'Updated',
        status_change: 'Status Changed',
        delete: 'Deleted',
        default: action
      };
      return map[action] || action.replace(/_/g, ' ').toLowerCase();
    },
    formatColumnName(fieldName: keyof VersionNote): string {
      const nameMap: Partial<Record<keyof VersionNote, string>> = {
        status: 'Status',
        active: 'Active',
        privacy: 'Privacy',
        expiry_days: 'Expiry Days',
      };
      return nameMap[fieldName] || String(fieldName);
    },

    // Helper method to format version change values
    formatVersionChangeValue(column: string, value: any): string {
      if (value === null || value === undefined) return 'N/A';

      switch (column) {
        case 'filename':
          return value || 'No filename';
        case 'filepath':
          return value ? this.formatFileLink(value) : 'No file';
        case 'notes':
          return value ? this.formatTextContent(value) : 'No notes';
        case 'created_at':
        case 'updated_at':
          return this.formatDateTime(value);
        case 'uploaded_by':
          return value ? this.getOwnerName(value) : 'System';
        case 'content':
          return value ? this.formatTextContent(value) : 'No content';
        case 'clauses':
          return this.formatClauses(value);
        case 'versionNumber':
          return `v${value}`;
        case 'active':
          return value === 1 ? 'Active' : 'Inactive';
        case 'status':
          return value || 'N/A';
        case 'step_code':
          return this.getStepName(value) || 'N/A';
        case 'version_owner_id':
          return this.getOwnerName(value) || 'N/A';
        default:
          return String(value);
      }
    },


    getOwnerName(id: number): string {
      const ownerName = this.userList.find(user => user.id === id);

      if (ownerName) {
        console.log("Found owner:", ownerName);
        return ownerName.full_name || 'N/A';
      }

      console.log("Owner not found");
      return 'N/A';
    },


    formatClauses(clauses: string[] | null): string {
      if (!clauses) return 'No clauses';
      if (!Array.isArray(clauses)) return 'Invalid clauses format';

      if (clauses.length === 0) return 'No clauses';
      if (clauses.length === 1) return '1 clause';
      return `${clauses.length} clauses`;
    },

    formatTextContent(content: string | null): string {
      if (!content) return 'Empty';
      const stripped = content.replace(/<[^>]*>/g, '');
      return stripped.length > 50 ? stripped.substring(0, 50) + '...' : stripped;
    },

    formatFileLink(filepath: string | null): string {
      if (!filepath) return 'No file';
      const filename = filepath.split('/').pop();
      return filename || 'File';
    },
    formatDateTime(dateString: string): string {
      if (!dateString) return 'N/A';

      const date = new Date(dateString);

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      });
    }
  },
  watch: {
    logsPerPage() {
      this.currentPage = 1;
    },
    // searchLog watcher removed
    'version.privacy'(newVal, oldVal) {
      if (newVal === 'public' && oldVal === 'private') {
        this.version.stakeholder_ids = [];
        this.version.team_ids = [];
      }
    },
    isOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', this.handleKeydown);
        this.fetchComments(this.version.id);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleKeydown);
      }
    },
    version: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal && this.isOpen) {
          this.fetchComments(this.version.id);
          this.parentMethods.refreshVersion(this.documentId);
        }
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }
});
</script>

<style scoped>
/* Full-screen modal styling */
.version-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1050;
  overflow-y: auto;
  padding: 2rem;
}

.version-modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header Styles */
.version-modal-header {
  background: #f8f9fa;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-header-content {
  flex: 1;
}

.version-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #212529;
}

.version-meta {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.version-meta-item {
  display: flex;
  align-items: center;
}

.version-modal-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  margin-left: 1rem;
}

.version-modal-close:hover {
  color: #212529;
}

/* Body Styles */
.version-modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.version-content-section {
  margin-bottom: 2.5rem;
}

.version-section-title {
  font-size: 1.25rem;
  color: #0d6efd;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.version-content-box,
.version-notes-box,
.version-changes-box {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1.5rem;
  line-height: 1.6;
}

.version-content-box {
  min-height: 200px;
}

.version-clauses-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.version-clause-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1.25rem;
}

.version-clause-title {
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 0.75rem;
}

.version-clause-content {
  line-height: 1.6;
}

/* Status Timeline */
.version-status-container {
  padding: 20px;
}

.version-status-timeline {
  position: relative;
  padding-left: 30px;
}

.version-status-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.version-status-step {
  position: relative;
  padding-bottom: 20px;
}

.version-step-indicator {
  position: absolute;
  left: -30px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0e0e0;
  z-index: 1;
}

.version-status-step.completed .step-indicator {
  border-color: #28a745;
  color: #28a745;
}

.version-status-step.active .step-indicator {
  border-color: #007bff;
  color: #007bff;
  animation: pulse 2s infinite;
}

.version-step-content {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-left: 10px;
}

.version-status-step.completed .step-content {
  background-color: #e8f5e9;
}

.version-status-step.active .step-content {
  background-color: #e3f2fd;
}


/* Comments */
.version-comment-avatar {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.version-reply-thread {
  border-left: 2px solid #e9ecef;
  padding-left: 1rem;
}

.version-reply {
  position: relative;
}

.version-reply::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 16px;
  width: 0.75rem;
  height: 2px;
  background-color: #e9ecef;
}

/* Footer Styles */
.version-modal-footer {
  background: #f8f9fa;
  padding: 1.25rem 2rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-footer-actions {
  display: flex;
  gap: 1rem;
}

.version-document-info {
  font-size: 0.85rem;
  color: #6c757d;
}

/* Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Utility Classes */
.version-me-1 {
  margin-right: 0.25rem;
}

.version-me-2 {
  margin-right: 0.5rem;
}

.version-ms-2 {
  margin-left: 0.5rem;
}

.version-mb-3 {
  margin-bottom: 1rem;
}

.version-mb-4 {
  margin-bottom: 1.5rem;
}

.version-my-3 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.version-ps-0 {
  padding-left: 0;
}

.version-ps-5 {
  padding-left: 3rem;
}

.version-text-center {
  text-align: center;
}

/* version control */
.version-controls-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.version-controls-card:hover {
  transform: translateY(-2px);
}

.version-icon {
  transition: all 0.3s;
}

.custom-multiselect {
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.custom-multiselect:hover {
  border-color: #dee2e6;
}

.btn-outline-primary {
  border-width: 2px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s;
}

.btn-outline-primary:hover {
  background-color: rgba(13, 110, 253, 0.05);
  border-color: #0d6efd;
  color: #0d6efd;
}

.team-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
}

.form-switch .form-check-input {
  width: 2.5em;
  margin-left: 0;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23838c96'/%3e%3c/svg%3e");
}

.form-switch .form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}

.privacy-options {
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.form-check {
  padding-left: 0;
}

.form-check-input {
  margin-top: 0;
  margin-right: 0.5rem;
}

.view-logs-btn {
  padding: 0;
  margin-top: 5px;
  font-size: 0.8rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .version-modal-overlay {
    padding: 1rem;
  }

  .version-modal-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .version-modal-body {
    padding: 1rem;
  }

  .version-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .version-status-timeline {
    padding-left: 1.5rem;
  }

  .version-status-timeline::before {
    left: 1rem;
  }

  .version-step-indicator {
    left: -2rem;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.8rem;
  }

  .version-modal-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .version-footer-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>