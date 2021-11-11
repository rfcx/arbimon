import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { Species } from '~/api'
import { wikiService, WikiSummary } from '~/api/wiki-service'

const WIKIPEDIA_MOBILE_MAX_WIDTH = 760

export default class SpeciesInformation extends Vue {
  @Prop() species!: Species | null

  isLoading = true
  speciesInformation: WikiSummary | null = null

  get speciesWikiUrl (): string | undefined {
    if (!this.speciesInformation) return ''

    return screen.width <= WIKIPEDIA_MOBILE_MAX_WIDTH
      ? this.speciesInformation.contentUrls.mobile
      : this.speciesInformation.contentUrls.desktop
  }

  override async created (): Promise<void> {
    await this.getSpeciesInformation()
  }

  @Watch('species')
  async onSpeciesNameChange (): Promise<void> {
    await this.getSpeciesInformation()
  }

  // TODO 190: Improve image handler
  speciesImage (url: string | undefined): string {
    return url ?? new URL('../../assets/default-species-image.jpg', import.meta.url).toString()
  }

  async getSpeciesInformation (): Promise<void> {
    const speciesName = this.species?.speciesName
    if (!speciesName) return

    this.isLoading = true
    try {
      const information = await wikiService.getSpeciesSummary(speciesName)
      if (this.species?.speciesName === speciesName) {
        this.speciesInformation = information ?? null
        this.isLoading = false
      }
    } catch (e) {
      if (this.species?.speciesName === speciesName) {
        this.isLoading = false
      }
      // TODO 167: Error handling
    }
  }
}
