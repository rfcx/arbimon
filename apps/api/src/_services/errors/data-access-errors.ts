export class Unauthorized extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class Forbidden extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFound extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}
