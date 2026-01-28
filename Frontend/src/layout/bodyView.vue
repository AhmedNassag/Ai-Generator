<template>
  <v-app class="app-container">
    <!-- Header -->
    <div class="bg-logo w-100 position-fixed top-0" :class="isRTL ? 'logo-rtl' : 'logo-ltr'" 
    style="height: 58px !important;"
   >
      <v-img :src="isRTL ? logortl : logo" max-width="200" max-height="180" contain />
    </div>
    <v-app-bar
      app
      style="z-index: 1000;"
      :style="appBarStyle"
      clipped-left
      color="white"
      elevation="0"
    >
      <template v-slot:prepend>
        <div class="toggle-btn-wrapper" @click="toggleDrawerWidth">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6.875 3.75V16.25H3.125C2.95924 16.25 2.80027 16.1842 2.68306 16.0669C2.56585 15.9497 2.5 15.7908 2.5 15.625V4.375C2.5 4.20924 2.56585 4.05027 2.68306 3.93306C2.80027 3.81585 2.95924 3.75 3.125 3.75H6.875Z" fill="black" fill-opacity="0.04"/>
            <path d="M16.875 3.125H3.125C2.79348 3.125 2.47554 3.2567 2.24112 3.49112C2.0067 3.72554 1.875 4.04348 1.875 4.375V15.625C1.875 15.9565 2.0067 16.2745 2.24112 16.5089C2.47554 16.7433 2.79348 16.875 3.125 16.875H16.875C17.2065 16.875 17.5245 16.7433 17.7589 16.5089C17.9933 16.2745 18.125 15.9565 18.125 15.625V4.375C18.125 4.04348 17.9933 3.72554 17.7589 3.49112C17.5245 3.2567 17.2065 3.125 16.875 3.125ZM3.125 11.875H4.375C4.54076 11.875 4.69973 11.8092 4.81694 11.6919C4.93415 11.5747 5 11.4158 5 11.25C5 11.0842 4.93415 10.9253 4.81694 10.8081C4.69973 10.6908 4.54076 10.625 4.375 10.625H3.125V9.375H4.375C4.54076 9.375 4.69973 9.30915 4.81694 9.19194C4.93415 9.07473 5 8.91576 5 8.75C5 8.58424 4.93415 8.42527 4.81694 8.30806C4.69973 8.19085 4.54076 8.125 4.375 8.125H3.125V6.875H4.375C4.54076 6.875 4.69973 6.80915 4.81694 6.69194C4.93415 6.57473 5 6.41576 5 6.25C5 6.08424 4.93415 5.92527 4.81694 5.80806C4.69973 5.69085 4.54076 5.625 4.375 5.625H3.125V4.375H6.25V15.625H3.125V11.875ZM16.875 15.625H7.5V4.375H16.875V15.625Z" fill="black"/>
          </svg>
        </div>
      </template>
            <!-- <BreadCrumb /> -->
       <BreadCrumb :extra-settings="headerSettings" :hide-default-settings="hideDefaultSettings"/>

    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-wrapper">
      <div class="page-container">
        <!-- Content Area -->
        <div class="content-area">
          <div
            class="page-wrapper"
            :class="display ? 'compact-sidebar compact-small material-icon' : layoutobj"
            id="pageWrapper"
          >
            <div class="page-body-wrapper">
              <!-- Sidebar section -->
              <sidebarSection :width="drawerWidth" v-model:drawer="drawer" />

              <div class="page-body" :style="pageBodyStyle">
                <div>
                  <transition name="fadeIn" enter-active-class="animated fadeIn">
                    <router-view />
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-main>
     <!-- Footer Area -->
        <div class="footer-area mt-5" :style="footerStyle">
          <footerView />
        </div>
  </v-app>
</template>
<script lang="ts" setup>
import { ref, defineAsyncComponent, watch, onMounted, onBeforeUnmount, provide, computed } from 'vue';
import { useMenuStore } from "@/store/menu";
import { uselayoutStore } from "@/store/layout";
import { storeToRefs } from "pinia";
import logo from "@/assets/CybermodeMenu.png";
import logortl from "@/assets/CybermodeMenu.png";

const footerView = defineAsyncComponent(() => import("@/layout/footerView.vue"));
const BreadCrumb = defineAsyncComponent(() => import("@/components/commen/block/header/BreadCrumb.vue"));
const sidebarSection = defineAsyncComponent(() => import("@/components/commen/block/sidebar/sidebarSection.vue"));

const drawer = ref(true);

