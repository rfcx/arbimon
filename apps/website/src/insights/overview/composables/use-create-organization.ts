import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type CreateOrganizationRequestBody, type CreateOrganizationResponseBody, apiBioCreateOrganization } from '@rfcx-bio/common/api-bio/organizations/create-organization'

export const useCreateOrganization = (apiClient: AxiosInstance): UseMutationReturnType<CreateOrganizationResponseBody, unknown, CreateOrganizationRequestBody, unknown, unknown> => {
  return useMutation({
    mutationKey: ['create-organization'],
    mutationFn: async (value: CreateOrganizationRequestBody) => {
      return await apiBioCreateOrganization(apiClient, value.name, value.type, value.url)
    }
  })
}
