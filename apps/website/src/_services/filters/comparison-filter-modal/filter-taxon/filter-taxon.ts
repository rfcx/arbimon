import { Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { type TaxonClass } from '@rfcx-bio/common/dao/types'

import { storeKey } from '@/globals'
import { type FilterPropertyEquals } from '~/filters'
import { type BiodiversityStore } from '~/store'

export default class FilterTaxon extends Vue {
  @Inject({ from: storeKey }) readonly store!: BiodiversityStore

  @Prop({ default: [] }) initialTaxonClasses!: number[]

  @Emit() emitSelectedTaxons (): FilterPropertyEquals[] {
    if (this.selectedTaxons.length === this.taxons.length) return [] // select all === no filter
    void this.$router.replace({ query: { ...this.$route.query, 'taxon[]': this.selectedTaxons } })
    return this.selectedTaxons.map(i => { return { propertyName: 'taxon', value: i } })
  }

  selectedTaxons: number[] = []

  get taxons (): TaxonClass[] {
    return this.store.projectFilters?.taxonClasses ?? []
  }

  get isSelectedAllTaxons (): boolean {
    return this.selectedTaxons.length === 0 || this.selectedTaxons.length === this.taxons.length
  }

  override mounted (): void {
    if (this.initialTaxonClasses.length > 0) {
      this.selectedTaxons = this.initialTaxonClasses
    }
  }

  isSelectedTaxon (taxonId: number): boolean {
    return this.selectedTaxons.includes(taxonId)
  }

  updateSelectedTaxons (taxonId: number): void {
    const taxonIdx = this.selectedTaxons.findIndex(t => t === taxonId)
    if (taxonIdx === -1) {
      this.selectedTaxons.push(taxonId)
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
