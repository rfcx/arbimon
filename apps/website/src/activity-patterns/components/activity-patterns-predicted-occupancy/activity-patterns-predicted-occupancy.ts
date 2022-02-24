import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { downloadPng } from '@rfcx-bio/utils/file'

import { assetsService } from '@/activity-patterns/services'

export default class ActivityPatternsPredictedOccupancy extends Vue {
  @Prop() predictedOccupancyMaps!: PredictedOccupancyMap[]
  @Prop() speciesSlug!: string

  blobUrls: string[] = []

  @Watch('predictedOccupancyMaps')
  async onPredictedOccupancyMapsChange (): Promise<void> {
    await this.getBlobImageUrls()
  }

  async getBlobImageUrls (): Promise<void> {
    this.blobUrls = await Promise.all(this.predictedOccupancyMaps.map(async ({ url }) => {
      const blob = await assetsService.getPredictedOccupancyMapImage(url)
      return blob ? window.URL.createObjectURL(blob) : ''
    }))
  }

  downloadImage (predictedOccupancyMapImage: PredictedOccupancyMap): void {
    downloadPng(predictedOccupancyMapImage.url, predictedOccupancyMapImage.title)
  }
}
