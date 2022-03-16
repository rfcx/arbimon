import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { TaxonSpeciesPhotoLight } from '@rfcx-bio/common/dao/types'

export default class SpeciesImage extends Vue {
  @Prop() speciesPhotos!: TaxonSpeciesPhotoLight[]

  handleImageUrl (url: string): string {
    const isValidUrl = /^https:\/\/./i.test(url)
    return isValidUrl ? url : new URL('../../../_assets/default-species-image.jpg', import.meta.url).toString()
  }

  imageDescription (image: TaxonSpeciesPhotoLight): string {
    return `${image.photoAuthor} - ${this.licenseCatagory(image.photoLicense)}`
  }

  licenseCatagory (imageLicense: TaxonSpeciesPhotoLight['photoLicense']): string {
    const freeLicenses = ['CC0', 'Copyrighted free use', 'Public domain']
    if (freeLicenses.includes(imageLicense)) return `no rights reserved (${imageLicense})`
    return `some rights reserved (${imageLicense})`
  }
}
