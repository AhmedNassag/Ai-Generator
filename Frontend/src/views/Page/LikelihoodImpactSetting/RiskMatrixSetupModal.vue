<template>
    <!-- Ultra Modern Modal -->
    <v-dialog v-model="showConfigModal" max-width="1200px" persistent scrollable>
        <v-card class="modern-modal">
            <!-- Header -->
            <div class="modal-header">
                <h2 class="header-title">Risk Matrix Setup</h2>
                <v-btn icon @click="closeConfigModal" class="close-btn">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>

            <!-- Step Indicator -->
            <div class="step-indicator">
                <div class="step-item" :class="{ active: currentStep === 1 }">
                    <div class="step-number">1</div>
                    <div class="step-label">Matrix Dimensions</div>
                </div>
                <div class="step-divider"></div>
                <div class="step-item" :class="{ active: currentStep === 2 }">
                    <div class="step-number">2</div>
                    <div class="step-label">Risk Levels</div>
                </div>
                <div class="step-divider"></div>
                <div class="step-item" :class="{ active: currentStep === 3 }">
                    <div class="step-number">3</div>
                    <div class="step-label">Appetite & Tolerance</div>
                </div>
            </div>

            <v-card-text class="modal-body">
                <!-- Step 1: Matrix Dimensions -->
                <div v-if="currentStep === 1" class="step-content">
                    <!-- Combined Matrix Configuration Card -->
                    <v-row class="compact-row">
                        <v-col cols="12">
                            <v-card class="section-block unified-matrix-card" elevation="0">
                                <v-row no-gutters>
                                    <v-col cols="12" md="8">
                                        <!-- Matrix Size Section -->
                                        <div class="matrix-size-section">
                                            <div class="section-header compact-header">
                                                <div class="section-title-wrapper compact-title-wrapper">
                                                    <h3 class="section-title compact-title">Matrix Size</h3>
                                                    <p class="section-desc compact-desc">
                                                        Select The Size Of Your Risk Matrix. This Determines The Number Of Impact And Likelihood Levels.
                                                        <span v-if="hasExistingParams" class="readonly-notice">
                                                            (Locked - Parameters exist)
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div class="dimension-card-inner compact-inner" :class="{ 'readonly-container': hasExistingParams }">
                                                <div class="dimension-content compact-content">
                                                    <div class="dimension-controls compact-controls">
                                                        <div class="control-header">
                                                            <div class="control-label compact-label">
                                                                Matrix Size
                                                            </div>
                                                            <v-chip class="level-chip compact-chip" label small>
                                                                {{ matrixConfig.levels }}×{{ matrixConfig.levels }}
                                                            </v-chip>
                                                        </div>
                                                        <div class="slider-container compact-slider">
                                                            <v-btn 
                                                                icon 
                                                                small 
                                                                class="control-btn compact-btn"
                                                                @click="decrementLevel"
                                                                :disabled="hasExistingParams">
                                                                <v-icon small>mdi-minus-circle</v-icon>
                                                            </v-btn>
                                                            <v-slider 
                                                                v-model="matrixConfig.levels" 
                                                                :min="1" 
                                                                :max="10"
                                                                thumb-label="always"
                                                                class="level-slider compact-slider-component disabled-slider"
                                                                readonly 
                                                                @change="syncAllLevels"
                                                                :disabled="hasExistingParams">
                                                                <template v-slot:thumb-label="{ value }">
                                                                    <span class="slider-value">{{ value }}×{{ value }}</span>
                                                                </template>
                                                            </v-slider>
                                                            <v-btn 
                                                                icon 
                                                                small 
                                                                class="control-btn compact-btn"
                                                                @click="incrementLevel"
                                                                :disabled="hasExistingParams">
                                                                <v-icon small>mdi-plus-circle</v-icon>
                                                            </v-btn>
                                                        </div>
                                                        
                                                        <!-- Optional: Add a helpful message -->
                                                        <div v-if="hasExistingParams" class="readonly-message">
                                                            <v-icon small color="#ff9800" class="mr-2">mdi-information</v-icon>
                                                            <span>Matrix size cannot be changed when parameters exist. Delete all parameters first to modify the matrix size.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </v-col>

                                    <v-col cols="12" md="4">
                                        <!-- Matrix Preview Section -->
                                        <div class="matrix-preview-section">
                                            <div class="section-header compact-header">
                                                <div>
                                                    <h3 class="section-title compact-title">Matrix Preview</h3>
                                                    <p class="section-subtitle compact-desc">{{ matrixConfig.levels }}×{{ matrixConfig.levels }} Grid Will Be Generated</p>
                                                </div>
                                            </div>
                                            <div class="dimension-visual compact-visual">
                                                <div class="grid-preview compact-grid">
                                                    <div v-for="n in matrixConfig.levels * matrixConfig.levels" :key="n"
                                                        class="grid-cell" :style="{ animationDelay: `${n * 0.02}s` }">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- Rest of your template remains the same -->
                    <v-row>
                        <v-col cols="12" md="6">
                            <div class="section-block levels-section">
                                <div class="section-header">
                                    <div>
                                        <h3 class="section-title">Impact Level</h3>
                                        <p class="section-subtitle">Define Severity Levels For Impact Assessment</p>
                                    </div>
                                </div>

                                <div class="levels-list">
                                    <div v-for="(level, index) in impactConfig.levels" :key="'impact-' + index"
                                        class="level-row">
                                        <div class="level-badge" :style="{ backgroundColor: level.color }">
                                            {{ level.value }}
                                        </div>
                                        <v-text-field v-model="level.name" :placeholder="`Impact ${level.value}`"
                                            outlined dense hide-details class="level-field">
                                        </v-text-field>
                                        <div class="color-circle" :style="{ backgroundColor: level.color }"
                                            @click="openColorPicker('impact', index)"></div>
                                        <input type="color" v-model="level.color" class="hidden-color-picker"
                                            :ref="`impactColor${index}`" @change="updateLevelColors">
                                    </div>
                                </div>
                            </div>
                        </v-col>

                        <v-col cols="12" md="6">
                            <div class="section-block levels-section">
                                <div class="section-header">
                                    <div>
                                        <h3 class="section-title">Likelihood Level</h3>
                                        <p class="section-subtitle">Define Probability Levels For Occurrence</p>
                                    </div>
                                </div>

                                <div class="levels-list">
                                    <div v-for="(level, index) in likelihoodConfig.levels" :key="'likelihood-' + index"
                                        class="level-row">
                                        <div class="level-badge" :style="{ backgroundColor: level.color }">
                                            {{ level.value }}
                                        </div>
                                        <v-text-field v-model="level.name" :placeholder="`Likelihood ${level.value}`"
                                            outlined dense hide-details class="level-field">
                                        </v-text-field>
                                        <div class="color-circle" :style="{ backgroundColor: level.color }"
                                            @click="openColorPicker('likelihood', index)"></div>
                                        <input type="color" v-model="level.color" class="hidden-color-picker"
                                            :ref="`likelihoodColor${index}`" @change="updateLevelColors">
                                    </div>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </div>

                <!-- Step 2: Risk Levels -->
                <div v-if="currentStep === 2" class="step-content">
                    <div class="risk-levels-container">
                        <div class="risk-levels-header">
                            <div>
                                <h3 class="risk-levels-title">Define Risk Levels</h3>
                                <p class="risk-levels-subtitle">Define Risk Name, From And Color (Max value: {{ maxRiskValue }})</p>
                            </div>
                            <v-btn color="#6E3894" dark class="add-level-btn" @click="addRiskLevel"
                                :disabled="loadingRiskLevels">
                                <v-icon left small>mdi-plus</v-icon>
                                Add Level
                            </v-btn>
                        </div>

                        <div v-if="loadingRiskLevels" class="loading-container">
                            <v-progress-circular indeterminate color="#6E3894" size="48"></v-progress-circular>
                            <p class="loading-text">Loading Risk Levels...</p>
                        </div>

                        <div v-else class="risk-levels-list">
                            <div v-for="(level, index) in riskLevels" :key="'risk-' + index" class="risk-level-item">
                                <div class="risk-level-fields">
                                    <div class="risk-field-group">
                                        <label class="risk-field-label">Name*</label>
                                        <v-text-field v-model="level.name" placeholder="Enter Risk Level Name" outlined
                                            dense class="risk-input" error-messages=" ">
                                        </v-text-field>
                                    </div>

                                    <div class="risk-field-group">
                                        <label class="risk-field-label">From*</label>
                                        <v-text-field v-model="level.from" 
                                            :placeholder="`Enter A Value Between 1 And ${maxRiskValue}`"
                                            outlined dense type="number" class="risk-input"
                                            :error-messages="getRiskLevelFromError(index) || ' '"
                                            @input="validateRiskLevelFrom(index)">
                                        </v-text-field>
                                    </div>

                                    <div class="risk-field-group">
                                        <label class="risk-field-label">Color*</label>
                                        <div class="color-picker-wrapper" @click="openRiskColorPicker(index)">
                                            <div class="color-display" :style="{ backgroundColor: level.color }"></div>
                                        </div>
                                        <input type="color" v-model="level.color" class="hidden-color-picker"
                                            :ref="`riskColor${index}`">
                                        <div class="error-space">&nbsp;</div>
                                    </div>

                                    <v-btn v-if="riskLevels.length > 1" icon small class="delete-level-btn"
                                        @click="removeRiskLevel(index)">
                                        <v-icon small color="#999">mdi-delete-outline</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 3: Appetite & Tolerance -->
                <div v-if="currentStep === 3" class="step-content">
                    <div class="appetite-tolerance-container">
                        <div class="appetite-tolerance-header">
                            <h3 class="appetite-tolerance-title">Appetite Tolerance</h3>
                            <p class="appetite-tolerance-subtitle">Add Value To Appetite And Tolerance (Max value: {{ maxRiskValue }})</p>
                        </div>

                        <div v-if="loadingAppetiteTolerance" class="loading-container">
                            <v-progress-circular indeterminate color="#6E3894" size="48"></v-progress-circular>
                            <p class="loading-text">Loading Appetite & Tolerance...</p>
                        </div>

                        <div v-else class="appetite-tolerance-fields">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <div class="appetite-field-group">
                                        <label class="appetite-field-label">Appetite*</label>
                                        <v-text-field v-model="appetiteValue" placeholder="5" outlined dense
                                            type="number" class="appetite-input"
                                            :error-messages="getAppetiteError()"
                                            @input="validateAppetite">
                                        </v-text-field>
                                    </div>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <div class="appetite-field-group">
                                        <label class="appetite-field-label">Tolerance*</label>
                                        <v-text-field v-model="toleranceValue" placeholder="6" outlined dense
                                            type="number" class="appetite-input"
                                            :error-messages="getToleranceError()"
                                            @input="validateTolerance">
                                        </v-text-field>
                                    </div>
                                </v-col>
                            </v-row>
                        </div>
                    </div>
                </div>
            </v-card-text>

            <!-- Footer -->
            <v-divider></v-divider>
            <v-card-actions class="modal-footer">
                <v-btn text large @click="closeConfigModal" class="cancel-btn">
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="currentStep > 1" text large @click="prevStep" class="back-btn">
                    <v-icon left>mdi-arrow-left</v-icon>
                    Back
                </v-btn>
                <v-btn v-if="currentStep < 3" color="white" large dark @click="nextStep" class="next-btn">
                    Next
                    <v-icon right>mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn v-if="currentStep === 3" color="white" large dark :loading="savingAll" :disabled="!canSaveAll"
                    @click="saveAllConfiguration" class="next-btn">
                    Save Configuration
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import riskLevel from "@/API/RiskLevel/RiskLevel";
import systemSetting from "@/API/SystemSetting/SystemSetting";

