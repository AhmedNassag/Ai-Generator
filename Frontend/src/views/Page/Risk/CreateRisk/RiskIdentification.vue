<template>
  <v-container fluid>
    <v-row>
      <!-- Subject Field -->
      <v-col cols="12" md="6">
        <v-text-field v-model="formData.subject" :label="$t('risk.subject')" :placeholder="$t('risk.select_subject')"
          variant="outlined" density="comfortable" :error-messages="formData?.errors?.subject"></v-text-field>
      </v-col>

      <!-- Risk Category Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedRiskCategory" :items="riskCategoryOptions" item-title="name"
          item-value="id" :label="$t('risk.category')" :placeholder="$t('risk.select_category')" variant="outlined"
          density="comfortable" clearable></v-autocomplete>
      </v-col>

      <!-- Risk Mapping Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedRisks" :items="riskOptions" item-title="name" item-value="id"
          :label="$t('risk.mapping')" :placeholder="$t('risk.select_risks_mapping')" variant="outlined"
          density="comfortable" multiple chips closable-chips></v-autocomplete>
      </v-col>

      <!-- Threat Mapping Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedThreats" :items="threatOptions" item-title="name" item-value="id"
          :label="$t('risk.threat_mapping')" :placeholder="$t('risk.select_threats')" variant="outlined"
          density="comfortable" multiple chips closable-chips></v-autocomplete>
      </v-col>

      <!-- Site/Location Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedLocations" :items="locationOptions" item-title="name" item-value="id"
          :label="$t('risk.site_location')" :placeholder="$t('risk.select_locations')" variant="outlined"
          density="comfortable" multiple chips closable-chips></v-autocomplete>
      </v-col>

      <!-- Owner Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedOwner" :items="userOptions" item-title="full_name" item-value="id"
          :label="$t('risk.owner')" :placeholder="$t('risk.select_owner')" variant="outlined" density="comfortable"
          clearable></v-autocomplete>
      </v-col>

      <!-- Additional Stakeholders Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedStakeholders" :items="userOptions" item-title="full_name"
          item-value="id" :label="$t('risk.additional_stakeholders')" :placeholder="$t('risk.select_stakeholders')"
          variant="outlined" density="comfortable" multiple chips closable-chips></v-autocomplete>
      </v-col>

      <!-- Tags Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedTags" :items="tagOptions" item-title="name" item-value="id"
          :label="$t('risk.tags')" :placeholder="$t('risk.select_tags')" variant="outlined" density="comfortable"
          multiple chips closable-chips></v-autocomplete>
      </v-col>

      <!-- Teams Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedTeams" :items="teamOptions" item-title="name" item-value="id"
          :label="$t('risk.teams')" :placeholder="$t('risk.select_teams')" variant="outlined" density="comfortable"
          multiple chips closable-chips></v-autocomplete>
      </v-col>

      <!-- External Reference ID Field -->
      <v-col cols="12" md="6">
        <v-text-field v-model="formData.selectedReference" :label="$t('risk.external_reference_id')"
          :placeholder="$t('risk.enter_external_reference_id')" variant="outlined" density="comfortable"></v-text-field>
      </v-col>

      <!-- Risk Mapping Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedVulnCatalogs" :items="vulnCatalogsOptions" item-title="name"
          item-value="id" :label="$t('risk.Vulnerability_Catalogs')"
          :placeholder="$t('risk.select_Vulnerability_Catalogs')" variant="outlined" density="comfortable" multiple
          chips closable-chips></v-autocomplete>
      </v-col>

      <!-- External Reference ID Field -->
      <v-col cols="12" md="6">
        <v-text-field v-model="formData.riskScenario" :label="$t('risk.risk_scenario')"
          :placeholder="$t('risk.risk_scenario')" variant="outlined" density="comfortable"></v-text-field>
      </v-col>

      <!-- Affected Assets Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedAssets" :items="assetOptions" item-title="name" item-value="id" chips
          :label="$t('risk.affected_assets')" :placeholder="$t('risk.select_assets')" variant="outlined"
          density="comfortable" multiple></v-autocomplete>
      </v-col>

      <!-- External Reference ID Field -->
      <v-col cols="12" md="6">
        <v-text-field v-model="formData.exstingControl" :label="$t('risk.existing_control')"
          :placeholder="$t('risk.existing_control')" variant="outlined" density="comfortable"></v-text-field>
      </v-col>

      <!-- Regulator Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedRegulator" :items="regulatorOptions" item-title="name" item-value="id"
          :label="$t('risk.control_regulation')" :placeholder="$t('risk.select_regulator')"
          @update:model-value="onRegulatorChange" variant="outlined" density="comfortable" clearable />
      </v-col>

      <!-- Control Field -->
      <v-col cols="12" md="6">
        <v-autocomplete v-model="formData.selectedControl" :items="controlOptions" item-title="short_name"
          item-value="id" chips multiple :label="$t('risk.control')" :placeholder="$t('risk.select_control')"
          variant="outlined" density="comfortable" clearable />
      </v-col>


    </v-row>
  </v-container>
