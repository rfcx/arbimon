import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { getSpeciesThumbnailImage } from '@/_services/api/species-service/species-service-api'

export default class SpeciesInformation extends Vue {
  @Prop() speciesName!: string

  speciesImageUrl = ''

  async mounted (): Promise<void> {
    try {
      this.speciesImageUrl = await this.getSpeciesImageUrl()
    } catch (e) {
      //
    }
  }

  @Watch('speciesName')
  async onSpeciesNameChange (): Promise<void> {
    try {
      this.speciesImageUrl = await this.getSpeciesImageUrl()
    } catch (e) {
      //
    }
  }

  async getSpeciesImageUrl (): Promise<string> {
    return await getSpeciesThumbnailImage(this.speciesName)
  }
}
