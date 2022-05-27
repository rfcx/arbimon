import { InjectFunction } from './get-inject'

// TODO: Perhaps reuse common types after merging loading branch
export interface DatasetInjectAndParams {
  inject: InjectFunction
  getUrl: (params: { projectId: string }) => string
  projectId: string
  query: {
    startDate: string
    endDate: string
    siteIds?: string | string[]
    taxons?: string | string[]
  }
}
