import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const FALLBACK = '/logo-compartitura3.png';

export default function Card({ product }) {
  const { Brand, Model, ImageURL, Description, affiliateURL, ArticleNumber } = product;
  const title = `${Brand} ${Model}`;
  const snippet =
    Description?.length > 60 ? Description.slice(0, 60) + '…' : Description;

  const [src, setSrc] = useState(ImageURL || FALLBACK);
  const [favorite, setFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    const favData = JSON.parse(localStorage.getItem(`favorite-${ArticleNumber}`));
    if (favData) {
      setFavorite(favData.favorite);
      setFavoriteCount(favData.count);
    } else {
      const initialCount = Math.floor(Math.random() * 100);
      setFavoriteCount(initialCount);
      localStorage.setItem(
        `favorite-${ArticleNumber}`,
        JSON.stringify({ favorite: false, count: initialCount })
      );
    }
  }, [ArticleNumber]);

  const toggleFavorite = () => {
    setFavorite((prev) => {
      const newFav = !prev;
      const newCount = newFav ? favoriteCount + 1 : favoriteCount - 1;
      setFavoriteCount(newCount);
      localStorage.setItem(
        `favorite-${ArticleNumber}`,
        JSON.stringify({ favorite: newFav, count: newCount })
      );
      return newFav;
    });
  };

  return (
    <div className="w-full bg-white rounded-lg overflow-hidden transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-row items-center relative">
      <button
        className="absolute top-2 right-2 focus:outline-none z-10"
        onClick={toggleFavorite}
      >
        <svg
          className={`w-6 h-6 ${favorite ? 'text-red-500' : 'text-gray-400'}`} 
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      <Link href={affiliateURL} legacyBehavior>
        <a
          className="block w-1/3 h-[200px] lg:h-[248px] flex-shrink-0"
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
        <div className="mt-auto flex items-center justify-between">
          <Link href={affiliateURL} legacyBehavior>
            <a
              className="inline-flex items-center bg-black text-white text-sm font-medium px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="mr-2" role="img" aria-label="carrito">
                🛒
              </span>
              Más información
            </a>
          </Link>
          <div className="text-xs flex items-center text-red-500 ml-4">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {favoriteCount}
          </div>
        </div>
      </div>
    </div>
  );
}
