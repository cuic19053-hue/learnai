/**
 * ESLint Configuration for LearnAI
 * Production-ready linting rules for Next.js with TypeScript
 *
 * @author Ruslan Magana (ruslanmv.com)
 * @license MIT
 */

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier", // Must be last to override other configs
  ],
  plugins: ["@typescript-eslint", "react", "react-hooks", "prettier"],
  rules: {
    // Prettier integration
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],

    // TypeScript specific rules
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
      },
    ],

    // React specific rules
    "react/react-in-jsx-scope": "off", // Not needed in Next.js
    "react/prop-types": "off", // Using TypeScript for prop validation
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // General JavaScript/TypeScript rules
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "quote-props": ["error", "as-needed"],

    // Import rules
    "sort-imports": [
      "error",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],

    // Best practices
    "no-throw-literal": "error",
    "no-return-await": "error",
    "require-await": "off",
    eqeqeq: ["error", "smart"],
    // Allow single-statement `if (cond) return …;` — common in early-return
    // guards across this codebase. Multi-line bodies still require braces.
    curly: ["error", "multi-line"],
    // React rules — relaxed for the design-heavy components in this repo.
    "react/no-unescaped-entities": "off",
    // Don't force imports to be alphabetised — modern editors handle this
    // automatically and the rule generates a lot of noise on PRs that
    // change unrelated lines.
    "sort-imports": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    // Hot-path Next.js anchor-vs-Link is enforced by next/core-web-vitals;
    // turn it down to warn so legacy dashboard routes don't block CI.
    "@next/next/no-html-link-for-pages": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    {
      // Configuration files
      files: ["*.config.js", "*.config.ts"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "public/",
    "*.config.js",
    ".eslintrc.js",
  ],
};
