<template>
  <main-page
    ref="page"
    :isFlipped="isFlipped"
    :mainPage="this.$t('ViewEvidence.Regulator')"
    :mainSubPage="this.$t('ViewEvidence.Requirements')"
    :subPage="this.$t('ViewEvidence.View_Evidences')"
    :titlePage="this.$t('ViewEvidence.Related_Evidences')"
    >s="['accept_evidence']" p:show
    <div p:update p:destroy></div>
    <template #datatable>
      <span
        class="badge badge-primary mb-5"
        @click="goBack"
        style="
          cursor: pointer;
          padding: 10px;
          border-radius: 4px;
          background-color: #6e3894 !important;
        "
      >
        <i class="fa-solid fa-arrow-left"></i>
        {{ this.requirementname }}</span
      >
      <DataTable
        ref="table"
        id="example-table"
        :tableClass="'table table-striped table-bordered'"
        :columns="tableColumns"
        :api="api"
        :apiParams="apiParams"
        :editItem="editEvidence"
        :openForm="openForm"
        :filters="evidenceFilters"
        :hideActions="hideActions"
        :hideAddNewButton="isFrameworkOwner"
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
        <template #created_at="{ item }">
          <span>
            {{ formatCreatedDate(item.created_at) }}
          </span>
        </template>
        <template #Active="{ item }">
          <div
            class="form-check form-switch d-flex justify-content-center align-items-center"
          >
            <input
              class="form-check-input"
              type="checkbox"
              :checked="item.active === true || item.active === 'true'"
              @change="toggleActive(item)"
              style="width: 40px; height: 22px; cursor: pointer; margin: 0"
              :id="'switch-active-' + item.id"
            />
          </div>
        </template>
        <template #due_date="{ item }">
          {{ calculateDueDate(item.created_at) }}
          <i
            v-if="isOverdue(item.created_at)"
            style="color: red"
            class="fa-solid fa-circle-exclamation"
          ></i>
        </template>
        <template #provider="{ item }">
          <div class="user-info">
            <div
              class="user-avatar"
              :title="getUserName(item.submitted_by)"
              @click="openViewUserModal(item.submitted_by)"
            >
              {{ getUserInitials(getApproverName(item.submitted_by || "-")) }}
            </div>
            <span class="user-fullname">{{
              getUserName(item.submitted_by) || "-"
            }}</span>
          </div>
        </template>
        <template #rejected_controls="{ item }">
          <div class="d-flex justify-content-center align-items-center">
            <span
              v-if="getRejectedControls(item).length > 0"
              class="badge text-bg-danger text-light m-1 rounded-pill"
              style="cursor: pointer; font-size: 13px"
              @click="openRejectedControlsModal(item)"
              :title="'Click to view rejected controls'"
            >
              {{ getRejectedControls(item).length }}
            </span>
            <span v-else class="text-muted" style="font-size: 12px">
              {{ $t("evidence.nocontrols") }}
            </span>
          </div>
        </template>

        <template #action_by="{ item }">
          <div
            v-if="item.statuses && item.statuses.length > 0"
            class="user-info"
          >
            <div
              class="user-avatar"
              :title="getUserName(item.statuses[0].decidedBy)"
              @click="openViewUserModal(item.statuses[0].decidedBy)"
            >
              {{
                getUserInitials(
                  getApproverName(item.statuses[0].decidedBy || "-")
                )
              }}
            </div>
            <span class="user-fullname">{{
              getUserName(item.statuses[0].decidedBy) || "-"
            }}</span>
          </div>
          <span v-else class="text-muted">-</span>
        </template>

        <template #status="{ item }">
          <span
            style="font-size: 13px; border-radius: 30px"
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
              {{ $t("ViewEvidence.attachsupportingdocument") }}
              <span style="color: red">*</span>
            </label>
            <input
              type="file"
              class="form-control mb-2"
              @change="onFileChange"
              :required="!newItem.file"
              ref="fileInput"
            />
            <div v-if="newItem.existingFile" class="mb-2">
              <span
                >{{ $t("ViewEvidence.currentdocument") }} :
                {{ newItem.file }}</span
              >
            </div>
          </div>
        </template>
        <template #control_ids="{ item }">
          <div class="form-group mb-3">
            <label for="control_ids">
              {{ $t("ViewEvidence.controls") }}
              <span style="color: red">*</span>
            </label>
            <div class="d-flex align-items-center gap-3">
              <LazySelectField
                name="control_ids"
                v-model="newItem.control_ids"
                :placeholder="
                  $t('ViewEvidence.selectcontrols') ||
                  'Select the relevant controls'
                "
                options="Control"
                option-label="short_name"
                option-value="id"
                multiple
                class="flex-grow-1"
                :per-page="10"
                :api-params="controlApiParams"
              />
              <button
                style="color: white; background-color: #6e3894 !important"
                type="button"
                class="btn btn-sm btn-primary"
                @click="selectAllControls"
              >
                {{ $t("ViewEvidence.all") }}
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
              >{{ $t("ViewEvidence.description") }} :
            </label>
            <p>{{ stripHtmlTags(evidenceData?.description) }}</p>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-12">
            <label style="font-weight: 700" for="taskTitle" class="form-label">
              {{ $t("ViewEvidence.supportingfile") }} :
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
              >{{ $t("ViewEvidence.relatedcontrols") }} :</label
            >
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style="text-align: center">
                      {{ $t("ViewEvidence.longname") }}
                    </th>
                    <th style="text-align: center">
                      {{ $t("ViewEvidence.shortname") }}
                    </th>
                    <th style="text-align: center">
                      {{ $t("ViewEvidence.number") }}
                    </th>
                    <th style="text-align: center">
                      {{ $t("ViewEvidence.status") }}
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
        <!-- Action Buttons Section -->
        <div class="row mb-3">
          <div class="col-12 d-flex justify-content-center gap-2">
            <button
              v-permission:changeStatus
              v-if="
                hasOwnedFrameworks &&
                !evidenceData.statuses?.some(
                  (status) => status.decidedBy === loggedInUser.id
                )
              "
              @click="rejectEvidence"
              class="btn btn-outline-danger"
            >
              {{ $t("ViewEvidence.reject") }}
            </button>
            <button
              v-permission:changeStatus
              v-if="
                hasOwnedFrameworks &&
                !evidenceData.statuses?.some(
                  (status) => status.decidedBy === loggedInUser.id
                )
              "
              @click="acceptEvidence"
              class="btn btn-primary"
              style="
                background-color: #6e3894 !important;
                padding-block: 6px !important;
              "
            >
              {{ $t("ViewEvidence.accept") }}
            </button>
          </div>
        </div>
        <!-- Comments Section -->
        <div class="row mb-3">
          <div class="col-12">
            <label style="font-weight: 900" class="form-label">
              <i class="fa-solid fa-comments"></i>
              {{ $t("ViewEvidence.comments") }} :
            </label>
            <!-- Comment Input Form -->
            <div class="mb-3">
              <form @submit.prevent="submitComment">
                <textarea
                  v-model="newComment"
                  class="form-control mb-2"
                  placeholder="Add a comment..."
                  rows="3"
                  required
                  style="resize: none"
                ></textarea>
                <div class="d-flex justify-content-end mr-5 mb-5">
                  <button
                    type="submit"
                    class="btn btn-primary btn-sm"
                    style="
                      background-color: #6e3894 !important;
                      color: aliceblue !important;
                    "
                  >
                    {{ $t("ViewEvidence.comment") }}
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
                      style="color: black; font-size: 12px"
                      @click="startEditing(comment)"
                      title="Edit Comment"
                    ></i>
                    <i
                      v-if="comment.user_id === loggedInUser.id"
                      class="fa-solid fa-trash"
                      style="color: red; font-size: 12px"
                      @click="deleteComment(comment.id)"
                      title="Delete Comment"
                    ></i>
                    <i
                      class="fas fa-reply"
                      style="font-size: 12px"
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
                      {{ $t("ViewEvidence.save") }}
                    </button>
                    <button
                      style="font-style: normal; font-size: xx-small"
                      class="btn btn-sm btn-primary"
                      @click="cancelEditing"
                    >
                      {{ $t("ViewEvidence.cancel") }}
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
                    placeholder="Write your reply..."
                    rows="2"
                  ></textarea>
                  <div class="d-flex justify-content-end gap-2">
                    <button
                      style="font-style: normal; font-size: xx-small"
                      class="btn btn-sm btn-primary"
                      @click="submitReply(comment.id)"
                    >
                      {{ $t("ViewEvidence.reply") }}
                    </button>
                    <button
                      style="font-style: normal; font-size: xx-small"
                      class="btn btn-sm btn-primary"
                      @click="toggleReplyForm(null)"
                    >
                      {{ $t("ViewEvidence.cancel") }}
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
                      style="color: black"
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
                          {{ $t("ViewEvidence.save") }}
                        </button>
                        <button
                          style="font-style: normal; font-size: xx-small"
                          class="btn btn-sm btn-secondary"
                          @click="cancelEditing"
                        >
                          {{ $t("ViewEvidence.cancel") }}
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
              {{ $t("ViewEvidence.nocommentsyet") }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- User Details Modal -->
  <transition name="modal-fade">
    <div
      v-if="isUserDetailsModalOpen"
      class="modal fade show"
      style="display: block; background-color: rgba(0, 0, 0, 0.5)"
      tabindex="-1"
      @click.self="closeUserDetailsModal"
    >
      <div
        class="modal-dialog modal-dialog-centered modal-lg"
        style="max-width: 940px"
      >
        <div class="modal-content">
          <div class="modal-header">
            <!-- <h5 class="modal-title">{{ $t("team.teamusers") }}</h5> -->
            <button
              type="button"
              class="btn-close"
              @click="closeUserDetailsModal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="!userDetails" class="text-center text-muted py-4">
              {{ $t("team.nousers") }}
            </div>
            <div v-else class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{{ $t("team.name") }}</th>
                    <th>{{ $t("team.email") }}</th>
                    <th>{{ $t("team.job") }}</th>
                    <th>{{ $t("team.status") }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      {{
                        userDetails.full_name || userDetails.username || "N/A"
                      }}
                    </td>
                    <td>{{ userDetails.email || "N/A" }}</td>
                    <td>{{ userDetails.job?.name || "N/A" }}</td>
                    <td>
                      <span v-if="userDetails.status" class="badge bg-success"
                        >Active</span
                      >
                      <span v-else class="badge bg-secondary">Inactive</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
  <!-- Rejected Controls Modal -->
  <div v-if="isRejectedControlsModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 600px">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("ViewEvidence.rejected_controls") }}</h5>
        <button
          @click="closeRejectedControlsModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table table-striped">
            <thead>
              <tr>
                <th style="text-align: center">#</th>
                <th style="text-align: center">
                  {{ $t("ViewEvidence.shortname") }}
                </th>
                <th style="text-align: center">
                  {{ $t("ViewEvidence.longname") }}
                </th>
                <th style="text-align: center">
                  {{ $t("ViewEvidence.number") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(control, index) in rejectedControlsDetails"
                :key="control.id"
              >
                <td style="text-align: center">{{ index + 1 }}</td>
                <td style="text-align: center">{{ control.short_name }}</td>
                <td style="text-align: center">{{ control.long_name }}</td>
                <td style="text-align: center">{{ control.control_number }}</td>
              </tr>
              <tr v-if="!rejectedControlsDetails.length">
                <td colspan="4" class="text-center">
                  {{ $t("ViewEvidence.nocontrols") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <!-- Reject Evidence Modal -->
  <div v-if="isRejectModalOpen" class="modal-overlay">
    <div class="modal-content" style="max-width: 750px">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t("ViewEvidence.rejectevidence") }}</h5>
        <button
          @click="closeRejectModal"
          class="btn-close"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3 justify-content-center">
          <div class="col-md-12">
            <label for="rejectionComment">
              {{ $t("ViewEvidence.comment") }}
              <span style="color: red">*</span>
            </label>
            <textarea
              v-model="rejectionComment"
              class="form-control"
              placeholder="Please provide a comment for the rejection"
              rows="3"
              required
            ></textarea>
            <small v-if="commentError" class="text-danger">
              {{ $t("ViewEvidence.commentisrequired") }}
            </small>
          </div>
          <div class="modal-footer">
            <button
              @click="confirmRejectEvidence"
              class="btn btn-secondary mr-5 mt-3"
              type="submit"
            >
              {{ $t("ViewEvidence.reject") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- View User Details Modal -->
  <ViewUserDetails
    :viewUserModal="viewUserModal"
    :userData="userData"
    @close="viewUserModal = false"
    @update:viewUserModal="viewUserModal = $event"
  />
</template>
<script>
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
import ViewUserDetails from "@/views/Page/User/components/ViewUserDetails.vue";
import { notify } from "@kyvg/vue3-notification";
import VueSelect from "vue-select";
import LazySelectField from "@/components/LazySelectField.vue";
import Auth from "@/API/Auth";
import axios from "axios";
import { Ckeditor } from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNotifyLogSetting } from "@/composables/useNotifyLogSetting";
import Permission from "@/router/modules/Permission/Permission";

export default {
  components: {
    MainPage,
    Form,
    DataTable,
    ckeditor: Ckeditor,
    "vue-select": VueSelect,
    ViewUserDetails,
    LazySelectField,
  },
  setup() {
    const router = useRouter();
    const api = new Evidence();
    const RequirementApi = new Requirement();
    const controlApi = new control();
    const frameworkApi = new Framework();
    const commentApi = new Comment();
    const userApi = new user();
    const teamApi = new team();
    const departmentApi = new department();
    const jobApi = new job();
    const requirement_id = router.currentRoute.value.params.id;
    let apiParams = {
      filter: `requirement_id|${requirement_id}|=`,
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
      filter: {
        provider: "",
        control: "",
      },
      evidenceFilters: [
        {
          title: "Provider",
          key: "submitted_by",
          type: "string",
          data: "User",
        },
        {
          title: "Control",
          key: "control_ids",
          type: "string",
          data: "Control",
        },
      ],
      userList: [],
      approverOrRejecter: null,
      requirementname: "",
      loggedInUser: false,
      isFlipped: false,
      rejectionReason: null,
      rejectionComment: "",
      isRejectModalOpen: false,
      isDetailsModalOpen: false,
      isProviderDetailsModalOpen: false,
      evidenceData: [],
      evidenceControls: [],
      controlList: [],
      allowedControlIds: [],
      frameworkList: [],
      departmentList: [],
      jobList: [],
      expireDays: 0,
      providerDetails: null,
      dueDateCache: new Map(), // Cache for computed due dates
      newItem: {
        control_ids: [],
        existingFile: null,
        framework_owners: [], // Array to store framework owner IDs
      },
      selectedFile: null,
      editor: ClassicEditor,
      editorConfig: {
        licenseKey: "GPL",
        height: 500,
      },
      icon_path: null,
      translateFields: [],
      fields: [],
      comments: [],
      newComment: "",
      editingCommentId: null,
      editingCommentContent: "",
      currentPage: 1,
      perPage: 10,
      replyingTo: null,
      newReply: "",
      rejectionError: false,
      commentError: false,
      hasOwnedFrameworks: false,
      isResponsible: false,
      isRejectedControlsModalOpen: false,
      rejectedControlsDetails: [],
      isUserDetailsModalOpen: false,
      userDetails: null,
      viewUserModal: false,
      userData: {},
    };
  },
  computed: {
    controlApiParams() {
      // Lazy loading for only the requirement's controls, 10 per page
      if (this.allowedControlIds && this.allowedControlIds.length > 0) {
        return {
          filterIn: `id|${this.allowedControlIds.join(",")}|=`,
          perPage: 10,
        };
      }
      return {
        perPage: 10,
      };
    },
    isFrameworkOwner() {
      // Hide add button if user is NOT responsible for the requirement
      // (meaning they are only a framework owner)
      return !this.isResponsible;
    },

    hideActions() {
      return (row) => {
        const loggedInUserr = Auth.USER;

        return {
          edit:
            row.control_approvals?.[0]?.status != "pending" &&
            row.submitted_by != loggedInUserr.id,
          delete:
            row.control_approvals?.[0]?.status != "pending" &&
            row.submitted_by != loggedInUserr.id,
        };
      };
    },
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
    "newItem.control_ids": {
      handler(newControlIds) {
        // When control_ids change, update framework_owners
        this.updateFrameworkOwners(newControlIds);
      },
      deep: true,
    },
    expireDays: {
      handler(newValue, oldValue) {
        if (newValue !== oldValue) {
          // Clear cache when expireDays changes
          this.clearDueDateCache();
          // Force table refresh if table ref is available
          this.$nextTick(() => {
            if (this.$refs.table) {
              this.$refs.table.refreshTable();
            }
          });
        }
      },
    },
  },
  async mounted() {
    try {
      // Call the composable
      useNotifyLogSetting(
        [
          { label: "Evidence", model: "Evidence" },
        ],
        true
      );

      // Fetch data in optimal order - controls first since it sets expireDays
      await this.fetchControls(); // This sets expireDays

      // Fetch users first before other data
      await this.userApi
        .getAll({
          select: "id|full_name|username|email|phone|type|department_id",
        })
        .then((users) => {
          this.userList = users;
        });

      await Promise.all([
        this.checkResponsibility(),
        this.fetchFrameworks(),
        this.fetchDepartments(),
        this.fetchJobs(),
        this.requirementName(),
      ]);

      // Refresh table after all data is loaded to ensure proper rendering
      this.$nextTick(() => {
        if (this.$refs.table) {
          this.$refs.table.refreshTable();
        }
      });
    } catch (error) {
      console.error("Error in mounted lifecycle:", error);
    }
  },
  beforeUnmount() {
    // Clear cache to prevent memory leaks
    this.clearDueDateCache();
  },
  created() {
    this.requirementId = this.$route.params.id;
    this.tableColumns = [
      {
        id: "name",
        title: this.$t("ViewEvidence.name"),
        data: "name",
        defaultContent: "N/A",
      },
      {
        id: "created_at",
        title: this.$t("ViewEvidence.created_at"),
        data: "created_at",
        defaultContent: "N/A",
      },
      {
        id: "due_date",
        title: this.$t("ViewEvidence.due_date"),
        data: "due_date",
        defaultContent: "N/A",
      },
      {
        id: "provider",
        title: this.$t("ViewEvidence.provider"),
        data: "_USERSERVICE.User.submitted_by.full_name",
        defaultContent: "N/A",
      },
      {
        id: "rejected_controls",
        title: this.$t("ViewEvidence.rejected_controls"),
        data: "rejected_controls",
        defaultContent: "N/A",
      },
      {
        id: "status",
        title: this.$t("ViewEvidence.status"),
        data: "status",
        defaultContent: "N/A",
      },
      {
        id: "action_by",
        title: this.$t("evidence.action_by"),
        data: "",
        defaultContent: "N/A",
      },
      {
        id: "Active",
        title: this.$t("Active"),
        data: "active",
        defaultContent: "N/A",
      },
    ];
    this.fromFields = [
      {
        name: "name",
        label: this.$t("ViewEvidence.name"),
        type: "text",
        rules: "required",
        description: "Please enter the evidence name.",
        col: 12,
      },
      {
        type: "options",
        name: "control_ids",
        label: this.$t("ViewEvidence.controls"),
        options: [],
        multiple: true,
        optionLabel: "short_name",
        col: 12,
        rules: "required",
        description: "Choose the targeted controls.",
      },
      {
        name: "description",
        label: this.$t("ViewEvidence.description"),
        type: "textarea",
        rules: "required",
        description: "Provide a description of the evidence.",
        col: 12,
      },
      {
        name: "file",
        label: this.$t("ViewEvidence.file"),
        type: "file",
        rules: "required",
        description: "Provide a file reference.",
        col: 12,
      },
    ];
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    getUserInitials(fullName) {
      if (!fullName) return "U";

      const nameParts = fullName.trim().split(" ");
      if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }

      // Get first letter of first name and first letter of last name
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    },
    async checkResponsibility() {
      try {
        const requirement_id = this.$route.params.id;
        const requirement = await this.RequirementApi.show(requirement_id);
        if (requirement.responsible_type === "team") {
          const team = await this.teamApi.show(requirement.responsible_id);
          const teamMembers = team.user_ids || [];
          this.isResponsible = teamMembers.includes(Auth.USER.id);
        } else {
          this.isResponsible = Auth.USER.id === requirement.responsible_id;
        }
        if (!this.isResponsible) {
          // Fetch owned frameworks and update apiParams
          const ownedFrameworks = await this.frameworkApi.getAll({
            filter: `owner|${Auth.USER.id}|=`,
            select: "id",
          });
          const ownedFrameworkIds = ownedFrameworks.map(
            (framework) => framework.id
          );
          if (ownedFrameworkIds.length > 0) {
            // Update apiParams to filter evidences by owned framework controls
            this.apiParams = {
              filter: `requirement_id|${requirement_id}|=;control_ids.framework_id|${ownedFrameworkIds.join(
                ","
              )}|in`,
            };
          } else {
            // If no owned frameworks, set filter to return no evidences
            this.apiParams = {
              filter: `requirement_id|${requirement_id}|=;control_ids.framework_id|0|=`,
            };
          }
        }
      } catch (error) {
        console.error("Error checking responsibility:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to check user responsibility",
        });
      }
    },
    getUserName(userId) {
      if (!userId) return "";
      if (!this.userList || this.userList.length === 0) return "";
      const user = this.userList.find((user) => user.id === userId);
      return user ? user.full_name : "";
    },
    getApproverName(userId) {
      if (!userId) return " - ";
      if (!this.userList || this.userList.length === 0) return " ?! ";
      try {
        const user = this.userList.find((user) => user.id === userId);
        return user ? user.full_name : " ?! ";
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return "Error";
      }
    },
    async requirementName() {
      const response = await this.RequirementApi.show(this.requirementId);
      this.requirementname = response.name;
    },
    async fetchComments(evidenceId) {
      try {
        const response = await this.commentApi.fetchComments(
          evidenceId,
          "evidence"
        );
        const userIds = [...new Set(response.map((c) => c.user_id))];
        const users = await Promise.all(
          userIds.map((id) => this.userApi.show(id))
        );
        const userMap = users.reduce((map, user) => {
          map[user.id] = user;
          return map;
        }, {});
        const comments = response
          .filter((comment) => !comment.parent_id)
          .map((comment) => ({
            ...comment,
            user: userMap[comment.user_id] || { full_name: " - " },
            replies: response
              .filter((reply) => reply.parent_id === comment.id)
              .map((reply) => ({
                ...reply,
                user: userMap[reply.user_id] || { full_name: " - " },
              })),
          }));
        this.comments = comments;
        this.currentPage = 1;
      } catch (error) {
        console.error("Error fetching comments:", error);
        // notify({
        //   type: "error",
        //   title: "Error",
        //   text: "Failed to fetch comments",
        // });
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
      this.editingCommentId = null;
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
      this.replyingTo = null;
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
        await this.commentApi.from(updatedData);
        this.cancelEditing();
        await this.fetchComments(this.evidenceData.id);
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
      if (!item.control_approvals || !item.control_approvals.length) {
        return [];
      }
      return item.control_approvals
        .filter((approval) => approval.status.toLowerCase() === "rejected")
        .map((approval) => {
          const control = this.controlList.find(
            (c) => c.id === approval.controlId
          );
          return control ? control.short_name : " - ";
        });
    },
    openRejectedControlsModal(item) {
      if (!item.control_approvals || !item.control_approvals.length) {
        this.rejectedControlsDetails = [];
        return;
      }

      const rejectedApprovals = item.control_approvals.filter(
        (approval) => approval.status.toLowerCase() === "rejected"
      );

      this.rejectedControlsDetails = rejectedApprovals
        .map((approval) => {
          const control = this.controlList.find(
            (c) => c.id === approval.controlId
          );
          return control
            ? {
                id: control.id,
                short_name: control.short_name,
                long_name: control.long_name,
                control_number: control.control_number,
              }
            : null;
        })
        .filter((control) => control !== null);

      this.isRejectedControlsModalOpen = true;
    },
    closeRejectedControlsModal() {
      this.isRejectedControlsModalOpen = false;
      this.rejectedControlsDetails = [];
    },
    async openUserDetailsModal(userId) {
      if (!userId) {
        notify({
          type: "warning",
          title: "Warning",
          text: "User information not available",
        });
        return;
      }
      try {
        const response = await this.userApi.show(userId, { with: ["job"] });
        this.userDetails = response;
        this.isUserDetailsModalOpen = true;
      } catch (error) {
        console.error("Error fetching user details:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch user details",
        });
      }
    },
    closeUserDetailsModal() {
      this.isUserDetailsModalOpen = false;
      this.userDetails = null;
    },
    openViewUserModal(userId) {
      if (!userId) return;
      const user = this.userList.find((u) => u.id === userId);
      if (user) {
        const dept = this.departmentList.find(
          (d) => d.id === user.department_id
        );
        this.userData = {
          ...user,
          department: dept ? dept.name : "N/A",
        };
        this.viewUserModal = true;
      }
    },
    async acceptEvidence() {
      try {
        const currentEvidence = await this.api.show(this.evidenceData.id);
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
        const uniqueFrameworkIds = [
          ...new Set(ownedControls.map((c) => c.framework_id)),
        ];
        const existingFrameworkIds = uniqueFrameworkIds.filter((frameworkId) =>
          currentEvidence.statuses?.some(
            (status) => status.frameworkId === frameworkId
          )
        );
        if (existingFrameworkIds.length > 0) {
          const existingFrameworkNames = existingFrameworkIds
            .map((id) => {
              const control = ownedControls.find((c) => c.framework_id === id);
              return control ? control.short_name : id;
            })
            .join(", ");
          notify({
            type: "warning",
            title: "Action Not Allowed",
            text: `Framework (${existingFrameworkNames}) already have a status assigned.`,
          });
          return;
        }

        // Get responsible users from the requirement
        const responsibleUsers = await this.getRequirementResponsibleUsers();

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
        let updatedStatus = [...(currentEvidence.statuses || [])];
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
        const updatedEvidence = {
          ...currentEvidence,
          control_approvals: updatedApprovals,
          statuses: updatedStatus,
          responsible_users: responsibleUsers,
        };
        await this.api.changeStatus(updatedEvidence);
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
      this.isRejectModalOpen = true;
      this.rejectionReason = "";
      this.rejectionComment = "";
      this.rejectionError = false;
      this.commentError = false;
    },
    async confirmRejectEvidence() {
      let hasError = false;
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
        const currentEvidence = await this.api.show(this.evidenceData.id);
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
        const uniqueFrameworkIds = [
          ...new Set(ownedControls.map((c) => c.framework_id)),
        ];
        const existingFrameworkIds = uniqueFrameworkIds.filter((frameworkId) =>
          currentEvidence.statuses?.some(
            (status) => status.frameworkId === frameworkId
          )
        );
        if (existingFrameworkIds.length > 0) {
          const existingFrameworkNames = existingFrameworkIds
            .map((id) => {
              const control = ownedControls.find((c) => c.framework_id === id);
              return control ? control.short_name : id;
            })
            .join(", ");
          notify({
            type: "warning",
            title: "Action Not Allowed",
            text: `Framework (${existingFrameworkNames}) already have a status assigned.`,
          });
          return;
        }

        // Get responsible users from the requirement
        const responsibleUsers = await this.getRequirementResponsibleUsers();

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
        let updatedStatus = [...(currentEvidence.statuses || [])];
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
        const updatedEvidence = {
          ...currentEvidence,
          control_approvals: updatedApprovals,
          statuses: updatedStatus,
          responsible_users: responsibleUsers,
        };
        await this.api.changeStatus(updatedEvidence);
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
      const currentValue = this.newItem[fieldName];
      if (Array.isArray(currentValue)) {
        if (currentValue.includes(option.id)) {
          return false;
        }
      }
      for (const key in this.newItem) {
        if (key === fieldName) continue;
        const value = this.newItem[key];
        if (Array.isArray(value) && value.includes(option.id)) {
          return false;
        }
      }
      return true;
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatCreatedDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
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
      if (!createdAt || !this.expireDays) return "";

      // Use cache to avoid recalculating
      const cacheKey = `${createdAt}_${this.expireDays}`;
      if (this.dueDateCache.has(cacheKey)) {
        return this.dueDateCache.get(cacheKey);
      }

      const createdDate = new Date(createdAt);
      const dueDate = new Date(createdDate);
      dueDate.setDate(createdDate.getDate() + parseInt(this.expireDays));
      const result = this.formatDate(dueDate);

      // Cache the result
      this.dueDateCache.set(cacheKey, result);
      return result;
    },
    isOverdue(createdAt) {
      if (!this.expireDays || !createdAt) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

      const created = new Date(createdAt);
      const dueDate = new Date(created);
      dueDate.setDate(created.getDate() + parseInt(this.expireDays));
      dueDate.setHours(0, 0, 0, 0); // Reset time for accurate comparison

      return today > dueDate;
    },
    clearDueDateCache() {
      this.dueDateCache.clear();
    },
    stripHtmlTags(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },
    async fetchControls() {
      this.loggedInUser = Auth.USER;
      try {
        const requirement_id = this.$route.params.id;
        const requirement = await this.RequirementApi.show(requirement_id);
        const requiredControlIds = requirement.control_id || [];
        this.allowedControlIds = requiredControlIds;

        // Set expire days with default value and ensure it's a number
        this.expireDays = requirement.expire_days
          ? parseInt(requirement.expire_days)
          : 0;

        // Clear the cache when expireDays changes
        this.clearDueDateCache();

        const allControls = await this.controlApi.getAll({
          select: "id|short_name|framework_id|long_name|control_number",
        });
        const filteredControls = allControls.filter((control) =>
          requiredControlIds.includes(control.id)
        );
        this.controlList = filteredControls;
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
    async fetchFrameworks() {
      try {
        const response = await this.frameworkApi.getAll({
          select: "id|owner",
        });
        this.frameworkList = response;
      } catch (error) {
        console.error("Error fetching frameworks:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to fetch frameworks",
        });
      }
    },
    async updateFrameworkOwners(controlIds) {
      if (!controlIds || controlIds.length === 0) {
        this.newItem.framework_owners = [];
        return;
      }

      try {
        // Get unique framework IDs from selected controls
        const frameworkIds = [
          ...new Set(
            controlIds
              .map((controlId) => {
                const control = this.controlList.find(
                  (c) => c.id === controlId
                );
                return control ? control.framework_id : null;
              })
              .filter((id) => id !== null)
          ),
        ];

        // Get owners for these frameworks
        const owners = frameworkIds
          .map((frameworkId) => {
            const framework = this.frameworkList.find(
              (f) => f.id === frameworkId
            );
            return framework ? framework.owner : null;
          })
          .filter((owner) => owner !== null);

        // Store unique owner IDs
        this.newItem.framework_owners = [...new Set(owners)];
      } catch (error) {
        console.error("Error updating framework owners:", error);
      }
    },
    async getRequirementResponsibleUsers() {
      try {
        const requirement_id = this.$route.params.id;
        const requirement = await this.RequirementApi.show(requirement_id);

        let responsibleUsers = [];

        if (
          requirement.responsible_type === "user" ||
          requirement.responsible_type === "department_manager"
        ) {
          // responsible_id is a user ID
          responsibleUsers = [requirement.responsible_id];
        } else if (requirement.responsible_type === "team") {
          // responsible_id is a team ID, fetch team members
          try {
            const team = await this.teamApi.show(requirement.responsible_id);
            responsibleUsers = team.user_ids || [];
          } catch (error) {
            console.error("Error fetching team members:", error);
            responsibleUsers = [];
          }
        }

        return responsibleUsers;
      } catch (error) {
        console.error("Error getting requirement responsible users:", error);
        return [];
      }
    },
    getStatusBadgeClass(status) {
      const normalizedStatus = status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : "Pending";
      const statusMap = {
        Approved: "badge bg-success",
        Rejected: "badge text-bg-danger",
        Pending: "badge text-bg-warning",
      };
      return statusMap[normalizedStatus] || "badge text-bg-warning";
    },
    selectAllControls() {
      this.newItem.control_ids = this.controlList.map((control) => control.id);
    },
    async toggleActive(item) {
      const formData = {
        ...item,
        active: !(item.active === true || item.active === "true"),
      };
      try {
        await this.api.from(formData);
        this.$refs.table.refreshTable();
      } catch (error) {
        console.error("Failed to update active status:", error);
      }
    },
    async openDetailsModal(selectedRow) {
      try {
        if (!this.isResponsible) {
          // Check if the user has access to this evidence based on owned frameworks
          const ownedFrameworks = await this.frameworkApi.getAll({
            filter: `owner|${Auth.USER.id}|=`,
            select: "id",
          });
          const ownedFrameworkIds = ownedFrameworks.map(
            (framework) => framework.id
          );
          const hasRelatedControls = selectedRow.control_ids.some(
            (controlId) => {
              const control = this.controlList.find((c) => c.id === controlId);
              return (
                control && ownedFrameworkIds.includes(control.framework_id)
              );
            }
          );
          if (!hasRelatedControls) {
            notify({
              type: "warning",
              title: "Access Denied",
              text: "You do not have permission to view this evidence",
            });
            return;
          }
        }
        this.evidenceData = selectedRow;
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
        this.hasOwnedFrameworks = selectedRow.control_ids.some((controlId) => {
          const control = this.controlList.find((c) => c.id === controlId);
          return control && ownedFrameworkIds.includes(control.framework_id);
        });
        await Promise.all([
          this.fetchEvidenceControls(selectedRow.id, ownedFrameworkIds),
          this.fetchComments(selectedRow.id),
        ]);
        this.isDetailsModalOpen = true;
      } catch (error) {
        console.error("Error opening details modal:", error);
        notify({
          type: "error",
          title: "Error",
          text: "Failed to open evidence details",
        });
      }
    },
    async fetchEvidenceControls(evidenceId, ownedFrameworkIds) {
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
        const controlIdsToShow = this.hasOwnedFrameworks
          ? this.evidenceData.control_ids.filter((controlId) => {
              const control = this.controlList.find((c) => c.id === controlId);
              return (
                control && ownedFrameworkIds.includes(control.framework_id)
              );
            })
          : this.evidenceData.control_ids;
        this.evidenceControls = await Promise.all(
          controlIdsToShow.map(async (controlId) => {
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
            const controlApproval = this.evidenceData.control_approvals?.find(
              (approval) => approval.controlId === controlId
            );
            const status = controlApproval
              ? controlApproval.status.charAt(0).toUpperCase() +
                controlApproval.status.slice(1)
              : "Pending";
            const rejectionReason =
              controlApproval && controlApproval.status === "rejected"
                ? controlApproval.rejectionReason || null
                : null;
            return {
              id: foundControl.id,
              short_name: foundControl.short_name,
              long_name: foundControl.long_name,
              control_number: foundControl.control_number,
              framework_id: foundControl.framework_id,
              status,
              rejectionReason,
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
    async openProviderDetailsModal(userId) {
      try {
        this.isProviderDetailsModalOpen = true;
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
    async closeDetailsModal() {
      this.isDetailsModalOpen = false;
      this.newComment = "";
      this.hasOwnedFrameworks = false;
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
      if (!isResponsible) {
        this.isFlipped = false;
        notify({
          type: "error",
          text: "Only the responsible person or team members can add more evidence",
        });
        return;
      } else {
        const currentDate = new Date();
        const expireDate = new Date(currentDate);
        expireDate.setDate(currentDate.getDate() + requirementExpireDays);
        this.newItem = {
          submitted_by: Auth.USER.id,
          requirement_id: this.$route.params.id,
          control_ids: [],
          due_date: expireDate.toISOString(),
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
        existingFile: selectedRow.file,
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
/* User Details Modal - Center table headers and cells */
.modal-body table th,
.modal-body table td {
  text-align: center;
  vertical-align: middle;
}

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

.text-bg-warning {
  background-color: #ebdcb3 !important;
  color: #c4951b !important;
  font-size: 13px;
  border-radius: 30px !important;
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
  color: #6c757d; /* Muted gray for subtlety */
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
  overflow-y: auto; /* Enable vertical scrolling if content overflows */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  width: 100%; /* Ensure the modal body takes full width */
}

.modal-body p {
  white-space: normal; /* Ensure text wraps */
  word-wrap: break-word; /* Break long words if necessary */
  overflow-wrap: break-word; /* Modern alternative to word-wrap */
  max-width: 100%; /* Ensure the text doesn't overflow its container */
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

.table-actions .dropdown-item {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #212529;
  border-top: 1px solid #efefef;
}

.table-actions .dropdown-item:first-child {
  border-top: none;
}

.table-actions .dropdown-item:hover {
  background-color: #f8f9fa;
}

.table-actions .dropdown-item i {
  margin-right: 0.5rem;
  width: 1rem;
  text-align: center;
}

/* User info container - matches InternalMessage.vue */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

/* Individual user avatar */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d0b5e3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #43235c;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  cursor: pointer;
}

/* User full name text */
.user-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-bg-danger {
  background-color: #e2b6b6 !important;
  color: #a92525 !important;
}
.bg-success {
  background-color: #b6caae !important;
  color: #255f0b !important;
}

.custom-table th,
td {
  text-align: center !important;
}
</style>
