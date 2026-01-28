<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="this.$t('thirdpartyquestionnaire.RISK_MGMT')"
    :mainSubPage="this.$t('thirdpartyquestionnaire.THIRD_PARTY')"
    :subPage="this.$t('thirdpartyquestionnaire.ASSESSMENTS')"
    :titlePage="this.$t('thirdpartyquestionnaire.ASSESSMENTS')" v-permission:show>
    <div v-permission:update v-permission:delete></div>

    <template #datatable>
      <DataTable ref="table" v-permission:show id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions" :hideAddNewButton="true">
        <!-- <template #Name="{ item }">{{ item.name }} </template> -->

        <template #Name="{ item }">
          <a href="javascript:void(0)" @click="openViewModal(item)" :title="$t('thirdpartyquestionnaire.view')"
            class="text-badge">
            {{ item.name }}
          </a>
        </template>

        <template #profile_name="{ item }">
          <span class="">{{ item?.request?.profile?.third_party_name }}</span>
        </template>

        <template #templatename="{ item }">
          <span class="">{{ item?.assessment?.name }}</span>
        </template>

        <template #createdat="{ item }">
          {{ formatDate(item?.created_at) }}
        </template>

        <template #addAction="{ item }">
          <v-list-item v-permission:viewAssessment class="action-list-item" @click="openViewModal(item)">
            <template v-slot:prepend>
              <v-icon size="18">mdi-eye-outline</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t('thirdpartyquestionnaire.view') }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-permission:sendAssessment
            v-if="item.contact_questionnaire_answers.length <= 0 && canSendAssessmentButton" class="action-list-item"
            @click="sendAssessment(item)">
            <template v-slot:prepend>
              <i class="icofont icofont-paper-plane me-2"></i>
            </template>
            <v-list-item-title class="action-title">
              {{ $t('thirdpartyquestionnaire.sendAssessment') }}
            </v-list-item-title>
          </v-list-item>

        </template>
      </DataTable>
    </template>

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <EditAssessmentDialog v-model="editAssessmentDialog" :assessmentData="newItem" :assessmentsOptions="assessmentsData"
    :contactsOptions="contactsData" @update="handleUpdateAssessment" @close="editAssessmentDialog = false" />

  <ViewAssessmentDialog v-model="viewAssessmentDialog" :assessmentData="viewAssessmentData"
    @close="closeViewAssessmentDialog" />

  <v-dialog v-model="loading" persistent width="300">
    <v-card class="d-flex flex-column align-center justify-center pa-4">
      <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      <p class="mt-4">{{ $t("thirdpartyquestionnaire.theAssessmentIsBeingSent...") }}</p>
    </v-card>
  </v-dialog>
</template>

