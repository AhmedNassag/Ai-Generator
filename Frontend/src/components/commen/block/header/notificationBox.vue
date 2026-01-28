<template>
  <v-menu
    flat
    v-model="showNotifications"
    :close-on-content-click="false"
    max-width="350"
  >
    <template v-slot:activator="{ props }">
      <div style="display: inline-block">
        <btn
          v-bind="props"
          icon
          color="grey-darken-1"
          class="no-hover-effect"
          style="
            transition: none !important;
            background-color: transparent !important;
            pointer-events: auto;
          "
          @click="toggleNotifications"
          @mouseenter="$event.target.style.backgroundColor = 'transparent'"
          @mouseleave="$event.target.style.backgroundColor = 'transparent'"
        >
          <v-badge
            :content="unreadCount > 99 ? '+99' : unreadCount"
            :model-value="unreadCount > 0"
            color="error"
                class="custom-badge"
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </btn>
      </div>
    </template>

    <v-card min-width="350" max-width="350" elevation="8">
      <v-card-title class="text-h6 font-weight-medium px-4 py-3">
        {{ $t("notification.notification") }}
      </v-card-title>

      <v-divider></v-divider>

      <div 
        ref="notificationContainer" 
        style="max-height: 400px; overflow-y: auto"
        @scroll="handleScroll"
      >
        <!-- Loading State (Initial) -->
        <div v-if="loading && currentPage === 1" class="d-flex justify-center align-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="40"
          ></v-progress-circular>
        </div>

        <!-- Empty/Error State -->
        <div
          v-else-if="error || (notifications.length === 0 && !loading)"
          class="text-center py-8"
        >
          <v-icon size="48" color="grey-lighten-1" class="mb-2">
            mdi-bell-off-outline
          </v-icon>
          <div class="text-body-1 text-grey-darken-1 font-weight-medium">
            {{ $t("notification.you_do_not_have_notifications") }}
          </div>
        </div>

        <!-- Notifications List -->
        <div v-else>
          <div
            v-for="item in notifications"
            :key="item.id"
            class="text-decoration-none"
            @click="markAsRead(item.id)"
          >
            <v-card
              flat
              :class="[
                'notification-item ma-2 rounded-lg',
                { 'unread-notification': !item.readers?.includes(USER_ID) },
              ]"
              :ripple="true"
              hover
            >
              <div class="d-flex">
                <div
                  class="notification-border align-self-stretch"
                  :class="getNotificationTypeClass(item.type)"
                ></div>

                <div class="flex-grow-1 pa-3">
                  <div class="text-body-2 text-grey-darken-3 mb-1" v-html="item.description">
                  </div>
                  <div class="text-caption text-grey text-right">
                    {{ formatTime(item.created_at) }}
                  </div>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Load More Trigger -->
          <div
            v-show="hasMorePages"
            ref="loadMoreTrigger"
            class="load-more-trigger py-3"
          >
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="primary"
              size="24"
            ></v-progress-circular>
            <span v-else class="loading-text">Loading more...</span>
          </div>

          <!-- End of List Message -->
          <div
            v-if="!hasMorePages && notifications.length > 0"
            class="text-center py-3 text-caption text-grey"
          >
            {{ $t("notification.noMoreNotifications") || "No more notifications" }}
          </div>
        </div>
      </div>

      <!-- View All Link -->
      <v-card-actions class="justify-center py-2">
        <router-link
          :to="{ name: 'AllNotification' }"
          class="text-decoration-none"
        >
          <v-btn
            variant="text"
            color="primary"
            size="small"
            class="text-capitalize"
          >
            {{ $t("notification.viewAll") }}
          </v-btn>
        </router-link>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from "vue";
import Auth from "@/API/Auth";
import echo from "@/plugins/echo";
import NotificationAPI from "@/API/notification/notification";
import RoleApi from "@/API/Role/Role";
import { filter } from "jszip";
import emitter from "@/plugins/eventBus";

interface Notification {
  id: string;
  description: string;
  created_at: string;
  read_at: string | null;
  type: string | string[];
  user_from: string | null;
  user_to: string[];
  updated_at: string;
  class: string;
  classId: string;
  readers: string[];
  roles: any[];
  teams: any[];
}

