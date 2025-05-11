// components/ui/Header.jsx
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { translateCategory } from '../../utils/translations';

export default function Header({ onSearchClick }) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const headerRef = useRef();

  useEffect(() => {
    // Load total count of products
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => {
        const count = Array.isArray(data) ? data.length : Array.isArray(data.default) ? data.default.length : 0;
        setTotalCount(count);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Load categories
    const fetchCategories = async () => {
      const res = await fetch('/data/products.json');
      const data = await res.json();
      const cats = Array.from(
        new Set(
          data.map(p => (p.CategoryTree || '').split('>')[0].trim()).filter(Boolean)
        )
      ).sort();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside header
    const handleClickOutside = e => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 bg-white z-50 shadow">
      <div className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-between items-center h-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-black text-white px-3 py-1 rounded-md text-sm"
          >
            ☰ Categorías
          </button>
        </div>
        <div
          onClick={onSearchClick}
          className="cursor-pointer bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-500 hover:shadow-inner w-full max-w-[220px] text-center"
        >
          {totalCount} productos
        </div>
      </div>

      {showMenu && (
        <div onMouseLeave={() => setShowMenu(false)} className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 max-h-[60vh] overflow-y-auto shadow-xl z-40">
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
