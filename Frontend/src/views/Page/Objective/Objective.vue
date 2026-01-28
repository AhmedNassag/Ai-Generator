<template>
  <div id="objective-view" class="container-fluid">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('objective.objective')"
      :subPage="$t('objective.objective')"
      :titlePage="$t('objective.objective')"
      v-permission:show
    >

      <div v-permission:update v-permission:delete></div>

      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <DataTable
          ref="table"
          id="objective-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :editItem="editItem"
          :openForm="openForm"
        >
          <!-- Customizing the display of the 'Name' column in the table -->
          <!-- <template #Name="{ item }"> My - {{ item.name }} </template> -->

          <template #objective.name="{ item }">
            <router-link
              :to="{ path: `/objective-details/${item.id}` }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.name }}
            </router-link>
          </template>

          <template #objective.related_domains="{ item }">
            {{ getDomainNamesByIds(item?.domains).join(", ") }}
          </template>
          <template #objective.duration="{ item }">
            {{ calculateDuration(item.start_date, item.end_date) }}
          </template>

          <template #objective.linked_requirements="{ item }">
            {{ getRequirementNamesByIds(item?.linked_requirements).join(", ") }}
          </template>
          <template #objective.projects="{ item }">
            <router-link
              :to="{
                path: `/objective-details/${item.id}`,
                query: { tabName: 'projects' },
              }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.projects?.length || 0 }}
            </router-link>
          </template>
          <template #objective.programs="{ item }">
            <router-link
              :to="{
                path: `/objective-details/${item.id}`,
                query: { tabName: 'programs' },
              }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.programs?.length }}
            </router-link>
          </template>
          <template #objective.initiatives="{ item }">
            <router-link
              :to="{
                path: `/objective-details/${item.id}`,
                query: { tabName: 'initiatives' },
              }"
              style="cursor: pointer; color: #232388"
            >
              {{ item.initiatives?.length || 0 }}
            </router-link>
          </template>
        </DataTable>
      </template>

      <!-- Slot for rendering the form -->
      <template #form>
        <Form
          :schema="fromFields"
          :newItem="newItem"
          :api="api"
          :closeForm="closeForm"
          :formData="true"
        >
        </Form>
      </template>
    </main-page>
  </div>
</template>

