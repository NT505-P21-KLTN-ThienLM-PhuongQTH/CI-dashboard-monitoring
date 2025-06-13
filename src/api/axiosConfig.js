import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_API_URL;
// const BASE_URL = "http://localhost:5000/api/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request sent:', config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
      console.error('Response error:', error);
      return Promise.reject(error);
  }
);

export default axiosInstance;
