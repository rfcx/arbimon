<template>
  <div>
    <div class="px-4 text-subtle">
      {{ title }}
    </div>
    <div
      v-if="projects.length > 0"
      class=" h-40 divide-y divide-gray-500 overflow-y-auto"
    >
      <div
        v-for="(project, idx) in props.projects"
        :key="'project-list-' + idx"
        class="flex justify-between text-white cursor-pointer py-2 mx-4"
        :class="{ 'font-bold': selectedProject?.id === project.id }"
        @click="emit('emitSelectProject', project)"
      >
        {{ project.name }}
        <!-- TODO ??? - Replace old icons -->
        <icon-fa-check v-if="selectedProject?.id === project.id" />
      </div>
    </div>
    <div
      v-else
      class="h-40 italic text-subtle py-2 mx-2"
    >
      None
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps } from 'vue'

import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'

interface Props {
  title: string
  projects: LocationProjectForUser[]
  selectedProject: LocationProjectForUser
}

interface Emits {
  (ev: 'emitSelectProject', project: LocationProjectForUser): LocationProjectForUser
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

</script>
