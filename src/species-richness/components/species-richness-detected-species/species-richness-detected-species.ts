import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { DetectedSpeciesItem } from './Table'

interface Header {
  title: string
  color: string
}

const HEADER_COLOR = '#ffffff80'

export default class SpeciesRichnessDetectedSpecies extends Vue {
  @Prop() tableData!: DetectedSpeciesItem[]
  @Prop() colors!: string[]

  page = 0
  maxPage = 0
  offset = 10
  tablePiecesData: DetectedSpeciesItem[] = []

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
    return this.tableData.length > 0
  }

  get hasMoreThanOneDataset (): boolean {
    return this.datasetCount > 1
  }

  get datasetCount (): number {
    return this.tableData.length > 0 ? this.tableData[0].data.length : 0
  }

  @Watch('tableData')
  onTableDataChange (): void {
    this.tablePiecesData = this.tableData.length < this.offset ? this.tableData : this.tableData.slice(0, this.offset)
    this.maxPage = Math.ceil(this.tableData.length / this.offset) - 1
  }

  @Watch('page')
  onPageChange (): void {
    const dataLength = this.tableData.length
    const start = this.page * this.offset
    const end = start + this.offset > dataLength ? dataLength : start + this.offset
    this.tablePiecesData = this.tableData.slice(start, end)
  }

  previousPagination (): void {
    this.page -= 1
  }

  nextPagination (): void {
    this.page += 1
  }
}
