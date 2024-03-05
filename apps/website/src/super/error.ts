export interface Error {
  message: string
  name: string
  response?: {
    status: number
    statusText: string
  }
}
