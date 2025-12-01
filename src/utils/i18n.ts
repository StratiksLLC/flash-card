import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const loadLanguage = async (lng: string) => {
    switch (lng) {
        case 'en':
            return (await import('@/assets/locales/en.json')).default;
        case 'zh':
            return (await import('@/assets/locales/zh.json')).default;
        default:
            return (await import('@/assets/locales/en.json')).default;
    }
};

export const initI18n = async () => {
    if (i18n.isInitialized) return;

    try {
        await i18n.use(initReactI18next).init({
            fallbackLng: 'en',
            interpolation: { escapeValue: false },
            react: { useSuspense: false }
        });

        const initialLng = localStorage.getItem('language') || 'en';
        const resources = await loadLanguage(initialLng);
        i18n.addResourceBundle(initialLng, 'translation', resources, true, true);
        await i18n.changeLanguage(initialLng);
    } catch (e) {
        console.error(`Init i18n error caught: ${e}`);
    }
};

export const changeLanguage = async (lng: string) => {
    try {
        if (!i18n.hasResourceBundle(lng, 'translation')) {
            const resources = await loadLanguage(lng);
            i18n.addResourceBundle(lng, 'translation', resources, true, true);
        }
        await i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    } catch (e) {
        console.error(`Change language error caught: ${e}`);
    }
};
