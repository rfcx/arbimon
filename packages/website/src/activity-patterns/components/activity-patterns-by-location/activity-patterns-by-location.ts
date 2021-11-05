import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { generateDetectionHtmlPopup } from '@/activity-patterns/components/activity-patterns-by-location/functions'
import { ACTIVITY_PATTERN_KEYS } from '@/activity-patterns/functions'
import { TAXONOMY_CLASSES } from '~/api/taxonomy-service'
import { getExportFilterName } from '~/dataset-filters/functions'
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '~/maps'
import { MapBubbleComponent, MapDataSet } from '~/maps/map-bubble'
import { MapToolMenuComponent } from '~/maps/map-tool-menu'
import { MapConfig } from '~/maps/types'

interface MapOptions {
  id: string
  name: string
}

interface DatasetType {
  label: string
  value: string
}

const DEFAULT_PREFIX = 'Patterns-By-Site'

@Options({
  components: {
    MapBubbleComponent,
    MapToolMenuComponent
  }
})
export default class ActivityPatternsByLocation extends Vue {
  @Prop({ default: [] }) public datasets!: MapDataSet[]

  selectedType = ACTIVITY_PATTERN_KEYS.detectionFrequency
  datasetTypes: DatasetType[] = [
    { label: 'Detection', value: ACTIVITY_PATTERN_KEYS.detection },
    { label: 'Detection frequency', value: ACTIVITY_PATTERN_KEYS.detectionFrequency }
  ]

  taxons = TAXONOMY_CLASSES
  taxon = this.taxons[0].name
  isShowLabels = true
  mapStyleId = 'satellite-streets-v11'
  getPopupHtml = generateDetectionHtmlPopup

  config: MapConfig = {
    sourceMapId: '',
    center: [DEFAULT_LONGITUDE, DEFAULT_LATITUDE],
    zoom: 9
  }

  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      case 2: case 4: return 2
      default: return 3
    }
  }

  get mapOptions (): MapOptions[] {
    return [
      { id: 'satellite-streets-v11', name: 'Satellite' },
      { id: 'streets-v11', name: 'Streets' }
    ]
  }

  get mapStyle (): string {
    return `mapbox://styles/mapbox/${this.mapStyleId}`
  }

  setMapStyle (id: string): void {
    this.mapStyleId = id
  }

  setShowLabelsToggle (isShowLabels: boolean): void {
    this.isShowLabels = isShowLabels
  }

  mapMoved (config: MapConfig): void {
    this.config = config
  }

  mapExportName (dataset: MapDataSet): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, DEFAULT_PREFIX, undefined, sites)
  }
}
