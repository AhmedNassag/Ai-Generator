<template>
  <div class="initiative-details">
    <!-- Back Button -->
    <!-- Back Button -->
    <div class="back-button-container">
      <button @click="goBack" class="btn-primary back-button">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" /></svg
        >{{ $t("initiative.goback") }}
      </button>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">{{ $t("initiative.Loading") }}...</p>
    </div>

    <!-- Main Content - Only show when not loading -->
    <div v-else>
      <!-- Header Section -->
      <div class="initiative-main-header">
        <div class="header-content">
          <h1 class="initiative-title">
            {{ initiative.name || "Untitled Initiative" }}
          </h1>
          <div class="header-actions">
            <div class="status-container">
              <div
                class="status-badge"
                :class="getStatusClass(initiative.status)"
              >
                {{ initiative.status || "Unknown" }}
              </div>
              <div class="status-controls">
                <button
                  @click="toggleStatusDropdown"
                  class="change-status-btn"
                  :class="{ active: showStatusDropdown }"
                  :disabled="!isOwner()"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  {{ $t("initiative.changestatus") }}
                </button>
                <div v-if="showStatusDropdown" class="status-dropdown">
                  <div class="dropdown-header">{{ $t("initiative.Update Status") }}</div>
                  <button
                    v-for="status in availableStatuses"
                    :key="status"
                    @click="changeStatus(status)"
                    class="status-option"
                    :class="{ current: status === initiative.status }"
                  >
                    <div
                      class="status-option-badge"
                      :class="getStatusClass(status)"
                    >
                      {{ status }}
                    </div>
                    <svg
                      v-if="status === initiative.status"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="initiative.riskLevel" class="risk-level">
              <div
                class="risk-badge"
                :class="getRiskClass(initiative.riskLevel)"
              >
                {{ initiative.riskLevel }} Risk
              </div>
            </div>
          </div>
        </div>
        <!-- <div v-if="initiative.ownerType" class="owner-type">
          <span class="owner-label">Owner Type:</span>
          <span class="owner-value">{{ initiative.ownerType }}</span>
        </div> -->
      </div>

      <!-- Main Content -->
      <div class="initiative-content">
        <!-- Description Section -->
        <div v-if="initiative.description" class="content-section">
          <h3 class="section-title">{{ $t("initiative.Description") }}</h3>
          <p class="description-text" v-html="initiative.description"></p>
        </div>

        <!-- Timeline Section -->
        <div
          v-if="initiative.startDate || initiative.endDate"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.timeline") }}</h3>
          <div class="timeline-info">
            <div v-if="initiative.startDate" class="timeline-item">
              <span class="timeline-label">{{ $t("initiative.startdate") }}</span>
              <span class="timeline-value">{{
                formatDate(initiative.startDate)
              }}</span>
            </div>
            <div v-if="initiative.endDate" class="timeline-item">
              <span class="timeline-label">{{ $t("initiative.enddate") }}:</span>
              <span class="timeline-value">{{
                formatDate(initiative.endDate)
              }}</span>
            </div>
            <div
              v-if="initiative.startDate && initiative.endDate"
              class="timeline-item"
            >
              <span class="timeline-label">{{ $t("initiative.duration") }}:</span>
              <span class="timeline-value">{{ calculateDuration() }}</span>
            </div>
          </div>
        </div>

        <!-- Expected Outcome Section -->
        <div v-if="initiative.expectedOutcome" class="content-section">
          <h3 class="section-title">{{ $t("initiative.expectedoutcome") }}</h3>
          <div class="outcome-card">
            <p v-html="initiative.expectedOutcome"></p>
          </div>
        </div>

        <!-- Mitigation Plan Section -->
        <div v-if="initiative.mitigationPlan" class="content-section">
          <h3 class="section-title">{{ $t("initiative.riskmitigationplan") }}</h3>
          <div class="mitigation-card">
            <p v-html="initiative.mitigationPlan"></p>
          </div>
        </div>

        <!-- Strategic Plan Section -->
        <div
          v-if="
            initiative.strategic_plan &&
            (initiative.strategic_plan.name ||
              initiative.strategic_plan.description)
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.strategicplan") }}</h3>
          <div class="strategic-plan-card">
            <h4 v-if="initiative.strategic_plan?.name">
              {{ initiative.strategic_plan?.name }}
            </h4>
            <p
              v-if="initiative.strategic_plan?.description"
              v-html="initiative.strategic_plan?.description"
            ></p>
          </div>
        </div>

        <!-- Owner Users Section -->
        <div
          v-if="
            initiative.owner_user_ids &&
            initiative.owner_user_ids.length > 0 &&
            initiative.owner_user_ids[0] !== null
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.ownerusers") }}</h3>
          <div class="users-grid">
            <div
              v-for="userId in initiative.owner_user_ids"
              :key="userId"
              class="user-card owner-card"
            >
              <div class="user-avatar">
                {{ getInitialsFromUserId(userId) }}
              </div>
              <div class="user-info">
                <h4 class="user-name">{{ getNameOfUser(userId) }}</h4>
                <p class="user-role">{{ $t("initiative.owner") }}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="
            initiative.owner_team_ids && initiative.owner_team_ids.length > 0
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.ownerteams") }}</h3>
          <div class="users-grid">
            <div
              v-for="teamId in initiative.owner_team_ids"
              :key="teamId"
              class="user-card owner-card"
            >
              <div class="user-avatar">
                {{ getInitialsFromTeamId(teamId) }}
              </div>
              <div class="user-info">
                <h4 class="user-name">{{ getNameOfTeam(teamId) }}</h4>
                <p class="user-role">{{ $t("initiative.owner") }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stakeholders Section -->
        <div
          v-if="
            initiative.stakeholder_ids && initiative.stakeholder_ids.length > 0
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.stakeholders") }}</h3>
          <div class="users-grid">
            <div
              v-for="stakeholderId in initiative.stakeholder_ids"
              :key="stakeholderId"
              class="user-card stakeholder-card"
            >
              <div class="user-avatar">
                {{ getInitialsFromUserId(stakeholderId) }}
              </div>
              <div class="user-info">
                <h4 class="user-name">{{ getNameOfUser(stakeholderId) }}</h4>
                <p class="user-role">{{ $t("initiative.stakeholder") }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Objectives Section -->
        <div
          v-if="initiative.objectives && initiative.objectives.length > 0"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.objectives") }}</h3>
          <div class="objectives-grid">
            <div
              v-for="objective in initiative.objectives"
              :key="objective.id"
              class="objective-card"
            >
              <div class="objective-header">
                <h4 class="objective-name">{{ objective.name }}</h4>
                <div
                  class="objective-status"
                  :class="getStatusClass(objective.status)"
                >
                  {{ objective.status }}
                </div>
              </div>
              <p
                v-if="objective.description"
                class="objective-description"
                v-html="truncateText(objective.description, 100)"
              ></p>
            </div>
          </div>
        </div>

        <!-- initiatives Section -->
        <div
          v-if="initiative.initiatives && initiative.initiatives.length > 0"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.initiatives") }}</h3>
          <div class="initiatives-grid">
            <div
              v-for="initiative in initiative.initiatives"
              :key="initiative.id"
              class="initiative-card"
            >
              <div class="initiative-header">
                <h4 class="initiative-name">
                  <RouterLink
                    :to="{
                      name: 'InitiativeDetails',
                      params: { id: initiative.id },
                    }"
                  >
                    {{ initiative.name }}
                  </RouterLink>
                </h4>
                <div
                  class="initiative-status"
                  :class="getStatusClass(initiative.status)"
                >
                  {{ initiative.status }}
                </div>
              </div>
              <p v-if="initiative.description" class="initiative-description">
                <span v-html="truncateText(initiative.description, 100)"></span>
              </p>
            </div>
          </div>
        </div>

        <!-- Projects Section -->
        <div
          v-if="initiative.projects && initiative.projects.length > 0"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("initiative.projects") }}</h3>
          <div class="projects-grid">
            <div
              v-for="project in initiative.projects"
              :key="project.id"
              class="project-card"
            >
              <div class="project-header">
                <h4 class="project-name">{{ project.name }}</h4>
                <div
                  class="project-status"
                  :class="getStatusClass(project.status)"
                >
                  {{ project.status }}
                </div>
              </div>
              <p v-if="project.description" class="initiative-description">
                <span v-html="truncateText(project.description, 100)"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Initiative from "@/API/Initiative/Initiative";
