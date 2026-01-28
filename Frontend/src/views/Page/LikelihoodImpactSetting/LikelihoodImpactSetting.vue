<template>
    <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('risk.riskmgmt')"
        :subPage="$t('risk.risk_Methodology')"
        :titlePage="$t('risk.risk_calculation')">

        <template #datatable>
            <!-- Hero Header with Gradient -->
            <v-card class="risk-header-card mb-8" flat>
                <div class="risk-header-content rtl">
                    <!-- Left Section -->
                    <div class="risk-header-left rtl">
                        <v-icon class="risk-header-icon" size="44">mdi-shield-check-outline</v-icon>

                        <div class="risk-header-text">
                            <h1 class="risk-header-title d-flex rtl">Risk Matrix Configuration</h1>
                            <p class="risk-header-subtitle d-flex rtl">
                                Design And Customize Your Comprehensive Risk Assessment Framework
                            </p>
                        </div>
                    </div>

                    <!-- Right Button -->
                    <v-btn color="primary" class="risk-header-btn" @click="openConfigModal">
                        <v-icon start size="20">mdi-cog-outline</v-icon>
                        Configure Matrix
                    </v-btn>
                </div>
            </v-card>

            <!-- Matrix Tabs Wrapper -->
            <div class="matrix-tabs-wrapper mb-6" :class="{ 'single-tab': !hasImpactData }">
                <div class="matrix-tab" :class="{ active: activeMainTab === 'matrix' }"
                    @click="activeMainTab = 'matrix'">
                    Risk Calculation Matrix
                </div>

                <div v-if="hasImpactData" class="matrix-tab" :class="{ active: activeMainTab === 'impact' }"
                    @click="activeMainTab = 'impact'">
                    Impact & Likelihood
                </div>
            </div>

            <!-- Conditional Content Based on Active Tab -->
            <div v-if="activeMainTab === 'matrix'" class="risk-matrix-graph-card">
                <RiskCalculationMatrixGraph :impacts="impacts" :likelihoods="likelihoods" :riskLevels="riskLevels"
                    @data-updated="fetchConfigData" />
            </div>

            <div v-if="activeMainTab === 'impact' && hasImpactData">
                <ImpactLikelihoodComponent :impacts="impacts" :likelihoods="likelihoods"
                    @delete-parameter="deleteParameter" @save-factor="handleSaveFactor" />
            </div>
        </template>
    </main-page>

    <!-- Configuration Modal Component -->
    <RiskMatrixSetupModal ref="configModal" :impacts="impacts" :likelihoods="likelihoods"
        @save-configuration="handleSaveConfiguration" @refresh-data="fetchConfigData" />
</template>

<script>
import likelihoodimpactsetting from "@/API/LikelihoodImpactSetting/LikelihoodImpactSetting";
import riskLevel from "@/API/RiskLevel/RiskLevel";
import systemSetting from "@/API/SystemSetting/SystemSetting";
import MainPage from "@/components/MainPage.vue";
import { notify } from "@kyvg/vue3-notification";
import Swal from "sweetalert2";
import RiskCalculationMatrixGraph from "./RiskCalculationMatrixGraphComponent.vue";
import ImpactLikelihoodComponent from "./ImpactLikelihoodComponent.vue";
import RiskMatrixSetupModal from "./RiskMatrixSetupModal.vue";

