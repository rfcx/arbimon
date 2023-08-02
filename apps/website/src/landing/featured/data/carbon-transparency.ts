import carbonFeaturedImg from '@/_assets/featured-work/carbon-transparency/1.webp'
import carbonGal1Img from '@/_assets/featured-work/carbon-transparency/2.webp'
import carbonGal2Img from '@/_assets/featured-work/carbon-transparency/3.webp'
import { type ProjectDetail } from './types'

export const carbonTransparency: ProjectDetail = {
  id: 4,
  title: 'Carbon transparency',
  featuredImage: carbonFeaturedImg,
  descriptiveText: 'Creating transparency around positive change in ecosystem health is a critical component of the carbon market, and ecoacoustics enables traceable biodiversity data to support both reporting on standards and communicating project results to stakeholders.',
  location: 'Kenya',
  category: {
    id: 'carbon-transparency',
    name: 'Carbon Transparency'
  },
  header: {
    projectName: 'Carbon project biodiversity health across Kenyan agroforestry sites',
    applications: [
      'Long-term monitoring of over 100 species across agroforestry sites',
      'Insights featuring maps, graphs, and figures for measurement and reporting'
    ],
    timeline: '2023 - ongoing',
    scope: '944 Sites, 96 Species',
    partners: [
      'Aspiration, Inc.',
      'Trees for the Future (TREES)'
    ],
    services: [
      'Hardware provider',
      'Species List',
      'Expert species validations',
      'Multi-species occupancy models',
      'AI model development',
      'Soundscape Analysis'
    ],
    sdgs: ['13']
  },
  content: {
    subtitle: 'Trees for the Future (TREES), and Aspiration are piloting the use of bioacoustic monitoring technology to measure biodiversity among agroforestry sites in Kenya. The pilot will test the use of bioacoustic tools as digital MRV tools for a project seeking Climate, Community & Biodiversity (CCB) certification. Numerous ALM, ARR, REDD+, and other nature-based projects offer biodiversity protections and enhancement in addition to their climate benefits. However, traditional field methods for measuring and monitoring biodiversity can be labor intensive and may  fall short in capturing the full range of biodiversity impact.',
    paragraphs: [
      'Aspiration, a high-impact climate finance company, has recently invested $21 million in carbon projects through Trees for the Future (TREES), a nonprofit organization dedicated to training farmers in sustainable agroforestry practices across sub-Saharan Africa. This strategic partnership aims to empower TREES to extend essential support and training to over 15,000 farmers in and around the Lake Victoria Watershed in western Kenya. The ultimate goal is to facilitate the planting of an impressi ve 87 million trees, effectively establishing 15,000 hectares of regenerative agroforestry land. Through this collective effort, the restoration initiative is projected to generate 4.13 million Verified Carbon Units (VCUs) while simultaneously aiding farmers in adapting to the ever-growing challenges posed by climate change.',
      'Arbimon is enabling large-scale tracking of biodiversity benefits across farming sites utilizing the TREES’ Forest Garden approach. By tracking biodiversity using sound, we are able to inform the effectiveness of the approach on native fauna benefits, create project transparency, and report against carbon standards.'
    ]
  },
  gallery: {
    images: [carbonGal1Img, carbonGal2Img]
  },
  feedback: [{
    text: 'Partnering with Rainforest Connection has enabled us to bring a greater level of technical measurement, transparency and confidence to our biodiversity impact monitoring and reporting',
    partnerName: 'Tracy Bain, Senior Director of Carbon Monitoring & Engagement, Aspiration'
  }],
  impact: {
    cta: {
      text: 'Learn more',
      link: 'https://blog.aspiration.com/aspiration-partners-with-trees-for-the-future/#:~:text=Aspiration%2C%20a%20high%2Dimpact%20climate,practices%20across%20sub%2DSaharan%20Africa'
    },
    image: carbonFeaturedImg,
    paragraphs: [
      `TREES has an impressive track record since its establishment in 1989, having successfully planted over 300 million trees in collaboration with farming communities worldwide. At the core of their approach lies the innovative "Forest Garden Approach," which empowers farmers to transform their land by incorporating thousands of fast-growing, ecologically appropriate trees alongside dozens of other crops. This strategy not only presents new economic possibilities for the farmers but also benefits their communities significantly. Specifically, in the Lake Victoria Watershed project, each Forest Garden will comprise an average of 5,800 trees per hectare, culminating in an astounding total of 4.13 million metric tonnes of CO2 removal from the atmosphere over a span of 20 years.
      Furthermore, the integration of bioacoustics monitoring capabilities adds an extra layer of scalability and understanding to the impact of the Forest Garden Approach on native fauna. This innovation also enhances transparency for carbon project verification, ensuring the credibility and effectiveness of the initiative. With this comprehensive and conscientious approach, Aspiration's investment in carbon projects through TREES promises to foster both ecological restoration and sustainable development in the face of climate change.
      `
    ]
  }
}
