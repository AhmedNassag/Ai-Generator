<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="'assessment.assessment'"
    :subPage="'assessment.assessment'"
    :titlePage="'assessment.assessment'"
    v-permission:show
  >
    <div v-permission:update v-permission:destroy></div>
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
        <template #addAction="{ item }">
          <a
            href="javascript:void(0)"
            class="action-list-item"
            @click="sendAssessment(item)"
            title="Send Assessment"
            ><i
              class="fa-solid fa-paper-plane"
              style="margin-right: 11px !important "
            ></i>
            Send
          </a>
        </template>
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }">
                    <a
            v-permission:removeQuestionFromTemplate
            href="javascript:void(0)"
            @click="viewResults(item)"
            title="Send Assessment"
            >
          <span class="badge bg-info text-white m-1">
            {{ item.name }}
          </span>
          </a>
        </template>

        <template #template="{ item }">
          <span>
            {{ item?.template?.name }}
          </span>
        </template>

        <template #users="{ item }">
          <span v-if="getAssessmentUsers(item.user_ids) && getAssessmentUsers(item.user_ids).length > 0">
            <!-- Single user: display with avatar and name -->
            <div v-if="getAssessmentUsers(item.user_ids).length === 1" class="user-info">
              <div class="user-avatar-clickable" @click.prevent="openUserDetailsModal(getAssessmentUsers(item.user_ids)[0])">
                {{ getUserInitialsFromName(getAssessmentUsers(item.user_ids)[0].full_name || getAssessmentUsers(item.user_ids)[0].name || 'U') }}
              </div>
              <span class="user-fullname">{{ getAssessmentUsers(item.user_ids)[0].full_name || getAssessmentUsers(item.user_ids)[0].name }}</span>
            </div>

            <!-- Multiple users: use AvatarGroup -->
            <AvatarGroup
              v-else
              :users="getAssessmentUsers(item.user_ids).map(u => ({ ...u, full_name: u.full_name || u.name }))"
              :max-visible="2"
              :spacing="20"
              :clickable="true"
              empty-text="No users assigned"
              @user-click="openUserDetailsModal"
            />
          </span>

          <!-- Show message if no users -->
          <span v-else class="no-users-text">
            No users assigned
          </span>
        </template>

        <!-- Slot for risk status -->
        <template #risk_status="{ item }">
          <span v-if="item.has_converted_risks" class="badge text-bg-danger">
            Has Risk
          </span>
          <span v-else class="badge bg-success"> No Risk </span>
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
        <template #template_id="{ item }">
          <div class="col-md-6">
            <label for="template_id">{{ $t("assessment.template") }}</label>
            <LazySelectField
              name="template_id"
              v-model="newItem.template_id"
              :placeholder="$t('assessment.selecttemplate') || 'Select a template'"
              :options="templates"
              option-label="name"
              option-value="id"
              :on-update="onTemplateChange"
            />
          </div>
        </template>
        <template #required_questions="{ item }">
          <div class="col-md-12">
            <!-- Checkbox group with custom styling -->
            <div class="assessment-checkbox-group">
              <!-- All three checkboxes in one row -->
              <div class="assessment-checkbox-row">
                <!-- All Questions Required -->
                <div class="assessment-checkbox-item">
                  <label class="checkbox-container" for="allRequired">
                    <input
                      type="checkbox"
                      id="allRequired"
                      :checked="requiredQuestionsType === 'all'"
                      @change="handleCheckboxChange('all')"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-label">{{ $t("assessment.allquestionsrequired") }}</span>
                  </label>
                </div>

                <!-- Specific Questions Required -->
                <div class="assessment-checkbox-item">
                  <label class="checkbox-container" for="specific">
                    <input
                      type="checkbox"
                      id="specific"
                      :checked="requiredQuestionsType === 'specific'"
                      @change="handleCheckboxChange('specific')"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-label">{{ $t("assessment.specificquestionsrequired") }}</span>
                  </label>
                </div>

                <!-- Percentage -->
                <div class="assessment-checkbox-item">
                  <label class="checkbox-container" for="percentage">
                    <input
                      type="checkbox"
                      id="percentage"
                      :checked="requiredQuestionsType === 'percentage'"
                      @change="handleCheckboxChange('percentage')"
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-label">{{ $t("assessment.percentage") }}</span>
                  </label>
                </div>
              </div>

              <!-- Multi-select dropdown - shown only when specific is selected -->
              <div v-if="requiredQuestionsType === 'specific'" class="conditional-field-full mt-3">
                <label class="field-label">{{ $t("assessment.specificquestionsrequired") }}</label>
                <LazySelectField
                  name="question"
                  v-model="selectedQuestions"
                  :placeholder="$t('assessment.selectquestions') || 'Select Questions'"
                  :options="questionList"
                  option-label="question"
                  option-value="id"
                  multiple
                  :on-update="updateSelectedQuestions"
                />
              </div>

              <!-- Percentage input field - shown only when percentage is selected -->
              <div v-if="requiredQuestionsType === 'percentage'" class="conditional-field-full mt-3">
                <label class="field-label">{{ $t("assessment.percentage") }}</label>
                <input
                  type="number"
                  class="form-control percentage-input"
                  v-model="requiredPercentage"
                  min="1"
                  max="100"
                  @input="validatePercentage"
                  placeholder="Enter A Value Between 1% And 100%"
                />
              </div>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>
      <!-- Users Details Modal -->
    <transition name="modal-fade">
      <div
        v-if="showUsersModal"
        class="modal fade show"
        style="display: block; background-color: rgba(0, 0, 0, 0.5)"
        tabindex="-1"
        @click.self="closeUsersModal"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 800px">
          <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t("assessment.assessmentusers") }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeUsersModal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedAssessmentUsers.length === 0" class="text-center text-muted py-4">
              {{ $t("assessment.nousers") }}
            </div>
            <div v-else class="table-responsive">
              <table class="table table-striped table-hover" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
  <thead>
    <tr>
      <th>#</th>
      <th>{{ $t("assessment.name") }}</th>
      <th>{{ $t("assessment.email") }}</th>
      <th>{{ $t("assessment.job") }}</th>
      <th>{{ $t("assessment.status") }}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(user, index) in selectedAssessmentUsers" :key="user.id">
      <td>{{ index + 1 }}</td>
      <td>{{ user.full_name || user.username || 'N/A' }}</td>
      <td>{{ user.email || 'N/A' }}</td>
      <td>{{ user.job?.name || 'N/A' }}</td>
      <td>
        <span v-if="user.status" class="badge bg-success">Active</span>
        <span v-else class="badge bg-secondary">Inactive</span>
      </td>
    </tr>
  </tbody>
