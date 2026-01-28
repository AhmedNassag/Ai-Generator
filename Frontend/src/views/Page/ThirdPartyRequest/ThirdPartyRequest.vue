<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'thirdpartyrequest.thirdpartyrequest'"
    :subPage="'thirdpartyrequest.thirdpartyrequest'" :titlePage="'thirdpartyrequest.thirdpartyrequest'">

    <!-- Slot for rendering the DataTable -->
    <div v-permission:update v-permission:delete></div>

    <template #datatable>
      <DataTable v-permission:show ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="openEditDialog" :openForm="openForm"
        :hideActions="hideActions">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #issue_date="{ item }"> <span class="">{{ formatDate(item.created_at) }} </span>
        </template>
        <!-- <template #requested_by="{ item }"> <span class="badge bg-secondary me-2">{{ getUserName(item.requested_by) }}
          </span> </template> -->

        <!-- <template #requested_by="{ item }">
          <a href="javascript:void(0)" @click="openViewModal(item)" :title="$t('requirement.view_requirement')"
            class="text-badge">
            {{ getUserName(item.requested_by) }}
          </a>
        </template> -->

        <template #requested_by="{ item }">
          <a href="#" @click.prevent="openAssigneeDetailsModal(item.requested_by)"
            class="badge badge-user text-decoration-none">
            {{ getUserName(item.requested_by) }}
          </a>
        </template>

        <template #department="{ item }"> <span class="">{{ getDepartmentName(item.department_id)
            }} </span> </template>
        <template #job_title="{ item }"> <span class="">{{ getJobName(item.job_id) }} </span>
        </template>
        <template #third_party_profile="{ item }"> <span class="">{{ item?.profile?.third_party_name
            }} </span> </template>
        <template #third_party_service="{ item }"> <span class="">{{ item?.service?.name }} </span>
        </template>

        <template #status="{ item }">
          <span v-if="item.status === 1" class="pending-badge" style="display: block; margin: auto;">{{
            $t('thirdpartyrequest.pending') }}</span>
          <span v-else-if="item.status === 2" class="inassessment-badge" style="display: block; margin: auto;">{{
            $t('thirdpartyrequest.in_assessment') }}</span>
          <span v-else-if="item.status === 3" class="refused-badge" style="display: block; margin: auto;">{{
            $t('thirdpartyrequest.refused') }}</span>
        </template>
        <template #addAction="{ item }">
          <v-list-item v-permission:viewRequest class="action-list-item" @click="openViewModal(item)">
            <template v-slot:prepend>
              <v-icon size="18">mdi-eye-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t('thirdpartyrequest.view') }}
            </v-list-item-title>
          </v-list-item>
        </template>

      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>


  <!-- Create Request Modal -->
  <CreateRequestModal :api="api" v-model="opencreateModal" ref="CreateRequestModal" :users="users"
    :departments="departments" :jobs="jobs" :thirdPartyProfiles="thirdPartyProfiles"
    :thirdPartyServices="thirdPartyServices" :evaluations="evaluations" :initialData="newItem" @submit="saveRequest"
    @departmentChange="getJobs" />

  <!-- Edit Request Modal -->
  <EditRequestModal v-model="openEditModal" :api="api" ref="EditRequestModal" :users="users" :departments="departments"
    :jobs="jobs" :thirdPartyProfiles="thirdPartyProfiles" :thirdPartyServices="thirdPartyServices" :editData="editItem"
    :editEvaluations="editEvaluations" @submit="updateRequest" />

  <!-- View Request Modal -->
  <ViewRequestModal v-model="viewModal" ref="ViewRequestModal" :requestData="requestData" :users="users"
    :departments="departments" :jobs="jobs" :canTakeActionsButtons="canTakeActionsButtons"
    @createAssessment="createRequestAssesment" @refuse="refuseRequestAssessment" />

  <!-- Create Assessment Modal -->
  <CreateAssessmentModal v-model="createAssessmentDialog" ref="CreateAssessmentModal" :assessments="assessmentsData"
    :contacts="contactsData" :requestId="assessment_request_id" @submit="createAssesment" />

  <!-- Refuse Request Modal -->
  <RefuseRequestModal v-model="rejectModal" ref="RefuseRequestModal" :requestId="refused_request_id"
    @rejected="submitRejection" :api="api" />

  <!-- View user details modal - FIXED -->
  <ViewUserDetails :viewUserModal="viewUserModal" :userData="userData" @close="closeUserModal"
    @update:viewUserModal="viewUserModal = $event" />

