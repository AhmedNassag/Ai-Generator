<template>
  <div id="objective-initiative-matrix-view" class="container-fluid">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">{{ $t("strategicplan.Loading") }}...</p>
    </div>
    <div
      v-else
      id="objective-initiative-matrix-view"
      class="objective-initiative-matrix-container"
    >
      <main-page
        ref="page"
        :isFlipped="isFlipped"
        :mainPage="$t('strategicplan.objectiveinitiativematrix')"
        :subPage="$t('strategicplan.objectiveinitiativematrix')"
        :titlePage="$t('strategicplan.objectiveinitiativematrix')"
      >
        <template #datatable>
          <div class="table-container">
            <div class="table-wrapper">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th class="objective-header" style="padding: 0">
                      <div
                        class=""
                        :class="initiatives.length > 0 ? 'header-split' : ''"
                      >
                        <div class="header-section objectives-section">
                          <button
                            @click="showAddObjectiveForm"
                            class="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style="width: 24px; height: 24px"
                          >
                            <i class="fa fa-plus" style="font-size: 14px"></i>
                          </button>
                          <span class="header-label"> {{ $t("strategicplan.objectives") }}</span>
                        </div>
                        <div class="header-section initiatives-section">
                          <button
                            @click="showAddInitiativeForm"
                            :disabled="objectives.length === 0"
                            class="btn btn-success rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style="width: 24px; height: 24px"
                          >
                            <i class="fa fa-plus" style="font-size: 14px"></i>
                          </button>
                          <span class="header-label"> {{ $t("strategicplan.initiatives") }}</span>
                        </div>
                      </div>
                    </th>
                    <th
                      v-for="initiative in initiatives"
                      :key="initiative.id"
                      class="initiative-header"
                    >
                      <div class="header-content">
                        <div class="title-wrapper">
                          <h3>
                            <router-link
                              :to="{
                                path: `/initiative-details/${initiative.id}`,
                              }"
                              style="cursor: pointer; color: #232388"
                            >
                              {{ initiative.name }}
                            </router-link>
                          </h3>
                        </div>

                        <div style="display: block">
                          <div class="dropdown table-actions">
                            <a
                              class="dropdown-toggle"
                              id="actionsDropdown"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i class="fa fa-ellipsis-h"></i>
                            </a>
                            <ul
                              class="dropdown-menu"
                              aria-labelledby="actionsDropdown"
                            >
                              <li>
                                <slot name="edit" :item="initiative">
                                  <a
                                    href="javascript:void(0)"
                                    class="edit_button dropdown-item"
                                    @click="editInitiative(initiative)"
                                    v-permission:update
                                  >
                                    <i class="icofont icofont-fountain-pen"></i>
                                    {{ $t("strategicplan.Edit") }}
                                  </a>
                                </slot>
                              </li>
                              <li>
                                <slot name="delete" :item="initiative">
                                  <a
                                    v-permission:destroy
                                    href="javascript:void(0)"
                                    @click="deleteInitiative(initiative)"
                                    v-if="
                                      !hideActionsColumn &&
                                      !hideActions(row).delete
                                    "
                                    class="delete_button dropdown-item"
                                  >
                                    <i
                                      class="icofont icofont-trash text-danger"
                                    ></i>
                                    {{ $t("strategicplan.Delete") }}
                                  </a>
                                </slot>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="objective in objectives"
                    :key="objective.id"
                    class="objective-row"
                  >
                    <td class="objective-cell">
                      <div class="objective-content">
                        <h3>
                          <router-link
                            :to="{
                              path: `/objective-details/${objective.id}`,
                            }"
                            style="cursor: pointer; color: #232388"
                          >
                            {{ objective.name }}
                          </router-link>
                        </h3>
                        <div style="display: block">
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
                                <slot name="edit" :item="objective">
                                  <a
                                    href="javascript:void(0)"
                                    class="edit_button dropdown-item"
                                    @click="editObjective(objective)"
                                    v-permission:update
                                  >
                                    <i class="icofont icofont-fountain-pen"></i>
                                    {{ $t("strategicplan.Edit") }}
                                  </a>
                                </slot>
                              </li>
                              <li>
                                <slot name="delete" :item="objective">
                                  <a
                                    v-permission:destroy
                                    href="javascript:void(0)"
                                    @click="deleteObjective(objective)"
                                    v-if="
                                      !hideActionsColumn &&
                                      !hideActions(objective).delete
                                    "
                                    class="delete_button dropdown-item"
                                  >
                                    <i
                                      class="icofont icofont-trash text-danger"
                                    ></i>
                                    {{ $t("strategicplan.Delete") }}
                                  </a>
                                </slot>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      v-for="initiative in initiatives"
                      :key="initiative.id"
                      class="toggle-cell"
                    >
                      <button
                        @click="toggleRelationship(objective.id, initiative.id)"
                        :class="[
                          'toggle-btn',
                          {
                            active: isLinked(objective.id, initiative.id),
                            loading: isToggling(
                              `${objective.id}-${initiative.id}`
                            ),
                          },
                        ]"
                        :disabled="
                          isToggling(`${objective.id}-${initiative.id}`)
                        "
                      >
                        <span
                          v-if="isToggling(`${objective.id}-${initiative.id}`)"
                          class="spinner"
                        ></span>
                        <span
                          v-else-if="isLinked(objective.id, initiative.id)"
                          class="checkmark"
                          >✓</span
                        >
                        <span v-else class="plus" style="font-size: 22px"
                          >-</span
                        >
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
        <template #form>
          <ObjectiveForm
            v-if="
              showAddObjective &&
              !showAddInitiative &&
              !isUpdateObjective &&
              !isUpdateInitiative
            "
            :newItem="newItem"
            :closeForm="closeForm"
          ></ObjectiveForm>
          <ObjectiveForm
            v-if="
              isUpdateObjective &&
              !isUpdateInitiative &&
              !showAddObjective &&
              !showAddInitiative
            "
            :newItem="newItem"
            :closeForm="closeForm"
          ></ObjectiveForm>
          <InitiativeForm
            v-if="
              showAddInitiative &&
              !isUpdateObjective &&
              !isUpdateInitiative &&
              !showAddObjective
            "
            :newItem="newItem"
            :closeForm="closeForm"
          >
          </InitiativeForm>
          <InitiativeForm
            v-if="
              isUpdateInitiative &&
              !isUpdateObjective &&
              !showAddObjective &&
              !showAddInitiative
            "
            :newItem="newItem"
            :closeForm="closeForm"
            :editItem="editInitiative"
          >
          </InitiativeForm>
        </template>
      </main-page>
    </div>
  </div>
