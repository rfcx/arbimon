import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Species } from '@rfcx-bio/common/api-bio-types/species'

export default class SpeciesImage extends Vue {
  @Prop() species!: Species

  // TODO 190: Improve image handler
  speciesImage (): string {
    const url = this.species?.thumbnailImageUrl
    return url && url.length > 0 ? url : new URL('../../../_assets/default-species-image.jpg', import.meta.url).toString()
  }
}
