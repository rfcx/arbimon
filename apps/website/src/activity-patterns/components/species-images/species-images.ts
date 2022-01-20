import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Species } from '@rfcx-bio/common/api-bio/species/common'

export default class SpeciesImage extends Vue {
  @Prop() species!: Species

  get imageRef (): string {
    return this.species.information.find(({ sourceType }) => sourceType === 'Wiki')?.sourceUrl ?? ''
  }

  // TODO 190: Improve image handler
  speciesImage (): string {
    const url = this.species.thumbnailImageUrl
    return url && url.length > 0 ? url : new URL('../../../_assets/default-species-image.jpg', import.meta.url).toString()
  }
}
