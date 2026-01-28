<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('role.configuring')" :subPage="$t('role.title')"
    :titlePage="$t('role.title')">
    <template #datatable>
      <div class="main-container">
        <div class="row" v-permission:show>
          <!-- Select Department -->
          <div class="col-12 mb-4 vh">
            <div class="form-group card-role">
              <label for="department_id" class="form-label-redesign">
                {{ $t('role.select_department') }}
                <span class="text-danger">*</span>
              </label>
              <LazySelectField 
                name="department_id" 
                v-model="newItem.department_id" 
                options="Department"
                option-label="name" 
                option-value="id" 
                :placeholder="$t('role.select_department')" 
                :apiParams="{ with: 'jobs' }"
                clearable
                :onUpdate="getJobs"
              />
              <div class="text-danger mt-1" v-if="errors.department_id">{{ errors?.department_id[0] }}</div>
            </div>
          </div>
   
          <!-- Select Job -->
          <div class="col-md-6 mb-4" v-show="newItem.department_id && jobs?.length > 0">
            <div class="card-role">
              <label class="form-label-redesign">
                {{ $t('role.select_job') }}
                <span class="text-danger">*</span>
              </label>
              <hr />
              <div class="job-buttons-wrapper">
                <div v-for="job in jobs" :key="job.id">
                  <div>
                    <input @change="getPermissionsInRole(job.id)" :id="job.name + job.id" type="radio" name="job_id"
                      :value="job.id" v-model="newItem.job_id">
                    <label class="me-1" :for="job.name + job.id">{{ job.name }}</label>
                  </div>
                </div>
              </div>
              <div class="text-danger mt-2" v-if="errors.job_id">{{ errors?.job_id[0] }}</div>
            </div>
          </div>
   
          <!-- Department Section -->
          <div class="col-md-6 mb-4" v-show="newItem.department_id && jobs?.length > 0">
            <div class="department-section-redesign card-role">
              <div class="department-header-redesign">
                <span class="department-title-redesign">{{ $t('role.department') }}</span>
                <div class="department-legend-redesign">
                  <div class="legend-item-redesign">
                    <span class="legend-dot legend-dot--default"></span>
                    <span class="legend-text">{{ $t('role.default') }}</span>
                  </div>
                  <div class="legend-item-redesign">
                    <span class="legend-dot legend-dot--custom"></span>
                    <span class="legend-text">{{ $t('role.custom') }}</span>
                  </div>
                </div>
              </div>
              <hr />
   
              <div class="department-badges-redesign" v-if="allDeparmentsInJob && allDeparmentsInJob.length > 0">
                <span v-for="department in allDeparmentsInJob" :key="department.id" class="department-badge-redesign"
                  :class="{ 'department-badge-redesign--custom': colonDepartmentSet.has(department.id) }">
                  {{ department.name }}
                </span>
              </div>
            </div>
          </div>
          <!-- Permissions Section -->
          <section v-show="newItem.department_id && newItem.job_id">
            <div class="permissions-section-redesign">
              <div class="permissions-header-redesign">
                <label class="form-label-redesign">
                  {{ $t('role.permissions') }}
                  <span class="text-danger">*</span>
                </label>
                <div class="select-all-wrapper-redesign">
                  <input type="checkbox" id="selectAll" v-model="selectAll" @change="selectAllPermissions"
                    class="select-all-check">
                  <label for="selectAll" class="select-all-label-redesign">{{ $t('role.select_all') }}</label>
                </div>
              </div>
   
              <!-- Permission Accordion -->
              <div class="accordion-redesign">
                <div class="accordion-item-redesign" v-for="(permission, permIndex) in allPermissions"
                  :key="permission.id">
                  <!-- Accordion Header -->
                  <div class="accordion-header-redesign" @click="toggleAccordion(permission.name)">
                    <div class="accordion-title-wrapper-redesign">
                      <i class="accordion-icon-redesign fas"
                        :class="expandedModules.has(permission.name) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                      <span class="accordion-title-redesign">{{ $t(`role.${permission.name}`) }}</span>
                    </div>
                    <div class="select-module-wrapper-redesign" @click.stop>
                      <input type="checkbox" :id="permission.name + '_module'"
                        :checked="isModuleFullySelected(permission.name)"
                        @change="toggleModulePermissions(permission.name)" class="select-module-check">
                      <label :for="permission.name + '_module'" class="select-module-label-redesign">
                        {{ $t('role.select_all') }}
                      </label>
                    </div>
                  </div>
   
                  <!-- Accordion Body -->
                  <div v-if="expandedModules.has(permission.name)" class="accordion-body-redesign">
                    <!-- Controller permissions -->
                    <div class="permission-row-redesign"
                      v-for="(controller, index) in Object.keys(permission.controllers)" :key="index">
                      <div class="controller-name-redesign">
                        {{ $t(`role.${controller}`) }}
                      </div>
                      <div class="permission-checkboxes-redesign">
                        <div class="permission-checkbox-item-redesign"
                          v-for="(action, actionIndex) in permission.controllers[controller]" :key="actionIndex">
                          <input class="permission-check-input" :id="permission.name + controller + action"
                            type="checkbox" :checked="isPermissionSelected(permission.name, controller, action)"
                            @change="togglePermission(permission.name, controller, action)">
                          <label class="permission-check-label" :for="permission.name + controller + action">
                            {{ $t(`role.${action}`) }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
   
              <div class="text-danger mt-2" v-if="errors.permissions">{{ errors?.permissions[0] }}</div>
            </div>
          </section>
          <!-- Action Buttons -->
          <div class="action-buttons-redesign" v-show="newItem.department_id && newItem.job_id">
            <button type="button" class="btn-action-redesign btn-action-save" v-permission:update @click="save">
              {{ $t('role.save') }}
            </button>
            <button type="button" class="btn-action-redesign btn-action-apply" v-permission:update
              @click="openApplyToAllModal">
              {{ $t('role.apply_to_all') }}
            </button>
          </div>
        </div>
   </div>
   </template>
   
  </main-page>

  <!-- Modal for Apply to All -->
  <v-dialog v-model="showModalApplyToAll" max-width="1000px">
    <v-card class="modal-redesign">
      <!-- Modal Header -->
      <v-card-title class="modal-header-redesign">
        <div class="modal-header-content">
          <div class="modal-title-section">
            <h2 class="modal-title">{{ $t('role.apply_role_for_departments') || 'Apply Role For Departments' }}</h2>
            <p class="modal-subtitle">{{ $t('role.apply_to_all_description') || 'Apply This Role To All Departments, Unselected Departments Will Have Default Permissions.' }}</p>
          </div>
          <v-btn icon @click="showModalApplyToAll = false" class="modal-close-btn">
            <i class="fas fa-times"></i>
          </v-btn>
        </div>
      </v-card-title>

      <!-- Modal Body -->
      <v-card-text class="modal-body-redesign">
        <!-- Counter and Select All -->
        <div class="modal-controls">
          <div class="department-counter">
            {{ newItem.department_ids.length }} / {{ copyOfAllDeparmentsInJobWithDefaultRole.length }} {{
              $t('role.departments_selected') || 'Departments Selected' }}
          </div>
          <div class="select-all-control">
            <input type="checkbox" id="selectAllDepartments" class="select-all-checkbox-modal"
              v-model="selectAllDepartments" @change="toggleAllDepartments">
            <label for="selectAllDepartments" class="select-all-label-modal">
              {{ $t('role.select_all') || 'Select All' }}
            </label>
          </div>
        </div>

        <!-- Department Cards Grid -->
        <div class="department-cards-grid"
          v-if="copyOfAllDeparmentsInJobWithDefaultRole && copyOfAllDeparmentsInJobWithDefaultRole.length > 0">
          <div v-for="department in copyOfAllDeparmentsInJobWithDefaultRole" :key="department.id"
            class="department-card-wrapper">
            <input type="checkbox" :id="'dept_modal_' + department.id" class="department-checkbox-hidden"
              :value="department.id" v-model="newItem.department_ids">
            <label :for="'dept_modal_' + department.id" class="department-card" :class="{
              'department-card--selected': isDepartmentSelected(department.id),
              'department-card--current': department.id === newItem.department_id
            }">
              <span class="department-card-name">{{ department.name }}</span>
              <span v-if="department.id === newItem.department_id" class="current-label">{{ $t('role.current') ||
                'Current' }}</span>
            </label>
          </div>
        </div>

        <!-- No Departments Message -->
        <div v-else class="no-departments-modal">
          <p>{{ $t('role.no_departments_available') || 'No departments available' }}</p>
        </div>
      </v-card-text>

      <!-- Modal Footer -->
      <v-card-actions class="modal-footer-redesign">
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="showModalApplyToAll = false" class="btn-modal-cancel">
          {{ $t('role.cancel') || 'Cancel' }}
        </v-btn>
        <v-btn @click="applyToAll" :disabled="newItem.department_ids.length === 0" class="btn-modal-apply">
          {{ $t('role.apply') || 'Apply' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
// Importing necessary components and API modules
import role from "@/API/Role/Role";
import department from "@/API/Department/Department";
import job from "@/API/Job/Job";
import permission from "@/API/Permission/Permission";
import LazySelectField from "@/components/LazySelectField.vue";
import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
import MainPage from "@/components/MainPage.vue";
import Auth from "@/API/Auth";
import Menu from "@/core/data/menu.json";
import { ref } from "vue";
import { all } from "axios";
export default {
  components: {
    LazySelectField,
    MainPage,  // Main page layout component
  },

  setup() {

    // Initialize API and other required properties
    const api = new role();
    const departmentApi = new department();
    const jobApi = new job();
    const permissionApi = new permission();
    const authUser = Auth.USER;




    // Return properties for setup to be used in the template
    return {
      api,
      departmentApi,
      jobApi,
      permissionApi,
      selectedAllPermissions: [],
      authUser,

    };
  },
  async mounted() {
    this.allDepartments = await this.departmentApi.getAll({ with: 'jobs' });
    this.allPermissions = await this.permissionApi.getAll();
    this.initializePermissionStructure();
    this.allJobs = await this.jobApi.getAll();
    this.allRoles = await this.api.getAll();

    // Build lookup caches for O(1) access
    this.buildDepartmentCache();
    this.buildJobCache();

    // Convert permissions once for all selection
    this.selectedAllPermissions = this.convertPermissions(this.allPermissions, true);
  },

  beforeUnmount() {
    // Clean up all resources and caches
    this.selectedPermissionsMap.clear();
    this.permissionsByModule = {};
    this.colonDepartmentSet.clear();
    this.selectedDepartmentIdsSet.clear();
    this.departmentIdMapCache.clear();
    this.jobIdMapCache.clear();
  },
  data() {
    return {
      showModalApplyToAll: false,
      selectAllDepartments: false,
      currentSelectedRole: null,
      errors: {},
      newItem: {
        permissions: [],
        unselected_department: [],
      }, // Data object to store the currently selected item for editing or new item
      jobs: [],
      allDepartments: [],
      allJobs: [],
      allRoles: [],
      allPermissions: [],
      colonJobRoles: [], // get coloned job roles
      allDeparmentsInJob: [],
      allDeparmentsInJobWithDefaultRole: [],
      copyOfAllDeparmentsInJobWithDefaultRole: [],
      colonDepartmentsRole: [],
      colonDepartmentSet: new Set(), // Fast lookup for colon departments
      selectedDepartmentIdsSet: new Set(), // Fast lookup for selected department IDs

      selectAll: false,
      expandedModules: new Set(), // Track which accordions are expanded - now supports multiple
      permissionsByModule: {}, // Cached permissions organized by module
      selectedPermissionsMap: new Map(), // Fast lookup for selected permissions
      isLoadingPermissions: false,

      // Caching for better performance
      departmentIdMapCache: new Map(), // Cache for quick department lookup by ID
      jobIdMapCache: new Map(), // Cache for quick job lookup by ID

    };
  },

  computed: {
    // Simple check if all permissions are selected
    isAllPermissionsSelected() {
      if (!this.selectedAllPermissions || this.newItem.permissions.length === 0) return false;
      return this.newItem.permissions.length === this.selectedAllPermissions.length;
    },

    // Computed property for checking if department is selected (uses Set for O(1))
    isDepartmentSelected() {
      return (departmentId) => this.selectedDepartmentIdsSet.has(departmentId);
    }
  },

  watch: {
    'newItem.department_ids': {
      handler(newIds) {
        // Update Set for O(1) lookups
        this.selectedDepartmentIdsSet.clear();
        if (Array.isArray(newIds)) {
          newIds.forEach(id => this.selectedDepartmentIdsSet.add(id));
        }
        this.updateUnselectedDepartments();
      },
      deep: true
    }
  },



  methods: {
    // Build department lookup cache for O(1) access
    buildDepartmentCache() {
      this.departmentIdMapCache.clear();
      if (this.allDepartments) {
        this.allDepartments.forEach(dept => {
          this.departmentIdMapCache.set(dept.id, dept);
        });
      }
    },

    // Build job lookup cache for O(1) access
    buildJobCache() {
      this.jobIdMapCache.clear();
      if (this.allJobs) {
        this.allJobs.forEach(job => {
          this.jobIdMapCache.set(job.id, job);
        });
      }
    },

    // Open modal and select all departments by default
    openApplyToAllModal() {
      // Check if selected department exists in colonDepartmentsRole
      const selectedDept = this.colonDepartmentsRole?.find(dept => dept.id === this.newItem.department_id);

      if (selectedDept) {
        // Push selected department to the top
        this.copyOfAllDeparmentsInJobWithDefaultRole = [selectedDept, ...this.allDeparmentsInJobWithDefaultRole];
      } else {
        // Use the default list if no colon department is selected
        this.copyOfAllDeparmentsInJobWithDefaultRole = [...this.allDeparmentsInJobWithDefaultRole];
      }

      // Select all departments by default (including the selected colon department if exists)
      this.newItem.department_ids = this.copyOfAllDeparmentsInJobWithDefaultRole.map(dept => dept.id);
      this.newItem.unselected_department = [];
      this.selectAllDepartments = true;
      this.showModalApplyToAll = true;
    },

    // Toggle all departments selection
    toggleAllDepartments() {
      const allIds = this.copyOfAllDeparmentsInJobWithDefaultRole.map(dept => dept.id);

      if (this.selectAllDepartments) {
        this.newItem.department_ids = allIds;
        this.newItem.unselected_department = [];
        // Update Set
        this.selectedDepartmentIdsSet.clear();
        allIds.forEach(id => this.selectedDepartmentIdsSet.add(id));
      } else {
        this.newItem.department_ids = [];
        this.newItem.unselected_department = allIds;
        this.selectedDepartmentIdsSet.clear();
      }
    },

    // Update unselected departments whenever department_ids changes
    updateUnselectedDepartments() {
      // Use the copy list that includes the colon department if it was added
      const departmentList = this.copyOfAllDeparmentsInJobWithDefaultRole.length > 0
        ? this.copyOfAllDeparmentsInJobWithDefaultRole
        : this.allDeparmentsInJobWithDefaultRole;

      // Use Set for O(1) filtering
      const unselected = [];
      for (const dept of departmentList) {
        if (!this.selectedDepartmentIdsSet.has(dept.id)) {
          unselected.push(dept.id);
        }
      }

      this.newItem.unselected_department = unselected;

      // Update selectAllDepartments checkbox state
      this.selectAllDepartments = this.newItem.department_ids.length === departmentList.length && departmentList.length > 0;
    },

    // Apply role to selected departments
    async applyToAll() {
      if (this.newItem.department_ids.length === 0) {
        notify({
          title: this.$t('common.warning') || 'Warning',
          text: 'Please select at least one department to apply the role.',
          type: 'warn',
          duration: 3000
        });
        return;
      }

      this.showModalApplyToAll = false;
      const isValid = await this.validateBeforeSubmit();
      if (!isValid) return;
      try {
        const response = await this.api.applyToAllDepartments({
          data: JSON.stringify(this.newItem)
        });
        this.allRoles = await this.api.getAll();
        this.getDepartmentsJobAppliedDefaultRole(this.newItem.job_id);
        this.updateUnselectedDepartments();
        this.getPermissionsInRole(this.newItem.job_id);

        console.log(response);


      } catch (error) {
        console.error('Error applying role to departments:', error);

      }
    },

    getColonJobRoles(job_id) {
      // Use filter only once and cache result
      this.colonJobRoles = this.allRoles.filter(role => role.job_id === job_id && role.type === 'colon');
    },

    getDepartmentsJobAppliedDefaultRole(job_id) {
      this.getColonJobRoles(job_id);

      // Build Set of department IDs in colon roles for O(1) lookup
      const colonDeptIds = new Set();
      this.colonJobRoles.forEach(role => {
        if (role.department_ids) {
          role.department_ids.forEach(id => colonDeptIds.add(id));
        }
      });

      // Clear and rebuild Sets
      this.colonDepartmentSet.clear();
      this.colonDepartmentsRole = [];
      this.allDeparmentsInJobWithDefaultRole = [];

      // Filter departments in single pass using cached data
      this.allDeparmentsInJob = this.allDepartments?.filter(dep => dep.job_ids?.includes(job_id)) || [];

      // Single iteration to categorize departments
      this.allDeparmentsInJob.forEach(dep => {
        if (colonDeptIds.has(dep.id)) {
          this.colonDepartmentsRole.push(dep);
          this.colonDepartmentSet.add(dep.id);
        } else {
          this.allDeparmentsInJobWithDefaultRole.push(dep);
        }
      });
    },
    isColonDepartmentRole(department_id) {
      // Use Set for O(1) lookup instead of array search
      return this.colonDepartmentSet.has(department_id);
    },
    findDepartmentName(departmentId) {
      // Use cache for O(1) lookup instead of find()
      const department = this.departmentIdMapCache.get(departmentId);
      return department ? department.name : '';
    },
    // Initialize permission structure for better performance
    initializePermissionStructure() {
      this.permissionsByModule = {};
      for (const module of this.allPermissions) {
        this.permissionsByModule[module.name] = {
          controllers: module.controllers,
          totalCount: this.getModulePermissionCount(module)
        };
        // Accordions closed by default - user can expand manually
      }
    },

    // Get total permission count for a module
    getModulePermissionCount(module) {
      let count = 0;
      for (const controller of Object.values(module.controllers)) {
        if (Array.isArray(controller)) {
          count += controller.length;
        } else {
          count += Object.keys(controller).length;
        }
      }
      return count;
    },

    // Toggle accordion expansion
    toggleAccordion(moduleName) {
      if (this.expandedModules.has(moduleName)) {
        this.expandedModules.delete(moduleName);
      } else {
        this.expandedModules.add(moduleName);
      }
    },

    // Create permission key for fast lookups
    getPermissionKey(name, controller, action) {
      return `${name}-${controller}-${action}`;
    },

    // Check if a specific permission is selected
    isPermissionSelected(name, controller, action) {
      return this.selectedPermissionsMap.has(this.getPermissionKey(name, controller, action));
    },

    // Check if entire module is selected - Optimized version
    isModuleFullySelected(moduleName) {
      const moduleData = this.permissionsByModule[moduleName];
      if (!moduleData) return false;

      // Count selected permissions for this module using Map
      let selectedCount = 0;
      for (const [key, value] of this.selectedPermissionsMap) {
        if (value.name === moduleName) {
          selectedCount++;
          // Early exit optimization
          if (selectedCount === moduleData.totalCount) {
            return true;
          }
        }
      }

      return selectedCount === moduleData.totalCount;
    },

    // Toggle individual permission
    togglePermission(name, controller, action) {
      const key = this.getPermissionKey(name, controller, action);
      const permissionObj = { name, controller, [action]: true };

      if (this.selectedPermissionsMap.has(key)) {
        // Remove permission
        this.selectedPermissionsMap.delete(key);
        const index = this.newItem.permissions.findIndex(p =>
          p.name === name && p.controller === controller && p[action]
        );
        if (index > -1) {
          this.newItem.permissions.splice(index, 1);
        }
      } else {
        // Add permission
        this.selectedPermissionsMap.set(key, permissionObj);
        this.newItem.permissions.push(permissionObj);
      }

      // Update select all checkbox
      this.updateSelectAllState();
    },

    // Toggle all permissions for a module - Optimized batch operation
    toggleModulePermissions(moduleName) {
      const isFullySelected = this.isModuleFullySelected(moduleName);
      const module = this.allPermissions.find(p => p.name === moduleName);

      if (!module) return;

      if (isFullySelected) {
        // Batch remove all module permissions
        const keysToDelete = [];
        for (const [key, value] of this.selectedPermissionsMap) {
          if (value.name === moduleName) {
            keysToDelete.push(key);
          }
        }

        // Delete from map
        keysToDelete.forEach(key => this.selectedPermissionsMap.delete(key));

        // Filter permissions array
        this.newItem.permissions = this.newItem.permissions.filter(p => p.name !== moduleName);
      } else {
        // Batch add all module permissions
        const permissionsToAdd = [];

        for (const [controller, actions] of Object.entries(module.controllers)) {
          const actionsList = Array.isArray(actions) ? actions : Object.keys(actions);

          for (const action of actionsList) {
            const key = this.getPermissionKey(moduleName, controller, action);
            if (!this.selectedPermissionsMap.has(key)) {
              const permissionObj = { name: moduleName, controller, [action]: true };
              this.selectedPermissionsMap.set(key, permissionObj);
              permissionsToAdd.push(permissionObj);
            }
          }
        }

        // Add all at once instead of multiple pushes
        if (permissionsToAdd.length > 0) {
          this.newItem.permissions.push(...permissionsToAdd);
        }
      }

      // Update select all checkbox
      this.updateSelectAllState();
    },

    // Update select all checkbox state
    updateSelectAllState() {
      this.selectAll = this.isAllPermissionsSelected;
    },
    async save() {
      const isValid = await this.validateBeforeSubmit();
      if (!isValid) return;

      // Proceed with saving the data
      try {
        const response = await this.api.save({ data: JSON.stringify(this.newItem) });
        this.allRoles = await this.api.getAll();
        this.getDepartmentsJobAppliedDefaultRole(this.newItem.job_id);
        this.updateUnselectedDepartments();
      }
      catch (error) {
        console.error('Error saving role:', error);
      }
    },
    async validateBeforeSubmit() {

      this.errors = {};
      // if (this.newItem?.permissions?.length == 0 || this.newItem?.permissions == null || this.newItem?.permissions[0] == null) {
      //   this.errors.permissions = ['You must select at least one permission to update or colon'];
      // }
      if (this.newItem?.job_id == null) {
        this.errors.job_id = ['You must select a job'];
      }
      if (this.newItem?.department_id == null) {
        this.errors.department_id = ['You must select a department'];
      }
      if (Object.keys(this.errors).length > 0) {
        return;
      }
      const result = await Swal.fire({
        title: `Are you sure from permissions for this job?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: `Yes, save it!`,
      });
      return result.isConfirmed;
    },

    async handleSubmit(type) {

      this.errors = {};
      if (this.newItem?.permissions?.length == 0 || this.newItem?.permissions == null || this.newItem?.permissions[0] == null) {
        this.errors.permissions = ['You must select at least one permission to update or colon'];
      }
      if (this.newItem?.job_id == null) {
        this.errors.job_id = ['You must select a job'];
      }
      if (this.newItem?.department_id == null) {
        this.errors.department_id = ['You must select a department'];
      }
      if (Object.keys(this.errors).length > 0) {
        return;
      }
      const result = await Swal.fire({
        title: `Are you sure from ${type} permissions for this job?`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonColor: "#44225c",
        cancelButtonColor: "#ffc107",
        confirmButtonText: `Yes, ${type} it!`,
      });
      if (result.isConfirmed) {
        if (type == 'update')
          this.newItem.type = 'update';
        else if (type == 'colon') {

        }
        this.newItem.type = 'colon';

        console.log('Inserting new item:', this.newItem);

        const dataBody = JSON.stringify(this.newItem);
        const response = await this.api.insert({ data: dataBody }); // Pass the new item data as JSON
        if (response.status == 'success') {
          notify({
            title: type + " successfully",
            text: "The operation was completed successfully.!",
            type: "success",
          });
        }
        else if (response.errors)
          this.errors = response.errors
        else
          notify({
            title: "Something won't wrong",
            text: response,
            type: "danger",
          });

      }

      if (this.newItem?.job_id == this.authUser?.job_id && this.newItem?.department_id == this.authUser?.department_id) {
        Auth.logOut();
      }

    },
    async getJobs(id) {
      // Reset state
      this.newItem.job_id = null;
      this.newItem.permissions = [];
      this.selectedPermissionsMap.clear();
      this.selectAll = false;
      this.expandedModules.clear();
      this.errors = {};
      this.jobs = [];
      this.allDeparmentsInJob = [];
      this.allDeparmentsInJobWithDefaultRole = [];
      this.colonDepartmentsRole = [];
      this.colonDepartmentSet.clear();


      try {
        // BEST PERFORMANCE: Use cached Map for O(1) lookup instead of find() O(n)
        const department = this.departmentIdMapCache.get(id);
        this.jobs = department?.jobs || [];

        // Accordions remain closed by default
      } catch (error) {
        console.error('Error fetching jobs:', error);
        this.errors.jobs = ['Failed to load jobs for this department'];
      }
    },



    convertPermissions(permissions, selectAll = false) {
      const newPermissions = [];

      permissions.forEach(permission => {
        Object.keys(permission.controllers).forEach(controller => {
          const actions = permission.controllers[controller];

          if (Array.isArray(actions)) {
            // Handle array format
            actions.forEach(action => {
              newPermissions.push({
                name: permission.name,
                controller: controller,
                [action]: true
              });
            });
          } else {
            // Handle object format
            Object.entries(actions).forEach(([actionKey, actionValue]) => {
              newPermissions.push({
                name: permission.name,
                controller: controller,
                [actionKey]: selectAll ? true : actionValue
              });
            });
          }
        });
      });

      return newPermissions;
    },
    async getPermissionsInRole(id) {
      this.getDepartmentsJobAppliedDefaultRole(id);
      // Reset state
      this.isLoadingPermissions = true;
      this.newItem.permissions = [];
      this.selectedPermissionsMap.clear();
      this.selectAll = false;
      this.errors = {};

      try {
        // OPTIMIZED: Find role from cached allRoles instead of API call
        // Priority: 1) Role with matching department_id, 2) Default 'update' role
        let role = this.allRoles.find(r =>
          r.job_id === id &&
          r.department_ids?.includes(this.newItem.department_id)
        );

        // Fallback to default 'update' role if no specific role found
        if (!role) {
          role = this.allRoles.find(r =>
            r.job_id === id &&
            r.type === 'update'
          );
        }

        this.currentSelectedRole = role;

        if (role?.permissions?.length > 0) {
          // Convert and populate permissions
          const convertedPermissions = this.convertPermissions(role.permissions);
          this.newItem.permissions = convertedPermissions;

          // Batch rebuild permission map using forEach
          convertedPermissions.forEach(permission => {
            const actionKey = Object.keys(permission).find(k => k !== 'name' && k !== 'controller');
            const key = this.getPermissionKey(permission.name, permission.controller, actionKey);
            this.selectedPermissionsMap.set(key, permission);
          });

          // Update select all state
          this.updateSelectAllState();
        }
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        this.errors.general = ['Failed to load role permissions'];
      } finally {
        this.isLoadingPermissions = false;
      }
    },

    selectAllPermissions() {
      if (this.selectAll) {
        // Batch operation: Select all permissions at once
        this.newItem.permissions = [...this.selectedAllPermissions];

        // Batch rebuild permission map
        this.selectedPermissionsMap.clear();
        this.selectedAllPermissions.forEach(permission => {
          const actionKey = Object.keys(permission).find(k => k !== 'name' && k !== 'controller');
          const key = this.getPermissionKey(permission.name, permission.controller, actionKey);
          this.selectedPermissionsMap.set(key, permission);
        });
      } else {
        // Clear all permissions
        this.newItem.permissions = [];
        this.selectedPermissionsMap.clear();
      }
    },
  }


};
</script>


<style scoped>
/* Scoped styles for the component */
@import "vue-select/dist/vue-select.css";

/* Main Container Min Height */
.main-container {
  min-height: 70vh;
}

/* Department Legend Styles */
.department-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  margin-top: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.legend-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

.legend-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.legend-badge--default {
  background: linear-gradient(135deg, #00d4ff 0%, #00bfea 100%);
}

.legend-badge--colon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.legend-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
  letter-spacing: 0.3px;
}

/* Department Badges Container */
.department-badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 2px dashed #dee2e6;
  min-height: 80px;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.department-badges-container::-webkit-scrollbar {
  width: 6px;
}

.department-badges-container::-webkit-scrollbar-track {
  background: #e9ecef;
  border-radius: 10px;
}

.department-badges-container::-webkit-scrollbar-thumb {
  background: #6E3894;
  border-radius: 10px;
}

.department-badges-container::-webkit-scrollbar-thumb:hover {
  background: #5a2d7a;
}

/* Department Badge Item */
.department-badge-item {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #00d4ff 0%, #00bfea 100%);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: default;
  position: relative;
  overflow: hidden;
}

.department-badge-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.department-badge-item:hover::before {
  left: 100%;
}

.department-badge-item:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
}

.department-badge-item--colon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
}

.department-badge-item--colon:hover {
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.department-badge-item i {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Apply to All Modal Styles */
.apply-to-all-modal {
  border-radius: 12px !important;
  overflow: hidden;
}


.modal-header-custom .headline {
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-header-custom i {
  font-size: 1.25rem;
}

.modal-body-custom {
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
}

.select-all-section {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid grey;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid transparent;
}

.alert-info {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #2196f3;
  color: #0d47a1;
  border-left: 4px solid #2196f3;
}

.alert i {
  font-size: 1rem;
}

.department-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #a9a5ac;
  color: rgb(0, 0, 0);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.department-count-badge i {
  font-size: 0.875rem;
}

.departments-list {
  margin-top: 1rem;
}

.department-checkboxes {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar */
.department-checkboxes::-webkit-scrollbar {
  width: 6px;
}

.department-checkboxes::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.department-checkboxes::-webkit-scrollbar-thumb {
  background: #6E3894;
  border-radius: 10px;
}

.department-checkboxes::-webkit-scrollbar-thumb:hover {
  background: #5a2d7a;
}

.department-item {
  padding: 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  align-items: center;
}

.department-item:hover {
  border-color: #6E3894;
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.15);
  transform: translateY(-2px);
}

.department-item--selected {
  border-color: #6E3894;
  background: linear-gradient(135deg, #f8f4fc 0%, #ffffff 100%);
  box-shadow: 0 4px 8px rgba(110, 56, 148, 0.2);
}

.department-item--current {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

.department-item--current.department-item--selected {
  border-color: #6E3894;
  background: linear-gradient(135deg, #f8f4fc 0%, #fff9e6 50%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.3), 0 0 0 2px rgba(255, 193, 7, 0.2);
}

.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
  color: #000;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 0.5rem;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
  animation: pulse 2s infinite;
}

.current-badge i {
  font-size: 0.65rem;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.department-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.department-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.department-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  background: #e9ecef;
  border-radius: 15px;
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
}

.department-badge i {
  font-size: 0.7rem;
}

.no-departments-message {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-departments-message i {
  font-size: 3rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.no-departments-message p {
  margin: 0;
  font-size: 1rem;
}

.modal-footer-custom {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.btn-cancel-modal {
  padding: 0.5rem 1.5rem !important;
  text-transform: none !important;
  font-weight: 500 !important;
}


.btn-confirm-modal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form check custom styles */
.form-check {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.form-check-input {
  width: 20px;
  height: 20px;
  border: 2px solid #6E3894;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.form-check-input:checked {
  background-color: #6E3894;
  border-color: #6E3894;
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(110, 56, 148, 0.25);
}

.form-check-label {
  cursor: pointer;
  margin: 0;
  flex: 1;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.d-flex.flex-wrap {
  gap: 1.5rem;
}

label {
  margin-bottom: 0px;
}


/* Accordion styles for better performance */
.accordion-button {
  background-color: #f8f9fa;
  padding: 1rem 1.25rem;
  font-weight: 500;
  border: none;
  box-shadow: none !important;
}

.accordion-button:not(.collapsed) {
  background-color: #e9ecef;
  color: #212529;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(0, 0, 0, .125);
}

.accordion-item {
  border: 1px solid rgba(0, 0, 0, .125);
  margin-bottom: 0.5rem;
}

.accordion-body {
  padding: 1.25rem;
}

/* Improve accordion transition performance */
.accordion-collapse {
  transition: height 0.2s ease;
}

/* Virtual scrolling for large permission lists */
.permission-list {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.permission-list::-webkit-scrollbar {
  width: 6px;
}

.permission-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.permission-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.permission-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* ========== REDESIGN STYLES ========== */

/* Form Labels */
.form-label-redesign {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.card-role {
  height: 100%;
  background-color: #F5F5F5;
  padding: 10px;
  border: 1px solid #E0E0E0;
  border-radius: 10px;
}

/* V-Select */
.v-select-redesign {
  width: 100%;
  background: white;
}

:deep(.vs--searchable .vs__dropdown-toggle),
:deep(.v-select-redesign) {
  border-radius: 15px !important;

}

/* Job Buttons */
.job-buttons-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
  gap: 8px;
}

.job-buttons-wrapper .btn {
  padding: 0;
  margin: 0 !important;
  background: none;
  border: none;
}



.job-buttons-wrapper input[type="radio"]:checked+label {
  background: #7b3fa3;
  color: white;
  padding: 8px 20px;
  border-radius: 15px;
  display: inline-block;
}

.job-buttons-wrapper input[type="radio"]:not(:checked)+label {
  background: #d3d3d3;
  color: #1a1a1a;
  padding: 8px 20px;
  border-radius: 15px;
  display: inline-block;
  cursor: pointer;
}

.job-buttons-wrapper input[type="radio"] {
  display: none;
}

/* Department Section */
.department-header-redesign {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.department-title-redesign {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.department-legend-redesign {
  display: flex;
  gap: 16px;
  align-items: center;
}

.legend-item-redesign {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot--default {
  background: #b5b2b8;
}

.legend-dot--custom {
  background: #7b3fa3;
  color: white;
}

.legend-text {
  font-size: 13px;
  color: #666;
}

.department-badges-redesign {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.department-badge-redesign {
  padding: 6px 16px;
  background: #D9D9D9;
  color: black;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
  
}

.department-badge-redesign--custom {
  background: #6E3894;
  color: white;
}

/* Permissions Section */
.permissions-section-redesign {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin: 0px;
  padding: 0px;
}

.permissions-header-redesign {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-radius: 10px 10px 0 0;
  border: 1px solid #e0e0e0;
  background-color: #F5F5F5;
  padding: 10px 14px;
}

.select-all-wrapper-redesign {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all-check {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.select-all-label-redesign {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin: 0;
}

/* Accordion */
.accordion-redesign {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px;
}

.accordion-item-redesign {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.accordion-header-redesign {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.2s ease;
}

.accordion-header-redesign:hover {
  background: #f5f5f5;
}

.accordion-title-wrapper-redesign {
  display: flex;
  align-items: center;
  gap: 12px;
}

.accordion-icon-redesign {
  font-size: 14px;
  color: #666;
  transition: transform 0.2s ease;
}

.accordion-title-redesign {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.select-module-wrapper-redesign {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-module-check {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.select-module-label-redesign {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin: 0;
}

.accordion-body-redesign {
  padding: 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

/* Permission Rows */
.permission-row-redesign {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.permission-row-redesign:last-child {
  border-bottom: none;
}

.controller-name-redesign {
  min-width: 150px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-right: 24px;
}

.permission-checkboxes-redesign {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
}

.permission-checkbox-item-redesign {
  display: flex;
  align-items: center;
  gap: 6px;
}

.permission-check-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.permission-check-label {
  font-size: 13px;
  color: #333;
  cursor: pointer;
  margin: 0;
  user-select: none;
}

/* Action Buttons */
.action-buttons-redesign {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

.btn-action-redesign {
  padding: 5px;
  min-width: 110px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-save {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-action-save:hover {
  background: #f5f5f5;
}

.btn-action-apply {
  background: #7b3fa3;
  color: white;
}

.btn-action-apply:hover {
  background: #6a3591;
}

/* ========== MODAL REDESIGN ========== */

/* Modal Container */
.modal-redesign {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Modal Header */
.modal-header-redesign {
  background: #f8f9fa;
  padding: 24px 32px !important;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.modal-close-btn {
  background: transparent !important;
  box-shadow: none !important;
  color: #6c757d !important;
}

.modal-close-btn:hover {
  color: #1a1a1a !important;
}

.modal-close-btn i {
  font-size: 20px;
}

/* Modal Body */
.modal-body-redesign {
  padding: 24px 32px !important;
  background: white;
}

/* Modal Controls */
.modal-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.department-counter {
  font-size: 15px;
  color: #6c757d;
  font-weight: 500;
}

.select-all-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all-checkbox-modal {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #7b3fa3;
  border: 2px solid #7b3fa3;
  border-radius: 4px;
}

.select-all-label-modal {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  margin: 0;
  user-select: none;
}

/* Department Cards Grid */
.department-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.department-cards-grid::-webkit-scrollbar {
  width: 6px;
}

.department-cards-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.department-cards-grid::-webkit-scrollbar-thumb {
  background: #7b3fa3;
  border-radius: 10px;
}

.department-cards-grid::-webkit-scrollbar-thumb:hover {
  background: #6a3591;
}

/* Department Card */
.department-card-wrapper {
  position: relative;
}

.department-checkbox-hidden {
  display: none;
}

.department-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding: 20px 16px; */
  background: #e6d9f0;
  border: 1px solid #7b3fa3;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;
  text-align: center;
}

.department-card:hover {
  border-color: #6a3591;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(123, 63, 163, 0.2);
}

.department-card--selected {
  background: #e6d9f0;
  border-color: #7b3fa3;
  border-width: 1px;
}

.department-card--current {
  background: #e6d9f0;
  border-color: #7b3fa3;
}

.department-card-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.4;
  word-break: break-word;
}

.current-label {
  display: inline-block;
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #1a1a1a;
  background: white;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Unselected state (gray) */
.department-checkbox-hidden:not(:checked)+.department-card {
  background: #c5c5c5;
  border-color: #c5c5c5;
  border-width: 3px;
}

.department-checkbox-hidden:not(:checked)+.department-card .department-card-name {
  color: #1a1a1a;
}

/* No Departments Message */
.no-departments-modal {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-departments-modal p {
  margin: 0;
  font-size: 15px;
}

/* Modal Footer */
.modal-footer-redesign {
  background: #f8f9fa;
  padding: 16px 32px !important;
  border-top: 1px solid #e0e0e0;
  gap: 12px;
}

.btn-modal-cancel {
  padding: 10px 0px 30px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  border: 1px solid #e0e0e0 !important;
  color: #333 !important;
  border-radius: 10px !important;
  background: white !important;
  min-width: 100px !important;
}

.btn-modal-cancel:hover {
  background: #f5f5f5 !important;
  border-color: #d0d0d0 !important;
}

.btn-modal-apply {
  padding: 10px 0px 30px !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  background: #7b3fa3 !important;
  color: white !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  min-width: 100px !important;
}

.btn-modal-apply:hover {
  background: #6a3591 !important;
}

.btn-modal-apply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-title-card {
  padding: 20px !important;
}

:deep(.full-height-card-text) {
  min-height: 70vh;
}
</style>