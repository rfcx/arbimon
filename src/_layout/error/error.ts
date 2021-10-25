import { Options, Vue } from 'vue-class-component'

import NavbarComponent from '@/_layout/components/navbar/navbar'

@Options({
  components: { NavbarComponent }
})
export default class ErrorPage extends Vue {}
