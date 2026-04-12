import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


import en from './languages/en.json';
import ta from './languages/ta.json';
import hi from './languages/hi.json';

const resources = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en', // default
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
