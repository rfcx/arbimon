export const masterObjectiveTypes = {
  BioBaseline: { id: 100, slug: 'bio-baseline', description: 'Establish biodiversity baseline', shorten: 'Establish baseline', imageUrl: 'static://project/bio-baseline.png' },
  MonitorSpecies: { id: 200, slug: 'monitor-species', description: 'Detect / monitor endangered species', shorten: 'Detect rare species', imageUrl: 'static://project/monitor-species.png' },
  MonitorIllegalAct: { id: 300, slug: 'monitor-illegal-act', description: 'Detect and monitor illegal activity', shorten: 'Detect illegal activity', imageUrl: 'static://project/monitor-illegal-act.png' },
  ImpactHuman: { id: 400, slug: 'impact-human', description: 'Evaluate impact of human activities on biodiversity', shorten: 'Evaluate human impact', imageUrl: 'static://project/impact-human.png' },
  ImpactConservation: { id: 500, slug: 'impact-conservation', description: 'Evaluate impact of conservation initiatives on biodiversity', shorten: 'Evaluate conservation impact', imageUrl: 'static://project/impact-conservation.png' },
  Others: { id: 999, slug: 'others', description: 'Others', shorten: 'Others', imageUrl: 'static://project/others.png' }
}

export const masterObjectiveValues = Object.values(masterObjectiveTypes)
