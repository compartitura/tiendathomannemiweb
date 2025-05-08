// pages/api/categories.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const all = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Extraer categoría de nivel 1 de cada producto
  const categoriesSet = new Set();
  all.forEach(p => {
    const tree = String(p.CategoryTree || '');
    const first = tree.split('>')[0].trim();
    if (first) categoriesSet.add(first);
  });

  const categories = Array.from(categoriesSet).sort();
  res.status(200).json({ categories });
}
