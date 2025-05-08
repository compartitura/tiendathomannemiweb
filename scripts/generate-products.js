// scripts/generate-products.js
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

// 1. Leer el CSV como texto
const csvFile = 'productcatalog_en_thomann.csv';
const csvData = fs.readFileSync(path.join(process.cwd(), csvFile), 'utf8');

// 2. Parsear el CSV usando xlsx.read con type 'string'
const workbook = xlsx.read(csvData, { type: 'string', bookType: 'csv' });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// 3. Convertir la hoja a JSON
const data = xlsx.utils.sheet_to_json(sheet);

// 4. Añadir URL de afiliado
const AFF_PARAMS = 'offid=1&affid=2413';
data.forEach(item => {
  const url = item.ProductURL;
  item.affiliateURL = url + (url.includes('?') ? '&' : '?') + AFF_PARAMS;
});

// 5. Guardar JSON en /data
const outDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'products.json'), JSON.stringify(data, null, 2));

console.log(`✅ data/products.json generado con ${data.length} productos.`);
