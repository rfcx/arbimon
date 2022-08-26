import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { storeKey, togglesKey } from '@/globals'
import { FeatureToggles } from '~/feature-toggles'
import { BiodiversityStore } from '~/store'
import InvalidProjectComponent from '../components/invalid-project/invalid-project.vue'
import NavbarComponent from '../components/navbar/nav-bar.vue'

@Options({
  components: {
    NavbarComponent,
    InvalidProjectComponent
  }
})
export default class ProjectRoot extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore
  @Inject({ from: togglesKey }) readonly toggles!: FeatureToggles

  get displayWarningProjectSyncing (): boolean {
    const syncingProjects: string[] = []
    return this.toggles.warningModal && this.store.selectedProject !== undefined && syncingProjects.includes(this.store.selectedProject?.slug)
  }
}