export default {
    name: 'ConfigurationModal',

    props: {
        impacts: {
            type: Array,
            default: () => []
        },
        likelihoods: {
            type: Array,
            default: () => []
        }
    },

    data() {
        return {
            showConfigModal: false,
            currentStep: 1,
            paramActiveTab: 0,
            impactConfig: {
                name: 'Impact',
                levels: []
            },
            likelihoodConfig: {
                name: 'Likelihood',
                levels: []
            },
            matrixConfig: {
                levels: 5
            },
            riskLevels: [],
            appetiteValue: null,
            toleranceValue: null,
            impactParameters: [],
            likelihoodParameters: [],
            openPanels: [],
            savingAll: false,
            riskLevelApi: new riskLevel(),
            systemSettingApi: new systemSetting(),
            loadingRiskLevels: false,
            loadingAppetiteTolerance: false,
            appetiteToleranceId: null,
            riskLevelErrors: {},
            appetiteError: '',
            toleranceError: ''
        };
    },

    computed: {
                hasExistingParams() {
            const impactHasParams = Array.isArray(this.impacts) && 
                                   this.impacts.length > 0 && 
                                   Array.isArray(this.impacts[0]?.params) && 
                                   this.impacts[0].params.length > 0;
            
            const likelihoodHasParams = Array.isArray(this.likelihoods) && 
                                       this.likelihoods.length > 0 && 
                                       Array.isArray(this.likelihoods[0]?.params) && 
                                       this.likelihoods[0].params.length > 0;
            
            return impactHasParams || likelihoodHasParams;
        },
        maxRiskValue() {
            return this.matrixConfig.levels * this.matrixConfig.levels;
        },
        canSaveAll() {
            const impactValid = this.impactConfig.levels.length > 0 &&
                this.impactConfig.levels.every(lvl => lvl.name.trim() !== '' && lvl.color.trim() !== '');

            const likelihoodValid = this.likelihoodConfig.levels.length > 0 &&
                this.likelihoodConfig.levels.every(lvl => lvl.name.trim() !== '' && lvl.color.trim() !== '');

            // Risk levels validation
            const riskLevelsValid = this.validateRiskLevels();

            // Appetite & Tolerance validation
            const appetiteToleranceValid = this.validateAppetiteTolerance();

            return impactValid && likelihoodValid && riskLevelsValid && appetiteToleranceValid;
        },
        currentFormParameters() {
            return this.paramActiveTab === 0 ? this.impactParameters : this.likelihoodParameters;
        },
        matrixCells() {
            const cells = [];
            const levels = this.matrixConfig.levels;

            for (let row = levels; row >= 1; row--) {
                for (let col = 1; col <= levels; col++) {
                    cells.push({
                        row,
                        col,
                        number: (row - 1) * levels + col,
                        riskLevel: this.calculateRiskLevel(row, col, levels)
                    });
                }
            }

            return cells;
        }
    },

    watch: {
        'matrixConfig.levels'(newVal) {
            this.adjustConfigLevels(newVal);
            this.adjustParameterLevels(newVal);
            // Re-validate all values when matrix size changes
            this.validateAllRiskLevels();
            this.validateAppetite();
            this.validateTolerance();
        }
    },

    mounted() {
        this.loadMatrixConfig();
    },

    methods: {
        calculateRiskLevel(row, col, totalLevels) {
            const riskScore = (row + col) / 2;
            const normalizedScore = riskScore / totalLevels;

            if (normalizedScore > 0.7) return 'high';
            if (normalizedScore > 0.4) return 'medium';
            return 'low';
        },

        getCellColor(cell) {
            switch (cell.riskLevel) {
                case 'high':
                    return '#FF5252';
                case 'medium':
                    return '#FFB74D';
                case 'low':
                    return '#4CAF50';
                default:
                    return '#E0E0E0';
            }
        },

        getCellClass(cell) {
            return {
                'high-risk': cell.riskLevel === 'high',
                'medium-risk': cell.riskLevel === 'medium',
                'low-risk': cell.riskLevel === 'low'
            };
        },

        openModal() {
            this.showConfigModal = true;
            this.currentStep = 1;
            this.loadConfigForBothTypes();
            this.loadExistingParameters();
            this.fetchRiskLevels();
            this.fetchAppetiteTolerance();
        },

        openModalForEdit(param) {
            this.openModal();
            const impactParamIds = this.impacts?.[0]?.params?.map(p => p.id) || [];
            if (impactParamIds.includes(param.id)) {
                this.paramActiveTab = 0;
            } else {
                this.paramActiveTab = 1;
            }
        },

        closeConfigModal() {
            this.showConfigModal = false;
            this.currentStep = 1;
            this.impactParameters = [];
            this.likelihoodParameters = [];
            this.openPanels = [];
            this.riskLevelErrors = {};
            this.appetiteError = '';
            this.toleranceError = '';
        },

        nextStep() {
            if (this.currentStep < 3) {
                this.currentStep++;
            }
        },

        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
            }
        },

        incrementLevel() {
            if (this.matrixConfig.levels < 10 && !this.hasExistingParams) {
                this.matrixConfig.levels++;
            }
        },

        decrementLevel() {
            if (this.matrixConfig.levels > 1 && !this.hasExistingParams) {
                this.matrixConfig.levels--;
            }
        },

        syncAllLevels() {
            this.adjustConfigLevels(this.matrixConfig.levels);
        },

        adjustConfigLevels(targetCount) {
            if (this.impactConfig.levels.length < targetCount) {
                while (this.impactConfig.levels.length < targetCount) {
                    this.impactConfig.levels.push({
                        name: `Impact ${this.impactConfig.levels.length + 1}`,
                        color: this.generateColor(this.impactConfig.levels.length, 'impact'),
                        value: this.impactConfig.levels.length + 1,
                        
                    });
                }
            } else if (this.impactConfig.levels.length > targetCount) {
                this.impactConfig.levels = this.impactConfig.levels.slice(0, targetCount);
            }

            if (this.likelihoodConfig.levels.length < targetCount) {
                while (this.likelihoodConfig.levels.length < targetCount) {
                    this.likelihoodConfig.levels.push({
                        name: `Likelihood ${this.likelihoodConfig.levels.length + 1}`,
                        color: this.generateColor(this.likelihoodConfig.levels.length, 'likelihood'),
                        value: this.likelihoodConfig.levels.length + 1,
                        
                    });
                }
            } else if (this.likelihoodConfig.levels.length > targetCount) {
                this.likelihoodConfig.levels = this.likelihoodConfig.levels.slice(0, targetCount);
            }
        },

        adjustParameterLevels(targetCount) {
            this.impactParameters.forEach(param => {
                const currentCount = param.levels.length;

                if (currentCount < targetCount) {
                    for (let i = currentCount; i < targetCount; i++) {
                        const configLevel = this.impactConfig.levels[i];
                        param.levels.push({
                            levelNumber: i + 1,
                            color: configLevel?.color || this.generateColor(i, 'impact'),
                            levelName: '',
                            
                        });
                    }
                } else if (currentCount > targetCount) {
                    param.levels = param.levels.slice(0, targetCount);
                }
            });

            this.likelihoodParameters.forEach(param => {
                const currentCount = param.levels.length;

                if (currentCount < targetCount) {
                    for (let i = currentCount; i < targetCount; i++) {
                        const configLevel = this.likelihoodConfig.levels[i];
                        param.levels.push({
                            levelNumber: i + 1,
                            color: configLevel?.color || this.generateColor(i, 'likelihood'),
                            levelName: '',
                            
                        });
                    }
                } else if (currentCount > targetCount) {
                    param.levels = param.levels.slice(0, targetCount);
                }
            });
        },

        generateColor(index, type) {
            if (type === 'impact') {
                const colors = ['#6366f1', '#22d3ee', '#10b981', '#ef4444', '#8b5cf6'];
                return colors[index % colors.length];
            } else {
                const colors = ['#6366f1', '#10b981', '#ef4444', '#8b5cf6', '#22d3ee'];
                return colors[index % colors.length];
            }
        },

        updateLevelColors() {
            this.$forceUpdate();
        },

        resetImpactLevels() {
            this.impactConfig.levels.forEach((level, index) => {
                level.name = `Impact ${index + 1}`;
                level.color = this.generateColor(index, 'impact');
            });
        },

        resetLikelihoodLevels() {
            this.likelihoodConfig.levels.forEach((level, index) => {
                level.name = `Likelihood ${index + 1}`;
                level.color = this.generateColor(index, 'likelihood');
            });
        },

        loadMatrixConfig() {
            const savedConfig = localStorage.getItem('matrixConfig');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.matrixConfig.levels = parsed.levels || 5;
            }
        },

        loadConfigForBothTypes() {
            if (Array.isArray(this.impacts) && this.impacts.length > 0) {
                const firstItem = this.impacts[0];
                const levels = firstItem?.data || [];
                const targetLevelCount = this.matrixConfig.levels;

                let normalizedLevels = [];
                for (let i = 0; i < targetLevelCount; i++) {
                    if (levels[i]) {
                        normalizedLevels.push({
                            name: levels[i].name || `Impact ${i + 1}`,
                            color: levels[i].color || this.generateColor(i, 'impact'),
                            value: i + 1,
                        });
                    } else {
                        normalizedLevels.push({
                            name: `Impact ${i + 1}`,
                            color: this.generateColor(i, 'impact'),
                            value: i + 1,
                            
                        });
                    }
                }

                this.impactConfig = {
                    name: firstItem.name || 'Impact',
                    levels: normalizedLevels
                };
            } else {
                const targetLevelCount = this.matrixConfig.levels;
                this.impactConfig = {
                    name: 'Impact',
                    levels: Array.from({ length: targetLevelCount }, (_, index) => ({
                        name: `Impact ${index + 1}`,
                        color: this.generateColor(index, 'impact'),
                        value: index + 1,
                        
                    }))
                };
            }

            if (Array.isArray(this.likelihoods) && this.likelihoods.length > 0) {
                const firstItem = this.likelihoods[0];
                const levels = firstItem?.data || [];
                const targetLevelCount = this.matrixConfig.levels;

                let normalizedLevels = [];
                for (let i = 0; i < targetLevelCount; i++) {
                    if (levels[i]) {
                        normalizedLevels.push({
                            name: levels[i].name || `Likelihood ${i + 1}`,
                            color: levels[i].color || this.generateColor(i, 'likelihood'),
                            value: i + 1,
                        });
                    } else {
                        normalizedLevels.push({
                            name: `Likelihood ${i + 1}`,
                            color: this.generateColor(i, 'likelihood'),
                            value: i + 1,
                            
                        });
                    }
                }

                this.likelihoodConfig = {
                    name: firstItem.name || 'Likelihood',
                    levels: normalizedLevels
                };
            } else {
                const targetLevelCount = this.matrixConfig.levels;
                this.likelihoodConfig = {
                    name: 'Likelihood',
                    levels: Array.from({ length: targetLevelCount }, (_, index) => ({
                        name: `Likelihood ${index + 1}`,
                        color: this.generateColor(index, 'likelihood'),
                        value: index + 1,
                        
                    }))
                };
            }
        },

        loadExistingParameters() {
            if (Array.isArray(this.impacts) && this.impacts.length > 0 && this.impacts[0].params) {
                this.impactParameters = this.impacts[0].params.map(param => ({
                    id: param.id,
                    name: param.name,
                    levels: param.levels.map(level => ({ ...level }))
                }));
            } else {
                this.impactParameters = [];
            }

            if (Array.isArray(this.likelihoods) && this.likelihoods.length > 0 && this.likelihoods[0].params) {
                this.likelihoodParameters = this.likelihoods[0].params.map(param => ({
                    id: param.id,
                    name: param.name,
                    levels: param.levels.map(level => ({ ...level }))
                }));
            } else {
                this.likelihoodParameters = [];
            }

            this.openPanels = [...this.impactParameters.map((_, idx) => idx),
            ...this.likelihoodParameters.map((_, idx) => idx + this.impactParameters.length)];
        },

        generateRandomId() {
            return '_' + Math.random().toString(36).substr(2, 9);
        },

        openColorPicker(type, index) {
            const refName = `${type}Color${index}`;
            if (this.$refs[refName] && this.$refs[refName][0]) {
                this.$refs[refName][0].click();
            }
        },

        openRiskColorPicker(index) {
            const refName = `riskColor${index}`;
            if (this.$refs[refName] && this.$refs[refName][0]) {
                this.$refs[refName][0].click();
            }
        },

        addRiskLevel() {
            this.riskLevels.push({
                name: '',
                from: '',
                color: '#22d3ee'
            });
        },

        removeRiskLevel(index) {
            if (this.riskLevels.length > 1) {
                this.riskLevels.splice(index, 1);
                // Clear errors for this index and re-validate
                delete this.riskLevelErrors[index];
                this.validateAllRiskLevels();
            }
        },

        validateRiskLevelFrom(index) {
            const level = this.riskLevels[index];
            const fromValue = parseInt(level.from);
            const maxValue = this.maxRiskValue;

            // Clear previous error
            delete this.riskLevelErrors[index];
            this.riskLevelErrors = { ...this.riskLevelErrors };

            // Check if empty
            if (!level.from || level.from === '') {
                this.riskLevelErrors = { ...this.riskLevelErrors, [index]: 'From value is required' };
                return false;
            }

            // Check if valid number
            if (isNaN(fromValue)) {
                this.riskLevelErrors = { ...this.riskLevelErrors, [index]: 'From must be a valid number' };
                return false;
            }

            // Check if within range
            if (fromValue < 1 || fromValue > maxValue) {
                this.riskLevelErrors = { ...this.riskLevelErrors, [index]: `From must be between 1 and ${maxValue}` };
                return false;
            }

            // Check for overlapping ranges
            const sortedLevels = this.riskLevels
                .map((lvl, idx) => ({ ...lvl, originalIndex: idx, from: parseInt(lvl.from) }))
                .filter(lvl => !isNaN(lvl.from))
                .sort((a, b) => a.from - b.from);

            for (let i = 0; i < sortedLevels.length - 1; i++) {
                const current = sortedLevels[i];
                const next = sortedLevels[i + 1];
                
                if (current.originalIndex === index || next.originalIndex === index) {
                    // Check if current level overlaps with next
                    if (current.from === next.from) {
                        this.riskLevelErrors = { ...this.riskLevelErrors, [index]: 'This value overlaps with another risk level' };
                        return false;
                    }
                }
            }

            return true;
        },

        validateAllRiskLevels() {
            let allValid = true;
            this.riskLevels.forEach((_, index) => {
                const isValid = this.validateRiskLevelFrom(index);
                if (!isValid) allValid = false;
            });
            return allValid;
        },

        validateRiskLevels() {
            if (this.riskLevels.length === 0) return false;

            // Check if all levels have name, from, and color
            const hasAllFields = this.riskLevels.every(level =>
                level.name && String(level.name).trim() !== '' &&
                level.from && String(level.from).trim() !== '' &&
                level.color && String(level.color).trim() !== ''
            );

            if (!hasAllFields) return false;

            // Validate all from values
            return this.validateAllRiskLevels();
        },

        getRiskLevelFromError(index) {
            return this.riskLevelErrors[index] || '';
        },

        validateAppetite() {
            const appetiteValue = parseInt(this.appetiteValue);
            const maxValue = this.maxRiskValue;

            this.appetiteError = '';

            if (!this.appetiteValue || this.appetiteValue === '') {
                this.appetiteError = 'Appetite value is required';
                return false;
            }

            if (isNaN(appetiteValue)) {
                this.appetiteError = 'Appetite must be a valid number';
                return false;
            }

            if (appetiteValue < 1 || appetiteValue > maxValue) {
                this.appetiteError = `Appetite must be between 1 and ${maxValue}`;
                return false;
            }

            return true;
        },

        validateTolerance() {
            const toleranceValue = parseInt(this.toleranceValue);
            const appetiteValue = parseInt(this.appetiteValue);
            const maxValue = this.maxRiskValue;

            this.toleranceError = '';

            if (!this.toleranceValue || this.toleranceValue === '') {
                this.toleranceError = 'Tolerance value is required';
                return false;
            }

            if (isNaN(toleranceValue)) {
                this.toleranceError = 'Tolerance must be a valid number';
                return false;
            }

            if (toleranceValue < 1 || toleranceValue > maxValue) {
                this.toleranceError = `Tolerance must be between 1 and ${maxValue}`;
                return false;
            }

            if (!isNaN(appetiteValue) && toleranceValue < appetiteValue) {
                this.toleranceError = 'Tolerance must be greater than or equal to Appetite';
                return false;
            }

            return true;
        },

        validateAppetiteTolerance() {
            const isAppetiteValid = this.validateAppetite();
            const isToleranceValid = this.validateTolerance();
            return isAppetiteValid && isToleranceValid;
        },

        getAppetiteError() {
            return this.appetiteError || '';
        },

        getToleranceError() {
            return this.toleranceError || '';
        },

        async fetchRiskLevels() {
            this.loadingRiskLevels = true;
            try {
                console.log('🔄 Fetching Risk Levels...');
                const response = await this.riskLevelApi.getAll();

                console.log('📥 Risk Levels API Response:', response);

                if (response && Array.isArray(response) && response.length > 0) {
                    this.riskLevels = response.map(level => ({
                        id: level.id || null,
                        name: level.name || '',
                        from: level.from || '',
                        color: level.color || '#6366f1'
                    }));
                    console.log('✅ Risk Levels loaded:', this.riskLevels);
                } else {
                    // Set default risk levels if none exist
                    this.riskLevels = [
                        { name: 'Low', from: '1', color: '#6366f1' },
                        { name: 'Medium', from: '10', color: '#eab308' },
                        { name: 'High', from: '15', color: '#f97316' },
                        { name: 'Very High', from: '25', color: '#ef4444' }
                    ];
                    console.log('⚠️ No risk levels found, using defaults');
                }
            } catch (error) {
                console.error('❌ Error fetching risk levels:', error);
                // Set default risk levels on error
                this.riskLevels = [
                    { name: 'Low', from: '1', color: '#6366f1' },
                    { name: 'Medium', from: '10', color: '#eab308' },
                    { name: 'High', from: '15', color: '#f97316' },
                    { name: 'Very High', from: '25', color: '#ef4444' }
                ];
            } finally {
                this.loadingRiskLevels = false;
            }
        },

        async fetchAppetiteTolerance() {
            this.loadingAppetiteTolerance = true;
            try {
                console.log('🔄 Fetching Appetite & Tolerance...');
                const response = await this.systemSettingApi.getAll({
                    filter: "type|appetitetolerance|="
                });

                console.log('📥 Appetite & Tolerance API Response:', response);

                if (response && Array.isArray(response) && response.length > 0) {
                    // If the response is a single object with both values
                    if (response.length) {
                        const data = response[0] || {};
                        console.log('✅ Appetite & Tolerance loaded from single object:', data);
                        this.appetiteValue = data.appetite || 5;
                        this.toleranceValue = data.tolerance || 6;
                        this.appetiteToleranceId = data.id || null;
                    }
                } else {
                    // Set default values if none exist
                    this.appetiteValue = 5;
                    this.toleranceValue = 6;
                }
            } catch (error) {
                console.error('❌ Error fetching appetite & tolerance:', error);
                // Set default values on error
                this.appetiteValue = 5;
                this.toleranceValue = 6;
            } finally {
                this.loadingAppetiteTolerance = false;
            }
        },

        async saveAllConfiguration() {
            this.savingAll = true;

            try {
                // Save matrix config with tab info
                const matrixConfigWithTab = {
                    ...this.matrixConfig,
                    tab: 'step1',
                    stepNumber: 1,
                    stepName: 'Matrix Dimensions'
                };
                localStorage.setItem('matrixConfig', JSON.stringify(matrixConfigWithTab));

                const impactId = this.impacts?.[0]?.id ?? null;
                const impactPayload = {
                    type: 'impacts',
                    id: impactId,
                    tab: 'step1',
                    stepNumber: 1,
                    stepName: 'Matrix Dimensions',
                    data: this.impactConfig.levels,
                    params: this.impactParameters
                        .filter(param => param.name && param.name.trim() !== '')
                        .map(param => ({
                            id: param.id || this.generateRandomId(),
                            name: param.name.trim(),
                            levels: param.levels
                                .filter(level => level.levelNumber && level.levelName && level.color && level.description)
                                .map(level => ({
                                    levelNumber: parseInt(level.levelNumber, 10),
                                    color: level.color.trim(),
                                    levelName: level.levelName.trim(),
                                    description: level.description.trim()
                                }))
                        }))
                };

                const likelihoodId = this.likelihoods?.[0]?.id ?? null;
                const likelihoodPayload = {
                    type: 'likelihoods',
                    id: likelihoodId,
                    tab: 'step1',
                    stepNumber: 1,
                    stepName: 'Matrix Dimensions',
                    data: this.likelihoodConfig.levels,
                    params: this.likelihoodParameters
                        .filter(param => param.name && param.name.trim() !== '')
                        .map(param => ({
                            id: param.id || this.generateRandomId(),
                            name: param.name.trim(),
                            levels: param.levels
                                .filter(level => level.levelNumber && level.levelName && level.color && level.description)
                                .map(level => ({
                                    levelNumber: parseInt(level.levelNumber, 10),
                                    color: level.color.trim(),
                                    levelName: level.levelName.trim(),
                                    description: level.description.trim()
                                }))
                        }))
                };

                // Risk levels payload with tab info - FIX: Convert to string before trim
                const riskLevelsPayload = {
                    tab: 'step2',
                    stepNumber: 2,
                    stepName: 'Risk Levels',
                    data: this.riskLevels.filter(level =>
                        level.name && String(level.name).trim() !== '' &&
                        level.from && String(level.from).trim() !== '' &&
                        level.color && String(level.color).trim() !== ''
                    ).map(level => ({
                        id: level.id || null,
                        name: String(level.name).trim(),
                        from: String(level.from).trim(),
                        color: String(level.color).trim()
                    }))
                };

                // Appetite & Tolerance payload with tab info
                const appetiteTolerancePayload = {
                    id: this.appetiteToleranceId,
                    tab: 'step3',
                    stepNumber: 3,
                    stepName: 'Appetite & Tolerance',
                    type: 'appetitetolerance',
                    data: {
                        appetite: parseInt(this.appetiteValue) || 5,
                        tolerance: parseInt(this.toleranceValue) || 6
                    }
                };

                // Complete configuration object
                const completeConfiguration = {
                    impact: impactPayload,
                    likelihood: likelihoodPayload,
                    riskLevels: riskLevelsPayload,
                    appetiteTolerance: appetiteTolerancePayload,
                    submittedAt: new Date().toISOString(),
                    matrixSize: this.matrixConfig.levels
                };
                const success = await this.$emit('save-configuration', completeConfiguration);

                if (success !== false) {
                    console.log('✅ Configuration saved successfully!');
                    this.closeConfigModal();
                    this.$emit('refresh-data');
                } else {
                    console.log('❌ Configuration save failed!');
                }
            } catch (error) {
                console.error("❌ Error in saveAllConfiguration:", error);
            } finally {
                this.savingAll = false;
            }
        }
    }
};
</script>

