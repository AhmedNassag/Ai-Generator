<template>
  <!-- Main Page with DataTable -->
  <main-page
    ref="page"
    :mainPage="$t('phishingtemplate.Awarness')"
    :mainSubPage="$t('phishingtemplate.Campgain')"
    :subPage="$t('phishingtemplate.Configuartion')"
    :titlePage="$t('phishingtemplate.Template')"
  >
    <!-- Slot for DataTable -->
    <template #datatable v-permission:show>
      <!-- Header with Title and Add Button -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title">{{ $t("phishingtemplate.Template") }}</h1>
        <button class="btn-add-website" @click="openCreateModal" v-permission:insert>
          <i class="fas fa-plus"></i>
          {{ $t("phishingtemplate.Add New Template") }}
        </button>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="text-center my-5">
        <v-progress-circular indeterminate color="primary" size="60" width="6" />
      </div>

      <!-- Template Cards Grid -->
      <div class="website-grid" id="template-parent-div">
        <div class="row">
          <div
            v-if="templates && templates.length > 0"
            class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 mb-4"
            v-for="template in templates"
            :key="template.id"
          >
            <div class="website-card">
              <div class="card-container">
                <div class="card-image-wrapper">
                  <img
                    class="card-image"
                    :src="template.fullAttachmentPath || '/path/to/default/image.jpg'"
                    alt=""
                  />
                  <div class="card-overlay">
                    <div class="card-actions">
                      <button
                        class="action-btn action-delete"
                        @click="deleteItem(template)"
                        v-permission:delete
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                      <button
                        class="action-btn action-edit"
                        @click="openEditModal(template)"
                        v-permission:update
                      >
                        <i class="fa-solid fa-pen"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="card-content">
                  <h3 class="card-title">{{ template.name }}</h3>
                  <p class="card-category" v-if="template.sender_profile?.name">
                    {{ template.sender_profile.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!loading" class="col-12">
            <div class="text-center py-5">
              {{ $t("phishingtemplate.No templates found") }}
            </div>
          </div>
        </div>
      </div>


      
            <!-- Loading More Indicator -->
            <div v-if="loadingMore" class="loading-more-indicator">
              <i class="fas fa-spinner fa-spin"></i>
              <p>{{ $t('phishingtemplate.Loading more phisingTemplate') }}</p>
            </div>
      
            <!-- Manual Load More Button -->
            <div v-if="!loading && !loadingMore && hasMore" class="load-more-container">
              <button class="btn-load-more" @click="loadMoreManually">
                <i class="fas fa-arrow-down"></i>
                {{ $t('phishingtemplate.Load More phisingTemplate') }}
              </button>
              <p class="load-more-info">{{ $t('phishingtemplate.Showing') }} {{ templates.length }}  {{ $t('phishingtemplate.phisingTemplate') }}</p>
            </div>
      
            <!-- No More Data Message -->
            <div v-if="!loading && !hasMore && templates.length > 0" class="no-more-data">
              <i class="fas fa-check-circle"></i>
              <p> {{ $t('phishingtemplate.All phishingtemplate loaded') }}  ({{ templates.length }} {{ $t('phishingtemplate.total') }})</p>
            </div>
    </template>
  </main-page>

  <!-- Vuetify Dialog for Form -->
  <v-dialog
    v-model="dialogVisible"
    max-width="900px"
    persistent
    content-class="figma-dialog-wrapper"
    :retain-focus="false"
  >
    <div class="figma-dialog">
      <!-- Header -->
      <div class="figma-dialog-header">
        <h2 class="figma-dialog-title">
          {{
            isEditMode
              ? $t("phishingtemplate.edit template")
              : $t("phishingtemplate.create template")
          }}
        </h2>
        <button class="figma-close-button" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="figma-dialog-content">
        <Form
          ref="formRef"
          :schema="fromFields"
          :newItem="currentItem"
          :api="api"
          :onSubmitComplete="submitFormCallback"
          :formData="true"
          :isModal="true"
          :noSubmit="true"
        >
          <template #sender_profile_id="{ item }">
            <div class="col-6 mb-3">
              <label class="figma-form-label">{{ $t("phishingtemplate.senderprofile") }}</label>
              <LazySelectField
                name="sender_profile_id"
                v-model="currentItem.sender_profile_id"
                options="PhishingSenderProfile"
                option-label="name"
                option-value="id"
                :required="true"
                :placeholder="$t('phishingtemplate.select sender profile')"
                :clearable="true"
              />
              
            </div>
          </template>

          <!-- Custom slot for phishing website (LazySelect) -->
          <template #phishing_website_id="{ item }">
            <div class="col-6 mb-3">
              <label class="figma-form-label">{{  $t("phishingtemplate.phishingwebsite") }}</label>
              <LazySelectField
                name="phishing_website_id"
                v-model="currentItem.phishing_website_id"
                options="PhishingWebsitePage"
                option-label="name"
                option-value="id"
                :required="true"
                :placeholder="$t('phishingtemplate.select phishing website')"
                :clearable="true"
              />
              
            </div>
          </template>
          <!-- Custom slot for CKEditor -->
          <template #body="{ item }">
            <div class="col-12 mb-3">
              <label class="figma-form-label">{{ $t("phishingtemplate.body") }}</label>
              <ckeditor
                :editor="editor"
                v-model="currentItem.body"
                :config="editorConfig"
                @ready="onEditorReady"
                class="figma-html-editor"
              ></ckeditor>
              <div
                class="text-caption text-grey mt-1"
                style="font-size: 12px; color: #6b7280"
              >
                {{ $t("phishingtemplate.Enter the email body content") }}
              </div>
            </div>
          </template>

          <!-- Custom slot for file upload -->
          <template #attachment="{ item }">
            <div class="col-12 mb-3">
              <label class="figma-form-label">{{
                $t("phishingtemplate.attachment")
              }}</label>
              <div class="figma-file-upload-wrapper">
                <input
                  type="file"
                  ref="fileInputAttachment"
                  @change="handleFileChange('attachment', $event)"
                  accept="image/*"
                  class="figma-file-input-hidden"
                  id="fileUpload-attachment"
                />
                <label
                  for="fileUpload-attachment"
                  class="figma-file-upload-area"
                  :class="{ 'has-preview': getImageUrl('attachment') }"
                >
                  <template v-if="!getImageUrl('attachment')">
                    <i class="fas fa-cloud-upload-alt figma-file-upload-icon"></i>
                    <span class="figma-file-upload-text">Upload File</span>
                  </template>
                  <template v-else>
                    <div class="image-preview-container">
                      <img
                        :src="getImageUrl('attachment')"
                        alt="Preview"
                        class="image-preview"
                      />
                      <button
                        type="button"
                        class="remove-image-btn"
                        @click.stop="removeImage('attachment')"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </template>
                </label>
              </div>
            </div>
          </template>
        </Form>
      </div>

      <!-- Footer -->
      <div class="figma-dialog-footer">
        <button
          type="button"
          class="figma-button figma-button-cancel"
          @click="closeModal"
        >
          {{ $t("phishingtemplate.cancel") }}
        </button>
        <button type="button" class="figma-button figma-button-save" @click="submitForm">
          {{ $t("phishingtemplate.save") }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>
<script>
import phishingtemplate from "@/API/PhishingTemplate/PhishingTemplate";
import PhishingSenderProfile from "@/API/PhishingSenderProfile/PhishingSenderProfile";
import PhishingWebsitePage from "@/API/PhishingWebsitePage/PhishingWebsitePage";
import MainPage from "@/components/MainPage.vue";
import Form from "@/components/Form.vue";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import LazySelectField from "@/components/LazySelectField.vue";
export default {
  components: {
    MainPage,
    Form, // إضافة المكون
    ckeditor: Ckeditor,
    "v-select": vSelect,
    LazySelectField,
  },

  setup() {
    const api = new phishingtemplate();
    const PhishingSenderProfileApi = new PhishingSenderProfile();
    const PhishingWebsitePageApi = new PhishingWebsitePage();
    const apiParams = { filter: "" };
    const tableColumns = [];
    const fromFields = [];
    return {
      api,
      PhishingSenderProfileApi,
      PhishingWebsitePageApi,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  async mounted() {
  this.loading = true;
  try {
    // جلب القوائم المنسدلة فقط (أصبحت lazy select)
    const [templatesData] = await Promise.all([
      this.api.getAll({
        page: this.page,
        perPage: this.perPage,
      })
    ]);

    // التعامل مع البيانات المجمعة
    if (templatesData?.data) {
      this.templates = templatesData.data || [];
      this.totalTemplates = templatesData.total || 0;
      this.hasMore = templatesData.data.length === this.perPage;
    } else {
      this.templates = templatesData || [];
      this.totalTemplates = this.templates.length;
      this.hasMore = this.templates.length === this.perPage;
    }

    // إضافة event listener للscroll
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    
  } catch (error) {
    console.error("Error loading data:", error);
    this.templates = [];
  } finally {
    this.loading = false;
  }
},
beforeUnmount() {
  window.removeEventListener("scroll", this.handleScroll);
},

  data() {
    return {
      isEditMode: false,
      currentItem: {},
      dialogVisible: false,
      phishingSenderProfileData: [],
      phishingWebsitePageData: [],
      templates: [],
      loading: true,
      loadingMore: false, // إضافة
      hasMore: true, // إضافة
      page: 1, // إضافة
      perPage: 9, // إضافة (حسب عدد الكروت في الصفحة)
      totalTemplates: 0, // إضافة
      editor: ClassicEditor,
      editorConfig: {
        initialData: "<p>Hello, $$NAME</p>",
        toolbar: {
          items: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "subscript",
            "superscript",
            "|",
            "Link",
            "bulletedList",
            "numberedList",
            "|",
            "uploadImage",
            "|",
            "alignment",
            "outdent",
            "indent",
            "|",
            "blockQuote",
            "insertTable",
            "undo",
            "redo",
            "|",
            "fontBackgroundColor",
            "fontColor",
            "fontSize",
            "fontFamily",
            "|",
            "code",
            "codeBlock",
            "htmlEmbed",
            "|",
            "horizontalLine",
            "pageBreak",
            "|",
            "removeFormat",
            "specialCharacters",
          ],
          shouldNotGroupWhenFull: true,
        },
        language: "en",
        image: {
          toolbar: [
            "imageTextAlternative",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "linkImage",
          ],
        },
        link: {
          addTargetToExternalLinks: true,
          decorators: {
            openInNewTab: {
              mode: "manual",
              label: "Open in new tab",
              attributes: {
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
          },
          defaultProtocol: "https://",
        },
        simpleUpload: {
          uploadUrl: "",
        },
        ckfinder: {
          uploadUrl: "",
        },
        image: {
          toolbar: [
            /* your toolbar items */
          ],
          upload: {
            types: ["jpeg", "png", "gif", "bmp", "webp", "tiff"],
          },
        },
        htmlSupport: {
          allow: [
            {
              name: /.*/,
              attributes: true,
              classes: true,
              styles: true,
            },
          ],
        },
        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableCellProperties",
            "tableProperties",
          ],
        },
        licenseKey: "GPL",
      },
      previewMap: {},
    };
  },

  created() {
    // Initialize form fields
    this.fromFields = [
      {
        name: "name",
        label: this.$t("phishingtemplate.name"),
        type: "text",
        rules: "required",
        description: this.$t("phishingtemplate.Enter the template name"),
        col: 12,
      },
      {
        name: "description",
        label: this.$t("phishingtemplate.description"),
        type: "textarea",
        rules: "required",
        description: this.$t("phishingtemplate.Enter a description for this template"),
        col: 12,
      },
      {
        name: "sender_profile_id",
        label: this.$t("phishingtemplate.sender_profile"),
        type: "options",
        options: [],
        rules: "required",
        description: this.$t("phishingtemplate.Select the sender profile"),
        col: 6,
      },
      {
        name: "phishing_website_id",
        label: this.$t("phishingtemplate.phishing_website"),
        type: "options",
        options: [],
        rules: "required",
        description: this.$t("phishingtemplate.Select the phishing website"),
        col: 6,
      },
      {
        name: "attachment",
        label: this.$t("phishingtemplate.attachment"),
        type: "file",
        rules: "",
        description: "",
        col: 12,
        customSlot: true, // إضافة هذا لاستخدام slot مخصص
      },
      {
        name: "subject",
        label: this.$t("phishingtemplate.subject"),
        type: "text",
        rules: "required",
        description: this.$t("phishingtemplate.Enter the email subject line"),
        col: 12,
      },
      {
        name: "body",
        label: this.$t("phishingtemplate.body"),
        type: "richtext",
        rules: "required",
        description: this.$t("phishingtemplate.Enter the email body content"),
        col: 12,
        customSlot: true, // إضافة هذا لاستخدام slot مخصص
      },
    ];
  },

  methods: {
    updateSelectOptions() {
      const senderProfileField = this.fromFields.find(
        (field) => field.name === "sender_profile_id"
      );
      if (senderProfileField) {
        senderProfileField.options = this.phishingSenderProfileData.map((profile) => ({
          id: profile.id,
          name: profile.name,
        }));
      }

      const websiteField = this.fromFields.find(
        (field) => field.name === "phishing_website_id"
      );
      if (websiteField) {
        websiteField.options = this.phishingWebsitePageData.map((website) => ({
          id: website.id,
          name: website.name,
        }));
      }
    },

    onEditorReady(editor) {
      if (!editor.getData().trim()) {
        editor.setData("<p>Hello, $$NAME</p>");
      }

      editor.model.document.on("change:data", () => {
        const data = editor.getData();
        const requiredText = "Hello, $$NAME";

        if (!data.includes(requiredText)) {
          const firstP = editor.model.document.getRoot().getChild(0);

          if (firstP && firstP.is("paragraph")) {
            let firstParagraphText = "";
            for (const child of firstP.getChildren()) {
              if (child.is("$text")) {
                firstParagraphText += child.data;
              }
            }

            if (firstParagraphText !== requiredText) {
              editor.model.change((writer) => {
                writer.remove(writer.createRangeIn(firstP));
                writer.insertText(requiredText, firstP, 0);
                writer.setSelection(editor.model.document.getRoot(), "end");
              });
            }
          } else {
            editor.model.change((writer) => {
              const paragraph = writer.createElement("paragraph");
              writer.insertText(requiredText, paragraph, 0);
              writer.insert(paragraph, editor.model.document.getRoot(), 0);
              writer.setSelection(editor.model.document.getRoot(), "end");
            });
          }
        }
      });

      const linkButton = document.querySelector(
        '[data-cke-tooltip-text="Link (Ctrl+K)"]'
      );
      if (linkButton) {
        linkButton.addEventListener("click", () => {
          setTimeout(() => {
            const urlInput = document.querySelector(
              ".ck-link-form .ck-labeled-field-view__input-wrapper input"
            );
            if (urlInput && !urlInput.value) {
              urlInput.value = "[PhishingWebsitePage]";
              urlInput.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }, 100);
        });
      }
    },

    async fetchTemplates(reset = false) {
    // منع المكالمات المكررة
    if (this.loading || this.loadingMore) {
      console.log('Already loading, skipping...');
      return;
    }
    
    console.log('Fetching page:', this.page);
    
    this.loading = this.page === 1 || reset;
    this.loadingMore = this.page > 1 && !reset;
    
    try {
      const response = await this.api.getAll({
        page: this.page,
        perPage: this.perPage,
      });
      
      console.log('Response:', response);
      
      if (response?.data?.length) {
        if (reset) {
          this.templates = response.data;
        } else {
          this.templates.push(...response.data);
        }
        
        this.totalTemplates = response.total || 0;
        this.hasMore = response.data.length === this.perPage;
        console.log('Added templates. Total:', this.templates.length, 'Has more:', this.hasMore);
      } else {
        this.hasMore = false;
        console.log('No more data');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      this.hasMore = false;
    } finally {
      this.loading = false;
      this.loadingMore = false;
      console.log('Loading finished');
    }
  },

  handleScroll() {
    // Don't trigger scroll when dialog is open
    if (this.dialogVisible || this.loading || this.loadingMore || !this.hasMore) {
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
      console.log('🚀 Loading more templates - Page:', this.page + 1);
      this.page++;
      this.fetchTemplates();
    }
  },

  loadMoreManually() {
    if (this.hasMore && !this.loadingMore && !this.loading) {
      this.page++;
      this.fetchTemplates();
    }
  },
    getImageUrl(fieldName) {
      if (!this.currentItem[fieldName]) return null;

      if (this.currentItem[fieldName] instanceof File) {
        return URL.createObjectURL(this.currentItem[fieldName]);
      }

      const fullPathKey = `full${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      }Path`;
      const fullPathKeyUnderscore = `full_${fieldName}_path`;

      if (this.currentItem[fullPathKey]) {
        return this.currentItem[fullPathKey];
      }

      if (this.currentItem[fullPathKeyUnderscore]) {
        return this.currentItem[fullPathKeyUnderscore];
      }

      if (
        typeof this.currentItem[fieldName] === "string" &&
        (this.currentItem[fieldName].startsWith("http") ||
          this.currentItem[fieldName].startsWith("/"))
      ) {
        return this.currentItem[fieldName];
      }

      return null;
    },

    handleFileChange(fieldName, event) {
      const file = event.target.files[0];
      this.currentItem[fieldName] = file;
    },

    openCreateModal() {
      this.isEditMode = false;
      this.currentItem = {};
      this.dialogVisible = true;
    },

    openEditModal(data) {
      this.isEditMode = true;
      this.currentItem = { ...data };

      if (!this.currentItem.body?.includes("Hello, $$NAME")) {
        this.currentItem.body = `<p>Hello, $$NAME</p>${this.currentItem.body || ""}`;
      }
      this.dialogVisible = true;
    },

    async deleteItem(item) {
      this.viewModal = false;
      await this.api.delete(item.id);
      this.closeModal();
    },

   async closeModal() {
      this.dialogVisible = false;
      this.currentItem = {};
      this.page = 1;
      this.templates = [];
      this.hasMore = true;
      await this.fetchTemplates(true);
    },

    async submitForm() {
      try {
        if (this.$refs.formRef) {
          // استدعاء دالة submit من Form component
          await this.$refs.formRef.submit();
        }
      } catch (error) {
        console.error("Error in form submission:", error);
      }
    },

    submitFormCallback(success, response) {
      console.log("submitFormCallback is RUNNING", success, response);
      
      if (success) {
        Swal.fire({
          title: this.$t("phishingtemplate.success"),
          text: this.isEditMode
            ? this.$t("phishingtemplate.updated_successfully")
            : this.$t("phishingtemplate.created_successfully"),
          icon: "success",
        });
        this.closeModal();
      } else {
        // عرض الأخطاء من الـ response
        const errorMessages = this.extractBackendErrors(response);
        if (errorMessages.length > 0) {
          Swal.fire({
            title: this.$t("phishingtemplate.error"),
            html: errorMessages.join("<br>"),
            icon: "error",
          });
        }
      }
    },

    extractBackendErrors(response) {
      if (!response) return [];

      if (response.data && Array.isArray(response.data.errors)) {
        return response.data.errors.flat();
      }

      if (Array.isArray(response.errors)) {
        return response.errors.flat();
      }

      if (typeof response.errors === "object" && response.errors !== null) {
        return Object.values(response.errors).flat();
      }

      if (response.message) {
        return [response.message];
      }

      return [];
    },

    removeImage(fieldName) {
      this.currentItem[fieldName] = null;

      const fullPathKey = `full${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      }Path`;
      const fullPathKeyUnderscore = `full_${fieldName}_path`;

      if (this.currentItem[fullPathKey]) {
        this.currentItem[fullPathKey] = null;
      }

      if (this.currentItem[fullPathKeyUnderscore]) {
        this.currentItem[fullPathKeyUnderscore] = null;
      }

      const fileInput = this.$refs[`fileInput-${fieldName}`];
      if (fileInput && fileInput[0]) {
        fileInput[0].value = "";
      }
    },
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
  background: #6e3894;
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

.website-grid .row > [class*="col-"] {
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
  background-color: #d9d9d9 !important;
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
   MODAL - FIGMA STYLE
   ============================================ */
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
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px !important;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
  min-height: 40px;
}

.figma-input:hover {
  border-color: #9ca3af;
}

.figma-input:focus {
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

/* Custom Select Styling */
.figma-select {
  width: 100%;
}

.figma-select :deep(.vs__dropdown-toggle) {
  min-height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px !important;
  padding: 6px 14px;
  background: #ffffff;
}

.figma-select :deep(.vs__dropdown-toggle):hover {
  border-color: #9ca3af;
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
  color: #9ca3af;
}

.figma-select :deep(.vs__actions) {
  padding: 0 4px;
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
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.figma-file-upload-area.has-preview {
  border-color: #6e3894;
  background: #f3f4f6;
}

.figma-file-upload-area:hover {
  border-color: #6e3894;
  background: #f3f4f6;
}

.figma-file-upload-icon {
  font-size: 32px;
  color: #9ca3af;
}

.figma-file-upload-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
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

/* HTML Editor */
.figma-html-editor {
  border: 1px solid #d1d5db;
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
  border: 1px solid #6e3894 !important;
}

.figma-button-cancel:hover {
  background: #f3e8ff;
}

.figma-button-save {
  background: #6e3894 !important;
  color: #ffffff !important;
}

.figma-button-save:hover:not(:disabled) {
  background: #5b2d7a !important;
}

.figma-button-save:disabled {
  background: #d1d5db !important;
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

/* ============================================
   CKEDITOR SPECIFIC
   ============================================ */
.ck .ck-balloon-panel,
.ck .ck-dropdown__panel,
.ck .ck-link-form {
  z-index: 10055 !important;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 768px) {
  .figma-dialog-header {
    padding: 12px 16px 0 !important;
  }

  .figma-dialog-content {
    padding: 0 12px !important;
  }

  .figma-dialog-footer {
    padding: 12px 16px !important;
  }

  .figma-form-field {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}

@media (max-width: 540px) {
  .figma-dialog {
    width: calc(100vw - 32px);
    max-width: 900px;
  }
}
</style>
