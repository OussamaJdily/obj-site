import type { Locale } from '@/lib/i18n';
import en from './en';
import fr from './fr';

const dictionaries = { en, fr };

export const getDict = (locale: Locale) => dictionaries[locale];
