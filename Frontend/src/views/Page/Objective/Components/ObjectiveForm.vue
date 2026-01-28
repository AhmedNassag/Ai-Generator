<template>
  <Form
    :schema="fromFields"
    :newItem="newItem"
    :api="api"
    :closeForm="closeForm"
    :formData="true"
  >
  </Form>
</template>

<script>
// Importing necessary components and API modules
import objective from "@/API/Objective/Objective";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import ObjectiveType from "@/API/ObjectiveType/ObjectiveType";
import Domain from "@/API/Domain/Domain";
import User from "@/API/User/User";
import StrategicPlan from "@/API/StrategicPlan/StrategicPlan";
import requirement from "@/API/Requirement/Requirement";

export default {
  components: {
    MainPage,
    Form,
  },

  setup() {
    const api = new objective();
    const objectiveTypeApi = new ObjectiveType();
    const domainApi = new Domain();
    const requirementApi = new requirement();
    const userApi = new User();
    const strategicPlanApi = new StrategicPlan();
    const tableColumns = [];
    const relations = [
      "objectiveType",
      "domains",
      "strategicPlan", 
      "initiatives",
    ];
    const apiParams = { with: relations };

    return {
      api,
      apiParams,
      tableColumns,
      objectiveTypeApi,
      domainApi,
      userApi,
      strategicPlanApi,
      requirementApi,
    };
  },

  data() {
    return {
      // isFlipped: true,
      isReadonly: false,
      newItem: {},
      objectiveTypes: [],
      relatedDomains: [],
      users: [],
      strategicPlans: [],
      requirements: [],
      fromFields: [], // Initialize as empty array
    };
  },

  async beforeMount() {
    // Initialize form fields first
    this.initializeFormFields();
    
    // Fetch all data concurrently
    try {
      const [requirements, objectiveTypes, domains, users, strategicPlans] = await Promise.all([
        this.requirementApi.getAll({ select: "id|name" }),
        this.objectiveTypeApi.getAll({ select: "id|name" }),
        this.domainApi.getAll({ select: "id|name" }),
        this.userApi.getAll({ select: "id|full_name" }),
        this.strategicPlanApi.getAll({ select: "id|name|requirement_ids" })
      ]);

      // Update data
      this.requirements = requirements;
      this.objectiveTypes = objectiveTypes;
      this.relatedDomains = domains;
      this.users = users;
      this.strategicPlans = strategicPlans;

      // Update form field options after all data is loaded
      this.updateFormFieldOptions();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },

  methods: {
    initializeFormFields() {
      this.fromFields = [
        {
          name: "name",
          label: this.$t("objective.name"),
          type: "text",
          rules: "required",
          description: this.$t("objective.Please enter name"),
          col: 6,
          placeholder: this.$t("objective.Please enter name")
        },
         {
          name: "code",
          label: this.$t("objective.code"),
          type: "text",
          rules: "required",
          description: this.$t("objective.Please enter code"),
          col: 6,
          placeholder: this.$t("objective.Please enter code")

        },
        // {
        //   type: "options",
        //   name: "strategicPlan_id",
        //   label: this.$t("objective.strategicPlan_id"),
        //   options: [], // Will be populated later
        //   optionLabel: "name",
        //   col: 6,
        //   rules: "required",
        //   description: this.$t("objective.Select"),
        //   disabled: true
        // },
        {
          name: "start_date",
          label: this.$t("objective.start_date"),
          type: "date",
          rules: "required",
          description: this.$t("objective.Please enter start date"),
          col: 6,
        },
        {
          name: "end_date",
          label: this.$t("objective.end_date"),
          type: "date",
          rules: "required",
          description: this.$t("objective.Please enter end date"),
          col: 6,
        },
        {
          type: "options",
          name: "type",
          label: this.$t("objective.type"),
          options: [], // Will be populated later
          optionLabel: "name",
          col: 6,
          rules: "required",
          description: this.$t("objective.Select"),
        },
        {
          type: "options",
          name: "domain_ids",
          label: this.$t("objective.domain_ids"),
          options: [], // Will be populated later
          optionLabel: "name",
          multiple: true,
          col: 6,
          rules: "required",
          description: this.$t("objective.Select"),
        },
        {
          type: "options",
          name: "linked_requirements",
          label: this.$t("objective.linked_requirements"),
          options: [], // Will be populated later
          optionLabel: "name",
          multiple: true,
          col: 6,
          rules: "required",
          description: this.$t("objective.Select"),
        },
        {
          type: "options",
          name: "stakeholders",
          label: this.$t("objective.stakeholders"),
          options: [], // Will be populated later
          optionLabel: "name", // Note: changed from "full_name" to "name" for consistency
          multiple: true,
          col: 6,
          rules: "required",
          description: this.$t("objective.Select"),
        },
        {
          name: "description",
          label: this.$t("objective.description"),
          type: "textarea",
          rules: "optional",
          description: this.$t("objective.Provide a description"),
          col: 12,
        },
      ];
    },

    updateFormFieldOptions() {
      // Update requirements field
      const requirementField = this.fromFields.find(
        (field) => field.name === "linked_requirements"
      );
      const currentStrategicPlan = this.strategicPlans.find((plan) => plan.id === this.$route.params.id);
      this.requirements = this.requirements.filter((requirement) =>currentStrategicPlan.requirement_ids.includes(requirement.id));
      if (requirementField && this.requirements.length > 0) {
        requirementField.options = this.requirements.map((requirement) => ({
          id: requirement.id,
          name: requirement.name,
        }));
      }

      // Update domains field
      const domainField = this.fromFields.find(
        (field) => field.name === "domain_ids"
      );
      if (domainField && this.relatedDomains.length > 0) {
        domainField.options = this.relatedDomains.map((domain) => ({
          id: domain.id,
          name: domain.name,
        }));
      }

      // Update objective types field
      const typeField = this.fromFields.find((field) => field.name === "type");
      // if (typeField && this.objectiveTypes.length > 0) {
        typeField.options = this.objectiveTypes.map((type) => ({
          id: type.id,
          name: type.name,
        }));
      // }

      // Update stakeholders field
      const stakeholdersField = this.fromFields.find(
        (field) => field.name === "stakeholders"
      );
      if (stakeholdersField && this.users.length > 0) {
        stakeholdersField.options = this.users.map((user) => ({
          id: user.id,
          name: user.full_name, // Keep full_name here as it's the actual field
        }));
      }

      // Update strategic plans field
      const strategicPlanField = this.fromFields.find(
        (field) => field.name === "strategicPlan_id"
      );
      if (strategicPlanField && this.strategicPlans.length > 0) {
        strategicPlanField.options = this.strategicPlans.map((plan) => ({
          id: plan.id,
          name: plan.name,
        }));
      }

      // Force reactivity update
      this.$forceUpdate();
    },

    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.newItem = {};
    },

    editItem(data) {
      this.newItem = data;
      this.isFlipped = true;
    },
  },
};
</script>