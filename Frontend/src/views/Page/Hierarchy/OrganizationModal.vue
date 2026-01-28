<template>
  <div
    v-if="isVisible"
    class="modal fade show"
    tabindex="-1"
    style="display: block; background-color: rgba(0,0,0,0.5);"
    @click="handleOverlayClick"
  >
    <div class="modal-dialog modal-fullscreen" @click.stop>
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Organization Hierarchy</h5>
          <div class="header-controls">
            <div class="zoom-controls">
              <button class="btn btn-sm btn-outline-secondary" @click="zoomOut" title="Zoom Out">
                <i class="fas fa-search-minus"></i>
              </button>
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <button class="btn btn-sm btn-outline-secondary" @click="zoomIn" title="Zoom In">
                <i class="fas fa-search-plus"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary" @click="resetZoom" title="Reset Zoom">
                <i class="fas fa-redo"></i>
              </button>
            </div>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
        </div>
        <div class="modal-body" ref="modalBody">
          <div v-if="organizationData.length > 0" class="hierarchy-container" :style="{ transform: `scale(${zoomLevel})` }">
            <div class="organization-tree">
              <!-- Loop through root departments -->
              <div v-for="dept in rootDepartments" :key="dept.id" class="department-card-wrapper">
                <div class="department-card">
                  <div class="card-header" 
                    :style="{ 
                      borderLeftColor: dept.color?.hexcolor || '#667eea',
                      background: `linear-gradient(135deg, ${dept.color?.hexcolor || '#667eea'}15 0%, ${dept.color?.hexcolor || '#667eea'}05 100%)`
                    }">
                    <div class="card-title-section">
                      <button 
                        v-if="getChildDepartments(dept.id).length > 0" 
                        class="expand-btn"
                        @click="toggleExpand(dept.id)"
                        :style="{ color: dept.color?.hexcolor || '#667eea' }"
                      >
                        <i :class="expandedDepts[dept.id] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                      </button>
                      <div class="department-info">
                        <h6 class="department-name">{{ dept.name }}</h6>
                        <span class="department-code" v-if="dept.code">{{ dept.code }}</span>
                      </div>
                    </div>
                    <div class="card-badges">
                      <span class="badge badge-type" :style="{ backgroundColor: dept.color?.hexcolor || '#667eea' }">
                        {{ dept.type || 'Default' }}
                      </span>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="info-row">
                      <div class="info-item">
                        <i class="fas fa-user-tie" :style="{ color: dept.color?.hexcolor || '#667eea' }"></i>
                        <span class="info-label">Manager:</span>
                        <span class="info-value">{{ dept.manager?.name || 'Not assigned' }}</span>
                      </div>
                    </div>
                    <div class="stats-row">
                      <div class="stat-item" 
                        :style="{ background: `linear-gradient(135deg, ${dept.color?.hexcolor || '#667eea'}10 0%, ${dept.color?.hexcolor || '#667eea'}05 100%)` }">
                        <i class="fas fa-users" :style="{ color: dept.color?.hexcolor || '#667eea' }"></i>
                        <span class="stat-value" :style="{ color: dept.color?.hexcolor || '#667eea' }">
                          {{ getEmployeeCount(dept) }}
                        </span>
                        <span class="stat-label">Employees</span>
                      </div>
                      <div class="stat-item" 
                        :style="{ background: `linear-gradient(135deg, ${dept.color?.hexcolor || '#667eea'}10 0%, ${dept.color?.hexcolor || '#667eea'}05 100%)` }">
                        <i class="fas fa-sitemap" :style="{ color: dept.color?.hexcolor || '#667eea' }"></i>
                        <span class="stat-label">Sub-departments</span>
                        <span class="stat-value" :style="{ color: dept.color?.hexcolor || '#667eea' }">
                          {{ getChildDepartments(dept.id).length }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Children departments -->
                <div v-if="getChildDepartments(dept.id).length > 0 && expandedDepts[dept.id]" class="children-container">
                  <div class="connector-line" 
                    :style="{ background: `linear-gradient(to bottom, ${dept.color?.hexcolor || '#667eea'}, transparent)` }">
                  </div>
                  <div class="children-grid" :class="{ 'horizontal-grid': !hasGrandchildren(dept.id) }">
                    <div v-for="child in getChildDepartments(dept.id)" :key="child.id" class="department-card-wrapper">
                      <div class="department-card">
                        <div class="card-header" 
                          :style="{ 
                            borderLeftColor: child.color?.hexcolor || '#667eea',
                            background: `linear-gradient(135deg, ${child.color?.hexcolor || '#667eea'}15 0%, ${child.color?.hexcolor || '#667eea'}05 100%)`
                          }">
                          <div class="card-title-section">
                            <button 
                              v-if="getChildDepartments(child.id).length > 0" 
                              class="expand-btn"
                              @click="toggleExpand(child.id)"
                              :style="{ color: child.color?.hexcolor || '#667eea' }"
                            >
                              <i :class="expandedDepts[child.id] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                            </button>
                            <div class="department-info">
                              <h6 class="department-name">{{ child.name }}</h6>
                              <span class="department-code" v-if="child.code">{{ child.code }}</span>
                            </div>
                          </div>
                          <div class="card-badges">
                            <span class="badge badge-type" :style="{ backgroundColor: child.color?.hexcolor || '#667eea' }">
                              {{ child.type || 'Default' }}
                            </span>
                          </div>
                        </div>
                        <div class="card-body">
                          <div class="info-row">
                            <div class="info-item">
                              <i class="fas fa-user-tie" :style="{ color: child.color?.hexcolor || '#667eea' }"></i>
                              <span class="info-label">Manager:</span>
                              <span class="info-value">{{ child.manager?.name || 'Not assigned' }}</span>
                            </div>
                          </div>
                          <div class="stats-row">
                            <div class="stat-item" 
                              :style="{ background: `linear-gradient(135deg, ${child.color?.hexcolor || '#667eea'}10 0%, ${child.color?.hexcolor || '#667eea'}05 100%)` }">
                              <i class="fas fa-users" :style="{ color: child.color?.hexcolor || '#667eea' }"></i>
                              <span class="stat-label">Employees:</span>
                              <span class="stat-value" :style="{ color: child.color?.hexcolor || '#667eea' }">
                                {{ getEmployeeCount(child) }}
                              </span>
                            </div>
                            <div class="stat-item" 
                              :style="{ background: `linear-gradient(135deg, ${child.color?.hexcolor || '#667eea'}10 0%, ${child.color?.hexcolor || '#667eea'}05 100%)` }">
                              <i class="fas fa-sitemap" :style="{ color: child.color?.hexcolor || '#667eea' }"></i>
                              <span class="stat-label">Sub-departments</span>
                              <span class="stat-value" :style="{ color: child.color?.hexcolor || '#667eea' }">
                                {{ getChildDepartments(child.id).length }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Nested children (third level) -->
                      <div v-if="getChildDepartments(child.id).length > 0 && expandedDepts[child.id]" class="children-container">
                        <div class="connector-line" 
                          :style="{ background: `linear-gradient(to bottom, ${child.color?.hexcolor || '#667eea'}, transparent)` }">
                        </div>
                        <div class="children-grid horizontal-grid">
                          <div v-for="grandchild in getChildDepartments(child.id)" :key="grandchild.id" class="department-card-wrapper">
                            <div class="department-card">
                              <div class="card-header" 
                                :style="{ 
                                  borderLeftColor: grandchild.color?.hexcolor || '#667eea',
                                  background: `linear-gradient(135deg, ${grandchild.color?.hexcolor || '#667eea'}15 0%, ${grandchild.color?.hexcolor || '#667eea'}05 100%)`
                                }">
                                <div class="card-title-section">
                                  <div class="department-info">
                                    <h6 class="department-name">{{ grandchild.name }}</h6>
                                    <span class="department-code" v-if="grandchild.code">{{ grandchild.code }}</span>
                                  </div>
                                </div>
                                <div class="card-badges">
                                  <span class="badge badge-type" :style="{ backgroundColor: grandchild.color?.hexcolor || '#667eea' }">
                                    {{ grandchild.type || 'Default' }}
                                  </span>
                                </div>
                              </div>
                              <div class="card-body">
                                <div class="info-row">
                                  <div class="info-item">
                                    <i class="fas fa-user-tie" :style="{ color: grandchild.color?.hexcolor || '#667eea' }"></i>
                                    <span class="info-label">Manager:</span>
                                    <span class="info-value">{{ grandchild.manager?.name || 'Not assigned' }}</span>
                                  </div>
                                </div>
                                <div class="stats-row">
                                  <div class="stat-item" 
                                    :style="{ background: `linear-gradient(135deg, ${grandchild.color?.hexcolor || '#667eea'}10 0%, ${grandchild.color?.hexcolor || '#667eea'}05 100%)` }">
                                    <i class="fas fa-users" :style="{ color: grandchild.color?.hexcolor || '#667eea' }"></i>
                                    <span class="stat-value" :style="{ color: grandchild.color?.hexcolor || '#667eea' }">
                                      {{ getEmployeeCount(grandchild) }}
                                    </span>
                                    <span class="stat-label">Employees</span>
                                  </div>
                                  <div class="stat-item" 
                                    :style="{ background: `linear-gradient(135deg, ${grandchild.color?.hexcolor || '#667eea'}10 0%, ${grandchild.color?.hexcolor || '#667eea'}05 100%)` }">
                                    <i class="fas fa-sitemap" :style="{ color: grandchild.color?.hexcolor || '#667eea' }"></i>
                                    <span class="stat-label">Sub-departments</span>
                                    <span class="stat-value" :style="{ color: grandchild.color?.hexcolor || '#667eea' }">
                                      {{ getChildDepartments(grandchild.id).length }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-muted py-5">
            <i class="fas fa-info-circle fa-3x mb-3"></i>
            <p>No organization data available</p>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrganizationModal',
  props: {
    isVisible: {
      type: Boolean,
      required: true,
      default: false
    },
    organizationData: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      zoomLevel: 1,
      expandedDepts: {}
    };
  },
  computed: {
    rootDepartments() {
      return this.organizationData.filter(dept => !dept.parent_id);
    }
  },
  watch: {
    organizationData: {
      handler(newData) {
        // Initialize all departments as expanded
        if (newData && newData.length > 0) {
          const expanded = {};
          newData.forEach(dept => {
            expanded[dept.id] = true;
          });
          this.expandedDepts = expanded;
        }
      },
      immediate: true
    }
  },
  emits: ['close'],
  methods: {
    closeModal() {
      this.$emit('close');
    },
    handleOverlayClick() {
      this.closeModal();
    },
    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel += 0.1;
      }
    },
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel -= 0.1;
      }
    },
    resetZoom() {
      this.zoomLevel = 1;
    },
    getChildDepartments(parentId) {
      return this.organizationData.filter(dept => dept.parent_id === parentId);
    },
    getEmployeeCount(department) {
      // Use employees array length if available, otherwise use number_of_employees
      if (department.employees && Array.isArray(department.employees)) {
        return department.employees.length;
      }
      return department.number_of_employees || 0;
    },
    toggleExpand(deptId) {
      this.expandedDepts[deptId] = !this.expandedDepts[deptId];
      // Force reactivity
      this.expandedDepts = { ...this.expandedDepts };
    },
    hasGrandchildren(deptId) {
      const children = this.getChildDepartments(deptId);
      return children.some(child => this.getChildDepartments(child.id).length > 0);
    }
  }
};
</script>

