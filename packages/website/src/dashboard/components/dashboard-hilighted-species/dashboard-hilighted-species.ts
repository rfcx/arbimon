import { Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { ROUTE_NAMES } from '~/router'
import { BiodiversityStore } from '~/store'

export default class DashboardHilightedSpecies extends Vue {
  @Inject() readonly store!: BiodiversityStore

  get activityOverview (): string {
    return ROUTE_NAMES.activity_overview
  }

  get projectId (): string | undefined {
    return this.store.selectedProject?.id
  }
}
