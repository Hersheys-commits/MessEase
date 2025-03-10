// axiosInstance.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:4001", // automatically prepends this URL to all requests
    withCredentials: true, // automatically includes credentials (like cookies) with every request
});

export default api;
