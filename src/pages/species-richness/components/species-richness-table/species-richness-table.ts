import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class SpeciesRichnessTable extends Vue {
  @Prop() dataset!: string
}
