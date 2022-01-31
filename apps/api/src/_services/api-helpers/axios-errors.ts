import { Forbidden, NotFound, Unauthorized } from '../errors/data-access-errors'

export const unpackAxiosError = (err: any): never => {
  const status = err.response?.status ?? 0
  switch (status) {
    // Convert from Axios error to our error
    case 401: throw new Unauthorized()
    case 403: throw new Forbidden()
    case 404: throw new NotFound()
    default: throw err
  }
}