</template>

<script>
// Importing necessary components and API modules
import { Modal } from 'bootstrap';
import thirdpartyrequest from "@/API/ThirdPartyRequest/ThirdPartyRequest";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import User from '@/API/User/User';
import Job from '@/API/Job/Job';
import Department from '@/API/Department/Department';
import Assessment from '@/API/Assessment/Assessment';
import Auth from '@/API/Auth';
import SystemSetting from '@/API/SystemSetting/SystemSetting';
import ThirdPartyService from '@/API/ThirdPartyService/ThirdPartyService';

import ThirdPartyAssessment from '@/API/ThirdPartyQuestionnaire/ThirdPartyQuestionnaire';
import ThirdPartyEvaluation from '@/API/thirdPartyEvaluation/thirdPartyEvaluation';


import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// Import Modal Components
import CreateRequestModal from '@/views/Page/ThirdPartyRequest/CreateRequestModal.vue';
import EditRequestModal from '@/views/Page/ThirdPartyRequest/EditRequestModal.vue';
import ViewRequestModal from '@/views/Page/ThirdPartyRequest/ViewRequestModal.vue';
import CreateAssessmentModal from '@/views/Page/ThirdPartyRequest/CreateAssessmentModal.vue';
import RefuseRequestModal from '@/views/Page/ThirdPartyRequest/RejectRequestModal.vue';
import dayjs from 'dayjs';
import thirdPartyProfile from '@/API/ThirdPartyProfile/ThirdPartyProfile';
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";



