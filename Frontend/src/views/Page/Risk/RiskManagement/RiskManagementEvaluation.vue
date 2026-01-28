<template>
  <div class="mitigation-container">
    <!-- Header Card -->
    <div class="mitigation-header-card">
      <div class="header-left">
        <h2 class="header-title">Risk Mitigation Details</h2>

        <!-- Status Row -->
        <div v-if="acceptMitigationState !== null" class="mitigation-status-row">
          <!-- Small Dot Badge -->
          <span class="status-dot" :class="acceptMitigationState ? 'dot-accepted' : 'dot-rejected'">
          </span>

          <span class="status-text">
            {{ acceptMitigationState ? 'Mitigation Accepted' : 'Mitigation Rejected' }}
          </span>
        </div>
      </div>

      <button v-internalPermission:editMitigation class="edit-mitigation-btn" @click="openEditDialog">
        <i class="fas fa-pen"></i>
        Edit Mitigation
      </button>
    </div>


    <!-- Main Content Card -->
    <div class="mitigation-content-card">
      <!-- Top Section Card: Status and Risk -->
      <div class="section-card">
        <div class="info-grid-top">
          <!-- Mitigation Status -->
          <div class="info-item">
            <label class="item-label">Risk Mitigation Status</label>
            <div class="status-badge" :class="getStatusBadgeClass(rowData?.mitigation_status)">
              {{ getMitigationStatusText(rowData?.mitigation_status) }}
            </div>
          </div>

          <!-- Treatment Decision -->
          <div class="info-item">
            <label class="item-label">Risk Treatment Decision</label>
            <div class="status-badge status-neutral">
              {{ getTreatmentDecisionText(rowData?.selected_treatment_decision) }}
            </div>
          </div>

          <!-- Inherent Risk -->
          <div class="info-item">
            <label class="item-label">Inherent Risk</label>
            <div class="risk-badge" :class="getRiskBadgeClass(inherent_risk)">
              <i class="fas" :class="getRiskIcon(inherent_risk)"></i>
              {{ formatRiskValue(inherent_risk) }}
            </div>
          </div>

          <!-- Residual Risk -->
          <div class="info-item">
            <label class="item-label">Residual Risk</label>
            <div class="risk-badge" :class="getRiskBadgeClass(residual_risk)">
              <i class="fas" :class="getRiskIcon(residual_risk)"></i>
              {{ formatRiskValue(residual_risk) }}
            </div>
          </div>
        </div>

        <!-- Mitigation Date -->
        <div class="mitigation-date-row">
          <label class="item-label">Mitigation Date:</label>
          <div class="item-value">{{ rowData?.mitigation_planing || 'Not Set' }}</div>
        </div>
      </div>

      <!-- Bottom Section Card: Requirements and Recommendations -->
      <div class="section-card">
        <div class="text-grid">
          <!-- Security Requirements -->
          <div class="text-item">
            <label class="item-label">Security Requirements:</label>
            <div class="text-content">
              {{ truncateText(rowData?.security_requirements, 100) || 'N/A' }}
              <a v-if="rowData?.security_requirements && rowData.security_requirements.length > 100" href="#"
                class="see-more-link"
                @click.prevent="openDetailModal('security_requirements', rowData.security_requirements)">
                See More
              </a>
            </div>
          </div>

          <!-- Security Recommendations -->
          <div class="text-item">
            <label class="item-label">Security Recommendations:</label>
            <div class="text-content">
              {{ truncateText(rowData?.security_recommendations, 100) || 'N/A' }}
              <a v-if="rowData?.security_recommendations && rowData.security_recommendations.length > 100" href="#"
                class="see-more-link"
                @click.prevent="openDetailModal('security_recommendations', rowData.security_recommendations)">
                See More
              </a>
            </div>
          </div>
        </div>

        <!-- Current Solution -->
        <div class="current-solution-row">
          <label class="item-label">Current Solution</label>
          <div class="text-content solution-content">
            <div v-if="!rowData?.current_solution" class="no-content">
              No current solution provided
            </div>
            <div v-else v-html="truncateHTML(rowData.current_solution, 150)" class="solution-html"></div>
            <a v-if="rowData?.current_solution && stripHTML(rowData.current_solution).length > 150" href="#"
              class="see-more-link" @click.prevent="openDetailModal('current_solution', rowData.current_solution)">
              See More
            </a>
          </div>
        </div>
      </div>

      <!-- Treatment Decision Specific Details Card -->
      <template v-if="rowData?.selected_treatment_decision === 'mitigating'">
        <div class="section-card">
          <div class="mitigation-details-grid">
            <div class="detail-item">
              <label class="detail-label">Mitigation Cost</label>
              <div class="detail-value">${{ rowData?.mitigation_cost || '0' }}</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">Mitigation Percent</label>
              <div class="detail-value">{{ rowData?.mitigation_percent || '0' }}%</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">Mitigation Effort</label>
              <div class="detail-value">{{ rowData?.mitigation_effort?.name || 'N/A' }}</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">Mitigation Owner</label>
              <div class="detail-value">{{ rowData?.mitigation_owner?.full_name || 'N/A' }}</div>
            </div>
          </div>

          <!-- Teams and Controls -->
          <div class="tags-section">
            <div class="tags-group">
              <label class="item-label">Mitigation Teams:</label>
              <div class="tags-container">
                <span v-for="team in rowData?.mitigation_teams" :key="team.id" class="tag">
                  {{ team.name }}
                </span>
                <span v-if="!rowData?.mitigation_teams || rowData.mitigation_teams.length === 0"
                  class="no-tags">N/A</span>
              </div>
            </div>
            <div class="tags-group">
              <label class="item-label">Mitigation Controls:</label>
              <div class="tags-container">
                <span v-for="control in rowData?.mitigation_controls" :key="control.id" class="tag">
                  {{ control.short_name }}
                </span>
                <span v-if="!rowData?.mitigation_controls || rowData.mitigation_controls.length === 0"
                  class="no-tags">N/A</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Detail Modal -->
    <v-dialog v-model="showDetailModal" max-width="700px" persistent>
      <v-card class="detail-modal">
        <v-card-title class="modal-header">
          <span class="modal-title">{{ detailModalTitle }}</span>
          <v-btn icon @click="closeDetailModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="modal-body">
          <div v-if="detailModalType === 'current_solution'" v-html="detailModalContent" class="modal-content-html">
          </div>
          <div v-else class="modal-content-text">{{ detailModalContent }}</div>
        </v-card-text>

        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeDetailModal" class="close-modal-btn">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Mitigation Dialog -->
    <v-dialog v-model="dialog" max-width="900px" persistent scrollable>
      <v-card class="edit-modal">
        <v-card-title class="edit-modal-header">
          <span class="edit-modal-title">Edit Mitigation Risk</span>
          <v-btn icon @click="closeEditDialog" class="header-close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="edit-modal-body">
          <v-form ref="editForm">
            <!-- Edit Mitigation Status -->
            <div class="form-section">
              <label class="form-label">Edit Mitigation Status</label>
              <v-select v-model="formData.mitigation_status" :items="mitigationStatusOptions" item-title="text"
                item-value="value" variant="outlined" density="comfortable" placeholder="Select mitigation status"
                class="custom-select" />
            </div>

            <!-- Conditional Fields Based on Mitigation Status -->
            <template v-if="formData.mitigation_status === 'planMitigation'">
              <!-- Mitigation Planning Date and Treatment Decision -->
              <div class="form-row">
                <div class="form-col">
                  <label class="form-label">Mitigation Planning Date</label>
                  <v-text-field v-model="formData.mitigation_planing" type="date" variant="outlined"
                    density="comfortable" placeholder="Mm/Dd/Yyyy" class="custom-input" />
                </div>

                <div class="form-col">
                  <label class="form-label">Treatment Decision</label>
                  <v-select v-model="formData.selected_treatment_decision" :items="treatmentDecisionOptions"
                    item-title="text" item-value="value" variant="outlined" density="comfortable"
                    placeholder="Select treatment decision" class="custom-select" />
                </div>
              </div>

              <!-- Accepting: Justification -->
              <template v-if="formData.selected_treatment_decision === 'accepting'">
                <div class="form-section">
                  <label class="form-label">Justification</label>
                  <v-textarea v-model="formData.accepting_justification" variant="outlined" rows="3"
                    placeholder="Enter justification for accepting the risk" class="custom-textarea" />
                </div>
              </template>

              <!-- Mitigating: Multiple Fields -->
              <template v-if="formData.selected_treatment_decision === 'mitigating'">
                <div class="form-row">
                  <div class="form-col">
                    <label class="form-label">Mitigation Effort</label>
                    <v-select v-model="formData.mitigation_effort_id" :items="mitigationEffortOptions" item-title="name"
                      item-value="id" variant="outlined" density="comfortable" placeholder="Select effort level"
                      class="custom-select" />
                  </div>

                  <div class="form-col">
                    <label class="form-label">Mitigation Owner</label>
                    <v-select v-model="formData.mitigation_owner_id" :items="userOptions" item-title="full_name"
                      item-value="id" variant="outlined" density="comfortable" placeholder="Select owner"
                      class="custom-select" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-col">
                    <label class="form-label">Mitigation Cost</label>
                    <v-text-field v-model.number="formData.mitigation_cost" type="number" variant="outlined"
                      density="comfortable" prefix="$" placeholder="0" class="custom-input" />
                  </div>

                  <div class="form-col">
                    <label class="form-label">Mitigation Percent</label>
                    <v-text-field v-model.number="formData.mitigation_percent" type="number" variant="outlined"
                      density="comfortable" suffix="%" placeholder="0" min="0" max="100"
                      @input="clampPercent('mitigation_percent')" class="custom-input" />
                  </div>
                </div>

                <div class="form-section">
                  <label class="form-label">Mitigation Teams</label>
                  <v-select v-model="formData.mitigation_team_ids" :items="teamOptions" item-title="name"
                    item-value="id" variant="outlined" density="comfortable" multiple chips closable-chips
                    placeholder="Select teams" class="custom-select" />
                </div>

                <div class="form-section">
                  <label class="form-label">Mitigation Controls</label>
                  <v-select v-model="formData.mitigation_control_ids" :items="controlOptions" item-title="short_name"
                    item-value="id" variant="outlined" density="comfortable" multiple chips closable-chips
                    placeholder="Select controls" class="custom-select" />
                </div>
              </template>

              <!-- Sharing: Counter Party and Coverage -->
              <template v-if="formData.selected_treatment_decision === 'sharing'">
                <div class="form-row">
                  <div class="form-col">
                    <label class="form-label">Counter Party</label>
                    <v-text-field v-model="formData.counter_party" variant="outlined" density="comfortable"
                      placeholder="Enter counter party name" class="custom-input" />
                  </div>

                  <div class="form-col">
                    <label class="form-label">Coverage Percent</label>
                    <v-text-field v-model.number="formData.coverage_percent" type="number" variant="outlined"
                      density="comfortable" suffix="%" placeholder="0" min="0" max="100"
                      @input="clampPercent('coverage_percent')" class="custom-input" />
                  </div>
                </div>
              </template>

              <!-- Avoiding: Action, Date, Impact -->
              <template v-if="formData.selected_treatment_decision === 'avoiding'">
                <div class="form-row">
                  <div class="form-col">
                    <label class="form-label">Avoiding Action</label>
                    <v-text-field v-model="formData.avoiding_action" variant="outlined" density="comfortable"
                      placeholder="Describe avoiding action" class="custom-input" />
                  </div>

                  <div class="form-col">
                    <label class="form-label">Effective Date</label>
                    <v-text-field v-model="formData.effective_date" type="date" variant="outlined" density="comfortable"
                      class="custom-input" />
                  </div>
                </div>

                <div class="form-section">
                  <label class="form-label">Operational Impact</label>
                  <v-textarea v-model="formData.operational_impact" variant="outlined" rows="3"
                    placeholder="Describe operational impact" class="custom-textarea" />
                </div>
              </template>

              <!-- Common Fields (when treatment decision is selected) -->
              <template v-if="formData.selected_treatment_decision">
                <div class="form-section">
                  <label class="form-label">Current Solution</label>
                  <ckeditor :editor="editor" v-model="formData.current_solution" :config="editorConfig"
                    class="custom-ckeditor" />
                </div>

                <div class="form-row">
                  <div class="form-col">
                    <label class="form-label">Security Requirements</label>
                    <v-textarea v-model="formData.security_requirements" variant="outlined" rows="3"
                      placeholder="Enter security requirements" class="custom-textarea" />
                  </div>

                  <div class="form-col">
                    <label class="form-label">Security Recommendations</label>
                    <v-textarea v-model="formData.security_recommendations" variant="outlined" rows="3"
                      placeholder="Enter security recommendations" class="custom-textarea" />
                  </div>
                </div>

                <!-- Residual Risk Alert -->
                <div class="residual-risk-alert" :class="getResidualRiskClass()">
                  <div class="alert-icon">
                    <i class="fas" :class="getResidualRiskIcon()"></i>
                  </div>
                  <div class="alert-content">
                    <span class="alert-label">Residual Risk:</span>
                    <span class="alert-value">{{ calculatedResidualRisk !== null ? calculatedResidualRisk : '0'
                    }}</span>
                  </div>
                  <div class="alert-appetite">
                    <span class="appetite-label">Risk Appetite:</span>
                    <span class="appetite-value">{{ riskAppetite }}</span>
                  </div>
                </div>
              </template>
            </template>
          </v-form>
        </v-card-text>

        <v-card-actions class="edit-modal-footer">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="closeEditDialog" class="cancel-btn" :disabled="loadingEditTreatment">
            Cancel
          </v-btn>
          <v-btn color="primary" :loading="loadingEditTreatment" :disabled="loadingEditTreatment"
            @click="editMitigation" class="save-btn">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import risk from "@/API/Risk/Risk";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { nextTick } from "vue";
