<template>
  <div class="topic-tab-view">
    <LoadingSpinner v-if="isLoading" />

    <main-page
      v-else
      ref="page"
      :isFlipped="isFlipped"
      :mainPage="'agendadetails.agendadetails'"
      :subPage="'agendadetails.agendadetails'"
      :titlePage="'agendadetails.agendadetails'"
    >
      <template #datatable>
        <v-card flat>
          <CardHeader
            :agenda-details="newAgendaDetails"
            :agenda-status-options="filteredAgendaStatusOptions"
            :selected-subtopics-count="selectedSubtopicsCount"
            :display-actions="displayActions"
            :is-updating-agenda-status="isUpdatingAgendaStatus"
            :is-saving="isSaving"
            :isHead="isHead()"
            @update-agenda-status="updateAgendaStatus"
            @save-topics="saveTopicsToAgenda"
          />

          <v-card-text>
            <TopicAccordion
              v-for="topic in filteredTopicsList"
              :key="`topic-${topic.id}`"
              :topic="topic"
              :agenda-details="newAgendaDetails"
              :selected-subtopics="selectedSubtopics"
              :open-accordions="openAccordions"
              :display-actions="displayActions"
              :subtopic-status-data="subtopicStatusData"
              @toggle-accordion="toggleAccordion"
              @add-subtopic="addSubtopic"
              @update-selection="updateSelection"
              @update-subtopic-status="updateSubtopicStatus"
              @open-reject-dialog="openStatusDialog('reject', $event)"
            />
          </v-card-text>
        </v-card>
      </template>

      <template #form>
        <TopicForm
          :closeForm="closeForm"
          :editItem="editItem"
          :newItem="newItem"
          :mainTopics="topics"
          :committees="committees"
          :users="users"
        />
      </template>
    </main-page>

    <!-- Unified Status Dialog -->
    <StatusDialog
      v-model="statusDialog.show"
      :type="statusDialog.type"
      :subtopic="statusDialog.subtopic"
      :comment="statusDialog.comment"
      :is-loading="loadingStates.statusUpdating"
      @update:comment="statusDialog.comment = $event"
      @confirm="handleStatusConfirm"
      @close="closeStatusDialog"
    />
  </div>
</template>

<script>
import Agenda from "@/API/Agenda/Agenda";
import Topic from "@/API/Topic/Topic";
import MainPage from "@/components/MainPage.vue";
import TopicForm from "@/views/Page/Topic/TopicForm.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import CardHeader from "./CardHeader.vue";
import TopicAccordion from "./TopicAccordion.vue";
import StatusDialog from "./StatusCommentDialog.vue";
import Auth from "@/API/Auth";

