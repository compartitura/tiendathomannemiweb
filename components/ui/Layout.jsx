// components/ui/Layout.jsx
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto p-6 prose lg:prose-lg">
        {children}
      </main>
      <Footer />
    </div>
  );
}