export default {
    components: {
        MainPage,
        RiskCalculationMatrixGraph,
        ImpactLikelihoodComponent,
        RiskMatrixSetupModal
    },

    setup() {
        const api = new likelihoodimpactsetting();
        const riskLevelApi = new riskLevel();
        const systemSettingApi = new systemSetting();
        const type = ["impacts", "likelihoods"];
        const typeCategory = type.join(",");
        const apiParams = { filterIn: `type|${typeCategory}`, };
        const tableColumns = [];
        const fromFields = [];

        return {
            api,
            riskLevelApi,
            systemSettingApi,
            apiParams,
            tableColumns,
            fromFields
        };
    },

    async mounted() {
        await this.fetchConfigData();
        await this.fetchRiskLevels();
    },

    data() {
        return {
            activeMainTab: 'matrix',
            isFlipped: false,
            impacts: [],
            likelihoods: [],
            riskLevels: []
        };
    },

    computed: {
        hasImpactData() {
            return this.impacts?.[0]?.data && Array.isArray(this.impacts[0].data) && this.impacts[0].data.length > 0;
        }
    },

    methods: {
        openConfigModal() {
            this.$refs.configModal.openModal();
        },

        async fetchConfigData() {
            try {
                const [impactsResult, likelihoodsResult] = await Promise.all([
                    this.api.getAll({ filter: "type|impacts|=" }),
                    this.api.getAll({ filter: "type|likelihoods|=" })
                ]);
                this.impacts = impactsResult;
                this.likelihoods = likelihoodsResult;

                // If impact data doesn't exist, ensure we're on the matrix tab
                if (!this.hasImpactData && this.activeMainTab === 'impact') {
                    this.activeMainTab = 'matrix';
                }

                console.log('✅ Config data fetched successfully');
            } catch (error) {
                console.error("Error fetching config data:", error);
                notify({
                    type: 'error',
                    title: 'Error',
                    text: 'Failed to fetch configuration data.'
                });
            }
        },

        async fetchRiskLevels() {
            try {
                const response = await this.riskLevelApi.getAll({ sort: "from|asc" });
                this.riskLevels = response || [];

                // If no risk levels exist, create defaults
                if (!this.riskLevels.length) {
                    await this.riskLevelApi.insert({ from: 0, color: "#33e677", name: "Low" });
                    await this.riskLevelApi.insert({ from: 10, color: "#e6e037", name: "Medium" });
                    await this.riskLevelApi.insert({ from: 15, color: "#ffa200", name: "High" });
                    await this.riskLevelApi.insert({ from: 20, color: "#ff0000", name: "Very High" });
                    this.riskLevels = await this.riskLevelApi.getAll({ sort: "from|asc" });
                }

                console.log('✅ Risk levels fetched successfully');
            } catch (error) {
                console.error("Error fetching risk levels:", error);
                notify({
                    type: 'error',
                    title: 'Error',
                    text: 'Failed to fetch risk levels.'
                });
            }
        },

        async deleteParameter(paramId) {
            const confirm = await Swal.fire({
                title: "Are you sure?",
                text: "This parameter will be deleted!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!"
            });

            if (!confirm.isConfirmed) return;

            const impactParamIds = this.impacts?.[0]?.params?.map(p => p?.id).filter(Boolean) || [];
            const isImpactParam = impactParamIds.includes(paramId);

            const type = isImpactParam ? 'impacts' : 'likelihoods';
            const dataset = isImpactParam ? this.impacts : this.likelihoods;
            const id = dataset?.[0]?.id ?? null;
            if (!id) return;

            try {
                // Get existing params and filter out nulls/undefined/invalid entries
                const rawParams = Array.isArray(dataset?.[0]?.params) ? dataset[0].params : [];
                const cleanParams = rawParams.filter(p => p && p.id && typeof p === 'object');
                const newParams = cleanParams.filter(p => p.id !== paramId);

                console.log('🗑️ Delete Parameter:', {
                    paramId,
                    type,
                    beforeCount: cleanParams.length,
                    afterCount: newParams.length,
                    willBeEmpty: newParams.length === 0
                });

                // Get existing data (impact/likelihood levels) - IMPORTANT!
                const existingData = Array.isArray(dataset?.[0]?.data) ? dataset[0].data : [];

                const payload = {
                    id,
                    type,
                    data: existingData, // Keep existing data levels
                    params: newParams.length > 0 ? newParams : [] // Explicitly use empty array
                };

                // Remove the isParamsEmpty field - let the backend handle it
                // Or if you need it, make sure it's a boolean not a string
                if (newParams.length === 0) {
                    payload.isParamsEmpty = true; // Boolean, not string "true"
                }

                console.log('📦 Delete Payload:', JSON.stringify(payload, null, 2));

                const response = await this.api.from(payload);
                const res = Array.isArray(response) ? response[1] : response;

                if (res?.status === "success" || res?.data?.status === "success") {
                    await this.fetchConfigData();
                    notify({
                        type: 'success',
                        title: 'Success',
                        text: 'Parameter deleted successfully!'
                    });
                } else {
                    console.error('❌ Delete failed:', res);
                    notify({
                        type: 'error',
                        title: 'Error',
                        text: res?.message || 'Failed to delete parameter.'
                    });
                }
            } catch (error) {
                console.error("❌ Error deleting parameter:", error);
                notify({
                    type: 'error',
                    title: 'Error',
                    text: 'Failed to delete parameter.'
                });
            }
        },

        async handleSaveConfiguration(payload) {
            try {
                console.log('💾 Saving Configuration...', payload);

                // Prepare the complete configuration payload for a single request
                const completePayload = {
                    // Impact configuration
                    impact: {
                        id: payload.impact.id || null,
                        type: 'impacts',
                        tab: payload.impact.tab,
                        stepNumber: payload.impact.stepNumber,
                        stepName: payload.impact.stepName,
                        data: payload.impact.data,
                        params: payload.impact.params
                    },

                    // Likelihood configuration
                    likelihood: {
                        id: payload.likelihood.id || null,
                        type: 'likelihoods',
                        tab: payload.likelihood.tab,
                        stepNumber: payload.likelihood.stepNumber,
                        stepName: payload.likelihood.stepName,
                        data: payload.likelihood.data,
                        params: payload.likelihood.params
                    },

                    // Risk Levels configuration
                    riskLevels: {
                        tab: payload.riskLevels.tab,
                        stepNumber: payload.riskLevels.stepNumber,
                        stepName: payload.riskLevels.stepName,
                        data: payload.riskLevels.data.map(level => ({
                            id: level.id || null,
                            name: String(level.name).trim(),
                            from: String(level.from).trim(),
                            color: String(level.color).trim()
                        }))
                    },

                    // Appetite & Tolerance configuration
                    appetiteTolerance: {
                        id: payload.appetiteTolerance.id || null,
                        type: 'appetitetolerance',
                        tab: payload.appetiteTolerance.tab,
                        stepNumber: payload.appetiteTolerance.stepNumber,
                        stepName: payload.appetiteTolerance.stepName,
                        tolerance: parseInt(payload.appetiteTolerance.data.tolerance) || 6,
                        appetite: parseInt(payload.appetiteTolerance.data.appetite) || 5
                    },

                    // Additional metadata
                    submittedAt: payload.submittedAt || new Date().toISOString(),
                    matrixSize: payload.matrixSize || 5
                };

                console.log('📦 Complete Payload for Single Request:', completePayload);
                console.log('═══════════════════════════════════════════════════════');

                // Make a SINGLE API call to save all configurations
                const response = await this.api.saveCompleteConfiguration(completePayload);

                const result = Array.isArray(response) ? response[1] : response;

                if (result && result.data?.status === 'success') {
                    console.log('✅ Configuration saved successfully!');

                    // Fetch updated data for all tabs
                    await this.fetchConfigData();
                    await this.fetchRiskLevels();

                    // Show success notification
                    notify({
                        type: 'success',
                        title: 'Success',
                        text: 'All configurations saved successfully!'
                    });

                    console.log('✅✅✅ ALL CONFIGURATIONS SAVED SUCCESSFULLY! ✅✅✅');
                    return true;

                } else {
                    console.log('❌ Configuration save failed:', result);

                    // Show error notification
                    notify({
                        type: 'error',
                        title: 'Error',
                        text: result?.message || 'Failed to save configuration'
                    });

                    return false;
                }

            } catch (error) {
                console.error("❌ Error saving configuration:", error);

                // Show error notification
                notify({
                    type: 'error',
                    title: 'Error',
                    text: 'Failed to save configuration. Please try again.'
                });

                return false;
            }
        },

        async handleSaveFactor(payload) {
            console.log('🟢 handleSaveFactor called with payload:', payload);

            try {
                console.log('💾 Saving Factor...', payload);

                const { type, data, isEdit } = payload;

                console.log('📋 Factor Details:', {
                    type,
                    factorName: data.name,
                    factorId: data.id,
                    levelsCount: data.levels.length,
                    isEdit
                });

                // Determine which dataset to work with
                const dataset = type === 'impact' ? this.impacts : this.likelihoods;
                const id = dataset?.[0]?.id ?? null;

                console.log('🗂️ Dataset Info:', {
                    datasetType: type,
                    datasetId: id,
                    hasData: !!dataset?.[0],
                    existingParamsCount: dataset?.[0]?.params?.length || 0
                });

                if (!id) {
                    console.error('❌ No configuration ID found');
                    notify({
                        type: 'error',
                        title: 'Error',
                        text: 'Configuration not found. Please configure matrix first.'
                    });
                    return;
                }

                // Get existing params
                const existingParams = Array.isArray(dataset?.[0]?.params) ? dataset[0].params : [];
                console.log('📦 Existing params:', existingParams.length);

                let updatedParams;
                if (isEdit) {
                    // Update existing parameter
                    updatedParams = existingParams.map(param =>
                        param.id === data.id ? data : param
                    );
                    console.log('✏️ Updated existing parameter');
                } else {
                    // Add new parameter
                    updatedParams = [...existingParams, data];
                    console.log('➕ Added new parameter');
                }

                console.log('📊 Updated params count:', updatedParams.length);

                // Get existing data (impact/likelihood levels) - IMPORTANT!
                const existingData = Array.isArray(dataset?.[0]?.data) ? dataset[0].data : [];
                console.log('📈 Existing data levels:', existingData.length);

                // Build the complete payload with BOTH data and params
                const savePayload = {
                    id,
                    type: type === 'impact' ? 'impacts' : 'likelihoods',
                    data: existingData, // Keep the existing impact/likelihood levels
                    params: updatedParams // Update only the params
                };

                console.log('📦 Complete Save Payload:', {
                    id: savePayload.id,
                    type: savePayload.type,
                    dataCount: savePayload.data.length,
                    paramsCount: savePayload.params.length
                });

                // Send to API
                console.log('🌐 Sending to API...');
                const response = await this.api.from(savePayload);
                const result = Array.isArray(response) ? response[1] : response;

                console.log('📥 API Response:', result);

                if (result?.status === "success" || result?.data?.status === "success") {
                    console.log('✅ Factor saved successfully!');

                    // Refresh data
                    await this.fetchConfigData();

                    notify({
                        type: 'success',
                        title: 'Success',
                        text: `Factor ${isEdit ? 'updated' : 'added'} successfully!`
                    });
                } else {
                    console.error('❌ API returned failure:', result);
                    notify({
                        type: 'error',
                        title: 'Error',
                        text: result?.message || 'Failed to save factor.'
                    });
                }
            } catch (error) {
                console.error("❌ Error saving factor:", error);
                notify({
                    type: 'error',
                    title: 'Error',
                    text: 'Failed to save factor. Please try again.'
                });
            }
        }
    }
};
</script>


