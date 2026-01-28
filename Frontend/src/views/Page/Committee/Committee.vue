<template>
  <PurpleDotsLoader v-if="load" />
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('committee.committee_mngt')"
    :subPage="$t('committee.committees')"
    :titlePage="$t('committee.committees')"
    :showInsightsTab="true"
  >
    <!-- Statistics Slot - Displays in the "Insights" tab -->
    <template #statistics>
      <div class="statistics-content">
        <!-- Metrics Cards Row 1 -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="metric-card bg-primary-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="metric-content rtl-text-end">
                <h3 class="metric-value">
                  {{ statisticsData.totalCommittees || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("committee.total_committees") || "Total Committees" }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-success-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-infinity"></i>
              </div>
              <div class="metric-content rtl-text-end">
                <h3 class="metric-value">
                  {{ statisticsData.permanentCommittees || 0 }}
                </h3>
                <p class="metric-label">
                  {{
                    $t("committee.permanent_committees") ||
                    "Permanent Committees"
                  }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-warning-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="metric-content rtl-text-end">
                <h3 class="metric-value">
                  {{ statisticsData.temporaryCommittees || 0 }}
                </h3>
                <p class="metric-label">
                  {{
                    $t("committee.temporary_committees") ||
                    "Temporary Committees"
                  }}
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card bg-info-subtle rtl">
              <div class="metric-icon">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="metric-content rtl-text-end">
                <h3 class="metric-value">
                  {{ statisticsData.totalMembers || 0 }}
                </h3>
                <p class="metric-label">
                  {{ $t("committee.total_members") || "Total Members" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="row">
          <!-- Committee Type Distribution (Donut Chart) -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("committee.type_distribution") ||
                  "Committee Type Distribution"
                }}
              </h6>
              <highcharts :options="typeDistributionChart"></highcharts>
            </div>
          </div>

          <!-- Members per Committee (Column Chart) -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("committee.members_per_committee") ||
                  "Members per Committee"
                }}
              </h6>
              <highcharts :options="membersPerCommitteeChart"></highcharts>
            </div>
          </div>

          <!-- Formation Timeline (Column Chart) -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{ $t("committee.formation_timeline") || "Formation Timeline" }}
              </h6>
              <highcharts :options="formationTimelineChart"></highcharts>
            </div>
          </div>

          <!-- Top Committees by Members (Horizontal Bar) -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("committee.top_committees_by_members") ||
                  "Top Committees by Members"
                }}
              </h6>
              <highcharts :options="topCommitteesChart"></highcharts>
            </div>
          </div>
        </div>

        <!-- Related Modules Section -->
        <div class="row mt-4">
          <div class="col-12 mb-3">
            <h5 class="section-title">
              {{
                $t("committee.committee_activities") || "Committee Activities"
              }}
            </h5>
          </div>

          <!-- Committee Meetings Timeline -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("committee.meetings_by_committee") ||
                  "Meetings by Committee"
                }}
              </h6>
              <highcharts :options="meetingsByCommitteeChart"></highcharts>
            </div>
          </div>

          <!-- Committee Agendas -->
          <div class="col-md-6 mb-4">
            <div class="chart-container chart-container-equal-height">
              <h6 class="chart-title">
                {{
                  $t("committee.agendas_by_committee") || "Agendas by Committee"
                }}
              </h6>
              <highcharts :options="agendasByCommitteeChart"></highcharts>
            </div>
          </div>

          <!-- Topics by Committee -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("committee.topics_by_committee") || "Topics by Committee"
                }}
              </h6>
              <highcharts :options="topicsByCommitteeChart"></highcharts>
            </div>
          </div>

          <!-- Meeting Status Distribution -->
          <div class="col-md-6 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("committee.meeting_status_distribution") ||
                  "Meeting Status Distribution"
                }}
              </h6>
              <highcharts :options="meetingStatusChart"></highcharts>
            </div>
          </div>

          <!-- Agenda Status Distribution -->
          <div class="col-md-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("committee.agenda_status_distribution") ||
                  "Agenda Status Distribution"
                }}
              </h6>
              <highcharts :options="agendaStatusChart"></highcharts>
            </div>
          </div>

          <!-- Committee Activity Overview (Combined) -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("committee.activity_overview") ||
                  "Committee Activity Overview"
                }}
              </h6>
              <highcharts :options="activityOverviewChart"></highcharts>
            </div>
          </div>

          <!-- Status Breakdown by Committee -->
          <div class="col-12 mb-4">
            <div class="chart-container">
              <h6 class="chart-title">
                {{
                  $t("committee.status_breakdown") ||
                  "Status Breakdown by Committee"
                }}
              </h6>
              <highcharts :options="statusBreakdownChart"></highcharts>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #datatable>
      <!-- Filter Section -->
      <!-- <div class="mb-3">
        <div class="row">
          <div class="col-md-4 col-lg-4 mb-3">
            <label for="typeFiltter">{{ $t("common.type") }}</label>
            <select
              id="typeFiltter"
              class="form-control"
              v-model="filters.type"
            >
              <option value="">{{ $t("common.all") }}</option>
              <option id="temporary" value="temporary">
                {{ $t("committee.temporary") }}
              </option>
              <option id="permanent" value="permanent">
                {{ $t("committee.permanent") }}
              </option>
            </select>
          </div>
        </div>
      </div> -->

      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
        :filters="filterData"
      >
        <!-- Name Column with Badge -->
        <template #name="{ item }">
          <router-link
            :to="{ path: `/committee-details/${item.id}` }"
            class="badge badge-purple text-decoration-none"
          >
            {{ item.name }}
          </router-link>
        </template>

        <!-- Type Column with Colored Badges -->
        <template #type="{ item }">
          <span v-if="item.type === 'permanent'" class="badge badge-green">
            {{ $t("committee.permanent") }}
          </span>
          <span v-else-if="item.type === 'temporary'" class="badge badge-red">
            {{ $t("committee.temporary") }}
          </span>
        </template>

        <!-- Formation Date -->
        <template #formation_date="{ item }">
          {{ formatDate(item.formation_date) }}
        </template>

        <!-- Chairperson with Full Name Badge -->
        <template #chairperson="{ item }">
          <a
            v-if="item.chairperson_id"
            href="#"
            @click.prevent="openAssigneeDetailsModal(item.chairperson_id)"
            class="badge badge-user text-decoration-none"
          >
            {{ users[item.chairperson_id]?.full_name }}
          </a>
          <span v-else>N/A</span>
        </template>

        <!-- Members Column - Updated to match internal message pattern -->
        <template #members="{ item }">
          <span v-if="item.member_ids && item.member_ids.length > 0">
            <!-- Single member: display like chairperson -->
            <div v-if="item.member_ids.length === 1" class="user-info">
              <div
                class="user-avatar"
                @click.prevent="
                  openAssigneeDetailsModal(users[item.member_ids[0]])
                "
              >
                {{ getInitials(users[item.member_ids[0]]?.full_name) }}
              </div>
              <span class="user-fullname">{{
                users[item.member_ids[0]]?.full_name
              }}</span>
            </div>

            <!-- Multiple members: use AvatarGroup -->
            <AvatarGroup
              v-else
              :users="getMemberUsers(item.member_ids)"
              :maxVisible="3"
              :spacing="20"
              :clickable="true"
              empty-text="N/A"
              @user-click="openAssigneeDetailsModal"
              @click="openMemberEditModal(item)"
            />
          </span>
          <span v-else>N/A</span>
        </template>

        <!-- Additional Actions -->
        <template #addAction="{ item }">
          <a
            href="javascript:void(0)"
            class="dropdown-item action-list-item action-title"
            @click.prevent="openDocument(item)"
            v-if="item?.formation_approval_file"
            :class="{ disabled: !item.formation_approval_file }"
          >
            <v-icon size="18" class="action-icon">
              mdi-file-document-outline
            </v-icon>
            {{ $t("committee.document") }}
          </a>
        </template>
      </DataTable>
    </template>

    <!-- Form Section -->
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      >
        <template #formation_approval_file="{ item }">
          <div class="col-md-6 mt-5">
            <v-file-input
              :label="$t('committee.formation_approval')"
              id="uploadedFileInput"
              clearable
              @change="handleFileChange"
              @click:clear="clearUploadedFile"
            />
            <div
              v-if="
                newItem.formation_approval_file &&
                typeof newItem.formation_approval_file !== 'object'
              "
              class="ml-3"
              style="margin-top: -15px"
            >
              <a
                :href="newItem.formation_approval_file"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ $t("committee.view_formation_approval_file") }}
              </a>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- View User Details Modal -->
  <ViewUserDetails
    :viewUserModal="viewUserModal"
    :userData="userData"
    @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event"
  />

  <!-- Member Edit Modal -->
  <MemberEditModal
    :isOpen="memberModalOpen"
    @update:isOpen="memberModalOpen = $event"
    :users="usersForComponants"
    :currentMembers="
      Array.isArray(selectedCommittee?.member_ids)
        ? selectedCommittee.member_ids
        : []
    "
    :currentHeadsOfCommittee="currentHeadsOfCommittee"
    @save="handleMemberSave"
    @close="handleModalClose"
  />
