<template>
  <div class="program-details">
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
        >{{ $t("program.goback") }}
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
      <p class="loading-text">{{ $t("program.Loading") }}...</p>
    </div>

    <!-- Main Content - Only show when not loading -->
    <div v-else>
      <!-- Header Section -->
      <div class="program-header">
        <div class="header-content">
          <h1 class="program-title">
            {{ program.name || "Untitled Program" }}
          </h1>
          <div class="header-actions">
            <div class="status-container">
              <div class="status-badge" :class="getStatusClass(program.status)">
                {{ program.status || "Unknown" }}
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
                  {{ $t("program.changestatus") }}
                </button>
                <div v-if="showStatusDropdown" class="status-dropdown">
                  <div class="dropdown-header">{{ program.updatestatus }}</div>
                  <button
                    v-for="status in availableStatuses"
                    :key="status"
                    @click="changeStatus(status)"
                    class="status-option"
                    :class="{ current: status === program.status }"
                  >
                    <div
                      class="status-option-badge"
                      :class="getStatusClass(status)"
                    >
                      {{ status }}
                    </div>
                    <svg
                      v-if="status === program.status"
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
          </div>
        </div>
        <div v-if="program?.program_type?.name" class="program-type">
          <span class="type-label">{{ $t("program.type") }}:</span>
          <span class="type-value">{{ program?.program_type?.name }}</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="program-content">
        <!-- Description Section -->
        <div v-if="program.description" class="content-section">
          <h3 class="section-title">{{ $t("program.description") }}</h3>
          <p class="description-text" v-html="program.description"></p>
        </div>

        <!-- Timeline Section -->
        <div
          v-if="program.start_date || program.end_date"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("program.timeline") }}</h3>
          <div class="timeline-info">
            <div v-if="program.start_date" class="timeline-item">
              <span class="timeline-label">{{ $t("program.startdate") }}:</span>
              <span class="timeline-value">{{
                formatDate(program.start_date)
              }}</span>
            </div>
            <div v-if="program.end_date" class="timeline-item">
              <span class="timeline-label">{{ $t("program.enddate") }}:</span>
              <span class="timeline-value">{{
                formatDate(program.end_date)
              }}</span>
            </div>
            <div
              v-if="program.start_date && program.end_date"
              class="timeline-item"
            >
              <span class="timeline-label">{{ $t("program.duration") }}:</span>
              <span class="timeline-value">{{ calculateDuration() }}</span>
            </div>
          </div>
        </div>

        <!-- Budget Section -->
        <div v-if="program.budget" class="content-section">
          <h3 class="section-title">{{ $t("program.budget") }}</h3>
          <div class="budget-card">
            <div class="budget-amount">
              {{ formatCurrency(program.budget) }}
            </div>
            <div class="budget-label">
              {{ $t("program.total_program_budget") }}
            </div>
          </div>
        </div>

        <!-- Strategic Plan Section -->
        <div
          v-if="
            program.strategic_plan &&
            (program.strategic_plan.name || program.strategic_plan.description)
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("program.strategicplan") }}</h3>
          <div class="strategic-plan-card">
            <h4 v-if="program.strategic_plan?.name">
              {{ program.strategic_plan?.name }}
            </h4>
            <p
              v-if="program.strategic_plan?.description"
              v-html="program.strategic_plan?.description"
            ></p>
          </div>
        </div>

        <!-- Owners Section -->
        <div
          v-if="
            program.owner_users_ids &&
            program.owner_users_ids.length > 0 &&
            program.owner_users_ids[0] !== null
          "
          class="content-section"
        >
          <h3 class="section-title">
            {{ $t("program.Owners (Users)") }}
          </h3>
          <div class="owners-grid">
            <div
              v-for="owner in program.owner_users_ids"
              :key="owner"
              class="owner-card"
            >
              <div class="owner-avatar">
                {{ getInitials(getNameOfUser(owner)) }}
              </div>
              <div class="owner-info">
                <h4 class="owner-name">{{ getNameOfUser(owner) }}</h4>
                <p class="owner-role">{{ getEmailOfUser(owner) }}</p>
                <p class="owner-role">{{ getPhoneOfUser(owner) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="program.owner_team_ids && program.owner_team_ids.length > 0"
          class="content-section"
        >
          <h3 class="section-title">
            {{ $t("program.Owners (Teams)") }}
          </h3>
          <div class="owners-grid">
            <div
              v-for="owner in program.owner_team_ids"
              :key="owner"
              class="owner-card"
            >
              <div class="owner-avatar">
                {{ getInitials(getNameOfTeam(owner)) }}
              </div>
              <div class="owner-info">
                <h4 class="owner-name">{{ getNameOfTeam(owner) }}</h4>
                <p class="owner-role">{{ $t("program.Owner") }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stakeholders Section -->
        <div
          v-if="program.stakeholder_ids && program.stakeholder_ids.length > 0"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("program.stakeholders") }}</h3>
          <div class="stakeholders-grid">
            <div
              v-for="stakeholder in program.stakeholder_ids"
              :key="stakeholder"
              class="stakeholder-card"
            >
              <div class="owner-avatar">
                {{ getInitials(getNameOfUser(stakeholder)) }}
              </div>
              <div class="owner-info">
                <h4 class="owner-name">{{ getNameOfUser(stakeholder) }}</h4>
                <p class="owner-role">{{ getEmailOfUser(stakeholder) }}</p>
                <p class="owner-role">{{ getPhoneOfUser(stakeholder) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Initiative Section -->
        <div v-if="program?.initiative" class="content-section">
          <h3 class="section-title">{{ $t("program.related_initiative") }}</h3>
          <div class="objectives-grid">
            <div class="objective-card">
              <div class="objective-header">
                <h4 class="objective-name">
                  {{ program?.initiative?.name || "Untitled Objective" }}
                </h4>
                <div
                  class="objective-status"
                  :class="getStatusClass(program?.initiative?.status)"
                >
                  {{ program?.initiative?.status || "Unknown" }}
                </div>
              </div>
              <p
                v-if="program?.initiative?.description"
                class="objective-description"
              >
                <!-- {{ truncateText(program?.initiative?.description, 120) }} -->
                <span
                  v-html="truncateText(program?.initiative?.description, 120)"
                ></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Program from "@/API/Program/Program";
import App from "@/App.vue";
import Auth from "@/API/Auth";
export default {
  name: "ProgramDetails",

  props: {
    programDetails: {
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
    const programApi = new Program();
    return {
      programApi,
    };
  },
  data() {
    return {
      showStatusDropdown: false,
      loading: true,
      availableStatuses: [
        "Draft",
        "Under Review",
        "Approved",
        "In Progress",
        "On Hold",
        "Completed",
        "Cancelled",
      ],
      program: {},
    };
  },

  methods: {
    isOwner() {
      let currentUserIsOwner = false;

      if (this.program.owner_type === "user") {
        currentUserIsOwner = this.program.owner_users_ids.includes(
          Auth?.USER?.id
        );
      } else if (this.program.owner_type === "team") {
        const userTeamIds = Auth?.USER?.team_ids || [];
        const programTeamIds = this.program.owner_team_ids || [];
        // Check if any of the user's team IDs exist in the owner_team_ids
        currentUserIsOwner = userTeamIds.some((teamId) =>
          programTeamIds.includes(teamId)
        );
      }

      return currentUserIsOwner;
    },
    goBack() {
      this.$router.go(-1); // Goes back one step in history
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

    formatCurrency(amount) {
      if (!amount) return "Not specified";
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      } catch (error) {
        return `$${amount}`;
      }
    },

    calculateDuration() {
      if (!this.program.start_date || !this.program.end_date)
        return "Not specified";

      try {
        const start = new Date(this.program.start_date);
        const end = new Date(this.program.end_date);
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
        Approved: "status-approved",
        Completed: "status-completed",
        Draft: "status-draft",
        "On Hold": "status-on-hold",
        Cancelled: "status-cancelled",
        "In Progress": "status-in-progress",
        "Under Review": "status-under-review",
      };
      return statusClasses[status] || "status-default";
    },
    getInitials(name) {
      if (!name) return "AU";

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

    async changeStatus(newStatus) {
      this.program.status = newStatus;
      this.showStatusDropdown = false;
      // Emit event to parent component
      this.$emit("status-changed", {
        programId: this.program.id,
        newStatus: newStatus,
      });

      const data = {
        status: newStatus,
      };
      const response = await this.programApi.changeStatus(
        this.program.id,
        data
      );
    },

    handleClickOutside(event) {
      const statusControls = this.$el.querySelector(".status-controls");
      if (statusControls && !statusControls.contains(event.target)) {
        this.showStatusDropdown = false;
      }
    },

    // Method to simulate loading completion
    completeLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },

    getNameOfUser(userId) {
      if (!userId) return "";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";

      const user = this.users.find((u) => u.id === userId);
      return user?.full_name || "Unknown User";
    },

    getEmailOfUser(userId) {
      if (!userId) return "";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";

      const user = this.users.find((u) => u.id === userId);
      return user?.email || "Unknown User";
    },

    getPhoneOfUser(userId) {
      if (!userId) return "";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";

      const user = this.users.find((u) => u.id === userId);
      return user?.phone || "Unknown User";
    },

    getInitialsFromUserId(userId) {
      if (!userId) return "";
      if (!this.users || !Array.isArray(this.users)) return "User";

      const user = this.users.find((u) => u.id === userId);
      const name = user?.name;

      if (!name) return userId.toString().substring(0, 100).toUpperCase();

      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 100); // Limit to 2 characters
    },

    /**/
    getNameOfTeam(teamId) {
      if (!teamId) return "Anonymous Team";
      if (!this.teams || !Array.isArray(this.teams)) return "Unknown Team";

      const team = this.teams.find((t) => t.id === teamId);
      console.log("team", this.teams);
      return team?.name || "Unknown Team";
    },
    /**/
  },

  watch: {
    programDetails: {
      immediate: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.program = { ...newVal };
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
    // console.log("Users prop:", this.users);
    console.log("Program Details prop:", this.programDetails);

    if (this.programDetails && Object.keys(this.programDetails).length > 0) {
      this.program = { ...this.programDetails };
      this.completeLoading();
    }
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
.program-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  background: #ffffff;
  min-height: 100vh;
}

/** Owners styles */
.owners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.owner-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.owner-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.owner-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.owner-info {
  flex: 1;
  min-width: 0;
}

.owner-name {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  word-wrap: break-word;
}

.owner-role {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
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
  border: 8px solid #10b981;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #10b981 transparent transparent transparent;
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
.program-header {
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

.program-title {
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

.status-approved {
  background: #dcfce7;
  color: #166534;
}

.status-completed {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-draft {
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

.status-in-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-under-review {
  background: #fef3c7;
  color: #92400e;
}

.status-default {
  background: #e5e7eb;
  color: #374151;
}

.program-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-label {
  font-weight: 600;
  color: #64748b;
}

.type-value {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  color: #334155;
}

/* Content Styles */
.program-content {
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

/* Budget Styles */
.budget-card {
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  color: white;
}

.budget-amount {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.budget-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Strategic Plan Styles */
.strategic-plan-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #10b981;
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

/* Domains Styles */
.domains-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.domain-tag {
  background: #10b981;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Manager Styles */
.manager-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #ecfdf5;
  border-radius: 12px;
  padding: 25px;
}

.manager-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.manager-info {
  flex: 1;
}

.manager-name {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 600;
}

.manager-role {
  margin: 0;
  color: #059669;
  font-size: 1rem;
  font-weight: 500;
}

/* Stakeholders Styles */
.stakeholders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stakeholder-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stakeholder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stakeholder-avatar {
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

.stakeholder-info {
  flex: 1;
  min-width: 0;
}

.stakeholder-name {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  word-wrap: break-word;
}

.stakeholder-role {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Objectives Styles */
.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.objective-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.objective-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.objective-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 15px;
}

.objective-name {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

.objective-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.objective-description {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
  font-size: 0.95rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .program-details {
    padding: 15px;
  }

  .program-header,
  .content-section {
    padding: 20px;
  }

  .program-title {
    font-size: 1.8rem;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .status-container {
    align-items: center;
  }

  .stakeholders-grid,
  .objectives-grid {
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

  .budget-amount {
    font-size: 2rem;
  }

  .manager-card {
    flex-direction: column;
    text-align: center;
  }
}

/* Animation for content appearance */
.program-content {
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
