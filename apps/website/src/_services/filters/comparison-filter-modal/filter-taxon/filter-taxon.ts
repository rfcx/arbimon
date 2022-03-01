import { Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { TAXONOMY_CLASSES } from '@rfcx-bio/common/mock-data/raw-taxon-classes'

import { FilterPropertyEquals } from '~/filters'

export default class FilterTaxon extends Vue {
  @Prop({ default: [] }) initialTaxonClasses!: string[]

  @Emit() emitSelectedTaxons (): FilterPropertyEquals[] {
    if (this.selectedTaxons.length === this.taxons.length) return [] // select all === no filter
    return this.selectedTaxons.map(i => { return { propertyName: 'taxon', value: i } })
  }

  selectedTaxons: string[] = []
  taxons = TAXONOMY_CLASSES

  get isSelectedAllTaxons (): boolean {
    return this.selectedTaxons.length === 0 || this.selectedTaxons.length === this.taxons.length
  }

  override mounted (): void {
    if (this.initialTaxonClasses.length > 0) {
      this.selectedTaxons = this.initialTaxonClasses
    }
  }

  isSelectedTaxon (taxonSlug: string): boolean {
    return this.selectedTaxons.includes(taxonSlug)
  }

  updateSelectedTaxons (taxonSlug: string): void {
    const taxonIdx = this.selectedTaxons.findIndex(t => t === taxonSlug)
    if (taxonIdx === -1) {
      this.selectedTaxons.push(taxonSlug)
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
