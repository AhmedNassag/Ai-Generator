<template>
  <!-- Main Page component for display only -->
  <main-page
    ref="page"
    :mainPage="$t('governance.governance')"
    :mainSubPage="$t('task.task_mngt')"
    :subPage="$t('task.tasks')"
    :titlePage="$t('task.assigned_to_me')"
    v-permission:show
  >
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        v-permission:show
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :hideActions="true"
        :hideDivButtons="true"
        :hideActionsColumn="true"
        :hideAddNewButton="true"
      >
        <!-- Display assignment type -->
        <template #assign_type="{ item }">
          <span
            v-if="item.assign_type === 'user'"
            class="badge text-bg-success w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.users") }}
          </span>
          <span
            v-else-if="item.assign_type === 'team'"
            class="badge text-bg-danger w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.teams") }}
          </span>
        </template>

        <!-- Display priority -->
        <template #priority="{ item }">
          <span
            v-if="item.priority === 'no_priority'"
            class="badge text-bg-success w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.no_priority") }}
          </span>
          <span
            v-else-if="item.priority === 'low'"
            class="badge text-bg-secondary w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.low") }}
          </span>
          <span
            v-else-if="item.priority === 'medium'"
            class="badge text-bg-primary w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.medium") }}
          </span>
          <span
            v-else-if="item.priority === 'high'"
            class="badge text-bg-warning w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.high") }}
          </span>
          <span
            v-else-if="item.priority === 'urgent'"
            class="badge text-bg-danger w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.urgent") }}
          </span>
        </template>

        <!-- Display category -->
        <template #category="{ item }">
          {{ item?.category?.name }}
        </template>

        <!-- Display created by user -->
        <!-- <template #created_by="{ item }">
          <span class="text-muted">
            {{ getUserName(item.created_by) }}
          </span>
        </template> -->

        <!-- Display task title -->
        <template #task.title="{ item }">
          {{ truncateText(item.title) }}
        </template>

        <!-- Display start date -->
        <template #task.start_date="{ item }">
          {{ formatDate(item.start_date) }}
        </template>

        <!-- Display due date -->
        <template #task.due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>

        <!-- Display status (non-interactive) -->
        <template #status="{ item }">
          <span
            v-if="item.status === 'open'"
            class="badge text-bg-secondary w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.open") }}
          </span>
          <span
            v-else-if="item.status === 'in_progress'"
            class="badge text-bg-warning w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.in_progress") }}
          </span>
          <span
            v-else-if="item.status === 'closed'"
            class="badge text-bg-success w-100"
            style="display: block; margin: auto"
          >
            {{ $t("task.completed") }}
          </span>
        </template>

        <!-- Display assignee -->
        <!-- <template #assignee="{ item }">
          <span v-if="item.assign_type == 'user'" class="text-muted">
            {{ getUserName(item.assignee_id) }}
          </span>
          <span v-if="item.assign_type == 'team'" class="text-muted">
            {{ getTeamName(item.assignee_id) }}
          </span>
        </template> -->
      </DataTable>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import task from "@/API/Task/Task";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Auth from "@/API/Auth";

export default {
  name: "TaskDisplay",
  components: {
    MainPage,
    DataTable,
  },
  users: {
    type: Array,
    default: () => [],
  },
  setup() {
    const USER = Auth.USER;
    const api = new task();
    // Set API params to only show tasks assigned to current user
    const apiParams = {
      with: ["category:id,name"],
      filter: `assignee_id|${USER.id}|=||status|completed|!=`,
    };
    const tableColumns = [];
    const userApi = new User();
    const teamApi = new Team();

    return {
      api,
      apiParams,
      tableColumns,
      userApi,
      teamApi,
      USER,
    };
  },

  data() {
    return {
      // users: [],
      teams: [],
      userNames: {},
      teamNames: {},
    };
  },

  created() {
    this.tableColumns = [
      { title: this.$t("task.title"), data: "title", defaultContent: "N/A" },
      {
        id: "category",
        title: this.$t("task.category"),
        data: "category.name",
        defaultContent: "N/A",
      },
      {
        title: this.$t("task.start_date"),
        data: "start_date",
        defaultContent: "N/A",
      },
      {
        title: this.$t("task.due_date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "priority",
        title: this.$t("task.priority"),
        data: "priority",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("task.status"),
        data: "status",
        defaultContent: "N/A",
      },
      // {
      //   id: "created_by",
      //   title: this.$t("task.created_by"),
      //   data: "created_by",
      //   defaultContent: "N/A",
      // },
    ];
  },

  async mounted() {
    // await this.loadDisplayData();
  },

  methods: {
    // async loadDisplayData() {
    //   try {
    //     // await this.fetchUsers();
    //     await this.fetchTeams();
    //   } catch (error) {
    //     console.error("Failed to load data:", error);
    //   }
    // },

    formatDate(date) {
      if (!date) return "N/A";
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
    },

    truncateText(text) {
      if (!text) {
        return "";
      }
      if (text.length >= 10) {
        return text.substring(0, 10) + "...";
      }
      return text;
    },

    // async fetchUsers() {
    //   try {
    //     const usersResponse = await this.userApi.getAll({
    //       select: "id|full_name",
    //     });
    //     this.users = usersResponse;

    //     this.userNames = usersResponse.reduce((map, user) => {
    //       map[user.id] = user.full_name;
    //       return map;
    //     }, {});
    //   } catch (error) {
    //     console.error("Failed to load users:", error);
    //   }
    // },

    // async fetchTeams() {
    //   try {
    //     const teamsResponse = await this.teamApi.getAll({
    //       select: "id|name",
    //     });
    //     this.teams = teamsResponse;

    //     this.teamNames = teamsResponse.reduce((map, team) => {
    //       map[team.id] = team.name;
    //       return map;
    //     }, {});
    //   } catch (error) {
    //     console.error("Failed to load teams:", error);
    //   }
    // },

    // getUserName(userId) {
    //   return this.userNames[userId] || "N/A";
    // },

    // getTeamName(teamId) {
    //   return this.teamNames[teamId] || "N/A";
    // },
  },
};
</script>

<style scoped>
.text-muted {
  color: #6c757d;
  font-weight: 500;
}

.badge {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}
</style>
