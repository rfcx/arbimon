import { Vue } from 'vue-class-component'

import { StreamModels } from '@/models'
import { StreamServiecs } from '@/services'

export default class SpeciesRichnessPage extends Vue {
  public streams: StreamModels.Stream[] = []

  async mounted (): Promise<void> {
    await this.getStreams()
  }

  // Example: to be update
  async getStreams (): Promise<void> {
    this.streams = await StreamServiecs.getStreams()
  }
}
