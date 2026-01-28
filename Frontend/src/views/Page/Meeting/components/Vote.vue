<template>
  <div class="voting-app">
    <VotingHeader
      v-if="!isLoading"
      :isLoading="isLoading"
      :isVoteOpen="isVoteOpen"
      :topicsCount="topics.length"
      :membersCount="members.length"
      :isCommitteeHead="committeeHeads && committeeHeads.includes(USER.id)"
      :meetingData="meetingData"
      @refresh="refreshData"
      @start-voting="startVoting"
      @end-voting="endVoting"
    />

    <LoadingSpinner v-if="isLoading" />

    <div v-else class="content">
      <div class="topics-container">
        <TopicCard
          v-for="topic in topics"
          :key="topic.id"
          :topic="topic"
          :meetingData="meetingData"
          :isVoteOpen="isVoteOpen"
          :currentMemberId="getCurrentMemberId()"
          :isChairOrViceOrSecretary="isChairOrViceOrSecretary"
          @cast-vote="castVote"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Meeting from "@/API/Meeting/Meeting";
import Topic from "@/API/Topic/Topic";
import Auth from "@/API/Auth";
import VotingHeader from "./VotingHeader.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import TopicCard from "./TopicCard.vue";

export default {
  name: "VotingComponent",
  components: {
    VotingHeader,
    LoadingSpinner,
    TopicCard,
  },
  props: {
    committeeHeads: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const meetingApi = new Meeting();
    const topicApi = new Topic();
    const USER = Auth.USER;
    return { meetingApi, topicApi, USER };
  },
  data() {
    return {
      isLoading: true,
      meetingData: null,
      topics: [],
    };
  },
  beforeMount() {
    this.loadData();
  },
  computed: {
    members() {
      const participants = this.meetingData?.participants || [];
      return participants.map((member) => ({
        id: member.id,
        name: member.full_name,
        email: member.email,
        type: member.type,
        avatar:
          member.fullImagePath ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            member.full_name
          )}&background=6366f1&color=fff`,
      }));
    },
    isChairOrViceOrSecretary() {
      const user = this.meetingData?.participants?.find(
        (participant) => participant.id === Auth?.USER?.id
      );

      if (!user) return false;

      return (
        user.type === "chairperson" ||
        user.type === "vice_chair" ||
        user.type === "secretary"
      );
    },
    isVoteOpen() {
      return this.topics.some(
        (topic) => topic.isOpenToVote == "true" || topic.isOpenToVote == true
      );
    },
  },
  methods: {
    async startVoting() {
      try {
        const response = await this.topicApi.startVoting(
          this.meetingData.agenda_id
        );
        await this.refreshData();
        this.topicApi.poup(response, "Vote started successfully");
      } catch (error) {
        this.topicApi.poup(response, this.$t("vote.startVoteFailed"));
        console.error(error);
      }
    },

    async endVoting() {
      await this.topicApi.endVoting(this.meetingData.agenda_id);
      await this.refreshData();
    },

    async loadData() {
      this.isLoading = true;
      try {
        this.meetingData = await this.meetingApi.show(this.$route.params.id, {
          with: ["agenda", "agenda.topics", "agenda.topics.mainTopic"],
        });
        this.topics = this.meetingData?.agenda?.topics?.filter(
          (topic) => topic.agenda_status == "approved"
        );
        this.topics = this.topics?.map((topic) => ({
          id: topic.id,
          title: `${topic.name}`,
          mainTopic: topic.main_topic.name,
          // decision: topic.meeting_status_comment
          //   ? topic.meeting_status_comment.replace(/<[^>]*>/g, "")
          //   : "No decision made yet",
          decision: topic.decision || "No decision made yet",
          meeting_note: topic.meeting_note,
          votes: topic.votes,
          vote_result: topic.vote_result,
          meeting_status: topic.meeting_status,
          status_comment: topic.final_status_comment,
          currentStatus: "",
          statusComment: topic.final_status_comment || "",
          isOpenToVote: topic.isOpenToVote,
        }));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async refreshData() {
      await this.loadData();
    },

    getCurrentMemberId() {
      return Auth.USER?.id;
    },

    async castVote(topicId, memberId, vote) {
      const data = {
        agenda_id: this.meetingData.agenda_id,
        participant_id: memberId,
        vote: vote,
      };

      try {
        const response = await this.topicApi.vote(topicId, data);
        if (response?.data.status == "success") {
          this.topicApi.poup(response, "Vote submitted");

          const updatedTopicData = response.data.data;

          const topicIndex = this.topics.findIndex((t) => t.id === topicId);
          if (topicIndex !== -1) {
            this.topics[topicIndex] = {
              ...this.topics[topicIndex],
              votes: updatedTopicData.votes || this.topics[topicIndex].votes,
              vote_result: updatedTopicData.vote_result,
              isOpenToVote: updatedTopicData.isOpenToVote,
            };
          }
        }
      } catch (error) {
        console.error("Error casting vote:", error);
      }
    },
  },
};
</script>

<style scoped>
.voting-app {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.topics-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

@media (max-width: 768px) {
  .voting-app {
    padding: 10px;
  }
}
</style>
