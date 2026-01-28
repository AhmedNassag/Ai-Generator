<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('task.taskdetails')"
    :subPage="$t('task.taskdetails')"
    :titlePage="$t('task.taskdetails')"
  >
      <template #datatable>
      <div class="container">
      <v-app>
          <!-- Header -->
          <!-- <v-card-title class="headline font-weight-bold purple--text text--darken-4">
            {{ program.name }}
          </v-card-title> -->

          <!-- Tabs -->
          <v-tabs
            v-model="tab"
            background-color="purple darken-4"
            dark
            grow
            class="mb-2"
          >
            <v-tab value="details">{{ $t("task.Details") }}</v-tab>
            <v-tab value="comments">{{ $t("task.Comments") }}</v-tab>
            <v-tab value="log">{{ $t("task.Log") }}</v-tab>
          </v-tabs>

          <!-- Tab Content -->
          <v-window v-model="tab">
            <v-window-item value="details">
              <!-- <v-card flat class="pa-4">Details content</v-card> -->
              <task-details-tab :taskDetails="taskDetails" :users="users"></task-details-tab>
            </v-window-item>
            <v-window-item value="comments">
              <!-- <v-card flat class="pa-4">Comments content</v-card> -->
               <Comment
                  v-if="taskDetails?.id"
                  commentableType="App\Models\Task\Task"
                  :commentableId="taskDetails.id"
                  :users="users"
                />
            </v-window-item>
            <v-window-item value="log">
              <!-- <v-card flat class="pa-4">Log content</v-card> -->
               <Log :logs="logs"></Log>
            </v-window-item>
          </v-window>
        </v-app>
    </div>
    </template>
    
  </main-page>
</template>

<script>
import MainPage from "@/components/MainPage.vue";
import TaskDetailsTab from "@/views/Page/SPTask/components/TaskDetailsTab.vue"; 
import User from "@/API/User/User";
import Task from "@/API/SPTask/Task";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import LogAPI from "@/API/Log/Log";

export default {
  name: "ProgramView",

  components: {
    MainPage,
    TaskDetailsTab,
    // TasksTab,
    Comment,
    Log
  },
  setup() {
    const taskApi = new Task();
    const userApi = new User();
    const logApi = new LogAPI();
    return {
      taskApi,
      userApi,
      logApi
    };
  },
  data() {
    return {
      tab: this.$route.query.tab || "details",
      taskDetails:null ,
      users: [],
      logs: [],
    };
  },
 async mounted() {
    await this.loadTaskDetails(this.$route.params.id);
    await this.fetchLogs();
    this.users = await this.userApi.getAll({ select: "id|full_name|email|phone" });
  },
  methods:{
    async fetchLogs() {
      try {
        this.logs = await this.logApi.getModelLogs(
          "Task",
          this.taskDetails.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },

    async loadTaskDetails(taskId) {
      if (!taskId) return;
      try {
        this.isLoading = true; // Set loading state
        const response = await this.taskApi.show(taskId,{
            with: ['deliverable'],
        });
        // Update the taskDetails object directly 
        this.taskDetails = response;
        console.log("taskDetails:", this.taskDetails);
      } catch (error) {
        console.error("Failed to load program details:", error);
        notify({
          title: this.$t("task.Error"),
          text: this.$t("task.Failed to load program details"),
          type: "error",
        });
      } finally {
        this.isLoading = false; // End loading state
      }
    },
  },

  watch: {
    '$route.query.tab': {
      handler(newTab) {
        this.tab = newTab || 'details';
      },
      immediate: true
    }
  },
};
</script>
