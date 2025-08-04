import { InternalAxiosRequestConfig } from "axios";
import apiClient, { authApi } from "./apiClient";

export const api = {
  get: <T = any>(url: string, config?): Promise<T> =>
    authApi.get<T>(url, config).then(res => res.data),
    
  post: <T = any>(url: string, data?: any, config?): Promise<T> =>
    authApi.post<T>(url, data, config).then(res => res.data),
    
  put: <T = any>(url: string, data?: any, config?): Promise<T> =>
    authApi.put<T>(url, data, config).then(res => res.data),
    
  patch: <T = any>(url: string, data?: any, config?): Promise<T> =>
    authApi.patch<T>(url, data, config).then(res => res.data),
    
  delete: <T = any>(url: string, config?): Promise<T> =>
    authApi.delete<T>(url, config).then(res => res.data),
};