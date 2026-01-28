<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('milestone.milestonedetails')"
    :subPage="$t('milestone.milestonedetails')"
    :titlePage="$t('milestone.milestonedetails')"
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
            <v-tab value="details">{{ $t("milestone.Details") }}</v-tab>
            <v-tab value="deliverables">{{ $t("milestone.Deliverables") }}</v-tab>
            <!-- <v-tab value="tasks">{{ $t("milestone.Tasks") }}</v-tab> -->
            <v-tab value="comments">{{ $t("milestone.Comments") }}</v-tab>
            <v-tab value="log">{{ $t("milestone.Log") }}</v-tab>
          </v-tabs>

          <!-- Custom Tab Content without v-window -->
          <div class="tab-content">
            <!-- Details Tab -->
            <div v-show="tab === 'details'" class="tab-panel">
              <milestone-details-tab
                :milestoneDetails="milestoneDetails"
                :users="users"
                :teams="teams"
                :user="user"
                :workflow="workflow"
                :workflowSteps="workflowSteps"
                class="pa-4"
              ></milestone-details-tab>
            </div>
            
            <!-- Deliverables Tab -->
            <div v-show="tab === 'deliverables'" class="tab-panel">
              <div v-if="isLoading" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p>{{ $t("milestone.Loading") }}...</p>
              </div>
              <Deliverable
                v-else-if="milestoneDetails && deliverablesData.length >= 0"
                :deliverablesData="deliverablesData" 
                :project_id="milestoneDetails?.id"
              >
              </Deliverable>
            </div>
            
            <!-- Tasks Tab -->
            <!-- <div v-show="tab === 'tasks'" class="tab-panel">
              <div v-if="isLoading" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p>{{ $t("milestone.Loading") }}...</p>
              </div>
              <Task 
                v-else-if="milestoneDetails && tasksData.length >= 0"
                :tasksData="tasksData" 
                :milestone_id="milestoneDetails?.id"
              >
              </Task>
            </div> -->
            
            <!-- Comments Tab -->
            <div v-show="tab === 'comments'" class="tab-panel">
                <Comment
                  v-if="milestoneDetails?.id"
                  commentableType="App\Models\Milestone\Milestone"
                  :commentableId="milestoneDetails.id"
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
import MilestoneDetailsTab from "@/views/Page/Milestone/Components/MilestoneDetailsTab.vue";
import Milestone from "@/API/Milestone/Milestone";
import milestoneSetting from "@/API/MilestoneSetting/MilestoneSetting";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Deliverable from "@/views/Page/Deliverable/Deliverable";
// import Task from "@/views/Page/Task/Task";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import Workflow from "@/API/Workflow/Workflow";
import Auth from "@/API/Auth";
import LogAPI from "@/API/Log/Log";

export default {
  name: "MilestoneView",

  components: {
    MainPage,
    MilestoneDetailsTab,
    Milestone,
    Workflow,
    Deliverable,
    // Task,
    Comment,
    Log
  },
  
  setup() {
    const milestoneApi = new Milestone();
    const userApi = new User();
    const teamApi = new Team();
    const milestoneSettingApi = new milestoneSetting();
    const workflowApi = new Workflow();
    const logApi = new LogAPI();

    return {
      milestoneApi,
      userApi,
      teamApi,
      milestoneSettingApi,
      workflowApi,
      logApi,
    };
  },
  
  data() {
    return {
      tab: this.$route.query.tab || "details",
      milestoneDetails: null,
      users: [],
      teams: [],
      isLoading: false,
      milestoneSettings: [],
      workflow: {},
      workflowSteps: [],
      currentTransitions: [],
      deliverablesData: [],
      // tasksData: [],
      logs: [],
      /** auth_user data ***/
      user:{},
      /*** end auth user data */
    };
  },
  
  async mounted() {
    this.user = Auth.USER;
    await this.loadMilestoneDetails(this.$route.params.id);
    await this.fetchLogs();
    this.users = await this.userApi.getAll({ select: "id|full_name|email|phone" });
    this.teams = await this.teamApi.getAll({ select: "id|name" });
    this.milestoneSettings = await this.milestoneSettingApi.getAll({ filter: `type|milestone|=`, select: "id|workflowCategory_id|steps" });
    this.workflow = await this.workflowApi.show(this.milestoneDetails.workflow_id);
    if(this.workflow.workflowCategory_id == this.milestoneSettings[0]?.workflowCategory_id) {
      this.workflowSteps = this.workflow.steps;
    } else {
      this.workflowSteps = [];
    }
  },
  
  methods: {
    async fetchLogs() {
      try {
        this.logs = await this.logApi.getModelLogs(
          "Milestone",
          this.milestoneDetails.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },

    async loadMilestoneDetails(milestoneId) {
      if (!milestoneId) return;
      try {
        this.isLoading = true;
        const response = await this.milestoneApi.show(milestoneId, {
          with: [
            "project",
            "deliverables",
            /*.tasks*/
          ],
        });

        this.milestoneDetails = response;
     
        // all project deliverables with removing duplicates
        const allDeliverables = [
          ...(this.milestoneDetails.deliverables || []),
        ];
        // Remove duplicates by deliverable ID (assuming deliverables have unique ids)
        this.deliverablesData = allDeliverables.filter(
          (deliverable, index, self) => 
            index === self.findIndex(m => m.id === deliverable.id)
        );

        // all project deliverables with removing duplicates
        // const allTasks = this.milestoneDetails.deliverables
        //   .flatMap(deliverable => deliverable.tasks || [])
        //   .filter(task => task); // Remove any undefined/null values
        // // Remove duplicates by deliverable ID (assuming deliverables have unique ids)
        // this.tasksData = allTasks.filter(
        //   (task, index, self) => 
        //     index === self.findIndex(m => m.id === task.id)
        // );
      } catch (error) {
        // Assuming notify is available globally
        if (typeof notify !== 'undefined') {
          notify({
            title: this.$t("milestone.Error"),
            text: this.$t("milestone.Failed to load milestone details"),
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

    //deliverablesData
    deliverablesData: {
      handler(newVal) {
        console.log('Deliverables data changed:', newVal);
      },
      deep: true
    },

    //tasksData
    // tasksData: {
    //   handler(newVal) {
    //     console.log('Tasks data changed:', newVal);
    //   },
    //   deep: true
    // },
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