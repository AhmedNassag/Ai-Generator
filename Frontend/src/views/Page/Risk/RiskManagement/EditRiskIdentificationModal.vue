<template>
  <v-dialog v-model="dialogVisible" max-width="1200px" persistent>
    <v-card class="identification-modal">
      <v-card-title class="modal-header">
        <span class="modal-title">{{ $t('risk.edit_risk') }}</span>
        <v-btn icon @click="handleClose" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-body">
        <v-container>
          <v-form ref="identificationForm" @submit.prevent="handleUpdate">
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.risk_mapping_ids" :items="dropdownOptions.riskOptions"
                  :label="$t('risk.mapping')" multiple chips closable-chips item-title="name" item-value="id"
                  variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.threat_mapping_ids" :items="dropdownOptions.threatOptions"
                  :label="$t('risk.threat_mapping')" multiple chips closable-chips item-title="name" item-value="id"
                  variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                  min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="localFormData.created_at" :label="$t('risk.submission_date')"
                      prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" variant="outlined"
                      density="comfortable" />
                  </template>
                  <v-date-picker v-model="localFormData.created_at" @input="dateMenu = false" />
                </v-menu>
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.category_id" :items="dropdownOptions.riskCategoryOptions"
                  :label="$t('risk.category')" item-title="name" item-value="id" variant="outlined"
                  density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.location_ids" :items="dropdownOptions.locationOptions"
                  :label="$t('risk.site_location')" multiple chips closable-chips item-title="name" item-value="id"
                  variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.stakeholder_ids" :items="dropdownOptions.userOptions"
                  :label="$t('risk.additional_stakeholders')" multiple chips closable-chips item-title="full_name"
                  item-value="id" variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.owner_id" :items="dropdownOptions.userOptions"
                  :label="$t('risk.owner')" item-title="full_name" item-value="id" variant="outlined"
                  density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.tag_ids" :items="dropdownOptions.tagOptions"
                  :label="$t('risk.tags')" multiple chips closable-chips item-title="name" item-value="id"
                  variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.team_ids" :items="dropdownOptions.teamOptions"
                  :label="$t('risk.teams')" item-title="name" item-value="id" multiple chips closable-chips
                  variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete v-model="localFormData.vuln_catalogs" :items="dropdownOptions.vulnCatalogsOptions"
                  :label="$t('risk.Vulnerability_Catalogs')" item-title="name" item-value="id" multiple chips
                  closable-chips variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="localFormData.risk_scenario" :label="$t('risk.risk_scenario')" variant="outlined"
                  density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="localFormData.existing_control" :label="$t('risk.existing_control')"
                  variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="localFormData.regulator_id" :items="dropdownOptions.regulatorOptions"
                  item-title="name" item-value="id" label="Select Regulator" variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="localFormData.control_id" :items="controlSelectOptions" label="Control"
                  item-title="short_name" item-value="id" multiple chips closable-chips variant="outlined"
                  density="comfortable" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="localFormData.asset_ids" :items="dropdownOptions.assetOptions"
                  label="Affected Assets" item-title="name" item-value="id" multiple chips closable-chips
                  variant="outlined" density="comfortable" />
              </v-col>

              <v-col cols="6">
                <v-text-field v-model="localFormData.reference_id" :label="$t('risk.external_reference_id')"
                  variant="outlined" density="comfortable" />
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions class="modal-actions">
        <v-spacer></v-spacer>
        <v-btn color="primary" :loading="loading" :disabled="loading" @click="handleUpdate" class="save-btn">
          {{ $t('risk.save_details') }}
        </v-btn>
        <v-btn color="error" :disabled="loading" @click="handleClose" variant="outlined" class="cancel-btn">
          {{ $t('risk.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Regulator from "@/API/Regulator/Regulator";

export default {
  name: 'EditRiskIdentificationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      required: true
    },
    dropdownOptions: {
      type: Object,
      required: true
    },
    controlFilteredOptions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:show', 'update', 'close', 'regulator-change'],
  data() {
    return {
      dateMenu: false,
      suppressRegulatorEmit: false,
      controlOptionsLocal: [],
      localFormData: {
        id: null,
        risk_mapping_ids: [],
        threat_mapping_ids: [],
        created_at: null,
        category_id: null,
        location_ids: [],
        stakeholder_ids: [],
        owner_id: null,
        tag_ids: [],
        team_ids: [],
        vuln_catalogs: [],
        risk_scenario: '',
        exsting_control: '',
        regulator_id: null,
        control_id: [],
        asset_ids: [],
        reference_id: ''
      }
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('update:show', value);
      }
    },
    controlSelectOptions() {
      return (Array.isArray(this.controlOptionsLocal) && this.controlOptionsLocal.length > 0)
        ? this.controlOptionsLocal
        : (this.controlFilteredOptions || []);
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.resetLocalFormData();
      }
    },
    formData: {
      handler(newVal) {
        if (newVal) {
          this.resetLocalFormData();
        }
      },
      deep: true
    },
    'localFormData.regulator_id'(newVal) {
      if (this.suppressRegulatorEmit) return;
      this.fetchRegulatorControls(newVal);
    }
  },
  created() {
    this._regulatorApi = new Regulator();
  },
  methods: {
    resetLocalFormData() {
      this.suppressRegulatorEmit = true;

      this.localFormData = {
        id: this.formData.id,
        risk_mapping_ids: this.formData.risk_mapping_ids ? [...this.formData.risk_mapping_ids] : [],
        threat_mapping_ids: this.formData.threat_mapping_ids ? [...this.formData.threat_mapping_ids] : [],
        created_at: this.formData.created_at || null,
        category_id: this.formData.category_id || null,
        location_ids: this.formData.location_ids ? [...this.formData.location_ids] : [],
        stakeholder_ids: this.formData.stakeholder_ids ? [...this.formData.stakeholder_ids] : [],
        owner_id: this.formData.owner_id || null,
        tag_ids: this.formData.tag_ids ? [...this.formData.tag_ids] : [],
        team_ids: this.formData.team_ids ? [...this.formData.team_ids] : [],
        vuln_catalogs: this.formData.vuln_catalogs ? [...this.formData.vuln_catalogs] : [],
        risk_scenario: this.formData.risk_scenario || '',
        exsting_control: this.formData.exsting_control || '',
        regulator_id: this.formData.regulator_id || null,
        control_id: this.formData.control_id ? [...this.formData.control_id] : [],
        asset_ids: this.formData.asset_ids ? [...this.formData.asset_ids] : [],
        reference_id: this.formData.reference_id || ''
      };

      if (this.localFormData.regulator_id) {
        this.fetchRegulatorControls(this.localFormData.regulator_id)
          .catch(err => console.error('fetchRegulatorControls error during reset:', err))
          .finally(() => {
            this.$nextTick(() => {
              this.suppressRegulatorEmit = false;
            });
          });
      } else {
        this.$nextTick(() => {
          this.suppressRegulatorEmit = false;
        });
      }
    },
    async fetchRegulatorControls(selectedRegulator) {
      this.controlOptionsLocal = [];

      if (!this.suppressRegulatorEmit) {
        this.localFormData.control_id = [];
      }

      if (!selectedRegulator || (Array.isArray(selectedRegulator) && selectedRegulator.length === 0)) {
        return;
      }

      try {
        const regulatorIds = Array.isArray(selectedRegulator)
          ? selectedRegulator
          : [selectedRegulator];

        const allControls = [];

        for (const regulatorId of regulatorIds) {
          const regulatorObject = await this._regulatorApi.show(regulatorId, {
            with: ['frameworks.control']
          });

          if (Array.isArray(regulatorObject?.frameworks) && regulatorObject.frameworks.length > 0) {
            for (const framework of regulatorObject.frameworks) {
              if (framework?.control) {
                const controls = Array.isArray(framework.control) ? framework.control : [framework.control];
                for (const control of controls) {
                  if (!allControls.some(c => c.id === control.id)) {
                    allControls.push(control);
                  }
                }
              }
            }
          }
        }

        this.controlOptionsLocal = allControls.map(control => {
          let displayName = 'Unnamed Control';
          if (control.short_name) displayName = control.short_name;
          else if (control.control_number) displayName = control.control_number;
          else if (control.name) displayName = control.name;
          else if (control.title) displayName = control.title;
          else displayName = `Control ${control.id}`;

          return {
            id: control.id,
            short_name: displayName,
            control_number: control.control_number || '',
            description: control.description || '',
            _original: control
          };
        });

      } catch (error) {
        console.error('Error loading regulator controls:', error);
      }
    },
    handleUpdate() {
      this.$emit('update', this.localFormData);
    },
    handleClose() {
      this.dateMenu = false;
      this.$emit('close');
      this.$emit('update:show', false);
    }
  }
};
</script>

<style scoped>
.v-overlay {
  backdrop-filter: blur(8px);
}

.identification-modal {
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
  font-size: 1.25rem !important;
  color: black;
}

.close-btn {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem !important;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #6E3894;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #5a2d75;
}

.modal-actions {
  padding: 1rem 1.5rem !important;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.save-btn {
  background: linear-gradient(135deg, #6E3894 0%, #5a2d75 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

.cancel-btn {
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
  padding: 0.5rem 2rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: rgba(211, 47, 47, 0.04) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-body {
    padding: 1rem !important;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .save-btn,
  .cancel-btn {
    width: 100%;
  }
}

/* Vue Components Customization */
:deep(.v-autocomplete .v-field),
:deep(.v-select .v-field),
:deep(.v-text-field .v-field) {
  border-radius: 8px;
}

:deep(.v-autocomplete .v-field--focused),
:deep(.v-select .v-field--focused),
:deep(.v-text-field .v-field--focused) {
  border-color: #6E3894;
  box-shadow: 0 0 0 2px rgba(110, 56, 148, 0.1);
}

:deep(.v-chip) {
  background-color: #6E3894 !important;
  color: white !important;
}
</style>