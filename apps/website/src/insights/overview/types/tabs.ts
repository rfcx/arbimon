export type TabValue = 'speciesRichness' | 'detection'

export interface Tab {
  label: string
  value: TabValue
}

export const TAB_VALUES = {
  richness: 'speciesRichness',
  detections: 'detection'
} as const

export const tabs: Tab[] = [
  { label: 'Species Richness', value: TAB_VALUES.richness },
  { label: 'Detections (raw)', value: TAB_VALUES.detections }
]

export const MAP_KEY_THAT_SHOULD_NOT_EXIST = 'refactorThis'
