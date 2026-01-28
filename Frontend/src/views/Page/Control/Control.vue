<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" 
  :mainPage="$t('governance.governance')"
  :mainSubPage="$t('regulator.Regulator Management')" 
  :subPage="$t('control.control')" 
  :titlePage="$t('control.control')">
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <!-- Filter Section -->
      <div class="filter-container">
        <div class="filter-header">
          <h5 class="filter-title">
            <i class="icofont icofont-filter"></i>
            {{ $t("control.Filters") }}
          </h5>
          <button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="btn-clear-filters"
          >
            <i class="icofont icofont-close-circled"></i>
            {{ $t("control.Clear All") }}
          </button>
        </div>

        <div class="row g-3">
          <!-- Framework Filter -->
          <div class="col-md-6 col-lg-3">
            <div class="filter-group">
              <label for="frameworkFilter" class="filter-label">
                <i class="icofont icofont-layers"></i>
                {{ $t("control.framework") }}
              </label>
              <select
                id="frameworkFilter"
                class="form-control filter-select"
                v-model="filters.framework_id"
                @change="resetDomainAndSubdomainFilters"
              >
                <option value="">{{ $t('control.All Frameworks') }}</option>
                <option v-for="(framework, id) in FrameworksList" :key="id" :value="framework.id">
                  {{ framework.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Domain Filter -->
          <div class="col-md-6 col-lg-3">
            <div class="filter-group">
              <label for="domainFilter" class="filter-label">
                <i class="icofont icofont-cubes"></i>
                {{ $t("control.domain") }}
              </label>
              <select
                id="domainFilter"
                class="form-control filter-select"
                v-model="filters.domain_id"
                @change="resetSubdomainFilter"
                :disabled="!filters.framework_id"
              >
                <option value="">{{ $t('control.All Domains') }}</option>
                <option v-for="domain in filteredDomains" :key="domain.id" :value="domain.id">
                  {{ domain.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Subdomain Filter -->
          <div class="col-md-6 col-lg-3">
            <div class="filter-group">
              <label for="subdomainFilter" class="filter-label">
                <i class="icofont icofont-tree"></i>
                {{ $t("control.subdomain") }}
              </label>
              <select
                id="subdomainFilter"
                class="form-control filter-select"
                v-model="filters.subdomain_id"
                :disabled="!filters.domain_id"
              >
                <option value="">{{ $t('control.All Subdomains') }}</option>
                <option v-for="subdomain in filteredSubDomains" :key="subdomain.id" :value="subdomain.id">
                  {{ subdomain.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-md-6 col-lg-3">
            <div class="filter-group">
              <label for="statusFilter" class="filter-label">
                <i class="icofont icofont-flag"></i>
                {{ $t("control.status") }}
              </label>
              <select
                id="statusFilter"
                class="form-control filter-select"
                v-model="filters.control_status"
              >
                <option value="">{{ $t('control.All Statuses') }}</option>
                <option value="Not Applicable">{{ $t('control.Not Applicable') }}</option>
                <option value="Not Implemented">{{ $t('control.Not Implemented') }}</option>
                <option value="Implemented">{{ $t('control.Implemented') }}</option>
                <option value="Partially Implemented">
                  {{ $t('control.Partially Implemented') }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="active-filters-label">{{ $t("control.Active Filters") }}:</span>
          <span
            v-if="filters.framework_id"
            class="filter-badge"
            @click="filters.framework_id = ''"
          >
            {{ getFrameworkName(filters.framework_id) }}
            <i class="icofont icofont-close"></i>
          </span>
          <span
            v-if="filters.domain_id"
            class="filter-badge"
            @click="filters.domain_id = ''"
          >
            {{ getDomainName(filters.domain_id) }}
            <i class="icofont icofont-close"></i>
          </span>
          <span
            v-if="filters.subdomain_id"
            class="filter-badge"
            @click="filters.subdomain_id = ''"
          >
            {{ getSubdomainName(filters.subdomain_id) }}
            <i class="icofont icofont-close"></i>
          </span>
          <span
            v-if="filters.control_status"
            class="filter-badge"
            @click="filters.control_status = ''"
          >
            {{ filters.control_status }}
            <i class="icofont icofont-close"></i>
          </span>
        </div>
      </div>

      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm">
        <template #addAction="{ item }">
            <v-list-item
              v-anyPermission="['viewRequirements']"
              v-if="this.loggedInUser.id == item.framework.owner"
              @click="viewRequirements(item)"
              class="action-list-item"
            >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("Requirements") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="openMappingModal(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-map-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("Mapping") }}
            </v-list-item-title>
          </v-list-item>
        </template>

        <!-- <template #edit="{ item }">
          <a href="javascript:void(0)" @click="editItem(item)" class="dropdown-item" v-permission:update>
            <i class="icofont icofont-fountain-pen"></i> {{ $t('control.Edit') }}
          </a>
        </template>

        <template #delete="{ item }">
          <a href="javascript:void(0)" class="dropdown-item" @click="deleteControl(item.id)"
            title="Delete Requirement"><i class="icofont icofont-trash text-danger"></i>{{ $t('control.Delete') }}</a>
        </template> -->
        <!-- Customizing the display of the 'Name' column in the table -->
        <!-- <template #control.description="{ item }">
          <div v-html="item.description"></div>
        </template> -->

        <template #framework="{ item }">
          <span v-if="item.framework" class="badge text-bg-primary">
            {{ item.framework.title }}
          </span>
        </template>

        <template #domain="{ item }">
          <span v-if="item.domain_relation" class="badge text-bg-primary">
            {{ item.domain_relation.name }}
          </span>
        </template>

        <template #subdomain="{ item }">
          <span v-if="item.sub_domain_relation" class="badge text-bg-primary">
            {{ item.sub_domain_relation.name }}
          </span>
        </template>

        <template #evidence_count="{ item }">
          <span v-if="item.evidence_ids && item.evidence_ids.length > 0" class="badge rounded-pill bg-info"
            style="font-size: 12px">
            {{ item.evidence_ids.length }}
          </span>
          <span v-else> - </span>
        </template>
        <template #mapping="{ item }">
          <span v-if="item.control_mappings.length > 0" @click="openMappingModal(item.id)" class="text-success" style="font-size: 20px; cursor: pointer;">
            <i class="fas fa-check-circle me-1"></i>
          </span>
          <span v-else class="text-danger" style="font-size: 20px">
            <i class="fas fa-times-circle me-1"></i>
          </span>
        </template>
        <template #Active="{ item }">
          <div class="form-check form-switch d-flex justify-content-center align-items-center">
            <input class="form-check-input" type="checkbox" :checked="item.active === true || item.active === 'true'"
              @change="toggleActive(item)" style="width: 40px; height: 22px; cursor: pointer; margin: 0"
              :id="'switch-active-' + item.id" />
          </div>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
        <template #framework_id="{ item }">
          <div class="col-md-4 mb-3">
            <label for="framework_id">{{ $t("control.framework") }}</label>
            <v-select id="framework_id" v-model="newItem.framework_id" :options="FrameworksList"
              :reduce="(option) => option.id" placeholder="Select framework" label="name"></v-select>
          </div>
        </template>

        <!-- Domain Select -->
        <template #domain_id="{ item }">
          <div class="col-md-4 mb-3">
            <label for="domain_id">{{ $t("control.domain") }}</label>
            <v-select id="domain_id" v-model="newItem.domain_id" :options="filteredDomains"
              :reduce="(option) => option.id" placeholder="Select domain" label="name"
              :disabled="isDomainDisabled || isParentControlSelected"></v-select>
          </div>
        </template>

        <!-- Sub-Domain Select -->
        <template #family="{ item }">
          <div class="col-md-4 mb-3">
            <label for="family">{{ $t("control.family") }}</label>
            <v-select id="family" v-model="newItem.family" :options="filteredSubDomains" :reduce="(option) => option.id"
              placeholder="Select family" label="name"
              :disabled="isSubDomainDisabled || isParentControlSelected"></v-select>
          </div>
        </template>

        <!-- Parent Control Select -->
        <template #parent_id="{ item }">
          <div class="col-md-3 mb-3">
            <label for="parent_id">{{ $t("control.parent") }}</label>
            <v-select id="parent_id" v-model="newItem.parent_id" :options="ParentControlsList"
              :reduce="(option) => option.id" placeholder="Select parent control"
              :disabled="isDomainDisabled || isParentControlSelected" label="name"></v-select>
          </div>
        </template>
      </Form>
    </template>
  </main-page>
  <!-- Modal for Adding a New Requirement -->
  <div v-if="isAddRequirementModalOpen" class="modal-overlay">
    <div class="modal-content">
      <span class="close" @click="closeAddRequirementModal">&times;</span>

      <!-- Link to toggle between Select Requirement and Add New Requirement -->
      <a href="#" @click.prevent="toggleRequirementForm" class="toggle-link">
        {{
          isAddingNewRequirement ? "Select Requirement" : "Add New Requirement"
        }}
      </a>

      <h2 class="modal-title">{{ $t('control.Add Requirement') }}</h2>

      <!-- Form for Adding a New Requirement -->
      <form @submit.prevent="submitRequirementForm">
        <!-- Select Requirement View -->
        <div v-if="!isAddingNewRequirement">
          <!-- Select Input for Requirement -->
          <div class="form-group">
            <label for="requirementType">Requirement Type</label>
            <select id="requirementType" v-model="newRequirement.type" class="form-control" required>
              <option value="">{{ $t('control.Select a requirement type') }}</option>
              <option value="Type 1">{{ $t('control.Type 1') }}</option>
              <option value="Type 2">{{ $t('control.Type 2') }}</option>
              <option value="Type 3">{{ $t('control.Type 3') }}</option>
            </select>
          </div>
        </div>

        <!-- Add New Requirement View -->
        <div v-else>
          <!-- Name Input -->
          <div class="form-group">
            <label for="requirementName">{{ $t('control.name') }}</label>
            <input id="requirementName" v-model="newRequirement.name" class="form-control" required />
          </div>

          <!-- Description Textarea -->
          <div class="form-group">
            <label for="description">{{ $t('control.Description') }}</label>
            <textarea id="description" v-model="newRequirement.description" class="form-control" rows="4"
              required></textarea>
          </div>
        </div>
        <!-- Responsible Type Radio Buttons -->
        <div class="form-group">
          <label>{{ $t('control.Responsible Type') }}</label>
          <div>
            <label>
              <input type="radio" v-model="newRequirement.responsibleType" value="Team" />
              {{ $t('control.Team') }}
            </label>
            <label>
              <input type="radio" v-model="newRequirement.responsibleType" value="User" />
              {{ $t('control.User') }}
            </label>
            <label>
              <input type="radio" v-model="newRequirement.responsibleType" value="Department Manager" />
              {{ $t('control.Department Manager') }}
            </label>
          </div>
        </div>

        <!-- Dynamic Select Input for Responsible -->
        <div class="form-group" v-if="newRequirement.responsibleType">
          <label for="responsibleSelect">Select {{ newRequirement.responsibleType }}</label>
          <select id="responsibleSelect" v-model="newRequirement.responsible" class="form-control" required>
            <option value="">
              {{ $t('control.Select') }} {{ newRequirement.responsibleType }}
            </option>
            <option v-for="option in responsibleOptions" :key="option.id" :value="option.id">
              {{ option.name }}
            </option>
          </select>
        </div>

        <!-- Due Date Calendar Input -->
        <div class="form-group">
          <label for="dueDate">Due Date</label>
          <input id="dueDate" type="date" v-model="newRequirement.dueDate" class="form-control" required />
        </div>
        <!-- Submit Button -->
        <button type="submit" class="btn-primary w-full mt-3 px-5">
          {{ $t('control.Submit') }}
        </button>
      </form>
    </div>
  </div>

  <!-- Modal for Control Mappings -->
  <div v-if="isMappingModalOpen" class="modal-overlay">
    <div class="modal-content">
      <span class="close" @click="closeMappingModal">&times;</span>
      <h2 class="modal-title">Control Mappings</h2>

      <!-- Add Mapping Button -->
      <button class="btn-primary mb-3" @click="openAddMappingModal">
        {{ $t('control.Add New Control Mapping') }}
      </button>
      <div class="modal-body">
        <table class="table table-striped">
          <thead>
            <tr>
              <th class="text-center">{{ $t('control.Control') }}</th>
              <th class="text-center">{{ $t('control.Framework') }}</th>
              <th class="text-center">{{ $t('control.Action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(linkedMapping, index) in linkedMappings" :key="index">
              <td class="text-center">
                {{ linkedMapping?.mapping_control?.short_name }}
              </td>
              <td class="text-center">
                {{ linkedMapping?.mapping_control?.framework?.title }}
              </td>
              <td class="text-center">
                <a href="javascript:void(0)" @click="unlinkMapping(linkedMapping)" title="Delete">
                  <i class="icofont icofont-trash"></i>
                </a>
                <!-- <button type="button" class="btn btn-danger" @click="unlinkMapping(linkedMapping)">Delete</button> -->
              </td>
            </tr>
            <tr v-if="linkedMappings.length === 0">
              <td class="text-center" colspan="4">{{ $t('control.No Data Found') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal for Adding a New Requirement -->
  <div v-if="isAddMappingModalOpen" class="modal-overlay">
    <div class="modal-content">
      <span class="close" @click="closeAddMappingModal">&times;</span>
      <h2 class="modal-title">{{ $t('control.Add Mapping') }}</h2>

      <!-- Form for Adding a New Mapping -->
      <form @submit.prevent="submitMappingForm">
        <!-- Select Requirement View -->
        <label for="kpi_owner">Framework</label>
        <select class="form-control" v-model="mapping.framework_id" :required="!mapping.framework_id">
          <option value="" :selected="mapping.framework_id">
            {{ $t('control.Select Framework') }}
          </option>
          <option v-for="Framework in FrameworksList" :value="Framework.id">
            {{ Framework.name }}
          </option>
        </select>
        <label for="kpi_owner">{{ $t('control.Control') }} </label>
        <select class="form-control" v-model="mapping.mapping_control_id" :required="!mapping.mapping_control_id">
          <option value="" :selected="!mapping.mapping_control_id">
            {{ $t('control.Select Control') }}
          </option>
          <option v-for="mappingControl in mappingControls" :value="mappingControl.id">
            {{ mappingControl.short_name }}
          </option>
        </select>
        <!-- Submit Button -->
        <button type="submit" class="btn-primary w-full mt-3 px-5">
          {{ $t('control.Submit') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import control from "@/API/Control/Control";
import framework from "@/API/Frameworks/Frameworks";
import controlMapping from "@/API/ControlMapping/ControlMapping";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Frameworks from "@/API/Frameworks/Frameworks";
import axios from "axios";
import vSelect from "vue-select";
import ControlType from "@/API/ControlType/ControlType";
import ControlMaturity from "@/API/Maturity/Maturity";
import ControlPhase from "@/API/ControlPhase/ControlPhase";
import ControlClass from "@/API/ControlClass/ControlClass";
import User from "@/API/User/User";
import Auth from "@/API/Auth";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    vSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new control();
    const apiFramework = new framework();
    const controlMappingApi = new controlMapping();
    const apiParams = {
      with: ["framework:id,title,owner", "domainRelation:id,name", "subDomainRelation:id,name", "controlMappings"],
    };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const FrameworkApi = new Frameworks();
    const controlTypeApi = new ControlType();
    const controlMaturityApi = new ControlMaturity();
    const userApi = new User();
    const controlPhaseApi = new ControlPhase();
    const controlClassApi = new ControlClass();


    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      FrameworkApi,
      controlMappingApi,
      controlTypeApi,
      controlMaturityApi,
      userApi,
      apiFramework,
      controlPhaseApi,
      controlClassApi
    };
  },
  async mounted() { },
  data() {
    return {
      mode: "create",
      isModalOpen: false, // Controls the visibility of the modal
      isAddRequirementModalOpen: false, // Controls the visibility of the add requirement modal
      isAddingNewRequirement: false, // Toggles between Select Requirement and Add New Requirement views
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      selectedId: null, // Store the selected ID from the table row
      linkedRequirements: [], // Data for linked requirements
      FrameworksList: [], // List of all frameworks
      ParentControlsList: [], // List of all domains
      filteredDomains: [], // Domains filtered by selected framework
      filteredSubDomains: [], // Sub-domains filtered by selected domain
      filteredParentControls: [],
      isLoading: false, // Add a loading state
      isDomainDisabled: true,
      isSubDomainDisabled: true,

      selectedMappingId: null,
      isMappingModalOpen: false,
      isAddMappingModalOpen: false,
      isAddingNewMapping: false,
      mappingColumns: [
        { title: this.$t("control.control_id"), data: "control_id" },
        { title: this.$t("control.mapping_control_id"), data: "mapping_control_id" },
      ],
      linkedMappings: [],
      mappingControls: [],
      mapping: {
        framework_id: "",
        mapping_control_id: "",
      },

      newRequirement: {
        type: "", // For Select Requirement view
        name: "", // For Add New Requirement view
        description: "", // For Add New Requirement view
        responsibleType: "", // Team, User, or Department Manager
        responsible: "", // Selected responsible (team, user, or department manager)
        dueDate: "", // Due date for the requirement
      },
      responsibleOptions: [], // Options for the responsible select input
      requirementColumns: [
        { title: this.$t("control.name"), data: "name" },
        { title: this.$t("control.description"), data: "description" },
        { title: this.$t("control.responsible"), data: "responsible" },
        { title: this.$t("control.expiration_date"), data: "expirationDate" },
        { title: this.$t("control.due_date"), data: "dueDate" },
      ],
      formData: {
        title: "",
        domain: [],
        sub_domain: [],
        icon: "",
        description: "",
        owner: null,
      },
      newItem: {
        framework_id: null,
        domain_id: null,
        family: null,
      },
      filters: {
        framework_id: "", // Selected framework ID
        domain_id: "", // Selected domain ID
        subdomain_id: "", // Selected subdomain ID
        control_status: "",
      },
      filteredDomains: [], // Domains filtered by selected framework
      filteredSubDomains: [], // Subdomains filtered by selected domain
      loggedInUser: false,
    };
  },
  computed: {
    isDomainDisabled() {
      return !this.newItem.framework_id;
    },
    isSubDomainDisabled() {
      return !this.newItem.domain_id;
    },
    isParentControlSelected() {
      return !!this.newItem.parent_id; // Returns true if parent_id is selected
    },
  },
  watch: {
    async "mapping.framework_id"(after) {
      const framework_id = after;
      const control_id = this.selectedMappingId;
      if (framework_id != 0 && control_id != 0) {
        axios.defaults.baseURL = REGULATORSERVICE;
        await axios
          .get(
            `/control-mapping-getControlForMakeMapping/${framework_id}/${control_id}`
          )
          .then((response) => {
            this.mappingControls = response.data;
          })
          .catch((error) => {
            // this.errors = ret.data.errors;
            alert("There was an error");
          });
      }
    },

    "newItem.framework_id"(newFrameworkId) {
      if (newFrameworkId) {
        this.filterDomainsByFramework(newFrameworkId);
        this.filterControlsByFramework(newFrameworkId);
        this.isDomainDisabled = false; // Enable domain select
        this.isSubDomainDisabled = true; // Disable sub-domain select
      } else {
        this.filteredDomains = []; // Clear domains if no framework is selected
        this.filteredSubDomains = [];
        this.isDomainDisabled = true; // Disable domain select
        this.isSubDomainDisabled = true; // Disable sub-domain select
      }
      // Reset domain and sub-domain selections
      this.newItem.domain_id = null;
      this.newItem.family = null;
      this.newItem.parent_id = null;
    },
    "newItem.domain_id"(newDomainId) {
      if (newDomainId && this.newItem.framework_id) {
        this.filterSubDomainsByDomain(newDomainId, this.newItem.framework_id);
        this.isSubDomainDisabled = false; // Enable sub-domain select
      } else {
        this.isSubDomainDisabled = true; // Disable sub-domain select
      }
      this.newItem.family = null;
    },
    "newItem.parent_id"(newParentId) {
      if (newParentId) {
        // If a parent control is selected, disable domain and sub-domain selects
        this.isDomainDisabled = true;
        this.isSubDomainDisabled = true;

        // If in create mode, reset domain and sub-domain selections to null
        if (this.mode === "create") {
          this.newItem.domain_id = null;
          this.newItem.family = null;
        }
      } else {
        // If no parent control is selected, re-enable domain and sub-domain selects based on framework and domain selections
        this.isDomainDisabled = !this.newItem.framework_id;
        this.isSubDomainDisabled = !this.newItem.domain_id;
      }
    },
    "newRequirement.responsibleType"(newType) {
      this.loadResponsibleOptions(newType);
    },

    filters: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        // Construct the filter string for apiParams
        const filtersObject = [];
        if (newFilter.framework_id) {
          filtersObject.push(`framework_id|${newFilter.framework_id}|=`);
        }
        if (newFilter.domain_id) {
          filtersObject.push(`domain_id|${newFilter.domain_id}|=`);
        }
        if (newFilter.subdomain_id) {
          filtersObject.push(`family|${newFilter.subdomain_id}|=`);
        }
        if (newFilter.control_status) {
          filtersObject.push(`control_status|${newFilter.control_status}|=`);
        }

        // Update apiParams with the new filter
        this.apiParams.filter = filtersObject.join("&&");
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },
  },
  created() {
    this.loadFrameworks();
    this.loadControlType();
    this.loadControlMaturity();
    // this.loadControlowner();

    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("control.name"), data: "short_name", defaultContent: "N/A" },
      { title: this.$t("control.description"), data: "description", defaultContent: "N/A" },
      { id: "framework", title: this.$t("control.framework"), data: "", defaultContent: "N/A" },
      { id: "domain", title: this.$t("control.domain"), data: "", defaultContent: "N/A" },
      { id: "subdomain", title: this.$t("control.subdomain"), data: "", defaultContent: "N/A" },
      { title: this.$t("control.Control Status"), data: "control_status", defaultContent: "N/A" },
      { id: "evidence_count", title: this.$t("control.Evidences"), data: "", defaultContent: "N/A" },
      { id: "mapping", title: this.$t("control.Mapping"), data: "", defaultContent: "N/A" },
      { id: "Active", title: this.$t("control.active"), data: "active", defaultContent: "N/A" },
      // { title: this.$t("control.requirement"), data: "requirement", defaultContent: "N/A" },
    ];
    this.fromFields = [
      // Section 1: Essential Information (Top Priority)
      {
        name: "short_name",
        label: this.$t("control.short_name"),
        type: "text",
        rules: "required",
        description: "Enter a short name for the control.",
        col: 4,
      },
      {
        name: "long_name",
        label: this.$t("control.long name"),
        type: "text",
        rules: "required",
        description: "Enter the full name of the control.",
        col: 4,
      },
      {
        name: "control_number",
        label: this.$t("control.control number"),
        type: "text",
        rules: "",
        description: "Enter the unique control number.",
        col: 4,
      },
      {
        type: "options",
        name: "framework_id",
        label: this.$t("control.framework"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "required",
        description: "Select the framework this control belongs to.",
      },
      {
        type: "options",
        name: "domain_id",
        label: this.$t("control.domain"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "required",
        description: "Select the domain this control is associated with.",
      },

      // Section 2: Classification & Ownership
      {
        type: "options",
        name: "family",
        label: this.$t("control.family"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "required",
        description: "Select the family this control belongs to.",
      },
      {
        type: "options",
        name: "control_class",
        label: this.$t("control.control class"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "",
        description: "Select the class of this control.",
      },
      {
        type: "options",
        name: "control_priority",
        label: this.$t("control.control priority"),
        options: [
          { id: "P0", name: "P0" },
          { id: "P1", name: "P1" },
          { id: "P2", name: "P2" },
          { id: "P3", name: "P3" },
        ],
        optionLabel: "name",
        col: 4,
        rules: "",
        description: "Select the priority level of this control.",
      },
      // {
      //   type: "options",
      //   name: "control_owner",
      //   label: this.$t("control.control-owner"),
      //   options: [],
      //   optionLabel: "full_name",
      //   col: 4,
      //   rules: "",
      //   disabled: true,
      // },
      {
        type: "options",
        name: "control_maturity",
        label: this.$t("control.control-maturity"),
        options: [],
        optionLabel: "name",
        col: 4,
        multiable: true,
        rules: "",
        description: "Select the maturity this control is in.",
      },
      {
        type: "options",
        name: "control_type",
        label: this.$t("control.control_type"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "",
        description: "Select the type this control is in.",
      },
      {
        type: "options",
        name: "control_phase",
        label: this.$t("control.control_phase"),
        options: [],
        optionLabel: "name",
        col: 4,
        rules: "",
        description: "Select the phase this control is in.",
      },
      // Section 3: Additional Fields
      {
        name: "mitigation_percent",
        label: this.$t("control.mitigation percent"),
        type: "number",
        rules: "",
        description: "Enter the mitigation percentage (0-100).",
        col: 3,
      },
      {
        type: "options",
        name: "desired_maturity",
        label: this.$t("control.desired maturity"),
        options: [
          { id: "Not Performed", name: "Not Performed" },
          { id: "Performed", name: "Performed" },
          { id: "Documented", name: "Documented" },
          { id: "Managed", name: "Managed" },
          { id: "Reviewed", name: "Reviewed" },
          { id: "Optimizing", name: "Optimizing" },
        ],
        optionLabel: "name",
        col: 3,
        rules: "",
        description: "Select the desired maturity level for this control.",
      },
      {
        type: "options",
        name: "parent_id",
        label: this.$t("control.parent"),
        options: this.ParentControlsList,
        optionLabel: "name",
        col: 3,
        rules: "",
        description:
          "Select the parent control for this control (if applicable).",
      },
      {
        name: "approximate_time",
        label: this.$t("control.approximate time"),
        type: "number",
        rules: "",
        description:
          "Enter the approximate time required to implement this control (in hours).",
        col: 3,
      },

      // Section 4: Textarea Fields (Moved to the End)
      {
        name: "description",
        label: this.$t("control.description"),
        type: "textarea",
        rules: "required",
        description: "Provide a detailed description of the control.",
        col: 6,
      },
      {
        name: "supplemental_guidance",
        label: this.$t("control.supplemental guidance"),
        type: "textarea",
        rules: "",
        description: "Provide supplemental guidance or notes for this control.",
        col: 6,
      },
      {
        name: "test_steps",
        label: this.$t("control.test steps"),
        type: "textarea",
        rules: "",
        description: "Provide the steps to test this control.",
        col: 6,
      },
      {
        name: "expected_results",
        label: this.$t("control.expected results"),
        type: "textarea",
        rules: "",
        description:
          "Describe the expected results of implementing this control.",
        col: 6,
      },
    ];
  },
  methods: {
    async deleteControl(controlId) {
      await this.api.delete(controlId);
      this.$refs.table.refreshTable();
    },
    async loadFrameworks() {
      this.loggedInUser = Auth.USER;
      const apiResponse = await this.FrameworkApi.getAll({
        select: "id|title",
      });

      // Transform the data if necessary
      this.FrameworksList = apiResponse.map((framework) => ({
        id: framework.id,
        name: framework.title, // Assuming the API returns `title` instead of `name`
      }));
    },

    viewRequirements(control) {
      this.$router.push({
        name: "ViewRequirements",
        params: { id: control.id },
      });
    },
    async loadControlType() {
      try {
        const controlTypeResponse = await this.controlTypeApi.getAll({
          select: "id|name",
        });
        const controlPhaseResponse = await this.controlPhaseApi.getAll({
          select: "id|name",
        });
        const controlClassResponse = await this.controlClassApi.getAll({
          select: "id|name",
        });
        this.fromFields.find((field) => field.name === "control_type").options =
          controlTypeResponse;
        this.fromFields.find((field) => field.name === "control_phase").options =
          controlPhaseResponse;
        this.fromFields.find((field) => field.name === "control_class").options =
          controlClassResponse;
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    },
    async loadControlMaturity() {
      try {
        const controlMaturityResponse = await this.controlMaturityApi.getAll({
          select: "id|name",
        });
        this.fromFields.find(
          (field) => field.name === "control_maturity"
        ).options = controlMaturityResponse;
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    },
    // async loadControlowner() {
    //   try {
    //     const usersResponse = await this.userApi.getAll({
    //       select: "id|full_name",
    //     });
    //     this.fromFields.find(
    //       (field) => field.name === "control_owner"
    //     ).options = usersResponse;
    //   } catch (error) {
    //     console.error("Failed to load categories:", error);
    //   }
    // },

    // Reset domain and subdomain filters when framework changes
    resetDomainAndSubdomainFilters() {
      this.filters.domain_id = ""; // Reset domain filter
      this.filters.subdomain_id = ""; // Reset subdomain filter
      this.filteredDomains = []; // Clear domains
      this.filteredSubDomains = []; // Clear subdomains

      // Fetch domains for the selected framework
      if (this.filters.framework_id) {
        this.filterDomainsByFramework(this.filters.framework_id);
      }
    },

    // Reset subdomain filter when domain changes
    resetSubdomainFilter() {
      this.filters.subdomain_id = ""; // Reset subdomain filter
      this.filteredSubDomains = []; // Clear subdomains

      // Fetch subdomains for the selected domain
      if (this.filters.domain_id) {
        this.filterSubDomainsByDomain(
          this.filters.domain_id,
          this.filters.framework_id
        );
      }
    },

    async filterControlsByFramework(frameworkId) {
      try {
        const response = await this.apiFramework.controlsByFramework(
          frameworkId
        );

        this.ParentControlsList.splice(
          0,
          this.ParentControlsList.length,
          ...(response.data.length ? response.data : [])
        );
      } catch (error) {
        console.error("Error fetching controls:", error);
        this.ParentControlsList = []; // Ensure it's empty on error
      }
    },

    async filterDomainsByFramework(frameworkId) {
      try {
        const response = await this.apiFramework.getDomainsByFramework(
          frameworkId
        );
        this.filteredDomains.splice(
          0,
          this.filteredDomains.length,
          ...(response.data.length ? response.data : [])
        );
      } catch (error) {
        console.error("Error fetching domains:", error);
        this.filteredDomains = []; // Ensure it's empty on error
      }
    },

    async filterSubDomainsByDomain(domainId) {
      try {
        // Find the selected domain in the filteredDomains array
        const selectedDomain = this.filteredDomains.find(
          (domain) => domain.id === domainId
        );

        if (selectedDomain) {
          // Extract the subdomains from the selected domain
          const subdomains = Object.values(selectedDomain.subdomains);

          // Update the filteredSubDomains array reactively
          this.filteredSubDomains.splice(
            0,
            this.filteredSubDomains.length,
            ...subdomains
          );
        } else {
          console.error("Domain not found in filteredDomains");
          // Clear the filteredSubDomains array if the domain is not found
          this.filteredSubDomains.splice(0, this.filteredSubDomains.length);
        }
      } catch (error) {
        console.error("Error filtering subdomains:", error);
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.mode = "create"; // Set mode to create
      this.isFlipped = true; // Show the form
      this.filteredSubDomains = [];
      this.filteredDomains = [];
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data

      // Reset newItem properties
      this.newItem = {
        framework_id: null, // Reset framework filter
        domain_id: null, // Reset domain filter
        family: null, // Reset subdomain filter
        parent_id: null, // Reset parent filter
      };

      // Clear the arrays
      this.filteredSubDomains = [];
      this.filteredDomains = [];
      this.ParentControlsList = [];
    },

    async editItem(data) {
      this.mode = "edit"; // Set mode to edit

      // Copy all properties from the item being edited
      this.newItem = { ...data };

      // Show the form for editing
      this.isFlipped = true;

      // Ensure the framework_id is set
      if (this.newItem.framework_id) {
        // Fetch and filter domains based on the framework_id
        await this.filterDomainsByFramework(this.newItem.framework_id);
        await this.filterControlsByFramework(this.newItem.framework_id);

        // Set the domain_id after DomainsList is populated
        this.newItem.domain_id = data.domain_id;
        this.newItem.parent_id = data.parent_id;

        // If domain_id is set, fetch and filter sub-domains
        if (this.newItem.domain_id) {
          await this.filterSubDomainsByDomain(
            this.newItem.domain_id,
            this.newItem.framework_id
          );

          // Set the family after SubDomainsList is populated
          this.newItem.family = data.family;
        }
      }
    },

    // Open the modal and store the selected ID
    openMappingModal(id) {
      this.selectedMappingId = id; // Store the selected ID
      this.isMappingModalOpen = true; // Open the modal
      this.fetchLinkedMappings(); // Fetch linked requirements
    },
    // Close the modal
    closeMappingModal() {
      this.isMappingModalOpen = false;
      this.selectedMappingId = 0;
      this.linkedMappings = [];
      this.mappingControls = [];
      this.resetMappingForm();
    },
    openAddMappingModal() {
      this.isAddMappingModalOpen = true;
      this.resetMappingForm();
    },
    closeAddMappingModal() {
      this.isAddMappingModalOpen = false;
      this.mappingControls = [];
    },
    resetMappingForm() {
      this.mapping.framework_id = "";
      this.mapping.mapping_control_id = "";
    },
    toggleMappingForm() {
      this.isAddingNewMapping = !this.isAddingNewMapping;
      this.isAddMappingModalOpen = false;
      this.resetMappingForm();
    },
    // Fetch linked requirements from the API
    async fetchLinkedMappings() {
      this.isLoading = true; // Start loading
      try {
        // const response = await axios.get(`/control-mapping-getDataBycontrolId/${this.selectedMappingId}`);
        const response = await this.controlMappingApi.getAll({
          filter: `control_id|${this.selectedMappingId}|=`,
          with: `mappingControl.framework`,
        });
        this.linkedMappings = response;
      } catch (error) {
        this.selectedMappingId = null;
        console.error("Error fetching linked Mappings:", error);
      } finally {
        this.isLoading = false; // Stop loading
      }
    },

    async submitMappingForm() {
      this.isLoading = true; // Start loading
      try {
        axios.defaults.baseURL = REGULATORSERVICE;
        const response = await axios.post("/control-mapping", {
          control_id: this.selectedMappingId,
          mapping_control_id: this.mapping.mapping_control_id,
        });
        // if(response.status == 422){console.error("The control mapping is already exist in mappings:", error);}
        console.log("Response Is: ", this.response);
        if (response.errors) {
          this.errors = response.errors;
          console.log("API Errors:", this.errors);
        }
        this.$refs.table.refreshTable();
        this.resetMappingForm();
        this.fetchLinkedMappings();
      } catch (error) {
        console.error("Error fetching linked Mappings:", error);
      } finally {
        this.selectedMappingId = null;
        this.mapping.mapping_control_id = null;
        this.isLoading = false; // Stop loading
        this.isAddingNewMapping = !this.isAddingNewMapping;
        this.isAddMappingModalOpen = false;
        this.closeMappingModal();
        this.closeAddMappingModal();
      }
    },
    async unlinkMapping(data) {
      await this.controlMappingApi.delete(0, [data.id].map(String)); // API call to delete the item
      this.selectedMappingId = null;
      this.mapping.mapping_control_id = null;
      this.isLoading = false; // Stop loading
      this.isAddingNewMapping = !this.isAddingNewMapping;
      this.isAddMappingModalOpen = false;
      this.closeMappingModal();
      this.closeAddMappingModal();
    },
    async toggleActive(item) {
      // Build formData from the item, including toggled active value
      const formData = {
        ...item,
        active: !(item.active === true || item.active === "true"),
      };
      console.log("Toggling active status for item:", formData);
      try {
        await this.api.from(formData);
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Failed to update active status:", error);
      }
    },
    // Open the modal for adding a new requirement
    openAddRequirementModal() {
      this.isAddRequirementModalOpen = true; // Open the add requirement modal
      this.resetRequirementForm();
    },

    // Close the modal for adding a new requirement
    closeAddRequirementModal() {
      this.isAddRequirementModalOpen = false; // Close the add requirement modal
      this.resetRequirementForm(); // Reset the form data
    },

    // Reset the new requirement form
    resetRequirementForm() {
      this.newRequirement = {
        type: "",
        name: "",
        description: "",
        responsibleType: "",
        responsible: "",
        dueDate: "",
      };
      this.responsibleOptions = [];
    },
  },
};
</script>
<style scoped>
.parent {
  margin-top: 100px;
}

.form-group {
  margin-top: 10px;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 1200px;
  /* Increase the width */
  /*height: 800px;
  position: relative;
  animation: fadeIn 0.3s ease;*/
}

.close {
  position: absolute;
  top: 5px;
  right: 20px;
  font-size: 35px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
}

.card {
  height: 160px;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 10px;
  width: 350px;
  text-align: center;
  margin: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Buttons */
.btn-primary {
  margin-top: 20px;
  background-color: #007bff;
  /* Primary background color */
  color: white;
  /* Text color */
  border: none;
  padding: 10px 15px;
  /* Padding for spacing */
  border-radius: 5px;
  /* Rounded corners */
  cursor: pointer;
  /* Pointer cursor on hover */
  font-size: 14px;
  /* Font size */
  transition: background-color 0.3s, transform 0.2s;
  /* Smooth transition for hover effects */
}

.btn-primary:hover {
  background-color: #0056b3;
  /* Darker shade on hover */
  transform: scale(1.05);
  /* Slight zoom effect */
  color: #e9ecef;
  /* Optional: Slightly lighter text color */
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

@keyframes shine {
  0% {
    left: -100px;
  }

  60% {
    left: 100%;
  }

  to {
    left: 100%;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.toggle-link {
  display: block;
  margin-bottom: 20px;
  color: #007bff;
  text-decoration: none;
}

.toggle-link:hover {
  text-decoration: underline;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  /* font-weight: bold; */
}

input[type="radio"] {
  margin-right: 10px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

@import "vue-multiselect/dist/vue-multiselect.min.css";

.delete_button {
  display: none !important;
}

.edit_button {
  display: none !important;
}
[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
/* Enhanced Filter Container Styles */
.filter-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e9ecef;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-title {
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-title i {
  font-size: 20px;
}

.btn-clear-filters {
  background: #ffffff;
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-clear-filters:hover {
  background: #dc3545;
  color: white;
  transform: translateY(-1px);
}

.filter-group {
  position: relative;
}

.filter-label {
  color: #495057;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label i {
  font-size: 14px;
  opacity: 0.9;
}

.filter-select {
  background: white;
  border: 1px solid #ced4da;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  color: #495057;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.filter-select:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.6;
  border-color: #e9ecef;
}

/* Active Filters Display */
.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.active-filters-label {
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
}

.filter-badge {
  background: #007bff;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-badge:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
}

.filter-badge i {
  font-size: 12px;
  opacity: 0.7;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-container {
    padding: 16px;
  }

  .filter-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .btn-clear-filters {
    width: 100%;
    justify-content: center;
  }
}

/* RTL Support */
[dir="rtl"] .filter-label,
[dir="rtl"] .filter-title {
  flex-direction: row-reverse;
}

[dir="rtl"] .btn-clear-filters {
  flex-direction: row-reverse;
}

[dir="rtl"] .filter-badge {
  flex-direction: row-reverse;
}


</style>
