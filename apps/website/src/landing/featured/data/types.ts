export interface ProjectCategory {
  id: string
  name: string
}

export interface ProjectDetail {
  id: number
  title: string
  featuredImage: string
  location: string
  descriptiveText: string
  category: ProjectCategory
  header: ProjectHeader
  content: ProjectOverviewContent
  gallery: ProjectGallery | null
  feedback: ProjectFeedback[] | []
  impact: ProjectImpactContent | null
}

export interface ProjectHeader {
  title: string
  description: string
  projectName: string
  applications: string[]
  timeline: string
  scope: string
  partners: string[]
  services: string[]
  sdgs: string[] // sustainable development goals
}

export interface ProjectOverviewContent {
  subtitle: string
  paragraphs: string[]
}

export interface ProjectGallery {
  images: string[]
}

export interface ProjectFeedback {
  text: string
  partnerName: string
}

export interface ProjectImpactContent {
  text: string
}
