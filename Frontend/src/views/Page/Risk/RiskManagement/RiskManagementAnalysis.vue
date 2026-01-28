<template>
  <div class="risk-analysis-container">
    <!-- Classic Risk Scoring Card -->
    <div class="classic-risk-card">
      <div class="card-header">
        <h2 class="card-title">Classic Risk Scoring</h2>
        <button v-internalPermission:update class="edit-icon-btn" @click="editSubject">
          <i class="fas fa-pen"></i>
        </button>
      </div>

      <div v-if="showRiskScore" class="scoring-content">
        <div class="scoring-row">
          <div class="scoring-item">
            <span class="scoring-label">Current Impact:</span>
            <span class="scoring-badge impact-badge"
              :style="{ background: getImpactColor().bg, color: getImpactColor().text }">
              <span class="badge-dot" :style="{ background: getImpactColor().dot }"></span>
              {{ impactName }}
            </span>
          </div>
          <div class="scoring-item">
            <span class="scoring-label">Current Likelihood:</span>
            <span class="scoring-badge likelihood-badge"
              :style="{ background: getLikelihoodColor().bg, color: getLikelihoodColor().text }">
              <span class="badge-dot" :style="{ background: getLikelihoodColor().dot }"></span>
              {{ likelihoodName }}
            </span>
          </div>
          <div class="scoring-item risk-value-item">
            <span class="scoring-label">Risk Value</span>
            <div class="risk-value-large">{{ formatRiskValue(inherent_risk) }}</div>
          </div>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else class="edit-mode">
        <div class="edit-fields">
          <div class="field-group">
            <input type="hidden" v-model="selectedLikelihoodValue" />
            <v-text-field v-model="selectedLikelihoodLabel" :label="$t('risk.current_likelihood')"
              :placeholder="$t('risk.select_likelihood')" variant="outlined" density="comfortable" readonly
              @click="openParamsModal('likelihood')" />
          </div>

          <div class="field-group">
            <input type="hidden" v-model="selectedImpactValue" />
            <v-text-field v-model="selectedImpactLabel" :label="$t('risk.current_impact')"
              :placeholder="$t('risk.select_impact')" variant="outlined" density="comfortable" readonly
              @click="openParamsModal('impact')" />
          </div>
        </div>

        <div class="edit-actions">
          <v-btn v-internalPermission:updateRiskImpact color="primary" :loading="isUpdatingRiskImpact"
            :disabled="isUpdatingRiskImpact" @click="updateRiskImpact" class="update-btn">
            {{ $t('risk.update') }}
          </v-btn>

          <v-btn color="error" variant="outlined" :disabled="isUpdatingRiskImpact" @click="editSubject"
            class="cancel-btn">
            {{ $t('risk.cancel') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Risk Metrics Cards Row -->
    <div class="metrics-row">
      <!-- Residual Risk Card -->
      <div class="metric-card residual-card">
        <div class="metric-icon-wrapper green">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3 class="metric-title">Residual Risk</h3>
        <div class="metric-value green">{{ formatRiskValue(residual_risk) }}</div>
      </div>

      <!-- Inherent Risk Card -->
      <div class="metric-card inherent-card">
        <div class="metric-icon-wrapper red">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="metric-title">Inherent Risk</h3>
        <div class="metric-value red">{{ formatRiskValue(inherent_risk) }}</div>
      </div>

      <!-- Speedometer Card -->
      <div class="metric-card speedometer-card">
        <SpeedometerGauge 
          v-if="isSpeedometerReady"
          class="speedometer"
          :key="speedometerKey"
          :value="speedometerValue"
          :minValue="0" 
          :maxValue="speedometerMaxValue"
          :segments="3" 
          :segmentColors="['#10b981', '#fbbf24', '#ef4444']"
          :customSegmentStops="speedometerSegmentStops"
          needleColor="#374151" 
          startColor="#10b981"
          endColor="#ef4444" 
          textColor="#1e293b" 
          :valueTextFontSize="48" 
          :labelFontSize="14" 
          :width="350" 
          :height="220"
          :currentValueText="speedometerValueText" 
        />
        <div v-else class="speedometer-loading">
          <div class="loading-spinner"></div>
          <p>Loading gauge...</p>
        </div>
      </div>
    </div>

    <!-- Information Section -->
    <div class="information-card">
      <h2 class="info-title">Information</h2>

      <div class="info-grid">
        <!-- Submitted By -->
        <div class="info-item">
          <span class="info-label">Submitted By:</span>
          <div class="info-value">
            <div class="user-avatar">
              <span>{{ getUserInitials(rowData?.created_by) }}</span>
            </div>
            <span class="user-name">{{ getResponsibleNames(rowData?.created_by) }}</span>
          </div>
        </div>

        <!-- Impact Scope -->
        <div class="info-item">
          <span class="info-label">Impact Scope:</span>
          <div class="info-value">
            <span class="scope-badge">
              <span class="scope-dot"></span>
              {{ rowData?.impact_scope?.name || 'N/A' }}
            </span>
          </div>
        </div>

        <!-- Responsible Party -->
        <div class="info-item">
          <span class="info-label">Responsible Party:</span>
          <div class="info-value">
            {{ truncateText(rowData?.responsible_party, 100) || 'N/A' }}
            <span v-if="rowData?.responsible_party && rowData.responsible_party.length > 100" class="see-more"
              @click="openDetailsModal('responsible_party', rowData.responsible_party)">
              See More
            </span>
          </div>
        </div>

        <!-- Attachments -->
        <div class="info-item">
          <span class="info-label">Attachments:</span>

          <div class="info-value" v-if="rowData.supporting_document">
            <!-- File Icon (open file) -->
            <a :href="rowData.full_supporting_document_file_path" target="_blank" title="View Evidence">
              <i class="fa-solid fa-file fa-lg" style="cursor:pointer; color:#00308f;"></i>
            </a>
          </div>

          <!-- If there is NO file -->
          <div class="info-value" v-else>
            <span style="color:#999;">No file</span>
          </div>
        </div>

        <!-- KRIs -->
        <div class="info-item full-width kri-section">
          <span class="info-label">KRIs:</span>
          <div class="kri-text">
            <div v-if="rowData?.kris">
              <div v-html="truncateHTML(rowData.kris, 200)"></div>
              <span v-if="stripHTML(rowData.kris).length > 200" class="see-more"
                @click="openDetailsModal('kris', rowData.kris)">
                ...See More
              </span>
            </div>
            <span v-else>N/A</span>
          </div>
        </div>
        <div class="info-item full-width kri-section">
          <span class="info-label">Description:</span>
          <div class="kri-text">
            <div v-if="rowData?.description">
              <div v-html="truncateHTML(rowData.description, 200)"></div>
              <span v-if="stripHTML(rowData.description).length > 200" class="see-more"
                @click="openDetailsModal('description', rowData.description)">
                ...See More
              </span>
            </div>
            <span v-else>N/A</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Params Modal -->
    <ParamsModal v-model:show="showParamsModal" :modalTitle="modalTitle" :activeParams="activeParams"
      :initialSelectedLevels="modalSelectedLevels" @apply="applySelectedParams" />

    <!-- Details Modal -->
    <v-dialog v-model="showDetailsModal" max-width="700px" persistent>
      <v-card class="details-modal">
        <v-card-title class="modal-header">
          <span class="modal-title">{{ detailsModalTitle }}</span>
          <v-btn icon @click="closeDetailsModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="modal-body">
          <div v-if="detailsModalType === 'kris'" v-html="detailsModalContent" class="modal-content-html"></div>
          <div v-else class="modal-content-text">{{ detailsModalContent }}</div>
        </v-card-text>

        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeDetailsModal" class="close-modal-btn">
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { nextTick } from "vue";
import feather from "feather-icons";
import risk from "@/API/Risk/Risk";
import ParamsModal from "@/views/Page/Risk/CreateRisk/ParamsModal.vue";
import { notify } from "@kyvg/vue3-notification";
import { RiskCalculator } from "@/API/Risk/RiskCalculator";
import SpeedometerGauge from 'vue-speedometer';
import RiskScoringHistory from "@/API/RiskScoringHistory/RiskScoringHistory";

export default {
  name: 'RiskAnalysis',
  components: {
    ckeditor: Ckeditor,
    ParamsModal,
    SpeedometerGauge
  },

  props: {
    rowData: {
      type: Object,
      required: true
    },
    apiData: {
      type: Object,
      default: () => ({})
    },
    dropdownOptions: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['risk-updated', 'open-modal'],
  setup() {
    const api = new risk();
    const riskCalculator = new RiskCalculator();
    const riskScoringHistory = new RiskScoringHistory();
    return {
      api,
      riskCalculator,
      riskScoringHistory
    };
  },
  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      selectedLikelihoodValue: null,
      selectedImpactValue: null,
      selectedLikelihoodLabel: "",
      selectedImpactLabel: "",
      currentImpact: "",
      currentLikelihood: "",
      showParamsModal: false,
      modalTitle: "",
      activeParams: [],
      selectedLevels: {},
      currentParamType: null,
      modalSelectedLevels: [],
      residual_risk: 0,
      inherent_risk: 0,
      isUpdatingRiskImpact: false,
      showRiskScore: true,
      riskData: {},
      showDetailsModal: false,
      detailsModalTitle: '',
      detailsModalContent: '',
      detailsModalType: '',
      maxRate: 0,
      isSpeedometerReady: false,
      speedometerKey: 0,
    }
  },
  computed: {
    likelihoodOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'likelihoods'
      ) || [];
    },
    appetideToleranceOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'appetitetolerance'
      ) || [];
    },
    impactOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'impacts'
      ) || [];
    },
    userOptions() {
      return this.dropdownOptions.userOptions || [];
    },
    impactName() {
      return this.riskCalculator.getImpactName(this.rowData?.current_impact, this.impactOptions);
    },
    likelihoodName() {
      return this.riskCalculator.getLikelihoodName(this.rowData?.current_likelihood, this.likelihoodOptions);
    },
    riskFormulaOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'risk_calculation_formula'
      ) || [{ data: '' }];
    },
    appetiteValue() {
      const appetite = this.appetideToleranceOptions[0];
      const value = parseFloat(appetite?.appetite || 0);
      return isNaN(value) ? 0 : value;
    },
    toleranceValue() {
      const tolerance = this.appetideToleranceOptions[0];
      const value = parseFloat(tolerance?.tolerance || 100);
      return isNaN(value) ? 100 : value;
    },
    speedometerValue() {
      const value = parseFloat(this.inherent_risk || 0);
      return isNaN(value) ? 0 : Math.min(value, this.speedometerMaxValue);
    },
    speedometerMaxValue() {
      if (!this.maxRate || this.maxRate <= 0) return 100;
      return this.maxRate;
    },
    speedometerSegmentStops() {
      const max = this.speedometerMaxValue;
      const appetite = Math.min(this.appetiteValue, max);
      const tolerance = Math.min(this.toleranceValue, max);
      
      // Ensure stops are in ascending order
      return [0, appetite, tolerance, max].sort((a, b) => a - b);
    },
    speedometerValueText() {
      const value = parseFloat(this.inherent_risk);
      if (isNaN(value)) return '0.00';
      return value.toFixed(2);
    }
  },
  async mounted() {
    await this.initializeComponent();
    nextTick(() => {
      feather.replace();
    });
  },
  methods: {
    openEditModal() {
      this.$emit('open-modal', 'editRiskAnalysis');
    },

    async initializeComponent() {
      try {
        this.isSpeedometerReady = false;
        
        const result = await this.riskCalculator.refreshInhertedRisk(
          this.rowData,
          [],
          this.likelihoodOptions,
          this.impactOptions,
          this.riskFormulaOptions
        );
        
        console.log('result', result);
        this.riskData = result.riskData;
        this.inherent_risk = parseFloat(result.inherent_risk) || 0;
        this.residual_risk = parseFloat(result.residual_risk) || 0;

        // Calculate maxRate
        const likelihoodLength = this.likelihoodOptions[0]?.data?.length || this.likelihoodOptions.length || 5;
        const impactLength = this.impactOptions[0]?.data?.length || this.impactOptions.length || 5;
        this.maxRate = likelihoodLength * impactLength;

        // Ensure maxRate is valid
        if (this.maxRate <= 0) {
          this.maxRate = 100;
        }

        await this.settingForImpact();
        
        // Wait a tick before showing speedometer
        await this.$nextTick();
        this.speedometerKey++;
        this.isSpeedometerReady = true;
        
        await this.$nextTick();
        feather.replace();
      } catch (error) {
        console.error("Error initializing component:", error);
        // Set defaults on error
        this.maxRate = 100;
        this.inherent_risk = 0;
        this.residual_risk = 0;
        this.isSpeedometerReady = true;
      }
    },
    openParamsModal(type) {
      this.currentParamType = type;

      if (!Array.isArray(this.selectedLevels)) {
        this.selectedLevels = [];
      }

      if (this.selectedLevels.length === 0 && this.rowData?.selected_levels) {
        this.selectedLevels = [...this.rowData.selected_levels];
      }

      const list = type === "likelihood" ? this.likelihoodOptions[0] : this.impactOptions[0];
      this.activeParams = list || [];

      this.modalTitle = type === "likelihood"
        ? this.$t("risk.likelihood_parameters")
        : this.$t("risk.impact_parameters");

      const tempSelectedLevels = {};

      if (this.selectedLevels && this.activeParams?.params) {
        this.activeParams.params.forEach((param) => {
          const existing = this.selectedLevels.find(
            (selection) => selection.type === type && selection.paramId === param.id
          );

          if (existing) {
            const matchingLevel = param.levels.find(
              (level) => level.levelNumber === parseInt(existing.levelNumber)
            );

            if (matchingLevel) {
              tempSelectedLevels[param.id] = matchingLevel;
            }
          }
        });
      }

      this.modalSelectedLevels = tempSelectedLevels;
      this.showParamsModal = true;
    },

    applySelectedParams(selectedLevels) {
      if (!Array.isArray(this.selectedLevels)) {
        this.selectedLevels = [];
      }

      this.selectedLevels = this.selectedLevels.filter(
        (lvl) => lvl.type !== this.currentParamType
      );

      const newSelections = [];

      Object.entries(selectedLevels).forEach(([paramId, level]) => {
        if (!level) return;

        const param = this.activeParams?.params?.find((p) => p.id == paramId);
        if (!param) return;

        newSelections.push({
          paramId: param.id,
          paramName: param.name,
          levelNumber: level.levelNumber,
          levelName: level.levelName,
          color: level.color || null,
          type: this.currentParamType,
        });
      });

      this.selectedLevels = [...this.selectedLevels, ...newSelections];

      if (newSelections.length > 0) {
        const maxLevel = newSelections.reduce((max, lvl) =>
          lvl.levelNumber > max.levelNumber ? lvl : max
        );

        let levelNameFromList = this.getLevelNameFromList(
          maxLevel.levelNumber,
          this.currentParamType
        );

        if (this.currentParamType === "likelihood") {
          this.selectedLikelihoodValue = maxLevel.levelNumber;
          this.selectedLikelihoodLabel = levelNameFromList;
        } else {
          this.selectedImpactValue = maxLevel.levelNumber;
          this.selectedImpactLabel = levelNameFromList;
        }
      }
    },
    getLevelNameFromList(levelNumber, type) {
      try {
        const list = type === "likelihood" ? this.likelihoodOptions[0] : this.impactOptions[0];
        let dataArray = [];

        if (Array.isArray(list)) {
          dataArray = list;
        } else if (list?.data && Array.isArray(list.data)) {
          dataArray = list.data;
        } else if (list?.params && Array.isArray(list.params)) {
          dataArray = list.params;
        }

        const item = dataArray.find(item => item.value === levelNumber || item.levelNumber === levelNumber);
        return item ? (item.name || item.levelName) : `Level ${levelNumber}`;

      } catch (error) {
        console.error('Error getting level name from list:', error);
        return `Level ${levelNumber}`;
      }
    },
    async settingForImpact() {
      this.selectedImpactLabel = this.impactName;
      this.selectedLikelihoodLabel = this.likelihoodName;
      this.currentImpact = this.rowData?.current_impact;
      this.currentLikelihood = this.rowData?.current_likelihood;
      this.selectedLikelihoodValue = this.rowData?.current_likelihood;
      this.selectedImpactValue = this.rowData?.current_impact;
    },
    async updateRiskImpact() {
      this.isUpdatingRiskImpact = true;

      try {
        if (this.currentLikelihood === this.selectedLikelihoodValue &&
          this.currentImpact === this.selectedImpactValue) {
          this.showRiskScore = true;
          return;
        }
        
        const dataResponse = await this.riskCalculator.refreshInhertedRisk(
          this.rowData,
          [],
          this.likelihoodOptions,
          this.impactOptions,
          this.riskFormulaOptions
        );

        const dataScoring = {
          risk_id: this.rowData?.id,
          residual: dataResponse.residual_risk,
          inhertent: dataResponse.inherent_risk,
          formula: this.riskFormulaOptions[0]?.data || ''
        };
        await this.riskScoringHistory.insert(dataScoring);

        const response = await this.api.updateRiskImpact({
          id: this.rowData?.id,
          selected_levels: this.selectedLevels,
          current_impact: this.selectedImpactValue,
          current_likelihood: this.selectedLikelihoodValue,
        });

        this.$emit("risk-updated", response);
        this.showRiskScore = true;
        
        // Refresh speedometer
        await this.initializeComponent();

        notify({
          title: this.$t('risk.update_success'),
          text: this.$t('risk.risk_impact_updated'),
          type: "success"
        });

      } catch (error) {
        console.error("Error updating risk impact:", error);
        notify({
          title: this.$t('risk.update_error'),
          text: error.message,
          type: "error"
        });
      } finally {
        this.isUpdatingRiskImpact = false;
      }
    },
    editSubject() {
      this.showRiskScore = !this.showRiskScore;
    },
    getResponsibleNames(creator) {
      if (!creator) return 'N/A';
      const user = this.userOptions.find(u => u.id === creator);
      return user ? user.full_name : 'Unknown User';
    },
    getUserInitials(creator) {
      const name = this.getResponsibleNames(creator);
      if (name === 'N/A' || name === 'Unknown User') return 'U';
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    handleUpload() {
      console.log('Upload clicked');
    },
    openDetailsModal(type, content) {
      this.detailsModalType = type;
      this.detailsModalContent = content;

      if (type === 'responsible_party') {
        this.detailsModalTitle = this.$t('risk.responsible_party');
      } else if (type === 'kris') {
        this.detailsModalTitle = this.$t('risk.kris');
      }

      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.detailsModalTitle = '';
      this.detailsModalContent = '';
      this.detailsModalType = '';
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    stripHTML(html) {
      if (!html) return '';
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    },
    truncateHTML(html, maxLength) {
      if (!html) return 'N/A';
      const text = this.stripHTML(html);
      if (text.length <= maxLength) return html;
      return text.substring(0, maxLength) + '...';
    },
    getImpactColor() {
      const impact = this.rowData?.current_impact || 0;
      const impactLevel = this.impactOptions[0]?.data?.find(level => level.value === impact);

      if (impactLevel?.color) {
        return {
          bg: this.lightenColor(impactLevel.color, 0.9),
          text: this.darkenColor(impactLevel.color, 0.4),
          dot: impactLevel.color
        };
      }

      return {
        bg: '#fee2e2',
        text: '#991b1b',
        dot: '#ef4444'
      };
    },
    getLikelihoodColor() {
      const likelihood = this.rowData?.current_likelihood || 0;
      const likelihoodLevel = this.likelihoodOptions[0]?.data?.find(level => level.value === likelihood);

      if (likelihoodLevel?.color) {
        return {
          bg: this.lightenColor(likelihoodLevel.color, 0.9),
          text: this.darkenColor(likelihoodLevel.color, 0.4),
          dot: likelihoodLevel.color
        };
      }

      return {
        bg: '#d1fae5',
        text: '#065f46',
        dot: '#10b981'
      };
    },
    lightenColor(color, amount) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const newR = Math.round(r + (255 - r) * amount);
      const newG = Math.round(g + (255 - g) * amount);
      const newB = Math.round(b + (255 - b) * amount);

      return `rgb(${newR}, ${newG}, ${newB})`;
    },
    darkenColor(color, amount) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const newR = Math.round(r * (1 - amount));
      const newG = Math.round(g * (1 - amount));
      const newB = Math.round(b * (1 - amount));

      return `rgb(${newR}, ${newG}, ${newB})`;
    },
    formatRiskValue(value) {
      if (value === null || value === undefined || value === '') return '0.0';
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0.0';
      return numValue.toFixed(1);
    }
  },
  watch: {
    rowData: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.$nextTick(() => {
            this.initializeComponent();
          });
        }
      },
      immediate: true,
      deep: true
    }
  },
};
</script>

