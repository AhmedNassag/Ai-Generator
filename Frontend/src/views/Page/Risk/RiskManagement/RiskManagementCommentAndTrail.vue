<template>
  <div class="comments-section-wrapper">
    <!-- Post Comment Box -->
    <div class="post-comment-box">
      <div class="post-comment-header">
        <v-icon size="20" color="#111827">mdi-message-text-outline</v-icon>
        <span class="post-comment-title">Post Comment</span>
      </div>

      <div class="post-comment-body">
        <v-textarea
          v-model="newComment"
          placeholder="Write your comment here..."
          variant="outlined"
          rows="4"
          hide-details
          class="comment-textarea"
          :disabled="loading"
        ></v-textarea>

        <div class="post-comment-footer">
          <span class="character-count">{{ newComment.length }}/1000</span>
          <v-btn
            variant="flat"
            class="post-comment-btn"
            @click="publishComment"
            :disabled="!newComment.trim() || loading"
            :loading="loading"
          >
            <v-icon size="16" class="me-1">mdi-send</v-icon>
            Post
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Comments List -->
    <div class="comments-list-container">
      <div v-if="!loadingComments && topLevelComments.length > 0" class="comments-list-header">
        <div class="comments-count">
          <v-icon size="20" color="#111827">mdi-message-outline</v-icon>
          <span class="comments-count-text">{{ topLevelComments.length }} Comments</span>
        </div>

        <v-select
          v-model="sortOrder"
          :items="sortOptions"
          variant="outlined"
          density="compact"
          hide-details
          class="comments-sort-select"
        >
          <template v-slot:selection="{ item }">
            <span class="sort-selection-text">{{ item.title }}</span>
          </template>
        </v-select>
      </div>

      <!-- Loading State -->
      <div v-if="loadingComments" class="comments-loading">
        <v-progress-circular indeterminate color="#6E3894" size="40"></v-progress-circular>
        <p class="loading-text">Loading comments...</p>
      </div>

      <!-- Comments -->
      <div v-else-if="topLevelComments.length > 0" class="comments-list">
        <div
          v-for="comment in paginatedComments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-avatar">
            {{ getInitials(getUserFullName(comment.user_id)) }}
          </div>

          <div class="comment-content">
            <div class="comment-header-row">
              <div class="comment-user-info">
                <span class="comment-username">{{ getUserFullName(comment.user_id) }}</span>
                <span class="comment-badge" v-if="comment.user?.role">{{ comment.user.role }}</span>
              </div>
              <span class="comment-timestamp">{{ formatTime(comment.created_at) }}</span>
            </div>

            <p class="comment-text" v-html="formatComment(comment.content)"></p>

            <!-- Reply Box -->
            <div v-if="replyingToCommentId === comment.id" class="reply-box">
              <v-textarea
                v-model="replyText"
                placeholder="Write your reply here..."
                variant="outlined"
                rows="3"
                hide-details
                class="comment-textarea"
                :disabled="loading"
              ></v-textarea>

              <div class="reply-box-footer">
                <span class="character-count">{{ replyText.length }}/1000</span>
                <div class="reply-box-actions">
                  <v-btn
                    variant="text"
                    class="cancel-reply-btn"
                    @click="cancelReply"
                    :disabled="loading"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    variant="flat"
                    class="post-comment-btn"
                    @click="publishReply"
                    :disabled="!replyText.trim() || loading"
                    :loading="loading"
                  >
                    <v-icon size="16" class="me-1">mdi-send</v-icon>
                    Reply
                  </v-btn>
                </div>
              </div>
            </div>

            <div class="comment-actions">
              <button 
                class="comment-action-btn" 
                @click="replyToComment(comment.id)"
              >
                <v-icon size="16">mdi-reply-outline</v-icon>
                Reply
              </button>

              <button 
                v-if="hasReplies(comment.id)"
                class="comment-action-btn toggle-replies-btn" 
                @click="toggleReplies(comment.id)"
              >
                <v-icon size="16">{{ showRepliesFor[comment.id] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                {{ showRepliesFor[comment.id] ? 'Hide' : 'Show' }} Replies ({{ getRepliesCount(comment.id) }})
              </button>
            </div>

            <!-- Show Replies -->
            <div v-if="showRepliesFor[comment.id]" class="replies-container">
              <div
                v-for="reply in getReplies(comment.id)"
                :key="reply.id"
                class="comment-item comment-reply"
              >
                <div class="comment-avatar">
                  {{ getInitials(getUserFullName(reply.user_id)) }}
                </div>

                <div class="comment-content">
                  <div class="comment-header-row">
                    <div class="comment-user-info">
                      <span class="comment-username">{{ getUserFullName(reply.user_id) }}</span>
                      <span class="comment-badge" v-if="reply.user?.role">{{ reply.user.role }}</span>
                    </div>
                    <span class="comment-timestamp">{{ formatTime(reply.created_at) }}</span>
                  </div>

                  <p class="comment-text" v-html="formatComment(reply.content)"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!loadingComments && topLevelComments.length > 0 && totalPages > 1" class="pagination-container">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          class="comments-pagination"
          @update:modelValue="scrollToComments"
        ></v-pagination>
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, topLevelComments.length) }} of {{ topLevelComments.length }} comments
        </div>
      </div>

      <!-- No Comments State -->
      <div v-if="!loadingComments && topLevelComments.length === 0" class="no-comments-state">
        <v-icon size="48" color="#D1D5DB">mdi-message-outline</v-icon>
        <p class="no-comments-text">No comments yet</p>
        <p class="no-comments-subtext">Be the first to share your thoughts!</p>
      </div>
    </div>
  </div>
