import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { getSpeciesSummary } from '@/_services/api/species-service/species-service-api'
import { WikiSummary } from '@/_services/api/species-service/types'

export default class SpeciesInformation extends Vue {
  @Prop() speciesName!: string

  speciesInformation: WikiSummary | undefined = undefined
  isLoading = true

  async mounted (): Promise<void> {
    await this.getSpeciesInformation()
  }

  @Watch('speciesName')
  async onSpeciesNameChange (): Promise<void> {
    await this.getSpeciesInformation()
  }

  async getSpeciesInformation (): Promise<void> {
    this.isLoading = true
    try {
      this.speciesInformation = await getSpeciesSummary(this.speciesName)
    } catch (e) {
      //
    }
    this.isLoading = false
  }

  redirectToWiki (): string | undefined {
    return screen.width <= 760 ? this.speciesInformation?.contentUrls?.mobile : this.speciesInformation?.contentUrls?.desktop
  }
}