<style scoped>
.risk-analysis-container {
  padding: 1.5rem;
  background-color: #f5f5f7;
  min-height: 100vh;
}

.classic-risk-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.edit-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6E3894;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.edit-icon-btn:hover {
  background: #5a2d75;
  transform: scale(1.05);
}

.scoring-content {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
}

.scoring-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 2rem;
  align-items: center;
}

.scoring-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.scoring-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.scoring-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  width: fit-content;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.risk-value-item {
  text-align: right;
}

.risk-value-large {
  font-size: 2.5rem;
  font-weight: 700;
  color: #6E3894;
  line-height: 1;
}

.edit-mode {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
}

.edit-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field-group {
  width: 100%;
}

.edit-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.update-btn {
  background: #6E3894 !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 0.5rem 2rem !important;
}

.cancel-btn {
  text-transform: none !important;
  font-weight: 600 !important;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.75rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.metric-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.metric-icon-wrapper.green {
  background: #d1fae5;
  color: #059669;
}

.metric-icon-wrapper.red {
  background: #fee2e2;
  color: #dc2626;
}

.metric-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.metric-value.green {
  color: #059669;
}

.metric-value.red {
  color: #dc2626;
}

.speedometer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  min-height: 280px;
  align-items: center;
  justify-content: center;
}
/* minimal styles — the .speedometer class is kept so scoped CSS rules can target it */
.speedometer {
  width: 100%;
  height: auto;
}

