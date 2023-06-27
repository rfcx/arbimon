export interface FeaturedProject {
  category: string
  introText: string
  // projectName: string
  // timeline: string
  // scope: string
  // services: [string]
  // images: [string]
  // goals: [string]
}

export interface PartnerFeedback {
  text: string
  user: Partner
}

export interface Partner {
  name: string
  role: string
  title: string
}
