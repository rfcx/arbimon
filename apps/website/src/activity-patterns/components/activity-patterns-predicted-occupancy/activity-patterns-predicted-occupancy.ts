import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'

import { assetsService } from '@/activity-patterns/services'

export default class ActivityPatternsPredictedOccupancy extends Vue {
  @Prop() predictedOccupancyMaps!: PredictedOccupancyMap[]

  predictedOccupancyMapImages: PredictedOccupancyMap[] = []

  @Watch('predictedOccupancyMaps')
  async onPredictedOccupancyMaps (): Promise<void> {
    await this.getPredictedOccupancyMaps()
  }

  async getPredictedOccupancyMaps (): Promise<void> {
    this.predictedOccupancyMapImages = await Promise.all(this.predictedOccupancyMaps.map(async ({ title }) => {
      console.log({ title })
      const image = await assetsService.getPredictedOccupancyMapImage(title)
      console.log({ image })
      if (image === undefined) return { title, url: '' }
      return {
        title,
        url: window.URL.createObjectURL(image)
      }
    }))
    console.log(this.predictedOccupancyMapImages)
  }
}