/* Use :deep() to penetrate scoped styles and target SVG elements generated by vue-speedometer */
:deep(.speedometer g),
:deep(.speedometer path),
:deep(.speedometer circle),
:deep(.speedometer rect) {
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  transform-origin: 0 0 !important;
  animation-duration: 18s;
  animation-direction: normal;
}
.speedometer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #6E3894;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.speedometer-loading p {
  color: #6b7280;
  font-size: 0.875rem;
}

.information-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1.5rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 0.9375rem;
  color: #1a1a1a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6E3894;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-name {
  color: #1a1a1a;
  font-weight: 500;
}

.scope-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.scope-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
}

.see-more {
  color: #6E3894;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  margin-left: 2px;
}

.see-more:hover {
  text-decoration: underline;
  color: #5a2d75;
}

.kri-section {
  margin-top: 0.5rem;
}

.kri-text {
  color: #1a1a1a;
  line-height: 1.6;
  word-break: break-word;
}

.details-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.details-modal .modal-header {
  background: #F0F0F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem !important;
}

.details-modal .modal-title {
  font-weight: 700 !important;
  font-size: 1.25rem !important;
  color: black;
}

.details-modal .close-btn {
  color: black !important;
  background: rgba(0, 0, 0, 0.05) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.details-modal .close-btn:hover {
  background: rgba(0, 0, 0, 0.1) !important;
  transform: rotate(90deg);
}

.details-modal .modal-body {
  padding: 2rem !important;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-content-text {
  color: #1a1a1a;
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-content-html {
  color: #1a1a1a;
  font-size: 1rem;
  line-height: 1.6;
}

.details-modal .modal-actions {
  padding: 1rem 1.5rem !important;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.close-modal-btn {
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

@media (max-width: 1024px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .speedometer-card {
    grid-column: 1 / -1;
  }

  .scoring-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .risk-value-item {
    text-align: left;
  }
}

@media (max-width: 768px) {
  .risk-analysis-container {
    padding: 1rem;
  }

  .metrics-row {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .edit-fields {
    grid-template-columns: 1fr;
  }

  .edit-actions {
    flex-direction: column;
  }

  .update-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>