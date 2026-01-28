<!-- <template>
  <div class="accordion-item">
    <div
      v-if="shouldShowHeader"
      class="accordion-header"
      @click="$emit('toggle-accordion', topic.id)"
      :class="{ active: isOpen }"
    >
      <div class="header-left">
        <span class="accordion-icon">
          {{ isOpen ? "▼" : "▶" }}
        </span>
        <span class="topic-name">{{ topic.name }}</span>
      </div>
      <div class="header-actions">
        <v-btn
          v-if="agendaDetails.status === 'draft'"
          size="small"
          color="purple-lighten-1"
          variant="elevated"
          @click.stop="$emit('add-subtopic', topic.id)"
          class="add-btn"
        >
          <v-icon left>mdi-plus</v-icon>
          {{ $t("agenda.add_subtopic") }}
        </v-btn>
      </div>
    </div>

    <div v-if="isOpen" class="accordion-content">
      <SubtopicItem
        v-for="subtopic in visibleSubtopics"
        :key="`subtopic-${subtopic.id}`"
        :subtopic="subtopic"
        :agenda-details="agendaDetails"
        :is-selected="selectedSubtopics.includes(subtopic.id)"
        :display-actions="displayActions"
        :status-data="subtopicStatusData[subtopic.id]"
        @update-selection="handleSelectionUpdate"
        @update-status="
          $emit('update-subtopic-status', $event.subtopicId, $event.status)
        "
        @open-reject-dialog="$emit('open-reject-dialog', subtopic)"
      />
    </div>
  </div>
</template>

<script>
import SubtopicItem from "./SubtopicItem.vue";

export default {
  name: "TopicAccordion",
  components: { SubtopicItem },
  props: {
    topic: { type: Object, required: true },
    agendaDetails: { type: Object, required: true },
    selectedSubtopics: { type: Array, required: true },
    openAccordions: { type: Array, required: true },
    displayActions: { type: Boolean, required: true },
    subtopicStatusData: { type: Object, required: true },
  },
  emits: [
    "toggle-accordion",
    "add-subtopic",
    "update-selection",
    "update-subtopic-status",
    "open-reject-dialog",
  ],
  computed: {
    isOpen() {
      return this.openAccordions.includes(this.topic.id);
    },
    shouldShowHeader() {
      if (this.agendaDetails.status !== "draft") {
        return this.topic.sub_topics.some(
          (subtopic) => subtopic?.agenda_id == this.agendaDetails?.id
        );
      }
      return (
        this.agendaDetails.status === "draft" ||
        this.agendaDetails.status === "rejected" ||
        this.topic.sub_topics.some(
          (subtopic) => subtopic?.agenda_id == this.agendaDetails?.id
        )
      );
    },
    visibleSubtopics() {
      return this.topic.sub_topics.filter((subtopic) => {
        const canBeAssigned = this.isSubtopicCanAssignedToOtherAgenda(
          subtopic.id
        );

        if (this.agendaDetails.status === "draft") {
          return canBeAssigned;
        }

        return (
          this.agendaDetails.status !== "draft" &&
          this.agendaDetails.id == subtopic.agenda_id &&
          canBeAssigned
        );
      });
    },
  },
  methods: {
    handleSelectionUpdate(payload) {
      console.log("📦 TopicAccordion forwarding:", payload);
      this.$emit("update-selection", payload.subtopicId, payload.isChecked);
    },
    isSubtopicCanAssignedToOtherAgenda(subtopicId) {
      const subtopic = this.topic.sub_topics.find((s) => s.id === subtopicId);
      if (!subtopic) return false;
      return (
        (subtopic.agenda_id && subtopic.agenda_status == "deferred") ||
        subtopic.agenda_id == null ||
        subtopic.agenda_id === undefined ||
        subtopic.agenda_id === this.agendaDetails.id
      );
    },
  },
};
</script> -->
<template>
  <div v-if="shouldShowAccordion" class="accordion-item">
    <!-- Main Topic Header -->
    <div
      class="accordion-header"
      @click="$emit('toggle-accordion', topic.id)"
      :class="{ active: isOpen }"
    >
      <div class="header-left">
        <span class="accordion-icon">
          {{ isOpen ? "▼" : "▶" }}
        </span>
        <span class="topic-name">{{ topic.name }}</span>
      </div>
      <div class="header-actions">
        <v-btn
          v-if="agendaDetails.status === 'draft'"
          size="small"
          color="purple-lighten-1"
          variant="elevated"
          @click.stop="$emit('add-subtopic', topic.id)"
          class="add-btn"
        >
          <v-icon left>mdi-plus</v-icon>
          {{ $t("agenda.add_subtopic") }}
        </v-btn>
      </div>
    </div>

    <!-- Subtopics Content -->
    <div v-if="isOpen" class="accordion-content">
      <SubtopicItem
        v-for="subtopic in visibleSubtopics"
        :key="`subtopic-${subtopic.id}`"
        :subtopic="subtopic"
        :agenda-details="agendaDetails"
        :is-selected="selectedSubtopics.includes(subtopic.id)"
        :display-actions="displayActions"
        :status-data="subtopicStatusData[subtopic.id]"
        @update-selection="handleSelectionUpdate"
        @update-status="
          $emit('update-subtopic-status', $event.subtopicId, $event.status)
        "
        @open-reject-dialog="$emit('open-reject-dialog', subtopic)"
      />
    </div>
  </div>
