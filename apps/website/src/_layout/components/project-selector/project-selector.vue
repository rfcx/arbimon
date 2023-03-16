<template>
  <modal-popup
    title="select project"
    @emit-close="$emit('emitClose')"
  >
    <div class="p-4 h-156 flex flex-col">
      <!-- Title -->
      <div class="flex justify-between items-center">
        <h1 class="text-white text-lg">
          Select Project
        </h1>
        <icon-fa-close
          class="text-xs cursor-pointer"
          @click="$emit('emitClose')"
        />
      </div>

      <!-- Search Bar -->
      <el-input
        v-model="searchKeyword"
        placeholder="Filter projects"
        size="large"
        class="mt-4"
      >
        <template #suffix>
          <div class="inline-flex items-center">
            <icon-fas-search class="text-xs" />
          </div>
        </template>
      </el-input>

      <!-- Search results -->
      <project-list
        v-if="searchKeyword"
        class="mt-2 px-1"
        :no-projects-message="noProjectsMessageSearch"
        :projects="searchProjects"
        :selected-project="selectedProject"
        @select-project="setSelectedProject"
      />

      <!-- Tabs -->
      <el-tabs
        v-else
        v-model="activeTab"
        class="mt-2 px-1"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.label"
          :name="tab.id"
        >
          <project-list
            :no-projects-message="tab.noProjectsMessage"
            :projects="tab.projects"
            :selected-project="selectedProject"
            @select-project="setSelectedProject"
          />
        </el-tab-pane>
      </el-tabs>

      <!-- Buttons -->
      <div class="mt-auto text-right">
        <button
          class="btn mr-2"
          @click="$emit('emitClose')"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click="confirmSelectedProject"
        >
          Select
        </button>
      </div>
    </div>
  </modal-popup>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { LocationProjectForUser } from '@rfcx-bio/common/api-bio/project/projects'

import { useStore } from '~/store'
import projectList from './project-list.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const emit = defineEmits<{(e: 'emitClose'): void}>()

// Tabs
const myProjects = computed(() => store.projects.filter(p => p.isMyProject))
const showcaseProjects = computed(() => store.projects.filter(p => p.isShowcaseProject))

const tabIds = {
  myProjects: 'myProjects',
  showcaseProjects: 'showcaseProjects'
} as const

const tabs = computed(() => ([
  {
    id: tabIds.myProjects,
    label: 'My projects',
    projects: myProjects.value,
    noProjectsMessage: store.user ? 'You don\'t own any projects' : 'Please login to see your projects'
  },
  {
    id: tabIds.showcaseProjects,
    label: 'Showcase projects',
    projects: showcaseProjects.value,
    noProjectsMessage: 'No projects found'
  }
]))

const activeTab = ref(store.user
  ? tabIds.myProjects // default to my projects if logged in
  : tabIds.showcaseProjects // default to showcase if logged out
)

// Search
const searchKeyword = ref('')
const searchProjects = computed(() => searchKeyword.value
    ? store.projects
      .filter(({ name }) => name.toLowerCase().split(/[-_ ]+/).some(w => w.startsWith(searchKeyword.value.toLowerCase())))
      .sort((a, b) => a.name.localeCompare(b.name))
    : []
)
const noProjectsMessageSearch = 'No projects found'

// Selected project
const selectedProject = ref(store.selectedProject ?? null)
const setSelectedProject = (project: LocationProjectForUser) => {
  selectedProject.value = project
}

// Confirm/close
const confirmSelectedProject = async () => {
  if (!selectedProject.value) return emit('emitClose')

  // Update store for future navigation
  await store.updateSelectedProject(selectedProject.value)

  // If current route uses projectSlug, update it (guard will update store)
  if (route.params.projectSlug !== undefined) {
    await router.push({ params: { projectSlug: selectedProject.value.slug } })
  }

  emit('emitClose')
}

</script>
<style lang="scss" scoped>
@import "@/_styles/variables.scss";

:deep(.el-input__inner) {
  &:focus {
    border-color: #e5e7eb;
  }
}

:deep(.el-tabs__header) {
  margin: 0px;
}

:deep(.el-tabs__nav-wrap::after) {
  border-bottom: 2px solid $color-box-gray !important;
}
</style>
