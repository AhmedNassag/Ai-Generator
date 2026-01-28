<template>
  <div class="model-logs">
    <!-- Table View -->
    <div class="table-container">
      <table class="logs-table">
        <thead>
          <tr>
            <th>Changes</th>
            <th>Action</th>
            <th>Timestamp</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id || log._id">
            <td class="changes-cell">
              <div class="changes-text">
                <!-- Render changes using components instead of v-html -->
                <div v-for="(change, index) in getChangesList(log)" :key="index" class="change-item">
                  <span v-if="change.fieldName" :class="`field-badge ${getFieldBadgeColor(change.fieldName)}`">{{ change.fieldName }}</span>
                  <span v-html="change.description"></span>
                </div>
              </div>
            </td>
            <td>
              <span :class="`action-badge ${getActionBadgeColor(index)}`">
                {{log.action}}
              </span>
            </td>
            <td>{{ formatDate(log.created_at) }}</td>
            <td>{{ getUserName(log.user_id) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import User from '@/API/User/User';
export default {
  name: 'ModelLogs',
  
  props: {
    logs: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    const userApi = new User();
    return {
      userApi
    }
  },

  data() {
    return {
      users: {},
      // Color mapping for consistent field badge colors
      fieldColorMap: {},
      // Available badge colors (suitable for log display)
      badgeColors: [
        'badge-blue', 'badge-green', 'badge-purple', 'badge-orange',
        'badge-teal', 'badge-red', 'badge-indigo', 'badge-pink',
        'badge-cyan', 'badge-amber', 'badge-lime', 'badge-emerald'
      ],
      // Available action badge colors
      actionBadgeColors: [
        'action-blue', 'action-green', 'action-purple', 'action-orange',
        'action-teal', 'action-red', 'action-indigo', 'action-pink',
        'action-cyan', 'action-amber', 'action-lime', 'action-emerald'
      ]
    }
  },

  async created() {
    await this.fetchUsers();
  },

  methods: {
    /**
     * Get random color class for action badge based on row index
     * @param {Number} index - Row index for randomization
     * @returns {String} - CSS class for action badge color
     */
    getActionBadgeColor(index) {
      // Use index and some randomization to get different colors
      const colorIndex = (index * 7 + 3) % this.actionBadgeColors.length;
      return this.actionBadgeColors[colorIndex];
    },

    /**
     * Get consistent color class for a field name
     * @param {String} fieldName - The field name
     * @returns {String} - CSS class for badge color
     */
    getFieldBadgeColor(fieldName) {
      if (!this.fieldColorMap[fieldName]) {
        // Generate a consistent color based on field name hash
        let hash = 0;
        for (let i = 0; i < fieldName.length; i++) {
          const char = fieldName.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        
        const colorIndex = Math.abs(hash) % this.badgeColors.length;
        this.fieldColorMap[fieldName] = this.badgeColors[colorIndex];
      }
      
      return this.fieldColorMap[fieldName];
    },

    /**
     * Get a list of changes for rendering in the template
     * @param {Object} log - The log object
     * @returns {Array} - Array of change objects with fieldName and description
     */
    getChangesList(log) {
      if (!log.data && !log.old_data) {
        return [{
          fieldName: null,
          description: `${this.formatAction(log.action)} by ${this.getUserName(log.user_id)}`
        }];
      }

      // Handle creation (no old_data)
      if (log.action === 'create' && !log.old_data) {
          return [{
            fieldName: null,
            description: `New ${log.class} created successfully`
          }];
  
      }

      // Handle deletion (no new data)
      if (log.action === 'delete' && !log.data) {
        return [{
          fieldName: null,
          description: `Deleted by ${this.getUserName(log.user_id)}`
        }];
      }

      // Compare old and new data
      const changes = this.compareObjectsForList(log.old_data || {}, log.data || {});
      
      if (changes.length === 0) {
        return [{
          fieldName: null,
          description: `No significant changes detected by ${this.getUserName(log.user_id)}`
        }];
      }

      return changes;
    },

    /**
     * Compare two objects and return an array of change objects for template rendering
     * @param {Object} oldData - Original values
     * @param {Object} newData - New values
     * @param {String} prefix - Prefix for nested fields
     * @returns {Array} - Array of change objects with fieldName and description
     */
    compareObjectsForList(oldData, newData, prefix = '') {
      const changes = [];
      
      // Get all unique keys from both objects
      const allKeys = new Set([
        ...Object.keys(oldData || {}),
        ...Object.keys(newData || {})
      ]);

      for (const key of allKeys) {
        // Skip ID fields, metadata, nested objects, and ID arrays
        if (this.shouldIgnoreField(key, oldData?.[key]) || this.shouldIgnoreField(key, newData?.[key])) continue;

        const oldValue = oldData?.[key];
        const newValue = newData?.[key];
        
        const fieldName = prefix ? `${prefix}.${key}` : key;
        const displayName = this.formatFieldName(fieldName);

        // Skip nested objects completely
        if (this.isObject(oldValue) || this.isObject(newValue)) {
          continue;
        }

        // Handle arrays (but ignore ID-only arrays)
        if (Array.isArray(oldValue) || Array.isArray(newValue)) {
          if (this.isIdOnlyArray(oldValue) || this.isIdOnlyArray(newValue)) continue;
          
          const oldArrayStr = this.formatValue(oldValue);
          const newArrayStr = this.formatValue(newValue);
          
          if (oldArrayStr !== newArrayStr) {
            changes.push({
              fieldName: displayName,
              description: `changed from <span class="value-old">${oldArrayStr}</span> to <span class="value-new">${newArrayStr}</span>`
            });
          }
          continue;
        }

        // Compare primitive values
        const formattedOldValue = this.formatValue(oldValue);
        const formattedNewValue = this.formatValue(newValue);

        if (formattedOldValue !== formattedNewValue) {
          let description = '';
          
          if (oldValue === undefined || oldValue === null) {
            description = `set to <span class="value-new">${formattedNewValue}</span>`;
          } else if (newValue === undefined || newValue === null) {
            description = `removed (was <span class="value-old">${formattedOldValue}</span>)`;
          } else {
            description = `changed from <span class="value-old">${formattedOldValue}</span> to <span class="value-new">${formattedNewValue}</span>`;
          }
          
          changes.push({
            fieldName: displayName,
            description: description
          });
        }
      }

      return changes;
    },

    /**
     * Check if a field should be ignored (ID fields, metadata, nested objects, arrays with IDs)
     * @param {String} fieldName - The field name to check
     * @param {*} value - The field value to check
     * @returns {Boolean} - True if field should be ignored
     */
    shouldIgnoreField(fieldName, value = null) {
      const ignoredFields = [
        'id', '_id', 'created_at', 'updated_at', 'deleted_at',
        'created_by', 'updated_by', 'deleted_by'
      ];
      
      // Exact matches
      if (ignoredFields.includes(fieldName.toLowerCase())) return true;
      
      // Fields ending with _id or _ids
      if (fieldName.toLowerCase().endsWith('_id') || fieldName.toLowerCase().endsWith('_ids')) return true;
      
      // Fields containing 'id' in the name
      if (fieldName.toLowerCase().includes('id')) return true;
      
      // Check if value is a nested object
      if (this.isObject(value)) return true;
      
      // Check if value is an array of IDs
      if (Array.isArray(value) && this.isIdOnlyArray(value)) return true;
      
      return false;
    },

    /**
     * Check if an array contains only ID values (strings or numbers)
     * @param {Array} arr - Array to check
     * @returns {Boolean} - True if array contains only IDs
     */
    isIdOnlyArray(arr) {
      if (!Array.isArray(arr) || arr.length === 0) return false;
      
      return arr.every(item => {
        // Check if it's a primitive ID (string/number)
        if (typeof item === 'string' || typeof item === 'number') {
          // Consider it an ID if it's a MongoDB ObjectId pattern, UUID, or simple number
          const str = String(item);
          return /^[0-9a-fA-F]{24}$/.test(str) || // MongoDB ObjectId
                 /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(str) || // UUID
                 /^\d+$/.test(str); // Simple number ID
        }
        return false;
      });
    },

    /**
     * Check if a value is a plain object (not array, not null)
     * @param {*} value - Value to check
     * @returns {Boolean} - True if it's a plain object
     */
    isObject(value) {
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    },

    /**
     * Format a field name for display (snake_case to Title Case)
     * @param {String} fieldName - Raw field name
     * @returns {String} - Formatted field name
     */
    formatFieldName(fieldName) {
      return fieldName
        .split('.')
        .map(part => 
          part.split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
        )
        .join(' → ');
    },

    /**
     * Format a value for display
     * @param {*} value - Value to format
     * @returns {String} - Formatted value
     */
    formatValue(value) {
      if (value === null || value === undefined) return '(empty)';
      if (value === '') return '(blank)';
      
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      if (Array.isArray(value)) {
        if (value.length === 0) return '(empty list)';
        return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
      }
      
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      
      // Wrap strings in quotes for clarity
      if (typeof value === 'string') {
        return `"${value}"`;
      }
      
      return String(value);
    },

    /**
     * Format object values for creation logs
     * @param {Object} data - Object data
     * @returns {Array} - Array of {name, value} objects
     */
    formatObjectValues(data) {
      if (!data) return [];
      
      const fields = [];
      
      for (const [key, value] of Object.entries(data)) {
        if (this.shouldIgnoreField(key, value)) continue;
        
        fields.push({
          name: this.formatFieldName(key),
          value: this.formatValue(value)
        });
      }
      
      return fields;
    },

    /**
     * Format action for display
     * @param {String} action - Raw action name
     * @returns {String} - Formatted action
     */
    formatAction(action) {
      const actionMap = {
        'created': 'Created',
        'updated': 'Updated',
        'deleted': 'Deleted',
        'restored': 'Restored'
      };
      
      return actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1);
    },

    /**
     * Format date for display (your existing method)
     */
    formatDate(date) {
      if (!date) return "N/A";

      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      const hours = d.getHours() % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = d.getHours() >= 12 ? 'PM' : 'AM';

      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    },

    /**
     * Get user name from user ID (your existing method with fix)
     */
    getUserName(userId) {
      if (!userId) return 'Unknown User';
      
      const user = this.users[userId];
      console.log("------------user name----------", user);
      return user?.full_name || `User #${userId}`;
    },

    /**
     * Fetch users for name lookup (your existing method)
     */
    async fetchUsers() {
      try {
        const usersArray = await this.userApi.getAll({ select: "id|full_name" });
        
        // Convert array to object with user ID as key for faster lookup
        this.users = usersArray.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }
  }
}
</script>

<style scoped>
.model-logs {
  margin: 0 auto;
  padding: 20px;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  background: #ffffff;
  min-height: 100vh;
}

.table-container {
  overflow-x: auto;
  margin-top: 20px;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.logs-table th,
.logs-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  font-size: 12px;
}

.logs-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.logs-table tr:hover {
  background: #f8f9fa;
}

.action-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  color: white;
  background: #3b82f6 !important;
}

/* Colorful action badge variations */
.action-blue {
  background: #3b82f6 !important;
}

.action-green {
  background: #10b981 !important;
}

.action-purple {
  background: #8b5cf6 !important;
}

.action-orange {
  background: #f59e0b !important;
}

.action-teal {
  background: #14b8a6 !important;
}

.action-red {
  background: #ef4444 !important;
}

.action-indigo {
  background: #6366f1 !important;
}

.action-pink {
  background: #ec4899 !important;
}

.action-cyan {
  background: #06b6d4 !important;
}

.action-amber {
  background: #f59e0b !important;
}

.action-lime {
  background: #84cc16 !important;
}

.action-emerald {
  background: #059669 !important;
}

.changes-cell {
  max-width: 400px;
}

.changes-text {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  max-height: 250px;
  overflow-y: auto;
}

/* Individual change items */
.change-item {
  margin-bottom: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.change-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* Base field badge styling */
.field-badge {
  display: inline-block;
  color: white !important;
  padding: 3px 8px !important;
  border-radius: 10px !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
  flex-shrink: 0;
  min-width: fit-content;
}

/* Colorful badge variations */
.badge-blue {
  background: #3b82f6 !important;
}

.badge-green {
  background: #10b981 !important;
}

.badge-purple {
  background: #8b5cf6 !important;
}

.badge-orange {
  background: #f59e0b !important;
}

.badge-teal {
  background: #14b8a6 !important;
}

.badge-red {
  background: #ef4444 !important;
}

.badge-indigo {
  background: #6366f1 !important;
}

.badge-pink {
  background: #ec4899 !important;
}

.badge-cyan {
  background: #06b6d4 !important;
}

.badge-amber {
  background: #f59e0b !important;
}

.badge-lime {
  background: #84cc16 !important;
}

.badge-emerald {
  background: #059669 !important;
}

/* Value styling */
.value-old {
  background: #f8d7da !important;
  color: #721c24 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  font-size: 12px !important;
}

.value-new {
  background: #d4edda !important;
  color: #155724 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  font-size: 12px !important;
}

.value-text {
  background: #e7f3ff !important;
  color: #0056b3 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
   font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman','sans-serif';
  font-size: 12px !important;
}

/* Card View Styles */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.log-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.timestamp {
  font-size: 12px;
  color: #666;
}

.card-body {
  padding: 16px;
}

.changes-section {
  margin-top: 12px;
}

.changes-section strong {
  display: block;
  margin-bottom: 8px;
  color: #555;
}
</style>