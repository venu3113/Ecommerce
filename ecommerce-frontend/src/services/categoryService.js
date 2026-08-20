import api from "./api";

export const getCategories = async () => {
    const response = await api.get("/products/categories");
    return response.data;
};

export const getProductByCategory = async (category, limit = 0) => {
    const response = await api.get(`/products/category/${category}?limit=${limit}`);
    return response.data.products;
};