import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import { RiskRatingUi, RISKS_BY_ID } from '~/risk-ratings'

export default class SpeciesTitle extends Vue {
  @Prop() species!: SpeciesInProject

  get riskInformation (): RiskRatingUi {
    return RISKS_BY_ID[this.species?.riskRatingIucnId ?? -1]
  }
}
