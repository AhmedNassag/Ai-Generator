<template>
  <div v-permission:show></div>
  <Card9 colClass="col-sm-12 simple-form-wizard" cardhaderClass="pb-0 title-header" span="true" :spanClass="desc">
    <div class="d-flex justify-content-between m-1">
      <div class="h3">{{ $t("risk.add_risk") }}</div>
    </div>
    <v-stepper v-model="currentStep">
      <v-stepper-header>
        <template v-for="(tab, i) in customTabs" :key="i">
          <v-stepper-item :value="i + 1" :title="tab.title"></v-stepper-item>
          <v-divider v-if="i < customTabs.length - 1"></v-divider>
        </template>
      </v-stepper-header>

      <v-stepper-window v-model="currentStep">
        <v-stepper-window-item :value="1">
          <RiskIdentification />
          <div class="d-flex justify-space-between mt-4">
            <RouterLink to="risk">
              <v-btn class="text-white" style="background-color: #b3b3b3;">
                {{ $t("common.back") }}
              </v-btn>
            </RouterLink>

            <!-- <v-btn v-permission:create class="btn btn-primary text-white" @click="handleNext">{{ $t("common.next")
            }}</v-btn> -->
            <v-btn class="btn btn-primary text-white" :loading="loadingSubmit" :disabled="loadingSubmit"
              @click="handleSubmit">
              <template v-if="!loading">{{ $t("common.submit") }}</template>
              <template v-else>
                <v-progress-circular indeterminate size="20" color="white"></v-progress-circular>
                <span class="ml-2">{{ $t("common.submitting") }}</span>
              </template>
            </v-btn>

          </div>
        </v-stepper-window-item>

        <!-- <v-stepper-window-item :value="2">
          <RiskAnalysis />
          <div class="d-flex justify-space-between mt-4">
            <v-btn @click="currentStep--" class="text-white" style="background-color: #b3b3b3;">{{ $t("common.back")
            }}</v-btn>
            <v-btn v-permission:create class="btn btn-primary text-white" @click="handleNext">{{ $t("common.next")
            }}</v-btn>
          </div>
        </v-stepper-window-item>

        <v-stepper-window-item :value="3">
          <RiskEvaluationAndTreatment />
          <div class="d-flex justify-space-between mt-4">
            <v-btn @click="currentStep--" class="text-white" style="background-color: #b3b3b3;">Back</v-btn>
            <v-btn v-permission:create class="btn btn-primary text-white" @click="handleNext" :disabled="disableNext">
              Next
            </v-btn>
          </div>
        </v-stepper-window-item>

        <v-stepper-window-item :value="4">
          <RiskReview />
          <div class="d-flex justify-space-between mt-4">
            <v-btn @click="currentStep--" class="text-white" style="background-color: #b3b3b3;">{{ $t("common.back")
            }}</v-btn>
            <v-btn class="btn btn-primary text-white" @click="handleSubmit">{{ $t("common.submit") }}</v-btn>
          </div>
        </v-stepper-window-item> -->
      </v-stepper-window>
    </v-stepper>
  </Card9>
</template>

<script>
import { defineAsyncComponent } from "vue";
import Risk from "@/API/Risk/Risk";
import { notify } from "@kyvg/vue3-notification";
import Auth from "@/API/Auth";
import { RiskCalculator } from "@/API/Risk/RiskCalculator";

