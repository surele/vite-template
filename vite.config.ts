/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { join } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom"
    },
    plugins: [vue()],
    resolve: {
        alias: [
            {
                find: "@/",
                replacement: join(__dirname, "src/")
            }
        ]
    },
    build: {
        target: "es2015"
    }
});
