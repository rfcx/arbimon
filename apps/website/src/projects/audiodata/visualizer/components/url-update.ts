type UrlCache = Record<string, string>

class UrlUpdateService {
  private cache: UrlCache = {}
  private readonly prefix = '_t_'

  clear (): void {
    this.cache = {}
  }

  get (url: string): string {
    let resolved = url
    while (this.cache[resolved]) {
      resolved = this.cache[resolved]
    }
    return resolved
  }

  update (url: string): string {
    const resolvedUrl = this.get(url)
    const timestamp = Date.now()

    const [base, queryString] = resolvedUrl.split('?')
    const params = new URLSearchParams(queryString || '')

    params.set(this.prefix, String(timestamp))

    const updatedUrl = `${base}?${params.toString()}`
    this.cache[resolvedUrl] = updatedUrl

    return updatedUrl
  }
}

export const urlUpdateService = new UrlUpdateService()