const USER_ID = Auth.USER.id;
const notifications = ref<Notification[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showNotifications = ref(false);
const hasInitiallyLoaded = ref(false);

// Pagination state
const currentPage = ref(1);
const perPage = ref(10);
const totalRecords = ref(0);
const hasMorePages = ref(false);

// Store all notifications for client-side pagination
const allNotifications = ref<Notification[]>([]);

// Refs
const notificationContainer = ref<HTMLElement | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const notificationApi = new NotificationAPI();
const roleApi = new RoleApi();

const unreadCount = computed(() => {
  return allNotifications.value.filter((n) => !n.readers?.includes(USER_ID))
    .length;
});

const fetchNotifications = async (reset = false) => {
  // Check if user is authenticated
  if (!USER_ID || !Auth.USER?.id) {
    console.warn("User not authenticated, skipping notification fetch");
    return;
  }

  // Prevent multiple simultaneous requests
  if (loading.value) return;

  // Reset pagination if needed
  if (reset) {
    currentPage.value = 1;
    notifications.value = [];
    allNotifications.value = [];
    hasInitiallyLoaded.value = false;
  }

  loading.value = true;
  error.value = null;

  try {
    // Fetch all notifications with original 3 parameters
    const response = await notificationApi.getUserNotifications(
      USER_ID,
      Auth.ROLE.id,
      Auth.USER?.team_ids
    );

    // Extract notifications from response
    const fetchedNotifications = response.data.notifications ?? response.data;
    
    // Store all notifications only on first fetch
    if (!hasInitiallyLoaded.value || reset) {
      allNotifications.value = Array.isArray(fetchedNotifications) ? fetchedNotifications : [];
      totalRecords.value = allNotifications.value.length;
      hasInitiallyLoaded.value = true;
    }
    
    // Calculate pagination on frontend
    const startIndex = (currentPage.value - 1) * perPage.value;
    const endIndex = startIndex + perPage.value;
    const paginatedNotifications = allNotifications.value.slice(startIndex, endIndex);
    
    if (reset || currentPage.value === 1) {
      notifications.value = paginatedNotifications;
    } else {
      notifications.value = [...notifications.value, ...paginatedNotifications];
    }
    
    // Check if there are more pages
    hasMorePages.value = endIndex < allNotifications.value.length;

  } catch (err: any) {
    console.error("Error fetching notifications:", err);
    error.value = err.message || "Unknown error";
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (hasMorePages.value && !loading.value) {
    currentPage.value++;
    fetchNotifications();
  }
};

const setupIntersectionObserver = () => {
  nextTick(() => {
    if (loadMoreTrigger.value && notificationContainer.value) {
      // Disconnect existing observer if any
      if (observer.value) {
        observer.value.disconnect();
      }

      observer.value = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        {
          root: notificationContainer.value,
          threshold: 0.1,
        }
      );

      observer.value.observe(loadMoreTrigger.value);
    }
  });
};

const handleScroll = () => {
  // Optional: Alternative scroll-based loading
  const container = notificationContainer.value;
  if (!container || loading.value || !hasMorePages.value) return;

  const scrollPosition = container.scrollTop + container.clientHeight;
  const scrollHeight = container.scrollHeight;

  // Load more when scrolled to 90% of the content
  if (scrollPosition >= scrollHeight * 0.9) {
    loadMore();
  }
};

const toggleNotifications = async () => {
  if (showNotifications.value) {
    // Menu is closing, no need to fetch
    return;
  }
  
  // Menu is opening, fetch notifications if not loaded
  if (!hasInitiallyLoaded.value) {
    await fetchNotifications(true);
    setupIntersectionObserver();
  }
};

const markAsRead = async (id: string) => {
  try {
    const notificationToMark = notifications.value.find(
      (n) => n.id === id && !n.readers?.includes(USER_ID)
    );

    if (notificationToMark) {
      await notificationApi.markAsRead(id, USER_ID);

      // Update both arrays
      notifications.value = notifications.value.map((notification) => {
        if (notification.id === id && !notification.readers?.includes(USER_ID)) {
          return {
            ...notification,
            readers: [...(notification.readers || []), USER_ID],
          };
        }
        return notification;
      });

      allNotifications.value = allNotifications.value.map((notification) => {
        if (notification.id === id && !notification.readers?.includes(USER_ID)) {
          return {
            ...notification,
            readers: [...(notification.readers || []), USER_ID],
          };
        }
        return notification;
      });
    }
  } catch (err) {
    console.error("Error marking as read:", err);
  }
};

const getNotificationTypeClass = (type: string | string[]) => {
  const t = Array.isArray(type) ? type[0] : type;
  return (
    {
      mail: "border-primary",
      system: "border-error",
      auto: "border-success",
    }[t] || "border-grey"
  );
};

const formatTime = (timestamp: string): string => {
  const now = new Date();
  const diffInSec = Math.floor(
    (now.getTime() - new Date(timestamp).getTime()) / 1000
  );

  if (diffInSec < 60) return "Just now";
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)} min`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)} hr`;
  return `${Math.floor(diffInSec / 86400)} day${
    diffInSec >= 172800 ? "s" : ""
  }`;
};

