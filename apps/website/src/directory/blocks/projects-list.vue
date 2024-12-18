<template>
  <div
    id="drawer-navigation"
    class="inset-y-auto left-0 fixed w-98 overflow-y-auto transition-transform -translate-x-full bg-moss selected:bg-pitch"
    tabindex="-1"
    aria-labelledby="drawer-navigation-label"
  >
    <div
      v-if="isError && !isLoading"
      class="flex items-center justify-center h-screen text-center text-sm"
    >
      <span>
        It seems the projects didn’t load as expected<br>
        Please refresh your browser to give it another go.
      </span>
    </div>
    <div class="h-full overflow-y">
      <ul
        v-infinite-scroll="loadMore"
        :infinite-scroll-distance="20"
      >
        <li class="p-6 relative sticky top-0 bg-moss border-b-1 border-util-gray-02">
          <form
            class="w-full"
            autocomplete="off"
          >
            <div class="relative">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <span class="p-2">
                  <icon-custom-ic-search
                    class="w-5 h-5 text-insight stroke-insight"
                    storke="white"
                  />
                </span>
              </div>
              <input
                id="searchInput"
                v-model="searchKeyword"
                name="search"
                type="text"
                class="search-input text-insight shadow-lg shadow-frequency/10"
                placeholder="Search for projects"
                @input="emitSearch(searchKeyword)"
                @focus="isSearchBoxFocused = true"
                @blur="isSearchBoxFocused = false"
              >
            </div>
            <label
              v-if="isSearchBoxFocused"
              class="block mt-4 text-xs font-medium text-fog"
            >
              Search for project names, species names, IUCN status, summary, countries, or objectives
            </label>
            <div class="flex items-center mt-4">
              <input
                type="checkbox"
                class="w-4 h-4 border border-util-gray-01 rounded bg-gray-50 focus:(ring-0 outline-none) dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                :checked="isSelectedPublishedProjects"
                @click="togglePublishedProjects()"
              >
              <label class="font-light text-gray-500 dark:text-util-gray-01 ml-2">Only projects with published insights</label>
            </div>
          </form>
        </li>
        <li v-if="false">
          <ul class="p-6 border-b border-chirp text-frequency flex flex-row gap-10">
            <li
              class="cursor-pointer font-medium"
              :class="{'border-frequency border-b-4': selectedTab === 'All'}"
              @click="emitSwapTab('All')"
            >
              All
            </li>
            <li
              class="cursor-pointer font-medium"
              :class="{'border-frequency border-b-4': selectedTab === 'My projects'}"
              @click="emitSwapTab('My projects')"
            >
              My projects
            </li>
          </ul>
        </li>
        <li
          v-if="!props.isLoading && noResults"
          class="p-6 inset-0 flex flex-col text-center text-insight items-center justify-center"
        >
          <span class="text-base font-header">
            No Results Found.
          </span>
          <span class="text-xs">
            Your search did not return any matches. <br>
            Please double-check the spelling, or consider using alternative keywords, such as specific species names or project titles.
          </span>
        </li>
        <div v-else>
          <project-list-item
            v-for="p in dataWithMetrics"
            :key="p.id"
            :project="p"
            :is-selected="p.id === props.selectedProjectId"
            @click="emitSelectedProject(p.id)"
          />
        </div>
        <li
          v-if="isLoading"
          class="p-6 inset-0 flex text-center text-insight items-center justify-center"
        >
          <icon-custom-ic-loading class="h-5 w-5" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useProjectDirectoryStore } from '~/store'
import ProjectListItem from '../components/project-list-item.vue'
import type { ProjectLight, ProjectProfileWithMetrics, Tab } from '../data/types'

const props = defineProps<{ data: ProjectLight[], selectedProjectId: number | undefined, selectedTab: Tab, isLoading: boolean, initialSearch: string, noResults: boolean, isError: boolean }>()
const emit = defineEmits<{(e: 'emitSelectedProject', projectId: number): void, (e: 'emitLoadMore', isSelectedPublishedProjects: boolean): void, (e: 'emitLoadPublishedProjects', isSelectedPublishedProjects: boolean): void, (e: 'emitSearch', keyword: string, isSelectedPublishedProjects: boolean): void, (e: 'emitSwapTab', tab: Tab): void
}>()

const pdStore = useProjectDirectoryStore()

const isSearchBoxFocused = ref(false)
const isSelectedPublishedProjects = ref(false)
const searchKeyword = ref(props.initialSearch)

const dataWithMetrics = computed((): ProjectProfileWithMetrics[] => {
  if (props.selectedTab === 'All' && searchKeyword.value === '') {
    return pdStore.allProjectsWithMetrics
  } else {
    const id = props.data.map((p: ProjectLight): number => p.id)
    return pdStore.getProjectWithMetricsByIds(id)
  }
})

const emitSwapTab = (tab: Tab) => {
  emit('emitSwapTab', tab)
}

const loadMore = () => {
  // hotfix: disable infinite scroll when search keyword is not empty - remove this when explore page supports infinite scroll with search
  if (searchKeyword.value !== '') return
  emit('emitLoadMore', isSelectedPublishedProjects.value)
}

const emitSelectedProject = (projectId: number) => {
  emit('emitSelectedProject', projectId)
}

const emitSearch = (keyword: string) => {
  emit('emitSearch', keyword, isSelectedPublishedProjects.value)
}

const togglePublishedProjects = () => {
  isSelectedPublishedProjects.value = !isSelectedPublishedProjects.value
  if (searchKeyword.value !== '') emitSearch(searchKeyword.value)
  else emit('emitLoadPublishedProjects', isSelectedPublishedProjects.value)
}

watch(() => props.initialSearch, (newVal) => {
  searchKeyword.value = newVal
  emitSearch(newVal)
})

</script>

<style scoped lang="scss">
#searchInput {
  padding-inline-start: 2rem;
}
</style>
