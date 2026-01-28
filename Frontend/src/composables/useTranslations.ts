// src/composables/useTranslations.ts
import { ref } from "vue";
import { getI18n } from "@/main";
import Translate from "@/API/Translate/Translate";

const translateApi = new Translate();
const loadedModules = ref<Set<string>>(new Set());

interface TranslationEntry {
  [key: string]: string;
}

interface TranslationGroup {
  name: string;
  [key: string]: any;
}

function processModuleTranslations(
  moduleData: TranslationGroup,
  langCode: string
) {
  const processed: { [key: string]: string } = {};

  if (moduleData[langCode] && Array.isArray(moduleData[langCode])) {
    moduleData[langCode].forEach((trans: TranslationEntry) => {
      Object.entries(trans).forEach(([key, value]) => {
        if (typeof value === "string") {
          processed[key] = value;
        }
      });
    });
  }

  return processed;
}

export function useTranslations() {
  const i18n: any = getI18n();


  const loadMultipleModules = async (
    moduleNames: string[]
  ): Promise<boolean[]> => {
    if (!moduleNames || moduleNames.length === 0) {
      return [];
    }

    const currentLocale = i18n.global.locale.value.toLowerCase();
    const langCode = currentLocale.split("-")[0];

    // Filter out already loaded modules
    const modulesToLoad = moduleNames.filter((name) => {
      const moduleKey = `${currentLocale}-${name}`;
      return !loadedModules.value.has(moduleKey);
    });

    // If all modules are already loaded, return success
    if (modulesToLoad.length === 0) {
      console.log("All modules already loaded");
      return moduleNames.map(() => true);
    }

    try {
      console.log(
        `Loading ${modulesToLoad.length} modules: ${modulesToLoad.join(", ")}`
      );

      // Single API call with filterIn for multiple modules
      const translations = (await translateApi.getAll({
        select: `id|name|${langCode}`,
        filterIn: `name|${modulesToLoad.join(",")}`,
      })) as TranslationGroup[];

      if (!translations || translations.length === 0) {
        console.warn("No translations found for modules:", modulesToLoad);
        return moduleNames.map(() => false);
      }

      // Process each module
      const existingMessages = i18n.global.messages.value[currentLocale] || {};
      const updatedMessages = { ...existingMessages };

      translations.forEach((moduleData) => {
        const moduleName = moduleData.name;
        const processed = processModuleTranslations(moduleData, langCode);
        updatedMessages[moduleName] = processed;

        // Mark as loaded
        const moduleKey = `${currentLocale}-${moduleName}`;
        loadedModules.value.add(moduleKey);
      });

      // Update i18n with all modules at once
      i18n.global.setLocaleMessage(currentLocale, updatedMessages);

      console.log(`✅ Successfully loaded ${translations.length} modules`);

      // Return success status for each requested module
      return moduleNames.map((name) => {
        const moduleKey = `${currentLocale}-${name}`;
        return loadedModules.value.has(moduleKey);
      });
    } catch (error) {
      console.error("Failed to load modules:", error);
      return moduleNames.map(() => false);
    }
  };

  const clearLoadedModules = () => {
    loadedModules.value.clear();
  };

  const isModuleLoaded = (moduleName: string): boolean => {
    const currentLocale = i18n.global.locale.value.toLowerCase();
    // console.log('Current Locale:', i18n.global.locale);
    const moduleKey = `${currentLocale}-${moduleName}`;
    return loadedModules.value.has(moduleKey);
  };

  return {
    loadMultipleModules,
    clearLoadedModules,
    isModuleLoaded,
  };
}
