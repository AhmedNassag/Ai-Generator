<template>
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="$t('requirement.governance')"
    :mainSubPage="$t('requirement.regulator')" :subPage="$t('requirement.requirement')"
    :titlePage="$t('requirement.requirement')" Regulator v-permission:show>
    <div v-permission:update v-permission:destroy></div>
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions" :filters="requirementFilters">
        <template #name="{ item }">
          <div class="table-cell-content">
            <div class="badge bg-info d-flex justify-content-center align-items-center">
              <a style="color: #6e3894; cursor: pointer" href="javascript:void(0)" @click="openDetailsModal(item)"
                :title="$t('requirement.view_requirement')">
                <template v-if="shouldTruncate(item.name)">
                  <span>{{ getTruncatedText(item.name) }}</span>
                  <button class="see-more-btn" @click.stop="showFullContent('Name', item.name)"
                    title="Click to see full name">
                    see more
                  </button>
                </template>
                <template v-else>
                  {{ stripHtmlTags(item.name) }}
                </template>
              </a>
            </div>
          </div>
        </template>
        <template #frameworks="{ item }">
          <div v-if="item.frameworks && item.frameworks.length"
            class="d-flex justify-content-center align-items-center">
            <span style="font-size: 13px; cursor: pointer" class="badge bg-info text-white m-1"
              @click="openFrameworksModal(item)" :title="'Click to view frameworks'">
              <span>
                {{ item.frameworks?.length }}
              </span>
            </span>
          </div>
          <div v-else class="d-flex justify-content-center align-items-center">
            <span class="text-muted" style="font-size: 12px">N/A</span>
          </div>
        </template>

        <template #controls="{ item }">
          <span v-if="item.control_id && item.control_id.length">
            <span style="font-size: 13px; cursor: pointer" class="badge bg-info text-white text-light m-1 rounded-pill"
              @click="openControlsModal(item)" :title="'Click to view controls'">{{ item.control_id.length }}</span>
          </span>
          <span v-else class="text-muted" style="font-size: 12px">{{
            $t("evidence.nocontrols")
          }}</span>
        </template>

        <template #controls_without_evidence="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            <span v-if="getUnlinkedControls(item).length > 0" class="badge text-bg-danger text-light m-1 rounded-pill"
              style="cursor: pointer; font-size: 13px" @click="openUnlinkedControlsModal(item)"
              :title="'Click to view controls without evidence'">
              {{ getUnlinkedControls(item).length }}
            </span>
            <span v-else class="text-muted" style="font-size: 12px">
              {{ $t("evidence.nocontrols") }}
            </span>
          </div>
        </template>

        <!-- <template #description="{ item }">
          <div v-html="item.description"></div>
        </template> -->

        <template #created_at="{ item }">
          <span>{{ formatDate(item.created_at) }}</span>
        </template>

        <template #responsible="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            <!-- For user or department_manager types, make clickable -->
            <div v-if="
              item.responsible_type === 'user' ||
              item.responsible_type === 'department_manager'
            " class="user-info">
              <div class="user-avatar-clickable" @click.prevent="
                openUserDetailsModal(
                  getResponsibleUserObject(item.responsible_type, item.responsible_id)
                )
                " :title="getResponsibleName(item.responsible_type, item.responsible_id)">
                {{
                  getUserInitials(
                    getResponsibleName(item.responsible_type, item.responsible_id)
                  )
                }}
              </div>
              <span class="user-fullname">
                {{ getResponsibleName(item.responsible_type, item.responsible_id) }}
              </span>
            </div>
            <!-- For team type, show without click -->
            <div v-else class="user-info">
              <span class="user-avatar" :title="getResponsibleName(item.responsible_type, item.responsible_id)">
                {{
                  getUserInitials(
                    getResponsibleName(item.responsible_type, item.responsible_id)
                  )
                }}
              </span>
              <span class="user-fullname">
                {{ getResponsibleName(item.responsible_type, item.responsible_id) }}
              </span>
            </div>
          </div>
        </template>

        <template #evidences="{ item }">
          <div>
            <template v-if="
              (item.responsible_type === 'user' &&
                item.responsible_id === loggedInUser.id) ||
              (item.responsible_type === 'team' &&
                loggedInUser.team_ids?.includes(item.responsible_id)) ||
              (item.responsible_type === 'department_manager' &&
                item.responsible_id === loggedInUser.id)
            ">
              <a v-permission:viewEvidences v-if="item?.evidences.length > 0" style="color: black"
                href="javascript:void(0)" @click="viewEvidences(item)" :title="$t('requirement.view_evidences')">
                <span style="font-size: 14px" class="badge bg-info text-white m-1 rounded-pill">
                  {{ item.evidences.length }}
                </span>
              </a>
              <span v-else class="text-muted" style="font-size: 12px">
                {{ $t("requirement.no_evidences") }}
              </span>
            </template>

            <template v-else>
              <span style="font-size: 14px" v-if="item?.evidences.length > 0"
                class="badge bg-info text-white m-1 rounded-pill">
                {{ item.evidences.length }}
              </span>
              <span v-else class="text-muted" style="font-size: 12px">
                {{ $t("requirement.no_evidences") }}
              </span>
            </template>
          </div>
        </template>
        <template #evidence_needed_to_approve="{ item }">
          <span class="text-muted" style="font-size: 12px"
            v-if="item?.evidences.length == 0 || getUnapprovedEvidences(item) == 0">
            {{ $t("requirement.no_evidences") }}
          </span>
          <span v-else style="font-size: 14px" class="badge text-bg-danger text-light m-1 rounded-pill">
            {{ getUnapprovedEvidences(item) }}
          </span>
        </template>

        <template #addAction="{ item }">
          <v-list-item v-anyPermission="['viewEvidences']" v-if="checkOwnership(item)" @click="viewEvidences(item)"
            class="action-list-item">
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("Evidences") }}
            </v-list-item-title>
          </v-list-item>
        </template>

        <template #responsible_type="{ item }">
          <span>{{ formatResponsibleType(item.responsible_type) }}</span>
        </template>

        <template #Active="{ item }">
          <div class="form-check form-switch d-flex justify-content-center align-items-center">
            <input class="form-check-input" type="checkbox" :checked="item.active === true || item.active === 'true'"
              @change="toggleActive(item)" style="width: 40px; height: 22px; cursor: pointer; margin: 0"
              :id="'switch-active-' + item.id" />
          </div>
        </template>
      </DataTable>
    </template>

    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"
        class="form-container">
        <template #framework_id="{ item }">
          <div class="framework-section">
            <div class="row">
              <div class="col-12 mb-3">
                <div class="form-group">
                  <label class="text-lg font-medium">{{
                    $t("requirement.frameworks")
                  }}</label>
                  <LazySelectField :name="'framework_id'" options="Frameworks" :multiple="true" optionLabel="title"
                    optionValue="id" :modelValue="selectedFrameworks" @update:modelValue="
                      selectedFrameworks = $event;
                    GetControls($event);
                    " :placeholder="$t('requirement.select_frameworks')" :selectable="(option) => !hasEvidences || !originalFrameworks.includes(option.id)
                      " :apiParams="{}" :perPage="10" />
                </div>
              </div>

              <div v-for="framework in selectedFrameworks" :key="framework" class="col-6 mb-3">
                <div class="form-group">
                  <label class="text-lg font-medium"
                    >{{ $t("requirement.controls_for") }}
                    {{ getFrameworkName(framework) }}</label
                  >
                  <v-select
                    label="short_name"
                    class="Controls"
                    :options="frameworkControls[framework] || []"
                    v-model="selectedControls[framework]"
                    multiple
                    @update:modelValue="updateSelectedControls"
                    :placeholder="$t('requirement.select_controls')"
                    :selectable="
                      (option) =>
                        !hasEvidences || !originalControls[framework]?.includes(option.id)
                    "
                  >
                    <template #selected-option="{ short_name, id }">
                      <span
                        :class="{
                          'disabled-option':
                            hasEvidences && originalControls[framework]?.includes(id),
                        }"
                      >
                        {{ short_name }}
                      </span>
                    </template>
                  </v-select>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #mapped_control_id="{ item }">
          <div class="col-12 mb-3">
            <div class="form-group">
              <label class="text-lg font-medium">{{
                $t("requirement.my_options")
              }}</label>
              <LazySelectField :name="'mapped_control_id'" options="Control" optionLabel="short_name" optionValue="id"
                :modelValue="newItem.mapped_control_id" @update:modelValue="newItem.mapped_control_id = $event"
                :placeholder="$t('requirement.select main mapped control if you want.')"
                :selectable="(option) => isControlInSelectedControls(option.id)" :apiParams="{}" :perPage="10" />
            </div>
          </div>
        </template>

        <template #responsible_type="{ item }">
          <div class="col-12 mb-3">
            <label class="text-lg font-medium mb-2">{{
              $t("requirement.responsible")
            }}</label>
            <div class="radio-group">
              <label class="rdiobox">
                <input value="user" v-model="newItem.responsible_type" type="radio" />
                <span>{{ $t("requirement.user") }}</span>
              </label>
              <label class="rdiobox">
                <input value="department_manager" v-model="newItem.responsible_type" type="radio" />
                <span>{{ $t("requirement.department_manager") }}</span>
              </label>
              <label class="rdiobox">
                <input value="team" v-model="newItem.responsible_type" type="radio" />
                <span>{{ $t("requirement.team") }}</span>
              </label>
            </div>
          </div>
        </template>

        <template #users="{ item }">
          <div class="col-12 mb-3" v-if="newItem.responsible_type == 'department_manager'">
            <div class="form-group">
              <label class="text-lg font-medium">{{
                $t("requirement.department")
              }}</label>
              <LazySelectField :name="'department_id'" options="Department" optionLabel="name" optionValue="id"
                :modelValue="newItem.department_id" @update:modelValue="
                  newItem.department_id = $event;
                updateDepartmentUsers($event);
                " :placeholder="$t('requirement.select_department')" :apiParams="{ select: 'id|name' }"
                :perPage="10" />
            </div>
          </div>

          <div class="col-12 mb-3">
            <div class="form-group">
              <label class="text-lg font-medium">{{
                $t("requirement.select_responsible")
              }}</label>

              <!-- Show UserSelect for user type -->
              <UserSelect v-if="newItem.responsible_type === 'user'" :modelValue="newItem.responsible_id"
                @update:modelValue="newItem.responsible_id = $event" :multiple="false"
                :placeholder="$t('requirement.select_user')" :apiParams="getUserApiParams()" />

              <!-- Show UserSelect for department_manager type -->
              <UserSelect v-else-if="newItem.responsible_type === 'department_manager'"
                :modelValue="newItem.responsible_id" @update:modelValue="newItem.responsible_id = $event"
                :multiple="false" :placeholder="$t('requirement.select_department_manager')"
                :apiParams="departmentManagerApiParams" :key="'dept-managers-' + (newItem.department_id || 'none')" />

              <!-- Show TeamSelect for team type -->
              <TeamSelect v-else-if="newItem.responsible_type === 'team'" :modelValue="newItem.responsible_id"
                @update:modelValue="newItem.responsible_id = $event" :multiple="false"
                :placeholder="$t('requirement.select_team')" />
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Frameworks Modal -->
  <div v-if="isFrameworksModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 900px; max-height: 80vh">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("requirement.frameworks") }}</h5>
        <button @click="closeFrameworksModal" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="text-align: center">#</th>
                <th style="text-align: center">
                  {{ $t("requirement.framework_name") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(framework, index) in frameworksModalData" :key="framework.id">
                <td style="text-align: center">{{ index + 1 }}</td>
                <td style="text-align: center">
                  <strong>{{ framework.title }}</strong>
                </td>
              </tr>
              <tr v-if="!frameworksModalData.length">
                <td colspan="5" class="text-center">
                  {{ $t("requirement.no_frameworks") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div v-if="requirementDetailsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 800px; max-height: 85vh">
      <div class="modal-header">
        <h5 class="modal-title text-truncate" style="max-width: 80%">
          {{ requirementData.name }}
        </h5>
        <button @click="closeDetailsModal" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" class="form-label">{{ $t("requirement.description") }} :
            </label>
            <p>{{ stripHtmlTags(requirementData?.description) }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label">{{ $t("requirement.creation_date") }} :
            </label>
            <p>{{ formatDate(requirementData?.created_at) }}</p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label">{{ $t("requirement.updated_at") }} :
            </label>
            <p>{{ formatDate(requirementData?.updated_at) }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label">{{ $t("requirement.expiration_days") }} :
            </label>
            <p>{{ requirementData?.expire_days }} {{ $t("requirement.days") }}</p>
          </div>
          <div class="col-md-6">
            <label style="font-weight: 700" class="form-label">{{ $t("requirement.due_date") }} :
            </label>
            <p>{{ formatDate(requirementData?.due_date) }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" class="form-label">{{ $t("requirement.frameworks") }} : </label><br />
            <span v-if="requirementData.frameworks && requirementData.frameworks.length">
              <span v-for="(framework, index) in requirementData.frameworks" :key="index"
                class="badge bg-info text-white m-1">{{ getFrameworkName(framework?.framework_id) }}
              </span>
            </span>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" class="form-label">{{ $t("requirement.controls") }} : </label><br />
            <span v-if="requirementData.control_id && requirementData.control_id.length">
              <span v-for="(controlId, index) in requirementData.control_id" :key="index"
                class="badge bg-info text-white m-1">{{ getControlName(controlId) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Controls Modal -->
  <div v-if="isControlsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 700px">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("requirement.controls") }}</h5>
        <button @click="closeControlsModal" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="text-align: center">#</th>
                <th style="text-align: center">
                  {{ $t("requirement.short_name") }}
                </th>
                <th style="text-align: center">
                  {{ $t("requirement.long_name") }}
                </th>
                <th style="text-align: center">
                  {{ $t("requirement.control_number") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(control, index) in controlsModalData" :key="control.id">
                <td style="text-align: center">{{ index + 1 }}</td>
                <td style="text-align: center">{{ control.short_name }}</td>
                <td style="text-align: center">{{ control.long_name }}</td>
                <td style="text-align: center">{{ control.control_number }}</td>
              </tr>
              <tr v-if="!controlsModalData.length">
                <td colspan="4" class="text-center">
                  {{ $t("requirement.no_controls") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- View user details modal -->
  <ViewUserDetails :viewUserModal="viewUserModal" :userData="userData" @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event" />

  <div v-if="showContentModal" class="modal-overlay" @click="showContentModal = false">
    <div class="modal-content" @click.stop style="max-width: 500px">
      <div class="modal-header">
        <h5 class="modal-title">{{ modalContent.title }}</h5>
        <button @click="showContentModal = false" class="btn-close"></button>
      </div>
      <div class="modal-body">
        <p>{{ modalContent.content }}</p>
      </div>
      <div class="modal-footer">
        <button @click="showContentModal = false" class="btn btn-primary">Close</button>
      </div>
    </div>
  </div>
  <!-- Controls Without Evidence Modal -->
  <div v-if="isUnlinkedControlsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 700px">
      <div class="modal-header">
        <h5 class="modal-title">
          {{ $t("requirement.controls_without_evidence") }}
        </h5>
        <button @click="closeUnlinkedControlsModal" class="btn-close" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="text-align: center">#</th>
                <th style="text-align: center">
                  {{ $t("requirement.short_name") }}
                </th>
                <th style="text-align: center">
                  {{ $t("requirement.long_name") }}
                </th>
                <th style="text-align: center">
                  {{ $t("requirement.control_number") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(control, index) in unlinkedControlsModalData" :key="control.id">
                <td style="text-align: center">{{ index + 1 }}</td>
                <td style="text-align: center">{{ control.short_name }}</td>
                <td style="text-align: center">{{ control.long_name }}</td>
                <td style="text-align: center">{{ control.control_number }}</td>
              </tr>
              <tr v-if="!unlinkedControlsModalData.length">
                <td colspan="4" class="text-center">
                  {{ $t("requirement.no_unlinked_controls") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import axios from "axios";
import requirement from "@/API/Requirement/Requirement";
import framework from "@/API/Frameworks/Frameworks";
import control from "@/API/Control/Control";
import user from "@/API/User/User";
import team from "@/API/Team/Team";
import department from "@/API/Department/Department";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import Auth from "@/API/Auth";
import { notify } from "@kyvg/vue3-notification";
import { ref } from "vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import LazySelectField from "@/components/LazySelectField.vue";
import UserSelect from "@/components/UserSelect.vue";
import TeamSelect from "@/components/TeamSelect.vue";
export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    "v-select": VueSelect,
    ViewUserDetails,
    LazySelectField,
    UserSelect,
    TeamSelect,
  },

  setup() {
    // Initialize API and other required properties
    const frameworkApi = new framework();
    const controlApi = new control();
    const api = new requirement();
    const userApi = new user();
    const teamApi = new team();
    const departmentApi = new department();
    const apiParams = ref({
      with: ["evidences"],
      // Filter to show requirements where user is responsible person or in responsible team
      filterOr: `responsible_id|${Auth.USER.id}||responsible_team_id|${Auth.USER.team_id}||createdBy|${Auth.USER.id}`,
    });
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      frameworkApi,
      controlApi,
      apiParams,
      tableColumns,
      userApi,
      teamApi,
      departmentApi,
      fromFields,
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const loggedInUserr = Auth.USER;
        return {
          edit:
            row.createdBy != loggedInUserr.id &&
            (row.active != true || row.active != "true"),
          delete: row.createdBy != loggedInUserr.id,
        };
      };
    },
    filteredOptions() {
      if (this.newItem.responsible_type === "user") return this.userList;
      if (this.newItem.responsible_type === "department_manager")
        return this.departmentManagers;
      if (this.newItem.responsible_type === "team") return this.teamList;
      return [];
    },
    selectLabel() {
      if (this.newItem.responsible_type === "user") return this.$t("requirement.users");
      if (this.newItem.responsible_type === "department_manager")
        return this.$t("requirement.department_managers");
      if (this.newItem.responsible_type === "team") return this.$t("requirement.teams");
      return "";
    },
    departmentManagerApiParams() {
      if (this.newItem.department_id) {
        return {
          filterWhereRelation: [
            `job.departments@id|${this.newItem.department_id}|=`,
            `job@is_manager|true-boolean|=`
          ],
          select: "id|full_name|department_id|email|job_id",
        };
      }
      return {
        select: "id|full_name|department_id|email",
      };
    },
  },

  data() {
    return {
      requirementFilters: [
        {
          title: "Status",
          key: "active",
          type: "string",
          data: [
            { id: "true", name: "Active" },
            { id: "false", name: "Disabled" },
          ],
        },
        {
          title: "Control",
          key: "control_id",
          type: "string",
          data: {
            model: "Control",
            id: "id",
            display: "short_name",
          },
          filterType: "filter",
        },
        {
          title: "Provider",
          key: "createdBy",
          type: "string",
          data: {
            model: "User",
            id: "id",
            display: "full_name",
          },
          filterType: "filter",
        },
        {
          title: "Responsible",
          key: "responsible_id",
          type: "string",
          data: {
            model: "User",
            id: "id",
            display: "full_name",
          },
          filterType: "filter",
        },
      ],
      ownedFrameworks: [],
      hasControls: false,
      requirementData: [], // Data for requirements table
      requirementDetailsModalOpen: false,
      loggedInUser: false,
      frameWorkIdFilter: null, // Selected framework ID
      controlIdFilter: null, // Selected control ID
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      frameworkList: [],
      controlList: [],
      newItem: {},
      filterControls: [],
      userList: [],
      teamList: [],
      isFrameworksModalOpen: false,
      frameworksModalData: [],
      departmentsData: [],
      departmentManagers: [],
      selectedFrameworks: [], // Stores selected frameworks
      frameworkControls: {}, // Stores controls grouped by framework
      selectedControls: {}, // Stores selected controls for each framework
      filter: {
        framework_id: "",
      },
      loading: false,
      isControlsModalOpen: false,
      controlsModalData: [],
      isUnlinkedControlsModalOpen: false,
      unlinkedControlsModalData: [],
      originalFrameworks: [], // Store original frameworks when editing with evidences
      originalControls: {}, // Store original controls when editing with evidences
      hasEvidences: false, // Track if current requirement has evidences
      viewUserModal: false, // To control user details modal visibility
      userData: {}, // Data for the user details modal
      departmentsLookup: {}, // Department lookup dictionary (id -> name)
      truncateLimit: 10,
      showContentModal: false,
      modalContent: {
        title: "",
        content: "",
      },
    };
  },

  async mounted() {
    if (Auth.USER.super) {
      this.apiParams = {
        with: ["evidences"],
      };
    }

    // Fetch frameworks owned by the authenticated user
    this.ownedFrameworks = await this.frameworkApi.getAll({
      filter: `owner|${Auth.USER.id}|=`,
      select: "id",
    });

    // Build filter for requirements that include user's owned frameworks
    let condationFrameworkIds = "";
    if (this.ownedFrameworks && this.ownedFrameworks.length > 0) {
      const frameworkIds = this.ownedFrameworks.map((fw) => fw.id);
      for (let i = 0; i < frameworkIds.length; i++) {
        condationFrameworkIds += `||frameworks.framework_id|${frameworkIds[i]}|=`;
      }
      // Add framework ownership filter to existing responsible filters
      this.apiParams.filterOr = `responsible_id|${Auth.USER.id}||responsible_team_id|${Auth.USER.team_id}${condationFrameworkIds}||createdBy|${Auth.USER.id}`;
    }

    this.loggedInUser = Auth.USER;
    this.frameworkList = await this.frameworkApi.getAll();
    this.controlList = await this.controlApi.getAll();

    // We don't need to fetch all users/teams anymore since UserSelect/TeamSelect handle it
    // But we still need them for display in the table
    this.userList = await this.userApi.getAll({
      select: "id|full_name|department_id|email|phone|username|type",
    });
    this.teamList = await this.teamApi.getAll({ select: "id|name" });

    this.departmentsData = await this.departmentApi.getAll({
      select: "id|name",
    });

    // Build departments lookup dictionary (id -> name)
    this.departmentsLookup = this.departmentsData.reduce((map, department) => {
      map[department.id] = department.name;
      return map;
    }, {});

    this.$refs.table.refreshTable();
  },

  created() {
    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("common.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "description",
        title: this.$t("common.description"),
        data: "description",
        defaultContent: "N/A",
      },
      {
        id: "frameworks",
        title: this.$t("requirement.frameworks"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "controls",
        title: this.$t("requirement.controls"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "controls_without_evidence",
        title: this.$t("requirement.controls_without_evidence"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("common.created_at"),
        data: "created_at",
        defaultContent: "N/A",
      },
      {
        id: "due_date",
        title: this.$t("common.due_date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "expire_days",
        title: this.$t("requirement.expire_days"),
        data: "expire_days",
        defaultContent: "N/A",
      },
      {
        id: "responsible_type",
        title: this.$t("requirement.responsible_type"),
        data: "responsible_type",
        defaultContent: "N/A",
      },
      {
        id: "responsible",
        title: this.$t("requirement.responsible"),
        data: null,
        defaultContent: "N/A",
      },
      {
        id: "evidences",
        title: this.$t("requirement.evidences"),
        data: null,
        defaultContent: "N/A",
      },
      {
        // NEW COLUMN FOR EVIDENCE NEEDED
        id: "evidence_needed_to_approve",
        title: this.$t("requirement.evidence_needed_to_approve"), // Add this to your i18n
        data: null,
        defaultContent: "0", // Default value
      },
      {
        id: "Active",
        title: this.$t("requirement.active"),
        data: "active",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("common.name"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        col: 12, // Column size in the form layout
      },
      {
        name: "description",
        label: this.$t("common.description"),
        type: "textarea", // Multi-line text field
        rules: "required", // Validation rule: required field
        col: 12,
      },
      {
        name: "framework_id",
      },
      {
        name: "responsible_type",
      },
      {
        name: "users",
      },
      {
        type: "options",
        name: "mapped_control_id",
        label: this.$t("requirement.my_options"),
        options: "Control", // Initialize with an empty array (will be populated dynamically)
        optionLabel: "short_name",
        col: 6,
        rules: "",
        description: this.$t("requirement.select main mapped control if you want."),
      },
      {
        name: "due_date",
        label: this.$t("requirement.due_date"),
        type: "date", // Date input field
        rules: "required", // Validation rule: required field
        description: this.$t("requirement.please_enter_the_due_date"),
        col: 4,
      },
      {
        name: "expire_days",
        label: this.$t("requirement.expire_days"),
        type: "number", // Date input field
        rules: "required", // Validation rule: required field
        description: this.$t("requirement.please_enter_number_of_eays"),
        col: 4,
      },
    ];
  },

  methods: {
    showFullContent(title, content) {
      this.modalContent = {
        title: title,
        content: this.stripHtmlTags(content),
      };
      this.showContentModal = true;
    },
    shouldTruncate(content) {
      if (!content && content !== 0) return false;
      const cleanContent = this.stripHtmlTags(content);
      return cleanContent.length > this.truncateLimit;
    },

    getTruncatedText(content) {
      if (!content && content !== 0) return "";
      const cleanContent = this.stripHtmlTags(content);
      return cleanContent.length > this.truncateLimit
        ? cleanContent.substring(0, this.truncateLimit).trim() + "..."
        : cleanContent;
    },
    truncateText(text, maxLength) {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    },
    openFrameworksModal(item) {
      if (!item.frameworks || !item.frameworks.length) {
        this.frameworksModalData = [];
        return;
      }

      // Get framework details for each framework in the item
      this.frameworksModalData = item.frameworks
        .map((framework) => {
          const frameworkObj = this.frameworkList.find(
            (f) => f.id === framework.framework_id
          );
          return frameworkObj
            ? {
              id: frameworkObj.id,
              title: frameworkObj.title,
              description: frameworkObj.description || "No description",
              version: frameworkObj.version || "N/A",
              due_date: framework.due_date
                ? this.formatDate(framework.due_date)
                : "N/A",
            }
            : null;
        })
        .filter((framework) => framework !== null);

      this.isFrameworksModalOpen = true;
    },

    closeFrameworksModal() {
      this.isFrameworksModalOpen = false;
      this.frameworksModalData = [];
    },
    getUserName(userId) {
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },

    buildResponsibleFilter() {
      const filters = [];

      // 1. Direct user responsibility
      filters.push(`(responsible_type|user|=,responsible_id|${this.loggedInUser.id}|=)`);

      // 2. Department manager responsibility
      filters.push(
        `(responsible_type|department_manager|=,responsible_id|${this.loggedInUser.id}|=)`
      );

      // 3. Team member responsibility
      if (this.loggedInUser.team_ids && this.loggedInUser.team_ids.length > 0) {
        this.loggedInUser.team_ids.forEach((teamId) => {
          filters.push(`(responsible_type|team|=,responsible_id|${teamId}|=)`);
        });
      }

      // Join all filters with OR operator
      return filters.join("||");
    },

    getUnapprovedEvidences(item) {
      if (!item.evidences || !item.evidences.length) {
        return 0;
      }
      const needed = item.evidences.filter((evidence) => !evidence.statuses);
      return needed.length;
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    async closeDetailsModal() {
      this.requirementDetailsModalOpen = false;
    },
    openControlsModal(item) {
      if (!item.control_id || !item.control_id.length) {
        this.controlsModalData = [];
        return;
      }

      this.controlsModalData = item.control_id
        .map((controlId) => {
          const control = this.controlList.find((c) => c.id === controlId);
          return control
            ? {
              id: control.id,
              short_name: control.short_name,
              long_name: control.long_name,
              control_number: control.control_number,
            }
            : null;
        })
        .filter((control) => control !== null);

      this.isControlsModalOpen = true;
    },
    closeControlsModal() {
      this.isControlsModalOpen = false;
      this.controlsModalData = [];
    },
    openUnlinkedControlsModal(item) {
      const unlinkedControlIds = this.getUnlinkedControls(item);

      if (!unlinkedControlIds || !unlinkedControlIds.length) {
        this.unlinkedControlsModalData = [];
        return;
      }

      this.unlinkedControlsModalData = unlinkedControlIds
        .map((controlId) => {
          const control = this.controlList.find((c) => c.id === controlId);
          return control
            ? {
              id: control.id,
              short_name: control.short_name,
              long_name: control.long_name,
              control_number: control.control_number,
            }
            : null;
        })
        .filter((control) => control !== null);

      this.isUnlinkedControlsModalOpen = true;
    },
    closeUnlinkedControlsModal() {
      this.isUnlinkedControlsModalOpen = false;
      this.unlinkedControlsModalData = [];
    },
    async openDetailsModal(selectedRow) {
      this.requirementDetailsModalOpen = true;
      this.requirementData = selectedRow;
    },
    getUnlinkedControls(item) {
      if (!item.control_id || !item.control_id.length) return [];

      // Get all control IDs linked to evidences for this requirement
      const evidenceControlIds = item.evidences
        ?.flatMap((evidence) => evidence.control_ids || [])
        .filter((id) => id); // Filter out null/undefined

      // Return control IDs from item.control_id that are not in evidenceControlIds
      return item.control_id.filter(
        (controlId) => !evidenceControlIds.includes(controlId)
      );
    },

    getUserApiParams() {
      return {
        select: "id|full_name|department_id|email|phone|username|type",
        // You can add any additional filters here
        // filter: "active|true|=" // Example: only active users
      };
    },

    getDepartmentManagerApiParams() {
      if (this.newItem.department_id) {
        return {
          filterWhereRelation: [`departmentManagers@id|${this.newItem.department_id}`],
          select: "id|full_name|department_id|email",
        };
      }
      return {
        select: "id|full_name|department_id|email",
      };
    },

    async updateDepartmentUsers(selectedDepartmentId) {
      this.newItem.responsible_id = null;
      this.departmentManagers = [];

      if (!selectedDepartmentId) return;

      try {
        // Use your API service with proper error handling
        const response = await this.departmentApi.getDepartmentManagers(
          selectedDepartmentId
        );

        // Handle the response - assuming it returns an object with a managers array
        let managers = [];

        if (response && typeof response === "object") {
          if (response.managers && Array.isArray(response.managers)) {
            managers = response.managers;
          } else if (response.data && Array.isArray(response.data)) {
            managers = response.data;
          } else if (Array.isArray(response)) {
            managers = response;
          }
        }
        console.log("Department managers data:", managers);

        this.departmentManagers = managers.map((manager) => ({
          id: manager.id,
          name:
            manager.full_name || manager.name || manager.username || "Unknown Manager",
        }));
      } catch (error) {
        console.error("Error fetching department managers:", error);
        // Provide user feedback
        notify({
          type: "error",
          title: "Error",
          text: "Failed to load department managers",
        });
        this.departmentManagers = [];
      }
    },
    getResponsibleOptionLabel() {
      switch (this.newItem.responsible_type) {
        case "user":
          return "full_name";
        case "team":
          return "name";
        case "department_manager":
          return "name";
        default:
          return "full_name";
      }
    },

    getResponsibleApiParams() {
      switch (this.newItem.responsible_type) {
        case "user":
          return { select: "id|full_name|department_id|email|phone|username|type" };
        case "team":
          return { select: "id|name" };
        case "department_manager":
          if (this.newItem.department_id) {
            return {
              filter: `department_id|${this.newItem.department_id}|=,type|department_manager|=`,
              select: "id|full_name|department_id|email",
            };
          }
          return {
            filter: "type|department_manager|=",
            select: "id|full_name|department_id|email",
          };
        default:
          return {};
      }
    },

    updateFrameworkControls(frameworkId, controls) {
      this.selectedControls[frameworkId] = controls;
      this.updateSelectedControls();
    },

    // Update the GetControls method to work with lazy select
    async GetControls(selectedFrameworks) {
      if (!selectedFrameworks || !selectedFrameworks.length) {
        this.selectedControls = {};
        return;
      }

      // Prevent removal of original frameworks if has evidences
      if (this.hasEvidences) {
        const missingOriginalFrameworks = this.originalFrameworks.filter(
          (id) => !selectedFrameworks.includes(id)
        );
        if (missingOriginalFrameworks.length > 0) {
          selectedFrameworks = [
            ...new Set([...selectedFrameworks, ...missingOriginalFrameworks]),
          ];
          this.selectedFrameworks = selectedFrameworks;
        }
      }

      // Initialize selectedControls for new frameworks
      selectedFrameworks.forEach((frameworkId) => {
        if (!this.selectedControls[frameworkId]) {
          this.selectedControls[frameworkId] = [];
        }
      });

      // Remove unselected frameworks
      Object.keys(this.selectedControls).forEach((frameworkId) => {
        if (!selectedFrameworks.includes(frameworkId)) {
          delete this.selectedControls[frameworkId];
        }
      });

      // Update frameworks data with due_date
      this.newItem.frameworks = selectedFrameworks.map((frameworkId) => ({
        framework_id: frameworkId,
        due_date: this.newItem.due_date,
      }));

      // Update control_id array
      this.updateSelectedControls();
    },
    openForm() {
      this.newItem.createdBy = Auth.USER.id; // Set the requestor_id to the current user's ID
      console.log(this.newItem.createdBy);
      this.isFlipped = true; // Show the form
      // this.resetForm();
    },
    checkOwnership(requirement) {
      // Ensure requirement has the required properties
      if (!requirement) {
        return false;
      }

      let ownedFrameworkIds = [];
      try {
        ownedFrameworkIds = this.ownedFrameworks?.map((framework) => framework.id) || [];
      } catch (error) {
        console.error("Error fetching owned frameworks:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch framework information",
        });
        return false;
      }

      // Check if the evidence has any controls owned by the user's frameworks
      const hasOwnedControls =
        requirement.control_id &&
        Array.isArray(requirement.control_id) &&
        requirement.control_id.some((controlId) => {
          const control = this.controlList.find((c) => c.id === controlId);
          return control && ownedFrameworkIds.includes(control.framework_id);
        });

      if (
        hasOwnedControls ||
        (requirement.responsible_type === "user" &&
          requirement.responsible_id === this.loggedInUser.id) ||
        (requirement.responsible_type === "team" &&
          this.loggedInUser.team_ids?.includes(requirement.responsible_id)) ||
        (requirement.responsible_type === "department_manager" &&
          requirement.responsible_id === this.loggedInUser.id)
      ) {
        return true;
      }

      return false;
    },

    async viewEvidences(requirement) {
      // Fetch frameworks owned by the logged-in user
      // let ownedFrameworkIds = [];
      // try {
      //   const ownedFrameworks = await this.frameworkApi.getAll({
      //     filter: `owner|${Auth.USER.id}|=`,
      //     select: "id",
      //   });
      //   ownedFrameworkIds = ownedFrameworks.map((framework) => framework.id);
      // } catch (error) {
      //   console.error("Error fetching owned frameworks:", error);
      //   notify({
      //     type: "error",
      //     title: "Error",
      //     text: "Failed to fetch framework information",
      //   });
      //   return;
      // }

      // // Check if the evidence has any controls owned by the user's frameworks
      // const hasOwnedControls = requirement.control_id.some((controlId) => {
      //   const control = this.controlList.find((c) => c.id === controlId);
      //   return control && ownedFrameworkIds.includes(control.framework_id);
      // });

      this.$router.push({
        name: "Evidences",
        params: { id: requirement.id },
      });
    },

    async deleteRequirement(requirementId) {
      await this.api.delete(requirementId);
      this.$refs.table.refreshTable();
    },

    resetForm() {
      this.selectedFrameworks = [];
      this.frameworkControls = {};
      this.selectedControls = {};
      this.originalFrameworks = [];
      this.originalControls = {};
      this.hasEvidences = false;
      this.newItem = {
        responsible_type: "user",
        frameworks: [],
        controls: [],
        due_date: new Date().toISOString().split("T")[0],
      };
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.resetForm();
      this.$refs.table.refreshTable(); // Refresh the table data
    },

    formatDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    getResponsibleName(type, id) {
      if (!id) return "N/A";

      // Try to find in cached data first
      let found = null;

      switch (type) {
        case "user":
          found = this.userList.find((item) => item.id === id);
          break;
        case "department_manager":
          // Try to find in userList with department_manager type
          found = this.userList.find(
            (item) => item.id === id && item.type === "department_manager"
          );
          if (!found && this.departmentManagers.length > 0) {
            found = this.departmentManagers.find((item) => item.id === id);
          }
          break;
        case "team":
          found = this.teamList.find((item) => item.id === id);
          break;
      }

      return found ? found.name || found.full_name : "N/A";
    },
    formatResponsibleType(type) {
      const typeMap = {
        user: "User",
        department_manager: "Department Manager",
        team: "Team",
      };
      return typeMap[type] || type;
    },
    getResponsibleEmail(type, id) {
      if (type === "team") return null;

      const lists = {
        user: this.userList,
        department_manager: this.departmentManagers,
      };

      const list = lists[type] || [];
      const found = list.find((item) => item.id === id);

      return found ? found.email : null;
    },
    getUserInitials(fullName) {
      if (!fullName || fullName === "N/A") return "?!";

      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    },

    // Open user details modal
    openUserDetailsModal(user) {
      if (!user) return;
      this.userData = { ...user };
      try {
        let userDepartment = this.departmentsLookup[this.userData.department_id] ?? {};
        this.userData.department = userDepartment || "N/A";
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    },

    // Get responsible user object for modal
    getResponsibleUserObject(type, id) {
      if (type === "user" || type === "department_manager") {
        const user = this.userList.find((user) => user.id === id);
        if (user) {
          return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            department_id: user.department_id,
            // Add other properties as needed
          };
        }

        // If not found in userList, try departmentManagers
        if (type === "department_manager") {
          const manager = this.departmentManagers.find((m) => m.id === id);
          if (manager) {
            return { id: manager.id, full_name: manager.name };
          }
        }

        return null;
      }
      // For teams, we don't open user modal
      return null;
    },

    editItem(data) {
      this.newItem = { ...data }; // Clone the data to avoid mutation

      // Check if requirement has evidences
      this.hasEvidences = data.evidences && data.evidences.length > 0;

      // Ensure frameworks are selected
      this.selectedFrameworks = data.frameworks ? data.frameworks.map((f) => f.framework_id) : [];

      // Ensure control_id is an array
      if (!data.control_id) {
        this.newItem.control_id = [];
      }

      // Store original frameworks and controls if has evidences
      if (this.hasEvidences) {
        this.originalFrameworks = [...this.selectedFrameworks];
        this.originalControls = {};
      } else {
        this.originalFrameworks = [];
        this.originalControls = {};
      }

      // Populate controls based on selected frameworks
      this.frameworkControls = {};
      this.selectedControls = {};

      this.selectedFrameworks.forEach((frameworkId) => {
        // Filter controls related to the selected framework
        this.frameworkControls[frameworkId] = this.controlList.filter(
          (control) => control.framework_id === frameworkId
        );

        // Pre-select controls that are in the control_id array
        this.selectedControls[frameworkId] = this.controlList.filter(
          (control) =>
            control.framework_id === frameworkId &&
            Array.isArray(data.control_id) &&
            data.control_id.includes(control.id)
        );

        // Store original controls if has evidences
        if (this.hasEvidences) {
          this.originalControls[frameworkId] = this.selectedControls[frameworkId].map(
            (c) => c.id
          );
        }
      });

      this.isFlipped = true;
    },

    getFrameworkName(id) {
      const framework = this.frameworkList.find((f) => f.id === id);
      return framework ? framework.title : "";
    },
    getControlName(id) {
      const control = this.controlList.find((c) => c.id === id);
      return control ? control.short_name : "";
    },
    isControlInSelectedControls(controlId) {
      // Check if the control is in any of the selected controls for the selected frameworks
      if (!this.selectedControls || Object.keys(this.selectedControls).length === 0) {
        return false;
      }

      // Flatten all selected controls across all frameworks
      const allSelectedControls = Object.values(this.selectedControls)
        .flat()
        .map((control) => control.id || control);

      return allSelectedControls.includes(controlId);
    },

    isMappedControl(controlId) {
      // Check if the control is selected as the mapped control
      return this.newItem.mapped_control_id === controlId;
    },

    validateMappedControl() {
      // Check if the currently selected mapped_control_id is still in the available selected controls
      if (!this.newItem.mapped_control_id) {
        return; // No mapped control selected, nothing to validate
      }

      const isStillValid = this.isControlInSelectedControls(this.newItem.mapped_control_id);

      if (!isStillValid) {
        // Clear the mapped control if it's no longer in the selected controls
        this.newItem.mapped_control_id = null;
      }
    },

    updateSelectedControls() {
      // Prevent removal of original controls if has evidences
      if (this.hasEvidences) {
        Object.keys(this.originalControls).forEach((frameworkId) => {
          if (this.selectedControls[frameworkId]) {
            const currentControlIds = this.selectedControls[frameworkId].map((c) => c.id);
            const missingOriginalControls = this.originalControls[frameworkId].filter(
              (id) => !currentControlIds.includes(id)
            );

            if (missingOriginalControls.length > 0) {
              // Add back missing original controls
              const controlsToAdd = this.controlList.filter((c) =>
                missingOriginalControls.includes(c.id)
              );
              this.selectedControls[frameworkId] = [
                ...this.selectedControls[frameworkId],
                ...controlsToAdd,
              ];
            }
          }
        });
      }

      // Get all selected control IDs
      const controlIds = Object.values(this.selectedControls)
        .flat()
        .filter((id) => id) // Filter out null/undefined
        .map((id) => {
          if (typeof id === "string" || typeof id === "number") {
            return id;
          }
          if (id && id.id) {
            return id.id;
          }
          return null;
        })
        .filter((id) => id !== null); // Remove nulls

      console.log("Control IDs extracted:", controlIds);

      // Update the request data
      this.newItem.control_id = controlIds;
    },
    updateSelectedUsers(selectedUserId) {
      this.newItem.responsible_id = selectedUserId;
    },

    async toggleActive(item) {
      // Build formData from the item, including toggled active value
      const formData = {
        ...item,
        active: !(item.active === true || item.active === "true"),
      };
      console.log("Toggling active status for item:", formData);
      try {
        await this.api.from(formData);
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Failed to update active status:", error);
      }
    },
  },
  async submitForm() {
    // Format the data before sending to API
    const formData = {
      ...this.newItem,
      // Ensure frameworks have framework_id and due_date
      frameworks: this.newItem.frameworks,
      // Send only control IDs
      controls: this.newItem.control_id.map((id) => ({ control_id: id })),
    };

    // Remove redundant properties
    delete formData.control_id;
    delete formData.framework_id;

    try {
      if (this.newItem.id) {
        await this.api.update(this.newItem.id, formData);
      } else {
        await this.api.create(formData);
      }
      this.closeForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  },

  watch: {
    "newItem.responsible_type"(newType) {
      this.newItem.responsible_id = null; // Reset selection when type changes
    },
    "newItem.due_date": {
      handler(newDate) {
        // Update due_date for all frameworks when it changes
        if (this.newItem.frameworks) {
          this.newItem.frameworks = this.newItem.frameworks.map((framework) => ({
            ...framework,
            due_date: newDate,
          }));
        }
      },
    },
    selectedControls: {
      deep: true,
      handler() {
        // Validate mapped_control_id when selected controls change
        this.validateMappedControl();
      },
    },
    selectedFrameworks: {
      deep: true,
      handler() {
        // Validate mapped_control_id when selected frameworks change
        this.validateMappedControl();
      },
    },
    frameWorkIdFilter: {
      deep: true, // Enable deep watching for nested properties
      async handler(newFilter) {
        this.filterControls = await new control().getAll({
          filter: `framework_id|${newFilter}|=`,
        });

        const filters = [];
        if (newFilter) {
          filters.push(`frameworks.framework_id|${newFilter}|=`);
        }
        this.apiParams.filter = filters.join("&&");
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },

    controlIdFilter: {
      deep: true,
      handler(newFilter) {
        console.log("Control ID changed:", newFilter); // Debugging
        const filters = [];
        if (newFilter) {
          filters.push(`control_id|${newFilter}|=`);
        }
        this.apiParams.filter = filters.join("&&");
        this.$refs.table.refreshTable();
      },
    },
  },
};
</script>

<style scoped>
@import "vue-select/dist/vue-select.css";

/* Form container styles */
.form-container {
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Input field styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* v-select customization */
.v-select {
  --vs-controls-color: #374151;
  --vs-border-color: #e5e7eb;
  --vs-dropdown-bg: #fff;
  --vs-dropdown-color: #374151;
  --vs-dropdown-option-color: #374151;
  --vs-selected-bg: #f3f4f6;
}

.v-select .vs__dropdown-toggle {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.v-select .vs__selected {
  margin: 0 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e5e7eb;
  border-radius: 4px;
  color: #374151;
}

/* Radio button styles */
.radio-group {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.bg-info {
  background-color: #d0b5e3 !important;
  color: #6e3894 !important;
  font-weight: 700 !important;
}

.rdiobox {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s;
}

/* User info styles for datatable */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
  justify-content: center;
}

.user-avatar-clickable {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
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

/* Individual user avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #43235c;
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

.text-bg-danger {
  background-color: #e2b6b6 !important;
  color: #a92525 !important;
}

.bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
}

.rdiobox:hover {
  background: #f9fafb;
}

.rdiobox input[type="radio"] {
  margin-right: 0.5rem;
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #3b82f6;
}

.rdiobox span {
  color: #374151;
  font-weight: 500;
}

/* Framework and controls section */
.framework-section {
  background: #f9fafb;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

/* Date and number inputs */
input[type="date"],
input[type="number"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
}

/* Textarea styles */
textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

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
  z-index: 1050;
  /* Bootstrap modal z-index */
}

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  /* Rounded corners */
  width: 90%;
  max-width: 1000px;
  /* Responsive max width */
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
  /* Larger header font */
}

.btn-close {
  font-size: 15px;
  border: none;
  color: #000;
}

.modal-body {
  padding: 20px 0;
  max-height: 60vh;
  /* Limit the height of the modal body */
  overflow-y: auto;
  /* Enable vertical scrolling if content overflows */
  overflow-x: auto;
  /* Prevent horizontal scrolling */
  width: 100%;
  /* Ensure the modal body takes full width */
}

.modal-body p {
  white-space: normal;
  /* Ensure text wraps */
  word-wrap: break-word;
  /* Break long words if necessary */
  overflow-wrap: break-word;
  /* Modern alternative to word-wrap */
  max-width: 100%;
  /* Ensure the text doesn't overflow its container */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 35px;
}

.table th,
.table td {
  vertical-align: middle;
}
</style>
<style>
.table-actions .dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  border-top: 1px solid #efefef;
}

.table-actions .dropdown-item:first-child {
  border-top: none;
}

.table-actions .dropdown-item:hover {
  background-color: #f8f9fa;
}

.table-actions .dropdown-item i {
  margin-right: 0.5rem;
  width: 1rem;
  text-align: center;
}

.vs__selected {
  background: #44225c !important;
  color: #fff !important;
}

.vs__deselect {
  margin-left: 10px !important;
  fill: #fff !important;
}

.disabled-option {
  opacity: 0.7;
  position: relative;
}

.disabled-option::after {
  content: " 🔒";
  font-size: 0.8em;
}

.delete_button {
  display: none !important;
}

.edit_button {
  display: none !important;
}
</style>
<style>
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

.custom-table th,
td {
  text-align: center !important;
}

.modal-header {
  justify-content: space-between;
}

[dir="rtl"] .modal-header,
[dir="rtl"] .dropdown-item,
[dir="rtl"] .children-modal-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-body .row {
  text-align: end;
}

/* Enhanced modal styles */
.framework-card .card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.framework-card .card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.framework-card .card-header {
  border-radius: 8px 8px 0 0 !important;
  padding: 12px 20px;
}

.framework-details {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  border-left: 4px solid #d0b5e3;
}

/* Make badges more consistent */
.badge.bg-info {
  background-color: #d0b5e3 !important;
  color: #6e3894 !important;
  font-weight: 600;
}

/* Hover effects for clickable badges */
.badge[style*="cursor: pointer"]:hover {
  opacity: 0.9;
  transform: scale(1.05);
  transition: all 0.2s ease;
}
</style>
