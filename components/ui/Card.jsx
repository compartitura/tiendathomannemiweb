// components/ui/Card.jsx
import Link from 'next/link';
import React, { useState } from 'react';

const FALLBACK = '/logo-compartitura3.png';

export default function Card({ product }) {
  const { Brand, Model, ImageURL, Description, affiliateURL } = product;
  const title = `${Brand} ${Model}`;
  const snippet =
    Description?.length > 60 ? Description.slice(0, 60) + '…' : Description;

  const [src, setSrc] = useState(ImageURL || FALLBACK);

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col">
      <Link href={affiliateURL} legacyBehavior>
        <a
          className="block w-full h-[248px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={src}
            alt={Model}
            className="object-contain w-full h-full"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK;
            }}
          />
        </a>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {snippet && (
          <p className="text-sm text-gray-600 mb-4 flex-grow">{snippet}</p>
        )}
        <div className="mt-auto flex justify-center">
          <Link href={affiliateURL} legacyBehavior>
            <a
              className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="mr-2" role="img" aria-label="carrito">
                🛒
              </span>
              Más información y compra
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
