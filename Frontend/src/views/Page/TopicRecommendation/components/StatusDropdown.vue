<template>
  <div class="status-dropdown-wrapper">
    <v-select
      :model-value="item.status"
      :items="statusOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="solo"
      flat
      hide-details
      :disabled="statusLoading || item.status === 'completed'"
      :loading="statusLoading"
      @update:model-value="handleChange"
      class="status-select"
      :class="getStatusClass(item.status)"
      :menu-props="{
        contentClass: 'status-dropdown-menu',
        offset: 8,
        transition: 'slide-y-transition'
      }"
    >
      <template v-slot:selection="{ item: selectionItem }">
        <div class="status-badge" :class="getStatusClass(selectionItem.value)">
          <span class="status-text">{{ selectionItem.title }}</span>
          <v-icon v-if="!statusLoading && selectionItem.value !== 'completed'" 
                  size="16" 
                  class="dropdown-icon">
            mdi-chevron-down
          </v-icon>
        </div>
      </template>
      
      <template v-slot:item="{ props, item: menuItem }">
        <v-list-item
          v-bind="props"
          :class="['status-menu-item', getStatusClass(menuItem.value)]"
          class="custom-list-item"
        >
          <template v-slot:title>
            <span class="menu-item-text">{{ menuItem.title }}</span>
          </template>
          <template v-slot:append>
            <v-icon v-if="menuItem.value === item.status" color="success" size="18">
              mdi-check
            </v-icon>
          </template>
        </v-list-item>
      </template>
      
      <template v-slot:append-inner>
        <!-- Empty template to remove default append icon -->
      </template>
    </v-select>
  </div>
</template>

<script>
export default {
  name: "StatusDropdown",
  props: {
    item: {
      type: Object,
      required: true
    },
    statusOptions: {
      type: Array,
      required: true
    },
    statusLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['change-status'],
  methods: {
    getStatusClass(status) {
      return {
        'status-open': status === 'open',
        'status-progress': status === 'in_progress',
        'status-completed': status === 'completed',
      };
    },
    handleChange(newStatus) {
      if (newStatus !== this.item.status) {
        this.$emit('change-status', {
          item: this.item,
          newStatus: newStatus
        });
      }
    }
  }
};
</script>

<style scoped>
.status-dropdown-wrapper {
  display: inline-block;
  min-width: 150px;
}

.status-select {
  width: 100%;
}

/* Remove ALL Vuetify default styles and icons */
::v-deep(.v-field) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

::v-deep(.v-field__outline) {
  display: none !important;
}

::v-deep(.v-field__input) {
  padding: 0 !important;
  min-height: auto !important;
  overflow: hidden !important;
}

::v-deep(.v-field__append-inner) {
  display: none !important;
}

::v-deep(.v-select__selection) {
  width: 100%;
  overflow: hidden !important;
}

::v-deep(.v-field__overlay) {
  display: none !important;
}

/* Hide the default Vuetify dropdown arrow completely */
::v-deep(.v-select .v-field__append-inner .v-icon) {
  display: none !important;
}

::v-deep(.mdi-menu-down) {
  display: none !important;
}

/* Status Badge Styling */
.status-badge {
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  width: 80% !important;
  overflow: hidden;
  white-space: nowrap;
}

.status-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  opacity: 0.6;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.status-badge:hover .dropdown-icon {
  opacity: 1;
}

/* Status Colors for Badge */
.status-open .status-badge {
  background-color: #EBDCB3;
  color: #C4951B;
}

.status-open .status-badge:hover {
  background-color: #EBDCB3;
}

.status-progress .status-badge {
  background-color: #D0B5E3;
  color: #6E3894;
}

.status-progress .status-badge:hover {
  background-color: #D0B5E3;
}

.status-completed .status-badge {
  background-color: #B6CAAE;
  color: #255F0B;
  cursor: default;
}

/* Disabled state */
::v-deep(.v-select--disabled) .status-badge {
  opacity: 0.9;
  cursor: not-allowed;
}

::v-deep(.v-select--disabled) .dropdown-icon {
  display: none;
}

/* Loading State */
::v-deep(.v-progress-circular) {
  width: 16px !important;
  height: 8px !important;
}
</style>

<style>
/* Global styles for dropdown menu - must be unscoped */
.status-dropdown-menu {
  border-radius: 12px !important;
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important; */
  /* padding: 8px !important; */
  margin-top: 4px !important;
  min-width: 180px !important;
  max-width: 200px !important;
}

.status-dropdown-menu .v-list {
  padding: 4px !important;
  background: #FFFFFF !important;
}

/* Menu Item Base Styling */
.status-dropdown-menu .custom-list-item {
  border-radius: 10px !important;
  margin: 4px 0 !important;
  /* padding: 10px 14px !important; */
  min-height: 50px !important;
  transition: background-color 0.2s ease, transform 0.15s ease !important;
  cursor: pointer !important;
  overflow: hidden !important;
}

.status-dropdown-menu .custom-list-item:first-child {
  margin-top: 0 !important;
}

.status-dropdown-menu .custom-list-item:last-child {
  margin-bottom: 0 !important;
}

/* Menu Item Text */
.menu-item-text {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Colors for Menu Items */
.status-dropdown-menu .custom-list-item.status-open {
  background-color: #EBDCB3 !important;
  color: #C4951B !important;
}

.status-dropdown-menu .custom-list-item.status-open:hover {
  background-color: #EBDCB3 !important;
  transform: scale(1.02);
}

.status-dropdown-menu .custom-list-item.status-progress {
  background-color: #D0B5E3 !important;
  color: #6E3894 !important;
}

.status-dropdown-menu .custom-list-item.status-progress:hover {
  background-color: #D0B5E3 !important;
  transform: scale(1.02);
}

.status-dropdown-menu .custom-list-item.status-completed {
  background-color: #B6CAAE !important;
  color: #255F0B !important;
}

.status-dropdown-menu .custom-list-item.status-completed:hover {
  background-color: #B6CAAE !important;
  transform: scale(1.02);
}

/* Remove default Vuetify hover effects */
.status-dropdown-menu .v-list-item__overlay {
  display: none !important;
}

.status-dropdown-menu .v-list-item--active {
  background: transparent !important;
}

/* Active item indicator (checkmark styling) */
.status-dropdown-menu .v-list-item .v-icon {
  margin-left: 8px;
  flex-shrink: 0;
}

.status-dropdown-menu .v-list-item__content {
  overflow: hidden !important;
}
</style>