import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import SpeciesRichnessMaps from '@/components/species-richness-maps/species-richness-maps.vue'
import { ChartModels, SiteModels, SpeciesRichnessFilter } from '@/models'
import { SpeciesService } from '@/services'
import SpeciesRichnessTable from './components/species-richness-table/species-richness-table.vue'

dayjs.extend(utc)

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent,
    SpeciesRichnessMaps,
    SpeciesRichnessTable
  }
})
export default class SpeciesRichnessPage extends Vue {
  sites: SiteModels.Site[] = []

  chartData: ChartModels.GroupedBarChartItem[] = []
  mapDatasets: ChartModels.MapDataSet[] = []
  tableData: ChartModels.TableData[] = []

  async onFilterChange (filters: SpeciesRichnessFilter[]): Promise<void> {
    await Promise.all([
      this.getBarChartDataset(filters),
      this.getMapDataset(filters),
      this.getTableData(filters)
    ])
  }

  async getBarChartDataset (filters: SpeciesRichnessFilter[]): Promise<void> {
    const groupedItems: { [key: string]: ChartModels.GroupedBarChartItem } = {}
    const chartItems = await Promise.all(filters.map(({ startDate, endDate, sites }) => {
      const start = startDate.toISOString()
      const end = endDate.add(1, 'days').toISOString()
      return SpeciesService.getMockupSpecies({ start, end, sites })
    }))

    const categories = new Set(chartItems.flatMap(i => i.map(c => c.category)))
    categories.forEach(cat => {
      for (const [idx, item] of chartItems.entries()) {
        const filter = filters[idx]
        const siteName = filter.sites.length > 0 ? filter.sites.map(s => s.name).join(',') : 'All sites'
        const matchedData = item.find(d => d.category === cat)
        const seriesItem: ChartModels.BarChartItem = {
          category: siteName,
          frequency: matchedData?.frequency ?? 0,
          color: filter.color
        }
        if (groupedItems[cat] !== undefined) {
          groupedItems[cat].series.unshift(seriesItem)
        } else {
          groupedItems[cat] = {
            group: cat,
            series: [seriesItem]
          }
        }
      }
    })

    this.chartData = Object.values(groupedItems).sort((a, b) => a.group.localeCompare(b.group))
  }

  async getMapDataset (filters: SpeciesRichnessFilter[]): Promise<void> {
    // TODO 41 - Merge this with the above once Nutto's branch is merged
    this.mapDatasets = filters.map(({ startDate, endDate, sites, color }) => ({
      color,
      data: SpeciesService.getSpeciesMapData({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), sites })
    }))
  }

  async getTableData (filters: SpeciesRichnessFilter[]): Promise<void> {
    const speciesItems = await Promise.all(filters.map(({ startDate, endDate, sites }) => SpeciesService.getSpeciesTableData({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), sites })))
    const speciesNames = speciesItems.flatMap(i => i.map(c => ({ speciesName: c.speciesName, speciesClassname: c.speciesClassname }))).filter((d, idx, arr) => arr.findIndex(obj => obj.speciesName === d.speciesName) === idx)
    const tableData: ChartModels.TableData[] = []
    speciesNames.forEach(({ speciesName, speciesClassname }) => {
      const data: ChartModels.TableData = {
        speciesName,
        speciesClassname,
        total: 0
      }
      for (const [idx, item] of speciesItems.entries()) {
        const datasetName = `Dataset ${idx + 1}`
        const matchedData = item.find(d => d.speciesName === speciesName)
        data[datasetName] = matchedData?.frequency ?? 0
        data.total = data.total + (matchedData?.frequency ?? 0)
      }
      tableData.push(data)
    })
    this.tableData = tableData.map(({ speciesName, speciesClassname, total, ...datasets }) => ({ speciesName, speciesClassname, ...datasets, total })).sort((a, b) => b.total - a.total || (a.speciesClassname + a.speciesName).localeCompare(b.speciesClassname + b.speciesName))
  }
}
