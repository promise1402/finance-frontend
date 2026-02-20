import axios from "axios";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL?.trim();

if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL. Set it in your .env file.");
}

const api = axios.create({
    baseURL: API_BASE_URL.replace(/\/$/, ""),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
