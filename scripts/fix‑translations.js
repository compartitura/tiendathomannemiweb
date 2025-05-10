// scripts/fix‑translations.js
const fs = require('fs');
const path = require('path');

// 1) Carga el objeto original
const src = fs.readFileSync(
  path.join(__dirname, '../utils/translations‑subcategories.js'),
  'utf8'
);
// Extrae sólo el literal de objeto { … }
const objText = src
  .replace(/^[\s\S]*export default\s*/, '')
  .replace(/;[\s\S]*$/, '');
const original = eval('(' + objText + ')');  // parsea el objeto

// 2) Define las correcciones puntuales
const overrides = {
  'Y-Adapter Cables': 'Cables Y-adapter',
  'Coding Rings': 'Anillos de codificación',
  'Fake books': 'Cancioneros (fake books)',
  Flightcases: 'Estuches de vuelo',
  Harmonicas: 'Armónicas',
  "Jew's harps": 'Arpa de boca',
  'Alphorns and Accessories': 'Alphorns y accesorios',
  'Analogue Mixing Desks': 'Mesas de mezcla analógicas',
  'Boundary Microphones': 'Micrófonos de límite',
  'Brass Instrument Mouthpieces': 'Boquillas para instrumentos de metal',
  'Broadcast Microphones': 'Micrófonos de transmisión',
  'Bags and Cases': 'Bolsas y estuches',
  'Drum bags and cases': 'Bolsas y estuches para baterías',
  // …añade aquí más overrides si detectas otros casos…
};

// 3) Construye un nuevo objeto sin duplicados: la última aparición gana
const cleaned = {};
Object.keys(original).forEach((key) => {
  cleaned[key] = original[key];
});
// 4) Aplica los overrides
Object.entries(overrides).forEach(([k, v]) => {
  if (cleaned[k] !== v) {
    cleaned[k] = v;
  }
});

// 5) Serializa de nuevo a JS
const out =
  'export default ' +
  JSON.stringify(cleaned, null, 2) +
  ';\n';

// 6) Escribe el fichero corregido
fs.writeFileSync(
  path.join(__dirname, '../utils/translations‑subcategories.fixed.js'),
  out,
  'utf8'
);
console.log('✅ translations‑subcategories.fixed.js generado');
