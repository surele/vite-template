import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { SignatureUtil } from "./sinature-util";
import { SettingUtil } from "../utils/setting-util";
import { RequestCacheUtil } from "./cache-util";
import * as EncryptUtil from "./encrypt-util";

export type RequestConfig = AxiosRequestConfig & {
    remote?: boolean; // 开启则不使用接口防抖处理
    cache?: boolean; // 是否开启缓存
    setExpireTime?: number; // 接口设置缓存时间 单位:ms
};

export type CustomResponse = AxiosResponse & {
    config: RequestConfig;
};

/**
 * 响应类型
 */
export type ResponseResult = {
    // 是否有错
    hasError: boolean;
    // 返回消息
    message?: string;
    // 响应结果
    result?: any;
};

export function configLogoutAxios(axiosInstance: AxiosInstance, logout: () => void) {
    axiosInstance?.interceptors.response.use(
        res => {
            // Do something with response data
            return res;
        },
        e => {
            // Do something with response error
            if (e.response && e.response.data) {
                const data = e.response.data;
                if (data.error === "invalid_token" || e.response.status === 401) {
                    console.log("axios request error:" + e.response.status);

                    SettingUtil.removeToken();
                    SettingUtil.clearCasToken();
                    SettingUtil.commonRemoveCookie("username");
                    logout(e);
                }
            }
            return Promise.reject(e);
        }
    );
    return axiosInstance;
}

export function configTokenAxios(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            // token处理
            const token = SettingUtil.getToken();
            if (token && config.url && ~config.url.search(/unity/g)) {
                // 判断是否存在token，如果存在的话，则每个http header都加上token
                config.headers.Authorization = SettingUtil.getAuthorization();
            }
            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );
    return axiosInstance;
}

export function configMethodAxios(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            if (config.url && ~config.url.search(/unity|free/g)) {
                // 将put和delete类型的接口拦截转换为post类型
                // 在headers里面添加X-Api-Method参数以告知后端转换前接口类型，后端做转换
                if (config.method === "put" || config.method === "delete") {
                    config.headers["X-Api-Method"] = config.method?.$clone().toLocaleUpperCase();
                    config.method = "post";
                }
            }

            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );
    return axiosInstance;
}

export function configEncryptAxios(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            if (config.url && ~config.url.search(/unity|free/g)) {
                // 接口签名校验
                SignatureUtil.signature(config);
                // 接口加密处理
                EncryptUtil.encrypt(config);
            }
            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );
    return axiosInstance;
}

export function configCacheAxios(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            if (config.url && ~config.url.search(/unity|free/g)) {
                // 请求增加接口缓存支持
                RequestCacheUtil.requestInterceptor(config);
            }

            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );
    axiosInstance.interceptors.response.use(
        res => {
            if (res.config.url && ~res.config.url.search(/unity|free/g)) {
                // 请求结果缓存
                RequestCacheUtil.responseInterceptor(res);
            }
            return res;
        },
        e => {
            // 请求缓存处理方式
            if (axios.isCancel(e) && e.message?.data?.config.cache) {
                return Promise.resolve(e.message.data); // 返回结果数据
            }

            return Promise.reject(e);
        }
    );
    return axiosInstance;
}

export function configAxios(axiosInstance?: AxiosInstance): AxiosInstance {
    const instance = axiosInstance || axios;
    ServiceBase.axiosInstance = instance;
    configCacheAxios(instance);
    configEncryptAxios(instance);
    configMethodAxios(instance);
    configTokenAxios(instance);
    return axiosInstance!;
}

