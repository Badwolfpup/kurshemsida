# Testing Infrastructure Setup — kurshemsida

This document describes the testing infrastructure that must be in place for pre-merge reviews to work correctly. If you're setting up a fresh clone or the infrastructure is missing, follow these steps.

## Prerequisites

- Node.js installed
- `npm install` already run (dependencies resolved)

## Step 1: Verify TypeScript strict flags

Open `tsconfig.json` and confirm these flags exist in `compilerOptions`:

```json
"noUncheckedIndexedAccess": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true
```

If missing, add them. These flags will produce new warnings in existing code — **do not fix them now**. They catch issues in new code going forward and get fixed per-branch during pre-merge Step 0.

## Step 2: Verify ESLint config

Open `eslint.config.js` and confirm:

1. **`strictTypeChecked`** is used instead of `recommended`:
   ```js
   tseslint.configs.strictTypeChecked,
   ```

2. **`parserOptions`** with `projectService` is set in `languageOptions`:
   ```js
   languageOptions: {
     globals: globals.browser,
     parserOptions: {
       projectService: true,
       tsconfigRootDir: import.meta.dirname,
     },
   },
   ```

3. **`react-hooks`** plugin is included:
   ```js
   import reactHooks from 'eslint-plugin-react-hooks';
   // ...
   reactHooks.configs['recommended-latest'],
   ```

If these are already present (check the file), no action needed. The stricter rules will produce new lint warnings — **do not fix them now**.

## Step 3: Install MSW

Check if `msw` is in `devDependencies` in `package.json`. If not:

```bash
npm install -D msw
```

Then verify these three scaffolding files exist:

### `src/mocks/handlers.ts`
```ts
import { http, HttpResponse } from 'msw';

// Add request handlers here as needed.
// Example:
// http.get('/api/courses', () => {
//   return HttpResponse.json([{ id: 1, name: 'Test Course' }]);
// }),

export const handlers = [
  // handlers go here
];
```

### `src/mocks/server.ts`
```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### `src/test-setup.ts`
```ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

If any are missing, create them with the content above.

## Step 4: Verify Vitest config

Open `vitest.config.ts` and confirm the `test` block includes:

```ts
test: {
  environment: 'node',
  globals: true,
  setupFiles: ['./src/test-setup.ts'],
  bail: 1,
},
```

Key additions vs a vanilla config:
- `setupFiles` — wires up MSW lifecycle (server start/reset/stop)
- `bail: 1` — stop on first failure (faster feedback in pre-merge loops)

## Step 5: Verify

Run the test suite to confirm nothing is broken:

```bash
npx vitest run
```

All existing tests should pass. The MSW setup is inert until handlers are populated — it won't interfere with existing tests.

## What NOT to do

- **Do not fix existing TS/lint errors.** They are pre-existing and will be fixed in dedicated per-branch sessions.
- **Do not write MSW-backed hook tests yet.** Those are written organically when the unit-test skill encounters hooks with SCENARIO comments during future pre-merge runs.
- **Do not install `@fast-check/vitest` yet.** It gets installed when the first property-based test is written.

## How this fits together

The pre-merge pipeline (`/pre-merge`) uses this infrastructure:
1. **Step 0 (Lint/Analyze)** — runs `tsc --noEmit` and `npm run lint`, fixes errors only in changed files
2. **Step 2 (Build and test)** — runs `vitest run --bail=1`
3. **Step 3.5 (Integration tests)** — runs tests in `src/__tests__/integration/` if they exist (MSW-backed)
4. **Step 4 (Unit tests)** — the unit-test skill may flag fast-check candidates for parsers/formatters
5. **Step 5 (Playwright)** — checks for persistent `.spec.ts` files before manual testing
