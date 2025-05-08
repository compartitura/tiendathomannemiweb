// pages/index.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const perPage = 20;

  // Carga categorías
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories);
      } catch (e) {
        console.error(e);
      }
    }
    fetchCategories();
  }, []);

  // Carga productos con filtros y paginación
  async function loadProducts(pageNum = 1) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        perPage: perPage.toString(),
      });
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProducts(data.items);
      setTotal(data.total);
      setPage(pageNum);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Montaje inicial
  useEffect(() => {
    loadProducts(1);
  }, []);

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <Head>
        <title>
          {search
            ? `Resultados para "${search}" - Página ${page}`
            : category
            ? `Categoría "${category}" - Página ${page}`
            : `Tienda Thomann - Página ${page}`}
        </title>
        <meta
          name="description"
          content={`Explora ${products.length} productos${
            search ? ` filtrados por "${search}"` : ''
          }${category ? ` en la categoría "${category}"` : ''}.`}
        />
      </Head>

      {/* Filtros */}
      <div className="p-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por marca o modelo…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => loadProducts(1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {/* Estado */}
      {loading && <p className="p-6">Cargando…</p>}
      {error && <p className="p-6 text-red-600">Error: {error}</p>}

      {/* Productos */}
      {!loading && !error && (
        <main className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
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
                <h2 className="mt-2 font-semibold text-gray-800">
                  {p.Brand} {p.Model}
                </h2>
              </a>
            </Link>
          ))}
        </main>
      )}

      {/* Paginación */}
      <div className="p-6 flex justify-center items-center space-x-4">
        <button
          onClick={() => loadProducts(page - 1)}
          disabled={page <= 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => loadProducts(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </>
  );
}
