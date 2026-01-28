<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('strategicplan.strategicplan')"
    :subPage="$t('strategicplan.strategicplan')"
    :titlePage="$t('strategicplan.strategicplan')"
    v-permission:show
  >
    <div v-permission:update v-permission:delete></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        ref="table"
        id="strategicPlan-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
      >
        <template #strategicplan.name="{ item }">
          <router-link
            :to="{ path: `/strategic-plan-details/${item.id}` }"
            style="cursor: pointer; color: #232388"
          >
            {{ item.name }}
          </router-link>
        </template>
        <template #strategicplan.duration="{ item }">
          <!-- {{ item.startDate }} <v-icon icon="mdi-arrow-right"></v-icon> {{ item.endDate }} -->
          {{ calculateDuration(item.startDate, item.endDate) }}
        </template>
        <template #strategicplan.status="{ item }">
          <div class="form-check form-switch" v-permission:show>
            <!-- <label class="form-check-label" for="flexSwitchCheckChecked">{{ item.status ? 'Active' : 'Deactive' }}</label> -->
            <input
              class="form-check-input"
              type="checkbox"
              id="flexSwitchCheckChecked"
              v-model="item.status"
              @change="toggleActiveStatus(item)"
            />
            <div v-html="getStrategicPlanStatus(item)"></div>
          </div>
        </template>
        <template #strategicplan.objectivesNumber="{ item }">
          {{ calculateObjectivesCount(item) }}
        </template>
        <template #strategicplan.initiativesNumber="{ item }">
          {{ calculateInitiativesCount(item) }}
        </template>
        <template #strategicplan.programsNumber="{ item }">
          {{ calculateProgramsCount(item) }}
        </template>
        <template #strategicplan.projectsNumber="{ item }">
          {{ calculateProjectsCount(item) }}
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
        <!-- Add this template slot inside your Form component in the template section -->
        <template #file="{ item }">
          <div class="col-sm-12 col-md-6">
            <div class="form-group">
              <label for="file" class="form-label">{{
                $t("strategicplan.file")
              }}</label>
              <!-- File input -->
              <input
                type="file"
                class="form-control"
                id="file"
                @change="handleFileChange"
                accept=".jpg,.png,.jpeg,.gif,.svg,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <small class="form-text text-muted">
                {{
                  newItem.id && newItem.file
                    ? "Upload file to replace the current one"
                    : "Please upload a file of the strategic plan"
                }}
              </small>
              <!-- Show existing file info if editing -->
              <div v-if="newItem.originalFile && newItem.id" class="mb-2">
                <i class="fas fa-file me-1"></i>
                <strong>Current file: </strong>
                <a
                  :href="newItem.fullFilePath"
                  target="_blank"
                  class="text-decoration-none"
                >
                  {{ getFileName(newItem.originalFile) }}
                </a>
              </div>
            </div>
          </div>
        </template>

        <!--documentCategory_id-->
        <template #documentCategory_id="{ item }">
          <div class="col-sm-12 col-md-6">
            <div class="form-group">
              <label for="documentCategory" class="form-label">
                {{ $t("strategicplan.document category") }}
              </label>
              <VueSelect
                label="name"
                :rules="[required]"
                :options="documentCategories"
                v-model="newItem.documentCategory_id"
                placeholder="Select document category"
                :reduce="(item) => item.id"
              />
              <small class="form-text text-muted">
                {{ $t("strategicplan.Select") }}
              </small>
            </div>
          </div>
        </template>
        <!--document_id-->
        <template #document_id="{ item }">
          <div class="col-sm-12 col-md-6">
            <div class="form-group">
              <label for="document" class="form-label">
                {{ $t("strategicplan.document") }}
              </label>
              <VueSelect
                label="name"
                :rules="[required]"
                :options="documents"
                v-model="newItem.document_id"
                placeholder="Select document"
                :reduce="(item) => item.id"
              />
              <small class="form-text text-muted">
                {{ $t("strategicplan.Select") }}
              </small>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import strategicplan from "@/API/StrategicPlan/StrategicPlan";
