import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Markdown from 'vue3-markdown-it'

@Options({
  components: {
    Markdown
  }
})
export default class DashboardProjectProfile extends Vue {
  @Prop() information!: string
  @Prop() loading!: boolean
}
