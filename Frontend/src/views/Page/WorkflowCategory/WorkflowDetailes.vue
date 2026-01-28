<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'CONFIGURATIONS'"
    :mainSubPage="'workflowCategory'"
    :subPage="'MainSteps'"
    :titlePage="'workflow.workflow'"
  >
    <template #datatable>
      <div class="workflow-container">
        <div class="container-fluid">
          <!-- Header -->
          <div class="workflow-header">
            <div class="d-flex align-items-center">
              <router-link
                :to="`/workflow-category/${workflow.workflowCategory_id}`"
                class="btn-back"
              >
                <i class="fa fa-arrow-left"></i>
              </router-link>
              <h1 class="workflow-title">{{ workflow.name }}</h1>
            </div>
          </div>

          <!-- Workflow Table -->
          <div class="workflow-card">
            <table class="workflow-table">
              <thead>
                <tr>
                  <th>{{ $t("workflowdetailes.step_code") }}</th>
                  <th>{{ $t("workflowdetailes.step_name") }}</th>
                  <th>{{ $t("workflowdetailes.transitions") }}</th>
                  <th>{{ $t("workflowdetailes.operations") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="step in workflow.steps" :key="step.code">
                  <td>
                    <router-link
                      :to="`/main-step-transition/${this.$route.params.id}/${step.code}`"
                      class="step-code"
                    >
                      {{ step.code }}
                    </router-link>
                  </td>

                  <td>
                    <router-link
                      :to="`/main-step-transition/${this.$route.params.id}/${step.code}`"
                      class="step-badge"
                    >
                      {{ step.name }}
                    </router-link>
                  </td>

                  <td>
                    <div
                      v-if="step.transitions && step.transitions.length > 0"
                      class="transitions-wrapper"
                    >
                      <div
                        v-for="transition in step.transitions"
                        :key="transition.code"
                        class="transition-row"
                      >
                        <router-link
                          :to="`/transition/${this.$route.params.id}/${transition.code}`"
                          class="transition-badge"
                        >
                          {{ transition.name }}
                        </router-link>
                        <span class="transition-arrow">⟶</span>
                        <span class="target-step">{{ transition.to_step_name }}</span>
                        <button
                          class="btn-delete"
                          @click="deleteTransition(step.code, transition.name)"
                          :title="$t('workflowdetailes.delete_transition')"
                        >
                          <i class="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div v-else class="no-transitions">{{ $t("workflowdetailes.no_transitions") }}</div>
                  </td>

                  <td>
                    <button class="btn-add-transition" @click="addTransition(step.code)">
                      <i class="fa fa-plus"></i>
                      {{ $t("workflowdetailes.add_transition") }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </main-page>

  <v-dialog v-model="showModal" max-width="550px" persistent>
    <v-card class="modern-modal">
      <v-card-title class="modal-header">
        <span class="modal-title-text">{{ $t("workflowdetailes.add_transition_modal_title") }}</span>
        <v-btn icon variant="text" @click="showModal = false" class="close-btn" size="small">
          <v-icon size="24">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-body">
        <v-form @submit.prevent="confirmTransition">
          <div class="form-field">
            <label class="field-label">{{ $t("workflowdetailes.name") }} <span class="required-asterisk">*</span></label>
            <v-text-field 
              v-model="transitionName" 
              placeholder="" 
              required 
              variant="outlined"
              density="comfortable"
              hide-details
              class="custom-input"
            />
          </div>

          <div class="form-field">
            <label class="field-label">{{ $t("workflowdetailes.transition_from") }}</label>
            <v-text-field 
              v-model="selectedStepName" 
              readonly 
              variant="outlined" 
              density="comfortable"
              hide-details
              class="custom-input readonly-input"
            />
          </div>

          <div class="form-field">
            <label class="field-label">{{ $t("workflowdetailes.transition_to") }}</label>
            <v-select 
              v-model="selectedToStep" 
              :items="availableSteps" 
              item-title="name" 
              item-value="name"
              :placeholder="$t('workflowdetailes.select_step')" 
              required 
              variant="outlined" 
              density="comfortable"
              hide-details
              class="custom-select"
            />
          </div>

          <div class="modal-actions">
            <v-btn 
              variant="outlined" 
              @click="showModal = false" 
              class="btn-cancel"
            >
              {{ $t("workflowdetailes.cancel") }}
            </v-btn>
            <v-btn 
              type="submit" 
              variant="flat" 
              class="btn-submit"
            >
              {{ $t("workflowdetailes.add") }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import workflows from "@/API/WorkflowCategory/workflows";

export default {
  components: {
    MainPage,
    DataTable,
  },
  data() {
    return {
      showModal: false,
      selectedStepName: "",
      selectedToStep: "",
      transitionName: "",
      availableSteps: [],
      workflow: [],
      workflowData: [],
      workflowService: new workflows(),
      hoveredStep: null,
      hoveredTransition: null,
      user: {
        full_name: "fullName2",
        username: "userName2",
        email: "useremail@email.com",
        phone: 12345678,
        manager_id: "67b1d94e762af1957fb579df",
        job_id: "67b1bb96b0b52c8ff50c4ed4",
        department_id: "67b1bc70b0b52c8ff50c4ed5",
      },
    };
  },
  props: ["id"],
  watch: {
    "$route.params.id": {
      immediate: true,
      handler(newId) {
        this.fetchWorkflowDetails(newId);
      },
    },
  },
  mounted() {
    this.fetchWorkflowDetails(this.$route.params.id);
  },
  methods: {
    async fetchWorkflowDetails(id) {
      try {
        const response = await this.workflowService.show(id);
        if (response && Array.isArray(response.steps)) {
          this.workflow = {
            ...response,
            steps: response.steps.map((step) => ({
              ...step,
              transitions: step.transitions.filter(
                (transition) => transition.name && transition.to_step_name
              ),
            })),
          };
        } else {
          console.error("Invalid workflow response:", response);
        }
      } catch (error) {
        console.error("Error fetching workflow details:", error);
      }
    },
    addTransition(stepCode) {
      const step = this.workflow.steps.find((s) => s.code === stepCode);
      if (step) {
        this.selectedStepName = step.name;
        this.selectedToStep = "";
        this.transitionName = "";
        const allOtherSteps = this.workflow.steps.filter((s) => s.name !== step.name);
        const alreadyAssignedSteps = step.transitions.map((t) => t.to_step_name);
        this.availableSteps = allOtherSteps.filter(
          (s) => !alreadyAssignedSteps.includes(s.name)
        );
        this.showModal = true;
      }
    },
    async confirmTransition() {
      this.workflowData = JSON.parse(JSON.stringify(this.workflow));
      const fromStep = this.workflowData.steps.find(
        (s) => s.name === this.selectedStepName
      );

      if (!fromStep.transitions) {
        fromStep.transitions = [];
      }
      const newTransition = {
        name: this.transitionName,
        to_step_name: this.selectedToStep,
      };
      fromStep.transitions.push(newTransition);
      try {
        const response = await this.workflowService.from({
          id: this.workflow.id,
          ...this.workflowData,
        });
        if (response) {
          this.showModal = false;
          this.transitionName = "";
          this.selectedToStep = "";
        }
        this.fetchWorkflowDetails(this.$route.params.id);
      } catch (error) {
        console.error("Error adding transition:", error);
      }
    },

    async deleteTransition(stepCode, transitionName) {
      const step = this.workflow.steps.find((step) => step.code === stepCode);
      if (step) {
        step.transitions = step.transitions.filter(
          (transition) => transition.name !== transitionName
        );
        try {
          const response = await this.workflowService.from({
            id: this.workflow.id,
            ...this.workflow,
          });
          if (response) {
            this.fetchWorkflowDetails(this.$route.params.id);
          }
        } catch (error) {
          console.error("Error deleting transition:", error);
        }
      }
    },
  },
  computed: {
    filteredSteps() {
      if (!this.workflow || !this.workflow.steps || !this.user) {
        return [];
      }
      return this.workflow.steps.map((step) => {
        return {
          ...step,
          transitions: step.transitions.filter((transition) => {
            return (
              transition.permissions &&
              transition.permissions.some(
                (permission) => permission && permission.id === this.user.job_id
              )
            );
          }),
        };
      });
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.workflow-container {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef1f5 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif;
}

.container-fluid {
  max-width: 1440px;
  margin: 0 auto;
}

/* Header Styling - Figma Inspired */
.workflow-header {
  margin-bottom: 1.5rem;
}

.workflow-header .d-flex {
  align-items: center;
  gap: 0.875rem;
}

.btn-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1.5px solid #e1e4e8;
  border-radius: 8px;
  color: #24292e;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.btn-back:hover {
  background: #f6f8fa;
  border-color: #d1d5da;
  transform: translateX(-3px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-back i {
  font-size: 0.8125rem;
}

.workflow-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #0d1117;
  margin: 0;
  letter-spacing: -0.3px;
}

/* Card Styling - Modern Figma Style */
.workflow-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

/* Table Styling - Clean & Spacious */
.workflow-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.workflow-table thead {
  background: linear-gradient(to bottom, #fafbfc 0%, #f6f8fa 100%);
  border-bottom: 1.5px solid #e1e4e8;
}

.workflow-table thead th {
  padding: 0.75rem 1.25rem;
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #57606a;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.workflow-table tbody tr {
  border-bottom: 1px solid #f0f2f4;
  transition: all 0.2s ease;
}

.workflow-table tbody tr:hover {
  background: linear-gradient(to right, #f8f9fb 0%, #ffffff 100%);
}

.workflow-table tbody tr:last-child {
  border-bottom: none;
}

.workflow-table td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

/* Step Code - Monospaced Design */
.step-code {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.625rem;
  color: #000;
  font-size: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  letter-spacing: 0.2px;
}

/* Step Badge - Premium Purple Gradient */
.step-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4375rem 0.875rem;
  background: #d0b5e3;
  color: #43235c;
  font-size: 12px;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid rgba(94, 58, 110, 0.15);
  letter-spacing: 0.2px;
  box-shadow: 0 1px 3px rgba(138, 85, 170, 0.12);
}

.step-badge:hover {
  background: linear-gradient(135deg, #d0b5e0 0%, #bea3cf 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(138, 85, 170, 0.2);
  border-color: rgba(94, 58, 110, 0.25);
}

/* Transitions Wrapper - Enhanced Layout */
.transitions-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.transition-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #f8f9fb 0%, #ffffff 100%);
  border-radius: 10px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.transition-row:hover {
  border-color: #d1d5da;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Transition Badge - Refined Purple */
.transition-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: #d0b5e3;
  color: #43235c;
  font-size: 12px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.25s ease;
  white-space: nowrap;
  border: 1.5px solid rgba(74, 67, 103, 0.12);
  letter-spacing: 0.15px;
  box-shadow: 0 1px 3px rgba(74, 67, 103, 0.1);
}

.transition-badge:hover {
  background: linear-gradient(135deg, #bdb5d0 0%, #afa7c2 100%);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(74, 67, 103, 0.18);
  border-color: rgba(74, 67, 103, 0.2);
}

.transition-arrow {
  font-size: 1.125rem;
  color: #000;
  font-weight: 300;
  margin: 0 0.125rem;
}

.target-step {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: #d0b5e3;
  color: #43235c;
  font-size: 12px;
  border-radius: 14px;
  white-space: nowrap;
  border: 1.5px solid rgba(94, 58, 110, 0.12);
  letter-spacing: 0.15px;
  box-shadow: 0 1px 3px rgba(138, 85, 170, 0.1);
}

.btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #ffffff;
  border: 1.5px solid #a92525;
  border-radius: 7px;
  color: #a92525;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
  box-shadow: 0 1px 2px rgba(229, 62, 62, 0.08);
}

.btn-delete:hover {
  background: linear-gradient(135deg, #fff5f7 0%, #ffe8ed 100%);
  border-color: #ffc9d4;
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.15);
  color: #c53030;
}

.btn-delete i {
  font-size: 0.75rem;
}

.no-transitions {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Add Transition Button - Modern Dashed Style */
.btn-add-transition {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ffffff;
  border: 1px solid #6e3894;
  border-radius: 10px;
  color: #6e3894;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.15px;
}

.btn-add-transition:hover {
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f3f6 100%);
  border-color: #8b95a0;
  border-style: solid;
  color: #24292e;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.btn-add-transition i {
  font-size: 0.75rem;
  font-weight: 600;
}

.modern-modal {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem !important;
  background: #ffffff;
  border-bottom: none;
  min-height: auto !important;
}

.modal-title-text {
  font-size: 1.375rem;
  font-weight: 600;
  color: #000000;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.close-btn {
  color: #374151 !important;
  transition: all 0.2s ease;
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
}

.close-btn:hover {
  color: #000000 !important;
  background: #F3F4F6 !important;
}

.modal-body {
  padding: 0 2rem 2rem 2rem !important;
  background: #ffffff;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field:last-of-type {
  margin-bottom: 2rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #000000;
  letter-spacing: -0.01em;
}

.required-asterisk {
  color: #EF4444;
  margin-left: 2px;
  font-weight: 600;
}

/* Custom Input Styling */
:deep(.custom-input .v-field) {
  border-radius: 12px;
  background: #ffffff;
  font-size: 0.9375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

:deep(.custom-input .v-field__outline) {
  color: #E5E7EB;
}


:deep(.custom-input .v-field:hover .v-field__outline) {
  color: #D1D5DB;
}

:deep(.custom-input .v-field--focused .v-field__outline) {
  color: #6E3894;
}

:deep(.custom-input .v-field__input) {
  padding: 0.75rem 1rem;
  min-height: 48px;
  font-size: 0.9375rem;
  color: #000000;
}

:deep(.custom-input input::placeholder) {
  color: #9CA3AF;
  opacity: 1;
}

/* Readonly Input */
:deep(.readonly-input .v-field) {
  background: #E5E7EB;
  cursor: not-allowed;
  box-shadow: none;
}

:deep(.readonly-input .v-field__outline) {
  color: #E5E7EB;
}

:deep(.readonly-input .v-field__input) {
  color: #000000;
  font-weight: 500;
}

/* Custom Select Styling */
:deep(.custom-select .v-field) {
  border-radius: 12px;
  background: #ffffff;
  font-size: 0.9375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

:deep(.custom-select .v-field__outline) {
  color: #E5E7EB;
}


:deep(.custom-select .v-field:hover .v-field__outline) {
  color: #D1D5DB;
}

:deep(.custom-select .v-field--focused .v-field__outline) {
  color: #6E3894;
}

:deep(.custom-select .v-field__input) {
  padding: 0.75rem 1rem;
  min-height: 48px;
  font-size: 0.9375rem;
  color: #000000;
}

:deep(.custom-select .v-select__selection-text) {
  color: #000000;
}

:deep(.custom-select .v-field__append-inner) {
  padding-top: 0;
  align-items: center;
  color: #9CA3AF;
}

:deep(.custom-select input::placeholder) {
  color: #9CA3AF;
  opacity: 1;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.875rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-submit {
  padding: 0 2rem !important;
  /* height: 48px !important; */
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: -0.01em !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;
  font-size: 1rem !important;
  box-shadow: none !important;
}

.btn-cancel {
  border: 1.5px solid #6E3894 !important;
  color: #6E3894 !important;
  background: #ffffff !important;
  min-width: 110px !important;
}

.btn-cancel:hover {
  background: #F5F3FF !important;
  border-color: #6D28D9 !important;
}

.btn-submit {
  background: #6E3894 !important;
  color: #ffffff !important;
  min-width: 110px !important;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2) !important;
}

.btn-submit:hover {
  background: #6D28D9 !important;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35) !important;
}

/* Remove default Vuetify button elevations */
:deep(.v-btn) {
  box-shadow: none !important;
}

:deep(.v-btn:hover) {
  box-shadow: none !important;
}

:deep(.v-btn:active) {
  box-shadow: none !important;
}

/* Fix for form validation */
:deep(.v-field--error .v-field__outline) {
  color: #EF4444 !important;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item{
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row, [dir="rtl"] .field-label{
text-align: end;
}
</style>
