<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-dialog modal-fullscreen custom-sedation-modal" role="document">
      <div class="modal-content">
        <!-- Premium Header -->
        <div class="header">
          <div class="header-shine"></div>
          <div class="header-content">
            <div class="header-left">
              <div class="icon-wrapper">
                <i class="fas fa-file-medical"></i>
              </div>
              <div class="title-group">
                <h5 class="modal-title">{{ $t('auditpolicycompliance.Sedation') }}</h5>
                <span class="subtitle">Intelligent Assignment Distribution</span>
              </div>
            </div>
            <button type="button" class="btn-close-custom" @click="closeModal" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Enhanced Modal Body -->
        <div class="modal-body">
          <!-- Domains Container -->
          <div class="domains-container">
            <div class="section-header">
              <div class="header-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="header-text">
                <h2>{{ $t('auditpolicycompliance.Domains and Sub-Domain:') }}</h2>
                <span class="header-description">Organize your workflow structure</span>
              </div>
            </div>

            <div v-if="isLoading" class="loading-container">
              <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
              </div>
              <p class="loading-text">Loading domains...</p>
            </div>

            <div v-else class="domains-list">
              <div v-for="domain in DomainWithsub" :key="domain.id" class="domain-card" :data-domain-id="domain.id">
                <div class="domain-header">
                  <div class="domain-icon">
                    <i class="fas fa-sitemap"></i>
                  </div>
                  <h4>{{ domain.name }}</h4>
                  <span class="badge">{{ domain.sub_domains.length }}</span>
                </div>

                <div :id="'domain-' + domain.id" class="families-grid">
                  <div v-for="family in domain.sub_domains" :key="family.id" class="family-card"
                    :data-family-id="family.id" @dragover.prevent="onDragOver" @dragenter.prevent="onDragEnter"
                    @dragleave="onDragLeave" @drop="onDrop($event, family.id)">
                    <div class="family-header">
                      <div class="family-icon">
                        <i :class="getRandomIcon()"></i>
                      </div>
                      <div class="family-info">
                        <strong>{{ family.name }}</strong>
                        <span v-if="getAssignmentsForFamily(family.id).length > 0" class="assignment-count">
                          <i class="fas fa-users"></i>
                          {{ getAssignmentsForFamily(family.id).length }}
                        </span>
                      </div>
                    </div>

                    <div class="family-assignments">
                      <div v-for="assignment in getAssignmentsForFamily(family.id)" :key="assignment.id"
                        class="assignment-item">
                        <div class="assignment-avatar">
                          {{ assignment.name.charAt(0).toUpperCase() }}
                        </div>
                        <span class="assignment-name">{{ assignment.name }}</span>
                        <button class="remove-assignment" @click="removeAssignment(family.id, assignment.id)"
                          title="Remove assignment">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    <div v-if="getAssignmentsForFamily(family.id).length === 0" class="drop-zone-placeholder">
                      <div class="drop-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                      </div>
                      <span>Drop {{ responsibleType }} here</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Teams/Users Container -->
          <div class="teams-container">
            <div class="section-header">
              <div class="header-icon">
                <i v-if="responsibleType === 'users'" class="fas fa-user"></i>
                <i v-else class="fas fa-users"></i>
              </div>
              <div class="header-text">
                <h4>{{ responsibleType === 'users' ? $t('sedationmodal.users') : $t('sedationmodal.teams') }}</h4>
                <span class="header-description">{{ filteredAssignableItems.length }} available</span>
              </div>
            </div>

            <div v-if="isLoading" class="loading-container">
              <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
              </div>
            </div>

            <!-- Search Input -->
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input type="text" class="search-input" :placeholder="`Search ${responsibleType}...`"
                v-model="searchQuery">
              <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
                <i class="fas fa-times-circle"></i>
              </button>
            </div>

            <!-- Items List -->
            <div v-if="!isLoading" class="items-list">
              <div v-for="item in filteredAssignableItems" :key="item.id" class="team-item"
                :class="{ 'matched-item': isItemMatched(item.id) }" draggable="true"
                @dragstart="onDragStart($event, item)" :data-user-id="item.id">
                <div class="item-avatar">
                  {{ item.name.charAt(0).toUpperCase() }}
                </div>
                <div class="item-content">
                  <span class="item-name">{{ item.name }}</span>
                  <span v-if="isItemMatched(item.id)" class="item-status">
                    <i class="fas fa-check-circle"></i> Assigned
                  </span>
                </div>
                <div class="drag-handle">
                  <i class="fas fa-grip-vertical"></i>
                </div>
              </div>

              <div v-if="filteredAssignableItems.length === 0" class="no-results">
                <i class="fas fa-search"></i>
                <p>No {{ responsibleType }} found</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Premium Footer -->
        <div class="modal-footer">
          <div class="footer-info">
            <i class="fas fa-lightbulb"></i>
            <span>Drag and drop {{ responsibleType }} to assign them to families</span>
          </div>
          <div class="footer-actions">
            <button type="button" class="btn btn-cancel" @click="closeModal">
              <i class="fas fa-times"></i>
              {{ $t("sedationmodal.cancel") }}
            </button>
            <button type="button" class="btn btn-save" id="saveSedationBtn" @click="saveAssignments"
              :disabled="isSaving">
              <div v-if="isSaving" class="btn-spinner"></div>
              <i v-else class="fas fa-save"></i>
              <span v-if="isSaving">{{ $t('auditplan.Saving...') }}</span>
              <span v-else>{{ $t('auditplan.Save changes') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import auditplan from "@/API/AuditPlan/AuditPlan";
import Frameworks from "@/API/Frameworks/Frameworks";
import Control from "@/API/Control/Control";
import FrameworkControlTestAudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Domain from "@/API/Domain/Domain";
import { notify } from "@kyvg/vue3-notification";
import axios from "axios";

export default {
  name: "SedationModal",
  props: {
    isOpen: { type: Boolean, default: false },
    item: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      domains: [],
      assignableItems: [],
      searchQuery: '',
      addItemQuery: '',
      showAddItemPanel: false,
      allUsers: [],
      allTeams: [],
      assignments: {},
      isLoading: false,
      isSaving: false,
      initialized: false,
      responsibleType: 'teams',
      responsibleTypeToggle: false,
      api: new auditplan(),
      frameworksApi: new Frameworks(),
      FrameworkControlTestAuditApi: new FrameworkControlTestAudit(),
      ControlApi: new Control(),
      DomainApi: new Domain(),
      userApi: new User(),
      teamApi: new Team(),
      DomainWithsub: [],
      draggedItem: null,
      allAssistantAuditIds: [],
    };
  },
  computed: {
    frameworkId() {
      return this.item?.framework_id || null;
    },
    testNumber() {
      return this.item?.test_number_initiated || null;
    },
    itemId() {
      return this.item?.id || null;
    },
    filteredAssignableItems() {
      if (!this.searchQuery.trim()) {
        return this.assignableItems;
      }

      const query = this.searchQuery.toLowerCase();
      return this.assignableItems.filter(item =>
        item.name.toLowerCase().includes(query)
      );
    },
    filteredAddItems() {
      const query = this.addItemQuery.toLowerCase();
      let items = [];

      if (this.responsibleType === 'users') {
        items = this.allUsers.filter(user =>
          !this.assignableItems.some(item => item.id === user.id) &&
          user.name.toLowerCase().includes(query)
        );
      } else {
        items = this.allTeams.filter(team =>
          !this.assignableItems.some(item => item.id === team.id) &&
          team.name.toLowerCase().includes(query)
        );
      }

      return items.slice(0, 10);
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal === true && this.frameworkId && !this.initialized) {
        this.loadData();
      }
    },
    item: {
      immediate: true,
      handler(newItem) {
        if (newItem) {
          this.responsibleType = newItem.responsible_type || 'teams';
          this.responsibleTypeToggle = this.responsibleType === 'users';
          this.initialized = false;
        }
      }
    }
  },
  methods: {
    async loadData() {
      if (!this.frameworkId || this.isLoading) return;

      this.isLoading = true;
      try {
        this.domains = [];
        this.assignableItems = [];
        this.assignments = {};

        await this.fetchFrameworkData();
        await this.fetchDomains();
        this.collectAssistantAuditIds();
        await this.fetchAllUsers();
        await this.fetchAllTeams();
        await this.fetchCurrentAssignments(this.responsibleType);
        this.initializeAssignments();

        this.initialized = true;
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    collectAssistantAuditIds() {
      this.allAssistantAuditIds = [];
      this.DomainWithsub.forEach(domain => {
        domain.sub_domains.forEach(subDomain => {
          if (Array.isArray(subDomain.assistant_audit)) {
            this.allAssistantAuditIds = [
              ...this.allAssistantAuditIds,
              ...subDomain.assistant_audit
            ];
          }
        });
      });

      this.allAssistantAuditIds = [...new Set(this.allAssistantAuditIds)];
    },

    isItemMatched(itemId) {
      return this.allAssistantAuditIds.includes(itemId);
    },

    closeModal() {
      this.$emit('close');
    },

    toggleAddItemPanel() {
      this.showAddItemPanel = !this.showAddItemPanel;
      this.addItemQuery = '';
    },

    addItem(item) {
      if (!this.assignableItems.some(existing => existing.id === item.id)) {
        this.assignableItems.push({
          id: item.id,
          name: item.name
        });
      }

      this.toggleAddItemPanel();
    },

    toggleResponsibleType() {
      this.responsibleType = this.responsibleTypeToggle ? 'users' : 'teams';
      this.fetchCurrentAssignments(this.responsibleType);
    },

    async fetchFrameworkData() {
      try {
        const controls = await this.ControlApi.getAll({
          filter: `framework_id|${this.frameworkId}`,
          select: "id|family|domain_id"
        });

        const controlIds = controls.map(control => control.id);
        const auditData = await this.FrameworkControlTestAuditApi.getAll({
          filter: `test_number|${this.item.test_number_initiated}-int`,
          filterIn: `control_id|${controlIds.join(',')}`,
          select: "control_id|assistant_audit",
          model: "sedation"
        });

        const auditMap = {};
        auditData.forEach(audit => {
          if (audit.control_id) {
            auditMap[audit.control_id] = audit.assistant_audit || [];
          }
        });

        const filteredControls = controls.filter(control =>
          auditMap.hasOwnProperty(control.id)
        );

        filteredControls.forEach(control => {
          control.assistant_audit = auditMap[control.id];
        });

        const uniqueDomainIds = [...new Set(filteredControls.map(c => c.domain_id))];
        const domains = await this.DomainApi.getAll({
          filterIn: `id|${uniqueDomainIds.join(',')}`,
          select: "id|name",
          with: ["subDomains"]
        });

        const familyIds = [...new Set(filteredControls.map(control => control.family))];

        const finalResult = domains.map(domain => {
          const subDomains = domain.sub_domains || [];

          const matchingSubDomains = subDomains.filter(subDomain =>
            familyIds.includes(subDomain.id)
          );

          const subDomainsWithControls = matchingSubDomains.map(subDomain => {
            const subDomainControls = filteredControls.filter(control =>
              control.family === subDomain.id
            );

            const assistantAudits = [...new Set(
              subDomainControls.flatMap(ctrl => ctrl.assistant_audit)
            )];

            return {
              ...subDomain,
              assistant_audit: assistantAudits
            };
          });

          return {
            ...domain,
            sub_domains: subDomainsWithControls
          };
        });

        this.DomainWithsub = finalResult;

      } catch (error) {
        console.error("Error fetching framework data:", error);
        throw error;
      }
    },

    initializeAssignments() {
      this.DomainWithsub.forEach(domain => {
        domain.sub_domains.forEach(subDomain => {
          const familyId = subDomain.id;

          if (!this.assignments[familyId]) {
            this.assignments[familyId] = [];
          }

          if (Array.isArray(subDomain.assistant_audit)) {
            subDomain.assistant_audit.forEach(auditId => {
              const matchingItem = this.assignableItems.find(item => item.id === auditId);
              if (matchingItem && !this.assignments[familyId].some(a => a.id === auditId)) {
                this.assignments[familyId].push({
                  id: matchingItem.id,
                  name: matchingItem.name,
                  type: this.responsibleType
                });
              }
            });
          }
        });
      });
    },

    async fetchDomains() {
      try {
        this.domains = [];
      } catch (error) {
        console.error("Error fetching domains:", error);
        throw error;
      }
    },

    async fetchAllUsers() {
      try {
        const response = await this.userApi.getAll({ select: "id|full_name" });
        this.allUsers = response.map(user => ({
          id: user.id,
          name: user.full_name || user.name || 'Unknown User'
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    },

    async fetchAllTeams() {
      try {
        const response = await this.teamApi.getAll({ select: "id|name" });
        this.allTeams = response.map(team => ({
          id: team.id,
          name: team.name
        }));
      } catch (error) {
        console.error("Error fetching teams:", error);
        throw error;
      }
    },

    async fetchCurrentAssignments(type) {
      try {
        const responsibleIds = this.item.responsible || [];

        if (type === 'users') {
          this.assignableItems = this.allUsers
            .filter(user => responsibleIds.includes(user.id))
            .map(user => ({
              id: user.id,
              name: user.full_name || user.name || 'Unknown User'
            }));
        } else {
          this.assignableItems = this.allTeams
            .filter(team => responsibleIds.includes(team.id))
            .map(team => ({
              id: team.id,
              name: team.name
            }));
        }
      } catch (error) {
        console.error(`Error processing current ${type} assignments:`, error);
      }
    },

    removeItem(id) {
      this.assignableItems = this.assignableItems.filter(item => item.id !== id);

      Object.keys(this.assignments).forEach(familyId => {
        this.removeAssignment(familyId, id);
      });
    },

    onDragStart(event, item) {
      this.draggedItem = item;
      event.dataTransfer.setData('text/plain', item.id);
      event.dataTransfer.effectAllowed = 'move';
      event.target.classList.add('dragging');
    },

    onDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      event.currentTarget.classList.add('drag-over');
    },

    onDragEnter(event) {
      event.preventDefault();
      event.currentTarget.classList.add('drag-enter');
    },

    onDragLeave(event) {
      event.currentTarget.classList.remove('drag-over', 'drag-enter');
    },

    onDrop(event, familyId) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over', 'drag-enter');

      if (!this.draggedItem) return;

      this.addAssignment(familyId, this.draggedItem);
      this.draggedItem = null;

      const draggingElements = document.querySelectorAll('.dragging');
      draggingElements.forEach(el => el.classList.remove('dragging'));
    },

    addAssignment(familyId, item) {
      if (!this.assignments[familyId]) {
        this.assignments[familyId] = [];
      }

      const isAlreadyAssigned = this.assignments[familyId].some(
        assignment => assignment.id === item.id
      );

      if (!isAlreadyAssigned) {
        this.assignments[familyId].push({
          id: item.id,
          name: item.name,
          type: this.responsibleType
        });
      }
    },

    removeAssignment(familyId, itemId) {
      if (this.assignments[familyId]) {
        this.assignments[familyId] = this.assignments[familyId].filter(
          assignment => assignment.id !== itemId
        );
      }
    },

    getAssignmentsForFamily(familyId) {
      return this.assignments[familyId] || [];
    },

    async saveAssignments() {
      axios.defaults.baseURL = REGULATORSERVICE;

      this.isSaving = true;
      try {
        const data = {
          frameworkId: this.frameworkId,
          testControlNumber: this.testNumber,
          itemId: this.itemId,
          type: this.responsibleType,
          assignedItems: this.assignableItems.map(item => item.id),
          familyAssignments: this.assignments
        };

        const response = await this.api.saveAssignments(data);

        if (response.status === 'success') {
          notify({
            title: this.$t("sedationmodal.success"),
            text: "Assignments saved successfully.",
            type: "success",
          });

          this.$emit('saved', response);
          this.closeModal();
        } else {
          notify({
            title: this.$t("sedationmodal.error"),
            text: response.message || "Failed to save assignments.",
            type: "error",
          });
          console.error("Failed to save assignments:", response);
        }

      } catch (error) {
        notify({
          title: this.$t("sedationmodal.error"),
          text: error.message || "An unexpected error occurred while saving.",
          type: "error",
        });
        console.error("Error saving assignments:", error);
      } finally {
        this.isSaving = false;
      }
    },

    getRandomIcon() {
      const icons = [
        'fas fa-cogs',
        'fas fa-briefcase',
        'fas fa-star',
        'fas fa-user-shield',
        'fas fa-cube',
        'fas fa-tag',
        'fas fa-chart-line'
      ];
      return icons[Math.floor(Math.random() * icons.length)];
    }
  }
};
</script>

<style scoped>
/* Premium Design Variables */
:root {
  --primary: #44225c;
  --primary-light: #5a2d76;
  --primary-dark: #331947;
  --accent: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
}

/* Modal Overlay with Premium Blur */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(68, 34, 92, 0.4) 100%);
  backdrop-filter: blur(8px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: overlayFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Modal Dialog */
.modal-dialog.modal-fullscreen {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  margin: 0;
  animation: modalZoomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalZoomIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fc;
  border-radius: 0;
  overflow: hidden;
}

/* Premium Header with Shine Effect */
.header {
  background: linear-gradient(135deg, #44225c 0%, #6b3689 50%, #44225c 100%);
  background-size: 200% 100%;
  color: #ffffff;
  padding: 0;
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 8px 32px rgba(68, 34, 92, 0.5);
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.header-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
      transparent,
      rgba(255, 255, 255, 0.05),
      transparent);
  animation: shine 3s infinite;
  pointer-events: none;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.icon-wrapper {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.icon-wrapper:hover {
  transform: scale(1.05) rotate(5deg);
}

.icon-wrapper i {
  font-size: 1.25rem;
  color: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.btn-close-custom {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
}

.btn-close-custom:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #dc2626;
  transform: rotate(90deg) scale(1.15);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
}

.btn-close-custom i {
  font-size: 1rem;
}

/* Modal Body */
.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 0;
  gap: 0;
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f4f9 100%);
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.header-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.3);
}

.header-icon i {
  font-size: 0.875rem;
  color: #ffffff;
}

.header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.section-header h2,
.section-header h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.01em;
}

.header-description {
  font-size: 0.6875rem;
  color: #6b7280;
  font-weight: 400;
}

/* Domains Container */
.domains-container {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
}

.domains-container::-webkit-scrollbar {
  width: 12px;
}

.domains-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 10px;
  margin: 8px 0;
}

.domains-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #44225c 0%, #6b3689 100%);
  border-radius: 10px;
  border: 3px solid #f3f4f6;
  transition: background 0.3s ease;
}

