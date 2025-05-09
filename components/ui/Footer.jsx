// components/ui/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-6">
      <div className="max-w-5xl mx-auto px-6 text-center text-sm">
        © {new Date().getFullYear()} Compartitura.org, Todos los derechos reservados.
      </div>
    </footer>
  );
}