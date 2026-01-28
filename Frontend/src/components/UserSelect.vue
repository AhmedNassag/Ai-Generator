<template>
  <div class="user-select-container">
    <v-autocomplete
      v-model="selectedUsers"
      :items="users"
      :disabled="disabled"
      :placeholder="placeholder || $t('common.please_select_users')"
      variant="outlined"
      menu-icon="mdi-chevron-down"
      color="#A16BC7"
      :menu-props="{
        contentClass: 'user-select__menu--styled',
        maxHeight: '300px',
      }"
      :multiple="multiple"
      item-title="full_name"
      item-value="id"
      class="user-select--styled"
      clearable
      @update:modelValue="handleSelection"
      @update:menu="handleMenuToggle"
      @update:search="handleSearch"
      hide-details
      density="compact"
      :loading="loading"
      :no-data-text="noDataText"
    >
      <!-- Loading skeleton - only show when loading and no users -->
      <template v-if="loading && users.length === 0" v-slot:prepend-item>
        <v-list-item v-for="n in 3" :key="`skeleton-${n}`" class="px-2 py-1">
          <template v-slot:prepend>
            <div class="user-info-container">
              <v-skeleton-loader
                type="avatar"
                width="36"
                height="36"
                class="user-avatar-skeleton"
              ></v-skeleton-loader>
            </div>
          </template>
          <v-skeleton-loader
            type="text"
            width="120"
            height="16"
          ></v-skeleton-loader>
          <template v-slot:append>
            <v-skeleton-loader
              type="button"
              width="20"
              height="20"
            ></v-skeleton-loader>
          </template>
        </v-list-item>
      </template>

      <!-- Custom item rendering with reordered layout -->
      <template v-slot:item="{ item, props }">
        <v-list-item
          v-bind="props"
          @click="multiple ? toggleUser(item.raw) : selectSingleUser(item.raw)"
          class="px-2 py-1 my-0 user-list-item"
        >
          <template v-slot:prepend>
            <div class="user-info-container">
              <div
                class="user-avatar"
                :class="{ selected: isUserSelected(item.raw.id) }"
                :style="{ backgroundColor: item.raw.avatarColor }"
              >
                {{ item.raw.initials }}
              </div>
            </div>
          </template>

          <!-- <template v-slot:append>
            <v-checkbox
              :model-value="isUserSelected(item.raw.id)"
              color="#44225A"
              density="compact"
              class="user-checkbox"
              hide-details
              @click.stop
            ></v-checkbox>
          </template> -->
        </v-list-item>
      </template>

      <!-- Custom selection display for both single and multiple select -->
      <template v-slot:selection="{ item }">
        <div class="selected-user-chip">
          <div
            class="selected-user-avatar"
            :style="{
              backgroundColor: getSelectedUserData(item.value).avatarColor,
            }"
          >
            {{ getSelectedUserData(item.value).initials }}
          </div>
          <span class="selected-user-name">{{
            getSelectedUserData(item.value).full_name || item.title
          }}</span>
          <v-icon
            size="16"
            class="remove-icon"
            @click.stop="removeUser(item.value)"
          >
            mdi-close
          </v-icon>
        </div>
      </template>

      <!-- Load more indicator -->
      <template v-slot:append-item>
        <div v-if="loadingMore" class="load-more-container">
          <v-progress-circular
            indeterminate
            color="#A16BC7"
            size="24"
          ></v-progress-circular>
          <span class="load-more-text">Loading more users...</span>
        </div>
        <div
          v-else-if="hasMoreUsers && users.length > 0"
          ref="loadMoreTrigger"
          class="load-more-trigger"
        ></div>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import User from "@/API/User/User";

