import { computed, ComputedRef, readonly, Ref } from 'vue'

import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { useApiQuery } from '~/api/use-api-query'
import { Loadable, queryAsLoadable } from '~/loadable'
import { useStore } from '~/store'
import { projectService } from './project-service'

const getLoadable = (): ComputedRef<Loadable<ProjectFiltersResponse, unknown>> => {
  const store = useStore()
  const projectId = computed(() => store.selectedProject?.id)

  const query = useApiQuery(
    ['fetch-project-filter', projectId],
    async () => {
      if (projectId.value === undefined) return undefined
      return await projectService.getProjectFilters(projectId.value)
    }
  )

  return queryAsLoadable(query, isDefined)
}

// Export as singleton
let loadable: ComputedRef<Loadable<ProjectFiltersResponse, unknown>> | undefined
export const useProjectData = (): Ref<Loadable<ProjectFiltersResponse>> => { loadable ??= getLoadable(); return readonly(loadable) }
