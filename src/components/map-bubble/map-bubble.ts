import mapboxgl from 'mapbox-gl'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ChartModels } from '@/models'

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicmZjeCIsImEiOiJoMEptMnlJIn0.LPKrjG_3AeYB5cqsyLpcrg'
export const MAPBOX_STYLE = 'mapbox://styles/rfcx/ckapdhmby26zo1io3nqd84dsd'
export const MAPBOX_STYLE_WITH_PLACE_LABELS = 'mapbox://styles/rfcx/ck9g6dci83g3x1io8dl27r7aq'

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

export default class MapBubbleComponent extends Vue {
  @Prop({ default: [] }) public datasets!: ChartModels.MapDataSet[]

  public get noData (): boolean {
    return this.chartData.length === 0
  }

  @Watch('chartData')
  onChartDataChange (): void {
    this.generateChart()
  }

  public generateChart (): void {
    const map = new mapboxgl.Map({
      container: 'map-bubble',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // lng, lat
      zoom: 9
    })
    console.log(map)
  }
}