import { RouterLink } from "vue-router";
import Auth from "@/API/Auth";
export default {
  name: "InitiativeDetails",

  props: {
    initiativeDetails: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    users: {
      type: Array,
      default: () => [],
    },
    teams: {
      type: Array,
      default: () => [],
    },
  },

  setup() {
    const initiativeApi = new Initiative();
    return {
      initiativeApi,
    };
  },
  data() {
    return {
      showStatusDropdown: false,
      loading: true,
      availableStatuses: [
        "Pending",
        "In Progress",
        "Completed",
        "On Hold",
        "Cancelled",
      ],
      initiative: {},
    };
  },

  methods: {
    isOwner() {
      let currentUserIsOwner = false;
      if (this.initiativeDetails.ownerType === "user") {
        currentUserIsOwner =
          this.initiativeDetails?.owner_user_ids?.includes(Auth?.USER?.id);
        return currentUserIsOwner;
      } else if (this.initiativeDetails.ownerType === "team") {
        const initiativeTeamIds = this.initiativeDetails?.owner_team_ids || [];
        currentUserIsOwner = Auth?.USER?.team_ids?.some((teamId) =>
          initiativeTeamIds.includes(teamId)
        );
        return currentUserIsOwner;
      }

      return currentUserIsOwner;
    },
    async changeStatus(newStatus) {
      this.initiative.status = newStatus;
      this.showStatusDropdown = false;
      // Emit event to parent component
      this.$emit("status-changed", {
        initiativeId: this.initiative.id,
        newStatus: newStatus,
      });

      const data = {
        status: newStatus,
      };
      const response = await this.initiativeApi.changeStatus(
        this.initiative.id,
        data
      );
    },
    formatDate(dateString) {
      if (!dateString) return "Not specified";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (error) {
        return "Invalid date";
      }
    },

    calculateDuration() {
      if (!this.initiative.startDate || !this.initiative.endDate)
        return "Not specified";

      try {
        const start = new Date(this.initiative.startDate);
        const end = new Date(this.initiative.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;

        if (months > 0) {
          return days > 0
            ? `${months} months, ${days} days`
            : `${months} months`;
        }
        return `${diffDays} days`;
      } catch (error) {
        return "Unable to calculate";
      }
    },

    getStatusClass(status) {
      const statusClasses = {
        "In Progress": "status-in-progress",
        Completed: "status-completed",
        Pending: "status-pending",
        "On Hold": "status-on-hold",
        Cancelled: "status-cancelled",
      };
      return statusClasses[status] || "status-default";
    },

    getRiskClass(riskLevel) {
      const riskClasses = {
        Low: "risk-low",
        Medium: "risk-medium",
        High: "risk-high",
        Critical: "risk-critical",
      };
      return riskClasses[riskLevel] || "risk-default";
    },

    getNameOfUser(userId) {
      if (!userId) return "Anonymous User";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";

      const user = this.users.find((u) => u.id === userId);
      return user?.full_name || user?.name || "Unknown User";
    },

    getNameOfTeam(teamId) {
      if (!teamId) return "Anonymous User";
      if (!this.teams || !Array.isArray(this.teams)) return "Unknown Team";

      const team = this.teams.find((u) => u.id === teamId);
      return team?.name || team?.name || "Unknown Team";
    },

    getInitialsFromUserId(userId) {
      if (!userId) return "AU";
      if (!this.users || !Array.isArray(this.users)) return "UU";

      const user = this.users.find((u) => u.id === userId);
      const name = user?.full_name || user?.name;

      if (!name) return userId.toString().substring(0, 2).toUpperCase();

      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    },

    getInitialsFromTeamId(teamId) {
      if (!teamId) return "AU";
      if (!this.teams || !Array.isArray(this.teams)) return "UU";

      const team = this.teams.find((u) => u.id === teamId);
      const name = team?.name || team?.name;

      if (!name) return teamId.toString().substring(0, 2).toUpperCase();

      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    },
    truncateText(text, maxLength) {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    },

    toggleStatusDropdown() {
      this.showStatusDropdown = !this.showStatusDropdown;
    },

    handleClickOutside(event) {
      const statusControls = this.$el.querySelector(".status-controls");
      if (statusControls && !statusControls.contains(event.target)) {
        this.showStatusDropdown = false;
      }
    },
    goBack() {
      this.$router.go(-1); // Goes back one step in history
    },
    // Method to simulate loading completion
    completeLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },
  },

  watch: {
    initiativeDetails: {
      immediate: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.initiative = { ...newVal };
          setTimeout(() => {
            this.loading = false;
          }, 500);
        } else {
          this.loading = true;
        }
      },
    },

    users: {
      immediate: true,
      handler(newVal) {
        console.log("Users updated:", newVal);
      },
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    console.log("Users prop:", this.users);
    console.log("Initiative Details prop:", this.initiativeDetails);

    if (
      this.initiativeDetails &&
      Object.keys(this.initiativeDetails).length > 0
    ) {
      this.initiative = { ...this.initiativeDetails };
      this.completeLoading();
    }
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
.initiative-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  background: #ffffff;
  min-height: 100vh;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 40vh;
  gap: 20px;
}

