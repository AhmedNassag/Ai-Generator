<template>
  <div class="status-container">
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <label>Show
            <select v-model="logsPerPageLocal" class="form-select d-inline-block w-auto mx-1">
              <option :value="3">3</option>
              <option :value="5">5</option>
              <option :value="10">10</option>
            </select>
            entries
          </label>
        </div>
      </div>
      
      <table class="table table-bordered table-hover table-sm bg-white shadow-sm">
        <thead class="table-light">
          <tr>
            <th>User</th>
            <th>Date</th>
            <th>Action</th>
            <th>Changes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in paginatedLogs" :key="index">
            <td class="text-nowrap">{{ getUserName(log.user_id) }}</td>
            <td class="text-nowrap">{{ formatDate(log.created_at) }}</td>
            <td>
              <span class="badge" :class="getActionBadgeClass(log.action)">
                {{ formatAction(log.action) }}
              </span>
            </td>
            <td>
              <div v-for="(change, cIndex) in getDocumentChanges(log)" :key="cIndex"
                class="change-item small">
                <span class="badge bg-light text-dark me-1">{{ change.field }}</span>
                <span v-if="change.from" class="text-danger text-decoration-line-through me-1">
                  {{ change.from }}
                </span>
                <span v-if="change.from && change.to" class="mx-1">→</span>
                <span v-if="change.to" class="text-success">
                  {{ change.to }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <p v-if="!logs.length" class="text-muted small">No logs found</p>
      
      <nav v-if="totalPages > 1">
        <ul class="pagination pagination-sm justify-content-end">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(1)" :disabled="currentPage === 1">
              First
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              Previous
            </button>
          </li>
          <li class="page-item disabled">
            <span class="page-link">Page {{ currentPage }} of {{ totalPages }}</span>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              Next
            </button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(totalPages)" :disabled="currentPage === totalPages">
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: "LogSection",
  props: {
    logs: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    userList: {
      type: Array,
      default: () => [],
    },
    teamList: {
      type: Array,
      default: () => [],
    },
    workflowSteps: {
      type: Array,
      default: () => [],
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    logsPerPage: {
      type: Number,
      default: 3,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
  },
  emits: ["update-current-page"],
  computed: {
    logsPerPageLocal: {
      get() {
        return this.logsPerPage;
      },
      set(value) {
        // Emit to parent if needed
      }
    },
    paginatedLogs() {
      const start = (this.currentPage - 1) * this.logsPerPage;
      return this.logs.slice(start, start + this.logsPerPage);
    },
  },
  methods: {
    changePage(page) {
      this.$emit('update-current-page', page);
    },
    getUserName(userId) {
      if (!userId) return "System";
      const user = this.userList.find((u) => u.id === userId);
      return user ? user.full_name : `User #${userId}`;
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });
    },
    getActionBadgeClass(action) {
      const map = {
        create: 'bg-success',
        update: 'bg-primary',
        status_change: 'bg-info',
        delete: 'bg-danger',
        default: 'bg-secondary'
      };
      return map[action] || map.default;
    },
    formatAction(action) {
      const map = {
        create: 'Created',
        update: 'Updated',
        status_change: 'Status Changed',
        delete: 'Deleted',
        default: action
      };
      return map[action] || action.replace(/_/g, ' ');
    },
    getDocumentChanges(log) {
      const changes = [];
      const oldData = log.old_data || {};
      const newData = log.data || {};

      const allFields = new Set([
        ...Object.keys(oldData),
        ...Object.keys(newData),
      ]);

      const excludedFields = [
        "created_at", "updated_at", "deleted_at", "created_by",
        "category_id", "file_url", "notes", "content", "clauses",
        "id", "versionnotes",
      ];

      allFields.forEach((field) => {
        if (excludedFields.includes(field)) return;
        if (JSON.stringify(oldData[field]) === JSON.stringify(newData[field])) return;

        let fromValue = oldData[field] ?? "N/A";
        let toValue = newData[field] ?? "N/A";

        changes.push({
          field: this.formatColumnName(field),
          from: fromValue,
          to: toValue,
        });
      });

      return changes;
    },
    formatColumnName(fieldName) {
      const nameMap = {
        owner_id: "Owner",
        reviewer_id: "Reviewer",
        team_ids: "Teams",
        stakeholder_ids: "Stakeholders",
        step_code: "Workflow Step",
      };

      return (
        nameMap[fieldName] ||
        fieldName.replace(/_/g, " ").replace(/(?:^|\s)\S/g, (match) => match.toUpperCase())
      );
    },
  },
};
</script>