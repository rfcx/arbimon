export interface Analysis {
  value: string
  title: string
  count: number | undefined
  isLoading: boolean
  label: string
  speciesDetected?: number
  link: string
}

export interface Stat {
  value: string
  title: string
  count: number | undefined
  isLoading: boolean
  label: string
  link: string
}
