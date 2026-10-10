import backendApi from "./backendApi";

export const getCart = async () => {
    const response = await backendApi.get("/cart");
    return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
    const response = await backendApi.post("/cart", {
        product_id: productId,
        quantity: quantity
    });
    return response.data;
};

export const updateCartItem = async (productId, quantity) => {
    const response = await backendApi.put(`/cart/${productId}`, {
        quantity: quantity
    });
    return response.data;
};

export const removeFromCart = async (productId) => {
    const response = await backendApi.delete(`/cart/${productId}`);
    return response.data;
};

export const clearCart = async () => {
    const response = await backendApi.delete("/cart");
    return response.data;
};
