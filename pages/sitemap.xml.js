// pages/sitemap.xml.js
import fs from 'fs';
import path from 'path';

export async function getServerSideProps({ res }) {
  // 1. Leer JSON de productos
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2. Construir base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // 3. Generar contenido XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 3a. Agregar la página principal
  xml += `
    <url>
      <loc>${baseUrl}/</loc>
    </url>`;

  // 3b. Agregar cada página de producto
  products.forEach(p => {
    xml += `
    <url>
      <loc>${baseUrl}/products/${p.ArticleNumber}</loc>
    </url>`;
  });

  xml += `\n</urlset>`;

  // 4. Servir XML con cabecera adecuada
  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();

  return { props: {} };
}

// Componente vacío, pues todo se sirve vía getServerSideProps
export default function Sitemap() {
  return null;
}
