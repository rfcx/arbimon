/* content from https://docs.google.com/document/d/1wX9NOjt3NAMt3gZ8u3tdfzT1WQzONZclOk71E3ysbmo/edit */

import bioFeaturedImg from '@/_assets/featured-work/biodiversity-baselines/1.webp'
import bioGal1Img from '@/_assets/featured-work/biodiversity-baselines/2.webp'
import bioGal2Img from '@/_assets/featured-work/biodiversity-baselines/3.webp'
import bioImpactImg from '@/_assets/featured-work/biodiversity-baselines/4.webp'
import { type ProjectDetail } from './types'

export const bioBaseline: ProjectDetail = {
  id: 1,
  title: 'Establishing Biodiversity Baselines',
  featuredImage: bioFeaturedImg,
  descriptiveText: 'Arbimon makes it possible to establish holistic baselines of biodiversity presence in hotspots to improve our current and future understandings of ecosystem dynamics.',
  location: 'GOMBE NATIONAL PARK, TANZANIA',
  category: {
    id: 'biodiversity-baselines',
    name: 'Biodiversity Baselines'
  },
  header: {
    projectName: 'Developing baseline biodiversity metrics for comparison over time',
    applications: [
      'CNN to identify 40 species of high conservation value - to be expanded to all vocalizing species within Gombe National Park.',
      'Results to inform future action on conservation management, climate change adaptation, zoonotic disease prevention, and better health for people, animals and shared environment.'
    ],
    timeline: '2021 - present',
    scope: '100 sites, >40 species',
    partners: ['Jane Goodall Institute', 'Gombe Stream Research Center', 'Tanzania Wildlife Research Institute', 'Tanzania National Parks'],
    services: ['Hardware provider', 'Species list (>100 identified)', 'Expert species validation', 'Soundscape Analysis', 'Ecological analyses', 'AI model development'],
    sdgs: ['15']
  },
  content: {
    subtitle: 'Partnering with the Jane Goodall Institute, Arbimon is developing baseline levels of biodiversity in Gombe National Park and adjacent village forest reserves. By comparing this data with environmental and human land use variables, we are able to understand changes in the animal communities over space and time, understand the impact of different threats and inform conservation practices.',
    paragraphs: [
      'Arbimon is supporting JGI in the first-ever biodiversity assessment using bioacoustics in the famous Gombe National Park, Tanzania. The Jane Goodall Institute’s goal is to complement and expand Dr. Jane Goodall’s pioneering long-term research by deploying bioacoustics monitoring system that will enable the Institute, TAWIRI, TANAPA, local communities, district government and other partners to develop a comprehensive understanding of the biodiversity in Gombe National Park and adjacent village land forest Reserves. The main priority is to establish a biodiversity baseline to assess how animal communities are distributed and change over time and under different threats, such as habitat fragmentation and climate change, and to evaluate and inform conservation practices. The data is currently being analyzed, but the results will be integrated with  the Jane Goodall Institute’s long-term data on chimpanzees, baboons and other primates and with other ongoing projects such as Gombe OneHealth Hub developed with Emory University, which is scoping and modeling potential zoonotic disease transmissions between wildlife, domestic animals and people. In order to do that, researchers need to know where and when different disease vectors are and how they overlap and interact. Baboons, vervet monkeys and other primates are key targets as they are passing the boundaries between human settlements and the park. This data will contribute to a risk map that will be shared with government decision-makers through dashboards as part of the larger Decision Support and Alert System for Western Tanzania.',
      'This Gombe bioacoustics project is being implemented through an approach called "Tacare," JGI’s community-led conservation model. Tacare integrates conservation science into local decision-making processes and sustainable development. This program collaborates with local communities to partner around addressing human needs driving threats to their forests, water, and wildlife. By providing nature-based alternatives and support for things like sustainable agriculture and by better connecting human needs with their local ecosystem services, communities create plans that benefit their lives, while also protecting wildlife and natural resources. Arbimon has been collaborating directly with JGI to integrate this research into ongoing research and conservation efforts with local communities, government and other partners to implement the first phase of this initiative.'
    ]
  },
  gallery: {
    images: [bioGal1Img, bioGal2Img]
  },
  feedback: [{
    text: `
      Active listening to hear and respect local people values, beliefs, and traditional knowledge
      has been important to JGI since the beginning of our work. Now, in collaboration with the Arbimon platform, we are beginning to listen to forests and uncover a previously undocumented world within Gombe National Park. Using acoustics to hear the forests and its inhabitants and better understand their conservation needs is game changing
    `,
    partnerName: 'Dr. Lilian Pintea, Vice-President of Conservation Science, JGI, USA'
  }],
  impact: {
    cta: {
      text: 'Learn more',
      link: 'https://janegoodall.org/make-a-difference/gombe-60/'
    },
    image: bioImpactImg,
    paragraphs: [
      'This collaboration will result in the establishment of a biodiversity baseline to assess how animal communities are distributed and change over time and under different threats and conservation practices. Simultaneously, Gombe Stream Research Center, JGI Tanzania and other local partners will be trained on all activities and empowered to lead both the management of the project as well as continued biodiversity analyses to create the building blocks for a long-term project. The next steps are to establish permanent monitoring stations and use new datasets collected to answer critical questions that will inform the management of the park, create value, and inform health programs.'
    ]
  }
}
