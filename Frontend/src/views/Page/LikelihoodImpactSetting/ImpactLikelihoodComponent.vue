<template>
    <div class="factors-container">
        <!-- Impact Factors Section -->
        <div class="factor-section">
            <div class="factor-header rtl" @click="toggleImpactSection">
                <div class="factor-header-left rtl">
                    <v-icon :class="['expand-icon', { expanded: impactExpanded }]">
                        mdi-chevron-right
                    </v-icon>
                    <h2 class="factor-title">
                        Impact Factors ({{ impacts.length > 0 && impacts[0]?.params ? impacts[0].params.length : 0 }})
                    </h2>
                </div>
                <v-btn color="primary" class="add-factor-btn" @click.stop="openFactorModal('impact')">
                    <v-icon left small>mdi-plus</v-icon>
                    Add Impact
                </v-btn>
            </div>

            <!-- Impact Parameters Grid -->
            <transition name="slide-fade">
                <div v-if="impactExpanded" class="factors-grid">
                    <div v-if="impactParams.length > 0" class="grid-container">
                        <div v-for="(param, index) in impactParams" :key="param.id" class="factor-card">
                            <!-- Card Header -->
                            <div class="factor-card-header">
                                <div class="factor-card-title-section">
                                    <h3 class="factor-card-title">{{ param.name }}</h3>
                                    <p class="factor-card-subtitle">
                                        {{ param.levels.length }} Levels • {{ param.levels.filter(l => l.levelName && l.description).length }} Completed
                                    </p>
                                </div>
                                <div class="action-menu-wrapper">
                                    <button class="custom-menu-btn" @click="toggleMenu('impact', param.id)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="2"/>
                                            <circle cx="12" cy="12" r="2"/>
                                            <circle cx="12" cy="19" r="2"/>
                                        </svg>
                                    </button>
                                    <div v-if="activeMenu === `impact-${param.id}`" class="custom-dropdown-menu" v-click-outside="closeMenu">
                                        <div class="custom-menu-item" @click="editParameter(param, 'impact')">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                            </svg>
                                            <span>Edit</span>
                                        </div>
                                        <div class="custom-menu-item delete-item" @click="handleDelete(param.id)">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                <line x1="10" y1="11" x2="10" y2="17"/>
                                                <line x1="14" y1="11" x2="14" y2="17"/>
                                            </svg>
                                            <span>Delete</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Content - Levels List -->
                            <div class="factor-card-content">
                                <div v-for="(level, idx) in param.levels" :key="idx" class="level-item">
                                    <div class="level-number-badge" :style="{ backgroundColor: level.color }">
                                        {{ level.levelNumber }}
                                    </div>
                                    <div class="level-info">
                                        <div class="level-name">{{ level.levelName || 'N/A' }}</div>
                                        <div class="level-description">{{ level.description || 'No description' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State for Impact -->
                    <div v-else class="empty-factors">
                        <v-icon size="48" color="grey lighten-1">mdi-folder-open-outline</v-icon>
                        <p class="empty-text">No impact factors configured yet</p>
                    </div>
                </div>
            </transition>
        </div>

        <!-- Likelihood Factors Section -->
        <div class="factor-section">
            <div class="factor-header rtl" @click="toggleLikelihoodSection">
                <div class="factor-header-left rtl">
                    <v-icon :class="['expand-icon', { expanded: likelihoodExpanded }]">
                        mdi-chevron-right
                    </v-icon>
                    <h2 class="factor-title">
                        Likelihood Factors ({{ likelihoods.length > 0 && likelihoods[0]?.params ? likelihoods[0].params.length : 0 }})
                    </h2>
                </div>
                <v-btn color="primary" class="add-factor-btn" @click.stop="openFactorModal('likelihood')">
                    <v-icon left small>mdi-plus</v-icon>
                    Add Likelihood
                </v-btn>
            </div>

            <!-- Likelihood Parameters Grid -->
            <transition name="slide-fade">
                <div v-if="likelihoodExpanded" class="factors-grid">
                    <div v-if="likelihoodParams.length > 0" class="grid-container">
                        <div v-for="(param, index) in likelihoodParams" :key="param.id" class="factor-card">
                            <!-- Card Header -->
                            <div class="factor-card-header ">
                                <div class="factor-card-title-section">
                                    <h3 class="factor-card-title">{{ param.name }}</h3>
                                    <p class="factor-card-subtitle">
                                        {{ param.levels.length }} Levels • {{ param.levels.filter(l => l.levelName && l.description).length }} Completed
                                    </p>
                                </div>
                                <div class="action-menu-wrapper">
                                    <button class="custom-menu-btn" @click="toggleMenu('likelihood', param.id)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="5" r="2"/>
                                            <circle cx="12" cy="12" r="2"/>
                                            <circle cx="12" cy="19" r="2"/>
                                        </svg>
                                    </button>
                                    <div v-if="activeMenu === `likelihood-${param.id}`" class="custom-dropdown-menu" v-click-outside="closeMenu">
                                        <div class="custom-menu-item" @click="editParameter(param, 'likelihood')">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                            </svg>
                                            <span>Edit</span>
                                        </div>
                                        <div class="custom-menu-item delete-item" @click="handleDelete(param.id)">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                <line x1="10" y1="11" x2="10" y2="17"/>
                                                <line x1="14" y1="11" x2="14" y2="17"/>
                                            </svg>
                                            <span>Delete</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Content - Levels List -->
                            <div class="factor-card-content">
                                <div v-for="(level, idx) in param.levels" :key="idx" class="level-item">
                                    <div class="level-number-badge" :style="{ backgroundColor: level.color }">
                                        {{ level.levelNumber }}
                                    </div>
                                    <div class="level-info">
                                        <div class="level-name">{{ level.levelName || 'N/A' }}</div>
                                        <div class="level-description">{{ level.description || 'No description' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State for Likelihood -->
                    <div v-else class="empty-factors">
                        <v-icon size="48" color="grey lighten-1">mdi-folder-open-outline</v-icon>
                        <p class="empty-text">No likelihood factors configured yet</p>
                    </div>
                </div>
            </transition>
        </div>

        <!-- Factor Modal -->
        <v-dialog v-model="showFactorModal" max-width="800px" persistent scrollable>
            <v-card class="factor-modal">
                <!-- Header -->
                <div class="modal-header">
                    <h2 class="header-title">
                        {{ isEditMode ? 'Edit Factor' : 'New Factor' }}
                    </h2>
                    <v-btn icon @click="closeFactorModal" class="close-btn">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>

                <v-card-text class="modal-body">
                    <!-- Factor Name -->
                    <div class="form-section">
                        <label class="form-label">Factor Name</label>
                        <input
                            v-model="factorName"
                            type="text"
                            placeholder="Enter Factor Name"
                            @input="validateFactorName"
                            class="factor-input-field" />
                        <div v-if="factorNameError" class="error-message">{{ factorNameError }}</div>
                    </div>

                    <!-- Factor Score (Levels) -->
                    <div class="form-section">
                        <label class="form-label">Factor Score</label>

                        <div class="levels-container">
                            <div 
                                v-for="(level, index) in factorLevels" 
                                :key="index" 
                                class="level-row">
                                <!-- Level Number Badge -->
                                <div 
                                    class="level-number-badge-modal" 
                                    :style="{ backgroundColor: level.color }">
                                    {{ level.levelNumber }}
                                </div>

                                <!-- Level Name Input -->
                                <input
                                    v-model="level.levelName"
                                    type="text"
                                    placeholder="Level Name"
                                    class="level-input-field" />

                                <!-- Description Input -->
                                <input
                                    v-model="level.description"
                                    type="text"
                                    placeholder="Description"
                                    class="description-input-field" />
                            </div>
                        </div>
                    </div>
                </v-card-text>

                <!-- Footer -->
                <v-card-actions class="modal-footer">
                    <v-spacer></v-spacer>
                    <v-btn text large @click="closeFactorModal" class="cancel-btn">
                        Cancel
                    </v-btn>
                    <v-btn 
                        large 
                        :loading="saving" 
                        :disabled="!canSave"
                        @click="saveFactor" 
                        class="save-btn">
                        {{ isEditMode ? 'Save' : 'Save' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'ImpactLikelihoodComponent',
    
    directives: {
        'click-outside': {
            bind(el, binding) {
                el.clickOutsideEvent = function(event) {
                    if (!(el === event.target || el.contains(event.target))) {
                        binding.value(event);
                    }
                };
                document.body.addEventListener('click', el.clickOutsideEvent);
            },
            unbind(el) {
                document.body.removeEventListener('click', el.clickOutsideEvent);
            }
        }
    },
    
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
            impactExpanded: true,
            likelihoodExpanded: false,
            
            // Factor Modal Data
            showFactorModal: false,
            factorType: 'impact',
            factorName: '',
            factorNameError: '',
            factorLevels: [],
            saving: false,
            isEditMode: false,
            editingFactorId: null,
            
            // Dropdown Menu
            activeMenu: null
        };
    },

    computed: {
        impactParams() {
            if (Array.isArray(this.impacts) && this.impacts.length > 0) {
                return this.impacts[0].params || [];
            }
            return [];
        },
        likelihoodParams() {
            if (Array.isArray(this.likelihoods) && this.likelihoods.length > 0) {
                return this.likelihoods[0].params || [];
            }
            return [];
        },
        canSave() {
            return this.factorName.trim() !== '' && 
                   this.factorLevels.some(level => 
                       level.levelName.trim() !== '' || level.description.trim() !== ''
                   );
        }
    },

    methods: {
        toggleImpactSection() {
            this.impactExpanded = !this.impactExpanded;
        },
        toggleLikelihoodSection() {
            this.likelihoodExpanded = !this.likelihoodExpanded;
        },

        // Dropdown Menu Methods
        toggleMenu(type, paramId) {
            const menuKey = `${type}-${paramId}`;
            this.activeMenu = this.activeMenu === menuKey ? null : menuKey;
        },
        closeMenu() {
            this.activeMenu = null;
        },

        // Factor Modal Methods
        openFactorModal(type, editData = null) {
            console.log('🔵 Opening Factor Modal:', { type, editData, isEdit: !!editData });
            
            this.factorType = type;
            this.isEditMode = !!editData;
            
            // Load levels based on type
            const configData = type === 'impact' ? this.impacts : this.likelihoods;
            
            if (configData && configData.length > 0 && configData[0].data) {
                this.factorLevels = configData[0].data.map(level => ({
                    levelNumber: level.value,
                    color: level.color,
                    levelName: '',
                    description: ''
                }));
            } else {
                // Fallback: create 5 default levels
                this.factorLevels = Array.from({ length: 5 }, (_, i) => ({
                    levelNumber: i + 1,
                    color: this.generateColor(i),
                    levelName: '',
                    description: ''
                }));
            }

            // If editing, populate with existing data
            if (editData) {
                this.factorName = editData.name || '';
                this.editingFactorId = editData.id;
                
                console.log('✏️ Editing Factor:', {
                    id: editData.id,
                    name: editData.name,
                    levelsCount: editData.levels?.length
                });
                
                // Map existing levels to the factor levels
                if (editData.levels && Array.isArray(editData.levels)) {
                    editData.levels.forEach(existingLevel => {
                        const matchingLevel = this.factorLevels.find(
                            fl => fl.levelNumber === existingLevel.levelNumber
                        );
                        if (matchingLevel) {
                            matchingLevel.levelName = existingLevel.levelName || '';
                            matchingLevel.description = existingLevel.description || '';
                            
                            console.log(`✅ Mapped Level ${existingLevel.levelNumber}:`, {
                                name: existingLevel.levelName,
                                description: existingLevel.description
                            });
                        }
                    });
                }
            } else {
                this.factorName = '';
                this.editingFactorId = null;
                console.log('➕ Creating New Factor');
            }

            this.factorNameError = '';
            this.showFactorModal = true;
        },

        closeFactorModal() {
            console.log('❌ Closing Factor Modal');
            this.showFactorModal = false;
            this.factorName = '';
            this.factorNameError = '';
            this.factorLevels = [];
            this.isEditMode = false;
            this.editingFactorId = null;
        },

        editParameter(param, type) {
            console.log('🖊️ Edit Parameter Clicked:', { param, type });
            this.closeMenu(); // Close the dropdown
            this.openFactorModal(type, param);
        },

        handleDelete(paramId) {
            console.log('🗑️ Delete Parameter Clicked:', paramId);
            this.closeMenu(); // Close the dropdown
            this.$emit('delete-parameter', paramId);
        },

        validateFactorName() {
            if (!this.factorName.trim()) {
                this.factorNameError = 'Factor name is required';
            } else {
                this.factorNameError = '';
            }
        },

        generateColor(index) {
            const colors = ['#6366f1', '#22d3ee', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'];
            return colors[index % colors.length];
        },

        generateRandomId() {
            return '_' + Math.random().toString(36).substr(2, 9);
        },

        async saveFactor() {
            console.log('💾 Save Factor Triggered');
            
            // Validate factor name
            if (!this.factorName.trim()) {
                this.factorNameError = 'Factor name is required';
                console.log('❌ Validation Failed: Factor name is empty');
                return;
            }

            this.saving = true;

            try {
                // Filter out empty levels and ensure no null values
                const validLevels = this.factorLevels
                    .filter(level => level && (level.levelName.trim() !== '' || level.description.trim() !== ''))
                    .map(level => ({
                        levelNumber: level.levelNumber,
                        color: level.color,
                        levelName: level.levelName.trim(),
                        description: level.description.trim()
                    }));

                console.log('📊 Valid Levels:', validLevels.length);

                const factorData = {
                    id: this.editingFactorId || this.generateRandomId(),
                    name: this.factorName.trim(),
                    levels: validLevels
                };

                console.log('📦 Factor Data to Save:', {
                    id: factorData.id,
                    name: factorData.name,
                    levelsCount: factorData.levels.length,
                    isEdit: this.isEditMode,
                    type: this.factorType
                });

                // Emit event to parent with factor data
                this.$emit('save-factor', {
                    type: this.factorType,
                    data: factorData,
                    isEdit: this.isEditMode
                });

                console.log('✅ save-factor event emitted successfully');
                
                // Close modal after short delay to allow parent to process
                setTimeout(() => {
                    this.closeFactorModal();
                }, 300);
                
            } catch (error) {
                console.error('❌ Error saving factor:', error);
            } finally {
                this.saving = false;
            }
        }
    }
};
</script>

<style scoped>
.factors-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Factor Section */
.factor-section {
    background: #f5f5f5;
    border-radius: 12px;
    overflow: hidden;
}

.factor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    background: #e8e8e8;
}

.factor-header:hover {
    background: #dedede;
}

.factor-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.expand-icon {
    transition: transform 0.3s ease;
    color: #424242;
    font-size: 24px;
}

.expand-icon.expanded {
    transform: rotate(90deg);
}

.factor-title {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
}

.add-factor-btn {
    background-color: #6f2dbd !important;
    color: white !important;
    text-transform: none;
    font-weight: 600;
    border-radius: 8px;
    padding: 0 16px !important;
    height: 32px !important;
}

/* Factors Grid */
.factors-grid{
    padding: 20px;
    background: white !important;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
}

/* Factor Card */
.factor-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
}

.factor-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.factor-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
        background: #F0F0F0;
    border-bottom: 1px solid #f0f0f0;
}

.factor-card-title-section {
    flex: 1;
}

.factor-card-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 4px 0;
}

