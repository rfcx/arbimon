import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { RouteLocationRaw } from 'vue-router'

export default class DashboardSidebarTitle extends Vue {
  @Prop() title!: string
  @Prop({ default: undefined }) subtitle!: string | undefined
  @Prop() route!: RouteLocationRaw
}
