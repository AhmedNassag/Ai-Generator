<template>
  <main-page 
    ref="page" 
      :isFlipped="isFlipped" 
      :mainPage="$t('phishinggroup.Awarness')" 
      :mainSubPage="$t('phishinggroup.Campgain')"
      :subPage="$t('phishinggroup.Configuartion')" 
      :titlePage="$t('phishinggroup.Group')"
  >
    <template #datatable>
      <DataTable
        v-permission:show
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="{}"
        :editItem="editItem"
        :openForm="openForm"
        :hideActions="hideActions"
        :filters="FilterData"
        :action="false"
        :hideActionsColumn="true"
        :hideAllActionsColumnn="true"
      >
        <template #phishinggroup.Name="{ item }">
          {{ item.name }}
        </template>
        
        <template #action="{ item }">  
          <a
            href="javascript:void(0)"
            style="padding: 10px"
            title="Mange"
            class="dropdown-item"
            v-permission:show
            @click="openModal(item)"
          >
            <i class="icofont icofont-paper"></i> {{ $t("phishinggroup.Mange") }}
          </a>
        </template>
      </DataTable>
    </template>

    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="false"
      />
    </template>
  </main-page>

  <!-- Group Details Modal -->
  <v-dialog 
    v-model="viewModal" 
    max-width="1360px" 
    persistent
    content-class="figma-dialog-wrapper"
  >
    <div class="figma-dialog">
      <!-- Header -->
      <div class="figma-dialog-header">
        <h2 class="figma-dialog-title">Group Management</h2>
        <button class="figma-close-button" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="figma-dialog-content">
        <div class="content-wrapper">
          <!-- Left Column - Employees In Group -->
          <div class="left-column">
            <div class="column-header">
              <h3 class="column-title">Employees In Group</h3>
              <div class="total-badge">
                <span class="total-label">Total Selected:</span>
                <span class="total-count">{{ selectedEmployees.length }}</span>
              </div>
            </div>

            <div class="employees-list" 
              @drop="dropEmployee($event)"
              @dragover.prevent
              @dragenter.prevent>
              <div 
                v-for="(employee, index) in selectedEmployees" 
                :key="'selected-'+employee.id" 
                class="employee-card"
              >
                <div class="employee-info">
                  <div class="employee-avatar">{{ employee.full_name ? employee.full_name.substring(0, 2).toUpperCase() : 'KT' }}</div>
                  <div class="employee-details">
                    <div class="employee-name">{{ employee.full_name || '' }}</div>
                    <div class="employee-department">{{ employee.department_name || getEmployeeDepartment(employee.id) || 'Governance' }}</div>
                  </div>
                </div>
                <button 
                  class="remove-button"
                  @click.stop="removeEmployee(index)"
                >
                  <v-icon color="#DC2626" size="20">mdi-close</v-icon>
                </button>
              </div>

              <!-- Empty state -->
              <div v-if="selectedEmployees.length === 0" class="empty-state">
                <div class="empty-text">No employees selected</div>
              </div>
            </div>
          </div>

          <!-- Right Column - Department Employees -->
          <div class="right-column">
            <div class="column-header">
              <h3 class="column-title">Department Employees</h3>
            </div>

            <div class="departments-list">
              <div 
                v-for="(department, index) in selectedItem.departments" 
                :key="department.id"
                class="department-item"
              >
                <!-- Department Header -->
                <button 
                  class="department-header"
                  @click="toggleDepartment(department)"
                >
                  <span class="department-name">{{ department.name }} ({{ department.employees ? department.employees.length : 0 }})</span>
                  <v-icon :class="{ 'rotated': department.expanded }">
                    {{ department.expanded ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                  </v-icon>
                </button>

                <!-- Department Employees -->
                <div 
                  v-if="department.expanded"
                  class="department-employees"
                >
                  <template v-if="department.employees && department.employees.length > 0">
                    <div 
                      v-for="employee in department.employees" 
                      :key="employee.id" 
                      class="dept-employee-card"
                      draggable="true"
                      @dragstart="dragStart($event, employee)"
                      @click="selectEmployee(employee)"
                      :class="{ 'is-selected': isEmployeeSelected(employee.id) }"
                    >
                      <div class="dept-employee-info">
                        <div class="dept-employee-avatar">{{ employee.full_name ? employee.full_name.substring(0, 2).toUpperCase() : 'KT' }}</div>
                        <div class="dept-employee-name">{{ employee.full_name || '' }}</div>
                      </div>
                      <v-icon 
                        v-if="isEmployeeSelected(employee.id)"
                        color="#000"
                        size="20"
                      >
                        mdi-check-circle
                      </v-icon>
                    </div>
                  </template>
                  <template v-else>
                    <div class="empty-department">
                      No employees in this department
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="figma-dialog-footer">
        <button 
          class="figma-button figma-button-cancel"
          @click="closeModal"
        >
          Cancel
        </button>
        <button 
          class="figma-button figma-button-save"
          @click="saveSelectedEmployees"
          v-permission:addUsers
          :disabled="selectedEmployees.length === 0"
        >
          Save
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import phishinggroup from "@/API/PhishingGroup/PhishingGroup";
import department from "@/API/Department/Department";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Auth from '@/API/Auth';
import Swal from 'sweetalert2';

export default {
  components: {
    MainPage,
    Form,
    DataTable,
  },

  setup() {
    const api = new phishinggroup();
    const apiParams = { filter: "" };
    const tableColumns = [];
    const fromFields = [];
    const departmentApi = new department(); 

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      departmentApi,
    };
  },
 
  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      selectedItem: {},
      viewModal: false,
      departments: [],
      loadingDepartments: false,
      selectedEmployee: null,
      selectedEmployees: [],
      draggedEmployee: null,
      activeDepartment: null,
      // FilterData: [
      //   {
      //   title: "Users Group",
      //   key: 'user_ids',
      //   type: 'string',
      //   data: 'User',
      //   filterType: 'filterIn'
      // }
      // ],
    };
  },

  computed:{
    hideActions() {
      return (row) => ({
        edit: true,
        delete: true,
      });
    },

  },

  created() {
    this.tableColumns = [
      { 
        title: this.$t("phishinggroup.name"), 
        data: "name", 
        defaultContent: "N/A" 
      }, 
      { 
        id: "action",
        title: this.$t("phishinggroup.Action"),
        data: "", 
        defaultContent: "N/A" 
      },
      
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("phishinggroup.Name"),
        type: "text",
        rules: "required",
        description: this.$t("phishinggroup.Please enter name"),
        col: 6,
      }
    ];
  },

  methods: {
    // Utility Methods
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString();
    },

    // Employee Selection Methods
    selectEmployee(employee) {
      this.selectedEmployee = employee;
    },

    isEmployeeSelected(employeeId) {
      return this.selectedEmployees.some(emp => emp.id === employeeId);
    },

    getEmployeeDepartment(employeeId) {
      if (!this.selectedItem.departments) return '';
      
      for (const department of this.selectedItem.departments) {
        const foundEmployee = department.employees.find(emp => emp.id === employeeId);
        if (foundEmployee) return department.name;
      }
      return '';
    },

    // Drag & Drop Methods
    dragStart(event, employee) {
      this.draggedEmployee = employee;
      event.dataTransfer.setData('text/plain', employee.id);
      event.dataTransfer.effectAllowed = 'move';
    },

    dropEmployee(event) {
      event.preventDefault();
      if (this.draggedEmployee) {
        const exists = this.selectedEmployees.some(
          emp => emp.id === this.draggedEmployee.id
        );
        
        if (!exists) {
          const department = this.selectedItem.departments.find(dept => 
            dept.employees.some(emp => emp.id === this.draggedEmployee.id)
          );
          
          const employeeWithDepartment = {
            ...this.draggedEmployee,
            department_name: department ? department.name : ''
          };
          
          this.selectedEmployees.push(employeeWithDepartment);
        }
        this.draggedEmployee = null;
      }
    },

    removeEmployee(index) {
      this.selectedEmployees.splice(index, 1);
      this.$forceUpdate();
    },

    // Modal Methods
    async openModal(selectedRow) {
      Swal.fire({
        title: this.$t("phishinggroup.Loading"),
        html: this.$t("phishinggroup.Please wait while we load the group data"),
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        this.selectedItem = { ...selectedRow };
        this.selectedEmployee = null;
        
        await this.fetchDepartments(selectedRow.id);
        
        if (selectedRow.user_ids?.length > 0) {
          this.selectedEmployees = [];
          
          this.selectedItem.departments.forEach(department => {
            department.employees.forEach(employee => {
              if (selectedRow.user_ids.includes(employee.id)) {
                this.selectedEmployees.push({
                  ...employee,
                  department_name: department.name
                });
              }
            });
          });
        } else {
          this.selectedEmployees = [];
        }
        
        this.viewModal = true;
        Swal.close();
      } catch (error) {
        console.error("Error opening modal:", error);
        Swal.fire({
          icon: 'error',
          title:  this.$t("phishinggroup.Error"),
          text: this.$t("phishinggroup.Failed to load group data")
        });
      }
    },

    closeModal() {
      this.viewModal = false;
      this.selectedEmployee = null;
      this.selectedEmployees = [];
      this.activeDepartment = null;
    },

    // Data Methods
    async fetchDepartments(groupId) {
      this.loadingDepartments = true;
      try {
        this.departments = await this.departmentApi.getAll({ 
          select: 'id|name', 
          with: 'employees' 
        });
        this.selectedItem.departments = this.departments;
      } catch (error) {
        console.error("Error fetching departments:", error);
        throw error;
      } finally {
        this.loadingDepartments = false;
      }
    },

    toggleDepartment(department) {
        if (this.activeDepartment === department.id) {
      department.expanded = false;
      this.activeDepartment = null;
    } else {
      // أغلق جميع الأقسام أولاً
      this.closeAllDepartments();
      
      // افتح القسم الجديد
      department.expanded = true;
      this.activeDepartment = department.id;
    }
      this.$forceUpdate(); 
    },
     closeAllDepartments() {
    if (this.selectedItem.departments) {
      this.selectedItem.departments.forEach(dept => {
        dept.expanded = false;
      });
    }
    this.activeDepartment = null;
  },

    // CRUD Operations
    async saveSelectedEmployees() {
      try {
        this.viewModal = false;
        Swal.fire({
          title: this.$t("phishinggroup.Saving"),
          html: this.$t("phishinggroup.Updating group Employees"),
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        const formData = new FormData();
        formData.append('groupId', this.selectedItem.id);
        
        this.selectedEmployees.forEach((employee, index) => {
          formData.append(`user_ids[${index}]`, employee.id);
        });

        const authToken = await Auth.getAuthToken();
        if (!authToken) throw new Error('Authentication required');
        
     
         const response = this.api.addUsers(formData);

        Swal.fire({
          icon: 'success',
          title: this.$t("phishinggroup.Success"),
          text: this.$t("phishinggroup.Group Employees updated successfully"),
          timer: 2000,
          showConfirmButton: false
        });
        
        this.$refs.table.refreshTable();
        this.closeModal();
      } catch (error) {
        this.viewModal = true;
        console.error("Error saving group employees:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update group employees'
        });
      }
    },

    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
      this.viewModal = false;
    },
    
    async deleteItem(item) {
      this.viewModal = false;
      await this.api.delete(item.id);
      this.$refs.table.refreshTable();
    }
  },
};
</script>

