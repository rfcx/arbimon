import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { getSpeciesSummary } from '@/_services/api/wiki-service'
import { WikiSummary } from '@/_services/api/wiki-service/types'

const WIKIPEDIA_MOBILE_MAX_WIDTH = 760

export default class SpeciesInformation extends Vue {
  @Prop() speciesName!: string

  speciesInformation: WikiSummary | undefined = undefined
  isLoading = true

  get speciesWikiUrl (): string | undefined {
    return screen.width <= WIKIPEDIA_MOBILE_MAX_WIDTH ? this.speciesInformation?.contentUrls?.mobile : this.speciesInformation?.contentUrls?.desktop
  }

  async created (): Promise<void> {
    await this.getSpeciesInformation()
  }

  @Watch('speciesName')
  async onSpeciesNameChange (): Promise<void> {
    await this.getSpeciesInformation()
  }

  // TODO 190: Improve image handler
  speciesImage (url: string | undefined): string {
    return url ?? new URL('../../assets/default-species-image.jpg', import.meta.url).toString()
  }

  async getSpeciesInformation (): Promise<void> {
    this.isLoading = true
    const speciesName = this.speciesName
    try {
      const information = await getSpeciesSummary(speciesName)
      if (this.speciesName === speciesName) {
        this.speciesInformation = information
        this.isLoading = false
      }
    } catch (e) {
      if (this.speciesName === speciesName) {
        this.isLoading = false
      }
      // TODO 167: Error handling
    }
  }
}
