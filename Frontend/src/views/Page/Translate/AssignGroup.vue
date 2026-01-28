<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    max-width="480"
    persistent
    :content-class="isOpen ? 'overflow-visible' : ''"
  >
    <v-card class="group-select-modal">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center rtl">
        <span class="modal-title">Select or Create Group</span>
        <v-btn
          icon
          variant="text"
          @click="closeModal"
          size="x-small"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="card-content-wrapper">
        <!-- Group Selection -->
        <div class="group-selection">
          <span class="selection-label">Group</span>
          <VueSelect
            v-model="selectedGroupName"
            :options="groupOptions"
            :taggable="true"
            :create-option="(group) => group"
            :push-tags="true"
            placeholder="Select or type a group name"
            class="group-select"
            :clearable="false"
          >
            <template #option="{ label }">
              <div class="group-option">
                <span class="group-name">{{ label }}</span>
              </div>
            </template>

            <template #selected-option="{ label }">
              <div class="selected-group">
                <span class="group-name">{{ label }}</span>
              </div>
            </template>

            <template #no-options>
              <span class="no-options-text">Type to create a new group...</span>
            </template>
          </VueSelect>
          <small class="form-text text-muted">
            Select an existing group or type to create a new one
          </small>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="actions pa-6">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          class="cancel-btn mr-3"
          min-width="96"
          height="40"
          @click="closeModal"
        >
          Cancel
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          class="save-btn"
          min-width="96"
          height="40"
          @click="saveChanges"
          :disabled="!selectedGroupName"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  name: "GroupSelectModal",

  components: {
    VueSelect,
  },

  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    groups: {
      type: Array,
      default: () => [],
      // Expected format: [{ id: 1, name: 'Group Name' }] or ['Group1', 'Group2']
    },
    currentGroupName: {
      type: [String, null],
      default: null,
    },
  },

  emits: ["update:isOpen", "save", "close"],

  data() {
    return {
      selectedGroupName: null,
    };
  },

  computed: {
    groupOptions() {
      // Convert groups to array of strings for the select
      return this.groups.map((g) => {
        if (typeof g === 'string') return g;
        return g.name || g.group;
      });
    },
  },

  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.selectedGroupName = this.currentGroupName;
        console.log("Modal opened, current group:", this.currentGroupName);
      }
    },
    currentGroupName: {
      immediate: true,
      handler(newVal) {
        this.selectedGroupName = newVal;
        console.log("Current group name changed to:", newVal);
      },
    },
  },

  methods: {
    closeModal() {
      this.selectedGroupName = this.currentGroupName;
      this.$emit("update:isOpen", false);
      this.$emit("close");
    },

    saveChanges() {
      if (!this.selectedGroupName) {
        return;
      }

      // Find if this is an existing group or a new one
      const existingGroup = this.groups.find((g) => {
        const groupName = typeof g === 'string' ? g : (g.name || g.group);
        return groupName === this.selectedGroupName;
      });

      this.$emit("save", {
        name: this.selectedGroupName,
        isNew: !existingGroup,
        group: existingGroup || { name: this.selectedGroupName },
      });
      this.$emit("update:isOpen", false);
    },
  },
};
</script>

<style>
.v-overlay--active .v-overlay__content {
  overflow: visible !important;
}
</style>

<style scoped>
.group-select-modal {
  border-radius: 12px;
  background-color: white;
  overflow: visible !important;
}

.v-card-title {
  padding: 24px 24px 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: #1a1a1a;
}

.card-content-wrapper {
  padding: 20px 24px 0 !important;
  overflow: visible !important;
}

.group-selection {
  width: 100%;
  position: relative;
  overflow: visible !important;
}

.selection-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #1a1a1a;
  margin-bottom: 6px;
  display: block;
}

.group-select {
  margin-top: 8px;
}

.form-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
}

.text-muted {
  color: #6c757d;
}

.group-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
}

.selected-group {
  display: flex;
  align-items: center;
}

.group-name {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.no-options-text {
  font-size: 13px;
  color: #6c757d;
  font-style: italic;
}

.actions {
  padding: 24px !important;
  margin-top: 20px;
}

.cancel-btn {
  border: 1px solid #6b46c1 !important;
  color: #6b46c1 !important;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.25px;
  text-transform: none;
  border-radius: 20px;
  padding: 8px 24px;
}

.save-btn {
  background: #6e3894 !important;
  color: white !important;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.25px;
  text-transform: none;
  border-radius: 20px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05) !important;
  padding: 8px 24px !important;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* vue-select custom styles */
:deep(.v-select) {
  position: relative;
}

:deep(.vs__dropdown-toggle) {
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 6px;
  padding: 4px 8px;
  min-height: 40px;
  background-color: white;
}

:deep(.vs__dropdown-toggle:hover) {
  border-color: #6b46c1;
}

:deep(.vs--open .vs__dropdown-toggle) {
  border-color: #6b46c1;
  border-bottom-color: #6b46c1;
}

:deep(.vs__selected) {
  margin: 0;
  padding: 0;
}

:deep(.vs__search) {
  margin: 0;
  padding: 4px 0;
}

:deep(.vs__actions) {
  padding: 4px 6px;
}

:deep(.vs__dropdown-menu) {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  box-shadow: 0px 4px 6px -2px rgba(0, 0, 0, 0.05),
    0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 250px;
  overflow-y: auto;
}

:deep(.vs__dropdown-option) {
  padding: 10px 12px;
}

:deep(.vs__dropdown-option--highlight) {
  background-color: rgba(107, 70, 193, 0.08);
  color: #1a1a1a;
}

:deep(.vs__dropdown-option--selected) {
  background-color: rgba(107, 70, 193, 0.12);
  color: #6b46c1;
}

:deep(.vs__no-options) {
  padding: 10px 12px;
  text-align: center;
}

@media (max-width: 600px) {
  .actions {
    flex-direction: column-reverse;
    gap: 12px;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    margin: 0;
  }
}
[dir="rtl"] .group-selection {
    text-align: end;
}
</style>