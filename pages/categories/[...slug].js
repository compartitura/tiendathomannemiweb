// pages/categories/[...slug].js
import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useRouter } from 'next/router';

export async function getServerSideProps({ params, query }) {
  const all = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );
  const slugArray = params.slug || [];
  const prefix = slugArray.join(' > ').toLowerCase();

  const items = all.filter(p =>
    String(p.CategoryTree||'').toLowerCase().startsWith(prefix)
  );

  const subs = new Set();
  items.forEach(p => {
    const levels = String(p.CategoryTree||'').split('>').map(s=>s.trim());
    if (levels.length > slugArray.length) subs.add(levels[slugArray.length]);
  });

  const page = parseInt(query.page||'1',10);
  const perPage = 20;
  const totalPages = Math.ceil(items.length/perPage);
  const slice = items.slice((page-1)*perPage, (page-1)*perPage+perPage);

  return {
    props: {
      slug: slugArray,
      subcategories: Array.from(subs).sort(),
      slice, page, totalPages
    }
  };
}

export default function CategoryPage({ slug, subcategories, slice, page, totalPages }) {
  const router = useRouter();
  const base = '/categories/'+slug.map(encodeURIComponent).join('/');

  const changePage = n => router.push({ pathname: base, query: { page: n } });
  const title = slug.length? slug.join(' / '): 'Categorías';

  return (
    <>
      <Head><title>{title}</title></Head>
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-4">
          <a href="/" className="hover:underline">Inicio</a>
          {slug.map((part,i)=>(
            <span key={i}>{' › '}
              <a href={`/categories/${slug.slice(0,i+1).map(encodeURIComponent).join('/')}?page=1`} className="hover:underline">{part}</a>
            </span>
          ))}
        </nav>

        {/* Subcategorías */}
        {subcategories.length>0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Subcategorías</h2>
            <div className="flex flex-wrap gap-2">
              {subcategories.map(sub=>(
                <a key={sub} href={`${base}/${encodeURIComponent(sub)}?page=1`} className="px-3 py-1 border rounded hover:bg-gray-100">{sub}</a>
              ))}
            </div>
          </div>
        )}

        {/* Grid paginado con enlace afiliado */}
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slice.map(p=>(
            <a key={p.ArticleNumber} href={p.affiliateURL} target="_blank" rel="noopener noreferrer"
               className="block border rounded-lg p-4 hover:shadow-lg transition">
              <img src={p.ImageURL} alt={p.Model} loading="lazy" className="object-cover w-full h-48 rounded"/>
              <h2 className="mt-2 font-semibold">{p.Brand} {p.Model}</h2>
              {p.Description && <p className="mt-1 text-sm text-gray-600">{p.Description.length>100?`${p.Description.slice(0,100)}…`:p.Description}</p>}
              <p className="mt-2 text-sm text-blue-600">Comprar en Thomann →</p>
            </a>
          ))}
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button onClick={()=>changePage(page-1)} disabled={page<=1} className="px-4 py-2 border rounded disabled:opacity-50">← Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={()=>changePage(page+1)} disabled={page>=totalPages} className="px-4 py-2 border rounded disabled:opacity-50">Siguiente →</button>
        </div>
      </div>
    </>
  );
}
