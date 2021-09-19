import { Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

export default class ComparisonFilterComponent extends Vue {
  @Emit()
  public close (): boolean {
    return false
  }
}
