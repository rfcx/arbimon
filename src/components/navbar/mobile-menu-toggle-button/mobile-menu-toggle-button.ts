import { Vue } from 'vue-class-component'
import { Emit } from 'vue-property-decorator'

export default class MobileMenuToggleButton extends Vue {
  public isToggled: boolean = false

  @Emit()
  public toggleMobileMenu (): void {
    this.isToggled = !this.isToggled
  }
}
