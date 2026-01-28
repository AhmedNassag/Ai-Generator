<template>
  <div v-if="pageLoading" class="global-loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>{{ $t("assessmentsresults.loading") || "Loading assessment details..." }}</p>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>

  <!-- Main Page component where the layout and page structure are set -->
  <main-page 
    ref="page" 
    :isFlipped="isFlipped" 
    :mainPage="'assessmentsresults.assessmentsresults'" 
    :subPage="'assessmentsresults.assessmentsresults'" 
    :titlePage="'assessmentsresults.assessmentsresults'"
    v-permission:show
  >
    <div v-permission:update v-permission:destroy></div>
    
    <!-- Slot for rendering the Assessment Details -->
    <template #datatable>
      <div class="assessment-results-container">
        <div class="container-fluid">
          <!-- Single Panel Layout -->
          <div v-if="currentAssessmentFilter" class="single-panel-container">
            <!-- Header -->
            <div class="assessment-header">
              <div class="header-content">
                <h2 class="assessment-title">Assessment Details</h2>
                <button class="close-btn" @click="closeAssessmentDetails">
                  <i class="fas fa-times"></i>
        </button>
              </div>
      </div>
      
            <!-- Tabs Navigation -->
            <div class="tabs-navigation">
              <button 
                class="tab-link" 
                :class="{ active: activeTab === 'information' }"
                @click="activeTab = 'information'"
              >
                {{ $t("assessmentsresults.assessment_information") || "Assessment Information" }}
              </button>
              <button 
                class="tab-link" 
                :class="{ active: activeTab === 'result' }"
                @click="activeTab = 'result'"
              >
                {{ $t("assessmentsresults.assessment_result") || "Assessment Result" }}
              </button>
            </div>

            <!-- Tabs Content -->
            <div class="tabs-content-wrapper">
              <!-- Assessment Information Tab -->
              <div v-if="activeTab === 'information'" class="tab-content-panel">
                <div class="panel-content">
                  <!-- Assessment Information Section -->
                  <div class="assessment-info-section">
                    <h3 class="assessment-info-title">{{ $t("assessmentsresults.assessment_information") || "Assessment Information" }}</h3>
                    
                    <div class="assessment-info-grid">
                      <div class="assessment-info-item">
                        <label class="assessment-info-label">{{ getTranslation("assessmentsresults.assessment_name", "ASSESSMENT NAME") }}</label>
                        <div class="assessment-info-value">{{ assessmentData?.name || 'N/A' }}</div>
                      </div>
                      
                      <div class="assessment-info-item">
                        <label class="assessment-info-label">{{ getTranslation("assessmentsresults.users", "USERS") }}</label>
                        <div v-if="displayUsers.length > 0" class="assessment-users-display">
                          <div 
                            v-for="(user, idx) in displayUsers" 
                            :key="idx"
                            class="assessment-user-avatar"
                            :style="{ backgroundColor: getUserColor(user) }"
                            :title="getUserDisplayName(user)"
                          >
                            {{ getUserInitials(user) }}
                          </div>
                          <div v-if="remainingUsers > 0" class="assessment-user-avatar assessment-user-more">
                            +{{ remainingUsers }}
                          </div>
                        </div>
                        <div v-else class="assessment-no-users">{{ getTranslation("assessmentsresults.no_users_assigned", "No users assigned") }}</div>
                      </div>
                      
                      <div class="assessment-info-item">
                        <label class="assessment-info-label">{{ getTranslation("assessmentsresults.template_name", "TEMPLET NAME") }}</label>
                        <div class="assessment-info-value">{{ assessmentData?.template?.name || assessmentData?.template_id || 'N/A' }}</div>
                      </div>
                      
                      <div class="assessment-info-item">
                        <label class="assessment-info-label">{{ getTranslation("assessmentsresults.risk_status", "RISK STATUS") }}</label>
                        <span class="assessment-risk-status-badge" :class="hasAssessmentRisks ? 'has-risk' : 'no-risk'">
                          {{ hasAssessmentRisks ? getRiskLabel(true) : getRiskLabel(false) }}
        </span>
                      </div>
                    </div>
      </div>
      
                  <!-- Template Questions Section -->
                  <div class="questions-section">
                    <h3 class="section-label">Templet Questions</h3>
      <DataTable
                      ref="questionsTable"
                      id="template-questions-table"
                      :tableClass="'questions-table'"
                      :columns="questionColumns"
                      :api="question"
                      :apiParams="questionApiParams"
                      :hideAddNewButton="true"
                      :hideConfigurationsButton="true"
                      :hideStatisticsButton="true"
                      :hideLinkRequirementButton="true"
                    >
                      <template #type="{ item }">
                        <span
                          v-if="item.type == '1' || item.type == 1"
                          class="badge bg-info text-white m-1"
                          style="
                            padding: 8px 20px;
                            border-radius: 30px;
                            background-color: #d9d9d9 !important;
                            color: #000000 !important;
                          "
                        >
                          Single Choice
        </span>
                        <span
                          v-else-if="item.type == '2' || item.type == 2"
                          class="badge bg-info text-white m-1"
                          style="
                            padding: 8px 20px;
                            border-radius: 30px;
                            background-color: #d9d9d9 !important;
                            color: #000000 !important;
                          "
                        >
                          Multiple Choice
                        </span>
                        <span
                          v-else-if="item.type == '3' || item.type == 3"
                          class="badge bg-info text-white m-1"
                          style="
                            padding: 8px 20px;
                            border-radius: 30px;
                            background-color: #d9d9d9 !important;
                            color: #000000 !important;
                          "
                        >
                          Fill-in Blank
                        </span>
                        <span v-else class="type-badge">{{ item.type || 'Multiple Choice' }}</span>
                      </template>
                      
                      <template #hasFileAttachment="{ item }">
                        <i
                          v-if="item.fileAttachment == true"
                          class="fas fa-check text-success"></i>
                        <i v-else class="fas fa-times text-danger"></i>                      </template>
                      
                      <template #hasCompliance="{ item }">
                        <i v-if="item.has_compliance || item.compliance" class="fas fa-check text-success"></i>
                        <i v-else class="fas fa-times text-danger"></i>
                      </template>
                      
                      <template #hasMaturity="{ item }">
                        <i v-if="item.has_maturity || item.maturity" class="fas fa-check text-success"></i>
                        <i v-else class="fas fa-times text-danger"></i>
                      </template>
                      
                      <template #hasRisk="{ item }">
                        <i
                          v-if="
                            item.answers &&
                            item.answers.some(
                              (answer) => answer.risk != null && answer.risk.subject != null
                            )
                          "
                          class="fas fa-check text-success"></i>
                          <i v-else class="fas fa-times text-danger"></i>
                        </template>
                    </DataTable>
                  </div>
                </div>
      </div>
      
              <!-- Assessment Result Tab -->
              <div v-if="activeTab === 'result'" class="tab-content-panel">
                <div class="panel-content">
                  
                  <!-- DataTable -->
      <DataTable
                    :hideAddNewButton="true"
                    :hideConfigurationsButton="true"
                    :hideStatisticsButton="true"
                    :hideLinkRequirementButton="true"
        ref="table"
                    id="assessment-results-table"
                    :tableClass="'assessment-table'"
        :columns="tableColumns"   
        :api="api"  
        :apiParams="apiParams"   
        :hideActions="hideActions"
      >
        <!-- Custom column templates -->
        <template #user="{ item }">
                      <div class="user-cell">
                        <span class="user-badge">{{ getUserBadge(item.user_email) }}</span>
                        <span class="user-name">{{ item.user_email || 'N/A' }}</span>
                      </div>
        </template>

        <template #completion="{ item }">
                      <div class="completion-cell">
                        <div class="progress-bar-container">
              <div 
                            class="progress-bar-fill" 
                :style="{ width: item.completion_percentage + '%' }"
                          ></div>
              </div>
                        <span class="completion-text">{{ item.completion_percentage }}%</span>
          </div>
        </template>

        <template #status="{ item }">
          <span 
                        class="status-badge" 
            :class="getStatusBadgeClass(item.status)"
          >
            {{ getStatusLabel(item.status) }}
          </span>
        </template>

        <template #has_risks="{ item }">
          <span 
            class="risk-badge"
            :class="hasAnswersWithRisk(item) ? 'has-risk' : 'no-risk'"
          >
            {{ hasAnswersWithRisk(item) ? getRiskLabel(true) : getRiskLabel(false) }}
          </span>
        </template>

        <template #approval_status="{ item }">
          <span 
            v-if="item.approval_status" 
                        class="approval-badge"
            :class="getApprovalBadgeClass(item.approval_status)"
          >
            {{ getApprovalLabel(item.approval_status) }}
          </span>
                      <span v-else class="approval-badge approval-approved">Approved</span>
        </template>

        <!-- Custom Actions -->
        <template #addAction="{ item }">
          <v-list-item class="action-list-item" @click="openViewModal(item)">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-eye-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("common.view") || "View" }}
            </v-list-item-title>
          </v-list-item>
        </template>

        <template #AddStatus="{ item }">
          <v-list-item 
            v-if="item.approval_status !== 'approved'"
            class="action-list-item" 
            @click="approveAssessment(item)"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon" style="color: #10B981;">mdi-check</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("common.approve") || "Approve" }}
            </v-list-item-title>
          </v-list-item>
          
          <v-list-item 
            v-if="item.approval_status !== 'declined' && item.approval_status !== 'rejected'"
            class="action-list-item" 
            @click="declineAssessment(item)"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon" style="color: #EF4444;">mdi-close</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("common.decline") || "Decline" }}
            </v-list-item-title>
          </v-list-item>
        </template>
                  </DataTable>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- Details/Flag Risks Modal -->
    <template #form>
      <div v-if="isFlipped" class="card">
        <div class="card-header">
          <h5>Assessment Result Details</h5>
          <button type="button" class="btn-close" @click="closeForm"></button>
        </div>
        <div class="card-body">
          <!-- Assessment Info -->
          <div class="mb-4">
            <h6 class="text-primary">Assessment Information</h6>
            <p><strong>Assessment:</strong> {{ selectedItem?.assessment?.name }}</p>
            <p><strong>User:</strong> {{ selectedItem?.user_email }}</p>
            <p><strong>Status:</strong> <span :class="getStatusBadgeClass(selectedItem?.status)" class="badge">{{ getStatusLabel(selectedItem?.status) }}</span></p>
            <p><strong>Completion:</strong> {{ selectedItem?.completion_percentage }}%</p>
            <p><strong>Submitted:</strong> {{ formatDate(selectedItem?.submitted_at) }}</p>
          </div>

          <!-- Answers Section -->
          <div class="mb-4">
            <h6 class="text-primary mb-3"><i class="fas fa-clipboard-list"></i> User Answers</h6>
            <div v-if="selectedItem?.answers && selectedItem.answers.length > 0">
              <div v-for="(answer, idx) in selectedItem.answers" :key="idx" class="answer-card mb-3 p-4 border rounded shadow-sm">
                <div class="mb-2">
                  <span class="badge bg-secondary me-2">#{{ idx + 1 }}</span>
                  <strong class="text-dark">{{ getQuestionText(answer.question_id) }}</strong>
                </div>
                <div class="answer-content p-3 bg-light rounded mt-2">
                  <i class="fas fa-comment-dots text-primary me-2"></i>
                  <strong class="text-dark">Answer:</strong> 
                  <span class="ms-2 answer-text">{{ getAnswerText(answer.question_id, answer.answer) }}</span>
                </div>
                
                <!-- Show if answer has risk data -->
                <div v-if="hasRiskData(answer)" class="mt-3">
                  <div class="alert alert-warning mb-0">
                    <i class="fas fa-exclamation-triangle"></i> <strong>Risk Detected</strong>
                    <div class="mt-2">
                      <small class="d-block"><strong>Subject:</strong> {{ getRiskSubject(answer) }}</small>
                      <small class="d-block"><strong>Impact:</strong> {{ getRiskImpact(answer) }}</small>
                      <small class="d-block"><strong>Likelihood:</strong> {{ getRiskLikelihood(answer) }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="alert alert-info">
              <i class="fas fa-info-circle"></i> No answers submitted yet.
            </div>
          </div>

          <!-- Auto-detected Risks Section -->
          <div v-if="hasDetectedRisks()" class="mb-4">
            <h6 class="text-danger mb-3"><i class="fas fa-exclamation-triangle"></i> Detected Risks</h6>
            <div class="alert alert-warning">
              <p><i class="fas fa-info-circle"></i> <strong>{{ getDetectedRisksCount() }} risk(s) detected</strong> in answers with risk data.</p>
            </div>

            <!-- Convert Action -->
            <div v-if="!selectedItem?.converted_to_risks" class="mt-3">
              <button class="btn btn-success btn-lg w-100" @click="convertRisksDirectly(selectedItem)">
                <i class="fas fa-check"></i> Approve
              </button>
            </div>
            <div v-else class="alert alert-success mt-3">
              <i class="fas fa-check-circle"></i> 
              <strong>Approved</strong>
              <div v-if="selectedItem.converted_risk_ids && selectedItem.converted_risk_ids.length > 0" class="mt-2">
                <small class="d-block">✅ {{ selectedItem.converted_risk_ids.length }} risk(s) created in Risk Register</small>
                <small class="text-muted d-block">Risk IDs: {{ selectedItem.converted_risk_ids.join(', ') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Flag Risk Modal -->
      <div v-if="showRiskFlagModal" class="modal-overlay" @click.self="closeFlagRiskModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Flag Risks</h5>
              <button type="button" class="btn-close" @click="closeFlagRiskModal"></button>
            </div>
            <div class="modal-body">
              <div v-for="(riskFlag, idx) in riskFlags" :key="idx" class="mb-3 p-3 border rounded">
                <h6>Risk Item {{ idx + 1 }}</h6>
                <div class="mb-3">
                  <label class="form-label">Question</label>
                  <select v-model="riskFlag.question_id" class="form-select">
                    <option value="">Select Question</option>
                    <option 
                      v-for="answer in selectedItem?.answers" 
                      :key="answer.question_id" 
                      :value="answer.question_id"
                    >
                      {{ getQuestionText(answer.question_id) }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Risk Description</label>
                  <textarea 
                    v-model="riskFlag.risk_description" 
                    class="form-control" 
                    rows="3"
                    placeholder="Describe the risk..."
                  ></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Severity</label>
                  <select v-model="riskFlag.severity" class="form-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <button 
                  v-if="riskFlags.length > 1"
                  class="btn btn-sm btn-danger" 
                  @click="removeRiskFlag(idx)"
                >
                  Remove
                </button>
              </div>
              <button class="btn btn-secondary" @click="addRiskFlag">
                <i class="fas fa-plus"></i> Add Another Risk
              </button>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeFlagRiskModal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="submitRiskFlags">Submit Flags</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </main-page>

  <!-- View Modal -->
  <div v-if="viewModal" class="view-modal-overlay" @click.self="closeViewModal">
    <div class="view-modal-wrapper">
      <div class="view-modal-content">
        <!-- Modal Header -->
        <div class="view-modal-header">
          <h2 class="view-modal-title">
            <i class="fas fa-clipboard-check me-2"></i>
            {{ $t("assessmentsresults.assessment_result_details") || "Assessment Result Details" }}
          </h2>
          <button type="button" class="view-modal-close-btn" @click="closeViewModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="view-modal-body">
          <!-- Assessment Info Card -->
          <div class="info-card">
            <div class="info-card-header">
              <i class="fas fa-info-circle me-2"></i>
              <h3 class="info-card-title">{{ $t("assessmentsresults.assessment_information") || "Assessment Information" }}</h3>
            </div>
            <div class="info-card-body">
              <div class="info-grid">
                <div class="info-item">
                  <label class="info-label">{{ $t("assessmentsresults.assessment") || "Assessment" }}</label>
                  <div class="info-value">{{ selectedItem?.assessment?.name || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t("assessmentsresults.user") || "User" }}</label>
                  <div class="info-value">{{ selectedItem?.user_email || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t("assessmentsresults.status") || "Status" }}</label>
                  <div class="info-value">
                    <span :class="['status-badge', getStatusBadgeClass(selectedItem?.status)]">
                      {{ getStatusLabel(selectedItem?.status) }}
                    </span>
                  </div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t("assessmentsresults.completion") || "Completion" }}</label>
                  <div class="info-value">
                    <div class="completion-display">
                      <div class="progress-bar-container">
                        <div 
                          class="progress-bar-fill" 
                          :style="{ width: (selectedItem?.completion_percentage || 0) + '%' }"
                        ></div>
                      </div>
                      <span class="completion-text">{{ selectedItem?.completion_percentage || 0 }}%</span>
                    </div>
                  </div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t("assessmentsresults.submitted") || "Submitted" }}</label>
                  <div class="info-value">{{ formatDate(selectedItem?.submitted_at) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Answers Section -->
          <div class="answers-section">
            <div class="section-header">
              <i class="fas fa-clipboard-list me-2"></i>
              <h3 class="section-title d-flex rtl">{{ $t("assessmentsresults.user_answers") || "User Answers" }}</h3>
              <span class="answers-count">{{ selectedItem?.answers?.length || 0 }} {{ $t("assessmentsresults.answers") || "answers" }}</span>
            </div>
            
            <div v-if="selectedItem?.answers && selectedItem.answers.length > 0" class="answers-list">
              <div v-for="(answer, idx) in selectedItem.answers" :key="idx" class="answer-item">
                <div class="answer-header">
                  <span class="answer-number">#{{ idx + 1 }}</span>
                  <div class="answer-question">
                    {{ stripHtmlTags(getQuestionText(answer.question_id)) }}
                  </div>
                </div>
                
                <div class="answer-response">
                  <div class="answer-label">
                    <i class="fas fa-comment-dots me-2"></i>
                    {{ $t("assessmentsresults.answer") || "Answer" }}:
                  </div>
                  <div class="answer-value">
                    {{ getAnswerText(answer.question_id, answer.answer) }}
                  </div>
                </div>
                
                <!-- Risk Warning -->
                <div v-if="hasRiskData(answer)" class="risk-warning">
                  <div class="risk-warning-header">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>{{ $t("assessmentsresults.risk_detected") || "Risk Detected" }}</strong>
                  </div>
                  <div class="risk-details">
                    <div class="risk-detail-item">
                      <span class="risk-detail-label">{{ $t("assessmentsresults.subject") || "Subject" }}:</span>
                      <span class="risk-detail-value">{{ getRiskSubject(answer) || 'N/A' }}</span>
                    </div>
                    <div class="risk-detail-item">
                      <span class="risk-detail-label">{{ $t("assessmentsresults.impact") || "Impact" }}:</span>
                      <span class="risk-detail-value">{{ getRiskImpact(answer) || 'N/A' }}</span>
                    </div>
                    <div class="risk-detail-item">
                      <span class="risk-detail-label">{{ $t("assessmentsresults.likelihood") || "Likelihood" }}:</span>
                      <span class="risk-detail-value">{{ getRiskLikelihood(answer) || 'N/A' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>{{ $t("assessmentsresults.no_answers_submitted_yet") || "No answers submitted yet." }}</p>
            </div>
          </div>

          <!-- Detected Risks Summary -->
          <div v-if="hasDetectedRisks()" class="risks-summary">
            <div class="risks-summary-header">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <h3 class="section-title">{{ $t("assessmentsresults.detected_risks") || "Detected Risks" }}</h3>
            </div>
            <div class="risks-summary-content">
              <div class="risks-count-badge">
                <span class="risks-count-number">{{ getDetectedRisksCount() }}</span>
                <span class="risks-count-label">{{ $t("assessmentsresults.risks_detected_in_answers") || "risk(s) detected in answers with risk data." }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="view-modal-footer">
          <button type="button" class="btn-close-modal" @click="closeViewModal">
            <i class="fas fa-times me-2"></i>
            {{ $t("common.close") || "Close" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import assessmentsresults from "@/API/AssessmentsResults/AssessmentsResults";
import questionApi from "@/API/Question/Question";
import assessmentApi from "@/API/Assessment/Assessment";
import UserApi from "@/API/User/User";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
  },

  setup() {
    const api = new assessmentsresults();
    const question = new questionApi();
    const assessment = new assessmentApi();
    const userApi = new UserApi();
    const tableColumns = [];
    const fromFields = [];
    const apiParams = {};

    return {
      api,
      question,
      assessment,
      userApi,
      tableColumns,
      fromFields,
      apiParams
    };
  },
 
  async mounted() {
    // Load questions for reference with full details
    await this.loadQuestions();
    
    // Check if we're filtering by assessment_id from query params
    const assessmentId = this.$route.query.assessment_id;
    if (assessmentId) {
      this.filterByAssessment(assessmentId);
    }
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      selectedItem: null,
      showRiskFlagModal: false,
      riskFlags: [],
      questionsList: [],
      currentAssessmentFilter: null,
      activeTab: 'information',
      pageLoading: false,
      searchQuery: '',
      perPage: 10,
      activeFiltersCount: 1,
      searchTimeout: null,
      assessmentData: null,
      templateQuestions: [],
      assessmentUsers: [],
      questionColumns: [],
      questionApiParams: {},
      viewModal: false,
      assessmentHasRisks: false, // Track if assessment has risks
    };
  },

  watch: {
    // Watch currentAssessmentFilter to update risk status when filter changes
    currentAssessmentFilter(newVal) {
      if (newVal) {
        // Wait for table to load, then check risks
        this.$nextTick(() => {
          this.updateAssessmentRisksStatus();
        });
      } else {
        this.assessmentHasRisks = false;
      }
    }
  },

  computed: {
    displayUsers() {
      return this.assessmentUsers.slice(0, 4);
    },
    remainingUsers() {
      return Math.max(0, this.assessmentUsers.length - 4);
    },
    
    hasAssessmentRisks() {
      
      if (this.$refs.table && this.$refs.table.data && Array.isArray(this.$refs.table.data)) {
        // Check if any result in the table has risks
        return this.$refs.table.data.some(result => {
          return this.hasAnswersWithRisk(result);
        });
      }
      
      // Fallback to stored value
      return this.assessmentHasRisks;
    },
    
    // Base columns for results table (without Assessment when filtered)
    baseTableColumns() {
      return [
        {
          title: this.$t("assessmentsresults.user") || "User",
        data: "user",
        id: "user",
        defaultContent: "N/A"
      },
      {
          title: this.$t("assessmentsresults.completion") || "Completion",
        data: "completion",
        id: "completion",
        defaultContent: "0%"
      },
      {
          title: this.$t("assessmentsresults.status") || "Status",
        data: "status",
        id: "status",
        defaultContent: "N/A"
      },
      {
          title: this.$t("assessmentsresults.risks") || "Risk Status",
        data: "has_risks",
        id: "has_risks",
        defaultContent: "N/A"
      },
      {
          title: this.$t("assessmentsresults.approval") || "Approval",
        data: "approval_status",
        id: "approval_status",
        defaultContent: "N/A"
      },
      ];
    },
    
    // Full columns for default view (with Assessment column)
    fullTableColumns() {
      return [
        {
          title: this.$t("assessmentsresults.assessment") || "Assessment",
          data: "assessment",
          id: "assessment",
          defaultContent: "N/A"
        },
        ...this.baseTableColumns
      ];
    },
    
    // Current table columns based on filter state
    tableColumns() {
      return this.currentAssessmentFilter 
        ? this.baseTableColumns 
        : this.fullTableColumns;
    },
  },

  created() {
    // Initialize tableColumns reference (will be overridden by computed)
    this._tableColumns = [];
    
    // Question columns matching Question.vue structure
    this.questionColumns = [
      {
        id: "question",
        title: this.$t("question.question") || "Question",
        data: "question",
      },
      {
        id: "type",
        title: this.$t("question.type") || "Type",
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "hasCompliance",
        title: "Has Compliance",
        data: "has_compliance",
        defaultContent: "N/A",
      },
      {
        id: "hasMaturity",
        title: "Has Maturity",
        data: "has_maturity",
        defaultContent: "N/A",
      },
      {
        id: "hasFileAttachment",
        title: this.$t("question.hasFileAttachment") || "Has Attachment",
        data: "fileAttachment",
        defaultContent: "N/A",
      },
      {
        id: "hasRisk",
        title: this.$t("question.hasRisk") || "Has Risk",
        data: "answers",
        defaultContent: "N/A",
      },
    ];
  },

  methods: {
    // Filter results by assessment ID
    async filterByAssessment(assessmentId) {
      this.pageLoading = true;
      try {
      this.currentAssessmentFilter = assessmentId;
      this.apiParams = {
        filter: `assessment_id|${assessmentId}|=`
      };
      
        // Load assessment data and template questions
        await this.loadAssessmentData(assessmentId);
        await this.loadTemplateQuestions(assessmentId);
      
      // Refresh table with new filter (columns will update automatically via computed property)
      if (this.$refs.table) {
        this.$refs.table.refreshTable();
        // Wait for table to load, then update risk status
        this.$nextTick(() => {
          setTimeout(() => {
            this.updateAssessmentRisksStatus();
          }, 500); // Small delay to ensure table data is loaded
        });
        }
      } finally {
        this.pageLoading = false;
      }
    },
    
    updateAssessmentRisksStatus() {
      if (!this.currentAssessmentFilter) {
        this.assessmentHasRisks = false;
        return;
      }
      
      if (this.$refs.table && this.$refs.table.data && Array.isArray(this.$refs.table.data)) {
        this.assessmentHasRisks = this.$refs.table.data.some(result => {
          return this.hasAnswersWithRisk(result);
        });
      } else {
        this.assessmentHasRisks = false;
      }
    },
    

    async loadAssessmentData(assessmentId) {
      try {
        if (!assessmentId) {
          console.warn('No assessment ID provided');
          this.assessmentData = null;
          this.assessmentUsers = [];
          return;
        }

        // Use with[] format for nested relationships
        const response = await this.assessment.show(assessmentId, {
          'with[]': ['template.questions']
        });
        
        // Handle response structure - API returns data directly
        const data = response?.data || response;
        this.assessmentData = data;
        
        // Extract users from user_ids array
        if (data?.user_ids && Array.isArray(data.user_ids) && data.user_ids.length > 0) {
          // Fetch user details from user service
          try {
            const userPromises = data.user_ids.map(userId => 
              this.userApi.show(userId).catch(err => {
                console.warn(`Failed to fetch user ${userId}:`, err);
                return { id: userId, _id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
              })
            );
            const userResponses = await Promise.all(userPromises);
            this.assessmentUsers = userResponses.map(res => {
              const userData = res?.data || res;
              return {
                id: userData.id || userData._id,
                _id: userData._id || userData.id,
                name: userData.name || userData.full_name || `User ${userData.id || userData._id}`,
                email: userData.email || `user${userData.id || userData._id}@example.com`
              };
            });
          } catch (error) {
            console.error('Error fetching user details:', error);
            // Fallback to placeholder users
            this.assessmentUsers = data.user_ids.map(id => ({ 
              id: id,
              _id: id,
              name: `User ${id}`,
              email: `user${id}@example.com`
            }));
          }
        } else if (data?.users && Array.isArray(data.users) && data.users.length > 0) {
          // Users are already loaded
          this.assessmentUsers = data.users;
        } else {
          this.assessmentUsers = [];
        }
        
        console.log('Loaded assessment data:', this.assessmentData);
        console.log('Assessment name:', this.assessmentData?.name);
        console.log('Template:', this.assessmentData?.template);
        console.log('Template name:', this.assessmentData?.template?.name);
        console.log('Assessment users:', this.assessmentUsers);
      } catch (error) {
        console.error('Error loading assessment data:', error);
        this.assessmentData = null;
        this.assessmentUsers = [];
      }
    },

    async loadTemplateQuestions(assessmentId) {
      try {
        let templateId = null;
        
        // First try to get from already loaded assessment data
        if (this.assessmentData && this.assessmentData.template) {
          templateId = this.assessmentData.template.id || this.assessmentData.template_id;
          
          if (this.assessmentData.template.questions && Array.isArray(this.assessmentData.template.questions)) {
            this.templateQuestions = this.assessmentData.template.questions;
            // Still set up API params for DataTable
            if (templateId) {
              this.questionApiParams = {
                filterIn: `assessment_template_ids|${templateId}`
              };
            }
            return;
          }
        }
        
        // If not available, fetch with template.questions
        const response = await this.assessment.show(assessmentId, {
          with: ['template.questions']
        });
        
        const assessment = response.data || response;
        
        if (assessment.template) {
          templateId = assessment.template.id || assessment.template_id;
          
          if (assessment.template.questions && Array.isArray(assessment.template.questions)) {
            this.templateQuestions = assessment.template.questions;
          }
        }
        
        // Set up API params for DataTable to filter by template ID
        if (templateId) {
          this.questionApiParams = {
            filterIn: `assessment_template_ids|${templateId}`
          };
          
          // Refresh questions table if it exists
          if (this.$refs.questionsTable) {
            this.$refs.questionsTable.refreshTable();
          }
        } else {
          // Fallback: try to fetch questions directly
          const questions = await this.question.getAll({});
          this.templateQuestions = Array.isArray(questions) ? questions : (questions.data || []);
        }
        
        console.log('Loaded template questions:', this.templateQuestions.length);
        console.log('Question API params:', this.questionApiParams);
      } catch (error) {
        console.error('Error loading template questions:', error);
        this.templateQuestions = [];
        this.questionApiParams = {};
      }
    },

    async loadQuestions() {
      try {
        // Load all questions with full details
        this.questionsList = await this.question.getAll({});
        console.log('Loaded questions:', this.questionsList.length);
        
        // Log questions with risk capability for debugging
        const riskQuestions = this.questionsList.filter(q => 
          q.risk === true || q.has_risk === true || q.is_risk === true || q.can_be_risk === true
        );
        console.log('Questions with risk capability:', riskQuestions.length, riskQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    },

    getQuestionText(questionId) {
      const q = this.questionsList.find(q => q._id === questionId || q.id === questionId);
      return q ? this.stripHtmlTags(q.question) : `Question ${questionId}`;
    },

    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    formatAnswer(answer) {
      if (Array.isArray(answer)) {
        return answer.join(', ');
      }
      return answer;
    },

    getAnswerText(questionId, answer) {
      // Find the question
      const question = this.questionsList.find(q => q._id === questionId || q.id === questionId);
      
      if (!question) {
        return answer; // Return raw answer if question not found
      }

      // If answer is an ID, try to find it in question.answers array
      if (question.answers && Array.isArray(question.answers)) {
        if (Array.isArray(answer)) {
          // Multiple choice - map each ID to text
          return answer.map(answerId => {
            const answerObj = question.answers.find(a => a.id === answerId);
            if (answerObj) {
              // Show risk indicator if this answer has risk data
              const riskIndicator = answerObj.risk ? ' 🚨' : '';
              return answerObj.text + riskIndicator;
            }
            return answerId;
          }).join(', ');
        } else {
          // Single choice - find the answer text
          const answerObj = question.answers.find(a => a.id === answer);
          if (answerObj) {
            // Show risk indicator if this answer has risk data
            const riskIndicator = answerObj.risk ? ' 🚨' : '';
            return answerObj.text + riskIndicator;
          }
          return answer;
        }
      }
      
      // If it's a text answer or no answers array found
      return answer;
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString();
    },

    formatBalance(amount) {
      return new Intl.NumberFormat('en-US').format(amount);
    },

    getUserBadge(email) {
      if (!email) return 'U1';
      // Extract user number from email or generate from email
      const match = email.match(/user(\d+)/i);
      if (match) {
        return `U${match[1]}`;
      }
      // Generate badge from email hash
      const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `U${(hash % 99) + 1}`;
    },

    debouncedSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        if (this.$refs.table) {
          this.$refs.table.searchQuery = this.searchQuery;
          this.$refs.table.debouncedFetchData();
        }
      }, 300);
    },

    changePerPage() {
      if (this.$refs.table) {
        this.$refs.table.perPage = parseInt(this.perPage);
        this.$refs.table.currentPage = 1;
        this.$refs.table.fetchData();
      }
    },

    openActionMenu(item) {
      this.viewDetails(item);
    },

    closeAssessmentDetails() {
      this.clearFilter();
    },

    getUserInitials(user) {
      if (!user) return 'U';
      if (typeof user === 'string') {
        const parts = user.split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.substring(0, 2).toUpperCase();
      }
      if (user.name) {
        const parts = user.name.split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.name.substring(0, 2).toUpperCase();
      }
      if (user.email) {
        return user.email.substring(0, 2).toUpperCase();
      }
      return 'U';
    },

    getUserColor(user) {
      const colors = [
        '#43235c', '#3B82F6', '#10B981', '#F59E0B', 
        '#EF4444', '#EC4899', '#6366F1', '#14B8A6'
      ];
      if (typeof user === 'string') {
        const hash = user.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
      }
      if (user.id) {
        return colors[user.id % colors.length];
      }
      return colors[0];
    },

    getUserDisplayName(user) {
      if (!user) return 'User';
      if (typeof user === 'string') return user;
      return user.name || user.full_name || user.email || user.username || 'User';
    },

    getProgressBarClass(percentage) {
      if (percentage >= 80) return 'bg-success';
      if (percentage >= 50) return 'bg-info';
      if (percentage >= 25) return 'bg-warning';
      return 'bg-danger';
    },

    getStatusBadgeClass(status) {
      const classes = {
        'in_progress': 'status-in-progress',
        'submitted': 'status-submitted',
        'under_review': 'status-under-review',
      };
      return classes[status] || 'status-default';
    },

    getStatusLabel(status) {
      const labels = {
        'in_progress': 'In Progress',
        'submitted': 'Submitted',
        'under_review': 'Under Review',
      };
      return labels[status] || status;
    },

    getApprovalBadgeClass(status) {
      const classes = {
        'pending': 'approval-pending',
        'approved': 'approval-approved',
        'rejected': 'approval-rejected',
      };
      return classes[status] || 'approval-default';
    },

    getApprovalLabel(status) {
      const labels = {
        'pending': 'Pending',
        'approved': 'Approved',
        'rejected': 'Rejected',
      };
      return labels[status] || status;
    },

    getSeverityBadgeClass(severity) {
      const classes = {
        'low': 'bg-info',
        'medium': 'bg-warning',
        'high': 'bg-danger',
        'critical': 'bg-dark',
      };
      return classes[severity] || 'bg-warning';
    },

    hideActions() {
      return (row) => {
        return {
          edit: true, // Hide edit button
          delete: false // Keep delete button
        };
      };
    },

    getTranslation(key, fallback) {
      try {
        const translation = this.$t(key);
        // Check if translation exists and is not the same as the key
        if (translation && translation !== key && translation !== `[${key}]`) {
          return translation;
        }
      } catch (e) {
        console.warn('Translation error for key:', key, e);
      }
      return fallback;
    },

    getRiskLabel(hasRisk) {
      if (hasRisk) {
        return this.getTranslation("assessmentsresults.has_risk", "Has Risk");
      } else {
        return this.getTranslation("assessmentsresults.no_risk", "No Risk");
      }
    },
    
    openViewModal(item) {
      this.selectedItem = item;
      this.viewModal = true;
    },
    
    closeViewModal() {
      this.viewModal = false;
      this.selectedItem = null;
    },

    viewDetails(item) {
      this.selectedItem = item;
      this.isFlipped = true;
    },
    
    async approveAssessment(item) {
      try {
        const confirmed = confirm(this.$t("assessmentsresults.confirm_approve") || "Are you sure you want to approve this assessment result?");
        if (!confirmed) return;
        
        const response = await this.api.update(item._id || item.id, {
          approval_status: 'approved'
        });
        
        if (response) {
          this.$toast && this.$toast.success(this.$t("assessmentsresults.approved_successfully") || "Assessment result approved successfully");
          if (this.$refs.table) {
            this.$refs.table.refreshTable();
          }
        }
      } catch (error) {
        console.error('Error approving assessment:', error);
        this.$toast && this.$toast.error(this.$t("assessmentsresults.approve_failed") || "Failed to approve assessment result");
      }
    },
    
    async declineAssessment(item) {
      try {
        const confirmed = confirm(this.$t("assessmentsresults.confirm_decline") || "Are you sure you want to decline this assessment result?");
        if (!confirmed) return;
        
        const response = await this.api.update(item._id || item.id, {
          approval_status: 'declined'
        });
        
        if (response) {
          this.$toast && this.$toast.success(this.$t("assessmentsresults.declined_successfully") || "Assessment result declined successfully");
          if (this.$refs.table) {
            this.$refs.table.refreshTable();
          }
        }
      } catch (error) {
        console.error('Error declining assessment:', error);
        this.$toast && this.$toast.error(this.$t("assessmentsresults.decline_failed") || "Failed to decline assessment result");
      }
    },

    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.selectedItem = null;
      this.$refs.table.refreshTable();
    },

    clearFilter() {
      this.currentAssessmentFilter = null;
      this.apiParams = {};
      // Go back to assessment list
      this.$router.push('/assessment');
    },

    // Check if item has answers with risk data
    hasAnswersWithRisk(item) {
      if (!item.answers || item.answers.length === 0) return false;
      
      return item.answers.some(answer => {
        const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
        if (!question || !question.answers) return false;
        
        // Check if selected answer has risk data
        if (Array.isArray(answer.answer)) {
          return answer.answer.some(answerId => {
            const answerOption = question.answers.find(a => a.id === answerId);
            return answerOption && answerOption.risk;
          });
        } else {
          const answerOption = question.answers.find(a => a.id === answer.answer);
          return answerOption && answerOption.risk;
        }
      });
    },

    // Check if current selected item has detected risks
    hasDetectedRisks() {
      if (!this.selectedItem) return false;
      return this.hasAnswersWithRisk(this.selectedItem);
    },

    // Count detected risks
    getDetectedRisksCount() {
      if (!this.selectedItem || !this.selectedItem.answers) return 0;
      
      let count = 0;
      this.selectedItem.answers.forEach(answer => {
        const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
        if (!question || !question.answers) return;
        
        if (Array.isArray(answer.answer)) {
          answer.answer.forEach(answerId => {
            const answerOption = question.answers.find(a => a.id === answerId);
            if (answerOption && answerOption.risk) count++;
          });
        } else {
          const answerOption = question.answers.find(a => a.id === answer.answer);
          if (answerOption && answerOption.risk) count++;
        }
      });
      
      return count;
    },

    // Get risk data from answer
    hasRiskData(answer) {
      const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
      if (!question || !question.answers) return false;
      
      if (Array.isArray(answer.answer)) {
        return answer.answer.some(answerId => {
          const answerOption = question.answers.find(a => a.id === answerId);
          return answerOption && answerOption.risk;
        });
      } else {
        const answerOption = question.answers.find(a => a.id === answer.answer);
        return answerOption && answerOption.risk;
      }
    },

    getRiskSubject(answer) {
      const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
      if (!question || !question.answers) return 'N/A';
      
      const answerOption = question.answers.find(a => a.id === answer.answer);
      return answerOption?.risk?.subject || 'N/A';
    },

    getRiskImpact(answer) {
      const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
      if (!question || !question.answers) return 'N/A';
      
      const answerOption = question.answers.find(a => a.id === answer.answer);
      return answerOption?.risk?.impact || 'N/A';
    },

    getRiskLikelihood(answer) {
      const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
      if (!question || !question.answers) return 'N/A';
      
      const answerOption = question.answers.find(a => a.id === answer.answer);
      return answerOption?.risk?.likelihood || 'N/A';
    },

    // Convert risks directly from answer data
    async convertRisksDirectly(item) {
      const count = this.hasAnswersWithRisk(item) ? this.getDetectedRisksCount() : 0;
      
      if (!confirm(`Approve and convert ${count} detected risk(s) to the Risk Module?`)) return;
      
      try {
        // Build risk items from answers with risk data
        const riskItems = [];
        
        item.answers.forEach(answer => {
          const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
          if (!question || !question.answers) return;
          
          if (Array.isArray(answer.answer)) {
            answer.answer.forEach(answerId => {
              const answerOption = question.answers.find(a => a.id === answerId);
              if (answerOption && answerOption.risk) {
                riskItems.push({
                  question_id: answer.question_id,
                  risk_description: answerOption.risk.subject || 'Risk from assessment',
                  severity: this.mapImpactToSeverity(answerOption.risk.impact),
                  risk_data: answerOption.risk
                });
              }
            });
          } else {
            const answerOption = question.answers.find(a => a.id === answer.answer);
            if (answerOption && answerOption.risk) {
              riskItems.push({
                question_id: answer.question_id,
                risk_description: answerOption.risk.subject || 'Risk from assessment',
                severity: this.mapImpactToSeverity(answerOption.risk.impact),
                risk_data: answerOption.risk
              });
            }
          }
        });
        
        // Step 1: Flag risks automatically
        await this.api.flagRisks(item._id || item.id, riskItems);
        
        // Step 2: Approve
        await this.api.approveRisks(item._id || item.id);
        
        // Step 3: Convert
        const payload = {
          category_id: null,
          owner_id: item.user_id,
        };
        
        const response = await this.api.convertToRisks(item._id || item.id, payload);
        
        if (response && response.data) {
          const createdCount = response.data.count || response.data.risk_ids?.length || 0;
          alert(`✅ Success! ${createdCount} risk(s) created in Risk Module`);
          this.$refs.table && this.$refs.table.refreshTable();
          this.closeForm();
        }
      } catch (error) {
        console.error('Error converting risks:', error);
        alert('Failed to convert risks: ' + (error.message || 'Unknown error'));
      }
    },

    // Map impact level to severity
    mapImpactToSeverity(impact) {
      const mapping = {
        'Minor': 'low',
        'Moderate': 'medium',
        'Major': 'high',
        'Severe': 'critical',
        'Critical': 'critical'
      };
      return mapping[impact] || 'medium';
    },

    // Approve only (kept for backward compatibility)
    async approveRisks(item) {
      if (!confirm('Are you sure you want to approve these risks?')) return;
      
      try {
        await this.api.approveRisks(item._id);
        this.$toast && this.$toast.success('Risks approved successfully');
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error('Error approving risks:', error);
        this.$toast && this.$toast.error('Failed to approve risks');
      }
    },

    async rejectRisks(item) {
      if (!confirm('Are you sure you want to reject these risks?')) return;
      
      try {
        await this.api.rejectRisks(item._id);
        this.$toast && this.$toast.success('Risks rejected successfully');
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error('Error rejecting risks:', error);
        this.$toast && this.$toast.error('Failed to reject risks');
      }
    },

    // Check if answer can be flagged
    canFlagAnswer(answer) {
      // Can flag if:
      // 1. Assessment is submitted
      // 2. The selected answer has risk data
      // 3. This specific answer is not already flagged
      
      if (this.selectedItem.status !== 'submitted') return false;
      
      // Find the question
      const question = this.questionsList.find(q => q._id === answer.question_id || q.id === answer.question_id);
      
      if (!question) {
        console.warn('Question not found:', answer.question_id);
        return false;
      }
      
      // Check if the selected answer has risk data
      // answer.answer could be an ID or text depending on question type
      let selectedAnswerHasRisk = false;
      
      if (question.answers && Array.isArray(question.answers)) {
        // Find the selected answer option
        if (Array.isArray(answer.answer)) {
          // Multiple choice - check if any selected answer has risk
          selectedAnswerHasRisk = answer.answer.some(answerId => {
            const answerOption = question.answers.find(a => a.id === answerId);
            return answerOption && answerOption.risk !== null && answerOption.risk !== undefined;
          });
        } else {
          // Single choice - check if selected answer has risk
          const answerOption = question.answers.find(a => a.id === answer.answer);
          selectedAnswerHasRisk = answerOption && answerOption.risk !== null && answerOption.risk !== undefined;
        }
      }
      
      if (!selectedAnswerHasRisk) {
        console.log('Selected answer does not have risk data:', answer);
        return false;
      }
      
      // Check if this question is already flagged
      if (this.selectedItem.risk_items && this.selectedItem.risk_items.length > 0) {
        const alreadyFlagged = this.selectedItem.risk_items.some(
          risk => risk.question_id === answer.question_id
        );
        if (alreadyFlagged) return false;
      }
      
      return true;
    },

    // Check if answer is already flagged
    isAnswerFlagged(answer) {
      if (!this.selectedItem.risk_items || this.selectedItem.risk_items.length === 0) {
        return false;
      }
      
      return this.selectedItem.risk_items.some(
        risk => risk.question_id === answer.question_id
      );
    },

    // Check if question has any answer with risk data
    isRiskQuestion(questionId) {
      const question = this.questionsList.find(q => q._id === questionId || q.id === questionId);
      if (!question) return false;
      
      // Check if question-level risk flag exists
      if (question.risk === true || question.has_risk === true || question.is_risk === true || question.can_be_risk === true) {
        return true;
      }
      
      // Check if any answer option has risk data
      if (question.answers && Array.isArray(question.answers)) {
        return question.answers.some(answer => answer.risk !== null && answer.risk !== undefined);
      }
      
      return false;
    },

    // Convert to Risks
    async convertToRisks(item) {
      if (!confirm('Convert approved risks to Risk module?')) return;
      
      try {
        const payload = {
          // You can add additional fields for risk creation
          category_id: null, // Could prompt user for these
          owner_id: item.user_id,
        };
        
        await this.api.convertToRisks(item._id, payload);
        this.$toast && this.$toast.success('Risks converted successfully');
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error('Error converting risks:', error);
        this.$toast && this.$toast.error('Failed to convert risks');
      }
    },
  },
};
</script>

<style scoped>
/* Loading Overlay */
.global-loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
  background: rgba(255, 255, 255, 0.9);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 70px;
  height: 70px;
  border: 5px solid rgba(67, 35, 92, 0.2);
  border-radius: 50%;
  border-top-color: #43235c;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

.loading-dots {
  display: inline-flex;
  margin-top: 1rem;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  margin: 0 4px;
  background-color: #43235c;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Assessment Results Container */
.assessment-results-container {
  padding: 24px;
  background-color: #F9FAFB;
  min-height: calc(100vh - 120px);
}

.assessment-results-container .container-fluid {
  padding: 0;
}

/* Assessment Header */
.assessment-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assessment-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

/* Single Panel Container */
.single-panel-container {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-top: 24px;
}

.panel-content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Default View */
.default-view {
  padding: 24px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6B7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #F3F4F6;
  color: #1F2937;
}

/* Tab Content Placeholder */
.tab-content-placeholder {
  padding: 24px;
  color: #6B7280;
  text-align: center;
}

/* Tabs Navigation */
.tabs-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: none;
}

.tab-link {
  flex: 1;
  padding: 12px 24px;
  background: #F3F4F6;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: none;
  text-align: center;
}

.tab-link:hover {
  background: #E5E7EB;
  color: #43235c;
}

.tab-link.active {
  background: #43235c;
  color: #FFFFFF;
  font-weight: 600;
}

.tabs-content-wrapper {
  margin-top: 0;
}

.tab-content-panel {
  padding: 0;
}

/* Tab Content */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

/* Section Labels */
.section-label {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 20px;
}

/* Assessment Information Section */
.assessment-info-section {
  background: #FFFFFF;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.assessment-info-title {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

.assessment-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.assessment-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assessment-info-label {
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.assessment-info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
}

.assessment-users-display {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.assessment-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  background-color: #43235c;
  flex-shrink: 0;
}

.assessment-user-more {
  background-color: #10B981 !important;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
}

.assessment-no-users {
  font-size: 14px;
  color: #9CA3AF;
  font-style: italic;
}

.assessment-risk-status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 80px;
}

.assessment-risk-status-badge.no-risk {
  background-color: #D1FAE5;
  color: #065F46;
}

.assessment-risk-status-badge.has-risk {
  background-color: #FEE2E2;
  color: #991B1B;
}

/* Legacy styles for backward compatibility */
.info-section {
  margin-bottom: 32px;
}

.info-item {
  margin-bottom: 20px;
}

.info-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 8px;
}

.info-value {
  font-size: 14px;
  color: #1F2937;
}

.info-value.bold {
  font-weight: 600;
}

/* Users Avatars */
.users-avatars {
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  background-color: #43235c;
}

.user-avatar.more {
  background-color: #E5E7EB;
  color: #1F2937;
}

/* Risk Status Badge */
.risk-status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.risk-status-badge.no-risk {
  background-color: #D1FAE5;
  color: #065F46;
}

/* Template Questions Table */
.questions-section {
  margin-top: 32px;
}

.questions-section :deep(.table-controls) {
  display: none; /* Hide import/export buttons for questions table */
}

.questions-section :deep(.search-section) {
  margin-bottom: 16px;
}

.questions-table-container {
  overflow-x: auto;
}

.questions-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.questions-table thead th {
  background-color: #F9FAFB;
  color: #1F2937;
  font-weight: 600;
  font-size: 12px;
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.questions-table tbody td {
  padding: 12px 8px;
  border-bottom: 1px solid #F3F4F6;
  font-size: 13px;
  color: #1F2937;
}

.questions-table tbody tr:hover {
  background-color: #F9FAFB;
}

.question-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.see-more {
  color: #43235c;
  cursor: pointer;
  margin-left: 4px;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #E5E7EB;
  color: #6B7280;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.text-success {
  color: #10B981;
}

.text-danger {
  color: #EF4444;
}

.text-center {
  text-align: center;
}

.no-users {
  color: #6B7280;
  font-size: 14px;
  font-style: italic;
}

/* Controls Row */
.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #1F2937;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #43235c;
  box-shadow: 0 0 0 3px rgba(67, 35, 92, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6B7280;
  font-size: 14px;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: #43235c;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #7C3AED;
}

.menu-btn {
  padding: 10px 12px;
  background-color: #F3F4F6;
  color: #1F2937;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background-color: #E5E7EB;
}

.per-page-select {
  padding: 10px 32px 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #1F2937;
  background-color: #FFFFFF;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 9L1 4h10L6 9z' fill='%236B7280'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.per-page-select:focus {
  outline: none;
  border-color: #43235c;
  box-shadow: 0 0 0 3px rgba(67, 35, 92, 0.1);
}

/* Table Cells */
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 8px;
  background-color: #43235c;
  color: #FFFFFF;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #1F2937;
}

.completion-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background-color: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  min-width: 100px;
}

.progress-bar-fill {
  height: 100%;
  background-color: #43235c;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.completion-text {
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
  min-width: 40px;
}

/* Badges */
.status-badge,
.risk-badge,
.approval-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-submitted {
  background-color: #E5E7EB;
  color: #1F2937;
}

.status-badge.status-in-progress {
  background-color: #FEF3C7;
  color: #92400E;
}

.status-badge.status-under-review {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.status-badge.status-default {
  background-color: #F3F4F6;
  color: #6B7280;
}

.risk-badge.has-risk {
  background-color: #FEE2E2;
  color: #991B1B;
}

.risk-badge.no-risk {
  background-color: #D1FAE5;
  color: #065F46;
}

.approval-badge.approval-approved {
  background-color: #D1FAE5;
  color: #065F46;
}

.approval-badge.approval-pending {
  background-color: #FEF3C7;
  color: #92400E;
}

.approval-badge.approval-rejected {
  background-color: #FEE2E2;
  color: #991B1B;
}

.approval-badge.approval-default {
  background-color: #F3F4F6;
  color: #6B7280;
}

/* Actions */
.actions-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-menu-btn {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 16px;
}

.action-menu-btn:hover {
  background-color: #F3F4F6;
  color: #1F2937;
}

/* Assessment Result Content */
.assessment-result-content {
  padding: 24px 0;
  color: #6B7280;
}

/* Table Overrides */
.assessment-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.assessment-table thead th {
  background-color: #F9FAFB;
  color: #1F2937;
  font-weight: 600;
  font-size: 14px;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.assessment-table tbody td {
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  font-size: 14px;
  color: #1F2937;
}

.assessment-table tbody tr:hover {
  background-color: #F9FAFB;
}

.assessment-table tbody tr:last-child td {
  border-bottom: none;
}

/* Pagination Styles - Override DataTable pagination */
.assessment-details-container :deep(.pagination) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.assessment-details-container :deep(.pagination-info) {
  color: #6B7280;
  font-size: 14px;
}

.assessment-details-container :deep(.pagination-controls) {
  display: flex;
  gap: 8px;
  align-items: center;
}

.assessment-details-container :deep(.page-btn) {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #D1D5DB;
  background-color: #FFFFFF;
  color: #1F2937;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.assessment-details-container :deep(.page-btn:hover) {
  background-color: #F3F4F6;
  border-color: #43235c;
}

.assessment-details-container :deep(.page-btn.active) {
  background-color: #43235c;
  color: #FFFFFF;
  border-color: #43235c;
}

.assessment-details-container :deep(.page-btn:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Existing Styles */
.answer-card {
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.answer-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.answer-content {
  background-color: #f8f9fa;
  border-left: 4px solid #0d6efd;
}

.answer-text {
  color: #2d3748;
  font-weight: 600;
  font-size: 1.05rem;
}

.risk-card {
  background-color: #fff5f5;
  border-left: 5px solid #dc3545 !important;
}

.risk-card:hover {
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.2) !important;
}

/* View Modal Styles */
.view-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.view-modal-wrapper {
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.view-modal-content {
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.view-modal-header {
  background: linear-gradient(135deg, #6E3894 0%, #43235c 100%);
  color: #FFFFFF;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;
}

.view-modal-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.view-modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #FFFFFF;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.view-modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.view-modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.view-modal-footer {
  padding: 20px 32px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  background: #F9FAFB;
  border-radius: 0 0 16px 16px;
  flex-shrink: 0;
}

.btn-close-modal {
  background: #6E3894;
  color: #FFFFFF;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.btn-close-modal:hover {
  background: #5C2D7A;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3);
}

/* Info Card */
.info-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.info-card-header {
  background: #FFFFFF;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
}

.info-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.info-card-body {
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1F2937;
  font-weight: 500;
}

.completion-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.completion-display .progress-bar-container {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.completion-display .progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #43235c 0%, #6E3894 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.completion-display .completion-text {
  font-size: 14px;
  font-weight: 600;
  color: #6E3894;
  min-width: 45px;
}

/* Answers Section */
.answers-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #E5E7EB;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  display: flex;
  align-items: center;
}

.answers-count {
  background: #43235c;
  color: #FFFFFF;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-item {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.answer-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #43235c;
}

.answer-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.answer-number {
  background: #43235c;
  color: #FFFFFF;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.answer-question {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
  line-height: 1.5;
}

.answer-response {
  background: #F9FAFB;
  border-left: 3px solid #43235c;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 12px;
}

.answer-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.answer-value {
  font-size: 14px;
  color: #1F2937;
  font-weight: 500;
}

/* Risk Warning */
.risk-warning {
  margin-top: 16px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 8px;
  padding: 16px;
}

.risk-warning-header {
  display: flex;
  align-items: center;
  color: #92400E;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 14px;
}

.risk-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.risk-detail-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.risk-detail-label {
  font-weight: 600;
  color: #92400E;
  min-width: 80px;
}

.risk-detail-value {
  color: #78350F;
}

/* Risks Summary */
.risks-summary {
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.risks-summary-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #991B1B;
}

.risks-summary-content {
  display: flex;
  justify-content: center;
}

.risks-count-badge {
  background: #FFFFFF;
  border: 2px solid #EF4444;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.risks-count-number {
  background: #EF4444;
  color: #FFFFFF;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.risks-count-label {
  font-size: 14px;
  font-weight: 500;
  color: #991B1B;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6B7280;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.btn-group .btn {
  margin-right: 2px;
}
</style>
