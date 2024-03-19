import { kebabCase } from 'lodash-es'
import { Vue } from 'vue-class-component'
import { Inject, Prop, Watch } from 'vue-property-decorator'

import { routeNamesKey } from '@/globals'
import { type RouteNames } from '~/router'

interface Header {
  title: string
  key: string
}
export interface ClassificationsSummaryDataset {
  value: string
  title: string
  image: string | null
  total: number
  rejected: number
  uncertain: number
  confirmed: number
}

export default class ActivityOverviewBySpecies extends Vue {
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames

  @Prop() datasets!: ClassificationsSummaryDataset[]
  @Prop({ default: false }) loading!: boolean

  pageIndex = 1 // 1-based for humans
  formattedDatasets: ClassificationsSummaryDataset[] = []

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

  get hasMoreThanOneDatasets (): boolean {
    return this.datasets.length > 1
  }

  get maxPage (): number {
    return Math.ceil(this.datasets.length / this.pageSize)
  }

  get pageData (): ClassificationsSummaryDataset[] {
    if (this.datasets === undefined) return []
    const start = (this.pageIndex - 1) * this.pageSize
    return this.datasets.slice(start, start + this.pageSize)
  }

  get pageSize (): number {
    if (this.datasets === undefined) return 0
    return 25
  }

  get blankRows (): number {
    return (this.pageSize - this.pageData.length) * this.pageData.length
  }

  get totalSpecies (): number {
    return Math.max(0, this.formattedDatasets.length)
  }

  @Watch('datasets')
  onDataChange (): void {
    console.info(this.datasets)
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

  blur (event: Event): void {
    (event.target as HTMLInputElement).blur()
  }
}
