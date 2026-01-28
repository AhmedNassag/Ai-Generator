<template>
  <main-page 
    ref="page" 
    :isFlipped="isFlipped" 
    :mainPage="'certifiatetemplete.certifiatetemplete'" 
    :subPage="'certifiatetemplete.certifiatetemplete'" 
    :titlePage="'certifiatetemplete.certifiatetemplete'"
  >
      <template #datatable>
      <DataTable
        v-permission:show
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"   
        :api="api"  
        :apiParams="apiParams" 
        :editItem="editItem"  
        :openForm="openForm"   
      >
        <template #certifiatetemplete.name="{ item }">
          <a href="javascript:void(0)" @click="showCertificatePreview(item)" class="text-name">
            {{ item.name }}
          </a>
        </template>
        <template #certifiatetemplete.Users="{ item }">
          <button 
            @click="showCertificateUsers(item)" 
            class="btn btn-sm btn-info btn-users"
            :disabled="!item.certificates || item.certificates.length === 0"
          >
             {{ $t("certifiatetemplete.View Users") }} ({{ item.certificates ? item.certificates.length : 0 }})
          </button>
        </template>
      </DataTable>
    </template>


    <template #form>
      <div v-if="!showPreview">
        <form @submit.prevent="handleFormSubmit" class="certificate-form-redesign">
          <!-- Design Settings Section -->
          <div class="design-settings-section">
            <h3 class="section-title">{{ $t("certifiatetemplete.Design Setting") || "Design Setting" }}</h3>
            
            <!-- Template Selection -->
            <div class="template-selection-group">
              <label class="template-label">{{ $t("certifiatetemplete.Style Variant") || "Style Variant" }}</label>
              <div class="template-buttons" :key="'template-' + selectedTemplate">
                <button
                  type="button"
                  class="template-btn"
                  :class="{ 'active': selectedTemplate === 'template1' }"
                  @click="selectTemplate('template1')"
                >
                  {{ $t("certifiatetemplete.Template 1") || "Template 1" }}
                </button>
                <button
                  type="button"
                  class="template-btn"
                  :class="{ 'active': selectedTemplate === 'template2' }"
                  @click="selectTemplate('template2')"
                >
                  {{ $t("certifiatetemplete.Template 2") || "Template 2" }}
                </button>
                <button
                  type="button"
                  class="template-btn"
                  :class="{ 'active': selectedTemplate === 'custom' }"
                  @click="selectTemplate('custom')"
                >
                  {{ $t("certifiatetemplete.Custom") || "Custom" }}
                </button>
              </div>
              <div class="selected-template-debug" style="margin-top: 10px; font-size: 12px; color: #999;">
                Selected: {{ selectedTemplate }}
              </div>
            </div>

            <!-- Course Data Section -->
            <h4 class="subsection-title">{{ $t("certifiatetemplete.Course Data") || "Course Data" }}</h4>
            
            <div class="form-grid-two-column">
              <!-- Title -->
              <div class="form-group-redesign">
                <label class="form-label-redesign">
                  {{ $t("certifiatetemplete.Title") || "Title" }}<span class="required-star">*</span>
                </label>
                <input 
                  v-model="formData.name"
                  type="text" 
                  class="form-input-redesign"
                  required
                >
              </div>

              <!-- Type Selection -->
              <div class="form-group-redesign">
                <label class="form-label-redesign">
                  {{ $t("certifiatetemplete.type") || "Type" }}<span class="required-star">*</span>
                </label>
                <select 
                  v-model="formData.type"
                  class="form-select-redesign"
                  required
                  @change="onTypeChange"
                >
                  <option value="">{{ $t("certifiatetemplete.Select") || "Select" }}</option>
                  <option value="lms">{{ $t("certifiatetemplete.LMS Training") || "LMS Training" }}</option>
                  <option value="physical">{{ $t("certifiatetemplete.Physical Course") || "Physical Course" }}</option>
                </select>
              </div>

              <!-- Course (for LMS) -->
              <div class="form-group-redesign" v-if="formData.type === 'lms'">
                <label class="form-label-redesign">
                  {{ $t("certifiatetemplete.Course") || "Course" }}<span class="required-star">*</span>
                </label>
                 <LazySelectField
                    name="course"
                    v-model="formData.course_id"
                    options="Course"
                    option-label="name"
                    option-value="id"
                    :required="formData.type === 'lms'"
                    placeholder="Select Course"
                    @update:modelValue="onCourseChange"
                    :clearable="true"
                  />
              </div>
              
              <!-- Level (for LMS) -->
              <div class="form-group-redesign" v-if="formData.type === 'lms'">
                <label class="form-label-redesign">
                  {{ $t("certifiatetemplete.Level") || "Level" }}
                </label>
                <select 
                  v-model="formData.level_id"
                  class="form-select-redesign"
                  :required="formData.type === 'lms'"
                  @change="onLevelChange"
                  :disabled="!formData.course_id"
                >
                  <option value="">{{ $t("certifiatetemplete.Select") || "Select" }}</option>
                  <option 
                    v-for="level in filteredLevels" 
                    :key="level.id" 
                    :value="level.id"
                  >
                    {{ level.title }}
                  </option>
                </select>
              </div>
              
              <!-- Module (for LMS) -->
              <div class="form-group-redesign" v-if="formData.type === 'lms'">
                <label class="form-label-redesign">
                  {{ $t("certifiatetemplete.Module") || "Module" }}
                </label>
                <select 
                  v-model="formData.module_id"
                  class="form-select-redesign"
                  :required="formData.type === 'lms'"
                  :disabled="!formData.level_id"
                >
                  <option value="">{{ $t("certifiatetemplete.Select") || "Select" }}</option>
                  <option 
                    v-for="module in filteredModules" 
                    :key="module.id" 
                    :value="module.id"
                  >
                    {{ module.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Background Upload (Custom Only) -->
            <div class="form-group-redesign full-width" v-if="selectedTemplate === 'custom'">
              <label class="form-label-redesign">
                {{ $t("certifiatetemplete.background") || "Background" }}
                <span v-if="!isEditMode" class="required-star">*</span>
              </label>
              <input
                type="file"
                @change="handleFileUpload"
                class="form-file-redesign"
                accept="image/*"
                :required="!isEditMode && selectedTemplate === 'custom'"
                ref="fileInput"
              >
              <small v-if="isEditMode" class="form-hint">
                {{ $t("certifiatetemplete.Leave empty to keep existing background image") || "Leave empty to keep existing background" }}
              </small>
              <div v-if="isEditMode && formData.fullBackgroundPath" class="preview-image-wrapper">
                <img :src="formData.fullBackgroundPath" class="preview-image" />
              </div>
            </div>

            <!-- Text Content -->
            <div class="form-group-redesign full-width">
              <label class="form-label-redesign">
                {{ $t("certifiatetemplete.text") || "Text" }}<span class="required-star">*</span>
              </label>
              <ckeditor
                v-model="formData.text"
                class="form-editor-redesign"
                :editor="editor"
                :config="editorConfig"
                rows="4"
                required
              ></ckeditor>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="form-actions-redesign">
            <button type="button" @click="closeForm" class="btn-cancel-redesign">
              {{ $t("certifiatetemplete.Cancel") || "Cancel" }}
            </button>
            <button type="submit" class="btn-save-redesign">
              {{ $t("certifiatetemplete.Save") || "Save" }}
            </button>
          </div>
        </form>
      </div>
      
      <!-- PREVIEW SECTION - ALL FIXED DESIGNS -->
      <div v-else class="certificate-preview-wrapper">
        <div class="fixed-certificate-preview">
          <div class="certificate-preview-container">
            
            <!-- Template 1: Black Border Design -->
            <div v-if="selectedTemplate === 'template1'" class="fixed-certificate template1">
              <div class="cert-border"></div>
              
              <div class="cert-header">
                <h1 class="cert-main-title">CERTIFICATE</h1>
                <p class="cert-subtitle">OF COMPLETION</p>
              </div>

              <div class="cert-divider"></div>

              <p class="cert-presented-text">This Certificate Is Proudly Presented To</p>

              <h2 class="cert-recipient-name">#UserName</h2>

               <div class="cert-body-text">
    <p v-if="formData.type === 'lms'">
      For successfully completing the <strong>{{ getCourseName() }}</strong> course at
      <strong>{{ getLevelName() }}</strong> level. <strong>{{ getModuleName() }}</strong> modal
    </p>
    <p v-else-if="formData.type === 'physical'">
      This certificate is awarded in recognition of the participant's commitment and successful completion <strong>#courseName</strong>
    </p>
  </div>

              <div class="cert-footer">
                <div class="cert-footer-item">
                  <p class="cert-footer-value">#Date</p>
                  <p class="cert-footer-label">DATE</p>
                </div>

                <div class="cert-qr-code">
                  <img :src="qrCodeImage" alt="QR Code">
                </div>

                <div class="cert-footer-item">
                  <p class="cert-footer-value">#Percentage</p>
                  <p class="cert-footer-label">PERCENTAGE</p>
                </div>
              </div>
            </div>

            <!-- Template 2: Gold Border Design -->
            <div v-if="selectedTemplate === 'template2'" class="fixed-certificate template2">
              <div class="cert-border-gold"></div>
              
              <!-- QR Code Top Right -->
              <div class="cert-qr-top-right">
                <img :src="qrCodeImage" alt="QR Code">
              </div>

              <div class="cert-header-gold">
                <h1 class="cert-main-title-gold">CERTIFICATE</h1>
                <p class="cert-subtitle-gold">OF COMPLETION</p>
              </div>

              <div class="cert-divider-gold"></div>

              <p class="cert-presented-text-gold">This Certificate Is Proudly Presented To</p>

              <h2 class="cert-recipient-name-gold">#UserName</h2>

                <div class="cert-body-text-gold">
    <p v-if="formData.type === 'lms'">
      For successfully completing the <strong class="text-gold">{{ getCourseName() }}</strong> course at
      <strong class="text-gold">{{ getLevelName() }}</strong> level. <strong class="text-gold">{{ getModuleName() }}</strong> modal
    </p>
    <p v-else-if="formData.type === 'physical'">
      This certificate is awarded in recognition of the participant's commitment and successful completion <strong class="text-gold">#courseName</strong>
    </p>
  </div>

              <div class="cert-footer-gold">
                <div class="cert-footer-item">
                  <p class="cert-footer-value-gold">#Date</p>
                  <p class="cert-footer-label-gold">DATE</p>
                </div>

                <div class="cert-footer-item">
                  <p class="cert-footer-value-gold">#Grade</p>
                  <p class="cert-footer-label-gold">GARD</p>
                </div>

                <div class="cert-footer-item">
                  <p class="cert-footer-value-gold">#Percentage</p>
                  <p class="cert-footer-label-gold">PERCENTAGE</p>
                </div>
              </div>
            </div>

            <!-- Custom Template: Professional Design with Custom Background -->
            <div v-if="selectedTemplate === 'custom'" class="fixed-certificate custom" 
                 :style="{ backgroundImage: previewBackground ? `url('${previewBackground}')` : '' }">
              
              <div class="custom-border"></div>
              
              <!-- QR Code Top Right -->
              <div class="custom-qr-top-right">
                <img :src="qrCodeImage" alt="QR Code">
              </div>

              <div class="custom-header">
                <h1 class="custom-main-title">CERTIFICATE</h1>
                <p class="custom-subtitle">OF COMPLETION</p>
              </div>

              <div class="custom-divider"></div>

              <p class="custom-presented-text">This Certificate Is Proudly Presented To</p>

              <h2 class="custom-recipient-name">#UserName</h2>

                <div class="custom-body-text">
    <p v-if="formData.type === 'lms'">
      For successfully completing the <strong class="custom-bold">{{ getCourseName() }}</strong> course at
      <strong class="custom-bold">{{ getLevelName() }}</strong> level. <strong class="custom-bold">{{ getModuleName() }}</strong> modal
    </p>
    <p v-else-if="formData.type === 'physical'">
      This certificate is awarded in recognition of the participant's commitment and successful completion <strong class="custom-bold">#courseName</strong>
    </p>
  </div>

              <div class="custom-footer">
                <div class="custom-footer-item">
                  <p class="custom-footer-value">#Date</p>
                  <p class="custom-footer-label">DATE</p>
                </div>

                <div class="custom-footer-item">
                  <p class="custom-footer-value">#Grade</p>
                  <p class="custom-footer-label">GARD</p>
                </div>

                <div class="custom-footer-item">
                  <p class="custom-footer-value">#Percentage</p>
                  <p class="custom-footer-label">PERCENTAGE</p>
                </div>
              </div>
            </div>

          </div>

          <div class="preview-actions-fixed">
            <button @click="showPreview = false" class="btn-back">
              <i class="fas fa-arrow-left"></i> {{ $t("certifiatetemplete.Back to Edit") || "Back to Edit" }}
            </button>
            <button @click="saveTemplate" class="btn-save-template">
              <i class="fas fa-save"></i> {{ $t("certifiatetemplete.Save Template") || "Save Template" }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </main-page>

    <div v-if="certificatePreviewModal" class="modal-overlay">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t("certifiatetemplete.Certificate Preview") }}</h5>
          <button type="button" class="modal-close-btn" @click="closecertificatePreviewModal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body certificate-modal-content">
          <div class="certificate-scroll-container">
            <div 
              class="certificate-container preview-mode" 
              :style="{ backgroundImage: formData.fullBackgroundPath ? `url('${formData.fullBackgroundPath}')` : '' }"
              v-html="selectedCertificateTemplate"
            ></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary text-white" @click="closecertificatePreviewModal">
            <i class="fas fa-check mr-1"></i> {{ $t("certifiatetemplete.Close Preview") }}
          </button>
        </div>
      </div>
    </div>
  </div>

   <v-dialog
    v-model="usersModalVisible"
    max-width="800"
    persistent
    transition="dialog-transition"
    content-class="custom-users-dialog"
  >
    <v-card class="users-dialog-card">
      <v-card-title class="users-dialog-header">
        <h2 class="dialog-title">Users Who Received Certificate</h2>
        <v-btn
          icon
          class="close-btn"
          @click="closeUsersModal"
          aria-label="Close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="users-dialog-body">
        <div v-if="selectedCertificate && selectedCertificate.certificates && selectedCertificate.certificates.length > 0">
          <div class="table-wrapper">
            <table class="users-table">
              <thead>
                <tr>
                  <th class="col-number">#</th>
                  <th class="col-name">User Name</th>
                  <th class="col-phone">Phone</th>
                  <th class="col-certificate">Certificate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cert, index) in selectedCertificate.certificates" :key="cert.id">
                  <td class="col-number">{{ index + 1 }}</td>
                  <td class="col-name">{{ getUserFullName(cert.user_id) }}</td>
                  <td class="col-phone">{{ getUserPhone(cert.user_id) }}</td>
                  <td class="col-certificate">
                    <v-btn
                      :href="'/show-certificate/' + cert.id"
                      target="_blank"
                      class="view-certificate-btn"
                      elevation="0"
                    >
                      View Certificate
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <p>{{ $t("certifiatetemplete.No users have received this certificate yet") }}</p>
        </div>
      </v-card-text>

      <v-card-actions class="users-dialog-footer">
        <v-spacer></v-spacer>
        <v-btn
          class="cancel-btn"
          elevation="0"
          @click="closeUsersModal"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import certifiatetemplete from "@/API/CertifiateTemplete/CertifiateTemplete";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import level from "@/API/LmsLevel/LmsLevel";
