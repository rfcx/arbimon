import { Options, Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { Species, SPECIES_SOURCE_IUCN, SPECIES_SOURCE_WIKI, SpeciesInformation, SpeciesLight } from '@rfcx-bio/common/api-bio-types/species'

import { getSpecies } from '~/api/species-service'
import SpeciesInformationContentComponent from './species-information-content.vue'

@Options({
  components: {
    SpeciesInformationContentComponent
  }
})
export default class SpeciesBackgroundInformation extends Vue {
  @Prop() species!: SpeciesLight | null

  isLoading = true
  speciesInformation: Species | null = null

  /**
   * Clean up html tag from raw content from iucn api
   */
  get speciesIUCNCleanContent (): string {
    const rawContent = this.iucnSpeciesInformation?.description ?? ''
    const div = document.createElement('div')
    div.innerHTML = rawContent
    return div.innerText
  }

  get iucnSpeciesInformation (): SpeciesInformation | null {
    return this.speciesInformation?.information.find(({ sourceType }) => sourceType === SPECIES_SOURCE_IUCN) ?? null
  }

  get wikiSpeciesInformation (): SpeciesInformation | null {
    return this.speciesInformation?.information.find(({ sourceType }) => sourceType === SPECIES_SOURCE_WIKI) ?? null
  }

  override async created (): Promise<void> {
    await this.getSpeciesInformation()
  }

  @Watch('species')
  async onSpeciesChange (): Promise<void> {
    await this.getSpeciesInformation()
  }

  // TODO 190: Improve image handler
  speciesImage (): string {
    const url = this.speciesInformation?.thumbnailImageUrl
    return url && url.length > 0 ? url : new URL('../../../_assets/default-species-image.jpg', import.meta.url).toString()
  }

  async getSpeciesInformation (): Promise<void> {
    const scientificName = this.species?.scientificName
    if (!scientificName) return
    try {
      const speciesInformation = await getSpecies(scientificName)
      if (this.species?.scientificName === scientificName) {
        this.speciesInformation = speciesInformation ?? null
        this.isLoading = false
      }
    } catch (e) {
      if (this.species?.scientificName === scientificName) {
        this.isLoading = false
      }
      // TODO 167: Error handling
    }
  }
}
