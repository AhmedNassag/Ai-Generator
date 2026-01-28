<template>
  <div>
    <main-page
      ref="page"
      :isFlipped="true"
      :mainPage="$t('framework.Regulators')"
      :subPage="$t('frameworkinstall.Frameworks Installed')"
      :titlePage="$t('frameworkinstall.Frameworks Installed')"
      :loading="loading"
    >
    </main-page>

    <div class="card" v-permission:show>
      <div class="card-body">
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> {{ loadingMessage }}
    </div>
  </div>

  <div class="container">
    <!-- Use Bootstrap classes for the card -->
    <div class="custom-card shadow-lg rounded-3">
      <div class="card-body fw-bold p-4">
        <h3 class="card-title mb-4">
          {{ $t("frameworkinstall.Regulation_Framework") }}
        </h3>
        <form id="framework-form" @submit.prevent="handleFormSubmit">
          <div class="mb-3">
            <label for="regulation" class="form-label">{{ $t("frameworkinstall.Regulation") }}:</label>
            <select v-model="selectedRegulation" required id="regulation" class="form-select shadow-sm">
              <option value="">
                {{ $t("frameworkinstall.Select Regulation") }}
              </option>
              <option value="NCA">{{ $t("frameworkinstall.NCA") }}</option>
              <option value="ISO">{{ $t("frameworkinstall.ISO") }}</option>
              <option value="SAMA">{{ $t("frameworkinstall.SAMA") }}</option>
              <option value="CMA">{{ $t("frameworkinstall.CMA") }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="framework" class="form-label">{{ $t("frameworkinstall.Framework") }}:</label>
            <select v-model="selectedFramework" required id="framework" class="form-select shadow-sm">
              <option value="">
                {{ $t("frameworkinstall.Select Framework") }}
              </option>
              <option v-for="framework in filteredFrameworks" :key="framework" :value="framework">
                {{ framework }}
              </option>
            </select>
          </div>
          <div class="d-flex justify-content-end">
            <button type="submit" v-permission:installFrame class="btn btn-primary text-white">
              {{ $t("frameworkinstall.Install") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Seeder Modal -->
  <div v-if="showSeederModal" class="modal fade show" tabindex="-1" aria-labelledby="seederModalLabel"
    aria-hidden="true" style="display: block">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-lg shadow-lg">
        <div class="modal-header">
          <h3 class="modal-title" id="seederModalLabel">
            {{ $t("frameworkinstall.Choose Options") }}
          </h3>
          <button type="button" class="btn-close" @click="closeSeederModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="seeder-options-form">
            <div class="form-check">
              <input type="checkbox" class="form-check-input" v-model="selectedOptions" value="install_document"
                id="install_document" />
              <label class="form-check-label" for="install_document">
                {{ $t("frameworkinstall.Mapping Related Doc") }}
              </label>
            </div>
            <div class="form-check">
              <input type="checkbox" class="form-check-input" v-model="selectedOptions" value="install_requirement"
                id="install_requirement" />
              <label class="form-check-label" for="install_requirement">
                {{ $t("frameworkinstall.Install Controls evidences") }}
              </label>
            </div>
            <div class="form-check">
              <input type="checkbox" class="form-check-input" v-model="selectedOptions" value="install_mapping"
                id="install_mapping" />
              <label class="form-check-label" for="install_mapping">
                {{
                  $t(
                    "frameworkinstall.Mapping evidences For Related Required Framework"
                  )
                }}
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-cancel" @click="closeSeederModal">
            {{ $t("frameworkinstall.Cancel") }}
          </button>
          <button type="button" class="btn btn-primary text-white" @click="runSeeder">
            {{ $t("frameworkinstall.Deploy") }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showSeederModal" class="modal-backdrop fade show"></div>

  <!-- Installed Frameworks Table -->
  <div v-if="seededFrameworks && seededFrameworks.length" class="custom-card m-4 shadow-lg rounded-3">
    <div class="card-body p-4">
      <h3 class="card-title mb-4">
        {{ $t("frameworkinstall.Frameworks Installed") }}
      </h3>
      <table id="seededFrameworksTable" class="table table-bordered table-hover" style="text-align: center">
        <thead>
          <tr>
            <th>{{ $t("frameworkinstall.Framework Name") }}</th>
            <th>{{ $t("frameworkinstall.Controls") }}</th>
            <th>
              {{
                $t(
                  "frameworkinstall.Mapping evidences For Related Required Framework"
                )
              }}
            </th>
            <th>{{ $t("frameworkinstall.Mapping Related Doc") }}</th>
            <th>{{ $t("frameworkinstall.Install Controls evidences") }}</th>
            <th>{{ $t("frameworkinstall.Created At") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="framework in seededFrameworks" :key="framework.id">
            <td>{{ framework.framework }}</td>
            <td><i class="fa fa-check text-success"></i></td>
            <td>
              <i v-if="framework.mapping" class="fa fa-check text-success"></i>
              <i v-else class="fa fa-times text-danger"></i>
            </td>
            <td>
              <i v-if="framework.document" class="fa fa-check text-success"></i>
              <i v-else class="fa fa-times text-danger"></i>
            </td>
            <td>
              <i v-if="framework.requirement" class="fa fa-check text-success"></i>
              <i v-else class="fa fa-times text-danger"></i>
            </td>
            <td>
              {{
                framework.created_at
                  ? new Date(framework.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })
                  : "Unknown"
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
      </div>
    </div>
      </div>
  </template>
    <script>
import axios from "axios";
import Swal from "sweetalert2";
import { computed } from "vue";
import frameworkinstall from "@/API/FrameworkInstall/FrameworkInstall";
import MainPage from "@/components/MainPage.vue";
import "@fortawesome/fontawesome-free/css/all.css";
import { notify } from "@kyvg/vue3-notification";
import DataTable from "@/components/DataTable.vue";
export default {
  name: "FrameworkInstallComponent",

  components: {
    MainPage,
    DataTable,
  },

  data() {
    return {
      // API related
      apiFrameworkInstall: new frameworkinstall(),
      apiParams: { filter: "email|superadmin@encyclopedia.com" },

      // Form data
      selectedRegulation: "",
      selectedFramework: "",
      selectedOptions: [],

      // UI state
      showSeederModal: false,
      isLoading: false,
      loadingMessage: "Please wait...",

      // Table data
      seededFrameworks: [],
      tableColumns: [],
      fromFields: [],

      // Framework options
      regulationFrameworks: {
        NCA: ['NCA-ECC – 2: 2024', 'NCA-SMACC', 'NCA-CCCP', 'NCA-CCCT', 'NCA-TCC', 'NCA-CSCC – 1: 2019',
          'NCA-OTCC-1:2022', 'NCA-DCC-1:2022'
        ],
        ISO: ['ISO-27001'],
        SAMA: ['SAMA'],
        CMA: ['Cma'] // No frameworks for CMA
      },
    };
  },

  computed: {
    filteredFrameworks() {
      const frameworks =
        this.regulationFrameworks[this.selectedRegulation] || [];
      return frameworks.filter(
        (framework) =>
          !this.seededFrameworks.some((f) => f.framework === framework)
      );
    },
  },

  mounted() {
    this.fetchSeededFrameworks();
  },

  methods: {
    async fetchSeededFrameworks() {
      try {
        const response = await this.apiFrameworkInstall.getAll();
        if (Array.isArray(response)) {
          this.seededFrameworks = response
            .filter((f) => f.framework)
            .map((f) => ({
              framework: f.framework,
              mapping: f.mapping || null,
              document: f.document || null,
              requirement: f.requirement || null,
              created_at: f.created_at || "",
            }));
        }
      } catch (error) {
        console.error("Error fetching seeded frameworks:", error);
      }
    },

    handleFormSubmit() {
      this.showSeederModal = true;
    },

    closeSeederModal() {
      this.showSeederModal = false;
      this.selectedOptions = [];
    },

    async runSeeder() {
      const formData = {
        regulation: this.selectedRegulation,
        framework: this.selectedFramework,
        options: this.selectedOptions || [],
      };

      Swal.fire({
        title: this.$t("frameworkinstall.are_you_sure"),
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, proceed!",
        cancelButtonText: "No, cancel!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.closeSeederModal();
          this.isLoading = true;
          this.loadingMessage = "Please wait Initiating Framework...";

          try {
            const response = await this.apiFrameworkInstall.installFrame(
              formData
            );
            console.log("response", response);
            // Since the API returns response.data directly, we just need to check if the response contains a message
            if (response && response.message) {
              notify({
                type: "success",
                title: this.$t("frameworkinstall.success"),
                text: response.message,
                duration: 3000,
                speed: 500,
                data: {
                  icon: "check-circle",
                  style: {
                    background: "#f0f9f0",
                    color: "#155724",
                    borderLeft: "4px solid #28a745",
                  },
                },
              });

              // Fetch the updated data from the backend
              await this.fetchSeededFrameworks();
            }
          } catch (error) {
            console.log("Error during seeder:", error);
            notify({
              type: "error",
              title: this.$t("frameworkinstall.error"),
              text:
                error.response?.data?.message ||
                "An error occurred. Please try again.",
              duration: 3000,
              speed: 500,
              data: {
                icon: "exclamation-circle",
                style: {
                  background: "#f8d7da",
                  color: "#721c24",
                  borderLeft: "4px solid #dc3545",
                },
              },
            });
          } finally {
            this.isLoading = false;
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            icon: "info",
            title: this.$t("frameworkinstall.info"),
            text: "Operation canceled",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });
    },
  },
};
</script>

<style scoped>
/* Main container styling */
::v-deep(.flip-container.flip) {
  display: none;
}
#framework-form {
  padding: 12px !important;
  background-color: #f5f5f5 !important;
  border-radius: 10px !important;
  border: 1px solid #d9d9d9 !important;
}

.form-select {
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
  border: 1px solid #d9d9d9;
}

/* Loading Overlay Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  /* Ensure it's on top of everything */
  background-color: rgba(255, 255, 255, 0.3);
  /* Very light transparent overlay (20% opacity) */
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  font-size: 18px;
  color: #333;
  background-color: rgba(255, 255, 255, 0.9);
  /* Slightly transparent white background */
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease-in-out;
}

.loading-spinner i {
  margin-bottom: 15px;
  font-size: 36px;
  color: #007bff;
  /* Bootstrap primary color */
  animation: spin 1.5s linear infinite;
}

.btn-primary {
  background-color: #6e3894 !important;
  border-radius: 10px;
}

.btn-cancel {
  background: white !important;
  color: #6e3894 !important;
  border: 1px solid #6e3894 !important;
}

.btn {
  padding: 0.25rem 2rem !important;
}

.loading-spinner p {
  margin: 0;
  font-weight: 500;
  color: #555;
}

/* Table styling - target the table element directly */
#seededFrameworksTable thead tr {
  background-color: #f5f5f5 !important;
  color: #333 !important;
}

#seededFrameworksTable thead th {
  background-color: #f5f5f5 !important;
  font-weight: 600 !important;
  padding: 12px !important;
  text-align: center !important;
  color: #333 !important;
  border: 1px solid #dee2e6 !important;
}

#seededFrameworksTable tbody tr {
  background-color: #ffffff !important;
  color: #000 !important;
}

#seededFrameworksTable tbody tr:nth-child(even),
#seededFrameworksTable tbody tr:nth-child(odd) {
  background-color: #ffffff !important;
  /* Ensure all tbody rows are white */
}

#seededFrameworksTable tbody td {
  background-color: #ffffff !important;
  padding: 10px !important;
  color: #000 !important;
  border: 1px solid #dee2e6 !important;
}

/* Override any Bootstrap striping effects */
#seededFrameworksTable tbody tr:hover {
  background-color: #f8f9fa !important;
  /* Light hover effect */
}

/* Keyframes for spinner animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Add minimal custom styles if necessary */
.custom-card {
  background-color: white !important;
  border: none;
}
.flip-container {
  display: none !important;
}
[dir="rtl"] .card-title, [dir="rtl"] .form-select{
text-align:end
}
[dir="rtl"] .form-label{
display:flex;
flex-direction:row-reverse;
}
</style>
