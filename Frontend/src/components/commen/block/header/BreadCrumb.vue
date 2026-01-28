<template>
  <v-app class="bread-crumb" elevation="0">
    <v-container class="d-flex align-center" :style="containerStyle">
      <div
        class="rtl d-flex justify-content-between align-items-center w-100 flex-wrap-responsive"
      >
        <div
          class="d-flex justify-content-between align-items-center breadcrumb-wrapper"
        >
          <ol class="breadcrumb">
           <li
  v-if="$route.name !== 'Dashboard'"
  class="breadcrumb-item mt-1"
>
              <a href="/dashboard" class="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="feather feather-home vue-feather__content"
                >
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  ></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </a>
            </li>
            <li v-if="mainPage" class="breadcrumb-item">{{ mainPage }}</li>
            <li v-if="mainSubPage" class="breadcrumb-item">
              {{ mainSubPage }}
            </li>
            <li v-if="subPage" class="breadcrumb-item active">{{ subPage }}</li>
          </ol>
        </div>

        <div
          class="rtl d-flex justify-content-between align-items-center actions-wrapper"
        >
          <language-view></language-view>

          <div class="dropdown">
            <button
              class="btn btn-link text-decoration-none dropdown-toggle p-2"
              type="button"
              id="settingsDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <g clip-path="url(#clip0_415_13902)">
                  <path
                    d="M9.99992 12.5C11.3806 12.5 12.4999 11.3807 12.4999 10C12.4999 8.6193 11.3806 7.50001 9.99992 7.50001C8.61921 7.50001 7.49992 8.6193 7.49992 10C7.49992 11.3807 8.61921 12.5 9.99992 12.5Z"
                    stroke="#667085"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M16.1666 12.5C16.0557 12.7514 16.0226 13.0302 16.0716 13.3005C16.1206 13.5708 16.2495 13.8203 16.4416 14.0167L16.4916 14.0667C16.6465 14.2215 16.7695 14.4053 16.8533 14.6076C16.9372 14.8099 16.9804 15.0268 16.9804 15.2458C16.9804 15.4649 16.9372 15.6817 16.8533 15.8841C16.7695 16.0864 16.6465 16.2702 16.4916 16.425C16.3368 16.58 16.153 16.7029 15.9507 16.7868C15.7483 16.8706 15.5314 16.9138 15.3124 16.9138C15.0934 16.9138 14.8765 16.8706 14.6742 16.7868C14.4719 16.7029 14.288 16.58 14.1332 16.425L14.0833 16.375C13.8869 16.1829 13.6374 16.054 13.3671 16.005C13.0967 15.956 12.8179 15.9891 12.5666 16.1C12.3201 16.2056 12.1099 16.381 11.9618 16.6046C11.8138 16.8282 11.7343 17.0902 11.7333 17.3583V17.5C11.7333 17.942 11.5577 18.366 11.2451 18.6785C10.9325 18.9911 10.5086 19.1667 10.0666 19.1667C9.62456 19.1667 9.20063 18.9911 8.88807 18.6785C8.57551 18.366 8.39992 17.942 8.39992 17.5V17.425C8.39347 17.1492 8.30418 16.8817 8.14368 16.6573C7.98317 16.4328 7.75886 16.2619 7.49992 16.1667C7.24857 16.0557 6.96976 16.0227 6.69943 16.0717C6.4291 16.1207 6.17965 16.2496 5.98325 16.4417L5.93325 16.4917C5.77846 16.6466 5.59465 16.7696 5.39232 16.8534C5.18999 16.9373 4.97311 16.9805 4.75408 16.9805C4.53506 16.9805 4.31818 16.9373 4.11585 16.8534C3.91352 16.7696 3.72971 16.6466 3.57492 16.4917C3.41996 16.3369 3.29703 16.1531 3.21315 15.9507C3.12928 15.7484 3.08611 15.5315 3.08611 15.3125C3.08611 15.0935 3.12928 14.8766 3.21315 14.6743C3.29703 14.4719 3.41996 14.2881 3.57492 14.1333L3.62492 14.0833C3.81703 13.8869 3.94591 13.6375 3.99492 13.3672C4.04394 13.0968 4.01085 12.818 3.89992 12.5667C3.79428 12.3202 3.61888 12.11 3.39531 11.9619C3.17173 11.8139 2.90974 11.7344 2.64159 11.7333H2.49992C2.05789 11.7333 1.63397 11.5577 1.32141 11.2452C1.00885 10.9326 0.833252 10.5087 0.833252 10.0667C0.833252 9.62465 1.00885 9.20073 1.32141 8.88817C1.63397 8.5756 2.05789 8.40001 2.49992 8.40001H2.57492C2.85075 8.39356 3.11826 8.30427 3.34267 8.14377C3.56708 7.98326 3.73801 7.75896 3.83325 7.50001C3.94418 7.24866 3.97727 6.96985 3.92826 6.69952C3.87924 6.42919 3.75037 6.17974 3.55825 5.98334L3.50825 5.93334C3.35329 5.77855 3.23036 5.59474 3.14649 5.39241C3.06261 5.19008 3.01944 4.9732 3.01944 4.75418C3.01944 4.53515 3.06261 4.31827 3.14649 4.11594C3.23036 3.91361 3.35329 3.7298 3.50825 3.57501C3.66304 3.42005 3.84685 3.29712 4.04918 3.21324C4.25151 3.12937 4.46839 3.0862 4.68742 3.0862C4.90644 3.0862 5.12332 3.12937 5.32565 3.21324C5.52798 3.29712 5.7118 3.42005 5.86658 3.57501L5.91658 3.62501C6.11298 3.81712 6.36243 3.946 6.63276 3.99501C6.90309 4.04403 7.1819 4.01094 7.43325 3.90001H7.49992C7.74639 3.79437 7.9566 3.61897 8.10466 3.3954C8.25272 3.17182 8.33218 2.90983 8.33325 2.64168V2.50001C8.33325 2.05798 8.50885 1.63406 8.82141 1.3215C9.13397 1.00894 9.55789 0.833344 9.99992 0.833344C10.4419 0.833344 10.8659 1.00894 11.1784 1.3215C11.491 1.63406 11.6666 2.05798 11.6666 2.50001V2.57501C11.6677 2.84317 11.7471 3.10516 11.8952 3.32873C12.0432 3.55231 12.2534 3.72771 12.4999 3.83334C12.7513 3.94427 13.0301 3.97736 13.3004 3.92835C13.5707 3.87933 13.8202 3.75046 14.0166 3.55834L14.0666 3.50834C14.2214 3.35338 14.4052 3.23045 14.6075 3.14658C14.8098 3.0627 15.0267 3.01953 15.2458 3.01953C15.4648 3.01953 15.6817 3.0627 15.884 3.14658C16.0863 3.23045 16.2701 3.35338 16.4249 3.50834C16.5799 3.66313 16.7028 3.84695 16.7867 4.04928C16.8706 4.25161 16.9137 4.46848 16.9137 4.68751C16.9137 4.90654 16.8706 5.12341 16.7867 5.32574C16.7028 5.52807 16.5799 5.71189 16.4249 5.86668L16.3749 5.91668C16.1828 6.11308 16.0539 6.36252 16.0049 6.63285C15.9559 6.90318 15.989 7.182 16.0999 7.43334V7.50001C16.2056 7.74648 16.381 7.95669 16.6045 8.10475C16.8281 8.25282 17.0901 8.33227 17.3583 8.33334H17.4999C17.9419 8.33334 18.3659 8.50894 18.6784 8.8215C18.991 9.13406 19.1666 9.55798 19.1666 10C19.1666 10.442 18.991 10.866 18.6784 11.1785C18.3659 11.4911 17.9419 11.6667 17.4999 11.6667H17.4249C17.1568 11.6677 16.8948 11.7472 16.6712 11.8953C16.4476 12.0433 16.2722 12.2535 16.1666 12.5Z"
                    stroke="#667085"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_415_13902">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </button>
            <ul
              ref="dropdownMenu"
              :class="[
                'dropdown-menu super-dropdown',
                isRTL ? 'dropdown-menu-start' : 'dropdown-menu-end',
              ]"
              aria-labelledby="settingsDropdown"
            >
              <!-- ✅ DEFAULT / FOUNDED SETTINGS -->
              <li v-if="!hideDefaultSettings">
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="handleDropdownClick(goToNotificationSetting)"
                >
                  <v-icon :class="isRTL ? 'ms-2' : 'me-2'">mdi-bell</v-icon>
                  <span>Notification Setting</span>
                </a>
              </li>

              <li v-if="!hideDefaultSettings">
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="handleDropdownClick(goToLogSetting)"
                >
                  <v-icon :class="isRTL ? 'ms-2' : 'me-2'"
                    >mdi-file-document</v-icon
                  >
                  <span>Log Setting</span>
                </a>
              </li>
              <!-- Divider -->
              <li v-if="extraSettings.length">
                <hr class="dropdown-divider" />
              </li>

              <!-- Dynamic page settings -->
              <li v-for="(item, index) in extraSettings" :key="index">
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="handleDropdownClick(item.action)"
                >
                  <v-icon class="me-2">{{ item.icon }}</v-icon>
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>

          <notificationBox></notificationBox>
        </div>
      </div>
    </v-container>
  </v-app>
