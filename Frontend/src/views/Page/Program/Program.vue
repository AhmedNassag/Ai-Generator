<template>
  <div id="program-view" class="container-fluid">
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('program.program')"
      :subPage="$t('program.program')"
      :titlePage="$t('program.program')"
      v-permission:show
    >

      <div v-permission:update v-permission:delete></div>

      <template #datatable>
        <div class="programs-container">
          <div class="col-md-9 mb-9"></div>
          <div class="col-md-3 mb-3">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openForm"
              class="add-btn"
              :disabled="isLoading"
            >
              {{ $t("program.addnewprogram") }}
            </v-btn>
          </div>

          <!-- Loading Spinner for Programs -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner-wrapper">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <div class="loading-text">{{ $t("program.Loading") }}...</div>
            </div>
          </div>

          <!-- No Data State -->
          <div
            v-else-if="!isLoading && programs.length === 0"
            class="no-data-container"
          >
            <div class="no-data-wrapper">
              <v-icon
                icon="mdi-folder-open-outline"
                size="64"
                class="no-data-icon"
              ></v-icon>
              <h4 class="no-data-title">{{ $t("program.nodata") }}</h4>
              <p class="no-data-text">
                {{ $t("program.Create_your_first_program_to_get_started") }}
              </p>
              <!-- <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openForm"
                class="add-btn"
              >
                Add New Program
              </v-btn> -->
            </div>
          </div>

          <!-- Programs Grid -->
          <div
            v-else
            class="col-md-4 mb-4"
            v-for="item in programs"
            :key="item.id"
          >
            <div
              class="card program-card"
              :class="{ 'loading-card': programsUpdating }"
            >
              <!-- Card Loading Overlay -->
              <div v-if="programsUpdating" class="card-loading-overlay">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                ></v-progress-circular>
              </div>

              <div class="card-body">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h5 class="card-title mb-0 text-truncate">
                    <router-link
                      :to="{ path: `/program-details/${item.id}` }"
                      style="cursor: pointer; color: #232388"
                    >
                      {{ item.name }}
                    </router-link>
                  </h5>
                  <div class="action-buttons">
                    <div class="dropdown table-actions">
                      <a
                        class="dropdown-toggle"
                        id="actionsDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i class="fa fa-ellipsis-v"></i>
                      </a>
                      <ul
                        class="dropdown-menu"
                        aria-labelledby="actionsDropdown"
                      >
                        <li>
                          <a
                            href="javascript:void(0)"
                            class="edit_button dropdown-item"
                          >
                            <router-link
                              :to="{ path: `/program-details/${item.id}` }"
                            >
                              <i class="icofont icofont-eye"></i
                              >{{ $t("program.show") }}
                            </router-link>
                          </a>
                          <a
                            href="javascript:void(0)"
                            class="edit_button dropdown-item"
                            @click.stop="editItem(item)"
                            v-permission:update
                          >
                            <i class="icofont icofont-fountain-pen"></i> {{ $t("program.edit") }}
                          </a>
                        </li>
                        <li>
                          <a
                            href="javascript:void(0)"
                            class="delete_button dropdown-item"
                            @click.stop="deleteProgram(item)"
                            v-permission:destroy
                          >
                            <i class="icofont icofont-trash text-danger"></i>
                            {{ $t("program.delete") }}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="progress-section mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="progress-label">{{ $t("program.Percentage") }}</span>
                    <span class="progress-percentage"
                      >{{ programProgress(item) }}%</span
                    >
                  </div>
                  <div class="progress" style="height: 8px">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      :style="{
                        width: programProgress(item) + '%',
                        'background-color': getProgressColor(
                          programProgress(item)
                        ),
                      }"
                      :aria-valuenow="programProgress(item)"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>

                <div class="program-meta">
                  <div class="meta-item">
                    <v-icon icon="mdi-calendar" size="16" class="me-1"></v-icon>
                    <small>{{
                      calculateDuration(item.start_date, item.end_date)
                    }}</small>
                  </div>

                  <div class="meta-item status-badge">
                    <v-chip
                      :color="getStatusColor(item.status)"
                      size="small"
                      class="text-white"
                    >
                      {{ item.status }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #form>
        <!-- Form Loading Overlay -->
        <div v-if="formLoading" class="form-loading-overlay">
          <div class="form-loading-content">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
            ></v-progress-circular>
            <div class="form-loading-text">{{ $t("program.Loading") }}"...</div>
          </div>
        </div>

        <Form
          v-else
          :schema="fromFields"
          :newItem="newItem"
          :api="api"
          :closeForm="closeForm"
          :formData="true"
        >
          <!-- Custom owner type selector -->
          <template #owner_type="item">
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <label for="owner_type" class="form-label">{{
                  $t("program.owner_type")
                }}</label>
                <VueSelect
                  label="owner_type"
                  :rules="[required]"
                  :options="ownerType"
                  v-model="newItem.owner_type"
                  placeholder="Select owner type"
                  :reduce="(item) => item.id"
                  @update:modelValue="selectOwnerType"
                  :loading="ownersLoading"
                />
                <small class="form-text text-muted">{{ $t("program.Select") }}"</small>
              </div>
            </div>
          </template>

          <!-- Dynamic owner selector based on owner_type -->
          <template #owner_id="item">
            <div class="col-sm-12 col-md-6 mb-4">
              <div v-if="newItem?.owner_type == 'user'" class="form-group">
                <label for="owner_id" class="form-label">{{
                  $t("program.owner_id")
                }}</label>
                <VueSelect
                  label="full_name"
                  :options="users || []"
                  v-model="newItem.owner_users_ids"
                  placeholder="Select users"
                  :reduce="(item) => item?.id"
                  multiple
                  @update:modelValue="handleOwnerUsersChange"
                  :loading="ownersLoading"
                />
                <small class="form-text text-muted"
                  >{{ $t("program.Select") }}</small
                >
              </div>
              <div v-if="newItem?.owner_type == 'team'" class="form-group">
                <label for="owner_id" class="form-label">{{
                  $t("program.owner_id")
                }}</label>
                <VueSelect
                  label="name"
                  :options="teams || []"
                  v-model="newItem.owner_team_ids"
                  placeholder="Select team"
                  multiple
                  :reduce="(item) => item?.id"
                  :loading="ownersLoading"
                />
                <small class="form-text text-muted"
                  >{{ $t("program.Select") }}</small
                >
              </div>
            </div>
          </template>
        </Form>
      </template>
    </main-page>

    <v-dialog v-model="ownerDetailsModal.show" max-width="600">
      <v-card>
        <v-card-title>Owner Details</v-card-title>
        <v-card-text>
          <div v-if="ownerDetailsLoading" class="text-center py-4">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
            ></v-progress-circular>
            <div class="mt-2">{{ $t("program.Processing") }}...</div>
          </div>

          <v-list v-else>
            <v-list-item
              @click="!ownerDetailsLoading"
              :class="bg - blue - lighten - 5"
              v-if="
                ownerDetailsModal.currentItem.owner_users_ids &&
                ownerDetailsModal.currentItem.owner_users_ids.length > 0
              "
              v-for="userOwner in ownerDetailsModal.currentItem.owner_users_ids"
              :key="userOwner.id"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-arrow-right"></v-icon>
              </template>
              <v-list-item-title>
                <v-chip size="small" color="primary">{{
                  getNameOfUser(userOwner)
                }}</v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              @click="!ownerDetailsLoading"
              :class="bg - blue - lighten - 5"
              v-if="
                ownerDetailsModal.currentItem.owner_team_ids &&
                ownerDetailsModal.currentItem.owner_team_ids.length > 0
              "
              v-for="teamOwner in ownerDetailsModal.currentItem.owner_team_ids"
              :key="teamOwner.id"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-arrow-right"></v-icon>
              </template>
              <v-list-item-title>
                <v-chip size="small" color="primary">{{
                  getNameOfTeam(teamOwner)
                }}</v-chip>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="ownerDetailsModal.show = false"
            >{{ $t("program.Close") }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// Importing necessary components and API modules
import program from "@/API/Program/Program";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import StrategicPlan from "@/API/StrategicPlan/StrategicPlan";
import Objective from "@/API/Objective/Objective";
import Initiative from "@/API/Initiative/Initiative";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    VueSelect,
  },
  setup(props) {
    const api = new program();
    const userApi = new User();
    const teamApi = new Team();
    const objectiveApi = new Objective();
    const strategicPlanApi = new StrategicPlan();
    const initiativeApi = new Initiative();
    const relations = ["projects", "initiative", "initiative.objectives"];

    const apiParams = {
      with: relations,
    };

    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      teamApi,
      strategicPlanApi,
      objectiveApi,
      initiativeApi,
    };
  },

  async mounted() {
    await this.initializeComponent();
  },

  watch: {
    "newItem.owner_users_ids": {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          const cleaned = newVal.filter(
            (item) => item !== null && item !== undefined
          );
          if (cleaned.length !== newVal.length) {
            this.$nextTick(() => {
              if (this.newItem) {
                this.newItem.owner_users_ids = cleaned;
              }
            });
          }
        }
      },
      deep: true,
    },
    "newItem.owner_team_ids": {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          const cleaned = newVal.filter(
            (item) => item !== null && item !== undefined
          );
          if (cleaned.length !== newVal.length) {
            this.$nextTick(() => {
              if (this.newItem) {
                this.newItem.owner_team_ids = cleaned;
              }
            });
          }
        }
      },
      deep: true,
    },
  },

  data() {
    return {
      programs: [],
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      ownerType: [
        { id: "user", owner_type: "User" },
        { id: "team", owner_type: "Team" },
      ],
      users: [],
      stakeholderUsers: [],
      teams: [],
      strategicPlans: [],
      objectives: [],
      initiatives: [],
      ownerDetailsModal: {
        show: false,
        currentItem: null,
      },
      currentOwner: [],
      ownerModal: {
        show: false,
      },
      // Loading states
      isLoading: true,
      formLoading: false,
      ownersLoading: false,
      ownerDetailsLoading: false,
      programsUpdating: false,
      currentInitiative: null,
    };
  },

  created() {
    this.apiParams.filter = "initiative_id|" + this.$route.params.id;
    this.setupFormFields();
  },

  methods: {
    async initializeComponent() {
      try {
        this.isLoading = true;

        // Load all required data in parallel
        await Promise.all([
          this.loadInitiatives(),
          this.loadUsers(),
          this.fetchPrograms(),
        ]);

        this.setupStakeholders();

        this.currentInitiative = this.initiatives.find(
          (initiative) => initiative.id === this.$route.params.id
        );

        this.users = await this.userApi.getAll({
          select: "id|full_name|email|phone",
        });
        this.teams = await this.teamApi.getAll({ select: "id|name" });
      } catch (error) {
        this.$toast.error("Failed to load data. Please try again.");
      } finally {
        this.isLoading = false;
      }
    },

    async loadUsers() {
      try {
        this.ownersLoading = true;
        this.stakeholderUsers = await this.userApi.getAll({
          select: "id|full_name",
        });
      } catch (error) {
        this.stakeholderUsers = [];
        this.users = [];
      } finally {
        this.ownersLoading = false;
      }
    },

    async deleteProgram(item) {
      const response = await this.api.delete(item?.id);
      if (response && response?.status === "success") {
        await this.initializeComponent();
      }
    },
    async loadInitiatives() {
      try {
        this.initiatives = await this.initiativeApi.getAll({
          select: "id|name|ownerType|owner_user_ids|owner_team_ids",
          with: ["objectives"],
        });
      } catch (error) {
        this.initiatives = [];
      }
    },

    setupStakeholders() {
      const stakeholders = this.fromFields.find(
        (field) => field.name === "stakeholder_ids"
      );
      if (stakeholders) {
        stakeholders.options = this.stakeholderUsers.map((user) => ({
          id: user.id,
          name: user.full_name,
        }));
      }
    },
    async fetchPrograms() {
      try {
        this.programsUpdating = true;
        const response = await this.api.getAll(this.apiParams);
        this.programs = response || [];
      } catch (error) {
        this.programs = [];
        this.$toast.error("Failed to fetch programs. Please try again.");
      } finally {
        this.programsUpdating = false;
      }
    },

    async refreshPrograms() {
      await this.fetchPrograms();
    },

    programProgress(program) {
      if (!program?.projects) return 0;
      const totalProjects = program?.projects?.length;
      const completedProjects = program?.projects?.filter(
        (project) => project.status === "Completed"
      ).length;

      return totalProjects > 0
        ? Math.round((completedProjects / totalProjects) * 100)
        : 0;
    },

    handleOwnerUsersChange(value) {
      if (!this.newItem) return;

      if (Array.isArray(value)) {
        this.newItem.owner_users_ids = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (value === null || value === undefined) {
        this.newItem.owner_users_ids = [];
      } else {
        this.newItem.owner_users_ids = [value];
      }
    },
    handleOwnerTeamsChange(value) {
      if (!this.newItem) return;
      if (Array.isArray(value)) {
        this.newItem.owner_team_ids = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (value === null || value === undefined) {
        this.newItem.owner_team_ids = [];
      } else {
        this.newItem.owner_team_ids = [value];
      }
    },
    selectOwnerType(value) {
      if (!this.newItem) return;

      this.newItem.owner_users_ids = [];
      this.newItem.owner_team_id = null;
    },

    openOwnerDetailsModal(item) {
      this.ownerDetailsModal.currentItem = item;
      this.ownerDetailsLoading = false;
      this.ownerDetailsModal.show = true;
    },

    openOwnerModal() {
      this.ownerModal.show = true;
    },

    calculateDuration(start, end) {
      if (!start || !end) return "N/A";
      const startDate = new Date(start);
      const endDate = new Date(end);
      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();

      if (days < 0) {
        months -= 1;
        days += new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          0
        ).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years > 0) {
        return years === 1 ? "1 year" : `${years} years`;
      } else if (months > 0) {
        return months === 1 ? "1 month" : `${months} months`;
      } else {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
      }
    },

    async openForm() {
      try {
        this.formLoading = true;
        if (this.$route.name === "InitiativeDetails") {
          this.newItem.initiative_id = this.$route.params.id;
        }

        // Simulate form data loading if needed
        await new Promise((resolve) => setTimeout(resolve, 500));

        this.isFlipped = true;
      } catch (error) {
        this.$toast.error("Failed to open form. Please try again.");
      } finally {
        this.formLoading = false;
      }
    },

    closeForm() {
      this.isFlipped = false;
      this.newItem = {};
      this.refreshPrograms(); // Refresh data after form submission
    },

    editItem(data) {
      this.newItem = data;
      this.newItem = data; // Set the current item to edit
      if (data.owner_user_ids && data.owner_user_ids.length > 0) {
        this.newItem.ownerType = "user";
        this.newItem.owner_id = data.owner_user_ids;
      } else if (data.owner_team_ids && data.owner_team_ids.length > 0) {
        this.newItem.ownerType = "team";
        this.newItem.owner_id = data.owner_team_ids;
      }
      this.isFlipped = true;
    },

    getProgressColor(percentage) {
      if (percentage >= 80) return "#4CAF50";
      if (percentage >= 50) return "#FFC107";
      if (percentage >= 30) return "#FF9800";
      return "#F44336";
    },

    getStatusColor(status) {
      switch (status) {
        case "Draft":
          return "grey";
        case "Under Review":
          return "blue";
        case "Approved":
          return "indigo";
        case "In Progress":
          return "orange";
        case "On Hold":
          return "deep-orange";
        case "Completed":
          return "green";
        case "Cancelled":
          return "red";
        default:
          return "gray";
      }
    },

    setupFormFields() {
      this.fromFields = [
        {
          section: this.$t("program.Main Details"),
          name: "name",
          label: this.$t("program.name"),
          type: "text",
          rules: "required",
          description: this.$t("program.Please enter program name"),
          col: 6,
        },
        {
          section: this.$t("program.Main Details"),
          name: "code",
          label: this.$t("program.code"),
          type: "text",
          rules: "required",
          description: this.$t("program.Please enter code"),
          col: 6,
        },

        {
          section: this.$t("program.Main Details"),
          name: "start_date",
          label: this.$t("program.start_date"),
          type: "date",
          rules: "required",
          description: this.$t("program.Please enter start date"),
          col: 6,
        },
        {
          section: this.$t("program.Main Details"),
          name: "end_date",
          label: this.$t("program.end_date"),
          type: "date",
          rules: "required",
          description: this.$t("program.Please enter end date"),
          col: 6,
        },
        {
          section: this.$t("program.Main Details"),
          type: "options",
          name: "stakeholder_ids",
          label: this.$t("program.stakeholder_ids"),
          options: this.stakeholderUsers,
          optionLabel: "name",
          multiple: true,
          col: 6,
          rules: "required",
          description: this.$t("program.Select"),
        },
        {
          section: this.$t("program.Main Details"),
          name: "owner_type",
        },
        {
          section: this.$t("program.Main Details"),
          name: "owner_id",
          col: 6,
        },
        {
          section: this.$t("program.Main Details"),
          name: "description",
          label: this.$t("program.description"),
          type: "textarea",
          rules: "optional",
          description: this.$t("program.Provide a description"),
          col: 12,
        },
      ];
    },
  },
};
</script>

