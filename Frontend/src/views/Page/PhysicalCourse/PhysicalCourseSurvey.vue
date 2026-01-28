<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')" :subPage="$t('physicalcourse.courses')"
    :titlePage="$t('physicalcourse.courses')">

    <div v-permission:show v-permission:update v-permission:delete></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" v-permission:show id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm" :hideActions="hideActions" :hideAddNewButton="true">



        <template #user="{ item }">
          <small class="text-muted">
            {{getUserFullName(item.user_id)}}
          </small>
        </template>

        <template #email="{ item }">
          <small class="text-muted">
            {{getUserEmail(item.user_id)}}
          </small>
        </template>

        <template #status="{ item }">
          <small class="text-muted">
            {{ item.is_completed ? 'Completed' : 'Draft' }}
          </small>
        </template>

        <template #submitted_at="{ item }">
          <small class="text-muted">
            <i class="fas fa-calendar text-info me-1"></i>
            {{ formatDateTime(item.created_at) }}
          </small>
        </template>

        <template #addAction="{ item }">
          <li v-permission:getSurveyData>
            <!-- Approve Button -->
            <a @click="getSurveyData(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="fas fa-chart-bar"></i>
              {{ $t('physicalcourse.view') }}
            </a>
          </li>

        </template>


      </DataTable>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import physicalcourse from "@/API/PhysicalCourse/PhysicalCourse";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import CertifiateTemplete from "@/API/CertifiateTemplete/CertifiateTemplete";
import Survey from "@/API/Survey/Survey";
import SurveyResponse from "@/API/SurveyResponse/SurveyResponse";
import { get } from "lodash";

export default {
  components: {
    MainPage,
    DataTable,
  },

  setup() {
    const api = new SurveyResponse();
    const physicalcourseApi = new physicalcourse();
    const userApi = new User();
    const certificateApi = new CertifiateTemplete();
    const surveyApi = new Survey();


    const apiParams = {
    };

    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      physicalcourseApi,
      tableColumns,
      fromFields,
      userApi,
      certificateApi,
      surveyApi,
    };
  },

  async mounted() {
    this.users = await this.userApi.getAll({ select: "id|full_name|email" });
    // await this.loadSurveyData();
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
  },

  data() {
    return {
      users:[],
      isFlipped: false,
      isReadonly: false,
      newItem: {
        schedules: [] // Initialize schedules array
      },
      usersData: [],
      certificatesData: [],
      surveysData: [],
      surveysResponseData: [],
      permissions: [], // Add permissions array
      validationErrors: {}, // Track validation errors
      isEditing: false, // Track if we're editing
    };
  },

  created() {
    this.apiParams = {
      filter: `respondent_type|course|=&&respondent_id|${this.$route.params.courseId}|=`,
      with: ['survey']
    };
    // Initialize the table columns
    this.tableColumns = [
      { id: "user", title: this.$t("physicalcourse.user"), data: "user", defaultContent: "N/A" },
      { id: "email", title: this.$t("physicalcourse.email"), data: "email", defaultContent: "N/A" },
      { id: "status", title: this.$t("physicalcourse.status"), data: "status", defaultContent: "N/A" },
      { id: "submitted_at", title: this.$t("physicalcourse.submitted_at"), data: "submitted_at", defaultContent: "N/A" },
    ];
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

    // Load select data for dropdowns
    async loadSurveyData() {
      try {
        const usersResponse = await this.api.getAll({
          filter: `respondent_type|course|=&&respondent_id|${this.$route.params.courseId}|=`,
          with: ['survey']
        });

        this.surveysResponseData = usersResponse.map((response) =>{
          return {
            ...response,
            user: this.users.find((user) => user.id === response.user_id),
          };
        });

      } catch (error) {
        console.error(this.$t("user.FailedLoadData"), error);
      }
    },

    getSurveyData(surveyresponse) {
      this.$router.push({
        name: 'PhysicalCourseSurveyData',
        params: { surveyId: surveyresponse.id }
      });
    },

  },

  // Watch for route changes
  watch: {
    '$route.params.courseId': {
      handler(newCourseId) {
        if (newCourseId) {
          this.courseId = newCourseId;
          // this.loadSurveyData();
        }
      },
      immediate: true
    }
  }
};
</script>
