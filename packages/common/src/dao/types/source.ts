export const SOURCES = {
  iucn: 'IUCN',
  wiki: 'WIKI'
} as const

export type Source = typeof SOURCES[keyof typeof SOURCES]
