<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('phishingsenderprofile.Awareness')"
    :mainSubPage="$t('phishingsenderprofile.Campaign')" :subPage="$t('phishingsenderprofile.phishingsenderprofile')"
    :titlePage="$t('phishingsenderprofile.phishingsenderprofile')" v-permission:show>

    <!-- Slot for rendering the DataTable -->
    <div v-permission:edit v-permission:delete></div>
    <template #datatable>
      <DataTable v-permission:show ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="{}" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }"> {{ $t('phishingsenderprofile.MyPrefix') }} {{ item.name }} </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>

  <v-dialog 
  v-model="dialog" 
  max-width="900px" 
  persistent
  content-class="figma-dialog-wrapper"
>
  <div class="figma-dialog">
    <!-- Header -->
    <div class="figma-dialog-header">
      <h2 class="figma-dialog-title">
        {{ formData.id ? $t('phishingsenderprofile.EditSenderProfile') : $t('phishingsenderprofile.AddNewSenderProfile') }}
      </h2>
      <button class="figma-close-button" @click="closeDialog">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="figma-dialog-content">
      <form ref="form" @submit.prevent="saveItem">
        <div class="row">
          <!-- Profile Name -->
          <div class="figma-form-field col-6">
            <label class="figma-form-label">{{ $t('phishingsenderprofile.ProfileName') }}</label>
            <input 
              type="text" 
              v-model="formData.name" 
              class="figma-input"
              :placeholder="$t('phishingsenderprofile.ProfileName')"
            />
          </div>

          <!-- From Display Name -->
          <div class="figma-form-field col-6">
            <label class="figma-form-label">{{ $t('phishingsenderprofile.FromDisplayName') }}</label>
            <input 
              type="text" 
              v-model="formData.from_display_name" 
              class="figma-input"
              :placeholder="$t('phishingsenderprofile.FromDisplayName')"
            />
          </div>

          <!-- Type Selection -->
          <div class="figma-form-field col-12">
            <label class="figma-form-label">{{ $t('phishingsenderprofile.Type') }}</label>
            <div class="figma-type-selector">
              <label class="figma-type-option" :class="{ 'figma-type-option-active': formData.type === 'managed' }">
                <input 
                  type="radio" 
                  v-model="formData.type" 
                  value="managed"
                  class="figma-type-radio"
                />
                <i class="fas fa-check-circle figma-type-icon"></i>
                <span class="figma-type-text">{{ $t('phishingsenderprofile.Managed') }}</span>
              </label>
              <label class="figma-type-option" :class="{ 'figma-type-option-active': formData.type === 'own' }">
                <input 
                  type="radio" 
                  v-model="formData.type" 
                  value="own"
                  class="figma-type-radio"
                />
                <i class="fas fa-check-circle figma-type-icon"></i>
                <span class="figma-type-text">{{ $t('phishingsenderprofile.Own') }}</span>
              </label>
            </div>
          </div>

          <!-- From Address Name -->
          <div class="figma-form-field" :class="formData.type === 'managed' ? 'col-6' : 'col-12'">
            <label class="figma-form-label">{{ $t('phishingsenderprofile.FromAddressName') }}</label>
            <input 
              type="text" 
              v-model="formData.from_address_name" 
              class="figma-input"
              :placeholder="$t('phishingsenderprofile.FromAddressName')"
            />
          </div>

          <!-- Domain (only for managed type) -->
          <div v-if="formData.type === 'managed'" class="figma-form-field col-6">
            <label class="figma-form-label">{{ $t('phishingsenderprofile.Domain') }}</label>
            <!-- <v-select 
              id="Domain" 
              v-model="formData.website_domain_id" 
              :options="domains"
              :placeholder="$t('phishingsenderprofile.SelectDomain')" 
              :reduce="option => option.id" 
              label="name"
              clearable
              class="figma-select"
            ></v-select> -->

            <LazySelectField name="Domain" options="PhishingDomain"
                v-model="formData.website_domain_id"
                :placeholder="$t('phishingsenderprofile.SelectDomain')"
                option-label="name" option-value="id" />
          </div>
        </div>
      </form>
    </div>

    <!-- Footer -->
    <div class="figma-dialog-footer">
      <button type="button" class="figma-button figma-button-cancel" @click="closeDialog">
        {{ $t('phishingsenderprofile.Cancel') }}
      </button>
      <button type="button" class="figma-button figma-button-save" @click="saveItem">
        {{ formData.id ? $t('phishingsenderprofile.Update') : $t('phishingsenderprofile.Save') }}
      </button>
    </div>
  </div>
</v-dialog>

</template>

<style scoped>
.figma-dialog-wrapper {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.figma-dialog {
  width: 100%;
  max-width: 900px;
  background: #f5f5f5;
  padding: 4px 18px;
  border-radius: 16px !important;
  overflow: hidden;
  position: relative;
}

.figma-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 15px 0 !important;
}

.figma-dialog-title {
  font-size: 16px;
  font-weight: 700;
  color: #000;
  margin: 0;
  line-height: 1.2;
}

.figma-close-button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #404040;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.figma-close-button:hover {
  color: #000000;
}

.figma-dialog-content {
  padding: 7px 15px !important;
  max-height: 60vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
}

.figma-form-field {
  margin-bottom: 16px;
  position: relative;
}

.figma-form-field:last-child {
  margin-bottom: 0;
}

.figma-form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #404040;
  margin-bottom: 8px;
  line-height: 1.5;
}

.figma-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: #111827;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 8px !important;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
  min-height: 40px;
}

.figma-input:hover {
  border-color: #9CA3AF;
}

