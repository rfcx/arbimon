import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import SpeciesInformationContent from './species-information-content.vue'

interface SpeciesInformation {
  description: string
  sourceUrl: string
  sourceCite?: string
}

@Options({
  components: {
    SpeciesInformationContent
  }
})
export default class SpeciesBackgroundInformation extends Vue {
  @Prop() speciesInformation!: SpeciesInProject | null

  /**
   * Clean up html tag from raw content
   */
  get speciesCleanContent (): string {
    const rawContent = this.speciesInformation?.description ?? ''
    const div = document.createElement('div')
    div.innerHTML = rawContent
    return div.innerText
  }

  get information (): SpeciesInformation | null {
    const description = this.speciesCleanContent

    return {
      description,
      sourceUrl: '',
      sourceCite: 'to be update'
      // sourceCite: hasIUCNInfo ? (sourceCite ?? 'IUCN Red List') : 'Wikipedia',
    }
  }
}
