<template>
  <div class="attendance-tracker">
    <!-- Header -->
    <div class="header">
      <h2>{{ $t("attendance.meetingAttendanceTracker") }}</h2>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">{{ $t("attendance.totalInvited") }}</div>
        <div class="stat-value purple">{{ participants.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ $t("attendance.attended") }}</div>
        <div class="stat-value green">{{ attendedCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ $t("attendance.rsvpd") }}</div>
        <div class="stat-value yellow">{{ rsvpCount }}</div>
      </div>
    </div>

    <!-- Filter Tabs and Export Button -->
    <div class="controls">
      <div class="filter-tabs">
        <label
          class="filter-tab"
          :class="{ active: !showAttendedOnly && !showRSVPOnly }"
        >
          <input
            type="radio"
            name="filter"
            :checked="!showAttendedOnly && !showRSVPOnly"
            @change="clearFilters"
          />
          <span class="tab-dot"></span>
          <span>{{ $t("attendance.all") }}</span>
        </label>
        <label class="filter-tab" :class="{ active: showAttendedOnly }">
          <input
            type="radio"
            name="filter"
            :checked="showAttendedOnly"
            @change="setAttendedFilter"
          />
          <span class="tab-dot"></span>
          <span>{{ $t("attendance.attended") }}</span>
        </label>
        <label class="filter-tab" :class="{ active: showRSVPOnly }">
          <input
            type="radio"
            name="filter"
            :checked="showRSVPOnly"
            @change="setRSVPFilter"
          />
          <span class="tab-dot"></span>
          <span>{{ $t("attendance.rsvpd") }}</span>
        </label>
      </div>

      <button @click="showExportMenu = !showExportMenu" class="btn-export">
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.877 6.58984C14.02 6.58992 14.1575 6.64604 14.2588 6.74707C14.3602 6.84836 14.417 6.98655 14.417 7.12988C14.417 8.85717 14.4835 10.6163 14.417 12.3535C14.4096 12.6383 14.3462 12.9188 14.2295 13.1787C14.1124 13.4392 13.944 13.674 13.7354 13.8691C13.5267 14.0642 13.2815 14.2159 13.0137 14.3154C12.7475 14.4143 12.4644 14.459 12.1807 14.4482L2.25488 14.4512H2.25V14.4502C1.96046 14.442 1.67558 14.3761 1.41211 14.2559C1.14851 14.1355 0.911599 13.9635 0.71582 13.75C0.520011 13.5365 0.368408 13.2856 0.271484 13.0127C0.174627 12.7398 0.134042 12.4501 0.151367 12.1611C0.14208 10.4838 0.151366 8.80551 0.151367 7.12988C0.151367 6.98655 0.208146 6.84836 0.30957 6.74707C0.41088 6.64604 0.54832 6.58994 0.691406 6.58984C0.834684 6.58984 0.972814 6.64587 1.07422 6.74707C1.17564 6.84836 1.23242 6.98655 1.23242 7.12988C1.23242 8.84976 1.20744 10.5628 1.23242 12.2783C1.23813 12.6686 1.38582 12.9338 1.60742 13.1055C1.83413 13.281 2.15379 13.3701 2.51855 13.3701H12.2607C12.4762 13.375 12.6882 13.3145 12.8682 13.1963C13.0467 13.079 13.1845 12.9102 13.2656 12.7129C13.3337 12.4645 13.3587 12.2059 13.3369 11.9492L13.335 11.9365H13.3359V7.12988C13.3359 6.98655 13.3927 6.84836 13.4941 6.74707C13.5955 6.64586 13.7337 6.58984 13.877 6.58984ZM7.3125 0.158203H7.31934C7.44939 0.163251 7.57299 0.217563 7.66406 0.310547H7.66309L10.5303 3.17285L10.5322 3.1748L10.5977 3.25684C10.6546 3.34485 10.6845 3.44836 10.6836 3.55469C10.6824 3.69639 10.6257 3.83247 10.5254 3.93262C10.4253 4.03247 10.2899 4.08948 10.1484 4.09082C10.0067 4.09205 9.86957 4.03686 9.76758 3.93848L9.76562 3.93652L7.82129 1.99512V10.0166C7.82129 10.1599 7.76451 10.2981 7.66309 10.3994C7.56168 10.5007 7.42358 10.5576 7.28027 10.5576C7.13715 10.5575 6.99974 10.5005 6.89844 10.3994C6.79701 10.2981 6.74023 10.1599 6.74023 10.0166V1.99512L4.7959 3.93652L4.79395 3.93848C4.69195 4.03686 4.5548 4.09205 4.41309 4.09082C4.27165 4.08952 4.1363 4.03246 4.03613 3.93262C3.93586 3.83247 3.87819 3.69639 3.87695 3.55469C3.87577 3.41305 3.93082 3.27663 4.0293 3.1748L4.03125 3.17285L6.89648 0.310547C6.97925 0.226063 7.08922 0.175801 7.20605 0.163086C7.20973 0.161663 7.21348 0.159513 7.21777 0.158203C7.2372 0.152298 7.25832 0.149738 7.28027 0.151367C7.29228 0.152259 7.30286 0.155687 7.3125 0.158203Z"
            fill="#43235C"
            stroke="#43235C"
            stroke-width="0.3"
          />
        </svg>

        {{ $t("attendance.export") }}
      </button>

      <!-- Export Dropdown Menu -->
      <div v-if="showExportMenu" class="export-menu">
        <button
          @click="
            exportToCSV(participants);
            showExportMenu = false;
          "
          class="export-option"
        >
          {{ $t("attendance.exportCSV") }}
        </button>
        <button
          @click="
            exportToPDF(participants);
            showExportMenu = false;
          "
          class="export-option"
        >
          {{ $t("attendance.exportPDF") }}
        </button>
      </div>
    </div>

    <!-- Participant Table -->
    <div class="participant-table" v-if="filteredParticipants.length > 0">
      <div class="table-header">
        <div class="col-name">{{ $t("attendance.name") }}</div>
        <div class="col-email">{{ $t("attendance.email") }}</div>
        <div class="col-role">{{ $t("attendance.role") }}</div>
        <div class="col-rsvp">{{ $t("attendance.rsvpStatus") }}</div>
        <div class="col-attendance">{{ $t("attendance.attendance") }}</div>
        <div
          class="col-actions"
          v-if="
            meetingData.status != 'completed' &&
            meetingData.status != 'cancelled'
          "
        >
          {{ $t("attendance.actions") }}
        </div>
      </div>

      <div
        v-for="participant in filteredParticipants"
        :key="participant.id"
        class="table-row"
      >
        <div class="col-name">{{ participant.full_name }}</div>
        <div class="col-email">{{ participant.email }}</div>
        <div class="col-role">
          <span class="role-badge" :class="`role-${participant.type}`">
            {{ getTypeDisplayName(participant.type) }}
          </span>
        </div>
        <div class="col-rsvp">
          <span
            class="rsvp-badge"
            :class="`rsvp-${participant.RSVPStatus || 'pending'}`"
          >
            {{ getRSVPDisplayName(participant.RSVPStatus) }}
          </span>
        </div>
        <div class="col-attendance">
          <span
            class="attendance-badge"
            :class="
              participant.attendded === 'true' || participant.attendded === true
                ? 'present'
                : 'absent'
            "
          >
            {{
              participant.attendded === "true" || participant.attendded === true
                ? $t("attendance.present")
                : $t("attendance.absent")
            }}
          </span>
        </div>
        <div
          class="col-actions"
          v-if="
            meetingData.status != 'completed' &&
            meetingData.status != 'cancelled'
          "
        >
          <button
            @click="toggleAttendance(participant)"
            class="action-btn"
            :class="
              participant.attendded === 'true' || participant.attendded === true
                ? 'btn-remove'
                : 'btn-add'
            "
          >
            <svg
              v-if="
                participant.attendded === 'true' ||
                participant.attendded === true
              "
              width="25"
              height="20"
              viewBox="0 0 25 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.25"
                y="0.25"
                width="24.5"
                height="19.5"
                rx="9.75"
                fill="#E2B6B6"
              />
              <rect
                x="0.25"
                y="0.25"
                width="24.5"
                height="19.5"
                rx="9.75"
                stroke="#8C8C8C"
                stroke-width="0.5"
              />
              <path
                d="M14.6818 15V13.8889C14.6818 13.2995 14.4519 12.7343 14.0428 12.3175C13.6336 11.9008 13.0787 11.6667 12.5 11.6667H8.68182C8.10316 11.6667 7.54821 11.9008 7.13904 12.3175C6.72987 12.7343 6.5 13.2995 6.5 13.8889V15M15.7727 7.77778L18.5 10.5556M18.5 7.77778L15.7727 10.5556M12.7727 7.22222C12.7727 8.44952 11.7959 9.44444 10.5909 9.44444C9.38592 9.44444 8.40909 8.44952 8.40909 7.22222C8.40909 5.99492 9.38592 5 10.5909 5C11.7959 5 12.7727 5.99492 12.7727 7.22222Z"
                stroke="#A92525"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              width="25"
              height="20"
              viewBox="0 0 25 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.25"
                y="0.25"
                width="24.5"
                height="19.5"
                rx="9.75"
                fill="#D3DFCE"
              />
              <rect
                x="0.25"
                y="0.25"
                width="24.5"
                height="19.5"
                rx="9.75"
                stroke="#8C8C8C"
                stroke-width="0.5"
              />
              <path
                d="M14.6818 15V13.8889C14.6818 13.2995 14.4519 12.7343 14.0428 12.3175C13.6336 11.9008 13.0787 11.6667 12.5 11.6667H8.68182C8.10316 11.6667 7.54821 11.9008 7.13904 12.3175C6.72987 12.7343 6.5 13.2995 6.5 13.8889V15M15.2273 9.44444L16.3182 10.5556L18.5 8.33333M12.7727 7.22222C12.7727 8.44952 11.7959 9.44444 10.5909 9.44444C9.38592 9.44444 8.40909 8.44952 8.40909 7.22222C8.40909 5.99492 9.38592 5 10.5909 5C11.7959 5 12.7727 5.99492 12.7727 7.22222Z"
                stroke="#255F0B"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>{{ $t("attendance.noParticipantsMatch") }}</p>
    </div>
  </div>
