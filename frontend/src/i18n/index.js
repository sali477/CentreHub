import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const LANGUAGE_STORAGE_KEY = 'centrehub_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', flag: '🇫🇷' },
];

const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
const initialLng = saved && ['en', 'fr'].includes(saved) ? saved : 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: initialLng,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

document.documentElement.lang = i18n.language;

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
});

export default i18n;
