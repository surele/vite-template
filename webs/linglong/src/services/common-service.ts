import { ServiceBase, SettingUtil } from "@magic/design-core";
// tslint:disable-next-line:no-implicit-dependencies
import { EncryptUtil } from "@magic/design-core";
export default class CommonService extends ServiceBase {
    public getUrl(url: string) {
        return this.baseUrl + url;
    }

    public async login(username: string, password: string): Promise<any> {
        return this._post(
            `${this.authingServer}/oauth/extras/token`,
            {
                client_id: "unity-client",
                client_secret: "unity",
                grant_type: "password",
                password: EncryptUtil.getLoginEncryptText(password),
                username: username
            },
            {
                remote: true
            }
        );
    }
}
