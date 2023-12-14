import { type ProjectObjective } from '../types'

// TODO: update the image urls
export const masterObjectiveTypes = {
  BioBaseline: { id: 100, slug: 'bio-baseline', description: 'Establish biodiversity baseline', shorten: 'Establish baseline', imageUrl: 'https://drive.google.com/uc?export=view&id=1GOsKAR7ZxUtGK3u5Gwiea-jIOP399Lj1' },
  MonitorSpecies: { id: 200, slug: 'monitor-species', description: 'Detect / monitor endangered species', shorten: 'Detect rare species', imageUrl: 'https://drive.google.com/uc?export=view&id=1bMAR_Na_Y2EYEywEMAHKIAiQyrr7Ej38' },
  MonitorIllegalAct: { id: 300, slug: 'monitor-illegal-act', description: 'Detect and monitor illegal activity', shorten: 'Detect illegal activity', imageUrl: 'https://drive.google.com/uc?export=view&id=1cVoSp54pb49ijl9xBSB8O6n6xLHUuKTz' },
  ImpactHuman: { id: 400, slug: 'impact-human', description: 'Evaluate impact of human activities on biodiversity', shorten: 'Evaluate human impact', imageUrl: 'https://drive.google.com/uc?export=view&id=1l4gjdtf35QWGWiYWhxV6UcyVf9_ZbxxF' },
  ImpactConservation: { id: 500, slug: 'impact-conservation', description: 'Evaluate impact of conservation initiatives on biodiversity', shorten: 'Evaluate conservation impact', imageUrl: 'https://drive.google.com/uc?export=view&id=1SmEMmfAfo99u7BudhqblrUNCHIEaJUDm' },
  Others: { id: 999, slug: 'others', description: 'Others', shorten: 'Others', imageUrl: 'https://drive.google.com/uc?export=view&id=1l4gjdtf35QWGWiYWhxV6UcyVf9_ZbxxF' }
}