// Check if RTL (Arabic language) - with reactive update
const isRTL = ref(
  document.documentElement.dir === 'rtl' ||
  document.documentElement.getAttribute('lang') === 'ar' ||
  localStorage.getItem('selectedLanguageCode') === 'ar'
);


const headerSettings = ref<any[]>([]);
const hideDefaultSettings = ref(false); 
function registerHeaderSettings(items: any[], hideDefaults: boolean = false) {
  headerSettings.value = items;
  hideDefaultSettings.value = hideDefaults;
}

function clearHeaderSettings() {
  headerSettings.value = [];
  hideDefaultSettings.value = false;
}

provide('headerSettings', headerSettings);
provide('registerHeaderSettings', registerHeaderSettings);
provide('clearHeaderSettings', clearHeaderSettings);
provide('hideDefaultSettings', hideDefaultSettings);
// Function to check and update RTL status
const updateRTLStatus = () => {
  const newRTL = document.documentElement.dir === 'rtl' ||
                 document.documentElement.getAttribute('lang') === 'ar' ||
                 localStorage.getItem('selectedLanguageCode') === 'ar';

  if (newRTL !== isRTL.value) {
    isRTL.value = newRTL;
  }
};

// Create MutationObserver to watch for dir changes
let dirObserver: MutationObserver | null = null;

function getInitialDrawerWidth() {
  const screenWidth = window.innerWidth;
  const savedWidth = Number(localStorage.getItem("sidebar:width"));

  if (screenWidth < 768) {
    return 56;
  }

  if (screenWidth < 1024) {
    return 56;
  }

  return savedWidth || 250;
}
const drawerWidth = ref(getInitialDrawerWidth());
provide('drawerWidth', drawerWidth);

const toggleDrawerWidth = () => {
  drawerWidth.value = drawerWidth.value === 56 ? 250 : 56;
  localStorage.setItem("sidebar:width", String(drawerWidth.value));
};

// Computed styles based on RTL
const appBarStyle = computed(() => {
  if (isRTL.value) {
    return {
      right: drawerWidth.value + 'px !important',
      left: 'auto !important',
      width: `calc(100% - ${drawerWidth.value}px) !important`
    };
  }
  return {
    left: drawerWidth.value + 'px !important',
    right: 'auto !important',
    width: `calc(100% - ${drawerWidth.value}px) !important`
  };
});

const pageBodyStyle = computed(() => {
  if (isRTL.value) {
    return { paddingRight: drawerWidth.value + 'px', paddingLeft: '0' };
  }
  return { paddingLeft: drawerWidth.value + 'px', paddingRight: '0' };
});

const footerStyle = computed(() => {
  if (isRTL.value) {
    return { marginRight: drawerWidth.value + 'px', marginLeft: '0' };
  }
  return { marginLeft: drawerWidth.value + 'px', marginRight: '0' };
});

const handleScroll = () => {
  display.value = window.innerWidth <= 1199;

  const screenWidth = window.innerWidth;

  if (screenWidth < 1024 && drawerWidth.value > 56) {
    drawerWidth.value = 56;
    localStorage.setItem("sidebar:width", "56");
  }
};

const layoutobj = ref<any>({});
const sidebar_toggle_var = ref<boolean>(false);
const display = ref<boolean>(false);

const store = useMenuStore();
const storeLayout = uselayoutStore();
const { layout } = storeToRefs(storeLayout);

watch(
  () => layout.value,
  () => {
    layoutobj.value = storeLayout.layout.settings.sidebar_setting;
  },
  { deep: true }
);

watch(
  () => "router",
  () => {
    if (window.innerWidth < 991 && storeLayout.layout.settings.layout === 'Horizontal') {
      const newlayout = JSON.parse(JSON.stringify(layoutobj).replace('horizontal-wrapper', 'compact-wrapper'));
      layoutobj.value = JSON.parse(JSON.stringify(newlayout))[storeLayout.layout.settings.layout];
    } else {
      layoutobj.value = JSON.parse(JSON.stringify(layoutobj))[storeLayout.layout.settings.layout];
    }
  }
);

function sidebar_toggle(value: boolean) {
  sidebar_toggle_var.value = !value;
}

onMounted(() => {
  window.addEventListener('resize', handleScroll);
  layoutobj.value = storeLayout.layout.settings.sidebar_setting;

  // Initial RTL check
  updateRTLStatus();

  // Setup MutationObserver to watch for dir attribute changes
  dirObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' &&
          (mutation.attributeName === 'dir' || mutation.attributeName === 'lang')) {
        updateRTLStatus();
      }
    });
  });

  dirObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dir', 'lang']
  });

  // Watch for localStorage changes from same window
  const checkStorageChange = () => {
    updateRTLStatus();
  };
  window.addEventListener('storage', checkStorageChange);

  // Periodic check for same-window localStorage changes
  const storageInterval = setInterval(updateRTLStatus, 500);

  // Cleanup on unmount
  onBeforeUnmount(() => {
    if (dirObserver) {
      dirObserver.disconnect();
    }
    window.removeEventListener('storage', checkStorageChange);
    clearInterval(storageInterval);
  });

  handleScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleScroll);
});
</script>

