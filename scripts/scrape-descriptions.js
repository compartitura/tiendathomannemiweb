import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Ruta al JSON de productos
const INPUT_FILE = path.join(process.cwd(), 'data', 'products.json');

(async () => {
  // Leer catálogo actual
  const catalog = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

  // Iniciar Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const p of catalog) {
    try {
      // URL limpia de Thomann (sin parámetros)
      const url = p['Referrer URL'] || p.ProductURL ||
        `https://www.thomann.de/intl/${p.ArticleNumber}.html`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Extraer descripción desde meta tags
      const desc = await page.evaluate(() => {
        const og = document.querySelector('meta[property="og:description"]')?.content;
        const meta = document.querySelector('meta[name="description"]')?.content;
        const tw = document.querySelector('meta[name="twitter:description"]')?.content;
        return (og || meta || tw || null)?.trim() || null;
      });

      if (desc) {
        p.Description = desc;
      } else {
        console.warn(`⚠️ ${p.ArticleNumber}: no se pudo extraer descripción`);
      }

      // Retardo para evitar saturar el servidor
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Error en ${p.ArticleNumber}: ${err.message}`);
    }
  }

  // Cerrar navegador y guardar JSON actualizado
  await browser.close();
  fs.writeFileSync(INPUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log('✅ Descripciones actualizadas en data/products.json');
})();
