import axios from 'axios'
import { maxBy } from 'lodash-es'

import { type OrganizationTypes } from '@rfcx-bio/common/dao/types'

import { unpackAxiosError } from '~/api-helpers/axios-errors'
import { create } from './create-organization-dao'

export interface Logo {
  url: string
  width: number
  height: number
  format: string
  bytes: number
  error: string | null
  sha1sum: string
}

export interface GetOrganizationLogoResponse {
  url: string
  icons: Logo[]
}

export const createOrganization = async (organization: Omit<OrganizationTypes['light'], 'id'>): Promise<OrganizationTypes['light']> => {
  const image = await getOrganizationLogoLink(organization.url)
  return await create({ ...organization, image: image ?? undefined })
}

const getOrganizationLogoLink = async (url: string): Promise<string | null> => {
  try {
    const response = await axios.get<GetOrganizationLogoResponse>('https://besticon-demo.herokuapp.com/allicons.json', {
      params: {
        url
      }
    })

    // If the length is only one, we take it immediately.
    // If the length is not one. We find and take the biggest one
    if (response.data.icons.length === 0) {
      return null
    }

    if (response.data.icons.length === 1) {
      return response.data.icons[0].url
    }

    const biggestImage = maxBy(response.data.icons, (l) => l.height)

    if (biggestImage == null) {
      return null
    }

    return biggestImage.url
  } catch (e) {
    return unpackAxiosError(e)
  }
}
