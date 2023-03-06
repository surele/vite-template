/**
 * scriptURL: 加载js的地址
 * type: 类型 相同js地址唯一
 * 动态加载Js
 */
export function dynamicLoadJs({
    type,
    scriptURL,
    timeout = 120 * 1000
}: {
    type: string;
    scriptURL: string;
    timeout?: number;
}) {
    return new Promise<void>((resolve, reject) => {
        if (!type) {
            reject("type 不允许为空");
            return;
        }
        if ((window as any)[type]) {
            resolve((window as any)[type]);
            return;
        }
        const loadTimeout = () => {
            reject("js加载超时, 请重新尝试");
        };
        const timeoutID = setTimeout(loadTimeout, timeout);

        let script: any = document.querySelector(`#js_${type}`);
        if (!script) {
            script = document.createElement("script");
            script.id = `js_${type}${new Date().getTime()}`;
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", scriptURL);
            document.body.appendChild(script);
        }


        console.debug(`dynamic load script ${scriptURL}`);
        script.onload = () => {
            clearTimeout(timeoutID);
            document.body.removeChild(script);
            resolve();
        };
        script.onerror = () => {
            clearTimeout(timeoutID);
            document.body.removeChild(script);
            reject();
        };
    });
}
