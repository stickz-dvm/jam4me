import { api } from "@/api/apiMethods";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

export type UserType = "user" | "dj";

export type User = {
  id: string;
  name: string;
  email: string;
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
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  register: (name: string, email: string, password: string, userType: UserType) => Promise<void>;
  resetPassword: (emailOrPhone: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
  isDj: boolean;
  getUserType: () => UserType | null;
  getHomeRoute: () => string;
  signupResponse: object;
  loginResponse: object;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key for storing user type separately for quick access
const USER_TYPE_KEY = "jam4me-user-type";
const USER_KEY = "jam4me-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signupResponse, setSignupResponse] = useState({});
  const [loginResponse, setLoginResponse] = useState({});

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
        password
      });

      const endpoint = user_status === "user" ? "/user_wallet/us_log/us_hub_er/" : "/dj_wallet/us_log/d_hub_j/";
      const response = await api.post(endpoint, {username, password});

      setLoginResponse(response);
      console.log("login response: ", response);
      // // In a real app, this would be an API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // const mockUser: User = {
      //   id: userType === "dj" ? "dj-123" : "user-123",
      //   name: userType === "dj" ? "DJ Spinmaster" : "Demo User",
      //   email,
      //   userType,
      //   djName: userType === "dj" ? "DJ Spinmaster" : undefined,
      //   genre: userType === "dj" ? "Afrobeats" : undefined,
      //   bio: userType === "dj" ? "Professional DJ with 5 years of experience" : undefined,
      // };
      
      // setUser(mockUser);
      // localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      // // Store user type separately for quicker access
      // localStorage.setItem(USER_TYPE_KEY, userType);
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
      console.log("payload in context: ", {
        username,
        email,
        password,
        user_status
      })

      const endpoint = user_status === "user" 
      ? "user_wallet/crt_ur/us_hub_er/" 
      : "dj_wallet/crt_ur/d_hub_j/";
    
      const response = await api.post(endpoint, {
        username, 
        email, 
        password, 
        user_status
      });

      setSignupResponse(response);
      console.log("sign up response: ", response)
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (emailOrPhone: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to send password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Just simulate a successful request
      console.log(`Password reset instructions sent to: ${emailOrPhone}`);
      
      return Promise.resolve();
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
    if (storedType === "dj" || storedType === "user") {
      return storedType;
    }
    
    return null;
  };

  // New utility function to get the appropriate home route
  const getHomeRoute = (): string => {
    const userType = getUserType();
    return userType === "dj" ? "/dj/dashboard" : "/parties";
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
        isDj: user?.userType === "dj",
        getUserType,
        getHomeRoute,
        loginResponse,
        signupResponse,
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