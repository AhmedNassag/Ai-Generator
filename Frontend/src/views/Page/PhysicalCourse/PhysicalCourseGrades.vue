<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')"
    :subPage="$t('physicalcourse.grades')"
    :titlePage="$t('physicalcourse.grades')"
  >
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div v-if="isLoading" class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p class="mt-2">{{ $t("common.loading") }}</p>
      </div>

      <!-- Grades Section -->
      <div v-else-if="courseData" class="container-fluid">
        <!-- Header Section -->
        <div class="grades-header">
          <h1>
            <i class="fas fa-graduation-cap me-3"></i
            >{{ $t("physicalcourse.grades") }}
          </h1>
          <div class="course-info">
            <div><i class="fas fa-book"></i> {{ courseData.name }}</div>
            <div>
              <i class="fas fa-star"></i> {{ $t("physicalcourse.max_grade") }}:
              {{ courseData.grade }}
            </div>
            <div>
              <i class="fas fa-users"></i>
              {{ $t("physicalcourse.total_students") }}:
              {{ approvedUsers.length }}
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-number">{{ approvedUsers.length }}</div>
            <div class="stat-label">{{ $t("physicalcourse.registered") }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-number">{{ courseData.grade }}</div>
            <div class="stat-label">{{ $t("physicalcourse.max_grade") }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-number">{{ gradesEntered }}</div>
            <div class="stat-label">
              {{ $t("physicalcourse.grades") }}
              {{ $t("physicalcourse.entered") }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-number">{{ completionRate }}%</div>
            <div class="stat-label">
              {{ $t("physicalcourse.completion_rate") }}
            </div>
          </div>
        </div>

        <!-- Success Alert -->
        <div v-if="successMessage" class="alert success-alert">
          <i class="fas fa-check-circle me-2"></i>
          {{ successMessage }}
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="alert error-alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ errorMessage }}
        </div>

        <!-- Grades Form -->
        <div class="grades-card">
          <form @submit.prevent="saveGrades">
            <table class="table grades-table">
              <thead>
                <tr>
                  <th style="width: 80px"><i class="fas fa-hashtag"></i> #</th>
                  <th>
                    <i class="fas fa-user"></i>
                    {{ $t("physicalcourse.student") }}
                  </th>
                  <th style="width: 200px">
                    <i class="fas fa-star"></i>
                    {{ $t("physicalcourse.grades") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, index) in approvedUsers" :key="user?.id">
                  <td>
                    <div class="row-number">{{ index + 1 }}</div>
                  </td>
                  <td>
                    <div class="student-info">
                      <div class="student-avatar">
                        {{ getInitials(user?.full_name) }}
                      </div>
                      <div class="student-name">{{ user?.full_name }}</div>
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      v-model="gradesData[user?.id]"
                      class="form-control grade-input"
                      :min="0"
                      :max="courseData.grade"
                      :placeholder="`0 - ${courseData.grade}`"
                      step="0.1"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="form-actions">
              <button
                type="submit"
                class="btn save-btn"
                :disabled="isSaving"
                v-permission:storeGrade
              >
                <i
                  class="fas fa-save me-2"
                  :class="{ 'fa-spin': isSaving }"
                ></i>
                {{
                  isSaving
                    ? $t("common.saving")
                    : $t("physicalcourse.save_grades")
                }}
              </button>
            </div>
          </form>
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
import PhysicalCourseRequest from "@/API/PhysicalCourseRequest/PhysicalCourseRequest";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    vSelect,
  },

  props: {
    courseId: {
      type: [String, Number],
      required: true,
    },
  },

  setup() {
    const api = new physicalcourse();
    const physicalCourseRequestApi = new PhysicalCourseRequest();
    const userApi = new User();
    const certificateApi = new CertifiateTemplete();
    const surveyApi = new Survey();

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
      physicalCourseRequestApi,
    };
  },

  async mounted() {
    this.usersList = await this.userApi.getAll();
    await this.loadCourseData();
  },

  data() {
    return {
      isLoading: false,
      isSaving: false,

      isFlipped: false,
      isReadonly: false,
      newItem: {
        schedules: [], // Initialize schedules array
      },
      usersData: [],
      certificatesData: [],
      courseData: null,
      approvedUsers: [],
      attendanceData: {},
      gradesData: {},
      successMessage: "",
      errorMessage: "",
      usersList: [],
    };
  },

  computed: {
    gradesEntered() {
      if (!this.courseData || !this.courseData.grades) return 0;
      return this.courseData.grades.filter((grade) => grade.grade > 0).length;
    },

    completionRate() {
      if (!this.approvedUsers.length) return 0;
      return Math.round((this.gradesEntered / this.approvedUsers.length) * 100);
    },
  },

  methods: {
    async loadCourseData() {
      try {
        this.isLoading = true;
        const response = await this.api.show(this.$route.params.courseId, {
          with: [
            "requests",
            "materials",
            "schedules.attendances",
            "grades",
            "attendances",
          ],
        });

        this.courseData = response;
        this.courseData.instructors = this.usersList.filter((user) =>
          response.user_ids.includes(user?.id)
        );
        const approvedRequests = response.requests.filter(
          (request) => request.status === "approved"
        );
        const approvedUsersIds = approvedRequests.map((request) => request.id);

        if (approvedUsersIds.length > 0) {
          let usersResponse = await this.physicalCourseRequestApi.getAll({
            filterIn: `id|${approvedUsersIds.join(",")}`,
            filter: `status|approved|=`,
            // with: ["user"],
          });

          console.log("usersResponse", usersResponse);
          // this.approvedUsers = usersResponse.map((request) => request.user);
          usersResponse = usersResponse.map((request) => {
            return {
              ...request,
              user: this.usersList.find((user) => user?.id == request?.user_id),
            };
          });   
          this.approvedUsers = usersResponse.map((request) =>
            this.usersList.find((user) => user?.id == request?.user_id)
          );
          console.log("usersResponseAfterrrrrrrrrrrrrrrr", usersResponse);

          this.initializeGradesData();
        } else {
          this.approvedUsers = [];
        }
      } catch (error) {
        console.error("Error loading course data:", error);
        this.errorMessage = this.$t("common.error_loading_data");
      } finally {
        this.isLoading = false;
      }
    },

    initializeGradesData() {
      this.gradesData = {};
      this.approvedUsers.forEach((user) => {
        const existingGrade = this.courseData.grades?.find(
          (grade) => grade.user_id === user?.id
        );
        this.gradesData[user?.id] = existingGrade ? existingGrade.grade : "";
      });
    },

    async saveGrades() {
      try {
        this.isSaving = true;
        this.errorMessage = "";
        this.successMessage = "";

        const gradesPayload = {
          course_id: this.$route.params.courseId,
          grades: this.gradesData,
        };

        const response = await this.api.storeGrade(
          this.$route.params.courseId,
          gradesPayload
        );
        if (response.status == "success") {
          this.api.poup(
            response,
            this.$t("physicalcourse.grades_saved_successfully")
          );
          this.successMessage = this.$t(
            "physicalcourse.grades_saved_successfully"
          );
          await this.loadCourseData();
        }
      } catch (error) {
        console.error("Error saving grades:", error);
        this.errorMessage = this.$t("common.error_saving_data");
        this.api.poup(
          { status: false, message: error.message },
          this.$t("common.error_occurred")
        );
      } finally {
        this.isSaving = false;
      }
    },

    getInitials(name) {
      if (!name) return "";
      return name.charAt(0).toUpperCase();
    },
  },

  watch: {
    "newItem.schedules": {
      handler(newSchedules) {
        if (!newSchedules || newSchedules.length === 0) {
          this.loadCourseData();
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.session-card {
  border-left: 4px solid #007bff;
  transition: all 0.3s ease;
}

.session-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.badge {
  font-size: 0.8em;
}

.form-label.small {
  font-size: 0.85em;
  margin-bottom: 0.25rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.text-end {
  text-align: right;
}

.instructors-wrapper .badge {
  margin-bottom: 2px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-muted {
  color: #6c757d !important;
}

.text-primary {
  color: #0d6efd !important;
}

.text-info {
  color: #0dcaf0 !important;
}

/* Grades specific styles */
.grades-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.grades-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  font-weight: bold;
}

.course-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.course-info > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: white;
  font-size: 1.8rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grades-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.grades-table {
  margin: 0;
  border: none;
}

.grades-table thead th {
  background: #f8f9fa;
  border: none;
  padding: 1.5rem 1rem;
  font-weight: 600;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
}

.grades-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s ease;
}

.grades-table tbody tr:hover {
  background-color: #f8f9fa;
}

.grades-table tbody td {
  padding: 1.5rem 1rem;
  vertical-align: middle;
  border: none;
}

.row-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: #8b4513;
}

.student-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.grade-input {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
}

.grade-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-actions {
  padding: 2rem;
  background: #f8f9fa;
  text-align: center;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  min-width: 200px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  color: white;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.success-alert {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  border: none;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  color: #155724;
  font-weight: 500;
}

.error-alert {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  border: none;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  color: #721c24;
  font-weight: 500;
}

@media (max-width: 768px) {
  .grades-header {
    padding: 1.5rem;
  }

  .grades-header h1 {
    font-size: 2rem;
  }

  .course-info {
    gap: 1rem;
  }

  .course-info > div {
    font-size: 1rem;
  }

  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .grades-table thead th,
  .grades-table tbody td {
    padding: 1rem 0.5rem;
  }

  .student-info {
    gap: 0.5rem;
  }

  .student-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .student-name {
    font-size: 1rem;
  }

  .grade-input {
    padding: 0.5rem;
  }
}
</style>
