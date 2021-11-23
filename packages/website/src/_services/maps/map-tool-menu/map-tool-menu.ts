import { Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'

interface MapOptions {
  style: MapboxStyle
  name: string
}

export default class MapToolMenuComponent extends Vue {
  @Prop() mapStyle!: MapboxStyle

  @Emit()
  emitShowLabelsToggle (): boolean {
    this.isShowLabels = !this.isShowLabels
    return this.isShowLabels
  }

  @Emit()
  emitMapStyle (style: MapboxStyle): MapboxStyle {
    return style
  }

  isShowLabels = true
  mapStyleOptions: MapOptions[] = [
    { style: MAPBOX_STYLE_SATELLITE_STREETS, name: 'Satellite' },
    { style: MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, name: 'Simple' }
  ]
}
