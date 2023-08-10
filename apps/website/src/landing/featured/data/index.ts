import supplyChainGal1Img from '@/_assets/featured-work/sustainable-supply-chains/2.webp'
import supplyChainGal2Img from '@/_assets/featured-work/sustainable-supply-chains/3.webp'
import supplyChainImpactImg from '@/_assets/featured-work/sustainable-supply-chains/4.webp'
import supplyChainFeaturedImg from '@/_assets/featured-work/sustainable-supply-chains/5.webp'
import { bioBaseline } from './biodiversity-baselines'
import { carbonTransparency } from './carbon-transparency'
import { climateChangeImpact } from './climate-change-impact'
import { endangeredSpecies } from './endangered-species'
import { restoration } from './restoration'
import { type ProjectDetail } from './types'

export const projects: ProjectDetail[] = [
  bioBaseline,
  endangeredSpecies,
  restoration,
  climateChangeImpact,
  {
    id: 5,
    title: 'Sustainable Supply Chain Monitoring',
    featuredImage: supplyChainFeaturedImg,
    descriptiveText: 'Species specific and soundscape approaches to map biodiversity levels across land use categories',
    location: 'Borneo, Malaysia',
    category: {
      id: 'sustainable-supply-chains',
      name: 'Sustainable Supply Chains'
    },
    header: {
      projectName: 'Comparing biodiversity levels in forests, restoration sites, and oil palm plantations to inform sustainable agricultural systems',
      applications: [
        'Comparing biodiversity levels in forests, restoration sites, and oil palm plantations to inform sustainable agricultural systems'
      ],
      timeline: '2021 - ongoing',
      scope: '52 Sampling sites, 103 Species monitored',
      partners: ['Ecoculture'],
      services: [
        'Survey design',
        'Expert manual species validation and labeling',
        'Statistical and ecological analyses',
        'Species Distribution Modeling',
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
      subtitle: '',
      paragraphs: [
        'In collaboration with Ecoculture, this project aims to develop and implement community-led landscape restoration and management approaches to achieve meaningful environmental and social benefits.',
        'This study will support sustainable agricultural systems by comparing biodiversity levels in primary forests, restoration sites, oil palm plantations, and invasive eucalyptus trees. Acoustic recorders were deployed at 52 sites in the Sabah region of Borneo, and recordings were analyzed using Arbimon. The study found that the number of bird species and soundscapes in primary forests and restoration sites is significantly higher than in oil palm and eucalyptus sites. In addition, restoration sites were found to sustain biodiversity levels comparable to pristine areas, suggesting that sustainable agricultural practices such as agroforestry and regenerative agriculture can help sustain biodiversity.'
      ]
    },
    gallery: {
      images: [supplyChainGal1Img, supplyChainGal2Img]
    },
    feedback: [{
      text: 'Arbimon has made it possible to holistically track species presence in a way we have not been able to before. This data is extremely valuable to inform how we prioritize local initiatives to support biodiversity moving forward',
      partnerName: 'XXX, Ecoculture'
    }],
    impact: {
      cta: null,
      image: supplyChainImpactImg,
      paragraphs: [
        'Ecoculture’s mission is to develop landscape restoration projects that promote a culture of conservation. By working closely with local communities, they are able to create value for the ecosystems, including the people calling them home. These results will be used to prioritize highest-value land management approaches and arm Ecoculture with the data required to measure impact across their projects. It was found that soundscapes from primary forest and restoration sites are similar, suggesting that restoration sites are able to maintain high biodiversity levels. Therefore, it is important to continue forward with these high-value projects.'
      ]
    }
  },
  carbonTransparency
]
