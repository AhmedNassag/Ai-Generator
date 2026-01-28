<template>
  <v-dialog
    :model-value="viewModal"
    @update:model-value="$emit('update:viewModal', $event)"
    max-width="900"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t("log.view_log") }}</span>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <span class="font-weight-bold">
              {{ $t("log.class") }}
            </span>
            <p>{{ logData.class }}</p>
          </v-col>
          <v-col cols="6">
            <span class="font-weight-bold">{{ $t("log.action") }}</span>
            <p>{{ logData.action }}</p>
          </v-col>
          <v-col cols="6">
            <span class="font-weight-bold">{{ $t("log.service_name") }}</span>
            <p>{{ logData.service_name }}</p>
          </v-col>
          <!-- <v-col cols="6">
            <span class="font-weight-bold">{{ $t("log.ip_address") }}</span>
            <p>{{ logData.ip_address }}</p>
          </v-col> -->
          <v-col cols="6">
            <span class="font-weight-bold">{{ $t("log.browser") }}</span>
            <p>{{ logData.browser }}</p>
          </v-col>
          <v-col cols="6">
            <span class="font-weight-bold">{{
              $t("log.operating_system")
            }}</span>
            <p>{{ logData.operating_system }}</p>
          </v-col>
          <v-col cols="6">
            <span class="font-weight-bold">{{ $t("log.action_date") }}</span>
            <p>{{ formatDate(logData.created_at) }}</p>
          </v-col>
          <v-col cols="6">
            <span class="font-weight-bold">{{ $t("log.username") }}</span>
            <p>{{ getUserName(logData?.user_id).username }}</p>
          </v-col>
          <v-col cols="6">
            <span class="font-weight-bold">{{ $t("log.action_by") }}</span>
            <p>{{ getUserName(logData?.user_id).full_name }}</p>
          </v-col>

          <!-- Changes Section -->
          <v-col cols="12">
            <v-divider class="my-4"></v-divider>
            <span class="font-weight-bold text-h6">{{
              $t("log.changes")
            }}</span>
            <div class="mt-3">
              <div v-if="getActionMessage()" class="mb-3">
                <v-alert :color="getActionColor()" variant="tonal" class="mb-3">
                  <v-icon :icon="getActionIcon()" class="mr-2"></v-icon>
                  {{ getActionMessage() }}
                </v-alert>
              </div>

              <div
                v-if="logData.action === 'update' && getChanges().length > 0"
              >
                <v-card variant="outlined" class="pa-3">
                  <div
                    v-for="(change, index) in getChanges()"
                    :key="`${change.field}-${index}`"
                    class="mb-3"
                  >
                    <div class="d-flex align-center mb-2">
                      <v-icon
                        :icon="getChangeIcon(change)"
                        size="small"
                        class="mr-2"
                        :color="getChangeTypeColor(change)"
                      ></v-icon>
                      <span
                        class="font-weight-bold"
                        :class="`text-${getChangeTypeColor(change)}`"
                      >
                        {{ formatFieldName(change.field) }}
                      </span>
                    </div>
                    <div class="ml-6">
                      <div class="d-flex align-center flex-wrap">
                        <span class="text-body-2 mr-2">From:</span>
                        <v-chip
                          size="small"
                          :color="getValueChipColor(change.oldValue, 'old')"
                          variant="outlined"
                          class="mr-2 my-1 chip-fix"
                        >
                          <v-icon
                            v-if="isEmptyValue(change.oldValue)"
                            size="x-small"
                            class="mr-1"
                          >
                            mdi-minus-circle-outline
                          </v-icon>

                          <span
                            class="html-fix"
                            v-html="formatValue(change.oldValue)"
                          ></span>
                        </v-chip>

                        <v-icon size="small" class="mx-2"
                          >mdi-arrow-right</v-icon
                        >
                        <span class="text-body-2 mr-2">To:</span>
                        <v-chip
                          size="small"
                          :color="getValueChipColor(change.newValue, 'new')"
                          variant="outlined"
                          class="my-1"
                        >
                          <v-icon
                            v-if="isEmptyValue(change.newValue)"
                            size="x-small"
                            class="mr-1"
                          >
                            mdi-minus-circle-outline
                          </v-icon>
                          <span  class="html-fix" v-html="formatValue(change.newValue)"></span>
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </v-card>

                <!-- Summary -->
                <v-alert
                  v-if="getChanges().length > 3"
                  color="blue-grey"
                  variant="tonal"
                  class="mt-3"
                  density="compact"
                >
                  <v-icon
                    icon="mdi-chart-box-outline"
                    class="mr-2"
                    size="small"
                  ></v-icon>
                  <span class="text-caption">
                    Total {{ getChanges().length }} field(s) modified
                    <span v-if="getChangesSummary().added > 0">
                      • {{ getChangesSummary().added }} added</span
                    >
                    <span v-if="getChangesSummary().removed > 0">
                      • {{ getChangesSummary().removed }} removed</span
                    >
                    <span v-if="getChangesSummary().modified > 0">
                      • {{ getChangesSummary().modified }} changed</span
                    >
                  </span>
                </v-alert>
              </div>

              <div
                v-else-if="
                  logData.action === 'update' && getChanges().length === 0
                "
              >
                <v-alert color="info" variant="tonal">
                  <v-icon icon="mdi-information" class="mr-2"></v-icon>
                  No data was modified in this update.
                </v-alert>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" variant="text" @click="$emit('close')">
          {{ $t("log.close") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import modelsConfig from "@/core/data/model_service_relation_map.json";

export default {
  props: {
    viewModal: {
      type: Boolean,
      required: true,
    },
    logData: {
      type: Object,
      required: true,
    },
    users: {
      type: Array,
      required: true,
    },
  },

  methods: {
    getUserName(userId) {
      if (!userId) return "N/A";
      return this.users?.find((user) => user.id === userId) || "N/A";
    },

    formatDate(date) {
      if (!date) return "N/A";

      const formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date));

      return formatted.replace(",", "");
    },

    getDefaultFieldValue(data, modelName, modelsConfig) {
      if (!data || typeof data !== "object") {
        return "N/A";
      }

      const modelConfig = modelsConfig.Models[modelName];
      if (modelConfig && modelConfig.default_field) {
        const defaultField = modelConfig.default_field;
        if (data[defaultField]) {
          return data[defaultField];
        }
      }

      const commonFields = ["name", "title", "full_name", "subject"];
      for (const field of commonFields) {
        if (data[field]) {
          return data[field];
        }
      }

      const dynamicKey = Object.keys(data).find((key) => {
        const lowerKey = key.toLowerCase();
        return (
          lowerKey.includes("name") ||
          lowerKey.includes("title") ||
          lowerKey === "subject"
        );
      });

      if (dynamicKey && data[dynamicKey]) {
        return data[dynamicKey];
      }

      return data["id"] || data["_id"] || "N/A";
    },

    getActionMessage() {
      const userName = this.getUserName(this.logData?.user_id).full_name;
      const className = this.logData.class || "item";
      const data = this.logData?.data || {};
      const nameOrTitle = this.getDefaultFieldValue(
        data,
        className,
        modelsConfig
      );

      switch ((this.logData.action || "").toLowerCase()) {
        case "insert":
        case "created":
          return `${userName} has created a new ${className}: ${nameOrTitle}`;
        case "delete":
        case "deleted":
          return `${userName} has deleted the ${className}: ${nameOrTitle}`;
        case "show":
        case "view":
        case "viewed":
          return `${userName} has viewed the ${className}: ${nameOrTitle}`;
        case "update":
        case "updated":
          return `${userName} has updated the ${className}: ${nameOrTitle}`;
        default:
          return `${userName} performed ${this.logData.action} on ${className}: ${nameOrTitle}`;
      }
    },

    getActionColor() {
      switch (this.logData.action?.toLowerCase()) {
        case "insert":
        case "created":
          return "success";
        case "delete":
        case "deleted":
          return "error";
        case "show":
        case "view":
        case "viewed":
          return "info";
        case "update":
        case "updated":
          return "warning";
        default:
          return "primary";
      }
    },

    getActionIcon() {
      switch (this.logData.action?.toLowerCase()) {
        case "insert":
        case "created":
          return "mdi-plus-circle";
        case "delete":
        case "deleted":
          return "mdi-delete";
        case "show":
        case "view":
        case "viewed":
          return "mdi-eye";
        case "update":
        case "updated":
          return "mdi-pencil";
        default:
          return "mdi-information";
      }
    },

    getChanges() {
      if (!this.logData.data || !this.logData.old_data) {
        return [];
      }

      const changes = [];
      const newData = this.logData.data;
      const oldData = this.logData.old_data;

      this.compareObjects(oldData, newData, changes);

      return changes;
    },

    compareObjects(oldObj, newObj, changes, prefix = "") {
      const allKeys = new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {}),
      ]);

      for (const key of allKeys) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        const oldValue = oldObj?.[key];
        const newValue = newObj?.[key];

        // Skip objects and arrays
        if (this.isObject(oldValue) || this.isObject(newValue)) {
          continue;
        }

        // Skip date fields
        if (this.isDateField(key)) {
          continue;
        }

        // Enhanced comparison that handles undefined, null, and empty strings
        if (!this.valuesAreEqual(oldValue, newValue)) {
          changes.push({
            field: fieldPath,
            oldValue: oldValue,
            newValue: newValue,
          });
        }
      }
    },

    /**
     * Enhanced value comparison that properly handles undefined, null, and empty values
     */
    valuesAreEqual(val1, val2) {
      // Strict equality check first
      if (val1 === val2) return true;

      // Handle undefined and null as equivalent for practical purposes
      // Comment this out if you want to treat null and undefined as different
      if (this.isNullish(val1) && this.isNullish(val2)) return true;

      // Type coercion for numbers and strings
      if (typeof val1 !== typeof val2) {
        // Try converting to compare (e.g., "123" vs 123)
        return String(val1) === String(val2);
      }

      return false;
    },

    /**
     * Check if value is null or undefined
     */
    isNullish(value) {
      return value === null || value === undefined;
    },

    /**
     * Check if value is considered "empty"
     */
    isEmptyValue(value) {
      return (
        value === null ||
        value === undefined ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
      );
    },

    isObject(value) {
      return (
        value !== null && (typeof value === "object" || Array.isArray(value))
      );
    },

    isDateField(fieldName) {
      const dateFields = ["created_at", "updated_at", "deleted_at"];
      return dateFields.includes(fieldName) || fieldName.endsWith("_at");
    },

    formatFieldName(fieldName) {
      return fieldName
        .split(".")
        .map((part) => part.replace(/_/g, " "))
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" → ");
    },

    /**
     * Enhanced value formatting with better handling of null/undefined
     */
    formatValue(value) {
      if (value === null) return "null";
      if (value === undefined) return "undefined";
      if (value === "") return "(empty string)";
      if (typeof value === "string" && value.trim() === "")
        return "(whitespace)";
      if (typeof value === "boolean") return value ? "true" : "false";
      if (typeof value === "number") return value.toString();

      // Handle very long strings
      const strValue = String(value);
      if (strValue.length > 50) {
        return strValue.substring(0, 47) + "...";
      }

      return strValue;
    },

    /**
     * Get the type of change (added, removed, or modified)
     */
    getChangeType(change) {
      const oldEmpty = this.isEmptyValue(change.oldValue);
      const newEmpty = this.isEmptyValue(change.newValue);

      if (oldEmpty && !newEmpty) return "Added";
      if (!oldEmpty && newEmpty) return "Removed";
      if (change.oldValue === null && change.newValue !== null) return "Set";
      if (change.oldValue !== null && change.newValue === null)
        return "Cleared";
      if (change.oldValue === undefined && change.newValue !== undefined)
        return "Initialized";

      return null; // Modified (default)
    },

    /**
     * Get color for change type
     */
    getChangeTypeColor(change) {
      const type = this.getChangeType(change);

      switch (type) {
        case "Added":
        case "Set":
        case "Initialized":
          return "success";
        case "Removed":
        case "Cleared":
          return "error";
        default:
          return "primary";
      }
    },

    /**
     * Get icon for change type
     */
    getChangeIcon(change) {
      const type = this.getChangeType(change);

      switch (type) {
        case "Added":
        case "Set":
        case "Initialized":
          return "mdi-plus-circle";
        case "Removed":
        case "Cleared":
          return "mdi-minus-circle";
        default:
          return "mdi-pencil";
      }
    },

    /**
     * Get appropriate chip color based on value state
     */
    getValueChipColor(value, position) {
      if (this.isEmptyValue(value)) {
        return position === "old" ? "error" : "success";
      }
      return position === "old" ? "grey" : "success";
    },

    /**
     * Get additional context for value changes
     */
    getValueContext(change) {
      const oldType = typeof change.oldValue;
      const newType = typeof change.newValue;

      if (oldType !== newType) {
        return `Type changed: ${oldType} → ${newType}`;
      }

      if (change.oldValue === null && change.newValue === undefined) {
        return "Changed from null to undefined";
      }

      if (change.oldValue === undefined && change.newValue === null) {
        return "Changed from undefined to null";
      }

      // Check for string trimming
      if (
        typeof change.oldValue === "string" &&
        typeof change.newValue === "string"
      ) {
        if (
          change.oldValue.trim() === change.newValue.trim() &&
          change.oldValue !== change.newValue
        ) {
          return "Whitespace modified";
        }
      }

      return null;
    },

    /**
     * Get summary statistics of changes
     */
    getChangesSummary() {
      const changes = this.getChanges();
      const summary = {
        added: 0,
        removed: 0,
        modified: 0,
      };

      changes.forEach((change) => {
        const type = this.getChangeType(change);

        if (type === "Added" || type === "Set" || type === "Initialized") {
          summary.added++;
        } else if (type === "Removed" || type === "Cleared") {
          summary.removed++;
        } else {
          summary.modified++;
        }
      });

      return summary;
    },
  },
};
</script>

<style scoped>
.text-caption {
  font-size: 0.75rem;
}

.v-chip {
  max-width: 300px;
}

.html-center {
  display: flex;
  align-items: center; /* vertical centering */
}

/* IMPORTANT: reset common injected tags */
.html-center p,
.html-center div {
  margin: 0;
  display: flex;
  align-items: center;
}

/* Fix chip alignment */
.chip-fix {
  display: flex;
  align-items: center;
  line-height: normal; /* override Vuetify */
}

/* Fix injected HTML */
.html-fix,
.html-fix * {
  display: flex;
  align-items: center;
  margin: 0;
  line-height: normal;
}
</style>
