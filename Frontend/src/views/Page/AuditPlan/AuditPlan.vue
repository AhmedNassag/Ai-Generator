<template>
  <!-- Main Page component -->
  <main-page ref="page" :isFlipped="isFlipped" :mainPage="'auditplan.auditplan'" :subPage="'auditplan.auditplan'"
    :titlePage="'auditplan.auditplan'" :showInsightsTab="true">

    <!-- Statistics slot -->
    <template #statistics>
      <FrameworkStatistics :frameworkStatusData="frameworkStatusData" :loading="loading"
        :frameworkAllStatusData="frameworkAllStatusData" :loadingChart="loadingChart" />
    </template>

    <!-- DataTable slot -->
    <template #datatable>
      <DataTable ref="table" id="example-table" :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns" :api="api" :apiParams="apiParams" :editItem="editItem" :openForm="openForm"
        :hideActions="hideActions">
        <template #regulator="{ item }">{{ item?.regulator?.name }}
        </template>
        <template #framework="{ item }">{{ item?.framework?.title }}
        </template>
        <template #auditer_id="{ item }">{{ getAuditerName(item) }}
        </template>
        <template #responsible="{ item }">
          <div v-if="getResponsibleNames(item).length">
            <v-chip v-for="(name, index) in getResponsibleNames(item)" :key="index" small
              :color="item.responsible_type === 'teams' ? 'teal' : ''"
              :text-color="item.responsible_type === 'teams' ? 'white' : ''" class="mr-1 mb-1">
              {{ name }}
            </v-chip>
          </div>
        </template>
        <template #addAction="{ item }">
          <a v-if="!hideSedation(item.start_date).sedation" href="javascript:void(0)" @click="openSedationModal(item)"
            title="Assign Teams/Users" class="dropdown-item">
            <i class="fa-solid fa-eye"></i> {{ $t('auditplan.Sedation') }}
          </a>
          <a href="javascript:void(0)" @click="!loadingExport && exportDataOfAudit(item.id)"
            :class="['dropdown-item', { 'disabled opacity-50 cursor-not-allowed': loadingExport }]"
            :title="loadingExport ? $t('auditplan.Exporting') : $t('auditplan.ExportResult')">

            <i v-if="!loadingExport" class="fa-solid fa-file-export"></i>
            <i v-else class="fa-solid fa-spinner fa-spin"></i>
            {{ loadingExport ? $t('auditplan.Exporting') : $t('auditplan.ExportResult') }}
          </a>
          <a href="javascript:void(0)" @click="fetchSpesificAuditResult(item.id)" class="dropdown-item">
            <i class="fa-solid fa-eye"></i> {{ $t('auditplan.details') }}
          </a>
        </template>

      </DataTable>
    </template>

    <!-- Form slot -->
    <template #form>
      <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true"></Form>
    </template>

  </main-page>

  <!-- Premium Vuetify Modal -->
  <v-dialog v-model="isModalOpenOfEditDocument" persistent max-width="1150" scrollable content-class="elegant-dialog"
    transition="dialog-bottom-transition">
    <v-card class="elegant-card">
      <!-- Glassmorphism Header -->
      <v-card-title class="glass-header d-flex justify-space-between align-center">
        <div class="header-content d-flex align-center">
          <v-icon color="white" size="28" class="mr-3">
            {{ isEditing ? 'mdi-clipboard-edit-outline' : 'mdi-clipboard-plus-outline' }}
          </v-icon>
          <div>
            <div class="dialog-title">{{ isEditing ? $t('auditplan.Edit Audit Document') : $t('auditplan.Start New Audit') }}</div>
            <div class="dialog-subtitle">{{ isEditing ? $t('auditplan.Update your audit details') : $t('auditplan.Create a new audit plan') }}</div>
          </div>
        </div>
        <v-btn icon @click="closeEditModalOfDocument" class="close-btn" color="white" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <!-- Form Content with Floating Labels -->
      <v-card-text class="form-content">
        <v-form @submit.prevent="submitForm" class="elegant-form">
          <!-- First Section -->
          <div class="form-section">
            <div class="section-title d-flex rtl">
              <v-icon class="mr-2">mdi-information-outline</v-icon>
              {{ $t('auditplan.Basic Information') }}
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="auditForm.audit_name" :label="$t('auditplan.Audit Name')"
                  :rules="validationRules.audit_name" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-text-box-outline" clearable class="elegant-field" required>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="auditForm.regulator_id" :rules="validationRules.regulator_id" :items="regulatorList"
                  item-title="name" item-value="id" :label="$t('auditplan.Regulator')"
                  :error-messages="errors.regulator_id" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-bank-outline" @update:modelValue="loadFrameworks" class="elegant-field"
                  hide-details="auto" :disabled="isEditMode">
                </v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="auditForm.framework_id" :rules="validationRules.framework_id"
                  :items="frameworkOptions" item-title="name" item-value="id" :label="$t('auditplan.Framework')"
                  :error-messages="errors.framework_id" :disabled="!auditForm.regulator_id || isEditMode"
                  variant="outlined" color="primary" prepend-inner-icon="mdi-shape-outline" class="elegant-field"
                  hide-details="auto">
                </v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="auditForm.auditer_id" :rules="validationRules.auditer_id" :items="userList"
                  item-title="full_name" item-value="id" :label="$t('auditplan.Auditer')"
                  :error-messages="errors.auditer_id" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-account-tie-outline" class="elegant-field" hide-details="auto">
                </v-select>
              </v-col>
            </v-row>
          </div>

          <!-- Second Section -->
          <div class="form-section">
            <div class="section-title">
              <v-icon class="mr-2">mdi-account-group</v-icon>
              {{ assistantTitle }}
            </div>

            <v-radio-group v-model="auditForm.responsible_type" inline class="elegant-radio-group" hide-details
              @update:modelValue="clearResponsibleSelection" :disabled="!auditForm.responsible_type || isEditMode">

              <v-radio label="Users" value="users" color="primary" class="elegant-radio">
                <template v-slot:label>
                  <div class="radio-label">
                    <v-icon class="mr-1">mdi-account-multiple-outline</v-icon>
                    <span>{{ $t('auditplan.Assign Users') }}</span>
                  </div>
                </template>
              </v-radio>
              <v-radio label="Teams" value="teams" color="primary" class="elegant-radio">
                <template v-slot:label>
                  <div class="radio-label">
                    <v-icon class="mr-1">mdi-account-group-outline</v-icon>
                    <span>{{ $t('auditplan.Assign Teams') }}</span>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <v-select v-if="auditForm.responsible_type === 'users'" v-model="auditForm.responsible"
              :rules="validationRules.responsible" :items="userList" item-title="full_name" item-value="id"
              :label="$t('auditplan.Select Users')" multiple :error-messages="errors.responsible" variant="outlined"
              color="primary" prepend-inner-icon="mdi-account-plus-outline" class="elegant-field mt-4"
              hide-details="auto" chips>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon class="mr-2" color="primary">mdi-account-circle</v-icon>
                  </template>
                </v-list-item>
              </template>
              <template v-slot:selection="{ item }">
                <v-chip>
                  <v-icon start>mdi-account-outline</v-icon>
                  {{ item.title }}
                </v-chip>
              </template>
            </v-select>

            <!-- Team Select with Icons -->
            <v-select v-if="auditForm.responsible_type === 'teams'" :rules="validationRules.responsible"
              v-model="auditForm.responsible" :items="teamList" item-title="name" item-value="id"
              :label="$t('auditplan.Select Teams')" multiple :error-messages="errors.responsible" variant="outlined"
              color="primary" prepend-inner-icon="mdi-account-group-outline" class="elegant-field mt-4"
              hide-details="auto" chips>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon class="mr-2" color="teal">mdi-account-group</v-icon>
                  </template>
                </v-list-item>
              </template>
              <template v-slot:selection="{ item }">
                <v-chip>
                  <v-icon start>mdi-account-group</v-icon>
                  {{ item.title }}
                </v-chip>
              </template>
            </v-select>
          </div>

          <!-- Third Section -->
          <div class="form-section">
            <div class="section-title d-flex rtl">
              <v-icon class="mr-2">mdi-calendar-clock</v-icon>
              {{ $t('auditplan.Schedule') }}
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="auditForm.start_date" :rules="validationRules.start_date"
                  :label="$t('auditplan.Start Date')" type="date" :error-messages="errors.start_date" variant="outlined"
                  color="primary" prepend-inner-icon="mdi-calendar-start" class="elegant-field" hide-details="auto"
                  @change="calculateNextInitiateDate">
                </v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="auditForm.due_date" :rules="validationRules.due_date"
                  :label="$t('auditplan.Due Date')" type="date" :error-messages="errors.due_date" variant="outlined"
                  color="primary" prepend-inner-icon="mdi-calendar-end" class="elegant-field" hide-details="auto"
                  @change="calculateNextInitiateDate">
                </v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="auditForm.next_initiate_date" :label="$t('auditplan.Next Initiate Date')"
                  type="date" :error-messages="errors.next_initiate_date" variant="outlined" color="primary"
                  prepend-inner-icon="mdi-calendar-clock" class="elegant-field" hide-details="auto" readonly>
                </v-text-field>
              </v-col>
            </v-row>

            <v-text-field v-model.number="auditForm.periodical_time" :label="$t('auditplan.Periodical Time')"
              type="number" min="0" :rules="validationRules.periodical_time" variant="outlined" color="primary"
              prepend-inner-icon="mdi-clock-outline" suffix="days" class="elegant-field mt-4" required
              @input="calculateNextInitiateDate" @blur="calculateNextInitiateDate">
            </v-text-field>
          </div>

          <!-- Action Buttons -->
          <v-card-actions class="form-actions">
            <v-btn color="grey-lighten-1" @click="closeEditModalOfDocument" variant="outlined" size="large"
              class="action-btn">
              <v-icon left>mdi-close-circle-outline</v-icon>
              {{ $t('auditplan.Cancel') }}
            </v-btn>

            <v-btn color="primary" type="submit" :loading="isSubmitting" :disabled="isSubmitting" size="large"
              class="action-btn" dark v-permission:update>
              <template v-slot:loader>
                <v-progress-circular indeterminate color="primary" size="40" width="4"></v-progress-circular>
              </template>
              <v-icon left>{{ isEditing ? 'mdi-content-save-outline' : 'mdi-plus-circle-outline' }}</v-icon>
              {{ isEditing ? $t('auditplan.save_changes') : $t('auditplan.create_audit') }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Controls Modal -->
  <v-dialog v-model="isOpenControlsModalVisible" persistent max-width="900" scrollable content-class="high-z-index">
    <v-card class="elegant-card">
      <!-- Simplified Header -->
      <v-card-title class="d-flex align-center justify-space-between white--text px-5 py-4"
        style="background: linear-gradient(45deg, #2196F3, #21CBF3); border-radius: 8px 8px 0 0; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
        <div class="d-flex align-center">
          <v-icon large class="mr-3 white--text">mdi-shield-alert</v-icon>
          <div>
            <div class="dialog-title">{{ $t('auditplan.open_controls_title') }}</div>
            <small class="text-caption">{{ $t('auditplan.open_controls_subtitle') }}</small>
          </div>
        </div>
        <v-badge style="margin-right: 27px;" color="red lighten-1" :content="openControls.length.toString()" overlap>
          <v-icon color="white">mdi-bell-ring</v-icon>
        </v-badge>
      </v-card-title>

      <!-- Controls list with improved table -->
      <v-card-text class="pa-0">
        <v-data-table :headers="[
          {
            text: 'Control Name',
            value: 'short_name',
            width: '70%',
            class: 'header-cell'
          },
          {
            text: 'Status',
            value: 'status',
            width: '30%',
            class: 'header-cell',
            align: 'center'
          }
        ]" :items="openControls" :items-per-page="10" class="controls-table" :loading="loadingControls" fixed-header
          height="400px">
          <!-- Status Column -->
          <template v-slot:item.status="{ item }">
            <v-chip color="error" dark small>
              <v-icon left>mdi-alert-circle</v-icon>
              {{ $t('auditplan.Open') }}
            </v-chip>
          </template>

          <!-- Control Name Column -->
          <template v-slot:item.short_name="{ item }">
            <span class="font-weight-medium">{{ item.short_name }}</span>
            <v-tooltip bottom v-if="item.description">
              <template v-slot:activator="{ on }">
                <v-icon small color="grey" v-on="on" class="ml-1">mdi-information-outline</v-icon>
              </template>
              <span>{{ item.description }}</span>
            </v-tooltip>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="text-center py-4">
              <v-icon size="64" color="green">mdi-check-circle-outline</v-icon>
              <div class="text-h6 mt-2">No open controls found</div>
              <div class="text-caption">All controls are properly implemented</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="justify-space-between pa-4">
        <v-btn color="grey darken-1" @click="closeControlsModal('back')" outlined>
          <v-icon left>mdi-arrow-left</v-icon>
          {{ $t('auditplan.Close') }}
        </v-btn>

        <div>
          <v-btn color="grey darken-1" @click="exportControls" outlined class="mr-2">
            <v-icon left>mdi-download</v-icon>
            {{ $t('auditplan.Export') }}
          </v-btn>
          <v-btn color="primary" @click="ignoreAndContinue" depressed>
            <v-icon left>mdi-check-all</v-icon>
            {{ $t('auditplan.Proceed Anyway') }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Sedation Modal -->
  <SedationModal :isOpen="isSedationModalVisible" :item="selectedItemId" @close="closeSedationModal"
    @saved="handleSedationSaved" />

  <AuditPlanDetails :isOpen="isModalOpenStatistic" :auditPlan="auditAllStatusData" :isLoading="isLoadingAuditDetails"
    @close="closeAuditModal" />

</template>

<script>
import auditplan from "@/API/AuditPlan/AuditPlan";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import Frameworks from "@/API/Frameworks/Frameworks";
import Regulator from "@/API/Regulator/Regulator";
import User from "@/API/User/User";
import Team from "@/API/Team/Team";
import FrameworkControlTestAudit from "@/API/FrameworkControlTestAudit/FrameworkControlTestAudit";
import Swal from 'sweetalert2';
import SedationModal from "@/views/Page/AuditPlan/SedationModal.vue";
import FrameworkStatistics from "@/views/Page/AuditPlan/AuditStatistics.vue";
import axios from "axios";
import AuditPlanDetails from "./AuditPlanDetails.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    SedationModal,
    FrameworkStatistics,
    AuditPlanDetails
  },

  setup() {
    const api = new auditplan();
    const frameworksApi = new Frameworks();
    const regulatorApi = new Regulator();
    const userApi = new User();
    const teamApi = new Team();
    const FrameworkControlTestAuditApi = new FrameworkControlTestAudit();
    const apiParams = { with: ["regulator:name", "framework:title"] };
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      frameworksApi,
      regulatorApi,
      userApi,
      teamApi,
      FrameworkControlTestAuditApi,
      Swal
    };
  },
  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      newItem: {},
      transitionModal: {
        show: false
      },
      isModalOpenOfEditDocument: false,
      isSubmitting: false,
      isEditing: false,
      auditForm: {
        id: null,
        audit_name: '',
        regulator_id: null,
        framework_id: null,
        auditer_id: null,
        responsible_type: 'users',
        responsible: [],
        start_date: '',
        due_date: '',
        periodical_time: 0,
        next_initiate_date: ''
      },
      errors: {},
      regulatorList: [],
      frameworkOptions: [],
      userList: [],
      teamList: [],
      validationRules: {
        audit_name: [
          v => !!v || this.$t('auditplan.audit_name_is_required'),
          v => (v && v.length >= 3) || this.$t('auditplan.audit_name_min_length')
        ],
        regulator_id: [
          v => !!v || this.$t('auditplan.regulator_is_required')
        ],
        framework_id: [
          v => !!v || this.$t('auditplan.framework_is_required')
        ],
        auditer_id: [
          v => !!v || this.$t('auditplan.auditer_is_required')
        ],
        responsible: [
          v => (v && v.length > 0) || this.$t('auditplan.responsible_person_required')
        ],
        start_date: [
          v => !!v || this.$t('auditplan.start_date_is_required'),
          v => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (!v) return true;
            if (!this.isEditing) {
              return new Date(v) >= today || this.$t('auditplan.start_date_cannot_be_past');
            } else {
              if (this.originalStartDate && v !== this.originalStartDate) {
                return new Date(v) >= today || this.$t('auditplan.start_date_cannot_be_past');
              }
              return true;
            }
          },
          v => {
            if (!v || !this.auditForm.due_date) return true;
            return new Date(v) <= new Date(this.auditForm.due_date) || this.$t('auditplan.start_date_must_be_before_due_date')
          }
        ],
        due_date: [
          v => !!v || this.$t('auditplan.due_date_is_required'),
          v => {
            if (!v || !this.auditForm.start_date) return true;
            return new Date(v) >= new Date(this.auditForm.start_date) || this.$t('auditplan.due_date_must_be_after_start_date')
          }
        ],
        periodical_time: [
          v => v !== null && v !== undefined || this.$t('auditplan.periodical_time_is_required'),
          v => v >= 0 || this.$t('auditplan.periodical_time_cannot_be_negative')
        ]
      },
      isOpenControlsModalVisible: false,
      openControls: [],
      loadingControls: false,
      isSedationModalVisible: false,
      selectedItemId: null,
      frameworkStatusData: [],
      loading: true,
      frameworkAllStatusData: [],
      loadingChart: true,
      dataExported: [],
      loadingExport: false,
      auditAllStatusData: null,
      isModalOpenStatistic: false,
      isLoadingAuditDetails: false
    };
  },

  computed: {
    assistantTitle() {
      return this.auditForm.responsible_type === 'users'
        ? this.$t('auditplan.User Assistant')
        : this.$t('auditplan.Team Assistant');
    },
    isEditMode() {
      return this.isEditing;
    },
    hideActions() {
      return (row) => {
        const now = new Date();
        const startDate = new Date(row.start_date);
        return {
          edit: startDate < now,
          delete: true,
        };
      };
    },
  },

  async mounted() {

  },

  // Called when component is activated by <keep-alive>
  async activated() {
    try {
      await this.loadInitialData();
      await this.getStatusImplementedForAllFrameworks();
      await this.getAllStatusForAllFrameworks();
    } catch (e) {
      console.error('Error refreshing data on activated:', e);
    }
  },

  async created() {
    this.tableColumns = [
      { title: this.$t("auditplan.audit_name"), data: "audit_name", defaultContent: "N/A" },
      { id: "regulator", title: this.$t("auditplan.Regulator"), data: "", defaultContent: "N/A" },
      { id: "framework", title: this.$t("auditplan.Framework"), data: "", defaultContent: "N/A" },
      { id: "auditer_id", title: this.$t("auditplan.Auditer"), data: "", defaultContent: "N/A" },
      { title: this.$t("auditplan.TypeOfResponsible"), data: "responsible_type", defaultContent: "N/A" },
      { id: "responsible", title: this.$t("auditplan.Assistant"), data: "", defaultContent: "N/A" },
      { title: this.$t("auditplan.Start-Date"), data: "start_date", defaultContent: "N/A" },
      { title: this.$t("auditplan.Due-Date"), data: "due_date", defaultContent: "N/A" },
      { title: this.$t("auditplan.PeriodicalTime"), data: "periodical_time", defaultContent: "N/A" },
      { title: this.$t("auditplan.AuditNumberInitiated"), data: "test_number_initiated", defaultContent: "N/A" },
    ];

    this.fromFields = [];
    try {
      await this.loadInitialData();
      this.getStatusImplementedForAllFrameworks();
      this.getAllStatusForAllFrameworks();
    } catch (e) {
      console.error('Error loading initial data on created:', e);
    }
  },

  methods: {
    hideSedation(date) {
      const now = new Date();
      const startDate = new Date(date);
      return {
        sedation: startDate < now,
      };
    },
    async loadInitialData() {
      try {
        this.userList = await this.userApi.getAll({ select: "id|full_name" });
        this.teamList = await this.teamApi.getAll({ select: "id|name" });
        await this.loadRegulator();
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    },
    getResponsibleNames(item) {
      if (!item.responsible || item.responsible.length === 0) return ['N/A'];

      if (item.responsible_type === 'users') {
        return item.responsible.map(id => {
          const user = this.userList.find(u => u.id === id);
          return user ? user.full_name : 'Unknown User';
        });
      }
      else if (item.responsible_type === 'teams') {
        return item.responsible.map(id => {
          const team = this.teamList.find(t => t.id === id);
          return team ? team.name : 'Unknown Team';
        });
      }
      return ['N/A'];
    },
    getAuditerName(item) {
      const user = this.userList.find(u => u.id === item.auditer_id);
      return user ? user.full_name : 'Unknown User';
    },
    async loadRegulator() {
      try {
        const response = await this.regulatorApi.getAll({
          select: "id|name",
          with: ["frameworks"]
        });
        this.regulatorList = response;
      } catch (error) {
        console.error("Error loading regulators:", error);
      }
    },

    async loadFrameworks() {
      try {
        if (!this.auditForm.regulator_id) {
          this.frameworkOptions = [];
          return;
        }

        const selectedRegulator = this.regulatorList.find(
          r => r.id === this.auditForm.regulator_id
        );

        if (selectedRegulator && Array.isArray(selectedRegulator.frameworks)) {
          this.frameworkOptions = selectedRegulator.frameworks.map(fw => ({
            id: fw.id,
            name: fw.title || fw.name
          }));
        } else {
          this.frameworkOptions = [];
        }
      } catch (error) {
        console.error("Error loading frameworks:", error);
        this.frameworkOptions = [];
      }
    },

    calculateNextInitiateDate() {
      if (!this.auditForm.due_date) {
        this.auditForm.next_initiate_date = '';
        return;
      }

      const periodicalDays = parseInt(this.auditForm.periodical_time) || 0;

      if (periodicalDays === 0) {
        this.auditForm.next_initiate_date = this.auditForm.due_date;
        return;
      }

      const dueDate = new Date(this.auditForm.due_date);

      if (!isNaN(dueDate.getTime())) {
        const nextDate = new Date(dueDate);
        nextDate.setDate(dueDate.getDate() + periodicalDays);
        const formattedDate = nextDate.toISOString().split('T')[0];
        this.auditForm.next_initiate_date = formattedDate;
      } else {
        this.auditForm.next_initiate_date = '';
      }
    },
    async exportDataOfAudit(id) {
      try {
        this.loadingExport = true;

        const response = await this.api.exportDataOfAudit(id);
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers['content-disposition'];
        let filename = `audit-data-${id}-${new Date().getTime()}.xlsx`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch.length === 2) {
            filename = filenameMatch[1];
          }
        }

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error("Error exporting audit data:", error);
      } finally {
        this.loadingExport = false;
      }
    },

    openSedationModal(item) {
      this.selectedItemId = item;
      this.isSedationModalVisible = true;
    },
    closeSedationModal() {
      this.isSedationModalVisible = false;
      this.selectedItemId = [];
    },
    handleSedationSaved() {
      this.$refs.table.refreshTable();
    },
    closeEditModalOfDocument() {
      this.isModalOpenOfEditDocument = false;
      this.isSubmitting = false;
      this.resetAuditForm();
    },

    async submitForm() {
      this.isSubmitting = true;
      this.errors = {};

      let isValid = true;

      if (!this.auditForm.audit_name) {
        this.errors.audit_name = 'Audit name is required';
        isValid = false;
      }

      if (!this.auditForm.regulator_id) {
        this.errors.regulator_id = 'Regulator is required';
        isValid = false;
      }

      if (!this.auditForm.framework_id) {
        this.errors.framework_id = 'Framework is required';
        isValid = false;
      }

      if (!this.auditForm.auditer_id) {
        this.errors.auditer_id = 'Auditer is required';
        isValid = false;
      }

      if (!this.auditForm.responsible || this.auditForm.responsible.length === 0) {
        this.errors.responsible = 'At least one responsible person/team is required';
        isValid = false;
      }

      if (!this.auditForm.start_date) {
        this.errors.start_date = 'Start date is required';
        isValid = false;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!this.isEditing) {
          if (new Date(this.auditForm.start_date) < today) {
            this.errors.start_date = 'Start date cannot be in the past';
            isValid = false;
          }
        } else {
          if (this.originalStartDate && this.auditForm.start_date !== this.originalStartDate) {
            if (new Date(this.auditForm.start_date) < today) {
              this.errors.start_date = 'Start date cannot be in the past';
              isValid = false;
            }
          }
        }
      }

      if (!this.auditForm.due_date) {
        this.errors.due_date = 'Due date is required';
        isValid = false;
      } else if (this.auditForm.start_date && new Date(this.auditForm.due_date) < new Date(this.auditForm.start_date)) {
        this.errors.due_date = 'Due date must be after start date';
        isValid = false;
      }

      if (this.auditForm.periodical_time === null || this.auditForm.periodical_time === undefined) {
        this.errors.periodical_time = 'Periodical time is required';
        isValid = false;
      } else if (this.auditForm.periodical_time < 0) {
        this.errors.periodical_time = 'Periodical time cannot be negative';
        isValid = false;
      }

      if (!isValid) {
        this.isSubmitting = false;
        return;
      }

      try {
        axios.defaults.baseURL = REGULATORSERVICE;

        if (this.isEditing) {
          await this.processFormSubmission(this.auditForm);
          return;
        }

        const checkParams = {
          framework_id: this.auditForm.framework_id
        };

        const response = await this.FrameworkControlTestAuditApi.checkAllControlsInClosed(checkParams);

        if (response.success && response.count > 0) {
          this.isModalOpenOfEditDocument = false;

          await Swal.fire({
            title: this.$t("auditplan.open_controls_detected"),
            html: this.$t("auditplan.open_controls_message", { count: response.count }),
            icon: 'warning',
            showCloseButton: true,
            showCancelButton: false,
            confirmButtonText: this.$t("auditplan.show_controls_button"),
            showDenyButton: true,
            denyButtonText: this.$t("auditplan.ignore_continue_button"),
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            customClass: {
              container: 'swal2-zindex'
            },
            preConfirm: () => {
              this.openControlsModal(response.controls);
              Swal.close();
              return false;
            },
            preDeny: async () => {
              await this.processFormSubmission(this.auditForm);
              Swal.close();
              return false;
            }
          });
        } else {
          await this.processFormSubmission(this.auditForm);
        }
      } catch (error) {
        console.error("Error fetch:", error);
        Swal.fire({
          title: this.$t("auditplan.error"),
          text: 'Failed to check controls',
          icon: 'error',
          customClass: {
            container: 'swal2-high-zindex-container'
          }
        });
        this.isSubmitting = false;
      }
    },
    async processFormSubmission(auditForm) {
      try {
        const response = await this.api.from(auditForm);
        if (response === false) {
          this.isModalOpenOfEditDocument = true;
        }

        if (response?.[1]?.status === "success") {
          this.closeEditModalOfDocument();
          this.$refs.table.refreshTable();
          await this.getStatusImplementedForAllFrameworks();
          await this.getAllStatusForAllFrameworks();
        }
      } catch (error) {
        console.error("Error saving audit:", error);
      } finally {
        this.isSubmitting = false;
      }
    },
    openControlsModal(controls) {
      this.loadingControls = true;

      this.openControls = controls.map(control => ({
        control_id: control.control_id,
        short_name: control.short_name,
        status: 'Open'
      }));
      this.loadingControls = false;
      this.isOpenControlsModalVisible = true;
    },
    exportControls() {
      const csvContent = this.openControls.map(c =>
        `${c.short_name},${c.status}`
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'open-controls.csv';
      link.click();
    },
    async ignoreAndContinue() {
      this.closeControlsModal('ignore');
      await this.processFormSubmission(this.auditForm);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      } catch (e) {
        return dateString;
      }
    },

    isOverdue(dateString) {
      if (!dateString) return false;

      try {
        const dueDate = new Date(dateString);
        const today = new Date();

        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return dueDate < today;
      } catch (e) {
        return false;
      }
    },
    closeControlsModal(action = '') {
      this.isOpenControlsModalVisible = false;
      this.openControls = [];

      if (action !== 'ignore') {
        this.closeEditModalOfDocument();
      }
    },
    async fetchSpesificAuditResult(id) {
      try {
        this.isLoadingAuditDetails = true;
        this.isModalOpenStatistic = true; // Open modal immediately

        const response = await this.api.fetchSpesificAuditResult(id);
        const data = response.data.data || response.data;

        console.log("Audit result data:", data);

        // Transform the data to match your modal's expected structure
        this.auditAllStatusData = this.transformAuditData(data);

      } catch (error) {
        console.error("Error fetching audit result:", error);
        this.auditAllStatusData = null;
      } finally {
        this.isLoadingAuditDetails = false;
      }
    },

    transformAuditData(data) {
      // Create a user lookup map for O(1) access
      const userMap = new Map(
        this.userList.map(user => [user.id || user._id, user])
      );

      // Helper function to get user full name
      const getUserFullName = (userId) => {
        if (!userId) return 'N/A';
        const user = userMap.get(userId);
        return user?.full_name || user?.name || 'Unknown User';
      };

      const totalControls = data.summary.control_counts.total_controls;

      return {
        // Statistics for the modal
        statistics: {
          // Implementation status statistics
          status: {
            counts: {
              'Not Implemented': data.summary.status_counts.not_implemented,
              'Implemented': data.summary.status_counts.implemented,
              'Partially Implemented': data.summary.status_counts.partially_implemented,
              'Not Applicable': data.summary.status_counts.not_applicable
            },
            percentages: {
              'Not Implemented': totalControls > 0
                ? ((data.summary.status_counts.not_implemented / totalControls) * 100).toFixed(2)
                : 0,
              'Implemented': totalControls > 0
                ? ((data.summary.status_counts.implemented / totalControls) * 100).toFixed(2)
                : 0,
              'Partially Implemented': totalControls > 0
                ? ((data.summary.status_counts.partially_implemented / totalControls) * 100).toFixed(2)
                : 0,
              'Not Applicable': totalControls > 0
                ? ((data.summary.status_counts.not_applicable / totalControls) * 100).toFixed(2)
                : 0
            }
          },

          // Open/Closed statistics
          openClosed: {
            counts: {
              'open': data.summary.control_counts.open,
              'closed': data.summary.control_counts.closed
            },
            percentages: {
              'open': totalControls > 0
                ? ((data.summary.control_counts.open / totalControls) * 100).toFixed(2)
                : 0,
              'closed': totalControls > 0
                ? ((data.summary.control_counts.closed / totalControls) * 100).toFixed(2)
                : 0
            }
          },

          // Requirements statistics
          requirements: data.summary.requirement_counts,

          // Evidence statistics
          evidence: data.summary.evidence_counts
        },

        // Transform controls_data for datatable
        datatableRecords: data.controls_data.map(control => ({
          id: control.control_name, // Use as unique key
          name: control.control_name,
          domain_name: control.domain,
          status: control.implementation_status,
          open_closed_status: control.open_closed_status,
          total_requirements: control.total_requirements,
          approved_requirements: control.approved_requirements,
          total_evidence: control.total_evidence,
          approved_evidence: control.approved_evidence,
          test_date: control.test_date,
          last_updated: control.last_updated,

          // Add auditer full name
          auditer_id: control.auditer_id,
          auditer_name: getUserFullName(control.auditer_id),

          // Map evidence with creator names
          evidence_list: control.evidence_list.map(evidence => ({
            ...evidence,
            created_by_name: getUserFullName(evidence.created_by)
          }))
        }))
      };
    },

    // Optional: If you need to fetch unique user IDs for batch loading
    getUniqueUserIds(data) {
      const userIds = new Set();

      // Add auditer IDs
      data.controls_data.forEach(control => {
        if (control.auditer_id) {
          userIds.add(control.auditer_id);
        }

        // Add evidence creator IDs
        control.evidence_list?.forEach(evidence => {
          if (evidence.created_by) {
            userIds.add(evidence.created_by);
          }
        });
      });

      return Array.from(userIds);
    },

    closeAuditModal() {
      this.isModalOpenStatistic = false;
      this.auditAllStatusData = null;
    },
    async getAllStatusForAllFrameworks() {
      try {
        this.loadingChart = true;
        const response = await this.api.getAllStatusForAllFrameworks();
        this.frameworkAllStatusData = response.data.data || [];
        console.log("Framework all status data:", this.frameworkAllStatusData);
      } catch (error) {
        console.error("Error fetching framework status:", error);
        this.frameworkAllStatusData = [];
      } finally {
        this.loadingChart = false;
      }
    },

    async getStatusImplementedForAllFrameworks() {
      try {
        this.loading = true;
        const response = await this.api.getStatusImplementedForAllFrameworks();
        this.frameworkStatusData = response.data.data || [];
        console.log("Framework status data:", this.frameworkStatusData);
      } catch (error) {
        console.error("Error fetching framework status:", error);
        this.frameworkStatusData = [];
      } finally {
        this.loading = false;
      }
    },

    openForm() {
      this.isEditing = false;
      this.resetAuditForm();
      this.isModalOpenOfEditDocument = true;
    },
    async editItem(data) {
      this.isEditing = true;
      this.originalStartDate = data.start_date || '';
      this.auditForm = {
        id: data.id,
        audit_name: data.audit_name || '',
        regulator_id: data.regulator_id || null,
        framework_id: null,
        auditer_id: data.auditer_id || null,
        responsible_type: data.responsible_type || 'users',
        responsible: data.responsible || [],
        start_date: data.start_date || '',
        due_date: data.due_date || '',
        periodical_time: data.periodical_time || 0,
        next_initiate_date: data.next_initiate_date || ''
      };
      if (this.auditForm.regulator_id) {
        await this.loadFrameworks();

        this.$nextTick(() => {
          this.auditForm.framework_id = data.framework_id;
        });
      }
      this.isModalOpenOfEditDocument = true;
    },
    clearResponsibleSelection(newValue) {
      this.auditForm.responsible = [];
    },
    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = {};
    },

    resetAuditForm() {
      this.auditForm = {
        id: null,
        audit_name: '',
        regulator_id: null,
        framework_id: null,
        auditer_id: null,
        responsible_type: 'users',
        responsible: [],
        start_date: '',
        due_date: '',
        periodical_time: 0,
        next_initiate_date: ''
      };
      this.frameworkOptions = [];
      this.errors = {};
      this.originalStartDate = '';
    }
  }
};
</script>

