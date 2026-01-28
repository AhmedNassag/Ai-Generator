<template>
  <v-navigation-drawer
    v-model="internalDrawer"
    :width="drawerWidth"
    color="#43235C"
    app
    clipped
    :permanent="true"
    :style="{ zIndex: isExpanded && isTabletOrBelow ? 1003 : 1000 }"
    :location="isRTL ? 'right' : 'left'"
  >
   <!-- User Info -->
    <div 
      class="rtl px-3 py-2 d-flex align-center justify-content-start user-info-clickable"
      @click="$router.push('/profile')"
      style="cursor: pointer; transition: background-color 0.2s ease;"
      @mouseenter="$event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'"
      @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
    >
      <div class="rtl d-flex justify-content-start  align-center">
        <v-avatar 
          size="33" 
          :style="{ backgroundColor: '#A16BC7' }"
          class="user-avatar"
        >
          <span class="avatar-text">{{ getInitial(Auth.USER.full_name) }}</span>
        </v-avatar>
        <p v-if="isExpanded" :class="['user-name mb-0', isRTL ? 'mr-2' : 'ml-2']">
          {{ Auth.USER.full_name || $t('menu.User_Profile') }}
        </p>
      </div>
    </div>

    <!-- Search (only when expanded) -->
    <div v-if="isExpanded" class="search-wrapper">
      <v-menu
        v-model="showSearchResults"
        :close-on-content-click="false"
        location="bottom"
        :offset="[0, 8]"
        max-height="500"
        transition="scale-transition"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            v-bind="props"
            v-model="searchQuery"
            :prepend-inner-icon="isRTL ? undefined : 'mdi-magnify'"
            :append-inner-icon="isRTL ? 'mdi-magnify' : undefined"
            hide-details
            variant="outlined"
            density="compact"
            :placeholder="$t('menu.Search')"
            class="w-100 pl-1 pr-3 text-search custom-search-icon"
            bg-color="grey-lighten-4"
            style="caret-color: #43235c !important;"
            @input="handleSearch"
            @keydown.enter="handleSearch"
            @click:clear="clearSearch"
            @focus="handleSearchFocus"
          >
            <template v-slot:append-inner v-if="!isRTL">
              <v-btn
                v-if="searchQuery"
                icon="mdi-close"
                variant="text"
                size="small"
                @click="clearSearch"
                style="opacity: 0.6"
              />
              <span v-else class="text-caption grey--text" style="color: #0000001a">⌘/</span>
            </template>
            <template v-slot:prepend-inner v-if="isRTL">
              <v-btn
                v-if="searchQuery"
                icon="mdi-close"
                variant="text"
                size="small"
                @click="clearSearch"
                style="opacity: 0.6"
              />
              <span v-else class="text-caption grey--text" style="color: #0000001a">⌘/</span>
            </template>
          </v-text-field>
        </template>

        <v-card
          v-if="searchQuery && (searchResults.length || !searchResults.length)"
          elevation="8"
          class="search-dropdown"
          color="#43235C"
          :style="{ width: drawerWidth - 16 + 'px' }"
        >
          <!-- Search Results -->
          <div v-if="searchResults.length" class="search-results-content">
            <div class="pa-3">
              <p class="text-caption text-white mb-2">
                {{ $t('menu.Search_Results') }} ({{ searchResults.length }})
              </p>
              <v-list class="search-results-list" style="background: transparent;">
                <v-list-item
                  v-for="(result, index) in searchResults"
                  :key="index"
                  :to="result.path"
                  class="search-result-item-dropdown"
                  @click="selectSearchResult(result)"
                >
                  <template v-slot:prepend>
                    <div :class="isRTL ? 'ml-3' : 'mr-3'">
                      <component
                        :is="result.iconComponent"
                        v-if="result.iconComponent"
                      />
                      <v-icon v-else-if="result.icon" color="white">{{ result.icon }}</v-icon>
                      <span v-else-if="result.icon1" class="stroke-icon menu-icon">
                        <i :class="result.icon1"></i>
                      </span>
                    </div>
                  </template>
                  <v-list-item-title class="search-result-title-dropdown">
                    <span v-html="highlightSearchTerm($t(result.title))"></span>
                  </v-list-item-title>
                  <v-list-item-subtitle
                    v-if="result.parentTitle"
                    class="search-result-path-dropdown"
                  >
                    {{ $t(result.parentTitle) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="pa-3">
            <p class="text-caption text-white-50 mb-0">
              {{ $t('menu.No_results_found') }} "{{ searchQuery }}"
            </p>
          </div>
        </v-card>
      </v-menu>
    </div>

    <!-- Regular Menu -->
    <v-list v-if="!searchQuery" nav class="flex-grow-1 menu-scroll-area">
      <p v-if="isExpanded" class="pl-2 mt-4 text-start">{{ $t('menu.Dashboard') }}</p>

      <!-- Dynamic Menu Items -->
      <template v-for="(menu, index) in filteredMenuItems" :key="index">
        <!-- Expanded View -->
        <div v-if="isExpanded">
          <v-expansion-panels
            flat
            :model-value="isChildActive(menu.children) ? [0] : []"
          >
            <v-expansion-panel
              :class="{ 'active-parent': isChildActive(menu.children) }"
            >
              <v-expansion-panel-title class="rtl">
                <div class="rtl d-flex align-center">
                  <div :class="isRTL ? 'ml-3' : 'mr-3'">
                    <component
                      :is="menu.iconComponent"
                      v-if="menu.iconComponent"
                    />
                    <v-icon v-else-if="menu.icon" class="ms-0">{{ menu.icon }}</v-icon>
                    <span v-else-if="menu.icon1" class="stroke-icon menu-icon">
                      <i :class="menu.icon1"></i>
                    </span>
                  </div>
                  <v-list-item-title>{{ $t(menu.headTitle1) }}</v-list-item-title>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list>
                  <template
                    v-for="(child, childIndex) in menu.children"
                    :key="childIndex"
                  >
                    <!-- Handle nested children -->
                    <template v-if="child.children && child.children.length">
                      <v-expansion-panels
                      
                        flat
                        :model-value="isChildActive(child.children) ? [0] : []"
                      >
                        <v-expansion-panel
                          :class="{
                            'active-parent': isChildActive(child.children),
                          }"
                        >
                          <v-expansion-panel-title class="rtl">
                            <v-list-item-title>{{
                              $t(child.title)
                            }}</v-list-item-title>
                          </v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <v-list>
                              <template
                                v-for="(subChild, subIndex) in child.children"
                                :key="subIndex"
                              >
                                <template
                                  v-if="
                                    subChild.children &&
                                    subChild.children.length
                                  "
                                >
                                  <v-expansion-panels
                                    flat
                                    :model-value="
                                      isChildActive(subChild.children)
                                        ? [0]
                                        : []
                                    "
                                  >
                                    <v-expansion-panel
                                      :class="{
                                        'active-parent': isChildActive(
                                          subChild.children
                                        ),
                                      }"
                                    >
                                      <v-expansion-panel-title class="rtl">
                                        <v-list-item-title>{{
                                          $t(subChild.title)
                                        }}</v-list-item-title>
                                      </v-expansion-panel-title>
                                      <v-expansion-panel-text>
                                        <v-list>
                                          <v-list-item
                                            v-for="(
                                              nestedChild, nestedIndex
                                            ) in subChild.children"
                                            :key="nestedIndex"
                                            :to="nestedChild.path"
                                            :class="{
                                              'active-item': isActive(
                                                nestedChild.path,
                                                nestedChild.matchPaths
                                              ),
                                            }"
                                          >
                                            <v-list-item-title>{{
                                              $t(nestedChild.title)
                                            }}</v-list-item-title>
                                          </v-list-item>
                                        </v-list>
                                      </v-expansion-panel-text>
                                    </v-expansion-panel>
                                  </v-expansion-panels>
                                </template>
                                <v-list-item
                                  v-else
                                  :to="subChild.path"
                                  :class="{
                                    'active-item': isActive(subChild.path, subChild.matchPaths),
                                  }"
                                >
                                  <v-list-item-title>{{
                                    $t(subChild.title)
                                  }}</v-list-item-title>
                                </v-list-item>
                              </template>
                            </v-list>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </template>

                    <v-list-item
                      v-else
                      :to="child.path"
                      :class="{ 'active-item': isActive(child.path, child.matchPaths) }"
                    >
                      <v-list-item-title>{{ $t(child.title) }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <!-- Collapsed View -->
        <div v-else class="menu-item-wrapper collapsed-menu my-2">
          <v-menu
            open-on-hover
            v-model="activeMenus[index]"
            :close-on-content-click="false"
            :location="isRTL ? 'bottom start' : 'bottom end'"
            :offset="[0, 8]"
            min-width="250"
            :close-delay="100"
            :open-delay="50"
            transition="scale-transition"
            :origin="isRTL ? 'top end' : 'top start'"
            @update:model-value="handleMenuToggle(index, $event)"
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="collapsed-menu-item"
                :class="{ 'active-icon': isMenuActive(menu) }"
              >
                <template v-slot:prepend>
                  <div class="d-flex align-center">
                    <component
                      :is="menu.iconComponent"
                      v-if="menu.iconComponent"
                    />
                    <v-icon v-else-if="menu.icon">{{ menu.icon }}</v-icon>
                    <span v-else-if="menu.icon1" class="stroke-icon menu-icon">
                      <i :class="menu.icon1"></i>
                    </span>
                  </div>
                </template>
              </v-list-item>
            </template>

            <v-card
              elevation="4"
              class="menu-popup enhanced-popup"
              style="min-width: 250px"
            >
              <div class="pa-2">
                <div
                  class="d-flex align-center pa-2 rtl"
                  style="color: #43235c; font-weight: 600"
                >
                  <div :class="isRTL ? 'ml-3' : 'mr-3'">
                    <component
                      :is="menu.iconComponent"
                      v-if="menu.iconComponent"
                    />
                    <v-icon v-else-if="menu.icon">{{ menu.icon }}</v-icon>
                    <span v-else-if="menu.icon1" class="stroke-icon menu-icon">
                      <i
                        style="color: #43235c !important"
                        :class="menu.icon1"
                      ></i>
                    </span>
                  </div>
                  <span>{{ $t(menu.headTitle1) }}</span>
                </div>
                <v-divider class="my-1" />
                <v-list class="pa-0" style="color: #43235c">
                  <template
                    v-for="(child, childIndex) in menu.children"
                    :key="`child-${childIndex}`"
                  >
                    <template v-if="child.children && child.children.length">
                      <v-list-group
                        :value="child.title"
                        :style="{
                          '--v-list-group-header-prepend-width': '0',
                          borderLeft: isRTL ? 'none' : '#ccc 1px solid',
                          borderRight: isRTL ? '#ccc 1px solid' : 'none',
                          marginLeft: isRTL ? '0' : '12px',
                          marginRight: isRTL ? '12px' : '0'
                        }"
                      >
                        <template v-slot:activator="{ props: groupProps }">
                          <v-list-item
                            v-bind="groupProps"
                            class="menu-group-item"
                            density="compact"
                          >
                            <v-list-item-title
                              style="color: #43235c; font-size: 14px"
                            >
                              {{ $t(child.title) }}
                            </v-list-item-title>
                          </v-list-item>
                        </template>

                        <template
                          v-for="(subChild, subIndex) in child.children"
                          :key="`sub-${subIndex}`"
                        >
                          <template
                            v-if="subChild.children && subChild.children.length"
                          >
                            <v-list-group
                              :value="subChild.title"
                              :style="{
                                '--v-list-group-header-prepend-width': '0',
                                borderLeft: isRTL ? 'none' : '#ccc 1px solid',
                                borderRight: isRTL ? '#ccc 1px solid' : 'none',
                                marginLeft: isRTL ? '0' : '12px',
                                marginRight: isRTL ? '12px' : '0'
                              }"
                              sub-group
                            >
                              <template
                                v-slot:activator="{ props: subGroupProps }"
                              >
                                <v-list-item
                                  v-bind="subGroupProps"
                                  class="menu-group-item"
                                  density="compact"
                                >
                                  <v-list-item-title
                                    style="color: #43235c; font-size: 13px"
                                  >
                                    {{ $t(subChild.title) }}
                                  </v-list-item-title>
                                </v-list-item>
                              </template>

                              <v-list-item
                                v-for="(
                                  nestedChild, nestedIndex
                                ) in subChild.children"
                                :key="`nested-${nestedIndex}`"
                                :to="nestedChild.path"
                                density="compact"
                                :class="[isRTL ? 'pr-8' : 'pl-8', {
                                  'active-item': isActive(nestedChild.path),
                                }]"
                                @click="closeMenu(index)"
                              >
                                <v-list-item-title
                                  style="color: #43235c; font-size: 12px"
                                >
                                  {{ $t(nestedChild.title) }}
                                </v-list-item-title>
                              </v-list-item>
                            </v-list-group>
                          </template>
                          <v-list-item
                            v-else
                            :to="subChild.path"
                            density="compact"
                            :class="[isRTL ? 'pr-6' : 'pl-6', { 'active-item': isActive(subChild.path) }]"
                            @click="closeMenu(index)"
                          >
                            <v-list-item-title
                              style="color: #43235c; font-size: 13px"
                            >
                              {{ $t(subChild.title) }}
                            </v-list-item-title>
                          </v-list-item>
                        </template>
                      </v-list-group>
                    </template>

                    <v-list-item
                      v-else
                      :to="child.path"
                      density="compact"
                      :class="{ 'active-item': isActive(child.path, child.matchPaths) }"
                      @click="closeMenu(index)"
                    >
                      <v-list-item-title
                        style="color: #43235c; font-size: 14px"
                      >
                        {{ $t(child.title) }}
                      </v-list-item-title>
                    </v-list-item>
                  </template>
                </v-list>
              </div>
            </v-card>
          </v-menu>
        </div>
      </template>
    </v-list>

    <!-- Logout Button at Bottom -->
    <div class="logout-section mt-auto w-100">
      <!-- Expanded View Logout -->
      <v-list-item
        v-if="isExpanded"
        @click="handleLogout"
        class="logout-menu-item"
      >
        <template v-slot:prepend>
          <div :class="isRTL ? 'ml-3' : 'mr-3'">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="logout-icon"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        </template>
        <v-list-item-title class="logout-text">{{ $t('menu.Logout') }}</v-list-item-title>
      </v-list-item>

      <!-- Collapsed View Logout -->
      <v-list-item
        v-else
        @click="handleLogout"
        class="collapsed-menu-item logout-menu-item"
      >
        <template v-slot:prepend>
          <div class="d-flex align-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="logout-icon"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        </template>
      </v-list-item>
    </div>

  </v-navigation-drawer>
  
  <!-- Overlay -->
  <div 
    v-if="isExpanded && isTabletOrBelow" 
    class="sidebar-overlay"
    @click="collapseOnMobile"
  ></div>
