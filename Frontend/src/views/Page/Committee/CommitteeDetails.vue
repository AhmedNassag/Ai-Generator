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
    :subPage="$t('committee.committees')"
    :titlePage="$t('committee.committee_details')"
  >
    <template #datatable>
      <div class="figma-container">
        <!-- Header Section -->
        <div class="figma-header">
          <h1 class="figma-title d-flex">
            <router-link
              :to="`/committee`"
              class="figma-back-btn d-flex"
            >
              <i class="fas fa-arrow-left"></i>
            </router-link>
            {{ this.committeeData.name }}
          </h1>
          <button class="figma-close-btn" @click="$router.push('/committee')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Tabs Section - Now using reusable component -->
        <tabs-component v-model="activeTab" :tabs="tabs" />

        <!-- Content Area -->
        <component
          :is="tabs.find((t) => t.id === activeTab)?.component"
          :users="usersForComponants"
          :authUser="USER"
          :committeeData="committeeData"
          :departments="allDepartments"
          :formatDate="formatDate"
        >
        </component>
      </div>
    </template>
  </main-page>
</template>

<script>
import { useRoute , useRouter } from "vue-router";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import User from "@/API/User/User";
import Auth from "@/API/Auth";
import Department from "@/API/Department/Department";
import Committee from "@/API/Committee/Committee";
import Details from "./components/Details.vue";
import Members from "./components/Members.vue";
import Topic from "@/views/Page/Topic/Topic.vue";
import Agenda from "@/views/Page/Agenda/Agenda.vue";
import Meeting from "@/views/Page/Meeting/Meeting.vue";
import { useNotifyLogSetting } from "@/composables/useNotifyLogSetting";
export default {
  components: {
    MainPage,
    Form,
    DataTable,
    TabsComponent,
    Details,
    Members,
    Topic,
    Agenda,
    Meeting,
  },

  setup() {
    const USER = Auth.USER;
    const api = new Committee();
    const apiParams = {};
    const route = useRoute();
    const committeeId = route.params.id;
    const departmentApi = new Department();
    const userApi = new User();
    const router = useRouter();
    return {
      api,
      apiParams,
      route,
      committeeId,
      userApi,
      USER,
      departmentApi,
      router,
    };
  },

  data() {
    return {
      load: true,
      activeTab: "details",
      tabs: [],
      committeeData: {},
      users: [],
      usersForComponants: [],
      allDepartments: [],
    };
  },

  async mounted() {
      useNotifyLogSetting(
      [
        { label: "Committee", model: "Committee" },
        { label: "Agenda", model: "Agenda" },
      ],
      true
    );
    await this.fetchDepartments();
    await this.fetchUsers();
    await this.fetchCommittees();

    this.tabs = [
      {
        id: "details",
        label: this.$t("committee.details"),
        component: "Details",
      },
      {
        id: "members",
        label: this.$t("committee.members"),
        component: "Members",
      },
      {
        id: "topics",
        label: this.$t("committee.topics"),
        component: "Topic",
      },
      {
        id: "agendas",
        label: this.$t("committee.agendas"),
        component: "Agenda",
      },
    ];

    if (
      Auth.USER.id == this.committeeData.chairperson_id ||
      Auth.USER.id == this.committeeData.vice_chair_id ||
      Auth.USER.id == this.committeeData.secretary_id ||
      this.committeeData.member_ids?.includes(Auth.USER.id)
    ) {
      this.tabs.push({
        id: "meetings",
        label: this.$t("committee.meetings"),
        component: "Meeting",
      });
    }

    this.load = false;
  },

  methods: {
    // onTabChange(tabId) {
    //   // Optional: Add any additional logic when tab changes
    //   console.log('Tab changed to:', tabId);
    // },

    async fetchCommittees() {
      try {
        const response = await this.api.show(this.committeeId);
        this.committeeData = response;
      } catch (error) {
        console.error("Failed to load committees:", error);
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
      if (!date) return this.$t('committee.not_available');
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name|ola_leader",
        });
        this.allDepartments = deptResponse;
      } catch (error) {
        console.error("Failed to load departments:", error);
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

/* Container with light grey background */
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
