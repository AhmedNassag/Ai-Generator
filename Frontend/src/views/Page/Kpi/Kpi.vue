<template>
    <!-- Main Page component where the layout and page structure are set -->
    <main-page ref="page"
        :isFlipped="isFlipped"
        :mainPage="$t('kpi.Govorenance')"
        :mainSubPage="$t('kpi.KPI')"
        :titlePage="$t('kpi.KPI')"
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
                :hideActions="hideActions"
                :filters="filterData"
            >
                <template #title="{ item }">
                    {{ item.title && item.title.length > 17 ? item.title.slice(0, 17) + '...' : item.title }}
                </template>

                <template #Description="{ item }">
                    {{ stripHtml(truncateText(item.description)) }}
                </template>

                <template #Department="{ item }">
                    {{ getDepartmentName(item.department_id) }}
                </template>

                <template #kpi_owner="{ item }">
                    <AvatarGroup
                        :users="getDepartmentManagers(item.department_id)"
                        :maxVisible="3"
                        :spacing="20"
                        empty-text="N/A"
                        :clickable="true"
                        @user-click="openUserDetailsModal"
                    />
                </template>

                <template #created_by="{ item }">
                    <AvatarGroup
                        :users="getMemberUsers(item.created_by)"
                        :maxVisible="3"
                        :spacing="20"
                        empty-text="N/A"
                        :clickable="true"
                        @user-click="openUserDetailsModal"
                    />
                </template>

                <template #addAction="{ item }">
                    <a
                        href="javascript:void(0)"
                        class="dropdown-item"
                        title="Initiate KPI"
                        style="padding: 10px"
                        @click="initiateKpi(item.id)"
                        v-permission:initiateKpi
                        v-if="isManagerOrCreator(item)"
                    >
                        <i class="icofont icofont-time"></i> {{ $t('kpi.Initiate KPI') }}
                    </a>
                    <a
                        data-bs-toggle="modal"
                        data-bs-target="#ViewModal"
                        href="javascript:void(0)"
                        style="padding: 10px"
                        title="List KPI Assessments"
                        class="dropdown-item"
                        @click="kpiAssessments(item.id)"
                    >
                        <i class="icofont icofont-paper"></i> {{ $t('kpi.List KPI Assessments') }}
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
            </Form>
        </template>

    </main-page>

    <!-- Assessments Modal Component -->
    <KpiAssessmentsModal
        :kpiAssessmentsData="kpiAssessmentsData"
        :getMemberUsers="getMemberUsers"
        :getDepartmentName="getDepartmentName"
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
import kpi from "@/API/Kpi/Kpi";
import kpiAssessment from "@/API/KpiAssessment/KpiAssessment";
import user from "@/API/User/User";
import department from "@/API/Department/Department";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import "vue-select/dist/vue-select.css";
import Auth from "@/API/Auth";
import AvatarGroup from "@/components/AvatarGroup.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import KpiAssessmentsModal from "./components/KpiAssessmentsModal.vue";
import { useNotifyLogSetting } from "@/composables/useNotifyLogSetting";

