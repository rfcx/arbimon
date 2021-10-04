import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) dataset!: []

  get tableHeader (): string[] {
    return [
      'Species name',
      'Class'
    ]
  }

  get hasNoData (): boolean {
    return this.dataset.length === 0
  }
}
