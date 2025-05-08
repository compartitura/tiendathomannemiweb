// pages/categories/[...slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const products = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );
  const slugArray = params.slug || []; // e.g. ['Wind Instruments', 'Clarinets']
  const prefix = slugArray.join(' > ').toLowerCase();

  // Filtra los productos que coincidan con el prefijo
  const items = products.filter(p =>
    String(p.CategoryTree || '').toLowerCase().startsWith(prefix)
  );

  // Calcula subcategorías inmediatas
  const subs = new Set();
  items.forEach(p => {
    const levels = String(p.CategoryTree || '').split('>').map(s => s.trim());
    if (levels.length > slugArray.length) {
      const next = levels[slugArray.length];
      subs.add(next);
    }
  });
  const subcategories = Array.from(subs).sort();

  return {
    props: {
      slug: slugArray,
      items,
      subcategories,
    },
    revalidate: 3600,
  };
}

export default function CategoryPage({ slug, items, subcategories }) {
  const title = slug.length ? slug.join(' / ') : 'Categorías';
  return (
    <>
      <Head>
        <title>{title} – Nuestra Tienda</title>
        <meta name="description" content={`Explora productos en la categoría ${title}.`} />
      </Head>
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumbs */}
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

        {/* Subcategorías */}
        {subcategories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Subcategorías</h2>
            <div className="flex flex-wrap gap-2">
              {subcategories.map(sub => (
                <Link
                  legacyBehavior
                  key={sub}
                  href={`/categories/${[...slug, sub].map(encodeURIComponent).join('/')}`}
                >
                  <a className="px-3 py-1 border rounded hover:bg-gray-100">
                    {sub}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Productos */}
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(p => (
            <Link legacyBehavior key={p.ArticleNumber} href={`/products/${p.ArticleNumber}`}>
              <a className="block border rounded-lg p-4 hover:shadow-lg transition">
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
