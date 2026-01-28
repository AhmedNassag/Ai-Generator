<template>
  <v-card-title class="d-flex justify-space-between align-center mb-4">
    <span>{{ $t("agenda.select_topics") }}</span>

    <div class="header-actions-group">
      <!-- Custom Status Dropdown -->
      <v-menu
        v-if="isHead"
        :close-on-content-click="true"
        location="bottom"
        :disabled="isUpdatingAgendaStatus || !displayActions"
      >
        <template v-slot:activator="{ props }">
          <div
            v-bind="props"
            :class="['status-dropdown-container', { 'disabled': isUpdatingAgendaStatus || !displayActions }]"
          >
            <span :class="['status-pill-display', agendaDetails.status]">
              {{ getStatusLabel(agendaDetails.status) }}
            </span>
            <v-icon size="18" class="dropdown-arrow">mdi-chevron-down</v-icon>
          </div>
        </template>

        <v-card class="status-dropdown-card" elevation="8">
          <div class="status-pills-list">
            <button
              v-for="option in agendaStatusOptions"
              :key="option.value"
              :class="['status-pill-item', option.value, { 'active': option.value === agendaDetails.status }]"
              @click="$emit('update-agenda-status', option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </v-card>
      </v-menu>

      <v-btn
        v-if="displayActions"
        color="deep-purple"
        variant="elevated"
        @click="$emit('save-topics')"
        :disabled="isSaving"
        :loading="isSaving"
        class="save-topics-btn"
      >
        {{ isSaving ? $t("agenda.saving") : `${$t("agenda.save_selection")} (${selectedSubtopicsCount})` }}
      </v-btn>
      <div v-else></div>
    </div>
  </v-card-title>
</template>

<script>
export default {
  name: "CardHeader",
  props: {
    agendaDetails: { type: Object, required: true },
    agendaStatusOptions: { type: Array, required: true },
    selectedSubtopicsCount: { type: Number, required: true },
    displayActions: { type: Boolean, required: true },
    isUpdatingAgendaStatus: { type: Boolean, required: true },
    isSaving: { type: Boolean, required: true },
    isHead: { type: Boolean, required: true },
  },
  emits: ['update-agenda-status', 'save-topics'],
  methods: {
    getStatusLabel(status) {
      const option = this.agendaStatusOptions.find(opt => opt.value === status);
      return option ? option.label : status;
    },
    getAgendaStatusColor(status) {
      const colors = {
        draft: "#D9D9D9",
        in_review: "orange",
        confirmed: "success",
        rejected: "error",
      };
      return colors[status] || "grey";
    },
    getAgendaStatusIcon(status) {
      const icons = {
        draft: "mdi-file-document-outline",
        in_review: "mdi-eye-check",
        confirmed: "mdi-check-circle",
        rejected: "mdi-close-circle",
      };
      return icons[status] || "mdi-help-circle";
    },
  },
};
</script>

<style scoped>
.header-actions-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Status Dropdown Container (White Background) */
.status-dropdown-container {
  display: flex;
  align-items: center;
  gap: 25px;
  /* padding: 6px 6px 10px 6px; */
  padding: 4px;
  background-color: white;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 130px;
}

.status-dropdown-container:hover:not(.disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #BDBDBD;
}

.status-dropdown-container.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dropdown-arrow {
  color: #757575;
  transition: transform 0.2s ease;
}

/* Status Pill Display (Inside Container) */
.status-pill-display {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
}

/* Status Colors for Display Pill */
.status-pill-display.draft {
  background-color: #D9D9D9;
}

.status-pill-display.in_review {
  color: #C4951B;
  background-color: #EBDCB3;
}

.status-pill-display.rejected {
  background-color: #E2B6B6;
}

.status-pill-display.approved,
.status-pill-display.confirmed {
  background-color: #B6CAAE;
}

.status-pill-display.deferred {
  background-color: #D0B5E3;
}

/* Dropdown Card */
.status-dropdown-card {
  border-radius: 12px;
  overflow: hidden;
  min-width: 140px;
}

.status-pills-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Status Pills in Dropdown */
.status-pill-item {
  width: 100%;
  padding: 6px 14px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  color: white;
}

.status-pill-item:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-pill-item.active {
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

/* Draft Status */
.status-pill-item.draft {
  background-color: #D9D9D9;
}

/* In Review Status */
.status-pill-item.in_review {
  background-color: #EBDCB3;
  color: #C4951B;
}

/* Rejected Status */
.status-pill-item.rejected {
  background-color: #E2B6B6;
  color: #A92525;
}

/* Approved/Confirmed Status */
.status-pill-item.approved,
.status-pill-item.confirmed {
  background-color: #B6CAAE;
  color: #255F0B;
}

/* Deferred Status */
.status-pill-item.deferred {
  background-color: #D0B5E3;
  color: #6E3894;
}

/* Save Button */
.save-topics-btn {
  min-width: 93px;
  height: 36px;
  font-weight: 600;
  text-transform: none;
  border-radius: 10px;
  /* box-shadow: 0 2px 8px rgba(68, 34, 92, 0.2); */
  background-color:#6E3894 !important;
}

@media (max-width: 768px) {
  .header-actions-group {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .status-dropdown-button,
  .save-topics-btn {
    min-width: 100%;
  }
}
</style>