</template>

<script>
import committee from "@/API/Committee/Committee";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { defineRule } from "vee-validate";
import User from "@/API/User/User";
import Department from "@/API/Department/Department";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import MemberEditModal from "@/views/Page/Committee/components/MemberEditModal.vue";
import Auth from "@/API/Auth";
import AvatarGroup from "@/components/AvatarGroup.vue";
import Highcharts from "highcharts";
import { Chart } from "highcharts-vue";
import Topic from "@/API/Topic/Topic";
import Agenda from "@/API/Agenda/Agenda";
import Meeting from "@/API/Meeting/Meeting";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";
import { useNotifyLogSetting } from "@/composables/useNotifyLogSetting";

// Configure Highcharts global options
Highcharts.setOptions({
  lang: {
    decimalPoint: ".",
    thousandsSep: ",",
  },
  credits: {
    enabled: false,
  },
  chart: {
    style: {
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
  },
});

defineRule("before_or_equal_today", (value, [compareTo], ctx) => {
  const nowDate = new Date().toISOString().split("T")[0];
  if (!value) return true;
  if (value <= nowDate) return true;
  return `${ctx.field} must be before or equal to ${nowDate}.`;
});

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ViewUserDetails,
    MemberEditModal,
    AvatarGroup,
    highcharts: Chart,
    PurpleDotsLoader,
  },

  setup() {
    const USER = Auth.USER;
    const api = new committee();
    const apiParams = {};
    const tableColumns = [];
    const fromFields = [];
    const userApi = new User();
    const departmentApi = new Department();
    const topicApi = new Topic();
    const agendaApi = new Agenda();
    const meetingApi = new Meeting();

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      departmentApi,
      topicApi,
      agendaApi,
      meetingApi,
      USER,
    };
  },

  async mounted() {
    await this.fetchUsers();
    await this.fetchDepartments();
    await this.fetchStatisticsData();
    this.load = false;
  },

  data() {
    return {
      filterData: [],
      load: true,
      newItem: {},
      isFlipped: false,
      isReadonly: false,
      viewUserModal: false,
      memberModalOpen: false,
      isLoading: false,
      nowDate: new Date().toISOString().split("T")[0],
      users: {},
      usersForComponants: [],
      userData: [],
      departments: [],
      allDepartments: [],
      currentHeadsOfCommittee: [],
      filters: {
        type: "",
      },
      selectedCommittee: null,

      // Statistics data
      statisticsData: {
        totalCommittees: 0,
        permanentCommittees: 0,
        temporaryCommittees: 0,
        totalMembers: 0,
      },

      // Chart configurations
      typeDistributionChart: {},
      membersPerCommitteeChart: {},
      formationTimelineChart: {},
      topCommitteesChart: {},

      // Related modules charts
      meetingsByCommitteeChart: {},
      agendasByCommitteeChart: {},
      topicsByCommitteeChart: {},
      meetingStatusChart: {},
      agendaStatusChart: {},
      activityOverviewChart: {},
      statusBreakdownChart: {},
    };
  },

  created() {
    useNotifyLogSetting(
      [
        { label: "Committee", model: "Committee" },
        { label: "Agenda", model: "Agenda" },
      ],
      true
    );
    // Initialize filterData here so we can use $t()
    this.filterData = [
      {
        title: this.$t("common.type"),
        key: "type",
        type: "string",
        data: [
          { id: "permanent", name: this.$t("committee.permanent") },
          { id: "temporary", name: this.$t("committee.temporary") },
        ],
        filterType: "filter",
      },
    ];
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("common.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "type",
        title: this.$t("common.type"),
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "formation_date",
        title: this.$t("committee.formation_date"),
        data: "formation_date",
        defaultContent: "N/A",
      },
      {
        id: "chairperson",
        title: this.$t("committee.chairperson"),
        data: "_USERSERVICE._User.chairperson_id.full_name",
        defaultContent: "N/A",
      },
      {
        id: "members",
        title: this.$t("committee.members"),
        data: "_USERSERVICE._User.member_ids.full_name",
        defaultContent: "N/A",
      },
    ];

    this.fromFields = [
      {
        section: this.$t("committee.basic_informations"),
        name: "name",
        label: this.$t("common.name"),
        type: "text",
        rules: "required",
        col: 4,
      },
      {
        section: this.$t("committee.basic_informations"),
        name: "description",
        label: this.$t("common.description"),
        type: "text",
        rules: "required",
        col: 4,
      },
      {
        section: this.$t("committee.basic_informations"),
        type: "options",
        name: "type",
        label: this.$t("common.type"),
        options: [
          { id: "permanent", name: this.$t("committee.permanent") },
          { id: "temporary", name: this.$t("committee.temporary") },
        ],
        optionLabel: "name",
        col: 4,
        placeholder: this.$t("committee.select_type"),
        rules: "required",
      },
      {
        section: this.$t("committee.basic_informations"),
        name: "scope",
        label: this.$t("committee.scope"),
        type: "textarea",
        rules: "",
        col: 12,
      },
      {
        section: this.$t("committee.basic_informations"),
        name: "formation_date",
        label: this.$t("committee.formation_date"),
        type: "date",
        rules: `required|date|before_or_equal_today:${this.nowDate}`,
        col: 6,
      },
      {
        section: this.$t("committee.basic_informations"),
        name: "formation_approval_file",
      },
      {
        section: this.$t("committee.assignments"),
        type: "user-select",
        name: "chairperson_id",
        label: this.$t("committee.chairperson"),
        options: [],
        optionLabel: "full_name",
        col: 6,
        placeholder: this.$t("committee.select_chairperson"),
        rules: "required",
      },
      {
        section: this.$t("committee.assignments"),
        type: "user-select",
        name: "vice_chair_id",
        label: this.$t("committee.vice_chair"),
        options: [],
        optionLabel: "full_name",
        col: 6,
        placeholder: this.$t("committee.select_vice_chair"),
        rules: "required",
      },
      {
        section: this.$t("committee.assignments"),
        type: "user-select",
        name: "secretary_id",
        label: this.$t("committee.secretary"),
        options: [],
        optionLabel: "full_name",
        col: 6,
        placeholder: this.$t("committee.select_secretary"),
        rules: "required",
      },
      {
        section: this.$t("committee.assignments"),
        type: "user-select",
        name: "member_ids",
        label: this.$t("committee.members"),
        options: [],
        optionLabel: "full_name",
        col: 6,
        multiple: true,
        placeholder: this.$t("committee.select_members"),
        rules: "required",
      },
    ];
  },

  computed: {
    // Filter options for chairperson (exclude vice_chair, secretary)
    chairpersonOptions() {
      const excludeIds = [
        this.newItem.vice_chair_id,
        this.newItem.secretary_id,
      ].filter((id) => id);

      return this.usersForComponants.filter(
        (user) => !excludeIds.includes(user.id)
      );
    },

    // Filter options for vice_chair (exclude chairperson, secretary)
    viceChairOptions() {
      const excludeIds = [
        this.newItem.chairperson_id,
        this.newItem.secretary_id,
      ].filter((id) => id);

      return this.usersForComponants.filter(
        (user) => !excludeIds.includes(user.id)
      );
    },

    // Filter options for secretary (exclude chairperson, vice_chair)
    secretaryOptions() {
      const excludeIds = [
        this.newItem.chairperson_id,
        this.newItem.vice_chair_id,
      ].filter((id) => id);

      return this.usersForComponants.filter(
        (user) => !excludeIds.includes(user.id)
      );
    },

    // Filter options for members (exclude all leadership roles)
    memberOptions() {
      const excludeIds = [
        this.newItem.chairperson_id,
        this.newItem.vice_chair_id,
        this.newItem.secretary_id,
      ].filter((id) => id);

      return this.usersForComponants.filter(
        (user) => !excludeIds.includes(user.id)
      );
    },
  },
  methods: {
    updateFormFieldOptions() {
      this.fromFields = this.fromFields.map((field) => {
        switch (field.name) {
          case "chairperson_id":
            return { ...field, options: this.chairpersonOptions };
          case "vice_chair_id":
            return { ...field, options: this.viceChairOptions };
          case "secretary_id":
            return { ...field, options: this.secretaryOptions };
          case "member_ids":
            return { ...field, options: this.memberOptions };
          default:
            return field;
        }
      });
    },
    getMemberUsers(memberIds) {
      if (!memberIds || !Array.isArray(memberIds)) return [];
      return memberIds.map((id) => this.users[id]).filter((user) => user);
    },
    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
    },

    handleFileChange(e) {
      this.newItem.formation_approval_file = e.target.files[0] || null;
    },

    clearUploadedFile() {
      this.newItem.formation_approval_file = null;
    },

    async fetchUsers() {
      try {
        const usersResponse = await this.userApi.getAll({
          select: "id|full_name|type|department_id|phone|username|email",
        });

        this.usersForComponants = usersResponse;

        // Create a new object instead of mutating
        const usersMap = {};
        usersResponse.forEach((user) => {
          usersMap[user.id] = user;
        });

        // Assign the complete object at once to trigger reactivity
        this.users = usersMap;

        console.log("Users fetched:", this.users);

        // Update form fields with computed options
        this.updateFormFieldOptions();
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    },
    async openAssigneeDetailsModal(selectedAssignee) {
      // Handle both user object and user ID
      const userId =
        typeof selectedAssignee === "object"
          ? selectedAssignee.id
          : selectedAssignee;
      this.userData = { ...this.users[userId] };
      try {
        this.userDepartment =
          this.departments[this.userData.department_id] ?? "N/A";
        this.userData.department = this.userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch department:", error);
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

    openDocument(item) {
      if (item.formation_approval_file) {
        window.open(item.formation_approval_file, "_blank");
      }
    },

    formatDate(date) {
      if (!date) return "N/A";
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    getInitials(fullName) {
      if (!fullName) return "NA";
      const names = fullName.trim().split(" ");

      // If only one name, take first 2 characters
      if (names.length === 1) {
        return fullName.substring(0, 2).toUpperCase();
      }

      // If multiple names, take first char of first and last name
      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    },
    getRandomColor(seed) {
      // Use the member ID as seed for consistent colors
      const colors = [
        "#6E3894",
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E9",
        "#F8C471",
        "#82E0AA",
        "#F1948A",
        "#7FB3D5",
        "#D7BDE2",
        "#76D7C4",
        "#F9E79F",
        "#AED6F1",
        "#E59866",
      ];

      // Simple hash function to get consistent color for same memberId
      let hash = 0;
      for (let i = 0; i < String(seed).length; i++) {
        hash = String(seed).charCodeAt(i) + ((hash << 5) - hash);
      }

      const index = Math.abs(hash) % colors.length;
      return colors[index];
    },

    isCommitteeHead(item) {
      return (
        USER.id === item.chairperson_id ||
        USER.id === item.vice_chair_id ||
        USER.id === item.secretary_id
      );
    },

    openMemberEditModal(item) {
      this.selectedCommittee = item;
      this.memberModalOpen = true;
      this.currentHeadsOfCommittee = [
        item.chairperson_id,
        item.vice_chair_id,
        item.secretary_id,
      ].filter((id) => id);
    },

    async handleMemberSave(updatedMembers) {
      this.isLoading = true;
      try {
        const updatedData = {
          ...this.selectedCommittee,
          member_ids: updatedMembers,
        };

        const response = await this.api.update(updatedData);

        if (response.status === "success") {
          this.memberModalOpen = false;
          this.$emit("members-updated", updatedMembers);
          this.member_ids = updatedMembers;
          this.$refs.table.refreshTable();
          this.api.poup(
            response,
            this.$t("committee.members_updated_successfully")
          );
        } else {
          throw new Error(
            response.message || this.$t("committee.failed_to_update_members")
          );
        }
      } catch (error) {
        console.error("Failed to update members:", error);
        this.api.poup(
          { status: "error" },
          this.$t("committee.failed_to_update_members_try_again")
        );
      } finally {
        this.isLoading = false;
      }
    },

    handleModalClose() {
      this.memberModalOpen = false;
    },

    async fetchStatisticsData() {
      try {
        // Fetch all committees with member data
        const allCommittees = await this.api.getAll({});

        // Fetch related data
        const [allMeetings, allAgendas, allTopics] = await Promise.all([
          this.meetingApi.getAll({ with: ["committee"] }).catch(() => []),
          this.agendaApi.getAll({ with: ["committee"] }).catch(() => []),
          this.topicApi
            .getAll({ with: ["agenda", "agenda.committee"] })
            .catch(() => []),
        ]);

        let totalMembers = 0;
        let permanentCount = 0;
        let temporaryCount = 0;
        const formationByYear = {};
        const committeeDetails = [];

        // Create committee ID to name mapping
        const committeeMap = {};
        allCommittees.forEach((committee) => {
          committeeMap[committee.id] = committee.name;
        });

        allCommittees.forEach((committee) => {
          // Count members
          const memberCount = committee.member_ids
            ? committee.member_ids.length
            : 0;
          totalMembers += memberCount;

          // Count by type
          if (committee.type === "permanent") {
            permanentCount++;
          } else if (committee.type === "temporary") {
            temporaryCount++;
          }

          // Formation timeline
          if (committee.formation_date) {
            const year = new Date(committee.formation_date).getFullYear();
            formationByYear[year] = (formationByYear[year] || 0) + 1;
          }

          // Store committee details
          committeeDetails.push({
            id: committee.id,
            name: committee.name,
            type: committee.type,
            memberCount: memberCount,
            formationDate: committee.formation_date,
          });
        });

        this.statisticsData = {
          totalCommittees: allCommittees.length,
          permanentCommittees: permanentCount,
          temporaryCommittees: temporaryCount,
          totalMembers: totalMembers,
        };

        this.buildCharts(committeeDetails, formationByYear);
        this.buildRelatedCharts(
          allMeetings,
          allAgendas,
          allTopics,
          committeeMap
        );
      } catch (error) {
        console.error("Error fetching committee statistics:", error);
      }
    },

    buildCharts(committeeDetails, formationByYear) {
      // Color schema
      const colorSchema = {
        crimsonEarth: {
          background: "#EED3D380",
          avatar: "#A92525",
          text: "#541212",
        },
        goldenOlive: {
          background: "#F3EAD180",
          avatar: "#C4951B",
          text: "#A37C16",
        },
        forestDeep: {
          background: "#B6CAAE80",
          avatar: "#255F0B",
          text: "#122F05",
        },
        steelGrey: {
          background: "#D9D9D9",
          avatar: "#999999",
          text: "#404040",
        },
      };

      // 1. Type Distribution Chart (Donut)
      this.typeDistributionChart = {
        chart: {
          type: "pie",
          height: 350,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        title: { text: null },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "50%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
        },
        series: [
          {
            name: this.$t("committee.committees") || "Committees",
            colorByPoint: true,
            data: [
              {
                name: this.$t("committee.permanent") || "Permanent",
                y: this.statisticsData.permanentCommittees,
                color: colorSchema.forestDeep.avatar,
              },
              {
                name: this.$t("committee.temporary") || "Temporary",
                y: this.statisticsData.temporaryCommittees,
                color: colorSchema.goldenOlive.avatar,
              },
            ],
          },
        ],
      };

      // 2. Members per Committee Chart (Column)
      const membersDistribution = {
        "0-5": 0,
        "6-10": 0,
        "11-15": 0,
        "16-20": 0,
        "20+": 0,
      };

      committeeDetails.forEach((committee) => {
        const count = committee.memberCount;
        if (count <= 5) membersDistribution["0-5"]++;
        else if (count <= 10) membersDistribution["6-10"]++;
        else if (count <= 15) membersDistribution["11-15"]++;
        else if (count <= 20) membersDistribution["16-20"]++;
        else membersDistribution["20+"]++;
      });

      this.membersPerCommitteeChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: Object.keys(membersDistribution),
          title: {
            text: this.$t("committee.member_range") || "Member Range",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text:
              this.$t("committee.number_of_committees") ||
              "Number of Committees",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " committees",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: this.$t("committee.committees") || "Committees",
            data: Object.values(membersDistribution),
            color: colorSchema.forestDeep.avatar,
          },
        ],
      };

      // 3. Formation Timeline Chart (Column)
      const sortedYears = Object.keys(formationByYear).sort();
      this.formationTimelineChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: sortedYears,
          title: {
            text: this.$t("committee.year") || "Year",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("committee.committees_formed") || "Committees Formed",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " committees",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: this.$t("committee.committees_formed") || "Formed",
            data: sortedYears.map((year) => formationByYear[year]),
            color: colorSchema.goldenOlive.avatar,
          },
        ],
      };

      // 4. Top Committees by Members (Horizontal Bar)
      const topCommittees = committeeDetails
        .sort((a, b) => b.memberCount - a.memberCount)
        .slice(0, 10);

      this.topCommitteesChart = {
        chart: {
          type: "areaspline",
          height: 400,
        },
        title: { text: null },
        xAxis: {
          categories: topCommittees.map((c) => c.name),
          title: { text: null },
          labels: { style: { fontSize: "12px" } },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("committee.number_of_members") || "Number of Members",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " members",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: this.$t("committee.members") || "Members",
            data: topCommittees.map((c) => c.memberCount),
            color: colorSchema.steelGrey.avatar,
          },
        ],
      };
    },

    buildRelatedCharts(allMeetings, allAgendas, allTopics, committeeMap) {
      // Color schema
      const colorSchema = {
        crimsonEarth: {
          background: "#EED3D380",
          avatar: "#A92525",
          text: "#541212",
        },
        goldenOlive: {
          background: "#F3EAD180",
          avatar: "#C4951B",
          text: "#A37C16",
        },
        forestDeep: {
          background: "#B6CAAE80",
          avatar: "#255F0B",
          text: "#122F05",
        },
        steelGrey: {
          background: "#D9D9D9",
          avatar: "#999999",
          text: "#404040",
        },
      };

      // Count meetings, agendas, and topics by committee
      const meetingsByCommittee = {};
      const agendasByCommittee = {};
      const topicsByCommittee = {};
      const meetingStatusCounts = {
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
      };

      const agendaStatusCounts = {
        draft: 0,
        in_review: 0,
        confirmed: 0,
        rejected: 0,
        deferred: 0,
      };

      // Process meetings
      allMeetings.forEach((meeting) => {
        const committeeId = meeting.committee_id;
        if (committeeId && committeeMap[committeeId]) {
          meetingsByCommittee[committeeId] =
            (meetingsByCommittee[committeeId] || 0) + 1;

          // Count meeting statuses
          if (
            meeting.status &&
            meetingStatusCounts.hasOwnProperty(meeting.status)
          ) {
            meetingStatusCounts[meeting.status]++;
          }
        }
      });

      // Process agendas
      allAgendas.forEach((agenda) => {
        const committeeId = agenda.committee_id;
        if (committeeId && committeeMap[committeeId]) {
          agendasByCommittee[committeeId] =
            (agendasByCommittee[committeeId] || 0) + 1;

          // Count agenda statuses
          if (
            agenda.status &&
            agendaStatusCounts.hasOwnProperty(agenda.status)
          ) {
            agendaStatusCounts[agenda.status]++;
          }
        }
      });

      // Process topics
      allTopics.forEach((topic) => {
        const committeeId = topic.agenda?.committee_id;
        if (committeeId && committeeMap[committeeId]) {
          topicsByCommittee[committeeId] =
            (topicsByCommittee[committeeId] || 0) + 1;
        }
      });

      // 1. Meetings by Committee (Column Chart)
      const topCommitteesByMeetings = Object.entries(meetingsByCommittee)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.meetingsByCommitteeChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: topCommitteesByMeetings.map(([id]) => committeeMap[id]),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text:
              this.$t("committee.number_of_meetings") || "Number of Meetings",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " meetings",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: this.$t("committee.meetings") || "Meetings",
            data: topCommitteesByMeetings.map(([, count]) => count),
            color: colorSchema.crimsonEarth.avatar,
          },
        ],
      };

      // 2. Agendas by Committee (Column Chart)
      const topCommitteesByAgendas = Object.entries(agendasByCommittee)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.agendasByCommitteeChart = {
        chart: {
          type: "column",
          height: 350,
        },
        title: { text: null },
        xAxis: {
          categories: topCommitteesByAgendas.map(([id]) => committeeMap[id]),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("committee.number_of_agendas") || "Number of Agendas",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " agendas",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: this.$t("committee.agendas") || "Agendas",
            data: topCommitteesByAgendas.map(([, count]) => count),
            color: colorSchema.goldenOlive.avatar,
          },
        ],
      };

      // 3. Topics by Committee (Bar Chart)
      const topCommitteesByTopics = Object.entries(topicsByCommittee)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      this.topicsByCommitteeChart = {
        chart: {
          type: "column",
          height: 400,
        },
        title: { text: null },
        xAxis: {
          categories: topCommitteesByTopics.map(([id]) => committeeMap[id]),
          title: { text: null },
          labels: { style: { fontSize: "12px" } },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("committee.number_of_topics") || "Number of Topics",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          valueSuffix: " topics",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "12px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: { enabled: false },
        series: [
          {
            name: this.$t("committee.topics") || "Topics",
            data: topCommitteesByTopics.map(([, count]) => count),
            color: colorSchema.forestDeep.avatar,
          },
        ],
      };

      // 4. Meeting Status Distribution (Donut Chart)
      this.meetingStatusChart = {
        chart: {
          type: "pie",
          height: 400,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        title: { text: null },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "50%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: false,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
        },
        series: [
          {
            name: "Meetings",
            colorByPoint: true,
            data: [
              {
                name: this.$t("committee.upcoming") || "Upcoming",
                y: meetingStatusCounts.upcoming || 0,
                color: colorSchema.goldenOlive.avatar,
              },
              {
                name: this.$t("committee.ongoing") || "Ongoing",
                y: meetingStatusCounts.ongoing || 0,
                color: colorSchema.steelGrey.avatar,
              },
              {
                name: this.$t("committee.completed") || "Completed",
                y: meetingStatusCounts.completed || 0,
                color: colorSchema.forestDeep.avatar,
              },
              {
                name: this.$t("committee.cancelled") || "Cancelled",
                y: meetingStatusCounts.cancelled || 0,
                color: colorSchema.crimsonEarth.avatar,
              },
            ],
          },
        ],
      };

      // 5. Agenda Status Distribution (Donut Chart)
      this.agendaStatusChart = {
        chart: {
          type: "pie",
          height: 350,
          options3d: {
            enabled: true,
            alpha: 45,
          },
        },
        title: { text: null },
        tooltip: {
          pointFormat:
            "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)",
          style: { fontSize: "14px" },
        },
        plotOptions: {
          pie: {
            innerSize: "50%",
            depth: 45,
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: {
              enabled: true,
              format: "<b>{point.name}</b>: {point.percentage:.1f}%",
              style: {
                fontSize: "13px",
                fontWeight: "bold",
                textOutline: "none",
              },
            },
            showInLegend: true,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          layout: "horizontal",
        },
        series: [
          {
            name: "Agendas",
            colorByPoint: true,
            data: [
              {
                name: this.$t("committee.draft") || "Draft",
                y: agendaStatusCounts.draft || 0,
                color: colorSchema.steelGrey.avatar,
              },
              {
                name: this.$t("committee.in_review") || "In Review",
                y: agendaStatusCounts.in_review || 0,
                color: colorSchema.goldenOlive.avatar,
              },
              {
                name: this.$t("committee.confirmed") || "Confirmed",
                y: agendaStatusCounts.confirmed || 0,
                color: colorSchema.forestDeep.avatar,
              },
              {
                name: this.$t("committee.rejected") || "Rejected",
                y: agendaStatusCounts.rejected || 0,
                color: colorSchema.crimsonEarth.avatar,
              },
              {
                name: this.$t("committee.deferred") || "Deferred",
                y: agendaStatusCounts.deferred || 0,
                color: colorSchema.steelGrey.text,
              },
            ],
          },
        ],
      };

      // 5. Activity Overview (Grouped Column Chart)
      const topCommitteesForOverview = Object.keys(meetingsByCommittee)
        .sort(
          (a, b) =>
            (meetingsByCommittee[b] || 0) - (meetingsByCommittee[a] || 0)
        )
        .slice(0, 8);

      this.activityOverviewChart = {
        chart: {
          type: "column",
          height: 400,
        },
        title: { text: null },
        xAxis: {
          categories: topCommitteesForOverview.map((id) => committeeMap[id]),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("committee.count") || "Count",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
        },
        tooltip: {
          shared: true,
          style: { fontSize: "14px" },
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: { fontSize: "11px", fontWeight: "bold" },
            },
            borderRadius: 5,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "top",
          layout: "horizontal",
        },
        series: [
          {
            name: this.$t("committee.meetings") || "Meetings",
            data: topCommitteesForOverview.map(
              (id) => meetingsByCommittee[id] || 0
            ),
            color: colorSchema.crimsonEarth.avatar,
          },
          {
            name: this.$t("committee.agendas") || "Agendas",
            data: topCommitteesForOverview.map(
              (id) => agendasByCommittee[id] || 0
            ),
            color: colorSchema.goldenOlive.avatar,
          },
          {
            name: this.$t("committee.topics") || "Topics",
            data: topCommitteesForOverview.map(
              (id) => topicsByCommittee[id] || 0
            ),
            color: colorSchema.forestDeep.avatar,
          },
        ],
      };

      // 6. Status Breakdown by Committee (Stacked Column Chart)
      const topCommitteesForStatus = Object.keys(meetingsByCommittee)
        .sort(
          (a, b) =>
            (meetingsByCommittee[b] || 0) - (meetingsByCommittee[a] || 0)
        )
        .slice(0, 6);

      // Calculate meeting statuses per committee
      const meetingStatusByCommittee = {
        upcoming: {},
        ongoing: {},
        completed: {},
        cancelled: {},
      };

      allMeetings.forEach((meeting) => {
        const committeeId = meeting.committee_id;
        if (
          committeeId &&
          topCommitteesForStatus.includes(committeeId) &&
          meeting.status
        ) {
          if (meetingStatusByCommittee[meeting.status]) {
            meetingStatusByCommittee[meeting.status][committeeId] =
              (meetingStatusByCommittee[meeting.status][committeeId] || 0) + 1;
          }
        }
      });

      // Calculate agenda statuses per committee
      const agendaStatusByCommittee = {
        draft: {},
        in_review: {},
        confirmed: {},
        rejected: {},
        deferred: {},
      };

      allAgendas.forEach((agenda) => {
        const committeeId = agenda.committee_id;
        if (
          committeeId &&
          topCommitteesForStatus.includes(committeeId) &&
          agenda.status
        ) {
          if (agendaStatusByCommittee[agenda.status]) {
            agendaStatusByCommittee[agenda.status][committeeId] =
              (agendaStatusByCommittee[agenda.status][committeeId] || 0) + 1;
          }
        }
      });

      this.statusBreakdownChart = {
        chart: {
          type: "column",
          height: 450,
        },
        title: { text: null },
        xAxis: {
          categories: topCommitteesForStatus.map((id) => committeeMap[id]),
          labels: {
            style: { fontSize: "11px" },
            rotation: -45,
          },
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t("committee.total_count") || "Total Count",
            style: { fontSize: "14px", fontWeight: "bold" },
          },
          stackLabels: {
            enabled: true,
            style: {
              fontWeight: "bold",
              fontSize: "12px",
            },
          },
        },
        tooltip: {
          shared: true,
          style: { fontSize: "14px" },
          headerFormat: "<b>{point.x}</b><br/>",
          pointFormat: "{series.name}: {point.y}<br/>",
        },
        plotOptions: {
          column: {
            stacking: "normal",
            dataLabels: {
              enabled: false,
            },
            borderRadius: 3,
          },
        },
        legend: {
          align: "center",
          verticalAlign: "top",
          layout: "horizontal",
          itemStyle: { fontSize: "11px" },
        },
        series: [
          // Meeting statuses
          {
            name: this.$t("committee.upcoming") || "Meetings: Upcoming",
            data: topCommitteesForStatus.map(
              (id) => meetingStatusByCommittee.upcoming[id] || 0
            ),
            color: colorSchema.goldenOlive.avatar,
            stack: "meetings",
          },
          {
            name: this.$t("committee.ongoing") || "Meetings: Ongoing",
            data: topCommitteesForStatus.map(
              (id) => meetingStatusByCommittee.ongoing[id] || 0
            ),
            color: colorSchema.steelGrey.avatar,
            stack: "meetings",
          },
          {
            name: this.$t("committee.completed") || "Meetings: Completed",
            data: topCommitteesForStatus.map(
              (id) => meetingStatusByCommittee.completed[id] || 0
            ),
            color: colorSchema.forestDeep.avatar,
            stack: "meetings",
          },
          {
            name: this.$t("committee.cancelled") || "Meetings: Cancelled",
            data: topCommitteesForStatus.map(
              (id) => meetingStatusByCommittee.cancelled[id] || 0
            ),
            color: colorSchema.crimsonEarth.avatar,
            stack: "meetings",
          },
          // Agenda statuses
          {
            name: this.$t("committee.draft") || "Agendas: Draft",
            data: topCommitteesForStatus.map(
              (id) => agendaStatusByCommittee.draft[id] || 0
            ),
            color: colorSchema.steelGrey.text,
            stack: "agendas",
          },
          {
            name: this.$t("committee.in_review") || "Agendas: In Review",
            data: topCommitteesForStatus.map(
              (id) => agendaStatusByCommittee.in_review[id] || 0
            ),
            color: colorSchema.goldenOlive.text,
            stack: "agendas",
          },
          {
            name: this.$t("committee.confirmed") || "Agendas: Confirmed",
            data: topCommitteesForStatus.map(
              (id) => agendaStatusByCommittee.confirmed[id] || 0
            ),
            color: colorSchema.forestDeep.text,
            stack: "agendas",
          },
          {
            name: this.$t("committee.rejected") || "Agendas: Rejected",
            data: topCommitteesForStatus.map(
              (id) => agendaStatusByCommittee.rejected[id] || 0
            ),
            color: colorSchema.crimsonEarth.text,
            stack: "agendas",
          },
          {
            name: this.$t("committee.deferred") || "Agendas: Deferred",
            data: topCommitteesForStatus.map(
              (id) => agendaStatusByCommittee.deferred[id] || 0
            ),
            color: colorSchema.steelGrey.background,
            stack: "agendas",
          },
        ],
      };
    },
  },

  watch: {
    newItem: {
      handler() {
        this.updateFormFieldOptions();
      },
      deep: true,
    },
    filters: {
      deep: true,
      handler(newFilter) {
        const filtersObject = [];
        if (newFilter.type) {
          filtersObject.push(`type|${newFilter.type}|=`);
        }
        this.apiParams.filter = filtersObject.join("&&");
        this.$refs.table.refreshTable();
      },
    },
  },
};
</script>

