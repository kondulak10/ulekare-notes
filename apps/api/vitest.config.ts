import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { defineConfig } from 'vitest/config'

const envFile = new URL('../../.env', import.meta.url)
const dotenv = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {}

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/**/*.test.ts'],
          exclude: ['test/**/*.integration.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['test/**/*.integration.test.ts'],
          env: { ...dotenv, ...process.env, TZ: 'America/New_York' },
        },
      },
    ],
  },
})
