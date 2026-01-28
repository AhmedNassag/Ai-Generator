<template>
  <div class="custom-notification-container">
    <div class="notifications-wrapper">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'custom-notification',
          `notification-${notification.type}`,
          notification.show ? 'show' : ''
        ]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <i v-if="notification.type === 'success'" class="fas fa-check-circle"></i>
          <i v-else-if="notification.type === 'error'" class="fas fa-exclamation-circle"></i>
          <i v-else-if="notification.type === 'warning'" class="fas fa-exclamation-triangle"></i>
          <i v-else class="fas fa-info-circle"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ t(notification.title) }}</div>
          <div class="notification-text">{{ t(notification.text) }}</div>
        </div>
        <div class="notification-close" @click.stop="removeNotification(notification.id)">
          <i class="fas fa-times"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Simple translation function using window variable
const t = (key: string) => {
  try {
    const messages = (window as any).__i18nMessages;
    const locale = (window as any).__i18nLocale || 'en';
    
    if (!messages || !messages[locale]) {
      return key;
    }
    
    // Split the key by dots to navigate nested objects
    const keys = key.split('.');
    let value = messages[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Key not found, return original key
      }
    }
    
    return typeof value === 'string' ? value : key;
  } catch (error) {
    console.warn('Translation failed, returning key:', key);
    return key;
  }
};

// Function to check if a string looks like a translation key (e.g., "model.key" or "model.some_key")
const isTranslationKey = (str: string): boolean => {
  // Check if it matches pattern like "word.word" or "word.word_word"
  // Must have at least one dot and contain only alphanumeric, underscores, and dots
  return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/.test(str);
};

// Function to translate Laravel validation error messages
const translateValidationError = (message: string): string => {
  try {
    // First check if the message itself is a translation key (e.g., "department.Cannot_assign_multiple_manager_jobs_to_the_same_department")
    if (isTranslationKey(message)) {
      const translated = t(message);
      // If translation found (different from key), return it
      if (translated !== message) {
        return translated;
      }
    }
    
    // Common Laravel validation error patterns
    const patterns = [
      // Field is required
      {
        regex: /^The (.+) field is required\.$/i,
        translationKey: 'common.required',
        params: ['attribute']
      },
      // Field must be at least X characters
      {
        regex: /^The (.+) must be at least (\d+) characters\.$/i,
        translationKey: 'common.min',
        params: ['attribute', 'min']
      },
      // Field must not be greater than X characters
      {
        regex: /^The (.+) must not be greater than (\d+) characters\.$/i,
        translationKey: 'common.max',
        params: ['attribute', 'max']
      },
      // Field must be a valid email
      {
        regex: /^The (.+) must be a valid email address\.$/i,
        translationKey: 'common.email',
        params: ['attribute']
      },
      // Field must be unique
      {
        regex: /^The (.+) has already been taken\.$/i,
        translationKey: 'common.unique',
        params: ['attribute']
      },
      // Field must be numeric
      {
        regex: /^The (.+) must be a number\.$/i,
        translationKey: 'common.numeric',
        params: ['attribute']
      },
      // Field must be between X and Y
      {
        regex: /^The (.+) must be between (\d+) and (\d+)\.$/i,
        translationKey: 'common.between',
        params: ['attribute', 'min', 'max']
      },
      // Field must be at least X (numeric)
      {
        regex: /^The (.+) must be at least (\d+)\.$/i,
        translationKey: 'common.min_numeric',
        params: ['attribute', 'min']
      },
      // Field must not be greater than X (numeric)
      {
        regex: /^The (.+) must not be greater than (\d+)\.$/i,
        translationKey: 'common.max_numeric',
        params: ['attribute', 'max']
      },
      // Field must be a valid date
      {
        regex: /^The (.+) is not a valid date\.$/i,
        translationKey: 'common.date',
        params: ['attribute']
      },
      // Field must be confirmed
      {
        regex: /^The (.+) confirmation does not match\.$/i,
        translationKey: 'common.confirmed',
        params: ['attribute']
      }
    ];

    // Try to match the message with known patterns
    for (const pattern of patterns) {
      const match = message.match(pattern.regex);
      if (match) {
        // Get the translation template
        const template = t(pattern.translationKey);
        
        // If template is the same as key, translation not found, return original message
        if (template === pattern.translationKey) {
          return message;
        }
        
        // Replace placeholders with actual values
        let translatedMessage = template;
        pattern.params.forEach((param, index) => {
          let value = match[index + 1]; // +1 because match[0] is the full string
          
          // Translate field names if they exist
          const fieldTranslation = t(`common.${value}`);
          if (fieldTranslation !== `common.${value}`) {
            value = fieldTranslation;
          }
          
          // Replace placeholder
          translatedMessage = translatedMessage.replace(`:${param}`, value);
        });
        
        return translatedMessage;
      }
    }
    
    // If no pattern matches, return the original message
    return message;
  } catch (error) {
    console.warn('Error translating validation message:', error);
    return message;
  }
};

