<template>
  <!-- Local loading until rowData is ready -->
  <div v-if="!isDataReady" class="child-loading">
    <div class="spinner-small"></div>
    <div class="loading-text">{{ $t('common.loading') || 'Loading...' }}</div>
  </div>

  <div v-else>
    <!-- Accordion Section -->
    <div class="accordion risk-accordion mb-5" id="accordionExample">
      <!-- Risk Scoring History -->
      <div class="accordion-item risk-accordion-item">
        <h2 class="accordion-header risk-accordion-header">
          <button class="accordion-button risk-accordion-button" type="button" @click="toggleAccordion('history')"
            :class="{ 'collapsed': isAccordionOpen !== 'history' }">
            <span class="according-title">{{ $t('risk.risk_scoring_history') }}</span>
            <i class="fas fa-chevron-down accordion-chevron"
              :class="{ 'rotate-icon': isAccordionOpen === 'history' }"></i>
          </button>
        </h2>
        <div v-show="isAccordionOpen === 'history'" class="accordion-collapse risk-accordion-collapse"
          :class="{ 'show': isAccordionOpen === 'history' }">
          <div class="accordion-body risk-accordion-body">
            <div v-if="isHistoryLoading" class="history-loading">
              <div class="spinner-small"></div>
              <div class="loading-text">{{ $t('common.loading') || 'Loading...' }}</div>
            </div>

            <div v-else-if="!hasScoringData" class="no-history">
              {{ $t('risk.no_scoring_history') || 'No scoring history available.' }}
            </div>

            <div v-else id="riskScoringChart" ref="riskChart" style="height: 400px;"></div>
          </div>
        </div>
      </div>

      <!-- Other Information -->
      <div class="accordion-item risk-accordion-item">
        <h2 class="accordion-header risk-accordion-header">
          <button class="accordion-button risk-accordion-button collapsed" type="button"
            @click="toggleAccordion('info')" :class="{ 'collapsed': isAccordionOpen !== 'info' }">
            <span class="according-title">{{ $t('risk.other_information') }}</span>
            <i class="fas fa-chevron-down accordion-chevron" :class="{ 'rotate-icon': isAccordionOpen === 'info' }"></i>
          </button>
        </h2>

        <div v-show="isAccordionOpen === 'info'" class="accordion-collapse risk-accordion-collapse"
          :class="{ 'show': isAccordionOpen === 'info' }">
          <div class="accordion-body risk-accordion-body">
            <div class="info-container">
              <div class="info-row">
                <!-- Mapping -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-map-signs"></i>
                      <span>{{ $t('risk.mapping') }}</span>
                    </div>
                    <div class="info-badges-container" v-if="rowData?.risk_mapping?.length">
                      <span v-for="(item, index) in getDisplayItems(rowData.risk_mapping, 'name', 'risk_mapping')"
                        :key="index" class="info-badge">
                        {{ item.name }}
                      </span>
                      <button v-if="rowData.risk_mapping.length > 3"
                        @click="openModal('Mapping', rowData.risk_mapping, 'name')" class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.risk_mapping.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Threat Mapping -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-shield-alt"></i>
                      <span>{{ $t('risk.threat_mapping') }}</span>
                    </div>
                    <div class="info-badges-container" v-if="rowData?.threat_mapping?.length">
                      <span v-for="(item, index) in getDisplayItems(rowData.threat_mapping, 'name', 'threat_mapping')"
                        :key="index" class="info-badge">
                        {{ item.name }}
                      </span>
                      <button v-if="rowData.threat_mapping.length > 3"
                        @click="openModal('Threat Mapping', rowData.threat_mapping, 'name')" class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.threat_mapping.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Category -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-folder"></i>
                      <span>{{ $t('risk.category') }}</span>
                    </div>
                    <span v-if="rowData?.category?.name" class="info-badge">{{ rowData.category.name }}</span>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Owner -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-user-shield"></i>
                      <span>{{ $t('risk.owner') }}</span>
                    </div>
                    <span v-if="getOwnerName(rowData?.owner_id)" class="info-badge">
                      {{ getOwnerName(rowData?.owner_id) }}
                    </span>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Site Location -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>{{ $t('risk.site_location') }}</span>
                    </div>
                    <div class="info-badges-container" v-if="rowData?.locations?.length">
                      <span v-for="(item, index) in getDisplayItems(rowData.locations, 'name', 'locations')"
                        :key="index" class="info-badge">
                        {{ item.name }}
                      </span>
                      <button v-if="rowData.locations.length > 3"
                        @click="openModal('Site Location', rowData.locations, 'name')" class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.locations.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Teams -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-users"></i>
                      <span>{{ $t('risk.teams') }}</span>
                    </div>
                    <div v-if="rowData?.team_ids?.length" class="info-badges-container">
                      <span v-for="(id, index) in getDisplayIds(rowData.team_ids, 'team_ids')" :key="index"
                        class="info-badge">
                        {{ getTeamName(id) }}
                      </span>
                      <button v-if="rowData.team_ids.length > 3"
                        @click="openIdModal('Teams', rowData.team_ids, 'getTeamName')" class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.team_ids.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>
                <!-- Additional Stakeholders -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-user-friends"></i>
                      <span>{{ $t('risk.additional_stakeholders') }}</span>
                    </div>
                    <div v-if="rowData?.stakeholder_ids?.length" class="info-badges-container">
                      <span v-for="(id, index) in getDisplayIds(rowData.stakeholder_ids, 'stakeholder_ids')"
                        :key="index" class="info-badge">
                        {{ getStakeholderName(id) }}
                      </span>
                      <button v-if="rowData.stakeholder_ids.length > 3"
                        @click="openIdModal('Additional Stakeholders', rowData.stakeholder_ids, 'getStakeholderName')"
                        class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.stakeholder_ids.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Risk Scenario -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-film"></i>
                      <span>{{ $t('risk.risk_scenario') }}</span>
                    </div>
                    <div v-if="rowData?.risk_scenario" class="info-text-content">
                      <span v-if="String(rowData.risk_scenario).length <= 100">{{ rowData.risk_scenario }}</span>
                      <template v-else>
                        <span>{{ String(rowData.risk_scenario).substring(0, 100) }}...</span>
                        <button @click="openTextModal('Risk Scenario', String(rowData.risk_scenario))"
                          class="see-more-link">
                          {{ $t('common.see_more') }}
                        </button>
                      </template>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Existing Control -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-film"></i>
                      <span>{{ $t('risk.existing_control') }}</span>
                    </div>
                    <div v-if="rowData?.existing_control" class="info-text-content">
                      <span v-if="String(rowData.existing_control).length <= 100">{{ rowData.existing_control }}</span>
                      <template v-else>
                        <span>{{ String(rowData.existing_control).substring(0, 100) }}...</span>
                        <button @click="openTextModal('Existing Control', String(rowData.existing_control))"
                          class="see-more-link">
                          {{ $t('common.see_more') }}
                        </button>
                      </template>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Vulnerability Catalogs -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-book"></i>
                      <span>{{ $t('risk.vulnerability_catalogs') }}</span>
                    </div>
                    <div class="info-badges-container" v-if="rowData?.vuln_catalogs?.length">
                      <span v-for="(id, index) in getDisplayIds(rowData.vuln_catalogs, 'vuln_catalogs')" :key="index"
                        class="info-badge">
                        {{ getVulnCatalogName(id) }}
                      </span>
                      <button v-if="rowData.vuln_catalogs.length > 3"
                        @click="openIdModal('Vulnerability Catalogs', rowData.vuln_catalogs, 'getVulnCatalogName')"
                        class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.vuln_catalogs.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Affected Assets -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-cubes"></i>
                      <span>{{ $t('risk.affected_assets') }}</span>
                    </div>
                    <div class="info-badges-container" v-if="rowData?.asset_ids?.length">
                      <span v-for="(id, index) in getDisplayIds(rowData.asset_ids, 'asset_ids')" :key="index"
                        class="info-badge">
                        {{ getAssetName(id) }}
                      </span>
                      <button v-if="rowData.asset_ids.length > 3"
                        @click="openIdModal('Affected Assets', rowData.asset_ids, 'getAssetName')" class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.asset_ids.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Tags -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-tags"></i>
                      <span>{{ $t('risk.tags') }}</span>
                    </div>
                    <div class="info-badges-container" v-if="rowData?.tag_ids?.length">
                      <span v-for="(id, index) in getDisplayIds(rowData.tag_ids, 'tag_ids')" :key="index"
                        class="info-badge">
                        {{ getTagsName(id) }}
                      </span>
                      <button v-if="rowData.tag_ids.length > 3"
                        @click="openIdModal('Tags', rowData.tag_ids, 'getTagsName')" class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.tag_ids.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Regulator -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-gavel"></i>
                      <span>{{ $t('risk.regulator') }}</span>
                    </div>
                    <span v-if="rowData?.regulator_id" class="info-badge">{{ getRegulatorName(rowData.regulator_id)
                    }}</span>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- Controls -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-sliders-h"></i>
                      <span>{{ $t('risk.controls') }}</span>
                    </div>
                    <div class="info-badges-container" v-if="rowData?.control_id?.length">
                      <span v-for="(id, index) in getDisplayIds(rowData.control_id, 'control_id')" :key="index"
                        class="info-badge">
                        {{ getControlName(id) }}
                      </span>
                      <button v-if="rowData.control_id.length > 3"
                        @click="openIdModal('Controls', rowData.control_id, 'getControlName')" class="see-more-btn">
                        {{ $t('common.see_more') }} ({{ rowData.control_id.length - 3 }})
                      </button>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>

                <!-- External Reference ID -->
                <div class="info-col">
                  <div class="info-section">
                    <div class="info-section-header">
                      <i class="fas fa-film"></i>
                      <span>{{ $t('risk.reference') }}</span>
                    </div>
                    <div v-if="rowData?.reference_id" class="info-text-content">
                      <span v-if="String(rowData.reference_id).length <= 100">{{ rowData.reference_id }}</span>
                      <template v-else>
                        <span>{{ String(rowData.risk_scenario).substring(0, 100) }}...</span>
                        <button @click="openTextModal('Risk reference', String(rowData.reference_id))"
                          class="see-more-link">
                          {{ $t('common.see_more') }}
                        </button>
                      </template>
                    </div>
                    <span v-else class="not-specified-badge">{{ $t('common.not_specified') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for See More - Using Teleport -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="closeModalView">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ modalTitle }}</h3>
            <button @click="closeModalView" class="modal-close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="modalType === 'text'" class="modal-text-content">
              {{ modalContent }}
            </div>
            <div v-else class="modal-badges-list">
              <span v-for="(item, index) in modalItems" :key="index" class="info-badge modal-badge">
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { RiskCalculator } from "@/API/Risk/RiskCalculator";
import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
import Highcharts from 'highcharts';
import ChangeStatusModal from "@/views/Page/Risk/RiskManagement/ChangeStatusModal.vue";
import CloseRiskModal from "@/views/Page/Risk/RiskManagement/CloseRiskModal.vue";
import RiskLevel from "@/API/RiskLevel/RiskLevel";
import RiskScoringHistory from "@/API/RiskScoringHistory/RiskScoringHistory";
import risk from "@/API/Risk/Risk";
import Regulator from "@/API/Regulator/Regulator";

