// pages/api/products.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { page = 1, perPage = 20, search = '', category = '' } = req.query;
  const pageNum   = parseInt(page,   10);
  const per       = parseInt(perPage,10);
  const term      = String(search).trim().toLowerCase();
  const catFilter = String(category).trim().toLowerCase();

  // Carga todos los productos
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  let all = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Filtrar por búsqueda (seguro para cualquier tipo de dato)
  if (term) {
    all = all.filter(p => {
      const brand = String(p.Brand || '').toLowerCase();
      const model = String(p.Model || '').toLowerCase();
      return brand.includes(term) || model.includes(term);
    });
  }

  // Filtrar por categoría
  if (catFilter) {
    all = all.filter(p =>
      String(p.CategoryTree || '').toLowerCase().includes(catFilter)
    );
  }

  // Paginar
  const start = (pageNum - 1) * per;
  const items = all.slice(start, start + per);

  res.status(200).json({ items, total: all.length });
}
