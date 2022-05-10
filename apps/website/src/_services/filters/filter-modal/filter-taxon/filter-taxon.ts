import { setup, Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { TaxonClass } from '@rfcx-bio/common/dao/types'

import { useProjectData } from '~/api/project-service/use-project-data'

export default class FilterTaxon extends Vue {
  @Prop({ default: [] }) initialTaxonClasses!: TaxonClass[]

  @Emit() emitSelectedTaxons (): TaxonClass[] {
    if (this.selectedTaxons.length === this.taxonClasses.length) return [] // select all === no filter
    return this.selectedTaxons
  }

  projectData = setup(() => useProjectData())
  selectedTaxons: TaxonClass[] = []

  get taxonClasses (): TaxonClass[] {
    if (this.projectData.data === undefined) return []

    return this.projectData.data.taxonClasses
  }

  get isSelectedAllTaxons (): boolean {
    return this.selectedTaxons.length === 0 || this.selectedTaxons.length === this.taxonClasses.length
  }

  override mounted (): void {
    if (this.initialTaxonClasses.length > 0) {
      this.selectedTaxons = this.initialTaxonClasses
    }
  }

  isSelectedTaxon (taxonId: number): boolean {
    return this.selectedTaxons.map(({ id }) => id).includes(taxonId)
  }

  updateSelectedTaxons (taxon: TaxonClass): void {
    const taxonIdx = this.selectedTaxons.findIndex(t => t.id === taxon.id)
    if (taxonIdx === -1) {
      this.selectedTaxons.push(taxon)
    } else {
      this.selectedTaxons.splice(taxonIdx, 1)
    }
    this.emitSelectedTaxons()
  }

  selectAllTaxon (): void {
    this.selectedTaxons = []
    this.emitSelectedTaxons()
  }
}