</template>

<script>
import { onMounted, ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useMenuStore } from "@/store/menu";
import { useI18n } from "vue-i18n";
import Auth from "@/API/Auth";
import { debounce } from "lodash-es";

export default {
  name: "DynamicSidebar",
  props: {
    width: { type: Number, default: 250 },
    drawer: { type: Boolean, default: true },
  },
  emits: ["update:drawer"],
  setup(props, { emit }) {
    const store = useMenuStore();
    const route = useRoute();
    const { t } = useI18n();
    const internalDrawer = ref(props.drawer);
    
    const isRTL = ref(
      document.documentElement.dir === 'rtl' || 
      document.documentElement.getAttribute('lang') === 'ar' ||
      localStorage.getItem('selectedLanguageCode') === 'ar'
    );
    
    const updateRTLStatus = () => {
      const newRTL = document.documentElement.dir === 'rtl' || 
                     document.documentElement.getAttribute('lang') === 'ar' ||
                     localStorage.getItem('selectedLanguageCode') === 'ar';
      
      if (newRTL !== isRTL.value) {
        isRTL.value = newRTL;
      }
    };
    
    let dirObserver = null;
    
    watch(
      () => props.drawer,
      (v) => (internalDrawer.value = v)
    );
    watch(internalDrawer, (v) => emit("update:drawer", v));

    const isTabletOrBelow = computed(() => window.innerWidth < 1024);

    const getInitialDrawerWidth = () => {
      const screenWidth = window.innerWidth;
      const savedWidth = Number(localStorage.getItem("sidebar:width"));
      
      if (savedWidth) {
        return savedWidth;
      }
      
      if (screenWidth < 1024) {
        return 56;
      }
      
      return props.width || 250;
    };

    const drawerWidth = ref(getInitialDrawerWidth());
    const isExpanded = computed(() => drawerWidth.value >= 250);

    const activeMenus = ref([]);
    const expandedMain = ref([]);
    const collapsedOpen = ref([]);

    const searchQuery = ref("");
    const searchResults = ref([]);
    const showSearchResults = ref(false);

    const menuItems = computed(() => store.data);
    const staticPages = ref([
      { title: "menu.User_Profile", path: "/profile", icon: "mdi-account" },
    ]);

    const filteredMenuItems = computed(() =>
      !searchQuery.value ? menuItems.value : []
    );
    const filteredStaticPages = computed(() =>
      !searchQuery.value ? staticPages.value : []
    );

    const isActive = (path, matchPaths = []) => {
      if (!path) return false;

      if (route.path === path) return true;

      if (matchPaths && matchPaths.length > 0) {
        return matchPaths.some(matchPath => {
          if (matchPath.includes(':')) {
            const regexPattern = matchPath.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(route.path);
          }

          if (route.path === matchPath) return true;

          if (route.path.startsWith(matchPath + '/')) return true;

          return false;
        });
      }

      return false;
    };

    const isChildActive = (children) => {
      if (!children || !Array.isArray(children)) return false;

      return children.some((child) => {
        if (child.path) {
          const result = isActive(child.path, child.matchPaths);
          if (result) return true;
        }

        if (child.children && Array.isArray(child.children)) {
          return isChildActive(child.children);
        }

        return false;
      });
    };

    const isMenuActive = (menu) => {
      if (menu.path) {
        return isActive(menu.path, menu.matchPaths);
      }

      if (menu.children && Array.isArray(menu.children)) {
        return isChildActive(menu.children);
      }

      return false;
    };

    const buildSearchIndex = () => {
      const items = [];

      const processMenuItems = (menuItems, parentTitle = "") => {
        menuItems.forEach((item) => {
          if (item.children) {
            processMenuItems(
              item.children,
              parentTitle
                ? `${parentTitle} > ${item.title || item.headTitle1}`
                : item.title || item.headTitle1
            );
          } else if (item.path) {
            items.push({
              title: item.title,
              path: item.path,
              parentTitle: parentTitle,
              icon: item.icon,
              icon1: item.icon1,
              iconComponent: item.iconComponent,
              type: "menu",
              matchPaths: item.matchPaths || []
            });
          }
        });
      };

      menuItems.value.forEach((menu) => {
        if (menu.children) {
          processMenuItems(menu.children, menu.headTitle1);
        } else if (menu.path) {
          items.push({
            title: menu.title || menu.headTitle1,
            path: menu.path,
            parentTitle: menu.headTitle1,
            icon: menu.icon,
            icon1: menu.icon1,
            iconComponent: menu.iconComponent,
            type: "menu",
            matchPaths: menu.matchPaths || []
          });
        }
      });

      staticPages.value.forEach((page) => {
        items.push({
          title: page.title,
          path: page.path,
          parentTitle: "menu.Pages",
          icon: page.icon,
          iconComponent: page.iconComponent,
          type: "page",
          matchPaths: page.matchPaths || []
        });
      });

      return items;
    };

    const performSearch = (q) => {
      if (!q.trim()) {
        searchResults.value = [];
        showSearchResults.value = false;
        return;
      }
      const idx = buildSearchIndex();
      const lower = q.toLowerCase();
      const results = idx.filter(
        (it) => {
          const translatedTitle = t(it.title).toLowerCase();
          const translatedParent = it.parentTitle ? t(it.parentTitle).toLowerCase() : '';
          return translatedTitle.includes(lower) || translatedParent.includes(lower);
        }
      );
      results.sort((a, b) => {
        const aTranslated = t(a.title).toLowerCase();
        const bTranslated = t(b.title).toLowerCase();
        const aExact = aTranslated.startsWith(lower);
        const bExact = bTranslated.startsWith(lower);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return aTranslated.localeCompare(bTranslated);
      });
      searchResults.value = results.slice(0, 10);
      showSearchResults.value = true;
    };

    const debouncedSearch = debounce((q) => performSearch(q), 300);
    const handleSearch = () => debouncedSearch(searchQuery.value);
    const clearSearch = () => {
      searchQuery.value = "";
      searchResults.value = [];
      showSearchResults.value = false;
    };
    const selectSearchResult = () => {
      setTimeout(() => {
        clearSearch();
      }, 150);
    };
    
    const handleSearchFocus = () => {
      if (searchQuery.value && searchResults.value.length > 0) {
        showSearchResults.value = true;
      }
    };
    const highlightSearchTerm = (text) => {
      if (!searchQuery.value) return text;
      const regex = new RegExp(`(${searchQuery.value})`, "gi");
      return text.replace(
        regex,
        '<mark style="background-color:#ffd700;color:#000;padding:1px 3px;border-radius:2px;">$1</mark>'
      );
    };

    const collapseOnMobile = () => {
      if (isTabletOrBelow.value && isExpanded.value) {
        drawerWidth.value = 56;
        localStorage.setItem("sidebar:width", "56");
      }
    };

    const handleResize = () => {
      // Update computed values
    };

    onMounted(() => {
      const initialWidth = getInitialDrawerWidth();
      drawerWidth.value = initialWidth;
      localStorage.setItem("sidebar:width", String(initialWidth));

      updateRTLStatus();
      
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
      
      const checkStorageChange = () => {
        updateRTLStatus();
      };
      window.addEventListener('storage', checkStorageChange);
      
      const storageInterval = setInterval(updateRTLStatus, 500);

      if (isExpanded.value) {
        activeMenus.value = new Array(menuItems.value.length).fill(false);
        expandedMain.value = new Array(menuItems.value.length).fill([0]);
        collapsedOpen.value = new Array(menuItems.value.length).fill([0]);
      }

      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "/") {
          e.preventDefault();
          const input = document.querySelector(".text-search input");
          input && input.focus();
        }
        if (e.key === "Escape" && searchQuery.value) clearSearch();
        if (e.key === "Escape" && isTabletOrBelow.value && isExpanded.value) {
          collapseOnMobile();
        }
      };
      
      document.addEventListener("keydown", onKey);
      window.addEventListener('resize', handleResize);

      return () => {
        document.removeEventListener("keydown", onKey);
        window.removeEventListener('resize', handleResize);
        if (dirObserver) {
          dirObserver.disconnect();
        }
        window.removeEventListener('storage', checkStorageChange);
        clearInterval(storageInterval);
      };
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
      if (dirObserver) {
        dirObserver.disconnect();
      }
    });

    watch(
      () => props.width,
      (val) => {
        if (typeof val === "number") {
          drawerWidth.value = val;
          localStorage.setItem("sidebar:width", String(val));
        }
      }
    );

    watch(drawerWidth, (newWidth) => {
      localStorage.setItem("sidebar:width", String(newWidth));
    });

    const handleLogout = () => Auth.logOut();
    const handleMenuToggle = (index, isOpen) => {
      if (!isOpen) nextTick(() => (activeMenus.value[index] = false));
    };
    const closeMenu = (index) =>
      setTimeout(() => (activeMenus.value[index] = false), 100);

    const getInitial = (fullName) => {
      if (!fullName) return "U";
      const names = fullName.trim().split(/[\s.]+/).filter(n => n.length > 0);
      if (names.length >= 2) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
      return fullName.trim().charAt(0).toUpperCase();
    };

    return {
      Auth,
      t,
      internalDrawer,
      drawerWidth,
      isExpanded,
      isTabletOrBelow,
      isRTL,
      menuItems,
      staticPages,
      activeMenus,
      expandedMain,
      collapsedOpen,
      searchQuery,
      searchResults,
      showSearchResults,
      filteredMenuItems,
      filteredStaticPages,
      route,
      isActive,
      isChildActive,
      isMenuActive,
      handleLogout,
      handleMenuToggle,
      closeMenu,
      handleSearch,
      clearSearch,
      selectSearchResult,
      handleSearchFocus,
      highlightSearchTerm,
      getInitial,
      collapseOnMobile,
    };
  },
};
</script>

