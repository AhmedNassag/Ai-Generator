
<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('phishingwebsitepage.Awareness')"
    :mainSubPage="$t('phishingwebsitepage.Campaign')" :subPage="$t('phishingwebsitepage.phishingwebsitepage')"
    :titlePage="$t('phishingwebsitepage.phishingwebsitepage')" v-permission:show>

    <template #datatable>
      <!-- Header with Title and Add Button -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title">Website Pages</h1>
        <button class="btn-add-website" @click="openForm" v-permission:insert>
          <i class="fas fa-plus"></i>
          Add Website
        </button>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="text-center my-5">
        <v-progress-circular indeterminate color="primary" size="60" width="6" />
      </div>

      <!-- Website Cards Grid -->
      <div class="website-grid" id="website-parent-div">
        <div class="row">
          <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 mb-4" v-for="website in phishingWebsites" :key="website.id">
            <div class="website-card">
              <div class="card-container">
                <div class="card-image-wrapper">
                  <img class="card-image" :src="website.fullCoverPath" alt="" />
                  <div class="card-overlay">
                    <div class="card-actions">
                      <button class="action-btn action-delete" @click="deletePhishingWebsite(website)" v-permission:delete>
                        <i class="fa-solid fa-trash"></i>
                      </button>
                      <button class="action-btn action-edit" @click="editItem(website)" v-permission:update>
                        <i class="fa-solid fa-pen"></i>
                      </button>
                      <router-link :to="{ name: 'PreviewWebsitePage', params: { id: website.id } }" 
                        target="_blank" class="action-btn action-view" v-permission:viewWebsite>
                        <i class="fa-solid fa-eye"></i>
                      </router-link>
                    </div>
                  </div>
                </div>
                <div class="card-content">
                  <h3 class="card-title">{{ website.name || 'Website Page Name' }}</h3>
                  <p class="card-category" v-if="website.category?.name">{{ website.category.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading More Indicator -->
      <div v-if="loadingMore" class="loading-more-indicator">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading more websites...</p>
      </div>

      <!-- Manual Load More Button -->
      <div v-if="!loading && !loadingMore && hasMore" class="load-more-container">
        <button class="btn-load-more" @click="loadMoreManually">
          <i class="fas fa-arrow-down"></i>
          Load More Websites
        </button>
        <p class="load-more-info">Showing {{ phishingWebsites.length }} websites</p>
      </div>

      <!-- No More Data Message -->
      <div v-if="!loading && !hasMore && phishingWebsites.length > 0" class="no-more-data">
        <i class="fas fa-check-circle"></i>
        <p>All websites loaded ({{ phishingWebsites.length }} total)</p>
      </div>

    </template>

    <template #form>
    </template>
  </main-page>

  <!-- Modal Dialog -->
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
          {{ formData.id ? $t('phishingwebsitepage.EditWebsite') : 'Add Website' }}
        </h2>
        <button class="figma-close-button" @click="closeDialog">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="figma-dialog-content">
        <form @submit.prevent="saveItem">
          <div class="row">
            <!-- Website Name -->
            <div class="figma-form-field col-6">
              <label class="figma-form-label">Website Name</label>
              <input 
                type="text" 
                v-model="formData.name" 
                class="figma-input"
                placeholder=""
              />
            </div>

            <!-- Category -->
            <div class="figma-form-field col-6">
              <label class="figma-form-label">Category</label>
              <LazySelectField name="Category" options="PhishingCategory"
                v-model="formData.phishing_category_id"
                :placeholder="$t('phishingwebsitepage.select_category')"
                option-label="name" option-value="id" />
            </div>

            <!-- Type Selection -->
            <div class="figma-form-field col-12">
              <div class="figma-type-selector">
                <label class="figma-type-option" :class="{ 'figma-type-option-active': formData.type === 'managed' }">
                  <input 
                    type="radio" 
                    v-model="formData.type" 
                    value="managed"
                    class="figma-type-radio"
                  />
                  <i class="fas fa-check-circle figma-type-icon"></i>
                  <span class="figma-type-text">Managed</span>
                </label>
                <label class="figma-type-option" :class="{ 'figma-type-option-active': formData.type === 'own' }">
                  <input 
                    type="radio" 
                    v-model="formData.type" 
                    value="own"
                    class="figma-type-radio"
                  />
                  <i class="fas fa-check-circle figma-type-icon"></i>
                  <span class="figma-type-text">Own</span>
                </label>
              </div>
            </div>

            <!-- From Address Name -->
            <div class="figma-form-field" :class="formData.type === 'managed' ? 'col-6' : 'col-12'">
              <label class="figma-form-label">From Address Name</label>
              <input 
                type="text" 
                v-model="formData.from_address_name" 
                class="figma-input"
                placeholder=""
              />
            </div>

            <!-- Domain (only for managed type) -->
            <div v-if="formData.type === 'managed'" class="figma-form-field col-6">
              <label class="figma-form-label">Domain</label>
              <LazySelectField name="Domain" options="PhishingDomain"
                v-model="formData.domain_id"
                :placeholder="$t('phishingwebsitepage.select_domain')"
                option-label="name" option-value="id" />
            </div>

            <!-- Upload File -->
            <div class="figma-form-field col-12">
              <label class="figma-form-label">Upload File</label>
              <div class="figma-file-upload-wrapper">
                <input 
                  type="file" 
                  ref="fileInput"
                  @change="handleFileUpload"
                  accept="image/*"
                  class="figma-file-input-hidden"
                  id="fileUpload"
                />
                <label for="fileUpload" class="figma-file-upload-area">
                  <template v-if="!imagePreview">
                    <i class="fas fa-cloud-upload-alt figma-file-upload-icon"></i>
                    <span class="figma-file-upload-text">Upload File</span>
                  </template>
                  <template v-else>
                    <div class="image-preview-container">
                      <img :src="imagePreview" alt="Preview" class="image-preview" />
                      <button type="button" class="remove-image-btn" @click.stop="removeImage">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </template>
                </label>
              </div>
            </div>

            <!-- HTML Code -->
            <div class="figma-form-field col-12">
              <label class="figma-form-label">HTML Code</label>
              <ckeditor 
                :editor="editor" 
                v-model="formData.html_code" 
                :config="editorConfig"
                class="figma-html-editor"
              ></ckeditor>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="figma-dialog-footer">
        <button type="button" class="figma-button figma-button-cancel" @click="closeDialog">
          Cancel
        </button>
        <button type="button" class="figma-button figma-button-save" @click="saveItem">
          {{ formData.id ? $t('phishingwebsitepage.Update') : 'Save' }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import phishingwebsitepage from "@/API/PhishingWebsitePage/PhishingWebsitePage";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import PhishingCategory from "@/API/PhishingCategory/PhishingCategory";
import PhishingDomain from "@/API/PhishingDomain/PhishingDomain";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import LazySelectField from '@/components/LazySelectField.vue';

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    vSelect,
    LazySelectField,
  },

  setup() {
    const api = new phishingwebsitepage();
    const phishingWebsiteCtaegories = new PhishingCategory();
    const phishingDomains = new PhishingDomain();

    const apiParams = {
      with: ['domain'],
      page: 1,
      perPage: 6
    };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      phishingWebsiteCtaegories,
      phishingDomains,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
        autoParagraph: false,
        entities: false,
        entities_latin: false,
        entities_greek: false,
        allowedContent: true,
        forcePasteAsPlainText: true,
      },

      isFlipped: false,
      dialog: false,
      formData: {
        id: null,
        name: '',
        phishing_category_id: '',
        type: 'managed',
        from_address_name: '',
        domain_id: '',
        cover: null,
        html_code: ''
      },
      phishingWebsites: [],
      page: 1,
      perPage: 6,
      hasMore: true,
      loadingMore: false,
      categories: [],
      domains: [],
      loading: false,
      imagePreview: null,
      uploadedFile: null,
    };
  },

  computed: {
    colSize() {
      return this.formData.type === 'managed' ? 6 : 12;
    },

    imageColSize() {
      return this.formData.id ? 8 : 12;
    }
  },

  async mounted() {
    await this.fetchPhishingwebsites();
    
    // Wait for DOM to be ready
    this.$nextTick(() => {
      // Add scroll listener
      window.addEventListener("scroll", this.handleScroll, { passive: true });
      console.log('Scroll listener attached');
    });
    
    this.formData.type = 'managed';
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },

  methods: {
    async fetchPhishingwebsites() {
      // Prevent duplicate calls
      if (this.loading || this.loadingMore) {
        console.log('Already loading, skipping...');
        return;
      }
      
      console.log('Fetching page:', this.page);
      
      this.loading = this.page === 1;
      this.loadingMore = this.page > 1;
      
      try {
        const response = await this.api.getAll({
          with: ['domain', 'category'],
          page: this.page,
          perPage: this.perPage
        });
        
        console.log('Response:', response);
        
        if (response?.data?.length) {
          this.phishingWebsites.push(...response.data);
          this.hasMore = response.data.length === this.perPage;
          console.log('Added websites. Total:', this.phishingWebsites.length, 'Has more:', this.hasMore);
        } else {
          this.hasMore = false;
          console.log('No more data');
        }
      } catch (error) {
        console.error('Error fetching websites:', error);
        this.hasMore = false;
      } finally {
        this.loading = false;
        this.loadingMore = false;
        console.log('Loading finished');
      }
    },

    handleScroll() {
      // Don't trigger scroll when dialog is open
      if (this.dialog || this.loading || this.loadingMore || !this.hasMore) {
        return;
      }
      
      // Get the main scrollable element
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate distance from bottom (trigger at 300px before end)
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      
      console.log('Scroll Position:', {
        scrollTop: Math.round(scrollTop),
        windowHeight: Math.round(windowHeight),
        documentHeight: Math.round(documentHeight),
        distanceFromBottom: Math.round(distanceFromBottom),
        shouldLoad: distanceFromBottom < 300
      });
      
      // Load more when user is 300px from bottom
      if (distanceFromBottom < 300) {
        console.log('🚀 Loading more - Page:', this.page + 1);
        this.page++;
        this.fetchPhishingwebsites();
      }
    },

    async fetchPhishingCategories() {
      const res = await this.phishingWebsiteCtaegories.getAll({
        select: "id|name",
      });
      this.categories = res;
    },

    async fetchPhishingDomains() {
      const res = await this.phishingDomains.getAll({
        select: "id|name",
      });
      this.domains = res;
    },

    openForm() {
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.formData = {
        id: null,
        name: '',
        phishing_category_id: '',
        type: 'managed',
        from_address_name: '',
        domain_id: '',
        cover: null,
        html_code: ''
      };
      this.imagePreview = null;
      this.uploadedFile = null;
    },

    editItem(website) {
      this.formData = { ...website };
      
      if (website.cover || website.fullCoverPath) {
        this.imagePreview = website.fullCoverPath || website.cover;
      } else {
        this.imagePreview = null;
      }
      
      this.uploadedFile = null;
      this.dialog = true;
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert('File size should be less than 5MB');
          return;
        }

        this.uploadedFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);

        this.formData.cover = file;
      }
    },

    removeImage() {
      this.imagePreview = null;
      this.uploadedFile = null;
      this.formData.cover = null;
      
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async saveItem() {
      this.formData.html_code = this.cleanHtmlCode(this.formData.html_code);
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
        
        this.page = 1;
        this.phishingWebsites = [];
        this.hasMore = true;
        await this.fetchPhishingwebsites();
      } else {
        this.api.poup(response, "Validation Error!");
      }
    },

    cleanHtmlCode(html) {
      if (!html) return '';
      
      const txt = document.createElement("textarea");
      txt.innerHTML = html;
      let cleanHtml = txt.value;

      cleanHtml = cleanHtml.replace(/<p>/g, "");
      cleanHtml = cleanHtml.replace(/<\/p>/g, "");
      cleanHtml = cleanHtml.replace(/<p[^>]*>/g, "");
      
      cleanHtml = cleanHtml.replace(/&nbsp;/g, ' ');
      cleanHtml = cleanHtml.replace(/&quot;/g, '"');
      cleanHtml = cleanHtml.replace(/&lt;/g, '<');
      cleanHtml = cleanHtml.replace(/&gt;/g, '>');
      cleanHtml = cleanHtml.replace(/&amp;/g, '&');
      
      cleanHtml = cleanHtml.replace(/<br\s*\/?>/g, '\n');
      cleanHtml = cleanHtml.replace(/\s+/g, ' ');
      cleanHtml = cleanHtml.trim();
      
      return cleanHtml;
    },

    async deletePhishingWebsite(website) {
      await this.api.delete(website.id);
      
      this.page = 1;
      this.phishingWebsites = [];
      this.hasMore = true;
      await this.fetchPhishingwebsites();
    },

    loadMoreManually() {
      if (this.hasMore && !this.loadingMore && !this.loading) {
        this.page++;
        this.fetchPhishingwebsites();
      }
    },

    getPreviewLink(website) {
      if (website.domain_id) {
        return {
          name: 'PreviewWebsitePage',
          params: {
            url: window.origin,
            id: website.id,
          }
        };
      } else {
        return {
          name: 'PreviewWebsitePage',
          params: {
            url: window.origin,
            id: website.id,
          }
        };
      }
    },

    getPreviewLink2(website) {
      const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
      const domain = website.domain?.name || 'example.com';
      if (website.domain_id) {
        this.$router.push({
          name: 'PreviewWebsitePage',
          params: {
            id: website.id,
          },
          target: '_blank',
        });

      } else {
        this.$router.push({
          name: 'PreviewWebsitePage',
          params: {
            id: website.id,
          },
          target: '_blank',
        });
      }
    }
  },
};
</script>

