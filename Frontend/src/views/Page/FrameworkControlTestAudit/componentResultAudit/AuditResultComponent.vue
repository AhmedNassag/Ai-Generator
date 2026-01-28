<template>
    <div class="audit-result-container">
        <h2 class="section-title mb-4">{{ $t("auditresultcomponent.audit_results_overview") }}</h2>
        <v-row>
            <v-col cols="12" md="6">
                <v-card class="mb-6 chart-card">
                    <v-card-title class="primary white--text chart-card-title">
                        <v-icon left color="white" class="chart-icon">{{ $t("auditresultcomponent.mdichartpie") }}</v-icon>
                        {{ $t("auditresultcomponent.requirement_status") }}
                    </v-card-title>
                    <v-card-text class="chart-container">
                        <div id="requirementChart" style="height: 400px; width: 100%"></div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card class="mb-6 chart-card">
                    <v-card-title class="primary white--text chart-card-title">
                        <v-icon left color="white" class="chart-icon">{{ $t("auditresultcomponent.mdichartpie") }}</v-icon>
                        {{ $t("auditresultcomponent.evidence_status") }}
                    </v-card-title>
                    <v-card-text class="chart-container">
                        <div id="evidenceChart" style="height: 400px; width: 100%"></div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-card class="status-update-card mt-4">
            <v-card-title class="status-card-title">
                <v-icon left color="primary">{{ $t("auditresultcomponent.mdiclipboardcheckoutline") }}</v-icon>
                {{ $t("auditresultcomponent.update_control_status") }}
            </v-card-title>
            <v-card-actions class="pa-4 d-flex justify-space-between align-center">
                <div class="custom-select-wrapper">
                    <label class="select-label">{{ $t("auditresultcomponent.control_implementation_status") }}</label>
                    <div class="custom-select-container">
                        <select 
                            :disabled="isEndAuditControl()" 
                            v-model="selectedControlStatus" 
                            class="custom-select"
                        >
                            <option value="" disabled selected>{{ $t("auditresultcomponent.select_control_status") }}</option>
                            <option 
                                v-for="(status, index) in controlStatusOptions" 
                                :key="index" 
                                :value="status"
                            >
                                {{ $t(`auditresultcomponent.status_${status.toLowerCase().replace(' ', '_')}`) }}
                            </option>
                        </select>
                        <span class="custom-arrow"></span>
                    </div>
                </div>

                <button 
                    v-if="!isEndAuditControl()" 
                    @click="submitControlStatus" 
                    :disabled="!selectedControlStatus" 
                    class="custom-btn"
                >
                    <v-icon left class="btn-icon">{{ $t("auditresultcomponent.mdicheckcircle") }}</v-icon>
                    {{ $t("auditresultcomponent.update_status") }}
                </button>
            </v-card-actions>
        </v-card>
    </div>
</template>


<script>
import Highcharts from 'highcharts';
import { onMounted, watch } from 'vue';
import frameworkcontroltestaudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import axios from 'axios';

// Set global Highcharts options to prevent locale issues
Highcharts.setOptions({
    lang: {
        decimalPoint: '.',
        thousandsSep: ','
    }
});

