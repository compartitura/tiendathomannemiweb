// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useRouter } from 'next/router';

export async function getStaticProps() {
  const all = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );
  // extract first‑level categories
  const firstLevels = Array.from(
    new Set(
      all
        .map(p => String(p.CategoryTree || '').split('>')[0].trim())
        .filter(Boolean)
    )
  ).sort();

  return {
    props: {
      all,
      firstLevels
    },
    revalidate: 3600
  };
}

export default function Home({ all, firstLevels }) {
  const router = useRouter();
  const page = parseInt(router.query.page || '1', 10);
  const perPage = 20;
  const totalPages = Math.ceil(all.length / perPage);
  const start = (page - 1) * perPage;
  const slice = all.slice(start, start + perPage);

  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* Category navigation */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {firstLevels.map(cat => (
            <Link key={cat} legacyBehavior href={`/categories/${encodeURIComponent(cat)}`}>
              <a className="px-3 py-1 border rounded hover:bg-gray-100">{cat}</a>
            </Link>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slice.map(p => (
          <Link legacyBehavior key={p.ArticleNumber} href={`/products/${p.ArticleNumber}`}>
            <a className="block border rounded-lg p-4 hover:shadow-lg transition">
              <img
                src={p.ImageURL}
                alt={p.Model}
                loading="lazy"
                className="object-cover w-full h-48 rounded"
              />
              <h2 className="mt-2 font-semibold">{p.Brand} {p.Model}</h2>
            </a>
          </Link>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <button
          onClick={() => router.push(`/?page=${page - 1}`)}
          disabled={page <= 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => router.push(`/?page=${page + 1}`)}
          disabled={page >= totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </main>
  );
}
