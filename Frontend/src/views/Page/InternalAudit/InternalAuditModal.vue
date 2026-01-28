<template>
  <!-- Enhanced Modal with Vuetify Style -->
  <v-dialog v-model="internalShowModal" max-width="1400px" persistent scrollable>
    <v-card class="audit-modal">
      <v-card-title class="modal-header">
        <div class="header-content">
          <div>
            <span class="modal-title">
              {{ editData.id ? $t('internalaudit.editControlMapping') : $t('internalaudit.createControlMapping') }}
            </span>
            <p class="modal-subtitle">
              {{ editData.id ? 'Update your audit control mappings' : 'Configure your audit control mappings' }}
            </p>
          </div>
        </div>
        <v-btn icon @click="closeModal" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-body" :class="{ 'modal-body-loading': isLoadingEditData }">
        <!-- Loading Overlay for Edit Data -->
        <div v-if="isLoadingEditData" class="loading-overlay">
          <div class="loading-content">
            <v-progress-circular indeterminate color="#6E3894" size="64"></v-progress-circular>
            <p class="loading-text">Loading audit data...</p>
          </div>
        </div>

        <v-container fluid v-show="!isLoadingEditData">
          <!-- Enhanced Step Progress -->
          <div class="step-progress-vuetify">
            <div class="progress-line-wrapper">
              <div class="progress-line-bg"></div>
              <div class="progress-line-active" :style="{ width: currentStep === 2 ? '100%' : '0%' }"></div>
            </div>

            <div class="step-vuetify" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
              <div class="step-circle">
                <v-icon v-if="currentStep > 1" color="white" size="24">mdi-check</v-icon>
                <span v-else>1</span>
              </div>
              <div class="step-info">
                <span class="step-title">{{ $t('internalaudit.frameworkControls') }}</span>
                <span class="step-desc">Select framework and controls</span>
              </div>
            </div>

            <div class="step-vuetify" :class="{ active: currentStep === 2 }">
              <div class="step-circle">
                <span>2</span>
              </div>
              <div class="step-info">
                <span class="step-title">{{ $t('internalaudit.reviewersDates') }}</span>
                <span class="step-desc">Set dates and reviewers</span>
              </div>
            </div>
          </div>

          <v-form ref="auditForm" @submit.prevent="submitForm" :validate-on="validateOn">
            <!-- Step 1: Framework and Controls Selection -->
            <div v-show="currentStep === 1" class="step-content">
              <v-row dense>
                <!-- Regulator Select -->
                <v-col cols="12" md="6">
                  <v-select v-model="selectedRegulator" :items="regulatoreWithFrameControl"
                    :label="$t('internalaudit.regulator')" item-title="name" item-value="id" variant="outlined"
                    density="comfortable" prepend-inner-icon="mdi-office-building"
                    @update:model-value="onRegulatorChange"
                    :rules="step1Touched ? [v => !!v || $t('internalaudit.selectRegulatorError')] : []" return-object>
                  </v-select>
                </v-col>

                <!-- Framework Select -->
                <v-col cols="12" md="6">
                  <v-select v-model="selectedFramework" :items="selectedRegulator?.frameworks || []"
                    :label="$t('internalaudit.framework')" item-title="title" item-value="id" variant="outlined"
                    density="comfortable" prepend-inner-icon="mdi-file-tree" :disabled="!selectedRegulator"
                    @update:model-value="onFrameworkChange"
                    :rules="step1Touched ? [v => !!v || $t('internalaudit.selectFrameworkError')] : []" return-object>
                  </v-select>
                </v-col>
              </v-row>

              <!-- Section Header -->
              <div class="section-header-vuetify">
                <div class="section-icon-wrapper">
                  <v-icon size="28" color="white">mdi-clipboard-check-multiple</v-icon>
                </div>
                <div class="section-text">
                  <h6 class="section-title-vuetify">{{ $t('internalaudit.selectControlsDocuments') }}</h6>
                  <p class="section-description">Select controls and their related documents for audit mapping</p>
                </div>
              </div>

              <!-- Controls and Documents Grid -->
              <v-row dense class="mt-4">
                <!-- Controls Column -->
                <v-col cols="12" lg="6">
                  <v-card class="controls-card" elevation="2">
                    <v-card-title class="card-header-vuetify">
                      <div class="header-left">
                        <div class="header-icon-badge">
                          <v-icon size="20" color="white">mdi-format-list-checks</v-icon>
                        </div>
                        <span class="header-title">{{ $t('internalaudit.availableControls') }}</span>
                      </div>
                      <div class="header-right">
                        <v-chip color="#6E3894" size="small" class="selection-chip">
                          {{ selectedControls.length }} Selected
                        </v-chip>
                        <v-btn size="small" color="#6E3894" variant="outlined"
                          :disabled="!selectedFramework || !selectedFramework.control || selectedFramework.control.length === 0"
                          @click="toggleSelectAll" class="select-all-btn">
                          <v-icon start size="18">mdi-checkbox-multiple-marked</v-icon>
                          {{ allControlsSelected ? $t('internalaudit.deselectAll') : $t('internalaudit.selectAll') }}
                        </v-btn>
                      </div>
                    </v-card-title>

                    <v-card-text class="controls-list-vuetify">
                      <!-- Loading State -->
                      <div v-if="isLoadingControls" class="loading-state-vuetify">
                        <v-progress-circular indeterminate color="#6E3894" size="48"></v-progress-circular>
                        <p class="mt-4">Loading controls...</p>
                      </div>

                      <!-- Empty State - No Framework -->
                      <div v-else-if="!selectedFramework" class="empty-state-vuetify">
                        <v-icon size="64" color="#94a3b8">mdi-lock</v-icon>
                        <p class="empty-title">Framework Required</p>
                        <p class="empty-text">Please select a framework first to view available controls</p>
                      </div>

                      <!-- Controls List -->
                      <div v-else-if="selectedFramework.control && selectedFramework.control.length > 0"
                        class="controls-grid-vuetify">
                        <v-card v-for="control in selectedFramework.control" :key="control.id"
                          :class="['control-card-vuetify', { selected: isControlSelected(control.id) }]" elevation="0"
                          @click="toggleControl(control.id)">
                          <v-card-text class="control-card-content">
                            <div class="control-checkbox-wrapper">
                              <v-checkbox v-model="selectedControls" :value="control.id" hide-details color="#6E3894"
                                @change="onControlChange" @click.stop></v-checkbox>
                            </div>
                            <div class="control-details">
                              <div class="control-name-row">
                                <span class="control-name">{{ control.short_name || control.name }}</span>
                              </div>
                              <p v-if="control.description" class="control-description">
                                {{ control.description }}
                              </p>
                            </div>
                          </v-card-text>
                        </v-card>
                      </div>

                      <!-- Empty State - No Controls -->
                      <div v-else class="empty-state-vuetify">
                        <v-icon size="64" color="#94a3b8">mdi-inbox</v-icon>
                        <p class="empty-title">No Controls Available</p>
                        <p class="empty-text">This framework doesn't have any controls configured</p>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Documents Column -->
                <v-col cols="12" lg="6">
                  <v-card class="documents-card" elevation="2">
                    <v-card-title class="card-header-vuetify documents-header">
                      <div class="header-left">
                        <div class="header-icon-badge documents-badge">
                          <v-icon size="20" color="white">mdi-file-document-multiple</v-icon>
                        </div>
                        <span class="header-title">{{ $t('internalaudit.relatedDocuments') }}</span>
                      </div>
                    </v-card-title>

                    <v-card-text class="documents-list-vuetify">
                      <!-- Loading State -->
                      <div v-if="isLoadingDocuments" class="loading-state-vuetify">
                        <v-progress-circular indeterminate color="#6E3894" size="48"></v-progress-circular>
                        <p class="mt-4">Loading documents...</p>
                      </div>

                      <!-- Empty State - No Controls Selected -->
                      <div v-else-if="selectedControls.length === 0" class="empty-state-vuetify">
                        <v-icon size="64" color="#f59e0b">mdi-hand-pointing-right</v-icon>
                        <p class="empty-title">Select Controls First</p>
                        <p class="empty-text">Choose one or more controls to view their related documents</p>
                      </div>

                      <!-- Documents Groups -->
                      <div v-else-if="groupedDocuments.length > 0" class="documents-groups-vuetify">
                        <v-expansion-panels v-model="expandedPanels" multiple class="documents-expansion">
                          <v-expansion-panel v-for="group in groupedDocuments" :key="group.control.id"
                            class="document-group-vuetify">
                            <v-expansion-panel-title class="group-header-vuetify">
                              <div class="group-header-content">
                                <v-icon color="#f59e0b" class="mr-2">mdi-folder-open</v-icon>
                                <span class="group-title">{{ group.control.short_name || group.control.name }}</span>
                                <v-chip size="small" color="#f59e0b" class="ml-2">
                                  {{ group.documents.length }}
                                </v-chip>
                              </div>
                            </v-expansion-panel-title>

                            <v-expansion-panel-text>
                              <div v-if="group.documents.length > 0" class="group-content-vuetify">
                                <v-card v-for="doc in group.documents" :key="doc.id" class="document-card-vuetify"
                                  elevation="0">
                                  <v-card-text class="document-card-content">
                                    <v-checkbox v-model="selectedDocuments[group.control.id]" :value="doc.id"
                                      hide-details color="#6E3894">
                                      <template v-slot:label>
                                        <div class="document-label-content">
                                          <div class="document-icon-wrapper">
                                            <v-icon color="#dc2626" size="24">mdi-file-pdf-box</v-icon>
                                          </div>
                                          <div class="document-info">
                                            <span class="document-name">{{ doc.document_name || doc.name }}</span>
                                            <span v-if="doc.description" class="document-meta">{{ doc.description
                                            }}</span>
                                          </div>
                                        </div>
                                      </template>
                                    </v-checkbox>
                                  </v-card-text>
                                </v-card>
                              </div>
                              <div v-else class="empty-state-small-vuetify">
                                <v-icon color="#94a3b8">mdi-close-circle</v-icon>
                                <span>No documents available</span>
                              </div>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Step 2: Reviewers and Dates -->
            <div v-show="currentStep === 2" class="step-content">
              <v-row dense>
                <!-- Name Field -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.name" :label="$t('internalaudit.name')"
                    :placeholder="$t('internalaudit.enterMappingName')" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-card-text"
                    :rules="step2Touched ? [v => !!v || 'Name is required'] : []"></v-text-field>
                </v-col>

                <!-- Reviewers Select -->
                <v-col cols="12" md="6">
                  <v-select v-model="formData.reviewer_ids" :items="users" :label="$t('internalaudit.reviewers')"
                    item-title="full_name" item-value="id" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-account-multiple" multiple chips closable-chips
                    :rules="step2Touched ? [v => (v && v.length > 0) || 'Select at least one reviewer'] : []">
                  </v-select>
                </v-col>

                <!-- Start Date -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.start_date" :label="$t('internalaudit.startDate')" type="date"
                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-calendar"
                    @change="calculateNextInitiateDate"
                    :rules="step2Touched ? [v => !!v || 'Start date is required'] : []"></v-text-field>
                </v-col>

                <!-- Due Date -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.due_date" :label="$t('internalaudit.dueDate')" type="date"
                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-calendar-check"
                    :rules="step2Touched ? [v => !!v || 'Due date is required'] : []"></v-text-field>
                </v-col>

                <!-- Periodical Date -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.periodical_date"
                    :label="`${$t('internalaudit.periodicalDate')} (${$t('internalaudit.days')})`" type="number" min="0"
                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-sync"
                    @input="calculateNextInitiateDate" @change="calculateNextInitiateDate"></v-text-field>
                </v-col>

                <!-- Next Initiate Date -->
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.next_initiate_date" :label="$t('internalaudit.nextInitiateDate')"
                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-calendar-plus" readonly
                    :hint="formData.start_date && formData.periodical_date ? 'Auto-calculated from start date + periodical days' : 'Enter start date and periodical days'"
                    persistent-hint></v-text-field>
                </v-col>

                <!-- Description -->
                <v-col cols="12">
                  <v-textarea v-model="formData.description" :label="$t('internalaudit.description')"
                    :placeholder="$t('internalaudit.writeDescription')" variant="outlined" density="comfortable"
                    rows="4" prepend-inner-icon="mdi-text"></v-textarea>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-container>
      </v-card-text>

      <!-- Modal Actions -->
      <v-card-actions class="modal-actions-vuetify">
        <v-btn v-if="currentStep > 1" color="#6E3894" variant="outlined" @click="prevStep" class="action-btn">
          <v-icon start>mdi-arrow-left</v-icon>
          {{ $t('internalaudit.previous') }}
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="currentStep < 2" color="#6E3894" variant="flat" @click="nextStep" class="action-btn primary-btn">
          {{ $t('internalaudit.next') }}
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <v-btn v-if="currentStep === 2" color="#6E3894" variant="flat" @click="submitForm" :loading="isSubmitting"
          :disabled="isSubmitting" class="action-btn primary-btn">
          <v-icon start>mdi-check-circle</v-icon>
          {{ editData.id ? $t('internalaudit.updateMapping') : $t('internalaudit.createMapping') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import internalaudit from "@/API/InternalAudit/InternalAudit";
import { notify } from "@kyvg/vue3-notification";

export default {
  name: 'InternalAuditModal',
  
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: () => ({})
    },
    regulatoreWithFrameControl: {
      type: Array,
      default: () => []
    },
    categoryWithDocument: {
      type: Array,
      default: () => []
    },
    users: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:showModal', 'close', 'submit-success'],

  setup() {
    const api = new internalaudit();
    return { api };
  },

  data() {
    return {
      currentStep: 1,
      selectedRegulator: null,
      selectedFramework: null,
      selectedControls: [],
      selectedDocuments: {},
      expandedPanels: [],
      isLoadingControls: false,
      isLoadingDocuments: false,
      isSubmitting: false,
      isLoadingEditData: false,
      step1Touched: false,
      step2Touched: false,
      validateOn: 'input lazy',
      formData: {
        name: '',
        start_date: '',
        due_date: '',
        periodical_date: 0,
        reviewer_ids: [],
        next_initiate_date: '',
        description: ''
      }
    };
  },

  computed: {
    internalShowModal: {
      get() {
        return this.showModal;
      },
      set(value) {
        this.$emit('update:showModal', value);
      }
    },

    groupedDocuments() {
      if (this.selectedControls.length === 0 || !this.selectedFramework?.control) return [];

      const groups = [];

      this.selectedControls.forEach(controlId => {
        const control = this.selectedFramework.control.find(c => c.id === controlId);
        if (!control) return;

        const documents = [];

        if (Array.isArray(this.categoryWithDocument)) {
          this.categoryWithDocument.forEach(category => {
            if (category.documents && Array.isArray(category.documents)) {
              category.documents.forEach(doc => {
                let isAssociated = false;

                if (Array.isArray(doc.control_id)) {
                  isAssociated = doc.control_id.includes(controlId);
                } else if (doc.control_id === controlId) {
                  isAssociated = true;
                }

                if (isAssociated && !documents.find(d => d.id === doc.id)) {
                  documents.push(doc);
                }
              });
            }
          });
        }

        groups.push({
          control: control,
          documents: documents
        });
      });

      return groups;
    },

    allControlsSelected() {
      if (!this.selectedFramework?.control || this.selectedFramework.control.length === 0) {
        return false;
      }
      return this.selectedControls.length === this.selectedFramework.control.length && this.selectedControls.length > 0;
    },

    canSubmit() {
      return this.selectedControls.length > 0 &&
        this.formData.name &&
        this.formData.start_date &&
        this.formData.due_date &&
        this.formData.reviewer_ids.length > 0;
    }
  },

  watch: {
    showModal(newVal) {
      if (newVal) {
        if (this.editData && this.editData.id) {
          this.loadEditData(this.editData);
        } else {
          this.resetForm();
        }
      }
    },

    selectedControls: {
      handler(newVal) {
        this.expandedPanels = Array.from({ length: newVal.length }, (_, i) => i);
      },
      deep: true
    },

    'formData.start_date': function (newVal) {
      if (newVal) {
        this.calculateNextInitiateDate();
      }
    },

    'formData.periodical_date': function (newVal) {
      if (newVal) {
        this.calculateNextInitiateDate();
      }
    }
  },

  methods: {
    closeModal() {
      this.$emit('update:showModal', false);
      this.$emit('close');
      this.resetForm();
    },

    resetForm() {
      this.selectedRegulator = null;
      this.selectedFramework = null;
      this.selectedControls = [];
      this.selectedDocuments = {};
      this.expandedPanels = [];
      this.currentStep = 1;
      this.step1Touched = false;
      this.step2Touched = false;
      this.isLoadingEditData = false;
      this.formData = {
        name: '',
        start_date: '',
        due_date: '',
        periodical_date: 0,
        reviewer_ids: [],
        next_initiate_date: '',
        description: ''
      };
    },

    async loadEditData(data) {
      try {
        this.isLoadingEditData = true;

        let fullData = data;
        if (data.id && !data.control_policies) {
          try {
            fullData = await this.api.show(data.id);
          } catch (error) {
            console.warn('Could not fetch full audit details, using provided data');
            fullData = data;
          }
        }

        this.formData = {
          name: fullData.name || '',
          start_date: fullData.start_date || '',
          due_date: fullData.due_date || '',
          periodical_date: fullData.periodical_date || 0,
          reviewer_ids: Array.isArray(fullData.reviewer_ids) ? [...fullData.reviewer_ids] : [],
          next_initiate_date: fullData.next_initiate_date || '',
          description: fullData.description || ''
        };

        if (fullData.regulator_id) {
          this.selectedRegulator = this.regulatoreWithFrameControl.find(
            r => r.id === fullData.regulator_id || r._id === fullData.regulator_id
          ) || null;
        }

        if (this.selectedRegulator && fullData.framework_id) {
          await this.$nextTick();
          this.selectedFramework = this.selectedRegulator.frameworks?.find(
            f => f.id === fullData.framework_id || f._id === fullData.framework_id
          ) || null;
        }

        if (fullData.control_ids && Array.isArray(fullData.control_ids)) {
          await this.$nextTick();
          this.selectedControls = [...fullData.control_ids];
        }

        await this.$nextTick();

        const documents = {};
        this.selectedControls.forEach(controlId => {
          documents[controlId] = [];
        });

        const savedDocumentIds = fullData.document_ids && Array.isArray(fullData.document_ids)
          ? fullData.document_ids
          : [];

        if (savedDocumentIds.length > 0) {
          savedDocumentIds.forEach(docId => {
            this.categoryWithDocument.forEach(category => {
              if (category.documents && Array.isArray(category.documents)) {
                const doc = category.documents.find(d => d.id === docId || d._id === docId);

                if (doc && doc.control_id) {
                  const docControlIds = Array.isArray(doc.control_id) ? doc.control_id : [doc.control_id];

                  docControlIds.forEach(controlId => {
                    if (this.selectedControls.includes(controlId)) {
                      if (!documents[controlId]) {
                        documents[controlId] = [];
                      }
                      if (!documents[controlId].includes(docId)) {
                        documents[controlId].push(docId);
                      }
                    }
                  });
                }
              }
            });
          });
        }

        this.selectedDocuments = documents;
        this.expandedPanels = Array.from({ length: this.selectedControls.length }, (_, i) => i);

      } catch (error) {
        console.error('Error loading edit data:', error);
        notify({
          title: "Load Error",
          text: "Error loading audit data for editing",
          type: "error",
        });
      } finally {
        this.isLoadingEditData = false;
      }
    },

    onRegulatorChange() {
      this.selectedFramework = null;
      this.selectedControls = [];
      this.selectedDocuments = {};
    },

    onFrameworkChange() {
      this.selectedControls = [];
      this.selectedDocuments = {};
    },

    onControlChange() {
      const updatedDocuments = { ...this.selectedDocuments };

      this.selectedControls.forEach(controlId => {
        if (!updatedDocuments[controlId]) {
          updatedDocuments[controlId] = [];
        }
      });

      Object.keys(updatedDocuments).forEach(controlId => {
        if (!this.selectedControls.includes(parseInt(controlId))) {
          delete updatedDocuments[controlId];
        }
      });

      this.selectedDocuments = updatedDocuments;
    },

    toggleControl(controlId) {
      const index = this.selectedControls.indexOf(controlId);
      if (index > -1) {
        this.selectedControls.splice(index, 1);
        const updatedDocuments = { ...this.selectedDocuments };
        delete updatedDocuments[controlId];
        this.selectedDocuments = updatedDocuments;
      } else {
        this.selectedControls.push(controlId);
        this.selectedDocuments = {
          ...this.selectedDocuments,
          [controlId]: []
        };
      }
    },

    toggleSelectAll() {
      if (!this.selectedFramework?.control || this.selectedFramework.control.length === 0) {
        return;
      }

      if (this.allControlsSelected) {
        this.selectedControls = [];
        this.selectedDocuments = {};
      } else {
        this.selectedControls = this.selectedFramework.control.map(c => c.id);
        const newDocuments = {};
        this.selectedControls.forEach(controlId => {
          newDocuments[controlId] = [];
        });
        this.selectedDocuments = newDocuments;
      }
    },

    isControlSelected(controlId) {
      return this.selectedControls.includes(controlId);
    },

    calculateNextInitiateDate() {
      if (this.formData.start_date && this.formData.periodical_date) {
        const startDate = new Date(this.formData.start_date);
        const periodicalDays = parseInt(this.formData.periodical_date);

        if (!isNaN(periodicalDays) && periodicalDays > 0) {
          const nextDate = new Date(startDate);
          nextDate.setDate(startDate.getDate() + periodicalDays);
          this.formData.next_initiate_date = nextDate.toISOString().split('T')[0];
        } else {
          this.formData.next_initiate_date = '';
        }
      } else {
        this.formData.next_initiate_date = '';
      }
    },

    nextStep() {
      this.step1Touched = true;

      if (this.currentStep === 1) {
        if (!this.selectedRegulator) {
          notify({
            title: "Validation Error",
            text: this.$t('internalaudit.selectRegulatorError') || 'Please select a regulator',
            type: "error",
          });
          return;
        }
        if (!this.selectedFramework) {
          notify({
            title: "Validation Error",
            text: this.$t('internalaudit.selectFrameworkError') || 'Please select a framework',
            type: "error",
          });
          return;
        }
        if (this.selectedControls.length === 0) {
          notify({
            title: "Validation Error",
            text: this.$t('internalaudit.selectControlsError') || 'Please select at least one control',
            type: "error",
          });
          return;
        }
      }
      this.currentStep++;
    },

    prevStep() {
      this.currentStep--;
    },

async submitForm() {
      this.step2Touched = true;

      if (!this.formData.name) {
        notify({
          title: "Validation Error",
          text: "Please enter a name",
          type: "error",
        });
        return;
      }
      if (!this.formData.start_date) {
        notify({
          title: "Validation Error",
          text: "Please select a start date",
          type: "error",
        });
        return;
      }
      if (!this.formData.due_date) {
        notify({
          title: "Validation Error",
          text: "Please select a due date",
          type: "error",
        });
        return;
      }
      if (!this.formData.reviewer_ids || this.formData.reviewer_ids.length === 0) {
        notify({
          title: "Validation Error",
          text: "Please select at least one reviewer",
          type: "error",
        });
        return;
      }

      if (!this.canSubmit) return;

      this.isSubmitting = true;

      try {
        // Build control_policies object and collect document IDs
        const control_policies = {};
        const allDocumentIds = [];

        this.selectedControls.forEach(controlId => {
          // Get the documents for this control
          let controlDocs = this.selectedDocuments[controlId] || [];
          
          // Ensure it's always an array
          if (!Array.isArray(controlDocs)) {
            controlDocs = controlDocs ? [controlDocs] : [];
          }
          
          // Store as array in control_policies
          control_policies[controlId] = controlDocs;
          
          // Add to allDocumentIds
          controlDocs.forEach(docId => {
            if (docId !== null && docId !== undefined && !allDocumentIds.includes(docId)) {
              allDocumentIds.push(docId);
            }
          });
        });

        const payload = {
          name: this.formData.name,
          regulator_id: this.selectedRegulator.id,
          framework_id: this.selectedFramework.id,
          control_ids: this.selectedControls,
          document_ids: allDocumentIds,
          control_policies: control_policies,
          start_date: this.formData.start_date,
          due_date: this.formData.due_date,
          periodical_date: this.formData.periodical_date,
          reviewer_ids: this.formData.reviewer_ids,
          next_initiate_date: this.formData.next_initiate_date,
          description: this.formData.description
        };

        if (this.editData.id) {
          payload.id = this.editData.id;
        }

        // Debug log to verify document IDs are being sent
        console.log('Submitting payload:', {
          ...payload,
          document_ids: payload.document_ids,
          control_policies: payload.control_policies
        });

        await this.api.from(payload);

        notify({
          title: this.editData.id ? "Update Successfully" : "Create Successfully",
          text: this.editData.id ? 'Audit mapping updated successfully' : 'Audit mapping created successfully',
          type: "success",
        });

        this.$emit('submit-success');
        this.closeModal();
      } catch (error) {
        console.error('Error saving:', error);
        notify({
          title: "Save Error",
          text: this.$t('internalaudit.errorSaving') || 'Error saving data',
          type: "error",
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
/* All your existing styles remain the same */
:deep(.v-overlay) {
  backdrop-filter: blur(8px);
}

.audit-modal {
  border-radius: 12px !important;
  overflow: hidden;
}

.v-dialog .v-card .v-card-title .v-btn {
  color: black !important;
  background: white !important;
  border-radius: 8px !important;
}

.modal-header {
  background: #F0F0F0;
  color: white !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-weight: 700 !important;
  font-size: 1.1rem !important;
  color: black;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.modal-subtitle {
  color: black;
  font-size: 0.8rem;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem !important;
  background: #f8fafc;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-body-loading {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #6E3894;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #5a2d75;
}

.step-progress-vuetify {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  margin-bottom: 2.5rem;
  padding: 0 2rem;
}

.progress-line-wrapper {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 16rem);
  height: 4px;
  z-index: 1;
}

.progress-line-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #e2e8f0;
  border-radius: 2px;
}

.progress-line-active {
  position: absolute;
  height: 100%;
  background: linear-gradient(to right, #6E3894, #5a2d75);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.step-vuetify {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.step-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  border: 4px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: #94a3b8;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.step-vuetify.active .step-circle {
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%);
  border-color: #6E3894;
  color: white;
  box-shadow: 0 10px 25px -5px rgba(110, 56, 148, 0.5);
  transform: scale(1.1);
}

.step-vuetify.completed .step-circle {
  background: #10b981;
  border-color: #10b981;
  color: white;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.5);
}

.step-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-title {
  font-weight: 700;
  color: #64748b;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.step-vuetify.active .step-title {
  color: #6E3894;
}

.step-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.section-header-vuetify {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  margin: 1.5rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-text {
  flex: 1;
}

.section-title-vuetify {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.section-description {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
}

.card-header-vuetify {
  background: linear-gradient(to right, #f8fafc, #f1f5f9) !important;
  border-bottom: 2px solid #e2e8f0 !important;
  padding: 1rem 1.25rem !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.documents-header {
  background: linear-gradient(to right, #FFF9E6, #FFF4CC) !important;
  border-bottom: 2px solid #EBDCB3 !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.documents-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.header-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.selection-chip {
  font-weight: 700;
}

.select-all-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}

.controls-list-vuetify,
.documents-list-vuetify {
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem;
  background: #fafbfc;
}

.controls-list-vuetify::-webkit-scrollbar,
.documents-list-vuetify::-webkit-scrollbar {
  width: 6px;
}

.controls-list-vuetify::-webkit-scrollbar-track,
.documents-list-vuetify::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.controls-list-vuetify::-webkit-scrollbar-thumb,
.documents-list-vuetify::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.controls-grid-vuetify {
  display: grid;
  gap: 0.75rem;
}

.control-card-vuetify {
  border: 2px solid #e2e8f0 !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
}

.control-card-vuetify:hover {
  border-color: #6E3894 !important;
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.15) !important;
  transform: translateY(-2px);
}

.control-card-vuetify.selected {
  border-color: #6E3894 !important;
  background: linear-gradient(135deg, rgba(110, 56, 148, 0.05) 0%, rgba(90, 45, 117, 0.05) 100%);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.2) !important;
}

.control-card-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem !important;
}

.control-checkbox-wrapper {
  flex-shrink: 0;
}

.control-details {
  flex: 1;
}

.control-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.control-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
}

.control-description {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

.documents-groups-vuetify {
  display: grid;
  gap: 1rem;
}

.documents-expansion {
  background: transparent !important;
}

.document-group-vuetify {
  border: 2px solid #e2e8f0 !important;
  border-radius: 12px !important;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

:deep(.v-expansion-panel-title) {
  background: linear-gradient(to right, #FFF9E6, #FFF4CC) !important;
  border-bottom: 2px solid #EBDCB3;
  padding: 0.875rem 1rem !important;
  min-height: auto !important;
}

.group-header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.group-title {
  flex: 1;
  font-weight: 700;
  color: #92400e;
  font-size: 0.9rem;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 1rem !important;
}

.group-content-vuetify {
  display: grid;
  gap: 0.75rem;
}

.document-card-vuetify {
  border: 2px solid #e2e8f0 !important;
  border-radius: 10px !important;
  transition: all 0.3s ease;
  background: white;
}

.document-card-vuetify:hover {
  border-color: #6E3894 !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.1) !important;
  transform: translateX(4px);
}

.document-card-content {
  padding: 0.75rem !important;
}

.document-label-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.document-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #fee2e2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.document-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
}

.document-meta {
  color: #64748b;
  font-size: 0.75rem;
}

.loading-state-vuetify,
.empty-state-vuetify {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  min-height: 400px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #6E3894;
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.empty-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #64748b;
  font-size: 0.9rem;
}

.empty-state-small-vuetify {
  text-align: center;
  padding: 1.5rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-actions-vuetify {
  padding: 1rem 1.5rem !important;
  background: white;
  border-top: 2px solid #e2e8f0;
}

.action-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

:deep(.v-select .v-field),
:deep(.v-text-field .v-field),
:deep(.v-textarea .v-field) {
  border-radius: 8px !important;
}

:deep(.v-field--focused) {
  border-color: #6E3894 !important;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1) !important;
}

:deep(.v-chip) {
  background: #6E3894 !important;
  color: white !important;
}

:deep(.v-checkbox .v-selection-control__input) {
  color: #6E3894 !important;
}

@media (max-width: 992px) {
  .step-progress-vuetify {
    flex-direction: column;
    gap: 1rem;
    padding: 0;
  }

  .progress-line-wrapper {
    display: none;
  }

  .step-vuetify {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
  }

  .step-circle {
    margin-bottom: 0;
    margin-right: 1rem;
  }

  .step-info {
    align-items: flex-start;
    text-align: left;
  }

  .header-right {
    flex-direction: column;
    gap: 0.5rem;
  }

  .select-all-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .modal-body {
    padding: 1rem !important;
  }

  .modal-actions-vuetify {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .action-btn {
    width: 100%;
  }
}
</style>