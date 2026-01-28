<template>
  <v-container fluid>
    <v-row>
      <!-- Technology Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedTechnologies" :items="technologyOptions" item-title="name"
          item-value="id" chips :label="$t('risk.technology')" :placeholder="$t('risk.select_technologies')"
          variant="outlined" density="comfortable" multiple />
      </v-col>

      <!-- Impact Scope Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedImpactScope" :items="impactScopeOptions" item-title="name"
          item-value="id" chips :label="$t('risk.impact_scope')" :placeholder="$t('risk.select_impact_scope')"
          variant="outlined" density="comfortable" clearable />
      </v-col>

      <!-- Likelihood Field -->
      <v-col cols="12" md="6">
        <input type="hidden" v-model="formData.selectedLikelihoodValue" />
        <v-text-field v-model="formData.selectedLikelihoodLabel" :label="$t('risk.current_likelihood')"
          :placeholder="$t('risk.select_likelihood')" variant="outlined" density="comfortable" readonly
          @click="openParamsModal('likelihood')" />
      </v-col>

      <!-- Impact Field -->
      <v-col cols="12" md="6">
        <input type="hidden" v-model="formData.selectedImpactValue" />
        <v-text-field v-model="formData.selectedImpactLabel" :label="$t('risk.current_impact')"
          :placeholder="$t('risk.select_impact')" variant="outlined" density="comfortable" readonly
          @click="openParamsModal('impact')" />
      </v-col>

      <!-- Responsible Party Field -->
      <v-col cols="12" md="6">
        <v-textarea v-model="formData.responsibleParty" :label="$t('risk.responsible_party')"
          :placeholder="$t('risk.enter_responsible_party')" variant="outlined" rows="3" auto-grow />
      </v-col>

      <!-- KRIs Field -->
      <v-col cols="12" md="6">
        <v-textarea v-model="formData.kris" :label="$t('risk.kris')" :placeholder="$t('risk.enter_key_risk_indicators')"
          variant="outlined" rows="3" auto-grow />
      </v-col>

      <!-- Description Field -->
      <v-col cols="12" md="6">
        <v-textarea v-model="formData.description" :label="$t('risk.description')"
          :placeholder="$t('risk.enter_description')" variant="outlined" rows="3" auto-grow />
      </v-col>

      <!-- Supporting Documentation Field -->
      <v-col cols="12" md="6">
        <v-file-input v-model="formData.supportingDocuments" :label="$t('risk.supporting_documentation')"
          :placeholder="$t('risk.upload_files')" variant="outlined" multiple @update:model-value="handleFileUpload"
          show-size prepend-icon="mdi-paperclip" />
      </v-col>
    </v-row>

    <!-- Parameters Modal -->
    <ParamsModal v-model:show="showParamsModal" :modalTitle="modalTitle" :activeParams="activeParams"
      :initialSelectedLevels="selectedLevels" @apply="applySelectedParams" />
  </v-container>
</template>

<script>
import RiskMitigationEffort from "@/API/RiskMitigationEffort/RiskMitigationEffort";
import RiskSource from "@/API/RiskSource/RiskSource";
import Technology from "@/API/Technology/Technology";
import { RiskCalculator } from "@/API/Risk/RiskCalculator";
// import ParamsModal from "@/views/Page/Risk/CreateRisk/ParamsModal.vue";
// import appetiteTolerance from "@/API/appetiteTolerance/appetiteTolerance";

