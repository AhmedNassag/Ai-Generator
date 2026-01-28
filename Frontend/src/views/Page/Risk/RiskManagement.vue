<template>
  <PurpleDotsLoader v-if="isLoading || !EditDataLoaded" />
  <main-page v-else ref="page" :mainPage="'riskmgmt.riskmgmt'" :mainSubPage="'riskmgmt.riskmgmt'"
    :titlePage="'riskmgmt.riskmgmt'">
    <div v-permission:show v-permission:update v-permission:changeStatus v-permission:editMitigation
      v-permission:acceptMitigation v-permission:rejectMtigation v-permission:historyView v-permission:comment></div>
    <template #datatable>
      <!-- Main content only rendered after risk data is available -->
      <div class="fluid-container">
        <!-- Risk Header Card -->
        <v-card class="risk-header-card mb-8" flat>
          <div class="risk-header-content">
            <!-- Left Section -->
            <div class="risk-header-left rtl">
              <div class="risk-header-text">
                <h1 class="risk-header-title d-flex rtl ">{{ currentRiskData?.subject || 'Risk Details' }}</h1>
                <p class="risk-header-subtitle d-flex rtl">
                  {{ $t('risk.status') }}:
                  <span class="status-badge" :class="getStatusClass(currentRiskData?.status)">
                    {{ currentRiskData?.status || 'N/A' }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Right Button -->
            <div class="risk-header-actions">
              <button v-internalPermission:changeStatus type="button" @click="handleRiskAction('changeStatus')"
                class="btn btn-change-status">
                {{ $t("risk.change_status") }}
              </button>

              <div v-if="EditDataLoaded" class="btn-group">
                <select v-anyPermission="['changeStatus', 'update', 'acceptMitigation', 'resetReview', 'preformReview']"
                  v-model="selectedAction" class="form-select action-select"
                  @change="handleRiskAction($event.target.value)">
                  <option selected value="" disabled>{{ $t('risk.action') }}</option>

                  <!-- Edit Risk - Only show on Identification and Analysis tabs -->
                  <option v-if="activeTab === 'home' || activeTab === 'profile'" v-internalPermission:update
                    value="EditRisk">
                    {{ $t('risk.edit_risk') }}
                  </option>

                  <!-- Close Risk - Show on all tabs -->
                  <option v-internalPermission:changeStatus value="CloseRisk">
                    {{ $t('risk.close_risk') }}
                  </option>

                  <!-- Accept/Reject Mitigation - Only show on Evaluation tab and if mitigation is required -->
                  <option v-if="activeTab === 'contact' && checkIfMitigation && accept_mitigation == 'false'"
                    v-internalPermission:acceptMitigation value="AcceptMitigation">
                    {{ $t('risk.accept_mitigation') }}
                  </option>
                  <option v-if="activeTab === 'contact' && checkIfMitigation && accept_mitigation == 'true'"
                    v-internalPermission:rejectMitigation value="RejectMitigation">
                    {{ $t('risk.reject_mitigation') }}
                  </option>

                  <!-- Reset Mitigation - Only show on Evaluation tab -->
                  <option v-if="activeTab === 'contact'" v-internalPermission:acceptMitigation value="resetMitigation"
                    :disabled="!isMitigationRequired">
                    {{ $t('risk.reset_mitigation') }}
                  </option>

                  <!-- Review Actions - Only show on Review tab -->
                  <option v-if="activeTab === 'review'" v-internalPermission:preformReview value="preformReview">
                    {{ $t('risk.perform_review') }}
                  </option>
                  <option v-if="activeTab === 'review'" v-internalPermission:resetReview value="resetReview">
                    {{ $t('risk.reset_review') }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </v-card>

        <!-- Tabs -->
        <tabs-component v-model="activeTab" :tabs="tabs" @update:modelValue="changeTab" />

        <!-- Tab Content -->
        <div class="tab-content">
          <component :is="activeComponent" :rowData="currentRiskData" :apiData="apiData"
            :dropdownOptions="dropdownOptions" :isLoading="isTabLoading" @risk-updated="handleRiskUpdated"
            @open-modal="handleOpenModal" ref="activeTabComponent">
          </component>
        </div>

        <!-- Status Change Modal -->
        <ChangeStatusModal v-model:show="isStatusModalOpen" :statusOptions="statusOptions"
          :initialStatus="currentRiskData?.status" :initialCloseOutInformation="currentRiskData?.close_out_information"
          @confirm="changeStatus" />

        <!-- Close Risk Modal -->
        <CloseRiskModal v-model:show="isCloseRiskModalOpen" :reasonOptions="dropdownOptions.riskCloseReasonOptions"
          :initialReason="currentRiskData?.reason_close"
          :initialCloseOutInformation="currentRiskData?.close_out_information" @confirm="changeStatusClose" />

        <!-- Edit Risk Analysis Modal -->
        <EditRiskAnalysisModal v-model:show="isEditRiskAnalysisModalOpen" :formData="formDataAnalysis"
          :dropdownOptions="dropdownOptions" :loading="loadingEditAnalysis" @update="updateRiskAnalysis"
          @close="closeModal" />

        <!-- Edit Risk Identification Modal -->
        <EditRiskIdentificationModal v-model:show="isEditRiskIdentificationModalOpen" :formData="formDataIdentification"
          :dropdownOptions="dropdownOptions" :controlFilteredOptions="controlFilteredOptions"
          :loading="loadingEditIdentification" @update="updateIdentification" @regulator-change="onRegulatorChange"
          @close="closeModal" />

        <!-- Reset Mitigation Modal -->
        <ResetMitigationModal v-model:show="isResetMitigationModalOpen" :loading="loadingResetMitigation"
          @confirm="resetMitigation" @close="closeModal" />
      </div>
    </template>
  </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import RiskIdentification from "./RiskManagement/RiskManagementIdentification.vue";
import RiskAnalysis from "./RiskManagement/RiskManagementAnalysis.vue";
import RiskEvaluation from "./RiskManagement/RiskManagementEvaluation.vue";
import RiskReview from "./RiskManagement/RiskManagementReview.vue";
import CommentAndTrail from "./RiskManagement/RiskManagementCommentAndTrail.vue";
import Trail from "./RiskManagement/Trail.vue";
import ChangeStatusModal from "@/views/Page/Risk/RiskManagement/ChangeStatusModal.vue";
import CloseRiskModal from "@/views/Page/Risk/RiskManagement/CloseRiskModal.vue";
import EditRiskAnalysisModal from "@/views/Page/Risk/RiskManagement/EditRiskAnalysisModal.vue";
import EditRiskIdentificationModal from "@/views/Page/Risk/RiskManagement/EditRiskIdentificationModal.vue";
import ResetMitigationModal from "@/views/Page/Risk/RiskManagement/ResetMitigationModal.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import Risk from "@/API/Risk/Risk";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Controls from "@/API/Control/Control";
import RiskCategory from "@/API/RiskCategory/RiskCategory";
import ThreatCatalog from "@/API/ThreatCatalog/ThreatCatalog";
import Location from "@/API/Location/Location";
import RiskCatalog from "@/API/RiskCatalog/RiskCatalog";
import RiskLevel from "@/API/RiskLevel/RiskLevel";
import tag from "@/API/tag/tag";
import VulnerabilityCatalogue from "@/API/VulnerabilityCatalogue/VulnerabilityCatalogue";
import Regulator from "@/API/Regulator/Regulator";
import Asset from '@/API/Asset/Asset';
import SystemSetting from "@/API/SystemSetting/SystemSetting";
import RiskSource from "@/API/RiskSource/RiskSource";
import Technology from "@/API/Technology/Technology";
import RiskPlanningStrategy from "@/API/RiskPlanningStrategy/RiskPlanningStrategy";
import RiskMitigationEffort from "@/API/RiskMitigationEffort/RiskMitigationEffort";
import Review from "@/API/Review/Review";
import frameworks from "@/API/Frameworks/Frameworks";
import riskCloseReason from "@/API/RiskCloseReason/RiskCloseReason";
import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
import PurpleDotsLoader from '@/components/PurpleDotsLoader.vue';


export default {
  setup() {
    const riskApi = new Risk();
    const userApi = new User();
    const teamApi = new Team();
    const controlApi = new Controls();
    const riskCategoryApi = new RiskCategory();
    const threatCatalogApi = new ThreatCatalog();
    const locationApi = new Location();
    const riskCatalogApi = new RiskCatalog();
    const riskLevelApi = new RiskLevel();
    const tagApi = new tag();
    const vulnerabilityCatalogueApi = new VulnerabilityCatalogue();
    const regulatorApi = new Regulator();
    const assetApi = new Asset();
    const systemSettingsApi = new SystemSetting();
    const impactScopeApi = new RiskSource();
    const technologyApi = new Technology();
    const riskPlanningStrategyApi = new RiskPlanningStrategy();
    const riskMitigationEffortApi = new RiskMitigationEffort();
    const reviewApi = new Review();
    const frameworkApi = new frameworks();
    const riskCloseReasonApi = new riskCloseReason();

    return {
      riskApi,
      userApi,
      teamApi,
      riskCategoryApi,
      threatCatalogApi,
      locationApi,
      riskCatalogApi,
      riskLevelApi,
      tagApi,
      vulnerabilityCatalogueApi,
      regulatorApi,
      controlApi,
      assetApi,
      systemSettingsApi,
      impactScopeApi,
      technologyApi,
      riskPlanningStrategyApi,
      riskMitigationEffortApi,
      reviewApi,
      frameworkApi,
      riskCloseReasonApi
    };
  },
  components: {
    MainPage,
    RiskIdentification,
    RiskAnalysis,
    RiskEvaluation,
    RiskReview,
    CommentAndTrail,
    Trail,
    TabsComponent,
    ChangeStatusModal,
    CloseRiskModal,
    EditRiskAnalysisModal,
    EditRiskIdentificationModal,
    ResetMitigationModal,
    PurpleDotsLoader,

  },
  async created() {
    // Fetch risk row first, only then load other tab data and setup tabs
    this.isLoading = true;

    try {
      await this.getRiskData();
      await this.setupTabs();
      await this.loadTabData(this.activeTab);
    } catch (error) {
      console.error("Error loading data:", error);
      this.$notify({
        type: "error",
        text: this.$t("common.error_loading_data"),
      });
    } finally {
      this.isLoading = false;
    }
  },
  data() {
    return {
      loadedTabs: new Set(),
      activeTab: "home",
      currentRiskData: null,
      isLoading: false,
      isTabLoading: false,
      tabs: [],
      EditDataLoaded: false,
      selectedAction: '',
      isEditRiskAnalysisModalOpen: false,
      isEditRiskIdentificationModalOpen: false,
      isCloseRiskModalOpen: false,
      isStatusModalOpen: false,
      isResetMitigationModalOpen: false,
      loadingEditAnalysis: false,
      loadingEditIdentification: false,
      loadingResetMitigation: false,
      checkIfMitigation: false,
      accept_mitigation: 'false',
      controlFilteredOptions: [],
      formDataAnalysis: {
        id: null,
        technology_ids: [],
        impact_scope_id: '',
        responsible_party: '',
        kris: '',
        description: '',
        supporting_document: null
      },
      formDataIdentification: {
        id: null,
        risk_mapping_ids: [],
        threat_mapping_ids: [],
        created_at: null,
        category_id: null,
        location_ids: [],
        stakeholder_ids: [],
        owner_id: null,
        tag_ids: [],
        team_ids: [],
        vuln_catalogs: [],
        risk_scenario: '',
        exsting_control: '',
        regulator_id: null,
        control_id: [],
        asset_ids: [],
        reference_id: ''
      },
      statusOptions: [
        { text: 'New', value: 'New' },
        { text: 'Mitigation Planned', value: 'Mitigation Planned' },
        { text: 'Mgmt Reviewed', value: 'Mgmt Reviewed' },
        { text: 'Closed Risk', value: 'Closed Risk' },
        { text: 'Reopened', value: 'Reopened' },
      ],
      apiData: {
        users: [],
        teams: [],
        controls: [],
        riskCategories: [],
        threats: [],
        locations: [],
        riskCatalogs: [],
        riskLevels: [],
        tags: [],
        vulnCatalogs: [],
        regulators: [],
        assets: [],
        impactScope: [],
        technology: [],
        riskPlanningStrategy: [],
        riskMitigationEffort: [],
        riskFormula: [],
        review: [],
        frameworks: [],
        riskCloseReason: []
      },
      dropdownOptions: {
        riskCategoryOptions: [],
        riskOptions: [],
        threatOptions: [],
        locationOptions: [],
        userOptions: [],
        teamOptions: [],
        tagOptions: [],
        vulnCatalogsOptions: [],
        regulatorOptions: [],
        controlOptions: [],
        assetOptions: [],
        impactScopeOptions: [],
        technologyOptions: [],
        riskPlanningStrategyOptions: [],
        mitigationEffortOptions: [],
        riskSettingsOptions: [],
        reviewOptions: [],
        frameworkOptions: [],
        riskCloseReasonOptions: []
      },
      tabDataRequirements: {
        'home': ['users', 'teams', 'riskCategories', 'threats', 'locations', 'riskCatalogs', 'tags', 'riskFormula', 'vulnCatalogs', 'regulators', 'controls', 'assets', 'frameworks', 'riskCloseReason'],
        'profile': ['users', 'impactScope', 'technology', 'riskFormula', 'riskCloseReason'],
        'contact': ['users', 'teams', 'controls', 'riskFormula', 'riskPlanningStrategy', 'riskMitigationEffort', 'riskCloseReason'],
        'review': ['riskFormula', 'controls', 'review', 'users', 'riskCloseReason'],
        'comments': ['users', 'riskCloseReason'],
        'trail': ['users', 'riskCloseReason'],
      }
    };
  },
  computed: {
    activeComponent() {
      const componentMap = {
        'home': this.$options.components.RiskIdentification,
        'profile': this.$options.components.RiskAnalysis,
        'contact': this.$options.components.RiskEvaluation,
        'review': this.$options.components.RiskReview,
        'comments': this.$options.components.CommentAndTrail,
        'trail': this.$options.components.Trail
      };

      return componentMap[this.activeTab] || this.$options.components.RiskIdentification;
    },
    isMitigationRequired() {
      const inherentRisk = parseFloat(this.currentRiskData?.inherent_risk || 0);
      const appetite = this.riskAppetite;
      return inherentRisk > appetite;
    },
    riskAppetite() {
      const item = this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'appetitetolerance'
      );
      return item[0]?.appetite ?? 0;
    }
  },
  watch: {
    'dropdownOptions.controlOptions': {
      handler(newVal) {
        if (newVal && newVal.length > 0 && !this.formDataIdentification.regulator_id) {
          this.controlFilteredOptions = newVal;
        }
      },
      immediate: true
    }
  },
  methods: {
    getStatusClass(status) {
      const statusMap = {
        'New': 'status-new',
        'Mitigation Planned': 'status-planned',
        'Mgmt Reviewed': 'status-reviewed',
        'Closed Risk': 'status-closed',
        'Reopened': 'status-reopened'
      };
      return statusMap[status] || 'status-default';
    },

    handleOpenModal(modalType) {
      if (modalType === 'editRiskAnalysis') {
        this.formDataAnalysis = {
          id: this.currentRiskData?.id,
          technology_ids: this.currentRiskData?.technology_ids ? [...this.currentRiskData.technology_ids] : [],
          impact_scope_id: this.currentRiskData?.impact_scope_id || null,
          responsible_party: this.currentRiskData?.responsible_party || '',
          kris: this.currentRiskData?.kris || '',
          description: this.currentRiskData?.description || '',
          supporting_document: null
        };
        this.isEditRiskAnalysisModalOpen = true;
      } else if (modalType === 'editRiskIdentification') {
        this.formDataIdentification = {
          id: this.currentRiskData?.id,
          risk_mapping_ids: this.currentRiskData?.risk_mapping_ids ? [...this.currentRiskData.risk_mapping_ids] : [],
          threat_mapping_ids: this.currentRiskData?.threat_mapping_ids ? [...this.currentRiskData.threat_mapping_ids] : [],
          created_at: this.currentRiskData?.created_at || null,
          category_id: this.currentRiskData?.category_id || null,
          location_ids: this.currentRiskData?.location_ids ? [...this.currentRiskData.location_ids] : [],
          stakeholder_ids: this.currentRiskData?.stakeholder_ids ? [...this.currentRiskData.stakeholder_ids] : [],
          owner_id: this.currentRiskData?.owner_id || null,
          tag_ids: this.currentRiskData?.tag_ids ? [...this.currentRiskData.tag_ids] : [],
          team_ids: this.currentRiskData?.team_ids ? [...this.currentRiskData.team_ids] : [],
          vuln_catalogs: this.currentRiskData?.vuln_catalogs ? [...this.currentRiskData.vuln_catalogs] : [],
          risk_scenario: this.currentRiskData?.risk_scenario || '',
          exsting_control: this.currentRiskData?.exsting_control || '',
          regulator_id: this.currentRiskData?.regulator_id || null,
          control_id: this.currentRiskData?.control_id ? [...this.currentRiskData.control_id] : [],
          asset_ids: this.currentRiskData?.asset_ids ? [...this.currentRiskData.asset_ids] : [],
          reference_id: this.currentRiskData?.reference_id || ''
        };

        // If regulator already present in the loaded form data, request parent to filter controls
        // without clearing existing control selection.
        if (this.formDataIdentification.regulator_id) {
          this.onRegulatorChange(this.formDataIdentification.regulator_id, false);
        }

        this.isEditRiskIdentificationModalOpen = true;
      }
    },

    // Accept regulatorId (may be undefined/null) and an optional flag resetControls.
    // When resetControls is true we clear only the control selection; we do NOT reset other selects.
    onRegulatorChange(regulatorId, resetControls = true) {
      // Only clear control ids if caller explicitly requests it.
      if (resetControls) {
        this.formDataIdentification.control_id = [];
      }

      // If no regulatorId provided, show all control options (or previously filtered options).
      if (!regulatorId) {
        this.controlFilteredOptions = this.dropdownOptions.controlOptions;
        return;
      }

      // Find relevant framework ids for selected regulator(s)
      const relevantFrameworks = (Array.isArray(this.dropdownOptions.frameworkOptions)
        ? this.dropdownOptions.frameworkOptions
        : []
      )
        .filter(f => f.regulator_id === regulatorId)
        .map(f => f.id);

      this.controlFilteredOptions = (this.dropdownOptions.controlOptions || []).filter(c =>
        relevantFrameworks.includes(c.framework_id)
      );
    },

    async loadTabData(tabId) {
      if (this.loadedTabs.has(tabId)) {
        return;
      }

      this.isTabLoading = true;

      try {
        const requiredData = this.tabDataRequirements[tabId] || [];

        const apiPromises = requiredData.map(async (key) => {
          if (this.apiData[key]?.length > 0) {
            return { key, data: this.apiData[key] };
          }

          try {
            let response;

            switch (key) {
              case "users":
                response = await this.userApi.getAll({ select: "id|full_name" });
                break;
              case "teams":
                response = await this.teamApi.getAll({ select: "id|name" });
                break;
              case "controls":
                response = await this.controlApi.getAll({ select: "id|short_name|framework_id|mitigation_percent" });
                break;
              case "riskCategories":
                response = await this.riskCategoryApi.getAll({ select: "id|name" });
                break;
              case "threats":
                response = await this.threatCatalogApi.getAll({ select: "id|name" });
                break;
              case "locations":
                response = await this.locationApi.getAll({ select: "id|name" });
                break;
              case "riskCatalogs":
                response = await this.riskCatalogApi.getAll({ select: "id|name" });
                break;
              case "riskLevels":
                response = await this.riskLevelApi.getAll({ select: "id|from|color|name" });
                break;
              case "tags":
                response = await this.tagApi.getAll({ select: "id|name" });
                break;
              case "vulnCatalogs":
                response = await this.vulnerabilityCatalogueApi.getAll({ select: "id|name" });
                break;
              case "regulators":
                response = await this.regulatorApi.getAll({ select: "id|name" });
                break;
              case "assets":
                response = await this.assetApi.getAll({ select: "id|name" });
                break;
              case "impactScope":
                response = await this.impactScopeApi.getAll({ select: "id|name" });
                break;
              case "technology":
                response = await this.technologyApi.getAll({ select: "id|name" });
                break;
              case "riskPlanningStrategy":
                response = await this.riskPlanningStrategyApi.getAll({ select: "id|name" });
                break;
              case "riskMitigationEffort":
                response = await this.riskMitigationEffortApi.getAll({ select: "id|name" });
                break;
              case "riskFormula":
                const type = ["risk_calculation_formula", "impacts", "likelihoods", "appetitetolerance"];
                const typeCategory = type.join(",");
                response = await this.systemSettingsApi.getAll({ filterIn: `type|${typeCategory}` });
                break;
              case "review":
                response = await this.reviewApi.getAll({ select: "id|name" });
                break;
              case "frameworks":
                response = await this.frameworkApi.getAll({ select: "id|title|regulator_id" });
                break;
              case "riskCloseReason":
                response = await this.riskCloseReasonApi.getAll({ select: "id|name" });
                break;
              default:
                response = [];
            }

            return { key, data: response || [] };
          } catch (err) {
            console.error(`Error loading ${key}:`, err);
            return { key, data: [] };
          }
        });

        const results = await Promise.all(apiPromises);

        results.forEach(({ key, data }) => {
          this.apiData[key] = Array.isArray(data) ? data : [];
        });

        this.updateDropdownOptions();
        this.loadedTabs.add(tabId);
      } catch (error) {
        console.error(`Error loading tab ${tabId} data:`, error);
      } finally {
        this.isTabLoading = false;
      }
    },

    updateDropdownOptions() {
      this.dropdownOptions = {
        riskCategoryOptions: this.apiData.riskCategories,
        riskOptions: this.apiData.riskCatalogs,
        threatOptions: this.apiData.threats,
        locationOptions: this.apiData.locations,
        userOptions: this.apiData.users,
        teamOptions: this.apiData.teams,
        tagOptions: this.apiData.tags,
        vulnCatalogsOptions: this.apiData.vulnCatalogs,
        regulatorOptions: this.apiData.regulators,
        controlOptions: this.apiData.controls,
        assetOptions: this.apiData.assets,
        impactScopeOptions: this.apiData.impactScope,
        technologyOptions: this.apiData.technology,
        riskPlanningStrategyOptions: this.apiData.riskPlanningStrategy,
        mitigationEffortOptions: this.apiData.riskMitigationEffort,
        riskSettingsOptions: this.apiData.riskFormula,
        reviewOptions: this.apiData.review,
        frameworkOptions: this.apiData.frameworks,
        riskCloseReasonOptions: this.apiData.riskCloseReason
      };
    },

    async getRiskData() {
      try {
        const riskData = await this.riskApi.getAll({
          filter: `id|${this.$route.params.id}|=`,

          with: [
            "category:id,name",
            "risk_mapping:id,name,risk_ids",
            "threat_mapping:id,name,risk_ids",
            "locations:id,name,risk_ids",
            "tags:id,name,risk_ids",
            "review:id,name",
            "mitigation_effort:id,name",
            "impact_scope:id,name",
          ],
        });

        if (riskData?.length > 0) {
          this.currentRiskData = this.enrichRiskData(riskData[0]);
          this.checkIfMitigation = this.currentRiskData?.mitigation_status === 'planMitigation';
          // Always set as string, even if database returns boolean or string
          if (typeof this.currentRiskData?.accept_mitigation === 'string') {
            this.accept_mitigation = this.currentRiskData.accept_mitigation === 'true' ? 'true' : 'false';
          } else {
            this.accept_mitigation = this.currentRiskData.accept_mitigation ? 'true' : 'false';
          }
          this.EditDataLoaded = true;
        }
      } catch (error) {
        console.error("Error fetching risk data:", error);
        throw error;
      }
    },

    enrichRiskData(risk) {
      const safeArrayIncludes = (array, value) =>
        Array.isArray(array) ? array.includes(value) : false;

      let enrichedRisk = { ...risk };
      const users = this.apiData?.users || [];
      const teams = this.apiData?.teams || [];
      const controls = this.apiData?.controls || [];

      enrichedRisk.createdBy = users.find((u) => u.id === risk.created_by_id) || null;
      enrichedRisk.owner = users.find((u) => u.id === risk.owner_id) || null;
      enrichedRisk.mitigation_owner = users.find((u) => u.id === risk.mitigation_owner_id) || null;
      enrichedRisk.review_user = users.find((u) => u.id === risk.review_by) || null;

      enrichedRisk.stakeholders = users.filter((u) =>
        safeArrayIncludes(risk.stakeholder_ids, u.id)
      );
      enrichedRisk.teams = teams.filter((t) =>
        safeArrayIncludes(risk.team_ids, t.id)
      );
      enrichedRisk.mitigation_teams = teams.filter((t) =>
        safeArrayIncludes(risk.mitigation_team_ids, t.id)
      );
      enrichedRisk.mitigation_controls = controls.filter((c) =>
        safeArrayIncludes(risk.mitigation_control_ids, c.id)
      );

      return enrichedRisk;
    },

    setupTabs() {
      this.tabs = [
        {
          id: "home",
          label: this.$t("risk.risk_identification"),
          component: "RiskIdentification"
        },
        {
          id: "profile",
          label: this.$t("risk.risk_analysis"),
          component: "RiskAnalysis"
        },
        {
          id: "contact",
          label: this.$t("risk.risk_evaluation_and_treatment"),
          component: "RiskEvaluation"
        },
        {
          id: "review",
          label: this.$t("risk.risk_reviewing_and_monitoring"),
          component: "RiskReview"
        },
        {
          id: "comments",
          label: this.$t("risk.comments"),
          component: "CommentAndTrail"
        }, {
          id: "trail",
          label: this.$t("risk.Trail"),
          component: "Trail"
        },
      ];
    },

    async changeTab(tabId) {
      await this.loadTabData(tabId);
    },

    async changeStatus(payload) {
      const selectedStatus = payload?.status;
      const closeOutInformation = payload?.closeOutInformation;

      if (!this.currentRiskData?.id || !selectedStatus) return;

      const result = await Swal.fire({
        title: this.$t('risk.confirm_change_status'),
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: this.$t('risk.cancel'),
        confirmButtonColor: "#6E3894",
        cancelButtonColor: "#ffc107",
        confirmButtonText: this.$t('common.yes'),
      });

      if (!result.isConfirmed) return;

      try {
        const data = { id: this.currentRiskData?.id, status: selectedStatus };

        if (payload?.reason_close === null) {
          data.close_out_information = null;
          data.reason_close = null;
        } else if (closeOutInformation) {
          data.close_out_information = closeOutInformation;
          data.reason_close = selectedStatus;
        }

        const response = await this.riskApi.changeStatus(data);
        if (response.status == 'success') {
          this.currentRiskData.status = response.data.status ?? selectedStatus;
          if (payload?.reason_close === null) {
            this.currentRiskData.close_out_information = null;
            this.currentRiskData.reason_close = null;
          } else {
            if (response.data.close_out_information !== undefined) this.currentRiskData.close_out_information = response.data.close_out_information;
            if (response.data.reason_close !== undefined) this.currentRiskData.reason_close = response.data.reason_close;
          }

          notify({
            title: this.$t('risk.status_changed_success'),
            text: this.$t('common.operation_success'),
            type: "success"
          });
        } else {
          notify({
            title: this.$t('risk.status_change_error'),
            text: response?.message,
            type: "error"
          });
        }
      } catch (error) {
        console.error('Error changing risk status', error);
        notify({
          title: this.$t('risk.status_change_error'),
          text: error.message || error,
          type: "error"
        });
      }
    },

    async changeStatusClose(payload) {
      const reasonId = payload?.reasonId;
      const closeOutInformation = payload?.closeOutInformation;

      if (reasonId === 'Reopened' || reasonId === 'reopened') {
        return this.changeStatus({ status: 'Reopened', closeOutInformation: '' });
      }

      if (!this.currentRiskData?.id) return;

      const result = await Swal.fire({
        title: this.$t('risk.confirm_close_risk'),
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: this.$t('risk.cancel'),
        confirmButtonColor: "#6E3894",
        cancelButtonColor: "#ffc107",
        confirmButtonText: this.$t('common.yes'),
      });

      if (!result.isConfirmed) return;

      try {
        const data = { id: this.currentRiskData.id, status: 'Closed Risk' };
        if (closeOutInformation) data.close_out_information = closeOutInformation;
        if (reasonId) data.reason_close = reasonId;

        const response = await this.riskApi.changeStatus(data);
        if (response.status == 'success') {
          this.currentRiskData.status = response.data.status;
          if (response.data.close_out_information) this.currentRiskData.close_out_information = response.data.close_out_information;
          if (response.data.reason_close) this.currentRiskData.reason_close = response.data.reason_close;
          notify({
            title: this.$t('risk.close_risk_success'),
            text: this.$t('common.operation_success'),
            type: 'success'
          });
        } else {
          notify({
            title: this.$t('risk.close_risk_error'),
            text: response?.message,
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error closing risk', error);
        notify({
          title: this.$t('risk.close_risk_error'),
          text: error.message || error,
          type: 'error'
        });
      }
    },

    closeModal() {
      this.isEditRiskAnalysisModalOpen = false;
      this.isEditRiskIdentificationModalOpen = false;
      this.isStatusModalOpen = false;
      this.isCloseRiskModalOpen = false;
      this.isResetMitigationModalOpen = false;
      this.selectedAction = '';

      this.formDataAnalysis = {
        id: null,
        technology_ids: [],
        impact_scope_id: '',
        responsible_party: '',
        kris: '',
        description: '',
        supporting_document: null
      };

      this.formDataIdentification = {
        id: null,
        risk_mapping_ids: [],
        threat_mapping_ids: [],
        created_at: null,
        category_id: null,
        location_ids: [],
        stakeholder_ids: [],
        owner_id: null,
        tag_ids: [],
        team_ids: [],
        vuln_catalogs: [],
        risk_scenario: '',
        exsting_control: '',
        regulator_id: null,
        control_id: [],
        asset_ids: [],
        reference_id: ''
      };
    },

    async updateRiskAnalysis(formData) {
      console.log('Updating risk analysis with data:', formData || this.formData);
      const dataToUpdate = formData || this.formData;

      if (!dataToUpdate || !dataToUpdate.id) {
        console.error('Invalid formData or missing ID:', dataToUpdate);
        notify({
          title: this.$t('common.error'),
          text: 'Risk ID is missing. Cannot update.',
          type: "error"
        });
        return;
      }

      this.loadingEditAnalysis = true;
      try {
        const formDataToSend = new FormData();

        // Append the ID
        formDataToSend.append('id', dataToUpdate.id);

        // Append technology_ids properly
        if (dataToUpdate.technology_ids && dataToUpdate.technology_ids.length > 0) {
          dataToUpdate.technology_ids.forEach((id) => {
            formDataToSend.append('technology_ids[]', id);
          });
        }

        // Append other fields
        if (dataToUpdate.impact_scope_id) {
          formDataToSend.append('impact_scope_id', dataToUpdate.impact_scope_id);
        }

        if (dataToUpdate.responsible_party) {
          formDataToSend.append('responsible_party', dataToUpdate.responsible_party);
        }

        if (dataToUpdate.kris) {
          formDataToSend.append('kris', dataToUpdate.kris);
        }

        if (dataToUpdate.description) {
          formDataToSend.append('description', dataToUpdate.description);
        }
        // Handle SINGLE file upload
        if (dataToUpdate.supporting_document && dataToUpdate.supporting_document instanceof File) {
          formDataToSend.append('supporting_document', dataToUpdate.supporting_document);
        }

        // Debug log
        console.log('FormData contents:');
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0], pair[1]);
        }

        const response = await this.riskApi.updateRiskAnalysis(formDataToSend);

        if (response.status === 'success' || response) {
          this.closeModal();
          await this.getRiskData();
          notify({
            title: this.$t('risk.update_success'),
            text: this.$t('risk.risk_analysis_updated'),
            type: "success"
          });
          this.$emit("risk-updated", response);
        }
      } catch (error) {
        console.error('Error updating risk analysis:', error);
        notify({
          title: this.$t('risk.update_error'),
          text: error.message || error,
          type: "error"
        });
      } finally {
        this.loadingEditAnalysis = false;
      }
    },

    async updateIdentification(formData) {
      this.loadingEditIdentification = true;
      try {
        const response = await this.riskApi.updateIdentification(formData);

        if (response.status === 'success') {
          this.closeModal();
          await this.getRiskData();

          notify({
            title: this.$t('risk.update_success'),
            text: this.$t('risk.risk_identification_updated'),
            type: "success"
          });
        } else {
          notify({
            title: this.$t('risk.update_error'),
            text: response?.message || this.$t('common.operation_failed'),
            type: "error"
          });
        }
      } catch (error) {
        console.error('Error updating risk identification:', error);
        notify({
          title: this.$t('risk.update_error'),
          text: error.message || error,
          type: "error"
        });
      } finally {
        this.loadingEditIdentification = false;
      }
    },

    handleRiskAction(value) {
      if (value === 'EditRisk') {
        if (this.activeTab === 'profile') {
          this.handleOpenModal('editRiskAnalysis');
        } else if (this.activeTab === 'home') {
          this.handleOpenModal('editRiskIdentification');
        }
      } else if (value == 'CloseRisk') {
        this.isCloseRiskModalOpen = true;
      } else if (value == 'changeStatus') {
        this.isStatusModalOpen = true;
      } else if (value == 'resetMitigation') {
        this.isResetMitigationModalOpen = true;
      } else if (value == 'preformReview') {
        if (this.$refs.activeTabComponent && this.$refs.activeTabComponent.openPerformReviewModal) {
          this.$refs.activeTabComponent.openPerformReviewModal();
        }
      } else if (value == 'resetReview') {
        if (this.$refs.activeTabComponent && this.$refs.activeTabComponent.openResetReviewModal) {
          this.$refs.activeTabComponent.openResetReviewModal();
        }
      }
      else if (value == 'AcceptMitigation') {
        this.handleAcceptMitigation('true');
      }
      else if (value == 'RejectMitigation') {
        this.handleAcceptMitigation('false');
      }
      this.selectedAction = '';
    },

    async handleAcceptMitigation(mitigationStatus) {
      // mitigationStatus is a string: "true" or "false"
      const action = mitigationStatus === 'true' ? 'accept' : 'reject';

      const result = await Swal.fire({
        title: this.$t(`risk.confirm_${action}_mitigation`),
        icon: "question",
        showCancelButton: true,
        cancelButtonText: this.$t('risk.cancel'),
        confirmButtonColor: mitigationStatus === 'true' ? "#049123" : "#b31029",
        cancelButtonColor: "#6c757d",
        confirmButtonText: this.$t('common.yes'),
      });

      if (!result.isConfirmed) return;

      try {
        const response = await this.riskApi.update({
          id: this.currentRiskData.id,
          accept_mitigation: mitigationStatus // "true" or "false" as string
        });

        if (response.status == 'success') {
          await this.getRiskData();

          notify({
            title: this.$t(`risk.${action}_mitigation_success`),
            text: this.$t('common.operation_success'),
            type: "success",
          });
        } else {
          notify({
            title: this.$t(`risk.${action}_mitigation_error`),
            text: response?.message || this.$t('common.operation_failed'),
            type: "error",
          });
        }
      } catch (error) {
        console.error(`Error ${action}ing mitigation:`, error);
        notify({
          title: this.$t(`risk.${action}_mitigation_error`),
          text: error.message || error,
          type: "error",
        });
      }
    },

    async resetMitigation() {
      this.loadingResetMitigation = true;

      let resetMitigationData = {
        id: this.currentRiskData.id,
        mitigation_status: "noMitigation",
        mitigation_planing: "",
        mitigation_effort_id: "",
        mitigation_owner_id: "",
        mitigation_cost: "",
        mitigation_percent: "",
        current_solution: "",
        security_recommendations: "",
        security_requirements: "",
        mitigation_team_ids: [],
        mitigation_control_ids: [],
        selected_treatment_decision: null,
        accepting_justification: "",
        counter_party: "",
        coverage_percent: "",
        avoiding_action: "",
        effective_date: "",
        operational_impact: "",
      };

      try {
        const response = await this.riskApi.resetMitigation(resetMitigationData);
        if (response.status === 'success') {
          await this.getRiskData();
          this.closeModal();
          notify({
            title: this.$t('risk.reset_mitigation_success'),
            text: this.$t('risk.mitigation_data_cleared'),
            type: "success",
          });
        }
      } catch (error) {
        console.error("Error resetting mitigation:", error);
        notify({
          title: this.$t('risk.reset_mitigation_error'),
          text: error?.message || this.$t('common.operation_failed'),
          type: "error",
        });
      } finally {
        this.loadingResetMitigation = false;
      }
    },

    async handleRiskUpdated(updatedRiskData) {
      try {
        this.currentRiskData = { ...this.currentRiskData, ...updatedRiskData };
        await this.getRiskData();
      } catch (error) {
        console.error("Error handling risk update:", error);
      }
    },

    clearTabCache(tabId = null) {
      if (tabId) {
        this.loadedTabs.delete(tabId);
      } else {
        this.loadedTabs.clear();
      }
    }
  },
};
</script>

<style scoped>
.risk-header-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 20px 28px;
  border-radius: 12px;
  border-left: 5px solid #6E3894;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.risk-header-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.risk-header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.risk-header-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.risk-header-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

.risk-header-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-new {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-planned {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-reviewed {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.status-closed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-reopened {
  background-color: #ffebee;
  color: #c62828;
}

.status-default {
  background-color: #f5f5f5;
  color: #757575;
}

.risk-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-group {
  border-radius: 15px;
  background: #6E3894;
  color: white;
  border: 2px solid #6E3894;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-change-status {
  background: transparent;
  color: #6E3894;
  border: 2px solid #6E3894;
  border-radius: 15px;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-accept-mitigation {
  background: linear-gradient(45deg, #03781d, #049123);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(3, 120, 29, 0.2);
}

.btn-accept-mitigation:hover {
  background: linear-gradient(45deg, #026518, #037e1d);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(3, 120, 29, 0.3);
}

.btn-reject-mitigation {
  background: linear-gradient(45deg, #940d24, #b31029);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(148, 13, 36, 0.2);
}

.btn-reject-mitigation:hover {
  background: linear-gradient(45deg, #7a0b1e, #980d24);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(148, 13, 36, 0.3);
}

.action-select {
  background-color: #6E3894;
  color: white;
  border: none;
  padding: 10px 40px 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all 0.3s ease;
}

.action-select:hover {
  background-color: #5a2d75;
}

.action-select option {
  background-color: white;
  color: #2c3e50;
}

.action-select option:disabled {
  color: #9e9e9e;
}

.global-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 12px;
  padding: 36px;
}

.spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 6px solid rgba(0, 0, 0, 0.08);
  border-top-color: #6E3894;
  animation: spin 0.9s linear infinite;
}

.loading-text {
  color: #666;
  font-weight: 600;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .risk-header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .risk-header-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>