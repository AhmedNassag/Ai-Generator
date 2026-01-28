<template>
  <main-page
    ref="page"
    :isFlipped="false"
    :mainPage="this.$t('insights.insights')"
    :mainSubPage="this.$t('insights.mywork')"
    :titlePage="this.$t('insights.mywork')"
    v-permission:show
  >
    <template #datatable>
      <DataTable
        v-if="apiReady"
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="null"
        :openForm="null"
        :hideActions="true"
        :hideDivButtons="true"
        :hideActionsColumn="true"
      >
        <template #name="{ item }">
          <span>{{ item.name }}</span>
        </template>

        <template #created_at="{ item }">
          <span class="badge badge-success">
            {{ formatCreatedDate(item.created_at) }}
          </span>
        </template>

        <template #expired_day="{ item }">
          {{ calculateDueDate(item?.due_date) }}
          <i
            v-if="isOverdue(item?.due_date)"
            style="color: red"
            class="fa-solid fa-circle-exclamation"
          ></i>
        </template>

        <template #provider="{ item }">
          <span>{{ getUserName(item.submitted_by) }}</span>
        </template>

        <template #responsible="{ item }">
          <span v-if="item.statuses?.[0]?.decidedBy">
            {{ getUserName(item.requirement.responsible_id) }}
          </span>
          <span v-else>-</span>
        </template>
        <template #requirement="{ item }">
          <span v-if="item.requirement">
             <router-link
              :to="{ path: `/evidences/${item.requirement_id}` }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.requirement.name  }}
            </router-link>
          </span>
          <span v-else>-</span>
        </template>

        <template #status="{ item }">
          <span
            :class="getStatusBadgeClass(item.statuses?.[0]?.status)"
          >
            {{
              item.statuses?.[0]?.status
                ? item.statuses[0].status.charAt(0).toUpperCase() +
                  item.statuses[0].status.slice(1)
                : "Pending"
            }}
          </span>
          <!-- <div>
            {{ item.statuses?.map(s=> s.status) }}
          </div> -->
        </template>
      </DataTable>
    </template>
  </main-page>
</template>

<script>
import { useRouter } from "vue-router";
import Evidence from "@/API/Evidence/Evidence";
import Requirement from "@/API/Requirement/Requirement";
import control from "@/API/Control/Control";
import user from "@/API/User/User";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Auth from "@/API/Auth";
export default {
  components: {
    MainPage,
    DataTable,
  },

  setup() {
    const api = new Evidence();
    const RequirementApi = new Requirement();
    const controlApi = new control();
    const userApi = new user();
    const requirement_id = useRouter().currentRoute.value.params.id;
    const apiParams = {};
    const tableColumns = [];

    return {
      api,
      apiParams,
      tableColumns,
      requirement_id,
      RequirementApi,
      controlApi,
      userApi,
    };
  },

  data() {
    return {
      controlList: [],
      userList: [],
      expireDays: null,
      apiReady: false,
    };
  },
  async mounted() {
    this.userList = await this.userApi.getAll({ select: "id|full_name" });
  },

  created() {
    this.getFilteredEvidence();
    this.requirementId = this.$route.params.id;

    this.tableColumns = [
      {
        id: "name",
        title: this.$t("evidence.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("evidence.created_at"),
        data: "created_at",
        defaultContent: "N/A",
      },
      {
        id: "expired_day",
        title: this.$t("evidence.expired_day"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "provider",
        title: this.$t("evidence.provider"),
        data: "submitted_by",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("evidence.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "responsible",
        title: "Responsible", //this.$t("evidence.action_by"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "requirement",
        title: "Requirement", //this.$t("evidence.action_by"),
        data: "",
        defaultContent: "N/A",
      },
    ];
  },

  methods: {
    async getFilteredEvidence() {
      try {
        let data = await this.api.getAll({
          with: ["requirement"],
          filterWhereRelation: [
            `requirement@responsible_id|${Auth.USER?.id}|=`,
          ],
        });

        console.log("before", data);

        // ✅ Filter the records BEFORE passing into new getAll
        data = data?.filter((evidence) => {
          const isRejected = evidence?.statuses?.some(
            (item) => item.status === "rejected"
          );
          const isOverdue = new Date(evidence?.due_date) < new Date();
          return isRejected || isOverdue;
        });

        console.log("after", data);

        // ✅ Override API to return filtered data
        this.api = {
          getAll: async () => {
            return {
              data,
              recordsTotal: data.length,
              recordsFiltered: data.length,
            };
          },
        };

        this.apiReady = true;
      } catch (error) {
        console.error(" error:", error);
        this.$refs.page?.api?.poup?.(
          { status: false, message: error.message },
          this.$t("Errrrrrr")
        );
      }
    },

    getUserName(userId) {
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : "N/A";
    },

    getApproverName(userId) {
      if (!userId) return "N/A";
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : userId;
    },

    // async requirementName() {
    //   const response = await this.RequirementApi.show(this.requirementId);
    //   this.requirementname = response?.name;
    // },

    getRejectedControls(item) {
      if (!item.control_approvals || !item.control_approvals.length) {
        return [];
      }

      return item.control_approvals
        .filter((approval) => approval.status.toLowerCase() === "rejected")
        .map((approval) => {
          const control = this.controlList.find(
            (c) => c.id === approval.controlId
          );
          return control ? control.short_name : "-";
        });
    },

    async fetchControls() {
      try {
        const requirement_id = this.$route.params.id;
        const requirement = await this.RequirementApi.show(requirement_id);
        const requiredControlIds = requirement?.control_id || [];
        this.expireDays = requirement?.expire_days;

        const allControls = await this.controlApi.getAll({
          select: "id|short_name|framework_id|long_name|control_number",
        });

        this.controlList = allControls.filter((control) =>
          requiredControlIds.includes(control.id)
        );
      } catch (error) {
        console.error("Error fetching controls:", error);
      }
    },

    getStatusBadgeClass(status) {
      const normalizedStatus = status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : "Pending";

      const statusMap = {
        Approved: "badge bg-success",
        Rejected: "badge text-bg-danger",
        Pending: "badge text-bg-warning",
      };

      return statusMap[normalizedStatus] || "badge text-bg-warning";
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    formatCreatedDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    calculateDueDate(dueDate) {
      // if (!createdAt || expireDays < 0) return "";
      // const createdDate = new Date(createdAt);
      // const dueDate = new Date(createdDate);
      // dueDate.setDate(createdDate.getDate() + expireDays);
      return this.formatDate(dueDate);
    },

    isOverdue(dueDate) {
      const today = new Date();
      const due = new Date(dueDate);
      return today.getTime() > due.getTime();
    },
  },
};
</script>

<style scoped>
.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>

<style>
.delete_button {
  display: none !important;
}

.edit_button {
  display: none !important;
}
</style>
