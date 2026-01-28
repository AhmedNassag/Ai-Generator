<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')"
    :subPage="$t('physicalcourse.statistics')"
    :titlePage="$t('physicalcourse.statistics')"
  >
    <!-- Slot for rendering the course details -->
    <template #datatable>
      <div
        v-if="courseData && Object.keys(courseData).length"
        class="course-details"
      >
        <!-- Course Header -->
        <div class="course-header">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 style="color: #fff !important" class="mb-2">
                {{ courseData.name }}
              </h1>
              <p class="mb-0 opacity-75" v-html="courseData.description"></p>
            </div>
            <div class="col-md-4 text-md-end">
              <span
                :class="[
                  'badge',
                  'badge-custom',
                  courseData.open_registration ? 'bg-success' : 'bg-secondary',
                ]"
              >
                <i
                  :class="[
                    'fas',
                    courseData.open_registration ? 'fa-unlock' : 'fa-lock',
                    'me-1',
                  ]"
                ></i>
                {{
                  courseData.open_registration
                    ? $t("physicalcourse.registration_open")
                    : $t("physicalcourse.registration_closed")
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Course Statistics -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon text-primary">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-number">
              {{ approvedRequests ? approvedRequests.length : 0 }}
            </div>
            <div class="stat-label">
              {{ $t("physicalcourse.total_students") }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon text-success">
              <i class="fas fa-chair"></i>
            </div>
            <div class="stat-number">{{ courseData.max_seats }}</div>
            <div class="stat-label">
              {{ $t("physicalcourse.maximum_seats") }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon text-info">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="stat-number">
              {{ courseData.schedules ? courseData.schedules.length : 0 }}
            </div>
            <div class="stat-label">{{ $t("physicalcourse.sessions") }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon text-warning">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-number">{{ courseData.grade }}</div>
            <div class="stat-label">{{ $t("physicalcourse.full_grade") }}</div>
          </div>
        </div>

        <!-- Course Information -->
        <div class="course-info-card">
          <h3 class="section-title">
            <i class="fas fa-info-circle me-2"></i>
            {{ $t("physicalcourse.course_information") }}
          </h3>
          <div class="row">
            <div class="col-md-6">
              <p>
                <strong>
                  <i class="fas fa-layer-group me-2 text-primary"></i>
                  {{ $t("physicalcourse.full_grade") }}:
                </strong>
                {{ courseData.grade }}
              </p>
              <p>
                <strong>
                  <i class="fas fa-users me-2 text-success"></i>
                  {{ $t("physicalcourse.maximum_seats") }}:
                </strong>
                {{ courseData.max_seats }}
              </p>
            </div>
            <div class="col-md-6">
              <p>
                <strong>
                  <i class="fas fa-chalkboard-teacher me-2 text-info"></i>
                  {{ $t("physicalcourse.teachers") }}:
                </strong>
                {{ getInstructorNames() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Sessions Section -->
        <div class="sessions-list">
          <h3 class="section-title">
            <i class="fas fa-calendar-alt me-2"></i>
            {{ $t("physicalcourse.course_sessions") }}
          </h3>
          <div v-if="courseData.schedules && courseData.schedules.length">
            <div
              v-for="schedule in courseData.schedules"
              :key="schedule.id"
              class="session-item"
            >
              <div class="session-info">
                <h5 class="mb-1">
                  <i class="fas fa-clock me-2 text-primary"></i>
                  {{ schedule.session_date }} {{ $t("physicalcourse.at_time") }}
                  {{ schedule.session_time }}
                </h5>
              </div>
              <div class="session-stats">
                <div class="session-stat attended">
                  <i class="fas fa-check me-1"></i>
                  {{ $t("physicalcourse.attended") }}:
                  {{ getAttendedCount(schedule) }}
                </div>
                <div class="session-stat absent">
                  <i class="fas fa-times me-1"></i>
                  {{ $t("physicalcourse.was_absent") }}:
                  {{ getAbsentCount(schedule) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <p>{{ $t("physicalcourse.no_sessions_scheduled") }}</p>
          </div>
        </div>

        <!-- Students Table -->
        <div class="students-table">
          <h3 class="section-title">
            <i class="fas fa-user-graduate me-2"></i>
            {{ $t("Students List") }}
          </h3>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>
                    <i class="fas fa-user me-2"></i
                    >{{ $t("physicalcourse.Name") }}
                  </th>
                  <th>
                    <i class="fas fa-envelope me-2"></i
                    >{{ $t("physicalcourse.Email") }}
                  </th>
                  <th>
                    <i class="fas fa-flag me-2"></i
                    >{{ $t("physicalcourse.Status") }}
                  </th>
                  <th>
                    <i class="fas fa-percentage me-2"></i
                    >{{ $t("physicalcourse.Attendance Rate") }}
                  </th>
                  <th>
                    <i class="fas fa-award me-2"></i
                    >{{ $t("physicalcourse.Grade") }}
                  </th>
                  <th>
                    <i class="fas fa-trophy me-2"></i
                    >{{ $t("physicalcourse.Result") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in approvedRequests" :key="request.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <div
                        class="avatar bg-primary text-white rounded-circle me-2"
                        style="
                          width: 40px;
                          height: 40px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        "
                      >
                        {{ getInitial(getUserFullName(request.user_id)) }}
                      </div>
                      {{ getUserFullName(request.user_id) }}
                    </div>
                  </td>
                  <td>{{ getUserEmail(request.user_id) }}</td>
                  <td>
                    <span :class="['badge', getStatusClass(request.status)]">
                      {{ $t("physicalcourse." + request.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="progress-bar-custom me-2" style="width: 60px">
                        <div
                          class="progress-fill"
                          :style="{
                            width: getAttendancePercent(request.user_id) + '%',
                          }"
                        ></div>
                      </div>
                      <span
                        :class="[
                          'text-' +
                            getAttendanceColorClass(
                              getAttendancePercent(request.user_id)
                            ),
                        ]"
                      >
                        {{ getAttendancePercent(request.user_id) }}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong
                      :class="[
                        'text-' +
                          (getStudentGrade(request.user_id) >= courseData.grade
                            ? 'success'
                            : 'danger'),
                      ]"
                    >
                      {{ getStudentGrade(request.user_id) }}/{{
                        courseData.grade
                      }}
                    </strong>
                  </td>
                  <td>
                    <span
                      :class="[
                        'badge',
                        getStudentGrade(request.user_id) >=
                        courseData.passing_grade
                          ? 'bg-success'
                          : 'bg-danger',
                      ]"
                    >
                      <i
                        :class="[
                          'fas',
                          getStudentGrade(request.user_id) >=
                          courseData.passing_grade
                            ? 'fa-check'
                            : 'fa-times',
                          'me-1',
                        ]"
                      ></i>
                      {{
                        getStudentGrade(request.user_id) >=
                        courseData.passing_grade
                          ? $t("Passed")
                          : $t("Failed")
                      }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Materials Section -->
        <div class="materials-section">
          <h3 class="section-title">
            <i class="fas fa-folder-open me-2"></i>
            {{ $t("physicalcourse.Course Materials") }}
          </h3>
          <div
            v-if="courseData.materials && courseData.materials.length"
            class="row"
          >
            <div
              v-for="material in courseData.materials"
              :key="material.id"
              class="col-md-6 col-lg-4 mb-3"
            >
              <a
                target="_blank"
                :href="material.materialFilePath"
                class="material-item"
              >
                <i class="fas fa-file-alt material-icon"></i>
                <div>
                  <h6 class="mb-0">{{ material.file_name }}</h6>
                  <small class="text-muted">{{
                    $t("physicalcourse.Click to view")
                  }}</small>
                </div>
              </a>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>{{ $t("physicalcourse.No materials uploaded yet") }}</p>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else class="text-center p-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">{{ $t("Loading course data...") }}</p>
      </div>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import physicalcourse from "@/API/PhysicalCourse/PhysicalCourse";
import MainPage from "@/components/MainPage.vue";
import User from "@/API/User/User";
import { get } from "lodash";
import PhysicalCourseRequests from "@/API/PhysicalCourseRequest/PhysicalCourseRequest";

export default {
  name: "CourseDetail",
  components: {
    MainPage,
  },

  setup() {
    const api = new physicalcourse();
    const requestsApi = new PhysicalCourseRequests();
    const userApi = new User();
    const apiParams = {
      with: [
        "schedules.attendances",
        "materials",
        "grades",
        "requests",
      ],
    };

    return {
      api,
      apiParams,
      userApi,
      requestsApi,
    };
  },

  async mounted() {
    this.users = await this.userApi.getAll({
      select: "id|full_name|type|email",
    });
    this.allRequests = await this.requestsApi.getAll();
    await this.loadCourseData();
  },

  data() {
    return {
      courseData: {},
      isFlipped: false,
      approvedRequests: [],
      allRequests: [],
      users: [],
    };
  },

  methods: {
    getUserFullName(userId) {
      const user = this.users.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },
    getUserEmail(userId) {
      const user = this.users.find((user) => user.id === userId);
      return user ? user.email : "";
    },
    getUserIdForSpecificRequest(requestId) {
      const request = this.allRequests.find(
        (request) => request.id === requestId
      );
      return request ? request.user_id : "";
    },
    // Load course data
    async loadCourseData() {
      try {
        const courseResponse = await this.api.show(
          this.$route.params.courseId,
          this.apiParams
        );

        this.courseData = courseResponse;
        this.courseData.instructors = this.users.filter((user) =>
          courseResponse.user_ids.includes(user?.id)
        );
        this.approvedRequests = courseResponse.requests.filter(
          (request) => request.status === "approved"
        );
      } catch (error) {
        console.error(this.$t("user.FailedLoadData"), error);
      }
    },

    // Get instructor names as comma-separated string
    getInstructorNames() {
      if (!this.courseData.instructors) return "";
      return this.courseData.instructors
        .map((instructor) => instructor.full_name)
        .join(", ");
    },

    // Get first letter of name for avatar
    getInitial(name) {
      return name ? name.charAt(0).toUpperCase() : "";
    },

    // Get status class for badges
    getStatusClass(status) {
      const classes = {
        approved: "bg-success",
        pending: "bg-warning",
        rejected: "bg-danger",
      };
      return classes[status] || "bg-secondary";
    },

    // Get attended count for a schedule
    getAttendedCount(schedule) {
      if (!schedule.attendances) return 0;
      return schedule.attendances.filter(
        (attendance) => attendance.attended === true
      ).length;
    },

    // Get absent count for a schedule
    getAbsentCount(schedule) {
      const totalStudents = this.approvedRequests
        ? this.approvedRequests.length
        : 0;
      const attendedCount = this.getAttendedCount(schedule);
      return totalStudents - attendedCount;
    },

    // Calculate attendance percentage for a user
    getAttendancePercent(userId) {
      if (!this.courseData.schedules || !this.courseData.schedules.length)
        return 0;

      const totalSessions = this.courseData.schedules.length;
      const attendedSessions = this.courseData.schedules.filter((schedule) => {
        if (!schedule.attendances) return false;
        return schedule.attendances.some(
          (attendance) =>
            attendance.user_id === userId && attendance.attended === true
        );
      }).length;

      return totalSessions > 0
        ? Math.round((attendedSessions / totalSessions) * 100)
        : 0;
    },

    // Get color class based on attendance percentage
    getAttendanceColorClass(percentage) {
      if (percentage >= 75) return "success";
      if (percentage >= 50) return "warning";
      return "danger";
    },

    // Get student grade
    getStudentGrade(userId) {
      if (!this.courseData.grades) return 0;
      const gradeRecord = this.courseData.grades.find(
        (grade) => grade.user_id === userId
      );
      return gradeRecord ? gradeRecord.grade : 0;
    },
  },
};
</script>

<style scoped>
.course-details {
  padding: 20px;
}

.course-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
}

.badge-custom {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  margin-top: 5px;
}

.course-info-card,
.sessions-list,
.students-table,
.materials-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.session-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-stats {
  display: flex;
  gap: 20px;
}

.session-stat {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.session-stat.attended {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.session-stat.absent {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.table {
  margin-bottom: 0;
}

.avatar {
  font-weight: bold;
  font-size: 1.1rem;
}

.progress-bar-custom {
  background: #e9ecef;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #28a745, #20c997);
  height: 100%;
  transition: width 0.3s ease;
}

.material-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.material-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  color: inherit;
}

.material-icon {
  font-size: 2rem;
  color: #6c757d;
  margin-right: 15px;
}

@media (max-width: 768px) {
  .course-header .row {
    text-align: center;
  }

  .session-item {
    flex-direction: column;
    gap: 15px;
  }

  .session-stats {
    justify-content: center;
  }
}
</style>
