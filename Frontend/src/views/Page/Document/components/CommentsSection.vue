<template>
  <div class="row g-3">
    <div class="col-12">
      <div class="comments-list">
        <div v-if="!comments.length" class="text-muted my-3 text-center">
          <i class="fas fa-comment-slash me-2"></i>No comments yet.
        </div>

        <!-- Main comments loop -->
        <div v-for="(comment, index) in mainComments" :key="index" class="card mb-3 shadow-sm">
          <div class="card-body pb-3">
            <!-- Comment Header -->
            <div class="d-flex justify-content-between">
              <div class="d-flex align-items-center">
                <img :src="comment.avatar" alt="User avatar"
                  class="comment-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" />
                <div>
                  <h6 class="mb-0 fw-semibold">{{ comment.user }}</h6>
                  <small class="text-muted">{{ formatCommentDate(comment.date) }}</small>
                </div>
              </div>
            </div>

            <!-- Comment Text -->
            <div class="mt-2 ps-5">
              <p class="mb-1">{{ comment.text }}</p>

              <!-- Reply button -->
              <div class="d-flex align-items-center">
                <button @click="startReply(comment.id)" class="btn btn-sm text-primary ps-0"
                  style="font-size: 0.85rem">
                  <i class="fas fa-reply me-1"></i>Reply
                </button>

                <!-- Replies Toggle -->
                <div v-if="hasReplies(comment.id)" class="ms-3">
                  <button @click="toggleReplies(comment.id)" class="btn btn-sm btn-link text-decoration-none ps-0"
                    style="font-size: 0.85rem">
                    <i :class="isExpanded(comment.id) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                    {{ getRepliesCount(comment.id) }} {{ getRepliesCount(comment.id) === 1 ? "reply" : "replies" }}
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
                  <button @click="handlePublishReply(comment.id)" class="btn btn-secondary btn-sm"
                    :disabled="!replyText.trim()">
                    Reply
                  </button>
                  <button @click="cancelReply" class="btn btn-outline-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              </div>

              <!-- Replies -->
              <div v-if="isExpanded(comment.id) && hasReplies(comment.id)" class="mt-3 reply-thread">
                <div v-for="(reply, replyIndex) in getReplies(comment.id)" :key="replyIndex" class="mb-3 reply">
                  <div class="d-flex align-items-start">
                    <img :src="reply.avatar" alt="User avatar"
                      class="comment-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" />
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

      <!-- Add Comment -->
      <div class="add-comment mt-4" v-if="canAddComment">
        <div class="card shadow-sm">
          <div class="card-body">
            <h6 class="card-title text-muted">
              <i class="fas fa-plus-circle me-2"></i>Add a Comment
            </h6>
            <div class="comment-input mb-4">
              <div class="d-flex">
                <textarea class="form-control me-2" :value="newComment"
                  @input="$emit('update-new-comment', $event.target.value)" placeholder="Add a comment..."
                  rows="2"></textarea>
                <button class="btn btn-primary" style="margin: auto" @click="handlePublishComment"
                  :disabled="!newComment.trim() || loading">
                  <i class="fas fa-paper-plane"></i>
                  <span v-if="loading"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CommentsSection",
  props: {
    document: {
      type: Object,
      required: true,
    },
    comments: {
      type: Array,
      default: () => [],
    },
    newComment: {
      type: String,
      default: "",
    },
    canAddComment: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "update-new-comment",
    "publish-comment",
    "publish-reply",
    "start-reply",
    "cancel-reply",
  ],
  data() {
    return {
      expandedComments: new Set(),
      replyingTo: null,
      replyText: "",
    };
  },
  computed: {
    mainComments() {
      return this.comments.filter((comment) => !comment.parent_id);
    },
  },
  methods: {
    handlePublishComment() {
      this.$emit('publish-comment', {
        id: this.document.id,
        model: 'App\\Models\\Document\\Document'
      });
    },
    
    handlePublishReply(parentId) {
      if (!this.replyText.trim()) return;
      
      this.$emit('publish-reply', {
        parentId,
        id: this.document.id,
        model: 'App\\Models\\Document\\Document',
        text: this.replyText
      });
      
      // Reset state after emitting
      this.replyText = "";
      this.replyingTo = null;
    },
    
    startReply(commentId) {
      // Update local state to show reply input
      this.replyingTo = commentId;
      this.replyText = "";
      
      // Also expand the replies section if there are replies
      if (this.hasReplies(commentId)) {
        this.expandedComments.add(commentId);
      }
      
      // Emit the event for parent component awareness
      this.$emit('start-reply', commentId);
    },
    
    cancelReply() {
      // Reset local state
      this.replyingTo = null;
      this.replyText = "";
      
      // Emit the event for parent component awareness
      this.$emit('cancel-reply');
    },
    
    hasReplies(commentId) {
      return this.comments.some((comment) => comment.parent_id === commentId);
    },
    
    getReplies(commentId) {
      return this.comments.filter((comment) => comment.parent_id === commentId);
    },
    
    getRepliesCount(commentId) {
      return this.comments.filter((comment) => comment.parent_id === commentId).length;
    },
    
    toggleReplies(commentId) {
      if (this.expandedComments.has(commentId)) {
        this.expandedComments.delete(commentId);
      } else {
        this.expandedComments.add(commentId);
      }
    },
    
    isExpanded(commentId) {
      return this.expandedComments.has(commentId);
    },
    
    formatCommentDate(date) {
      return new Date(date).toLocaleString();
    },
  },
};
</script>

<style scoped>
.comment-avatar {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.reply-thread {
  border-left: 2px solid #e0e0e0;
  padding-left: 1rem;
}

.reply {
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.25rem;
}
</style>