export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    CreateRequestModal,
    EditRequestModal,
    ViewRequestModal,
    CreateAssessmentModal,
    RefuseRequestModal,
    vSelect,
    ViewUserDetails,
  },

  setup() {
    // Initialize API and other required properties
    const api = new thirdpartyrequest();
    const apiParams = { with: ['profile', 'service', 'assessment'] };
    const tableColumns = [];
    const fromFields = [];

    const userApi = new User();
    const jobApi = new Job();
    const departmentApi = new Department();
    const thirdPartyServiceApi = new ThirdPartyService();
    const thirdPartyProfileApi = new thirdPartyProfile();
    const thirdPartyEvaluationApi = new ThirdPartyEvaluation();
    const assessmentApi = new Assessment();
    const thirdpartyquestionnaireApi = new ThirdPartyAssessment();
    const USER_ID = Auth.USER.id;
    const systemSetting = new SystemSetting();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      jobApi,
      departmentApi,
      thirdPartyServiceApi,
      thirdPartyProfileApi,
      thirdPartyEvaluationApi,
      assessmentApi,
      thirdpartyquestionnaireApi,
      USER_ID,
      systemSetting
    };
  },

  async mounted() {
    this.newItem.requested_by = Auth.USER.id
    this.newItem.department_id = Auth.USER.department_id
    this.newItem.job_id = Auth.USER.job_id

    const requestReccipient = await this.systemSetting.getAll({
      filter: `type|thirdPartyRequests|=`,
    });
    this.requestReccipient = requestReccipient[0];

    if (this.requestReccipient?.receiver_type == "department manager") {
      try {
        this.departmentManagers = await this.api.getDepartmentManagers(this.requestReccipient.department_id);
      } catch (error) {
        console.error("Failed to load department managers:", error);
      }
    } else {
      this.departmentManagers = this.requestReccipient?.user_id;
    }
  },

  computed: {
    hideActions() {
      return (row) => ({
        edit: !(row.status == 1 && row.requested_by == Auth.USER.id),
        delete: !(row.status == 1 && row.requested_by == Auth.USER.id),
      });
    },

    canTakeActionsButtons() {
      if (Array.isArray(this.departmentManagers)) {
        return this.departmentManagers.some(manager => manager.id === Auth.USER.id);
      } else {
        return this.departmentManagers === Auth.USER.id;
      }
    },

  },
  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      isFlipped: false,
      isReadonly: false,
      newItem: {
        requested_by: null,
        department_id: null,
        job_id: null,
        third_party_profile_id: null,
        third_party_service_id: null,
        business_info: null,
        evaluations: [],
      },
      opencreateModal: false,
      users: [],
      departments: [],
      jobs: [],
      thirdPartyServices: [],
      thirdPartyProfiles: [],
      assessmentsData: [],
      contactsData: [],
      evaluations: [],
      requestData: [],

      openEditModal: false,
      editItem: {},
      editEvaluations: [],
      viewModal: false,
      rejectModal: false,
      refused_request_id: null,
      assessment_request_id: null,
      createAssessmentDialog: false,
      requestReccipient: null,
      departmentManagers: [],

      viewUserModal: false,
      userData: {},


    };
  },

  created() {
    this.loadSelectsData();
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "requested_by", title: this.$t("thirdpartyrequest.requested_by"), data: null, defaultContent: "N/A" },
      { id: "department", title: this.$t("thirdpartyrequest.department"), data: null, defaultContent: "N/A" },
      { id: "job_title", title: this.$t("thirdpartyrequest.job_title"), data: null, defaultContent: "N/A" },
      { id: "third_party_profile", title: this.$t("thirdpartyrequest.third_party_profile"), data: null, defaultContent: "N/A" },
      { id: "third_party_service", title: this.$t("thirdpartyrequest.third_party_service"), data: null, defaultContent: "N/A" },
      { id: "status", title: this.$t("thirdpartyrequest.status"), data: "status", defaultContent: "N/A" },
      { id: "issue_date", title: this.$t("thirdpartyrequest.issue_date"), data: "created_at", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.opencreateModal = true;
    },

    handleValidationError() {
      this.api.poup({ status: false, message: this.$t("thirdpartyrequest.please_fill_required_fields") }, this.$t("thirdpartyrequest.error"));
    },

    async getJobs(id) {
      this.editItem.job_id = null;
      this.newItem.job_id = null;
      this.jobs = [];
      const data = await this.departmentApi.getAll(
        {
          filter: "id|" + id + "|= ",
          with: ['jobs']
        }
      );
      this.jobs = data[0]?.jobs;
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    getUserName(user_id) {
      const user = this.users.find(user => user.id === user_id);
      return user ? user.full_name : "N/A";
    },
    getJobName(job_id) {
      const job = this.jobs.find(job => job.id === job_id);
      return job ? job.name : "N/A";
    },
    getDepartmentName(department_id) {
      const department = this.departments.find(department => department.id === department_id);
      return department ? department.name : "N/A";
    },

    openAssigneeDetailsModal(userId) {
      const user = this.users.find(user => user.id === userId);
      if (!user) {
        return;
      }

      const userDepartment = this.departments.find(dept => dept.id === user.department_id);
      this.userData = {
        ...user,
        department: userDepartment?.name || "N/A"
      };

      this.$nextTick(() => {
        this.viewUserModal = true;
      });
    },

    closeUserModal() {
      this.viewUserModal = false;
      this.userData = {};
    },

    async loadSelectsData() {
      try {
        // Load all data in parallel for better performance
        const [
          // thirdPartyServicesResponse,
          usersResponse,
          departmentsResponse,
          jobsResponse,
          thirdPartyEvaluationResponse,
          // thirdPartyProfilesResponse,
          // assessmentsResponse
        ] = await Promise.all([
          // this.thirdPartyServiceApi.getAll({ select: "id|name" }),
          this.userApi.getAll({ select: "id|full_name|department_id|phone|username|type|email" }),
          this.departmentApi.getAll({ select: "id|name" }),
          this.jobApi.getAll({ select: "id|name" }),
          this.thirdPartyEvaluationApi.getAll({ select: "id|name" }),
          // this.thirdPartyProfileApi.getAll({ select: "id|third_party_name" }),
          // this.assessmentApi.getAll({ with: 'template' })
        ]);

        // this.thirdPartyServices = thirdPartyServicesResponse;
        this.users = usersResponse;
        this.departments = departmentsResponse;
        this.jobs = jobsResponse;
        this.evaluations = thirdPartyEvaluationResponse;
        // this.thirdPartyProfiles = thirdPartyProfilesResponse;
        // this.assessmentsData = assessmentsResponse;

      } catch (error) {
        console.error("Failed to load data:", error);
      }
    },

    formatDate(date) {
      if (!date) return "N/A";
      return dayjs(date).format("DD-MM-YYYY HH:mm:ss");
    },

    async saveRequest(data) {
      const response = await this.api.insert(data);
      if (response?.status == "success") {
        this.$refs.CreateRequestModal.closeModal()
        this.api.poup(response, this.$t("thirdpartyrequest.created_successfully"));
        this.$refs.table.refreshTable();
      } else {
        this.api.poup({ status: false, message: response?.message || "There is an error " }, this.$t("thirdpartyrequest.error"));
      }

    },

    openViewModal(selectedRow) {
      this.requestData = { ...selectedRow };
      this.viewModal = true;
    },

    openEditDialog(request) {
      this.editItem = { ...request };
      this.editEvaluations = request.evaluations.map(evaluation => ({
        ...evaluation,
        answer: evaluation.answer || null,
        explanation: evaluation.explanation || "",
      }));
      this.openEditModal = true;
    },

    async updateRequest(updatedData) {
      const response = await this.api.update(updatedData);
      if (response.status == "success") {
        this.$refs.EditRequestModal.closeModal()
        this.api.poup(response, this.$t("thirdpartyrequest.updated_successfully"));
        this.$refs.table.refreshTable();
      } else {
        this.api.poup({ status: false, message: response.message || "There is an error " }, this.$t("thirdpartyrequest.error"));
      }
    },

    async createRequestAssesment(id) {
      this.assessment_request_id = id;
      this.contactsData = [];
      const data = await this.api.show(id, {
        with: "profile.contacts",
      });
      this.contactsData = data.profile?.contacts || [];
      this.createAssessmentDialog = true;
    },

    async createAssesment(formData) {
      if (this.assessmentsData.template?.question_ids?.length == 0) {
        this.thirdpartyquestionnaireApi.poup({ status: false, message: this.$t("thirdpartyrequest.cannot_create_assessment_without_questions") }, this.$t("thirdpartyrequest.error"));
        return;
      }

      const DataToSend = {
        ...formData,
        type: 'engagement_request'
      }
      const response = await this.thirdpartyquestionnaireApi.insert(DataToSend);
      if (response?.status == "success") {
        console.log('enter seconed check')
        this.$refs.CreateAssessmentModal.closeModal()
        this.thirdpartyquestionnaireApi.poup(response, this.$t("thirdpartyrequest.saved_successfully"));
        await this.api.getAll()
        this.$refs.table.refreshTable();
      } else {
        console.log('enter third check')
        this.thirdpartyquestionnaireApi.poup({ status: false, message: response?.message || "There is an error " }, this.$t("thirdpartyrequest.error"));
      }

    },

    refuseRequestAssessment(id) {
      this.refused_request_id = id;
      this.rejectModal = true;
    },

    async submitRejection(data) {
      const response = await this.api.rejectRequest(data.requestId, data.rejectReason);
      if (response?.status == "success") {
        this.api.poup(response, this.$t("thirdpartyrequest.refused_successfully"));
        this.$refs.RefuseRequestModal.closeModal()
        await this.api.getAll()
        this.$refs.table.refreshTable();
      } else {
        console.log('enter third check')
        this.api.poup({ status: false, message: response?.message || "There is an error " }, this.$t("thirdpartyrequest.error"));
      }

    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */

/* CKEditor minimum height */
.ck-editor__editable {
  min-height: 200px !important;
}

.text-badge {
  display: inline-block;
  background-color: #D0B5E3;
  color: #43235C;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.text-badge:hover {
  opacity: 0.9;
}

.pending-badge {
  display: inline-block;
  background-color: #EBDCB3;
  color: #C4951B;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.inassessment-badge {
  display: inline-block;
  background-color: #D3DFCE;
  color: #255F0B;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.refused-badge {
  display: inline-block;
  background-color: #EED3D3;
  color: #A92525;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.action-list-item {
  padding: 4px 15px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  border-radius: 0 !important;
  margin: 5px !important;
}

.action-list-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
}

.action-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

/* Icon styling within menu items */
.action-list-item .action-icon {
  color: #6e3894 !important;
  margin-right: 12px !important;
}

.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row,
[dir="rtl"] .form-control,
[dir="rtl"] .contact-section-title {
  text-align: end;
}

[dir="rtl"] .accordion-header,
[dir="rtl"] .modal-footer {
  flex-direction: row-reverse;
}


.badge-user {
  background-color: #D3DFCE;
  color: #255F0B;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  transition: all 0.2s ease;
}
</style>