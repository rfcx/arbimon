import { Dayjs } from 'dayjs'
import { Options, Vue } from 'vue-class-component'

import { GroupedBarChartItem, HorizontalBarChartComponent } from '@/_components/charts/horizontal-bar-chart'
import { MapDataSet } from '@/_components/charts/map-bubble'
import { ColoredFilter, Filter } from '@/_components/datasets'
import { ComparisonListComponent } from '@/_components/datasets/comparison-list'
import { Site, Species } from '@/_services/api'
import { getSpeciesRichnessData, SpeciesRichnessData, TimeBucket } from '@/_services/api/species-richness-service'
import { getFilterExportGroupName } from '@/_services/utils/filter'
import SpeciesRichnessByLocation from './components/species-richness-by-location/species-richness-by-location.vue'
import SpeciesRichnessByTime from './components/species-richness-by-time/species-richness-by-time.vue'
import SpeciesRichnessDetectedSpecies from './components/species-richness-detected-species/species-richness-detected-species.vue'
import { DetectedSpeciesItem } from './components/species-richness-detected-species/Table'
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
  sites: Site[] = []

  colors: string[] = []
  filters: Filter[] = []
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
      filters.map(async ({ startDate, endDate, sites, color }) => {
        const start = startDate.toISOString()
        const end = endDate.add(1, 'days').toISOString()
        const data = await getSpeciesRichnessData({ start, end, sites })
        return { startDate, endDate, sites, color, data }
      })
    )

    this.filters = filters
    this.colors = datasets.map(ds => ds.color)
    this.detectionCounts = datasets.map(ds => ds.data.detectionCount)
    this.chartExportName = getFilterExportGroupName(filters, DEFAULT_CHART_PREFIX).name
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
    return datasets.map(({ color, data, ...filter }) => ({ color, data: data.speciesBySite, ...filter }))
  }

  getTableData (datasets: ColoredDataset[]): DetectedSpeciesItem[] {
    const speciesPresences = datasets.map(ds => ds.data.speciesPresence)
    const allSpecies: { [speciesId: string]: Species } = Object.assign({}, ...speciesPresences)

    return Object.entries(allSpecies)
      .map(([key, value]) => ({
        ...value,
        data: speciesPresences.map(sp => key in sp),
        total: speciesPresences.filter(sp => key in sp).length
      }))
      .sort((a, b) => b.total - a.total || a.speciesName.localeCompare(b.speciesName))
  }
}
