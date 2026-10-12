import { createPool } from 'mariadb'
import type { Config } from '#/config.ts'

export function createDbPool(db: Config['db']) {
  return createPool({ ...db, connectionLimit: 5, timezone: 'Z', dateStrings: true })
}
