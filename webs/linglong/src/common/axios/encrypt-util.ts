import type { RequestConfig } from "./index";
// @ts-ignore
import CryptoJS from "crypto-js";
import smCrypto from "sm-crypto";
import JSEncrypt from "jsencrypt";

// 获取登录时的加密文本
export function getLoginEncryptText(text: string) {
    const loginEncrypt = (<any>window).$loginEncrypt;
    if (loginEncrypt) {
        return getEncryptText(loginEncrypt.type, loginEncrypt.publicKey, text);
    } else {
        return text;
    }
}
// 获取请求体body加密文本
export function getBodyEncryptText(text: string) {
    const bodyEncrypt = (<any>window).$bodyEncrypt;
    if (bodyEncrypt) {
        return getEncryptText(bodyEncrypt.type, bodyEncrypt.publicKey, text);
    } else {
        return text;
    }
}
// 进行加密
function getEncryptText(encrptType: string, publicKey: string, text: string): string {
    if (!publicKey) {
        return text;
    }
    if (!encrptType) {
        return text;
    }
    if (publicKey === "none" || !publicKey) {
        return text;
    }
    let result = text;
    if (encrptType === "sm2") {
        result = smCrypto.sm2.doEncrypt(text, publicKey, 1);
    } else if (encrptType === "rsa") {
        const encryptor = new JSEncrypt(); // 新建JSEncrypt对象
        encryptor.setPublicKey(publicKey); // 设置公钥
        result = encryptor.encrypt(text);
    }
    return result;
}

// 对headers的X-Key，X-Iv进行base64加密
function getHeaderEncryptText(text: string) {
    const wordArray = CryptoJS.enc.Utf8.parse(text);
    return CryptoJS.enc.Base64.stringify(wordArray);
}
export function encrypt(config: RequestConfig): RequestConfig {
    // 针对post和put,content-type为application/json的参数进行base64/aes加密
    let can = false;
    if (config.data) {
        can = Object.prototype.toString.call(config.data) !== "[object FormData]";
    }
    if ((config.method === "post" || config.method === "put") && can) {
        const bodyEncrypt = (<any>window).$bodyEncrypt;
        if (bodyEncrypt && bodyEncrypt.type === "base64") {
            config.data = JSON.stringify(config.data);
            const wordArray = CryptoJS.enc.Utf8.parse(config.data);
            config.data = CryptoJS.enc.Base64.stringify(wordArray);
            config.headers["Content-Type"] = "application/json;charset=utf-8";
        } else if (bodyEncrypt && bodyEncrypt.type === "aes") {
            // 生成aes 16位密钥key，16位偏移量iv
            const keyNumber = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 15)) + "";
            const ivNumber = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 15)) + "";
            const xKey = CryptoJS.enc.Utf8.parse(keyNumber);
            const iv = CryptoJS.enc.Utf8.parse(ivNumber);
            let data = JSON.stringify(config.data);
            const encrypted = CryptoJS.AES.encrypt(data, xKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC, // mode 与后台一致。有多个模式可选
                padding: CryptoJS.pad.Pkcs7
            });
            data = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
            // key和iv进行rsa加密
            config.headers["X-Key"] = getHeaderEncryptText(keyNumber);
            config.headers["X-Iv"] = getHeaderEncryptText(ivNumber);
            config.data = data;
            config.headers["Content-Type"] = "application/json;charset=utf-8";
        } else if (bodyEncrypt && bodyEncrypt.type === "sm4") {
            // sm4加密
            const keyStr: string = getSm4Str();
            const iv: string = getSm4Str();
            if (!config.headers) {
                config.headers = {};
            }

            config.headers["X-Key"] = getHeaderEncryptText(keyStr);
            config.headers["X-Iv"] = getHeaderEncryptText(iv);
            config.data = smCrypto.sm4.encrypt(JSON.stringify(config.data), keyStr, { mode: "cbc", iv: iv });
            config.headers["Content-Type"] = "application/json;charset=utf-8";
        }
    }
    return config;
}
// 获取32位长度16进制字符串
function getSm4Str(): string {
    let result: string = "";
    for (let i = 0; i < 32; i++) {
        result += Math.floor(Math.random() * 16).toString(16); //获取0-15并通过toString转16进制
    }
    return result;
}
