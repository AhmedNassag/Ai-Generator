<template>
  <div class="simplebar-wrapper">
    <div class="simplebar-mask">
      <div class="simplebar-offset">
        <div class="simplebar-content-wrapper">
          <div class="simplebar-content">
            <li class="back-btn">
              <router-link to="/"></router-link>
              <div class="mobile-back text-end">
                <span>Back</span><i class="fa fa-angle-right ps-2" aria-hidden="true"></i>
              </div>
            </li>
            <li class="sidebar-main-title"><div></div></li>
            <li
              class="sidebar-list main-sidebar"
              v-for="(menu, index) in menuItems"
              :key="index"
            >
              <a
                class="sidebar-link sidebar-title"
                :class="menu.headTitle1 === activeParent ? 'active' : ''"
                href="javascript:void(0)"
                @click="toggleParent(menu.headTitle1)"
              >
                <span class="stroke-icon menu-icon">
                  <i :class="menu.icon1"></i>
                </span>
                <span class="head-title">{{ menu.headTitle1 }}</span>
              </a>

              
              <ul
                class="sidebar-submenu custom-scrollbar"
                :data-parent="menu.headTitle1"
                :class="menu.headTitle1 === store.perentName ? 'd-block' : 'd-none'"
              >
                <li class="sidebar-head">{{ menu.headTitle2 }}</li>

                
                <li
                  class="main-submenu"
                  v-for="(child, cIndex) in menu.children"
                  :key="cIndex"
                >
                  <a
                    v-if="child.type === 'sub'"
                    class="d-flex sidebar-menu"
                    href="javascript:void(0)"
                    :class="child.title === activeSub ? 'active' : ''"
                    @click="toggleSub(child.title, menu.headTitle1)"
                  >
                    <span class="stroke-icon custom-icon">
                      <i :class="child.icon1" style="color:#361A49"></i>
                    </span>
                    <p class="ml-2 mb-0">{{ child.title }}</p>
                    <svg class="arrow">
                      <use href="@/assets/svg/icon-sprite.svg#Arrow-right"></use>
                    </svg>
                  </a>

                  <!-- رابط فرعى عادى -->
                  <router-link
                    v-else
                    :to="child.path"
                    class="d-flex sidebar-menu"
                    :class="child.title === activeSub ? 'active' : ''"
                    @click="selectLink(child.title, menu.headTitle1)"
                  >
                    <span class="stroke-icon custom-icon">
                      <i :class="child.icon1" style="color:#361A49"></i>
                    </span>
                    <span class="ml-2 custom-title">{{ child.title }}</span>
                  </router-link>

                 
                  <ul
                    v-if="child.type === 'sub'"
                    class="submenu-wrapper"
                    :class="child.title === store.subName ? 'd-block' : 'd-none'"
                  >
                    <li
                      v-for="(subChild, sIndex) in child.children"
                      :key="sIndex"
                    >
                 
                      <router-link
                        v-if="subChild.type === 'link'"
                        :to="subChild.path"
                        @click="saveMenuState(subChild.title, child.title, menu.headTitle1)"
                        :class="subChild.title === activeChild ? 'active' : ''"
                      >
                        {{ subChild.title }}
                      </router-link>

                   
                      <a
                        v-else
                        class="submenu-title"
                        href="javascript:void(0)"
                        :class="subChild.title === activeChild ? 'active' : ''"
                        @click="toggleSubChild(subChild.title, child.title, menu.headTitle1)"
                      >
                        {{ subChild.title }}
                        <i
                          class="fa pull-right mt-1"
                          :class="subChild.title === store.childName ? 'fa fa-angle-down' : 'fa fa-angle-right'"
                          v-if="subChild.children"
                        ></i>
                      </a>

              
                      <ul
                        v-if="subChild.children"
                        class="nav-sub-childmenu submenu-content"
                        :class="subChild.title === store.childName ? 'd-block' : 'd-none'"
                      >
                        <li v-for="(sub, i) in subChild.children" :key="i">
                          <router-link
                            :to="sub.path"
                            @click="saveMenuState(sub.title, subChild.title, child.title, menu.headTitle1)"
                            :class="{ active: isActive(sub.path) }"
                          >
                            {{ sub.title }}
                          </router-link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/* Pinia + Vue Router */
import { useMenuStore } from '@/store/menu';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const store = useMenuStore();
const menuItems = store.data;
const route = useRoute();


