import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../redux/store';
import { API_URL } from '../constant/config';

const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Request interceptor to add the auth token
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const state = store.getState();
        const token = state.userSlice.user?.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (e.g., logout user)
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
