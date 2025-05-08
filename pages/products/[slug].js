// pages/products/[slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const paths = products.map(p => ({ params: { slug: String(p.ArticleNumber) } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const product = products.find(p => String(p.ArticleNumber) === params.slug);
  return { props: { product } };
}

export default function ProductPage({ product }) {
  const title = `${product.Brand} ${product.Model} – Compra en Thomann`;
  const description = `Compra ${product.Brand} ${product.Model} en Thomann usando nuestro enlace de afiliado. Categoría: ${product.CategoryTree}.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={product.ImageURL} />
      </Head>

      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{product.Brand} {product.Model}</h1>
        <img
          src={product.ImageURL}
          alt={product.Model}
          loading="lazy"
          className="w-full h-auto rounded"
        />
        <p className="italic mt-2">{product.CategoryTree}</p>
        <a
          href={product.affiliateURL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