<style scoped>
/* ============================================
   PAGE HEADER
   ============================================ */
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.2;
}

.btn-add-website {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6E3894;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 15px;
  height: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.btn-add-website:hover {
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
  transform: translateY(-1px);
}

.btn-add-website i {
  font-size: 14px;
}

/* ============================================
   WEBSITE GRID
   ============================================ */
.website-grid {
  padding: 8px 0;
}

.website-grid .row {
  margin-left: -12px;
  margin-right: -12px;
}

.website-grid .row > [class*='col-'] {
  padding-left: 12px;
  padding-right: 12px;
}

/* ============================================
   WEBSITE CARD
   ============================================ */
.website-card {
  position: relative;
  height: 230px !important;
}

.card-container {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-container:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: #f3f4f6;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-container:hover .card-image {
  transform: scale(1.05);
}

/* Card Overlay */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-container:hover .card-overlay {
  opacity: 1;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  text-decoration: none;
  color: #ffffff;
}

.action-delete {
  background: #ef4444;
}

.action-delete:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.action-edit {
  background: #3b82f6;
}

.action-edit:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.action-view {
  background: #10b981;
}

.action-view:hover {
  background: #059669;
  transform: scale(1.1);
}

/* Card Content */
.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: #D9D9D9 !important;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.3;
}

