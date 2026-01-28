<template>
  <div
    class="subtopic-item"
    :class="{ 'has-comment': hasComments && agendaDetails.status !== 'draft' }"
  >
    <div class="subtopic-row">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :value="subtopic.id"
          :checked="isSelected"
          @change="handleSelectionChange"
          :disabled="agendaDetails.status !== 'draft'"
        />
        <span class="subtopic-name">{{ subtopic.name }}</span>
        <span v-if="isAssignedToOtherAgenda" class="assigned-indicator">
          ({{ $t("agenda.deferred_from_another") }})
        </span>
      </label>

      <StatusSection
        v-if="agendaDetails.status !== 'draft'"
        :subtopic-id="subtopic.id"
        :status-data="computedStatusData"
        :display-actions="displayActions"
        @update-status="$emit('update-status', $event)"
        @open-reject-dialog="$emit('open-reject-dialog')"
      />
    </div>

    <CommentsSection
      v-if="hasComments && agendaDetails.status !== 'draft'"
      :status-data="computedStatusData"
    />
  </div>
</template>

<script>
import StatusSection from "./StatusSection.vue";
import CommentsSection from "./CommentsSection.vue";

export default {
  name: "SubtopicItem",
  components: { StatusSection, CommentsSection },
  props: {
    subtopic: { type: Object, required: true },
    agendaDetails: { type: Object, required: true },
    isSelected: { type: Boolean, required: true },
    displayActions: { type: Boolean, required: true },
    statusData: { type: Object, default: () => ({}) },
  },
  emits: ["update-selection", "update-status", "open-reject-dialog"],
  computed: {
    isAssignedToOtherAgenda() {
      return (
        this.subtopic.agenda_id &&
        this.subtopic.agenda_id !== this.agendaDetails.id &&
        this.subtopic.agenda_status === "deferred"
      );
    },
    computedStatusData() {
      // If subtopic is deferred and assigned to another agenda
      // Override status to 'pending' and clear comments
      if (this.isAssignedToOtherAgenda) {
        return {
          ...this.statusData,
          agenda_status: "pending",
          agenda_status_comment: "",
        };
      }
      return this.statusData;
    },
    hasComments() {
      // Use computedStatusData instead of statusData
      return this.computedStatusData?.agenda_status_comment?.trim().length > 0;
    },
  },
  methods: {
    handleSelectionChange(event) {
      const isChecked = event.target.checked;
      console.log("✅ SubtopicItem checkbox:", {
        subtopicId: this.subtopic.id,
        isChecked,
      });

      this.$emit("update-selection", {
        subtopicId: this.subtopic.id,
        isChecked: isChecked,
      });
    },
  },
};
</script>

<style scoped>
.subtopic-item {
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  padding: 0;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.subtopic-item:last-child {
  margin-bottom: 12px;
}

.subtopic-item:hover {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.subtopic-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  min-height: 52px;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  line-height: 20px;
  flex: 1;
  gap: 10px;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
  width: 18px;
  height: 18px;
  min-width: 18px;
  border: 1.5px solid #d1d5db;
  border-radius: 3px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: white;
  position: relative;
  transition: all 0.15s ease;
}

.checkbox-label input[type="checkbox"]:hover:not(:disabled) {
  border-color: #9ca3af;
}

.checkbox-label input[type="checkbox"]:checked {
  background-color: #6b21a8;
  border-color: #6b21a8;
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background-color: #f3f4f6;
}

.subtopic-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.assigned-indicator {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
  margin-left: 4px;
  white-space: nowrap;
}

/* Approved status background */
.subtopic-item.has-comment:has(.status-approved) {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.subtopic-item.has-comment:has(.status-approved) .subtopic-row {
  background: transparent;
}

/* Rejected status background */
.subtopic-item.has-comment:has(.status-rejected) {
  background: #fef2f2;
  border-color: #fecaca;
}

.subtopic-item.has-comment:has(.status-rejected) .subtopic-row {
  background: transparent;
}
</style>