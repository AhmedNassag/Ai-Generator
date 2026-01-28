<template>
  <main-page ref="page"
    :isFlipped="isFlipped"
    :mainPage="'mycertifiate.mycertifiate'"
    :mainSubPage="'mycertifiate.mycertifiate'"
    :titlePage="'mycertifiate.mycertifiate'"
    v-permission:show
  >
    <template #datatable>
      <DataTable
        v-permission:show
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"   
        :api="api"  
        :apiParams="apiParams"     
        :hideActions="hideActions"
        :hideActionsColumn="true"
        :hideAllActionsColumnn="true"
        :hideAddNewButton="true"
      >

        <template #template_name="{ item }">  {{ item.template?.name }} </template>
        <template #module_name="{ item }">  {{ item.template?.module?.name }} </template>
        <template #date="{ item }">  {{ formatDate(item.created_at) }} </template>

        <template v-slot:actions="{ item }">
          <a :href="'/show-certificate/' + item.id" 
            target="_blank" 
            class="btn btn-sm btn-outline-primary">
            <i class="fas fa-certificate mr-1"></i> View Certificate
          </a>
        </template>
      </DataTable>
    </template>
    
   
    
    <div v-permission:edit v-permission:destroy></div>
  </main-page>
</template>

<script>
import mycertifiate from "@/API/MyCertificate/MyCertificate";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import axios from "axios";
import { Modal } from 'bootstrap';
import DataTable from "@/components/DataTable.vue";
import Auth from "../../../API/Auth";

export default {
  setup() {
    const api = new mycertifiate();
    const apiParams = { filter: `user_id|${Auth.USER?.id}`, with: ['template.module'] };
    
    return {
      api,
      apiParams
    };
  },
  components: {
    MainPage,
    Form,
    DataTable,
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      certificates: [],
      selectedCertificate: null,
      certificateModal: null,
      tableColumns: [
        { 
          title: this.$t("template_name"), 
          data: "template.name", 
          name: "template.name",
          defaultContent: "N/A" 
        },
        { 
          title: this.$t("module_name"), 
          data: "template.module.name", 
          name: "template.module.name",
          defaultContent: "N/A" 
        },
        { 
          title: this.$t("date"), 
          data: "created_at", 
          name: "created_at",
          render: (data) => this.formatDate(data),
          defaultContent: "N/A" 
        },
        { 
          title: this.$t("actions"), 
          data: null, 
          name: "actions",
          orderable: false,
          searchable: false,
          className: "text-center"
        }
      ]
    };
  },



  methods: {
    openForm() {
      this.isFlipped = true;
    },

    closeForm() {
      this.isFlipped = false;
      this.newItem = {};
    },

    showCertificate(certificate) {
      this.selectedCertificate = certificate;
      if (this.selectedCertificate) {
        this.certificateModal.show();
      }
    },

   

    formatDate(dateString) {
            if (!dateString) return "N/A";
  
              const date = new Date(dateString);
              return date.toISOString()
                .replace('T', ' ')
                .split('.')[0]; 
    }
  }
};
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  padding: 1rem 1.5rem;
}

.table th {
  background-color: #212529;
  color: white;
  font-weight: 500;
}

.table td {
  vertical-align: middle;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.modal-body {
  overflow: auto;
  max-height: 80vh;
}

/* Certificate styling */
.certificate-container {
  width: 100%;
  min-height: 800px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .table-responsive {
    overflow-x: auto;
    display: block;
    width: 100%;
  }
  
  .card-body {
    padding: 0.75rem;
  }
  
  .btn {
    margin-bottom: 0.5rem;
    display: block;
    width: 100%;
  }
}
</style>@/API/MyCertifiate1/MyCertifiate