<template>
  <PurpleDotsLoader v-if="isLoading" />
  <main-page v-else ref="page" :isFlipped="isFlipped" :mainPage="$t('regulator.Governance')"
    :mainSubPage="$t('regulator.Regulator Management')" :subPage="$t('regulator.Regulator')"
    :titlePage="$t('regulator.regulator')" v-permission:show>
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div class="d-flex justify-content-between align-items-center rtl">
        <h2 class="regulator-management-title">Regulator Management</h2>
        <button class="btn btn-primary mb-10 my-3" @click="openForm" v-permission:insert>
          <i class="fa fa-plus"></i> {{ $t("regulator.add_regulator") }}
        </button>
      </div>

      <!-- Content -->
      <div class="row g-4 parent rtl">
        <div v-for="regulator in regulators" :key="regulator.id" class="col-12 col-xl-4 col-md-6">
          <div class="card regulator-card shadow-sm d-flex flex-column">
            <div
              class="card-header d-flex justify-content-between align-items-center p-3 position-sticky top-0 w-100 rtl">
              <div class="d-flex align-items-center flex-grow-1 rtl rtl-end">
                <img :src="regulator.fullLogoPath || defaultImage" alt="Regulator Logo" class="regulator-logo" />
                <div class="ms-3 d-flex flex-column align-items-start gap-2">
                  <h6 class="regulator-name mb-0">{{ regulator.name }}</h6>
                  <span class="framework-count-badge">
                    {{ regulator.frameworks?.length || 0 }}
                    {{ $t("framework.frameworks") }}
                  </span>
                </div>
              </div>

              <div class="dropdown">
                <button class="btn-sm dropdown-toggle-custom" type="button" data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </button>
                <ul class="dropdown-menu">
                  <li v-permission:update>
                    <button class="dropdown-item" @click="editRegulator(regulator)">
                      <i class="fa fa-edit"></i> {{ $t("regulator.edit") }}
                    </button>
                  </li>
                  <li v-if="regulator?.frameworks?.length == 0" v-permission:delete>
                    <button class="dropdown-item text-danger" @click="deleteRegulator(regulator)">
                      <i class="fa fa-trash"></i> {{ $t("regulator.delete") }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body flex-grow-1 overflow-y-auto w-100"
              style="scrollbar-width: none; -ms-overflow-style: none">
              <div v-for="framework in regulator.frameworks" :key="framework.id" class="framework-item mb-3">
                <!-- Framework Name and Percentage Row -->
                <div class="d-flex justify-content-between align-items-center mb-2 rtl">
                  <h4 class="framework-title mb-0">{{ framework.title }}</h4>
                  <span class="progress-percentage">{{
                    framework.progress || "0%"
                  }}</span>
                </div>

                <!-- Progress Bar Row -->
                <div class="progress-bar-container mb-2">
                  <div class="progress-bar-fill" :style="{
                    width: framework.progress || '0%',
                    backgroundColor: '#6E3894',
                  }"></div>
                </div>

                <!-- Details Button Row -->
                <div class="d-flex justify-content-end">
                  <router-link :to="{ path: `/frameworks/${framework.id}` }" class="details-link"
                    v-permission:showFramework>
                    <button class="details-btn">
                      <i class="fa fa-circle-info"></i>
                      {{ $t("framework.details") }}
                    </button>
                  </router-link>
                </div>
              </div>
            </div>
            <!-- Card Footer -->
            <div class="card-footer position-sticky bottom-0 w-100">
              <button v-permission:insertFramework class="add-framework-btn w-100"
                @click="openFrameworkModal(regulator.id)">
                <i class="fa fa-plus"></i> {{ $t("framework.addframework") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
        <template #fullLogoPath="{ item }">
          <div class="col-6 ms-auto d-inline-block" v-if="newItem.fullLogoPath">
            <img :src="newItem.fullLogoPath" alt="No image" class="rounded-circle d-block mx-auto"
              style="width: 80px; height: 80px; object-fit: cover" />
          </div>
        </template>
      </Form>
    </template>
  </main-page>
  <!-- Framework Modal -->
  <div v-permission:insert v-if="isFrameworkModalOpen" class="modal-overlay" @scroll="handleScroll">
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ $t("framework.add_framework") }}</h2>
          <span class="close" @click="closeFrameworkModal">&times;</span>
        </div>
        <div class="modal-body" ref="modalBody" @scroll="handleScroll">
          <form @submit.prevent="submitFrameworkForm">
            <!-- Owner and Title Row -->
            <div class="row">
              <!-- Owner Field -->
              <div class="col-md-6 form-group">
                <label for="owner">{{ $t("framework.owner") }}:</label>
                <UserSelect v-model="frameworkFormData.owner" :multiple="false"
                  :placeholder="$t('framework.select_owner')" />
              </div>

              <!-- Title Field -->
              <div class="col-md-6 form-group">
                <label for="title">{{ $t("framework.title") }}:</label>
                <input id="title" v-model="frameworkFormData.title" type="text" class="form-control"
                  :placeholder="$t('framework.enter_title')" required />
              </div>
            </div>

            <!-- Domain and Sub Domain Row -->
            <div class="row">
              <!-- Domain Multi-Select -->
              <div class="col-md-6 form-group">
                <label for="domain">{{ $t("framework.domain") }}:</label>
                <v-multiselect id="domain" v-model="frameworkFormData.domain" :options="domains" :multiple="true"
                  :close-on-select="true" :placeholder="$t('framework.select_domains')" label="name"
                  track-by="id"></v-multiselect>
              </div>

              <!-- Sub Domain Multi-Select -->
              <div class="col-md-6 form-group">
                <label for="subDomain">{{ $t("framework.subdomain") }}:</label>
                <v-multiselect id="subDomain" v-model="frameworkFormData.sub_domain" :options="sub_domains"
                  :multiple="true" :close-on-select="true" :placeholder="$t('framework.select_subdomains')" label="name"
                  track-by="id"></v-multiselect>
              </div>
            </div>

            <!-- Description Field -->
            <div class="form-group">
              <label for="description">{{ $t("framework.description") }}:</label>
              <textarea id="description" v-model="frameworkFormData.description" class="form-control" rows="4"
                :placeholder="$t('framework.enter_description')" required></textarea>
            </div>
          </form>
        </div>
        <div class="form-actions" :class="{ 'form-actions-shadow': isScrolled }">
          <div class="form-actions-buttons">
            <button type="button" class="btn-secondary" @click="closeFrameworkModal">
              {{ $t("common.cancel") || "Cancel" }}
            </button>
            <button type="submit" class="btn-primary" @click="submitFrameworkForm" v-permission:insertFramework>
              {{ $t("framework.submit") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import regulator from "@/API/Regulator/Regulator";
import Form from "@/components/Form.vue";
import Multiselect from "vue-multiselect";
import frameworks from "@/API/Frameworks/Frameworks";
import user from "@/API/User/User";
import domain from "@/API/Domain/Domain";
import DataTable from "@/components/DataTable.vue";
import MainPage from "@/components/MainPage.vue";
import UserSelect from "@/components/UserSelect.vue";
import PurpleDotsLoader from '@/components/PurpleDotsLoader.vue';

// Try the simple version for debugging
// import UserSelect from "@/components/UserSelectSimple.vue";
import { ref } from "vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    UserSelect,
    "v-multiselect": Multiselect,
    PurpleDotsLoader
  },

  setup() {
    const api = new regulator();
    const tableColumns = [];
    const fromFields = [];
    const apiParams = {
      with: ["frameworks"],
      select: "id|name|logo",
    };

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false,
      newItem: {},
      defaultImage: "https://picsum.photos/200",
      regulators: ref([]),
      isLoading: false, // Add loading state
      isFrameworkModalOpen: false,
      isScrolled: false,
      selectedOwner: null,
      frameworkFormData: {
        title: "",
        domain: [],
        sub_domain: [],
        owner: null,
        icon: "",
        description: "",
        regulator_id: null,
      },
      domains: [],
      sub_domains: [],
      frameworksApi: new frameworks(),
      userApi: new user(),
      domainApi: new domain(),
    };
  },

  async created() {
    this.tableColumns = [
      { title: this.$t("regulator.name"), data: "name", defaultContent: "N/A" },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("regulator.name"),
        type: "text",
        rules: "required",
        description: this.$t("regulator.please_enter_regulator_name"),
        col: 6,
      },
      {
        name: "logo",
        label: this.$t("regulator.logo"),
        type: "file",
        rules: "",
        description: this.$t("regulator.please_select_regulator_logo"),
        col: 6,
      },

      {
        name: "fullLogoPath",
        label: this.$t("regulator.fullLogoPath"),
        rules: "",
        col: 6,
        type: "file",
        hidden: true,
      },
    ];
    this.isLoading = true; // Start loading
    try {
      await this.fetchFrameworks();
      await this.fetchMainDomains();
      await this.fetchRegulators();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  },

  methods: {
    calculateProgress(framework) {
      return Math.floor(Math.random() * 100);
    },

    getFrameworkColor(percentage) {
      if (percentage < 50) return "#ffa1a1";
      if (percentage >= 50 && percentage <= 80) return "#ffe700";
      return "#00d4bd";
    },

    editRegulator(regulator) {
      this.newItem = regulator;
      this.isFlipped = true;
    },

    async deleteRegulator(regulator) {
      try {
        const response = await this.api.delete(regulator.id);
        this.fetchRegulators();
      } catch (error) {
        console.error("Failed to delete regulator:", error);
      }
    },

    openFrameworkModal(regulatorId) {
      this.frameworkFormData.regulator_id = regulatorId;
      this.isFrameworkModalOpen = true;
    },

    closeFrameworkModal() {
      this.isFrameworkModalOpen = false;
      this.resetFrameworkFormData();
    },

    resetFrameworkFormData() {
      this.frameworkFormData = {
        title: "",
        domain: [],
        sub_domain: [],
        icon: "",
        description: "",
        owner: null,
        regulator_id: null,
      };
      this.sub_domains = [];
      this.isScrolled = false;
    },

    async submitFrameworkForm() {
      try {
        console.log(
          "Submitting framework form with data:",
          this.frameworkFormData
        );

        const response = await this.api.insertFramework(this.frameworkFormData);
        if (response) {
          await this.fetchRegulators();
          this.closeFrameworkModal();
          this.resetFrameworkFormData();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },

    async fetchRegulators() {
      try {
        const response = await this.api.fetchData();
        this.regulators = response?.data?.data || [];
      } catch (error) {
        console.error("Failed to fetch regulators:", error);
      }
    },

    async fetchFrameworks() {
      try {
        this.frameworks = await this.frameworksApi.getAll();
      } catch (error) {
        console.error("Error fetching frameworks:", error);
      }
    },

    async fetchMainDomains() {
      try {
        const response = await this.domainApi.getAll();
        if (response && Array.isArray(response)) {
          this.domains = response
            .filter((item) => item.parent_id === null)
            .map((item) => ({ id: item.id, name: item.name }));
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Error fetching the hierarchy:", error);
      }
    },
    async fetchSubDomainsByDomainId(domainId) {
      try {
        const response = await this.domainApi.showSubDomainInDomain(domainId);

        console.log("Subdomains response:", response);

        // Access the `data` property of the response
        const responseData = response;

        // Check if the response data is an array
        if (Array.isArray(responseData)) {
          return responseData.map((item) => ({
            id: item.id,
            name: item.name,
            parent_id: item.parent_id,
          }));
        } else {
          console.error("Unexpected API response format:", responseData);
          return [];
        }
      } catch (error) {
        console.error("Error fetching sub-domains:", error);
        return [];
      }
    },

    async updateSubDomains() {
      this.sub_domains = []; // Reset subdomains list

      // Fetch subdomains for each selected domain
      for (const domain of this.frameworkFormData.domain) {
        const subDomains = await this.fetchSubDomainsByDomainId(domain.id);
        this.sub_domains.push(...subDomains);
      }

      // Remove subdomains from selection if their parent domain is no longer selected
      this.frameworkFormData.sub_domain =
        this.frameworkFormData.sub_domain.filter((subDomain) => {
          // Check if the subdomain's parent is still in the selected domains
          return this.frameworkFormData.domain.some(
            (domain) => domain.id === subDomain.parent_id
          );
        });
    },

    handleScroll(event) {
      const target = event.target;
      if (target.classList.contains("modal-body")) {
        this.isScrolled = target.scrollTop > 20;
      }
    },

    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.newItem = {};
      this.fetchRegulators();
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
    },
  },
  async mounted() {

  },

  watch: {
    "frameworkFormData.domain": {
      handler() {
        this.updateSubDomains();
      },
      deep: true,
    },
    selectedOwner(newOwner) {
      this.frameworkFormData.owner = newOwner ? newOwner.id : null;
    },
  },
};
</script>

<style scoped>
.regulator-management-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 35px;
}

