<template>
  <div class="notifications-container">
    <!-- Loading state -->
    <div v-if="loading && currentPage === 1" class="loading-indicator">
      <div class="spinner"></div>
      {{ $t('notification.loading') }}
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
      <button @click="fetchNotifications(true)" class="retry-btn">{{ $t('notification.retry') }}</button>
    </div>

    <!-- Content when loaded -->
    <div v-if="!loading || currentPage > 1">
      <div class="notifications-header">
        <h2>{{ $t('notification.notification') }}</h2>
        <div class="header-actions">
          <button
            @click="markAllAsRead"
            class="mark-read-btn"
            :disabled="!hasUnread"
          >
            <i class="fas fa-check-double"></i> {{ $t('notification.mark_all_as_read') }}
          </button>
          <button @click="fetchNotifications(true)" class="refresh-btn">
            <i class="fas fa-sync-alt"></i> {{ $t('notification.refresh') }}
          </button>
        </div>
      </div>

      <!-- Notification filters -->
      <div class="notification-filters">
        <button @click="setFilter('all')" :class="{ active: filter === 'all' }">
          {{ $t('notification.all') }}
        </button>
        <button
          @click="setFilter('unread')"
          :class="{ active: filter === 'unread' }"
        >
          {{ $t('notification.unread') }}
        </button>
        <button
          @click="setFilter('system')"
          :class="{ active: filter === 'system' }"
        >
          {{ $t('notification.system') }}
        </button>
        <button
          @click="setFilter('auto')"
          :class="{ active: filter === 'auto' }"
        >
          {{ $t('notification.auto') }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="filteredNotifications.length === 0 && !loading" class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <p>{{ $t('notification.no_notifications') }}</p>
      </div>

      <!-- Notification list -->
      <div 
        ref="notificationContainer" 
        class="notification-list"
        @scroll="handleScroll"
      >
        <router-link
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :to="{ name: notification.class }"
          class="notification-item router-link"
          :class="{
            unread: !notification.readers?.includes(USER_ID),
            system: notification.type === 'system',
            auto: notification.type === 'auto',
          }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <i v-if="notification.type === 'system'" class="fas fa-cog"></i>
            <i v-else-if="notification.type === 'auto'" class="fas fa-robot"></i>
            <i v-else class="fas fa-bell"></i>
          </div>

          <div class="notification-content">
            <p class="notification-text">
              {{ formatNotificationText(notification.description) }}
            </p>
            <div class="notification-meta">
              <span class="notification-time">
                {{ formatTime(notification.created_at) }}
              </span>
              <span class="notification-type">
                {{ notification.type }}
              </span>
            </div>
          </div>

          <div class="notification-actions">
            <button
              v-if="!notification.readers?.includes(USER_ID)"
              @click.stop.prevent="markAsRead(notification.id)"
              class="action-btn mark-read"
              title="Mark as read"
            >
              <i class="fas fa-check"></i>
            </button>
          </div>
        </router-link>

        <!-- Load More Trigger -->
        <div
          v-show="hasMorePages"
          ref="loadMoreTrigger"
          class="load-more-trigger"
        >
          <div v-if="loading && currentPage > 1" class="spinner-small"></div>
          <span v-else class="loading-text">{{ $t('notification.loading_more') || 'Loading more...' }}</span>
        </div>

        <!-- End of List Message -->
        <div
          v-if="!hasMorePages && filteredNotifications.length > 0"
          class="end-of-list"
        >
          {{ $t('notification.no_more_notifications') || 'No more notifications' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import NotificationAPI from "@/API/notification/notification";
import Auth from "@/API/Auth";
import emitter from '@/plugins/eventBus';

const notificationAPI = new NotificationAPI();
const USER_ID = Auth.USER.id;

export default {
  components: {
    MainPage,
  },

  setup() {
    return {
      USER_ID,
    };
  },

  data() {
    return {
      notifications: [],
      allNotifications: [], // Store all notifications for pagination
      loading: false,
      error: null,
      filter: "all",
      currentPage: 1,
      perPage: 15,
      hasMorePages: false,
      totalRecords: 0,
      observer: null,
      ROLE_ID: "",
    };
  },

  computed: {
    filteredNotifications() {
      return this.notifications.filter((notification) => {
        if (this.filter === "unread")
          return !notification.readers?.includes(USER_ID);
        if (this.filter === "system") return notification.type === "system";
        if (this.filter === "auto") return notification.type === "auto";
        return true;
      });
    },

    hasUnread() {
      return this.notifications.some(
        (n) => !n.readers?.includes(USER_ID)
      );
    },
  },

  methods: {
    async fetchNotifications(reset = false) {
      // Prevent multiple simultaneous requests
      if (this.loading) return;

      // Reset pagination if needed
      if (reset) {
        this.currentPage = 1;
        this.notifications = [];
        this.allNotifications = [];
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await notificationAPI.getUserNotifications(
          Auth.USER.id,
          Auth.ROLE.id,
          Auth.USER?.team_ids
        );

        const fetchedNotifications = (response.data.notifications || response.data || []).sort((a, b) => {
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        });

        // Store all notifications only on first fetch
        if (reset || this.currentPage === 1) {
          this.allNotifications = Array.isArray(fetchedNotifications) ? fetchedNotifications : [];
          this.totalRecords = this.allNotifications.length;
        }

        // Calculate pagination on frontend
        const startIndex = (this.currentPage - 1) * this.perPage;
        const endIndex = startIndex + this.perPage;
        const paginatedNotifications = this.allNotifications.slice(startIndex, endIndex);

        if (reset || this.currentPage === 1) {
          this.notifications = paginatedNotifications;
        } else {
          this.notifications = [...this.notifications, ...paginatedNotifications];
        }

        // Check if there are more pages
        this.hasMorePages = endIndex < this.allNotifications.length;

      } catch (err) {
        console.error("Error fetching notifications:", err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          "Failed to load notifications";
      } finally {
        this.loading = false;
      }
    },

    loadMore() {
      if (this.hasMorePages && !this.loading) {
        this.currentPage++;
        this.fetchNotifications();
      }
    },

    setupIntersectionObserver() {
      this.$nextTick(() => {
        const loadMoreTrigger = this.$refs.loadMoreTrigger;
        const container = this.$refs.notificationContainer;

        if (loadMoreTrigger && container) {
          // Disconnect existing observer if any
          if (this.observer) {
            this.observer.disconnect();
          }

          this.observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                this.loadMore();
              }
            },
            {
              root: null, // Use viewport as root for page scroll
              threshold: 0.1,
            }
          );

          this.observer.observe(loadMoreTrigger);
        }
      });
    },

    handleScroll() {
      // Alternative scroll-based loading for window scroll
      if (this.loading || !this.hasMorePages) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when scrolled to 90% of the page
      if (scrollPosition >= documentHeight * 0.9) {
        this.loadMore();
      }
    },

    async markAsRead(notificationId) {
      try {
        await notificationAPI.markAsRead(notificationId, USER_ID);
        
        // Update both arrays
        this.notifications = this.notifications.map((notification) => {
          if (
            notification.id === notificationId &&
            !notification.readers?.includes(USER_ID)
          ) {
            return {
              ...notification,
              readers: [...(notification.readers || []), USER_ID],
            };
          }
          return notification;
        });

        this.allNotifications = this.allNotifications.map((notification) => {
          if (
            notification.id === notificationId &&
            !notification.readers?.includes(USER_ID)
          ) {
            return {
              ...notification,
              readers: [...(notification.readers || []), USER_ID],
            };
          }
          return notification;
        });

        emitter.emit('markeAsRead');
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },

    async markAllAsRead() {
      try {
        await notificationAPI.markAllAsRead(USER_ID);
        await this.fetchNotifications(true);
        this.setupIntersectionObserver();
        emitter.emit('markeAsRead');
      } catch (err) {
        console.error("Error marking all notifications as read:", err);
      }
    },

    setFilter(filter) {
      this.filter = filter;
    },

    formatTime(dateString) {
      if (!dateString) return "";

      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return `${this.$t('notification.just_now')}`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${this.$t('notification.minute_ago')}`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}${this.$t('notification.hour_ago')}`;
      return `${Math.floor(diffInSeconds / 86400)}${this.$t('notification.day_ago')}`;
    },

    formatNotificationText(text) {
      if (!text) return "No description provided";

      return text
        .replace(/{name}/g, "")
        .replace(/{ip_address}/g, "")
        .replace(/{asset_value}/g, "")
        .replace(/{asset_category_id}/g, "")
        .replace(/{user_ids}/g, "")
        .replace(/{document_ids}/g, "")
        .trim();
    },
  },

  async created() {
    await this.fetchNotifications(true);
    this.setupIntersectionObserver();
  },

  mounted() {
    // Add window scroll listener as backup
    window.addEventListener('scroll', this.handleScroll);
  },

  beforeUnmount() {
    // Clean up observers and listeners
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('scroll', this.handleScroll);
  },
};
</script>

<style scoped>
.notifications-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #65676b;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #1877f2;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.spinner-small {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #1877f2;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  padding: 20px;
  background-color: #ffecec;
  color: #d32f2f;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.retry-btn {
  margin-left: auto;
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e6eb;
}