import feather from "feather-icons";
import { notify } from "@kyvg/vue3-notification";
import { RiskCalculator } from "@/API/Risk/RiskCalculator";

export default {
  name: "RiskEvaluation",
  components: {
    ckeditor: Ckeditor
  },
  setup() {
    const riskCalculator = new RiskCalculator();
    const api = new risk();
    return {
      api,
      location,
      riskCalculator
    };
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
    },
  },
  emits: ['risk-updated'],

  computed: {
    riskFormulaOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'risk_calculation_formula'
      ) || [];
    },

    likelihoodOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'likelihoods'
      ) || [];
    },

    impactOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'impacts'
      ) || [];
    },

    appetiteToleranceOptions() {
      return this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'appetitetolerance'
      ) || [];
    },
    userOptions() {
      return this.dropdownOptions.userOptions || [];
    },
    teamOptions() {
      return this.dropdownOptions.teamOptions || [];
    },
    controlOptions() {
      return this.dropdownOptions.controlOptions || [];
    },
    planningStrategyOptions() {
      return this.dropdownOptions.planningStrategyOptions || [];
    },
    mitigationEffortOptions() {
      return this.dropdownOptions.mitigationEffortOptions || [];
    },

    riskAppetite() {
      const item = this.dropdownOptions?.riskSettingsOptions?.filter(
        option => option.type === 'appetitetolerance'
      );
      return item[0]?.appetite ?? 0;
    },

    isMitigationRequired() {
      const inherent = parseFloat(this.inherent_risk || 0);
      return inherent > this.riskAppetite;
    },

    mitigationStatusOptions() {
      const inherent = parseFloat(this.inherent_risk || 0);
      const appetite = this.riskAppetite;

      const opts = [
        { text: "No Mitigation", value: "noMitigation" },
        { text: "Plan A Mitigation", value: "planMitigation" }
      ];

      if (inherent > appetite) {
        return opts.map(o =>
          o.value === "noMitigation" ? { ...o, disabled: true } : o
        );
      }
      return opts;
    },

    calculatedResidualRisk() {
      return this.calculateResidualRiskValue();
    },

    currentSolution() {
      return this.rowData?.current_solution || '';
    },

    acceptMitigationState() {
      // Normalize accept_mitigation to true/false/null
      const v = this.rowData?.accept_mitigation;
      if (v === null || v === undefined) return null;
      if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        if (s === 'true') return true;
        if (s === 'false') return false;
        // fallback for other string values
        return null;
      }
      // For boolean or other truthy/falsy values
      return Boolean(v);
    },
  },

  data() {
    return {
      dialog: false,
      showDetailModal: false,
      detailModalTitle: '',
      detailModalContent: '',
      detailModalType: '',
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 300,
      },
      inherent_risk: 0,
      residual_risk: 0,
      loadingEditTreatment: false,
      localCurrentSolution: '',
      treatmentDecisionOptions: [
        { text: "Risk Accepting", value: "accepting" },
        { text: "Risk Mitigating", value: "mitigating" },
        { text: "Risk Sharing", value: "sharing" },
        { text: "Risk Avoiding", value: "avoiding" }
      ],

      formData: {
        id: this.rowData?.id,
        mitigation_status: 'noMitigation',
        mitigation_planing: '',
        selected_treatment_decision: null,
        accepting_justification: '',
        mitigation_effort_id: null,
        mitigation_owner_id: null,
        mitigation_cost: null,
        mitigation_percent: null,
        mitigation_team_ids: [],
        mitigation_control_ids: [],
        counter_party: '',
        coverage_percent: null,
        avoiding_action: '',
        effective_date: '',
        operational_impact: '',
        current_solution: '',
        security_requirements: '',
        security_recommendations: '',
      },
    }
  },

  watch: {
    currentSolution: {
      immediate: true,
      handler(newVal) {
        this.localCurrentSolution = newVal || '';
      }
    },

    isMitigationRequired(required) {
      if (required && this.formData.mitigation_status === "noMitigation") {
        this.formData.mitigation_status = "planMitigation";
      }
    },

    "formData.mitigation_status"(mitigationStatus) {
      if (mitigationStatus === "noMitigation") {
        this.clearAllMitigationFields();
      }
    },

    "formData.selected_treatment_decision": {
      handler(decision) {
        this.clearTreatmentDecisionFields(decision);
      },
      immediate: true
    },

    "formData.mitigation_control_ids": {
      handler() {
        if (this.formData.selected_treatment_decision === "mitigating") {
          this.$forceUpdate();
        }
      },
      deep: true
    },

    "formData.mitigation_percent": {
      handler() {
        if (this.formData.selected_treatment_decision === "mitigating") {
          this.$forceUpdate();
        }
      }
    },

    "formData.coverage_percent": {
      handler() {
        if (this.formData.selected_treatment_decision === "sharing") {
          this.$forceUpdate();
        }
      }
    },

    rowData: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.$nextTick(() => {
            this.initializeRiskData();
            this.initializeFormData();
          });
        }
      },
      immediate: true,
      deep: true
    }
  },

  async mounted() {
    this.localCurrentSolution = this.currentSolution;
    await this.initializeRiskData();
    this.initializeFormData();

    nextTick(() => {
      feather.replace();
    });
  },

  methods: {
    async initializeRiskData() {
      const result = await this.riskCalculator.refreshInhertedRisk(
        this.rowData,
        this.controlOptions,
        this.likelihoodOptions,
        this.impactOptions,
        this.riskFormulaOptions
      );
      this.riskData = result.riskData;
      this.inherent_risk = result.inherent_risk;
      this.residual_risk = result.residual_risk;
    },

    initializeFormData() {
      this.formData = {
        id: this.rowData?.id || null,
        mitigation_status: this.rowData?.mitigation_status || (this.isMitigationRequired ? "planMitigation" : "noMitigation"),
        mitigation_planing: this.rowData?.mitigation_planing || '',
        selected_treatment_decision: this.rowData?.selected_treatment_decision || null,
        accepting_justification: this.rowData?.accepting_justification || '',
        mitigation_effort_id: this.rowData?.mitigation_effort?.id || null,
        mitigation_owner_id: this.rowData?.mitigation_owner?.id || null,
        mitigation_cost: this.rowData?.mitigation_cost || null,
        mitigation_percent: this.rowData?.mitigation_percent || null,
        mitigation_team_ids: this.rowData?.mitigation_teams?.map(team => team.id) || [],
        mitigation_control_ids: this.rowData?.mitigation_controls?.map(control => control.id) || [],
        counter_party: this.rowData?.counter_party || '',
        coverage_percent: this.rowData?.coverage_percent || null,
        avoiding_action: this.rowData?.avoiding_action || '',
        effective_date: this.rowData?.effective_date || '',
        operational_impact: this.rowData?.operational_impact || '',
        current_solution: this.rowData?.current_solution || '',
        security_requirements: this.rowData?.security_requirements || '',
        security_recommendations: this.rowData?.security_recommendations || '',
      };
    },

    openEditDialog() {
      this.initializeFormData();
      this.dialog = true;
    },

    closeEditDialog() {
      this.dialog = false;
    },

    clampPercent(field) {
      if (this.formData[field] > 100) {
        this.formData[field] = 100;
      } else if (this.formData[field] < 0) {
        this.formData[field] = 0;
      }
    },

    calculateResidualRiskValue() {
      const inherent = parseFloat(this.inherent_risk || 0);
      const decision = this.formData.selected_treatment_decision;

      if (!decision || this.formData.mitigation_status === 'noMitigation') {
        return inherent;
      }

      if (decision === "mitigating") {
        const manualPct = parseFloat(this.formData.mitigation_percent || 0);
        const controlPercents = (this.formData.mitigation_control_ids || [])
          .map(id => {
            const found = this.controlOptions.find(c => c.id === id);
            return found ? found.mitigation_percent || 0 : 0;
          });
        const maxControlPct = controlPercents.length > 0 ? Math.max(...controlPercents) : 0;
        const effectivePct = Math.max(manualPct, maxControlPct);
        return Number((inherent * (1 - effectivePct / 100)).toFixed(1));
      } else if (decision === "sharing") {
        const coverage = parseFloat(this.formData.coverage_percent || 0) / 100;
        return Number((inherent - inherent * coverage).toFixed(1));
      } else if (decision === "avoiding") {
        return 0;
      } else if (decision === "accepting") {
        return inherent;
      }

      return inherent;
    },

    getResidualRiskClass() {
      const r = this.calculatedResidualRisk;
      if (r === null) return 'risk-info';
      if (r <= this.riskAppetite) return 'risk-success';
      if (r <= this.riskAppetite * 1.5) return 'risk-warning';
      return 'risk-danger';
    },

    getResidualRiskIcon() {
      const r = this.calculatedResidualRisk;
      if (r === null) return 'fa-info-circle';
      if (r <= this.riskAppetite) return 'fa-check-circle';
      if (r <= this.riskAppetite * 1.5) return 'fa-exclamation-circle';
      return 'fa-times-circle';
    },

    getMitigationStatusText(status) {
      const statusMap = {
        'noMitigation': 'No Mitigation',
        'planMitigation': 'Plan Mitigation'
      };
      return statusMap[status] || 'Not Set';
    },

    getStatusBadgeClass(status) {
      if (status === 'noMitigation') return 'status-no-mitigation';
      if (status === 'planMitigation') return 'status-plan-mitigation';
      return 'status-not-set';
    },

    getRiskIcon(risk) {
      const riskValue = parseFloat(risk);
      if (riskValue <= this.riskAppetite) return 'fa-arrow-down';
      if (riskValue > this.riskAppetite * 1.5) return 'fa-arrow-up';
      return 'fa-equals';
    },

    formatRiskValue(value) {
      if (value === null || value === undefined || value === '') return '0.0';
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0.0';
      return numValue.toFixed(1);
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
      if (!html) return '';
      const text = this.stripHTML(html);
      if (text.length <= maxLength) return html;
      return text.substring(0, maxLength) + '...';
    },

    openDetailModal(type, content) {
      this.detailModalType = type;
      this.detailModalContent = content;

      const titles = {
        security_requirements: 'Security Requirements',
        security_recommendations: 'Security Recommendations',
        current_solution: 'Current Solution'
      };

      this.detailModalTitle = titles[type] || 'Details';
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.detailModalTitle = '';
      this.detailModalContent = '';
      this.detailModalType = '';
    },

    getTreatmentDecisionText(decision) {
      const decisionMap = {
        'accepting': 'Accepting',
        'mitigating': 'Mitigating',
        'sharing': 'Sharing',
        'avoiding': 'Avoiding'
      };
      return decisionMap[decision] || 'Not Set';
    },

    getRiskBadgeClass(risk) {
      const riskLevel = parseFloat(risk);
      if (riskLevel <= this.riskAppetite) return 'risk-low';
      if (riskLevel <= this.riskAppetite * 1.5) return 'risk-warning';
      return 'risk-high';
    },

    clearTreatmentDecisionFields(keepDecision = null) {
      if (keepDecision !== "accepting") {
        this.formData.accepting_justification = '';
      }
      if (keepDecision !== "mitigating") {
        this.formData.mitigation_effort_id = null;
        this.formData.mitigation_owner_id = null;
        this.formData.mitigation_cost = null;
        this.formData.mitigation_percent = null;
        this.formData.mitigation_team_ids = [];
        this.formData.mitigation_control_ids = [];
      }
      if (keepDecision !== "sharing") {
        this.formData.counter_party = '';
        this.formData.coverage_percent = null;
      }
      if (keepDecision !== "avoiding") {
        this.formData.avoiding_action = '';
        this.formData.effective_date = '';
        this.formData.operational_impact = '';
      }
    },

    clearAllMitigationFields() {
      this.clearTreatmentDecisionFields();
      this.formData.current_solution = '';
      this.formData.security_recommendations = '';
      this.formData.security_requirements = '';
      this.formData.selected_treatment_decision = null;
    },

    async editMitigation() {
      this.loadingEditTreatment = true;
      try {
        const response = await this.api.editMitigation(this.formData);
        if (response.status == 'success') {
          this.$emit('risk-updated', response);
          notify({
            title: 'Update Success',
            text: 'Mitigation updated successfully',
            type: "success",
          });
          this.closeEditDialog();
          await this.initializeRiskData();
        }
      } catch (error) {
        console.error(error);
        notify({
          title: 'Update Error',
          text: error.message,
          type: "error",
        });
      } finally {
        this.loadingEditTreatment = false;
      }
    }
  }
};
</script>

