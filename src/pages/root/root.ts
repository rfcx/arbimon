import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from './navbar/navbar.vue'

@Options({
  components: {
    'nav-bar': NavigationBarComponent
  }
})
export default class RootPage extends Vue { }
