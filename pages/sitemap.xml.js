import fs from 'fs';
import path from 'path';

export async function getServerSideProps({ res }) {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  xml += `
    <url><loc>${baseUrl}/</loc></url>`;
  products.forEach(p => {
    xml += `
    <url><loc>${baseUrl}/products/${p.ArticleNumber}</loc></url>`;
  });
  xml += `\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }
