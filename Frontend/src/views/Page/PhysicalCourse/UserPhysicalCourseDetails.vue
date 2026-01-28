<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')" :subPage="$t('physicalcourse.requests')"
    :titlePage="$t('physicalcourse.Details')">

    <!-- Slot for rendering the course details -->
    <template #datatable>
      <div v-if="isLoading" class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p class="mt-2">{{ $t('common.loading') }}</p>
      </div>

      <div v-else="courseData">
        <!-- Course Hero Section -->
        <div class="course-hero mb-4">
          <div class="course-hero-content">
            <div class="row align-items-center">
              <div class="col-lg-8">
                <h1 class="display-5 fw-bold mb-3 text-white">{{ courseData.name }}</h1>
                <p class="lead mb-0" v-html="courseData.description"></p>
              </div>
              <div v-if="courseData.cover" class="col-lg-4 text-end">
                <img :src="courseData.coverPicturePath" :alt="$t('physicalcourse.Course Cover')"
                  class="course-cover img-fluid" style="max-height: 200px; width: auto;">
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Left Column -->
          <div class="col-lg-8">
            <!-- Instructors Section -->
            <div class="info-card mb-4">
              <div class="info-card-header">
                <div class="info-card-icon instructors-icon">
                  <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <h3 class="info-card-title">{{ $t('physicalcourse.instructors') }}</h3>
              </div>
              <div class="instructors-list">
                <div v-for="instructor in courseData.instructors" :key="instructor.id" class="instructor-item">
                  <div class="instructor-avatar">
                    {{ instructor.full_name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="fw-medium">{{ instructor.full_name }}</span>
                </div>
              </div>
            </div>

            <!-- Materials Section -->
            <div class="info-card mb-4">
              <div class="info-card-header">
                <div class="info-card-icon materials-icon">
                  <i class="fas fa-book-open"></i>
                </div>
                <h3 class="info-card-title">{{ $t('physicalcourse.course_materials') }}</h3>
              </div>
              <div v-if="courseData.materials && courseData.materials.length" class="materials-list">
                <div v-for="material in courseData.materials" :key="material.id" class="material-item">
                  <a :href="material.materialFilePath" target="_blank" class="material-link">
                    <i class="fas fa-file-pdf material-icon"></i>
                    {{ material.file_name }}
                    <i class="fas fa-external-link-alt ms-auto" style="font-size: 12px;"></i>
                  </a>
                </div>
              </div>
              <div v-else class="no-content">
                <i class="fas fa-folder-open"></i>
                <p class="mb-0">{{ $t('physicalcourse.no_materials_uploaded_yet') }}</p>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-lg-4">
            <!-- Grade Section -->
            <div class="info-card mb-4">
              <div class="info-card-header">
                <div class="info-card-icon grade-icon">
                  <i class="fas fa-trophy"></i>
                </div>
                <h3 class="info-card-title">{{ $t('physicalcourse.your_grade') }}</h3>
              </div>

              <!-- If user has completed survey and has grade -->
              <div v-if="userGrade && hasCompletedSurvey" class="grade-display">
                <div class="grade-score">{{ userGrade.grade }}</div>
                <div class="grade-label">{{ $t('physicalcourse.out_of') }} {{ courseData.grade }}</div>
              </div>

              <!-- If survey exists but not completed -->
              <div v-else-if="!hasCompletedSurvey && survey && courseIsComplete" class="no-content text-center">
                <i class="fas fa-clipboard-question"></i>
                <p class="mb-1">{{ $t('physicalcourse.complete_the_survey_first') }}</p>
                <button @click="startSurvey" class="btn btn-primary btn-sm mt-1">
                  {{ $t('physicalcourse.start_survey') }}
                </button>
              </div>

              <!-- Grade not evaluated -->
              <div v-else class="no-content">
                <i class="fas fa-clock"></i>
                <p class="mb-0">{{ $t('physicalcourse.grade_not_evaluated_yet') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule & Attendance Section -->
        <div class="info-card">
          <div class="info-card-header">
            <div class="info-card-icon schedule-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <h3 class="info-card-title">{{ $t('physicalcourse.attendance_schedule') }}</h3>
          </div>
          <div class="table-responsive">
            <table class="table schedule-table">
              <thead>
                <tr>
                  <th>{{ $t('physicalcourse.session') }}</th>
                  <th>{{ $t('physicalcourse.date') }}</th>
                  <th>{{ $t('physicalcourse.time') }}</th>
                  <th>{{ $t('physicalcourse.attendance') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(session, index) in courseData.schedules" :key="session.id">
                  <td class="fw-bold">{{ $t('physicalcourse.session') }} {{ index + 1 }}</td>
                  <td>{{ formatDate(session.session_date) }}</td>
                  <td>{{ session.session_time }}</td>
                  <td>
                    <span v-if="getAttendanceStatus(session.id) === true" class="attendance-badge badge-attended">
                      <i class="fas fa-check-circle me-1"></i>
                      {{ $t('physicalcourse.present') }}
                    </span>
                    <span v-else-if="getAttendanceStatus(session.id) === false" class="attendance-badge badge-absent">
                      <i class="fas fa-times-circle me-1"></i>
                      {{ $t('physicalcourse.absent') }}
                    </span>
                    <span v-else class="attendance-badge badge-pending">
                      <i class="fas fa-clock me-1"></i>
                      {{ $t('physicalcourse.pending') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import PhysicalCourseRequests from "@/API/PhysicalCourseRequest/PhysicalCourseRequest";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import vSelect from "vue-select";
import PhysicalCourse from "@/API/PhysicalCourse/PhysicalCourse";
import Auth from "@/API/Auth";
import User from "@/API/User/User";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    vSelect,
  },

  setup() {
    const api = new PhysicalCourseRequests();
    const courseApi = new PhysicalCourse();
    const userApi = new User();
    const tableColumns = [];

    return {
      api,
      tableColumns,
      courseApi,
      userApi
    };
  },

  async mounted() {
    await this.loadCourseData();
  },

  computed: {
    hideActions() {
      return (row) => {
        return {
          edit: true,
          delete: true,
        };
      };
    },

    userGrade() {
      if (!this.courseData?.grades || !Auth.USER.id) return null;
      return this.courseData.grades.find(grade => grade.user_id === Auth.USER.id);
    },

    hasCompletedSurvey() {
      if (!this.courseData?.survey?.survey_responses || !Auth.USER.id) return false;
      const userResponse = this.courseData.survey.survey_responses.find(
        response => response.user_id === Auth.USER.id && response.respondent_id === this.courseData.id
      );
      return userResponse && userResponse.is_completed === true;
    },

    courseIsComplete() {
      return this.courseData?.course_complete === true;
    },
  },

  data() {
    return {
      isFlipped: false,
      courseId: null,
      isLoading: false,
      courseData: null,
      attendances: {},
      survey: null,
    };
  },

  created() {
    this.courseId = this.$route.params.courseId;
  },

  methods: {
    // Load course data
    async loadCourseData() {
      try {
        this.isLoading = true;
        const response = await this.courseApi.show(this.courseId, {
          with: ['materials', 'schedules', 'grades', 'attendances', 'survey.surveyResponses']
        });

        this.courseData = response;
        this.courseData.instructors =await  this.userApi.getAll({
          filterIn: `id|${response?.user_ids?.join(",")}`
        });
        this.attendances = response.attendances ? response.attendances.filter(attendance => attendance.user_id === Auth.USER.id) : [];
        this.survey = response.survey;

      } catch (error) {
        console.error('Error loading course data:', error);
        this.$toast.error(this.$t('common.error_loading_data'));
      } finally {
        this.isLoading = false;
      }
    },

   
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },


    getAttendanceStatus(sessionId) {
      const attendance = this.attendances.find(att => att.course_schedule_id === sessionId);
      return attendance ? attendance.attended : null;
    },

    // Start survey
    startSurvey() {
      if (this.survey) {
        this.$router.push({
          name: 'UserPhysicalCourseSurveyShow',
          params: {
            surveyId: this.survey.id
          },
          query: {
            type: 'course',
            id: this.courseData.id
          }
        });
      }
    },
  },

  // Watch for route changes
  watch: {
    '$route.params.courseId': {
      handler(newCourseId) {
        if (newCourseId) {
          this.courseId = newCourseId;
          this.loadCourseData();
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
/* Course Hero Styles */
.course-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 2rem;
  color: white;
}

.course-hero-content h1 {
  font-weight: 700;
  margin-bottom: 1rem;
}

.course-cover {
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Info Card Styles */
.info-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: none;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.info-card-header {
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-card-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.instructors-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.materials-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.grade-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.schedule-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: white;
}

.info-card-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

/* Instructors List */
.instructors-list {
  padding: 1.5rem;
}

.instructor-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.instructor-item:last-child {
  border-bottom: none;
}

.instructor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

/* Materials List */
.materials-list {
  padding: 1.5rem;
}

.material-item {
  margin-bottom: 0.75rem;
}

.material-item:last-child {
  margin-bottom: 0;
}

.material-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #495057;
  transition: all 0.2s;
}

.material-link:hover {
  background: #e9ecef;
  color: #2d3748;
  text-decoration: none;
}

.material-icon {
  color: #dc3545;
  font-size: 1.1rem;
}

/* Grade Display */
.grade-display {
  padding: 2rem 1.5rem;
  text-align: center;
}

.grade-score {
  font-size: 3rem;
  font-weight: bold;
  color: #28a745;
  line-height: 1;
}

.grade-label {
  color: #6c757d;
  margin-top: 0.5rem;
}

/* No Content */
.no-content {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #6c757d;
}

.no-content i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Schedule Table */
.schedule-table {
  margin: 0;
}

.schedule-table th {
  background: #f8f9fa;
  border-color: #e9ecef;
  font-weight: 600;
  color: #495057;
  padding: 1rem;
}

.schedule-table td {
  padding: 1rem;
  vertical-align: middle;
}

/* Attendance Badges */
.attendance-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-attended {
  background: #d4edda;
  color: #155724;
}

.badge-absent {
  background: #f8d7da;
  color: #721c24;
}

.badge-pending {
  background: #fff3cd;
  color: #856404;
}

/* Responsive Design */
@media (max-width: 768px) {
  .course-hero {
    padding: 1.5rem;
  }

  .course-hero h1 {
    font-size: 1.8rem;
  }

  .info-card-header {
    padding: 1rem;
  }

  .instructors-list,
  .materials-list {
    padding: 1rem;
  }

  .grade-display {
    padding: 1.5rem 1rem;
  }

  .grade-score {
    font-size: 2.5rem;
  }
}

/* Loading and other utility styles */
.btn-group .btn {
  margin-right: 0;
}

.btn-group .btn:not(:last-child) {
  border-right: none;
}

.btn-group .btn:not(:first-child) {
  border-left: none;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.text-muted {
  color: #6c757d !important;
}

.text-primary {
  color: #0d6efd !important;
}

.text-success {
  color: #198754 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-info {
  color: #0dcaf0 !important;
}

.badge {
  font-size: 0.8em;
  padding: 0.375rem 0.75rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fa-2x {
  font-size: 2em;
}

.loading {
  opacity: 0.6;
  pointer-events: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>