import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "./types";

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  // timeout: 10000, // Add timeout to prevent hanging requests
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  // withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only add auth token for protected routes (not registration/login)
    const publicRoutes = ['/user_wallet/crt_ur/', '/dj_wallet/crt_ur/', '/auth/login'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    if (!isPublicRoute) {
      const token = localStorage.getItem("authToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log("Response:", response.status, response.config.url, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    // Preserve original error data for debugging
    const originalError = error.response?.data;
    
    const customError: ApiError = {
      message: "An error occurred",
      status: error.response?.status || 500,
      code: error.code,
      originalError, // Keep original error for debugging
    };

    if (error.response) {
      const { status, data } = error.response;
      
      // Use server error message if available
      if (data && typeof data === 'object' && 'message' in data) {
        customError.message = data.message as string;
      } else {
        switch (status) {
          case 401:
            customError.message = "Unauthorized - Please login again";
            // Only redirect if not on a public route
            const isPublicRoute = error.config?.url?.includes('/crt_ur/');
            if (!isPublicRoute) {
              localStorage.removeItem("authToken");
              window.location.href = "/login";
            }
            break;
          case 403:
            customError.message = "Forbidden - You don't have permission";
            break;
          case 404:
            customError.message = "Resource not found";
            break;
          case 422:
            customError.message = "Validation error";
            break;
          case 500:
            customError.message = "Server error - Please try again later";
            break;
          default:
            customError.message = error.message;
        }
      }
    } else if (error.request) {
      customError.message = "Network error - Please check your connection";
    }

    if (import.meta.env.DEV) {
      console.error("Error details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        customError
      });
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// export const authApi = axios.create({
//     baseURL: BASE_URL,
//     // withCredentials: true,
//     headers: {
//         "Content-Type": "application/json",
//         "Accept": "*/*"
//     },
// });
