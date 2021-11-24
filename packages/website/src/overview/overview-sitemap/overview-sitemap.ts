import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '~/maps'
import { MapBubbleComponent, MapConfig, MapDataSet } from '~/maps/map-bubble'
import { BiodiversityStore } from '~/store'
import { generatePopupHtml, transformToMapDataset } from './functions'

@Options({
  components: {
    MapBubbleComponent
  }
})
export default class OverviewSitemap extends Vue {
  @Inject() readonly store!: BiodiversityStore

  dataset: MapDataSet | null = null
  getPopupHtml = generatePopupHtml

  config: MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
  }

  override mounted (): void {
    this.dataset = transformToMapDataset(this.store.sites)
  }

  propagateMapMove (config: MapConfig): void { this.config = config }
}
