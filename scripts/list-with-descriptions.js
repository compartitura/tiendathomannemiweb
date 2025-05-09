// scripts/list-with-descriptions.js
const fs = require('fs');
const path = require('path');

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname,'..','data','products.json'),'utf-8')
);

const filtered = products.filter(p =>
  p.Description && p.Description !== '(sin descripción)'
);

console.log(`Total con descripción: ${filtered.length}\n`);
filtered.forEach(p => {
  console.log(`${p.ArticleNumber} — ${p.Brand} ${p.Model}`);
});