<style scoped>
.risk-header-card {
    background: #F0F0F0;
    padding: 18px 25px;
    border-radius: 14px;
    border-left: 6px solid #6f2dbd;
}

.risk-header-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.risk-header-left {
    display: flex;
    align-items: center;
    gap: 18px;
}

.risk-header-icon {
    color: #000;
    background: white;
    border-radius: 50%;
    padding: 8px;
    border: 1px solid #e0e0e0;
}

.risk-header-text {
    display: flex;
    flex-direction: column;
}

.risk-header-title {
    font-size: 22px;
    font-weight: 1000;
    margin: 0;
    color: #000;
}

.risk-header-subtitle {
    margin: 2px 0 0 0;
    color: #777;
    font-size: 14px;
}

.risk-header-btn {
    background-color: #6f2dbd !important;
    color: white;
    font-weight: 600;
    text-transform: none;
    border-radius: 10px;
    padding: 8px 18px;
}

.matrix-tabs-wrapper {
    background: #efefef;
    padding: 6px;
    border-radius: 14px;
    display: flex;
    gap: 6px;
}

/* When only one tab is visible, it takes full width */
.matrix-tabs-wrapper.single-tab .matrix-tab {
    flex: 1;
}

.matrix-tab {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    border-radius: 12px;
    background: #ffffff;
    font-weight: 500;
    color: #424242;
    cursor: pointer;
    transition: 0.25s;
    font-size: 15px;
}

.matrix-tab.active {
    background: #6f2dbd;
    color: white;
}

.risk-matrix-graph-card {
    background: #F0F0F0;
    border-radius: 14px;
    margin-top: 20px;
}

[dir="rtl"] .risk-header-content {
    flex-direction: row-reverse;
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