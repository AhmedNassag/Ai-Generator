<!-- TopicCard.vue -->
<template>
  <div class="topic-card">
    <!-- Header: Title, Status Badge, and Vote Buttons -->
    <div class="card-header">
      <div class="title-wrapper">
        <h2 class="topic-title">{{ topic.title }}</h2>
        <span class="category-badge">{{ topic?.mainTopic }}</span>
      </div>
      <div class="header-actions">

        <!-- Vote Buttons in Header -->
        <div class="header-vote-buttons">
          <button
            @click="$emit('cast-vote', topic.id, currentMemberId, 'agree')"
            :disabled="!isVoteOpen"
            :class="{
              active: getVote(topic.id, currentMemberId) === 'agree',
              'btn-vote': true,
              'btn-agree': true,
            }"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.0625 0.900391C5.31924 0.900391 5.53319 0.927554 5.78418 1.05371L5.89453 1.11426L5.90234 1.11816H5.90137C5.95754 1.15811 5.99899 1.20094 6.03027 1.25098C6.04551 1.27536 6.05784 1.3006 6.06836 1.32617L6.0957 1.40332L6.09961 1.41602H6.09863L6.40918 3.20703C6.69256 3.96925 7.32359 4.6677 7.92383 5.20605C8.05546 5.02209 8.26229 4.90039 8.5 4.90039H10.375C10.78 4.90039 11.0996 5.25127 11.0996 5.66699V10.333C11.0996 10.7487 10.78 11.0996 10.375 11.0996H8.5C8.16166 11.0996 7.88539 10.8543 7.80273 10.5312C7.68956 10.5805 7.56485 10.6454 7.42188 10.7217L7.41895 10.7236C7.25182 10.8047 7.07258 10.8991 6.89258 10.9717C6.71061 11.045 6.51769 11.0996 6.3125 11.0996H3.34375C3.00198 11.0996 2.70388 10.9538 2.49219 10.7461C2.28191 10.5396 2.15039 10.2652 2.15039 10C2.15039 9.93728 2.14938 9.87654 2.16113 9.81641C1.79882 9.62672 1.52539 9.28223 1.52539 8.83301C1.52542 8.64992 1.55054 8.49173 1.60059 8.33691C1.3579 8.1508 1.15039 7.84645 1.15039 7.5C1.15039 7.30271 1.22986 7.11191 1.3125 6.95508C1.07477 6.73596 0.900391 6.40506 0.900391 6.06641C0.900457 5.68868 1.04505 5.3929 1.29297 5.19336C1.53823 4.99601 1.87491 4.90039 2.25 4.90039H4.2168C4.08117 4.33797 4.02539 3.80642 4.02539 3.33301C4.02542 2.36172 4.14989 1.75885 4.34082 1.39551C4.4372 1.21225 4.55245 1.08668 4.67871 1.00781C4.80523 0.928848 4.93736 0.900391 5.0625 0.900391ZM5.07422 1.79785C5.04725 1.84579 5.01319 1.9271 4.97949 2.05078C4.91218 2.2981 4.84963 2.70582 4.84961 3.33301C4.84961 3.80162 4.93464 4.30386 5.0791 4.90137C5.19082 4.90519 5.29037 4.94671 5.3623 5.02344C5.43703 5.10328 5.47454 5.21239 5.47461 5.33301C5.47461 5.45384 5.43721 5.56362 5.3623 5.64355C5.28682 5.72407 5.18099 5.7666 5.0625 5.7666H2.25C2.11027 5.7666 1.98156 5.80444 1.89062 5.86328C1.79963 5.92221 1.75596 5.99431 1.75586 6.06641C1.75586 6.158 1.77788 6.22424 1.80762 6.27539C1.83797 6.32749 1.88002 6.36943 1.92969 6.40918C1.95475 6.42923 1.98069 6.44824 2.00781 6.46777C2.03408 6.48669 2.06284 6.50721 2.08887 6.52832C2.12699 6.55928 2.16776 6.59803 2.19629 6.64844L2.2207 6.70312L2.22168 6.70703C2.26755 6.87828 2.16682 6.99516 2.10449 7.08008C2.03849 7.17004 1.97461 7.26555 1.97461 7.43359C1.97466 7.51173 1.99734 7.56579 2.0293 7.6084C2.06314 7.65346 2.11154 7.68994 2.1709 7.72754C2.2237 7.76098 2.30049 7.80331 2.35645 7.84473C2.40154 7.87813 2.448 7.92108 2.47852 7.97852L2.50293 8.04102L2.50391 8.04395C2.54352 8.21318 2.48987 8.32448 2.44238 8.42578C2.39737 8.5218 2.34964 8.62225 2.34961 8.7998V8.85059C2.37231 8.96564 2.46365 9.03764 2.59473 9.10156C2.6267 9.11716 2.65942 9.13126 2.69238 9.14551C2.72461 9.15944 2.75836 9.17416 2.78906 9.18848C2.83094 9.208 2.88111 9.23369 2.9209 9.26953L2.95703 9.30957L2.96289 9.31738H2.96191C2.99062 9.36842 3.00742 9.41646 3.01367 9.4668C3.01972 9.51556 3.01497 9.56149 3.00879 9.60547C2.99643 9.69335 2.97461 9.79244 2.97461 9.9668C2.97465 10.0259 3.00673 10.0815 3.07227 10.126C3.1389 10.171 3.23549 10.2002 3.34375 10.2002H6.3125C6.53215 10.2002 6.75801 10.0828 7.07812 9.91211C7.30231 9.79255 7.53757 9.66855 7.77539 9.59375V6.21289C6.99835 5.57903 6.00269 4.64186 5.62402 3.46387L5.61914 3.44922V3.37793L5.34961 1.78223C5.27383 1.76808 5.20276 1.76675 5.09473 1.7666C5.08945 1.77378 5.08216 1.78373 5.07422 1.79785ZM8.59961 10.2334H10.2754V5.7666H8.59961V10.2334Z"
                fill="#255F0B"
                stroke="#255F0B"
                stroke-width="0.2"
              />
            </svg>
            {{ $t("vote.agree") }}
          </button>

          <button
            @click="$emit('cast-vote', topic.id, currentMemberId, 'disagree')"
            :disabled=" !isVoteOpen"
            :class="{
              active: getVote(topic.id, currentMemberId) === 'disagree',
              'btn-vote': true,
              'btn-disagree': true,
            }"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.0625 11.0996C5.31924 11.0996 5.53319 11.0724 5.78418 10.9463L5.89453 10.8857L5.90234 10.8818H5.90137C5.95754 10.8419 5.99899 10.7991 6.03027 10.749C6.04551 10.7246 6.05784 10.6994 6.06836 10.6738L6.0957 10.5967L6.09961 10.584H6.09863L6.40918 8.79297C6.69256 8.03075 7.32359 7.3323 7.92383 6.79395C8.05546 6.97791 8.26229 7.09961 8.5 7.09961H10.375C10.78 7.09961 11.0996 6.74873 11.0996 6.33301V1.66699C11.0996 1.25127 10.78 0.900391 10.375 0.900391H8.5C8.16166 0.900391 7.88539 1.1457 7.80273 1.46875C7.68956 1.41946 7.56485 1.35458 7.42188 1.27832L7.41895 1.27637C7.25182 1.19534 7.07258 1.10085 6.89258 1.02832C6.71061 0.955006 6.51769 0.900391 6.3125 0.900391H3.34375C3.00198 0.900391 2.70388 1.04617 2.49219 1.25391C2.28191 1.46038 2.15039 1.73476 2.15039 2C2.15039 2.06272 2.14938 2.12346 2.16113 2.18359C1.79882 2.37328 1.52539 2.71777 1.52539 3.16699C1.52542 3.35008 1.55054 3.50827 1.60059 3.66309C1.3579 3.8492 1.15039 4.15355 1.15039 4.5C1.15039 4.69729 1.22986 4.88809 1.3125 5.04492C1.07477 5.26404 0.900391 5.59494 0.900391 5.93359C0.900457 6.31132 1.04505 6.6071 1.29297 6.80664C1.53823 7.00399 1.87491 7.09961 2.25 7.09961H4.2168C4.08117 7.66203 4.02539 8.19358 4.02539 8.66699C4.02542 9.63828 4.14989 10.2412 4.34082 10.6045C4.4372 10.7878 4.55245 10.9133 4.67871 10.9922C4.80523 11.0712 4.93736 11.0996 5.0625 11.0996ZM5.07422 10.2021C5.04725 10.1542 5.01319 10.0729 4.97949 9.94922C4.91218 9.7019 4.84963 9.29418 4.84961 8.66699C4.84961 8.19838 4.93464 7.69614 5.0791 7.09863C5.19082 7.09481 5.29037 7.05329 5.3623 6.97656C5.43703 6.89672 5.47454 6.78761 5.47461 6.66699C5.47461 6.54616 5.43721 6.43638 5.3623 6.35645C5.28682 6.27593 5.18099 6.2334 5.0625 6.2334H2.25C2.11027 6.2334 1.98156 6.19556 1.89062 6.13672C1.79963 6.07779 1.75596 6.00569 1.75586 5.93359C1.75586 5.842 1.77788 5.77576 1.80762 5.72461C1.83797 5.67251 1.88002 5.63057 1.92969 5.59082C1.95475 5.57077 1.98069 5.55176 2.00781 5.53223C2.03408 5.51331 2.06284 5.49279 2.08887 5.47168C2.12699 5.44072 2.16776 5.40197 2.19629 5.35156L2.2207 5.29688L2.22168 5.29297C2.26755 5.12172 2.16682 5.00484 2.10449 4.91992C2.03849 4.82996 1.97461 4.73445 1.97461 4.56641C1.97466 4.48827 1.99734 4.43421 2.0293 4.3916C2.06314 4.34654 2.11154 4.31006 2.1709 4.27246C2.2237 4.23902 2.30049 4.19669 2.35645 4.15527C2.40154 4.12187 2.448 4.07892 2.47852 4.02148L2.50293 3.95898L2.50391 3.95605C2.54352 3.78682 2.48987 3.67552 2.44238 3.57422C2.39737 3.4782 2.34964 3.37775 2.34961 3.2002V3.14941C2.37231 3.03436 2.46365 2.96236 2.59473 2.89844C2.6267 2.88284 2.65942 2.86874 2.69238 2.85449C2.72461 2.84056 2.75836 2.82584 2.78906 2.81152C2.83094 2.792 2.88111 2.76631 2.9209 2.73047L2.95703 2.69043L2.96289 2.68262H2.96191C2.99062 2.63158 3.00742 2.58354 3.01367 2.5332C3.01972 2.48444 3.01497 2.43851 3.00879 2.39453C2.99643 2.30665 2.97461 2.20756 2.97461 2.0332C2.97465 1.97411 3.00673 1.91851 3.07227 1.87402C3.1389 1.82898 3.23549 1.7998 3.34375 1.7998H6.3125C6.53215 1.7998 6.75801 1.91716 7.07812 2.08789C7.30231 2.20745 7.53757 2.33145 7.77539 2.40625V5.78711C6.99835 6.42097 6.00269 7.35814 5.62402 8.53613L5.61914 8.55078V8.62207L5.34961 10.2178C5.27383 10.2319 5.20276 10.2332 5.09473 10.2334C5.08945 10.2262 5.08216 10.2163 5.07422 10.2021ZM8.59961 1.7666H10.2754V6.2334H8.59961V1.7666Z"
                fill="#A92525"
                stroke="#A92525"
                stroke-width="0.2"
              />
            </svg>
            {{ $t("vote.disagree") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="card-content">
      <div class="card-body">
        <!-- Left Side: Decision and Note -->
        <div class="content-left">
          <div class="info-block">
            <div class="info-label">{{ $t("vote.decision") }} :</div>
            <div class="info-value" v-html="topic.decision"></div>
          </div>

          <div class="info-block" v-if="topic.meeting_note">
            <div class="info-label">{{ $t("vote.note") }} :</div>
            <div class="info-value">{{ topic?.meeting_note || "" }}</div>
          </div>
        </div>

        <!-- Right Side: Vote Results -->
        <div class="content-right" v-if="isChairOrViceOrSecretary">
          <VoteResults
            :topic="topic"
            :agreeCount="getAgreeCount(topic.id)"
            :disagreeCount="getDisagreeCount(topic.id)"
            :agreementPercentage="getAgreementPercentage(topic.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VoteResults from "./VoteResults.vue";

export default {
  name: "TopicCard",
  components: {
    VoteResults,
  },
  props: {
    topic: {
      type: Object,
      required: true,
    },
    currentMemberId: {
      type: [String, Number],
      required: true,
    },
    isChairOrViceOrSecretary: {
      type: Boolean,
      required: true,
    },
    meetingData: {
      type: Object,
      required: true,
    },
    isVoteOpen: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["cast-vote"],
  mounted() {
    console.log("meeting data mounted:",this.meetingData);
  },
  methods: {
    getVote(topicId, memberId) {
      const topic = this.topic;
      if (!topic || !topic.votes) return null;

      const vote = topic.votes.find(
        (vote) =>
          vote.id === memberId ||
          vote.participant_id === memberId ||
          vote.user_id === memberId
      );

      return vote?.vote || null;
    },

    getAgreeCount(topicId) {
      const topic = this.topic;
      if (!topic || !Array.isArray(topic.votes)) return 0;
      return topic.votes.filter((vote) => vote.vote === "agree").length;
    },

    getDisagreeCount(topicId) {
      const topic = this.topic;
      if (!Array.isArray(topic.votes)) return 0;
      return topic.votes.filter((vote) => vote.vote === "disagree").length;
    },

    getAgreementPercentage(topicId) {
      const totalVotes =
        this.getAgreeCount(topicId) + this.getDisagreeCount(topicId);
      if (totalVotes === 0) return 0;
      return (this.getAgreeCount(topicId) / totalVotes) * 100;
    },
  },
};
</script>

<style scoped>
.topic-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 0;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Header Section */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  gap: 20px;
  background-color: #f5f5f5;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.topic-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #404040;
}

.category-badge {
  background: #f5f5f5;
  color: #000000;
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-rejected {
  background: #f8d7da;
  color: #c53030;
}

.badge-approved {
  background: #d4edda;
  color: #2d5016;
}

.badge-deferred {
  background: #fff3cd;
  color: #856404;
}

.header-vote-buttons {
  display: flex;
  gap: 10px;
}

/* Body Section - Two Column Layout */
.card-body {
  display: flex;
  justify-content: space-between;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 0;
  background-color: #ffffff;
  padding: 26px;
  border-radius: 12px;
}

/* Left Column - Decision & Note */
.content-left {
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  width: 75%;
}
.content-right {
  width: 23%;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
}
.info-block {
  margin-bottom: 20px;
  text-align: left;
}

.info-block:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 13px;
  color: #666666;
  font-weight: 400;
  margin-bottom: 8px;
}

.info-value {
  font-size: 14px;
  color: #404040;
  line-height: 1.5;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 10px;
}

/* Vote Buttons */
.btn-vote {
  padding: 8px 16px;
  border: 2px solid #255F0B;
  border-radius: 10px ;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background: #F5F5F5;
  transition: all 0.2s ease;
}

.btn-agree {
  border-color: #255F0B;
  color: #255F0B;
}

.btn-agree:hover {
  background: #f0fff4;
}

.btn-agree.active {
  background: #B6CAAE;
  color: 255F0B;
}

.btn-disagree {
  border-color: #A92525;
  color: #A92525;
}

.btn-disagree:hover {
  background: #fff5f5;
}

.btn-disagree.active {
  background: #E2B6B6;
  color: #A92525;
}

@media (max-width: 900px) {
  .card-body {
    grid-template-columns: 1fr;
  }

  /* .content-left {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  } */
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-vote-buttons {
    width: 100%;
  }

  .btn-vote {
    flex: 1;
  }
}

.card-content {
  background: #f5f5f5 !important;
  padding: 25px;
}
</style>
