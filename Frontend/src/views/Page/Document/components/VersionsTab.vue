<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Document Versions</h3>
      <button type="button" class="btn btn-info" v-if="canAddVersion" @click="$emit('add-version', document)">
        <i class="fas fa-plus me-2"></i>Add Version
      </button>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Version</th>
            <th>Created At</th>
            <th>Transition</th>
            <th>Expiration Date</th>
            <th>Published Date</th>
            <th>Active</th>
            <th>Status</th>
            <th>Privacy</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(version, index) in visibleVersions" :key="version.id">
            <td>{{ index + 1 }}</td>
            <td>
              <a href="#" class="text-decoration-underline" @click.prevent="$emit('view-version', version)">
                {{ `V.${version.versionNumber}` }}
              </a>
            </td>
            <td>{{ formatDate(version.created_at) }}</td>
            <td>
              <v-btn size="small" v-if="version.active != 1 && hasAvailableTransitions(version)" color="primary"
                @click="$emit('transition', version)" :disabled="transitionLoading">
                <v-icon icon="mdi-swap-horizontal" class="me-1"></v-icon>
                Transitions
              </v-btn>
            </td>
            <td>{{ version.expiration_date }}</td>
            <td>{{ version.published_date }}</td>
            <td>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" :disabled="!canMakeActiveVersion"
                  :checked="version.active === 1" @change="$emit('toggle-status', version, $event)"
                  v-permission:activeVersionOrDeactivate />
              </div>
            </td>
            <td>
              <span class="badge badge-pill badge-secondary">{{ version.status }}</span>
            </td>
            <td>
              <span class="badge rounded-pill" :class="getPrivacyBadgeClass(version.privacy)">
                {{ version.privacy }}
              </span>
            </td>
            <td class="text-nowrap">
              <a v-if="version.filepath" :href="getFilePath(version.filepath)"
                class="btn btn-sm btn-outline-primary me-1" target="_blank" title="Download">
                <i class="fas fa-download"></i>
              </a>
              <button v-if="version.active != 1 && hasAvailableTransitions(version) && canUpdateVersion"
                class="btn btn-sm btn-outline-warning" @click="$emit('edit-version', version)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
          <tr v-if="document.versionnotes.length === 0">
            <td colspan="10" class="text-center text-muted py-4">
              No versions available
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Auth from "@/API/Auth";

export default {
  name: "VersionsTab",
  props: {
    document: {
      type: Object,
      required: true,
    },
    visibleVersions: {
      type: Array,
      default: () => [],
    },
    canAddVersion: {
      type: Boolean,
      default: false,
    },
    canUpdateVersion: {
      type: Boolean,
      default: false,
    },
    canMakeActiveVersion: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: Array,
      default: () => [],
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
    transitionLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["add-version", "edit-version", "view-version", "toggle-status", "transition"],
  methods: {
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getFilePath(filepath) {
      if (!filepath) return "#";
      const cleanedPath = filepath.replace(/^\/+/, "").replace(/^api\/+/, "");
      const baseUrl = BASEPATH.replace(/\/+$/, "").replace(/\/api$/, "");
      const finalPath = cleanedPath.includes("storage/")
        ? cleanedPath
        : `storage/${cleanedPath}`;
      return `${baseUrl}/${finalPath}`;
    },
    getPrivacyBadgeClass(privacy) {
      const privacyMap = {
        public: "bg-success",
        private: "bg-danger",
      };
      return `${privacyMap[privacy?.toLowerCase()] || "bg-secondary"} text-white`;
    },

    hasAvailableTransitions(version) {
      const currentStep = this.workflowSteps.find(
        (step) => step.code === version.step_code
      );

      // Check if there are valid transitions (with required fields)
      const validTransitions = currentStep?.transitions?.filter(transition =>
        transition?.name &&
        transition?.to_step_name &&
        transition?.permissions
      );

      return validTransitions?.length > 0;
    },
    canEditVersion(version) {
      const userId = Auth.USER.id;
      return (
        userId === this.document.owner_id ||
        userId === this.document.reviewer_id ||
        userId === this.document.created_by
      );
    },
  },
};
</script>