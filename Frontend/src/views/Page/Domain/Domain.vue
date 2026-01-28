<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('dashboard.dashboard')" :subPage="$t('domain.domain')"
    :titlePage="$t('domain.domain')">
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <button class="btn btn-success my-3" @click="openForm">{{ $t('domain.Add New Domain') }}</button>
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ $t('domain.Domain Hierarchy') }}</h3>
        </div>
        <div class="card-body">
          <!-- Loading Spinner -->
          <div v-if="loading" class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i> {{ $t('domain.Loading...') }}
          </div>
          <!-- Draggable Tree Component -->
          <Draggable v-if="!loading" class="mtl-tree" v-model="treeData" treeLine :draggable="isDraggable"
            @change="onTreeChange($event)" @dragend="onDragEnd($event)">
            <template #default="{ node, stat }">
              <OpenIcon v-if="stat.children.length" :open="stat.open" class="mtl-mr"
                @click.native="stat.open = !stat.open" />
              <input class="mtl-checkbox mtl-mr" type="checkbox" v-model="stat.checked" />
              <span :class="node.icon" class="node-icon"></span> <!-- Use node.icon here -->
              <span :style="node.li_attr?.style || {}" class="node-text">
                {{ node.text }}
              </span>
              <!-- Edit icon for all nodes -->
              <span class="edit-icon" @click="editItem(node)">
                <i class="fas fa-edit"></i>
              </span>
              <!-- Edit icon for all nodes -->
              <span v-if="(node.type === 'domain' && stat.children.length) || (node.type === 'main')" class="plus-icon"
                @click="addItemToMainAndParentDomain(node)">
                <i class="fas fa-plus"></i>
              </span>
              <!-- Delete icon for subdomains and domains without children -->
              <span
                v-if="(node.type === 'subdomain' || (node.type === 'main') || (node.type === 'domain' && !stat.children.length))"
                class="delete-icon" @click="deleteDomain(node.id)">
                <i class="fas fa-trash"></i>
              </span>
            </template>
          </Draggable>
        </div>
      </div>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>
  </main-page>
</template>

