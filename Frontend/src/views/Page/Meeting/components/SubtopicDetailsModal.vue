<template>
  <v-dialog v-model="internalVisible" max-width="750" persistent>
    <v-card class="rounded-lg elevation-3" dir="ltr">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center px-6 py-4" style="background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
        <span class="text-h6 font-weight-semibold" style="color: #000000; font-size: 18px;">{{ $t('meeting.details') }}</span>
        <v-btn icon @click="$emit('close')" class="close-btn">
          <v-icon color="#1a1a1a" size="24">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pt-4 pb-4">
        <!-- Top Row Section: Agene Name, Created By, Owner -->
        <div class="info-section mb-4">
          <v-row class="ma-0">
            <v-col cols="12" md="4" class="py-2">
              <div class="info-item mb-3">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-file-document-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.agenda_name') }}:</span>
                </div>
                <div class="info-value">{{ subtopic.name || $t('common.na') }}</div>
              </div>
              
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-calendar-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.created_date') }}:</span>
                </div>
                <div class="info-value">{{ formatDate(subtopic.created_at) }}</div>
              </div>
            </v-col>
            
            <v-col cols="12" md="4" class="py-2">
              <div class="info-item mb-3">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-account-outline</v-icon>
                  <span class="info-label">{{ $t('common.created_by') }}:</span>
                </div>
                <div class="info-value">{{ getUserName(subtopic?.created_by) }}</div>
              </div>
              
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-calendar-clock-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.updated_date') }}:</span>
                </div>
                <div class="info-value">{{ formatDate(subtopic.updated_at) }}</div>
              </div>
            </v-col>
            
            <v-col cols="12" md="4" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-account-tie-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.owner') }}:</span>
                </div>
                <div class="info-value">{{ getUsersNames(subtopic?.owner_id) }}</div>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Main Topic Information Section -->
        <div class="info-section mb-4">
          <h3 class="section-title mb-3">{{ $t('meeting.main_topic_information') }}</h3>
          
          <v-row class="ma-0">
            <v-col cols="12" md="4" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-file-document-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.main_topic_name') }}:</span>
                </div>
                <div class="info-value">{{ subtopic.main_topic?.name || $t('common.na') }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="4" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-account-outline</v-icon>
                  <span class="info-label">{{ $t('common.created_by') }}:</span>
                </div>
                <div class="info-value">{{ getUserName(subtopic.main_topic?.created_by) || $t('common.na') }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="4" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-calendar-clock-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.last_updated') }}:</span>
                </div>
                <div class="info-value">{{ formatDate(subtopic.main_topic?.updated_at) || $t('common.na') }}</div>
              </div>
            </v-col>
          </v-row>

          <v-row v-if="subtopic.main_topic?.description" class="ma-0 mt-2">
            <v-col cols="12" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-text-box-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.main_topic_description') }}</span>
                </div>
                <div class="info-value description-text">
                  {{ stripHtml(subtopic.main_topic.description) }}
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Description Section -->
        <div class="info-section mb-4">
          <h3 class="section-title mb-3">{{ $t('meeting.description') }}</h3>
          <div class="description-box">
            {{ stripHtml(subtopic.description) || $t('meeting.no_description_provided') }}
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Meeting Details Section -->
        <div class="info-section mb-4">
          <h3 class="section-title mb-3">{{ $t('meeting.meeting_details') }}</h3>
          
          <v-row class="ma-0">
            <v-col cols="12" md="6" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-gavel</v-icon>
                  <span class="info-label">{{ $t('meeting.meeting_decision') }}:</span>
                </div>
                <div class="info-value" v-html="subtopic?.decision"></div>
              </div>
            </v-col>
            
            <v-col cols="12" md="6" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-note-text-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.meeting_notes') }}:</span>
                </div>
                <div class="info-value" v-html="subtopic?.meeting_note"></div>
              </div>
            </v-col>
          </v-row>

          <v-row class="ma-0 mt-2">
            <v-col cols="12" class="py-2">
              <div class="info-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="20" color="#7C3AED" class="me-2">mdi-clipboard-text-outline</v-icon>
                  <span class="info-label">{{ $t('meeting.meeting_general_note') }}:</span>
                </div>
                <div class="description-box" v-html="meetingData?.decision_note">
                  
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Stakeholders Section -->
        <div class="info-section mb-4">
          <h3 class="section-title mb-3">{{ $t('meeting.stakeholders') }}</h3>
          <div class="stakeholder-chip">
            <span v-if="subtopic.stakeholder_ids?.length">
              {{ subtopic.stakeholder_ids.map(id => getUserName(id)).join(', ') }}
            </span>
            <span v-else class="text-muted">{{ $t('meeting.no_stakeholders_assigned') }}</span>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Attached Files Section -->
        <div class="info-section">
          <h3 class="section-title mb-3">
            {{ $t('meeting.attached_files') }}
            <v-chip 
              x-small 
              color="#7C3AED" 
              text-color="white" 
              class="ms-2"
            >
              {{ fileCount }}
            </v-chip>
          </h3>
          
          <div v-if="fileCount === 0" class="no-files-box">
            <v-icon color="#999999" size="24" class="me-2">mdi-file-alert-outline</v-icon>
            <span class="text-muted">{{ $t('meeting.no_files_attached') }}</span>
          </div>
          
          <div v-else class="files-list">
            <div 
              v-for="(file, index) in filteredFiles" 
              :key="index"
              class="file-item"
              @click="openFilePreview(file)"
            >
              <v-icon :color="getFileColor(file)" size="24" class="me-3">
                {{ getFileIcon(file) }}
              </v-icon>
              <div class="file-info">
                <div class="file-name">{{ getFileName(file) }}</div>
              </div>
              <v-icon color="#7C3AED" size="20" class="ms-auto">mdi-open-in-new</v-icon>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Footer -->
        <v-card-actions class="px-6 py-4 justify-end" style="background-color: #ffffff; border-top: 1px solid #e0e0e0;">
        <v-btn 
          outlined 
          @click="$emit('close')"
          class="cancel-btn"
          style="text-transform: none; border: 1.5px solid #7C3AED; color: #7C3AED; font-weight: 500; padding: 8px 24px; border-radius: 6px;"
        >
          {{ $t('meeting.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- File Actions Modal -->
    <FileActionsModal 
      :visible="showFileModal" 
      :files="selectedFiles" 
      :loading="isFileActionLoading"
      :loadingFileId="loadingFileId" 
      @close="showFileModal = false" 
      @edit="handleFileEdit" 
      @delete="handleFileDelete"
      @upload="handleFileUpload" 
      @edit-start="loadingFileId = $event" 
      @edit-cancel="loadingFileId = null"
      @delete-start="loadingFileId = $event" 
      :canUpload="false" 
      :canEdit="false" 
      :canDelete="false" 
    />

    <!-- Description Modal -->
    <v-dialog v-model="showDescriptionModal" max-width="750px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ $t("common.full_description") }}</span>
          <v-btn icon @click="showDescriptionModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="description-content" v-html="fullDescription"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showDescriptionModal = false">{{ $t("common.close") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import FileActionsModal from "@/components/commen/FileActionsModal.vue";

export default {
  name: 'SubtopicDetailsModal',
  components: {
    FileActionsModal,
  },
  props: {
    visible: { type: Boolean, default: false },
    meetingData: {
      type: Object,
      default: () => ({})
    },
    subtopic: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        description: '',
        created_at: '',
        updated_at: '',
        created_by: '',
        department_id: '',
        owner_id: '',
        stakeholder_ids: [],
        topic_files: [],
        main_topic: {},
        agenda_ids: [],
        decision: '',
        meeting_note: ''
      })
    },
    users: {
      type: Array,
      default: () => []
    },
    departments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      internalVisible: this.visible,
      showDescriptionModal: false,
      fullDescription: "",
      selectedFiles: [],
      isFileActionLoading: false,
      viewUserModal: false,
      showFileModal: false,
      selectedTopic: {},
    };
  },
  computed: {
    fileCount() {
      if (!this.subtopic.topic_files || this.subtopic.topic_files.length === 0) {
        return 0;
      }
      
      // Check if the only file is the placeholder "files"
      if (this.subtopic.topic_files.length === 1 && 
          this.getFileName(this.subtopic.topic_files[0]) === "files") {
        return 0;
      }
      
      return this.subtopic.topic_files.length;
    },
    
    filteredFiles() {
      if (!this.subtopic.topic_files || this.subtopic.topic_files.length === 0) {
        return [];
      }
      
      // Filter out placeholder "files"
      return this.subtopic.topic_files.filter(file => 
        this.getFileName(file) !== "files"
      );
    }
  },
  watch: {
    visible(val) {
      this.internalVisible = val;
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return this.$t('common.na');
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    },

    getUserName(userId) {
      const user = this.users.find(u => u.id === userId);
      return user ? `${user.full_name}` : this.$t('meeting.unknown_user');
    },
    getUsersNames(userIds) {
      return userIds.map(userId => this.getUserName(userId)).join(', ');
    },

    getDepartmentName(departmentId) {
      const dept = this.departments.find(d => d.id === departmentId);
      return dept ? dept.name : 'Unknown Department';
    },

    isImage(fileUrl) {
      if (!fileUrl) return false;
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
      return imageExtensions.some(ext => fileUrl.toLowerCase().includes(ext));
    },

    getFileName(fileUrl) {
      if (!fileUrl) return 'file';
      const parts = fileUrl.split('/');
      return parts[parts.length - 1].split('?')[0];
    },

    getFileIcon(fileUrl) {
      if (this.isImage(fileUrl)) return 'mdi-image';

      const extension = this.getFileName(fileUrl).split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf': return 'mdi-file-pdf-box';
        case 'doc':
        case 'docx': return 'mdi-file-word-box';
        case 'xls':
        case 'xlsx': return 'mdi-file-excel-box';
        case 'ppt':
        case 'pptx': return 'mdi-file-powerpoint-box';
        case 'zip':
        case 'rar': return 'mdi-folder-zip';
        case 'txt': return 'mdi-file-document-outline';
        case 'mp3':
        case 'wav': return 'mdi-music';
        case 'mp4':
        case 'mov': return 'mdi-video';
        default: return 'mdi-file-outline';
      }
    },
    
    getFileColor(fileUrl) {
      if (this.isImage(fileUrl)) return '#10B981';

      const extension = this.getFileName(fileUrl).split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf': return '#EF4444';
        case 'doc':
        case 'docx': return '#2563EB';
        case 'xls':
        case 'xlsx': return '#059669';
        case 'ppt':
        case 'pptx': return '#F59E0B';
        case 'zip':
        case 'rar': return '#8B5CF6';
        case 'txt': return '#6B7280';
        case 'mp3':
        case 'wav': return '#EC4899';
        case 'mp4':
        case 'mov': return '#7C3AED';
        default: return '#6B7280';
      }
    },

    openFilesModal(item) {
      this.selectedFiles =
        !item.topic_files ||
          (item.topic_files.length === 1 && this.getFileName(item.topic_files[0]) === "files")
          ? []
          : item.topic_files || [];

      this.showFileModal = true;
    },

    openFilePreview(file) {
      if (file) {
        window.open(file, '_blank');
      }
    },

    truncateText(text, length = 100) {
      if (!text) return "";
      const stripped = this.stripHtml(text);
      return stripped.length > length ? `${stripped.substring(0, length)}...` : stripped;
    },

    stripHtml(html) {
      if (!html) return "";
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    openDescriptionModal(description) {
      this.fullDescription = description || "";
      this.showDescriptionModal = true;
    }
  }
};
</script>

<style scoped>
/* Dialog and Card */
.v-dialog {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.v-card {
  border-radius: 8px !important;
}

/* Header */
.v-card__title {
  font-size: 18px !important;
  font-weight: 600 !important;
}

.close-btn {
  background-color: transparent !important;
  box-shadow: none !important;
}

.close-btn:hover {
  background-color: #f5f5f5 !important;
}

/* Info Section - Main container with background */
.info-section {
  background-color: #F5F5F5;
  border-radius: 8px;
  padding: 16px;
}

/* Info Item Styling */
.info-item {
  display: flex;
  flex-direction: column;
  text-align: left;
  direction: ltr;
}

.info-label {
  font-size: 13px;
  font-weight: 500;
  color: #8C8C8C;
  line-height: 1.3;
  text-align: left;
}

.info-value {
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  margin-top: 3px;
  line-height: 1.4;
  text-align: left;
}

/* Section Title */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
  text-align: left;
  direction: ltr;
  display: inline-flex;
  align-items: center;
}

/* Description Box */
.description-box {
  /* background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px; */
  padding: 12px 14px;
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.5;
  min-height: 50px;
  text-align: left;
  direction: ltr;
}

.description-text {
  line-height: 1.5;
  word-break: break-word;
  text-align: left;
  direction: ltr;
}

/* Stakeholder Chip */
.stakeholder-chip {
  /* background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px; */
  padding: 10px 14px;
  font-size: 14px;
  color: #1a1a1a;
  display: inline-block;
  min-width: 120px;
}

.text-muted {
  color: #999999;
}

/* No Files Box */
.no-files-box {
  background-color: #ffffff;
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
  padding: 20px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999999;
}

/* Files List */
.files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item:hover {
  background-color: #f9fafb;
  border-color: #7C3AED;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.1);
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Upload Section */
.upload-section {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-section:hover {
  background-color: #f9fafb;
  border-color: #7C3AED;
}

.upload-text {
  font-size: 14px;
  color: #7C3AED;
  font-weight: 500;
}

/* Divider */
.v-divider {
  border-color: #e0e0e0 !important;
}

/* Cancel Button */
.cancel-btn {
  background-color: #FFF !important;
  color:#6E3894 !important;
  border-color: #6E3894 !important;
  border-radius: 12px !important;
}

/* Row and Column adjustments */
.v-row {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.v-col {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .v-card {
    margin: 16px;
  }
  
  .info-item {
    margin-bottom: 12px;
  }

  .info-section {
    padding: 12px;
  }
}
</style>