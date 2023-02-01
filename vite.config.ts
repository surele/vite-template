/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";
import stylelint from "vite-plugin-stylelint";
import virtualHtml from "vite-plugin-virtual-html";
import ejs from "ejs";

const pages = {
    index: {
        template: "/src/pages/index/index.html",
        // entry: "/src/main.ts",
        title: "vite template",
        data: {
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
        stylelint({
            fix: true
        }),
        virtualHtml({
            pages,
            render(str, data) {
                return ejs.render(str, data);
            }
        })
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: fileURLToPath(new URL("./src", import.meta.url))
            }
        ]
    },
    build: {
        target: "es2015"
    }
});