.factor-card-subtitle {
    font-size: 12px;
    color: #9e9e9e;
    margin: 0;
}

.menu-btn {
    margin-top: -4px;
}

/* Custom Menu Button */
.custom-menu-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #666;
    transition: all 0.2s ease;
    padding: 0;
    margin: 0;
    outline: none;
}

.custom-menu-btn:hover {
    background: #f5f5f5;
    color: #1a1a1a;
}

.custom-menu-btn:active {
    background: #e8e8e8;
    transform: scale(0.95);
}

/* Custom Dropdown Menu */
.action-menu-wrapper {
    position: relative;
}

.custom-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: white;
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
    min-width: 160px;
    z-index: 1000;
    overflow: hidden;
    animation: dropdownSlide 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.08);
}

@keyframes dropdownSlide {
    from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.custom-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
}

.custom-menu-item:hover {
    background: #f8f8f8;
}

.custom-menu-item:active {
    background: #f0f0f0;
}

.custom-menu-item svg {
    flex-shrink: 0;
    color: #666;
    transition: color 0.2s ease;
}

.custom-menu-item:hover svg {
    color: #1a1a1a;
}

.custom-menu-item.delete-item {
    color: #d32f2f;
    border-top: 1px solid #f0f0f0;
}

.custom-menu-item.delete-item svg {
    color: #d32f2f;
}

