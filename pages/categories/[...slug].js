// pages/categories/[...slug].js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import FilterSidebar from '../../components/ui/FilterSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export async function getServerSideProps({ params, query }) {
  const all = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8'));
  const slugArr = params.slug || [];
  const prefix = slugArr.join(' > ').toLowerCase();
  const inCategory = all.filter(p => (p.CategoryTree || '').toLowerCase().startsWith(prefix));

  const subs = Array.from(
    new Set(
      inCategory.map(p => {
        const levels = (p.CategoryTree || '').split('>').map(s => s.trim());
        return levels[slugArr.length];
      }).filter(Boolean)
    )
  ).sort();

  const FAVORITE_SUBCATEGORIES = ['Alto', 'Tenor', 'Soprano'];
  const sortedSubs = [
    ...FAVORITE_SUBCATEGORIES.filter(s => subs.includes(s)),
    ...subs.filter(s => !FAVORITE_SUBCATEGORIES.includes(s))
  ];

  const subItems = sortedSubs.map(sub => {
    const prod = inCategory.find(p =>
      (p.CategoryTree || '').split('>').map(s => s.trim())[slugArr.length] === sub
    );
    return {
      name: sub,
      slug: encodeURIComponent(sub),
      imageURL: prod?.ImageURL || '/placeholder.png'
    };
  });

  let filterDefs = [], filterQuery = {}, slice = [], page = 1, totalPages = 1;
  if (subItems.length === 0) {
    const brands = Array.from(new Set(inCategory.map(p => p.Brand))).sort();
    if (query.brand) filterQuery.brand = Array.isArray(query.brand) ? query.brand : [query.brand];
    let filtered = inCategory;
    if (filterQuery.brand) filtered = filtered.filter(p => filterQuery.brand.includes(p.Brand));
    page = parseInt(query.page || '1', 10);
    const perPage = 20;
    totalPages = Math.ceil(filtered.length / perPage);
    slice = filtered.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
    filterDefs = [{ name: 'Marcas', key: 'brand', options: brands }];
  }

  return { props: { slug: slugArr, subItems, filterDefs, filterQuery, slice, page, totalPages } };
}

export default function Categoria({ slug, subItems, filterDefs, filterQuery, slice, page, totalPages }) {
  const router = useRouter();
  const basePath = `/categories/${slug.map(encodeURIComponent).join('/')}`;
  const cambiarPagina = n => router.push({ pathname: basePath, query: { ...router.query, page: n } });

  return (
    <div className="bg-white w-full mx-auto p-6">
      <nav className="text-sm mb-4">
        <Link href="/" legacyBehavior>
          <a className={`${slug.length === 0 ? 'font-semibold text-primary' : 'hover:underline'}`}>Inicio</a>
        </Link>
        {slug.map((parte, i) => (
          <span key={i}> ›{' '}
            <Link href={{ pathname: `${basePath.split('/').slice(0, i + 2).join('/')}`, query: { page: 1 } }} legacyBehavior>
              <a className={`${i === slug.length - 1 ? 'font-semibold text-primary' : 'hover:underline'}`}>{parte}</a>
            </Link>
          </span>
        ))}
      </nav>

      {subItems.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-products-xl gap-6 justify-items-stretch">
          {subItems.map(item => (
            <Link key={item.name} href={{ pathname: `${basePath}/${item.slug}`, query: { page: 1 } }} legacyBehavior>
              <a className="block w-full bg-white rounded-lg overflow-hidden transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative w-full h-[248px]">
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                </div>
              </a>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-1/4"><FilterSidebar filterDefs={filterDefs} filterQuery={filterQuery} /></aside>
          <div className="flex-grow space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-products-xl gap-6 justify-items-center">
              {slice.map(product => <Card key={product.ArticleNumber} product={product} />)}
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