<style scoped>
/* ============================================
   FIGMA DIALOG WRAPPER
   ============================================ */
.figma-dialog-wrapper {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.figma-dialog {
  width: 100%;
  max-width: 1360px;
  background: #f5f5f5;
  padding: 4px 18px;
  border-radius: 16px !important;
  overflow: hidden;
  position: relative;
}

/* ============================================
   DIALOG HEADER
   ============================================ */
.figma-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 15px 0 !important;
}

.figma-dialog-title {
  font-size: 16px;
  font-weight: 700;
  color: #000;
  margin: 0;
  line-height: 1.2;
}

.figma-close-button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #404040;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.figma-close-button:hover {
  color: #000000;
}

/* ============================================
   DIALOG CONTENT
   ============================================ */
.figma-dialog-content {
  padding: 7px 15px !important;
  max-height: 70vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  margin-top: 8px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 500px;
}

/* ============================================
   COLUMNS
   ============================================ */
.left-column,
.right-column {
  background-color: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ============================================
   COLUMN HEADERS
   ============================================ */
.column-header {
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #FAFAFA;
}

.column-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.total-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #F3F4F6;
  padding: 4px 12px;
  border-radius: 20px;
}

.total-label {
  font-size: 13px;
  color: #6B7280;
}

.total-count {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  background-color: #FFFFFF;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* ============================================
   EMPLOYEES LIST (LEFT COLUMN)
   ============================================ */
.employees-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #FAFAFA;
}

