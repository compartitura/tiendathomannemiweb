// scripts/enrich-chunk.js
const fs      = require('fs');
const path    = require('path');
const axios   = require('axios');
const cheerio = require('cheerio');

// Lista de proxies (vacía = sin proxy)
// Ejemplo: ['http://user:pass@ip:port', ...]
const proxyList = [];
let proxyIndex = 0;

const DELAY_MS    = 2000;  // 2s entre peticiones
const MAX_RETRIES = 3;     // reintentos ante 429 o fallo proxy
const CHECKPOINT  = 100;   // guardar cada 100 productos

function getNextProxyConfig() {
  if (proxyList.length === 0) return null;
  const url = new URL(proxyList[proxyIndex % proxyList.length]);
  proxyIndex++;
  return {
    host: url.hostname,
    port: parseInt(url.port, 10),
    protocol: url.protocol.replace(':', ''),
    auth: url.username ? { username: url.username, password: url.password } : undefined
  };
}

async function fetchDescription(url) {
  let attempt = 0;
  let backoff = DELAY_MS;
  while (attempt < MAX_RETRIES) {
    const proxyConfig = getNextProxyConfig();
    const opts = {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' },
      timeout: 15000,
      ...(proxyConfig ? { proxy: proxyConfig } : {})
    };
    try {
      const { data: html } = await axios.get(url, opts);
      const $ = cheerio.load(html);

      // 1) meta description
      let desc = $('meta[name="description"]').attr('content') || '';
      // 2) fallback og:description
      if (!desc) {
        desc = $('meta[property="og:description"]').attr('content') || '';
      }
      // 3) sección larga
      const sel = '#tab-description, .long-description, section#product-description';
      let longText = '';
      $(sel).each((i, el) => {
        longText += $(el).text().trim() + '\n\n';
      });

      const final = (longText.trim() || desc.trim()).replace(/\s+/g, ' ');
      return final;
    } catch (err) {
      const code = err.response?.status || err.code;
      if (code === 429 || ['ENOTFOUND','ECONNRESET','ECONNREFUSED','ETIMEDOUT'].includes(code)) {
        attempt++;
        console.warn(`  ⚠️ ${code} en ${url}, backoff ${backoff}ms (intento ${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, backoff));
        backoff *= 2;
        continue;
      }
      throw err;
    }
  }
  console.warn(`  ⚠️ Fallaron ${MAX_RETRIES} intentos para ${url}, devolviendo vacío`);
  return '';
}

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const offset = parseInt(process.argv[2], 10) || 0;
  const count  = parseInt(process.argv[3], 10) || products.length;
  const end    = Math.min(offset + count, products.length);

  for (let i = offset; i < end; i++) {
    const p = products[i];
    process.stdout.write(`(${i+1}/${products.length}) ${p.Brand} ${p.Model}`);
    await new Promise(r => setTimeout(r, DELAY_MS));
    try {
      const text = await fetchDescription(p.ProductURL);
      p.Description = text || '(sin descripción)';
      console.log(` ✅ (“${text.slice(0,60)}…”)`);
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
      p.Description = '(sin descripción)';
    }
    if ((i+1) % CHECKPOINT === 0) {
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
      console.log(`— checkpoint guardado en ${i+1}`);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  console.log('✅ data/products.json actualizado con descripciones.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
