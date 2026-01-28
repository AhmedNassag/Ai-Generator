<template>
  <v-container fluid>
    <!-- Mitigation Status -->
    <v-card class="mb-4">
      <v-card-text>
        <v-select v-model="formData.mitigationStatus" :items="mitigationStatusOptions" :item-props="true"
          item-title="text" item-value="value" :key="formData.inherent" />
      </v-card-text>
    </v-card>

    <!-- Conditional Form -->
    <v-expand-transition>
      <div v-if="formData.mitigationStatus === 'planMitigation'">
        <v-row>
          <!-- Planning Date -->
          <v-col cols="12" md="6">
            <v-text-field v-model="formData.mitigationPlanningDate" :label="$t('risk.mitigation_planning_date')"
              type="date" variant="outlined" density="comfortable" />
          </v-col>

          <!-- Treatment Decision -->
          <v-col cols="12" md="6">
            <v-autocomplete v-model="formData.selectedTreatmentDecision" :items="treatmentDecisionOptions"
              item-title="text" item-value="value" chips :label="$t('risk.treatment_decision')"
              :placeholder="$t('risk.select_treatment_decision')" variant="outlined" density="comfortable" />
          </v-col>

          <!-- Accepting -->
          <template v-if="formData.selectedTreatmentDecision === 'accepting'">
            <v-col cols="12">
              <v-textarea v-model="formData.acceptingJustification" :label="$t('risk.justification')"
                :placeholder="$t('risk.enter_justification')" variant="outlined" rows="3" auto-grow
                @blur="onAcceptingJustificationBlur" />
            </v-col>
          </template>

          <!-- Mitigating -->
          <template v-if="formData.selectedTreatmentDecision === 'mitigating'">
            <v-col cols="12" md="6">
              <v-autocomplete v-model="formData.selectedMitigationEffort" :items="mitigationEffortOptions"
                item-title="name" item-value="id" chips :label="$t('risk.mitigation_effort')"
                :placeholder="$t('risk.select_mitigation_effort')" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete v-model="formData.selectedMitigationOwner" :items="userOptions" item-title="full_name"
                item-value="id" chips :label="$t('risk.mitigation_owner')"
                :placeholder="$t('risk.select_mitigation_owner')" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model.number="formData.mitigationCost" :label="$t('risk.mitigation_cost')" type="number"
                prefix="$" variant="outlined" density="comfortable" />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="formData.mitigationPercent" type="number" label="Mitigation %"
                @input="clampPercent('mitigationPercent')" />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete v-model="formData.selectedMitigationTeam" :items="teamOptions" item-title="name"
                item-value="id" chips :label="$t('risk.mitigation_team')"
                :placeholder="$t('risk.select_mitigation_team')" variant="outlined" density="comfortable"
                multiple></v-autocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete v-model="formData.selectedMitigationControls" :items="controlOptions"
                item-title="short_name" item-value="id" chips :label="$t('risk.mitigation_controls')"
                :placeholder="$t('risk.select_mitigation_controls')" variant="outlined" density="comfortable"
                multiple></v-autocomplete>
            </v-col>
          </template>

          <!-- Sharing -->
          <template v-if="formData.selectedTreatmentDecision === 'sharing'">
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.counterParty" :label="$t('risk.counter_party')" variant="outlined"
                density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.coveragePercent" type="number" label="Coverage %"
                @input="clampPercent('coveragePercent')" />
            </v-col>
          </template>

          <!-- Avoiding -->
          <template v-if="formData.selectedTreatmentDecision === 'avoiding'">
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.avoidingAction" :label="$t('risk.avoiding_action')" variant="outlined"
                density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.effectiveDate" :label="$t('risk.effective_date')" type="date"
                variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="formData.operationalImpact" :label="$t('risk.operational_impact')" variant="outlined"
                rows="3" auto-grow />
            </v-col>
          </template>

          <!-- Common (not accepting) -->
          <template v-if="formData.selectedTreatmentDecision">
            <v-col cols="12" md="6">
              <v-textarea v-model="formData.currentSolution" :label="$t('risk.current_solution')" variant="outlined" rows="3" auto-grow />
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea v-model="formData.securityRecommendations" :label="$t('risk.security_recommendations')" variant="outlined"
                rows="3" auto-grow />
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea v-model="formData.securityRequirements" :label="$t('risk.security_requirements')" variant="outlined" rows="3"
                auto-grow />
            </v-col>
          </template>

          <!-- Residual Risk -->
          <v-col cols="12">
            <v-alert 
              :key="`residual-${formData.residual}-${residualRiskColor}`" 
              :color="residualRiskColor" 
              :icon="residualRiskIcon" 
              variant="tonal"
              border="start">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <strong>{{ $t('risk.residual_risk') }}:</strong>
                  {{ formData.residual !== null ? formData.residual : '-' }}
                </div>
                <div class="text-right">
                  <div>{{ residualRiskComparisonText }}</div>
                  <div class="caption">{{ $t('risk.risk_appetite') }}: {{ riskAppetite }}</div>
                </div>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-container>
