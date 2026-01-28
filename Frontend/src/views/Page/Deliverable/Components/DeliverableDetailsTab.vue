<template>
  <div class="deliverable-details">
    <!-- Back Button -->
    <div class="back-button-container">
      <button @click="goBack" class="btn-primary back-button">
        <!-- <router-link :to="{ path: `/project-details/${milestone.project_id}` }" class="btn-primary back-button"> -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ $t("deliverable.Go Back") }}
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
      <p class="loading-text">{{ $t("deliverable.Loading") }}...</p>
    </div>

    <!-- Main Content - Only show when not loading -->
    <div v-else>
      <!-- Header Section -->
      <div class="deliverable-header">
        <div class="header-content">
          <h1 class="deliverable-title">{{ deliverable.name || 'Untitled Deliverable' }}</h1>
          <div class="header-actions">
            <div class="status-container">
              <div class="status-badge" :class="getStatusClass(deliverable.status)">
                {{ deliverable.status || 'Unknown' }}
              </div>
              <div class="status-controls">
                <button
                  v-if="deliverable.status !== 'Completed'"
                  @click="toggleStatusDropdown" 
                  class="change-status-btn"
                  :class="{ 'active': showStatusDropdown }"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  {{ $t("deliverable.Change Status") }}
                </button>
                <div v-if="showStatusDropdown" class="status-dropdown">
                  <div class="dropdown-header">{{ $t("deliverable.Update Status") }}</div>
                  <button
                    v-for="status in availableStatuses"
                    :key="status"
                    @click="changeStatus(status)"
                    class="status-option"
                    :class="{ 'current': status === deliverable.status }"
                  >
                    <div class="status-option-badge" :class="getStatusClass(status)">
                      {{ status }}
                    </div>
                    <svg v-if="status === deliverable.status" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="deliverable?.expected_date" class="program">
          <i class="fa fa-clock p-1"></i> 
          <span class="type-label"> {{ $t("deliverable.expected Date") }}: </span>
          <span class="expected_date p-1">{{ deliverable?.expected_date }}</span>
        </div>

      </div>

      <!-- Main Content -->
      <div class="deliverable-content">
        <!-- Description Section -->
        <div v-if="deliverable.description" class="content-section">
          <h3 class="section-title d-flex rtl">{{ $t("deliverable.Description") }}</h3>
          <p class="description-text" v-html="deliverable.description"></p>
        </div>

        <!-- Timeline Section -->
        <div v-if="deliverable.startDate || deliverable.endDate" class="content-section">
          <h3 class="section-title d-flex rtl">{{ $t("deliverable.Timeline") }}:</h3>
          <div class="timeline-info">
            <div v-if="deliverable.startDate" class="timeline-item">
              <span class="timeline-label">{{ $t("deliverable.Start Date") }}:</span>
              <span class="timeline-value">{{ formatDate(deliverable.startDate) }}</span>
            </div>
            <div v-if="deliverable.endDate" class="timeline-item">
              <span class="timeline-label">{{ $t("deliverable.End Date") }}:</span>
              <span class="timeline-value">{{ formatDate(deliverable.endDate) }}</span>
            </div>
            <div v-if="deliverable.startDate && deliverable.endDate" class="timeline-item">
              <span class="timeline-label">{{ $t("deliverable.Duration") }}:</span>
              <span class="timeline-value">{{ calculateDuration() }}</span>
            </div>
          </div>
        </div>

        <!-- *** start parent section *** -->
        <!-- Project Plan Section -->
        <div v-if="deliverable.project && (deliverable.project.name || deliverable.project.description)" class="content-section">
          <h3 class="section-title d-flex rtl">{{ $t("deliverable.Project Plan") }}</h3>
          <div class="project-plan-card">
            <h4 v-if="deliverable.project?.name">{{ deliverable.project?.name }}</h4>
            <p v-if="deliverable.project?.description" v-html="deliverable.project?.description"></p>
          </div>
        </div>

        <!-- *** start parent section *** -->
        <!-- Project Section -->
        <div v-if="deliverable.milestone && (deliverable.milestone.name || deliverable.milestone.description)" class="content-section">
          <h3 class="section-title d-flex rtl">{{ $t("deliverable.Milestone") }}</h3>
          <div class="milestone-card">
            <h4 v-if="deliverable.milestone?.name">{{ deliverable.milestone?.name }}</h4>
            <p v-if="deliverable.milestone?.description" v-html="deliverable.milestone?.description"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Deliverable from "@/API/Deliverable/Deliverable";
import Auth from "@/API/Auth";

