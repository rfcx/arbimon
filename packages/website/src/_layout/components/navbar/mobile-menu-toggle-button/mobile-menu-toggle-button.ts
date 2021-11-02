import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class MobileMenuToggleButtonComponent extends Vue {
  @Prop({ default: false }) readonly isToggled!: boolean
}
