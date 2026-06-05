import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

// The `any`-unsafe family — turned off for files where untyped values are
// inherent (tests/mocks, dynamic code) or the module is legacy and won't be typed.
const UNSAFE_RULES_OFF = {
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
};

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

      // The service layer has a deliberately loose, untyped fetch boundary
      // (res.json() is `any`), so these fire on API-derived values across the
      // whole app and can't be cleared without typing every service. We accept
      // a loosely-typed API layer for now. no-explicit-any stays ON below as a
      // guard against writing *new* explicit `any`.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },

  // Config/build files are not app code — don't type-check them.
  {
    files: ['**/*.config.{js,ts,cjs,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Tests & mocks legitimately use `any` for fixtures and stubs.
  {
    files: ['**/*.test.{ts,tsx}', 'src/__tests__/**', 'src/mocks/**'],
    rules: UNSAFE_RULES_OFF,
  },

  // Legacy / inherently-untyped modules, exempt from the unsafe-any family:
  // imageUtils (the Quill image pipeline — legacy, being retired) and
  // exerciseTestRunner (executes user-submitted code dynamically via Function).
  {
    files: ['src/utils/imageUtils.tsx', 'src/lib/exerciseTestRunner.ts'],
    rules: UNSAFE_RULES_OFF,
  },
]);
