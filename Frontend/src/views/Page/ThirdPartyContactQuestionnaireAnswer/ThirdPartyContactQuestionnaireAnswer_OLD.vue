<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('thirdpartycontactquestionnaireanswer.RISK_MGMT')"
    :mainSubPage="this.$t('thirdpartycontactquestionnaireanswer.THIRD_PARTY')"
    :subPage="
      this.$t('thirdpartycontactquestionnaireanswer.ASSESSMENTS_RESULTS')
    "
    :titlePage="
      this.$t('thirdpartycontactquestionnaireanswer.ASSESSMENTS_RESULTS')
    "
    v-permission:show
  >
    <!-- Slot for rendering the DataTable -->
    <div v-permission:update v-permission:delete></div>

    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :hideActionsColumn="true"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> My - {{ item.name }} </template>

        <template
          #third_party_profile="{ item }"
        >
          {{ item?.contact?.profile?.third_party_name }}</template
        >
        <template #contact_name="{ item }">
          {{ item?.contact?.name }}</template
        >
        <template
          #assessmentname="{ item }"
        >
          {{ item?.questionnaire?.name }}</template
        >

        <template #send_date="{ item }">
          {{ formatDate(item.send_date) }}</template
        >
        <template
          #submission_date="{ item }"
        >
          {{
            formatDate(item.submission_date) ?? this.$t("thirdpartycontactquestionnaireanswer.not_submitted_yet")
          }}</template
        >

        <template
          #percentage_complete="{ item }"
        >
          {{
            item.percentage_complete ? item.percentage_complete + "%" : "-"
          }}</template
        >

        <template #status="{ item }">
          <span
            v-if="item.status === 'complete'"
            class="badge text-bg-success w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.complete") }}</span
          >
          <span
            v-else
            class="badge text-bg-info w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.incomplete") }}</span
          >
        </template>

        <template
          #submission_type="{ item }"
        >
          <span
            v-if="item.submission_type === 'complete'"
            class="badge text-bg-success w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.complete") }}</span
          >
          <span
            v-else
            class="badge text-bg-warning w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.draft") }}</span
          >
        </template>

        <template
          #approved_status="{ item }"
        >
          <span
            v-if="item.approved_status === 'yes'"
            class="badge text-bg-success w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.accepted") }}</span
          >

          <span
            v-else-if="item.approved_status === 'remediation'"
            class="badge text-bg-primary w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.remediation") }}</span
          >

          <span
            v-else-if="item.approved_status === 'no'"
            class="badge text-bg-danger w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.rejected") }}</span
          >

          <span
            v-else
            class="badge text-bg-warning w-60"
            style="display: block; margin: auto; font-size: 0.8rem"
            >{{ $t("thirdpartycontactquestionnaireanswer.pending") }}</span
          >
        </template>

        <template #addAction="{ item }">
          <li v-if="item.submission_type == 'complete'" v-permission:viewQuestionnaireAnswer>
            <a
              @click="openModal(item)"
              class="dropdown-item text-secondary"
              href="javascript:void(0)"
            >
              <i class="icofont icofont-eye me-2"></i> {{ $t("thirdpartycontactquestionnaireanswer.view") }}
            </a>
          </li>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      ></Form>
    </template>
  </main-page>

  <!-- View request modal -->
  <v-dialog v-model="viewModal" max-width="1000px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h1 class="text-h6">{{ $t("thirdpartycontactquestionnaireanswer.assessment_result") }}</h1>
        <v-btn icon @click="closViewModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-stepper v-model="step">
          <!-- Header Steps -->
          <v-stepper-header>
            <v-stepper-item :value="1" :complete="step > 1">
              {{ $t("thirdpartycontactquestionnaireanswer.questionnaire_answer") }}</v-stepper-item
            >
            <v-stepper-item :value="2" :complete="step > 2">
              {{ $t("thirdpartycontactquestionnaireanswer.risk_assessment") }}</v-stepper-item
            >
            <v-stepper-item :value="3" :complete="step > 3">
              {{ $t("thirdpartycontactquestionnaireanswer.remediation_note") }}</v-stepper-item
            >
          </v-stepper-header>

          <!-- Steps Content -->
          <v-window v-model="step">
            <v-window-item :value="1">
              <v-card flat>
                <v-card-title>{{ $t("thirdpartycontactquestionnaireanswer.questionnaire_answer") }}</v-card-title>
                <v-card-text>
                  <div
                    v-for="(
                      result, index
                    ) in assessmentResultData.contact_questionnaire_answer_results"
                    :key="index"
                  >
                    <div class="row mb-2 contact-fields">
                      <div class="col-md-6">
                        <p>
                          <b>{{ $t("thirdpartycontactquestionnaireanswer.question") }} {{ index + 1 }}:</b>
                          <span v-html="result.question.question"></span>
                        </p>
                      </div>
                      <div class="col-md-2">
                        <p>
                          <b>{{ $t("thirdpartycontactquestionnaireanswer.answer") }}:</b>
                          {{
                            result.question.answers.find(
                              (answer) => answer.id === result.answer_id
                            )?.text || "N/A"
                          }}
                        </p>
                      </div>
                      <div class="col-md-4">
                        <p><b>{{ $t("thirdpartycontactquestionnaireanswer.comment") }}:</b> {{ result.comment ?? "N/A" }}</p>
                      </div>
                    </div>
                    <hr />
                  </div>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                  <v-btn color="primary" @click="step = 2">{{ $t("thirdpartycontactquestionnaireanswer.next") }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-window-item>

            <v-window-item :value="2">
              <v-card flat>
                <v-card-title>{{ $t("thirdpartycontactquestionnaireanswer.risk_assessment") }}</v-card-title>
                <v-card-text>
                  <v-expansion-panels v-model="expandedPanels">
                    <v-expansion-panel title="Analysis">
                      <v-expansion-panel-text>
                        <v-table>
                          <thead>
                            <tr>
                              <th class="text-white">{{ $t("thirdpartycontactquestionnaireanswer.type") }}</th>
                              <th class="text-white">{{ $t("thirdpartycontactquestionnaireanswer.total_number") }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{{ $t("thirdpartycontactquestionnaireanswer.all_risks") }}</td>
                              <td>{{ allRisks.length || 0 }}</td>
                            </tr>
                            <tr>
                              <td>{{ $t("thirdpartycontactquestionnaireanswer.added_risks") }}</td>
                              <td>{{ addedRisks.length || 0 }}</td>
                            </tr>
                            <tr>
                              <td>{{ $t("thirdpartycontactquestionnaireanswer.pending_risks") }}</td>
                              <td>{{ pendingRisks.length || 0 }}</td>
                            </tr>
                            <tr>
                              <td>{{ $t("thirdpartycontactquestionnaireanswer.rejected_risks") }}</td>
                              <td>{{ rejectedRisks.length || 0 }}</td>
                            </tr>
                            <tr>
                              <td>{{ $t("thirdpartycontactquestionnaireanswer.risk_factor") }}</td>
                              <td>{{ riskFactor || 0 }} / 25</td>
                            </tr>
                          </tbody>
                        </v-table>
                      </v-expansion-panel-text>
                    </v-expansion-panel>

                    <v-expansion-panel title="Potential Risks">
                      <v-expansion-panel-text>
                        <v-row>
                          <v-col cols="12">
                            <v-table dense>
                              <thead>
                                <tr>
                                  <th class="text-left text-white">{{ $t("thirdpartycontactquestionnaireanswer.answer") }}</th>
                                  <th class="text-left text-white">
                                    {{ $t("thirdpartycontactquestionnaireanswer.risk_subject") }}
                                  </th>
                                  <th class="text-left text-white">
                                    {{ $t("thirdpartycontactquestionnaireanswer.likelihood") }}
                                  </th>
                                  <th class="text-left text-white">{{ $t("thirdpartycontactquestionnaireanswer.impact") }}</th>
                                  <!-- <th class="text-left text-white">{{ $t("thirdpartycontactquestionnaireanswer.owner") }}</th> -->
                                  <th class="text-left text-white">
                                    {{ $t("thirdpartycontactquestionnaireanswer.created_at") }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="risk in formattedRisks"
                                  :key="risk.id"
                                >
                                  <td>{{ risk.answer_text || "N/A" }}</td>
                                  <td>{{ risk.risk_subject || "N/A" }}</td>
                                  <td>{{ risk.likelihood_id || "N/A" }}</td>
                                  <td>{{ risk.impact_id || "N/A" }}</td>
                                  <!-- <td>{{ risk.owner.full_name || "N/A" }}</td> -->
                                  <td>{{ formatDate(risk.created_at) }}</td>
                                </tr>
                              </tbody>
                            </v-table>
                          </v-col>

                          <!-- <v-col v-for="p_risk in pendingRisks" :key="p_risk.id" cols="12" md="6">
                            <v-card>
                              <v-card-text>
                                <v-form>
                                  <v-row>
                                    <v-col cols="12">
                                      <v-text-field v-model="p_risk.risk_subject" label="Subject"></v-text-field>
                                    </v-col>

                                    <v-col cols="12">
                                      <v-select v-model="p_risk.risk_scoring_method_id" :items="data.riskScoringMethods"
                                        item-title="name" item-value="id" label="Risk Scoring Method">
                                      </v-select>
                                    </v-col>

                                    <v-col cols="12">
                                      <v-select v-model="p_risk.likelihood_id" :items="data.likelihoods"
                                        item-title="name" item-value="id" label="Current Likelihood">
                                      </v-select>
                                    </v-col>

                                    <v-col cols="12">
                                      <v-select v-model="p_risk.impact_id" :items="data.impacts" item-title="name"
                                        item-value="id" label="Current Impact">
                                      </v-select>
                                    </v-col>

                                    <v-col cols="12">
                                      <v-select v-model="p_risk.owner_id" :items="data.enabledUsers"
                                        item-title="username" item-value="id" label="Owner">
                                      </v-select>
                                    </v-col>

                                    <v-col cols="12">
                                      <v-select v-model="p_risk.assets_ids" :items="data.assets" item-title="name"
                                        item-value="id" label="Affected Assets" multiple>
                                      </v-select>
                                    </v-col>

                                    <v-col cols="12">
                                      <v-select v-model="p_risk.tags_ids" :items="data.tags" item-title="tag"
                                        item-value="id" label="Tags" multiple>
                                      </v-select>
                                    </v-col>

                                    <v-col cols="12">
                                      <v-select v-model="p_risk.framework_controls_ids" :items="data.migration_controls"
                                        item-title="name" item-value="id" label="Controls">
                                      </v-select>
                                    </v-col>
                                  </v-row>
                                </v-form>

                              </v-card-text>
                            </v-card>
                          </v-col> -->
                        </v-row>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <div class="d-flex justify-center mt-3">
                    <v-btn
                      v-permission:approveRequestAssessment
                      color="success"
                      class="mx-2"
                      v-if="
                        canTakeActionButton &&
                        assessmentResultData.approved_status != 'yes'
                      "
                      @click="updateStatus(assessmentResultData.id, 'yes')"
                    >
                      <v-icon left>mdi-check</v-icon> {{ $t("thirdpartycontactquestionnaireanswer.approve") }}
                    </v-btn>
                    <v-btn
                      v-permission:refuseRequestAssessment
                      color="error"
                      class="mx-2"
                      v-if="
                        canTakeActionButton &&
                        assessmentResultData.approved_status != 'no'
                      "
                      @click="updateStatus(assessmentResultData.id, 'no')"
                    >
                      <v-icon left>mdi-close</v-icon> {{ $t("thirdpartycontactquestionnaireanswer.reject") }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      @click="step = 3"
                      class="mx-2"
                      v-if="canTakeActionButton"
                    >
                      <v-icon left>mdi-refresh</v-icon> {{ $t("thirdpartycontactquestionnaireanswer.remediation") }}
                    </v-btn>
                  </div>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                  <v-btn @click="step = 1">{{ $t("thirdpartycontactquestionnaireanswer.previous") }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-window-item>

            <v-window-item :value="3">
              <v-card flat>
                <v-card-title>{{ $t("thirdpartycontactquestionnaireanswer.remediation_note") }}</v-card-title>
                <v-card-text>
                  <ckeditor
                    v-model="remediationNote"
                    :editor="editor"
                    :config="editorConfig"
                  ></ckeditor>
                </v-card-text>
                <v-card-actions class="d-flex justify-end">
                  <v-btn
                    v-permission:sendRemediation
                    color="primary"
                    v-if="canTakeActionButton"
                    @click="
                      updateStatus(assessmentResultData.id, 'remediation')
                    "
                    >{{ $t("thirdpartycontactquestionnaireanswer.save_and_send") }}</v-btn
                  >
                  <v-btn color="primary" @click="step = 2">{{ $t("thirdpartycontactquestionnaireanswer.previous") }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-window-item>
          </v-window>
        </v-stepper>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="loading" persistent width="300">
    <v-card class="d-flex flex-column align-center justify-center pa-4">
      <v-progress-circular
        indeterminate
        color="primary"
        size="50"
      ></v-progress-circular>
      <p class="mt-4">{{ $t("thirdpartycontactquestionnaireanswer.theAssessmentIsBeingSent...") }}</p>
    </v-card>
  </v-dialog>
</template>

<script>
// Importing necessary components and API modules
import thirdpartycontactquestionnaireanswer from "@/API/ThirdPartyContactQuestionnaireAnswer/ThirdPartyContactQuestionnaireAnswer";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import axios from "axios";

import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import SystemSetting from "@/API/SystemSetting/SystemSetting";
import Auth from "@/API/Auth";
import Department from "@/API/Department/Department";
export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    ckeditor: Ckeditor,
  },

  setup() {
    // Initialize API and other required properties
    const api = new thirdpartycontactquestionnaireanswer();
    const departmentApi = new Department();
    const apiParams = {
      with: [
        "contact.profile",
        "questionnaire.risks",
        "questionnaire.questions",
        "contactQuestionnaireAnswerResults.question",
      ],
    };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    const systemSetting = new SystemSetting();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
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

    // Fetch roles
    //this.roles = await this.roleApi.getAll({ select: "id|name" });

    // Update options dynamically in the form field
    //const myOptionsField = this.fromFields.find((field) => field.name === "myOptions");
    //myOptionsField.options = this.roles.map((role) => ({
    //id: role.id,
    //name: role.name,
    //}));
  },

  computed: {
    allRisks() {
      return this.assessmentResultData?.questionnaire?.risks || [];
    },
    addedRisks() {
      return this.allRisks.filter((risk) => risk.status === "added");
    },
    pendingRisks() {
      return this.allRisks.filter((risk) => risk.status === "pending");
    },
    rejectedRisks() {
      return this.allRisks.filter((risk) => risk.status === "rejected");
    },
    riskScores() {
      return (
        this.assessmentResultData?.questionnaire?.risks?.map(
          (risk) => risk.risk_score
        ) || []
      );
    },
    riskFactor() {
      return this.riskScores.length ? Math.max(...this.riskScores) : 0;
    },

    formattedRisks() {
      return this.allRisks.map((risk) => {
        const matchingQuestion =
          this.assessmentResultData.questionnaire.questions.find((question) =>
            question.answers.some((answer) => answer.id === risk.answer_id)
          );

        const answerText = matchingQuestion
          ? matchingQuestion.answers.find(
              (answer) => answer.id === risk.answer_id
            )?.text
          : "N/A";

        return {
          ...risk,
          answer_text: answerText,
        };
      });
    },

    canTakeActionButton() {
      if (Array.isArray(this.departmentManagers)) {
        return this.departmentManagers.some(
          (manager) => manager.id === Auth.USER.id
        );
      } else {
        return this.departmentManagers === Auth.USER.id;
      }
    },
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      assessmentResultData: [],
      viewModal: false,

      step: 1,
      results: [],
      expandedPanels: [0],
      data: {},
      loading: false,
      remediationNote: "",

      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },

      requestReccipient: null,
      departmentManagers: [],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id:'third_party_profile',
        title: this.$t(
          "thirdpartycontactquestionnaireanswer.third_party_profile"
        ),
        data: null,
        defaultContent: "N/A",
      },
      {
        id:'contact_name',
        title: this.$t("thirdpartycontactquestionnaireanswer.contact_name"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id:'assessmentname',
        title: this.$t("thirdpartycontactquestionnaireanswer.assessmentname"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id:'status',
        title: this.$t("thirdpartycontactquestionnaireanswer.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id:'submission_type',
        title: this.$t("thirdpartycontactquestionnaireanswer.submission_type"),
        data: "submission_type",
        defaultContent: "N/A",
      },
      {
        id:'percentage_complete',
        title: this.$t(
          "thirdpartycontactquestionnaireanswer.percentage_complete"
        ),
        data: "percentage_complete",
        defaultContent: "N/A",
      },
      {
        id:'approved_status',
        title: this.$t("thirdpartycontactquestionnaireanswer.approved_status"),
        data: "approved_status",
        defaultContent: "N/A",
      },
      {
        id:'send_date',
        title: this.$t("thirdpartycontactquestionnaireanswer.send_date"),
        data: "send_date",
        defaultContent: "N/A",
      },
      {
        id:'submission_date',
        title: this.$t("thirdpartycontactquestionnaireanswer.submission_date"),
        data: "submission_date",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("thirdpartycontactquestionnaireanswer.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your full name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("thirdpartycontactquestionnaireanswer.email"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: "Please enter a valid email address.",
        col: 6,
      },
      {
        type: "options", // Dropdown/select field
        name: "myOptions",
        label: this.$t("thirdpartycontactquestionnaireanswer.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: "Select Options to customize for the client",
      },
      {
        name: "terms",
        label: this.$t(
          "thirdpartycontactquestionnaireanswer.accept_terms_and_conditions"
        ),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: "You must accept the terms and conditions.",
        col: 6,
      },
      {
        name: "description",
        label: this.$t("thirdpartycontactquestionnaireanswer.description"),
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

    closViewModal() {
      this.viewModal = false;
      this.remediationNote = "";
      this.step = 1;
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
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

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      // this.isFlipped = true; // Show the form for editing
    },

    openModal(selectedRow) {
      this.assessmentResultData = [];
      this.assessmentResultData = { ...selectedRow };
      this.viewModal = true;
      console.log("this.assessmentResultData", this.assessmentResultData);
    },

    updateStatus(id, status) {
      if (status == "remediation") {
        this.loading = false;
      }
      console.log(`${status} action triggered id ${id}`);
      axios
        .post(`/contact-questionnaire-answer/updateStatus/${id}`, {
          approved_status: status,
          note: this.remediationNote,
          baseurl: window.location.origin, // if status == remeidation
        })
        .then((response) => {
          this.viewModal = false;
          this.$refs.table.refreshTable();
          let message =
            status === "yes"
              ? "Approved Successfully!"
              : status === "no"
              ? "Rejected Successfully!"
              : "Remediation email sent successfully!";
          this.api.poup(response, message);
        })
        .catch((error) => {
          console.log(error);
          this.api.poup(
            { status: false, message: error.response?.data?.errors[0] },
            "Error"
          );
        })
        .finally(() => {
          this.loading = false;
        });
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
