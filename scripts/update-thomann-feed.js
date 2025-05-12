import fs from 'fs';
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';

async function downloadUnlimitedFeed(token, feedId) {
  const url = `http://api.tradedoubler.com/1.0/productsUnlimited;fid=${feedId}?token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

async function main() {
  const token = 'e4a7b4b9-3af5-3a1b-8837-ce08966507a4';
  // 1) Obtén feedId una sola vez o automatiza leyendo productFeeds
  const feedId = 'TU_FEED_ID';

  const csv = await downloadUnlimitedFeed(token, feedId);
  const records = parse(csv, { columns: true, skip_empty_lines: true });
  const products = records.map(r => ({
    ArticleNumber: r.ArticleNumber,
    Brand:         r.Brand,
    Model:         r.Model,
    Description:   r.description,      // ahora sí existe
    ImageURL:      r.MediumImageURL,
    ProductURL:    r.ProductURL,
    CategoryTree:  r.CategoryTree,
    affiliateURL:  r.ProductURL
  }));
  fs.writeFileSync('data/products.json', JSON.stringify(products, null, 2));
  console.log(`✅ ${products.length} productos con descripción.`);
}

main().catch(console.error);
