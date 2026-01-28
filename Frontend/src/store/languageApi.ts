import { defineStore } from 'pinia';
import { ref } from 'vue';
import language from "@/API/Language/Language";

export interface LanguageItem {
    id: string;
    code: string;
    name: string;
    order: number;
    rtl: string;
    flag: string;
}

export const useLanguageApiStore = defineStore('languageApi', () => {
    const languages = ref<LanguageItem[]>([]);
    const currentLanguage = ref<LanguageItem | null>(null);
    const api = new language();

    async function fetchLanguages() {
        try {
            const response = await api.getAll();
            //languages.value = response.sort((a: LanguageItem, b: LanguageItem) => Number(a.order) - Number(b.order));
            languages.value = response;
            if (languages.value.length > 0 && !currentLanguage.value) {
                currentLanguage.value = languages.value[0];
            }
        } catch (error) {
            console.error('Error fetching languages:', error);
            languages.value = [];
        }
    }

    function setCurrentLanguage(lang: LanguageItem) {
        currentLanguage.value = lang;
    }

    return {
        languages,
        currentLanguage,
        fetchLanguages,
        setCurrentLanguage
    };
});