<style scoped>
/* Elegant Dialog Container */
.elegant-card {
  border-radius: 16px !important;
  overflow: hidden;
  background: #ffffff;
}

/* Glassmorphism Header */
.glass-header {
  padding: 20px 28px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.9), rgba(33, 150, 243, 0.9));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  position: relative;
  z-index: 2;
}

.glass-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  z-index: -1;
}

.header-content {
  display: flex;
  align-items: center;
}

.dialog-title {
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.2;
}

.dialog-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 400;
}

.close-btn {
  margin-left: auto;
  transition: all 0.3s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
}

/* Form Content */
.form-content {
  padding: 28px;
  background: #f9fbfd;
}

.elegant-form {
  max-width: 100%;
}

/* Form Sections */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

/* Elegant Form Fields */
.elegant-field {
  border-radius: 10px !important;
}

.elegant-field:deep(.v-field) {
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.elegant-field:deep(.v-field--active) {
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}

.elegant-field:deep(.v-field__outline) {
  color: #e0e0e0 !important;
}

.elegant-field:deep(.v-field--active .v-field__outline) {
  color: #1976d2 !important;
}

/* Radio Group Styling */
.elegant-radio-group {
  background: #f5f9ff;
  border-radius: 10px;
  padding: 12px 16px;
}

.elegant-radio {
  margin-right: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  font-weight: 500;
}

/* Action Buttons */
.form-actions {
  padding: 16px 0 0 0;
  justify-content: flex-end;
}

.action-btn {
  border-radius: 10px;
  padding: 0 24px;
  height: 48px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

/* Animations */
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), opacity 0.3s ease;
}

