export const urlify = (input: string): string =>
  input.toLowerCase()
    .replace(/[ _]/g, '-')
    .replace(/[^\da-z-]/g, '') // remove non-latin
    .replace(/-+/g, '-') // merge consecutive dashes

export const dateQueryParamify = (dateString: string): string =>
  dateString.replace(/[-:.]+/g, '')
