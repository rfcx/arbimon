import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import SpeciesRichnessMaps from '@/components/species-richness-maps/species-richness-maps.vue'
import { ChartModels, SiteModels, SpeciesRichnessFilter, TaxonomyModels } from '@/models'
import { SpeciesService } from '@/services'
import { Period, SpeciesRichnessData } from '@/services/species-service'
import ExportButtonView from '@/views/export-button.vue'
import SpeciesRichnessByTime from './components/species-richness-by-time/species-richness-by-time.vue'
import SpeciesRichnessIntroduction from './components/species-richness-introduction/species-richness-introduction.vue'
import SpeciesRichnessTable from './components/species-richness-table/species-richness-table.vue'

interface ColoredDataset {color: string, data: SpeciesRichnessData}

@Options({
  components: {
    ComparisonListComponent,
    ExportButtonView,
    HorizontalBarChartComponent,
    SpeciesRichnessByTime,
    SpeciesRichnessIntroduction,
    SpeciesRichnessMaps,
    SpeciesRichnessTable
  }
})
export default class SpeciesRichnessPage extends Vue {
  sites: SiteModels.Site[] = []

  colors: string[] = []
  filters: SpeciesRichnessFilter[] = []
  detectionCounts: number[] = []
  chartData: ChartModels.GroupedBarChartItem[] = []
  mapDatasets: ChartModels.MapDataSet[] = []
  speciesByTimeDatasets: Array<{color: string, data: Record<Period, Record<number, number>>}> = []
  tableData: ChartModels.TableData[] = []

  get haveData (): boolean {
    return this.detectionCounts.length > 0 &&
    this.detectionCounts.some(count => count > 0)
  }

  async onFilterChange (filters: SpeciesRichnessFilter[]): Promise<void> {
    // TODO 117 - Only update the changed dataset
    const datasets = await Promise.all(
      filters.map(async ({ startDate, endDate, sites, color }) => {
        const start = startDate.toISOString()
        const end = endDate.add(1, 'days').toISOString()
        const data = await SpeciesService.getSpeciesRichnessData({ start, end, sites })
        return { color, data }
      })
    )

    this.filters = filters
    this.colors = datasets.map(ds => ds.color)
    this.detectionCounts = datasets.map(ds => ds.data.detectionCount)
    this.chartData = this.getBarChartDataset(datasets)
    this.mapDatasets = this.getMapDataset(datasets)
    this.speciesByTimeDatasets = datasets.map(({ color, data }) => ({ color, data: data.speciesByTime }))
    this.tableData = this.getTableData(datasets)
  }

  getBarChartDataset (datasets: ColoredDataset[]): ChartModels.GroupedBarChartItem[] {
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

  getMapDataset (datasets: ColoredDataset[]): ChartModels.MapDataSet[] {
    return datasets.map(({ color, data }) => ({ color, data: data.speciesBySite }))
  }

  getTableData (datasets: ColoredDataset[]): ChartModels.TableData[] {
    const speciesPresences = datasets.map(ds => ds.data.speciesPresence)
    const allSpecies: { [speciesId: string]: TaxonomyModels.Species } = Object.assign({}, ...speciesPresences)

    return Object.entries(allSpecies)
      .map(([key, value]) => ({
        className: value.className,
        speciesName: value.speciesName,
        data: speciesPresences.map(sp => key in sp),
        total: speciesPresences.filter(sp => key in sp).length
      }))
      .sort((a, b) => b.total - a.total || a.speciesName.localeCompare(b.speciesName))
  }
}