<style scoped>
.mitigation-container {
  /* padding:0rem 1rem; */
  background-color: #ffffff;
}

/* Header Card */
.mitigation-header-card {
  background: #F0F0F0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 900;
  color: #1a1a1a;
  margin: 0;
}

.mitigation-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

/* Status Dot Style */
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
  transition: background-color 0.25s ease, transform 0.25s ease;
}

/* Accepted (green) */
.dot-accepted {
  background-color: #16a34a;
}

/* Rejected (red) */
.dot-rejected {
  background-color: #dc2626;
}

.edit-mitigation-btn {
  background: transparent;
  color: #6E3894;
  border: 2px solid #6E3894;
  border-radius: 12px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.edit-mitigation-btn:hover {
  background: #6E3894;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3);
}

/* Content Card */
.mitigation-content-card {
  background: #F0F0F0;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Section Cards with #f5f5f7 background */
.section-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 0.75rem;
}

/* Top Grid - 2x2 layout for status and risks */
.info-grid-top {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

.item-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Mitigation Date Row */
.mitigation-date-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Status Badges */
.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  width: fit-content;
}

.status-no-mitigation {
  background: #fee2e2;
  color: #991b1b;
}

.status-plan-mitigation {
  background: #d1fae5;
  color: #065f46;
}

.status-not-set {
  background: #f3f4f6;
  color: #6b7280;
}

.status-neutral {
  background: #f3f4f6;
  color: #374151;
}

/* Risk Badges */
.risk-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.risk-high {
  background: #fee2e2;
  color: #991b1b;
}

.risk-warning {
  background: #fef3c7;
  color: #92400e;
}

.risk-low {
  background: #d1fae5;
  color: #065f46;
}

/* Text Grid - Security Requirements and Recommendations */
.text-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.text-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.text-content {
  font-size: 0.875rem;
  color: #1a1a1a;
  line-height: 1.5;
}

.see-more-link {
  color: #6E3894;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
}

.see-more-link:hover {
  text-decoration: underline;
}

/* Current Solution Row */
.current-solution-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.solution-content {
  background: transparent;
  padding: 0;
  border-radius: 0;
  border: none;
}

.solution-html {
  color: #1a1a1a;
  font-size: 0.875rem;
}

.no-content {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

/* Mitigation Details Grid */
.mitigation-details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.detail-label {
  font-size: 0.6875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-value {
  font-size: 0.875rem;
  color: #1a1a1a;
  font-weight: 600;
}

/* Tags Section */
.tags-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tags-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #ede9fe;
  color: #6E3894;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.no-tags {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.8125rem;
}

/* Detail Modal */
.detail-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.v-dialog .v-card .v-card-title .v-btn {
  color: black !important;
  background: white !important;
  border-radius: 8px !important;
}

.modal-header {
  background: #F0F0F0;
  color: black !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem !important;
}

.modal-title {
  font-weight: 600 !important;
  font-size: 1.125rem !important;
  color: black;
}

.close-btn {
  color: #6b7280 !important;
  background: transparent !important;
  border-radius: 8px !important;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  transform: rotate(90deg);
  transition: all 0.3s ease;
}

.modal-body {
  padding: 1.25rem !important;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-content-text {
  color: #1a1a1a;
  font-size: 0.9375rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.modal-content-html {
  color: #1a1a1a;
  font-size: 0.9375rem;
  line-height: 1.6;
}

.modal-actions {
  padding: 0.75rem 1.25rem !important;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.close-modal-btn {
  background: #6E3894 !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 0.5rem 1.75rem !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
  font-size: 0.875rem !important;
}

.close-modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

/* Edit Modal */
.edit-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.edit-modal-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.25rem !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-modal-title {
  font-weight: 600 !important;
  font-size: 1.125rem !important;
  color: #1a1a1a;
}

.header-close-btn {
  color: #6b7280 !important;
  background: transparent !important;
}

.header-close-btn:hover {
  background: #f3f4f6 !important;
  color: #1a1a1a !important;
}

.edit-modal-body {
  padding: 1.25rem !important;
  background: #ffffff;
}

/* Form Sections */
.form-section {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.form-col {
  display: flex;
  flex-direction: column;
}

/* Custom Inputs */
.custom-select :deep(.v-field),
.custom-input :deep(.v-field),
.custom-textarea :deep(.v-field) {
  border-radius: 8px;
  background: #ffffff;
}

.custom-select :deep(.v-field--focused),
.custom-input :deep(.v-field--focused),
.custom-textarea :deep(.v-field--focused) {
  border-color: #6E3894;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
}

.custom-ckeditor {
  margin-top: 0.5rem;
}

.custom-ckeditor :deep(.ck-editor__editable) {
  min-height: 180px;
  border-radius: 8px;
}

/* Residual Risk Alert */
.residual-risk-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-top: 1.25rem;
}

.risk-success {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.risk-warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
}

.risk-danger {
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.risk-info {
  background: #dbeafe;
  border: 1px solid #bfdbfe;
}

.alert-icon {
  font-size: 1.375rem;
}

.risk-success .alert-icon {
  color: #059669;
}

.risk-warning .alert-icon {
  color: #d97706;
}

.risk-danger .alert-icon {
  color: #dc2626;
}

.risk-info .alert-icon {
  color: #3b82f6;
}

.alert-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-label {
  font-weight: 600;
  font-size: 0.875rem;
}

.risk-success .alert-label,
.risk-success .alert-value {
  color: #065f46;
}

.risk-warning .alert-label,
.risk-warning .alert-value {
  color: #92400e;
}

.risk-danger .alert-label,
.risk-danger .alert-value {
  color: #991b1b;
}

.risk-info .alert-label,
.risk-info .alert-value {
  color: #1e40af;
}

.alert-value {
  font-weight: 700;
  font-size: 1rem;
}

.alert-appetite {
  text-align: right;
  font-size: 0.75rem;
}

.appetite-label {
  display: block;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.125rem;
}

.appetite-value {
  display: block;
  font-weight: 600;
  color: #374151;
}

/* Footer */
.edit-modal-footer {
  padding: 0.875rem 1.25rem !important;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  color: #6b7280 !important;
  border-color: #d1d5db !important;
  padding: 0.5rem 1.25rem !important;
  font-size: 0.875rem !important;
}

.cancel-btn:hover {
  background: #f3f4f6 !important;
}

.save-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  background: #6E3894 !important;
  color: white !important;
  padding: 0.5rem 1.75rem !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
  font-size: 0.875rem !important;
}

.save-btn:hover {
  background: #5c2d7a !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .info-grid-top {
    grid-template-columns: repeat(2, 1fr);
  }

  .mitigation-details-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .mitigation-container {
    padding: 0.75rem;
  }

  .mitigation-header-card {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .edit-mitigation-btn {
    width: 100%;
    justify-content: center;
  }

  .info-grid-top {
    grid-template-columns: 1fr;
    gap: 0.625rem;
  }

  .mitigation-details-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>