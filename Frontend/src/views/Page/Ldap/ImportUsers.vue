<template>
  <main-page ref="page" :isFlipped="true" :mainPage="'ldap.ImportUsers'"
    :subPage="'ldap.ImportUsers'" :titlePage="'ldap.ImportUsers'">
    
    <template #datatable>
        <div class="card-header">
          <h3 class="card-title">Users Hierarchy</h3>
        </div>
        <div class="card-body">
        
          <BaseTree v-model="treeData" ref="tree" @check:node="onCheckNode" treeLine>
            <template #default="{ node, stat }">
              <div class="tree-node" :class="{ 'last-child': !node.children }">
                <button class="toggle-btn" v-if="node.children" @click="stat.open = !stat.open">
                  <i :class="stat.open ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                </button>
                
                <label class="custom-checkbox">
                  <input type="checkbox" v-model="stat.checked" :disabled="node.noEmail" />
                  <span class="checkmark"></span>
                </label>

                <span v-if="!node.children"> <i class="fas fa-user"></i> </span>
                <span class="node-text"> {{ node.text }}</span>
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
    this.getUsers();
  },

  methods: {
    async getUsers() {
      try {
        const response = await this.api.getUsers();
        this.treeData = this.transformDepartmentData(response.data);
      } catch (error) {
        console.error("Error fetching department data:", error.response?.data || error.message);
      }
    },

    transformDepartmentData(departmentData) {
      return Object.keys(departmentData).map(departmentName => {
        const department = departmentData[departmentName];
        let children = [];
        
        Object.keys(department).forEach(subDeptName => {
          if (subDeptName === "users") {
            children.push(...department[subDeptName].map(user => ({
              text: `${user.full_name} (${user.email || 'No Email'})`,
              children: undefined,
              noEmail: !user.email
            })));
          } else {
            const subDept = department[subDeptName];
            let subChildren = [];
            
            if (subDept.users) {
              subChildren = subDept.users.map(user => ({
                text: `${user.full_name} (${user.email || 'No Email'})`,
                children: undefined,
                noEmail: !user.email
              }));
            }
            
            children.push({
              text: subDeptName,
              children: subChildren
            });
          }
        });

        return {
          text: departmentName,
          children: children
        };
      });
    },

    onCheckNode() {
      this.checked = this.$refs.tree.getChecked().map(v => v.data.text);
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

.last-child {
  margin: 0 25px;
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

.custom-checkbox input:disabled + .checkmark {
  border-color: #ccc;
  background-color: #eee;
  cursor: not-allowed;
}

/* User Icon */
.user-icon {
  color: #44225c;
  margin-right: 5px;
}

/* Node Text */
.node-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}
.fa-user{
  margin: 0 5px;
}
</style>
<style>
.page-title-card {
    padding-inline: 1.5625rem !important;
    padding-block: 0.625rem !important;
}
</style>