.figma-input:focus {
  border-color: #6E3894;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

/* Custom Select Styling */
.figma-select {
  width: 100%;
}

.figma-select :deep(.vs__dropdown-toggle) {
  min-height: 40px;
  border: 1px solid #D1D5DB;
  border-radius: 8px !important;
  padding: 6px 14px;
  background: #FFFFFF;
}

.figma-select :deep(.vs__dropdown-toggle):hover {
  border-color: #9CA3AF;
}

.figma-select :deep(.vs__selected) {
  color: #111827;
  font-size: 14px;
  margin: 0;
  padding: 0;
}

.figma-select :deep(.vs__search) {
  font-size: 14px;
  margin: 0;
  padding: 4px 0;
}

.figma-select :deep(.vs__search::placeholder) {
  color: #9CA3AF;
}

.figma-select :deep(.vs__actions) {
  padding: 0 4px;
}

/* Type Selector */
.figma-type-selector {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.figma-type-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 20px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: #FFFFFF;
  min-width: 140px;
}

.figma-type-option:hover {
  border-color: #6E3894;
  background: #F9FAFB;
}

.figma-type-option-active {
  border-color: #6E3894;
  background: #F3F4F6;
}

.figma-type-radio {
  display: none;
}

.figma-type-icon {
  font-size: 20px;
  color: #6E3894;
}

.figma-type-option:not(.figma-type-option-active) .figma-type-icon {
  color: #D1D5DB;
}

.figma-type-text {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

.figma-dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 24px !important;
}

.figma-button {
  height: 23px;
  padding: 0 24px !important;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px !important;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-transform: none;
}

.figma-button-cancel {
  background: transparent;
  color: #43235c !important;
  border: 1px solid #6E3894 !important;
}

.figma-button-cancel:hover {
  background: #f3e8ff;
}

.figma-button-save {
  background: #6E3894 !important;
  color: #FFFFFF !important;
}

.figma-button-save:hover:not(:disabled) {
  background: #5b2d7a !important;
}

.figma-button-save:disabled {
  background: #D1D5DB !important;
  cursor: not-allowed;
}

/* Scrollbar Styles */
.figma-dialog-content::-webkit-scrollbar {
  width: 6px;
}

.figma-dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.figma-dialog-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.figma-dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Responsive */
@media (max-width: 768px) {
  .figma-type-selector {
    flex-direction: column;
  }
  
  .figma-type-option {
    width: 100%;
  }

  .figma-dialog-header {
    padding: 12px 16px 0 !important;
  }

  .figma-dialog-content {
    padding: 0 12px !important;
  }

  .figma-dialog-footer {
    padding: 12px 16px !important;
  }
}

@media (max-width: 540px) {
  .figma-dialog {
    width: calc(100vw - 32px);
    max-width: 900px;
  }
}
</style>

<script>
// Importing necessary components and API modules
import phishingsenderprofile from "@/API/PhishingSenderProfile/PhishingSenderProfile";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import PhishingDomain from "@/API/PhishingDomain/PhishingDomain";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import LazySelectField from '@/components/LazySelectField.vue';

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    vSelect,
    LazySelectField
  },

  setup() {
    // Initialize API and other required properties
    const api = new phishingsenderprofile();
    const phishingDomains = new PhishingDomain();

    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      phishingDomains,
      fromFields
    };
  },

  computed: {
    colSize() {
      return this.formData.type === 'managed' ? 6 : 12;
    }
  },

  async mounted() {
    // await this.fetchPhishingDomains();
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item

      dialog: false,
      formData: {
        id: null,
        name: '',
        from_display_name: '',
        type: 'managed',
        from_address_name: '',
        website_domain_id: '',
      },
      domains: [],


    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("phishingsenderprofile.name"), data: "name", defaultContent: "N/A" },
      { title: this.$t("phishingsenderprofile.fromDisplayName"), data: "from_display_name", defaultContent: "N/A" },
      { title: this.$t("phishingsenderprofile.fromAddressName"), data: "from_address_name", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("phishingsenderprofilename"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your full name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "email",
        label: this.$t("phishingsenderprofileemail"),
        type: "text", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: "Please enter a valid email address.",
        col: 6,
      },
      {
        type: "options",  // Dropdown/select field
        name: "myOptions",
        label: this.$t("phishingsenderprofile.my_options"),
        options: [
          { id: 1, name: "Option 1" },
          { id: 2, name: "Option 2" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: "Select Options to customize for the client",
      },
      {
        name: "terms",
        label: this.$t("phishingsenderprofile.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: "You must accept the terms and conditions.",
        col: 6,
      },
      {
        name: "description",
        label: this.$t("phishingsenderprofile.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide a description of the project.",
        col: 12,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.dialog = true
      // this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.formData = { ...data };
      this.dialog = true;
      // this.newItem = data;  // Set the current item to edit
      // this.isFlipped = true; // Show the form for editing
    },

    async saveItem() {
      let response = null;
      if (this.formData.id) {
        console.log('enter edit')
        response = await this.api.update(this.formData);
      } else {
        response = await this.api.insert(this.formData);
      }

      if (response.status == "success") {
        this.api.poup(response, "Saved Successfully!");
        this.closeDialog();
      } else {
        this.api.poup(response, "Validation Error !");
      }

      this.$refs.table.refreshTable();  // Refresh the table data

      // this.page = 1;
      // response = await this.api.getAll();
      // this.phishingWebsites = [];
      // await this.fetchPhishingwebsites(this.$route.params.id);
    },

    async fetchPhishingDomains() {
      const res = await this.phishingDomains.getAll({
        select: "id|name",
      });
      this.domains = res;
    },

    closeDialog() {
      this.dialog = false;

      this.formData.id = null;
      this.formData.name = '';
      this.formData.from_display_name = '';
      this.formData.type = 'managed';
      this.formData.from_address_name = '';
      this.formData.website_domain_id = '';
    }

  },
};
</script>
