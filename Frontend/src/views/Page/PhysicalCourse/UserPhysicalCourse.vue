<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')"
    :subPage="$t('physicalcourse.courses')"
    :titlePage="$t('physicalcourse.courses')"
  >
    <!-- <div v-permission:show v-permission:update v-permission:delete></div> -->

    <!-- Slot for rendering the course content -->
    <template #datatable>
      <!-- Hero Section add new comment -->
      <div class="courses-hero fade-in">
        <h1 class="display-4 mb-3">
          🎓 {{ $t("physicalcourses.welcome_learning_platform") }}
        </h1>
        <p class="lead mb-4">
          {{ $t("physicalCourses.discover_courses_description") }}
        </p>
        <div class="row justify-content-center">
          <div class="col-md-3">
            <div class="stats-counter">
              <div class="stats-number">{{ openCourses.length }}</div>
              <div class="stats-label">
                {{ $t("physicalCourses.available_course") }}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stats-counter">
              <div class="stats-number">{{ approvedCourses.length }}</div>
              <div class="stats-label">
                {{ $t("physicalCourses.registered_course") }}
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stats-counter">
              <router-link
                :to="{ name: 'UserPhysicalCourseCertificates' }"
                class="stats-link"
              >
                <div class="stats-number">{{ userCertificates }}</div>
              </router-link>
              <div class="stats-label">
                {{ $t("physicalCourses.user_certificates") }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="courses-container">
        <!-- Open Courses Section -->
        <div class="mb-5">
          <h2 class="section-title">
            📚 {{ $t("physicalcourse.available_courses_for_registration") }}
          </h2>

          <div v-if="openCourses.length > 0" class="row">
            <div
              v-for="course in openCourses"
              :key="course.id"
              class="col-lg-4 col-md-6 mb-4 fade-in"
            >
              <div class="card course-card h-100">
                <!-- Course Cover Image -->
                <img
                  v-if="course.coverPicturePath"
                  :src="course.coverPicturePath"
                  class="course-image"
                  :alt="course.name"
                />
                <div v-else class="course-placeholder">
                  <i class="fas fa-graduation-cap"></i>
                </div>

                <div class="card-body d-flex flex-column">
                  <h5 class="course-title">{{ course.name }}</h5>
                  <p
                    class="course-description flex-grow-1"
                    v-html="course.description"
                  ></p>

                  <!-- Instructors Section -->
                  <div class="instructors-section">
                    <strong class="d-block mb-2">
                      <i class="fas fa-chalkboard-teacher me-2"></i
                      >{{ $t("physicalcourse.instructors") }}:
                    </strong>
                    <span
                      v-for="instructor in course.instructors"
                      :key="instructor.id"
                      class="instructor-tag"
                    >
                      {{ instructor.full_name }}
                    </span>
                  </div>

                  <!-- Schedule Section -->
                  <div
                    v-if="course.schedules && course.schedules.length > 0"
                    class="schedule-list"
                  >
                    <strong class="d-block mb-2">
                      <i class="fas fa-calendar-alt me-2"></i
                      >{{ $t("physicalcourse.schedule") }}:
                    </strong>
                    <div
                      v-for="schedule in course.schedules"
                      :key="schedule.id"
                      class="schedule-item"
                    >
                      <i class="fas fa-clock"></i>
                      <span
                        >{{ schedule.session_date }} -
                        {{ schedule.session_time }}</span
                      >
                    </div>
                  </div>

                  <!-- Registration/Status Button -->
                  <div class="mt-auto">
                    <button
                      v-if="getUserCourseStatus(course.id)"
                      :class="
                        getStatusButtonClass(getUserCourseStatus(course.id))
                      "
                      class="btn w-100"
                      disabled
                    >
                      <i
                        :class="
                          getStatusIconClass(getUserCourseStatus(course.id))
                        "
                      ></i>
                      {{ getStatusText(getUserCourseStatus(course.id)) }}
                    </button>

                    <button
                      v-else
                      @click="registerInCourse(course.id)"
                      class="btn register-btn w-100"
                      :disabled="isRegistering"
                      v-permission:registerInCourse
                    >
                      <i class="fas fa-user-plus me-2"></i>
                      {{
                        isRegistering
                          ? $t("physicalcourse.registering")
                          : $t("physicalcourse.register_in_course")
                      }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Open Courses -->
          <div v-else class="empty-state">
            <i class="fas fa-book-open"></i>
            <h4>{{ $t("physicalcourse.no_courses_available") }}</h4>
            <p>{{ $t("physicalcourse.new_courses_coming_soon") }}</p>
          </div>
        </div>

        <!-- Divider -->
        <hr class="my-5 gradient-divider" />

        <!-- Registered Courses Section -->
        <div class="mb-5">
          <h2 class="section-title">
            🎓 {{ $t("physicalcourse.registered_courses") }}
          </h2>

          <div v-if="approvedCourses.length > 0" class="row">
            <div
              v-for="request in approvedCourses"
              :key="request.id"
              class="col-lg-4 col-md-6 mb-4 fade-in"
            >
              <div class="card registered-card h-100">
                <div class="registered-header">
                  <i class="fas fa-medal me-2"></i
                  >{{ $t("physicalcourse.successfully_registered") }}
                </div>

                <div class="card-body d-flex flex-column">
                  <h5 class="course-title">{{ request.course.name }}</h5>
                  <p
                    class="course-description flex-grow-1"
                    v-html="request.course.description"
                  ></p>

                  <!-- Instructors Section -->
                  <div class="instructors-section">
                    <strong class="d-block mb-2">
                      <i class="fas fa-chalkboard-teacher me-2"></i
                      >{{ $t("physicalcourse.instructors") }}:
                    </strong>
                    <span
                      v-for="instructor in request.course.instructors"
                      :key="instructor.id"
                      class="instructor-tag"
                    >
                      {{ instructor.full_name }}
                    </span>
                  </div>

                  <!-- Schedule Section -->
                  <div
                    v-if="
                      request.course.schedules &&
                      request.course.schedules.length > 0
                    "
                    class="schedule-list"
                  >
                    <strong class="d-block mb-2">
                      <i class="fas fa-calendar-check me-2"></i
                      >{{ $t("physicalcourse.attendance_schedule") }}:
                    </strong>
                    <div
                      v-for="schedule in request.course.schedules"
                      :key="schedule.id"
                      class="schedule-item"
                    >
                      <i class="fas fa-clock"></i>
                      <span
                        >{{ schedule.session_date }} -
                        {{ schedule.session_time }}</span
                      >
                    </div>
                  </div>

                  <!-- View Details Button -->
                  <div class="mt-auto">
                    <button
                      @click="viewCourseDetails(request.course.id)"
                      class="btn view-details-btn w-100"
                    >
                      <i class="fas fa-eye me-2"></i
                      >{{ $t("physicalcourse.view_details") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Registered Courses -->
          <div v-else class="empty-state">
            <i class="fas fa-user-graduate"></i>
            <h4>{{ $t("physicalcourse.not_registered_yet") }}</h4>
            <p>{{ $t("physicalcourse.start_learning_journey") }}</p>
          </div>
        </div>
      </div>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import physicalcourse from "@/API/PhysicalCourse/PhysicalCourse";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import CertifiateTemplete from "@/API/CertifiateTemplete/CertifiateTemplete";
import Survey from "@/API/Survey/Survey";
import vSelect from "vue-select";
import Auth from "@/API/Auth";
import PhysicalCourseRequest from "@/API/PhysicalCourseRequest/PhysicalCourseRequest";
import UserCertificate from "@/API/MyCertificate/MyCertificate";
export default {
  components: {
    MainPage,
    Form,
    DataTable,
    vSelect,
  },

  setup() {
    const api = new physicalcourse();
    const userApi = new User();
    const certificateApi = new CertifiateTemplete();
    const userCertificateApi = new UserCertificate();
    const surveyApi = new Survey();
    const physicaCourseRequestApi = new PhysicalCourseRequest();

    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      certificateApi,
      surveyApi,
      physicaCourseRequestApi,
      userCertificateApi
    };
  },

  async mounted() {
    await this.loadSelectsData();
    await this.loadUserCertificates();
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      isRegistering: false,
      newItem: {
        schedules: [], // Initialize schedules array
      },
      coursesData: [],
      usersData: [],
      certificatesData: [],
      surveysData: [],
      openCourses: [], // Available courses for registration
      userRequests: [], // User's course requests
      userCertificates: 0, // Add user certificates count
    };
  },

  computed: {
    approvedCourses() {
      return this.userRequests.filter(
        (request) => request.status === "approved"
      );
    },
  },

  created() {},

  methods: {
    // async loadSelectsData() {
    //   try {

    //     const coursesResponse = await this.api.getAll({
    //       filter: `open_registration|true -boolean|=`,
    //       with: ['instructors', 'schedules']
    //     });
    //     this.openCourses = coursesResponse;

    //     const userCoursesResponse = await this.physicaCourseRequestApi.getAll({
    //       filter: `user_id|${Auth.USER.id}`,
    //       with: ["course.instructors", "course.schedules"]
    //     })
    //     this.userRequests = userCoursesResponse;
    //   } catch (error) {
    //     console.error(this.$t("user.FailedLoadData"), error);
    //   }
    // },

    async loadSelectsData() {
      try {
        // 1. Get open courses
        const coursesResponse = await this.api.getAll({
          filter: `open_registration|true -boolean|=`,
          with: ["schedules"],
        });

        this.openCourses = coursesResponse;

        // Collect all user_ids from openCourses
        const openCoursesUserIds = [
          ...new Set(this.openCourses.flatMap((c) => c.user_ids || [])),
        ];

        // Fetch instructors once for open courses
        let openCoursesInstructors = [];
        if (openCoursesUserIds.length) {
          openCoursesInstructors = await this.userApi.getAll({
            filterIn: `id|${openCoursesUserIds.join(",")}`,
          });
        }

        // Map instructors to courses
        this.openCourses = this.openCourses.map((course) => ({
          ...course,
          instructors: openCoursesInstructors.filter((inst) =>
            course.user_ids?.includes(inst.id)
          ),
        }));

        // 2. Get user requests
        const userCoursesResponse = await this.physicaCourseRequestApi.getAll({
          filter: `user_id|${Auth.USER.id}`,
          with: ["course", "course.schedules"],
        });

        this.userRequests = userCoursesResponse;

        // Collect all user_ids from requested courses
        const requestUserIds = [
          ...new Set(
            this.userRequests.flatMap((r) => r.course?.user_ids || [])
          ),
        ];

        // Fetch instructors once for user requests
        let requestInstructors = [];
        if (requestUserIds.length) {
          requestInstructors = await this.userApi.getAll({
            filterIn: `id|${requestUserIds.join(",")}`,
          });
        }

        // Map instructors to requested courses
        this.userRequests = this.userRequests.map((request) => ({
          ...request,
          course: request.course
            ? {
                ...request.course,
                instructors: requestInstructors.filter((inst) =>
                  request.course.user_ids?.includes(inst.id)
                ),
              }
            : null,
        }));
      } catch (error) {
        console.error(this.$t("user.FailedLoadData"), error);
      }
    },
    // async loadUserCertificates() {
    //   try {
    //     const certificatesResponse = await this.userApi.show(Auth.USER.id, {
    //       with: ["certificates"],
    //     });
    //     this.userCertificates = certificatesResponse.certificates.length;
    //   } catch (error) {
    //     console.error("Failed to load user certificates", error);
    //     this.userCertificates = 0;
    //   }
    // },
        async loadUserCertificates() {
      try {
        const certificatesResponse = await this.userCertificateApi.getAll({
          filter: `user_id|${Auth.USER.id}`,
        })
        this.userCertificates = certificatesResponse.length;
      } catch (error) {
        console.error("Failed to load user certificates", error);
        this.userCertificates = 0;
      }
    },

    getUserCourseStatus(courseId) {
      const request = this.userRequests.find(
        (req) => req.course_id === courseId
      );
      return request ? request.status : null;
    },

    getStatusButtonClass(status) {
      const baseClass = "status-btn";
      switch (status) {
        case "approved":
          return `${baseClass} btn-success`;
        case "pending":
          return `${baseClass} btn-warning`;
        case "canceled":
          return `${baseClass} btn-danger`;
        default:
          return baseClass;
      }
    },

    getStatusIconClass(status) {
      switch (status) {
        case "approved":
          return "fas fa-check-circle me-2";
        case "pending":
          return "fas fa-clock me-2";
        case "canceled":
          return "fas fa-times-circle me-2";
        default:
          return "";
      }
    },

    getStatusText(status) {
      switch (status) {
        case "approved":
          return this.$t("physicalcourse.approved");
        case "pending":
          return this.$t("physicalcourse.pending");
        case "canceled":
          return this.$t("physicalcourse.rejected");
        default:
          return "";
      }
    },

    async registerInCourse(courseId) {
      try {
        this.isRegistering = true;
        const userId = Auth.USER.id;
        const response = await this.api.registerInCourse(courseId , Auth.USER.id);
        await this.loadSelectsData();
        this.api.poup(
          response,
          this.$t("physicalcourse.registration_successful")
        );
      } catch (error) {
        this.api.poup(
          { status: false, message: error.message },
          this.$t("physicalcourse.registration_failed")
        );
      } finally {
        this.isRegistering = false;
      }
    },

    viewCourseDetails(courseId) {
      this.$router.push({
        name: "UserPhysicalCourseDetails",
        params: { courseId: courseId },
      });
    },
  },
};
</script>

<style scoped>
/* Hero Section Styles */
.courses-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 80px 20px 60px;
  margin-bottom: 40px;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
}

.courses-hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="rgba(255,255,255,0.1)"><polygon points="1000,100 1000,0 0,100"/></svg>')
    no-repeat;
  background-size: cover;
  opacity: 0.3;
}

