/* content from https://docs.google.com/document/d/1eEvGt_zqVnyPoKGPcYuV4gWaazpGCpciBjePsHB_MA4/edit */

import endangeredFeaturedImg from '@/_assets/featured-work/endangered-species/1.webp'
import endangeredGal1Img from '@/_assets/featured-work/endangered-species/2.webp'
import endangeredGal2Img from '@/_assets/featured-work/endangered-species/3.webp'
import endangeredImpactImg from '@/_assets/featured-work/endangered-species/4.webp'
import partnerIcon from '@/_assets/landing/testimonials/feedbacks/Charles Darwin Foundation.png'
import { type ProjectDetail } from './types'

export const endangeredSpecies: ProjectDetail = {
  id: 2,
  title: 'Endangered Species Protection',
  featuredImage: endangeredFeaturedImg,
  descriptiveText: 'Utilizing ecoacoustic data, Arbimon isolates the calls of endangered species to map presence over time. This enables implementation of more targeted habitat restoration, protected areas, and breeding programs.',
  location: 'Isabela Island, Galapagos',
  category: {
    id: 'endangered-species',
    name: 'Endangered Species'
  },
  header: {
    projectName: 'Monitoring the critically endangered mangrove finch',
    applications: [
      'High-accuracy CNN (>90%) is facilitating ongoing automated detection and monitoring of endangered species across the archipelago.',
      'Results are being utilized to inform current finch distribution across all potential mangrove habitats to inform action.'
    ],
    timeline: '2022 - ongoing',
    scope: '34 sampling sites, 2 species monitored',
    partners: ['Charles Darwin Foundation'],
    services: ['Survey design', 'Expert species validation', 'Ecological analyses', 'AI modeled development'],
    sdgs: ['15']
  },
  content: {
    subtitle: ' Arbimon is working with the Charles Darwin Foundation to facilitate important work to understand where the Critically Endangered mangrove finch is present across its historic range at sites distant from its main population sites using automated detections of their calls.',
    paragraphs: [
      'The Mangrove Finch (_Camarhynchus heliobates_) is one of the 18 species of Darwin\'s finches that only live in the Galapagos Islands. It is the rarest bird of the archipelago, with an estimated population of 100 individuals that inhabit only 30 hectares in two mangrove forests on Isabela Island. In collaboration with Rainforest Connection, CDF installed acoustic recording devices in 34 sites where the mangrove finch persists.',
      'Using Arbimon tools, CDF has detected the mangrove finch across 26 known population sites in preparation for the next phase in which additional Galapagos mangrove habitats are sampled. We have also detected the woodpecker finch (Vulnerable, IUCN Red List) in 5 sites. We have trained an AI model with precision of 0.269 for Woodpecker Finch and 0.99 for Mangrove Finch, to automatically detect both species in raw soundscape recordings to facilitate the detection, monitoring, protection, and recovery of these threatened birds.'
    ]
  },
  gallery: {
    images: [endangeredGal1Img, endangeredGal2Img]
  },
  feedback: [{
    text: 'Our project team is now using passive acoustic monitors and automated modeling developed by Arbimon to help us survey isolated mangrove forests throughout the historic range of the mangrove finch, to see if any individuals are present at sites we do not know about. Due to the difficulties to survey these sites in person, deploying monitors for weeks at a time enables us to get more thorough results',
    partnerName: 'Francesca Cunninghame, Charles Darwin Foundation',
    partnerLogo: partnerIcon
  }],
  impact: {
    cta: {
      text: 'Learn more',
      link: 'https://www.darwinfoundation.org/en/research/projects/mangrove-finch-population'
    },
    image: endangeredImpactImg,
    paragraphs: [
      'Historically, the mangrove finch was distributed across the mangroves  in the two western most islands of the Galapagos - its current range is restricted to only 30 ha on North West Isabela Island. Since 2006 the Charles Darwin Foundation, working together with the Galapagos National Park Directorate and other collaborating institutions, has carried out intensive conservation management to protect the mangrove finch. Actions have included establishing introduced rat control to reduce nest predation, trailing a translocation to mangroves in the birds\' historic range, head-starting (collection of eggs, chick rearing in captivity and release of juveniles back into the wild) and in-situ nest parasite treatment alongside complementary chick husbandry. While these efforts have been successful the mangrove finch remains threatened and on-going intensive conservation management is required. At the same time no survey of historically occupied mangrove finch habitat has been carried out for over 20 years and it is important to determine whether there are any mangrove finches inhabiting other sites to help inform future conservation management of this species. We are starting to answer these questions with our collaboration. The known existing population was recorded in 2022 to create models and better understand their communications. In 2023 devices were deployed across a further mangrove forest 20km distant from the main population, with plans to extend monitoring to a further 12 mangrove sites through 2024 and 2025. This will inform if mangrove finches are dispersing outside of their main population site and inhabiting distant isolated mangroves, which further informs which other sites could be considered for increased conservation management to better protect them.'
    ]
  }
}
