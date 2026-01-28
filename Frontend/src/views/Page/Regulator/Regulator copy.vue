<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'regulator.regulator'" :subPage="'regulator.regulator'"
    :titlePage="'regulator.regulator'">
    <!-- DataTable Section -->
    <template #datatable>

      <button class="btn btn-sm btn-success mx-2" @click="openForm()">
        Add Regulator
      </button>

      <div class="row">
        <div v-for="regulator in regulators" :key="regulator.id" class="col-12 col-xl-3 col-md-6">
          <div class="card regulator-card shadow-sm">
            <!-- Card Header -->
            <div class="card-header d-flex flex-column align-items-center text-center">
              <div class="d-flex align-items-center justify-content-center image-wrapper">
                <img :src="defaultImage" alt="Regulator Logo" class="regulator-logo" />
                <h5 class="ms-2 regulator-name">{{ regulator.name }}</h5>
              </div>
            </div>
            <!-- Card Body -->
            <div class="card-body">
              <div v-for="(framework, index) in regulator.frameworks" :key="framework.id" class="framework-item">
                <div class="d-flex align-items-center my-3">
                  <div class="chart-progress me-3"
                    :style="{ backgroundColor: getFrameworkColor(framework.percentage) }">
                    {{ framework.percentage }}%
                  </div>
                  <div>
                    <h5 class="my-2">{{ framework.name }}</h5>
                    <a v-if="canViewFramework" :href="`/admin/governance/framework/show/${framework.id}`"
                      class="btn btn-sm btn-primary">
                      <i class="icofont icofont-fountain-pen"></i>
                      Details
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <!-- Card Footer -->
            <div class="card-footer d-flex justify-content-center">
              <button v-if="canCreateFramework" class="btn btn-sm btn-success mx-2" @click="addFramework(regulator.id)">
                Add Framework
              </button>
              <button v-if="canCreateFramework" class="btn btn-sm btn-info mx-2" @click="editRegulator(regulator.id)">
                Edit Regulator
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Form Section -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true" />
    </template>
  </main-page>
</template>


<script>
import regulator from "@/API/Regulator/Regulator";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";

export default {
  components: {
    MainPage,
    Form,
  },

  setup() {
    const api = new regulator();
    const regulators = [
      {
        id: 1,
        name: "Regulator 1",
        logo: "logo1.png",
        frameworks: [
          { id: 1, name: "Framework 1", percentage: 45 },
          { id: 2, name: "Framework 2", percentage: 75 },
          { id: 3, name: "Framework 3", percentage: 90 },
        ],
      },
      {
        id: 2,
        name: "Regulator 2",
        logo: "logo2.png",
        frameworks: [
          { id: 4, name: "Framework A", percentage: 30 },
          { id: 5, name: "Framework B", percentage: 85 },
          { id: 6, name: "Framework C", percentage: 60 },
        ],
      },
      {
        id: 3,
        name: "Regulator 3",
        logo: "logo3.png",
        frameworks: [
          { id: 7, name: "Framework X", percentage: 50 },
          { id: 8, name: "Framework Y", percentage: 20 },
        ],
      },
      {
        id: 4,
        name: "Regulator 4",
        logo: "logo4.png",
        frameworks: [
          { id: 9, name: "Framework Alpha", percentage: 70 },
          { id: 10, name: "Framework Beta", percentage: 80 },
        ],
      },
      {
        id: 5,
        name: "Regulator 5",
        logo: "logo5.png",
        frameworks: [
          { id: 11, name: "Framework 1", percentage: 45 },
          { id: 12, name: "Framework 2", percentage: 75 },
        ],
      },
      {
        id: 6,
        name: "Regulator 6",
        logo: "logo6.png",
        frameworks: [
          { id: 13, name: "Framework Gamma", percentage: 95 },
          { id: 14, name: "Framework Delta", percentage: 40 },
        ],
      },
      {
        id: 7,
        name: "Regulator 7",
        logo: "logo7.png",
        frameworks: [
          { id: 15, name: "Framework Kappa", percentage: 55 },
          { id: 16, name: "Framework Lambda", percentage: 35 },
          { id: 17, name: "Framework Mu", percentage: 78 },
        ],
      },
      {
        id: 8,
        name: "Regulator 8",
        logo: "logo8.png",
        frameworks: [
          { id: 18, name: "Framework Omega", percentage: 88 },
          { id: 19, name: "Framework Sigma", percentage: 67 },
          { id: 20, name: "Framework Zeta", percentage: 49 },
        ],
      },
      {
        id: 9,
        name: "Regulator 9",
        logo: "logo9.png",
        frameworks: [
          { id: 21, name: "Framework Theta", percentage: 30 },
          { id: 22, name: "Framework Iota", percentage: 75 },
          { id: 23, name: "Framework Eta", percentage: 60 },
        ],
      },
      {
        id: 10,
        name: "Regulator 10",
        logo: "logo10.png",
        frameworks: [
          { id: 24, name: "Framework Phi", percentage: 95 },
          { id: 25, name: "Framework Chi", percentage: 20 },
          { id: 26, name: "Framework Psi", percentage: 55 },
        ],
      },
    ];


    return {
      api,
      regulators,
    };
  },

  data() {
    return {
      defaultImage: "https://picsum.photos/200", // Default image if no logo
      isFlipped: false,
      newItem: {},
      canUpdate: true,
      canCreateFramework: true,
      canViewFramework: true,
      fromFields: [
        {
          name: "name",
          label: this.$t("regulatorname"),
          type: "text",
          rules: "required",
        },
        {
          name: "logo",
          label: this.$t("regulatorname"),
          rules: "",
          type: "file",
        },
      ],
    };
  },

  created() {
    // this.apiParams = { "with[]": ["department", "role", "job", "manager", "team"] };
    // Initialize the table columns and form fields when the component is created

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter your name.",
        col: 6, // Column size in the form layout
      },
      {
        name: "logo",
        label: this.$t("useremail"),
        type: "file", // Text input field for email
        rules: "required|email", // Validation rule: required and valid email format
        description: "Please enter a valid email address.",
        col: 6,
      },

      {
        name: "terms",
        label: this.$t("user.accept_terms_and_conditions"),
        type: "checkbox", // Checkbox field
        rules: "required", // Validation rule: must be checked
        description: "You must accept the terms and conditions.",
        col: 6,
      },
    ];
  },

  methods: {
    getFrameworkColor(percentage) {
      if (percentage < 50) return "#ffa1a1";
      if (percentage >= 50 && percentage <= 80) return "#ffe700";
      return "#00d4bd";
    },
    editRegulator(regulator) {
      console.log("Edit regulator:", regulator);
    },
    addFramework(regulatorId) {
      console.log("Add framework for regulator:", regulatorId);
    },
    closeForm() {
      this.isFlipped = false;
      this.newItem = {};
    },

    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

  },
};
</script>
<style scoped>
/* General Card Styling */
.regulator-card {
  border-radius: 8px;
  overflow: hidden;
  background-color: #ffffff;
  border: 1px solid #ddd;
  transition: box-shadow 0.3s ease;
}

.regulator-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

/* Card Header Styling */
.card-header {
  background-color: #f8f9fa;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
}

/* Image Wrapper */
.image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* Regulator Logo Styling */
.regulator-logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #007bff;
}

/* Regulator Name Styling */
.regulator-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
}

/* Framework Progress Circle */
.chart-progress {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 50%;
  font-size: 0.9rem;
}

/* Footer Buttons */
.card-footer {
  padding: 10px;
  text-align: center;
}

.card-footer button {
  min-width: 100px;
}
</style>
