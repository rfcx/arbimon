import { getSequentially } from '@rfcx-bio/utils/async'

import { limitUnlessProtected } from '~/env'
import { getScientificNamesFromMock } from './input-from-mock-detections'
import { getWikiSummary } from './input-wiki'

const main = async (): Promise<void> => {
    // Get data from other sources
  const scientificNames = limitUnlessProtected(getScientificNamesFromMock())
  const wikiSpeciesKeyed = await getSequentially(scientificNames, getWikiSummary)

  // For now, just print the results
  // TODO: Push to DB
  console.info(wikiSpeciesKeyed)
}

await main()
