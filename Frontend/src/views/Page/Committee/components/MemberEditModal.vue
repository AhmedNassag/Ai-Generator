<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    max-width="480"
    persistent
  >
    <v-card class="member-edit-modal">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="modal-title">{{ $t('committee.edit_members') }}</span>
        <v-btn
          icon
          variant="text"
          @click="closeModal"
          size="x-small"
          class="close-btn"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text>
        <div class="member-selection">
          <span class="selection-label">{{ $t('committee.committee_members') }} <span class="required">*</span></span>
          <v-select
            v-model="selectedMembers"
            :items="filteredUsers"
            item-title="full_name"
            item-value="id"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mt-2 members-select"
            hide-details
            :menu-props="{ maxHeight: '300' }"
            bg-color="white"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip
                v-if="index < 3"
                class="member-chip"
                :class="{ 'ml-1': index > 0 }"
                closable
                size="small"
                variant="outlined"
                @click:close="removeChip(item.value)"
              >
                <v-avatar size="20" class="member-avatar">
                  <span class="avatar-text">{{ getInitials(item.title) }}</span>
                </v-avatar>
              </v-chip>
              <span v-else-if="index === 3" class="more-members ml-2">
                +{{ selectedMembers.length - 3 }} more
              </span>
            </template>

            <template v-slot:item="{ item, props }">
              <v-list-item
                v-bind="props"
                :class="{ 'selected-item': selectedMembers.includes(item.value) }"
                class="custom-list-item"
              >
                <template v-slot:prepend>
                  <v-avatar size="32" class="item-avatar">
                    <span class="avatar-text">{{ getInitials(item.title) }}</span>
                  </v-avatar>
                </template>
                <template v-slot:append v-if="selectedMembers.includes(item.value)">
                  <v-icon color="#6b46c1" size="20">mdi-check</v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>
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
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          class="save-btn"
          min-width="96"
          height="40"
          @click="saveChanges"
        >
          {{ $t('common.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch, computed } from "vue";

export default {
  props: {
    isOpen: Boolean,
    users: Array,
    currentMembers: Array,
    currentHeadsOfCommittee: Array,
  },

  emits: ["update:isOpen", "save", "close"],

  setup(props, { emit }) {
    const selectedMembers = ref([...props.currentMembers]);

    const getInitials = (name) => {
      if (!name) return "";
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    };

    const removeChip = (id) => {
      selectedMembers.value = selectedMembers.value.filter(
        (memberId) => memberId !== id
      );
    };

    const filteredUsers = computed(() => {
      return props.users.filter(
        (user) => !props.currentHeadsOfCommittee.includes(user.id)
      );
    });

    watch(
      () => props.currentMembers,
      (newVal) => {
        selectedMembers.value = [...newVal];
      }
    );

    // Watch for modal opening and reset to original values
    watch(
      () => props.isOpen,
      (newVal) => {
        if (newVal) {
          selectedMembers.value = [...props.currentMembers];
        }
      }
    );

    const closeModal = () => {
      // Reset to original values when closing without saving
      selectedMembers.value = [...props.currentMembers];
      emit("update:isOpen", false);
      emit("close");
    };

    const saveChanges = () => {
      emit("save", [...selectedMembers.value]);
      emit("update:isOpen", false);
    };

    return {
      selectedMembers,
      filteredUsers,
      closeModal,
      saveChanges,
      removeChip,
      getInitials,
    };
  },
};
</script>

<style scoped>
.member-edit-modal {
  border-radius: 12px;
  background-color: white;
  overflow: hidden;
}

.v-card-title {
  padding: 24px 24px 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: #000000;
}

.v-card-text {
  padding: 20px 24px 0 !important;
}

.member-selection {
  width: 100%;
}

.selection-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #000000;
  margin-bottom: 6px;
  display: block;
}

.member-chip {
  /* background-color: transparent !important; */
  border: 1px solid #6b46c1 !important;
  color: #929096 !important;
  font-size: 14px;
  font-weight: 500;
  height: 28px !important;
  width: 28px !important;
  min-width: 28px !important;
  padding: 4px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.member-avatar {
  background: #EBDCB3 !important;
  margin: 0 !important;
}

.avatar-text {
  color: #C4951B;
  font-size: 10px;
  font-weight: 600;
}

.item-avatar {
  background: #EBDCB3 !important;
  margin-right: 0px !important;
}

.item-avatar .avatar-text {
  font-size: 14px;
}

.custom-list-item {
  padding: 8px 16px !important;
}

.item-title {
  font-size: 14px;
  font-weight: 400;
  color: #1a1a1a;
}

:deep(.v-chip__close) {
  color: #89868f !important;
  font-size: 14px !important;
  margin-left: 2px !important;
  background: transparent !important;
  width: 16px !important;
  height: 16px !important;
}

:deep(.v-chip__close:hover) {
  opacity: 0.8;
}

.more-members {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  line-height: 20px;
}

.actions {
  padding: 24px !important;
  margin-top: 20px;
}

/* Custom button styles */
.cancel-btn {
  border: 1px solid #6b46c1 !important;
  color: #6b46c1 !important;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.25px;
  text-transform: none;
  border-radius: 20px;
  padding : 8px 24px;
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

/* Override Vuetify defaults */
:deep(.v-field) {
  border-radius: 6px !important;
  border: 1px solid rgba(0, 0, 0, 0.23) !important;
  background-color: white !important;
}

:deep(.v-field__outline) {
  display: none !important;
}

:deep(.v-field__input) {
  min-height: 40px !important;
  padding: 8px 12px !important;
  gap: 4px !important;
}

:deep(.v-select__content) {
  border-radius: 6px;
  box-shadow: 0px 4px 6px -2px rgba(0, 0, 0, 0.05),
    0px 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-field.v-field--focused) {
  border-color: #6b46c1 !important;
}

:deep(.v-field__append-inner) {
  padding-top: 8px !important;
  color: rgba(0, 0, 0, 0.54);
}

/* Hide checkboxes in dropdown */
:deep(.v-list-item__prepend .v-selection-control) {
  display: none !important;
}

:deep(.v-list-item--active) {
  background-color: rgba(107, 70, 193, 0.08) !important;
}

.selected-item {
  background-color: rgba(107, 70, 193, 0.08) !important;
}

:deep(.v-list-item__prepend) {
  margin-right: 0 !important;
}

:deep(.v-chip__content) {
  padding: 0 !important;
  margin: 0 !important;
}

/* Responsive styles */
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
.required {
  color: #d32f2f;
  font-weight: bold;
}
</style>