// composables/useNotifyLogSetting.ts
import { inject, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

// Type definitions
interface ModelConfig {
  label: string;
  model: string;
}

interface HeaderSetting {
  label: string;
  icon: string;
  action: (router: any) => void;
}

type RegisterHeaderFn = (items: HeaderSetting[], hideDefaults: boolean) => void;
type ClearHeaderFn = () => void;

/**
 * Composable for managing notification and log settings in header
 * Uses Vue's provide/inject pattern for reliable parent-child communication
 *
 * @param {Array} models - Array of model configurations with just label and model name
 * @param {boolean} hideDefaults - Whether to hide default settings
 *
 * Example usage in component:
 *
 * setup() {
 *   useNotifyLogSetting([
 *     { label: "Agenda", model: "Agenda" }
 *   ], true);
 * }
 *
 * Or in mounted():
 * mounted() {
 *   useNotifyLogSetting([
 *     { label: "Agenda", model: "Agenda" },
 *     { label: "Meeting", model: "Meeting" }
 *   ], false);
 * }
 */
export function useNotifyLogSetting(
  models: ModelConfig[] = [],
  hideDefaults: boolean = false
) {
  const registerHeaderSettings = inject<RegisterHeaderFn>(
    "registerHeaderSettings"
  );
  const clearHeaderSettings = inject<ClearHeaderFn>("clearHeaderSettings");
  const router = useRouter();

  // Warn if parent hasn't provided the functions
  if (!registerHeaderSettings) {
    console.warn(
      "registerHeaderSettings is not provided! Make sure parent layout uses provide()"
    );
    return;
  }

  // Static icons - centralized
  const NOTIFICATION_ICON = "mdi-bell";
  const LOG_ICON = "mdi-file-document";

  /**
   * Generate settings array from simple model configs
   * Handles all routing and icon logic centrally
   */
  const generateSettings = (models: ModelConfig[]): HeaderSetting[] => {
    const settings: HeaderSetting[] = [];

    models.forEach(({ label, model }) => {
      // Add Notification Setting
      settings.push({
        label: `${label} Notification Setting`,
        icon: NOTIFICATION_ICON,
        action: (router) => {
          router.push({
            name: "NotificationSetting",
            params: { filterProp: model },
          });
        },
      });

      // Add Log Setting
      settings.push({
        label: `${label} Log Setting`,
        icon: LOG_ICON,
        action: (router) => {
          router.push({
            name: "LogSetting",
            params: { model: model },
          });
        },
      });
    });

    return settings;
  };

  // Generate settings from models
  if (models.length > 0) {
    const settings = generateSettings(models);

    // Wrap each action to automatically pass router
    const processedSettings = settings.map((item) => ({
      ...item,
      action: () => item.action(router),
    }));

    // Register settings with parent layout
    registerHeaderSettings(processedSettings, hideDefaults);

    console.log("✅ Registered header settings", {
      count: processedSettings.length,
      hideDefaults,
    });
  }

  // Cleanup on component unmount
  onBeforeUnmount(() => {
    if (clearHeaderSettings) {
      clearHeaderSettings();
      console.log("🧹 Cleared header settings");
    }
  });

  return {
    generateSettings,
  };
}
