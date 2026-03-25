import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sme-insightx-lang',
    },
  });

export default i18n;

export function getDirection(lng: string): 'rtl' | 'ltr' {
  return lng === 'ar' ? 'rtl' : 'ltr';
}

export function applyDirection(lng: string) {
  const dir = getDirection(lng);
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
}
