// components/ui/Layout.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import SearchOverlay from './SearchOverlay';

export default function Layout({ children }) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data?.default && Array.isArray(data.default)) {
          setProducts(data.default);
        } else {
          console.error("El formato de products.json no es válido");
        }
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearchClick={() => setSearchOpen(true)} />
      <main className="flex-grow">{children}</main>
      {isSearchOpen && <SearchOverlay products={products} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