const addNotificationIfNew = (n: Notification) => {
  const exists = notifications.value.some((existing) => existing.id === n.id);
  if (!exists) {
    // Add to both displayed and all notifications
    notifications.value.unshift(n);
    allNotifications.value.unshift(n);
    totalRecords.value++;
  }
};

onMounted(async () => {
  // Load notifications in background on mount
  await fetchNotifications(true);
  setupIntersectionObserver();

  emitter.on("markeAsRead", () => {
    fetchNotifications(true).then(() => {
      setupIntersectionObserver();
    });
  });

  // Listen to the User channel
  try {
    echo.private(`notification.${USER_ID}`).listen(".Alert", (event: any) => {
      const n = event.notification;
      addNotificationIfNew({
        id: n.id,
        description: n.description,
        created_at: n.created_at,
        read_at: null,
        type: n.type,
        user_from: null,
        user_to: n.user_to,
        updated_at: n.updated_at,
        class: n.class,
        classId: n.classId,
        readers: n.readers || [],
        roles: n.roles,
        teams: n.teams,
      });
    });

    // Listen to the Role channel
    echo.private(`role.${Auth.ROLE.id}`).listen(".Alert", (event: any) => {
      const n = event.notification;
      addNotificationIfNew({
        id: n.id,
        description: n.description,
        created_at: n.created_at,
        read_at: null,
        type: n.type,
        user_from: null,
        user_to: n.user_to,
        updated_at: n.updated_at,
        class: n.class,
        classId: n.classId,
        readers: n.readers || [],
        roles: n.roles,
        teams: n.teams,
      });
    });

    // Listen to the Team channel
    Auth.USER?.team_ids?.forEach((teamId: any) => {
      echo.private(`team.${teamId}`).listen(".Alert", (event: any) => {
        const n = event.notification;
        addNotificationIfNew({
          id: n.id,
          description: n.description,
          created_at: n.created_at,
          read_at: null,
          type: n.type,
          user_from: null,
          user_to: n.user_to,
          updated_at: n.updated_at,
          class: n.class,
          classId: n.classId,
          readers: n.readers || [],
          roles: n.roles,
          teams: n.teams,
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
});

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});
</script>

<style scoped>
.unread-notification {
  background-color: rgba(25, 118, 210, 0.08) !important;
  border-left: 4px solid rgb(25, 118, 210) !important;
}

.notification-item {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.notification-border {
  width: 4px;
  border-radius: 0 4px 4px 0;
}

.border-primary {
  background-color: rgb(25, 118, 210);
}

.border-success {
  background-color: rgb(46, 125, 50);
}

.border-error {
  background-color: rgb(211, 47, 47);
}

.border-grey {
  background-color: rgb(158, 158, 158);
}

.load-more-trigger {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.loading-text {
  font-style: italic;
}

.v-overlay__content {
  position: absolute !important;
  left: auto !important;
  right: 20px !important;
}

.v-menu > .v-overlay__content {
  display: flex;
  flex-direction: column;
  left: auto !important;
  right: 20px !important;
}

.v-btn--icon.v-btn--density-default {
  width: 12px !important;
  padding-bottom: 8px !important;
}

.no-hover-effect.v-btn {
  transition: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
}

.no-hover-effect.v-btn:hover {
  background-color: transparent !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 1 !important;
}

.no-hover-effect.v-btn:focus {
  background-color: transparent !important;
  box-shadow: none !important;
}

.no-hover-effect.v-btn:active {
  background-color: transparent !important;
  box-shadow: none !important;
  transform: none !important;
}

.no-hover-effect .v-btn__overlay,
.no-hover-effect .v-ripple__container {
  display: none !important;
  opacity: 0 !important;
}

.no-hover-effect:before,
.no-hover-effect:after,
.no-hover-effect .v-btn__content:before,
.no-hover-effect .v-btn__content:after {
  display: none !important;
  box-shadow: none !important;
}

.no-hover-effect.v-btn--elevated {
  box-shadow: none !important;
}

.no-hover-effect .v-badge {
  transition: none !important;
}

.no-hover-effect .v-badge:hover {
  transform: none !important;
}

.no-hover-effect.v-btn {
  transition: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
}

.no-hover-effect.v-btn:hover,
.no-hover-effect.v-btn:focus,
.no-hover-effect.v-btn:active {
  background-color: transparent !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 1 !important;
}

.no-hover-effect .v-btn__overlay,
.no-hover-effect .v-ripple__container {
  display: none !important;
}


</style>
<style scoped>
.custom-badge :deep(.v-badge__badge) {
  right: auto !important;
left: calc(100% - 12px) !important;
}

[dir="rtl"] .custom-badge :deep(.v-badge__badge) {
  right: calc(100% - 12px) !important;
  left: auto !important;
}
</style>