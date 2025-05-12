import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Ruta al archivo de productos sin descripción
const INPUT_FILE = path.join(process.cwd(), 'data', 'products.json');
// Salida con descripciones añadidas
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'products-with-desc.json');

(async () => {
  const catalog = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (let i = 0; i < catalog.length; i++) {
    const product = catalog[i];
    const url = product.ProductURL;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      // Ajusta el selector según la estructura actual de Thomann
      const description = await page.$eval('.product-description, #description', el => el.innerText.trim());
      product.Description = description;
      console.log(`✔️ ${product.ArticleNumber}: descripción extraída`);
    } catch (err) {
      console.warn(`⚠️ ${product.ArticleNumber}: no se pudo extraer descripción`);
      product.Description = '';
    }
    // Pequeño retardo para no sobrecargar el servidor
    await page.waitForTimeout(500);
  }

  await browser.close();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`
✅ Scraping completado: ${catalog.length} productos procesados.`);
})();
