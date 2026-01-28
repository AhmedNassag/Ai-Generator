<template>
    <v-card class="control-tree-card elevation-0" v-if="treeData.length > 0">
        <!-- Modern Header with Gradient -->
        <div class="tree-header">
            <div class="header-content">
                <div class="header-left">
                    <div class="icon-wrapper">
                        <v-icon color="black" size="28">mdi-sitemap</v-icon>
                    </div>
                    <div class="header-text">
                        <h2 class="header-title">
                            {{ $t("controlmappingtree.control_mapping_tree") || "Control Mapping Tree" }}
                        </h2>
                        <p class="header-subtitle">
                            {{ mappedControlsCount }} {{ $t("controlmappingtree.mapped_controls") || "mapped controls" }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tree Content -->
        <v-card-text class="tree-content">
            <div class="tree-container">
                <div v-for="node in treeData" :key="node.id" class="tree-root">
                    
                    <!-- Current Control Node -->
                    <div class="current-control-wrapper">
                        <div class="node-connector"></div>
                        <div class="current-control" @click="toggleNode(node.id)">
                            <div class="control-card">
                                <div class="control-header">
                                    <div class="control-left">
                                        <v-icon 
                                            class="expand-icon" 
                                            :class="{ 'expanded': expandedNodes.includes(node.id) }"
                                            size="20"
                                        >
                                            mdi-chevron-right
                                        </v-icon>
                                        <div class="control-icon-wrapper primary">
                                            <v-icon color="white" size="20">mdi-shield-check</v-icon>
                                        </div>
                                        <div class="control-info">
                                            <h3 class="control-name">{{ node.name }}</h3>
                                            <p class="control-subtitle">Primary Control</p>
                                        </div>
                                    </div>
                                    <v-chip 
                                        class="status-chip primary-chip" 
                                        small 
                                        label
                                    >
                                        <v-icon left size="14">mdi-star</v-icon>
                                        Current
                                    </v-chip>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mapped Controls (Children) -->
                    <transition name="expand">
                        <div v-if="expandedNodes.includes(node.id)" class="mapped-controls-container">
                            
                            <!-- Has Mapped Controls -->
                            <div v-if="node.mappedControls.length > 0" class="mapped-controls-list">
                                <div 
                                    v-for="(mapped, index) in node.mappedControls" 
                                    :key="`mapped-${node.id}-${index}`"
                                    class="mapped-control-item"
                                    :style="{ animationDelay: `${index * 0.05}s` }"
                                >
                                    <!-- Tree Branch Line -->
                                    <div class="tree-branch">
                                        <div class="branch-line"></div>
                                        <div class="branch-node"></div>
                                    </div>

                                    <!-- Mapped Control Card -->
                                    <div class="mapped-control-card">
                                        <div class="mapped-header">
                                            <div class="mapped-left">
                                                <div class="control-icon-wrapper mapped">
                                                    <v-icon color="white" size="18">mdi-link-variant</v-icon>
                                                </div>
                                                <div class="mapped-info">
                                                    <h4 class="mapped-name">{{ mapped.name }}</h4>
                                                    <p class="mapped-subtitle">Mapped Control</p>
                                                </div>
                                            </div>
                                            <v-chip 
                                                class="status-chip mapped-chip" 
                                                small 
                                                label
                                            >
                                                <v-icon left size="12">mdi-link</v-icon>
                                                Linked
                                            </v-chip>
                                        </div>

                                        <!-- Requirement Details -->
                                        <div class="requirement-section">
                                            <div class="requirement-header">
                                                <v-icon size="16" color="#6366f1">mdi-file-document-outline</v-icon>
                                                <span class="requirement-title">Requirement Details</span>
                                            </div>
                                            
                                            <div class="requirement-details">
                                                <div class="detail-row">
                                                    <div class="detail-label">
                                                        <v-icon size="14" color="#64748b">mdi-text</v-icon>
                                                        <span>Name</span>
                                                    </div>
                                                    <div class="detail-value">
                                                        {{ mapped.requirementName || 'N/A' }}
                                                    </div>
                                                </div>

                                                <div class="detail-row">
                                                    <div class="detail-label">
                                                        <v-icon size="14" color="#64748b">mdi-check-circle-outline</v-icon>
                                                        <span>Status</span>
                                                    </div>
                                                    <div class="detail-value">
                                                        <v-chip 
                                                            x-small 
                                                            :color="getStatusColor(mapped.status)"
                                                            :class="`status-badge ${getStatusClass(mapped.status)}`"
                                                        >
                                                            <v-icon left size="12">{{ getStatusIcon(mapped.status) }}</v-icon>
                                                            {{ formatStatus(mapped.status) }}
                                                        </v-chip>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- No Mapped Controls -->
                            <div v-else class="no-mapped-controls">
                                <div class="tree-branch empty">
                                    <div class="branch-line"></div>
                                    <div class="branch-node empty"></div>
                                </div>
                                <div class="empty-state">
                                    <v-icon size="32" color="#94a3b8">mdi-information-outline</v-icon>
                                    <p class="empty-text">No mapped controls found</p>
                                    <p class="empty-subtext">This control has no linked controls</p>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'ControlMappingTree',
    props: {
        controlAuditData: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            expandedNodes: [],
            treeData: []
        };
    },
    computed: {
        mappedControlsCount() {
            return this.treeData.reduce((total, node) => total + node.mappedControls.length, 0);
        }
    },
    watch: {
        controlAuditData: {
            deep: true,
            immediate: true,
            handler(newData) {
                this.buildTreeData(newData);
                if (this.treeData.length > 0 && this.expandedNodes.length === 0) {
                    this.expandedNodes = [this.treeData[0].id];
                }
            }
        }
    },
    methods: {
        buildTreeData(controlAuditData) {
            this.treeData = [];

            if (!controlAuditData?.control) {
                return;
            }

            const currentControl = {
                id: controlAuditData.control.id || 'current-control',
                name: controlAuditData.control.short_name || 'Unknown Control',
                mappedControls: []
            };

            if (controlAuditData.requirements_with_evidence_data && Array.isArray(controlAuditData.requirements_with_evidence_data)) {
                controlAuditData.requirements_with_evidence_data.forEach(req => {
                    if (req.latest_control_audit?.control_mapped) {
                        const mappedControl = req.latest_control_audit.control_mapped;
                        currentControl.mappedControls.push({
                            id: mappedControl.id || `mapped-${Math.random()}`,
                            name: mappedControl.name || 'Unknown Mapped Control',
                            requirementName: req.requirementRelation?.name || 'N/A',
                            status: req.latest_control_audit.requirement?.status || null
                        });
                    }
                });
            }

            this.treeData = [currentControl];
        },

        toggleNode(nodeId) {
            const index = this.expandedNodes.indexOf(nodeId);
            if (index > -1) {
                this.expandedNodes.splice(index, 1);
            } else {
                this.expandedNodes.push(nodeId);
            }
        },

        getStatusColor(status) {
            const statusMap = {
                'approved': '#10b981',
                'rejected': '#ef4444',
                'not_relevant': '#f59e0b',
                'pending': '#6b7280'
            };
            return statusMap[status?.toLowerCase()] || '#6b7280';
        },

        getStatusClass(status) {
            return status?.toLowerCase() || 'pending';
        },

        getStatusIcon(status) {
            const iconMap = {
                'approved': 'mdi-check-circle',
                'rejected': 'mdi-close-circle',
                'not_relevant': 'mdi-alert-circle',
                'pending': 'mdi-clock-outline'
            };
            return iconMap[status?.toLowerCase()] || 'mdi-clock-outline';
        },

        formatStatus(status) {
            if (!status) return 'Pending';
            return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        }
    }
};
</script>