<style>
.bg-logo {
  background-color: var(--white) !important;
}
.v-expansion-panel {
  background-color: transparent !important;
  color: white !important;
}

.v-expansion-panel-text .v-list-item.active-item,
.active-item {
  border-radius: 8px !important;
  margin: 5px 0 !important;
  background-color: #5a3e70 !important;
  color: var(--white) !important;
}

.active-item .v-list-item-title {
  font-weight: bold !important;
  color: white !important;
}

.active-parent .v-expansion-panel-title,
.active-parent .v-list-item {
  border-radius: 8px;
}

.active-icon .menu-icon i,
.active-icon .v-icon {
  color: white !important;
}

.active-icon {
  background-color: rgba(90, 62, 112, 0.3) !important;
  border-radius: 8px;
}

.v-list-item--active .menu-icon i {
  color: white !important;
}

.v-expansion-panel-title {
  padding: 0px 8px !important;
}
.v-expansion-panel-text {
  margin-left: 18px;
  margin-right: 0px;
  border-left: 1px solid #cccccc;
  border-right: none;
}

[dir="rtl"] .v-expansion-panel-text {
  margin-left: 0;
  margin-right: 18px;
  border-left: none;
  border-right: 1px solid #cccccc;
}

.v-list-item--density-default.v-list-item--one-line {
  min-height: 24px !important;
}
.v-list-item--density-default:not(.v-list-item--nav).v-list-item--one-line {
  padding: 4px 8px !important;
}

