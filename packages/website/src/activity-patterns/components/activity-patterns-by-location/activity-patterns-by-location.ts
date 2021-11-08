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

  selectedDetectionType = ACTIVITY_PATTERN_KEYS.detectionFrequency
  occupancyType = ACTIVITY_PATTERN_KEYS.occupancy
  datasetTypes: DatasetType[] = [
    { label: 'Detection', value: ACTIVITY_PATTERN_KEYS.detection },
    { label: 'Detection frequency', value: ACTIVITY_PATTERN_KEYS.detectionFrequency }
  ]

  taxons = TAXONOMY_CLASSES
  taxon = this.taxons[0].name
  isShowLabels = true
  mapStyle = 'mapbox://styles/mapbox/satellite-streets-v11'
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

  setMapStyle (style: string): void {
    this.mapStyle = style
  }

  setShowLabelsToggle (isShowLabels: boolean): void {
    this.isShowLabels = isShowLabels
  }

  mapMoved (config: MapConfig): void {
    this.config = config
  }

  mapExportName (dataset: MapDataSet, type: string): string {
    const { startDate, endDate, sites } = dataset
    return getExportFilterName(startDate, endDate, `${DEFAULT_PREFIX}-${type}`, undefined, sites)
  }
}
