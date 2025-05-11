// components/ui/Header.jsx
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { translateCategory } from '../../utils/translations';

export default function Header({ onSearchClick }) {
  const [showMenu, setShowMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const menuRef = useRef();

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      const cats = Array.from(new Set(
        data.map(p => (p.CategoryTree || '').split('>')[0].trim()).filter(Boolean)
      )).sort();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousemove', handleOutside);
    }
    return () => document.removeEventListener('mousemove', handleOutside);
  }, [showMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow">
      <div className="w-full px-4 py-3 flex justify-between items-center h-20">
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
          className="cursor-pointer bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-500 hover:shadow-inner w-full max-w-[220px] text-right"
        >
          115.465 productos... 🔍︎
        </div>
      </div>

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 max-h-[60vh] overflow-y-auto shadow-xl z-40"
        >
          <div className="w-full px-4 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
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
