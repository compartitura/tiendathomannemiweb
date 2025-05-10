// components/ui/Layout.jsx
import React from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-secondary text-white p-4">
        <div className="max-w-5xl mx-auto flex items-center">
          <Link href="/" legacyBehavior>
            <a className="text-xl font-bold">Mi Tienda Thomann</a>
          </Link>
        </div>
      </header>

      <main className="flex-grow bg-gray-50">
        {children}
      </main>

      <footer className="bg-secondary text-white text-center py-4">
        © {new Date().getFullYear()} Mi Tienda Thomann. Todos los derechos reservados.
      </footer>
    </div>
  );
}
