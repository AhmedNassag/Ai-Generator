<template>
  <v-dialog v-model="internalVisible" max-width="900" persistent>
    <v-card class="rounded-lg" elevation="0">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center pa-6 pb-5" style="border-bottom: 1px solid #E5E7EB;">
        <span class="text-h6 font-weight-semibold" style="color: #000000; font-size: 18px; line-height: 28px;">
          {{ $t('topic.recommendations') }}
        </span>
        <v-btn icon variant="text" size="small" @click="internalVisible = false" style="color: #6B7280;">
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6" style="min-height: 120px;">
        <v-form>
          <!-- Recommendations List -->
          <div v-for="(rec, idx) in recommendations" :key="rec.id || idx" 
               class="mb-3" 
               style="display: flex; align-items: flex-start; gap: 12px;">
            
            <!-- Title Input -->
            <v-text-field
              v-model="rec.title"
              :placeholder="$t('topic.title_placeholder')"
              variant="outlined"
              density="comfortable"
              hide-details
              style="flex: 1; min-width: 180px;"
              :style="{
                '--v-field-padding-top': '8px',
                '--v-field-padding-bottom': '8px',
              }"
            >
              <template v-slot:prepend-inner>
                <span style="color: #9CA3AF; font-size: 14px; margin-right: 0;"></span>
              </template>
            </v-text-field>

            <!-- Assignee Select -->
            <!-- <v-select
              v-model="rec.assignee_id"
              :items="userOptions"
              item-title="full_name"
              item-value="id"
              :placeholder="$t('topic.assignee_placeholder')"
              variant="outlined"
              density="comfortable"
              hide-details
              style="flex: 1; min-width: 160px;"
            >
            </v-select> -->
            <UserSelect
              v-model="rec.assignee_id"
              :users="userOptions"
              :placeholder="$t('topic.assignee_placeholder')"
              style="flex: 1; min-width: 160px;"
            />

            <!-- Due Date Picker -->
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="rec.due_date"
                  :placeholder="$t('topic.due_date_placeholder')"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  v-bind="props"
                  style="flex: 0 0 140px; max-width: 140px;"
                >
                  <template v-slot:append-inner>
                    <v-icon size="18" style="color: #9CA3AF;">mdi-calendar-blank-outline</v-icon>
                  </template>
                </v-text-field>
              </template>
              <v-date-picker v-model="rec.due_date"></v-date-picker>
            </v-menu>

            <!-- Save Button -->
            <v-btn
              icon
              variant="text"
              size="small"
              @click="saveRecommendation(idx)"
              :disabled="!isRowValid(rec)"
              :loading="rec.saving"
              style="color: #7C3AED; margin-top: 4px;"
            >
              <v-icon size="20">mdi-content-save-outline</v-icon>
              <template v-slot:loader>
                <v-progress-circular indeterminate size="20" width="2" color="#7C3AED"></v-progress-circular>
              </template>
            </v-btn>

            <!-- Delete Button -->
            <v-btn
              icon
              variant="text"
              size="small"
              @click="confirmDelete(idx)"
              :loading="rec.deleting"
              style="color: #6B7280; margin-top: 4px;"
            >
              <v-icon size="20">mdi-delete-outline</v-icon>
              <template v-slot:loader>
                <v-progress-circular indeterminate size="20" width="2"></v-progress-circular>
              </template>
            </v-btn>
          </div>

          <!-- Empty State -->
          <div v-if="recommendations.length === 0" class="text-center py-4">
            <span style="color: #9CA3AF; font-size: 14px;">{{ $t('topic.no_recommendations_yet') }}</span>
          </div>
        </v-form>
      </v-card-text>

      <!-- Footer Actions -->
      <v-card-actions class="pa-6 pt-4" style="border-top: 1px solid #E5E7EB; justify-content: space-between;">
        <!-- Add Recommendation Button -->
          <v-btn
          variant="text"
          @click="addRecommendation"
          class="px-0"
          style="color: #8C8C8C; text-transform: none; font-size: 14px; height: auto; min-height: 32px;"
        >
          <v-icon size="18" class="mr-1">mdi-plus-circle-outline</v-icon>
          {{ $t('topic.add_recommendation') }}
        </v-btn>

        <!-- Cancel Button -->
          <v-btn
          variant="outlined"
          @click="internalVisible = false"
          style="
            text-transform: none; 
            color: #374151; 
            border-color: #D1D5DB;
            font-size: 14px;
            font-weight: 500;
            height: 40px;
            padding: 0 20px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          "
        >
          {{ $t('topic.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card class="rounded-lg" elevation="0">
        <v-card-title class="text-h6 pa-6 pb-4" style="font-size: 18px; font-weight: 600; color: #111827;">
          {{ $t('topic.confirm_deletion_title') }}
        </v-card-title>
        <v-card-text class="pa-6 pt-0" style="color: #6B7280; font-size: 14px;">
          {{ $t('topic.confirm_deletion_message') }}
        </v-card-text>
        <v-card-actions class="pa-6 pt-4" style="justify-content: flex-end; gap: 12px;">
          <v-btn 
            variant="text" 
            @click="deleteDialog = false"
            style="text-transform: none; color: #6B7280; font-size: 14px;"
          >
            {{ $t('topic.cancel') }}
          </v-btn>
          <v-btn 
            color="error" 
            @click="deleteRecommendation" 
            :loading="deleting"
            style="text-transform: none; font-size: 14px; font-weight: 500;"
          >
            {{ $t('topic.delete') }}
            <template v-slot:loader>
              <v-progress-circular indeterminate size="20" width="2"></v-progress-circular>
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import TopicRecommendation from "@/API/TopicRecommendation/TopicRecommendation";
import UserSelect from "@/components/UserSelect.vue";
export default {
  name: 'UpdateRecommendationModal',
  props: {
    meetingId: {
      type: String,
      required: true,
    },
    visible: Boolean,
    subTopic: Object,
    users: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const api = new TopicRecommendation();
    return {
      api,
    };
  },
  components: {
    UserSelect,
  },
  data() {
    return {
      internalVisible: this.visible,
      recommendations: [],
      // api: new TopicRecommendation(),
      deleteDialog: false,
      deleting: false,
      recommendationToDelete: null,
      saving: false,
    };
  },
  computed: {
    userOptions() {
      return this.users.map(user => ({
        id: user.id,
        full_name: user.full_name,
        type: user.type,
      }));
    },
    hasValidRecommendations() {
      return this.recommendations.some(rec => this.isRowValid(rec));
    },
  },
  watch: {
    visible(val) {
      this.internalVisible = val;
      if (val && this.subTopic) {
        this.loadRecommendations();
      }
    },
    internalVisible(val) {
      this.$emit('update:visible', val);
    },
    subtopic(newSubtopic) {
      if (this.internalVisible && newSubtopic) {
        this.loadRecommendations();
      }
    },
  },
  methods: {
    loadRecommendations() {
      this.recommendations = (this.subTopic.recommendations || []).map(rec => ({
        ...rec,
        due_date: rec.due_date || new Date().toISOString().split('T')[0],
        saving: false,
        deleting: false,
      }));
    },
    addRecommendation() {
      this.recommendations.push({
        title: '',
        assignee_id: null,
        meeting_id: this.meetingId,
        topic_id: this.subTopic?.id,
        due_date: new Date().toISOString().split('T')[0],
        saving: false,
        deleting: false,
      });
    },
    confirmDelete(idx) {
      this.recommendationToDelete = idx;
      this.deleteDialog = true;
    },
    async deleteRecommendation() {
      if (this.recommendationToDelete === null) return;

      const idx = this.recommendationToDelete;
      const rec = this.recommendations[idx];

      if (!rec.id) {
        // If it's a new recommendation (no ID), just remove it
        this.recommendations.splice(idx, 1);
        this.deleteDialog = false;
        return;
      }

      this.deleting = true;
      rec.deleting = true;

      try {
        const response = await this.api.delete(rec.id);

        if (response.status === "success") {
          this.api.poup(response, this.$t('topic.recommendation_deleted'));
          this.recommendations.splice(idx, 1);
          this.$emit('deleted', rec.id);
        } else {
          throw new Error(response.message || this.$t('topic.failed_delete_recommendation'));
        }
      } catch (error) {
        console.error('Error deleting recommendation:', error);
        this.api.poup('error', this.$t('topic.failed_delete_recommendation'));
      } finally {
        this.deleting = false;
        this.deleteDialog = false;
        this.recommendationToDelete = null;
      }
    },
    isRowValid(rec) {
      return rec.title && rec.assignee_id && rec.due_date;
    },
    async saveRecommendation(idx) {
      const recommendation = this.recommendations[idx];
      if (!this.isRowValid(recommendation)) return;

      recommendation.saving = true;

      try {
        const dataToSave = { ...recommendation };
        let response = {};

        if (dataToSave.id) {
          // Update existing recommendation
          response = await this.api.update(dataToSave);
        } else {
          // Create new recommendation
          response = await this.api.insert(dataToSave);
        }

        if (response.status === "success" || response.data.status == 'success') {
          this.api.poup(response, this.$t('topic.recommendation_saved'));
          // Update the recommendation with the response data
          Object.assign(this.recommendations[idx], {
            ...dataToSave,
            ...response.data, // assuming the API returns the updated recommendation
            saving: false,
          });
          this.$emit('saved', {
            ...dataToSave,
            assignee: this.users.find(u => u.id === dataToSave.assignee_id),
          });
        } else {
          throw new Error(response.message || this.$t('topic.failed_save_recommendation'));
        }
      } catch (error) {
        console.error('Error saving recommendation:', error);
        this.api.poup('error', this.$t('topic.failed_save_recommendation'));
      } finally {
        recommendation.saving = false;
      }
    },
  },
};
</script>

<style scoped>
/* Dialog styling */
:deep(.v-dialog) {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Input fields styling */
:deep(.v-field__outline) {
  color: #E5E7EB;
}

:deep(.v-field--focused .v-field__outline) {
  color: #7C3AED;
}

:deep(.v-field__input) {
  color: #111827;
  font-size: 14px;
  padding-top: 8px;
  padding-bottom: 8px;
  min-height: 40px;
}

:deep(.v-field__input::placeholder) {
  color: #9CA3AF;
  opacity: 1;
}

:deep(.v-text-field .v-field) {
  border-radius: 6px;
}

:deep(.v-select .v-field) {
  border-radius: 6px;
}

/* Remove default margins */
:deep(.v-input__details) {
  display: none;
}

/* Button styling */
:deep(.v-btn) {
  border-radius: 6px;
  letter-spacing: 0;
}

/* Icon button hover */
:deep(.v-btn--icon:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Select dropdown styling */
:deep(.v-list-item-title) {
  font-size: 14px;
  color: #111827;
}

/* Date picker styling */
:deep(.v-date-picker) {
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>