<style scoped>
/* Modal */
.modern-modal {
    border-radius: 24px !important;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2) !important;
}

.modal-header {
    background: #F0F0F0;
    padding: 8px 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
}

.header-title {
    font-size: 26px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: -0.5px;
}

.close-btn {
    background: transparent !important;
    color: #666 !important;
}

.close-btn:hover {
    background: #f5f5f5 !important;
}

/* Step Indicator */
.step-indicator {
    display: flex;
    align-items: center;
    padding: 24px 36px;
    background: white;
    border-bottom: 1px solid #e8e8e8;
}

.step-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.step-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e0e0e0;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s ease;
}

.step-item.active .step-number {
    background: #1a1a1a;
    color: white;
}

.step-label {
    font-size: 14px;
    color: #999;
    font-weight: 500;
    transition: all 0.3s ease;
}

.step-item.active .step-label {
    color: #1a1a1a;
    font-weight: 600;
}

.step-divider {
    flex: 1;
    height: 1px;
    background: #e0e0e0;
    margin: 0 20px;
    min-width: 40px;
}

/* Modal Body */
.modal-body {
    background: #fafafa;
    /* padding: 36px !important; */
    min-height: 450px;
    max-height: calc(100vh - 300px);
}

.step-content {
    animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Unified Matrix Card */
.unified-matrix-card {
    background: #F0F0F0 !important;
    border-radius: 16px !important;
    padding: 24px !important;
    border: none !important;
}

.matrix-size-section {
    padding-right: 12px;
}

.matrix-preview-section {
    padding-left: 12px;
}

/* Section Blocks */
.section-block {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
}

.matrix-size-card {
    height: 100%;
}

.matrix-preview-card {
    height: 100%;
}

.config-section {
    width: 100%;
    margin-bottom: 24px;
}

.matrix-section {
    background: white;
    border-radius: 16px;
    padding: 0;
    box-shadow: none;
    border: none;
}

.section-title-wrapper {
    margin-bottom: 16px;
}

.section-desc {
    font-size: 12px;
    color: #999;
    margin: 4px 0 0 0;
    font-weight: 400;
}

.section-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 6px 0;
    letter-spacing: -0.3px;
}

