import Cookies, { CookieAttributes } from "js-cookie";
import { isEmpty } from "lodash-es";
export class SettingUtil {
    // 当前激活的应用
    public static applicationId: string = "linglong";

    /**
     * 获取灵珑的后台服务接口
     * @returns
     */
    public static getBaseUrl() {
        let key = "";
        if (this.applicationId) {
            key = this.applicationId + ":baseUrl";
        } else {
            key = "baseUrl";
        }
        return (
            localStorage.getItem(key) ||
            Cookies.get(key) ||
            (<any>window).commonConfig[key] ||
            (<any>window).commonConfig["baseUrl"] ||
            ""
        ).replace(/\/$/, "");
    }

    /**
     * 获取除了baseUrl外的其他配置项,先读取数据库，再读取本地。
     * @param key
     * @param type
     * @returns
     */
    public static getSetting(key: string, type: "string" | "number" | "boolean" = "string") {
        let commonSetting = (<any>window).commonSetting;
        // 只要配置了数据库，那么就全部都走数据库，不允许一部分配数据库，一部分配本地setting文件
        if (isEmpty(commonSetting)) {
            // 走本地配置
            let keyName = this.getLocalKey(key);
            return localStorage.getItem(keyName) || Cookies.get(keyName) || (<any>window).commonConfig[key] || "";
        } else {
            // 走后台数据库配置
            if (type === "string") {
                return (commonSetting[key] || "") + "";
            } else if (type === "number") {
                if (key in commonSetting) {
                    // 包含该对象
                    return Number(commonSetting[key]);
                } else {
                    return 0;
                }
            } else if (type === "boolean") {
                if (key in commonSetting) {
                    // 包含该对象
                    return commonSetting[key] === "true";
                } else {
                    return false;
                }
            }
        }
    }

    // 清除cas token 信息
    public static clearCasToken() {
        let casKey = this.getLocalKey("cas_access_token");
        localStorage.removeItem(casKey);
        Cookies.remove(casKey);
    }

    // 保存cas token 信息
    public static saveCasToken(cas_type: string, cas_token: string, expires?: number) {
        if (cas_type && cas_token) {
            let casKey = this.getLocalKey("cas_access_token");
            localStorage.setItem(casKey, `${cas_type}:${cas_token}`);
            Cookies.set(casKey, `${cas_type}:${cas_token}`, {
                expires: expires
            });
        } else {
            throw new Error("cas-type 或 cas-token不能为空，请检查程序");
        }
    }

    // 保存token
    public static saveToken(token: string, expires?: number) {
        if (token) {
            let tokenKey = this.getLocalKey("access_token");
            localStorage.setItem(tokenKey, token);
            Cookies.set(tokenKey, token, {
                expires: expires
            });
            if (tokenKey.startsWith("linglong:")) {
                Cookies.set("access_token", token, {
                    expires: expires
                });
            }
        } else {
            throw new Error("token不能为空，请检查程序");
        }
    }

    // 保存应用的token
    public static saveAppToken(applicationId: string, token: string, expires?: number) {
        if (token && applicationId) {
            const tokenKey = `${applicationId}:access_token`;
            localStorage.setItem(tokenKey, token);
            Cookies.set(tokenKey, token, {
                expires: expires
            });
        } else {
            throw new Error("token或applicationId不能为空，请检查程序");
        }
    }

    // 移除应用的token
    public static removeAppToken(applicationId: string) {
        if (applicationId) {
            const tokenKey = `${applicationId}:access_token`;
            localStorage.removeItem(tokenKey);
            Cookies.remove(tokenKey);
        }
    }

    // 取应用的token
    public static getAppToken(applicationId: string) {
        if (applicationId) {
            const tokenKey = `${applicationId}:access_token`;
            let casKey = `${applicationId}:cas_access_token`;
            let token =
                Cookies.get(casKey) ||
                localStorage.getItem(casKey) ||
                Cookies.get(tokenKey) ||
                localStorage.getItem(tokenKey) ||
                "";
            return token;
        } else {
            return "";
        }
    }

    public static getAuthorization() {
        let token = this.getToken();
        if (token.indexOf(":") > -1) {
            return "cas " + token;
        } else {
            return "Bearer " + token;
        }
    }

    // 取token
    public static getToken() {
        let tokenKey = this.getLocalKey("access_token");
        let casKey = this.getLocalKey("cas_access_token");
        let token =
            Cookies.get(casKey) ||
            localStorage.getItem(casKey) ||
            Cookies.get(tokenKey) ||
            localStorage.getItem(tokenKey) ||
            "";
        return token;
    }

    public static removeToken() {
        let tokenKey = this.getLocalKey("access_token");
        let casKey = this.getLocalKey("cas_access_token");
        Cookies.remove(tokenKey);
        Cookies.remove(casKey);
        if (tokenKey.startsWith("linglong:")) {
            Cookies.remove("access_token");
        }
        localStorage.clear();
    }

    // 保存在cookie中数据
    public static commonSaveCookie(key: string, value: string, options: CookieAttributes = {}) {
        if (key && value) {
            const saveKey = this.getLocalKey(key);
            Cookies.set(saveKey, value, options);
        }
    }
    // 取本地cookie数据
    public static commonGetCookie(key: string) {
        const saveKey = this.getLocalKey(key);
        const value = Cookies.get(saveKey) || "";
        return value;
    }
    // 移除本地cookie数据
    public static commonRemoveCookie(key: string) {
        const saveKey = this.getLocalKey(key);
        Cookies.remove(saveKey);
    }
    // 保存在本地数据
    public static commonSaveLocal(key: string, value: string) {
        if (key && value) {
            const saveKey = this.getLocalKey(key);
            localStorage.setItem(saveKey, value);
        }
    }
    // 取本地数据
    public static commonGetLocal(key: string) {
        const saveKey = this.getLocalKey(key);
        const value = localStorage.getItem(saveKey) || "";
        return value;
    }
    // 移除本地数据
    public static commonRemoveLocal(key: string) {
        const saveKey = this.getLocalKey(key);
        localStorage.removeItem(saveKey);
    }
    // 存取本地数据的key值
    public static getLocalKey(key: string) {
        const localKey = this.applicationId ? `${this.applicationId}:${key}` : key;
        return localKey;
    }

    // 获取当前用户名
    public static getUsername(): string {
        let username = Cookies.get("linglong:username");
        if (username) return username;
        try {
            const { user } = JSON.parse(localStorage.getItem("linglong:user") || "{}") || {};
            username = user?.name;
        } catch (error) {
            console.error(error);
        }
        return username || "";
    }

    // 是否为管理员
    public static isAdmin(): boolean {
        const account = SettingUtil.getUsername();
        return ["admin", "root"].includes(account);
    }
}
