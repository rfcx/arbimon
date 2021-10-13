import { Options, Vue } from 'vue-class-component'

import NavbarComponent from '../components/navbar/navbar.vue'

@Options({
  components: { NavbarComponent }
})
export default class HomePage extends Vue {}