<style scoped>
.modal {
  z-index: 1050;
}

.modal-dialog {
  margin: 0;
  max-width: 100%;
  height: 100vh;
}

.modal-content {
  height: 100%;
  border-radius: 0;
  border: none;
  background: white;
}

.modal-header {
  background: #F5F5F5;
  color: #2c3e50;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #dee2e6;
}

.zoom-controls .btn {
  color: #495057;
  border-color: #dee2e6;
  padding: 0.25rem 0.5rem;
  background: white;
}

.zoom-controls .btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #212529;
}

.zoom-level {
  color: #495057;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
  font-size: 0.875rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
  opacity: 0.5;
  cursor: pointer;
  padding: 0;
  width: 1.5em;
  height: 1.5em;
  filter: none;
}

.btn-close:hover {
  opacity: 0.75;
}

.modal-body {
  padding: 2rem;
  overflow: auto;
  background: white;
  position: relative;
}

.hierarchy-container {
  transform-origin: top left;
  transition: transform 0.3s ease;
  min-width: max-content;
  padding: 2rem;
  margin: 0;
}

.organization-tree {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  flex-wrap: nowrap;
}

.organization-tree > .department-card-wrapper::before {
  display: none;
}

.department-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

.department-card-wrapper::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  width: 3px;
  height: 20px;
  background: #667eea;
  transform: translateX(-50%);
}

