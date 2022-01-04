import { Vue } from 'vue-class-component'

interface Information {
  title: string
  content: string
  slug: string
}

export const INFO_TOPICS = {
  richness: 'richness',
  activity: 'activity',
  spotlight: 'spotlight'
}

export default class InfoPage extends Vue {
  selectedInfo = this.information[0].slug

  get information (): Information[] {
    return [
      {
        title: 'Species Richness',
        content: 'Is the number of species of a given taxon in a sample, location or time period. The species richness is the simplest, commonness and most intuitive metric to summarize biodiversity (Magurran 2004). Although a simple count of species exhibits several limitations for not considering species composition, or other important characteristics of biological communities such as evolutionary history and functional diversity, it is widely used for ecological and conservation issues. For example, species richness has been used for a long time to identify global hotspots of biodiversity, establish priority areas for conservation and assess how biodiversity varies along environmental gradients. Species richness faces a number of issues, which sampling effort is the most problematic, and therefore, there are manifold species richness indices developed to represent the number of species and deal with issues induced by sample size, different sampling efforts, and species abundance distribution (e.g. species accumulation curves, nonparametric estimators; Magurran 2004).',
        slug: INFO_TOPICS.richness
      },
      {
        title: 'Activity Overview - Community perspective',
        content: 'Patterns of vocal activity provide information about vocalizations themselves and their function (Yoo et al. 2019). In many species, vocal activity can inform us about breeding cycles since vocal activity often reaches its peak during territorial and mating competition (Yoo et al. 2019). Knowledge of vocal activity patterns may facilitate wildlife management by: 1) guiding when to focus monitoring efforts to coincide when species are available to detection; 2) providing a behavior baseline that can be use to track and understand responses to natural and human impacts; 3) providing information for when to minimize disturbance from anthropogenic noises that may disrupt species\' ability to communicate.\nOccupancy is defined as the proportion of sites, patches, landscape or habitat units occupied by a taxon (MacKenzie et al. 2006). The occupancy uses the basic presence-absence data of a species within a spatial unit, and it can be achieved more easily and cost-effectively than abundance estimation methods (MacKenzie et al. 2006). Although it is considered less informative than abundance, it is a very widely and essential state variable applied in ecology, wildlife management and conservation biology. Some questions faced with occupancy estimation are species distribution range, habitat selection, wildlife disease statics and dynamics, metapopulation dynamics, and resources selection (MacKenzie et al. 2006; Kéry & Royle 2016). A major concern with presence-absence data of species is that detection probability of species is often below 1, biasing the occupancy estimates and its relationship with the predictor variables. The occupancy modelling approach can be used to account for the imperfect detection of species while estimating the "true" species occupancy.',
        slug: INFO_TOPICS.activity
      },
      {
        title: 'Activity Spotlight - Individual perspective',
        content: 'Patterns of vocal activity provide information about vocalizations themselves and their function (Yoo et al. 2019). In many species, vocal activity can inform us about breeding cycles since vocal activity often reaches its peak during territorial and mating competition (Yoo et al. 2019). Knowledge of vocal activity patterns may facilitate wildlife management by: 1) guiding when to focus monitoring efforts to coincide when species are available to detection; 2) providing a behavior baseline that can be use to track and understand responses to natural and human impacts; 3) providing information for when to minimize disturbance from anthropogenic noises that may disrupt species\' ability to communicate.\nOccupancy is defined as the proportion of sites, patches, landscape or habitat units occupied by a taxon (MacKenzie et al. 2006). The occupancy uses the basic presence-absence data of a species within a spatial unit, and it can be achieved more easily and cost-effectively than abundance estimation methods (MacKenzie et al. 2006). Although it is considered less informative than abundance, it is a very widely and essential state variable applied in ecology, wildlife management and conservation biology. Some questions faced with occupancy estimation are species distribution range, habitat selection, wildlife disease statics and dynamics, metapopulation dynamics, and resources selection (MacKenzie et al. 2006; Kéry & Royle 2016). A major concern with presence-absence data of species is that detection probability of species is often below 1, biasing the occupancy estimates and its relationship with the predictor variables. The occupancy modelling approach can be used to account for the imperfect detection of species while estimating the "true" species occupancy.\nOccupancy analysis and maps: It is a type of statistical analysis that uses species detection and non-detection data to estimate the probability that a site is occupied by a species. Occupancy models estimate the true occupancy probability of a species at a site while considering that the species may be present at this site even if not detected (i.e. imperfect detection). Occupancy models can incorporate several site characteristics, such as habitat type, temperature, or the data collection period.',
        slug: INFO_TOPICS.spotlight
      }
    ]
  }

  get currentContent (): Information | undefined {
    return this.information.find(c => c.slug === this.selectedInfo)
  }

  override created (): void {
    const selectedInfo = this.$route.params.topic as string
    this.selectedInfo = selectedInfo || this.information[0].slug
  }

  async onSelectedInfo (slug: string): Promise<void> {
    this.selectedInfo = slug
    await this.$router.replace({ params: { topic: slug } })
  }
}
