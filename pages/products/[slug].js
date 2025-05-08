// pages/products/[...slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const slugArr = params.slug;
  const last = slugArr[slugArr.length - 1];
  const products = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );

  // 1) Buscar por ArticleNumber
  let product = products.find(p => String(p.ArticleNumber) === last);

  // 2) Si no, buscar por modelo “slugificado”
  if (!product) {
    const decoded = decodeURIComponent(last).toLowerCase().replace(/-/g, ' ');
    product = products.find(p => p.Model.toLowerCase() === decoded);
  }

  if (!product) return { notFound: true };

  return {
    props: { product },
    revalidate: 3600,
  };
}

export default function ProductPage({ product }) {
  const title = `${product.Brand} ${product.Model}`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={product.Description || `${product.Brand} ${product.Model}`} />
      </Head>

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{product.Brand} {product.Model}</h1>
        <div className="relative w-full h-64 mb-4">
          <img
            src={product.ImageURL}
            alt={product.Model}
            loading="lazy"
            className="object-cover w-full h-full rounded"
          />
        </div>
        <p className="italic mb-4">{product.CategoryTree}</p>
        {/* Descripción */}
        {product.Description ? (
          <div className="prose prose-sm mb-6">
            <h2>Descripción</h2>
            <p>{product.Description}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">(sin descripción disponible)</p>
        )}
        <a
          href={product.affiliateURL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Comprar en Thomann
        </a>
        <Link legacyBehavior href="/">
          <a className="block mt-4 text-sm text-gray-600 hover:underline">
            ← Volver al catálogo
          </a>
        </Link>
      </div>
    </>
  );
}