.department-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 320px;
  max-width: 380px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  flex-shrink: 0;
}

.department-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.department-info {
  flex: 1;
}

.department-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.2rem 0;
  line-height: 1.3;
}

.department-code {
  font-size: 0.7rem;
  color: #6c757d;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
}

.card-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 10px;
}

.badge-type {
  color: white;
}

.card-body {
  padding: 1.25rem;
}

.info-row {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #495057;
  min-width: 0;
}

.info-item i {
  width: 16px;
  flex-shrink: 0;
}

.info-label {
  font-weight: 600;
  color: #6c757d;
  white-space: nowrap;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
}

.stat-item i {
  font-size: 1rem;
  flex-shrink: 0;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.65rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.children-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 0;
  position: relative;
  width: 100%;
}

.children-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 3px;
  height: 40px;
  transform: translateX(-50%);
}

.connector-line {
  width: 3px;
  height: 40px;
  margin-bottom: 0;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.children-grid {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  flex-wrap: nowrap;
  justify-content: flex-start;
  position: relative;
  overflow-x: auto;
  width: 100%;
  margin-top: 40px;
  padding-top: 20px;
}

.children-grid.horizontal-grid {
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: flex-start;
  padding-bottom: 1rem;
}

.children-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, #667eea 0%, #667eea 100%);
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  background: #F5F5F5;
}

.btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 600;
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  border: none;
  color: #fff;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Scrollbar styling */
.modal-body::-webkit-scrollbar,
.children-grid::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.modal-body::-webkit-scrollbar-track,
.children-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-body::-webkit-scrollbar-thumb,
.children-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
}

.modal-body::-webkit-scrollbar-thumb:hover,
.children-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

@media (max-width: 768px) {
  .department-card {
    min-width: 280px;
    max-width: 320px;
  }

  .children-grid {
    flex-direction: column;
    gap: 1.5rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .hierarchy-container {
    padding: 1rem;
  }

  .zoom-controls {
    display: none;
  }
}
</style>