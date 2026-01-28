<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('project.projectdetails')"
    :subPage="$t('project.projectdetails')"
    :titlePage="$t('project.projectdetails')"
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
            <v-tab value="details">{{ $t("project.Details") }}</v-tab>
            <v-tab value="milestones">{{ $t("project.Milestones") }}</v-tab>
            <!-- <v-tab value="deliverables">{{ $t("project.Deliverables") }}</v-tab>
            <v-tab value="tasks">{{ $t("project.Tasks") }}</v-tab> -->
            <v-tab value="comments">{{ $t("project.Comments") }}</v-tab>
            <v-tab value="log">{{ $t("project.Log") }}</v-tab>
          </v-tabs>

          <!-- Custom Tab Content without v-window -->
          <div class="tab-content">
            <!-- Details Tab -->
            <div v-show="tab === 'details'" class="tab-panel">
              <project-details-tab
                :projectDetails="projectDetails"
                :users="users"
                :teams="teams"
                class="pa-4"
              ></project-details-tab>
            </div>
            
            <!-- Milestones Tab -->
            <div v-show="tab === 'milestones'" class="tab-panel">
              <div v-if="isLoading" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p>{{ $t("project.Loading") }}...</p>
              </div>
              <Milestone 
                v-else-if="projectDetails && milestonesData.length >= 0"
                :milestonesData="milestonesData" 
                :project_id="projectDetails?.id"
                :users="users"
              >
              </Milestone>
            </div>
            
            <!-- Deliverables Tab -->
            <!-- <div v-show="tab === 'deliverables'" class="tab-panel">
              <div v-if="isLoading" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p>{{ $t("project.Loading") }}...</p>
              </div>
              <Deliverable
                v-else-if="projectDetails && deliverablesData.length >= 0"
                :deliverablesData="deliverablesData" 
                :project_id="projectDetails?.id"
              >
              </Deliverable>
            </div> -->
            
            <!-- Tasks Tab -->
            <!-- <div v-show="tab === 'tasks'" class="tab-panel">
              <div v-if="isLoading" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p>{{ $t("project.Loading") }}...</p>
              </div>
              <Task 
                v-else-if="projectDetails && tasksData.length >= 0"
                :tasksData="tasksData" 
                :project_id="projectDetails?.id"
              >
              </Task>
            </div> -->
            
            <!-- Comments Tab -->
            <div v-show="tab === 'comments'" class="tab-panel">
                <Comment
                  v-if="projectDetails?.id"
                  commentableType="App\Models\Project\Project"
                  :commentableId="projectDetails.id"
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
import ProjectDetailsTab from "@/views/Page/Project/Components/ProjectDetailsTab.vue";
import Project from "@/API/Project/Project";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Milestone from "@/views/Page/Milestone/Milestone";
// import Deliverable from "@/views/Page/Deliverable/Deliverable";
// import Task from "@/views/Page/Task/Task";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import LogAPI from "@/API/Log/Log";

export default {
  name: "ProjectView",

  components: {
    MainPage,
    ProjectDetailsTab,
    Milestone,
    // Deliverable,
    // Task,
    Comment,
    Log
  },
  
  setup() {
    const projectApi = new Project();
    const userApi = new User();
    const teamApi = new Team();
    const logApi = new LogAPI();
    return {
      projectApi,
      userApi,
      teamApi,
      logApi,
    };
  },
  
  data() {
    return {
      tab: this.$route.query.tab || "details",
      projectDetails: null,
      isLoading: false,
      users: [],
      teams: [],
      milestonesData: [],
      // deliverablesData: [],
      // tasksData: [],
      logs: [],
    };
  },
  
  async mounted() {
    await this.loadProjectDetails(this.$route.params.id);
    await this.fetchLogs();
    this.users = await this.userApi.getAll({ select: "id|full_name|email|phone" });
    this.teams = await this.teamApi.getAll({ select: "id|name" });
  },
  
  methods: {
    async fetchLogs() {
      try {
        this.isLoading = true;
        this.logs = await this.logApi.getModelLogs(
          "Project",
          this.projectDetails.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async loadProjectDetails(projectId) {
      if (!projectId) return;
      try {
        this.isLoading = true;
        const response = await this.projectApi.show(projectId, {
          with: [
            "initiative",
            "program",
            "milestones",
            /*.deliverables.tasks*/
          ],
        });
        
        
        this.projectDetails = response;

        // all project milestones with removing duplicates
        const allMilestones = [
          ...(this.projectDetails.milestones || []),
        ];
        // Remove duplicates by milestone ID (assuming milestones have unique ids)
        this.milestonesData = allMilestones.filter(
          (milestone, index, self) => 
            index === self.findIndex(p => p.id === milestone.id)
        );

        // all project deliverables with removing duplicates
        // const allDeliverables = this.projectDetails.milestones
        //   .flatMap(milestone => milestone.deliverables || [])
        //   .filter(deliverable => deliverable); // Remove any undefined/null values
        // // Remove duplicates by deliverable ID (assuming deliverables have unique ids)
        // this.deliverablesData = allDeliverables.filter(
        //   (deliverable, index, self) => 
        //     index === self.findIndex(p => p.id === deliverable.id)
        // );

        // all project tasks with removing duplicates
        // const allTasks =  this.projectDetails.milestones
        //   .flatMap(milestone => milestone.deliverables || []) // Get all deliverables
        //   .flatMap(deliverable => deliverable.tasks || [])    // Get all tasks
        //   .filter(task => task); // Remove any undefined/null values
        // // Remove duplicates by task ID (assuming tasks have unique ids)
        // this.tasksData = allTasks.filter(
        //   (task, index, self) => 
        //     index === self.findIndex(p => p.id === task.id)
        // );

      } catch (error) {
        if (typeof notify !== 'undefined') {
          notify({
            title: this.$t("project.Error"),
            text: this.$t("project.Failed to load project details"),
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

    //milestonesData
    milestonesData: {
      handler(newVal) {
        console.log('Milestones data changed:', newVal);
      },
      deep: true
    },

    //deliverablesData
    // deliverablesData: {
    //   handler(newVal) {
    //     console.log('Deliverables data changed:', newVal);
    //   },
    //   deep: true
    // },

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