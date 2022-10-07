import { Options, Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { MAPBOX_STYLE_HEATMAP, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import MapStyleOptions from './map-style-options.vue'

@Options({
  components: {
    MapStyleOptions
  }
})
export default class MapToolMenuComponent extends Vue {
  @Prop({ default: MAPBOX_STYLE_SATELLITE_STREETS }) mapGroundStyle!: MapboxStyle
  @Prop({ default: MAPBOX_STYLE_HEATMAP }) mapStatisticsStyle!: MapboxStyle

  @Emit()
  emitShowLabelsToggle (): boolean {
    this.isShowLabels = !this.isShowLabels
    return this.isShowLabels
  }

  @Emit()
  emitMapStyle (style: MapboxStyle): MapboxStyle {
    return style
  }

  @Emit()
  emitMapGroundStyle (style: MapboxStyle): MapboxStyle {
    return style
  }

  @Emit()
  emitMapStatisticsStyle (style: MapboxStyle): MapboxStyle {
    return style
  }

  isShowLabels = true
}
