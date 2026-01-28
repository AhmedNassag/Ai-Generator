<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('phone.phone')" :subPage="$t('phone.phone')" :titlePage="$t('phone.phone')">
    
    <template #datatable>
      <DataTable
        ref="table"
        id="phone-table"
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
      ></Form>
    </template>
  </main-page>
</template>

<script>
import Phone from "@/API/Phone/Phone";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
  },

  setup() {
    const api = new Phone();
    const apiParams={};
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      tableColumns,
      fromFields,
      apiParams
    };
  },
 
  async mounted() {
    // Fetch options for select fields if needed
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
    };
  },

  created() {
    this.tableColumns = [
      { id: "user_id", title: this.$t("phone.user_id"), data: "user_id", defaultContent: "N/A" },
      { id: "team_id", title: this.$t("phone.team_id"), data: "team_id", defaultContent: "N/A" },
      { id: "department_id", title: this.$t("phone.department_id"), data: "department_id", defaultContent: "N/A" },
    ];

    this.fromFields = [
      {
        name: "user_id",
        label: this.$t("phone.user_id"),
        type: "user-select",
        col: 6,
        rules: "required",
        options: "None",
        optionLabel: "user name",
        optionValue: "id"
      },
      {
        name: "team_id",
        label: this.$t("phone.team_id"),
        type: "team-select",
        col: 6,
        rules: "required",
        options: "None",
        optionLabel: "team name",
        optionValue: "id"
      },
      {
        name: "department_id",
        label: this.$t("phone.department_id"),
        type: "options",
        col: 6,
        rules: "required",
        options: "None",
        optionLabel: "name",
        optionValue: "id"
      }
    ];
  },

  methods: {
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
  },
};
</script>

<style scoped>
</style>