import module from "@/API/LmsModule/LmsModule";
import course from "@/API/Course/Course";
import Swal from "sweetalert2";
import User from "@/API/User/User";
import LazySelectField from "@/components/LazySelectField.vue";
export default {
  components: {
    MainPage,
    DataTable,
    ckeditor: Ckeditor,
     LazySelectField
  },

  setup() {
    const api = new certifiatetemplete();
    const userApi = new User();
    const levelApi = new level();
    const moduleApi = new module();
    const courseApi = new course();
     const apiParams = { with: ["certificates"] };
    return { 
      api,
      apiParams,
      levelApi,
      moduleApi,
      courseApi,
      userApi
    };
  },
 
  data() {
    return {
      users: [],
      isFlipped: false,
      showPreview: false,
      certificatePreviewModal: false,
      previewBackground: '',
      usersModalVisible: false,
      selectedCertificate: null,
      qrCodeImage: '',
      selectedCertificateTemplate: '',
      selectedTemplate: 'template1',
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      courses: [],
      allLevels: [],
      filteredLevels: [],
      allModules: [],
      filteredModules: [],
      formData: {
        name: '',
        type: '',
        template_type: '',
        course_id: '',
        level_id: '',
        module_id: '',
        text: '',
        background: null,
        template_html: ''
      },
      isEditMode: false,
      tableColumns: [
        { id:'certifiatetemplete.name' , title: this.$t("certifiatetemplete.name"), data: "name", defaultContent: "N/A" },
        {id:"certifiatetemplete.Users", title: this.$t("certifiatetemplete.Users"), data: "Users", defaultContent: "N/A" },
      ]
    };
  },

  watch: {
    'formData.type'(newVal) {
      if (newVal !== 'lms') {
        this.formData.course_id = '';
        this.formData.level_id = '';
        this.formData.module_id = '';
      }
    },
    'formData.course_id'(newVal) {
      if (!newVal) {
        this.formData.level_id = '';
        this.formData.module_id = '';
      }
    },
    'formData.level_id'(newVal) {
      if (!newVal) {
        this.formData.module_id = '';
      }
    },
    'selectedTemplate'(newVal, oldVal) {
      console.log('Template changed from', oldVal, 'to', newVal);
    }
  },

  async mounted() {
    await this.loadSelectOptions();
    this.users = await this.userApi.getAll({ select: "id|full_name|type|email|phone|username|department_id" });
  },

  methods: {
    selectTemplate(template) {
      this.selectedTemplate = template;
      console.log('Selected template:', template);
    },

    getCourseName() {
      const course = this.courses.find(c => c.id == this.formData.course_id);
      return course ? course.name : 'Business English Communication';
    },

    getLevelName() {
      const level = this.allLevels.find(l => l.id == this.formData.level_id);
      return level ? level.title : 'Advanced (C1)';
    },

    getModuleName() {
      const module = this.allModules.find(m => m.id == this.formData.module_id);
      return module ? module.name : 'Negotiation skills';
    },
    
    getUserFullName(userId) {
      const user = this.users.find(user => user.id === userId);
      return user ? user.full_name : '';
    },

    getUserPhone(userId) {
      const user = this.users.find(user => user.id === userId);
      return user ? user.phone : '';
    },

    showCertificateUsers(certificate) {
      this.selectedCertificate = certificate;
      this.usersModalVisible = true;
    },

    closeUsersModal() {
      this.usersModalVisible = false;
      this.selectedCertificate = null;
    },
    
    async loadSelectOptions() {
      try {
        const coursesResponse = await this.courseApi.getAll({ select: 'id|name' });
        this.courses = coursesResponse.data || coursesResponse;
        
        const levelsResponse = await this.levelApi.getAll({ select: 'id|title|course_id' });
        this.allLevels = levelsResponse.data || levelsResponse;
        
        const modulesResponse = await this.moduleApi.getAll({ select: 'id|name|levels_id' });
        this.allModules = modulesResponse.data || modulesResponse;
      } catch (error) {
        console.error("Error loading options:", error);
        this.$toast.error("Failed to load form options");
      }
    },

    async onCourseChange() {
      this.formData.level_id = '';
      this.formData.module_id = '';
      this.filteredLevels = [];
      this.filteredModules = [];

      if (this.formData.course_id) {
        try {
          const levelsResponse = await this.levelApi.getAll({ 
            filter: `course_id|${this.formData.course_id}|=`,
          });
          
          this.filteredLevels = levelsResponse.data || levelsResponse;
          await Swal.close();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to load levels',
            text: error.message || 'Something went wrong!',
          });
        }
      }
    },

    async onLevelChange() {
      this.formData.module_id = '';
      this.filteredModules = [];

      if (this.formData.level_id) {
        try {
          const ModulesResponse = await this.moduleApi.getAll({ 
            filter: `level_id|${this.formData.level_id}|=`,
          });

          this.filteredModules = ModulesResponse.data || ModulesResponse;
          await Swal.close();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to load modules',
            text: error.message || 'Something went wrong!',
          });
        }
      }
    },

    onTypeChange() {
      // Handle type change if needed
    },

    showCertificatePreview(item) {
      this.selectedCertificateTemplate = item.template_html;
      this.formData.fullBackgroundPath = item.fullBackgroundPath;

       if (this.selectedCertificateTemplate && this.formData.fullBackgroundPath) {
          this.selectedCertificateTemplate = this.selectedCertificateTemplate.replace(
            /(background-image:\s*url\()['"][^'"]*['"](\))/,
            `$1'${this.formData.fullBackgroundPath}'$2`
          );
        }
          
      this.certificatePreviewModal = true;
    },
    
    closecertificatePreviewModal() {
      this.certificatePreviewModal = false;
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.formData.background = file;
        this.previewBackground = URL.createObjectURL(file);
      }
    },

    handleFormSubmit() {
      if (!this.showPreview) {
        this.previewTemplate();
      } else {
        this.saveTemplate();
      }
    },

    previewTemplate() {
      if (this.formData.background instanceof File) {
        this.previewBackground = URL.createObjectURL(this.formData.background);
      } else if (this.isEditMode && this.formData.fullBackgroundPath) {
        this.previewBackground = this.formData.fullBackgroundPath || '';
      }

      // Generate QR code
      this.qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('#QRCODELINK')}`;
      
      this.showPreview = true;
    },
    
    generateTemplateHtml() {
      // Embedded CSS styles for self-contained display
      const embeddedStyles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500&display=swap');
          
          .fixed-certificate {
            width: 1000px;
            height: 700px;
            background: white;
            position: relative;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            padding: 60px 80px;
            display: flex;
            flex-direction: column;
            font-family: 'Roboto', sans-serif;
            margin: 0 auto;
          }
          
          /* Template 1 Styles */
          .template1 .cert-border { position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 3px solid #000000; pointer-events: none; }
          .template1 .cert-header { text-align: center; margin-bottom: 10px; }
          .template1 .cert-main-title { font-size: 72px; font-weight: 700; letter-spacing: 8px; color: #000000; margin: 0; font-family: 'Playfair Display', serif; }
          .template1 .cert-subtitle { font-size: 20px; color: #999999; font-style: italic; letter-spacing: 2px; margin: 5px 0 0 0; }
          .template1 .cert-divider { width: 200px; height: 1px; background: #CCCCCC; margin: 20px auto; }
          .template1 .cert-presented-text { text-align: center; font-size: 16px; color: #666666; margin: 20px 0 10px 0; }
          .template1 .cert-recipient-name { text-align: center; font-size: 48px; font-weight: 400; color: #000000; font-style: italic; font-family: 'Playfair Display', serif; margin: 10px 0 30px 0; }
          .template1 .cert-body-text { text-align: center; font-size: 16px; color: #333333; line-height: 1.8; margin: 20px auto; max-width: 700px; }
          .template1 .cert-body-text strong { color: #000000; font-weight: 500; }
          .template1 .cert-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 40px; }
          .template1 .cert-footer-item { text-align: center; }
          .template1 .cert-footer-value { font-size: 18px; font-weight: 500; color: #000000; margin: 0 0 5px 0; }
          .template1 .cert-footer-label { font-size: 12px; color: #999999; letter-spacing: 1px; margin: 0; }
          .template1 .cert-qr-code { width: 90px; height: 90px; }
          .template1 .cert-qr-code img { width: 100%; height: 100%; object-fit: contain; }
          
          /* Template 2 Styles */
          .template2 .cert-border-gold { position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 3px solid #D4AF37; pointer-events: none; }
          .template2 .cert-qr-top-right { position: absolute; top: 50px; right: 50px; width: 80px; height: 80px; }
          .template2 .cert-qr-top-right img { width: 100%; height: 100%; object-fit: contain; }
          .template2 .cert-header-gold { text-align: center; margin-bottom: 10px; margin-top: 20px; }
          .template2 .cert-main-title-gold { font-size: 72px; font-weight: 700; letter-spacing: 8px; color: #D4AF37; margin: 0; font-family: 'Playfair Display', serif; }
          .template2 .cert-subtitle-gold { font-size: 20px; color: #B8960F; font-style: italic; letter-spacing: 2px; margin: 5px 0 0 0; }
          .template2 .cert-divider-gold { width: 200px; height: 1px; background: #D4AF37; margin: 20px auto; }
          .template2 .cert-presented-text-gold { text-align: center; font-size: 16px; color: #666666; margin: 20px 0 10px 0; }
          .template2 .cert-recipient-name-gold { text-align: center; font-size: 48px; font-weight: 400; color: #D4AF37; font-style: italic; font-family: 'Playfair Display', serif; margin: 10px 0 30px 0; }
          .template2 .cert-body-text-gold { text-align: center; font-size: 16px; color: #333333; line-height: 1.8; margin: 20px auto; max-width: 700px; }
          .template2 .text-gold { color: #D4AF37; font-weight: 500; }
          .template2 .cert-footer-gold { margin-top: auto; display: flex; justify-content: space-around; align-items: center; padding-top: 40px; }
          .template2 .cert-footer-item { text-align: center; }
          .template2 .cert-footer-value-gold { font-size: 18px; font-weight: 500; color: #D4AF37; margin: 0 0 5px 0; }
          .template2 .cert-footer-label-gold { font-size: 12px; color: #999999; letter-spacing: 1px; margin: 0; }
          
          /* Custom Template Styles */
          .custom { background-size: cover; background-position: center; background-repeat: no-repeat; background-color: white; }
          .custom .custom-border { position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px; border: 3px solid #2c3e50; pointer-events: none; }
          .custom .custom-qr-top-right { position: absolute; top: 50px; right: 50px; width: 80px; height: 80px; }
          .custom .custom-qr-top-right img { width: 100%; height: 100%; object-fit: contain; }
          .custom .custom-header { text-align: center; margin-bottom: 10px; margin-top: 20px; }
          .custom .custom-main-title { font-size: 72px; font-weight: 700; letter-spacing: 8px; color: #2c3e50; margin: 0; font-family: 'Playfair Display', serif; }
          .custom .custom-subtitle { font-size: 20px; color: #7f8c8d; font-style: italic; letter-spacing: 2px; margin: 5px 0 0 0; }
          .custom .custom-divider { width: 200px; height: 1px; background: #bdc3c7; margin: 20px auto; }
          .custom .custom-presented-text { text-align: center; font-size: 16px; color: #666666; margin: 20px 0 10px 0; }
          .custom .custom-recipient-name { text-align: center; font-size: 48px; font-weight: 400; color: #2c3e50; font-style: italic; font-family: 'Playfair Display', serif; margin: 10px 0 30px 0; }
          .custom .custom-body-text { text-align: center; font-size: 16px; color: #333333; line-height: 1.8; margin: 20px auto; max-width: 700px; }
          .custom .custom-bold { color: #2c3e50; font-weight: 500; }
          .custom .custom-footer { margin-top: auto; display: flex; justify-content: space-around; align-items: center; padding-top: 40px; }
          .custom .custom-footer-item { text-align: center; }
          .custom .custom-footer-value { font-size: 18px; font-weight: 500; color: #2c3e50; margin: 0 0 5px 0; }
          .custom .custom-footer-label { font-size: 12px; color: #999999; letter-spacing: 1px; margin: 0; }
        </style>
      `;

        let bodyText = '';
  if (this.formData.type === 'lms') {
    bodyText = `<p>For successfully completing the <strong>${this.getCourseName()}</strong> course at</p>
                <p><strong>${this.getLevelName()}</strong> level. <strong>${this.getModuleName()}</strong> modal</p>`;
  } else if (this.formData.type === 'physical') {
    bodyText = `<p>This certificate is awarded in recognition of the participant's commitment and successful completion <strong>#courseName</strong></p>`;
  }

      if (this.selectedTemplate === 'template1') {
        return embeddedStyles + `
          <div class="fixed-certificate template1">
            <div class="cert-border"></div>
            <div class="cert-header">
              <h1 class="cert-main-title">CERTIFICATE</h1>
              <p class="cert-subtitle">OF COMPLETION</p>
            </div>
            <div class="cert-divider"></div>
            <p class="cert-presented-text">This Certificate Is Proudly Presented To</p>
            <h2 class="cert-recipient-name">#UserName</h2>
            <div class="cert-body-text">
                ${bodyText}
            </div>
            <div class="cert-footer">
              <div class="cert-footer-item">
                <p class="cert-footer-value">#Date</p>
                <p class="cert-footer-label">DATE</p>
              </div>
              <div class="cert-qr-code">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=%23QRCODELINK" alt="QR Code">
              </div>
              <div class="cert-footer-item">
                <p class="cert-footer-value">#Percentage</p>
                <p class="cert-footer-label">PERCENTAGE</p>
              </div>
            </div>
          </div>
        `;
      } else if (this.selectedTemplate === 'template2') {
        return embeddedStyles + `
          <div class="fixed-certificate template2">
            <div class="cert-border-gold"></div>
            <div class="cert-qr-top-right">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=%23QRCODELINK" alt="QR Code">
            </div>
            <div class="cert-header-gold">
              <h1 class="cert-main-title-gold">CERTIFICATE</h1>
              <p class="cert-subtitle-gold">OF COMPLETION</p>
            </div>
            <div class="cert-divider-gold"></div>
            <p class="cert-presented-text-gold">This Certificate Is Proudly Presented To</p>
            <h2 class="cert-recipient-name-gold">#UserName</h2>
            <div class="cert-body-text-gold">
               ${bodyText.replace(/<strong>/g, '<strong class="text-gold">').replace(/<\/strong>/g, '</strong>')}
            </div>
            <div class="cert-footer-gold">
              <div class="cert-footer-item">
                <p class="cert-footer-value-gold">#Date</p>
                <p class="cert-footer-label-gold">DATE</p>
              </div>
              <div class="cert-footer-item">
                <p class="cert-footer-value-gold">#Grade</p>
                <p class="cert-footer-label-gold">GARD</p>
              </div>
              <div class="cert-footer-item">
                <p class="cert-footer-value-gold">#Percentage</p>
                <p class="cert-footer-label-gold">PERCENTAGE</p>
              </div>
            </div>
          </div>
        `;
      } else {
        // Custom template
        return embeddedStyles + `
          <div class="fixed-certificate custom" style="${this.previewBackground ? `background-image: url('${this.previewBackground}'); background-size: cover; background-position: center; background-repeat: no-repeat;` : 'background-color: white;'}">
            <div class="custom-border"></div>
            <div class="custom-qr-top-right">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=%23QRCODELINK" alt="QR Code">
            </div>
            <div class="custom-header">
              <h1 class="custom-main-title">CERTIFICATE</h1>
              <p class="custom-subtitle">OF COMPLETION</p>
            </div>
            <div class="custom-divider"></div>
            <p class="custom-presented-text">This Certificate Is Proudly Presented To</p>
            <h2 class="custom-recipient-name">#UserName</h2>
            <div class="custom-body-text">
                 ${bodyText.replace(/<strong>/g, '<strong class="custom-bold">').replace(/<\/strong>/g, '</strong>')}
            </div>
            <div class="custom-footer">
              <div class="custom-footer-item">
                <p class="custom-footer-value">#Date</p>
                <p class="custom-footer-label">DATE</p>
              </div>
              <div class="custom-footer-item">
                <p class="custom-footer-value">#Grade</p>
                <p class="custom-footer-label">GARD</p>
              </div>
              <div class="custom-footer-item">
                <p class="custom-footer-value">#Percentage</p>
                <p class="custom-footer-label">PERCENTAGE</p>
              </div>
            </div>
          </div>
        `;
      }
    },
    
    async saveTemplate() {
      const loadingSwal = Swal.fire({
        title: this.$t('processing'),
        html: this.$t('please_wait'),
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      try {
        const templateHtml = this.generateTemplateHtml();
        this.formData.template_html = templateHtml;
        this.formData.template_type = this.selectedTemplate;
        
        const formData = new FormData();
        formData.append('name', this.formData.name);
        formData.append('type', this.formData.type);
        formData.append('template_type', this.selectedTemplate); // Send selected template style
        
        if (this.formData.type === 'lms') {
          formData.append('course_id', this.formData.course_id);
          formData.append('level_id', this.formData.level_id);
          formData.append('module_id', this.formData.module_id);
        }
        formData.append('text', this.formData.text);
        formData.append('template_html', templateHtml);
        
        if (this.formData.background && this.selectedTemplate === 'custom') {
          formData.append('background', this.formData.background);
        }
        
        const response = await this.api.from(this.formData, true, formData);
        await loadingSwal.close();
        
        Swal.fire({
          title: this.$t('success'),
          text: this.isEditMode 
              ? this.$t('Template updated successfully') 
              : this.$t('Template created successfully'),
          icon: 'success'
        });
        
        this.closeForm();
      } catch (error) {
        console.error("Error saving template:", error);
        Swal.fire({
          title: this.$t('error'),
          text: this.$t('Failed to save template'),
          icon: 'error'
        });
      }
    },

    openForm() {
      this.isFlipped = true;
      this.showPreview = false;
      this.isEditMode = false;
      this.resetForm();
    },

    closeForm() {
      this.isFlipped = false;
      this.showPreview = false;
      this.isEditMode = false;
      this.$refs.table?.refreshTable();
      this.resetForm();
    },

    async editItem(data) {
      this.formData = { 
        ...data,
        id: data.id,
        course_id: data.course_id?.toString() || '',
        level_id: data.level_id?.toString() || '',
        module_id: data.module_id?.toString() || '',
        text: data.text || '',
        template_html: data.template_html || '',
        background_url: data.fullBackgroundPath || '',
        fullBackgroundPath: data.fullBackgroundPath || ''
      };

      this.previewBackground = data.fullBackgroundPath || '';
      
      this.isEditMode = true;
      this.isFlipped = true;
      
      if (this.formData.course_id) {
        await this.onCourseChange();
      }
      
      this.formData.level_id = data.level_id?.toString() || '';
      
      if (this.formData.level_id) {
        await this.onLevelChange();
      }
      
      this.formData.module_id = data.module_id?.toString() || '';
      this.selectedTemplate = data.template_type || 'template1';
      this.qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('#QRCODELINK')}`;
    },
    
    resetForm() {
      this.formData = {
        name: '',
        type: '',
        template_type: '',
        course_id: '',
        level_id: '',
        module_id: '',
        text: '',
        background: null,
        template_html: ''
      };
      this.previewBackground = '';
      this.qrCodeImage = '';
      this.filteredLevels = [];
      this.filteredModules = [];
      this.selectedTemplate = 'template1';
      
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500&display=swap');

/* ========================================
   FORM STYLES
   ======================================== */

.certificate-form-redesign {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
}

.design-settings-section {
  background: #F5F5F5;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #E0E0E0;
}

.subsection-title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  margin: 32px 0 20px 0;
}

.template-selection-group {
  margin-bottom: 32px;
}

.template-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #666666;
  margin-bottom: 12px;
}

.template-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.template-btn {
  flex: 1;
  min-width: 140px;
  padding: 14px 24px;
  border: 2px solid #E0E0E0;
  border-radius: 50px;
  background: #FFFFFF;
  color: #666666;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.template-btn:hover {
  border-color: #8B5FB6;
  color: #8B5FB6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 95, 182, 0.15);
}

.template-btn.active {
  background: #8B5FB6;
  border-color: #8B5FB6;
  color: #FFFFFF;
  box-shadow: 0 4px 16px rgba(139, 95, 182, 0.25);
}

.form-grid-two-column {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.form-group-redesign {
  display: flex;
  flex-direction: column;
}

.form-group-redesign.full-width {
  grid-column: 1 / -1;
}

.form-label-redesign {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.required-star {
  color: #E53935;
  margin-left: 4px;
  font-size: 16px;
}

.form-input-redesign,
.form-select-redesign {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #D0D0D0;
  border-radius: 8px;
  font-size: 15px;
  color: #333333;
  background: #FFFFFF;
  transition: all 0.2s ease;
}

.form-input-redesign:focus,
.form-select-redesign:focus {
  outline: none;
  border-color: #8B5FB6;
  box-shadow: 0 0 0 3px rgba(139, 95, 182, 0.1);
}

.form-select-redesign {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
  cursor: pointer;
}

.form-select-redesign:disabled {
  background-color: #F5F5F5;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-file-redesign {
  width: 100%;
  padding: 12px;
  border: 2px dashed #D0D0D0;
  border-radius: 8px;
  background: #FAFAFA;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-file-redesign:hover {
  border-color: #8B5FB6;
  background: #F9F5FC;
}

.form-hint {
  font-size: 13px;
  color: #999999;
  margin-top: 6px;
  display: block;
}

.preview-image-wrapper {
  margin-top: 16px;
}

.preview-image {
  max-width: 400px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
}

.form-actions-redesign {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 32px;
  background: #FFFFFF;
  border-top: 1px solid #E0E0E0;
  border-radius: 0 0 16px 16px;
}

.btn-cancel-redesign,
.btn-save-redesign {
  padding: 12px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 140px;
}

.btn-cancel-redesign {
  background: #FFFFFF;
  color: #6E3894;
  border: 2px solid #6E3894;
}

.btn-cancel-redesign:hover {
  background: #F9F5FC;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.15);
}

.btn-save-redesign {
  background: #8B5FB6;
  color: #FFFFFF;
  border: 2px solid #8B5FB6;
}

.btn-save-redesign:hover {
  background: #7A4FA5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 95, 182, 0.3);
}

/* ========================================
   CERTIFICATE PREVIEW STYLES
   ======================================== */

.certificate-preview-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.fixed-certificate-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #F5F5F5;
  padding: 40px 20px;
}

.certificate-preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.fixed-certificate {
  width: 1000px;
  height: 700px;
  background: white;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 60px 80px;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
}

/* TEMPLATE 1 - Black Border */
.template1 .cert-border {
  position: absolute;
  top: 30px;
  left: 30px;
  right: 30px;
  bottom: 30px;
  border: 3px solid #000000;
  pointer-events: none;
}

.template1 .cert-header {
  text-align: center;
  margin-bottom: 10px;
}

.template1 .cert-main-title {
  font-size: 72px;
  font-weight: 700;
  letter-spacing: 8px;
  color: #000000;
  margin: 0;
  font-family: 'Playfair Display', serif;
}

.template1 .cert-subtitle {
  font-size: 20px;
  color: #999999;
  font-style: italic;
  letter-spacing: 2px;
  margin: 5px 0 0 0;
}

.template1 .cert-divider {
  width: 200px;
  height: 1px;
  background: #CCCCCC;
  margin: 20px auto;
}

.template1 .cert-presented-text {
  text-align: center;
  font-size: 16px;
  color: #666666;
  margin: 20px 0 10px 0;
}

.template1 .cert-recipient-name {
  text-align: center;
  font-size: 48px;
  font-weight: 400;
  color: #000000;
  font-style: italic;
  font-family: 'Playfair Display', serif;
  margin: 10px 0 30px 0;
}

.template1 .cert-body-text {
  text-align: center;
  font-size: 16px;
  color: #333333;
  line-height: 1.8;
  margin: 20px auto;
  max-width: 700px;
}

.template1 .cert-body-text strong {
  color: #000000;
  font-weight: 500;
}

.template1 .cert-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 40px;
}

.template1 .cert-footer-item {
  text-align: center;
}

.template1 .cert-footer-value {
  font-size: 18px;
  font-weight: 500;
  color: #000000;
  margin: 0 0 5px 0;
}

.template1 .cert-footer-label {
  font-size: 12px;
  color: #999999;
  letter-spacing: 1px;
  margin: 0;
}

.template1 .cert-qr-code {
  width: 90px;
  height: 90px;
}

.template1 .cert-qr-code img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* TEMPLATE 2 - Gold Border */
.template2 .cert-border-gold {
  position: absolute;
  top: 30px;
  left: 30px;
  right: 30px;
  bottom: 30px;
  border: 3px solid #D4AF37;
  pointer-events: none;
}

.template2 .cert-qr-top-right {
  position: absolute;
  top: 50px;
  right: 50px;
  width: 80px;
  height: 80px;
}

.template2 .cert-qr-top-right img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.template2 .cert-header-gold {
  text-align: center;
  margin-bottom: 10px;
  margin-top: 20px;
}

.template2 .cert-main-title-gold {
  font-size: 72px;
  font-weight: 700;
  letter-spacing: 8px;
  color: #D4AF37;
  margin: 0;
  font-family: 'Playfair Display', serif;
}

.template2 .cert-subtitle-gold {
  font-size: 20px;
  color: #B8960F;
  font-style: italic;
  letter-spacing: 2px;
  margin: 5px 0 0 0;
}

.template2 .cert-divider-gold {
  width: 200px;
  height: 1px;
  background: #D4AF37;
  margin: 20px auto;
}

.template2 .cert-presented-text-gold {
  text-align: center;
  font-size: 16px;
  color: #666666;
  margin: 20px 0 10px 0;
}

.template2 .cert-recipient-name-gold {
  text-align: center;
  font-size: 48px;
  font-weight: 400;
  color: #D4AF37;
  font-style: italic;
  font-family: 'Playfair Display', serif;
  margin: 10px 0 30px 0;
}

.template2 .cert-body-text-gold {
  text-align: center;
  font-size: 16px;
  color: #333333;
  line-height: 1.8;
  margin: 20px auto;
  max-width: 700px;
}

.template2 .text-gold {
  color: #D4AF37;
  font-weight: 500;
}

.template2 .cert-footer-gold {
  margin-top: auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 40px;
}

.template2 .cert-footer-item {
  text-align: center;
}

.template2 .cert-footer-value-gold {
  font-size: 18px;
  font-weight: 500;
  color: #D4AF37;
  margin: 0 0 5px 0;
}

.template2 .cert-footer-label-gold {
  font-size: 12px;
  color: #999999;
  letter-spacing: 1px;
  margin: 0;
}

/* CUSTOM TEMPLATE - Matches Template 2 Design */
.custom {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: white;
}

.custom .custom-border {
  position: absolute;
  top: 30px;
  left: 30px;
  right: 30px;
  bottom: 30px;
  border: 3px solid #2c3e50;
  pointer-events: none;
}

.custom .custom-qr-top-right {
  position: absolute;
  top: 50px;
  right: 50px;
  width: 80px;
  height: 80px;
}

.custom .custom-qr-top-right img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.custom .custom-header {
  text-align: center;
  margin-bottom: 10px;
  margin-top: 20px;
}

.custom .custom-main-title {
  font-size: 72px;
  font-weight: 700;
  letter-spacing: 8px;
  color: #2c3e50;
  margin: 0;
  font-family: 'Playfair Display', serif;
}

.custom .custom-subtitle {
  font-size: 20px;
  color: #7f8c8d;
  font-style: italic;
  letter-spacing: 2px;
  margin: 5px 0 0 0;
}

.custom .custom-divider {
  width: 200px;
  height: 1px;
  background: #bdc3c7;
  margin: 20px auto;
}

.custom .custom-presented-text {
  text-align: center;
  font-size: 16px;
  color: #666666;
  margin: 20px 0 10px 0;
}

.custom .custom-recipient-name {
  text-align: center;
  font-size: 48px;
  font-weight: 400;
  color: #2c3e50;
  font-style: italic;
  font-family: 'Playfair Display', serif;
  margin: 10px 0 30px 0;
}

.custom .custom-body-text {
  text-align: center;
  font-size: 16px;
  color: #333333;
  line-height: 1.8;
  margin: 20px auto;
  max-width: 700px;
}

.custom .custom-bold {
  color: #2c3e50;
  font-weight: 500;
}

.custom .custom-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 40px;
}

.custom .custom-footer-item {
  text-align: center;
}

.custom .custom-footer-value {
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.custom .custom-footer-label {
  font-size: 12px;
  color: #999999;
  letter-spacing: 1px;
  margin: 0;
}

/* Preview Actions */
.preview-actions-fixed {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-top: 1px solid #E0E0E0;
}

.btn-back,
.btn-save-template {
  padding: 14px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-back {
  background: #FFFFFF;
  color: #666666;
  border: 2px solid #E0E0E0;
}

.btn-back:hover {
  background: #F5F5F5;
  border-color: #CCCCCC;
  transform: translateY(-2px);
}

.btn-save-template {
  background: #8B5FB6;
  color: #FFFFFF;
  border: 2px solid #8B5FB6;
}

.btn-save-template:hover {
  background: #7A4FA5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 95, 182, 0.3);
}

/* Responsive */
@media (max-width: 1200px) {
  .fixed-certificate {
    width: 900px;
    height: 630px;
    padding: 50px 60px;
  }
}

@media (max-width: 992px) {
  .form-grid-two-column {
    grid-template-columns: 1fr;
  }
  
  .template-buttons {
    flex-direction: column;
  }
  
  .template-btn {
    width: 100%;
  }

  .fixed-certificate {
    width: 100%;
    height: auto;
    aspect-ratio: 10/7;
    padding: 40px;
  }
}

@media (max-width: 768px) {
  .design-settings-section {
    padding: 20px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .form-actions-redesign {
    padding: 16px 20px;
    flex-direction: column;
  }
  
  .btn-cancel-redesign,
  .btn-save-redesign {
    width: 100%;
  }

  .fixed-certificate {
    padding: 30px 20px;
  }

  .preview-actions-fixed {
    flex-direction: column;
  }

  .btn-back,
  .btn-save-template {
    width: 100%;
    justify-content: center;
  }
}

/* Modal & Users Dialog */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
}

.btn-users{
  background-color: #D0B5E3 !important;
  color: #43235C !important;
  border-radius: 10px;
  border: none !important;
}

.text-name{
  color: #6E3894 !important;
}

::v-deep .custom-users-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}

.users-dialog-card {
  border-radius: 24px !important;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.users-dialog-header {
  padding: 32px 40px 24px 40px !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F5F5F5;
  background: #ffffff;
}

.dialog-title {
  font-size: 24px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.users-dialog-body {
  padding: 0 !important;
  overflow-y: auto;
  flex: 1;
}

.table-wrapper {
  background: #FAFAFA;
  border-radius: 16px;
  margin: 24px 40px;
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.users-table th {
  padding: 20px 24px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: transparent;
}

.users-table tbody tr {
  background: #ffffff;
  transition: background 0.2s ease;
}

.users-table tbody tr:not(:last-child) {
  border-bottom: 1px solid #F0F0F0;
}

.users-table tbody tr:hover {
  background: #F9F9F9;
}

.users-table td {
  padding: 20px 24px;
  font-size: 16px;
  color: #1A1A1A;
  vertical-align: middle;
}

.view-certificate-btn {
  background: #D0B5E3 !important;
  color: #6E3894 !important;
  border-radius: 12px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  padding: 10px 24px !important;
  height: auto !important;
  min-width: auto !important;
}

.view-certificate-btn:hover {
  background: #C5A8D9 !important;
  color: #5D2E7D !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.15) !important;
}

.empty-state {
  padding: 60px 40px;
  text-align: center;
}

.empty-state p {
  font-size: 16px;
  color: #999999;
  margin: 0;
}

</style>