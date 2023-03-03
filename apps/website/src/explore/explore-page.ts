import { Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { storeKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

export default class HomePage extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  get projectRoutename (): string {
    return ROUTE_NAMES.overview
  }
}
