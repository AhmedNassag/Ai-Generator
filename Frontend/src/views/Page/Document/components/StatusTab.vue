<template>
  <div class="row">
    <div class="col-md-12">
      <h3 class="mb-4">Document Status</h3>

      <!-- Tabs Navigation -->
      <ul class="nav nav-tabs mb-4" id="statusTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ 'active': activeStatusTab === 'log' }"
            @click="$emit('update-status-tab', 'log')" type="button">
            <i class="fas fa-history me-2"></i>Log
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ 'active': activeStatusTab === 'comments' }" @click="handleCommentsClick"
            type="button">
            <i class="fas fa-comment me-2"></i>Comments
          </button>
        </li>
      </ul>

      <!-- Tabs Content -->
      <div class="tab-content">
        <!-- Log Tab -->
        <div class="tab-pane fade" :class="{ 'show active': activeStatusTab === 'log' }">
          <LogSection :logs="logs" :loading="logsLoading" :userList="userList" :teamList="teamList"
            :workflowSteps="workflowSteps" :currentPage="currentPage" :logsPerPage="logsPerPage"
            :totalPages="totalPages" @update-current-page="$emit('update-current-page', $event)" />
        </div>

        <!-- Comments Tab -->
        <div class="tab-pane fade" :class="{ 'show active': activeStatusTab === 'comments' }">
          <CommentsSection :document="document" :comments="comments" :new-comment="newComment"
            :can-add-comment="canAddComment" :loading="loading"
            @update-new-comment="$emit('update-new-comment', $event)"
            @publish-comment="$emit('publish-comment', $event)" @publish-reply="$emit('publish-reply', $event)"
            @start-reply="$emit('start-reply', $event)" @cancel-reply="$emit('cancel-reply', $event)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LogSection from "./LogSection.vue";
import CommentsSection from "./CommentsSection.vue";

export default {
  name: "StatusTab",
  components: {
    LogSection,
    CommentsSection,
  },
  props: {
    document: {
      type: Object,
      required: true,
    },
    canAddComment: {
      type: Boolean,
      default: false,
    },
    activeStatusTab: {
      type: String,
      default: "log",
    },
    logs: {
      type: Array,
      default: () => [],
    },
    comments: {
      type: Array,
      default: () => [],
    },
    logsLoading: {
      type: Boolean,
      default: false,
    },
    userList: {
      type: Array,
      default: () => [],
    },
    teamList: {
      type: Array,
      default: () => [],
    },
    workflowSteps: {
      type: Array,
      default: () => [],
    },
    newComment: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    logsPerPage: {
      type: Number,
      default: 3,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
  },
  emits: [
    "update-status-tab",
    "update-new-comment",
    "update-current-page",
    "fetch-comments",
    "publish-comment",
    "publish-reply",
    "start-reply",
    "cancel-reply",
  ],
  methods: {
    handleCommentsClick() {
      this.$emit('update-status-tab', 'comments');
      this.$emit('fetch-comments', this.document.id, 'App\\Models\\Document\\Document');
    },
  },
};
</script>