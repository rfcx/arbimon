<template>
  <landing-navbar />
  <div
    v-infinite-scroll="loadMoreProject"
    :infinite-scroll-distance="40"
    :infinite-scroll-disabled="isLoading || hasFetchedAll"
  >
    <section class="pt-8 bg-white dark:bg-pitch mx-8">
      <div class="py-8 mx-auto max-w-screen-xl">
        <div class="mt-6 flex flex-row items-center">
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
              Content not available.
              <span
                class="text-frequency cursor-pointer"
                @click="fetchProjects(0, LIMIT)"
              >
                Try again.
              </span>
            </h3>
          </div>
        </div>
        <div class="mx-auto max-w-screen-md text-center mt-35 xl:mt-45">
          <div v-if="projects.length === 0 && !isLoading && !hasFailed">
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
import { computed, inject, onMounted, ref } from 'vue'

import { apiBioGetMyProjects } from '@rfcx-bio/common/api-bio/project/projects'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import ProjectCard from './components/project-card.vue'

onMounted(() => {
  fetchProjects(0, LIMIT)
})

const store = useStore()

const apiClientBio = inject(apiClientKey) as AxiosInstance
const projects = computed(() => store.myProjects)
const hasFetchedAll = ref(false)
const LIMIT = 20
const isLoading = ref(false)
const showLoading = ref(false)
const hasFailed = ref(false)

const loadMoreProject = async (): Promise<void> => {
  if (hasFetchedAll.value || isLoading.value || hasFailed.value) return
  fetchProjects(projects.value.length, LIMIT)
}

const fetchProjects = async (offset:number, limit: number): Promise<void> => {
  isLoading.value = true
  hasFailed.value = false

  try {
    const myProjectResponse = await apiBioGetMyProjects(apiClientBio, limit, offset)
    isLoading.value = false
    if (myProjectResponse === undefined) {
      hasFailed.value = true
      return
    }
    hasFetchedAll.value = myProjectResponse.total < myProjectResponse.limit // check if reaching the end
    store.updateMyProject(myProjectResponse?.data)
  } catch (e) {
    isLoading.value = false
    hasFailed.value = true
  }
}

const onProjectClicked = (value: boolean) => {
  showLoading.value = value
}

</script>
