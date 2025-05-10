// pages/categories/[...slug].js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useRouter } from 'next/router';
import FilterSidebar from '../../components/ui/FilterSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export async function getServerSideProps({ params, query }) {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  const all = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const slugArr = params.slug || [];
  const prefix = slugArr.join(' > ').toLowerCase();

  const inCategory = all.filter(p =>
    (p.CategoryTree || '').toLowerCase().startsWith(prefix)
  );

  const subs = Array.from(new Set(
    inCategory.map(p => {
      const levels = (p.CategoryTree || '').split('>').map(s => s.trim());
      return levels[slugArr.length];
    }).filter(Boolean)
  )).sort();

  const subItems = subs.map(sub => {
    const prod = inCategory.find(p => {
      const levels = (p.CategoryTree || '').split('>').map(s => s.trim());
      return levels[slugArr.length] === sub;
    });
    return {
      name: sub,
      slug: encodeURIComponent(sub),
      imageURL: prod?.ImageURL || '/placeholder.png',
    };
  });

  let filterDefs = [], filterQuery = {}, slice = [], page = 1, totalPages = 1;
  if (subItems.length === 0) {
    const brands = Array.from(new Set(inCategory.map(p => p.Brand))).sort();
    if (query.brand) {
      filterQuery.brand = Array.isArray(query.brand) ? query.brand : [query.brand];
    }
    let filtered = inCategory;
    if (filterQuery.brand) {
      filtered = filtered.filter(p => filterQuery.brand.includes(p.Brand));
    }
    page = parseInt(query.page || '1', 10);
    const perPage = 20;
    totalPages = Math.ceil(filtered.length / perPage);
    slice = filtered.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
    filterDefs = [{ name: 'Marcas', key: 'brand', options: brands }];
  }

  return {
    props: {
      slug: slugArr,
      subItems,
      filterDefs,
      filterQuery,
      slice,
      page,
      totalPages
    }
  };
}

export default function Categoria({
  slug,
  subItems,
  filterDefs,
  filterQuery,
  slice,
  page,
  totalPages
}) {
  const router = useRouter();
  const basePath = `/categories/${slug.map(encodeURIComponent).join('/')}`;

  const cambiarPagina = n => {
    router.push({ pathname: basePath, query: { ...router.query, page: n } });
  };

  return (
    <div className="w-full mx-auto px-4">
      <nav className="text-sm mb-4">
        <Link href="/" legacyBehavior><a className="hover:underline">Inicio</a></Link>
        {slug.map((parte, i) => (
          <span key={i}>
            {' › '}
            <Link
              href={{
                pathname: `${basePath.split('/').slice(0, i + 2).join('/')}`,
                query: { page: 1 }
              }}
              legacyBehavior
            >
              <a className="hover:underline">{parte}</a>
            </Link>
          </span>
        ))}
      </nav>

      {subItems.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-6">
          {subItems.map(item => (
            <Link
              key={item.name}
              href={{ pathname: `${basePath}/${item.slug}`, query: { page: 1 } }}
              legacyBehavior
            >
              <a className="block border rounded-lg overflow-hidden hover:shadow-lg transition p-4 w-[248px]">
                <div className="w-[248px] h-[248px] mx-auto">
                  <img src={item.imageURL} alt={item.name} className="object-cover w-[248px] h-[248px] mx-auto" />
                </div>
                <h3 className="mt-4 font-semibold text-center">{item.name}</h3>
              </a>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-1/4">
            <FilterSidebar filterDefs={filterDefs} filterQuery={filterQuery} />
          </aside>
          <div className="flex-grow space-y-6">
            <div className="flex flex-wrap justify-center gap-6">
              {slice.map(p => <Card key={p.ArticleNumber} product={p} />)}
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={() => cambiarPagina(page - 1)} variant="outline" disabled={page <= 1}>← Anterior</Button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <Button onClick={() => cambiarPagina(page + 1)} variant="outline" disabled={page >= totalPages}>Siguiente →</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}