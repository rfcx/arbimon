import { Options, Vue } from 'vue-class-component'
import { useRoute } from 'vue-router'

import NavigationBarComponent from '../../components/navbar/navbar.vue'

@Options({
  components: {
    'nav-bar': NavigationBarComponent
  },
  mounted () {
    console.log('root mounted', this.route)
  },
  async setup () {
    console.log('root setup')
    const { params: { id } } = useRoute()
    console.log('root setup', id)
  }
})
export default class RootPage extends Vue {
  private readonly route = useRoute()
  private readonly id = this.route.params.id
}
