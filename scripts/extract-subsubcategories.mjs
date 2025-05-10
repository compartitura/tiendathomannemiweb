// scripts/extract-subsubcategories.mjs
import fs from 'fs';
import path from 'path';

// Lee todo el catálogo
const data = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
);

// Recopila el tercer nivel de CategoryTree
const names = new Set();
data.forEach(p => {
  const parts = (p.CategoryTree || '').split('>').map(s => s.trim());
  if (parts[2]) names.add(parts[2]);
});

// Genera un objeto con claves vacías
const translations = {};
Array.from(names).sort().forEach(name => {
  translations[name] = '';
});

// Imprime el JSON resultante
console.log(JSON.stringify(translations, null, 2));
