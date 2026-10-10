import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from "../services/cartService";
import { isTokenValid } from "../services/authService";

const CartContext = createContext();

export function CartProvider({ children, isLoggedIn }) {
    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshCart = useCallback(async () => {
        if (!isTokenValid()) {
            setCart([]);
            setCartCount(0);
            return;
        }

        try {
            setLoading(true);
            const res = await getCart();
            const items = Array.isArray(res) ? res : (res?.cart || res?.items || []);
            setCart(items);
            const totalCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
            setCartCount(totalCount);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
    if (isTokenValid()) {
        refreshCart();
    } else {
        setCart([]);
        setCartCount(0);
    }
}, [isLoggedIn, refreshCart]);

    useEffect(() => {
        const handleAuthChange = () => {
            if (isTokenValid()) {
                refreshCart();
            } else {
                setCart([]);
                setCartCount(0);
            }
        };

        window.addEventListener("auth-change", handleAuthChange);
        return () => window.removeEventListener("auth-change", handleAuthChange);
    }, [refreshCart]);

    const addToCart = async (productId, quantity = 1) => {
        if (!isTokenValid()) {
            return { success: false, requireLogin: true, message: "Please log in to add items to your cart." };
        }

        try {
            const res = await apiAddToCart(productId, quantity);
            await refreshCart();
            return { success: true, message: res.message || "Product added to cart!" };
        } catch (error) {
            console.error("Add to cart error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to add product to cart."
            };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!isTokenValid()) {
            return { success: false, requireLogin: true };
        }

        try {
            const res = await apiUpdateCartItem(productId, quantity);
            await refreshCart();
            return { success: true, message: res.message };
        } catch (error) {
            console.error("Update quantity error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to update quantity."
            };
        }
    };

    const removeFromCart = async (productId) => {
        if (!isTokenValid()) {
            return { success: false, requireLogin: true };
        }

        try {
            const res = await apiRemoveFromCart(productId);
            await refreshCart();
            return { success: true, message: res.message };
        } catch (error) {
            console.error("Remove from cart error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Failed to remove item."
            };
        }
    };

    const clearCart = async () => {
        if (!isTokenValid()) return;

        try {
            await apiClearCart();
            await refreshCart();
        } catch (error) {
            console.error("Clear cart error:", error);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                cartCount,
                loading,
                refreshCart,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        return {
            cart: [],
            cartCount: 0,
            loading: false,
            refreshCart: () => {},
            addToCart: async () => ({ success: false }),
            updateQuantity: async () => ({ success: false }),
            removeFromCart: async () => ({ success: false }),
            clearCart: async () => {}
        };
    }
    return context;
}

export default CartContext;
