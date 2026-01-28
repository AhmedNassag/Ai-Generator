<template>
  <div class="task-details">
    <!-- Back Button -->
    <div class="back-button-container">
      <button @click="goBack" class="btn-primary back-button">
        <!-- <router-link :to="{ path: `/project-details/${milestone.project_id}` }" class="btn-primary back-button"> -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ $t("task.Go Back") }}
        <!-- </router-link> -->
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
      <p class="loading-text">{{ $t("task.Loading") }}...</p>
    </div>

    <!-- Main Content - Only show when not loading -->
    <div v-else>
      <!-- Header Section -->
      <div class="task-header">
        <div class="header-content">
          <h1 class="task-title">{{ task.name || "Untitled Task" }}</h1>
          <div class="header-actions">
            <div class="status-container">
              <div class="status-badge" :class="getStatusClass(task.status)">
                {{ task.status || "Unknown" }}
              </div>
              <div class="status-controls">
                <button
                  v-if="isCurrentUserAssignee() && task.status !== 'Completed'"
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
                  {{ $t("task.Change Status") }}
                </button>
                <div v-if="showStatusDropdown" class="status-dropdown">
                  <div class="dropdown-header">{{ $t("task.Update Status") }}</div>
                  <button
                    v-for="status in availableStatuses"
                    :key="status"
                    @click="changeStatus(status)"
                    class="status-option"
                    :class="{ current: status === task.status }"
                  >
                    <div
                      class="status-option-badge"
                      :class="getStatusClass(status)"
                    >
                      {{ status }}
                    </div>
                    <svg
                      v-if="status === task.status"
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
      </div>

      <!-- Main Content -->
      <div class="task-content">
        <!-- Description Section -->
        <div v-if="task.description" class="content-section">
          <h3 class="section-title">{{ $t("task.Description") }}</h3>
          <p class="description-text" v-html="task.description"></p>
        </div>
        
        <!-- *** start parent section *** -->
        <!-- Deliverable Section -->
        <div v-if="task.deliverable && (task.deliverable.name || task.deliverable.description)" class="content-section">
          <h3 class="section-title">Deliverable</h3>
          <div class="deliverable-card">
            <h4 v-if="task.deliverable?.name">{{ task.deliverable?.name }}</h4>
            <p v-if="task.deliverable?.description" v-html="task.deliverable?.description"></p>
          </div>
        </div>

        <!-- Timeline Section -->
        <div
          v-if="task.due_date || task.completed_date"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("task.Timeline") }}</h3>
          <div class="timeline-info">
            <div v-if="task.due_date" class="timeline-item">
              <span class="timeline-label">{{ $t("task.Due Date") }}:</span>
              <span
                class="timeline-value"
                :class="{ overdue: isOverdue(task.due_date) }"
              >
                {{ formatDate(task.due_date) }}
                <span v-if="isOverdue(task.due_date)" class="overdue-badge"
                  >{{ $t("task.Overdue") }}</span
                >
              </span>
            </div>
            <div v-if="task.completed_date" class="timeline-item">
              <span class="timeline-label">{{ $t("task.Completed Date") }}:</span>
              <span class="timeline-value">{{
                formatDate(task.completed_date)
              }}</span>
            </div>
            <div
              v-if="task.due_date && !task.completed_date"
              class="timeline-item"
            >
              <span class="timeline-label">{{ $t("task.Days Remaining") }}:</span>
              <span class="timeline-value" :class="getDaysRemainingClass()">
                {{ getDaysRemaining() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Assignment Section -->
        <div v-if="task.assignee || task.completed_by" class="content-section">
          <h3 class="section-title">{{ $t("task.Assignment") }}</h3>
          <div class="assignment-grid">
            <div v-if="task.assignee" class="assignment-card">
              <div class="assignment-avatar">
                {{ getInitials(getNameOfUser(task.assignee)) }}
              </div>
              <div class="assignment-info">
                <h4 class="assignment-name">{{ getNameOfUser(task.assignee) }}</h4>
                <p class="assignment-role">{{ getEmailOfUser(task.assignee) }}</p>
                <p class="assignment-role">{{ getPhoneOfUser(task.assignee) }}</p>
              </div>
            </div>

            <div
              v-if="task.completed_by && task.completed_by !== task.assignee"
              class="assignment-card"
            >
              <div class="assignment-avatar completed">
                {{ getInitials(getNameOfUser(task.completed_by)) }}
              </div>
              <div class="assignment-info">
                <h4 class="assignment-name">{{ getNameOfUser(task.completed_by) }}</h4>
                <p class="assignment-role">{{ getEmailOfUser(task.completed_by) }}</p>
                <p class="assignment-role">{{ getPhoneOfUser(task.completed_by) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Progress Section -->
        <!-- <div class="content-section">
          <h3 class="section-title">Task Progress</h3>
          <div class="progress-info">
            <div class="progress-item">
              <span class="progress-label">Current Status:</span>
              <span class="progress-value">
                <div class="status-badge" :class="getStatusClass(task.status)">
                  {{ task.status || "Unknown" }}
                </div>
              </span>
            </div>
            <div v-if="getProgressPercentage() !== null" class="progress-item">
              <span class="progress-label">Progress:</span>
              <div class="progress-bar-container">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: getProgressPercentage() + '%' }"
                    :class="getProgressBarClass()"
                  ></div>
                </div>
                <span class="progress-text"
                  >{{ getProgressPercentage() }}%</span
                >
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import Task from "@/API/SPTask/Task";
import Auth from "@/API/Auth";

export default {
  name: "TaskDetails",

  props: {
    taskDetails: {
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
    const taskApi = new Task();
    return {
      taskApi,
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
      task: {},
      /** auth_user data ***/
      user: {},
      currentUser: {},
      /*** end auth user data */
    };
  },

  mounted() {
    this.user = Auth.USER;
    document.addEventListener("click", this.handleClickOutside);

    if (this.taskDetails && Object.keys(this.taskDetails).length > 0) {
      this.task = { ...this.taskDetails };
      this.completeLoading();
    }
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    goBack() {
      this.$router.go(-1); // Goes back one step in history
    },

    isCurrentUserAssignee() {
      // Check if we have a current user and project details
      if (!this.user?.id || !this.task) {
        return false;
      }
      // Check user ownership
      const isUserOwner = this.task.assignee == this.user.id;
      return isUserOwner;
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

    isOverdue(dueDate) {
      if (!dueDate || this.task.status === "Completed") return false;
      try {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
      } catch (error) {
        return false;
      }
    },

    getDaysRemaining() {
      if (!this.task.due_date) return "Not specified";
      if (this.task.status === "Completed") return "Task completed";
      try {
        const due = new Date(this.task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          return `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
          return "Due today";
        } else if (diffDays === 1) {
          return "1 day remaining";
        } else {
          return `${diffDays} days remaining`;
        }
      } catch (error) {
        return "Unable to calculate";
      }
    },

    getDaysRemainingClass() {
      if (!this.task.due_date || this.task.status === "Completed") return "";
      try {
        const due = new Date(this.task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "overdue";
        if (diffDays <= 3) return "urgent";
        if (diffDays <= 7) return "warning";
        return "normal";
      } catch (error) {
        return "";
      }
    },

    getProgressPercentage() {
      const statusProgress = {
        Pending: 0,
        "In Progress": 50,
        Completed: 100,
        "On Hold": 25,
        Cancelled: 0,
      };
      return statusProgress[this.task.status] || null;
    },

    getProgressBarClass() {
      const percentage = this.getProgressPercentage();
      if (percentage >= 100) return "progress-complete";
      if (percentage >= 50) return "progress-good";
      if (percentage >= 25) return "progress-warning";
      return "progress-low";
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
      if (!userId) return "Unassigned";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";
      const user = this.users.find((u) => u.id === userId);
      return user?.full_name || "Unknown User";
    },

    getEmailOfUser(userId) {
      if (!userId) return "Unassigned";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";
      const user = this.users.find((u) => u.id === userId);
      return user?.email || "Unknown User";
    },

    getPhoneOfUser(userId) {
      if (!userId) return "Unassigned";
      if (!this.users || !Array.isArray(this.users)) return "Unknown User";
      const user = this.users.find((u) => u.id === userId);
      return user?.phone || "Unknown User";
    },

    getInitials(name) {
      if (!name) return "U";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 100);
    },

    toggleStatusDropdown() {
      this.showStatusDropdown = !this.showStatusDropdown;
    },

    async changeStatus(newStatus) {
      this.task.status = newStatus;
      this.showStatusDropdown = false;
      // Emit event to parent component
      this.$emit('status-changed', {
        taskId: this.task.id,
        newStatus: newStatus
      });

      const data = {
        status: newStatus,
        completed_by: newStatus == 'Completed' ? this.user?.id : null,
      };
      const response = await this.taskApi.changeStatus(this.task.id, data)
    },

    handleClickOutside(event) {
      const statusControls = this.$el.querySelector(".status-controls");
      if (statusControls && !statusControls.contains(event.target)) {
        this.showStatusDropdown = false;
      }
    },

    completeLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },
  },

  watch: {
    taskDetails: {
      immediate: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.task = { ...newVal };
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
};
</script>

<style scoped>
.task-details {
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
.task-header {
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
  background: #3b82f6;
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
  background: #2563eb;
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

.task-title {
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

.task-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
}

.meta-value {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  color: #334155;
  font-size: 0.875rem;
}

/* Content Styles */
.task-content {
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.timeline-value.overdue {
  color: #dc2626;
}

.timeline-value.urgent {
  color: #ea580c;
}

.timeline-value.warning {
  color: #d97706;
}

.timeline-value.normal {
  color: #059669;
}

.overdue-badge {
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Deliverable Styles */
.deliverable-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #10b981;
}

.deliverable-card h4 {
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.deliverable-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

/* Assignment Styles */
.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.assignment-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.assignment-avatar {
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

.assignment-avatar.completed {
  background: #059669;
}

.assignment-info {
  flex: 1;
  min-width: 0;
}

.assignment-name {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
  word-wrap: break-word;
}

.assignment-role {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

/* Progress Styles */
.progress-info {
  display: grid;
  gap: 20px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.9rem;
}

.progress-value {
  display: flex;
  align-items: center;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-fill.progress-complete {
  background: #10b981;
}

.progress-fill.progress-good {
  background: #3b82f6;
}

.progress-fill.progress-warning {
  background: #f59e0b;
}

.progress-fill.progress-low {
  background: #ef4444;
}

.progress-text {
  font-weight: 600;
  color: #374151;
  min-width: 45px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .task-details {
    padding: 15px;
  }

  .task-header,
  .content-section {
    padding: 20px;
  }

  .task-title {
    font-size: 1.8rem;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .status-container {
    align-items: center;
  }

  .assignment-grid {
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

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

/* Animation for content appearance */
.task-content {
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

/* Back Button Styles */
.back-button-container {
  margin-bottom: 25px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  /* background: #522f6b; */
  /* color: #fff; */
  border: 1px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.back-button:hover {
  color: #fff;
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-button:active {
  transform: translateY(0);
}

.back-button svg {
  transition: transform 0.2s ease;
}

.back-button:hover svg {
  transform: translateX(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .back-button {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
}
</style>
