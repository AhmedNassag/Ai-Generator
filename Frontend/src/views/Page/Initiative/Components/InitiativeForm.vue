<template>
  <Form
    :schema="fromFields"
    :newItem="newItem"
    :api="api"
    :closeForm="closeForm"
    :formData="true"
  >
    <!-- Custom owner type selector -->
    <template #ownerType="item">
      <div class="col-sm-12 col-md-6">
        <div class="form-group">
          <label for="ownerType" class="form-label">{{
            $t("initiative.ownerType")
          }}</label>
          <VueSelect
            label="ownerType"
            :rules="[required]"
            :options="ownerType || []"
            v-model="newItem.ownerType"
            placeholder="Select owner type"
            :reduce="(item) => item.id"
            @update:modelValue="selectOwnerType"
          />
          <small class="form-text text-muted"
            >{{ $t("initiative.Select") }}</small
          >
        </div>
      </div>
    </template>

    <!-- Dynamic owner selector based on ownerType -->
    <template #owner_id="item">
      <div class="col-sm-12 col-md-6 mb-4">
        <div v-if="newItem.ownerType == 'user'" class="form-group">
          <label for="owner_id" class="form-label">{{
            $t("initiative.owner_id")
          }}</label>
          <VueSelect
            label="full_name"
            :options="users || []"
            v-model="newItem.owner_user_ids"
            placeholder="Select users"
            :reduce="(item) => item?.id"
            multiple
            @update:modelValue="handleOwnerUsersChange"
          />
          <small class="form-text text-muted"
            >{{ $t("initiative.Select") }}</small
          >
        </div>
        <div v-if="newItem.ownerType == 'team'" class="form-group">
          <label for="owner_id" class="form-label">{{
            $t("initiative.owner_id")
          }}</label>
          <VueSelect
            label="name"
            :options="teams || []"
            v-model="newItem.owner_team_ids"
            placeholder="Select team"
            :reduce="(item) => item?.id"
            multiple
          />
          <small class="form-text text-muted"
            >{{ $t("initiative.Select") }}</small
          >
        </div>
      </div>
    </template>
  </Form>
</template>

