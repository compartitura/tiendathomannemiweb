// scripts/enrich-single.js
const fs      = require('fs');
const path    = require('path');
const axios   = require('axios');
const cheerio = require('cheerio');

// Aquí tu User‑Agent para no ser bloqueado
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' };

// Función que extrae descripción de la página
async function fetchDescription(url) {
  const { data: html } = await axios.get(url, { headers: HEADERS });
  const $ = cheerio.load(html);

  let desc = $('meta[name="description"]').attr('content') || '';
  if (!desc) desc = $('meta[property="og:description"]').attr('content') || '';

  // también toma la descripción larga si existe
  const sel = '#tab-description, .long-description, section#product-description';
  let longText = '';
  $(sel).each((i, el) => {
    longText += $(el).text().trim() + '\n\n';
  });

  return (longText.trim() || desc.trim()).replace(/\s+/g, ' ');
}

async function main() {
  const num = process.argv[2];
  if (!num) {
    console.error('Uso: node enrich-single.js <ArticleNumber>');
    process.exit(1);
  }

  const filePath = path.join(__dirname, '..', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const idx = products.findIndex(p => String(p.ArticleNumber) === String(num));
  if (idx === -1) {
    console.error('No existe ArticleNumber', num);
    process.exit(1);
  }

  const p = products[idx];
  console.log(`Enriqueciendo ${p.Brand} ${p.Model} (${p.ArticleNumber})…`);

  try {
    const text = await fetchDescription(p.ProductURL);
    if (text) {
      products[idx].Description = text;
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
      console.log('✅ Descripción actualizada:', text.slice(0, 100) + '…');
    } else {
      console.log('⚠️ No se encontró descripción en la página');
    }
  } catch (err) {
    console.error('❌ Error al obtener descripción:', err.message);
  }
}

main();
