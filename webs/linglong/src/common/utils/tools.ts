import { attempt, isError, isNil, isString } from "lodash-es";
import { SettingUtil } from "./setting-util";

export const getObjectTypeToString = (obj: any) => Object.prototype.toString.call(obj).slice(8, -1);

function parseLodash(s: string) {
    return attempt(JSON.parse.bind(null, s));
}

export function isValidJson(s: string) {
    return !isError(parseLodash(s));
}

/*
    指定长度和基数

*/
export const uuid = (len: number, radix: number) => {
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    let uuidArr = [],
        i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuidArr[i] = chars[0 | (Math.random() * radix)];
    } else {
        // rfc4122, version 4 form
        let r;

        // rfc4122 requires these characters
        uuidArr[8] = uuidArr[13] = uuidArr[18] = uuidArr[23] = "-";
        uuidArr[14] = "4";

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuidArr[i]) {
                r = 0 | (Math.random() * 16);
                uuidArr[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuidArr.join("");
};

export const getType = (obj: any) => Object.prototype.toString.call(obj).slice(8, -1);

export function isArray(arr: any) {
    return getType(arr) === "Array";
}

export const getQueryString = (name: string) => {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
};
export const removeQueryString = (name: string) => {
    // 从当前URL的?号开始的字符串
    // 如:http://www.baidu.com/s?wd=baidu&cl=3 它的search就是?wd=baidu&cl=3
    let queryString = window.location.search.substr(1);
    // 如果没有参数则返回空
    if (!isNil(queryString)) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        return queryString.replace(reg, "");
    }
    return "";
};

export const checkIsJSON = (str: string) => {
    if (typeof str === "string") {
        try {
            let obj = JSON.parse(str);
            if (typeof obj === "object" && obj) {
                return true;
            } else {
                return false;
            }
        } catch {
            return false;
        }
    }
    return false;
};

export const ROOTVALUE: number = 100;

/**
 * 
 * @param value 宽度、高度、字体大小值
 * @param unit 宽度、高度、字体大小单位
 * @return 
 */
export const getSize = (value: number | string, unit: string) => {
    if ((!value && value !== 0 && value !== "0") || !unit) {
        return;
    }

    if (unit === "auto") {
        return "auto";
    }

    return `${value}${unit}`;
};


/**
 * 打开html页面
 * @param pageName 页面名称
 * @param path #后面的路径
 */
export function openHtml(pageName: string, path: string, target: string = "_blank") {
    let href = getHref(pageName, path);
    let newA = document.createElement("a");
    newA.id = "gg";
    newA.target = target;
    newA["href"] = href;
    document.body.appendChild(newA);
    newA.click();
    document.body.removeChild(newA);
}

/**
 * 获取页面的href地址
 * @param pageName 页面名称
 * @param path #后面的路径
 */
export function getHref(pageName: string, path: string) {
    const { origin, pathname } = window.location;
    let arr = pathname.split("/");
    arr.pop();
    let prefix = arr.join("/");
    if (!pageName.endsWith(".html")) {
        pageName += ".html";
    }
    if (!path.startsWith("/")) {
        path = "/" + path;
    }
    let href = `${origin}${prefix}/${pageName}#${path}`;
    return href;
}

/**
 * 数据集字段值显示处理函数
 * @param value 字段值
 * @return false 代表无修改, 否则为处理后的结果
 */
export function dataFieldRenderHandler(value: any) {
    let res;
    if (isString(value)) {
        try {
            res = JSON.parse(value);
        } catch {
            return false;
        }
    }

    if (isArray(res)) {
        const list = res.filter((item: any) => item);
        const result = list.every((item: any) => typeof item === "number" || typeof item === "string" || typeof item === "boolean");
        return list?.length && result ? list.join("、") : "-";
    }

    return false;
}

/**
 * 将后台返回的图片相对地址拼接成完整的访问地址
 * @param path 图片相对地址
 * @returns 
 */
export function relativePathWrapper(path:string) {
    const baseUrl = SettingUtil.getBaseUrl();
    if (!path || path.startsWith("http://") || path.startsWith('https://') || path.startsWith(baseUrl)) {
        return path;
    }
    return baseUrl + path;
}