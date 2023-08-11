import supplyChainFeaturedImg from '@/_assets/featured-work/sustainable-supply-chains/1.webp'
import supplyChainGal1Img from '@/_assets/featured-work/sustainable-supply-chains/2.webp'
import supplyChainGal2Img from '@/_assets/featured-work/sustainable-supply-chains/3.webp'
import supplyChainImpactImg from '@/_assets/featured-work/sustainable-supply-chains/4.webp'
import { type ProjectDetail } from './types'

export const supplyChain: ProjectDetail = {
  id: 5,
  title: 'Sustainable Supply Chain Monitoring',
  featuredImage: supplyChainFeaturedImg,
  descriptiveText: 'As we transition away from monoculture plantations and improve agricultural practices, it is important to understand which approaches are most effective for creating positive change. Ecoacoustic monitoring makes it possible to track health progress across agricultural and agroforestry sites.',
  location: 'Borneo, Malaysia',
  category: {
    id: 'sustainable-supply-chains',
    name: 'Sustainable Supply Chains'
  },
  header: {
    projectName: 'Comparing biodiversity levels in forests, restoration sites, and oil palm plantations to inform sustainable agricultural systems',
    applications: [
      'Species specific and soundscape approaches to map biodiversity levels across land use categories'
    ],
    timeline: '2021 - ongoing',
    scope: '52 sampling sites, 103 species monitored, 42 endangered species',
    partners: ['Ecoculture'],
    services: [
      'Survey design',
      'Expert manual species validation and labeling',
      'Statistical and ecological analyses',
      'Species distribution Modeling',
      // '- Bayesian Multi-species Occupancy Model/ Species distribution models',
      // '- Dynamic Occupancy Models (temporal trend analyses)',
      // '- Vocal Activity Patterns',
      'Soundscape analyses',
      // '- Acoustic Space Use',
      // '- Soundscape composition analyses',
      'Science outreach and communication'
    ],
    sdgs: []
  },
  content: {
    subtitle: 'In collaboration with Ecoculture, this project aims to develop and implement community-led landscape restoration and management approaches to achieve meaningful environmental and social benefits.',
    paragraphs: [
      'This study will support sustainable agricultural systems by comparing biodiversity levels in primary forests, restoration sites, oil palm plantations, and invasive eucalyptus trees. Acoustic recorders were deployed at 52 sites in the Sabah region of Borneo, and recordings were analyzed using Arbimon.',
      'Overall, the integration of soundscape and multi-species occupancy model analyses has yielded valuable insights into the factors shaping biodiversity across different land cover types, while also revealing potential strategies for enhancing biodiversity in degraded areas. One of the most exciting findings of the study is the comparable species richness and bird composition observed in primary forest to that in the restoration area facilitated by the Sow-A-Seed project, which utilized an enrichment line-planting technique over a span of approximately 20 years. In addition, our results suggest that sites in primary forests and restoration areas have significantly higher bird richness compared to sites in eucalyptus and oil palm plantations. On average, primary forests showed more than 2.5 times the bird richness of eucalyptus plantations and approximately 3 times the bird richness of oil palm plantations. These outcomes suggest that such a restoration approach holds promise as an effective strategy for enhancing bird diversity in heavily degraded regions of Borneo.  Additionally, the study demonstrates similar soundscape compositions between forest and restoration areas, further distinguishing them from oil palm and eucalyptus plantations.'
    ]
  },
  gallery: {
    images: [supplyChainGal1Img, supplyChainGal2Img]
  },
  feedback: [{
    text: 'Arbimon has made it possible to holistically track species presence in a way we have not been able to before. This data is extremely valuable to inform how we prioritize local initiatives to support biodiversity moving forward',
    partnerName: 'Ecoculture'
  }],
  impact: {
    cta: {
      text: 'Learn more',
      link: 'https://ecoculture.us/'
    },
    image: supplyChainImpactImg,
    paragraphs: [
      'Ecoculture’s mission is to develop landscape restoration projects that promote a culture of conservation. By working closely with local communities, they are able to create value for the ecosystems, including the people calling them home. These results will be used to prioritize highest-value land management approaches and arm Ecoculture with the data required to measure impact across their projects. It was found that soundscapes from primary forest and restoration sites are similar, suggesting that restoration sites are able to maintain high biodiversity levels. Therefore, it is important to continue forward with these high-value projects.'
    ]
  }
}
