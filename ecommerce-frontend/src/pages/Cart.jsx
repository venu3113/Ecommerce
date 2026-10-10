import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../components/CartContext";
import { createOrder } from "../services/orderService";

function Cart() {
    const navigate = useNavigate();
    
    const { 
        cart, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        loading: cartLoading 
    } = useCart();
    
    const cartDetails = cart || [];
    const [updatingId, setUpdatingId] = useState(null);
    
    // Checkout modal state
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [form, setForm] = useState({
        customer_name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    // Fetch product details for all items in the cart
    

    // Handle Quantity Change
    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(productId);
            return;
        }

        setUpdatingId(productId);
        await updateQuantity(productId, newQuantity);
        setUpdatingId(null);
    };

    // Handle Remove Item
    const handleRemoveItem = async (productId) => {
        setUpdatingId(productId);
        await removeFromCart(productId);
        setUpdatingId(null);
    };

    // Calculations
    const subtotal = cartDetails.reduce((sum, item) => {
    const price = Number(item.price) || 0;        
    return sum + price * item.quantity;
    }, 0);

    const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
    const total = subtotal + shipping;

    // Checkout form handler
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Submit Checkout
    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();

        if (cartDetails.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        setPlacingOrder(true);

        try {
            // Create orders for all items in the cart
            for (const item of cartDetails) {
                const orderData = {
                    product_id: item.product_id,
                    customer_name: form.customer_name,
                    phone: form.phone,
                    address: form.address,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode,
                    quantity: item.quantity,
                    total_price: (item.product?.price || 0) * item.quantity,
                    status: "Placed"
                };
                await createOrder(orderData);
            }

            // Clear the cart on successful checkout
            await clearCart();
            setShowCheckoutModal(false);
            alert("🎉 Orders placed successfully!");
            navigate("/orders");
        } catch (error) {
            console.error("Checkout error:", error);
            alert(error.response?.data?.message || "Failed to place order. Please try again.");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (cartLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading your shopping cart...</p>
            </div>
        );
    }

    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Your Cart is Empty</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                    Looks like you haven't added any products to your cart yet. Explore our top products and find something you love!
                </p>
                <Link
                    to="/products"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 transition"
                >
                    Explore Products <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        🛒 Shopping Cart
                        <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full">
                            {cartDetails.length} {cartDetails.length === 1 ? "item" : "items"}
                        </span>
                    </h1>

                    <button
                        onClick={clearCart}
                        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                        Clear Cart
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {cartDetails.map((item) => {
                            const { product, quantity, product_id } = item;
                            const isItemUpdating = updatingId === product_id;

                            return (
                                <div
                                    key={product_id}
                                    className="flex flex-col sm:flex-row items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 gap-4 transition hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <img
                                            src={item.thumbnail}
                                            alt={product?.title}
                                            className="h-24 w-24 object-contain rounded-xl bg-gray-50 p-2 border border-gray-100"
                                        />
                                        <div>
                                            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600">
                                                {product?.category}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                <Link to={`/products/${product_id}`} className="hover:text-blue-600">
                                                    {product?.title}
                                                </Link>
                                            </h3>
                                            <p className="text-sm font-semibold text-gray-600 mt-1">
                                                ${product?.price?.toFixed(2)} each
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity and Actions */}
                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                        {/* Quantity Counter */}
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                            <button
                                                onClick={() => handleQuantityChange(product_id, quantity - 1)}
                                                disabled={isItemUpdating}
                                                className="px-3 py-1.5 hover:bg-gray-200 text-gray-700 transition disabled:opacity-50 cursor-pointer"
                                                title="Decrease quantity"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-4 py-1.5 font-bold text-gray-900 text-sm bg-white min-w-10 text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(product_id, quantity + 1)}
                                                disabled={isItemUpdating}
                                                className="px-3 py-1.5 hover:bg-gray-200 text-gray-700 transition disabled:opacity-50 cursor-pointer"
                                                title="Increase quantity"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        {/* Total Item Price */}
                                        <div className="text-right min-w-20">
                                            <p className="text-lg font-bold text-gray-900">
                                                ${((product?.price || 0) * quantity).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(product_id)}
                                            disabled={isItemUpdating}
                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                            title="Remove item"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Estimated Shipping</span>
                                    <span className="font-semibold text-gray-900">
                                        {shipping === 0 ? (
                                            <span className="text-green-600 font-bold">FREE</span>
                                        ) : (
                                            `$${shipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>

                                {subtotal < 50 && (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                                        Add ${(50 - subtotal).toFixed(2)} more for <strong>FREE Delivery</strong>!
                                    </p>
                                )}

                                <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-bold text-gray-900">
                                    <span>Total Amount</span>
                                    <span className="text-2xl text-blue-600">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCheckoutModal(true)}
                                className="w-full mt-6 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg hover:bg-blue-700 transition cursor-pointer"
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                to="/products"
                                className="block text-center mt-4 text-sm font-semibold text-gray-600 hover:text-blue-600"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Address Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8">
                        <button
                            type="button"
                            onClick={() => setShowCheckoutModal(false)}
                            className="absolute right-5 top-5 text-2xl text-gray-500 hover:text-black cursor-pointer"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-2">Shipping & Delivery Details</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Complete your details to place the order for {cartDetails.length} items (${total.toFixed(2)}).
                        </p>

                        <form onSubmit={handleCheckoutSubmit}>
                            <div className="mb-4">
                                <label className="block font-medium text-sm text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={form.customer_name}
                                    onChange={handleFormChange}
                                    placeholder="e.g. John Doe"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-medium text-sm text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 9876543210"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-medium text-sm text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleFormChange}
                                    placeholder="Flat / House No., Landmark, Street"
                                    required
                                    rows="2"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium text-sm text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleFormChange}
                                        placeholder="City"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-sm text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={form.state}
                                        onChange={handleFormChange}
                                        placeholder="State"
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block font-medium text-sm text-gray-700 mb-1">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={form.pincode}
                                    onChange={handleFormChange}
                                    placeholder="Pincode"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutModal(false)}
                                    className="w-1/2 border border-gray-300 py-3 rounded-xl hover:bg-gray-100 font-semibold text-gray-700 text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={placingOrder}
                                    className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {placingOrder ? "Placing Order..." : `Pay $${total.toFixed(2)}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
