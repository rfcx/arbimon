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

export const analysis = {
  analyzer: {
    country_synonym_analyzer: {
      tokenizer: 'standard',
      filter: [
        'country_synonym_filter'
      ]
    },
    objective_synonym_analyzer: {
      tokenizer: 'standard',
      filter: [
        'objective_synonym_filter'
      ]
    }
  },
  filter: {
    country_synonym_filter: {
      type: 'synonym',
      synonyms: getCountrySynonyms()
    },
    objective_synonym_filter: {
      type: 'synonym',
      synonyms: [
        'Establish biodiversity baseline, Establish baseline => bio-baseline',
        'Detect / monitor endangered species, Detect rare species => monitor-species',
        'Detect and monitor illegal activity, Detect illegal activity => monitor-illegal-act',
        'Evaluate impact of human activities on biodiversity, Evaluate human impact => impact-human',
        'Evaluate impact of conservation initiatives on biodiversity, Evaluate conservation impact => impact-conservation'
      ]
    }
  }
}
