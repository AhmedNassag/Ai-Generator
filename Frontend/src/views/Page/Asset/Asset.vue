<template>
  <PurpleDotsLoader v-if="load" />

  <!-- Main Page component where the layout and page structure are set -->
  <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="$t('asset.risk_mngt')"
    :mainSubPage="$t('asset.asset_mngt')" :subPage="$t('asset.assets')" :titlePage="$t('asset.asset')"
    :showInsightsTab="true" v-permission:show>
    <div v-permission:update v-permission:delete></div>

    <!-- Statistics Slot -->
    <template #statistics>
      <div class="statistics-content">
        <!-- Metrics Cards Row -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="metric-card bg-primary-subtle">
              <div class="metric-icon">
                <i class="fas fa-server"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ assetStatisticsData.totalAssets || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("asset.total_assets") || "Total Assets" }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-success-subtle">
              <div class="metric-icon">
                <i class="fas fa-microchip"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ assetStatisticsData.physicalAssets || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("asset.physical_assets") || "Physical Assets" }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-info-subtle">
              <div class="metric-icon">
                <i class="fas fa-cloud"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ assetStatisticsData.virtualAssets || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("asset.virtual_assets") || "Virtual Assets" }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-warning-subtle">
              <div class="metric-icon">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-value">
                  {{ assetStatisticsData.avgAssetValue || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("asset.avg_asset_value") || "Avg Asset Value" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="row">
          <!-- Asset Type Distribution -->
          <div class="col-md-12 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{ $t("asset.type_distribution") || "Asset Type Distribution" }}
              </h6>
              <highcharts :options="typeDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Assets by Category -->
          <div class="col-md-12 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{ $t("asset.category_distribution") || "Assets by Category" }}
              </h6>
              <highcharts :options="categoryDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Assets by Location -->
          <div class="col-md-12 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{ $t("asset.location_distribution") || "Assets by Location" }}
              </h6>
              <highcharts :options="locationDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Assets by Operating System -->
          <div class="col-md-12 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("asset.os_distribution") || "Assets by Operating System"
                }}
              </h6>
              <highcharts :options="osDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Assets by Environment Category -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("asset.environment_distribution") ||
                  "Assets by Environment"
                }}
              </h6>
              <highcharts :options="environmentDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Assets by Host Region -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("asset.region_distribution") || "Assets by Region" }}
              </h6>
              <highcharts :options="regionDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Asset Value Distribution -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("asset.value_distribution") || "Asset Value Distribution"
                }}
              </h6>
              <highcharts :options="valueDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Assets by Owner -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("asset.owner_distribution") || "Assets by Owner" }}
              </h6>
              <highcharts :options="ownerDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Asset Creation Timeline -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("asset.creation_timeline") || "Asset Creation Timeline" }}
              </h6>
              <highcharts :options="creationTimelineChart"></highcharts>
            </div>
          </div>

          <!-- Assets by Team -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("asset.team_distribution") || "Assets by Team" }}
              </h6>
              <highcharts :options="teamDistributionChart"></highcharts>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'" v-permission:show
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :filters="assetFilters">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #category="{ item }">
          <span class="title_span"> {{ item?.category?.name }} </span>
        </template>
        <template #location="{ item }">
          {{ item?.location?.name }}
        </template>
        <template #operating_system="{ item }">
          {{ item?.operating_system?.name }}
        </template>
        <template #environment_category="{ item }">
          {{ item?.environment_category?.name }}
        </template>

        <template #owner="{ item }">
          <div class="user-info">
            <div class="user-avatar" @click.prevent="openUserDetailsModal(users[item.owner_id])">
              {{ getUserInitials(getUserNameById(item.owner_id)) }}
            </div>
            <span class="user-fullname">{{
              getUserNameById(item.owner_id)
              }}</span>
          </div>
        </template>

        <template #host_region="{ item }">
          {{ item?.host_region?.name }}
        </template>
        <template #ip_address="{ item }">
          <span class="title_span"> {{ item?.ip_address }} </span>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="formFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
        <template #asset_value="{ item }">
          <div class="col-md-4 mb-3">
            <label for="asset_valueInput">{{
              this.$t("asset.asset_value")
              }}</label>
            <div class="d-flex">
              <input v-model="newItem.asset_value" class="form-control" type="text" disabled />
              <button class="btn btn-info" @click.prevent="openModal(item)">
                {{ this.$t("common.calculate") }}
              </button>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Asset value calculation modal -->
  <AssetValueCalculationModal v-model="isModalOpen" @submit="handleAssetValueSubmit" />

  <!-- View user details modal -->
  <ViewUserDetails :viewUserModal="viewUserModal" :userData="userData" @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event" />
