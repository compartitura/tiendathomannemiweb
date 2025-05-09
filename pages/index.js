// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export async function getServerSideProps({ query }) {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const all = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 1) Obtén todas las categorías de primer nivel
  const firstLevels = Array.from(
    new Set(
      all
        .map(p => (p.CategoryTree || '').split('>')[0].trim())
        .filter(Boolean)
    )
  ).sort();

  // 2) Define tus categorías favoritas en español
  const FAVORITE_CATEGORIES = [
    'Guitarras',
    'Teclados',
    'Instrumentos de Viento'
  ];

  // 3) Ordena: favoritas primero (si existen), luego el resto
  const sortedCategories = [
    ...FAVORITE_CATEGORIES.filter(cat => firstLevels.includes(cat)),
    ...firstLevels.filter(cat => !FAVORITE_CATEGORIES.includes(cat))
  ];

  // 4) Paginación sin filtros
  const page = parseInt(query.page || '1', 10);
  const perPage = 20;
  const totalPages = Math.ceil(all.length / perPage);
  const slice = all.slice((page - 1) * perPage, (page - 1) * perPage + perPage);

  return {
    props: {
      slice,
      firstLevels: sortedCategories,
      page,
      totalPages
    }
  };
}

export default function Inicio({ slice, firstLevels, page, totalPages }) {
  const router = useRouter();
  const cambiarPagina = n => router.push({ pathname: '/', query: { page: n } });

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Categorías favoritas + resto */}
      <section className="mb-4">
        <div className="flex flex-wrap gap-2">
          {firstLevels.map(cat => (
            <Link
              key={cat}
              href={{ pathname: `/categories/${encodeURIComponent(cat)}`, query: { page: 1 } }}
              className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slice.map(product => (
          <Card key={product.ArticleNumber} product={product} />
        ))}
      </section>

      {/* Paginación */}
      <section className="flex items-center justify-center space-x-4">
        <Button
          onClick={() => cambiarPagina(page - 1)}
          variant="outline"
          disabled={page <= 1}
        >
          ← Anterior
        </Button>
        <span className="text-sm">Página {page} de {totalPages}</span>
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
