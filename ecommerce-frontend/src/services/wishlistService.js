import backendApi from "./backendApi";

export const addToWishlist = async(productId)=>{
    const token = localStorage.getItem("token");

    const response = await backendApi.post(
        "/wishlist/add",
        {
            product_id: productId
        },
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;

}

export const getWishlist = async ()=>{
    const token = localStorage.getItem("token");

    const response = await backendApi.get("/wishlist",{
        headers:{
            Authorization:`Bearer ${token}`
        }
    });
    return response.data;
}

export const removeFromWishlist= async(productId)=>{
    const token = localStorage.getItem("token");

    console.log("Token:", token);
    console.log("Product ID:", productId);

    const response = await backendApi.delete(`/wishlist/${productId}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
        }
    )
    return response.data;
}