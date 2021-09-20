import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from '@/components/navbar/navbar.vue'

@Options({
  components: {
    'nav-bar': NavigationBarComponent
  }
})
// TODO: change error text to be prop , data
export default class ErrorPage extends Vue {}