.domains-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b3689 0%, #8b5cf6 100%);
}

/* Teams Container */
.teams-container {
  width: 340px;
  min-width: 340px;
  max-width: 340px;
  background: #ffffff;
  overflow-y: auto;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.teams-container::-webkit-scrollbar {
  width: 8px;
}

.teams-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 10px;
}

.teams-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #44225c 0%, #6b3689 100%);
  border-radius: 10px;
}

/* Loading Container with Premium Spinner */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1.25rem;
}

.loading-spinner {
  position: relative;
  width: 50px;
  height: 50px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: rotate 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #44225c;
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  border-top-color: #6b3689;
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  border-top-color: #8b5cf6;
  animation-delay: -0.15s;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

/* Domains List */
.domains-list {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Domain Card */
.domain-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.domain-card:hover {
  box-shadow: 0 6px 24px rgba(68, 34, 92, 0.12);
  transform: translateY(-2px);
  border-color: #c4b5fd;
}

.domain-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-bottom: 1px solid #e9d5ff;
}

.domain-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(68, 34, 92, 0.3);
}

.domain-icon i {
  font-size: 1rem;
  color: #ffffff;
}

.domain-header h4 {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.01em;
}

.domain-header .badge {
  min-width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  color: #ffffff;
  padding: 0 0.625rem;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.3);
}

