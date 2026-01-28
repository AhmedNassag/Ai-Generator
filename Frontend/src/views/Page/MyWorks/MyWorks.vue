<template>
  <!-- Main Page component where the layout and page structure are set -->
  <VContainer fluid>
    <VCard>
      <VCardText>
        <div class="d-flex justify-space-between align-center mb-6 rtl">
          <h1 class="text-h4 font-weight-bold">My Works</h1>

        </div>
        <!-- Tabs -->
        <TabsComponent :tabs="tabs" v-model="activeComponent" @update:modelValue="handleTabChange" />
        <!-- Widget Controls -->
        <VCard style="background-color: #F5F5F5;">
          <VCardText>
            <div class="card">
              <div class="card-header">
                <router-link :to="getCurrentRoute()" class="btn btn-primary">
                  <h3 class="card-title">{{ getCurrentTitle() }}</h3>
                </router-link>
              </div>
              <div class="card-body">
                <!-- Conditional Rendering based on activeComponent -->
                <task-data-table v-if="activeComponent === 'tasks'" :users="users" />
                <!-- <sp-deliverable-task v-else-if="activeComponent === 'strategic'" :strategicPlan="activedStrategicPlan" -->
                  <!-- :users="users" /> -->
                <document-review v-else-if="activeComponent === 'documents'" :users="users" />
                <evidence-update-tasks v-else-if="activeComponent === 'evidence'" :users="users" />
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCardText>
    </VCard>



  </VContainer>


</template>

<script>
import MainPage from "@/components/MainPage.vue";
import TaskDataTable from "./Components/GeneralTasks.vue";
//import SpDeliverableTask from "./Components/SpDeliverableTask.vue";
import DocumentReview from "./Components/DocumentReview.vue";
import EvidenceUpdateTasks from "./Components/EvidenceUpdateTasks.vue";
import StrategicPlan from "@/API/StrategicPlan/StrategicPlan";
import User from "@/API/User/User";
import TabsComponent from "@/components/TabsComponent.vue";

export default {
  name: "ModernCollapseList",
  components: {
    MainPage,
    TaskDataTable,
    //SpDeliverableTask,
    DocumentReview,
    EvidenceUpdateTasks,
    TabsComponent
  },
  setup() {
    const strategicPlanApi = new StrategicPlan();
    const userApi = new User();
    return {
      strategicPlanApi,
      userApi,
    };
  },

  async created() {
    // this.activedStrategicPlan = await this.strategicPlanApi.getAll({
    //   filter: `status|true-boolean|=`,
    //   select: "id|name",
    // });
    // this.strategicPlan = this.activedStrategicPlan[0] || {};
    this.users = await this.userApi.getAll({ select: "id|full_name" });
  },

  data() {
    return {
      users: [],
      isFlipped: false,
      activedStrategicPlan: [],
      strategicPlan: {},
      activeComponent: 'evidence', // Default active component strategic
      tabs: [{ id: 'tasks', label: "General Tasks" },
      // { id: 'strategic', label: "Strategic Plan" },
      { id: 'documents', label: "Document Reviews" },
      { id: 'evidence', label: "Evidence Tasks" },
      ]
    };
  },

  methods: {
    async handleTabChange() {
      // activeComponent

    },
    getCurrentTitle() {
      const titles = {
        tasks: 'General Tasks',
        strategic: this.activedStrategicPlan[0]?.name || 'Strategic Plan',
        documents: 'Document Reviews',
        evidence: 'Evidence Tasks'
      };
      return titles[this.activeComponent];
    },

    getCurrentRoute() {
      const routes = {
        tasks: '/task',
        strategic: `/strategic-plan-details/${this.activedStrategicPlan[0]?.id}`,
        documents: '/document',
        evidence: '/requirement'
      };
      return routes[this.activeComponent];
    }
  },
};
</script>

<style scoped>
.toggle-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.toggle-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 3px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  /* Adjust this value as needed */
}

.card-header {
  background: #f9fafb;
  padding: 16px 20px;
  border-bottom: 3px solid #e5e7eb;
  flex-shrink: 0;
  /* Prevents header from shrinking */
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.card-body {
  overflow-y: auto;
  /* Enables vertical scrolling */
  flex: 1;
  /* Takes up remaining space */
  padding: 20px;
}

/* Custom scrollbar styling */
.card-body::-webkit-scrollbar {
  width: 8px;
}

.card-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.card-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.card-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
[dir="rtl"] .rtl-end {
  text-align: end !important;
}
</style>