<template>
  <landing-navbar />
  <div
    v-infinite-scroll="loadMore"
    :infinite-scroll-distance="40"
  >
    <section class="pt-8 bg-white dark:bg-pitch">
      <div class="py-8 mx-auto max-w-screen-xl <lg:mx-8">
        <div class="mt-6 flex flex-row items-center">
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
        <div
          class="grid grid-cols-2 gap-4 py-8 lg:gap-6 lg:py-16 lg:grid-cols-3"
        >
          <ProjectCard
            v-for="project in myProjectsInfo"
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
import { type Ref, computed, inject, onMounted, ref } from 'vue'

import { apiBioGetMyProjects } from '@rfcx-bio/common/api-bio/project/projects'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'
import { useStore } from '~/store'
import ProjectCard from './components/project-card.vue'

onMounted(() => {
  refreshProjects()
})

const store = useStore()

const loadMore = () => {
  loadMoreProject()
}
const loading: Ref<boolean> = ref(true)
const apiClientBio = inject(apiClientKey) as AxiosInstance
const myProjectsInfo = computed(() => store.myProjects)
const LIMIT = 20

const loadMoreProject = async (): Promise<void> => {
  // Should show loading?
  try {
    loading.value = true
    const projects = await apiBioGetMyProjects(apiClientBio, LIMIT, myProjectsInfo.value.length)
    store.updateMyProject(projects?.data)
  } catch (e) {
    loading.value = false
  }
}

async function refreshProjects () {
  try {
    await store.refreshProjects()
  } catch (e) {
    if (e instanceof Error) console.error(e.message)
  }
}
</script>
