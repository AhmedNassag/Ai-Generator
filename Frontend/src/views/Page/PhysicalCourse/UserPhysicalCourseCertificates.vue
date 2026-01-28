<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')" :subPage="$t('physicalcourse.certificates')"
    :titlePage="$t('physicalcourse.certificates')">
    <div v-permission:show></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable v-if="apiReady" ref="table" v-permission:show id="example-table"
        :tableClass="'table table-striped table-bordered'" :columns="tableColumns" :api="api" :apiParams="apiParams"
        :hideActions="hideActions" :hideAddNewButton="true">
        <!-- User Name Column -->
        <template #user="{ item }">
          <small class="text-muted">{{ item.user.full_name || '-' }}</small>
        </template>

        <!-- Email Column -->
        <template #email="{ item }">
          <small class="text-muted">{{ item.user.email || '-' }}</small>
        </template>

        <!-- Certificate Number Column -->
        <template #certificate_number="{ item }">
          <small class="text-muted">{{ item.certificate_number || '-' }}</small>
        </template>


        <!-- Certificate Number Column -->
        <template #course_name="{ item }">
          <small class="text-muted">{{ item.certificateable.name || '-' }}</small>
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
            <a @click="viewCertificate(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
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
import Auth from "@/API/Auth";
import CertifiateTemplete from "@/API/CertifiateTemplete/CertifiateTemplete";
import User from "@/API/User/User";


export default {
  name: 'PhysicalCourseCertificates',
  components: {
    MainPage,
    DataTable,
  },

  setup() {
    const api = new User();
    const apiParams = {
      with: ['certificates.certificateable', 'certificates.user'],
      filter: `id|${Auth.USER.id}|=`,
    };
    const tableColumns = [];

    return {
      api,
      apiParams,
      tableColumns,
    };
  },

  created() {
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
        id: 'course_name',
        title: this.$t('physicalcourse.course_name'),
        data: null,
      },
      {
        id: 'issued_at',
        title: this.$t('physicalcourse.issued_at'),
        data: 'created_at',
      }
    ];
  },


  async mounted() {
    this.users = await this.api.getAll();
    await this.getUserCertificates();
  },

  data() {
    return {
      isFlipped: false,
      apiReady: false,
      certificatesData: [],
      users:[],
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
      const user = this.users.find((user) => user.id === userId);
      return user ? user.full_name : "";      
    },
    getUserEmail(userId) {
      const user = this.users.find((user) => user.id === userId);
      return user ? user.email : "";
    },
    // Fetch certificates for this course and prepare DataTable API
    // async getUserCertificates() {
    //   try {
    //     const response = await this.api.show(Auth.USER.id, {
    //       with: ['certificates.certificateable', 'certificates.user'],
    //       filter: `id|${Auth.USER.id}|=`,
    //     });

    //     this.api = {
    //       getAll: async () => {
    //         const data = response.certificates || [];
    //         return {
    //           data,
    //           recordsTotal: data.length,
    //           recordsFiltered: data.length,
    //         };
    //       },
    //     };

    //     this.apiReady = true;
    //   } catch (error) {
    //     console.error('getUserCertificates error:', error);
    //     this.$refs.page?.api?.poup?.(
    //       { status: false, message: error.message },
    //       this.$t('physicalcourse.getUserCertificatesError'),
    //     );
    //   }
    // },
      async getUserCertificates() {
      try {
        const response = await this.api.show(Auth.USER.id, {
          with: ['certificates.certificateable', 'certificates.user'],
          filter: `id|${Auth.USER.id}|=`,
        });

        this.api = {
          getAll: async () => {
            const data = response.certificates || [];
            return {
              data,
              recordsTotal: data.length,
              recordsFiltered: data.length,
            };
          },
        };

        this.apiReady = true;
      } catch (error) {
        console.error('getUserCertificates error:', error);
        this.$refs.page?.api?.poup?.(
          { status: false, message: error.message },
          this.$t('physicalcourse.getUserCertificatesError'),
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