import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', '.next/**', '**/*.stories.*', '**/stories/**'],
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.{idea,git,cache,output,temp}/**'],
    projects: [
      {
        extends: true,
        plugins: [tsconfigPaths(), react()],
        test: {
          name: 'app',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['vitest.setup.ts'],
          include: [
            '(components|lib|hooks|app|chopro)/**/*.{test,spec}.{ts,tsx}',
            '*.{test,spec}.{ts,tsx}'
          ],
          exclude: ['**/node_modules/**', '**/*.integration.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [tsconfigPaths()],
        test: {
          name: 'integration',
          globals: true,
          environment: 'node',
          setupFiles: ['tests/setup-env.ts', 'vitest.setup.integration.ts'],
          include: ['**/*.integration.test.ts'],
          poolOptions: {
            threads: {
              singleThread: true,
            },
          },
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          globals: true,
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }]
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
          testTimeout: 60000,
        },
      },
    ],
  },
});