<script>
// Importing necessary components and API modules
import initiative from "@/API/Initiative/Initiative";
import objective from "@/API/Objective/Objective";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    VueSelect,
  },

  props: {
    objective_id: {
      type: String,
      default: "",
    },
    newItem: {
      type: Object,
      required: false, 
   },
   editItem: {
      type: Function,
      required: false, 
    },
    closeForm: {
      type: Function,
      required: false,
    }
  },

  setup(props) {
    const api = new initiative();
    const relations = ["objectives", "programs", "projects"];
    const apiParams = { with: relations };
    const tableColumns = [];
    const objectiveApi = new objective();
    const userApi = new User();
    const teamApi = new Team();

    return {
      api,
      apiParams,
      tableColumns,
      objectiveApi,
      userApi,
      teamApi,
    };
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      // newItem: { status: "Draft" },
      objectives: [],
      initiativesData: [],
      users: [],
      teams: [],
      stakeholders: [],
      fromFields: [], // Initialize as empty array
      ownerType: [
        { id: "user", ownerType: "User" },
        { id: "team", ownerType: "Team" },
      ],
    };
  },
  mounted(){
  console.log("InitiativeForm mounted");
  console.log(this.newItem);
  },

  async beforeMount() {
    await this.loadFormData();
  },
  mounted() {
     if (!this.newItem.owner_user_ids) {
      this.newItem.owner_user_ids = [];
    }
  },

  methods: {
    async loadFormData() {
      try {
        // Initialize form fields first
        this.initializeFormFields();

        // Fetch all data concurrently
        const [objectives, initiativesData, users, teams] = await Promise.all([
          this.objectiveApi
            .getAll({
              filter: "strategicPlan_id|" + this.$route.params.id,
              with: "initiatives",
            })
            .catch(() => []),
          this.api
            .getAll({
              filterWhereRelation: [
                `objectives@strategicPlan_id|${this.$route.params.id}|=`,
              ],
              with: ["objectives"],
            })
            .catch(() => []),
          this.userApi.getAll({ select: "id|full_name" }).catch(() => []),
          this.teamApi.getAll({ select: "id|name" }).catch(() => []),
        ]);

        // Update data with null safety
        this.objectives = Array.isArray(objectives)
          ? objectives.filter((obj) => obj && obj.id)
          : [];
        this.initiativesData = Array.isArray(initiativesData)
          ? initiativesData.filter((init) => init && init.id)
          : [];
        this.users = Array.isArray(users)
          ? users.filter((user) => user && user.id)
          : [];
        this.teams = Array.isArray(teams)
          ? teams.filter((team) => team && team.id)
          : [];
        this.stakeholders = this.users; // Set stakeholders to users

        // Update form field options after all data is loaded
        this.updateFormFieldOptions();
      } catch (error) {
        console.error("Error fetching data:", error);
        // Ensure arrays are always initialized
        this.objectives = [];
        this.initiativesData = [];
        this.users = [];
        this.teams = [];
        this.stakeholders = [];
      }
    },

    initializeFormFields() {
      this.fromFields = [
        {
          section: this.$t("initiative.Main Details"),
          name: "name",
          label: this.$t("initiative.name"),
          type: "text",
          rules: "required",
          description: this.$t("initiative.Please enter name"),
          col: 6,
          placeholder: this.$t("initiative.Please enter name"),
        },
        {
          section: this.$t("initiative.Main Details"),
          name: "code",
          label: this.$t("initiative.code"),
          type: "text",
          rules: "required",
          description: this.$t("initiative.Please enter code"),
          col: 6,
          placeholder: this.$t("initiative.Please enter code"),
        },
        {
          section: this.$t("initiative.Main Details"),
          type: "options",
          name: "objective_ids",
          label: this.$t("initiative.objectives"),
          options: [], // Will be populated later
          optionLabel: "name",
          col: 6,
          rules: "required",
          description: this.$t("initiative.Select"),
          multiple: true,
        },
        {
          section: this.$t("initiative.Main Details"),
          name: "startDate",
          label: this.$t("initiative.startDate"),
          type: "date",
          rules: "required",
          description: this.$t("initiative.Please enter start date"),
          col: 6,
        },
        {
          section: this.$t("initiative.Main Details"),
          name: "endDate",
          label: this.$t("initiative.endDate"),
          type: "date",
          rules: "required",
          description: this.$t("initiative.Please enter end date"),
          col: 6,
        },
        {
          section: this.$t("initiative.Main Details"),
          type: "options",
          name: "initiative_ids",
          label: this.$t("initiative.dependencies"),
          options: [], // Will be populated later
          optionLabel: "name",
          col: 6,
          rules: "",
          description: this.$t("initiative.Select"),
          multiple: true,
        },
        {
          section: this.$t("initiative.Main Details"),
          type: "options",
          name: "riskLevel",
          label: this.$t("initiative.risk level"),
          options: [
            { id: "Low", name: "Low" },
            { id: "Medium", name: "Medium" },
            { id: "High", name: "High" },
          ],
          optionLabel: "name",
          col: 6,
          rules: "required",
          description: this.$t("initiative.Select"),
        },
        {
          section: this.$t("initiative.Main Details"),
          type: "options",
          name: "stakeholder_ids",
          label: this.$t("initiative.stakeholders"),
          options: [], // Will be populated later
          optionLabel: "name",
          col: 6,
          rules: "required",
          description: this.$t("initiative.Select"),
          multiple: true,
        },
        {
          section: this.$t("initiative.Main Details"),
          name: "ownerType",
        },
        {
          section: this.$t("initiative.Main Details"),

          name: "owner_id",
        },
        {
          section: this.$t("initiative.Main Details"),
          name: "expectedOutcome",
          label: this.$t("initiative.expectedOutcome"),
          type: "textarea",
          rules: "",
          description: this.$t("initiative.Please enter expected outcome"),
          col: 12,
        },
        {
          section: this.$t("initiative.Main Details"),
          name: "mitigationPlan",
          label: this.$t("initiative.mitigationPlan"),
          type: "textarea",
          rules: "",
          description: this.$t("initiative.Please enter mitigation plan"),
          col: 12,
        },
        {
          section: this.$t("initiative.Main Details"),
          name: "description",
          label: this.$t("initiative.description"),
          type: "textarea",
          rules: "",
          description: this.$t("initiative.Please enter description"),
          col: 12,
        },
      ];
    },

    updateFormFieldOptions() {
      // Update objectives field with null safety
      const objectiveIdsField = this.fromFields.find(
        (field) => field.name === "objective_ids"
      );
      if (objectiveIdsField) {
        objectiveIdsField.options = this.objectives
          .filter((objective) => objective && objective.id && objective.name)
          .map((objective) => ({
            id: objective.id,
            name: objective.name,
          }));
      }

      // Update initiatives dependencies field with null safety
      const initiativeIdsField = this.fromFields.find(
        (field) => field.name === "initiative_ids"
      );
      if (initiativeIdsField) {
        initiativeIdsField.options = this.initiativesData
          .filter(
            (initiative) => initiative && initiative.id && initiative.name
          )
          .map((initiative) => ({
            id: initiative.id,
            name: initiative.name,
          }));
      }

      // Update stakeholders field with null safety
      const stakeholderIdsField = this.fromFields.find(
        (field) => field.name === "stakeholder_ids"
      );
      if (stakeholderIdsField && this.stakeholders && this.stakeholders[0] !== null) {
        stakeholderIdsField.options = this.stakeholders
          .filter(
            (stakeholder) =>
              stakeholder != null&&
              stakeholder.id &&
              (stakeholder.full_name)
          )
          .map((stakeholder) => ({
            id: stakeholder.id,
            name: stakeholder.full_name,
          }));
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      // if(this.$route.name === "ObjectiveDetails") this.newItem.objective_ids = [this.$route.params.id];
      this.isFlipped = true;
    },

    // Close the form after submitting or canceling
    // closeForm() {
    //   this.isFlipped = false;
    //   // this.newItem = { status: "Draft" }; // Reset with default status
    // },

    // Set the item data for editing
    // editItem(data) {
    //   alert("Editing item: " + JSON.stringify(data));
    //   console.log("Editing item:", data);
    //   this.newItem = data || { status: "Draft" };
    //   this.isFlipped = true;
    // },

    handleOwnerUsersChange(value) {
      if (!this.newItem) return;

      if (Array.isArray(value)) {
        this.newItem.owner_user_ids = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (value === null || value === undefined) {
        this.newItem.owner_user_ids = [];
      } else {
        this.newItem.owner_user_ids = [value];
      }
    },

    selectOwnerType(value) {
      if (!this.newItem) return;

      this.newItem.owner_user_ids = [];
      this.newItem.owner_team_ids = null;
    },
  },

  watch: {
    "newItem.owner_user_ids": {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          const cleaned = newVal.filter(
            (item) => item !== null && item !== undefined
          );
          if (cleaned.length !== newVal.length) {
            this.$nextTick(() => {
              if (this.newItem) {
                this.newItem.owner_user_ids = cleaned;
              }
            });
          }
        }
      },
      deep: true,
    },
  },
};
</script>