.parent {
  border-radius: 20px;
}

/* Loading Container */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: #f8f9fa;
  border-radius: 20px;
  padding: 40px;
}

.custom-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #6e3894;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #6e3894;
}

/* General Card Styling */
.regulator-card {
  border-radius: 20px;
  overflow: hidden;
  background-color: #ffffff;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  height: 435px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.regulator-card:hover {
  box-shadow: 0 10px 25px rgba(110, 56, 148, 0.15);
  transform: translateY(-5px);
}

/* Card Header Styling */
.card-header {
  background-color: #f5f5f5;
  border-bottom: 2px solid #D9D9D9;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  padding: 12px !important;
}

/* Regulator Logo Styling */
.regulator-logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid rgb(219, 210, 210);
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.2);
}

/* Regulator Name Styling */
.regulator-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0;
}

/* Framework Count Badge */
.framework-count-badge {
  color: #8c8c8c;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 3px;
}

/* Dropdown Toggle Custom */
.dropdown-toggle-custom {
  border: none;
  background-color: transparent !important;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 24px;
  min-height: 24px;
  box-shadow: none;
}

.dropdown-toggle-custom:hover {
  box-shadow: none;
}

.dropdown-toggle-custom .dot {
  width: 3.7px;
  height: 3.7px;
  background-color: #000000;
  border-radius: 50%;
  display: block;
  transition: all 0.3s ease;
  margin: 1px;
}

