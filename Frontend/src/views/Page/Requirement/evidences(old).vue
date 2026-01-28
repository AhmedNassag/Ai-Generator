<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('evidence.regulator')"
    :mainSubPage="this.$t('evidence.requirements')"
    :subPage="this.$t('evidence.evidences')"
    :titlePage="this.$t('evidence.related_evidences')"
    v-permission:show
  >
    <div v-permission:update v-permission:delete></div>
    <template #datatable>
      <i
        class="fa-solid fa-arrow-left mr-2"
        style="cursor: pointer"
        @click="$router.go(-1)"
      ></i>
      <span class="badge badge-primary mb-5"> {{ this.requirementname }}</span>
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editItem"
        :openForm="openForm"
      >
        <template #name="{ item }">
          <a
            style="color: #00308f"
            href="javascript:void(0)"
            @click="openDetailsModal(item)"
            title="View Evidence"
            class="dropdown-item"
          >
            {{ item.name }}
          </a>
        </template>
        <template #edit="{ item }">
          <a
            v-if="
              item.control_approvals?.[0]?.status != 'rejected' &&
              item.control_approvals?.[0]?.status != 'approved'
            "
            href="javascript:void(0)"
            @click="editEvidence(item)"
            class="dropdown-item"
          >
            <i class="icofont icofont-fountain-pen"></i>
            {{ $t("evidence.edit") }}
          </a>
        </template>

        <template #delete="{ item }">
          <a
            v-if="
              item.control_approvals?.[0]?.status != 'rejected' &&
              item.control_approvals?.[0]?.status != 'approved'
            "
            href="javascript:void(0)"
            class="dropdown-item"
            @click="removeEvidence(item.id)"
            title="Remove Evidence"
            ><i class="icofont icofont-trash text-danger"></i>
            {{ $t("evidence.delete") }}</a
          >
        </template>
        <template #created_at="{ item }">
          <span class="badge badge-success">
            {{ formatCreatedDate(item.created_at) }}
          </span>
        </template>
        <template #Active="{ item }">
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="item.active === true || item.active === 'true'"
              @change="toggleActive(item)"
              style="width: 40px; height: 22px; cursor: pointer"
              id="switch-active-{{item.id}}"
            />
            <!-- <label class="form-check-label" :for="'switch-active-' + item.id" style="margin-left: 8px;">
              <span v-if="item.active === true || item.active === 'true'" class="text-success">Active</span>
              <span v-else class="text-danger">Inactive</span>
            </label> -->
          </div>
        </template>
        <template #expired_day="{ item }">
          {{ calculateDueDate(item.created_at) }}
          <i
            v-if="isOverdue(item.created_at)"
            style="color: red"
            class="fa-solid fa-circle-exclamation"
          ></i>
        </template>
        <template #provider="{ item }">
          <a
            style="color: #00308f"
            href="javascript:void(0)"
            @click="openProviderDetailsModal(item.submitted_by)"
            title="View User Details"
            class="dropdown-item"
          >
            {{ getUserName(item.submitted_by) }}
          </a>
        </template>

        <template #rejected_controls="{ item }">
          <div class="d-flex flex-column gap-1 align-items-center">
            <span
              v-for="(name, index) in getRejectedControls(item)"
              :key="index"
              class="badge text-bg-danger"
            >
              {{ name }}
            </span>
            <span v-if="!getRejectedControls(item).length">{{
              $t("evidence.nocontrols")
            }}</span>
          </div>
        </template>

        <template #action_by="{ item }">
          <span
            v-if="
              item.statuses?.[0]?.decidedBy
              // && loggedInUser.id != item.statuses?.[0]?.decidedBy
            "
          >
            <a
              style="color: #00308f"
              href="javascript:void(0)"
              @click="openProviderDetailsModal(item.statuses[0].decidedBy)"
              title="View Details"
              class="dropdown-item"
            >
              {{ getApproverName(item.statuses[0].decidedBy) }}
            </a>
          </span>
          <span v-else> - </span>
        </template>

        <template #status="{ item }">
          <span
            :class="getStatusBadgeClass(item.control_approvals?.[0]?.status)"
          >
            {{
              item.control_approvals?.[0]?.status
                ? item.control_approvals[0].status.charAt(0).toUpperCase() +
                  item.control_approvals[0].status.slice(1)
                : "Pending"
            }}
          </span>
        </template>
      </DataTable>
    </template>

    <template #form>
      <Form
        :schema="fromFields"
        :newItem="newItem"
        :api="api"
        :closeForm="closeForm"
        :formData="true"
      >
        <template #file="{ item }">
          <div class="form-group">
            <label style="margin-bottom: -5px" for="file">
              {{ $t("evidence.attachsupportingdocument") }}
              <span style="color: red">*</span>
            </label>

            <!-- File input -->
            <input
              type="file"
              class="form-control mb-2"
              @change="onFileChange"
              :required="!newItem.file"
              ref="fileInput"
            />
            <!-- Display current file information -->
            <div v-if="newItem.existingFile" class="mb-2">
              <span
                >{{ $t("evidence.currentdocument") }} : {{ newItem.file }}</span
              >
            </div>
          </div>
        </template>

        <!-- Custom slot for control_ids field -->
        <template #control_ids="{ item }">
          <div class="form-group mb-3">
            <label for="control_ids">
              {{ $t("evidence.controls") }} <span style="color: red">*</span>
            </label>
            <div class="d-flex align-items-center gap-3">
              <vue-select
                multiple
                class="form-select flex-grow-1"
                id="control_ids"
                v-model="newItem.control_ids"
                :options="controlList"
                label="short_name"
                :reduce="(item) => item.id"
                :placeholder="this.$t('evidence.select_controls')"
                :selectable="
                  (option) => isOptionSelectable(option, 'control_ids')
                "
              ></vue-select>
              <button
                style="color: white"
                type="button"
                class="btn btn-sm btn-primary"
                @click="selectAllControls"
              >
                {{ $t("evidence.all") }}
              </button>
            </div>
          </div>
        </template>
      </Form>
    </template>
  </main-page>

  <!-- Evidence Details Modal -->
  <div v-if="isDetailsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 1200px; max-height: 85vh">
      <div class="modal-header">
        <h5 class="modal-title text-truncate" style="max-width: 80%">
          {{ this.evidenceData.name }}
        </h5>
        <button
          @click="closeDetailsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" for="taskTitle" class="form-label"
              >{{ $t("evidence.description") }} :
            </label>
            <p>{{ stripHtmlTags(evidenceData?.description) }}</p>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" for="taskTitle" class="form-label">
              {{ $t("evidence.supportingfile") }} :
            </label>
            <div>
              <a
                style="color: #00308f; text-decoration: none"
                :href="evidenceData.fullFilePath"
                target="_blank"
                title="View Evidence"
              >
                {{ evidenceData.file }}
              </a>
              <i
                class="fa-solid fa-download mb-3"
                @click="downloadFile(evidenceData)"
                style="cursor: pointer; color: #00308f; margin-left: 15px"
                title="Download"
              ></i>
            </div>
          </div>
        </div>

        <!-- Controls Table -->
        <div class="row mb-3">
          <div class="col-12">
            <label style="font-weight: 900" class="form-label"
              >{{ $t("evidence.relatedcontrols") }} :</label
            >
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style="text-align: center">
                      {{ $t("evidence.longname") }}
                    </th>
                    <th style="text-align: center">
                      {{ $t("evidence.shortname") }}
                    </th>
                    <th style="text-align: center">
                      {{ $t("evidence.number") }}
                    </th>
                    <th style="text-align: center">
                      {{ $t("evidence.status") }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(control, index) in evidenceControls"
                    :key="control.id"
                  >
                    <td>{{ index + 1 }}</td>
                    <td style="text-align: center">{{ control.long_name }}</td>
                    <td style="text-align: center">{{ control.short_name }}</td>
                    <td style="text-align: center">
                      {{ control.control_number }}
                    </td>
                    <td style="text-align: center">
                      <span
                        :class="getStatusBadgeClass(control.status)"
                        :title="
                          control.status === 'Rejected'
                            ? 'Reason for Rejection :\n' +
                              stripHtmlTags(control.rejectionReason)
                            : ''
                        "
                      >
                        {{ control.status || "Pending" }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!evidenceControls.length" class="text-center">
                    <td colspan="5" class="text-center">
                      <i class="fa-solid fa-spinner fa-spin"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <hr
          style="
            width: 70%;
            margin: 0 auto;
            height: 3px;
            background-color: #ccc;
          "
          class="mb-3"
        />

        <!-- Comments Section -->
        <div class="row mb-3">
          <div class="col-12">
            <label style="font-weight: 900" class="form-label">
              <i class="fa-solid fa-comments"></i>
              {{ $t("evidence.comments") }} :
            </label>
            <!-- Comment Input Form -->
            <div class="mb-3">
              <form @submit.prevent="submitComment">
                <textarea
                  v-model="newComment"
                  class="form-control mb-2"
                  :placeholder="this.$t('evidence.add_a_comment')"
                  rows="3"
                  required
                  style="resize: none"
                ></textarea>
                <div class="d-flex justify-content-end mr-5 mb-5">
                  <button
                    type="submit"
                    class="btn btn-primary btn-sm"
                    style="color: aliceblue"
                  >
                    {{ $t("evidence.comment") }}
                  </button>
                </div>
              </form>
            </div>
            <!-- Comments List -->
            <div v-if="comments.length" class="comments-list">
              <div
                v-for="comment in paginatedComments"
                :key="comment.id"
                class="comment mb-3 p-3 rounded"
              >
                <!-- Comment Header -->
                <div
                  class="d-flex justify-content-between align-items-center mb-2"
                >
                  <div>
                    <strong style="font-style: normal; color: black">{{
                      comment.user.full_name
                    }}</strong>
                    <small style="font-size: 10px" class="text-muted ms-2">
                      {{ formatCommentDate(comment.created_at) }}
                    </small>
                  </div>
                  <div class="comment-actions">
                    <i
                      v-if="comment.user_id === loggedInUser.id"
                      class="fa-solid fa-pencil"
                      style="color: black; font-size: 12px; cursor: pointer"
                      @click="startEditing(comment)"
                      title="Edit Comment"
                    ></i>
                    <i
                      v-if="comment.user_id === loggedInUser.id"
                      class="fa-solid fa-trash"
                      style="color: red; font-size: 12px; cursor: pointer"
                      @click="deleteComment(comment.id)"
                      title="Delete Comment"
                    ></i>
                    <i
                      class="fas fa-reply"
                      style="font-size: 12px; cursor: pointer"
                      @click="toggleReplyForm(comment.id)"
                      title="Reply"
                    ></i>
                  </div>
                </div>

                <!-- Comment Content -->
                <div
                  style="font-style: normal; color: black; font-size: 14px"
                  v-if="editingCommentId !== comment.id"
                  class="comment-content mb-2"
                >
                  {{ comment.content }}
                </div>

                <!-- Comment Edit Form -->
                <div v-else>
                  <textarea
                    v-model="editingCommentContent"
                    class="form-control mb-2"
                    rows="3"
                  ></textarea>
                  <div class="d-flex justify-content-end gap-2">
                    <button
                      style="font-style: normal; font-size: xx-small"
                      class="btn btn-sm btn-primary"
                      @click="updateComment(comment.id)"
                    >
                      {{ $t("evidence.save") }}
                    </button>
                    <button
                      style="font-style: normal; font-size: xx-small"
                      class="btn btn-sm btn-primary"
                      @click="cancelEditing"
                    >
                      {{ $t("evidence.cancel") }}
                    </button>
                  </div>
                </div>

                <!-- Reply Form -->
                <div
                  v-if="replyingTo === comment.id"
                  class="reply-form mt-3 ms-3"
                >
                  <textarea
                    v-model="newReply"
                    class="form-control mb-2"
                    :placeholder="this.$t('evidence.write_your_reply')"
                    rows="2"
                  ></textarea>
                  <div class="d-flex justify-content-end gap-2">
                    <button
                      style="font-style: normal; font-size: xx-small"
                      class="btn btn-sm btn-primary"
                      @click="submitReply(comment.id)"
                    >
                      {{ $t("evidence.reply") }}
                    </button>
                    <button
                      style="font-style: normal; font-size: xx-small"
                      class="btn btn-sm btn-primary"
                      @click="toggleReplyForm(null)"
                    >
                      {{ $t("evidence.cancel") }}
                    </button>
                  </div>
                </div>

                <!-- Replies List -->
                <div v-if="comment.replies.length" class="replies mt-3 ms-4">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="reply mb-2 p-2 bg-light rounded"
                  >
                    <!-- Reply Header -->
                    <div
                      class="d-flex justify-content-between align-items-center mb-1"
                    >
                      <div>
                        <strong
                          style="
                            font-size: 12px;
                            color: black;
                            font-style: normal;
                          "
                          >{{ reply.user.full_name }}</strong
                        >
                        <small style="font-size: 10px" class="text-muted ms-2">
                          {{ formatCommentDate(reply.created_at) }}
                        </small>
                      </div>
                      <div class="reply-actions">
                        <i
                          v-if="reply.user_id === loggedInUser.id"
                          class="fa-solid fa-pencil"
                          style="color: black; font-size: 10px"
                          @click="startEditing(reply)"
                          title="Edit"
                        ></i>
                        <i
                          v-if="reply.user_id === loggedInUser.id"
                          class="fa-solid fa-trash"
                          style="color: red; font-size: 10px"
                          @click="deleteComment(reply.id)"
                          title="Delete"
                        ></i>
                      </div>
                    </div>

                    <!-- Reply Content -->
                    <div
                      style="color: #9f9ba5"
                      v-if="editingCommentId !== reply.id"
                    >
                      {{ reply.content }}
                    </div>

                    <!-- Reply Edit Form -->
                    <div v-else>
                      <textarea
                        v-model="editingCommentContent"
                        class="form-control mb-2"
                        rows="2"
                      ></textarea>
                      <div class="d-flex justify-content-end gap-2">
                        <button
                          style="font-style: normal; font-size: xx-small"
                          class="btn btn-sm btn-primary"
                          @click="updateComment(reply.id)"
                        >
                          {{ $t("evidence.save") }}
                        </button>
                        <button
                          style="font-style: normal; font-size: xx-small"
                          class="btn btn-sm btn-secondary"
                          @click="cancelEditing"
                        >
                          {{ $t("evidence.cancel") }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="d-flex justify-content-center mt-3">
                <nav aria-label="Comments pagination">
                  <ul class="pagination">
                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === 1 }"
                    >
                      <button
                        title="Previous comments"
                        style="color: black; background: white; border: none"
                        class="page-link"
                        @click="currentPage--"
                      >
                        <i class="fa-solid fa-arrow-left"></i>
                      </button>
                    </li>
                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <button
                        title="Next comments"
                        style="color: black; background: white; border: none"
                        class="page-link"
                        @click="currentPage++"
                      >
                        <i class="fa-solid fa-arrow-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            <small v-else class="text-muted" style="text-align: center">
              {{ $t("evidence.nocommentsyet") }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Provider Details Modal -->
  <div v-if="isProviderDetailsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 750px">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("evidence.provideroverview") }}</h5>
        <button
          @click="closeProviderDetailsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3" style="text-align: center">
          <div class="col-md-3">
            <label style="font-weight: 600" for="taskTitle" class="form-label">
              <i class="fa-solid fa-signature"></i> {{ $t("evidence.name") }}
            </label>
            <p>{{ providerDetails?.full_name }}</p>
          </div>
          <div class="col-md-3">
            <label style="font-weight: 600" for="taskTitle" class="form-label">
              <i class="fa-solid fa-square-envelope"></i>
              {{ $t("evidence.email") }}
            </label>
            <p>{{ providerDetails?.email }}</p>
          </div>

          <div class="col-md-3">
            <label style="font-weight: 600" for="taskTitle" class="form-label"
              ><i class="fa-solid fa-building"></i>
              {{ $t("evidence.department") }}
            </label>
            <p>{{ getDepartmentName(providerDetails?.department_id) }}</p>
          </div>
          <div class="col-md-3">
            <label style="font-weight: 600" for="taskTitle" class="form-label"
              ><i class="fa-solid fa-user-tie"></i> {{ $t("evidence.job") }}
            </label>
            <p>{{ getJobName(providerDetails?.job_id) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Reject Evidence Modal -->
  <div v-if="isRejectModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 750px">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("evidence.rejectevidence") }}</h5>
        <button
          @click="closeRejectModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3 justify-content-center">
          <div class="col-md-12">
            <!-- <label for="rejectionReason">
                Rejection Reason <span style="color: red">*</span>
              </label>
              <ckeditor
                :editor="editor"
                v-model="rejectionReason"
                :config="editorConfig"
              ></ckeditor>
              <small v-if="rejectionError" class="text-danger">
                Rejection reason is required
              </small>
            </div> -->
            <div class="col-md-12">
              <label for="rejectionComment">
                {{ $t("evidence.comment") }} <span style="color: red">*</span>
              </label>
              <textarea
                v-model="rejectionComment"
                class="form-control"
                :placeholder="this.$t('evidence.please_provide_a_comment_for_the_rejection')"
                rows="3"
                required
              ></textarea>
              <small v-if="commentError" class="text-danger">
                {{ $t("evidence.commentisrequired") }}
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button
              @click="confirmRejectEvidence"
              class="btn btn-secondary mr-5 mt-3"
              type="submit"
            >
              {{ $t("evidence.reject") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importing necessary components and API modules
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import Evidence from "@/API/Evidence/Evidence";
import Framework from "@/API/Frameworks/Frameworks";
import Comment from "@/API/comment/comment";
import Requirement from "@/API/Requirement/Requirement";
import control from "@/API/Control/Control";
import team from "@/API/Team/Team";
import user from "@/API/User/User";
import department from "@/API/Department/Department";
import job from "@/API/Job/Job";
import Form from "@/components/Form.vue";
import MainPage from "@/components/MainPage.vue";
import DataTable from "@/components/DataTable.vue";
import { notify } from "@kyvg/vue3-notification";
import VueSelect from "vue-select";
import Auth from "@/API/Auth";
import axios from "axios";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    "vue-select": VueSelect,
  },

  setup() {
    const api = new Evidence();
    const RequirementApi = new Requirement();
    const controlApi = new control();
    const frameworkApi = new Framework();
    const commentApi = new Comment();
    const userApi = new user();
    const teamApi = new team();
    const departmentApi = new department();
    const jobApi = new job();
    const requirement_id = useRouter().currentRoute.value.params.id;
    const apiParams = {
      filter: "requirement_id|" + requirement_id + "|=",
      // with: ["submitter:id,full_name"],
    };
    const tableColumns = [];
    const fromFields = [];
    const evidencesList = new Evidence();

    return {
      api,
      apiParams,
      tableColumns,
      fromFields,
      evidencesList,
      requirement_id,
      RequirementApi,
      controlApi,
      userApi,
      departmentApi,
      jobApi,
      frameworkApi,
      teamApi,
      commentApi,
    };
  },

  data() {
    return {
      approverOrRejecter: null,
      requirementname: "", // Initialize as empty string
      loggedInUser: false,
      isFlipped: false,
      rejectionReason: null, // Holds textarea input for rejection reason
      rejectionComment: "", // Holds comment input for rejection
      isRejectModalOpen: false, // For reject evidence modal
      isDetailsModalOpen: false,
      isProviderDetailsModalOpen: false,
      evidenceData: [],
      evidenceControls: [],
      controlList: [],
      userList: [],
      departmentList: [],
      jobList: [],
      expireDays: null,
      providerDetails: null,
      newItem: {
        control_ids: [], // Initialize control_ids as an empty array
        existingFile: null, // Add this to track existing file
      },
      selectedFile: null,
      // CKEditor setup
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      icon_path: null,
      translateFields: [],
      fields: [],
      comments: [], // Store comments for the evidence
      newComment: "", // Store the new comment input
      editingCommentId: null, // Track comment/reply being edited
      editingCommentContent: "", // Store edited content
      currentPage: 1,
      perPage: 10,
      replyingTo: null, // Track which comment is being replied to
      newReply: "", // Store reply content
      rejectionError: false, // Track rejection reason error
      commentError: false, // Track comment error
    };
  },

  computed: {
    paginatedComments() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.comments.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.comments.length / this.perPage) || 1;
    },
  },

  watch: {
    "$route.params.id": {
      handler(newId) {
        // this.fetchSurveyStatus();
      },
      immediate: true,
    },
  },

  async mounted() {
    this.userList = await this.userApi.getAll({ select: "id|full_name" });
    await this.fetchControls();
    await this.fetchDepartments();
    await this.fetchJobs();
    await this.requirementName();
  },

  created() {
    this.requirementId = this.$route.params.id;

    this.tableColumns = [
      {
        id: "name",
        title: this.$t("evidence.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("evidence.created_at"),
        data: "created_at",
        defaultContent: "N/A",
      },
      {
        id: "expired_day",
        title: this.$t("evidence.expired_day"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "provider",
        title: this.$t("evidence.provider"),
        data: "submitted_by",
        defaultContent: "N/A",
      },
      {
        id: "rejected_controls",
        title: this.$t("evidence.rejected_controls"),
        data: "rejected_controls",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("evidence.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "action_by",
        title: this.$t("evidence.action_by"),
        data: "",
        defaultContent: "N/A",
      },
      { title: this.$t("Active"), data: "active", defaultContent: "N/A" },
    ];

    this.fromFields = [
      {
        name: "name",
        label: this.$t("evidence.name"),
        type: "text",
        rules: "required",
        description: this.$t("evidence.please_enter_the_evidence_name"),
        col: 12,
      },
      {
        type: "options",
        name: "control_ids",
        label: this.$t("evidence.controls"),
        options: [],
        multiple: true,
        optionLabel: "short_name",
        col: 12,
        rules: "required",
        description: this.$t("evidence.choose_controls"),
      },
      {
        name: "description",
        label: this.$t("evidence.description"),
        type: "textarea",
        rules: "required",
        description: this.$t("evidence.provide_a_description"),
        col: 12,
      },
      {
        name: "file",
        label: this.$t("evidence.file"),
        type: "file",
        rules: "required",
        description: this.$t("evidence.provide_a_file"),
        col: 12,
      },
    ];
  },

  methods: {
    getUserName(userId) {
      // Find user by ID and return name, fallback to ID if not found
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : '';
    },
    getApproverName(userId) {
      if (!userId) return " - ";
      try {
        const user = this.userList.find((user) => user.id === userId);
        console.log("userrrr", user);
        return user.full_name || " - ";
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return "Error";
      }
    },
    async requirementName() {
      const response = await this.RequirementApi.show(this.requirementId); // or a default
      this.requirementname = response.name;
    },
    async fetchComments(evidenceId) {
      try {
        const response = await this.commentApi.fetchComments(
          evidenceId,
          "evidence"
        );

        // First, fetch all users to populate comment user info
        const userIds = [...new Set(response.map((c) => c.user_id))];
        const users = await Promise.all(
          userIds.map((id) => this.userApi.show(id))
        );
        const userMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});

        // Process comments and replies
        const comments = response
          .filter((comment) => !comment.parent_id) // Top-level comments
          .map((comment) => ({
            ...comment,
            user: userMap[comment.user_id] || { full_name: " - " },
            replies: response
              .filter((reply) => reply.parent_id === comment.id) // Find replies
              .map((reply) => ({
                ...reply,
                user: userMap[reply.user_id] || { full_name: " - " },
              })),
          }));

        this.comments = comments;
        this.currentPage = 1;
      } catch (error) {
        console.error("Error fetching comments:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch comments",
        });
      }
    },

    async submitComment() {
      if (!this.newComment.trim()) {
        notify({
          type: "warning",
          title: "Warning",
          text: "Comment cannot be empty",
        });
        return;
      }

      try {
        const commentData = {
          content: this.newComment,
          user_id: Auth.USER.id,
          commentable_type: "evidence",
          commentable_id: this.evidenceData.id,
          is_private: false,
          status: "active",
        };

        const response = await this.commentApi.publishComment(commentData);
        const newComment = {
          ...response,
          user: response.user || {
            id: Auth.USER.id,
            full_name: Auth.USER.full_name || "Current User",
          },
          created_at: response.created_at || new Date().toISOString(),
          replies: response.replies || [],
        };

        this.comments.unshift(newComment);
        this.currentPage = 1;
        this.newComment = "";
        this.fetchComments(this.evidenceData.id);
        // notify({
        //   type: "success",
        //   title: "Success",
        //   text: "Comment added successfully",
        // });
      } catch (error) {
        console.error("Error submitting comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to add comment",
        });
      }
    },

    toggleReplyForm(commentId) {
      this.replyingTo = this.replyingTo === commentId ? null : commentId;
      this.newReply = "";
      this.editingCommentId = null; // Close edit form if replying
    },

    async submitReply(parentId) {
      if (!this.newReply.trim()) {
        notify({
          type: "warning",
          title: "Warning",
          text: "Reply cannot be empty",
        });
        return;
      }

      try {
        const replyData = {
          content: this.newReply,
          user_id: Auth.USER.id,
          commentable_type: "evidence",
          commentable_id: this.evidenceData.id,
          parent_id: parentId,
          is_private: false,
          status: "active",
        };

        const response = await this.commentApi.publishComment(replyData);
        const newReply = {
          id: response.id,
          content: response.content,
          user: response.user || {
            id: Auth.USER.id,
            full_name: Auth.USER.full_name || "Current User",
          },
          created_at: response.created_at || new Date().toISOString(),
          user_id: Auth.USER.id,
        };

        // Add reply to parent comment
        this.comments = this.comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        });

        this.toggleReplyForm(null);
        this.fetchComments(this.evidenceData.id);
        // notify({
        //   type: "success",
        //   title: "Success",
        //   text: "Reply added successfully",
        // });
      } catch (error) {
        console.error("Error submitting reply:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to add reply",
        });
      }
    },

    startEditing(comment) {
      this.editingCommentId = comment.id;
      this.editingCommentContent = comment.content;
      this.replyingTo = null; // Close reply form if editing
    },

    cancelEditing() {
      this.editingCommentId = null;
      this.editingCommentContent = "";
    },
    async updateComment(commentId) {
      if (!this.editingCommentContent.trim()) {
        notify({
          type: "warning",
          title: "Warning",
          text: "Comment cannot be empty",
        });
        return;
      }

      try {
        const updatedData = {
          id: commentId,
          content: this.editingCommentContent,
        };

        // Call the API to update the comment
        const response = await this.commentApi.from(updatedData);

        // Update the comments array
        this.comments = this.comments.map((comment) => {
          if (comment.id === commentId) {
            // Update top-level comment
            return {
              ...comment,
              content: this.editingCommentContent, // Use editingCommentContent directly
              // Optionally merge with response if it contains additional fields
              ...(response && {
                content: response.content || this.editingCommentContent,
                updated_at: response.updated_at || comment.updated_at,
              }),
            };
          }
          // Update replies if the commentId matches a reply
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    content: this.editingCommentContent, // Use editingCommentContent directly
                    ...(response && {
                      content: response.content || this.editingCommentContent,
                      updated_at: response.updated_at || reply.updated_at,
                    }),
                  }
                : reply
            ),
          };
        });

        // Reset editing state
        this.cancelEditing();

        // notify({
        //   type: "success",
        //   title: "Success",
        //   text: "Comment updated successfully",
        // });
      } catch (error) {
        console.error("Error updating comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to update comment",
        });
      }
    },

    async deleteComment(commentId) {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This comment will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      try {
        await this.commentApi.delete(commentId);
        this.comments = this.comments.filter(
          (comment) => comment.id !== commentId
        );
        this.comments = this.comments.map((comment) => ({
          ...comment,
          replies: comment.replies.filter((reply) => reply.id !== commentId),
        }));
        if (this.paginatedComments.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }
        // notify({
        //   type: "success",
        //   title: "Success",
        //   text: "Comment deleted successfully",
        // });
      } catch (error) {
        console.error("Error deleting comment:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to delete comment",
        });
      }
    },

    formatCommentDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },
    getRejectedControls(item) {
      // If no control_approvals, return empty array
      if (!item.control_approvals || !item.control_approvals.length) {
        return [];
      }

      // Filter rejected controls and map to their names
      return item.control_approvals
        .filter((approval) => approval.status.toLowerCase() === "rejected")
        .map((approval) => {
          const control = this.controlList.find(
            (c) => c.id === approval.controlId
          );
          return control ? control.short_name : " - ";
        });
    },

    async acceptEvidence() {
      try {
        // Fetch the latest evidence data
        const currentEvidence = await this.api.show(this.evidenceData.id);

        // Fetch frameworks owned by the logged-in user
        let ownedFrameworkIds = [];
        try {
          const ownedFrameworks = await this.frameworkApi.getAll({
            filter: `owner|${Auth.USER.id}|=`,
            select: "id",
          });
          ownedFrameworkIds = ownedFrameworks.map((framework) => framework.id);
        } catch (error) {
          console.error("Error fetching owned frameworks:", error);
          notify({
            type: "error",
            title: "Error",
            text: "Failed to fetch framework information",
          });
          return;
        }

        // Get owned controls
        const ownedControls = this.evidenceData.control_ids
          .map((controlId) => this.controlList.find((c) => c.id === controlId))
          .filter(
            (control) =>
              control && ownedFrameworkIds.includes(control.framework_id)
          );

        if (!ownedControls.length) {
          notify({
            type: "warning",
            title: "No Action",
            text: "No controls owned by you to approve",
          });
          return;
        }

        // Update or add to control_approvals for owned controls
        let updatedApprovals = [...(currentEvidence.control_approvals || [])];
        ownedControls.forEach((control) => {
          const approvalIndex = updatedApprovals.findIndex(
            (approval) => approval.controlId === control.id
          );
          const newApproval = {
            controlId: control.id,
            status: "approved",
            decidedBy: Auth.USER.id,
            decidedAt: new Date().toISOString(),
            rejectionReason: null,
          };
          if (approvalIndex >= 0) {
            updatedApprovals[approvalIndex] = newApproval;
          } else {
            updatedApprovals.push(newApproval);
          }
        });

        // Append new entries to evidence_approvals for owned frameworks
        let updatedStatus = [...(currentEvidence.statuses || [])];
        const uniqueFrameworkIds = [
          ...new Set(ownedControls.map((c) => c.framework_id)),
        ];
        uniqueFrameworkIds.forEach((frameworkId) => {
          const frameworkControlIds = ownedControls
            .filter((control) => control.framework_id === frameworkId)
            .map((control) => control.id);
          updatedStatus.push({
            frameworkId,
            controlsIds: frameworkControlIds,
            status: "approved",
            decidedBy: Auth.USER.id,
            decidedAt: new Date().toISOString(),
            rejectionReason: null,
          });
        });

        // Update the evidence with modified approvals
        const updatedEvidence = {
          ...currentEvidence,
          control_approvals: updatedApprovals,
          statuses: updatedStatus,
        };

        // Send the update to the server
        await this.api.from(updatedEvidence);

        // Update UI
        this.evidenceControls = this.evidenceControls.map((control) => ({
          ...control,
          status: "Approved",
          rejectionReason: null,
        }));

        this.$refs.table.refreshTable();
        notify({
          type: "success",
          title: "Success",
          text: "Evidence approved successfully for owned controls",
        });

        // Close the modal
        this.isDetailsModalOpen = false;
      } catch (error) {
        console.error("Error approving evidence:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to approve evidence",
        });
      }
    },
    async rejectEvidence() {
      // Open the reject modal to collect rejection reason and comment
      this.isRejectModalOpen = true;
      this.rejectionReason = "";
      this.rejectionComment = "";
      this.rejectionError = false;
      this.commentError = false;
    },

    async confirmRejectEvidence() {
      // Validate rejection reason and comment
      let hasError = false;
      // if (!this.rejectionReason || this.rejectionReason.trim() === "") {
      //   this.rejectionError = true;
      //   hasError = true;
      // } else {
      //   this.rejectionError = false;
      // }

      if (!this.rejectionComment.trim()) {
        this.commentError = true;
        hasError = true;
      } else {
        this.commentError = false;
      }

      if (hasError) {
        notify({
          type: "error",
          title: "Error",
          text: "Please provide a comment",
        });
        return;
      }

      try {
        // Fetch the latest evidence data
        const currentEvidence = await this.api.show(this.evidenceData.id);

        // Fetch frameworks owned by the logged-in user
        let ownedFrameworkIds = [];
        try {
          const ownedFrameworks = await this.frameworkApi.getAll({
            filter: `owner|${Auth.USER.id}|=`,
            select: "id",
          });
          ownedFrameworkIds = ownedFrameworks.map((framework) => framework.id);
        } catch (error) {
          console.error("Error fetching owned frameworks:", error);
          notify({
            type: "error",
            title: "Error",
            text: "Failed to fetch framework information",
          });
          return;
        }

        // Get owned controls
        const ownedControls = this.evidenceData.control_ids
          .map((controlId) => this.controlList.find((c) => c.id === controlId))
          .filter(
            (control) =>
              control && ownedFrameworkIds.includes(control.framework_id)
          );

        if (!ownedControls.length) {
          notify({
            type: "warning",
            title: "No Action",
            text: "No controls owned by you to reject",
          });
          return;
        }

        // Update or add to control_approvals for owned controls
        let updatedApprovals = [...(currentEvidence.control_approvals || [])];
        ownedControls.forEach((control) => {
          const approvalIndex = updatedApprovals.findIndex(
            (approval) => approval.controlId === control.id
          );
          const newApproval = {
            controlId: control.id,
            status: "rejected",
            decidedBy: Auth.USER.id,
            decidedAt: new Date().toISOString(),
            rejectionReason: this.rejectionReason,
          };
          if (approvalIndex >= 0) {
            updatedApprovals[approvalIndex] = newApproval;
          } else {
            updatedApprovals.push(newApproval);
          }
        });

        // Append new entries to evidence_approvals for owned frameworks
        let updatedStatus = [...(currentEvidence.statuses || [])];
        const uniqueFrameworkIds = [
          ...new Set(ownedControls.map((c) => c.framework_id)),
        ];
        uniqueFrameworkIds.forEach((frameworkId) => {
          const frameworkControlIds = ownedControls
            .filter((control) => control.framework_id === frameworkId)
            .map((control) => control.id);
          updatedStatus.push({
            frameworkId,
            controlsIds: frameworkControlIds,
            status: "rejected",
            decidedBy: Auth.USER.id,
            decidedAt: new Date().toISOString(),
            rejectionReason: this.rejectionReason,
          });
        });

        // Update the evidence with modified approvals
        const updatedEvidence = {
          ...currentEvidence,
          control_approvals: updatedApprovals,
          statuses: updatedStatus,
        };

        // Send the update to the server
        await this.api.from(updatedEvidence);

        // Submit the rejection comment
        const commentData = {
          content: this.rejectionComment,
          user_id: Auth.USER.id,
          commentable_type: "evidence",
          commentable_id: this.evidenceData.id,
          is_private: false,
          status: "active",
        };

        const commentResponse = await this.commentApi.publishComment(
          commentData
        );
        const newComment = {
          ...commentResponse,
          user: commentResponse.user || {
            id: Auth.USER.id,
            full_name: Auth.USER.full_name || "Current User",
          },
          created_at: commentResponse.created_at || new Date().toISOString(),
          replies: commentResponse.replies || [],
        };

        // Update UI
        this.evidenceControls = this.evidenceControls.map((control) => ({
          ...control,
          status: "Rejected",
          rejectionReason: this.rejectionReason,
        }));

        this.comments.unshift(newComment);
        this.currentPage = 1;

        this.$refs.table.refreshTable();
        notify({
          type: "success",
          title: "Success",
          text: "Evidence rejected successfully for owned controls",
        });

        // Close modals
        this.isRejectModalOpen = false;
        this.isDetailsModalOpen = false;
      } catch (error) {
        console.error("Error rejecting evidence:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to reject evidence",
        });
      }
    },

    closeRejectModal() {
      this.isRejectModalOpen = false;
      this.rejectionReason = "";
      this.rejectionComment = "";
      this.rejectionError = false;
      this.commentError = false;
    },

    isOptionSelectable(option, fieldName) {
      // Get the current value for this field
      const currentValue = this.newItem[fieldName];

      // For multiple select fields
      if (Array.isArray(currentValue)) {
        // Don't allow selecting an option that's already selected in this field
        if (currentValue.includes(option.id)) {
          return false;
        }
      }

      // Check if this option is selected in any other fields
      for (const key in this.newItem) {
        // Skip the current field
        if (key === fieldName) continue;

        const value = this.newItem[key];

        // If the value is an array (multiple select)
        if (Array.isArray(value) && value.includes(option.id)) {
          return false;
        }
      }

      // If we get here, the option is selectable
      return true;
    },
    formatDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    formatCreatedDate(dateString) {
      if (!dateString) return ""; // Handle empty or null dates
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    onFileChange(event) {
      const files = event.target.files;
      if (files && files.length > 0) {
        this.selectedFile = files[0];
        this.newItem.file = this.selectedFile;
      } else {
        this.selectedFile = null;
      }
    },

    async downloadFile(item) {
      try {
        axios.defaults.baseURL = "http://82.29.175.67:3030/api/";
        const response = await axios.get(`evidence/${item.id}/download`, {
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", item.file);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Download failed:", error);
      }
    },

    async fetchDepartments() {
      const response = await this.departmentApi.getAll({ select: "id|name" });
      this.departmentList = response;
    },

    getDepartmentName(departmentId) {
      const department = this.departmentList.find(
        (department) => department.id === departmentId
      );
      return department ? department.name : " ";
    },

    async fetchJobs() {
      const response = await this.jobApi.getAll({ select: "id|name" });
      this.jobList = response;
    },

    getJobName(jobId) {
      const job = this.jobList.find((job) => job.id === jobId);
      return job ? job.name : " ";
    },

    calculateDueDate(createdAt) {
      if (!createdAt || !this.expireDays) return ""; // Handle missing data
      const createdDate = new Date(createdAt);
      const dueDate = new Date(createdDate);
      dueDate.setDate(createdDate.getDate() + this.expireDays); // Add expireDays
      return this.formatDate(dueDate); // Format the result
    },

    isOverdue(createdAt) {
      const today = new Date();
      const created = new Date(createdAt);
      const dueDate = new Date(created);
      dueDate.setDate(created.getDate() + this.expireDays);
      console.log("today", today > dueDate);
      return today > dueDate;
    },

    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    async fetchControls() {
      this.loggedInUser = Auth.USER;
      // console.log(this.loggedInUser);
      // return;
      try {
        const requirement_id = this.$route.params.id;

        const requirement = await this.RequirementApi.show(requirement_id);
        const requiredControlIds = requirement.control_id || [];
        this.expireDays = requirement.expire_days;

        const allControls = await this.controlApi.getAll({
          select: "id|short_name|framework_id|long_name|control_number",
        });

        const filteredControls = allControls.filter((control) =>
          requiredControlIds.includes(control.id)
        );

        this.controlList = filteredControls;

        // Update the form field options
        this.fromFields.find((field) => field.name === "control_ids").options =
          filteredControls;
      } catch (error) {
        console.error("Error fetching controls:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch controls",
        });
      }
    },

    getStatusBadgeClass(status) {
      // Normalize status: capitalize first letter or default to "Pending"
      const normalizedStatus = status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : "Pending";

      const statusMap = {
        Approved: "badge bg-success",
        Rejected: "badge text-bg-danger",
        Pending: "badge text-bg-warning",
      };

      return statusMap[normalizedStatus] || "badge text-bg-warning"; // Default to warning for unknown statuses
    },

    selectAllControls() {
      this.newItem.control_ids = this.controlList.map((control) => control.id);
    },
    async toggleActive(item) {
      // Build formData from the item, including toggled active value
      const formData = {
        ...item,
        active: !(item.active === true || item.active === "true"),
      };
      console.log("Toggling active status for item:", formData);
      try {
        await this.api.from(formData);
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Failed to update active status:", error);
      }
    },
    async openDetailsModal(selectedRow) {
      this.isDetailsModalOpen = true;
      this.evidenceData = selectedRow;
      await Promise.all([
        this.fetchEvidenceControls(selectedRow.id),
        this.fetchComments(selectedRow.id),
      ]);
    },

    async openProviderDetailsModal(userId) {
      try {
        this.isProviderDetailsModalOpen = true;

        // Fetch user details
        const response = await this.userApi.show(userId);
        this.providerDetails = response;
      } catch (error) {
        console.error("Error fetching user details:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch user details",
        });
      }
    },

    async fetchEvidenceControls(evidenceId) {
      try {
        this.evidenceControls = [];

        if (
          !this.evidenceData.control_ids ||
          !this.evidenceData.control_ids.length
        ) {
          return;
        }

        if (!this.controlList || !Array.isArray(this.controlList)) {
          return;
        }

        // Map through all control_ids to build the evidenceControls array
        this.evidenceControls = await Promise.all(
          this.evidenceData.control_ids.map(async (controlId) => {
            if (!controlId) {
              console.warn("Invalid controlId:", controlId);
              return null;
            }

            const foundControl = this.controlList.find((c) => {
              if (!c || typeof c !== "object" || !c.id) {
                console.warn("Invalid control in controlList:", c);
                return false;
              }
              return c.id === controlId;
            });

            if (!foundControl) {
              console.warn("Control not found for ID:", controlId);
              return null;
            }

            // Find the control approval status and rejection reason
            const approval = this.evidenceData.control_approvals?.find(
              (approval) => approval.controlId === controlId
            );

            return {
              id: foundControl.id,
              short_name: foundControl.short_name,
              long_name: foundControl.long_name,
              control_number: foundControl.control_number,
              framework_id: foundControl.framework_id,
              status: approval
                ? approval.status.charAt(0).toUpperCase() +
                  approval.status.slice(1)
                : "Pending",
              rejectionReason:
                approval?.status === "rejected"
                  ? approval.rejectionReason || null
                  : null,
            };
          })
        ).then((controls) => controls.filter((control) => control !== null));
      } catch (error) {
        console.error("Error fetching evidence controls:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch control information",
        });
      }
    },

    async closeDetailsModal() {
      this.isDetailsModalOpen = false;
      this.newComment = "";
    },

    async closeProviderDetailsModal() {
      this.isProviderDetailsModalOpen = false;
    },

    async openForm() {
      const requirement_id = this.$route.params.id;
      const requirement = await this.RequirementApi.show(requirement_id);
      const requirementExpireDays = requirement.expire_days;

      let isResponsible = false;

      if (requirement.responsible_type === "team") {
        const team = await this.teamApi.show(requirement.responsible_id);
        const teamMembers = team.user_ids;
        if (teamMembers) {
          isResponsible = teamMembers.includes(Auth.USER.id);
        }
      } else {
        isResponsible = Auth.USER.id === requirement.responsible_id;
      }
      // if (requirement.active === "false") {
      //   notify({
      //     type: "error",
      //     text: "This requirement is inactive, you cannot add evidence.",
      //   });
      //   return;
      // }
      if (!isResponsible) {
        this.isFlipped = false;
        notify({
          type: "error",
          text: "Only the responsible person or team members can add more evidence",
        });
        return;
      } else {
        // Calculate expire_date
        const currentDate = new Date();
        const expireDate = new Date(currentDate);
        expireDate.setDate(currentDate.getDate() + requirementExpireDays);

        this.newItem = {
          submitted_by: Auth.USER.id,
          requirement_id: this.$route.params.id,
          control_ids: [], // Reset control_ids for new form
          expired_day: expireDate.toISOString(), // Save as ISO string or format as needed
        };
        this.isFlipped = true;
      }
    },
    closeForm() {
      this.isFlipped = false;
      this.$refs.table.refreshTable();
      this.newItem = { id: this.requirement_id };
    },

    editEvidence(selectedRow) {
      this.newItem = {
        ...selectedRow,
        existingFile: selectedRow.file, // Store the existing filename
      };
      this.isFlipped = true;
    },

    async removeEvidence(evidenceId) {
      const response = await this.api.delete(evidenceId);
      this.$refs.table.refreshTable();
      console.log("Evidence deleted successfully", response);
    },
  },
};
</script>
<style scoped>
@import "vue-select/dist/vue-select.css";
.comments-list {
  max-height: 450px;
  overflow-y: auto;
}