.v-list {
  padding: 0px 4px !important;
}
.v-list-item--nav {
  padding-inline: 12px !important;
}
.v-expansion-panel--active
  > .v-expansion-panel-title:not(.v-expansion-panel-title--static) {
  min-height: 40px;
}
.v-expansion-panel-text__wrapper {
  padding: 0px;
}

.menu-icon i {
  font-size: 1.25rem;
  transition: color 0.2s ease;
}

.menu-icon i:hover,
.active-item .menu-icon i,
.active-parent .menu-icon i {
  color: white !important;
}

.v-list-item:hover:not(.collapsed-menu-item) {
  border-radius: 8px;
}

.collapsed-menu-item:hover {
  background-color: transparent !important;
}

.collapsed-menu-item:hover .v-list-item-title {
  color: inherit !important;
}

.collapsed-menu-item:hover .menu-icon i {
  color: rgba(255, 255, 255, 0.7) !important;
}

.collapsed-menu-item:hover .v-icon {
  color: rgba(255, 255, 255, 0.7) !important;
}

.collapsed-menu-item.active-icon:hover {
  background-color: rgba(90, 62, 112, 0.3) !important;
}

.collapsed-menu-item.active-icon:hover .menu-icon i,
.collapsed-menu-item.active-icon:hover .v-icon {
  color: white !important;
}

