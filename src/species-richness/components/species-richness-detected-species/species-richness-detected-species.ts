import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

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

  page = 0

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

  get maxPage (): number {
    return Math.ceil(this.tableData.length / PAGE_SIZE) - 1
  }

  get tablePiecesData (): DetectedSpeciesItem[] {
    const dataLength = this.tableData.length
    const start = this.page * PAGE_SIZE
    const end = start + PAGE_SIZE > dataLength ? dataLength : start + PAGE_SIZE
    return dataLength < PAGE_SIZE ? this.tableData : this.tableData.slice(start, end)
  }

  previousPagination (): void {
    this.page -= 1
  }

  nextPagination (): void {
    this.page += 1
  }
}