export default {
  name: 'DeliverableDetails',

  props: {
    deliverableDetails: {
      type: Object,
      required: true,
      default: () => ({}) 
    },
    users: {
      type: Array,
      default: () => []
    },
    teams: {
      type: Array,
      default: () => []
    },
  },

  setup() {
    const deliverableApi = new Deliverable();
    return {
      deliverableApi,
    };
  },

  data() {
    return {
      showStatusDropdown: false,
      loading: true,
      availableStatuses: ['Under Review', 'In Progress', 'Approved', 'On Hold', 'Completed', 'Cancelled'],
      deliverable: {},
      /** auth_user data ***/
      user: {},
      /*** end auth user data */
    }
  },

  mounted() {
    this.user = Auth.USER;
    document.addEventListener('click', this.handleClickOutside);
    
    // If deliverableDetails is already available, start loading process
    if (this.deliverableDetails && Object.keys(this.deliverableDetails).length > 0) {
      this.deliverable = { ...this.deliverableDetails };
      this.completeLoading();
    }
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    goBack() {
      this.$router.go(-1); // Goes back one step in history
    },

    formatDate(dateString) {
      if (!dateString) return 'Not specified';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return 'Invalid date';
      }
    },

    calculateDuration() {
      if (!this.deliverable.startDate || !this.deliverable.endDate) return 'Not specified';
      
      try {
        const start = new Date(this.deliverable.startDate);
        const end = new Date(this.deliverable.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.floor(diffDays / 30);
        const days = diffDays % 30;
        if (months > 0) {
          return days > 0 ? `${months} months, ${days} days` : `${months} months`;
        }
        return `${diffDays} days`;
      } catch (error) {
        return 'Unable to calculate';
      }
    },

    getStatusClass(status) {
      const statusClasses = {
        'Under Review': 'status-under-review',
        'In Progress': 'status-in-progress',
        'Approved': 'status-approved',
        'On Hold': 'status-on-hold',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled',
      };
      return statusClasses[status] || 'status-default';
    },

    getNameOfUser(userId) {
      if (!userId) return '';
      if (!this.users || !Array.isArray(this.users)) return 'Unknown User';
      const user = this.users.find(u => u.id === userId);
      return user?.full_name || 'Unknown User';
    },

    getInitialsFromUserId(userId) {
      if (!userId) return '';
      if (!this.users || !Array.isArray(this.users)) return 'User';
      const user = this.users.find(u => u.id === userId);
      const name = user?.name;
      if (!name) return userId.toString().substring(0, 100).toUpperCase();
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 100); // Limit to 2 characters
    },

    /**/
    getNameOfTeam(teamId) {
      if (!teamId) return 'Anonymous Team';
      if (!this.teams || !Array.isArray(this.teams)) return 'Unknown Team';
      const team = this.teams.find(t => t.id === teamId);
      return team?.name || 'Unknown Team';
    },

    getInitialsFromTeamId(teamId) {
      if (!teamId) return 'Anonymous Team';
      if (!this.teams || !Array.isArray(this.teams)) return 'Unknown Team';
      const team = this.teams.find(t => t.id === teamId);
      const name = team?.name;
      if (!name) return teamId.toString().substring(0, 100).toUpperCase();
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 100); // Limit to 2 characters
    },
    /**/

    toggleStatusDropdown() {
      this.showStatusDropdown = !this.showStatusDropdown;
    },

    async changeStatus(newStatus) {
      this.deliverable.status = newStatus;
      this.showStatusDropdown = false;
      // Emit event to parent component
      this.$emit('status-changed', {
        deliverableId: this.deliverable.id,
        newStatus: newStatus
      });

      const data = {
        status: newStatus,
        completed_by: newStatus == 'Completed' ? this.user?.id : null,
      };
      const response = await this.deliverableApi.changeStatus(this.deliverable.id, data)
    },

    handleClickOutside(event) {
      const statusControls = this.$el.querySelector('.status-controls');
      if (statusControls && !statusControls.contains(event.target)) {
        this.showStatusDropdown = false;
      }
    },

    // Method to simulate loading completion (you can remove this if not needed)
    completeLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    }
  },

  watch: {
    deliverableDetails: {
      immediate: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.deliverable = { ...newVal }; // Create a copy to avoid mutations
          // Add a small delay to show the loader
          setTimeout(() => {
            this.loading = false;
          }, 500);
        } else {
          this.loading = true;
        }
      }
    },

    users: {
      immediate: true,
      handler(newVal) {
        console.log("Users updated:", newVal);
      }
    },

    teams: {
      immediate: true,
      handler(newVal) {
        console.log("Teams updated:", newVal);
      }
    },
  },
}
</script>

<style scoped>
.deliverable-details {
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

.spinner-ring:nth-child(1) { animation-delay: -0.45s; }
.spinner-ring:nth-child(2) { animation-delay: -0.3s; }
.spinner-ring:nth-child(3) { animation-delay: -0.15s; }

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* Header Styles */
.deliverable-header {
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

.deliverable-title {
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

.status-under-review {
  background: #dbeafe;
  color: #92400e;
}

.status-approved {
  background: #dbeafe;
  color: #1fad2d;
}

.status-in-progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-on-hold {
  background: #fee2e2;
  color: #dc2626;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-cancelled {
  background: #f3f4f6;
  color: #374151;
}

.status-default {
  background: #e5e7eb;
  color: #374151;
}

.deliverable-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-label {
  font-weight: 600;
  color: #64748b;
}

.expectedBudget {
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  color: #334155;
}

.realBudget {
  background: #1dde67;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  color: #334155;
}

/* Content Styles */
.deliverable-content {
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

.deliverable-tag {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 10px;
}

.deliverable-tag {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 10px;
}

.task-tag {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 10px;
}

.objective-tag {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 10px;
}

.initiative-tag {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 10px;
}

.program-tag {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 10px;
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


/* Stakeholders Styles */
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

/* Responsive Design */
@media (max-width: 768px) {
  .deliverable-details {
    padding: 15px;
  }
  
  .deliverable-header,
  .content-section {
    padding: 20px;
  }
  
  .deliverable-title {
    font-size: 1.8rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
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
.deliverable-content {
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