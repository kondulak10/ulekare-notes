import { defineConfig, devices } from '@playwright/test'
import { e2e } from './env.ts'

const apiUrl = `http://localhost:${e2e.apiPort}`
const webUrl = `http://localhost:${e2e.webPort}`

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [[process.env.CI ? 'github' : 'list'], ['html', { open: 'never' }]],
  use: {
    baseURL: webUrl,
    locale: 'cs-CZ',
    timezoneId: 'Europe/Prague',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start --workspace @notes/api',
      cwd: '..',
      url: `${apiUrl}/api/health`,
      env: {
        API_PORT: String(e2e.apiPort),
        DB_HOST: e2e.db.host,
        DB_PORT: String(e2e.db.port),
        DB_NAME: e2e.db.database,
        DB_USER: e2e.db.user,
        DB_PASSWORD: e2e.db.password,
      },
    },
    {
      command: `npm run dev --workspace @notes/web -- --port ${e2e.webPort} --strictPort`,
      cwd: '..',
      url: webUrl,
      env: { API_URL: apiUrl },
    },
  ],
})
