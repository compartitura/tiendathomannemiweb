// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useRouter } from 'next/router';

export async function getStaticProps() {
  const all = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );
  const firstLevels = Array.from(
    new Set(
      all
        .map(p => String(p.CategoryTree || '').split('>')[0].trim())
        .filter(Boolean)
    )
  ).sort();

  return {
    props: { all, firstLevels },
    revalidate: 3600,
  };
}

export default function Home({ all, firstLevels }) {
  const router = useRouter();
  const page = parseInt(router.query.page || '1', 10);
  const perPage = 20;
  const totalPages = Math.ceil(all.length / perPage);
  const slice = all.slice((page - 1) * perPage, (page - 1) * perPage + perPage);

  const changePage = newPage => {
    router.push({ pathname: router.pathname, query: { page: newPage } });
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* Navegación de categorías */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {firstLevels.map(cat => (
            <Link
              key={cat}
              href={{ pathname: `/categories/${encodeURIComponent(cat)}`, query: { page: 1 } }}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slice.map(p => (
          <Link
            key={p.ArticleNumber}
            href={`/products/${p.ArticleNumber}`}
            className="block border rounded-lg p-4 hover:shadow-lg transition"
          >
            <img
              src={p.ImageURL}
              alt={p.Model}
              loading="lazy"
              className="object-cover w-full h-48 rounded"
            />
            <h2 className="mt-2 font-semibold">{p.Brand} {p.Model}</h2>
          </Link>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <button
          onClick={() => changePage(page - 1)}
          disabled={page <= 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => changePage(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </main>
  );
}
