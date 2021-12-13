import { Dayjs } from 'dayjs'
import { Options, Vue } from 'vue-class-component'

import { Site } from '@rfcx-bio/common/api-bio-types/sites'
import { SpeciesLight } from '@rfcx-bio/common/api-bio-types/species'

import { getSpeciesRichnessData, SpeciesRichnessData, TimeBucket } from '~/api/species-richness-service'
import { TAXONOMY_CLASS_ALL, TAXONOMY_CLASSES } from '~/api/taxonomy-service'
import { GroupedBarChartItem, HorizontalBarChartComponent } from '~/charts/horizontal-bar-chart'
import { ColoredFilter, ComparisonFilter, ComparisonListComponent, filterToDataset, getExportGroupName } from '~/filters'
import { MapDataSet } from '~/maps/map-bubble'
import SpeciesRichnessByLocation from './components/species-richness-by-location/species-richness-by-location.vue'
import SpeciesRichnessByTime from './components/species-richness-by-time/species-richness-by-time.vue'
import SpeciesRichnessDetectedSpecies from './components/species-richness-detected-species/species-richness-detected-species.vue'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/types'
import SpeciesRichnessIntroduction from './components/species-richness-introduction/species-richness-introduction.vue'

interface ColoredDataset {color: string, data: SpeciesRichnessData, startDate: Dayjs, endDate: Dayjs, sites: Site[]}

const DEFAULT_CHART_PREFIX = 'Species-By-Taxonomy'

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent,
    SpeciesRichnessByLocation,
    SpeciesRichnessByTime,
    SpeciesRichnessDetectedSpecies,
    SpeciesRichnessIntroduction
  }
})
export default class SpeciesRichnessPage extends Vue {
  colors: string[] = [] // TODO 150 - Replace this with Pinia colors
  filters: ComparisonFilter[] = []
  detectionCounts: number[] = []
  chartData: GroupedBarChartItem[] = []
  chartExportName = ''
  mapDatasets: MapDataSet[] = []
  speciesByTimeDatasets: Array<{color: string, data: Record<TimeBucket, Record<number, number>>}> = []
  tableData: DetectedSpeciesItem[] = []

  get haveData (): boolean {
    return this.detectionCounts.length > 0 && this.detectionCounts.some(count => count > 0)
  }

  async onFilterChange (filters: ColoredFilter[]): Promise<void> {
    // TODO 117 - Only update the changed dataset
    const datasets = await Promise.all(
      filters.map(async (filter) => {
        const { startDate, endDate, sites, color } = filter
        const data = await getSpeciesRichnessData(filterToDataset(filter))
        return { startDate, endDate, sites, color, data }
      })
    )

    this.filters = filters
    this.colors = datasets.map(ds => ds.color)
    this.detectionCounts = datasets.map(ds => ds.data.detectionCount)
    this.chartExportName = getExportGroupName(DEFAULT_CHART_PREFIX)
    this.chartData = this.getBarChartDataset(datasets)
    this.mapDatasets = this.getMapDataset(datasets)
    this.speciesByTimeDatasets = datasets.map(({ color, data }) => ({ color, data: data.speciesByTime }))
    this.tableData = this.getTableData(datasets)
  }

  getBarChartDataset (datasets: ColoredDataset[]): GroupedBarChartItem[] {
    return [...new Set(datasets.flatMap(ds => Object.keys(ds.data.speciesByTaxon)))]
      .map(group => ({
        group,
        series: datasets.map(ds => ({
          category: '', // TODO - Maybe add the dataset name here
          frequency: ds.data.speciesByTaxon[group] ?? 0,
          color: ds.color
        }))
      }))
      .sort((a, b) => a.group.localeCompare(b.group))
  }

  getMapDataset (datasets: ColoredDataset[]): MapDataSet[] {
    const intermediate = datasets.map(({ color, data: srData, ...filter }) => {
      const data = srData.speciesBySite.map(s => ({
        ...s,
        distinctSpecies: {
          ...s.distinctSpecies,
          [TAXONOMY_CLASS_ALL.name]: Object.values(s.distinctSpecies).reduce((sum, val) => (sum as number) + (val as number), 0)
        }
      }))
      return { color, data, ...filter, maxValues: {} }
    })
    // TODO 209 - Do this natively in the API instead of after the fact
    const maxAll = Math.max(...intermediate.map(ds => Math.max(...ds.data.map(d => d.distinctSpecies[TAXONOMY_CLASS_ALL.name] as number))))
    return intermediate.map(ds => ({
      ...ds,
      maxValues: Object.fromEntries([...TAXONOMY_CLASSES, TAXONOMY_CLASS_ALL].map(c => [c.name, maxAll]))
    }))
  }

  getTableData (datasets: ColoredDataset[]): DetectedSpeciesItem[] {
    const speciesPresences = datasets.map(ds => ds.data.speciesPresence)
    const allSpecies: { [speciesId: string]: SpeciesLight } = Object.assign({}, ...speciesPresences)

    return Object.entries(allSpecies)
      .map(([key, value]) => ({
        ...value,
        data: speciesPresences.map(sp => key in sp),
        total: speciesPresences.filter(sp => key in sp).length
      }))
      .sort((a, b) => b.total - a.total || a.scientificName.localeCompare(b.scientificName))
  }
}
