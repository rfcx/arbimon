import { Options, Vue } from 'vue-class-component'

import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '~/maps'
import { MapDataSet } from '~/maps/map-bubble'
import MapBubbleComponent from '~/maps/map-bubble/map-bubble'
import { MapConfig } from '~/maps/types'
import { generatePopupHtml, transformToMapDataset } from './functions'

@Options({
  components: {
    MapBubbleComponent
  }
})
export default class OverviewLocationComponent extends Vue {
  siteMapDataset!: MapDataSet
  getPopupHtml = generatePopupHtml

  config: MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
  }

  override mounted (): void {
    this.siteMapDataset = transformToMapDataset()
  }

  mapMoved (config: MapConfig): void {
    this.config = config
  }
}
