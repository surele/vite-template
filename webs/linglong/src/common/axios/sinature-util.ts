import { RequestConfig } from "./index";
import Axios from "axios";
// @ts-ignore
import Base64 from "crypto-js/enc-base64";
// @ts-ignore
import { HmacSHA1 } from "crypto-js";

export namespace SignatureUtil {
    const options = {
        signature: true, // 是否开启签名
        ak: "a8782bd2aca1419e8b8d52ad611310b6", // 必填
        appId: "linglong" // 可选
    };

    (function () {
        if (!(<any>window)._nonce_prefix) {
            (<any>window)._nonce_prefix = randomString(10);
        }
    })();

    export function useSignature(axiosInstance?: typeof Axios) {
        const axios = axiosInstance || Axios;
        axios.interceptors.request.use(
            (config: RequestConfig) => {
                signature(config);
                return config;
            },
            (error: any) => {
                return Promise.reject(error);
            }
        );
    }

    export function randomString(length: number = 10) {
        return Math.random().toString(32).substr(2, length);
    }

    export function getSortedParams(params: any) {
        if (Object.prototype.toString.call(params !== "[object Object]")) {
            return params;
        }
        return Object.fromEntries(
            Object.entries(params)
                .sort()
                .map((v: any) => [v[0], encode(v[1])])
        );
    }

    export function encode(str: string) {
        return encodeURIComponent(str)
            .replace(/%2B/g, "+")
            .replace(/%20/g, "+")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/'/g, "%27")
            .replace(/!/g, "%21")
            .replace(/~/g, "%7E");
    }

    export function signature(config: RequestConfig): RequestConfig {
        if (!options.signature) {
            return config;
        }
        if (!options.ak) {
            return config;
        }
        // 时间戳参数： 每次请求时发送
        const timestamp = parseInt(new Date().getTime() / 1000 + "");
        // nonce 随机参数： randomString_randomString
        const nonce = `${(<any>window)._nonce_prefix}_${randomString(10)}`;

        /**
         * signature 参数：
         * 参数格式： base64(hmac_sha1(url + "?" + encodeURI(sorted_params)), ak)
         * 其中：
         * url为去除 origin，路径参数后的地址，且确保其中不含后// 双斜杠；
         * hmac_sha1为加密算法，可以直接使用类库crypto-js
         * ak 参数，与后端服务一一对应，每一个拥有独立后台服务的前端均使用不同的ak。
         * 若前端对应了多个后端，则前端独立使用一个ak, 且header中增加参数App-Id=XXX
         *
         */

        // query参数处理, 添加timestamp和nonce
        config.params = {
            timestamp,
            nonce,
            ...config.params
        };
        let encodedStr = encodeURI(getSortedParams(config.params));
        if (config.method === "post") {
            if (config.headers["Content-Type"]?.includes("application/json")) {
                // post类型 Content-Type=application/json，将body参数进行处理
                if (config.data) {
                    encodedStr += encode(JSON.stringify(config.data));
                }
            }
        }
        const signatureVal = Base64.stringify(
            HmacSHA1(`${config.url?.split("?")[0].replace(/\/+/g, "/")}?${encodedStr}`, options.ak)
        );
        // 加入参数签名
        config.params = {
            signature: signatureVal,
            ...config.params
        };
        config.headers["App-Id"] = options.appId;
        return config;
    }
}
