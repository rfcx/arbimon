export const isValidToken = (token: string): boolean =>
  /^Bearer ./i.test(token) // at least 1 character after space
