<template>
  <main-page ref="page" :mainPage="$t('usee.usee')" :subPage="$t('usee.usee')" :titlePage="$t('usee.usee')">
    
    <template #datatable>
      <DataTable
        ref="table"
        id="usee-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"   
        :api="api"  
        :apiParams="apiParams"   
        :editItem="editItem"  
        :openForm="openForm"
      >
      </DataTable>
    </template>

    <!-- FormDialog -->
    <FormDialog
      v-model="dialogVisible"
      :schema="fromFields"   
      :new-item="newItem"   
      :api="api"   
      :close-form="closeFormDialog"   
      :form-data="true"   
      :dialog-width="800"
      :persistent="true"
      @close="handleDialogClose"
    ></FormDialog>
  </main-page>
</template>

<script>
import Usee from "@/API/Usee/Usee";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import FormDialog from "@/components/FormDialog.vue";

export default {
  components: {
    MainPage,
    DataTable,
    FormDialog,
  },

  setup() {
    const api = new Usee();
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
      dialogVisible: false,
      isReadonly: false,
      newItem: {},
    };
  },

  created() {
    this.tableColumns = [
      { id: "name", title: this.$t("usee.name"), data: "name", defaultContent: "N/A" },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("usee.name"),
        type: "text",
        col: 6,
        rules: "required"
      }
    ];
  },

  methods: {
    openForm() {
      this.dialogVisible = true;
    },

    closeForm() {
      this.dialogVisible = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },
    
    closeFormDialog() {
      this.dialogVisible = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },
    
    handleDialogClose() {
      this.closeForm();
    },

    editItem(data) {
      this.newItem = data;
      this.dialogVisible = true;
    },
  },
};
</script>

<style scoped>
</style>