export default {
  name: "RiskAssessmentForm",
  components: { ParamsModal },
  inject: ["formData"],
  setup() {
    const riskResource = new RiskSource();
    const technology = new Technology();
    const riskCalculator = new RiskCalculator();
    const appetiteToleranceApi = new appetiteTolerance();

    return {
      riskResource,
      technology,
      riskCalculator,
      appetiteToleranceApi
    };
  },
  data() {
    return {
      technologyOptions: [],
      impactScopeOptions: [],
      likelihoodOptions: [],
      impactOptions: [],
      loading: false,

      // modal related
      showParamsModal: false,
      modalTitle: "",
      activeParams: [],
      selectedLevels: {},
      currentParamType: null,

      likelihoodList: [],
      impactList: [],
    };
  },

  created() {
    if (!this.formData) {
      this.formData = {
        selectedTechnologies: [],
        selectedImpactScope: null,
        selectedLikelihood: null,
        selectedImpact: null,
        responsibleParty: "",
        kris: "",
        description: "",
        supportingDocuments: [],
        formula: "",
        inherent: null,
        residual: null,
        selectedLikelihoodValue: "",
        selectedLikelihoodLabel: "",
        selectedImpactValue: "",
        selectedImpactLabel: "",
        selectedLevels: [],
        appetite: "",
        tolerance: "",
        // appetiteToleranceOptions: []
      };
    }
  },

  async mounted() {
    this.loading = true;
    await this.riskCalculator.initialize();

    this.technologyOptions = (await this.technology.getAll({ select: "id|name" })) || [];
    this.impactScopeOptions = (await this.riskResource.getAll({ select: "id|name" })) || [];
    // this.appetiteToleranceOptions = await this.appetiteToleranceApi.getAll({
    //   filter: `type|appetitetolerance|=`
    // });
    this.formData.appetite = this.appetiteToleranceOptions[0]?.appetite ?? 0;
    this.formData.tolerance = this.appetiteToleranceOptions[0]?.tolerance ?? 0;

    this.likelihoodList = this.riskCalculator.getLikelihoodList();
    this.impactList = this.riskCalculator.getImpactList();

    if (this.likelihoodList?.value?.data) {
      this.likelihoodOptions = this.likelihoodList.value.data.map((item) => ({
        id: item.value,
        name: item.name,
        value: item.value,
      }));
    }

    if (this.impactList?.value?.data) {
      this.impactOptions = this.impactList.value.data.map((item) => ({
        id: item.value,
        name: item.name,
        value: item.value,
      }));
    }

    this.getInherentAndResidualRisk();
    this.loading = false;
  },

  methods: {
    // Updated applySelectedParams method
    applySelectedParams(selectedLevels) {
      // Ensure it's an array
      if (!Array.isArray(this.formData.selectedLevels)) {
        this.formData.selectedLevels = [];
      }

      // Remove old selections of this type
      this.formData.selectedLevels = this.formData.selectedLevels.filter(
        (lvl) => lvl.type !== this.currentParamType
      );

      // Convert object -> array with parameter information
      const newSelections = [];

      Object.entries(selectedLevels).forEach(([paramId, level]) => {
        const param = this.activeParams.params.find(p => p.id == paramId);

        newSelections.push({
          paramId: paramId,
          paramName: param ? param.name : (this.currentParamType === "likelihood" ? "Likelihood" : "Impact"),
          levelNumber: level.levelNumber,
          levelName: level.levelName,
          color: level.color || null,
          type: this.currentParamType,
        });
      });

      this.formData.selectedLevels.push(...newSelections);

      if (newSelections.length > 0) {
        const maxLevel = newSelections.reduce((max, lvl) =>
          lvl.levelNumber > max.levelNumber ? lvl : max
        );

        // Get level name from the appropriate list
        let levelNameFromList = this.getLevelNameFromList(maxLevel.levelNumber, this.currentParamType);

        if (this.currentParamType === "likelihood") {
          this.formData.selectedLikelihoodValue = maxLevel.levelNumber;
          this.formData.selectedLikelihoodLabel = levelNameFromList;
        } else {
          this.formData.selectedImpactValue = maxLevel.levelNumber;
          this.formData.selectedImpactLabel = levelNameFromList;
        }

        this.getInherentAndResidualRisk();
      }
    },

    getLevelNameFromList(levelNumber, type) {
      try {
        const list = type === "likelihood" ? this.likelihoodList : this.impactList;
        console.log("list", list);

        // Check if list has the expected structure with data array
        if (list && Array.isArray(list.data)) {
          const item = list.data.find(item => item.value === levelNumber);
          return item ? item.name : `Level ${levelNumber}`;
        }

        // Fallback if structure is different
        return `Level ${levelNumber}`;
      } catch (error) {
        console.error('Error getting level name from list:', error);
        return `Level ${levelNumber}`;
      }
    },
    // Fixed version - stores specific parameter selections
    openParamsModal(type) {
      this.currentParamType = type;
      this.selectedLevels = {}; // reset temporary selection

      let list = type === "likelihood" ? this.likelihoodList : this.impactList;
      this.activeParams = list || [];
      this.modalTitle =
        type === "likelihood"
          ? this.$t("risk.likelihood_parameters")
          : this.$t("risk.impact_parameters");

      // Preselect existing selections from stored parameter selections
      if (Array.isArray(this.formData.selectedLevels) && this.activeParams && this.activeParams.params) {
        this.activeParams.params.forEach((param) => {
          // Look for selection specifically for this parameter and type
          const existing = this.formData.selectedLevels.find(
            (selection) =>
              selection.type === type &&
              selection.paramId === param.id // Use paramId instead of paramName
          );

          if (existing) {
            // Find the exact level that was previously selected
            const matchingLevel = param.levels.find(
              (level) =>
                level.levelNumber === existing.levelNumber &&
                level.levelName === existing.levelName
            );

            if (matchingLevel) {
              this.selectedLevels[param.id] = matchingLevel;
            }
          }
        });
      }

      this.showParamsModal = true;
    },

    getInherentAndResidualRisk() {
      const selectedImpact = this.formData.selectedImpactValue || 0;
      const selectedLikelihood = this.formData.selectedLikelihoodValue || 0;
      const risk = this.riskCalculator.calculateInherentRisk(
        selectedLikelihood,
        selectedImpact
      );
      this.formData.formula = this.riskCalculator?.defaultFormula?.value;
      this.formData.inherent = risk?.risk;
      if (this.formData?.mitigationPercent > 0) {
        this.formData.residual = (
          this.formData.inherent -
          (this.formData?.mitigationPercent * risk?.risk) / 100
        ).toFixed(2);
      } else {
        this.formData.residual = risk?.risk;
      }
    },

    handleFileUpload(files) {
      this.formData.supportingDocuments = files;
    },

    resetForm() {
      this.formData.selectedTechnologies = [];
      this.formData.selectedImpactScope = null;
      this.formData.selectedLikelihood = null;
      this.formData.selectedImpact = null;
      this.formData.responsibleParty = "";
      this.formData.kris = "";
      this.formData.description = "";
      this.formData.supportingDocuments = [];
      this.formData.inherent = null;
      this.formData.residual = null;
      this.formData.selectedLikelihoodValue = "";
      this.formData.selectedImpactValue = "";
      this.formData.appetite = "";
      this.formData.tolerance = "";
    },
  },
};
</script>
