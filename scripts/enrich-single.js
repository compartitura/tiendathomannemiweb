// scripts/enrich-single.js
const fs      = require('fs');
const path    = require('path');
const axios   = require('axios');
const cheerio = require('cheerio');

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' };

async function fetchDescription(url) {
  console.log('  → GET:', url);
  const { data: html } = await axios.get(url, { headers: HEADERS });
  const $ = cheerio.load(html);

  let desc = $('meta[name="description"]').attr('content') || '';
  if (!desc) desc = $('meta[property="og:description"]').attr('content') || '';

  const sel = '#tab-description, .long-description, section#product-description';
  let longText = '';
  $(sel).each((i, el) => longText += $(el).text().trim() + '\n\n');

  const result = (longText.trim() || desc.trim()).replace(/\s+/g, ' ');
  console.log('  → Extracted length:', result.length);
  return result;
}

async function main() {
  const num = process.argv[2];
  if (!num) {
    console.error('Uso: node enrich-single.js <ArticleNumber>');
    process.exit(1);
  }

  // Ruta al JSON usando process.cwd()
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  console.log('JSON file path:', filePath);

  let products;
  try {
    products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error('❌ Error leyendo JSON:', e);
    process.exit(1);
  }

  const idx = products.findIndex(p => String(p.ArticleNumber) === String(num));
  if (idx === -1) {
    console.error('❌ ArticleNumber no encontrado:', num);
    process.exit(1);
  }

  const p = products[idx];
  const rawUrl = (p.ProductURL || p.affiliateURL || '').trim();
  const url    = rawUrl.replace(/\s.*$/, '');
  console.log(`Enriqueciendo ${p.Brand} ${p.Model} (${p.ArticleNumber})`);
  console.log('Original URL field:', JSON.stringify(rawUrl));
  console.log('Usando URL:', url);

  let text;
  try {
    text = await fetchDescription(url);
  } catch (e) {
    console.error('❌ Error al obtener descripción:', e.message);
    process.exit(1);
  }

  if (!text) {
    console.warn('⚠️ No se extrajo descripción; manteniendo la existente.');
    process.exit(0);
  }

  products[idx].Description = text;
  try {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
    console.log('✅ Descripción escrita en JSON.');
  } catch (e) {
    console.error('❌ Error escribiendo JSON:', e);
    process.exit(1);
  }

  // Verificación inmediata
  const reloaded = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log('🔍 Verificando campo Description tras write:');
  console.log('   ', reloaded[idx].Description.slice(0, 100) + '…');
}

main();
