<template>
  <div 
    class="comments-section" 
    :class="commentClass"
  >
    <div class="comment-icon">
      <v-icon size="18">mdi-information-outline</v-icon>
    </div>
    <div class="comment-content">
      <span class="comment-label">{{ $t("agenda.comment") }}:</span>
      <span class="comment-text">{{ statusData.agenda_status_comment }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "CommentsSection",
  props: {
    statusData: { type: Object, required: true },
  },
  computed: {
    commentClass() {
      const status = this.statusData?.agenda_status?.toLowerCase();
      return {
        'comment-approved': status === 'approved',
        'comment-rejected': status === 'rejected',
      };
    },
  },
};
</script>

<style scoped>
.comments-section {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 13px;
  line-height: 1.5;
}

.comment-approved {
  background: #e8f5e9;
  border-top-color: #c8e6c9;
}

.comment-rejected {
  background: #ffebee;
  border-top-color: #ffcdd2;
}

.comment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.comment-approved .comment-icon {
  color: #2e7d32;
}

.comment-rejected .comment-icon {
  color: #c62828;
}

.comment-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.comment-label {
  font-weight: 600;
  color: inherit;
}

.comment-approved .comment-label,
.comment-approved .comment-text {
  color: #1b5e20;
}

.comment-rejected .comment-label,
.comment-rejected .comment-text {
  color: #b71c1c;
}

.comment-text {
  font-weight: 400;
  word-break: break-word;
}
</style>