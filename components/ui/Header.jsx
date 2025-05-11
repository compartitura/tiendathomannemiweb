// components/ui/Header.jsx
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { translateCategory } from '../../utils/translations';

export default function Header({ onSearchClick }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [availableCount, setAvailableCount] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    // Fetch products to build categories and compute available count
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => {
        // Build top-level categories
        const cats = Array.from(new Set(
          data.map(p => (p.CategoryTree || '').split('>')[0].trim()).filter(Boolean)
        )).sort();
        setCategories(cats);

        // Compute available count for current page (excluding home)
        if (router.pathname !== '/') {
          let count = 0;
          if (router.pathname.startsWith('/categories')) {
            const slugArr = router.query.slug || [];
            const prefix = slugArr.join(' > ').toLowerCase();
            count = data.filter(p =>
              (p.CategoryTree || '').toLowerCase().startsWith(prefix)
            ).length;
          } else {
            // Other pages: total available products in catalog
            count = data.length;
          }
          setAvailableCount(count);
        }
      });
  }, [router.asPath]);

  // Close menu when clicking outside header
  useEffect(() => {
    const handleOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [showMenu]);

  return (
    <header ref={menuRef} className="fixed top-0 left-0 right-0 bg-white z-50 shadow">
      <div className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-between items-center h-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-black text-white px-3 py-1 rounded-md text-sm"
          >
            ☰ Categorías
          </button>
          {availableCount !== null && (
            <span className="text-sm text-gray-600">{availableCount} disponibles</span>
          )}
        </div>
        <div
          onClick={onSearchClick}
          className="cursor-pointer bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-500 hover:shadow-inner w-full max-w-[220px] text-right"
        >
          Buscar productos...
        </div>
      </div>

      {showMenu && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 max-h-[60vh] overflow-y-auto shadow-xl z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
            {categories.map(cat => (
              <Link
                key={cat}
                href={{ pathname: `/categories/${encodeURIComponent(cat)}`, query: { page: 1 } }}
                className="text-gray-700 hover:text-black hover:underline"
              >
                {translateCategory(cat)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
