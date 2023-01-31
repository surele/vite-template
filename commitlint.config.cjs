module.exports = {
    // extends: ["@commitlint/config-conventional"]
    rules: {
        "type-enum": [2, "always", ["[A]", "[M]", "[D]"]],
        "type-empty": [2, "never"],
        "header-max-length": [0, "always", 72]
    }
};
