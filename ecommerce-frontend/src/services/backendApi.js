import axios from "axios";

const backendApi = axios.create({
    baseURL: "http://127.0.0.1:5000"
});

backendApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

backendApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth-change"));
        }
        return Promise.reject(error);
    }
);

export default backendApi;