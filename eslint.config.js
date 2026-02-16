import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-undef": "error",
      "no-console": "off",
      "no-process-exit": "off",

      eqeqeq: ["warn", "always"],
      "no-var": "warn",
      "prefer-const": "warn",
      "object-shorthand": "warn",
      "arrow-body-style": ["warn", "as-needed"],

      "no-return-await": "warn",
      "require-await": "warn",
    },
  },

  {
    files: ["**/__tests__/**/*.js", "**/*.test.js", "**/test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "require-await": "off",
    },
  },
];
