<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'recommend.topicrecommendation'"
    :subPage="'recommend.topicrecommendation'"
    :titlePage="'recommend.topicrecommendation'"
  >
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :filters="filterData"
        :hideAddNewButton="true"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #topic="{ item }">
          {{ item.topic?.name || $t("topic.na") }}
        </template>

        <template #meeting="{ item }">
          <!-- <router-link
            :to="{ path: `/meeting-details/${item.meeting_id}` }"
          > -->

          <div class="badge badge-user text-decoration-none">
            {{ item?.meeting?.title }}
          </div>

          <!-- </router-link> -->
        </template>

        <template #due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>

        <template #assignee="{ item }">
          <a
            v-if="item.assignee_id"
            href="#"
            @click.prevent="openAssigneeDetailsModal(item.assignee_id)"
            class="badge badge-user text-decoration-none"
          >
            {{ users[item.assignee_id]?.full_name || $t("topic.na") }}
          </a>
          <span v-else>{{ $t("topic.na") }}</span>
        </template>

        <template #created_by="{ item }">
          <a
            v-if="item.created_by"
            href="#"
            @click.prevent="openAssigneeDetailsModal(item.created_by)"
            class="badge badge-user text-decoration-none"
          >
            {{ users[item.created_by]?.full_name || $t("topic.na") }}
          </a>
          <span v-else>{{ $t("topic.na") }}</span>
        </template>

        <template #status="{ item }">
          <StatusDropdown
            :item="item"
            :status-options="statusOptions"
            :status-loading="
              statusLoading && currentUpdatingItem?.id === item.id
            "
            @change-status="handleStatusChange"
          />
        </template>
      </DataTable>
    </template>
  </main-page>

  <!-- View user details modal -->
  <ViewUserDetails
    :viewUserModal="viewUserModal"
    :userData="userData"
    @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event"
  />
</template>

<script>
// Importing necessary components and API modules
import topicrecommendation from "@/API/TopicRecommendation/TopicRecommendation";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import StatusDropdown from "./components/StatusDropdown.vue";
import User from "@/API/User/User";
import Department from "@/API/Department/Department";

export default {
  components: {
    MainPage,
    DataTable,
    ViewUserDetails,
    StatusDropdown,
  },

  setup() {
    const api = new topicrecommendation();
    const apiParams = { with: ["topic:id,name", "meeting:id,title"] };
    const tableColumns = [];
    const userApi = new User();
    const departmentApi = new Department();

    return {
      api,
      apiParams,
      tableColumns,
      userApi,
      departmentApi,
    };
  },

  async mounted() {
    await this.fetchUsers();
    await this.fetchDepartments();
  },

  data() {
    return {
      filterData: [
        {
          title: this.$t("topic.meeting"),
          key: "meeting_id",
          type: "string",
          data: this.$t("topic.meeting"),
          id: "id",
          display: "title",
          filterType: "filter",
        },
        {
          title: this.$t("topic.topic_label"),
          key: "topic_id",
          type: "string",
          data: this.$t("topic.topic_label"),
          id: "id",
          display: "name",
          filterType: "filter",
        },
        {
          title: this.$t("topic.status"),
          key: "status",
          type: "string",
          data: [
            { id: "open", name: this.$t("topic.open") },
            { id: "in_progress", name: this.$t("topic.in_progress") },
            { id: "completed", name: this.$t("topic.completed") },
          ],
          filterType: "filter",
        },
      ],
      viewUserModal: false,
      nowDate: new Date().toISOString().split("T")[0],
      users: [],
      usersForComponants: [],
      userData: [],
      departments: [],
      allDepartments: [],
      statusOptions: [
        { title: this.$t("topic.open"), value: "open" },
        { title: this.$t("topic.in_progress"), value: "in_progress" },
        { title: this.$t("topic.completed"), value: "completed" },
      ],
      statusLoading: false,
      currentUpdatingItem: null,
    };
  },

  created() {
    this.tableColumns = [
      {
        id: "title",
        title: this.$t("topic.title"),
        data: "title",
        defaultContent: "N/A",
      },
      {
        id: "topic",
        title: this.$t("topic.topic"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "meeting",
        title: this.$t("topic.meeting"),
        data: "topic.name",
        defaultContent: "N/A",
      },
      {
        id: "assignee",
        title: this.$t("topic.assigne_to"),
        data: "_USERSERVICE._User.assignee_id.full_name",
        defaultContent: "N/A",
      },
      {
        id: "due_date",
        title: this.$t("topic.due_date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("topic.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "created_by",
        title: this.$t("topic.created_by"),
        data: "_USERSERVICE._User.created_by.full_name",
        defaultContent: "N/A",
      },
    ];
  },

  methods: {
    editItem(data) {
      console.log("editItem", data);
    },

    formatDate(date) {
      if (!date) return this.$t("topic.na");

      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();

      return `${day}/${month}/${year}`;
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

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name|ola_leader",
        });

        this.departments = deptResponse.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});

        this.allDepartments = deptResponse;
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    },

    async openAssigneeDetailsModal(selectedAssigneeId) {
      this.userData = { ...this.users[selectedAssigneeId] };
      try {
        this.userDepartment =
          this.departments[this.userData.department_id] ?? this.$t("topic.na");
        this.userData.department = this.userDepartment || this.$t("topic.na");
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user department:", error);
      }
    },

    async handleStatusChange({ item, newStatus }) {
      this.statusLoading = true;
      this.currentUpdatingItem = item;

      try {
        const recommendationData = {
          ...item,
          status: newStatus,
        };

        const response = await this.api.changeStatus(recommendationData.id, recommendationData);
        if (response.data.status == "success") {
          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("topic.status_changed"));
        }
      } catch (error) {
        console.error("Error updating recommendation status:", error);
      } finally {
        this.statusLoading = false;
        this.currentUpdatingItem = null;
      }
    },
  },
};
</script>

<style scoped>
::v-deep(.dt-buttons button:last-child) {
  display: none !important;
}

/* User Badge */
.badge-user {
  background-color: #d0b5e3;
  color: #43235c;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  transition: all 0.2s ease;
}

.badge-user:hover {
  background-color: #c5a3db;
}
</style>
