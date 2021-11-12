import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Species } from '~/api'

export default class ActivityPatternsPredictedOccupancy extends Vue {
  @Prop() species!: Species | null

  get predictedOccupancyImages (): Array<[string, string]> {
    return [
      ['equus-caballus', 'http://localhost:3000/activity-patterns/predicted-occupancy/equus-caballus.png'],
      ['equus-caballus-vi', 'http://localhost:3000/activity-patterns/predicted-occupancy/equus-caballus-vi.png']
    ]
  }
}