.dropdown-toggle-custom:hover .dot {
  background-color: #6e3894;
}

.card-body {
  padding: 5px;
  background-color: #f5f5f5 !important;
  flex: 1 1 auto;
  min-height: 0;
  background-color: #fafafa;
}

.card-body::-webkit-scrollbar {
  display: none;
}

/* Framework Item Styling */
.framework-item {
  padding: 12px;
  background-color: white;
  border-radius: 10px;
  transition: all 0.3s ease;
  margin: 10px 12px !important;
}

.framework-item:last-child {
  margin-bottom: 0;
}

.framework-title {
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 0;
}

/* Progress Bar Styling */
.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background-color: #6e3894;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}

/* Details Button */
/* Details Button - Compact Version */
.details-link {
  text-decoration: none;
  flex-shrink: 0;
}

.details-btn {
  background-color: #d0b5e3;
  color: #43235c;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  /* Slightly smaller font */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: inline-flex;
  /* Changed to inline-flex */
  align-items: center;
  gap: 5px;
  border: none;
}

.details-btn:hover {
  background-color: #6e3894;
  color: white;
  transform: none;
  box-shadow: none;
}

.details-btn i {
  font-size: 12px;
}

/* Card Footer Styling */
.card-footer {
  padding: 16px 20px;
  z-index: 2;
  background-color: #f5f5f5;
  border-top: none;
}

