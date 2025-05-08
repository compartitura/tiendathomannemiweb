// pages/categories/[...slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const slugArray = params.slug; // e.g. ['Wind Instruments','Clarinets']
  const target = slugArray.join(' > ').toLowerCase();

  const items = products.filter(p =>
    String(p.CategoryTree || '').toLowerCase().startsWith(target)
  );

  return {
    props: {
      slug: slugArray,
      items
    },
    revalidate: 3600 // regenerate every hour
  };
}

export default function CategoryPage({ slug, items }) {
  const title = slug.join(' / ');
  return (
    <>
      <Head>
        <title>{title} – Categoría</title>
        <meta name="description" content={`Productos en la categoría ${title}.`} />
      </Head>
      <div className="max-w-5xl mx-auto p-6">
        <nav className="text-sm mb-4">
          <Link href="/"><a className="hover:underline">Inicio</a></Link>
          {slug.map((part, i) => (
            <span key={i}>
              {' › '}
              <Link legacyBehavior href={`/categories/${slug.slice(0, i+1).map(encodeURIComponent).join('/')}`}>
                <a className="hover:underline">{part}</a>
              </Link>
            </span>
          ))}
        </nav>

        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(p => (
            <Link legacyBehavior key={p.ArticleNumber} href={`/products/${p.ArticleNumber}`}>
              <a className="border rounded-lg p-4 hover:shadow-lg transition">
                <div className="relative w-full h-48">
                  <img
                    src={p.ImageURL}
                    alt={p.Model}
                    loading="lazy"
                    className="object-cover w-full h-full rounded"
                  />
                </div>
                <h2 className="mt-2 font-semibold">{p.Brand} {p.Model}</h2>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
