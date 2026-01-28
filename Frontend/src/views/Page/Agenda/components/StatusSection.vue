<template>
  <div class="status-section">
    <span class="status-badge" :class="getStatusClass(currentStatus)">
      {{ $t(`agenda.status_${currentStatus}`) }}
    </span>

    <div class="status-menu" v-if="displayActions">
      <v-menu location="bottom end" offset="4">
        <template v-slot:activator="{ props }">
          <button class="menu-trigger" v-bind="props">
            <v-icon size="20">mdi-dots-vertical</v-icon>
          </button>
        </template>
        <v-list class="status-list" density="compact">
          <v-list-item
            @click="updateStatus('approved')"
            :disabled="isStatusButtonDisabled('approved')"
            class="status-list-item status-list-item-approved"
          >
            <v-list-item-title class="status-list-title">
              {{ $t('agenda.status_approved') }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="$emit('open-reject-dialog')"
            :disabled="isStatusButtonDisabled('rejected')"
            class="status-list-item status-list-item-rejected"
          >
            <v-list-item-title class="status-list-title">
              {{ $t('agenda.status_rejected') }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="updateStatus('pending')"
            :disabled="isStatusButtonDisabled('pending')"
            class="status-list-item status-list-item-pending"
          >
            <v-list-item-title class="status-list-title">
              {{ $t('agenda.status_pending') }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="updateStatus('deferred')"
            :disabled="isStatusButtonDisabled('deferred')"
            class="status-list-item status-list-item-deferred"
          >
            <v-list-item-title class="status-list-title">
              {{ $t('agenda.status_deferred') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
export default {
  name: "StatusSection",
  props: {
    subtopicId: { type: Number, required: true },
    statusData: { type: Object, default: () => ({}) },
    displayActions: { type: Boolean, required: true },
  },
  emits: ['update-status', 'open-reject-dialog'],
  computed: {
    currentStatus() {
      return this.statusData?.agenda_status || 'pending';
    },
  },
  methods: {
    getStatusClass(status) {
      return {
        'status-pending': status === 'pending',
        'status-approved': status === 'approved',
        'status-rejected': status === 'rejected',
        'status-deferred': status === 'deferred',
      };
    },
    isStatusButtonDisabled(targetStatus) {
      if (this.currentStatus === targetStatus) return true;
      // if (this.currentStatus !== 'pending' && targetStatus !== 'pending') return true;
      return false;
    },
    updateStatus(status) {
      this.$emit('update-status', {
        subtopicId: this.subtopicId,
        status: status
      });
    },
  },
};
</script>

<style scoped>
.status-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  /* border: 1px solid; */
  transition: all 0.2s ease;
}

.status-icon {
  flex-shrink: 0;
}

.status-pending {
  background: f3f4f6;
  color: #C4951B !important;
}

.status-approved {
  background: f3f4f6;
  color: #255F0B !important;
  /* border-color: #86efac; */
}

.status-rejected {
  background: f3f4f6;
  color: #A92525 !important;
  /* border-color: #fecaca; */
}

.status-deferred {
  background: f3f4f6;
  color: #6E3894 !important;
  /* border-color: #d8b4fe; */
}

.status-menu {
  display: flex;
  align-items: center;
}

.menu-trigger {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #6b7280;
}

.menu-trigger:hover {
  background: #f3f4f6;
  color: #374151;
}

.menu-trigger:active {
  background: #e5e7eb;
}

.status-list {
  min-width: 180px !important;
  padding: 6px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  background-color: #F8F8F8 !important;
}

.status-list-item {
  border-radius: 10px !important;
  margin-bottom: 6px !important;
  min-height: 36px !important;
  cursor: pointer;
  border: 4px solid transparent !important;
  transition: all 0.2s ease;
  background-color:  white !important;
  text-align: center !important;
}

.status-list-item:last-child {
  margin-bottom: 0 !important;
}

.status-list-item:hover:not(.v-list-item--disabled) {
  background: #f9fafb !important;
}

.status-list-item.v-list-item--disabled {
  opacity: 0.4;
}

/* .status-list-item-approved {
  border-color: #d1fae5 !important;
} */

.status-list-item-approved .status-list-title {
  color: #166534 !important;
}

.status-list-item-approved:hover:not(.v-list-item--disabled) {
  background: #B6CAAE !important;
  border: 0.5px solid #255F0B !important;
}

/* .status-list-item-rejected {
  border-color: #fecaca !important;
} */

.status-list-item-rejected .status-list-title {
  color: #991b1b !important;
}

.status-list-item-rejected:hover:not(.v-list-item--disabled) {
  background: #E2B6B6 !important;
  border: 0.5px solid #A92525 !important;
}

/* .status-list-item-pending {
  border-color: #fde68a !important;
} */

.status-list-item-pending .status-list-title {
  color: #92400e !important;
}

.status-list-item-pending:hover:not(.v-list-item--disabled) {
  background: #EBDCB3 !important;
  border: 0.5px solid #C4951B !important;
}

/* .status-list-item-deferred {
  border-color: #e9d5ff !important;
} */

.status-list-item-deferred .status-list-title {
  color: #6b21a8 !important;
}

.status-list-item-deferred:hover:not(.v-list-item--disabled) {
  background: #D0B5E3 !important;
  border: 0.5px solid #6E3894 !important;
}

.status-list-title {
  font-size: 14px !important;
  font-weight: 500 !important;
}
</style>