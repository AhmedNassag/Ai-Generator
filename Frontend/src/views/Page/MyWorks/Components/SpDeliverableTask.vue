<template>
  <div id="task-view" class="container-fluid">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page
      ref="page"
      :mainPage="$t('task.task')"
      :subPage="$t('task.task')"
      :titlePage="$t('task.task')"
      v-permission:show
    >
      <div v-permission:update v-permission:delete></div>

      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <DataTable
          ref="table"
          id="task-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :hideActions="true"
          :hideDivButtons="true"
          :hideActionsColumn="true"
        >
          <!-- Customizing the display of the 'Name' column in the table -->
          <template #task.name="{ item }">
            <router-link
              :to="{ path: `/task-details/${item.id}` }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.name }}
            </router-link>
          </template>

          <template #task.status="{ item }">
            <div v-html="getTaskStatus(item)"></div>
          </template>

          <template #task.due_date="{}"> </template>

          <template #task.project="{ item }">
            <router-link
              :to="{
                path: `/project-details/${item?.deliverable?.milestone?.project?.id}`,
              }"
              style="cursor: pointer; color: #232388"
            >
              {{ item?.deliverable?.milestone?.project?.name || "N/A" }}
            </router-link>
          </template>
        </DataTable>
      </template>
    </main-page>
  </div>
</template>

<script>
// Importing necessary components and API modules
import Task from "@/API/SPTask/Task";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import Auth from "@/API/Auth";
export default {
  props: {
    tasksData: {
      type: Array,
      default: () => [], // Better practice: use factory function for default arrays/objects
    },
    users: {
      type: Array,
      default: () => [],
    },
    strategicPlan: {
      type: Object,
      required: true,
    }
  },
  components: {
    MainPage, // Main page layout component
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new Task();
    const userApi = new User();
    const relations = [
      "deliverable",
      "deliverable.milestone",
      "deliverable.milestone.project",
    ];
    const apiParams = {
      filter: `assignee|${Auth?.USER?.id}|=&&status|Completed|!=&&status|Cancelled|!=`,
      with: relations,
    };
    const tableColumns = []; // Initialize table column definitions

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      userApi,
      //   strategicPlanApi
    };
  },

  async mounted() {
    this.users = await this.userApi.getAll({ select: "id|full_name" });
  },

  data() {
    return {
      users: [],
      activedStrategicPlan: null,
    };
  },

  created() {
    // Initialize the table columns when the component is created
    this.tableColumns = [
      {
        id: "task.name",
        title: this.$t("task.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "task.code",
        title: this.$t("task.code"),
        data: "code",
        defaultContent: "N/A",
      },
      {
        id: "task.status",
        title: this.$t("task.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "task.due_date",
        title: this.$t("task.due_date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      //   { id: "task.completed_date", title: this.$t("task.completed_date"), data: "completed_date", defaultContent: "N/A" },
      //   { id: "task.completed_by", title: this.$t("task.completed_by"), data: "", defaultContent: "N/A" },
      {
        id: "task.project",
        title: this.$t("task.project"),
        data: "",
        defaultContent: "N/A",
      },
    ];
  },

  methods: {
    getTaskStatus(item) {
      const status = item.status;
      let label = "";
      let badgeClass = "";
      let iconClass = "";
      if (status == "Draft") {
        label = "Draft";
        badgeClass = "bg-primary";
      } else if (status == "Under Review") {
        label = "Under Review";
        badgeClass = "bg-primary";
      } else if (status == "Approved") {
        label = "Approved";
        badgeClass = "bg-success";
      } else if (status == "In Progress") {
        label = "In Progress";
        badgeClass = "bg-warning";
      } else if (status == "On Hold") {
        label = "On Hold";
        badgeClass = "bg-info";
      } else if (status == "Completed") {
        label = "Completed";
        badgeClass = "bg-success";
      } else if (status == "Cancelled") {
        label = "Cancelled";
        badgeClass = "bg-danger";
      }
      return `<span class="text-center badge ${badgeClass}" style="display: inline-flex; align-items: center; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
          <i class="${iconClass} me-1"></i>${label}
        </span>`;
    },
  },
};
</script>

<style>
/* Scoped styles for the component */
#task-view .page-title {
  display: none;
}
</style>
