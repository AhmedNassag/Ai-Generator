<template>
  <div>
    <!-- Accordion Section -->
    <div class="accordion risk-accordion mb-5" id="accordionExample">
      <div class="accordion-item risk-accordion-item">
        <h2 class="accordion-header risk-accordion-header">
          <button class="accordion-button risk-accordion-button" type="button" @click="toggleAccordion('history')"
            :class="{ 'collapsed': isAccordionOpen !== 'history' }">
            <span class="according-title">{{ $t('risk.view_all_review') }}</span>
            <i class="fas fa-chevron-down accordion-chevron"
              :class="{ 'rotate-icon': isAccordionOpen === 'history' }"></i>
          </button>
        </h2>
        <div v-show="isAccordionOpen === 'history'" class="accordion-collapse risk-accordion-collapse"
          :class="{ 'show': isAccordionOpen === 'history' }">
          <div class="accordion-body risk-accordion-body">
            <div class="review-history">
              <div v-if="reviewHistory.length > 0" class="table-responsive">
                <table class="table custom-table">
                  <thead>
                    <tr>
                      <th>{{ $t('risk.created_date') }}</th>
                      <th>{{ $t('risk.review_date') }}</th>
                      <th>{{ $t('risk.reviewer') }}</th>
                      <th>{{ $t('risk.review_type') }}</th>
                      <th>{{ $t('risk.comment') }}</th>
                      <th>{{ $t('risk.status') }}</th>
                      <th>{{ $t('risk.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(review, index) in reviewHistory" :key="index">
                      <td>{{ formatDateTime(review.created_at) }}</td>
                      <td>{{ formatDate(review.date) }}</td>
                      <td>
                        <div class="reviewer-badge">
                          <span class="reviewer-avatar">u2</span>
                          <span>{{ review.review_by }}</span>
                        </div>
                      </td>
                      <td>{{ review.type }}</td>
                      <td>
                        <span class="comment-text">
                          {{ truncateText(review.comment, 30) }}
                        </span>
                        <a class="see-more" v-if="review.comment && review.comment.length > 30"
                          @click="openCommentModal(review.comment)">
                          ...See More
                        </a>
                      </td>
                      <td>
                        <span class="status-badge" :class="getReviewStatusBadge(review.status)">
                          {{ getReviewStatusTextForTable(review.status) }}
                        </span>
                      </td>
                      <td>
                        <template v-if="(review.id || review._id) === latestActiveReviewId">
                          <button class="action-btn action-btn-info"
                            @click="openReviewRequirementModal(review, { start: true })" title="Start Review">
                            <i class="fas fa-play"></i> Start
                          </button>
                        </template>
                        <template v-else>
                          <button class="action-btn" @click="openReviewDetailsModal(review)"
                            title="View Review Details">
                            <i class="fas fa-eye"></i> View
                          </button>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-history"></i>
                <p>{{ $t('risk.no_review_history_available') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Modal -->
    <div v-if="showCommentModal" class="modal-overlay" @click="closeCommentModal">
      <div class="modal-content-custom" @click.stop>
        <div class="modal-header-custom">
          <h5 class="modal-title-custom">Comment Details</h5>
          <button class="modal-close-btn" @click="closeCommentModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body-custom">
          <p class="full-comment">{{ selectedComment }}</p>
        </div>
        <div class="modal-footer-custom">
          <button class="btn-close-modal" @click="closeCommentModal">Close</button>
        </div>
      </div>
    </div>

    <!-- Review Details Modal -->
    <v-dialog v-model="isReviewDetailsModalOpen" max-width="1000px" persistent>
      <v-card class="review-details-modal">
        <!-- Header -->
        <v-card-title class="review-details-header">
          <div class="header-content">
            <span class="review-details-title">Review Details</span>
            <span class="review-type-badge" :class="getReviewTypeBadge(selectedReviewDetails.reviewType)">
              {{ getReviewTypeText(selectedReviewDetails.reviewType) }}
            </span>
          </div>
          <v-btn icon variant="text" @click="closeReviewDetailsModal" class="review-details-close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="review-details-body">
          <v-container fluid>
            <!-- Basic Information Section -->
            <v-card class="info-section-card mb-4" elevation="1">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-information</v-icon>
                Basic Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Review Type:</label>
                      <span class="detail-value">{{ getReviewTypeText(selectedReviewDetails.reviewType) || 'N/A'
                      }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Review Status:</label>
                      <span class="detail-value status-badge"
                        :class="getReviewStatusBadge(selectedReviewDetails.review_status_action)">
                        {{ getReviewStatusTextForTable(selectedReviewDetails.review_status_action) }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Created Date:</label>
                      <span class="detail-value">{{ formatDateTime(selectedReviewDetails.created_at) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Review Date:</label>
                      <span class="detail-value">{{ formatDate(selectedReviewDetails.date) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Reviewer:</label>
                      <span class="detail-value">{{ selectedReviewDetails.review_by || 'N/A' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6" v-if="selectedReviewDetails.reviewed_at">
                    <div class="detail-item">
                      <label class="detail-label">Reviewed At:</label>
                      <span class="detail-value">{{ formatDateTime(selectedReviewDetails.reviewed_at) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Trigger Information Section (For Triggered Reviews) -->
            <v-card class="info-section-card mb-4" elevation="1"
              v-if="selectedReviewDetails.reviewType === 'triggered'">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-alert-circle</v-icon>
                Trigger Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Trigger Reference:</label>
                      <span class="detail-value">{{ selectedReviewDetails.triggerReference || 'N/A' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Trigger Date:</label>
                      <span class="detail-value">{{ formatDate(selectedReviewDetails.triggerDate) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Selected Review:</label>
                      <span class="detail-value">{{ selectedReviewDetails.reviewName || 'N/A' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Action:</label>
                      <span class="detail-value">{{ getReviewActionText(selectedReviewDetails.action) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Scheduled Information Section (For Scheduled Reviews) -->
            <v-card class="info-section-card mb-4" elevation="1"
              v-if="selectedReviewDetails.reviewType === 'scheduled'">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-calendar</v-icon>
                Scheduled Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Next Review Date:</label>
                      <span class="detail-value">{{ formatDate(selectedReviewDetails.nextReviewDate) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Review Process Details Section -->
            <v-card class="info-section-card mb-4" elevation="1" v-if="hasReviewProcessData">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-clipboard-check</v-icon>
                Review Process Details
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Review Result:</label>
                      <span class="detail-value">{{ getReviewResultText(selectedReviewDetails.review_result) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Treatment Effectiveness:</label>
                      <span class="detail-value">{{
                        getTreatmentEffectivenessText(selectedReviewDetails.treatment_effectiveness) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Next Step:</label>
                      <span class="detail-value">{{ getNextStepText(selectedReviewDetails.next_step) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6" v-if="selectedReviewDetails.closure_reason">
                    <div class="detail-item">
                      <label class="detail-label">Closure Reason:</label>
                      <span class="detail-value">{{ selectedReviewDetails.closure_reason }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6" v-if="selectedReviewDetails.closure_date">
                    <div class="detail-item">
                      <label class="detail-label">Closure Date:</label>
                      <span class="detail-value">{{ formatDate(selectedReviewDetails.closure_date) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Risk Scoring Section -->
            <v-card class="info-section-card mb-4" elevation="1" v-if="hasRiskScoringData">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-chart-line</v-icon>
                Risk Scoring
              </v-card-title>
              <v-card-text>
                <v-row>
                  <!-- Current Risk Scores -->
                  <v-col cols="12">
                    <h4 class="risk-subtitle">Pervious Risk Scores</h4>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Current Likelihood:</label>
                      <span class="detail-value">{{ selectedReviewDetails.current_likelihood || 'N/A' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Current Impact:</label>
                      <span class="detail-value">{{ selectedReviewDetails.current_impact || 'N/A' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Current Inherent Risk:</label>
                      <span class="detail-value risk-score">{{ selectedReviewDetails.current_residual_risk || 'N/A'
                      }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-item">
                      <label class="detail-label">Current Residual Risk:</label>
                      <span class="detail-value risk-score">{{ selectedReviewDetails.current_residual_risk || 'N/A'
                      }}</span>
                    </div>
                  </v-col>

                  <!-- New Risk Scores (if changed) -->
                  <template v-if="selectedReviewDetails.review_result === 'change_score'">
                    <v-col cols="12">
                      <h4 class="risk-subtitle new-risk-title">New Risk Scores</h4>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="detail-item">
                        <label class="detail-label">New Likelihood:</label>
                        <span class="detail-value">{{ selectedReviewDetails.new_likelihood || 'N/A' }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="detail-item">
                        <label class="detail-label">New Impact:</label>
                        <span class="detail-value">{{ selectedReviewDetails.new_impact || 'N/A' }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="detail-item">
                        <label class="detail-label">New Inherent Risk:</label>
                        <span class="detail-value risk-score new-risk">
                          {{ selectedReviewDetails.new_inherent_risk || 'N/A' }}
                          <v-icon v-if="showRiskChangeIndicator" size="16" :color="getRiskChangeColor('inherent')"
                            class="ml-1">
                            {{ getRiskChangeIcon('inherent') }}
                          </v-icon>
                        </span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="detail-item">
                        <label class="detail-label">New Residual Risk:</label>
                        <span class="detail-value risk-score new-risk">
                          {{ selectedReviewDetails.new_residual_risk || 'N/A' }}
                          <v-icon v-if="showRiskChangeIndicator" size="16" :color="getRiskChangeColor('residual')"
                            class="ml-1">
                            {{ getRiskChangeIcon('residual') }}
                          </v-icon>
                        </span>
                      </div>
                    </v-col>
                  </template>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Review Content Section -->
            <v-card class="info-section-card mb-4" elevation="1">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-text-box</v-icon>
                Review Content
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <div class="detail-item">
                      <label class="detail-label">Comment:</label>
                      <div class="detail-value comment-box">
                        {{ selectedReviewDetails.comment || 'No comment provided' }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Selected Parameters Section -->
            <v-card class="info-section-card" elevation="1" v-if="hasSelectedLevels">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-format-list-bulleted</v-icon>
                Selected Parameters
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6" v-for="(level, index) in selectedReviewDetails.selected_levels" :key="index">
                    <div class="param-item">
                      <label class="param-label">{{ level.type === 'likelihood' ? 'Likelihood' : 'Impact' }} - {{
                        level.paramName }}:</label>
                      <span class="param-value">
                        {{ level.levelName }} (Level {{ level.levelNumber }})
                      </span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Additional Information Section -->
            <v-card class="info-section-card" elevation="1" v-if="hasAdditionalInfo">
              <v-card-title class="section-title">
                <v-icon size="20" class="mr-2" color="#6E3894">mdi-information-outline</v-icon>
                Additional Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6" v-if="selectedReviewDetails.requires_treatment_update">
                    <div class="detail-item">
                      <label class="detail-label">Requires Treatment Update:</label>
                      <span class="detail-value status-badge bg-warning">Yes</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6" v-if="selectedReviewDetails.reset_mitigation">
                    <div class="detail-item">
                      <label class="detail-label">Reset Mitigation:</label>
                      <span class="detail-value status-badge bg-error">Yes</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6" v-if="selectedReviewDetails.related_evidence">
                    <div class="detail-item">
                      <label class="detail-label">Related Evidence:</label>
                      <span class="detail-value">{{ selectedReviewDetails.related_evidence }}</span>
                    </div>
                  </v-col>
                  <!-- Display uploaded file if exists -->
                  <v-col cols="12" md="6" v-if="selectedReviewDetails.closure_evidence_filename">
                    <div class="detail-item">
                      <label class="detail-label">Uploaded Evidence:</label>
                      <span class="detail-value">
                        <a href="#" @click.prevent="downloadReviewDetailsFile" class="uploaded-file-link">
                          <v-icon size="16" class="mr-1">mdi-download</v-icon>
                          {{ selectedReviewDetails.closure_evidence_filename }}
                        </a>
                      </span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-container>
        </v-card-text>

        <!-- Footer -->
        <v-divider></v-divider>
        <v-card-actions class="review-details-footer">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey-darken-1" class="close-details-btn" @click="closeReviewDetailsModal">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Vuetify Reset Review Modal -->
    <v-dialog v-model="isResetReviewModalOpen" max-width="500px" persistent>
      <v-card class="reset-review-modal">
        <!-- Close Button - Top Right -->
        <v-btn icon variant="text" @click="closeModal" class="reset-review-close-icon">
          <v-icon size="24" color="#6B7280">mdi-close</v-icon>
        </v-btn>

        <v-card-text class="reset-review-body">
          <!-- Warning Icon -->
          <div class="reset-review-icon-wrapper">
            <div class="reset-review-icon-circle">
              <v-icon size="48" color="#F59E0B">mdi-alert</v-icon>
            </div>
          </div>

          <!-- Title -->
          <h2 class="reset-review-title">Reset Risk Review</h2>

          <!-- Message -->
          <p class="reset-review-message">
            Are You Sure To Reset The Review Of This Risk ?!!
          </p>
        </v-card-text>

        <!-- Footer Actions -->
        <v-card-actions class="reset-review-footer">
          <v-btn variant="outlined" class="reset-review-cancel-btn" @click="closeModal" block>
            Cancel
          </v-btn>
          <v-btn variant="flat" class="reset-review-submit-btn" @click="resetReview" block>
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Vuetify Perform Review Modal -->
    <v-dialog v-model="isPreformReviewModalOpen" max-width="1000px" persistent>
      <v-card class="perform-review-modal">
        <!-- Header -->
        <v-card-title class="perform-review-header">
          <span class="perform-review-title">{{ $t('risk.add_review') }}</span>
          <v-btn icon variant="text" @click="closeModal" class="perform-review-close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="perform-review-body">
          <v-container fluid>
            <v-expand-transition>
              <v-row>
                <!-- Review Type -->
                <v-col cols="12" md="6">
                  <label class="perform-review-label">{{ $t('risk.review_type') }}</label>
                  <v-select v-model="reviewData.reviewType" :items="[
                    { text: $t('risk.scheduled'), value: 'scheduled' },
                    { text: $t('risk.triggered'), value: 'triggered' }
                  ]" item-title="text" item-value="value" placeholder="Select" variant="outlined" density="comfortable"
                    hide-details="auto" class="perform-review-select" />
                </v-col>

                <!-- Scheduled Flow -->
                <v-col cols="12" md="6" v-if="reviewData.reviewType === 'scheduled'">
                  <label class="perform-review-label">{{ $t('risk.next_review_date') }}</label>
                  <v-text-field v-model="reviewData.next_review_date" type="date" variant="outlined"
                    density="comfortable" hide-details="auto" class="perform-review-input" />
                </v-col>

                <!-- Triggered Flow -->
                <template v-if="reviewData.reviewType === 'triggered'">
                  <v-col cols="12" md="6">
                    <label class="perform-review-label">{{ $t('risk.review_trigger') }}</label>
                    <v-select v-model="reviewData.review_id" :items="reviewOptions" item-title="name" item-value="id"
                      placeholder="Select" variant="outlined" density="comfortable" hide-details="auto"
                      class="perform-review-select" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <label class="perform-review-label">{{ $t('risk.select_action') }}</label>
                    <v-select v-model="reviewData.next_review" :items="[
                      { text: $t('risk.submit_as_production_issue'), value: 'Production Issue' },
                      { text: $t('risk.accept_until_next_review'), value: 'Accept Until The Next Review' }
                    ]" item-title="text" item-value="value" placeholder="Select" variant="outlined"
                      density="comfortable" hide-details="auto" class="perform-review-select" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <label class="perform-review-label">{{ $t('risk.trigger_reference') }}</label>
                    <v-text-field v-model="reviewData.triggerReference" placeholder="Enter trigger reference"
                      variant="outlined" density="comfortable" hide-details="auto" class="perform-review-input" />
                  </v-col>

                  <v-col cols="12" md="6">
                    <label class="perform-review-label">{{ $t('risk.trigger_date') }}</label>
                    <v-text-field v-model="reviewData.triggerDate" type="date" variant="outlined" density="comfortable"
                      hide-details="auto" class="perform-review-input" />
                  </v-col>
                </template>

                <!-- Review Status -->
                <v-col cols="12" md="6">
                  <label class="perform-review-label">{{ $t('risk.review_status') }}</label>
                  <v-select v-model="reviewData.review_status_action" :items="[
                    { text: $t('risk.pending'), value: 'pending' },
                    { text: $t('risk.in_progress'), value: 'in_progress' },
                    { text: $t('risk.completed'), value: 'completed' }
                  ]" item-title="text" item-value="value" placeholder="Select" variant="outlined" density="comfortable"
                    hide-details="auto" class="perform-review-select" />
                </v-col>

                <!-- Comment -->
                <v-col cols="12">
                  <label class="perform-review-label">{{ $t('risk.comment') }}</label>
                  <v-textarea v-model="reviewData.comment" placeholder="Enter your comments..." rows="3" auto-grow
                    variant="outlined" density="comfortable" hide-details="auto" class="perform-review-textarea" />
                </v-col>
              </v-row>
            </v-expand-transition>
          </v-container>
        </v-card-text>

        <!-- Footer -->
        <v-divider></v-divider>
        <v-card-actions class="perform-review-footer">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey-darken-1" class="perform-review-cancel-btn" @click="closeModal"
            :disabled="isLoadingPerFormReview">
            {{ $t('risk.cancel') }}
          </v-btn>
          <v-btn color="primary" variant="flat" class="perform-review-save-btn" @click="preformReview"
            :disabled="!isReviewFormValid || isLoadingPerFormReview" :loading="isLoadingPerFormReview">
            {{ $t('risk.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Updated Review Requirement Modal -->
    <v-dialog v-model="isReviewRequirementModalOpen" max-width="1000px" persistent>
      <v-card class="review-modal">
        <!-- Header -->
        <v-card-title class="modal-header">
          <span class="modal-title">Review Requirements</span>
          <v-btn icon variant="text" @click="closeModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="modal-body">
          <v-container fluid>
            <!-- Review Status and Review Result Row -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <label class="field-label">Review Status</label>
                <v-select v-model="reviewProcess.review_status" :items="reviewStatusOptions" item-title="text"
                  item-value="value" placeholder="Select" variant="outlined" density="comfortable"
                  :rules="[v => !!v || 'Review status is required']" required :disabled="viewOnlyMode"
                  hide-details="auto" class="custom-select" />
              </v-col>

              <v-col cols="12" md="6">
                <label class="field-label">Review Result</label>
                <v-select v-model="reviewProcess.review_result" :items="reviewResultOptions" item-title="text"
                  item-value="value" placeholder="Change Risk Score" variant="outlined" density="comfortable"
                  :rules="[v => !!v || 'Review result is required']" required
                  @update:modelValue="handleReviewResultChange" :disabled="viewOnlyMode" hide-details="auto"
                  class="custom-select" />
              </v-col>
            </v-row>

            <!-- Change Risk Score Section -->
            <template v-if="reviewProcess.review_result === 'change_score'">
              <v-card class="change-score-card mb-4" elevation="0">
                <!-- Likelihood and Impact Row -->
                <v-row class="mb-3">
                  <v-col cols="12" md="6">
                    <label class="field-label-inside">Likelihood:</label>
                    <v-text-field v-model="selectedLikelihoodLabel" placeholder="Select Likelihood" variant="outlined"
                      density="comfortable" readonly @click="!viewOnlyMode && openParamsModal('likelihood')"
                      :disabled="viewOnlyMode" hide-details="auto" class="card-input-field"
                      append-inner-icon="mdi-chevron-down">
                      <template v-slot:prepend-inner>
                        <v-icon size="20" color="#6E3894">mdi-cursor-pointer</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <label class="field-label-inside">Impact:</label>
                    <v-text-field v-model="selectedImpactLabel" placeholder="Select Impact" variant="outlined"
                      density="comfortable" readonly @click="!viewOnlyMode && openParamsModal('impact')"
                      :disabled="viewOnlyMode" hide-details="auto" class="card-input-field"
                      append-inner-icon="mdi-chevron-down">
                      <template v-slot:prepend-inner>
                        <v-icon size="20" color="#6E3894">mdi-cursor-pointer</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>

                <!-- Calculation Result Section -->
                <div class="calculation-result-box">
                  <div class="result-header-box">
                    <h6 class="result-title-box">Calculation Result</h6>
                    <p class="result-subtitle-box">{{ calculationMessage || '"No Change Detected. Click \'Calculate Risk\' To Confirm Values."' }}</p>
                  </div>

                  <v-row class="risk-values-row">
                    <v-col cols="6" md="3">
                      <div class="risk-item">
                        <div class="risk-label-text">Current Inherent Risk:</div>
                        <div class="risk-value-text current-risk">{{ currentInherentRisk || '12.0' }}</div>
                      </div>
                    </v-col>

                    <v-col cols="6" md="3">
                      <div class="risk-item">
                        <div class="risk-label-text">Current Residual Risk:</div>
                        <div class="risk-value-text current-risk">{{ currentResidualRisk || '6.5' }}</div>
                      </div>
                    </v-col>

                    <v-col cols="6" md="3">
                      <div class="risk-item">
                        <div class="risk-label-text">Current Inherent Risk:</div>
                        <div class="risk-value-text new-risk">
                          <v-icon size="16" color="#10B981">mdi-arrow-down</v-icon>
                          {{ calculatedNewInherentRisk || '6.0' }}
                        </div>
                      </div>
                    </v-col>

                    <v-col cols="6" md="3">
                      <div class="risk-item">
                        <div class="risk-label-text">Current Inherent Risk:</div>
                        <div class="risk-value-text new-risk">
                          <v-icon size="16" color="#10B981">mdi-arrow-down</v-icon>
                          {{ calculatedNewResidualRisk || '6.0' }}
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <div class="calculate-btn-wrapper">
                    <v-btn color="primary" variant="flat" @click="calculateNewRisk" :disabled="!canCalculateRisk"
                      :loading="isCalculating" class="calculate-risk-btn">
                      Calculate Risk
                    </v-btn>
                  </div>
                </div>
              </v-card>
            </template>

            <!-- Treatment Plan Effectiveness and Next Step Row -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <label class="field-label">Treatment Plan Effectiveness</label>
                <v-select v-model="reviewProcess.treatment_effectiveness" :items="treatmentEffectivenessOptions"
                  item-title="text" item-value="value" placeholder="Select" variant="outlined" density="comfortable"
                  :rules="[v => !!v || 'Treatment effectiveness is required']" required
                  @update:modelValue="handleTreatmentEffectivenessChange" :disabled="viewOnlyMode" hide-details="auto"
                  class="custom-select" />
              </v-col>

              <v-col cols="12" md="6">
                <label class="field-label">Next Step</label>
                <v-select v-model="reviewProcess.next_step" :items="nextStepOptions" item-title="text"
                  item-value="value" placeholder="Select" variant="outlined" density="comfortable"
                  :rules="[v => !!v || 'Next step is required']" required :disabled="viewOnlyMode" hide-details="auto"
                  class="custom-select" />
              </v-col>
            </v-row>

            <!-- Review Comment -->
            <v-row class="mb-4">
              <v-col cols="12">
                <label class="field-label">Review Comment</label>
                <v-textarea v-model="reviewProcess.comment" variant="outlined" rows="3" auto-grow density="comfortable"
                  placeholder="Enter your review comments..." :disabled="viewOnlyMode" hide-details="auto"
                  class="custom-textarea" />
              </v-col>
            </v-row>

            <v-row class="mb-4">
              <v-col cols="12">
                <label class="field-label">Upload File</label>

                <!-- Updated upload area: adds hidden file input and shows selected filename / link -->
                <div class="upload-area" @click="selectFile">
                  <input ref="fileInput" type="file" style="display:none" @change="handleFileChange" />
                  <v-icon size="32">mdi-upload</v-icon>

                  <!-- If we have a server file URL show clickable link with download icon -->
                  <p v-if="selectedUploadedFileName && selectedUploadedFileUrl">
                    <a href="#" @click.stop.prevent="downloadUploadedFile" class="uploaded-file-link">
                      <v-icon size="16" class="mr-1">mdi-download</v-icon>
                      {{ selectedUploadedFileName }}
                    </a>
                  </p>
                  <!-- If we only have filename (locally selected, not saved yet) -->
                  <p v-else-if="selectedUploadedFileName">
                    <v-icon size="16" class="mr-1">mdi-file</v-icon>
                    {{ selectedUploadedFileName }}
                  </p>
                  <!-- Default state -->
                  <p v-else>Click to Upload File</p>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <!-- Footer -->
        <v-divider></v-divider>
        <v-card-actions class="modal-footer">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="grey-darken-1" class="cancel-btn" @click="closeModal" :disabled="isLoading">
            Cancel
          </v-btn>
          <v-btn v-if="!viewOnlyMode" color="primary" variant="flat" class="save-btn" @click="previewReview"
            :loading="isLoading" :disabled="isLoading">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Likelihood/Impact Selection Modal -->
    <v-dialog v-model="showParamsModal" max-width="500px">
      <v-card>
        <v-card-title class="modal-header">
          <span class="modal-title">Select {{ paramType === 'likelihood' ? 'Likelihood' : 'Impact' }}</span>
          <v-btn icon variant="text" @click="closeParamsModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-list>
            <v-list-item v-for="option in currentParamOptions" :key="option.value" @click="selectParam(option)"
              class="param-option">
              <v-list-item-title class="param-option-text">
                {{ option.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <ParamsModal v-model:show="showParamsModal" :modalTitle="modalTitle" :activeParams="activeParams"
      :initialSelectedLevels="modalSelectedLevels" @apply="applySelectedParams" />
  </div>
</template>

<script>
import feather from "feather-icons";
import { nextTick } from "vue";
import risk from "@/API/Risk/Risk";
import { notify } from "@kyvg/vue3-notification";
import Auth from "@/API/Auth";
import ParamsModal from "@/views/Page/Risk/CreateRisk/ParamsModal.vue";
import { RiskCalculator } from "@/API/Risk/RiskCalculator";
import ChangeStatusModal from "@/views/Page/Risk/RiskManagement/ChangeStatusModal.vue";
import CloseRiskModal from "@/views/Page/Risk/RiskManagement/CloseRiskModal.vue";
import Swal from "sweetalert2";
import RiskScoringHistory from "@/API/RiskScoringHistory/RiskScoringHistory";
import axios from 'axios';

export default {
  name: "RiskReview",
  components: {
    ParamsModal,
    ChangeStatusModal,
    CloseRiskModal
  },
  setup() {
    const api = new risk();
    const USER_ID = Auth.USER.id;
    const riskCalculator = new RiskCalculator();
    const riskScoringHistory = new RiskScoringHistory();
    const basePath = axios.defaults.baseURL;

    return {
      api,
      USER_ID,
      riskCalculator,
      riskScoringHistory,
      basePath
    };
  },
  props: {
    rowData: {
      type: Object,
      required: true
    },
    apiData: {
      type: Object,
      default: () => ({})
    },
    dropdownOptions: {
      type: Object,
      default: () => ({})
    },
  },
  emits: ['risk-updated'],
  data() {
    return {
      currentReview: null,
      isReviewRequirementModalOpen: false,
      isReviewDetailsModalOpen: false,
      selectedReviewDetails: {},
      isLoading: false,
      isCalculating: false,
      showCommentModal: false,
      selectedComment: '',
      calculationMessage: '',
      // Review Process Data
      reviewProcess: {
        review_status: null,
        review_result: null,
        new_likelihood: null,
        new_impact: null,
        new_inherent_risk: null,
        new_residual_risk: null,
        closure_reason: '',
        closure_date: '',
        closure_evidence: null,
        treatment_effectiveness: null,
        related_evidence: null,
        comment: '',
        next_step: null,
      },

      // Risk calculation
      currentInherentRisk: 0,
      currentResidualRisk: 0,

      // Modal states
      selectedAction: '',
      isCloseRiskModalOpen: false,
      isStatusModalOpen: false,
      isAccordionOpen: null,
      selectedStatus: '',
      closeOutInformation: '',
      isResetReviewModalOpen: false,
      isPreformReviewModalOpen: false,
      viewOnlyMode: false,

      // Review data
      reviewHistory: [],
      reviewData: {
        reviewType: null,
        review_id: null,
        next_review_date: null,
        next_review: null,
        comment: null,
        triggerReference: null,
        triggerDate: null,
        review_status_action: 'pending'
      },

      // Risk parameters
      selectedLikelihoodValue: null,
      selectedImpactValue: null,
      selectedLikelihoodLabel: "",
      selectedImpactLabel: "",
      showParamsModal: false,
      modalTitle: "",
      activeParams: [],
      modalSelectedLevels: {},
      currentParamType: "",
      selectedLevels: [],

      // Loading states
      isLoadingPerFormReview: false,

      // Risk data
      riskData: null,
      residual_risk: 0,
      inherent_risk: 0,
      reviewOptions: [],
      currentImpact: null,
      currentLikelihood: null,

      // Options
      statusOptions: [
        { text: 'New', value: 'New' },
        { text: 'Mitigation Planned', value: 'Mitigation Planned' },
        { text: 'Mgmt Reviewed', value: 'Mgmt Reviewed' },
        { text: 'Closed Risk', value: 'Closed Risk' },
        { text: 'Reopened', value: 'Reopened' },
        { text: 'Reject', value: 'Reject' }
      ],

      // File upload state
      selectedUploadedFileName: '',
      selectedUploadedFileUrl: null,
    };
  },
  computed: {
    // ========== NEW COMPUTED PROPERTIES FOR REVIEW DETAILS MODAL ==========
    hasReviewProcessData() {
      return this.selectedReviewDetails.review_result ||
        this.selectedReviewDetails.treatment_effectiveness ||
        this.selectedReviewDetails.next_step ||
        this.selectedReviewDetails.closure_reason ||
        this.selectedReviewDetails.closure_date;
    },

    hasRiskScoringData() {
      return this.selectedReviewDetails.current_likelihood !== undefined ||
        this.selectedReviewDetails.current_impact !== undefined ||
        this.selectedReviewDetails.current_inherent_risk !== undefined ||
        this.selectedReviewDetails.current_residual_risk !== undefined ||
        this.selectedReviewDetails.new_likelihood !== undefined ||
        this.selectedReviewDetails.new_impact !== undefined ||
        this.selectedReviewDetails.new_inherent_risk !== undefined ||
        this.selectedReviewDetails.new_residual_risk !== undefined;
    },

    hasSelectedLevels() {
      return this.selectedReviewDetails.selected_levels &&
        Array.isArray(this.selectedReviewDetails.selected_levels) &&
        this.selectedReviewDetails.selected_levels.length > 0;
    },

    hasAdditionalInfo() {
      return this.selectedReviewDetails.requires_treatment_update !== undefined ||
        this.selectedReviewDetails.reset_mitigation !== undefined ||
        this.selectedReviewDetails.related_evidence !== undefined ||
        this.selectedReviewDetails.closure_evidence_filename !== undefined;
    },

    showRiskChangeIndicator() {
      if (!this.selectedReviewDetails.new_inherent_risk || !this.selectedReviewDetails.new_residual_risk) return false;
      return this.selectedReviewDetails.new_inherent_risk !== this.selectedReviewDetails.current_inherent_risk ||
        this.selectedReviewDetails.new_residual_risk !== this.selectedReviewDetails.current_residual_risk;
    },

    // ========== DROPDOWN OPTIONS ==========
    reviewStatusOptions() {
      return [
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Completed', value: 'completed' }
      ];
    },
    reviewResultOptions() {
      return [
        { text: 'No Change', value: 'no_change' },
        { text: 'Change Risk Score', value: 'change_score' },
        { text: 'Close Risk', value: 'close_risk' }
      ];
    },
    treatmentEffectivenessOptions() {
      return [
        { text: 'Effective', value: 'effective' },
        { text: 'Needs Update', value: 'needs_update' },
        { text: 'Failed', value: 'failed' }
      ];
    },
    nextStepOptions() {
      return [
        { text: 'Re-Assess', value: 're_assess' },
        { text: 'No Action', value: 'no_action' }
      ];
    },

    // ========== RISK CALCULATION PROPERTIES ==========
    maxLikelihood() {
      return Math.max(...this.likelihoodOptions.map(opt => opt.value || opt.levelNumber)) || 5;
    },
    maxImpact() {
      return Math.max(...this.impactOptions.map(opt => opt.value || opt.levelNumber)) || 5;
    },

    // ========== CALCULATION BUTTON STATES ==========
    calculateButtonText() {
      if (!this.canCalculateRisk) return 'Select Likelihood & Impact';
      if (this.requiresRiskCalculation) return 'Calculate Risks Before Submit';
      if (this.hasRiskChanges) return 'Recalculate Risks';
      return 'Calculate New Risks';
    },
    calculateButtonIcon() {
      if (this.requiresRiskCalculation) return 'mdi-alert-circle';
      if (this.hasRiskChanges) return 'mdi-calculator-variant';
      return 'mdi-calculator';
    },
    calculateButtonClass() {
      if (this.requiresRiskCalculation) return 'calculate-button-warning';
      if (this.hasRiskChanges) return 'calculate-button-success';
      return '';
    },

    // ========== VALIDATION STATES ==========
    canCalculateRisk() {
      return this.hasNewLikelihood && this.hasNewImpact;
    },
    hasNewLikelihood() {
      return this.reviewProcess.new_likelihood !== null && this.reviewProcess.new_likelihood !== undefined;
    },
    hasNewImpact() {
      return this.reviewProcess.new_impact !== null && this.reviewProcess.new_impact !== undefined;
    },
    hasRiskChanges() {
      return this.reviewProcess.new_residual_risk !== null && this.reviewProcess.new_inherent_risk !== null;
    },
    requiresRiskCalculation() {
      return this.reviewProcess.review_result === 'change_score' && !this.hasRiskChanges;
    },
    showCalculationValidation() {
      return this.reviewProcess.review_result === 'change_score' && (!this.hasNewLikelihood || !this.hasNewImpact || !this.hasRiskChanges);
    },

    // ========== RISK DISPLAY VALUES ==========
    calculatedNewInherentRisk() {
      return this.reviewProcess.new_inherent_risk !== null ? this.reviewProcess.new_inherent_risk : 'Not calculated';
    },
    calculatedNewResidualRisk() {
      return this.reviewProcess.new_residual_risk !== null ? this.reviewProcess.new_residual_risk : 'Not calculated';
    },

    // ========== RISK VISUAL INDICATORS ==========
    newInherentRiskClass() {
      const newRisk = Number(this.reviewProcess.new_inherent_risk);
      if (isNaN(newRisk)) return 'text-grey';
      if (newRisk > Number(this.currentInherentRisk)) return 'text-error';
      if (newRisk < Number(this.currentInherentRisk)) return 'text-success';
      return 'text-warning';
    },
    newResidualRiskClass() {
      const newRisk = Number(this.reviewProcess.new_residual_risk);
      if (isNaN(newRisk)) return 'text-grey';
      if (newRisk > Number(this.currentResidualRisk)) return 'text-error';
      if (newRisk < Number(this.currentResidualRisk)) return 'text-success';
      return 'text-warning';
    },
    newInherentRiskIcon() {
      const newRisk = Number(this.reviewProcess.new_inherent_risk);
      if (isNaN(newRisk)) return 'mdi-minus';
      if (newRisk > Number(this.currentInherentRisk)) return 'mdi-arrow-up';
      if (newRisk < Number(this.currentInherentRisk)) return 'mdi-arrow-down';
      return 'mdi-minus';
    },
    newInherentRiskTooltip() {
      const newRisk = Number(this.reviewProcess.new_inherent_risk);
      if (isNaN(newRisk)) return 'No calculated inherent risk';
      if (newRisk > Number(this.currentInherentRisk)) return 'Inherent risk increased';
      if (newRisk < Number(this.currentInherentRisk)) return 'Inherent risk decreased';
      return 'No change in inherent risk';
    },
    newResidualRiskIcon() {
      const newRisk = Number(this.reviewProcess.new_residual_risk);
      if (isNaN(newRisk)) return 'mdi-minus';
      if (newRisk > Number(this.currentResidualRisk)) return 'mdi-arrow-up';
      if (newRisk < Number(this.currentResidualRisk)) return 'mdi-arrow-down';
      return 'mdi-minus';
    },
    newResidualRiskTooltip() {
      const newRisk = Number(this.reviewProcess.new_residual_risk);
      if (isNaN(newRisk)) return 'No calculated residual risk';
      if (newRisk > Number(this.currentResidualRisk)) return 'Residual risk increased';
      if (newRisk < Number(this.currentResidualRisk)) return 'Residual risk decreased';
      return 'No change in residual risk';
    },

    // ========== TREATMENT EFFECTIVENESS ==========
    treatmentEffectivenessAlertType() {
      switch (this.reviewProcess.treatment_effectiveness) {
        case 'effective': return 'success';
        case 'needs_update': return 'warning';
        case 'failed': return 'error';
        default: return 'info';
      }
    },
    treatmentEffectivenessMessage() {
      switch (this.reviewProcess.treatment_effectiveness) {
        case 'effective': return 'Treatment plan is working as intended. Marking as successful.';
        case 'needs_update': return 'Treatment plan requires updates. Redirecting to treatment update.';
        case 'failed': return 'Treatment plan has failed. Resetting current mitigation and creating new plan.';
        default: return 'Select treatment plan effectiveness';
      }
    },

    // ========== VALIDATION ==========
    validationErrors() {
      const errors = [];
      if (!this.reviewProcess.review_status) errors.push('Review Status');
      if (!this.reviewProcess.review_result) errors.push('Review Result');
      if (!this.reviewProcess.treatment_effectiveness) errors.push('Treatment Plan Effectiveness');
      if (!this.reviewProcess.next_step) errors.push('Next Step');

      if (this.reviewProcess.review_result === 'change_score') {
        if (!this.reviewProcess.new_likelihood || !this.reviewProcess.new_impact) errors.push('New Likelihood and Impact scores');
      }

      if (this.reviewProcess.review_result === 'close_risk') {
        if (!this.reviewProcess.closure_reason) errors.push('Closure Reason');
        if (!this.reviewProcess.closure_date) errors.push('Closure Date');
      }

      return errors;
    },

    // ========== EXISTING COMPUTED PROPERTIES ==========
    reviewOptions() {
      return this.dropdownOptions?.reviewOptions || [];
    },
    appetiteToleranceOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(option => option.type === 'appetitetolerance') || [];
    },
    riskFormulaOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(option => option.type === 'risk_calculation_formula') || [];
    },
    likelihoodOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(option => option.type === 'likelihoods') || [];
    },
    impactOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(option => option.type === 'impacts') || [];
    },
    controlOptions() {
      return this.dropdownOptions.controlOptions || [];
    },
    userOptions() {
      return this.dropdownOptions.userOptions || [];
    },
    isHistoryOpen() {
      return this.isAccordionOpen === "history";
    },
    isInfoOpen() {
      return this.isAccordionOpen === "info";
    },
    hasReviewData() {
      return this.rowData && this.rowData.reviews && this.rowData.reviews.length > 0;
    },
    latestActiveReviewId() {
      if (!this.hasReviewData) return null;
      const sorted = [...this.rowData.reviews].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      const latestActive = sorted.find(r => {
        const status = (r.review_status_action || r.review_status || '').toString();
        return ['in_progress', 'pending'].includes(status);
      });
      return latestActive ? (latestActive.id || latestActive._id || null) : null;
    },
    lastReview() {
      if (this.hasReviewData) {
        const sortedReviews = [...this.rowData.reviews].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        return sortedReviews[0];
      }
      return null;
    },
    isReviewFormValid() {
      if (this.reviewData.reviewType === 'scheduled') return !!this.reviewData.next_review_date;
      if (this.reviewData.reviewType === 'triggered') {
        return this.reviewData.review_id && this.reviewData.next_review && this.reviewData.triggerReference && this.reviewData.triggerDate;
      }
      return false;
    },
    getLastReviewStatusText() {
      if (!this.hasReviewData) return this.$t('risk.no_review');
      const status = this.lastReview?.review_status_action || '';
      return this.getReviewStatusTextForTable(status);
    },
    getLastReviewStatusBadgeClass() {
      if (!this.hasReviewData) return 'bg-secondary';
      const status = this.lastReview?.review_status_action || 'pending';
      return this.getReviewStatusBadge(status);
    },
    getLastReviewTypeText() {
      if (!this.lastReview) return 'N/A';
      if (this.lastReview.reviewType === 'scheduled') return this.$t('risk.scheduled');
      if (this.lastReview.reviewType === 'triggered') return this.$t('risk.triggered');
      return 'N/A';
    },
    riskCloseReasonOptions() {
      return this.dropdownOptions.riskCloseReasonOptions || [];
    },
  },

  async mounted() {
    this.selectedStatus = this.rowData.status;
    feather.replace();
    await this.loadReviewHistory();
    await this.initializeRiskData();
    await this.settingForImpact();
    this.initializeComponent();
    nextTick(() => {
      feather.replace();
    });
  },
  methods: {
    // ========== NEW METHODS FOR REVIEW DETAILS MODAL ==========
    openReviewDetailsModal(review) {
      this.selectedReviewDetails = { ...review };
      this.isReviewDetailsModalOpen = true;
    },

    closeReviewDetailsModal() {
      this.isReviewDetailsModalOpen = false;
      this.selectedReviewDetails = {};
    },

    getReviewResultText(result) {
      switch (result) {
        case 'no_change': return 'No Change';
        case 'change_score': return 'Change Risk Score';
        case 'close_risk': return 'Close Risk';
        default: return result || 'N/A';
      }
    },

    getTreatmentEffectivenessText(effectiveness) {
      switch (effectiveness) {
        case 'effective': return 'Effective';
        case 'needs_update': return 'Needs Update';
        case 'failed': return 'Failed';
        default: return effectiveness || 'N/A';
      }
    },

    getNextStepText(step) {
      switch (step) {
        case 're_assess': return 'Re-Assess';
        case 'no_action': return 'No Action';
        default: return step || 'N/A';
      }
    },

    getReviewTypeText(reviewType) {
      switch (reviewType) {
        case 'scheduled': return this.$t('risk.scheduled');
        case 'triggered': return this.$t('risk.triggered');
        default: return reviewType || 'N/A';
      }
    },

    getReviewTypeBadge(reviewType) {
      switch (reviewType) {
        case 'scheduled': return 'bg-info';
        case 'triggered': return 'bg-warning';
        default: return 'bg-secondary';
      }
    },

    getRiskChangeColor(type) {
      if (!this.selectedReviewDetails[`new_${type}_risk`] || !this.selectedReviewDetails[`current_${type}_risk`]) return 'grey';
      const newRisk = Number(this.selectedReviewDetails[`new_${type}_risk`]);
      const currentRisk = Number(this.selectedReviewDetails[`current_${type}_risk`]);
      if (newRisk > currentRisk) return 'error';
      if (newRisk < currentRisk) return 'success';
      return 'warning';
    },

    getRiskChangeIcon(type) {
      if (!this.selectedReviewDetails[`new_${type}_risk`] || !this.selectedReviewDetails[`current_${type}_risk`]) return 'mdi-minus';
      const newRisk = Number(this.selectedReviewDetails[`new_${type}_risk`]);
      const currentRisk = Number(this.selectedReviewDetails[`current_${type}_risk`]);
      if (newRisk > currentRisk) return 'mdi-arrow-up';
      if (newRisk < currentRisk) return 'mdi-arrow-down';
      return 'mdi-minus';
    },

    // ========== PUBLIC METHODS (Called from Parent) ==========
    openPerformReviewModal() {
      this.resetReviewData();
      this.isPreformReviewModalOpen = true;
    },

    openResetReviewModal() {
      this.isResetReviewModalOpen = true;
    },

    // ========== RISK CALCULATION METHODS ==========
    async initializeRiskData() {
      const result = await this.riskCalculator.refreshInhertedRisk(
        this.rowData,
        this.controlOptions,
        this.likelihoodOptions,
        this.impactOptions,
        this.riskFormulaOptions
      );
      this.riskData = result.riskData;
      this.inherent_risk = result.inherent_risk;
      this.residual_risk = result.residual_risk;
      this.currentResidualRisk = result.residual_risk;
      this.currentInherentRisk = result.inherent_risk;
    },

    async calculateRiskWithTreatment(riskData, likelihood, impact) {
      try {
        const tempRiskData = { ...riskData, current_likelihood: likelihood, current_impact: impact };
        const result = await this.riskCalculator.refreshInhertedRisk(
          tempRiskData,
          this.controlOptions,
          this.likelihoodOptions,
          this.impactOptions,
          this.riskFormulaOptions
        );

        const inherentRisk = result?.riskData?.risk ?? 0;
        const inherent = parseFloat(inherentRisk || 0);
        let calculatedResidual = inherent;
        const decision = riskData.selected_treatment_decision;

        if (decision && riskData.mitigation_status !== 'noMitigation') {
          if (decision === "mitigating") {
            const manualPct = parseFloat(riskData.mitigation_percent || 0);
            const controlPercents = (riskData.mitigation_control_ids || [])
              .map(id => {
                const found = this.controlOptions.find(c => c.id === id);
                return found ? found.mitigation_percent || 0 : 0;
              });
            const maxControlPct = controlPercents.length > 0 ? Math.max(...controlPercents) : 0;
            const effectivePct = Math.max(manualPct, maxControlPct);
            calculatedResidual = Number((inherent * (1 - effectivePct / 100)).toFixed(1));
          } else if (decision === "sharing") {
            const coverage = parseFloat(riskData.coverage_percent || 0) / 100;
            calculatedResidual = Number((inherent - inherent * coverage).toFixed(1));
          } else if (decision === "avoiding") {
            calculatedResidual = 0;
          } else if (decision === "accepting") {
            calculatedResidual = inherent;
          }
        }

        return { inherent, residual: calculatedResidual };
      } catch (error) {
        console.error('Error calculating risk with treatment:', error);
        return { inherent: 0, residual: 0 };
      }
    },

    async calculateNewRisk() {
      if (!this.canCalculateRisk) {
        notify({ title: "Cannot Calculate", text: "Please select both new likelihood and impact values", type: "warning" });
        return;
      }

      this.isCalculating = true;
      try {
        const newRisks = await this.calculateRiskWithTreatment(
          this.rowData,
          this.reviewProcess.new_likelihood,
          this.reviewProcess.new_impact
        );

        this.reviewProcess.new_inherent_risk = newRisks.inherent;
        this.reviewProcess.new_residual_risk = newRisks.residual;

        const inherentChange = newRisks.inherent - this.currentInherentRisk;
        const residualChange = newRisks.residual - this.currentResidualRisk;
        let message = `New inherent risk: ${newRisks.inherent}, New residual risk: ${newRisks.residual}`;

        if (inherentChange !== 0 || residualChange !== 0) {
          message += `\nRisk ${inherentChange > 0 || residualChange > 0 ? 'increased' : 'decreased'}`;
          this.calculationMessage = `Risk ${inherentChange > 0 || residualChange > 0 ? 'increased' : 'decreased'}`;
        } else {
          message += `\nNo change in risk levels`;
          this.calculationMessage = 'No change in risk levels';
        }

        notify({
          title: "Risk Recalculated",
          text: message,
          type: inherentChange > 0 || residualChange > 0 ? "warning" : "info",
        });
      } catch (error) {
        console.error('Error calculating new risk:', error);
        notify({ title: "Calculation Error", text: "Failed to calculate new risk values", type: "error" });
      } finally {
        this.isCalculating = false;
      }
    },

    async settingForImpact() {
      this.selectedImpactLabel = this.riskCalculator.getImpactName(this.rowData?.current_impact, this.impactOptions);
      this.selectedLikelihoodLabel = this.riskCalculator.getLikelihoodName(this.rowData?.current_likelihood, this.likelihoodOptions);
      this.currentImpact = this.rowData?.current_impact;
      this.currentLikelihood = this.rowData?.current_likelihood;
      this.selectedLikelihoodValue = this.rowData?.current_likelihood;
      this.selectedImpactValue = this.rowData?.current_impact;

      const currentRisks = await this.calculateRiskWithTreatment(
        this.rowData,
        this.rowData.current_likelihood,
        this.rowData.current_impact
      );

      this.currentInherentRisk = currentRisks.inherent;
      this.currentResidualRisk = currentRisks.residual;

      this.reviewProcess.new_likelihood = this.rowData?.current_likelihood;
      this.reviewProcess.new_impact = this.rowData?.current_impact;
      this.reviewProcess.new_inherent_risk = this.currentInherentRisk;
      this.reviewProcess.new_residual_risk = this.currentResidualRisk;
    },

    // ========== REVIEW PROCESS HANDLERS ==========
    handleReviewResultChange(result) {
      if (result === 'no_change') {
        this.reviewProcess.new_likelihood = null;
        this.reviewProcess.new_impact = null;
        this.reviewProcess.new_residual_risk = null;
        this.reviewProcess.new_inherent_risk = null;
        this.calculationMessage = '';
      } else if (result === 'change_score') {
        this.reviewProcess.new_likelihood = this.rowData?.current_likelihood;
        this.reviewProcess.new_impact = this.rowData?.current_impact;
      } else if (result === 'close_risk') {
        this.reviewProcess.closure_date = new Date().toISOString().split('T')[0];
      }
    },

    handleTreatmentEffectivenessChange(effectiveness) {
      console.log(`Treatment plan marked as: ${effectiveness}`);
      if (effectiveness === 'needs_update') {
        this.$emit('redirect-to-treatment-update', this.rowData.id);
      } else if (effectiveness === 'failed') {
        console.log('Resetting current mitigation and creating new plan');
      }
    },

    async previewReview() {
      const errors = this.validationErrors;
      if (errors.length > 0) {
        const fieldList = errors.join(', ');
        notify({
          title: "Validation Error",
          text: `Please complete required fields: ${fieldList}`,
          type: "error",
        });
        return;
      }

      this.isLoading = true;

      try {
        const riskId = this.rowData?.id || this.rowData?._id;

        const payload = {
          risk_id: riskId,
          review_id: this.currentReview?.id,
          ...this.reviewProcess,
          current_likelihood: this.rowData?.current_likelihood,
          current_impact: this.currentInherentRisk,
          current_residual_risk: this.currentResidualRisk,
          reviewed_by: this.USER_ID,
          reviewed_at: new Date().toISOString(),
          selected_levels: this.selectedLevels,
        };

        if (payload.review_result === "change_score") {
          const dataScoring = {
            risk_id: riskId,
            residual: payload.new_residual_risk,
            inhertent: payload.new_inherent_risk,
            formula: this.riskFormulaOptions[0]?.data || "",
          };

          await this.riskScoringHistory.insert(dataScoring);
        }

        if (this.reviewProcess.treatment_effectiveness === "needs_update") {
          payload.requires_treatment_update = true;
        } else if (this.reviewProcess.treatment_effectiveness === "failed") {
          payload.reset_mitigation = true;
        }

        let response;
        const hasFile = Object.values(payload).some(v => v instanceof File);
        if (hasFile) {
          const formData = new FormData();
          for (const key in payload) {
            if (payload[key] instanceof File) {
              formData.append(key, payload[key]);
            } else if (payload[key] !== undefined && payload[key] !== null) {
              if (typeof payload[key] === 'object') formData.append(key, JSON.stringify(payload[key]));
              else formData.append(key, String(payload[key]));
            }
          }
          response = await this.api.previewReview(formData);
        } else {
          response = await this.api.previewReview(payload);
        }

        if (response.status !== "success") {
          throw new Error(response.message || "Failed to save review");
        }

        notify({
          title: "Review Saved Successfully",
          text: "Risk review has been completed and saved.",
          type: "success",
        });

        this.$emit("risk-updated");
        this.closeModal();

        if (this.reviewProcess.treatment_effectiveness === "needs_update") {
          this.$emit("redirect-to-treatment-update", riskId);
        }

      } catch (error) {
        console.error("Error saving review:", error);

        notify({
          title: "Error",
          text: error?.message || "Failed to save review. Please try again.",
          type: "error",
        });

      } finally {
        this.isLoading = false;
      }
    },

    resetReviewProcess() {
      this.reviewProcess = {
        review_status: null,
        review_result: null,
        new_likelihood: null,
        new_impact: null,
        new_inherent_risk: null,
        new_residual_risk: null,
        closure_reason: '',
        closure_date: '',
        closure_evidence: null,
        treatment_effectiveness: null,
        related_evidence: null,
        comment: '',
        next_step: null,
      };
      this.calculationMessage = '';
    },

    // ========== EXISTING METHODS ==========
    openReviewRequirementModal(review, options = { start: false }) {
      let resolvedReview = review;
      try {
        if (this.rowData && Array.isArray(this.rowData.reviews) && (review.id || review._id)) {
          const idToFind = review.id || review._id;
          const found = this.rowData.reviews.find(r => (r.id === idToFind || r._id === idToFind));
          if (found) resolvedReview = found;
        }
      } catch (err) {
        console.warn('Error resolving review from rowData.reviews', err);
      }

      // Reset file state before opening
      this.selectedUploadedFileName = '';
      this.selectedUploadedFileUrl = null;
      this.reviewProcess.closure_evidence = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }

      this.currentReview = resolvedReview;
      this.resetReviewProcess();
      this.populateReviewData(resolvedReview);
      this.viewOnlyMode = !options.start;
      this.isReviewRequirementModalOpen = true;
    },

    populateReviewData(review) {
      console.log("Populating review data:", review);
      if (!review) {
        // Reset file state if no review data
        this.selectedUploadedFileName = '';
        this.selectedUploadedFileUrl = null;
        this.reviewProcess.closure_evidence = null;
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = '';
        }
        return;
      }

      // Set basic review information
      this.reviewProcess.review_status = review.review_status_action || 'in_progress';

      if (review.review_result) {
        this.reviewProcess.review_result = review.review_result;
      }

      if (review.new_likelihood !== undefined) {
        this.reviewProcess.new_likelihood = review.new_likelihood;
      }

      if (review.new_impact !== undefined) {
        this.reviewProcess.new_impact = review.new_impact;
      }

      if (review.new_inherent_risk !== undefined) {
        this.reviewProcess.new_inherent_risk = review.new_inherent_risk;
      }

      if (review.new_residual_risk !== undefined) {
        this.reviewProcess.new_residual_risk = review.new_residual_risk;
      }

      if (review.closure_reason) {
        this.reviewProcess.closure_reason = review.closure_reason;
      }

      if (review.closure_date) {
        this.reviewProcess.closure_date = review.closure_date;
      }

      // Handle file evidence - reset first then populate if exists
      this.selectedUploadedFileName = '';
      this.selectedUploadedFileUrl = null;
      this.reviewProcess.closure_evidence = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }

      // If the review contains stored evidence info from server, show it as a link
      if (review.closure_evidence_filename && review.closure_evidence_filepath) {
        this.selectedUploadedFileName = review.closure_evidence_filename;
        this.selectedUploadedFileUrl = review.closure_evidence_filepath;
      }

      if (review.treatment_effectiveness) {
        this.reviewProcess.treatment_effectiveness = review.treatment_effectiveness;
      }

      if (review.comment) {
        this.reviewProcess.comment = review.comment;
      }

      if (review.next_step) {
        this.reviewProcess.next_step = review.next_step;
      }

      if (review.selected_levels && Array.isArray(review.selected_levels)) {
        this.selectedLevels = [...review.selected_levels];

        const likelihoodLevel = review.selected_levels.find(level => level.type === 'likelihood');
        const impactLevel = review.selected_levels.find(level => level.type === 'impact');

        if (likelihoodLevel) {
          this.selectedLikelihoodLabel = likelihoodLevel.levelName || `Level ${likelihoodLevel.levelNumber}`;
        }

        if (impactLevel) {
          this.selectedImpactLabel = impactLevel.levelName || `Level ${impactLevel.levelNumber}`;
        }
      }

      if (this.reviewProcess.new_likelihood && this.reviewProcess.new_impact) {
        this.$nextTick(() => {
          if (this.reviewProcess.review_result === 'change_score') {
            this.calculateNewRisk();
          }
        });
      }
    },

    toggleAccordion(section) {
      this.isAccordionOpen = this.isAccordionOpen === section ? null : section;
    },

    formatDate(dateString) {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    },

    formatDateTime(dateTimeString) {
      return dateTimeString ? new Date(dateTimeString).toLocaleString() : 'N/A';
    },

    getReviewStatusBadge(status) {
      switch (status) {
        case 'completed': return 'bg-success';
        case 'in_progress': return 'bg-warning';
        default: return 'bg-secondary';
      }
    },

    getReviewStatusTextForTable(status) {
      switch (status) {
        case 'completed': return this.$t('risk.completed');
        case 'in_progress': return this.$t('risk.in_progress');
        case 'pending': return this.$t('risk.pending');
        default: return status;
      }
    },

    getReviewerName(reviewId) {
      if (!reviewId || !this.userOptions) return 'N/A';
      const review = this.userOptions.find(r => r.id === reviewId);
      return review ? review.full_name : 'N/A';
    },

    getReviewName(reviewId) {
      if (!reviewId || !this.reviewOptions) return 'N/A';
      const review = this.reviewOptions.find(r => r.id === reviewId);
      return review ? review.name : 'N/A';
    },

    getReviewActionText(action) {
      if (!action) return 'N/A';
      const actions = {
        'Production Issue': this.$t('risk.submit_as_production_issue'),
        'Accept Until The Next Review': this.$t('risk.accept_until_next_review')
      };
      return actions[action] || action;
    },

    async loadReviewHistory() {
      try {
        if (this.rowData.reviews && this.rowData.reviews.length > 0) {
          const sortedReviews = [...this.rowData.reviews].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          this.reviewHistory = sortedReviews.map(review => ({
            ...review,
            id: review.id,
            date: review.triggerDate || review.nextReviewDate || new Date().toISOString().split('T')[0],
            created_at: review.created_at || new Date().toISOString(),
            review_by: this.getReviewerName(review.review_by),
            type: review.reviewType === 'triggered' ? this.$t('risk.triggered') : this.$t('risk.scheduled'),
            action: this.getReviewActionText(review.action),
            comment: review.comment || 'No comment',
            status: review.review_status_action || 'pending',
            reviewName: this.getReviewName(review.selectedReview),
            review_status: review.review_status,
            review_result: review.review_result,
            new_likelihood: review.new_likelihood,
            new_impact: review.new_impact,
            new_inherent_risk: review.new_inherent_risk,
            new_residual_risk: review.new_residual_risk,
            closure_reason: review.closure_reason,
            closure_date: review.closure_date,
            closure_evidence: review.closure_evidence,
            closure_evidence_filename: review.closure_evidence_filename,
            closure_evidence_filepath: review.closure_evidence_filepath,
            treatment_effectiveness: review.treatment_effectiveness,
            related_evidence: review.related_evidence,
            next_step: review.next_step,
            selected_levels: review.selected_levels,
            current_likelihood: review.current_likelihood,
            current_impact: review.current_impact,
            current_inherent_risk: review.current_inherent_risk,
            current_residual_risk: review.current_residual_risk,
            reviewed_by: review.reviewed_by,
            reviewed_at: review.reviewed_at
          }));
        } else {
          this.reviewHistory = [];
        }
      } catch (error) {
        console.error('Error loading review history:', error);
        this.reviewHistory = [];
      }
    },

    async initializeComponent() {
      try {
        const result = await this.riskCalculator.refreshInhertedRisk(
          this.rowData,
          this.controlOptions,
          this.likelihoodOptions,
          this.impactOptions,
          this.riskFormulaOptions
        );
        this.riskData = result.riskData;
        this.inherent_risk = result.inherent_risk;
        this.residual_risk = result.residual_risk;
      } catch (error) {
        console.error("Error initializing component:", error);
      }
    },

    async preformReview() {
      this.isLoadingPerFormReview = true;
      try {
        const newReview = {
          reviewType: this.reviewData.reviewType,
          nextReviewDate: this.reviewData.next_review_date,
          selectedReview: this.reviewData.review_id,
          action: this.reviewData.next_review,
          triggerReference: this.reviewData.triggerReference,
          triggerDate: this.reviewData.triggerDate,
          comment: this.reviewData.comment,
          review_by: this.USER_ID,
          review_status_action: this.reviewData.review_status_action,
          created_at: new Date().toISOString(),
          id: this.generateRandomId(),
        };

        if (!this.rowData.reviews) this.rowData.reviews = [];
        this.rowData.reviews.push(newReview);

        const data = {
          id: this.rowData?._id || this.rowData?.id,
          reviews: this.rowData.reviews
        };

        if (this.reviewData.reviewType === "scheduled") {
          data.next_review_date = this.reviewData.next_review_date;
          data.comment = this.reviewData.comment;
        } else if (this.reviewData.reviewType === "triggered") {
          data.review_id = this.reviewData.review_id;
          data.next_review = this.reviewData.next_review;
          data.comment = this.reviewData.comment;
        }

        const response = await this.api.preformReview(data);

        if (response.status === "success") {
          await this.loadReviewHistory();
          this.$emit("risk-updated", response);
          this.closeModal();
          notify({ title: "Risk review updated successfully", text: "The operation was completed successfully!", type: "success" });
        } else {
          notify({ title: "Risk review update failed", text: "The operation failed!", type: "error" });
        }
      } catch (error) {
        notify({ title: "Error", text: "An unexpected error occurred!", type: "error" });
      } finally {
        this.isLoadingPerFormReview = false;
      }
    },

    generateRandomId() {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    },

    async changeStatus(payload) {
      const selectedStatus = payload?.status ?? this.selectedStatus;
      const closeOutInformation = payload?.closeOutInformation ?? this.closeOutInformation;

      this.closeModal();

      if (!this.rowData?.id || !selectedStatus) return;

      const result = await Swal.fire({
        title: `Are you sure you want to change the status of this risk?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: `Yes!`,
      });

      if (!result.isConfirmed) return;

      try {
        const data = { id: this.rowData?.id, status: selectedStatus };

        if (payload?.reason_close === null) {
          data.close_out_information = null;
          data.reason_close = null;
        } else if (closeOutInformation) {
          data.close_out_information = closeOutInformation;
          data.reason_close = selectedStatus;
        }

        const response = await this.api.changeStatus(data);
        if (response.status == 'success') {
          this.rowData.status = response.data.status ?? selectedStatus;
          if (payload?.reason_close === null) {
            this.rowData.close_out_information = null;
            this.rowData.reason_close = null;
          } else {
            if (response.data.close_out_information !== undefined) this.rowData.close_out_information = response.data.close_out_information;
            if (response.data.reason_close !== undefined) this.rowData.reason_close = response.data.reason_close;
          }

          this.$emit("risk-updated", response);
          notify({ title: "Risk changed status successfully", text: "The operation was completed successfully.!", type: "success" });
        } else {
          notify({ title: "Error changing risk status", text: response?.message, type: "error" });
        }
      } catch (error) {
        console.error('Error changing risk status', error);
        notify({ title: "Error changing risk status", text: error.message || error, type: "error" });
      }
    },

    async changeStatusClose(payload) {
      const reasonId = payload?.reasonId;
      const closeOutInformation = payload?.closeOutInformation;

      if (reasonId === 'Reopened' || reasonId === 'reopened') {
        return this.changeStatus({ status: 'Reopened', closeOutInformation: '' });
      }

      if (!this.rowData?.id) return;

      const result = await Swal.fire({
        title: `Are you sure you want to close this risk?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: this.$t('risk.cancel'),
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: `Yes!`,
      });

      if (!result.isConfirmed) return;

      try {
        const data = { id: this.rowData.id, status: 'Closed Risk' };
        if (closeOutInformation) data.close_out_information = closeOutInformation;
        if (reasonId) data.reason_close = reasonId;

        const response = await this.api.changeStatus(data);
        if (response.status == 'success') {
          this.rowData.status = response.data.status;
          if (response.data.close_out_information) this.rowData.close_out_information = response.data.close_out_information;
          if (response.data.reason_close) this.rowData.reason_close = response.data.reason_close;
          this.$emit('risk-updated', response);
          notify({ title: this.$t('risk.close_risk_success') || 'Risk closed', text: this.$t('common.operation_success') || '', type: 'success' });
        } else {
          notify({ title: this.$t('risk.close_risk_error') || 'Error', text: response?.message, type: 'error' });
        }
      } catch (error) {
        console.error('Error closing risk', error);
        notify({ title: this.$t('risk.close_risk_error') || 'Error', text: error.message || error, type: 'error' });
      }
    },

    closeModal() {
      this.isReviewRequirementModalOpen = false;
      this.isStatusModalOpen = false;
      this.isCloseRiskModalOpen = false;
      this.isResetReviewModalOpen = false;
      this.isPreformReviewModalOpen = false;
      this.isReviewDetailsModalOpen = false;
      this.selectedAction = '';
      this.reviewData = {
        reviewType: null,
        review_id: null,
        next_review_date: null,
        next_review: null,
        comment: null,
        triggerReference: null,
        triggerDate: null,
        review_status_action: 'pending'
      };
      this.resetReviewProcess();

      // Reset file upload state completely
      this.selectedUploadedFileName = '';
      this.selectedUploadedFileUrl = null;
      this.reviewProcess.closure_evidence = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    resetReviewData() {
      this.reviewData = {
        reviewType: null,
        review_id: null,
        next_review_date: null,
        next_review: null,
        comment: null,
        triggerReference: null,
        triggerDate: null,
        review_status_action: 'pending'
      };
    },

    async resetReview() {
      const resetReviewData = { id: this.rowData._id || this.rowData.id, reset_review: "reset_review" };
      const response = await this.api.resetReview(resetReviewData);
      if (response.status === 'success') {
        this.rowData.reviews = [];
        this.reviewHistory = [];
        this.closeModal();
        this.$emit("risk-updated", response);
        notify({ title: "Risk review reset successfully", text: "The operation was completed successfully!", type: "success" });
      } else {
        notify({ title: "Risk review reset Failed", text: "The operation failed!", type: "error" });
      }
    },

    openParamsModal(type) {
      this.currentParamType = type;

      if (!Array.isArray(this.selectedLevels)) {
        this.selectedLevels = [];
      }

      if (this.selectedLevels.length === 0 && this.rowData?.selected_levels) {
        this.selectedLevels = [...this.rowData.selected_levels];
      }

      const list = type === "likelihood" ? this.likelihoodOptions[0] : this.impactOptions[0];
      this.activeParams = list || [];

      this.modalTitle = type === "likelihood"
        ? this.$t("risk.likelihood_parameters")
        : this.$t("risk.impact_parameters");

      const tempSelectedLevels = {};

      if (this.selectedLevels && this.activeParams?.params) {
        this.activeParams.params.forEach((param) => {
          const existing = this.selectedLevels.find(
            (selection) => selection.type === type && selection.paramId === param.id
          );

          if (existing) {
            const matchingLevel = param.levels.find(
              (level) => level.levelNumber === parseInt(existing.levelNumber)
            );

            if (matchingLevel) {
              tempSelectedLevels[param.id] = matchingLevel;
            }
          }
        });
      }
      console.log('Opening params modal with selected levels:', tempSelectedLevels);

      this.modalSelectedLevels = tempSelectedLevels;
      this.showParamsModal = true;
    },

    applySelectedParams(selectedLevels) {
      if (!Array.isArray(this.selectedLevels)) this.selectedLevels = [];
      this.selectedLevels = this.selectedLevels.filter(lvl => lvl.type !== this.currentParamType);

      const newSelections = [];
      Object.entries(selectedLevels).forEach(([paramId, level]) => {
        if (!level) return;
        const param = this.activeParams?.params?.find(p => p.id == paramId);
        if (!param) return;

        newSelections.push({
          paramId: param.id,
          paramName: param.name,
          levelNumber: level.levelNumber,
          levelName: level.levelName,
          color: level.color || null,
          type: this.currentParamType,
        });

        if (this.currentParamType === "likelihood") {
          this.reviewProcess.new_likelihood = level.levelNumber;
        } else if (this.currentParamType === "impact") {
          this.reviewProcess.new_impact = level.levelNumber;
        }
      });

      this.selectedLevels = [...this.selectedLevels, ...newSelections];
      if (newSelections.length > 0) {
        const maxLevel = newSelections.reduce((max, lvl) => lvl.levelNumber > max.levelNumber ? lvl : max);
        const levelNameFromList = this.getLevelNameFromList(maxLevel.levelNumber, this.currentParamType);

        if (this.currentParamType === "likelihood") {
          this.selectedLikelihoodValue = maxLevel.levelNumber;
          this.selectedLikelihoodLabel = levelNameFromList;
        } else {
          this.selectedImpactValue = maxLevel.levelNumber;
          this.selectedImpactLabel = levelNameFromList;
        }
      }

      if (this.reviewProcess.review_result === 'change_score') {
        this.calculateNewRisk().catch(err => {
          console.error('Auto calculateNewRisk error:', err);
        });
      }
    },

    getLevelNameFromList(levelNumber, type) {
      try {
        const list = type === "likelihood" ? this.likelihoodOptions[0] : this.impactOptions[0];
        let dataArray = [];
        if (Array.isArray(list)) dataArray = list;
        else if (list?.data && Array.isArray(list.data)) dataArray = list.data;
        else if (list?.params && Array.isArray(list.params)) dataArray = list.params;

        const item = dataArray.find(item => item.value === levelNumber || item.levelNumber === levelNumber);
        return item ? (item.name || item.levelName) : `Level ${levelNumber}`;
      } catch (error) {
        console.error('Error getting level name from list:', error);
        return `Level ${levelNumber}`;
      }
    },

    truncateText(text, length) {
      if (!text) return 'N/A';
      if (text.length <= length) return text;
      return text.substring(0, length);
    },

    openCommentModal(comment) {
      this.selectedComment = comment;
      this.showCommentModal = true;
    },

    closeCommentModal() {
      this.showCommentModal = false;
      this.selectedComment = '';
    },

    selectFile() {
      if (this.viewOnlyMode) return;
      if (this.$refs.fileInput && this.$refs.fileInput.click) {
        this.$refs.fileInput.click();
      }
    },

    handleFileChange(event) {
      const file = event?.target?.files?.[0];
      if (!file) return;
      this.reviewProcess.closure_evidence = file;
      this.selectedUploadedFileName = file.name || '';
      this.selectedUploadedFileUrl = null;
    },

    downloadUploadedFile() {
      if (!this.selectedUploadedFileUrl) return;
      
      // Construct full URL with basePath
      let fileUrl = this.selectedUploadedFileUrl;
      const cleanBase = this.basePath.replace('/api', '').replace(/\/$/, '');
      fileUrl = `${cleanBase}/storage/${fileUrl}`.replace('//', '/');
      fileUrl = fileUrl.replace('http:/', 'http://');
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = this.selectedUploadedFileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },


    downloadReviewDetailsFile() {
      if (!this.selectedReviewDetails.closure_evidence_filepath) return;

      let fileUrl = this.selectedReviewDetails.closure_evidence_filepath;

      // Remove double slash + remove /api
      const cleanBase = this.basePath.replace('/api', '').replace(/\/$/, '');

      fileUrl = `${cleanBase}/storage/${fileUrl}`.replace('//', '/');

      // Fix accidental http:/ → http://
      fileUrl = fileUrl.replace('http:/', 'http://');

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = this.selectedReviewDetails.closure_evidence_filename || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

  }
}
</script>


<style scoped>
/* ================================
   ACCORDION STYLES
   ================================ */
.risk-accordion {
  margin-bottom: 2rem;
}

/* ==========================================
   MASTER MODAL WRAPPER (Your Custom Layout)
========================================== */
.review-details-modal {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

/* ==========================================
   FIXED HEADER
========================================== */
.review-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #F0F0F0;
  color: white;
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  color: black;
}

.review-details-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.review-type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  margin-left: 5px;
}

.review-details-close-btn {
  color: white !important;
}

.review-details-body {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.info-section-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.section-title {
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 600;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.detail-value {
  color: #374151;
  font-size: 0.95rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.bg-success {
  background-color: #10b981;
}

.bg-warning {
  background-color: #f59e0b;
}

.bg-secondary {
  background-color: #6b7280;
}

.bg-info {
  background-color: #3b82f6;
}

.bg-error {
  background-color: #ef4444;
}

.comment-box {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  min-height: 60px;
  white-space: pre-wrap;
}

.risk-subtitle {
  color: #6E3894;
  font-weight: 600;
  margin-bottom: 16px;
  font-size: 1rem;
}

.new-risk-title {
  color: #10b981;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  margin-top: 8px;
}

.risk-score {
  font-weight: 600;
  font-size: 1.1rem;
}

.new-risk {
  color: #10b981;
}

.param-item {
  margin-bottom: 8px;
}

.param-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.param-value {
  color: #374151;
  font-size: 0.95rem;
}

.review-details-footer {
  padding: 16px 24px;
  background-color: #f8fafc;
}

.close-details-btn {
  min-width: 100px;
}

.review-details-close-btn {
  color: white !important;
}

/* Upload area styling */
.upload-area {
  border: 2px dashed #6E3894;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.upload-area:hover {
  border-color: #8B4DAF;
  background-color: #f0f0f0;
}

.uploaded-file-link {
  color: #6E3894;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
}

.uploaded-file-link:hover {
  color: #8B4DAF;
  text-decoration: underline;
}

/* Additional styling for better UX */
.upload-area p {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
}

.upload-area .v-icon {
  color: #6E3894;
  margin-bottom: 8px;
}

/* ==========================================
   SCROLLABLE CONTENT
========================================== */
.review-details-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: #f8fafc;
}

/* ==========================================
   FIXED FOOTER
========================================== */
.review-details-footer {
  padding: 16px 24px;
  background-color: #f8fafc;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
}

.close-details-btn {
  min-width: 120px;
  text-transform: none;
  font-weight: 600;
}

/* ==========================================
   SECTION CARDS
========================================== */
.info-section-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.section-title {
  background-color: #f7fafc;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
}

.info-section-card .v-card-text {
  padding: 20px;
}

/* ==========================================
   DETAIL ITEMS
========================================== */
.detail-item {
  margin-bottom: 16px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.detail-value {
  display: block;
  color: #2d3748;
  font-size: 1rem;
  line-height: 1.5;
}

.comment-box {
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  min-height: 60px;
  white-space: pre-wrap;
}

/* ==========================================
   RISK SCORES
========================================== */
.risk-score {
  font-weight: 600;
  font-size: 1.1rem;
}

.new-risk {
  color: #10B981;
  font-weight: 700;
}

/* ==========================================
   STATUS BADGES
========================================== */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bg-success {
  background-color: #10B981;
  color: white;
}

.bg-warning {
  background-color: #F59E0B;
  color: white;
}

.bg-secondary {
  background-color: #6B7280;
  color: white;
}

/* ==========================================
   PARAMETERS
========================================== */
.param-item {
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.param-item:last-child {
  border-bottom: none;
}

.param-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.param-value {
  color: #2d3748;
  font-size: 0.95rem;
}

/* ==========================================
   RESPONSIVE
========================================== */
@media (max-width: 768px) {
  .review-details-header {
    padding: 16px 20px;
  }

  .review-details-title {
    font-size: 1.3rem;
  }

  .info-section-card .v-card-text {
    padding: 16px;
  }

  .section-title {
    padding: 12px 16px;
    font-size: 1rem;
  }
}

/* ==========================================
   ANIMATION
========================================== */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.risk-accordion-item {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
}

.risk-accordion-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.risk-accordion-header {
  margin: 0;
}

.risk-accordion-button {
  width: 100%;
  padding: 1rem 1.25rem;
  background: #E8E8E8;
  color: #2c3e50;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  border-radius: 8px 8px 0 0;
}

.risk-accordion-button:not(.collapsed) {
  background: #E8E8E8;
  border-bottom: 1px solid #e1e5e9;
}

.risk-accordion-button.collapsed {
  border-radius: 8px;
}

.accordion-chevron {
  transition: transform 0.2s ease;
  font-size: 1rem;
  color: #333;
  order: 1;
  margin-left: auto;
  margin-right: 0;
}

.according-title {
  order: -1;
  font-weight: 700;
  font-size: 1rem;
  color: #000;
  margin-right: auto;
}

.accordion-chevron.rotate-icon {
  transform: rotate(180deg);
}

.risk-accordion-collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.risk-accordion-collapse.show {
  max-height: 5000px;
  transition: max-height 0.5s ease-in;
}

.risk-accordion-body {
  padding: 0.5rem;
  background: #ffffff;
  border-top: 1px solid #e1e5e9;
}

/* Review History Table Styles */
.review-history {
  padding: 0;
}

.review-history .section-title {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
  padding-left: 0;
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  margin-bottom: 0;
}

.custom-table thead {
  background-color: #f8f9fa;
}

.custom-table thead th {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 700;
  color: #000000;
  text-align: left;
  border: none;
  white-space: nowrap;
}

.custom-table tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s ease;
}

.custom-table tbody tr:hover {
  background-color: #f8f9fa;
}

.custom-table tbody tr:last-child {
  border-bottom: none;
}

.custom-table tbody td {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  vertical-align: middle;
  border: none;
}

/* Reviewer Column Styling */
.custom-table tbody td:nth-child(3) {
  padding: 16px 20px;
}

.reviewer-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.reviewer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6E3894 0%, #6E3894 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Status Badge Styling */
.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.status-in-progress {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.status-completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.status-pending {
  background-color: #fff9c4;
  color: #f57f17;
}

.status-badge.status-overdue {
  background-color: #ffebee;
  color: #c62828;
}

/* Action Buttons */
.action-btn {
  padding: 3px 16px;
  border: 1px solid #6E3894;
  background-color: white;
  color: #6E3894;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.action-btn:hover {
  background-color: #6E3894;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.action-btn-info {
  background-color: #6E3894;
  color: white;
  border-color: #6E3894;
}

.action-btn-info:hover {
  background-color: #6E3894;
  border-color: #6E3894;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.action-btn i {
  font-size: 12px;
}

/* Comment Column */
.comment-text {
  display: inline;
  color: #000000;
  font-weight: 400;
}

.see-more {
  color: #6E3894;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  margin-left: 4px;
  display: inline;
}

.see-more:hover {
  text-decoration: underline;
}

/* Comment Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content-custom {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header-custom {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.25rem !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-custom {
  font-weight: 600 !important;
  font-size: 1.125rem !important;
  color: #1a1a1a;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #000000;
}

.modal-body-custom {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.full-comment {
  font-size: 14px;
  line-height: 1.6;
  color: #000000;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-footer-custom {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  padding: 10px 24px;
  background-color: #6E3894;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background-color: #6E3894;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* Modal Styling */
.review-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.v-dialog .v-card .v-card-title .v-btn {
  color: black !important;
  background: white !important;
  border-radius: 8px !important;
}

.modal-header {
  background: #F0F0F0;
  color: black !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem !important;
}

.modal-title {
  font-weight: 600 !important;
  font-size: 1.125rem !important;
  color: black;
}

.close-btn {
  color: #6b7280 !important;
}

.close-btn:hover {
  background-color: #f3f4f6 !important;
}

.modal-body {
  padding: 24px !important;
  background-color: #ffffff;
  max-height: 70vh;
  overflow-y: auto;
}

/* Field Labels */
.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

.field-label-inside {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

/* Custom Select Styling */
.custom-select :deep(.v-field) {
  background-color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
}

.custom-select :deep(.v-field__input) {
  color: #000000;
  font-weight: 400;
  padding: 12px 16px;
  min-height: 48px;
}

.custom-select :deep(.v-field__outline) {
  color: #6E3894;
}

.custom-select :deep(.v-field--focused .v-field__outline) {
  color: #6E3894;
}

.custom-select :deep(.v-select__selection-text) {
  color: #000000;
}

/* Custom Textarea Styling */
.custom-textarea :deep(.v-field) {
  background-color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
}

.custom-textarea :deep(.v-field__input) {
  color: #000000;
  font-weight: 400;
  padding: 12px 16px;
}

.custom-textarea :deep(.v-field__outline) {
  color: #6E3894;
}

.custom-textarea :deep(.v-field--focused .v-field__outline) {
  color: #6E3894;
}

/* Custom File Input */
.custom-file-input :deep(.v-field) {
  background-color: #ffffff;
  border-radius: 8px;
  border: 2px dashed #6E3894 !important;
}

.custom-file-input :deep(.v-field__input) {
  color: #6b7280;
  font-weight: 400;
  padding: 40px 16px;
  text-align: center;
}

.custom-file-input :deep(.v-field__prepend-inner) {
  padding-top: 40px;
}

/* Change Score Card - EXACT SCREENSHOT MATCH */
.change-score-card {
  background-color: #F3F4F6 !important;
  border-radius: 8px !important;
  padding: 24px !important;
  border: 1px solid #E5E7EB !important;
}

/* Card Input Field Styling */
.card-input-field :deep(.v-field) {
  background-color: #FFFFFF !important;
  border-radius: 6px !important;
  min-height: 44px !important;
  cursor: pointer;
}

.card-input-field :deep(.v-field__outline) {
  color: #6E3894 !important;
}

.card-input-field :deep(.v-field--focused .v-field__outline) {
  color: #6E3894 !important;
}

.card-input-field:hover :deep(.v-field__outline) {
  color: #6E3894 !important;
}

.card-input-field :deep(.v-field__input) {
  color: #000000 !important;
  font-weight: 400;
  font-size: 14px;
  padding: 10px 12px !important;
  cursor: pointer;
}

.card-input-field :deep(.v-field__prepend-inner) {
  padding-top: 0 !important;
  align-items: center !important;
}

.card-input-field :deep(.v-field__append-inner) {
  padding-top: 0 !important;
  align-items: center !important;
}

/* Calculation Result Box */
.calculation-result-box {
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.result-header-box {
  margin-bottom: 20px;
}

.result-title-box {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 6px 0;
}

.result-subtitle-box {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
  line-height: 1.4;
}

.risk-values-row {
  margin-bottom: 16px;
}

.risk-item {
  text-align: center;
  padding: 8px 4px;
}

.risk-label-text {
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 8px;
  font-weight: 500;
  line-height: 1.3;
}

.risk-value-text {
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.risk-value-text.current-risk {
  color: #6E3894;
}

.risk-value-text.new-risk {
  color: #10B981;
}

.calculate-btn-wrapper {
  text-align: center;
  margin-top: 20px;
}

.calculate-risk-btn {
  background-color: #6E3894 !important;
  color: #FFFFFF !important;
  text-transform: none !important;
  font-weight: 600;
  font-size: 14px;
  padding: 0 32px !important;
  height: 40px !important;
  border-radius: 6px !important;
  letter-spacing: 0;
  box-shadow: none !important;
}

.calculate-risk-btn:hover {
  background-color: #6E3894 !important;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
}

.calculate-risk-btn:disabled {
  opacity: 0.5 !important;
  background-color: #6E3894 !important;
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px !important;
  background-color: #ffffff;
}

.cancel-btn {
  text-transform: none;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 24px !important;
  border-radius: 8px;
  color: #6b7280 !important;
  border-color: #6E3894 !important;
  letter-spacing: 0;
}

.cancel-btn:hover {
  background-color: #f9fafb !important;
}

.save-btn {
  background-color: #6E3894 !important;
  color: white !important;
  text-transform: none;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 32px !important;
  border-radius: 8px;
  letter-spacing: 0;
  margin-left: 12px;
  box-shadow: none !important;
}

.save-btn:hover {
  background-color: #6E3894 !important;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
}

/* Scrollbar Styling */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.upload-area {
  border: 2px dashed #6E3894;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #6b7280;
  cursor: pointer;
  transition: 0.2s;
}

.upload-area:hover {
  background: #faf5ff;
  border-color: #6E3894;
}

/* Perform Review Modal Styling */
.perform-review-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.perform-review-header {
  background: #F0F0F0;
  color: black !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem !important;
}

.perform-review-title {
  font-weight: 600 !important;
  font-size: 1.125rem !important;
  color: black;
}

.perform-review-close-btn {
  color: #6b7280 !important;
}

.perform-review-close-btn:hover {
  background-color: #f3f4f6 !important;
}

.perform-review-body {
  padding: 24px !important;
  background-color: #ffffff;
  max-height: 70vh;
  overflow-y: auto;
}

/* Field Labels */
.perform-review-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

/* Select Styling */
.perform-review-select :deep(.v-field) {
  background-color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
}

.perform-review-select :deep(.v-field__input) {
  color: #000000;
  font-weight: 400;
  padding: 12px 16px;
  min-height: 48px;
}

.perform-review-select :deep(.v-field__outline) {
  color: #d1d5db;
}

.perform-review-select :deep(.v-field--focused .v-field__outline) {
  color: #6E3894;
}

.perform-review-select :deep(.v-select__selection-text) {
  color: #000000;
}

.perform-review-select:hover :deep(.v-field__outline) {
  color: #6E3894;
}

/* Input Styling */
.perform-review-input :deep(.v-field) {
  background-color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
}

.perform-review-input :deep(.v-field__input) {
  color: #000000;
  font-weight: 400;
  padding: 12px 16px;
  min-height: 48px;
}

.perform-review-input :deep(.v-field__outline) {
  color: #d1d5db;
}

.perform-review-input :deep(.v-field--focused .v-field__outline) {
  color: #6E3894;
}

.perform-review-input:hover :deep(.v-field__outline) {
  color: #6E3894;
}

/* Textarea Styling */
.perform-review-textarea :deep(.v-field) {
  background-color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
}

.perform-review-textarea :deep(.v-field__input) {
  color: #000000;
  font-weight: 400;
  padding: 12px 16px;
}

.perform-review-textarea :deep(.v-field__outline) {
  color: #d1d5db;
}

.perform-review-textarea :deep(.v-field--focused .v-field__outline) {
  color: #6E3894;
}

.perform-review-textarea:hover :deep(.v-field__outline) {
  color: #6E3894;
}

/* Modal Footer */
.perform-review-footer {
  padding: 16px 24px !important;
  background-color: #ffffff;
}

.perform-review-cancel-btn {
  text-transform: none;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 24px !important;
  border-radius: 8px;
  color: #6b7280 !important;
  border-color: #d1d5db !important;
  letter-spacing: 0;
}

.perform-review-cancel-btn:hover {
  background-color: #f9fafb !important;
}

.perform-review-save-btn {
  background-color: #6E3894 !important;
  color: white !important;
  text-transform: none;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 32px !important;
  border-radius: 8px;
  letter-spacing: 0;
  margin-left: 12px;
  box-shadow: none !important;
}

.perform-review-save-btn:hover {
  background-color: #6E3894 !important;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
}

.perform-review-save-btn:disabled {
  opacity: 0.5 !important;
  background-color: #6E3894 !important;
}

/* Scrollbar Styling */
.perform-review-body::-webkit-scrollbar {
  width: 8px;
}

.perform-review-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.perform-review_body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.perform-review_body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Reset Review Modal Styling */
.reset-review-modal {
  border-radius: 16px !important;
  overflow: visible !important;
  padding: 32px 24px 24px 24px;
  position: relative;
  text-align: center;
}

/* Close Icon - Top Right */
.reset-review-close-icon {
  position: absolute !important;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.reset-review-close-icon:hover {
  background-color: #F3F4F6 !important;
}

/* Modal Body */
.reset-review-body {
  padding: 0 !important;
  text-align: center;
}

/* Warning Icon Wrapper */
.reset-review-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.reset-review-icon-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: #FEF3C7;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Title */
.reset-review-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

/* Message */
.reset-review-message {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 28px 0;
  line-height: 1.5;
}

/* Footer Actions */
.reset-review-footer {
  padding: 0 !important;
  display: flex;
  gap: 12px;
  margin-top: 0;
}

/* Cancel Button */
.reset-review-cancel-btn {
  flex: 1;
  text-transform: none !important;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 24px !important;
  height: 44px !important;
  border-radius: 8px !important;
  color: #374151 !important;
  border: 2px solid #D1D5DB !important;
  letter-spacing: 0;
  box-shadow: none !important;
}

.reset-review-cancel-btn:hover {
  background-color: #F9FAFB !important;
  border-color: #9CA3AF !important;
}

/* Submit Button */
.reset-review-submit-btn {
  flex: 1;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
  color: #FFFFFF !important;
  text-transform: none !important;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 24px !important;
  height: 44px !important;
  border-radius: 8px !important;
  letter-spacing: 0;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
}

.reset-review-submit-btn:hover {
  background: linear-gradient(135deg, #D97706 0%, #B45309 100%) !important;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4) !important;
  transform: translateY(-1px);
}

.reset-review-submit-btn:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 600px) {
  .reset-review-modal {
    padding: 24px 16px 16px 16px;
  }

  .reset-review-icon-circle {
    width: 80px;
    height: 80px;
  }

  .reset-review-icon-circle v-icon {
    font-size: 40px !important;
  }

  .reset-review-title {
    font-size: 18px;
  }

  .reset-review-message {
    font-size: 13px;
  }

  .reset-review-footer {
    flex-direction: column;
  }

  .reset-review-cancel-btn,
  .reset-review-submit-btn {
    width: 100%;
  }
}

/* Responsive */
@media (max-width: 960px) {
  .modal-header {
    padding: 16px 20px !important;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-body {
    padding: 20px !important;
  }

  .risk-value {
    font-size: 20px;
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .custom-table {
    font-size: 13px;
  }

  .custom-table thead th,
  .custom-table tbody td {
    padding: 12px 16px;
  }
}
</style>