<script>
import thirdpartyquestionnaire from "@/API/ThirdPartyQuestionnaire/ThirdPartyQuestionnaire";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Assessment from "@/API/Assessment/Assessment";
import thirdpartyrequest from "@/API/ThirdPartyRequest/ThirdPartyRequest";
import SystemSetting from "@/API/SystemSetting/SystemSetting";
import Auth from "@/API/Auth";
import Department from "@/API/Department/Department";
import EditAssessmentDialog from "./EditAssessmentDialog.vue";
import ViewAssessmentDialog from "./ViewAssessmentDialog.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    EditAssessmentDialog,
    ViewAssessmentDialog,
  },

  setup() {
    const api = new thirdpartyquestionnaire();
    const thirdpartyrequestApi = new thirdpartyrequest();
    const departmentApi = new Department();
    const assessmentApi = new Assessment();
    const systemSetting = new SystemSetting();

    const apiParams = {
      with: [
        "assessment",
        "contactQuestionnaireAnswers",
        "request.profile",
        "contact",
      ],
    };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      assessmentApi,
      thirdpartyrequestApi,
      systemSetting,
      departmentApi,
    };
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      form: {},
      editAssessmentDialog: false,
      viewAssessmentDialog: false,
      assessmentsData: [],
      contactsData: [],
      viewAssessmentData: [],
      loading: false,
      requestReccipient: null,
      departmentManagers: [],
    };
  },

  computed: {
    canSendAssessmentButton() {
      if (Array.isArray(this.departmentManagers)) {
        return this.departmentManagers.some((manager) => manager.id === Auth.USER.id);
      } else {
        return this.departmentManagers === Auth.USER.id;
      }
    },

    hideActions() {
      return (row) => {
        const cannotEditOrDelete = Array.isArray(this.departmentManagers)
          ? !this.departmentManagers.some((manager) => manager.id === Auth.USER.id)
          : this.departmentManagers !== Auth.USER.id;

        return {
          edit: cannotEditOrDelete || row.contact_questionnaire_answers.length > 0,
          delete: cannotEditOrDelete || row.contact_questionnaire_answers.length > 0,
        };
      };
    },
  },

  async mounted() {
    const requestReccipient = await this.systemSetting.getAll({
      filter: `type|thirdPartyRequests|=`,
    });
    this.requestReccipient = requestReccipient[0];

    if (this.requestReccipient.receiver_type == "department manager") {
      await this.departmentApi.getDepartmentManagers(this.requestReccipient.department_id).then((response) => {
        this.departmentManagers = response.data;
      });
    } else {
      this.departmentManagers = this.requestReccipient.user_id;
    }
  },

  created() {
    this.tableColumns = [
      {
        title: this.$t("thirdpartyquestionnaire.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "profile_name",
        title: this.$t("thirdpartyquestionnaire.profile_name"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "templatename",
        title: this.$t("thirdpartyquestionnaire.templatename"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "createdat",
        title: this.$t("thirdpartyquestionnaire.createdat"),
        data: null,
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("thirdpartyquestionnaire.name"),
        type: "text",
        rules: "required",
        description: this.$t("thirdpartyquestionnaire.please_enter_your_full_name"),
        col: 6,
      },
      {
        name: "email",
        label: this.$t("thirdpartyquestionnaire.email"),
        type: "text",
        rules: "required|email",
        description: this.$t("thirdpartyquestionnaire.please_enter_a_valid_email_address"),
        col: 6,
      },
      {
        type: "options",
        name: "myOptions",
        label: this.$t("thirdpartyquestionnaire.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: this.$t("thirdpartyquestionnaire.select_options_to_customize_for_the_client"),
      },
      {
        name: "terms",
        label: this.$t("thirdpartyquestionnaire.accept_terms_and_conditions"),
        type: "checkbox",
        rules: "required",
        description: this.$t("thirdpartyquestionnaire.you_must_accept_the_terms_and_conditions"),
        col: 6,
      },
      {
        name: "description",
        label: this.$t("thirdpartyquestionnaire.description"),
        type: "textarea",
        rules: "required",
        description: "Provide a description of the project.",
        col: 12,
      },
    ];
  },

  methods: {
    openForm() {
      // this.isFlipped = true;
    },

    formatDate(date) {
      if (!date) return "N/A";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date));
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    async editItem(data) {
      this.newItem = JSON.parse(JSON.stringify(data));
      this.editAssessmentDialog = true;

      const assessmentsResponse = await this.assessmentApi.getAll({
        select: "id|name",
      });
      this.assessmentsData = assessmentsResponse;

      const requestData = await this.thirdpartyrequestApi.show(data.request_id, {
        with: "profile.contacts",
      });
      this.contactsData = requestData?.profile?.contacts || [];
    },

    async handleUpdateAssessment(updatedData) {
      try {
        const response = await this.api.update({
          id: updatedData.id,
          name: updatedData.name,
          instructions: updatedData.instructions,
          request_id: updatedData.request_id,
          assessment_id: updatedData.assessment_id,
          contact_id: updatedData.contact_id,
          all_questions_mandatory: updatedData.all_questions_mandatory,
        });
        this.api.poup(response, "Saved Successfully!");
        if (response.status == "success") {
          this.editAssessmentDialog = false;
        }
        this.$refs.table.refreshTable();
      } catch (error) {
        this.api.poup(
          error.response || { message: "An unexpected error occurred." },
          "Error"
        );
      }
    },

    async openViewModal(item) {
      this.viewAssessmentDialog = true;
      const requestData = await this.api.show(item.id, {
        with: [
          "contact",
          "questions",
          "request.profile",
          "assessment.template.questions",
        ],
      });
      this.viewAssessmentData = requestData;
    },

    closeViewAssessmentDialog() {
      this.viewAssessmentDialog = false;
    },

    async sendAssessment(item) {
      if (item.assessment?.template?.questions.length == 0) {
        this.api.poup(
          {
            status: false,
            message: "You Can't send assessment without question !",
          },
          "Error"
        );
        return;
      }

      this.loading = true;
      const response = await this.api.sendAssessment(item.id, window.location.origin);

      if (response?.status == "success") {
        this.api.poup(response, this.$t("thirdpartyAssessment.Send_Assessment_Successfuly"));
        this.loading = false;
        this.$refs.table.refreshTable();
      } else {
        this.loading = false;
        this.api.poup(
          { status: false, message: response?.message || "There is an error " },
          this.$t("thirdpartyAssessment.error")
        );
      }
    },
  },
};
</script>

<style scoped>
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

/* Scoped styles for the component */
</style>