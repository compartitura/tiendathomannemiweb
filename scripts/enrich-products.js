// scripts/enrich-products.js
const fs      = require('fs');
const path    = require('path');
const axios   = require('axios');
const cheerio = require('cheerio');

// Lista de proxies reales (reemplaza estos ejemplos)
const proxyList = [
  // 'http://usuario:pass@123.45.67.89:8000',
  // 'http://usuario:pass@98.76.54.32:8000',
];
let proxyIndex = 0;

const DELAY_MS    = 2000;  // 2s entre peticiones
const MAX_RETRIES = 3;     // reintentos ante 429 o proxy fail

function getNextProxyConfig() {
  if (proxyList.length === 0) return null;
  const url = new URL(proxyList[proxyIndex % proxyList.length]);
  proxyIndex++;
  return {
    host: url.hostname,
    port: parseInt(url.port, 10),
    protocol: url.protocol.replace(':', ''),
    auth: url.username
      ? { username: url.username, password: url.password }
      : undefined
  };
}

async function fetchDescription(url) {
  let attempt = 0, backoff = DELAY_MS;
  while (attempt < MAX_RETRIES) {
    // Decide si usamos proxy o directo
    const proxyConfig = getNextProxyConfig();
    const axiosOpts = {
      headers: {'User-Agent':'Mozilla/5.0'},
      timeout: 15000,
      ...(proxyConfig ? { proxy: proxyConfig } : {})
    };

    try {
      const { data: html } = await axios.get(url, axiosOpts);
      const $ = cheerio.load(html);

      // Fallback meta-description + sección larga
      let desc = $('meta[name="description"]').attr('content') || '';
      const sel = '#tab-description, .long-description, section#product-description';
      let longText = '';
      $(sel).each((i, el) => {
        longText += $(el).text().trim() + '\n\n';
      });
      return (longText.trim() || desc.trim()).replace(/\s+/g, ' ');
    } catch (err) {
      // Si 429 o proxy ENOTFOUND / ECONNREFUSED, reintenta
      const code = err.response?.status || err.code;
      if (code === 429 || ['ENOTFOUND','ECONNRESET','ECONNREFUSED','ETIMEDOUT'].includes(code)) {
        attempt++;
        console.warn(`  ⚠️ ${code} en ${url}, backoff ${backoff}ms (intento ${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, backoff));
        backoff *= 2;
        continue;
      }
      // Otros errores: dejamos de reintentar
      throw err;
    }
  }
  console.warn(`  ⚠️ Fallaron ${MAX_RETRIES} intentos para ${url}, devolviendo vacío`);
  return '';
}

async function main() {
  const filePath = path.join(process.cwd(),'data','products.json');
  const products = JSON.parse(fs.readFileSync(filePath,'utf-8'));
  const startIdx = products.findIndex(p => p.Description === undefined);
  for (let i = startIdx; i < products.length; i++) {
    const p = products[i];
    process.stdout.write(`(${i+1}/${products.length}) ${p.Brand} ${p.Model}`);
    await new Promise(r => setTimeout(r, DELAY_MS));
    try {
      p.Description = await fetchDescription(p.ProductURL);
      console.log(' ✅');
    } catch(e) {
      console.log(`  ❌ ${e.message}`);
      p.Description = '';
    }
    // checkpoint cada 100
    if ((i+1) % 100 === 0) {
      fs.writeFileSync(filePath, JSON.stringify(products,null,2),'utf-8');
      console.log(`— checkpoint guardado en ${i+1}`);
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(products,null,2),'utf-8');
  console.log('✅ data/products.json actualizado con descripciones.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
