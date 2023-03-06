import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "index.ts",
    output: [
        {
            dir: "dist",
            format: "cjs",
            entryFileNames: "[name].cjs.js"
        },
        {
            dir: "dist",
            format: "esm",
            entryFileNames: "[name].esm.js"
        }
    ],
    plugins: [typescript(), resolve(), commonjs()]
};
