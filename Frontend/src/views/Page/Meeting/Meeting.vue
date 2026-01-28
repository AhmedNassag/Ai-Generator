<template>
  <div class="meeting-view">
    <!-- Main Page component where the layout and page structure are set -->
    <main-page
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="$t('committee.committee_mngt')"
      :subPage="$t('meeting.meetings')"
      :titlePage="$t('meeting.meetings')"
    >
      <!-- Slot for rendering the DataTable -->
      <template #datatable>
        <!-- filters -->
        <div class="row">
          <!-- <div class="col-md-4 col-lg-4 mb-3">
            <label for="meetingCommitttee">{{
              $t("committee.committee")
            }}</label>
            <select
              id="meetingCommitttee"
              class="form-control"
              v-model="filter.committee_id"
            >
              <option value="">{{ $t("common.all") }}</option>
              <option
                v-for="committee in committees"
                :key="committee.id"
                :value="committee.id"
              >
                {{ committee.name }}
              </option>
            </select>
          </div>

          <div class="col-md46 col-lg-4 mb-3">
            <label for="mainTopicFilter">{{ $t("agenda.agenda") }}</label>
            <select
              id="mainTopicFilter"
              class="form-control"
              v-model="filter.agenda_id"
            >
              <option value="">{{ $t("common.all") }}</option>
              <option
                v-for="agenda in agendas"
                :key="agenda.id"
                :value="agenda.id"
              >
                {{ agenda.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4 col-lg-4 mb-3">
            <label for="meetingStatus">{{ $t("common.status") }}</label>
            <select
              id="meetingStatus"
              class="form-control"
              v-model="filter.status"
            >
              <option value="">{{ $t("common.all") }}</option>
              <option value="upcoming">{{ $t("meeting.upcoming") }}</option>
              <option value="ongoing">{{ $t("meeting.ongoing") }}</option>
              <option value="completed">{{ $t("meeting.completed") }}</option>
              <option value="cancelled">{{ $t("meeting.cancelled") }}</option>
            </select>
          </div> -->

          <div class="col-md-6 col-lg-6 mb-3">
            <label for="meetingStatus">{{ $t("meeting.from_date") }}</label>
            <input type="date" class="form-control" v-model="filter.fromDate" />
          </div>
          <div class="col-md-6 col-lg-6 mb-3">
            <label for="meetingStatus">{{ $t("meeting.to_date") }}</label>
            <input type="date" class="form-control" v-model="filter.toDate" />
          </div>
        </div>
        <DataTable
          ref="table"
          id="meeting-example-table"
          :tableClass="'table table-striped table-bordered'"
          :columns="tableColumns"
          :api="api"
          :apiParams="apiParams"
          :editItem="editItem"
          :openForm="openForm"
          :hideAddNewButton="!areYouFrom3BigPosition"
          :hideActionsColumn="!areYouFrom3BigPosition"
          :hideActions="hideActions"
          :filters="FilterData"
        >
          <template #title="{ item }">
            <router-link
              :to="{ path: `/meeting-details/${item.id}` }"
              class="badge badge-user text-decoration-none"
            >
              {{ item.title }}
            </router-link>
          </template>
          <template #agenda="{ item }">
            <router-link
              :to="{ path: `/agenda-details/${item.agenda_id}` }"
              class="badge badge-user text-decoration-none"
            >
              {{ item?.agenda?.name }}
            </router-link>
          </template>
          <template #scheduled_time="{ item }">
            <div>
              <p>{{ formatSameDayRange(item.start_date, item.end_date) }}</p>
            </div>
          </template>
          <template #status="{ item }">
            <span
              v-if="item.status === 'upcoming'"
              class="badge badge-orange text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.upcoming") }}
            </span>
            <span
              v-if="item.status === 'ongoing'"
              class="badge badge-moove text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.ongoing") }}
            </span>
            <span
              v-else-if="item.status === 'completed'"
              class="badge badge-green text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.completed") }}
            </span>
            <span
              v-else-if="item.status === 'cancelled'"
              class="badge badge-red text-decoration-none"
              style="display: block; margin: auto"
            >
              {{ $t("common.cancelled") }}
            </span>
          </template>
          <template #created_by="{ item }">
            <a
              v-if="item.created_by"
              href="#"
              @click.prevent="openAssigneeDetailsModal(item.created_by)"
              class="badge badge-user text-decoration-none"
            >
              {{ getUserNameByID(item.created_by) || $t("common.na") }}
            </a>
            <span v-else>{{ $t("common.na") }}</span>
          </template>
          <template #addAction="{ item }">
            <a
              href="javascript:void(0)"
              @click.prevent="openFilesModal(item)"
              class="dropdown-item"
            >
              <i class="icofont icofont-file-document p-1"></i>
              {{ $t("meeting.files") }}
            </a>
          </template>
          <template #edit="{ item }">
            <a
              href="javascript:void(0)"
              @click="editItem(item)"
              class="edit_button dropdown-item"
              v-if="
                areYouFrom3BigPosition &&
                item.status !== 'completed' &&
                item.status !== 'cancelled'
              "
            >
              <i class="fas fa-edit"></i> {{ $t("common.edit") }}
            </a>
            <div v-else></div>
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
          <!-- Custom Start Date Field -->
          <template #start_date="{ item }">
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="start_date" class="form-label">{{
                  $t("common.start_date")
                }}</label>
                <Datepicker
                  v-model="newItem.start_date"
                  :enable-time-picker="true"
                  :min-date="new Date()"
                  :format="dateFormat"
                  :preview-format="datePreviewFormat"
                  :placeholder="$t('meeting.select_start_date')"
                  :disabled="isReadonly"
                  :clearable="true"
                  :close-on-scroll="true"
                  :auto-apply="false"
                  :week-start="1"
                  :time-picker-inline="false"
                  :menu-class-name="'dp-custom-menu'"
                  :input-class-name="'form-control'"
                  :auto-position="false"
                  :position="'bottom'"
                  :calendar-class-name="'dp-custom-calendar'"
                  @update:model-value="onStartDateChange"
                  @cleared="onStartDateCleared"
                >
                  <template #trigger>
                    <button
                      @click.prevent
                      class="btn btn-outline-secondary w-100 text-start"
                    >
                      <i class="fas fa-calendar-alt me-2"></i>
                      {{
                        formatDisplayDate(newItem.start_date) ||
                        $t("meeting.select_start_date")
                      }}
                    </button>
                  </template>
                </Datepicker>
              </div>
            </div>
          </template>

          <!-- Custom End Date Field -->
          <template #end_date="{ item }">
            <div class="col-md-4 mb-3" style="z-index: 999">
              <div class="form-group">
                <label for="end_date" class="form-label">{{
                  $t("meeting.end_date")
                }}</label>
                <Datepicker
                  v-model="newItem.end_date"
                  :enable-time-picker="true"
                  :min-date="minEndDate"
                  :max-date="maxEndDate"
                  :format="dateFormat"
                  :preview-format="datePreviewFormat"
                  :placeholder="$t('meeting.select_end_date')"
                  :disabled="isReadonly || !newItem.start_date"
                  :clearable="true"
                  :close-on-scroll="true"
                  :auto-apply="false"
                  :week-start="1"
                  :time-picker-inline="false"
                  :menu-class-name="'dp-custom-menu'"
                  :input-class-name="'form-control'"
                  :auto-position="false"
                  :position="'bottom'"
                  :calendar-class-name="'dp-custom-calendar'"
                  @update:model-value="onEndDateChange"
                  @cleared="onEndDateCleared"
                >
                  <template #trigger>
                    <button
                      class="btn btn-outline-secondary w-100 text-start"
                      :disabled="!newItem.start_date"
                      @click.prevent
                    >
                      <i class="fas fa-calendar-alt me-2"></i>
                      {{
                        formatDisplayDate(newItem.end_date) ||
                        $t("meeting.select_end_date")
                      }}
                    </button>
                  </template>
                </Datepicker>
              </div>
            </div>
          </template>

          <!-- Duration Display -->
          <template #duration="{ item }">
            <div class="col-md-4" v-if="newItem.start_date && newItem.end_date">
              <div class="form-group">
                <label class="form-label">{{ $t("meeting.duration") }}</label>
                <div class="duration-display p-2 bg-light border rounded">
                  <i class="fas fa-clock me-2"></i>
                  <span>{{ calculateDuration() }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-4" v-else></div>
          </template>

          <template #meeting_files="item">
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <label for="meeting_files" class="form-label">{{
                  $t("meeting.meeting_files")
                }}</label>
                <input
                  type="file"
                  class="form-control"
                  id="file"
                  @change="handleFileChange"
                  multiple
                />
                <!-- <small class="form-text text-muted"
                >Select the meeting files for the meeting</small> -->
                <small class="form-text text-muted">
                  {{
                    newItem.id && newItem.meeting_files
                      ? $t("meeting.upload_files_to_replace_the_current_one")
                      : $t("meeting.please_upload_files_of_the_meeting")
                  }}
                </small>
              </div>
            </div>
          </template>

          <!-- Custom participants selector -->
          <!-- <template #participants="item">
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <label for="name" class="form-label"
                  >{{ $t("meeting.participants")
                  }}<span class="text-danger">*</span></label
                >
                <v-select
                  :disabled="!isSelectedCommittee"
                  label="full_name"
                  :rules="[required]"
                  :options="participants || []"
                  v-model="newItem.participants"
                  :placeholder="$t('meeting.select_participants')"
                  multiple
                  :selectable="
                    (option) =>
                      !newItem?.participants?.some(
                        (p) => p && p.id === option.id
                      )
                  "
                  @update:modelValue="handleParticipantsChange"
                >
                  <template #option="{ full_name, type }">
                    <div>
                      <span class="option-name me-5">{{ full_name }}</span>
                      <span class="badge badge-primary me-2">
                        {{ type }}
                      </span>
                    </div>
                  </template>
                </v-select>
                <small class="form-text text-muted">{{
                  $t("meeting.select_participants")
                }}</small>
              </div>
            </div>
          </template> -->

          <template #participants="item">
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <div
                  class="d-flex justify-content-between align-items-center mb-2"
                >
                  <label for="name" class="form-label mb-0"
                    >{{ $t("meeting.participants")
                    }}<span class="text-danger">*</span></label
                  >

                  <!-- Select All Checkbox - Now on the same line as label -->
                  <div
                    class="form-check"
                    v-if="participants && participants.length > 0"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="selectAllParticipants"
                      :checked="areAllParticipantsSelected"
                      :indeterminate="
                        isSomeParticipantsSelected &&
                        !areAllParticipantsSelected
                      "
                      @change="toggleSelectAllParticipants"
                      :disabled="!isSelectedCommittee"
                    />
                    <label class="form-check-label" for="selectAllParticipants">
                      {{ $t("common.select_all") }}
                    </label>
                  </div>
                </div>

                <v-select
                  :disabled="!isSelectedCommittee"
                  label="full_name"
                  :rules="[required]"
                  :options="participants || []"
                  v-model="newItem.participants"
                  :placeholder="$t('meeting.select_participants')"
                  multiple
                  :selectable="
                    (option) =>
                      !newItem?.participants?.some(
                        (p) => p && p.id === option.id
                      )
                  "
                  @update:modelValue="handleParticipantsChange"
                >
                  <template #option="{ full_name, type }">
                    <div>
                      <span class="option-name me-5">{{ full_name }}</span>
                      <span class="badge badge-primary me-2">
                        {{ type }}
                      </span>
                    </div>
                  </template>
                </v-select>

                <!-- Select All Checkbox - Removed since it's now with the label -->

                <small class="form-text text-muted">{{
                  $t("meeting.select_participants")
                }}</small>
              </div>
            </div>
          </template>
          <!-- Custom invited participants template -->
          <template #invited_participants="item">
            <div class="col-sm-12 col-md-12 mt-3">
              <div class="form-group">
                <label for="invited_participants" class="form-label">{{
                  $t("meeting.invited_participants")
                }}</label>

                <!-- Custom input section for adding new invited participants -->
                <div class="custom-participant-input mb-3 p-3 border rounded">
                  <div class="row mb-3">
                    <div class="col-md-5">
                      <input
                        type="text"
                        class="form-control"
                        v-model="newInvitedParticipant.full_name"
                        :placeholder="$t('common.name')"
                      />
                    </div>
                    <div class="col-md-5">
                      <input
                        type="email"
                        class="form-control"
                        v-model="newInvitedParticipant.email"
                        :placeholder="$t('common.email')"
                      />
                    </div>
                    <div class="col-md-2">
                      <button
                        type="button"
                        class="btn btn-primary"
                        @click="addCustomParticipant"
                        :disabled="
                          !newInvitedParticipant.full_name ||
                          !newInvitedParticipant.email
                        "
                      >
                        <i class="fas fa-plus"></i> {{ $t("meeting.invite") }}
                      </button>
                    </div>
                  </div>
                  <!-- Vue Select for managing invited participants -->
                  <v-select
                    label="full_name"
                    :rules="[required]"
                    :options="invitedParticipantsList || []"
                    v-model="newItem.invited_participants"
                    :placeholder="$t('meeting.add_invited_participants')"
                    multiple
                    :selectable="
                      (option) =>
                        option &&
                        !newItem?.invited_participants?.some(
                          (p) => p && p.id === option.id
                        )
                    "
                    @update:modelValue="handleInvitedParticipantsChange"
                  >
                    <template #option="{ full_name, email }">
                      <div
                        class="d-flex justify-content-between align-items-center"
                        v-if="full_name && email"
                      >
                        <div>
                          <span class="option-name me-2">{{ full_name }}</span>
                          <small class="text-muted">{{ email }}</small>
                        </div>
                      </div>
                    </template>

                    <template #selected-option="{ full_name, email }">
                      <div
                        class="d-flex justify-content-between align-items-center w-100"
                        v-if="full_name && email"
                      >
                        <div>
                          <span>{{ full_name }}</span>
                          <small class="text-muted ms-1">({{ email }})</small>
                        </div>
                      </div>
                    </template>
                  </v-select>
                  <small class="form-text text-muted">
                    {{
                      $t(
                        "meeting.add_invited_participants_by_entering_their_name_and_email"
                      )
                    }}
                  </small>
                </div>
              </div>
            </div>
          </template>
        </Form>
      </template>
    </main-page>

    <FileActionsModal
      :visible="showFileModal"
      :files="selectedFiles"
      :loading="isFileActionLoading"
      :loadingFileId="loadingFileId"
      @close="showFileModal = false"
      @edit="handleFileEdit"
      @delete="handleFileDelete"
      @upload="handleFileUpload"
      @edit-start="loadingFileId = $event"
      @edit-cancel="loadingFileId = null"
      @delete-start="loadingFileId = $event"
    />

    <!-- View user details modal -->
    <ViewUserDetails
      :viewUserModal="viewUserModal"
      :userData="userData"
      @close="viewUserModal = false"
      @update:viewUserModal="viewUserModal = $event"
    />
  </div>
</template>

<script>
// Importing necessary components and API modules
import meeting from "@/API/Meeting/Meeting";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Agenda from "@/API/Agenda/Agenda";
import Committee from "@/API/Committee/Committee";
import Auth from "@/API/Auth";
import User from "@/API/User/User";
import VueSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import FileActionsModal from "@/components/commen/FileActionsModal.vue";
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue"; // Importing the view user details component
import Department from "@/API/Department/Department";
import { defineRule } from "vee-validate";
import { useRoute } from "vue-router";

export default {
  components: {
    MainPage, // Main page layout component
    Form, // Form component for adding/editing items
    DataTable, // DataTable component for displaying tabular data
    Datepicker,
    "v-select": VueSelect,
    FileActionsModal,
    ViewUserDetails,
  },

  props: {
    committeeData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const route = useRoute();
    // Initialize API and other required properties
    const api = new meeting();
    const agendaApi = new Agenda();
    const committeeApi = new Committee();
    const departmentApi = new Department();
    const userApi = new User();
    const apiParams = {
      with: [
        "agenda:id,name,agenda_id",
        "committee:id,name,chairperson_id,vice_chair_id,secretary_id,member_ids",
      ],
      filter: `participants.id|${Auth.USER.id}|=`,
    };
    apiParams.filterWhereRelation = [];
    if (route.name === "committeeDetails") {
      apiParams.filterWhereRelation.push(`committee@id|${route.params.id}|=`);
    }
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields

    // Return properties for setup to be used in the template
    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      agendaApi,
      committeeApi,
      userApi,
      departmentApi,
    };
  },
  watch: {
    "newItem.committee_id": {
      handler(newVal) {
        const committee = this.committees.find(
          (committee) => committee.id === newVal
        );

        if (newVal != null) {
          console.log("new val", newVal);
          this.isSelectedCommittee = true;
        } else {
          console.log("new val", newVal);
          this.isSelectedCommittee = false;
        }
      },
      deep: true,
    },
    filter: {
      deep: true, // Enable deep watching for nested properties
      handler(newFilter) {
        // Construct the filter string for apiParams
        const filtersObject = [];
        if (newFilter.committee_id) {
          filtersObject.push(`committee_id|${newFilter.committee_id}|=`);
        }
        if (newFilter.agenda_id) {
          filtersObject.push(`agenda_id|${newFilter.agenda_id}|=`);
        }
        if (newFilter.status) {
          filtersObject.push(`status|${newFilter.status}|=`);
        }
        if (newFilter.fromDate && newFilter.toDate) {
          filtersObject.push(`start_date|${newFilter.fromDate}-date|>`);
          filtersObject.push(`start_date|${newFilter.toDate}-date|<=`);
        }
        this.apiParams.filter = filtersObject.join("&&");
        this.$refs.table.refreshTable(); // Refresh the table to apply the new filter
      },
    },
  },

  async mounted() {
    this.users = await this.userApi.getAll({
      select: "id|full_name|type|department_id|phone|username|email",
    });
    await this.fetchDepartments();
    await this.fetchAgendas();

    this.committees = await this.committeeApi.getAll({
      select: "id|name|chairperson_id|vice_chair_id|secretary_id|member_ids",
    });
    const committeeField = this.fromFields.find(
      (field) => field.name === "committee_id"
    );
    committeeField.options = this.committees.map((committee) => ({
      id: committee.id,
      name: committee.name,
    }));
    this.currentCommittee = this.committees.find(
      (committee) => committee.id === this.$route.params.id
    );

    this.participants = await this.userApi.getAll({
      select: "id|full_name|email",
    });

    const committee = this.committees.find(
      (committee) => committee.id === this.$route.params.id
    );
    const members = (committee?.member_ids ?? []).map((id) => ({
      id,
      type: "member",
    }));
    const allParticipants = [
      {
        id: committee?.chairperson_id,
        type: "chairperson",
      },
      {
        id: committee?.vice_chair_id,
        type: "vice_chair",
      },
      {
        id: committee?.secretary_id,
        type: "secretary",
      },
      ...members,
    ];
    // Find full user data and keep the type
    this.participants = allParticipants
      .map(({ id, type }) => {
        const user = this.users.find((user) => user.id === id);
        return user
          ? { ...user, type, attendded: false, RSVPStatus: "pending" }
          : null;
      })
      .filter(Boolean); // remove nulls if any user not found
    const participantField = this.fromFields.find(
      (field) => field.name === "participants"
    );
    participantField.options = this.participants.map((participant) => ({
      id: participant.id,
      name: participant.full_name,
    }));

    // const participantField = this.fromFields.find(
    //   (field) => field.name === "participants"
    // );
    // participantField.options = this.participants.map((participant) => ({
    //   id: participant.id,
    //   name: participant.full_name,
    // }));
  },

  data() {
    return {
      FilterData: [],
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {
        start_date: null,
        end_date: null,
        duration: "",
        invited_participants: [],
        participants: [],
      }, // Data object to store the currently selected item for editing or new item
      dateFormat: "dd/MM/yyyy HH:mm",
      datePreviewFormat: "dd/MM/yyyy HH:mm",
      agendas: [],
      committees: [],
      meetingDuration: null,
      users: [],
      participants: [],
      newInvitedParticipant: {
        full_name: "",
        email: "",
      },
      invitedParticipantsList: [], // This should be used in your field options
      customParticipantId: 1000, // Fixed variable name
      selectedFiles: [],
      viewUserModal: false,
      isFileActionLoading: false,
      showFileModal: false,
      selectedMeeting: {},
      filter: {
        committee_id: "",
        agenda_id: "",
        status: "",
        fromDate: "", //new Date().toISOString().split("T")[0],
        toDate: "", //new Date().toISOString().split("T")[0],
      },
      departments: [],
      isSelectedCommittee: false,
      currentCommittee: null,
    };
  },

  computed: {
    areYouFrom3BigPosition() {
      return (
        this.committeeData.chairperson_id === Auth.USER.id ||
        this.committeeData.vice_chair_id === Auth.USER.id ||
        this.committeeData.secretary_id === Auth.USER.id
      );
    },

    areAllParticipantsSelected() {
      if (!this.participants || this.participants.length === 0) return false;
      if (!this.newItem.participants || this.newItem.participants.length === 0)
        return false;

      return this.participants.length === this.newItem.participants.length;
    },
    hideActions() {
      return (row) => {
        return {
          // edit: !this.areYouFrom3BigPosition,
          delete: !this.areYouFrom3BigPosition,
        };
      };
    },

    isSomeParticipantsSelected() {
      if (!this.newItem.participants) return false;
      return this.newItem.participants.length > 0;
    },
    participantRules() {
      return [this.required];
    },

    // Calculate minimum end date based on start date
    minEndDate() {
      if (this.newItem.start_date) {
        const startDate = new Date(this.newItem.start_date);
        // End date should be at least 15 minutes after start date
        return new Date(startDate.getTime() + 15 * 60000);
      }
      return new Date();
    },

    maxEndDate() {
      if (this.newItem.start_date) {
        const startDate = new Date(this.newItem.start_date);
        // Set to end of the same day (23:59:59)
        const endOfDay = new Date(startDate);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay;
      }
      return null;
    },

    nowDate() {
      return new Date().toISOString().split("T")[0];
    },
  },

  created() {
    if (this.$route.name === "CommitteeDetails")
      this.newItem.committee_id = this.$route.params.id;

    // Populate FilterData with translated labels
    this.FilterData = [
      {
        title: this.$t("committee.committee"),
        key: "committee_id",
        type: "string",
        data: "committee",
        id: "id",
        display: "name",
        filterType: "filter",
      },
      {
        title: this.$t("agenda.agenda"),
        key: "agenda_id",
        type: "string",
        data: "agenda",
        id: "id",
        display: "name",
        filterType: "filter",
      },
      {
        title: this.$t("common.status"),
        key: "status",
        type: "string",
        data: [
          { id: "upcoming", name: this.$t("meeting.upcoming") },
          { id: "ongoing", name: this.$t("meeting.ongoing") },
          { id: "completed", name: this.$t("meeting.completed") },
          { id: "cancelled", name: this.$t("meeting.cancelled") },
        ],
        filterType: "filter",
      },
    ];

    // Initialize the table columns and form fields when the component is created
    this.tableColumns = [
      {
        id: "title",
        title: this.$t("meeting.title"),
        data: "title",
        defaultContent: "N/A",
      },
      {
        id: "agenda",
        title: this.$t("agenda.agenda"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("common.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "scheduled_time",
        title: this.$t("meeting.scheduled_time"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "created_by",
        title: this.$t("common.created_by"),
        // data: "created_by",
        data: "_USERSERVICE._User.created_by.full_name",
        defaultContent: "N/A",
      },
    ];

    // Define the form fields schema with validation rules, types, and descriptions
    this.fromFields = [
      {
        name: "title",
        label: this.$t("meeting.title"),
        type: "text", // Text input field
        rules: "required", // Validation rule: required field
        placeholder: this.$t("meeting.please_enter_title_of_meeting"),
        col: 6, // Column size in the form layout
      },
      {
        type: "options", // Dropdown/select field
        name: "type",
        label: this.$t("meeting.type"),
        options: [
          { name: "In System", id: "in_system" },
          { name: "Out System", id: "out_system" },
        ],
        optionLabel: "name",
        col: 6,
        rules: "", // Validation: required selection
        description: this.$t("meeting.select_type_for_the_meeting"),
        disabled: true,
      },
      {
        type: "options", // Dropdown/select field
        name: "agenda_id",
        label: this.$t("agenda.agendas"),
        options: this.agendas || [],
        optionLabel: "name",
        col: 6,
        rules: "required", // Validation: required selection
        description: this.$t("meeting.select_agenda_for_the_meeting"),
      },
      {
        name: "platform",
        label: this.$t("meeting.Meeting_Location_OR_URL"),
        type: "text", // Text input field for email
        rules: "required", // Validation rule: required and valid email format
        placeholder: this.$t("meeting.Meeting_Location_OR_URL"),
        col: 6,
      },
      {
        name: "start_date",
        // This will be handled by the custom template
      },
      {
        name: "end_date",
        // This will be handled by the custom template
      },
      {
        name: "duration",
        // This will be handled by the custom template
      },
      {
        type: "hidden",
        name: "committee_id",
      },
      {
        // type: "options", // Dropdown/select field
        name: "participants",
        // label: this.$t("meeting.participants"),
        // options: [],
        // optionLabel: "name",
        // col: 6,
        // rules: "required", // Validation: required selection
        // description: "Select participants for the meeting",
        // multiple: true,
      },
      {
        type: "options", // Dropdown/select field
        name: "invited_participants",
        label: this.$t("meeting.invited_participants"),
        options: this.invitedParticipantsList,
        optionLabel: "full_name",
        col: 12,
        rules: "required", // Validation: required selection
        description: this.$t("meeting.select_participants_for_the_meeting"),
        multiple: true,
      },
      {
        name: "meeting_files",
        col: 6,
      },
      {
        name: "notes",
        label: this.$t("meeting.notes"),
        type: "textarea", // Multi-line text field
        rules: "", // Validation rule: required field
        description: this.$t("meeting.provide_a_description_of_the_meeting"),
        col: 12,
      },
    ];
  },

  methods: {
    isCompltedOrCancelled(item) {
      // alert("item status: " + item);
      return item.status === "completed" || item.status === "cancelled";
    },
    formatDate(date) {
      if (!date) return this.$t("common.na");

      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      const hours = d.getHours() % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = d.getHours() >= 12 ? "PM" : "AM";

      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
      // return `${day}/${month}/${year}`;
    },
    toggleSelectAllParticipants(event) {
      if (!this.participants || !this.isSelectedCommittee) return;

      if (event.target.checked) {
        // Select all participants
        this.newItem.participants = [...this.participants];
      } else {
        // Deselect all participants
        this.newItem.participants = [];
      }
    },

    // Update your existing handleParticipantsChange method to handle the indeterminate state
    handleParticipantsChange(value) {
      if (!this.newItem) return;
      if (Array.isArray(value)) {
        // Filter out null values from participants
        this.newItem.participants = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (value === null || value === undefined) {
        this.newItem.participants = [];
      } else {
        this.newItem.participants = [value];
      }

      // Update the indeterminate state of the checkbox
      this.$nextTick(() => {
        const checkbox = document.getElementById("selectAllParticipants");
        if (checkbox) {
          checkbox.indeterminate =
            this.isSomeParticipantsSelected && !this.areAllParticipantsSelected;
        }
      });
    },
    required(value) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return this.$t("meeting.at_least_one_participant_is_required");
      }
      return true;
    },
    addCustomParticipant() {
      // Use the correct data property name
      if (
        !this.newInvitedParticipant.full_name ||
        !this.newInvitedParticipant.email
      ) {
        return;
      }

      // Check if participant with same email already exists
      const existingParticipant = this.invitedParticipantsList.find(
        (p) => p && p.email === this.newInvitedParticipant.email
      );

      if (existingParticipant) {
        return;
      }

      // Create new participant object
      const newParticipant = {
        id: this.customParticipantId++,
        full_name: this.newInvitedParticipant.full_name,
        email: this.newInvitedParticipant.email,
        type: "guest",
        attendded: false,
        RSVPStatus: "pending",
      };

      // Add to participants list (this will make it available in VueSelect)
      this.invitedParticipantsList.push(newParticipant);

      // Auto-select the new participant - ensure array exists and is clean
      if (
        !this.newItem.invited_participants ||
        !Array.isArray(this.newItem.invited_participants)
      ) {
        this.newItem.invited_participants = [];
      }

      // Filter out any null values before adding new participant
      this.newItem.invited_participants =
        this.newItem.invited_participants.filter(
          (item) => item !== null && item !== undefined && item !== ""
        );

      this.newItem.invited_participants.push(newParticipant);

      // Clear input fields
      this.newInvitedParticipant = {
        full_name: "",
        email: "",
      };
    },

    removeInvitedParticipant(participant) {
      if (!this.newItem.invited_participants || !participant) return;

      // Filter out the participant and any null values
      this.newItem.invited_participants =
        this.newItem.invited_participants.filter(
          (p) => p !== null && p !== undefined && p.id !== participant.id
        );
    },

    handleInvitedParticipantsChange(value) {
      if (!this.newItem) return;

      if (Array.isArray(value)) {
        // Filter out null, undefined, and empty values
        this.newItem.invited_participants = value.filter(
          (item) => item !== null && item !== undefined && item !== ""
        );
      } else if (value === null || value === undefined) {
        this.newItem.invited_participants = [];
      } else {
        this.newItem.invited_participants = [value];
      }
    },
    handleAgendaChange(value) {
      if (!this.newItem) return;
      if (value === null || value === undefined) {
        this.newItem.agenda_id = [];
      } else {
        this.newItem.agenda_id = value;
      }
    },
    //end of methods to add invited participants
    handleParticipantsChange(value) {
      if (!this.newItem) return;
      if (Array.isArray(value)) {
        // Filter out null values from participants
        this.newItem.participants = value.filter(
          (item) => item !== null && item !== undefined
        );
      } else if (value === null || value === undefined) {
        this.newItem.participants = [];
      } else {
        this.newItem.participants = [value];
      }
    },
    getUserNameByID(userId) {
      const user = this.users.find((u) => u.id === userId);
      return user ? user.full_name || user.name : this.$t("common.na");
    },
    formatSameDayRange(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      // Check if dates are on the same day
      const isSameDay =
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

      if (!isSameDay) {
        return this.$t("meeting.dates_not_same_day");
      }

      // Format date (DD/MM/YYYY) with leading zero
      const day = String(startDate.getDate()).padStart(2, "0");
      const month = String(startDate.getMonth() + 1).padStart(2, "0");
      const year = startDate.getFullYear();
      const dateStr = `${day}/${month}/${year}`;

      // Format time as HH:MM AM/PM
      const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert 0 -> 12
        return `${hours}:${minutes} ${ampm}`;
      };

      const startTime = formatTime(startDate);
      const endTime = formatTime(endDate);

      return `${dateStr} from ${startTime} to ${endTime}`;
    },
    getAgendaName(id) {
      const agenda = this.agendas.find((a) => a.id === id);
      return agenda ? agenda.name : this.$t("common.na");
    },
    getCommitteeName(id) {
      const committee = this.committees.find((c) => c.id === id);
      return committee ? committee.name : this.$t("common.na");
    },
    handleFileChange(event) {
      const files = event.target.files;
      if (files) {
        this.newItem.meeting_files = files;
      }
    },
    // Open the form for adding or editing an item
    openForm() {
      this.isFlipped = true; // Show the form
      this.newItem.status = "upcoming";
      if (this.$route.name === "committeeDetails")
        this.newItem.committee_id = this.$route.params.id;
      this.newItem.created_by = Auth.USER?.id;

      this.newItem.type = "in_system";
    },

    // Close the form after submitting or canceling
    closeForm() {
      this.isFlipped = false; // Hide the form
      this.$refs.table.refreshTable(); // Refresh the table data
      this.fetchAgendas();
      this.newItem = {
        start_date: null,
        end_date: null,
        duration: "",
        invited_participants: [],
        participants: [],
      }; // Clear the current item data with proper initialization

      // Clear invited participants data
      this.invitedParticipantsList = [];
      this.newInvitedParticipant = {
        full_name: "",
        email: "",
      };
    },

    // Set the item data for editing
    editItem(data) {
      // Clean the data before setting newItem
      const cleanData = { ...data };

      // Filter out null values from invited_participants if it exists
      if (
        cleanData.invited_participants &&
        Array.isArray(cleanData.invited_participants)
      ) {
        cleanData.invited_participants = cleanData.invited_participants.filter(
          (item) => item !== null && item !== undefined && item !== ""
        );
      }

      // Filter out null values from participants if it exists
      if (cleanData.participants && Array.isArray(cleanData.participants)) {
        cleanData.participants = cleanData.participants.filter(
          (item) => item !== null && item !== undefined
        );
      }

      this.newItem = cleanData; // Set the current item to edit
      // console.log("this.newItem.agendas", this.newItem);
      const filteredAgendas = this.agendas.filter(
        (agenda) =>
          agenda?.committee_id == this.$route.params.id 
          &&(
            agenda?.id == this.newItem?.agenda_id ||
            agenda?.meeting == null
          )
      );
      // console.log("filteredAgendas", filteredAgendas);
      const agendaField = this.fromFields.find(
        (field) => field.name === "agenda_id"
      );
      console.log("this.newItem.agenda", this.agendas);

      agendaField.options = filteredAgendas.map((agenda) => ({
        id: agenda.id,
        name: agenda.name,
      }));
      this.isFlipped = true; // Show the form for editing
    },

    onStartDateChange(date) {
      this.newItem.start_date = date.toISOString().replace("Z", "+00:00");

      if (this.newItem.end_date) {
        const endDate = new Date(this.newItem.end_date);
        const startDate = new Date(date);

        // If same day but earlier time, or earlier day
        if (endDate <= startDate) {
          // Keep same date but set time to start time + 1 hour
          startDate.setHours(startDate.getHours() + 1);
          this.newItem.end_date = startDate
            .toISOString()
            .replace("Z", "+00:00");
        }
      }
    },

    // Handle end date change
    onEndDateChange(date) {
      this.newItem.end_date = date.toISOString().replace("Z", "+00:00");
    },

    // Handle date clearing
    onStartDateCleared() {
      this.newItem.start_date = null;
      this.newItem.end_date = null; // Clear end date when start date is cleared
    },

    onEndDateCleared() {
      this.newItem.end_date = null;
    },

    // Format date for display
    formatDisplayDate(date) {
      if (!date) return null;
      const d = new Date(date);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    // Calculate duration between start and end dates
    calculateDuration() {
      if (!this.newItem.start_date || !this.newItem.end_date) return "";

      const start = new Date(this.newItem.start_date);
      const end = new Date(this.newItem.end_date);
      const diffMs = end - start;

      if (diffMs <= 0) return this.$t("meeting.invalid_duration");

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        this.meetingDuration = `${hours}h ${minutes}m`;
        this.newItem.duration = `${hours}h ${minutes}m`;
        return this.meetingDuration;
      } else {
        this.meetingDuration = `${minutes}m`;
        this.newItem.duration = `${hours}h ${minutes}m`;
        return this.meetingDuration;
      }
    },

    // Set current date and time for quick selection
    setCurrentDateTime() {
      this.newItem.start_date = new Date();
    },

    // Set end date to 1 hour after start date
    setEndDateOneHourLater() {
      if (this.newItem.start_date) {
        const endDate = new Date(this.newItem.start_date);
        endDate.setHours(endDate.getHours() + 1);
        this.newItem.end_date = endDate;
      }
    },

    // Open the file modal for a topic
    openFilesModal(item) {
      this.selectedMeeting = { ...item };

      // Handle both [null] and [default URL] cases by converting to empty array
      this.selectedFiles =
        !this.selectedMeeting.meeting_files ||
        (this.selectedMeeting.meeting_files.length === 1 &&
          this.getFileNameFromPath(this.selectedMeeting.meeting_files[0]) ==
            "files")
          ? []
          : this.selectedMeeting.meeting_files || [];

      this.showFileModal = true;
    },

    // Add this new method to handle file uploads:
    async handleFileUpload(file) {
      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedMeeting };
        delete updatedData.status;
        const updatedFiles = [...this.selectedFiles, file];

        // Update local state immediately for better UX
        this.selectedFiles = updatedFiles;
        updatedData.meeting_files = updatedFiles;

        const response = await this.api.update(updatedData);

        if (response.status == "success") {
          this.selectedMeeting = response.data;
          this.selectedFiles = this.selectedMeeting.meeting_files || [];
          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("meeting.file_uploaded_success"));
        } else {
          throw new Error(response.message || "Failed to upload file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        // Revert local changes if API call fails
        this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
        this.api.poup(null, this.$t("meeting.file_upload_failed"));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    async handleFileEdit(file) {
      const oldFileName = this.getFileName(file.oldFile);
      const newFile = file.newFile;

      try {
        // Show loading state
        this.isFileActionLoading = true;

        // Create updated data
        const updatedData = { ...this.selectedMeeting };
        delete updatedData.status;
        const updatedFiles = this.selectedFiles.filter(
          (f) => f !== file.oldFile
        );
        updatedFiles.push(newFile);

        // Update local state
        this.selectedFiles = updatedFiles;
        updatedData.meeting_files = updatedFiles;
        console.log("*-*-*-updatedData*-*-*:", updatedData);

        const response = await this.api.update(updatedData);
        console.log("-*-*-*-*response*-*-*-".response);
        if (response.status == "success") {
          this.selectedMeeting = response.data;
          this.selectedFiles = this.selectedMeeting.meeting_files || [];
          this.$refs.table.refreshTable(); // Refresh the table data
          this.api.poup(response, this.$t("meeting.file_updated"));
        } else {
          throw new Error(response.message || "Failed to update file");
        }

        console.log("File updated:", oldFileName, "->", newFile.name);
        console.log("selectedMeeting:", this.selectedMeeting);
      } catch (error) {
        console.error("Error updating file:", error);
        // Revert local changes if API call fails
        this.selectedFiles = [
          ...this.selectedFiles.filter((f) => f !== newFile),
          file.oldFile,
        ];
        this.api.poup(response, this.$t("meeting.file_update_failed"));
      } finally {
        // Hide loading state
        this.isFileActionLoading = false;
      }
    },

    getFileNameFromPath(url) {
      return url.split("/").pop();
    },

    async handleFileDelete(fileData) {
      const fileToDelete = fileData.file;
      const fileName = this.getFileName(fileToDelete);
      let response = null;

      try {
        this.isFileActionLoading = true;

        const updatedData = { ...this.selectedMeeting };
        delete updatedData.status;
        const updatedFiles = this.selectedFiles.filter(
          (f) => f !== fileToDelete
        );

        const finalFiles = updatedFiles.map((file) => {
          if (typeof file === "string") return this.getFileNameFromPath(file);
          return file;
        });

        // Handle [null] case by converting to empty array
        updatedData.meeting_files =
          finalFiles.length === 1 && finalFiles[0] == null ? [] : finalFiles;

        this.selectedFiles = updatedData.meeting_files;

        response = await this.api.update(updatedData);

        if (response.status === "success") {
          this.selectedMeeting = response.data;
          // Handle [null] case by converting to empty array
          this.selectedFiles =
            !this.selectedMeeting.meeting_files ||
            (this.selectedMeeting.meeting_files.length === 1 &&
              this.getFileNameFromPath(this.selectedMeeting.meeting_files[0]) ==
                "files")
              ? []
              : this.selectedMeeting.meeting_files || [];

          this.$refs.table.refreshTable();
          this.api.poup(response, this.$t("meeting.file_deleted"));
        } else {
          throw new Error(response.message || "Failed to delete file");
        }

        console.log("File deleted:", fileName);
        console.log("selectedMeeting:", this.selectedMeeting);
      } catch (error) {
        console.error("Error deleting file:", error);
        this.selectedFiles = [...this.selectedFiles, fileToDelete];
        this.api.poup(null, this.$t("meeting.file_delete_failed"));
      } finally {
        this.isFileActionLoading = false;
      }
    },

    getFileName(file) {
      if (!file) return "";
      if (file.name) return file.name;
      if (file.filePath) return file.filePath.split("/").pop();
      if (typeof file === "string") return file.split("/").pop();
      return this.$t("common.unknown");
    },
    async deleteItem(item) {
      await this.api.delete(item.id);
      this.$refs.table.refreshTable();
    },
    async fetchAgendas() {
      try {
        this.agendas = await this.agendaApi.getAll({
          select: "id|name|status|committee_id",
          filter: "status|confirmed|=",
          with: ["meeting:id,agenda_id"],
        });

        const filteredAgendas = this.agendas.filter(
          (agenda) =>
            agenda?.committee_id == this.$route.params.id 
            &&
            (agenda?.meeting == null)
        );
        /**
         *  &&
            (!agenda?.meeting &&
              agenda?.meeting?.agenda_id == agenda?.id &&
              agenda?.meeting?.length === 0)
         */
        const agendaField = this.fromFields.find(
          (field) => field.name === "agenda_id"
        );
        agendaField.options = filteredAgendas?.map((agenda) => ({
          id: agenda.id,
          name: agenda.name,
        }));
      } catch (error) {
        console.error("Failed to load agendas:", error);
      }
    },

    async fetchDepartments() {
      try {
        const deptResponse = await this.departmentApi.getAll({
          select: "id|name|ola_leader",
        });

        this.departments = deptResponse.reduce((map, department) => {
          map[department.id] = department.name;
          return map;
        }, {});

        this.allDepartments = deptResponse;
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    },
    async openAssigneeDetailsModal(selectedAssigneeId) {
      this.userData = this.users.find((user) => user.id === selectedAssigneeId);
      try {
        this.userDepartment =
          this.departments[this.userData.department_id] ?? this.$t("common.na");
        this.userData.department = this.userDepartment || this.$t("common.na");
        this.viewUserModal = true;
      } catch (error) {
        console.error("Failed to fetch department:", error);
      }
    },
  },
};
</script>

<style scoped>
/* Custom styles for date picker */
.dp-custom-menu {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dp-custom-calendar {
  font-family: inherit;
}

.duration-display {
  display: flex;
  align-items: center;
  min-height: 38px;
  font-weight: 500;
  color: #495057;
}

.duration-display i {
  color: #6c757d;
}

.duration-display span {
  font-size: 14px;
}

/* Remove hover effects on date picker inputs */
:deep(.dp__input) {
  border-radius: 4px;
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

:deep(.dp__input:hover) {
  border-color: #dee2e6;
  background-color: white;
}

:deep(.dp__input:focus) {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  background-color: white;
}

/* Remove red background on hover */
:deep(.dp__input_focus) {
  border-color: #80bdff;
  background-color: white !important;
}

:deep(.dp__input_valid) {
  border-color: #dee2e6;
  background-color: white !important;
}

:deep(.dp__input_invalid) {
  border-color: #d0868d;
  background-color: white !important;
}

/* Ensure no red background on any state */
:deep(.dp__input_reg) {
  background-color: white !important;
}

:deep(.dp__main) {
  font-family: inherit;
}

:deep(.dp__menu) {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Scoped styles for the component */
[class*="text-success"],
[class*="text-warning"],
[class*="text-danger"],
[class*="text-primary"] {
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  display: inline-block;
}

/* Scoped styles for the component */
.text-primary {
  background-color: rgba(0, 123, 255, 0.1);
}

/* Add these styles to your <style scoped> section */

.select-all-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px 12px;
}

.select-all-container .form-check {
  margin-bottom: 0;
}

.select-all-container .form-check-input {
  margin-top: 2px;
}

.select-all-container .form-check-label {
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  user-select: none;
}

.select-all-container .form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.select-all-container .form-check-input:indeterminate {
  background-color: #6c757d;
  border-color: #6c757d;
}

.select-all-container .form-check-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-all-container .form-check-label .text-muted {
  font-weight: normal;
  font-size: 0.875rem;
}

/* Type Badges */
.badge-green {
  background-color: #b6caae;
  color: #255f0b;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-red {
  background-color: #e2b6b6;
  color: #a92525;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-orange {
  background-color: #ebdcb3;
  color: #c4951b;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-moove {
  background-color: #d0b5e3; /* Soft yellow background */
  color: #6e3894; /* Darker yellow text */
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.badge-user {
  background-color: #d0b5e3;
  color: #43235c;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}
</style>
