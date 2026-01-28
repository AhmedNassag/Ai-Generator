<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" 
    :mainPage="'Governance'" 
    :mainSubPage="'changerequest.changerequest'"
    :subPage="'changerequest.ResponsibleDepartment'"
    >



    <!-- Slot for rendering the DataTable -->
    <template #datatable>

      <v-card class="mx-auto pa-4" elevation="4" max-width="700">
        <v-card-title class="text-h6 font-weight-bold">
          Change Requests Responsible Department
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-form @submit.prevent="submitForm">
            <v-select v-model="systemSettingDepartmentId" :items="departments" item-title="name" item-value="id"
              label="Select Department" density="comfortable" variant="outlined" clearable required></v-select>

            <v-btn block color="primary" class="mt-3" @click="submitForm">
              Update
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>

    </template>


  </main-page>




</template>

<script>
// Importing necessary components and API modules
import changerequest from "@/API/ChangeRequest/ChangeRequest";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Auth from "@/API/Auth";
import SystemSetting from "@/API/SystemSetting/SystemSetting";
import Department from "@/API/Department/Department";
import axios from "axios";
import User from "@/API/User/User";


export default {
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
  },

  setup() {
    // Initialize API and other required properties
    const api = new changerequest();
    const systemSetting = new SystemSetting();
    const department = new Department();
    const userapi = new User();
    const apiParams = {};
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      systemSetting,
      department,
      userapi
    };
  },

  async mounted() {

    const systemSettingDepartmentId = await this.systemSetting.getAll({
      filter: `type|change_requests_responsible_department_id|=`
    });
    this.systemSettingDepartmentId = systemSettingDepartmentId[0]?.data;

    // const departmentsResponse = await this.department.getAll({
    //   select: "id|name",
    // });
    // this.departments = departmentsResponse;

    const departmentIdField = await this.department.getAll({ select: "id|name" });
    this.departments = departmentIdField.map((department) => ({
      id: department.id,
      name: department.name,
    }));

  },
  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item

      systemSettingDepartmentId: '',
      departments: [],

    };
  },

  computed: {

  },
  created() {

  },

  methods: {
    async submitForm() {
      const response = await this.systemSetting.insert({ type: 'change_requests_responsible_department_id', data: this.systemSettingDepartmentId });
      if (response.status == 'success') {
        this.api.poup(response, "Successfuly !");
      } else {
        this.api.poup({ status: false, message: "There is an Error !!" }, "Error");
      }
    },

  },

  watch: {

  }
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
