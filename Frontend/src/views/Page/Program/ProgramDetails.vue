<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('program.programdetails')"
    :subPage="$t('program.programdetails')"
    :titlePage="$t('program.programdetails')"
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
            class="mb-2"
          >
            <v-tab value="details">{{ $t("program.details") }}</v-tab>
            <v-tab value="projects">{{ $t("program.projects") }}</v-tab>
            <v-tab value="comments">{{ $t("program.comments") }}</v-tab>
            <v-tab value="log">{{ $t("program.logs") }}</v-tab>
          </v-tabs>

          <!-- Tab Content -->
          <v-window v-model="tab">
            <v-window-item value="details">
              <program-details-tab
                :programDetails="programDetails"
                :users="users"
                :teams="teams"
              ></program-details-tab>
            </v-window-item>
            <v-window-item value="projects">
              <project></project>
            </v-window-item>
            <v-window-item value="comments">
              <Comment
                v-if="programDetails?.id"
                commentableType="App\Models\Program\Program"
                :commentableId="programDetails.id"
                :users="users"
              />
            </v-window-item>
            <v-window-item value="log">
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
import ProgramDetailsTab from "@/views/Page/Program/Components/ProgramDetailsTab.vue";
import Project from "@/views/Page/Project/Project.vue";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Program from "@/API/Program/Program";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import LogAPI from "@/API/Log/Log";

export default {
  name: "ProgramView",

  components: {
    MainPage,
    ProgramDetailsTab,
    Project,
    Comment,
    Log,
  },
  setup() {
    const programApi = new Program();
    const userApi = new User();
    const logApi = new LogAPI();
    const teamApi = new Team();
    return {
      programApi,
      userApi,
      logApi,
      teamApi,
    };
  },
  data() {
    return {
      tab: this.$route.query.tabName || "details",
      programDetails: null,
      users: [],
      teams: [],
      logs: [],
    };
  },
  async mounted() {
    this.users = await this.userApi.getAll({
      select: "id|full_name|email|phone",
    });
    this.teams = await this.teamApi.getAll({ select: "id|name" });
  },
  async created() {
    await this.loadProgramDetails(this.$route.params.id);
    await this.fetchLogs();
  },
  methods: {
    async fetchLogs() {
      try {
        this.logs = await this.logApi.getModelLogs(
          "Program",
          this.programDetails.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },
    async loadProgramDetails(programId) {
      if (!programId) return;

      try {
        this.isLoading = true; // Set loading state

        const response = await this.programApi.show(programId, {
          with: ["initiative"],
        });
        // Update the programdetails object directly
        this.programDetails = response;
      } catch (error) {
        notify({
          title: "Error",
          text: "Failed to load program details",
          type: "error",
        });
      } finally {
        this.isLoading = false; // End loading state
      }
    },
  },
};
</script>
