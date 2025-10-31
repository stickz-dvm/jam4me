import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "./types";

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 15000, // 15 second timeout
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
  "/user_wallet/crt_ur/",      // User registration
  "/dj_wallet/crt_ur/",        // DJ registration
  "/user_wallet/us_log/",      // User login
  "/dj_wallet/us_log/",        // DJ login
  "/user_wallet/forgot_password/",
  "/auth/login",
  "/auth/register",
];

console.log("🔧 Public routes configured:", PUBLIC_ROUTES);

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
      console.log("🌍 Public route, skipping auth:", config.url);
      return config;
    }

    // Check if token is expired before making request
    if (isTokenExpired()) {
      console.log("⏰ Token expired before request:", config.url);
      clearAuthData();
      // Redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Token expired"));
    }

    // Add token to headers
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    console.log("🔐 Request interceptor:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : "null",
      tokenLength: token?.length || 0
    });
    
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
      console.log("✅ Token added to request headers");
    } else if (!isPublicRoute(config.url)) {
      // Token missing for protected route
      console.warn("⚠️ No auth token found for protected route:", config.url);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error);
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
          case 401:
            customError.message = "Session expired - Please login again";
            
            // CRITICAL: Only clear auth and redirect if NOT on a public route
            // AND if this is an authentication-related endpoint
            const isAuthEndpoint = error.config?.url?.includes("/log/") || 
                                   error.config?.url?.includes("/auth/");
            
            if (!isPublicRoute(error.config?.url) && !isAuthEndpoint) {
              console.warn("⚠️ 401 error but NOT clearing auth (might be permission issue)");
              // Don't clear auth - this might just be a permission error
              // or a race condition right after login
              break;
            }
            
            // Only clear and redirect for actual auth failures
            clearAuthData();
            
            // Prevent redirect loop
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
              console.log("🚪 401 on auth endpoint - redirecting to login");
              setTimeout(() => {
                window.location.href = "/login";
              }, 100);
            }
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

          case 503:
            customError.message = "Service unavailable - Please try again later";
            break;

          default:
            customError.message = error.message || "An unexpected error occurred";
        }
      }
    } else if (error.request) {
      // Network error
      customError.message = "Network error - Please check your connection";
      customError.code = "NETWORK_ERROR";
    } else {
      // Other errors (setup, etc.)
      customError.message = error.message || "Request failed";
    }

    // Enhanced logging in development
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        customError,
      });
    }

    return Promise.reject(customError);
  }
);

export default apiClient;