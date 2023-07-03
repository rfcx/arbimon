import { type ValueOf } from '@rfcx-bio/utils/utility-types'

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
  sdgs: SDGId[] // sustainable development goals
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

export const masterSDGs = {
  // TODO: fill in the rest of the SDGs
  G13: { id: '13', name: 'Climate action', image: '/src/_assets/landing/featured/sdgs/13.png' },
  G15: { id: '15', name: 'Life on land', image: '/src/_assets/landing/featured/sdgs/15.png' }
} as const

export type SDGId = ValueOf<typeof masterSDGs>['id']