.custom-menu-item.delete-item:hover {
    background: #ffebee;
    color: #c62828;
}

.custom-menu-item.delete-item:hover svg {
    color: #c62828;
}

/* Factor Card Content - Levels */
.factor-card-content {
    padding: 12px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.level-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px;
    background: #fafafa;
    border-radius: 8px;
    transition: background 0.2s ease;
}

.level-item:hover {
    background: #f0f0f0;
}

.level-number-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.level-info {
    flex: 1;
    min-width: 0;
}

.level-name {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 2px;
}

.level-description {
    font-size: 12px;
    color: #757575;
    line-height: 1.4;
}

/* Empty State */
.empty-factors {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.empty-text {
    font-size: 14px;
    color: #9e9e9e;
    margin: 16px 0;
}

/* Modal Styles */
.factor-modal {
    border-radius: 12px !important;
    overflow: hidden;
}

.modal-header {
    background: #d9d9d9;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
}

.header-title {
    font-size: 20px;
    font-weight: 900;
    color: #000000;
    margin: 0;
}

.close-btn {
    background: transparent !important;
    color: #000000 !important;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.05) !important;
}

.modal-body {
    background: #ffffff;
    padding: 32px 40px !important;
    min-height: 400px;
    max-height: calc(100vh - 250px);
}

.form-section {
    margin-bottom: 32px;
    padding: 24px;
    background: #f0f0f0;
    border-radius: 16px;
}

.form-label {
    display: block;
    font-size: 15px;
    font-weight: 900;
    color: #000000;
    margin-bottom: 16px;
}

.factor-input-field {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 24px;
    background: #ffffff;
    font-size: 14px;
    color: #000000;
    outline: none;
    transition: all 0.3s ease;
}

.factor-input-field::placeholder {
    color: #cccccc;
}

.factor-input-field:focus {
    border-color: #7c3aed;
    background: #ffffff;
}

.error-message {
    color: #d32f2f;
    font-size: 12px;
    margin-top: 4px;
}

.levels-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: transparent;
    padding: 0;
    border-radius: 0;
    border: none;
    margin-top: 8px;
}

