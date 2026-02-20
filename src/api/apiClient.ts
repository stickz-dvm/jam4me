import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { ApiError } from "./types";

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});

// Storage keys (match AuthContext)
const AUTH_TOKEN_KEY = "authToken";
const TOKEN_EXPIRY_KEY = "jam4me-token-expiry";
const USER_KEY = "jam4me-user";
const USER_TYPE_KEY = "jam4me-user-type";

/**
 * Check if token is expired
 */
const isTokenExpired = (): boolean => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry, 10);
  } catch (error) {
    return true;
  }
};

/**
 * Clear all auth data
 */
const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
};

/**
 * Routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/user_wallet/crt_ur/",
  "/dj_wallet/crt_ur/",
  "/user_wallet/us_log/",
  "/dj_wallet/us_log/",
  "/user_wallet/forgot_password/",
  "/auth/login",
  "/auth/register",
];

/**
 * Check if route is public
 */
const isPublicRoute = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ROUTES.some((route) => url.includes(route));
};

/**
 * Request interceptor - adds auth token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for public routes
    if (isPublicRoute(config.url)) {
      return config;
    }

    // Check if token is expired before making request
    if (isTokenExpired()) {
      clearAuthData();
      // Redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Token expired"));
    }

    // Add token to headers
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isPublicRoute(config.url)) {
      // Token missing for protected route
      console.warn("No auth token found for protected route:", config.url);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles errors and token issues
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        "API Response:",
        response.status,
        response.config.url,
        response.data
      );
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
      originalError,
    };

    if (error.response) {
      const { status, data } = error.response;

      // Use server error message if available
      if (data && typeof data === "object" && "message" in data) {
        customError.message = data.message as string;
      } else {
        switch (status) {
          case 400:
            customError.message = "Bad Request - Please check your input";
            break;
          case 401:
            customError.message = "Session expired - Please login again";

            const isAuthEndpoint = error.config?.url?.includes("/log/") ||
              error.config?.url?.includes("/auth/");

            if (!isPublicRoute(error.config?.url) && !isAuthEndpoint) {
              console.warn("401 error but NOT clearing auth (might be permission issue)");
              break;
            }

            // Only clear and redirect for actual auth failures
            clearAuthData();

            // Prevent redirect loop
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
              setTimeout(() => {
                window.location.href = "/login";
              }, 100);
            }
            break;

          case 402:
            customError.message = "Payment Failed - Please verify your payment details";
            break;

          case 403:
            customError.message = "Access denied - Insufficient permissions";
            break;

          case 404:
            customError.message = "Resource not found";
            break;

          case 422:
            customError.message = "Validation error - Please check your input";
            break;

          case 429:
            customError.message = "Too many requests - Please try again later";
            break;

          case 500:
            customError.message = "Server error - Please try again later";
            break;

          case 502:
          case 503:
          case 504:
            customError.message = "Service unavailable - Please try again later";
            break;

          default:
            customError.message = error.message || "An unexpected error occurred";
        }
      }

      // Global Toast for critical errors
      if (status >= 500 || status === 402 || status === 0) {
        toast.error(customError.message);
      }

    } else if (error.request) {
      // Network error
      customError.message = "Network error - Please check your connection";
      customError.code = "NETWORK_ERROR";
      toast.error(customError.message);
    } else {
      // Other errors
      customError.message = error.message || "Request failed";
      toast.error(customError.message);
    }

    if (import.meta.env.DEV) {
      console.error("API Error:", { ...customError });
    }

    return Promise.reject(customError);
  }
);

export default apiClient;