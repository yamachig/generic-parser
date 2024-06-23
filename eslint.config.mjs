import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import tsdoc from "eslint-plugin-tsdoc";

export default tseslint.config(
    {
        ignores: ["data/**/*", "lib/**/*"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.commonjs,
                ...globals.node,
            },
            parser: tseslint.parser,
            ecmaVersion: 12,
            sourceType: "script",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        plugins: {
            tsdoc,
        },

        rules: {
            indent: ["error", 4],
            quotes: ["error", "double"],
            semi: ["error", "always"],

            "no-multiple-empty-lines": [
                "error", {
                    max: 2,
                }
            ],

            "comma-dangle": ["error", "only-multiline"],
            "object-curly-spacing": ["error", "always"],
            "array-element-newline": ["error", "consistent"],

            "array-bracket-newline": [
                "error", {
                    multiline: true,
                }
            ],

            "comma-spacing": [
                "error", {
                    before: false,
                    after: true,
                }
            ],

            "arrow-spacing": "error",

            "prefer-arrow-callback": "error",

            "no-constant-condition": [
                "error", {
                    checkLoops: false,
                }
            ],

            "key-spacing": [
                "error", {
                    beforeColon: false,
                }
            ],

            "space-unary-ops": [
                "error", {
                    words: true,
                    nonwords: false,
                }
            ],

            "space-infix-ops": [
                "error", {
                    int32Hint: false,
                }
            ],

            "space-before-function-paren": [
                "error", {
                    asyncArrow: "always",
                    named: "never",
                }
            ],

            "block-spacing": "error",
            "nonblock-statement-body-position": ["error", "beside"],

            "no-multi-spaces": [
                "error", {
                    ignoreEOLComments: true,
                }
            ],

            "no-trailing-spaces": "error",
            "eol-last": ["error", "always"],
            "keyword-spacing": "error",

            "@typescript-eslint/no-misused-promises": [
                "error", {
                    checksVoidReturn: false,
                }
            ],

            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error"],

            "@typescript-eslint/type-annotation-spacing": "error",
            "tsdoc/syntax": "warn",
        },
    },
);