.add-framework-btn {
  width: 100%;
  background-color: #6e3894 !important;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(110, 56, 148, 0.2);
}

.add-framework-btn:hover {
  background-color: #552a6f !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(110, 56, 148, 0.35);
}

.add-framework-btn i {
  font-size: 13px;
}

/* Button Styling */
.btn-primary {
  background-color: #6e3894 !important;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(110, 56, 148, 0.3);
}

.btn-primary:hover {
  background-color: #552a6f !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(110, 56, 148, 0.4);
}

.btn-primary i {
  margin-right: 8px;
}

/* Dropdown Menu Styling */
.dropdown-menu {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}

.dropdown-item {
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #6e3894;
}

.dropdown-item i {
  margin-right: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.modal-wrapper {
  min-height: min-content;
  max-height: 90vh;
  width: 100%;
  max-width: 1000px;
  margin: auto;
  display: flex;
  flex-direction: column;
}

.modal-content {
  background: white;
  border-radius: 10px;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: fadeIn 0.3s ease;
}

.modal-header {
  padding: 15px 30px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 10px 10px 0 0;
  z-index: 1;
  justify-content: space-between;
}

[dir="rtl"] .modal-header {
  flex-direction: row-reverse;
}

.modal-title {
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.modal-body {
  padding: 20px 30px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 180px);
}

.close {

  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  color: #666;
  z-index: 2;
  transition: all 0.3s ease;
}

.close:hover {
  color: #6e3894;
  transform: rotate(90deg);
}

.form-actions {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 20px 30px;
  border-top: 2px solid #e5e7eb;
  transition: box-shadow 0.3s ease;
  border-radius: 0 0 10px 10px;
}

.form-actions-shadow {
  box-shadow: 0 -6px 12px rgba(0, 0, 0, 0.1);
}

.form-actions-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
}