</template>

<script>
import Meeting from "@/API/Meeting/Meeting";

export default {
  name: "AttendanceTracker",
  props: {
    initialParticipants: {
      type: Array,
      default: () => [],
    },
    meetingData: {
      type: Object,
      required: true,
    },
  },

  setup() {
    const meetingApi = new Meeting();
    return { meetingApi };
  },

  data() {
    return {
      participants: [],
      showAttendedOnly: false,
      showRSVPOnly: false,
      showExportMenu: false,
    };
  },

  computed: {
    attendedCount() {
      return this.participants.filter(
        (p) => p?.attendded === "true" || p?.attendded === true
      )?.length;
    },
    rsvpCount() {
      return this.participants.filter((p) => p?.RSVPStatus === "going")?.length;
    },
    filteredParticipants() {
      return this.participants.filter((participant) => {
        if (
          this.showAttendedOnly &&
          !(participant.attendded === "true" || participant.attendded === true)
        ) {
          return false;
        }
        if (this.showRSVPOnly && participant.RSVPStatus !== "going") {
          return false;
        }
        return true;
      });
    },
  },

  mounted() {
    console.log("Meeting Data:", this.meetingData);
    this.participants =
      this.initialParticipants.length > 0
        ? this.initialParticipants.filter(
            (initialParticipant) => initialParticipant != null
          )
        : [];
  },

  methods: {
    clearFilters() {
      this.showAttendedOnly = false;
      this.showRSVPOnly = false;
    },
    setAttendedFilter() {
      this.showAttendedOnly = true;
      this.showRSVPOnly = false;
    },
    setRSVPFilter() {
      this.showAttendedOnly = false;
      this.showRSVPOnly = true;
    },
    getTypeDisplayName(type) {
      const typeMap = {
        chairperson: this.$t("attendance.chairperson"),
        vice_chair: this.$t("attendance.viceChair"),
        secretary: this.$t("attendance.secretary"),
        member: this.$t("attendance.member"),
        guest: this.$t("attendance.guest"),
      };
      return typeMap[type] || type;
    },
    getRSVPDisplayName(status) {
      const statusMap = {
        pending: this.$t("attendance.pending"),
        going: this.$t("attendance.going"),
        notgoing: this.$t("attendance.notGoing"),
      };
      return statusMap[status] || status;
    },
    async toggleAttendance(participant) {
      participant.attendded =
        participant.attendded === "true" || participant.attendded === true
          ? false
          : true;
      await this.updateAttendance(participant);
    },
    async updateAttendance(participant) {
      try {
        const updatedMeeting = await this.meetingApi.changeParticipantStatus(
          this.meetingData.id,
          {
            user_id: participant.id,
            attendded: participant.attendded,
            type: participant.type,
          }
        );

        if (updatedMeeting.data.status == "success") {
          this.meetingApi.poup(
            updatedMeeting,
            this.$t("attendance.attendanceUpdated")
          );
        }
      } catch (error) {
        console.error(this.$t("attendance.updateAttendanceError"), error);
      }
    },
    exportToCSV(data) {
      try {
        const headers = [
          this.$t("attendance.name"),
          this.$t("attendance.email"),
          this.$t("attendance.role"),
          this.$t("attendance.rsvpStatus"),
          this.$t("attendance.attended"),
        ];
        const csvRows = [headers.join(",")];

        data.forEach((p) => {
          const row = [
            `"${(p.full_name || "").replace(/"/g, '""')}"`,
            `"${(p.email || "").replace(/"/g, '""')}"`,
            `"${this.getTypeDisplayName(p.type) || ""}"`,
            `"${
              this.getRSVPDisplayName(p.RSVPStatus) ||
              this.$t("attendance.rsvpStatuses.pending")
            }"`,
            p.attendded === "true" || p.attendded === true
              ? this.$t("attendance.yes")
              : this.$t("attendance.no"),
          ];
          csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const timestamp = new Date().toISOString().split("T")[0];
        this.downloadFile(
          csvContent,
          `attendance-${timestamp}.csv`,
          "text/csv"
        );
      } catch (error) {
        console.error(this.$t("attendance.csvExportError"), error);
      }
    },
    exportToPDF(data) {
      try {
        const timestamp = new Date().toISOString().split("T")[0];

        // FIX: Correctly count attended participants
        const attendedCount = data.filter(
          (p) => p.attendded === "true" || p.attendded === true
        ).length;

        // FIX: Calculate RSVP count for the PDF
        const rsvpGoingCount = data.filter(
          (p) => p.RSVPStatus === "going"
        ).length;

        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${this.$t("attendance.attendanceReport")}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px; }
        .stat-item { text-align: center; }
        .stat-item strong { display: block; font-size: 24px; color: #7c3aed; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .attended { background-color: #e8f5e8; }
        .type-chairperson { background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
        .type-vice_chair { background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
        .type-secretary { background: #f3e8ff; color: #6b21a8; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
        .type-member { background: #e8f5e8; color: #2e7d32; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
        .type-guest { background: #e1f5fe; color: #0277bd; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; }
        .rsvp-going { color: #16a34a; font-weight: bold; }
        .rsvp-pending { color: #d97706; }
        .rsvp-notgoing { color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${this.$t("attendance.meetingAttendanceReport")}</h1>
        <p>${this.$t(
          "attendance.generatedOn"
        )}: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="stats">
        <h3>${this.$t("attendance.summary")}</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <p>${this.$t("attendance.totalInvited")}</p>
                <strong>${data.length}</strong>
            </div>
            <div class="stat-item">
                <p>${this.$t("attendance.totalAttended")}</p>
                <strong>${attendedCount}</strong>
            </div>
            <div class="stat-item">
                <p>${this.$t("attendance.attendanceRate")}</p>
                <strong>${
                  data.length > 0
                    ? Math.round((attendedCount / data.length) * 100)
                    : 0
                }%</strong>
            </div>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>${this.$t("attendance.name")}</th>
                <th>${this.$t("attendance.email")}</th>
                <th>${this.$t("attendance.role")}</th>
                <th>${this.$t("attendance.rsvpStatus")}</th>
                <th>${this.$t("attendance.attended")}</th>
            </tr>
        </thead>
        <tbody>
`;

        data.forEach((p) => {
          const isAttended = p.attendded === "true" || p.attendded === true;
          htmlContent += `
            <tr class="${isAttended ? "attended" : ""}">
                <td>${p.full_name || ""}</td>
                <td>${p.email || ""}</td>
                <td><span class="type-${p.type || "guest"}">${
            this.getTypeDisplayName(p.type) ||
            this.$t("attendance.roleTypes.guest")
          }</span></td>
                <td><span class="rsvp-${p.RSVPStatus || "pending"}">${
            this.getRSVPDisplayName(p.RSVPStatus) ||
            this.$t("attendance.rsvpStatuses.pending")
          }</span></td>
                <td>${
                  isAttended
                    ? "✓ " + this.$t("attendance.yes")
                    : "✗ " + this.$t("attendance.no")
                }</td>
            </tr>
          `;
        });

        htmlContent += `
        </tbody>
    </table>
</body>
</html>
        `;

        this.downloadFile(
          htmlContent,
          `attendance-report-${timestamp}.html`,
          "text/html"
        );
      } catch (error) {
        console.error(this.$t("attendance.pdfExportError"), error);
      }
    },
    downloadFile(content, filename, contentType) {
      try {
        const dataUrl =
          "data:" +
          contentType +
          ";charset=utf-8," +
          encodeURIComponent(content);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error(this.$t("attendance.downloadFailed"), error);
      }
    },
  },
};
</script>

<style scoped>
.attendance-tracker {
  background: #d9d9d9;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* Header */
.header {
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
}

.stat-value.purple {
  color: #6e3894;
}

.stat-value.green {
  color: #255f0b;
}

.stat-value.yellow {
  color: #c4951b;
}

/* Controls */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #404040;
  background: transparent;
  transition: all 0.2s;
}

.filter-tab input[type="radio"] {
  display: none;
}

.tab-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: transparent;
  transition: all 0.2s;
}

.filter-tab.active {
  background: #f3f4f6;
  color: #1a1a1a;
  font-weight: 500;
}

.filter-tab.active .tab-dot {
  border-color: #6e3894;
  background: #6e3894;
}

/* Export Button */
.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #FFF;
  color: #43235C;
  border: 1px solid #43235C;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}


.export-menu {
  position: absolute;
  right: 0;
  top: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}

.export-option {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: white;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.export-option:hover {
  background: #f9fafb;
}

/* Table */
.participant-table {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1fr 80px;
  gap: 16px;
  padding: 12px 20px;
  background: #fafbfb;
  font-size: 12px;
  font-weight: 600;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1fr 1fr 80px;
  gap: 16px;
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
  align-items: center;
  transition: background 0.15s;
  background-color: #ffffff;
}

.table-row:hover {
  background: #fafafa;
}

.col-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.col-email {
  font-size: 14px;
  /* color: #6b7280; */
}

/* Role Badges */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.role-chairperson {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.role-vice_chair {
  background: #e0e7ff;
  color: #6e3894;
}

.role-badge.role-secretary {
  background: #e0e7ff;
  color: #6e3894;
}

.role-badge.role-member {
  background: #e0e7ff;
  color: #255f0b;
}

.role-badge.role-guest {
  background: #e0e7ff;
  color: #a92525;
}

/* RSVP Badges */
.rsvp-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.rsvp-badge.rsvp-pending {
  background: #ebdcb3;
  color: #c4951b;
}

.rsvp-badge.rsvp-going {
  background: #b6caae;
  color: #255f0b;
}

.rsvp-badge.rsvp-notgoing {
  background: #fee2e2;
  color: #991b1b;
}

/* Attendance Badges */
.attendance-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.attendance-badge.present {
  background: #b6caae;
  color: #255f0b;
}

.attendance-badge.absent {
  background: #e2b6b6;
  color: #a92525;
}

/* Action Button */
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .attendance-tracker {
    padding: 16px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-tabs {
    justify-content: center;
  }

  .btn-export {
    width: 100%;
    justify-content: center;
  }

  .table-header {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }

  .table-row > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table-row > div::before {
    content: attr(class);
    font-weight: 600;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
  }

  .col-actions {
    justify-content: flex-end;
  }
}
</style>
