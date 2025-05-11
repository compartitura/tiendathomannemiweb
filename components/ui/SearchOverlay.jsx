// components/ui/SearchOverlay.jsx
import React, { useState, useEffect, useRef } from 'react';
import { translateCategory } from '../../utils/translations';

export default function SearchOverlay({ products, onClose }) {
  const [isMobile, setIsMobile] = useState(false);
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

  // detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // close on outside click
  useEffect(() => {
    const handleClick = e => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (!Array.isArray(products)) return null;

  // compute lists
  const brands = Array.from(new Set(
    products
      .filter(p => !categoryFilter || (p.CategoryTree || '').includes(categoryFilter))
      .map(p => p.Brand)
  ))
    .filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
    .sort();

  const subcategories = Array.from(new Set(
    products
      .filter(p => !brandFilter || p.Brand === brandFilter)
      .map(p => (p.CategoryTree || '').split('>')[1]?.trim())
      .filter(Boolean)
  ))
    .filter(c => translateCategory(c).toLowerCase().includes(categorySearch.toLowerCase()))
    .sort();

  // filter logic
  useEffect(() => {
    let results = products;
    if (query.trim().length >= 3 && (brandFilter || categoryFilter)) {
      results = results.filter(p =>
        `${p.Brand} ${p.Model} ${p.CategoryTree}`.toLowerCase().includes(query.toLowerCase())
      );
    } else if (!query && !brandFilter && !categoryFilter) {
      results = [...products]
        .map(p => ({ ...p, favCount: JSON.parse(localStorage.getItem(`favorite-${p.ArticleNumber}`))?.count || 0 }))
        .sort((a, b) => b.favCount - a.favCount)
        .slice(0, 10);
    }
    if (brandFilter) results = results.filter(p => p.Brand === brandFilter);
    if (categoryFilter) results = results.filter(p => (p.CategoryTree || '').includes(categoryFilter));
    setFilteredProducts(results);
    setVisibleCount(25);
  }, [query, brandFilter, categoryFilter, products]);

  const noFilters = !brandFilter && !categoryFilter;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-start p-0" style={{ height: '100vh' }}>
      <div ref={overlayRef} className="relative w-full max-w-lg bg-white flex flex-col rounded-lg shadow-lg" style={{ height: '100vh' }}>
        {/* header */}
        <div className="flex items-center px-4 py-2 border-b">
          <img src="https://www.compartitura.org/medias/images/compraoriginal.jpg" alt="Compartitura.org" className="w-8 h-8 mr-2" />
          <h3 className="text-lg font-semibold">Busca entre {products.length} productos</h3>
        </div>
        {/* close button */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">X</button>
        {/* filters */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            {/* subcategories */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={isMobile ? 'Buscar' : 'Buscar productos...'}
                value={categorySearch}
                onChange={e => {
                  setCategorySearch(e.target.value);
                  if (categorySelectRef.current) categorySelectRef.current.size = Math.min(subcategories.length, 6);
                }}
                className="w-full border border-gray-300 rounded px-2 py-1 pr-6"
                onBlur={() => { if (categorySelectRef.current && !categorySearch) categorySelectRef.current.size = 1; }}
              />
              {categorySearch && <button onClick={() => setCategorySearch('')} className="absolute top-1 right-2 text-gray-400 hover:text-black">✕</button>}
              <select
                ref={categorySelectRef}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded px-2 py-1"
              >
                <option value="">{isMobile ? 'Productos' : 'Todos los productos'}</option>
                {subcategories.map(c => <option key={c} value={c}>{translateCategory(c)}</option>)}
              </select>
              {categoryFilter && <button onClick={() => setCategoryFilter('')} className="absolute top-10 right-2 text-gray-400 hover:text-black">✕</button>}
            </div>
            {/* brands */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={isMobile ? 'Buscar' : 'Buscar fabricantes...'}
                value={brandSearch}
                onChange={e => {
                  setBrandSearch(e.target.value);
                  if (brandSelectRef.current) brandSelectRef.current.size = Math.min(brands.length, 6);
                }}
                className="w-full border border-gray-300 rounded px-2 py-1 pr-6"
                onBlur={() => { if (brandSelectRef.current && !brandSearch) brandSelectRef.current.size = 1; }}
              />
              {brandSearch && <button onClick={() => setBrandSearch('')} className="absolute top-1 right-2 text-gray-400 hover:text-black">✕</button>}
              <select
                ref={brandSelectRef}
                value={brandFilter}
                onChange={e => setBrandFilter(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded px-2 py-1"
              >
                <option value="">{isMobile ? 'Fabricantes' : 'Todos los fabricantes'}</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {brandFilter && <button onClick={() => setBrandFilter('')} className="absolute top-10 right-2 text-gray-400 hover:text-black">✕</button>}
            </div>
          </div>
          {/* dynamic text */}
          <div className="text-sm text-gray-700 text-left">
            {noFilters ? (
              <span>LOS <strong>{filteredProducts.length}</strong> PRODUCTOS QUE MÁS LES GUSTAN A LOS USUARIOS DE COMPARTITURA <span className="text-red-500">❤️</span></span>
            ) : (
              <span>Disponemos de <strong>{filteredProducts.length}</strong> <strong>{categoryFilter || 'productos'}</strong> fabricados por <strong>{brandFilter || 'todos los fabricantes'}</strong></span>
            )}
          </div>
        </div>
        {/* product list */}
        <div className="flex-1 overflow-auto touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
          <ul className="space-y-4 p-4">
            {filteredProducts.slice(0, visibleCount).map(product => {
              const fav = JSON.parse(localStorage.getItem(`favorite-${product.ArticleNumber}`)) || { count: 0 };
              return (
                <li key={product.ArticleNumber} className="flex gap-4 border-b pb-4">
                  <img src={product.ImageURL || '/logo-compartitura3.png'} alt={product.Model} className="w-20 h-20 object-contain rounded" onError={e => e.currentTarget.src = '/logo-compartitura3.png'} />
                  <div className="flex-grow text-sm text-gray-700">
                    <a href={product.affiliateURL} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 hover:underline font-medium">{product.Brand} {product.Model}</a>
                    {product.Description && <p className="text-xs mt-1 line-clamp-2">{product.Description}</p>}
                    <div className="text-xs font-semibold mt-1 text-red-500 flex items-center">❤️ {fav.count}</div>
                  </div>
                </li>
              );
            })}
          </ul>
          {filteredProducts.length > visibleCount && <div className="text-center p-4"><button onClick={() => setVisibleCount(visibleCount + 25)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Cargar más</button></div>}
        </div>
      </div>
    </div>
  );
}
