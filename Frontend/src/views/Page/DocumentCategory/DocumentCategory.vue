<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'documentcategory.documentcategory'"
    :subPage="'documentcategory.documentcategory'" :titlePage="'documentcategory.documentcategory'">



    <template #modal>
      <div v-if="isModalOpen" class="modal-overlay">
        <div class="modal-content">
          <h2 class="modal-title">
            {{ isEditing ? "Edit Document Category" : "Add Document Category" }}
          </h2>
          <hr>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label for="name">Name</label>
              <input v-model="formData.name" id="name" type="text" placeholder="Name" required class="form-control" />
            </div>
            <div class="form-group">
              <label for="type">Type</label>
              <select class="form-select" id="type" aria-label="Default select example" v-model="formData.type">
                <option disabled selected value :required="formData.type">Select</option>
                <option value="standard">Standard</option>
                <option value="policy">Policy</option>
                <option value="procedure">Procedure</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="workflowCategory_id">Workflow Category</label>
              <select class="form-select" id="workflowCategory_id" aria-label="Default select example"
                v-model="formData.workflowCategory_id">
                <option disabled selected value :required="formData.workflowCategory_id">Select</option>
                <option v-for="workflowCategory in workflowCategories" :key="workflowCategory.id"
                  :value="workflowCategory.id">{{ workflowCategory.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="workflowCategory_id">Workflow</label>
              <select class="form-select" id="workflow_id" aria-label="Default select example"
                v-model="formData.workflow_id">
                <option disabled selected value :required="formData.workflow_id">Select</option>
                <option v-for="workflow in workflows" :key="workflow.id" :value="workflow.id">{{ workflow.name }}
                </option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="submit-button btn btn-primary">
                {{ isEditing ? "Update" : "Submit" }}
              </button>
              <button type="button" @click="closeModal" class="cancel-button btn btn-danger">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>



    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div class="text-end mb-3">
        <button class="btn btn-primary add-button mb-3" @click="openModal" type="button">
          Add New
          <i class="icofont icofont-plus">
          </i>
        </button>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="loader">
        <div class="spinner-border text-info" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else>
        <div class="row">
          
          <div class="col-sm-9 col-xl-4 col-lg-9" v-for="(item, index) in documentCategories" :key="index">
            <div class="card widget-1">
              <div class="card-body">
                <div class="widget-content">
                  <div class="widget-round secondary"></div>
                  <div class="row">
                    <div class="col-9">
                      <h4>{{ item.name }}</h4>
                      <p>{{ item.type }}</p>
                      <p>{{ item.workflow.name }}</p>
                      <p>{{ item.workflow.workflow_category.name }}</p>
                    </div>
                    <div class="col-3">
                      <button @click="openEditModal(item)" class="edit-button btn btn-secondary">
                        <i class="icofont icofont-fountain-pen"></i>
                      </button>
                      <button @click="deleteItem(item.id)" class="delete-button btn btn-danger">
                        <i class="icofont icofont-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="col-6">
            <div class="card text-center">
              <div class="card-header">
                <ul class="nav nav-pills card-header-pills">
                  <li class="nav-item">
                    <a class="nav-link active" href="#">Active</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Link</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link disabled" href="#">Disabled</a>
                  </li>
                </ul>
              </div>
              <div class="card-body">
                <h5 class="card-title">Special title treatment</h5>
                <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </template>



  </main-page>
</template>

<script>
// Importing necessary components and API modules
import documentcategory from "@/API/DocumentCategory/DocumentCategory";
import workflowCategory from "@/API/WorkflowCategory/WorkflowCategory";
import workflow from "@/API/WorkflowCategory/Workflow";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    DataTable, // DataTable component for displaying tabular data
  },

  data() {
    return {
      isModalOpen: false,
      isEditing: false,
      documentCategories: [],
      workflowCategories: [],
      workflows: [],
      formData: {
        id: null,
        name: "",
        type: "",
        workflowCategory_id: "",
        workflow_id: "",
      },
      draggedIndex: null,
      loading: false
    };
  },
  created() {
    this.api = new documentcategory();
    this.apiParams = {};
    this.workflowCategoriesApi = new workflowCategory();
    this.workflowsApi = new workflow();
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const response = await this.api.getAll({ with: ["workflow.workflowCategory"] });
        this.documentCategories = response;

        const workflowCategoriesResponse = await this.workflowCategoriesApi.getAll({ select: "id|name" });
        this.workflowCategories = workflowCategoriesResponse;
      } catch (error) {
        console.error("Error fetching document categories:", error);
      } finally {
        this.loading = false;
      }
    },

    openModal() {
      this.isEditing = false;
      this.resetForm();
      this.isModalOpen = true;
    },

    openEditModal(item) {
      this.isEditing = true;
      this.formData = {
        id: item.id,
        name: item.name,
        type: item.type,
        workflowCategory_id: item.workflow.workflow_category.id,
        workflowCategory_name: item.workflow.workflow_category.name,
        workflow_id: item.workflow.id,
        workflow_name: item.workflow.name,
      };

      this.isModalOpen = true;
    },

    closeModal() {
      this.isModalOpen = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = {
        id: null,
        name: "",
        type: "",
        workflowCategory_id: "",
        workflowCategory_name: "",
        workflow_id: "",
        workflow_name: "",
      };
    },

    addItem() {
      this.formData.steps.push({ name: "" });
    },

    removeItem(index) {
      if (this.formData.steps.length > 1) {
        this.formData.steps.splice(index, 1);
      }
    },

    async submitForm() {

      try {
        if (this.isEditing) {
          const response = await this.api.from(this.formData);
          if (response) {
            this.closeModal();
          }
        } else {
          const response = await this.api.from(this.formData);
          if (response) {
            this.closeModal();
          }
        }

        await this.fetchData();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },

    async deleteItem(id) {
      try {
        const response = await this.api.delete(id);
        await this.fetchData();
      } catch (error) {
        console.error("Error deleting workflow category:", error);
      }
    },
  },

  watch: {
    async "formData.workflowCategory_id"(after) {
      const workflowsResponse = await this.workflowsApi.getAll({ filter: `workflowCategory_id|${after}|=`, select: "id|name" });
      this.workflows = workflowsResponse;
    },
  }
};
</script>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 1.5em;
  color: #4caf50;
}

.widget-1 {
  background-image: url("@/assets/images/card_bg.png");
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.12) !important;
}

.edit-button {
  padding: 5px 10px;
  margin-top: 10px;
}

.delete-button {
  padding: 5px 10px;
  margin-top: 10px;
  margin-left: 5px;
}


/* Modal content style */
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 600px;
  max-width: 800px;
  height: auto;
}

/* Form group style */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Item group style */
.item-group {
  margin-bottom: 10px;
  cursor: grab;
}

.item-group:active {
  cursor: grabbing;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner-border {
  --bs-spinner-width: 2rem;
  --bs-spinner-height: 2rem;
  --bs-spinner-vertical-align: -0.125em;
  --bs-spinner-border-width: 0.15em;
  --bs-spinner-animation-speed: 0.3s;
  --bs-spinner-animation-name: spinner-border;
  border: var(--bs-spinner-border-width) solid currentcolor;
  border-right-color: transparent;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}


.fa-arrow-right {
  color: #44225c;
  margin: 0 5px;
}
</style>