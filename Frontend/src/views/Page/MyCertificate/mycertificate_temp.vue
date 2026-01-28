<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'mycertificate.mycertificate'" :subPage="'mycertificate.mycertificate'" :titlePage="'mycertificate.mycertificate'">
    
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"   
        :api="api"  
        :apiParams="apiParams"   
        :editItem="editItem"  
        :openForm="openForm"   
      >
        <!-- Custom column for actions -->

         <template #templateName="{ item }">
              {{ item.template?.name || '-' }}
        </template>
        
        <template #moduleName="{ item }">
              {{ item.template?.module?.name || '-' }}
        </template>

        <template #actions="{ item }">
          <button @click="viewCertificate(item)" class="btn btn-primary">
            <i class="fas fa-eye"></i> {{ $t("mycertificate.view_certificate") }}
          </button>
        </template>
      </DataTable>
    </template>

  </main-page>
</template>

<script>
// Importing necessary components and API modules
import mycertificate from "@/API/MyCertificate/MyCertificate";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";

export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new mycertificate();
    const apiParams = {};
    const tableColumns = [];

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
    };
  },
 
  async mounted() {
    await this.$refs.table.refreshTable();
  },
  
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: true, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { 
        title: 'templateName', 
        data: "template.name", 
        defaultContent: "N/A" 
      },
      { 
        title: this.$t("mycertificate.module_name"), 
        data: "template.module.name", 
        defaultContent: "N/A" 
      },
      { 
        title: this.$t("mycertificate.actions"), 
        data: "actions", 
        orderable: false,
        searchable: false
      }
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true;  // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    // Set the item data for editing
    editItem(data) {
      this.newItem = data;  // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
    },
    
    // View certificate method
    viewCertificate(item) {
      // Here you can implement the logic to view the certificate
      // For example, open a modal or navigate to a new page
      console.log("View certificate:", item);
      
      // If you want to open the certificate in a new tab:
      // window.open(item.template.fullBackgroundPath, '_blank');
      
      // Or if you have a specific certificate viewer component:
      // this.$router.push({ name: 'certificate-viewer', params: { id: item.id } });
      
      // For now, we'll just show an alert
      alert(`Viewing certificate for template: ${item.template.name}`);
    }
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.btn {
  padding: 5px 10px;
  font-size: 14px;
}
</style>