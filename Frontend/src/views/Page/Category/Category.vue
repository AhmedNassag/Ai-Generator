<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('category.category')" :subPage="$t('category.category')" :titlePage="$t('category.category')">
    
    <template #datatable>
      <DataTable
        ref="table"
        id="category-table"
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
import Category from "@/API/Category/Category";
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
    const api = new Category();
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
      { id: "name", title: this.$t("category.name"), data: "name", defaultContent: "N/A" },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("category.name"),
        type: "text",
        col: 6,
        rules: "required"
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