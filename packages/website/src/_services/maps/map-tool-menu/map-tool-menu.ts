import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, MAPBOX_STYLE_SATELLITE_STREETS, MapboxStyle } from '~/maps'
import { TAXONOMY_CLASSES } from '../../api/taxonomy-service'

interface MapOptions {
  style: MapboxStyle
  name: string
}

export default class MapToolMenuComponent extends Vue {
  @Prop({ default: false }) displayTaxonomies!: boolean
  @Prop() mapStyle!: MapboxStyle

  @Emit() @Watch('taxon')
  emitTaxonomyValue (): string {
    return this.taxon
  }

  @Emit()
  emitShowLabelsToggle (): boolean {
    this.isShowLabels = !this.isShowLabels
    return this.isShowLabels
  }

  @Emit()
  emitMapStyle (style: MapboxStyle): MapboxStyle {
    return style
  }

  taxons = TAXONOMY_CLASSES
  taxon = this.taxons[0].name
  isShowLabels = true
  mapStyleOptions: MapOptions[] = [
    { style: MAPBOX_STYLE_SATELLITE_STREETS, name: 'Satellite' },
    { style: MAPBOX_STYLE_RFCX_WITH_PLACE_LABELS, name: 'Simple' }
  ]
}
