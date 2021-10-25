import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { getSpeciesSummary } from '@/_services/api/species-service/species-service-api'
import { WikiSummary } from '@/_services/api/species-service/types'

const WIKIPEDIA_MOBILE_MAX_WIDTH = 760

export default class SpeciesInformation extends Vue {
  @Prop() speciesName!: string

  speciesInformation: WikiSummary | undefined = undefined
  isLoading = true

  get speciesWikiUrl (): string | undefined {
    return screen.width <= WIKIPEDIA_MOBILE_MAX_WIDTH ? this.speciesInformation?.contentUrls?.mobile : this.speciesInformation?.contentUrls?.desktop
  }

  async mounted (): Promise<void> {
    await this.getSpeciesInformation()
  }

  @Watch('speciesName')
  async onSpeciesNameChange (): Promise<void> {
    await this.getSpeciesInformation()
  }

  speciesImage (url: string | undefined): string | URL {
    return url ?? new URL('../../assets/default-species-image.jpg', import.meta.url)
  }

  async getSpeciesInformation (): Promise<void> {
    this.isLoading = true
    try {
      this.speciesInformation = await getSpeciesSummary(this.speciesName)
    } catch (e) {
      // TODO #167
    }
    this.isLoading = false
  }
}
