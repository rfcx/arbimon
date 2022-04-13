<template>
  <div class="py-4">
    <p
      v-if="projects.length === 0"
      class="text-subtle italic"
    >
      {{ noProjectsMessage }}
    </p>
    <div
      v-else
      class="h-100 flex flex-col"
    >
      <table class="w-full table-fixed">
        <tr class="h-8 align-top">
          <th class="w-8" />
          <th>Name</th>
          <th class="text-subtle">
            ID
          </th>
        </tr>
        <tr
          v-for="project in projectsForCurrentPage"
          :key="project.id"
          class="cursor-pointer leading-loose"
          @click="$emit('selectProject', project)"
        >
          <td>
            <icon-fa-check
              v-if="project.id === selectedProject?.id"
              class="text-xs"
            />
          </td>
          <td class="w-24 truncate">
            <span :title="project.name">
              {{ project.name }}
            </span>
          </td>
          <td class="w-24 truncate text-subtle sm:w-60">
            <span :title="project.slug">
              {{ project.slug }}
            </span>
          </td>
        </tr>
      </table>
      <el-pagination
        v-if="projects.length > PAGE_SIZE"
        v-model:currentPage="currentPage"
        class="mt-auto text-right"
        :page-size="PAGE_SIZE"
        :total="projects.length"
        layout="prev, pager, next"
        small
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineEmits, defineProps, ref } from 'vue'

import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

const props = defineProps<{
  readonly selectedProject: LocationProjectForUser | null,
  readonly projects: LocationProjectForUser[],
  readonly noProjectsMessage: string
}>()

defineEmits<{(e: 'selectProject', project: LocationProjectForUser): void}>()

const PAGE_SIZE = 10
const currentPage = ref(1)
const projectsForCurrentPage = computed(() => props.projects.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))
</script>
