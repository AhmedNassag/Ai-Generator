<template>
  <!-- Main Page component where the layout and page structure are set -->
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="$t('auditpolicycompliance.auditpolicycompliance')"
    :subPage="$t('auditpolicycompliance.auditpolicycompliance')"
    :titlePage="$t('auditpolicycompliance.auditpolicycompliance')"
  >
    <!-- Slot for rendering the DataTable -->
    <template #datatable>
      <DataTable
        v-if="readyToLoad"
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :hideActions="hideActions"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
      >
        <!-- Customizing the display of the 'Name' column in the table -->
        <template #audit_name="{ item }">
          <template v-if="new Date(item.start_date) > new Date()">
            <span class="audit-name-text">{{ item.audit_name }}</span>
          </template>
          <template v-else>
            <template v-if="user.id === item.auditer_id">
              <a
                href="javascript:void(0);"
                class="audit-link"
                @click="showAuditeesModal(item)"
              >
                {{ item.audit_name }}
              </a>
            </template>
            <template v-else>
              <router-link
                :to="{
                  name: 'AuditPolicyCompliance-Result',
                  params: {
                    id: item.id,
                    audieeId: user.id,
                  },
                }"
                class="audit-link"
              >
                {{ item.audit_name }}
              </router-link>
            </template>
          </template>
        </template>

        <template #category="{ item }">
          <v-chip small class="ma-1" color="primary">
            {{getDocumentCategoryName(item.document_type)}}
          </v-chip>
        </template>
        <template #document="{ item }">
          <v-chip small class="ma-1" color="primary">
            {{getDocumentName(item.document_id)}}
          </v-chip>
        </template>
        <template #auditer_id="{ item }">
          <v-chip small class="ma-1" color="primary">
            {{ getAuditerName(item.auditer_id) }}
          </v-chip>
        </template>
        <template #auditees="{ item }">
          <div>
            <v-chip
              v-for="auditeeId in item.auditees"
              :key="auditeeId"
              small
              class="ma-1"
              color="secondary"
            >
              {{ getAuditeeName(auditeeId) }}
            </v-chip>
          </div>
        </template>
      </DataTable>
    </template>
  </main-page>
   <v-dialog
    v-model="isModalOpen"
    persistent
    max-width="1200"
    transition="dialog-bottom-transition"
  >
    <v-card class="elegant-modal">
      <!-- Premium Header -->
      <v-card-title class="modal-header">
        <div class="header-shine"></div>
        <div class="header-content">
          <div class="header-left">
            <div class="icon-badge">
              <v-icon size="large" color="white">
                {{ isEditing ? "mdi-pencil-box" : "mdi-plus-box" }}
              </v-icon>
            </div>
            <div class="title-section">
              <h2 class="header-title">
                {{
                  isEditing
                    ? $t("auditpolicycompliance.Edit Audit")
                    : $t("auditpolicycompliance.Create New Audit")
                }}
              </h2>
              <p class="header-subtitle">
                {{
                  isEditing
                    ? $t("auditpolicycompliance.Update audit configuration")
                    : $t("auditpolicycompliance.Configure audit parameters and assignments")
                }}
              </p>
            </div>
          </div>
          <v-btn icon size="small" @click="closeModal" class="close-button">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="modal-body">
        <v-form ref="form" v-model="formValid">
          <!-- Basic Information Section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <v-icon color="white">mdi-information</v-icon>
              </div>
              <div class="section-title d-flex rtl">
                <h3>{{ $t("auditpolicycompliance.Basic Information") }}</h3>
                <span>{{ $t("auditpolicycompliance.Essential audit details") }}</span>
              </div>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="auditForm.audit_name"
                  :label="$t('auditpolicycompliance.Audit Name') + ' *'"
                  prepend-inner-icon="mdi-clipboard-text"
                  required
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :rules="[validationRules.required]"
                  :hint="$t('auditpolicycompliance.Enter a descriptive name for this audit')"
                  persistent-hint
                >
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="auditForm.document_type"
                  :items="documentTypes"
                  :label="$t('auditpolicycompliance.Document Type') + ' *'"
                  prepend-inner-icon="mdi-file-document"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :rules="[validationRules.required]"
                  @update:modelValue="loadDocuments"
                  :hint="$t('auditpolicycompliance.Select the type of document to audit')"
                  persistent-hint
                >
                </v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="auditForm.document_id"
                  :items="documents"
                  :label="$t('auditpolicycompliance.Document') + ' *'"
                  prepend-inner-icon="mdi-file-outline"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :rules="[validationRules.required]"
                  :disabled="!auditForm.document_type"
                  :hint="$t('auditpolicycompliance.Choose specific document to audit')"
                  persistent-hint
                >
                  <template
                    v-if="
                      isEditing &&
                      auditForm.document_id &&
                      !documents.some((d) => d.id === auditForm.document_id)
                    "
                  >
                    <v-list-item>
                      <v-list-item-title>
                        {{
                          auditForm.document?.name ||
                          $t("auditpolicycompliance.Current Document")
                        }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="auditForm.auditer_id"
                  :items="users"
                  :label="$t('auditpolicycompliance.Lead Auditor') + ' *'"
                  prepend-inner-icon="mdi-account-tie"
                  item-title="full_name"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :rules="[validationRules.required]"
                  :hint="$t('auditpolicycompliance.Assign primary auditor responsible')"
                  persistent-hint
                >
                </v-select>
              </v-col>
            </v-row>
          </div>

          <!-- Schedule Section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                <v-icon color="white">mdi-calendar-clock</v-icon>
              </div>
              <div class="section-title d-flex rtl">
                <h3>{{ $t("auditpolicycompliance.Schedule & Timeline") }}</h3>
                <span>{{ $t("auditpolicycompliance.Define audit timeframe") }}</span>
              </div>
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="auditForm.start_date"
                  :label="$t('auditpolicycompliance.Start Date') + ' *'"
                  prepend-inner-icon="mdi-calendar-start"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :rules="[validationRules.required, validationRules.futureDate]"
                  :hint="$t('auditpolicycompliance.When audit begins')"
                  persistent-hint
                >
                </v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="auditForm.due_date"
                  :label="$t('auditpolicycompliance.Due Date') + ' *'"
                  prepend-inner-icon="mdi-calendar-end"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  :rules="[validationRules.required, validationRules.dueAfterStart]"
                  :hint="$t('auditpolicycompliance.Completion deadline')"
                  persistent-hint
                >
                </v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="auditForm.periodical_time"
                  :label="$t('auditpolicycompliance.Recurrence Period') + ' *'"
                  prepend-inner-icon="mdi-timer-outline"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  @input="calculateNextInitiateDate"
                  suffix="days"
                  :hint="$t('auditpolicycompliance.How often audit repeats')"
                  persistent-hint
                >
                </v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="auditForm.next_initiate_date"
                  :label="$t('auditpolicycompliance.Next Scheduled Date')"
                  prepend-inner-icon="mdi-calendar-refresh"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  readonly
                  :hint="$t('auditpolicycompliance.Auto-calculated next occurrence')"
                  persistent-hint
                >
                  <template v-slot:append-inner>
                    <v-icon color="success" size="small">mdi-lock</v-icon>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <div class="checkbox-container">
                  <v-checkbox 
                    v-model="requiresFileBoolean" 
                    color="primary"
                    density="comfortable"
                  >
                    <template v-slot:label>
                      <div class="checkbox-label">
                        <v-icon class="mr-2" size="20">mdi-file-upload</v-icon>
                        <span>{{ $t("auditpolicycompliance.Requires File Upload") }}</span>
                      </div>
                    </template>
                  </v-checkbox>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Assignments Section -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon" style="background: linear-gradient(135deg, #d0b5e3 0%, #b89dd4 100%);">
                <v-icon color="white">mdi-account-group</v-icon>
              </div>
              <div class="section-title d-flex rtl">
                <h3>{{ $t("auditpolicycompliance.Team Assignments") }}</h3>
                <span>{{ $t("auditpolicycompliance.Assign team members") }}</span>
              </div>
            </div>

            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="auditForm.auditees"
                  :items="filteredUsersForAuditees"
                  :label="$t('auditpolicycompliance.Auditees') + ' *'"
                  prepend-inner-icon="mdi-account-multiple"
                  item-title="full_name"
                  item-value="id"
                  multiple
                  variant="outlined"
                  density="comfortable"
                  color="primary"
                  chips
                  :rules="[
                    (v) =>
                      !!v.length ||
                      $t('auditpolicycompliance.At least one auditee is required'),
                  ]"
                  :hint="$t('auditpolicycompliance.Select team members to be audited')"
                  persistent-hint
                >
                  <template v-slot:selection="{ item, index }">
                    <v-chip
                      v-if="index < 3"
                      :key="item.id"
                      color="primary"
                      size="small"
                      closable
                      @click:close="removeAuditee(item.id)"
                    >
                      <v-avatar start size="20">
                        <v-img 
                          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          alt="User avatar"
                        ></v-img>
                      </v-avatar>
                      {{ item.title }}
                    </v-chip>
                    <span
                      v-if="index === 3"
                      class="text-grey text-caption align-self-center ml-2"
                    >
                      (+{{ auditForm.auditees.length - 3 }}
                      {{ $t("auditpolicycompliance.others") }})
                    </span>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Enhanced Footer -->
      <v-card-actions class="modal-footer">
        <div class="footer-info">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          <span>{{ $t("auditpolicycompliance.All fields marked with * are required") }}</span>
        </div>

        <v-spacer></v-spacer>

        <v-btn 
          @click="closeModal" 
          variant="outlined" 
          class="cancel-btn"
          size="large"
        >
          <v-icon start>mdi-close</v-icon>
          {{ $t("auditpolicycompliance.Cancel") }}
        </v-btn>

        <v-btn
          color="primary"
          @click="submitForm"
          size="large"
          :loading="loading"
          :disabled="!formValid"
          class="submit-btn"
        >
          <v-icon start>{{ isEditing ? "mdi-content-save" : "mdi-plus" }}</v-icon>
          {{
            isEditing
              ? $t("auditpolicycompliance.Update Audit")
              : $t("auditpolicycompliance.Create Audit")
          }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
   <!-- Auditees Modal -->
  <v-dialog v-model="auditeesModal" max-width="600px" persistent>
    <v-card class="auditee-dialog" elevation="12">
      <!-- Header with gradient background -->
      <v-card-title class="dialog-header pa-6">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon color="white" size="28" class="mr-3"
              >mdi-account-multiple</v-icon
            >
            <span class="text-h5 font-weight-bold text-white"
              >Select Auditee</span
            >
          </div>
          <v-btn
            icon
            variant="text"
            color="white"
            @click="auditeesModal = false"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <!-- Content area -->
      <v-card-text class="pa-0">
        <div class="auditee-list-container">
          <v-list class="auditee-list" lines="two">
            <v-list-item
              v-for="(auditeeId, index) in selectedAuditAuditees"
              :key="auditeeId"
              @click="goToComplianceResult(auditeeId)"
              class="auditee-item"
              :class="{
                'border-bottom': index < selectedAuditAuditees.length - 1,
              }"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="48" class="auditee-avatar">
                  <v-icon color="white" size="24">mdi-account</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="auditee-name">
                {{ getAuditeeName(auditeeId) }}
              </v-list-item-title>
              <template v-slot:append>
                <v-icon color="primary" class="arrow-icon"
                  >mdi-chevron-right</v-icon
                >
              </template>
            </v-list-item>
          </v-list>

          <!-- Empty state -->
          <div
            v-if="!selectedAuditAuditees || selectedAuditAuditees.length === 0"
            class="empty-state pa-8 text-center"
          >
            <v-icon size="64" color="grey-lighten-2" class="mb-4"
              >mdi-account-off</v-icon
            >
            <p class="text-h6 text-grey-darken-1 mb-2">
              {{ $t("auditpolicycompliance.No auditees available") }}
            </p>
            <p class="text-body-2 text-grey">
              {{
                $t(
                  "auditpolicycompliance.There are no auditees assigned to this audit."
                )
              }}
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import auditpolicycompliance from "@/API/AuditPolicyCompliance/AuditPolicyCompliance";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import DocumentCategory from "@/API/DocumentCategory/DocumentCategory";
import Document from "@/API/Document/Document";
import User from "@/API/User/User";
import { notify } from "@kyvg/vue3-notification";
import Auth from "@/API/Auth";
import CenterPolicy from "@/API/CenterPolicy/CenterPolicy";
import { get } from "lodash";

export default {
  components: {
    MainPage,
    DataTable,
  },
  setup() {
    const tableColumns = []; // Initialize table column definitions
    const fromFields = []; // Initialize form fields
    const centerPolicyApi = new CenterPolicy(); // Instance of CenterPolicy API
    const documentApi = new Document(); // Instance of Document API
    const documentCategoryApi = new DocumentCategory(); // Instance of DocumentCategory API
    // Return properties for setup to be used in the template
    return {
      tableColumns,
      fromFields,
      centerPolicyApi,
      documentApi,
      documentCategoryApi
    };
  },

  data() {
    return {
      isFlipped: false, // To control form flip (show/hide form)
      isReadonly: false, // Whether the form fields are read-only
      newItem: {}, // Data object to store the currently selected item for editing or new item
      isModalOpen: false,
      isEditing: false,
      documentTypes: [],
      documentList: [],
      documentCategories: [],
      documents: [],
      users: [],
      policyIds: [],
      api: new auditpolicycompliance(),
      apiParams: {},
      auditForm: {
        audit_name: "",
        document_type: null,
        document_id: null,
        auditer_id: null,
        start_date: "",
        due_date: "",
        periodical_time: 0,
        next_initiate_date: "",
        requires_file: "false", // store as string
        auditees: [],
      },
      readyToLoad: false,
      formValid: false,
      loading: false,
      user: Auth.USER,
      auditeesModal: false,
      selectedAuditId: null,
      selectedAuditAuditees: [],
      // Add validation rules
      validationRules: {
        required: (value) => !!value || "This field is required",
        positiveNumber: (value) => value >= 0 || "Must be a positive number",
        futureDate: (value) => {
          if (!value) return true;
          const today = new Date().toISOString().split("T")[0];
          return value >= today || "Date must be in the future";
        },
        dueAfterStart: (value) => {
          if (!value || !this.auditForm.start_date) return true;
          return (
            value >= this.auditForm.start_date ||
            "Due date must be after start date"
          );
        },
      },
    };
  },

  async created() {
    this.documentList = await this.documentApi.getAll();
    this.documentCategories = await this.documentCategoryApi.getAll();
    this.tableColumns = [
      {
        title: this.$t("auditpolicycompliance.Audit_Name"),
        data: "audit_name",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditpolicycompliance.Document_Type"),
        data: "",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditpolicycompliance.Document"),
        data: "",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditpolicycompliance.Auditer"),
        data: "",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditpolicycompliance.Auditees"),
        data: "",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditpolicycompliance.Start-Date"),
        data: "start_date",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditpolicycompliance.Due-Date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        title: this.$t("auditpolicycompliance.PeriodicalTime"),
        data: "periodical_time",
        defaultContent: "N/A",
      },
    ];

    this.policyIds = await this.centerPolicyApi.getAll();

    await this.loadInitialData();
  },
  watch: {
    "auditForm.due_date"(newVal) {
      if (newVal) {
        this.calculateNextInitiateDate();
      }
    },
    "$route.params.type": {
      immediate: true,
      async handler(newType) {
        // First set readyToLoad to false to unmount the table
        this.readyToLoad = false;
        await this.loadDatatbale(newType);
        // Set readyToLoad to true to mount the table with new data
        this.readyToLoad = true;
      },
    },
    "auditForm.auditer_id"(newAuditerId, oldAuditerId) {
      // If the auditor changed and the previous auditor was in auditees, remove them
      if (newAuditerId && this.auditForm.auditees.includes(newAuditerId)) {
        this.auditForm.auditees = this.auditForm.auditees.filter(
          (id) => id !== newAuditerId
        );
      }
    },
  },

  computed: {
    hideActions() {
      return (row) => {
        return {
          edit: this.user.id != row.auditer_id,
          delete: true,
        };
      };
    },
    filteredUsersForAuditees() {
      // If no auditor is selected yet, return all users
      if (!this.auditForm.auditer_id) return this.users;

      // Filter out the user who is the auditor
      return this.users.filter((user) => user.id !== this.auditForm.auditer_id);
    },
    requiresFileBoolean: {
      get() {
        return this.auditForm.requires_file === "true";
      },
      set(val) {
        this.auditForm.requires_file = val ? "true" : "false";
      },
    },
  },

  methods: {
    getDocumentName(documentId) {
      const document = this.documentList.find((doc) => doc.id === documentId);
      return document ? document.name : "N/A";
    },
    getDocumentCategoryName(categoryId) {
      const category = this.documentCategories.find(
        (cat) => cat.id === categoryId
      );
      return category ? category.name : "N/A";
    },
    async loadDatatbale(Type) {
      // 1. Reset loading state and clear existing data
      this.readyToLoad = false;
      await this.$nextTick(); // Ensure DOM updates if necessary

      // 2. Define base columns (common for all asset types)
      this.tableColumns = [
        {
          id: "audit_name",
          title: this.$t("auditpolicycompliance.Audit_Name"),
          data: "audit_name",
          defaultContent: "N/A",
        },
        {
          id: "category",
          title: this.$t("auditpolicycompliance.Document_Type"),
          data: "",
          defaultContent: "N/A",
        },
        {
          id: "document",
          title: this.$t("auditpolicycompliance.Document"),
          data: "",
          defaultContent: "N/A",
        },
        {
          id: "auditer_id",
          title: this.$t("auditpolicycompliance.Auditer"),
          data: "",
          defaultContent: "N/A",
        },
        {
          id: "auditees",
          title: this.$t("auditpolicycompliance.Auditees"),
          data: "",
          defaultContent: "N/A",
        },
        {
          title: this.$t("auditpolicycompliance.Start-Date"),
          data: "start_date",
          defaultContent: "N/A",
        },
        {
          title: this.$t("auditpolicycompliance.Due-Date"),
          data: "due_date",
          defaultContent: "N/A",
        },
        {
          title: this.$t("auditpolicycompliance.PeriodicalTime"),
          data: "periodical_time",
          defaultContent: "N/A",
        },
      ];

      const relations = ["documentCategory:id,name", "document:id,name"];
      let filterType = Type === "active-audit" ? 1 : 0;

      this.apiParams = {
        // with: relations,
        filter: `enable_audit|${filterType}-integer|=`,
        // filterOr: `auditer_id|${this.user.id}|=||auditees|${this.user.id}|contains`
      };

      // 7. Finalize loading state
      this.readyToLoad = true;
      await this.$nextTick();
    },
    async loadInitialData() {
      try {
        // Load document types (standard and policy)
        this.documentTypes = await new DocumentCategory().getAll({
          filterIn: "type|standard,policy",
          select: "id|name",
        });

        // Load users for auditer and auditees
        this.users = await new User().getAll({
          select: "id|full_name",
        });
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    },

    async loadDocuments() {
      if (!this.auditForm.document_type) {
        this.documents = [];
        return;
      }

      try {
        this.documents = await new Document().getAll({
          filterIn: `category_id|${this.auditForm.document_type}`,
          select: "id|name",
        });

        // If editing and document_id exists but not in documents list, add it
        if (this.isEditing && this.auditForm.document_id) {
          const documentExists = this.documents.some(
            (doc) => doc.id === this.auditForm.document_id
          );
          if (!documentExists && this.auditForm.document) {
            this.documents.unshift({
              id: this.auditForm.document.id,
              name: this.auditForm.document.name,
            });
          }
        }
      } catch (error) {
        console.error("Error loading documents:", error);
      }
    },

    removeAuditee(auditeeId) {
      const index = this.auditForm.auditees.indexOf(auditeeId);
      if (index > -1) {
        this.auditForm.auditees.splice(index, 1);
      }
    },
    calculateNextInitiateDate() {
      // If due_date is not set, clear next_initiate_date and return
      if (!this.auditForm.due_date) {
        this.auditForm.next_initiate_date = "";
        return;
      }

      // Get periodical days (default to 0 if not set or invalid)
      const periodicalDays = parseInt(this.auditForm.periodical_time) || 0;

      // Always set next_initiate_date to due_date when periodical_time is 0 or not set
      if (periodicalDays <= 0) {
        this.auditForm.next_initiate_date = this.auditForm.due_date;
        return;
      }

      // Only calculate future date if periodical_time is positive
      const dueDate = new Date(this.auditForm.due_date);

      if (!isNaN(dueDate.getTime())) {
        const nextDate = new Date(dueDate);
        nextDate.setDate(dueDate.getDate() + periodicalDays);

        // Format as YYYY-MM-DD
        const formattedDate = nextDate.toISOString().split("T")[0];
        this.auditForm.next_initiate_date = formattedDate;
      } else {
        this.auditForm.next_initiate_date = "";
      }
    },

    getAuditerName(auditerId) {
      if (!auditerId || !this.users) return "";

      const auditer = this.users.find((item) => item.id === auditerId);
      return auditer?.full_name || "";
    },

    getAuditeeName(auditeeId) {
      if (!auditeeId || !this.users) return "";
      const results = this.users
        .map((user) => (user.id === auditeeId ? user.full_name : null))
        .filter(Boolean);
      return results[0] || "";
    },

    openForm() {
      this.isEditing = false;
      this.resetForm();
      this.isModalOpen = true;
    },

    async editItem(item) {
      this.isEditing = true;
      this.auditForm = { ...item };
      this.auditForm.requires_file =
        item.requires_file === true || item.requires_file === "true"
          ? "true"
          : "false";


      // Set the document type first
      this.auditForm.document_type = item.document_category?.id || null;

      // Load documents for this type
      await this.loadDocuments();

      // Then set the document ID
      this.auditForm.document_id = item.document?.id || null;
      const policy_ids = this.policyIds
        .filter((policy) =>
          policy.document_ids.includes(this.auditForm.document_id)
        )
        .map((policy) => policy.id);

      this.auditForm.policy_ids = policy_ids;
      
      this.isModalOpen = true;
    },
    async submitForm() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;
      console.log("-----------------", this.auditForm.document_id);
      const policy_ids = this.policyIds
        .filter((policy) =>
          policy.document_ids.includes(this.auditForm.document_id)
        )
        .map((policy) => policy.id);

      this.auditForm.policy_ids = policy_ids;
      this.loading = true;

      try {
        const payload = {
          ...this.auditForm,
          requires_file: this.auditForm.requires_file ? "true" : "false",
          ...(this.isEditing && { id: this.auditForm.id }), // Only spread id if editing
        };

        const response = await this.api.from(payload);

        if (response[1].status === "success") {
          this.closeModal();
          this.$refs.table.refreshTable();
        }
      } catch (error) {
        console.error("Error saving audit:", error);
        notify({
          title: this.$t("auditpolicycompliance.error"),
          text: "Failed to save audit data",
          type: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    closeModal() {
      this.isModalOpen = false;
      this.resetForm();
    },

    resetForm() {
      this.auditForm = {
        audit_name: "",
        document_type: null,
        document_id: null,
        auditer_id: null,
        start_date: "",
        due_date: "",
        periodical_time: 0,
        next_initiate_date: "",
        requires_file: "false",
        auditees: [],
      };
    },
    showAuditeesModal(item) {
      this.selectedAuditId = item.id;
      this.selectedAuditAuditees = item.auditees || [];
      this.auditeesModal = true;
    },
    goToComplianceResult(auditeeId) {
      this.$router.push({
        name: "AuditPolicyCompliance-Result",
        params: {
          id: this.selectedAuditId,
          audieeId: auditeeId,
        },
      });
      this.auditeesModal = false;
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 12px !important;
}

.v-card-title {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px 12px 0 0 !important;
}

.v-text-field,
.v-select {
  margin-bottom: 8px;
}

.v-chip {
  margin: 2px 4px 2px 0;
}

/* Custom scrollbar for long content */
.v-card-text {
  max-height: 70vh;
  overflow-y: auto;
}

.v-card-text::-webkit-scrollbar {
  width: 6px;
}

.v-card-text::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.v-card-text::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.v-card-text::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.auditee-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.dialog-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.dialog-header > * {
  position: relative;
  z-index: 1;
}

.close-btn {
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.auditee-list-container {
  max-height: 400px;
  overflow-y: auto;
}

.auditee-list {
  padding: 0;
}

.auditee-item {
  padding: 16px 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.auditee-item:hover {
  background: rgba(103, 126, 234, 0.08);
  transform: translateX(4px);
}

.auditee-item.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.auditee-avatar {
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(103, 126, 234, 0.3);
}

.auditee-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 4px;
}

.arrow-icon {
  opacity: 0.6;
  transition: all 0.2s ease;
}

.auditee-item:hover .arrow-icon {
  opacity: 1;
  transform: translateX(4px);
}

.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Scrollbar styling */
.auditee-list-container::-webkit-scrollbar {
  width: 6px;
}

.auditee-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.auditee-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.auditee-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.audit-link {
  display: inline-block;
  font-weight: 600;
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 4px;
}

.audit-link:hover {
  color: #1565c0;
}

.audit-subtext {
  font-size: 0.75rem;
  color: #555;
}
.elegant-modal {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Premium Header */
.modal-header {
  background: linear-gradient(135deg, #44225c 0%, #6b3689 50%, #44225c 100%);
  background-size: 200% 100%;
  color: white;
  padding: 1.25rem 1.75rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.header-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  animation: shine 3s infinite;
  pointer-events: none;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-badge {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 0.8125rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.close-button {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.9);
  border-color: #dc2626;
  transform: rotate(90deg);
}

/* Modal Body */
.modal-body {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fc 0%, #f1f4f9 100%);
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #44225c 0%, #6b3689 100%);
  border-radius: 10px;
}

/* Form Sections */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(68, 34, 92, 0.1);
  transform: translateY(-1px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 2px solid #f3f4f6;
}

.section-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(68, 34, 92, 0.3);
}

.section-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.section-title h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-title span {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
}

/* Checkbox Container */
.checkbox-container {
  display: flex;
  align-items: center;
  height: 100%;
  padding-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #1f2937;
}

/* Modal Footer */
.modal-footer {
  padding: 1rem 1.75rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
}

.cancel-btn {
  border-radius: 8px;
  padding: 0 1.5rem;
  font-weight: 600;
  border: 2px solid #d1d5db;
  color: #4b5563;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  border-radius: 8px;
  padding: 0 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #44225c 0%, #6b3689 100%);
  box-shadow: 0 2px 8px rgba(68, 34, 92, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6b3689 0%, #8b5cf6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(68, 34, 92, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Field Enhancements */
:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(68, 34, 92, 0.1);
}

:deep(.v-chip .v-avatar) {
  margin-left: -8px;
}

/* Responsive */
@media (max-width: 960px) {
  .header-title {
    font-size: 1.125rem;
  }

  .header-subtitle {
    font-size: 0.75rem;
  }

  .icon-badge {
    width: 40px;
    height: 40px;
  }

  .modal-body {
    padding: 1rem;
  }

  .form-section {
    padding: 1rem;
  }

  .footer-info {
    display: none;
  }
}
/* Responsive adjustments */
@media (max-width: 600px) {
  .auditee-item {
    padding: 12px 16px;
  }

  .auditee-name {
    font-size: 1rem;
  }

  .auditee-avatar {
    width: 40px;
    height: 40px;
  }
}
</style>
