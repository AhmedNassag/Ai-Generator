<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('milestoneSetting.milestoneSetting')"
    :subPage="$t('milestoneSetting.milestoneSetting')"
    :titlePage="$t('milestoneSetting.milestoneSetting')"
    v-permission:show
  >
    <div v-permission:edit v-permission:destroy></div>
    <template #datatable>
      <DataTable
        ref="table"
        id="milestoneSetting-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
      >
      </DataTable>
    </template>
    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      >
        <template #type="{ item }">
          <div class="col-md-6 mb-3">
            <label for="type">{{ $t("milestoneSetting.Type") }}</label>
            <input class="form-control" id="type" v-model="newItem.type" :disabled="isTypeDisabled" value="milestone">
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>
<script>
import milestoneSetting from "@/API/MilestoneSetting/MilestoneSetting";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import workflowCategory from "@/API/WorkflowCategory/WorkflowCategory";
export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },
  setup() {
    const api = new milestoneSetting();
    const apiParams = { filter: `type|milestone|=` };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const workflowCategoryApi = new workflowCategory();
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      workflowCategoryApi,
    };
  },
  async mounted() {
    this.workflowCategories = await this.workflowCategoryApi.getAll({ select: "id|name" });
    const workflowCategoryIdField = this.fromFields.find((field) => field.name === "workflowCategory_id");
    workflowCategoryIdField.options = this.workflowCategories.map((workflowCategory) => ({
      id: workflowCategory.id,
      name: workflowCategory.name,
    }));
    this.milestoneSettings = await this.api.getAll(this.apiParams);
    if (this.milestoneSettings.length > 0) {
      this.hasData = true; // Set flag to true if data exists
      this.editItem(this.milestoneSettings[0]); // Load the first record into the edit form
    } else {
      this.hasData = false; // Set flag to false if no data exists
      this.openForm(); // Open the form for adding a new record
    }
  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {type:'milestone'}, // Data object to store the currently selected item for editing or new item
      milestoneSettings: [],
      workflowCategories: [],
      isTypeDisabled: true,
      hasData: false,
    };
  },
  created() {
    this.tableColumns = [
      { 
        id: "milestoneSetting.workflowCategory",
        title: this.$t("milestoneSetting.workflowCategory"),
        data: "",
        defaultContent: "N/A"
      },
    ];
    this.fromFields = [
      {
        section: this.$t("milestoneSetting.milestonesetting"),
        type: "options",  // Dropdown/select field
        name: "workflowCategory_id",
        label: this.$t("milestoneSetting.workflowCategory"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",  // Validation: required selection
        description: this.$t("milestoneSetting.Select"),
      },
      /*
      {
        name: "type",
        value: "milestone",
        label: this.$t("milestoneSetting.type"),
        type: "text|hidden",
        rules: "required",
        description: this.$t("milestoneSetting.Please enter type"),
        col: 6, // Column size in the form layout
      },
      */
    ];
  },
  methods: {
    openForm() {
      this.isFlipped = true; // Show the form
    },
    closeForm() {
      // window.location.reload();
      this.isFlipped = true; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      // this.newItem = {type:'milestone'}; // Clear the current item data
    },
    editItem(data) {
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },
  },
};
</script>
<style scoped>
/* Scoped styles for the component */
</style>