</template>

<script>
import RiskMitigationEffort from "@/API/RiskMitigationEffort/RiskMitigationEffort";
import Control from "@/API/Control/Control";
import Team from "@/API/Team/Team";
import User from "@/API/User/User";

export default {
  name: "MitigationPlanningForm",
  inject: ["formData"],

  data() {
    return {
      mitigationEffortOptions: [],
      controlOptions: [],
      teamOptions: [],
      userOptions: [],
      loading: false,
      initialResidual: null,
      forceUpdateKey: 0, // Add this to force reactivity
      treatmentDecisionOptions: [
        { text: this.$t("risk.accepting"), value: "accepting" },
        { text: this.$t("risk.mitigating"), value: "mitigating" },
        { text: this.$t("risk.sharing"), value: "sharing" },
        { text: this.$t("risk.avoiding"), value: "avoiding" }
      ]
    };
  },

  computed: {
    riskAppetite() {
      return parseFloat(this.formData?.appetite || 1);
    },
    
    isMitigationRequired() {
      const inherent = parseFloat(this.formData?.inherent || 0);
      return inherent > this.riskAppetite;
    },
    
    mitigationStatusOptions() {
      const inherent = parseFloat(this.formData?.inherent || 0);
      const appetite = this.riskAppetite;

      const opts = [
        { text: this.$t("risk.no_mitigation"), value: "noMitigation" },
        { text: this.$t("risk.plan_mitigation"), value: "planMitigation" }
      ];

      if (inherent > appetite) {
        return opts.map(o =>
          o.value === "noMitigation" ? { ...o, disabled: true } : o
        );
      }

      return opts;
    },

    residualRiskNumeric() {
      // Force reactivity by accessing forceUpdateKey and formData.residual
      this.forceUpdateKey; // This triggers re-computation when forceUpdateKey changes
      const residual = this.formData?.residual;
      const r = parseFloat(residual);
      return Number.isFinite(r) ? r : null;
    },
    
    residualRiskColor() {
      const r = this.residualRiskNumeric;
      if (r === null) return "info";
      if (r <= this.riskAppetite) return "success";
      if (r <= this.riskAppetite * 1.5) return "warning";
      return "error";
    },
    
    residualRiskIcon() {
      const r = this.residualRiskNumeric;
      if (r === null) return "mdi-information";
      if (r <= this.riskAppetite) return "mdi-check-circle";
      if (r <= this.riskAppetite * 1.5) return "mdi-alert-circle";
      return "mdi-close-circle";
    },
    
    residualRiskComparisonText() {
      const r = this.residualRiskNumeric;
      if (r === null) return '';
      if (r <= this.riskAppetite) return this.$t('risk.within_appetite');
      if (r <= this.riskAppetite * 1.5) return this.$t('risk.moderate_concern');
      return this.$t('risk.exceeds_appetite');
    }
  },

  created() {
    if (!this.formData) {
      this.formData = {};
    }
    if (!this.formData.mitigationStatus) {
      this.formData.mitigationStatus = this.isMitigationRequired ? "planMitigation" : "noMitigation";
    }
    if (this.formData.residual == null) {
      this.formData.residual = this.formData.inherent ?? 0;
    }

    this.initialResidual = this.formData.residual;
  },

  async mounted() {
    this.calculateResidualRisk();

    this.loading = true;

    try {
      const riskMitigationEffort = new RiskMitigationEffort();
      const control = new Control();
      const team = new Team();
      const user = new User();
      
      this.mitigationEffortOptions = (await riskMitigationEffort.getAll({ select: "id|name" })) || [];
      this.controlOptions = (await control.getAll({ select: "id|short_name|mitigation_percent" })) || [];
      this.teamOptions = (await team.getAll({ select: "id|name" })) || [];
      this.userOptions = (await user.getAll({ select: "id|full_name" })) || [];
    } catch (e) {
      console.error("Error loading mitigation dropdowns:", e);
    } finally {
      this.loading = false;
    }
  },

  activated() {
    // This runs when component becomes active (if using keep-alive)
    this.$nextTick(() => {
      this.calculateResidualRisk();
      this.forceReactivityUpdate();
    });
  },

  watch: {
    isMitigationRequired(required) {
      if (required && this.formData.mitigationStatus === "noMitigation") {
        this.formData.mitigationStatus = "planMitigation";
      }
    },
    
    "formData.mitigationStatus"(mitigationStatus) {
      if (mitigationStatus === "noMitigation") {
        this.clearAllMitigationFields();
        // Restore residual to inherent value
        this.formData.residual = parseFloat(this.formData.inherent || 0);
      } else if (mitigationStatus === "planMitigation") {
        this.calculateResidualRisk();
      }
      this.forceReactivityUpdate();
    },
    
    "formData.selectedTreatmentDecision": {
      handler(decision) {
        this.clearTreatmentDecisionFields(decision);
        if (decision === "accepting") {
          this.formData.residual = parseFloat(this.formData.inherent || 0);
        } else if (decision === "avoiding") {
          this.formData.residual = 0;
        } else {
          this.calculateResidualRisk();
        }
        this.forceReactivityUpdate();
      },
      immediate: true
    },
    
    "formData.inherent": {
      handler(newVal) {
        if (newVal !== undefined && newVal !== null) {
          this.calculateResidualRisk();
          this.forceReactivityUpdate();
        }
      },
      immediate: true
    },
    
    "formData.residual": {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.forceReactivityUpdate();
        }
      },
      immediate: true
    },
    
    "formData.selectedMitigationControls": {
      handler() {
        if (this.formData.selectedTreatmentDecision === "mitigating") {
          this.calculateResidualRisk();
          this.forceReactivityUpdate();
        }
      },
      immediate: true
    },
    
    "formData.mitigationPercent": {
      handler() {
        if (this.formData.selectedTreatmentDecision === "mitigating") {
          this.calculateResidualRisk();
          this.forceReactivityUpdate();
        }
      },
      immediate: true
    },
    
    "formData.coveragePercent": {
      handler() {
        if (this.formData.selectedTreatmentDecision === "sharing") {
          this.calculateResidualRisk();
          this.forceReactivityUpdate();
        }
      },
      immediate: true
    },
    
    riskAppetite() {
      this.calculateResidualRisk();
      this.forceReactivityUpdate();
    }
  },

  methods: {
    clampPercent(field) {
      if (this.formData[field] > 100) {
        this.formData[field] = 100;
      } else if (this.formData[field] < 0) {
        this.formData[field] = 0;
      }
    },
    
    calculateResidualRisk() {
      const inherent = parseFloat(this.formData?.inherent || 0);

      if (this.formData.selectedTreatmentDecision === "mitigating") {
        const manualPct = parseFloat(this.formData.mitigationPercent || 0);

        const controlPercents = (this.formData.selectedMitigationControls || [])
          .map(id => {
            const found = this.controlOptions.find(c => c.id === id);
            return found ? found.mitigation_percent || 0 : 0;
          });

        const maxControlPct = controlPercents.length > 0 ? Math.max(...controlPercents) : 0;
        const effectivePct = Math.max(manualPct, maxControlPct);

        this.formData.residual = Number((inherent * (1 - effectivePct / 100)).toFixed(1));

      } else if (this.formData.selectedTreatmentDecision === "sharing") {
        const coverage = parseFloat(this.formData.coveragePercent || 0) / 100;
        this.formData.residual = Number((inherent - inherent * coverage).toFixed(1));

      } else if (this.formData.selectedTreatmentDecision === "avoiding") {
        this.formData.residual = 0;

      } else if (this.formData.selectedTreatmentDecision === "accepting") {
        this.formData.residual = inherent;
      } else {
        // No treatment decision selected, residual equals inherent
        this.formData.residual = inherent;
      }
    },

    forceReactivityUpdate() {
      // Force Vue to re-evaluate computed properties
      this.forceUpdateKey++;
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },

    onTabActivated() {
      // Call this method when the mitigation tab becomes active
      this.$nextTick(() => {
        this.calculateResidualRisk();
        this.forceReactivityUpdate();
      });
    },

    onAcceptingJustificationBlur() {
      if (this.formData.selectedTreatmentDecision === "accepting" && this.formData.acceptingJustification) {
        this.formData.approvedAt = new Date().toISOString().slice(0, 10);
        this.formData.approvedBy = this.formData.approvedBy || null;
        this.$emit("accepting-justified", {
          justification: this.formData.acceptingJustification,
          approvedAt: this.formData.approvedAt
        });
      }
    },
    
    validateMitigationStatus() {
      if (this.isMitigationRequired && !this.formData.mitigationStatus) {
        this.$emit("validation-error", this.$t("risk.mitigation_status_required"));
        return false;
      }
      return true;
    },
    
    clearTreatmentDecisionFields(keepDecision = null) {
      // Reset all fields that belong to treatment decisions except the current one
      if (keepDecision !== "accepting") {
        this.formData.acceptingJustification = null;
      }
      if (keepDecision !== "mitigating") {
        this.formData.selectedMitigationEffort = null;
        this.formData.selectedMitigationOwner = null;
        this.formData.mitigationCost = null;
        this.formData.mitigationPercent = null;
        this.formData.selectedMitigationTeam = [];
        this.formData.selectedMitigationControls = [];
      }
      if (keepDecision !== "sharing") {
        this.formData.counterParty = null;
        this.formData.coveragePercent = null;
      }
      if (keepDecision !== "avoiding") {
        this.formData.avoidingAction = null;
        this.formData.effectiveDate = null;
        this.formData.operationalImpact = null;
      }
    },

    clearAllMitigationFields() {
      this.clearTreatmentDecisionFields();
      this.formData.currentSolution = null;
      this.formData.securityRecommendations = null;
      this.formData.securityRequirements = null;
      this.formData.residual = parseFloat(this.formData.inherent || 0);
    },
    
    clearAllTerminationFields() {
      this.formData.mitigationPlanningDate = null;
      this.formData.selectedTreatmentDecision = null;
      this.clearAllMitigationFields();
    }
  }
};
</script>