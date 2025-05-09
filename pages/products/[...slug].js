// pages/products/[...slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import axios from 'axios';
import cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (compatible; Bot/1.0)';

async function fetchDescription(url) {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const $ = cheerio.load(html);

  let desc = $('meta[name="description"]').attr('content') || '';
  if (!desc) desc = $('meta[property="og:description"]').attr('content') || '';

  // Intenta también la sección de descripción larga
  const sel = '#tab-description, .long-description, section#product-description';
  let longText = '';
  $(sel).each((_, el) => { longText += $(el).text().trim() + '\n\n'; });

  return (longText.trim() || desc.trim()).replace(/\s+/g, ' ');
}

export async function getServerSideProps({ params }) {
  // 1) Lee tu JSON desde la raíz
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2) Determina el identificador
  const slugArr = Array.isArray(params.slug) ? params.slug : [params.slug];
  const last = slugArr[slugArr.length - 1];

  // 3) Busca el producto
  let product = products.find(p => String(p.ArticleNumber) === last);
  if (!product) {
    const decoded = decodeURIComponent(last).toLowerCase().replace(/-/g, ' ');
    product = products.find(p => p.Model.toLowerCase() === decoded);
  }
  if (!product) return { notFound: true };

  // 4) Si no tiene descripción, la extraemos al vuelo
  if (!product.Description || product.Description.trim() === '') {
    const rawUrl = (product.ProductURL || product.affiliateURL || '').trim();
    const cleanUrl = rawUrl.replace(/\s.*$/, '');
    try {
      product.Description = await fetchDescription(cleanUrl);
    } catch (e) {
      console.error('Error fetching description:', e.message);
      // Si falla, seguimos con la descripción vacía
    }
  }

  return { props: { product } };
}

export default function ProductPage({ product }) {
  const title = `${product.Brand} ${product.Model}`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={product.Description || ''} />
      </Head>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <img
          src={product.ImageURL}
          alt={product.Model}
          className="w-full h-64 object-cover rounded mb-4"
        />
        {product.Description
          ? <p className="mb-6 whitespace-pre-wrap">{product.Description}</p>
          : <p className="italic text-gray-500 mb-6">(sin descripción disponible)</p>
        }
        <a
          href={product.affiliateURL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Comprar en Thomann
        </a>
      </div>
    </>
  );
}