<style scoped>
/* Statistics Styles */
.statistics-content {
  padding: 1rem 0;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.metric-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
  opacity: 0.8;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
}

.metric-label {
  font-size: 0.9rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.8;
  font-weight: 500;
}

.bg-primary-subtle {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
}

.bg-success-subtle {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

.bg-warning-subtle {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  color: #f57c00;
}

.bg-info-subtle {
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  color: #00838f;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.chart-container-equal-height {
  min-height: 400px;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #6e3894;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #d0b5e3;
}

/* Committee Name Badge - Purple */
.badge-purple {
  background: #d0b5e3;
  color: #6e3894;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

/* Type Badges */
.badge-green {
  background-color: #b6caae;
  color: #255f0b;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-red {
  background-color: #e2b6b6;
  color: #a92525;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

/* User Badge for Chairperson */
.badge-user {
  background-color: #d0b5e3;
  color: #43235c;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

/* User Info Display - Added from internal message */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Avatar Badge */
.avatar-group {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  height: 32px;
  width: 107px; /* Increased to 107px for 25px spacing */
}

.avatar-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6e3894;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid white;
  flex-shrink: 0;
  position: absolute;
  transition: transform 0.2s ease;
}

.avatar-badge-more {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid white;
  flex-shrink: 0;
  white-space: nowrap;
  transition: all 0.2s ease;
  position: absolute;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 4;
}
[dir="rtl"] .rtl-text-end {
  text-align: end;
}
[dir="rtl"] .rtl {
  flex-direction: row-reverse;
}
[dir="rtl"] .metric-icon {
  margin-left: 1.5rem;
  margin-right: 0;
}

.action-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

.action-list-item {
  padding: 4px 15px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  border-radius: 0 !important;
  margin: 5px !important;
}

.action-list-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
}

.action-list-item .action-icon {
  color: #6e3894 !important;
  margin-right: 12px !important;
}
</style>
