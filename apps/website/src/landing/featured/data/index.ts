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
    }],
    impact: {
      text: 'This collaboration will result in an establishment of a biodiversity baseline to assess how animal communities change over time and under different conservation practices. Simultaneously, partners and local organizations will be trained on all activities and empowered to lead both the management of the project as well as continued biodiversity analyses to create the building blocks for a long-term project. The next steps are to establish permanent monitoring stations and use new datasets collected to answer critical questions that will inform the management of the park, create value, and inform community health programs.'
    }
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
    }],
    impact: {
      text: 'Historically, the mangrove finch was distributed across the mangroves in the Galapagos - its current range is restricted to only 30 ha on North West Isabela Island. For the past four years, the Charles Darwin Foundation has started to find success in implementing rat control practices (to reduce predation) and through artificial incubation programs. With this success, the next question that has lingered is - are there any other small populations that we don’t know about? And what are the best mangroves to repopulate first? We are starting to answer these questions with our partnership. The known existing population was recorded in 2022 to create models and better understand their communications. In 2023, devices are being deployed across the remaining 13 mangroves. This will inform how to proceed with the current breeding program and if there are other fragmented small populations that can be linked with the known population to create greater genetic diversity and expand their range. '
    }
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
      description: 'Reforestation is occurring across global ecosystems to build corridors and restore habitats that have been lost. Ecoacoustics can track the return of native fauna, measure impact, and inform best practices.',
      projectName: 'Assess restoration sites in supporting native fauna in Pontal do Paranapanema',
      applications: [
        '178 species are being monitored across Atlantic Forest restoration sites to track change year-over-year',
        'Results have already proven reforested sites are host to a similar number of bird species as protected sites and impact is shown in as little as five years'
      ],
      timeline: '2021 - ongoing',
      scope: '34 Sampling sites, 2 Species monitored',
      partners: ['IPÊ & WeForest'],
      services: [
        'Survey design',
        'Species manual validation and identification',
        'Soundscape analysis',
        'Species richness analyses',
        'Species occupancy analyses',
        'Species composition analyses'
      ],
      sdgs: ['13', '15']
    },
    content: {
      subtitle: 'Partnering with WeForest & IPÊ, Arbimon is facilitating the analysis of biodiversity across reforested regions in Pontal.',
      paragraphs: [
        'The remaining 12% of the Atlantic Forest is still among the most biologically rich and diverse forests in the world and exhibits a high number of species that can be found nowhere else on Earth. WeForest and IPÊ have been collaborating to reconnect the forest patches in a fragmented landscape in São Paulo, Brazil, creating more habitat for animals such as the endangered black lion tamarin. The main goal of this study is to establish a comprehensive understanding of how restoration sites affect species distribution, composition, and richness.',
        'Therefore, we aim to evaluate the performance of restoration sites to enhance and protect biodiversity. More specifically, we aim to test if restoration sites are functioning as wildlife corridors by assessing spatial patterns of biodiversity, at both the species- and community-level, in a fragmented landscape in the Atlantic Forest in Brazil.'
      ]
    },
    gallery: {
      images: []
    },
    feedback: [{
      text: 'Arbimon has provided valuable insights into how WeForest reforestation is impacting the ecosystem. Additionally, it creates an easily accessible transparency dashboard that can be utilized by a variety of stakeholders.',
      partnerName: 'XXX, WeForest'
    }],
    impact: {
      text: 'Year-over-year data collection is providing insights on how biodiversity is returning to reforested sites across the Atlantic Forest in Brazil. WeForest supports local communities planting trees in critical regions to restore. Arbimon is monitoring both within and outside restoration sites to understand the health of the forest and which regions need to prioritize being linked and which corridors need to be widened - areas have been directly selected as a result of this study. The data is not only actively informing how WeForest is expanding their corridors to connect the large fragments and protected areas in the region, but it is providing content to drive funding to this cause. Nike has supported their efforts to plant 1 million trees, and the acoustic data is fueling the communications campaign incentivizing Nike to support these activities.'
    }
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
      title: 'Climate Change Impact',
      description: 'Climate change is having significant impacts on global biodiversity patterns and extinction rates. Ecoacoustic monitoring allows us to understand trends at both the species and ecosystem levels to create proactive conservation plans.',
      projectName: 'Develop baseline biodiversity metrics in Gombe Stream National Park',
      applications: [
        'Island-wide maps of biodiversity presence across Puerto Rico over time',
        'CNN for ~40 species to automate the detection of species with a focus on threatened and endemic species'
      ],
      timeline: '2021 - ongoing',
      scope: '944 Sites, 96 Species',
      partners: [
        'United State Fish & Wildlife Services',
        'Departamento de Recursos Naturales y Ambientales de Puerto Rico, Para La Naturaleza'
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
        'To improve knowledge about the distribution of bird, amphibian, and mammal species that occur in Puerto Rico, Arbimon, in partnership with the US Fish and Wildlife Service, Departamento de Recursos Naturales y Ambientales de Puerto Rico, and the Para la Naturaleza Foundation conducted an island-wide survey using ecoacoustic monitoring. The survey focused on the lowlands and coastal areas on the main island of Puerto Rico, a selection of elevational gradients in the mountainous regions, and the major offshore islands of Culebra, Desecheo, Mona and Vieques. Acoustic recorders and the analytical tools in Arbimon have been used to collect data from over 900 sites across the archipelago yearly during the three month peak of bird breeding season.',
        'This project aims to evaluate climate change\'s impact on species\' spatial distribution in a tropical island ecosystem using a decade of acoustic monitoring data. Our results indicate that the distributions of several bird and frog species are positively affected by precipitation, and the proportion of canopy cover and species are shifting toward high-elevation areas due to climate change. The study also found that drought has a stronger negative effect on bird communities than a hurricane of category 4. In addition, the results indicate that there may need to be more than the present amount of protected areas to safeguard bird species under climate change.'
      ]
    },
    gallery: {
      images: []
    },
    feedback: [{
      text: 'With Arbimon, we have created the first-ever standardized island-wide maps of biodiversity presence using data from across the island. We are hopeful in how this will inform our ability to fight extinction across this important archipelago.',
      partnerName: 'XXX, USFWS'
    }],
    impact: {
      text: 'Some important findings include that Puerto Rico will be drier under current climate change scenarios, but animal populations are positively correlated with rainfall and forest cover. There is a mismatch between current protected areas and remaining suitable bird habitats under climate change scenarios, demonstrating the need for larger, more connected protected areas and buffer zones. As a result, USFWS, Departamento de Recursos Naturales y Ambientales de Puerto Rico, and the Para la Naturaleza Foundation are utilizing project results to inform action. They are determining land acquisition priorities by using the maps of species of interest and analyzing community change in the restoration areas. Additionally, this data is being used to  update the distribution status of resident species on the island, as well as species in Greater Conservation Need (SGCN of the State Wildlife Action Plan, SWAP). With the information collected and the recommendations in Arbimon reports, they are about to start other projects focused on the areas and species that need additional conservation actions, particularly birds. They have as a long-term goal to use the digitized data to continue identifying gaps in biodiversity information, carry out an updated distribution of species and generate important habitat layers. In addition, they seek to create connectivity and buffer zones from the impact of sea level rise.'
    }
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
      title: 'Sustainable Supply Chain Monitoring',
      description: 'As we transition away from monoculture plantations and improve agricultural practices, it is important to understand which approaches are most effective for creating positive change. Ecoacoustic monitoring makes it possible to track health progress across agricultural and agroforestry sites.',
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
      images: []
    },
    feedback: [{
      text: 'Arbimon has made it possible to holistically track species presence in a way we have not been able to before. This data is extremely valuable to inform how we prioritize local initiatives to support biodiversity moving forward',
      partnerName: 'XXX, Ecoculture'
    }],
    impact: {
      text: 'Ecoculture’s mission is to develop landscape restoration projects that promote a culture of conservation. By working closely with local communities, they are able to create value for the ecosystems, including the people calling them home. These results will be used to prioritize highest-value land management approaches and arm Ecoculture with the data required to measure impact across their projects. It was found that soundscapes from primary forest and restoration sites are similar, suggesting that restoration sites are able to maintain high biodiversity levels. Therefore, it is important to continue forward with these high-value projects.'
    }
  }
]
