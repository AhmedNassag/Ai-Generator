<template>
  <div class="voting-header">
    <!-- First Row: Stats -->
    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-label">{{ $t('vote.topics') }}</div>
        <div class="stat-value">{{ topicsCount }}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">{{ $t('vote.members') }}</div>
        <div class="stat-value-vote-members">{{ membersCount }}</div>
      </div>
    </div>

    <!-- Second Row: Buttons (left) and Status (right) -->
    <div class="actions-row">
      <div class="button-group">
        <button
          @click="$emit('refresh')"
          class="btn btn-restart"
          :disabled="isLoading"
        >
          <span class="btn-icon"
            ><svg
              width="13"
              height="11"
              viewBox="0 0 13 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.49895V4.49974M1 4.49974H4M1 4.49974L3.32 2.31916C3.85737 1.78138 4.52219 1.38852 5.2524 1.17725C5.98262 0.965979 6.75445 0.943178 7.49586 1.11098C8.23727 1.27877 8.9241 1.6317 9.49227 2.13682C10.0604 2.64195 10.4914 3.28281 10.745 3.99961M12 9.50105V6.50026M12 6.50026H9M12 6.50026L9.68 8.68084C9.14263 9.21862 8.47781 9.61148 7.7476 9.82275C7.01738 10.034 6.24555 10.0568 5.50414 9.88902C4.76273 9.72123 4.0759 9.3683 3.50773 8.86317C2.93957 8.35805 2.50858 7.71719 2.255 7.00039"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          {{ $t('vote.refresh') }}
        </button>
        <button
          @click="$emit('start-voting')"
          :disabled="isVoteOpen"
          class="btn btn-start"
          v-if="isCommitteeHead && !meetingData.isVoteStarted"
        >
          <span class="btn-icon"
            ><svg
              width="12"
              height="11"
              viewBox="0 0 12 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 10.5C8.76142 10.5 11 8.26142 11 5.5C11 2.73858 8.76142 0.5 6 0.5C3.23858 0.5 1 2.73858 1 5.5C1 8.26142 3.23858 10.5 6 10.5Z"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M5 3.5L8 5.5L5 7.5V3.5Z"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          {{ $t('vote.start') }}
        </button>
        <button
          @click="$emit('end-voting')"
          class="btn btn-end"
          v-if="isCommitteeHead && !meetingData.isVoteEnded"
        >
          <span class="btn-icon"
            ><svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 7V4M6.5 7V4M10.5 5.5C10.5 8.26142 8.26142 10.5 5.5 10.5C2.73858 10.5 0.5 8.26142 0.5 5.5C0.5 2.73858 2.73858 0.5 5.5 0.5C8.26142 0.5 10.5 2.73858 10.5 5.5Z"
                stroke="white"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          {{ $t('vote.end') }}
        </button>
      </div>

      <!-- Vote Status Badge on the right -->
      <span style="color:#8C8C8C;">
        {{ $t('vote.status') }} :
        <div
          class="status-badge"
          :class="isVoteOpen ? 'status-open' : 'status-closed'"
        >
          <span class="status-text">{{ isVoteOpen ? $t('vote.open') : $t('vote.closed') }}</span>
        </div>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "VotingHeader",
  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
    isVoteOpen: {
      type: Boolean,
      required: true,
    },
    topicsCount: {
      type: Number,
      required: true,
    },
    membersCount: {
      type: Number,
      required: true,
    },
    isCommitteeHead: {
      type: Boolean,
      required: true,
    },
    meetingData: {
      type: Object,
      required: true,
    },
  },
  emits: ["refresh", "start-voting", "end-voting"],
};
</script>

<style scoped>
.voting-header {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* First Row: Stats */
.stats-row {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.stat-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 24px;
  min-width: 50%;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #8C8C8C;
  font-weight: 400;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #6e3894;
  line-height: 1.3;
}

.stat-value-vote-members {
  font-size: 24px;
  font-weight: 700;
  color: #255F0B;
  line-height: 1.3;
}

/* Second Row: Actions */
.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-icon {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.btn-restart {
  background: #c4951b;
  color: #ffffff;
}

.btn-restart:hover:not(:disabled) {
  background: #d97706;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.3);
}

.btn-restart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start {
  background: #255f0b;
  color: #ffffff;
}

.btn-start:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-end {
  background: #a92525;
  color: #ffffff;
}

.btn-end:hover {
  background: #dc2626;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

/* Status Badge - on the right */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  margin-left: auto;
}

.status-open {
  background: #B6CAAE;
  color: #255F0B;
}

.status-closed {
  background: #E2B6B6;
  color: #A92525;
}

.status-text {
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .actions-row {
    flex-wrap: wrap;
  }

  .status-badge {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .voting-header {
    padding: 12px 16px;
  }

  .stats-row {
    flex-direction: row;
    width: 100%;
  }

  .stat-box {
    min-width: auto;
    width: 100%;
  }

  .actions-row {
    flex-direction: column;
    gap: 12px;
  }

  .button-group {
    width: 100%;
    justify-content: center;
  }

  .btn {
    flex: 1;
  }

  .status-badge {
    width: 100%;
    justify-content: center;
    margin-left: 0;
  }
}
</style>
