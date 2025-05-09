// components/ui/Card.jsx
import Image from 'next/image';
import Link from 'next/link';

export default function Card({ product }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition">
      <Link href={product.affiliateURL} legacyBehavior>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="relative w-full h-48">
            <Image
              src={product.ImageURL}
              alt={product.Model}
              layout="fill"
              objectFit="cover"
              placeholder="blur"
              blurDataURL="/placeholder.png" // puedes usar un placeholder genérico
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">
              {product.Brand} {product.Model}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {product.Description
                ? (product.Description.length > 60
                    ? `${product.Description.slice(0, 60)}…`
                    : product.Description)
                : '(sin descripción disponible)'
              }
            </p>
            <span className="text-primary font-medium">
              Comprar en Thomann →
            </span>
          </div>
        </a>
      </Link>
    </div>
  );
}
