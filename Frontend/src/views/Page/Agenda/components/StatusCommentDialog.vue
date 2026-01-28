<template>
  <v-dialog 
    :model-value="modelValue" 
    max-width="544px" 
    persistent 
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="status-dialog" rounded="lg">
      <!-- Header with close button -->
      <div class="dialog-header">
        <h2 class="dialog-title">
          {{ dialogConfig.title }}: {{ subtopic?.name }}
        </h2>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="handleClose"
          :disabled="isLoading"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <label class="comment-label">
          {{ dialogConfig.label }}
          <span v-if="dialogConfig.required" class="required">*</span>
        </label>
        <v-textarea
          :model-value="comment"
          @update:model-value="$emit('update:comment', $event)"
          :placeholder="dialogConfig.placeholder"
          variant="outlined"
          rows="5"
          :error-messages="showError ? errorMessages : []"
          :hide-details="!showError"
          class="comment-textarea"
        ></v-textarea>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          @click="handleClose"
          :disabled="isLoading"
          class="cancel-btn"
          height="40"
        >
          {{ $t("common.cancel") }}
        </v-btn>
        <v-btn
          variant="flat"
          @click="handleConfirm"
          :loading="isLoading"
          :class="['action-btn', dialogConfig.buttonClass]"
          height="40"
        >
          {{ dialogConfig.buttonText }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "StatusDialog",
  props: {
    modelValue: { type: Boolean, required: true },
    type: { 
      type: String, 
      required: true,
      validator: (value) => ['approve', 'reject', 'defer'].includes(value)
    },
    subtopic: { type: Object, default: null },
    comment: { type: String, default: '' },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'update:comment', 'confirm', 'close'],
  data() {
    return {
      showError: false,
    };
  },
  computed: {
    dialogConfig() {
      const configs = {
        approve: {
          title: this.$t("agenda.approval_topic"),
          label: this.$t("agenda.approval_comment_optional"),
          placeholder: this.$t("agenda.approval_comment_placeholder"),
          buttonText: this.$t("common.approve"),
          buttonClass: 'approve-btn',
          required: false,
        },
        reject: {
          title: this.$t("agenda.reject_subtopic"),
          label: this.$t("agenda.rejection_comment_required"),
          placeholder: this.$t("agenda.rejection_comment_placeholder"),
          buttonText: this.$t("agenda.reject"),
          buttonClass: 'reject-btn',
          required: true,
        },
        defer: {
          title: this.$t("agenda.defer_subtopic"),
          label: this.$t("agenda.deferred_comment_required"),
          placeholder: this.$t("agenda.deferred_comment_placeholder"),
          buttonText: this.$t("agenda.defer"),
          buttonClass: 'defer-btn',
          required: true,
        },
      };
      return configs[this.type] || configs.approve;
    },
    errorMessages() {
      const errors = [];
      if (this.dialogConfig.required && !this.comment.trim()) {
        errors.push(this.$t(`agenda.${this.type}ion_comment_error`) || this.$t("agenda.rejection_comment_error"));
      }
      return errors;
    },
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.showError = false;
      }
    },
    type() {
      this.showError = false;
    },
  },
  methods: {
    handleConfirm() {
      if (this.dialogConfig.required && !this.comment.trim()) {
        this.showError = true;
        return;
      }
      this.showError = false;
      this.$emit('confirm');
    },
    handleClose() {
      this.showError = false;
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.status-dialog {
  padding: 24px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: #000000;
  margin: 0;
  padding-right: 16px;
  flex: 1;
}

.close-btn {
  flex-shrink: 0;
  margin-top: -4px;
  margin-right: -8px;
}

.dialog-content {
  margin-bottom: 24px;
}

.comment-label {
  display: block;
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  margin-bottom: 8px;
}

.required {
  color: #F44336;
}

.comment-textarea {
  width: 100%;
}

.comment-textarea :deep(.v-field) {
  border-radius: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  border-radius: 8px;
  padding: 0 24px;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  border-radius: 8px;
  padding: 0 24px;
  color: white !important;
  font-size: 18px;
  font-weight: 600;
  border-radius: 10px;
}

.approve-btn {
  background-color: #b6caae !important;
  color: #255f0b !important;
}

.approve-btn:hover {
  background-color: #a3b89c !important;
}

.reject-btn {
  background-color: #E2B6B6 !important;
  color: #A92525 !important;
}

.reject-btn:hover {
  background-color: #d4a4a4 !important;
}

.defer-btn {
  background-color: #D0B5E3 !important;
  color: #6E3894 !important;
}

.defer-btn:hover {
  background-color: #c1a3d6 !important;
}
</style>