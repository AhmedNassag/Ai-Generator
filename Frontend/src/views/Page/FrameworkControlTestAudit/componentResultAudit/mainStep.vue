<template>
    <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('frameworkcontroltestaudit.frameworkcontroltestaudit')"
        :subPage="$t('frameworkcontroltestaudit.frameworkcontroltestaudit')"
        :titlePage="$t('frameworkcontroltestaudit.frameworkcontroltestaudit')">
        <template #datatable>

            <div class="card-body">
                <v-card class="stepper-container">
                    <v-stepper v-model="currentStep">
                        <v-stepper-header>
                            <template v-for="(step, i) in steps" :key="`step-${i}`">
                                <v-stepper-item :value="i + 1" :complete="currentStep > i + 1">
                                    {{ step.label }}
                                </v-stepper-item>
                                <v-divider v-if="i < steps.length - 1" :key="`divider-${i}`" />
                            </template>
                        </v-stepper-header>

                        <v-stepper-window v-model="currentStep">
                            <v-stepper-window-item v-for="(step, i) in steps" :key="`content-${i}`" :value="i + 1">
                                <component :is="step.component" v-if="isStepActive(i + 1)"
                                    :control-audit-data="controlAuditData" :user-data="Userlist" :team-data="Teamlist"
                                    :department-data="departmentslist" @update-data="handleUpdateData"
                                    :audit-logs="auditLogs" @requirement-updated="handleRequirementUpdate" />
                                <div class="d-flex justify-space-between mt-6">
                                    <v-btn v-if="i > 0" variant="outlined" color="info" @click="currentStep--">
                                        {{ $t('mainStep.back') }}
                                    </v-btn>
                                    <v-spacer v-if="i > 0"></v-spacer>
                                    <v-btn v-if="i < steps.length - 1" color="success" @click="currentStep++">
                                        {{ $t('mainStep.continue') }}
                                    </v-btn>
                                    <v-btn v-else color="success" to="/framework-control-test-audit/active-audit"
                                        router>
                                        {{ $t('mainStep.finish') }}
                                    </v-btn>
                                </div>
                            </v-stepper-window-item>
                        </v-stepper-window>
                    </v-stepper>
                </v-card>
            </div>
        </template>

    </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import AuditInfoComponent from "./AuditInfoComponent.vue";
import RequirementAchievementComponent from "./RequirementAchievementComponent.vue";
import AuditResultComponent from "./AuditResultComponent.vue";
import AuditRemidation from "./AuditRemidationComponent.vue";
import AuditTrail from "./AuditTrailComponent.vue";
import frameworkcontroltestaudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import user from "@/API/User/User";
import Team from "@/API/Team/Team";
import Department from "@/API/Department/Department";
import Log from "@/API/Log/Log";

export default {
    components: {
        MainPage,
        AuditInfoComponent,
        RequirementAchievementComponent,
        AuditResultComponent,
        AuditRemidation,
        AuditTrail,
    },
    data() {
        return {
            currentStep: 1,
            controlAuditData: null,
            Userlist: [],
            Teamlist: [],
            departmentslist: [],
            steps: [
                { label: this.$t('mainStep.audit_info'), component: "AuditInfoComponent" },
                { label: this.$t('mainStep.requirement_achievement'), component: "RequirementAchievementComponent" },
                { label: this.$t('mainStep.audit_result'), component: "AuditResultComponent" },
                { label: this.$t('mainStep.audit_remediation'), component: "AuditRemidation" },
                { label: this.$t('mainStep.audit_trail'), component: "AuditTrail" },
            ],
            requestLogs: [],
            userApi: new user(),
            teamApi: new Team(),
            DepartmentApi: new Department(),
            LogApi: new Log()

        };
    },
    async mounted() {
        try {
            await this.loadUserAndTeamLists();

            console.log("auditLogs", this.auditLogs);
            const api = new frameworkcontroltestaudit();
            const response = await api.show(this.$route.params.id, {
                with: ["control:id,short_name,description,family,domain_id,framework_id,parent_id,control_owner",
                    "audit:id,audit_name,regulator_id,end_audit_status,auditer_id,responsible_type,responsible,start_date,due_date,periodical_time,next_initiate_date,updated_at,created_at", "remediation"],
            });
            this.controlAuditData = response;

            console.log("respo", response)
        } catch (error) {
            console.error("Error loading data:", error);
        }
    },
    methods: {
        async loadUserAndTeamLists() {
            try {
                const [usersResponse, teamsResponse, departmentResponse] = await Promise.all([
                    this.userApi.getAll({ select: "id|full_name" }),
                    this.teamApi.getAll({ select: "id|name" }),
                    this.DepartmentApi.getAll({ select: "id|name" })
                ]);
                this.Userlist = usersResponse || [];
                this.Teamlist = teamsResponse || [];
                this.departmentslist = departmentResponse || [];
            } catch (error) {
                console.error("Error loading user and team lists:", error);
            }
        },
        async loadAuditLogs(page = 1, limit = 10) {
            try {
                this.logsLoading = true;
                const logsResponse = await this.LogApi.getLogMultiModels({
                    filter: `FrameworkControlTestAudit|old_data.id|${this.$route.params.id}||AuditRemidation|old_data.control_audit_id|${this.$route.params.id}`,
                    // filterOr:`class|AuditRemidation&&old_data.control_audit_id|${this.$route.params.id}`,
                });
                // Always replace the logs when loading
                this.auditLogs = logsResponse.data || [];

                console.log("Audit logs loaded:", this.auditLogs);
            } catch (error) {
                console.error("Error loading audit logs:", error);
            } finally {
                this.logsLoading = false;
            }
        },
        complete() {
            // Final submission or saving logic
            console.log("Final data:", this.controlAuditData);
        },
        handleUpdateData(updatedData) {
            this.controlAuditData = updatedData;
        },
        isStepActive(stepNumber) {
            return stepNumber === this.currentStep;
        },
        async handleRequirementUpdate(updateData) {
            try {
                // Refresh the data to get the latest status
                const api = new frameworkcontroltestaudit();
                const response = await api.show(this.$route.params.id, {
                    with: ["control", "audit", "remediation"],
                });
                this.controlAuditData = response;
            } catch (error) {
                console.error("Error refreshing data:", error);
            }
        },

    },
    watch: {
        currentStep(newVal) {
            if (newVal === 5) {
                this.loadAuditLogs();
            }
        }
    },
};
</script>

<style scoped></style>
