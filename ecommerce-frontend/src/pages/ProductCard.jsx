import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { addToWishlist } from "../services/wishlistService";
import { useCart } from "../components/CartContext";

function ProductCard({ product }) {

  const { addToCart } = useCart();

  console.log("single product",product);
  
  const originalPrice = (
    product.price /
    (1 - product.discountPercentage / 100)
  ).toFixed(0);

  const handleWishlist = async()=>{
    try{
      const response = await addToWishlist(product.id);
      alert(response.message)
    } catch(error)
        {
          alert(error.response?.data?.message ||
          "Failed to add product to wishlist"
        );
      }
    }
    const handleAddToCart = async () => {
  console.log("BUTTON CLICKED");
  console.log("PRODUCT ID:", product.id);

  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  try {
    const response = await fetch("http://127.0.0.1:5000/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: product.id,
        quantity: 1,
      }),
    });

    console.log("HTTP STATUS:", response.status);

    const data = await response.json();

    console.log("SERVER RESPONSE:", data);

    if (response.ok) {
      alert("Product added to cart successfully!");
    } else {
      alert(data.message || data.error || "Failed to add to cart");
    }

  } catch (error) {
    console.error("FETCH ERROR:", error);
    alert("Could not connect to backend");
  }
};
  return (
    <div className="group relative overflow-hidden min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

    
      <span className="absolute left-3 top-3 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
        {Math.round(product.discountPercentage)}% OFF
      </span>

      <button onClick={handleWishlist} className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow hover:bg-red-50">
        <Heart size={18} className="text-gray-500 hover:text-red-500" />
      </button>

      <div className="overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-52 w-full object-contain transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">

        <p className="text-xs uppercase tracking-wide text-gray-500">
          {product.category}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="rounded bg-white-400 py-1 text-xs font-semibold text-black">
            {product.rating} ⭐  |  {product.stock} reviews
          </span>
        </div>

        <h2 className="mt-2 line-clamp-1 text-lg font-bold">
          {product.title}
        </h2>

        <p className="line-clamp-1 text-sm text-gray-600">
          {product.description}
        </p>


        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-bold text-black">
            ${product.price}
          </span>

          <span className="text-gray-500 line-through">
            ${originalPrice}
          </span>

          <span className="text-sm font-semibold text-green-600">
            {Math.round(product.discountPercentage)}% Off
          </span>
        </div>

        {/* <p className="mt-2 text-sm text-green-700 font-medium">
          🚚 Free Delivery
        </p>

        <p
          className={`mt-1 text-sm font-medium ${
            product.stock > 10
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {product.stock > 10
            ? `In Stock (${product.stock})`
            : `Only ${product.stock} left`}
        </p> */}

        <div className="mt-4 flex items-center gap-2">

          <button onClick={handleAddToCart} className="flex-1 rounded-lg border border-gray-400 bg-white-400 py-2 text-sm font-semibold hover:bg-gray-300">
            Add to Cart
          </button>

          <Link
            to={`/products/${product.id}`}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Details
          </Link>

        </div>

      </div>
    </div>
  );
}

export default ProductCard;