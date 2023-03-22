import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { type SpeciesInProject } from '@rfcx-bio/common/dao/types/species-in-project'

import { type RiskRatingUi, DEFAULT_RISK_RATING_ID, RISKS_BY_ID } from '~/risk-ratings'

export default class SpeciesTitle extends Vue {
  @Prop() species!: SpeciesInProject
  @Prop({ default: false }) loading!: boolean

  get riskInformation (): RiskRatingUi {
    return RISKS_BY_ID[this.species?.riskRatingId ?? DEFAULT_RISK_RATING_ID]
  }
}
