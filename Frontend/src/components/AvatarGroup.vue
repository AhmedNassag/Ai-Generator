<template>
  <div>
    <div v-if="users && users.length" class="d-flex justify-content-center">
      <div class="avatar-group">
        <!-- Member badges with spacing -->
        <span
          v-for="(user, index) in visibleUsers"
          :key="user.id"
          class="avatar-badge avatar-clickable"
          :style="{
            left: `${index * spacing}px`,
            zIndex: index + 1,
            backgroundColor: getColor(user.id),
          }"
          :title="user.full_name || user.name"
          @click="openUserDialog(user)"
        >
          {{ getInitials(user.full_name || user.name) }}
        </span>

        <!-- + badge for remaining users -->
        <span
          v-if="remainingCount > 0"
          class="avatar-badge-more avatar-clickable"
          :style="{ left: `${maxVisible * spacing}px` }"
          @click="openAllUsersDialog"
        >
          +{{ remainingCount }}
        </span>
      </div>
    </div>
    <span v-else>{{ emptyText }}</span>

    <!-- Teleport dialogs outside to avoid z-index issues with parent modals -->
    <Teleport to="body">
      <!-- All Users Dialog -->
      <v-dialog
        v-model="showAllUsersDialog"
        max-width="600px"
        persistent
        scrollable
        :z-index="10000"
      >
        <v-card>
          <v-card-title class="dialog-header">
            <div
              class="d-flex align-items-center justify-content-between w-100"
            >
              <div>
                <h5 class="mb-0">All Members</h5>
                <small class="text-muted"
                  >{{ users.length }} total members</small
                >
              </div>
              <v-btn icon @click="showAllUsersDialog = false" class="close-btn">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text class="pa-4" style="max-height: 400px">
            <div class="all-users-list">
              <div
                v-for="user in users"
                :key="user.id"
                class="user-list-item"
                @click="
                  openUserDialog(user);
                  showAllUsersDialog = false;
                "
              >
                <div
                  class="user-avatar-small"
                  :style="{ backgroundColor: getColor(user.id) }"
                >
                  {{ getInitials(user.full_name || user.name) }}
                </div>
                <div class="user-list-info">
                  <div class="user-list-name">
                    {{ user.full_name || user.name }}
                  </div>
                  <div class="user-list-email" v-if="user.email">
                    {{ user.email }}
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: "AvatarGroup",

  props: {
    users: {
      type: Array,
      required: true,
      default: () => [],
    },
    maxVisible: {
      type: Number,
      default: 3,
    },
    spacing: {
      type: Number,
      default: 20, // px spacing between avatars
    },
    clickable: {
      type: Boolean,
      default: true,
    },
    emptyText: {
      type: String,
      default: "N/A",
    },
    colors: {
      type: Array,
      default: () => [
        "#6E3894",
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E9",
        "#F8C471",
        "#82E0AA",
        "#F1948A",
        "#7FB3D5",
        "#D7BDE2",
        "#76D7C4",
        "#F9E79F",
        "#AED6F1",
        "#E59866",
      ],
    },
  },

  data() {
    return {
      showUserDialog: false,
      showAllUsersDialog: false,
      selectedUser: null,
    };
  },

  emits: ["click", "user-click"],

  computed: {
    visibleUsers() {
      return this.users.slice(0, this.maxVisible);
    },

    remainingCount() {
      return Math.max(0, this.users.length - this.maxVisible);
    },

    tooltipText() {
      return `View all ${this.users.length} member${
        this.users.length !== 1 ? "s" : ""
      }`;
    },

    // Calculate width based on spacing and number of visible elements
    groupWidth() {
      const avatarCount = Math.min(this.users.length, this.maxVisible);
      const hasMore = this.users.length > this.maxVisible;
      const totalElements = avatarCount + (hasMore ? 1 : 0);
      return totalElements * this.spacing + 12; // 12px for last avatar width
    },
  },

  mounted() {
    console.log("AvatarGroup mounted", this.users);
  },

  methods: {
    getInitials(fullName) {
      if (!fullName) return "NA";
      const names = fullName.trim().split(" ");

      if (names.length === 1) {
        return fullName.substring(0, 2).toUpperCase();
      }

      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    },

    getColor(userId) {
      // Simple hash function for consistent colors
      let hash = 0;
      const seed = String(userId);
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % this.colors.length;
      return this.colors[index];
    },

    handleClick() {
      if (this.clickable) {
        this.$emit("click", this.users);
      }
    },

    openUserDialog(user) {
      if (this.clickable) {
        this.selectedUser = user;
        this.showUserDialog = true;
        this.$emit("user-click", user);
      }
    },

    openAllUsersDialog() {
      if (this.clickable) {
        this.showAllUsersDialog = true;
      }
    },
  },
};
</script>

<style scoped>
.avatar-group {
  display: flex;
  align-items: center;
  position: relative;
  height: 32px;
  min-width: 32px;
}

.avatar-clickable {
  cursor: pointer;
}

.avatar-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid white;
  flex-shrink: 0;
  position: absolute;
  transition: transform 0.2s ease;
}

.avatar-badge.avatar-clickable:hover {
  transform: scale(1.1);
  z-index: 100 !important;
}

.avatar-badge-more {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid white;
  flex-shrink: 0;
  white-space: nowrap;
  transition: all 0.2s ease;
  position: absolute;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 4;
}

.avatar-badge-more.avatar-clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Dialog Styles */
.user-dialog-card {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  padding: 10px 14px;
}

.user-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.user-info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.info-row:hover {
  background-color: #e9ecef;
}

.info-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.info-value {
  font-size: 15px;
  color: #212529;
  font-weight: 500;
}

/* All Users Dialog Styles */
.all-users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-list-item {
  display: flex;
  align-items: center;
  padding: 5px;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-list-item:hover {
  background-color: #e9ecef;
  transform: translateX(4px);
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid white;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-list-info {
  margin-left: 12px;
  flex: 1;
}

.user-list-name {
  font-size: 15px;
  font-weight: 600;
  color: #212529;
}

.user-list-email {
  font-size: 13px;
  color: #6c757d;
  margin-top: 2px;
}

/* Ensure dialogs appear above parent modals */
::v-deep .v-dialog {
  z-index: 10000 !important;
}

::v-deep .v-overlay {
  z-index: 9999 !important;
}

::v-deep .v-dialog__content {
  z-index: 10000 !important;
}

/* Override Vuetify's default overlay z-index */
:global(.v-overlay--active) {
  z-index: 9999 !important;
}
</style>

<style>
/* Global styles to ensure AvatarGroup dialogs always appear on top */
.v-dialog.v-dialog--active {
  z-index: 10000 !important;
}

.v-overlay.v-overlay--active {
  z-index: 9999 !important;
}

.v-dialog__content--active {
  z-index: 10000 !important;
}
</style>