interface Notification {
  id: string;
  title: string;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
  show: boolean;
  timeout?: number;
}

const notifications = ref<Notification[]>([]);

// Success notification
const showSuccess = (action: string) => {
  const notification: Notification = {
    id: Date.now().toString(),
    title: `common.${action}_success`,
    text: "common.opration_success",
    type: 'success',
    show: false,
    timeout: 5000
  };
  
  addNotification(notification);
};

// Error notification
const showError = (action: string, message?: string) => {
  const notification: Notification = {
    id: Date.now().toString(),
    title: t(`common.${action}_failed`),
    text: message ? translateValidationError(message) : t("common.opration_failed"),
    type: 'error',
    show: false,
    timeout: 7000
  };
  
  addNotification(notification);
};

// Field-specific error notifications
const showFieldErrors = (action: string, errors: Record<string, string[]>) => {
  for (const field in errors) {
    if (errors.hasOwnProperty(field)) {
      const messages = errors[field];
      messages.forEach((message: string) => {
        const notification: Notification = {
          id: Date.now().toString() + Math.random(),
          title: t(`common.${action}_failed`),
          text: translateValidationError(message),
          type: 'error',
          show: false,
          timeout: 7000
        };
        
        addNotification(notification);
      });
    }
  }
};

// Add notification to the list
const addNotification = (notification: Notification) => {
  console.log('Adding notification:', notification);
  notifications.value.push(notification);
  
  // Make notification immediately visible
  notification.show = true;
  console.log('Notification should be visible now, total notifications:', notifications.value.length);
  
  // Auto remove after timeout
  if (notification.timeout) {
    setTimeout(() => {
      removeNotification(notification.id);
    }, notification.timeout);
  }
};

// Remove notification
const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value[index].show = false;
    setTimeout(() => {
      notifications.value.splice(index, 1);
    }, 300);
  }
};

// Expose methods for external use
defineExpose({
  showSuccess,
  showError,
  showFieldErrors
});
</script>

<style scoped>
.custom-notification-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  pointer-events: none;
}

.notifications-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-notification {
  display: flex;
  align-items: flex-start;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  cursor: pointer;
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.3s ease;
  border: 2px solid red; /* Debug border */
}

.custom-notification.show {
  transform: translateY(0);
  opacity: 1;
  border: 2px solid green; /* Debug border */
}

.notification-success {
  border-left: 4px solid #28a745;
}

.notification-error {
  border-left: 4px solid #dc3545;
}

.notification-warning {
  border-left: 4px solid #ffc107;
}

.notification-info {
  border-left: 4px solid #17a2b8;
}

.notification-icon {
  margin-right: 12px;
  font-size: 20px;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  color: #28a745;
}

.notification-error .notification-icon {
  color: #dc3545;
}

.notification-warning .notification-icon {
  color: #ffc107;
}

.notification-info .notification-icon {
  color: #17a2b8;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.notification-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.notification-close {
  margin-left: 12px;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  padding: 2px;
}

.notification-close:hover {
  color: #666;
}

/* Animation classes */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style> 