<style>
  /* Reset Vuetify defaults */
.v-main {
  padding: 0 !important;
}
  /* App Container */
.app-container {
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
}
/* Main Wrapper */
.main-wrapper {
  flex: 1 !important;
}
.content-area {
  flex: 1 1 auto !important;
  overflow-y: auto !important;
  min-height: 0 !important;
  overflow-x: hidden !important;
  /* background: #f8f8f8 !important; */
}
.page-wrapper.compact-small .page-body-wrapper .page-body {
  margin-left: 0px !important;
  margin-right: 0px !important;
}
[dir="rtl"] .page-wrapper.compact-small .page-body-wrapper .page-body {
  margin-right: 0px !important;
}
/* Page Body */
.page-body {
  transition: padding 0.3s ease-in-out !important;
  background: #F8F8F8;
  padding-bottom: 2rem !important;
}
.footer-area {
  flex: 0 0 auto !important;
  background: white;
  border-top: 1px solid #e5e7eb;
  transition: margin 0.3s ease-in-out !important;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
  /* Other styles */
.primary-bg {
  background-color: #673AB7 !important;
  color: white !important;
}

.v-toolbar__content {
  height: 58px !important;
}

.bg-logo {  
  z-index: 1000;
  height: 5px !important;
}

.v-app-bar {
  transition: all 0.3s ease-in-out !important;
}

.v-app-bar .v-toolbar__prepend {
  margin-inline-start: 0 !important;
}

.v-app-bar .v-toolbar__content {
  padding-inline-start: 0 !important;
}

/* Toggle Button Positioning */
.toggle-btn-wrapper {
  cursor: pointer;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn-wrapper:hover {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
}
  /* Scrollbar styling */
.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.content-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.v-img__img{
    position: absolute;
    top: -13px !important;
    left: -1px !important;
    width: 65% !important;
    height: 100%;
  }
  /* RTL Logo positioning */
[dir="rtl"] .v-img__img {
  left: -3% !important;
}
/* RTL Specific Styles */
.logo-rtl {
  right: 0 !important;
  left: auto !important;
}

.logo-ltr {
  left: 0 !important;
  right: auto !important;
}

/* Mobile (أقل من 768px) */
@media (max-width: 767px) {
  .v-app-bar {
    left: 56px !important;
  }

  [dir="rtl"] .v-app-bar {
    left: auto !important;
    right: 56px !important;
  }

  .page-body {
    padding-left: 56px !important;
    padding-right: 0 !important;
  }

  [dir="rtl"] .page-body {
    padding-left: 0 !important;
    padding-right: 56px !important;
  }

  .footer-area {
    margin-left: 56px !important;
    margin-right: 0 !important;
  }

  [dir="rtl"] .footer-area {
    margin-left: 0 !important;
    margin-right: 56px !important;
    flex-direction:row-reverse;
  }

  .v-breadcrumbs {
    font-size: 12px !important;
  }
}
  /* Tablet (من 768px لـ 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .v-app-bar {
    left: 56px !important;
  }

  [dir="rtl"] .v-app-bar {
    left: auto !important;
    right: 56px !important;
  }

  .page-body {
    padding-left: 56px !important;
    padding-right: 0 !important;
  }

  [dir="rtl"] .page-body {
    padding-left: 0 !important;
    padding-right: 56px !important;
  }

  .footer-area {
    margin-left: 56px !important;
    margin-right: 0 !important;
  }

  [dir="rtl"] .footer-area {
    margin-left: 0 !important;
    margin-right: 56px !important;
  }
}
  @media only screen and (max-width: 575.98px) {
  .page-wrapper .page-body-wrapper .page-body {
    padding-left: 56px !important;
    padding-right: 0 !important;
  }
  [dir="rtl"] .page-wrapper .page-body-wrapper .page-body {
    padding-left: 0 !important;
    padding-right: 56px !important;
  }
}
 [dir="rtl"] .v-toolbar__content{
  flex-direction: row-reverse;
 }
  [dir="rtl"] .v-responsive {
    left: 88.5%;
}
.page-wrapper .page-body-wrapper {
    background-color: #F8F8F8  !important;
    margin-top: 59px !important
}
</style>