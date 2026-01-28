<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="this.$t('thirdpartycontactquestionnaireanswer.RISK_MGMT')"
    :mainSubPage="this.$t('thirdpartycontactquestionnaireanswer.THIRD_PARTY')"
    :subPage="this.$t('thirdpartycontactquestionnaireanswer.ASSESSMENTS_RESULTS')"
    :titlePage="this.$t('thirdpartycontactquestionnaireanswer.ASSESSMENTS_RESULTS')" v-permission:show>
    <div v-permission:update v-permission:delete></div>

    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideAddNewButton="true" :hideActions="hideActions" :hideAddImportButton="true" :hideAddExportButton="true">
        <template #Name="{ item }"> My - {{ item.name }} </template>

        <template #third_party_profile="{ item }">
          <a v-if="item.submission_type == 'complete'" href="javascript:void(0)" @click="openModal(item)"
            :title="$t('thirdpartycontactquestionnaireanswer.view_requirement')" class="text-badge">
            {{ item?.contact?.profile?.third_party_name }}
          </a>

           <a v-else disabled
            :title="$t('thirdpartycontactquestionnaireanswer.view_requirement')" class="text-badge">
            {{ item?.contact?.profile?.third_party_name }}
          </a>

        </template>

        <template #contact_name="{ item }">
          {{ item?.contact?.name }}
        </template>

        <template #assessmentname="{ item }">
          {{ item?.questionnaire?.name }}
        </template>

        <template #send_date="{ item }">
          {{ formatDate(item.send_date) }}
        </template>

        <template #submission_date="{ item }">
          {{ formatDate(item.submission_date) ?? this.$t("thirdpartycontactquestionnaireanswer.not_submitted_yet") }}
        </template>

        <template #percentage_complete="{ item }">
          {{ item.percentage_complete ? item.percentage_complete + "%" : "-" }}
        </template>

        <template #status="{ item }">
          <span v-if="item.status === 'complete'" class="complete-badge"
            style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.complete") }}
          </span>
          <span v-else class="incomplete-badge" style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.incomplete") }}
          </span>
        </template>

        <template #submission_type="{ item }">
          <span v-if="item.submission_type === 'complete'" class="complete-badge"
            style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.complete") }}
          </span>
          <span v-else class="draft-badge" style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.draft") }}
          </span>
        </template>

        <template #approved_status="{ item }">
          <span v-if="item.approved_status === 'yes'" class="accepted-badge"
            style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.accepted") }}
          </span>
          <span v-else-if="item.approved_status === 'remediation'" class="remidiation-badge"
            style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.remediation") }}
          </span>
          <span v-else-if="item.approved_status === 'no'" class="refused-badge"
            style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.rejected") }}
          </span>
          <span v-else class="pending-badge" style="display: block; margin: auto; font-size: 0.8rem">
            {{ $t("thirdpartycontactquestionnaireanswer.pending") }}
          </span>
        </template>

        <template #addAction="{ item }">
          <v-list-item v-if="item.submission_type == 'complete'" v-permission:viewQuestionnaireAnswer
            class="action-list-item" @click="openModal(item)">
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

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <ViewAssessmentResultDialog v-model="viewModal" :assessmentData="assessmentResultData"
    :canTakeAction="canTakeActionButton" @close="closeViewModal" @status-updated="handleStatusUpdate" />

  <v-dialog v-model="loading" persistent width="300">
    <v-card class="d-flex flex-column align-center justify-center pa-4">
      <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      <p class="mt-4">{{ $t("thirdpartycontactquestionnaireanswer.theAssessmentIsBeingSent...") }}</p>
    </v-card>
  </v-dialog>
</template>

