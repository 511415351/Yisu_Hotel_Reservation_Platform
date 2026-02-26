import Taro from "@tarojs/taro";

const BASE_URL = import.meta.env.TARO_APP_API_URL || "http://localhost:3000";
const TIMEOUT = 10000;

console.log("当前环境:", process.env.NODE_ENV);
console.log("当前平台:", process.env.TARO_ENV);
console.log("API 基础 URL:", BASE_URL);

const baseRequest = async <T>(
  url: string,
  method: keyof Taro.request.Method = "GET",
  data?: any
): Promise<T> => {
  
  const token = Taro.getStorageSync("token");
  
  const header: any = {
    "Content-Type": "application/json;charset=UTF-8",
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (token) {
    header.Authorization = 'Bearer ' + token;
  }

  try {
    const res = await Taro.request({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      method,
      data,
      header,
      timeout: TIMEOUT,
    });

    const { statusCode, data: responseData } = res;

    if (statusCode === 200) {
      if (responseData.code === 200) {
        return responseData.data as T; 
      }

      if (responseData.code === 40001) {
        Taro.showToast({ title: "登录已过期", icon: "none" });
        Taro.removeStorageSync("token");
        Taro.reLaunch({ url: '/pages/login/index' });
        return Promise.reject(responseData);
      }

      Taro.showToast({
        title: responseData.msg || "请求失败",
        icon: "none",
      });
      return Promise.reject(responseData);
    }

    throw new Error(`网络错误: ${statusCode}`);

  } catch (error) {
    const msg = error.errMsg || error.message || "请求发生错误";
    Taro.showToast({ title: msg, icon: "none" });
    return Promise.reject(error);
  }
};

export default {
  get<T>(url: string, params?: object): Promise<T> {
    return baseRequest<T>(url, "GET", params);
  },
  post<T>(url: string, data?: object): Promise<T> {
    return baseRequest<T>(url, "POST", data);
  },
  put<T>(url: string, data?: object): Promise<T> {
    return baseRequest<T>(url, "PUT", data);
  },
  delete<T>(url: string, data?: object): Promise<T> {
    return baseRequest<T>(url, "DELETE", data);
  },
};
