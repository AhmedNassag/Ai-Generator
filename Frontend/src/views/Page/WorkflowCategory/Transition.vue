<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'Category.Category'" :subPage="'workflow.workflow'"
    :titlePage="'workflow.workflow'">
    <template #datatable>
      <div class="transition-editor">
        <!-- Loading Overlay -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="spinner"></div>
            <p class="loading-text">{{ $t("transitioneditor.loading_transition_details") }}</p>
          </div>
        </div>

        <!-- Workflow Visualization -->
        <div class="workflow-visualization">
          <div class="container-fluid">
            <!-- Transition Flow -->
            <div class="transition-flow">
              <div class="flow-step from-step">
                <div class="step-indicator">
                  <div class="step-icon">
                    <i class="fas fa-play-circle"></i>
                  </div>
                  <div class="step-label">{{ $t("transitioneditor.from") }}</div>
                </div>
                <div class="step-content">
                  <h3>{{ fromStep || "N/A" }}</h3>
                  <p>{{ $t("transitioneditor.source_step") }}</p>
                </div>
              </div>

              <div class="flow-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-head">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>

              <div class="flow-transition">
                <div class="transition-indicator">
                  <div class="transition-icon">
                    <i class="fas fa-exchange-alt"></i>
                  </div>
                  <div class="transition-label">{{ $t("transitioneditor.transition") }}</div>
                </div>
                <div class="transition-content">
                  <h3>{{ transitionName || $t("transitioneditor.unnamed") }}</h3>
                  <p v-if="transitionNameCode">{{ transitionNameCode }}</p>
                </div>
              </div>

              <div class="flow-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-head">
                  <i class="fas fa-chevron-right"></i>
                </div>
              </div>

              <div class="flow-step to-step">
                <div class="step-indicator">
                  <div class="step-icon">
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <div class="step-label">{{ $t("transitioneditor.to") }}</div>
                </div>
                <div class="step-content">
                  <h3>{{ toStep || "N/A" }}</h3>
                  <p>{{ $t("transitioneditor.destination_step") }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transition Configuration -->
        <div class="transition-configuration">
          <div class="config-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="fas fa-cog"></i>
              </div>
              <div class="section-title">
                <h2>{{ $t("transitioneditor.transition_configuration") }}</h2>
                <p>{{ $t("transitioneditor.transition_configuration_desc") }}</p>
              </div>
            </div>

            <div class="config-form">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-tag"></i>
                  {{ $t("transitioneditor.transition_name") }}
                  <span class="required">*</span>
                </label>
                <div class="input-group">
                  <input type="text" v-model="transitionName" class="form-input" :placeholder="$t('transitioneditor.enter_transition_name')"
                    @input="handleInputChange" />
                  <div class="input-icon">
                    <i class="fas fa-pen"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Permissions Section -->
          <div class="permissions-section">
            <div class="section-header">
              <div class="section-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <div class="section-title">
                <h2>{{ $t("transitioneditor.access_permissions") }}</h2>
                <p>{{ $t("transitioneditor.access_permissions_desc") }}</p>
              </div>
            </div>

            <div class="permissions-grid">
              <!-- Jobs Permissions -->
              <div class="permission-card">
                <div class="permission-header">
                  <div class="permission-title">
                    <div class="title-icon jobs-icon">
                      <i class="fas fa-briefcase"></i>
                    </div>
                    <div>
                      <h3>{{ $t("transitioneditor.jobs") }}</h3>
                      <p>{{ $t("transitioneditor.role_based_permissions") }}</p>
                    </div>
                  </div>
                  <div class="permission-actions">
                    <div class="selection-badge">
                      {{ selectedJobsCount }}/{{ filteredJobs.length }}
                    </div>
                    <button v-if="filteredJobs.length > 0" @click="toggleAllJobs" class="btn-toggle">
                      <i :class="allJobsSelected ? 'fas fa-times' : 'fas fa-check'"></i>
                      {{ allJobsSelected ? $t("transitioneditor.deselect_all") : $t("transitioneditor.select_all") }}
                    </button>
                  </div>
                </div>

                <div class="permission-content">
                  <div v-if="filteredJobs.length > 0" class="permission-list">
                    <div v-for="job in filteredJobs" :key="job.id" class="permission-item"
                      :class="{ selected: job.selected }" @click="toggleJob(job)">
                      <div class="permission-checkbox">
                        <input type="checkbox" v-model="job.selected" :id="`job-${job.id}`"
                          @change="handleInputChange" />
                        <div class="checkbox-custom">
                          <i class="fas fa-check"></i>
                        </div>
                      </div>
                      <label :for="`job-${job.id}`" class="permission-label">
                        <div class="permission-icon">
                          <i class="fas fa-briefcase"></i>
                        </div>
                        <span class="permission-name">{{ job.name }}</span>
                      </label>
                    </div>
                  </div>
                  <div v-else class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>{{ $t("transitioneditor.no_jobs_available") }}</p>
                    <span>{{ $t("transitioneditor.configure_jobs_in_workflow") }}</span>
                  </div>
                </div>
              </div>

              <!-- Custom Roles Permissions -->
              <div class="permission-card">
                <div class="permission-header">
                  <div class="permission-title">
                    <div class="title-icon roles-icon">
                      <i class="fas fa-user-tag"></i>
                    </div>
                    <div>
                      <h3>{{ $t("transitioneditor.custom_roles") }}</h3>
                      <p>{{ $t("transitioneditor.custom_permission_sets") }}</p>
                    </div>
                  </div>
                  <div class="permission-actions">
                    <div class="selection-badge">
                      {{ selectedCustomRolesCount }}/{{ filteredCustomRoles.length }}
                    </div>
                    <button v-if="filteredCustomRoles.length > 0" @click="toggleAllCustomRoles" class="btn-toggle">
                      <i :class="allCustomRolesSelected ? 'fas fa-times' : 'fas fa-check'"></i>
                      {{ allCustomRolesSelected ? $t("transitioneditor.deselect_all") : $t("transitioneditor.select_all") }}
                    </button>
                  </div>
                </div>

                <div class="permission-content">
                  <div v-if="filteredCustomRoles.length > 0" class="permission-list">
                    <div v-for="role in filteredCustomRoles" :key="role.id" class="permission-item"
                      :class="{ selected: role.selected }" @click="toggleCustomRole(role)">
                      <div class="permission-checkbox">
                        <input type="checkbox" v-model="role.selected" :id="`role-${role.id}`"
                          @change="handleInputChange" />
                        <div class="checkbox-custom">
                          <i class="fas fa-check"></i>
                        </div>
                      </div>
                      <label :for="`role-${role.id}`" class="permission-label">
                        <div class="permission-icon">
                          <i class="fas fa-user-tag"></i>
                        </div>
                        <span class="permission-name">{{ role.name }}</span>
                      </label>
                    </div>
                  </div>
                  <div v-else class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>{{ $t("transitioneditor.no_custom_roles_available") }}</p>
                    <span>{{ $t("transitioneditor.configure_roles_in_workflow") }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Action Buttons -->
            <div class="actions-modern" v-if="isDataChanged">
              <button @click="saveTransition" class="btn-save-modern" :disabled="isSaving">
                <i :class="isSaving ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                <span>{{ isSaving ? $t("transitioneditor.saving_changes") : $t("transitioneditor.update_transition") }}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </template>
  </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Workflows from "@/API/WorkflowCategory/workflows";
import WorkflowCategory from "@/API/WorkflowCategory/WorkflowCategory";
import JobService from "@/API/Job/Job";
import { createApp } from "vue";

export default {
  components: {
    MainPage,
    DataTable,
  },
  data() {
    return {
      serviceJob: new JobService(),
      workflowCategory: new WorkflowCategory(),
      transitionId: null,
      transitionCode: null,
      fromStep: "",
      toStep: "",
      fromStepCode: "",
      toStepCode: "",
      transitionName: "",
      transitionNameCode: "",
      originalName: "",
      jobs: [],
      customRoles: [],
      allowedJobIds: [],
      allowedCustomRoleIds: [],
      originalJobs: [],
      originalCustomRoles: [],
      workflows: new Workflows(),
      isDataChanged: false,
      isSaving: false,
      isLoading: true,
      documentCustomRoles: [],
      workflowCategory_id: null,
      model_type: null,
      workflowData: null,
      currentStepCode: null,
      pendingPermissions: null,
    };
  },

  computed: {
    filteredJobs() {
      if (!this.allowedJobIds || this.allowedJobIds.length === 0) {
        return [];
      }
      return this.jobs.filter(job => this.allowedJobIds.includes(job.id));
    },

    filteredCustomRoles() {
      if (!this.allowedCustomRoleIds || this.allowedCustomRoleIds.length === 0) {
        return [];
      }
      return this.customRoles.filter(role => this.allowedCustomRoleIds.includes(role.id));
    },

    selectedJobsCount() {
      return this.filteredJobs.filter(job => job.selected).length;
    },

    selectedCustomRolesCount() {
      return this.filteredCustomRoles.filter(role => role.selected).length;
    },

    allJobsSelected() {
      return this.filteredJobs.length > 0 && this.selectedJobsCount === this.filteredJobs.length;
    },

    allCustomRolesSelected() {
      return this.filteredCustomRoles.length > 0 && this.selectedCustomRolesCount === this.filteredCustomRoles.length;
    }
  },

  async created() {
    this.transitionId = this.$route.params.id;
    this.transitionCode = this.$route.params.transitionCode;

    try {
      this.isLoading = true;

      // Fetch jobs first
      await this.fetchJob();

      // Fetch workflow details
      await this.fetchWorkflowDetails();

      // Fetch custom roles last (this takes time)
      await this.fetchCustomRoles();

      // After everything is loaded, apply permissions if they were fetched earlier
      if (this.pendingPermissions) {
        console.log("Applying pending permissions after custom roles loaded");
        this.updateRolesFromPermissions(this.pendingPermissions);
        this.storeOriginalStates();
        this.pendingPermissions = null;
      }
    } catch (error) {
      console.error("Error during initialization:", error);
    } finally {
      this.isLoading = false;
    }
  },

  methods: {
    async fetchWorkflowDetails() {
      try {
        const response = await this.workflows.show(this.transitionId);
        console.log('Workflow response:', response);

        this.workflowData = response;
        this.workflowCategory_id = response.workflowCategory_id;

        await this.fetchWorkflowCategoryDetails();
        await this.extractStepConfiguration();
        await this.fetchTransitionDetails();
      } catch (error) {
        console.error("Error fetching workflow details:", error);
        this.fromStep = "Unknown";
        this.toStep = "Unknown";
      }
    },

    async extractStepConfiguration() {
      try {
        if (!this.workflowData || !this.workflowData.steps) {
          console.warn('No workflow steps found');
          return;
        }

        const currentStep = this.workflowData.steps.find(step => {
          return step.transitions && step.transitions.some(
            transition => transition.code === this.transitionCode
          );
        });

        if (!currentStep) {
          console.warn(`Step not found for transition code: ${this.transitionCode}`);
          return;
        }

        console.log('Current step found:', currentStep);
        this.currentStepCode = currentStep.code;

        this.allowedJobIds = (currentStep.datatable_job_ids || [])
          .filter(id => id !== null && id !== undefined);

        this.allowedCustomRoleIds = (currentStep.datatable_custom_roles_control || [])
          .filter(id => id !== null && id !== undefined);

        console.log('Allowed Job IDs:', this.allowedJobIds);
        console.log('Allowed Custom Role IDs:', this.allowedCustomRoleIds);

      } catch (error) {
        console.error('Error extracting step configuration:', error);
      }
    },

    async fetchWorkflowCategoryDetails() {
      try {
        const response = await this.workflowCategory.show(
          this.workflowCategory_id
        );
        console.log(response.model_type, "workflow category response");
        this.model_type = response.model_type;
        console.log(`Model type set to: "${this.model_type}"`);
      } catch (error) {
        console.error("Error fetching workflow category details:", error);
      }
    },

    async fetchTransitionDetails() {
      try {
        const response = await this.workflows.getTransition(
          this.transitionId,
          this.transitionCode
        );

        console.log("Transition API response:", response);

        if (!response || !response.transition) {
          throw new Error("Invalid response: Missing 'transition' property");
        }

        const { transition } = response;

        if (!transition.name || !transition.code || !transition.to_step_name) {
          throw new Error("Invalid transition object: Missing required fields");
        }

        this.transitionName = transition.name;
        this.originalName = transition.name;
        this.transitionNameCode = transition.code;
        this.fromStep = response.step_name;
        this.toStep = transition.to_step_name;

        console.log("Transition permissions:", transition.permissions);

        if (transition.permissions) {
          // Check if custom roles are loaded yet
          if (this.customRoles.length === 0) {
            console.log("Custom roles not loaded yet, storing permissions for later");
            this.pendingPermissions = transition.permissions;
          } else {
            console.log("Custom roles already loaded, applying permissions now");
            this.updateRolesFromPermissions(transition.permissions);
            this.storeOriginalStates();
          }
        } else {
          console.warn("No permissions found in transition");
          this.clearAllSelections();
          this.storeOriginalStates();
        }
      } catch (error) {
        console.error("Failed to fetch transition details:", error);
        this.setDefaultValues();
      }
    },

    updateRolesFromPermissions(permissions) {
      console.log("updateRolesFromPermissions called with:", permissions);
      console.log("Available jobs:", this.jobs.map(j => ({ id: j.id, name: j.name })));
      console.log("Available customRoles:", this.customRoles.map(r => ({ id: r.id, name: r.name })));

      if (!permissions) {
        console.warn("No permissions provided");
        this.clearAllSelections();
        return;
      }

      // Handle both old format (array) and new format (object with jobs/customRoles)
      if (Array.isArray(permissions)) {
        // Old format: array of objects with _id
        console.log("Processing OLD format (array)");
        const permissionIds = permissions
          .filter((permission) => permission && permission._id)
          .map((permission) => permission._id);

        console.log("Permission IDs from array:", permissionIds);

        this.jobs.forEach((job) => {
          job.selected = permissionIds.includes(job.id);
        });

        this.customRoles.forEach((role) => {
          role.selected = permissionIds.includes(role.id);
        });
      } else if (typeof permissions === 'object') {
        // New format: object with jobs and customRoles arrays
        console.log("Processing NEW format (object)");
        const jobIds = permissions.jobs || [];
        const customRoleIds = permissions.customRoles || [];

        console.log('Job IDs to select:', jobIds);
        console.log('Custom Role IDs to select:', customRoleIds);

        // Update jobs selection
        this.jobs.forEach((job) => {
          const shouldSelect = jobIds.includes(job.id);
          job.selected = shouldSelect;
          if (shouldSelect) {
            console.log(`Selecting job: ${job.name} (${job.id})`);
          }
        });

        // Update custom roles selection
        this.customRoles.forEach((role) => {
          const shouldSelect = customRoleIds.includes(role.id);
          role.selected = shouldSelect;
          if (shouldSelect) {
            console.log(`Selecting custom role: ${role.name} (${role.id})`);
          }
        });

        console.log('Jobs selected count:', this.jobs.filter(j => j.selected).length);
        console.log('Custom roles selected count:', this.customRoles.filter(r => r.selected).length);
      } else {
        console.error("Invalid permissions format:", permissions);
        this.clearAllSelections();
      }
    },

    toggleJob(job) {
      job.selected = !job.selected;
      this.handleInputChange();
    },

    toggleCustomRole(role) {
      role.selected = !role.selected;
      this.handleInputChange();
    },

    toggleAllJobs() {
      const newState = !this.allJobsSelected;
      this.filteredJobs.forEach(job => {
        job.selected = newState;
      });
      this.handleInputChange();
    },

    toggleAllCustomRoles() {
      const newState = !this.allCustomRolesSelected;
      this.filteredCustomRoles.forEach(role => {
        role.selected = newState;
      });
      this.handleInputChange();
    },

    clearAllSelections() {
      this.jobs.forEach((job) => {
        job.selected = false;
      });
      this.customRoles.forEach((role) => {
        role.selected = false;
      });
    },

    storeOriginalStates() {
      this.originalJobs = JSON.parse(JSON.stringify(this.jobs));
      this.originalCustomRoles = JSON.parse(JSON.stringify(this.customRoles));
    },

    handleInputChange() {
      this.checkForChanges();
    },

    checkForChanges() {
      const nameChanged = this.transitionName !== this.originalName;

      let jobsChanged = this.jobs.some(
        (job, index) => job.selected !== this.originalJobs[index]?.selected
      );

      let customRolesChanged = this.customRoles.some(
        (role, index) =>
          role.selected !== this.originalCustomRoles[index]?.selected
      );

      this.isDataChanged = nameChanged || jobsChanged || customRolesChanged;
    },

    async saveTransition() {
      try {
        this.isSaving = true;

        // Collect selected job IDs
        const selectedJobIds = this.filteredJobs
          .filter((job) => job.selected)
          .map((job) => job.id);

        // Collect selected custom role IDs
        const selectedCustomRoleIds = this.filteredCustomRoles
          .filter((role) => role.selected)
          .map((role) => role.id);

        const updateData = {
          name: this.transitionName,
          permissions: {
            jobs: selectedJobIds,
            customRoles: selectedCustomRoleIds
          }
        };

        console.log("Update Data:", updateData);
        console.log("Jobs IDs:", selectedJobIds);
        console.log("Custom Roles IDs:", selectedCustomRoleIds);

        const response = await this.workflows.updateTransition(
          this.transitionId,
          this.transitionCode,
          updateData
        );

        console.log("Save response:", response);
        await this.fetchTransitionDetails();

        // Show success message
        this.$toast?.success?.('Transition updated successfully');
      } catch (error) {
        console.error("Failed to update transition:", error);
        this.$toast?.error?.('Failed to update transition');
      } finally {
        this.isSaving = false;
      }
    },

    async fetchJob() {
      try {
        const response = await this.serviceJob.getAll({ select: "id|name" });
        if (response && Array.isArray(response)) {
          this.jobs = response.map((job) => ({
            id: job.id,
            name: job.name,
            selected: false,
          }));

          console.log('All jobs loaded:', this.jobs.length);
        } else {
          console.error("Invalid job data received");
          this.jobs = [];
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        this.jobs = [];
      }
    },

    async fetchCustomRoles() {
      try {
        const ComponentToUse = await this.getComponentByModelType();

        if (!ComponentToUse) {
          console.warn(`No component found for model_type: ${this.model_type}`);
          this.customRoles = [];
          return;
        }

        console.log(
          `Creating app with component for model_type: ${this.model_type}`
        );

        const container = document.createElement("div");
        const app = createApp(ComponentToUse);

        app.config.globalProperties.$t = (key) => key;
        app.config.globalProperties.$route = { params: {} };
        app.config.globalProperties.$router = { push: () => { } };

        const vm = app.mount(container);

        await this.$nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const componentCustomRoles = vm.customRoles || [];
        console.log(
          componentCustomRoles,
          `customRoles from ${this.model_type || "Document"} component`
        );

        this.customRoles = componentCustomRoles.map(role => ({
          id: role.id,
          name: role.name,
          selected: false
        }));

        console.log('All custom roles loaded:', this.customRoles.length);
        console.log('Custom roles:', this.customRoles);

        app.unmount();
        container.remove();

        // After custom roles are loaded, check if we have pending permissions
        if (this.pendingPermissions) {
          console.log("Custom roles loaded, now applying pending permissions");
          this.updateRolesFromPermissions(this.pendingPermissions);
          this.storeOriginalStates();
          this.pendingPermissions = null;
        }
      } catch (error) {
        console.error("Error fetching custom roles:", error);
        this.customRoles = [];
      }
    },

    async getComponentByModelType() {
      console.log(`getComponentByModelType called with model_type: "${this.model_type}"`);

      try {
        const componentLoader = await this.loadComponent();
        console.log('Successfully loaded component:', componentLoader);
        return componentLoader;
      } catch (error) {
        console.error(`Error in getComponentByModelType for model_type: ${this.model_type}`, error);
        return await this.loadFallbackComponent();
      }
    },

    async loadComponent() {
      if (!this.model_type) {
        console.log("No model_type found, defaulting to Document component");
        return await this.importComponent("Document");
      }

      console.log(`Attempting to load component for model_type: "${this.model_type}"`);

      const supportedComponents = ['Document', 'ChangeRequest', 'Problem', 'Service', 'Asset', 'Request'];

      if (supportedComponents.includes(this.model_type)) {
        console.log(`Loading ${this.model_type} component...`);
        return await this.importComponent(this.model_type);
      } else {
        console.warn(`Unknown model_type: ${this.model_type}, defaulting to Document`);
        return await this.importComponent("Document");
      }
    },

    async importComponent(componentName) {
      try {
        const module = await import(`@/views/Page/${componentName}/${componentName}.vue`);
        return module.default;
      } catch (error) {
        console.warn(`${componentName} component not found, falling back to Document`);
        if (componentName !== 'Document') {
          return await this.importComponent('Document');
        }
        throw error;
      }
    },

    async loadFallbackComponent() {
      try {
        console.log('Attempting fallback to Document component...');
        const module = await import("@/views/Page/Document/Document.vue");
        return module.default;
      } catch (fallbackError) {
        console.error("Error loading fallback Document component:", fallbackError);
        return null;
      }
    },

    setDefaultValues() {
      this.transitionName = "Unknown";
      this.transitionNameCode = "Unknown";
      this.fromStep = "Unknown";
      this.toStep = "Unknown";
      this.clearAllSelections();
    },
  },
};
</script>

<style scoped>
/* Main Container */
.transition-editor {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  min-height: 100vh;
  font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.loading-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top-color: #43235C;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Workflow Visualization */
.workflow-visualization {
  background: linear-gradient(135deg, #c3c3cf 0%, #5e58bd 100%);
  /* color: white; */
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.workflow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* margin-bottom: 40px; */
  padding: 0 20px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 10px 18px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(-3px);
}


.workflow-actions {
  display: flex;
  align-items: center;
}

.btn-save {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.btn-save:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transition Flow */
.transition-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 0 20px;
  flex-wrap: wrap;
}

.flow-step,
.flow-transition {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 220px;
  transition: all 0.3s ease;
}

.flow-step:hover,
.flow-transition:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

.step-indicator,
.transition-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-icon,
.transition-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.step-label,
.transition-label {
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.step-content h3,
.transition-content h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.step-content p,
.transition-content p {
  margin: 4px 0 0 0;
  opacity: 0.8;
  font-size: 0.85rem;
}

.flow-arrow {
  display: flex;
  align-items: center;
  gap: 5px;
}

.arrow-line {
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1px;
}

.arrow-head {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  animation: pulse-arrow 2s infinite;
}

@keyframes pulse-arrow {

  0%,
  100% {
    transform: translateX(0);
    opacity: 0.8;
  }

  50% {
    transform: translateX(3px);
    opacity: 1;
  }
}

/* Transition Configuration */
.transition-configuration {
  padding: 40px 20px;
  /* max-width: 1200px; */
  margin: 0 auto;
}

.config-section,
.permissions-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f3f5;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f3f5;
}

.section-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

.section-title h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.section-title p {
  margin: 5px 0 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Form Styles */
.config-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.form-label i {
  color: #43235C;
}

.required {
  color: #dc3545;
  margin-left: 3px;
}

.input-group {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 45px 14px 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 500;
}

.form-input:focus {
  outline: none;
  border-color: #43235C;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
  font-size: 0.9rem;
  pointer-events: none;
}

.form-input:focus+.input-icon {
  color: #43235C;
}

/* Permissions Grid */
.permissions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.permission-card {
  background: #f8f9fa;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.permission-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #f1f3f5;
}

.permission-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.jobs-icon {
  background: white;
}

.roles-icon {
  background: white;
}

.permission-title h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.permission-title p {
  margin: 3px 0 0 0;
  color: #6c757d;
  font-size: 0.8rem;
}

.permission-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selection-badge {
  background: white;
  border: 1px solid #e9ecef;
  color: #495057;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.btn-toggle {
  background: #43235C;
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-toggle:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);
}

/* Permission Content */
.permission-content {
  padding: 20px;
  max-height: 350px;
  overflow-y: auto;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.permission-item:hover {
  border-color: #43235C;
  transform: translateX(3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.permission-item.selected {
  border-color: #43235C;
  background: rgba(99, 102, 241, 0.04);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.permission-checkbox {
  position: relative;
}

.permission-checkbox input[type="checkbox"] {
  opacity: 0;
  position: absolute;
  cursor: pointer;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: white;
}

.checkbox-custom i {
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.permission-checkbox input[type="checkbox"]:checked+.checkbox-custom {
  background: #43235C;
  border-color: #43235C;
}

.permission-checkbox input[type="checkbox"]:checked+.checkbox-custom i {
  opacity: 1;
}

.permission-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
  margin: 0;
}

.permission-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.jobs-icon .permission-icon {
  background: white;
}

.roles-icon .permission-icon {
  background: white;
}

.permission-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.permission-item.selected .permission-name {
  color: #43235C;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 5px 0;
  font-weight: 600;
  color: #495057;
}

.empty-state span {
  font-size: 0.85rem;
}

.fa-briefcase,
.fa-user-tag {
  color: #311f1f;
}

/* Action Buttons */
.actions-modern {
  padding: 24px 28px;
  text-align: center;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.btn-save-modern {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 0.3px;
}

.btn-save-modern:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 123, 255, 0.35);
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
}

.btn-save-modern:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-save-modern:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save-modern i {
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .permissions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .workflow-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .transition-flow {
    flex-direction: column;
    gap: 15px;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }

  .permission-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .permission-actions {
    width: 100%;
    justify-content: space-between;
  }

  .summary-content {
    flex-direction: column;
  }

  .summary-item {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .transition-configuration {
    padding: 20px 15px;
  }

  .config-section,
  .permissions-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .permission-title {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .permission-content {
    max-height: 300px;
  }
}

/* Scrollbar Styling */
.permission-content::-webkit-scrollbar {
  width: 6px;
}

.permission-content::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 8px;
}

.permission-content::-webkit-scrollbar-thumb {
  background: #43235C;
  border-radius: 8px;
}

.permission-content::-webkit-scrollbar-thumb:hover {
  background: #4f46e5;
}

/* Selection Animation */
@keyframes selectPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

.permission-item.selected {
  animation: selectPulse 0.3s ease;
}
</style>