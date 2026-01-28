<template>
  <div class="team-select-container">
    <v-autocomplete
      v-model="selectedTeams"
      :items="teams"
      :disabled="disabled"
      :placeholder="placeholder || $t('common.please_select_teams')"
      variant="outlined"
      menu-icon="mdi-chevron-down"
      color="#A16BC7"
      :menu-props="{
        contentClass: 'team-select__menu--styled',
        maxHeight: '300px',
      }"
      :multiple="multiple"
      item-title="name"
      item-value="id"
      class="team-select--styled"
      clearable
      @update:modelValue="handleSelection"
      @update:menu="handleMenuToggle"
      @update:search="handleSearch"
      hide-details
      density="compact"
      :loading="loading"
      :no-data-text="noDataText"
    >
      <!-- Loading skeleton - only show when loading and no teams -->
      <template v-if="loading && teams.length === 0" v-slot:prepend-item>
        <v-list-item v-for="n in 3" :key="`skeleton-${n}`" class="px-2 py-1">
          <template v-slot:prepend>
            <div class="team-info-container">
              <v-skeleton-loader
                type="avatar"
                width="36"
                height="36"
                class="team-avatar-skeleton"
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
          @click="multiple ? toggleTeam(item.raw) : selectSingleTeam(item.raw)"
          class="px-2 py-1 my-0 team-list-item"
        >
          <template v-slot:prepend>
            <div class="team-info-container">
              <div
                class="team-avatar"
                :class="{ selected: isTeamSelected(item.raw.id) }"
                :style="{ backgroundColor: item.raw.avatarColor }"
              >
                {{ item.raw.initials }}
              </div>
            </div>
          </template>
        </v-list-item>
      </template>

      <!-- Custom selection display for both single and multiple select -->
      <template v-slot:selection="{ item }">
        <div class="selected-team-chip">
          <div
            class="selected-team-avatar"
            :style="{
              backgroundColor: getSelectedTeamData(item.value).avatarColor,
            }"
          >
            {{ getSelectedTeamData(item.value).initials }}
          </div>
          <span class="selected-team-name">{{
            getSelectedTeamData(item.value).name || item.title
          }}</span>
          <v-icon
            size="16"
            class="remove-icon"
            @click.stop="removeTeam(item.value)"
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
          <span class="load-more-text">Loading more teams...</span>
        </div>
        <div
          v-else-if="hasMoreTeams && teams.length > 0"
          ref="loadMoreTrigger"
          class="load-more-trigger"
        ></div>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import Team from "@/API/Team/Team";

