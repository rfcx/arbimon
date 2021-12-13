import { kebabCase } from 'lodash-es'
import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { ActivityOverviewDataBySpecies } from '~/api/activity-overview-service'

interface Header {
  title: string
  key: SortableColumn
}

type SortableColumn = Extract<keyof ActivityOverviewDataBySpecies, 'scientificName' | 'taxon' | 'detectionCount' | 'detectionFrequency' | 'occupiedSites' | 'occupancyNaive'>
type SortDirection = 1 | -1

const SORT_ASC: SortDirection = 1
const SORT_DESC: SortDirection = -1
const SORTABLE_COLUMNS: Record<SortableColumn, { defaultDirection: SortDirection, sortFunction: (e1: ActivityOverviewDataBySpecies, e2: ActivityOverviewDataBySpecies) => number }> = {
  scientificName: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.scientificName.localeCompare(e2.scientificName)
  },
  taxon: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.taxon.localeCompare(e2.taxon)
  },
  detectionCount: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.detectionCount - e2.detectionCount
  },
  detectionFrequency: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.detectionFrequency - e2.detectionFrequency
  },
  occupiedSites: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.occupiedSites - e2.occupiedSites
  },
  occupancyNaive: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.occupancyNaive - e2.occupancyNaive
  }
}

export default class ActivityOverviewBySpecies extends Vue {
  @Prop() tableData!: ActivityOverviewDataBySpecies[]

  pageIndex = 1 // 1-based for humans
  pageSize = 10
  sortColumn: SortableColumn = 'detectionCount'
  sortDirection: SortDirection = SORTABLE_COLUMNS.detectionCount.defaultDirection

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
    return this.tableData.length > 0
  }

  get maxPage (): number {
    return Math.ceil(this.tableData.length / this.pageSize)
  }

  get sortedTableData (): ActivityOverviewDataBySpecies[] {
    // Sort by user choice then our default
    return this.tableData.sort((a, b) =>
      SORTABLE_COLUMNS[this.sortColumn].sortFunction(a, b) * this.sortDirection
    )
  }

  get pageData (): ActivityOverviewDataBySpecies[] {
    const start = (this.pageIndex - 1) * this.pageSize
    return this.sortedTableData.slice(start, start + this.pageSize)
  }

  @Watch('tableData')
  onDataChange (): void {
    if (this.pageIndex > this.maxPage) this.pageIndex = 1
  }

  getSpeciesSlug (scientificName: string): string {
    return kebabCase(scientificName)
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
  }

  blur (event: Event): void {
    (event.target as HTMLInputElement).blur()
  }
}
