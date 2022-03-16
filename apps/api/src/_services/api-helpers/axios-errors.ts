import { BioForbiddenError, BioNotFoundError, BioUnauthorizedError } from '~/errors'

export const unpackAxiosError = (err: any): never => {
  const status = err.response?.status ?? 0
  switch (status) {
    // Convert from Axios error to our error
    case 401: throw BioUnauthorizedError()
    case 403: throw BioForbiddenError()
    case 404: throw BioNotFoundError()
    default: throw err
  }
}