</template>

<script>
import ObjectiveForm from "@/views/Page/Objective/Components/ObjectiveForm.vue";
import InitiativeForm from "@/views/Page/Initiative/Components/InitiativeForm.vue";
import MainPage from "@/components/MainPage.vue";
import Objective from "@/API/Objective/Objective";
import Initiative from "@/API/Initiative/Initiative";
import Swal from "sweetalert2";

export default {
  name: "ObjectiveInitiativeMatrix",
  components: {
    ObjectiveForm,
    MainPage,
    InitiativeForm,
  },
  props: {
    hideActions: {
      type: Function,
      default: () => (row) => ({
        edit: false,
        delete: false,
      }),
    },
    hideActionsColumn: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const objectiveApi = new Objective();
    const initiativeApi = new Initiative();

    return {
      objectiveApi,
      initiativeApi,
    };
  },
  data() {
    return {
      loading: true,
      loadingStates: {
        objectives: true,
        initiatives: true,
      },
      newItem: {},
      isUpdateObjective: false,
      isUpdateInitiative: false,
      isFlipped: false,
      objectives: [],
      initiatives: [],
      activeDropdown: null,
      toggleLoading: new Set(),
      showAddObjective: false,
      showAddInitiative: false,
    };
  },
  watch: {
    isFlipped: {
      handler(newVal, oldVal) {
        // Trigger refresh when isFlipped changes from true to false
        if (oldVal === true && newVal === false) {
          this.refreshComponent();
        }
      },
      immediate: false,
    },
  },
  async created() {
    await this.loadData();
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener("click", this.closeDropdowns);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeDropdowns);
  },
  methods: {
    async loadData() {
      try {
        this.loading = true;
        this.loadingStates.objectives = true;
        this.loadingStates.initiatives = true;

        // Load both objectives and initiatives concurrently
        const [objectivesResponse, initiativesResponse] = await Promise.all([
          this.objectiveApi.getAll({
            filter: "strategicPlan_id|" + this.$route.params.id,
            with: "initiatives",
            sort: `created_at|asc`,
          }),
          this.initiativeApi.getAll({
            filterWhereRelation: [
              `objectives@strategicPlan_id|${this.$route.params.id}|=`,
            ],
            with: ["objectives"],
            sort: `created_at|asc`,
          }),
        ]);

        // Update data atomically after both requests complete
        this.objectives = objectivesResponse || [];
        this.initiatives = initiativesResponse || [];

        // Mark loading states as complete
        this.loadingStates.objectives = false;
        this.loadingStates.initiatives = false;

        // Add a small delay for better UX (prevents flash)
        setTimeout(() => {
          this.loading = false;
        }, 300);
      } catch (error) {
        console.error("Error loading data:", error);

        // Even on error, ensure we show some state
        this.objectives = [];
        this.initiatives = [];
        this.loadingStates.objectives = false;
        this.loadingStates.initiatives = false;
        this.loading = false;
      }
    },

    async refreshComponent() {
      try {
        console.log("Refreshing component data...");
        await this.loadData();

        // Reset any temporary states
        this.newItem = {};
        this.activeDropdown = null;
        this.toggleLoading.clear();

        console.log("Component refreshed after form close");
      } catch (error) {
        console.error("Error refreshing component:", error);
      }
    },

    // Remove the old loading methods since we're handling it differently now
    // checkAndCompleteLoading() - REMOVED
    // completeLoading() - REMOVED

    async closeForm() {
      try {
        this.isFlipped = false;
        this.isUpdateObjective = false;
        this.isUpdateInitiative = false;
        this.showAddObjective = false;
        this.showAddInitiative = false;
      } catch (error) {
        console.error("Error during form close and tree refresh:", error);
      } finally {
        this.isFlipped = false;
      }
    },

    isLinked(objectiveId, initiativeId) {
      const objective = this.objectives?.find((obj) => obj?.id === objectiveId);
      return objective && objective?.initiative_ids?.includes(initiativeId);
    },

    isToggling(key) {
      return this.toggleLoading.has(key);
    },

    async toggleRelationship(objectiveId, initiativeId) {
      const key = `${objectiveId}-${initiativeId}`;
      this.toggleLoading.add(key);
      const objective = this.objectives.find((obj) => obj.id === objectiveId);
      const initiative = this.initiatives.find(
        (init) => init.id === initiativeId
      );

      // Clean and filter valid objective_ids (remove null/undefined values)
      const validObjectiveIds = (initiative?.objective_ids || []).filter(
        (obj_id) => obj_id != null && obj_id !== undefined && obj_id !== ""
      );

      if (
        this.isLinked(objectiveId, initiativeId) &&
        validObjectiveIds.length === 1
      ) {
        this.initiativeApi.poup(
          {
            status: false,
            message: this.$t("strategicplan.You cannot remove the last relationship"),
          },
          "Warning"
        );
      } else if (this.isLinked(objectiveId, initiativeId)) {
        const result = await Swal.fire({
          title: this.$t("strategicplan.Are you sure to remove a Relationship?"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: this.$t("strategicplan.Yes!"),
          cancelButtonText: this.$t("strategicplan.No, cancel!"),
        });
        if (result.isConfirmed) {
          // Remove relationship and clean arrays
          objective.initiative_ids = (objective.initiative_ids || []).filter(
            (id) =>
              id !== initiativeId && id != null && id !== undefined && id !== ""
          );

          initiative.objective_ids = (initiative.objective_ids || []).filter(
            (id) =>
              id !== objectiveId && id != null && id !== undefined && id !== ""
          );

          const response = await this.initiativeApi
            .update(initiative)
            .then((response) => {
              // Success message
              this.initiativeApi.poup(
                response,
                this.$t("strategicplan.Relationship removed successfully")
              );
            })
            .catch((error) => {
              console.error("There was an error:", error);
              Swal.fire(
                "Error",
                this.$t("strategicplan.there was an error removing the relationship"),
                "error"
              ); // Error message
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // If user cancels, show a message
          // Swal.fire("Cancelled", "The operation was cancelled", "info");
        }
      } else {
        const result = await Swal.fire({
          title: this.$t("strategicplan.Are you sure to add a Relationship?"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: this.$t("strategicplan.Yes!"),
          cancelButtonText: this.$t("strategicplan.No, cancel!"),
        });
        if (result.isConfirmed) {
          if (
            initiative?.startDate > objective?.end_date ||
            initiative?.startDate < objective?.start_date ||
            initiative?.endDate > objective?.end_date ||
            initiative?.endDate < objective?.start_date
          ) {
            this.initiativeApi.poup(
              {
                status: false,
                message:
                  this.$t("strategicplan.The date range of the Initiative does not match the date range of the Objective"),
              },
              "Warning"
            );
          } else {
            //Add relationship
            if (!Array.isArray(objective.initiative_ids)) {
              objective.initiative_ids = [];
            }
            if (!objective.initiative_ids.includes(initiativeId)) {
              objective.initiative_ids.push(initiativeId);
            }

            if (!Array.isArray(initiative.objective_ids)) {
              initiative.objective_ids = [];
            }
            if (!initiative.objective_ids.includes(objectiveId)) {
              initiative.objective_ids.push(objectiveId);
            }

            const response = await this.initiativeApi
              .update(initiative)
              .then((response) => {
                this.initiativeApi.poup(response);
              })
              .catch((error) => {
                this.initiativeApi.poup(
                  {
                    status: false,
                    message: this.$t("strategicplan.There was an error add relationship"),
                  },
                  "Error"
                );
              });
          }
        }
      }

      this.toggleLoading.delete(key);
      this.$emit("relationship-changed", {
        objectiveId,
        initiativeId,
        linked: this.isLinked(objectiveId, initiativeId),
      });
    },
    toggleDropdown(id) {
      this.activeDropdown = this.activeDropdown === id ? null : id;
    },

    closeDropdowns() {
      this.activeDropdown = null;
    },

    showAddObjectiveForm() {
      this.newItem.strategicPlan_id = this.$route.params.id;
      this.isFlipped = true;
      this.showAddObjective = true;
      this.isUpdateObjective = false;
      this.isUpdateInitiative = false;
      this.showAddInitiative = false;
    },
    showAddInitiativeForm() {
      // this.newItem = {};
      this.isFlipped = true;
      this.showAddInitiative = true;
      this.showAddObjective = false;
      this.isUpdateObjective = false;
      this.isUpdateInitiative = false;
    },
    editObjective(objective) {
      this.newItem.strategicPlan_id = this.$route.params.id;
      this.newItem = { ...objective };
      this.isFlipped = true;
      this.isUpdateObjective = true;
    },

    async deleteObjective(objective) {
      const response = await this.objectiveApi.delete(objective?.id);
      if (response && response?.status === "success") {
        await this.refreshComponent();
      }
    },

    editInitiative(initiative) {
      this.newItem = { ...initiative };
      this.isFlipped = true;
      this.isUpdateInitiative = true;
    },

    async deleteInitiative(initiative) {
      const response = await this.initiativeApi.delete(initiative?.id);
      if (response && response?.status === "success") {
        await this.refreshComponent();
      }
    },
  },
};
</script>

<style>
/* Global styles - no scoped attribute */
#objective-initiative-matrix-view .page-title {
  display: none;
}

#objective-initiative-matrix-view .flipper {
  min-height: 700px !important;
}
</style>
<style scoped>
/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
  gap: 20px;
}

