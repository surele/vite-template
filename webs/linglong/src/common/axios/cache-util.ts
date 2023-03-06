import Axios from "axios";
import { CustomResponse, RequestConfig } from "./index";
import { attempt, isError } from "lodash-es";

// generateReqKey ：用于根据当前请求的信息，生成请求 Key；
export function generateReqKey(config: RequestConfig): string {
    // 响应的时候，response.config 中的data 是一个JSON字符串，所以需要转换一下
    if (config && config.data && isJsonStr(config.data)) {
        config.data = JSON.parse(config.data);
    }
    let { method, url, params, data } = config; // 请求方式，参数，请求地址，
    // 签名参数需要去掉
    params = { ...params };
    params.signature = undefined;
    params.timestamp = undefined;
    params.nonce = undefined;
    if (!method) {
        console.warn(`参数可能出错 config: ${config}`);
    }
    // qs.stringify 当 data 文件过大时，会出现内存溢出改为 JSON.stringify 勉强维持。
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join(""); // 拼接
}

function parseLodash(s: string) {
    return attempt(JSON.parse.bind(null, s));
}

// 判断一个字符串是否为JSON字符串
export function isJsonStr(str: string) {
    if (typeof str == "string") {
        return !isError(parseLodash(str));
    } else {
        return false;
    }
}

export namespace RequestCacheUtil {
    // 生产环境开启缓存，开发模型选配开启缓存
    const isDev = process.env.NODE_ENV === "development";
    const apicache = process.env.VUE_APP_API_CACHE;
    const options: any = {
        storage: isDev ? apicache : true, // 是否开启loclastorage缓存
        storageKey: "apiCache",
        storage_expire: 600000, // localStorage 数据存储时间60min（刷新页面判断是否清除）TODO: 目前这个不生效，因为有地方执行localstorage.clear
        expire: 20000 // 每个接口默认数据缓存ms 数
    };

    // 根据key获取缓存内容
    function getCacheItem(key: string) {
        try {
            let { data } = getCache();
            return (data && data[key]) || null;
        } catch (error) {
            return null;
        }
    }
    function setCacheItem(key: string, value: any) {
        let { data, storageExpire } = getCache();
        data[key] = value;
        const current = getNowTime();
        for (const dataKey in data) {
            if (data[dataKey].expire && current < data[dataKey].expire) {
                // 删除过期数据
                console.log("删除过期数据", dataKey);
                Reflect.deleteProperty(data, dataKey);
            }
        }
        try {
            window.localStorage.setItem(options.storageKey, JSON.stringify({ data, storageExpire }));
        } catch (error) {
            console.error(error);
            window.localStorage.removeItem(options.storageKey);
        }
    }

    function getCache() {
        let cachestr: any = window.localStorage.getItem(options.storageKey);
        if (!cachestr) {
            // cache不存在则初始化cache
            cachestr = JSON.stringify({ data: {}, storageExpire: getNowTime() });
            window.localStorage.setItem(options.storageKey, cachestr);
            return { data: {}, storageExpire: getNowTime() };
        }
        let cache = JSON.parse(cachestr);
        let { storageExpire } = cache;
        // 超时清空数据
        if (!storageExpire || getNowTime() - storageExpire > options.storage_expire) {
            cache = { data: {}, storageExpire: getNowTime() };
            window.localStorage.setItem(options.storageKey, JSON.stringify(cache));
            return cache;
        }
        return cache;
    }

    let _CACHES = {};
    // 使用Proxy代理
    let cacheHandler = {
        get: function (target: any, key: string) {
            let value = target[key];
            if (options.storage && !value) {
                value = getCacheItem(key);
            }
            return value;
        },
        set: function (target: any, key: string, value: any) {
            target[key] = value;
            if (options.storage) {
                setCacheItem(key, value);
            }

            return true;
        }
    };
    let CACHES = new Proxy(_CACHES, cacheHandler);

    // 使用多个拦截器时注意拦截器执行顺序
    export function useRequestCache(axiosInstance?: typeof Axios) {
        let axios = axiosInstance || Axios;
        axios.interceptors.request.use(
            (config: RequestConfig) => {
                // 请求增加接口缓存支持
                requestInterceptor(config);
                return config;
            },
            (error: any) => {
                console.error(error);
                return Promise.reject(error);
            }
        );

        axios.interceptors.response.use(
            (res) => {
                // Do something with response data
                // 请求结果缓存
                responseInterceptor(res);
                return res;
            },
            (e) => {
                // 请求缓存处理方式
                if (axios.isCancel(e) && e.message?.data?.config.cache) {
                    return Promise.resolve(e.message.data); // 返回结果数据
                }
                return Promise.reject(e);
            }
        );
    }

    export function requestInterceptor(config: any) {
        // 开启缓存则保存请求结果和cancel 函数
        if (config.cache) {
            let data = CACHES[`${generateReqKey(config)}`];
            // 这里用于存储是默认时间还是用户传递过来的时间
            let setExpireTime = config.setExpireTime || options.expire;

            // 判断缓存数据是否存在 存在的话 是否过期 没过期就返回
            if (data && getNowTime() - data.expire < setExpireTime) {
                let cancel: any;
                if (!cancel) {
                    config.cancelToken = new Axios.CancelToken((c) => {
                        cancel = c;
                    });
                    (<any>config).cancel = cancel;
                }
                cancel(data);
                console.log(`${config.url}请求取消，将读取缓存数据`, data);
            }
        }
    }

    export function responseInterceptor(response: CustomResponse) {
        // 返回的code === 200 时候才会缓存下来
        if (response && response?.config?.cache && response?.status === 200) {
            let data = {
                expire: getNowTime() + (response.config!.setExpireTime || options.expire),
                data: response
            };

            CACHES[`${generateReqKey(response.config)}`] = data;
        }
    }

    // 获取当前时间戳
    function getNowTime() {
        return new Date().getTime();
    }
}
