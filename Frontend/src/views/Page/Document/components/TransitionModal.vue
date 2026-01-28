<template>
  <v-dialog v-model="localShow" max-width="600">
    <v-card>
      <v-card-title>Document Transitions</v-card-title>
      <v-card-text>
        <!-- Show loading spinner if transition is in progress -->
        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="mt-2">Processing transition...</div>
        </div>

        <v-list v-else>
          <v-list-item 
            v-for="(transition, index) in transitions" 
            :key="index"
            @click="!loading && handleTransitionClick(transition)"
            :class="{ 'bg-blue-lighten-5': isActiveTransition(transition) }"
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-arrow-right" class="me-2"></v-icon>
            </template>

            <v-list-item-title>
              <v-chip size="small" color="error" class="me-2">
                {{ transition.name }}
              </v-chip>
              {{ transition.to_step_name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "TransitionModal",
  props: {
    show: {
      type: Boolean,
      required: true
    },
    currentItem: {
      type: Object,
      default: null
    },
    transitions: {
      type: Array,
      default: () => []
    },
    workflowSteps: {
      type: Array,
      default: () => []
    },
    activeWorkflowStep: {
      type: Number,
      default: 0
    },
    documentApi: {
      type: Object,
      required: true
    },
    loading: { // Add loading prop to control from parent
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localShow: this.show
    };
  },
  watch: {
    show(val) {
      this.localShow = val;
    },
    localShow(val) {
      if (!val) {
        this.$emit('update:show', false);
      }
    }
  },
  methods: {
    isActiveTransition(transition) {
      if (!this.workflowSteps[this.activeWorkflowStep]) return false;
      const currentStep = this.workflowSteps[this.activeWorkflowStep];
      return transition.to_step_name === currentStep.name;
    },
    
    handleTransitionClick(transition) {
      // Emit the navigate event to parent component
      this.$emit('navigate', transition);
    },
    
    close() {
      this.$emit('update:show', false);
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.transition-item {
  cursor: pointer;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.transition-item:hover {
  background-color: #f5f5f5;
}

.active-transition {
  background-color: #e3f2fd;
  font-weight: 500;
}
</style>