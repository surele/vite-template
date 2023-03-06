module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:vue/vue3-essential",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    overrides: [
        {
            files: ["*.vue"],
            rules: {
                "no-unused-vars": "off"
            }
        }
    ],
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: "latest",
        parser: "@typescript-eslint/parser",
        sourceType: "module"
    },
    plugins: ["vue", "@typescript-eslint"],
    rules: {
        "vue/multi-word-component-names": [
            "error",
            {
                ignores: ["index"]
            }
        ],
        "no-console": "off",
        "no-debugger": "off",
        "no-unused-vars": "warn",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-types": [
            "error",
            {
                extendDefaults: true,
                types: {
                    "{}": false
                }
            }
        ],
        indent: ["error", 4],
        "linebreak-style": "off",
        quotes: ["error", "double", { allowTemplateLiterals: true }],
        semi: ["error", "always"]
    }
};
