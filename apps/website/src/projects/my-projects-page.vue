<template>
  <landing-navbar />
  <div
    v-infinite-scroll="loadMoreProject"
    :infinite-scroll-distance="40"
    :infinite-scroll-disabled="isLoading || hasFetchedAll"
  >
    <section class="pt-8 bg-white dark:bg-pitch mx-8">
      <div class="py-8 mx-auto max-w-screen-xl">
        <div class="mt-6 flex flex-row justify-between">
          <div class="flex flex-row items-center">
            <h2 class="text-gray-900 dark:text-insight">
              My Projects
            </h2>
            <router-link
              :to="{ name: ROUTE_NAMES.createProject }"
              class=" flex-row ml-6"
            >
              <button class="btn btn-primary">
                Create a new project +
              </button>
            </router-link>
          </div>
          <div>
            <div
              class="w-80"
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
                  id="projectSearchInput"
                  v-model="projectSearchValue"
                  name="search"
                  type="text"
                  class="search-input text-insight shadow-lg shadow-frequency/10"
                  placeholder="Search projects by name"
                  @input="searchProjectInputChanged"
                  @focus="isSearchBoxFocused = true"
                  @blur="isSearchBoxFocused = false"
                >
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            v-if="(isLoading && projects.length === 0) || showLoading"
            class="fixed inset-0 flex flex-col justify-center items-center"
          >
            <icon-custom-ic-loading class="w-10 h-10" />
          </div>
        </div>
        <div
          v-if="projects.length !== 0 && !showLoading"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 py-8 lg:gap-6 lg:py-16 lg:grid-cols-3"
        >
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            @on-click-project="onProjectClicked"
          />
        </div>
        <div class="mx-auto max-w-screen-md text-center">
          <div
            v-if="hasFailed && projects.length === 0"
            class="mt-40 lg:mt-60"
          >
            <h3 class="mb-8 text-xl text-gray-900 dark:text-insight font-header">
              It seems the project didn’t load as expected. <br> Please
              <span
                class="text-frequency cursor-pointer"
                @click="fetchProjects(0, LIMIT, undefined)"
              >
                refresh
              </span>
              your browser to give it another go.
            </h3>
          </div>
        </div>
        <div class="mx-auto max-w-screen-md text-center mt-35 xl:mt-45">
          <div v-if="projects.length === 0 && (projectSearchValue !== '' && projectSearchValue !== undefined) && !hasFailed && !isLoading">
            <h5 class="text-lg font-header">
              No Results Found.
            </h5>
            Your search did not return any matches. <br>
            Please double-check the spelling, or consider using alternative keywords.
          </div>
          <div v-if="projects.length === 0 && !isLoading && !hasFailed && (projectSearchValue === '' || projectSearchValue === undefined)">
            <h2 class="mb-8 text-gray-900 dark:text-insight font-header">
              Welcome to My Projects
            </h2>
            <h5 class="text-lg">
              This space keeps all your projects organized into one place.
            </h5>
            <h5 class="text-lg mb-8">
              Create a project and it will show up here.
            </h5>
            <router-link
              :to="{ name: ROUTE_NAMES.createProject }"
            >
              <a class="btn btn-primary">
                Create a new project +
              </a>
            </router-link>
            <h6 class="mt-8 text-base">
              Not sure where to start? Check out our <a
                href="https://help.arbimon.org/"
                class="text-frequency"
              >help & support documents</a>.
            </h6>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { type AxiosInstance } from 'axios'
import debounce from 'lodash.debounce'
import { inject, onMounted, ref, watch } from 'vue'

import { type LocationProjectWithInfo, apiBioGetMyProjects } from '@rfcx-bio/common/api-bio/project/projects'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import ProjectCard from './components/project-card.vue'

const store = useStore()

const apiClientBio = inject(apiClientKey) as AxiosInstance
const projects = ref<LocationProjectWithInfo[]>([])
const hasFetchedAll = ref(false)
const LIMIT = 20
const isLoading = ref(false)
const showLoading = ref(false)
const hasFailed = ref(false)

const projectSearchValue = ref(undefined)
const isSearchBoxFocused = ref(false)

onMounted(() => {
  fetchProjects(0, LIMIT, undefined)
  projects.value = store.myProjects
})

const searchProjectInputChanged = debounce(async () => {
  if (projectSearchValue.value === '') {
    return
  }
  const myProjectResponse = await apiBioGetMyProjects(apiClientBio, LIMIT, 0, projectSearchValue.value)
  if (myProjectResponse?.data === undefined) return
  projects.value = myProjectResponse?.data
  hasFetchedAll.value = false
}, 500)

watch(() => projectSearchValue.value, () => {
  if (projectSearchValue.value === '') {
    projects.value = store.myProjects
  }
})

const loadMoreProject = async (): Promise<void> => {
  if (hasFetchedAll.value || isLoading.value || hasFailed.value) return
  fetchProjects(projects.value.length, LIMIT, projectSearchValue.value === '' ? undefined : projectSearchValue.value)
}

const fetchProjects = async (offset:number, limit: number, keyword: string | undefined): Promise<void> => {
  isLoading.value = true
  hasFailed.value = false

  try {
    const myProjectResponse = await apiBioGetMyProjects(apiClientBio, limit, offset, keyword)
    isLoading.value = false
    if (myProjectResponse === undefined) {
      hasFailed.value = true
      return
    }
    hasFetchedAll.value = myProjectResponse.total < myProjectResponse.limit // check if reaching the end
    if (keyword !== undefined) {
      myProjectResponse?.data.forEach(p => {
        projects.value.push(p)
      })
    } else {
      store.updateMyProject(myProjectResponse?.data)
    }
  } catch (e) {
    isLoading.value = false
    hasFailed.value = true
  }
}

const onProjectClicked = (value: boolean) => {
  showLoading.value = value
}

</script>

<style scoped lang="scss">
#projectSearchInput {
  padding-inline-start: 2rem;
}
</style>
