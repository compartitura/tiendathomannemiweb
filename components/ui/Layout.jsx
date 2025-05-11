// components/ui/Layout.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import SearchOverlay from './SearchOverlay';

export default function Layout({ children }) {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error cargando productos:', err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearchClick={() => setSearchOpen(true)} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {isSearchOpen && (
        <SearchOverlay products={products} onClose={() => setSearchOpen(false)} />
      )}
    </div>
  );
}
