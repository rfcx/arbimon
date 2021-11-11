import { Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

import { TAXONOMY_CLASSES } from '~/api/taxonomy-service'
import { OptionalFilter } from '~/api/types'

export default class FilterTaxon extends Vue {
  @Prop({ default: [] }) defaultTaxonFilter!: string[]
  @Emit() emitSelectedTaxons (): OptionalFilter[] {
    if (this.selectedTaxons.length === this.taxons.length) { return [] } // select all === no filter
    return this.selectedTaxons.map(i => { return { title: 'taxon', value: i } })
  }

  selectedTaxons: string[] = []
  taxons = TAXONOMY_CLASSES

  get isSelectedAllTaxons (): boolean {
    return this.selectedTaxons.length === this.taxons.length
  }

  override mounted (): void {
    if (this.defaultTaxonFilter.length > 0) {
      this.selectedTaxons = this.defaultTaxonFilter
    } else {
      this.selectAllTaxon()
    }
  }

  isSelectedTaxon (taxon: string): boolean {
    return this.selectedTaxons.includes(taxon)
  }

  updateSelectedTaxons (taxon: string): void {
    const taxonIdx = this.selectedTaxons.findIndex(t => t === taxon)
    if (taxonIdx === -1) {
      this.selectedTaxons.push(taxon)
    } else {
      this.selectedTaxons.splice(taxonIdx, 1)
    }
    this.emitSelectedTaxons()
  }

  selectAllTaxon (): void {
    this.selectedTaxons = this.taxons.map(t => t.name)
    this.emitSelectedTaxons()
  }
}
