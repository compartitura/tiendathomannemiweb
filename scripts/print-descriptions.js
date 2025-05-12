import fs from 'fs';
import path from 'path';

// Ruta al JSON de productos
const INPUT_FILE = path.join(process.cwd(), 'data', 'products.json');

(async () => {
  const raw = fs.readFileSync(INPUT_FILE, 'utf-8');
  const products = JSON.parse(raw);

  for (const p of products) {
    console.log(`${p.ArticleNumber} — ${p.Brand} ${p.Model}`);
    console.log(p.Description || '[sin descripción]');
    console.log('-'.repeat(40));
  }
})();
