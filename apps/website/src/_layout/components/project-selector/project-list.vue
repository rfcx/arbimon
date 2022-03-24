<template>
  <div>
    <div class="text-lg text-subtle">
      {{ title }}
    </div>
    <div
      v-if="projects.length > 0"
      class="h-40 divide-y divide-gray-500"
    >
      <div
        v-for="(project, idx) in props.projects"
        :key="'project-list-' + idx"
        class="flex justify-between text-white cursor-pointer hover:bg-steel-grey-dark py-2 px-1"
        :class="{ 'bg-steel-grey-dark': selectedProject?.id === project.id }"
        @click="emit('emitSelectProject', project)"
      >
        {{ project.name }}
        <!-- TODO ??? - Replace old icons -->
        <icon-fa-check v-if="selectedProject?.id === project.id" />
      </div>
    </div>
    <div
      v-else
      class="h-40 italic text-subtle py-2 px-1"
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
