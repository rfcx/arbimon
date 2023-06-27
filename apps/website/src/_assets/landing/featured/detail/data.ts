import { type ProjectDetail } from './types.js'

export const projects: ProjectDetail[] = [
  {
    id: 1,
    category: {
      id: 'bio-baseline',
      shortname: 'Bio Baseline',
      name: 'ESTABLISHING BIODIVERSITY BASELINES'
    },
    header: {
      title: 'Establishing Biodiversity Baselines',
      description: 'Arbimon makes it possible to establish holistic baselines of biodiversity presence in hotspots to improve our current and future understandings of ecosystem dynamics. ',
      projectName: 'Develop baseline biodiversity metrics in Gombe Stream National Park',
      applications: [
        'CNN to identify 40 species of high conservation value - to be expanded to all vocalizing species within Gombe Stream National Park',
        'Results to inform future action on conservation management, pandemic prevention, and community health. '
      ],
      timeline: '2021-present',
      scope: '100 sites >40 species',
      partners: ['Jane Goodall Institute', 'Gombe Stream Research Center', 'Tanzania Wildlife Research Institute, & Tanzania National Parks', 'The Nature Conservancy'],
      services: ['Hardware provider', 'Species List (>100 identified)', 'Expert species validation', 'Soundscape Analysis', 'Ecological Analyses', 'AI model development'],
      sdgs: ['15']
    },
    content: {
      subtitle: 'Partnering with the Jane Goodall Institute, Arbimon is developing baseline levels of biodiversity in Gombe Stream National Park and adjacent village forest reserves. By comparing this data with environmental variables, we are able to understand changes in the animal communities over time and understand the impact of different conservation practices.',
      paragraphs: [
        'Arbimon is supporting JGI in the first-ever holistic biodiversity assessment in the famous Gombe Stream National Park. The main priority is to establish a biodiversity baseline to assess how animal communities change over time and under different conservation practices. The data is currently being analyzed, but the results will be integrated with their OneHealth project which is scoping and modeling potential zoonotic diseases between people and animals. In order to do that, they need to know where different disease vectors are. Baboons and primates are their key targets as they are passing between human settlements and the park consistently. This data will contribute to a map that will be shared with government decision-makers through dashboards as part of the Decision Support and Alert System for Western Tanzania.',
        'This project is being implemented through an approach called “Tacare,” JGI’s community-led conservation approach. Tacare integrates conservation science into local decision-making processes and sustainable development. This program collaborates with local communities to partner around addressing human needs driving threats to their forests, water, and wildlife. By providing alternatives and support for things like sustainable agriculture and by better connecting human needs with their local ecosystem services, communities create plans that benefit their lives, while also protecting wildlife and natural resources. Arbimon has been collaborating directly with JGI and local communities to implement the first phase of this initiative.'
      ]
    },
    gallery: {
      images: []
    },
    feedback: {
      text: 'Listening to inform action has been something important to JGI since the beginning of our work. Nowe, in collaboration with the Arbimon platform, we are beginning to uncover a previously undocumented world within Gombe Stream National Park. Using acoustics to establish a baseline from which we will proceed is game changing',
      partnerName: 'XXX, JGI'
    }
  }
]
