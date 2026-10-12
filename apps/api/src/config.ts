function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable ${name}`)
  return value
}

export function loadConfig() {
  return {
    port: Number(process.env.API_PORT ?? 3000),
    db: {
      host: required('DB_HOST'),
      port: Number(process.env.DB_PORT ?? 3306),
      database: required('DB_NAME'),
      user: required('DB_USER'),
      password: required('DB_PASSWORD'),
    },
  }
}

export type Config = ReturnType<typeof loadConfig>
