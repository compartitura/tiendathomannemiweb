// scripts/enrich-sample.js
const fs      = require('fs');
const path    = require('path');
const axios   = require('axios');
const cheerio = require('cheerio');

const DELAY_MS = 2000; // 2 s de retardo

async function fetchDescription(url) {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(html);

  // 1) Fallback: meta description
  let desc = $('meta[name="description"]').attr('content') || '';

  // 2) Si existe la sección larga, la anteponemos
  const sel = '#tab-description, .long-description, section#product-description';
  let longText = '';
  $(sel).each((i, el) => {
    longText += $(el).text().trim() + '\n\n';
  });

  return (longText.trim() || desc.trim()).replace(/\s+/g, ' ');
}

async function main() {
  const filePath = path.join(process.cwd(), 'data/products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Solo los primeros 5 para prueba
  for (let i = 0; i < Math.min(5, products.length); i++) {
    const p = products[i];
    process.stdout.write(`(${i+1}/5) ${p.Brand} ${p.Model}`);
    await new Promise(r => setTimeout(r, DELAY_MS));
    try {
      const text = await fetchDescription(p.ProductURL);
      p.Description = text || '(sin descripción)';
      console.log(' ✅');
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
      p.Description = '(sin descripción)';
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  console.log('✅ Primeras 5 descripciones actualizadas.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
