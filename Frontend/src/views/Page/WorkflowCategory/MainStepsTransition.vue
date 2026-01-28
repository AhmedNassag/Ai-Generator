<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'CONFIGURATIONS'" :mainSubPage="'workflowCategory'"
    :subPage="'Transition'" :titlePage="'workflow.workflow'">
    <template #datatable>
      <div class="workflow-container">
        <!-- Enhanced Header Section -->
        <div class="workflow-header-enhanced">
          <div class="header-navigation">
            <router-link :to="`/workflow-details/${this.$route.params.id}`" class="btn-back-enhanced"
              :title="$t('transition.back')">
              <i class="fas fa-arrow-left"></i>
              <span class="back-text">{{ $t("transition.back") }}</span>
            </router-link>
          </div>

          <div class="header-breadcrumb" v-if="workflow.steps && workflow.steps.length && filteredStep">
            <div class="workflow-diagram">
              <!-- Previous Steps (Incoming) -->
              <div class="incoming-steps" v-if="previousSteps.length">
                <div class="step-box incoming" v-for="(step, index) in previousSteps" :key="'incoming-' + index">
                  <div class="step-name">{{ step.name }}</div>
                  <div class="step-label">
                    {{ $t("transition.step") }}: {{ step.code || "In-Review" }}
                  </div>
                </div>
              </div>

              <!-- Connecting Lines from Incoming -->
              <div class="connection-container left" v-if="previousSteps.length">
                <svg class="connection-svg" :viewBox="previousSteps.length > 1 ? '0 0 150 200' : '0 0 150 100'
                  " preserveAspectRatio="none">
                  <path v-for="(step, index) in previousSteps" :key="'line-in-' + index" class="connect-line" :d="previousSteps.length > 1
                      ? `M 0,${50 + index * 100} C 50,${50 + index * 100
                      } 100,100 150,100`
                      : 'M 0,50 C 50,50 100,50 150,50'
                    " />
                </svg>
              </div>

              <!-- Current Step (Center) -->
              <div class="current-step-box" v-if="filteredStep">
                <div class="step-name">{{ filteredStep.name }}</div>
              </div>

              <!-- Connecting Lines to Outgoing -->
              <div class="connection-container right" v-if="
                filteredStep &&
                filteredStep.transitions &&
                filteredStep.transitions.length
              ">
                <svg class="connection-svg" :viewBox="filteredStep.transitions.length > 1
                    ? '0 0 150 200'
                    : '0 0 150 100'
                  " preserveAspectRatio="none">
                  <path v-for="(transition, index) in filteredStep.transitions" :key="'line-out-' + index"
                    class="connect-line" :d="filteredStep.transitions.length > 1
                        ? `M 0,100 C 50,100 100,${50 + index * 100} 150,${50 + index * 100
                        }`
                        : 'M 0,50 C 50,50 100,50 150,50'
                      " />
                </svg>
              </div>

              <!-- Outgoing Steps (Transitions) -->
              <div class="outgoing-steps" v-if="
                filteredStep &&
                filteredStep.transitions &&
                filteredStep.transitions.length
              ">
                <div class="step-box outgoing" v-for="transition in filteredStep.transitions" :key="transition.code">
                  <div class="step-name">
                    {{ transition.name || transition.to_step_name }}
                  </div>
                  <div class="step-label">
                    {{ $t("transition.step") }}: {{ transition.code || "Complete" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Single Form Container -->
        <form @submit.prevent="saveChanges" class="configuration-form">
          <!-- Document Fields Section -->
          <div class="form-section">
            <h2 class="section-heading">{{ $t("transition.document_form_fields") }}</h2>
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <span>{{ $t("transition.loading_fields") }}</span>
            </div>
            <div v-else-if="error" class="error-state">{{ error }}</div>
            <div v-else class="card">
              <table class="config-table">
                <thead>
                  <tr>
                    <th class="field-col">{{ $t("transition.field_name") }}</th>
                    <th class="toggle-col">
                      <div class="th-wrapper">
                        <span>{{ $t("transition.default") }}</span>
                        <label class="toggle-switch">
                          <input type="checkbox" @change="selectAllFields('default')" class="toggle-input" />
                          <span class="toggle-slider"></span>
                        </label>
                      </div>
                    </th>
                    <th class="toggle-col">
                      <div class="th-wrapper">
                        <span>{{ $t("transition.hidden") }}</span>
                        <label class="toggle-switch">
                          <input type="checkbox" @change="selectAllFields('hidden')" class="toggle-input" />
                          <span class="toggle-slider"></span>
                        </label>
                      </div>
                    </th>
                    <th class="toggle-col">
                      <div class="th-wrapper">
                        <span>{{ $t("transition.disabled") }}</span>
                        <label class="toggle-switch">
                          <input type="checkbox" @change="selectAllFields('disabled')" class="toggle-input" />
                          <span class="toggle-slider"></span>
                        </label>
                      </div>
                    </th>
                    <th class="toggle-col">
                      <div class="th-wrapper">
                        <span>{{ $t("transition.required") }}</span>
                        <label class="toggle-switch">
                          <input type="checkbox" @change="selectAllFields('required')" class="toggle-input" />
                          <span class="toggle-slider"></span>
                        </label>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="field in documentFields" :key="field.name">
                    <td class="field-name">{{ field.label || field.name }}</td>
                    <td class="toggle-cell">
                      <label class="toggle-switch">
                        <input type="radio" :name="'status_' + field.name" value="default" v-model="field.status"
                          class="toggle-input" />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                    <td class="toggle-cell">
                      <label class="toggle-switch">
                        <input type="radio" :name="'status_' + field.name" value="hidden" v-model="field.status"
                          class="toggle-input" />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                    <td class="toggle-cell">
                      <label class="toggle-switch">
                        <input type="radio" :name="'status_' + field.name" value="disabled" v-model="field.status"
                          class="toggle-input" />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                    <td class="toggle-cell">
                      <label class="toggle-switch">
                        <input type="radio" :name="'status_' + field.name" value="required" v-model="field.status"
                          class="toggle-input" />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Document Data Table Columns Section -->
          <div class="form-section">
            <h2 class="section-heading">{{ $t("transition.document_data_table_columns") }}</h2>
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <span>{{ $t("transition.loading_fields") }}</span>
            </div>
            <div v-else-if="error" class="error-state">{{ error }}</div>
            <div v-else class="card">
              <table class="config-table">
                <thead>
                  <tr>
                    <th class="field-col">{{ $t("transition.field_name") }}</th>
                    <th class="toggle-col-wide">
                      <div class="th-wrapper">
                        <span>{{ $t("transition.default") }}</span>
                        <label class="toggle-switch">
                          <input type="checkbox" @change="selectAllTableColumns('default')" class="toggle-input" />
                          <span class="toggle-slider"></span>
                        </label>
                      </div>
                    </th>
                    <th class="toggle-col-wide">
                      <div class="th-wrapper">
                        <span>{{ $t("transition.hidden") }}</span>
                        <label class="toggle-switch">
                          <input type="checkbox" @change="selectAllTableColumns('hidden')" class="toggle-input" />
                          <span class="toggle-slider"></span>
                        </label>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(field, index) in documentTableColumns" :key="index">
                    <td class="field-name">{{ field.title }}</td>
                    <td class="toggle-cell">
                      <label class="toggle-switch">
                        <input type="radio" :name="'table_status_' + field.name + '_' + index" value="default"
                          v-model="field.status" class="toggle-input" />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                    <td class="toggle-cell">
                      <label class="toggle-switch">
                        <input type="radio" :name="'table_status_' + field.name + '_' + index" value="hidden"
                          v-model="field.status" class="toggle-input" />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Combined Jobs and Custom Roles Access Control Section -->
          <div class="access-control-section">
            <div class="section-header-modern rtl">
              <div class="header-left rtl">
                <div class="icon-badge">
                  <i class="fas fa-users"></i>
                </div>
                <div>
                  <h3 class="section-title-modern">
                    {{ $t("transition.data_table_access_control") }}
                  </h3>
                  <p class="section-subtitle">
                    {{ $t("transition.data_table_access_control_desc") }}
                  </p>
                </div>
              </div>
              <div class="header-stats">
                <span class="stat-badge" v-if="datatable_job_ids.length">
                  {{ datatable_job_ids.length }} {{ $t("transition.jobs") }}
                </span>
                <span class="stat-badge stat-badge-success" v-if="datatable_custom_roles_control.length">
                  {{ datatable_custom_roles_control.length }} {{ $t("transition.roles") }}
                </span>
              </div>
            </div>

            <div class="combined-access-container">
              <div class="row">
                <!-- Jobs Column -->
                <div class="col-5">
                  <div class="access-column">
                    <div class="column-header rtl">
                      <i class="fas fa-briefcase"></i>
                      <span>{{ $t("transition.jobs_access") }}</span>
                    </div>

                    <div class="jobs-selector-wrapper">
                      <div class="input-label rtl">
                        <i class="fas fa-users-cog"></i>
                        <span>{{ $t("transition.select_authorized_jobs") }}</span>
                      </div>
                      <v-autocomplete v-model="datatable_job_ids" :items="jobList" item-title="name" item-value="id"
                        :label="$t('transition.select_jobs')" :placeholder="$t('transition.search_select_jobs')" variant="outlined"
                        density="comfortable" multiple chips closable-chips class="modern-autocomplete">
                        <template v-slot:chip="{ props, item }">
                          <v-chip v-bind="props" :text="item.raw.name" class="job-chip" closable></v-chip>
                        </template>
                      </v-autocomplete>

                      <div class="selected-items-display" v-if="datatable_job_ids.length">
                        <div class="display-header">
                          <i class="fas fa-check-circle"></i>
                          <span>{{ $t("transition.selected_jobs") }}</span>
                          <span class="count-badge">{{
                            datatable_job_ids.length
                          }}</span>
                        </div>
                        <div class="items-wrapper">
                          <div class="item-badge job-badge" v-for="jobId in datatable_job_ids" :key="jobId"
                            v-show="getJobName(jobId)">
                            <i class="fas fa-briefcase"></i>
                            <span>{{ getJobName(jobId) }}</span>
                            <button type="button" class="remove-item-btn" @click="removeJob(jobId)" :title="$t('transition.remove_job')">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Custom Roles Column -->
                <div class="col-5">
                  <div class="access-column">
                    <div class="column-header rtl">
                      <i class="fas fa-user-shield"></i>
                      <span>{{ $t("transition.custom_roles_access") }}</span>
                    </div>

                    <div class="jobs-selector-wrapper">
                      <div class="input-label rtl">
                        <i class="fas fa-users-cog"></i>
                        <span>{{ $t("transition.select_authorized_custom_roles") }}</span>
                      </div>
                      <v-autocomplete v-model="datatable_custom_roles_control" :items="allCustomRoles" item-title="name"
                        item-value="id" :label="$t('transition.select_custom_roles')" :placeholder="$t('transition.search_select_custom_roles')"
                        variant="outlined" density="comfortable" multiple chips closable-chips
                        class="modern-autocomplete">
                        <template v-slot:chip="{ props, item }">
                          <v-chip v-bind="props" :text="item.raw.name" class="role-chip" closable></v-chip>
                        </template>
                      </v-autocomplete>

                      <div class="selected-items-display" v-if="datatable_custom_roles_control.length">
                        <div class="display-header">
                          <i class="fas fa-check-circle"></i>
                          <span>{{ $t("transition.selected_custom_roles") }}</span>
                          <span class="count-badge">{{
                            datatable_custom_roles_control.length
                          }}</span>
                        </div>
                        <div class="items-wrapper">
                          <div class="item-badge role-badge" v-for="roleId in datatable_custom_roles_control"
                            :key="roleId" v-show="getRoleName(roleId)">
                            <i class="fas fa-user-shield"></i>
                            <span>{{ getRoleName(roleId) }}</span>
                            <button type="button" class="remove-item-btn" @click="removeRole(roleId)"
                              :title="$t('transition.remove_role')">
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Module Actions with Role and Job Mapping Section -->
          <div class="access-control-section">
            <div class="section-header-modern">
              <div class="header-left rtl">
                <div class="icon-badge icon-badge-purple">
                  <i class="fas fa-sliders-h"></i>
                </div>
                <div>
                  <h3 class="section-title-modern">{{ $t("transition.form_control_permissions") }}</h3>
                  <p class="section-subtitle">
                    {{ $t("transition.form_control_permissions_desc") }}
                  </p>
                </div>
              </div>
              <div class="header-stats" v-if="getSelectedModuleActionsCount() > 0">
                <span class="stat-badge stat-badge-info">{{ getSelectedModuleActionsCount() }} {{ $t("transition.actions_enabled") }}</span>
              </div>
            </div>

            <div class="module-actions-container">
              <div class="actions-toolbar">
                <div class="toolbar-left">
                  <i class="fas fa-cogs"></i>
                  <span>{{ $t("transition.configure_action_permissions") }} ({{
                    moduleActions.length
                  }})</span>
                </div>
                <div class="toolbar-right">
                  <button type="button" class="toolbar-btn" @click="selectAllModuleActions">
                    <i class="fas fa-check-double"></i>
                    {{ $t("transition.enable_all") }}
                  </button>
                  <button type="button" class="toolbar-btn toolbar-btn-secondary" @click="deselectAllModuleActions">
                    <i class="fas fa-ban"></i>
                    {{ $t("transition.disable_all") }}
                  </button>
                </div>
              </div>

              <div class="actions-grid">
                <div v-for="action in moduleActions" :key="action.id" class="action-card"
                  :class="{ 'is-enabled': action.selected }">
                  <div class="action-header">
                    <div class="action-toggle">
                      <label class="action-switch">
                        <input type="checkbox" v-model="action.selected" @change="onActionToggle(action)" />
                        <span class="action-slider"></span>
                      </label>
                    </div>

                    <div class="action-info">
                      <div class="action-icon">
                        <i class="fas fa-cog"></i>
                      </div>
                      <div class="action-details">
                        <h4 class="action-name">{{ action.name }}</h4>
                        <span class="action-status" :class="action.selected
                            ? 'status-enabled'
                            : 'status-disabled'
                          ">
                          <i :class="action.selected
                              ? 'fas fa-toggle-on'
                              : 'fas fa-toggle-off'
                            "></i>
                          {{ action.selected ? $t("transition.enabled") : $t("transition.disabled") }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Role and Job Mapping for this action -->
                  <div class="action-permissions" v-if="action.selected">
                    <!-- Custom Roles Section -->
                    <div class="permission-section">
                      <div class="roles-header rtl">
                        <i class="fas fa-user-tag"></i>
                        <span>{{ $t("transition.assign_to_custom_roles") }}</span>
                        <span class="roles-count">({{ getActionRolesCount(action) }})</span>
                      </div>

                      <!-- Selected Roles Display -->
                      <div class="selected-roles-display" v-if="getActionRolesCount(action) > 0">
                        <div class="selected-roles-wrapper">
                          <span v-for="roleId in action.assignedRoles" :key="roleId" v-show="getRoleName(roleId)"
                            class="selected-role-badge">
                            <i class="fas fa-user-shield"></i>
                            <span>{{ getRoleName(roleId) }}</span>
                            <button type="button" class="remove-role-btn" @click="removeRoleFromAction(action, roleId)"
                              :title="$t('transition.remove_role')">
                              <i class="fas fa-times"></i>
                            </button>
                          </span>
                        </div>
                      </div>

                      <div class="roles-selection">
                        <div class="input-label rtl">
                          <i class="fas fa-user-shield"></i>
                          <span>{{ $t("transition.select_roles_for_action") }}</span>
                        </div>
                        <v-autocomplete v-model="action.assignedRoles" :items="filteredCustomRolesForActions"
                          item-title="name" item-value="id" :label="$t('transition.select_roles_for') + ' ' + action.name"
                          :placeholder="$t('transition.search_select_roles')" variant="outlined" density="comfortable" multiple
                          chips closable-chips class="modern-autocomplete">
                          <template v-slot:chip="{ props, item }">
                            <v-chip v-bind="props" :text="item.raw.name" class="role-chip" closable></v-chip>
                          </template>
                        </v-autocomplete>
                      </div>
                    </div>

                    <!-- Jobs Section -->
                    <div class="permission-section">
                      <div class="roles-header rtl">
                        <i class="fas fa-briefcase"></i>
                        <span>{{ $t("transition.assign_to_jobs") }}</span>
                        <span class="roles-count">({{ getActionJobsCount(action) }})</span>
                      </div>

                      <div class="selected-roles-display" v-if="getActionJobsCount(action) > 0">
                        <div class="selected-roles-wrapper">
                          <span v-for="jobId in action.assignedJobs" :key="jobId" v-show="getJobName(jobId)"
                            class="selected-role-badge">
                            <i class="fas fa-briefcase"></i>
                            <span>{{ getJobName(jobId) }}</span>
                            <button type="button" class="remove-role-btn" @click="removeJobFromAction(action, jobId)"
                              :title="$t('transition.remove_job')">
                              <i class="fas fa-times"></i>
                            </button>
                          </span>
                        </div>
                      </div>

                      <div class="roles-selection">
                        <div class="input-label rtl">
                          <i class="fas fa-briefcase"></i>
                          <span>{{ $t("transition.select_jobs_for_action") }}</span>
                        </div>
                        <v-autocomplete v-model="action.assignedJobs" :items="filteredJobsForActions" item-title="name"
                          item-value="id" :label="$t('transition.select_jobs_for') + ' ' + action.name"
                          :placeholder="$t('transition.search_select_jobs')" variant="outlined" density="comfortable" multiple
                          chips closable-chips class="modern-autocomplete">
                          <template v-slot:chip="{ props, item }">
                            <v-chip v-bind="props" :text="item.raw.name" class="job-chip" closable></v-chip>
                          </template>
                        </v-autocomplete>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="cancel">
              {{ $t("transition.cancel") }}
            </button>
            <button type="submit" class="btn btn-save" :disabled="loading">
              <span v-if="!loading">{{ $t("transition.save_configuration") }}</span>
              <span v-else>{{ $t("transition.saving") }}</span>
            </button>
          </div>
        </form>
      </div>
    </template>
  </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import category from "@/API/WorkflowCategory/WorkflowCategory";
import workflows from "@/API/WorkflowCategory/workflows";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import Job from "@/API/Job/Job";

export default {
  setup() {
    const jobApi = new Job();
    return { jobApi };
  },
  components: {
    MainPage,
  },
  props: ["id", "code"],
  async mounted() {
    this.jobList = await this.jobApi.getAll();
    this.fetchDataWorkflow(
      this.$route.params.id,
      this.$route.params.transitionCode
    );
  },
  computed: {
    previousSteps() {
      if (!this.workflow.steps || !this.filteredStep) return [];
      return this.workflow.steps.filter((step) =>
        (step.transitions || []).some(
          (transition) => transition.to_step_name === this.filteredStep.name
        )
      );
    },
    // Filter custom roles based on what's selected in Data Table Access Control
    filteredCustomRolesForActions() {
      if (
        !this.datatable_custom_roles_control ||
        this.datatable_custom_roles_control.length === 0
      ) {
        return [];
      }
      return this.allCustomRoles.filter((role) =>
        this.datatable_custom_roles_control.includes(role.id)
      );
    },
    // Filter jobs based on what's selected in Data Table Access Control
    filteredJobsForActions() {
      if (!this.datatable_job_ids || this.datatable_job_ids.length === 0) {
        return [];
      }
      return this.jobList.filter((job) =>
        this.datatable_job_ids.includes(job.id)
      );
    },
  },
  watch: {
    // Watch for changes in datatable_custom_roles_control
    datatable_custom_roles_control: {
      handler(newRoles, oldRoles) {
        this.syncRolesWithModuleActions(newRoles, oldRoles);
      },
      deep: true,
    },
    // Watch for changes in datatable_job_ids
    datatable_job_ids: {
      handler(newJobs, oldJobs) {
        this.syncJobsWithModuleActions(newJobs, oldJobs);
      },
      deep: true,
    },
  },
  data() {
    return {
      previousTransitions: [],
      categories: [],
      isFlipped: false,
      workflow: [],
      filteredStep: null,
      incomingTransitions: [],
      currentStepName: "",
      documentFields: [],
      datatable_custom_roles_control: [],
      allCustomRoles: [],
      moduleActions: [],
      documentTableColumns: [],
      loading: false,
      error: null,
      category: new category(),
      workflowService: new workflows(),
      modelType: "",
      createI18n: new createI18n(),
      datatable_job_ids: [],
      jobList: [],
    };
  },
  methods: {
    async fetchModelFields() {
      this.loading = true;
      this.error = null;
      try {
        this.modelType = this.workflow.workflow_category.model_type;
        let component;

        component = (
          await import(`@/views/Page/${this.modelType}/${this.modelType}.vue`)
        ).default;
        const container = document.createElement("div");
        const app = createApp(component);
        app.use(this.createI18n);
        const vm = app.mount(container);

        this.documentFields = (vm.fromFields || []).filter(
          (field) => field.workFlow !== false
        );
        this.documentTableColumns = (
          vm.defaultColumns ||
          vm.tableColumns ||
          []
        ).filter((field) => field.workFlow !== false);
        this.allCustomRoles = (vm.customRoles || []).filter(
          (field) => field.workFlow !== false
        );

        this.moduleActions = (vm.moduleActions || [])
          .filter((field) => field.workFlow !== false)
          .map((action) => ({
            ...action,
            selected: false,
            assignedRoles: [],
            assignedJobs: [],
          }));

        console.log("Document Fields:", this.documentFields);
        console.log("Document Table Columns:", this.documentTableColumns);
        console.log("All Custom Roles:", this.allCustomRoles);
        console.log("Module Actions:", this.moduleActions);

        app.unmount();
      } catch (error) {
        this.error = "Failed to load model fields: " + error.message;
        console.error("Error loading model fields:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchDataWorkflow(id, transitionCode) {
      try {
        const response = await this.workflowService.getAll({
          filter: `id|${id}|=`,
          with: ["workflowCategory"],
        });
        console.log("response:", response);

        if (Array.isArray(response) && response.length > 0) {
          this.workflow = response[0];
          await Promise.all([this.fetchModelFields()]);
          this.transitionCode = transitionCode;

          const matchingStep = this.workflow.steps.find(
            (step) => step.code == transitionCode
          );

          if (matchingStep) {
            this.filteredStep = matchingStep;

            // Load and filter datatable_job_ids - remove invalid job IDs
            const rawJobIds = matchingStep.datatable_job_ids || [];
            this.datatable_job_ids = rawJobIds.filter((jobId) =>
              this.jobList.some((j) => j.id == jobId)
            );

            // Load and filter datatable custom roles - remove invalid role IDs
            const rawRoleIds =
              matchingStep.datatable_custom_roles_control || [];
            this.datatable_custom_roles_control = rawRoleIds.filter((roleId) =>
              this.allCustomRoles.some((r) => r.id == roleId)
            );

            // Load module actions control with role and job assignments
            if (
              matchingStep.module_actions_control &&
              Array.isArray(matchingStep.module_actions_control)
            ) {
              this.moduleActions = this.moduleActions.map((action) => {
                const savedAction = matchingStep.module_actions_control.find(
                  (a) => (a._id || a.id) === action.id || a.name === action.name
                );

                // Filter out invalid role and job IDs
                let validRoles = [];
                let validJobs = [];

                if (savedAction && savedAction.assignedRoles) {
                  validRoles = savedAction.assignedRoles.filter((roleId) =>
                    this.allCustomRoles.some((r) => r.id == roleId)
                  );
                }

                if (savedAction && savedAction.assignedJobs) {
                  validJobs = savedAction.assignedJobs.filter((jobId) =>
                    this.jobList.some((j) => j.id == jobId)
                  );
                }

                return {
                  ...action,
                  selected: savedAction
                    ? savedAction.selected === "true" ||
                    savedAction.selected === true
                    : false,
                  assignedRoles: validRoles,
                  assignedJobs: validJobs,
                };
              });
            }

            // Load document fields
            if (matchingStep.fields) {
              this.documentFields = this.documentFields.map((field) => {
                const existingField = matchingStep.fields.find(
                  (f) => f.name === field.name
                );
                return {
                  ...field,
                  status: existingField ? existingField.status : field.status,
                };
              });
            }

            // Load table columns
            if (
              Array.isArray(matchingStep.tableColumns) &&
              matchingStep.tableColumns.length
            ) {
              this.documentTableColumns = this.documentTableColumns.map(
                (column, index) => {
                  const existingColumn =
                    matchingStep.tableColumns.find(
                      (c) => c.name === column.name || c.name === column.title
                    ) || matchingStep.tableColumns[index];
                  return {
                    ...column,
                    status: existingColumn.status,
                  };
                }
              );
            }

            this.previousTransitions = [];
            this.workflow.steps.forEach((step) => {
              step.transitions.forEach((transition) => {
                if (transition.to_step_name === this.filteredStep.name) {
                  this.previousTransitions.push(transition.name);
                }
              });
            });
          } else {
            this.filteredStep = null;
            this.previousTransitions = [];
          }
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Error fetching workflow details:", error);
      }
    },

    async saveChanges() {
      this.loading = true;
      try {
        if (!this.workflow || !this.workflow.steps) {
          throw new Error("Workflow or steps not found");
        }

        const updatedWorkflow = {
          _id: this.workflow._id,
          name: this.workflow.name || "Untitled Workflow",
          isActive: this.workflow.isActive || "1",
          workflowCategory_id: this.workflow.workflowCategory_id || "",
          steps: this.workflow.steps.map((step) => {
            if (step.code == this.filteredStep.code) {
              return {
                datatable_job_ids:
                  this.datatable_job_ids && this.datatable_job_ids.length > 0
                    ? this.datatable_job_ids
                    : null,
                datatable_custom_roles_control:
                  this.datatable_custom_roles_control &&
                    this.datatable_custom_roles_control.length > 0
                    ? this.datatable_custom_roles_control
                    : null,
                module_actions_control: this.moduleActions.map((action) => ({
                  _id: action.id,
                  selected: action.selected ? "true" : "false",
                  assignedRoles: action.assignedRoles || [],
                  assignedJobs: action.assignedJobs || [],
                })),
                name: step.name,
                code: step.code,
                transitions: step.transitions || [],
                fields: this.documentFields.map((field) => ({
                  name: field.name,
                  status: field.status,
                })),
                tableColumns: this.documentTableColumns.map((column) => ({
                  id: column.id || null,
                  name: column.name || column.title,
                  title: column.title,
                  status: column.status,
                })),
              };
            } else {
              return {
                name: step.name,
                code: step.code,
                transitions: step.transitions || [],
                fields: step.fields || [],
                tableColumns: step.tableColumns || [],
                datatable_job_ids:
                  step.datatable_job_ids && step.datatable_job_ids.length > 0
                    ? step.datatable_job_ids
                    : null,
                datatable_custom_roles_control:
                  step.datatable_custom_roles_control &&
                    step.datatable_custom_roles_control.length > 0
                    ? step.datatable_custom_roles_control
                    : null,
                module_actions_control: step.module_actions_control || [],
              };
            }
          }),
          code: this.workflow.code,
          updated_at: new Date().toISOString(),
          created_at: this.workflow.created_at,
        };

        console.log("Sending updated workflow:", updatedWorkflow);

        const response = await this.workflowService.from({
          id: this.workflow.id,
          ...updatedWorkflow,
        });

        if (response) {
          console.log("Workflow updated successfully:", response);
          this.$toast?.success?.("Configuration saved successfully!");
          await this.fetchDataWorkflow(
            this.$route.params.id,
            this.$route.params.transitionCode
          );
        }
      } catch (error) {
        console.error("Error saving changes:", error);
        this.error = "Failed to save changes: " + error.message;
        this.$toast?.error?.("Failed to save configuration!");
      } finally {
        this.loading = false;
      }
    },

    cancel() {
      this.fetchModelFields();
      this.fetchDataWorkflow(
        this.$route.params.id,
        this.$route.params.transitionCode
      );
    },

    // Sync roles between Custom Roles Access and Module Actions
    syncRolesWithModuleActions(newRoles, oldRoles) {
      const removedRoles = oldRoles.filter(
        (roleId) => !newRoles.includes(roleId)
      );

      if (removedRoles.length > 0) {
        let totalRemoved = 0;

        this.moduleActions.forEach((action) => {
          if (action.assignedRoles && action.assignedRoles.length > 0) {
            const beforeCount = action.assignedRoles.length;
            action.assignedRoles = action.assignedRoles.filter(
              (roleId) => !removedRoles.includes(roleId)
            );
            totalRemoved += beforeCount - action.assignedRoles.length;
          }
        });

        if (totalRemoved > 0) {
          this.$toast?.info?.(
            `Removed ${totalRemoved} role assignment(s) from module actions`
          );
        }
      }
    },

    // Sync jobs between Jobs Access and Module Actions
    syncJobsWithModuleActions(newJobs, oldJobs) {
      const removedJobs = oldJobs.filter((jobId) => !newJobs.includes(jobId));

      if (removedJobs.length > 0) {
        let totalRemoved = 0;

        this.moduleActions.forEach((action) => {
          if (action.assignedJobs && action.assignedJobs.length > 0) {
            const beforeCount = action.assignedJobs.length;
            action.assignedJobs = action.assignedJobs.filter(
              (jobId) => !removedJobs.includes(jobId)
            );
            totalRemoved += beforeCount - action.assignedJobs.length;
          }
        });

        if (totalRemoved > 0) {
          this.$toast?.info?.(
            `Removed ${totalRemoved} job assignment(s) from module actions`
          );
        }
      }
    },

    // Datatable Custom Roles methods
    removeRole(roleId) {
      const index = this.datatable_custom_roles_control.indexOf(roleId);
      if (index > -1) {
        this.datatable_custom_roles_control.splice(index, 1);
        this.removeRoleFromAllActions(roleId);
      }
    },

    removeRoleFromAllActions(roleId) {
      this.moduleActions.forEach((action) => {
        if (action.assignedRoles && action.assignedRoles.length > 0) {
          const roleIndex = action.assignedRoles.indexOf(roleId);
          if (roleIndex > -1) {
            action.assignedRoles.splice(roleIndex, 1);
          }
        }
      });
    },

    // Datatable Jobs methods
    removeJob(jobId) {
      const index = this.datatable_job_ids.indexOf(jobId);
      if (index > -1) {
        this.datatable_job_ids.splice(index, 1);
        this.removeJobFromAllActions(jobId);
      }
    },

    removeJobFromAllActions(jobId) {
      this.moduleActions.forEach((action) => {
        if (action.assignedJobs && action.assignedJobs.length > 0) {
          const jobIndex = action.assignedJobs.indexOf(jobId);
          if (jobIndex > -1) {
            action.assignedJobs.splice(jobIndex, 1);
          }
        }
      });
    },

    // Module Actions methods
    selectAllModuleActions() {
      this.moduleActions.forEach((action) => {
        action.selected = true;
      });
    },

    deselectAllModuleActions() {
      this.moduleActions.forEach((action) => {
        action.selected = false;
        action.assignedRoles = [];
        action.assignedJobs = [];
      });
    },

    getSelectedModuleActionsCount() {
      return this.moduleActions.filter((action) => action.selected).length;
    },

    onActionToggle(action) {
      if (!action.selected) {
        action.assignedRoles = [];
        action.assignedJobs = [];
      }
    },

    // Role-Action Mapping methods
    getActionRolesCount(action) {
      if (!action.assignedRoles) return 0;
      // Filter out roles that don't exist
      return action.assignedRoles.filter((roleId) =>
        this.allCustomRoles.some((r) => r.id == roleId)
      ).length;
    },

    getRoleName(roleId) {
      if (!roleId || !this.allCustomRoles || this.allCustomRoles.length === 0) {
        return "";
      }
      const role = this.allCustomRoles.find((r) => r.id == roleId);
      return role ? role.name : "";
    },

    removeRoleFromAction(action, roleId) {
      const index = action.assignedRoles.indexOf(roleId);
      if (index > -1) {
        action.assignedRoles.splice(index, 1);
      }
    },

    // Job-Action Mapping methods
    getActionJobsCount(action) {
      if (!action.assignedJobs) return 0;
      // Filter out jobs that don't exist
      return action.assignedJobs.filter((jobId) =>
        this.jobList.some((j) => j.id == jobId)
      ).length;
    },

    getJobName(jobId) {
      if (!jobId || !this.jobList || this.jobList.length === 0) {
        return "";
      }
      const job = this.jobList.find((j) => j.id == jobId);
      return job ? job.name : "";
    },

    removeJobFromAction(action, jobId) {
      const index = action.assignedJobs.indexOf(jobId);
      if (index > -1) {
        action.assignedJobs.splice(index, 1);
      }
    },

    selectAllFields(status) {
      this.documentFields = this.documentFields.map((field) => ({
        ...field,
        status: status,
      }));
    },

    selectAllTableColumns(status) {
      this.documentTableColumns = this.documentTableColumns.map((column) => ({
        ...column,
        status: status,
      }));
    },
  },
};
</script>
<style scoped>
.workflow-container {
  padding: 20px;
}

.workflow-steps {
  margin-bottom: 30px;
}

.main-step {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.draft-status {
  background-color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  color: white;
  margin-right: 20px;
}

.transitions {
  display: flex;
  align-items: center;
}

.transition {
  display: flex;
  align-items: center;
}

.arrow {
  margin: 0 5px;
}

.to-step {
  margin-left: 5px;
}

.document-fields table,
.document-custom-properties table {
  width: 100%;
  border-collapse: collapse;
}

.document-fields th,
.document-fields td,
.document-custom-properties th,
.document-custom-properties td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.buttons {
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save {
  background-color: #ff6b00;
  color: white;
}

.cancel {
  background-color: #666;
  color: white;
}

.workflow-container {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
  padding: 20px;
  text-align: center;
}

.document-fields table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.document-fields th,
.document-fields td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.document-fields th {
  background-color: #f5f5f5;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.save,
.cancel {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.save {
  background-color: #4caf50;
  color: white;
  border: none;
}

.cancel {
  background-color: #f44336;
  color: white;
  border: none;
}
</style>
<style scoped>
.workflow-container {
  padding: 20px;
  color: #333;
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
  background-color: #ffffff;
}

.workflow-steps {
  display: flex;
}

/* Enhanced Header Styles */
.workflow-header-enhanced {
  margin: -20px -20px 30px -20px;
  padding: 25px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 20px 20px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.header-navigation {
  display: flex;
  align-items: center;
}

.btn-back-enhanced {
  background: #9e9d9d !important;
  color: black !important;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-decoration: none;
  padding: 10px 16px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-back-enhanced:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  text-decoration: none;
  transform: translateX(-3px);
}

.btn-back-enhanced i {
  font-size: 16px;
  padding-right: 3px;
}

.back-text {
  font-size: 14px;
  font-weight: 600;
}

.header-breadcrumb {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* Main Container */
.workflow-container {
  padding: 20px;
  color: #333;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Configuration Form */
.configuration-form {
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI,
    system-ui, sans-serif;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  margin-top: 20px;
}

/* Form Sections */
.form-section {
  margin-bottom: 24px;
}

.section-heading {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

/* Card Container */
.card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e5e5;
}

/* Table Styles */
.config-table {
  width: 100%;
  border-collapse: collapse;
}

.config-table thead {
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.config-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.field-col {
  width: 25%;
}

.toggle-col {
  width: 18.75%;
  text-align: center;
}

.toggle-col-wide {
  width: 37.5%;
  text-align: center;
}

.th-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* Table Body */
.config-table tbody tr {
  border-bottom: 1px solid #e5e5e5;
}

.config-table tbody tr:last-child {
  border-bottom: none;
}

.config-table td {
  padding: 16px 20px;
  font-size: 15px;
  color: #1d1d1f;
}

.field-name {
  font-weight: 500;
}

.toggle-cell {
  text-align: center;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-flex;
  width: 35px;
  height: 20px;
  cursor: pointer;
  vertical-align: middle;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d1d6;
  border-radius: 26px;
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  height: 12px;
  width: 12px;
  left: 2px;
  top: 3px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.toggle-input:checked+.toggle-slider {
  background: #43235c;
}

.toggle-input:checked+.toggle-slider::before {
  transform: translateX(18px);
}

.toggle-switch:hover .toggle-slider {
  background: #c1c1c6;
}

.toggle-switch:hover .toggle-input:checked+.toggle-slider {
  background: #43235c;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  color: #86868b;
  font-size: 15px;
  background: #ffffff;
  border-radius: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e5e5;
  border-top-color: #43235c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  padding: 16px 20px;
  background: #fff5f5;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

/* Workflow Diagram */
.workflow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  overflow-x: auto;
}

.incoming-steps,
.outgoing-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 200px;
}

.step-box {
  background: #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.step-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #d1d5db;
}

.step-box .step-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.step-box .step-label {
  font-size: 13px;
  color: #000;
  font-weight: 500;
}

/* Current Step */
.current-step-box {
  background: #43235c;
  color: white;
  border-radius: 16px;
  padding: 24px 40px;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(91, 33, 182, 0.3);
  min-width: 200px;
  text-align: center;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.current-step-box:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(91, 33, 182, 0.4);
}

.current-step-box .step-name {
  font-size: 20px;
  line-height: 1.3;
}

/* Connection Lines */
.connection-container {
  width: 120px;
  height: auto;
  min-height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  z-index: 1;
  flex-shrink: 0;
}

.connection-svg {
  width: 100%;
  height: 100%;
  min-height: 100px;
}

.connect-line {
  fill: none;
  stroke: #d1d5db;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke 0.3s ease;
}

.workflow-diagram:hover .connect-line {
  stroke: #9ca3af;
}

/* Access Control Section */
.access-control-section {
  margin-bottom: 3rem;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.icon-badge-purple {
  background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%);
}

.section-title-modern {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0.25rem 0 0 0;
}

.header-stats {
  display: flex;
  gap: 0.75rem;
}

.stat-badge {
  padding: 0.5rem 1rem;
  background: #e7f3ff;
  color: #43235c;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-badge-success {
  background: #d4edda;
  color: #155724;
}

.stat-badge-info {
  background: #d1ecf1;
  color: #0c5460;
}

/* Combined Access Container */
.combined-access-container {
  padding: 1rem;
}

.row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.col-5 {
  flex: 1;
  min-width: 400px;
}

.access-column {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #dee2e6;
}

.jobs-selector-wrapper {
  margin-top: 1rem;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.75rem;
}

.modern-autocomplete {
  margin-bottom: 1.5rem;
}

/* Selected Items Display */
.selected-items-display {
  margin-top: 1.5rem;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.display-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.count-badge {
  background: #43235c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: auto;
}

.items-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.item-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  border: 1px solid #dee2e6;
}

.job-badge {
  border-left: 3px solid #43235c;
}

.role-badge {
  border-left: 3px solid #43235c;
}

.remove-item-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.remove-item-btn:hover {
  transform: scale(1.2);
}

/* Module Actions Container */
.module-actions-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.actions-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #495057;
}

.toolbar-right {
  display: flex;
  gap: 0.75rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #43235c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.toolbar-btn-secondary {
  background: #6c757d;
}

.toolbar-btn-secondary:hover {
  background: #5a6268;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s;
}

.action-card.is-enabled {
  border-color: #43235c;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-toggle {
  flex-shrink: 0;
}

.action-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.action-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.action-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 28px;
}

.action-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.action-switch input:checked+.action-slider {
  background-color: #43235c;
}

.action-switch input:checked+.action-slider:before {
  transform: translateX(22px);
}

.action-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.action-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
}

.action-details {
  flex: 1;
}

.action-name {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 0.25rem 0;
}

.action-status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.status-enabled {
  background: #d4edda;
  color: #155724;
}

.status-disabled {
  background: #f8d7da;
  color: #721c24;
}

/* Action Roles */
.action-roles {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.roles-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
}

.roles-count {
  color: #43235c;
  font-size: 0.875rem;
}

.selected-roles-display {
  margin-bottom: 1rem;
}

.selected-roles-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-role-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #edf1f5;
  color: #43235c;
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.remove-role-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.remove-role-btn:hover {
  transform: scale(1.3);
}

.roles-selection {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

/* Form Actions */
.form-actions {
 display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap; /* Prevent text wrapping */
  min-width: 120px; /* Ensure minimum button width */
  display: inline-flex; /* Use flexbox for better alignment */
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1200px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .workflow-container {
    padding: 1rem;
  }

  .col-5 {
    min-width: 100%;
  }

  .section-header-modern {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .workflow-diagram {
    flex-direction: column;
  }
}
</style>
