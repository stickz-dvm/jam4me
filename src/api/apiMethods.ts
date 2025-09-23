import { InternalAxiosRequestConfig } from "axios";
import apiClient from "./apiClient"; 
import { ApiResponse } from "./types";
// import { authApi } from "./apiClient";


export const api = {
  get: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> =>
    apiClient.get<T>(url, config).then(res => ({
    data: res.data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    config: res.config
  })),
    
  post: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> =>
    apiClient.post<T>(url, data, config).then(res => ({
    data: res.data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    config: res.config
  })),
    
  put: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> =>
    apiClient.put<T>(url, data, config).then(res => ({
    data: res.data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    config: res.config
  })),
    
  patch: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> =>
    apiClient.patch<T>(url, data, config).then(res => ({
    data: res.data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    config: res.config
  })),
    
  delete: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> =>
    apiClient.delete<T>(url, config).then(res => ({
    data: res.data,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    config: res.config
  })),
};