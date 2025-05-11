// components/ui/SearchOverlay.jsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { translateCategory } from '../../utils/translations';

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [animatedCount, setAnimatedCount] = useState(0);
  const [products, setProducts] = useState([]);
  const brandSelectRef = useRef(null);
  const categorySelectRef = useRef(null);

  const STATIC_TOTAL = 115465;

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const brands = Array.from(new Set(
    products
      .filter(p => !categoryFilter || (p.CategoryTree || '').split('>')[0].trim() === categoryFilter)
      .map(p => p.Brand)
  ))
    .filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
    .sort();

  const categories = Array.from(new Set(
    products
      .filter(p => !brandFilter || p.Brand === brandFilter)
      .map(p => (p.CategoryTree || '').split('>')[0].trim())
  ))
    .filter(c => translateCategory(c).toLowerCase().includes(categorySearch.toLowerCase()))
    .sort();

  useEffect(() => {
    let results = products;

    if (query.trim().length >= 3 && (brandFilter || categoryFilter)) {
      results = results.filter(product =>
        `${product.Brand} ${product.Model} ${product.CategoryTree}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    } else if (!query && !brandFilter && !categoryFilter) {
      results = [...products]
        .map(p => {
          const favData = JSON.parse(localStorage.getItem(`favorite-${p.ArticleNumber}`)) || { count: 0 };
          return { ...p, favCount: favData.count };
        })
        .sort((a, b) => b.favCount - a.favCount)
        .slice(0, 10);
    }

    if (brandFilter) {
      results = results.filter(p => p.Brand === brandFilter);
    }

    if (categoryFilter) {
      results = results.filter(p =>
        (p.CategoryTree || '').split('>')[0].trim() === categoryFilter
      );
    }

    setFilteredProducts(results);
  }, [query, brandFilter, categoryFilter, products]);

  useEffect(() => {
    let start = 0;
    const end = STATIC_TOTAL;
    const duration = 5000;
    const increment = end / (duration / 30);
    const animate = () => {
      start += increment;
      if (start < end) {
        setAnimatedCount(Math.ceil(start));
        setTimeout(animate, 30);
      } else {
        setAnimatedCount(end);
      }
    };
    animate();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start pt-10 px-4">
      <div className="w-full max-w-4xl bg-white rounded-lg p-4 shadow-lg relative">
        <div className="absolute top-2 left-4 flex items-center space-x-2">
          <img src="https://www.compartitura.org/medias/images/transportecompartiturapng.png" alt="logo" className="w-[50px] h-[50px]" />
          <h3 className="text-sm text-gray-500 font-semibold">Compartitura.org</h3>
        </div>
        <div className="absolute top-2 right-4">
          <img src="https://www.compartitura.org/medias/images/thomann-partner.gif" alt="Thomann" className="w-[110px] h-[35px] object-contain" />
        </div>

        <div className="mt-10 mb-4">
          <h2 className="text-lg font-semibold mb-2 text-center text-gray-500">
            Busca instrumentos y accesorios entre{' '}
            <span className="text-xl font-bold text-black">{filteredProducts.length || animatedCount}</span>{' '}
            artículos
          </h2>
          <div className="flex items-center">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={brandFilter || categoryFilter ? "¿Qué modelo buscas?" : "Elige al menos un filtro"}
              className="w-full bg-black text-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              disabled={!brandFilter && !categoryFilter}
              autoFocus
            />
            <button
              onClick={onClose}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✖️
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <div className="w-full">
            <input
              type="text"
              placeholder="Buscar fabricante..."
              value={brandSearch}
              onChange={e => {
                setBrandSearch(e.target.value);
                if (brandSelectRef.current) {
                  brandSelectRef.current.size = Math.min(brands.length, 6);
                }
              }}
              onBlur={() => {
                if (brandSelectRef.current && !brandSearch) brandSelectRef.current.size = 1;
              }}
              className="w-full mb-1 border border-gray-300 rounded px-2 py-1"
            />
            <select
              ref={brandSelectRef}
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Todos los fabricantes</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <input
              type="text"
              placeholder="Buscar instrumento..."
              value={categorySearch}
              onChange={e => {
                setCategorySearch(e.target.value);
                if (categorySelectRef.current) {
                  categorySelectRef.current.size = Math.min(categories.length, 6);
                }
              }}
              onBlur={() => {
                if (categorySelectRef.current && !categorySearch) categorySelectRef.current.size = 1;
              }}
              className="w-full mb-1 border border-gray-300 rounded px-2 py-1"
            />
            <select
              ref={categorySelectRef}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Todos los instrumentos</option>
              {categories.map(c => (
                <option key={c} value={c}>{translateCategory(c)}</option>
              ))}
            </select>
          </div>
        </div>

        {(!query && !brandFilter && !categoryFilter) && (
          <div className="text-sm font-semibold mb-2 flex items-center text-gray-500">
            Los diez que más gustan
            <svg className="w-5 h-5 ml-2 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <ul className="max-h-[70vh] overflow-auto space-y-4">
            {filteredProducts.map(product => {
              const favData = JSON.parse(localStorage.getItem(`favorite-${product.ArticleNumber}`)) || { count: 0 };
              return (
                <li key={product.ArticleNumber} className="flex gap-4 border-b pb-4">
                  <img
                    src={product.ImageURL || '/logo-compartitura3.png'}
                    alt={product.Model}
                    className="w-20 h-20 object-contain flex-shrink-0 bg-white rounded"
                    onError={e => (e.currentTarget.src = '/logo-compartitura3.png')}
                  />
                  <div className="flex-grow text-sm text-gray-600">
                    <a
                      href={product.affiliateURL || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {product.Brand} {product.Model}
                    </a>
                    {product.Description && (
                      <p className="text-xs mt-1 line-clamp-2">
                        {product.Description}
                      </p>
                    )}
                    <div className="text-xs font-semibold mt-1 text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {favData.count || 0}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          query.length >= 3 && <p className="text-sm text-gray-500">No se encontraron productos.</p>
        )}
      </div>
    </div>
  );
}
