// components/ui/Card.jsx
import PropTypes from 'prop-types'
import Link from 'next/link'

export default function Card({ product }) {
  return (
    <Link href={`/product/${product.ArticleNumber}`}>
      <a className="flex flex-col w-full max-w-xs bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
        {/* Imagen fija 248x248, centrada horizontalmente */}
        <div className="flex justify-center">
          <div className="w-[248px] h-[248px]">
            <img
              src={product.ImageURL}
              alt={product.Name}
              loading="lazy"
              width={248}
              height={248}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {/* Contenido debajo de la imagen */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base md:text-lg font-semibold line-clamp-2">
            {product.Name}
          </h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3 flex-1">
            {product.ShortDescription}
          </p>
          <span className="mt-4 text-lg font-bold">
            {product.Price} €
          </span>
        </div>
      </a>
    </Link>
  )
}

Card.propTypes = {
  product: PropTypes.shape({
    ArticleNumber: PropTypes.string.isRequired,
    ImageURL: PropTypes.string.isRequired,
    Name: PropTypes.string.isRequired,
    ShortDescription: PropTypes.string,
    Price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }).isRequired,
}
