<template>
  <div
    v-if="load"
    class="d-flex justify-content-center align-items-center vh-100"
  >
    <div class="dot-loader">
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>

  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    v-else
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('committee.committee_mngt')"
    :subPage="$t('agenda.agendas')"
    :titlePage="$t('agenda.agenda_details')"
  >
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div class="figma-container">
        <!-- Header Section -->
        <div class="figma-header">
          <div class="d-flex align-items-center">
            <router-link
              :to="`/committee-details/${agendaDetails?.committee_id}`"
              class="figma-back-btn"
            >
              <i class="fas fa-arrow-left"></i>
            </router-link>
            <h1 class="figma-title">{{ this.agendaDetails.name }}</h1>
          </div>
          <button
            class="figma-close-btn"
            @click="
              $router.push(`/committee-details/${agendaDetails?.committee_id}`)
            "
          >
            <router-link
              :to="`/committee-details/${agendaDetails?.committee_id}`"
              class="figma-back-btn"
            >
              <i class="fas fa-times"></i>
            </router-link>
          </button>
        </div>

        <!-- Tabs Section - Now using reusable component -->
        <tabs-component 
          v-model="activeTab"
          :tabs="tabs"
        />

        <!-- Content Area with KEY for force remount -->
        <component
          :is="tabs.find((t) => t.id === activeTab)?.component"
          :key="componentKey"
          :users="users"
          :authUser="USER"
          :meetingData="meetingData"
          :agendaDetails="agendaDetails"
          :agendaTopics="agendaTopics"
          :topics="topics"
        >
        </component>
      </div>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import { useRoute } from "vue-router";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import Agenda from "@/API/Agenda/Agenda";
import TopicTab from "./components/TopicTab.vue";
import Topic from "@/API/Topic/Topic";
import Committee from "@/API/Committee/Committee";
import User from "@/API/User/User";
import Details from "./components/Details.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    TabsComponent,
    TopicTab,
    Details,
  },

  setup() {
    const api = new Agenda();
    const topicApi = new Topic();
    const userApi = new User();
    const committeeApi = new Committee();
    const apiParams = {};
    const route = useRoute();
    const agendaId = route.params.id;

    return {
      api,
      apiParams,
      route,
      topicApi,
      userApi,
      committeeApi,
      agendaId,
    };
  },

  data() {
    return {
      load: true,
      activeTab: "details",
      tabs: [],
      agendaDetails: null,
      topics: [],
      agendaTopics: [],
      users: [],
      committees: [],
      meetingData: [],
      componentKey: 0,
      isInitialLoad: true,
    };
  },

  watch: {
    activeTab: {
      async handler(newTab, oldTab) {
        if (this.isInitialLoad) {
          this.isInitialLoad = false;
          return;
        }

        console.log(this.$t('agenda.tab_changed_from'), oldTab, this.$t('agenda.to'), newTab);

        localStorage.setItem(`activeTab_agenda_${this.agendaId}`, newTab);

        this.load = true;

        this.componentKey++;

        try {
          await Promise.all([
            this.fetchAgenda(),
            this.fetchTopics(),
            this.fetchUsers(),
            this.fetchCommittees(),
          ]);

          console.log(this.$t('agenda.data_refreshed_successfully'));
        } catch (error) {
          console.error(this.$t('agenda.failed_to_refresh_data'), error);
        } finally {
          this.load = false;
        }
      },
    },
  },

  async mounted() {
    await this.fetchTopics();
    await this.fetchAgenda();
    await this.fetchUsers();
    await this.fetchCommittees();

    this.tabs = [
      {
        id: "details",
        label: this.$t("agenda.agenda_details"),
        component: "Details",
        icon: "fas fa-info-circle",
      },
      {
        id: "TopicTab",
        label: this.$t("topic.topics"),
        component: "TopicTab",
        icon: "fas fa-list-alt",
      },
    ];

    const savedTab = localStorage.getItem(`activeTab_agenda_${this.agendaId}`);
    if (savedTab && this.tabs.some((tab) => tab.id === savedTab)) {
      this.activeTab = savedTab;
    }

    this.load = false;
  },

  methods: {
    async fetchUsers() {
      try {
        this.users = await this.userApi.getAll({
          select: "id|full_name",
        });
      } catch (error) {
        console.error(this.$t('agenda.failed_to_load_users'), error);
      }
    },

    async fetchCommittees() {
      try {
        this.committees = await this.committeeApi.getAll({
          select: "id|name",
        });
      } catch (error) {
        console.error(this.$t('agenda.failed_to_load_committees'), error);
      }
    },

    async fetchAgenda() {
      try {
        const response = await this.api.show(this.$route.params.id, {
          with: ["topics", "meeting", "committee"],
        });
        this.agendaDetails = response;
        this.agendaTopics = response.topics;
        this.meetingData = response.meeting;
        console.log(this.$t('agenda.agenda_details_label'), this.agendaDetails);
      } catch (error) {
        console.error(this.$t('agenda.failed_to_load_agenda'), error);
      }
    },

    async fetchTopics() {
      try {
        const topicsResponse = await this.topicApi.getAll({
          select: "id|name|committee_id|topic_id",
          filter: `topic_id|null-null|=`,
          with: ["subTopics"],
        });
        this.topics = topicsResponse;
      } catch (error) {
        console.error(this.$t('agenda.failed_to_load_topics'), error);
      }
    },

    formatDate(date) {
      if (!date) return this.$t('agenda.not_available');

      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      const hours = d.getHours() % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = d.getHours() >= 12 ? this.$t('agenda.pm') : this.$t('agenda.am');

      return `${day}/${month}/${year}`;
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name|ola_leader",
        });

        this.allDepartments = deptResponse;
      } catch (error) {
        console.error(this.$t('agenda.failed_to_load_departments'), error);
      }
    },
  },
};
</script>

<style scoped>
/* Loader */
.dot-loader {
  display: flex;
  gap: 0.75rem;
}

.dot-loader div {
  width: 10px;
  height: 10px;
  background-color: #44225c;
  border-radius: 50%;
  animation: bounce 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
    opacity: 0.8;
  }
  to {
    transform: translateY(-12px);
    opacity: 0.3;
  }
}

/* Container with white background */
.figma-container {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  min-height: 600px;
}

/* Header - Exact Figma */
.figma-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.figma-back-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #000000;
  cursor: pointer;
  padding: 4px 12px 4px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  text-decoration: none;
}

.figma-back-btn:hover {
  opacity: 0.7;
}

.figma-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  margin-left: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.figma-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #000000;
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.figma-close-btn:hover {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .figma-title {
    font-size: 18px;
  }
}
</style>

<style>
.page-title-card {
  padding: 20px !important;
}

.topic-view .page-title {
  display: none;
}

.topic-view .flipper {
  min-height: 1000px !important;
}

.meeting-view .page-title {
  display: none;
}

.meeting-view .flipper {
  min-height: 1000px !important;
}
</style>