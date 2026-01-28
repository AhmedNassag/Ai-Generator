<template>
  <!-- Modal Container -->
  <div class="modal-overlay" v-if="isVisible" @click.self="closeModal">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <h3>
          <i class="fas fa-comments"></i>
          {{ $t('comments.title', { count: getTotalCommentsCount() }) }}
        </h3>
        <button class="modal-close" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Main Comment Form -->
        <div v-if="!replyingTo" class="comment-form">
          <div class="form-header">
            <h4><i class="fas fa-comment-dots"></i> {{ $t('comments.post_comment') }}</h4>
            <div v-if="isPrivateEnabled" class="private-comment-toggle">
              <label class="switch">
                <input type="checkbox" v-model="isPrivate" />
                <span class="slider round"></span>
              </label>
              <span class="toggle-label">
                {{ isPrivate ? $t('comments.private') : $t('comments.public') }}
              </span>
            </div>
          </div>

          <div class="textarea-container">
            <textarea v-model="commentText" :placeholder="$t('comments.write_placeholder')" class="comment-input"
              rows="4" @keydown="handleKeyDown" ref="commentInput"></textarea>

            <div class="comment-help">
              <span>{{ $t('comments.shortcut_hint') }}</span>
            </div>
          </div>

          <div class="form-footer">
            <div class="character-count" :class="{ 'text-danger': commentText.length > 1000 }">
              {{ commentText.length }}/1000
            </div>
            <div class="action-buttons">
              <button @click="publishComment" class="btn-submit"
                :disabled="isPublishing || !commentText.trim() || commentText.length > 1000">
                <i class="fas" :class="isPublishing ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                {{ isPublishing ? $t('comments.posting') : $t('comments.post') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <div class="comment-list-container">
          <div class="filter-sort">
            <select v-model="sortOrder" class="sort-select" @change="sortComments">
              <option value="newest">{{ $t('comments.sort_newest') }}</option>
              <option value="oldest">{{ $t('comments.sort_oldest') }}</option>
            </select>
          </div>

          <div class="comment-list">
            <transition-group name="comment-fade">
              <div v-for="comment in displayedComments" :key="comment.id" class="comment-item">
                <!-- Main Comment -->
                <div class="comment-container" :id="`comment-${comment.id}`">
                  <div class="comment-avatar">
                    <img :src="comment?.user?.avatar || getUserAvatar(getUserFullName(comment.user_id))"
                      :alt="`${getUserFullName(comment.user_id)}'s avatar`" class="avatar-img"
                      @error="handleImageError" />
                  </div>

                  <div class="comment-content">
                    <div class="comment-header">
                      <div class="user-info">
                        <span class="user-name">{{ getUserFullName(comment.user_id) }}</span>
                        <span v-if="isAuthor(comment)" class="author-badge">{{ $t('comments.author') }}</span>
                        <span v-if="comment.is_private == true" class="private-badge">{{ $t('comments.private')
                        }}</span>
                      </div>
                      <span class="comment-date" :title="formatFullDate(comment.created_at)">
                        {{ getRelativeTime(comment.created_at) }}
                      </span>
                    </div>

                    <div class="comment-body">
                      <p v-html="formatCommentText(comment.content)"></p>
                    </div>

                    <div class="comment-actions">
                      <button @click="handleReply(comment)" class="action-btn action-reply">
                        <i class="fas fa-reply"></i> {{ $t('comments.reply') }}
                      </button>

                      <button v-if="comment.replies && comment.replies.length" @click="toggleReplies(comment)"
                        class="action-btn action-toggle">
                        <i :class="comment.showReplies ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                        {{
                          comment.showReplies
                            ? $t('comments.hide_replies')
                            : $t('comments.show_replies', { count: comment.replies.length })
                        }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Inline Reply Form -->
                <div v-if="replyingTo === comment.id" class="inline-reply-form">
                  <div class="reply-avatar">
                    <img :src="currentUser?.avatar || getUserAvatar(currentUser.full_name || 'User')"
                      :alt="'Your avatar'" class="avatar-img" />
                  </div>

                  <div class="reply-form-content">
                    <div class="replying-to-inline">
                      {{ $t('comments.replying_to') }}
                      <span class="reply-name">@{{ getUserFullName(comment.user_id) }}</span>
                    </div>

                    <div class="textarea-container">
                      <textarea v-model="commentText" :placeholder="$t('comments.reply_placeholder')"
                        class="comment-input reply-input" rows="3" ref="inlineReplyInput"
                        @keydown="handleKeyDown"></textarea>
                    </div>

                    <div class="reply-form-footer">
                      <div class="character-count" :class="{ 'text-danger': commentText.length > 1000 }">
                        {{ commentText.length }}/1000
                      </div>
                      <div class="action-buttons">
                        <button @click="cancelInlineReply" class="btn-cancel">
                          {{ $t('comments.cancel') }}
                        </button>
                        <button v-permission:insert @click="publishComment" class="btn-submit"
                          :disabled="isPublishing || !commentText.trim() || commentText.length > 1000">
                          <i class="fas" :class="isPublishing ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                          {{ isPublishing ? $t('comments.posting') : $t('comments.reply') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Replies -->
                <transition name="replies-fade">
                  <div v-if="comment.showReplies && comment.replies && comment.replies.length"
                    class="replies-container">
                    <div v-for="reply in comment.replies" :key="reply.id" class="reply-item"
                      :id="`comment-${reply.id}`">
                      <div class="reply-avatar">
                        <img :src="reply?.user?.avatar || getUserAvatar(getUserFullName(reply.user_id))"
                          :alt="`${getUserFullName(reply.user_id)}'s avatar`" class="avatar-img"
                          @error="handleImageError" />
                      </div>

                      <div class="reply-content">
                        <div class="comment-header">
                          <div class="user-info">
                            <span class="user-name">{{ getUserFullName(reply.user_id) }}</span>
                            <span v-if="isAuthor(reply)" class="author-badge">{{ $t('comments.author') }}</span>
                            <span v-if="reply.is_private == true" class="private-badge">{{ $t('comments.private')
                            }}</span>
                          </div>
                          <span class="comment-date" :title="formatFullDate(reply.created_at)">
                            {{ getRelativeTime(reply.created_at) }}
                          </span>
                        </div>

                        <div class="comment-body">
                          <p v-html="formatCommentText(reply.content)"></p>
                        </div>

                        <div class="comment-actions">
                          <button @click="handleReply(reply, comment.id)" class="action-btn action-reply">
                            <i class="fas fa-reply"></i> {{ $t('comments.reply') }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Inline Reply Form for Reply -->
                    <div v-if="replyingToReply && replyParentId === comment.id"
                      class="inline-reply-form reply-to-reply">
                      <div class="reply-avatar">
                        <img :src="currentUser?.avatar || getUserAvatar(currentUser.name || 'User')"
                          :alt="'Your avatar'" class="avatar-img" />
                      </div>

                      <div class="reply-form-content">
                        <div class="replying-to-inline">
                          {{ $t('comments.replying_to') }}
                          <span class="reply-name">@{{ getReplyingToName(replyingTo, comment.replies) }}</span>
                        </div>

                        <div class="textarea-container">
                          <textarea v-model="commentText" :placeholder="$t('comments.reply_placeholder')"
                            class="comment-input reply-input" rows="3" ref="inlineReplyToReplyInput"
                            @keydown="handleKeyDown"></textarea>
                        </div>

                        <div class="reply-form-footer">
                          <div class="character-count" :class="{ 'text-danger': commentText.length > 1000 }">
                            {{ commentText.length }}/1000
                          </div>
                          <div class="action-buttons">
                            <button @click="cancelInlineReply" class="btn-cancel">
                              {{ $t('comments.cancel') }}
                            </button>
                            <button v-permission:insert @click="publishComment" class="btn-submit"
                              :disabled="isPublishing || !commentText.trim() || commentText.length > 1000">
                              <i class="fas" :class="isPublishing ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                              {{ isPublishing ? $t('comments.posting') : $t('comments.reply') }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </transition-group>

            <!-- Empty State -->
            <div v-if="!displayedComments.length && !isLoading" class="no-comments">
              <div class="empty-icon">
                <i class="far fa-comment-dots"></i>
              </div>
              <h5>{{ $t('comments.no_comments') }}</h5>
              <p>{{ $t('comments.be_first') }}</p>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="loading-comments">
              <div class="spinner"></div>
              <span>{{ $t('comments.loading') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import Auth from "@/API/Auth";
import Comment from "@/API/comment/comment";
import { filter } from "jszip";
import User from "@/API/User/User";

export default {
  name: "Comment",
  setup() {
    const commentApi = new Comment();
    const userApi = new User();
    return {
      commentApi,
      userApi,
    };
  },

  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    commentableType: {
      type: String,
      required: true,
    },
    commentableId: {
      type: [String, Number],
      required: true,
    },
    isPrivateEnabled: {
      type: Boolean,
      default: false,
    },
    users: {
      type: Array,
      default: [],
    },
  },

  data() {
    return {
      isLoading: true,
      isPublishing: false,
      comments: [],
      sortOrder: "newest",
      displayedComments: [],
      commentText: "",
      replyingTo: null,
      replyingToReply: false,
      replyParentId: null,
      isPrivate: false,
      currentUser: null,
      displayedUsers: [],
    };
  },

  watch: {
    commentableId: {
      handler: function (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.fetchComments();
        }
      },
    },
    isVisible: {
      handler: function (newVal) {
        if (newVal) {
          // Disable body scroll when modal opens
          document.body.style.overflow = 'hidden';
        } else {
          // Enable body scroll when modal closes
          document.body.style.overflow = 'auto';
        }
      },
    },
  },

  async created() {
    if (!this.users || this.users.length == 0) {
      this.displayedUsers = await this.userApi.getAll();
    } else {
      this.displayedUsers = this.users;
    }
  },
  mounted() {
    this.currentUser = Auth.USER;
    this.fetchComments();

    // Check URL for comment ID to scroll to
    const hash = window.location.hash;
    if (hash && hash.startsWith("#comment-")) {
      const commentId = hash.substring(9); // remove #comment-
      setTimeout(() => {
        const element = document.getElementById(`comment-${commentId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlight-comment");

          // Remove highlight after animation
          setTimeout(() => {
            element.classList.remove("highlight-comment");
          }, 3000);
        }
      }, 500);
    }
  },

  methods: {
    closeModal() {
      document.body.style.overflow = 'auto';
      this.$emit('close');
    },
    async fetchComments() {
      if (!this.commentableId || !this.commentableType) return;

      this.isLoading = true;

      try {
        const response = await this.commentApi.getAll({
          // filter: `commentable_type|${this.commentableType}|=&&commentable_id|${this.commentableId}|=&&parent_id|null-null|=`,
          filter: `commentable_type|${this.commentableType}|=&&commentable_id|${this.commentableId}|=&&parent_id|null-null|=&&is_private|${this.isPrivateEnabled}|=`,
          sort:
            this.sortOrder === "newest"
              ? "sort=created_at|desc"
              : "sort=created_at|asc",
          perPage: 10,
          currentPage: 1,
          with: ["replies"],
        });
        this.comments = response.data || [];
        this.prepareComments(this.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        this.comments = [];
        this.displayedComments = [];
      } finally {
        this.isLoading = false;
      }
    },

    prepareComments(commentsData) {
      if (!Array.isArray(commentsData)) return;

      // Deep clone to avoid mutations
      const processedComments = JSON.parse(JSON.stringify(commentsData));

      // Add showReplies property to each comment
      processedComments.forEach((comment) => {
        comment.showReplies = comment.showReplies || false;

        // Make sure replies is always an array
        if (!comment.replies) {
          comment.replies = [];
        }
      });

      // Sort comments
      this.sortCommentsList(processedComments);
    },

    sortCommentsList(commentsData) {
      if (!commentsData || !Array.isArray(commentsData)) return;

      commentsData.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);

        if (this.sortOrder === "newest") {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });

      // Also sort replies within each comment
      commentsData.forEach((comment) => {
        if (comment.replies && Array.isArray(comment.replies)) {
          comment.replies.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateA - dateB; // Replies always in chronological order
          });
        }
      });

      this.displayedComments = commentsData;
    },
    getUserFullName(userId) {
      const user = this.displayedUsers.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },
    sortComments() {
      this.sortCommentsList([...this.displayedComments]);
    },

    toggleReplies(comment) {
      comment.showReplies = !comment.showReplies;
    },

    handleReply(comment, parentId = null) {
      // If this is a reply to a reply, use the parent comment's ID instead
      if (parentId) {
        this.replyingTo = parentId; // Always reply to the main comment
        this.replyParentId = parentId;
      } else {
        this.replyingTo = comment.id;
        this.replyParentId = null;
      }

      this.commentText = "";

      // Always expand the parent comment's replies
      if (parentId) {
        const parentComment = this.displayedComments.find(
          (c) => c.id === parentId
        );
        if (parentComment) {
          parentComment.showReplies = true;
        }
      }

      // Focus the textarea after DOM update
      this.$nextTick(() => {
        const replyInput = document.querySelector(
          ".inline-reply-form .comment-input"
        );
        if (replyInput) {
          replyInput.focus();
        }
      });
    },
    getReplyingToName(replyId, replies) {
      if (!replies) return "";
      const reply = replies.find((r) => r.id === replyId);
      return reply ? this.getUserFullName(reply.user_id) : "";
    },

    cancelInlineReply() {
      this.replyingTo = null;
      this.replyingToReply = false;
      this.replyParentId = null;
      this.commentText = "";
    },

    async publishComment() {
      if (
        !this.commentText.trim() ||
        this.commentText.length > 1000 ||
        this.isPublishing
      )
        return;

      this.isPublishing = true;

      try {
        const payload = {
          content: this.commentText,
          commentable_type: this.commentableType,
          commentable_id: this.commentableId,
          is_private: this.isPrivateEnabled,
        };

        // If replying to another comment
        if (this.replyingTo) {
          payload.parent_id = this.replyingTo;
        }

        axios.defaults.baseURL = this.apiBaseUrl;
        const response = await this.commentApi.insert(payload);

        // Add the new comment to the list and reset form
        if (response.status === "success") {
          // Refresh comments to get proper structure
          await this.fetchComments();

          // Reset form
          this.commentText = "";
          this.replyingTo = null;
          this.replyingToReply = false;
          this.replyParentId = null;
          this.isPrivate = false;

          // Show the new comment
          setTimeout(() => {
            const newCommentId = response?.data?.data?.id;
            const newCommentElement = document.getElementById(
              `comment-${newCommentId}`
            );
            if (newCommentElement) {
              newCommentElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              newCommentElement.classList.add("highlight-comment");

              setTimeout(() => {
                if (newCommentElement) {
                  newCommentElement.classList.remove("highlight-comment");
                }
              }, 3000);
            }
          }, 300);
        }
      } catch (error) {
        console.error("Error publishing comment:", error);
        alert("Failed to post your comment. Please try again.");
      } finally {
        this.isPublishing = false;
      }
    },

    getTotalCommentsCount() {
      let total = this.comments.length;

      // Add all replies
      this.comments.forEach((comment) => {
        if (comment.replies && Array.isArray(comment.replies)) {
          total += comment.replies.length;
        }
      });

      return total;
    },

    getRelativeTime(dateString) {
      if (!dateString) return "";

      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return "just now";
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      }

      // For older dates, use standard date format
      return this.formatDate(dateString);
    },

    formatDate(dateString) {
      if (!dateString) return "";

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      } catch (e) {
        return dateString;
      }
    },

    formatFullDate(dateString) {
      if (!dateString) return "";

      try {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return dateString;
      }
    },

    isAuthor(comment) {
      const userComment = this.displayedUsers.find(
        (user) => user.id === comment.user_id
      );
      return this.currentUser?.id === userComment?.id;
    },
    // isAssignee(comment) {
    //   return this.currentUser?.id === comment.user?.id;
    // },
    getUserAvatar(name) {
      if (!name || typeof name !== "string") name = "User";

      // Extract initials (up to 2 characters)
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      // Generate a consistent color based on the name
      const hue = this.stringToHue(name);
      const bgColor = `hsl(${hue}, 65%, 60%)`;
      const textColor = "white";

      // Create SVG
      const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
            <rect width="40" height="40" fill="${bgColor}"/>
            <text x="50%" y="50%" dy=".1em" 
              fill="${textColor}" 
              font-family="Arial, sans-serif" 
              font-size="16"
              font-weight="bold"
              text-anchor="middle"
              dominant-baseline="middle">${initials}</text>
          </svg>
        `.trim();

      // Convert to data URI
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    },

    stringToHue(str) {
      let hash = 0;

      // Simple string hash function
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Convert to hue (0-360)
      return hash % 360;
    },

    handleImageError(e) {
      const name = e.target.alt?.replace("'s avatar", "") || "User";
      e.target.src = this.getUserAvatar(name);
    },

    formatCommentText(text) {
      if (!text) return "";

      // Escape HTML
      let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Convert URLs to links
      formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // Convert @mentions
      formatted = formatted.replace(
        /@([a-zA-Z0-9_.-]+)/g,
        '<span class="mention">@$1</span>'
      );

      // Convert line breaks to <br>
      formatted = formatted.replace(/\n/g, "<br>");

      return formatted;
    },

    handleKeyDown(event) {
      // Check if Ctrl+Enter was pressed
      if (event.ctrlKey && event.key === "Enter") {
        // Prevent the default behavior (adding a new line)
        event.preventDefault();

        // Only publish if the comment is valid
        if (this.commentText.trim() && this.commentText.length <= 1000) {
          this.publishComment();
        }
      }
    },

    getUserInitials(name) {
      if (!name) return 'U';
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },
  },
};
</script>

 <style scoped>
/* Base Styles - FIXED FOR VIEWPORT CENTERING */
.modal-overlay {
  position: fixed; /* This is correct - keeps it fixed to viewport */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: rgba(0, 0, 0, 0.6); */
  z-index: 9999;
  animation: fadeIn 0.3s ease;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto; /* Allow scrolling if modal is taller than viewport */
}

.modal-container {
  width: 100%;
  max-width: 900px;
  height: auto; /* Changed from fixed height */
  max-height: 85vh; /* Maximum 85% of viewport height */
  min-height: 500px; /* Minimum height to ensure usability */
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  position: relative;
  margin: auto; /* Center in the overlay */
}

/* Rest of your styles remain the same... */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #495057;
  background-color: #e9ecef;
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.comment-form {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #e9ecef;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.form-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.private-comment-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:checked+.slider:before {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

/* Comment Input */
.textarea-container {
  position: relative;
  margin-bottom: 0.75rem;
}

.comment-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ced4da;
  border-radius: 10px;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
}

.comment-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.comment-help {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
  margin-top: 0.5rem;
}

/* Form Footer */
.form-footer,
.reply-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
}

.character-count {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.character-count.text-danger {
  color: #dc3545;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-submit {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-submit:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-cancel {
  background-color: transparent;
  color: #6c757d;
  border: 2px solid #ced4da;
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background-color: #f8f9fa;
  color: #495057;
  border-color: #adb5bd;
}

/* Comments List */
.comment-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 2rem;
  min-height: 0;
}

.filter-sort {
  padding: 0.75rem 0;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #ced4da;
  font-size: 0.9rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #007bff;
}

.comment-list {
  padding-bottom: 2rem;
}

/* Comment Item */
.comment-item {
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.comment-container {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.comment-container:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comment-avatar,
.reply-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.comment-content,
.reply-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.author-badge {
  font-size: 0.75rem;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
}

.private-badge {
  font-size: 0.75rem;
  background-color: #f3e5f5;
  color: #8e24aa;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
}

.comment-date {
  font-size: 0.85rem;
  color: #6c757d;
}

.comment-body {
  margin-bottom: 0.75rem;
  line-height: 1.6;
  font-size: 0.95rem;
  color: #495057;
  word-wrap: break-word;
}

.comment-body p {
  margin: 0;
}

.comment-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.action-btn:hover {
  color: #007bff;
  background-color: #e7f3ff;
}

/* Inline Reply Form */
.inline-reply-form {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  margin-top: 1rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.reply-form-content {
  flex: 1;
  min-width: 0;
}

.replying-to-inline {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.reply-name {
  color: #007bff;
  font-weight: 600;
}

.reply-input {
  font-size: 0.95rem;
}

/* Replies */
.replies-container {
  margin-top: 1.5rem;
  margin-left: 3.5rem;
  border-left: 3px solid #e9ecef;
  padding-left: 1.5rem;
}

.reply-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid #f1f3f5;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-to-reply {
  margin-left: 2rem;
  margin-top: 1rem;
}

/* Empty State */
.no-comments {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: #ced4da;
}

.no-comments h5 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  color: #495057;
  font-weight: 600;
}

.no-comments p {
  margin: 0;
  font-size: 1rem;
}

/* Loading State */
.loading-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

/* Transitions */
.comment-fade-enter-active,
.comment-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.comment-fade-enter-from,
.comment-fade-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.replies-fade-enter-active,
.replies-fade-leave-active {
  transition: opacity 0.3s ease, max-height 0.4s ease;
  max-height: 2000px;
  overflow: hidden;
}

.replies-fade-enter-from,
.replies-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Scrollbar Styling */
.comment-list-container::-webkit-scrollbar {
  width: 8px;
}

.comment-list-container::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 10px;
}

.comment-list-container::-webkit-scrollbar-thumb {
  background: #ced4da;
  border-radius: 10px;
}

.comment-list-container::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }

  .modal-header,
  .comment-form,
  .comment-list-container {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .comment-container,
  .inline-reply-form {
    padding: 1.25rem;
  }

  .replies-container {
    margin-left: 2rem;
    padding-left: 1rem;
  }
}

@media (max-width: 576px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-header h3 {
    font-size: 1.2rem;
  }

  .comment-form,
  .comment-list-container {
    padding: 1rem;
  }

  .comment-container {
    flex-direction: column;
    gap: 1rem;
  }

  .replies-container {
    margin-left: 1rem;
    padding-left: 0.75rem;
  }

  .inline-reply-form {
    flex-direction: column;
    gap: 1rem;
  }

  .reply-avatar {
    display: none;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-submit,
  .btn-cancel {
    width: 100%;
    justify-content: center;
  }
}
</style>