export default {
  name: "RiskIdentification",
  components: {
    ChangeStatusModal,
    CloseRiskModal
  },
  props: {
    rowData: {
      type: Object,
      required: true
    },
    dropdownOptions: {
      type: Object,
      default: () => ({})
    },
  },
  emits: ['risk-updated'],
  setup() {
    const riskCalculator = new RiskCalculator();
    const riskLevel = new RiskLevel();
    const riskScoringHistory = new RiskScoringHistory();
    const api = new risk();
    const regulator = new Regulator();

    return {
      riskCalculator,
      riskLevel,
      riskScoringHistory,
      api,
      regulator
    };
  },
  data() {
    return {
      EditDataLoaded: false,
      isAccordionOpen: null,
      isCloseRiskModalOpen: false,
      isStatusModalOpen: false,
      isEditRiskModalOpen: false,
      selectedAction: '',
      selectedStatus: '',
      dateMenu: false,
      closeOutInformation: '',
      statusOptions: [
        { text: 'New', value: 'New' },
        { text: 'Mitigation Planned', value: 'Mitigation Planned' },
        { text: 'Mgmt Reviewed', value: 'Mgmt Reviewed' },
        { text: 'Closed Risk', value: 'Closed Risk' },
        { text: 'Reopened', value: 'Reopened' },
      ],
      risk_levels: [],
      isDataReady: false,
      loadingEditRisk: false,
      isHistoryLoading: false,
      hasScoringData: false,
      formData: {
        id: null,
        category_id: null,
        risk_mapping_ids: [],
        threat_mapping_ids: [],
        location_ids: [],
        stakeholder_ids: [],
        owner_id: null,
        tag_ids: [],
        team_ids: [],
        vuln_catalogs: [],
        reference_id: null,
        risk_scenario: null,
        existing_control: null,
        regulator_id: null,
        control_id: [],
        asset_ids: [],
        created_at: null,
      },
      controlFilteredOptions: [],
      showModal: false,
      modalTitle: '',
      modalContent: '',
      modalItems: [],
      modalType: '',
    };
  },
  computed: {
    riskCategoryOptions() {
      return this.dropdownOptions.riskCategoryOptions || [];
    },
    appetiteToleranceOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'appetitetolerance'
      ) || [];
    },
    riskOptions() {
      return this.dropdownOptions.riskOptions || [];
    },
    threatOptions() {
      return this.dropdownOptions.threatOptions || [];
    },
    locationOptions() {
      return this.dropdownOptions.locationOptions || [];
    },
    userOptions() {
      return this.dropdownOptions.userOptions || [];
    },
    teamOptions() {
      return this.dropdownOptions.teamOptions || [];
    },
    tagOptions() {
      return this.dropdownOptions.tagOptions || [];
    },
    vulnCatalogsOptions() {
      return this.dropdownOptions.vulnCatalogsOptions || [];
    },
    regulatorOptions() {
      return this.dropdownOptions.regulatorOptions || [];
    },
    controlOptions() {
      return this.dropdownOptions.controlOptions || [];
    },
    assetOptions() {
      return this.dropdownOptions.assetOptions || [];
    },
    frameworkOptions() {
      return this.dropdownOptions.frameworkOptions || [];
    },
    riskCloseReasonOptions() {
      return this.dropdownOptions.riskCloseReasonOptions || [];
    },
  },
  methods: {
    async initializeEditFormData() {
      try {
        this.formData = {
          id: this.rowData?.id || null,
          risk_mapping_ids: Array.isArray(this.rowData?.risk_mapping)
            ? this.rowData.risk_mapping.map(r => r.id)
            : [],
          threat_mapping_ids: Array.isArray(this.rowData?.threat_mapping)
            ? this.rowData.threat_mapping.map(t => t.id)
            : [],
          location_ids: Array.isArray(this.rowData?.locations)
            ? this.rowData.locations.map(l => l.id)
            : [],
          stakeholder_ids: Array.isArray(this.rowData?.stakeholders)
            ? this.rowData.stakeholders.map(s => s.id)
            : [],
          team_ids: Array.isArray(this.rowData?.teams)
            ? this.rowData.teams.map(tm => tm.id)
            : [],
          tag_ids: Array.isArray(this.rowData?.tag_ids)
            ? this.rowData.tags.map(t => t.id)
            : [],
          vuln_catalogs: this.rowData?.vuln_catalogs || [],
          asset_ids: this.rowData?.asset_ids || [],
          category_id: this.rowData?.category?.id || null,
          owner_id: this.rowData?.owner?.id || null,
          regulator_id: this.rowData?.regulator_id || null,
          control_id: [],
          created_at: this.rowData?.created_at || null,
          risk_scenario: this.rowData?.risk_scenario || "",
          existing_control: this.rowData?.existing_control || "",
          reference_id: this.rowData?.reference_id || "",
        };

        if (this.formData.regulator_id) {
          await this.onRegulatorChange(false);
        } else {
          if (Array.isArray(this.rowData?.control_id)) {
            this.formData.control_id = this.rowData.control_id.map(id => String(id));
          } else if (this.rowData?.control_id) {
            this.formData.control_id = [String(this.rowData.control_id)];
          }
        }

        this.rowData.appetite = this.appetiteToleranceOptions[0]?.appetite ?? 0;
        this.rowData.tolerance = this.appetiteToleranceOptions[0]?.tolerance ?? 0;

      } catch (error) {
        this.$notify({
          type: "error",
          text: this.$t("common.error_loading_data"),
        });
      }
    },
    async openEditRiskModal() {
      this.isEditRiskModalOpen = true;
      await this.$nextTick();
      await this.initializeEditFormData();
    },
    async onRegulatorChange(fromUser = true) {
      try {
        this.controlFilteredOptions = [];
        this.formData.control_id = [];

        let regulators = [];
        if (Array.isArray(this.formData.regulator_id)) {
          regulators = this.formData.regulator_id;
        } else if (this.formData.regulator_id) {
          regulators = [this.formData.regulator_id];
        }

        if (regulators.length === 0) {
          this.controlFilteredOptions = [];
          return;
        }

        let regulatorFrameworks = [];

        for (const regId of regulators) {
          const regulatorObject = await this.regulator.show(regId, {
            with: ['frameworks'],
          });

          if (Array.isArray(regulatorObject?.frameworks)) {
            regulatorFrameworks.push(...regulatorObject.frameworks);
          }
        }

        const frameworkIds = regulatorFrameworks.map(fw => fw.id);

        if (frameworkIds.length > 0) {
          this.controlFilteredOptions = this.controlOptions.filter(
            control => frameworkIds.includes(control.framework_id)
          );
        } else {
          this.controlFilteredOptions = [];
        }

        if (!fromUser) {
          await this.$nextTick();

          if (Array.isArray(this.rowData?.control_id)) {
            this.formData.control_id = this.rowData.control_id.map(id => String(id));
          } else if (this.rowData?.control_id) {
            this.formData.control_id = [String(this.rowData.control_id)];
          }
        }

      } catch (error) {
        console.error("Error loading frameworks:", error);
        this.$notify({
          type: "error",
          text: this.$t("common.error_loading_data"),
        });
      }
    },
    async initializeChart() {
      try {
        this.isHistoryLoading = true;
        this.hasScoringData = false;

        const [riskLevels, scoringHistory] = await Promise.all([
          this.riskLevel.getAll({ select: 'id|from|color' }),
          this.riskScoringHistory.getAll({ filter: `risk_id|${this.$route.params.id}|=` })
        ]);

        if (Array.isArray(scoringHistory) && scoringHistory.length > 0) {
          this.risk_levels = (Array.isArray(riskLevels) ? riskLevels : []).sort((a, b) => a.from - b.from);
          const seriesData = [
            { name: this.$t('risk.inherent_risk'), data: [] },
            { name: this.$t('risk.residual_risk_score'), data: [] }
          ];

          scoringHistory.forEach(record => {
            const timestamp = new Date(record.created_at);
            const utcDate = Date.UTC(
              timestamp.getUTCFullYear(),
              timestamp.getUTCMonth(),
              timestamp.getUTCDate(),
              timestamp.getUTCHours(),
              timestamp.getUTCMinutes(),
              timestamp.getUTCSeconds()
            );
            seriesData[0].data.push([utcDate, record.inhertent]);
            seriesData[1].data.push([utcDate, record.residual]);
          });

          seriesData[0].data.sort((a, b) => a[0] - b[0]);
          seriesData[1].data.sort((a, b) => a[0] - b[0]);

          this.hasScoringData = true;
          this.$nextTick(() => this.initChart(seriesData));
        } else {
          this.hasScoringData = false;
        }
      } catch (err) {
        console.error('Error initializing chart:', err);
        this.hasScoringData = false;
      } finally {
        this.isHistoryLoading = false;
      }
    },
    initChart(seriesData) {
      // ensure risk_levels is array and sorted
      this.risk_levels = Array.isArray(this.risk_levels) ? this.risk_levels.sort((a, b) => a.from - b.from) : [];
      // provide safe default when risk_levels is empty
      const maxFromValue = this.risk_levels.length ? Math.max(...this.risk_levels.map(level => Number(level.from) || 0)) : 100;

      const plotBands = [];
      for (let i = 0; i < this.risk_levels?.length - 1; i++) {
        plotBands.push({
          color: this.risk_levels[i].color,
          from: Number(this.risk_levels[i].from),
          to: Number(this.risk_levels[i + 1].from),
        });
      }

      Highcharts.setOptions({
        lang: {
          decimalPoint: '.',
          thousandsSep: ',',
          shortMonths: [
            this.$t('risk.jan'), this.$t('risk.feb'), this.$t('risk.mar'),
            this.$t('risk.apr'), this.$t('risk.may'), this.$t('risk.jun'),
            this.$t('risk.jul'), this.$t('risk.aug'), this.$t('risk.sep'),
            this.$t('risk.oct'), this.$t('risk.nov'), this.$t('risk.dec')
          ],
          months: [
            this.$t('risk.january'), this.$t('risk.february'), this.$t('risk.march'),
            this.$t('risk.april'), this.$t('risk.may'), this.$t('risk.june'),
            this.$t('risk.july'), this.$t('risk.august'), this.$t('risk.september'),
            this.$t('risk.october'), this.$t('risk.november'), this.$t('risk.december')
          ],
          weekdays: [
            this.$t('risk.sunday'), this.$t('risk.monday'), this.$t('risk.tuesday'),
            this.$t('risk.wednesday'), this.$t('risk.thursday'), this.$t('risk.friday'), this.$t('risk.saturday')
          ],
          contextButtonTitle: this.$t('risk.chart_menu'),
          downloadJPEG: this.$t('risk.download_jpeg'),
          downloadPDF: this.$t('risk.download_pdf'),
          downloadPNG: this.$t('risk.download_png'),
          downloadSVG: this.$t('risk.download_svg'),
          printChart: this.$t('risk.print_chart')
        }
      });

      // ensure the chart container ref exists; if not, retry on next tick
      if (!this.$refs || !this.$refs.riskChart) {
        this.$nextTick(() => {
          if (this.$refs && this.$refs.riskChart) {
            this.initChart(seriesData);
          }
        });
        return;
      }

      const chartObj = new Highcharts.Chart({
        chart: {
          renderTo: this.$refs.riskChart,
          type: 'spline',
        },
        title: {
          text: this.$t('risk.risk_scoring_history')
        },
        yAxis: [{
          title: {
            text: this.$t('risk.risk_score')
          },
          min: 0,
          max: maxFromValue,
          gridLineWidth: 0,
          plotBands: plotBands,
        }],
        xAxis: [{
          type: 'datetime',
          dateTimeLabelFormats: {
            millisecond: '%Y-%m-%d<br/>%H:%M:%S',
            second: '%Y-%m-%d<br/>%H:%M:%S',
            minute: '%Y-%m-%d<br/>%H:%M',
            hour: '%Y-%m-%d<br/>%H:%M',
            day: '%Y-%m-%d<br/>%H:%M',
            month: '%Y-%m-%d<br/>%H:%M',
            year: '%Y-%m-%d<br/>%H:%M'
          },
          title: {
            text: this.$t('risk.date_and_time')
          }
        }],
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
        },
        tooltip: {
          useHTML: true,
          formatter: function () {
            const date = new Date(this.x);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const monthAbbrev = date.toLocaleDateString('en-US', { month: 'short' });
            const dayNumber = date.getDate();
            const time = Highcharts.dateFormat('%H:%M', this.x);

            return `
              <div style="background: #fff; padding: 10px 14px; border-radius: 8px; 
                box-shadow: 0px 2px 12px rgba(0,0,0,0.15);  font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';: Arial, sans-serif; color: #333;">
                <div style="font-size: 14px; font-weight: bold; color: #333;">
                  ${dayName}, ${monthAbbrev} ${dayNumber} | ${time}
                </div>
                <div style="margin-top: 5px; font-size: 13px; color: #555;">
                  <span style="display: inline-block; width: 10px; height: 10px; 
                    background: ${this.series.color}; border-radius: 50%; margin-right: 5px;"></span>
                  <b>${this.series.name}:</b> ${this.y}
                </div>
              </div>
            `;
          }
        },
        plotOptions: {
          spline: {
            marker: {
              enabled: true
            },
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 3
              }
            }
          }
        },
        series: seriesData
      });
    },
    toggleAccordion(section) {
      if (this.isAccordionOpen === section) {
        this.isAccordionOpen = null;
      } else {
        this.isAccordionOpen = section;
        // start loading state and then initialize chart
        this.isHistoryLoading = true;
        this.hasScoringData = false;
        this.$nextTick(() => {
          this.initializeChart();
        });
      }
    },
    getRegulatorName(regulatorId) {
      if (!regulatorId) return null;
      const framework_ids = this.frameworkOptions.find(r => r.regulator_id === regulatorId);
      const regulator = this.regulatorOptions.find(r => r.id === framework_ids?.regulator_id);
      return regulator ? regulator.name : null;
    },
    getVulnCatalogName(vulnId) {
      if (!vulnId) return null;
      const vulnCatalog = this.vulnCatalogsOptions.find(v => v.id === vulnId);
      return vulnCatalog ? vulnCatalog.name : null;
    },
    getAssetName(assetId) {
      if (!assetId) return null;
      const asset = this.assetOptions.find(a => a.id === assetId);
      return asset ? asset.name : null;
    },
    getTagsName(tagId) {
      if (!tagId) return null;
      const tag = this.tagOptions.find(a => a.id === tagId);
      return tag ? tag.name : null;
    },
    getControlName(controlId) {
      if (!controlId) return null;
      const control = this.controlOptions.find(c => c.id === controlId);
      return control ? control.short_name || control.name : null;
    },
    implodeObjectList(list, field) {
      if (!Array.isArray(list) || list.length === 0) return null;
      return list.map(item => item?.[field]).filter(Boolean).join(', ');
    },
    implodeIdList(ids, getterName) {
      if (!Array.isArray(ids) || ids.length === 0) return null;
      const parts = ids.map(id => {
        try {
          const fn = this[getterName];
          return typeof fn === 'function' ? fn.call(this, id) : null;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      return parts.join(', ');
    },
    getDisplayItems(items, field, key) {
      if (!Array.isArray(items)) return [];
      return items.slice(0, 3);
    },
    getDisplayIds(ids, key) {
      if (!Array.isArray(ids)) return [];
      return ids.slice(0, 3);
    },
    openModal(title, items, field) {
      this.modalTitle = title;
      this.modalItems = items.map(item => item[field]);
      this.modalType = 'list';
      this.showModal = true;

      document.body.style.overflow = 'hidden';

      this.$nextTick(() => {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
          modalOverlay.scrollTop = 0;
        }
      });
    },

    openTextModal(title, content) {
      this.modalTitle = title;
      this.modalContent = content;
      this.modalType = 'text';
      this.showModal = true;

      document.body.style.overflow = 'hidden';

      this.$nextTick(() => {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
          modalOverlay.scrollTop = 0;
        }
      });
    },

    openIdModal(title, ids, getNameMethod) {
      this.modalTitle = title;
      this.modalItems = ids.map(id => this[getNameMethod](id));
      this.modalType = 'list';
      this.showModal = true;

      document.body.style.overflow = 'hidden';

      this.$nextTick(() => {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
          modalOverlay.scrollTop = 0;
        }
      });
    },
    getOwnerName(ownerId) {
      if (!ownerId) return null;
      const owner = this.userOptions.find(u => u.id === ownerId);
      return owner ? owner.full_name : null;
    },

    getTeamName(teamId) {
      if (!teamId) return null;
      const team = this.teamOptions.find(t => t.id === teamId);
      return team ? team.name : null;
    },

    getStakeholderName(stakeholderId) {
      if (!stakeholderId) return null;
      const stakeholder = this.userOptions.find(u => u.id === stakeholderId);
      return stakeholder ? stakeholder.full_name : null;
    },
    closeModalView() {
      this.showModal = false;
      document.body.style.overflow = '';
    },
    async changeStatus(payload) {
      const selectedStatus = payload?.status ?? this.selectedStatus;
      const closeOutInformation = payload?.closeOutInformation ?? this.closeOutInformation;

      this.closeModal();

      if (!this.rowData?.id || !selectedStatus) return;

      const result = await Swal.fire({
        title: `Are you sure you want to change the status of this risk?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: `Yes!`,
      });

      if (!result.isConfirmed) return;

      try {
        const data = { id: this.rowData?.id, status: selectedStatus };

        if (payload?.reason_close === null) {
          data.close_out_information = null;
          data.reason_close = null;
        } else if (closeOutInformation) {
          data.close_out_information = closeOutInformation;
          data.reason_close = selectedStatus;
        }

        const response = await this.api.changeStatus(data);
        if (response.status == 'success') {
          this.rowData.status = response.data.status ?? selectedStatus;
          if (payload?.reason_close === null) {
            this.rowData.close_out_information = null;
            this.rowData.reason_close = null;
          } else {
            if (response.data.close_out_information !== undefined) this.rowData.close_out_information = response.data.close_out_information;
            if (response.data.reason_close !== undefined) this.rowData.reason_close = response.data.reason_close;
          }

          this.$emit("risk-updated", response);
          notify({ title: "Risk changed status successfully", text: "The operation was completed successfully.!", type: "success" });
        } else {
          notify({ title: "Error changing risk status", text: response?.message, type: "error" });
        }
      } catch (error) {
        console.error('Error changing risk status', error);
        notify({ title: "Error changing risk status", text: error.message || error, type: "error" });
      }
    },
    async changeStatusClose(payload) {
      const reasonId = payload?.reasonId;
      const closeOutInformation = payload?.closeOutInformation;

      if (reasonId === 'Reopened' || reasonId === 'reopened') {
        return this.changeStatus({ status: 'Reopened', closeOutInformation: '' });
      }

      if (!this.rowData?.id) return;

      const result = await Swal.fire({
        title: `Are you sure you want to close this risk?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: this.$t('risk.cancel'),
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: `Yes!`,
      });

      if (!result.isConfirmed) return;

      try {
        const data = { id: this.rowData.id, status: 'Closed Risk' };
        if (closeOutInformation) {
          data.close_out_information = closeOutInformation;
        }
        if (reasonId) {
          data.reason_close = reasonId;
        }

        const response = await this.api.changeStatus(data);
        if (response.status == 'success') {
          this.rowData.status = response.data.status;
          if (response.data.close_out_information) {
            this.rowData.close_out_information = response.data.close_out_information;
          }
          if (response.data.reason_close) {
            this.rowData.reason_close = response.data.reason_close;
          }
          this.$emit('risk-updated', response);
          notify({ title: this.$t('risk.close_risk_success') || 'Risk closed', text: this.$t('common.operation_success') || '', type: 'success' });
        } else {
          notify({ title: this.$t('risk.close_risk_error') || 'Error', text: response?.message, type: 'error' });
        }
      } catch (error) {
        console.error('Error closing risk', error);
        notify({ title: this.$t('risk.close_risk_error') || 'Error', text: error.message || error, type: 'error' });
      }
    },
    closeModal() {
      this.isEditRiskModalOpen = false;
      this.isStatusModalOpen = false;
      this.isCloseRiskModalOpen = false;
      this.selectedAction = '';
    },
    async updateIdentification() {
      if (this.formData?.id) {
        this.loadingEditRisk = true;
        try {
          const response = await this.api.updateIdentification({
            id: this.rowData?.id,
            ...this.formData
          });
          if (response) {
            notify({
              title: "Risk Updated successfully",
              text: "The operation was completed successfully!",
              type: "success",
            });
            this.closeModal();
            this.$emit("risk-updated", response);
          }
        } catch (error) {
          notify({
            title: "Something went wrong",
            text: error.message || error,
            type: "danger",
          });
          console.error(error);
        } finally {
          this.loadingEditRisk = false;
        }
      }
    },
    handleRiskAction(value) {
      if (value == 'EditRisk')
        this.openEditRiskModal();
      else if (value == 'CloseRisk')
        this.isCloseRiskModalOpen = true;
      else if (value == 'changeStatus')
        this.isStatusModalOpen = true;

      this.selectedAction = '';
    }
  },
  watch: {
    rowData: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.$nextTick(() => {
            this.isDataReady = true;
            this.EditDataLoaded = true;
          });
        } else {
          this.isDataReady = false;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style scoped>
/* ================================
   ACCORDION STYLES
   ================================ */
.risk-accordion {
  margin-bottom: 2rem;
}

.risk-accordion-item {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
}

.risk-accordion-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.risk-accordion-header {
  margin: 0;
}

.risk-accordion-button {
  width: 100%;
  padding: 1rem 1.25rem;
  background: #E8E8E8;
  color: #2c3e50;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  border-radius: 8px 8px 0 0;
}

.risk-accordion-button:not(.collapsed) {
  background: #E8E8E8;
  border-bottom: 1px solid #e1e5e9;
}

.risk-accordion-button.collapsed {
  border-radius: 8px;
}

.accordion-chevron {
  transition: transform 0.2s ease;
  font-size: 1rem;
  color: #333;
  order: 1;
  margin-left: auto;
  margin-right: 0;
}

.according-title {
  order: -1;
  font-weight: 700;
  font-size: 1rem;
  color: #000;
  margin-right: auto;
}

.accordion-chevron.rotate-icon {
  transform: rotate(180deg);
}

.risk-accordion-collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.risk-accordion-collapse.show {
  max-height: 5000px;
  transition: max-height 0.5s ease-in;
}

.risk-accordion-body {
  padding: 1.5rem;
  background: #ffffff;
  border-top: 1px solid #e1e5e9;
}

#riskScoringChart {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* ================================
   ROW AND COLUMN LAYOUT - BOOTSTRAP STYLE
   ================================ */
.info-container {
  width: 100%;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -0.6rem;
  margin-right: -0.6rem;
}

.info-col {
  flex: 0 0 25%;
  max-width: 25%;
  padding-left: 0.6rem;
  padding-right: 0.6rem;
  margin-bottom: 1.2rem;
  box-sizing: border-box;
}

.info-section {
  background: #F5F5F5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
}

.info-section:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border-color: #d0d0d0;
}

