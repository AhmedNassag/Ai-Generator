<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('survey.AWARENESS')"
    :mainSubPage="this.$t('survey.AWARENESS_SURVEY')"
    :subPage="this.$t('survey.AWARENESS_SURVEY_MANAGEMENT')"
    :titlePage="this.$t('survey.AWARENESS_SURVEY')"
    v-permission:show
  >
    <div v-permission:update v-permission:delete></div>
    <!-- Existing code remains unchanged -->
    <template #datatable>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="{}"
        :editItem="editItem"
        :openForm="openForm"
        :hideActions="hideActions"
      >
        <!-- :Configurations="openConfigurationsModal"
        :hideConfigurationsButton="false" -->

        <template #name="{ item }">
          <div class="badge bg-infoo text-white m-1">
            {{ item?.name }}
          </div>
        </template>

        <!-- <template #description="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            {{ item?.description }}
          </div>
        </template> -->

        <template #status="{ item }">
          <span
            v-if="item.status === 'In Review'"
            class="badge text-bg-warning text-dark"
          >
            {{ $t("survey.inreview") }}
          </span>
          <span
            v-else-if="item.status === 'Draft'"
            class="badge bg-info text-white m-1"
            style="
              background-color: #d9d9d9 !important;
              color: #000000 !important;
              font-weight: 300 !important;
              padding: 8px;
              border-radius: 15px;
              font-size: 13px;
            "
          >
            {{ $t("survey.draft") }}
          </span>
          <span v-else class="badge text-bg-success text-light">
            {{ $t("survey.approved") }} ({{ item.privacy }})
          </span>
        </template>
        <template #createdat="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            {{ formatDate(item.created_at) }}
          </div>
        </template>
        <template #addAction="{ item }">
          <v-list-item
            v-anyPermission="['view']"
            v-if="
              item.status != 'Approved' &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="openModal(item)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-autorenew</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.changestatus") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-anyPermission="['view']"
            v-if="
              item.status != 'Approved' &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="openDetailsModal(item)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"> mdi-eye-outline </v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.overview") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-anyPermission="['view']"
            v-if="
              item.status === 'Approved' &&
              item.privacy === 'Public' &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="generateLink(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-link-variant</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.generatelink") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-anyPermission="['view']"
            v-if="
              item.status != 'Approved' &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="viewQuestions(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon"
                >mdi-help-circle-outline</v-icon
              >
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.questions") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-anyPermission="['view']"
            v-if="
              item.status == 'Approved' &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="QuestionsResponse(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-chart-bar</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.result") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-anyPermission="['sendSurvey']"
            v-if="
              item.status === 'Approved' &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="sendSurvey(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-send</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.sendsurvey") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="
              item.status == 'Approved' &&
              // item.was_sent == true &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="surveyResponse(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-forum</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.responses") }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="
              item.status == 'Approved' &&
              (item.owner_id == this.userID ||
                item.reviewer_id == this.userID ||
                item.uploader_id == this.userID ||
                this.isSuper == true)
            "
            @click="clone(item.id)"
            class="action-list-item"
          >
            <template v-slot:prepend>
              <v-icon size="18" class="action-icon">mdi-content-copy</v-icon>
            </template>
            <v-list-item-title class="action-title">
              {{ $t("survey.clone") }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </DataTable>
    </template>

    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      >
        <template #owner_id="{ item }">
          <div class="col-md-12 mb-3">
            <label for="owner_id">{{ $t("survey.owner") }}</label>
            <UserSelect
              id="owner_id"
              aria-label="Default select example"
              v-model="newItem.owner_id"
            >
              <option v-for="user in userList" :key="user.id" :value="user.id">
                {{ user.full_name }}
              </option>
            </UserSelect>
          </div>
        </template>
        <template #stakeholder_ids="{ item }">
          <div class="col-md-6 mb-3">
            <label for="policy">{{ $t("survey.stakeholders") }}</label>
              <UserSelect
                multiple
                id="stakeholder_ids"
                v-model="newItem.stakeholder_ids"
                :options="userList"
                label="full_name"
                :reduce="(item) => item.id"
                :placeholder="this.$t('survey.select_users_as_stakeholders')"
                :selectable="
                  (option) => isOptionSelectable(option, 'stakeholder_ids')
                "
              >
              </UserSelect>
          </div>
        </template>
        <template #team_ids="{ item }">
          <div class="col-md-6 mb-3 ">
            <label for="policy">{{ $t("survey.teams") }}</label>
              <TeamSelect
                multiple
                id="team_ids"
                v-model="newItem.team_ids"
                :options="teamList"
                label="name"
                :reduce="(item) => item.id"
                :placeholder="this.$t('survey.select_teams')"
                :selectable="(option) => isOptionSelectable(option, 'team_ids')"
              >
              </TeamSelect>
          </div>
        </template>
        <template #required_questions="{ item }">
          <div class="col-md-12 mb-3">
            <!-- Radio button group - side by side -->
            <div class="radio-group-container">
              <div class="custom-radio-option">
                <input
                  class="custom-radio-input"
                  type="radio"
                  id="allRequired"
                  value="all_questions_required"
                  v-model="requiredQuestionsType"
                  @change="handleRequiredTypeChange"
                />
                <label class="custom-radio-label" for="allRequired">
                  <span class="radio-checkmark"></span>
                  <span class="radio-text">{{ $t("survey.allquestionsrequired") }}</span>
                </label>
              </div>

              <div class="custom-radio-option">
                <input
                  class="custom-radio-input"
                  type="radio"
                  id="percentage"
                  value="percentage"
                  v-model="requiredQuestionsType"
                  @change="handleRequiredTypeChange"
                />
                <label class="custom-radio-label" for="percentage">
                  <span class="radio-checkmark"></span>
                  <span class="radio-text">{{ $t("survey.percentage") }}</span>
                </label>
              </div>
            </div>

            <!-- Percentage input field - shown only when percentage is selected -->
            <div
              class="percentage-input-container"
              v-if="requiredQuestionsType === 'percentage'"
            >
              <label class="percentage-label">{{ $t("survey.percentage") }}</label>
              <input
                type="number"
                class="percentage-input"
                v-model="requiredPercentage"
                @input="updateRequiredQuestionsInNewItem"
                min="1"
                max="100"
                :placeholder="
                  this.$t('survey.enter_percantage_between_1_and_100') || 'Select'
                "
                :required="requiredQuestionsType === 'percentage'"
              />
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Change survey status Modal -->
  <div v-if="isModalOpen" class="modal-overlay">
    <div class="status-modal-content">
      <div class="status-modal-header">
        <h5 class="status-modal-title">{{ $t("survey.changestatus") }}</h5>
        <button
          @click="closeModal"
          class="status-modal-close"
          aria-label="Close"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="status-modal-body">
        <div class="status-form-group">
          <label for="type" class="status-label">{{
            $t("survey.action")
          }}</label>
          <select
            v-model="selectedAction"
            id="type"
            class="status-select"
            @change="handleActionChange"
          >
            <option value="" disabled>{{ $t("survey.selectaction") }}</option>
            <option id="1" value="In Review">
              {{ $t("survey.inreview") }}
            </option>
            <option id="2" value="Approved">
              {{ $t("survey.approve") }}
            </option>
          </select>
        </div>

        <!-- Reviewer Dropdown (Visible only when "In Review" is selected) -->
        <div v-if="selectedAction === 'In Review'" class="status-form-group">
          <label for="reviewer" class="status-label">{{
            $t("survey.reviewer")
          }}</label>
          <select
            v-model="selectedReviewer"
            id="reviewer"
            class="status-select"
            required
          >
            <option value="" disabled>
              {{ $t("survey.selectareviewer") }}
            </option>
            <option v-for="user in userList" :key="user.id" :value="user.id">
              {{ user.full_name }}
            </option>
          </select>
        </div>

        <!-- Privacy Dropdown (Visible only when "Approved" is selected) -->
        <div v-if="selectedAction === 'Approved'" class="status-form-group">
          <label for="privacy" class="status-label">{{
            $t("survey.privacy")
          }}</label>
          <select
            v-model="selectedPrivacy"
            id="privacy"
            class="status-select"
            required
          >
            <option value="" disabled>
              {{ $t("survey.selectprivacy") }}
            </option>
            <option value="Private">{{ $t("survey.private") }}</option>
            <option value="Public">{{ $t("survey.public") }}</option>
          </select>
        </div>
      </div>
              <div class="status-modal-footer">
          <button @click="closeModal" class="status-btn status-btn-cancel">
            {{ $t("survey.cancel") || "Cancel" }}
          </button>
          <button @click="takeAction" class="status-btn status-btn-save">
            {{ $t("survey.save") }}
          </button>
        </div>
    </div>
  </div>

  <!-- Details Modal -->
  <div v-if="isDetailsModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("survey.surveyoverview") }}</h5>
        <button
          @click="closeDetailsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 900" for="taskTitle" class="form-label"
              >{{ $t("survey.surveyname") }} :
            </label>
            <p>{{ this.surveyData.name }}</p>
          </div>

          <div class="col-md-12">
            <label
              style="font-weight: 900"
              for="taskDescription"
              class="form-label"
              >{{ $t("survey.description") }} :
            </label>
            <p>{{ stripHtmlTags(this.surveyData.description) }}</p>
          </div>

          <div class="col-md-6">
            <label
              style="font-weight: 900"
              for="taskDescription"
              class="form-label"
              >{{ $t("survey.owner") }} :
            </label>
            <div class="user-avatars-container">
              <div
                class="user-avatar"
                :title="getOwnerName(surveyData.owner_id)"
              >
                {{ getUserInitials(getOwnerName(surveyData.owner_id)) }}
              </div>
              <span class="user-name-text">{{
                getOwnerName(surveyData.owner_id)
              }}</span>
            </div>
          </div>

          <div v-if="surveyData.reviewer_id" class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("survey.reviewer") }} :
            </label>
            <div class="user-avatars-container">
              <div
                class="user-avatar"
                :title="getReviewerName(surveyData.reviewer_id)"
              >
                {{ getUserInitials(getReviewerName(surveyData.reviewer_id)) }}
              </div>
              <span class="user-name-text">{{
                getReviewerName(surveyData.reviewer_id)
              }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <label style="font-weight: 900" for="taskStatus" class="form-label"
              >{{ $t("survey.status") }} :
            </label>
            <p>
              <span
                v-if="this.surveyData.status === 'Draft'"
                class="badge text-bg-primary"
                >{{ $t("survey.draft") }}</span
              >
              <span
                v-else-if="this.surveyData.status === 'Approved'"
                class="badge text-bg-success"
                >{{ $t("exception.approved") }}</span
              >
              <span
                v-else-if="this.surveyData.status === 'In Review'"
                class="badge text-bg-warning"
                >{{ $t("survey.inreview") }}</span
              >
            </p>
          </div>

          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("survey.reviewfrequency") }} :</label
            >
            <p>{{ surveyData.review_frequency }} {{ $t("survey.days") }}</p>
          </div>

          <div v-if="this.surveyData.privacy" class="col-md-6">
            <label
              style="font-weight: 900"
              for="taskDescription"
              class="form-label"
            >
              {{ $t("survey.surveyprivacy") }} :
            </label>
            <p>{{ this.surveyData.privacy }}</p>
          </div>

          <div v-if="this.surveyData.approval_date" class="col-md-6">
            <label
              style="font-weight: 900"
              for="taskDescription"
              class="form-label"
            >
              {{ $t("survey.approvaldate") }} :
            </label>
            <p>{{ this.surveyData.approval_date }}</p>
          </div>

          <!-- Add this new section for stakeholders -->
          <div class="col-md-6">
            <label
              style="font-weight: 900"
              for="stakeholders"
              class="form-label"
            >
              {{ $t("survey.stakeholders") }} :
            </label>
            <div class="stakeholder-avatars-container">
              <div
                v-for="(user, index) in getStakeholderUsers(
                  surveyData.stakeholder_ids
                ).slice(0, 3)"
                :key="user.id"
                class="stakeholder-avatar"
                :class="`avatar-color-${index + 1}`"
                :style="{
                  zIndex: 10 - index,
                  marginLeft: index > 0 ? '-20px' : '0',
                }"
                :title="user.full_name"
              >
                {{ getUserInitials(user.full_name) }}
              </div>
              <div
                v-if="
                  getStakeholderUsers(surveyData.stakeholder_ids).length > 3
                "
                class="stakeholder-avatar stakeholder-count-badge"
                :style="{
                  zIndex: 7,
                  marginLeft: '-20px',
                }"
              >
                +{{
                  getStakeholderUsers(surveyData.stakeholder_ids).length - 3
                }}
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <label
              style="font-weight: 900"
              for="stakeholders"
              class="form-label"
            >
              {{ $t("survey.teams") }} :
            </label>
            <p>{{ getTeamsNames(surveyData.team_ids) }}</p>
          </div>

          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("survey.questionrequirements") }}:</label
            >
            <p
              v-if="
                surveyData.required_questions?.type === 'all_questions_required'
              "
            >
              {{ $t("survey.allquestionsarerequired") }}
            </p>
            <p v-else-if="surveyData.required_questions?.type === 'percentage'">
              {{ surveyData.required_questions?.percentage }}%
              {{ $t("survey.ofquestionsrequired") }}
            </p>
            <p v-else>{{ $t("survey.nospecificrequirements") }}</p>
          </div>

          <div class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("course.lastupdateddate") }} :</label
            >
            <p>{{ formatDate(surveyData.updated_at) }}</p>
          </div>

          <div v-if="surveyData.uploader_id" class="col-md-6">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("survey.createdby") }} :
            </label>
            <div class="user-avatars-container">
              <div
                class="user-avatar"
                :title="getReviewerName(surveyData.uploader_id)"
              >
                {{ getUserInitials(getReviewerName(surveyData.uploader_id)) }}
              </div>
              <span class="user-name-text">{{
                getReviewerName(surveyData.uploader_id)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Configurations Modal -->
  <div v-if="isConfigurationsModalOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("survey.emailconfigurations") }}</h5>
        <button
          @click="closeConfigurationsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="configSubject" class="form-label">{{
            $t("survey.subject")
          }}</label>
          <input
            id="configSubject"
            v-model="configSubject"
            type="text"
            class="form-control"
            :placeholder="this.$t('survey.enter_subject')"
          />
        </div>
        <div class="mb-3">
          <label for="configContent" class="form-label">{{
            $t("survey.content")
          }}</label>
          <ckeditor
            :editor="editor"
            v-model="configContent"
            :config="editorConfig"
          ></ckeditor>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="saveConfigurations" class="btn btn-secondary">
          {{ $t("survey.save") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import survey from "@/API/Survey/Survey";
import questionApi from "@/API/SurveyQuestion/SurveyQuestion";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import userApi from "@/API/User/User";
import teamApi from "@/API/Team/Team";
import Auth from "@/API/Auth";
import Swal from "sweetalert2";
import { notify } from "@kyvg/vue3-notification";
import VueSelect from "vue-select";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import UserSelect from "@/components/UserSelect.vue";
import TeamSelect from "@/components/TeamSelect.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    UserSelect,
    TeamSelect,
    "vue-select": VueSelect,
    ckeditor: Ckeditor,
  },

  setup() {
    // Initialize API and other required properties
    const api = new survey();
    const apiParams = { with: ["owner"] };
    const tableColumns = [];
    const fromFields = [];
    const user = new userApi();
    const team = new teamApi();
    const question = new questionApi();

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      user,
      team,
      question,
      userID: null,
      isSuper: false,
    };
  },

  computed: {
    hideActions() {
      return (row) => {
        const loggedInUser = Auth.USER;
        return {
          edit: row.status != "Draft",
          delete:
            row.status != "Draft"
        };
      };
    },
  },

  async mounted() {
    await this.fetchUsers();
    await this.fetchTeams();
  },
  data() {
    return {
      isConfigurationsModalOpen: false,
      configSubject: "",
      configContent: "",
      // CKEditor setup
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      icon_path: null,
      translateFields: [],
      fields: [],

      isFlipped: false,
      isReadonly: false,
      newItem: {},
      userList: [],
      teamList: [],
      requiredQuestionsType: null,
      requiredPercentage: null,
      required_questions: {
        type: null,
        percentage: null,
      },
      isModalOpen: false,
      selectedSurveyId: null, // Store the selected exception ID
      selectedAction: "",
      selectedReviewer: null, // New property for reviewer
      selectedPrivacy: null, // New property for privacy
      baseurl: null, // New property for privacy

      // New properties for questions modal
      isQuestionsModalOpen: false,
      isDetailsModalOpen: false,
      selectedSurvey: null,
      surveyQuestions: null,
      questions: [
        {
          question: "",
          type: "single",
          options: [{ text: "" }, { text: "" }],
        },
      ],
    };
  },

  created() {
    // Existing code remains unchanged
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("survey.surveyname"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "description",
        title: this.$t("survey.description"),
        data: "description",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("survey.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "createdat",
        title: this.$t("survey.createdat"),
        data: "created_at",
        defaultContent: "N/A",
      },
      // { title: this.$t("Link"), data: "created_at", defaultContent: "N/A" },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "name",
        label: this.$t("survey.surveyname"),
        type: "text",
        rules: "",
        description: this.$t("survey.please_enter_the_survey_name"),
        col: 12,
      },
      {
        type: "options", // Dropdown/select field
        name: "stakeholder_ids",
        label: this.$t("survey.stakeholders"),
        options: [],
        multiple: true,
        optionLabel: "full_name",
        col: 6,
        rules: "",
        description: this.$t("survey.select_users_as_stakeholders."),
      },
      {
        type: "options", // Dropdown/select field
        name: "team_ids",
        label: this.$t("survey.teams"),
        options: [],
        multiple: true,
        optionLabel: "name",
        col: 6,
        rules: "",
        description: this.$t("survey.select_teams"),
      },
      {
        type: "hidden", // Dropdown/select field
        name: "owner_id",
        label: this.$t("survey.owner"),
        options: [],
        optionLabel: "full_name",
        col: 6,
        rules: "",
        description: this.$t("survey.select_an_owner"),
      },
      {
        name: "review_frequency",
        label: this.$t("survey.review_frequency(days)"),
        type: "number",
        rules: "min:1",
        description: this.$t("survey.please_enter_the_review_frequency"),
        col: 12,
      },
      {
        name: "description",
        label: this.$t("survey.description"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: "Provide a description for the survey.",
        description: this.$t("survey.provide_a_description_for_the_survey"),
        col: 12,
      },
      {
        name: "required_questions",
        label: this.$t("survey.question"),
        type: "radio", // Text input field
        rules: "", // Validation rule: required field
        description: "",
        col: 4,
      },
    ];
  },

  methods: {
    openConfigurationsModal() {
      this.isConfigurationsModalOpen = true;
      // Optionally reset fields or load existing config
      this.configSubject = "";
      this.configContent = "";
    },
    closeConfigurationsModal() {
      this.isConfigurationsModalOpen = false;
    },
    saveConfigurations() {
      // Handle save logic here (e.g., API call)
      // Example: show notification
      this.$notify({
        type: "success",
        text: "Configurations saved!",
      });
      this.closeConfigurationsModal();
    },
    isOptionSelectable(option, fieldName) {
      // Get the current value for this field
      const currentValue = this.newItem[fieldName];

      // For multiple select fields
      if (Array.isArray(currentValue)) {
        // Don't allow selecting an option that's already selected in this field
        if (currentValue.includes(option.id)) {
          return false;
        }
      }

      // Check if this option is selected in any other fields
      for (const key in this.newItem) {
        // Skip the current field
        if (key === fieldName) continue;

        const value = this.newItem[key];

        // If the value is an array (multiple select)
        if (Array.isArray(value) && value.includes(option.id)) {
          return false;
        }
      }

      // If we get here, the option is selectable
      return true;
    },
    // Existing methods remain unchanged
    formatDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
    async deleteSurvey(surveyId) {
      await this.api.delete(surveyId);
      this.$refs.table.refreshTable();
    },

    getOwnerName(ownerId) {
      const owner = this.userList.find((user) => user.id === ownerId);
      return owner ? owner.full_name : "Not specified";
    },

    getReviewerName(reviewerId) {
      const reviewer = this.userList.find((user) => user.id === reviewerId);
      return reviewer ? reviewer.full_name : "Not specified";
    },
    openForm() {
      this.newItem.uploader_id = Auth.USER.id; // Set the uploader_id to the current user's ID
      this.isFlipped = true;
    },

    openDetailsModal(selectedRow) {
      this.selectedAction = ""; // Reset selection
      console.log("Selected row:", selectedRow);
      this.isDetailsModalOpen = true;
      console.log(this.isDetailsModalOpen);
      this.surveyData = selectedRow;
    },

    async closeDetailsModal() {
      this.isDetailsModalOpen = false;
    },

    getStakeholderNames(stakeholderIds) {
      if (!stakeholderIds || !Array.isArray(stakeholderIds))
        return "No stakeholders";

      return stakeholderIds
        .map((id) => {
          const user = this.userList.find((user) => user.id === id);
          return user ? user.full_name : "";
        })
        .filter((name) => name) // Remove empty names
        .join(", ");
    },

    getStakeholderUsers(stakeholderIds) {
      if (!Array.isArray(stakeholderIds)) return [];
      return stakeholderIds
        .map((id) => this.userList.find((u) => u.id === id))
        .filter(Boolean);
    },

    getInitials(fullName) {
      if (!fullName) return "";
      const parts = fullName.trim().split(/\s+/);
      const first = parts[0] ? parts[0][0] : "";
      const last = parts[1] ? parts[1][0] : "";
      return (first + last).toUpperCase();
    },

    getUserInitials(fullName) {
      if (!fullName) return "U";

      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      // Get first letter of first name and first letter of last name
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    },

    getChipColor(index) {
      const colors = ["#7b61ff", "#f5c542", "#5abf66", "#ff6b6b"]; // purple, yellow, green, red
      return colors[index % colors.length];
    },
    getTeamsNames(teamIds) {
      if (!teamIds || !Array.isArray(teamIds)) return "No teams";

      return teamIds
        .map((id) => {
          const team = this.teamList.find((team) => team.id === id);
          return team ? team.name : "";
        })
        .filter((name) => name) // Remove empty names
        .join(", ");
    },

    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
      this.requiredQuestionsType = null;
      this.requiredPercentage = null;
      // Reset all form related state
      this.newItem = {
        required_questions: {
          type: null,
          percentage: null,
        },
      };
    },

    editItem(data) {
      this.newItem = JSON.parse(JSON.stringify(data)); // Deep copy to avoid reference issues
      if (data.required_questions) {
        this.requiredQuestionsType = data.required_questions.type || null;
        this.requiredPercentage = data.required_questions.percentage || null;
      } else {
        // Reset form values if no required_questions in data
        this.requiredQuestionsType = null;
        this.requiredPercentage = null;
      }
      this.isFlipped = true;
    },
    // Update the openModal method to properly handle existing status and reviewer
    openModal(selectedRow) {
      this.selectedSurveyId = selectedRow.id;

      // Set the current status as the default selected action
      this.selectedAction = selectedRow.status || "";

      // Set the current reviewer if status is "In Review"
      if (selectedRow.status === "In Review" && selectedRow.reviewer_id) {
        this.selectedReviewer = selectedRow.reviewer_id;
      } else {
        this.selectedReviewer = null;
      }

      // Set the current privacy if status is "Approved"
      if (selectedRow.status === "Approved" && selectedRow.privacy) {
        this.selectedPrivacy = selectedRow.privacy;
      } else {
        this.selectedPrivacy = null;
      }

      console.log("Selected row:", selectedRow);
      this.isModalOpen = true;
    },

    // Handle action change to reset dependent fields
    handleActionChange() {
      this.selectedReviewer = null;
      this.selectedPrivacy = null;
    },

    async takeAction() {
      // Validate required fields based on selected action
      if (!this.selectedAction) {
        notify({
          type: "error",
          text: "Please select an action.",
        });
        return;
      }

      if (this.selectedAction === "In Review" && !this.selectedReviewer) {
        notify({
          type: "error",
          text: "Please select a reviewer.",
        });
        return;
      }

      if (this.selectedAction === "Approved" && !this.selectedPrivacy) {
        notify({
          type: "error",
          text: "Please select a privacy setting.",
        });
        return;
      }

      const payload = {
        surveyId: this.selectedSurveyId,
        status: this.selectedAction,
      };

      // Add reviewer if "In Review" is selected
      if (this.selectedAction === "In Review") {
        payload.reviewerId = this.selectedReviewer;
      }

      // Add privacy and handle stakeholders/teams if "Approved" is selected
      if (this.selectedAction === "Approved") {
        payload.privacy = this.selectedPrivacy;

        if (this.selectedPrivacy === "Private") {
          // Send to stakeholders and teams
          payload.sendToStakeholders = true;
          payload.sendToTeams = true;
        } else if (this.selectedPrivacy === "Public") {
          // Send to all users
          payload.sendToAllUsers = true;
        }
      }

      try {
        // Call API to update survey status
        const response = await this.api.takeAction(payload);
        if (payload.status == "Draft") {
          notify({
            type: "error",
            text: "Survey status is required",
          });
        } else {
          // Show success notification
          notify({
            type: "success",
            text: "Survey status updated successfully",
          });

          // Close modal and refresh table
          this.isModalOpen = false;
          this.$refs.table.refreshTable();
        }
      } catch (error) {
        console.error("Error updating survey status:", error);
        notify({
          type: "error",
          text: this.$t(
            "survey.this_survey_has_no_questions_please_add_questions_first"
          ),
        });
      }
    },

    async closeModal() {
      this.isModalOpen = false;
    },

    async fetchUsers() {
      const response = await this.user.getAll({
        select: "id|full_name|email|team_ids|is_locked",
      });
      this.userList = response;
      this.userID = Auth.USER.id;
      this.isSuper = Auth.USER.super;
      console.log("Fetched users:", this.userID);

      this.fromFields.find(
        (field) => field.name === "stakeholder_ids"
      ).options = response;
      this.fromFields.find((field) => field.name === "owner_id").options =
        response;
    },

    async fetchTeams() {
      this.baseurl = window.location.origin;

      const teamList = await this.team.getAll({ select: "id|name" });
      this.teamList = teamList;
      console.log("Fetched teams:", teamList);

      this.fromFields.find((field) => field.name === "team_ids").options =
        teamList;
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
      };

      console.log(
        "Updated newItem.required_questions:",
        this.newItem.required_questions
      );
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
      if (this.requiredPercentage > 0) {
        this.requiredPercentage = Math.min(
          100,
          Math.max(1, this.requiredPercentage)
        );
        this.updateRequiredQuestionsInNewItem();
      } else {
        this.$notify({
          type: "error",
          text: "Percentage must be between 1 and 100",
        });
        this.requiredPercentage = null;
      }
    },

    viewQuestions(surveyId) {
      this.$router.push({ name: "SurveyQuestion", params: { id: surveyId } });
    },

    QuestionsResponse(surveyId) {
      this.$router.push({
        name: "QuestionsResponse",
        params: { id: surveyId },
      });
    },

    surveyResponse(surveyId) {
      this.$router.push({ name: "SurveyResponse", params: { id: surveyId } });
    },

    surveyStatistics(surveyId) {
      this.$router.push({ name: "SurveyStatistics", params: { id: surveyId } });
    },

    async sendSurvey(surveyId) {
      this.baseurl = window.location.origin;
      const surveyData = await this.api.show(surveyId);
      const teamIds = surveyData.team_ids;
      // const usersEmailByTeam_ids = this.userList.filter((user) => teamIds.includes(user.team_ids))//.map((user) => user.email);
      const usersEmailByTeam_ids = this.userList
        .filter((user) => user.team_ids.some((id) => teamIds.includes(id)))
        .map((user) => user.email);

      const stakeholdersEmails = this.userList
        .filter((user) => surveyData.stakeholder_ids.includes(user.id))
        .map((user) => user.email);

      const activatedUsersEmails = this.userList
        .filter((user) => user.is_locked == false)
        .map((user) => user.email);
      console.log("stakeholders", stakeholdersEmails);

      const response = await this.api.sendSurvey(
        surveyId,
        usersEmailByTeam_ids,
        activatedUsersEmails,
        stakeholdersEmails,
        this.baseurl
      );
      if (response.status === 200) {
        this.$notify({
          type: "success",
          text: "Mails sent successfully",
        });
      }
    },

    async clone(surveyId) {
      try {
        const originalSurvey = await this.api.show(surveyId);

        // Create a new survey with "Clone" appended to the name
        const newSurvey = {
          ...originalSurvey,
          name: `${originalSurvey.name} - Clone`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const response = await this.api.insert(newSurvey);
        let questions = await this.question.getAll({
          filterIn: `survey_id|${surveyId}`,
        });

        // Sort questions by created_at to maintain the original order
        questions.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        // Clone each question and associate it with the new survey
        for (const question of questions) {
          const newQuestion = {
            ...question,
            survey_id: response.data.id, // Associate with the new survey
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Save the new question to the database
          await this.question.insert(newQuestion);
        }
        this.$refs.table.refreshTable();

        this.$notify({
          type: "success",
          text: "Survey cloned successfully",
        });
      } catch (error) {
        console.error("Error cloning survey:", error);
        alert("Failed to clone survey. Please try again.");
      }
    },

    async generateLink(id) {
      const link = `${this.baseurl}/survey-response/answer/out/${id}`;
      try {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        this.$notify({
          type: "success",
          text: this.$t("survey.link_copied_to_clipboard"),
        });
      } catch (err) {
        console.error("Failed to copy link: ", err);
      }
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
.text-bg-warning {
  background-color: #ebdcb3 !important;
  color: #c4951b !important;
  font-size: 13px;
  border-radius: 30px !important;
}

.text-bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
  font-size: 13px;
  border-radius: 30px !important;
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

/* Status Modal Styles - Matching the design image */
.status-modal-content {
  background-color: #f8f8f8;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  padding: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}

.status-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.status-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.status-modal-close:hover {
  color: #111827;
}

.status-modal-body {
  padding: 24px;
  background-color: white;
  margin: 0px 16px;
  border-radius: 15px;
}

.status-form-group {
  margin-bottom: 20px;
}

.status-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.status-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.status-select:focus {
  border-color: #6E3894;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.status-select:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.status-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 10px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.status-btn {
  padding: 4px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.status-btn-cancel {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.status-btn-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.status-btn-save {
  background-color: #6E3894;
  color: #ffffff;
  /* padding: 10px 32px; */
}

.status-btn-save:hover {
  background-color: #6d28d9;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  /* Rounded corners */
  width: 90%;
  max-width: 750px;
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
  max-height: 60vh; /* Limit the height of the modal body */
  overflow-y: auto; /* Enable vertical scrolling if content overflows */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  width: 100%; /* Ensure the modal body takes full width */
}

.modal-body p {
  white-space: normal; /* Ensure text wraps */
  word-wrap: break-word; /* Break long words if necessary */
  overflow-wrap: break-word; /* Modern alternative to word-wrap */
  max-width: 100%; /* Ensure the text doesn't overflow its container */
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.ck-editor__editable {
  min-height: 200px !important;
}

select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.custom-tabs {
  font-family: "Cairo", "cairoregular", "Cambria", "Cochin", "Georgia", "Times",
    "Times New Roman", "sans-serif";
}

.nav-tabs {
  /* border-bottom: 2px solid #dee2e6; */
}

.bg-infoo {
  background-color: #d0b5e3 !important;
  color: #43235c !important;
  font-weight: 300 !important;
  padding: 8px;
  border-radius: 15px;
  font-size: 13px;
}
.nav-link {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  background-color: #f8f9fa;
  border: 1px solid transparent;
  border-radius: 4px 4px 0 0;
  margin-right: 5px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.nav-link.active {
  color: #fff;
  background-color: #44225c;
  border-color: #44225c;
}

.nav-link.active:hover {
  background-color: #44225c;
  border-color: #44225c;
}

/* Custom Radio Button Styles - Matching the image */
.radio-group-container {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.custom-radio-option {
  flex: 1;
  position: relative;
}

.custom-radio-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.custom-radio-label {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
  min-height: 56px;
}

.custom-radio-label:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.custom-radio-input:checked + .custom-radio-label {
  border-color: #6E3894;
  background-color: #f5f3ff;
}

.radio-checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-radio-input:checked + .custom-radio-label .radio-checkmark {
  border-color: #6E3894;
  background-color: #6E3894;
}

.custom-radio-input:checked + .custom-radio-label .radio-checkmark::after {
  content: '';
  width: 8px;
  height: 8px;
  background-color: #ffffff;
  border-radius: 50%;
  position: absolute;
}

.radio-text {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.custom-radio-input:checked + .custom-radio-label .radio-text {
  color: #6d28d9;
}

/* Percentage Input Container */
.percentage-input-container {
  margin-top: 16px;
}

.percentage-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.percentage-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  background-color: #ffffff;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s ease;
}

.percentage-input:focus {
  border-color: #6E3894;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.percentage-input::placeholder {
  color: #9ca3af;
}

/* User avatars container */
.user-avatars-container {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
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

/* User name text next to avatar */
.user-name-text {
  font-size: 14px;
  color: #333;
  margin-left: 4px;
}

/* Stakeholder avatars container - for overlapping circles */
.stakeholder-avatars-container {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

/* Individual stakeholder avatar */
.stakeholder-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #333;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  transition: all 0.2s ease-in-out;
}

/* Color scheme for stakeholder avatars matching the image */
.stakeholder-avatar.avatar-color-1 {
  background-color: #a78bca;
  color: #4a3960;
}

.stakeholder-avatar.avatar-color-2 {
  background-color: #e8d7a0;
  color: #8b7534;
}

.stakeholder-avatar.avatar-color-3 {
  background-color: #a8c5a8;
  color: #3d5a3d;
}

/* Count badge for +N stakeholders */
.stakeholder-count-badge {
  background-color: #d4d4d4 !important;
  color: #333 !important;
  font-size: 18px;
  font-weight: 700;
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
</style>
<style>
.vs__dropdown-menu {
  max-height: 200px !important;
}
.action-dropdown .dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
}
.table-actions .dropdown-menu .dropdown-item {
  opacity: 1 !important;
}

.dropdown-menu .dropdown-item {
  background-color: transparent !important;
  color: inherit !important;
}

.dropdown-menu .dropdown-item:hover,
.dropdown-menu .dropdown-item:focus {
  background-color: transparent !important;
  color: inherit !important;
}
table .dropdown-menu .dropdown-item {
  border-top: 1px solid #efefef !important;
}

.delete_button {
  display: none !important;
}
.edit_button {
  display: none !important;
}

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

.vs__selected {
  margin: 5px !important;
}

.form-select {
  border-radius: 11px !important;
}
</style>
