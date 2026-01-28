<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('phishingsenderprofile.Awareness')" :mainSubPage="$t('phishingsenderprofile.Campaign')"
    :subPage="$t('phishingcategory.Phishingcategory')" :titlePage="$t('phishingcategory.Phishingcategory')"
    v-permission:show>

    <template #datatable>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title">Phishing Categories</h1>
        <button class="btn add-category-btn" @click="openForm" v-permission:insert>
          <span class="add-icon">+</span>
          Add Category
        </button>
      </div>

      <div v-if="loading" class="text-center my-5">
        <v-progress-circular indeterminate color="primary" size="60" width="6" />
      </div>

      <div class="row g-4">
        <div class="col-12 col-md-6 col-lg-4" v-for="(category, index) in phishingCategories" :key="index">
          <div class="category-card card h-100">
            <div class="card-body">
              <!-- Category Name and Percentage -->
              <div class="category-header d-flex justify-content-between align-items-center mb-3">
                <h5 class="category-name">
                  {{ category.name || 'Phishing Category Name' }}
                </h5>
                <span class="category-percentage">
                  {{ calculatePercentage(category) }}%
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="progress-container mb-3">
                <div 
                  class="progress-bar" 
                  :style="{ width: calculatePercentage(category) + '%' }">
                </div>
              </div>

              <!-- Websites Badge and Action Buttons -->
              <div class="category-footer d-flex justify-content-between align-items-center">
                <router-link 
                  class="websites-badge d-flex align-items-center gap-2 text-decoration-none" 
                  :to="{ name: 'PhishingCategoryWebsistes', params: { id: category.id } }" 
                  v-permission:showWebsites>
                  <i class="website-icon fa-solid fa-globe"></i>
                  Websites
                </router-link>

                <div class="action-buttons d-flex gap-2">
                  <button 
                    v-permission:update 
                    class="btn edit-btn d-flex align-items-center justify-content-center" 
                    type="button"
                    @click="editItem(category)">
                    <i class="edit-icon fa-solid fa-pen"></i>
                  </button>

                  <button 
                    v-permission:delete 
                    class="btn delete-btn d-flex align-items-center justify-content-center" 
                    type="button"
                    @click="deletePhishingCategory(category.id)">
                    <i class="delete-icon fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>
</template>


<script>
// Importing necessary components and API modules
import phishingcategory from "@/API/PhishingCategory/PhishingCategory";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import PhishingWebsitePage from "@/API/PhishingWebsitePage/PhishingWebsitePage";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new phishingcategory();
    const phishingWebsitePage = new PhishingWebsitePage();
    const apiParams = {
      with: ['websites'],
      'page': 1,
      'perPage': 9,
    };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      phishingWebsitePage
    };
  },

  async mounted() {
    const response = await this.phishingWebsitePage.getAll(
      { filter: "phishing_category_id|-null|!=" }
    );
    this.phishingWebsitePagesThatHaveCategoriesCount = response.length;

    await this.fetchPhishingCategories();
    window.addEventListener("scroll", this.handleScroll);

  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item

      phishingCategories: [],
      page: 1,
      perPage: 9,
      hasMore: true,
      loadingMore: false,
      loading: false,
      phishingWebsitePagesThatHaveCategoriesCount: 0,
    };
  },

  created() {
    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("phishingcategory.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter category name.",
        col: 12, // Column size in the form layout
      },
    ];
  },

  methods: {
    // Calculate percentage for progress bar
    calculatePercentage(category) {
      if (!category || !category.websites) {
        return 0;
      }
      
      const websiteCount = Array.isArray(category.websites) ? category.websites.length : 0;
      
      if (this.phishingWebsitePagesThatHaveCategoriesCount === 0) {
        return 0;
      }
      
      const percentage = (websiteCount / this.phishingWebsitePagesThatHaveCategoriesCount) * 100;
      return Math.round(percentage);
    },

    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    async closeForm() {
      this.page = 1;
      await this.fetchPhishingCategories();
      this.isFlipped = false;  // Hide the form
      // this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },

    async fetchPhishingCategories() {
      try {
        this.loadingMore = true;
        this.loading = true;

        this.phishingCategories = [];

        const params = {
          ...this.apiParams,
          page: this.page,
          perPage: this.perPage,
        };

        const response = await this.api.getAll(params);
        const categories = Array.isArray(response.data) ? response.data : response.data?.data || [];

        // remove duplication
        const newCategories = categories.filter(
          (category) => !this.phishingCategories.some((c) => c.id === category.id)
        );

        this.phishingCategories.push(...newCategories);

        if (categories.length < this.perPage) {
          this.hasMore = false;
          this.loading = false;
        }

        this.page++;
      } catch (error) {
        console.error("Failed to fetch PhishingCategories:", error);
      } finally {
        this.loadingMore = false;
        this.loading = false;
      }
    },

    async deletePhishingCategory(category) {
      try {
        const response = await this.api.delete(category);
        this.page = 1;
        if (response.status == "success") {
          this.fetchPhishingCategories();
        }
      } catch (error) {
        console.error("Failed to fetch categorys:", error);
      }
    },

    async handleScroll() {
      const bottomOfWindow =
        window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 100;

      if (bottomOfWindow && this.hasMore && !this.loadingMore) {
        await this.fetchPhishingCategories();
      }
    },
  },
};
</script>
<style scoped>
/* Button hover effects */
.btn:hover {
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

/* Card styling and hover effects */
.category-card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #F0F0F0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}



/* Page title */
.page-title {
  color: #1a202c;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 0;
}

/* Add category button */
.add-category-btn {
  background-color: #6E3894;
  color: white;
  border-radius: 10px;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-icon {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Category header */
.category-header {
  flex: 1;
}

.category-name {
  color: #1a202c;
  font-weight: 600;
  font-size: 1.125rem;
  flex: 1;
  margin-bottom: 0;
}

.category-percentage {
  color: #6E3894;
  font-weight: 700;
  font-size: 1.25rem;
  white-space: nowrap;
  margin-left: 0.75rem;
}

/* Progress bar */
.progress-container {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #6E3894;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Category footer */
.category-footer {
  margin-top: 1rem;
}

.websites-badge {
  background-color: #D0B5E3;
  color: #6E3894;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 500;
  height: 24px;
  font-size: 12px;
}

.website-icon {
  font-size: 0.875rem;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  width: 30px;
  height: 30px;
  border: 2px solid;
  background-color: white;
  border-radius: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  border-color: #C4951B;
  color: #C4951B;
}

.delete-btn {
  border-color: #A92525;
  color: #A92525;
}

.edit-icon, .delete-icon {
  font-size: 0.875rem;
}
.page-wrapper .page-body-wrapper .page-title {
    margin: 0 !important;
}
.card .card-body {
  padding: 10px !important;
  height: 100px  !important;
}
</style>