<script>
import domain from "@/API/Domain/Domain";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import "@fortawesome/fontawesome-free/css/all.css";
import { Draggable, OpenIcon } from '@he-tree/vue';
import '@he-tree/vue/style/default.css';
import '@he-tree/vue/style/material-design.css';
import axios from 'axios';
import { notify } from "@kyvg/vue3-notification";
import Swal from 'sweetalert2';
import { debounce } from 'lodash'; // Import debounce from lodash
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    Draggable,
    OpenIcon,
    LazySelectField,
  },

  setup() {
    const api = new domain();
    const apiParams = { filter: "parent_id|Null" };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      treeData: [], // Hierarchical data for the tree
      isFetching: false, // Flag to track if fetchHierarchy is running
      initialTreeData: [], // Store the initial state of the tree data
      previousTreeData: [], // Store the previous state of the tree data before changes
      isModalVisible: false, // Controls modal visibility
      modalTitle: '', // Modal title
      modalText: '', // Modal content
      loading: false, // Loading state
    };
  },

  created() {
    this.fetchHierarchy(); // Fetch data when the component is created
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { title: this.$t("domain.name"), data: "name", defaultContent: "N/A" },
      { title: this.$t("domain.order"), data: "order", defaultContent: "N/A" },
      { title: this.$t("domain.domain"), data: "domain", defaultContent: "N/A" },
      { title: this.$t("domain.subdomain"), data: "subdomain", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("domain.domainname"),
        type: "text",
        rules: "required",
        description: "Please enter name.",
        col: 6,
      },
      {
        name: "order",
        label: this.$t("domain.order"),
        type: "number",
        rules: "",
        description: "Please enter a valid number.",
        col: 6,
      },
      {
        type: "options",
        name: "parent_id",
        label: this.$t("domain.my_options"),
        options: "Domain", // Initialize with an empty array (will be populated dynamically)
        apiParams: {
          filter:`parent_id|null-null|=`
        },
        optionLabel: "name",
        col: 6,
        rules: "",
        description: "Select Parent if you want",
      },
    ];
  },
  watch: {
    treeData: {
      handler: debounce(function (newTreeData, oldTreeData) {
        if (!this.isFetching) {
          this.onTreeChange({ newTreeData, oldTreeData });
        }
      }, 300), // Debounce for 300ms
      deep: true,
    },
  },
  computed: {
    isDraggable() {
      return (node) => {
        // Allow dragging for all nodes
        return true;
      };
    },
  },

  methods: {
    async fetchHierarchy() {
      this.loading = true; // Show loading spinner
      this.isFetching = true; // Set flag to true before fetching
      const minDelay = new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const relations = ["parentFamily", "familiesOlny"]; // Include necessary relations  
        const fetchData = this.api.getAll({ with: relations });

        // Wait for both the API call and the minimum delay
        const [response] = await Promise.all([fetchData, minDelay]);

        if (response && Array.isArray(response)) {
          const structuredDomains = this.structureHierarchy(response);
          this.treeData = structuredDomains;
          this.initialTreeData = JSON.parse(JSON.stringify(structuredDomains));
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Error fetching the hierarchy:", error);
      } finally {
        this.loading = false; // Hide loading spinner
        this.isFetching = false; // Reset flag after fetching
      }
    },

    structureHierarchy(domains) {
      const domainMap = new Map();
      const structuredDomains = [];

      // First, map all domains by their ID
      domains.forEach(domain => {
        if (!domain.id) {
          console.error("Domain is missing an ID:", domain);
          return;
        }

        domainMap.set(domain.id, {
          ...domain,
          children: [],
          li_attr: domain.li_attr || {},
          a_attr: domain.a_attr || {},
        });
      });

      // Sort domains by their order
      const sortedDomains = Array.from(domainMap.values()).sort((a, b) => a.order - b.order);

      // Build the hierarchy
      sortedDomains.forEach(domain => {
        if (domain.parent_id) {
          const parentDomain = domainMap.get(domain.parent_id);
          if (parentDomain) {
            // Sort children by order before pushing
            parentDomain.children.push(domainMap.get(domain.id));
            parentDomain.children.sort((a, b) => a.order - b.order);
          }
        } else {
          structuredDomains.push(domainMap.get(domain.id));
        }
      });

      // Recursively process domains and assign icons
      const processDomain = (domain) => {
        const children = [];
        if (domain.children && domain.children.length) {
          // Sort children by order
          domain.children.sort((a, b) => a.order - b.order);
          domain.children.forEach(child => {
            const childData = processDomain(child);
            children.push(...childData);
          });
        }

        // Assign icons based on node type and hierarchy
        let icon;
        if (domain.children.length) {
          icon = "fas fa-globe"; // Icon for domains with children (parent domains)
        } else if (domain.parent_id) {
          icon = "fas fa-folder"; // Icon for subdomains (child domains)
        } else {
          icon = "fas fa-star"; // Icon for domains that are neither parent nor child
        }

        return [
          {
            id: domain.id, // Ensure domain ID is prefixed with 'D'
            text: domain.name,
            type:
              !domain.children.length && !domain.parent_id ? 'main' : // If no children and no parent, type is 'main'
                domain.children.length ? 'domain' : 'subdomain', // Otherwise, set type based on children
            order: domain.order,
            parent_id: domain.parent_id,
            state: { opened: false },
            icon: icon, // Assign the icon here
            li_attr: { style: `color: ${domain.color ? domain.color.hexcolor : "#000000"} !important` },
            a_attr: { style: `color: ${domain.color ? domain.color.hexcolor : "#000000"} !important` },
            children,
          },
        ];
      };

      // Sort the top-level domains by order before processing
      structuredDomains.sort((a, b) => a.order - b.order);
      return structuredDomains.flatMap(domain => processDomain(domain));
    },

    compareTreeData(oldTreeData, newTreeData) {
      const changes = [];

      const buildParentMap = (nodes, parentId = null) => {
        const map = new Map();
        nodes.forEach(node => {
          if (!node.id) {
            console.error("Node is missing an ID:", node);
            return;
          }

          map.set(node.id, {
            parentId,
            text: node.text || 'Unknown',
            type: node.id.startsWith('D') ? 'domain' : 'subdomain',
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
            oldParentText: oldNodeData.parentId ? (oldParentMap.get(oldNodeData.parentId)?.text || 'Root') : 'Root',
            newParentText: newNodeData.parentId ? (newParentMap.get(newNodeData.parentId)?.text || 'Root') : 'Root',
          });
        }
      });

      return changes;
    },
    async onTreeChange(event) {
      if (!event) {
        console.error("Event is undefined.");
        return;
      }

      const { newTreeData, oldTreeData } = event;

      // Compare the old and new tree data to detect changes
      const changes = this.compareTreeData(oldTreeData, newTreeData);

      if (changes.length > 0) {
        try {
          // Update the order of nodes based on their new position
          const updateOrder = (nodes, parentId = null) => {
            nodes.forEach((node, index) => {
              node.order = index + 1; // Update the order based on the new position
              if (node.children && node.children.length) {
                updateOrder(node.children, node.id);
              }
            });
          };

          updateOrder(newTreeData);

          // Find the moved node and its new position
          changes.forEach(change => {
            const movedNode = this.findNodeById(newTreeData, change.id);
            if (movedNode) {
              const newPosition = movedNode.order;
              const newParentName = change.newParentText || 'Root';
              // Update the order in the changes array for the backend
              change.newPosition = newPosition; // Adding newPosition to the change object
            }
          });

          // Corrected API call
          const response = await this.api.dragDomainSubDomain({
            changes,
            newTreeData
          });

          if (response.data && response.data.notificationCode) {
            switch (response.data.notificationCode) {
              case 'DOMAIN_UNDER_SUBDOMAIN_ERROR':
              case 'SUBDOMAIN_UNDER_SUBDOMAIN_ERROR':
              case 'SUBDOMAIN_OUTSIDE_DOMAIN_ERROR':
              case 'DOMAIN_SUBDOMAIN_LIMIT_REACHED':
              case 'PARENT_DOMAIN_UNDER_PARENT_DOMAIN_ERROR':
                // Revert to the previous state of the tree
                this.treeData = JSON.parse(JSON.stringify(this.previousTreeData));
                this.showSwal('error', 'Error', response.data.message || "An error occurred while updating the tree data.");
                // Reload the hierarchy on error
                this.fetchHierarchy();
                break;

              case 'CHANGES_APPLIED_SUCCESS':
                // Update the previousTreeData to the current state
                this.previousTreeData = JSON.parse(JSON.stringify(newTreeData));
                this.showSwal('success', 'Success', response.data.changes || "Tree data updated successfully.");
                this.fetchHierarchy();
                break;

              case 'NO_CHANGES_MADE':
                console.log("No changes were made.");
                this.fetchHierarchy();
                break;

              default:
                console.warn("Unknown notification code:", response.data.notificationCode);
                // Reload the hierarchy for unknown errors
                this.fetchHierarchy();
                break;
            }
          } else {
            console.error("Invalid backend response:", response.data);
            // Reload the hierarchy for invalid backend responses
            this.fetchHierarchy();
          }
        } catch (error) {
          console.error("Error updating tree data:", error);
          // Revert to the previous state of the tree
          this.treeData = JSON.parse(JSON.stringify(this.previousTreeData));
          this.showSwal('error', 'Error', error.response?.data?.message || "An error occurred while updating the tree data.");
          // Reload the hierarchy on error
          this.fetchHierarchy();
        }
      } else {
        console.log("No changes detected.");
      }
    },

    // Helper function to display Swal alerts
    async showSwal(type, title, message, customClass = {}, timer = 3000) {
      Swal.fire({
        icon: type,
        title: title,
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: timer,
        background: type === 'error' ? '#ffebee' : '#e8f5e9',
        iconColor: type === 'error' ? '#d32f2f' : '#4caf50',
        customClass: {
          popup: 'custom-swal-popup',
          title: this.$t("domain.customswaltitle"),
          content: 'custom-swal-content',
        }
      });
    },


    // Helper method to find a node by its ID in the tree
    findNodeById(nodes, id) {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        if (node.children && node.children.length) {
          const found = this.findNodeById(node.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },

    onDragEnd(event) {
      console.log("Drag ended event:", event);
      const finalTreeData = JSON.parse(JSON.stringify(this.treeData));
      this.onTreeChange({ newTreeData: finalTreeData, oldTreeData: this.initialTreeData });
      this.initialTreeData = finalTreeData;
    },

    async deleteDomain(domain) {
      try {
        // Send a DELETE request to the API endpoint
        const response = await this.api.delete(`${domain}`);
        // Refresh the hierarchy data after deletion
        this.fetchHierarchy();
      } catch (error) {
        console.error("Error deleting department:", error);
      }
    },

    // Open the form for adding or editing an item
    async openForm() {
      // Reset the newItem object
      this.newItem = {};
      // Open the form
      this.isFlipped = true;
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;
      this.fetchHierarchy();
      this.newItem = {};
    },

    async editItem(data) {
      // Extract the required fields from the node data
      this.newItem = {
        id: data.id,
        name: data.text, // Map 'text' to 'name'
        order: data.order || 0, // Use 'order' if it exists, otherwise default to 0
        parent_id: data.parent_id || null, // Use 'parent_id' if it exists, otherwise default to null
      };
      this.isFlipped = true; // Show the form for editing
    },
    async addItemToMainAndParentDomain(data) {
      // Extract the required fields from the node data
      this.newItem = {
        parent_id: data.id || null, // Use 'parent_id' if it exists, otherwise default to null
      };
      this.isFlipped = true; // Show the form for editing
    }
  },
};
</script>

<style scoped>
/* General card styling */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
  width: 60%;
}

