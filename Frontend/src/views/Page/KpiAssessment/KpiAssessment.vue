<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('kpiassessment.Govorenance')"
    :mainSubPage="$t('kpiassessment.KPI Assessment')"
    :titlePage="$t('kpiassessment.KPI Assessment')"
    v-permission:show
  >

    <div v-permission:edit v-permission:destroy></div>

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
        :hideAddNewButton="true"
        :hideActions="hideActions"
        :filters="filterData"
      >

        <template #KpiTitle="{ item }">
          {{ item.kpi?.title && item.kpi?.title.length > 17 ? item.kpi?.title.slice(0, 17) + '...' : item.kpi?.title }}
        </template>

        <template #KpiValue="{ item }">{{ item.kpi_value }}</template>

        <template #DepartmentValue="{ item }">{{ item.value }}</template>

        <template #CreatedBy="{ item }">
          <AvatarGroup
            :users="getMemberUsers(item.created_by)"
            :maxVisible="3"
            :spacing="20"
            empty-text="N/A"
            :clickable="true"
            @user-click="openUserDetailsModal"
          />
        </template>

        <template #InitiatedDate="{ item }">{{ item.created_date }}</template>

        <template #AssesmentBy="{ item }">
          <AvatarGroup
            :users="getMemberUsers(item.assesment_by)"
            :maxVisible="3"
            :spacing="20"
            empty-text="N/A"
            :clickable="true"
            @user-click="openUserDetailsModal"
          />
        </template>

        <template #AssesmentDate="{ item }">{{ item.assesment_date }}</template>

        <template #addAction="{ item }">
          <a
            href="javascript:void(0)"
            class="dropdown-item"
            title="Set Value"
            style="padding: 10px"
            @click="editItem(item)"
            v-if="isManagerOrAssignee(item)"
          >
            <i class="icofont icofont-fountain-pen"></i> {{ $t('kpiassessment.Set Value') }}
          </a>
          <a
            data-bs-toggle="modal"
            data-bs-target="#ViewModal"
            href="javascript:void(0)"
            class="dropdown-item"
            style="padding: 10px"
            title="ReAssign Assessment"
            @click="reAssignModal(item, item.kpi?.department_id)"
            v-if="isManagerOrAssignee(item)"
            v-permission:reAssign
          >
            <i class="icofont icofont-user"></i> {{ $t("kpiassessment.ReAssign Assessment") }}
          </a>
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
        <template #assesment_date="{ item }">
          <div class="col-md-6 mb-3">
            <label for="assesment_date">{{ $t("kpiassessment.Assesment Date" ) }}</label>
            <input class="form-control" id="assesment_date" type="date" v-model="newItem.assesment_date" :disabled="isAssesmentDateDisabled">
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- ReAssign Modal Component -->
  <ReAssignModal
    :usersData="usersData"
    :assesmentBy="assesment_by"
    @update:assesmentBy="assesment_by = $event"
    @save="saveReAssign"
  />

  <!-- View user details modal -->
  <ViewUserDetails
    :viewUserModal="viewUserModal"
    :userData="userData"
    @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event"
  />
</template>

<script>
// Importing necessary components and API modules
import Swal from "sweetalert2";
import kpiassessment from "@/API/KpiAssessment/KpiAssessment";
import user from "@/API/User/User";
import department from "@/API/Department/Department";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import "vue-select/dist/vue-select.css";
import Auth from "@/API/Auth";
import AvatarGroup from "@/components/AvatarGroup.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import ReAssignModal from "./components/ReAssignModal.vue";