.section-subtitle {
    font-size: 12px;
    color: #999;
    margin: 0 0 16px 0;
    font-weight: 400;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    /* border-bottom: 1px solid #8C8C8C; */
}

/* Matrix Preview */
.preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background: #f8f8f8;
    border-radius: 12px;
    border: 1px solid #eeeeee;
}

.matrix-grid {
    display: grid;
    gap: 3px;
    width: 100%;
    max-width: 280px;
    aspect-ratio: 1;
}

.matrix-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    font-size: 11px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    animation: cellFadeIn 0.3s ease-out forwards;
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.2s ease;
    cursor: pointer;
}

.matrix-cell:hover {
    transform: scale(0.97);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cell-number {
    pointer-events: none;
}

.high-risk {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.medium-risk {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.low-risk {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

@keyframes cellFadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Levels Section */
.levels-section {
    min-height: 420px;
    background: #F0F0F0;
}

.levels-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.level-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    padding: 10px;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.level-row:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

.level-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.level-field {
    flex: 1;
}

.level-field>>>.v-input__control {
    min-height: 44px !important;
}

.level-field>>>fieldset {
    border-color: #e8e8e8 !important;
    border-radius: 10px !important;
}

.level-field>>>input {
    color: #1a1a1a !important;
    font-size: 14px;
    font-weight: 500;
}

.level-field>>>input::placeholder {
    color: #bbb !important;
}

.color-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border: 2px solid white;
}

.color-circle:hover {
    transform: scale(1.15);
}

.hidden-color-picker {
    display: none;
}

/* Placeholder */
.placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
}

.placeholder-content h3 {
    margin-top: 20px;
    font-size: 20px;
    font-weight: 600;
    color: #424242;
}

.placeholder-content p {
    margin-top: 8px;
    font-size: 14px;
    color: #757575;
}

/* Footer */
.modal-footer {
    padding: 20px 36px !important;
    background: white;
    border-top: 1px solid #e8e8e8;
}

.cancel-btn {
    text-transform: none !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    color: #666 !important;
    padding: 0 24px !important;
    height: 44px !important;
    border-radius: 10px !important;
}

.cancel-btn:hover {
    background: #f5f5f5 !important;
}

.back-btn {
    text-transform: none !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    color: #6E3894 !important;
    padding: 0 24px !important;
    height: 44px !important;
    border-radius: 10px !important;
    border: 1px solid #6E3894 !important;
    background: white !important;
}

.next-btn {
    text-transform: none !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    padding: 0 32px !important;
    height: 44px !important;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3) !important;
    background: #6E3894 !important;
    letter-spacing: 0.3px;
}

/* Dimension Card */
.dimension-card-inner {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #f0f0f0;
}

.dimension-content {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-direction: column;
}

.dimension-controls {
    flex: 1;
    width: 100%;
}

.control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.control-label {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0;
    display: flex;
    align-items: center;
}

.slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    position: relative;
    padding-bottom: 24px;
}

