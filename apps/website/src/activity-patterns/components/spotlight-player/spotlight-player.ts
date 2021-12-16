import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { SpeciesCall } from '@rfcx-bio/common/api-bio-types/species'

export default class SpotlightPlayer extends Vue {
  @Prop() speciesCall!: SpeciesCall
}