.loading-spinner {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #3b82f6 transparent transparent transparent;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}
.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}
.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* Header Styles */
.initiative-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}
.initiative-main-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #10b981;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-controls {
  position: relative;
}

.change-status-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.change-status-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.change-status-btn.active {
  background: #047857;
}

.change-status-btn svg {
  transition: transform 0.2s ease;
}

.change-status-btn.active svg {
  transform: rotate(45deg);
}

.status-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
  animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.status-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.875rem;
}

.status-option:hover {
  background: #f8fafc;
}

.status-option.current {
  background: #ecfdf5;
  color: #047857;
}

.status-option-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.initiative-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
  text-align: center;
  display: inline-block;
}

.status-in-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-on-hold {
  background: #fee2e2;
  color: #dc2626;
}

.status-cancelled {
  background: #f3f4f6;
  color: #374151;
}

.status-default {
  background: #e5e7eb;
  color: #374151;
}

.risk-level {
  margin-left: 10px;
}

.risk-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.risk-low {
  background: #dcfce7;
  color: #166534;
}
/* Back Button Styles */
.back-button-container {
  margin-bottom: 25px;
}
.risk-medium {
  background: #fef3c7;
  color: #92400e;
}

.risk-high {
  background: #fed7aa;
  color: #c2410c;
}