.employee-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.employee-card:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.employee-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #D0B5E3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #43235C;
  flex-shrink: 0;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  line-height: 1.4;
}

.employee-department {
  font-size: 12px;
  color: #6B7280;
  line-height: 1.4;
}

.remove-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.remove-button:hover {
  opacity: 0.7;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.empty-text {
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
}

/* ============================================
   DEPARTMENTS LIST (RIGHT COLUMN)
   ============================================ */
.departments-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: #FAFAFA;
}

.department-item {
  border-bottom: 1px solid #E5E7EB;
}

.department-item:last-child {
  border-bottom: none;
}

.department-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #FFFFFF;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.department-header:hover {
  background-color: #F9FAFB;
}

.department-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.department-header .v-icon {
  transition: transform 0.2s;
  color: #6B7280;
  font-size: 20px;
}

.department-header .v-icon.rotated {
  transform: rotate(0deg);
}

.department-employees {
  padding: 8px 16px 16px 16px;
  background-color: #FAFAFA;
}

.dept-employee-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.dept-employee-card:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dept-employee-card.is-selected {
  background-color: #F0F0F0;
  border-color: #F0F0F0;
}

.dept-employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.dept-employee-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #D0B5E3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #43235C;
  flex-shrink: 0;
}

.dept-employee-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.empty-department {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: #9CA3AF;
}

