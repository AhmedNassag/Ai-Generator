<template>
  <Modal :model-value="viewModal" @update:model-value="$emit('update:viewModal', $event)" :title="$t('task.view_task')"
    size="medium" :has-submit="false" :show-footer="true" :cancel-text="$t('common.close')" @close="$emit('close')">
    <v-row>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.title') }}</span>
        <p>{{ taskData.title }}</p>
      </v-col>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.category') }}</span>
        <p>{{ getCategoryNameById(taskData.category_id) }}</p>
      </v-col>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.priority') }}</span>
        <p>
          <span :class="['priority', taskData.priority]">
            {{ $t(`task.${taskData.priority}`) }}
          </span>
        </p>
      </v-col>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.assign_type') }}</span>
        <p>
          <span v-if="taskData.assign_type === 'user'" class="priority low">{{
            $t("task.users")
          }}</span>
          <span v-else-if="taskData.assign_type === 'team'" class="priority urgent">{{ $t("task.teams") }}</span>
        </p>
      </v-col>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.assignee') }}</span>
        <p>
          {{
            taskData.assign_type === "user"
              ? users.find(user => user.id === taskData.assignee_id)?.full_name
              : teams.find(team => team.id === taskData.assignee_id)?.name
          }}
        </p>
      </v-col>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.status') }}</span>
        <p>
          <span :class="['status', taskData.status]">
            {{ $t(`task.${taskData.status}`) }}
          </span>
        </p>
      </v-col>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.start_date') }}</span>
        <p>{{ formateDate(taskData.start_date) }}</p>
      </v-col>
      <v-col cols="6">
        <span class="font-weight-bold">{{ $t('task.due_date') }}</span>
        <p :class="{ 'text-danger': new Date() >= new Date(taskData.due_date) }">{{ formateDate(taskData.due_date) }}</p>
      </v-col>
      <v-col cols="12">
        <span class="font-weight-bold">{{ $t('task.description') }}</span>
        <p>{{ stripHtml(taskData.description) }}</p>
      </v-col>
    </v-row>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  components: {
    Modal
  },
  props: {
    viewModal: {
      type: Boolean,
      required: true
    },
    taskData: {
      type: Object,
      required: true
    },
    users: {
      type: Array,
      required: true
    },
    teams: {
      type: Array,
      required: true
    },
    getCategoryNameById: {
      type: Function,
      required: true
    },
    formateDate: {
      type: Function,
      required: true
    },
    stripHtml: {
      type: Function,
      required: true
    },
  },

  methods: {
    getPriorityText(priority) {
      switch (priority) {
        case 'no_priority':
          return 'No priority';
        case 'low':
          return 'Low';
        case 'medium':
          return 'Medium';
        case 'high':
          return 'High';
        case 'urgent':
          return 'Urgent';
        default:
          return '';
      }
    },
    getPriorityColor(priority) {
      switch (priority) {
        case 'no_priority':
          return 'success';
        case 'low':
          return 'secondary';
        case 'medium':
          return 'primary';
        case 'high':
          return 'warning';
        case 'urgent':
          return 'red';
        default:
          return 'secondary';
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'open':
          return 'secondary';
        case 'in_progress':
          return 'primary';
        case 'complete':
          return 'success';
        default:
          return 'secondary';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'open':
          return 'Open';
        case 'in_progress':
          return 'In progress';
        case 'complete':
          return 'Complete';
        default:
          return '';
      }
    },
  }
}
</script>

<style scoped>
/* START Status */
.status {
  display: inline-flex;
  align-items: center;
  width: max-content;
  height: 20px;
  opacity: 1;
  border-radius: 10px;
  padding: 8px 9px;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
}

.status.open {
  background: #b3c0eb;
  color: #2c1bc4;
}

.status.closed {
  background: #d6eed3;
  color: #2f9826;
  cursor: none;
}

.status.in_progress {
  background: #ebd3b3;
  color: #e28f0b;
}

.status.unknown {
  background: #e0e0e0;
  color: #616161;
}

/* END status */

/* START priority */
.priority {
  display: inline-flex;
  align-items: center;
  width: max-content;
  height: 20px;
  opacity: 1;
  border-radius: 10px;
  padding: 8px 9px;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
}

.priority.low {
  background: #b6caae;
  color: #255f0b;
}

.priority.medium {
  background: #f3ead1;
  color: #c4951b;
}

.priority.high {
  background: #eed3d3;
  color: #a92525;
}

.priority.urgent {
  background: #8d1f1f;
  color: #ffffff;
}

.priority.no_priority {
  background: #e0e0e0;
  color: #616161;
}

/* END priority */
</style>