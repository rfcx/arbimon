import { computed, ComputedRef } from 'vue'

import { ProjectFiltersResponse } from '@rfcx-bio/common/api-bio/common/project-filters'
import { mapIfDefined } from '@rfcx-bio/utils/fp'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { useApiQuery } from '~/api/use-api-query'
import { Loadable, queryAsLoadable } from '~/loadable'
import { useStore } from '~/store'
import { projectService } from './project-service'

const getLoadable = () => {
  const store = useStore()
  const projectId = computed(() => store.selectedProject?.id)

  const query = useApiQuery(
    ['fetch-project-filter', projectId],
    async () => await mapIfDefined(projectId.value, projectService.getProjectFilters)
  )

  return queryAsLoadable(query, isDefined)
}

// Export
let loadable: ComputedRef<Loadable<ProjectFiltersResponse, unknown>> | undefined
export const useProjectData = (): ComputedRef<Loadable<ProjectFiltersResponse>> => loadable ??= getLoadable()