.level-row {
    display: grid;
    grid-template-columns: 48px 1fr 1.8fr;
    gap: 16px;
    align-items: center;
    padding: 16px 20px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
}

.level-row:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.level-number-badge-modal {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: none;
}

.level-input-field,
.description-input-field {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    background: #fafafa;
    font-size: 13px;
    color: #000000;
    outline: none;
    transition: all 0.3s ease;
}

.level-input-field::placeholder,
.description-input-field::placeholder {
    color: #b0b0b0;
}

.level-input-field:focus,
.description-input-field:focus {
    border-color: #7c3aed;
    background: #ffffff;
}

.modal-footer {
    padding: 24px 40px !important;
    background: #ffffff;
    border-top: none;
}

.cancel-btn {
    text-transform: none !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    color: #000000 !important;
    padding: 0 32px !important;
    height: 44px !important;
    border-radius: 8px !important;
    border: 1px solid #d0d0d0 !important;
    background: transparent !important;
}

.cancel-btn:hover {
    background: #f5f5f5 !important;
    border-color: #b0b0b0 !important;
}

.save-btn {
    text-transform: none !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    border-radius: 8px !important;
    padding: 0 36px !important;
    height: 44px !important;
    box-shadow: none !important;
    background: #7c3aed !important;
    color: white !important;
}

