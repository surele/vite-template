/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";
import stylelint from "vite-plugin-stylelint";
import virtualHtml from "vite-plugin-virtual-html";
import ejs from "ejs";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import VueSetupExtend from "vite-plugin-vue-setup-extend";

const pages = {
    index: {
        template: "/src/pages/index.html",
        // entry: "/src/main.ts",
        data: {
            title: "vite template",
            script: `<script type="module" src="/src/pages/index/main.ts"></script>`
        }
        // body: "<div id='app'></div>" //可选, 默认值: '<div id="app"></div>'
    }
};

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom"
    },
    plugins: [
        vue(),
        VueSetupExtend(),
        stylelint({
            fix: true
        }),
        virtualHtml({
            pages,
            render(str, data) {
                return ejs.render(str, data);
            }
        }),
        AutoImport({
            resolvers: [AntDesignVueResolver()]
        }),
        Components({
            dts: true,
            // dirs: ["src/components"], // 按需加载的文件夹
            resolvers: [
                AntDesignVueResolver({
                    // 参数配置可参考：https://github.com/antfu/unplugin-vue-components/blob/main/src/core/resolvers/antdv.ts
                    // 自动引入 ant-design/icons-vue中的图标，需要安装@ant-design/icons-vue
                    resolveIcons: true
                })
            ]
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    build: {
        target: "es2015"
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: "@import '@/assets/styles/common/_mixin.scss';" // 添加公共样式
            }
        }
    }
});