.comment {
  background-color: #f8f9fa;
  /* border: 1px solid #dee2e6; */
  position: relative;
}

.replies {
  border-left: 3px solid #28a745;
  padding-left: 15px;
  margin-left: 15px;
}

.reply {
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 5px;
}

.comment p,
.reply p {
  margin-bottom: 0;
  font-style: normal;
}

.comment-actions i,
.reply-actions i {
  transition: all 0.2s ease;
}

.comment-actions i:hover,
.reply-actions i:hover {
  transform: scale(1.1);
}

/* Make sure replies don't get too narrow */
.reply {
  min-width: 200px;
}

.comment-actions,
.reply-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group textarea,
textarea.form-control {
  resize: none;
}

.input-group textarea,
textarea.form-control {
  resize: none;
}

.table-responsive {
  max-height: 300px;
  overflow-y: auto;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.form-control {
  margin-top: 0.5rem;
}

.text-muted {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.btn-outline-primary {
  margin-top: 0.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  /* Bootstrap modal z-index */
}

.modal-content {
  background-color: white;
  border-radius: 0.375rem;
  /* Rounded corners */
  width: 90%;
  max-width: 1000px;
  /* Responsive max width */
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

small {
  font-size: 0.6rem;
  color: #6c757d;
  /* Muted gray for subtlety */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
  /* Larger header font */
}

.btn-close {
  font-size: 15px;
  border: none;
  color: #000;
}

.modal-body {
  padding: 20px 0;
  overflow-y: auto;
  /* Enable vertical scrolling if content overflows */
  overflow-x: hidden;
  /* Prevent horizontal scrolling */
  width: 100%;
  /* Ensure the modal body takes full width */
}

.modal-body p {
  white-space: normal;
  /* Ensure text wraps */
  word-wrap: break-word;
  /* Break long words if necessary */
  overflow-wrap: break-word;
  /* Modern alternative to word-wrap */
  max-width: 100%;
  /* Ensure the text doesn't overflow its container */
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}

@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>
<style>
.delete_button {
  display: none !important;
}

.edit_button {
  display: none !important;
}

.table-responsive th td {
  text-align: center;
}
</style>