import documentCategory from "@/API/DocumentCategory/DocumentCategory";
import document from "@/API/Document/Document";
import requirement from "@/API/Requirement/Requirement";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import Auth from "@/API/Auth";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    VueSelect,
  },

  setup() {
    // Initialize API and other required properties
    const api = new strategicplan();
    const relations = [
      "objectives",
      "objectives.initiatives",
      "objectives.initiatives.programs",
      "objectives.initiatives.projects",
      "objectives.initiatives.programs.projects",
    ];
    const apiParams = { filter: "", with: relations };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const documentCategoryApi = new documentCategory();
    const documentApi = new document();
    const requirementApi = new requirement();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      documentCategoryApi,
      documentApi,
      requirementApi,
    };
  },

  async mounted() {
    // Fetch requirements
    this.requirements = await this.requirementApi.getAll({ select: "id|name" });
    const requirementIdsField = this.fromFields.find(
      (field) => field.name === "requirement_ids"
    );
    requirementIdsField.options = this.requirements
      .filter((requirement) => requirement != null)
      .map((requirement) => ({
        id: requirement.id,
        name: requirement.name,
      }));

    // Fetch documentCategories
    this.documentCategories = await this.documentCategoryApi.getAll({
      select: "id|name",
    });
    const documentCategoryIdField = this.fromFields.find(
      (field) => field.name === "documentCategory_id"
    );
    documentCategoryIdField.options = this.documentCategories.map(
      (documentCategory) => ({
        id: documentCategory.id,
        name: documentCategory.name,
      })
    );
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      documentCategories: [],
      documents: [],
      requirements: [],
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id: "strategicplan.name",
        title: this.$t("strategicplan.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.startDate",
        title: this.$t("strategicplan.startDate"),
        data: "startDate",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.endDate",
        title: this.$t("strategicplan.endDate"),
        data: "endDate",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.duration",
        title: this.$t("strategicplan.duration"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.status",
        title: this.$t("strategicplan.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.objectivesNumber",
        title: this.$t("strategicplan.objectivesNumber"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.initiativesNumber",
        title: this.$t("strategicplan.initiativesNumber"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.programsNumber",
        title: this.$t("strategicplan.programsNumber"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "strategicplan.projectsNumber",
        title: this.$t("strategicplan.projectsNumber"),
        data: "",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        section: this.$t("strategicplan.Main Details"),
        name: "name",
        label: this.$t("strategicplanname"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("strategicplan.Please enter name"),
        col: 6, // Column size in the form layout
        placeholder: "Name",
      },
      {
        section: this.$t("strategicplan.Main Details"),
        name: "code",
        label: this.$t("strategicplan.code"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("strategicplan.Please enter code"),
        col: 6, // Column size in the form layout
        placeholder: "Code",
      },
      {
        section: this.$t("strategicplan.Main Details"),
        name: "file",
        label: this.$t("strategicplan.file"),
        type: "file",
        rules: "",
        description: this.$t(
          "strategicplan.Please upload a file of the strategic plan"
        ),
        col: 6,
      },
      {
        section: this.$t("strategicplan.Main Details"),
        type: "options", // Dropdown/select field
        name: "documentCategory_id",
        label: this.$t("strategicplan.documentCategory"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("strategicplan.Select"),
      },
      {
        section: this.$t("strategicplan.Main Details"),
        type: "options", // Dropdown/select field
        name: "document_id",
        label: this.$t("strategicplan.document"),
        options: this.documents ?? [],
        optionLabel: "name",
        col: 6,
        rules: "", // Validation: required selection
        description: this.$t("strategicplan.Select"),
      },
      {
        section: this.$t("strategicplan.Main Details"),
        type: "options", // Dropdown/select field
        name: "requirement_ids",
        label: this.$t("strategicplan.requirements"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("strategicplan.Select"),
        multiple: true,
      },
      {
        section: this.$t("strategicplan.Main Details"),
        name: "startDate",
        label: this.$t("strategicplan.startDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("strategicplan.Please enter start date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("strategicplan.Main Details"),
        name: "endDate",
        label: this.$t("strategicplan.endDate"),
        type: "date", // Text input field
        rules: "required", // Validation rule: required field
        description: this.$t("strategicplan.Please enter end date"),
        col: 6, // Column size in the form layout
      },
      {
        section: this.$t("strategicplan.Main Details"),
        name: "description",
        label: this.$t("strategicplan.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t(
          "strategicplan.Provide a description of the project"
        ),
        col: 12,
      },
      {
        section: this.$t("strategicplan.Main Details"),
        name: "content",
        label: this.$t("strategicplan.content"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("strategicplan.Provide a content of the project"),
        col: 12,
      },
      {
        section: this.$t("strategicplan.Context"),
        name: "vision",
        label: this.$t("strategicplan.vision"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("strategicplan.Provide a vision of the project"),
        col: 12,
      },
      {
        section: this.$t("strategicplan.Context"),
        name: "mission",
        label: this.$t("strategicplan.mission"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("strategicplan.Provide a mission of the project"),
        col: 12,
      },
      {
        section: this.$t("strategicplan.Context"),
        name: "message",
        label: this.$t("strategicplan.message"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("strategicplan.Provide a message of the project"),
        col: 12,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.newItem.created_by = Auth.USER?.id;
      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.newItem = {}; // Clear the current item data
    },
    processCode(code) {
      // Handle null, undefined, or empty values
      if (!code && code !== 0) {
        return "";
      }

      // Convert to string safely
      const codeString = String(code);

      // Remove only the first # if it exists
      const hashIndex = codeString.indexOf("#");
      if (hashIndex !== -1) {
        return (
          codeString.substring(0, hashIndex) +
          codeString.substring(hashIndex + 1)
        );
      }

      return codeString;
    },

    // Handle file change event
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newItem.file = file;
      }
    },

    // Extract filename from file path/URL
    getFileName(filePath) {
      if (!filePath) return "";
      // If it's a URL, extract the filename
      if (filePath.includes("/")) {
        return filePath.split("/").pop();
      }
      // If it's just a filename
      return filePath;
    },

    // Set the item data for editing
    async editItem(data) {
      // alert(JSON.stringify(data));
      this.newItem = data; // Set the current item to edit
      try {
        this.newItem.code = JSON.parse(this.newItem?.code || "{}")?.replace(
          /"/g,
          ""
        );
      } catch (error) {
        console.log(error);
      }

      if (
        this.newItem.requirement_ids.length > 0 &&
        this.newItem.requirement_ids[0] == null
      ) {
        this.newItem.requirement_ids = [];
      }
      // Handle file field - don't set it directly from data
      if (this.newItem.file) {
        this.newItem.originalFile = this.newItem.file;
        delete this.newItem.file;
      }

      // Set documentCategory_id (parent of workflow)
      if (this.newItem.document_id) {
        const document = await this.documentApi.show(this.newItem.document_id);
        this.newItem.documentCategory_id = document?.category_id;
        this.newItem.document_id = document?.id;
      }

      this.isFlipped = true; // Show the form for editing
    },

    toggleActiveStatus(item) {
      const response = this.api
        .activeDeactive(item.id)
        .then((response) => {
          this.api.poup(response, this.$t("strategicplan.Active and Deactive"));
          this.$refs.table.refreshTable(); // Refresh the table data
        })
        .catch((error) => {
          this.api.poup(
            {
              status: false,
              message: this.$t(
                "strategicplan.An error occurred while changing the status"
              ),
            },
            "Error"
          );
          this.$refs.table.refreshTable(); // Refresh the table data
        });
    },

    getStrategicPlanStatus(item) {
      const status = item.status;
      let label = "";
      let badgeClass = "";
      let iconClass = "";
      if (status == true) {
        label = "Active";
        badgeClass = "bg-success";
        iconClass = "fas fa-check";
      } else {
        label = "Deactive";
        badgeClass = "bg-danger";
        iconClass = "fas fa-close";
      }
      return `<span class="badge ${badgeClass}" style="display: inline-flex; align-items: center; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
          <i class="${iconClass} me-1"></i>${label}
          </span>`;
    },

    calculateDuration(start, end) {
      if (!start || !end) return "N/A";
      const startDate = new Date(start);
      const endDate = new Date(end);
      let years = endDate.getFullYear() - startDate.getFullYear();
      let months = endDate.getMonth() - startDate.getMonth();
      let days = endDate.getDate() - startDate.getDate();
      // Adjust months and years if the end day is less than the start day
      if (days < 0) {
        months -= 1;
        days += new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          0
        ).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      if (years > 0) {
        return years === 1 ? "1 year" : `${years} years`;
      } else if (months > 0) {
        return months === 1 ? "1 month" : `${months} months`;
      } else {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // Format the date as per your requirements
    },
    calculateObjectivesCount(item) {
      const uniqueObjectives = new Set();

      item.objectives.forEach((objective) => {
        uniqueObjectives.add(objective.id); // or objective.name if no ID
      });

      return uniqueObjectives.size;
    },

    calculateInitiativesCount(item) {
      const uniqueInitiatives = new Set();

      item.objectives.forEach((objective) => {
        objective.initiatives.forEach((initiative) => {
          uniqueInitiatives.add(initiative.id); // or initiative.name if no ID
        });
      });

      return uniqueInitiatives.size;
    },

    calculateProgramsCount(item) {
      const uniquePrograms = new Set();

      item.objectives.forEach((objective) => {
        objective.initiatives.forEach((initiative) => {
          initiative.programs.forEach((program) => {
            uniquePrograms.add(program.id); // or program.name if no ID
          });
        });
      });

      return uniquePrograms.size;
    },

    calculateProjectsCount(item) {
      const uniqueProjects = new Set();

      item.objectives.forEach((objective) => {
        objective.initiatives.forEach((initiative) => {
          // Projects directly under initiative
          if (initiative.projects) {
            initiative.projects.forEach((project) => {
              uniqueProjects.add(project.id);
            });
          }

          // Projects under programs
          if (initiative.programs) {
            initiative.programs.forEach((program) => {
              if (program.projects) {
                program.projects.forEach((project) => {
                  uniqueProjects.add(project.id);
                });
              }
            });
          }
        });
      });

      return uniqueProjects.size;
    },
  },
  watch: {
    async "newItem.documentCategory_id"(after) {
      const documentsResponse = await this.documentApi.getAll({
        filter: `category_id|${after}|=`,
        select: "id|name|category_id",
      });
      this.documents = documentsResponse;
      const documentIdOptionsField = this.fromFields.find(
        (field) => field.name === "document_id"
      );
      documentIdOptionsField.options = this.documents.map((document) => ({
        id: document.id,
        name: document.name,
      }));
    },
  },
};
</script>

<style scoped>
/* Scoped styles for the component */
</style>
