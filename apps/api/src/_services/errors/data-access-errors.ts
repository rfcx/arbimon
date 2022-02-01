export class Unauthorized extends Error {
  constructor () {
    super('unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class Forbidden extends Error {
  constructor () {
    super('forbidden')
    this.name = 'ForbiddenError'
  }
}

export class NotFound extends Error {
  constructor () {
    super('notfound')
    this.name = 'NotFoundError'
  }
}
