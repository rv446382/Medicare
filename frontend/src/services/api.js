import axios from "axios";
import { USER_TOKEN } from '../store/slices/UserSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + '/api',
  headers: {
    "Content-Type": "application/json",
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(USER_TOKEN);

    if (token) {
      config.headers["token"] = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
