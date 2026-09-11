import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

// Browser journeys run on every device project; the API and MCP specs run once.
const browserJourneys = [
  '**/landing.spec.ts',
  '**/product.spec.ts',
  '**/cards.spec.ts',
  '**/study.spec.ts',
  '**/connections.spec.ts',
  '**/touch-layout.spec.ts',
];

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3210',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api-mcp',
      testMatch: [
        '**/isolation.spec.ts',
        '**/seed-lifecycle.spec.ts',
        '**/database-role.spec.ts',
        '**/mcp-availability.spec.ts',
        '**/token-query.spec.ts',
      ],
    },
    {
      name: 'desktop',
      testMatch: browserJourneys,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'tablet',
      testMatch: browserJourneys,
      use: { ...devices['iPad Mini'], defaultBrowserType: 'chromium' },
    },
    {
      name: 'mobile',
      testMatch: browserJourneys,
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
  ],
});
