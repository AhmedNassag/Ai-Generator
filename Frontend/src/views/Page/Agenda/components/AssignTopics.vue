<template>
  <v-dialog :model-value="viewTopicsModal" @update:model-value="$emit('update:viewTopicsModal', $event)"
    max-width="800px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t("agenda.select_topics") }}</span>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div v-for="topic in topics" :key="topic.id" class="accordion-item">
          <!-- Main Topic Header -->
          <div class="accordion-header" @click="toggleAccordion(topic.id)"
            :class="{ active: openAccordions.includes(topic.id) }">
            <span class="topic-name">{{ topic.name }}</span>
            <span class="accordion-icon">
              {{ openAccordions.includes(topic.id) ? '▼' : '▶' }}
            </span>
          </div>

          <!-- Subtopics Content -->
          <div v-if="openAccordions.includes(topic.id)" class="accordion-content">
            <div v-for="subtopic in topic.sub_topics" :key="subtopic.id" class="subtopic-item">
              <label class="checkbox-label">
                <input type="checkbox" :value="subtopic.id" v-model="selectedSubtopics" @change="updateSelection" />
                <span class="checkmark"></span>
                {{ subtopic.name }}
              </label>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeModal">
          {{ $t("agenda.cancel") }}
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="saveSelection">
          {{ $t("agenda.save_selection") }} ({{ selectedSubtopics.length }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    viewTopicsModal: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    agendaData: {
      type: Object,
      default: () => { }
    },
    topics: {
      type: Array,
      default: () => []
    },
    agendaTopics: {
      type: Array,
      default: () => []
    },
  },

  emits: ['update:viewTopicsModal', 'save-selection', 'close'],

  data() {
    return {
      openAccordions: [],
      selectedSubtopics: [],
    };
  },

  watch: {
    agendaTopics: {
      handler(newAgendaTopics) {
        this.selectedSubtopics = Array.isArray(newAgendaTopics)
          ? [...newAgendaTopics]
          : [];
      },
      immediate: true
    },
    isOpen(isOpen) {
      if (isOpen) {
        this.selectedSubtopics = [...this.agendaTopics];
      }
    }
  },
  methods: {
    toggleAccordion(topicId) {
      const index = this.openAccordions.indexOf(topicId);
      if (index > -1) {
        this.openAccordions.splice(index, 1);
      } else {
        this.openAccordions.push(topicId);
      }
    },
    closeModal() {
      this.$emit('update:viewTopicsModal', false);
      this.$emit('close');
    },
    saveSelection() {
      this.$emit('save-selection', this.selectedSubtopics);
      this.closeModal();
    }
  }
};
</script>

<style scoped>
/* Add any modal-specific styles here if needed */
.accordion-item {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background: #fff;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background-color: #f0f4f8;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid transparent;
  font-size: 1.08rem;
}

.accordion-header:hover {
  background-color: #e3eaf3;
}

.accordion-header.active {
  background-color: #1976d2;
  color: white;
  border-bottom-color: #e5e5e5;
}

.topic-name {
  font-weight: 700;
  font-size: 1.13rem;
}

.accordion-icon {
  font-size: 1.1rem;
  transition: transform 0.2s;
}

.accordion-content {
  padding: 18px 24px 10px 24px;
  background-color: #f9fbfd;
  border-top: 1px solid #e5e5e5;
}

.subtopic-item {
  margin-bottom: 12px;
}

.subtopic-item:last-child {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 4px;
  transition: background-color 0.2s;
  background: #f5f7fa;
  font-size: 1rem;
}

.checkbox-label:hover {
  background-color: #e3eaf3;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  accent-color: #1976d2;
}

.checkmark {
  margin-left: 6px;
  font-size: 1rem;
  color: #333;
}
</style>