* {
  scrollbar-width: thin;
}
.v-navigation-drawer {
  height: calc(100% - 58px) !important;
  top: 58px !important;
  background: #43235c !important;
  transition: all 0.3s ease-in-out !important;
}

.menu-item-wrapper {
  position: relative;
}

.menu-popup.enhanced-popup {
  box-shadow: 0 20px 40px rgba(67, 35, 92, 0.15) !important;
  border-radius: 12px !important;
  animation: slideInBottomRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

[dir="rtl"] .menu-popup.enhanced-popup {
  transform-origin: top right !important;
  animation: slideInBottomLeft 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes slideInBottomRight {
  0% {
    opacity: 0;
    transform: scale(0.8) translate(-15px, -15px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
}

@keyframes slideInBottomLeft {
  0% {
    opacity: 0;
    transform: scale(0.8) translate(15px, -15px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
}

.v-navigation-drawer__content {
  overflow-y: hidden !important;
  scrollbar-width: none;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.v-navigation-drawer__content:hover,
.v-navigation-drawer__content:focus-within,
.v-navigation-drawer__content:active {
  overflow-y: auto !important;
}

.v-navigation-drawer__content::-webkit-scrollbar {
  width: 6px;
}

.v-navigation-drawer__content::-webkit-scrollbar-track {
  background: transparent;
}

.v-navigation-drawer__content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  visibility: hidden;
}

.v-navigation-drawer__content:hover::-webkit-scrollbar-thumb,
.v-navigation-drawer__content:focus-within::-webkit-scrollbar-thumb,
.v-navigation-drawer__content:active::-webkit-scrollbar-thumb {
  visibility: visible;
}

.v-navigation-drawer__content {
  transition: overflow-y 0.3s ease;
}

a:hover {
  color: inherit;
}

.v-list-group__items {
  margin-left: 18px;
}

[dir="rtl"] .v-list-group__items {
  margin-left: 0;
  margin-right: 18px;
  border-left: none;
  border-right: 1px solid #cccccc;
}

.search-wrapper {
  flex-shrink: 0;
  position: relative;
  z-index: 1001;
}

.search-dropdown {
  max-height: 500px;
  overflow: hidden;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  background: #43235C !important;
}

.search-results-content {
  max-height: 450px;
  overflow-y: auto;
}

.search-results-content::-webkit-scrollbar {
  width: 6px;
}

.search-results-content::-webkit-scrollbar-track {
  background: transparent;
}

.search-results-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.search-results-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.search-result-item-dropdown {
  border-radius: 8px !important;
  margin: 4px 0 !important;
  transition: all 0.2s ease;
}

.search-result-item-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.search-result-title-dropdown {
  color: white !important;
  font-size: 14px !important;
  font-weight: 500;
}

.search-result-path-dropdown {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 12px !important;
  margin-top: 2px;
}

.search-result-item-dropdown .menu-icon i {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* CRITICAL FIX: Stable Search Input Height */
.text-search {
  flex-shrink: 0 !important;
}

.text-search .v-field {
  min-height: 40px !important;
  max-height: 40px !important;
  height: 40px !important;
}

.text-search .v-field__input {
  color: #43235c !important;
  min-height: 40px !important;
  max-height: 40px !important;
  height: 40px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  line-height: 40px !important;
  overflow: hidden !important;
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
}

.text-search .v-field__input::placeholder {
  color: rgba(67, 35, 92, 0.6) !important;
}

.text-search .v-field__field {
  height: 40px !important;
  align-items: center !important;
}

.text-search .v-field__outline {
  height: 40px !important;
}

.text-logout {
  font-weight: 700;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-text {
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.sidebar-overlay {
  position: fixed;
  top: 58px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1002;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
[dir="rtl"] .rtl{
flex-direction: row-reverse;
}
[dir="rtl"] .v-expansion-panel-title__icon {
    margin-inline-start: inherit;
}
[dir="rtl"] .v-list-item-title{
display:flex;
flex-direction: row-reverse;
}
[dir="rtl"] .logout-btn{
margin-left: auto;
}
[dir="rtl"] .v-list-item__append .v-list-item__spacer {
    order: 0;
}
[dir="rtl"] .v-list-item {
    grid-template-columns: auto 1fr max-content;
}
@media (max-width: 1023px) {
  .menu-popup.enhanced-popup {
    max-width: calc(100vw - 70px) !important;
  }
}
@media only screen and (max-width: 575.98px) {
  .page-wrapper .page-body-wrapper .page-body {
    padding-left: 56px !important;
  }
  
  [dir="rtl"] .page-wrapper .page-body-wrapper .page-body {
    padding-left: 0 !important;
    padding-right: 56px !important;
  }
}

/* Long Text Handling */
.v-navigation-drawer .v-list-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: block !important;
  line-height: 1.4;
}

.v-expansion-panel-title .v-list-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 170px;
  flex: 1;
  min-width: 0;
}

.v-expansion-panel-text .v-list-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.v-expansion-panel-text .v-expansion-panel-text .v-list-item-title {
  max-width: 140px;
}

.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
  color: white;
  font-weight: 500;
  display: block;
}

.search-result-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: block !important;
}

.search-result-path {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.menu-popup .v-list-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

[dir="rtl"] .v-navigation-drawer .v-list-item-title {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .user-name {
  text-align: right;
}

[dir="rtl"] .search-result-title,
[dir="rtl"] .search-result-path {
  text-align: right;
}

[dir="rtl"] .menu-popup .v-list-item-title {
  text-align: right;
}

[dir="rtl"] .text-search .v-field__input {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .text-search .v-field__input::placeholder {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .text-search .v-field {
  direction: rtl;
}

[dir="rtl"] .text-search .v-field__field {
  flex-direction: row-reverse;
}

/* Logout Section Styles */
.logout-section {
  padding: 8px 0;
  margin-top: auto !important;
  z-index: 9999 !important;
  background: #43235c !important;
  flex-shrink: 0;
}

[dir="rtl"] .logout-section {
  background: #43235c !important;
}

.logout-menu-item {
  border-radius: 8px !important;
  margin: 4px 0 !important;
  transition: all 0.2s ease;
  cursor: pointer;
}

.logout-menu-item:hover {
  background-color: rgba(220, 53, 69, 0.1) !important;
  border-radius: 8px !important;
}

.logout-menu-item:hover .logout-icon {
  stroke: #dc3545 !important;
}

.logout-menu-item:hover .logout-text {
  color: #dc3545 !important;
}

.logout-icon {
  stroke: rgba(255, 255, 255, 0.7);
  transition: stroke 0.2s ease;
}

.logout-text {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  transition: color 0.2s ease;
}

[dir="rtl"] .logout-menu-item .logout-icon {
  transform: scaleX(-1);
}

/* Menu scroll area */
.menu-scroll-area {
  overflow-y: auto !important;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: 16px !important;
}

.menu-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.menu-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.menu-scroll-area::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

@media (max-width: 1400px) {
  .v-expansion-panel-title .v-list-item-title {
    max-width: 150px;
  }
  
  .v-expansion-panel-text .v-list-item-title {
    max-width: 140px;
  }
  
  .user-name {
    max-width: 140px;
  }
}

@media (max-width: 1200px) {
  .v-expansion-panel-title .v-list-item-title {
    max-width: 140px;
  }
  
  .v-expansion-panel-text .v-list-item-title {
    max-width: 130px;
  }
  
  .user-name {
    max-width: 120px;
  }
  
  .menu-popup .v-list-item-title {
    max-width: 180px;
  }
}

@media (max-width: 992px) {
  .v-expansion-panel-title .v-list-item-title {
    max-width: 130px;
  }
  
  .v-expansion-panel-text .v-list-item-title {
    max-width: 120px;
  }
  
  .user-name {
    max-width: 110px;
  }
}

@media (max-width: 768px) {
  .v-expansion-panel-title .v-list-item-title {
    max-width: 120px;
  }
  
  .v-expansion-panel-text .v-list-item-title {
    max-width: 110px;
  }
  
  .user-name {
    max-width: 100px;
  }
  
  .menu-popup .v-list-item-title {
    max-width: 160px;
  }
  
  .search-result-title {
    max-width: 180px;
  }
}

@media (max-width: 576px) {
  .user-name {
    max-width: 90px;
    font-size: 13px;
  }
  
  .menu-popup .v-list-item-title {
    max-width: 140px;
  }
}
</style>
<style>
.v-navigation-drawer__content {
  overflow-y: hidden !important;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  display: flex;
  flex-direction: column;
  height: 100%;
}

.v-navigation-drawer__content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.v-navigation-drawer__content:hover,
.v-navigation-drawer__content:focus-within,
.v-navigation-drawer__content:active {
  overflow-y: auto !important;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.v-navigation-drawer__content:hover::-webkit-scrollbar,
.v-navigation-drawer__content:focus-within::-webkit-scrollbar,
.v-navigation-drawer__content:active::-webkit-scrollbar {
  display: none !important;
}
.menu-scroll-area {
  overflow-y: auto !important;
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: 16px !important;
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE and Edge */
}

.menu-scroll-area::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
}

* {
  scrollbar-width: none !important;
}

*::-webkit-scrollbar {
  display: none !important;
}
</style>