// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { translateCategory } from '../utils/translations';

export async function getServerSideProps({ query }) {
  const all = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );

  const firstLevels = Array.from(
    new Set(
      all
        .map(p => (p.CategoryTree || '').split('>')[0].trim())
        .filter(Boolean)
    )
  ).sort();

  const FAVORITE_CATEGORIES = [
    'Guitarras',
    'Teclados',
    'Instrumentos de Viento'
  ];
  const sortedCategories = [
    ...FAVORITE_CATEGORIES.filter(cat => firstLevels.includes(cat)),
    ...firstLevels.filter(cat => !FAVORITE_CATEGORIES.includes(cat))
  ];

  const page = parseInt(query.page || '1', 10);
  const perPage = 20;
  const totalPages = Math.ceil(all.length / perPage);
  const slice = all.slice(
    (page - 1) * perPage,
    (page - 1) * perPage + perPage
  );

  return {
    props: { slice, firstLevels: sortedCategories, page, totalPages }
  };
}

export default function Inicio({ slice, firstLevels, page, totalPages }) {
  const router = useRouter();
  const cambiarPagina = n =>
    router.push({ pathname: '/', query: { page: n } });

  return (
    <main className="bg-white w-full mx-auto p-6 space-y-6">
      <section className="mb-4">
        <div className="flex flex-wrap gap-2">
          {firstLevels.map(cat => (
            <Link
              key={cat}
              href={{
                pathname: `/categories/${encodeURIComponent(cat)}`,
                query: { page: 1 }
              }}
              legacyBehavior
            >
              <a className="px-3 py-1 text-sm rounded hover:bg-gray-100 border-none">
                {translateCategory(cat)}
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-products-xl gap-6 justify-items-center">
        {slice.map(product => (
          <Card key={product.ArticleNumber} product={product} />
        ))}
      </section>

      <section className="flex items-center justify-center space-x-4">
        <Button
          onClick={() => cambiarPagina(page - 1)}
          variant="outline"
          disabled={page <= 1}
        >
          ← Anterior
        </Button>
        <span className="text-sm">
          Página {page} de {totalPages}
        </span>
        <Button
          onClick={() => cambiarPagina(page + 1)}
          variant="outline"
          disabled={page >= totalPages}
        >
          Siguiente →
        </Button>
      </section>
    </main>
);
}
