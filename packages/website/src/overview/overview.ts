import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { BiodiversityStore } from '~/store'
import OverviewMetrics from './components/overview-metrics/overview-metrics.vue'
import OverviewSitemap from './components/overview-sitemap/overview-sitemap.vue'
import ProjectInfo from './components/project-info/project-info.vue'

@Options({
  components: {
    OverviewMetrics,
    OverviewSitemap,
    ProjectInfo
  }
})
export default class OverviewPage extends Vue {
  @Inject() readonly store!: BiodiversityStore
}
