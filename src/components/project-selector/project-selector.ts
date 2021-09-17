import { Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

export default class ProjectSelectorComponent extends Vue {
  @Emit('closeProjectSelector')
  public closeProjectSelector (): void {}
}
