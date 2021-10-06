import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Options, Vue } from 'vue-class-component'

import ComparisonListComponent from '@/components/comparison-list/comparison-list.vue'
import HorizontalBarChartComponent from '@/components/horizontal-bar-chart/horizontal-bar-chart.vue'
import SpeciesRichnessMaps from '@/components/species-richness-maps/species-richness-maps.vue'
import { ChartModels, SiteModels, SpeciesRichnessFilter } from '@/models'
import { SpeciesService } from '@/services'
import { FileUtils } from '@/utils'
import ExportButtonView from '@/views/export-button.vue'
import SpeciesRichnessTable from './components/species-richness-table/species-richness-table.vue'

dayjs.extend(utc)

@Options({
  components: {
    ComparisonListComponent,
    HorizontalBarChartComponent,
    SpeciesRichnessMaps,
    SpeciesRichnessTable,
    ExportButtonView
  }
})
export default class SpeciesRichnessPage extends Vue {
  sites: SiteModels.Site[] = []

  chartData: ChartModels.GroupedBarChartItem[] = []
  mapDatasets: ChartModels.MapDataSet[] = []
  tableData: ChartModels.TableData[] = []
  reportData: ReportData[] = []

  get hasReportData (): boolean {
    return this.reportData.length > 0
  }

  async onFilterChange (filters: SpeciesRichnessFilter[]): Promise<void> {
    const [chartData, mapDatasets, tableData, reportData] = await Promise.all([
      this.getBarChartDataset(filters),
      this.getMapDataset(filters),
      this.getTableData(filters),
      this.getReportData(filters)
    ])
    this.chartData = chartData
    this.mapDatasets = mapDatasets
    this.tableData = tableData
    this.reportData = reportData
  }

  async getBarChartDataset (filters: SpeciesRichnessFilter[]): Promise<ChartModels.GroupedBarChartItem[] > {
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

    return Object.values(groupedItems).sort((a, b) => a.group.localeCompare(b.group))
  }

  async getMapDataset (filters: SpeciesRichnessFilter[]): Promise<ChartModels.MapDataSet[]> {
    // TODO 41 - Merge this with the above once Nutto's branch is merged
    return filters.map(({ startDate, endDate, sites, color }) => ({
      color,
      data: SpeciesService.getSpeciesMapData({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), sites })
    }))
  }

  async getTableData (filters: SpeciesRichnessFilter[]): Promise<ChartModels.TableData[]> {
    const speciesItems = await Promise.all(filters.map(({ startDate, endDate, sites }) => SpeciesService.getSpeciesTableData({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), sites })))
    const speciesNames = speciesItems.flatMap(i => i.map(c => ({ speciesName: c.speciesName, className: c.className }))).filter((d, idx, arr) => arr.findIndex(obj => obj.speciesName === d.speciesName) === idx)
    const tableData: ChartModels.TableData[] = []
    speciesNames.forEach(({ speciesName, className }) => {
      const data: ChartModels.TableData = {
        speciesName,
        className,
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
    return tableData.map(({ speciesName, className, total, ...datasets }) => ({ speciesName, className, ...datasets, total })).sort((a, b) => b.total - a.total || (a.className + a.speciesName).localeCompare(b.className + b.speciesName))
  }

  async getReportData (filters: SpeciesRichnessFilter[]): Promise<ReportData[]> {
    const rawDetections = await Promise.all(filters.map(({ startDate, endDate, sites }) => SpeciesService.getDetections({ start: startDate.toISOString(), end: endDate.add(1, 'days').toISOString(), sites })))
    return rawDetections.flatMap(ds => {
      return ds.map(({ speciesName, siteName, latitude, longitude, date, hour }) => {
        const newDate = dayjs.utc(date)
        return {
          species: speciesName,
          site: siteName,
          latitude,
          longitude,
          day: newDate.format('D'),
          month: newDate.format('M'),
          year: newDate.format('YYYY'),
          date: newDate.format('M/DD/YYYY'),
          hour
        }
      })
    })
  }

  async exportCSVReport (): Promise<void> {
    const filename = 'report.csv'
    await FileUtils.exportCSVFile(filename, this.reportData, 'Species Report')
  }
}

export interface ReportData {
  species: string
  site: string
  latitude: number
  longitude: number
  day: string
  month: string
  year: string
  date: string
  hour: number
}
