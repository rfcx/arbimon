export const SOURCES = {
  iucn: 'IUCN',
  wiki: 'WIKI',
  amphibianweb: 'AMPHIBIANWEB',
  iNature: 'INATURALIST'
} as const

export type Source = typeof SOURCES[keyof typeof SOURCES]
