<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('objective.objectivedetails')"
    :subPage="$t('objective.objectivedetails')"
    :titlePage="$t('objective.objectivedetails')"
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
            <v-tab value="details">{{ $t("objective.details") }}</v-tab>
            <!-- <v-tab value="initiatives">{{ $t("objective.Initiatives") }}</v-tab>
            <v-tab value="programs">{{ $t("objective.Programs") }}</v-tab>
            <v-tab value="projects">{{ $t("objective.Projects") }}</v-tab> -->
            <v-tab value="comments">{{ $t("objective.comments") }}</v-tab>
            <v-tab value="log">{{ $t("objective.log") }}</v-tab>
          </v-tabs>

          <!-- Custom Tab Content without v-window -->
          <div class="tab-content">
            <!-- Details Tab -->
            <div v-show="tab === 'details'" class="tab-panel">
              <objective-details-tab
                :objectiveDetails="objectiveDetails"
                :users="users"
                class="pa-4"
              ></objective-details-tab>
            </div>

            <!-- Initiatives Tab -->
            <!-- <div v-show="tab === 'initiatives'" class="tab-panel">
              <div class="pa-4">
                <Initiative :objective_id="objectiveDetails?.id"></Initiative>
              </div>
            </div> -->

            <!-- Programs Tab -->
            <!-- <div v-show="tab === 'programs'" class="tab-panel">
              <div class="pa-4">
                <Program :objective_id="objectiveDetails?.id"></Program>
              </div>
            </div> -->

            <!-- Projects Tab -->
            <!-- <div v-show="tab === 'projects'" class="tab-panel">
              <div class="pa-4">
                <project></project>
              </div>
            </div>
             -->
            <!-- Comments Tab -->
            <div v-show="tab === 'comments'" class="tab-panel">
              <Comment
                v-if="objectiveDetails?.id"
                commentableType="App\Models\Objective\Objective"
                :commentableId="objectiveDetails.id"
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
import ObjectiveDetailsTab from "@/views/Page/Objective/Components/ObjectiveDetailsTab.vue";
import Objective from "@/API/Objective/Objective";
import User from "@/API/User/User";
import Initiative from "@/views/Page/Initiative/Initiative";
import Program from "@/views/Page/Program/Program";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import Project from "@/views/Page/Project/Project.vue";
import LogAPI from "@/API/Log/Log";
import Domain from "@/API/Domain/Domain"; 
export default {
  name: "ObjectiveView",

  components: {
    MainPage,
    ObjectiveDetailsTab,
    Initiative,
    Program,
    Project,
    Comment,
    Log,
  },

  setup() {
    const objectiveApi = new Objective();
    const userApi = new User();
    const logApi = new LogAPI();
    const domainApi = new Domain();
    return {
      objectiveApi,
      userApi,
      logApi,
      domainApi
    };
  },

  data() {
    return {
      tab: this.$route.query.tabName || "details",
      objectiveDetails: null,
      users: [],
      isLoading: false,
      logs: [],
    };
  },
  async created() {
    await this.loadObjectiveDetails(this.$route.params.id);
    await this.fetchLogs();
  },
  async mounted() {
    this.users = await this.userApi.getAll({ select: "id|full_name" });

    // Check if there's a tab query parameter
    if (this.$route.query.tabName) {
      this.tab = this.$route.query.tabName;
    }
  },

  methods: {
    async fetchLogs() {
      try {
        this.logs = await this.logApi.getModelLogs(
          "Objective",
          this.objectiveDetails.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },
    async loadObjectiveDetails(objectiveId) {
      if (!objectiveId) return;

      try {
        this.isLoading = true;

        const response = await this.objectiveApi.show(objectiveId, {
          with: ["objectiveType", "strategicPlan", "initiatives"],
        });

        this.objectiveDetails = response;
        this.objectiveDetails.domains = await this.domainApi.getAll({
          filterIn: `id|${this.objectiveDetails?.domain_ids.join(",")}`,
        });
      } catch (error) {
        console.error("Failed to load objective details:", error);
        if (typeof notify !== "undefined") {
          notify({
            title: this.$t("objective.Error"),
            text: this.$t("objective.Failed to load objective details"),
            type: "error",
          });
        }
      } finally {
        this.isLoading = false;
      }
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