export default {
  name: "UserSelect",
  props: {
    modelValue: {
      type: [Number, String, Array],
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "",
    },
    filterUsers: {
      type: Array,
      default: () => [],
    },
    apiParams: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      users: [],
      loading: false,
      loadingMore: false,
      userApi: new User(),
      page: 1,
      perPage: 10,
      hasMoreUsers: true,
      totalRecords: 0,
      searchQuery: "",
      searchTimeout: null,
      isMenuOpen: false,
      observer: null,
      selectedUsersCache: {}, // Cache for selected users data on search
    };
  },

  computed: {
    selectedUsers: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
        this.$emit("change", value);
      },
    },

    hasUsers() {
      return Array.isArray(this.users) && this.users.length > 0;
    },

    noDataText() {
      if (this.loading && this.users.length === 0) {
        return "";
      }
      if (this.searchQuery && this.users.length === 0) {
        return "No users found";
      }
      return this.users.length === 0 ? "No users available" : "";
    },
  },

  mounted() {
    this.fetchUsers().then(() => {
      // Fetch data for already selected users
      return this.fetchSelectedUsersData();
    });
  },

  beforeUnmount() {
    // Clean up observer
    if (this.observer) {
      this.observer.disconnect();
    }
    // Clean up search timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },

  methods: {
    fetchUsers(reset = true) {
      // Prevent multiple simultaneous calls
      if (this.loading || this.loadingMore) return Promise.resolve();

      if (reset) {
        this.loading = true;
        this.page = 1;
        this.users = [];
        this.hasMoreUsers = true;
      } else {
        this.loadingMore = true;
      }

      const baseParams = {
        select: "id|full_name",
        perPage: this.perPage,
        page: this.page,
      };
      
      // Merge with custom API params
      const params = {
        ...baseParams,
        ...this.apiParams,
      };

      // Add search parameter if search query exists
      if (this.searchQuery && this.searchQuery.trim()) {
        params.search = this.searchQuery.trim();
      }

      return this.userApi.getAll(params)
        .then(response => {
          // Handle the response structure: { data: [...], recordsTotal: 45, recordsFiltered: 45 }
          let newUsers = [];
          let totalRecords = 0;

          if (response && response.data && Array.isArray(response.data)) {
            newUsers = response.data;
            totalRecords = response.recordsTotal || response.recordsFiltered || 0;
          } else if (Array.isArray(response)) {
            // Fallback for simple array response
            newUsers = response;
            totalRecords = response.length;
          }

          this.totalRecords = totalRecords;

          // Filter out users if filterUsers prop is provided
          if (this.filterUsers.length > 0) {
            newUsers = newUsers.filter(
              (user) =>
                !this.filterUsers.some(
                  (filteredUser) => filteredUser.id === user.id
                )
            );
          }

          // Pre-compute initials and avatar colors for better performance
          const processedUsers = newUsers.map((user) => ({
            ...user,
            initials: this.computeInitials(user.full_name),
            avatarColor: this.computeAvatarColor(user.id),
          }));

          if (reset) {
            this.users = processedUsers;
          } else {
            this.users = [...this.users, ...processedUsers];
          }

          // Check if there are more users to load based on total records
          const totalLoaded = this.users.length;
          this.hasMoreUsers = totalLoaded < this.totalRecords;
        })
        .catch(error => {
          console.error("Error fetching users:", error);
          if (reset) {
            this.users = [];
          }
          this.hasMoreUsers = false;
        })
        .finally(() => {
          this.loading = false;
          this.loadingMore = false;
        });
    },

    loadMoreUsers() {
      if (this.loadingMore || !this.hasMoreUsers) return;

      this.page++;
      this.fetchUsers(false).then(() => {
        // Reconnect observer after loading more
        this.$nextTick(() => {
          this.setupIntersectionObserver();
        });
      });
    },

    setupIntersectionObserver() {
      // Disconnect existing observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      // Only set up observer if menu is open and there are more users
      if (!this.isMenuOpen || !this.hasMoreUsers) return;

      // Wait for next tick to ensure DOM is updated
      this.$nextTick(() => {
        const trigger = this.$refs.loadMoreTrigger;
        if (!trigger) return;

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                entry.isIntersecting &&
                this.hasMoreUsers &&
                !this.loadingMore &&
                !this.loading
              ) {
                this.loadMoreUsers();
              }
            });
          },
          {
            root: null,
            rootMargin: "100px",
            threshold: 0,
          }
        );

        this.observer.observe(trigger);
      });
    },

    handleMenuToggle(isOpen) {
      this.isMenuOpen = isOpen;

      if (isOpen) {
        // Setup observer when menu opens
        this.setupIntersectionObserver();
      } else {
        // Clean up observer when menu closes
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
      }
    },

    handleSearch(value) {
      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Update search query
      this.searchQuery = value || "";

      // Debounce search - wait 500ms after user stops typing
      this.searchTimeout = setTimeout(() => {
        this.fetchUsers(true);
      }, 500);
    },

    computeInitials(name) {
      if (!name) return "U";
      const names = name.trim().split(" ");
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    },

    computeAvatarColor(userId) {
      const colors = [
        "#FF7043",
        "#42A5F5",
        "#66BB6A",
        "#AB47BC",
        "#FFA726",
        "#26C6DA",
        "#EF5350",
        "#7E57C2",
      ];
      const index = userId ? userId % colors.length : 0;
      return colors[index];
    },

    getSelectedUserData(userId) {
      // First check in loaded users
      const user = this.users.find((u) => u.id === userId);
      if (user) return user;

      // Then check in selected users cache
      if (this.selectedUsersCache[userId]) {
        return this.selectedUsersCache[userId];
      }

      // Return default if not found
      return {
        id: userId,
        full_name: "Loading...",
        initials: "...",
        avatarColor: "#FFA726",
      };
    },

    fetchSelectedUsersData() {
      if (!this.modelValue) return Promise.resolve();

      const selectedIds = this.multiple
        ? Array.isArray(this.modelValue)
          ? this.modelValue
          : []
        : [this.modelValue];

      if (selectedIds.length === 0) return Promise.resolve();

      // Find IDs that are not in current users list and not in cache
      const missingIds = selectedIds.filter(
        (id) =>
          !this.users.find((u) => u.id === id) && !this.selectedUsersCache[id]
      );

      if (missingIds.length === 0) return Promise.resolve();

      // Fetch missing users data
      // Assuming the API supports fetching by IDs
      return this.userApi.getAll({
        select: "id|full_name",
        ids: missingIds.join(","),
      })
        .then(response => {
          let fetchedUsers = [];
          if (response && response.data && Array.isArray(response.data)) {
            fetchedUsers = response.data;
          } else if (Array.isArray(response)) {
            fetchedUsers = response;
          }

          // Process and cache the fetched users
          fetchedUsers.forEach((user) => {
            const processedUser = {
              ...user,
              initials: this.computeInitials(user.full_name),
              avatarColor: this.computeAvatarColor(user.id),
            };
            this.selectedUsersCache[user.id] = processedUser;
          });

          // Force re-render
          this.$forceUpdate();
        })
        .catch(error => {
          console.error("Error fetching selected users data:", error);
        });
    },

    selectSingleUser(user) {
      // Cache the selected user data
      if (user && user.id && !this.selectedUsersCache[user.id]) {
        this.selectedUsersCache[user.id] = {
          ...user,
          initials: user.initials || this.computeInitials(user.full_name),
          avatarColor: user.avatarColor || this.computeAvatarColor(user.id),
        };
      }

      // For single select, toggle selection
      this.selectedUsers = this.selectedUsers === user.id ? null : user.id;
    },

    toggleUser(user) {
      if (!this.multiple) return;

      // Cache the selected user data
      if (user && user.id && !this.selectedUsersCache[user.id]) {
        this.selectedUsersCache[user.id] = {
          ...user,
          initials: user.initials || this.computeInitials(user.full_name),
          avatarColor: user.avatarColor || this.computeAvatarColor(user.id),
        };
      }

      const currentSelection = Array.isArray(this.selectedUsers)
        ? [...this.selectedUsers]
        : [];
      const userIndex = currentSelection.indexOf(user.id);

      if (userIndex > -1) {
        currentSelection.splice(userIndex, 1);
      } else {
        currentSelection.push(user.id);
      }

      this.selectedUsers = currentSelection;
    },

    removeUser(userId) {
      if (this.multiple) {
        const currentSelection = Array.isArray(this.selectedUsers)
          ? [...this.selectedUsers]
          : [];
        const userIndex = currentSelection.indexOf(userId);

        if (userIndex > -1) {
          currentSelection.splice(userIndex, 1);
          this.selectedUsers = currentSelection;
        }
      } else {
        // For single select, clear the selection
        this.selectedUsers = null;
      }
    },

    isUserSelected(userId) {
      if (this.multiple) {
        return (
          Array.isArray(this.selectedUsers) &&
          this.selectedUsers.includes(userId)
        );
      }
      return this.selectedUsers === userId;
    },

    handleSelection(value) {
      // When a user is selected, cache their data
      // This ensures user name displays even after search is cleared
      if (!value) return;

      this.$nextTick(() => {
        const selectedIds = this.multiple
          ? Array.isArray(value)
            ? value
            : []
          : [value];

        selectedIds.forEach((id) => {
          // First, try to find user in current users list
          const userInList = this.users.find((u) => u.id === id);

          if (userInList) {
            // Cache the complete user data with all properties
            if (!this.selectedUsersCache[id]) {
              this.selectedUsersCache[id] = {
                id: userInList.id,
                full_name: userInList.full_name,
                initials: userInList.initials,
                avatarColor: userInList.avatarColor,
              };
            }

            // Also ensure user stays in the users array
            // This prevents the user from disappearing when search is cleared
            const userIndex = this.users.findIndex((u) => u.id === id);
            if (userIndex === -1) {
              this.users.unshift(userInList);
            }
          } else if (this.selectedUsersCache[id]) {
            // User is in cache but not in current users list
            // Add cached user to users array so it displays
            const cachedUser = this.selectedUsersCache[id];
            if (!this.users.find((u) => u.id === cachedUser.id)) {
              this.users.unshift(cachedUser);
            }
          }
        });
      });
    },

    getSelectedUserNames() {
      if (!this.selectedUsers || !this.hasUsers) return [];

      if (this.multiple) {
        return this.users
          .filter((user) => this.selectedUsers.includes(user.id))
          .map((user) => user.full_name || "Unknown User");
      } else {
        const user = this.users.find((user) => user.id === this.selectedUsers);
        return user ? [user.full_name || "Unknown User"] : [];
      }
    },

    // Public method to refresh users list
    refreshUsers() {
      return this.fetchUsers(true);
    },
  },

  watch: {
    // Watch modelValue changes to fetch missing selected users data
    modelValue: {
      handler() {
        this.fetchSelectedUsersData();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.user-select-container {
  width: 100%;
}

.user-select--styled {
  width: 100% !important;
}

.user-select--styled .v-field {
  height: 48px !important;
  min-height: 48px !important;
  border: 1px solid #ddd !important;
  border-radius: 10px !important;
  background-color: white !important;
  font-size: 14px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.user-select--styled .v-field__input {
  min-height: 48px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  color: #333 !important;
  align-items: center !important;
  gap: 6px !important;
}

.user-select--styled .v-field__outline {
  display: none !important;
}

.user-select--styled .v-field:hover {
  border-color: #a16bc7 !important;
}

.user-select--styled .v-field--focused {
  border: 2px solid #a16bc7 !important;
  box-shadow: 0 0 0 3px rgba(161, 107, 199, 0.1) !important;
}

.user-select--styled .v-field__append-inner {
  align-self: center !important;
  padding-top: 0 !important;
  margin-left: 8px !important;
}

.user-select--styled .v-field__append-inner .v-icon {
  color: #666 !important;
}

.user-select__menu--styled {
  max-height: 240px !important;
  border: 1px solid #ddd !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 4px !important;
  background: white !important;
}

.user-list-item {
  min-height: 56px !important;
  padding: 8px 16px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  border-bottom: 1px solid #f5f5f5 !important;
}

.user-list-item:last-child {
  border-bottom: none !important;
}

.user-list-item:hover {
  background-color: #f8f9ff !important;
}

/* New layout: Avatar + Name on the left */
.user-info-container {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex: 1 !important;
}

.user-avatar {
  width: 25px !important;
  height: 25px !important;
  border-radius: 50% !important;
  background: #d0b5e3 !important;
  color: #43235c !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 10px !important;
  line-height: 12px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  border: 2px solid transparent !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  flex-shrink: 0 !important;
  margin-right: 5px !important;
  /* Prevent layout shift */
  /* min-width: 36px !important;
  min-height: 36px !important; */
}

.user-avatar.selected {
  border-color: #a16bc7 !important;
  box-shadow: 0 0 0 2px rgba(161, 107, 199, 0.3) !important;
  /* transform: scale(1.05) !important; */
}

.user-name {
  font-size: 15px !important;
  color: #333 !important;
  font-weight: 500 !important;
  line-height: 1.4 !important;
  /* Prevent text jumping */
  display: block !important;
  flex: 1 !important;
  min-height: 20px !important;
}

.user-checkbox {
  margin: 0 !important;
}

.user-checkbox .v-selection-control__input:before {
  border: 2px solid #ddd !important;
  border-radius: 3px !important;
}

.user-checkbox .v-selection-control__input:hover:before {
  border-color: #a16bc7 !important;
}

/* Selected user chips in the input */
.selected-user-chip {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: #f8f9ff !important;
  border: 1px solid #e1e8ff !important;
  border-radius: 20px !important;
  padding: 2px 8px 2px 2px !important;
  margin: 2px !important;
  max-height: 32px !important;
}

.selected-user-avatar {
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  background: #ebdcb3 !important;
  color: #c4951b !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  flex-shrink: 0 !important;
}

.selected-user-name {
  font-size: 13px !important;
  color: #333 !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  max-width: 120px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.remove-icon {
  color: #666 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  border-radius: 50% !important;
  padding: 2px !important;
}

.remove-icon:hover {
  color: #ff4444 !important;
  background-color: rgba(255, 68, 68, 0.1) !important;
}

.more-users-indicator {
  background: #f0f0f0 !important;
  border: 1px solid #ddd !important;
  border-radius: 16px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
  color: #666 !important;
  font-weight: 500 !important;
  margin: 2px !important;
  white-space: nowrap !important;
}

/* Disabled state */
.user-select--styled .v-field--disabled {
  background-color: #f8f9fa !important;
  border-color: #dee2e6 !important;
  color: #6c757d !important;
  opacity: 0.6 !important;
}

.user-select--styled .v-field--disabled .user-avatar {
  background: #ccc !important;
}

/* Loading state */
.user-select--styled .v-field--loading {
  opacity: 0.7 !important;
}

.user-avatar-skeleton {
  border-radius: 50% !important;
  margin-right: 5px !important;
}

/* Skeleton loading animations */
.v-skeleton-loader {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  ) !important;
  background-size: 200% 100% !important;
  animation: loading 1.5s infinite !important;
}

@keyframes loading {
  0% {
    background-position: 200% 0 !important;
  }
  100% {
    background-position: -200% 0 !important;
  }
}

/* Load more container styling */
.load-more-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 12px !important;
  padding: 16px !important;
  background: #fafafa !important;
}

.load-more-text {
  font-size: 13px !important;
  color: #666 !important;
}

.load-more-trigger {
  height: 1px !important;
  width: 100% !important;
}

/* Hide default v-select selections and customize */
.user-select--styled .v-select__selections {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 4px !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
}
.v-autocomplete .v-field .v-text-field__prefix,
.v-autocomplete .v-field .v-text-field__suffix,
.v-autocomplete .v-field .v-field__input,
.v-autocomplete .v-field.v-field {
  border-radius: 10px !important;
}
/* Responsive adjustments */
@media (max-width: 768px) {
  .user-select--styled .v-field {
    height: 44px !important;
    min-height: 44px !important;
  }

  .user-avatar {
    width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }

  .selected-user-avatar {
    width: 24px !important;
    height: 24px !important;
    font-size: 10px !important;
  }

  .selected-user-name {
    max-width: 80px !important;
  }
}
</style>
