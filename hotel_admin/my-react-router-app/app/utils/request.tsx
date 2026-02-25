import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { message } from "antd";
const BASE_URL=import.meta.env.VITE_BASE_URL || "/api";
const TIMEOUT=Number(import.meta.env.VITE_TIMEOUT) || 3000;
console.log('BASE_URL:',BASE_URL);
console.log('TIMEOUT:',TIMEOUT);

const api = import.meta.env.VITE_BASE_URL;
console.log('API:', api);
const instance = axios.create({
    baseURL: api,
    timeout: 3000,
    timeoutErrorMessage: "Request timed out",
    withCredentials: true,
    headers: {
        // "Content-Type": "application/json;charset=UTF-8",
        Authorization: 'Bearer ' +localStorage.getItem("token") || "",
        'X-Requested-With': 'XMLHttpRequest',
    },
});

instance.interceptors.request.use(
    (config) => {
        /** 
         * 修复逻辑：
         * 1. 只有在浏览器环境下 (typeof window !== 'undefined') 才访问 localStorage
         * 2. 动态获取 Token，确保登录后发起的请求能拿到最新的 Token
         */
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);


instance.interceptors.request.use(
    (config) => {
    // You can add headers or tokens here
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        const data = response.data; // 这里的 data 是后端返回的整个结果对象 { code, data, message }
        
        // 业务逻辑判断
        if (data.code === 200) {
            return data.data; // 成功直接返回内部数据
        }

        // 登录失效逻辑
        if (data.code === 40001) {
            if (typeof window !== 'undefined') {
                message.error("登录已过期，请重新登录");
                localStorage.removeItem("token");
                window.location.href = '/login';
            }
            return Promise.reject(data);
        }

        // 其他业务错误
        message.error(data.message || "Error occurred");
        return Promise.reject(data);
    },
    (error) => {
        // 网络层级的错误（如 404, 500, 超时）
        const errorMsg = error.response?.data?.message || error.message || "Network Error";
        if (typeof window !== 'undefined') {
            message.error(errorMsg);
        }
        return Promise.reject(error);
    }
);
export default {
    get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
        return instance.get(url, { params, ...config });
    },
    post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        return instance.post(url, data, config);
    },
    put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        return instance.put(url, data, config);
    },
    delete<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
        return instance.delete(url, { data, ...config });
    },

};