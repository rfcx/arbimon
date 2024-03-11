import { countries } from 'countries-list'

// Refers to `TCountryCode` union for the keys
const additionalSynonyms: Record<string, string[]> = {
  US: ['USA'],
  TH: ['ไทย'],
  GB: ['Great Britain']
}

const getCountrySynonyms = (): string[] => {
  const synonyms = Object.entries(countries).map(value => {
    const synonyms = [value[1].name, value[1].native]

    if (additionalSynonyms[value[0]] !== undefined) {
      synonyms.push(...additionalSynonyms[value[0]])
    }

    return `${synonyms.join(', ')} => ${value[0]}`
  })

  return synonyms
}

const analysis = {
  analyzer: {
    country_synonym_analyzer: {
      tokenizer: 'standard',
      filter: [
        'country_synonym_filter'
      ]
    },
    objective_synonym_analyzer: {
      tokenizer: 'keyword',
      filter: ['objective_synonym_filter']
    }
  },
  filter: {
    country_synonym_filter: {
      type: 'synonym',
      synonyms: getCountrySynonyms()
    },
    objective_synonym_filter: {
      ignore_case: 'true',
      type: 'synonym',
      synonyms: [
        'biodiversity, baseline => bio-baseline',
        'monitor, endangered, species, rare => monitor-species',
        'illegal, act => monitor-illegal-act',
        'human, impact => impact-human',
        'conservation, initiatives => impact-conservation'
      ]
    }
  }
}

export const getAnalysis = (): typeof analysis => {
  return analysis
}
