import axios from 'axios'

import { type LandingPublicationsResponse, type Publication } from '@rfcx-bio/common/api-bio/landing/landing-publications'

import { unpackAxiosError } from '~/api-helpers/axios-errors'
import { env } from '~/env'

// INFO: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values
interface GoogleSheetsResponse {
  range: string
  majorDimension: 'ROWS' | 'COLUMNS'
  values: string[][]
}

export const getPublications = async (): Promise<LandingPublicationsResponse> => {
  // TODO: Use actual sheet
  const spreadsheetId = '10jeiNtSLxa3yoox-_T3nH_LI0-1M4KyPMck0527Jcic'
  const range = 'A:J'

  try {
    const response = await axios.get<GoogleSheetsResponse>(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!${range}`, {
      headers: {
        'x-goog-api-key': env.GOOGLE_SPREADSHEET_API_KEY
      }
    })

    // removes the first row that are the column names. Then start mapping
    return response.data.values.slice(1).map(v => {
      return {
        type: v[0] as Publication['type'],
        author: v[1],
        year: Number(v[2]),
        title: v[3],
        journal: v[4],
        doiUrl: v[5],
        isRFCxAuthor: v[6].toLowerCase() === 'yes' || v[6].toLowerCase() === 'y',
        orgMention: v[7],
        uses: v[8],
        citations: Number(v[9])
      }
    })
  } catch (e) {
    return unpackAxiosError(e)
  }
}
