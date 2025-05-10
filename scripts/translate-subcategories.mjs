// scripts/translate-subcategories.js
import fs from 'fs';
import path from 'path';
import translate from '@vitalets/google-translate-api';

async function main() {
  const file = path.join(process.cwd(), 'utils', 'translations-subcategories.json');
  // Leemos con utf8 y quitamos BOM si existe
  const raw = fs.readFileSync(file, 'utf8');
  const clean = raw.replace(/^\uFEFF/, '');
  const subs  = JSON.parse(clean);

  for (const key of Object.keys(subs)) {
    if (!subs[key]) {
      const res = await translate(key, { to: 'es' });
      subs[key] = res.text;
      console.log(`"${key}" → "${res.text}"`);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  fs.writeFileSync(file, JSON.stringify(subs, null, 2), 'utf8');
  console.log('🔖 Traducciones de subcategorías actualizadas');
}

main();
