// components/ui/Header.jsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-white py-4 shadow">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compartitura Shop</h1>
        <nav className="space-x-4">
          <Link href="/" legacyBehavior>
            <a className="hover:underline">Inicio</a>
          </Link>
          <Link href="/categories" legacyBehavior>
            <a className="hover:underline">Categorías</a>
          </Link>
        </nav>
      </div>
    </header>
  );
}
