<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="true" :mainPage="$t('common.configration')"
    :mainSubPage="$t('vst_integration.vst_integration')" :titlePage="$t('vst_integration.vst_integration')">
    <template #datatable>
      <!-- Dropdown to select between Tenable and Qualys -->
      <div class="col-md-6 mb-3">
        <label for="type">{{ $t('vst_integration.type') }}</label>
        <select class="form-select" id="type" v-model="selectedType" @change="onTypeChange">
          <option value="tenable">Tenable</option>
          <option value="qualys">Qualys</option>
        </select>
      </div>

      <!-- Tenable Form -->
      <Form v-if="selectedType === 'tenable'" :schema="tenableFields" :newItem="newItem" :api="api"
        :closeForm="closeForm" :formData="true">
        <!-- Active/Inactive Toggle -->
        <template #is_active="{ item }">
          <div class="col-md-12 mb-3">
            <label for="is_active">{{ $t('common.status') }}</label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="is_active" v-model="newItem.is_active"
                required />
              <label class="form-check-label" for="is_active">{{ newItem.is_active ? $t('common.active') :
                $t('common.inactive') }}</label>
            </div>
          </div>
        </template>

        <template #access_key="{ item }">
          <div class="col-md-6 mb-3">
            <label for="access_key">{{ $t('vst_integration.access_key') }}</label>
            <input class="form-control" id="access_key" :placeholder="$t('vst_integration.access_key_placeholder')"
              v-model="newItem.access_key" />
          </div>
        </template>
        <template #secret_key="{ item }">
          <div class="col-md-6 mb-3">
            <label for="secret_key">{{ $t('vst_integration.secret_key') }}</label>
            <input class="form-control" :placeholder="$t('vst_integration.secret_key_placeholder')" id="secret_key"
              v-model="newItem.secret_key" />
          </div>
        </template>

        <!-- Submit Button -->
        <div class="col-md-12 mb-3">
          <button type="button" class="btn btn-primary" @click="submitForm">{{ $t('common.submit') }}</button>
        </div>
      </Form>

      <!-- Qualys Form -->
      <Form v-if="selectedType === 'qualys'" :schema="qualysFields" :newItem="newItem" :api="api" :closeForm="closeForm"
        :formData="true">
        <!-- Active/Inactive Toggle -->
        <template #is_active="{ item }">
          <div class="col-md-12 mb-3">
            <label for="is_active">{{ $t('common.status') }}</label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="is_active" v-model="newItem.is_active"
                required />
              <label class="form-check-label" for="is_active">{{ newItem.is_active ? $t('common.active') :
                $t('common.inactive') }}</label>
            </div>
          </div>
        </template>

        <template #username="{ item }">
          <div class="col-md-6 mb-3">
            <label for="username">{{ $t('common.username') }}</label>
            <input class="form-control" id="username" :placeholder="$t('common.username_placeholder')"
              v-model="newItem.username" />
          </div>
        </template>
        <template #password="{ item }">
          <div class="col-md-6 mb-3">
            <label for="password">{{ $t('common.password') }}</label>
            <input class="form-control" id="password" type="password" :placeholder="$t('common.password_placeholder')"
              v-model="newItem.password" />
          </div>
        </template>

        <!-- Submit Button -->
        <div class="col-md-12 mb-3">
          <button type="button" class="btn btn-primary" @click="submitForm">{{ $t('common.submit') }}</button>
        </div>
      </Form>
    </template>
  </main-page>
</template>

<script>
import VSTIntegration from "@/API/VSTIntegration/VSTIntegration";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";

export default {
  components: {
    MainPage,
    Form,
  },

  setup() {
    const api = new VSTIntegration();
    const apiParams = {
      filter: `type|tenable`,
    };

    return {
      api,
      apiParams,
    };
  },

  data() {
    return {
      isReadonly: false,
      newItem: { type: "tenable" }, // Default type
      selectedType: "tenable", // Default selected type
      tenableFields: [
        {
          name: "is_active",
        },
        {
          name: "access_key",
        },
        {
          name: "secret_key",
        },
      ],
      qualysFields: [
        {
          name: "is_active",
        },
        {
          name: "username",
        },
        {
          name: "password",
        },
      ],
    };
  },

  methods: {
    // Close the form (reset or hide it)
    closeForm() {
      this.newItem = { type: this.selectedType, is_active: this.newItem.is_active }; // Reset form data but keep is_active
    },

    // Handle type change in the dropdown
    async onTypeChange() {
      this.apiParams.filter = `type|${this.selectedType}`;
      this.newItem.type = this.selectedType;
      await this.fetchData();
    },

    // Fetch data from the API based on the selected type
    async fetchData() {
      try {
        // Make the API call with the filter parameter
        const response = await new VSTIntegration().getAll({
          filter: `type|${this.selectedType}`,
        });

        // Check if data is returned
        if (response && response.length > 0) {
          const activeItem = response.find((item) => item.is_active === "true");

          // If an active item is found, populate the form fields
          if (activeItem) {
            this.newItem = {
              ...this.newItem,
              is_active: activeItem.is_active,
            };
          } else {
            this.newItem = {
              ...this.newItem,
              is_active: false,
            };
          }
        } else {
          this.newItem = { type: this.selectedType };
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    // Submit the form with only relevant fields
    async submitForm() {
      // Create a payload with only the relevant fields
      const payload = { ...this.newItem };

      // Remove unnecessary fields based on the selected type
      if (this.selectedType === "tenable") {
        delete payload.username;
        delete payload.password;
      } else if (this.selectedType === "qualys") {
        delete payload.access_key;
        delete payload.secret_key;
      }

      try {
        // Send the payload to the API
        const response = await this.api.submitData(payload);
        this.closeForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  },

  // Fetch Tenable data by default on page load
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.form-check-input {
  cursor: pointer;
}
</style>

<style>
.page-title-card {
  padding-inline: 1.5625rem !important;
  padding-block: 0.625rem !important;
}
</style>