.notifications-header h2 {
  margin: 0;
  font-size: 24px;
  color: #050505;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.mark-read-btn,
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #e7f3ff;
  color: #1877f2;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mark-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mark-read-btn:hover:not(:disabled),
.refresh-btn:hover {
  background-color: #d8e7ff;
}

.notification-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.notification-filters button {
  background-color: #f0f2f5;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.notification-filters button.active {
  background-color: #1877f2;
  color: white;
}

.notification-filters button:hover {
  background-color: #e4e6eb;
}

.notification-filters button.active:hover {
  background-color: #166fe5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #65676b;
  text-align: center;
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 15px;
  color: #bec3c9;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.notification-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.notification-item.unread {
  background: #f0f8ff;
  border-left: 3px solid #1877f2;
}

.notification-item.system {
  border-left: 3px solid #4caf50;
}

.notification-item.auto {
  border-left: 3px solid #ff9800;
}

.notification-icon {
  margin-right: 15px;
  font-size: 20px;
  color: #1877f2;
  flex-shrink: 0;
}

.notification-item.system .notification-icon {
  color: #4caf50;
}

.notification-item.auto .notification-icon {
  color: #ff9800;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  margin: 0;
  font-size: 15px;
  color: #050505;
  line-height: 1.4;
  word-break: break-word;
}

.notification-meta {
  display: flex;
  gap: 10px;
  margin-top: 6px;
  font-size: 13px;
  color: #65676b;
}

.notification-time {
  color: #65676b;
}

.notification-type {
  text-transform: capitalize;
  color: #1877f2;
  font-weight: 500;
}

.notification-item.system .notification-type {
  color: #4caf50;
}

.notification-item.auto .notification-type {
  color: #ff9800;
}

.notification-actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #65676b;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f0f2f5;
}

.action-btn.mark-read:hover {
  color: #1877f2;
}

.load-more-trigger {
  text-align: center;
  padding: 20px;
  color: #65676b;
  font-size: 14px;
}

.loading-text {
  font-style: italic;
}

.end-of-list {
  text-align: center;
  padding: 20px;
  color: #65676b;
  font-size: 14px;
  font-style: italic;
}

@media (max-width: 600px) {
  .notifications-container {
    padding: 10px;
  }

  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .notification-item {
    padding: 10px;
  }

  .notification-actions {
    opacity: 1;
  }
}
</style>