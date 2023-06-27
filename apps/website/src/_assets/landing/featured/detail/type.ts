export interface ProjectCategory {
  id: string
  shortname: string
  name: string
}

export interface ProjectDetail {
  id: number
  category: ProjectCategory
  header: ProjectHeader
  content: ProjectContent
  gallery: ProjectGallery
  feedback: ProjectFeedback
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
  thumbnail: string
}

export interface ProjectContent {
  subtitle: string
  paragraphs: string[]
}

export interface ProjectGallery {
  images: string[]
}

export interface ProjectFeedback {
  text: string
  partnerName: string
  partnerRole: string
}