</template>

<script>
import { Dropdown } from "bootstrap";
import { inject, computed } from "vue";
import { useRouter } from "vue-router";
import languageView from "./languageView.vue";
import notificationBox from "./notificationBox.vue";

export default {
  components: {
    "language-view": languageView,
    notificationBox: notificationBox,
  },
  data() {
    return {
      mainPage: "",
      subPage: "",
      mainSubPage: "",
      titlePage: "",
      dataBreadCrumbl: {},
    };
  },
  props: {
    extraSettings: {
      type: Array,
      default: () => [],
    },
    hideDefaultSettings: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const drawerWidth = inject("drawerWidth", 56);
    const router = useRouter();

    const isRTL = computed(() => {
      return (
        document.documentElement.dir === "rtl" ||
        document.documentElement.getAttribute("lang") === "ar" ||
        localStorage.getItem("language") === "ar"
      );
    });

    return {
      drawerWidth,
      router,
      isRTL,
    };
  },
  computed: {
    containerStyle() {
      // Add padding to account for the toggle button (56px)
      const sideProperty = this.isRTL ? "padding-right" : "padding-left";

      return {
        padding: "5px 24px 5px 24px ",
        [sideProperty]: "80px ", // 56px (button) + 24px (spacing)
        transition: "padding 0.3s ease-in-out",
      };
    },
  },
  created() {
    this.updateBreadcrumbData();
  },
  mounted() {
    new Dropdown(document.getElementById("settingsDropdown"));
    this.updateBreadcrumbData();

    window.addEventListener("breadcrumb-update", this.handleBreadcrumbUpdate);
  },
  beforeUnmount() {
    window.removeEventListener(
      "breadcrumb-update",
      this.handleBreadcrumbUpdate
    );
  },
  watch: {
    "$route.fullPath"(newPath, oldPath) {
      // Clear breadcrumb data on route change and wait for new data
      this.clearBreadcrumbData();

      // Use nextTick to ensure the update happens after route change
      this.$nextTick(() => {
        setTimeout(() => {
          this.updateBreadcrumbData();
        }, 100); // Small delay to ensure MainPage has time to set breadcrumb data
      });
    },
  },
  methods: {
    //METHOD: Handle dropdown clicks properly
    handleDropdownClick(action) {
      // Close the dropdown first
      if (this.dropdownInstance) {
        this.dropdownInstance.hide();
      }

      // Wait a bit for dropdown to close, then execute action
      setTimeout(() => {
        if (typeof action === "function") {
          action();
        }
      }, 100);
    },
    clearBreadcrumbData() {
      this.mainPage = "";
      this.subPage = "";
      this.mainSubPage = "";
      this.titlePage = "";
      this.dataBreadCrumbl = {};

      // Also clear the global breadcrumb data
      if (typeof window !== "undefined") {
        window.dataBreadCrumb = null;
      }
    },
    updateBreadcrumbData() {
      if (typeof window !== "undefined") {
        if (window.dataBreadCrumb) {
          // Update with new breadcrumb data
          this.mainPage = window.dataBreadCrumb.mainPage || "";
          this.subPage = window.dataBreadCrumb.subPage || "";
          this.mainSubPage = window.dataBreadCrumb.mainSubPage || "";
          this.titlePage = window.dataBreadCrumb.titlePage || "";
          this.dataBreadCrumbl = window.dataBreadCrumb;
        } else {
          // Clear breadcrumb data when no data is available
          this.mainPage = "";
          this.subPage = "";
          this.mainSubPage = "";
          this.titlePage = "";
          this.dataBreadCrumbl = {};
        }
      }
    },
    handleBreadcrumbUpdate(event) {
      if (event.detail) {
        this.mainPage = event.detail.mainPage || "";
        this.subPage = event.detail.subPage || "";
        this.mainSubPage = event.detail.mainSubPage || "";
        this.titlePage = event.detail.titlePage || "";
        this.dataBreadCrumbl = event.detail;
      } else {
        // Clear breadcrumb when event has no detail
        this.mainPage = "";
        this.subPage = "";
        this.mainSubPage = "";
        this.titlePage = "";
        this.dataBreadCrumbl = {};
      }
    },
    goToNotificationSetting() {
      this.router.push({
        name: "NotificationSetting",
        params: { filterProp: this.$router.currentRoute.value.name },
      });
    },
    goToLogSetting() {
      this.router.push({
        name: "LogSetting",
        params: { model: this.$router.currentRoute.value.name },
      });
    },
  },
};
</script>
<style>
.max-width-200 {
  max-width: 200px;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.4);
  font-size: 14px;
}

