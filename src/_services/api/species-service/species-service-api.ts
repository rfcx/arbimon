// TODO ???: Make the real API

import axios from 'axios'

import { endpointWiki } from '../../api-helpers/rest'

// =================== WIKI ====================
export const getSpeciesThumbnailImage = async (speciesName: string): Promise<any> => {
  const { method, url } = endpointWiki

  const params = {
    action: 'query',
    format: 'json',
    titles: speciesName,
    prop: 'pageimages',
    piprop: 'original',
    origin: '*'
  }

  try {
    const response = await axios({
      method,
      url,
      params
    })
    return response.data
  } catch {
    //
  }
}