export default {
  name: "TeamSelect",
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
    filterTeams: {
      type: Array,
      default: () => [],
    },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      teams: [],
      loading: false,
      loadingMore: false,
      teamApi: new Team(),
      page: 1,
      perPage: 10,
      hasMoreTeams: true,
      totalRecords: 0,
      searchQuery: "",
      searchTimeout: null,
      isMenuOpen: false,
      observer: null,
      selectedTeamsCache: {}, // Cache for selected teams data on search
    };
  },

  computed: {
    selectedTeams: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
        this.$emit("change", value);
      },
    },

    hasTeams() {
      return Array.isArray(this.teams) && this.teams.length > 0;
    },

    noDataText() {
      if (this.loading && this.teams.length === 0) {
        return "";
      }
      if (this.searchQuery && this.teams.length === 0) {
        return "No teams found";
      }
      return this.teams.length === 0 ? "No teams available" : "";
    },
  },

  mounted() {
    this.fetchTeams().then(() => {
      // Fetch data for already selected teams
      return this.fetchSelectedTeamsData();
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
    fetchTeams(reset = true) {
      // Prevent multiple simultaneous calls
      if (this.loading || this.loadingMore) return Promise.resolve();

      if (reset) {
        this.loading = true;
        this.page = 1;
        this.teams = [];
        this.hasMoreTeams = true;
      } else {
        this.loadingMore = true;
      }

      const params = {
        select: "id|name",
        perPage: this.perPage,
        page: this.page,
      };

      // Add search parameter if search query exists
      if (this.searchQuery && this.searchQuery.trim()) {
        params.search = this.searchQuery.trim();
      }

      return this.teamApi.getAll(params)
        .then(response => {
          // Handle the response structure: { data: [...], recordsTotal: 45, recordsFiltered: 45 }
          let newTeams = [];
          let totalRecords = 0;

          if (response && response.data && Array.isArray(response.data)) {
            newTeams = response.data;
            totalRecords = response.recordsTotal || response.recordsFiltered || 0;
          } else if (Array.isArray(response)) {
            // Fallback for simple array response
            newTeams = response;
            totalRecords = response.length;
          }

          this.totalRecords = totalRecords;

          // Filter out teams if filterTeams prop is provided
          if (this.filterTeams.length > 0) {
            newTeams = newTeams.filter(
              (team) =>
                !this.filterTeams.some(
                  (filteredTeam) => filteredTeam.id === team.id
                )
            );
          }

          // Pre-compute initials and avatar colors for better performance
          const processedTeams = newTeams.map((team) => ({
            ...team,
            initials: this.computeInitials(team.name),
            avatarColor: this.computeAvatarColor(team.id),
          }));

          if (reset) {
            this.teams = processedTeams;
          } else {
            this.teams = [...this.teams, ...processedTeams];
          }

          // Check if there are more teams to load based on total records
          const totalLoaded = this.teams.length;
          this.hasMoreTeams = totalLoaded < this.totalRecords;
        })
        .catch(error => {
          console.error("Error fetching teams:", error);
          if (reset) {
            this.teams = [];
          }
          this.hasMoreTeams = false;
        })
        .finally(() => {
          this.loading = false;
          this.loadingMore = false;
        });
    },

    loadMoreTeams() {
      if (this.loadingMore || !this.hasMoreTeams) return;

      this.page++;
      this.fetchTeams(false).then(() => {
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

      // Only set up observer if menu is open and there are more teams
      if (!this.isMenuOpen || !this.hasMoreTeams) return;

      // Wait for next tick to ensure DOM is updated
      this.$nextTick(() => {
        const trigger = this.$refs.loadMoreTrigger;
        if (!trigger) return;

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                entry.isIntersecting &&
                this.hasMoreTeams &&
                !this.loadingMore &&
                !this.loading
              ) {
                this.loadMoreTeams();
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
        this.fetchTeams(true);
      }, 500);
    },

    computeInitials(name) {
      if (!name) return "T";
      const words = name.trim().split(" ");
      if (words.length === 1) {
        // For single word, take first two characters
        return name.substring(0, 2).toUpperCase();
      }
      // For multiple words, take first character of first two words
      return (
        words[0].charAt(0) + words[1].charAt(0)
      ).toUpperCase();
    },

    computeAvatarColor(teamId) {
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
      const index = teamId ? teamId % colors.length : 0;
      return colors[index];
    },

    getSelectedTeamData(teamId) {
      // First check in loaded teams
      const team = this.teams.find((t) => t.id === teamId);
      if (team) return team;

      // Then check in selected teams cache
      if (this.selectedTeamsCache[teamId]) {
        return this.selectedTeamsCache[teamId];
      }

      // Return default if not found
      return {
        id: teamId,
        name: "Loading...",
        initials: "...",
        avatarColor: "#FFA726",
      };
    },

    fetchSelectedTeamsData() {
      if (!this.modelValue) return Promise.resolve();

      const selectedIds = this.multiple
        ? Array.isArray(this.modelValue)
          ? this.modelValue
          : []
        : [this.modelValue];

      if (selectedIds.length === 0) return Promise.resolve();

      // Find IDs that are not in current teams list and not in cache
      const missingIds = selectedIds.filter(
        (id) =>
          !this.teams.find((t) => t.id === id) && !this.selectedTeamsCache[id]
      );

      if (missingIds.length === 0) return Promise.resolve();

      // Fetch missing teams data
      // Assuming the API supports fetching by IDs
      return this.teamApi.getAll({
        select: "id|name",
        ids: missingIds.join(","),
      })
        .then(response => {
          let fetchedTeams = [];
          if (response && response.data && Array.isArray(response.data)) {
            fetchedTeams = response.data;
          } else if (Array.isArray(response)) {
            fetchedTeams = response;
          }

          // Process and cache the fetched teams
          fetchedTeams.forEach((team) => {
            const processedTeam = {
              ...team,
              initials: this.computeInitials(team.name),
              avatarColor: this.computeAvatarColor(team.id),
            };
            this.selectedTeamsCache[team.id] = processedTeam;
          });

          // Force re-render
          this.$forceUpdate();
        })
        .catch(error => {
          console.error("Error fetching selected teams data:", error);
        });
    },

    selectSingleTeam(team) {
      // Cache the selected team data
      if (team && team.id && !this.selectedTeamsCache[team.id]) {
        this.selectedTeamsCache[team.id] = {
          ...team,
          initials: team.initials || this.computeInitials(team.name),
          avatarColor: team.avatarColor || this.computeAvatarColor(team.id),
        };
      }

      // For single select, toggle selection
      this.selectedTeams = this.selectedTeams === team.id ? null : team.id;
    },

    toggleTeam(team) {
      if (!this.multiple) return;

      // Cache the selected team data
      if (team && team.id && !this.selectedTeamsCache[team.id]) {
        this.selectedTeamsCache[team.id] = {
          ...team,
          initials: team.initials || this.computeInitials(team.name),
          avatarColor: team.avatarColor || this.computeAvatarColor(team.id),
        };
      }

      const currentSelection = Array.isArray(this.selectedTeams)
        ? [...this.selectedTeams]
        : [];
      const teamIndex = currentSelection.indexOf(team.id);

      if (teamIndex > -1) {
        currentSelection.splice(teamIndex, 1);
      } else {
        currentSelection.push(team.id);
      }

      this.selectedTeams = currentSelection;
    },

    removeTeam(teamId) {
      if (this.multiple) {
        const currentSelection = Array.isArray(this.selectedTeams)
          ? [...this.selectedTeams]
          : [];
        const teamIndex = currentSelection.indexOf(teamId);

        if (teamIndex > -1) {
          currentSelection.splice(teamIndex, 1);
          this.selectedTeams = currentSelection;
        }
      } else {
        // For single select, clear the selection
        this.selectedTeams = null;
      }
    },

    isTeamSelected(teamId) {
      if (this.multiple) {
        return (
          Array.isArray(this.selectedTeams) &&
          this.selectedTeams.includes(teamId)
        );
      }
      return this.selectedTeams === teamId;
    },

    handleSelection(value) {
      // When a team is selected, cache their data
      // This ensures team name displays even after search is cleared
      if (!value) return;

      this.$nextTick(() => {
        const selectedIds = this.multiple
          ? Array.isArray(value)
            ? value
            : []
          : [value];

        selectedIds.forEach((id) => {
          // First, try to find team in current teams list
          const teamInList = this.teams.find((t) => t.id === id);

          if (teamInList) {
            // Cache the complete team data with all properties
            if (!this.selectedTeamsCache[id]) {
              this.selectedTeamsCache[id] = {
                id: teamInList.id,
                name: teamInList.name,
                initials: teamInList.initials,
                avatarColor: teamInList.avatarColor,
              };
            }

            // Also ensure team stays in the teams array
            // This prevents the team from disappearing when search is cleared
            const teamIndex = this.teams.findIndex((t) => t.id === id);
            if (teamIndex === -1) {
              this.teams.unshift(teamInList);
            }
          } else if (this.selectedTeamsCache[id]) {
            // Team is in cache but not in current teams list
            // Add cached team to teams array so it displays
            const cachedTeam = this.selectedTeamsCache[id];
            if (!this.teams.find((t) => t.id === cachedTeam.id)) {
              this.teams.unshift(cachedTeam);
            }
          }
        });
      });
    },

    getSelectedTeamNames() {
      if (!this.selectedTeams || !this.hasTeams) return [];

      if (this.multiple) {
        return this.teams
          .filter((team) => this.selectedTeams.includes(team.id))
          .map((team) => team.name || "Unknown Team");
      } else {
        const team = this.teams.find((team) => team.id === this.selectedTeams);
        return team ? [team.name || "Unknown Team"] : [];
      }
    },

    // Public method to refresh teams list
    refreshTeams() {
      return this.fetchTeams(true);
    },
  },

  watch: {
    // Watch modelValue changes to fetch missing selected teams data
    modelValue: {
      handler() {
        this.fetchSelectedTeamsData();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.team-select-container {
  width: 100%;
}

.team-select--styled {
  width: 100% !important;
}

.team-select--styled .v-field {
  height: 48px !important;
  min-height: 48px !important;
  border: 1px solid #ddd !important;
  border-radius: 10px !important;
  background-color: white !important;
  font-size: 14px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.team-select--styled .v-field__input {
  min-height: 48px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  color: #333 !important;
  align-items: center !important;
  gap: 6px !important;
}

.team-select--styled .v-field__outline {
  display: none !important;
}

.team-select--styled .v-field:hover {
  border-color: #a16bc7 !important;
}

.team-select--styled .v-field--focused {
  border: 2px solid #a16bc7 !important;
  box-shadow: 0 0 0 3px rgba(161, 107, 199, 0.1) !important;
}

.team-select--styled .v-field__append-inner {
  align-self: center !important;
  padding-top: 0 !important;
  margin-left: 8px !important;
}

.team-select--styled .v-field__append-inner .v-icon {
  color: #666 !important;
}

.team-select__menu--styled {
  max-height: 240px !important;
  border: 1px solid #ddd !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  margin-top: 4px !important;
  background: white !important;
}

.team-list-item {
  min-height: 56px !important;
  padding: 8px 16px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  border-bottom: 1px solid #f5f5f5 !important;
}

.team-list-item:last-child {
  border-bottom: none !important;
}

.team-list-item:hover {
  background-color: #f8f9ff !important;
}

/* New layout: Avatar + Name on the left */
.team-info-container {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex: 1 !important;
}

.team-avatar {
  width: 25px !important;
  height: 25px !important;
  border-radius: 5px !important;
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
}

.team-avatar.selected {
  border-color: #a16bc7 !important;
  box-shadow: 0 0 0 2px rgba(161, 107, 199, 0.3) !important;
}

/* Selected team chips in the input */
.selected-team-chip {
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

.selected-team-avatar {
  width: 28px !important;
  height: 28px !important;
  border-radius: 5px !important;
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

.selected-team-name {
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

/* Disabled state */
.team-select--styled .v-field--disabled {
  background-color: #f8f9fa !important;
  border-color: #dee2e6 !important;
  color: #6c757d !important;
  opacity: 0.6 !important;
}

.team-select--styled .v-field--disabled .team-avatar {
  background: #ccc !important;
}

/* Loading state */
.team-select--styled .v-field--loading {
  opacity: 0.7 !important;
}

.team-avatar-skeleton {
  border-radius: 5px !important;
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
.team-select--styled .v-select__selections {
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
  .team-select--styled .v-field {
    height: 44px !important;
    min-height: 44px !important;
  }

  .team-avatar {
    width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }

  .selected-team-avatar {
    width: 24px !important;
    height: 24px !important;
    font-size: 10px !important;
  }

  .selected-team-name {
    max-width: 80px !important;
  }
}
</style>