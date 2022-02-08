import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'

import { assetsService } from '@/activity-patterns/services'

export default class ActivityPatternsPredictedOccupancy extends Vue {
  @Prop() predictedOccupancyMaps!: string[]
  @Prop() speciesSlug!: string

  predictedOccupancyMapImages: PredictedOccupancyMap[] = []

  @Watch('predictedOccupancyMaps')
  async onPredictedOccupancyMaps (): Promise<void> {
    await this.getPredictedOccupancyMaps()
  }

  async getPredictedOccupancyMaps (): Promise<void> {
    this.predictedOccupancyMapImages = await Promise.all(this.predictedOccupancyMaps.map(async (filenameEithoutExtension) => {
      const image = await assetsService.getPredictedOccupancyMapImage(this.speciesSlug, filenameEithoutExtension)
      if (image === undefined) return { title: filenameEithoutExtension, url: '' }
      return {
        title: filenameEithoutExtension,
        url: window.URL.createObjectURL(image)
      }
    }))
    console.log(this.predictedOccupancyMapImages)
  }
}
