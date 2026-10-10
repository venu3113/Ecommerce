import backendApi from "./backendApi";
import { jwtDecode } from "jwt-decode";

export const registerUser = async (userData) => {
    const response = await backendApi.post("/register", userData);
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await backendApi.post("/login", userData);
    return response.data;
};

export function clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
}

export function getTokenRemainingTime() {
    const token = localStorage.getItem("token");
    if (!token) return 0;

    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return 0;
        const remaining = decoded.exp * 1000 - Date.now();
        return remaining > 0 ? remaining : 0;
    } catch {
        return 0;
    }
}

export function isTokenValid() {
    const token = localStorage.getItem("token");

    if (!token) {
        return false;
    }
    try {
        const decoded = jwtDecode(token);

        if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
            clearAuthData();
            return false;
        }
        return true;
    } catch (error) {
        console.error("Invalid JWT:", error);
        clearAuthData();
        return false;
    }
}
