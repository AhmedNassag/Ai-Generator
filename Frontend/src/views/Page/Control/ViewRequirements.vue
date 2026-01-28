<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'Governance'"
    :mainSubPage="'Regulator'"
    :subPage="'Control / View requirements'"
    :titlePage="'Requirement'"
    Regulator
    v-permission:show
  >
    <div v-permission:update v-permission:destroy></div>
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :linkRequirement="openLinkRequirementModal"
        :hideLinkRequirementButton="false"
        :hideActions="hideActions"
      >
        <template #name="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            <a
              style="color: #6e3894; cursor: pointer"
              href="javascript:void(0)"
              @click="openDetailsModal(item)"
              :title="$t('requirement.view_requirement')"
            >
              {{ item.name }}
            </a>
          </div>
        </template>
        <!-- <template #description="{ item }">
          <div v-html="item.description"></div>
        </template> -->
        <template #frameworks="{ item }">
          <span v-if="item.frameworks && item.frameworks.length">
            <span style="font-size: 13px" class="badge bg-info text-white m-1">
              {{ getFrameworkName(item.frameworks[0]?.framework_id) }}
              <span v-if="item.frameworks.length > 1">
                +{{ item.frameworks.length - 1 }}
              </span>
            </span>
          </span>
        </template>

        <template #controls="{ item }">
          <span v-if="item.control_id && item.control_id.length">
            <span
              style="font-size: 13px; cursor: pointer"
              class="badge bg-info text-white text-light m-1 rounded-pill"
              @click="openControlsModal(item)"
              :title="'Click to view controls'"
              >{{ item.control_id.length }}</span
            >
          </span>
          <span v-else class="text-muted" style="font-size: 12px">0</span>
        </template>

        <template #created_at="{ item }">
          <span>{{ formatDate(item.created_at) }}</span>
        </template>

        <template #responsible="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            <span
              class="user-avatar"
              :title="
                getResponsibleName(item.responsible_type, item.responsible_id)
              "
              style="cursor: default"
            >
              {{
                getUserInitials(
                  getResponsibleName(item.responsible_type, item.responsible_id)
                )
              }}
            </span>
          </div>
        </template>

        <template #responsible_type="{ item }">
          <span>{{ formatResponsibleType(item.responsible_type) }}</span>
        </template>

        <template #evidence_needed_to_approve="{ item }">
          <span
            class="text-muted"
            style="font-size: 12px"
            v-if="
              item?.evidences.length == 0 || getUnapprovedEvidences(item) == 0
            "
          >
            {{ $t("requirement.no_evidences") }}
          </span>
          <span
            v-else
            style="font-size: 14px"
            class="badge text-bg-danger text-light m-1 rounded-pill"
          >
            {{ getUnapprovedEvidences(item) }}
          </span>
        </template>

        <template #addAction="{ item }">
          <v-list-item @click="confirmUnlink(item.id)" class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-link-off</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("Unlink") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item @click="viewEvidences(item.id)" class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("Evidences") }}
            </v-list-item-title>
          </v-list-item>
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
        class="form-container"
      >
        <!-- Framework selection -->
        <template #framework_id="{ item }">
          <div class="framework-section">
            <div class="row">
              <div class="col-12 mb-3">
                <div class="form-group">
                  <label class="text-lg font-medium">{{
                    $t("controlrequirement.Frameworks")
                  }}</label>
                  <v-select
                    label="title"
                    class="frameworks"
                    :options="frameworkList"
                    v-model="selectedFrameworks"
                    :reduce="(item) => item.id"
                    multiple
                    @update:modelValue="GetControls"
                    disabled
                  />
                </div>
              </div>

              <!-- Controls selection -->
              <div
                v-for="framework in selectedFrameworks"
                :key="framework"
                class="col-6 mb-3"
              >
                <div class="form-group">
                  <label class="text-lg font-medium"
                    >Controls for {{ getFrameworkName(framework) }}</label
                  >
                  <v-select
                    label="short_name"
                    class="Controls"
                    :options="frameworkControls[framework] || []"
                    v-model="selectedControls[framework]"
                    multiple
                    @update:modelValue="validateControlSelection"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Responsible type selection -->
        <template #responsible_type="{ item }">
          <div class="col-12 mb-3">
            <label class="text-lg font-medium mb-2">{{
              $t("controlrequirement.Responsabile")
            }}</label>
            <div class="radio-group">
              <label class="rdiobox">
                <input
                  value="user"
                  v-model="newItem.responsible_type"
                  type="radio"
                />
                <span>{{ $t("controlrequirement.Users") }}</span>
              </label>
              <label class="rdiobox">
                <input
                  value="department_manager"
                  v-model="newItem.responsible_type"
                  type="radio"
                />
                <span>{{ $t("controlrequirement.department_manager") }}</span>
              </label>
              <label class="rdiobox">
                <input
                  value="team"
                  v-model="newItem.responsible_type"
                  type="radio"
                />
                <span>{{ $t("controlrequirement.Team") }}</span>
              </label>
            </div>
          </div>
        </template>

        <!-- User selection -->
        <template #users="{ item }">
          <div
            class="col-12 mb-3"
            v-if="newItem.responsible_type == 'department_manager'"
          >
            <div class="form-group">
              <label class="text-lg font-medium">{{ selectLabel }}</label>
              <v-select
                :label="'name'"
                class="positions"
                :options="departmentsData"
                v-model="newItem.department_id"
                :reduce="(item) => item.id"
                @update:modelValue="updateDepartmentUsers"
              />
            </div>
          </div>
          <div class="col-12 mb-3">
            <div class="form-group">
              <label class="text-lg font-medium">{{ selectLabel }}</label>
              <v-select
                :label="
                  newItem.responsible_type === 'user' ? 'full_name' : 'name'
                "
                class="positions"
                :options="filteredOptions"
                v-model="newItem.responsible_id"
                :reduce="(item) => item.id"
                @update:modelValue="updateSelectedUsers"
              />
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <div v-if="requirementDetailsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 800px; max-height: 85vh">
      <div class="modal-header">
        <h5 class="modal-title text-truncate" style="max-width: 80%">
          {{ requirementData.name }}
        </h5>
        <button
          @click="closeDetailsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" class="form-label"
              >{{ $t("requirement.description") }} :
            </label>
            <p>{{ stripHtmlTags(requirementData?.description) }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label"
              >{{ $t("requirement.creation_date") }} :
            </label>
            <p>{{ formatDate(requirementData?.created_at) }}</p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label"
              >{{ $t("requirement.updated_at") }} :
            </label>
            <p>{{ formatDate(requirementData?.updated_at) }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label"
              >{{ $t("requirement.expiration_days") }} :
            </label>
            <p>
              {{ requirementData?.expire_days }} {{ $t("requirement.days") }}
            </p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label"
              >{{ $t("requirement.due_date") }} :
            </label>
            <p>{{ formatDate(requirementData?.due_date) }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" class="form-label"
              >{{ $t("requirement.frameworks") }} : </label
            ><br />
            <span
              v-if="
                requirementData.frameworks && requirementData.frameworks.length
              "
            >
              <span
                v-for="(framework, index) in requirementData.frameworks"
                :key="index"
                class="badge bg-info text-white m-1"
                >{{ getFrameworkName(framework?.framework_id) }}
              </span>
            </span>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" class="form-label"
              >{{ $t("requirement.controls") }} : </label
            ><br />
            <span
              v-if="
                requirementData.control_id && requirementData.control_id.length
              "
            >
              <span
                v-for="(controlId, index) in requirementData.control_id"
                :key="index"
                class="badge bg-info text-white m-1"
                >{{ getControlName(controlId) }}</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Controls Modal -->
  <div v-if="isControlsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 700px">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("requirement.controls") }}</h5>
        <button
          @click="closeControlsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="text-align: center">#</th>
                <th style="text-align: center">
                  {{ $t("requirement.short_name") }}
                </th>
                <th style="text-align: center">
                  {{ $t("requirement.long_name") }}
                </th>
                <th style="text-align: center">
                  {{ $t("requirement.control_number") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(control, index) in controlsModalData"
                :key="control.id"
              >
                <td style="text-align: center">{{ index + 1 }}</td>
                <td style="text-align: center">{{ control.short_name }}</td>
                <td style="text-align: center">{{ control.long_name }}</td>
                <td style="text-align: center">{{ control.control_number }}</td>
              </tr>
              <tr v-if="!controlsModalData.length">
                <td colspan="4" class="text-center">
                  {{ $t("requirement.no_controls") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Modal for Link Requirements -->
  <div v-if="isDetailsModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-truncate" style="max-width: 80%">
          {{ $t("Available Requirements") }}
        </h5>
        <button
          class="btn-close"
          aria-label="Close"
          @click="closeLinkRequirementModal"
        ></button>
      </div>
      <small> Control : {{ this.currentControl.short_name }} </small>
      <div class="modal-body">
        <div v-if="availableRequirements.length > 0" class="table-responsive">
          <table class="table table-hover mg-b-0 table-striped">
            <thead>
              <tr>
                <th>
                  <div class="custom-control custom-checkbox">
                    <input
                      v-if="availableRequirements.length > 0"
                      type="checkbox"
                      class="custom-control-input"
                      id="selectAll"
                      v-model="selectAllRequirements"
                      @change="toggleSelectAll"
                    />
                    <label class="custom-control-label" for="selectAll"></label>
                  </div>
                </th>
                <th style="font-size: 14px; text-align: center">
                  <span class="badge bg-info text-white m-1">
                    {{ $t("Name") }}
                  </span>
                </th>
                <th style="font-size: 14px; text-align: center">
                  <span class="badge bg-info text-white m-1">
                    {{ $t("Description") }}
                  </span>
                </th>
                <th style="font-size: 14px; text-align: center">
                  <span class="badge bg-info text-white m-1">
                    {{ $t("Expiration Period") }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in availableRequirements" :key="req.id">
                <td>
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="'req-' + req.id"
                      v-model="selectedRequirements"
                      :value="req.id"
                    />
                    <label
                      class="custom-control-label"
                      :for="'req-' + req.id"
                    ></label>
                  </div>
                </td>
                <td style="text-align: center">{{ req.name }}</td>
                <td style="max-width: 450px; text-align: center">
                  {{ stripHtmlTags(req.description) }}
                </td>
                <td style="text-align: center">{{ req.expire_days }} days</td>
              </tr>
              <tr v-if="availableRequirements.length === 0">
                <td colspan="4" class="text-center">
                  {{ $t("No Available Requirements") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <h4 style="text-align: center">No requirements available</h4>
        </div>
        <!-- Pagination controls if needed -->
        <div class="mt-3 d-flex justify-content-between align-items-center">
          <div>
            <small v-if="availableRequirements.length > 0">
              {{ $t("Showing") }} {{ availableRequirements.length }}
              {{ $t("requirements") }}
            </small>
          </div>
        </div>
      </div>
      <div v-if="availableRequirements.length > 0" class="modal-footer">
        <button
          style="background-color: #6e3894 !important; color: white !important"
          type="button"
          class="btn btn-primary"
          @click="linkSelectedRequirements"
          :disabled="selectedRequirements.length === 0"
        >
          <i class="fa-solid fa-link"></i>
          {{ $t("link Selected Requirements") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import axios from "axios";
import { useRouter } from "vue-router";
import requirement from "@/API/Requirement/Requirement";
import framework from "@/API/Frameworks/Frameworks";
import control from "@/API/Control/Control";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import department from "@/API/Department/Department";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import { notify } from "@kyvg/vue3-notification";
import Swal from "sweetalert2";
import Auth from "@/API/Auth";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    "v-select": VueSelect,
  },

  setup() {
    // Initialize API and other required properties
    const frameworkApi = new framework();
    const controlApi = new control();
    const api = new requirement();
    const userApi = new user();
    const teamApi = new team();
    const departmentApi = new department();
    const control_id = useRouter().currentRoute.value.params.id;
    const apiParams = {
      with: ["evidences"],
      filter: "control_id|" + control_id + "|=",
    };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      frameworkApi,
      controlApi,
      apiParams,
      tableColumns,
      userApi,
      teamApi,
      departmentApi,
      fromFields,
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const loggedInUserr = Auth.USER;
        return {
          edit:
            row.createdBy != loggedInUserr.id &&
            (row.active != true || row.active != "true"),
          delete: row.createdBy != loggedInUserr.id,
        };
      };
    },
    filteredOptions() {
      if (this.newItem.responsible_type === "user") return this.userList;
      if (this.newItem.responsible_type === "department_manager")
        return this.departmentManagers;
      if (this.newItem.responsible_type === "team") return this.teamList;
      return [];
    },
    selectLabel() {
      if (this.newItem.responsible_type === "user")
        return this.$t("controlrequirement.users");
      if (this.newItem.responsible_type === "department_manager")
        return this.$t("controlrequirement.department_managers");
      if (this.newItem.responsible_type === "team")
        return this.$t("controlrequirement.teams");
      return "";
    },
  },

  data() {
    return {
      requirementData: [], // Data for requirements table
      frameWorkIdFilter: null, // Selected framework ID
      controlIdFilter: null, // Selected control ID
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      frameworkList: [],
      controlList: [],
      newItem: {},
      filterControls: [],
      userList: [],
      teamList: [],
      departmentsData: [],
      departmentManagers: [],
      selectedFrameworks: [], // Stores selected frameworks
      frameworkControls: {}, // Stores controls grouped by framework
      selectedControls: {}, // Stores selected controls for each framework
      filter: {
        framework_id: "",
      },
      loading: false,
      availableRequirements: [],
      selectedRequirements: [],
      selectAllRequirements: false,
      currentControl: null,
      modalLoading: false,
      isDetailsModalOpen: false,
      requirementDetailsModalOpen: false,
      isControlsModalOpen: false,
      controlsModalData: [],
    };
  },

  async mounted() {
    this.loggedInUser = Auth.USER;
    this.frameworkList = await this.frameworkApi.getAll();
    this.controlList = await this.controlApi.getAll();
    this.userList = await this.userApi.getAll({ select: "id|full_name" });
    this.teamList = await this.teamApi.getAll({ select: "id|name" });
    this.departmentsData = await this.departmentApi.getAll({
      select: "id|name",
    });

    // Get the control_id from URL and find its framework
    const controlId = this.$route.params.id;
    if (controlId) {
      const control = this.controlList.find((c) => c.id === controlId);
      if (control) {
        this.frameWorkIdFilter = control.framework_id;
      }
    }
    this.$refs.table.refreshTable();
  },

  created() {
    // Initialize the table columns and form fields when the component is created

    this.tableColumns = [
      {
        id: "name",
        title: this.$t("requirement.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "description",
        title: this.$t("requirement.description"),
        data: "description",
        defaultContent: "N/A",
      },
      {
        id: "frameworks",
        title: this.$t("requirement.frameworks"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "controls",
        title: this.$t("requirement.controls"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("common.createdat"),
        data: "created_at",
        defaultContent: "N/A",
      },
      {
        id: "due_date",
        title: this.$t("common.due_date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "expire_days",
        title: this.$t("requirement.expire_days"),
        data: "expire_days",
        defaultContent: "N/A",
      },
      {
        id: "evidence_needed_to_approve",
        title: this.$t("requirement.evidence_needed_to_approve"),
        data: null,
        defaultContent: "0",
      },
      {
        id: "responsible_type",
        title: this.$t("requirement.responsible_type"),
        data: "responsible_type",
        defaultContent: "N/A",
      },
      {
        id: "responsible",
        title: this.$t("requirement.responsible"),
        data: null,
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("Name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your full name.",
        col: 12, // Column size in the form layout
      },
      {
        name: "description",
        label: this.$t("Description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide a description of the project.",
        col: 12,
      },
      {
        name: "framework_id",
      },
      {
        name: "responsible_type",
      },
      {
        name: "users",
      },
      {
        name: "due_date",
        label: this.$t("controlrequirement.due_date"),
        type: "date", // Date input field
        rules: "required", // Validation rule: required field
        description: "Please enter the due date.",
        col: 6,
      },
      {
        name: "expire_days",
        label: this.$t("controlrequirement.expire_days"),
        type: "number", // Date input field
        rules: "required", // Validation rule: required field
        description: "Please enter Number Of Days.",
        col: 6,
      },
    ];
  },

  methods: {
    getUnapprovedEvidences(item) {
      if (!item.evidences || !item.evidences.length) {
        return 0;
      }
      const needed = item.evidences.filter((evidence) => !evidence.statuses);
      return needed.length;
    },

    formatResponsibleType(type) {
      const typeMap = {
        user: "User",
        department_manager: "Department Manager",
        team: "Team",
      };
      return typeMap[type] || type;
    },

    getUserInitials(fullName) {
      if (!fullName || fullName === "N/A") return "?!";

      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    },

    openControlsModal(item) {
      if (!item.control_id || !item.control_id.length) {
        this.controlsModalData = [];
        return;
      }

      this.controlsModalData = item.control_id
        .map((controlId) => {
          const control = this.controlList.find((c) => c.id === controlId);
          return control
            ? {
                id: control.id,
                short_name: control.short_name,
                long_name: control.long_name,
                control_number: control.control_number,
              }
            : null;
        })
        .filter((control) => control !== null);

      this.isControlsModalOpen = true;
    },

    closeControlsModal() {
      this.isControlsModalOpen = false;
      this.controlsModalData = [];
    },

    async closeDetailsModal() {
      this.requirementDetailsModalOpen = false;
    },
    async openDetailsModal(selectedRow) {
      this.requirementDetailsModalOpen = true;
      this.requirementData = selectedRow;
    },
    validateControlSelection() {
      const controlId = this.$route.params.id;
      if (controlId) {
        // Get the control's framework
        const control = this.controlList.find((c) => c.id === controlId);
        if (control) {
          const frameworkId = control.framework_id;

          // Check if the required control is in the selection
          const selectedControlIds =
            this.selectedControls[frameworkId]?.map((c) => c.id) || [];

          if (!selectedControlIds.includes(controlId)) {
            // If the required control is not in the selection, add it back
            const requiredControl = this.controlList.find(
              (c) => c.id === controlId
            );

            if (!this.selectedControls[frameworkId]) {
              this.selectedControls[frameworkId] = [];
            }

            // Add the control back to the selection
            this.selectedControls[frameworkId].push(requiredControl);

            // Notify the user
            this.$notify({
              type: "error",
              text: "This control cannot be deselected, but you can add more controls.",
            });
          }
        }
      }

      // Then continue with the original update function
      this.updateSelectedControls();
    },
    async confirmUnlink(id) {
      const result = await Swal.fire({
        title: "Are you sure you want to unlink this requirement ?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: "Yes, unlink it !",
      });

      if (result.isConfirmed) {
        await this.unlink(id);
      } else {
        Swal.fire("Cancelled", "The requirement was not unlinked.", "info");
      }
    },

    // Unassign a requirement from a control
    async unlink(requirementId) {
      const controlId = this.$route.params.id;
      const response = await this.controlApi.unlinkControlRequirement(
        requirementId,
        controlId
      );

      this.$refs.table.refreshTable();
      console.log("Requirement unlinked successfully", response);

      if (response.status === "success") {
        this.$notify({
          type: "success",
          text: "Requirement unlinked successfully",
        });
      }
    },
    openForm() {
      this.isFlipped = true; // Show the form
      this.resetForm();

      // If we have a control_id from URL, select its framework
      const controlId = this.$route.params.id;
      if (controlId) {
        const control = this.controlList.find((c) => c.id === controlId);
        if (control) {
          // Set the framework filter
          this.frameWorkIdFilter = control.framework_id;

          // Select the framework in the form
          this.selectedFrameworks = [control.framework_id];

          // Get controls for this framework
          this.GetControls(this.selectedFrameworks);

          // Optionally, you could also automatically select the control from the URL
          this.selectedControls[control.framework_id] = this.controlList.filter(
            (c) => c.id === controlId
          );
          this.updateSelectedControls();
        }
      }
    },
    async openLinkRequirementModal() {
      this.loading = true;
      this.selectedRequirements = [];
      this.selectAllRequirements = false;

      try {
        // Get the current control to access its linked requirement_ids
        const controlId = this.$route.params.id;
        const controlResponse = await this.controlApi.show(controlId);
        this.currentControl = controlResponse;

        // Get all requirements that are not already linked to this control
        const allRequirements = await this.api.getAll();

        // Filter out requirements that are already linked to the control
        const linkedRequirementIds = this.currentControl.requirement_ids || [];
        this.availableRequirements = allRequirements.filter(
          (req) => !linkedRequirementIds.includes(req.id)
        );
        // Show the modal
        this.isDetailsModalOpen = true;
      } catch (error) {
        console.error("Error loading requirements:", error);
        this.$toast.error(this.$t("error_loading_requirements"));
      } finally {
        this.loading = false;
      }
    },

    closeLinkRequirementModal() {
      this.selectedRequirements = [];
      this.availableRequirements = [];
      this.isDetailsModalOpen = false;
    },

    toggleSelectAll() {
      if (this.selectAllRequirements) {
        // Select all requirements
        this.selectedRequirements = this.availableRequirements.map(
          (req) => req.id
        );
      } else {
        // Deselect all
        this.selectedRequirements = [];
      }
    },

    async linkSelectedRequirements() {
      if (this.selectedRequirements.length === 0) return;

      this.loading = true;

      try {
        const controlId = this.$route.params.id;

        // Get fresh control data from API
        const currentControl = await this.controlApi.show(controlId);

        // Get the current requirement_ids from the freshly fetched control
        const currentRequirementIds = currentControl.requirement_ids || [];

        // Combine with newly selected requirements (avoid duplicates)
        const updatedRequirementIds = [
          ...new Set([...currentRequirementIds, ...this.selectedRequirements]),
        ];

        // Get the framework_id from the current control
        const frameworkId = currentControl.framework_id;

        // Only send the id and requirement_ids to avoid overwriting other fields
        const updatedControl = {
          id: controlId,
          requirement_ids: updatedRequirementIds,
        };

        // Update the control with the new requirement_ids
        await this.controlApi.from(updatedControl, false, false);

        // Update each selected requirement to add the control_id and framework_id
        for (const requirementId of this.selectedRequirements) {
          try {
            // Get the current requirement data
            const requirement = await this.api.show(requirementId);

            // Get existing control_ids and add the current control if not already present
            const existingControlIds = requirement.control_id || [];
            const controlAlreadyLinked = existingControlIds.includes(controlId);

            // Check if this framework is already in the requirement's frameworks array
            const existingFrameworks = requirement.frameworks || [];
            const frameworkExists = existingFrameworks.some(
              (fw) => fw.framework_id === frameworkId
            );

            // Build the updated requirement data
            const updatedRequirement = { ...requirement };

            // Add the control_id if not already present
            if (!controlAlreadyLinked) {
              updatedRequirement.control_id = [
                ...existingControlIds,
                controlId,
              ];
            }

            // Add the framework if not already present
            if (!frameworkExists) {
              updatedRequirement.frameworks = [
                ...existingFrameworks,
                {
                  framework_id: frameworkId,
                  due_date:
                    requirement.due_date ||
                    new Date().toISOString().split("T")[0],
                },
              ];
            }

            // Only update if there are changes
            if (!controlAlreadyLinked || !frameworkExists) {
              await this.api.from(updatedRequirement);
            }
          } catch (error) {
            console.error(
              `Error updating requirement ${requirementId}:`,
              error
            );
          }
        }

        notify({
          type: "success",
          text: "Requirements Linked Successfully",
        });

        this.closeLinkRequirementModal();

        // Refresh the table to show the updated data
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Error linking requirements:", error);
        notify({
          type: "error",
          text: "Error linking requirements",
        });
      } finally {
        this.loading = false;
      }
    },

    // Change the name of linkRequirement to redirect to the modal open function
    linkRequirement() {
      this.openLinkRequirementModal();
    },
    viewEvidences(requirementId) {
      this.$router.push({
        name: "ViewEvidence",
        params: { id: requirementId },
      });
    },

    async deleteRequirement(requirementId) {
      await this.api.delete(requirementId);
      this.$refs.table.refreshTable();
    },

    resetForm() {
      const controlId = this.$route.params.id;
      const defaultResponsibleType = "user";

      this.selectedFrameworks = [];
      this.frameworkControls = {};
      this.selectedControls = {};
      this.newItem = {
        responsible_type: defaultResponsibleType,
        frameworks: [],
        controls: [],
        due_date: new Date().toISOString().split("T")[0],
        // If control_id exists in URL, include it in the new item
        ...(controlId ? { control_id: [controlId] } : {}),
      };

      // If control_id exists, find its framework and pre-select it
      if (controlId) {
        const control = this.controlList.find((c) => c.id === controlId);
        if (control) {
          this.selectedFrameworks = [control.framework_id];
          this.GetControls(this.selectedFrameworks);
          this.selectedControls[control.framework_id] = this.controlList.filter(
            (c) => c.id === controlId
          );
          this.updateSelectedControls();
        }
      }
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.resetForm();
      this.$refs.table.refreshTable(); // Refresh the table data
    },

    formatDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${day}-${month}-${year}`;
    },
    formatCreatedDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    getResponsibleName(type, id) {
      const lists = {
        user: this.userList,
        department_manager: this.departmentManagers,
        team: this.teamList,
      };

      const list = lists[type] || [];
      const found = list.find((item) => item.id === id);

      return found ? found.name || found.full_name : "N/A";
    },

    editItem(data) {
      this.newItem = { ...data }; // Clone the data to avoid mutation

      // Ensure frameworks are selected
      this.selectedFrameworks = data.frameworks.map((f) => f.framework_id);

      // Populate controls based on selected frameworks
      this.frameworkControls = {};
      this.selectedControls = {};

      this.selectedFrameworks.forEach((frameworkId) => {
        // Filter controls related to the selected framework
        this.frameworkControls[frameworkId] = this.controlList.filter(
          (control) => control.framework_id === frameworkId
        );

        // Pre-select controls that are in the control_id array
        this.selectedControls[frameworkId] = this.controlList.filter(
          (control) =>
            control.framework_id === frameworkId &&
            data.control_id.includes(control.id)
        );
      });

      this.isFlipped = true;
    },

    GetControls(selectedFrameworks) {
      // Get the control ID from URL
      const controlId = this.$route.params.id;
      const requiredControl = controlId
        ? this.controlList.find((c) => c.id === controlId)
        : null;

      // Remove unselected frameworks and their controls as before
      Object.keys(this.frameworkControls).forEach((frameworkId) => {
        if (!selectedFrameworks.includes(frameworkId)) {
          // Get the control IDs that need to be removed (excluding the required control)
          const controlsToRemove =
            this.selectedControls[frameworkId]?.map((control) => control.id) ||
            [];

          // Remove these control IDs from newItem.control_id (excluding the required control)
          if (this.newItem.control_id) {
            this.newItem.control_id = this.newItem.control_id.filter(
              (id) => !controlsToRemove.includes(id) || id === controlId
            );
          }

          delete this.frameworkControls[frameworkId]; // Remove framework controls
          delete this.selectedControls[frameworkId]; // Remove selected controls
        }
      });

      // Get controls for each newly selected framework
      selectedFrameworks.forEach((frameworkId) => {
        if (!this.frameworkControls[frameworkId]) {
          this.frameworkControls[frameworkId] = this.controlList.filter(
            (control) => control.framework_id === frameworkId
          );
        }

        // Ensure the required control is included in the selection
        if (requiredControl && requiredControl.framework_id === frameworkId) {
          if (!this.selectedControls[frameworkId]) {
            this.selectedControls[frameworkId] = [];
          }

          // Check if the required control is already selected
          const isSelected = this.selectedControls[frameworkId].some(
            (c) => c.id === controlId
          );

          // If not, add it
          if (!isSelected) {
            this.selectedControls[frameworkId].push(requiredControl);
          }
        }
      });

      // Update frameworks data with due_date
      this.newItem.frameworks = selectedFrameworks.map((frameworkId) => ({
        framework_id: frameworkId,
        due_date: this.newItem.due_date, // Maintain due_date
      }));

      // Force update of control_id array to match current selections
      this.updateSelectedControls();

      // Ensure UI updates by triggering reactivity
      this.frameworkControls = { ...this.frameworkControls };
      this.selectedControls = { ...this.selectedControls };
    },

    getFrameworkName(id) {
      const framework = this.frameworkList.find((f) => f.id === id);
      return framework ? framework.title : "";
    },
    getControlName(id) {
      const control = this.controlList.find((c) => c.id === id);
      return control ? control.short_name : "";
    },

    updateSelectedControls() {
      const controlId = this.$route.params.id;

      // Get all selected control IDs from remaining selected controls
      let controlIds = Object.values(this.selectedControls)
        .flat()
        .filter((control) => control) // Filter out any null/undefined values
        .map((control) => control.id);

      // Make sure the required control is always included
      if (controlId && !controlIds.includes(controlId)) {
        controlIds.push(controlId);
      }

      // Update the request data
      this.newItem.control_id = controlIds;
    },
    updateSelectedUsers(selectedUserId) {
      this.newItem.responsible_id = selectedUserId;
    },
    async updateDepartmentUsers(selectedDepartmentId) {
      this.newItem.responsible_id = null;
      await this.departmentApi
        .getDepartmentManagers(selectedDepartmentId)
        .then((response) => {
          this.departmentManagers = response.data.map((manager) => ({
            id: manager.id,
            name: manager.full_name,
          }));
        });

      // await axios
      //   .get(`/department/Managers/${selectedDepartmentId}`)
      //   .then((response) => {
      //     // this.departmentManagers = response.data;
      //     this.departmentManagers = response.data.map((manager) => ({
      //       id: manager.id,
      //       name: manager.full_name,
      //     }));
      //   });
    },
  },
  async submitForm() {
    // Format the data before sending to API
    const formData = {
      ...this.newItem,
      // Ensure frameworks have framework_id and due_date
      frameworks: this.newItem.frameworks,
      // Send only control IDs
      controls: this.newItem.control_id.map((id) => ({ control_id: id })),
    };

    // Remove redundant properties
    delete formData.control_id;
    delete formData.framework_id;

    try {
      if (this.newItem.id) {
        await this.api.update(this.newItem.id, formData);
      } else {
        await this.api.create(formData);
      }
      this.closeForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  },

  watch: {
    "newItem.responsible_type"(newType) {
      this.newItem.responsible_id = null; // Reset selection when type changes
    },
    "newItem.due_date": {
      handler(newDate) {
        // Update due_date for all frameworks when it changes
        if (this.newItem.frameworks) {
          this.newItem.frameworks = this.newItem.frameworks.map(
            (framework) => ({
              ...framework,
              due_date: newDate,
            })
          );
        }
      },
    },
    // frameWorkIdFilter: {
    // deep: true, // Enable deep watching for nested properties
    // async handler(newFilter) {
    // console.log("selectedFrameworks");

    //   this.filterControls = await new control().getAll({
    //     //   filter: `framework_id|${newFilter}|=`,
    //   });

    //   const filters = [];
    //   if (newFilter) {
    //     //   filters.push(`frameworks.framework_id|${newFilter}|=`);
    //   }
    //   this.apiParams.filter = filters.join("&&");
    //   this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
    // },
    // },

    controlIdFilter: {
      deep: true,
      handler(newFilter) {
        console.log("Control ID changed:", newFilter); // Debugging
        const filters = [];
        if (newFilter) {
          filters.push(`control_id|${newFilter}|=`);
        }
        this.apiParams.filter = filters.join("&&");
        this.$refs.table.refreshTable();
      },
    },
  },
};
</script>

<style scoped>
@import "vue-select/dist/vue-select.css";

/* Form container styles */
.form-container {
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Input field styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* v-select customization */
.v-select {
  --vs-controls-color: #374151;
  --vs-border-color: #e5e7eb;
  --vs-dropdown-bg: #fff;
  --vs-dropdown-color: #374151;
  --vs-dropdown-option-color: #374151;
  --vs-selected-bg: #f3f4f6;
}

.v-select .vs__dropdown-toggle {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.v-select .vs__selected {
  margin: 0 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e5e7eb;
  border-radius: 4px;
  color: #374151;
}

/* Radio button styles */
.radio-group {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.bg-info {
  background-color: #d0b5e3 !important;
  color: #6e3894 !important;
  font-weight: 700 !important;
}

.rdiobox {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s;
}

/* Individual user avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.2s ease-in-out;
}

/* Generate different background colors for avatars */
.user-avatar:nth-child(1) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-avatar:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-avatar:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.user-avatar:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.user-avatar:nth-child(5) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Count badge for +N users */
.user-count-avatar {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
  color: #333 !important;
  font-size: 10px;
  font-weight: 700;
}

/* Empty state avatar */
.user-empty-avatar {
  background: #e0e0e0 !important;
  color: #999 !important;
}

/* Hover effect for individual avatars */
.user-avatars-container:hover .user-avatar {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.text-bg-danger {
  background-color: #e2b6b6 !important;
  color: #a92525 !important;
}
.bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
}

.rdiobox:hover {
  background: #f9fafb;
}

.rdiobox input[type="radio"] {
  margin-right: 0.5rem;
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #3b82f6;
}

.rdiobox span {
  color: #374151;
  font-weight: 500;
}

/* Framework and controls section */
.framework-section {
  background: #f9fafb;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

/* Date and number inputs */
input[type="date"],
input[type="number"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
}

/* Textarea styles */
textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  /* Bootstrap modal z-index */
}

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  /* Rounded corners */
  width: 90%;
  max-width: 1000px;
  /* Responsive max width */
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
  /* Larger header font */
}

.btn-close {
  font-size: 15px;
  border: none;
  color: #000;
}

.modal-body {
  padding: 20px 0;
  max-height: 60vh;
  /* Limit the height of the modal body */
  overflow-y: auto;
  /* Enable vertical scrolling if content overflows */
  overflow-x: auto;
  /* Prevent horizontal scrolling */
  width: 100%;
  /* Ensure the modal body takes full width */
}

.modal-body p {
  white-space: normal;
  /* Ensure text wraps */
  word-wrap: break-word;
  /* Break long words if necessary */
  overflow-wrap: break-word;
  /* Modern alternative to word-wrap */
  max-width: 100%;
  /* Ensure the text doesn't overflow its container */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 35px;
}

.table th,
.table td {
  vertical-align: middle;
}
</style>
<style>
.table-actions .dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  border-top: 1px solid #efefef;
}

.table-actions .dropdown-item:first-child {
  border-top: none;
}

.table-actions .dropdown-item:hover {
  background-color: #f8f9fa;
}

.table-actions .dropdown-item i {
  margin-right: 0.5rem;
  width: 1rem;
  text-align: center;
}

.vs__selected {
  background: #44225c !important;
  color: #fff !important;
}

.vs__deselect {
  margin-left: 10px !important;
  fill: #fff !important;
}

.delete_button {
  display: none !important;
}

.edit_button {
  display: none !important;
}
</style>
<style>
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
.custom-table th,
td {
  text-align: center !important;
}

.bg-info {
  background-color: #d0b5e3 !important;
  color: #6e3894 !important;
  font-weight: 700 !important;
}
</style>
