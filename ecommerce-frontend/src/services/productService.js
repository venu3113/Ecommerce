import api from "./api";

export const getAllProducts = async (limit = 0) => {
    const response = await api.get(`/products?limit=${limit}`);
    return response.data.products;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const getProductsByCategory = async (category, limit = 0) => {
    const response = await api.get(`/products/category/${category}?limit=${limit}`);
    return response.data.products;
};
