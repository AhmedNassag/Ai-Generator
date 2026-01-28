<template>
  <!-- Simple DataTable for document reviews -->
  <div class="document-reviews-container">
    <DataTable
      ref="table"
      id="documents-review-table"
      :tableClass="'table table-striped table-bordered table-hover'"
      :columns="tableColumns"
      :api="api"
      :apiParams="apiParams"
      :rowClickable="true"
      @row-click="openDocument"
      :hideActions="true"
      :hideDivButtons="true"
      :hideActionsColumn="true"
    >
      <!-- Custom column templates -->
      <!-- <template #title="{ item }">
        <div class="document-title clickable" @click="openDocument(item)">
          <i class="icofont icofont-file-document me-2"></i>
          <span class="fw-bold text-primary">{{ item.title }}</span>
        </div>
      </template> -->
      <template #name="{ item }">
        <router-link
          :to="{
            path: `/document`,
          }"
          style="cursor: pointer; color: #232388"
        >
          {{ item.name }}
        </router-link>
      </template>
      <!-- <template #type="{ item }">
        <span class="badge bg-secondary">{{ item.type }}</span>
      </template> -->

      <template #priority="{ item }">
        <span :class="getPriorityClass(item.priority)">
          {{ item.priority }}
        </span>
      </template>

      <template #status="{ item }">
        <span :class="getStatusClass(item.status)">
          {{ item.status }}
        </span>
      </template>

      <!-- <template #due_date="{ item }">
        <span :class="getDueDateClass(item.due_date)">
          {{ formatDate(item.due_date) }}
        </span>
      </template> -->
      <!-- 
      <template #created_at="{ item }">
        <span>{{ formatDate(item.created_at) }}</span>
      </template> -->

      <template #author="{ item }">
        <div class="d-flex align-items-center">
          <span>{{ getNameOfUser(item.reviewer_id) }}</span>
        </div>
      </template>
      <!-- <template #reviewer="{ item }">
        <div class="d-flex align-items-center">
          <span>{{ getNameOfUser(item.reviewer_id) }}</span>
        </div>
      </template> -->
    </DataTable>
  </div>
</template>

<script>
// Importing necessary components and API modules
import document from "@/API/Document/Document"; // Adjust path as needed
import DataTable from "@/components/DataTable.vue";
import VueSelect from "vue-select";
import Auth from "@/API/Auth";
export default {
  name: "DocumentReviewList",
  components: {
    DataTable,
    "v-select": VueSelect,
  },

  props: {
    users: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    // Initialize API and other required properties
    const api = new document(); // Initialize the document API class

    const relations = [];
    const apiParams = {
      with: relations,
      // Add filter for current user's pending reviews
      filter: "reviewer_id|" + Auth.USER?.id + "|=",
    };

    const tableColumns = [];

    return {
      api,
      apiParams,
      tableColumns,
    };
  },

  async mounted() {
    // Any additional setup can go here
  },

  data() {
    return {
      // No additional data needed for simple display
    };
  },

  async created() {
    // Initialize the table columns
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("documents.name"),
        data: "name",
        defaultContent: "N/A",
        orderable: true,
      },
      //   {
      //     id: "type",
      //     title: this.$t("documents.type"),
      //     data: null,
      //     defaultContent: "N/A",
      //     orderable: true
      //   },
      {
        id: "author",
        title: this.$t("documents.author"),
        data: null,
        defaultContent: "N/A",
        orderable: true,
      },
      //   {
      //     id: "reviewer",
      //     title: this.$t("documents.reviewer"),
      //     data: null,
      //     defaultContent: "N/A",
      //     orderable: true,
      //   },
      {
        id: "priority",
        title: this.$t("documents.priority"),
        data: "priority",
        defaultContent: "N/A",
        orderable: true,
      },
      {
        id: "status",
        title: this.$t("documents.status"),
        data: "status",
        defaultContent: "N/A",
        orderable: true,
      },
      //   {
      //     id: "due_date",
      //     title: this.$t("documents.due_date"),
      //     data: null,
      //     defaultContent: "N/A",
      //     orderable: true,
      //   },
      //   {
      //     id: "created_at",
      //     title: this.$t("documents.created"),
      //     data: null,
      //     defaultContent: "N/A",
      //     orderable: true
      //   }
    ];
  },

  methods: {
    // Handle document click - navigate to document review page
    openDocument(item) {
      // You can customize this based on your routing structure
      this.$router.push({
        name: "DocumentReview", // Adjust route name as needed
        params: { id: item.id },
      });

      // Alternative: emit event to parent component
      // this.$emit('document-selected', item);

      // Alternative: open in new tab
      // window.open(`/documents/${item.id}/review`, '_blank');
    },

    // Get priority badge class
    getPriorityClass(priority) {
      const classes = {
        high: "badge bg-danger",
        medium: "badge bg-warning",
        low: "badge bg-success",
      };
      return classes[priority?.toLowerCase()] || "badge bg-secondary";
    },

    // Get status badge class
    getStatusClass(status) {
      const classes = {
        pending: "badge bg-warning",
        in_review: "badge bg-info",
        overdue: "badge bg-danger",
        completed: "badge bg-success",
      };
      return classes[status?.toLowerCase()] || "badge bg-secondary";
    },

    // Get due date class (highlight overdue items)
    getDueDateClass(dueDate) {
      if (!dueDate) return "";

      const today = new Date();
      const due = new Date(dueDate);

      if (due < today) {
        return "text-danger fw-bold"; // Overdue
      } else if (due <= new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
        return "text-warning fw-bold"; // Due soon (within 1 day)
      }

      return "";
    },

    // Format date helper
    formatDate(date) {
      if (!date) return "N/A";
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
    },

    getNameOfUser(userId) {
      if (!userId) return "";
      if (!this.users || !Array.isArray(this.users)) return "";
      const user = this.users.find((u) => u.id === userId);
      return user?.full_name || "";
    },
  },
};
</script>

<style scoped>
.document-reviews-container {
  padding: 20px;
}

.document-title {
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-title:hover {
  color: #0056b3 !important;
  text-decoration: underline;
}

.clickable {
  cursor: pointer;
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.avatar-title {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

/* Table row hover effect */
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

/* Badge styling */
.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .document-reviews-container {
    padding: 10px;
  }

  .avatar-sm {
    width: 24px;
    height: 24px;
  }

  .avatar-title {
    font-size: 10px;
  }
}
</style>
