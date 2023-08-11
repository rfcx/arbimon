/* content from https://docs.google.com/document/d/1KBzcUpfpXlk9kAhKL8GO1be7KrQ-qfL2dj4IdgkcxRM/edit */

import climateFeaturedImg from '@/_assets/featured-work/climate-change-impact/1.webp'
import climateGal1Img from '@/_assets/featured-work/climate-change-impact/2.webp'
import climateGal2Img from '@/_assets/featured-work/climate-change-impact/3.webp'
import climateImpactImg from '@/_assets/featured-work/climate-change-impact/4.webp'
import { type ProjectDetail } from './types'

export const climateChangeImpact: ProjectDetail = {
  id: 4,
  title: 'Climate Change Impact',
  featuredImage: climateFeaturedImg,
  descriptiveText: 'Climate change is having significant impacts on global biodiversity patterns and extinction rates. Ecoacoustic monitoring allows us to understand trends at both the species and ecosystem levels to create proactive conservation plans',
  location: 'PUERTO RICO, UNITED STATES',
  category: {
    id: 'climate-change-impact',
    name: 'Climate Change Impact'
  },
  header: {
    projectName: 'Assessing animal communities’ responses to climate change',
    applications: [
      'Island-wide maps of biodiversity presence across Puerto Rico over time',
      'CNN for ~40 species to automate the detection of species with a focus on threatened and endemic species'
    ],
    timeline: '2021 - ongoing',
    scope: '944 Sites, 96 Species',
    partners: [
      'United State Fish & Wildlife Services',
      'Puerto Rico Department of Natural and Environmental Resources, Para La Naturaleza'
    ],
    services: [
      'Hardware provider',
      'Species List',
      'Expert species validations',
      'Multi-species occupancy models',
      'AI model development',
      'Soundscape Analysis'
    ],
    sdgs: ['13', '15']
  },
  content: {
    subtitle: 'Puerto Rico\'s biodiversity is under constant threat from both natural (i.e., hurricanes) and human (i.e., urbanization, climate change) disturbances. Unfortunately, we historically have not had good information about the status of many species in Puerto Rico, nor how their population fluctuates and responds according to natural and human disturbances.',
    paragraphs: [
      'To improve knowledge about the distribution of bird, amphibian, and mammal species that occur in Puerto Rico, Arbimon, in partnership with the US Fish and Wildlife Service, Puerto Rico Department of Natural and Environmental Resources, and Para la Naturaleza, a conservation unit of the Puerto Rico Conservation Trust, conducted an island-wide survey using ecoacoustic monitoring. The survey focused on the lowlands and coastal areas on the main island of Puerto Rico, a selection of elevational gradients in the mountainous regions, and the major offshore islands of Culebra, Desecheo, Mona and Vieques. Acoustic recorders and the analytical tools in Arbimon have been used to collect data from over 900 sites across the archipelago yearly during the three month peak of bird breeding season.',
      'This project aims to evaluate climate change\'s impact on species\' spatial distribution in a tropical island ecosystem using a decade of acoustic monitoring data. Our results indicate that the distributions of several bird and frog species are positively affected by precipitation, and the proportion of canopy cover and species are shifting toward high-elevation areas due to climate change. The study also found that drought has a stronger negative effect on bird communities than a hurricane of category 4. In addition, the results indicate that there may need to be more than the present amount of protected areas to safeguard bird species under climate change.'
    ]
  },
  gallery: {
    images: [climateGal1Img, climateGal2Img]
  },
  feedback: [{
    text: 'This tool has helped the agency obtain information on species of which little or no information was available, and corroborate the use of different habitats by these species.  Having updated information on the distribution and presence of the different species supports the prioritization process at the time of delineating conservation and management strategies or funding investment.  With Arbimon we were able to better understand species range and focus projects that seek the conservation of protected species',
    partnerName: 'Dr. Nilda M. Jiménez-Marrero, Endangered Species Program Coordinator at DNER'
  }],
  impact: {
    cta: {
      text: 'Explore this project',
      link: 'https://bio.rfcx.org/puerto-rico-island-wide'
    },
    image: climateImpactImg,
    paragraphs: [
      `Some important findings include that Puerto Rico will be drier under current climate change scenarios, but animal populations are positively correlated with rainfall and forest cover. 
      There is a mismatch between current protected areas and remaining suitable bird habitats under climate change scenarios, demonstrating the need for larger, more connected protected areas and buffer zones.
      As a result, USFWS, Departamento de Recursos Naturales y Ambientales de Puerto Rico, and the Para la Naturaleza Foundation are utilizing project results to inform action. They are determining land acquisition priorities 
      by using the maps of species of interest and analyzing community change in the restoration areas. Additionally, this data is being used to  update the distribution status of resident species on the island, as well as species 
      in Greater Conservation Need (SGCN of the State Wildlife Action Plan, SWAP). With the information collected and the recommendations in Arbimon reports, they are about to start other projects focused on the areas and species 
      that need additional conservation actions, particularly birds. They have as a long-term goal to use the digitized data to continue identifying gaps in biodiversity information, carry out an updated distribution of species 
      and generate important habitat layers. In addition, they seek to create connectivity and buffer zones from the impact of sea level rise.`
    ]
  }
}