</template>

<script>
import SubtopicItem from "./SubtopicItem.vue";

export default {
  name: "TopicAccordion",
  components: { SubtopicItem },
  props: {
    topic: { type: Object, required: true },
    agendaDetails: { type: Object, required: true },
    selectedSubtopics: { type: Array, required: true },
    openAccordions: { type: Array, required: true },
    displayActions: { type: Boolean, required: true },
    subtopicStatusData: { type: Object, required: true },
  },
  emits: [
    "toggle-accordion",
    "add-subtopic",
    "update-selection",
    "update-subtopic-status",
    "open-reject-dialog",
  ],
  computed: {
    isOpen() {
      return this.openAccordions.includes(this.topic.id);
    },
    visibleSubtopics() {
      return this.topic.sub_topics.filter((subtopic) => {
        const canBeAssigned = this.isSubtopicCanAssignedToOtherAgenda(
          subtopic.id
        );

        if (this.agendaDetails.status === "draft") {
          return canBeAssigned;
        }

        return (
          this.agendaDetails.status !== "draft" &&
          this.agendaDetails.id == subtopic.agenda_id &&
          canBeAssigned
        );
      });
    },
    // New computed property to determine if accordion should be shown
    shouldShowAccordion() {
      // Always show if status is draft (so users can add subtopics)
      if (this.agendaDetails.status === "draft") {
        return true;
      }

      // For non-draft status, only show if there are visible subtopics
      return this.visibleSubtopics.length > 0;
    },
    // Remove the old shouldShowHeader computed property as it's no longer needed
  },
  methods: {
    handleSelectionUpdate(payload) {
      console.log("📦 TopicAccordion forwarding:", payload);
      this.$emit("update-selection", payload.subtopicId, payload.isChecked);
    },
    isSubtopicCanAssignedToOtherAgenda(subtopicId) {
      const subtopic = this.topic.sub_topics.find((s) => s.id === subtopicId);
      if (!subtopic) return false;
      return (
        (subtopic.agenda_id && subtopic.agenda_status == "deferred") ||
        subtopic.agenda_id == null ||
        subtopic.agenda_id === undefined ||
        subtopic.agenda_id === this.agendaDetails.id
      );
    },
  },
};
</script>
<style scoped>
.add-btn {
  min-width: 130px;
  height: 30px;
  /* font-size: 13px; */
  text-transform: none;
  border-radius: 10px;
  background-color: #6e3894 !important;
}

.accordion-item {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  background: #ffffff;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid transparent;
  min-height: 48px;
}

.accordion-header:hover {
  background: #eeeeee;
}

.accordion-header.active {
  background: #e8e8e8;
  border-bottom-color: #e0e0e0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.accordion-icon {
  font-size: 14px;
  transition: transform 0.2s ease;
  color: #666;
  font-weight: normal;
  width: 16px;
  display: inline-block;
}

.topic-name {
  font-weight: 600;
  font-size: 14px;
  color: #404040;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.accordion-content {
  padding: 0;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
}
</style>