.save-btn:hover {
    background: #6d28d9 !important;
}

.save-btn:disabled {
    background: #d0d0d0 !important;
    color: #999999 !important;
}

/* Slide Fade Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

/* Responsive Design */
@media (max-width: 960px) {
    .grid-container {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    .factor-header {
        padding: 14px 16px;
    }

    .factor-title {
        font-size: 16px;
    }
}

@media (max-width: 600px) {
    .grid-container {
        grid-template-columns: 1fr;
    }

    .factor-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .add-factor-btn {
        width: 100%;
    }

    .factors-grid {
        padding: 16px;
    }

    .level-row {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .level-row .level-number-badge-modal {
        width: 36px;
        height: 36px;
        font-size: 14px;
    }

    .modal-body {
        padding: 16px !important;
    }
}

/* Animation for cards */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.factor-card {
    animation: slideIn 0.3s ease-out;
}

.factor-card:nth-child(1) { animation-delay: 0.05s; }
.factor-card:nth-child(2) { animation-delay: 0.1s; }
.factor-card:nth-child(3) { animation-delay: 0.15s; }
.factor-card:nth-child(4) { animation-delay: 0.2s; }
.factor-card:nth-child(5) { animation-delay: 0.25s; }
.factor-card:nth-child(6) { animation-delay: 0.3s; }
[dir="rtl"] .grid-container{
    direction: rtl;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row ,[dir="rtl"] .form-label ,[dir="rtl"] .factor-input-field {
text-align: end;
}
[dir="rtl"] .level-row{
    direction: rtl;
}
</style>