const activeParent = ref('');
const activeSub = ref('');
const activeChild = ref('');


function toggleParent(title: string) {
  if (store.perentName === title) {
    
    store.perentName = '';
    activeParent.value = '';
  } else {
   
    store.perentName = title;
    activeParent.value = title;
  }
  
  store.subName = '';
  store.childName = '';
  activeSub.value = '';
  activeChild.value = '';
  saveState();
}

function toggleSub(title: string, parentTitle: string) {
  if (store.subName === title) {
  
    store.subName = '';
    activeSub.value = '';
  } else {
   
    store.subName = title;
    activeSub.value = title;
    activeParent.value = parentTitle;
  }
 
  store.childName = '';
  activeChild.value = '';
  saveState();
}


function toggleSubChild(title: string, subTitle: string, parentTitle: string) {
  if (store.childName === title) {
  
    store.childName = '';
    activeChild.value = '';
  } else {
   
    store.childName = title;
    activeChild.value = title;
    activeSub.value = subTitle;
    activeParent.value = parentTitle;
  }
  saveState();
}


function saveMenuState(
  childTitle: string,
  subTitle: string,
  parentTitle: string
) {
  activeParent.value = parentTitle;
  activeSub.value = subTitle;
  activeChild.value = childTitle;
  store.perentName = '';
  store.subName = '';
  store.childName = '';

  saveState();
}

function selectLink(title: string, parentTitle: string) {
  activeParent.value = parentTitle;
  activeSub.value = title;
  activeChild.value = '';
  store.perentName = '';
  store.subName = '';
  store.childName = '';

  saveState();
}

function isActive(path: string) {
  return route.path === path;
}

function saveState() {
  localStorage.setItem(
    'sidebarState',
    JSON.stringify({
      activeParent: activeParent.value,
      activeSub: activeSub.value,
      activeChild: activeChild.value
    })
  );
}

function loadState() {
  const raw = localStorage.getItem('sidebarState');
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    activeParent.value = parsed.activeParent;
    activeSub.value = parsed.activeSub;
    activeChild.value = parsed.activeChild;
    store.perentName = parsed.activeParent;
    store.subName = parsed.activeSub;
    store.childName = parsed.activeChild;
  } catch (_) {
  
  }
}


watch(
  () => route.path,
  () => {
    store.perentName = '';
    store.subName = '';
    store.childName = '';
    activeParent.value = '';
    activeSub.value = '';
    activeChild.value = '';
  }
);

/* Mount / Unmount */
onMounted(loadState);
onUnmounted(() => document.removeEventListener('click', closeOnOutside));


function closeOnOutside(e: MouseEvent) {
  const sidebar = document.querySelector('.sidebar-wrapper');
  if (sidebar && !sidebar.contains(e.target as Node)) {
    store.perentName = '';
    store.subName = '';
    store.childName = '';
    activeParent.value = '';
    activeSub.value = '';
    activeChild.value = '';
  }
}
document.addEventListener('click', closeOnOutside);
</script>

<style>
/* Base styles from original component */
.page-wrapper.compact-sidebar .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links li a.active span {
    color: #FFF;
}

.page-wrapper.compact-small .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links .sidebar-list {
    padding: 20px 0 !important;
}

.page-wrapper.compact-sidebar .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links li a.active {
    position: relative;
    display: inline-block;
}

.page-wrapper.compact-sidebar .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links li a.active::after {
    content: "";
    position: absolute;
    height: 2px;
    bottom: -6px;
    left: 50%;
    background-color: #ffffff;
    width: 100%;
    transform: translateX(-50%);
}

li.sidebar-list.main-sidebar {
    transition: none;
}

li.sidebar-list.main-sidebar:hover {
    background: #361A49 !important;
}

li.sidebar-list.main-sidebar:hover > a .menu-icon {
    animation: iconMenu 1.5s infinite ease-in-out;
}

li.sidebar-list.main-sidebar .menu-icon {
    animation: none;
}

@keyframes iconMenu {
    0%{
        padding-top: 0px;
    }
    50%{
        padding-top: 6px;
    }
    100%{
        padding-top: 0px;
    }
}

/* Fix icon display for all menu items */
.stroke-icon.custom-icon {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    min-width: 20px;
}

.stroke-icon.custom-icon i {
    display: block !important;
    font-size: 16px;
    color: #361A49 !important;
}

