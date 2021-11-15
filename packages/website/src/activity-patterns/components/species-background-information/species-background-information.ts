import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { Species } from '~/api'
import { iucnService, IUCNSummary } from '~/api/iucn-service'
import { wikiService, WikiSummary } from '~/api/wiki-service'

const WIKIPEDIA_MOBILE_MAX_WIDTH = 760

export default class SpeciesInformation extends Vue {
  @Prop() species!: Species | null

  isLoading = true
  iucnSpeciesInformation: IUCNSummary | null = null
  wikiSpeciesInformation: WikiSummary | null = null

  get speciesIUCNUrl (): string {
    return this.iucnSpeciesInformation?.redirectUrl ?? ''
  }

  get speciesWikiUrl (): string {
    if (!this.wikiSpeciesInformation) return ''

    return screen.width <= WIKIPEDIA_MOBILE_MAX_WIDTH
      ? this.wikiSpeciesInformation.contentUrls.mobile
      : this.wikiSpeciesInformation.contentUrls.desktop
  }

  /**
   * Clean up html tag from raw content from iucn api
   */
  get speciesIUCNCleanContent (): string {
    const rawContent = this.iucnSpeciesInformation?.content ?? ''
    const div = document.createElement('div')
    div.innerHTML = rawContent
    return div.innerText
  }

  override async created (): Promise<void> {
    await this.getSpeciesInformation()
  }

  @Watch('species')
  async onSpeciesNameChange (): Promise<void> {
    await this.getSpeciesInformation()
  }

  // TODO 190: Improve image handler
  speciesImage (): string {
    const url = this.wikiSpeciesInformation?.thumbnailImage
    return url ?? new URL('../../assets/default-species-image.jpg', import.meta.url).toString()
  }

  async getSpeciesInformation (): Promise<void> {
    const speciesName = this.species?.speciesName
    if (!speciesName) return

    this.isLoading = true
    try {
      const [iucnInformation, wikiInformation] = await Promise.all([
        iucnService.getSpeciesSummary(speciesName),
        wikiService.getSpeciesSummary(speciesName)
      ])
      if (this.species?.speciesName === speciesName) {
        this.iucnSpeciesInformation = iucnInformation ?? null
        this.wikiSpeciesInformation = wikiInformation ?? null
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
