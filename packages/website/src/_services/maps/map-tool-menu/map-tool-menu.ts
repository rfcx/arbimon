import { Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

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
    return this.mapStyleId
  }

  isShowLabels = true
  mapStyleId = 'satellite-streets-v11'
  taxons = TAXONOMY_CLASSES
  taxon = this.taxons[0].name

  get mapOptions (): MapOptions[] {
    return [
      { id: 'satellite-streets-v11', name: 'Satellite' },
      { id: 'streets-v11', name: 'Streets' }
    ]
  }

  @Watch('taxon')
  onTaxononyChange (): void {
    this.emitTaxonomyValue()
  }

  @Watch('mapStyleId')
  onMapStyleChange (): void {
    this.emitMapStyle()
  }

  setMapStyle (id: string): void {
    this.mapStyleId = id
  }
}
