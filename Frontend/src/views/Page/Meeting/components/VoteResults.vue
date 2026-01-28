<template>
  <div class="vote-results-wrapper">
    <!-- Header with Title and Badge -->
    <div class="vote-header">
      <h3 class="vote-title">{{ $t("vote.vote_results") }}</h3>
      <span 
        class="vote-badge"
        :class="{
          'badge-approved': topic.vote_result === 'ApprovedByMajority' || topic.vote_result === 'ApprovedUnanimously',
          'badge-rejected': topic.vote_result === 'RejectedByMajority' || topic.vote_result === 'RejectedUnanimously',
        }"
      >
        {{
          topic.isOpenToVote == "false" || topic.isOpenToVote == false
            ?$t(`vote.${getVoteResultStatus(topic.vote_result)}`)
            : "End the vote to see results"
        }}
      </span>
    </div>

    <!-- Vote Counts -->
    <div class="vote-counts-list">
      <div class="count-item">
        <span class="count-label">{{ $t("vote.agree") }} :</span>
        <span class="count-number agree-number">{{ agreeCount }}</span>
      </div>
      
      <div class="count-item">
        <span class="count-label">{{ $t("vote.disagree") }} :</span>
        <span class="count-number disagree-number">{{ disagreeCount }}</span>
      </div>
      
      <div class="count-item">
        <span class="count-label">{{ $t("vote.total") }} :</span>
        <span class="count-number total-number">{{ totalVotes }}</span>
      </div>
    </div>

    <!-- Progress Bar with Labels -->
    <div class="progress-container">
      <!-- Show message when no votes -->
      <div v-if="totalVotes === 0" class="no-votes-message">
        {{ $t("vote.no_votes_yet") || "No votes yet" }}
      </div>
      
      <!-- Show progress bar when there are votes -->
      <template v-else>
        <div class="progress-bar-outer">
          <div
            class="progress-bar-inner"
            :style="{ width: safeAgreementPercentage + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          <span class="text-agree">{{ Math.round(safeAgreementPercentage) }}% {{ $t("vote.agree") }}</span>
          <span class="text-disagree">{{ Math.round(100 - safeAgreementPercentage) }}% {{ $t("vote.disagree") }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "VoteResults",
  props: {
    topic: {
      type: Object,
      required: true,
    },
    agreeCount: {
      type: Number,
      required: true,
    },
    disagreeCount: {
      type: Number,
      required: true,
    },
    agreementPercentage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    totalVotes() {
      return this.agreeCount + this.disagreeCount;
    },
    safeAgreementPercentage() {
      // If there are no votes, return 0 to prevent NaN or incorrect display
      if (this.totalVotes === 0) {
        return 0;
      }
      // If agreementPercentage is NaN or invalid, calculate it
      if (isNaN(this.agreementPercentage) || this.agreementPercentage === null) {
        return (this.agreeCount / this.totalVotes) * 100;
      }
      return this.agreementPercentage;
    },
  },
  methods: {
    getVoteResultStatus(voteResult) {
      switch (voteResult) {
        case "ApprovedByMajority":
          return "Approved By Majority";
        case "ApprovedUnanimously":
          return "Approved Unanimously";
        case "RejectedUnanimously":
          return "Rejected Unanimously";
        case "RejectedByMajority":
          return "Rejected By Majority";
        default:
          return "";
      }
    },
  },
};
</script>

<style scoped>
.vote-results-wrapper {
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 12px;
}

/* Header Section */
.vote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.vote-title {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #8C8C8C;
}

.vote-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge-approved {
  background: #86efac;
  color: #166534;
}

.badge-rejected {
  background: #EED3D3;
  color: #A92525;
}

/* Vote Counts Section */
.vote-counts-list {
  background: #FFFFFF;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.count-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-radius: 10px;
  background: #F5F5F5;
  margin-bottom: 4px;
}

.count-item:not(:last-child) {
  margin-bottom: 8px;
}

.count-label {
  font-size: 12px;
  color: #8C8C8C;
  font-weight: 500;
}

.count-number {
  font-size: 20px;
  font-weight: 700;
}

.agree-number {
  color: #255F0B;
}

.disagree-number {
  color: #A92525;
}

.total-number {
  color: #6E3894;
}

/* Progress Bar Section */
.progress-container {
  margin-top: 16px;
}

.no-votes-message {
  text-align: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  color: #8C8C8C;
  font-size: 13px;
  font-weight: 500;
}

.progress-bar-outer {
  width: 100%;
  height: 14px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar-inner {
  height: 100%;
  background: #255F0B;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 500;
}

.text-agree {
  color: #8C8C8C;
}

.text-disagree {
  color: #8C8C8C;
}

@media (max-width: 768px) {
  .vote-results-wrapper {
    padding: 14px 16px;
  }

  .vote-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .count-number {
    font-size: 18px;
  }
}
</style>