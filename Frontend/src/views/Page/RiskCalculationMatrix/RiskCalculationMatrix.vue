<template>
  <main-page ref="page" :isFlipped="isFlipped" 
  :mainPage="'Risk Mgmt'" 
  :subPage="'configurations'"
  :titlePage="'Risk Calculation Matrix'"

     v-permission:show>
    <template #datatable>
      <div class="content-header">
        <div class="card shadow-sm border-0 rounded-lg">
          <div class="card-header bg-gradient-primary text-white py-3 mt-4">
            <h4 class="card-title m-0 font-weight-bold">{{ $t('riskcalculationmatrix.risk_calculation_matrix') }}</h4>
          </div>
          <div class="card-body p-4">
            <!-- Formula Selection Form -->
            <form @submit.prevent="handleFormulaSave" class="mb-4">
              <div class="row align-items-end g-3">
                <div class="col-md-8">
                  <label class="form-label text-muted fw-semibold">{{ $t('riskcalculationmatrix.risk_formula')
                  }}</label>
                  <select v-model="selectedFormula" class="form-select form-select-sm border-2">
                    <option v-for="formula in formulas" :key="formula" :value="formula">
                      {{ formula }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <button type="submit" class="btn btn-primary btn-sm w-100 py-2">
                    <i class="fas fa-save me-2"></i>{{ $t('riskcalculationmatrix.save_formula') }}
                  </button>
                </div>
              </div>
            </form>

            <!-- Risk Level Legend -->
            <div class="risk-legend mb-4">
              <div class="d-flex justify-content-center flex-wrap gap-4">
                <div v-for="level in riskLevels" :key="level?.id" class="d-flex align-items-center">
                  <div class="risk-color-box me-2" :style="{ backgroundColor: level?.color }"></div>
                  <span class="text-muted fw-semibold">{{ level?.name }}</span>
                </div>
              </div>
            </div>

            <!-- Risk Matrix -->
            <div class="table-responsive matrix-container" v-if="impacts.length && likelihoods.length">
              <table class="table table-bordered risk-matrix mb-0">
                <tbody>
                  <!-- Impact Rows -->
                  <tr v-for="(impact, i) in impacts" :key="i" :class="{ 'row-hover': true }">
                    <td v-if="i === 0" :rowspan="impacts.length" class="align-middle impact-label">
                      <div class="vertical-text text-center">{{ $t('riskcalculationmatrix.impact') }}</div>
                    </td>
                    <td class="bg-light border">
                      <div class="editable-cell" :class="{ 'editing': isEditing('impact', i) }">
                        <span v-if="!isEditing('impact', i)" @click="startEditing('impact', i, impact.name)"
                          class="editable-text">
                          {{ impact.name }}
                        </span>
                        <input v-else v-model="editValue" class="form-control form-control-sm edit-input"
                          @blur="handleBlur" @keyup.enter.prevent="handleEnter" @keyup.esc="cancelEditing"
                          ref="editInput">
                      </div>
                    </td>
                    <td class="bg-light border fw-bold text-center">{{ impact.value }}</td>
                    <!-- Risk cells based on likelihood values -->
                    <td v-for="likelihood in likelihoods" :key="likelihood.value" class="risk-cell"
                      :style="{ backgroundColor: getRiskColor(calculateRisk(impact.value, likelihood.value, impacts.length, likelihoods.length)) }">
                      {{ calculateRisk(impact.value, likelihood.value, impacts.length, likelihoods.length) }}
                    </td>
                  </tr>

                  <!-- Likelihood Rows -->
                  <tr class="likelihood-row text-center">
                    <td colspan="3"></td>
                    <td v-for="likelihood in likelihoods" :key="likelihood.value" class="bg-light border fw-bold">
                      {{ likelihood.value }}
                    </td>
                  </tr>
                  <tr class="likelihood-labels">
                    <td colspan="3"></td>
                    <td v-for="(likelihood, index) in likelihoods" :key="index" class="bg-light border">
                      <div class="editable-cell" :class="{ 'editing': isEditing('likelihood', index) }">
                        <span v-if="!isEditing('likelihood', index)"
                          @click="startEditing('likelihood', index, likelihood.name)" class="editable-text">
                          {{ likelihood.name }}
                        </span>
                        <input v-else v-model="editValue" class="form-control form-control-sm edit-input"
                          @blur="handleBlur" @keyup.enter.prevent="handleEnter" @keyup.esc="cancelEditing"
                          ref="editInput">
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3"></td>
                    <td :colspan="likelihoods.length" class="text-center fw-bold likelihood-header">{{
                      $t('riskcalculationmatrix.likelihood') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Show message if no data -->
            <div v-else class="text-center py-4 text-muted">
              <p>No impact or likelihood data available. Please configure them first.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </main-page>
</template>

<script>
// import RiskCalculationMatrix from '@/API/RiskCalculationMatrix/RiskCalculationMatrix'
import { RiskCalculator } from "@/API/Risk/RiskCalculator";
import riskLevel from '@/API/RiskLevel/RiskLevel'
import { notify } from '@kyvg/vue3-notification'
import Swal from 'sweetalert2'
import MainPage from "@/components/MainPage.vue";

export default {
  name: 'RiskMatrix',
  components: {
    MainPage, // Main page layout component
  },
data() {
  return {
    // Initialize API client
    api: new RiskCalculator(),
    apiRiskLevel: new riskLevel(),

    // State Management
    impacts: [],
    likelihoods: [],
    selectedFormula: '',
    editingCell: null,
    editValue: '',
    riskLevels: [],
    impactId: null,
    likelihoodId: null,

    // Constants
    formulas: [
      'Likelihood x Impact + 2(Impact)',
      'Likelihood x Impact + Impact',
      'Likelihood x Impact',
      'Likelihood x Impact + Likelihood',
      'Likelihood x Impact + 2(Likelihood)'
    ],

    // Formula Calculations Map - now with dynamic max calculation
    formulaCalculations: {
      'Likelihood x Impact + 2(Impact)': { 
        calc: (base, impact, likelihood, impactLength, likelihoodLength) => {
          const result = base + 2 * impact;
          const max = impactLength * likelihoodLength + 2 * impactLength;
          return { result, max };
        } 
      },
      'Likelihood x Impact + Impact': { 
        calc: (base, impact, likelihood, impactLength, likelihoodLength) => {
          const result = base + impact;
          const max = impactLength * likelihoodLength + impactLength;
          return { result, max };
        } 
      },
      'Likelihood x Impact': { 
        calc: (base, impact, likelihood, impactLength, likelihoodLength) => {
          const result = base;
          const max = impactLength * likelihoodLength;
          return { result, max };
        } 
      },
      'Likelihood x Impact + Likelihood': { 
        calc: (base, impact, likelihood, impactLength, likelihoodLength) => {
          const result = base + likelihood;
          const max = impactLength * likelihoodLength + likelihoodLength;
          return { result, max };
        } 
      },
      'Likelihood x Impact + 2(Likelihood)': { 
        calc: (base, impact, likelihood, impactLength, likelihoodLength) => {
          const result = base + 2 * likelihood;
          const max = impactLength * likelihoodLength + 2 * likelihoodLength;
          return { result, max };
        } 
      }
    }
  }
},

  async mounted() {
    await this.initializeData()
  },
  methods: {
    // Utility Functions
  calculateRisk(impactValue, likelihoodValue, impactLength, likelihoodLength) {
    const base = impactValue * likelihoodValue;
    const formula = this.formulaCalculations[this.selectedFormula];
    
    // Convert lengths to integers safely
    const iLen = parseInt(impactLength, 10) || 0;
    const lLen = parseInt(likelihoodLength, 10) || 0;
    
    // Calculate result and max dynamically
    const { result, max } = formula.calc(base, impactValue, likelihoodValue, iLen, lLen);
    
    // Scale the result based on the dynamic max value
    const scaledResult = (result * ((iLen * lLen) / max)).toFixed(1);
    
    return scaledResult;
  },


    getRiskColor(value) {
      const riskLevelList = this.riskLevels;
      for (let i = 0; i < riskLevelList?.length; i++) {
        if (value >= riskLevelList[i]?.from && (i < riskLevelList?.length && value < riskLevelList[i + 1]?.from)) {
          return riskLevelList[i].color
        } else if (value >= riskLevelList[riskLevelList?.length - 1]?.from && i === riskLevelList?.length - 1) {
          return riskLevelList[riskLevelList?.length - 1].color
        }
      }
    },

    isEditing(type, index) {
      return this.editingCell?.type === type && this.editingCell?.index === index
    },

    // Edit State Management
    startEditing(type, index, value) {
      this.editingCell = { type, index, enterPressed: false }
      this.editValue = value
    },

    cancelEditing() {
      this.editingCell = null
      this.editValue = ''
    },

    // Event Handlers
    handleBlur() {
      if (!this.editingCell?.enterPressed) {
        this.saveChanges()
      }
    },

    async handleEnter(event) {
      event.preventDefault()
      if (this.editingCell) {
        this.editingCell.enterPressed = true
        await this.saveChanges()
      }
    },

    async saveChanges() {
      if (!this.editingCell || !this.editValue.trim()) {
        this.cancelEditing();
        return;
      }

      const result = await Swal.fire({
        title: this.$t('riskcalculationmatrix.are_you_sure_save_changes'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#44225c',
        cancelButtonColor: '#ffc107',
        confirmButtonText: this.$t('riskcalculationmatrix.yes_save'),
        cancelButtonText: this.$t('riskcalculationmatrix.cancel')
      });

      if (!result.isConfirmed) {
        this.cancelEditing();
        return;
      }

      const { type, index } = this.editingCell;
      const newValue = this.editValue.trim();
      const dataset = type === "impact" ? this.impacts : this.likelihoods;
      const id = type === "impact" ? this.impactId : this.likelihoodId;

      if (!id || !dataset?.length) {
        notify({
          title: this.$t("riskcalculationmatrix.error"),
          text: this.$t("riskcalculationmatrix.no_dataset_found"),
          type: "error"
        });
        this.cancelEditing();
        return;
      }

      try {
        // Update dataset name
        const updatedData = dataset.map((item, i) => {
          if (i === index) {
            return { ...item, name: newValue };
          }
          return item;
        });
        // Build payload
        const payload = {
          type: type === "impact" ? "impacts" : "likelihoods",
          id,
          data: updatedData,
          calculationMatrix: "update"
        };
        await this.api.systemSettingsApi.update(payload);
        if (type === "impact") {
          this.impacts = updatedData;
        } else {
          this.likelihoods = updatedData;
        }
        notify({
          title: this.$t("riskcalculationmatrix.updated_successfully"),
          text: `${type} ${this.$t("riskcalculationmatrix.updated_successfully_text")}`,
          type: "success"
        });
      } catch (error) {
        console.error(error);
        notify({
          title: this.$t("riskcalculationmatrix.error"),
          text: this.$t("riskcalculationmatrix.failed_to_update"),
          type: "error"
        });
      }

      this.cancelEditing();
    },

    async handleFormulaSave() {
      try {
        const response = await this.api.systemSettingsApi.insert({
          type: 'risk_calculation_formula',
          data: this.selectedFormula || this.formulas[0]
        });
        notify({
          title: this.$t('riskcalculationmatrix.updated_successfully'),
          text: this.$t('riskcalculationmatrix.risk_calculation_formula_updated'),
          type: 'success'
        })
      } catch (error) {
        notify({
          title: this.$t('riskcalculationmatrix.error'),
          text: this.$t('riskcalculationmatrix.failed_to_save_formula'),
          type: 'error'
        })
      }
    },

    // Initialization
    async initializeData() {
      try {
        // Insert default formula if needed
        await this.api.systemSettingsApi.insert({
          type: 'risk_calculation_formula',
          data: this.formulas[0]
        });

        const response = await this.api.systemSettingsApi.getAll({
          filter: "type|risk_calculation_formula|="
        });

        if (response?.length) {
          this.selectedFormula = response[0].data;
        }

        // Load risk levels
        this.riskLevels = await this.apiRiskLevel.getAll({ sort: "from|asc" });

        if (!this.riskLevels?.length) {
          await this.apiRiskLevel.insert({ from: 0, color: "#33e677", name: this.$t('riskcalculationmatrix.low') });
          await this.apiRiskLevel.insert({ from: 10, color: "#e6e037", name: this.$t('riskcalculationmatrix.medium') });
          await this.apiRiskLevel.insert({ from: 15, color: "#ffa200", name: this.$t('riskcalculationmatrix.high') });
          await this.apiRiskLevel.insert({ from: 20, color: "#ff0000", name: this.$t('riskcalculationmatrix.very_high') });
          this.riskLevels = await this.apiRiskLevel.getAll({ sort: "from|asc" });
        }

        // Load impacts and likelihoods in parallel
        const [impactsResult, likelihoodsResult] = await Promise.all([
          this.api.systemSettingsApi.getAll({ filter: "type|impacts|=" }),
          this.api.systemSettingsApi.getAll({ filter: "type|likelihoods|=" })
        ]);

        // Map impacts properly
        if (impactsResult?.length) {
          const impactsObj = impactsResult[0];
          this.impacts = (impactsObj.data || []).map((item, index) => ({
            ...item,
            params: impactsObj.params || [], // attach params from root
            data: item.data || []
          }));
          this.impactId = impactsObj._id || impactsObj.id;
        }

        // Map likelihoods properly
        if (likelihoodsResult?.length) {
          const likelihoodsObj = likelihoodsResult[0];
          this.likelihoods = (likelihoodsObj.data || []).map((item, index) => ({
            ...item,
            params: likelihoodsObj.params || [], // attach params from root
            data: item.data || []
          }));
          this.likelihoodId = likelihoodsObj._id || likelihoodsObj.id;
        }
      } catch (error) {
        notify({
          title: this.$t('riskcalculationmatrix.error'),
          text: this.$t('riskcalculationmatrix.failed_to_initialize'),
          type: 'error'
        });
        console.error("Initialization error:", error);
      }
    }

  }
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #44225c 0%, #2d1b3d 100%);
}

.risk-legend {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
}

.risk-color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.matrix-container {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.risk-matrix {
  margin: 0;
  border-collapse: separate;
  border-spacing: 1px;
}

.vertical-text {
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  min-height: 150px;
  white-space: nowrap;
  font-weight: bold;
  color: #44225c;
}

.impact-label {
  background: #f8f9fa;
  border: none;
}

.editable-cell {
  padding: 0px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.editable-text {
  padding: 0px 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

.editable-text:hover {
  background-color: rgba(68, 34, 92, 0.1);
}

.edit-input {
  border: 2px solid #44225c;
  border-radius: 0.25rem;
  text-align: center;
}

.risk-cell {
  padding: 0 0.5rem;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  text-align: center;
}

.row-hover:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

.likelihood-header {
  background: #f8f9fa;
  color: #44225c;
  padding: 0.75rem;
}

.form-select {
  border-color: #e9ecef;
  box-shadow: none;
}

.form-select:focus {
  border-color: #44225c;
  box-shadow: 0 0 0 0.2rem rgba(68, 34, 92, 0.25);
}

.btn-primary {
  background-color: #44225c;
  border-color: #44225c;
}
.btn-primary:hover {
  background-color: #2d1b3d;
  border-color: #2d1b3d;
}
.page-title-card {
  padding: 20px !important;
}
.btn-primary {
  color: #fff;
}
.table-responsive{
overflow:auto;
}
</style>