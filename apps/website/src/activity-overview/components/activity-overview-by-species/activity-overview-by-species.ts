import { kebabCase } from 'lodash-es'
import numeral from 'numeral'
import { Vue } from 'vue-class-component'
import { Inject, Prop, Watch } from 'vue-property-decorator'

import { routeNamesKey } from '@/globals'
import { RouteNames } from '~/router'
import { ActivityOverviewDataBySpecies } from '../../types'
import { ActivityOverviewBySpeciesDataset, getFormatSpeciesDataset } from './functions'

interface Header {
  title: string
  key: SortableColumn
}

export interface SpeciesDataset {
  color: string
  data: ActivityOverviewDataBySpecies[]
}

type SortableColumn = 'scientificName'| 'taxon' | SortableDetail
type SortableDetail = 'detectionCount' | 'detectionFrequency' | 'occupiedSites' | 'occupancyNaive'
type SortDirection = 1 | -1

const SORT_ASC: SortDirection = 1
const SORT_DESC: SortDirection = -1
const SORTABLE_COLUMNS: Record<SortableColumn, { defaultDirection: SortDirection, sortFunction: (e1: ActivityOverviewBySpeciesDataset, e2: ActivityOverviewBySpeciesDataset) => number }> = {
  scientificName: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.scientificName.localeCompare(e2.scientificName)
  },
  taxon: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.taxon.localeCompare(e2.taxon) || e1.scientificName.localeCompare(e2.scientificName)
  },
  detectionCount: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => {
      const details1 = Math.max(...e1.details.map(({ detectionCount }) => detectionCount))
      const details2 = Math.max(...e2.details.map(({ detectionCount }) => detectionCount))
      return details2 - details1 || e1.scientificName.localeCompare(e2.scientificName)
    }
  },
  detectionFrequency: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => {
      const details1 = Math.max(...e1.details.map(({ detectionFrequency }) => detectionFrequency))
      const details2 = Math.max(...e2.details.map(({ detectionFrequency }) => detectionFrequency))
      return details2 - details1 || e1.scientificName.localeCompare(e2.scientificName)
    }
  },
  occupiedSites: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => {
      const details1 = Math.max(...e1.details.map(({ occupiedSites }) => occupiedSites))
      const details2 = Math.max(...e2.details.map(({ occupiedSites }) => occupiedSites))
      return details2 - details1 || e1.scientificName.localeCompare(e2.scientificName)
    }
  },
  occupancyNaive: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => {
      const details1 = Math.max(...e1.details.map(({ occupancyNaive }) => occupancyNaive))
      const details2 = Math.max(...e2.details.map(({ occupancyNaive }) => occupancyNaive))
      return details2 - details1 || e1.scientificName.localeCompare(e2.scientificName)
    }
  }
}

export default class ActivityOverviewBySpecies extends Vue {
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames

  @Prop() datasets!: SpeciesDataset[]
  @Prop({ default: true }) isLocationRedacted!: boolean

  pageIndex = 1 // 1-based for humans
  sortColumn: SortableColumn = 'scientificName'
  sortDetail: SortableDetail = 'detectionCount'
  sortDirection: SortDirection = SORTABLE_COLUMNS.scientificName.defaultDirection
  formattedDatasets: ActivityOverviewBySpeciesDataset[] = []

  get tableHeader (): Header[] {
    return [
      { title: 'Species name', key: 'scientificName' },
      { title: 'Class', key: 'taxon' },
      { title: 'Detection', key: 'detectionCount' },
      { title: 'Detection frequency', key: 'detectionFrequency' },
      { title: 'Occupied sites', key: 'occupiedSites' },
      { title: 'Naive Occupancy', key: 'occupancyNaive' }
    ]
  }

  get hasTableData (): boolean {
    return this.datasets.length > 0 && this.datasets.some(dataset => dataset.data.length > 0)
  }

  get hasMoreThanOneDatasets (): boolean {
    return this.datasets.length > 1
  }

  get maxPage (): number {
    return Math.ceil(this.formattedDatasets.length / this.pageSize)
  }

  /**
   * Sort by user choice then our default
   */
  get sortedDatasets (): ActivityOverviewBySpeciesDataset[] {
    const sortedDatasets = this.formattedDatasets.sort((a, b) => SORTABLE_COLUMNS[this.sortColumn].sortFunction(a, b) * this.sortDirection)
    if (this.sortColumn === this.sortDetail) {
      sortedDatasets.map(({ details, ...ds }) => ({ ...ds, details: details.sort((a, b) => ((b[this.sortDetail] - a[this.sortDetail]) || b.datasetIdx - a.datasetIdx) * this.sortDirection) }))
    }
    return sortedDatasets
  }

  get pageData (): ActivityOverviewBySpeciesDataset[] {
    const start = (this.pageIndex - 1) * this.pageSize
    return this.sortedDatasets.slice(start, start + this.pageSize)
  }

  get pageSize (): number {
    const numberOfDatasets = this.datasets.length
    switch (numberOfDatasets) {
      case 2:
      case 3:
        return 5
      case 4:
      case 5:
        return 3
      default: return 10
    }
  }

  get blankRows (): number {
    return (this.pageSize - this.pageData.length) * this.pageData[0].details.length
  }

  get totalSpecies (): number {
    return Math.max(0, this.formattedDatasets.length)
  }

  @Watch('datasets')
  onDataChange (): void {
    if (this.pageIndex > this.maxPage) this.pageIndex = 1
    this.formattedDatasets = getFormatSpeciesDataset(this.datasets)
  }

  getSpeciesSlug (scientificName: string): string {
    return kebabCase(scientificName)
  }

  getFormattedNumber (value: number): string {
    return numeral(value).format('0,0')
  }

  getThreeDecimalNumber (value: number): string {
    return value.toFixed(3)
  }

  previousPage (): void {
    this.setPage(this.pageIndex - 1)
  }

  nextPage (): void {
    this.setPage(this.pageIndex + 1)
  }

  setPage (page: number): void {
    // Wrap-around
    let newPage = page
    if (page < 1) newPage = this.maxPage
    if (page > this.maxPage) newPage = 1

    this.pageIndex = newPage
  }

  sort (column?: SortableColumn): void {
    if (!column) return

    if (this.sortColumn === column) {
      // Change direction
      this.sortDirection = this.sortDirection === SORT_ASC
        ? SORT_DESC
        : SORT_ASC
    } else {
      // Change column
      this.sortColumn = column
      this.sortDirection = SORTABLE_COLUMNS[column].defaultDirection
    }

    if (column !== 'scientificName' && column !== 'taxon') {
      this.sortDetail = column
    }
  }

  blur (event: Event): void {
    (event.target as HTMLInputElement).blur()
  }
}
