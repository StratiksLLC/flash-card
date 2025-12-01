import { useTranslation as useI18nTranslation } from 'react-i18next';
import { changeLanguage as changeI18nLanguage } from '@/utils/i18n.ts';

export const useTranslation = () => {
    const { t, i18n } = useI18nTranslation();

    const changeLanguage = async (lng: string) => {
        await changeI18nLanguage(lng);
    };

    return { t, changeLanguage, currentLanguage: i18n.language };
};
