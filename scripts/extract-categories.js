// scripts/extract-categories.js
import fs from 'fs'
import path from 'path'

const data = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
)

const names = new Set(
  data
    .map(p => (p.CategoryTree || '').split('>')[0].trim())
    .filter(Boolean)
)

const translations = {}
for (const name of names) translations[name] = ''

// Volcar a stdout como JSON
console.log(JSON.stringify(translations, null, 2))
