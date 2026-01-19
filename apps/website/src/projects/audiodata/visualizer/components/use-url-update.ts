import { urlUpdateService } from './url-update'

interface UseUrlUpdated {
  updateUrl: (url: string) => string
  getUrl: (url: string) => string
  clear: () => void
}

export function useUpdatedUrl (): UseUrlUpdated {
  return {
    updateUrl: (url: string) => urlUpdateService.update(url),
    getUrl: (url: string) => urlUpdateService.get(url),
    clear: () => { urlUpdateService.clear() }
  }
}
