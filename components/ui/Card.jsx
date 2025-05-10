// components/ui/Card.jsx
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

export default function Card({ product }) {
  const { ArticleNumber, Brand, Model, ImageURL, Description, affiliateURL } = product;
  const title = `${Brand} ${Model}`;
  const snippet = Description?.length > 60
    ? Description.slice(0, 60) + '…'
    : Description;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <Link href={affiliateURL} legacyBehavior>
        <a className="block relative w-full h-48">
          <Image
            src={ImageURL}
            alt={Model}
            fill
            className="object-cover"
          />
        </a>
      </Link>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {snippet && <p className="text-sm text-gray-600 mb-4">{snippet}</p>}
        <Link href={affiliateURL} legacyBehavior>
          <a className="text-sm text-primary hover:underline">Ver en Thomann</a>
        </Link>
      </div>
    </div>
  );
}
