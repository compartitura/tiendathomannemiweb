// utils/translations.js
import categoryTranslations from './translations.json';
import subTranslations      from './translations-subcategories';

const translations = {
  ...categoryTranslations,
  ...subTranslations,
};

/**
 * Devuelve la traducción al español o el nombre original si no existe.
 */
export function translateCategory(name) {
  return translations[name] || name;
}
