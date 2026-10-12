export class NotFoundError extends Error {
  constructor(entity: string, id: number) {
    super(`${entity} ${id} not found`)
    this.name = 'NotFoundError'
  }
}
