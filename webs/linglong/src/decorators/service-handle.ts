/* eslint-disable @typescript-eslint/ban-types */
import type BaseService from "@/services";
import { message } from "ant-design-vue";
import { ObjectFactory } from "./object-factory";

/**
 *
 * @param serviveType 服务的类型 指的是服务是保存类(delete/update/save)操作save 还是查询类操作query
 * 根据这个类型来决定调用不同的ResponseHandler
 */
export default function serviceHandler(
    serviveType: string,
    option?: {
        title?: string;
        dataName?: string;
        showTip?: boolean;
        showErrorMsg?: boolean;
    }
) {
    return function (target: any, name: any) {
        const method: Function = target[name];
        const handler = serviveType === "query" ? ResponseHandler.queryHandler : ResponseHandler.saveHandler;
        // let serviceName = target.constructor.name;
        // 这里改变是因为autowired中使用service示例本身作为key了 而不是使用service的类名
        const serviceName = target.constructor;
        const service: any = ObjectFactory.has(serviceName)
            ? ObjectFactory.get(serviceName)
            : ObjectFactory.create(target.constructor);
        Object.defineProperty(service, name, {
            get: function () {
                return handler(service, method, option);
            }
        });

        ObjectFactory.set(serviceName, service);
    };
}
class ResponseHandler {
    public static queryHandler(
        service: BaseService,
        method: Function,
        option?: {
            title?: string;
            dataName?: string;
            showTip?: boolean;
            showErrorMsg?: boolean;
        }
    ) {
        return async (...arg: Array<any>) => {
            const { title = "", dataName = "", showTip = false, showErrorMsg = true } = option as any;
            try {
                const result = await method.call(service, ...arg);
                let msg: string;
                if (result.hasError) {
                    msg = title ? `${title}出错!` : "请求服务失败";
                    msg = showErrorMsg ? result.message : msg;
                    (showTip || showErrorMsg) && ResponseHandler.message.error(msg);
                    console.error(msg);
                    return result;
                }
                const data = (dataName ? result[dataName] : result) || "";
                if (!data || (dataName === "" && !result.result)) {
                    msg = `${title}无结果!`;
                    showTip && ResponseHandler.message.warning(msg);
                    console.warn(msg);
                }
                return data;
            } catch (error: any) {
                ResponseHandler.handleError(error, option);
            }
        };
    }
    public static saveHandler(
        service: BaseService,
        method: Function,
        option?: {
            title?: string;
            dataName?: string;
            showTip?: boolean;
            showErrorMsg?: boolean;
        }
    ) {
        const { title = "", dataName = "", showTip = false, showErrorMsg = true } = option as any;
        return async (...arg: Array<any>) => {
            try {
                const result = await method.call(this || service, ...arg);
                let msg: string;
                if (result.hasError) {
                    msg = title ? `${title}出错!` : "请求服务失败";
                    msg = showErrorMsg ? result.message : msg;
                    (showTip || showErrorMsg) && ResponseHandler.message.error(msg);
                    console.error(msg);
                    return result;
                }
                msg = title ? `${title}成功!` : "请求服务成功";
                showTip && ResponseHandler.message.success(msg);
                const data = dataName ? result[dataName] : result;
                return data;
            } catch (error: any) {
                ResponseHandler.handleError(error, option);
            }
        };
    }
    public static handleError(error: any, option: any) {
        if (!error) {
            ResponseHandler.message.error({ content: "当前用户登录过期，请重新登录", key: "Unauthorized-401" });
            return;
        }
        let msg = option.title ? `${option.title}出错!` : "请求服务失败";
        msg = option.showErrorMsg ? error.response?.data?.message || msg : msg;
        console.error(msg, error);

        const errorCode = error.code;
        const response = error.response;
        if (errorCode === "ECONNABORTED") {
            ResponseHandler.message.error({ content: "网络或后台服务异常", key: errorCode });
        } else if (errorCode === "ERR_BAD_REQUEST" && response) {
            if (response.status === 404) {
                ResponseHandler.message.error(`${option.title}-接口404啦!`);
            } else {
                (option.showTip || option.showErrorMsg) && ResponseHandler.message.error(msg);
            }
        } else {
            (option.showTip || option.showErrorMsg) && ResponseHandler.message.error(msg);
        }
    }
    /**
     * 全局通知对象
     */
    public static get message() {
        return message;
    }
}
