// scripts/preview-descriptions.js
const fs   = require('fs');
const path = require('path');

// Leer offset de la línea de comandos (p.ej. `node preview-descriptions.js 1100`)
const offset = parseInt(process.argv[2], 10) || 0;
const count  = 10;  // cuántos productos mostrar

const filePath = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Coger el slice deseado
const sample = products.slice(offset, offset + count).map((p, i) => ({
  Index:          offset + i + 1,
  ArticleNumber:  p.ArticleNumber,
  Brand:          p.Brand,
  Model:          p.Model,
  Description:    p.Description && p.Description.length > 0 ? p.Description.slice(0,200) + '…' : '(sin descripción)'
}));

console.log(JSON.stringify(sample, null, 2));