<style>
#program-view .page-title {
  display: none;
}

#program-view .flipper {
  min-height: 1000px !important;
}
</style>

<style scoped>
.programs-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0.5rem;
}

.col-md-4 {
  padding: 0.5rem;
}

.card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
}

.program-card {
  background: white;
  cursor: pointer;
}

.program-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.loading-card {
  opacity: 0.7;
}

.card-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
}

.loading-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.loading-spinner-wrapper {
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 500;
}

.no-data-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.no-data-wrapper {
  text-align: center;
  max-width: 400px;
}

.no-data-icon {
  color: #6c757d;
  margin-bottom: 1rem;
}

.no-data-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.no-data-text {
  color: #6c757d;
  margin-bottom: 2rem;
}

.form-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
}

.form-loading-content {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-loading-text {
  margin-top: 1rem;
  font-size: 1rem;
  color: #6c757d;
}

.add-new-card {
  background: rgba(25, 118, 210, 0.08);
  border: 1px dashed #1976d2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.add-new-card:hover {
  background: rgba(25, 118, 210, 0.15);
  transform: scale(1.02);
}

.card-title {
  font-weight: 600;
  color: #2c3e50;
  max-width: 70%;
}

.action-buttons {
  opacity: 0.25;
  transition: opacity 0.2s;
}

.program-card:hover .action-buttons {
  opacity: 1;
}

.progress-section {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.progress-label {
  font-size: 0.8rem;
  color: #6c757d;
}

.progress-percentage {
  font-weight: 600;
  color: #2c3e50;
}

.program-meta {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
  justify-content: space-between;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
}

.add-btn {
  background-color: #44225c !important;
  border-color: #44225c !important;
  color: white !important;
}

@media (max-width: 768px) {
  .col-md-4 {
    width: 100%;
  }

  .action-buttons {
    opacity: 1;
  }
}
</style>
