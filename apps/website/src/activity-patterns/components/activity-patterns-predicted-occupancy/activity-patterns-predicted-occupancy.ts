import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species'

export default class ActivityPatternsPredictedOccupancy extends Vue {
  @Prop() predictedOccupancyMaps!: PredictedOccupancyMap[]
}
