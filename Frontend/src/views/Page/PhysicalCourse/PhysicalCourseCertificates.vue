<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')"
    :subPage="$t('physicalcourse.certificates')"
    :titlePage="$t('physicalcourse.certificates')"
  >
    <div v-permission:show></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        v-if="apiReady"
        ref="table"
        v-permission:show
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :hideActions="hideActions"
        :hideAddNewButton="true"
      >
        <!-- User Name Column -->
        <template #user="{ item }">
          <small class="text-muted">{{getUserFullName(item.user_id)}}</small>
        </template>

        <!-- Email Column -->
        <template #email="{ item }">
          <small class="text-muted">{{getUserEmail(item.user_id)}}</small>
        </template>

        <!-- Certificate Number Column -->
        <template #certificate_number="{ item }">
          <small class="text-muted">{{ item.certificate_number || '-' }}</small>

        </template>

        <!-- Issued At Column -->
        <template #issued_at="{ item }">
          <small class="text-muted">
            <i class="fas fa-calendar-alt text-info me-1"></i>
            {{ formatDateTime(item.created_at) }}
          </small>
        </template>

        <!-- Actions -->
        <template #addAction="{ item }">
          <li v-permission:viewCertificate>
            <a
              @click="viewCertificate(item)"
              class="dropdown-item text-secondary"
              href="javascript:void(0)"
            >
              <i class="fas fa-eye"></i>
              {{ $t('physicalcourse.view_certificate') }}
            </a>
          </li>
        </template>
      </DataTable>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import MainPage from '@/components/MainPage.vue';
import DataTable from '@/components/DataTable.vue';
import PhysicalCourse from '@/API/PhysicalCourse/PhysicalCourse';
import User from '@/API/User/User';

export default {
  name: 'PhysicalCourseCertificates',
  components: {
    MainPage,
    DataTable,
  },

  setup() {
    const api = new PhysicalCourse();
    const userApi = new User();
    const apiParams = {};
    const tableColumns = [];
    return {
      api,
      apiParams,
      tableColumns,
      userApi,
    };
  },

  created() {
    this.getCourseCertificates();
    // Define columns for DataTable
    this.tableColumns = [
      { id: 'user', title: this.$t('physicalcourse.user'), data: 'user.full_name' },
      { id: 'email', title: this.$t('physicalcourse.email'), data: 'user.email' },
      {
        id: 'certificate_number',
        title: this.$t('physicalcourse.certificate_number'),
        data: 'id',
      },
      {
        id: 'issued_at',
        title: this.$t('physicalcourse.issued_at'),
        data: 'created_at',
      }
    ];
  },

  data() {
    return {
      isFlipped: false,
      apiReady: false,
      certificatesData: [],
      usersList: [],
    };
  },

  computed: {
    // Hide default edit/delete actions
    hideActions() {
      return () => ({
        edit: true,
        delete: true,
      });
    },
  },

  methods: {
    getUserFullName(userId) {
      const user = this.usersList.find(user => user.id === userId);
      return user ? user.full_name : '';
    },

    getUserEmail(userId) {
      const user = this.usersList.find(user => user.id === userId);
      return user ? user.email : '';
    },

    // Fetch certificates for this course and prepare DataTable API
    async getCourseCertificates() {
      try {
        this.usersList = await this.userApi.getAll();
        const physicalCourseApi = new PhysicalCourse();
        let response = await physicalCourseApi.getCourseCertificates(this.$route.params.courseId, { with: ['template'] });
        response = response.map((certificate) => ({
          ...certificate,
          user: this.usersList.find((user) => user.id === certificate.user_id),
        }));

        this.certificatesData = response || [];
        this.api = {
          getAll: async () => {
            const data = this.certificatesData;
            return {
              data,
              recordsTotal: data.length,
              recordsFiltered: data.length,
            };
          },
        };
        this.apiReady = true;
      } catch (error) {
        console.error('getCourseCertificates error:', error);
        this.$refs.page?.api?.poup?.(
          { status: false, message: error.message },
          this.$t('physicalcourse.getCourseCertificatesError'),
        );
      }
    },

    // Format date and time for display
    formatDateTime(dateString) {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleString(this.$i18n.locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (error) {
        console.error('Date formatting error:', error);
        return dateString;
      }
    },

    // Redirect to certificate view page
    viewCertificate(certificate) {
      this.$router.push({
        name: 'ShowCertificate',
        params: { id: certificate.id },
      });
    },
  },
};
</script>

<style scoped>
/* Basic styling adjustments to match existing pages */
.table td,
.table th {
  vertical-align: middle;
}
</style>