</template>

<script>
import { notify } from '@kyvg/vue3-notification';
import Comment from '@/API/comment/comment';
import Auth from '@/API/Auth';

export default {
  name: 'CommentsSection',
  props: {
    rowData: {
      type: Object,
      required: true
    },
    commentableId: {
      type: [Number, String],
      required: true
    },
    commentableType: {
      type: String,
      required: true,
      default: 'App\\Models\\Risk\\Risk'
    },
    dropdownOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      commentApi: new Comment(),
      USER_ID: Auth.USER.id,
      newComment: '',
      replyText: '',
      replyingToCommentId: null,
      comments: [],
      loading: false,
      loadingComments: false,
      sortOrder: 'newest',
      sortOptions: [
        { title: 'Newest First', value: 'newest' },
        { title: 'Oldest First', value: 'oldest' }
      ],
      showRepliesFor: {},
      currentPage: 1,
      itemsPerPage: 5
    };
  },
  computed: {
    userOptions() {
      return this.dropdownOptions.userOptions || [];
    },
    
    // Get only top-level comments (not replies)
    topLevelComments() {
      return this.comments.filter(comment => !comment.parent_id);
    },
    
    sortedComments() {
      const topLevel = [...this.topLevelComments];
      return topLevel.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return this.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
    },
    
    paginatedComments() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedComments.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.sortedComments.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchComments();
  },
  methods: {
    async fetchComments() {
      try {
        this.loadingComments = true;
        const response = await this.commentApi.getAll({
          filter: `commentable_id|${this.rowData.id}|=`,
        });
        if (response) {
          this.comments = response;
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        notify({
          title: 'Error',
          text: 'Failed to load comments',
          type: 'error'
        });
      } finally {
        this.loadingComments = false;
      }
    },

    async publishComment() {
      if (!this.newComment.trim()) return;

      if (this.newComment.length > 1000) {
        notify({
          title: 'Warning',
          text: 'Comment exceeds maximum length of 1000 characters',
          type: 'warn'
        });
        return;
      }

      try {
        this.loading = true;
        await this.commentApi.publishComment({
          content: this.newComment,
          commentable_id: this.rowData.id,
          commentable_type: this.commentableType,
          user_id: this.USER_ID
        });

        this.newComment = '';
        await this.fetchComments();
        notify({
          title: 'Success',
          text: 'Comment posted successfully',
          type: 'success'
        });
      } catch (error) {
        console.error('Error posting comment:', error);
        notify({
          title: 'Error',
          text: 'Failed to post comment',
          type: 'error'
        });
      } finally {
        this.loading = false;
      }
    },

    replyToComment(commentId) {
      this.replyingToCommentId = commentId;
      this.replyText = '';
    },

    cancelReply() {
      this.replyingToCommentId = null;
      this.replyText = '';
    },

    async publishReply() {
      if (!this.replyText.trim()) return;

      if (this.replyText.length > 1000) {
        notify({
          title: 'Warning',
          text: 'Reply exceeds maximum length of 1000 characters',
          type: 'warn'
        });
        return;
      }

      try {
        this.loading = true;
        await this.commentApi.publishComment({
          content: this.replyText,
          commentable_id: this.rowData.id,
          commentable_type: this.commentableType,
          user_id: this.USER_ID,
          parent_id: this.replyingToCommentId
        });

        this.replyText = '';
        this.replyingToCommentId = null;
        await this.fetchComments();
        notify({
          title: 'Success',
          text: 'Reply posted successfully',
          type: 'success'
        });
      } catch (error) {
        console.error('Error posting reply:', error);
        notify({
          title: 'Error',
          text: 'Failed to post reply',
          type: 'error'
        });
      } finally {
        this.loading = false;
      }
    },

    getUserFullName(userId) {
      if (!userId || !this.userOptions.length) return 'Unknown User';
      const user = this.userOptions.find(u => u.id === userId);
      return user ? user.full_name : 'Unknown User';
    },
    
    getInitials(name) {
      if (!name) return 'NA';
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    formatComment(content) {
      if (!content) return '';
      // Replace mentions and convert newlines to <br>
      return content
        .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
        .replace(/\n/g, '<br>');
    },
    
    getReplies(commentId) {
      return this.comments
        .filter(comment => comment.parent_id === commentId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    },
    
    getRepliesCount(commentId) {
      return this.getReplies(commentId).length;
    },
    
    hasReplies(commentId) {
      return this.getRepliesCount(commentId) > 0;
    },
    
    toggleReplies(commentId) {
      this.showRepliesFor = {
        ...this.showRepliesFor,
        [commentId]: !this.showRepliesFor[commentId]
      };
    },
    
    scrollToComments() {
      const commentsContainer = this.$el.querySelector('.comments-list-container');
      if (commentsContainer) {
        commentsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
};
</script>

<style scoped>
/* Comments Section Wrapper */
.comments-section-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  max-width: 100%;
}

/* Post Comment Box */
.post-comment-box {
  background-color: #F3F4F6;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
}

.post-comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
}

.post-comment-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.post-comment-body {
  padding: 16px;
}

.comment-textarea :deep(.v-field) {
  background-color: #FFFFFF !important;
  border-radius: 6px;
  font-size: 14px;
}

.comment-textarea :deep(.v-field__input) {
  color: #111827;
  font-weight: 400;
  padding: 10px 14px;
  min-height: 100px !important;
}

.comment-textarea :deep(.v-field__outline__start),
.comment-textarea :deep(.v-field__outline__end) {
  border-color: #D1D5DB !important;
}

.post-comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.character-count {
  font-size: 12px;
  color: #9CA3AF;
}

.post-comment-btn {
  background-color: #6E3894 !important;
  color: #FFFFFF !important;
  text-transform: none !important;
  font-weight: 500;
  font-size: 13px;
  padding: 0 20px !important;
  height: 36px !important;
  border-radius: 6px !important;
  letter-spacing: 0;
  box-shadow: none !important;
}

.post-comment-btn:disabled {
  opacity: 0.5 !important;
  background-color: #6E3894 !important;
}

/* Reply Box */
.reply-box {
  margin-top: 12px;
  padding: 12px;
  background-color: #F9FAFB;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
}

.reply-box-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.reply-box-actions {
  display: flex;
  gap: 8px;
}

.cancel-reply-btn {
  color: #6B7280 !important;
  text-transform: none !important;
  font-weight: 500;
  font-size: 13px;
  padding: 0 16px !important;
  height: 36px !important;
  border-radius: 6px !important;
  letter-spacing: 0;
}

/* Comments List Container */
.comments-list-container {
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  padding: 16px;
}

.comments-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.comments-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comments-count-text {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.comments-sort-select {
  max-width: 180px;
}

.comments-sort-select :deep(.v-field) {
  min-height: 36px !important;
  background-color: #FFFFFF;
  font-size: 13px;
}

.comments-sort-select :deep(.v-field__outline__start),
.comments-sort-select :deep(.v-field__outline__end) {
  border-width: 1px !important;
  border-color: #D1D5DB !important;
}

.sort-selection-text {
  font-size: 13px;
  color: #4B5563;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background-color: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  transition: all 0.15s ease;
}

.comment-reply {
  background-color: #FFFFFF;
  border-color: #E5E7EB;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 8px;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.comment-username {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.comment-badge {
  padding: 2px 8px;
  background-color: #D1FAE5;
  color: #065F46;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.comment-timestamp {
  font-size: 12px;
  color: #9CA3AF;
  white-space: nowrap;
}

.comment-text {
  font-size: 14px;
  color: #4B5563;
  line-height: 1.5;
  margin: 0 0 10px 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.comment-text :deep(.mention) {
  color: #6E3894;
  font-weight: 600;
}

.comment-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.comment-action-btn {
  background: none;
  border: none;
  color: #6B7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.comment-action-btn:hover {
  background-color: #F3F4F6;
  color: #6E3894;
}

.comment-action-btn.toggle-replies-btn {
  color: #6E3894;
  font-weight: 500;
}

/* Replies Container */
.replies-container {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid #E5E7EB;
}

/* Loading State */
.comments-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  gap: 12px;
}

.loading-text {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

/* No Comments State */
.no-comments-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}

.no-comments-text {
  font-size: 15px;
  font-weight: 600;
  color: #4B5563;
  margin: 12px 0 4px 0;
}

.no-comments-subtext {
  font-size: 13px;
  color: #9CA3AF;
  margin: 0;
}

/* Pagination */
.pagination-container {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.comments-pagination :deep(.v-pagination__item) {
  min-width: 36px;
  height: 36px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.comments-pagination :deep(.v-pagination__item--is-active) {
  background-color: #6E3894 !important;
  color: #FFFFFF !important;
}

.comments-pagination :deep(.v-pagination__item:not(.v-pagination__item--is-active)) {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #4B5563;
}

.comments-pagination :deep(.v-pagination__prev),
.comments-pagination :deep(.v-pagination__next) {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #4B5563;
  min-width: 36px;
  height: 36px;
  border-radius: 6px;
}

.pagination-info {
  font-size: 13px;
  color: #6B7280;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .comments-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .comments-sort-select {
    width: 100%;
    max-width: none;
  }

  .replies-container {
    padding-left: 12px;
  }

  .comment-actions {
    gap: 8px;
  }

  .comment-action-btn {
    font-size: 12px;
    padding: 3px 6px;
  }
}

/* Ensure proper text wrapping for long comments */
@media (max-width: 480px) {
  .replies-container {
    padding-left: 8px;
  }
  
  .comment-username {
    font-size: 13px;
  }
  
  .comment-text {
    font-size: 13px;
  }
}
</style>