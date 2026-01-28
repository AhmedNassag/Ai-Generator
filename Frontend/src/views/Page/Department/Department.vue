<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('department.Governance')"
    :mainSubPage="$t('department.Departments')" 
    :titlePage="$t('department.Departments')" v-permission:index>
    <div v-permission:update v-permission:destroy></div>
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :filters="departmentFilters">
        <template #name="{ item }">
          <template v-if="item?.name">
            <a class="btn text-bold" @click="openModal(item)">{{ item?.name }}</a>
          </template>

        </template>
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #created="{ item }">
          <span>
            {{ formatDate(item.created_at) }}
          </span>
        </template>
        <template #parent="{ item }">
          <template v-if="item?.parent">
            <span class="badge bg-primary">{{ item?.parent?.name }}</span>
          </template>
        </template>

        <template #children="{ item }">
          <template v-if="item?.children">
            <span v-if="item.children.length >= 0" class="cursor-pointer" @click="openChildrenModal(item.children)"
              style="cursor: pointer">
              <span class="badge bg-info">
                {{ item.children[0]?.name }}
              </span>
            </span>
          </template>
        </template>
        <template #manager="{ item }"> {{ item?.manager?.name }} </template>
        <template #number_of_employees="{ item }">
          <div class="text-center">
            {{ item.number_of_employees ? item.number_of_employees : "" }}
          </div>

        </template>
        <template #actual_number_of_employees="{ item }">
          <div class="text-center">
            {{ item?.users.length == 0 ? "" : item?.users.length }}
          </div>
        </template>
        <!-- <template #view="{ item }" v-permission:show>
          <a href="javascript:void(0)" @click.prevent="openModal(item)" class="dropdown-item">
            <i class="icofont icofont-eye me-2"></i> {{ $t("department.view") }}
          </a>
        </template> -->
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
        <template #color_id="{ item }">
          <div class="col-lg-6">
            <div>
              <div class="form-group mt-0">
                <label for="color_id">{{ $t("department.color") }}</label>
                <LazySelectField 
                      
                name="color_id" v-model="newItem.color_id" options="Color" option-label="name"
                  option-value="id" placeholder="please select">
                  <!-- CUSTOM OPTION SLOT -->
                  <template #option="{ name, hexcolor }">
                    <div style="display: flex; align-items: center">
                      <span :style="{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: hexcolor,
                        marginRight: '8px',
                        marginLeft: '8px',

                      }"></span>
                      <span>{{ name }}</span>
                    </div>
                  </template>

                  <!-- OPTIONAL: selected item view -->
                  <template #selected-option="{ name, hexcolor }">
                    <div style="display: flex; align-items: center; gap: 6px">
                      <span :style="{
                        width: '12px',
                        height: '12px',
                        backgroundColor: hexcolor,
                        display: 'inline-block',
                      }"></span>
                      <span>{{ name }}</span>
                    </div>
                  </template>
                </LazySelectField>

                <!-- Fixed: Added closing tag -->
                <span class="text-xs" style="font-size: 10px">{{
                  $t("department.select_color")
                }}</span>
              </div>
            </div>
          </div>
        </template>
        <template #job_ids="{ item }">
          <div class="col-lg-6">
            <div class="form-group">
              <label for="job_ids">{{ $t("department.job_ids") }}</label>

              <LazySelectField 
                    
              name="job_ids" v-model="newItem.job_ids" options="Job" option-label="name"
                option-value="id" multiple clearable placeholder="please select"
                :showBadge="false" :onUpdate="handleJobSelection">
                <!-- 🔹 Customize dropdown option -->
                <template #option="{ name, is_manager }">
                  <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;">
                    <span>{{ name }}</span>
                    <span v-if="is_manager" class="badge bg-success"
                      style="font-size: 10px; padding: 2px 8px; margin-left: 8px">
                      Manager
                    </span>
                  </div>
                </template>

                <!-- 🔹 Customize selected items -->
                <template #selected-option="{ name, is_manager }">
                  <div style="display: flex; align-items: center; gap: 4px">
                    <span>{{ name }}</span>
                    <span v-if="is_manager" class="badge bg-success" style="font-size: 9px; padding: 1px 6px">
                      M
                    </span>
                  </div>
                </template>
              </LazySelectField>

              <span class="text-xs" style="font-size: 10px">
                {{ $t("department.select_jobs") }}
              </span>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Modal -->
  <div v-if="isModalOpen" class="modal-overlay">
    <div class="modal-content overflow-x-auto">
      <div class="modal-header text-primary">
        <h5 class="modal-title" id="exampleModalLabel">
          {{ $t("department.view") }}
        </h5>
        <span class="close" @click="closeModal">&times;</span>

        <!-- Fixed: Added closing tag -->
      </div>
      <div class="modal-body bg-white p-3 rounded-3">
        <div class="row">
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.name") }}:</label>
            <p class="text-bold">
              {{ selectedItem.name }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.type") }}:</label>
            <p class="text-bold">
              {{ selectedItem.type }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.parent") }}:</label>
            <p class="text-bold">
              {{ selectedItem?.parent?.name ?? "N/A" }}
            </p>
          </div>
          <div v-show="selectedItem?.children?.length > 0" class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.children") }}:</label>
            <p class="text-bold">
              <span v-for="child in selectedItem.children" class="badge badge-primary">{{ child?.name }}</span>
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.manager") }}:</label>
            <p class="text-bold">
              {{ selectedItem?.manager?.name ?? "N/A" }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.actual_number_of_employees") }}:</label>
            <p class="text-bold">
              {{
                selectedItem?.users.length == 0
                  ? "No Employees"
                  : selectedItem?.users.length
              }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.number_of_employees") }}:</label>
            <p class="text-bold">
              {{
                selectedItem.number_of_employees
                  ? selectedItem.number_of_employees
                  : "N/A"
              }}
            </p>
          </div>

          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.code") }}</label>
            <p class="text-bold">
              {{ selectedItem?.code }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.vision") }}:</label>
            <p class="text-bold">
              {{ extractText(selectedItem?.vision) }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.message") }}:</label>
            <p class="text-bold message">
              {{ extractText(selectedItem?.message) }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.mission") }}:</label>
            <p class="text-bold">
              {{ extractText(selectedItem?.mission) }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.objectives") }}:</label>
            <p class="text-bold message">
              {{ extractText(selectedItem?.objectives) }}
            </p>
          </div>
          <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">{{ $t("department.responsibilities") }}:</label>
            <p class="text-bold message">
              {{ extractText(selectedItem?.responsibilities) }}
            </p>
          </div>

          <div v-show="selectedItem?.jobs?.length > 0" class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
            <label class="form-label">Jobs</label>
            <p class="text-bold">
              <span v-for="job in selectedItem.jobs" class="badge badge-primary">{{ job?.name }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="modal-footer"></div>
    </div>
  </div>

  <!-- Children Modal -->
  <div v-if="isChildrenModalOpen" class="modal-overlay" @click.self="closeChildrenModal">
    <div class="children-modal-container">
      <div class="children-modal-header">
        <h5 class="children-modal-title">Children</h5>
        <button class="children-close-btn" @click="closeChildrenModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="children-modal-body">
        <div v-for="child in selectedChildren" :key="child.id" class="bg-info child-item">
          <span class="child-name">{{ child?.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import department from "@/API/Department/Department";
import job from "@/API/Job/Job";
import position from "@/API/Position/Position";
import color from "@/API/Color/Color";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { reactive, ref } from "vue";
import { notify } from "@kyvg/vue3-notification";
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    LazySelectField
  },

  setup() {
    // Initialize API and other required properties
    const api = new department(); // Initialize the API class
    const jobApi = new job();
    // const positionApi = new position();
    const colorApi = new color();

    const relations = [
      "children:id,name,children,parent_id",
      "parent:id,name",
      "users:id,full_name,department_id",
      "manager:id,name",
      "color:id,name",
    ];
    const apiParams = { with: relations }; // Set API parameters for fetching related data
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const fromFieldsNew = []; // Initialize form fields
    const fromFieldsEdit = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      jobApi,
      // positionApi,
      colorApi,
      apiParams,
      tableColumns,
      fromFields,
      fromFieldsNew,
      fromFieldsEdit,
    };
  },
  mounted() {
    // this.jobsList = await this.jobApi.getAll({ select: "id|name|is_manager" });
    // this.departments = await this.api.getAll({ select: "id|name" });
    // this.positionsList = await this.positionApi.getAll({ select: "id|name" });
    // this.colors = await this.colorApi.getAll({ select: "id|name|hexcolor" });
    this.fromFields = this.fromFieldsNew;
    // console.log("******************fromFieldsMounted******************");
    // setTimeout(() => {
    //   console.log(this.$refs.table.data);
    // }, 1000); 
    // console.log("******************fromFieldsMounted******************");

  },
  data() {
    return {
      isModalOpen: false,
      selectedItem: {},
      isChildrenModalOpen: false,
      selectedChildren: [],
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {
        job_ids: [],
      }, // Data object to store the currently selected item for editing or new item
      jobsList: reactive([]),
      // positionsList: [],
      departments: [],
      colors: [],
      filter: {
        type: "",
        manager: "",
        relation: "",
      },
      departmentFilters: [
        {
          title: "Type",
          key: "type",
          type: "string",
          data: [
            { id: "LDAP", name: "LDAP" },
            { id: "GRC", name: "GRC" },
          ],
          filterType: "filter", // Default filter type
        },
        {
          title: "Manager",
          key: "manager_id",
          type: "int",
          data: {
            model: "Position",
            id: "id",
            display: "name",
          },
          filterType: "filter", // Default filter type
        },
        {
          title: "Relation",
          key: "relation",
          type: "null",
          data: [
            { id: "parent", name: "Parent" },
            { id: "child", name: "Child" },
          ],
          filterType: "filter", // Default filter type
        },
      ],

    };
  },

  async created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("common.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        title: this.$t("department.type"),
        data: "type",
        defaultContent: "N/A",
      },
      {
        id: "code",
        title: this.$t("department.code"),
        data: "code",
        defaultContent: "N/A",
      },
      {
        id: "parent",
        title: this.$t("department.parent"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "children",
        title: this.$t("department.children"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "number_of_employees",
        title: this.$t("department.number_of_employees"),
        data: "number_of_employees",
        class: "text-center",
        defaultContent: "N/A",
      },
      {
        id: "actual_number_of_employees",
        title: this.$t("department.actual_number_of_employees"),
        data: null,
        defaultContent: "N/A",
      },
      // {
      //   id: "manager",
      //   title: this.$t("department.manager"),
      //   data: null,
      //   defaultContent: "N/A",
      // },
      {
        id: "created",
        title: this.$t("department.created"),
        data: null,
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFieldsNew = [
      {
        name: "id",
        type: "hidden",
        rules: "",
      },
      {
        name: "name",
        label: this.$t("common.name"),
        type: "text",
        rules: "required",
        description: this.$t("department.description_name"),
        col: 6,
      },
      {
        name: "code",
        label: this.$t("department.code"),
        type: "text",
        rules: "required",
        description: this.$t("department.description_code"),
        col: 6,
      },
      {
        name: "color_id",
      },
      {
        optionLabel: "name",
        name: "parent_id",
        label: this.$t("department.parent_id"),
        type: "options",
        rules: "",
        description: this.$t("department.description_parent"),
        col: 6,
        options: "Department",
        apiParams: { select: "id|name|parent_id", filter: `id|${this.newItem.id}-string|!=` },
      },
      // {
      //   optionLabel: "name",
      //   name: "manager_id",
      //   label: this.$t("department.manager_id"),
      //   type: "options",
      //   rules: "",
      //   description: this.$t("department.description_manager"),
      //   col: 6,
      //   options: this.positionsList,
      // },
      {
        optionLabel: "name",
        name: "job_ids",
        label: this.$t("department.job_ids"),
        type: "options",
        rules: "",
        multiple: true,
        description: this.$t("department.description_job_ids"),
        col: 6,
        options: this.jobsList,
      },
      {
        name: "number_of_employees",
        label: this.$t("department.number_of_employees"),
        type: "number",
        rules: "number",
        description: this.$t("department.description_number_of_employees"),
        col: 6,
        class: "me-3",
      },
      {
        name: "vision",
        label: this.$t("department.vision"),
        type: "textarea",
        rules: "",
        description: this.$t("department.description_vision"),
        col: 6,
      },
      {
        name: "message",
        label: this.$t("department.message"),
        type: "textarea",
        rules: "",
        description: this.$t("department.description_message"),
        col: 6,
      },
      {
        name: "mission",
        label: this.$t("department.mission"),
        type: "textarea",
        rules: "",
        description: "",
        col: 6,
      },
      {
        name: "objectives",
        label: this.$t("department.objectives"),
        type: "textarea",
        rules: "",
        description: this.$t("department.description_objectives"),
        col: 6,
      },
      {
        name: "responsibilities",
        label: this.$t("department.responsibilities"),
        type: "textarea",
        rules: "",
        description: this.$t("department.description_responsibilities"),
        col: 6,
      },
    ];
    this.fromFieldsEdit = [
      {
        name: "id",
        type: "hidden",
        rules: "",
      },
      {
        name: "color_id",
      },
      {
        optionLabel: "name",
        name: "job_ids",
        label: this.$t("department.job_ids"),
        type: "options",
        rules: "",
        multiple: true,
        description: this.$t("department.description_job_ids"),
        col: 6,
        options: this.jobsList,
      },
    ];
  },

  methods: {
    logTableData() {
      console.log(this.$refs.table.data);
    },

    // Handle job selection to ensure only one manager job can be selected
    handleJobSelection(selectedJobIds) {
      if (!selectedJobIds || selectedJobIds.length === 0) {
        this.newItem.job_ids = [];
        return;
      }

      // Get the currently selected jobs with their details
      const selectedJobs = this.jobsList.filter((job) =>
        selectedJobIds.includes(job.id)
      );

      // Count how many manager jobs are selected
      const managerJobs = selectedJobs.filter((job) => job.is_manager);

      // If more than one manager job is selected, keep only the most recently selected one
      if (managerJobs.length > 1) {
        // Find which manager job was just added
        const previousJobIds = this.newItem.job_ids || [];
        const newlyAddedJobId = selectedJobIds.find(
          (id) => !previousJobIds.includes(id)
        );

        if (newlyAddedJobId) {
          const newlyAddedJob = this.jobsList.find(
            (job) => job.id === newlyAddedJobId
          );

          if (newlyAddedJob && newlyAddedJob.is_manager) {
            // Remove all other manager jobs, keep only the newly selected one
            const nonManagerJobs = selectedJobs.filter(
              (job) => !job.is_manager
            );
            this.newItem.job_ids = [
              ...nonManagerJobs.map((job) => job.id),
              newlyAddedJobId,
            ];

            // Show a warning notification to the user
            notify({
              title: this.$t("common.warning") || "Warning",
              text: "You can't select multiple jobs with manager role. Only one manager job is allowed. Previous manager job has been removed.",
              type: "error",
              duration: 5000,
            });
          } else {
            // Keep the first manager job, remove the newly selected one
            this.newItem.job_ids = selectedJobIds.filter(
              (id) => id !== newlyAddedJobId
            );

            // Show a warning notification
            notify({
              title: this.$t("common.warning") || "Warning",
              text: "You can't select multiple jobs with manager role. Only one manager job is allowed.",
              type: "error",
              duration: 5000,
            });
          }
        } else {
          // Keep only the first manager job
          const firstManagerJob = managerJobs[0];
          const nonManagerJobIds = selectedJobs
            .filter((job) => !job.is_manager)
            .map((job) => job.id);
          this.newItem.job_ids = [...nonManagerJobIds, firstManagerJob.id];

          // Show a warning notification
          notify({
            title: this.$t("common.warning") || "Warning",
            text: "You can't select multiple jobs with manager role. Only one manager job is allowed.",
            type: "error",
            duration: 5000,
          });
        }
      } else {
        // Normal selection - update the model
        this.newItem.job_ids = selectedJobIds;
      }
    },

    openModal(item) {
      this.isModalOpen = true;
      this.selectedItem = item;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    openChildrenModal(children) {
      this.isChildrenModalOpen = true;
      this.selectedChildren = children;
    },
    closeChildrenModal() {
      this.isChildrenModalOpen = false;
      this.selectedChildren = [];
    },

    extractText(html) {
      // Return an empty string if the input is null or undefined
      if (!html) {
        return "N/A";
      }

      // Use DOMParser to parse the HTML string
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract and return the text content, or an empty string if it's null
      return doc.body.textContent || "";
    },
    async openForm() {
      // this.fromFieldsEdit[3].options = this.jobsList;
      // this.fromFieldsNew[6].options = this.jobsList;
      // this.fromFieldsNew[4].options = this.departments;
      this.fromFields = this.fromFieldsNew;
      this.isFlipped = true; // Show the form
    },
    async closeForm() {
      // if (this.newItem.type == "LDAP") {
      //   this.fromFields[3].options = this.jobsList;
      // } else if (this.newItem.type == "GRC") {
      //   // update department parent
      //   this.fromFields[4].options = this.departments;
      //   this.fromFields[6].options = this.jobsList;
      // }
      // this.departments = await this.api.getAll({ select: "id|name" });

      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },
    formatDate(date) {
      if (!date) return "N/A";
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
    },
    async editItem(data) {
      if (data.type == "LDAP") {
        this.fromFields = this.fromFieldsEdit;
        // this.fromFields[3].options = this.jobsList;
      } else if (data.type == "GRC") {
        this.fromFields = this.fromFieldsNew;
        // let departments = [];
        // this.departments.forEach((department) => {
        //   if (department.id != data.id) {
        //     departments.push(department);
        //   }
        // });
        // this.fromFields[4].options = departments;
        // this.fromFields[6].options = this.jobsList;
      }
      this.newItem = data; // Set the current item to edit
      this.isFlipped = true; // Show the form for editing
      console.log("******************fromFields******************");
      console.log(this.fromFields);
    },
  },
  // watch: {
  //   '$refs.table.data': {
  //     handler(newData) {
  //       console.log('Table data loaded:', newData);
  //     },
  //     deep: true
  //   },
  //   'newItem.job_ids': {
  //     handler(newVal) {
  //       this.handleJobSelection(newVal);
  //     },
  //     deep: true
  //   }
  // }
};
</script>

<style scoped>
@import "vue-select/dist/vue-select.css";

.parent {
  margin-top: 100px;
}

.bg-info {
  background-color: #D0B5E3 !important;
  color: #6E3894 !important;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 10px;
  height: 20px;
  font-size: 10px;
  font-weight: 500;
}


.form-label {
  font-weight: 500;
  font-size: 12px;
  line-height: 100%;
  letter-spacing: 0;
  opacity: 1;
  color: rgb(33, 37, 41, 0.75) !important;
}

.text-bold {
  font-weight: 700;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0;
  opacity: 1;
  color: rgb(33, 37, 41, 0.9) !important;
  /* no wrap */
  white-space: nowrap;
  
}

.message {
  color: #6e3894 !important;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #f8f8f8;
  padding: 16px;
  border-radius: 10px;
  width: 80%;
  min-height: 480px;
  height: 50%;
  position: relative;
  animation: fadeIn 0.3s ease;
}

/* Children Modal - Smaller Size */
.children-modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 250px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideUp 0.3s ease-out;
  overflow: hidden;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.children-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.children-modal-title {
  color: black;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0px;
}

.modal-title {
  color: #000000;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0px;
  margin-bottom: 5px;
}

.children-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: black;
  font-size: 16px;
}

.children-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.children-modal-body {
  padding: 0 24px 24px;
  max-height: 400px;
  overflow-y: auto;
}

.child-item {
  border-radius: 10px;
  margin-bottom: 12px;
  padding: 6px 12px;
  width: 100%;
  height: auto;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.child-item:last-child {
  margin-bottom: 0;
}

.child-name {
  color: #6e3894;
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
  font-size: 12px;
  font-weight: 500;
  font-style: normal;
  line-height: 100%;
  letter-spacing: 0;
  text-align: center;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  justify-content: center;
}

.children-modal-body::-webkit-scrollbar {
  width: 6px;
}

.children-modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.children-modal-body::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 10px;
}

.children-modal-body::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

.children-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
}

.cursor-pointer {
  cursor: pointer !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.close {
  font-size: 25px;
  font-weight: 500;
  cursor: pointer;
  color: #333;
}

/* Buttons */
.btn-primary {
  margin-top: 20px;
  background-color: #007bff;
  /* Primary background color */
  color: white;
  /* Text color */
  border: none;
  padding: 10px 15px;
  /* Padding for spacing */
  border-radius: 5px;
  /* Rounded corners */
  cursor: pointer;
  /* Pointer cursor on hover */
  font-size: 14px;
  /* Font size */
  transition: background-color 0.3s, transform 0.2s;
  /* Smooth transition for hover effects */
}

.btn-primary:hover {
  background-color: #0056b3;
  /* Darker shade on hover */
  transform: scale(1.05);
  /* Slight zoom effect */
  color: #e9ecef;
  /* Optional: Slightly lighter text color */
}

.multiselect {
  box-sizing: border-box;
  display: block;
  position: relative;
  width: 100%;
  min-height: 40px;
  text-align: left;
  color: #35495e;
}

@keyframes shine {
  0% {
    left: -100px;
  }

  60% {
    left: 100%;
  }

  to {
    left: 100%;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  justify-content: space-between;
}

</style>