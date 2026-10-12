import { readFileSync } from 'node:fs'
import { createConnection } from 'mariadb'
import { e2e } from './env.ts'

const schema = readFileSync(
  new URL('../apps/api/db/migrations/001_create_notes.sql', import.meta.url),
  'utf8',
)

export default async function globalSetup() {
  const { host, port, user, rootPassword, database } = e2e.db
  const root = await createConnection({ host, port, user: 'root', password: rootPassword }).catch(
    (error: unknown) => {
      throw new Error(`Cannot reach MariaDB at ${host}:${port}. Run "npm run db:up" first.`, {
        cause: error,
      })
    },
  )
  try {
    await root.query(`DROP DATABASE IF EXISTS ${database}`)
    await root.query(`CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await root.query(`GRANT ALL PRIVILEGES ON ${database}.* TO '${user}'@'%'`)
    await root.query(`USE ${database}`)
    await root.query(schema)
  } finally {
    await root.end()
  }
}
