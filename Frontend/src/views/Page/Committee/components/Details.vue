<template>
  <div class="figma-wrapper">
    <div class="figma-two-column">
      <!-- LEFT: Committee Details Card -->
      <div class="figma-card-left">
        <h2 class="figma-section-title">{{ $t('committee.committee_details') }}</h2>

        <div class="figma-row-container">
          <!-- Name and Type Row -->
          <div class="figma-row">
            <div class="figma-item">
              <label class="figma-label">{{ $t('common.name') }}:</label>
              <div class="figma-text">
                {{ committeeData.name || $t("common.na") }}
              </div>
            </div>

            <div class="figma-item">
              <label class="figma-label">{{ $t('common.type') }}:</label>
              <span
                v-if="committeeData.type === 'permanent'"
                class="figma-badge-green"
              >
                {{ $t("committee.permanent") }}
              </span>
              <span
                v-else-if="committeeData.type === 'temporary'"
                class="figma-badge-red"
              >
                {{ $t("committee.temporary") }}
              </span>
              <span v-else>{{ $t("common.na") }}</span>
            </div>
          </div>

          <!-- Description and Scope Row -->
          <!-- <div class="figma-row">
            <div class="figma-item">
              <label class="figma-label">{{ $t('common.description') }}:</label>
              <div class="figma-text" v-html="committeeData.description"></div>
            </div>

            <div class="figma-item">
              <label class="figma-label">{{ $t('committee.scope') }}:</label>
              <div class="figma-text" v-html="committeeData.scope"></div>
            </div>
          </div> -->
          <!-- Description and Scope Row -->
          <div class="figma-row">
            <div class="figma-item">
              <label class="figma-label">{{ $t('common.description') }}:</label>
              <div
                class="figma-text figma-clickable"
                @click="
                  openModalDescriptionOfCategory(committeeData.description)
                "
                v-html="truncateText(stripHtml(committeeData.description))"
              ></div>
            </div>

            <div class="figma-item">
              <label class="figma-label">{{ $t('committee.scope') }}:</label>
              <div
                class="figma-text figma-clickable"
                @click="openModalDescriptionOfCategory(committeeData.scope)"
                v-html="truncateText(stripHtml(committeeData.scope))"
              ></div>
            </div>
          </div>

          <!-- Formation Date and Approval (Two Columns) -->
          <div class="figma-row">
            <div class="figma-item">
              <label class="figma-label">{{ $t('committee.formation_date') }}:</label>
              <div class="figma-input-group">
                <input
                  type="text"
                  :value="formatDate(committeeData.formation_date)"
                  placeholder="Mm/Dd/Yyyy"
                  readonly
                  class="figma-date-input"
                />
                <i class="fas fa-calendar figma-calendar-icon"></i>
              </div>
            </div>

            <div class="figma-item">
              <label class="figma-label">{{ $t('committee.formation_approval') }}:</label>
              <a
                v-if="committeeData?.formation_approval_file"
                :href="committeeData.formation_approval_file"
                target="_blank"
                class="figma-link"
              >
                <i class="fas fa-file-alt"></i>
                {{ $t('committee.uploaded_file') }}
              </a>
              <span v-else>{{ $t("common.na") }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Meeting Info Card -->
      <div class="figma-card-right">
        <h2 class="figma-section-title">{{ $t('committee.meeting_info') }}</h2>

        <div class="figma-stats-container">
          <!-- Completed Meetings -->
          <div class="figma-stat-box">
            <label class="figma-stat-label">{{ $t('committee.completed_meetings') }}</label>
            <div class="figma-stat-number">
              {{ getNumberOfCompletedMeetings() }}
            </div>
          </div>

          <!-- Delayed Recommendations -->
          <div class="figma-stat-box">
            <label class="figma-stat-label">{{ $t('committee.delayed_recommendations') }}</label>
            <div
              class="figma-stat-number figma-red figma-stat-clickable"
              @click="showDelayedRecommendationsModal"
            >
              {{ getNumberOfDelayedRecommendations() }}
            </div>
          </div>

          <!-- Completed Recommendations Precision -->
          <div class="figma-stat-box">
            <label class="figma-stat-label">{{ $t('committee.precision_of_completed_recommendations') }}</label>
            <div class="figma-stat-number figma-green">
              {{ getDelayedRecommendationsPrecision() }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for full description -->
    <v-dialog v-model="showModalDescriptionOfCategory" max-width="750px">
      <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ $t('committee.full_description') }}</span>
          <v-btn icon @click="closeModalDescriptionOfCategory">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div>{{ stripHtml(fullDescription) }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="closeModalDescriptionOfCategory">
            {{ $t("common.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal for delayed recommendations -->
    <v-dialog v-model="showModalListDialog" max-width="650px">
      <v-card class="figma-modal">
        <v-card-title class="figma-modal-header">
          <span class="figma-modal-title">{{ $t('committee.delayed_recommendations') }}</span>
          <button
            class="figma-modal-close"
            @click="closeDelayedRecommendationsModal"
          >
            <i class="fas fa-times"></i>
          </button>
        </v-card-title>
        <v-card-text class="figma-modal-body">
          <div
            v-if="delayedRecommendationsList.length === 0"
            class="text-center py-4"
          >
            <i
              class="fas fa-check-circle text-success"
              style="font-size: 3rem"
            ></i>
            <h5 class="mt-3 text-muted">
              {{ $t("committee.no_delayed_recommendations_found") }}
            </h5>
          </div>
          <div v-else>
            <!-- Entries per page selector -->
            <div class="figma-modal-controls">
              <label class="figma-show-label">{{ $t('committee.show') }}</label>
              <select v-model="itemsPerPage" class="figma-entries-select">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>

            <!-- Custom Table -->
            <div class="figma-table-wrapper">
              <table class="figma-table">
                <thead>
                  <tr>
                    <th>{{ $t('committee.title') }}</th>
                    <th>{{ $t('committee.assignee') }}</th>
                    <th>{{ $t('committee.due_date') }}</th>
                    <th>{{ $t('committee.days_overdue') }}</th>
                    <th>{{ $t('committee.notification') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedItems" :key="index">
                    <td>{{ item.title || $t("common.na") }}</td>
                    <td>{{ item.assignee || $t("committee.unassigned") }}</td>
                    <td>{{ formatDate(item.due_date) }}</td>
                        <td>{{ item.days_overdue }} {{ $t('committee.days') }}</td>
                    <td>
                      <button
                        class="figma-notify-btn"
                        @click="notifyAssigneeAboutDelayedRecommendation(item)"
                      >
                        <i class="fas fa-bell"></i>
                        {{ $t('committee.notify') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="figma-pagination">
              <button
                class="figma-page-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                class="figma-page-btn"
                :class="{ active: page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                class="figma-page-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref } from "vue";
import Committee from "@/API/Committee/Committee";
import User from "@/API/User/User";
import notification from "@/API/notification/notification";
export default {
  name: "Details",

  setup() {
    const committeeApi = new Committee();
    const notificationApi = new notification();
    const userApi = new User();
    return {
      committeeApi,
      userApi,
      notificationApi,
    };
  },

  props: {
    committeeData: ref(Object),
    authUser: ref(Object),
  },

  data() {
    return {
      showModalDescriptionOfCategory: false,
      fullDescription: "",
      showModalListDialog: false,
      modalListType: "",
      modalListTitle: "",
      currentCommittee: {},
      delayedRecommendationsList: [],
      recommendationHeaders: [
        { title: this.$t("committee.title"), key: "title", sortable: true },
        {
          title: this.$t("committee.assignee"),
          key: "assignee",
          sortable: true,
        },
        {
          title: this.$t("committee.due_date"),
          key: "due_date",
          sortable: true,
        },
        {
          title: this.$t("committee.days_overdue"),
          key: "days_overdue",
          sortable: true,
        },
        { title: this.$t("common.actions"), key: "actions", sortable: false },
      ],
      users: [],
      itemsPerPage: 10,
      currentPage: 1,
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(
        this.delayedRecommendationsList.length / this.itemsPerPage
      );
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.delayedRecommendationsList.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 3;
      let startPage = Math.max(1, this.currentPage - 1);
      let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    },
  },

  async beforeMount() {
    await this.getCommitteeData(this.$route.params.id);
    this.users = await this.userApi.getAll({ select: "id|full_name" });
  },

  methods: {
    getDelayedRecommendationsPrecision() {
      const today = new Date();
      let completedRecommendations = 0;
      let delayedRecommendations = 0;
      this.currentCommittee?.agendas?.forEach((agenda) => {
        agenda?.topics?.forEach((topic) => {
          topic?.recommendations?.forEach((recommendation) => {
            if (recommendation?.status === "completed") {
              completedRecommendations++;
            }
            const dueDate = new Date(recommendation.due_date);
            if (dueDate < today && recommendation?.status !== "completed") {
              delayedRecommendations++;
            }
          });
        });
      });

      if (completedRecommendations === 0) return 0;

      if (delayedRecommendations === 0) return 100;

      const precision =
        (completedRecommendations / delayedRecommendations) * 100;
      return precision.toFixed(2);
    },
    getNumberOfDelayedRecommendations() {
      const today = new Date();
      let delayedRecommendations = 0;
      this.currentCommittee?.agendas?.forEach((agenda) => {
        agenda?.topics?.forEach((topic) => {
          topic?.recommendations?.forEach((recommendation) => {
            const dueDate = new Date(recommendation.due_date);
            if (dueDate < today && recommendation?.status !== "completed") {
              delayedRecommendations++;
            }
          });
        });
      });
      return delayedRecommendations;
    },

    getDelayedRecommendationsData() {
      const today = new Date();
      const delayedRecommendations = [];

      this.currentCommittee?.agendas?.forEach((agenda) => {
        agenda?.topics?.forEach((topic) => {
          topic?.recommendations?.forEach((recommendation) => {
            const dueDate = new Date(recommendation.due_date);
            if (dueDate < today && recommendation?.status !== "completed") {
              const daysOverdue = Math.floor(
                (today - dueDate) / (1000 * 60 * 60 * 24)
              );
              delayedRecommendations.push({
                title: recommendation.title,
                assignee: this.users.find(
                  (user) => user.id === recommendation.assignee_id
                )?.full_name,
                due_date: recommendation.due_date,
                days_overdue: daysOverdue,
                agenda_title: agenda.title,
                topic_title: topic.title,
                assignee_id: recommendation.assignee_id,
                id: recommendation.id,
              });
            }
          });
        });
      });

      return delayedRecommendations.sort(
        (a, b) => b.days_overdue - a.days_overdue
      );
    },

    showDelayedRecommendationsModal() {
      this.delayedRecommendationsList = this.getDelayedRecommendationsData();
      this.currentPage = 1;
      this.showModalListDialog = true;
    },

    closeDelayedRecommendationsModal() {
      this.showModalListDialog = false;
    },

    getNumberOfCompletedMeetings() {
      const completedMeetings = this.currentCommittee?.meetings?.filter(
        (meeting) => {
          return meeting.status === "completed";
        }
      );
      return completedMeetings?.length || 0;
    },

    async getCommitteeData(meetingId) {
      try {
        this.currentCommittee = await this.committeeApi.show(meetingId, {
          with: [
            "meetings",
            "agendas",
            "agendas.topics",
            "agendas.topics.recommendations",
          ],
        });
      } catch (e) {
        console.log(e);
      }
    },

    formatDate(date) {
      if (!date) return "N/A";
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    truncateText(text) {
      if (!text) {
        return "";
      }
      if (text.length >= 30) {
        return text.substring(0, 30) + "...";
      }
      return text;
    },

    openModalDescriptionOfCategory(description) {
      this.fullDescription = description;
      this.showModalDescriptionOfCategory = true;
    },

    closeModalDescriptionOfCategory() {
      this.showModalDescriptionOfCategory = false;
      this.fullDescription = "";
    },

    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    saveChanges() {
      console.log("Saving changes...");
    },

    async notifyAssigneeAboutDelayedRecommendation(item) {
      const payload = {
        message: `The recommendation titled "${item.title}" is overdue by ${item.days_overdue} days. Please take the necessary action.`,
        channel: "both",
        class: "TopicRecommendation",
        action: "notify",
        type: "direct",
        subject: "Topic Recommendation Delayed Notification",
        userIds: [item.assignee_id],
        // description: "This is a test notification",
      };

      await this.notificationApi.sendNotification(payload);
    },
  },
};
</script>

<style scoped>
.figma-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* Two Column Layout */
.figma-two-column {
  display: grid;
  grid-template-columns: 1.75fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

/* Left Card - Committee Details */
.figma-card-left {
  background: #f5f5f5;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

/* Right Card - Meeting Info */
.figma-card-right {
  background: #f5f5f5;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.figma-section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px 0;
}

/* Field Rows */
.figma-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.figma-row.figma-single {
  grid-template-columns: 1fr;
}

.figma-item {
  display: flex;
  flex-direction: column;
}

.figma-row-container {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 16px;
}

.figma-label {
  font-size: 14px;
  color: #8c8c8c !important;
  margin-bottom: 6px;
  font-weight: 400;
}

.figma-text {
  font-size: 14px;
  color: #404040;
  line-height: 1.5;
}

.figma-clickable {
  cursor: pointer;
  /* text-decoration: underline dotted;
   */
  color: #6E3894;
  font-weight: 500;
  font-size: 16px;
}

.figma-clickable:hover {
  color: #6b46c1;
}

/* Green Badge (Permanent) */
.figma-badge-green {
  display: inline-block;
  padding: 5px 12px;
  background: #b6caae;
  color: #255f0b;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  width: fit-content;
}

.figma-badge-red {
  display: inline-block;
  padding: 5px 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  width: fit-content;
}

/* Date Input Group */
.figma-input-group {
  position: relative;
}

.figma-date-input {
  width: 100%;
  padding: 9px 36px 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #6b7280;
  background: #f9fafb;
  font-family: inherit;
}

.figma-date-input:focus {
  outline: none;
  border-color: #6b46c1;
}

.figma-calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none;
}

/* File Link */
.figma-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b46c1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.figma-link:hover {
  color: #8b5cf6;
  text-decoration: underline;
}

.figma-link i {
  font-size: 13px;
}

/* Meeting Info Stats */
.figma-stats-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 12px;
}

.figma-stat-box {
  text-align: center;
}

.figma-stat-label {
  display: block;
  font-size: 12px;
  color: #8c8c8c !important;
  margin-bottom: 8px;
  font-weight: 400;
}

.figma-stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #374151;
  line-height: 1;
}

.figma-stat-clickable {
  cursor: pointer;
}

.figma-stat-clickable:hover {
  opacity: 0.8;
}

.figma-red {
  color: #dc2626;
}

.figma-green {
  color: #16a34a;
}

/* Bottom Buttons */
.figma-button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.figma-btn-cancel {
  padding: 10px 28px;
  background: #ffffff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.figma-btn-cancel:hover {
  background: #f9fafb;
}

.figma-btn-save {
  padding: 10px 28px;
  background: linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(107, 70, 193, 0.25);
  font-family: inherit;
}

.figma-btn-save:hover {
  box-shadow: 0 4px 10px rgba(107, 70, 193, 0.35);
  transform: translateY(-1px);
}

/* ============================================ */
/* MODAL STYLES - MATCHING FIGMA DESIGN */
/* ============================================ */

.figma-modal {
  border-radius: 12px;
  overflow: hidden;
}

.figma-modal-header {
  background-color: #ffffff !important;
  padding: 20px 24px !important;
  border-bottom: 1px solid #e5e7eb;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.figma-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.figma-modal-close {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
  line-height: 1;
}

.figma-modal-close:hover {
  color: #111827;
}

.figma-modal-body {
  padding: 24px !important;
}

.figma-modal-controls {
  display: flex;
  align-items: center; /* vertical alignment */
  gap: 8px;
  margin-bottom: 16px;
  justify-content: flex-end; /* ensures items are aligned to the left */
}

.figma-show-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 400;
}

.figma-entries-select {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 12px;
  color: #374151;
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
  appearance: none;
  cursor: pointer;
  font-family: inherit;
}

.figma-entries-select:focus {
  outline: none;
  border-color: #6b46c1;
}

/* Custom Table */
.figma-table-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.figma-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background-color: #ffffff;
}

.figma-table thead {
  background-color: #f9fafb;
}

.figma-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  white-space: nowrap;
}

.figma-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.15s;
}

.figma-table tbody tr:last-child {
  border-bottom: none;
}

.figma-table tbody tr:hover {
  background-color: #f9fafb;
}

.figma-table td {
  padding: 14px 16px;
  color: #374151;
  vertical-align: middle;
}

.figma-notify-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background-color: #fef3c7;
  color: #92400e;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: inherit;
}

.figma-notify-btn:hover {
  background-color: #fde68a;
}

.figma-notify-btn i {
  font-size: 12px;
}

/* Pagination */
.figma-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.figma-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.figma-page-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.figma-page-btn.active {
  background-color: #6b46c1;
  border-color: #6b46c1;
  color: #ffffff;
}

.figma-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.figma-page-btn i {
  font-size: 12px;
}

/* Responsive */
@media (max-width: 1024px) {
  .figma-two-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .figma-row {
    grid-template-columns: 1fr;
  }

  .figma-stat-number {
    font-size: 24px;
  }

  .figma-button-row {
    flex-direction: column-reverse;
  }

  .figma-btn-cancel,
  .figma-btn-save {
    width: 100%;
  }

  .figma-table-wrapper {
    overflow-x: scroll;
  }

  .figma-pagination {
    gap: 2px;
  }

  .figma-page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 13px;
  }
}
</style>
