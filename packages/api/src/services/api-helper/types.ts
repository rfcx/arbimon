import { Method } from 'axios'

export type RequestMethod = Method & ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')

export interface Endpoint {
  method: RequestMethod
  url: string
}
