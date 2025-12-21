import { api } from "@/api/apiMethods";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ApiResponse, AuthContextType, User, UserType } from "../api/types";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_TOKEN_KEY = "authToken";
const USER_KEY = "jam4me-user";
const USER_TYPE_KEY = "jam4me-user-type";
const TOKEN_EXPIRY_KEY = "jam4me-token-expiry";

// Token expiry duration (60 mins in milliseconds)
const TOKEN_EXPIRY_DURATION = 60 * 60 * 1000;

console.log("Auth Configuration:", {
  tokenExpiryDays: TOKEN_EXPIRY_DURATION / (24 * 60 * 60 * 1000),
  storageKeys: { AUTH_TOKEN_KEY, USER_KEY, USER_TYPE_KEY, TOKEN_EXPIRY_KEY }
});

/**
 * Storage utility functions for localStorage operations
 */
const storage = {
  setUser: (user: User) => {
    try {
      const userString = JSON.stringify(user);
      localStorage.setItem(USER_KEY, userString);
      localStorage.setItem(USER_TYPE_KEY, user.userType);
      
      // Verify write succeeded
      const verification = localStorage.getItem(USER_KEY);
      if (!verification) {
        console.error("CRITICAL: User was NOT saved to localStorage!");
      } else {
        console.log("User saved to localStorage");
      }
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast.error("Storage quota exceeded. Please clear browser data.");
      }
    }
  },

  getUser: (): User | null => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("❌ Failed to parse user from localStorage:", error);
      return null;
    }
  },

  setToken: (token: string) => {
    try {
      if (!token || token.trim() === "") {
        console.error("❌ Attempted to save empty/invalid token!");
        return;
      }

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      const expiry = Date.now() + TOKEN_EXPIRY_DURATION;
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
      
      // Verify write succeeded
      const verification = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!verification) {
        console.error("❌ CRITICAL: Token was NOT saved to localStorage!");
      } else {
        console.log("✅ Token saved to localStorage");
        console.log("✅ Token expires:", new Date(expiry).toLocaleString());
      }
    } catch (error) {
      console.error("❌ Failed to save token to localStorage:", error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast.error("Storage quota exceeded. Please clear browser data.");
      }
    }
  },

  getToken: (): string | null => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("❌ Failed to get token from localStorage:", error);
      return null;
    }
  },

  isTokenExpired: (): boolean => {
    try {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiry) return true;
      
      const isExpired = Date.now() > parseInt(expiry, 10);
      if (isExpired) {
        console.log("⏰ Token has expired");
      }
      return isExpired;
    } catch (error) {
      console.error("❌ Failed to check token expiry:", error);
      return true;
    }
  },

  clearAuth: () => {
    try {
      console.log("🧹 Clearing auth data from localStorage");
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(USER_TYPE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error("❌ Failed to clear auth from localStorage:", error);
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      console.log("AuthContext: Initializing...");
      
      try {
        const token = storage.getToken();
        const isExpired = storage.isTokenExpired();
        const storedUser = storage.getUser();

        console.log("Auth state:", {
          hasUser: !!storedUser,
          hasToken: !!token,
          isExpired,
          tokenLength: token?.length || 0
        });

        if (!storedUser || !token || isExpired) {
          console.log("No valid auth data - user not authenticated");
          storage.clearAuth();
          setUser(null);
          setIsLoading(false);
          return;
        }

        console.log("User restored:", storedUser.username, storedUser.userType);
        setUser(storedUser);

      } catch (error) {
        console.error("Error initializing auth:", error);
        storage.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Logout function - clears all auth data
   */
  const logout = useCallback(() => {
    console.log("Logging out...");
    setUser(null);
    storage.clearAuth();
    toast.info("Logged out successfully");
  }, []);

  /**
   * Login function - authenticates user and stores credentials
   */
  const login = async (
    username: string,
    password: string,
    user_status: UserType = "user"
  ): Promise<ApiResponse<any> | undefined> => {
    console.log("Login attempt:", { username, user_status });
    setIsLoading(true);

    try {
      const endpoint =
        user_status === "user"
          ? "/user_wallet/us_log/us_hub_er/"
          : "/dj_wallet/us_log/d_hub_j/";

      const response = await api.post(endpoint, {
        username,
        password,
        user_status,
      });

      console.log("Login response:", {
        status: response.status,
        message: response.data.message,
        hasUser: !!response.data.user,
        hasToken: !!response.data.user?.token,
        tokenLength: response.data.user?.token?.length || 0
      });

      // Check for successful login
      if (
        response.status === 200 &&
        (response.data.message.includes("Login successful") ||
          response.data.message.includes("login success"))
      ) {
        // Validate token exists
        if (!response.data.user?.token) {
          console.error("CRITICAL: No token in response!");
          toast.error("Login failed: No authentication token received");
          // Clear any existing auth data
          storage.clearAuth();
          return response;
        }

        const userData: User = {
          id: response.data.user.id,
          username: response.data.user.username,
          userType: user_status,
          email: response.data.user.email,
          avatar: response.data.user.profile_picture,
        };

        console.log("Saving auth data...");
        console.log("User:", userData);

        // CRITICAL: Save to localStorage FIRST (synchronous)
        storage.setUser(userData);
        storage.setToken(response.data.user.token);

        // Verify it was saved
        const savedUser = storage.getUser();
        const savedToken = storage.getToken();
        const savedUserType = localStorage.getItem(USER_TYPE_KEY);
        
        console.log("Verification:", {
          userSaved: !!savedUser,
          tokenSaved: !!savedToken,
          userTypeSaved: !!savedUserType,
          allKeys: Object.keys(localStorage).filter(k => k.includes('jam4me') || k === 'authToken')
        });

        if (!savedUser || !savedToken) {
          console.error("CRITICAL: Failed to save to localStorage!");
          toast.error("Failed to save login data");
          // Clear any partial data
          storage.clearAuth();
          return response;
        }

        // Then update React state (asynchronous)
        setUser(userData);

        console.log("Login complete! User is now:", userData.username);
        toast.success("Login successful!");
      } else {
        console.warn("Login response not successful:", response.data.message);
        // Clear any existing auth data on failed login attempt
        storage.clearAuth();
      }

      return response;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register function - creates new user account
   */
  // const register = async (
  //   username: string,
  //   email: string,
  //   password: string,
  //   user_status: UserType = "user"
  // ): Promise<ApiResponse> => {
  //   setIsLoading(true);
  //   try {
  //     const endpoint =
  //       user_status === "user"
  //         ? "/user_wallet/crt_ur/us_hub_er/"
  //         : "/dj_wallet/crt_ur/d_hub_j/";

  //     const response = await api.post(endpoint, {
  //       username,
  //       email,
  //       password,
  //       user_status,
  //     });

  //     if (response.status === 200 && response.data.message.includes("Welcome")) {
  //       const userData: User = {
  //         id: response.data.user?.id,
  //         username: username,
  //         userType: user_status,
  //         email: email,
  //       };

  //       // Save user data if registration includes auto-login
  //       if (response.data.user?.token) {
  //         storage.setUser(userData);
  //         storage.setToken(response.data.user.token);
  //         setUser(userData);
  //       } else {
  //         setUser(userData);
  //       }

  //       toast.success("Registration successful!");
  //     }

  //     return response;
  //   } catch (error: any) {
  //     console.error("Registration error:", error);
      
  //     if (
  //       error.status === 400 &&
  //       error.originalError?.error === "username already exists"
  //     ) {
  //       toast.error("Username already exists");
  //     } else {
  //       toast.error(error.message || "Registration failed");
  //     }

  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const register = async (
    username: string,
    email: string,
    password: string,
    user_status: UserType = "user"
  ): Promise<ApiResponse> => {
    console.log("Registration attempt:", { username, email, user_status });
    setIsLoading(true);
    
    try {
      const endpoint =
        user_status === "user"
          ? "/user_wallet/crt_ur/us_hub_er/"
          : "/dj_wallet/crt_ur/d_hub_j/";

      const response = await api.post(endpoint, {
        username,
        email,
        password,
        user_status,
      });

      console.log("Registration response:", {
        status: response.status,
        message: response.data.message,
        hasUser: !!response.data.user,
        hasToken: !!response.data.user?.token
      });

      if (response.status === 200 && response.data.message.includes("Welcome")) {
        const userData: User = {
          id: response.data.user?.id,
          username: username,
          userType: user_status,
          email: email,
        };

        console.log("Saving user data after registration...");

        // Save user to localStorage after successful registration
        storage.setUser(userData);

        // If token is provided, save it too
        if (response.data.user?.token) {
          console.log("Token provided, saving token");
          storage.setToken(response.data.user.token);
        } else {
          console.log("No token in registration response");
        }

        // Update React state
        setUser(userData);

        toast.success("Registration successful!");
      }

      return response;
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (
        error.status === 400 &&
        error.originalError?.error === "username already exists"
      ) {
        toast.error("Username already exists");
      } else {
        toast.error(error.message || "Registration failed");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password function
   */
  const resetPassword = async (emailOrPhone: string): Promise<ApiResponse> => {
    setIsLoading(true);
    try {
      const response = await api.post(
        "/user_wallet/forgot_password/",
        { emailOrPhone }
      );

      toast.success("Password reset instructions sent!");
      return response;
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset instructions");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user profile - keeps localStorage in sync
   */
  const updateUserProfile = useCallback((userData: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return null;

      const updatedUser = { ...currentUser, ...userData };
      storage.setUser(updatedUser);

      return updatedUser;
    });
  }, []);

  /**
   * Get current user type
   */
  const getUserType = useCallback((): UserType | null => {
    if (user) {
      return user.userType;
    }

    // Fallback to localStorage if state not loaded yet
    const storedType = localStorage.getItem(USER_TYPE_KEY);
    if (storedType === "HUB_DJ" || storedType === "user") {
      return storedType;
    }

    return null;
  }, [user]);

  /**
   * Get appropriate home route based on user type
   */
  const getHomeRoute = useCallback((): string => {
    const userType = getUserType();
    return userType === "HUB_DJ" ? "/dj/dashboard" : "/parties";
  }, [getUserType]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        resetPassword,
        logout,
        updateUserProfile,
        isDj: user?.userType === "HUB_DJ",
        getUserType,
        getHomeRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}