<script>
// Importing necessary components and API modules
import objective from "@/API/Objective/Objective";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import ObjectiveType from "@/API/ObjectiveType/ObjectiveType";
import Domain from "@/API/Domain/Domain";
import User from "@/API/User/User";
import StrategicPlan from "@/API/StrategicPlan/StrategicPlan";
import requirement from "@/API/Requirement/Requirement";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new objective();
    const objectiveTypeApi = new ObjectiveType();
    const domainApi = new Domain();
    const requirementApi = new requirement();
    const userApi = new User();
    const strategicPlanApi = new StrategicPlan();
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const relations = [
      "objectiveType",
      //"domains",
      "strategicPlan",
      "initiatives",
    ];
    const apiParams = { with: relations };

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      objectiveTypeApi,
      domainApi,
      userApi,
      strategicPlanApi,
      requirementApi,
    };
  },

  async mounted() {
    // Fetch roles
    //this.roles = await this.roleApi.getAll({ select: "id|name" });

    // Update options dynamically in the form field
    //const myOptionsField = this.fromFields.find((field) => field.name === "myOptions");
    //myOptionsField.options = this.roles.map((role) => ({
    //id: role.id,
    //name: role.name,
    //}));
    // Fetch requirements
        // First, fetch all the data
    this.requirements = await this.requirementApi.getAll({ select: "id|name" });
    this.objectiveTypes = await this.objectiveTypeApi.getAll({ select: "id|name" });
    this.relatedDomains = await this.domainApi.getAll({ select: "id|name" });
    this.users = await this.userApi.getAll({ select: "id|full_name" });
    this.strategicPlans = await this.strategicPlanApi.getAll({ select: "id|name" });

    // THEN update the form fields with the fetched data
    this.updateFormFieldOptions();
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      objectiveTypes: [],
      relatedDomains: [],
      users: [],
      strategicPlans: [],
      requirements: [],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { 
        id: "objective.name",
        title: this.$t("objective.name"),
        data: "name",
        defaultContent: "N/A"
      },
      {
        id: "objective.related_domains",
        title: this.$t("objective.related_domains"),
        data: "domain_ids",
        defaultContent: "N/A",
      },
      { 
        id: "objective.duration",
        title: this.$t("objective.duration"),
        data: "start_date",
        defaultContent: "N/A"
      },
      {
        id: "objective.status",
        title: this.$t("objective.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "objective.linked_requirements",
        title: this.$t("objective.linked_requirements"),
        data: "linked_requirements",
        defaultContent: "N/A",
      },
      {
        id: "objective.initiatives",
        title: this.$t("objective.initiatives"),
        data: "",
        defaultContent: "N/A",
      }, //number of intiatives linked to this objective
      { 
        title: "objective.programs",
        title: this.$t("objective.programs"),
        data: "",
        defaultContent: "N/A"
      }, //number of Programs linked to this objective
      { 
        id: "objective.projects",
        title: this.$t("objective.projects"),
        data: "",
        defaultContent: "N/A"
      }, //number of Projects linked to this objective
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("objective.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("objective.Please enter name"),
        col: 6, // Column size in the form layout
      },
      {
        type: "options", // Dropdown/select field
        name: "strategicPlan_id",
        label: this.$t("objective.strategicPlan_id"),
        options: this.strategicPlans,
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("objective.Select"),
      },
      {
        name: "start_date",
        label: this.$t("objective.start_date"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("objective.Please enter start date"),
        col: 6, // Column size in the form layout
      },
      {
        name: "end_date",
        label: this.$t("objective.end_date"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("objective.Please enter end date"),
        col: 6, // Column size in the form layout
      },

      {
        type: "options", // Dropdown/select field
        name: "type",
        label: this.$t("objective.type"),
        options: this.objectiveTypes,
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("objective.Select"),
      },
      {
        type: "options", // Dropdown/select field
        name: "domain_ids",
        label: this.$t("objective.domain_ids"),
        options: this.relatedDomains || [],
        optionLabel: "name",
        multiple: true,
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("objective.Select"),
      },
      {
        type: "options", // Dropdown/select field
        name: "linked_requirements",
        label: this.$t("objective.linked_requirements"),
        options: this.requirements || [],
        optionLabel: "name",
        multiple: true,
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("objective.Select"),
      },
      {
        type: "options", // Dropdown/select field
        name: "stakeholders",
        label: this.$t("objective.stakeholders"),
        options: this.users,
        optionLabel: "name",
        multiple: true,
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("objective.Select"),
      },
      // {
      //   type: "options", // Dropdown/select field
      //   name: "workflow",
      //   label: this.$t("objective.workflow"),
      //   options: [
      //     { id: 1, name: "Option 1" },
      //     { id: 2, name: "Option 2" },
      //     { id: 3, name: "Option 3" },
      //     { id: 4, name: "Option 4" },
      //   ],
      //   optionLabel: "name",
      //   col: 6,
      //   rules: "required", // Validation: required selection
      //   description: "Select Workflow to customize for the client",
      // },
      {
        name: "description",
        label: this.$t("objective.description"),
        type: "textarea", // Multi-line text field
        rules: "optional", // Validation rule: required field
        description: this.$t("objective.Provide a description"),
        col: 12,
      },
    ];
  },
  computed: {
    // ... your existing computed properties

    // Add this computed property to handle domain names
    domainNamesMap() {
      if (!this.relatedDomains?.length) return {};

      // Create a map for faster lookups
      return this.relatedDomains.reduce((map, domain) => {
        map[domain.id] = domain.name;
        return map;
      }, {});
    },
  },
  methods: {
    updateFormFieldOptions() {
      // Update requirements field
      const requirementField = this.fromFields.find(field => field.name === "linked_requirements");
      if (requirementField) {
        requirementField.options = this.requirements.map(requirement => ({
          id: requirement.id,
          name: requirement.name,
        }));
      }

      // Update domains field
      const domainField = this.fromFields.find(field => field.name === "domain_ids");
      if (domainField) {
        domainField.options = this.relatedDomains.map(domain => ({
          id: domain.id,
          name: domain.name,
        }));
      }

      // Update objective types field
      const typeField = this.fromFields.find(field => field.name === "type");
      if (typeField) {
        typeField.options = this.objectiveTypes.map(type => ({
          id: type.id,
          name: type.name,
        }));
      }

      // Update stakeholders field
      const stakeholdersField = this.fromFields.find(field => field.name === "stakeholders");
      if (stakeholdersField) {
        stakeholdersField.options = this.users.map(user => ({
          id: user.id,
          name: user.full_name,
        }));
      }

      // Update strategic plans field
      const strategicPlanField = this.fromFields.find(field => field.name === "strategicPlan_id");
      if (strategicPlanField) {
        strategicPlanField.options = this.strategicPlans.map(plan => ({
          id: plan.id,
          name: plan.name,
        }));
      }
    },
    getDomainNamesByIds(domains) {
      // Handle null/undefined/empty arrays
      if (!domains || !domains.length || !this.relatedDomains?.length) {
        return [];
      }

      return domains
        .map((domain) => {
          // Handle both ID arrays and object arrays
          const id = typeof domain === "object" ? domain.id : domain;

          // Find the domain in relatedDomains array
          const foundDomain = this.relatedDomains.find(
            (d) => d.id === id || d.id === parseInt(id)
          );

          return foundDomain ? foundDomain.name : null;
        })
        .filter(Boolean); // Remove null/undefined values
    },
    getRequirementNamesByIds(requirementsIds) {
      if (!requirementsIds) return [];
      // const requirementsIds = requirements.map(domain => domain.id);
      const idsArray = Array.isArray(requirementsIds)
        ? requirementsIds
        : [requirementsIds];

      const requirementNames = idsArray
        .map((id) => {
          const requirement = this.requirements.find(
            (req) => req.id === id || req.id === parseInt(id)
          );
          return requirement ? requirement.name : "";
        })
        .filter((name) => name !== null);

      return Array.isArray(requirementsIds)
        ? requirementNames
        : requirementNames[0] || "";
    },
    calculateDuration(start, end) {
      if (!start || !end) return "N/A";

      const startDate = new Date(start);
      const endDate = new Date(end);

      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();

      // Adjust months and years if the end day is less than the start day
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
    // Open the form for adding or editing an item
    openForm() {
      if(this.$route.name === "StrategicPlanDetails") this.newItem.strategicPlan_id = this.$route.params.id;
      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },
  },
};
</script>

<style>
#objective-view .page-title {
  display: none;
}
#objective-view .flipper {
  min-height: 1000px !important;
}
</style>
