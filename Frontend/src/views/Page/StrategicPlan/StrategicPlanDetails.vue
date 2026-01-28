<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('strategicplan.strategicPlandetails')"
    :subPage="$t('strategicplan.strategicPlandetails')"
    :titlePage="$t('strategicplan.strategicPlandetails')"
  >
    <template #datatable>
      <div class="container">
        <v-app>
          <!-- Tabs -->
          <v-tabs
            v-model="tab"
            background-color="purple darken-4"
            dark
            class="m-0"
          >
            <v-tab value="details">{{ $t("strategicplan.Details") }}</v-tab>
            <v-tab value="fusioncharts">{{ $t("strategicplan.Fusion Charts") }}</v-tab>
            <v-tab value="ObjectiveInitiativeMatrix">{{ $t("strategicplan.Objective Initiative Matrix") }}</v-tab>
            <v-tab value="comments">{{ $t("strategicplan.Comemnts") }}</v-tab>
            <v-tab value="logs">{{ $t("strategicplan.Logs") }}</v-tab>
          </v-tabs>
           
          <!-- Custom Tab Content without v-window -->
          <div class="tab-content">
            <!-- Details Tab -->
            <div v-if="tab === 'details'" class="tab-panel">
              <strategicPlan-details-tab
                :strategicPlanDetails="strategicPlanDetails"
                :requirements="requirements"
                class="pa-4"
              ></strategicPlan-details-tab>
            </div>
            <!-- Fusion Charts Tab -->
            <div v-if="tab === 'fusioncharts'" class="tab-panel">
              <SunburstChart :strategicPlanDetails="strategicPlanDetails" />
            </div>
            <div v-if="tab === 'ObjectiveInitiativeMatrix'" class="tab-panel">
              <objective-initiative-matrix
                class="pa-4"
              ></objective-initiative-matrix>
            </div>

            <!-- Comments Tab -->
            <div v-if="tab === 'comments'" class="tab-panel">
              <Comment
                v-if="strategicPlanDetails?.id"
                commentableType="App\Models\StrategicPlan\StrategicPlan"
                :commentableId="strategicPlanDetails.id"
              />
            </div>

            <!-- Log Tab -->
            <div v-if="tab === 'logs'" class="tab-panel">
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
import StrategicPlanDetailsTab from "@/views/Page/StrategicPlan/Components/StrategicPlanDetailsTab.vue";
import ObjectiveInitiativeMatrix from "@/views/Page/StrategicPlan/Components/ObjectiveInitiativeMatrix.vue";
import StrategicPlan from "@/API/StrategicPlan/StrategicPlan";
import Requirement from "@/API/Requirement/Requirement";
import Document from "@/API/Document/Document";
import Objective from "@/views/Page/Objective/Objective";
import Initiative from "@/views/Page/Initiative/Initiative";
import Program from "@/views/Page/Program/Program";
import Project from "@/views/Page/Project/Project";
import Comment from "@/components/Comment.vue";
import Log from "@/components/Log.vue";
import LogAPI from "@/API/Log/Log";
import User from "@/API/User/User";
import SunburstChart from "@/views/Page/StrategicPlan/Components/SunburstChart.vue";
export default {
  name: "StrategicPlanView",

  components: {
    MainPage,
    StrategicPlanDetailsTab,
    Objective,
    Initiative,
    Program,
    Project,
    Comment,
    Log,
    ObjectiveInitiativeMatrix,
    SunburstChart,
  },

  setup() {
    const strategicPlanApi = new StrategicPlan();
    const requirementApi = new Requirement();
    const documentApi = new Document();
    const userApi = new User();
    const logApi = new LogAPI();
    return {
      strategicPlanApi,
      requirementApi,
      documentApi,
      logApi,
      userApi
    };
  },

  data() {
    return {
      tab: this.$route.query.tab || "details",
      users:[],
      strategicPlanDetails: null,
      requirements: [],
      documents: [],
      projects: [],
      isLoading: false,
      logs: [],
      /*Fusion Chart Data*/
      type: "sunburst",
      width: "100%",
      height: "100%",
      dataFormat: "json",
      dataSource: {
        chart: {
          caption: "Example Chart",
          xAxisName: "Category",
          yAxisName: "Value",
          theme: "fusion",
        },
        data: [
          { label: "A", value: 10 },
          { label: "B", value: 20 },
          { label: "C", value: 15 },
        ],
      },
    };
  },
  async created() {
    await this.loadStrategicPlanDetails(this.$route.params.id);
    await this.fetchLogs();
    this.users = await this.userApi.getAll({ select: "id|full_name|email|phone" });
  },
  async mounted() {
    this.requirements = await this.requirementApi.getAll({ select: "id|name" });
    this.documents = await this.documentApi.getAll({ select: "id|name" });
  },

  methods: {
    async fetchLogs() {
      try {
        this.logs = await this.logApi.getModelLogs(
          "StrategicPlan",
          this.$route.params.id
        );
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    },
    async loadStrategicPlanDetails(strategicPlanId) {
      if (!strategicPlanId) return;

      try {
        this.isLoading = true;

        const response = await this.strategicPlanApi.show(strategicPlanId, {
          with: [
            "objectives.initiatives.programs.projects",
            "objectives.initiatives.projects",
          ],
        });
        this.strategicPlanDetails = response;
        console.log("response", response);

        // Combine both projects sources and remove duplicates
        const allProjects = [
          ...(response.projects || []),
          ...(response.objectives?.flatMap((obj) => obj.projects) || []),
          ...(response.initiatives?.flatMap((init) => init.projects) || []),
          ...(response.programs?.flatMap((prog) => prog.projects) || []),
        ];

        // Remove duplicates by project ID (assuming projects have unique ids)
        this.projects = allProjects.filter(
          (project, index, self) =>
            index === self.findIndex((p) => p.id === project.id)
        );

        // this.projects = response.projects;
      } catch (error) {
        // Assuming notify is available globally
        if (typeof notify !== "undefined") {
          notify({
            title: "Error",
            text: "Failed to load strategicPlan details",
            type: "error",
          });
        }
      } finally {
        this.isLoading = false;
      }
    },
  },

  watch: {
    "$route.query.tab": {
      handler(newTab) {
        this.tab = newTab || "details";
      },
      immediate: true,
    },
  },
};
</script>

<style>
/* Tab content styling */
.tab-content {
  /* background-color: white; */
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
