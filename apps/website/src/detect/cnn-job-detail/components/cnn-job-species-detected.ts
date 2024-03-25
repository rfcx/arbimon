import { kebabCase } from 'lodash-es'
import { Vue } from 'vue-class-component'
import { Inject, Prop, Watch } from 'vue-property-decorator'

import { routeNamesKey } from '@/globals'
import { type RouteNames } from '~/router'

interface Header {
  title: string
  key: SortableColumn
}

type SortableColumn = 'scientificName' | 'unvalidated' | 'present' | 'notPresent' | 'unknown'
type SortDirection = 1 | -1

export interface ClassificationsSummaryDataset {
  value: string
  title: string
  image: string | null
  unvalidated: number
  rejected: number
  uncertain: number
  confirmed: number
}

const SORT_ASC: SortDirection = 1
const SORT_DESC: SortDirection = -1

const SORTABLE_COLUMNS: Record<SortableColumn, { defaultDirection: SortDirection, sortFunction: (e1: ClassificationsSummaryDataset, e2: ClassificationsSummaryDataset) => number }> = {
  scientificName: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.title.localeCompare(e2.title)
  },
  unvalidated: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.unvalidated - e2.unvalidated
  },
  present: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.confirmed - e2.confirmed
  },
  notPresent: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.rejected - e2.rejected
  },
  unknown: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.uncertain - e2.uncertain
  }
}

export default class ActivityOverviewBySpecies extends Vue {
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames

  @Prop() datasets!: ClassificationsSummaryDataset[]
  @Prop({ default: false }) loading!: boolean

  sortColumn: SortableColumn = 'scientificName'
  sortDirection: SortDirection = SORTABLE_COLUMNS.scientificName.defaultDirection

  pageIndex = 1 // 1-based for humans

  get tableHeader (): Header[] {
    return [
      { title: 'Class', key: 'scientificName' },
      { title: 'Unvalidated', key: 'unvalidated' },
      { title: 'Present', key: 'present' },
      { title: 'Not Present', key: 'notPresent' },
      { title: 'Unknown', key: 'unknown' }
    ]
  }

  get hasTableData (): boolean {
    return this.datasets !== undefined
  }

  get maxPage (): number {
    return Math.ceil(this.datasets.length / this.pageSize)
  }

  get sortedTableData (): ClassificationsSummaryDataset[] {
    // Sort by user-chosen sort, then our default sort
    return this.datasets.sort((a, b) =>
      SORTABLE_COLUMNS[this.sortColumn].sortFunction(a, b) * this.sortDirection ||
      SORTABLE_COLUMNS.scientificName.sortFunction(a, b) * SORTABLE_COLUMNS.scientificName.defaultDirection
    )
  }

  get pageData (): ClassificationsSummaryDataset[] {
    if (this.datasets === undefined) return []
    const start = (this.pageIndex - 1) * this.pageSize
    return this.sortedTableData.slice(start, start + this.pageSize)
  }

  get pageSize (): number {
    if (this.datasets === undefined) return 0
    return 25
  }

  @Watch('datasets')
  onDataChange (): void {
    if (this.pageIndex > this.maxPage) this.pageIndex = 1
  }

  getSpeciesSlug (scientificName: string): string {
    return kebabCase(scientificName)
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
}
