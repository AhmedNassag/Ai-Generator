<template>
  <div class="strategicPlan-details">
    <!-- Back Button -->
    <div class="back-button-container">
      <!-- <button @click="goBack" class="btn-primary back-button"> -->
      <router-link
        :to="{ name: 'StrategicPlan' }"
        class="btn-primary back-button"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ $t("strategicplan.goback") }}
      </router-link>
      <!-- </button> -->
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">{{ $t("strategicplan.Loading") }}...</p>
    </div>

    <!-- Main Content - Only show when not loading -->
    <div v-else>
      <!-- Header Section -->
      <div class="strategicPlan-header">
        <div class="header-content">
          <h1 class="strategicPlan-title">
            {{ strategicPlan.name || "Untitled StrategicPlan" }}
          </h1>
          <div class="header-actions">
            <div class="status-container">
              <div
                class="status-badge"
                :class="getStatusClass(strategicPlan.status)"
              >
                {{ strategicPlan.status ? "Active" : "Deactive" }}
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
                  {{$t("strategicplan.changestatus")}}
                </button>
                <div v-if="showStatusDropdown" class="status-dropdown">
                  <div class="dropdown-header">{{$t("strategicplan.updatestatus")}}</div>
                  <button
                    v-for="status in availableStatuses"
                    :key="status"
                    @click="changeStatus(status)"
                    class="status-option"
                    :class="{ current: status === strategicPlan.status }"
                  >
                    <div
                      class="status-option-badge"
                      :class="getStatusClass(status)"
                    >
                      {{ status == 1 ? "Active" : "Deactive" }}
                    </div>
                    <svg
                      v-if="status === strategicPlan.status"
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

        <div class="d-flex justify-content-between">
          <div v-if="strategicPlan?.file">
            <span class="type-label p-1">{{$t("strategicplan.file")}} : </span>
            <span class="type-value">
              <a
                v-if="strategicPlan.fullFilePath"
                :href="strategicPlan.fullFilePath"
                class="btn btn-sm btn-outline-primary"
                title="Download"
              >
                <i class="fas fa-download"> {{$t("strategicplan.download")}} </i>
              </a>
            </span>
          </div>

          <div v-if="strategicPlan?.document_id">
            <span class="type-label p-1">{{$t("strategicplan.document")}} : </span>
            <span class="type-value">
              {{ getNameOfDocument(strategicPlan.document_id) }}
            </span>
          </div>

          <div v-if="strategicPlan?.created_by">
            <span class="type-label p-1"> {{$t("strategicplan.createdby")}} : </span>
            <button
              class="type-value color-primary"
              @click="openModal(strategicPlan?.created_by)"
            >
              {{ getUserFullName(strategicPlan?.created_by) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="strategicPlan-content">
        <!-- Description Section -->
        <div v-if="strategicPlan.description" class="content-section">
          <h3 class="section-title">{{$t("strategicplan.description")}}</h3>
          <p class="description-text" v-html="strategicPlan.description"></p>
        </div>

        <!-- Content Section -->
        <div v-if="strategicPlan.content" class="content-section">
          <h3 class="section-title">{{ $t("strategicplan.content") }}</h3>
          <p class="content-text" v-html="strategicPlan.content"></p>
        </div>

        <!-- Vision Section -->
        <div v-if="strategicPlan.vision" class="content-section">
          <h3 class="section-title">{{ $t("strategicplan.Vision") }}</h3>
          <p class="vision-text" v-html="strategicPlan.vision"></p>
        </div>

        <!-- Mission Section -->
        <div v-if="strategicPlan.mission" class="content-section">
          <h3 class="section-title">{{ $t("strategicplan.Mission") }}Mission</h3>
          <p class="mission-text" v-html="strategicPlan.mission"></p>
        </div>

        <!-- Message Section -->
        <div v-if="strategicPlan.message" class="content-section">
          <h3 class="section-title">{{ $t("strategicplan.Message") }}Message</h3>
          <p class="message-text" v-html="strategicPlan.message"></p>
        </div>

        <!-- Timeline Section -->
        <div
          v-if="strategicPlan.startDate || strategicPlan.endDate"
          class="content-section"
        >
          <h3 class="section-title">{{ $t("strategicplan.Timeline") }}Timeline</h3>
          <div class="timeline-info">
            <div v-if="strategicPlan.startDate" class="timeline-item">
              <span class="timeline-label">{{ $t("strategicplan.StartDate") }}:</span>
              <span class="timeline-value">{{
                formatDate(strategicPlan.startDate)
              }}</span>
            </div>
            <div v-if="strategicPlan.endDate" class="timeline-item">
              <span class="timeline-label">{{ $t("strategicplan.EndDate") }} : </span>
              <span class="timeline-value">{{
                formatDate(strategicPlan.endDate)
              }}</span>
            </div>
            <div
              v-if="strategicPlan.startDate && strategicPlan.endDate"
              class="timeline-item"
            >
              <span class="timeline-label">{{ $t("strategicplan.Duration") }}:</span>
              <span class="timeline-value">{{ calculateDuration() }}</span>
            </div>
          </div>
        </div>

        <!-- *** start parent section *** -->

        <!-- *** start childs section *** -->
        <!-- Requirements Section -->
        <div
          v-if="
            strategicPlan.requirement_ids &&
            strategicPlan.requirement_ids.length > 0
          "
          class="content-section"
        >
          <h3 class="section-title">{{ $t("strategicplan.RelatedRequirements") }}:</h3>
          <div class="requirements-list">
            <span
              v-for="requirement in strategicPlan.requirement_ids"
              :key="requirement"
              class="requirement-tag"
            >
              {{
                getInitialsFromRequirementId(getNameOfRequirement(requirement))
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ $t("strategicplan.Created By Details") }}</h3>
      </div>

      <div class="modal-body">
        <form @submit.prevent="">
          <h4>
            <span>{{ $t("strategicplan.Full Name") }}: {{ createdByDetails?.full_name }} </span>
          </h4>
          <h4>
            <span>{{ $t("strategicplan.Email") }} : {{ createdByDetails?.email }} </span>
          </h4>
          <h4>
            <span>{{ $t("strategicplan.Phone") }} : {{ createdByDetails?.phone }} </span>
          </h4>
          <div class="modal-footer">
            <button
              type="button btn-secondary"
              class="cancel-button"
              @click="closeModal"
            >
              {{ $t("strategicplan.Cancel") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import StrategicPlan from "@/API/StrategicPlan/StrategicPlan";
import User from "@/API/User/User";
import Document from "@/API/Document/Document";
export default {
  name: "StrategicPlanDetails",

  props: {
    strategicPlanDetails: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    documents: {
      type: Object,
      default: () => [],
    },
    requirements: {
      type: Array,
      default: () => [],
    },
  },

  setup() {
    const strategicPlanApi = new StrategicPlan();
    const userAPi = new User();
    const documentAPi = new Document();
    return {
      strategicPlanApi,
      userAPi,
      documentAPi,
    };
  },

  data() {
    return {
      showStatusDropdown: false,
      loading: true,
      availableStatuses: [false, true],
      strategicPlan: {},
      usersList: [],
      showModal: false,
      createdByDetails: {},
    };
  },

  async created() {
    this.usersList = await this.userAPi.getAll({
      select: "id|full_name|phone|email",
    });
    this.documentsList = await this.documentAPi.getAll({ select: "id|name" });
  },

  methods: {
    openModal(createdById) {
      this.createdByDetails = this.usersList.find(
        (user) => user.id === createdById
      );
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    getUserFullName(userId) {
      const user = this.usersList.find((user) => user.id === userId);
      return user ? user.full_name : "";
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
      if (!this.strategicPlan.startDate || !this.strategicPlan.endDate)
        return "Not specified";
      try {
        const start = new Date(this.strategicPlan.startDate);
        const end = new Date(this.strategicPlan.endDate);
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
        true: "status-completed",
      };
      return statusClasses[status] || "status-cancelled";
    },

    getNameOfDocument(documentId) {
      if (!documentId) return "";
      const document = this.documentsList?.find(
        (document) => document.id === documentId
      );
      return document ? document.name : "";
    },

    getInitialsFromDocumentId(documentId) {
      if (!documentId) return "Anonymous Document";
      if (!this.documents || !Array.isArray(this.documents)) return "Document";
      const document = this.documents.find((d) => d.id === documentId);
      const name = document?.name;
      if (!name) return userId.toString().substring(0, 100).toUpperCase();
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 100); // Limit to 2 characters
    },

    /**/
    getNameOfRequirement(requirementId) {
      if (!requirementId) return "Anonymous Requirement";
      if (!this.requirements || !Array.isArray(this.requirements))
        return "Unknown Requirement";
      const requirement = this.requirements.find((r) => r.id === requirementId);
      return requirement?.name || "Unknown Requirement";
    },

    getInitialsFromRequirementId(requirementId) {
      if (!requirementId) return "Anonymous Requirement";
      if (!this.requirements || !Array.isArray(this.requirements))
        return "Unknown Requirement";
      const requirement = this.requirements.find((r) => r.id === requirementId);
      const name = requirement?.name;
      if (!name)
        return requirementId.toString().substring(0, 100).toUpperCase();
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 100); // Limit to 2 characters
    },
    /**/

    toggleStatusDropdown() {
      this.showStatusDropdown = !this.showStatusDropdown;
    },

    async changeStatus(newStatus) {
      this.strategicPlan.status = newStatus;
      this.showStatusDropdown = false;
      // Emit event to parent component
      this.$emit("status-changed", {
        strategicPlanId: this.strategicPlan.id,
        newStatus: newStatus,
      });
      const data = {
        status: newStatus,
      };
      const response = await this.strategicPlanApi.changeStatus(
        this.strategicPlan.id,
        data
      );
    },
    handleClickOutside(event) {
      // Safety check to ensure $el exists and has querySelector method
      if (!this.$el || typeof this.$el.querySelector !== "function") {
        return;
      }

      const statusControls = this.$el.querySelector(".status-controls");
      if (statusControls && !statusControls.contains(event.target)) {
        this.showStatusDropdown = false;
      }
    },
    // Method to simulate loading completion (you can remove this if not needed)
    completeLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },

    goBack() {
      this.$router.go(-1); // Goes back one step in history
      // OR use a specific route if preferred:
      // this.$router.push({ name: 'strategicPlan' });
    },
  },

  watch: {
    strategicPlanDetails: {
      immediate: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.strategicPlan = { ...newVal }; // Create a copy to avoid mutations
          // Add a small delay to show the loader
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

    teams: {
      immediate: true,
      handler(newVal) {
        console.log("Teams updated:", newVal);
      },
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);

    // If strategicPlanDetails is already available, start loading process
    if (
      this.strategicPlanDetails &&
      Object.keys(this.strategicPlanDetails).length > 0
    ) {
      this.strategicPlan = { ...this.strategicPlanDetails };
      this.completeLoading();
    }
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style>
.strategicPlan-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  background: #ffffff;
  min-height: 100vh;
}

/* Modal styles */

.modal-body {
  padding: 1rem;
}
.cancel-button {
  padding: 0.5rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  background-color: darkgoldenrod;
  font-size: 0.875rem;
}
.modal-overlay {
  position: fixed; /* Changed from relative to fixed */
  top: 0; /* Changed from 500px to 0 */
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 4;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
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
.strategicPlan-header {
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

.strategicPlan-title {
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
  color: #dc2626;
}

.status-default {
  background: #e5e7eb;
  color: #374151;
}

.strategicPlan-type {
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
.strategicPlan-content {
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

/* Responsive Design */
@media (max-width: 768px) {
  .strategicPlan-details {
    padding: 15px;
  }

  .strategicPlan-header,
  .content-section {
    padding: 20px;
  }

  .strategicPlan-title {
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
.strategicPlan-content {
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
