<template>
  <div>
    <main-page
      ref="page"
      :isFlipped="true"
      :mainPage="$t('hierarchy.governance')"
      :subPage="$t('hierarchy.Hierarchy')"
      :titlePage="$t('hierarchy.Hierarchy')"
      :loading="loading"
    >
    </main-page>

    <div class="card" v-permission:show>
      <div class="header-section rtl">
        <h3 class="header-title">Department Hierarchy</h3>
        <button class="add-domain-btn" @click="openOrganizationModal">
          <i class="fa fa-plus"></i>
          Organization Chart
        </button>
      </div>

      <div class="card-body">
        <!-- Draggable Tree Component -->
        <Draggable
          v-if="!loading"
          class="mtl-tree"
          v-model="treeData"
          treeLine
          :draggable="isDraggable"
          @change="onTreeChange($event)"
          @dragend="onDragEnd($event)"
        >
          <template #default="{ node, stat }">
            <div class="tree-node-wrapper">
              <OpenIcon
                v-if="stat.children.length"
                :open="stat.open"
                class="mtl-mr"
                @click.native="stat.open = !stat.open"
              />
              <input
                class="mtl-checkbox mtl-mr"
                type="checkbox"
                v-model="stat.checked"
              />
              <span class="node-icon">
                <i
                  v-if="node.type === 'department' || node.type === 'sector'"
                  class="far fa-folder"
                ></i>
                <i
                  v-else-if="node.type === 'employee'"
                  class="fa-regular fa-user"
                ></i>
              </span>
              <span
                :style="node.li_attr?.style || {}"
                class="node-text"
                :data-disabled="
                  (node.type === 'employee' && node.employeeType !== 'GRC') ||
                  (node.type === 'department' && node.departmentType === 'LDAP')
                "
                @click="openModal(node)"
                :class="{
                  'department-node':
                    node.type === 'department' || node.type === 'sector',
                  'employee-node': node.type === 'employee',
                }"
              >
                {{ node.text }}
                <!-- Lock icon for non-GRC employees -->
                <span
                  v-if="node.type === 'employee' && node.employeeType !== 'GRC'"
                  class="lock-icon"
                >
                  <i class="fas fa-lock"></i>
                </span>
                <!-- Lock icon for LDAP departments -->
                <span v-if="node.departmentType === 'LDAP'" class="lock-icon">
                  <i class="fas fa-lock"></i>
                </span>
              </span>
              <!-- Delete icon for non-LDAP departments with no children and no jobs -->
              <span
                v-if="
                  node.type === 'department' &&
                  node.departmentType !== 'LDAP' &&
                  !stat.children.length &&
                  (!node.job_ids || node.job_ids.length === 0)
                "
                class="delete-icon"
                @click="deleteDepartment(node)"
              >
                <i class="fas fa-trash"></i>
              </span>
            </div>
          </template>
        </Draggable>
      </div>
    </div>

    <!-- Employee Modal -->
    <div
      v-if="isModalVisible && modalType === 'employee'"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Employee Details</h3>
          <button class="modal-close-x" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="isLoading" class="loading-text">Loading...</div>
          <div v-else-if="employeeData" class="employee-details-grid">
            <!-- Personal Information Section -->
            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Full Name</label>
                <div class="detail-value">
                  {{ employeeData.full_name || "Not provided" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Username</label>
                <div class="detail-value">
                  {{ employeeData.username || "Not provided" }}
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Email</label>
                <div class="detail-value">
                  {{ employeeData.email || "Not provided" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Phone</label>
                <div class="detail-value">
                  {{ employeeData.phone || "Not provided" }}
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Type</label>
                <div class="detail-value type-badge">
                  {{ employeeData.type || "Unknown" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Super User</label>
                <div class="detail-value">
                  <span
                    :class="
                      employeeData.super === 'true'
                        ? 'status-circle-active'
                        : 'status-circle-inactive'
                    "
                  ></span>
                  {{ employeeData.super === "true" ? "Yes" : "No" }}
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Job Title</label>
                <div class="detail-value">
                  {{ employeeData.job?.name || "Not assigned" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Department</label>
                <div class="detail-value">
                  {{ employeeData.department?.name || "Not assigned" }}
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Status</label>
                <div class="detail-value">
                  <span
                    :class="
                      employeeData.status === 'true'
                        ? 'status-circle-active'
                        : 'status-circle-inactive'
                    "
                  ></span>
                  {{ employeeData.status === "true" ? "Active" : "Inactive" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Created At</label>
                <div class="detail-value">
                  {{ formatDateTime(employeeData.created_at) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="error-message">
            <p>Failed to fetch employee details.</p>
            <p>Please try again later or contact system administrator.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Department Modal -->
    <div
      v-if="isModalVisible && modalType === 'department'"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Department Details</h3>
          <button class="modal-close-x" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="isLoading" class="loading-text">Loading...</div>
          <div v-else-if="departmentData" class="department-details-grid">
            <!-- Basic Information Section -->
            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Department Name</label>
                <div class="detail-value">
                  {{ departmentData.name || "Not provided" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Code</label>
                <div class="detail-value">
                  {{ departmentData.code || "Not provided" }}
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Type</label>
                <div class="detail-value type-badge">
                  {{ departmentData.type || "Unknown" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Color</label>
                <div class="detail-value">
                  <span
                    class="color-indicator"
                    :style="{
                      backgroundColor: departmentData.color?.hexcolor || '#666',
                    }"
                  ></span>
                  {{ departmentData.color?.name || "Unknown" }}
                  ({{ departmentData.color?.hexcolor || "#000000" }})
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Manager</label>
                <div class="detail-value">
                  {{ departmentData.manager?.name || "Not assigned" }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Parent Department</label>
                <div class="detail-value">
                  {{ departmentData.parent?.name || "Root Department" }}
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="detail-row">
              <div class="detail-col">
                <label class="detail-label">Created At</label>
                <div class="detail-value">
                  {{ formatDateTime(departmentData.created_at) }}
                </div>
              </div>
              <div class="detail-col">
                <label class="detail-label">Last Updated</label>
                <div class="detail-value">
                  {{ formatDateTime(departmentData.updated_at) }}
                </div>
              </div>
            </div>
            <!-- Content Section -->
            <div
              v-if="
                departmentData.vision ||
                departmentData.mission ||
                departmentData.message ||
                departmentData.objectives ||
                departmentData.responsibilities
              "
              class="content-section"
            >
              <div v-if="departmentData.vision" class="content-item">
                <label class="detail-label">Vision</label>
                <div
                  class="detail-value content-text"
                  v-html="stripHtml(departmentData.vision)"
                ></div>
              </div>

              <div v-if="departmentData.mission" class="content-item">
                <label class="detail-label">Mission</label>
                <div
                  class="detail-value content-text"
                  v-html="stripHtml(departmentData.mission)"
                ></div>
              </div>

              <div v-if="departmentData.message" class="content-item">
                <label class="detail-label">Message</label>
                <div
                  class="detail-value content-text"
                  v-html="stripHtml(departmentData.message)"
                ></div>
              </div>

              <div v-if="departmentData.objectives" class="content-item">
                <label class="detail-label">Objectives</label>
                <div
                  class="detail-value content-text"
                  v-html="stripHtml(departmentData.objectives)"
                ></div>
              </div>

              <div v-if="departmentData.responsibilities" class="content-item">
                <label class="detail-label">Responsibilities</label>
                <div
                  class="detail-value content-text"
                  v-html="stripHtml(departmentData.responsibilities)"
                ></div>
              </div>
            </div>

            <!-- Employees Section -->
            <!-- <div v-if="departmentData.employees?.length" class="employees-section">
              <h4 class="section-title">Employees ({{ departmentData.employees.length }})</h4>
              <div class="employees-grid">
                <div
                  v-for="employee in departmentData.employees"
                  :key="employee.id"
                  class="employee-card"
                >
                  <div class="employee-header">
                    <span class="employee-name">{{ employee.full_name || "Unknown" }}</span>
                    <span
                      :class="employee.super === 'true' ? 'status-circle-active' : 'status-circle-inactive'"
                    ></span>
                  </div>
                  <div class="employee-details">
                    <div class="employee-job">{{ employee.job?.name || "Unknown Job" }}</div>
                    <div class="employee-email">{{ employee.email || "No Email" }}</div>
                    <div class="employee-phone">{{ employee.phone || "No Phone" }}</div>
                  </div>
                </div>
              </div>
            </div> -->
          </div>
          <div v-else class="error-message">
            <p>Failed to fetch department details.</p>
            <p>Please try again later or contact system administrator.</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Organization Modal -->
    <!-- Organization Modal Component -->
    <OrganizationModal
      :isVisible="showOrganizationModal"
      :organizationData="dataOrganization"
      @close="closeOrganizationModal"
    />
  </div>
</template>

<script>
import hierarchy from "@/API/Hierarchy/Hierarchy";
import user from "@/API/User/User";
import departement from "@/API/Department/Department";
import "@fortawesome/fontawesome-free/css/all.css";
import { Draggable, OpenIcon } from "@he-tree/vue";
import "@he-tree/vue/style/default.css";
import "@he-tree/vue/style/material-design.css";
import MainPage from "@/components/MainPage.vue";
import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import DataTable from "@/components/DataTable.vue";
import OrganizationModal from "./OrganizationModal.vue"; // Import the new modal component

export default {
  components: {
    Draggable,
    OpenIcon,
    MainPage,
    DataTable,
    OrganizationModal,
  },

  data() {
    return {
      treeData: [], // Hierarchical data for the tree
      initialTreeData: [], // Store the initial state of the tree data
      previousTreeData: [], // Store the previous state of the tree data before changes
      isModalVisible: false, // Controls modal visibility
      modalType: "", // 'employee' or 'department'
      isLoading: false, // Loading state for modal content
      loading: false, // Loading state for tree
      employeeData: null, // Employee data for modal
      departmentData: null, // Department data for modal
      showOrganizationModal: false, // Changed from showModal
      dataOrganization: [],
    };
  },
  setup() {
    const apiHierarchy = new hierarchy();
    const apiUser = new user();
    const api = new departement();
    const apiParams = { filter: "email|superadmin@encyclopedia.com" };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiHierarchy,
      apiParams,
      tableColumns,
      fromFields,
      apiUser,
    };
  },
  // Use the mounted lifecycle hook to fetch data when the component is mounted
  mounted() {
    this.fetchHierarchy(); // Fetch data when the component is mounted
  },

  watch: {
    treeData: {
      handler(newTreeData, oldTreeData) {
        this.onTreeChange({ newTreeData, oldTreeData });
      },
      deep: true,
    },
  },

  computed: {
    isDraggable() {
      return (node) => {
        // Allow dragging only if the node is not an employee or is a GRC employee
        return node.type !== "employee" || node.employeeType === "GRC";
      };
    },
  },

  methods: {
    async deleteDepartment(node) {
      if (node.type === "department" && !node.children.length) {
        const departmentId = node.id.replace("D", ""); // Remove the 'D' prefix

        try {
          // Send a DELETE request to the API endpoint
          const response = await this.api.delete(`${departmentId}`);
          // Refresh the hierarchy data after deletion
          this.fetchHierarchy();
        } catch (error) {
          console.error("Error deleting department:", error);
        }
      }
    },

    openOrganizationModal() {
      this.showOrganizationModal = true;
    },

    closeOrganizationModal() {
      this.showOrganizationModal = false;
    },

    async fetchHierarchy() {
      this.loading = true; // Show loading spinner
      // Set a minimum delay of 2 seconds
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const relations = [
          "departments",
          "manager",
          "employees",
          "employees.job",
          "employees.managees",
          "color",
        ];
        const fetchData = this.api.getAll({ with: relations });

        // Wait for both the API call and the minimum delay
        const [response] = await Promise.all([fetchData, minDelay]);

        if (response && Array.isArray(response)) {
          this.dataOrganization = response;
          console.log("defef", this.dataOrganization);
          const structuredDepartments = this.structureHierarchy(response);
          this.treeData = structuredDepartments;
          this.initialTreeData = JSON.parse(
            JSON.stringify(structuredDepartments)
          );
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Error fetching the hierarchy:", error);
      } finally {
        this.loading = false; // Hide loading spinner
      }
    },

    async fetchEmployeeDetails(employeeId) {
      try {
        const response = await this.apiUser.show(employeeId, {
          with: ["job", "department"],
        });

        if (!response) {
          console.error("No response received from API");
          return null;
        }

        return response; // Return the fetched employee data directly
      } catch (error) {
        console.error("Error fetching employee details:", error);
        console.error("Employee ID:", employeeId);
        console.error("Error details:", error?.response?.data || error.message);
        return null;
      }
    },

    async fetchDepartmentDetails(departmentId) {
      try {
        const response = await this.api.show(departmentId, {
          with: ["manager", "parent", "color", "employees.job"],
        });
        this.departmentData = response;
        console.log("departmentData", response);

        return response.data; // Return the fetched department data
      } catch (error) {
        return null;
      }
    },

    async openModal(node) {
      // Reset data and show modal with loading state
      this.employeeData = null;
      this.departmentData = null;
      this.isLoading = true;
      this.isModalVisible = true;

      if (node.type === "employee") {
        this.modalType = "employee";
        const employeeId = node.id.replace("E", ""); // Remove the 'E' prefix
        const employeeResponse = await this.fetchEmployeeDetails(employeeId);

        if (employeeResponse) {
          // Handle different possible response structures
          this.employeeData = employeeResponse.data || employeeResponse;
        }
      } else {
        this.modalType = "department";
        const departmentId = node.id.replace("D", ""); // Remove the 'D' prefix
        const departmentResponse = await this.fetchDepartmentDetails(
          departmentId
        );

        if (departmentResponse) {
          this.departmentData = departmentResponse.data || departmentResponse;
        }
      }

      this.isLoading = false;
    },

    structureHierarchy(departments) {
      const departmentMap = new Map();
      const structuredDepartments = [];
      departments.forEach((department) => {
        // Ensure department has an ID
        if (!department.id) {
          return; // Skip this department
        }

        departmentMap.set(department.id, {
          ...department,
          children: [],
          li_attr: department.li_attr || {},
          a_attr: department.a_attr || {},
        });
      });

      departments.forEach((department) => {
        if (department.parent_id) {
          const parentDepartment = departmentMap.get(department.parent_id);
          if (parentDepartment) {
            parentDepartment.children.push(departmentMap.get(department.id));
          }
        } else {
          structuredDepartments.push(departmentMap.get(department.id));
        }
      });

      const processDepartment = (department) => {
        const children = [];
        department.employees.forEach((employee) => {
          // Ensure employee has an ID
          if (!employee.id) {
            return; // Skip this employee
          }

          let addedText = "";
          let jobTitle = employee.job ? employee.job.name : "Unknown Job";
          if (department.manager_id === employee.id) {
            addedText = ` (Department Manager)`;
          } else if (employee.managees && employee.managees.length) {
            addedText = ` (Manager)`;
          } else {
            addedText = ` (Employee)`;
          }
          children.push({
            id: "E" + employee.id, // Ensure employee ID is prefixed with 'E'
            text: `${employee.full_name} - ${jobTitle} ${addedText}`,
            type: "employee",
            employeeType: employee.type || "Unknown", // Add employeeType (e.g., GRC or other)
            state: { opened: true },
            li_attr: {},
            a_attr: {},
          });
        });

        if (department.children && department.children.length) {
          department.children.forEach((child) => {
            const childData = processDepartment(child);
            children.push(...childData);
          });
        }

        return [
          {
            id: "D" + department.id, // Ensure department ID is prefixed with 'D'
            text: department.name,
            type: department.children.length ? "sector" : "department",
            departmentType: department.type || "default", // Ensure departmentType is assigned
            state: { opened: false },
            li_attr: {
              style: `color: ${
                department.color ? department.color.hexcolor : "#000000"
              } !important`,
            },
            a_attr: {
              style: `color: ${
                department.color ? department.color.hexcolor : "#000000"
              } !important`,
            },
            children,
            job_ids: department.job_ids || [], // Ensure job_ids is assigned
          },
        ];
      };

      return structuredDepartments.flatMap((department) =>
        processDepartment(department)
      );
    },

    compareTreeData(oldTreeData, newTreeData) {
      const changes = [];

      const buildParentMap = (nodes, parentId = null) => {
        const map = new Map();
        nodes.forEach((node) => {
          // Ensure node has an ID
          if (!node.id) {
            return; // Skip this node
          }

          map.set(node.id, {
            parentId,
            text: node.text || "Unknown",
            type: node.id.startsWith("D") ? "department" : "employee", // Ensure ID is defined before calling startsWith
          });
          if (node.children && node.children.length) {
            const childMap = buildParentMap(node.children, node.id);
            childMap.forEach((value, key) => map.set(key, value));
          }
        });
        return map;
      };

      const oldParentMap = buildParentMap(oldTreeData);
      const newParentMap = buildParentMap(newTreeData);

      oldParentMap.forEach((oldNodeData, id) => {
        const newNodeData = newParentMap.get(id);
        if (newNodeData && oldNodeData.parentId !== newNodeData.parentId) {
          changes.push({
            id,
            text: oldNodeData.text,
            type: oldNodeData.type,
            oldParentId: oldNodeData.parentId,
            newParentId: newNodeData.parentId,
            oldParentText: oldNodeData.parentId
              ? oldParentMap.get(oldNodeData.parentId)?.text || "Root"
              : "Root",
            newParentText: newNodeData.parentId
              ? newParentMap.get(newNodeData.parentId)?.text || "Root"
              : "Root",
          });
        }
      });

      return changes;
    },

    async onTreeChange(event) {
      if (!event) {
        return;
      }

      const { newTreeData, oldTreeData } = event;

      // Compare the old and new tree data to detect changes
      const changes = this.compareTreeData(oldTreeData, newTreeData);

      if (changes.length > 0) {
        try {
          const response = await this.apiHierarchy.dragAndDrop(changes);
          // const response = await axios.post('/drag-and-drop', { changes });
          if (response.status && response.data.notificationCode) {
            switch (response.data.notificationCode) {
              case "DEPARTMENT_UNDER_EMPLOYEE_ERROR":
              case "EMPLOYEE_UNDER_EMPLOYEE_ERROR":
              case "EMPLOYEE_OUTSIDE_DEPARTMENT_ERROR":
              case "DEPARTMENT_EMPLOYEE_LIMIT_REACHED":
              case "LDAP_DEPARTMENT_MOVE_ERROR":
              case "LDAP_EMPLOYEE_MOVE_ERROR":
                // Revert to the previous state of the tree
                this.treeData = JSON.parse(
                  JSON.stringify(this.previousTreeData)
                );
                notify({
                  type: "error",
                  icon: "error",
                  title: this.$t("hierarchy.error"),
                  text:
                    response.data.message ||
                    "An error occurred while updating the tree data.",
                });
                // Reload the hierarchy on error
                this.fetchHierarchy();
                break;

              case "CHANGES_APPLIED_SUCCESS":
                // Update the previousTreeData to the current state
                this.previousTreeData = JSON.parse(JSON.stringify(newTreeData));
                notify({
                  type: "success",
                  icon: "success",
                  title: this.$t("hierarchy.success"),
                  text:
                    response.data.changes || "Tree data updated successfully.",
                });
                break;

              case "NO_CHANGES_MADE":
                break;

              default:
                // Reload the hierarchy for unknown errors
                this.fetchHierarchy();
                break;
            }
          } else {
            // Reload the hierarchy for invalid backend responses
            this.fetchHierarchy();
          }
        } catch (error) {
          // Revert to the previous state of the tree
          this.treeData = JSON.parse(JSON.stringify(this.previousTreeData));
          notify({
            type: "error",
            icon: "error",
            title: this.$t("hierarchy.error"),
            text:
              error.response?.data?.message ||
              "An error occurred while updating the tree data.",
          });
          // Reload the hierarchy on error
          this.fetchHierarchy();
        }
      } else {
        console.log("No changes detected.");
      }
    },

    onDragEnd(event) {
      const finalTreeData = JSON.parse(JSON.stringify(this.treeData));
      this.onTreeChange({
        newTreeData: finalTreeData,
        oldTreeData: this.initialTreeData,
      });
      this.initialTreeData = finalTreeData;
    },

    closeModal() {
      this.isModalVisible = false;
      this.employeeData = null;
      this.departmentData = null;
      this.modalType = "";
    },

    formatDate(dateString) {
      if (!dateString) return "Not provided";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    formatDateTime(dateString) {
      if (!dateString) return "Not available";
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },

    stripHtml(html) {
      if (!html) return "Not provided";

      // Create a temporary DOM element to parse the HTML
      if (typeof DOMParser !== "undefined") {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || doc.body.innerText || "";
      }

      // Fallback for environments without DOMParser
      return html.replace(/<[^>]*>/g, "");
    },
  },
};
</script>

<style scoped>
/* Main container styling */
::v-deep(.flip-container.flip) {
  display: none;
}

.card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin: 20px auto;
  overflow: hidden;
  width: 100%;
  border: 1px solid #e1e5e9;
}

.card-body {
  padding: 10px 20px;
  width: 100%;
  min-height: 400px;
}

/* Loading spinner */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.loading-spinner i {
  margin-right: 12px;
  color: #4a90e2;
}

/* Tree container */
.mtl-tree {
  background-color: transparent;
  padding: 0;
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
}

/* Tree node styling */
.tree-node {
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin: 2px 0;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.tree-node:hover {
  background-color: #f8f9fa;
}

/* Checkbox styling */
.mtl-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border: 1px solid #585656;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fff;
  position: relative;
  vertical-align: middle;
}

.mtl-checkbox:checked::after {
  content: "✓";
  color: white;
  font-size: 16px;
  position: absolute;
  top: 1px;
  left: 6px;
}

/* Node icon styling */
.node-icon {
  margin-right: 10px;
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.fa-folder {
  font-size: larger;
  font-weight: 500;
}

.fa-user {
  font-size: larger;
  font-weight: 500;
}

/* Node text styling */
.node-text {
  font-size: 14px;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.node-text:hover {
  background-color: #e9ecef;
  color: #000;
}

/* Department node specific styling */
.department-node {
  font-weight: 550;
  font-size: 15px;
  color: #2c3e50;
}

/* Employee node specific styling */
.employee-node {
  font-weight: 400;
  color: #495057;
}

/* Lock icon styling */
.lock-icon {
  margin-left: 8px;
  color: #6c757d;
  font-size: 11px;
}

/* Delete icon styling */
.delete-icon {
  margin-left: 12px;
  color: #dc3545;
  cursor: pointer;
  font-size: 13px;
  opacity: 0.7;
  padding: 4px 6px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.delete-icon:hover {
  opacity: 1;
  background-color: #f8d7da;
}

/* Tree line and indentation */
.mtl-tree .tree-line {
  border-left: 1px solid #dee2e6;
  margin-left: 20px;
  padding-left: 24px;
}

/* Progressive tree line indentation for deeper levels */
.he-tree .tree-children .mtl-tree .tree-line {
  margin-left: 24px;
  padding-left: 28px;
}

.he-tree .tree-children .tree-children .mtl-tree .tree-line {
  margin-left: 28px;
  padding-left: 32px;
}

.he-tree .tree-children .tree-children .tree-children .mtl-tree .tree-line {
  margin-left: 32px;
  padding-left: 36px;
}

/* Open/Close icon styling */
.mtl-mr {
  margin-right: 8px;
  color: #6c757d;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.mtl-mr:hover {
  color: #4a90e2;
}

/* Disabled node styling */
.node-text[data-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: #f8f9fa;
}

.node-text[data-disabled="true"]:hover {
  background-color: #f8f9fa;
  color: #6c757d;
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 15px;
  font-weight: 800;
  color: #2c3e51;
  padding: 9px 17px 7px;
  margin: 0;
  background-color: #f8f8f8;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  padding: 0;
}

.modal-close-x {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 18px;
  padding: 12px 15px;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-x:hover {
  color: #dc3545;
}

.modal-body {
  padding: 10px 15px;
  color: #495057;
  line-height: 1.5;
}

/* Employee Details Grid Layout */
.employee-details-grid,
.department-details-grid {
  display: flex;
  flex-direction: column;
}

.profile-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-image-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 4px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 8px;
  margin-top: 20px;
  margin-bottom: 16px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0px;
  margin-bottom: 3px;
}

.detail-col {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  margin: 0;
  padding: 0px 6px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  padding: 4px 8px;
  min-height: 16px;
  display: flex;
  align-items: center;
}

/* Type Badges */
.type-badge {
  border: none !important;
  color: rgb(0, 0, 0) !important;
  font-weight: 600;
  text-align: center;
  border-radius: 20px !important;
  padding: 4px 8px !important;
  font-size: 12px;
  text-transform: uppercase;
}

.type-grc {
  background: linear-gradient(135deg, #28a745, #20c997) !important;
}

.type-ldap {
  background: linear-gradient(135deg, #007bff, #6f42c1) !important;
}

.type-unknown {
  background: linear-gradient(135deg, #6c757d, #495057) !important;
}

/* Status Circle - Color-based */
.status-circle-active,
.status-circle-inactive {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.status-circle-active {
  background-color: #28a745;
  /* Green for active/yes */
}

.status-circle-inactive {
  background-color: #dc3545;
  /* Red for inactive/no */
}

/* Color Indicator */
.color-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  vertical-align: middle;
}

.content-item {
  margin-bottom: 4px;
}

.content-text {
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  color: #495057;
  overflow-y: auto;
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.employee-card {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
}

.employee-card:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.employee-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.employee-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-job {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.employee-email,
.employee-phone {
  font-size: 11px;
  color: #868e96;
}

/* Responsive Design */
@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .profile-image-large,
  .profile-placeholder {
    width: 100px;
    height: 100px;
  }

  .section-title {
    font-size: 16px;
  }
}

/* Legacy styles for other modals */
.detail-item {
  display: flex;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f3f4;
}

.profile-image {
  max-width: 100px;
  border-radius: 8px;
  margin-top: 8px;
}

.job-list,
.employee-list {
  margin: 0;
  padding-left: 16px;
}

.job-list li,
.employee-list li {
  margin-bottom: 4px;
}

.active {
  color: #28a745;
  font-weight: 600;
}

.not-active {
  color: #dc3545;
  font-weight: 600;
}

/* Loading text styling */
.loading-text {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

/* Error message styling */
.error-message {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  color: #495057;
}

.error-message p {
  margin: 8px 0;
}

.error-message ul {
  margin: 8px 0;
  padding-left: 20px;
}

.error-message li {
  margin: 4px 0;
}
</style>

<style>
/* Global styles that affect child components */
.page-title-card {
  padding-inline: 1.5625rem !important;
  padding-block: 0.625rem !important;
}

/* HE Tree specific overrides */
.he-tree .tree-node {
  padding-left: 0 !important;
}

/* Override inline styles with progressive indentation */
.he-tree .tree-node[style*="padding-left: 20px"] {
  padding-left: 48px !important;
}

.he-tree .tree-node[style*="padding-left: 40px"] {
  padding-left: 70px !important;
}

.he-tree .tree-node[style*="padding-left: 60px"] {
  padding-left: 75px !important;
}

.he-tree .tree-node[style*="padding-left: 80px"] {
  padding-left: 95px !important;
}

.he-tree .tree-node[style*="padding-left: 100px"] {
  padding-left: 115px !important;
}

/* Alternative approach using CSS custom properties */
.he-tree .tree-children {
  --tree-indent: 30px;
  margin-left: var(--tree-indent);
  position: relative;
}

.he-tree .tree-children .tree-children {
  --tree-indent: 45px;
  margin-left: var(--tree-indent);
}

.he-tree .tree-children .tree-children .tree-children {
  --tree-indent: 60px;
  margin-left: var(--tree-indent);
}

.he-tree .tree-children .tree-children .tree-children .tree-children {
  --tree-indent: 75px;
  margin-left: var(--tree-indent);
}

.he-tree
  .tree-children
  .tree-children
  .tree-children
  .tree-children
  .tree-children {
  --tree-indent: 90px;
  margin-left: var(--tree-indent);
}

.he-tree .tree-line::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #dee2e6;
}

/* Ensure proper spacing in the tree */
.mtl-tree > .tree-node {
  border-left: none !important;
}

/* Font awesome icon adjustments */
.fas,
.far,
.fab {
  font-size: inherit;
}

/* Make sure the tree has proper vertical rhythm */
.tree-node-wrapper {
  display: flex;
  align-items: center;
  min-height: 32px;
}

/* Custom scrollbar for modal */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 0 0 12px 0;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.container-fluid {
  padding: 0.25rem 1rem !important;
}

.tree-hline {
  height: 1px;
  top: 50%;
  width: 30px;
}

.primary-btn {
  background: #6e3894;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.primary-btn:hover {
  background: #5a2d76;
}

/* Header Section Styling */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background-color: #ffffff;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  padding: 0;
}

.add-domain-btn {
  background: #6e3894;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-domain-btn i {
  font-size: 16px;
}
[dir="rtl"] .mtl-tree {
    direction: rtl;
}
[dir="rtl"] .he-tree .tree-line::before {
    left: 1245px;
}
</style>
