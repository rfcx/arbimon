import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { firstDiffDigit } from '@/_services/utils/number'
import { DetectedSpeciesItem } from './Table'

interface Header {
  title: string
  color: string
  key?: string
}

const HEADER_COLOR = '#ffffff80'
const PAGE_SIZE = 10
const SORTABLE_COLUMNS = { speciesName: 'speciesName', className: 'className' }

export default class SpeciesRichnessDetectedSpecies extends Vue {
  @Prop() tableData!: DetectedSpeciesItem[]
  @Prop() colors!: string[]

  tableDatum: DetectedSpeciesItem[] = []
  currentPage = 1 // 1-based for humans
  currentSortedColumn = SORTABLE_COLUMNS.speciesName
  order = 'asc'

  get hasTableData (): boolean {
    return this.tableDatum.length > 0
  }

  get hasMoreThanOneDataset (): boolean {
    return this.datasetCount > 1
  }

  get datasetCount (): number {
    return this.tableDatum.length > 0 ? this.tableDatum[0].data.length : 0
  }

  get maxPage (): number {
    return Math.ceil(this.tableDatum.length / PAGE_SIZE)
  }

  get pageData (): DetectedSpeciesItem[] {
    const start = (this.currentPage - 1) * PAGE_SIZE
    return this.tableDatum.slice(start, start + PAGE_SIZE)
  }

  get tableHeader (): Header[] {
    return [
      { title: 'Species', color: HEADER_COLOR, key: SORTABLE_COLUMNS.speciesName },
      { title: 'Class', color: HEADER_COLOR, key: SORTABLE_COLUMNS.className },
      ...((this.hasMoreThanOneDataset)
        ? [...Array.from({ length: this.datasetCount }, (v, i) => ({ title: `Dataset ${i + 1}`, color: this.colors[i] })), { title: 'Total', color: HEADER_COLOR }]
        : []
      )
    ]
  }

  @Watch('tableData')
  onDataChange (): void {
    this.tableDatum = [...this.tableData]
    if (this.currentPage > this.maxPage) this.currentPage = 1
  }

  @Watch('currentPage')
  onCurrentPageChange (newVal: number, oldVal: number): void {
    if (newVal < 1) this.currentPage = 1
    if (newVal > this.maxPage) {
      // Try to preserve the last digit that was entered
      const newDigit = firstDiffDigit(newVal, oldVal)
      this.currentPage = (!isNaN(newDigit) && newDigit >= 1 && newDigit <= this.maxPage)
        ? newDigit
        : this.maxPage
    }
  }

  previousPage (): void {
    this.setPage(this.currentPage - 1)
  }

  nextPage (): void {
    this.setPage(this.currentPage + 1)
  }

  setPage (page: number): void {
    // Wrap-around
    let newPage = page
    if (page < 1) newPage = this.maxPage
    if (page > this.maxPage) newPage = 1

    this.currentPage = newPage
  }

  blur (event: Event): void {
    (event.target as HTMLInputElement).blur()
  }

  sorting (column: string): void {
    const tableData = [...this.tableDatum]
    if (this.currentSortedColumn !== column) {
      this.currentSortedColumn = column
      this.order = 'asc'
      this.tableDatum = tableData.sort((a, b) => a[column as 'speciesName' | 'className'].localeCompare(b[column as 'speciesName' | 'className']))
    } else {
      this.order = this.order === 'asc' ? 'desc' : 'asc'
      this.tableDatum.reverse()
    }
  }
}