</template>

<script>
import RiskCategory from "@/API/RiskCategory/RiskCategory";
import ThreatCatalog from "@/API/ThreatCatalog/ThreatCatalog";
import Location from "@/API/Location/Location";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import RiskCatalog from "@/API/RiskCatalog/RiskCatalog";
import tag from "@/API/tag/tag";
import VulnerabilityCatalogue from "@/API/VulnerabilityCatalogue/VulnerabilityCatalogue";
import Asset from '@/API/Asset/Asset';
import Regulator from "@/API/Regulator/Regulator";
import Control from "@/API/Control/Control";

export default {
  name: 'RiskAssessmentDetailsForm',

  inject: ['formData'],
  setup() {
    const riskCategory = new RiskCategory();
    const threatCatalog = new ThreatCatalog();
    const location = new Location();
    const user = new User();
    const team = new Team();
    const riskCatalog = new RiskCatalog();
    const tagObject = new tag();
    const vulnerabilitycatalogue = new VulnerabilityCatalogue();
    const asset = new Asset();
    const regulator = new Regulator();
    const control = new Control();

    return {
      riskCategory,
      threatCatalog,
      location,
      user,
      team,
      riskCatalog,
      tagObject,
      vulnerabilitycatalogue,
      asset,
      regulator,
      control,

    };
  },

  data() {
    return {

      riskCategoryOptions: [],
      riskOptions: [],
      threatOptions: [],
      locationOptions: [],
      userOptions: [],
      tagOptions: [],
      teamOptions: [],
      loading: false,
      vulnCatalogsOptions: [],
      assetOptions: [],
      regulatorOptions: [],
      controlOptions: [],
    };
  },

  created() {
    // Initialize formData if not injected
    if (!this.formData) {
      this.formData = {
        subject: '',
        selectedRiskCategory: null,
        selectedRisks: [],
        selectedThreats: [],
        selectedLocations: [],
        selectedOwner: null,
        selectedStakeholders: [],
        selectedTags: [],
        selectedTeams: [],
        selectedAssets: [],
        selectedReference: '',
        riskScenario: '',
        selectedVulnCatalogs: [],
        exstingControl: '',
        errors: {},
        selectedRegulator: [],
        selectedControl: [],
      };
    }

    // Initialize errors object if it doesn't exist
    if (!this.formData.errors) {
      this.formData.errors = {};
    }
  },

  async mounted() {
    this.loading = true;
    try {
      // Load all dropdown options in parallel for better performance
      const [
        riskCategoryData,
        riskData,
        threatData,
        locationData,
        userData,
        teamData,
        tagData,
        vulnCatalogsData
      ] = await Promise.all([
        this.riskCategory.getAll({ select: 'id|name' }),
        this.riskCatalog.getAll({ select: 'id|name' }),
        this.threatCatalog.getAll({ select: 'id|name' }),
        this.location.getAll({ select: 'id|name' }),
        this.user.getAll({ select: 'id|full_name' }),
        this.team.getAll({ select: 'id|name' }),
        this.tagObject.getAll({ select: 'id|name' }),
        this.vulnerabilitycatalogue.getAll({ select: 'id|name' })
      ]);

      this.riskCategoryOptions = riskCategoryData || [];
      this.riskOptions = riskData || [];
      this.threatOptions = threatData || [];
      this.locationOptions = locationData || [];
      this.userOptions = userData || [];
      this.teamOptions = teamData || [];
      this.tagOptions = tagData || [];
      this.vulnCatalogsOptions = vulnCatalogsData || [];
      this.assetOptions = await this.asset.getAll({ select: "id|name" }) || [];
      // Fetch options for dropdowns
      this.regulatorOptions = await this.regulator.getAll({ select: "id|name" }) || [];
      // If a regulator is already selected, load its controls
      if (this.formData.selectedRegulator) {
        await this.loadControlsForRegulator(this.formData.selectedRegulator);
      }

    } catch (error) {
      console.error("Error loading form data:", error);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async loadControlsForRegulators(selectedRegulators) {
      if (!selectedRegulators || selectedRegulators.length === 0) {
        this.controlOptions = [];
        return;
      }

      this.controlOptions = [];
      this.formData.selectedControl = null;

      try {
        for (let i = 0; i < selectedRegulators.length; i++) {
          const regulatorId = selectedRegulators[i];
          const regulatorObject = await this.regulator.show(regulatorId, {
            with: ['frameworks.control']
          });

          if (regulatorObject?.frameworks?.length > 0) {
            for (let j = 0; j < regulatorObject.frameworks.length; j++) {
              const framework = regulatorObject.frameworks[j];
              if (framework?.control) {
                // Merge unique controls
                const controls = Array.isArray(framework.control)
                  ? framework.control
                  : [framework.control];

                controls.forEach(ctrl => {
                  if (!this.controlOptions.some(c => c.id === ctrl.id)) {
                    this.controlOptions.push(ctrl);
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading controls:", error);
      }
    },

    async onRegulatorChange() {
      // Clear existing control options and selection
      this.controlOptions = [];
      this.formData.selectedControl = [];

      // Check if regulator is selected
      if (!this.formData.selectedRegulator || this.formData.selectedRegulator.length === 0) {
        return;
      }

      try {
        // Convert single value to array for consistent handling
        const regulatorIds = Array.isArray(this.formData.selectedRegulator)
          ? this.formData.selectedRegulator
          : [this.formData.selectedRegulator];

        // Collect all controls from selected regulators
        const allControls = [];

        for (const regulatorId of regulatorIds) {
          const regulatorObject = await this.regulator.show(regulatorId, {
            with: ['frameworks.control']
          });

          console.log(`Regulator ${regulatorId} data:`, regulatorObject);

          if (regulatorObject?.frameworks?.length > 0) {
            for (const framework of regulatorObject.frameworks) {
              if (framework?.control) {
                // Handle both single control and array of controls
                const controls = Array.isArray(framework.control)
                  ? framework.control
                  : [framework.control];

                controls.forEach(control => {
                  // Check if control already exists to avoid duplicates
                  if (!allControls.some(c => c.id === control.id)) {
                    allControls.push(control);
                  }
                });
              }
            }
          }
        }

        // Process controls for the dropdown
        this.controlOptions = allControls.map(control => {
          // Create a proper display name
          let displayName = 'Unnamed Control';

          if (control.short_name) {
            displayName = control.short_name;
          } else if (control.control_number) {
            displayName = control.control_number;
          } else if (control.name) {
            displayName = control.name;
          } else if (control.title) {
            displayName = control.title;
          } else {
            displayName = `Control ${control.id}`;
          }

          return {
            id: control.id,
            short_name: displayName,
            control_number: control.control_number || '',
            description: control.description || '',
            // Keep original for reference
            _original: control
          };
        });

        console.log('Processed control options:', this.controlOptions);

      } catch (error) {
        console.error('Error loading regulator controls:', error);
      }
    },


    validate() {
      // Reset errors
      this.formData.errors = {};

      // Basic validation
      if (!this.formData.subject || this.formData.subject.trim() === '') {
        this.formData.errors.subject = 'Subject is required';
      }

      if (!this.formData.selectedRiskCategory) {
        this.formData.errors.selectedRiskCategory = 'Risk Category is required';
      }

      // Return whether the form is valid
      return Object.keys(this.formData?.errors)?.length === 0;
    },

    resetForm() {
      this.formData.subject = '';
      this.formData.selectedRiskCategory = null;
      this.formData.selectedRisks = [];
      this.formData.selectedThreats = [];
      this.formData.selectedLocations = [];
      this.formData.selectedOwner = null;
      this.formData.selectedStakeholders = [];
      this.formData.selectedTags = [];
      this.formData.selectedTeams = [];
      this.formData.selectedReference = '';
      this.formData.selectedAssets = [];
      this.formData.errors = {};
      this.formData.riskScenario = '';
      this.formData.selectedVulnCatalogs = [];
      this.formData.exstingControl = '';
      this.formData.selectedRegulator = [];
      this.formData.selectedControl = [];
    }
  }
};
</script>