import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { MAPBOX_STYLE_WITH_PLACE_LABELS } from '~/maps'
import { TAXONOMY_CLASSES } from '../../api/taxonomy-service'

interface MapOptions {
  id: string
  name: string
}

export default class MapToolMenuComponent extends Vue {
  @Prop({ default: false }) displayTaxonomies!: boolean

  @Emit()
  emitTaxonomyValue (): string {
    return this.taxon
  }

  @Emit()
  emitShowLabelsToggle (): boolean {
    this.isShowLabels = !this.isShowLabels
    return this.isShowLabels
  }

  @Emit()
  emitMapStyle (): string {
    return this.mapStyle
  }

  isShowLabels = true
  mapStyle = 'mapbox://styles/mapbox/satellite-streets-v11'
  taxons = TAXONOMY_CLASSES
  taxon = this.taxons[0].name

  get mapOptions (): MapOptions[] {
    return [
      { id: 'mapbox://styles/mapbox/satellite-streets-v11', name: 'Satellite' },
      { id: MAPBOX_STYLE_WITH_PLACE_LABELS, name: 'Simple' }
    ]
  }

  @Watch('taxon')
  onTaxononyChange (): void {
    this.emitTaxonomyValue()
  }

  @Watch('mapStyle')
  onMapStyleChange (): void {
    this.emitMapStyle()
  }

  setMapStyle (id: string): void {
    this.mapStyle = id
  }
}
