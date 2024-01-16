export const urlWrapper = (url: string): string => {
  return url.startsWith('static://') ? `/static/${url.replace('static://', '')}` : url
}
