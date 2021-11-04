import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { firstDiffDigit } from '@rfcx-bio/utils/number'

import { DetectedSpeciesItem } from './types'

type SortableColumn = Extract<keyof DetectedSpeciesItem, 'speciesName' | 'className' | 'total'>
type SortDirection = 1 | -1

interface Header {
  title: string
  color: string
  key?: SortableColumn
}

const SORT_ASC: SortDirection = 1
const SORT_DESC: SortDirection = -1
const SORTABLE_COLUMNS: Record<SortableColumn, { defaultDirection: SortDirection, sortFunction: (e1: DetectedSpeciesItem, e2: DetectedSpeciesItem) => number }> = {
  speciesName: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.speciesName.localeCompare(e2.speciesName)
  },
  className: {
    defaultDirection: SORT_ASC,
    sortFunction: (e1, e2) => e1.className.localeCompare(e2.className)
  },
  total: {
    defaultDirection: SORT_DESC,
    sortFunction: (e1, e2) => e1.total - e2.total
  }
}

const HEADER_COLOR = '#ffffff80'

export default class SpeciesRichnessDetectedSpecies extends Vue {
  @Prop() tableData!: DetectedSpeciesItem[]
  @Prop() colors!: string[]

  pageIndex = 1 // 1-based for humans
  pageSize = 10
  sortColumn: SortableColumn = 'total'
  sortDirection: SortDirection = SORTABLE_COLUMNS.total.defaultDirection

  get hasTableData (): boolean {
    return this.tableData.length > 0
  }

  get hasMoreThanOneDataset (): boolean {
    return this.datasetCount > 1
  }

  get datasetCount (): number {
    return this.tableData.length > 0 ? this.tableData[0].data.length : 0
  }

  get maxPage (): number {
    return Math.ceil(this.tableData.length / this.pageSize)
  }

  get sortedTableData (): DetectedSpeciesItem[] {
    // Sort by user choice then our default
    return this.tableData.sort((a, b) =>
      SORTABLE_COLUMNS[this.sortColumn].sortFunction(a, b) * this.sortDirection ||
      SORTABLE_COLUMNS.total.sortFunction(a, b) * SORTABLE_COLUMNS.total.defaultDirection ||
      SORTABLE_COLUMNS.speciesName.sortFunction(a, b) * SORTABLE_COLUMNS.speciesName.defaultDirection
    )
  }

  get pageData (): DetectedSpeciesItem[] {
    const start = (this.pageIndex - 1) * this.pageSize
    return this.sortedTableData.slice(start, start + this.pageSize)
  }

  get tableHeader (): Header[] {
    const keyTotal: SortableColumn = 'total'
    return [
      { title: 'Species', color: HEADER_COLOR, key: 'speciesName' },
      { title: 'Class', color: HEADER_COLOR, key: 'className' },
      ...((this.hasMoreThanOneDataset)
        ? [...Array.from({ length: this.datasetCount }, (_v, i) => ({ title: `Dataset ${i + 1}`, color: this.colors[i] ?? '#FFFFFF' })), { title: 'Total', color: HEADER_COLOR, key: keyTotal }]
        : []
      )
    ]
  }

  @Watch('tableData')
  onDataChange (): void {
    if (this.pageIndex > this.maxPage) this.pageIndex = 1
  }

  @Watch('currentPage')
  onCurrentPageChange (newVal: number, oldVal: number): void {
    if (newVal < 1) this.pageIndex = 1
    if (newVal > this.maxPage) {
      // Try to preserve the last digit that was entered
      const newDigit = firstDiffDigit(newVal, oldVal)
      this.pageIndex = (!isNaN(newDigit) && newDigit >= 1 && newDigit <= this.maxPage)
        ? newDigit
        : this.maxPage
    }
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
