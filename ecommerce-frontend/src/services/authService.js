import backendApi from "./backendApi"

export const registerUser = async(userData)=> {
    const response = await backendApi.post("/register",userData);
    return response.data;
}

export const loginUser = async(userData)=> {
    const response = await backendApi.post("/login",userData)
    return response.data;
}