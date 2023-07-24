export interface TimeLabel {
  label: string
  value: string
}

export const hours: Record<'all' | 'diurnal' | 'nocturnal' | 'custom', TimeLabel> = {
  all: { label: 'All day', value: '0-23' },
  diurnal: { label: 'Diurnal', value: '6-17' },
  nocturnal: { label: 'Nocturnal', value: '0-5,18-23' },
  custom: { label: 'Custom', value: '' }
}