export default {
  name: "TopicTabView",
  components: {
    MainPage,
    TopicForm,
    LoadingSpinner,
    CardHeader,
    TopicAccordion,
    StatusDialog,
  },
  props: {
    agendaDetails: { type: Object, default: () => ({}), required: true },
    topics: { type: Array, default: () => [] },
    agendaTopics: { type: Array, default: () => [] },
    users: { type: Array, default: () => [] },
    committees: { type: Array, default: () => [] },
  },

  setup() {
    const api = new Agenda();
    const topicApi = new Topic();
    return { api, topicApi };
  },

  data() {
    return {
      openAccordions: [],
      selectedSubtopics: [],
      selectedAgendaTopics: [],
      newItem: {},
      isFlipped: false,
      isLoading: false,
      topicsList: [],
      newAgendaTopics: [],
      newAgendaDetails: {},
      forceRender: 0,
      isSaving: false,
      subtopicStatusData: {},

      statusDialog: {
        show: false,
        type: "approve",
        subtopic: null,
        comment: "",
      },

      loadingStates: {
        initializing: false,
        saving: false,
        statusUpdating: false,
        fetchingTopics: false,
        deferringSubtopic: false,
      },

      isUpdatingAgendaStatus: false,
      agendaStatusOptions: [
        { value: "draft", label: this.$t("common.draft") },
        { value: "in_review", label: this.$t("common.in_review") },
        { value: "confirmed", label: this.$t("common.confirmed") },
        { value: "rejected", label: this.$t("common.rejected") },
        { value: "deferred", label: this.$t("common.deferred") },
      ],
      previousAgendaStatus: null,
    };
  },

  computed: {
    filteredTopicsList() {
      return this.topicsList.filter(
        (topic) => topic.committee_id === this.agendaDetails.committee_id,
      );
    },
    displayActions() {
      return (
        this.agendaDetails?.status !== "confirmed" &&
        this.agendaDetails?.status !== "rejected" &&
        this.newAgendaDetails?.status !== "confirmed" &&
        this.newAgendaDetails?.status !== "rejected"
      );
    },
    selectedSubtopicsCount() {
      return this.selectedSubtopics.length;
    },
    isAllTopicsNotPending() {
      const idsToCheck =
        this.selectedSubtopics && this.selectedSubtopics.length > 0
          ? this.selectedSubtopics
          : (this.newAgendaTopics || []).map((t) =>
              typeof t === "object" ? t.id : t,
            );

      if (!idsToCheck || idsToCheck.length === 0) return true;

      return !idsToCheck.some((subtopicId) => {
        const statusData = this.subtopicStatusData[subtopicId];
        if (
          statusData &&
          statusData.agenda_status !== undefined &&
          statusData.agenda_status !== null
        ) {
          return statusData.agenda_status === "pending";
        }
        const subtopic = this.findSubtopicById(subtopicId);
        return subtopic && subtopic.agenda_status === "pending";
      });
    },
    isAllSelectedTopicsHaveStatus() {
      const idsToCheck =
        this.selectedSubtopics && this.selectedSubtopics.length > 0
          ? this.selectedSubtopics
          : (this.newAgendaTopics || []).map((t) =>
              typeof t === "object" ? t.id : t,
            );

      if (!idsToCheck || idsToCheck.length === 0) return false;

      return idsToCheck.every((subtopicId) => {
        const statusData = this.subtopicStatusData[subtopicId];
        if (
          statusData &&
          statusData.agenda_status !== undefined &&
          statusData.agenda_status !== null
        ) {
          return true;
        }
        const subtopic = this.findSubtopicById(subtopicId);
        return !!(
          subtopic &&
          subtopic.agenda_status !== undefined &&
          subtopic.agenda_status !== null
        );
      });
    },
    filteredAgendaStatusOptions() {
      if (!this.isChairOrVice()) {
        const allowedStatuses = ["draft", "in_review"];
        return this.agendaStatusOptions.filter(
          (option) =>
            allowedStatuses.includes(option.value) ||
            option.value === this.newAgendaDetails.status,
        );
      }

      if (
        this.agendaDetails.status !== "draft" &&
        this.newAgendaDetails.status !== "draft"
      ) {
        return this.agendaStatusOptions.filter(
          (option) => option.value !== "draft",
        );
      }

      return this.agendaStatusOptions;
    },
  },

  watch: {
    "newAgendaDetails.status"(newStatus, oldStatus) {
      if (oldStatus == undefined) {
        this.previousAgendaStatus = newStatus;
      } else {
        this.previousAgendaStatus = oldStatus;
      }
    },
    agendaTopics: {
      handler(newAgendaTopics) {
        this.newAgendaTopics = [...newAgendaTopics];
        this.initializeSelectedTopics();
      },
      immediate: true,
      deep: true,
    },
    topicsList: {
      handler() {
        this.loadSubtopicStatuses();
      },
      deep: true,
    },
  },

  async mounted() {
    console.log("Mounted TopicTab.vue", this.agendaDetails);
    await this.initializeData();
  },

  methods: {
    isChairOrVice() {
      return (
        this.agendaDetails.committee?.chairperson_id === Auth.USER.id ||
        this.agendaDetails?.committee?.vice_chair_id === Auth.USER.id
      );
    },
    isHead() {
      return (
        this.agendaDetails.committee?.chairperson_id === Auth.USER.id ||
        this.agendaDetails?.committee?.vice_chair_id === Auth.USER.id ||
        this.agendaDetails?.committee?.secretary_id === Auth.USER.id
      );
    },
    async initializeData() {
      this.isLoading = true;
      try {
        this.newAgendaDetails = { ...this.agendaDetails };
        this.newAgendaTopics = [...this.agendaTopics];
        this.topicsList = [...this.topics];

        this.topicsList.forEach((topic) => {
          if (!topic.sub_topics) {
            topic.sub_topics = [];
          }
        });

        this.initializeSelectedTopics();
        await this.loadSubtopicStatuses();
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    initializeSelectedTopics() {
      const agendaTopicIds = this.newAgendaTopics
        .map((topic) => {
          if (typeof topic === "object" && topic.id) return topic.id;
          if (typeof topic === "number") return topic;
          return null;
        })
        .filter((id) => id !== null);

      this.selectedSubtopics = agendaTopicIds;
      this.updateSelection();
    },

    async loadSubtopicStatuses() {
      try {
        this.topicsList.forEach((topic) => {
          topic.sub_topics.forEach((subtopic) => {
            if (!this.subtopicStatusData[subtopic.id]) {
              const agendaTopic = this.newAgendaTopics.find(
                (t) => (typeof t === "object" ? t.id : t) === subtopic.id,
              );

              this.subtopicStatusData[subtopic.id] = {
                agenda_status: agendaTopic?.agenda_status || "pending",
                agenda_status_comment: agendaTopic?.agenda_status_comment || "",
                meeting_status: agendaTopic?.meeting_status || "pending",
                meeting_status_comment:
                  agendaTopic?.meeting_status_comment || "",
              };
            }
          });
        });
      } catch (error) {
        console.error("Failed to load subtopic statuses:", error);
      }
    },

    findSubtopicById(subtopicId) {
      for (const topic of this.topicsList) {
        if (topic.sub_topics) {
          const subtopic = topic.sub_topics.find(
            (sub) => sub.id === subtopicId,
          );
          if (subtopic) return subtopic;
        }
      }
      return null;
    },

    toggleAccordion(topicId) {
      const index = this.openAccordions.indexOf(topicId);
      if (index > -1) {
        this.openAccordions.splice(index, 1);
      } else {
        this.openAccordions.push(topicId);
      }
    },

    addSubtopic(topicId) {
      this.newItem = {
        topic_id: topicId,
        created_by: Auth.USER?.id,
        agenda_id: this.newAgendaDetails.id,
      };
      this.isFlipped = true;
    },

    editItem(data) {
      this.newItem = { ...data };
      delete this.newItem.created_by;
      this.isFlipped = true;
    },

    // updateSelection() {
    //   const selectedSubtopicObjects = this.topicsList.flatMap((topic) =>
    //     topic.sub_topics
    //       .filter((subtopic) => this.selectedSubtopics.includes(subtopic.id))
    //       .map((subtopic) => ({
    //         id: subtopic.id,
    //         name: subtopic.name,
    //       }))
    //   );

    //   this.selectedAgendaTopics = selectedSubtopicObjects;

    //   Object.keys(this.subtopicStatusData).forEach((subtopicId) => {
    //     if (!this.selectedSubtopics.includes(parseInt(subtopicId))) {
    //       this.subtopicStatusData[subtopicId] = {
    //         agenda_status: this.subtopicStatusData[subtopicId]?.agenda_status,
    //         agenda_status_comment:
    //           this.subtopicStatusData[subtopicId]?.agenda_status_comment,
    //       };
    //     }
    //   });
    // },

    updateSelection(subtopicId = null, isChecked = null) {
      console.log("🔍 TopicTab updateSelection:", {
        subtopicId,
        isChecked,
        current: this.selectedSubtopics,
      });

      // Handle checkbox toggle
      if (subtopicId !== null && isChecked !== null) {
        const index = this.selectedSubtopics.indexOf(subtopicId);

        if (isChecked) {
          if (index === -1) {
            this.selectedSubtopics.push(subtopicId);
            console.log("✅ Added:", subtopicId);
          }
        } else {
          if (index > -1) {
            this.selectedSubtopics.splice(index, 1);
            console.log("❌ Removed:", subtopicId);
          }
        }
      }

      // Update selectedAgendaTopics
      const selectedSubtopicObjects = this.topicsList.flatMap((topic) =>
        topic.sub_topics
          .filter((subtopic) => this.selectedSubtopics.includes(subtopic.id))
          .map((subtopic) => ({
            id: subtopic.id,
            name: subtopic.name,
          })),
      );

      this.selectedAgendaTopics = selectedSubtopicObjects;

      console.log("📊 Updated state:", {
        selectedSubtopics: this.selectedSubtopics,
        count: this.selectedSubtopics.length,
      });
    },
    async updateAgendaStatus(newStatus) {
      if (
        ["confirmed", "rejected", "deferred"].includes(newStatus) &&
        !this.isChairOrVice()
      ) {
        this.api.poup(
          {
            message:
              "Only the committee chair or vice-chair can confirm, reject, or defer the agenda.",
          },
          "Warning",
        );
        this.newAgendaDetails.status = this.previousAgendaStatus;
        this.$nextTick(() => {
          this.forceRender++;
        });
        return;
      }
      const currentSelectSubTopics = this.topicsList.flatMap((topic) =>
        topic.sub_topics
          .filter((subtopic) => this.selectedSubtopics.includes(subtopic.id))
          .map((subtopic) => subtopic),
      );
      console.log(
        "🔍 Current selected subtopics before status change:",
        currentSelectSubTopics,
      );
      if (!this.selectedSubtopics || this.selectedSubtopics.length === 0) {
        this.api.poup(
          {
            message:
              "Please select at least one subtopic before changing agenda status.",
          },
          "Warning",
        );
        this.newAgendaDetails.status = this.previousAgendaStatus;
        this.$nextTick(() => {
          this.forceRender++;
        });
        return;
      }

      if (!this.isAllSelectedTopicsHaveStatus) {
        this.api.poup(
          {
            message:
              "Cannot change agenda status until all selected topics have a defined status (agenda_status).",
          },
          "Warning",
        );
        this.newAgendaDetails.status = this.previousAgendaStatus;
        this.$nextTick(() => {
          this.forceRender++;
        });
        return;
      }

      if (!this.isAllTopicsNotPending && newStatus === "confirmed") {
        this.newAgendaDetails.status = this.previousAgendaStatus;
        this.api.poup(
          {
            message:
              "All subtopics must not be in 'Pending' status to confirm the agenda.",
          },
          "Error",
        );

        this.newAgendaDetails.status = this.previousAgendaStatus;
        return;
      }
      // if (
      //   !currentSelectSubTopics.some(
      //     (sub) => sub.agenda_status == "approved",
      //   ) &&
      //   newStatus === "confirmed"
      // ) {
      //   this.newAgendaDetails.status = this.previousAgendaStatus;
      //   this.api.poup(
      //     {
      //       message:
      //         "All subtopics must not be in 'Pending' status to confirm the agenda.",
      //     },
      //     "Error",
      //   );
      //   return;
      // }

      this.isUpdatingAgendaStatus = true;

      try {
        const response = await this.api.changeStatus(this.newAgendaDetails.id, {
          status: newStatus,
        });

        if (response?.data && response?.data?.status === "success") {
          this.api.poup(
            { status: "success" },
            `Agenda status updated to ${newStatus}`,
          );
          this.newAgendaDetails.status = newStatus;
        } else {
          this.newAgendaDetails.status = this.previousAgendaStatus;
        }
      } catch (error) {
        this.newAgendaDetails.status = this.previousAgendaStatus;
        console.error("Failed to update agenda status:", error);
        this.api.poup(
          { message: error.message || "Failed to update agenda status" },
          "Error",
        );
        this.$nextTick(() => {
          this.forceRender++;
        });
      } finally {
        this.isUpdatingAgendaStatus = false;
      }
    },

    // async saveTopicsToAgenda() {
    //   if (!this.selectedSubtopics.length) {
    //     this.api.poup(
    //       { message: "Please select at least one subtopic" },
    //       "Warning"
    //     );
    //     return;
    //   }

    //   this.isSaving = true;
    //   try {
    //     const response = await this.topicApi.updateManyTopics({
    //       topic_ids: this.selectedSubtopics,
    //       agenda_id: this.newAgendaDetails.id,
    //     });

    //     if (
    //       (response.data && response.data.status === "success") ||
    //       response.status === "success"
    //     ) {
    //       this.api.poup({ status: "success" }, "Topics saved successfully");

    //       this.isLoading = true;
    //       try {
    //         await this.storeSelectionState();
    //         await Promise.all([this.fetchTopics(), this.fetchAgendaTopics()]);
    //         await this.initializeSelectionsFromDatabase();
    //         await this.$nextTick();
    //       } catch (error) {
    //         console.error("Error refreshing data:", error);
    //       } finally {
    //         this.newItem = {};
    //         this.isLoading = false;
    //       }
    //     } else {
    //       throw new Error(response.message || "Failed to save topics");
    //     }
    //   } catch (error) {
    //     console.error("Failed to save topics to agenda:", error);
    //     this.api.poup(
    //       { message: error.message || "Failed to save topics" },
    //       "Error"
    //     );
    //   } finally {
    //     this.isSaving = false;
    //   }
    // },

    async saveTopicsToAgenda() {
      if (!this.selectedSubtopics.length) {
        this.api.poup(
          { message: "Please select at least one subtopic" },
          "Warning",
        );
        return;
      }

      this.isSaving = true;
      try {
        const response = await this.topicApi.updateManyTopics({
          topic_ids: this.selectedSubtopics,
          agenda_id: this.newAgendaDetails.id,
        });

        this.currentSavedSubtopics = response.data;
        console.log(
          "🔍 Topics saved to agenda response:",
          this.currentSavedSubtopics,
        );

        if (
          (response.data && response.data.status === "success") ||
          response.status === "success"
        ) {
          this.api.poup({ status: "success" }, "Topics saved successfully");

          // Full component refresh
          await this.refreshComponent();
        } else {
          throw new Error(response.message || "Failed to save topics");
        }
      } catch (error) {
        console.error("Failed to save topics to agenda:", error);
        this.api.poup(
          { message: error.message || "Failed to save topics" },
          "Error",
        );
      } finally {
        this.isSaving = false;
      }
    },

    // Add this new method to handle full component refresh
    async refreshComponent() {
      this.isLoading = true;

      try {
        // Clear current state
        this.selectedSubtopics = [];
        this.selectedAgendaTopics = [];
        this.subtopicStatusData = {};
        this.openAccordions = [];
        this.newItem = {};

        // Fetch fresh data from server
        await Promise.all([this.fetchTopics(), this.fetchAgendaTopics()]);

        // Re-initialize with fresh data
        await this.initializeSelectionsFromDatabase();

        // Force Vue to re-render
        await this.$nextTick();
        this.forceRender++;
      } catch (error) {
        console.error("Error refreshing component:", error);
        this.api.poup({ message: "Failed to refresh data" }, "Error");
      } finally {
        this.isLoading = false;
      }
    },
    async updateSubtopicStatus(subtopicId, status) {
      if (!this.selectedSubtopics.includes(subtopicId)) {
        console.warn("Cannot change status of unselected subtopic");
        return;
      }

      const subtopic = this.findSubtopicById(subtopicId);

      if (status === "rejected") {
        this.openStatusDialog("reject", subtopic);
        return;
      }

      if (status === "approved") {
        this.openStatusDialog("approve", subtopic);
        return;
      }

      if (status === "deferred") {
        this.openStatusDialog("defer", subtopic);
        return;
      }

      try {
        const response = await this.topicApi.changeStatus(subtopicId, {
          agenda_status: "pending",
          agenda_status_comment: "",
        });

        if (response.data.status === "success") {
          this.subtopicStatusData[subtopicId] = {
            agenda_status: "pending",
            agenda_status_comment: "",
          };
          this.topicApi.poup(response, "Status updated successfully");
        }
      } catch (error) {
        console.error("Failed to update subtopic status:", error);
      }
    },

    openStatusDialog(type, subtopic) {
      this.statusDialog = {
        show: true,
        type,
        subtopic,
        comment: "",
      };
    },

    closeStatusDialog() {
      this.statusDialog = {
        show: false,
        type: "approve",
        subtopic: null,
        comment: "",
      };
    },

    async handleStatusConfirm() {
      const { type, subtopic, comment } = this.statusDialog;
      const subtopicId = subtopic.id;

      const statusMap = {
        approve: "approved",
        reject: "rejected",
        defer: "deferred",
      };

      this.loadingStates.statusUpdating = true;

      try {
        const response = await this.topicApi.changeStatus(subtopicId, {
          agenda_status: statusMap[type],
          agenda_status_comment: comment || "",
        });

        if (response.data.status === "success") {
          if (type === "defer") {
            this.loadingStates.deferringSubtopic = true;
            const saveSuccess = await this.saveDeferredTopics(subtopicId);
            this.loadingStates.deferringSubtopic = false;

            if (!saveSuccess) {
              this.topicApi.poup(
                { message: "Failed to defer subtopic" },
                "Error",
              );
              this.closeStatusDialog();
              return;
            }
          }

          this.subtopicStatusData[subtopicId] = {
            agenda_status: statusMap[type],
            agenda_status_comment: comment || "",
          };

          this.topicApi.poup(response, "Status updated successfully");
        }
      } catch (error) {
        console.error(`Failed to ${type} subtopic:`, error);
        this.topicApi.poup(error, `Failed to ${type} subtopic`);
      } finally {
        this.loadingStates.statusUpdating = false;
      }

      this.closeStatusDialog();
    },

    async saveDeferredTopics(subtopicId) {
      try {
        const currentDeferredTopics = this.agendaDetails.deferred_topics || [];

        if (currentDeferredTopics.includes(subtopicId)) {
          return true;
        }

        const agendaData = {
          ...this.agendaDetails,
          deferred_topics: [...currentDeferredTopics, subtopicId],
        };

        const response = await this.api.update(agendaData);

        if (response?.status === "success") {
          Object.assign(this.agendaDetails, response.data);
          return true;
        }
        console.error("Failed to save deferred topic:", response);
        return false;
      } catch (error) {
        console.error("Failed to save deferred topic:", error);
        return false;
      }
    },

    async fetchTopics() {
      this.loadingStates.fetchingTopics = true;
      try {
        const response = await this.topicApi.getAll({
          select:
            "id|name|committee_id|topic_id|agenda_id|agenda_status|agenda_status_comment|meeting_status|meeting_status_comment",
          filter: `topic_id|null-null|=`,
          with: [
            "subTopics:id,name,topic_id,agenda_id,agenda_status,agenda_status_comment",
          ],
        });
        this.topicsList = response || [];
        this.forceRender++;
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        this.loadingStates.fetchingTopics = false;
      }
    },

    async fetchAgendaTopics() {
      try {
        const response = await this.api.show(this.newAgendaDetails.id, {
          with: [
            "topics:id,name,agenda_status,agenda_status_comment",
            "committee",
          ],
        });
        this.newAgendaTopics = response.topics || [];
      } catch (error) {
        console.error("Failed to fetch agenda topics:", error);
      }
    },

    async closeForm() {
      this.isFlipped = false;
      this.isLoading = true;
      try {
        await this.storeSelectionState();
        await Promise.all([this.fetchTopics(), this.fetchAgendaTopics()]);
        await this.initializeSelectionsFromDatabase();
        await this.$nextTick();
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        this.newItem = {};
        this.isLoading = false;
      }
    },

    async initializeSelectionsFromDatabase() {
      try {
        const agendaResponse = await this.api.show(this.newAgendaDetails.id, {
          with: [
            "topics:id,name,agenda_status,agenda_status_comment",
            "committee",
          ],
        });

        this.newAgendaDetails = agendaResponse;
        this.newAgendaTopics = agendaResponse.topics || [];

        const subtopicsInAgenda = [];
        if (agendaResponse.topics && agendaResponse.topics.length > 0) {
          subtopicsInAgenda.push(...agendaResponse.topics.map((t) => t.id));
        }

        this.topicsList.forEach((topic) => {
          if (topic.sub_topics) {
            topic.sub_topics.forEach((subtopic) => {
              if (subtopic.agenda_id === this.newAgendaDetails.id) {
                subtopicsInAgenda.push(subtopic.id);
              }
            });
          }
        });

        const uniqueSubtopicIds = [...new Set(subtopicsInAgenda)];
        this.selectedSubtopics = uniqueSubtopicIds;
        this.updateSelection();
        await this.loadSubtopicStatuses();
      } catch (error) {
        console.error("Error initializing selections from database:", error);
      }
    },

    async storeSelectionState() {
      try {
        const data = {
          ...this.newAgendaDetails,
          topics: this.selectedAgendaTopics,
        };
        await this.api.update(data);
      } catch (error) {
        console.error("Failed to save topics to agenda:", error);
      }
    },
  },

  beforeDestroy() {
    this.isLoading = false;
    this.isSaving = false;
    this.loadingStates.statusUpdating = false;
  },
};
</script>

<!-- <style scoped>
.topic-tab-view {
  min-height: 1000px !important;
  resize: vertical;
  overflow-y: auto;
  max-height: calc(100vh - 100px) !important;
  height: auto !important;
  direction: ltr;
  transform: scaleY(1);
}
</style> -->

<style scoped>
.header-actions-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.agenda-status-select {
  min-width: 180px;
  max-width: 200px;
}

.agenda-status-select .v-field {
  border-radius: 8px;
}

.status-chip {
  font-weight: 400;
  text-transform: capitalize;
}

.status-item {
  padding: 8px 16px;
}

.status-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.save-topics-btn {
  min-width: 180px;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  /* box-shadow: 0 2px 8px rgba(68, 34, 92, 0.2); */
}

.save-topics-btn:hover {
  /* box-shadow: 0 4px 12px rgba(68, 34, 92, 0.3); */
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header-actions-group {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .agenda-status-select {
    min-width: 100%;
  }

  .save-topics-btn {
    min-width: 100%;
  }
}

.dot-loader {
  gap: 0.75rem;
}

.dot-loader div {
  width: 10px;
  height: 10px;
  background-color: #44225c;
  border-radius: 50%;
  animation: bounce 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

@keyframes bounce {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(-15px);
  }
}

.accordion-item {
  border: 1px solid #e0e4e7;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  /* box-shadow: 0 4px 12px rgba(68, 34, 92, 0.08); */
  background: #ffffff;
  transition: all 0.3s ease;
}

/* .accordion-item:hover {
  box-shadow: 0 6px 20px rgba(68, 34, 92, 0.15);
} */

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: linear-gradient(135deg, #44225c 0%, #5a2d74 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
  font-size: 1.08rem;
  color: white;
}

.accordion-header:hover {
  background: linear-gradient(135deg, #3a1d4f 0%, #4d2563 100%);
  transform: translateY(-1px);
}

.accordion-header.active {
  background: linear-gradient(135deg, #2f1740 0%, #3f1f52 100%);
  border-bottom-color: #e0e4e7;
}

.topic-name {
  font-weight: 700;
  font-size: 1.15rem;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.add-btn {
  font-size: 0.875rem;
  padding: 6px 14px;
  min-width: auto;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); */
}

.accordion-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  color: white;
  font-weight: bold;
}

.accordion-content {
  padding: 24px 28px 16px 28px;
  background: linear-gradient(135deg, #faf8fc 0%, #f3f0f6 100%);
  border-top: 1px solid #e0e4e7;
  max-height: none;
  overflow: visible;
}

.subtopic-item {
  margin-bottom: 12px;
  border: 1px solid #e5daea;
  border-radius: 8px;
  background: white;
  padding: 16px;
}

.subtopic-item:last-child {
  margin-bottom: 12px;
}

.subtopic-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  flex: 1;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  accent-color: #44225c;
}

.assigned-indicator {
  font-size: 0.875rem;
  color: #6c757d;
  font-style: italic;
  margin-left: 8px;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 70px;
  text-align: center;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-approved {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-deferred {
  background: #e3f2fd;
  color: #0d47a1;
  border: 1px solid #bbdefb;
}

.status-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 8px 12px;
  width: 214px;
}

.action-btn {
  min-width: 32px !important;
  width: 32px;
  height: 32px;
  padding: 0;
}

.comments-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5daea;
}

.comment {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  line-height: 1.4;
}

.comment:last-child {
  margin-bottom: 0;
}

.rejection-comment {
  background: #fef2f2;
  color: #7f1d1d;
  border: 1px solid #fecaca;
}

.approval-comment {
  background: #f0fdf4;
  color: #14532d;
  border: 1px solid #bbf7d0;
}

.deferred-comment {
  background: #e8f4fd;
  color: #0d47a1;
  border: 1px solid #90caf9;
}

.comment span {
  flex: 1;
}

.selection-message {
  font-size: 0.875rem;
  color: #6c757d;
  font-style: italic;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.text-muted {
  color: #6c757d;
}
</style>

<style>
.topic-tab-view .page-title {
  display: none;
}

.topic-tab-view {
  min-height: 1000px !important;
  resize: vertical;
  overflow-y: auto;
  max-height: calc(100vh - 100px) !important;
  height: auto !important;
  direction: ltr;
  transform: scaleY(1);
}
</style>