export default {
    name: 'AuditResultComponent',
    props: {
        controlAuditData: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            selectedControlStatus: null,
            isSubmitting: false,
            controlStatusOptions: [],
            statusMapping: {
                1: 'Not Applicable',
                2: 'Not Implemented',
                3: 'Partially Implemented',
                4: 'Implemented'
            },
            frameworkcontroltestauditApi: new frameworkcontroltestaudit()
        };
    },
    computed: {
        // Calculate the available status options based on evidence and requirements
        calculatedStatusOptions() {
            const requirements = this.controlAuditData?.requirements_with_evidence_data ||
                this.controlAuditData?.requirements_with_evidence || [];

            // Count approved requirements
            const approvedCount = requirements.filter(req =>
                req.status && req.status.toLowerCase() === 'approved'
            ).length;

            const totalRequirements = requirements.length;
            const hasActions = totalRequirements > 0; // Assuming if there are requirements, there are actions

            let statusIds = [1, 2 ,3,4]; // Default: 'Not Applicable', 'Not Implemented'

            if (hasActions) {
                if (approvedCount === totalRequirements) {
                    // All requirements approved
                    statusIds = [1, 2, 3, 4];
                } else if (approvedCount > 0) {
                    // Some requirements approved
                    statusIds = [1, 2, 3];
                }else if (approvedCount <= 0) {
                    // Some requirements approved
                    statusIds = [1, 2];
                }
                // Else default will be [1, 2]
            }

            // Map IDs to status names
            return statusIds.map(id => this.statusMapping[id]);
        },

    },
    methods: {
        isEndAuditControl() {
            if (this.controlAuditData?.end_audit_status == 1 || this.controlAuditData?.open_closed_status == 1) {
                return true;
            }
        },
        renderCharts() {
            // Process data for charts
            const requirementData = this.processRequirementData();
            const evidenceData = this.processEvidenceData();

            // Requirement Pie Chart
            Highcharts.chart('requirementChart', {
                chart: {
                    type: 'pie',
                    backgroundColor: 'transparent'
                },
                title: {
                    text: this.$t("auditresultcomponent.Requirement Status"),
                    style: {
                        color: '#333',
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}',
                            style: {
                                color: '#333'
                            }
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Requirements',
                    colorByPoint: true,
                    data: requirementData
                }],
                colors: ['#4CAF50', '#F44336', '#FFC107', '#9E9E9E'],
                credits: {
                    enabled: false
                },
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            plotOptions: {
                                pie: {
                                    dataLabels: {
                                        enabled: false
                                    },
                                    showInLegend: true
                                }
                            }
                        }
                    }]
                },
                credits: {
                    enabled: false
                },
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            plotOptions: {
                                pie: {
                                    dataLabels: {
                                        enabled: false
                                    },
                                    showInLegend: true
                                }
                            }
                        }
                    }]
                }
            });

            // Evidence Pie Chart
            Highcharts.chart('evidenceChart', {
                chart: {
                    type: 'pie',
                    backgroundColor: 'transparent'
                },
                title: {
                    text: this.$t("auditresultcomponent.Evidence Status"),
                    style: {
                        color: '#333',
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}',
                            style: {
                                color: '#333'
                            }
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Evidences',
                    colorByPoint: true,
                    data: evidenceData
                }],
                colors: ['#4CAF50', '#F44336', '#FFC107', '#9E9E9E']
            });
        },
        processRequirementData() {
            const requirements = this.controlAuditData?.requirements_with_evidence_data ||
                this.controlAuditData?.requirements_with_evidence ||
                [];

            const statusCounts = {
                approved: 0,
                rejected: 0,
                pending: 0,
                not_relevant: 0
            };

            requirements.forEach(req => {
                // Handle null/undefined status by defaulting to 'pending'
                const status = (req.status === null || req.status === undefined)
                    ? 'pending'
                    : req.status.toLowerCase();
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            return [
                { name: 'Approved', y: statusCounts.approved },
                { name: 'Rejected', y: statusCounts.rejected },
                { name: 'Pending', y: statusCounts.pending },
                { name: 'Not Relevant', y: statusCounts.not_relevant }
            ];
        },
        processEvidenceData() {
            const requirements = this.controlAuditData?.requirements_with_evidence_data ||
                this.controlAuditData?.requirements_with_evidence ||
                [];

            const statusCounts = {
                approved: 0,
                rejected: 0,
                pending: 0,
                not_relevant: 0
            };

            requirements.forEach(req => {
                (req.evidence || []).forEach(evidence => {
                    // Handle null/undefined status by defaulting to 'pending'
                    const status = (evidence.status === null || evidence.status === undefined)
                        ? 'pending'
                        : evidence.status.toLowerCase();
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });
            });

            return [
                { name: 'Approved', y: statusCounts.approved },
                { name: 'Rejected', y: statusCounts.rejected },
                { name: 'Pending', y: statusCounts.pending },
                { name: 'Not Relevant', y: statusCounts.not_relevant }
            ];
        },
        async submitControlStatus() {
            if (!this.selectedControlStatus) return;
            this.isSubmitting = true;

            try {
                const payload = {
                    control_audit_id: this.controlAuditData.id,
                    status: this.selectedControlStatus
                };
                // Call your API to update the control status
                const response = await this.frameworkcontroltestauditApi.UpdateAuditControlStatus(payload);

                if (response.data.status === 'success') {
                    this.$notify({
                        title: this.$t("auditresultcomponent.success"),
                        text: this.$t("auditresultcomponent.Control status updated successfully"),
                        type: "success",
                    });
                    this.$emit('requirement-updated', {
                        controlAuditId: this.controlAuditData.id,
                    });

                }
            } catch (error) {
                console.error('Error updating control status:', error);
                this.$notify({
                    title: this.$t("auditresultcomponent.error"),
                    text: this.$t("auditresultcomponent.Failed to update control status"),
                    type: "error",
                });
            } finally {
                this.isSubmitting = false;
            }
        },
        initializeComponent() {
            // Set the available status options
            this.controlStatusOptions = this.calculatedStatusOptions;

            // Set the current status if it exists and is valid
            if (this.controlAuditData?.status) {
                // Check if the current status is in the available options
                if (this.calculatedStatusOptions.includes(this.controlAuditData.status)) {
                    this.selectedControlStatus = this.controlAuditData.status;
                }
            }

            // Render the charts
            this.renderCharts();
        }
    },
    mounted() {
        this.initializeComponent();

    },
    created() {
        if (this.controlAuditData?.status) {
            this.selectedControlStatus = this.controlAuditData.status;
        }
    },
    watch: {
        controlAuditData: {
            handler() {
                this.initializeComponent();
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.audit-result-container {
    padding: 30px;
    background-color: #f8fafc;
    border-radius: 16px;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 24px;
    position: relative;
    padding-bottom: 12px;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(to right, #3498db, #4CAF50);
    border-radius: 2px;
}

.chart-card {
    margin-bottom: 20px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    height: 100%;
    transition: all 0.3s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.chart-card-title {
    padding: 20px 24px;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    position: relative;
    background: #f0f0f0 !important;
}

.chart-card-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
}

.chart-icon {
    margin-right: 10px;
    font-size: 22px;
}

.chart-container {
    padding: 24px;
    background-color: rgba(255, 255, 255, 0.95);
}

#requirementChart,
#evidenceChart {
    min-height: 400px;
    padding: 10px;
    border-radius: 8px;
}

.status-update-card {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    margin-top: 24px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.status-card-title {
    background-color: #f0f4f8;
    padding: 16px 24px;
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.status-select {
    border-radius: 8px;
}

.update-btn {
    text-transform: none;
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: 8px;
    padding: 0 24px;
    height: 40px;
    color: white;
    /* ✅ Correct property */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    background: #f0f0f0 !important;
}

.update-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.update-btn,
.update-btn .v-icon,
.update-btn span {
    color: white !important;
}
/* Custom Select with Label Styles */
.custom-select-wrapper {
    display: flex;
    flex-direction: column;
    margin-right: 16px;
}

.select-label {
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 8px;
    display: block;
}

.custom-select-container {
    position: relative;
    width: 300px;
}

.custom-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
}

.custom-select:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.custom-select:disabled {
    background-color: #f8fafc;
    cursor: not-allowed;
    opacity: 0.7;
}

.custom-arrow {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid #64748b;
    pointer-events: none;
}

/* Custom Button Styles */
.custom-btn {
    display: flex;
    align-items: center;
    padding: 0 24px;
    height: 44px;
    background: linear-gradient(to right, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 24px; /* Align with select bottom */
}

.custom-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    background: linear-gradient(to right, #2980b9, #3498db);
}

.custom-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #cbd5e1;
}

.btn-icon {
    margin-right: 8px;
    color: white !important;
}
</style>