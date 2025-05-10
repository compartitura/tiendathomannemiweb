// scripts/extract-subcategories.js
import fs from 'fs';
import path from 'path';

// Leer productos
const data = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
);

// Extraer subcategorías de segundo nivel
const subSet = new Set();
for (const p of data) {
  const tree = (p.CategoryTree || '').split('>').map(s => s.trim());
  if (tree.length > 1 && tree[1]) {
    subSet.add(tree[1]);
  }
}

// Construir objeto JSON con claves y valores vacíos
const subTranslations = {};
for (const name of Array.from(subSet).sort()) {
  subTranslations[name] = '';
}

// Volcar a stdout
console.log(JSON.stringify(subTranslations, null, 2));