/* Families Grid */
.families-grid {
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* Family Card */
.family-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 100px;
  position: relative;
  overflow: hidden;
}

.family-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #44225c 0%, #8b5cf6 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.family-card:hover {
  border-color: #c4b5fd;
  box-shadow: 0 4px 16px rgba(68, 34, 92, 0.1);
  transform: translateY(-1px);
}

.family-card:hover::before {
  opacity: 1;
}

.family-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid #f3f4f6;
}

.family-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.family-icon i {
  color: #6b3689;
  font-size: 0.875rem;
}

.family-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.family-info strong {
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.assignment-count {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  background: linear-gradient(135deg, #d0b5e3 0%, #b89dd4 100%);
  color: #44225c;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(208, 181, 227, 0.3);
  width: 55px;
}

.assignment-count i {
  font-size: 0.625rem;
}

/* Family Assignments */
.family-assignments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.375rem;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
  animation: itemSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes itemSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.assignment-item:hover {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-color: #c4b5fd;
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.12);
}

.assignment-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  color: #ffffff;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.3);
  flex-shrink: 0;
}

.assignment-name {
  flex: 1;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.8125rem;
}

.remove-assignment {
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.remove-assignment:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: #dc2626;
  color: #ffffff;
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

.remove-assignment i {
  font-size: 0.6875rem;
}

/* Drop Zone Placeholder */
.drop-zone-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #9ca3af;
  background: #fafbfc;
  transition: all 0.3s ease;
  min-height: 80px;
}

