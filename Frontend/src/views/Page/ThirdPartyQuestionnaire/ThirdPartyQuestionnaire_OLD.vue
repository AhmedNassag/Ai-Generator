<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="this.$t('thirdpartyquestionnaire.RISK_MGMT')"
    :mainSubPage="this.$t('thirdpartyquestionnaire.THIRD_PARTY')"
    :subPage="this.$t('thirdpartyquestionnaire.ASSESSMENTS')"
    :titlePage="this.$t('thirdpartyquestionnaire.ASSESSMENTS')" v-permission:show>
    <!-- Slot for rendering the DataTable -->
    <div v-permission:update v-permission:delete></div>

    <template #datatable>
      <DataTable ref="table" v-permission:show id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>

        <!-- <span class="badge bg-primary me-2">{{ item?.assessment?.name }}</span> -->

        <template #profile_name="{ item }"><span class="badge bg-primary me-2">{{
          item?.request?.profile?.third_party_name
        }}</span>
        </template>
        <template #templatename="{ item }">
          <span class="badge bg-primary me-2">{{
            item?.assessment?.name
          }}</span>
        </template>
        <template #createdat="{ item }">
          {{ formatDate(item?.created_at) }}
        </template>
        <template #addAction="{ item }">
          <li v-permission:viewAssessment>
            <a @click="openViewModal(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="icofont icofont-eye me-2"></i>
              {{ $t("thirdpartyquestionnaire.view") }}
            </a>
          </li>
          <li v-permission:sendAssessment v-if="
            item.contact_questionnaire_answers.length <= 0 &&
            canSendAssessmentButton
          ">
            <a class="dropdown-item text-warning" href="javascript:void(0)" @click="sendAssessment(item)">
              <i class="icofont icofont-paper-plane me-2"></i>
              {{ $t("thirdpartyquestionnaire.sendAssessment") }}
            </a>
          </li>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <!-- Edit assessment dialog -->
  <v-dialog v-model="editAssessmentDialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h6">
          {{ $t("thirdpartyquestionnaire.editAssessment") }}
        </h1>
        <v-btn icon @click="editAssessmentDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form>
          <v-label>{{ $t("thirdpartyquestionnaire.assessmentName") }}</v-label>
          <v-text-field v-model="newItem.name" required></v-text-field>

          <v-label>{{ $t("thirdpartyquestionnaire.instructions") }}</v-label>
          <v-textarea v-model="newItem.instructions" rows="2"></v-textarea>

          <v-label>{{ $t("thirdpartyquestionnaire.assessment") }}</v-label>
          <v-select id="Assessments" v-model="newItem.assessment_id" :options="assessmentsData"
            placeholder="Select assessment" :reduce="(option) => option.id" label="name" clearable></v-select>

          <v-label class="my-2">{{
            $t("thirdpartyquestionnaire.contacts")
          }}</v-label>
          <v-select id="Contacts" v-model="newItem.contact_id" :options="contactsData" placeholder="Select Contact"
            :reduce="(option) => option.id" label="name" clearable></v-select>

          <!-- <v-checkbox v-model="newItem.all_questions_mandatory"  label="All Questions Mandatory"></v-checkbox> -->
          <v-checkbox v-model="isMandatory" label="All Questions Mandatory"></v-checkbox>
        </v-form>
      </v-card-text>

      <v-card-actions class="d-flex justify-end pa-4">
        <v-btn color="blue-darken-2" variant="elevated" size="large" rounded="lg" class="text-white"
          @click="updateAssessment">
          <v-icon left>mdi-check-circle</v-icon>
          {{ $t("thirdpartyquestionnaire.update") }}
        </v-btn>

        <v-btn color="red-darken-2" variant="elevated" size="large" rounded="lg" class="text-white ml-2"
          @click="editAssessmentDialog = false">
          <v-icon left>mdi-close-circle</v-icon>
          {{ $t("thirdpartyquestionnaire.close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- View assessment dialog -->
  <v-dialog v-model="viewAssessmentDialog" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5 my-3">{{
          $t("thirdpartyquestionnaire.assessmentDetails")
        }}</span>
      </v-card-title>
      <v-card-text>
        <v-expansion-panels v-model="expandedPanels">
          <!-- Questionnaire Information Section -->
          <v-expansion-panel>
            <v-expansion-panel-title class="text-blue">{{
              $t("thirdpartyquestionnaire.assessmentInformation")
            }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="row mb-2">
                <div class="col">
                  <p>
                    <b>{{ $t("thirdpartyquestionnaire.name") }} :</b>
                    {{ viewAssessmentData.name }}
                  </p>
                </div>
                <div class="col">
                  <p>
                    <b>{{ $t("thirdpartyquestionnaire.instructions") }} :</b>
                    {{ viewAssessmentData.instructions }}
                  </p>
                </div>
              </div>
              <hr />
              <div class="row mb-2">
                <div class="col">
                  <p>
                    <b>{{ $t("thirdpartyquestionnaire.thirdPartyName") }} :</b>
                    {{ viewAssessmentData.request?.profile?.third_party_name }}
                  </p>
                </div>
                <div class="col">
                  <p>
                    <b>{{ $t("thirdpartyquestionnaire.assessmentName") }}:</b>
                    {{ viewAssessmentData.assessment?.name }}
                  </p>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Contacts Section -->
          <v-expansion-panel>
            <v-expansion-panel-title class="text-blue">{{
              $t("thirdpartyquestionnaire.contacts")
            }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="row">
                <div class="col">
                  <p>
                    <b>{{ $t("thirdpartyquestionnaire.name") }} :</b>
                    {{ viewAssessmentData.contact?.name }}
                  </p>
                </div>
                <div class="col">
                  <p>
                    <b>{{ $t("thirdpartyquestionnaire.email") }} :</b>
                    {{ viewAssessmentData.contact?.email }}
                  </p>
                </div>
                <div class="col">
                  <p>
                    <b>{{ $t("thirdpartyquestionnaire.phone") }} :</b>
                    {{ viewAssessmentData.contact?.phone }}
                  </p>
                </div>
              </div>
              <hr />
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Questions Section -->
          <v-expansion-panel>
            <v-expansion-panel-title class="text-blue">{{
              $t("thirdpartyquestionnaire.questions")
            }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-for="(question, index) in viewAssessmentData.assessment
                ?.template?.questions" :key="index" class="mb-2">
                <p>
                  <b>{{ $t("thirdpartyquestionnaire.question") }}
                    {{ index + 1 }}:</b>
                  <span v-html="question.question"></span>
                </p>
                <hr />
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeViewAssessmentDialog">{{
          $t("thirdpartyquestionnaire.close")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="loading" persistent width="300">
    <v-card class="d-flex flex-column align-center justify-center pa-4">
      <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      <p class="mt-4">
        {{ $t("thirdpartyquestionnaire.theAssessmentIsBeingSent...") }}
      </p>
    </v-card>
  </v-dialog>
</template>

<script>
// Importing necessary components and API modules
import thirdpartyquestionnaire from "@/API/ThirdPartyQuestionnaire/ThirdPartyQuestionnaire";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Assessment from "@/API/Assessment/Assessment";
import thirdpartyrequest from "@/API/ThirdPartyRequest/ThirdPartyRequest";
import vSelect from "vue-select";
import axios from "axios";
import SystemSetting from "@/API/SystemSetting/SystemSetting";
import Auth from "@/API/Auth";
import Department from "@/API/Department/Department";
export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    vSelect,
  },

  setup() {
    // Initialize API and other required properties
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
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      assessmentApi,
      thirdpartyrequestApi,
      systemSetting,
      departmentApi
    };
  },

  async mounted() {
    // Recipient of third part
    const requestReccipient = await this.systemSetting.getAll({
      filter: `type|thirdPartyRequests|=`,
    });
    this.requestReccipient = requestReccipient[0];

    if (this.requestReccipient.receiver_type == "department manager") {
      // await axios
      //   .get(
      //     `/department/Managers/${this.requestReccipient.department_id}`
      //   )
      //   .then((response) => {
      //     this.departmentManagers = response.data;
      //   });

      await this.departmentApi.getDepartmentManagers(this.requestReccipient.department_id).then((response) => {
        this.departmentManagers = response.data;
      });
    } else {
      this.departmentManagers = this.requestReccipient.user_id;
    }
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      form: {},
      editAssessmentDialog: false,
      viewAssessmentDialog: false,
      expandedPanels: [0],

      assessmentsData: [],
      contactsData: [],
      viewAssessmentData: [],
      loading: false,

      requestReccipient: null,
      departmentManagers: [],
    };
  },

  computed: {
    isMandatory: {
      get() {
        return this.newItem.all_questions_mandatory === "true";
      },
      set(value) {
        this.newItem.all_questions_mandatory = value ? "true" : "false";
      },
    },

    canSendAssessmentButton() {
      if (Array.isArray(this.departmentManagers)) {
        return this.departmentManagers.some(
          (manager) => manager.id === Auth.USER.id
        );
      } else {
        return this.departmentManagers === Auth.USER.id;
      }
    },

    hideActions() {
      return (row) => {
        // const cannotEditOrDelete = !this.departmentManagers.includes(Auth.USER.id);
        // const cannotEditOrDelete = !this.departmentManagers.some(manager => manager.id === Auth.USER.id);

        // row.contact_questionnaire_answers.length > 0
        const cannotEditOrDelete = Array.isArray(this.departmentManagers)
          ? !this.departmentManagers.some(
            (manager) => manager.id === Auth.USER.id
          )
          : this.departmentManagers !== Auth.USER.id;

        return {
          edit:
            cannotEditOrDelete || row.contact_questionnaire_answers.length > 0,
          delete:
            cannotEditOrDelete || row.contact_questionnaire_answers.length > 0,
        };
      };
    },
  },

  created() {
    // Initialize the table columns and form fields when the component is created
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

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("thirdpartyquestionnaire.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t(
          "thirdpartyquestionnaire.please_enter_your_full_name"
        ),
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("thirdpartyquestionnaire.email"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: this.$t(
          "thirdpartyquestionnaire.please_enter_a_valid_email_address"
        ),
        col: 6,
      },
      {
        type: "options", // Dropdown/select field
        name: "myOptions",
        label: this.$t("thirdpartyquestionnaire.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t(
          "thirdpartyquestionnaire.select_options_to_customize_for_the_client"
        ),
      },
      {
        name: "terms",
        label: this.$t("thirdpartyquestionnaire.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: this.$t(
          "thirdpartyquestionnaire.you_must_accept_the_terms_and_conditions"
        ),
        col: 6,
      },
      {
        name: "description",
        label: this.$t("thirdpartyquestionnaire.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide a description of the project.",
        col: 12,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      // this.isFlipped = true;  // Show the form
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

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },

    // Set the item data for editing
    async editItem(data) {
      this.newItem = JSON.parse(JSON.stringify(data)); // deep copy
      // this.newItem = data;  // Set the current item to edit
      // this.isFlipped = true; // Show the form for editing
      this.editAssessmentDialog = true;
      const assessmentsResponse = await this.assessmentApi.getAll({
        select: "id|name",
      });
      this.assessmentsData = assessmentsResponse;

      const requestData = await this.thirdpartyrequestApi.show(
        data.request_id,
        {
          with: "profile.contacts",
        }
      );
      this.contactsData = requestData?.profile?.contacts || [];
    },

    async updateAssessment() {
      try {
        const response = await this.api.update({
          id: this.newItem.id,
          name: this.newItem.name,
          instructions: this.newItem.instructions,
          request_id: this.newItem.request_id,
          assessment_id: this.newItem.assessment_id,
          contact_id: this.newItem.contact_id,
          all_questions_mandatory: this.newItem.all_questions_mandatory,
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
      this.expandedPanels = [0];
      this.viewAssessmentDialog = false;
    },

    // sendAssessment(item) {
    //   if (item.question_ids.length == 0) {
    //     this.api.poup(
    //       {
    //         status: false,
    //         message: "You Can't send assessment without question !",
    //       },
    //       "Error"
    //     );
    //     return;
    //   }
    //   this.loading = true;
    //   axios
    //     .post(`/third-party-questionnaire/sendEmail/${item.id}`, {
    //       baseurl: window.location.origin,
    //     })
    //     .then((response) => {
    //       this.$refs.table.refreshTable();
    //       this.api.poup(response, "Send Assessment Successfuly !");
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //       this.api.poup(
    //         {
    //           status: false,
    //           message:
    //             error.response?.data?.message ||
    //             error.response?.data?.errors[0],
    //         },
    //         "Error"
    //       );
    //     })
    //     .finally(() => {
    //       this.loading = false;
    //     });
    // },

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
.v-expansion-panel {
  background-color: transparent !important;
  color: black !important;
}

.v-expansion-panel-text {
  border-left: 0px solid #cccccc !important;
}

/* Scoped styles for the component */
</style>
