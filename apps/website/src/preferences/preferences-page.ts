import { Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { storeKey } from '@/globals'
import { type BiodiversityStore } from '~/store'

export default class PreferencesPage extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
}
