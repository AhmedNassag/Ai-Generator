<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')"
    :subPage="$t('physicalcourse.Attendance')"
    :titlePage="$t('physicalcourse.Attendance')"
  >
    <!-- Slot for rendering the attendance content -->
    <template #datatable>
      <div v-if="isLoading" class="text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p class="mt-2">{{ $t("common.loading") }}</p>
      </div>

      <div v-else-if="courseData">
        <!-- Session Tabs -->
        <div class="session-tabs mb-4">
          <ul class="nav nav-tabs" id="attendanceTabs" role="tablist">
            <li
              v-for="(session, index) in courseData.schedules"
              :key="session.id"
              class="nav-item"
              role="presentation"
            >
              <button
                :class="['nav-link', { active: index === activeTab }]"
                :id="`tab-${session.id}`"
                @click="setActiveTab(index)"
                type="button"
                role="tab"
              >
                <i :class="['fas fa-calendar-alt', 'me-2']"></i>
                {{ formatDate(session.session_date) }} -
                {{ session.session_time }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <div
            v-for="(session, index) in courseData.schedules"
            :key="session.id"
            v-show="index === activeTab"
            :class="['tab-pane fade', { 'show active': index === activeTab }]"
            :id="`session-${session.id}`"
            role="tabpanel"
          >
            <div class="attendance-card">
              <!-- Session Info -->
              <div class="session-info mb-4">
                <h5>
                  <i :class="['fas fa-clock', 'me-2']"></i>
                  {{ $t("physicalcourse.session") }}
                  {{ formatDate(session.session_date) }} -
                  {{ session.session_time }}
                </h5>
              </div>

              <!-- Statistics -->
              <div class="attendance-stats mb-4">
                <div class="row">
                  <div class="col-md-4">
                    <div class="stat-card">
                      <div class="stat-number">{{ approvedUsers.length }}</div>
                      <div class="stat-label">
                        {{ $t("physicalcourse.total_students") }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="stat-card stat-present">
                      <div class="stat-number">
                        {{ getPresentCount(session) }}
                      </div>
                      <div class="stat-label">
                        {{ $t("physicalcourse.present") }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="stat-card stat-absent">
                      <div class="stat-number">
                        {{ getAbsentCount(session) }}
                      </div>
                      <div class="stat-label">
                        {{ $t("physicalcourse.absent") }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Attendance Form -->
              <form @submit.prevent="saveAttendance(session)">
                <div class="table-responsive">
                  <table class="table attendance-table">
                    <thead>
                      <tr>
                        <th width="10%">#</th>
                        <th width="60%">{{ $t("physicalcourse.student") }}</th>
                        <th width="30%">
                          {{ $t("physicalcourse.attendance") }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(user, userIndex) in approvedUsers"
                        :key="user?.id"
                      >
                        <td class="text-center">
                          <span class="badge bg-primary">{{
                            userIndex + 1
                          }}</span>
                        </td>
                        <td>
                          <div class="student-info">
                            <div class="student-avatar">
                              {{ user?.full_name.charAt(0).toUpperCase() }}
                            </div>
                            <div class="student-name">{{ user?.full_name }}</div>
                          </div>
                        </td>
                        <td class="text-center">
                          <div
                            class="form-check form-switch d-flex justify-content-center"
                          >
                            <input
                              v-model="attendanceData[session.id][user?.id]"
                              class="form-check-input attendance-checkbox"
                              type="checkbox"
                              :id="`attendance_${session.id}_${user?.id}`"
                            />
                            <label
                              :for="`attendance_${session.id}_${user?.id}`"
                              class="form-check-label ms-2"
                            >
                              <span
                                v-if="attendanceData[session.id][user?.id]"
                                class="text-success"
                              >
                                <i class="fas fa-check"></i>
                                {{ $t("physicalcourse.present") }}
                              </span>
                              <span v-else class="text-danger">
                                <i class="fas fa-times"></i>
                                {{ $t("physicalcourse.absent") }}
                              </span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="text-center mt-4">
                  <button
                    type="submit"
                    class="save-btn"
                    :disabled="isSaving"
                    v-permission:storeAttendance
                  >
                    <i v-if="isSaving" class="fas fa-spinner fa-spin me-2"></i>
                    <i v-else :class="['fas fa-save', 'me-2']"></i>
                    {{ $t("physicalcourse.save_attendance") }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else class="text-center py-5">
        <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
        <p class="mt-2">{{ $t("common.error_loading_data") }}</p>
        <button @click="loadCourseData" class="btn btn-primary">
          {{ $t("common.retry") }}
        </button>
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
      isFlipped: false,
      isReadonly: false,
      isLoading: false,
      isSaving: false,
      activeTab: 0,
      courseData: null,
      approvedUsers: [],
      attendanceData: {},
      usersData: [],
      certificatesData: [],
      surveysData: [],
      permissions: [],
      usersList: [],
    };
  },

  created() {
    this.courseId = this.$route.params.courseId;
  },

  methods: {
    async loadCourseData() {
      try {
        this.isLoading = true;
        const response = await this.api.show(this.courseId, {
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
            // with: ["user"]
          });

          usersResponse = usersResponse.map((request) => {
            return {
              ...request,
              user: this.usersList.find((user) => user?.id == request?.user_id),
            };
          });
          
          this.approvedUsers = usersResponse.map((request) =>
            this.usersList.find((user) => user?.id == request?.user_id)
          );
        } else {
          this.approvedUsers = [];
        }

        this.initializeAttendanceData();
      } catch (error) {
        console.error("Error loading course data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    initializeAttendanceData() {
      const attendanceData = {};

      this.courseData.schedules.forEach((session) => {
        attendanceData[session.id] = {};

        this.approvedUsers.forEach((user) => {
          const isAttended =
            session.attendances &&
            session.attendances.some(
              (att) => att.user_id === user?.id && att.attended === true
            );

          attendanceData[session.id][user?.id] = isAttended;
        });
      });

      this.attendanceData = attendanceData;
    },

    setActiveTab(index) {
      this.activeTab = index;
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString(this.$i18n.locale);
    },

    getPresentCount(session) {
      console.log("session is equall");
      console.log(session);
      if (!this.attendanceData[session.id]) return 0;

      return Object.values(this.attendanceData[session.id]).filter(
        (attended) => attended === true
      ).length;
    },

    getAbsentCount(session) {
      return this.approvedUsers.length - this.getPresentCount(session);
    },

    async saveAttendance(session) {
      try {
        this.isSaving = true;
        const attendanceList = [];
        console.log("this.attendanceData");
        console.log(this.attendanceData);

        Object.keys(this.attendanceData[session.id]).forEach((userId) => {
          if (this.attendanceData[session.id][userId]) {
            attendanceList.push(String(userId));
          }
        });

        const payload = {
          session_id: String(session.id),
          attendances: attendanceList,
        };
        const response = await this.api.storeAttendance(this.courseId, payload);
        if (response.status == "success") {
          this.api.poup(
            response,
            this.$t("physicalcourse.attendance_saved_successfully")
          );
          await this.loadCourseData();
        }
      } catch (error) {
        this.api.poup(
          { status: false, message: error.message },
          this.$t("common.error_occurred")
        );
        console.error("Error saving attendance:", error);
      } finally {
        this.isSaving = false;
      }
    },
  },

  watch: {
    "$route.params.courseId": {
      handler(newCourseId) {
        if (newCourseId) {
          this.courseId = newCourseId;
          this.loadCourseData();
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
/* Session Tabs */
.session-tabs .nav-tabs {
  border-bottom: 2px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 10px 10px 0 0;
  padding: 0.5rem;
}

.session-tabs .nav-link {
  border: none;
  border-radius: 8px;
  color: #6c757d;
  font-weight: 500;
  margin: 0 0.25rem;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.session-tabs .nav-link:hover {
  background: #e9ecef;
  color: #495057;
}

.session-tabs .nav-link.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

/* Attendance Card */
.attendance-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: none;
  padding: 2rem;
  margin-top: 1rem;
}

/* Session Info */
.session-info h5 {
  color: #2d3748;
  font-weight: 600;
  margin: 0;
}

/* Statistics Cards */
.attendance-stats {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-present .stat-number {
  color: #28a745;
}

.stat-absent .stat-number {
  color: #dc3545;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

/* Attendance Table */
.attendance-table {
  margin-top: 1.5rem;
}

.attendance-table th {
  background: #f8f9fa;
  border: none;
  font-weight: 600;
  color: #495057;
  padding: 1rem;
  text-align: center;
}

.attendance-table td {
  padding: 1rem;
  vertical-align: middle;
  border-color: #f1f3f4;
}

/* Student Info */
.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
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

.student-name {
  font-weight: 500;
  color: #2d3748;
}

/* Attendance Checkbox */
.attendance-checkbox {
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
}

.attendance-checkbox:checked {
  background-color: #28a745;
  border-color: #28a745;
}

.form-check-label {
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

/* Save Button */
.save-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Badge Styling */
.badge {
  font-size: 0.8em;
  padding: 0.375rem 0.75rem;
  border-radius: 25px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .session-tabs .nav-link {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  .attendance-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .student-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .attendance-table th,
  .attendance-table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}

/* Loading and utility styles from original */
.session-card {
  border-left: 4px solid #007bff;
  transition: all 0.3s ease;
}

.session-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}
</style>
