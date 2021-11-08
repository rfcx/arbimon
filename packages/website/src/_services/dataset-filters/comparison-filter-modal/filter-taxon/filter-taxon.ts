import { Vue } from 'vue-class-component'

import { TAXONOMY_CLASSES } from '~/api/taxonomy-service'

export default class FilterTaxon extends Vue {
  selectedTaxons: string[] = []
  taxons = TAXONOMY_CLASSES

  get isSelectedAllTaxons (): boolean {
    return this.selectedTaxons.length === this.taxons.length
  }

  mounted (): void {
    this.selectAllTaxon()
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
  }

  selectAllTaxon (): void {
    this.selectedTaxons = this.taxons.map(t => t.name)
  }
}
