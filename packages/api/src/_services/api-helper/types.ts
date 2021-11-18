import { Method } from 'axios'

export type RequestMethod = Method & ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')

// TODO ??? - Extract to utils
export interface Endpoint {
  method: RequestMethod
  url: string
}
