import { Vue } from 'vue-class-component'

import { TaxonomyModels } from '@/models'
import { SpeciesService } from '@/services'
import { Watch } from 'vue-property-decorator'
import { ROUTES_NAME } from '@/router'

export default class ActivityPatterns extends Vue {
  species: TaxonomyModels.Species[] = []
  selectedSpeciesId: number | null = null

  get speciesId (): number {
    return Number(this.$route.params.speciesId ?? '-1')
  }

  async mounted (): Promise<void> {
    this.species = (await SpeciesService.getAllSpecies()).sort((a, b) => a.speciesName.localeCompare(b.speciesName))
    if (this.species.length > 0) {
      this.selectedSpeciesId = Number(this.speciesId ?? this.species[0].speciesId)
    }
  }

  @Watch('selectedSpeciesId')
  onSelectedSpeciesIdChange (): void {
    this.$router.push({
      name: ROUTES_NAME.activity_patterns,
      params: {
        speciesId: this.selectedSpeciesId
      }
    })
  }
}
