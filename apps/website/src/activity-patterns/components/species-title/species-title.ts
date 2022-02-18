import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Species } from '@rfcx-bio/common/api-bio/species/types'
import { ExtinctionRisk, getExtinctionRisk } from '@rfcx-bio/common/iucn'

export default class SpeciesTitle extends Vue {
  @Prop() species!: Species | null

  get riskInformation (): ExtinctionRisk | null {
    return this.species?.extinctionRisk ? getExtinctionRisk(this.species.extinctionRisk) : null
  }
}