<style scoped>
.control-tree-card {
    border-radius: 16px;
    overflow: hidden;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
}

/* Modern Header */
.tree-header {
    background: #f0f0f0;
    padding: 24px 28px;
    position: relative;
    overflow: hidden;
}

.tree-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.3; }
}

.header-content {
    position: relative;
    z-index: 1;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.icon-wrapper {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
}

.header-text {
    flex: 1;
}

.header-title {
    font-size: 20px;
    font-weight: 700;
    color: black;
    margin: 0;
    letter-spacing: -0.02em;
}

.header-subtitle {
    font-size: 13px;
    color: black;
    margin: 4px 0 0;
    font-weight: 500;
}

/* Tree Content */
.tree-content {
    padding: 28px;
    background: #f8fafc;
}

.tree-container {
    position: relative;
}

.tree-root {
    position: relative;
}

/* Current Control */
.current-control-wrapper {
    position: relative;
    margin-bottom: 20px;
}

.node-connector {
    position: absolute;
    left: 28px;
    top: 60px;
    bottom: -20px;
    width: 2px;
    background: linear-gradient(to bottom, #e2e8f0 0%, transparent 100%);
    z-index: 0;
}

.current-control {
    position: relative;
    z-index: 1;
    cursor: pointer;
}

.control-card {
    background: white;
    border-radius: 12px;
    padding: 18px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 2px solid #6366f1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.control-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #6366f1, #8b5cf6);
}

.control-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.15);
}

