import { SettingUtil } from "../../common/utils/setting-util";
import { ServiceBase } from "../axios/index"
import { AxiosRequestConfig } from "axios";
import { parseInt } from "lodash-es";

export class UploadUtil {

    protected static getConfig(): AxiosRequestConfig {
        let timeout = SettingUtil.getSetting("uploadTimeout") || "60000";
        return {
            baseURL: SettingUtil.getBaseUrl(),
            timeout: Number.parseInt(timeout),
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

    // 上传文件到网盘服务器
    public static async upload(formData: FormData, clientId?: any) {
        let url = `${SettingUtil.getSetting("linglongServer")}/unity/page-datum/upload`;
        if (clientId) {
            url += `?clientId=${clientId}`;
        }
        let result = await ServiceBase.axiosInstance.post(url, formData, this.getConfig());
        return result.data;
    }
    // 通用文件上传
    public static async commonUpload(formData: FormData) {
        let result = await ServiceBase.axiosInstance.post(`${SettingUtil.getSetting("linglongServer")}/unity/establish/file/upload`, formData, this.getConfig());
        return result.data;
    }
    public static wrapperToken() {
        let token = SettingUtil.getToken();
        let tokenStr = "";
        if (token) {
            const splitToken = token.split(":");
            if (splitToken.length > 1) {
                tokenStr = `cas_type=${splitToken[0]}&cas_token=${splitToken[1]}`;
            } else {
                tokenStr = `access_token=${token}`;
            }
        }
        return tokenStr;
    }
    /**
     * 对返回的文件id包装成能访问的文件
     * @param fileId 文件id
     * @param serviceType 多媒体服务类型
     * @returns 
     */
    public static wrapper(fileId: string, serviceType?: string) {
        return (
            SettingUtil.getBaseUrl() +
            SettingUtil.getSetting("linglongServer") +
            `/unity/establish/file/${fileId}/download?${this.wrapperToken()}&serviceType=${serviceType || ""}`
        );
    }

    // free-方式：对返回的文件id包装成能访问的文件
    public static freeWrapper(fileId: string) {
        // 要改 cas_type 和 cas_token
        return (SettingUtil.getBaseUrl() + SettingUtil.getSetting("linglongServer") + `/free/login/${fileId}/download`);
    }

    // 批量上传文件
    public static async batchUpload(formData: FormData, clientId?: any) {
        let url = `${SettingUtil.getSetting("linglongServer")}/unity/page-datum/upload/batch`;
        if (clientId) {
            url += `?clientId=${clientId}`;
        }
        let result = await ServiceBase.axiosInstance.post(url, formData, this.getConfig());
        return result.data;
    }

    /**
     * 应用的文件上传-比如应用的背景图，统一导航的背景图，统一登录的背景图等
     * @param formData 参数： applicationId， projectId,   file
     * @returns
     */
    public static async applicationFileUpload(formData: FormData) {
        let result = await ServiceBase.axiosInstance.post(`${SettingUtil.getSetting("linglongServer")}/unity/application-file/upload`, formData, this.getConfig());
        return result.data;
    }
}
