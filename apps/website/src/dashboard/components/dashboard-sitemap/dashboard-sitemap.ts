import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { MapBubbleComponent, MapDataSet, MapMoveEvent } from '~/maps/map-bubble'
import { BiodiversityStore } from '~/store'
import { generatePopupHtml, transformToMapDataset } from './functions'

@Options({
  components: { 
    MapBubbleComponent
  }
})
export default class DashboardSitemap extends Vue {
  @Inject() readonly store!: BiodiversityStore

  dataset: MapDataSet | null = null
  getPopupHtml = generatePopupHtml

  mapMoveEvent: MapMoveEvent | null = null

  override mounted (): void {
    this.dataset = transformToMapDataset(this.store.sites)
  }

  propagateMapMove (mapMove: MapMoveEvent): void { this.mapMoveEvent = mapMove }
}
