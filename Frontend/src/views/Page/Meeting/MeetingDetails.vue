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
    :subPage="$t('meeting.meetings')"
    :titlePage="$t('meeting.meeting_details')"
  >
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <div class="figma-container">
        <!-- Header Section -->
        <div class="figma-header">
          <div class="d-flex align-items-center">
            <!-- <router-link :to="`/meeting`" class="btn-back-arrow">
              <span class="arrow"></span>
            </router-link> -->
            <router-link :to="`/meeting`" class="figma-back-btn">
              <i class="fas fa-arrow-left"></i>
            </router-link>
            <h1 class="figma-title">{{ this.meetingData.title }}</h1>
          </div>
          <button class="figma-close-btn" @click="$router.push('/meeting')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Tabs Section - Now using reusable component -->
        <tabs-component v-model="activeTab" :tabs="tabs" />

        <!-- Content Area -->
        <component
          :is="tabs.find((t) => t.id === activeTab)?.component"
          :initialParticipants="allParticipants"
          :users="usersForComponants"
          :authUser="USER"
          :meetingData="meetingData"
          :departments="allDepartments"
          :formatDate="formatDate"
          :meetingId="meetingId"
          :committeeHeads="committeeHeads"
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
import User from "@/API/User/User";
import Auth from "@/API/Auth";
import Department from "@/API/Department/Department";
import Committee from "@/API/Committee/Committee";
import Meeting from "@/API/Meeting/Meeting";
import Details from "./components/Details.vue";
import AgendaTopics from "./components/AgendaTopics.vue";
import AttendanceTab from "./components/AttendanceTab.vue";
import Vote from "./components/Vote.vue";
import MeetingMinutes from "./components/MeetingMinutes.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    TabsComponent,
    Details,
    AgendaTopics,
    AttendanceTab,
    Vote,
    MeetingMinutes,
  },

  setup() {
    const USER = Auth.USER;
    const api = new Meeting();
    const apiParams = {};
    const route = useRoute();
    const meetingId = route.params.id;
    const departmentApi = new Department();
    const committeeApi = new Committee();
    const userApi = new User();

    return {
      api,
      apiParams,
      route,
      meetingId,
      userApi,
      USER,
      departmentApi,
      committeeApi,
    };
  },

  data() {
    return {
      load: true,
      activeTab: "details",
      tabs: [],
      meetingData: [],
      users: [],
      usersForComponants: [],
      allDepartments: [],
      allParticipants: [],
      committeeHeads: [],
    };
  },

  async mounted() {
    await this.fetchDepartments();
    await this.fetchUsers();
    await this.fetchMeetings();
    await this.fetchCommitteeHeads();

    this.tabs = [
      {
        id: "details",
        label: this.$t("meeting.details"),
        component: "Details",
        icon: "fas fa-info-circle",
      },
      {
        id: "Attendance",
        label: this.$t("meeting.attendance"),
        component: "AttendanceTab",
        icon: "fas fa-list-alt",
      },
      {
        id: "DecisionsAndNotes",
        label: this.$t("meeting.decisionsAndNotes"),
        component: "AgendaTopics",
        icon: "fa-regular fa-clipboard",
      },
      {
        id: "Vote",
        label: this.$t("meeting.vote"),
        component: "Vote",
        icon: "fas fa-list-alt",
      },
      {
        id: "MeetingMinutes",
        label: this.$t("meeting.meetingMinutes"),
        component: "MeetingMinutes",
        icon: "fas fa-list-alt",
      },
    ];
    if (
      !(
        this.meetingData.status == "completed" &&
        (this.meetingData?.meeting_minutes_status || this.isHead())
      )
    ) {
      this.tabs = this.tabs.filter((tab) => tab.id !== "MeetingMinutes");
    }

    if (!this.isHead()) {
      this.tabs = this.tabs.filter((tab) => tab.id !== "Attendance");
    }

    if(!this.meetingData?.isVoteStarted && !this.isHead()){
      this.tabs = this.tabs.filter((tab) => tab.id !== "Vote");
    }

    this.load = false;
  },

  methods: {
    isHead() {
      const result = this.meetingData?.participants?.filter(
        (participant) =>
          participant != null &&
          participant.id === this.USER.id &&
          (participant.type == "chairperson" ||
            participant.type == "vice_chair" ||
            participant.type == "secretary")
      );
      return result?.length > 0;
    },
    async fetchMeetings() {
      try {
        const response = await this.api.show(this.meetingId, {
          with: [
            "committee:id,name",
            "recommendations",
            "agenda.topics.mainTopic",
          ],
        });

        // Group topics by main_topic
        if (response.agenda && Array.isArray(response.agenda.topics)) {
          const groupedTopics = {};

          // First pass: create main topic structure
          response.agenda.topics.forEach((topic) => {
            const mainId = topic.main_topic?.id || "unknown";
            if (!groupedTopics[mainId]) {
              groupedTopics[mainId] = {
                id: topic.main_topic.id,
                name: topic.main_topic.name,
                subs: [],
              };
            }
          });

          // Second pass: add subtopics and assign recommendations
          response.agenda.topics.forEach((topic) => {
            const mainId = topic.main_topic?.id || "unknown";

            // Find the subtopic in the grouped structure
            const subtopic = {
              ...topic,
              recommendations: [], // Initialize empty recommendations array
            };

            // Assign recommendations that match this subtopic's id
            if (Array.isArray(response.recommendations)) {
              subtopic.recommendations = response.recommendations.filter(
                (rec) => rec.topic_id === topic.id
              );
            }

            groupedTopics[mainId].subs.push(subtopic);
          });

          // Convert to array for easier use in templates
          response.agenda.topics = Object.values(groupedTopics);
        }

        this.meetingData = response;
        this.meetingData.creator = this.users[this.meetingData.created_by]
          ? this.users[this.meetingData.created_by].full_name
          : this.$t("common.na");

        this.allParticipants = [
          ...this.meetingData.participants,
          ...this.meetingData.invited_participants,
        ];

        console.log("Meeting data with recommendations:", this.meetingData);
      } catch (error) {
        console.error("Failed to load meetings:", error);
      }
    },

    async fetchUsers() {
      try {
        const usersResponse = await this.userApi.getAll({
          select: "id|full_name|type|department_id|phone|username|email",
        });
        this.usersForComponants = usersResponse;
        this.users = usersResponse.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    },

    formatDate(date) {
      if (!date) return this.$t("common.na");

      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      const hours = d.getHours() % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = d.getHours() >= 12 ? "PM" : "AM";

      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name",
        });

        this.allDepartments = deptResponse;
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    },

    async fetchCommitteeHeads() {
      try {
        const committeeResponse = await this.committeeApi.getAll({
          select: "id|name|chairperson_id|vice_chair_id|secretary_id",
          filter: `id|${this.meetingData?.committee_id}|=`,
        });

        if (committeeResponse && committeeResponse.length > 0) {
          const committee = committeeResponse[0];
          // Collect unique, non-null head IDs
          this.committeeHeads = [
            committee.chairperson_id,
            committee.vice_chair_id,
            committee.secretary_id,
          ].filter((id) => !!id);
        }

        console.log("Committee heads:", this.committeeHeads);
      } catch (error) {
        console.error("Failed to load committee members:", error);
      }
    },
  },
};
</script>

<style scoped>
/* Loader Animation */
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

/* Container */
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

.figma-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin: 0;
  margin-left: 1rem;
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

/* Back Button Arrow */
.btn-back-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  text-decoration: none;
}

.btn-back-arrow:hover {
  transform: translateX(-4px);
}

.arrow {
  border-right: 18px solid #44225c;
  border-top: 18px solid transparent;
  border-bottom: 18px solid transparent;
  transition: all 0.2s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .figma-title {
    font-size: 18px;
  }

  .arrow {
    border-right-width: 14px;
    border-top-width: 14px;
    border-bottom-width: 14px;
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

.agenda-view .page-title {
  display: none;
}

.agenda-view .flipper {
  min-height: 1000px !important;
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
</style>