.card-category {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

/* ============================================
   MODAL
   ============================================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #000000;
}

.modal-content {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px 32px;
  border-top: 1px solid #e5e7eb;
}

/* ============================================
   FORM ELEMENTS
   ============================================ */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group-half {
  flex: 1;
}

.form-group-full {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #000000;
  transition: all 0.2s ease;
  background: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Select Styling */
.form-select {
  width: 100%;
}

.form-select :deep(.vs__dropdown-toggle) {
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 12px;
  background: #ffffff;
}

.form-select :deep(.vs__dropdown-toggle):hover {
  border-color: #7c3aed;
}

.form-select :deep(.vs__selected) {
  color: #000000;
  font-size: 14px;
}

.form-select :deep(.vs__search) {
  font-size: 14px;
}

.form-select :deep(.vs__search::placeholder) {
  color: #9ca3af;
}

/* Type Selector */
.type-selector {
  display: flex;
  gap: 16px;
  padding: 8px 0;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: #ffffff;
  min-width: 140px;
}

.type-option:hover {
  border-color: #7c3aed;
  background: #f9fafb;
}

.type-option-active {
  border-color: #7c3aed;
  background: #f3f4f6;
}

.type-radio {
  display: none;
}

.type-icon {
  font-size: 20px;
  color: #7c3aed;
}

.type-option:not(.type-option-active) .type-icon {
  color: #d1d5db;
}

.type-text {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
}

/* File Upload */
.file-upload-wrapper {
  width: 100%;
}

.file-input-hidden {
  display: none;
}

.file-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 140px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-upload-area:hover {
  border-color: #7c3aed;
  background: #f3f4f6;
}

.file-upload-icon {
  font-size: 32px;
  color: #9ca3af;
}

.file-upload-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* HTML Editor */
.html-editor {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.html-editor :deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 300px;
}

/* ============================================
   BUTTONS
   ============================================ */
.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-save {
  padding: 10px 32px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.btn-save:hover {
  background: linear-gradient(135deg, #6d28d9 0%, #9333ea 100%);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
  transform: translateY(-1px);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .modal-container {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .type-selector {
    flex-direction: column;
  }
  
  .type-option {
    width: 100%;
  }
}
.page-wrapper .page-body-wrapper .page-title {
    margin: 0 !important;
}
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

/* Card Container */
.figma-card-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 0;
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

/* File Upload */
.figma-file-upload-wrapper {
  width: 100%;
}

.figma-file-input-hidden {
  display: none;
}

.figma-file-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 140px;
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  background: #F9FAFB;
  cursor: pointer;
  transition: all 0.2s ease;
}

.figma-file-upload-area:hover {
  border-color: #6E3894;
  background: #F3F4F6;
}

.figma-file-upload-icon {
  font-size: 32px;
  color: #9CA3AF;
}

.figma-file-upload-text {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

/* HTML Editor */
.figma-html-editor {
  border: 1px solid #D1D5DB;
  border-radius: 8px !important;
  overflow: hidden;
}

.figma-html-editor :deep(.ck-editor__editable) {
  min-height: 200px;
  max-height: 300px;
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
/* Image Preview Styles */
.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  max-width: 100%;
  max-height: 120px;
  object-fit: contain;
  border-radius: 8px;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  background: #ef4444;
  transform: scale(1.1);
}

/* File Upload Area with Preview */
.figma-file-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 140px;
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  background: #F9FAFB;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.figma-file-upload-area.has-preview {
  border-color: #6E3894;
  background: #F3F4F6;
}

.figma-file-upload-area:hover {
  border-color: #6E3894;
  background: #F3F4F6;
}




/* ============================================
   LOADING INDICATORS
   ============================================ */
.loading-more-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

.loading-more-indicator i {
  font-size: 32px;
  color: #6E3894;
}

.loading-more-indicator p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.load-more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

.btn-load-more {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6E3894;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.btn-load-more:hover {
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
  transform: translateY(-1px);
}

.load-more-info {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.no-more-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

.no-more-data i {
  font-size: 32px;
  color: #10b981;
}

.no-more-data p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

</style>



