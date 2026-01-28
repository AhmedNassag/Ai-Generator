<template>
  <div class="agenda-container">
    <!-- General Info Section -->
    <div class="info-card">
      <div class="card-header">
        <h3 class="card-title">{{ $t("agenda.general_info") }}</h3>
      </div>

      <div class="card-content">
        <div class="info-grid">
          <!-- Agenda Name -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.agenda_name") }}</span>
              <span class="info-value">{{ agendaDetails.name || $t("agenda.not_available") }}</span>
            </div>
          </div>

          <!-- Created By -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.created_by") }}</span>
              <div class="user-info">
                <div class="user-avatar" @click.prevent="openUserDetailsModal(users.find((u) => u.id === agendaDetails.created_by))">
                  {{ getUserInitials(creatorName) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Agenda Description -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.agenda_description") }}</span>
              <span class="info-value cursor-pointer" @click="openDescriptionModal(agendaDetails?.description)">
                {{ stripHtml(truncateText(agendaDetails?.description || $t("agenda.not_available"), 40)) }}
              </span>
            </div>
          </div>

          <!-- Agenda Status -->
          <div class="info-item">
            <div class="status-icon"><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.agenda_status") }}</span>
              <span class="status-badge" :class="agendaDetails.is_open ? 'status-open' : 'status-closed'">
                {{ agendaDetails.is_open ? $t("common.open") : $t("common.closed") }}
              </span>
            </div>
          </div>

          <!-- Created At -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("common.created_at") }}</span>
              <span class="info-value">{{ formattedCreatedDate }}</span>
            </div>
          </div>

          <!-- Agenda Files -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.agenda_files") }}</span>
              <span class="info-value cursor-pointer file-link" @click="openFilesModal(agendaDetails)">
                {{ hasFiles ? $t("agenda.uploaded_file") : $t("agenda.no_files") }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meeting Details Section -->
    <div v-if="hasMeeting" class="info-card mt-4">
      <div class="card-header">
        <h3 class="card-title">{{ $t("agenda.meeting_details") }}</h3>
      </div>

      <div class="card-content">
        <div class="info-grid">
          <!-- Meeting Title -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.meeting_title") }}</span>
              <router-link :to="{ path: `/meeting-details/${meetingDetails.id}` }" class="info-value link-value">
                {{ meetingDetails.title || $t("agenda.not_available") }}
              </router-link>
            </div>
          </div>

          <!-- Participants -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.participants") }}:</span>
              <span v-if="allParticipants && allParticipants.length > 0">
                <div v-if="allParticipants.length === 1" class="user-info">
                  <div class="user-avatar" @click.prevent="openUserDetailsModal(allParticipants[0])">
                    {{ getUserInitials(allParticipants[0]?.full_name || allParticipants[0]?.name) }}
                  </div>
                  <span class="user-fullname">
                    {{ allParticipants[0]?.full_name || allParticipants[0]?.name }}
                  </span>
                </div>
                <AvatarGroup v-else :users="allParticipants" :maxVisible="3" :spacing="20" :clickable="true" 
                  :empty-text="$t('agenda.not_available')" @user-click="openUserDetailsModal" @click="openParticipantsModal" />
              </span>
              <span v-else class="info-value">{{ $t("agenda.no_participants") }}</span>
            </div>
          </div>

          <!-- Start Date -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.start_date") }}</span>
              <span class="info-value">{{ formatMeetingDate(meetingDetails.start_date) }}</span>
            </div>
          </div>

          <!-- Meeting Status -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.meeting_status") }}</span>
              <span class="status-badge" :class="getMeetingStatusClass(meetingDetails.status)">
                {{ formatMeetingStatus(meetingDetails.status) }}
              </span>
            </div>
          </div>

          <!-- Duration -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.duration") }}</span>
              <span class="info-value">{{ meetingDetails.duration || $t("agenda.not_available") }}</span>
            </div>
          </div>

          <!-- Meeting Location / URL -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.meeting_location_url") }}</span>
              <span class="info-value">{{ meetingDetails.platform || meetingDetails.location || $t("agenda.in_office") }}</span>
            </div>
          </div>

          <!-- Meeting Files -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.meeting_files") }}</span>
              <span class="info-value cursor-pointer file-link" @click="openMeetingFilesModal">
                {{ hasMeetingFiles ? $t("agenda.uploaded_file") : $t("agenda.no_files") }}
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.notes") }}</span>
              <span v-if="meetingDetails.notes" class="info-value cursor-pointer" @click="openNotesModal">
                {{ truncateText(stripHtml(meetingDetails.notes), 40) }}
              </span>
              <span v-else class="info-value">{{ $t("agenda.no_notes") }}</span>
            </div>
          </div>

          <!-- Decision Note -->
          <div class="info-item">
            <div><!-- SVG icon --></div>
            <div class="info-details">
              <span class="info-label">{{ $t("agenda.decision_note") }}</span>
              <span v-if="meetingDetails.decision_note" class="info-value cursor-pointer" @click="openDecisionModal">
                {{ truncateText(stripHtml(meetingDetails.decision_note), 40) }}
              </span>
              <span v-else class="info-value">{{ $t("agenda.no_decision_note") }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Meeting Message -->
    <div v-else class="info-card mt-4">
      <div class="card-header">
        <h3 class="card-title">{{ $t("agenda.meeting_details") }}</h3>
      </div>
      <div class="card-content">
        <div class="no-meeting-message">
          <i class="fas fa-info-circle"></i>
          <span>{{ $t("agenda.no_meeting_scheduled_for_this_agenda_yet") }}</span>
        </div>
      </div>
    </div>

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
          <div class="description-content">{{ fullDescription }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showDescriptionModal = false">
            {{ $t("common.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Participants Modal -->
    <v-dialog v-model="showParticipantsModal" max-width="560px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-6" style="padding-bottom: 16px !important">
          <span style="font-size: 18px; font-weight: 600; color: #1a1a1a">{{ $t("agenda.meeting_participants") }}</span>
          <v-btn icon small @click="showParticipantsModal = false" style="background-color: transparent">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-0">
          <!-- Present Participants -->
          <div class="participants-section" style="margin-bottom: 24px">
            <h6 style="font-size: 14px; font-weight: 600; color: #1a1a1a; padding: 0 24px 12px 24px;">
              {{ $t("agenda.present_participants") }}
            </h6>
            <v-simple-table v-if="meetingDetails.participants && meetingDetails.participants.length">
              <template v-slot:default>
                <table style="width: 100%">
                  <thead>
                    <tr style="background-color: #f8f9fa">
                      <th style="font-size: 12px; font-weight: 600; color: #6c757d; padding: 12px 24px; width: 30%; text-align: left;">
                        {{ $t("common.name") }}
                      </th>
                      <th style="font-size: 12px; font-weight: 600; color: #6c757d; padding: 12px 24px; width: 40%; text-align: left;">
                        {{ $t("common.email") }}
                      </th>
                      <th style="font-size: 12px; font-weight: 600; color: #6c757d; padding: 12px 24px; width: 30%; text-align: left;">
                        {{ $t("common.role") }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="participant in meetingDetails.participants" :key="participant.id || participant">
                      <td style="padding: 12px 24px; font-size: 14px; color: #1a1a1a;">
                        {{ getParticipantName(participant) }}
                      </td>
                      <td style="padding: 12px 24px; font-size: 14px; color: #1a1a1a;">
                        {{ getParticipantEmail(participant) }}
                      </td>
                      <td style="padding: 12px 24px">
                        <span :style="getRoleStyle(getParticipantRole(participant))">
                          {{ getParticipantRole(participant) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </v-simple-table>
            <p v-else style="color: #6c757d; font-size: 14px; padding: 0 24px">
              {{ $t("agenda.no_participants") }}
            </p>
          </div>

          <!-- Invited Participants -->
          <div class="participants-section" style="margin-bottom: 24px">
            <h6 style="font-size: 14px; font-weight: 600; color: #1a1a1a; padding: 0 24px 12px 24px;">
              {{ $t("agenda.invited_participants") }}
            </h6>
            <v-simple-table v-if="meetingDetails.invited_participants && meetingDetails.invited_participants.length">
              <template v-slot:default>
                <table style="width: 100%">
                  <thead>
                    <tr style="background-color: #f8f9fa">
                      <th style="font-size: 12px; font-weight: 600; color: #6c757d; padding: 12px 24px; width: 30%; text-align: left;">
                        {{ $t("common.name") }}
                      </th>
                      <th style="font-size: 12px; font-weight: 600; color: #6c757d; padding: 12px 24px; width: 40%; text-align: left;">
                        {{ $t("common.email") }}
                      </th>
                      <th style="font-size: 12px; font-weight: 600; color: #6c757d; padding: 12px 24px; width: 30%; text-align: left;">
                        {{ $t("common.role") }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invited in meetingDetails.invited_participants" :key="invited.id || invited">
                      <td style="padding: 12px 24px; font-size: 14px; color: #1a1a1a;">
                        {{ getParticipantName(invited) }}
                      </td>
                      <td style="padding: 12px 24px; font-size: 14px; color: #1a1a1a;">
                        {{ getParticipantEmail(invited) }}
                      </td>
                      <td style="padding: 12px 24px">
                        <span :style="getRoleStyle(getParticipantRole(invited))">
                          {{ getParticipantRole(invited) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </v-simple-table>
            <p v-else style="color: #6c757d; font-size: 14px; padding: 0 24px">
              {{ $t("agenda.no_participants") }}
            </p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Meeting Files Modal -->
    <v-dialog v-model="showMeetingFilesModal" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ $t("agenda.meeting_files") }}</span>
          <v-btn icon @click="showMeetingFilesModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="files-content">
            <div v-if="meetingDetails.meeting_files && meetingDetails.meeting_files.length">
              <div v-for="(file, index) in meetingDetails.meeting_files" :key="index" class="file-item mb-2">
                <a :href="file" target="_blank" class="text-primary">
                  <i class="fas fa-file me-2"></i>
                  {{ getFileNameFromPath(file) }}
                </a>
              </div>
            </div>
            <p v-else class="text-muted">{{ $t("agenda.no_files") }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showMeetingFilesModal = false">
            {{ $t("common.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Meeting Notes Modal -->
    <v-dialog v-model="showNotesModal" max-width="750px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ $t("agenda.meeting_notes") }}</span>
          <v-btn icon @click="showNotesModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="notes-content">
            {{ stripHtml(meetingDetails.notes || "") }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showNotesModal = false">
            {{ $t("common.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Decision Note Modal -->
    <v-dialog v-model="showDecisionModal" max-width="750px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ $t("agenda.decision_note") }}</span>
          <v-btn icon @click="showDecisionModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="decision-content">
            {{ stripHtml(meetingDetails.decision_note || "") }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showDecisionModal = false">
            {{ $t("common.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View User Details Modal -->
    <ViewUserDetails
      :viewUserModal="viewUserModal"
      :userData="userData"
      @close="viewUserModal = false"
      @update:viewUserModal="viewUserModal = $event"
    />
  </div>
</template>
<script>
import { ref, computed } from "vue";
import Agenda from "@/API/Agenda/Agenda";
import FileActionsModal from "@/components/commen/FileActionsModal.vue";
import AvatarGroup from "@/components/AvatarGroup.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";

export default {
  components: {
    FileActionsModal,
    AvatarGroup,
    ViewUserDetails,
  },
  props: {
    agendaDetails: { type: Object, required: true },
    authUser: { type: Object, default: () => ({}) },
    users: { type: Array, default: () => [] },
  },
  setup() {
    const agendaApi = new Agenda();
    return { agendaApi };
  },
  data() {
    return {
      viewUserModal: false,
      userData: {},
      selectedStatus: this.agendaDetails?.status || "draft",
      selectedFiles: [],
      isFileActionLoading: false,
      showFileModal: false,
      loadingFileId: null,
      selectedAgenda: {},
      showDescriptionModal: false,
      fullDescription: "",
      showParticipantsModal: false,
      showMeetingFilesModal: false,
      showNotesModal: false,
      showDecisionModal: false,
      avatarColors: ["#E8B4F5", "#B4D4F5", "#F5C4B4", "#C4F5B4", "#F5E4B4"],
    };
  },
  mounted() {
    this.selectedFiles = this.getValidFiles(this.agendaDetails?.files);
  },
  computed: {
    // ... all computed properties remain the same except:
    creatorName() {
      const user = this.users.find((u) => u.id === this.agendaDetails.created_by);
      return user ? user?.full_name || user.name : this.$t("agenda.unknown_user");
    },
    allParticipants() {
      const participants = this.meetingDetails.participants || [];
      const invited = this.meetingDetails.invited_participants || [];
      const allParticipantIds = [...participants, ...invited];
      return allParticipantIds
        .map((participantId) => {
          if (typeof participantId === "object") return participantId;
          return this.users.find((u) => u.id === participantId);
        })
        .filter(Boolean);
    },
    // ... rest of computed properties
  },
  methods: {
    getUserInitials(name) {
      if (!name) return "U";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },
    openUserDetailsModal(selectedUserData) {
      if (!selectedUserData) return;
      this.userData = { ...selectedUserData };
      this.viewUserModal = true;
    },
    getParticipantEmail(participant) {
      return participant.email || participant.Email || "";
    },
    getParticipantRole(participant) {
      return participant.type || this.$t("common.guest");
    },
    getRoleStyle(role) {
      // ... roleColors object remains the same
      const colors = roleColors[role] || { bg: "#f3f4f6", color: "#6b7280" };
      return {
        padding: "4px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "500",
        backgroundColor: colors.bg,
        color: colors.color,
        display: "inline-block",
      };
    },
    formatDate(date) {
      if (!date) return this.$t("agenda.not_available");
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    formatMeetingDate(date) {
      if (!date) return this.$t("agenda.not_available");
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatMeetingStatus(status) {
      if (!status) return this.$t("agenda.not_available");
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
    },
    getMeetingStatusClass(status) {
      const statusClasses = {
        scheduled: "status-scheduled",
        in_progress: "status-in-progress",
        completed: "status-completed",
        cancelled: "status-cancelled",
        postponed: "status-postponed",
      };
      return statusClasses[status] || "status-default";
    },
    getParticipantName(participant) {
      return participant ? participant?.full_name : "";
    },
    truncateText(text, length = 50) {
      if (!text) return "";
      return text.length > length ? `${text.substring(0, length)}...` : text;
    },
    stripHtml(html) {
      if (!html) return "";
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
    openDescriptionModal(description) {
      this.fullDescription = this.stripHtml(description || "");
      this.showDescriptionModal = true;
    },
    openParticipantsModal() {
      this.showParticipantsModal = true;
    },
    openMeetingFilesModal() {
      this.showMeetingFilesModal = true;
    },
    openNotesModal() {
      this.showNotesModal = true;
    },
    openDecisionModal() {
      this.showDecisionModal = true;
    },
    openFilesModal(agenda) {
      this.selectedAgenda = { ...agenda };
      this.selectedFiles = this.getValidFiles(agenda.files);
      this.showFileModal = true;
    },
    getValidFiles(files) {
      if (!files || files.length === 0) return [];
      if (files.length === 1 && this.getFileNameFromPath(files[0]) === "files") return [];
      return files || [];
    },
    async handleFileUpload(file) {
      try {
        this.isFileActionLoading = true;
        const updatedAgenda = { ...this.selectedAgenda };
        updatedAgenda.files = [...(updatedAgenda.files || []), file];
        const response = await this.agendaApi.update(updatedAgenda);
        if (response.status === "success") {
          this.$emit("files-updated", response.data.files);
          Object.assign(this.agendaDetails, response.data);
          this.selectedFiles = this.getValidFiles(response.data.files);
          this.agendaApi.poup(response, this.$t("agenda.file_upload_success"));
        }
      } catch (error) {
        console.error(this.$t("agenda.file_upload_error"), error);
        this.agendaApi.poup(null, this.$t("agenda.file_upload_try_again"));
      } finally {
        this.isFileActionLoading = false;
      }
    },
    async handleFileEdit(file) {
      try {
        this.loadingFileId = file.oldFile;
        const updatedAgenda = { ...this.selectedAgenda };
        updatedAgenda.files = updatedAgenda.files.map((f) =>
          f === file.oldFile ? file.newFile : f
        );
        const response = await this.agendaApi.update(updatedAgenda);
        if (response.status === "success") {
          this.$emit("files-updated", response.data.files);
          Object.assign(this.agendaDetails, response.data);
          this.selectedFiles = this.getValidFiles(response.data.files);
          this.agendaApi.poup(response, this.$t("agenda.file_updated"));
        }
      } catch (error) {
        console.error(this.$t("agenda.file_update_error"), error);
        this.agendaApi.poup(null, this.$t("agenda.file_update_try_again"));
      } finally {
        this.loadingFileId = null;
      }
    },
    async handleFileDelete(fileData) {
      try {
        this.loadingFileId = fileData.file;
        const updatedAgenda = { ...this.selectedAgenda };
        updatedAgenda.files = updatedAgenda.files.filter((f) => f !== fileData.file);
        updatedAgenda.files = updatedAgenda.files.map((fileUrl) => this.getFileNameFromPath(fileUrl));
        const response = await this.agendaApi.update(updatedAgenda);
        if (response.status === "success") {
          this.$emit("files-updated", response.data.files);
          Object.assign(this.agendaDetails, response.data);
          this.selectedFiles = this.getValidFiles(response.data.files);
          this.agendaApi.poup(response, this.$t("agenda.file_deleted"));
        }
      } catch (error) {
        console.error(this.$t("agenda.file_delete_error"), error);
        this.agendaApi.poup(null, this.$t("agenda.file_delete_try_again"));
      } finally {
        this.loadingFileId = null;
      }
    },
    getFileNameFromPath(url) {
      return url?.split("/").pop() || "";
    },
    getFileName(file) {
      if (!file) return "";
      if (file.name) return file.name;
      if (file.filePath) return file.filePath.split("/").pop();
      if (typeof file === "string") return file.split("/").pop();
      return this.$t("agenda.unknown");
    },
  },
};
</script>

<style scoped>
.agenda-container {
  padding: 1rem;
  max-width: 100%;
}

.info-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem;
  background: #d9d9d9;
  /* border-bottom: 1px solid #e0e0e0; */
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #000;
}

.card-content {
  padding: 0.5rem;
  background-color: #d9d9d9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  background-color: #fff;
  padding: 1rem;
  border-radius: 10px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}

.info-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: #f5f0ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  font-size: 1.125rem;
}

.status-icon {
  background: #ebf5ff;
  color: #3b82f6;
}

.info-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.info-label {
  font-size: 0.875rem;
  color: #8c8c8c;
  font-weight: 500;
}

.info-value {
  font-size: 0.9375rem;
  color: #1a1a1a;
  font-weight: 400;
  word-break: break-word;
}

.link-value {
  color: #6e3894;
  text-decoration: none;
  transition: color 0.2s;
}

.link-value:hover {
  color: #6d28d9;
  text-decoration: underline;
}

.file-link {
  color: #7c3aed;
  text-decoration: underline;
}

.cursor-pointer {
  cursor: pointer;
  transition: opacity 0.2s;
  color: #6e3894 !important;
}

.cursor-pointer:hover {
  opacity: 0.8;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  min-width: 90px;
  max-width: fit-content;
  text-align: center;
}

.status-open {
  background: #b6caae !important;
  color: #255f0b !important;
}

.status-closed {
  background: #e2b6b6 !important;
  color: #a92525 !important;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-scheduled {
  background: #dbeafe;
  color: #1e40af;
}

.status-in-progress {
  background: #fef3c7;
  color: #92400e;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.status-postponed {
  background: #e5e7eb;
  color: #374151;
}

.status-default {
  background: #f3f4f6;
  color: #6b7280;
}

.participants-avatars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar-more {
  background: #e5e7eb;
  color: #374151;
  font-size: 0.6875rem;
}

.no-meeting-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #ebf5ff;
  border-radius: 8px;
  color: #1e40af;
}

.no-meeting-message i {
  font-size: 1.25rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

/* Modal Styles */
.description-content,
.notes-content,
.decision-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #374151;
}

.participants-content ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0.5rem 0;
}

.participants-content li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}

.participants-content li:last-child {
  border-bottom: none;
}

.participants-content h6 {
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.file-item {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #f3f4f6;
}

.file-item a {
  text-decoration: none;
  color: #7c3aed;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-item a:hover {
  color: #6d28d9;
}

.text-muted {
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .info-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    font-size: 1rem;
  }

  .info-label {
    font-size: 0.8125rem;
  }

  .info-value {
    font-size: 0.875rem;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-card {
  animation: fadeIn 0.3s ease-out;
}

/* Vuetify Dialog Overrides */
:deep(.v-card-title) {
  font-weight: 600;
  color: #1a1a1a;
}

:deep(.v-card-text) {
  color: #374151;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
