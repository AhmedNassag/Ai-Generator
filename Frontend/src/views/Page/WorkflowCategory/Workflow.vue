<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'CONFIGURATIONS'"
    :mainSubPage="'WORKFLOWS'"
    :subPage="'workflowCategory'"
    :titlePage="'workflow.workflow'"
  >
    <template #datatable>
      <div class="workflow-details-container" @click="handleContainerClick">
        <!-- Header -->
        <div class="workflow-details-header rtl">
          <h1 class="workflow-category-title">
            {{ categories.name ?? $t("workflowcategorydetails.workflow_category_name") }}
          </h1>
          <button @click="addWorkflow" class="btn-add-workflow-main">
            <span class="plus-icon">+</span>
            {{ $t("workflowcategorydetails.workflow") }}
          </button>
        </div>

        <!-- Table Container -->
        <div  class="workflow-table-container" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
          <table class="workflow-table-modern">
            <thead>
              <tr>
                <th class="col-active">{{ $t("workflowcategorydetails.active") }}</th>
                <th class="col-code">{{ $t("workflowcategorydetails.workflow_code") }}</th>
                <th class="col-name">{{ $t("workflowcategorydetails.workflow_name") }}</th>
                <th class="col-actions">{{ $t("workflowcategorydetails.actions") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(workflow, index) in workflows"
                :key="workflow.id"
                class="workflow-row"
              >
                <!-- Active Checkbox -->
                <td class="col-active">
                  <label class="checkbox-container">
                    <input
                      type="checkbox"
                      v-model="workflow.isActive"
                      :true-value="1"
                      :false-value="0"
                      class="checkbox-input"
                      @click.stop
                    />
                    <span class="checkbox-custom"></span>
                  </label>
                </td>

                <!-- Workflow Code Badge -->
                <td class="col-code">
                  <a
                    :href="`/workflow-details/${workflow.id}`"
                    class="workflow-code-badge"
                    @click.stop
                  >
                    {{ workflow.code ?? "WC-496757" }}
                  </a>
                </td>

                <!-- Workflow Name Input -->
                <td class="col-name">
                  <input
                    :name="`workflowName${index}`"
                    type="text"
                    v-model="workflow.name"
                    maxlength="50"
                    :placeholder="$t('workflowcategorydetails.workflow_name_placeholder')"
                    class="workflow-name-input"
                    @click.stop
                  />
                </td>

                <!-- Actions Menu -->
                <td class="col-actions">
                  <div class="actions-menu">
                    <button
                      @click.stop="toggleMenu(workflow.id)"
                      class="btn-menu"
                      :title="$t('workflowcategorydetails.actions')"
                    >
                      ⋮
                    </button>

                    <!-- Dropdown Menu -->
                    <div
                      v-if="activeMenu === workflow.id"
                      class="dropdown-menu"
                      @click.stop
                    >
                      <button
                        @click="handleMenuAction('clone', workflow.id)"
                        class="menu-item"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path
                            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                          />
                        </svg>
                        {{ $t("workflowcategorydetails.clone") }}
                      </button>
                      <button
                        @click="handleMenuAction('update', workflow.id)"
                        class="menu-item"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                          />
                        </svg>
                        {{ $t("workflowcategorydetails.update") }}
                      </button>
                    
                      <button
                        @click="handleMenuAction('delete', workflow.id)"
                        class="menu-item menu-item-delete"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path
                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                          />
                        </svg>
                        {{ $t("workflowcategorydetails.delete") }}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import category from "@/API/WorkflowCategory/WorkflowCategory";
import workflows from "@/API/WorkflowCategory/workflows";

export default {
  components: {
    MainPage,
  },
  props: ["id"],

  watch: {
    "$route.params.id": {
      immediate: true,
      handler(newId) {
        this.fetchDataWorkflow(newId);
        this.fetchCategory(newId);
      },
    },
  },

  mounted() {
    this.fetchCategory(this.$route.params.id);
    // Remove the global click listener since we're handling it locally
  },

  data() {
    return {
      workflows: [],
      categories: [],
      isFlipped: false,
      category: new category(),
      workflowService: new workflows(),
      activeMenu: null,
    };
  },

  methods: {
    toggleMenu(workflowId) {
      console.log(
        "Toggle menu called for:",
        workflowId,
        "Current active:",
        this.activeMenu
      );
      this.activeMenu = this.activeMenu === workflowId ? null : workflowId;
      console.log("New active menu:", this.activeMenu);
    },

    handleContainerClick() {
      // Close menu when clicking anywhere in the container
      this.activeMenu = null;
    },

    handleMenuAction(action, workflowId) {
      this.activeMenu = null; // Close menu first

      switch (action) {
        case "update":
          this.updateWorkflow(workflowId);
          break;
        case "clone":
          this.cloneWorkflow(workflowId);
          break;
        case "delete":
          this.deleteWorkflow(workflowId);
          break;
      }
    },

    async fetchDataWorkflow(id) {
      try {
        const response = await this.workflowService.getAll({
          filter: `workflowCategory_id|${id}|=`,
        });
        if (Array.isArray(response)) {
          this.workflows = response;
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Error fetching workflow details:", error);
      }
    },

    async fetchCategory(id) {
      try {
        const response = await this.category.show(id);
        if (response && Array.isArray(response.steps)) {
          this.categories = response;
        } else {
          console.error("Invalid category response:", response);
        }
      } catch (error) {
        console.error("Error fetching workflow categories:", error);
      }
    },

    async addWorkflow() {
      if (
        !this.categories ||
        !this.categories.id ||
        !Array.isArray(this.categories.steps)
      ) {
        console.error("Category data is missing or invalid");
        return;
      }

      const newWorkflow = {
        name: `workflow ${this.workflows.length + 1} ${Math.floor(Math.random() * 1000)}`,
        isActive: 1,
        workflowCategory_id: this.categories.id,
        steps: this.categories.steps.map((step) => ({
          name: step.name || "Unknown",
          code: step.code || "000000",
        })),
      };

      try {
        await this.workflowService.from(newWorkflow);
        this.fetchDataWorkflow(this.categories.id);
      } catch (error) {
        console.error("Error adding workflow:", error);
      }
    },

    async cloneWorkflow(id) {
      const workflow = this.workflows.find((w) => w.id === id);

      if (workflow) {
        const newWorkflow = {
          name: `${workflow.name} Clone ${Math.floor(Math.random() * 1000)}`,
          isActive: workflow.isActive,
          workflowCategory_id: workflow.workflowCategory_id,
          steps: workflow.steps.map((step) => ({ ...step })),
          clone: "clone",
        };

        try {
          await this.workflowService.from(newWorkflow);
          this.fetchDataWorkflow(this.categories.id);
        } catch (error) {
          console.error("Error cloning workflow:", error);
        }
      }
    },

    updateWorkflow(workflowId) {
      const workflowToUpdate = this.workflows.find((wf) => wf.id === workflowId);

      if (workflowToUpdate) {
        const updatedData = {
          id: workflowToUpdate.id,
          name: workflowToUpdate.name,
          isActive: workflowToUpdate.isActive,
          code: workflowToUpdate.code,
          workflowCategory_id: workflowToUpdate.workflowCategory_id,
          steps: workflowToUpdate.steps.map((step) => ({ ...step })),
        };

        this.workflowService
          .from(updatedData)
          .then((response) => {
            console.log("Workflow updated successfully:", response);
            const index = this.workflows.findIndex((wf) => wf.id === workflowId);
            if (index !== -1) {
              this.workflows[index] = { ...this.workflows[index], ...updatedData };
            }
          })
          .catch((error) => {
            console.error("Error updating workflow:", error);
          });
      }
    },

    async deleteWorkflow(id) {
      if (!confirm("Are you sure you want to delete this workflow?")) return;

      try {
        const response = await this.workflowService.delete(id);
        if (response.status === "success") {
          await this.fetchDataWorkflow(this.$route.params.id);
        }
      } catch (error) {
        console.error("Error deleting workflow:", error);
      }
    },

    async deleteItem(id) {
      try {
        const response = await this.workflowService.delete(id);
        await this.fetchDataWorkflow(this.$route.params.id);
      } catch (error) {
        console.error("Error deleting workflow category:", error);
      }
    },
  },
};
</script>

<style scoped>
/* Container */
.workflow-details-container {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header */
.workflow-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.workflow-category-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.btn-add-workflow-main {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #6e3894;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(110, 56, 148, 0.3);
}

.btn-add-workflow-main:hover {
  background: #5a2d78;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 56, 148, 0.4);
}

.plus-icon {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

/* Table Container */
.workflow-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.workflow-table-modern {
  width: 100%;
  border-collapse: collapse;
}

.workflow-table-modern thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.workflow-table-modern th {
  padding: 16px 20px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.workflow-table-modern tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

.workflow-table-modern tbody tr:hover {
  background: #f9fafb;
}

.workflow-table-modern tbody tr:last-child {
  border-bottom: none;
}

.workflow-table-modern td {
  padding: 16px 20px;
  vertical-align: middle;
}

/* Column Widths */
.col-active {
  width: 10%;
  text-align: center;
}

.col-code {
  width: 20%;
}

.col-name {
  width: 50%;
}

.col-actions {
  width: 20%;
  text-align: center;
}

/* Custom Checkbox */
.checkbox-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #6e3894;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #6e3894;
  border-color: #6e3894;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Workflow Code Badge */
.workflow-code-badge {
  display: inline-block;
  background: #d0b5e3;
  color: #4a3459;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.workflow-code-badge:hover {
  background: #c4a5d8;
  color: #3a2547;
}

/* Workflow Name Input */
.workflow-name-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s ease;
  background: white;
}

.workflow-name-input::placeholder {
  color: #9ca3af;
}

.workflow-name-input:focus {
  outline: none;
  border-color: #6e3894;
  box-shadow: 0 0 0 3px rgba(110, 56, 148, 0.1);
}

/* Actions Menu */
.actions-menu {
  position: relative;
  display: inline-block;
}

.btn-menu {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-menu:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item svg {
  flex-shrink: 0;
}

.menu-item-delete {
  color: #a92525;
  border-top: 1px solid #e5e7eb;
}

.menu-item-delete:hover {
  background: #fef2f2;
}

/* Responsive */
@media (max-width: 768px) {
  .workflow-details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-add-workflow-main {
    width: 100%;
    justify-content: center;
  }

  .workflow-table-modern {
    font-size: 13px;
  }

  .workflow-table-modern th,
  .workflow-table-modern td {
    padding: 12px 10px;
  }
}
/* Add this to your existing styles */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1000; /* Increased z-index */
  overflow: hidden;

  /* Debug border - remove after testing */
  border: 2px solid red !important;
}
/* Add these styles to your existing CSS */
.actions-menu {
  position: relative !important;
  display: inline-block !important;
}

.dropdown-menu {
  position: absolute !important;
  right: 0 !important;
  top: 100% !important;
  margin-top: 4px !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  min-width: 160px !important;
  z-index: 9999 !important; /* Very high z-index */
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  transform: none !important;
}

/* Ensure the table cell doesn't clip the dropdown */
.col-actions {
  position: relative;
  overflow: visible !important;
}

.workflow-table-container {
  overflow: visible !important;
}

.workflow-table-modern {
  position: relative;
  overflow: visible !important;
}
/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
  padding: 8px 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.menu-item:hover {
  background: #f7fafc;
  color: #6e3894;
}

.menu-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #718096;
  transition: color 0.2s ease;
}

.menu-item:hover svg {
  color: #6e3894;
}

.menu-item-delete {
  color: #e53e3e;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 12px;
}

.menu-item-delete:hover {
  background: #fed7d7;
  color: #c53030;
}

.menu-item-delete:hover svg {
  color: #c53030;
}

/* Three dots menu button */
.btn-menu {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #718096;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  font-weight: bold;
}

.btn-menu:hover {
  background: #f7fafc;
  color: #2d3748;
}

/* Ensure proper positioning */
.actions-menu {
  position: relative;
  display: flex;
  justify-content: center;
}

.col-actions {
  position: relative;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
  padding: 8px 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  
  /* Default state */
  width: 168px;
  height: 30px;
  border-radius: 10px;
  border: 2px solid transparent;
  box-shadow: none;
}

.menu-item:hover {
  background: #f7fafc;
  color: #6E3894;
  
  /* Hover state with your specifications */
  border: 2px solid #6E3894;
  box-shadow: 1px 5px 16px 0px rgba(0, 0, 0, 0.2);
  opacity: 1;
  gap: 10px;
  padding-right: 16px;
  padding-left: 16px;
}

.menu-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #718096;
  transition: color 0.2s ease;
}

.menu-item:hover svg {
  color: #6E3894;
}

.menu-item-delete {
  color: #e53e3e;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 12px;
}

.menu-item-delete:hover {
  background: #fed7d7;
  color: #c53030;
  border: 2px solid #e53e3e;
}

.menu-item-delete:hover svg {
  color: #c53030;
}

/* Three dots menu button */
.btn-menu {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #718096;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  font-weight: bold;
}

.btn-menu:hover {
  background: #f7fafc;
  color: #2d3748;
}

/* Ensure proper positioning */
.actions-menu {
  position: relative;
  display: flex;
  justify-content: center;
}

.col-actions {
  position: relative;
}
[dir="rtl"] .dropdown-menu {
  right: auto;
  left: 0;
}

[dir="rtl"] .menu-item svg {
  margin-left: 8px;
  margin-right: 0;
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item{
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row{
text-align: end;
}
</style>
