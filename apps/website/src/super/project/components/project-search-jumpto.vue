<template>
  <div class="relative w-full my-6">
    <form class="flex flex-col gap-4">
      <div
        id="projectDropdownTrigger"
        class="flex relative items-center"
        data-dropdown-toggle="projectDropdown"
      >
        <input
          v-model="keyword"
          class="block bg-moss border-util-gray-03 rounded-md w-full placeholder:text-insight focus:(border-frequency ring-frequency)"
          type="text"
          placeholder="Search to find a project"
          :disabled="selectedProject !== null"
          @focus="hasFocusInput = true"
          @blur="hasFocusInput = false"
        >
        <span
          class="absolute right-4 cursor-pointer"
        >
          <icon-fa-chevron-down
            v-if="selectedProject === null"
            class="w-3 h-3 fa-chevron-down text-util-gray-03"
            :class="hasFocusInput ? 'transform rotate-180' : ''"
          />
          <svg
            v-else
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
            @click="onClearInput()"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </span>
      </div>
    </form>
    <div
      id="projectDropdown"
      class="absolute hidden w-5/6 left-4 z-60 bg-white rounded-md shadow dark:bg-moss mt-2 border-util-gray-03 border-1"
    >
      <ul class="overflow-y-auto max-h-80 border-cloud bg-moss rounded-md">
        <template v-if="filteredProjects.length === 0">
          <li
            v-if="filteredProjects.length === 0"
            class="rounded-lg p-4 text-center text-sm"
          >
            No matching projects
          </li>
        </template>
        <template v-else>
          <li
            v-for="project in filteredProjects"
            :key="'project-selector-' + project.id"
            :label="project.name"
            class="cursor-pointer rounded-md px-4 py-2 hover:bg-util-gray-03 text-sm"
            @click="onSelectedProject(project)"
          >
            {{ project.name }}
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
</script>

<script setup lang="ts">
import { initDropdowns } from 'flowbite'
import { onMounted, ref } from 'vue'

interface Project {
  id: number
  name: string
}

const selectedProject = ref<Project | null>(null)

// search
const keyword = ref('')

const hasFocusInput = ref(false)

onMounted(() => {
  initDropdowns()
})

// keyword
const filteredProjects = ref([{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }, { id: 3, name: 'P3' }])

const onSelectedProject = (project: Project) => {
  keyword.value = project.name
  selectedProject.value = project
}

const onClearInput = () => {
  keyword.value = ''
  selectedProject.value = null
}
</script>