.control-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.control-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.expand-icon {
    color: #6366f1;
    transition: transform 0.3s ease;
    flex-shrink: 0;
}

.expand-icon.expanded {
    transform: rotate(90deg);
}

.control-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-icon-wrapper.primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.control-icon-wrapper.mapped {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}

.control-info {
    flex: 1;
    min-width: 0;
}

.control-name {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.control-subtitle {
    font-size: 12px;
    color: #64748b;
    margin: 2px 0 0;
    font-weight: 500;
}

.status-chip {
    font-weight: 600;
    font-size: 11px;
    height: 26px;
    padding: 0 12px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.primary-chip {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    color: white !important;
}

.mapped-chip {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%) !important;
    color: white !important;
}

/* Mapped Controls Container */
.mapped-controls-container {
    position: relative;
    margin-left: 28px;
    padding-left: 32px;
}

.mapped-controls-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.mapped-control-item {
    position: relative;
    animation: slideIn 0.4s ease forwards;
    opacity: 0;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Tree Branch */
.tree-branch {
    position: absolute;
    left: -32px;
    top: 24px;
    width: 32px;
    height: 2px;
    display: flex;
    align-items: center;
}

.branch-line {
    flex: 1;
    height: 2px;
    background: #e2e8f0;
}

.branch-node {
    width: 8px;
    height: 8px;
    background: #06b6d4;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 0 2px #e2e8f0;
    flex-shrink: 0;
}

.branch-node.empty {
    background: #cbd5e1;
}

/* Mapped Control Card */
.mapped-control-card {
    background: white;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
}

.mapped-control-card:hover {
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.12);
    border-color: #06b6d4;
    transform: translateX(4px);
}

.mapped-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}

.mapped-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.mapped-info {
    flex: 1;
    min-width: 0;
}

.mapped-name {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin: 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mapped-subtitle {
    font-size: 11px;
    color: #64748b;
    margin: 2px 0 0;
    font-weight: 500;
}

/* Requirement Section */
.requirement-section {
    background: #f8fafc;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #e2e8f0;
}

.requirement-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
}

.requirement-title {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.requirement-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.detail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.detail-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    min-width: 80px;
}

.detail-value {
    font-size: 12px;
    color: #1e293b;
    font-weight: 500;
    text-align: right;
    word-break: break-word;
}

.status-badge {
    font-weight: 600;
    font-size: 10px;
    height: 22px;
    padding: 0 8px;
    border-radius: 4px;
    text-transform: capitalize;
}

.status-badge.approved {
    background: #dcfce7 !important;
    color: #166534 !important;
}

.status-badge.rejected {
    background: #fee2e2 !important;
    color: #991b1b !important;
}

.status-badge.not_relevant {
    background: #fef3c7 !important;
    color: #92400e !important;
}

.status-badge.pending {
    background: #f1f5f9 !important;
    color: #475569 !important;
}

/* Empty State */
.no-mapped-controls {
    position: relative;
    margin-top: 8px;
}

.empty-state {
    background: white;
    border-radius: 10px;
    padding: 32px 24px;
    text-align: center;
    border: 2px dashed #e2e8f0;
}

.empty-text {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    margin: 12px 0 4px;
}

.empty-subtext {
    font-size: 12px;
    color: #94a3b8;
    margin: 0;
}

/* Expand Animation */
.expand-enter-active, .expand-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 2000px;
    overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
}
</style>