<script>
import thirdpartycontactquestionnaireanswer from "@/API/ThirdPartyContactQuestionnaireAnswer/ThirdPartyContactQuestionnaireAnswer";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import SystemSetting from "@/API/SystemSetting/SystemSetting";
import Auth from "@/API/Auth";
import Department from "@/API/Department/Department";
import ViewAssessmentResultDialog from "./ViewAssessmentResultDialog.vue";
import dayjs from "dayjs";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ViewAssessmentResultDialog,
  },

  setup() {
    const api = new thirdpartycontactquestionnaireanswer();
    const departmentApi = new Department();
    const systemSetting = new SystemSetting();

    const apiParams = {
      with: [
        "contact.profile",
        "questionnaire.risks",
        "questionnaire.questions",
        "contactQuestionnaireAnswerResults.question",
      ],
    };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      systemSetting,
      departmentApi,
    };
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      assessmentResultData: [],
      viewModal: false,
      loading: false,
      requestReccipient: null,
      departmentManagers: [],
    };
  },

  computed: {
    canTakeActionButton() {
      if (Array.isArray(this.departmentManagers)) {
        return this.departmentManagers.some((manager) => manager.id === Auth.USER.id);
      } else {
        return this.departmentManagers === Auth.USER.id;
      }
    },

    hideActions() {
      return (row) => {
        return {
          edit: true,
          delete: true,
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
        id: 'third_party_profile',
        title: this.$t("thirdpartycontactquestionnaireanswer.third_party_profile"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: 'contact_name',
        title: this.$t("thirdpartycontactquestionnaireanswer.contact_name"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: 'assessmentname',
        title: this.$t("thirdpartycontactquestionnaireanswer.assessmentname"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: 'status',
        title: this.$t("thirdpartycontactquestionnaireanswer.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: 'submission_type',
        title: this.$t("thirdpartycontactquestionnaireanswer.submission_type"),
        data: "submission_type",
        defaultContent: "N/A",
      },
      {
        id: 'percentage_complete',
        title: this.$t("thirdpartycontactquestionnaireanswer.percentage_complete"),
        data: "percentage_complete",
        defaultContent: "N/A",
      },
      {
        id: 'approved_status',
        title: this.$t("thirdpartycontactquestionnaireanswer.approved_status"),
        data: "approved_status",
        defaultContent: "N/A",
      },
      {
        id: 'send_date',
        title: this.$t("thirdpartycontactquestionnaireanswer.send_date"),
        data: "send_date",
        defaultContent: "N/A",
      },
      {
        id: 'submission_date',
        title: this.$t("thirdpartycontactquestionnaireanswer.submission_date"),
        data: "submission_date",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("thirdpartycontactquestionnaireanswer.name"),
        type: "text",
        rules: "required",
        description: "Please enter your full name.",
        col: 6,
      },
      {
        name: "email",
        label: this.$t("thirdpartycontactquestionnaireanswer.email"),
        type: "text",
        rules: "required|email",
        description: "Please enter a valid email address.",
        col: 6,
      },
      {
        type: "options",
        name: "myOptions",
        label: this.$t("thirdpartycontactquestionnaireanswer.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: "Select Options to customize for the client",
      },
      {
        name: "terms",
        label: this.$t("thirdpartycontactquestionnaireanswer.accept_terms_and_conditions"),
        type: "checkbox",
        rules: "required",
        description: "You must accept the terms and conditions.",
        col: 6,
      },
      {
        name: "description",
        label: this.$t("thirdpartycontactquestionnaireanswer.description"),
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

    closeViewModal() {
      this.viewModal = false;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    formatDate(date) {
      if (!date) return "N/A";
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    },

    editItem(data) {
      this.newItem = data;
    },

    openModal(selectedRow) {
      this.assessmentResultData = { ...selectedRow };
      this.viewModal = true;
    },

    async handleStatusUpdate({ id, status, note }) {
      if (status === "remediation") {
        this.loading = true;
      }

      try {
        const formdata = {
          approved_status: status,
          note: note,
          baseurl: window.location.origin,
        }

        const response = await this.api.updatestatus(id, formdata);


        this.viewModal = false;
        this.$refs.table.refreshTable();

        let message =
          status === "yes"
            ? "Approved Successfully!"
            : status === "no"
              ? "Rejected Successfully!"
              : "Remediation email sent successfully!";

        this.api.poup(response, message);
      } catch (error) {
        console.log(error);
        this.api.poup(
          { status: false, message: error.response?.data?.errors[0] },
          "Error"
        );
      } finally {
        this.loading = false;
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

.remidiation-badge {
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

.accepted-badge {
  display: inline-block;
  background-color: #D3DFCE;
  color: #255F0B;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.complete-badge {
  display: inline-block;
  background-color: #D3DFCE;
  color: #255F0B;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.incomplete-badge {
  display: inline-block;
  background-color: #D3E4F7;
  color: #1565C0;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

.draft-badge {
  display: inline-block;
  background-color: #FFF4E5;
  color: #E65100;
  border-radius: 15px;
  padding: 3px 10px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}

/* Scoped styles for the component */
</style>