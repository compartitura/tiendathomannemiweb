// pages/categories/[...slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import axios from 'axios';
import cheerio from 'cheerio';
import Link from 'next/link';
import { useRouter } from 'next/router';

const USER_AGENT = 'Mozilla/5.0 (compatible; Bot/1.0)';

// Función para extraer descripción de Thomann
async function fetchDescription(url) {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const $ = cheerio.load(html);
  let desc = $('meta[name="description"]').attr('content') || '';
  if (!desc) desc = $('meta[property="og:description"]').attr('content') || '';
  const sel = '#tab-description, .long-description, section#product-description';
  let longText = '';
  $(sel).each((_, el) => longText += $(el).text().trim() + '\n\n');
  return (longText.trim() || desc.trim()).replace(/\s+/g, ' ');
}

export async function getServerSideProps({ params, query }) {
  // 1) Leer JSON desde la raíz
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const all = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2) Filtrar por categoría
  const slugArray = params.slug || [];
  const prefix = slugArray.join(' > ').toLowerCase();
  const items = all.filter(p =>
    String(p.CategoryTree || '').toLowerCase().startsWith(prefix)
  );

  // 3) Subcategorías inmediatas
  const subs = new Set();
  items.forEach(p => {
    const levels = String(p.CategoryTree || '').split('>').map(s => s.trim());
    if (levels.length > slugArray.length) subs.add(levels[slugArray.length]);
  });

  // 4) Paginación
  const page = parseInt(query.page || '1', 10);
  const perPage = 20;
  const totalPages = Math.ceil(items.length / perPage);
  const slice = items.slice((page - 1) * perPage, (page - 1) * perPage + perPage);

  // 5) Enriquecer descripciones dinámicamente
  await Promise.all(slice.map(async p => {
    if (!p.Description || !p.Description.trim()) {
      const rawUrl = (p.ProductURL || p.affiliateURL || '').trim();
      const cleanUrl = rawUrl.replace(/\s.*$/, '');
      try {
        p.Description = await fetchDescription(cleanUrl);
      } catch {
        p.Description = '(sin descripción disponible)';
      }
    }
  }));

  return {
    props: {
      slug: slugArray,
      subcategories: Array.from(subs).sort(),
      slice,
      page,
      totalPages
    }
  };
}

export default function CategoryPage({ slug, subcategories, slice, page, totalPages }) {
  const router = useRouter();
  const base = '/categories/' + slug.map(encodeURIComponent).join('/');
  const title = slug.length ? slug.join(' / ') : 'Categorías';

  const changePage = n => router.push({ pathname: base, query: { page: n } });

  return (
    <>
      <Head>
        <title>{title} – Nuestra Tienda</title>
        <meta name="description" content={`Explora productos en ${title}`} />
      </Head>
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-4">
          <Link href="/" className="hover:underline">Inicio</Link>
          {slug.map((part, i) => (
            <span key={i}>
              {' › '}
              <Link
                href={{ pathname: `/categories/${slug.slice(0, i+1).map(encodeURIComponent).join('/')}`, query:{ page: 1 } }}
                className="hover:underline"
              >
                {part}
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
                  key={sub}
                  href={`${base}/${encodeURIComponent(sub)}?page=1`}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  {sub}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid paginado con extracto de 60 car. */}
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slice.map(p => (
            <a
              key={p.ArticleNumber}
              href={p.affiliateURL}
              target="_blank"
              rel="noopener noreferrer"
              className="block border rounded-lg p-4 hover:shadow-lg transition"
            >
              <img
                src={p.ImageURL}
                alt={p.Model}
                loading="lazy"
                className="object-cover w-full h-48 rounded"
              />
              <h2 className="mt-2 font-semibold">{p.Brand} {p.Model}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {p.Description.length > 60
                  ? `${p.Description.slice(0, 60)}…`
                  : p.Description}
              </p>
              <p className="mt-2 text-sm text-blue-600">Comprar en Thomann →</p>
            </a>
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
      </div>
    </>
  );
}