.dialog-bottom-transition-enter-from,
.dialog-bottom-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Style for required field indicators */
.elegant-field.required label::after {
  content: ' *';
  color: #ff5252;
}

/* Error message styling */
.elegant-field .v-messages__message {
  color: #ff5252;
  font-size: 0.75rem;
  line-height: 1.2;
  margin-top: 4px;
}

/* Error state for fields */
.v-field--error .v-field__outline {
  color: #ff5252 !important;
}

/* Error messages */
.v-messages__message {
  color: #ff5252;
  font-size: 0.75rem;
  margin-top: 4px;
}

.elegant-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.elegant-card {
  border-radius: 8px;
  overflow: hidden;
}

.controls-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.controls-actions {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  background-color: #f5f5f5;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

/* Status Chip Styling */
.v-chip.small {
  height: 24px;
  font-size: 0.75rem;
}

/* Make the table more readable */
.v-data-table tbody tr:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

.v-data-table th {
  font-weight: 600 !important;
  color: rgba(0, 0, 0, 0.87) !important;
  font-size: 0.875rem !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.text-error {
  color: #f44336;
}

.controls-list {
  max-height: 400px;
  overflow-y: auto;
}

.control-item {
  border-left: 3px solid #ff5252;
  margin-bottom: 8px;
  background-color: #fff8f8;
  border-radius: 4px;
}

.control-item:hover {
  background-color: #ffebee;
}

.controls-table>>>tbody tr:nth-of-type(odd) {
  background-color: #fff9f9;
}

.controls-table>>>tbody tr:hover {
  background-color: #ffebee !important;
}

.controls-table>>>.v-data-table-header {
  background-color: #f5f5f5;
  font-weight: bold;
}

.v-card__title {
  padding: 16px 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.high-z-index {
  z-index: 10000 !important;
}

.header-primary {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #2196F3 !important;
}

.controls-table {
  border-radius: 0 0 8px 8px;
}

.controls-table .v-data-table-header {
  background-color: #f5f5f5;
}

.controls-table tr:hover {
  background-color: #f5f5f5 !important;
}

.v-data-table>.v-data-table__wrapper>table>thead>tr>th {
  font-size: 0.875rem;
  font-weight: 600;
  height: 48px;
  white-space: nowrap;
}

/* Ensure header text is visible */
.header-cell {
  color: rgba(0, 0, 0, 0.87) !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
  background-color: #f5f5f5 !important;
}

/* Remove any potential text hiding */
.controls-table .v-data-table-header th {
  color: inherit !important;
}

/* Make sure headers are properly aligned */
.controls-table .v-data-table-header__content {
  display: block;
  width: 100%;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .form-content {
    padding: 20px;
  }

  .form-section {
    padding: 16px;
  }

  .action-btn {
    width: 100%;
    margin-bottom: 12px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
}
</style>