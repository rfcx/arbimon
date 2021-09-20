import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from '@/components/navbar/navbar.vue'

@Options({
  components: { NavigationBarComponent }
})
export default class IndexPage extends Vue {}