.control-btn {
    color: #7c3aed !important;
}

.control-btn:hover {
    background: #f5f3ff !important;
}

.level-slider {
    flex: 1;
    margin: 0 !important;
}

.level-slider>>>.v-slider__thumb {
    background: #7c3aed !important;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
}

.level-slider>>>.v-slider__track-fill {
    background: #7c3aed !important;
}

.level-slider>>>.v-slider__track-background {
    background: #e8e8e8 !important;
}

/* Disable slider mouse interaction */
.disabled-slider {
    pointer-events: none !important;
}

.disabled-slider>>>.v-slider__thumb-container {
    cursor: default !important;
}

.disabled-slider>>>.v-slider__track-container {
    cursor: default !important;
}

.slider-value {
    font-weight: 700;
    font-size: 11px;
}

.level-chip {
    background: #f5f3ff !important;
    color: #7c3aed !important;
    font-weight: 600 !important;
    padding: 6px 16px !important;
    height: 32px !important;
    border-radius: 10px !important;
}

.dimension-visual {
    width: 100%;
    display: flex;
    justify-content: center;
}

.grid-preview {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
    padding: 16px;
    background: #f8f8f8;
    border-radius: 12px;
    border: 1px solid #eeeeee;
    max-width: 160px;
    width: 100%;
}

