<template>
  <landing-navbar />
  <div
    v-infinite-scroll="loadMoreProject"
    :infinite-scroll-distance="40"
  >
    <section class="pt-8 bg-white dark:bg-pitch">
      <div class="py-8 mx-auto max-w-screen-xl <lg:mx-8">
        <div class="mt-6 flex flex-row">
          <h2 class="text-gray-900 dark:text-insight">
            My Projects
          </h2>
          <router-link
            :to="{ name: ROUTE_NAMES.createProject }"
            class=" flex-row ml-6"
          >
            <a class="btn btn-primary">
              Create a new project +
            </a>
          </router-link>
        </div>
        <div class="py-10">
          <h4 v-if="isLoading && projects.length === 0">
            Loading...
          </h4>
        </div>
        <div
          class="grid grid-cols-2 gap-4 py-8 lg:gap-6 lg:py-16 lg:grid-cols-3"
        >
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
          />
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

const loadMoreProject = async (): Promise<void> => {
  if (hasFetchedAll.value || isLoading.value) return
  fetchProjects(projects.value.length, LIMIT)
}

const fetchProjects = async (offset:number, limit: number): Promise<void> => {
  isLoading.value = true
  const myProjectResponse = await apiBioGetMyProjects(apiClientBio, limit, offset)
  isLoading.value = false
  if (myProjectResponse === undefined) return
  hasFetchedAll.value = myProjectResponse.total < myProjectResponse.limit // check if reaching the end
  store.updateMyProject(myProjectResponse?.data)
}
</script>