export default {
  name: "Kpi Assessment",
  components: {
    MainPage,  // Main page layout component
    Form,      // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    AvatarGroup,
    ViewUserDetails,
    ReAssignModal,
  },

  setup() {
    // Initialize API and other required properties
    const api = new kpiassessment();
    const userApi = new user();
    const departmentApi = new department();
    const relations = ["kpi"];
    const authUser = Auth.USER;
    let filters = ``;
    let filterWhereRelation = [];
    if(authUser.super && authUser.super == "true") {
      filters = ``;
    } else if(authUser.is_manager && authUser.is_manager == "true") {
      filterWhereRelation = [`kpi@department_id|${authUser.department_id}|=`];
    } else {
      filters = `assesment_by|${authUser.id}|=`;
    }
    const apiParams = {
      with: relations,
      filter: filters,
      filterWhereRelation: filterWhereRelation,
    };
    const tableColumns = [];  // Initialize table column definitions
    const fromFields = [];    // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      userApi,
      departmentApi,
      apiParams,
      tableColumns,
      fromFields
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        return {
          edit: true,
          delete: true,
        };
      };
    },

    todayDate() {
      const today = new Date();
      const year  = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit format
      const day   = String(today.getDate()).padStart(2, '0'); // Ensure 2-digit format
      return `${year}-${month}-${day}`;
    },
  },

  async mounted() {
    try {
      await Promise.all([
          await this.fetchUsersData(),
          await this.fetchDepartmentsData(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      this.usersData = [];
      this.departmentsData = [];
    }
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: { assesment_date: null },
      usersData: [],
      departmentsData: [],
      userData: {},
      isAssesmentDateDisabled: true,
      showReAssignModal: false,
      viewUserModal: false,
      assesment_by: null,
      id: 0,
      /* start auth_user data */
      user: Auth.user,
      /* end auth_user data */
      filterData: [
        {
          title: this.$t("kpiassessment.Created By"),
          key: 'created_by',
          type: 'string',
          data: 'User',
          filterType: 'filter'
        },
        {
          title: this.$t("kpiassessment.Assesment By"),
          key: 'assesment_by',
          type:'string',
          data: 'User',
          filterType: 'filter'
        }
      ],
    };
  },

  created() {
    this.user = Auth.USER;
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      { id: "KpiTitle", title: this.$t("kpiassessment.KpiTitle"), data: "kpi.title", defaultContent: "N/A" },
      { id: "KpiValue", title: this.$t("kpiassessment.KpiValue"), data: "kpi_value", defaultContent: "N/A" },
      { id: "DepartmentValue", title: this.$t("kpiassessment.DepartmentValue"), data: "value", defaultContent: "N/A" },
      { id: "CreatedBy", title: this.$t("kpiassessment.CreatedBy"), data: "_USERSERVICE._User.created_by.full_name", defaultContent: "N/A" },
      { id: "InitiatedDate", title: this.$t("kpiassessment.InitiatedDate"), data: "created_date", defaultContent: "N/A" },
      { id: "AssesmentBy", title: this.$t("kpiassessment.AssesmentBy"), data: "_USERSERVICE._User.assesment_by.full_name", defaultContent: "N/A" },
      { id: "AssesmentDate", title: this.$t("kpiassessment.AssesmentDate"), data: "assesment_date", defaultContent: "N/A" },
    ];

    // Define the form fields schema by validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "value",
        label: this.$t("kpiassessment.value"),
        type: "number",
        rules: "required",
        description: this.$t("kpiassessment.Please enter value."),
        col: 6, // Column size in the form layout
      },
      {
        name: "assesment_date",
        label: this.$t("kpiassessment.assessmentDate"),
        type: "date",
        rules: "required",
        description: this.$t("kpiassessment.Please enter assessment date."),
        col: 6, // Column size in the form layout
      },
      {
        name: "comments",
        label: this.$t("kpiassessment.comment"),
        type: "textarea",
        rules: "nullable",
        description: this.$t("kpiassessment.Please enter comment."),
        col: 12, // Column size in the form layout
      },
    ];
  },

  methods: {
    async fetchUsersData() {
      try {
        const usersResponse = await this.userApi.getAll({ select: "id|full_name|type|email|phone|username|department_id" });
        this.usersData      = Array.isArray(usersResponse) ? usersResponse : []; 
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    async fetchDepartmentsData() {
      try {
        const departmentsResponse = await this.departmentApi.getAll({ select: "id|name" });
        this.departmentsData      = Array.isArray(departmentsResponse) ? departmentsResponse : []; 
      } catch (error) {
        console.error("Error fetching departments:", error); 
      }
    },
    
    getMemberUsers(memberIds) {
      if (!memberIds) return [];
      if(!Array.isArray(memberIds)) {
        memberIds = [memberIds];
      }
      const users = this.usersData.filter((user) => memberIds.includes(user.id));
      return users;
    },

    openForm() {
      this.isFlipped = true;  // Show the form
    },

    closeForm() {
      this.isFlipped = false;  // Hide the form
      this.$refs.table.refreshTable();  // Refresh the table data
      this.newItem = {};  // Clear the current item data
    },

    editItem(data) {
      this.newItem = {
        ...data, // Spread the existing data
        assesment_by: this.user?.id, // Append the current user's ID
      };
      this.isFlipped = true; // Show the form for editing
    },

    async reAssignModal(item, department_id) {
      try {
        if(item.assesment_by && item.assesment_by != null) {
          this.assesment_by = item.assesment_by;
        } else {
          this.assesment_by = null;
        }
        this.id = item.id;
        this.usersData = [];
        this.showReAssignModal = true;
        this.usersData = await this.userApi.getAll({
          filter: `department_id|${department_id}`,
          select: "id|full_name",
        });
      } catch (error) {
        this.id = 0;
      }
    },

    closeReAssignModal() {
      this.showReAssignModal = false;
      this.assesment_by = null;
    },

    async saveReAssign() {
      this.showReAssignModal = false;
        const data = {
          assesment_by: this.assesment_by,
        };
        const response = await this.api.reAssign(this.id, data)
        .then(response => {
          this.$refs.table.refreshTable();
          Swal.fire(this.$t("kpiassessment.Success"), this.$t("kpiassessment.Assessment ReAssigned successfully"), "success");
          location.reload();
        })
        .catch(error => {
          this.assesment_by = false;
          this.showReAssignModal = false;
          Swal.fire(this.$t("kpiassessment.Error"), this.$t("kpiassessment.There was an error occur"), "error"); // Error message
        });
    },

    isManagerOrAssignee(item) {
      if(!item.value && Auth.USER.is_manager == true) return true;
      if(!item.value && Auth.USER.id == item.assesment_by ) return true;
      return false;
    },

    openUserDetailsModal(selectedUserData) {
      if (!selectedUserData) return;
      this.userData = { ...selectedUserData };
      try {
          const userDepartment = this.departmentsData.find(dept => dept.id === this.userData.department_id) || {};
          this.userData.department = userDepartment.name || "N/A";
          this.viewUserModal = true;
      } catch (error) {
          console.error("Failed to fetch user data:", error);
      }
    },
  },

  watch: {
    'newItem.assesment_date': {
      handler(newValue) {
        if (!newValue) {
          this.newItem.assesment_date = this.todayDate;
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #D0B5E3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235C;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row{
  text-align: end;
}

/* Action Dropdown */
.dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  border-top: 1px solid #efefef;
}

.dropdown-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
  color: #000000 !important;
}

.dropdown-item:first-child {
  border-top: none;
}

.dropdown-item i {
  margin-right: 0.5rem;
  width: 1rem;
  text-align: center;
  padding-left: 14px;
  padding-right: 44px;
}
</style>
