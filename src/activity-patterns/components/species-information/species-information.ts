import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { getSpeciesSummary } from '@/_services/api/species-service/species-service-api'
import { WikiSummary } from '@/_services/api/species-service/types'

export default class SpeciesInformation extends Vue {
  @Prop() speciesName!: string

  speciesInformation: WikiSummary | undefined = undefined

  async mounted (): Promise<void> {
    try {
      this.speciesInformation = await this.getSpeciesInformation()
    } catch (e) {
      //
    }
  }

  @Watch('speciesName')
  async onSpeciesNameChange (): Promise<void> {
    try {
      this.speciesInformation = await this.getSpeciesInformation()
    } catch (e) {
      //
    }
  }

  async getSpeciesInformation (): Promise<WikiSummary | undefined> {
    return await getSpeciesSummary(this.speciesName)
  }
}
