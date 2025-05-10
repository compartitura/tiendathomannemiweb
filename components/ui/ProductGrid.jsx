// components/ProductGrid.jsx
import React from 'react';
import Image from 'next/image';

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-products-xl gap-6 p-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="mt-2 text-sm text-gray-600">{product.description}</p>
            <div className="mt-4 font-bold">${product.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