export default {
    name: "Kpi",
    components: {
        MainPage,  // Main page layout component
        Form,      // Form component for adding/editing items
        DataTable, // DataTable component for displaying tabular data
        AvatarGroup,
        ViewUserDetails,
        KpiAssessmentsModal,
    },

    setup() {
        // Initialize API and other required properties
        const api = new kpi();
        const kpiAssessmentApi = new kpiAssessment();
        const userApi = new user();
        const departmentApi = new department();
        const authUser = Auth.USER;
        const relations = [];
        let filters = ``;
        if(authUser.super && authUser.super == "true") {
            filters = ``;
        } else if(authUser.is_manager && authUser.is_manager == "true") {
            filters = `department_id|${authUser.department_id}|=`;
        } else {
            filters = `created_by|${authUser.id}|=`;
        }
        const apiParams = {
            with: relations,
            filter: filters
        };
        const tableColumns = [];  // Initialize table column definitions
        const fromFields = [];    // Initialize form fields

        // Return properties for setup to be used in the template
        return {
            api,
            kpiAssessmentApi,
            userApi,
            departmentApi,
            apiParams,
            tableColumns,
            fromFields
        };
    },

    async mounted() {
        try {
            // Call the composable
            // useNotifyLogSetting(
            //     [
            //         { label: "Kpi", model: "Kpi" },
            //     ],
            //     true
            // );
            await Promise.all([
                await this.fetchUsersData(),
                await this.fetchDepartmentsData(),
                await this.preloadDepartmentManagers(),
            ]);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    },

    data() {
        return {
            isFlipped: false, // To control form flip (show/hide form)
            isReadonly: false, // Whether the form fields are read-only
            newItem: {created_by: this.user?.id}, // Data object to store the currently selected item for editing or new item
            usersData:[],
            departmentsData: [],
            departmentManagers: [],
            kpiAssessmentsData: [],
            showModal: false, // Controls modal visibility
            viewUserModal: false,
            kpiId: 0,
            kpi_owner: 0,
            /* start auth_user data */
            user: Auth.user,
            /* end auth_user data */
            filterData: [
                {
                    title: this.$t("kpi.Type"),
                    key: 'type',
                    type:'string',
                    data: [
                        {id: 'time', name: this.$t("kpi.time")},
                        {id: 'percentage', name: this.$t("kpi.percentage")},
                        {id: 'number', name: this.$t("kpi.number")},
                    ],
                    filterType: 'filter'
                },
                {
                    title: this.$t("kpi.Department"),
                    key: 'department_id',
                    type: 'string',
                    data: 'Department',
                    filterType: 'filter'
                },
                {
                    title: this.$t("kpi.Period"),
                    key: 'period',
                    type:'string',
                    data: [
                        {id: '1 months', name: this.$t("kpi.1 months")},
                        {id: '3 months', name: this.$t("kpi.3 months")},
                        {id: '6 months', name: this.$t("kpi.6 months")},
                        {id: '9 months', name: this.$t("kpi.9 months")},
                        {id: '12 months', name: this.$t("kpi.12 months")},
                    ],
                    filterType: 'filter'
                }
            ],
        };
    },

    created() {
        this.user = Auth.USER;
        // Initialize the table columns and form fields when the component is created
        this.tableColumns = [
            { id: "title", title: this.$t("kpi.title"), data: "title", defaultContent: "N/A" },
            { id: "Description", title: this.$t("kpi.Description"), data: "description", defaultContent: "N/A" },
            { id: "type", title: this.$t("kpi.type"), data: "type", defaultContent: "N/A" },
            { id: "value", title: this.$t("kpi.value"), data: "value", defaultContent: "N/A" },
            { id: "period", title: this.$t("kpi.period"), data: "period", defaultContent: "N/A" },
            { id: "Department", title: this.$t("kpi.Department"), data: "_USERSERVICE._Department.department_id.name", defaultContent: "N/A" },
            { id: "kpi_owner", title: this.$t("kpi.kpi_owner"), data: "_USERSERVICE._User.kpiOwner_ids.full_name", defaultContent: "N/A" },
            { id: "created_by", title: this.$t("kpi.created_by"), data: "_USERSERVICE._User.created_by.full_name", defaultContent: "N/A" },
            { id: "created_date", title: this.$t("kpi.created_date"), data: "created_date", defaultContent: "N/A" },
        ];

        // Define the form fields schema by validation rules, types, and descriptions
        this.fromFields = [
            {
                name: "title",
                label: this.$t("kpititle"),
                type: "text", // Text input field
                rules: "required", // Validation rule: required field
                description: this.$t("kpi.Please enter title"),
                col: 6, // Column size in the form layout
            },
            {
                type: "options",  // Dropdown/select field
                name: "type",
                label: this.$t("kpi.type"),
                options: [
                    { id: "time", name: "time", value: "time" },
                    { id: "percentage", name: "percentage", value: "percentage" },
                    { id: "number", name: "number", value: "number" },
                ],
                optionLabel: "name",
                col: 6,
                rules: "required",  // Validation: required selection
                description: this.$t("kpi.Please select type"),
                placeholder: this.$t("kpi.Select One")
            },
            {
                name: "value",
                label: this.$t("kpi.value"),
                type: "number", // Checkbox field
                rules: "required", // Validation rule: must be checked
                description: this.$t("kpi.Please enter value"),
                col: 6,
            },
            {
                type: "options",  // Dropdown/select field
                name: "period",
                label: this.$t("kpi.period"),
                options: [
                    { id: "1 months", name: "1 month", value: "1 months" },
                    { id: "3 months", name: "3 months", value: "3 months" },
                    { id: "6 months", name: "6 months", value: "6 months" },
                    { id: "9 months", name: "9 months", value: "9 months" },
                    { id: "12 months", name: "12 months", value: "12 months" },
                ],
                optionLabel: "name",
                col: 6,
                rules: "required",  // Validation: required selection
                description: this.$t("kpi.Please select period"),
                placeholder: this.$t("kpi.Select One")
            },
            {
                type: "options",  // Dropdown/select field
                name: "department_id",
                label: this.$t("kpi.department"),
                options: "Department",
                optionLabel: "name",
                col: 6,
                rules: "required",  // Validation: required selection
                description: this.$t("kpi.Please select department"),
                placeholder: this.$t("kpi.Select One")
            },
            {
                name: "description",
                label: this.$t("kpi.description"),
                type: "textarea", // Multi-line text field
                rules: "nullable", // Validation rule: required field
                description: this.$t("kpi.Please enter description"),
                col: 12,
            },
        ];
    },

    computed: {
        departmentManagersMap() {
            return this.departmentManagers;
        }
    },

    methods: {
        async fetchUsersData() {
            try {
                const usersResponse = await this.userApi.getAll({ select: "id|full_name|type|email|phone|username|department_id" });
                this.usersData = Array.isArray(usersResponse) ? usersResponse : [];
            } catch (error) {
                console.error("Error fetching users data:", error);
            }
        },

        async fetchDepartmentsData() {
            try {
                const departmentsResponse = await this.departmentApi.getAll({ select: "id|name" });
                this.departmentsData = Array.isArray(departmentsResponse) ? departmentsResponse : [];
            } catch (error) {
                console.error("Error fetching departments data:", error); 
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

        // Open the form for adding or editing an item
        openForm() {
            this.newItem = {
                created_by: this.user.id, // Assign the logged-in user ID
            };
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
            this.newItem = Object.assign({}, data); // Create a shallow copy
            delete this.newItem.created_by; // Remove the created_by property
            this.isFlipped = true; // Show the form for editing
        },

        //is manager or creator
        isManagerOrCreator(item) {
            if(Auth.USER.super && Auth.USER.super == "true") {
                return true; 
            }
            else if(Auth.USER.id == item.created_by) {
                return true;
            }
            else if(Auth.USER.is_manager && Auth.USER.is_manager == "true") {
                if(Auth.USER.department_id == item.department_id) {
                    return true;
                }
            }else{
                return false;
            }
        },

        // Handle the "Initiate" button click
        initiateKpi(id) {
            // Show confirmation dialog
            Swal.fire({
                title: this.$t("kpi.Are you sure?"),
                text: this.$t("kpi.You are about to initiate this KPI, This action cannot be undone!"),
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#6e3894",
                cancelButtonColor: "#d33",
                confirmButtonText: this.$t("kpi.Yes, initiate it!"),
                cancelButtonText: this.$t("kpi.No, cancel!"),
            }).then((result) => {
                if (result.isConfirmed) {
                    const data = {
                        created_by: this.user.id,
                    };
                    const response = this.api.initiateKpi(id, data)
                    .then((response) => {
                        this.$refs.table.refreshTable(); // Refresh the table
                        Swal.fire(this.$t("kpi.Success"), this.$t("kpi.KPI initiated successfully"), "success"); // Success message
                    })
                    .catch((error) => {
                        console.error("There was an error:", error);
                        Swal.fire(this.$t("kpi.Error"), this.$t("kpi.There was an error initiating the KPI"), "error"); // Error message
                    });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire(this.$t("kpi.Cancelled"), this.$t("kpi.The operation was cancelled"), "info");
                }
            });
        },

        // Fetch and display assessment data
        async kpiAssessments(id) {
            this.kpiAssessmentsData = [];
            // this.kpiAssessmentsData = await this.kpiAssessmentApi.getAll({ with: [`kpi`] ,filter: `kpi_id|${id}|=`});
            const kpi = await this.api.show(id, {
                with: ["kpiAssessments"],
            });
            this.kpiAssessmentsData = kpi.kpi_assessments || [];
            this.kpiAssessmentsData.forEach((item) => {
                item.department_id = kpi.department_id || ""; 
            });
            this.showModal = true;
        },

        // Close the modal
        closeModal() {
            this.showModal = false;
        },

        stripHtml(html) {
            const div = document.createElement("div");
            div.innerHTML = html;
            return div.textContent || div.innerText || "";
        },

        truncateText(text) {
            if (!text) {
                return ""; // Return an empty string if the text is null or undefined
            }
            // If text length is 50 or more, truncate and add "..."
            if (text.length >= 50) {
                return text.substring(0, 50) + "...";
            }
            // If text length is less than 50, return it as is
            return text;
        },

        getDepartmentName(departmentId) {
            if (!departmentId) return "N/A";
            const department = this.departmentsData.find(
                (department) => department.id === departmentId
            );
            return department ? department.name : "N/A";
        },

        async preloadDepartmentManagers() {
            this.departmentManagers = {};
            const promises = this.departmentsData.map(async (department) => {
                try {
                    const response = await this.departmentApi.getDepartmentManagers(department.id);
                    // Use Vue.set for reactive updates, or just assign if using Vue 3
                    this.departmentManagers[department.id] = response.map(manager => ({
                        id: manager.id,
                        name: manager.full_name,
                        full_name: manager.full_name,
                        type: manager.type,
                        email: manager.email,
                        phone: manager.phone,
                        username: manager.username,
                        department_id: manager.department_id,
                    }));
                } catch (error) {
                    console.error("Error fetching department managers:", error);
                    this.departmentManagers[department.id] = [];
                }
            });
            await Promise.all(promises);
            // Force table refresh after all managers are loaded
            this.$nextTick(() => {
                if (this.$refs.table && this.$refs.table.refreshTable) {
                    this.$refs.table.refreshTable();
                }
            });
        },

        getDepartmentManagers(departmentId) {
            return this.departmentManagers[departmentId] || [];
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
};
</script>

<style scoped>
/* Scoped styles for the component */
.swal2-confirm {
   color: white !important;
}
.swal2-cancel {
  color: white !important;
}

.btn-danger {
    color: white !important;
}

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
