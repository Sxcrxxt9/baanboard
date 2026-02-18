import axios from "axios";
import Configs from "../config";

const client = axios.create({
  baseURL: Configs.api.baseApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(Configs.storage.token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default client;