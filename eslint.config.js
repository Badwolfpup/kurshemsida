import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // Not part of the React app: build output and the standalone Node
  // video-pipeline tool (its own runtime — Playwright/edge-tts/ffmpeg).
  { ignores: ['dist', 'video-pipeline/**'] },

  tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,
  reactHooks.configs['recommended-latest'],

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      js,
    },
    // prettierConfig (eslint-config-prettier) turns OFF ESLint's stylistic
    // rules so they never conflict with Prettier. Formatting itself is handled
    // by Prettier on save (see .vscode/settings.json), NOT through ESLint.
    extends: ['js/recommended', prettierConfig],
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Config files outside any tsconfig (vite.config.ts is already in
        // tsconfig.node.json, so it must NOT be listed here) — allow them into
        // the default project instead of erroring "not found by project service".
        projectService: {
          allowDefaultProject: [
            'eslint.config.js',
            'postcss.config.js',
            'vitest.config.ts',
            'tailwind.config.ts',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // TypeScript already checks these, and the core versions produce false
      // positives (no-undef flags JSX's `React`, Node/vitest globals; core
      // no-unused-vars duplicates the @typescript-eslint version; no-redeclare
      // flags TS type+value sharing a name, which is legal).
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',

      // This project types props with TypeScript, not React PropTypes.
      'react/prop-types': 'off',

      // Async event handlers (onClick={async () => ...}) are idiomatic React.
      // Still flag misused promises everywhere else, just not in JSX attributes.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
]);