/* Card header styling */
.card-header {
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* Card body styling */
.card-body {
  padding: 16px;
}

/* Styling the Draggable component */
.mtl-tree {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
  border: 1px solid #ddd;
}

/* Styling the individual nodes within the tree */
.node-text {
  font-size: 14px;
  color: #333;
  padding-left: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.node-text:hover {
  background-color: #e2e2e2;
  /* Highlight node text on hover */
}

/* Styling for icons */
.node-icon {
  margin-right: 8px;
  font-size: 16px;
}

/* Checkbox style */
.mtl-checkbox {
  margin-right: 8px;
}

/* Add some margin and spacing for child elements */
.mtl-mr {
  margin-right: 8px;
}

.mtl-tree .node-text {
  padding-left: 20px;
  /* Indentation for child nodes */
}

/* Style the draggable items while dragging */
.mtl-tree .dragging {
  opacity: 0.7;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
}

/* Style for the tree lines */
.tree-line {
  border-left: 2px dashed #ddd;
  margin-left: 10px;
}

/* Modal styles */
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
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

button {
  margin-top: 10px;
}

/* Loading spinner styles */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 18px;
  color: #333;
}

.loading-spinner i {
  margin-right: 10px;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-top: 0;
}

/* Employee/Department Details Styling */
.detail-item {
  margin-bottom: 10px;
}

.detail-label {
  font-weight: bold;
  margin-right: 10px;
}

.detail-value {
  color: #555;
}

.profile-image {
  max-width: 100px;
  border-radius: 50%;
  margin-top: 10px;
}

/* Button Styling */
button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background: #0056b3;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal Content */
.modal-content {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

/* Modal Title */
.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.delete-icon {
  margin-left: 10px;
  cursor: pointer;
  color: #5a5656;

}

.edit-icon {
  margin-left: 10px;
  cursor: pointer;

}

.plus-icon {
  margin-left: 10px;
  cursor: pointer;

}

.edit-icon:hover,
.plus-icon:hover,
.delete-icon:hover {
  color: #007bff;
  /* Change color on hover */
}
</style>
<style>
/* Style for the popup */
.custom-swal-popup {
  font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman', 'sans-serif';
  : "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman', 'sans-serif';
  /* Customize font family */
  border-radius: 12px;
  /* Rounded corners */
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  /* White background */
}

/* Style for the title */
.custom-swal-title {
  font-size: 18px;
  /* Adjusted font size */
  font-weight: bold;
  color: #333;
  /* Dark gray color for the title */
  margin-bottom: 10px;
}

/* Style for the content */
.custom-swal-content {
  font-size: 1px;
  /* Larger title font */
  color: #333;
  /* Dark text for content */
  font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman', 'sans-serif';
  /* Different font family for content */
}

.swal2-toast div:where(.swal2-html-container) {
  margin: 0px;
  padding: 0;
  overflow: initial;
  font-size: 12px;
  text-align: initial;
}

.swal2-toast h2:where(.swal2-title) {
  margin: 0px;
  padding: 0;
  font-size: 14px;
  text-align: initial;
}
</style>