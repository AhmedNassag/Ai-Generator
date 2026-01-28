import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "bootstrap/dist/js/bootstrap.min.js";
import "./assets/scss/app.scss"
import Notifications from '@kyvg/vue3-notification'
import 'core-js/features/object/has-own';

import VueFeather from "vue-feather";
import { createI18n } from 'vue-i18n'
import Breadcrumbs from '@/layout/theBreadcrumbs.vue';
 
import Auth from './API/Auth'
import DirectiveScannerPlugin from './directiveScannerPlugin'
import language from "@/API/Language/Language";
import translate from "@/API/Translate/Translate";

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
})

// TypeScript interfaces
interface LanguageItem {
    id: string;
    code: string;
    name: string;
    order: number;
    rtl: string;
    flag: string;
}

interface Messages {
    [key: string]: {
        [key: string]: {
            [key: string]: string
        }
    }
}

interface TranslationEntry {
    [key: string]: string;
}

interface TranslationGroup {
    name: string;
    en: TranslationEntry[];
    ar: TranslationEntry[];
    [key: string]: any;
    id: string;
    created_at: string;
    updated_at: string;
}

interface ProcessedTranslations {
    [key: string]: { // language code
        [key: string]: { // section name
            [key: string]: string // translations
        }
    }
}

// Initialize APIs
const languageApi = new language();
const translateApi = new translate();

// Function to process translations from API
function processTranslations(translations: TranslationGroup[]): ProcessedTranslations {
    const processed: ProcessedTranslations = {};

    translations.forEach(group => {
        // Get all language codes from the group (excluding non-language properties)
        const langCodes = Object.keys(group).filter(key => 
            !['name', 'id', 'created_at', 'updated_at'].includes(key)
        );

        // Process each language code
        langCodes.forEach(langCode => {
            if (!processed[langCode]) {
                processed[langCode] = {};
            }
            
            if (!processed[langCode][group.name]) {
                processed[langCode][group.name] = {};
            }

            // Process translations for this language and group
            const translations = group[langCode];
            if (Array.isArray(translations)) {
                translations.forEach(trans => {
                    Object.entries(trans).forEach(([key, value]) => {
                        if (typeof value === 'string') {
                            processed[langCode][group.name][key] = value;
                        }
                    });
                });
            }
        });
    });

    return processed;
}

// Function to load language messages
async function loadLanguages(): Promise<{ messages: Messages, defaultLocale: string }> {
    try {
        // Get both languages configuration and translations
        const [languages, translations] = await Promise.all([
            languageApi.getAll() as Promise<LanguageItem[]>,
            translateApi.getAll() as Promise<TranslationGroup[]>
        ]);
        
        // Sort languages by order
        const sortedLanguages = languages.sort((a, b) => Number(a.order) - Number(b.order));

        // Process translations into organized structure
        const processedTranslations = processTranslations(translations);
        
        // Create messages object
        const messages: Messages = {};
        for (const lang of sortedLanguages) {
            // Use only the base language code (e.g., 'en' from 'en-US')
            const langCode = lang.code.toLowerCase().split('-')[0];
            if (processedTranslations[langCode]) {
                messages[lang.code.toLowerCase()] = processedTranslations[langCode];
            } else {
                console.warn(`No translations found for language: ${lang.name} (${lang.code})`);
                messages[lang.code.toLowerCase()] = {}; // Empty translations object as fallback
            }
        }
        // Get saved language from localStorage, fallback to 'en'
        const savedLangCode = localStorage.getItem('selectedLanguageCode');
        const defaultLocale = savedLangCode && messages[savedLangCode] ? savedLangCode : 'en';
        return {
            messages,
            defaultLocale
        };
    } catch (err) {
        console.error('Failed to load languages:', err);
        // Fallback to English if API fails
        const English = await import("@/locales/en.json");
        // Ensure the structure matches Messages interface
        const englishMessages: { [key: string]: { [key: string]: string } } = {};
        Object.entries(English.default).forEach(([section, value]) => {
            // If value is an object, assign directly; if it's a string, wrap it
            englishMessages[section] = typeof value === 'object' && value !== null ? value as { [key: string]: string } : { value: value as string };
        });
        return {
            messages: { English: englishMessages },
            defaultLocale: 'en',
        };
    }
}

let i18n: ReturnType<typeof createI18n>;

// Initialize app after loading languages
async function initializeApp() {
    const { messages, defaultLocale } = await loadLanguages();
    
    i18n = createI18n({
        legacy: false,
        locale: defaultLocale,
        messages,
        fallbackLocale: 'en'
    });

    Auth.run();
    
    const isLoggedIn = await Auth.loggedIn();
    if (!isLoggedIn) {
        router.push({ name: 'Login' });
    }

    createApp(App)
        .use(router)
        .use(createPinia())
        .use(i18n)
        .use(vuetify)
        .use(Notifications)
        .component('Breadcrumbs', Breadcrumbs)
        .use(DirectiveScannerPlugin)
        .mount('#app');
}

// Export i18n instance for use in other files
export { i18n };

// Start the application
initializeApp().catch(console.error);