/* LTR Separator - بعد الكلمة */
.breadcrumb-item + .breadcrumb-item::before {
  display: inline-block;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  color: rgba(0, 0, 0, 0.4);
  content: "/";
}

[dir="rtl"] .breadcrumb,
[dir="rtl"] .rtl {
  flex-direction: row-reverse;
}

[dir="rtl"] .breadcrumb-item + .breadcrumb-item::before {
  display: none;
  content: none;
}

[dir="rtl"] .breadcrumb-item + .breadcrumb-item::after {
  display: inline-block;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  color: rgba(0, 0, 0, 0.4);
  content: "/";
}

.breadcrumb-item.active {
  color: #000;
}

.breadcrumb-item a {
  text-decoration: none;
}

.breadcrumb-item a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.vue-feather {
  display: inline-block;
  width: 1em;
  height: 1em;
}

.dropdown-toggle {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: inherit;
  outline: none;
}

.dropdown-toggle::after {
  display: none !important;
}

.super-dropdown {
  z-index: 9999 !important;
  position: fixed !important;
  top: 0px !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.super-dropdown.dropdown-menu-end {
  right: 20px !important;
  left: auto !important;
}

.super-dropdown.dropdown-menu-start {
  left: 20px !important;
  right: auto !important;
}

[dir="rtl"] .super-dropdown.dropdown-menu-end {
  left: 20px !important;
  right: auto !important;
}

.dropdown-item {
  padding: 0.5rem 1.5rem;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  color: #333;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.dropdown-item .v-icon {
  font-size: 1.25rem;
  color: inherit;
}

.v-overlay__content {
  z-index: 99999 !important;
}

.v-btn {
  min-width: auto !important;
}

.v-container {
  transition: padding 0.3s ease-in-out !important;
}

.breadcrumb {
  transition: all 0.3s ease-in-out;
}

.dropdown,
button {
  transition: all 0.3s ease-in-out;
}

/* ===== Responsive Styles ===== */

/* Tablet - أقل من 992px */
@media (max-width: 991px) {
  .breadcrumb-item {
    font-size: 13px;
  }

  [dir="rtl"] .v-container,
  .v-container {
    padding-left: 0px !important;
  }

  [dir="rtl"] .v-container {
    padding-right: 0px !important;
    padding-left: 16px !important;
  }

  .actions-wrapper > * {
    transform: scale(0.9);
  }
}

/* Mobile - أقل من 768px */
@media (max-width: 767px) {
  .breadcrumb-item {
    font-size: 12px;
  }

  .breadcrumb-item + .breadcrumb-item::before,
  [dir="rtl"] .breadcrumb-item + .breadcrumb-item::after {
    padding-right: 0.25rem;
    padding-left: 0.25rem;
  }

  .v-container {
    padding: 5px 2px 5px 0px !important;
  }

  [dir="rtl"] .v-container,
  .v-container {
    padding-left: 65px !important;
  }

  [dir="rtl"] .v-container {
    padding-right: 65px !important;
    padding-left: 10px !important;
  }

  .actions-wrapper {
    gap: 2px;
  }

  .actions-wrapper > * {
    transform: scale(0.85);
  }

  .dropdown-toggle {
    padding: 0.25rem;
  }
}

/* Small Mobile - أقل من 576px */
@media (max-width: 575px) {
  .breadcrumb {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
    max-width: calc(100vw - 200px);
  }

  .breadcrumb::-webkit-scrollbar {
    height: 3px;
  }

  .breadcrumb::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .breadcrumb::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  .breadcrumb::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .breadcrumb-item {
    font-size: 11px;
    white-space: nowrap;
  }

  .breadcrumb-item + .breadcrumb-item::before,
  [dir="rtl"] .breadcrumb-item + .breadcrumb-item::after {
    padding-right: 0.2rem;
    padding-left: 0.2rem;
  }

  .actions-wrapper {
    gap: 0px;
  }

  .actions-wrapper > * {
    transform: scale(0.75);
  }

  :deep(.v-container) {
    padding: 5px 2px 5px 0px !important;
  }

  [dir="rtl"] .v-container,
  .v-container {
    padding-left: 0px !important;
  }

  [dir="rtl"] .v-container {
    padding-right: 0px !important;
    padding-left: 8px !important;
  }
}

/* Extra Small Mobile - أقل من 400px */
@media (max-width: 399px) {
  .breadcrumb {
    max-width: calc(100vw - 180px);
  }

  .breadcrumb-item {
    font-size: 10px;
  }

  .feather-home {
    width: 14px !important;
    height: 14px !important;
  }

  .actions-wrapper > * {
    transform: scale(0.7);
  }

  .v-container {
    padding: 5px 6px 5px 6px !important;
  }

  [dir="rtl"] .v-container,
  .v-container {
    padding-left: 58px !important;
  }

  [dir="rtl"] .v-container {
    padding-right: 58px !important;
    padding-left: 6px !important;
  }
}
</style>