.grid-cell {
    aspect-ratio: 1;
    background: #6E3894 !important;
    border-radius: 6px;
    animation: gridFadeIn 0.5s ease-out forwards;
    opacity: 0;
    transform: scale(0.85);
    box-shadow: 0 2px 6px rgba(124, 58, 237, 0.2);
}

@keyframes gridFadeIn {
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Risk Levels Step 2 Styles */
.risk-levels-container {
    background: #F0F0F0;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.risk-levels-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e8e8e8;
}

.risk-levels-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 6px 0;
    letter-spacing: -0.3px;
}

.risk-levels-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
    font-weight: 400;
}

.add-level-btn {
    text-transform: none !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    border-radius: 8px !important;
    padding: 0 20px !important;
    height: 38px !important;
    box-shadow: 0 2px 8px rgba(110, 56, 148, 0.2) !important;
    letter-spacing: 0.2px;
}

.add-level-btn:hover {
    box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3) !important;
}

.risk-levels-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.risk-level-item {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    transition: all 0.2s ease;
}

.risk-level-item:hover {
    border-color: #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.risk-level-fields {
    display: grid;
    grid-template-columns: 1fr 1fr 120px 40px;
    gap: 16px;
    align-items: end;
}

.risk-field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.risk-field-label {
    font-size: 13px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.risk-input>>>.v-input__control {
    min-height: 44px !important;
}

.risk-input>>>fieldset {
    border-color: #e0e0e0 !important;
    border-radius: 8px !important;
    border-width: 1.5px !important;
}

.risk-input>>>input {
    color: #1a1a1a !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    padding: 12px 14px !important;
}

.risk-input>>>input::placeholder {
    color: #bbb !important;
    font-weight: 400 !important;
}

.risk-input>>>.v-input__slot {
    background: white !important;
}

.color-picker-wrapper {
    height: 44px;
    background: white;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    padding: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.color-picker-wrapper:hover {
    border-color: #6E3894;
    box-shadow: 0 2px 8px rgba(110, 56, 148, 0.15);
}

.color-display {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    transition: transform 0.2s ease;
}

.color-picker-wrapper:hover .color-display {
    transform: scale(0.95);
}

.delete-level-btn {
    margin-bottom: 28px !important;
    transition: all 0.2s ease;
}

.delete-level-btn:hover {
    background: #fee !important;
}

.delete-level-btn:hover .v-icon {
    color: #ef4444 !important;
}

/* Responsive */
@media (max-width: 960px) {
    .modal-body {
        padding: 24px !important;
    }

    .step-indicator {
        padding: 20px 24px;
    }

    .step-label {
        display: none;
    }

    .modal-footer {
        padding: 16px 24px !important;
    }

    .dimension-content {
        flex-direction: column;
        gap: 20px;
    }

    .dimension-visual {
        flex: 0 0 auto;
    }

    .matrix-preview-section {
        border-left: none;
        border-top: 1px solid #e0e0e0;
        padding-left: 0;
        padding-top: 20px;
        margin-top: 20px;
    }

    .matrix-size-section {
        padding-right: 0;
    }

    .risk-level-fields {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .delete-level-btn {
        grid-column: 1;
        justify-self: start;
        margin-top: 8px;
    }

    .risk-levels-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .add-level-btn {
        width: 100%;
    }
}

@media (max-width: 600px) {
    .modal-header {
        padding: 20px 16px;
    }

    .header-title {
        font-size: 22px;
    }

    .section-block {
        padding: 16px;
    }

    .matrix-grid {
        max-width: 250px;
    }

    .matrix-cell {
        font-size: 10px;
    }
}

/* Compact Styles */
.compact-row {
    margin-bottom: 8px !important;
}

.compact-card {
    padding: 20px !important;
    margin-bottom: 0 !important;
    background: #F0F0F0;
}

.compact-header {
    margin-bottom: 16px !important;
}

.compact-title-wrapper {
    margin-bottom: 0 !important;
}

.compact-title {
    font-size: 15px !important;
    margin: 0 0 4px 0 !important;
    font-weight: 900 !important;
}

.compact-desc {
    font-size: 12px !important;
    margin: 0 !important;
    line-height: 1.5;
    color: #999 !important;
}

.compact-inner {
    padding: 20px !important;
    margin: 0 !important;
    background: white !important;
}

.compact-content {
    gap: 0 !important;
    flex-direction: column;
}

.compact-controls {
    width: 100%;
}

.compact-label {
    font-size: 13px !important;
    margin-bottom: 16px !important;
    font-weight: 600 !important;
}

.compact-slider {
    gap: 12px !important;
    margin-bottom: 16px !important;
    align-items: center;
}

.compact-btn {
    width: 36px !important;
    height: 36px !important;
}

.compact-slider-component {
    margin: 0 !important;
}

.compact-slider-component>>>.v-slider {
    margin: 0 !important;
}

.compact-chip {
    height: 32px !important;
    font-size: 13px !important;
    padding: 6px 16px !important;
    font-weight: 600 !important;
}

.compact-visual {
    margin-top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.compact-grid {
    padding: 16px !important;
    max-width: 160px !important;
    width: 160px !important;
    gap: 4px !important;
    background: #fafafa !important;
}

.compact-grid .grid-cell {
    border-radius: 6px !important;
    min-height: 20px !important;
    width: 100% !important;
}

/* Override grid preview for compact */
.matrix-preview-card .grid-preview {
    grid-template-columns: repeat(5, 1fr) !important;
    aspect-ratio: 1 !important;
}

/* Make cards same height */
.matrix-size-card,
.matrix-preview-card {
    display: flex;
    flex-direction: column;
}

.matrix-preview-card .compact-visual {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 0;
}

/* Slider labels */
.slider-container {
    position: relative;
}

.slider-container::before {
    content: '1×1';
    position: absolute;
    left: 0;
    bottom: -20px;
    font-size: 11px;
    color: #999;
}

.slider-container::after {
    content: '10×10';
    position: absolute;
    right: 0;
    bottom: -20px;
    font-size: 11px;
    color: #999;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
    width: 8px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f5f5f5;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

/* Appetite & Tolerance Step 3 Styles */
.appetite-tolerance-container {
    background: #F0F0F0;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    /* max-width: 800px; */
    margin: 0 auto;
}

.appetite-tolerance-header {
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e8e8e8;
}

.appetite-tolerance-title {
    font-size: 20px;
    font-weight: 900;
    color: #1a1a1a;
    margin: 0 0 6px 0;
    letter-spacing: -0.3px;
}

.appetite-tolerance-subtitle {
    font-size: 13px;
    color: #999;
    margin: 0;
    font-weight: 400;
}

.appetite-tolerance-fields {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #f0f0f0;
    transition: all 0.2s ease;
}

.appetite-field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.appetite-field-label {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.appetite-input>>>.v-input__control {
    min-height: 44px !important;
}

.appetite-input>>>fieldset {
    border-color: #e0e0e0 !important;
    border-radius: 8px !important;
    border-width: 1.5px !important;
}

.appetite-input>>>input {
    color: #1a1a1a !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    padding: 12px 14px !important;
}

.appetite-input>>>input::placeholder {
    color: #bbb !important;
    font-weight: 400 !important;
}

.appetite-input>>>.v-input__slot {
    background: #fafafa !important;
}
/* Readonly state styles */
.readonly-container {
    opacity: 0.7;
    pointer-events: none;
    background: #f5f5f5 !important;
}

.readonly-notice {
    color: #ff9800;
    font-weight: 600;
    font-size: 11px;
    display: inline-block;
    margin-left: 8px;
}

.readonly-message {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #fff3e0;
    border-left: 3px solid #ff9800;
    border-radius: 8px;
    margin-top: 16px;
    font-size: 12px;
    color: #e65100;
    line-height: 1.5;
}

.readonly-message .v-icon {
    flex-shrink: 0;
}

/* Disabled button styles */
.control-btn:disabled {
    opacity: 0.4 !important;
    cursor: not-allowed !important;
}

.control-btn:disabled .v-icon {
    color: #999 !important;
}

/* Disabled slider styles */
.level-slider.v-slider--disabled {
    opacity: 0.5;
}

.level-slider.v-slider--disabled >>> .v-slider__thumb {
    background: #ccc !important;
}

.level-slider.v-slider--disabled >>> .v-slider__track-fill {
    background: #ccc !important;
}

/* Responsive for Appetite & Tolerance */
@media (max-width: 600px) {
    .appetite-tolerance-fields {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .appetite-tolerance-container {
        padding: 24px;
    }
}
</style>