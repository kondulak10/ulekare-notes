import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'

const envFile = new URL('../.env', import.meta.url)
const dotenv = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {}

function read(name: string): string {
  const value = process.env[name] ?? dotenv[name]
  if (!value) throw new Error(`Missing ${name}: copy .env.example to .env`)
  return value
}

export const e2e = {
  apiPort: 3100,
  webPort: 5180,
  db: {
    host: read('DB_HOST'),
    port: Number(read('DB_PORT')),
    user: read('DB_USER'),
    password: read('DB_PASSWORD'),
    rootPassword: read('DB_ROOT_PASSWORD'),
    database: 'notes_e2e',
  },
}
