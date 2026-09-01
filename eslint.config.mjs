import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettierRecommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,jsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-duplicate-imports": "error",
      "object-shorthand": ["error", "always"],
      "prefer-const": "error",
      "prefer-template": "error",
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
      "prettier/prettier": ["error", { printWidth: 100, tabWidth: 2, semi: true, singleQuote: false, trailingComma: "all" }],
      "@next/next/no-img-element": "off",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "react/jsx-no-useless-fragment": "warn",
      "react/self-closing-comp": ["error", { component: true, html: true }],
    },
  },
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "out/**",
    "build/**",
    "coverage/**",
    "public/**",
    "Tablas.pen",
  ]),
]);
