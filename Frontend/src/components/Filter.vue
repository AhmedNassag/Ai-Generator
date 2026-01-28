<template>
  <!-- Filter Overlay -->
  <div v-if="isModalOpen" class="filter-overlay" @click.self="closeAllModals">
    <!-- Active Filters Modal (First popup) -->
    <div
      v-show="currentStage === 'active-filters'"
      class="filter-modal active-filters-modal"
      :class="{ 'slide-in-center': animationDirection === 'center' }"
    >
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("common.filter") }}</h5>
        <button class="close-btn" @click="closeAllModals">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Global Operator Selection (only show when filters exist) -->
        <div v-if="activeFilters.length > 0" class="global-operator-section">
          <div class="global-operator-label">
            <label>{{ $t("common.operator") || "Operator" }}:</label>
            <small class="operator-help-text">
              <template v-if="hasActiveSpecialFilters">
                <strong>AND only:</strong> Special filter types are active,
                forcing AND operation for all filters.
              </template>
              <template v-else>
                {{
                  globalOperator === "&&"
                    ? $t("common.and_operator_help") ||
                      "AND: All conditions must match. Cannot select multiple values from the same filter."
                    : $t("common.or_operator_help") ||
                      "OR: Any condition can match. Allows multiple selections from the same filter."
                }}
              </template>
              <br v-if="hasSpecialFilters && !hasActiveSpecialFilters" />
              <span
                v-if="hasSpecialFilters && !hasActiveSpecialFilters"
                class="special-filters-notice"
              >
                <i class="fas fa-lock"></i> Some filters always use AND
                operation regardless of this setting.
              </span>
            </small>
          </div>
          <div class="global-operator-selector">
            <select
              :value="globalOperator"
              @change="updateGlobalOperator($event.target.value)"
              class="global-operator-select"
              :disabled="hasActiveSpecialFilters"
            >
              <option value="&&">AND</option>
              <option value="||" :disabled="hasActiveSpecialFilters">OR</option>
            </select>
            <div class="select-arrow-global">
              <i class="fas fa-chevron-down"></i>
            </div>
            <!-- Show why OR is disabled -->
            <!-- <div v-if="hasActiveSpecialFilters" class="operator-disabled-notice">
              <i class="fas fa-info-circle"></i>
              <span>OR is disabled because special filter types are active</span>
            </div> -->
          </div>
        </div>

        <!-- Active Filters List -->
        <div v-if="activeFilters.length > 0" class="active-filters-list">
          <div class="active-filters-content">
            <template
              v-for="(filterGroup, groupIndex) in groupedActiveFilters"
              :key="groupIndex"
            >
              <!-- Show operator only between different filter groups when global operator is mixed -->
              <div
                v-if="groupIndex > 0 && globalOperator === 'mixed'"
                class="filter-operator-row"
              >
                <div class="operator-selector-full">
                  <select
                    :value="getOperatorBetweenGroups(groupIndex - 1)"
                    @change="
                      updateOperatorBetweenGroups(
                        groupIndex - 1,
                        $event.target.value
                      )
                    "
                    class="operator-select-full"
                  >
                    <option value="&&">AND</option>
                    <option value="||">OR</option>
                  </select>
                  <div class="select-arrow-full">
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>

              <!-- Show global operator indicator when not mixed -->
              <div v-else-if="groupIndex > 0" class="global-operator-indicator">
                <span class="operator-text">{{
                  globalOperator === "&&" ? "AND" : "OR"
                }}</span>
              </div>

              <!-- Filter group container -->
              <div class="filter-group">
                <!-- Filter chips -->
                <div
                  class="filter-chips-container"
                  :class="{ 'multiple-selection': filterGroup.length > 1 }"
                >
                  <template
                    v-for="(filter, filterIndex) in filterGroup"
                    :key="`${filter.key}-${filter.value}`"
                  >
                    <!-- Show OR between items in the same group (multiple selections) -->
                    <div
                      v-if="filterIndex > 0 && filterGroup.length > 1"
                      class="inline-operator"
                    >
                      OR
                    </div>

                    <!-- Filter chip -->
                    <div
                      class="active-filter-chip-full"
                      :class="{ 'forced-and': filter.forcedAnd }"
                    >
                      <!-- Show filter title for all filters -->
                      <span class="filter-label">{{ filter.title }}:</span>
                      <span class="filter-value">{{ filter.name }}</span>
                      <!-- Show forced AND indicator -->
                      <span
                        v-if="filter.forcedAnd"
                        class="forced-and-indicator"
                        title="This filter type always uses AND operation"
                      >
                        <i class="fas fa-lock"></i>
                      </span>
                      <button
                        class="remove-filter-btn"
                        @click="removeFilter(filter)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Action Buttons Section -->
        <div class="filter-actions-section">
          <!-- Add Filter Button -->
          <div class="add-filter-section">
            <!-- Show different button based on filter availability -->
            <button
              v-if="availableFilters && availableFilters.length > 0"
              class="add-filter-btn"
              @click="openFilterSelection"
            >
              <i class="fa-solid fa-circle-plus me-1"></i>
              <span>{{ $t("common.add_filter") }}</span>
            </button>

            <!-- No filters available state -->
            <div v-else class="no-filters-available">
              <div class="no-filters-icon-small">
                <i class="fas fa-filter-circle-xmark"></i>
              </div>
              <div class="no-filters-text">
                <p>
                  {{
                    $t("common.no_filters_description") ||
                    "No filters are configured for this module."
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Save and Clear Buttons (only show when filters exist) -->
          <div v-if="activeFilters.length > 0" class="action-buttons-section">
            <div class="action-buttons">
              <button class="clear-all-btn" @click="clearAllFilters">
                <span>{{ $t("common.clear") || "Clear All" }}</span>
              </button>
              <button class="save-filters-btn" @click="saveFilters">
                <span>{{ $t("common.save") || "Save" }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Selection Modal (Second popup) -->
    <div
      v-show="currentStage === 'selection'"
      class="filter-modal filter-selection-modal"
      :class="{ 'slide-in-right': animationDirection === 'right' }"
    >
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("common.attributes") }}</h5>
        <button class="close-btn" @click="closeAllModals">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- No Filters Available State -->
        <div
          v-if="!availableFilters || availableFilters.length === 0"
          class="no-filters-state"
        >
          <div class="no-filters-icon">
            <i class="fas fa-filter-circle-xmark"></i>
          </div>
          <h6 class="no-filters-title">
            {{ $t("common.no_filters_available") || "No Filters Available" }}
          </h6>
          <p class="no-filters-message">
            {{
              $t("common.no_filters_message") ||
              "No filters are configured for this module. Contact your administrator to set up filters."
            }}
          </p>
          <button class="close-modal-btn" @click="closeAllModals">
            <i class="fas fa-times me-2"></i>
            {{ $t("common.close") || "Close" }}
          </button>
        </div>

        <!-- Filters Available -->
        <div v-else class="filter-options-grid">
          <div
            v-for="filter in availableFilters"
            :key="filter.key"
            class="filter-option-card"
            :class="{
              'has-selections': getSelectedCountForFilter(filter.key) > 0,
            }"
            @click="selectFilter(filter)"
          >
            <div class="filter-option-content">
              <h6 class="filter-option-title">{{ filter.title }}</h6>
              <!-- <div v-if="getSelectedCountForFilter(filter.key) > 0" class="selection-count">
                {{ getSelectedCountForFilter(filter.key) }} selected
              </div> -->
            </div>
            <div class="filter-option-arrow">
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Values Modal -->
    <div
      v-show="currentStage === 'values'"
      class="filter-modal filter-values-modal"
      :class="{
        'slide-in-left': animationDirection === 'left',
        'slide-in-right': animationDirection === 'right',
      }"
    >
      <div class="modal-header">
        <h5 class="modal-title">{{ selectedFilter?.title }}</h5>
        <button class="close-btn" @click="closeAllModals">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Search Box -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchTerm"
              type="text"
              class="search-input"
              :placeholder="$t('common.search')"
              @input="onSearchInput"
            />
            <button
              v-if="searchTerm"
              class="clear-search-btn"
              @click="clearSearch"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Options List -->
        <div
          class="options-container"
          @scroll="onOptionsScroll"
          ref="optionsContainer"
        >
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
            <p class="loading-text">{{ $t("common.loading") }}...</p>
          </div>

          <!-- Options List -->
          <div v-else-if="currentOptions.length > 0" class="options-list">
            <div
              v-for="option in currentOptions"
              :key="option.id"
              class="option-item"
              :class="{
                'option-disabled': isOptionDisabled(option),
                'option-selected': isValueSelected(option),
              }"
              @click="!isOptionDisabled(option) && toggleValue(option)"
            >
              <div class="option-content">
                <span class="option-name">{{ option.name }}</span>
                <div class="option-checkbox">
                  <input
                    type="checkbox"
                    :checked="isValueSelected(option)"
                    :disabled="isOptionDisabled(option)"
                    @click.stop
                    @change="!isOptionDisabled(option) && toggleValue(option)"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                </div>
              </div>
              <!-- Show disabled reason -->
              <div v-if="isOptionDisabled(option)" class="disabled-reason">
                <small>{{
                  $t("common.single_selection_only") ||
                  "Single selection only in AND mode"
                }}</small>
              </div>
            </div>

            <!-- Loading More State -->
            <div v-if="loadingMore" class="loading-more-state">
              <div class="loading-spinner-small">
                <div class="spinner-small"></div>
              </div>
              <p class="loading-more-text">
                {{
                  $t("common.loading_more") ||
                  `Loading more... (${dynamicOptions.length}/${totalRecords})`
                }}
              </p>
            </div>

            <!-- End of Results Indicator -->
            <!-- <div v-else-if="!hasMoreData && currentOptions.length > 0" class="end-of-results">
              <p class="end-text">
                {{ $t("common.all_results_loaded") || `All ${totalRecords} results loaded` }}
              </p>
              <div v-if="isDevelopment" class="debug-info">
                <small>
                  Loaded: {{ dynamicOptions.length }} | Total: {{ totalRecords }} | Page: {{ currentPage }}
                </small>
              </div>
            </div> -->
          </div>

          <!-- No Results State -->
          <div v-else class="no-results-state">
            <p class="no-results-text">{{ $t("common.no_results_found") }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Filter",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    filters: {
      type: Array,
      required: true,
      /**
       * Filter data structure validation:
       * - Static data: Array of objects with id and name
       * - Dynamic data (legacy): String with API model name
       * - Dynamic data (new): Object with { model, id?, display? }
       *   Example: { model: "User", id: "id", display: "full_name" }
       *   Defaults: id = "id", display = "name"
       * - Display field can also be specified directly on filter: { display: "custom_field" }
       *   This takes precedence over data config display field
       */
      validator: (filters) => {
        return filters.every(
          (filter) =>
            filter.title &&
            filter.key &&
            filter.type &&
            (Array.isArray(filter.data) ||
              typeof filter.data === "string" ||
              (typeof filter.data === "object" &&
                filter.data !== null &&
                !Array.isArray(filter.data) &&
                filter.data.model))
        );
      },
    },
  },
  emits: [
    "close",
    "filter-applied",
    "filter-removed",
    "filters-cleared",
    "operators-changed",
    "filters-saved",
  ],
  data() {
    return {
      currentStage: "active-filters", // 'active-filters', 'selection', or 'values'
      selectedFilter: null,
      searchTerm: "",
      loading: false,
      dynamicOptions: [],
      activeFilters: [],
      searchDebounceTimer: null,
      isModalOpen: false,
      animationDirection: "center", // 'center', 'left' or 'right'
      filterOperators: [], // Array to store operators between each pair of filters
      selectedValues: {}, // Object to track selected values for each filter key
      globalOperator: "&&", // Global operator for all filters: '&&' (AND), '||' (OR), or 'mixed'

      // Pagination properties for lazy loading
      currentPage: 1,
      hasMoreData: true,
      totalRecords: 0,
      loadingMore: false,
      perPage: 10,
    };
  },
  computed: {
    availableFilters() {
      // Always return all filters - allow selecting the same filter type multiple times
      return this.filters;
    },

    groupedActiveFilters() {
      // Group filters by their key to show multiple selections together
      const groups = {};
      this.activeFilters.forEach((filter) => {
        if (!groups[filter.key]) {
          groups[filter.key] = [];
        }
        groups[filter.key].push(filter);
      });
      return Object.values(groups);
    },

    isStaticData() {
      return this.selectedFilter && Array.isArray(this.selectedFilter.data);
    },

    isDynamicData() {
      return (
        this.selectedFilter &&
        (typeof this.selectedFilter.data === "string" ||
          (typeof this.selectedFilter.data === "object" &&
            this.selectedFilter.data !== null &&
            !Array.isArray(this.selectedFilter.data) &&
            this.selectedFilter.data.model))
      );
    },

    filteredStaticOptions() {
      if (!this.isStaticData || !this.searchTerm) {
        return this.selectedFilter?.data || [];
      }
      return this.selectedFilter.data.filter((option) =>
        option.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },

    currentOptions() {
      return this.isStaticData
        ? this.filteredStaticOptions
        : this.dynamicOptions;
    },

    // Check if multiple selection is allowed for current filter
    isMultipleSelectionAllowed() {
      if (!this.selectedFilter) return false;

      // Get the filter definition to check if it has a specific filterType
      const filterDefinition = this.filters.find(
        (f) => f.key === this.selectedFilter.key
      );

      // If filter has a specific filterType (not "filter"), force single selection (AND)
      if (
        filterDefinition &&
        filterDefinition.filterType &&
        filterDefinition.filterType !== "filter"
      ) {
        return false; // Always single selection for special filter types
      }

      // For standard filters with filterType: "filter", use global operator logic
      // If global operator is AND, don't allow multiple selections from same filter
      // If global operator is OR, allow multiple selections
      return this.globalOperator === "||";
    },

    // Get the effective filter type based on global operator
    effectiveFilterType() {
      return this.globalOperator === "||" ? "filterOr" : "filter";
    },

    // Check if we're in development mode for debug info
    isDevelopment() {
      return process.env.NODE_ENV === "development";
    },

    // Check if there are any filters with special filterTypes (non-standard filters)
    hasSpecialFilters() {
      return this.filters.some(
        (filter) =>
          filter.filterType &&
          filter.filterType !== "filter" &&
          filter.filterType !== "filterOr"
      );
    },

    // Check if there are any ACTIVE filters with special filterTypes
    hasActiveSpecialFilters() {
      return this.activeFilters.some(
        (filter) =>
          filter.filterType &&
          filter.filterType !== "filter" &&
          filter.filterType !== "filterOr"
      );
    },

    // Check if an option should be disabled
    isOptionDisabled() {
      return (option) => {
        if (!this.selectedFilter) return false;

        const filterKey = this.selectedFilter.key;
        const selectedValues = this.selectedValues[filterKey] || [];

        // Get the filter definition to check if it has a specific filterType
        const filterDefinition = this.filters.find(
          (f) => f.key === this.selectedFilter.key
        );

        // If filter has a specific filterType (not "filter"), always allow only single selection
        if (
          filterDefinition &&
          filterDefinition.filterType &&
          filterDefinition.filterType !== "filter"
        ) {
          if (selectedValues.length > 0) {
            // Only allow if this option is already selected
            return !selectedValues.some((val) => val.id === option.id);
          }
          return false;
        }

        // For standard filters, check global operator
        // If AND operator is selected and there's already a selection, disable other options
        if (this.globalOperator === "&&" && selectedValues.length > 0) {
          // Only allow if this option is already selected
          return !selectedValues.some((val) => val.id === option.id);
        }

        return false;
      };
    },
  },
  methods: {
    openActiveFiltersModal() {
      this.isModalOpen = true;
      this.currentStage = "active-filters";
      this.animationDirection = "center";
    },

    openFilterSelection() {
      this.currentStage = "selection";
      this.animationDirection = "right";
    },

    goBackToActiveFilters() {
      this.currentStage = "active-filters";
      this.animationDirection = "left";
      this.selectedFilter = null;
      this.searchTerm = "";
      this.dynamicOptions = [];
    },

    closeAllModals() {
      this.isModalOpen = false;
      this.currentStage = "active-filters";
      this.selectedFilter = null;
      this.searchTerm = "";
      this.dynamicOptions = [];
      this.$emit("close");
    },

    updateGlobalOperator(operator) {
      this.globalOperator = operator;

      // Update all filter operators to match the global operator
      this.updateAllFilterOperators();

      // Update filterType for all active filters based on global operator
      this.updateFilterTypes();

      // If switching to AND and there are multiple selections from same filter,
      // keep only the first selection of each filter type
      if (operator === "&&") {
        this.enforceSingleSelectionForAnd();
      }
    },

    updateAllFilterOperators() {
      // Set all operators between filter groups to the global operator
      const groupKeys = Object.keys(this.groupFiltersByKey());
      this.filterOperators = [];

      for (let i = 0; i < groupKeys.length; i++) {
        const currentGroup = this.groupFiltersByKey()[groupKeys[i]];

        // Add OR operators within the same filter group (always OR for multiple selections)
        for (let j = 0; j < currentGroup.length - 1; j++) {
          this.filterOperators.push("||");
        }

        // Add global operator between different filter groups (except for the last group)
        if (i < groupKeys.length - 1) {
          this.filterOperators.push(this.globalOperator);
        }
      }
    },

    updateFilterTypes() {
      // Update filterType for all active filters based on global operator and filter definition
      this.activeFilters.forEach((filter) => {
        // Get the original filter definition from filters prop
        const filterDefinition = this.filters.find((f) => f.key === filter.key);

        if (
          filterDefinition &&
          filterDefinition.filterType &&
          filterDefinition.filterType !== "filter"
        ) {
          // If filter has a specific filterType (like filterWhereRelation, filterIn, filterDate),
          // keep it as is and force AND operation
          filter.filterType = filterDefinition.filterType;
          filter.forcedAnd = true; // Mark this filter as forced AND
        } else {
          // For standard filters with filterType: "filter", use global operator logic
          if (this.globalOperator === "||") {
            filter.filterType = "filterOr";
          } else {
            filter.filterType = "filter"; // AND operation
          }
          filter.forcedAnd = false;
        }
      });
    },

    enforceSingleSelectionForAnd() {
      // When AND is selected, keep only the first selection for each filter key
      const groupedFilters = this.groupFiltersByKey();

      Object.keys(groupedFilters).forEach((filterKey) => {
        const filtersForKey = groupedFilters[filterKey];
        if (filtersForKey.length > 1) {
          // Keep only the first filter
          const firstFilter = filtersForKey[0];

          // Update selectedValues to contain only the first selection
          this.selectedValues[filterKey] = [
            {
              id: firstFilter.value,
              name: firstFilter.name,
            },
          ];

          // Update active filters
          this.updateActiveFiltersForKey(filterKey);
        }
      });
    },

    selectFilter(filter) {
      this.selectedFilter = filter;
      this.currentStage = "values";
      this.animationDirection = "right";
      this.searchTerm = "";

      // Reset pagination for new filter
      this.resetPagination();

      // Initialize selectedValues for this filter if it doesn't exist
      if (!this.selectedValues[filter.key]) {
        this.selectedValues[filter.key] = [];

        // If there are existing active filters for this key, populate selectedValues
        const existingFilters = this.activeFilters.filter(
          (f) => f.key === filter.key
        );
        existingFilters.forEach((existingFilter) => {
          this.selectedValues[filter.key].push({
            id: existingFilter.value,
            name: existingFilter.name,
          });
        });
      }

      if (this.isDynamicData) {
        this.loadDynamicData();
      }
    },

    goBackToSelection() {
      this.currentStage = "selection";
      this.selectedFilter = null;
      this.searchTerm = "";
      this.resetPagination(); // Reset pagination when going back
      this.animationDirection = "left";
    },

    async loadDynamicData(search = "", isLoadMore = false) {
      if (!this.isDynamicData) return;

      // Set appropriate loading state
      if (isLoadMore) {
        this.loadingMore = true;
      } else {
        this.loading = true;
        // Reset pagination for new search or initial load
        this.currentPage = 1;
        this.hasMoreData = true;
        this.totalRecords = 0;
      }

      try {
        // Extract API model name and field configuration
        let apiModuleName, idField, displayField;

        if (typeof this.selectedFilter.data === "string") {
          // Legacy format: string model name
          apiModuleName = this.selectedFilter.data;
          idField = this.selectedFilter.id || "id";
          // Check if display field is specified on the filter definition first
          displayField =
            this.selectedFilter.display ||
            (apiModuleName === "User" ? "full_name" : "name");
        } else {
          // New format: object with model and field specifications
          const dataConfig = this.selectedFilter.data;
          apiModuleName = dataConfig.model;
          idField = dataConfig.id || "id";
          // Check filter definition first, then data config, then default
          displayField =
            this.selectedFilter.display || dataConfig.display || "name";
        }

        // Dynamic import of the API class (.ts extension)
        const apiModule = await import(
          `@/API/${apiModuleName}/${apiModuleName}.ts`
        );
        const ApiClass = apiModule.default;
        const api = new ApiClass();

        // Build selectFields dynamically
        const selectFields = `${idField}|${displayField}`;
        const filter = `${displayField}|null-null|!=`;

        const params = {
          select: selectFields,
          filter,
          perPage: this.perPage,
          page: this.currentPage,
        };

        if (search) {
          params.search = search;
        }

        const response = await api.getAll(params);

        // Handle different response formats
        let rawData = [];
        let recordsTotal = 0;

        if (Array.isArray(response)) {
          rawData = response;
          recordsTotal = response.length;
        } else if (response.data) {
          rawData = response.data || [];
          recordsTotal =
            response.recordsTotal || response.total || response.data.length;
        }

        // Transform data to consistent format
        const newOptions = rawData.map((item) => ({
          id: item[idField],
          name: item[displayField] || item[idField], // Fallback to id if display field is empty
        }));

        if (isLoadMore) {
          // Append to existing options
          this.dynamicOptions = [...this.dynamicOptions, ...newOptions];
          this.dynamicOptions = this.dynamicOptions.filter(
            (item, index, self) =>
              // item.name && // filter valid names
              index === self.findIndex((t) => t.name === item.name) // unique by name
          );
          console.log("New options if :", this.dynamicOptions);
        } else {
          // Replace options (new search or initial load)
          this.dynamicOptions = newOptions;
          this.dynamicOptions = this.dynamicOptions.filter(
            (item, index, self) =>
              // item.name && // filter valid names
              index === self.findIndex((t) => t.name === item.name) // unique by name
          );
          console.log("New optionselse :");
        }

        // Update pagination state
        this.totalRecords = recordsTotal;

        // Enhanced logic to determine if more data is available
        // Case 1: We have loaded all available records based on total count
        const hasReachedTotal = this.dynamicOptions.length >= recordsTotal;

        // Case 2: Current page returned empty data (no more records available)
        const currentPageEmpty = newOptions.length === 0;

        // Case 3: Current page returned fewer records than requested (partial page = last page)
        const partialPage = newOptions.length < this.perPage;

        // No more data if any of these conditions are true
        this.hasMoreData =
          !hasReachedTotal && !currentPageEmpty && !partialPage;

        // Log pagination status for debugging
        if (isLoadMore) {
          if (newOptions.length > 0) {
            console.log(
              `Page ${this.currentPage} loaded successfully (${newOptions.length} records)`
            );
          } else {
            // If we got no data, we might need to rollback the page increment
            console.log(
              `Pagination stopped: ${
                currentPageEmpty
                  ? "Empty page"
                  : partialPage
                  ? "Partial page"
                  : "Reached total"
              } - on page ${this.currentPage}`
            );
            // Rollback page increment if we got no data
            if (currentPageEmpty && this.currentPage > 1) {
              this.currentPage--;
              console.log(
                `Rolled back to page ${this.currentPage} due to empty response`
              );
            }
          }
        }
      } catch (error) {
        console.error("Error loading dynamic data:", error);
        if (!isLoadMore) {
          this.dynamicOptions = [];
        }
        this.hasMoreData = false;
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    onSearchInput() {
      if (this.isDynamicData) {
        this.debouncedSearch();
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        this.loadDynamicData(this.searchTerm);
      }, 300);
    },

    clearSearch() {
      this.searchTerm = "";
      if (this.isDynamicData) {
        this.loadDynamicData();
      }
    },

    onOptionsScroll(event) {
      if (!this.isDynamicData || this.loadingMore || !this.hasMoreData) {
        return;
      }

      const container = event.target;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Load more when user scrolls to 80% of the container
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8) {
        this.loadMoreData();
      }
    },

    async loadMoreData() {
      // Enhanced safeguards to prevent unnecessary requests
      if (!this.hasMoreData || this.loadingMore) {
        console.log("loadMoreData prevented:", {
          hasMoreData: this.hasMoreData,
          loadingMore: this.loadingMore,
          currentPage: this.currentPage,
          totalRecords: this.totalRecords,
          loadedRecords: this.dynamicOptions.length,
        });
        return;
      }

      // Additional check: if we already have all records, don't proceed
      if (
        this.dynamicOptions.length >= this.totalRecords &&
        this.totalRecords > 0
      ) {
        console.log("All records already loaded, stopping pagination");
        this.hasMoreData = false;
        return;
      }

      console.log("Loading more data for page:", this.currentPage + 1);

      // Increment page BEFORE making the API call for load more
      this.currentPage++;
      await this.loadDynamicData(this.searchTerm, true);
    },

    resetPagination() {
      this.currentPage = 1;
      this.hasMoreData = true;
      this.totalRecords = 0;
      this.loadingMore = false;
      this.dynamicOptions = [];
    },

    selectValue(option) {
      // Legacy method for backward compatibility - now just toggles value
      this.toggleValue(option);
    },

    toggleValue(option) {
      const filterKey = this.selectedFilter.key;

      if (!this.selectedValues[filterKey]) {
        this.selectedValues[filterKey] = [];
      }

      const existingIndex = this.selectedValues[filterKey].findIndex(
        (val) => val.id === option.id
      );

      if (existingIndex >= 0) {
        // Remove if already selected
        this.selectedValues[filterKey].splice(existingIndex, 1);
      } else {
        // Check if multiple selection is allowed
        if (
          !this.isMultipleSelectionAllowed &&
          this.selectedValues[filterKey].length > 0
        ) {
          // For AND operator, replace the existing selection
          this.selectedValues[filterKey] = [
            {
              id: option.id,
              name: option.name,
            },
          ];
        } else {
          // For OR operator or first selection, add to the array
          this.selectedValues[filterKey].push({
            id: option.id,
            name: option.name,
          });
        }
      }

      // Update active filters for this filter type
      this.updateActiveFiltersForKey(filterKey);

      // After selecting a value, return to active filters modal (first popup)
      // This allows users to see their selections and continue adding more filters
      setTimeout(() => {
        this.goBackToActiveFilters();
      }, 150); // Small delay to show the selection feedback
    },

    isValueSelected(option) {
      const filterKey = this.selectedFilter?.key;
      if (!filterKey || !this.selectedValues[filterKey]) {
        return false;
      }
      return this.selectedValues[filterKey].some((val) => val.id === option.id);
    },

    getSelectedValuesForCurrentFilter() {
      const filterKey = this.selectedFilter?.key;
      if (!filterKey || !this.selectedValues[filterKey]) {
        return [];
      }
      return this.selectedValues[filterKey];
    },

    removeSelectedValue(valueToRemove) {
      const filterKey = this.selectedFilter.key;
      if (!this.selectedValues[filterKey]) return;

      const index = this.selectedValues[filterKey].findIndex(
        (val) => val.id === valueToRemove.id
      );
      if (index >= 0) {
        this.selectedValues[filterKey].splice(index, 1);
        this.updateActiveFiltersForKey(filterKey);
      }
    },

    updateActiveFiltersForKey(filterKey) {
      const selectedVals = this.selectedValues[filterKey] || [];

      // Remove existing filters for this key
      this.activeFilters = this.activeFilters.filter(
        (f) => f.key !== filterKey
      );

      // Add new filters for each selected value
      if (selectedVals.length > 0) {
        // Find the filter definition from the filters prop
        const filterDefinition = this.filters.find((f) => f.key === filterKey);

        if (!filterDefinition) {
          console.warn(`Filter definition not found for key: ${filterKey}`);
          return;
        }

        // Determine the correct filterType based on filter definition and global operator
        let filterType;
        let forcedAnd = false;

        if (
          filterDefinition.filterType &&
          filterDefinition.filterType !== "filter"
        ) {
          // If filter has a specific filterType (like filterWhereRelation, filterIn, filterDate),
          // use it as is and force AND operation
          filterType = filterDefinition.filterType;
          forcedAnd = true;
        } else {
          // For standard filters with filterType: "filter", use global operator logic
          if (this.globalOperator === "||") {
            filterType = "filterOr";
          } else {
            filterType = "filter"; // AND operation
          }
          forcedAnd = false;
        }

        const baseFilter = {
          key: filterKey,
          title: filterDefinition.title,
          type: filterDefinition.type,
          filterType: filterType,
          forcedAnd: forcedAnd,
        };

        selectedVals.forEach((value, index) => {
          this.activeFilters.push({
            ...baseFilter,
            value: value.id,
            name: value.name,
            isMultipleSelection: selectedVals.length > 1,
            multipleSelectionIndex: index,
            multipleSelectionTotal: selectedVals.length,
          });
        });

        // If we just added a special filter, automatically switch to AND
        if (forcedAnd && this.globalOperator !== "&&") {
          this.globalOperator = "&&";
          this.updateAllFilterOperators();
          this.updateFilterTypes();
        }

        // Automatically adjust operators - multiple selections from same filter get OR operators
        this.adjustOperatorsForMultipleSelections();
      } else {
        // If no values selected for this key, also adjust operators
        this.adjustOperatorsForMultipleSelections();
      }
    },

    adjustOperatorsForMultipleSelections() {
      // Rebuild operators array considering multiple selections and global operator
      const filterGroups = this.groupFiltersByKey();
      const groupKeys = Object.keys(filterGroups);

      this.filterOperators = [];

      for (let i = 0; i < groupKeys.length; i++) {
        const currentGroup = filterGroups[groupKeys[i]];

        // Add OR operators within the same filter group (always OR for multiple selections)
        for (let j = 0; j < currentGroup.length - 1; j++) {
          this.filterOperators.push("||");
        }

        // Add global operator between different filter groups (except for the last group)
        if (i < groupKeys.length - 1) {
          this.filterOperators.push(this.globalOperator);
        }
      }
    },

    groupFiltersByKey() {
      const groups = {};
      this.activeFilters.forEach((filter) => {
        if (!groups[filter.key]) {
          groups[filter.key] = [];
        }
        groups[filter.key].push(filter);
      });
      return groups;
    },

    removeFilter(filter) {
      // If this is part of a multiple selection group, remove only this specific value
      if (filter.isMultipleSelection) {
        const filterKey = filter.key;
        const selectedVals = this.selectedValues[filterKey] || [];

        // Remove from selectedValues
        const valueIndex = selectedVals.findIndex(
          (val) => val.id === filter.value
        );
        if (valueIndex >= 0) {
          selectedVals.splice(valueIndex, 1);
        }

        // Update active filters
        this.updateActiveFiltersForKey(filterKey);
      } else {
        // Single selection - remove normally
        const index = this.activeFilters.findIndex(
          (f) => f.key === filter.key && f.value === filter.value
        );
        if (index >= 0) {
          this.activeFilters.splice(index, 1);

          // Also remove from selectedValues
          const filterKey = filter.key;
          if (this.selectedValues[filterKey]) {
            const valueIndex = this.selectedValues[filterKey].findIndex(
              (val) => val.id === filter.value
            );
            if (valueIndex >= 0) {
              this.selectedValues[filterKey].splice(valueIndex, 1);
            }
          }

          this.adjustOperatorsForMultipleSelections();
        }
        this.saveFilters();
      }
    },

    getOperatorBetween(index) {
      return this.filterOperators[index] || "&&";
    },

    updateOperatorBetween(index, operator) {
      if (index < this.filterOperators.length) {
        this.filterOperators[index] = operator;
      } else {
        this.filterOperators.push(operator);
      }
      // Don't emit changes immediately, wait for Save button
      // this.emitOperatorsChanged();
    },

    getOperatorBetweenGroups(groupIndex) {
      // Find the operator between filter groups, not individual filters
      const groups = this.groupedActiveFilters;
      if (groupIndex >= groups.length - 1) return "&&";

      // Calculate the position in the operators array
      let operatorIndex = 0;
      for (let i = 0; i < groupIndex; i++) {
        operatorIndex += groups[i].length; // Add the size of previous groups
        if (i < groupIndex) {
          operatorIndex += 1; // Add 1 for the AND/OR between groups
        }
      }
      operatorIndex += groups[groupIndex].length - 1; // Add OR operators within current group

      return this.filterOperators[operatorIndex] || "&&";
    },

    updateOperatorBetweenGroups(groupIndex, operator) {
      // Update the operator between filter groups
      const groups = this.groupedActiveFilters;
      if (groupIndex >= groups.length - 1) return;

      // Calculate the position in the operators array
      let operatorIndex = 0;
      for (let i = 0; i < groupIndex; i++) {
        operatorIndex += groups[i].length; // Add the size of previous groups
        if (i < groupIndex) {
          operatorIndex += 1; // Add 1 for the AND/OR between groups
        }
      }
      operatorIndex += groups[groupIndex].length - 1; // Add OR operators within current group

      if (operatorIndex < this.filterOperators.length) {
        this.filterOperators[operatorIndex] = operator;
      } else {
        // Extend array if needed
        while (this.filterOperators.length <= operatorIndex) {
          this.filterOperators.push("&&");
        }
        this.filterOperators[operatorIndex] = operator;
      }
    },

    emitOperatorsChanged() {
      this.$emit("operators-changed", this.filterOperators);
    },

    updateFilterOperator() {
      // This method is kept for backward compatibility but now emits operators array
      this.emitOperatorsChanged();
    },

    getSelectedCountForFilter(filterKey) {
      return this.selectedValues[filterKey]?.length || 0;
    },

    getFilterDescription(filter) {
      if (Array.isArray(filter.data)) {
        return `${filter.data.length} options available`;
      } else {
        return "Dynamic options from API";
      }
    },

    saveFilters() {
      // Only emit the main filters-saved event with all filters and operators
      // Don't emit individual filter-applied events to avoid multiple API calls
      this.$emit("filters-saved", {
        filters: [...this.activeFilters],
        operators: [...this.filterOperators],
      });

      this.closeAllModals();
    },

    clearAllFilters() {
      this.activeFilters = [];
      this.filterOperators = [];
      this.selectedValues = {};
      this.globalOperator = "&&"; // Reset to default AND operator
      this.$emit("filters-cleared");
      this.emitOperatorsChanged();
      this.closeAllModals();
    },

    // Public methods
    addFilter(filterData) {
      const existingIndex = this.activeFilters.findIndex(
        (f) => f.key === filterData.key
      );
      if (existingIndex >= 0) {
        this.activeFilters[existingIndex] = filterData;
      } else {
        this.activeFilters.push(filterData);
      }
    },

    getActiveFilters() {
      return this.activeFilters;
    },

    getFilterOperators() {
      return this.filterOperators;
    },

    getFilterOperator() {
      // Backward compatibility - returns first operator or default
      return this.filterOperators[0] || "&&";
    },
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.openActiveFiltersModal();
      } else if (!newVal && this.isModalOpen) {
        this.closeAllModals();
      }
    },

    // Watch for changes in active special filters
    hasActiveSpecialFilters(newVal, oldVal) {
      // If we now have special filters and global operator is OR, switch to AND
      if (newVal && this.globalOperator === "||") {
        this.globalOperator = "&&";
        this.updateAllFilterOperators();
        this.updateFilterTypes();
      }
      // Note: We don't automatically switch back to OR when special filters are removed
      // to avoid unexpected behavior. User can manually change it if needed.
    },
  },
};
</script>