/* Ensure icons show for both dropdown and non-dropdown items */
.d-flex.sidebar-menu .stroke-icon.custom-icon {
    visibility: visible !important;
    opacity: 1 !important;
}

.submenu-wrapper .active {
    font-weight: bold !important;
    position: relative !important;
}

.submenu-wrapper .active::after {
    content: "" !important;
    position: absolute !important;
    bottom: -2px !important;
    left: 50% !important;
    width: 100% !important;
    height: 2px !important;
    background-color: #361A49 !important;
}

.d-flex.sidebar-menu.active {
    font-weight: bold !important;
}

.main-submenu:hover {
    transform: translateY(-5px);
}

.main-submenu {
    transition: transform 0.3s ease;
}

.page-wrapper.compact-small .sidebar-list {
    border-top: 1px solid #9FA6AB;
}

/* New styles for smooth sidebar animation */
.page-wrapper.compact-sidebar .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links li .sidebar-submenu {
    position: fixed;
    top: 76px;
    height: calc(100vh - 75px);
    overflow: auto;
    left: 100px;
    width: 265px;
    background-color: #fff;
    transition: all 1s ease; 
    padding-top: 20px;
    z-index: -1; 
}

/* Add a new class for the closed state */
.page-wrapper.compact-sidebar .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links li .sidebar-submenu.d-none {
    left: -265px;  
    opacity: 0;
    transition: all 1s ease;  
    z-index: -1;
}

/* Ensure display:none happens after transition completes */
.page-wrapper.compact-sidebar .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links li .sidebar-submenu {
    display: block !important;  
}

.page-wrapper.compact-sidebar .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links li .sidebar-submenu.d-none {
    animation: hideSubmenu 1s forwards;
}

@keyframes hideSubmenu {
    0% {
        visibility: visible;
    }
    99% {
        visibility: visible;
    }
    100% {
        visibility: hidden;
    }
}

/* Animation class for closing state */
.sidebar-submenu.closing {
    left: -265px !important;
    opacity: 0 !important;
    transition: all 1s ease !important;
}

.page-wrapper .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links .simplebar-wrapper .simplebar-mask .simplebar-content-wrapper .simplebar-content > li a.active svg.stroke-icon {
    stroke: #ffffff !important;
}

.page-wrapper .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links .simplebar-wrapper .simplebar-mask .simplebar-content-wrapper .simplebar-content > li a.active svg.custom-icon {
    stroke: #44225c !important;
}

.submenu-wrapper.active-menu-wrapper {
    display: block !important;
    left: 0px !important;
    opacity: 1 !important;
    z-index: 2 !important;
}

/* When sidebar item is active, ensure its submenu styles are properly set */
.sidebar-submenu.d-block .main-submenu .d-flex.sidebar-menu.active + .submenu-wrapper {
    display: block !important;
    height: auto;
    overflow: visible;
    opacity: 1;
    transform: translateX(0);
    transition: all 1s ease;
}

/* Add important flag to ensure active submenu-wrapper is visible */
.d-flex.sidebar-menu.active + .submenu-wrapper.d-block {
    display: block !important;
}

/* Override the d-none class specifically for submenu-wrapper when related to active menu */
.d-flex.sidebar-menu.active + .submenu-wrapper.d-none {
    display: block !important;
    left: 0px !important;
    opacity: 1 !important;
    z-index: 2 !important;
}

/* Ensure submenu containing active child stays visible */
.submenu-wrapper .active {
    font-weight: bold !important;
    position: relative !important;
    visibility: visible !important;
}

.page-wrapper.compact-small .page-body-wrapper div.sidebar-wrapper .sidebar-main .sidebar-links .sidebar-list .sidebar-submenu .main-submenu .d-flex {
    color: #44225c;
}

li.sidebar-list.main-sidebar {
    transition: none; 
}

li.sidebar-list.main-sidebar:hover {
    background: #361A49 !important;
}

li.sidebar-list.main-sidebar:hover > a .menu-icon {
    animation: iconScale 1.5s infinite ease-in-out;
}

li.sidebar-list.main-sidebar .menu-icon {
    animation: none;
    transition: all 0.3s ease; 
}

@keyframes iconScale {
    0%{
        transform: scale(1);
    }
    50%{
        transform: scale(1.6);
    }
    100%{
        transform: scale(1);
    }
}
span.custom-title {
    color:#361A49 !important ;
}
</style>