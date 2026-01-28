<template>
  <div v-if="isLoading" class="loader-wrapper">
    <PurpleDotsLoader />
  </div>

  <div class="container" v-else>
    <div class="notification-tabs mt-4" v-permission:show>
      <h1 class="mb-4 mx-10 fw-bold main-title">
        {{ $t("notificationsetting.notification_settings") }}
      </h1>
      <!-- Tabs Header -->
      <TabsComponent
        :tabs="notificationTypes"
        :modelValue="activeTab"
        @update:modelValue="activeTab = $event"
        :showArrows="true"
        direction="ltr"
      />

      <!-- Tab Content -->
      <div class="tab-content">
        <div class="actions-list">
          <div
            v-for="item in filteredNotifications"
            :key="item.id"
            class="action-item"
          >
            <!-- Main content area -->
            <div class="action-main-content">
              <!-- Action Title Row -->
              <div class="action-title-row">
                <span class="action-name">{{ $t(`role.${item.action}`) }}</span>
              </div>

              <!-- Action Metadata Row -->
              <div class="action-metadata">
                <span class="metadata-item">
                  <svg
                    width="24"
                    height="12"
                    viewBox="0 0 13 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.6875 10C5.6875 10 4.875 10 4.875 9.16667C4.875 8.33333 5.6875 5.83333 8.9375 5.83333C12.1875 5.83333 13 8.33333 13 9.16667C13 10 12.1875 10 12.1875 10H5.6875ZM8.9375 5C9.58397 5 10.204 4.73661 10.6611 4.26777C11.1182 3.79893 11.375 3.16304 11.375 2.5C11.375 1.83696 11.1182 1.20107 10.6611 0.732233C10.204 0.263392 9.58397 0 8.9375 0C8.29103 0 7.67105 0.263392 7.21393 0.732233C6.75681 1.20107 6.5 1.83696 6.5 2.5C6.5 3.16304 6.75681 3.79893 7.21393 4.26777C7.67105 4.73661 8.29103 5 8.9375 5ZM4.238 10C4.11761 9.73983 4.05754 9.45461 4.0625 9.16667C4.0625 8.0375 4.615 6.875 5.6355 6.06667C5.12621 5.90536 4.59548 5.82664 4.0625 5.83333C0.8125 5.83333 0 8.33333 0 9.16667C0 10 0.8125 10 0.8125 10H4.238ZM3.65625 5C4.19497 5 4.71163 4.78051 5.09256 4.38981C5.47349 3.9991 5.6875 3.4692 5.6875 2.91667C5.6875 2.36413 5.47349 1.83423 5.09256 1.44353C4.71163 1.05283 4.19497 0.833333 3.65625 0.833333C3.11753 0.833333 2.60087 1.05283 2.21994 1.44353C1.83901 1.83423 1.625 2.36413 1.625 2.91667C1.625 3.4692 1.83901 3.9991 2.21994 4.38981C2.60087 4.78051 3.11753 5 3.65625 5Z"
                      fill="#404040"
                    />
                  </svg>

                  {{ item.related_users?.filter((r) => r != null).length || 0 }}
                  {{ $t("notificationsetting.related_users") }}
                </span>
                <span class="metadata-item">
                  <svg
                    width="24"
                    height="12"
                    viewBox="0 0 9 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.8125 10C0.8125 10 0 10 0 9.16667C0 8.33333 0.8125 5.83333 4.0625 5.83333C7.3125 5.83333 8.125 8.33333 8.125 9.16667C8.125 10 7.3125 10 7.3125 10H0.8125ZM4.0625 5C4.70897 5 5.32895 4.73661 5.78607 4.26777C6.24319 3.79893 6.5 3.16304 6.5 2.5C6.5 1.83696 6.24319 1.20107 5.78607 0.732233C5.32895 0.263392 4.70897 0 4.0625 0C3.41603 0 2.79605 0.263392 2.33893 0.732233C1.88181 1.20107 1.625 1.83696 1.625 2.5C1.625 3.16304 1.88181 3.79893 2.33893 4.26777C2.79605 4.73661 3.41603 5 4.0625 5Z"
                      fill="#404040"
                    />
                  </svg>
                  {{ item.users?.filter((r) => r != null).length || 0 }}
                  {{ $t("notificationsetting.users") }}
                </span>
                <span class="metadata-item">
                  <svg
                    width="24"
                    height="12"
                    viewBox="0 0 14 7"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.60156 0C5.85928 0 6.06836 0.209084 6.06836 0.466797C6.06834 0.724495 5.85926 0.933594 5.60156 0.933594H3.26758C2.64861 0.933594 2.05487 1.17953 1.61719 1.61719C1.1795 2.05488 0.933594 2.64859 0.933594 3.26758C0.933672 3.88646 1.17957 4.48035 1.61719 4.91797C1.83384 5.13453 2.09101 5.3066 2.37402 5.42383C2.65716 5.54109 2.96112 5.60156 3.26758 5.60156H5.60156C5.85914 5.60156 6.06813 5.80986 6.06836 6.06738C6.06836 6.3251 5.85928 6.53418 5.60156 6.53418H3.26758C2.83853 6.53418 2.41299 6.45032 2.0166 6.28613C1.62026 6.12194 1.26038 5.8805 0.957031 5.57715C0.344485 4.96452 7.80811e-05 4.1339 0 3.26758C-1.57336e-07 2.40108 0.344322 1.56974 0.957031 0.957031C1.56974 0.344349 2.4011 7.86663e-08 3.26758 0H5.60156ZM10.7324 0C11.5989 7.86681e-08 12.4303 0.344322 13.043 0.957031C13.6556 1.56973 14 2.40113 14 3.26758C13.9999 4.13383 13.6554 4.96454 13.043 5.57715C12.4303 6.18986 11.5989 6.53418 10.7324 6.53418H8.39844C8.14072 6.53418 7.93164 6.3251 7.93164 6.06738C7.93187 5.80986 8.14086 5.60156 8.39844 5.60156H10.7324C11.3513 5.60156 11.9451 5.35554 12.3828 4.91797C12.8204 4.48035 13.0663 3.88646 13.0664 3.26758C13.0664 2.64864 12.8204 2.05487 12.3828 1.61719C11.9451 1.1795 11.3514 0.933594 10.7324 0.933594H8.39844C8.14073 0.933594 7.93166 0.724495 7.93164 0.466797C7.93164 0.209084 8.14072 0 8.39844 0H10.7324ZM9.7998 2.79688C10.0575 2.79669 10.2663 3.00504 10.2666 3.2627C10.2668 3.52038 10.0585 3.72926 9.80078 3.72949L4.2041 3.73438C3.94639 3.73456 3.73749 3.52529 3.7373 3.26758C3.73714 3.00989 3.94543 2.80097 4.20312 2.80078L9.7998 2.79688Z"
                      fill="#333333"
                    />
                  </svg>
                  {{ item.roles?.filter((r) => r != null).length || 0 }}
                  {{ $t("notificationsetting.related_jobs") }}
                </span>
              </div>
            </div>

            <!-- Right-aligned controls -->
            <div class="action-controls">
              <span
                :class="[
                  'status-badge',
                  normalizeStatus(item.status) ? 'active' : 'inactive',
                ]"
              >
                {{
                  normalizeStatus(item.status)
                    ? $t("notificationsetting.active")
                    : $t("notificationsetting.inactive")
                }}
              </span>
              <button
                class="edit-icon-button"
                @click="openModal(item)"
                v-permission:update
                title="Edit"
              >
                <svg
                  width="24"
                  height="16"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5 10.86V14.5H4.1585L14.5 4.154L10.8475 0.5L0.5 10.86Z"
                    fill="black"
                    stroke="black"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ $t("notificationsetting.update_notification_settings") }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Section 1: Message Builder -->
          <div class="modal-section section-1">
            <h4 class="section-title">
              {{
                $t("notificationsetting.section_1_message_builder") ||
                "Section 1- Massage Builder"
              }}
            </h4>

            <!-- Subject field - Only visible for Email notifications -->
            <div
              v-if="activeTab === 'email'"
              class="form-group section-1-form-group"
            >
              <label class="section-1-label">{{
                $t("notificationsetting.subject")
              }}</label>
              <input
                type="text"
                v-model="formData.subject"
                class="section-1-input"
                placeholder="Email Subject"
              />
            </div>

            <!-- Notification Message -->
            <div class="form-group section-1-form-group">
              <label class="section-1-label">{{
                $t("notificationsetting.message")
              }}</label>
              <ckeditor
                :editor="editor"
                :config="editorConfig"
                v-model="formData.message"
                ref="ckeditor"
              ></ckeditor>
            </div>

            <!-- Dynamic Fields -->
            <label class="dynamic-fields-label">{{
              $t("notificationsetting.dynamic_fields") || "Dynamic Fields"
            }}</label>
            <div class="dynamic-fields-section">
              <div class="dynamic-fields-header">
                <p class="dynamic-fields-hint">
                  {{
                    $t("notificationsetting.click_any_field_to_info_message") ||
                    "Click Any Field To Info Message"
                  }}
                </p>
              </div>
              <div class="dynamic-fields-container">
                <button
                  type="button"
                  v-for="(field, index) in fields"
                  :key="index"
                  class="dynamic-field-button"
                  @click="addFillable(field.name)"
                >
                  {{ field.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Recipients -->
          <div class="modal-section">
            <h4 class="section-title">
              {{
                $t("notificationsetting.section_2_recipients") ||
                "Section 2- Recipients"
              }}
            </h4>

            <!-- Related Users -->
            <div class="form-group sub-section-container">
              <label class="sub-section-label">{{
                $t("notificationsetting.related_users")
              }}</label>
              <v-select
                v-model="formData.related_users"
                :options="availableRelatedUsers"
                multiple
                :reduce="(user) => user.value"
                label="name"
                class="style-chooser"
                placeholder="Select related users"
              />
            </div>

            <!-- User -->
            <div class="form-group sub-section-container">
              <label class="sub-section-label">{{
                $t("notificationsetting.user")
              }}</label>
              <UserSelect
                v-model="formData.users"
                :options="availableUsers"
                multiple
                :reduce="(user) => user.id"
                label="full_name"
                class="style-chooser"
                placeholder="Select users"
              />
            </div>

            <!-- Department & Job -->
            <div class="sub-section-container">
              <div class="form-group">
                <label class="section-label sub-section-label">{{
                  $t("notificationsetting.department_job") || "Department & Job"
                }}</label>

                <div class="department-job-row">
                  <div class="department-col">
                    <label
                      for="department_id"
                      class="form-label sub-section-label"
                      >{{ $t("notificationsetting.department") }}</label
                    >
                    <v-select
                      v-model="selectedDepartment"
                      :options="departments"
                      label="name"
                      :getOptionLabel="(option) => option.name || ''"
                      class="form-control p-0 small"
                      placeholder="Select a department"
                    />
                  </div>

                  <div class="job-col">
                    <label for="job_id" class="form-label sub-section-label">{{
                      $t("notificationsetting.job")
                    }}</label>
                    <v-select
                      v-model="selectedJob"
                      :options="availableJobs"
                      label="name"
                      :getOptionLabel="(option) => option.name"
                      class="form-control p-0 small"
                      placeholder="Select a job"
                    />
                  </div>

                  <div class="add-role-col">
                    <button
                      @click.prevent="addRole"
                      class="btn btn-add-role"
                      type="button"
                      title="Add"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                <div
                  class="no-role-alert"
                  v-if="
                    selectedJob &&
                    !availableRoles.some(
                      (role) =>
                        role.job_id === selectedJob.id &&
                        role.department_ids.includes(
                          selectedDepartment ? selectedDepartment.id : null,
                        ),
                    )
                  "
                >
                  <svg
                    width="24"
                    height="19"
                    viewBox="0 0 17 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.25 10.0985H8.25718M8.25 4.7954V7.44694M7.02249 1.38819L0.942395 10.7614C0.817037 10.9618 0.750708 11.1891 0.750006 11.4206C0.749304 11.6521 0.814254 11.8797 0.938394 12.0808C1.06253 12.282 1.24154 12.4495 1.45759 12.5669C1.67365 12.6843 1.91923 12.7475 2.1699 12.75H14.3301C14.5808 12.7475 14.8263 12.6843 15.0424 12.5669C15.2585 12.4495 15.4375 12.282 15.5616 12.0808C15.6857 11.8797 15.7507 11.6521 15.75 11.4206C15.7493 11.1891 15.683 10.9618 15.5576 10.7614L9.47751 1.38819C9.34954 1.19337 9.16935 1.0323 8.95434 0.920512C8.73933 0.808726 8.49675 0.75 8.25 0.75C8.00325 0.75 7.76067 0.808726 7.54566 0.920512C7.33065 1.0323 7.15046 1.19337 7.02249 1.38819Z"
                      stroke="#C4951B"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span
                    >This job has no assigned roles. Please select a job that
                    includes roles.</span
                  >
                </div>
              </div>

              <!-- Assigned Jobs -->
              <div class="form-group">
                <label class="sub-section-label">{{
                  $t("notificationsetting.assigned_jobs") || "Assigned Jobs"
                }}</label>
                <div class="assigned-jobs-container">
                  <div
                    v-for="role in formData.roles"
                    :key="role.id"
                    class="assigned-job-tag"
                  >
                    <span>{{ role.name }}</span>
                    <button
                      type="button"
                      class="remove-tag"
                      @click="
                        formData.roles = formData.roles.filter(
                          (r) => r.id !== role.id,
                        )
                      "
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Status -->
          <div class="modal-section">
            <h4 class="section-title">
              {{
                $t("notificationsetting.section_3_status") ||
                "Section 3- Status"
              }}
            </h4>

            <div class="form-group status-form-group">
              <label class="status-label">{{
                $t("notificationsetting.notifications_are_sent_when_enabled") ||
                "Notifications Are Sent When This Option Is Enabled."
              }}</label>
              <div class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="formData.status"
                  :id="'status-toggle'"
                />
                <label :for="'status-toggle'" class="toggle-label"></label>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" class="cancel-button" @click="closeModal">
              {{ $t("notificationsetting.cancel") }}
            </button>
            <button type="submit" class="submit-button">
              {{ $t("notificationsetting.save") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import notificationsetting from "@/API/NotificationSetting/NotificationSetting";
import User from "@/API/User/User";
import Role from "@/API/Role/Role";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Job from "@/API/Job/Job";
import Department from "@/API/Department/Department";
import UserSelect from "@/components/UserSelect.vue";
import LazySelectField from "@/components/LazySelectField.vue";
import TabsComponent from "@/components/TabsComponent.vue";
import modelConfig from "@/core/data/model_service_relation_map.json";
import PurpleDotsLoader from "@/components/PurpleDotsLoader.vue";
export default {
  name: "NotificationSettings",

  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    vSelect,
    UserSelect,
    LazySelectField,
    TabsComponent,
    PurpleDotsLoader,
  },

  props: {
    filterProp: {
      type: String,
      required: true,
    },
  },

  setup() {
    const api = new notificationsetting();
    const userApi = new User();
    const roleApi = new Role();
    const jobApi = new Job();
    const departmentApi = new Department();
    return {
      api,
      userApi,
      roleApi,
      jobApi,
      departmentApi,
    };
  },

  data() {
    return {
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      notifications: [],
      fields: [],
      activeTab: "system",
      notificationTypes: [
        {
          id: "system",
          label: this.$t("notificationsetting.system_notifications"),
        },
        {
          id: "email",
          label: this.$t("notificationsetting.email_notifications"),
        },
      ],
      isLoading: true,
      showModal: false,
      formData: {
        id: null,
        status: false,
        message: "",
        subject: "",
        users: [],
        related_users: [],
        roles: [],
        fillable: "",
      },
      availableUsers: [],
      availableRelatedUsers: [],
      availableRoles: [],
      jobs: [],
      availableJobs: [],
      departments: [],
      selectedJob: null,
      selectedDepartment: null,
      // Khaled
      excludedActions: [
        // base
        "getAll",
        "show",
        "importFileData",
        "exportAllToExcel",

        // other
        "getClassifications",
        "getDepartmentManagers",
        "refuseRequestAssessment",
        "getQuestionnaireData",
        "updatestatus",
      ],
    };
  },

  async mounted() {
    const response = await this.userApi.getAll();
    this.availableUsers = response;
    this.availableRoles = await this.roleApi.getAll({
      select: "id|name|job_id|department_ids",
    });
    this.jobs = await this.jobApi.getAll({ select: "id|name|department_ids" });
    this.departments = await this.departmentApi.getAll({ select: "id|name" });
    await this.fetchNotifications();
    await this.fetchModelFields();
  },

  computed: {
    // filteredNotifications() {
    //   this.notifications = this.notifications.filter((item) => item.action != 'getAll' && item.action != 'show');
    //   return this.notifications.filter((item) => item.type === this.activeTab);
    // },

    filteredNotifications() {
      return this.notifications.filter(
        (item) =>
          item.type === this.activeTab &&
          !this.excludedActions.includes(item.action),
      );
    },
  },

  watch: {
    selectedDepartment(newDept) {
      if (newDept && newDept.id) {
        this.availableJobs = this.jobs.filter((job) =>
          job?.department_ids?.includes(newDept.id),
        );
        this.selectedJob = null;
      } else {
        this.availableJobs = [];
        this.selectedJob = null;
      }
    },
    "formData.status"(newStatus) {
      if (newStatus === true && !this.formData.message?.trim()) {
        this.api.poup(
          null,
          this.$t("notificationsetting.please_enter_message_before_enabling"),
          "error",
        );

        // 🔥 FORCE it back to false
        this.$nextTick(() => {
          this.formData.status = false;
        });
      }
    },

    "formData.message"(newMessage) {
      if (!newMessage?.trim()) {
        this.formData.status = false;
      }
    },
  },

  methods: {
    addRole() {
      if (this.selectedJob && this.selectedDepartment) {
        const jobId = this.selectedJob.id;
        const departmentId = this.selectedDepartment.id;

        console.log("Job ID:", jobId);
        console.log("Department ID:", departmentId);

        let matchingRole = this.availableRoles.find(
          (role) =>
            role.job_id === jobId && role.department_ids.includes(departmentId),
        );

        if (
          matchingRole &&
          !this.formData.roles.some((r) => r.id === matchingRole.id)
        ) {
          this.formData.roles.push(matchingRole);
        }
      }
    },

    async fetchModelFields() {
      try {
        const modelName =
          this.filterProp.charAt(0).toUpperCase() + this.filterProp.slice(1);

        const module = await import(`@/API/${modelName}/${modelName}.ts`);
        const ApiClass = module.default;
        const instance = new ApiClass();
        const response = await instance.fetchModelField();
        const fields = Array.isArray(response) ? response : [];

        const currentModelConfig = modelConfig.Models[modelName];

        if (currentModelConfig && currentModelConfig.relations) {
          this.fields = fields.filter(
            (field) =>
              !currentModelConfig.relations.some(
                (relatedUser) => relatedUser.foreign_key === field.name,
              ),
          );

          const level1Relations = currentModelConfig.relations
            .filter(
              (relation) =>
                relation.model === "User" || relation.model === "Team",
            )
            .map((relation) => ({
              name: relation.display_name,
              value: relation.foreign_key,
            }));

          const level2Relations = [];

          currentModelConfig.relations.forEach((relation) => {
            if (relation.model === "User" || relation.model === "Team") {
              return;
            }

            const relatedModelConfig = modelConfig.Models[relation.model];

            if (relatedModelConfig && relatedModelConfig.relations) {
              relatedModelConfig.relations
                .filter(
                  (nestedRelation) =>
                    nestedRelation.model === "User" ||
                    nestedRelation.model === "Team",
                )
                .forEach((nestedRelation) => {
                  level2Relations.push({
                    name: `${relation.display_name} ${nestedRelation.display_name}`,
                    value: `${relation.name}:id|${nestedRelation.foreign_key}|${nestedRelation.model}`,
                  });
                });
            }
          });

          this.availableRelatedUsers = [...level1Relations, ...level2Relations];

          console.log("Available Related Users:", this.availableRelatedUsers);
        } else {
          this.availableRelatedUsers = [];
        }
      } catch (error) {
        this.error = "Failed to load model fields: " + error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchNotifications() {
      try {
        this.isLoading = true;
        console.log(this.filterProp, "Loading");

        const filterValue = this.filterProp
          ? `class|${
              this.filterProp.charAt(0).toUpperCase() + this.filterProp.slice(1)
            }`
          : "class|Default";
        console.log("Fetching notifications with filter:", filterValue);

        const response = await this.api.getAll({ filter: filterValue });
        this.notifications = response;
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        this.isLoading = false;
      }
    },

    openModal(item) {
      this.selectedDepartment = null;
      this.selectedJob = null;
      item.users = item?.users
        ? item?.users.map((userId) => userId).filter((userId) => userId != null)
        : [];

      item.related_users = item?.related_users
        ? item?.related_users.map((user) => user).filter((user) => user != null)
        : [];

      item.roles = item?.roles
        ? item?.roles.map((role) => role).filter((role) => role != null)
        : [];

      this.formData = {
        id: item.id,
        status: item.status,
        message: item.message || "",
        subject: item.subject || "",
        users: item.users || [],
        roles: item.roles || [],
        fillable: item.data || "",
        related_users: item.related_users || [],
      };
      console.log(this.formData, "Form data when opening modal");
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.formData = {
        id: null,
        status: false,
        message: "",
        subject: "",
        users: [],
        roles: [],
        fillable: "",
      };
    },

    async handleSubmit() {
      try {
        const message = this.formData.message;
        const matches = message.match(/{(.*?)}/g) || [];

        const mappedData = [
          ...new Set(
            matches.map((match) => {
              const key = match.replace(/[{}]/g, "");
              return key;
            }),
          ),
        ];

        const formDataToSubmit = {
          id: this.formData.id,
          status: this.formData.status,
          message: this.formData.message,
          fillable: mappedData,
          users: this.formData.users,
          roles: this.formData.roles,
          related_users: this.formData.related_users,
        };

        if (this.activeTab === "email") {
          formDataToSubmit.subject = this.formData.subject;
        }

        console.log(formDataToSubmit, "Submit data to server");

        const response = await this.api.from(formDataToSubmit);

        if (response) {
          await this.fetchNotifications();
          this.closeModal();
        }
      } catch (error) {
        console.error("Error updating notification:", error);
      }
    },

    normalizeStatus(status) {
      if (typeof status === "string") {
        return status.toLowerCase() === "true";
      }
      return status;
    },

    addFillable(fieldName) {
      const editor = this.$refs.ckeditor.instance;
      if (editor) {
        const selection = editor.model.document.selection;
        const currentPosition = selection.getLastPosition();
        const positionAtEnd = editor.model.createPositionAt(
          currentPosition.parent,
          "end",
        );
        editor.model.change((writer) => {
          const newPosition = writer.setSelection(positionAtEnd);
          editor.model.insertContent(writer.createText(" {" + fieldName + "}"));
        });
      } else {
        console.error("CKEditor instance is not available.");
      }
    },
  },

  async created() {
    // await this.fetchNotifications();
    // await this.fetchModelFields();
  },
};
</script>

<style>
.vs__selected,
.vs__dropdown-option,
.vs__search {
  font-size: 0.8rem;
}

.main-title {
  line-height: 2.25;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* Modal sections */
.modal-section {
  margin: 8px;
  padding: 12px;
  background-color: white;
  border-radius: 12px;
  margin-top: 0;
}

/* .modal-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
} */

.section-title {
  font-size: 26px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 1.5rem 0;
}

.section-label {
  font-weight: 600 !important;
  color: #000000 !important;
  font-size: 16px !important;
}

/* Section 1 Specific Styles */
.section-1 {
  margin-bottom: 2rem;
  /* padding-bottom: 0; */
  border-bottom: none;
}

.section-1-form-group {
  margin-bottom: 1.5rem;
}

.section-1-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #1e293b;
  font-size: 0.95rem;
}

.section-1-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
}

.section-1-input:focus {
  outline: none;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

.section-1-input::placeholder {
  color: #cbd5e1;
}

/* Dynamic Fields Section */
.dynamic-fields-section {
  background-color: #f7f7f8;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 1.25rem;
  margin-top: 0.5rem;
}

.dynamic-fields-header {
  margin-bottom: 0.25rem;
}

.dynamic-fields-label {
  display: block;
  font-weight: 500;
  color: #000000;
  /* margin-bottom: 0.5rem; */
  font-size: 1.25rem;
}

.dynamic-fields-hint {
  font-size: 0.85rem;
  color: #8c8c8c;
  margin: 0;
  font-weight: 400;
}

.dynamic-fields-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dynamic-field-button {
  padding: 6px 14px;
  background-color: white;
  color: #404040;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.dynamic-field-button:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dynamic-field-button:active {
  background-color: #e2e8f0;
}

/* CKEditor customization */
.ck-editor__editable {
  min-height: 200px !important;
  max-height: 300px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px !important;
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.ck-content {
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Base styles */
.notification-tabs {
  margin: 0.5rem auto;
  background-color: white;
  max-width: 95%;
  border-radius: 0.5rem;
  padding: 1rem;
}

/* Tabs header */
.tabs-header {
  display: flex;
  gap: 0;
  margin: 0;
  border-bottom: 0;
  flex-wrap: nowrap;
  background-color: #f8f8f8;
  border-radius: 0.5rem 0.5rem 0 0;
  overflow: hidden;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  border-bottom: none;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.tab-button.active {
  color: white;
  background-color: #7c3aed;
  border-bottom-color: transparent;
}

.tab-button:hover {
  background-color: #f0f0f0;
}

.tab-button.active:hover {
  background-color: #7c3aed;
}

.tab-button i {
  font-size: 1rem;
}

/* Tab Content */
.tab-content {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
}

.container {
  padding: 0.5rem;
  max-width: 95%;
  background-color: transparent !important;
  border-radius: 0.5rem;
}

/* Actions list */
.actions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Action item container - CENTERED VERTICALLY */
.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  background-color: #f7f7f8;
  transition: all 0.2s ease;
  gap: 1rem;
}

.action-item:hover {
  background-color: #f7f7f8;
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Main content area */
.action-main-content {
  flex: 1;
  min-width: 0;
}

/* Action title */
.action-title-row {
  margin-bottom: 0.25rem;
}

.action-name {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
}

/* Action metadata */
.action-metadata {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #404040;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
}

.metadata-item svg {
  flex-shrink: 0;
}

/* Right-aligned controls - SIMPLIFIED & CENTERED */
.action-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

/* Status badges */
.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-badge.active {
  background-color: #b6caae;
  color: #255f0b;
}

.status-badge.inactive {
  background-color: #e2b6b6;
  color: #a92525;
}

/* Edit button */
.edit-icon-button {
  padding: 0.5rem 0.65rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.375rem;
}

.edit-icon-button:hover {
  background-color: #f1f5f9;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: #f0f0f0;
  border-radius: 10px;
  width: 100%;
  min-width: 1000px;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  margin: auto;
}

.modal-header {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 4;
  background-color: #f0f0f0;
  color: #000000;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #1e293b;
}

.modal-body {
  padding: 1rem;
  background-color: #f0f0f0;
  overflow-y: auto; /* ADD THIS - enables scrolling */
  flex: 1; /* ADD THIS - allows it to grow and shrink */
  min-height: 0;
}

/* CKEditor customization */
.ck-editor__editable {
  min-height: 200px !important;
  max-height: 300px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px !important;
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.ck .ck-toolbar__items {
  border-radius: 12px !important;
}

/* Form styles */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: white;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

/* Department & Job Row */
.department-job-row {
  display: grid;
  grid-template-columns: 1fr 1fr 60px;
  gap: 12px;
  align-items: flex-end;
}

.department-col,
.job-col {
  width: 100%;
}

.add-role-col {
  display: flex;
  align-items: flex-end;
}

.btn-add-role {
  width: 100%;
  height: 100%;
  background-color: #6e3894;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease;
  font-size: 1.2rem;
}

.btn-add-role:hover {
  background-color: #6e3894;
  color: white;
}

/* Assigned Jobs Container */
.assigned-jobs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  padding: 8px;
  background-color: #F7F7F8;
  border-radius: 10px;
  border: 1px dashed #D9D9D9;
}

.assigned-job-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: #FFFFFF;
  /* border: 1px solid #cbd5e1; */
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #000000;
}

.assigned-job-tag .remove-tag {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-left: 4px;
  transition: color 0.2s ease;
}

.assigned-job-tag .remove-tag:hover {
  color: #e74c3c;
}

/* Status Form Group */
.status-form-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-radius: 12px;
  border: 1px solid #D9D9D9;
  padding: 12px;
}

.status-label,
.section-1-label,
.dynamic-fields-label {
  margin: 0;
  font-weight: 600 !important;
  color: #000000 !important;
  font-size: 20px !important;
  flex: 1;
}
.sub-section-label {
  font-weight: 600 !important;
  color: #000000 !important;
  font-size: 24px !important;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 50px;
  height: 35px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: background-color 0.3s ease;
  border-radius: 14px;
  border: 2px solid transparent;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 2px;
  top: 2px;
  background-color: white;
  transition: transform 0.3s ease;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input:checked + .toggle-label {
  background-color: #10b981;
}

input:checked + .toggle-label:before {
  transform: translateX(22px);
}

/* Modal footer */
.modal-footer {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f0f0f0;
  flex-shrink: 0;
  margin-right: 1.5rem;
  margin-left: 1.5rem;
}

.submit-button,
.cancel-button {
  padding: 0.5rem 0.9rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 100px;
}

.submit-button {
  background-color: #6e3894;
  color: white;
}

.cancel-button {
  background-color: white;
  color: #6e3894;
  border-color: #6e3894;
}

/* Responsive design */
@media (max-width: 768px) {
  .action-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-controls {
    width: 100%;
    justify-content: space-between;
  }

  .action-metadata {
    gap: 0.75rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

.sub-section-container {
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  padding: 12px;
}

.no-role-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #F3EAD1;
  border: 1px solid #C4951B;
  border-radius: 6px;
  padding: 8px;
  margin-top: 12px;
  font-size: 0.9rem;
  color: #C4951B;
}
</style>