/* ============================================
   DIALOG FOOTER
   ============================================ */
.figma-dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 24px !important;
}

.figma-button {
  height: 23px;
  padding: 0 24px !important;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px !important;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-transform: none;
}

.figma-button-cancel {
  background: transparent;
  color: #6E3894 !important;
  border: 1px solid #6E3894 !important;
}

.figma-button-cancel:hover {
  background: #f3e8ff;
}

.figma-button-save {
  background: #6E3894 !important;
  color: #FFFFFF !important;
}

.figma-button-save:hover:not(:disabled) {
  background: #5b2d7a !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(110, 56, 148, 0.3);
}

.figma-button-save:disabled {
  background: #D1D5DB !important;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ============================================
   SCROLLBAR STYLING
   ============================================ */
.figma-dialog-content::-webkit-scrollbar,
.employees-list::-webkit-scrollbar,
.departments-list::-webkit-scrollbar {
  width: 6px;
}

.figma-dialog-content::-webkit-scrollbar-track,
.employees-list::-webkit-scrollbar-track,
.departments-list::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 3px;
}

.figma-dialog-content::-webkit-scrollbar-thumb,
.employees-list::-webkit-scrollbar-thumb,
.departments-list::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

.figma-dialog-content::-webkit-scrollbar-thumb:hover,
.employees-list::-webkit-scrollbar-thumb:hover,
.departments-list::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .figma-dialog-content {
    padding: 12px !important;
  }
}

@media (max-width: 768px) {
  .figma-dialog {
    padding: 4px 12px;
  }

  .figma-dialog-header {
    padding: 12px 12px 0 !important;
  }

  .figma-dialog-content {
    padding: 8px 12px !important;
  }

  .figma-dialog-footer {
    padding: 12px 16px !important;
  }

  .content-wrapper {
    min-height: auto;
  }
}

@media (max-width: 540px) {
  .figma-dialog {
    width: calc(100vw - 32px);
    max-width: 1360px;
  }
  
  .figma-button {
    font-size: 13px;
    padding: 0 18px !important;
  }
}
</style>