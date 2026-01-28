<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('physicalcourse.Awareness')"
    :mainSubPage="$t('physicalcourse.physicalcourse')" :subPage="$t('physicalcourse.courses')"
    :titlePage="$t('physicalcourse.courses')">
    <div v-permission:show v-permission:update v-permission:delete></div>

    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable ref="table" v-permission:show id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm">
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #Name="{ item }">
          <div class="d-flex align-items-center">
            <img v-if="item.cover_picture" :src="item.coverPicturePath" alt="Course Cover"
              class="course-thumbnail me-2" />
            <span>{{ item.name }}</span>
          </div>
        </template>

        <!-- Open Registration Toggle Button -->
        <template #open_registration="{ item }">
          <button :class="[
            'btn',
            'btn-sm',
            item.open_registration ? 'btn-success' : 'btn-secondary',
          ]" @click="toggleRegistration(item)" v-permission:toggleRegistration :disabled="item.course_complete">
            <i :class="item.open_registration ? 'fas fa-unlock' : 'fas fa-lock'"></i>
            {{
              item.open_registration
                ? $t("physicalcourse.open")
                : $t("physicalcourse.closed")
            }}
          </button>
        </template>

        <!-- Course Complete Status with Toggle -->
        <template #course_complete="{ item }">
          <div class="d-flex align-items-center">
            <span :class="[
              'badge',
              'me-2',
              item.course_complete ? 'bg-success' : 'bg-secondary',
            ]">
              {{
                item.course_complete
                  ? $t("physicalcourse.yes")
                  : $t("physicalcourse.no")
              }}
            </span>
            <button class="btn btn-sm btn-outline-primary" @click="toggleCompletion(item)"
              v-permission:toggleCompletion>
              <i :class="item.course_complete ? 'fas fa-undo' : 'fas fa-check'"></i>
            </button>
          </div>
        </template>

        <!-- Requests Button with Count -->
        <template #requests="{ item }">
          <div class="d-flex flex-column align-items-center">
            <button :class="['btn', 'btn-sm', 'btn-warning', 'mb-1']" @click="viewRequests(item)"
              v-permission:viewCourseRequests>
              <i class="fas fa-users"></i>
              {{ getPendingRequestsCount(item) }}
              {{ $t("physicalcourse.pending") }}
            </button>
            <small class="text-muted">
              {{ getApprovedRequestsCount(item) }}
              {{ $t("physicalcourse.approved") }}
            </small>
          </div>
        </template>

        <!-- Registered Count -->
        <template #registered="{ item }">
          <span class="badge bg-primary">
            {{ getRegisteredCount(item) }} / {{ item.max_seats }}
          </span>
        </template>

        <!-- Available Seats -->
        <template #available_seats="{ item }">
          <span :class="[
            'badge',
            getAvailableSeats(item) > 0 ? 'bg-success' : 'bg-danger',
          ]">
            {{ getAvailableSeats(item) }}
          </span>
        </template>

        <!-- Next Session -->
        <template #next_session="{ item }">
          <div v-if="getNextSession(item)">
            <small class="text-primary">
              <i class="fas fa-calendar"></i>
              {{ formatDate(getNextSession(item).session_date) }}
            </small>
            <br />
            <small class="text-info">
              <i class="fas fa-clock"></i>
              {{ getNextSession(item).session_time }}
            </small>
          </div>
          <span v-else class="text-muted">
            <i class="fas fa-calendar-times"></i>
            {{ $t("physicalcourse.noUpcoming") }}
          </span>
        </template>

        <!-- Sessions Count -->
        <template #sessions_count="{ item }">
          <span class="badge bg-info">
            {{ item.schedules ? item.schedules.length : 0 }}
            {{ $t("physicalcourse.sessions") }}
          </span>
        </template>

        <!-- Materials Count -->
        <template #materials_count="{ item }">
          <span class="badge bg-secondary">
            {{ item.materials ? item.materials.length : 0 }}
            {{ $t("physicalcourse.materials") }}
          </span>
        </template>

        <!-- Attendance Management Button -->
        <template #attendance="{ item }">
          <button class="btn btn-sm btn-primary" @click="manageAttendance(item)"
            :disabled="!item.schedules || item.schedules.length === 0" v-permission:getCourseAttendance>
            <i class="fas fa-check-circle"></i>
            {{ $t("physicalcourse.manage") }}
          </button>
        </template>

        <!-- Grades Management Button -->
        <template #grades="{ item }">
          <button class="btn btn-sm btn-success" @click="manageGrades(item)"
            :disabled="getApprovedRequestsCount(item) === 0" v-permission:getCourseGrades>
            <i class="fas fa-graduation-cap"></i>
            {{ $t("physicalcourse.grades") }}
          </button>
        </template>

        <template #addAction="{ item }">
          <li v-permission:getCourseStatistic>
            <!-- Approve Button -->
            <a @click="getCourseStatistic(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="fas fa-chart-bar"></i>
              {{ $t("physicalcourse.statistics") }}
            </a>
          </li>

          <li>
            <!-- Certificates Button -->
            <a @click="getCourseCertificates(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="fas fa-certificate"></i>
              {{ $t("physicalcourse.certificates") }}
            </a>
          </li>

          <li v-permission:getCourseSurvey>
            <!-- Approve Button -->
            <a @click="getCourseSurvey(item)" class="dropdown-item text-secondary" href="javascript:void(0)">
              <i class="fas fa-chart-bar"></i>
              {{ $t("physicalcourse.survey") }}
            </a>
          </li>
        </template>
      </DataTable>
    </template>

    <!-- Slot for rendering the form -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"
        @submit="handleFormSubmit">
        <!-- Instructors Selection -->
        <template #user_ids="{ item }">
          <div class="col-md-6 mb-3">
            <label for="instructors" class="form-label required">
              {{ $t("physicalcourse.instructors") }}
            </label>
            <!-- <v-select
              v-model="newItem.user_ids"
              :options="usersData"
              :reduce="(option) => option.id"
              :placeholder="$t('physicalcourse.SelectInstructor')"
              label="full_name"
              multiple
              :class="{ 'is-invalid': validationErrors.user_ids }"
            >
            </v-select> -->

            <UserSelect v-model="newItem.user_ids" :multiple="true"
              :placeholder="$t('physicalcourse.SelectInstructor')" />
            <div v-if="validationErrors.user_ids" class="invalid-feedback">
              {{ validationErrors.user_ids[0] }}
            </div>
          </div>
        </template>

        <!-- Certificate Template Selection -->
        <template #certificate_template_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="certificate_template_id" class="form-label required">
              {{ $t("physicalcourse.certificate_template_id") }}
            </label>
            <!-- <v-select v-model="newItem.certificate_template_id" :options="certificatesData"
              :reduce="(option) => option.id" :placeholder="$t('physicalcourse.SelectCertificateTemplate')" label="name"
              :class="{
                'is-invalid': validationErrors.certificate_template_id,
              }">
            </v-select> -->

            <LazySelectField name="certificate_template_id" options="CertifiateTemplete" v-model="newItem.certificate_template_id"
              :placeholder="$t('physicalcourse.SelectCertificateTemplate')" option-label="name"
              option-value="id" />

            <div v-if="validationErrors.certificate_template_id" class="invalid-feedback">
              {{ validationErrors.certificate_template_id[0] }}
            </div>
          </div>
        </template>

        <!-- Survey Selection -->
        <template #survey_id="{ item }">
          <div class="col-md-6 mb-3">
            <label for="survey_id" class="form-label required">
              {{ $t("physicalcourse.survey_id") }}
            </label>
            <!-- <v-select v-model="newItem.survey_id" :options="surveysData" :reduce="(option) => option.id"
              :placeholder="$t('physicalcourse.survey')" label="name"
              :class="{ 'is-invalid': validationErrors.survey_id }">
            </v-select> -->

            <LazySelectField name="survey_id" options="Survey" v-model="newItem.survey_id"
              :placeholder="$t('physicalcourse.survey')" option-label="name" option-value="id" />

            <div v-if="validationErrors.survey_id" class="invalid-feedback">
              {{ validationErrors.survey_id[0] }}
            </div>
          </div>
        </template>

        <!-- Sessions Management Section -->
        <template #sessions="{ item }">
          <div class="col-md-12 mb-3">
            <div class="row">
              <div class="col-md-10">
                <label class="form-label required">{{
                  $t("physicalcourse.sessions")
                }}</label>
              </div>
              <div class="col-md-2 text-end">
                <button type="button" class="btn btn-success btn-sm" @click="addSession">
                  <i class="fas fa-plus"></i>
                  {{ $t("physicalcourse.addSession") }}
                </button>
              </div>
            </div>

            <!-- Sessions List -->
            <div class="mt-3">
              <div v-for="(session, index) in newItem.schedules" :key="index" class="card mb-3 session-card">
                <div class="card-body">
                  <div class="row align-items-center">
                    <div class="col-md-1">
                      <span class="badge bg-primary">{{ index + 1 }}</span>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label small">{{
                        $t("physicalcourse.sessionDate")
                      }}</label>
                      <input type="date" class="form-control form-control-sm" v-model="session.date"
                        :min="getTodayDate()" :class="{
                          'is-invalid': getSessionValidationError(
                            index,
                            'date'
                          ),
                        }" required />
                      <div v-if="getSessionValidationError(index, 'date')" class="invalid-feedback">
                        {{ getSessionValidationError(index, "date") }}
                      </div>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label small">{{
                        $t("physicalcourse.sessionTime")
                      }}</label>
                      <input type="time" class="form-control form-control-sm" v-model="session.time" :class="{
                        'is-invalid': getSessionValidationError(
                          index,
                          'time'
                        ),
                      }" required />
                      <div v-if="getSessionValidationError(index, 'time')" class="invalid-feedback">
                        {{ getSessionValidationError(index, "time") }}
                      </div>
                    </div>
                    <div class="col-md-3 text-end">
                      <!-- Cannot delete first session (index 0) -->
                      <button v-if="index > 0" type="button" class="btn btn-danger btn-sm"
                        @click="removeSession(index)">
                        <i class="fas fa-trash"></i>
                        {{ $t("physicalcourse.remove") }}
                      </button>
                      <span v-else class="badge bg-secondary">
                        {{ $t("physicalcourse.mainSession") }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="validationErrors.schedules" class="text-danger mt-2">
              {{ validationErrors.schedules[0] }}
            </div>
          </div>
        </template>

        <!-- Cover Image Upload -->

        <template #cover_picture="{ item }">
          <div class="col-md-6 mb-3">
            <label for="cover_image" class="form-label">{{
              $t("physicalcourse.cover_image")
            }}</label>
            <input type="file" class="form-control" @change="handleFileUpload($event, 'cover_picture')" accept="image/*"
              :class="{ 'is-invalid': validationErrors.cover_picture }" />
            <div v-if="validationErrors.cover_picture" class="invalid-feedback">
              {{ validationErrors.cover_picture[0] }}
            </div>
            <small class="form-text text-muted">
              {{ $t("physicalcourse.coverImageHint") }}
            </small>
          </div>
        </template>

        <template #coverPicturePath="{ item }">
          <div class="col-md-6 mb-3">
            <!-- Preview existing cover image -->
            <div v-if="
              newItem.coverPicturePath &&
              typeof newItem.coverPicturePath === 'string'
            " class="mt-2">
              <img :src="newItem.coverPicturePath" alt="Current Cover" class="img-thumbnail" style="max-width: 200px" />
              <p class="small text-muted">
                {{ $t("physicalcourse.currentImage") }}
              </p>
            </div>
          </div>
        </template>

        <!-- Course Materials Upload -->
        <template #materials="{ item }">
          <div class="col-md-6 mb-3">
            <label for="course_materials" class="form-label">{{
              $t("physicalcourse.course_materials")
            }}</label>
            <input type="file" class="form-control" @change="handleFileUpload($event, 'materials')" multiple
              accept=".pdf,.doc,.docx,.pptx,.zip,.jpg,.png,.jpeg"
              :class="{ 'is-invalid': validationErrors.materials }" />
            <div v-if="validationErrors.materials" class="invalid-feedback">
              {{ validationErrors.materials[0] }}
            </div>
            <small class="form-text text-muted">
              {{ $t("physicalcourse.materialsHint") }}
            </small>
          </div>
        </template>

        <template #materialsData="{ item }">
          <div class="col-md-6 mb-3">
            <!-- Show existing materials -->
            <div v-if="getExistingMaterials().length > 0" class="mt-2">
              <div class="existing-materials">
                <h6>{{ $t("physicalcourse.existingMaterials") }}:</h6>
                <div v-for="(material, index) in getExistingMaterials()" :key="index"
                  class="d-flex align-items-center justify-content-between mb-1 p-2 border rounded">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-file me-2"></i>
                    <a target="_blank" :href="material.materialFilePath" class="small">{{ material.file_name }}</a>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-danger" @click="removeExistingMaterial(index)"
                    v-if="isEditing">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>
</template>

<script>
// Importing necessary components and API modules
import physicalcourse from "@/API/PhysicalCourse/PhysicalCourse";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import User from "@/API/User/User";
import CertifiateTemplete from "@/API/CertifiateTemplete/CertifiateTemplete";
import Survey from "@/API/Survey/Survey";
import vSelect from "vue-select";
import UserSelect from "@/components/UserSelect.vue";
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    vSelect,
    UserSelect,
    LazySelectField,
  },

  setup() {
    const api = new physicalcourse();
    const userApi = new User();
    const certificateApi = new CertifiateTemplete();
    const surveyApi = new Survey();

    const apiParams = {
      with: ["schedules", "materials", "requests", "grades"],
    };

    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      userApi,
      certificateApi,
      surveyApi,
    };
  },

  async mounted() {
    // await this.loadSelectsData();
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {
        schedules: [], // Initialize schedules array
      },
      usersData: [],
      certificatesData: [],
      surveysData: [],
      permissions: [], // Add permissions array
      validationErrors: {}, // Track validation errors
      isEditing: false, // Track if we're editing
    };
  },

  created() {
    // Initialize the table columns
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("physicalcourse.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "open_registration",
        title: this.$t("physicalcourse.open_registration"),
        data: "open_registration",
        defaultContent: "N/A",
      },
      {
        id: "course_complete",
        title: this.$t("physicalcourse.course_complete"),
        data: "course_complete",
        defaultContent: "N/A",
      },
      {
        id: "passing_grade",
        title: this.$t("physicalcourse.passing_grade"),
        data: "passing_grade",
        defaultContent: "N/A",
      },
      {
        id: "requests",
        title: this.$t("physicalcourse.requests"),
        data: "requests",
        defaultContent: "N/A",
      },
      {
        id: "registered",
        title: this.$t("physicalcourse.registered"),
        data: "registered",
        defaultContent: "N/A",
      },
      {
        id: "available_seats",
        title: this.$t("physicalcourse.available_seats"),
        data: "available_seats",
        defaultContent: "N/A",
      },
      {
        id: "next_session",
        title: this.$t("physicalcourse.next_session"),
        data: "next_session",
        defaultContent: "N/A",
      },
      {
        id: "sessions_count",
        title: this.$t("physicalcourse.sessions_count"),
        data: "sessions_count",
        defaultContent: "N/A",
      },
      {
        id: "materials_count",
        title: this.$t("physicalcourse.materials_count"),
        data: "materials_count",
        defaultContent: "N/A",
      },
      {
        id: "attendance",
        title: this.$t("physicalcourse.attendance"),
        data: "attendance",
        defaultContent: "N/A",
      },
      {
        id: "grades",
        title: this.$t("physicalcourse.grades"),
        data: "grades",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema
    this.fromFields = [
      {
        name: "name",
        label: this.$t("physicalcourse.name"),
        type: "text",
        rules: "required",
        description: "Please enter course name.",
        col: 4,
      },
      {
        name: "max_seats",
        label: this.$t("physicalcourse.max_seats"),
        type: "number",
        rules: "required",
        description: "Please enter maximum seats.",
        col: 4,
      },
      {
        name: "passing_grade",
        label: this.$t("physicalcourse.passing_grade"),
        type: "number",
        rules: "required|number",
        description: "Enter the passing grade percentage.",
        col: 4,
      },
      {
        name: "description",
        label: this.$t("physicalcourse.description"),
        type: "textarea",
        rules: "required",
        description: "Provide a description of the course.",
        col: 12,
      },
      {
        name: "grade",
        label: this.$t("physicalcourse.grade"),
        type: "number",
        rules: "required|number",
        description: "Enter the maximum grade for the course.",
        col: 6,
      },
      {
        name: "certificate_template_id",
        label: this.$t("physicalcourse.certificate_template_id"),
        type: "options",
        rules: "required",
        description: "Select the certificate template for the course.",
        col: 6,
        options: [],
        optionLabel: "name",
      },
      {
        name: "user_ids",
        label: this.$t("physicalcourse.instructors"),
        type: "options",
        rules: "required",
        description: "Select the instructors for the course.",
        col: 6,
        multiple: true,
        options: [],
        optionLabel: "name",
      },
      {
        name: "survey_id",
        label: this.$t("physicalcourse.survey_id"),
        type: "options",
        rules: "required",
        description: "Select the survey associated with the course.",
        col: 6,
        options: [],
        optionLabel: "name",
      },
      {
        name: "cover_picture",
        label: this.$t("physicalcourse.cover_image"),
        type: "file",
        rules: "",
        description: "Upload a cover image for the course.",
        col: 6,
      },
      {
        name: "materials",
        label: this.$t("physicalcourse.course_materials"),
        type: "file",
        rules: "",
        multiple: true,
        description: "Upload course materials.",
        col: 6,
      },

      {
        name: "coverPicturePath",
        label: this.$t("physicalcourse.course_materials"),
        type: "file",
        rules: "",
        multiple: true,
        description: "Upload course materials.",
        col: 6,
      },

      {
        name: "materialsData",
        label: this.$t("physicalcourse.course_materials"),
        type: "file",
        rules: "",
        multiple: true,
        description: "Upload course materials.",
        col: 6,
      },

      {
        name: "sessions",
        label: this.$t("physicalcourse.sessions"),
        type: "custom",
        description: "Manage course sessions.",
        col: 12,
      },
    ];
  },

  methods: {
    // Open the form for adding or editing an item
    openForm() {
      this.initializeNewItem();
      this.isEditing = false;
      this.clearValidationErrors();
      this.isFlipped = true;
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.resetNewItem();
      this.clearValidationErrors();
    },

    // Set the item data for editing - FIXED VERSION
    editItem(data) {
      console.log("Original data for editing:", data);

      // Clone the data to avoid reference issues
      this.newItem = {
        ...data,
        // Fix schedules mapping - ensure correct field names
        schedules: data.schedules
          ? data.schedules.map((schedule) => ({
            // Map database fields to form fields
            date: schedule.session_date || schedule.date || "",
            time: schedule.session_time || schedule.time || "",
            // Keep original data for reference
            id: schedule.id,
            session_date: schedule.session_date,
            session_time: schedule.session_time,
          }))
          : [],

        // Fix user_ids mapping from instructors relationship
        // user_ids: data.instructors ? data.instructors.map(instructor => instructor.id) :
        //   (data.user_ids || []),
        user_ids: data.user_ids || [],

        // Keep existing materials reference
        existing_materials: data.materials ? [...data.materials] : [],
        materials: null, // Reset file input for new uploads
        hasNewMaterials: false,
      };

      console.log("Processed schedules:", this.newItem.schedules);
      console.log("Processed user_ids:", this.newItem.user_ids);
      console.log("Existing materials:", this.newItem.existing_materials);

      // Ensure schedules exist and have at least one session
      if (!this.newItem.schedules || this.newItem.schedules.length === 0) {
        this.initializeFirstSession();
      }

      this.isEditing = true;
      this.clearValidationErrors();
      this.isFlipped = true;
    },

    // Initialize new item with default first session
    initializeNewItem() {
      this.newItem = {
        name: "",
        description: "",
        max_seats: "",
        passing_grade: "",
        grade: "",
        certificate_template_id: null,
        survey_id: null,
        user_ids: [],
        schedules: [],
        cover_picture: null,
        materials: [],
        existing_materials: [],
      };
      this.initializeFirstSession();
    },

    // Reset new item
    resetNewItem() {
      this.newItem = {
        schedules: [],
        existing_materials: [],
      };
      this.isEditing = false;
    },

    // Initialize the first session (cannot be deleted)
    initializeFirstSession() {
      if (!this.newItem.schedules) {
        this.newItem.schedules = [];
      }
      if (this.newItem.schedules.length === 0) {
        this.newItem.schedules.push({
          date: "",
          time: "",
        });
      }
    },

    // Add a new session
    addSession() {
      if (!this.newItem.schedules) {
        this.newItem.schedules = [];
      }
      this.newItem.schedules.push({
        date: "",
        time: "",
      });
    },

    // Remove a session (except the first one)
    removeSession(index) {
      if (index > 0 && this.newItem.schedules.length > 1) {
        this.newItem.schedules.splice(index, 1);
      }
    },

    // Remove existing material
    removeExistingMaterial(index) {
      if (
        this.newItem.existing_materials &&
        this.newItem.existing_materials.length > index
      ) {
        this.newItem.existing_materials.splice(index, 1);
      }
    },

    // Get today's date in YYYY-MM-DD format
    getTodayDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },

    // Handle file uploads
    handleFileUpload(event, fieldName) {
      const files = event.target.files;
      if (fieldName === "materials") {
        this.newItem[fieldName] = Array.from(files);
        this.newItem.hasNewMaterials = files.length > 0;
      } else {
        this.newItem[fieldName] = files[0];
      }

      // Clear validation error for this field
      if (this.validationErrors[fieldName]) {
        delete this.validationErrors[fieldName];
      }
    },

    // Handle form submission with validation
    async handleFormSubmit() {
      try {
        this.clearValidationErrors();

        // Transform schedules data back to API format before submission
        if (this.newItem.schedules) {
          this.newItem.schedules = this.newItem.schedules.map((schedule) => ({
            session_date: schedule.date,
            session_time: schedule.time,
            id: schedule.id, // Include ID if editing existing schedule
          }));
        }

        if (this.isEditing && !this.newItem.hasNewMaterials) {
          // Remove materials from submission to preserve existing ones
          delete this.newItem.materials;
        }

        // The Form component will handle the actual submission
        // We just need to prepare the data properly
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          this.validationErrors = error.response.data.errors;
        }
        throw error;
      }
    },

    // Clear validation errors
    clearValidationErrors() {
      this.validationErrors = {};
    },

    // Get session validation error
    getSessionValidationError(index, field) {
      const errorKey = `schedules.${index}.${field}`;
      return this.validationErrors[errorKey]
        ? this.validationErrors[errorKey][0]
        : null;
    },

    // Load select data for dropdowns
    async loadSelectsData() {
      try {
        const usersResponse = await this.userApi.getAll({
          select: "id|full_name",
        });
        this.usersData = usersResponse;

        const certificatesResponse = await this.certificateApi.getAll({
          filter: "type|physical|=",
          select: "id|name",
        });
        this.certificatesData = certificatesResponse;

        const surveysResponse = await this.surveyApi.getAll({
          select: "id|name",
        });
        this.surveysData = surveysResponse;
      } catch (error) {
        console.error(this.$t("user.FailedLoadData"), error);
      }
    },

    // Toggle registration status
    async toggleRegistration(course) {
      try {
        const response = await this.api.toggleRegistration(course.id);
        this.api.poup(
          response,
          course.open_registration
            ? this.$t("physicalcourse.registrationClosed")
            : this.$t("physicalcourse.registrationOpened")
        );
        this.$refs.table.refreshTable();
      } catch (error) {
        this.api.poup(
          { status: false, message: error.message },
          this.$t("physicalcourse.toggleRegistrationError")
        );
        console.error("Toggle registration error:", error);
      }
    },

    // Toggle completion status
    async toggleCompletion(course) {
      try {
        const eligibleUsers = this.getEligibleUsers(course);
        const response = await this.api.toggleCompletion(course.id, eligibleUsers);
        this.api.poup(
          response,
          course.course_complete
            ? this.$t("physicalcourse.courseReopened")
            : this.$t("physicalcourse.courseCompleted")
        );
        this.$refs.table.refreshTable();
      } catch (error) {
        this.api.poup(
          { status: false, message: error.message },
          this.$t("physicalcourse.toggleCompletionError")
        );
        console.error("Toggle completion error:", error);
      }
    },

    getEligibleUsers(course) {
      const courseId = course.id;
      const passingGrade = course.passing_grade;

      const requests = course.requests || [];
      const grades = course.grades || [];

      // Step 1: Get users who have approved course requests
      const approvedUserIds = requests
        .filter((request) => request.status === "approved")
        .map((request) => request.user_id);

      // Step 2: Get users who have passed the grade
      const passedUserIds = grades
        .filter((g) => g.course_id === courseId && g.grade >= passingGrade)
        .map((g) => g.user_id);

      // Step 3: Eligible users = intersection of both conditions
      const eligibleUserIds = approvedUserIds.filter((id) =>
        passedUserIds.includes(id)
      );

      // Step 4: Return unique user objects (if available)
      const eligibleUsers = eligibleUserIds.map((userId) => {
        return {
          user_id: userId,
          request: requests.find((r) => r.user_id === userId),
          courseGrades: grades.find((g) => g.user_id === userId),
        };
      });

      return eligibleUsers;
    },
    // View course requests
    viewRequests(course) {
      this.$router.push({
        name: "PhysicalCourseRequests",
        params: { courseId: course.id },
      });
    },

    // Manage attendance
    manageAttendance(course) {
      this.$router.push({
        name: "PhysicalCourseAttendance",
        params: { courseId: course.id },
      });
    },

    // Manage Statistics
    getCourseStatistic(course) {
      this.$router.push({
        name: "PhysicalCourseStatistics",
        params: { courseId: course.id },
      });
    },

    // Manage course survey
    getCourseSurvey(course) {
      this.$router.push({
        name: "PhysicalCourseSurvey",
        params: { courseId: course.id },
      });
    },

    // Navigate to certificates page
    getCourseCertificates(course) {
      this.$router.push({
        name: "PhysicalCourseCertificates",
        params: { courseId: course.id },
      });
    },

    // Manage grades
    manageGrades(course) {
      this.$router.push({
        name: "PhysicalCourseGrades",
        params: { courseId: course.id },
      });
    },

    // Get pending requests count
    getPendingRequestsCount(course) {
      if (!course.requests) return 0;
      return course.requests.filter((request) => request.status === "pending")
        .length;
    },

    // Get approved requests count
    getApprovedRequestsCount(course) {
      if (!course.requests) return 0;
      return course.requests.filter((request) => request.status === "approved")
        .length;
    },

    // Get registered count
    getRegisteredCount(course) {
      return course.requests ? course.requests.length : 0;
    },

    // Get available seats
    getAvailableSeats(course) {
      const approvedRequests = this.getApprovedRequestsCount(course);
      return course.max_seats - approvedRequests;
    },

    // Get next session
    getNextSession(course) {
      if (!course.schedules || course.schedules.length === 0) return null;

      const now = new Date();
      const upcomingSessions = course.schedules.filter((session) => {
        const sessionDate = new Date(session.session_date);
        return sessionDate >= now;
      });

      if (upcomingSessions.length === 0) return null;

      return upcomingSessions.sort(
        (a, b) => new Date(a.session_date) - new Date(b.session_date)
      )[0];
    },

    // Format date for display
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.$i18n.locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    // Get existing materials - FIXED VERSION
    getExistingMaterials() {
      if (!this.newItem.existing_materials) {
        return [];
      }

      // Handle different material data structures
      return this.newItem.existing_materials.map((material) => {
        if (typeof material === "string") {
          return {
            file_name: material,
            original_name: material,
            materialFilePath: material.materialFilePath,
          };
        }

        if (typeof material === "object") {
          return {
            file_name: material.file_name || material.name || "Unknown file",
            original_name:
              material.original_name ||
              material.file_name ||
              material.name ||
              "Unknown file",
            id: material.id,
            path: material.path || material.file_path,
            materialFilePath: material.materialFilePath,
          };
        }

        return { file_name: "Unknown file", original_name: "Unknown file" };
      });
    },
  },

  watch: {
    // Watch for changes in newItem to ensure first session always exists
    "newItem.schedules": {
      handler(newSchedules) {
        if (!newSchedules || newSchedules.length === 0) {
          this.initializeFirstSession();
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.session-card {
  border-left: 4px solid #007bff;
  transition: all 0.3s ease;
}

.session-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.badge {
  font-size: 0.8em;
}

.form-label.small {
  font-size: 0.85em;
  margin-bottom: 0.25rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.text-end {
  text-align: right;
}

.instructors-wrapper .badge {
  margin-bottom: 2px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-muted {
  color: #6c757d !important;
}

.text-primary {
  color: #0d6efd !important;
}

.text-info {
  color: #0dcaf0 !important;
}

.existing-materials {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
}

.existing-materials h6 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.course-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
