<template>
  <v-menu
    v-model="active"
    :close-on-content-click="false"
    location="bottom start"
    offset="4"
    :attach="false"
    content-class="language-dropdown-menu"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="outlined"
        class="text-none" 
        style="background-color: #F5F7FA;"
        :prepend-icon="`flag-icon flag-icon-${selectedLanguage?.flag}`"
      >
        {{ selectedLanguage?.code }}
        <v-icon class="ml-1">mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <v-card min-width="250">
      <v-list density="compact">
        <v-list-item
          v-for="lang in languages"
          :key="lang.id"
          @click="selectLanguage(lang)"
          class="cursor-pointer"
        >
          <template v-slot:prepend>
            <i :class="`flag-icon flag-icon-${lang.flag} m-rtl`"></i>
          </template>
          
          <v-list-item-title>
            {{ lang.name }}
          </v-list-item-title>
          
          <template v-slot:append>
            <span class="text-medium-emphasis text-caption">
              {{ lang.code }}
            </span>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { i18n } from '@/main';
import language from "@/API/Language/Language";

const { t } = useI18n();

interface Language {
  id: string;
  code: string;
  name: string;
  order: number;
  rtl: string;
  flag: string;
}

const active = ref<boolean>(false);
const languages = ref<Language[]>([]);
const selectedLanguage = ref<Language | null>(null);
const languageApi = new language();

async function fetchLanguages() {
  try {
    const response = await languageApi.getAll() as Language[];
    languages.value = response.sort((a: Language, b: Language) => 
      Number(a.order) - Number(b.order)
    );
    
    // Load saved language from localStorage if available
    const savedLangCode = localStorage.getItem('selectedLanguageCode');
    const savedLang = languages.value.find(lang => lang.code.toLowerCase() === savedLangCode?.toLowerCase());
    if (savedLang) {
      (i18n.global.locale as any).value = savedLang.code.toLowerCase();
      selectedLanguage.value = savedLang;
      document.documentElement.dir = savedLang.rtl === 'true' ? 'rtl' : 'ltr';
    } else if (!selectedLanguage.value && languages.value.length > 0) {
      selectedLanguage.value = languages.value[0];
      document.documentElement.dir = languages.value[0].rtl === 'true' ? 'rtl' : 'ltr';
    }
  } catch (error) {
    console.error('Error fetching languages:', error);
  }
}

function selectLanguage(language: Language) {
  active.value = false;
  
  // Change language
  const newLocale = language.code.toLowerCase();
  (i18n.global.locale as any).value = newLocale;
  selectedLanguage.value = language;
  
  // Save selected language code to localStorage
  localStorage.setItem('selectedLanguageCode', newLocale);
  
  // Set direction based on RTL flag
  document.documentElement.dir = language.rtl === 'true' ? 'rtl' : 'ltr';
  
  // Refresh page to reload all translations
  window.location.reload();
}

onMounted(() => {
  fetchLanguages();
});

// Force position the dropdown to the right when it opens
watch(active, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const dropdownElement = document.querySelector('.language-dropdown-menu .v-overlay__content') as HTMLElement;
      if (dropdownElement) {
        dropdownElement.style.position = 'fixed';
        dropdownElement.style.right = '20px';
        dropdownElement.style.left = 'auto';
        dropdownElement.style.transform = 'none';
        dropdownElement.style.zIndex = '9999';
      }
    });
  }
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

/* Ensure flag icons display properly */
.flag-icon {
  width: 20px;
  height: 15px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
}

.v-btn--variant-outlined {
  border: none !important;
}

/* Force dropdown to appear from the right - Override Vuetify positioning */
.language-dropdown-menu .v-overlay__content {
  position: fixed !important;
  right: 83px !important;
  left: auto !important;
  transform: none !important;
  top: auto !important;
}

/* Alternative strong override for all v-menu overlays with this class */
.v-overlay.language-dropdown-menu .v-overlay__content,
.v-overlay .v-overlay__content.language-dropdown-menu {
  position: fixed !important;
  right: 83px !important;
  left: auto !important;
  transform: none !important;
}
[dir="rtl"] .v-overlay.language-dropdown-menu .v-overlay__content,
[dir="rtl"] .v-overlay .v-overlay__content.language-dropdown-menu {
  position: fixed !important;
  left: 83px !important;
  right: auto !important;
  transform: none !important;
}

[dir="rtl"] .v-overlay.language-dropdown-menu .v-overlay__content,
[dir="rtl"] .v-overlay .v-overlay__content.language-dropdown-menu {
  position: fixed !important;
  left: 83px !important;
  right: auto !important;
  transform: none !important;
}

/* If the above doesn't work, use this nuclear option */
.language-dropdown-menu {
  position: fixed !important;
  right: 83px !important;
  left: auto !important;
  transform: none !important;
  z-index: 9999 !important;
}
[dir="rtl"] .v-list-item {
  grid-template-areas: "append content prepend";
  grid-template-columns: auto 1fr max-content;
}

.m-rtl {
  margin-left: 0px;
  margin-right: 8px;
}

[dir="rtl"] .m-rtl {
  margin-left: 8px;
  margin-right: 0px;
}
</style>