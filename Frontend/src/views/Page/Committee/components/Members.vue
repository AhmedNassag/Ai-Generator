<template>
  <div class="members-container">
    <!-- Leadership Section -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">{{ $t('committee.assignments') }}</h2>
      </div>
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr class="table-header">
              <th>{{ $t('common.name') }}</th>
              <th>{{ $t('common.email') }}</th>
              <th>{{ $t('common.department') }}</th>
              <th>{{ $t('common.phone') }}</th>
              <th>{{ $t('common.role') }}</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr
              v-for="leader in leadershipUsers"
              :key="leader.user.id + leader.role"
              class="table-body"
            >
              <td>{{ leader.user.full_name }}</td>
              <td>{{ leader.user.email }}</td>
              <td>{{ getDepartmentName(leader.user.department_id) }}</td>
              <td>{{ leader.user.phone }}</td>
              <td>
                <span
                  class="role-badge"
                  :class="'role-' + leader.role.toLowerCase()"
                  >{{ leader.role }}</span
                >
              </td>
            </tr>
            <tr v-if="leadershipUsers.length === 0">
              <td colspan="5" class="empty-cell">{{ $t('committee.no_users_in_this_group') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Members Section -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">{{ $t('committee.members') }}</h2>
        <button
          class="edit-btn"
          @click="openMemberModal"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.66667 1L13 4.33333L4.33333 13H1V9.66667L9.66667 1Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ $t('common.edit') }}
        </button>
      </div>
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr class="table-header">
              <th>{{ $t('common.name') }}</th>
              <th>{{ $t('common.email') }}</th>
              <th>{{ $t('common.department') }}</th>
              <th>{{ $t('common.phone') }}</th>
              <th>{{ $t('common.role') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in memberUsers" :key="user.id" class="table-body">
              <td>{{ user.full_name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ getDepartmentName(user.department_id) }}</td>
              <td>{{ user.phone }}</td>
              <td><span class="role-badge role-member">{{ $t('committee.members') }}</span></td>
            </tr>
            <tr v-if="memberUsers.length === 0">
              <td colspan="5" class="empty-cell">{{ $t('committee.no_users_in_this_group') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Member Edit Modal -->
    <MemberEditModal
      :isOpen="memberModalOpen"
      @update:isOpen="memberModalOpen = $event"
      :users="users"
      :currentMembers="member_ids"
      @save="handleMemberSave"
      @close="handleModalClose"
      :currentHeadsOfCommittee="currentHeadsOfCommittee"
    />
  </div>
</template>

<script>
import MemberEditModal from "./MemberEditModal.vue";
import Committee from "@/API/Committee/Committee";

export default {
  components: {
    MemberEditModal,
  },

  props: {
    committeeData: Object,
    departments: Array,
    users: Array,
    authUser: Object,
  },

  data() {
    return {
      chairperson_id: null,
      vice_chair_id: [],
      secretary_id: [],
      member_ids: [],
      currentHeadsOfCommittee: [],
      memberModalOpen: false,
      isLoading: false,
      committeeApi: new Committee(),
    };
  },

  mounted() {
    if (this.committeeData) {
      this.chairperson_id = this.committeeData.chairperson_id || null;
      this.vice_chair_id = this.committeeData.vice_chair_id || null;
      this.secretary_id = this.committeeData.secretary_id || null;
      this.member_ids = this.committeeData.member_ids || [];
      this.currentHeadsOfCommittee = [
        this.chairperson_id,
        this.vice_chair_id,
        this.secretary_id,
      ].filter((id) => id);
    }
  },

  computed: {
    leadershipUsers() {
      const leaders = [];

      if (this.chairperson_id) {
        const user = this.users.find((u) => u.id === this.chairperson_id);
        if (user) leaders.push({ user, role: this.$t('committee.chairperson') });
      }

      if (this.vice_chair_id) {
        const user = this.users.find((u) => u.id === this.vice_chair_id);
        if (user) leaders.push({ user, role: this.$t('committee.vice_chair') });
      }

      if (this.secretary_id) {
        const user = this.users.find((u) => u.id === this.secretary_id);
        if (user) leaders.push({ user, role: this.$t('committee.secretary') });
      }

      return leaders;
    },

    memberUsers() {
      return this.users.filter((u) => (this.member_ids || []).includes(u.id));
    },

    isAuthorizedUser() {
      const authUserId = this.authUser?.id;
      if (!authUserId) return false;

      return (
        authUserId === this.chairperson_id ||
        authUserId === this.vice_chair_id ||
        authUserId === this.secretary_id
      );
    },
  },

  methods: {
    getDepartmentName(departmentId) {
      const dept = this.departments.find((d) => d.id === departmentId);
      return dept ? dept.name : departmentId;
    },

    openMemberModal() {
      this.memberModalOpen = true;
    },

    handleModalClose() {
      this.memberModalOpen = false;
    },

    async handleMemberSave(updatedMembers) {
      this.isLoading = true;
      try {
        const updatedData = {
          ...this.committeeData,
          member_ids: updatedMembers,
        };

        const response = await this.committeeApi.update(updatedData);

        if (response.status == "success") {
          this.memberModalOpen = false;
          this.$emit("members-updated", updatedMembers);
          this.committeeApi.poup(
            response,
            this.$t("committee.members_updated_successfully")
          );
          this.member_ids = updatedMembers;
        } else {
          throw new Error(
            response.message || this.$t("committee.failed_to_update_members")
          );
        }
      } catch (error) {
        console.error("Failed to update members:", error);
        this.committeeApi.poup(
          response,
          this.$t("committee.failed_to_update_members_try_again")
        );
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.members-container {
  padding: 0;
  max-width: 100%;
}

.section-card {
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.section-header {
  background: #f9fafb;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.modern-table thead tr.table-header th {
  color: #000000 !important;
}

.modern-table tbody tr.table-body td {
  color: #121212 !important;
}

.edit-btn {
  background: #6e3894;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #6e3894;
}

.edit-btn i {
  font-size: 12px;
}

.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.modern-table thead {
  background: #f9fafb;
}

.modern-table th {
  padding: 12px 20px;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
  text-transform: capitalize;
  border-bottom: 1px solid #e5e7eb;
}

.modern-table td {
  padding: 16px 20px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.modern-table tbody tr:last-child td {
  border-bottom: none;
}

.modern-table tbody tr:hover {
  background: #f9fafb;
}

/* Fixed table layout for consistent column widths */
.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  table-layout: fixed;
}

.modern-table th:nth-child(1),
.modern-table td:nth-child(1) {
  width: 20%;
}

.modern-table th:nth-child(2),
.modern-table td:nth-child(2) {
  width: 25%;
}

.modern-table th:nth-child(3),
.modern-table td:nth-child(3) {
  width: 20%;
}

.modern-table th:nth-child(4),
.modern-table td:nth-child(4) {
  width: 20%;
}

.modern-table th:nth-child(5),
.modern-table td:nth-child(5) {
  width: 15%;
}

.empty-cell {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 32px 20px !important;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  color: #43235c;
}

.role-chairperson {
  background: #ffffff;
  color: #43235c;
}

.role-vice {
  background: #ffffff;
  color: #43235c;
}

.role-secretary {
  background: #ffffff;
  color: #43235c;
}

.role-member {
  background: #ffffff;
  color: #43235c;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    padding: 12px 16px;
  }

  .section-title {
    font-size: 14px;
  }

  .edit-btn {
    padding: 12px 12px;
    font-size: 12px;
  }

  .modern-table th,
  .modern-table td {
    padding: 12px 16px;
    font-size: 13px;
  }

  .modern-table {
    min-width: 700px;
  }
}
</style>