.loading-spinner {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #3b82f6 transparent transparent transparent;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}
.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}
.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

.objective-initiative-matrix-container {
  max-width: 1200px;
  margin: 0 auto;
  /* padding: 20px; */
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  background: #ffffff;
  min-height: 80vh;
}
.objective-initiative-matrix {
  max-width: 1400px;
  margin-top: 0 auto;
  /* padding: 2rem; */
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  /* background-color: #ffffff; */
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.header p {
  color: #64748b;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

.table-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-wrapper {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #e2e8f0;
  padding: 1rem;
  text-align: left;
  vertical-align: top;
}

.objective-header {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  font-weight: 500;
  color: #1e293b;
  width: 350px;
  min-width: 350px;
  position: relative;
  padding: 0;
  margin: 0;
  height: 70px;
}

.header-split {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.header-section {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.objectives-section {
  bottom: 10px;
  left: 10px;
  color: #7c3aed;
}

.initiatives-section {
  top: 10px;
  right: 10px;
  color: #059669;
}

.header-label {
  font-size: 0.9rem;
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.objectives-section .header-label {
  color: #7c3aed;
}

.initiatives-section .header-label {
  color: #059669;
}

.header-split::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top right,
    #fef7ff 0%,
    #fef7ff 49.5%,
    #64748b 49.5%,
    #64748b 50.5%,
    #ecfdf5 50.5%,
    #ecfdf5 100%
  );
  z-index: 1;
}

.initiative-header {
  background: linear-gradient(135deg, #ecfdf5, #dcfce7);
  width: 250px;
  min-width: 250px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title-wrapper {
  flex: 1;
  text-align: center; /* centers the h3 inside this div */
}

.header-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.date {
  font-size: 0.75rem;
  color: #64748b;
}

.status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.status.active {
  background: #dcfce7;
  color: #166534;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.status.completed {
  background: #dbeafe;
  color: #1e40af;
}

.status.on.hold {
  background: #fecaca;
  color: #dc2626;
}

.objective-row:nth-child(even) {
  background: #f8fafc;
}

.objective-cell {
  background: linear-gradient(135deg, #fef7ff, #f3e8ff);
}

.objective-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.objective-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dropdown {
  position: relative;
}

.dropdown-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.dropdown-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* .dots {
  font-size: 1.2rem;
  color: #64748b;
  font-weight: bold;
} */

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 120px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background: #f1f5f9;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

.toggle-cell {
  text-align: center;
  padding: 1.5rem;
  position: relative;
}

.toggle-cell .toggle-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.toggle-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  position: relative;
}

.toggle-btn:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #059669;
  color: white;
}

.toggle-btn.active:hover {
  background: linear-gradient(135deg, #059669, #047857);
  border-color: #047857;
}

.checkmark {
  font-weight: bold;
}

.plus {
  color: #64748b;
  font-weight: bold;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

@media (max-width: 768px) {
  .objective-initiative-matrix {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .actions {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
/*** */
.action-dropdown .dropdown-toggle::after {
  display: none;
}

.action-dropdown .btn-link {
  color: #333;
}

.action-dropdown .dropdown-menu {
  min-width: 120px;
}

.action-dropdown .dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
}

.table-actions .dropdown-toggle::after {
  border: 0 !important;
}
.table-actions .dropdown-toggle {
  font-size: 17px !important;
  color: #344054 !important;
  cursor: pointer !important;
}
.table-actions .dropdown-menu .dropdown-item {
  opacity: 1 !important;
}

.dropdown-menu .dropdown-item {
  background-color: transparent !important;
  color: inherit !important;
}

.dropdown-menu .dropdown-item:hover,
.dropdown-menu .dropdown-item:focus {
  background-color: transparent !important;
  color: inherit !important;
}
table .dropdown-menu .dropdown-item {
  border-top: 1px solid #efefef !important;
}
div.dropdown-menu.dt-button-collection.two-column {
  z-index: 10;
}

.dropdown.table-actions .dropdown-menu.show {
  z-index: 99;
}
</style>
