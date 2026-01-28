<template>
  <div class="objective-details">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">{{ $t("objective.Loading") }}...</p>
    </div>

    <!-- Main Content - Only show when not loading -->
    <div v-else>
      <!-- Header Section -->
      <div class="objective-header">
        <div class="header-content">
          <div class="header-left">
            <v-btn
              @click="goBack(objective?.strategicPlan_id)"
              icon
              class="back-btn mr-3"
              size="small"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="objective-title">
              {{ objective.name || "Untitled Objective" }}
            </h1>
          </div>
          <div class="header-actions">
            <div class="status-container">
              <div
                class="status-badge"
                :class="getStatusClass(objective.status)"
              >
                {{ objective.status || "Unknown" }}
              </div>
              <div class="status-controls">
                <button
                  @click="toggleStatusDropdown"
                  class="change-status-btn"
                  :class="{ active: showStatusDropdown }"
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
                  {{ $t("objective.changestatus") }}
                </button>
                <div v-if="showStatusDropdown" class="status-dropdown">
                  <div class="dropdown-header">{{ $t("objective.updatestatus") }}</div>
                  <button
                    v-for="status in availableStatuses"
                    :key="status"
                    @click="changeStatus(status)"
                    class="status-option"
                    :class="{ current: status === objective.status }"
                  >
                    <div
                      class="status-option-badge"
                      :class="getStatusClass(status)"
                    >
                      {{ status }}
                    </div>
                    <svg
                      v-if="status === objective.status"
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
        <div v-if="objective?.objective_type?.name" class="objective-type">
          <span class="type-label">Type:</span>
          <span class="type-value">{{ objective?.objective_type?.name }}</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="objective-content">
        <!-- Description Section -->
        <div v-if="objective.description" class="content-section">
          <h3 class="section-title">{{ $t("objective.description") }}</h3>
          <p class="description-text" v-html="objective.description"></p>
        </div>

        <!-- Timeline Section -->
        <div
          v-if="objective.start_date || objective.end_date"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("objective.timeline") }}</h3>
          <div class="timeline-info">
            <div v-if="objective.start_date" class="timeline-item">
              <span class="timeline-label">{{ $t("objective.startdate") }}:</span>
              <span class="timeline-value">{{
                formatDate(objective.start_date)
              }}</span>
            </div>
            <div v-if="objective.end_date" class="timeline-item">
              <span class="timeline-label">{{ $t("objective.End Date") }}:</span>
              <span class="timeline-value">{{
                formatDate(objective.end_date)
              }}</span>
            </div>
            <div
              v-if="objective.start_date && objective.end_date"
              class="timeline-item"
            >
              <span class="timeline-label">{{ $t("objective.duration") }}:</span>
              <span class="timeline-value">{{ calculateDuration() }}</span>
            </div>
          </div>
        </div>

        <!-- Strategic Plan Section -->
        <div
          v-if="
            objective.strategic_plan &&
            (objective.strategic_plan.name ||
              objective.strategic_plan.description)
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("objective.Strategic Plan") }}</h3>
          <div class="strategic-plan-card">
            <h4 v-if="objective.strategic_plan?.name">
              {{ objective.strategic_plan?.name }}
            </h4>
            <p
              v-if="objective.strategic_plan?.description"
              v-html="objective.strategic_plan?.description"
            ></p>
          </div>
        </div>

        <!-- Related Domains Section -->
        <div
          v-if="
            objective.domains && objective.domains.length > 0
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("objective.relateddomains") }}</h3>
          <div class="domains-list">
            <span
              v-for="domain in objective.domains"
              :key="domain"
              class="domain-tag"
            >
              {{ domain.name }}
            </span>
          </div>
        </div>

        <!-- Requirements Section -->
        <div
          v-if="
            objective.linked_requirements && objective.linked_requirements.length > 0
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("objective.relatedrequirements") }}</h3>
          <div class="requirements-list">
            <span
              v-for="requirement in objective.linked_requirements"
              :key="requirement"
              class="requirement-tag"
            >
              {{
                getNameOfRequirement(requirement)
              }}
            </span>
          </div>
        </div>
        <!-- Stakeholders Section -->
        <div
          v-if="objective.stakeholders && objective.stakeholders.length > 0"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("objective.stakeholders") }}</h3>
          <div class="stakeholders-grid">
            <div
              v-for="stakeholder in objective.stakeholders"
              :key="stakeholder"
              class="stakeholder-card"
            >
              <div class="stakeholder-avatar">
                {{ getInitialsFromUserId(getNameOfUser(stakeholder)) }}
              </div>
              <div class="stakeholder-info">
                <h4 class="stakeholder-name">
                  {{ getNameOfUser(stakeholder) }}
                </h4>
                <p class="stakeholder-role">{{ $t("objective.stakeholder") }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Objective from "@/API/Objective/Objective";
import Requirement from "@/API/Requirement/Requirement";
export default {
  name: "ObjectiveDetails",

  props: {
    objectiveDetails: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    users: {
      type: Array,
      default: () => [],
    },
  },

  setup() {
    const objectiveApi = new Objective();
    const requirementApi = new Requirement();
    return {
      objectiveApi,
      requirementApi
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
      objective: {},
      requirements: [],
      requirementsLoaded: false,
    };
  },

  methods: {
    async loadRequirements() {
      try {
        const response = await this.requirementApi.getAll({ select: "id|name" });
        this.requirements = response.data || response || [];
        this.requirementsLoaded = true;
        // console.log("Requirements loaded:", this.requirements);
      } catch (error) {
        console.error("Error loading requirements:", error);
        this.requirements = [];
        this.requirementsLoaded = true; // Set to true even on error to prevent infinite loading
      }
    },

    async initializeData() {
      // Don't initialize if objectiveDetails is empty
      if (!this.objectiveDetails || Object.keys(this.objectiveDetails).length === 0) {
        return;
      }

      // Load requirements first
      if (!this.requirementsLoaded) {
        await this.loadRequirements();
      }
      
      // Set objective data
      this.objective = { ...this.objectiveDetails };
      
      // Add a small delay to ensure smooth loading experience
      setTimeout(() => {
        this.loading = false;
      }, 300);
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
      if (!this.objective.start_date || !this.objective.end_date)
        return "Not specified";

      try {
        const start = new Date(this.objective.start_date);
        const end = new Date(this.objective.end_date);
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

    getNameOfUser(userId) {
      if (!userId) return "Anonymous User";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";

      const user = this.users.find((u) => u.id === userId);
      return user?.full_name || "Unknown User";
    },

    getInitialsFromUserId(userId) {
      if (!userId) return "AU";
      if (!this.users || !Array.isArray(this.users)) return "UU";

      const user = this.users.find((u) => u.id === userId);
      const name = user?.name;

      if (!name) return userId.toString().substring(0, 2).toUpperCase();

      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2); // Limit to 2 characters
    },

    toggleStatusDropdown() {
      this.showStatusDropdown = !this.showStatusDropdown;
    },

    async changeStatus(newStatus) {
      this.objective.status = newStatus;
      this.showStatusDropdown = false;
      // Emit event to parent component
      this.$emit("status-changed", {
        objectiveId: this.objective.id,
        newStatus: newStatus,
      });

      const data = {
        status: newStatus,
      };
      const response = await this.objectiveApi.changeStatus(
        this.objective.id,
        data
      );
    },

    handleClickOutside(event) {
      const statusControls = this.$el.querySelector(".status-controls");
      if (statusControls && !statusControls.contains(event.target)) {
        this.showStatusDropdown = false;
      }
    },

    goBack() {
      // Option 2: Navigate to specific route (uncomment if preferred)
      this.$router.push({
        name: "StrategicPlanDetails",
        query: { tab: "ObjectiveInitiativeMatrix" },
        params: { id: this.objectiveDetails?.strategicPlan_id },
      });

      // Option 3: Navigate to parent route (uncomment if preferred)
      // this.$router.push('/objectives');
    },

    getNameOfRequirement(requirementId) {
      if (!requirementId) return "Anonymous Requirement";
      if (!this.requirements || !Array.isArray(this.requirements))
        return "Unknown Requirement";

      const requirement = this.requirements.find((r) => r.id === requirementId);
      return requirement?.name || "Unknown Requirement";
    },

  },

  watch: {
    objectiveDetails: {
      immediate: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.initializeData();
        }
      },
    },

    // users: {
    //   immediate: true,
    //   handler(newVal) {
    //     console.log("Users updated:", newVal);
    //   },
    // },
  },

  async mounted() {
    document.addEventListener("click", this.handleClickOutside);
    // console.log("Users prop:", this.users);
    // console.log("Objective Details prop:", this.objectiveDetails);

    // Only initialize if objectiveDetails is already available
    if (this.objectiveDetails && Object.keys(this.objectiveDetails).length > 0) {
      await this.initializeData();
    }
    // If not available, the watcher will handle it when the prop is updated
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
<style scoped>

/* Requirements Styles */
.requirements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.requirement-tag {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}
/* Page header styling */
.page-header {
  padding: 16px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px !important;
}

.back-btn {
  color: #666;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #666;
  margin-top: 2px;
}

.objective-details {
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
.objective-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #3b82f6;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 60%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: flex-end;
  width: 50%;
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
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.change-status-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.change-status-btn.active {
  background: #1d4ed8;
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
  background: #eff6ff;
  color: #1d4ed8;
}

.status-option-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.objective-title {
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

.objective-type {
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
.objective-content {
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
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
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
  background: #3b82f6;
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

/* Responsive Design */
@media (max-width: 768px) {
  .objective-details {
    padding: 15px;
  }

  .objective-header,
  .content-section {
    padding: 20px;
  }

  .objective-title {
    font-size: 1.8rem;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 500%;
  }

  .status-container {
    align-items: center;
  }

  .stakeholders-grid {
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
.objective-content {
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