<style scoped>
/* Modal Overlay */
.filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal Base */
.filter-modal {
  background: white;
  border-radius: 16px;
  width: 350px;
  max-width: 500px;
  max-height: 80vh;
  overflow: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  position: absolute;
  z-index: 1001;
}

/* All Modal Types - Same Styling */
.active-filters-modal,
.filter-selection-modal,
.filter-values-modal {
  transform: translateX(0);
  width: 80%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Active Filters Modal (First popup - center) */
.active-filters-modal {
  z-index: 1001;
}

/* Filter Selection Modal (Second popup - center, higher z-index) */
.filter-selection-modal {
  z-index: 1002;
}

/* Filter Values Modal (Third popup - center, highest z-index) */
.filter-values-modal {
  z-index: 1003;
}

/* Modal Animations */
.slide-in-center {
  animation: slideInCenter 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 80%;
}

.slide-in-right {
  animation: slideInFromBack 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 80%;
}

.slide-in-left {
  animation: slideInFromFront 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 80%;
}

@keyframes slideInCenter {
  from {
    opacity: 0;
    transform: translateX(0) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideInFromBack {
  from {
    opacity: 0;
    transform: translateX(0) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideInFromFront {
  from {
    opacity: 0;
    transform: translateX(0) scale(1.05);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 15px;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-weight: bold;
  color: #1f2937;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 16px;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
  transform: scale(1.05);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
}

.back-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.done-btn {
  background: #6e3894;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.done-btn:hover {
  background: #5b2d7a;
  transform: translateY(-1px);
}

/* Modal Body */
.modal-body {
  padding: 4px 14px;
  height: fit-content;
  overflow-y: visible;
  background-color: #f8f8f8;
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-weight: 600;
  color: #374151;
  font-size: 16px;
}

.clear-all-btn {
  cursor: pointer;
  padding: 1px 25px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  color: #43235c;
  border: 1px solid #43235c;
  border-radius: 10px;
  height: 25px;
}

.active-filters-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* Old active-filter-chip styles are replaced by active-filter-chip-full */
.active-filter-chip {
  display: none; /* Hidden as we're using active-filter-chip-full now */
}

@keyframes chipSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.filter-label {
  opacity: 0.9;
  background-color: #ffffff;
  border-radius: 10px;
  width: 45%;
  font-weight: 500;
  text-align: center;
  color: black;
  height: 23px;
  align-content: center;
}

.filter-value {
  font-weight: 500;
  background-color: #ffffff;
  border-radius: 10px;
  width: 65%;
  text-align: center;
  color: black;
  height: 23px;
  align-content: center;
}

.remove-filter-btn {
  background: none;
  border: none;
  color: rgb(0, 0, 0);
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.remove-filter-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.add-filter-btn {
  padding: 4px 0px;
  border: none;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #8c8c8c;
  background: none;
}

.add-filter-btn i {
  font-size: 12px;
}

/* Filter Actions Section */
.filter-actions-section {
  margin-top: 10px;
}

.action-buttons-section {
  margin-top: 1px;
  padding-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: end;
}

.save-filters-btn {
  background: #43235c;
  color: white;
  padding: 8px 30px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  height: 25px;
}

/* Filter Selection Modal */
.filter-options-grid {
  display: grid;
  gap: 12px;
}

.filter-option-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  border-radius: 10px;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.filter-option-card:hover {
  border-color: #6e3894;
  background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(110, 56, 148, 0.1);
}

.filter-option-card.has-selections {
  border-color: #6e3894;
  background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.15);
}

.filter-option-content {
  flex: 1;
}

.filter-option-title {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.selection-count {
  font-size: 11px;
  color: #6e3894;
  font-weight: 500;
  background: rgba(110, 56, 148, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.filter-option-arrow {
  color: #d1d5db;
  font-size: 14px;
}

/* Search Container */
.search-container {
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  font-size: 12px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 5px 1px 6px 30px;
  border: 2px solid #f1f5f9;
  border-radius: 10px;
  font-size: 12px;
  background: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Options Container */
.options-container {
  max-height: 300px;
  overflow-y: auto;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.loading-spinner {
  margin-bottom: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #6e3894;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* Loading More State */
.loading-more-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 8px;
  margin-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.loading-spinner-small {
  display: flex;
  align-items: center;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid #6e3894;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-more-text {
  color: #6b7280;
  font-size: 12px;
  margin: 0;
  font-style: italic;
}

/* End of Results */
.end-of-results {
  display: flex;
  justify-content: center;
  padding: 16px;
  margin-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.end-text {
  color: #9ca3af;
  font-size: 12px;
  margin: 0;
  font-style: italic;
  text-align: center;
}

/* Debug Info */
.debug-info {
  margin-top: 8px;
  padding: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.debug-info small {
  color: #6b7280;
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
  font-size: 10px;
}

/* Options List */
.options-list {
  display: grid;
  gap: 8px;
}

.option-item {
  padding: 4px 16px;
  border: 2px solid #f1f5f9;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.option-item:hover {
  border-color: #6e3894;
  background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%);
}

/* Disabled Option Styles */
.option-item.option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
  border-color: #e5e7eb;
}

.option-item.option-disabled:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.option-item.option-disabled .option-name {
  color: #9ca3af;
}

.option-item.option-disabled .checkbox-input {
  cursor: not-allowed;
}

.option-item.option-disabled .checkbox-custom {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* Selected Option Highlight */
.option-item.option-selected {
  border-color: #6e3894;
  background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%);
}

/* Disabled Reason Text */
.disabled-reason {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #e5e7eb;
}

.disabled-reason small {
  color: #6b7280;
  font-style: italic;
  font-size: 11px;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.option-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  flex: 1;
}

.option-checkbox {
  position: relative;
  display: flex;
  align-items: center;
}

.checkbox-input {
  opacity: 0;
  position: absolute;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.checkbox-input:checked + .checkbox-custom {
  background: #6e3894;
  border-color: #6e3894;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: "✓";
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-custom:hover {
  border-color: #6e3894;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
}

.option-check {
  color: #6e3894;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* Selected Values Summary */
.selected-values-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.selected-count {
  font-size: 12px;
  font-weight: 600;
  color: #6e3894;
  margin-bottom: 8px;
}

.selected-values-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selected-value-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #6e3894;
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.remove-selected-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.remove-selected-btn:hover {
  opacity: 1;
}

/* Filter Groups */
.filter-group {
  width: 100%;
  margin-bottom: 8px;
}

.filter-group-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
}

.filter-chips-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.filter-chips-container.multiple-selection {
  padding: 6px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

.inline-operator {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

/* No Results State */
.no-results-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 10px;
  text-align: center;
}

.no-results-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 20px;
  margin-bottom: 16px;
}

.no-results-text {
  color: #374151;
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 8px 0;
}

.no-results-desc {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* Scrollbar Styling */
.modal-body::-webkit-scrollbar,
.options-container::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track,
.options-container::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb,
.options-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

/* Filter Operator Styles */
.filter-operator-between {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
}

.operator-selector {
  position: relative;
  display: inline-block;
}

.operator-select-inline {
  padding: 4px 24px 4px 8px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
  text-align: center;
  height: 31px;
}

.operator-select-inline:hover {
  border-color: #6e3894;
  background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%);
}

.operator-select-inline:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.select-arrow-inline {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  font-size: 10px;
}

.active-filters-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}

/* Vertical Layout Styles */
.filter-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.filter-operator-row {
  display: flex;
  justify-content: flex-start;
  width: 30%;
  margin-bottom: 4px;
}

.operator-selector-full {
  position: relative;
  width: 50%;
}

.operator-select-full {
  width: 100%;
  padding: 6px 20px 6px 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.operator-select-full:hover {
  border-color: #6e3894;
  background: linear-gradient(135deg, #faf7ff 0%, #f3f0ff 100%);
}

.operator-select-full:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.select-arrow-full {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  font-size: 10px;
}

.active-filter-chip-full {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: white;
  padding: 4px 6px;
  border-radius: 10px;
  border: 2px solid #d1d5db;
  font-size: 12px;
  font-weight: 500;
  animation: chipSlideIn 0.3s ease-out;
  width: 100%;
  background-color: #d9d9d9;
}

/* Remove old operator styles that are no longer needed */
.filter-operator-section {
  display: none;
}

.operator-badge {
  display: none;
}

.filter-operator-display {
  display: none;
}

/* Global Operator Section Styles */
.global-operator-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
  margin-bottom: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  gap: 2px;
}

.global-operator-label {
  flex-shrink: 0;
}

.global-operator-label label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  margin: 0;
  display: block;
}

.operator-help-text {
  display: block;
  color: #6b7280;
  font-size: 11px;
  margin-top: 2px;
  font-style: italic;
}

.global-operator-selector {
  position: relative;
  min-width: 70px;
}

.global-operator-select {
  width: 100%;
  padding: 8px 30px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.global-operator-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-arrow-global {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  font-size: 12px;
}

/* Global Operator Indicator */
.global-operator-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
  margin: 8px 0;
}

.operator-text {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.modal-body::-webkit-scrollbar-thumb:hover,
.options-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* No Filters Available States */
.no-filters-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: 200px;
}

.no-filters-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.no-filters-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.no-filters-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 24px;
  max-width: 300px;
}

.close-modal-btn {
  background: #6e3894;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-modal-btn:hover {
  background: #5a2d76;
  transform: translateY(-1px);
}

/* Forced AND Indicator Styles */
.active-filter-chip-full.forced-and {
  border-left: 3px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.forced-and-indicator {
  color: #d97706;
  font-size: 10px;
  margin-left: 4px;
  margin-right: 4px;
}

.forced-and-indicator i {
  animation: pulse-lock 2s infinite;
}

@keyframes pulse-lock {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Enhanced disabled reason styling */
.disabled-reason {
  margin-top: 4px;
  padding: 2px 8px;
  background: #fef2f2;
  border-left: 2px solid #f87171;
  border-radius: 4px;
}

.disabled-reason small {
  color: #dc2626;
  font-weight: 500;
}

/* Special filters notice */
.special-filters-notice {
  color: #d97706;
  font-weight: 500;
  font-size: 10px;
}

.special-filters-notice i {
  margin-right: 3px;
  font-size: 8px;
}

/* Operator disabled notice */
.operator-disabled-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 11px;
  color: #92400e;
}

.operator-disabled-notice i {
  color: #f59e0b;
  font-size: 12px;
}

/* Disabled global operator select */
.global-operator-select:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.global-operator-select:disabled:focus {
  border-color: #d1d5db;
  box-shadow: none;
}

/* Disabled option styling */
.global-operator-select option:disabled {
  color: #9ca3af;
  background-color: #f3f4f6;
}

/* No Filters Available - Small Version (for main modal) */
.no-filters-available {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 8px 0;
}

.no-filters-icon-small {
  flex-shrink: 0;
  font-size: 24px;
  color: #9ca3af;
}

.no-filters-text {
  flex: 1;
}

.no-filters-text h6 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.no-filters-text p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-modal {
    width: 300px;
    max-width: 300px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .active-filters-content {
    gap: 6px;
  }

  .active-filter-chip {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>