// 此处主要是合并接口请求，比如一个页面上多个模块同时发起同一个请求，这时只需请求一次网络，然后将返回的结果再分发给所有请求。默认为3s，即3s内的所有相同请求都只走一次网络请求。之前的接口缓存无法满足，因为多个请求同时发起，但是本地缓存没有，所以还是会发起多次网络请求，然后缓存在本地，下次请求时才会走缓存，故不满足。
//  用来缓存Promise对象的数组 { key: url+param, value: promise }
export const promiseList: Array<any> = [];
// 每隔3s清除一下
setInterval(() => {
    promiseList.splice(0);
}, 3000);
// 检查
export function checkPromise(url: string, param: any) {
    const key = url + (param ? JSON.stringify(param) : "");
    // 看看有没有相同 Promise
    const res = promiseList.filter(item => item.key === key);
    // 如果有相同的进行中的promise，直接返回
    if (res.length > 0) {
        console.log("存在并发请求");
        return res[0]?.value;
        // 如果没有相同的则需要存入当前的Promise并返回
    } else {
        return false;
    }
}
export class ServiceBase {
    public static axiosInstance: AxiosInstance;

    protected get config(): AxiosRequestConfig {
        return {
            baseURL: SettingUtil.getBaseUrl(),
            timeout: 20000,
            validateStatus: (status: number) => {
                // token 失效
                if (status === 401) {
                    SettingUtil.clearCasToken();
                    SettingUtil.removeToken();
                }
                return status >= 200 && status < 300;
            }
        };
    }

    public get authingServer(): string {
        return SettingUtil.getSetting("authingServer");
    }

    public get linglongServer(): string {
        return SettingUtil.getSetting("linglongServer");
    }

    public get baseUrl(): string {
        return SettingUtil.getBaseUrl();
    }

    public get server(): string {
        return SettingUtil.getSetting("linglongServer") || SettingUtil.getSetting("server");
    }

    public url(url: string): string {
        const baseUrl = SettingUtil.getBaseUrl();
        return baseUrl.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
    }

    /**
     * 把json对象转换成formData数据
     * @param data json对象
     */
    public toFormData(data: any): FormData {
        const fromData = new FormData();
        if (data) {
            Object.keys(data).forEach((key: any) => {
                // 忽略以“_”的参数
                if (key.indexOf("_") !== 0) {
                    fromData.append(key, data[key]);
                }
            });
        }
        return fromData;
    }

    /**
     * 发送post请求
     * @param url 请求地址
     * @param data 发送的参数
     */
    public _post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const cachePromise = checkPromise(url, data);
        if (cachePromise) {
            return cachePromise;
        } else {
            const promise = ServiceBase.axiosInstance
                .post(url, data, { ...this.config, ...config })
                .then((res: any) => res.data);
            promiseList.push({
                key: url + JSON.stringify(data),
                value: promise
            });
            return promise;
        }
    }
    /**
     * 发送get请求
     * @param url 请求地址
     */
    public _get<T>(url: string, config?: RequestConfig): Promise<T> {
        const cachePromise = checkPromise(url, "");
        if (cachePromise) {
            return cachePromise;
        } else {
            const promise = ServiceBase.axiosInstance
                .get(url, { ...this.config, ...config })
                .then((res: any) => res.data);
            promiseList.push({
                key: url,
                value: promise
            });
            return promise;
        }
    }

    /**
     * 发送put请求
     * @param url 请求地址
     * @param data 请求参数
     */
    public _put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        return ServiceBase.axiosInstance.put(url, data, { ...this.config, ...config }).then((res: any) => res.data);
    }

    /**
     * 发送delete请求 请求地址
     * @param url
     */
    public _delete<T>(url: string, data?: any): Promise<T> {
        return ServiceBase.axiosInstance.delete(url, { ...this.config, data: data }).then((res: any) => res.data);
    }

    /**
     * 导出数据
     * @param url
     * @param data
     */
    public _export(url: string, data?: any, type = "application/vnd.ms-excel"): Promise<any> {
        return ServiceBase.axiosInstance
            .post(url, data, {
                ...this.config,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*"
                },
                responseType: "arraybuffer"
            })
            .then((res: any) => {
                const blob = new Blob([res.data], {
                    type
                });
                const objectUrl = URL.createObjectURL(blob);
                window.location.href = objectUrl;
            });
    }

    /**
     * 请求数据源
     * @param info
     * @param config
     * @returns
     */
    public query(info: any, config: any) {
        return ServiceBase.axiosInstance.post(`${this.server}/world/unity/api/proxy/run`, info, {
            ...this.config,
            ...config
        });
    }
}