.risk-critical {
  background: #fee2e2;
  color: #dc2626;
}

.risk-default {
  background: #e5e7eb;
  color: #374151;
}

.owner-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.owner-label {
  font-weight: 600;
  color: #64748b;
}

.owner-value {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  color: #334155;
}

/* Content Styles */
.initiative-content {
  display: grid;
  gap: 30px;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
}

.description-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #475569;
  margin: 0;
}

/* Timeline Styles */
.timeline-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.timeline-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
}

.timeline-value {
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 500;
}

/* Outcome & Mitigation Card Styles */
.outcome-card,
.mitigation-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #10b981;
}

.mitigation-card {
  border-left-color: #f59e0b;
}

.outcome-card p,
.mitigation-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

/* Strategic Plan Styles */
.strategic-plan-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #6366f1;
}

.strategic-plan-card h4 {
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.strategic-plan-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

/* Users Grid Styles */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.owner-card {
  border-left: 4px solid #10b981;
}

.stakeholder-card {
  border-left: 4px solid #3b82f6;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.stakeholder-card .user-avatar {
  background: #3b82f6;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  word-wrap: break-word;
}

.user-role {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Related Items Grid Styles */
.objectives-grid,
.initiatives-grid,
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.objective-card,
.initiative-card,
.project-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.objective-card {
  border-left: 4px solid #3b82f6;
}

.initiative-card {
  border-left: 4px solid #8b5cf6;
}

.project-card {
  border-left: 4px solid #f59e0b;
}

.objective-card:hover,
.initiative-card:hover,
.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.objective-header,
.initiative-header,
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.objective-name,
.initiative-name,
.project-name {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

.objective-status,
.initiative-status,
.project-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 10px;
}

.objective-description,
.initiative-description,
.project-description {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .initiative-details {
    padding: 15px;
  }

  .initiative-header,
  .content-section {
    padding: 20px;
  }

  .initiative-title {
    font-size: 1.8rem;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .status-container {
    align-items: center;
  }

  .users-grid,
  .objectives-grid,
  .initiatives-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .timeline-info {
    grid-template-columns: 1fr;
  }

  .loading-container {
    height: 50vh;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
  }

  .spinner-ring {
    width: 48px;
    height: 48px;
    border-width: 6px;
  }
}

/* Animation for content appearance */
.initiative-content {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