.courses-hero > * {
  position: relative;
  z-index: 1;
}

.courses-hero h1 {
  color: white !important;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s ease-out;
}

.courses-hero .lead {
  font-size: 1.2rem;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto 2rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.stats-counter {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px 20px;
  margin: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.stats-counter:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 10px;
}

.stats-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stats-link {
  color: inherit;
  text-decoration: none;
}

.stats-link:hover {
  color: inherit;
  text-decoration: none;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Existing styles */
.courses-container {
  padding: 20px 0;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
}

.course-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.course-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.course-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
}

.course-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.course-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.instructors-section {
  margin-bottom: 1.5rem;
}

.instructor-tag {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  margin: 2px;
  font-weight: 500;
}

.schedule-list {
  margin-bottom: 1.5rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item i {
  margin-right: 8px;
  color: #4facfe;
  width: 16px;
}

.register-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.3);
  color: white;
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status-btn {
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
}

.gradient-divider {
  height: 3px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 2px;
}

.registered-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  border-top: 4px solid #28a745;
}

.registered-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.registered-header {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 12px 20px;
  font-weight: 600;
  text-align: center;
}

.view-details-btn {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  margin-bottom: 1rem;
  color: #495057;
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .courses-hero {
    padding: 60px 15px 40px;
  }

  .courses-hero h1 {
    font-size: 2rem;
  }

  .stats-counter {
    margin: 10px 0;
  }

  .stats-number {
    font-size: 2rem;
  }
}

/* Bootstrap utility classes */
.me-2 {
  margin-right: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-5 {
  margin-bottom: 3rem;
}

.mt-auto {
  margin-top: auto;
}

.my-5 {
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.w-100 {
  width: 100%;
}

.h-100 {
  height: 100%;
}

.d-flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-grow-1 {
  flex-grow: 1;
}

.d-block {
  display: block;
}

.justify-content-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

.display-4 {
  font-size: 2.5rem;
  font-weight: 300;
  line-height: 1.2;
}

.lead {
  font-size: 1.25rem;
  font-weight: 300;
}
</style>
