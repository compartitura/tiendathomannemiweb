// pages/categories/[...slug].js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export async function getStaticPaths() {
  const products = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );

  // 1. Recopilar todos los árboles de categoría únicos
  const pathsSet = new Set();
  products.forEach(p => {
    const levels = String(p.CategoryTree || '').split('>').map(s => s.trim());
    // Para cada prefijo no vacío, crear un path
    for (let i = 1; i <= levels.length; i++) {
      const slugArray = levels.slice(0, i);
      pathsSet.add(JSON.stringify(slugArray));
    }
  });

  // 2. Convertir a params
  const paths = Array.from(pathsSet).map(str =>
    ({ params: { slug: JSON.parse(str) } })
  );

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const products = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf-8')
  );
  const { slug } = params; // slug es un array de strings
  // Reconstruir el tree tal como en JSON
  const target = slug.join(' > ');

  // Filtrar productos cuya CategoryTree empieza con target
  const items = products.filter(p =>
    String(p.CategoryTree || '').toLowerCase().startsWith(target.toLowerCase())
  );

  return {
    props: {
      slug,
      items
    }
  };
}

export default function CategoryPage({ slug, items }) {
  const title = slug.join(' / ');
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-4">
        <Link href="/"><a className="hover:underline">Inicio</a></Link>
        {slug.map((part, i) => (
          <span key={i}>
            {' › '}
            <Link href={`/categories/${slug.slice(0, i+1).map(encodeURIComponent).join('/')}`}>
              <a className="hover:underline">{part}</a>
            </Link>
          </span>
        ))}
      </nav>

      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      {/* Listado de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(p => (
          <Link legacyBehavior key={p.ArticleNumber} href={`/products/${p.ArticleNumber}`}>
            <a className="border rounded-lg p-4 hover:shadow-lg">
              <img
                src={p.ImageURL}
                alt={p.Model}
                loading="lazy"
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="mt-2 font-semibold">{p.Brand} {p.Model}</h2>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
