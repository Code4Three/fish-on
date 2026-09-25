import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

const reactRecommendedConfig = pluginReact.configs.flat.recommended;

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**", "public/**/*.json"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: [
      "*.config.js",
      "src/api/**/*.js",
      "src/builders/**/*.js",
      "src/cache/**/*.js",
      "src/scripts/**/*.js",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
  })),
  {
    files: ["**/*.{jsx,tsx}"],
    ...reactRecommendedConfig,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactRecommendedConfig.rules,
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
]);
