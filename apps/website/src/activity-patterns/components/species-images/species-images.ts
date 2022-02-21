import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { SpeciesPhotoLight } from '@rfcx-bio/common/dao/types'

export default class SpeciesImage extends Vue {
  @Prop() speciesPhotos!: SpeciesPhotoLight[]

  handleImageUrl (url: string): string {
    const isValidUrl = /^https:\/\/./i.test(url)
    return isValidUrl ? url : new URL('../../../_assets/default-species-image.jpg', import.meta.url).toString()
  }
}
