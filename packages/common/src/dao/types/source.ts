export const SOURCES = <const>{
  iucn: 'IUCN',
  wiki: 'WIKI'
}

export type Source = typeof SOURCES[keyof typeof SOURCES]
