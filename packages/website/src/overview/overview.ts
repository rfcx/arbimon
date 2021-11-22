import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'
import OverviewSitemap from './overview-sitemap/overview-sitemap.vue'
import ProjectInfo from './project-info/project-info.vue'

@Options({
  components: {
    OverviewSitemap,
    ProjectInfo
  }
})
export default class OverviewPage extends Vue {
  @Inject() readonly store!: BiodiversityStore
}
