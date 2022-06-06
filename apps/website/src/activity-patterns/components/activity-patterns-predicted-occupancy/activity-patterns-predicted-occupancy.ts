import { AxiosInstance } from 'axios'
import { Vue } from 'vue-class-component'
import { Inject, Prop, Watch } from 'vue-property-decorator'

import { PredictedOccupancyMap } from '@rfcx-bio/common/api-bio/species/project-species-one'
import { downloadPng } from '@rfcx-bio/utils/file'

import { getPredictedOccupancyMapImage } from '@/activity-patterns/services'

export default class ActivityPatternsPredictedOccupancy extends Vue {
  @Inject() readonly apiClientBio!: AxiosInstance

  @Prop() predictedOccupancyMaps!: PredictedOccupancyMap[]
  @Prop() speciesSlug!: string

  blobUrls: string[] = []

  @Watch('predictedOccupancyMaps')
  async onPredictedOccupancyMapsChange (): Promise<void> {
    await this.getBlobImageUrls()
  }

  async getBlobImageUrls (): Promise<void> {
    this.blobUrls = await Promise.all(this.predictedOccupancyMaps.map(async ({ url }) => {
      const blob = await getPredictedOccupancyMapImage(this.apiClientBio, url)
      return blob ? window.URL.createObjectURL(blob) : ''
    }))
  }

  downloadImage (filename: string, blobData: string): void {
    downloadPng(blobData, filename.slice(0, filename.lastIndexOf('.')) ?? filename)
  }
}