</template>

<script>
// Importing necessary components and API modules
import asset from "@/API/Asset/Asset";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { defineRule } from "vee-validate";
import Location from "@/API/Location/Location";
import Team from "@/API/Team/Team";
import User from "@/API/User/User";
import hostRegion from "@/API/hostRegion/hostRegion";
import AssetEnvironmentCategory from "@/API/AssetEnvironmentCategory/AssetEnvironmentCategory";
import assetCategory from "@/API/assetCategory/assetCategory";
import operatingSystem from "@/API/operatingSystem/operatingSystem";
import AssetValueQuestion from "@/API/AssetValueQuestion/AssetValueQuestion";
import Department from "@/API/Department/Department";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue"; // Importing the view user details component
import Modal from "@/components/Modal.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import AssetValueCalculationModal from "./components/AssetValueCalculationModal.vue";
import Highcharts from "highcharts";
import { Chart } from "highcharts-vue";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";

// Configure Highcharts global settings
Highcharts.setOptions({
  lang: {
    decimalPoint: ".",
    thousandsSep: ",",
  },
  credits: {
    enabled: false,
  },
  chart: {
    style: {
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
  },
});

defineRule("after_or_equal", (value, [compareTo], ctx) => {
  if (!value || !compareTo) return true; // If either value is missing, no validation error
  if (value >= ctx.form[compareTo]) {
    return true; // End date is greater than or equal to the start date
  }
  return `${ctx.field} must be less than or equal to ${compareTo}.`;
});

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    ViewUserDetails,
    Modal,
    AssetValueCalculationModal,
    TabsComponent,
    highcharts: Chart, // Highcharts component for visualizations
    PurpleDotsLoader,
  },

  setup() {
    // Initialize API and other required properties
    const api = new asset();
    const apiParams = {
      with: [
        "category",
        "environment_category",
        "operating_system",
        // "owner",
        "location",
        "host_region",
      ],
    };
    const tableColumns = []; // Initialize table column definitions
    const formFields = []; // Initialize form fields
    const locationApi = new Location();
    const teamApi = new Team();
    const userApi = new User();
    const hostRegionApi = new hostRegion();
    const assetEnvironmentCategoryApi = new AssetEnvironmentCategory();
    const assetCategoryApi = new assetCategory();
    const operatingSystemApi = new operatingSystem();
    const assetvaluequestionApi = new AssetValueQuestion();
    const departmentApi = new Department();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      formFields,
      locationApi,
      teamApi,
      userApi,
      hostRegionApi,
      assetEnvironmentCategoryApi,
      assetCategoryApi,
      operatingSystemApi,
      assetvaluequestionApi,
      departmentApi,
    };
  },
  computed: {
    totalConfidentialitySum() {
      return this.confidentialityQuestions.reduce(
        (sum, confidentiality, index) => {
          let selectedValue =
            confidentiality.answers[this.selectedConfidentialityKeys[index]];
          return sum + (parseFloat(selectedValue) || 0);
        },
        0
      );
    },
    totalIntegritySum() {
      return this.integrityQuestions.reduce((sum, integrity, index) => {
        let selectedValue =
          integrity.answers[this.selectedIntegrityKeys[index]];
        return sum + (parseFloat(selectedValue) || 0);
      }, 0);
    },
    averageAvailabilitySum() {
      if (this.selectedAvailabilityKeys.length === 0) return 0;
      const total = this.selectedAvailabilityKeys.reduce(
        (sum, value) => sum + Number(value),
        0
      );
      const average = total / this.selectedAvailabilityKeys.length;
      return Math.round(average); // Round to the nearest whole number
    },
    businessImpactSum() {
      const maxConfidentialityIntegrity = Math.max(
        this.totalIntegritySum,
        this.totalConfidentialitySum
      );
      this.newItem.asset_value = Math.max(
        maxConfidentialityIntegrity,
        this.averageAvailabilitySum
      );
      return Math.max(maxConfidentialityIntegrity, this.averageAvailabilitySum);
    },
  },
  async mounted() {
    await this.fetchUsers();
    await this.fetchDepartments();
    await this.loadSelectsData();
    await this.loadAssetQuestions();
    await this.fetchAssetStatisticsData(); // Fetch statistics data
    this.load = false;
  },
  data() {
    return {
      load: true,
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      activeTab: "confidentiality",
      tabsList: [
        {
          id: "confidentiality",
          label: this.$t("asset.confidentiality"),
        },
        {
          id: "integrity",
          label: this.$t("asset.integrity"),
        },
        {
          id: "availability",
          label: this.$t("asset.availability"),
        },
      ],
      newItem: { asset_value: null }, // Data object to store the currently selected item for editing or new item
      assetCategories: [],
      hostRegions: [],
      locations: [],
      users: [],
      isModalOpen: false,
      filters: {
        ip: "",
        asset_category_id: "",
        location_id: "",
        host_region_id: "",
      },
      confidentialityQuestions: [],
      integrityQuestions: [],
      availabilityQuestions: [],
      selectedConfidentialityKeys: {}, // Stores selected Confidentiality keys per question
      selectedIntegrityKeys: {}, // Stores selected Integrity keys per question
      selectedAvailabilityKeys: [], // Stores selected Availability keys per question
      selectedAvailabilityKey: null,
      availabilitySum: 0,
      assetFilters: [
        {
          title: this.$t("asset.category"),
          key: "asset_category_id",
          type: "string",
          data: "assetCategory",
          filterType: "filter",
        },
        {
          title: this.$t("asset.location"),
          key: "location_id",
          type: "string",
          data: "Location",
          filterType: "filter",
        },
        {
          title: this.$t("asset.host_region"),
          key: "host_region_id",
          type: "string",
          data: "hostRegion",
          filterType: "filter",
        },
      ],
      userData: [],
      viewUserModal: false,
      // Color schema for charts
      chartColors: ["#A92525", "#C4951B", "#255F0B", "#999999"],
      // Statistics Data
      assetStatisticsData: {
        totalAssets: 0,
        physicalAssets: 0,
        virtualAssets: 0,
        avgAssetValue: 0,
      },
      // Chart configurations
      typeDistributionChart: {},
      categoryDistributionChart: {},
      locationDistributionChart: {},
      osDistributionChart: {},
      environmentDistributionChart: {},
      regionDistributionChart: {},
      valueDistributionChart: {},
      ownerDistributionChart: {},
      creationTimelineChart: {},
      teamDistributionChart: {},
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("asset.name"), data: "name", defaultContent: "N/A" },
      {
        id: "ip_address",
        title: this.$t("asset.ip_address"),
        data: "ip_address",
        defaultContent: "N/A",
      },
      {
        title: this.$t("asset.asset_value"),
        data: "asset_value",
        defaultContent: "N/A",
      },
      {
        id: "category",
        title: this.$t("asset.category"),
        data: "category.name",
        defaultContent: "N/A",
      },
      {
        id: "location",
        title: this.$t("asset.location"),
        data: "location.name",
        defaultContent: "N/A",
      },
      {
        id: "operating_system",
        title: this.$t("asset.operating_system"),
        data: "operating_system.name",
        defaultContent: "N/A",
      },
      {
        id: "environment_category",
        title: this.$t("asset.environment_category"),
        data: "environment_category.name",
        defaultContent: "N/A",
      },
      {
        id: "owner",
        title: this.$t("asset.owner"),
        data: "owner.full_name",
        defaultContent: "N/A",
      },
      { title: this.$t("asset.model"), data: "model", defaultContent: "N/A" },
      {
        id: "host_region",
        title: this.$t("asset.region"),
        data: "host_region.name",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.formFields = [
      {
        name: "name",
        label: this.$t("asset.name"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_name"),
      },
      {
        name: "tags",
        label: this.$t("asset.tags"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_tags"),
      },
      {
        name: "vendor_name",
        label: this.$t("asset.vendor_name"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_vendor_name"),
      },
      {
        name: "ip_address",
        label: this.$t("asset.ip_address"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_ip_address"),
      },
      {
        name: "subnet_mask",
        label: this.$t("asset.subnet_mask"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_subnet_mask"),
      },
      {
        name: "mac_address",
        label: this.$t("asset.mac_address"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_mac_address"),
      },
      {
        name: "firmware",
        label: this.$t("asset.firmware"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_firmware"),
      },
      {
        name: "url",
        label: this.$t("asset.url"),
        type: "text",
        rules: "required|url",
        col: 4,
        placeholder: this.$t("asset.enter_url"),
      },
      {
        type: "options",
        name: "type",
        label: this.$t("asset.type"),
        options: [
          { id: "physical", name: this.$t("asset.physical") },
          { id: "virtual", name: this.$t("asset.virtual") },
        ],
        optionLabel: "name",
        col: 4,
        rules: "required",
        placeholder: this.$t("asset.select_type"),
      },
      {
        name: "start_date",
        label: this.$t("common.start_date"),
        type: "date",
        rules: "required|date",
        col: 4,
        placeholder: this.$t("common.select_start_date"),
      },
      {
        name: "end_date",
        label: this.$t("common.end_date"),
        type: "date",
        rules: "required|date|after_or_equal:start_date",
        col: 4,
        placeholder: this.$t("common.select_end_date"),
      },
      {
        name: "alert_period",
        label: this.$t("asset.alert_period"),
        type: "number",
        rules: "required|number",
        col: 4,
        placeholder: this.$t("asset.enter_alert_period"),
      },
      {
        type: "options",
        name: "operating_system_id",
        label: this.$t("asset.operating_system"),
        options: "operatingSystem",
        optionLabel: "name",
        col: 4,
        rules: "required",
        placeholder: this.$t("asset.select_os"),
      },
      {
        name: "os_version",
        label: this.$t("asset.os_version"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_os_version"),
      },
      {
        name: "model",
        label: this.$t("asset.model"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_model"),
      },
      {
        type: "options",
        name: "location_id",
        label: this.$t("asset.location"),
        options: "Location",
        optionLabel: "name",
        col: 4,
        rules: "required",
        placeholder: this.$t("asset.select_location"),
      },
      {
        name: "rack_location",
        label: this.$t("asset.rack_location"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_rack_location"),
      },
      {
        name: "city",
        label: this.$t("asset.city"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_city"),
      },
      {
        name: "vlan",
        label: this.$t("asset.vlan"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_vlan"),
      },
      {
        name: "project_vlan",
        label: this.$t("asset.project_vlan"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_project_vlan"),
      },
      {
        name: "asset_value",
        label: this.$t("asset.asset_value"),
        type: "text",
        rules: "required",
        col: 4,
        placeholder: this.$t("asset.enter_asset_value"),
      },
      {
        type: "options",
        name: "asset_category_id",
        label: this.$t("asset.asset_category"),
        options: "assetCategory",
        optionLabel: "name",
        col: 4,
        rules: "required",
        placeholder: this.$t("asset.select_asset_category"),
      },
      {
        type: "options",
        name: "asset_environment_category_id",
        label: this.$t("asset.asset_environment_category"),
        options: "AssetEnvironmentCategory",
        optionLabel: "name",
        col: 4,
        rules: "required",
        placeholder: this.$t("asset.select_environment_category"),
      },
      {
        type: "options",
        name: "host_region_id",
        label: this.$t("asset.host_region"),
        options: "hostRegion",
        optionLabel: "name",
        col: 4,
        rules: "required",
        placeholder: this.$t("asset.select_host_region"),
      },
      {
        type: "user-select",
        name: "owner_id",
        label: this.$t("asset.owner"),
        // options: [],
        // optionLabel: "full_name",
        col: 6,
        multiable: true,
        rules: "required",
        placeholder: this.$t("asset.select_owner"),
      },
      {
        type: "team-select",
        name: "team_ids",
        label: this.$t("asset.teams"),
        // options: "Team",
        // optionLabel: "name",
        col: 6,
        multiple: true,
        multiable: true,
        rules: "required",
        placeholder: this.$t("asset.select_teams"),
      },
      {
        name: "details",
        label: this.$t("asset.details"),
        type: "textarea",
        rules: "required",
        col: 12,
        placeholder: this.$t("asset.enter_details"),
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    async loadSelectsData() {
      try {
        const locationsResponse = await this.locationApi.getAll({
          select: "id|name",
        });
        this.locations = locationsResponse.reduce((map, location) => {
          map[location.id] = location.name;
          return map;
        }, {});
        // this.formFields.find((field) => field.name === "location_id").options =
        //   locationsResponse;

        const teamsResponse = await this.teamApi.getAll({ select: "id|name" });
        // this.formFields.find((field) => field.name === "team_ids").options =
        //   teamsResponse;

        const usersResponse = await this.userApi.getAll({
          select: "id|full_name",
        });
        // this.formFields.find((field) => field.name === "owner_id").options =
        //   usersResponse;

        const hostRegionsResponse = await this.hostRegionApi.getAll({
          select: "id|name",
        });
        this.hostRegions = hostRegionsResponse.reduce((map, hostRegion) => {
          map[hostRegion.id] = hostRegion.name;
          return map;
        }, {});
        // this.formFields.find(
        //   (field) => field.name === "host_region_id"
        // ).options = hostRegionsResponse;

        const assetEnvironmentCategoriesResponse =
          await this.assetEnvironmentCategoryApi.getAll({ select: "id|name" });
        // this.formFields.find(
        //   (field) => field.name === "asset_environment_category_id"
        // ).options = assetEnvironmentCategoriesResponse;

        const assetCategoriesResponse = await this.assetCategoryApi.getAll({
          select: "id|name",
        });
        this.assetCategories = assetCategoriesResponse.reduce(
          (map, assetCategory) => {
            map[assetCategory.id] = assetCategory.name;
            return map;
          },
          {}
        );
        // this.formFields.find(
        //   (field) => field.name === "asset_category_id"
        // ).options = assetCategoriesResponse;

        const operatingSystemsResponse = await this.operatingSystemApi.getAll({
          select: "id|name",
        });
        // this.formFields.find(
        //   (field) => field.name === "operating_system_id"
        // ).options = operatingSystemsResponse;
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    },

    // openModal(selectedRow) {
    openModal() {
      this.isModalOpen = true;
      // selectedRow.category_id = selectedRow.category.name;
      // this.taskData = selectedRow;
    },

    closeModal() {
      this.isModalOpen = false;
    },

    async loadAssetQuestions() {
      try {
        const response = await this.assetvaluequestionApi.getAll();

        // Reset the arrays to avoid duplicate entries
        this.confidentialityQuestions = [];
        this.integrityQuestions = [];
        this.availabilityQuestions = [];

        // Loop through the response and categorize questions
        response.forEach((question) => {
          if (question.question_category === 1) {
            this.confidentialityQuestions.push(question);
          } else if (question.question_category === 2) {
            this.integrityQuestions.push(question);
          } else if (question.question_category === 3) {
            this.availabilityQuestions.push(question);
          }
        });

        console.log(this.confidentialityQuestions);
        console.log(this.integrityQuestions);
        console.log(this.availabilityQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    },

    async fetchUsers() {
      try {
        const usersResponse = await this.userApi.getAll({
          select: "id|full_name|type|email|phone|username|department_id",
        });
        // this.users = usersResponse;
        this.users = usersResponse.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});
        this.formFields.find((field) => field.name === "owner_id").options =
          usersResponse;
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    },

    // selectedAvailability(value, index) {
    //   this.selectedAvailabilityKeys[index] = value;
    //   console.log("this.selectedAvailabilityKeys[index]");
    //   console.log(this.selectedAvailabilityKeys[index]);

    // }

    // Method to calculate the sum (or perform any other action)
    updateAvailabilitySum() {
      this.availabilitySum = this.selectedAvailabilityKeys.reduce(
        (sum, value) => sum + Number(value),
        0
      );
    },

    getUserNameById(id) {
      if (!id || !this.users) return "";

      // const user = this.users.find(user => user.id === id);
      const user = this.users[id];
      return user?.full_name || "";
    },

    getUserInitials(name) {
      if (!name) return "U";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    openUserDetailsModal(selectedUserData) {
      this.userData = { ...selectedUserData };
      try {
        let userDepartment =
          this.departments[this.userData.department_id] ?? "N/A";
        this.userData.department = userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name",
        });

        this.departments = deptResponse.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    },

    // Fetch and calculate asset statistics
    async fetchAssetStatisticsData() {
      try {
        // Fetch all assets with necessary relations
        const allAssets = await this.api.getAll({
          with: [
            "category",
            "environment_category",
            "operating_system",
            "location",
            "host_region",
          ],
        });

        console.log("Fetched assets for statistics:", allAssets);

        if (!allAssets || allAssets.length === 0) {
          console.log("No assets found");
          return;
        }

        // Calculate metrics
        let totalAssets = allAssets.length;
        let physicalAssets = 0;
        let virtualAssets = 0;
        let totalAssetValue = 0;
        let assetValueCount = 0;

        // Distribution counters
        const typeCounts = {};
        const categoryCounts = {};
        const locationCounts = {};
        const osCounts = {};
        const environmentCounts = {};
        const regionCounts = {};
        const valueRanges = {
          "0-10": 0,
          "11-25": 0,
          "26-50": 0,
          "51-75": 0,
          "76-100": 0,
        };
        const ownerCounts = {};
        const creationByMonth = {};
        const teamCounts = {};

        allAssets.forEach((asset) => {
          // Count by type
          const type = asset.type || "unknown";
          typeCounts[type] = (typeCounts[type] || 0) + 1;

          if (type === "physical") {
            physicalAssets++;
          } else if (type === "virtual") {
            virtualAssets++;
          }

          // Asset value
          if (asset.asset_value) {
            const value = parseFloat(asset.asset_value);
            if (!isNaN(value)) {
              totalAssetValue += value;
              assetValueCount++;

              // Categorize by value range
              if (value <= 10) {
                valueRanges["0-10"]++;
              } else if (value <= 25) {
                valueRanges["11-25"]++;
              } else if (value <= 50) {
                valueRanges["26-50"]++;
              } else if (value <= 75) {
                valueRanges["51-75"]++;
              } else {
                valueRanges["76-100"]++;
              }
            }
          }

          // Category distribution
          const categoryName = asset.category?.name || "Uncategorized";
          categoryCounts[categoryName] =
            (categoryCounts[categoryName] || 0) + 1;

          // Location distribution
          const locationName = asset.location?.name || "Unknown Location";
          locationCounts[locationName] =
            (locationCounts[locationName] || 0) + 1;

          // Operating System distribution
          const osName = asset.operating_system?.name || "Unknown OS";
          osCounts[osName] = (osCounts[osName] || 0) + 1;

          // Environment distribution
          const envName =
            asset.environment_category?.name || "Unknown Environment";
          environmentCounts[envName] = (environmentCounts[envName] || 0) + 1;

          // Region distribution
          const regionName = asset.host_region?.name || "Unknown Region";
          regionCounts[regionName] = (regionCounts[regionName] || 0) + 1;

          // Owner distribution
          if (asset.owner_id) {
            const ownerName =
              this.getUserNameById(asset.owner_id) || "Unknown Owner";
            ownerCounts[ownerName] = (ownerCounts[ownerName] || 0) + 1;
          }

          // Creation timeline
          if (asset.created_at) {
            const monthKey = new Date(asset.created_at)
              .toISOString()
              .substring(0, 7);
            creationByMonth[monthKey] = (creationByMonth[monthKey] || 0) + 1;
          }

          // Team distribution
          if (asset.team_ids && Array.isArray(asset.team_ids)) {
            asset.team_ids.forEach((teamId) => {
              const team = this.formFields
                .find((field) => field.name === "team_ids")
                ?.options?.find((t) => t.id === teamId);
              const teamName = team?.name || `Team ${teamId}`;
              teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
            });
          }
        });

        // Calculate average asset value
        const avgAssetValue =
          assetValueCount > 0
            ? Math.round(totalAssetValue / assetValueCount)
            : 0;

        // Update statistics data
        this.assetStatisticsData = {
          totalAssets,
          physicalAssets,
          virtualAssets,
          avgAssetValue,
        };

        // Build charts
        this.buildAssetCharts(
          typeCounts,
          categoryCounts,
          locationCounts,
          osCounts,
          environmentCounts,
          regionCounts,
          valueRanges,
          ownerCounts,
          creationByMonth,
          teamCounts
        );
      } catch (error) {
        console.error("Error fetching asset statistics:", error);
      }
    },

    // Build all asset charts
    buildAssetCharts(
      typeCounts,
      categoryCounts,
      locationCounts,
      osCounts,
      environmentCounts,
      regionCounts,
      valueRanges,
      ownerCounts,
      creationByMonth,
      teamCounts
    ) {
      // 1. Type Distribution Chart (Donut)
      this.typeDistributionChart = {
        chart: { type: "pie", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        plotOptions: {
          pie: {
            innerSize: "0%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
            },
          },
        },
        series: [
          {
            name: "Assets",
            colorByPoint: true,
            data: Object.entries(typeCounts).map(([type, count]) => ({
              name: type.charAt(0).toUpperCase() + type.slice(1),
              y: count,
            })),
          },
        ],
      };

      // 2. Category Distribution Chart (Donut)
      this.categoryDistributionChart = {
        chart: { type: "pie", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        plotOptions: {
          pie: {
            innerSize: "0%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.y}",
            },
          },
        },
        series: [
          {
            name: "Assets",
            colorByPoint: true,
            data: Object.entries(categoryCounts).map(([category, count]) => ({
              name: category,
              y: count,
            })),
          },
        ],
      };

      // 3. Location Distribution Chart (Bar)
      const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.locationDistributionChart = {
        chart: { type: "line", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        xAxis: {
          categories: topLocations.map(([name]) => name),
          title: { text: null },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Assets" },
          allowDecimals: false,
        },
        plotOptions: {
          bar: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Assets",
            data: topLocations.map(([, count]) => count),
          },
        ],
      };

      // 4. Operating System Distribution Chart (Column)
      const topOS = Object.entries(osCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.osDistributionChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        xAxis: {
          categories: topOS.map(([name]) => name),
          title: { text: null },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Assets" },
          allowDecimals: false,
        },
        plotOptions: {
          column: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Assets",
            data: topOS.map(([, count]) => count),
          },
        ],
      };

      // 5. Environment Distribution Chart (Donut)
      this.environmentDistributionChart = {
        chart: { type: "pie", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        plotOptions: {
          pie: {
            innerSize: "0%",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.y}",
            },
          },
        },
        series: [
          {
            name: "Assets",
            colorByPoint: true,
            data: Object.entries(environmentCounts).map(([env, count]) => ({
              name: env,
              y: count,
            })),
          },
        ],
      };

      // 6. Region Distribution Chart (Column)
      this.regionDistributionChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        xAxis: {
          categories: Object.keys(regionCounts),
          title: { text: null },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Assets" },
          allowDecimals: false,
        },
        plotOptions: {
          column: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Assets",
            data: Object.values(regionCounts),
          },
        ],
      };

      // 7. Value Distribution Chart (Column)
      this.valueDistributionChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        xAxis: {
          categories: Object.keys(valueRanges),
          title: { text: "Asset Value Range" },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Assets" },
          allowDecimals: false,
        },
        plotOptions: {
          column: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Assets",
            data: Object.values(valueRanges),
          },
        ],
      };

      // 8. Owner Distribution Chart (Bar)
      const topOwners = Object.entries(ownerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.ownerDistributionChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        xAxis: {
          categories: topOwners.map(([name]) => name),
          title: { text: null },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Assets" },
          allowDecimals: false,
        },
        plotOptions: {
          bar: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Assets",
            data: topOwners.map(([, count]) => count),
          },
        ],
      };

      // 9. Creation Timeline Chart (Column)
      const sortedMonths = Object.keys(creationByMonth).sort();

      this.creationTimelineChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        xAxis: {
          categories:
            sortedMonths.length > 0
              ? sortedMonths.map((month) => {
                const date = new Date(month + "-01");
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
              })
              : ["No Data"],
          title: { text: "Month" },
        },
        yAxis: {
          min: 0,
          title: { text: "Assets Created" },
          allowDecimals: false,
        },
        series: [
          {
            name: "Assets Created",
            data:
              sortedMonths.length > 0
                ? sortedMonths.map((month) => creationByMonth[month])
                : [0],
          },
        ],
      };

      // 10. Team Distribution Chart (Bar)
      const topTeams = Object.entries(teamCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.teamDistributionChart = {
        chart: { type: "column", height: 300 },
        title: { text: "" },
        colors: this.chartColors,
        xAxis: {
          categories:
            topTeams.length > 0 ? topTeams.map(([name]) => name) : ["No Data"],
          title: { text: null },
        },
        yAxis: {
          min: 0,
          title: { text: "Number of Assets" },
          allowDecimals: false,
        },
        plotOptions: {
          bar: {
            dataLabels: { enabled: true },
          },
        },
        series: [
          {
            name: "Assets",
            data:
              topTeams.length > 0 ? topTeams.map(([, count]) => count) : [0],
          },
        ],
      };
    },

    handleAssetValueSubmit(payload) {
      if (payload && payload.businessImpactSum !== undefined) {
        this.newItem.asset_value = payload.businessImpactSum;
        this.selectedConfidentialityKeys = payload.selectedConfidentialityKeys;
        this.selectedIntegrityKeys = payload.selectedIntegrityKeys;
        this.selectedAvailabilityKeys = payload.selectedAvailabilityKeys;
      }
    },
  },

  watch: {
    selectedAvailabilityKeys: {
      handler(newValues) {
        // console.log("Updated selectedAvailabilityKeys:", newValues);
        this.updateAvailabilitySum();
      },
      deep: true, // Ensures nested changes are detected
    },
    // Watch for changes in the filter object
    filters: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        // Construct the filter string for apiParams
        const filtersObject = [];
        if (newFilter.ip) {
          filtersObject.push(`ip_address|%${newFilter.ip}%|like`);
        }
        if (newFilter.asset_category_id) {
          filtersObject.push(
            `asset_category_id|${newFilter.asset_category_id}|=`
          );
        }
        if (newFilter.location_id) {
          filtersObject.push(`location_id|${newFilter.location_id}|=`);
        }
        if (newFilter.host_region_id) {
          filtersObject.push(`host_region_id|${newFilter.host_region_id}|=`);
        }

        // Update apiParams with the new filter
        this.apiParams.filter = filtersObject.join("&&");
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },
  },
};
</script>

<style scoped>
/* Basic styling for the modal overlay and content */
.tab-content {
  padding-top: 1rem;
}

.title_span {
  display: inline-flex;
  align-items: center;
  width: max-content;
  height: 20px;
  opacity: 1;
  border-radius: 10px;
  padding: 11px 9px;
  gap: 8px;
  background: #d0b5e3;
  font-size: 12px;
  color: #6e3894;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Statistics Styles */
.statistics-content {
  padding: 20px;
}

/* Metric Cards */
.metric-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  min-height: 120px;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 2.5rem;
  margin-right: 20px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: #2c3e50;
}

.metric-label {
  font-size: 0.95rem;
  margin: 5px 0 0 0;
  color: #5a6c7d;
  font-weight: 500;
}

/* Chart Containers */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
  height: 100%;
}

.chart-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.chart-container-equal-height {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-container-equal-height .highcharts-container {
  flex: 1;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .metric-card {
    flex-direction: column;
    text-align: center;
    min-height: 140px;
  }

  .metric-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .metric-value {
    font-size: 1.75rem;
  }

  .chart-container {
    margin-bottom: 20px;
  }
}
</style>
