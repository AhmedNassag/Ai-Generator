<!-- Slot for rendering the form -->
<template #form>
  <Form :schema="fromFields" :newItem="newItem" :api="api" :closeForm="closeForm" :formData="true">
    <template #topic_id="{ item }">
      <div class="col-sm-12 col-md-6">
        <div class="form-group">
          <label for="topic_id" class="form-label">{{
            $t("topic.topic_id")
          }}</label>
          <LazySelectField
            name="topic_id"
            :options="filteredMainTopics"
            v-model="newItem.topic_id"
            :placeholder="$t('topic.select_main_topic')"
            option-label="name"
            option-value="id"
            :disabled="disableTopic || currentRoute == 'AgendaDetails'"
            :on-update="onMainTopicChange"
            rules=""
          />
          <small class="form-text text-muted">{{ $t('topic.select_main_topic_helper') }}</small>
        </div>
      </div>
    </template>
    
    <template #owner_id="{ item }">
      <div v-if="isSubTopic" class="col-sm-12 col-md-6">
        <label for="owner_id" class="form-label">
          {{ $t("topic.owner_id") }} <span class="text-danger">*</span>
        </label>
        <UserSelect
          v-model="newItem.owner_id"
          :multiple="true"
          :rules="''"
          :placeholder="$t('topic.select_owner')"
        />
        <small class="form-text text-muted">{{ $t('topic.select_owner_helper') }}</small>
      </div>
      <div v-else></div>
    </template>
    
    <template #committee_id="{ item }">
      <div v-if="!isSubTopic && $route.name != 'committeeDetails'" class="col-sm-12 col-md-6">
        <label for="committee_id" class="form-label">{{
          $t("topic.committee_id")
        }}</label>
        <LazySelectField
          name="committee_id"
          :options="committees"
          v-model="newItem.committee_id"
          :placeholder="$t('topic.select_committee')"
          option-label="name"
          option-value="id"
          rules=""
        />
        <small class="form-text text-muted">{{ $t('topic.select_committee_helper') }}</small>
      </div>
      <div v-else></div>
    </template>
    
    <template #department_id="{ item }">
      <div v-if="isSubTopic" class="col-sm-12 col-md-6">
        <label for="department_id" class="form-label">{{
          $t("topic.department_id")
        }}</label>
        <LazySelectField
          name="department_id"
          options="Department"
          v-model="newItem.department_id"
          :placeholder="$t('topic.select_department')"
          option-label="name"
          :rules="''"
          option-value="id"
          :multiple="true"
          :api-params="{ select: 'id|name' }"
        />
        <small class="form-text text-muted">{{ $t('topic.select_department_helper') }}</small>
      </div>
      <div v-else></div>
    </template>
    
    <!-- <template #risk_id="{ item }">
      <div v-if="isSubTopic" class="col-sm-12 col-md-6">
        <label for="risk_id" class="form-label">{{
          $t("topic.risk_id")
        }}</label>
        <LazySelectField
          name="risk_id"
          options="Risk"
          v-model="newItem.risk_id"
          :placeholder="$t('topic.select_risk')"
          option-label="name"
          option-value="id"
          :multiple="true"
          :api-params="{ select: 'id|name' }"
        />
        <small class="form-text text-muted">{{ $t('topic.select_risk_helper') }}</small>
      </div>
      <div v-else></div>
    </template> -->
    
    <template #control_id="{ item }">
      <div v-if="isSubTopic" class="col-sm-12 col-md-6">
        <label for="control_id" class="form-label">{{
          $t("topic.control_id")
        }}</label>
        <LazySelectField
          name="control_id"
          options="Control"
          v-model="newItem.control_id"
          :placeholder="$t('topic.select_control')"
          option-label="short_name"
          option-value="id"
          :multiple="true"
          :api-params="{ select: 'id|short_name' }"
        />
        <small class="form-text text-muted">{{ $t('topic.select_control_helper') }}</small>
      </div>
      <div v-else></div>
    </template>
    
    <template #stakeholder_ids="{ item }">
      <div v-if="isSubTopic" class="col-sm-12 col-md-6">
        <label for="stakeholder_ids" class="form-label">{{
          $t("topic.stakeholder_ids")
        }}</label>
        <UserSelect
          v-model="newItem.stakeholder_ids"
          :multiple="true"
          :rules="''"
          :placeholder="$t('topic.select_stakeholders')"
        />
        <small class="form-text text-muted">{{ $t('topic.select_stakeholders_helper') }}</small>
      </div>
      <div v-else></div>
    </template>
    
    <template #topic_files="item">
      <div v-if="isSubTopic && !newItem?.id" class="col-sm-12 col-md-6">
        <div class="form-group">
          <label for="topic_files" class="form-label">{{
            $t("topic.topic_files")
          }}</label>
          <input type="file" class="form-control" id="file" @change="handleFileChange" multiple />
          <small class="form-text text-muted">
            {{
              newItem.id && newItem.topic_files
                ? $t('topic.upload_replace')
                : $t('topic.please_upload_files')
            }}
          </small>
        </div>
      </div>
      <div v-else></div>
    </template>
  </Form>