export default {
  name: "RiskManagement",

  components: {
    Card9: defineAsyncComponent(() => import("@/components/commen/card/cardData1.vue")),
    RiskIdentification: defineAsyncComponent(() => import("./CreateRisk/RiskIdentification.vue")),
    RiskAnalysis: defineAsyncComponent(() => import("./CreateRisk/RiskAnalysis.vue")),
    RiskEvaluationAndTreatment: defineAsyncComponent(() => import("./CreateRisk/RiskEvaluationAndTreatment.vue")),
    RiskReview: defineAsyncComponent(() => import("./CreateRisk/RiskReview.vue"))
  },
  setup() {
    const riskCalculator = new RiskCalculator();
    return {
      riskCalculator,
    };
  },
  data() {
    return {
      desc: "Use the different types of fades and animations in modals.",
      currentStep: 1,
      formData: {
        errors: {}
      },
      errors: {},
      risk: new Risk(),
      loadingSubmit: false,
      customTabs: [
        { title: this.$t("risk.risk_identification") },
        // { title: this.$t("risk.risk_analysis") },
        // { title: this.$t("risk.risk_evaluation_and_treatment") },
        // { title: this.$t("risk.risk_review") },
      ]
    };
  },

  provide() {
    return {
      formData: this.formData
    };
  },

  computed: {
    currentStepComponent() {
      switch (this.currentStep) {
        case 1:
          return "RiskIdentification";
        // case 2:
        //   return "RiskAnalysis";
        // case 3:
        //   return "RiskEvaluationAndTreatment";
        // case 4:
        //   return "RiskReview";
        // default:
        //   return "RiskIdentification";
      }
    },
    disableNext() {
      // if current step is 3 (RiskEvaluationAndTreatment)
      if (this.currentStep === 3) {
        const inherent = parseFloat(this.formData?.inherent || 0);
        const appetite = parseFloat(this.formData?.appetite || 0);
        if (inherent > appetite && !this.formData?.selectedTreatmentDecision) {
          return true;
        }
      }
      return false;
    }
  },

  watch: {
    currentStep(newVal, oldVal) {
      console.log(`Step changed from ${oldVal} to ${newVal}`);
      console.log('Current form data:', this.formData);
    }
  },

  methods: {
    validateCurrentStep() {
      // Example validation for first step
      if (this.currentStep === 1) {
        if (!this.formData?.subject || this.formData?.subject?.length < 1) {
          this.formData.errors.subject = 'Subject is required';
          return false;
        } else {
          this.formData.errors.subject = null;
          return true;
        }
      }
      return true;
    },

    handleNext() {
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    },

    async handleSubmit() {
      this.loadingSubmit = true;
      const DataCalculator = await this.riskCalculator.initialize();
      console.log('selectedImpactValue:', this.formData?.selectedImpactValue);
      console.log('selectedLikelihoodValue:', this.formData?.selectedLikelihoodValue);
      console.log('Form submission', this.formData);
      // const filteredLevels = (this.formData?.selectedLevels ?? []).map(level => ({
      //   paramId: level.paramId,
      //   levelNumber: level.levelNumber,
      //   type: level.type,
      // }));

      const fd = {
        created_by_id: Auth.USER.id,
        subject: this.formData?.subject,
        category_id: this.formData?.selectedRiskCategory,
        risk_mapping_ids: this.formData?.selectedRisks,
        threat_mapping_ids: this.formData?.selectedThreats,
        location_ids: this.formData?.selectedLocations,
        stakeholder_ids: this.formData?.selectedStakeholders,
        owner_id: this.formData?.selectedOwner,
        tag_ids: this.formData?.selectedTags,
        team_ids: this.formData?.selectedTeams,
        reference_id: this.formData?.selectedReference,
        regulator_id: this.formData?.selectedRegulator,
        control_id: this.formData?.selectedControl,
        asset_ids: this.formData?.selectedAssets,
        vuln_catalogs: this.formData?.selectedVulnCatalogs,
        existing_control: this.formData?.exstingControl,
        risk_scenario: this.formData?.riskScenario,
        // technology_ids: this.formData?.selectedTechnologies,
        // impact_scope_id: this.formData?.selectedImpactScope,
        current_impact: Math.max(...(DataCalculator.impacts?.map(i => i.value) || [0])),

        current_likelihood: Math.max(...(DataCalculator.likelihoods?.map(i => i.value) || [0])),
        // responsible_party: this.formData?.responsibleParty,
        // kips: this.formData?.kris,
        // description: this.formData?.description,
        // supporting_document: this.formData?.supportingDocuments,
        // mitigation_planing: this.formData?.mitigationPlanningDate,
        // mitigation_effort_id: this.formData?.selectedMitigationEffort,
        // mitigation_owner_id: this.formData?.selectedMitigationOwner,
        // mitigation_cost: this.formData?.mitigationCost,
        // mitigation_percent: this.formData?.mitigationPercent,
        // current_solution: this.formData?.currentSolution,
        // mitigation_control_ids: this.formData?.selectedMitigationControls,
        // mitigation_team_ids: this.formData?.selectedMitigationTeam,
        // security_recommendations: this.formData?.securityRecommendations,
        // security_requirements: this.formData?.securityRequirements,
        // selected_treatment_decision: this.formData?.selectedTreatmentDecision,
        // counter_party: this.formData?.counter_party,
        // coverage_percent: this.formData?.coveragePercent,
        // avoiding_action: this.formData?.avoidingAction,
        // effective_date: this.formData?.effectiveDate,
        // operational_impact: this.formData?.operationalImpact,
        // mitigation_status: this.formData?.mitigationStatus,
        // review_status: this.formData?.reviewStatus,
        // reviews: this.formData?.reviews,

        // inhertent: this.formData?.inherent || 0,
        // residual: this.formData?.mitigationPercent > 0 ?
        //   (this.formData?.inherent - (this.formData?.inherent * this.formData?.mitigationPercent / 100)) :
        //   this.formData?.inherent,
        // residual:0,
        // formula: this.formData?.formula,
        // risk_scenario: this.formData?.riskScenario,
        // vuln_catalogs: this.formData?.selectedVulnCatalogs,
        // existing_control: this.formData?.exstingControl,
        // selected_levels: filteredLevels,
      };

      try {
        const response = await this.risk.insert(fd, {}, true);
        if (response.status === 'success') {
          this.$router.push({ name: "Risk" });
          notify({
            title: "Risk saved successfully",
            text: "The operation was completed successfully!",
            type: "success",
          });
        } else if (response.errors) {
          this.errors = response.errors;
        } else {
          notify({
            title: "Something went wrong",
            text: response,
            type: "danger",
          });
        }
      } catch (error) {
        this.loadingSubmit = false;
        notify({
          title: "Error",
          text: "An unexpected error occurred",
          type: "danger",
        });
      }
    }
  }
}
</script>