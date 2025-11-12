import { i18n, type Locale } from '@/i18n.config';

// Simple i18n helper for v1.0
// Full i18n implementation can be added later with next-intl routing

const translations: Record<Locale, Record<string, any>> = {
  es: require('@/locales/es/common.json'),
  en: require('@/locales/en/common.json'),
};

export function getTranslations(locale: Locale = 'es') {
  return (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to Spanish if translation missing
        value = translations.es;
        for (const k2 of keys) {
          value = value?.[k2];
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
}

export function useTranslation(locale: Locale = 'es') {
  const t = getTranslations(locale);
  return { t };
}

export { i18n };
export type { Locale };


