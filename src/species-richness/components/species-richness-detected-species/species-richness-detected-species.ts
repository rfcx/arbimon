import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { firstDiffDigit } from '@/_services/utils/number'
import { DetectedSpeciesItem } from './types'

interface Header {
  title: string
  color: string
}

const HEADER_COLOR = '#ffffff80'

export default class SpeciesRichnessDetectedSpecies extends Vue {
  @Prop() tableData!: DetectedSpeciesItem[]
  @Prop() colors!: string[]

  currentPage = 1 // 1-based for humans
  pageSize = 10

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

  get pageData (): DetectedSpeciesItem[] {
    const start = (this.currentPage - 1) * this.pageSize
    return this.tableData.slice(start, start + this.pageSize)
  }

  get tableHeader (): Header[] {
    return [
      { title: 'Species', color: HEADER_COLOR },
      { title: 'Class', color: HEADER_COLOR },
      ...((this.hasMoreThanOneDataset)
        ? [...Array.from({ length: this.datasetCount }, (v, i) => ({ title: `Dataset ${i + 1}`, color: this.colors[i] })), { title: 'Total', color: HEADER_COLOR }]
        : []
      )
    ]
  }

  @Watch('tableData')
  onDataChange (): void {
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
}
