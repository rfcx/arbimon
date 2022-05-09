import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Inject, Prop } from 'vue-property-decorator'

import { TaxonClass } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { DetectionFilter } from '~/filters'
import { DetectionFilterSiteGroup } from '~/filters/types'
import { BiodiversityStore } from '~/store'
import DateRangePicker from './date-range-picker/date-range-picker.vue'
import FilterSite from './filter-site.vue'
import FilterTaxon from './filter-taxon/filter-taxon.vue'

interface FilterMenuItem {
  id: string
  name: string
}

const DATE_FORMAT = 'YYYY-MM-DD'

@Options({
  components: {
    OnClickOutside,
    DateRangePicker,
    FilterSite,
    FilterTaxon
  }
})
export default class ComparisonFilterModalComponent extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop({ default: null }) initialValues!: DetectionFilter | null
  @Prop({ default: true }) canFilterByTaxon!: boolean

  @Emit() emitApply (): DetectionFilter {
    return {
      dateStartLocal: dayjs.utc(this.dateStartLocal),
      dateEndLocal: dayjs.utc(this.dateEndLocal),
      siteGroups: this.siteGroups,
      taxonClasses: this.taxonClasses
    }
  }

  @Emit() emitClose (): boolean { return false }

  // Tabs
  currentActiveMenuId = ''

  // Dates
  readonly today = dayjs().format(DATE_FORMAT)
  dateStartLocal: string | null = dayjs().format(DATE_FORMAT)
  dateEndLocal: string | null = dayjs().format(DATE_FORMAT)
  siteGroups: DetectionFilterSiteGroup[] = []
  taxonClasses: TaxonClass[] = []

  get menus (): FilterMenuItem[] {
    return [
      { id: 'sites', name: 'Sites' },
      { id: 'times', name: 'Date Range' },
      ...(this.canFilterByTaxon ? [{ id: 'taxon', name: 'Taxon' }] : [])
    ]
  }

  get selectedTaxons (): TaxonClass[] {
    return this.taxonClasses
  }

  override mounted (): void {
    if (!(this.currentActiveMenuId in this.menus)) this.currentActiveMenuId = this.menus[0].id

    if (this.initialValues) {
      this.dateStartLocal = this.initialValues.dateStartLocal?.format(DATE_FORMAT)
      this.dateEndLocal = this.initialValues.dateEndLocal?.format(DATE_FORMAT)
      this.taxonClasses = this.initialValues.taxonClasses
      this.siteGroups = this.initialValues.siteGroups
    }
  }

  onDateChange (dateRange: [Date, Date]): void {
    this.dateStartLocal = dayjs(dateRange[0]).format(DATE_FORMAT)
    this.dateEndLocal = dayjs(dateRange[1]).format(DATE_FORMAT)
  }

  onTaxonChange (taxonClasses: TaxonClass[]): void {
    this.taxonClasses = taxonClasses
  }

  onSiteGroupChange (siteGroups: DetectionFilterSiteGroup[]): void {
    this.siteGroups = siteGroups
  }

  setDefaultSelectedSites (): void {
    this.siteGroups = this.initialValues?.siteGroups ?? []
  }

  setActiveMenuId (id: string): void {
    this.currentActiveMenuId = id
  }

  isCurrentActive (id: string): boolean {
    return id === this.currentActiveMenuId
  }
}
