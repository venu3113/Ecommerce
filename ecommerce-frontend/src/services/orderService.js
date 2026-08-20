import backendApi from "./backendApi"


export const createOrder = async (orderData) => {

    const token = localStorage.getItem("token");

    const response = await backendApi.post(
        "/orders",
        orderData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getOrders = async()=>{
    const token = localStorage.getItem("token");

    const response = await backendApi.get("/orders",{
        headers:{
            Authorization:`Bearer ${token}`
        }
    });
    return response.data;
}