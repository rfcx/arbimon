import { type ProjectDetail } from './types'

export const projects: ProjectDetail[] = [
  {
    id: 1,
    title: 'Establishing Biodiversity Baselines',
    featuredImage: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    descriptiveText: 'Developing baseline biodiversity metrics in partnership with the Jane Goodall Institute',
    location: 'Gombe Stream National Park, Tanzania',
    category: {
      id: 'biodiversity-baselines',
      name: 'Biodiversity Baselines'
    },
    header: {
      title: 'Establishing Biodiversity Baselines',
      description: 'Arbimon makes it possible to establish holistic baselines of biodiversity presence in hotspots to improve our current and future understandings of ecosystem dynamics. ',
      projectName: 'Develop baseline biodiversity metrics in Gombe Stream National Park',
      applications: [
        'CNN to identify 40 species of high conservation value - to be expanded to all vocalizing species within Gombe Stream National Park',
        'Results to inform future action on conservation management, pandemic prevention, and community health. '
      ],
      timeline: '2021 - ongoing',
      scope: '100 sites, >40 species',
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
    feedback: [{
      text: 'Listening to inform action has been something important to JGI since the beginning of our work. Nowe, in collaboration with the Arbimon platform, we are beginning to uncover a previously undocumented world within Gombe Stream National Park. Using acoustics to establish a baseline from which we will proceed is game changing',
      partnerName: 'XXX, JGI'
    }]
  },
  {
    id: 2,
    title: 'Endangered Species Protection',
    featuredImage: 'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    descriptiveText: 'Monitoring the critically endangered mangrove finch',
    location: 'Isabela Island, Galapagos',
    category: {
      id: 'endangered-species',
      name: 'Endangered Species'
    },
    header: {
      title: 'Monitoring the critically endangered mangrove finch',
      description: 'Arbimon makes it possible to establish holistic baselines of biodiversity presence in hotspots to improve our current and future understandings of ecosystem dynamics. ',
      projectName: 'Develop baseline biodiversity metrics in Gombe Stream National Park',
      applications: [
        'High-accuracy CNN (>90%) is facilitating ongoing automated detection and monitoring of endangered species across the archipelago.',
        'Results are being utilized to inform current finch distribution across all potential mangrove habitats to inform action.'
      ],
      timeline: '2022 - ongoing',
      scope: '34 Sampling sites, 2 Species monitored',
      partners: ['Charles Darwin Foundation'],
      services: ['Survey design', 'Expert species validation', 'Ecological analyses', 'AI modeled development'],
      sdgs: ['15']
    },
    content: {
      subtitle: 'Partnering with the Charles Darwin Foundation, Arbimon is facilitating important work to understand where the Critically Endangered mangrove finch is present using automated detections of their calls.',
      paragraphs: [
        'The Mangrove Finch (Camarhynchus heliobates) is one of the 14 species of Darwin\'s finches that only live in the Galapagos Islands. It is the rarest bird of the archipelago, with an estimated population of 100 individuals that inhabit only 30 hectares in two areas on Isabela Island. In collaboration with Rainforest Connection, we supported this project by providing acoustic devices installed in 34 sites where the mangrove Finch persists.',
        'Using Arbimon tools, we detected mangrove species in 26 sites. In addition, we have also detected the woodpecker finch (Vulnerable, IUCN Red List) in 34 sites. We have trained an AI model with precision of 0.78-0.98 to automatically detect both species in raw soundscape recordings to facilitate the detection, monitoring, protection, and recovery of these threatened birds.'
      ]
    },
    gallery: {
      images: []
    },
    feedback: [{
      text: 'The Arbimon platform has enabled us to use finch vocalizations to track their presence at time scales previously inaccessible. We essentially have tens of “researchers” stationed across Galapagos mangroves permanently listening for the presence of one of the world’s most range-restricted birds.',
      partnerName: 'XXX, Charles Darwin Foundation'
    }]
  },
  {
    id: 3,
    title: 'Reforestation & Restoration',
    featuredImage: 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80',
    descriptiveText: 'Assessment of restoration sites in supporting native fauna',
    location: 'Pontal do Paranapanema, Brazil',
    category: {
      id: 'restoration',
      name: 'Restoration'
    },
    header: {
      title: 'Monitoring the critically endangered mangrove finch',
      description: 'Arbimon makes it possible to establish holistic baselines of biodiversity presence in hotspots to improve our current and future understandings of ecosystem dynamics. ',
      projectName: 'Develop baseline biodiversity metrics in Gombe Stream National Park',
      applications: [
        'High-accuracy CNN (>90%) is facilitating ongoing automated detection and monitoring of endangered species across the archipelago.',
        'Results are being utilized to inform current finch distribution across all potential mangrove habitats to inform action.'
      ],
      timeline: '2022 - ongoing',
      scope: '34 Sampling sites, 2 Species monitored',
      partners: ['Charles Darwin Foundation'],
      services: ['Survey design', 'Expert species validation', 'Ecological analyses', 'AI modeled development'],
      sdgs: ['15']
    },
    content: {
      subtitle: 'Partnering with the Charles Darwin Foundation, Arbimon is facilitating important work to understand where the Critically Endangered mangrove finch is present using automated detections of their calls.',
      paragraphs: [
        'The Mangrove Finch (Camarhynchus heliobates) is one of the 14 species of Darwin\'s finches that only live in the Galapagos Islands. It is the rarest bird of the archipelago, with an estimated population of 100 individuals that inhabit only 30 hectares in two areas on Isabela Island. In collaboration with Rainforest Connection, we supported this project by providing acoustic devices installed in 34 sites where the mangrove Finch persists.',
        'Using Arbimon tools, we detected mangrove species in 26 sites. In addition, we have also detected the woodpecker finch (Vulnerable, IUCN Red List) in 34 sites. We have trained an AI model with precision of 0.78-0.98 to automatically detect both species in raw soundscape recordings to facilitate the detection, monitoring, protection, and recovery of these threatened birds.'
      ]
    },
    gallery: {
      images: []
    },
    feedback: [{
      text: 'The Arbimon platform has enabled us to use finch vocalizations to track their presence at time scales previously inaccessible. We essentially have tens of “researchers” stationed across Galapagos mangroves permanently listening for the presence of one of the world’s most range-restricted birds.',
      partnerName: 'XXX, Charles Darwin Foundation'
    }]
  },
  {
    id: 4,
    title: 'Climate Change Impact',
    featuredImage: 'https://images.unsplash.com/photo-1533004597346-abf021591221?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1828&q=80',
    descriptiveText: 'Assessing animal communities’ responses to climate change',
    location: 'Puerto Rico island-wide',
    category: {
      id: 'climate-change-impact',
      name: 'Climate Change Impact'
    },
    header: {
      title: 'Monitoring the critically endangered mangrove finch',
      description: 'Arbimon makes it possible to establish holistic baselines of biodiversity presence in hotspots to improve our current and future understandings of ecosystem dynamics. ',
      projectName: 'Develop baseline biodiversity metrics in Gombe Stream National Park',
      applications: [
        'High-accuracy CNN (>90%) is facilitating ongoing automated detection and monitoring of endangered species across the archipelago.',
        'Results are being utilized to inform current finch distribution across all potential mangrove habitats to inform action.'
      ],
      timeline: '2022 - ongoing',
      scope: '34 Sampling sites, 2 Species monitored',
      partners: ['Charles Darwin Foundation'],
      services: ['Survey design', 'Expert species validation', 'Ecological analyses', 'AI modeled development'],
      sdgs: ['15']
    },
    content: {
      subtitle: 'Partnering with the Charles Darwin Foundation, Arbimon is facilitating important work to understand where the Critically Endangered mangrove finch is present using automated detections of their calls.',
      paragraphs: [
        'The Mangrove Finch (Camarhynchus heliobates) is one of the 14 species of Darwin\'s finches that only live in the Galapagos Islands. It is the rarest bird of the archipelago, with an estimated population of 100 individuals that inhabit only 30 hectares in two areas on Isabela Island. In collaboration with Rainforest Connection, we supported this project by providing acoustic devices installed in 34 sites where the mangrove Finch persists.',
        'Using Arbimon tools, we detected mangrove species in 26 sites. In addition, we have also detected the woodpecker finch (Vulnerable, IUCN Red List) in 34 sites. We have trained an AI model with precision of 0.78-0.98 to automatically detect both species in raw soundscape recordings to facilitate the detection, monitoring, protection, and recovery of these threatened birds.'
      ]
    },
    gallery: {
      images: []
    },
    feedback: [{
      text: 'The Arbimon platform has enabled us to use finch vocalizations to track their presence at time scales previously inaccessible. We essentially have tens of “researchers” stationed across Galapagos mangroves permanently listening for the presence of one of the world’s most range-restricted birds.',
      partnerName: 'XXX, Charles Darwin Foundation'
    }]
  },
  {
    id: 5,
    title: 'Sustainable Supply Chain Monitoring',
    featuredImage: '',
    descriptiveText: 'Species specific and soundscape approaches to map biodiversity levels across land use categories',
    location: 'Borneo, Malaysia',
    category: {
      id: 'sustainable-supply-chain',
      name: 'Sustainable Supply Chain'
    },
    header: {
      title: 'Monitoring the critically endangered mangrove finch',
      description: 'Arbimon makes it possible to establish holistic baselines of biodiversity presence in hotspots to improve our current and future understandings of ecosystem dynamics. ',
      projectName: 'Develop baseline biodiversity metrics in Gombe Stream National Park',
      applications: [
        'High-accuracy CNN (>90%) is facilitating ongoing automated detection and monitoring of endangered species across the archipelago.',
        'Results are being utilized to inform current finch distribution across all potential mangrove habitats to inform action.'
      ],
      timeline: '2022 - ongoing',
      scope: '34 Sampling sites, 2 Species monitored',
      partners: ['Charles Darwin Foundation'],
      services: ['Survey design', 'Expert species validation', 'Ecological analyses', 'AI modeled development'],
      sdgs: ['15']
    },
    content: {
      subtitle: 'Partnering with the Charles Darwin Foundation, Arbimon is facilitating important work to understand where the Critically Endangered mangrove finch is present using automated detections of their calls.',
      paragraphs: [
        'The Mangrove Finch (Camarhynchus heliobates) is one of the 14 species of Darwin\'s finches that only live in the Galapagos Islands. It is the rarest bird of the archipelago, with an estimated population of 100 individuals that inhabit only 30 hectares in two areas on Isabela Island. In collaboration with Rainforest Connection, we supported this project by providing acoustic devices installed in 34 sites where the mangrove Finch persists.',
        'Using Arbimon tools, we detected mangrove species in 26 sites. In addition, we have also detected the woodpecker finch (Vulnerable, IUCN Red List) in 34 sites. We have trained an AI model with precision of 0.78-0.98 to automatically detect both species in raw soundscape recordings to facilitate the detection, monitoring, protection, and recovery of these threatened birds.'
      ]
    },
    gallery: {
      images: []
    },
    feedback: [{
      text: 'The Arbimon platform has enabled us to use finch vocalizations to track their presence at time scales previously inaccessible. We essentially have tens of “researchers” stationed across Galapagos mangroves permanently listening for the presence of one of the world’s most range-restricted birds.',
      partnerName: 'XXX, Charles Darwin Foundation'
    }]
  }
]