<template>
  <v-container fluid>
    <v-row>
      <!-- Review Status -->
      <v-col cols="12" md="6">
        <v-select v-model="formData.reviewStatus" :items="[
          { text: $t('risk.no_review'), value: 'noReview' },
          { text: $t('risk.perform_review'), value: 'performReview' }
        ]" :label="$t('risk.select_review_status')" item-title="text" outlined density="comfortable" />
      </v-col>
    </v-row>

    <!-- Perform Review Section -->
    <v-expand-transition>
      <div v-if="formData.reviewStatus === 'performReview'">
        <!-- Reviews List -->
        <v-row class="mt-4" v-for="(review, index) in formData.reviews" :key="review.id">
          <v-col cols="12">
            <v-card outlined class="review-item">
              <v-card-text>
                <v-row>
                  <!-- Review Type -->
                  <v-col cols="12" md="6">
                    <v-select v-model="review.reviewType" :items="[
                      { text: $t('risk.scheduled'), value: 'scheduled' },
                      { text: $t('risk.triggered'), value: 'triggered' }
                    ]" item-title="text" :label="$t('risk.review_type')" outlined density="comfortable" />
                  </v-col>

                  <!-- Scheduled Flow -->
                  <v-col cols="12" md="6" v-if="review.reviewType === 'scheduled'">
                    <v-text-field v-model="review.nextReviewDate" :label="$t('risk.next_review_date')" type="date"
                      outlined density="comfortable" />
                  </v-col>

                  <!-- Triggered Flow -->
                  <template v-if="review.reviewType === 'triggered'">
                    <v-col cols="12" md="6">
                      <v-select v-model="review.selectedReview" :items="reviewOptions" item-title="name" item-value="id"
                        :label="$t('risk.review_trigger')" outlined density="comfortable" />
                    </v-col>

                    <!-- Action Selection -->
                    <v-col cols="12" md="6">
                      <v-select v-model="review.action" :items="[
                        { text: $t('risk.submit_as_production_issue'), value: 'Production Issue' },
                        { text: $t('risk.accept_until_next_review'), value: 'Accept Until The Next Review' }
                      ]" :label="$t('risk.select_action')" item-title="text" outlined density="comfortable" />
                    </v-col>

                    <!-- Trigger Reference -->
                    <v-col cols="12" md="6">
                      <v-text-field v-model="review.triggerReference" :label="$t('risk.trigger_reference')" outlined
                        density="comfortable" />
                    </v-col>

                    <!-- Trigger Date -->
                    <v-col cols="12" md="6">
                      <v-text-field v-model="review.triggerDate" :label="$t('risk.trigger_date')" type="date" outlined
                        density="comfortable" />
                    </v-col>
                  </template>

                  <!-- Comment -->
                  <v-col cols="12">
                    <v-textarea v-model="review.comment" :label="$t('risk.comment')" rows="3" auto-grow outlined
                      density="comfortable" />
                  </v-col>

                  
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-container>
</template>

<script>
import Review from '@/API/Review/Review';

export default {
  inject: ['formData'],
  data() {
    return {
      reviewOptions: [],
      triggerOptions: [] // future config-based options
    };
  },

  mounted() {
    this.initialize();

    // Ensure formData exists
    if (!this.formData) {
      this.formData = {};
    }

    // Defaults
    this.formData.reviewStatus = this.formData.reviewStatus || 'noReview';

    // Initialize reviews as array if it doesn't exist or is not an array
    if (!Array.isArray(this.formData.reviews)) {
      // If reviews exists as object, convert it to array with one item
      if (this.formData.reviews && typeof this.formData.reviews === 'object') {
        this.formData.reviews = [{
          id: this.generateRandomId(),
          created_at: new Date().toISOString(),
          ...this.formData.reviews
        }];
      } else {
        // Create empty array or array with one empty review based on reviewStatus
        this.formData.reviews = this.formData.reviewStatus === 'performReview' ? [this.createEmptyReview()] : [];
      }
    } else {
      // Ensure each review has an ID and created_at
      this.formData.reviews = this.formData.reviews.map(review => ({
        ...this.createEmptyReview(),
        ...review,
        id: review.id || this.generateRandomId(),
        created_at: review.created_at || new Date().toISOString()
      }));
    }
  },

  computed: {
    isFormValid() {
      if (this.formData.reviewStatus !== 'performReview') return true;

      return this.formData.reviews.every(review => {
        if (review.reviewType === 'scheduled') {
          return !!review.nextReviewDate;
        }

        if (review.reviewType === 'triggered') {
          return (
            review.selectedReview &&
            review.action &&
            review.triggerReference &&
            review.triggerDate
          );
        }

        return false;
      });
    }
  },

  methods: {
    async initialize() {
      try {
        const review = new Review();
        this.reviewOptions = await review.getAll({ select: 'id|name' });
      } catch (error) {
        console.error('Failed to load review options:', error);
      }
    },

    generateRandomId() {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    },

    createEmptyReview() {
      return {
        id: this.generateRandomId(),
        reviewType: null,
        nextReviewDate: null,
        selectedReview: null,
        action: null,
        triggerReference: null,
        triggerDate: null,
        comment: null,
        review_status_action: 'pending',
        created_at: new Date().toISOString() // Set created_at at review level
      };
    },

    addNewReview() {
      this.formData.reviews.push(this.createEmptyReview());
    }
  },

  watch: {
    'formData.reviewStatus'(newVal) {
      if (newVal === 'performReview' && this.formData.reviews.length === 0) {
        this.formData.reviews.push(this.createEmptyReview());
      } else if (newVal === 'noReview') {
        // Clear reviews when no review is selected
        this.formData.reviews = [];
      }
    }
  }
};
</script>

<style scoped>
.review-item {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.review-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
</style>