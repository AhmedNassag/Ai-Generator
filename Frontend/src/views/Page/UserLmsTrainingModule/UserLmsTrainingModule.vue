<template>
  <!-- Spinner -->
  <div v-if="isLoading" class="loading-spinner">
    <i class="fa-solid fa-spinner fa-spin"></i>{{ $t("UserLmsTrainingModule.LoadingTrainingModules") }}
  </div>
  
  <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="'Document'" :subPage="'Document mgmt'" :titlePage="'Document mgmt'">
    <template #datatable>
      <div id="main-div" style="display: flex; margin-top: 30px">
    <div class="container mt-4">
      <!-- Course Accordion -->
      <div class="course-accordion">
        <div v-for="(course, courseIndex) in groupedCourses" :key="courseIndex" class="course-item">
          <!-- Course Header -->
          <div class="course-header" @click="toggleCourse(courseIndex)">
            <div class="course-info">
              <h3>{{ course.name }}</h3>
              <small>{{ stripHtmlTags(course.description) }}</small>
            </div>
            <i class="fa chevron-icon" :class="expandedCourses[courseIndex]
              ? 'fa-chevron-up'
              : 'fa-chevron-down'
              "></i>
          </div>

          <!-- Course Content (collapsible) -->
          <div v-if="expandedCourses[courseIndex]" class="course-content">
            <!-- Levels Accordion -->
            <div v-for="(level, levelIndex) in course.levels" :key="levelIndex" class="level-item">
              <!-- Level Header -->
              <div class="level-header" @click="toggleLevel(courseIndex, levelIndex)">
                <div class="level-header-content">
                  <i class="fa chevron-icon-level" :class="expandedLevels[`${courseIndex}-${levelIndex}`]
                    ? 'fa-chevron-up'
                    : 'fa-chevron-down'
                    "></i>
                  <h4>
                    {{ level.title }}
                  </h4>
                </div>
                <span class="level-badge">{{ $t("UserLmsTrainingModule.level") }} {{ level.order }}</span>
              </div>

              <!-- Level Content (collapsible) -->
              <div v-if="expandedLevels[`${courseIndex}-${levelIndex}`]" class="level-content">
                <div class="row">
                  <!-- Modules Grid -->
                  <div v-for="(module, moduleIndex) in level.modules" :key="moduleIndex" class="col-md-6 col-lg-4 mb-4">
                    <!-- Redesigned module card to match image -->
                    <div class="training-module-card">
                      <!-- Cover Image with Badge Overlay -->
                      <div class="module-cover-wrapper">
                        <img class="module-cover-image" :src="module.cover" alt="Module Cover" />
                        <div class="module-badge-overlay">
                          <span v-if="module.type.mandatory == 'true'" class="module-badge badge-mandatory">
                            {{ $t("UserLmsTrainingModule.mandatory") }}
                          </span>
                          <span v-else-if="module.type.optional == 'true' && module.type.campaign == 'false'" class="module-badge badge-optional">
                            {{ $t("UserLmsTrainingModule.optional") }}
                          </span>
                          <span v-else-if="module.type.campaign == 'true'" class="module-badge badge-campaign">
                            {{ $t("UserLmsTrainingModule.campaign") }}
                          </span>
                        </div>
                      </div>

                      <!-- Card Content -->
                      <div class="module-card-content">
                        <!-- Module Title -->
                        <h3 class="module-title">{{ module.name }}</h3>

                        <!-- Module Info Grid -->
                        <div class="module-info-grid">
                          <div class="info-item">
                            <i class="fa fa-layer-group"></i>
                            <span>{{ $t("UserLmsTrainingModule.level") }}: {{ module.level_order }}</span>
                          </div>
                          <div class="info-item">
                            <i class="fa fa-book"></i>
                            <span>{{ $t("UserLmsTrainingModule.course") }}: {{ module.course_name }}</span>
                          </div>
                          <div class="info-item">
                            <i class="fa fa-question-circle"></i>
                            <span>{{ $t("UserLmsTrainingModule.questions") }}: {{ module.questions ? module.questions.filter((q) => q !== null && q !== undefined).length : 0 }}</span>
                          </div>
                          <div class="info-item">
                            <i class="fa fa-comment"></i>
                            <span>{{ $t("UserLmsTrainingModule.statements") }}: {{ module.statements ? module.statements.filter((q) => q !== null && q !== undefined).length : 0 }}</span>
                          </div>
                        </div>

                        <!-- Last Update Date -->
                        <div class="module-footer-date">
                          <small>{{ $t("UserLmsTrainingModule.lastupdateddate") }}: {{ formatDate(module.updated_at) }}</small>
                        </div>

                        <!-- Action Buttons -->
                        <div class="module-actions">
                          <!-- If survey exists but not completed -->
                          <button
                            v-if="!hasCompletedSurvey(module) && module.survey && module.status"
                            @click="startSurvey(module)"
                            class="btn-module-action btn-primary-action"
                          >
                            {{ module.status == 'Failed' ? 'Complete Survey to Re-enter' : $t("physicalcourse.start_survey") }}
                          </button>

                          <!-- Start Module Button -->
                          <button
                            v-else-if="canEnterExam(module)"
                            @click="startModule(module)"
                            :disabled="!canStartModule(module)"
                            :title="!canStartModule(module) ? 'Complete lower level modules first' : ''"
                            class="btn-module-action btn-primary-action"
                          >
                            {{ $t("UserLmsTrainingModule.start") }}
                          </button>

                          <!-- Status Display -->
                          <div v-else-if="hasCompletedSurvey(module) && module.status" class="module-status-badge" :class="{'status-passed': module.status === 'Passed', 'status-failed': module.status === 'Failed'}">
                            {{ module.status }}
                          </div>

                          <!-- Grade not evaluated -->
                          <div v-else class="module-status-pending">
                            <i class="fas fa-clock"></i>
                            <span>{{ $t("physicalcourse.grade_not_evaluated_yet") }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    </template>
  </main-page>
  
  <!-- Course Screen Modal -->
  <div v-if="isModuleScreenModalOpen" class="course-screen-modal-overlay">
    <div class="course-screen-modal-content">
      <!-- Modal Header -->
      <div class="course-screen-modal-header">
        <h5>{{ selectedModule.name }}</h5>
        <!-- <div>
          <p class="course-info">
            <span
              ><i class="fa fa-play-circle"></i>
              {{ selectedModule.course_name }}</span
            >
            <span
              ><i class="fa fa-list ml-3"></i>
              {{ selectedModule.level_name }} (Level
              {{ selectedModule.level_order }})</span
            >
          </p>
        </div> -->
        <!-- <div class="progress-wrapper">
          <div class="progress-text">Progress: {{ currentProgress }}%</div>
          <div class="progress">
            <div
              class="progress-bar"
              :style="{ width: currentProgress + '%' }"
              :class="{ 'progress-success': currentProgress >= 70 }"
            ></div>
          </div>
        </div> -->
        <!-- <button @click="promptCloseConfirmation" class="btn-close">×</button> -->
      </div>

      <!-- Modal Body -->
      <div class="course-screen-modal-body">
        <!-- Navigation Breadcrumbs -->
        <div class="wizard-navigation">
          <div v-for="(item, index) in contentItems" :key="index" :class="[
            'wizard-step',
            { active: currentItemIndex === index },
            { completed: index < currentItemIndex },
          ]" @click="navigateToItem(index)">
            <div class="step-indicator">
              <i v-if="index < currentItemIndex" class="fa fa-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-type">
              {{
                item.type === "question"
                  ? this.$t("UserLmsTrainingModule.question")
                  : this.$t("UserLmsTrainingModule.content")
              }}
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
          <!-- Question Display -->
          <div v-if="currentItem && currentItem.type === 'question'" class="question-container">
            <div class="question-header">
              <span class="question-type-badge">
                {{
                  currentItem.question_type === "true_or_false"
                    ? "True/False"
                    : "Multiple Choice"
                }}
              </span>
              <span class="question-number">{{ $t("UserLmsTrainingModule.question") }}
                {{ currentQuestionNumber }}
                {{ $t("UserLmsTrainingModule.of") }} {{ totalQuestions }}</span>
            </div>

            <h3 class="question-text">{{ currentItem.question_en }}</h3>

            <!-- <div v-if="isAnswerSubmitted" class="description" :class="{
              'correct-description': isAnswerCorrect,
              'incorrect-description': !isAnswerCorrect,
            }" v-html="currentItem.description_en"></div> -->

            <!-- True/False Question -->
            <div
              v-if="currentItem.question_type === 'true_or_false'"
              class="answer-options true-false"
            >
              <label class="option-label">
                <input
                  type="radio"
                  value="true"
                  v-model="selectedAnswer"
                  :disabled="isAnswerSubmitted"
                  @change="handleAnswerSelection"
                />
                <span class="option-text">{{
                  $t("UserLmsTrainingModule.true")
                }}</span>
              </label>

              <label class="option-label" :class="{
                'correct-answer':
                  isAnswerSubmitted && currentItem.correct_answer === 'false',
                'incorrect-answer':
                  isAnswerSubmitted &&
                  selectedAnswer === 'false' &&
                  !isAnswerCorrect,
                disabled: isAnswerSubmitted,
              }">
                <input type="radio" value="false" v-model="selectedAnswer" :disabled="isAnswerSubmitted"
                  @change="handleAnswerSelection" />
                <span class="option-text">{{
                  $t("UserLmsTrainingModule.false")
                }}</span>
                <!-- <span v-if="
                  isAnswerSubmitted && currentItem.correct_answer === 'false'
                " class="correct-indicator">
                  <i class="fa fa-check-circle"></i>
                </span> -->
              </label>
            </div>

            <!-- Multiple Choice Question -->
            <div v-else-if="currentItem.question_type === 'multi_choice'" class="answer-options multi-choice">
              <label v-for="(option, index) in currentItem.options" :key="index" class="option-label" :class="{
                'correct-answer':
                  isAnswerSubmitted && option.is_correct === 'true',
                'incorrect-answer':
                  isAnswerSubmitted &&
                  selectedAnswer === index.toString() &&
                  !isAnswerCorrect,
                disabled: isAnswerSubmitted,
              }">
                <input type="radio" :value="index.toString()" v-model="selectedAnswer" :disabled="isAnswerSubmitted"
                  @change="handleAnswerSelection" />
                <span class="option-text">{{ option.option_en }}</span>
                <!-- <span v-if="isAnswerSubmitted && option.is_correct === 'true'" class="correct-indicator">
                  <i class="fa fa-check-circle"></i>
                </span> -->
              </label>
            </div>

            <!-- Feedback Area -->
            <!-- <div
              v-if="isAnswerSubmitted"
              class="feedback-area"
              :class="{ correct: isAnswerCorrect, incorrect: !isAnswerCorrect }"
            >
              <div v-if="isAnswerCorrect" class="feedback-message correct">
                <i class="fa fa-check-circle"></i> Correct!
              </div>
              <div v-else class="feedback-message incorrect">
                <i class="fa fa-times-circle"></i> Incorrect. The correct answer
                is:
                <span v-if="currentItem.question_type === 'true_or_false'">
                  {{ currentItem.correct_answer === "true" ? "True" : "False" }}
                </span>
                <span v-else-if="currentItem.question_type === 'multi_choice'">
                  {{
                    currentItem.options
                      ? currentItem.options.find(
                          (option) => option.is_correct === "true"
                        )?.option_en || "No correct answer found"
                      : "No options available"
                  }}
                </span>
              </div>
            </div> -->
          </div>

          <!-- Statement/Content Display -->
          <div v-else-if="currentItem && currentItem.type === 'statement'" class="statement-container">
            <div class="statement-header">
              <span class="statement-type-badge">{{
                $t("UserLmsTrainingModule.learningcontent")
              }}</span>
              <span class="statement-number">{{ $t("UserLmsTrainingModule.content") }}
                {{ currentStatementNumber }}
                {{ $t("UserLmsTrainingModule.of") }} {{ totalStatements }}</span>
            </div>

            <h3>{{ currentItem.statement_en }}</h3>

            <div class="statement-content" v-html="currentItem.content_en"></div>

            <!-- Media Content -->
            <div v-if="currentItem.additional_content_type === 'Embedded Image'" class="media-container">
              <img :src="currentItem.file_en" alt="Statement Image" class="statement-media"
                @click="openMediaFullscreen(currentItem.file_en, 'image')" />
              <div class="media-caption">
                <i class="fa fa-search-plus"></i>
                {{ $t("UserLmsTrainingModule.clicktoenlarge") }}
              </div>
            </div>

            <div v-else-if="
              currentItem.additional_content_type === 'Embedded Video'
            " class="media-container">
              <video :src="currentItem.file_en" controls class="statement-media"></video>
            </div>

            <div v-else-if="currentItem.additional_content_type === 'Embedded PDF'" class="media-container">
              <iframe :src="currentItem.file_en" class="statement-media"
                style="width: 100%; height: 500px; border: none" title="Statement PDF"></iframe>
              <div class="media-caption">
                <i class="fa fa-file-pdf"></i>
                {{ $t("UserLmsTrainingModule.pdfdocument") }}
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="navigation-buttons">
          <!-- <button
            @click="previousItem"
            class="btn btn-secondary"
            :disabled="currentItemIndex === 0"
          >
            <i class="fa fa-arrow-left"></i> Previous
          </button> -->

          <button v-if="
            currentItem &&
            currentItem.type === 'question' &&
            !isAnswerSubmitted
          " @click="submitAnswer" class="btn btn-primary" :disabled="!selectedAnswer">
            {{ $t("UserLmsTrainingModule.submitanswer") }}
          </button>

          <button v-if="!isLastItem" @click="nextItem" class="btn btn-primary">
            {{ $t("UserLmsTrainingModule.next") }}
            <i class="fa fa-arrow-right"></i>
          </button>

          <button v-if="
            isLastItem &&
            (!currentItem ||
              (currentItem.type === 'question' && isAnswerSubmitted) ||
              currentItem.type === 'statement')
          " @click="finishCourse" class="btn btn-primary">
            {{ $t("UserLmsTrainingModule.finish") }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Fullscreen Media Modal -->
  <div v-if="isMediaModalOpen" class="media-modal-overlay" @click="closeMediaModal">
    <div class="media-modal-content" @click.stop>
      <button @click="closeMediaModal" class="btn-close-media">×</button>
      <img v-if="mediaType === 'image'" :src="mediaUrl" alt="Full size image" class="fullscreen-media" />
      <video v-else-if="mediaType === 'video'" :src="mediaUrl" controls autoplay class="fullscreen-media"></video>
    </div>
  </div>

  <!-- Course Completion Modal -->
  <div v-if="isCompletionModalOpen" class="completion-modal-overlay">
    <div class="completion-modal-content">
      <div class="completion-body">
        <!-- For modules with valid questions -->
        <div v-if="hasValidQuestions" class="score-display">
          <div class="score-circle" :class="{
            'high-score': scorePercentage >= 80,
            'medium-score': scorePercentage >= 60 && scorePercentage < 80,
            'low-score': scorePercentage < 60,
          }">
            <span class="score-value">{{ scorePercentage }}%</span>
          </div>
          <div class="score-details">
            <p>
              {{ $t("UserLmsTrainingModule.yourscored") }} {{ score }}
              {{ $t("UserLmsTrainingModule.outof") }}
              {{ totalQuestions }}
            </p>
            <p>
              {{ $t("UserLmsTrainingModule.passingscore") }} :
              {{
                Math.round(
                  (selectedModule.passing_score / 100) * totalQuestions
                )
              }}
              ({{ selectedModule.passing_score }}%)
            </p>
          </div>
        </div>

        <!-- Completion message -->
        <div class="completion-message">
          <p v-if="hasValidQuestions && isPassed">
            {{ $t("UserLmsTrainingModule.youhavesuccessfullycompletedthe") }}
            "{{ selectedModule.name }}"
            {{ $t("UserLmsTrainingModule.module") }}!
          </p>
          <p v-else-if="hasValidQuestions && !isPassed">
            {{
              $t(
                "UserLmsTrainingModule.you_didn't_reach_the_passing_score_for_this_module."
              )
            }}
          </p>
          <p v-else>
            {{ $t("UserLmsTrainingModule.youhavesuccessfullycompletedthe") }}
            "{{ selectedModule.name }}"
            {{ $t("UserLmsTrainingModule.module") }}!
          </p>
        </div>

        <!-- Answer summary for modules with valid questions -->
        <div v-if="hasValidQuestions" class="answer-summary">
          <h4>{{ $t("UserLmsTrainingModule.questionsummary") }}</h4>
          <div class="summary-stats">
            <div class="stat-item correct">
              <i class="fa fa-check-circle"></i>
              <span class="stat-value">{{ correctAnswers }}</span>
              <span class="stat-label">{{
                $t("UserLmsTrainingModule.correct")
              }}</span>
            </div>
            <div class="stat-item incorrect">
              <i class="fa fa-times-circle"></i>
              <span class="stat-value">{{ incorrectAnswers }}</span>
              <span class="stat-label">{{
                $t("UserLmsTrainingModule.incorrect")
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="completion-footer">
        <button @click="closeCompletionModal" class="btn btn-primary">
          {{ $t("UserLmsTrainingModule.return_to_training_modules") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import course from "@/API/Course/Course";
import UserLmsTrainingModule from "@/API/UserLmsTrainingModule/UserLmsTrainingModule";
import LmsUserAnswer from "@/API/LmsUserAnswer/LmsUserAnswer";
import module from "@/API/LmsModule/LmsModule";
import level from "@/API/LmsLevel/LmsLevel";
import controlApi from "@/API/Control/Control";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import VueSelect from "vue-select";
import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
import Auth from "@/API/Auth";
import axios from "axios";
export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    ckeditor: Ckeditor,
    "vue-select": VueSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new course();
    const UserLmsTrainingModuleApi = new UserLmsTrainingModule();
    const LmsUserAnswerApi = new LmsUserAnswer();
    const levelApi = new level();
    const moduleApi = new module();
    const control = new controlApi();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      UserLmsTrainingModuleApi,
      LmsUserAnswerApi,
      levelApi,
      control,
      moduleApi,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  async mounted() {
    const allModules = await this.api.getAll({
      filterOr: `department_ids|${Auth.USER.department_ids}||team_ids|${Auth.USER.team_ids}||user_ids|${Auth.USER.id}`,
      with: "levels.modules.survey.surveyResponses",
    });
    console.log(
      "****************************************88 All Modules Loaded **"
    );
    console.log(allModules);
    await this.fetchModules();
    this.restoreProgress(); // Restore progress on mount
    window.addEventListener("keydown", this.handleKeydown);
    window.addEventListener("beforeunload", this.saveProgress);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeydown);
  },
  data() {
    return {
      currentAnswerID: null,
      expandedCourses: {}, // Track which courses are expanded
      expandedLevels: {}, // Track which levels are expanded
      // Modal visibility states
      isModuleScreenModalOpen: false,
      isMediaModalOpen: false,
      isCompletionModalOpen: false,

      // Current module and navigation
      selectedModule: null,
      currentItemIndex: 0,
      contentItems: [],

      // Question/Statement tracking
      questionMap: {}, // Maps content index to question index
      statementMap: {}, // Maps content index to statement index

      // User response tracking
      selectedAnswer: null,
      isAnswerSubmitted: false,
      isAnswerCorrect: false,
      score: 0,
      userAnswers: [],

      // Media modal properties
      mediaUrl: "",
      mediaType: "",

      // Time tracking
      startTime: null,
      endTime: null,
      timeSpent: 0,
      isModuleScreenModalOpen: false, // Controls the visibility of the course screen modal
      selectedModule: null, // The currently selected module
      currentQuestionIndex: 0,
      currentStatementIndex: 0,
      selectedAnswer: null,
      isAnswerSelected: false,
      score: 0,
      expandedLevel: null, // Add this line
      selectedLevel: null, // Add this line
      isNewModalOpen: false, // Controls the visibility of the new modal
      trainingFormData: {
        name: "",
        passing_score: "",
        order: "",
        completionTime: "",
      },
      isModalOpen: false,
      isManageModalOpen: false,
      isLevelModalOpen: false,
      selectedModule: {
        name: "",
        description: "",
        image: "",
        // status: null, // Ensure this is reactive
      },
      courseLevels: [],
      levelForm: {
        title: "",
        order: "",
      },
      editingLevel: null,
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {
        control_ids: "",
      }, // Data object to store the currently selected item for editing or new item

      questions: [], // Array to store questions
      statements: [], // Array to store statements

      formData: {
        name: "",
        description: "",
      },
      isLoading: false,
      moduleList: [],

      // CKEditor setup
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      icon_path: null,
      translateFields: [],
      fields: [],
      exceptionData: [],
      show: false,
      id: Number,
      controlList: [],
      survey: null,
    };
  },

  created() { },

  computed: {
    groupedCourses() {
      return this.groupModulesByCourse();
    },
    hasValidQuestions() {
      return (
        this.selectedModule?.questions?.length > 0 &&
        !this.selectedModule.questions.every(
          (q) => q === null || q === undefined
        )
      );
    },

    // Get current item (question or statement)
    currentItem() {
      return this.contentItems[this.currentItemIndex] || null;
    },

    // Check if current item is the last one
    isLastItem() {
      return this.currentItemIndex === this.contentItems.length - 1;
    },

    // Calculate current progress percentage
    currentProgress() {
      if (!this.contentItems.length) return 0;
      return Math.round(
        ((this.currentItemIndex + 1) / this.contentItems.length) * 100
      );
    },

    // Get current question number relative to all questions
    currentQuestionNumber() {
      if (!this.currentItem || this.currentItem.type !== "question") return 0;
      return Object.values(this.questionMap).filter(
        (i) => i <= this.currentItemIndex
      ).length;
    },

    // Get current statement number relative to all statements
    currentStatementNumber() {
      if (!this.currentItem || this.currentItem.type !== "statement") return 0;
      return Object.values(this.statementMap).filter(
        (i) => i <= this.currentItemIndex
      ).length;
    },

    // Total questions count
    totalQuestions() {
      return this.selectedModule?.questions?.length || 0;
    },

    // Total statements count
    totalStatements() {
      return this.selectedModule?.statements?.length || 0;
    },

    // Calculate score percentage
    scorePercentage() {
      if (!this.totalQuestions) return 0;
      return Math.round((this.score / this.totalQuestions) * 100);
    },

    // Check if user passed the module
    isPassed() {
      return this.scorePercentage >= this.selectedModule?.passing_score;
    },

    // Count of correct answers
    correctAnswers() {
      return this.score;
    },

    // Count of incorrect answers
    incorrectAnswers() {
      return this.totalQuestions - this.score;
    },
  },
  methods: {
    toggleCourse(courseIndex) {
      console.log("Invalid indices:", courseIndex);
      const isExpanding = !this.expandedCourses[courseIndex];
      this.expandedCourses[courseIndex] = isExpanding;

      // If expanding the course, automatically expand the first level (level 0)
      if (isExpanding) {
        this.$nextTick(() => {
          const firstLevelKey = `${courseIndex}-0`;
          this.expandedLevels[firstLevelKey] = true;
        });
      }
    },

    hasCompletedSurvey(module) {
      if (!module?.survey?.survey_responses || !Auth.USER.id) return false;
      const userResponse = module.survey.survey_responses.find(
        (response) =>
          response.user_id === Auth.USER.id &&
          response.respondent_id === module.id &&
          response.respondent_type === "training_module"
      );
      return userResponse && userResponse.is_completed === true;
    },

    canEnterExam(module) {
      console.log("Checking canEnterExam for module:", module);
      return (
        !module.status ||
        (module.status === "Failed" &&
          module.answer_results[0]?.count_of_entering_exam <
            module.count_of_entering_exam)
      );
    },

    startSurvey(module) {
      this.$router.push({
        name: "UserPhysicalCourseSurveyShow",
        params: {
          surveyId: module.survey.id,
        },
        query: {
          type: "training_module",
          id: module.id,
        },
      });
    },

    toggleLevel(courseIndex, levelIndex) {
      const key = `${courseIndex}-${levelIndex}`;
      this.expandedLevels[key] = !this.expandedLevels[key];
    },

    // Group modules by course and level
    groupModulesByCourse() {
      const courses = {};

      this.moduleList.forEach((module) => {
        if (!module.course_id || !module.level_id) {
          console.warn("Skipping module with missing IDs:", module);
          return;
        }

        if (!courses[module.course_id]) {
          courses[module.course_id] = {
            id: module.course_id,
            name: module.course_name || "Unknown Course",
            description: module.course_description || "No Description",
            levels: {},
          };
        }

        if (!courses[module.course_id].levels[module.level_id]) {
          courses[module.course_id].levels[module.level_id] = {
            id: module.level_id,
            title: module.level_name || "Unknown Level",
            order: module.level_order || 0,
            modules: [],
          };
        }

        courses[module.course_id].levels[module.level_id].modules.push(module);
      });

      const groupedCourses = Object.values(courses).map((course) => ({
        ...course,
        levels: Object.values(course.levels)
          .map((level) => ({
            ...level,
            // Sort modules by their order
            modules: level.modules.sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            ),
          }))
          .sort((a, b) => a.order - b.order),
      }));

      console.log("Grouped Courses:", JSON.stringify(groupedCourses, null, 2));
      return groupedCourses;
    },

    // Save progress to localStorage
    saveProgress() {
      if (this.isModuleScreenModalOpen && this.selectedModule) {
        const progress = {
          moduleId: this.selectedModule.id,
          currentItemIndex: this.currentItemIndex,
          userAnswers: this.userAnswers,
          score: this.score,
          startTime: this.startTime ? this.startTime.toISOString() : null,
        };
        localStorage.setItem(
          `moduleProgress_${this.selectedModule.id}`,
          JSON.stringify(progress)
        );
      }
    },

    // Restore progress from localStorage
    async restoreProgress() {
      const moduleIds = this.moduleList.map((m) => m.id);
      for (const moduleId of moduleIds) {
        const progress = localStorage.getItem(`moduleProgress_${moduleId}`);
        if (progress) {
          const parsedProgress = JSON.parse(progress);
          const module = this.moduleList.find(
            (m) => m.id === parsedProgress.moduleId
          );
          if (module && module.questions?.length > 0) {
            // Restore state
            this.selectedModule = module;
            this.isModuleScreenModalOpen = true;
            this.prepareContentItems();
            this.currentItemIndex = parsedProgress.currentItemIndex;
            this.userAnswers =
              parsedProgress.userAnswers ||
              Array(this.totalQuestions).fill(null);
            this.score = parsedProgress.score || 0;
            this.startTime = parsedProgress.startTime
              ? new Date(parsedProgress.startTime)
              : new Date();

            // Calculate and submit results
            // await this.submitOnRefresh();
            localStorage.removeItem(`moduleProgress_${moduleId}`); // Clear progress after submission
          }
        }
      }
    },

    // Submit answers and calculate results on page refresh
    async submitOnRefresh() {
      if (!this.hasValidQuestions) {
        this.showCompletionResults();
        return;
      }

      // Calculate score based on saved answers
      this.score = 0;
      this.userAnswers.forEach((answer, index) => {
        if (answer && answer.isCorrect) {
          this.score++;
        }
      });

      // Show completion results
      this.showCompletionResults();
    },
    nextQuestion() {
      console.log("Selected Answer:", this.selectedAnswer);
      if (this.selectedAnswer === this.currentQuestion.correctAnswer) {
        this.score++;
      }
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      this.isAnswerSelected = false;
    },
    nextStatement() {
      this.currentStatementIndex++;
    },
    finishCourse() {
      const unansweredCount = this.contentItems.filter(
        (item) =>
          item.type === "question" &&
          this.userAnswers[item.originalIndex] === null
      ).length;

      if (unansweredCount > 0) {
        Swal.fire({
          title: "Unanswered Questions",
          text: `You have ${unansweredCount} unanswered question(s). Are you sure you want to finish the module?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Finish Anyway",
          cancelButtonText: "No, I'll Answer Them",
        }).then((result) => {
          if (result.isConfirmed) {
            this.showCompletionResults();
            this.closeCompletionModal();
            localStorage.removeItem(`moduleProgress_${this.selectedModule.id}`);
          }
        });
      } else {
        console.log("showCompletionResults function will lood ");
        this.showCompletionResults();
        this.closeCompletionModal();
        localStorage.removeItem(`moduleProgress_${this.selectedModule.id}`);
        if (this.hasCompletedSurvey(this.selectedModule)) return;
        this.startSurvey(this.selectedModule);
      }
    },

    // Show completion results
    async showCompletionResults() {
      this.endTime = new Date();
      this.timeSpent = Math.floor((this.endTime - this.startTime) / 1000); // Time in seconds
      console.log("showCompletionResults function looded ");
      // Record module completion status
      const completionStatus = this.isPassed ? "Passed" : "Failed";
      console.log("completionStatus " + completionStatus);
      if (completionStatus == "Passed") {
        await axios.post("user-certificate", {
          module_id: this.selectedModule.id,
          user_id: Auth.USER.id,
        });
      }

      // Save the result to the API
      this.saveModuleResult(completionStatus);

      // Show completion modal
      // this.isCompletionModalOpen = true;
    },
    // Initialize the course wizard with module data
    startModule(module) {
      this.currentAnswerID = module.answer_results[0]?.id || null;
      const canStart = this.canStartModule(module);
      if (!canStart) {
        Swal.fire({
          title: "Prerequisite Required",
          text: "You must complete all modules in lower levels before starting this module.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      Swal.fire({
        title: this.$t("UserLmsTrainingModule.confirmation"),
        text: this.$t("UserLmsTrainingModule.start_module_confirmation"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: this.$t("UserLmsTrainingModule.start"),
        cancelButtonText: this.$t("UserLmsTrainingModule.cancel"),
      }).then((result) => {
        if (result.isConfirmed) {
          this.selectedModule = module;
          this.isModuleScreenModalOpen = true;
          this.startTime = new Date();
          this.prepareContentItems();
          this.resetUserProgress();

          // Load previous answers from answer_results if available
          if (module.answer_results && module.answer_results[0]?.answers) {
            const previousAnswers = module.answer_results[0].answers;
            this.userAnswers = Array(this.totalQuestions).fill(null);
            previousAnswers.forEach((answer) => {
              const questionIndex = this.contentItems.findIndex(
                (item) =>
                  item.type === "question" && item.id === answer.question_id
              );
              if (questionIndex !== -1) {
                this.userAnswers[questionIndex] = {
                  userAnswer: answer.user_answer,
                  isCorrect: answer.is_correct === "true",
                };
              }
            });

            // Set the initial selected answer for the first question
            if (
              this.currentItem &&
              this.currentItem.type === "question" &&
              this.userAnswers[this.currentItem.originalIndex]
            ) {
              this.selectedAnswer =
                this.userAnswers[this.currentItem.originalIndex].userAnswer;
              this.isAnswerSubmitted = false; // Ensure inputs are not disabled
            }
          }

          localStorage.removeItem(`moduleProgress_${module.id}`); // Clear any previous progress
          this.saveProgress(); // Save initial progress
        }
      });
    },

    canStartModule(module) {
      // Find all modules in the same course
      const courseModules = this.moduleList.filter(
        (m) => m.course_id === module.course_id
      );

      // Find all levels in the same course, sorted by order
      const levelsInCourse = [
        ...new Set(courseModules.map((m) => m.level_order)),
      ].sort((a, b) => a - b);

      // Find the current module's level order
      const currentLevelOrder = module.level_order;

      // Find all previous levels' orders
      const previousLevels = levelsInCourse.filter(
        (order) => order < currentLevelOrder
      );

      // For each previous level, check if all its modules are completed
      for (const levelOrder of previousLevels) {
        const modulesInLevel = courseModules.filter(
          (m) => m.level_order === levelOrder
        );
        const allCompleted = modulesInLevel.every(
          (m) => m.status === "Passed" || m.status === "Failed"
        );
        if (!allCompleted) {
          return false; // Can't start if any previous level is incomplete
        }
      }

      // Now, check modules in the same level with lower order
      const modulesInSameLevelWithLowerOrder = courseModules.filter(
        (m) =>
          m.level_order === currentLevelOrder &&
          (m.order || 0) < (module.order || 0)
      );
      const allLowerOrderCompleted = modulesInSameLevelWithLowerOrder.every(
        (m) => m.status === "Passed" || m.status === "Failed"
      );
      if (!allLowerOrderCompleted) {
        return false; // Can't start if any lower order module in the same level is incomplete
      }

      // If all checks pass, allow starting this module
      return true;
    },
    // Combine questions and statements into sequential content items
    prepareContentItems() {
      this.contentItems = [];
      this.questionMap = {};
      this.statementMap = {};

      // Process questions

      if (
        this.selectedModule.questions &&
        this.selectedModule.questions.length
      ) {
        this.selectedModule.questions.forEach((question, qIndex) => {
          if (question) {
            const index = this.contentItems.length;
            this.contentItems.push({
              ...question,
              type: "question",
              originalIndex: qIndex,
            });
            this.questionMap[qIndex] = index;
          }
        });
      }

      // Process statements
      if (
        this.selectedModule.statements &&
        this.selectedModule.statements.length
      ) {
        this.selectedModule.statements.forEach((statement, sIndex) => {
          if (statement) {
            const index = this.contentItems.length;
            this.contentItems.push({
              ...statement,
              type: "statement",
              originalIndex: sIndex,
            });
            this.statementMap[sIndex] = index;
          }
        });
      }
    },

    // Reset user progress variables
    resetUserProgress() {
      this.currentItemIndex = 0;
      this.selectedAnswer = null;
      this.isAnswerSubmitted = false;
      this.isAnswerCorrect = false;
      this.score = 0;
      this.userAnswers = Array(this.totalQuestions).fill(null);
    },

    // Handle answer selection
    handleAnswerSelection() {
      // Just updates the selected answer, doesn't submit yet
      this.isAnswerSubmitted = false;
    },

    // Navigate to a specific item (from the progress bar)
    navigateToItem(index) {
      if (index <= this.currentItemIndex) {
        if (
          this.currentItem &&
          this.currentItem.type === "question" &&
          !this.isAnswerSubmitted &&
          this.selectedAnswer
        ) {
          Swal.fire({
            title: "Submit Answer?",
            text: "You haven't submitted your answer yet. Would you like to submit it before moving on?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Submit Answer",
            cancelButtonText: "Skip",
          }).then((result) => {
            if (result.isConfirmed) {
              this.submitAnswer();
              this.currentItemIndex = index;
            } else {
              this.currentItemIndex = index;
              this.restoreQuestionState();
            }
          });
        } else {
          this.currentItemIndex = index;
          this.restoreQuestionState();
        }
        this.saveProgress(); // Save progress after navigation
      }
    },

    restoreQuestionState() {
      if (this.currentItem && this.currentItem.type === "question") {
        const questionIndex = this.currentItem.originalIndex;
        const previousAnswer = this.userAnswers[questionIndex];

        if (previousAnswer) {
          this.selectedAnswer = previousAnswer.userAnswer;
          this.isAnswerSubmitted = false; // Ensure inputs are not disabled
          this.isAnswerCorrect = previousAnswer.isCorrect;
        } else {
          this.selectedAnswer = null;
          this.isAnswerSubmitted = false;
        }
      } else {
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
      }
    },

    // Open media in fullscreen modal
    openMediaFullscreen(url, type) {
      this.mediaUrl = url;
      this.mediaType = type;
      this.isMediaModalOpen = true;
    },

    // Close media modal
    closeMediaModal() {
      this.isMediaModalOpen = false;
      this.mediaUrl = "";
      this.mediaType = "";
    },

    // Show completion results
    // async showCompletionResults() {
    //   this.endTime = new Date();
    //   this.timeSpent = Math.floor((this.endTime - this.startTime) / 1000); // Time in seconds

    //   // Record module completion status
    //   const completionStatus = this.isPassed ? "Passed" : "Failed";
    //   if(completionStatus == "Passed" ){
    //         await axios.post('user-certificate', {
    //           module_id: this.selectedModule.id,
    //           user_id: Auth.USER.id
    //         });
    //     }
    //   // Save the result to the API
    //   this.saveModuleResult(completionStatus);

    //   // Show completion modal
    //   this.isCompletionModalOpen = true;
    // },

    // Save module result to the API
    async saveModuleResult(status) {
      console.log("Scoreeeeeee", this.score);
      try {
        if (
          this.selectedModule.questions.every(
            (q) => q === null || q === undefined
          )
        ) {

          notify({
            title: "Success",
            text: "Your module has been completed successfully!",
            type: "success",
          });
          const result = {
            module_id: this.selectedModule.id,
            course_id: this.selectedModule.course_id, // Added course_id
            user_id: Auth.USER.id, // Get user ID from your auth store
            status: "Passed",
            score: 100,
            time_spent: this.timeSpent,
            completed_at: new Date().toISOString(),
            passed: "true",
          };

          await this.LmsUserAnswerApi.from(result);
          this.selectedModule.status = result.status;
          if (this.selectedModule.status == "Passed") {
            await axios.post("user-certificate", {
              module_id: this.selectedModule.id,
              user_id: Auth.USER.id,
            });
          }
          return;
        }

        // Format user answers for storage
        const formattedAnswers = this.contentItems
          .filter((item) => item.type === "question")
          .map((question) => {
            const questionIndex = question.originalIndex;
            const userAnswer = this.userAnswers[questionIndex];

            let selectedOptionText = "";
            if (question.question_type === "multi_choice" && userAnswer) {
              const selectedOptionIndex = parseInt(userAnswer.userAnswer);
              selectedOptionText =
                question.options[selectedOptionIndex]?.option_en || "";
            }

            return {
              question_id: question.id || question._id,
              question_text: question.question_en,
              question_type: question.question_type,
              user_answer: userAnswer ? userAnswer.userAnswer : null,
              selected_option_text: selectedOptionText,
              is_correct: userAnswer ? userAnswer.isCorrect : false,
              answered: userAnswer !== null,
            };
          });
        // Create a result object

        if (!this.currentAnswerID) {
          console.log(
            "No currentAnswerID, creating new result",
            this.currentAnswerID
          );
          const result = {
            module_id: this.selectedModule.id,
            course_id: this.selectedModule.course_id, // Added course_id
            user_id: Auth.USER.id, // Get user ID from your auth store
            status: status,
            score: this.scorePercentage,
            time_spent: this.timeSpent,
            completed_at: new Date().toISOString(),
            passed: this.isPassed,
            answers: formattedAnswers,
            count_of_entering_exam: this.isLastItem
              ? (this.selectedModule.answers?.count_of_entering_exam || 0) + 1
              : null,
          };
          const moduleResultResponse = await this.LmsUserAnswerApi.from(result);
          this.selectedModule.status = result.status;
          this.currentAnswerID = moduleResultResponse[1].data.id; // Store the returned ID
        } else {
          console.log("Using existing currentAnswerID:", this.currentAnswerID);
          const result = {
            id: this.currentAnswerID,
            module_id: this.selectedModule.id,
            course_id: this.selectedModule.course_id, // Added course_id
            user_id: Auth.USER.id, // Get user ID from your auth store
            status: status,
            score: this.scorePercentage,
            time_spent: this.timeSpent,
            completed_at: new Date().toISOString(),
            passed: this.isPassed,
            answers: formattedAnswers,
            count_of_entering_exam: this.isLastItem
              ? (this.selectedModule.answers?.count_of_entering_exam || 0) + 1
              : this.selectedModule.answers?.count_of_entering_exam || 0,
          };
          const moduleResultResponse = await this.LmsUserAnswerApi.from(result);
          this.selectedModule.status = result.status;
        }

        // Show success notification
        notify({
          title: "Success",
          text: "Your training results have been saved successfully!",
          type: "success",
        });
      } catch (error) {
        console.error("Error saving module results:", error);
        notify({
          title: "Error",
          text: "There was a problem saving your results. Please try again.",
          type: "error",
        });
      }
    },

    // Close completion modal and return to course list
    closeCompletionModal() {
      this.isCompletionModalOpen = false;
      this.isModuleScreenModalOpen = false;
      this.resetUserProgress();
      this.fetchModules(); // Refresh module list to update statuses
      localStorage.removeItem(`moduleProgress_${this.selectedModule.id}`);
    },

    // Prompt for confirmation before closing the module
    promptCloseConfirmation() {
      Swal.fire({
        title: "Exit Module?",
        text: "Your progress will be lost if you exit now. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Exit",
        cancelButtonText: "No, Stay",
      }).then((result) => {
        if (result.isConfirmed) {
          this.closeCourseScreenModal();
        }
      });
    },

    // Close course screen modal
    closeCourseScreenModal() {
      this.isModuleScreenModalOpen = false;
      this.resetUserProgress();
      localStorage.removeItem(`moduleProgress_${this.selectedModule.id}`);
    },

    submitAnswer() {
      if (this.selectedAnswer !== null) {
        this.isAnswerSubmitted = true;

        if (this.currentItem.question_type === "true_or_false") {
          this.isAnswerCorrect =
            this.selectedAnswer === this.currentItem.correct_answer;
        } else if (this.currentItem.question_type === "multi_choice") {
          this.isAnswerCorrect =
            this.currentItem.options[parseInt(this.selectedAnswer)]
              .is_correct === "true";
        }

        if (this.isAnswerCorrect) {
          this.score++;
        }

        this.userAnswers[this.currentItem.originalIndex] = {
          userAnswer: this.selectedAnswer,
          isCorrect: this.isAnswerCorrect,
        };

        this.saveProgress(); // Save progress after submitting an answer
        this.showCompletionResults();
      }
    },

    // Handle keyboard navigation
    handleKeydown(event) {
      if (!this.isModuleScreenModalOpen) return;

      switch (event.key) {
        case "ArrowRight":
          if (
            this.currentItem &&
            this.currentItem.type === "question" &&
            !this.isAnswerSubmitted
          ) {
            if (this.selectedAnswer) this.submitAnswer();
          } else {
            this.nextItem();
          }
          break;
        case "ArrowLeft":
          this.previousItem();
          break;
        case "Escape":
          event.preventDefault();
          this.promptCloseConfirmation();
          break;
        // For true/false questions
        case "t":
        case "T":
          if (
            this.currentItem &&
            this.currentItem.type === "question" &&
            this.currentItem.question_type === "true_or_false" &&
            !this.isAnswerSubmitted
          ) {
            this.selectedAnswer = "true";
          }
          break;
        case "f":
        case "F":
          if (
            this.currentItem &&
            this.currentItem.type === "question" &&
            this.currentItem.question_type === "true_or_false" &&
            !this.isAnswerSubmitted
          ) {
            this.selectedAnswer = "false";
          }
          break;
        // For multiple choice questions (1-9)
        default:
          if (/^[1-9]$/.test(event.key)) {
            const optionIndex = parseInt(event.key) - 1;
            if (
              this.currentItem &&
              this.currentItem.type === "question" &&
              this.currentItem.question_type === "multi_choice" &&
              !this.isAnswerSubmitted &&
              this.currentItem.options &&
              optionIndex < this.currentItem.options.length
            ) {
              this.selectedAnswer = optionIndex.toString();
            }
          }
          break;
      }
    },

    previousItem() {
      if (this.currentItemIndex > 0) {
        this.currentItemIndex--;
        this.restoreQuestionState(); // Reset question state if needed
      }
    },

    restoreQuestionState() {
      const currentAnswer = this.userAnswers[this.currentItem.originalIndex];
      if (currentAnswer) {
        // Restore the saved answer state
        this.selectedAnswer = currentAnswer.userAnswer;
        this.isAnswerSubmitted = true;
        this.isAnswerCorrect = currentAnswer.isCorrect;
      } else {
        // Reset state if no answer exists
        this.selectedAnswer = null;
        this.isAnswerSubmitted = false;
        this.isAnswerCorrect = false;
      }
    },

    nextItem() {
      if (this.currentItemIndex < this.contentItems.length - 1) {
        this.currentItemIndex++;
        this.restoreQuestionState();
        this.saveProgress(); // Save progress after navigation
      }
    },

    // Modified previousItem
    previousItem() {
      if (this.currentItemIndex > 0) {
        this.currentItemIndex--;
        this.saveProgress(); // Save progress after navigation
      }
    },

    resetQuestionState() {
      this.selectedAnswer = null; // Clear the selected answer
      this.isAnswerSubmitted = false; // Reset the submission state
      this.isAnswerCorrect = false; // Reset the correctness state
    },

    resetModuleScreen() {
      this.currentQuestionIndex = 0;
      this.currentStatementIndex = 0;
      this.selectedAnswer = null;
      this.isAnswerSelected = false;
      this.score = 0;
    },

    formatDate(dateString) {
      if (!dateString) return "N/A"; // Handle empty values
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16).replace("T", " ");
    },

    getCountOFEnteringExams(module) {
      return module.answer_results?.[0]?.count_of_entering_exam || 0;
    },

    getScoreOfExams(module) {
      return module.answer_results?.[0]?.score || 0;
    },

    getRemaianingAttemptsForExam(module) {
      const maxAttempts = module.count_of_entering_exam || 0;
      const usedAttempts = this.getCountOFEnteringExams(module);
      return Math.max(0, maxAttempts - usedAttempts);
    },

    handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault(); // Prevent closing the modal
      }
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    async fetchModules() {
      this.isLoading = true;
      try {
        const userId = Auth.USER.id;
        const departmentId = Auth.USER?.department_id;
        const teamIds = Auth.USER?.team_ids || [];
        const joiningDate = Auth.USER.department_joining_date?.split("T")[0];

        // Fetch all courses with their levels and modules
        const courses = await this.api.getAll({
          // filterOr: `department_ids|${Auth.USER.department_ids}||team_ids|${Auth.USER.team_ids}||user_ids|${Auth.USER.id}||courseType.optional|true`,
          with: [
            "levels.modules.survey.surveyResponses",
            "levels.modules.answerResults",
          ],
        });

        // Fetch module results for tracking status
        const moduleResults = await this.LmsUserAnswerApi.getAll({
          filter: `user_id|${userId}`,
        });

        // Create a Map for module status lookup
        const moduleStatusMap = new Map(
          moduleResults.map((result) => [result.module_id, result.status])
        );

        // Process modules from courses directly
        const processedModules = [];

        for (const course of courses) {
          const courseDepartmentIds = course.department_ids || [];
          const courseTeamIds = course.team_ids || [];
          const courseUserIds = course.user_ids || [];

          const isCourseAssignedToUser =
            (courseUserIds.includes(userId) && courseUserIds[0] !== null) ||
            courseDepartmentIds.includes(departmentId) ||
            teamIds.some((teamId) => teamId && courseTeamIds.includes(teamId));

          const isCourseMandatory = course.courseType?.mandatory === "true";
          const isCourseOptional = course.courseType?.optional === "true";

          if (course.levels?.length) {
            for (const level of course.levels) {
              const isLevelMandatory = level.levelType?.mandatory === "true";
              const isLevelOptional = level.levelType?.optional === "true";

              // Check if level has any meaningful type set (not all false)
              const hasLevelType =
                isLevelMandatory ||
                isLevelOptional ||
                level.levelType?.campaign === "true";

              const isLevelAssignedToUser =
                (level.user_ids?.includes(userId) &&
                  level.user_ids[0] !== null) ||
                level.department_ids?.includes(departmentId) ||
                teamIds.some(
                  (teamId) => teamId && level.team_ids?.includes(teamId)
                );

              // Apply level assignment logic:
              // - If level has meaningful type, use level logic
              // - If level has no meaningful type, fall back to course logic
              let shouldIncludeLevel = false;

              if (hasLevelType) {
                // Use level type logic
                shouldIncludeLevel =
                  isLevelOptional ||
                  (isLevelMandatory && isLevelAssignedToUser);
              } else {
                // Fall back to course type logic
                shouldIncludeLevel =
                  isCourseOptional ||
                  (isCourseMandatory && isCourseAssignedToUser);
              }

              if (!shouldIncludeLevel) {
                console.log(
                  `Skipping Level ID: ${level.id}, Title: ${level.title} (Not meeting assignment criteria)`
                );
                continue;
              }

              // Process modules from the level
              if (level.modules?.length) {
                for (const module of level.modules) {
                  let moduleType = {
                    mandatory: "false",
                    optional: "false",
                    campaign: "false",
                  };

                  // Determine module type: prioritize levelType if it has meaningful values, otherwise use courseType
                  if (hasLevelType) {
                    moduleType = { ...level.levelType };
                  } else if (isCourseMandatory) {
                    moduleType.mandatory = "true";
                  } else if (isCourseOptional) {
                    moduleType.optional = "true";
                  } else if (typeof course.courseType === "string") {
                    if (course.courseType === "mandatory") {
                      moduleType.mandatory = "true";
                    } else if (course.courseType === "optional") {
                      moduleType.optional = "true";
                    } else if (course.courseType === "campaign") {
                      moduleType.campaign = "true";
                    }
                  } else if (course.courseType) {
                    moduleType = { ...course.courseType };
                  }

                  const daysToComplete =
                    course.days_to_complete || level.days_to_complete || 0;
                  const startDate = new Date(joiningDate);
                  const dueDate = new Date(
                    startDate.setDate(startDate.getDate() + daysToComplete)
                  )
                    .toISOString()
                    .split("T")[0];

                  processedModules.push({
                    ...module,
                    course_id: course.id,
                    level_id: level.id,
                    course_name: course.name || "Unknown Course",
                    course_description: course.description || "Unknown Course",
                    complete_days: daysToComplete,
                    type: moduleType,
                    order: module.order || 0,
                    level_name: level.title || "No Level",
                    level_order: level.order || 0,
                    questions: module.questions || [],
                    statements: module.statements || [],
                    cover: module.coverImage || null,
                    status: moduleStatusMap.get(module.id) || null,
                    due_date: dueDate,
                    is_overdue: new Date() > new Date(dueDate),
                    answers:
                      moduleResults.filter(
                        (result) => result.module_id === module.id
                      )[0] || null,
                  });
                }
              }
            }
          }
        }

        // Update module list
        this.moduleList = processedModules;

        console.log("Module List:", JSON.stringify(this.moduleList, null, 2));
        this.moduleList.sort((a, b) => a.level_order - b.level_order);
      } catch (error) {
        console.error("Error fetching modules:", error);
        notify({
          title: "Error",
          text: `Failed to load training modules: ${error.message}.`,
          type: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 1.5rem;
  color: #333;
}

.loading-spinner i {
  margin-right: 10px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  margin-top: 20px;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  float: inline-end;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  /* Bootstrap modal z-index */
}

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  /* Rounded corners */
  width: 90%;
  max-width: 750px;
  /* Responsive max width */
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
  /* Larger header font */
}

.btn-close {
  font-size: 15px;
  border: none;
  color: #000;
}

.modal-body {
  padding: 20px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.ck-editor__editable {
  min-height: 200px !important;
}

select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

/* CKEditor minimum height */
.ck-editor__editable {
  min-height: 200px !important;
}

.manage-modal {
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
}

.levels-list {
  max-height: 500px;
  overflow-y: auto;
}

/* Add these to your existing styles */
.modal-overlay {
  z-index: 1060;
}

.modal-content .modal-content {
  z-index: 1070;
}

.body {
  display: flow-root;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-60%);
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Dropdown menu styling */
.dropdown-menu {
  border: none;
  padding: 8px 0;
}

.dropdown-item {
  transition: all 0.3s ease;
  color: #333;
  font-weight: 500;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #000;
  transform: translateX(1px);
}

/* Hover effect for dropdown toggle */
.dropdown-toggle:hover {
  opacity: 0.2;
}

input::placeholder {
  color: #bbb;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

@keyframes beat {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.beating-button {
  animation: beat 2s infinite;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  overflow: auto;
  /* Allow scrolling */
  overflow-x: hidden;
}

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  width: 90%;
  max-width: 1500px;
  max-height: 90vh;
  /* Limit height */
  overflow-y: auto;
  /* Enable scrolling */
  overflow-x: hidden;
}

.modal-body {
  max-height: 90vh;
  /* Adjust as needed */
  overflow-y: auto;
  /* Enable scrolling */
  overflow-x: hidden;
}

.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 3.2em;
}

.course-screen-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.course-screen-modal-body {
  padding: 20px 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.question-container,
.statement-container {
  margin-bottom: 20px;
}

.question-container h3,
.statement-container h3 {
  margin-bottom: 15px;
}

.question-container label,
.statement-container label {
  margin-left: 10px;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  display: none;
}

.course-screen-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.course-screen-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1350px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.course-screen-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.course-screen-modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.course-info {
  margin-top: 5px;
  color: #6c757d;
  font-size: 0.9rem;
}

.course-info span {
  margin-right: 15px;
}

.progress-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px;
}

.progress-text {
  font-size: 0.6rem;
  margin-bottom: 5px;
  color: #495057;
}

.progress {
  width: 100%;
  height: 10px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4c6ef5;
  transition: width 0.3s ease;
}

.progress-success {
  background-color: #20c997;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #343a40;
}

.course-screen-modal-body {
  padding: 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Wizard Navigation */
.wizard-navigation {
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 20px;
  gap: 8px;
}

.wizard-step {
  display: flex;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  min-width: 80px;
}

.wizard-step.active {
  background-color: #4c6ef5;
  color: white;
}

.wizard-step.completed {
  background-color: #20c997;
  color: white;
}

.wizard-step:hover:not(.active):not(.completed) {
  background-color: #e9ecef;
}

.step-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: white;
  color: #4c6ef5;
  margin-bottom: 5px;
}

.wizard-step.active .step-indicator {
  background-color: white;
  color: #4c6ef5;
}

.wizard-step.completed .step-indicator {
  background-color: white;
  color: #20c997;
}

.step-type {
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 500;
  color: inherit;
}

/* Content Area */
.content-area {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.question-container,
.statement-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-header,
.statement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-type-badge,
.statement-type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  background-color: #e9ecef;
  color: #495057;
}

.question-number,
.statement-number {
  font-size: 0.9rem;
  color: #6c757d;
}

.question-text {
  font-size: 1.2rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 15px;
}

.description {
  font-size: 0.95rem;
  color: #495057;
  margin-bottom: 20px;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-label {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow-x: clip;
  /* Enable horizontal scrolling */
  white-space: nowrap;
  /* Keep text on a single line */
}

.option-label.selected {
  background-color: #4c6ef5;
  color: white;
}

.option-label.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.option-label.correct {
  background-color: #20c997;
  color: white;
}

.option-text {
  margin-left: 10px;
  font-size: 0.95rem;
}

.correct-indicator {
  margin-left: auto;
  font-size: 1.2rem;
}

.feedback-area {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  font-size: 0.95rem;
}

.feedback-area.correct {
  background-color: #d1fae5;
  color: #065f46;
}

.feedback-area.incorrect {
  background-color: #fee2e2;
  color: #991b1b;
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Media Container */
.media-container {
  margin-top: 20px;
}

.statement-media {
  max-width: 100%;
  border-radius: 8px;
  cursor: pointer;
}

.media-caption {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 5px;
  text-align: center;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
  border: none;
}

.btn-secondary:hover {
  background-color: #dee2e6;
}

.btn-primary {
  background-color: #4c6ef5;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #3b5bdb;
}

.btn-success {
  background-color: #20c997;
  color: white;
  border: none;
}

.btn-success:hover {
  background-color: #1aa179;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Fullscreen Media Modal */
.media-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.media-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.fullscreen-media {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.btn-close-media {
  position: absolute;
  top: -30px;
  right: -30px;
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}

/* Completion Modal */
.completion-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.completion-modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  padding: 30px;
  text-align: center;
}

.score-display {
  margin-bottom: 20px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 1.5rem;
  font-weight: 600;
}

.high-score {
  background-color: #d1fae5;
  color: #065f46;
}

.medium-score {
  background-color: #fff3cd;
  color: #856404;
}

.low-score {
  background-color: #fee2e2;
  color: #991b1b;
}

.score-details {
  font-size: 0.9rem;
  color: #6c757d;
}

.completion-message {
  margin-bottom: 20px;
  font-size: 1rem;
}

.answer-summary {
  margin-bottom: 20px;
}

.summary-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.stat-item.correct {
  color: #20c997;
}

.stat-item.incorrect {
  color: #dc3545;
}

.completion-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.correct-description {
  font-size: 0.9rem;
  /* Smaller font size */
  color: #666;
  /* Dull gray color */
  font-weight: 400;
  /* Normal font weight */
  padding: 8px;
  /* Optional: Add some padding for better readability */
  border-radius: 4px;
  /* Optional: Add rounded corners */
}

.incorrect-description {
  font-size: 0.9rem;
  /* Smaller font size */
  color: #666;
  /* Dull gray color */
  font-weight: 400;
  /* Normal font weight */
  padding: 8px;
  /* Optional: Add some padding for better readability */
  border-radius: 4px;
  /* Optional: Add rounded corners */
}

/*
.correct-answer {
  background-color: #e8f5e9 !important;
  border-color: #4caf50 !important;
}
  */

/* .incorrect-answer {
  background-color: #ffebee !important;
  border-color: #f44336 !important;
} */

.course-accordion {
  margin-bottom: 20px;
}

.course-item {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.level-item {
  margin: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.page-body{
  background-color: white !important;
}

.course-header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s, box-shadow 0.2s;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.course-header:hover {
  background-color: #e9ecef;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.course-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.course-info small {
  color: #6c757d;
  font-size: 13px;
  line-height: 1.4;
}

.chevron-icon {
  color: #495057;
  font-size: 14px;
  transition: transform 0.3s ease;
}

.level-header {
  padding: 12px 20px;
  background-color: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f3f5;
}

.level-header:hover {
  background-color: #f8f9fa;
}

.level-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chevron-icon-level {
  color: #495057;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.level-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
}

.level-badge {
  padding: 4px 12px;
  background-color: #e9ecef;
  color: #495057;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.level-content {
  padding: 20px;
  background-color: #fafbfc;
}

.course-content {
  padding: 0;
  background-color: white;
}

.fa {
  transition: transform 0.2s;
}

@import "vue-multiselect/dist/vue-multiselect.min.css";

/* New Training Module Card Styles */
.training-module-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.training-module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.module-cover-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.module-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.module-badge-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.module-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.badge-mandatory {
  background-color: #ff6b6b;
  color: white;
}

.badge-optional {
  background-color: #51cf66;
  color: white;
}

.badge-campaign {
  background-color: #74c0fc;
  color: white;
}

.module-card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  line-height: 1.4;
  min-height: 50px;
}

.module-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  /* gap: 8px; */
  font-size: 14px;
  color: #495057;
}

.info-item i {
  width: 18px;
  color: #6c757d;
  font-size: 16px;
}

.info-item span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-footer-date {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
  margin-bottom: 16px;
}

.module-footer-date small {
  color: #868e96;
  font-size: 12px;
}

.module-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.btn-module-action {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary-action {
  background-color: #6e3995;
  color: white;
}

.btn-primary-action:hover:not(:disabled) {
  background-color: #6741a0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(121, 80, 180, 0.3);
}

.btn-primary-action:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.module-status-badge {
  flex: 1;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.status-passed {
  background-color: #d3f9d8;
  color: #2b8a3e;
}

.status-failed {
  background-color: #ffe3e3;
  color: #c92a2a;
}

.module-status-pending {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: #fff3bf;
  color: #f08c00;
  border-radius: 6px;
  font-size: 14px;
}

.module-status-pending i {
  font-size: 16px;
}
</style>

<style>
.page-body{
  background-color: white !important;
}
</style>
