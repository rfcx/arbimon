import { Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

export default class MobileMenuToggleButton extends Vue {
  @Prop(Boolean) readonly isToggled: boolean | undefined

  @Emit('toggleMobileMenu')
  public toggleMobileMenu (): void {}
}
