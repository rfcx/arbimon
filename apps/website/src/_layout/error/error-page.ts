import { Options, Vue } from 'vue-class-component'

import NavbarComponent from '@/_layout/components/navbar/nav-bar'

@Options({
  components: { NavbarComponent }
})
export default class ErrorPage extends Vue {}
