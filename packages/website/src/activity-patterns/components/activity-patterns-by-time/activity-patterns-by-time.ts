import { Vue } from 'vue-class-component'

import { ACTIVITY_PATTERN_KEYS } from '@/activity-patterns/functions'

interface DropDownOption {
  label: string
  value: string
}

export default class ActivityPatternsByTime extends Vue {
  selectedType = ACTIVITY_PATTERN_KEYS.detection
  datasetType: DropDownOption[] = [
    { label: 'Detection', value: ACTIVITY_PATTERN_KEYS.detection },
    { label: 'Detection frequency', value: ACTIVITY_PATTERN_KEYS.detectionFrequency },
    { label: 'Occupancy', value: ACTIVITY_PATTERN_KEYS.occupancy }
  ]
}
