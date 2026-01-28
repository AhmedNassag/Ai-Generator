<template>
  <main-page ref="page" :isFlipped="true" :mainPage="'ldap.ImportDepartment'"
    :subPage="'ldap.ImportDepartment'" :titlePage="'ldap.ImportDepartment'">
    
    <template #datatable>
        <div class="card-header">
          <h3 class="card-title">Department Hierarchy</h3>
        </div>
        <div class="card-body">
        
          <BaseTree v-model="treeData" ref="tree" @check:node="onCheckNode" treeLine>
            <template #default="{ node, stat }">
              <div class="tree-node">
                <button class="toggle-btn" v-if="node.children" @click="stat.open = !stat.open">
                  <i :class="stat.open ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                </button>
                
                <label class="custom-checkbox">
                  <input type="checkbox" v-model="stat.checked" />
                  <span class="checkmark"></span>
                </label>

                <span class="node-text">{{ node.text }}</span>
              </div>
            </template>
          </BaseTree>
          <div class="card-footer">
            <hr>
          <button class="submit-btn btn btn-primary" @click="submitCheckedItems">Submit</button>
        </div>
      </div>
    </template>

  </main-page>
</template>

<script>
import ldap from "@/API/Ldap/Ldap";
import MainPage from "@/components/MainPage.vue";
import "@fortawesome/fontawesome-free/css/all.css";
import { BaseTree } from "@he-tree/vue";
import "@he-tree/vue/style/default.css";
import "@he-tree/vue/style/material-design.css";

export default {
  components: {
    MainPage,
    BaseTree
  },

  data() {
    return {
      treeData: [],
      checked: []
    };
  },

  created() {
    this.fetchDepartmentData();
  },

  methods: {
    async fetchDepartmentData() {
      try {
        const response = await this.api.getDepartments();
        this.departments = response.data;
        this.transformDepartmentData(this.departments);
      } catch (error) {
        console.error("Error fetching department data:", error.response?.data || error.message);
      }
    },

    transformDepartmentData(departmentData) {
      const transformedData = Object.keys(departmentData).map(departmentName => ({
        text: departmentName,
        children: this.transformSubDepartments(departmentData[departmentName])
      }));
      this.treeData = transformedData;
    },

    transformSubDepartments(subDepartments) {
      return Object.keys(subDepartments).map(subDepartmentName => ({
        text: subDepartmentName,
        children: subDepartments[subDepartmentName].length ? [] : undefined
      }));
    },

    onCheckNode() {
      this.checked = this.$refs.tree.getChecked().map(v => v.data.text);
    },
    async submitCheckedItems() {
    if (this.checked.length === 0) {
      alert("Please select at least one department.");
      return;
    }

    try {
      const response = await this.api.importDepartments({ departments: this.checked });
 
    } catch (error) {
      console.error("Error importing departments:", error.response?.data || error.message);
    }
  }
  },

  setup() {
    const api = new ldap();
    return { api };
  }
};
</script>

<style scoped>
/* Card Styles */
.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.card-header {
  background-color: #f5f6f9;

  padding: 1rem;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}


/* Tree Node Styling */
.tree-node {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  transition: background 0.3s;
  border-radius: 5px;
}

.tree-node:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

/* Toggle Button */
.toggle-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;
  color: #44225c;
}

.toggle-btn i {
  transition: transform 0.2s;
}

/* Custom Checkbox */
.custom-checkbox {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.checkmark {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 4px;
  border: 2px solid #44225c;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}

.custom-checkbox input:checked + .checkmark {
  background-color: #44225c;
}

.custom-checkbox input:checked + .checkmark:after {
  content: "✔";
  font-size: 12px;
  color: white;
}

/* Node Text */
.node-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

</style>
<style>
.page-title-card {
    padding-inline: 1.5625rem !important;
    padding-block: 0.625rem !important;
}
</style>