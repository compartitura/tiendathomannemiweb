// utils/translations.js
import categoryTranslations    from './translations.json';
import subTranslations         from './translations-subcategories';
import subsubTranslations      from './translations-subsubcategories';

const translations = {
  ...categoryTranslations,
  ...subTranslations,
  ...subsubTranslations,
};

export function translateCategory(name) {
  return translations[name] || name;
}