</template>

<script>
// Importing necessary components and API modules
import topic from "@/API/Topic/Topic";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import UserSelect from "@/components/UserSelect.vue";
import LazySelectField from "@/components/LazySelectField.vue";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    UserSelect,
    LazySelectField,
  },

  props: {
    newItem: {
      type: Object,
      required: false,
    },
    closeForm: {
      type: Function,
      required: true,
    },
    editItem: {
      type: Function,
      required: true,
    },
    users: {
      type: Array,
      required: false,
    },
    mainTopics: {
      type: Array,
      required: false,
    },
    committees: {
      type: Array,
      required: false,
    },
  },

  setup() {
    const api = new topic();
    const apiParams = {};
    const tableColumns = [];
    const fromFields = [];

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
    };
  },

  async mounted() {
    // Filter main topics
    this.filteredMainTopics = [...this.mainTopics];
    if (this.newItem.id) {
      this.filteredMainTopics = this.mainTopics.filter(
        (topic) => topic.id !== this.newItem.id
      );
    }

    if (this.$route.name == "committeeDetails") {
      this.disableTopic = false;
      this.filteredMainTopics = this.filteredMainTopics.filter(
        (topic) => topic.committee_id == this.$route.params.id
      );
    }

    // Update form field options
    const mainTopicsField = this.fromFields.find(
      (field) => field.name === "topic_id"
    );
    mainTopicsField.options = this.filteredMainTopics?.map((mainTopic) => ({
      id: mainTopic.id,
      name: mainTopic.name,
    }));

    const ownerField = this.fromFields.find(
      (field) => field.name === "owner_id"
    );
    ownerField.options = this.users?.map((user) => ({
      id: user.id,
      name: user.full_name,
    }));

    const stakeholderField = this.fromFields.find(
      (field) => field.name === "stakeholder_ids"
    );
    stakeholderField.options = this.users.map((user) => ({
      id: user.id,
      name: user.full_name,
    }));

    const committeeField = this.fromFields.find(
      (field) => field.name === "committee_id"
    );
    committeeField.options = this.committees.map((committee) => ({
      id: committee.id,
      name: committee.name,
    }));
  },

  data() {
    return {
      isFlipped: false,
      isReadonly: false,
      isSubTopic: false,
      filteredMainTopics: [],
      disableTopic: false,
      currentRoute: ""
    };
  },

  created() {
    this.currentRoute = this.$route.name;
    if (this.$route.name == "committeeDetails") {
      this.apiParams.filter = `committee_id|${this.$route.params.id}`;
      if (this.newItem.topic_id) {
        delete this.newItem.committee_id;
      } else {
        this.newItem.committee_id = this.$route.params.id;
      }
    }

    // Define the form fields schema
    this.fromFields = [
      {
        name: "name",
        label: this.$t("topic.name"),
        type: "text",
        rules: "required",
        description: this.$t('topic.enter_name_description'),
        col: 6,
        placeholder: this.$t('topic.enter_name_placeholder'),
      },
      {
        type: "options",
        name: "topic_id",
        label: this.$t("topic.MainTopic"),
        options: [],
        optionLabel: "name",
        col: 6,
        rules: "required",
        description: this.$t('topic.select_owner_description'),
      },
      {
        name: "committee_id",
      },
      {
        name: "department_id",
      },
      {
        name: "owner_id",
        col: 6,
      },
      {
        name: "control_id",
      },
      // {
      //   name: "risk_id",
      // },
      {
        name: "stakeholder_ids",
      },
      {
        name: "topic_files",
      },
      {
        name: "description",
        label: this.$t("topic.description"),
        type: "textarea",
        rules: "",
        description: this.$t('topic.provide_description'),
        col: 12,
      },
    ];
  },

  watch: {
    "newItem.topic_id": {
      handler(newValue) {
        if (newValue && newValue != null) {
          this.isSubTopic = true;
          this.newItem.committee_id = null;
        } else {
          this.isSubTopic = false;
        }
      },
      immediate: true,
    },
    "newItem.committee_id": {
      handler(newValue) {
        if (newValue && newValue != null) {
          this.disableTopic = true;
        } else {
          this.disableTopic = false;
        }
      },
      immediate: true,
    },
  },

  methods: {
    handleFileChange(event) {
      const files = event.target.files;
      if (files) {
        this.newItem.topic_files = files;
      }
    },
    
    onMainTopicChange(value) {
      console.log("Main topic changed to:", value);
      if (value) {
        this.isSubTopic = true;
      } else {
        this.isSubTopic = false;
      }
    },
  },
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>