.info-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #000;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.info-section-header i {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9B7EBD;
  color: white;
  border-radius: 6px;
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* ================================
   BADGE STYLES
   ================================ */
.info-badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
  align-content: flex-start;
  flex: 1 1 auto;
}

.info-badge {
  display: inline-block;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  width: 100%;
}

.info-badge:hover {
  border-color: #9B7EBD;
  background: #f8f5fc;
}

.not-specified-badge {
  display: inline-block;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  color: #999;
  font-style: italic;
  flex: 1 1 auto;
}

/* ================================
   TEXT CONTENT STYLES
   ================================ */
.info-text-content {
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 0.6rem 0.85rem;
  font-size: 0.85rem;
  color: #333;
  line-height: 1.5;
  flex: 1 1 auto;
  overflow: hidden;
}

/* ================================
   BUTTON STYLES
   ================================ */
.see-more-btn {
  display: inline-block;
  background: #9B7EBD;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.see-more-btn:hover {
  background: #7d5fa0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(155, 126, 189, 0.3);
}

.see-more-btn:active {
  transform: translateY(0);
}

.see-more-link {
  display: inline;
  background: none;
  border: none;
  color: #9B7EBD;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 0.25rem;
  text-decoration: underline;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.see-more-link:hover {
  color: #7d5fa0;
}

/* ================================
   MODAL STYLES
   ================================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
  padding: 1rem;
}

.modal-content {
  background: #F5F5F5;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: #F5F5F5;
  border-bottom: 1px solid #e0e0e0;
  gap: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header h3::before {
  content: '\f57d';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #9B7EBD;
  border-radius: 8px;
  flex-shrink: 0;
  color: white;
  font-size: 1rem;
}

.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  background: #F5F5F5;
}

.modal-text-content {
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.modal-badges-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-badge {
  width: 100%;
  text-align: left;
}

/* ================================
   RESPONSIVE DESIGN
   ================================ */
@media (min-width: 1200px) {
  .info-col {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .info-col {
    flex: 0 0 33.333333%;
    max-width: 33.333333%;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .info-col {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 767px) {
  .info-col {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .risk-accordion-button {
    font-size: 0.95rem;
    padding: 0.875rem 1rem;
  }

  .according-title {
    font-size: 0.95rem;
  }

  .risk-accordion-body {
    padding: 1.25rem 1rem;
  }

  .info-section {
    padding: 0.875rem;
  }

  .info-section-header {
    font-size: 0.85rem;
  }

  .info-section-header i {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }

  .info-badge {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }

  .modal-content {
    max-width: 95%;
  }

  .modal-header {
    padding: 1rem 1.25rem;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .risk-accordion-button {
    padding: 0.75rem 0.875rem;
  }

  .according-title {
    font-size: 0.9rem;
  }

  .accordion-chevron {
    font-size: 0.9rem;
  }

  .info-section {
    padding: 0.75rem;
  }

  .info-section-header {
    font-size: 0.8rem;
  }

  .info-badge {
    font-size: 0.75rem;
  }

  .see-more-btn {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
}

/* ================================
   LOADING SPINNER STYLES
   ================================ */
.child-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  gap: 10px;
  padding: 20px;
}

.spinner-small {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 5px solid rgba(0, 0, 0, 0.06);
  border-top-color: #9B7EBD;
  animation: spin 0.9s linear infinite;
}

.loading-text {
  color: #666;
  font-weight: 600;
}

/* reuse @keyframes spin from parent file or re-declare (kept here for safety) */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-history {
  color: #666;
  font-weight: 600;
}
</style>