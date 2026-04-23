<template>
  <table class="w-full text-left rtl:text-right table-auto mt-6">
    <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
      <tr>
        <th class="w-20 <sm:hidden">
          Id
        </th>
        <th class="py-3 min-w-56">
          Project
        </th>
        <th class="min-w-44">
          Tier
        </th>
        <th class="min-w-32">
          Recordings
        </th>
        <th class="min-w-28">
          Jobs
        </th>
        <th class="min-w-28">
          Collaborators
        </th>
        <th class="min-w-24">
          Guests
        </th>
        <th
          v-if="showActions"
          class="min-w-40"
        >
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      <template
        v-for="project in projects"
        :key="project.id"
      >
        <ProjectTieringRow
          :project="project"
          :show-actions="showActions"
          :selected-project-type="projectTierDrafts[project.id] ?? (project.projectType ?? 'free')"
          :is-saving-tier="savingProjectId === project.id"
          :is-expanded="expandedProjectId === project.id"
          @select-project="onSelectProject"
          @toggle-members="toggleMembers"
          @save-tier="saveProjectTier"
          @update:selected-project-type="value => updateProjectTierDraft(project.id, value)"
        />
        <tr
          v-if="expandedProjectId === project.id"
          class="border-b-1 border-util-gray-03"
        >
          <td
            :colspan="showActions ? 8 : 7"
            class="bg-util-gray-01 px-4 py-4"
          >
            <div
              v-if="isLoadingMembers"
              class="text-sm text-subtle"
            >
              Loading project members...
            </div>
            <div
              v-else-if="isMembersError"
              class="text-sm text-danger"
            >
              Unable to load project members.
            </div>
            <div
              v-else-if="(members?.length ?? 0) === 0"
              class="text-sm text-subtle"
            >
              No members found for this project.
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="member in sortedMembers"
                :key="member.userId"
                class="flex items-center justify-between rounded border border-util-gray-03 bg-white px-3 py-2 text-sm"
              >
                <div>
                  <div class="font-medium text-insight">
                    {{ member.firstName }} {{ member.lastName }}
                  </div>
                  <div class="text-subtle">
                    {{ member.email }}
                  </div>
                </div>
                <span class="rounded-full bg-util-gray-01 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-insight">
                  {{ getRoleLabel(member.roleId) }}
                </span>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { computed, inject, ref } from 'vue'

import { type ProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'
import { type SuperProjectSummary } from '@rfcx-bio/common/api-bio/super/projects'

import { apiClientKey } from '@/globals'
import { type Error } from '../../error'
import { useSuperGetProjectMembers } from '../../member/_composables/use-members'
import { useUpdateSuperProjectTier } from '../_composables/use-projects'
import ProjectTieringRow from './project-tiering-row.vue'

const props = withDefaults(defineProps<{
  projects: SuperProjectSummary[]
  showActions?: boolean
}>(), {
  showActions: true
})

const emit = defineEmits<{
  (event: 'select-project', project: SuperProjectSummary): void
}>()

const apiClientBio = inject(apiClientKey) as AxiosInstance
const queryClient = useQueryClient()

const expandedProjectId = ref<number | null>(null)
const expandedProjectIdRef = computed(() => expandedProjectId.value)
const membersEnabled = computed(() => expandedProjectId.value !== null)
const { data: members, isLoading: isLoadingMembers, isError: isMembersError } = useSuperGetProjectMembers(apiClientBio, expandedProjectIdRef, membersEnabled)

const projectTierDrafts = ref<Record<number, string>>({})
const savingProjectId = ref<number | null>(null)
const { mutateAsync: mutateProjectTier } = useUpdateSuperProjectTier(apiClientBio)

const sortedMembers = computed<ProjectMembersResponse>(() => {
  return [...(members.value ?? [])].sort((a, b) => {
    if (a.roleId === 4 && b.roleId !== 4) return -1
    if (a.roleId !== 4 && b.roleId === 4) return 1
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
    return nameA.localeCompare(nameB)
  })
})

const onSelectProject = (project: SuperProjectSummary): void => {
  emit('select-project', project)
}

const toggleMembers = (project: SuperProjectSummary): void => {
  expandedProjectId.value = expandedProjectId.value === project.id ? null : project.id
}

const updateProjectTierDraft = (projectId: number, projectType: string): void => {
  projectTierDrafts.value = {
    ...projectTierDrafts.value,
    [projectId]: projectType
  }
}

const saveProjectTier = async (project: SuperProjectSummary): Promise<void> => {
  const nextProjectType = projectTierDrafts.value[project.id] ?? project.projectType ?? 'free'
  if (nextProjectType === (project.projectType ?? 'free')) return

  savingProjectId.value = project.id
  try {
    await mutateProjectTier({
      projectId: project.id,
      payload: { projectType: nextProjectType as 'free' | 'premium' | 'unlimited' }
    })
    await queryClient.invalidateQueries({ queryKey: ['get-projects'] })
    await queryClient.invalidateQueries({ queryKey: ['get-super-users'] })
    await queryClient.invalidateQueries({ queryKey: ['get-super-user-projects'] })
  } finally {
    savingProjectId.value = null
  }
}

const getRoleLabel = (roleId: number): string => {
  if (roleId === 4) return 'Owner'
  if (roleId === 3) return 'Guest'
  if (roleId === 2) return 'Admin'
  return 'Collaborator'
}
</script>
