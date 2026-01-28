<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('initiative.initiativedetails')"
    :subPage="$t('initiative.initiativedetails')"
    :titlePage="$t('initiative.initiativedetails')"
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
            <v-tab value="details">{{ $t("initiative.Details") }}</v-tab>
            <v-tab value="programs">{{ $t("initiative.Programs") }}</v-tab>
            <v-tab value="projects">{{ $t("initiative.Projects") }}</v-tab>
            <v-tab value="comments">{{ $t("initiative.Comments") }}</v-tab>
            <v-tab value="logs">{{ $t("initiative.Logs") }}</v-tab>
          </v-tabs>

          <!-- Custom Tab Content without v-window -->
          <div class="tab-content">
            <!-- Details Tab -->
            <div v-show="tab === 'details'" class="tab-panel">
              <initiative-details-tab
                :initiativeDetails="initiativeDetails"
                :users="users"
                :teams="teams"
                class="pa-4"
              ></initiative-details-tab>
            </div>

            <!-- Programs Tab -->
            <div v-show="tab === 'programs'" class="tab-panel">
              <div class="pa-4">
                <Program :initiative_id="initiativeDetails?.id"></Program>
              </div>
            </div>

            <!-- Projects Tab -->
            <div v-show="tab === 'projects'" class="tab-panel">
              <div class="pa-4">
                <project></project>
              </div>
            </div>

            <!-- Comments Tab -->
            <div v-show="tab === 'comments'" class="tab-panel">
              <Comment
                v-if="initiativeDetails?.id"
                commentableType="App\Models\Initiative\Initiative"
                :commentableId="initiativeDetails.id"
                :users="users"
              />
            </div>

            <!-- Log Tab -->
            <div v-show="tab === 'logs'" class="tab-panel">
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
import InitiativeDetailsTab from "@/views/Page/Initiative/Components/InitiativeDetailsTab.vue";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Initiative from "@/API/Initiative/Initiative";
import Program from "@/views/Page/Program/Program";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import Project from "@/views/Page/Project/Project.vue";
import LogAPI from "@/API/Log/Log";
import TeamUserDialog from "./TeamUserDialog.vue";

export default {
  name: "InitiativeView",

  components: {
    MainPage,
    InitiativeDetailsTab,
    Initiative,
    Program,
    Project,
    Comment,
    Log,
  },
  setup() {
    const initiativeApi = new Initiative();
    const userApi = new User();
    const teamApi = new Team();
    const logApi = new LogAPI();
    return {
      initiativeApi,
      userApi,
      logApi,
      teamApi
    };
  },

  data() {
    return {
      tab: this.$route.query.tabName || "details",
      initiativeDetails: null,
      users: [],
      isLoading: false,
      logs: [],
      teams : [],
    };
  },

  async mounted() {
    this.users = await this.userApi.getAll({ select: "id|full_name" });
    this.teams = await this.teamApi.getAll({ select: "id|name" });
    // Check if there's a tab query parameter
    if (this.$route.query.tabName) {
      this.tab = this.$route.query.tabName;
    }
  },

  async created() {
    await this.loadInitiativeDetails(this.$route.params.id);
    await this.fetchLogs();
  },

  methods: {

    async fetchLogs() {
      try {
        this.logs = await this.logApi.getModelLogs(
          "Initiative",
          this.initiativeDetails.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },
    async loadInitiativeDetails(initiativeId) {
      if (!initiativeId) return;

      try {
        this.isLoading = true;

        const response = await this.initiativeApi.show(initiativeId, {
          with: ["objectives", "programs", "projects"],
        });

        const initiatives  = await this.initiativeApi.getAll({filterIn:`id|${response.initiative_ids}`}); 
        this.initiativeDetails = response;
        this.initiativeDetails.initiatives = initiatives;

      } catch (error) {
        console.error("Failed to load initiative details:", error);
        if (typeof notify !== "undefined") {
          notify({
            title: "Error",
            text: "Failed to load initiative details",
            type: "error",
          });
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
  watch: {
    async $route(to, from) {
      if (to.params.id !== from.params.id) {
        try {
          // this.isLoading = true;
          await this.loadInitiativeDetails(to.params.id);
           await this.fetchLogs();
        }catch (error) {
          
        }finally {
          this.isLoading = false;
        }
      }
    }
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
