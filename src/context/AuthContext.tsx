import { api } from "@/api/apiMethods";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ApiResponse } from "../api/types";
import { toast } from "react-toastify";
import { generateCryptoUserId } from "../services/GenerateUniqueId";

export type UserType = "user" | "HUB_DJ";

export type User = {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  userType: UserType;
  // DJ-specific fields
  djName?: string;
  genre?: string;
  bio?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, user_status: UserType) => Promise<ApiResponse<any> | undefined>;
  register: (username: string, email: string, password: string, user_status: UserType) => Promise<ApiResponse>;
  resetPassword: (emailOrPhone: string) => Promise<ApiResponse>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  isDj: boolean;
  getUserType: () => UserType | null;
  getHomeRoute: () => string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key for storing user type separately for quick access
const USER_TYPE_KEY = "jam4me-user-type";
const USER_KEY = "jam4me-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Also store the user type separately for quicker access
      localStorage.setItem(USER_TYPE_KEY, parsedUser.userType);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, user_status: UserType = "user") => {
    // Simulate API call
    setIsLoading(true);
    try {
      console.log("login payload in context: ", {
        username,
        password,
        user_status
      });

      const endpoint = user_status === "user" ? "/user_wallet/us_log/us_hub_er/" : "/dj_wallet/us_log/d_hub_j/";
      const response = await api.post(endpoint, {username, password, user_status});

      console.log("login response: ", response);
      if (response.status === 200 && response.data.message.includes("Login successful") || response.data.message.includes("login success")) {
        setUser({
          id: response.data.user.id,
          username: username,
          userType: user_status,
        })
      }

      return response;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, user_status: UserType = "user") => {
    setIsLoading(true);
    try {

      const endpoint = user_status === "user" 
      ? "/user_wallet/crt_ur/us_hub_er/" 
      : "/dj_wallet/crt_ur/d_hub_j/";
    
      const response = await api.post(endpoint, {
        username, 
        email, 
        password, 
        user_status
      });

      if (response.status === 200) {
        if (response.data.message === "Welcome to D'HUB") {
          setUser({
            id: generateCryptoUserId(),
            username: username,
            userType: user_status,
          })
        } else if (response.data.error.includes("is wrong")) {
          toast.error(response.data.error);
        }
      }

      return response;
    } catch (error: any) {
      console.error(error);
      if (error.status === 400 && error.originalError.error === "username already exists") {
        toast.error("Username already exists")
      };

      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (emailOrPhone: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/user_wallet/forgot_password/", emailOrPhone);

      console.log("forgot password response: ", response);
      
      // Just simulate a successful request
      console.log(`Password reset instructions sent to: ${emailOrPhone}`);
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      // If user type is changing, update that as well
      if (userData.userType) {
        localStorage.setItem(USER_TYPE_KEY, userData.userType);
      }
    }
  };

  // New utility function to get the user type from storage
  const getUserType = (): UserType | null => {
    // First check the current user state
    if (user) {
      return user.userType;
    }
    
    // If no user in state, check localStorage
    const storedType = localStorage.getItem(USER_TYPE_KEY);
    if (storedType === "HUB_DJ" || storedType === "user") {
      return storedType;
    }
    
    return null;
  };

  // New utility function to get the appropriate home route
  const getHomeRoute = (): string => {
    const userType = getUserType();
    return userType === "HUB_DJ" ? "/dj/dashboard" : "/parties";
  };

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