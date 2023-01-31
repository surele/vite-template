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
    overrides: [],
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: "latest",
        parser: "@typescript-eslint/parser",
        sourceType: "module"
    },
    plugins: ["vue", "@typescript-eslint"],
    rules: {
        "no-console": "off",
        "no-debugger": "off",
        "no-unused-vars": "warn",
        "@typescript-eslint/no-unused-vars": "off",
        indent: ["error", 4],
        "linebreak-style": "off",
        quotes: ["error", "double"],
        semi: ["error", "always"]
    }
};
