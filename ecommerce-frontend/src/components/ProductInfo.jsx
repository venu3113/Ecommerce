function ProductInfo({ product, onBuyNow }) {
  return (
    <div>

      <p className="text-sm font-semibold uppercase text-blue-600">
        {product.category}
      </p>

      <h1 className="mt-2 text-4xl font-bold">
        {product.title}
      </h1>

      <p className="mt-4 text-gray-600">
        {product.description}
      </p>

      <div className="mt-6 flex items-center gap-4">

        <span className="text-4xl font-bold text-green-600">
          ${product.price}
        </span>

        <span className="rounded bg-green-100 px-3 py-1 font-semibold text-green-700">
          {Math.round(product.discountPercentage)}% OFF
        </span>

      </div>

      <div className="mt-5 flex items-center gap-4">

        <span className="rounded bg-green-600 px-3 py-1 text-white">
          ⭐ {product.rating}
        </span>

        <span className="text-gray-600">
          {product.stock} In Stock
        </span>

      </div>

      <div className="mt-6 space-y-2">

        <p>
          <span className="font-semibold">
            Brand:
          </span>{" "}
          {product.brand || "N/A"}
        </p>

        <p>
          <span className="font-semibold">
            SKU:
          </span>{" "}
          {product.sku}
        </p>

        <p>
          <span className="font-semibold">
            Weight:
          </span>{" "}
          {product.weight}
        </p>

      </div>

      <div className="mt-8 flex gap-4">

        <button className="flex-1 rounded-lg border border-gray-400 bg-white-400 py-3 font-semibold hover:bg-gray-300">
          Add to Cart
        </button>

        <button 
        onClick={() => {
        console.log("BUY NOW CLICKED");
        onBuyNow();
    }}
        className="flex-1 rounded-lg bg-yellow-400 py-3 font-semibold text-black hover:bg-yellow-500">
          Buy Now
        </button>

      </div>

    </div>
  );
}

export default ProductInfo;