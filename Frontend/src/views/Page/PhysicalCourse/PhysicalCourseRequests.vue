<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')" :subPage="$t('physicalcourse.requests')"
    :titlePage="$t('physicalcourse.courseRequests')">

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="requests-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :hideAddNewButton="true" :hideActions="hideActions"
        :editItem="null" :openForm="null">

        <!-- User Name Column -->
        <template #user_name="{ item }">
          <div class="d-flex align-items-center">
            <i class="fas fa-user text-primary me-2"></i>
            <span>{{getUserFullName(item.user_id)}}</span>
          </div>
        </template>

        <!-- Status Column with Badges -->
        <template #status="{ item }">
          <span :class="getStatusBadgeClass(item.status)">
            <i :class="getStatusIcon(item.status)" class="me-1"></i>
            {{ $t('physicalcourse.' + item.status) }}
          </span>
        </template>

        <!-- Created At Date -->
        <template #created_at="{ item }">
          <small class="text-muted">
            <i class="fas fa-calendar text-info me-1"></i>
            {{ formatDateTime(item.created_at) }}
          </small>
        </template>

        <!-- Actions Column -->
        <template #addAction="{ item }">


          <li v-permission:approveRequest v-if="item.status === 'pending' && canApproveCourse">
            <!-- Approve Button -->
            <a @click="updateRequestStatus(item, 'approved')" class="dropdown-item text-secondary"
              href="javascript:void(0)">
              <i class="fas fa-check"></i>
              {{ $t('physicalcourse.approve') }}
            </a>
          </li>

          <li v-permission:cancelRequest v-if="item.status === 'pending'">
            <!-- Reject Button -->
            <a @click="updateRequestStatus(item, 'canceled')" class="dropdown-item text-secondary"
              href="javascript:void(0)">
              <i class="fas fa-times"></i>
              {{ $t('physicalcourse.reject') }}
            </a>
          </li>

          <!-- Transfer Button -->
          <li v-permission:transferRequest v-if="item.status === 'pending'">
            <a @click="showTransferModal(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="fas fa-exchange-alt"></i>
              {{ $t('physicalcourse.transfer') }}
            </a>
          </li>



        </template>

      </DataTable>
    </template>

  </main-page>

  <!-- Transfer Dialog -->
  <v-dialog v-model="transferDialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline d-flex align-items-center">
        <v-icon class="me-2">mdi-swap-horizontal</v-icon>
        {{ $t('physicalcourse.transfer_request') }}
        <v-spacer></v-spacer>
        <v-btn icon @click="closeTransferDialog" :disabled="isProcessingTransfer">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="transferForm">

          <v-select v-model="selectedCourseForTransfer" :options="coursesForTransfer" :reduce="option => option.id"
            :placeholder="$t('physicalcourse.choose_course')" label="name">
          </v-select>

          <v-alert v-if="selectedRequestForTransfer" type="info" variant="tonal" class="mt-3">
            <template #prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            {{ $t('physicalcourse.transferring_request_for') }}:
            <strong>{{ getUserFullName(selectedRequestForTransfer.user_id)}}</strong>
          </v-alert>

          <v-alert v-if="coursesForTransfer.length === 0 && !isLoadingCourses" type="warning" variant="tonal"
            class="mt-3">
            <template #prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            {{ $t('physicalcourse.no_available_courses') }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="closeTransferDialog" :disabled="isProcessingTransfer">
          {{ $t('physicalcourse.cancel') }}
        </v-btn>
        <v-btn color="primary" @click="confirmTransfer" :loading="isProcessingTransfer"
          :disabled="!selectedCourseForTransfer">
          <template #prepend>
            <v-icon>mdi-swap-horizontal</v-icon>
          </template>
          {{ $t('physicalcourse.transfer') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import PhysicalCourseRequests from "@/API/PhysicalCourseRequest/PhysicalCourseRequest";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import vSelect from "vue-select";
import PhysicalCourse from "@/API/PhysicalCourse/PhysicalCourse";
import { template } from "lodash";
import Swal from "sweetalert2";
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
    const userApi = new User();
    const courseApi = new PhysicalCourse();
    const tableColumns = [];

    return {
      api,
      tableColumns,
      courseApi,
      userApi
    };
  },

  async mounted() {
    const response = await this.courseApi.show(this.courseId, {
      with: ['requests']
    });

    this.courseData = response;
    await this.loadAvailableCourses();
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

    canApproveCourse() {
      return this.courseData.max_seats - this.courseData?.requests?.filter(request => request.status === 'approved').length > 0;
    }
  },

  data() {
    return {
      users:[],
      courseData: {},
      isFlipped: false,
      courseId: null,
      apiParams: {},
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      remainingSeats: 0,
      maxSeats: 0,
      isLoading: false,
      coursesForTransfer: [],
      selectedCourseForTransfer: null,
      selectedRequestForTransfer: null,
      isLoadingCourses: false,
      isProcessingTransfer: false,
      transferDialog: false,
      transferFormValid: false,
      courseSelectionRules: [
        v => !!v || this.$t('physicalcourse.course_required')
      ],
    };
  },

  async created() {
    this.users = await this.userApi.getAll();
    // Get course ID from route params
    this.courseId = this.$route.params.courseId;
    this.apiParams = {filter: `course_id|${this.courseId}` };

    // Initialize the table columns
    this.tableColumns = [
      {
        id: "user_name",
        title: this.$t("physicalcourse.userName"),
        data: "user_name",
        defaultContent: "N/A"
      },
      {
        id: "status",
        title: this.$t("physicalcourse.status"),
        data: "status",
        defaultContent: "N/A"
      },
      {
        id: "created_at",
        title: this.$t("physicalcourse.requestDate"),
        data: "created_at",
        defaultContent: "N/A"
      },
    ];
  },

  methods: {

    getUserFullName(userId) {
      const user = this.users.find(user => user.id === userId);
      return user ? user.full_name : '';
    },
    async loadAvailableCourses() {
      try {
        this.isLoadingCourses = true;
        const response = await this.courseApi.getAll({
          filter: `open_registration|true -boolean|=`,
          with: ['requests']
        });

        if (response) {
          this.coursesForTransfer = response
            .filter(course => {
              // Exclude current course and filter by available seats
              if (course.id == this.courseId) return false;

              const approvedCount = course.requests ?
                course.requests.filter(request => request.status === 'approved').length : 0;

              return approvedCount < course.max_seats;
            })
            .map(course => ({
              id: course.id,
              name: course.name,
              max_seats: course.max_seats,
              available_seats: course.max_seats - (course.requests ?
                course.requests.filter(request => request.status === 'approved').length : 0)
            }));
        }
      } catch (error) {
        console.error('Error loading available courses:', error);
        this.coursesForTransfer = [];
      } finally {
        this.isLoadingCourses = false;
      }
    },

    // Show transfer dialog
    showTransferModal(request) {
      this.selectedRequestForTransfer = request;
      this.selectedCourseForTransfer = null;

      // Reload available courses before showing dialog
      this.loadAvailableCourses().then(() => {
        this.transferDialog = true;
      });
    },

    // Close transfer dialog
    closeTransferDialog() {
      this.transferDialog = false;
      this.selectedCourseForTransfer = null;
      this.selectedRequestForTransfer = null;
      // Reset form validation
      if (this.$refs.transferForm) {
        this.$refs.transferForm.reset();
      }
    },

    // Confirm transfer
    async confirmTransfer() {
      if (!this.selectedCourseForTransfer || !this.selectedRequestForTransfer) {
        return;
      }

      // Validate form first
      if (this.$refs.transferForm) {
        const { valid } = await this.$refs.transferForm.validate();
        if (!valid) return;
      }

      this.isProcessingTransfer = true;

      try {
        const response = await this.courseApi.transferRequest(this.selectedRequestForTransfer.id, {
          new_course_id: this.selectedCourseForTransfer
        });

        if (response && response.status !== false) {
          this.api.poup(
            { status: true, message: response.message || this.$t('physicalcourse.request_transferred_successfully') },
            this.$t('physicalcourse.transfer_success')
          );

          // Close dialog and refresh table
          this.closeTransferDialog();
          this.$refs.table.refreshTable();
        } else {
          this.api.poup(
            { status: false, message: response?.message || this.$t('physicalcourse.transfer_error') },
            this.$t('physicalcourse.transfer_error')
          );
        }
      } catch (error) {
        console.error('Transfer request error:', error);
        this.api.poup(
          { status: false, message: error.message || this.$t('physicalcourse.transfer_error') },
          this.$t('physicalcourse.transfer_error')
        );
      } finally {
        this.isProcessingTransfer = false;
      }
    },

    // Get status badge class based on status
    getStatusBadgeClass(status) {
      const classes = {
        'approved': 'badge bg-success',
        'canceled': 'badge bg-danger',
        'transferred': 'badge bg-info',
        'pending': 'badge bg-warning'
      };
      return classes[status] || 'badge bg-secondary';
    },

    // Get status icon
    getStatusIcon(status) {
      const icons = {
        'approved': 'fas fa-check-circle',
        'canceled': 'fas fa-times-circle',
        'transferred': 'fas fa-exchange-alt',
        'pending': 'fas fa-clock'
      };
      return icons[status] || 'fas fa-question-circle';
    },

    // Update request status
    async updateRequestStatus(request, newStatus) {
      // Show confirmation dialog
      const confirmMessage = this.getConfirmationMessage(newStatus);
      // if (!confirm(confirmMessage)) {
      //   return;
      // }

      Swal.fire({
        title: this.$t('physicalcourse.confirmation'),
        text: confirmMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.$t('physicalcourse.yes'),
        cancelButtonText: this.$t('physicalcourse.no')
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.isLoading = true;

          try {
            let response;

            switch (newStatus) {
              case 'approved':
                response = await this.courseApi.approveRequest(request.id);
                break;
              case 'canceled':
                response = await this.courseApi.cancelRequest(request.id);
                break;
              default:
                throw new Error(`Unsupported status: ${newStatus}`);
            }

            if (response && response.status !== false) {
              this.api.poup(
                { status: true, message: response.message || this.$t('physicalcourse.statusUpdated') },
                this.$t('physicalcourse.statusUpdated')
              );
              this.$refs.table.refreshTable();
            } else {
              this.api.poup(
                { status: false, message: response?.message || this.$t('physicalcourse.statusUpdateError') },
                this.$t('physicalcourse.statusUpdateError')
              );
            }
          } catch (error) {
            console.error('Update status error:', error);
            this.api.poup(
              { status: false, message: error.message || this.$t('physicalcourse.statusUpdateError') },
              this.$t('physicalcourse.statusUpdateError')
            );
          } finally {
            this.isLoading = false;
          }

        }
      });
    },

    // Get confirmation message for status update
    getConfirmationMessage(status) {
      const messages = {
        'approved': this.$t('physicalcourse.confirmApprove'),
        'canceled': this.$t('physicalcourse.confirmCancel'),
        'transferred': this.$t('physicalcourse.confirmTransfer')
      };
      return messages[status] || this.$t('physicalcourse.confirmUpdate');
    },

    // Format date and time
    formatDateTime(dateString) {
      if (!dateString) return '-';

      try {
        const date = new Date(dateString);
        return date.toLocaleString(this.$i18n.locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
      }
    },

  },

  // Watch for route changes
  watch: {
    '$route.params.courseId': {
      handler(newCourseId) {
        if (newCourseId) {
          this.courseId = newCourseId;
          this.apiParams = {filter: `course_id|${newCourseId}` };
          if (this.$refs.table) {
            this.$refs.table.refreshTable();
          }
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
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

.card-body .row .col-md-3 {
  border-right: 1px solid #dee2e6;
}

.card-body .row .col-md-3:last-child {
  border-right: none;
}

@media (max-width: 768px) {
  .card-body .row .col-md-3 {
    border-right: none;
    border-bottom: 1px solid #dee2e6;
    margin-bottom: 1rem;
  }

  .card-body .row .col-md-3:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

/* Loading states */
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

/* Vuetify overrides and custom styles */
.v-dialog .v-card {
  overflow: visible;
}

.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.v-alert.v-alert--variant-tonal {
  border-left: 4px solid currentColor;
}

.v-chip {
  font-size: 0.75rem;
}

.v-list-item {
  min-height: 48px;
}

/* Keep existing styles for non-Vuetify elements */
</style>