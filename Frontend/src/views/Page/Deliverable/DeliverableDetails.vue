<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('deliverable.deliverabledetails')"
    :subPage="$t('deliverable.deliverabledetails')"
    :titlePage="$t('deliverable.deliverabledetails')"
  >
    <template #datatable>
      <div class="container">
        <v-app>
          <!-- Tabs -->
          <v-tabs
            v-model="tab"
            background-color="purple darken-4"
            dark
            grow
            class="mb-0"
          >
            <v-tab value="details">{{ $t("deliverable.Details") }}</v-tab>
            <v-tab value="tasks">{{ $t("deliverable.Tasks") }}</v-tab>
            <v-tab value="comments">{{ $t("deliverable.Comments") }}</v-tab>
            <v-tab value="log">{{ $t("deliverable.Log") }}</v-tab>
          </v-tabs>

          <!-- Custom Tab Content without v-window -->
          <div class="tab-content">
            <!-- Details Tab -->
            <div v-show="tab === 'details'" class="tab-panel">
              <deliverable-details-tab
                :deliverableDetails="deliverableDetails"
                :users="users"
                :teams="teams"
                class="pa-4"
              ></deliverable-details-tab>
            </div>
            
            <!-- Deliverables Tab -->
            <!-- Tasks Tab -->
            <div v-show="tab === 'tasks'" class="tab-panel">
              <!-- Show loading spinner while data is loading -->
              <div v-if="isLoading" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p>{{ $t("deliverable.Loading") }}...</p>
              </div>
              <!-- Only render Milestone component when data is loaded -->
              <Task 
                v-else-if="deliverableDetails && tasksData.length >= 0"
                :tasksData="tasksData" 
                :milestone_id="deliverableDetails?.id"
                :users="users"
              >
              </Task>
            </div>
            
            <!-- Comments Tab -->
            <div v-show="tab === 'comments'" class="tab-panel">
                <Comment
                  v-if="deliverableDetails?.id"
                  commentableType="App\Models\Deliverable\Deliverable"
                  :commentableId="deliverableDetails.id"
                  :users="users"
                />
            </div>
            
            <!-- Log Tab -->
            <div v-show="tab === 'log'" class="tab-panel">
              <v-card flat class="pa-4">
                <Log :logs="logs"></Log>
              </v-card>
            </div>
          </div>
        </v-app>
      </div>
    </template>
  </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import DeliverableDetailsTab from "@/views/Page/Deliverable/Components/DeliverableDetailsTab.vue";
import Deliverable from "@/API/Deliverable/Deliverable";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Task from "@/views/Page/SPTask/Task";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import LogAPI from "@/API/Log/Log";

export default {
  name: "DeliverableView",

  components: {
    MainPage,
    DeliverableDetailsTab,
    Task,
    Comment,
    Log
  },
  
  setup() {
    const deliverableApi = new Deliverable();
    const userApi = new User();
    const teamApi = new Team();
    const logApi = new LogAPI();

    return {
      deliverableApi,
      userApi,
      teamApi,
      logApi,
    };
  },
  
  data() {
    return {
      tab: this.$route.query.tab || "details",
      deliverableDetails: null,
      users: [],
      teams: [],
      isLoading: false,
      tasksData: [],
      logs: [],
    };
  },
  
  async mounted() {
    await this.loadDeliverableDetails(this.$route.params.id);
    await this.fetchLogs();
    this.users = await this.userApi.getAll({ select: "id|full_name|email|phone" });
    this.teams = await this.teamApi.getAll({ select: "id|name" });
  },
  
  methods: {
    async fetchLogs() {
      try {
        this.logs = await this.logApi.getModelLogs(
          "Deliverable",
          this.deliverableDetails.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },

    async loadDeliverableDetails(deliverableId) {
      if (!deliverableId) return;
      try {
        this.isLoading = true;
        const response = await this.deliverableApi.show(deliverableId, {
          with: [
            "milestone",
            "tasks",
          ],
        });
        this.deliverableDetails = response;
        // all project tasks with removing duplicates
        const allTasks = [
          ...(this.deliverableDetails.tasks || []),
        ];
        // Remove duplicates by deliverable ID (assuming deliverables have unique ids)
        this.tasksData = allTasks.filter(
          (task, index, self) => 
            index === self.findIndex(m => m.id === task.id)
        );
      } catch (error) {
        // Assuming notify is available globally
        if (typeof notify !== 'undefined') {
          notify({
            title: "Error",
            text: "Failed to load deliverable details",
            type: "error",
          });
        }
      } finally {
        this.isLoading = false;
      }
    },
  },

  watch: {
    '$route.query.tab': {
      handler(newTab) {
        this.tab = newTab || 'details';
      },
      immediate: true
    },

    //tasksData
    tasksData: {
      handler(newVal) {
        console.log('Tasks data changed:', newVal);
      },
      deep: true
    },
  },
};
</script>

<style>
/* Tab content styling */
.tab-content {
  background-color: white;
  min-height: auto;
  height: auto;
}

.tab-panel {
  height: auto;
  min-height: auto;
  display: block;
}

/* Optional: Add fade transition between tabs */
.tab-panel {
  transition: opacity 0.2s ease-in-out;
}

/* Ensure container doesn't constrain height */
.container {
  height: auto;
  min-height: auto;
}
</style>