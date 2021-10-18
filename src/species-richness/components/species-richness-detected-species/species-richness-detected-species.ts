import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { DetectedSpeciesItem } from './Table'

interface Header {
  title: string
  color: string
}

const HEADER_COLOR = '#ffffff80'
const PAGE_SIZE = 10

export default class SpeciesRichnessDetectedSpecies extends Vue {
  @Prop() tableData!: DetectedSpeciesItem[]
  @Prop() colors!: string[]

  pageIndex = 0
  currentPage = 0

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

  get hasTableData (): boolean {
    return this.dataLength > 0
  }

  get hasMoreThanOneDataset (): boolean {
    return this.datasetCount > 1
  }

  get datasetCount (): number {
    return this.dataLength > 0 ? this.tableData[0].data.length : 0
  }

  get maxPage (): number {
    return Math.ceil(this.dataLength / PAGE_SIZE)
  }

  get dataLength (): number {
    return this.tableData.length
  }

  get page (): DetectedSpeciesItem[] {
    const start = this.pageIndex * PAGE_SIZE
    const end = start + PAGE_SIZE > this.dataLength ? this.dataLength : start + PAGE_SIZE
    return this.dataLength < PAGE_SIZE ? this.tableData : this.tableData.slice(start, end)
  }

  get currentRecord (): number {
    return this.dataLength === 0 ? 0 : (this.pageIndex * PAGE_SIZE) + 1
  }

  @Watch('tableData')
  onDataChange (): void {
    this.pageIndex = 0
    this.currentPage = this.dataLength === 0 ? 0 : 1
  }

  setCurrentPage (event: InputEvent & { target: HTMLInputElement }): void {
    const page = Number(event.target.value)

    if (page < 1 || isNaN(page)) {
      this.pageIndex = 0
      this.currentPage = 1
    } else if (page > this.maxPage) {
      this.pageIndex = this.maxPage - 1
      this.currentPage = this.maxPage
    } else {
      this.pageIndex = page - 1
      this.currentPage = page
    }
  }

  previousPage (): void {
    this.pageIndex -= 1
    this.currentPage = this.currentPage - 1
  }

  nextPage (): void {
    this.pageIndex += 1
    this.currentPage = this.currentPage + 1
  }
}