.drop-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.drop-icon i {
  font-size: 1rem;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.drop-zone-placeholder span {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Drag States */
.dragging {
  opacity: 0.4;
  transform: scale(0.96);
  cursor: grabbing;
}

.drag-over {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%) !important;
  border: 2px dashed #8b5cf6 !important;
  box-shadow: inset 0 0 32px rgba(139, 92, 246, 0.1);
}

.drag-over .drop-zone-placeholder {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #8b5cf6;
  color: #6b3689;
  transform: scale(1.03);
}

.drag-over .drop-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  transform: scale(1.1);
  animation: dropBounce 0.6s ease-in-out infinite;
}

.drag-over .drop-icon i {
  color: #ffffff;
}

@keyframes dropBounce {

  0%,
  100% {
    transform: scale(1.1) translateY(0);
  }

  50% {
    transform: scale(1.1) translateY(-6px);
  }
}

.drag-enter {
  animation: pulseGlow 0.6s ease-in-out;
}

@keyframes pulseGlow {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
  }

  50% {
    box-shadow: 0 0 0 12px rgba(139, 92, 246, 0);
  }
}

/* Search Wrapper */
.search-wrapper {
  position: relative;
  margin: 1rem 1.25rem;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.875rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 2.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.8125rem;
  color: #1f2937;
  background: #fafbfc;
  transition: all 0.3s ease;
  font-weight: 500;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 7px;
  transition: all 0.2s ease;
  border: none;
}

