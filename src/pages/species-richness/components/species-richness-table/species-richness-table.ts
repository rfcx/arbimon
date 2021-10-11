import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ChartModels } from '@/models'
import { ROUTES_NAME } from '@/router'
import ExportButtonView from '@/views/export-button.vue'
import NoDataContainerView from '@/views/no-data-container.vue'

interface Header {
  title: string
  color: string
}

const HEADER_COLOR = '#ffffff80'

@Options({
  components: {
    ExportButtonView,
    NoDataContainerView
  }
})
export default class SpeciesRichnessTable extends Vue {
  @Prop({ default: [] }) tableData!: ChartModels.TableData[]
  @Prop({ default: [] }) colors!: string[]

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

  goToActivityPatternsPage (speciesId: number): void {
    void this.$router.push({
      name: ROUTES_NAME.activity_patterns,
      params: {
        speciesId
      }
    })
  }
}
