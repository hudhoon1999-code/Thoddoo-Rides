/**
 * i18n.ts
 * Lightweight translation hook for Thoddoo Rides.
 * Supports EN and RU, with architecture ready for Dhivehi, DE, IT.
 *
 * Usage:
 *   const { t, lang, setLang } = useI18n();
 *   <Text>{t('home.requestRide')}</Text>
 *   <Text>{t('home.seats', { n: 6 })}</Text>
 */

import { en } from './locales/en';
import { ru } from './locales/ru';
import { useAuthStore } from '../store/authStore';
import { useCallback } from 'react';

type Lang = 'en' | 'ru';

const LOCALES: Record<Lang, typeof en> = { en, ru };

/** Deep path getter: t('home.requestRide') */
function getPath(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path;
}

/** Replace {{variable}} placeholders */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(new RegExp(`{{${key}}}`, 'g'), String(val)),
    template
  );
}

export function useI18n() {
  const lang    = (useAuthStore((s) => s.user?.language) ?? 'en') as Lang;
  const setLang = useAuthStore((s) => s.setLanguage);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const locale = LOCALES[lang] ?? LOCALES.en;
      const template = getPath(locale, key) || getPath(LOCALES.en, key) || key;
      return interpolate(template, vars);
    },
    [lang]
  );

  return { t, lang, setLang };
}

export type { Lang };