.clear-search:hover {
  background: #e5e7eb;
  color: #6b7280;
  transform: translateY(-50%) scale(1.1);
}

/* Items List */
.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.25rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.items-list::-webkit-scrollbar {
  width: 6px;
}

.items-list::-webkit-scrollbar-track {
  background: transparent;
}

.items-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #44225c 0%, #6b3689 100%);
  border-radius: 10px;
}

/* Team Item */
.team-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid #d0b5e3;
  border-radius: 10px;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 6px rgba(208, 181, 227, 0.12);
  position: relative;
  overflow: hidden;
}

.team-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #d0b5e3 0%, #b89dd4 100%);
}

.team-item:hover {
  transform: translateY(-2px) translateX(3px);
  box-shadow: 0 4px 16px rgba(208, 181, 227, 0.25);
  border-color: #b89dd4;
}

.team-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.item-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #d0b5e3 0%, #b89dd4 100%);
  color: #44225c;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(208, 181, 227, 0.3);
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.item-name {
  color: #1f2937;
  font-weight: 700;
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #8b5cf6;
  font-size: 0.6875rem;
  font-weight: 600;
}

.drag-handle {
  color: #d1d5db;
  font-size: 0.875rem;
  cursor: grab;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.team-item:hover .drag-handle {
  color: #9ca3af;
}

.matched-item {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border-color: #e9d5ff;
}

.matched-item .item-avatar {
  background: linear-gradient(135deg, #b89dd4 0%, #a78bca 100%);
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
  color: #9ca3af;
}

.no-results i {
  font-size: 2.5rem;
  opacity: 0.3;
}

.no-results p {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Premium Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
}

.footer-info i {
  color: #f59e0b;
  font-size: 1rem;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.625rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.btn:hover::before {
  transform: translateX(100%);
}

.btn i {
  font-size: 0.875rem;
}

.btn-cancel {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #4b5563;
  border: 2px solid #d1d5db;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-save {
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  color: #ffffff;
  border: 2px solid #44225c;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #6b3689 0%, #8b5cf6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(68, 34, 92, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: rotate 0.6s linear infinite;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .families-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 1200px) {
  .teams-container {
    width: 380px;
    min-width: 380px;
    max-width: 380px;
  }

  .families-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 992px) {
  .modal-body {
    flex-direction: column;
  }

  .domains-container,
  .teams-container {
    width: 100%;
    min-width: auto;
    max-width: none;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .teams-container {
    box-shadow: none;
    max-height: 50vh;
  }

  .families-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    padding: 1.25rem 1.75rem;
  }

  .modal-title {
    font-size: 1.75rem;
  }

  .footer-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 1rem 1.5rem;
  }

  .icon-wrapper {
    width: 52px;
    height: 52px;
    padding: 0.625rem;
  }

  .icon-wrapper i {
    font-size: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.8125rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
  }

  .families-grid {
    padding: 1.25rem;
    gap: 1.25rem;
  }
}
</style>