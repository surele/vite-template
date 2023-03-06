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

export class ServiceBase {
    private static axiosInstance: AxiosInstance;

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