</table>
            </div>
          </div>
        </div>
      </div>
      </div>
    </transition>

    <!-- View User Details Modal -->
    <ViewUserDetails
      :viewUserModal="viewUserModal"
      :userData="userData"
      @close="viewUserModal = false"
      @update:viewUserModal="viewUserModal = $event"
    />
</template>

<script>
// Importing necessary components and API modules
import assessment from "@/API/Assessment/Assessment";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Template from "@/API/AssessmentTemplate/AssessmentTemplate";
import userApi from "@/API/User/User";
import questionApi from "@/API/Question/Question";
import VueSelect from "vue-select";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import departmentApi from "@/API/Department/Department";
import AvatarGroup from "@/components/AvatarGroup.vue";
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    "vue-select": VueSelect,
    ViewUserDetails,
    AvatarGroup,
    LazySelectField,
  },

  setup() {
    // Initialize API and other required properties
    const api = new assessment();
    const apiParams = { with: ["template"] };
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const templateApi = new Template();
    const usersList = new userApi();
    const question = new questionApi();
    const departmentsList = new departmentApi();

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      templateApi,
      usersList,
      question,
      departmentsList,
    };
  },

  async mounted() {
    await this.fetchTemplates();
    await this.fetchUsers();
    if (this.newItem.template_id) {
      await this.fetchQuestions(this.newItem.template_id);
    }
    // Add click handler for send button in mounted
    this.$nextTick(() => {
      const table = this.$refs.table;
      if (table && table.$el) {
        table.$el.addEventListener("click", (event) => {
          if (event.target && event.target.classList.contains("send-btn")) {
            const id = event.target.getAttribute("data-id");
            if (id) {
              this.sendAssessment({ id });
            }
          }
        });
      }
    });
    this.$refs.table.refreshTable()
  },

  data() {
    return {
      filteredQuestions: [],
      isFlipped: false,
      isReadonly: false,
      newItem: {
        question: null,
        required_questions: {
          type: null,
          percentage: null,
          specificQuestions: [],
        },
      },
      templates: [],
      users: [],
      userList: [],
      requiredQuestionsType: null,
      requiredPercentage: null,
      selectedQuestions: [],
      templateQuestions: [], // Will store questions from selected template
      questionList: [],
      showUsersModal: false, // To control users modal visibility
      selectedAssessmentUsers: [], // Users of the selected assessment
      viewUserModal: false, // To control individual user details modal
      userData: {}, // Data for individual user details
      departmentList: [], // List of departments for user details
    };
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        title: this.$t("assessment.name") || "Name",
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "template",
        title: this.$t("assessment.template") || "Template",
        data: "template.name",
        defaultContent: "N/A",
      },
      {
        id: "users",
        title: this.$t("assessment.users") || "Users",
        data: "users.count",
        defaultContent: "N/A",
      },
      {
        id: "risk_status",
        title: this.$t("assessment.risk_status") || "Risk Status",
        data: "risk_status",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("assessment.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        description: "Please enter the assessment name.",
        col: 12, // Column size in the form layout
      },
      {
        name: "instructions",
        label: this.$t("assessment.instructions"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        description: "Provide instructions for the assessment.",
        col: 12,
      },
      {
        name: "template_id",
        label: this.$t("assessment.template"),
        type: "options", // Dropdown/select field
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: "Select a template for the assessment.",
      },
      {
        type: "user-select", // Dropdown for user component
        name: "user_ids",
        label: this.$t("assessment.users"),
        options: [],
        multiple: true,
        optionLabel: "full_name",
        col: 6,
        rules: "required", // Validation: required selection
      },
      {
        name: "required_questions",
        label: this.$t("assessment.question"),
        type: "radio", // Text input field
        rules: "required", // Validation rule: required field
        description: "",
        col: 4,
      },
    ];
  },

  watch: {
    "newItem.template_id": function (newVal) {
      if (newVal) {
        this.fetchQuestions(newVal);
        // Reset selections when template changes
        // this.selectedQuestions = [];
        // this.requiredQuestionsType = null;
        // this.requiredPercentage = null;
        this.updateRequiredQuestionsInNewItem();
      }
    },

    selectedQuestions: {
      handler(newVal) {
        console.log("selectedQuestions changed:", newVal);
        this.updateRequiredQuestionsInNewItem();
      },
      deep: true,
    },
  },

  methods: {
    // Add sendAssessment method
    async sendAssessment(item) {
      await this.api.sendAssessment(item.id);
    },
    // View results for this assessment
    viewResults(item) {
      // Navigate to results page filtered by this assessment
      this.$router.push({
        path: "/assessments-results",
        query: { assessment_id: item.id },
      });
    },
    onTemplateChange() {
      this.fetchQuestions(this.newItem.template_id);
      this.selectedQuestions = []; // Clear the Specific Questions Required select input
      console.log("Template changed, selectedQuestions cleared");
      console.log("Template changed");
    },
    async fetchQuestions(templateId) {
      if (!templateId) return;

      // Construct the filter parameter for API call
      const filterParam = `assessment_template_ids|${templateId}`;

      // Fetch questions based on the template ID
      try {
        this.questionList = await this.question.getAll({
          select: "id|question",
          filterIn: filterParam,
        });
        console.log("Fetched questions:", this.questionList);
        // Strip HTML tags from each question
        this.questionList = this.questionList.map((question) => ({
          ...question,
          question: this.stripHtmlTags(question.question),
        }));

        console.log("Fetched questions:", this.questionList);

        // Update the form field options
        const questionField = this.fromFields.find(
          (field) => field.name === "question"
        );
        if (questionField) {
          questionField.options = this.questionList;
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    updateSelectedQuestions(event) {
      console.log("Select changed, new values:", this.selectedQuestions);
      this.updateRequiredQuestionsInNewItem();
    },

    updateRequiredQuestionsInNewItem() {
      // Ensure the required_questions object exists in newItem
      if (!this.newItem.required_questions) {
        this.newItem.required_questions = {};
      }

      // Update the newItem object with current values
      this.newItem.required_questions = {
        type: this.requiredQuestionsType,
        percentage: this.requiredPercentage,
        specificQuestions: [...this.selectedQuestions], // Create a new array to ensure reactivity
      };

      console.log(
        "Updated newItem.required_questions:",
        this.newItem.required_questions
      );
    },

    handleCheckboxChange(type) {
      // If clicking the same checkbox, uncheck it
      if (this.requiredQuestionsType === type) {
        this.requiredQuestionsType = null;
        this.requiredPercentage = null;
        this.selectedQuestions = [];
      } else {
        // If clicking a different checkbox, set it as active
        this.requiredQuestionsType = type;

        // Reset other values when type changes
        if (type !== "percentage") {
          this.requiredPercentage = null;
        }
        if (type !== "specific") {
          this.selectedQuestions = [];
        }
      }

      this.updateRequiredQuestionsInNewItem();
    },

    handleRequiredTypeChange() {
      // Reset other values when type changes
      if (this.requiredQuestionsType !== "percentage") {
        this.requiredPercentage = null;
      }
      if (this.requiredQuestionsType !== "specific") {
        this.selectedQuestions = [];
      }

      this.updateRequiredQuestionsInNewItem();
    },

    validatePercentage() {
      if (this.requiredPercentage) {
        this.requiredPercentage = Math.min(
          100,
          Math.max(1, this.requiredPercentage)
        );
        this.updateRequiredQuestionsInNewItem();
      }
    },

    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true; // Show the form
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      (this.selectedQuestions = []), (this.requiredQuestionsType = null);
      this.requiredPercentage = null;
      // Reset all form related state
      this.newItem = {
        name: null,
        required_questions: {
          type: null,
          percentage: null,
          specificQuestions: [],
        },
      };
    },

    // Extend the editItem method to handle required questions data
    editItem(data) {
      this.newItem = JSON.parse(JSON.stringify(data)); // Deep copy to avoid reference issues

      if (data.required_questions) {
        this.requiredQuestionsType = data.required_questions.type || null;
        this.requiredPercentage = data.required_questions.percentage || null;
        this.selectedQuestions = Array.isArray(
          data.required_questions.specificQuestions
        )
          ? [...data.required_questions.specificQuestions]
          : [];

        console.log(
          "Editing item, set selectedQuestions to:",
          this.selectedQuestions
        );
      } else {
        // Reset form values if no required_questions in data
        this.requiredQuestionsType = null;
        this.requiredPercentage = null;
        this.selectedQuestions = [];
      }

      // Make sure to fetch questions if we have a template_id
      if (data.template_id) {
        this.fetchQuestions(data.template_id);
      }

      this.isFlipped = true;
    },

    async fetchTemplates() {
      try {
        const response = await this.templateApi.getAll({ select: "id|name" });
        console.log("Fetched templates:", response);
        this.templates = response;

        const templateField = this.fromFields.find(
          (field) => field.name === "template_id"
        );
        if (templateField) {
          templateField.options = response;
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    },

    async fetchUsers() {
      try {
        const response = await this.usersList.getAll({
          select: "id|full_name|username|email|phone|type|department_id|status|job_id",
          with: ["job"],
        });
        console.log("Fetched users:", response);
        this.users = response;

        const userField = this.fromFields.find(
          (field) => field.name === "user_ids"
        );
        if (userField) {
          userField.options = response;
        }

        // Fetch departments for user details modal
        const deptResponse = await this.departmentsList.getAll({
          select: "id|name",
        });
        this.departmentList = deptResponse;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    // Get user initials for avatar display
    getUserInitials(userId) {
      const user = this.users.find((u) => u.id === userId);
      if (!user || !user.full_name) return "?!";

      const nameParts = user.full_name.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      // Get first letter of first name and first letter of last name
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    },

    // Get user full name for title
    getUserFullName(userId) {
      const user = this.users.find((u) => u.id === userId);
      return user?.full_name || user?.username || 'User';
    },

    // View assessment users - Open users modal
    viewAssessmentUsers(assessment) {
      console.log("View assessment users clicked for assessment:", assessment);
      console.log("Available users list:", this.users);
      console.log("User IDs from assessment:", assessment.user_ids);

      // Map user IDs to full user objects
      if (assessment.user_ids && assessment.user_ids.length > 0) {
        this.selectedAssessmentUsers = assessment.user_ids
          .map(userId => {
            console.log("Looking for user with ID:", userId);
            const user = this.users.find(u => u.id === userId);
            console.log("Found user:", user);
            return user;
          })
          .filter(user => user !== undefined); // Filter out any undefined users
      } else {
        this.selectedAssessmentUsers = [];
      }

      console.log("Selected assessment users:", this.selectedAssessmentUsers);
      console.log("Opening modal, showUsersModal:", this.showUsersModal);
      this.showUsersModal = true;
      console.log("Modal should be open now, showUsersModal:", this.showUsersModal);
    },

    // Close the users modal
    closeUsersModal() {
      this.showUsersModal = false;
      this.selectedAssessmentUsers = [];
    },

    // Open the individual user details modal (by userId - kept for backwards compatibility)
    openViewUserModal(userId) {
      const user = this.users.find((u) => u.id === userId);
      if (user) {
        this.openUserDetailsModal(user);
      }
    },

    // Open user details modal (by user object - matches Team.vue pattern)
    openUserDetailsModal(user) {
      if (!user) return;
      // Find department name
      const department = this.departmentList.find(
        (d) => d.id === user.department_id
      );
      this.userData = {
        full_name: user.full_name || user.username || "N/A",
        username: user.username || "N/A",
        type: user.type || "N/A",
        department: department?.name || "N/A",
        email: user.email || "N/A",
        phone: user.phone || "N/A",
      };
      this.viewUserModal = true;
    },

    // Get assessment users from user_ids array
    getAssessmentUsers(userIds) {
      if (!userIds || !Array.isArray(userIds)) return [];
      return userIds
        .map((userId) => this.users.find((u) => u.id === userId))
        .filter((user) => user !== undefined);
    },

    // Get user initials from full name string
    getUserInitialsFromName(fullName) {
      if (!fullName) return "U";
      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    },
  },
};
</script>

<style scoped>
.form-control {
  margin-top: 0.5rem;
}

.text-muted {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

/* Assessment Checkbox Styles */
.assessment-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  width: 100%;
}

.assessment-checkbox-row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.assessment-checkbox-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow flex items to shrink below content size */
}

/* Custom checkbox container */
.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
  margin-bottom: 0;
}

/* Hide the default checkbox */
.checkbox-container input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create custom checkbox */
.checkmark {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 22px;
  width: 22px;
  background-color: #fff;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  transition: all 0.2s ease;
}

/* On hover */
.checkbox-container:hover input ~ .checkmark {
  border-color: #6E3894;
}

/* When checked */
.checkbox-container input:checked ~ .checkmark {
  background-color: #6E3894;
  border-color: #6E3894;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.checkbox-container .checkmark:after {
  left: 6px;
  top: 2px;
  width: 6px;
  height: 11px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

/* Conditional fields styling */
.conditional-field {
  padding-left: 35px;
}

.conditional-field-full {
  width: 100%;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.percentage-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.percentage-input:focus {
  outline: none;
  border-color: #6E3894;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.percentage-input::placeholder {
  color: #9ca3af;
}

/* Vue-select custom styling */
.conditional-field .custom-select {
  width: 100%;
}

.conditional-field .custom-select :deep(.vs__dropdown-toggle) {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 10px;
  min-height: 42px;
}

.conditional-field .custom-select :deep(.vs__dropdown-toggle):focus-within {
  border-color: #6E3894;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.conditional-field .custom-select :deep(.vs__search::placeholder) {
  color: #9ca3af;
}

.conditional-field .custom-select :deep(.vs__selected) {
  background-color: #6E3894;
  color: white;
  border: none;
  padding: 3px 8px;
  margin: 2px;
  border-radius: 4px;
}

.conditional-field .custom-select :deep(.vs__deselect) {
  fill: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .assessment-checkbox-group {
    flex-direction: column;
    gap: 15px;
  }
}

/* Badge Styles */
.badge-custom {
  font-weight: 500;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  white-space: nowrap;
}

.badge-name {
  background-color: #e9d7fe;
  color: #7c3aed;
}

.badge-template {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Modal transition styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-active .modal-dialog,
.modal-fade-leave-active .modal-dialog {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-dialog,
.modal-fade-leave-to .modal-dialog {
  transform: translateY(-20px);
  opacity: 0;
}

.modal-fade-enter-to .modal-dialog,
.modal-fade-leave-from .modal-dialog {
  transform: translateY(0);
  opacity: 1;
}

/* Modal styles */
.modal {
  z-index: 1050;
}

.modal-dialog {
  max-width: 600px;
}

.modal-content {
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 80%;
  margin: auto;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

/* Center table headers and cells */
.modal-body table th,
.modal-body table td {
  text-align: center;
  vertical-align: middle;
}

/* User Avatars Container */
.user-avatars-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  transition: transform 0.2s ease-in-out;
}

.user-avatars-container:hover {
  transform: scale(1.05);
}

.avatars-group {
  display: flex;
  align-items: center;
  position: relative;
}

.bg-info {
  background-color: #d0b5e3 !important;
  color: #43235c !important;
  font-weight: 300 !important;
  padding: 8px;
  border-radius: 15px;
  font-size: 12px;
}

.text-bg-danger {
  background-color: #e2b6b6 !important;
  color: #a92525 !important;
  font-weight: 400 !important;
  padding: 8px;
  border-radius: 15px;
  font-size: 12px;
}

.bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
  font-weight: 400 !important;
  padding: 9px;
  border-radius: 15px;
  font-size: 12px;
}

/* Individual user avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.2s ease-in-out;
}

/* Generate different background colors for avatars */
.user-avatar:nth-child(1) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-avatar:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.user-avatar:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.user-avatar:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.user-avatar:nth-child(5) {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Count badge for +N users */
.user-count-avatar {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
  color: #333 !important;
  font-size: 10px;
  font-weight: 700;
}

/* Empty state avatar */
.user-empty-avatar {
  background: #e0e0e0 !important;
  color: #999 !important;
}

/* Hover effect for individual avatars */
.user-avatars-container:hover .user-avatar {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.avatar-chip {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  margin-right: 6px;
}
.avatar-plus {
  background: #e9ecef;
  color: #495057;
  border-radius: 14px;
  padding: 2px 8px;
  font-size: 12px;
}

/* Hover effect for individual avatars */
.user-avatars-container:hover .user-avatar {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Risk Status Badge Styles */
.badge-risk {
  font-weight: 500;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
}

.badge-has-risk {
  background-color: #fee2e2;
  color: #dc2626;
}

.badge-no-risk {
  background-color: #d1fae5;
  color: #059669;
}

/* User info styles for datatable - matches Team.vue pattern */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.user-avatar-clickable {
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-avatar-clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-users-text {
  color: #999;
  font-style: italic;
}

@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>
<style>
.custom-table th,
td {
  text-align: center !important;
}

.action-list-item {
  padding: 4px 15px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  border-radius: 0 !important;
  margin: 5px !important;
}

.action-list-item:hover {
  background-color: #f5f5f5 !important;
  border: 2px solid #6e3894 !important;
  border-radius: 10px !important;
}

.action-title {
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

/* Icon styling within menu items */
.action-list-item .action-icon {
  color: #6e3894 !important;
  margin-right: 12px !important;
}

.form-select{
  padding: 8px !important;
  /* border-radius: 7px !important; */
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
</style>