.form-actions .btn-primary {
  background-color: #6e3894 !important;
  padding: 14px 24px;
  font-size: 16px;
  border-radius: 10px;
  min-width: 120px;
}

.form-actions .btn-primary:hover {
  background-color: #552a6f !important;
}

.form-actions .btn-secondary {
  color: #6e3894 !important;
  background-color: white !important;
  color: white;
  border: none;
  padding: 7px 24px;
  font-size: 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(108, 117, 125, 0.2);
  min-width: 120px;
  border: 1px solid #6e3894 !important;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #6e3894;
  outline: none;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

[dir="rtl"] .form-group label {
  text-align: right;
}

[dir="rtl"] ::placeholder {
  direction: rtl;
  text-align: right;
}

/* From Uiverse.io by e-coders */
button {
  appearance: none;
  background-color: #6e3894;
  border-radius: 10px;
  box-sizing: border-box;
  color: white;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  min-height: 1.75em;
  min-width: 0;
  outline: none;
  padding: 0.5em 1.5em;
  text-align: center;
  text-decoration: none;
  transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  will-change: transform;
  box-shadow: 0 2px 6px rgba(110, 56, 148, 0.3);
}

button:disabled {
  pointer-events: none;
  opacity: 0.6;
}

button:hover {
  background-color: #552a6f;
  box-shadow: 0 6px 12px rgba(110, 56, 148, 0.4);
  transform: translateY(-3px);
}

/* Responsive styles */
@media (max-width: 1200px) {
  .regulator-card {
    height: 435px;
  }
}

@media (max-width: 768px) {
  .modal-wrapper {
    max-width: 95%;
  }

  .modal-content {
    max-height: 85vh;
  }

  .modal-header,
  .modal-body,
  .form-actions {
    padding: 15px 20px;
  }

  .regulator-card {
    height: 350px;
  }

  .regulator-logo {
    width: 50px;
    height: 50px;
  }

  .regulator-name {
    font-size: 14px;
  }

  .framework-count-badge {
    font-size: 10px;
    padding: 3px 8px;
  }

  .framework-item {
    padding: 12px;
  }

  .framework-title {
    font-size: 14px;
  }

  .details-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .modal-wrapper {
    max-width: 100%;
    margin: 10px;
  }

  .modal-header,
  .modal-body,
  .form-actions {
    padding: 10px 15px;
  }

  .parent {
    padding: 10px;
  }

  .btn-primary {
    padding: 10px 18px;
    font-size: 14px;
  }

  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start !important;
  }

  .card-header .d-flex.align-items-center {
    flex-wrap: wrap;
  }

  .framework-count-badge {
    margin-top: 4px;
  }

  .framework-item {
    padding: 12px;
  }

  .framework-title {
    font-size: 13px;
  }

  .progress-percentage {
    font-size: 12px;
  }

  .details-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Vue Multiselect Custom Styling */
.multiselect {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.multiselect:focus-within {
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

.multiselect__tags {
  border: none;
  border-radius: 8px;
  padding: 8px 40px 0 8px;
}

.multiselect__tag {
  background-color: #6e3894;
  border-radius: 6px;
  padding: 6px 26px 6px 10px;
  margin-bottom: 8px;
}

.multiselect__tag-icon:after {
  color: rgba(255, 255, 255, 0.8);
}

.multiselect__tag-icon:hover {
  background-color: #552a6f;
}

.multiselect__option--highlight {
  background-color: #6e3894;
  color: white;
}

.multiselect__option--selected.multiselect__option--highlight {
  background-color: #552a6f;
}

[dir="rtl"] .rtl-end {
  justify-content: end;
}

.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row {
  text-align: end;
}

@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>
