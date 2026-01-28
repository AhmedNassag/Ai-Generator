<template>
  <div class="card-graph">
    <div class="card shadow-sm border-0 rounded-lg">
      <div class="card-body bg-white">
        <h4 class="card-title mb-2 text-dark fw-bold">{{ $t('riskcalculationmatrix.RiskFormula') }}</h4>
        <!-- Formula Selection Form -->
        <form @submit.prevent="handleFormulaSave" class="mb-4">
          <div class="row align-items-end g-3">
            <div class="col-md-10">
              <select v-model="selectedFormula" class="form-select border">
                <option v-for="formula in formulas" :key="formula" :value="formula">
                  {{ formula }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-purple w-100 py-2">
                <i class="fas fa-save m-rtl ms-2"></i>Save Formula
              </button>
            </div>
          </div>
        </form>

        <!-- Risk Level Legend -->
        <div class="risk-legend mb-4">
          <div class="d-flex justify-content-center flex-wrap gap-4">
            <div v-for="level in sortedRiskLevels" :key="level?.id" class="d-flex align-items-center">
              <div class="risk-color-box me-2" :style="{ backgroundColor: level?.color }"></div>
              <span class="text-dark fw-normal">{{ level?.name }} ({{ level?.from }}+)</span>
            </div>
          </div>
        </div>

        <!-- Risk Matrix -->
        <div v-if="localImpacts.length && localLikelihoods.length" class="table-responsive matrix-container">
          <table class="table table-bordered risk-matrix mb-0">
            <tbody>
              <!-- Impact Rows -->
              <tr v-for="(impact, i) in localImpacts" :key="i" :class="{ 'row-hover': true }">
                <td v-if="i === 0" :rowspan="localImpacts.length" class="align-middle impact-label">
                  <div class="vertical-text text-center">{{ $t('riskcalculationmatrix.impact') }}</div>
                </td>
                <td class="bg-light-gray border text-dark impact-name-cell">
                  <div class="editable-cell impact-cell-content" :class="{ 'editing': isEditing('impact', i) }">
                    <span v-if="!isEditing('impact', i)" @click="startEditing('impact', i, impact.name)"
                      class="editable-text">
                      {{ impact.name }}
                    </span>
                    <input v-else v-model="editValue" class="form-control form-control-sm edit-input" @blur="handleBlur"
                      @keyup.enter.prevent="handleEnter" @keyup.esc="cancelEditing" ref="editInput">
                  </div>
                </td>
                <td class="bg-light-gray border fw-bold text-center text-dark impact-value-cell">{{ impact.value }}</td>
                <!-- Risk cells based on likelihood values -->
                <td v-for="likelihood in localLikelihoods" :key="likelihood.value" class="risk-cell"
                  :style="{ backgroundColor: getRiskColor(calculateRisk(impact.value, likelihood.value, localImpacts.length, localLikelihoods.length)) }">
                  {{ calculateRisk(impact.value, likelihood.value, localImpacts.length, localLikelihoods.length) }}
                </td>
              </tr>

              <!-- Likelihood Rows -->
              <tr class="likelihood-row text-center">
                <td colspan="3" class="empty-cell"></td>
                <td v-for="likelihood in localLikelihoods" :key="likelihood.value"
                  class="bg-light-gray border fw-bold text-dark likelihood-value-cell">
                  {{ likelihood.value }}
                </td>
              </tr>
              <tr class="likelihood-labels">
                <td colspan="3" class="empty-cell"></td>
                <td v-for="(likelihood, index) in localLikelihoods" :key="index" class="bg-light-gray border text-dark likelihood-name-cell">
                  <div class="editable-cell likelihood-cell-content" :class="{ 'editing': isEditing('likelihood', index) }">
                    <span v-if="!isEditing('likelihood', index)"
                      @click="startEditing('likelihood', index, likelihood.name)" class="editable-text">
                      {{ likelihood.name }}
                    </span>
                    <input v-else v-model="editValue" class="form-control form-control-sm edit-input" @blur="handleBlur"
                      @keyup.enter.prevent="handleEnter" @keyup.esc="cancelEditing" ref="editInput">
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="empty-cell"></td>
                <td :colspan="localLikelihoods.length" class="text-center fw-bold likelihood-header">
                  {{ $t('riskcalculationmatrix.likelihood') }}
                </td>
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

<script>
import { RiskCalculator } from "@/API/Risk/RiskCalculator";
import riskLevel from '@/API/RiskLevel/RiskLevel'
import { notify } from '@kyvg/vue3-notification'
import Swal from 'sweetalert2'

export default {
  name: 'RiskCalculationMatrixGraph',
  
  props: {
    impacts: {
      type: Array,
      default: () => []
    },
    likelihoods: {
      type: Array,
      default: () => []
    },
    riskLevels: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      // Initialize API client
      api: new RiskCalculator(),
      apiRiskLevel: new riskLevel(),

      // State Management
      localImpacts: [],
      localLikelihoods: [],
      selectedFormula: 'Likelihood x Impact', // Set default formula
      editingCell: null,
      editValue: '',
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

  computed: {
    // Sort risk levels by 'from' value in ascending order
    sortedRiskLevels() {
      if (!this.riskLevels || !Array.isArray(this.riskLevels)) {
        return [];
      }
      return [...this.riskLevels].sort((a, b) => {
        const fromA = parseFloat(a.from) || 0;
        const fromB = parseFloat(b.from) || 0;
        return fromA - fromB;
      });
    }
  },

  watch: {
    impacts: {
      handler(newVal) {
        this.loadImpactsData(newVal);
      },
      immediate: true,
      deep: true
    },
    likelihoods: {
      handler(newVal) {
        this.loadLikelihoodsData(newVal);
      },
      immediate: true,
      deep: true
    }
  },

  async mounted() {
    await this.loadFormula();
  },

  methods: {
    // Load data from props
    loadImpactsData(impactsData) {
      if (Array.isArray(impactsData) && impactsData.length > 0) {
        const impactsObj = impactsData[0];
        this.localImpacts = (impactsObj.data || []).map((item) => ({
          ...item,
          params: impactsObj.params || [],
          data: item.data || []
        }));
        this.impactId = impactsObj._id || impactsObj.id;
      } else {
        this.localImpacts = [];
        this.impactId = null;
      }
    },

    loadLikelihoodsData(likelihoodsData) {
      if (Array.isArray(likelihoodsData) && likelihoodsData.length > 0) {
        const likelihoodsObj = likelihoodsData[0];
        this.localLikelihoods = (likelihoodsObj.data || []).map((item) => ({
          ...item,
          params: likelihoodsObj.params || [],
          data: item.data || []
        }));
        this.likelihoodId = likelihoodsObj._id || likelihoodsObj.id;
      } else {
        this.localLikelihoods = [];
        this.likelihoodId = null;
      }
    },

    // Load formula
    async loadFormula() {
      try {
        const response = await this.api.systemSettingsApi.getAll({
          filter: "type|risk_calculation_formula|="
        });

        if (response?.length && response[0].data) {
          this.selectedFormula = response[0].data;
          console.log('✅ Formula loaded:', this.selectedFormula);
        } else {
          // Insert default formula if none exists
          console.log('⚠️ No formula found, creating default...');
          await this.api.systemSettingsApi.insert({
            type: 'risk_calculation_formula',
            data: this.formulas[2] // 'Likelihood x Impact'
          });
          this.selectedFormula = this.formulas[2];
        }
      } catch (error) {
        console.error("❌ Error loading formula:", error);
        // Use default formula on error
        this.selectedFormula = 'Likelihood x Impact';
      }
    },

    // Utility Functions
    calculateRisk(impactValue, likelihoodValue, impactLength, likelihoodLength) {
      const base = impactValue * likelihoodValue;
      
      // Default to 'Likelihood x Impact' if selectedFormula is not set or invalid
      const formulaKey = this.selectedFormula || 'Likelihood x Impact';
      const formula = this.formulaCalculations[formulaKey];

      // Fallback if formula is still not found
      if (!formula) {
        console.warn(`Formula not found: ${formulaKey}, using default calculation`);
        return base.toFixed(1);
      }

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
      // Convert value to float for accurate comparison
      const numericValue = parseFloat(value);
      
      // Return default color if value is invalid
      if (isNaN(numericValue)) {
        console.warn('Invalid risk value:', value);
        return '#cccccc';
      }

      // Use sorted risk levels
      const levels = this.sortedRiskLevels;
      
      if (!levels || levels.length === 0) {
        console.warn('No risk levels defined');
        return '#cccccc';
      }

      // Find the appropriate risk level
      // Iterate through sorted levels and find where the value falls
      for (let i = 0; i < levels.length; i++) {
        const currentLevel = levels[i];
        const nextLevel = levels[i + 1];
        
        const currentFrom = parseFloat(currentLevel.from) || 0;
        
        // If this is the last level, check if value >= from
        if (!nextLevel) {
          if (numericValue >= currentFrom) {
            return currentLevel.color;
          }
        } else {
          // Check if value falls in current range: from <= value < nextFrom
          const nextFrom = parseFloat(nextLevel.from) || 0;
          if (numericValue >= currentFrom && numericValue < nextFrom) {
            return currentLevel.color;
          }
        }
      }

      // If no match found, return the first level color (lowest)
      return levels[0].color;
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
      const dataset = type === "impact" ? this.localImpacts : this.localLikelihoods;
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
          this.localImpacts = updatedData;
        } else {
          this.localLikelihoods = updatedData;
        }
        
        // Emit event to parent to refresh data
        this.$emit('data-updated');
        
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
    }
  }
}
</script>

<style scoped>
/* Background */
.card-graph {
  background: #F5F5F5;
  border-radius: 67px;
}

/* Card Styling */
.card {
  background: #FFFFFF;
  border-radius: 8px;
}

.card-title {
  color: #333333;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-body {
  background-color: #F5F5F5 !important;
  margin: 0px !important;
}

/* Form Elements */
.form-label {
  color: #333333;
  font-size: 0.95rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.form-select {
  border: 1px solid #D0D0D0;
  border-radius: 15px;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: #333333;
  background-color: #FFFFFF;
}

.form-select:focus {
  border-color: #7B4397;
  box-shadow: 0 0 0 0.2rem rgba(123, 67, 151, 0.15);
  outline: none;
}

/* Button Styling */
.btn-purple {
  background: #6f2dbd !important;
  border: none;
  color: #FFFFFF;
  font-weight: 500;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  border-radius:15px ;
}

.btn-purple:hover {
  background: linear-gradient(135deg, #6A3686 0%, #4A2569 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(123, 67, 151, 0.3);
  color: #FFFFFF;
}

/* Risk Legend */
.risk-legend {
  background: #FAFAFA;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #E8E8E8;
}

.risk-color-box {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.risk-legend span {
  color: #333333;
  font-size: 0.9rem;
}

/* Matrix Container */
.matrix-container {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #E0E0E0;
  background: #FFFFFF;
}

.risk-matrix {
  margin: 0;
  border-collapse: separate;
  border-spacing: 0;
}

/* Impact Label (Y-axis) */
.vertical-text {
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  min-height: 200px;
  white-space: nowrap;
  font-weight: 600;
  color: #755C87;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.impact-label {
  background: #F8F8F8;
  border: 1px solid #E0E0E0 !important;
  padding: 0.25rem;
  width: 35px;
  min-width: 35px;
  max-width: 35px;
}

/* Likelihood Header (X-axis) */
.likelihood-header {
  background: #F8F8F8;
  color: #755C87;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid #E0E0E0 !important;
  letter-spacing: 0.5px;
}

/* Light Gray Background for Labels */
.bg-light-gray {
  background-color: #F8F8F8 !important;
  color: #333333;
  font-size: 0.85rem;
}

/* All table cells */
.risk-matrix td {
  width: 120px;
  height: 50px;
  padding: 0.5rem;
  vertical-align: middle;
  text-align: center;
  border: 1px solid #E0E0E0 !important;
}

/* Impact Name Cell */
.impact-name-cell {
  text-align: left !important;
  padding-left: 1rem !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.85rem;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
}

/* Impact Value Cell */
.impact-value-cell {
  font-size: 0.9rem;
  font-weight: 600;
  width: 45px;
  min-width: 45px;
  max-width: 45px;
}

/* Likelihood Value Cell */
.likelihood-value-cell {
  font-size: 1rem;
  font-weight: 600;
}

/* Likelihood Name Cell */
.likelihood-name-cell {
  white-space: normal;
  word-wrap: break-word;
  font-size: 0.8rem;
  padding: 0.5rem !important;
  line-height: 1.3;
}

/* Empty cells */
.risk-matrix td.empty-cell,
.risk-matrix .empty-cell {
  border: 0 !important;
  box-shadow: none !important;
}

.risk-matrix td.empty-cell + td,
.risk-matrix td + .empty-cell {
  border-left: none !important;
  border-right: none !important;
}

.risk-matrix {
  border-collapse: separate !important;
}

.risk-matrix td.empty-cell {
  border-right: 1px solid #dee2e6 !important;
}

/* Editable Cell */
.editable-cell {
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333333;
}

.impact-cell-content {
  text-align: left;
  padding: 0;
}

.likelihood-cell-content {
  text-align: center;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.editable-text {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: inline-block;
}

.editable-text:hover {
  background-color: rgba(123, 67, 151, 0.08);
}

.edit-input {
  border: 2px solid #7B4397;
  border-radius: 4px;
  text-align: center;
  color: #333333;
}

/* Risk Cell */
.risk-cell {
  font-weight: 600;
  color: #333333;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.risk-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.row-hover:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Likelihood Row */
.likelihood-row td {
  font-size: 1rem;
}

.likelihood-labels td {
  padding: 0.75rem 0.5rem;
}

/* Responsive */
.table-responsive {
  overflow: auto;
}
[dir="rtl"] .form-select {
text-align: end !important;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row{
text-align: end;
}
</style>