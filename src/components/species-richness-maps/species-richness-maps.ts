import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import MapBubbleComponent from '@/components/map-bubble/map-bubble.vue'
import { ChartModels, TaxonomyModels } from '@/models'

@Options({
  components: {
    MapBubbleComponent
  }
})
export default class SpeciesRichnessMaps extends Vue {
  @Prop({ default: [] }) public datasets!: ChartModels.MapDataSet[]

  taxons = TaxonomyModels.TAXONOMIES
  taxon = this.taxons[0].name

  get hasData (): boolean { return this.datasets.length > 0 }
  get columnCount (): number {
    switch (this.datasets.length) {
      case 1: return 1
      case 2: case 4: return 2
      default: return 3
    }
  }
}
