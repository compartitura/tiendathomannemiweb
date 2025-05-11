// components/ui/SearchOverlay.jsx
import React, { useState, useEffect, useRef } from 'react';
import { translateCategory } from '../../utils/translations';

export default function SearchOverlay({ products, onClose }) {
  const [query, setQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(25);
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const brandSelectRef = useRef(null);
  const categorySelectRef = useRef(null);
  const overlayRef = useRef(null);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!Array.isArray(products)) return null;

  // Build options
  const brands = Array.from(new Set(
    products.filter(p => !categoryFilter || (p.CategoryTree || '').includes(categoryFilter)).map(p => p.Brand)
  ))
    .filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
    .sort();

  const subcategories = Array.from(new Set(
    products.filter(p => !brandFilter || p.Brand === brandFilter)
      .map(p => (p.CategoryTree || '').split('>')[1]?.trim())
      .filter(Boolean)
  ))
    .filter(c => translateCategory(c).toLowerCase().includes(categorySearch.toLowerCase()))
    .sort();

  // Filter products
  useEffect(() => {
    let results = products;

    if (query.trim().length >= 3 && (brandFilter || categoryFilter)) {
      results = results.filter(p =>
        `${p.Brand} ${p.Model} ${p.CategoryTree}`.toLowerCase().includes(query.toLowerCase())
      );
    } else if (!query && !brandFilter && !categoryFilter) {
      results = products
        .map(p => ({
          ...p,
          favCount: JSON.parse(localStorage.getItem(`favorite-${p.ArticleNumber}`))?.count || 0
        }))
        .sort((a, b) => b.favCount - a.favCount)
        .slice(0, 10);
    }

    if (brandFilter) {
      results = results.filter(p => p.Brand === brandFilter);
    }
    if (categoryFilter) {
      results = results.filter(p => (p.CategoryTree || '').includes(categoryFilter));
    }

    setFilteredProducts(results);
    setVisibleCount(25);
  }, [query, brandFilter, categoryFilter, products]);

  const noFilters = !brandFilter && !categoryFilter;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start pt-10 px-4">
      <div ref={overlayRef} className="w-full max-w-4xl bg-white rounded-lg p-4 shadow-lg">

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          {/* Subcategory Filter */}
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={categorySearch}
              onChange={e => {
                setCategorySearch(e.target.value);
                if (categorySelectRef.current) {
                  categorySelectRef.current.size = Math.min(subcategories.length, 6);
                }
              }}
              onBlur={() => categorySelectRef.current && !categorySearch && (categorySelectRef.current.size = 1)}
              className="w-full border border-gray-300 rounded px-2 py-1 pr-8"
            />
            {categorySearch && (
              <button
                onClick={() => { setCategorySearch(''); categorySelectRef.current.size = 1; }}
                className="absolute top-1 right-8 text-gray-400 hover:text-black"
              >✕</button>
            )}
            <select
              ref={categorySelectRef}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
              size={1}
            >
              <option value="">Todos los productos</option>
              {subcategories.map(c => (
                <option key={c} value={c}>{translateCategory(c)}</option>
              ))}
            </select>
            {categoryFilter && (
              <button onClick={() => setCategoryFilter('')} className="absolute top-11 right-2 text-gray-400 hover:text-black">✕</button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="w-full relative">
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
              onBlur={() => brandSelectRef.current && !brandSearch && (brandSelectRef.current.size = 1)}
              className="w-full border border-gray-300 rounded px-2 py-1 pr-8"
            />
            {brandSearch && (
              <button
                onClick={() => { setBrandSearch(''); brandSelectRef.current.size = 1; }}
                className="absolute top-1 right-8 text-gray-400 hover:text-black"
              >✕</button>
            )}
            <select
              ref={brandSelectRef}
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 mt-1"
              size={1}
            >
              <option value="">Todos los fabricantes</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {brandFilter && (
              <button onClick={() => setBrandFilter('')} className="absolute top-11 right-2 text-gray-400 hover:text-black">✕</button>
            )}
          </div>
        </div>

        {/* Dynamic Text */}
        <div className="text-sm text-gray-700 text-left mb-4">
          {noFilters ? (
            <div>
              LOS <strong className="text-black">{filteredProducts.length}</strong> PRODUCTOS QUE MÁS LES GUSTAN A LOS USUARIOS DE COMPARTITURA <span className="text-red-500">❤️</span>
            </div>
          ) : (
            <div>
              Disponemos de <strong className="text-black">{filteredProducts.length}</strong> <strong>{categoryFilter}</strong> fabricados por <strong>{brandFilter}</strong>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredProducts.length > 0 && (
          <>
            <ul className="max-h-[60vh] overflow-auto space-y-4">
              {filteredProducts.slice(0, visibleCount).map(product => {
                const favData = JSON.parse(localStorage.getItem(`favorite-${product.ArticleNumber}`)) || { count: 0 };
                return (
                  <li key={product.ArticleNumber} className="flex gap-4 border-b pb-4">
                    <img
                      src={product.ImageURL || '/logo-compartitura3.png'}
                      alt={product.Model}
                      className="w-20 h-20 object-contain bg-white rounded"
                      onError={e => (e.currentTarget.src = '/logo-compartitura3.png')} 
                    />
                    <div className="flex-grow text-gray-600">
                      <a
                        href={product.affiliateURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-800 hover:underline"
                      >
                        {product.Brand} {product.Model}
                      </a>
                      {product.Description && <p className="text-xs mt-1 line-clamp-2">{product.Description}</p>}
                      <div className="text-xs font-semibold mt-1 text-red-500 flex items-center">❤️ {favData.count}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {filteredProducts.length > visibleCount && (
              <div className="text-center mt-4">
                <button onClick={() => setVisibleCount(prev => prev + 25)} className="px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200">Cargar más</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
