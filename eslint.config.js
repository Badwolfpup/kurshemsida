import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: {
      js,
      prettier: pluginPrettier, // Add Prettier plugin here
    },
    extends: [
      "js/recommended",
      prettierConfig, // Add Prettier config here
    ],
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      "prettier/prettier": "error", // Add this to show Prettier errors as ESLint errors
    }
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);