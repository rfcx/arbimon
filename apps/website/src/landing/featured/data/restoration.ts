/* content from https://docs.google.com/document/d/1HVdXbGK6u4GTSNyfyjMK4y9AL5PYED6XZ8sYlqKGUdQ/edit */

import restorationFeaturedImg from '@/_assets/featured-work/restoration/1.webp'
import restorationGal1Img from '@/_assets/featured-work/restoration/2.webp'
import restorationGal2Img from '@/_assets/featured-work/restoration/3.webp'
import restorationImpactImg from '@/_assets/featured-work/restoration/4.webp'
import partnerIcon from '@/_assets/landing/testimonials/feedbacks/WeForest.webp'
import { type ProjectDetail } from './types'

export const restoration: ProjectDetail = {
  id: 3,
  title: 'Restoration',
  featuredImage: restorationFeaturedImg,
  descriptiveText: 'Forest and Landscape Restoration (FLR) is occurring across global ecosystems aiming to regain ecological function and enhance human well-being in deforested & degraded landscapes. Arbimon’s team of experts and ecoacoustic technology can support FLR by tracking the return of native fauna, measuring impact, and informing best practices.',
  location: 'Pontal do Paranapanema, Brazil',
  category: {
    id: 'restoration',
    name: 'Restoration'
  },
  header: {
    projectName: 'Assessing restoration sites in supporting native fauna',
    applications: [
      '178 species are being monitored across Atlantic Forest restoration sites to track change year-over-year',
      'Results have already proven restoration sites are host to a similar number of bird species as protected sites and impact is shown in as little as five years'
    ],
    timeline: '2021 - ongoing',
    scope: '120 sites, 187 species (4 threatened)',
    partners: ['WeForest', 'IPÊ'],
    services: [
      'Survey design',
      'Species manual validation and identification',
      'Species identification models',
      'Soundscape analysis',
      'Species richness analyses',
      'Species occupancy analyses',
      'Species composition analyses'
    ],
    sdgs: ['13', '15']
  },
  content: {
    subtitle: 'Partnering with WeForest & IPÊ, Arbimon is facilitating the analysis of biodiversity across regions under restoration in Pontal.',
    paragraphs: [
      'The remaining 12% of the Atlantic Forest is still among the most biologically rich and diverse forests in the world and exhibits a high number of species that can be found nowhere else on Earth. WeForest and IPÊ have been collaborating to reconnect the forest patches in a fragmented landscape in São Paulo, Brazil, creating more habitat for animals such as the endangered black lion tamarin. The main goal of this study is to establish a comprehensive understanding of how restoration sites affect faunal species distribution, composition, and richness.',
      'Therefore, we aim to evaluate the performance of restoration sites to enhance and protect biodiversity. More specifically, we aim to test if restoration sites are functioning as wildlife corridors by assessing spatial patterns of biodiversity, at both the species- and community-level, in a fragmented landscape in the Atlantic Forest in Brazil.'
    ]
  },
  gallery: {
    images: [restorationGal1Img, restorationGal2Img]
  },
  feedback: [{
    text: 'Arbimon has provided valuable insights into how WeForest’s restoration efforts are impacting biodiversity in Pontal. Additionally, it creates an easily accessible & transparent dashboard that can be utilized by a variety of stakeholders.',
    partnerName: 'Rachel Cohen, WeForest',
    partnerLogo: partnerIcon
  }],
  impact: {
    cta: {
      text: 'Learn more',
      link: 'https://www.weforest.org/project/pontal/'
    },
    image: restorationImpactImg,
    paragraphs: [
      'Year-over-year data collection is providing insights on how biodiversity is returning to restoration sites across the Atlantic Forest in Brazil. The data will inform how WeForest & IPÊ can expand the wildlife corridors to connect the forest fragments and protected areas in the region.',
      `

Results:
1. A total of 178 species were detected in the 120 sampling sites (166 birds, 8 frogs, 2 mammals, and 2 insects), 4 of which are listed as threatened according to IUCN. The total number of bird species detected in this study corresponds to 94% of species detected in other individual studies in the same study area, most of which used point count surveys. This result indicates that most species expected to occur in the region have been detected during our initial survey.
2. Bird species richness was higher in forested and restoration sites than in farming sites, indicating that restoration sites are promoting a positive effect on biodiversity, providing breeding and foraging habitat, and/or connectivity stepping stones for a large portion of the bird community.
3. Farming, restoration, and forest sites have distinct species compositions, with forested sites having a higher number of forest dependent species, restoration sites having a higher number of generalist species, and farming with a higher number of edge species.
4. Species composition analyses show that although a unique group of bird species occurs at each site typology, the bird community in restoration sites is intermediate in  composition between forested sites and farming sites. It would appear then that restoration sites are fulfilling, at least in part, the function of wildlife corridors. Repeated analyses over time will allow us to determine if the composition of restoration sites is  becoming more similar to that of old-growth forest.
5. Multispecies occupancy modeling approaches show that restoration, NDVI, and proximity of rivers and streams positively affect bird species at the community-level. This result indicates that, in general, the mean probability of occupancy across species in this bird species pool was higher at locations where vegetation health (i.e., NDVI) is higher, close to lotic water systems, and in the restoration typology. This result suggests that restoration sites have a positive effect on species occurrence and consequently on richness, but it also highlights that vegetation health (i.e., dense green vegetation, high biomass, and humid conditions) also has a strong positive effect on species occurrence and richness.
6. At the species level, restoration positively impacts the occurrence of 28% of the bird species, while NDVI has a positive effect on 27% of the bird species.`
    ]
  }
}
