import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Species, SPECIES_SOURCE_IUCN, SPECIES_SOURCE_WIKI, SpeciesInformation } from '@rfcx-bio/common/api-bio/species/types'

import SpeciesInformationContent from './species-information-content.vue'

@Options({
  components: {
    SpeciesInformationContent
  }
})
export default class SpeciesBackgroundInformation extends Vue {
  @Prop() species!: Species | null

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
    return this.species?.information.find(({ sourceType }) => sourceType === SPECIES_SOURCE_IUCN) ?? null
  }

  get wikiSpeciesInformation (): SpeciesInformation | null {
    return this.species?.information.find(({ sourceType }) => sourceType === SPECIES_SOURCE_WIKI) ?? null
  }
}
